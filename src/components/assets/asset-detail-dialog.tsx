"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Asset } from "@/types"
import { KeyMetrics } from "@/components/research/key-metrics"
import { PriceChart } from "@/components/research/price-chart"
import { QuantAnalysis } from "@/components/research/quant-analysis"
import { QuantToolsGuide } from "@/components/research/quant-tools-guide"
import { AssetIcon } from "@/components/ui/asset-icon"
import { InvestmentAccountBadge } from "@/components/assets/investment-account-selector"
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    Brain,
    Pencil,
    ExternalLink,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EditAssetDialog } from "./edit-asset-dialog"

interface AssetDetailDialogProps {
    asset: Asset
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AssetDetailDialog({ asset, open, onOpenChange }: AssetDetailDialogProps) {
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [activeTab, setActiveTab] = useState<"overview" | "analysis">("overview")

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: asset.currency || 'EUR' }).format(val)

    const formatPercent = (val: number) =>
        `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`

    const hasSymbol = asset.symbol && asset.valuation_mode === 'auto'

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] glass-card border-white/10 p-0 overflow-hidden">
                    {/* Visually hidden title for accessibility */}
                    <DialogTitle className="sr-only">{asset.name} - Détails de l'actif</DialogTitle>

                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <AssetIcon
                                    symbol={asset.symbol}
                                    type={asset.type}
                                    name={asset.name}
                                    image={asset.image}
                                    id={asset.id}
                                />
                                <div>
                                    <h2 className="text-2xl font-black text-white">{asset.name}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        {asset.symbol && (
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                                {asset.symbol}
                                            </span>
                                        )}
                                        {asset.investment_account && (
                                            <InvestmentAccountBadge account={asset.investment_account} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEditDialog(true)}
                                    className="text-zinc-400 hover:text-white"
                                >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Modifier
                                </Button>
                                {hasSymbol && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(`/recherche?symbol=${asset.symbol}`, '_blank')}
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Recherche
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Value Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Valeur Actuelle</p>
                                <p className="text-xl font-black text-white">{formatCurrency(asset.current_value || 0)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Quantité</p>
                                <p className="text-xl font-black text-white">{asset.quantity}</p>
                            </div>
                            {asset.pru != null && (
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">PRU</p>
                                    <p className="text-xl font-black text-white">{formatCurrency(asset.pru)}</p>
                                </div>
                            )}
                            {asset.pnl_percent != null && (
                                <div className={cn(
                                    "p-4 rounded-xl border",
                                    asset.pnl_percent >= 0
                                        ? "bg-emerald-500/10 border-emerald-500/20"
                                        : "bg-rose-500/10 border-rose-500/20"
                                )}>
                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Performance</p>
                                    <div className="flex items-center gap-2">
                                        {asset.pnl_percent >= 0 ? (
                                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <TrendingDown className="w-5 h-5 text-rose-400" />
                                        )}
                                        <span className={cn(
                                            "text-xl font-black",
                                            asset.pnl_percent >= 0 ? "text-emerald-400" : "text-rose-400"
                                        )}>
                                            {formatPercent(asset.pnl_percent)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs - only show if has symbol for analysis */}
                        {hasSymbol && (
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={() => setActiveTab("overview")}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === "overview"
                                            ? "bg-white text-black"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Aperçu
                                </button>
                                <button
                                    onClick={() => setActiveTab("analysis")}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === "analysis"
                                            ? "bg-gold text-black"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Brain className="w-4 h-4" />
                                    Analyse Quant
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
                        {hasSymbol ? (
                            activeTab === "overview" ? (
                                <div className="space-y-6">
                                    {/* Key Metrics */}
                                    <KeyMetrics symbol={asset.symbol!} />

                                    {/* Price Chart */}
                                    <div className="glass-card rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BarChart3 className="w-4 h-4 text-zinc-500" />
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                                Graphique
                                            </span>
                                        </div>
                                        <PriceChart symbol={asset.symbol!} currency={asset.currency} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <QuantAnalysis symbol={asset.symbol!} />
                                    <QuantToolsGuide />
                                </div>
                            )
                        ) : (
                            /* Manual valuation - show basic info */
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                                    <p className="text-zinc-400 text-sm mb-2">
                                        Cet actif utilise une valorisation manuelle.
                                    </p>
                                    <p className="text-zinc-600 text-xs">
                                        L'analyse quantitative est disponible uniquement pour les actifs avec suivi automatique des prix.
                                    </p>
                                </div>

                                {/* Purchase History if available */}
                                {asset.purchases && asset.purchases.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                            Historique des Achats
                                        </h4>
                                        <div className="space-y-2">
                                            {asset.purchases.map((purchase) => (
                                                <div
                                                    key={purchase.id}
                                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center"
                                                >
                                                    <div>
                                                        <span className="text-sm font-bold text-white">
                                                            {purchase.quantity} × {formatCurrency(purchase.unit_price)}
                                                        </span>
                                                        <p className="text-[10px] text-zinc-500 font-bold mt-1">
                                                            {purchase.purchase_date
                                                                ? new Date(purchase.purchase_date).toLocaleDateString('fr-FR')
                                                                : 'Date non définie'
                                                            }
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-bold text-zinc-400">
                                                        {formatCurrency(purchase.total_cost || (purchase.quantity * purchase.unit_price))}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <EditAssetDialog
                asset={asset}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />
        </>
    )
}
