"use client"

import { useState, useEffect } from "react"
import {
    Calculator,
    TrendingUp,
    Calendar,
    DollarSign,
    Percent,
    ChevronDown,
    ChevronUp,
    Search,
    Coins,
    RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DividendData {
    symbol: string
    name: string
    price: number
    dividendYield: number
    dividendAmount: number
    exDividendDate?: string
    paymentFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
}

export function DividendCalculator() {
    const [isOpen, setIsOpen] = useState(true)
    const [symbol, setSymbol] = useState("")
    const [investmentAmount, setInvestmentAmount] = useState<number>(10000)
    const [loading, setLoading] = useState(false)
    const [dividendData, setDividendData] = useState<DividendData | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Calculate dividend projections
    const calculateDividends = (data: DividendData, amount: number) => {
        const shares = amount / data.price
        const annualDividend = shares * data.dividendAmount

        let frequency = 1
        switch (data.paymentFrequency) {
            case 'monthly': frequency = 12; break
            case 'quarterly': frequency = 4; break
            case 'semi-annual': frequency = 2; break
            case 'annual': frequency = 1; break
        }

        const perPayment = annualDividend / frequency

        return {
            shares: shares,
            annualDividend: annualDividend,
            monthlyDividend: annualDividend / 12,
            perPayment: perPayment,
            frequency: frequency,
            yieldPercent: data.dividendYield
        }
    }

    const fetchDividendData = async () => {
        if (!symbol.trim()) return

        setLoading(true)
        setError(null)

        try {
            // Fetch stock data from the finance API
            const res = await fetch(`/api/finance/chart?symbol=${encodeURIComponent(symbol.toUpperCase())}&range=1mo`)

            if (!res.ok) {
                throw new Error("Symbole non trouvé")
            }

            const data = await res.json()
            const quote = data.meta

            // Extract dividend info (if available in the API response)
            // For now, we'll simulate dividend data since Yahoo Finance chart API may not include it
            const currentPrice = quote.regularMarketPrice || data.prices?.[data.prices.length - 1]?.close || 0

            // Check if we can get dividend yield from another source
            // For demo purposes, using common dividend yields for known stocks
            const knownDividends: Record<string, { yield: number, amount: number, frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual' }> = {
                'AAPL': { yield: 0.50, amount: 0.24, frequency: 'quarterly' },
                'MSFT': { yield: 0.75, amount: 0.75, frequency: 'quarterly' },
                'JNJ': { yield: 2.90, amount: 1.19, frequency: 'quarterly' },
                'KO': { yield: 3.10, amount: 0.46, frequency: 'quarterly' },
                'PG': { yield: 2.40, amount: 0.94, frequency: 'quarterly' },
                'T': { yield: 6.50, amount: 0.28, frequency: 'quarterly' },
                'VZ': { yield: 6.80, amount: 0.66, frequency: 'quarterly' },
                'O': { yield: 5.50, amount: 0.26, frequency: 'monthly' },
                'MAIN': { yield: 6.20, amount: 0.23, frequency: 'monthly' },
                'JEPI': { yield: 7.80, amount: 0.40, frequency: 'monthly' },
                'XOM': { yield: 3.40, amount: 0.95, frequency: 'quarterly' },
                'CVX': { yield: 4.00, amount: 1.51, frequency: 'quarterly' },
                'MCD': { yield: 2.20, amount: 1.67, frequency: 'quarterly' },
                'WMT': { yield: 1.40, amount: 0.57, frequency: 'quarterly' },
                'PEP': { yield: 2.70, amount: 1.27, frequency: 'quarterly' },
            }

            const upperSymbol = symbol.toUpperCase()
            const knownData = knownDividends[upperSymbol]

            if (knownData) {
                setDividendData({
                    symbol: upperSymbol,
                    name: quote.shortName || quote.symbol || upperSymbol,
                    price: currentPrice,
                    dividendYield: knownData.yield,
                    dividendAmount: knownData.amount,
                    paymentFrequency: knownData.frequency
                })
            } else {
                // For unknown stocks, estimate based on common market averages
                // or show that dividend data is not available
                const estimatedYield = 2.0 // S&P 500 average
                const estimatedAmount = (currentPrice * estimatedYield / 100) / 4

                setDividendData({
                    symbol: upperSymbol,
                    name: quote.shortName || quote.symbol || upperSymbol,
                    price: currentPrice,
                    dividendYield: estimatedYield,
                    dividendAmount: estimatedAmount,
                    paymentFrequency: 'quarterly'
                })
                setError("Données de dividende estimées (non vérifiées)")
            }
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération des données")
            setDividendData(null)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetchDividendData()
    }

    const formatCurrency = (num: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num)

    const formatPercent = (num: number) => `${num.toFixed(2)}%`

    const projections = dividendData ? calculateDividends(dividendData, investmentAmount) : null

    const frequencyLabels: Record<string, string> = {
        'monthly': 'Mensuel',
        'quarterly': 'Trimestriel',
        'semi-annual': 'Semestriel',
        'annual': 'Annuel'
    }

    return (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-blue-500/10 border border-emerald-500/20 overflow-hidden">
            {/* Collapsible Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left flex-1">
                    <h3 className="text-sm font-bold text-white">Calculateur de Dividendes</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Estimez vos revenus passifs</p>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-zinc-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                )}
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="px-5 pb-5 space-y-5">
                    {/* Search Form */}
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                placeholder="Symbole (ex: AAPL, O, JEPI)"
                                className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !symbol.trim()}
                            className="px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Analyser
                        </button>
                    </form>

                    {/* Investment Amount Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                Montant à investir
                            </label>
                            <span className="text-sm font-bold text-white">{formatCurrency(investmentAmount)}</span>
                        </div>
                        <input
                            type="range"
                            min={1000}
                            max={100000}
                            step={1000}
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[9px] text-zinc-600 font-medium">
                            <span>$1,000</span>
                            <span>$100,000</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-[11px] text-amber-400 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Results */}
                    {dividendData && projections && (
                        <div className="space-y-4">
                            {/* Stock Info Header */}
                            <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{dividendData.symbol}</h4>
                                        <p className="text-[11px] text-zinc-500 font-medium">{dividendData.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">{formatCurrency(dividendData.price)}</p>
                                        <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                                            <Percent className="w-3 h-3" />
                                            Rendement: {formatPercent(dividendData.dividendYield)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-[10px]">
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Coins className="w-3.5 h-3.5" />
                                        <span>Div/action: {formatCurrency(dividendData.dividendAmount)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{frequencyLabels[dividendData.paymentFrequency]}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dividend Projections */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-900/15 border border-emerald-500/20">
                                    <p className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1">Actions</p>
                                    <p className="text-xl font-black text-emerald-400">{projections.shares.toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-900/15 border border-cyan-500/20">
                                    <p className="text-[9px] font-bold text-cyan-400/70 uppercase tracking-widest mb-1">Par Paiement</p>
                                    <p className="text-xl font-black text-cyan-400">{formatCurrency(projections.perPayment)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-900/15 border border-blue-500/20">
                                    <p className="text-[9px] font-bold text-blue-400/70 uppercase tracking-widest mb-1">Par Mois</p>
                                    <p className="text-xl font-black text-blue-400">{formatCurrency(projections.monthlyDividend)}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gradient-to-br from-gold/15 to-amber-900/15 border border-gold/20">
                                    <p className="text-[9px] font-bold text-gold/70 uppercase tracking-widest mb-1">Par An</p>
                                    <p className="text-xl font-black text-gold">{formatCurrency(projections.annualDividend)}</p>
                                </div>
                            </div>

                            {/* 10-Year Projection */}
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="w-4 h-4 text-purple-400" />
                                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                                        Projection sur 10 ans (réinvestissement)
                                    </span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 5, 10].map((year) => {
                                        // Compound dividend growth with DRIP
                                        const rate = projections.yieldPercent / 100
                                        const futureValue = investmentAmount * Math.pow(1 + rate, year)
                                        const totalDividends = futureValue - investmentAmount

                                        return (
                                            <div key={year} className="text-center p-2 rounded-lg bg-white/[0.03]">
                                                <p className="text-[9px] text-zinc-500 font-bold mb-1">An {year}</p>
                                                <p className="text-[11px] font-bold text-purple-400">
                                                    +{formatCurrency(totalDividends)}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!dividendData && !loading && !error && (
                        <div className="text-center py-8 text-zinc-600">
                            <Coins className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-[11px] font-medium">
                                Entrez un symbole pour calculer les dividendes
                            </p>
                            <p className="text-[10px] mt-1 text-zinc-700">
                                Ex: AAPL, MSFT, O, JEPI, KO, PG
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
