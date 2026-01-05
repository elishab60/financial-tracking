"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Calendar, DollarSign, ShoppingCart } from "lucide-react"
import { addPurchase } from "@/app/actions/purchases"
import { toast } from "sonner"
import { Asset } from "@/types"

interface AddPurchaseDialogProps {
    asset: Asset
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddPurchaseDialog({ asset, open, onOpenChange }: AddPurchaseDialogProps) {
    const [loading, setLoading] = useState(false)
    const [historicalPrice, setHistoricalPrice] = useState<number | null>(null)
    const [loadingHistorical, setLoadingHistorical] = useState(false)

    const [formData, setFormData] = useState({
        quantity: 0,
        unit_price: undefined as number | undefined,
        purchase_date: new Date().toISOString().split('T')[0],
        fees: 0,
        notes: ''
    })

    useEffect(() => {
        if (open) {
            // Reset form when dialog opens
            setFormData({
                quantity: 0,
                unit_price: undefined,
                purchase_date: new Date().toISOString().split('T')[0],
                fees: 0,
                notes: ''
            })
            setHistoricalPrice(null)
        }
    }, [open])

    const fetchHistoricalPrice = async (date: string) => {
        if (!asset.symbol || !date) return

        setLoadingHistorical(true)
        try {
            const res = await fetch(`/api/finance/historical?symbol=${asset.symbol}&date=${date}`)
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

    const handleDateChange = (newDate: string) => {
        setFormData({ ...formData, purchase_date: newDate })
        if (asset.symbol && newDate) {
            fetchHistoricalPrice(newDate)
        }
    }

    const handleSubmit = async () => {
        if (!formData.quantity || formData.quantity <= 0) {
            toast.error("Veuillez définir une quantité valide")
            return
        }
        if (!formData.unit_price || formData.unit_price <= 0) {
            toast.error("Veuillez définir un prix unitaire valide")
            return
        }
        if (formData.fees != null && formData.fees < 0) {
            toast.error("Les frais ne peuvent pas être négatifs")
            return
        }

        setLoading(true)
        try {
            await addPurchase(asset.id, {
                quantity: formData.quantity,
                unit_price: formData.unit_price,
                fees: formData.fees || 0,
                purchase_date: formData.purchase_date || undefined,
                notes: formData.notes || undefined
            })
            toast.success("Achat ajouté avec succès")
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'ajout")
        } finally {
            setLoading(false)
        }
    }

    const totalCost = formData.quantity && formData.unit_price
        ? (formData.quantity * formData.unit_price) + (formData.fees || 0)
        : 0

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="max-w-md bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-3xl overflow-hidden p-0"
            >
                <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-white/[0.03] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-white uppercase tracking-wider">
                                Nouvel Achat
                            </DialogTitle>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                {asset.name} {asset.symbol && `(${asset.symbol})`}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 pt-4 space-y-6">
                    {/* Date */}
                    <div className="space-y-2">
                        <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Date d'achat
                        </Label>
                        <Input
                            type="date"
                            value={formData.purchase_date || ''}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="input-glass h-12 rounded-xl"
                        />
                        {loadingHistorical && (
                            <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Recherche du prix historique...
                            </div>
                        )}
                        {historicalPrice && !loadingHistorical && !formData.unit_price && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, unit_price: historicalPrice })}
                                className="text-[9px] text-emerald-400/80 hover:text-emerald-400 transition-colors font-bold uppercase tracking-widest flex items-center gap-1"
                            >
                                <DollarSign className="w-3 h-3" />
                                Prix du {formData.purchase_date}: {historicalPrice.toFixed(2)} → Utiliser
                            </button>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">
                            Quantité *
                        </Label>
                        <Input
                            type="number"
                            step="0.0001"
                            placeholder="0"
                            value={formData.quantity || ''}
                            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            className="input-glass h-12 rounded-xl font-bold text-lg"
                        />
                    </div>

                    {/* Unit Price */}
                    <div className="space-y-2">
                        <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                            <DollarSign className="w-3 h-3" />
                            Prix unitaire *
                        </Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder={historicalPrice?.toFixed(2) || "0.00"}
                            value={formData.unit_price ?? ''}
                            onChange={(e) => setFormData({ ...formData, unit_price: e.target.value ? Number(e.target.value) : undefined })}
                            className="input-glass h-12 rounded-xl font-bold"
                        />
                    </div>

                    {/* Fees */}
                    <div className="space-y-2">
                        <Label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest ml-1">
                            Frais (optionnel)
                        </Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.fees || ''}
                            onChange={(e) => setFormData({ ...formData, fees: Number(e.target.value) })}
                            className="input-glass h-12 rounded-xl"
                        />
                    </div>

                    {/* Total Preview */}
                    {totalCost > 0 && (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Coût Total</span>
                                <span className="text-lg font-black text-emerald-400">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: asset.currency }).format(totalCost)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 pt-0 flex gap-4">
                    <Button
                        variant="ghost"
                        disabled={loading}
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-12 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] h-12 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {loading ? "Ajout..." : "Ajouter l'achat"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
