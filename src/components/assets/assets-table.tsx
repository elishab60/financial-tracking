"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreHorizontal, Wallet, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AssetActions } from "@/components/assets/asset-actions"
import { Asset, AssetType } from "@/types"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { AssetIcon } from "@/components/ui/asset-icon"

interface AssetsTableProps {
    initialAssets: Asset[]
}

export function AssetsTable({ initialAssets }: AssetsTableProps) {
    const [filterQuery, setFilterQuery] = useState('')
    const [selectedTypes, setSelectedTypes] = useState<AssetType[]>([])

    // Filtering logic
    const filteredAssets = initialAssets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
            (asset.symbol && asset.symbol.toLowerCase().includes(filterQuery.toLowerCase()))

        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(asset.type)

        return matchesSearch && matchesType
    })

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

    const toggleType = (type: AssetType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Rechercher un actif..."
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        className="input-glass h-12 rounded-xl pl-12 pr-4 text-sm"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2 px-6 h-12 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-xl uppercase tracking-widest">
                            <Filter className="w-3.5 h-3.5" />
                            Filtres {selectedTypes.length > 0 && `(${selectedTypes.length})`}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-white/10">
                        <DropdownMenuCheckboxItem
                            checked={selectedTypes.includes('stock')}
                            onCheckedChange={() => toggleType('stock')}
                            className="text-xs font-bold"
                        >
                            Stocks / ETF
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={selectedTypes.includes('crypto')}
                            onCheckedChange={() => toggleType('crypto')}
                            className="text-xs font-bold"
                        >
                            Crypto
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={selectedTypes.includes('cash')}
                            onCheckedChange={() => toggleType('cash')}
                            className="text-xs font-bold"
                        >
                            Cash
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={selectedTypes.includes('real_estate')}
                            onCheckedChange={() => toggleType('real_estate')}
                            className="text-xs font-bold"
                        >
                            Immobilier
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-[2.5rem] glass-card border-dashed">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-8">
                        <Wallet className="w-6 h-6 text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">Aucun actif trouvé</h3>
                    <p className="text-zinc-500 max-w-sm text-center text-xs font-medium leading-relaxed uppercase tracking-widest opacity-60">
                        Essayez de modifier vos filtres ou d'ajouter un nouvel actif.
                    </p>
                </div>
            ) : (
                <div className="rounded-[2.5rem] glass-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/[0.01]">
                            <TableRow className="border-white/[0.04] hover:bg-transparent">
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 py-6 pl-8">Actif</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Type</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Valeur Totale</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Quantité</TableHead>
                                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Mode</TableHead>
                                <TableHead className="text-right pr-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAssets.map((asset) => (
                                <TableRow key={asset.id} className="border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                                    <TableCell className="py-6 pl-8">
                                        <div className="flex items-center gap-4">
                                            <AssetIcon
                                                symbol={asset.symbol}
                                                type={asset.type}
                                                name={asset.name}
                                                image={asset.image}
                                                id={asset.id}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-sm">{asset.name}</span>
                                                {asset.symbol && <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{asset.symbol}</span>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest capitalize">{asset.type.replace('_', ' ')}</TableCell>
                                    <TableCell className="font-bold text-white text-sm">{formatCurrency(asset.current_value || 0)}</TableCell>
                                    <TableCell className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        {asset.quantity} {asset.symbol || ''}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-white/[0.03] border-white/[0.06] text-zinc-500 text-[9px] font-bold uppercase tracking-widest rounded-lg px-2 py-1">
                                            {asset.valuation_mode}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <AssetActions asset={asset} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
