"use client"

import { useState, useEffect, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Search, TrendingUp, TrendingDown, Target, Sparkles, Loader2, Calendar, DollarSign, ShoppingCart, Trash2, Pencil } from "lucide-react"

import { updateAsset, deleteAsset } from "@/app/actions/assets"
import { deletePurchase } from "@/app/actions/purchases"
import { AddPurchaseDialog } from "./add-purchase-dialog"
import { EditPurchaseDialog } from "./edit-purchase-dialog"
import { toast } from "sonner"
import { Asset, AssetType, AssetPurchase } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface EditAssetDialogProps {
    asset: Asset
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditAssetDialog({ asset, open, onOpenChange }: EditAssetDialogProps) {
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [quote, setQuote] = useState<any>(null)
    const [showResults, setShowResults] = useState(false)
    const [searchQuery, setSearchQuery] = useState(asset.symbol || '')
    const [historicalPrice, setHistoricalPrice] = useState<number | null>(null)
    const [loadingHistorical, setLoadingHistorical] = useState(false)
    const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false)
    const [editingPurchase, setEditingPurchase] = useState<any | null>(null)
    const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: asset.name,
        type: asset.type,
        symbol: asset.symbol || '',
        quantity: asset.quantity,
        manual_value: asset.manual_value || 0,
        buy_price: asset.buy_price,
        buy_date: asset.buy_date?.split('T')[0] || '', // Use stored buy_date
        fees: asset.fees || 0,
        currency: asset.currency,
        valuation_mode: asset.valuation_mode
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

    useEffect(() => {
        if (open) {
            setFormData({
                name: asset.name,
                type: asset.type,
                symbol: asset.symbol || '',
                quantity: asset.quantity,
                manual_value: asset.manual_value || 0,
                buy_price: asset.buy_price,
                buy_date: asset.buy_date?.split('T')[0] || '',
                fees: asset.fees || 0,
                currency: asset.currency,
                valuation_mode: asset.valuation_mode
            })
            setSearchQuery(asset.symbol || '')
            if (asset.symbol && asset.valuation_mode === 'auto') {
                fetchQuote(asset.symbol)
            } else {
                setQuote(null)
            }
        }
    }, [open, asset])

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([])
            setShowResults(false)
            return
        }

        // Optimization: Don't auto-search for the current symbol (initial state)
        if (searchQuery === asset.symbol) {
            setSearchResults([])
            setShowResults(false)
            return
        }

        const timer = setTimeout(async () => {
            setSearching(true)
            try {
                const res = await fetch(`/api/finance/search?q=${searchQuery}`)
                if (!res.ok) return
                const data = await res.json()
                setSearchResults(data.results || [])
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

            // Auto-detect type
            let autoType: AssetType = formData.type
            const symbolUpper = symbol.toUpperCase()
            if (symbolUpper.endsWith('-USD') || symbolUpper.endsWith('-EUR') || symbolUpper.endsWith('BTC') || symbolUpper.endsWith('ETH')) {
                autoType = 'crypto'
            }

            setFormData(prev => ({
                ...prev,
                name: data.shortName || data.longName || symbol,
                symbol: symbol,
                type: autoType,
                valuation_mode: 'auto',
                currency: data.currency === 'USD' ? 'USD' : 'EUR'
            }))
        } catch (err: any) {
            console.error("Quote error:", err)
            // If quote fails, we might want to reset quote state to show manual form
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
            await updateAsset(asset.id, formData)
            toast.success("Actif mis à jour avec succès")
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour")
        } finally {
            setLoading(false)
        }
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
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="sm:max-w-[500px] glass-card border-white/10 p-0 overflow-hidden"
                >
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-premium flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                    <Sparkles className="w-6 h-6 text-gold" />
                                </div>
                                Modifier l'Actif
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Unified Search Field */}
                            <div className="space-y-3 relative" ref={searchWrapperRef}>
                                <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold ml-1">Modifier l'actif ou le symbole</Label>
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
                                            key="search-results-popover"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute z-[100] w-full mt-2 bg-zinc-950 border border-white/10 max-h-[280px] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-2"
                                        >
                                            {searchResults.map((result, i) => (
                                                <div
                                                    key={`edit-result-${result.symbol || i}`}
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
                                            key="analysis-quote"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-5"
                                        >
                                            <div className="p-5 rounded-3xl glass-card border-gold/20 bg-linear-to-br from-gold/10 to-transparent space-y-5">
                                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Cote en temps réel</span>
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
                                                        💡 Potentiel de croissance estimé à <span className="text-gold font-black">{((quote.targetMeanPrice / quote.regularMarketPrice - 1) * 100).toFixed(1)}%</span>.
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="analysis-manual"
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
                                    <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">Valorisation</Label>
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

                            {/* Purchases List - for auto mode assets */}
                            {formData.valuation_mode === 'auto' && (
                                <div className="space-y-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Historique des Achats</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddPurchaseOpen(true)}
                                            className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-1"
                                        >
                                            <ShoppingCart className="w-3 h-3" />
                                            + Ajouter
                                        </button>
                                    </div>

                                    {/* PRU Summary */}
                                    {asset.pru != null && (
                                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-center">
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">PRU (Prix Moyen)</span>
                                            <span className="text-sm font-black text-emerald-400">
                                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: asset.currency }).format(asset.pru)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Purchases List */}
                                    {asset.purchases && asset.purchases.length > 0 ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {asset.purchases.map((purchase: AssetPurchase) => (
                                                <div key={purchase.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center group hover:border-white/10 transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-white">
                                                            {purchase.quantity} × {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: asset.currency }).format(purchase.unit_price)}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-500 font-bold">
                                                            {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('fr-FR') : 'Date non définie'}
                                                            {purchase.fees > 0 && ` • Frais: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: asset.currency }).format(purchase.fees)}`}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-zinc-400">
                                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: asset.currency }).format(purchase.total_cost || (purchase.quantity * purchase.unit_price + (purchase.fees || 0)))}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingPurchase(purchase)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-gold/10 text-zinc-500 hover:text-gold transition-all"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={deletingPurchaseId === purchase.id}
                                                            onClick={async () => {
                                                                setDeletingPurchaseId(purchase.id)
                                                                try {
                                                                    await deletePurchase(purchase.id)
                                                                    toast.success("Achat supprimé")
                                                                } catch (err: any) {
                                                                    toast.error(err.message || "Erreur lors de la suppression")
                                                                } finally {
                                                                    setDeletingPurchaseId(null)
                                                                }
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-all"
                                                        >
                                                            {deletingPurchaseId === purchase.id ? (
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                                Aucun achat enregistré
                                            </p>
                                            <p className="text-[9px] text-zinc-600 mt-1">
                                                Cliquez sur "+ Ajouter" pour enregistrer votre premier achat
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                        <Button
                            variant="ghost"
                            disabled={loading}
                            onClick={() => onOpenChange(false)}
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
                            {loading ? "Mise à jour..." : "Enregistrer les modifications"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >

            <AddPurchaseDialog
                asset={asset}
                open={isAddPurchaseOpen}
                onOpenChange={setIsAddPurchaseOpen}
            />

            {
                editingPurchase && (
                    <EditPurchaseDialog
                        asset={asset}
                        purchase={editingPurchase!}
                        open={!!editingPurchase}
                        onOpenChange={(open) => !open && setEditingPurchase(null)}
                    />
                )
            }
        </>
    )
}
