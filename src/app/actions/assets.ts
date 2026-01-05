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
        .select('*, asset_purchases(*)')
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) throw error

    // Enhance assets with real-time prices and P&L calculations
    const enhancedAssets = await Promise.all((assets || []).map(async (asset: any) => {
        // Calculate PRU and totals from purchases first
        const purchases: AssetPurchase[] = asset.asset_purchases || []
        let totalInvested = 0
        let totalQuantityFromPurchases = 0

        for (const p of purchases) {
            const q = Number(p.quantity)
            const price = Number(p.unit_price)
            const fees = Number(p.fees || 0)

            totalQuantityFromPurchases += q
            totalInvested += (q * price) + fees
        }

        // Check for missing legacy quantity (Hybrid mode for old assets)
        // If current asset quantity is greater than sum of purchases, assume the difference is from legacy initial buy
        const currentAssetQty = Number(asset.quantity || 0)
        if (currentAssetQty > totalQuantityFromPurchases && asset.buy_price != null) {
            const diff = currentAssetQty - totalQuantityFromPurchases
            const legacyPrice = Number(asset.buy_price)
            const legacyFees = Number(asset.fees || 0) // We can't easily split fees, but if we assume discrepancy is initial... 
            // Actually, legacy fees might be total fees? Let's just use price * quantity.
            // Be careful not to double count fees if they are already in the array?
            // If purchase array is empty, fees are legacy. If mixed, fees might be messy.
            // Simplest: Add (diff * price). For fees, only add if totalQuantityFromPurchases was 0 (pure fallback)?
            // Better: Add proportionate fees? Or just ignore legacy fees in hybrid?
            // Let's stick to price.

            totalInvested += (diff * legacyPrice)
            // Note: We don't verify legacy fees distribution, assuming new system handles fees better.
            totalQuantityFromPurchases += diff
        }

        // Pure Fallback (if somehow logic above failed or explicit legacy handling needed)
        if (purchases.length === 0 && asset.buy_price != null && asset.quantity > 0 && totalInvested === 0) {
            totalInvested = (asset.quantity * asset.buy_price) + (asset.fees || 0)
            totalQuantityFromPurchases = asset.quantity
        }

        const pru = totalQuantityFromPurchases > 0 ? totalInvested / totalQuantityFromPurchases : undefined
        const costBasis = totalInvested > 0 ? totalInvested : undefined

        // Calculate Market Value based on BEST AVAILABLE quantity info
        // If we have purchases, use their total quantity to ensure consistency (P&L = Market Value - Cost Basis)
        // Otherwise use asset.quantity from DB
        const effectiveQuantity = purchases.length > 0 ? totalQuantityFromPurchases : asset.quantity

        let currentPrice = 0
        let marketValue = 0

        if (asset.valuation_mode === "auto" && asset.symbol) {
            currentPrice = await PriceService.getPrice(asset.symbol, asset.currency)
            marketValue = currentPrice * effectiveQuantity
        } else {
            // Manual mode: use manual value directly
            marketValue = asset.manual_value || 0
            currentPrice = effectiveQuantity > 0 ? marketValue / effectiveQuantity : 0
        }

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
            buy_price: asset.buy_price,
            total_invested: totalInvested > 0 ? totalInvested : undefined,
            pru: pru,
            pnl_value: pnlValue,
            pnl_percent: pnlPercent,
            cost_basis: totalInvested > 0 ? totalInvested : undefined,
            purchases: asset.asset_purchases || [],
            last_purchase_date: purchases.length > 0
                ? purchases.reduce((latest, p) => (new Date(p.purchase_date || 0) > new Date(latest.purchase_date || 0) ? p : latest)).purchase_date
                : asset.buy_date,
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

    // Create initial purchase if quantity is positive (even if price is 0)
    // This ensures "Every add" is recorded in the purchase history for the unified view
    if (formData.quantity > 0) {
        const { error: purchaseError } = await supabase.from("asset_purchases").insert({
            asset_id: asset.id,
            user_id: user.id,
            quantity: formData.quantity,
            unit_price: (formData.buy_price != null && formData.buy_price > 0) ? Number(formData.buy_price) : 0,
            fees: formData.fees ? Number(formData.fees) : 0,
            purchase_date: formData.buy_date || new Date().toISOString(), // Default to now if not provided
            notes: formData.notes || "Création initiale"
        })
        if (purchaseError) {
            console.error("Failed to create initial purchase:", purchaseError)
            throw new Error(`Erreur lors de la création de l'historique: ${purchaseError.message}`)
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
    buy_price: number | string // Allow string for flexible checking
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
        // Handle empty string or null
        const val = formData.buy_price
        updateData.buy_price = (val === '' || val === null) ? null : Number(val)
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

