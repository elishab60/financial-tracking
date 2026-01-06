"use client"

import React, { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, GripVertical, Trash2, Edit2, Check } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BudgetSankey } from "./budget-sankey"
import { BudgetInsights } from "./budget-insights"
import { BudgetCategory, BudgetIncome, BudgetSummary } from "@/types"

interface BudgetPlannerProps {
    summary: BudgetSummary
    categories: BudgetCategory[]
    incomes: BudgetIncome[]
    onUpdateCategory: (id: string, data: Partial<BudgetCategory>) => void
    onAddCategory: (name: string, target: number, type: 'expense' | 'investment', group_name?: string) => void
    onDeleteCategory: (id: string) => void
    onRenameGroup: (oldName: string, newName: string, type: 'expense' | 'investment') => void
    onDeleteGroup: (groupName: string, type: 'expense' | 'investment') => void
    onUpdateIncome: (id: string, data: Partial<BudgetIncome>) => void
    onAddIncome: (name: string, amount: number) => void
    onDeleteIncome: (id: string) => void
}

export function BudgetPlanner({
    summary,
    categories,
    incomes,
    onUpdateCategory,
    onAddCategory,
    onDeleteCategory,
    onRenameGroup,
    onDeleteGroup,
    onUpdateIncome,
    onAddIncome,
    onDeleteIncome
}: BudgetPlannerProps) {
    const [activeTab, setActiveTab] = useState<"revenus" | "depenses" | "investissements">("revenus")

    // Total calculations
    const totalRevenus = incomes.reduce((sum, r) => sum + r.amount, 0)
    const totalInvest = categories.filter(c => c.type === 'investment').reduce((sum, c) => sum + c.target_amount, 0)
    const totalDepenses = categories.filter(c => c.type === 'expense').reduce((sum, c) => sum + c.target_amount, 0)

    const availableAmount = totalRevenus - totalInvest - totalDepenses
    const currentSavingsRate = totalRevenus > 0 ? (totalInvest / totalRevenus) * 100 : 0

    // Grouping
    const expenseGroups = useMemo(() => {
        const groups: Record<string, BudgetCategory[]> = {}
        categories.filter(c => c.type === 'expense').forEach(c => {
            const group = c.group_name || "Autres"
            if (!groups[group]) groups[group] = []
            groups[group].push(c)
        })
        return groups
    }, [categories])

    const investmentGroups = useMemo(() => {
        const groups: Record<string, BudgetCategory[]> = {}
        categories.filter(c => c.type === 'investment').forEach(c => {
            const group = c.group_name || "Investissements"
            if (!groups[group]) groups[group] = []
            groups[group].push(c)
        })
        return groups
    }, [categories])

    // Sankey Generation
    const sankeyData = useMemo(() => {
        const nodes: any[] = []
        const links: any[] = []
        if (incomes.length === 0) return { nodes: [], links: [] }

        incomes.filter(r => r.amount > 0).forEach(r => {
            nodes.push({ id: `inc-${r.id}`, name: `${r.name}: ${r.amount} €`, color: "#4f46e5" })
            links.push({ source: `inc-${r.id}`, target: "budget", value: r.amount })
        })
        nodes.push({ id: "budget", name: `Budget: ${totalRevenus} €`, color: "#f97316" })

        Object.entries(expenseGroups).forEach(([groupName, items]) => {
            const groupTotal = items.reduce((sum, i) => sum + i.target_amount, 0)
            if (groupTotal > 0) {
                const groupId = `group-exp-${groupName}`
                nodes.push({ id: groupId, name: `${groupName}: ${groupTotal} €`, color: "#f87171" })
                links.push({ source: "budget", target: groupId, value: groupTotal })
                items.forEach(item => {
                    if (item.target_amount > 0) {
                        nodes.push({ id: item.id, name: `${item.name}: ${item.target_amount} €`, color: "#f87171" })
                        links.push({ source: groupId, target: item.id, value: item.target_amount })
                    }
                })
            }
        })

        Object.entries(investmentGroups).forEach(([groupName, items]) => {
            const groupTotal = items.reduce((sum, i) => sum + i.target_amount, 0)
            if (groupTotal > 0) {
                const groupId = `group-inv-${groupName}`
                nodes.push({ id: groupId, name: `${groupName}: ${groupTotal} €`, color: "#8b5cf6" })
                links.push({ source: "budget", target: groupId, value: groupTotal })
                items.forEach(item => {
                    if (item.target_amount > 0) {
                        nodes.push({ id: item.id, name: `${item.name}: ${item.target_amount} €`, color: "#8b5cf6" })
                        links.push({ source: groupId, target: item.id, value: item.target_amount })
                    }
                })
            }
        })

        if (availableAmount > 0) {
            nodes.push({ id: "available", name: `Disponible: ${availableAmount} €`, color: "#10b981" })
            links.push({ source: "budget", target: "available", value: availableAmount })
        }
        return { nodes, links }
    }, [incomes, expenseGroups, investmentGroups, totalRevenus, availableAmount])

    return (
        <div className="max-w-6xl mx-auto space-y-16 py-12 px-6">
            {/* 1. Header */}
            <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">
                    Calculateur de budget
                </h1>
                <p className="text-zinc-500 font-medium tracking-widest uppercase text-[10px]">Simulation mensuelle & allocation stratégique</p>
            </div>

            {/* 2. Editors Section (Moved Up) */}
            <div className="space-y-10">
                <div className="flex items-center justify-center gap-12 border-b border-white/5">
                    {[
                        { id: "revenus", label: "Revenus" },
                        { id: "depenses", label: "Dépenses" },
                        { id: "investissements", label: "Investissements" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "pb-6 text-sm font-bold uppercase tracking-[0.2em] transition-all relative",
                                activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="activeTabUnderline" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#c5a059]" />
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                    >
                        {activeTab === "revenus" && (
                            <EditorSection
                                title="Revenus mensuels"
                                items={incomes.map(i => ({ id: i.id, name: i.name, amount: i.amount }))}
                                onUpdate={onUpdateIncome}
                                onDelete={onDeleteIncome}
                                onAdd={() => onAddIncome("Nouveau revenu", 0)}
                                addLabel="Ajouter un revenu"
                                isIncome
                            />
                        )}

                        {activeTab === "depenses" && (
                            <div className="space-y-6">
                                {Object.entries(expenseGroups).map(([groupName, items]) => (
                                    <EditorSection
                                        key={groupName}
                                        title={groupName}
                                        items={items.map(i => ({ id: i.id, name: i.name, amount: i.target_amount }))}
                                        onUpdate={(id: string, up: any) => onUpdateCategory(id, { name: up.name, target_amount: up.amount })}
                                        onDelete={onDeleteCategory}
                                        onAdd={() => onAddCategory("Nouvelle dépense", 0, 'expense', groupName)}
                                        onRenameGroup={(newName: string) => onRenameGroup(groupName, newName, 'expense')}
                                        onDeleteGroup={() => onDeleteGroup(groupName, 'expense')}
                                        addLabel="Ajouter une dépense"
                                    />
                                ))}
                                <button
                                    onClick={() => onAddCategory("Dépense", 0, 'expense', "Nouveau groupe")}
                                    className="w-full py-10 border-2 border-dashed border-white/5 rounded-[2rem] text-zinc-600 hover:border-white/10 hover:text-zinc-400 transition-all font-bold uppercase tracking-widest text-xs"
                                >
                                    + Ajouter un groupe de dépenses
                                </button>
                            </div>
                        )}

                        {activeTab === "investissements" && (
                            <div className="space-y-6">
                                {Object.entries(investmentGroups).map(([groupName, items]) => (
                                    <EditorSection
                                        key={groupName}
                                        title={groupName}
                                        items={items.map(i => ({ id: i.id, name: i.name, amount: i.target_amount }))}
                                        onUpdate={(id: string, up: any) => onUpdateCategory(id, { name: up.name, target_amount: up.amount })}
                                        onDelete={onDeleteCategory}
                                        onAdd={() => onAddCategory("Nouvel investissement", 0, 'investment', groupName)}
                                        onRenameGroup={(newName: string) => onRenameGroup(groupName, newName, 'investment')}
                                        onDeleteGroup={() => onDeleteGroup(groupName, 'investment')}
                                        addLabel="Ajouter un investissement"
                                    />
                                ))}
                                <button
                                    onClick={() => onAddCategory("Investissement", 0, 'investment', "Nouveau groupe")}
                                    className="w-full py-10 border-2 border-dashed border-white/5 rounded-[2rem] text-zinc-600 hover:border-white/10 hover:text-zinc-400 transition-all font-bold uppercase tracking-widest text-xs"
                                >
                                    + Ajouter un groupe d'investissement
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 3. KPI Cards & Sankey Visualizer */}
            <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
                    {/* KPI: Taux d'épargne (Featured) */}
                    <Card className="glass-card bg-linear-to-br from-[#c5a059]/10 to-transparent border-none p-8 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-[#c5a059]/10 transition-all" />
                        <div className="space-y-4 relative">
                            <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em]">Taux d'épargne</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">{currentSavingsRate.toFixed(1)}</span>
                                <span className="text-xl font-bold text-white/40">%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${currentSavingsRate}%` }}
                                    className="h-full bg-[#c5a059]"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* KPI: Revenus */}
                    <Card className="glass-card bg-white/[0.02] border-none p-8 rounded-[2rem] hover:bg-white/[0.04] transition-all">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Revenus cumulés</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{totalRevenus.toLocaleString()}</span>
                                <span className="text-sm font-bold text-zinc-600">€</span>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-medium">Flux entrant total</p>
                        </div>
                    </Card>

                    {/* KPI: Dépenses & Invest */}
                    <Card className="glass-card bg-white/[0.02] border-none p-8 rounded-[2rem] hover:bg-white/[0.04] transition-all">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Sorties & Placements</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white">{(totalDepenses + totalInvest).toLocaleString()}</span>
                                <span className="text-sm font-bold text-zinc-600">€</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="text-[9px] text-rose-500 font-bold">-{totalDepenses.toLocaleString()}€</span>
                                <span className="text-[9px] text-purple-500 font-bold">-{totalInvest.toLocaleString()}€</span>
                            </div>
                        </div>
                    </Card>

                    {/* KPI: Disponible */}
                    <Card className="glass-card bg-emerald-500/[0.03] border-none p-8 rounded-[2rem] hover:bg-emerald-500/[0.05] transition-all">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Reste à vivre</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-emerald-400">{availableAmount.toLocaleString()}</span>
                                <span className="text-sm font-bold text-emerald-900">€</span>
                            </div>
                            <p className="text-[10px] text-emerald-900/40 font-medium">Disponible pour extras</p>
                        </div>
                    </Card>
                </div>

                <div className="flex items-center gap-6">
                    <div className="h-[1px] flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex flex-col items-center gap-1">
                        <h2 className="text-white font-black uppercase tracking-[0.4em] text-[11px]">Flux financiers</h2>
                    </div>
                    <div className="h-[1px] flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="glass-card border-none bg-black/40 p-8 min-h-[500px] flex items-center justify-center rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                    {sankeyData.nodes.length > 0 ? (
                        <BudgetSankey data={sankeyData} width={1000} height={450} />
                    ) : (
                        <div className="text-zinc-600 font-medium uppercase tracking-widest text-sm">Inscrivez vos revenus pour commencer</div>
                    )}
                </div>
            </div>

            {/* 4. Insights Breakdown */}
            <div className="space-y-12">
                <div className="flex items-center gap-6">
                    <div className="h-[1px] flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex flex-col items-center gap-1">
                        <h2 className="text-white font-black uppercase tracking-[0.4em] text-[11px]">Analyses & Insights</h2>
                    </div>
                    <div className="h-[1px] flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <BudgetInsights
                    totalRevenus={totalRevenus}
                    totalDepenses={totalDepenses}
                    totalInvest={totalInvest}
                    availableAmount={availableAmount}
                    expenseGroups={expenseGroups}
                    investmentGroups={investmentGroups}
                />
            </div>

            <div className="flex justify-center pt-8">
                <button className="bg-white text-black font-bold uppercase tracking-widest text-[11px] px-24 py-6 rounded-full hover:bg-zinc-200 transition-all shadow-2xl shadow-white/10 active:scale-95">
                    Finaliser mon plan
                </button>
            </div>
        </div>
    )
}

function EditorSection({ title, items, onUpdate, onDelete, onAdd, onRenameGroup, onDeleteGroup, addLabel, isIncome = false }: any) {
    const total = items.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [newTitle, setNewTitle] = useState(title)

    const handleTitleSave = () => {
        if (newTitle !== title && onRenameGroup) {
            onRenameGroup(newTitle)
        }
        setIsEditingTitle(false)
    }

    return (
        <Card className="glass-card border-none bg-white/[0.01] p-0 overflow-hidden rounded-[2.5rem] group/card transition-all hover:bg-white/[0.02] shadow-xl">
            <div className="flex items-center justify-between p-10 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white font-bold text-xl outline-none focus:border-[#c5a059]"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            />
                            <button onClick={handleTitleSave} className="p-2 bg-[#c5a059] rounded-lg text-black hover:bg-[#d4b57a]">
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                            {!isIncome && (
                                <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <button onClick={() => setIsEditingTitle(true)} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={onDeleteGroup} className="p-1.5 text-zinc-500 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-white tracking-tighter">{total.toLocaleString()} €</span>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total</span>
                </div>
            </div>
            <div className="p-10 space-y-4">
                {items.map((item: any) => (
                    <div key={item.id} className="grid grid-cols-12 gap-8 items-center group relative py-3">
                        <div className="col-span-1 flex justify-center">
                            <GripVertical className="w-4 h-4 text-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
                        </div>
                        <div className="col-span-7 relative">
                            <input
                                className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-zinc-800 text-lg font-medium"
                                value={item.name}
                                onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                            />
                            <div className="absolute bottom-[-10px] left-0 right-0 h-[1px] bg-white/5 group-hover:bg-white/10 transition-colors" />
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-4 relative">
                            <input
                                type="number"
                                className="w-full bg-transparent border-none text-right text-white focus:outline-none focus:ring-0 placeholder:text-zinc-800 text-lg font-bold"
                                value={item.amount || ""}
                                onChange={(e) => onUpdate(item.id, { amount: Number(e.target.value) })}
                            />
                            <span className="text-[10px] font-bold text-zinc-700">EUR</span>
                            <div className="absolute bottom-[-10px] left-0 right-0 h-[1px] bg-white/5 group-hover:bg-white/10 transition-colors" />
                        </div>
                        <div className="col-span-1 flex justify-center">
                            <button onClick={() => onDelete(item.id)} className="p-2.5 rounded-2xl hover:bg-rose-500/10 text-zinc-800 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                <button onClick={onAdd} className="flex items-center gap-4 text-zinc-500 hover:text-zinc-300 text-sm font-bold pt-10 pb-4 transition-all group/add">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover/add:bg-[#c5a059] group-hover/add:text-black transition-all shadow-lg">
                        <Plus className="w-5 h-5" />
                    </div>
                    {addLabel}
                </button>
            </div>
        </Card>
    )
}
