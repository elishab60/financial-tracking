"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Wallet,
    CreditCard,
    ArrowLeftRight,
    Settings,
    PlusCircle,
    TrendingUp
} from "lucide-react"

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Actifs', href: '/assets', icon: Wallet },
    { name: 'Comptes', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Paramètres', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-full bg-linear-to-b from-white/[0.04] to-transparent border-r border-white/[0.08] w-64 backdrop-blur-3xl shadow-[20px_0_50px_-20px_rgba(0,0,0,0.5)]">
            <div className="p-10 flex items-center gap-4">
                <span className="text-lg font-bold tracking-[0.2em] text-white uppercase">
                    WORTHFLOW
                </span>
            </div>

            <nav className="flex-1 px-6 mt-6 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300",
                                isActive
                                    ? "bg-white text-black shadow-xl"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                            )}
                        >
                            <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-black" : "text-zinc-600")} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-8 mt-auto">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-lg">
                    <PlusCircle className="w-4 h-4" />
                    Ajouter un compte
                </button>
            </div>
        </div>
    )
}
