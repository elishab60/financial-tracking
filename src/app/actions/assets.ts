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

    // Enhance assets with real-time prices if mode is auto
    const enhancedAssets = await Promise.all((assets as Asset[]).map(async (asset) => {
        if (asset.valuation_mode === "auto" && asset.symbol) {
            const price = await PriceService.getPrice(asset.symbol, asset.currency)
            return {
                ...asset,
                current_value: price * asset.quantity
            }
        }
        return {
            ...asset,
            current_value: asset.manual_value || 0
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
    currency: string
    valuation_mode: 'manual' | 'auto'
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

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
    currency: string
    valuation_mode: 'manual' | 'auto'
}>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

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
