"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Building2, Bitcoin, Banknote, Home, HelpCircle } from "lucide-react"

interface AssetIconProps {
    symbol?: string
    type: string
    name: string
    image?: string
    id?: string
    className?: string
}

export function AssetIcon({ symbol, type, name, image, id, className }: AssetIconProps) {
    const [error, setError] = useState(false)

    // Helper to get crypto icon
    const getCryptoIcon = (sym: string) =>
        `https://assets.coincap.io/assets/icons/${sym.toLowerCase()}@2x.png`

    // Determine Image Source
    let src = null

    // 1. Priority: DB Image (Saved Base64/URL)
    if (image) {
        src = image
    }
    // 2. Fallback: Fetch & Save mechanism
    else if (!error && symbol) {
        if (type === 'crypto') {
            src = getCryptoIcon(symbol.replace('USD', '').replace('EUR', ''))
        } else if (type === 'stock') {
            // Use our new dynamic proxy which triggers the save if 'save_to' is present
            src = `/api/finance/logo?symbol=${symbol}${id ? `&save_to=${id}` : ''}`
        }
    }

    // Fallback Icon based on type
    const FallbackIcon = () => {
        switch (type) {
            case 'crypto': return <Bitcoin className="w-5 h-5" />
            case 'stock': return <Building2 className="w-5 h-5" />
            case 'cash': return <Banknote className="w-5 h-5" />
            case 'real_estate': return <Home className="w-5 h-5" />
            default: return <HelpCircle className="w-5 h-5" />
        }
    }

    return (
        <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all overflow-hidden",
            type === 'crypto' ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                type === 'stock' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                    type === 'cash' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                        type === 'real_estate' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                            "bg-zinc-800 text-zinc-500 border border-zinc-700",
            className
        )}>
            {src && !error ? (
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full">
                    {symbol ? (
                        <span className="font-black text-xs uppercase">
                            {symbol.slice(0, 2)}
                        </span>
                    ) : (
                        <FallbackIcon />
                    )}
                </div>
            )}
        </div>
    )
}
