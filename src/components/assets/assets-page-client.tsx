"use client"

import { useState } from "react"
import { Asset } from "@/types"
import { AssetsTable } from "@/components/assets/assets-table"
import { AccountsGroupedView } from "@/components/assets/accounts-grouped-view"
import { LayoutGrid, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface AssetsPageClientProps {
    initialAssets: Asset[]
}

export function AssetsPageClient({ initialAssets }: AssetsPageClientProps) {
    const [viewMode, setViewMode] = useState<"table" | "accounts">("accounts")

    return (
        <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex justify-end">
                <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/5">
                    <button
                        onClick={() => setViewMode("accounts")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === "accounts"
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <FolderOpen className="w-4 h-4" />
                        Par Compte
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            viewMode === "table"
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-white"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Liste
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === "accounts" ? (
                <AccountsGroupedView assets={initialAssets} />
            ) : (
                <AssetsTable initialAssets={initialAssets} />
            )}
        </div>
    )
}
