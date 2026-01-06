"use server"

import { createClient } from "@/lib/supabase/server"
import { BudgetCategory, BudgetIncome, Transaction } from "@/types"
import { revalidatePath } from "next/cache"

export async function getBudgetData(month?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Fetch categories
    const { data: categories, error: catError } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name")

    if (catError) throw catError

    // Fetch income
    const { data: incomes, error: incError } = await supabase
        .from("budget_income")
        .select("*")
        .eq("user_id", user.id)

    if (incError) throw incError

    // Fetch transactions for the current month
    // If month is provided as YYYY-MM
    let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_income", false)

    if (month) {
        const startOfMonth = `${month}-01T00:00:00Z`
        const date = new Date(month + "-01")
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
        query = query.gte("date", startOfMonth).lte("date", endOfMonth)
    }

    const { data: transactions, error: txError } = await query

    if (txError) throw txError

    return {
        categories: (categories || []) as BudgetCategory[],
        incomes: (incomes || []) as BudgetIncome[],
        transactions: (transactions || []) as Transaction[]
    }
}

export async function addBudgetCategory(data: { name: string, target_amount: number, icon?: string, color?: string, type?: 'expense' | 'investment', group_name?: string }) {
    try {
        console.log("[addBudgetCategory] Data received:", JSON.stringify(data))
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const payload = {
            name: data.name || "Nouveau",
            target_amount: data.target_amount || 0,
            type: data.type || 'expense',
            group_name: data.group_name || null,
            color: data.color || '#6366f1',
            user_id: user.id
        }

        console.log("[addBudgetCategory] Payload for DB:", JSON.stringify(payload))
        const { data: insertedData, error } = await supabase
            .from("budget_categories")
            .insert(payload)
            .select()

        if (error) {
            console.error("[addBudgetCategory] Supabase Error:", error)
            return { success: false, error: error.message, code: error.code }
        }

        revalidatePath("/budget")
        return { success: true, data: insertedData }
    } catch (err: any) {
        console.error("[addBudgetCategory] Global Catch:", err)
        return { success: false, error: err.message }
    }
}

export async function updateBudgetCategory(id: string, data: Partial<BudgetCategory>) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const { error } = await supabase
            .from("budget_categories")
            .update(data)
            .eq("id", id)
            .eq("user_id", user.id)

        if (error) return { success: false, error: error.message }
        revalidatePath("/budget")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function deleteBudgetCategory(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const { error } = await supabase
            .from("budget_categories")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)

        if (error) return { success: false, error: error.message }
        revalidatePath("/budget")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function addBudgetIncome(data: { name: string, amount: number, is_recurring: boolean }) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const { data: insertedData, error } = await supabase
            .from("budget_income")
            .insert({ ...data, user_id: user.id })
            .select()

        if (error) return { success: false, error: error.message }
        revalidatePath("/budget")
        return { success: true, data: insertedData }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function updateBudgetIncome(id: string, data: Partial<BudgetIncome>) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const { error } = await supabase
            .from("budget_income")
            .update(data)
            .eq("id", id)
            .eq("user_id", user.id)

        if (error) return { success: false, error: error.message }
        revalidatePath("/budget")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function deleteBudgetIncome(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const { error } = await supabase
            .from("budget_income")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)

        if (error) return { success: false, error: error.message }
        revalidatePath("/budget")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function renameBudgetGroup(oldName: string, newName: string, type: 'expense' | 'investment') {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        let query = supabase
            .from("budget_categories")
            .update({ group_name: newName })
            .eq("user_id", user.id)
            .eq("type", type)

        if (oldName === "Autres" || oldName === "Investissements") {
            const { error } = await supabase
                .from("budget_categories")
                .update({ group_name: newName })
                .eq("user_id", user.id)
                .eq("type", type)
                .or(`group_name.eq.${oldName},group_name.is.null`)
            if (error) return { success: false, error: error.message }
        } else {
            const { error } = await query.eq("group_name", oldName)
            if (error) return { success: false, error: error.message }
        }

        revalidatePath("/budget")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function deleteBudgetGroup(groupName: string, type: 'expense' | 'investment') {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        let query = supabase
            .from("budget_categories")
            .delete()
            .eq("user_id", user.id)
            .eq("type", type)

        // Handle the case where groupName is our frontend fallback for NULL records
        if (groupName === "Autres" || groupName === "Investissements") {
            // This is tricky with Supabase single query. 
            // We'll try to delete both the string match AND literal NULLs
            const { error } = await supabase
                .from("budget_categories")
                .delete()
                .eq("user_id", user.id)
                .eq("type", type)
                .or(`group_name.eq.${groupName},group_name.is.null`)

            if (error) return { success: false, error: error.message }
        } else {
            const { error } = await query.eq("group_name", groupName)
            if (error) return { success: false, error: error.message }
        }

        revalidatePath("/budget")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function addTransaction(data: Partial<Transaction>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from("transactions")
        .insert({
            ...data,
            user_id: user.id,
            source: 'manual',
            date: data.date || new Date().toISOString()
        })

    if (error) throw error
    revalidatePath("/budget")
    revalidatePath("/transactions")
    revalidatePath("/dashboard")
}
