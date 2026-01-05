"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { PlusCircle, Search, TrendingUp, TrendingDown, Target, Sparkles, Loader2, Calendar, DollarSign } from "lucide-react"

import { addAsset } from "@/app/actions/assets"
import { toast } from "sonner"
import { AssetType } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function AddAssetDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [quote, setQuote] = useState<any>(null)
    const [showResults, setShowResults] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [historicalPrice, setHistoricalPrice] = useState<number | null>(null)
    const [loadingHistorical, setLoadingHistorical] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        type: 'stock' as AssetType,
        symbol: '',
        quantity: 0,
        manual_value: 0,
        buy_price: undefined as number | undefined,
        buy_date: new Date().toISOString().split('T')[0],
        fees: 0,
        currency: 'EUR',
        valuation_mode: 'manual' as 'manual' | 'auto'
    })

    const searchWrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
                setShowResults(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([])
            return
        }

        const timer = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await fetch(`/api/finance/search?q=${searchQuery}`)
                if (!res.ok) return
                const data = await res.json()
                setSearchResults(data.quotes || [])
            } catch (err) {
                console.error("Search error:", err)
            } finally {
                setSearching(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const fetchQuote = async (symbol: string) => {
        try {
            const res = await fetch(`/api/finance/quote?symbol=${symbol}`)
            if (!res.ok) throw new Error("Failed to fetch quote")
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setQuote(data)

            // Robust type detection
            let autoType: AssetType = 'stock'
            const qt = data.quoteType?.toUpperCase() || ''

            if (qt === 'CRYPTOCURRENCY') autoType = 'crypto'
            else if (qt === 'ETF' || qt === 'EQUITY' || qt === 'MUTUALFUND') autoType = 'stock'
            else if (qt === 'CURRENCY') autoType = 'cash'
            else if (symbol.toUpperCase().includes('BTC') || symbol.toUpperCase().includes('ETH')) autoType = 'crypto' // Fallback

            setFormData(prev => ({
                ...prev,
                name: data.shortName || data.longName || symbol,
                symbol: symbol,
                type: autoType,
                valuation_mode: 'auto',
                currency: data.currency === 'USD' ? 'USD' : 'EUR'
            }))
        } catch (err) {
            console.error("Quote error:", err)
            setQuote(null)
        }
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error("Veuillez remplir le nom")
            return
        }
        if (formData.valuation_mode === 'auto' && !formData.quantity) {
            toast.error("Veuillez définir une quantité")
            return
        }
        if (formData.valuation_mode === 'manual' && (!formData.manual_value && !formData.quantity)) {
            toast.error("Veuillez définir une valeur ou une quantité")
            return
        }
        if (formData.fees != null && formData.fees < 0) {
            toast.error("Les frais ne peuvent pas être négatifs")
            return
        }
        if (formData.buy_price != null && formData.buy_price < 0) {
            toast.error("Le prix d'achat ne peut pas être négatif")
            return
        }

        setLoading(true)
        try {
            await addAsset(formData)
            toast.success("Actif ajouté avec succès")
            setOpen(false)
            resetForm()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'ajout")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'stock',
            symbol: '',
            quantity: 0,
            manual_value: 0,
            buy_price: undefined,
            buy_date: new Date().toISOString().split('T')[0],
            fees: 0,
            currency: 'EUR',
            valuation_mode: 'manual'
        })
        setSearchQuery('')
        setQuote(null)
        setSearchResults([])
        setHistoricalPrice(null)
    }

    const fetchHistoricalPrice = async (symbol: string, date: string) => {
        if (!symbol || !date) return

        setLoadingHistorical(true)
        try {
            const res = await fetch(`/api/finance/historical?symbol=${symbol}&date=${date}`)
            if (!res.ok) {
                setHistoricalPrice(null)
                return
            }
            const data = await res.json()
            if (data.price) {
                setHistoricalPrice(data.price)
            } else {
                setHistoricalPrice(null)
            }
        } catch (err) {
            console.error("Historical price error:", err)
            setHistoricalPrice(null)
        } finally {
            setLoadingHistorical(false)
        }
    }

    // Sync historical price to form
    useEffect(() => {
        if (historicalPrice !== null) {
            setFormData(prev => ({ ...prev, buy_price: historicalPrice }))
            toast.success("Prix historique récupéré !")
        }
    }, [historicalPrice])

    const handleDateChange = (newDate: string) => {
        setFormData({ ...formData, buy_date: newDate })
        if (formData.symbol && newDate) {
            fetchHistoricalPrice(formData.symbol, newDate)
        }
    }

    const selectResult = (result: any) => {
        if (!result || !result.symbol) return
        setSearchQuery(result.symbol)
        setShowResults(false)
        fetchQuote(result.symbol)
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
                <Button className="premium-button rounded-xl px-6">
                    <PlusCircle className="w-4 h-4" />
                    Ajouter un actif
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border-white/10 p-0 overflow-hidden">
                <div className="p-8 space-y-8">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-premium flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                <Sparkles className="w-6 h-6 text-gold" />
                            </div>
                            Nouvel Actif
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Unified Search Field */}
                        <div className="space-y-3 relative" ref={searchWrapperRef}>
                            <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold ml-1">Recherche Rapide (Symbole ou Nom)</Label>
                            <div className="relative group">
                                <Input
                                    placeholder="Ex: Apple, Bitcoin, LVMH..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setShowResults(true)
                                    }}
                                    onFocus={() => setShowResults(true)}
                                    className="input-glass h-14 pl-12 text-lg font-bold rounded-2xl border-white/10 group-hover:border-gold/30 transition-all"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-hover:text-gold transition-colors" />
                                {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gold" />}
                            </div>

                            <AnimatePresence>
                                {showResults && searchResults && searchResults.length > 0 && (
                                    <motion.div
                                        key="add-search-results"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-[100] w-full mt-2 bg-zinc-950 border border-white/10 max-h-[280px] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-2"
                                    >
                                        {searchResults.map((result, i) => (
                                            <div
                                                key={`add-result-${result.symbol || i}`}
                                                onClick={() => selectResult(result)}
                                                className="p-4 hover:bg-white/5 cursor-pointer transition-all rounded-xl border border-transparent hover:border-white/5 flex justify-between items-center group/item"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-black text-xs text-zinc-400 group-hover/item:text-gold transition-colors">
                                                        {result.symbol?.slice(0, 2) || "??"}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-white">{result.symbol}</div>
                                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate max-w-[180px]">{result.shortname || result.longname}</div>
                                                    </div>
                                                </div>
                                                <div className="text-[9px] bg-gold/10 border border-gold/20 px-2 py-1 rounded-md text-gold font-black uppercase tracking-widest">
                                                    {result.quoteType}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Analysis & Details */}
                        <div className="min-h-[140px] relative">
                            <AnimatePresence mode="wait">
                                {quote ? (
                                    <motion.div
                                        key="add-analysis-quote"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-5"
                                    >
                                        <div className="p-5 rounded-3xl glass-card border-gold/20 bg-linear-to-br from-gold/10 to-transparent space-y-5">
                                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Live Market Insight</span>
                                                </div>
                                                <div className={cn(
                                                    "flex items-center gap-1.5 text-xs font-black px-2 py-1 rounded-lg bg-white/5",
                                                    (quote.regularMarketChangePercent || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                                                )}>
                                                    {(quote.regularMarketChangePercent || 0) >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                                    {(quote.regularMarketChangePercent || 0).toFixed(2)}%
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1">
                                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Prix Actuel</div>
                                                    <div className="text-2xl font-black text-white tracking-tighter">
                                                        {quote.regularMarketPrice?.toLocaleString('fr-FR', { style: 'currency', currency: quote.currency || 'EUR' })}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                                                        <Target className="w-3 h-3 text-gold" /> Objectif Moyen
                                                    </div>
                                                    <div className="text-2xl font-black text-white/40 tracking-tighter">
                                                        {quote.targetMeanPrice
                                                            ? quote.targetMeanPrice.toLocaleString('fr-FR', { style: 'currency', currency: quote.currency || 'EUR' })
                                                            : "N/A"}
                                                    </div>
                                                </div>
                                            </div>

                                            {quote.targetMeanPrice && (
                                                <div className="bg-white/5 rounded-2xl p-3 text-[10px] text-zinc-400 font-bold leading-relaxed border border-white/5">
                                                    💡 L'analyse suggère un potentiel de <span className="text-gold font-black">{((quote.targetMeanPrice / quote.regularMarketPrice - 1) * 100).toFixed(1)}%</span> d'ici 12 mois.
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : searchQuery.length > 0 && !searching && (
                                    <motion.div
                                        key="add-analysis-manual"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">Type</Label>
                                            <Select
                                                value={formData.type}
                                                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                            >
                                                <SelectTrigger className="input-glass h-12 rounded-xl">
                                                    <SelectValue placeholder="Choisir un type" />
                                                </SelectTrigger>
                                                <SelectContent className="glass-card border-white/10 text-white backdrop-blur-3xl">
                                                    <SelectItem value="cash">🏦 Cash</SelectItem>
                                                    <SelectItem value="stock">📈 Stock</SelectItem>
                                                    <SelectItem value="crypto">🪙 Crypto</SelectItem>
                                                    <SelectItem value="real_estate">🏠 Immo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">Nom</Label>
                                            <Input
                                                placeholder="Nom de l'actif"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input-glass h-12 rounded-xl"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">
                                    {formData.valuation_mode === 'manual' ? 'Valeur Totale (€)' : 'Quantité'}
                                </Label>
                                {formData.valuation_mode === 'manual' ? (
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.manual_value || ''}
                                        onChange={(e) => setFormData({ ...formData, manual_value: Number(e.target.value) })}
                                        className="input-glass h-14 text-xl font-black rounded-2xl border-white/10 focus:border-gold/50"
                                    />
                                ) : (
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.quantity || ''}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                        className="input-glass h-14 text-xl font-black rounded-2xl border-white/10 focus:border-gold/50"
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">Mode Valorisation</Label>
                                <div className="flex gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/5 h-14">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, valuation_mode: 'auto' })}
                                        className={cn(
                                            "flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                            formData.valuation_mode === 'auto' ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        🤖 Auto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, valuation_mode: 'manual' })}
                                        className={cn(
                                            "flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                            formData.valuation_mode === 'manual' ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"
                                        )}
                                    >
                                        ✍️ Manuel
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Purchase Price Input */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">
                                    Prix d'Achat (PRU)
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.buy_price || ''}
                                    onChange={(e) => setFormData({ ...formData, buy_price: e.target.value ? Number(e.target.value) : undefined })}
                                    className="input-glass h-14 font-bold rounded-2xl border-white/10 focus:border-gold/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">
                                    Date d'achat
                                </Label>
                                <Input
                                    type="date"
                                    value={formData.buy_date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="input-glass h-14 font-bold rounded-2xl border-white/10 focus:border-gold/50 opacity-80"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                    <Button
                        variant="ghost"
                        disabled={loading}
                        onClick={() => setOpen(false)}
                        className="flex-1 h-14 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] h-14 premium-button rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin mr-3" />}
                        {loading ? "Traitement..." : "Confirmer l'ajout"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
