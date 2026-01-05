"use server"

import { createClient } from "@/lib/supabase/server"
import { Asset, AssetType, AssetPurchase } from "@/types"
import { revalidatePath } from "next/cache"
import { PriceService } from "@/lib/price-service"

export async function getAssets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Fetch assets with their purchases
    const { data: assets, error } = await supabase
        .from("assets")
        .select(`
            *,
            asset_purchases (
                id, quantity, unit_price, fees, purchase_date, notes, created_at
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) throw error

    // Enhance assets with real-time prices and PRU calculations
    const enhancedAssets = await Promise.all((assets || []).map(async (asset: any) => {
        let currentPrice = 0
        let marketValue = 0

        if (asset.valuation_mode === "auto" && asset.symbol) {
            currentPrice = await PriceService.getPrice(asset.symbol, asset.currency)
            marketValue = currentPrice * asset.quantity
        } else {
            marketValue = asset.manual_value || 0
            currentPrice = asset.quantity > 0 ? marketValue / asset.quantity : 0
        }

        // Calculate PRU from purchases
        const purchases: AssetPurchase[] = asset.asset_purchases || []
        let totalInvested = 0
        let totalQuantityFromPurchases = 0

        for (const p of purchases) {
            totalQuantityFromPurchases += p.quantity
            totalInvested += (p.quantity * p.unit_price) + (p.fees || 0)
        }

        // Fallback to legacy buy_price if no purchases exist
        if (purchases.length === 0 && asset.buy_price != null && asset.quantity > 0) {
            totalInvested = (asset.quantity * asset.buy_price) + (asset.fees || 0)
            totalQuantityFromPurchases = asset.quantity
        }

        const pru = totalQuantityFromPurchases > 0 ? totalInvested / totalQuantityFromPurchases : undefined
        const costBasis = totalInvested > 0 ? totalInvested : undefined

        // Calculate P&L
        let pnlValue: number | undefined
        let pnlPercent: number | undefined

        if (costBasis != null && costBasis > 0) {
            pnlValue = marketValue - costBasis
            pnlPercent = (pnlValue / costBasis) * 100
        }

        // Remove nested purchases relation, add as flat array
        const { asset_purchases, ...assetWithoutPurchases } = asset

        return {
            ...assetWithoutPurchases,
            current_value: marketValue,
            current_price: currentPrice,
            market_value: marketValue,
            purchases: purchases.map((p: any) => ({
                ...p,
                asset_id: asset.id,
                user_id: user.id,
                total_cost: (p.quantity * p.unit_price) + (p.fees || 0)
            })),
            purchase_count: purchases.length,
            total_invested: totalInvested > 0 ? totalInvested : undefined,
            pru,
            cost_basis: costBasis,
            pnl_value: pnlValue,
            pnl_percent: pnlPercent,
        } as Asset
    }))

    return enhancedAssets
}

export async function addAsset(formData: {
    name: string
    type: AssetType
    symbol?: string
    quantity: number
    manual_value?: number
    buy_price?: number
    buy_date?: string
    fees?: number
    notes?: string
    currency: string
    valuation_mode: 'manual' | 'auto'
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Validation
    if (formData.quantity < 0) throw new Error("Quantity must be positive")
    if (formData.buy_price != null && formData.buy_price < 0) throw new Error("Buy price must be positive")
    if (formData.fees != null && formData.fees < 0) throw new Error("Fees must be positive or zero")

    // Insert asset (without buy_price, buy_date, fees - those go to purchases now)
    const { data: asset, error } = await supabase.from("assets").insert({
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        symbol: formData.symbol,
        quantity: formData.quantity,
        manual_value: formData.manual_value,
        currency: formData.currency,
        valuation_mode: formData.valuation_mode,
        notes: formData.notes,
    }).select().single()

    if (error) throw error

    // If buy_price is provided, create initial purchase record
    if (formData.buy_price != null && formData.buy_price > 0 && formData.quantity > 0) {
        const { error: purchaseError } = await supabase.from("asset_purchases").insert({
            asset_id: asset.id,
            user_id: user.id,
            quantity: formData.quantity,
            unit_price: formData.buy_price,
            fees: formData.fees || 0,
            purchase_date: formData.buy_date || null,
            notes: null,
        })

        if (purchaseError) {
            console.error("Failed to create initial purchase:", purchaseError)
            // Don't throw, asset is already created
        }
    }

    revalidatePath("/dashboard")
    revalidatePath("/assets")
}

export async function updateAsset(id: string, formData: Partial<{
    name: string
    type: AssetType
    symbol: string
    quantity: number
    manual_value: number
    buy_price: number
    buy_date: string
    fees: number
    notes: string
    currency: string
    valuation_mode: 'manual' | 'auto'
}>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Validation
    if (formData.quantity != null && formData.quantity < 0) throw new Error("Quantity must be positive")
    if (formData.buy_price != null && formData.buy_price < 0) throw new Error("Buy price must be positive")
    if (formData.fees != null && formData.fees < 0) throw new Error("Fees must be positive or zero")

    const { error } = await supabase
        .from("assets")
        .update(formData)
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) throw error

    revalidatePath("/dashboard")
    revalidatePath("/assets")
}

export async function deleteAsset(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    console.log(`[ACTION] Attempting to delete asset: ${id} for user: ${user.id}`);
    const { error, count } = await supabase
        .from("assets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error(`[ACTION] Delete error:`, error);
        throw error
    }
    console.log(`[ACTION] Delete successful, rows affected: ${count}`);

    revalidatePath("/dashboard")
    revalidatePath("/assets")
}

