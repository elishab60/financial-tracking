"use server"

import { createClient } from "@/lib/supabase/server"
import { BudgetCategory, BudgetIncome, Transaction, Budget } from "@/types"
import { revalidatePath } from "next/cache"

export async function getBudgets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at")

    if (error) throw error
    return (data || []) as Budget[]
}

export async function createBudget(name: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const { data, error } = await supabase
            .from("budgets")
            .insert({ name, user_id: user.id })
            .select()
            .single()

        if (error) return { success: false, error: error.message }

        // Seed the new budget immediately to avoid any re-fetch loops
        await supabase.from("budget_income").insert({
            name: "Salaire",
            amount: 2500,
            is_recurring: true,
            user_id: user.id,
            budget_id: data.id
        })

        await supabase.from("budget_categories").insert([
            { name: "Loyer / Crédit", group_name: "Logement", target_amount: 800, type: 'expense', color: '#f87171', user_id: user.id, budget_id: data.id },
            { name: "Courses Alimentaires", group_name: "Dépenses courantes", target_amount: 400, type: 'expense', color: '#fbbf24', user_id: user.id, budget_id: data.id },
            { name: "PEA", group_name: "Investissements", target_amount: 200, type: 'investment', color: '#8b5cf6', user_id: user.id, budget_id: data.id }
        ])

        revalidatePath("/budget")
        return { success: true, data }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function deleteBudget(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const { error } = await supabase
            .from("budgets")
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

export async function getBudgetData(month?: string, budgetId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    let targetBudgetId = budgetId

    if (!targetBudgetId) {
        const { data: budgets } = await supabase
            .from("budgets")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at")
            .limit(1)

        if (budgets && budgets.length > 0) {
            targetBudgetId = budgets[0].id
        } else {
            // Create default budget with seeding
            const { data: newBudget, error: createError } = await supabase
                .from("budgets")
                .insert({ name: "Défaut", user_id: user.id })
                .select()
                .single()

            if (createError) throw createError
            targetBudgetId = newBudget.id

            // Seed it once
            await supabase.from("budget_income").insert({
                name: "Salaire",
                amount: 2500,
                is_recurring: true,
                user_id: user.id,
                budget_id: targetBudgetId
            })

            await supabase.from("budget_categories").insert([
                { name: "Loyer / Crédit", group_name: "Logement", target_amount: 800, type: 'expense', color: '#f87171', user_id: user.id, budget_id: targetBudgetId },
                { name: "Courses Alimentaires", group_name: "Dépenses courantes", target_amount: 400, type: 'expense', color: '#fbbf24', user_id: user.id, budget_id: targetBudgetId },
                { name: "PEA", group_name: "Investissements", target_amount: 200, type: 'investment', color: '#8b5cf6', user_id: user.id, budget_id: targetBudgetId }
            ])
        }
    }

    // Fetch categories
    const { data: categories, error: catError } = await supabase
        .from("budget_categories")
        .select("*")
        .eq("user_id", user.id)
        .eq("budget_id", targetBudgetId)
        .order("name")

    if (catError) throw catError

    // Fetch income
    const { data: incomes, error: incError } = await supabase
        .from("budget_income")
        .select("*")
        .eq("user_id", user.id)
        .eq("budget_id", targetBudgetId)

    if (incError) throw incError

    // Fetch transactions
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
        budgetId: targetBudgetId as string,
        categories: (categories || []) as BudgetCategory[],
        incomes: (incomes || []) as BudgetIncome[],
        transactions: (transactions || []) as Transaction[]
    }
}

export async function addBudgetCategory(data: { name: string, target_amount: number, budget_id: string, icon?: string, color?: string, type?: 'expense' | 'investment', group_name?: string }) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        const payload = {
            name: data.name || "Nouveau",
            target_amount: data.target_amount || 0,
            type: data.type || 'expense',
            group_name: data.group_name || null,
            color: data.color || '#6366f1',
            user_id: user.id,
            budget_id: data.budget_id
        }

        const { data: insertedData, error } = await supabase
            .from("budget_categories")
            .insert(payload)
            .select()

        if (error) return { success: false, error: error.message }
        revalidatePath("/budget")
        return { success: true, data: insertedData }
    } catch (err: any) {
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

export async function addBudgetIncome(data: { name: string, amount: number, is_recurring: boolean, budget_id: string }) {
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

export async function renameBudgetGroup(oldName: string, newName: string, type: 'expense' | 'investment', budgetId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        let query = supabase
            .from("budget_categories")
            .update({ group_name: newName })
            .eq("user_id", user.id)
            .eq("budget_id", budgetId)
            .eq("type", type)

        if (oldName === "Autres" || oldName === "Investissements") {
            const { error } = await supabase
                .from("budget_categories")
                .update({ group_name: newName })
                .eq("user_id", user.id)
                .eq("budget_id", budgetId)
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

export async function deleteBudgetGroup(groupName: string, type: 'expense' | 'investment', budgetId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Non autorisé" }

        let query = supabase
            .from("budget_categories")
            .delete()
            .eq("user_id", user.id)
            .eq("budget_id", budgetId)
            .eq("type", type)

        if (groupName === "Autres" || groupName === "Investissements") {
            const { error } = await supabase
                .from("budget_categories")
                .delete()
                .eq("user_id", user.id)
                .eq("budget_id", budgetId)
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
