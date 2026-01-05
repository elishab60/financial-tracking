"use server"

import { createClient } from "@/lib/supabase/server"
import { Asset, AssetType, AssetPurchase } from "@/types"
import { revalidatePath } from "next/cache"
import { PriceService } from "@/lib/price-service"

export async function getAssets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Fetch assets directly
    const { data: assets, error } = await supabase
        .from("assets")
        .select('*')
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) throw error

    // Enhance assets with real-time prices and P&L calculations
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

        // Use 'buy_price' from DB
        const buyPrice = asset.buy_price || 0
        const totalInvested = buyPrice * asset.quantity

        // Calculate P&L
        let pnlValue: number | undefined
        let pnlPercent: number | undefined

        // Avoid division by zero
        if (totalInvested > 0) {
            pnlValue = marketValue - totalInvested
            pnlPercent = (pnlValue / totalInvested) * 100
        }

        return {
            ...asset,
            current_value: marketValue,
            current_price: currentPrice,
            market_value: marketValue,
            buy_price: buyPrice > 0 ? buyPrice : undefined, // Return as buy_price
            total_invested: totalInvested > 0 ? totalInvested : undefined,
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

    // Trim object to remove undefined notes if not in schema (notes column does not exist)
    // Construct payload matching DB schema
    const dbPayload: any = {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        symbol: formData.symbol,
        quantity: Number(formData.quantity),
        manual_value: formData.manual_value ? Number(formData.manual_value) : null,
        currency: formData.currency,
        valuation_mode: formData.valuation_mode,
        buy_price: formData.buy_price ? Number(formData.buy_price) : null,
        buy_date: formData.buy_date || null,
        fees: formData.fees ? Number(formData.fees) : 0,
        notes: formData.notes || null
    }

    // Insert asset
    const { data: asset, error } = await supabase.from("assets").insert(dbPayload).select().single()

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
    console.log(`[UPDATE DEBUG] Function called for ID: ${id}`)
    console.log(`[UPDATE DEBUG] Incoming FormData:`, JSON.stringify(formData, null, 2))

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.error(`[UPDATE DEBUG] No user found`)
        throw new Error("Unauthorized")
    }
    console.log(`[UPDATE DEBUG] User authenticated: ${user.id}`)

    // Validation
    if (formData.quantity != null && formData.quantity < 0) throw new Error("Quantity must be positive")
    if (formData.buy_price != null && formData.buy_price < 0) throw new Error("Buy price must be positive")
    if (formData.fees != null && formData.fees < 0) throw new Error("Fees must be positive or zero")

    // STRICT WHITELISTING & TYPE COERCION
    const updateData: any = {}

    // Direct mappings
    if (formData.name !== undefined) updateData.name = formData.name
    if (formData.type !== undefined) updateData.type = formData.type
    if (formData.symbol !== undefined) updateData.symbol = formData.symbol || null
    if (formData.quantity !== undefined) updateData.quantity = Number(formData.quantity)
    if (formData.manual_value !== undefined) updateData.manual_value = Number(formData.manual_value)
    if (formData.currency !== undefined) updateData.currency = formData.currency
    if (formData.valuation_mode !== undefined) updateData.valuation_mode = formData.valuation_mode

    // Updated mappings for actual DB columns
    if (formData.buy_price !== undefined) {
        updateData.buy_price = (formData.buy_price === '' || formData.buy_price === null) ? null : Number(formData.buy_price)
    }
    if (formData.buy_date !== undefined) updateData.buy_date = formData.buy_date || null
    if (formData.fees !== undefined) updateData.fees = Number(formData.fees)
    if (formData.notes !== undefined) updateData.notes = formData.notes

    console.log(`[UPDATE DEBUG] Final Payload to Supabase:`, JSON.stringify(updateData, null, 2))

    const { error } = await supabase
        .from("assets")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error(`[UPDATE DEBUG] Supabase Error:`, JSON.stringify(error, null, 2))
        // Wrap Supabase error in standard Error to ensure clean client-side handling
        throw new Error(error.message || "Database update failed")
    }

    console.log(`[UPDATE DEBUG] Success!`)

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

