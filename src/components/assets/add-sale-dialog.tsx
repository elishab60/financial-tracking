"use client"

import { useState, useEffect } from "react"
import { Asset } from "@/types"
import { addSale } from "@/app/actions/sales"
import { calculatePRU } from "@/app/actions/purchases"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    TrendingDown,
    Calculator,
    DollarSign,
    Calendar,
    Coins,
    AlertCircle,
    CheckCircle2,
    Wallet
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AddSaleDialogProps {
    asset: Asset
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function AddSaleDialog({ asset, open, onOpenChange, onSuccess }: AddSaleDialogProps) {
    const [loading, setLoading] = useState(false)
    const [pru, setPru] = useState<number>(0)

    // Form state
    const [quantity, setQuantity] = useState<string>("")
    const [unitPrice, setUnitPrice] = useState<string>("")
    const [fees, setFees] = useState<string>("0")
    const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState<string>("")
    const [addToCash, setAddToCash] = useState<boolean>(true)

    // Load PRU when dialog opens
    useEffect(() => {
        if (open && asset.id) {
            calculatePRU(asset.id).then(data => {
                setPru(data.pru)
            }).catch(() => {
                setPru(asset.pru || 0)
            })
        }
    }, [open, asset.id, asset.pru])

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setQuantity("")
            setUnitPrice(asset.current_price?.toString() || "")
            setFees("0")
            setSaleDate(new Date().toISOString().split('T')[0])
            setNotes("")
            setAddToCash(true)
        }
    }, [open, asset.current_price])

    // Calculations
    const quantityNum = parseFloat(quantity) || 0
    const unitPriceNum = parseFloat(unitPrice) || 0
    const feesNum = parseFloat(fees) || 0

    const totalProceeds = (quantityNum * unitPriceNum) - feesNum
    const costBasis = quantityNum * pru
    const estimatedPnl = totalProceeds - costBasis
    const pnlPercent = costBasis > 0 ? ((estimatedPnl / costBasis) * 100) : 0

    const maxQuantity = asset.quantity || 0
    const isValidQuantity = quantityNum > 0 && quantityNum <= maxQuantity

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isValidQuantity) {
            toast.error("Quantité invalide")
            return
        }

        setLoading(true)
        try {
            await addSale(asset.id, {
                quantity: quantityNum,
                unit_price: unitPriceNum,
                fees: feesNum,
                sale_date: saleDate || undefined,
                notes: notes || undefined,
                add_to_cash: addToCash
            })

            toast.success("Vente enregistrée avec succès")
            onOpenChange(false)
            onSuccess?.()

            // Reload to reflect changes
            window.location.reload()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'enregistrement")
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: asset.currency || 'EUR' }).format(val)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <span className="text-white">Vendre {asset.name}</span>
                            {asset.symbol && (
                                <span className="text-zinc-500 font-normal text-sm ml-2">{asset.symbol}</span>
                            )}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Current Holdings Info */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Position actuelle</span>
                            <span className="text-sm font-bold text-white">
                                {maxQuantity % 1 === 0 ? maxQuantity : maxQuantity.toFixed(4)} actions
                            </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">PRU</span>
                            <span className="text-sm font-bold text-white">{formatCurrency(pru)}</span>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-zinc-400">Quantité à vendre</Label>
                            <button
                                type="button"
                                onClick={() => setQuantity(maxQuantity.toString())}
                                className="text-[10px] font-bold text-gold hover:text-gold/80 transition-colors"
                            >
                                Tout vendre
                            </button>
                        </div>
                        <Input
                            type="number"
                            step="any"
                            min="0"
                            max={maxQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder={`Max: ${maxQuantity}`}
                            className="bg-black/30 border-white/10"
                            required
                        />
                        {quantityNum > maxQuantity && (
                            <p className="text-[10px] text-rose-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Quantité supérieure à votre position
                            </p>
                        )}
                    </div>

                    {/* Unit Price */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Prix de vente unitaire</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                                type="number"
                                step="any"
                                min="0"
                                value={unitPrice}
                                onChange={(e) => setUnitPrice(e.target.value)}
                                className="pl-10 bg-black/30 border-white/10"
                                placeholder="Prix par action"
                                required
                            />
                        </div>
                    </div>

                    {/* Fees */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Frais de transaction</Label>
                        <Input
                            type="number"
                            step="any"
                            min="0"
                            value={fees}
                            onChange={(e) => setFees(e.target.value)}
                            className="bg-black/30 border-white/10"
                            placeholder="0"
                        />
                    </div>

                    {/* Sale Date */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date de vente
                        </Label>
                        <Input
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            className="bg-black/30 border-white/10"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Notes (optionnel)</Label>
                        <Textarea
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                            className="bg-black/30 border-white/10 min-h-[60px]"
                            placeholder="Raison de la vente, stratégie..."
                        />
                    </div>

                    {/* Add to Cash Balance Toggle */}
                    {asset.investment_account_id && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">
                                    Ajouter au solde cash du compte
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAddToCash(!addToCash)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    addToCash ? "bg-emerald-500" : "bg-zinc-700"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                                    addToCash ? "translate-x-6" : "translate-x-0.5"
                                )} />
                            </button>
                        </div>
                    )}

                    {/* P&L Preview */}
                    {quantityNum > 0 && unitPriceNum > 0 && (
                        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <Calculator className="w-4 h-4 text-gold" />
                                <span className="text-[10px] font-black text-gold uppercase tracking-widest">
                                    Résumé de la vente
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Produit brut</p>
                                    <p className="text-lg font-bold text-white">{formatCurrency(quantityNum * unitPriceNum)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Produit net (- frais)</p>
                                    <p className="text-lg font-bold text-white">{formatCurrency(totalProceeds)}</p>
                                </div>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Coût de base (PRU)</p>
                                    <p className="text-sm font-bold text-zinc-400">{formatCurrency(costBasis)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Plus/Moins-value</p>
                                    <div className="flex items-center gap-2">
                                        <p className={cn(
                                            "text-lg font-black",
                                            estimatedPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                                        )}>
                                            {estimatedPnl >= 0 ? "+" : ""}{formatCurrency(estimatedPnl)}
                                        </p>
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                            estimatedPnl >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                        )}>
                                            {estimatedPnl >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !isValidQuantity || unitPriceNum <= 0}
                            className="flex-1 bg-rose-500 hover:bg-rose-600"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enregistrement...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Confirmer la vente
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
