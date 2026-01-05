"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, TrendingDown, DollarSign, BarChart2, Activity, Calendar, Target, Percent } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuoteData {
    symbol: string
    shortName: string
    longName?: string
    regularMarketPrice: number
    regularMarketChange: number
    regularMarketChangePercent: number
    regularMarketVolume: number
    marketCap?: number
    fiftyTwoWeekHigh?: number
    fiftyTwoWeekLow?: number
    trailingPE?: number
    forwardPE?: number
    dividendYield?: number
    eps?: number
    priceToBook?: number
    currency: string
    quoteType: string
    exchange: string
    sector?: string
    industry?: string
}

interface KeyMetricsProps {
    symbol: string
    onDataLoad?: (data: QuoteData) => void
}

export function KeyMetrics({ symbol, onDataLoad }: KeyMetricsProps) {
    const [data, setData] = useState<QuoteData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!symbol) return

        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/finance/quote?symbol=${encodeURIComponent(symbol)}`)
                if (!res.ok) throw new Error("Failed to fetch data")

                const json = await res.json()
                if (json.error) throw new Error(json.error)

                setData(json)
                onDataLoad?.(json)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [symbol, onDataLoad])

    const formatNumber = (num: number | undefined, decimals = 2) => {
        if (num == null) return "—"
        return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: decimals }).format(num)
    }

    const formatCurrency = (num: number | undefined) => {
        if (num == null) return "—"
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: data?.currency || "USD",
            notation: num >= 1e9 ? "compact" : "standard",
            maximumFractionDigits: num >= 1e9 ? 2 : 2
        }).format(num)
    }

    const formatPercent = (num: number | undefined) => {
        if (num == null) return "—"
        return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`
    }

    const formatVolume = (num: number | undefined) => {
        if (num == null) return "—"
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
        return formatNumber(num, 0)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-rose-400 text-sm">{error || "Données non disponibles"}</p>
            </div>
        )
    }

    const isPositive = data.regularMarketChange >= 0

    const metrics = [
        { label: "Volume", value: formatVolume(data.regularMarketVolume), icon: BarChart2 },
        { label: "Capitalisation", value: formatCurrency(data.marketCap), icon: DollarSign },
        { label: "Plus haut 52s", value: formatCurrency(data.fiftyTwoWeekHigh), icon: TrendingUp },
        { label: "Plus bas 52s", value: formatCurrency(data.fiftyTwoWeekLow), icon: TrendingDown },
        { label: "P/E (TTM)", value: data.trailingPE ? formatNumber(data.trailingPE) : "—", icon: Target },
        { label: "P/E (Forward)", value: data.forwardPE ? formatNumber(data.forwardPE) : "—", icon: Target },
        { label: "EPS", value: data.eps ? formatCurrency(data.eps) : "—", icon: Activity },
        { label: "Div. Yield", value: data.dividendYield ? `${(data.dividendYield * 100).toFixed(2)}%` : "—", icon: Percent },
    ]

    return (
        <div className="space-y-6">
            {/* Price Header */}
            <div className="flex items-end gap-4">
                <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {data.quoteType} • {data.exchange}
                    </p>
                    <h2 className="text-4xl font-black text-white">
                        {formatCurrency(data.regularMarketPrice)}
                    </h2>
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                    isPositive ? "bg-emerald-500/10" : "bg-rose-500/10"
                )}>
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={cn(
                        "text-sm font-bold",
                        isPositive ? "text-emerald-400" : "text-rose-400"
                    )}>
                        {formatCurrency(Math.abs(data.regularMarketChange))}
                    </span>
                    <span className={cn(
                        "text-sm font-bold",
                        isPositive ? "text-emerald-400" : "text-rose-400"
                    )}>
                        ({formatPercent(data.regularMarketChangePercent)})
                    </span>
                </div>
            </div>

            {/* Sector & Industry */}
            {(data.sector || data.industry) && (
                <div className="flex items-center gap-4">
                    {data.sector && (
                        <span className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {data.sector}
                        </span>
                    )}
                    {data.industry && (
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                            {data.industry}
                        </span>
                    )}
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <metric.icon className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                {metric.label}
                            </span>
                        </div>
                        <p className="text-lg font-bold text-white">
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
