"use client"

import React, { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    TrendingDown,
    TrendingUp,
    Wallet,
    Plus,
    Download,
    PieChart as PieChartIcon,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from "lucide-react"
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BudgetSummary, Transaction } from "@/types"
import { cn } from "@/lib/utils"

interface BudgetDashboardProps {
    summary: BudgetSummary
    transactions: Transaction[]
    recommendations: string[]
    onAddExpense: () => void
    onExport: () => void
}

export function BudgetDashboard({ summary, transactions, recommendations, onAddExpense, onExport }: BudgetDashboardProps) {
    const [mounted, setMounted] = React.useState(false)
    const [view, setView] = useState<'overview' | 'categories' | 'transactions'>('overview')

    useEffect(() => {
        setMounted(true)
    }, [])

    const chartData = summary.categories.map(cat => ({
        name: cat.name,
        value: cat.spent,
        budget: cat.target_amount,
        color: cat.color || '#8884d8'
    }))

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Budget Planner</h1>
                    <p className="text-zinc-400">Gérez vos pôles de dépenses et optimisez votre épargne.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={onExport} variant="outline" className="glass border-white/10 text-white hover:bg-white/5">
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                    </Button>
                    <button
                        onClick={onAddExpense}
                        className="premium-button px-6 py-3 rounded-xl"
                    >
                        <Plus className="w-4 h-4" />
                        Dépense
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Revenu Total"
                    value={summary.totalIncome}
                    icon={TrendingUp}
                    color="text-emerald-500"
                    subtitle="Ce mois-ci"
                />
                <KPICard
                    title="Dépensé"
                    value={summary.totalSpent}
                    icon={TrendingDown}
                    color="text-rose-500"
                    subtitle={`${((summary.totalSpent / summary.totalIncome) * 100).toFixed(1)}% du revenu`}
                />
                <KPICard
                    title="Restant"
                    value={summary.remaining}
                    icon={Wallet}
                    color="text-sky-500"
                    subtitle="Budget non utilisé"
                />
                <KPICard
                    title="Capacité d'Épargne"
                    value={summary.savingsMargin}
                    icon={ArrowUpRight}
                    color="text-amber-500"
                    subtitle={`${summary.savingsRate.toFixed(1)}% de taux`}
                />
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="glass-card p-6 border-none">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Répartition des dépenses</h3>
                            <PieChartIcon className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div className="h-[300px]">
                            {mounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData.filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>

                    <Card className="glass-card p-6 border-none">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Budget vs Réel</h3>
                            <BarChart3 className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div className="h-[300px]">
                            {mounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="budget" name="Prévu" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="value" name="Réel" fill="#c5a059" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Categories Summary & Recommendations */}
                <div className="space-y-8">
                    <Card className="glass-card p-6 border-none">
                        <h3 className="text-lg font-semibold text-white mb-6">Pôles de dépenses</h3>
                        <div className="space-y-6">
                            {summary.categories.map(cat => (
                                <div key={cat.id} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-300 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                            {cat.name}
                                        </span>
                                        <span className="text-white font-medium">
                                            {cat.spent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / {cat.target_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-1000",
                                                cat.percentage > 100 ? "bg-rose-500" : cat.percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Simple Recommendations */}
                    <Card className="glass-card p-6 border-none bg-linear-to-br from-white/[0.05] to-transparent">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#c5a059]" />
                            Assistant Budget
                        </h3>
                        <div className="space-y-4">
                            {recommendations.length > 0 ? (
                                recommendations.map((rec, i) => (
                                    <RecommendationItem key={i} text={rec} />
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500 italic">Tout semble en ordre ! Aucune alerte pour le moment.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <Card className="glass-card border-none overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-white/[0.05]">
                    <h3 className="text-lg font-semibold text-white">Transactions récentes</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#c5a059] w-64"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/[0.02] text-zinc-500 font-medium h-12">
                            <tr>
                                <th className="px-6">Date</th>
                                <th className="px-6">Description</th>
                                <th className="px-6">Catégorie</th>
                                <th className="px-6 text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {transactions.slice(0, 10).map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors h-16">
                                    <td className="px-6 text-zinc-400">
                                        {format(new Date(tx.date), 'dd MMM yyyy', { locale: fr })}
                                    </td>
                                    <td className="px-6 font-medium text-white">{tx.description}</td>
                                    <td className="px-6">
                                        <span className="px-2 py-1 rounded-full bg-white/5 text-zinc-400 text-[10px] uppercase tracking-wider font-bold">
                                            {tx.category || 'Non classé'}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "px-6 text-right font-bold",
                                        tx.amount < 0 ? "text-rose-400" : "text-emerald-400"
                                    )}>
                                        {tx.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

function KPICard({ title, value, icon: Icon, color, subtitle }: { title: string, value: number, icon: any, color: string, subtitle: string }) {
    return (
        <Card className="glass-card p-6 border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Icon className={cn("w-12 h-12", color)} />
            </div>
            <p className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-white">
                    {value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>
        </Card>
    )
}

function RecommendationItem({ text }: { text: string }) {
    return (
        <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mt-1.5 shrink-0" />
            <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
        </div>
    )
}
