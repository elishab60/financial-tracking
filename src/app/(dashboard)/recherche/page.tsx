"use client"

import { useState } from "react"
import { ResearchSearchBar } from "@/components/research/search-bar"
import { PriceChart } from "@/components/research/price-chart"
import { KeyMetrics } from "@/components/research/key-metrics"
import { NewsFeed } from "@/components/research/news-feed"
import { MarketWorldMap } from "@/components/research/market-world-map"
import { Search, TrendingUp, BarChart3, Newspaper, Sparkles } from "lucide-react"

export default function RecherchePage() {
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
    const [selectedName, setSelectedName] = useState<string>("")

    const handleSelectSymbol = (symbol: string, name: string) => {
        setSelectedSymbol(symbol)
        setSelectedName(name)
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
                        <Search className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-wider">
                            Recherche
                        </h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                            Explorez les marchés financiers
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-12">
                <ResearchSearchBar
                    onSelectSymbol={handleSelectSymbol}
                    selectedSymbol={selectedSymbol || undefined}
                />
            </div>

            {/* Content */}
            {selectedSymbol ? (
                <div className="space-y-8">
                    {/* Asset Header */}
                    <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                                {selectedName}
                            </h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                                {selectedSymbol}
                            </p>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <section>
                        <KeyMetrics symbol={selectedSymbol} />
                    </section>

                    {/* Price Chart */}
                    <section className="glass-card rounded-3xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-4 h-4 text-zinc-500" />
                            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                Graphique des Prix
                            </h3>
                        </div>
                        <PriceChart symbol={selectedSymbol} />
                    </section>

                    {/* News Feed */}
                    <section className="glass-card rounded-3xl p-6">
                        <NewsFeed symbol={selectedSymbol} />
                    </section>
                </div>
            ) : (
                /* Empty State with World Map */
                <div className="space-y-12 pb-24">
                    {/* Market Map Section */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <MarketWorldMap />
                    </section>

                    {/* Quick Search Section */}
                    <div className="flex flex-col items-center justify-center pt-8">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                            <Sparkles className="w-8 h-8 text-zinc-700" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-400 mb-2">
                            Besoin d'aide ?
                        </h3>
                        <p className="text-sm text-zinc-600 text-center max-w-md mb-8">
                            Recherchez n'importe quel actif pour obtenir des analyses détaillées, des graphiques en temps réel et les dernières actualités.
                        </p>

                        <div className="flex flex-wrap gap-3 justify-center">
                            {["AAPL", "MSFT", "BTC-USD", "GOOGL", "TSLA"].map((symbol) => (
                                <button
                                    key={symbol}
                                    onClick={() => handleSelectSymbol(symbol, symbol)}
                                    className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-white/5 hover:text-white hover:border-white/10 transition-all hover:scale-105 active:scale-95"
                                >
                                    {symbol}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
