"use client"

import { useState, useEffect } from "react"
import { Asset, InvestmentAccount } from "@/types"
import { getInvestmentAccounts } from "@/app/actions/investment-accounts"
import { updateAsset } from "@/app/actions/assets"
import { INVESTMENT_ACCOUNT_TYPES, getBrokerById } from "@/lib/data/brokers"
import { motion, AnimatePresence } from "framer-motion"
import {
    ChevronDown,
    FolderOpen,
    TrendingUp,
    Briefcase,
    PiggyBank,
    Shield,
    Wallet,
    Building2,
    Plus,
    GripVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AssetIcon } from "@/components/ui/asset-icon"
import { AssetActions } from "@/components/assets/asset-actions"
import { InvestmentAccountDialog } from "@/components/assets/investment-account-dialog"
import { toast } from "sonner"

interface AccountsGroupedViewProps {
    assets: Asset[]
}

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
    pea: <TrendingUp className="w-5 h-5" />,
    pea_pme: <TrendingUp className="w-5 h-5" />,
    cto: <Briefcase className="w-5 h-5" />,
    pee: <Building2 className="w-5 h-5" />,
    perco: <PiggyBank className="w-5 h-5" />,
    per: <PiggyBank className="w-5 h-5" />,
    assurance_vie: <Shield className="w-5 h-5" />,
    crypto: <Wallet className="w-5 h-5" />,
    other: <FolderOpen className="w-5 h-5" />,
}

const ACCOUNT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    pea: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
    pea_pme: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
    cto: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
    pee: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" },
    perco: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
    per: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
    assurance_vie: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
    crypto: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" },
    other: { bg: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-zinc-400" },
}

export function AccountsGroupedView({ assets }: AccountsGroupedViewProps) {
    const [accounts, setAccounts] = useState<InvestmentAccount[]>([])
    const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [draggingAsset, setDraggingAsset] = useState<string | null>(null)
    const [dragOverAccount, setDragOverAccount] = useState<string | null>(null)

    useEffect(() => {
        loadAccounts()
    }, [])

    const loadAccounts = async () => {
        const data = await getInvestmentAccounts()
        setAccounts(data)
        // Expand all accounts by default
        setExpandedAccounts(new Set(data.map(a => a.id)))
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

    // Group assets by account
    const assetsByAccount = new Map<string | null, Asset[]>()

    // Initialize with all accounts
    accounts.forEach(account => {
        assetsByAccount.set(account.id, [])
    })
    assetsByAccount.set(null, []) // Unassigned

    // Group assets
    assets.forEach(asset => {
        const accountId = asset.investment_account_id || null
        const existing = assetsByAccount.get(accountId) || []
        existing.push(asset)
        assetsByAccount.set(accountId, existing)
    })

    // Calculate totals per account
    const getAccountTotal = (accountId: string | null) => {
        const accountAssets = assetsByAccount.get(accountId) || []
        return accountAssets.reduce((sum, asset) => sum + (asset.current_value || 0), 0)
    }

    const toggleAccount = (accountId: string) => {
        const newExpanded = new Set(expandedAccounts)
        if (newExpanded.has(accountId)) {
            newExpanded.delete(accountId)
        } else {
            newExpanded.add(accountId)
        }
        setExpandedAccounts(newExpanded)
    }

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, assetId: string) => {
        e.dataTransfer.setData("assetId", assetId)
        setDraggingAsset(assetId)
    }

    const handleDragEnd = () => {
        setDraggingAsset(null)
        setDragOverAccount(null)
    }

    const handleDragOver = (e: React.DragEvent, accountId: string | null) => {
        e.preventDefault()
        setDragOverAccount(accountId)
    }

    const handleDrop = async (e: React.DragEvent, accountId: string | null) => {
        e.preventDefault()
        const assetId = e.dataTransfer.getData("assetId")

        if (assetId) {
            try {
                await updateAsset(assetId, { investment_account_id: accountId })
                toast.success("Actif déplacé avec succès")
                // Reload to reflect changes
                window.location.reload()
            } catch (error) {
                toast.error("Erreur lors du déplacement")
            }
        }

        setDraggingAsset(null)
        setDragOverAccount(null)
    }

    // Sort accounts by total value (highest first)
    const sortedAccounts = [...accounts].sort((a, b) => getAccountTotal(b.id) - getAccountTotal(a.id))

    return (
        <div className="space-y-6">
            {/* Account Cards */}
            {sortedAccounts.map((account) => {
                const accountAssets = assetsByAccount.get(account.id) || []
                const total = getAccountTotal(account.id)
                const type = INVESTMENT_ACCOUNT_TYPES.find(t => t.id === account.account_type)
                const broker = account.broker_id ? getBrokerById(account.broker_id) : null
                const colors = ACCOUNT_COLORS[account.account_type] || ACCOUNT_COLORS.other
                const isExpanded = expandedAccounts.has(account.id)
                const isDragOver = dragOverAccount === account.id

                return (
                    <motion.div
                        key={account.id}
                        layout
                        onDragOver={(e) => handleDragOver(e, account.id)}
                        onDrop={(e) => handleDrop(e, account.id)}
                        className={cn(
                            "rounded-[2rem] glass-card overflow-hidden transition-all duration-300",
                            isDragOver && "ring-2 ring-gold/50 bg-gold/5"
                        )}
                    >
                        {/* Account Header */}
                        <div
                            onClick={() => toggleAccount(account.id)}
                            className={cn(
                                "p-6 flex items-center gap-4 cursor-pointer transition-all",
                                "hover:bg-white/[0.02]",
                                colors.bg
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center border",
                                colors.bg, colors.border, colors.text
                            )}>
                                {ACCOUNT_ICONS[account.account_type] || ACCOUNT_ICONS.other}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-black text-white truncate">{account.name}</h3>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border",
                                        colors.bg, colors.border, colors.text
                                    )}>
                                        {type?.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                        {broker?.name || account.broker_name || "Non spécifié"}
                                    </span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-[10px] text-zinc-500 font-bold">
                                        {accountAssets.length} actif{accountAssets.length > 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-black text-white">{formatCurrency(total)}</div>
                            </div>

                            <ChevronDown className={cn(
                                "w-5 h-5 text-zinc-500 transition-transform",
                                isExpanded && "rotate-180"
                            )} />
                        </div>

                        {/* Assets List */}
                        <AnimatePresence>
                            {isExpanded && accountAssets.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-white/5"
                                >
                                    <div className="divide-y divide-white/[0.03]">
                                        {accountAssets.map((asset) => (
                                            <div
                                                key={asset.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, asset.id)}
                                                onDragEnd={handleDragEnd}
                                                className={cn(
                                                    "p-4 pl-8 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group cursor-grab active:cursor-grabbing",
                                                    draggingAsset === asset.id && "opacity-50"
                                                )}
                                            >
                                                <GripVertical className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <AssetIcon
                                                    symbol={asset.symbol}
                                                    type={asset.type}
                                                    name={asset.name}
                                                    image={asset.image}
                                                    id={asset.id}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-white text-sm">{asset.name}</span>
                                                    {asset.symbol && (
                                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest ml-2">
                                                            {asset.symbol}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-white text-sm">
                                                        {formatCurrency(asset.current_value || 0)}
                                                    </div>
                                                    {asset.pnl_percent != null && (
                                                        <div className={cn(
                                                            "text-[10px] font-black",
                                                            (asset.pnl_percent || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                                                        )}>
                                                            {(asset.pnl_percent || 0) >= 0 ? "+" : ""}{asset.pnl_percent?.toFixed(2)}%
                                                        </div>
                                                    )}
                                                </div>
                                                <AssetActions asset={asset} />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Empty State */}
                        {isExpanded && accountAssets.length === 0 && (
                            <div className="p-8 text-center border-t border-white/5">
                                <p className="text-zinc-500 text-sm">Aucun actif dans ce compte</p>
                                <p className="text-zinc-600 text-xs mt-1">Glissez un actif ici pour l'ajouter</p>
                            </div>
                        )}
                    </motion.div>
                )
            })}

            {/* Unassigned Assets */}
            {(() => {
                const unassignedAssets = assetsByAccount.get(null) || []
                if (unassignedAssets.length === 0 && accounts.length > 0) return null

                return (
                    <motion.div
                        layout
                        onDragOver={(e) => handleDragOver(e, null)}
                        onDrop={(e) => handleDrop(e, null)}
                        className={cn(
                            "rounded-[2rem] glass-card overflow-hidden transition-all duration-300 border-dashed",
                            dragOverAccount === null && draggingAsset && "ring-2 ring-zinc-500/50 bg-zinc-500/5"
                        )}
                    >
                        <div className="p-6 flex items-center gap-4 bg-zinc-500/5">
                            <div className="w-12 h-12 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center">
                                <FolderOpen className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-zinc-400">Non assignés</h3>
                                <span className="text-[10px] text-zinc-600 font-bold">
                                    {unassignedAssets.length} actif{unassignedAssets.length > 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="text-2xl font-black text-zinc-400">
                                {formatCurrency(getAccountTotal(null))}
                            </div>
                        </div>

                        {unassignedAssets.length > 0 && (
                            <div className="divide-y divide-white/[0.03] border-t border-white/5">
                                {unassignedAssets.map((asset) => (
                                    <div
                                        key={asset.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, asset.id)}
                                        onDragEnd={handleDragEnd}
                                        className={cn(
                                            "p-4 pl-8 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group cursor-grab active:cursor-grabbing",
                                            draggingAsset === asset.id && "opacity-50"
                                        )}
                                    >
                                        <GripVertical className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <AssetIcon
                                            symbol={asset.symbol}
                                            type={asset.type}
                                            name={asset.name}
                                            image={asset.image}
                                            id={asset.id}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-white text-sm">{asset.name}</span>
                                            {asset.symbol && (
                                                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest ml-2">
                                                    {asset.symbol}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white text-sm">
                                                {formatCurrency(asset.current_value || 0)}
                                            </div>
                                        </div>
                                        <AssetActions asset={asset} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )
            })()}

            {/* Create Account Button */}
            <button
                onClick={() => setShowCreateDialog(true)}
                className="w-full p-6 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-gold/30 hover:bg-gold/5 transition-all flex items-center justify-center gap-3 group"
            >
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-gold" />
                </div>
                <span className="text-sm font-bold text-zinc-400 group-hover:text-gold transition-colors">
                    Créer un nouveau compte
                </span>
            </button>

            <InvestmentAccountDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={loadAccounts}
            />
        </div>
    )
}
