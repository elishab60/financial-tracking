"use client"

import { useState } from "react"
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
import { BrokerSelector } from "@/components/ui/broker-selector"
import { INVESTMENT_ACCOUNT_TYPES, BrokerData } from "@/lib/data/brokers"
import { InvestmentAccountType } from "@/types"
import { addInvestmentAccount, updateInvestmentAccount } from "@/app/actions/investment-accounts"
import { toast } from "sonner"
import { Loader2, FolderPlus, Briefcase, TrendingUp, PiggyBank, Shield, Wallet, Building2, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface InvestmentAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    editAccount?: {
        id: string
        name: string
        account_type: InvestmentAccountType
        broker_id?: string
        broker_name?: string
        notes?: string
    }
}

export function InvestmentAccountDialog({
    open,
    onOpenChange,
    onSuccess,
    editAccount
}: InvestmentAccountDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: editAccount?.name || "",
        account_type: (editAccount?.account_type || "cto") as InvestmentAccountType,
        broker_id: editAccount?.broker_id || "",
        broker_name: editAccount?.broker_name || "",
        notes: editAccount?.notes || ""
    })

    const isEditing = !!editAccount

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error("Veuillez donner un nom au compte")
            return
        }

        setLoading(true)
        try {
            if (isEditing) {
                await updateInvestmentAccount(editAccount.id, formData)
                toast.success("Compte modifié avec succès")
            } else {
                await addInvestmentAccount(formData)
                toast.success("Compte créé avec succès")
            }
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'opération")
        } finally {
            setLoading(false)
        }
    }

    const handleBrokerSelect = (broker: BrokerData | null) => {
        if (broker) {
            setFormData({ ...formData, broker_id: broker.id, broker_name: broker.name })
        } else {
            setFormData({ ...formData, broker_id: "", broker_name: "" })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] glass-card border-white/10 p-0 overflow-hidden">
                <div className="p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-premium flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                                <FolderPlus className="w-5 h-5 text-gold" />
                            </div>
                            {isEditing ? "Modifier le compte" : "Nouveau compte"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                        {/* Account Name */}
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold ml-1">
                                Nom du compte
                            </Label>
                            <Input
                                placeholder="Ex: Mon PEA Boursorama"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-glass h-14 rounded-2xl text-lg font-bold"
                            />
                        </div>

                        {/* Account Type */}
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold ml-1">
                                Type de compte
                            </Label>
                            <Select
                                value={formData.account_type}
                                onValueChange={(val: InvestmentAccountType) => setFormData({ ...formData, account_type: val })}
                            >
                                <SelectTrigger className="h-14 px-4 bg-white/[0.03] border-white/10 rounded-2xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10 backdrop-blur-xl">
                                    {INVESTMENT_ACCOUNT_TYPES.map((type) => (
                                        <SelectItem key={type.id} value={type.id} className="p-3 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                                                    {ACCOUNT_ICONS[type.id]}
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="font-bold text-white text-sm">{type.name}</span>
                                                    <span className="text-[10px] text-zinc-500">{type.description}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Broker Selection */}
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold ml-1">
                                Courtier / Banque
                            </Label>
                            <BrokerSelector
                                value={formData.broker_id}
                                onSelect={handleBrokerSelect}
                            />
                        </div>

                        {/* Notes (optional) */}
                        <div className="space-y-2">
                            <Label className="text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-bold ml-1">
                                Notes (optionnel)
                            </Label>
                            <Input
                                placeholder="Notes personnelles..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="input-glass h-12 rounded-xl"
                            />
                        </div>
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
                        {loading ? "Traitement..." : (isEditing ? "Enregistrer" : "Créer le compte")}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
