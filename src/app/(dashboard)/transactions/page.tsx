import { ArrowLeftRight, Download, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

export default function TransactionsPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Transactions</h1>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
                        Historique de vos mouvements
                    </p>
                </div>
                <Button variant="outline" className="h-12 border-white/10 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl px-6 text-[10px] font-bold uppercase tracking-widest">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Rechercher une transaction..."
                        className="input-glass h-12 rounded-xl pl-12 pr-4 text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 h-12 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-xl uppercase tracking-widest">
                    <Filter className="w-3.5 h-3.5" />
                    Filtres
                </button>
            </div>

            <div className="rounded-[2.5rem] glass-card overflow-hidden min-h-[400px]">
                <Table>
                    <TableHeader className="bg-white/[0.01]">
                        <TableRow className="border-white/[0.04] hover:bg-transparent">
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 py-6 pl-8">Date</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Description</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Catégorie</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Compte</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right pr-8">Montant</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={5} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                                        <ArrowLeftRight className="w-5 h-5 text-zinc-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-white uppercase tracking-wider">Aucune transaction</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Connectez un compte pour voir vos transactions</p>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
