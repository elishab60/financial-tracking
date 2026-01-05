"use server"

import { createClient } from "@/lib/supabase/server"
import { Asset, AssetType } from "@/types"
import { revalidatePath } from "next/cache"
import { PriceService } from "@/lib/price-service"

export async function getAssets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { data: assets, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) throw error

    // Enhance assets with real-time prices and performance calculations
    const enhancedAssets = await Promise.all((assets as Asset[]).map(async (asset) => {
        let currentPrice = 0
        let marketValue = 0

        if (asset.valuation_mode === "auto" && asset.symbol) {
            currentPrice = await PriceService.getPrice(asset.symbol, asset.currency)
            marketValue = currentPrice * asset.quantity
        } else {
            marketValue = asset.manual_value || 0
            currentPrice = asset.quantity > 0 ? marketValue / asset.quantity : 0
        }

        // Calculate cost basis and P&L if buy_price is set
        let costBasis: number | undefined
        let pnlValue: number | undefined
        let pnlPercent: number | undefined

        if (asset.buy_price != null && asset.quantity > 0) {
            costBasis = (asset.quantity * asset.buy_price) + (asset.fees || 0)
            pnlValue = marketValue - costBasis
            pnlPercent = costBasis > 0 ? (pnlValue / costBasis) * 100 : 0
        }

        return {
            ...asset,
            current_value: marketValue,
            current_price: currentPrice,
            market_value: marketValue,
            cost_basis: costBasis,
            pnl_value: pnlValue,
            pnl_percent: pnlPercent,
        }
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

    const { error } = await supabase.from("assets").insert({
        ...formData,
        user_id: user.id,
    })

    if (error) throw error

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

