"use client"

import React, { useState, useEffect } from 'react'
import { BudgetPlanner } from "@/components/budget/budget-planner"
import { BudgetCategory, BudgetIncome, Transaction, Budget } from "@/types"
import { calculateBudgetSummary } from "@/lib/budget-calculations"
import { useRouter, useSearchParams } from "next/navigation"
import {
    addBudgetCategory,
    addBudgetIncome,
    updateBudgetCategory,
    deleteBudgetCategory,
    updateBudgetIncome,
    deleteBudgetIncome,
    renameBudgetGroup,
    deleteBudgetGroup,
    createBudget,
    deleteBudget
} from "@/app/actions/budget"
import { toast } from "sonner"

interface BudgetClientProps {
    initialData: {
        budgetId: string
        categories: BudgetCategory[]
        incomes: BudgetIncome[]
        transactions: Transaction[]
    }
    budgets: Budget[]
    currentBudgetId: string
}

export function BudgetClient({ initialData, budgets, currentBudgetId }: BudgetClientProps) {
    const [data, setData] = useState(initialData)
    const router = useRouter()
    const searchParams = useSearchParams()

    // Sync local state when initialData changes (server-side refresh)
    useEffect(() => {
        setData(initialData)
    }, [initialData])

    const handleUpdateCategory = async (id: string, updates: Partial<BudgetCategory>) => {
        // Optimistic update
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        }))

        const res = await updateBudgetCategory(id, updates)
        if (!res.success) {
            toast.error(`Erreur: ${res.error}`)
            // Revert on error if needed, but router.refresh() will fix it
            router.refresh()
        }
    }

    const handleAddCategory = async (name: string, target: number, type: 'expense' | 'investment', group_name?: string) => {
        const res = await addBudgetCategory({
            name,
            target_amount: target,
            type,
            group_name,
            budget_id: initialData.budgetId,
            color: type === 'investment' ? '#8b5cf6' : '#6366f1'
        })

        if (res.success) {
            toast.success("Ajouté avec succès")
            // Manually add to local state to avoid "need reload" issue
            if (res.data) {
                const newCat = Array.isArray(res.data) ? res.data[0] : res.data
                setData(prev => ({
                    ...prev,
                    categories: [...prev.categories, newCat]
                }))
            }
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== id)
        }))
        const res = await deleteBudgetCategory(id)
        if (!res.success) {
            toast.error(`Erreur: ${res.error}`)
            router.refresh()
        }
    }

    const handleRenameGroup = async (oldName: string, newName: string, type: 'expense' | 'investment') => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(c =>
                (c.group_name === oldName && c.type === type) ? { ...c, group_name: newName } : c
            )
        }))
        const res = await renameBudgetGroup(oldName, newName, type, initialData.budgetId)
        if (res.success) {
            toast.success("Groupe renommé")
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
            router.refresh()
        }
    }

    const handleDeleteGroup = async (groupName: string, type: 'expense' | 'investment') => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => !(c.group_name === groupName && c.type === type))
        }))
        const res = await deleteBudgetGroup(groupName, type, initialData.budgetId)
        if (res.success) {
            toast.success("Groupe supprimé")
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
            router.refresh()
        }
    }

    const handleUpdateIncome = async (id: string, updates: Partial<BudgetIncome>) => {
        setData(prev => ({
            ...prev,
            incomes: prev.incomes.map(i => i.id === id ? { ...i, ...updates } : i)
        }))
        const res = await updateBudgetIncome(id, updates)
        if (!res.success) {
            toast.error(`Erreur: ${res.error}`)
            router.refresh()
        }
    }

    const handleAddIncome = async (name: string, amount: number) => {
        const res = await addBudgetIncome({ name, amount, is_recurring: true, budget_id: initialData.budgetId })
        if (res.success) {
            toast.success("Revenu ajouté")
            if (res.data) {
                const newInc = Array.isArray(res.data) ? res.data[0] : res.data
                setData(prev => ({
                    ...prev,
                    incomes: [...prev.incomes, newInc]
                }))
            }
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleDeleteIncome = async (id: string) => {
        setData(prev => ({
            ...prev,
            incomes: prev.incomes.filter(i => i.id !== id)
        }))
        const res = await deleteBudgetIncome(id)
        if (!res.success) {
            toast.error(`Erreur: ${res.error}`)
            router.refresh()
        }
    }

    const handleCreateBudget = async (name: string) => {
        const res = await createBudget(name)
        if (res.success && res.data) {
            toast.success("Budget créé")
            // Switch to the new budget
            router.push(`/budget?budgetId=${res.data.id}`)
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleSelectBudget = (id: string) => {
        router.push(`/budget?budgetId=${id}`)
    }

    const handleDeleteBudget = async (id: string) => {
        if (budgets.length <= 1) {
            toast.error("Vous ne pouvez pas supprimer votre dernier budget")
            return
        }
        const res = await deleteBudget(id)
        if (res.success) {
            toast.success("Budget supprimé")
            if (id === currentBudgetId) {
                const nextBudget = budgets.find(b => b.id !== id)
                router.push(`/budget?budgetId=${nextBudget?.id}`)
            } else {
                router.refresh()
            }
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const summary = calculateBudgetSummary(data.categories, data.incomes, data.transactions)

    return (
        <BudgetPlanner
            summary={summary}
            categories={data.categories}
            incomes={data.incomes}
            budgets={budgets}
            currentBudgetId={currentBudgetId}
            onUpdateCategory={handleUpdateCategory}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onRenameGroup={handleRenameGroup}
            onDeleteGroup={handleDeleteGroup}
            onUpdateIncome={handleUpdateIncome}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
            onCreateBudget={handleCreateBudget}
            onSelectBudget={handleSelectBudget}
            onDeleteBudget={handleDeleteBudget}
        />
    )
}
