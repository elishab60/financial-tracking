import { getBudgetData } from "@/app/actions/budget"
import { BudgetClient } from "./budget-client"

export default async function BudgetPage() {
    // Current month as fallback
    const currentMonth = new Date().toISOString().slice(0, 7)

    try {
        const budgetData = await getBudgetData(currentMonth)
        return (
            <div className="space-y-8">
                <BudgetClient initialData={budgetData} />
            </div>
        )
    } catch (error: any) {
        if (error.code === 'PGRST205' || error.message?.includes('budget_categories')) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                    <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-2">Configuration requise</h2>
                        <p className="text-zinc-400 mb-6">
                            Les tables de budget ne semblent pas encore présentes dans votre base de données Supabase.
                        </p>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-left mb-6">
                            <p className="text-xs font-mono text-zinc-500 mb-2"># SQL à exécuter dans Supabase :</p>
                            <pre className="text-xs font-mono text-cyan-400 overflow-x-auto">
                                {`-- Appliquez le fichier :
supabase/migrations/budget_tables.sql`}
                            </pre>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Une fois les tables créées, rafraîchissez cette page.
                        </p>
                    </div>
                </div>
            )
        }
        throw error
    }
}
