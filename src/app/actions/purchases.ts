"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { AssetPurchase } from "@/types"

export async function getPurchases(assetId: string): Promise<AssetPurchase[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    const { data: purchases, error } = await supabase
        .from("asset_purchases")
        .select("*")
        .eq("asset_id", assetId)
        .eq("user_id", user.id)
        .order("purchase_date", { ascending: false })

    if (error) throw new Error(error.message)

    // Add computed total_cost
    return (purchases || []).map(p => ({
        ...p,
        total_cost: (p.quantity * p.unit_price) + (p.fees || 0)
    }))
}

export async function addPurchase(assetId: string, formData: {
    quantity: number
    unit_price: number
    fees?: number
    purchase_date?: string
    notes?: string
}): Promise<AssetPurchase> {
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

    // Verify asset belongs to user
    const { data: asset, error: assetError } = await supabase
        .from("assets")
        .select("id, quantity")
        .eq("id", assetId)
        .eq("user_id", user.id)
        .single()

    if (assetError || !asset) throw new Error("Actif non trouvé")

    // Insert purchase
    const { data: purchase, error } = await supabase
        .from("asset_purchases")
        .insert({
            asset_id: assetId,
            user_id: user.id,
            quantity: formData.quantity,
            unit_price: formData.unit_price,
            fees: formData.fees || 0,
            purchase_date: formData.purchase_date || null,
            notes: formData.notes || null
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    // Update asset's total quantity
    const newQuantity = (asset.quantity || 0) + formData.quantity
    await supabase
        .from("assets")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", assetId)

    revalidatePath("/assets")
    revalidatePath("/dashboard")

    return {
        ...purchase,
        total_cost: (purchase.quantity * purchase.unit_price) + (purchase.fees || 0)
    }
}

export async function deletePurchase(purchaseId: string): Promise<void> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // Get purchase to know asset and quantity
    const { data: purchase, error: fetchError } = await supabase
        .from("asset_purchases")
        .select("*, assets(id, quantity)")
        .eq("id", purchaseId)
        .eq("user_id", user.id)
        .single()

    if (fetchError || !purchase) throw new Error("Achat non trouvé")

    // Delete purchase
    const { error } = await supabase
        .from("asset_purchases")
        .delete()
        .eq("id", purchaseId)
        .eq("user_id", user.id)

    if (error) throw new Error(error.message)

    // Update asset's total quantity
    const asset = purchase.assets as any
    if (asset) {
        const newQuantity = Math.max(0, (asset.quantity || 0) - purchase.quantity)
        await supabase
            .from("assets")
            .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
            .eq("id", asset.id)
    }

    revalidatePath("/assets")
    revalidatePath("/dashboard")
}

export async function updatePurchase(purchaseId: string, formData: Partial<{
    quantity: number
    unit_price: number
    fees: number
    purchase_date: string
    notes: string
}>): Promise<AssetPurchase> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Non authentifié")

    // Get current purchase for quantity diff
    const { data: currentPurchase, error: fetchError } = await supabase
        .from("asset_purchases")
        .select("*, assets(id, quantity)")
        .eq("id", purchaseId)
        .eq("user_id", user.id)
        .single()

    if (fetchError || !currentPurchase) throw new Error("Achat non trouvé")

    // Validate
    if (formData.quantity != null && formData.quantity <= 0) {
        throw new Error("La quantité doit être supérieure à 0")
    }
    if (formData.unit_price != null && formData.unit_price <= 0) {
        throw new Error("Le prix unitaire doit être supérieur à 0")
    }

    // Update purchase
    const { data: updated, error } = await supabase
        .from("asset_purchases")
        .update(formData)
        .eq("id", purchaseId)
        .eq("user_id", user.id)
        .select()
        .single()

    if (error) throw new Error(error.message)

    // If quantity changed, update asset's total quantity
    if (formData.quantity != null && formData.quantity !== currentPurchase.quantity) {
        const asset = currentPurchase.assets as any
        if (asset) {
            const quantityDiff = formData.quantity - currentPurchase.quantity
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
        total_cost: (updated.quantity * updated.unit_price) + (updated.fees || 0)
    }
}

// Helper function to calculate PRU for an asset
export async function calculatePRU(assetId: string): Promise<{ pru: number, totalInvested: number, totalQuantity: number }> {
    const purchases = await getPurchases(assetId)

    if (purchases.length === 0) {
        return { pru: 0, totalInvested: 0, totalQuantity: 0 }
    }

    let totalInvested = 0
    let totalQuantity = 0

    for (const p of purchases) {
        totalQuantity += p.quantity
        totalInvested += (p.quantity * p.unit_price) + (p.fees || 0)
    }

    const pru = totalQuantity > 0 ? totalInvested / totalQuantity : 0

    return { pru, totalInvested, totalQuantity }
}
