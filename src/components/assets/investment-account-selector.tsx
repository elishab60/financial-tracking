"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FolderOpen, Plus, ChevronDown, Briefcase, PiggyBank, Wallet, Shield, TrendingUp, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { InvestmentAccount, InvestmentAccountType } from "@/types"
import { INVESTMENT_ACCOUNT_TYPES, getBrokerById } from "@/lib/data/brokers"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

interface InvestmentAccountSelectorProps {
    accounts: InvestmentAccount[]
    value?: string
    onSelect: (accountId: string | null) => void
    onCreateNew?: () => void
    className?: string
}

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
    pea: <TrendingUp className="w-4 h-4" />,
    pea_pme: <TrendingUp className="w-4 h-4" />,
    cto: <Briefcase className="w-4 h-4" />,
    pee: <Building2 className="w-4 h-4" />,
    perco: <PiggyBank className="w-4 h-4" />,
    per: <PiggyBank className="w-4 h-4" />,
    assurance_vie: <Shield className="w-4 h-4" />,
    crypto: <Wallet className="w-4 h-4" />,
    other: <FolderOpen className="w-4 h-4" />,
}

const ACCOUNT_COLORS: Record<string, string> = {
    pea: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pea_pme: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cto: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    pee: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    perco: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    per: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    assurance_vie: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    crypto: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    other: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
}

export function InvestmentAccountSelector({
    accounts,
    value,
    onSelect,
    onCreateNew,
    className
}: InvestmentAccountSelectorProps) {
    const selectedAccount = value ? accounts.find(a => a.id === value) : null
    const accountType = INVESTMENT_ACCOUNT_TYPES.find(t => t.id === selectedAccount?.account_type)

    const formatValue = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

    return (
        <Select value={value || "__none__"} onValueChange={(val) => onSelect(val === "__none__" ? null : val)}>
            <SelectTrigger className={cn(
                "h-14 px-4 bg-white/[0.03] border-white/10 rounded-2xl",
                "hover:border-white/20 hover:bg-white/[0.05] transition-all",
                className
            )}>
                <SelectValue placeholder={
                    <div className="flex items-center gap-3 text-zinc-500">
                        <FolderOpen className="w-4 h-4" />
                        <span className="font-medium text-sm">Aucun compte</span>
                    </div>
                }>
                    {selectedAccount && (
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center border",
                                ACCOUNT_COLORS[selectedAccount.account_type] || ACCOUNT_COLORS.other
                            )}>
                                {ACCOUNT_ICONS[selectedAccount.account_type] || ACCOUNT_ICONS.other}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-white text-sm">{selectedAccount.name}</span>
                                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                    {accountType?.name}
                                    {selectedAccount.broker_name && ` • ${selectedAccount.broker_name}`}
                                </span>
                            </div>
                        </div>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10 backdrop-blur-xl p-2 min-w-[280px]">
                {/* No account option */}
                <SelectItem value="__none__" className="p-3 rounded-xl hover:bg-white/[0.05] cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center border border-white/10">
                            <FolderOpen className="w-4 h-4 text-zinc-500" />
                        </div>
                        <span className="font-medium text-zinc-400 text-sm">Aucun compte</span>
                    </div>
                </SelectItem>

                {accounts.length > 0 && (
                    <div className="h-px bg-white/5 my-2" />
                )}

                {/* Account list */}
                {accounts.map((account) => {
                    const type = INVESTMENT_ACCOUNT_TYPES.find(t => t.id === account.account_type)
                    const broker = account.broker_id ? getBrokerById(account.broker_id) : null

                    return (
                        <SelectItem
                            key={account.id}
                            value={account.id}
                            className="p-3 rounded-xl hover:bg-white/[0.05] cursor-pointer"
                        >
                            <div className="flex items-center gap-3 w-full">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0",
                                    ACCOUNT_COLORS[account.account_type] || ACCOUNT_COLORS.other
                                )}>
                                    {ACCOUNT_ICONS[account.account_type] || ACCOUNT_ICONS.other}
                                </div>
                                <div className="flex flex-col items-start flex-1 min-w-0">
                                    <span className="font-bold text-white text-sm truncate">{account.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                            {type?.name}
                                        </span>
                                        {(broker || account.broker_name) && (
                                            <>
                                                <span className="text-zinc-600">•</span>
                                                <span className="text-[10px] text-zinc-500 truncate">
                                                    {broker?.name || account.broker_name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {account.total_value != null && account.total_value > 0 && (
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-xs font-bold text-zinc-400">
                                            {formatValue(account.total_value)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </SelectItem>
                    )
                })}

                {/* Create new account option */}
                {onCreateNew && (
                    <>
                        <div className="h-px bg-white/5 my-2" />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onCreateNew()
                            }}
                            className="w-full p-3 rounded-xl hover:bg-gold/10 transition-all flex items-center gap-3 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/20">
                                <Plus className="w-4 h-4 text-gold" />
                            </div>
                            <span className="font-bold text-gold text-sm">Créer un nouveau compte</span>
                        </button>
                    </>
                )}
            </SelectContent>
        </Select>
    )
}

// Badge component for displaying account type in tables
export function InvestmentAccountBadge({ account }: { account?: InvestmentAccount }) {
    if (!account) return null

    const type = INVESTMENT_ACCOUNT_TYPES.find(t => t.id === account.account_type)
    const broker = account.broker_id ? getBrokerById(account.broker_id) : null

    return (
        <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
            ACCOUNT_COLORS[account.account_type] || ACCOUNT_COLORS.other
        )}>
            {ACCOUNT_ICONS[account.account_type] || ACCOUNT_ICONS.other}
            <span>{type?.name || account.account_type}</span>
            {(broker || account.broker_name) && (
                <>
                    <span className="opacity-50">•</span>
                    <span className="opacity-80">{broker?.name || account.broker_name}</span>
                </>
            )}
        </div>
    )
}
