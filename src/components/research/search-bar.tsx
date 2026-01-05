"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2, TrendingUp, TrendingDown, Bitcoin, Building2, Coins } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchResult {
    symbol: string
    shortname: string
    longname?: string
    quoteType: string
    exchange: string
}

interface ResearchSearchBarProps {
    onSelectSymbol: (symbol: string, name: string) => void
    selectedSymbol?: string
}

export function ResearchSearchBar({ onSelectSymbol, selectedSymbol }: ResearchSearchBarProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!query || query.length < 1) {
            setResults([])
            setShowResults(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/finance/search?q=${encodeURIComponent(query)}`)
                if (res.ok) {
                    const data = await res.json()
                    setResults(data.results || [])
                    setShowResults(true)
                }
            } catch (err) {
                console.error("Search error:", err)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query])

    const getTypeIcon = (quoteType: string) => {
        switch (quoteType?.toLowerCase()) {
            case "cryptocurrency":
                return <Bitcoin className="w-4 h-4 text-amber-400" />
            case "equity":
            case "stock":
                return <Building2 className="w-4 h-4 text-emerald-400" />
            case "etf":
                return <Coins className="w-4 h-4 text-blue-400" />
            default:
                return <TrendingUp className="w-4 h-4 text-zinc-400" />
        }
    }

    const handleSelect = (result: SearchResult) => {
        setQuery(result.symbol)
        setShowResults(false)
        onSelectSymbol(result.symbol, result.shortname || result.longname || result.symbol)
    }

    return (
        <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                    type="text"
                    placeholder="Rechercher un actif (AAPL, BTC-USD, MSFT...)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    className="w-full h-16 pl-14 pr-14 bg-white/[0.02] border-white/10 rounded-2xl text-white placeholder:text-zinc-600 text-lg font-medium focus:border-white/20 focus:ring-0 transition-all"
                />
                {loading && (
                    <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 animate-spin" />
                )}
            </div>

            {/* Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                    {results.map((result, idx) => (
                        <button
                            key={`${result.symbol}-${idx}`}
                            onClick={() => handleSelect(result)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left",
                                idx !== results.length - 1 && "border-b border-white/5"
                            )}
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                {getTypeIcon(result.quoteType)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-bold">{result.symbol}</span>
                                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{result.exchange}</span>
                                </div>
                                <p className="text-sm text-zinc-500">{result.shortname || result.longname}</p>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded-lg">
                                {result.quoteType}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* No results */}
            {showResults && query.length > 0 && results.length === 0 && !loading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-center shadow-2xl z-50">
                    <p className="text-zinc-500 text-sm">Aucun résultat trouvé pour "{query}"</p>
                </div>
            )}
        </div>
    )
}
