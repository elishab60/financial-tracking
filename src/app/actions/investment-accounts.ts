"use server"

import { createClient } from "@/lib/supabase/server"
import { InvestmentAccount, InvestmentAccountType } from "@/types"
import { revalidatePath } from "next/cache"

export async function getInvestmentAccounts(): Promise<InvestmentAccount[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get accounts with asset counts and total values
    const { data: accounts, error: accountsError } = await supabase
        .from("investment_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (accountsError || !accounts) {
        console.error("Error fetching investment accounts:", accountsError)
        return []
    }

    // Get assets grouped by investment_account_id to calculate totals
    const { data: assets } = await supabase
        .from("assets")
        .select("id, investment_account_id, manual_value, quantity")
        .eq("user_id", user.id)
        .not("investment_account_id", "is", null)

    // Calculate totals per account
    const accountTotals: Record<string, { total_value: number; asset_count: number }> = {}

    if (assets) {
        for (const asset of assets) {
            const accountId = asset.investment_account_id
            if (!accountId) continue

            if (!accountTotals[accountId]) {
                accountTotals[accountId] = { total_value: 0, asset_count: 0 }
            }

            accountTotals[accountId].asset_count += 1
            accountTotals[accountId].total_value += Number(asset.manual_value) || 0
        }
    }

    // Merge totals with accounts
    const enrichedAccounts: InvestmentAccount[] = accounts.map(account => ({
        ...account,
        total_value: accountTotals[account.id]?.total_value ?? 0,
        asset_count: accountTotals[account.id]?.asset_count ?? 0,
    }))

    // Sort by total value (biggest first)
    enrichedAccounts.sort((a, b) => (b.total_value ?? 0) - (a.total_value ?? 0))

    return enrichedAccounts
}

export async function addInvestmentAccount(formData: {
    name: string
    account_type: InvestmentAccountType
    broker_id?: string
    broker_name?: string
    notes?: string
}): Promise<InvestmentAccount> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Non authentifié")

    const { data, error } = await supabase
        .from("investment_accounts")
        .insert({
            user_id: user.id,
            name: formData.name,
            account_type: formData.account_type,
            broker_id: formData.broker_id || null,
            broker_name: formData.broker_name || null,
            notes: formData.notes || null,
        })
        .select()
        .single()

    if (error) {
        console.error("Error adding investment account:", error)
        throw new Error("Erreur lors de la création du compte")
    }

    revalidatePath("/patrimoine")
    return data
}

export async function updateInvestmentAccount(
    id: string,
    formData: Partial<{
        name: string
        account_type: InvestmentAccountType
        broker_id: string
        broker_name: string
        notes: string
    }>
): Promise<InvestmentAccount> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Non authentifié")

    const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
    }

    if (formData.name !== undefined) updateData.name = formData.name
    if (formData.account_type !== undefined) updateData.account_type = formData.account_type
    if (formData.broker_id !== undefined) updateData.broker_id = formData.broker_id || null
    if (formData.broker_name !== undefined) updateData.broker_name = formData.broker_name || null
    if (formData.notes !== undefined) updateData.notes = formData.notes || null

    const { data, error } = await supabase
        .from("investment_accounts")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

    if (error) {
        console.error("Error updating investment account:", error)
        throw new Error("Erreur lors de la mise à jour du compte")
    }

    revalidatePath("/patrimoine")
    return data
}

export async function deleteInvestmentAccount(id: string): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Non authentifié")

    // Assets will have their investment_account_id set to NULL due to ON DELETE SET NULL
    const { error } = await supabase
        .from("investment_accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        console.error("Error deleting investment account:", error)
        throw new Error("Erreur lors de la suppression du compte")
    }

    revalidatePath("/patrimoine")
}
