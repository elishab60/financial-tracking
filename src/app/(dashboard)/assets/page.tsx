import { getAssets } from "@/app/actions/assets"
import { AddAssetDialog } from "@/components/assets/add-asset-dialog"
import { AssetsTable } from "@/components/assets/assets-table"

export default async function AssetsPage() {
    const assets = await getAssets()

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Actifs</h1>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">Gérez votre patrimoine global</p>
                </div>
                <AddAssetDialog />
            </div>

            <AssetsTable initialAssets={assets} />
        </div>
    )
}
