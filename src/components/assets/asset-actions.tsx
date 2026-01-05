"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react"
import { Asset } from "@/types"
import { deleteAsset } from "@/app/actions/assets"
import { toast } from "sonner"
import { EditAssetDialog } from "./edit-asset-dialog"
import { useRouter } from "next/navigation"

interface AssetActionsProps {
    asset: Asset
}

export function AssetActions({ asset }: AssetActionsProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const handleDelete = async () => {
        const toastId = toast.loading("Suppression de l'actif...")
        setIsDeleting(true)
        try {
            await deleteAsset(asset.id)
            router.refresh()
            toast.success("Actif supprimé", { id: toastId })
        } catch (error: any) {
            console.error("Delete error:", error)
            toast.error("Erreur - Impossible de supprimer l'actif", { id: toastId })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-xl bg-white/[0.02] hover:bg-white text-zinc-500 hover:text-black transition-all border border-white/[0.04]">
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-white/10 backdrop-blur-3xl min-w-[160px] p-2">
                    <DropdownMenuItem
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2 p-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 p-3 text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditAssetDialog
                asset={asset}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
        </>
    )
}
