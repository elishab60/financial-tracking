"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { AssetSale } from "@/types"
import { calculatePRU } from "./purchases"

export async function getSales(assetId: string): Promise<AssetSale[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    const { data: sales, error } = await supabase
        .from("asset_sales")
        .select("*")
        .eq("asset_id", assetId)
        .eq("user_id", user.id)
        .order("sale_date", { ascending: false })

    if (error) throw new Error(error.message)

    // Add computed total_proceeds
    return (sales || []).map(s => ({
        ...s,
        total_proceeds: (s.quantity * s.unit_price) - (s.fees || 0)
    }))
}

export async function addSale(assetId: string, formData: {
    quantity: number
    unit_price: number
    fees?: number
    sale_date?: string
    notes?: string
    add_to_cash?: boolean // Whether to add proceeds to account cash balance
}): Promise<AssetSale> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // Validate inputs
    if (!formData.quantity || formData.quantity <= 0) {
        throw new Error("La quantité doit être supérieure à 0")
    }
    if (!formData.unit_price || formData.unit_price <= 0) {
        throw new Error("Le prix unitaire doit être supérieur à 0")
    }
    if (formData.fees != null && formData.fees < 0) {
        throw new Error("Les frais ne peuvent pas être négatifs")
    }

    // Verify asset belongs to user and has enough quantity
    const { data: asset, error: assetError } = await supabase
        .from("assets")
        .select("id, quantity, investment_account_id")
        .eq("id", assetId)
        .eq("user_id", user.id)
        .single()

    if (assetError || !asset) throw new Error("Actif non trouvé")

    if ((asset.quantity || 0) < formData.quantity) {
        throw new Error(`Quantité insuffisante. Vous possédez ${asset.quantity} unités.`)
    }

    // Calculate PRU to determine realized P&L
    const pruData = await calculatePRU(assetId)
    const proceeds = (formData.quantity * formData.unit_price) - (formData.fees || 0)
    const costBasis = formData.quantity * pruData.pru
    const realizedPnl = proceeds - costBasis

    // Insert sale
    const { data: sale, error } = await supabase
        .from("asset_sales")
        .insert({
            asset_id: assetId,
            user_id: user.id,
            quantity: formData.quantity,
            unit_price: formData.unit_price,
            fees: formData.fees || 0,
            sale_date: formData.sale_date || null,
            notes: formData.notes || null,
            realized_pnl: realizedPnl
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    // Update asset's total quantity
    const newQuantity = Math.max(0, (asset.quantity || 0) - formData.quantity)
    await supabase
        .from("assets")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", assetId)

    // If add_to_cash is true and asset is in an investment account, update cash balance
    if (formData.add_to_cash && asset.investment_account_id) {
        const { data: account } = await supabase
            .from("investment_accounts")
            .select("cash_balance")
            .eq("id", asset.investment_account_id)
            .single()

        if (account) {
            const newCashBalance = (account.cash_balance || 0) + proceeds
            await supabase
                .from("investment_accounts")
                .update({ cash_balance: newCashBalance, updated_at: new Date().toISOString() })
                .eq("id", asset.investment_account_id)
        }
    }

    revalidatePath("/assets")
    revalidatePath("/dashboard")

    return {
        ...sale,
        total_proceeds: proceeds
    }
}

export async function deleteSale(saleId: string): Promise<void> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // Get sale to know asset and quantity
    const { data: sale, error: fetchError } = await supabase
        .from("asset_sales")
        .select("*, assets(id, quantity, investment_account_id)")
        .eq("id", saleId)
        .eq("user_id", user.id)
        .single()

    if (fetchError || !sale) throw new Error("Vente non trouvée")

    // Delete sale
    const { error } = await supabase
        .from("asset_sales")
        .delete()
        .eq("id", saleId)
        .eq("user_id", user.id)

    if (error) throw new Error(error.message)

    // Restore asset's quantity
    const asset = sale.assets as any
    if (asset) {
        const newQuantity = (asset.quantity || 0) + sale.quantity
        await supabase
            .from("assets")
            .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
            .eq("id", asset.id)

        // Also subtract from cash balance if applicable
        if (asset.investment_account_id) {
            const proceeds = (sale.quantity * sale.unit_price) - (sale.fees || 0)
            const { data: account } = await supabase
                .from("investment_accounts")
                .select("cash_balance")
                .eq("id", asset.investment_account_id)
                .single()

            if (account && (account.cash_balance || 0) >= proceeds) {
                const newCashBalance = (account.cash_balance || 0) - proceeds
                await supabase
                    .from("investment_accounts")
                    .update({ cash_balance: newCashBalance, updated_at: new Date().toISOString() })
                    .eq("id", asset.investment_account_id)
            }
        }
    }

    revalidatePath("/assets")
    revalidatePath("/dashboard")
}

export async function updateSale(saleId: string, formData: Partial<{
    quantity: number
    unit_price: number
    fees: number
    sale_date: string
    notes: string
}>): Promise<AssetSale> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // Get current sale
    const { data: currentSale, error: fetchError } = await supabase
        .from("asset_sales")
        .select("*, assets(id, quantity)")
        .eq("id", saleId)
        .eq("user_id", user.id)
        .single()

    if (fetchError || !currentSale) throw new Error("Vente non trouvée")

    // Validate
    if (formData.quantity != null && formData.quantity <= 0) {
        throw new Error("La quantité doit être supérieure à 0")
    }
    if (formData.unit_price != null && formData.unit_price <= 0) {
        throw new Error("Le prix unitaire doit être supérieur à 0")
    }

    // Recalculate realized P&L if price or quantity changed
    let updateData: Record<string, any> = { ...formData }

    if (formData.quantity != null || formData.unit_price != null || formData.fees != null) {
        const quantity = formData.quantity ?? currentSale.quantity
        const unitPrice = formData.unit_price ?? currentSale.unit_price
        const fees = formData.fees ?? currentSale.fees

        const pruData = await calculatePRU(currentSale.asset_id)
        const proceeds = (quantity * unitPrice) - fees
        const costBasis = quantity * pruData.pru
        updateData.realized_pnl = proceeds - costBasis
    }

    // Update sale
    const { data: updated, error } = await supabase
        .from("asset_sales")
        .update(updateData)
        .eq("id", saleId)
        .eq("user_id", user.id)
        .select()
        .single()

    if (error) throw new Error(error.message)

    // If quantity changed, update asset's total quantity
    if (formData.quantity != null && formData.quantity !== currentSale.quantity) {
        const asset = currentSale.assets as any
        if (asset) {
            const quantityDiff = currentSale.quantity - formData.quantity // positive = restoring, negative = selling more
            const newQuantity = Math.max(0, (asset.quantity || 0) + quantityDiff)
            await supabase
                .from("assets")
                .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
                .eq("id", asset.id)
        }
    }

    revalidatePath("/assets")
    revalidatePath("/dashboard")

    return {
        ...updated,
        total_proceeds: (updated.quantity * updated.unit_price) - (updated.fees || 0)
    }
}

// Get total realized P&L for an asset from all sales
export async function getTotalRealizedPnl(assetId: string): Promise<number> {
    const sales = await getSales(assetId)
    return sales.reduce((sum, sale) => sum + (sale.realized_pnl || 0), 0)
}
