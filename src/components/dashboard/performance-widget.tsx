"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardStats } from "@/types"

interface PerformanceWidgetProps {
    stats: DashboardStats
}

export function PerformanceWidget({ stats }: PerformanceWidgetProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

    const formatPercent = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val / 100)

    const isProfitable = stats.totalPnlValue >= 0

    return (
        <Card className="bg-white/[0.02] border-white/[0.04] shadow-2xl backdrop-blur-3xl rounded-[2rem] overflow-hidden">
            <CardContent className="p-0">
                {/* Header */}
                <div className="p-6 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Performance du Portefeuille</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Plus-values / Moins-values</p>
                        </div>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="p-6 space-y-6">
                    {/* P&L Highlight */}
                    <div className={cn(
                        "p-6 rounded-2xl border",
                        isProfitable
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-rose-500/5 border-rose-500/20"
                    )}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                                    Profit / Perte Total
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-3xl font-black tracking-tight",
                                        isProfitable ? "text-emerald-400" : "text-rose-400"
                                    )}>
                                        {isProfitable ? '+' : ''}{formatCurrency(stats.totalPnlValue)}
                                    </span>
                                    <div className={cn(
                                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black",
                                        isProfitable
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-rose-500/20 text-rose-400"
                                    )}>
                                        {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        {isProfitable ? '+' : ''}{formatPercent(stats.totalPnlPercent)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                                Valeur Actuelle
                            </p>
                            <p className="text-xl font-black text-white tracking-tight">
                                {formatCurrency(stats.totalAssets)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                                Total Investi
                            </p>
                            <p className="text-xl font-black text-zinc-400 tracking-tight">
                                {formatCurrency(stats.totalInvested)}
                            </p>
                        </div>
                    </div>

                    {/* Warning for missing cost basis */}
                    {stats.assetsWithoutCostBasis > 0 && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-amber-400">
                                    {stats.assetsWithoutCostBasis} actif{stats.assetsWithoutCostBasis > 1 ? 's' : ''} sans prix d'achat
                                </p>
                                <p className="text-[10px] text-amber-400/70 font-medium mt-0.5">
                                    Les calculs de performance n'incluent pas ces actifs. Modifiez-les pour ajouter le prix d'achat.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
