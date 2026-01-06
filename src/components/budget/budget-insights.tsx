"use client"

import React, { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"

interface BudgetInsightsProps {
    totalRevenus: number
    totalDepenses: number
    totalInvest: number
    availableAmount: number
    expenseGroups: Record<string, any[]>
    investmentGroups: Record<string, any[]>
}

export function BudgetInsights({
    totalRevenus,
    totalDepenses,
    totalInvest,
    availableAmount,
    expenseGroups,
    investmentGroups
}: BudgetInsightsProps) {

    // Proportions for the horizontal progress bar
    const proportions = useMemo(() => {
        const total = Math.max(totalRevenus, totalDepenses + totalInvest + Math.max(0, availableAmount));
        if (total === 0) return { dep: 0, inv: 0, av: 0 };
        return {
            dep: (totalDepenses / total) * 100,
            inv: (totalInvest / total) * 100,
            av: (Math.max(0, availableAmount) / total) * 100
        };
    }, [totalRevenus, totalDepenses, totalInvest, availableAmount]);

    // Data for Donut 1: Breakdown of ALL individual expenses
    const detailedExpenses = useMemo(() => {
        const items: any[] = [];
        Object.values(expenseGroups).forEach(groupItems => {
            groupItems.forEach(item => {
                if (item.target_amount > 0) {
                    items.push({ name: item.name, value: item.target_amount });
                }
            });
        });
        return items.sort((a, b) => b.value - a.value);
    }, [expenseGroups]);

    // Data for Donut 2: Breakdown of ALL individual investments
    const detailedInvestments = useMemo(() => {
        const items: any[] = [];
        Object.values(investmentGroups).forEach(groupItems => {
            groupItems.forEach(item => {
                if (item.target_amount > 0) {
                    items.push({ name: item.name, value: item.target_amount });
                }
            });
        });
        return items.sort((a, b) => b.value - a.value);
    }, [investmentGroups]);

    const COLORS_EXP = ["#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"];
    const COLORS_INV = ["#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87", "#3b0764"];

    return (
        <div className="space-y-12">
            {/* 1. Horizontal Multi-Bar (Proportions) */}
            <Card className="glass-card bg-black/40 border-none p-10 rounded-[2.5rem]">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Répartition du revenu</h3>
                        <p className="text-zinc-500 text-xs mt-1">Allocation de vos {totalRevenus.toLocaleString()} € mensuels</p>
                    </div>
                </div>

                <div className="h-6 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                    <div
                        style={{ width: `${proportions.dep}%` }}
                        className="h-full bg-rose-500/80 transition-all duration-1000 ease-out"
                    />
                    <div
                        style={{ width: `${proportions.inv}%` }}
                        className="h-full bg-purple-500/80 transition-all duration-1000 ease-out"
                    />
                    <div
                        style={{ width: `${proportions.av}%` }}
                        className="h-full bg-emerald-500/80 transition-all duration-1000 ease-out"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dépenses</span>
                        </div>
                        <p className="text-lg font-bold text-white">{totalDepenses.toLocaleString()} € <span className="text-xs text-zinc-600 font-medium">({proportions.dep.toFixed(1)}%)</span></p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Investis</span>
                        </div>
                        <p className="text-lg font-bold text-white">{totalInvest.toLocaleString()} € <span className="text-xs text-zinc-600 font-medium">({proportions.inv.toFixed(1)}%)</span></p>
                    </div>
                    <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Libre</span>
                        </div>
                        <p className="text-lg font-bold text-white">{availableAmount.toLocaleString()} € <span className="text-xs text-zinc-600 font-medium">({proportions.av.toFixed(1)}%)</span></p>
                    </div>
                </div>
            </Card>

            {/* 2. Detailed Donuts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Detailed Expenses */}
                <Card className="glass-card bg-black/40 border-none p-10 rounded-[2.5rem]">
                    <h3 className="text-xl font-bold text-white mb-8">Détail des charges</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={detailedExpenses}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {detailedExpenses.map((entry, index) => (
                                        <Cell key={`cell-exp-${index}`} fill={COLORS_EXP[index % COLORS_EXP.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Flux Sortant</span>
                            <span className="text-2xl font-black text-rose-500">
                                {totalDepenses.toLocaleString()} €
                            </span>
                        </div>
                    </div>
                    <div className="mt-8 space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {detailedExpenses.map((d, i) => (
                            <div key={d.name} className="flex items-center justify-between text-xs group">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS_EXP[i % COLORS_EXP.length] }} />
                                    <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{d.name}</span>
                                </div>
                                <span className="text-zinc-200 font-medium">{d.value.toLocaleString()} €</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Detailed Investments */}
                <Card className="glass-card bg-black/40 border-none p-10 rounded-[2.5rem]">
                    <h3 className="text-xl font-bold text-white mb-8">Répartition des investissements</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={detailedInvestments}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {detailedInvestments.map((entry, index) => (
                                        <Cell key={`cell-inv-${index}`} fill={COLORS_INV[index % COLORS_INV.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Capital Placé</span>
                            <span className="text-2xl font-black text-purple-500">
                                {totalInvest.toLocaleString()} €
                            </span>
                        </div>
                    </div>
                    <div className="mt-8 space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {detailedInvestments.map((d, i) => (
                            <div key={d.name} className="flex items-center justify-between text-xs group">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS_INV[i % COLORS_INV.length] }} />
                                    <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{d.name}</span>
                                </div>
                                <span className="text-zinc-200 font-medium">{d.value.toLocaleString()} €</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
