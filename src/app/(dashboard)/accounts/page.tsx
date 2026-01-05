import { CreditCard, Plus, Building2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccountsPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Comptes</h1>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
                        Gérez vos connexions bancaires
                    </p>
                </div>
                <Button className="premium-button rounded-xl px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Connecter une banque
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Solde Total Card */}
                <div className="col-span-1 md:col-span-3 rounded-[2rem] glass-card p-8 border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-32 h-32 text-gold rotate-[-15deg]" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Solde Total Cash</h3>
                        <div className="text-4xl font-black text-white tracking-tighter">0,00 €</div>
                    </div>
                </div>

                {/* Empty State / List */}
                <div className="col-span-1 md:col-span-3 flex flex-col items-center justify-center py-32 rounded-[2.5rem] glass-card border-dashed">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-8">
                        <Building2 className="w-6 h-6 text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">Aucun compte connecté</h3>
                    <p className="text-zinc-500 max-w-sm text-center text-xs font-medium leading-relaxed uppercase tracking-widest opacity-60">
                        Connectez vos comptes bancaires pour synchroniser automatiquement vos soldes et transactions.
                    </p>
                </div>
            </div>
        </div>
    )
}
