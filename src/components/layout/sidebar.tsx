"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Wallet,
    CreditCard,
    ArrowLeftRight,
    Settings,
    PlusCircle,
    TrendingUp,
    Search,
    User as UserIcon,
    LogOut,
    ChevronUp,
    Calculator
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Actifs', href: '/assets', icon: Wallet },
    { name: 'Recherche', href: '/recherche', icon: Search },
    { name: 'Comptes', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Budget', href: '/budget', icon: TrendingUp },
    { name: 'Simulateurs', href: '/simulations', icon: Calculator },
    { name: 'Paramètres', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/auth")
    }

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

            {/* Profile Section */}
            <div className="p-6 mt-auto relative">
                <AnimatePresence>
                    {isProfileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute bottom-full left-4 right-4 mb-4 bg-zinc-950/80 border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-50"
                        >
                            {/* Menu Header */}
                            <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">
                                    {user?.email?.split('@')[0] || "Session active"}
                                </p>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest truncate opacity-60 mt-1">
                                    {user?.email || "Chargement..."}
                                </p>
                            </div>

                            {/* Menu Actions */}
                            <div className="p-2">
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                                    <UserIcon className="w-4 h-4 text-zinc-600 group-hover:text-[#c5a059]" />
                                    Mon Profil
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                                    <Settings className="w-4 h-4 text-zinc-600 group-hover:text-[#c5a059]" />
                                    Paramètres
                                </button>
                                <div className="h-px bg-white/5 my-2 mx-2" />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Déconnexion
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group relative overflow-hidden",
                        isProfileOpen && "bg-white/5 border-white/10"
                    )}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-white shrink-0 relative z-10">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left min-w-0 relative z-10">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">
                            Profil
                        </p>
                        <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest truncate opacity-60 mt-0.5">
                            Paramètres & Accès
                        </p>
                    </div>
                    <ChevronUp className={cn("w-4 h-4 text-zinc-600 transition-transform duration-500 relative z-10", isProfileOpen && "rotate-180")} />

                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/0 via-[#c5a059]/5 to-[#c5a059]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
            </div>
        </div>
    )
}
