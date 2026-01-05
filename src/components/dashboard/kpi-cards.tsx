import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPIProps {
    title: string
    value: string
    change?: string
    trend?: 'up' | 'down'
    icon: any
}

function KPICard({ title, value, change, trend, icon: Icon }: { title: string, value: string, change?: string, trend?: 'up' | 'down', icon: any }) {
    return (
        <Card className="bg-white/[0.02] border-white/[0.04] shadow-2xl backdrop-blur-3xl rounded-[2rem] group hover:border-white/[0.08] transition-all duration-500">
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500">
                        <Icon className="w-5 h-5 text-zinc-500 group-hover:text-black transition-colors" />
                    </div>
                    {change && (
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        )}>
                            {change}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight mb-1">{value}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
                </div>
            </CardContent>
        </Card>
    )
}

import { DashboardStats } from "@/types"

interface KPICardsProps {
    stats: DashboardStats
}

export function KPICards({ stats }: KPICardsProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
                title="Patrimoine Brut"
                value={formatCurrency(stats.totalAssets)}
                change={stats.changePercentage !== 0 ? `${stats.changePercentage}%` : undefined}
                trend={stats.changePercentage >= 0 ? "up" : "down"}
                icon={Wallet}
            />
            <KPICard
                title="Dettes"
                value={formatCurrency(stats.totalDebts)}
                icon={CreditCard}
            />
            <KPICard
                title="Patrimoine Net"
                value={formatCurrency(stats.totalNetWorth)}
                icon={ArrowUpRight}
            />
            <KPICard
                title="Performance YTD"
                value="+0.0%"
                icon={TrendingUp}
            />
        </div>
    )
}
