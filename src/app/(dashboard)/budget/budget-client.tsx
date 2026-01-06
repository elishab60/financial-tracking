"use client"

import React, { useState, useEffect } from 'react'
import { BudgetPlanner } from "@/components/budget/budget-planner"
import { BudgetCategory, BudgetIncome, Transaction } from "@/types"
import { calculateBudgetSummary } from "@/lib/budget-calculations"
import { useRouter } from "next/navigation"
import {
    addBudgetCategory,
    addBudgetIncome,
    updateBudgetCategory,
    deleteBudgetCategory,
    updateBudgetIncome,
    deleteBudgetIncome,
    renameBudgetGroup,
    deleteBudgetGroup
} from "@/app/actions/budget"
import { toast } from "sonner"

interface BudgetClientProps {
    initialData: {
        categories: BudgetCategory[]
        incomes: BudgetIncome[]
        transactions: Transaction[]
    }
}

export function BudgetClient({ initialData }: BudgetClientProps) {
    const [data, setData] = useState(initialData)
    const router = useRouter()

    // Sync local state when initialData changes (server-side refresh)
    useEffect(() => {
        setData(initialData)
    }, [initialData])

    // Seed default categories if none exist
    useEffect(() => {
        const seedDefaults = async () => {
            if (data.categories.length === 0 && data.incomes.length === 0) {
                toast.info("Initialisation de votre simulateur...")
                const incRes = await addBudgetIncome({ name: "Salaire", amount: 2500, is_recurring: true })
                if (!incRes.success) console.error("Seed error:", incRes.error)

                // Expenses grouped
                await addBudgetCategory({ name: "Loyer / Crédit", group_name: "Logement", target_amount: 800, type: 'expense', color: '#f87171' })
                await addBudgetCategory({ name: "Courses Alimentaires", group_name: "Dépenses courantes", target_amount: 400, type: 'expense', color: '#fbbf24' })
                await addBudgetCategory({ name: "Loisirs", group_name: "Dépenses courantes", target_amount: 150, type: 'expense', color: '#fbbf24' })

                // Investments grouped
                await addBudgetCategory({ name: "PEA", group_name: "Investissements", target_amount: 200, type: 'investment', color: '#8b5cf6' })

                router.refresh()
            }
        }
        seedDefaults()
    }, [data.categories.length, data.incomes.length, router])

    const handleUpdateCategory = async (id: string, updates: Partial<BudgetCategory>) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        }))
        const res = await updateBudgetCategory(id, updates)
        if (res.success) {
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleAddCategory = async (name: string, target: number, type: 'expense' | 'investment', group_name?: string) => {
        const res = await addBudgetCategory({
            name,
            target_amount: target,
            type,
            group_name,
            color: type === 'investment' ? '#8b5cf6' : '#6366f1'
        })

        if (res.success) {
            toast.success("Ajouté avec succès")
            router.refresh()
        } else {
            console.error("Add category error:", res.error)
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleDeleteCategory = async (id: string) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => c.id !== id)
        }))
        const res = await deleteBudgetCategory(id)
        if (res.success) {
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleRenameGroup = async (oldName: string, newName: string, type: 'expense' | 'investment') => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(c =>
                (c.group_name === oldName && c.type === type) ? { ...c, group_name: newName } : c
            )
        }))
        const res = await renameBudgetGroup(oldName, newName, type)
        if (res.success) {
            toast.success("Groupe renommé")
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleDeleteGroup = async (groupName: string, type: 'expense' | 'investment') => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.filter(c => !(c.group_name === groupName && c.type === type))
        }))
        const res = await deleteBudgetGroup(groupName, type)
        if (res.success) {
            toast.success("Groupe supprimé")
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleUpdateIncome = async (id: string, updates: Partial<BudgetIncome>) => {
        setData(prev => ({
            ...prev,
            incomes: prev.incomes.map(i => i.id === id ? { ...i, ...updates } : i)
        }))
        const res = await updateBudgetIncome(id, updates)
        if (res.success) {
            router.refresh()
        } else {
            toast.error(`Erreur: ${res.error}`)
        }
    }

    const handleAddIncome = async (name: string, amount: number) => {
        const res = await addBudgetIncome({ name, amount, is_recurring: true })
        if (res.success) {
            toast.success("Revenu ajouté")
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
        if (res.success) {
            router.refresh()
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
            onUpdateCategory={handleUpdateCategory}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onRenameGroup={handleRenameGroup}
            onDeleteGroup={handleDeleteGroup}
            onUpdateIncome={handleUpdateIncome}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
        />
    )
}
