import { getDashboardStats } from "@/app/actions/dashboard"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { NetWorthChart } from "@/components/dashboard/net-worth-chart"
import { AllocationDonut } from "@/components/dashboard/allocation-donut"
import { PerformanceWidget } from "@/components/dashboard/performance-widget"
import { Button } from "@/components/ui/button"
import { RefreshCcw, Download, PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Tableau de bord
                    </h1>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
                        Gestion de patrimoine privée
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-xl uppercase tracking-widest">
                        <RefreshCcw className="w-3.5 h-3.5" />
                        Actualiser
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-xl uppercase tracking-widest">
                        <Download className="w-3.5 h-3.5" />
                        Exporter
                    </button>
                </div>
            </div>

            <KPICards stats={stats} />

            {stats.totalAssets === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 rounded-[3rem] glass-card">
                    <div className="w-20 h-20 rounded-3xl premium-bg p-[1px] shadow-2xl mb-10">
                        <div className="w-full h-full rounded-3xl bg-[#080808] flex items-center justify-center">
                            <PlusCircle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-[0.1em]">Initialisation requise</h3>
                    <p className="text-zinc-500 max-w-sm text-center mb-12 font-medium text-xs leading-relaxed uppercase tracking-wider">
                        Veuillez configurer votre premier actif pour commencer le suivi de votre patrimoine.
                    </p>
                    <Link href="/assets">
                        <Button className="w-full sm:w-auto h-12 px-10 bg-white text-black font-bold uppercase tracking-[0.15em] rounded-xl hover:bg-zinc-200 transition-all shadow-xl">
                            Démarrer le suivi
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Performance Widget - NEW */}
                    <PerformanceWidget stats={stats} />

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <NetWorthChart />
                        <AllocationDonut data={stats.allocation} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <h2 className="text-lg font-bold text-white mb-4">Dernières transactions</h2>
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                                    <RefreshCcw className="w-6 h-6 text-zinc-500" />
                                </div>
                                <p className="text-sm text-zinc-400 font-medium">Aucune transaction récente</p>
                                <p className="text-xs text-zinc-600 mt-1">Connectez un compte pour voir vos transactions.</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <h2 className="text-lg font-bold text-white mb-4">Top Positions</h2>
                            <div className="space-y-4">
                                {stats.topPositions.map((pos) => (
                                    <div key={pos.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center font-bold text-xs uppercase">
                                                {pos.name.slice(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{pos.name}</h4>
                                                <p className="text-xs text-zinc-500 font-medium tracking-wider">POSITION</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-white">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(pos.value)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

