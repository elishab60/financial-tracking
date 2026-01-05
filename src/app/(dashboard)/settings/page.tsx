"use client"

import { User, Shield, Bell, LogOut, ChevronRight, CreditCard, Palette, Smartphone, Globe, Wallet, Sparkles, Zap, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-8 max-w-6xl mx-auto"
        >
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                        Paramètres <span className="text-zinc-600 text-lg font-medium">/</span> <span className="text-zinc-500 text-lg font-medium">Préférences</span>
                    </h1>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] opacity-60">
                        Votre espace personnel
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile Card (4 cols) */}
                <motion.div variants={item} className="lg:col-span-4 space-y-6">
                    <div className="rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 flex flex-col items-center text-center relative overflow-hidden group">
                        {/* Dynamic Background Mesh */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all duration-700" />

                        <div className="relative z-10 w-28 h-28 p-1 rounded-full border-2 border-gold/20 mb-6 group-hover:border-gold/50 transition-colors">
                            <div className="w-full h-full rounded-full bg-linear-to-br from-zinc-800 to-black flex items-center justify-center overflow-hidden">
                                {user?.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black text-gold">
                                        {user?.email?.charAt(0).toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full border-2 border-zinc-900 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-gold fill-gold" />
                            </div>
                        </div>

                        <div className="relative z-10 space-y-2 mb-8">
                            <h2 className="text-2xl font-black text-white">{user?.email?.split('@')[0] || "Utilisateur"}</h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 mx-auto">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full mb-8">
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold/20 transition-colors group/stat">
                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 group-hover/stat:text-gold transition-colors">Votre Plan</div>
                                <div className="text-xl font-black text-white flex items-center justify-center gap-1">
                                    <Zap className="w-4 h-4 text-gold fill-gold" /> PRO
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-gold/20 transition-colors group/stat">
                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 group-hover/stat:text-gold transition-colors">Statut</div>
                                <div className="text-xl font-black text-white">Actif</div>
                            </div>
                        </div>

                        <Button className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-white/5">
                            Modifier le profil
                        </Button>
                    </div>

                    <div className="p-1">
                        <Button variant="ghost" className="w-full h-12 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-widest justify-start pl-4 group">
                            <LogOut className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                            Se déconnecter
                        </Button>
                    </div>
                </motion.div>

                {/* Right Column: Settings Sections (8 cols) */}
                <motion.div variants={item} className="lg:col-span-8 space-y-6">

                    {/* General Settings Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Command className="w-4 h-4 text-zinc-500" />
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Général</h3>
                        </div>
                        <div className="rounded-[2rem] bg-zinc-900/30 border border-white/5 overflow-hidden">
                            <SettingsRow icon={User} title="Compte" subtitle="Gérer vos informations personnelles" hasBorder />
                            <SettingsRow icon={Shield} title="Sécurité & Confidentialité" subtitle="2FA, Mot de passe, Sessions" hasBorder />
                            <SettingsRow icon={Globe} title="Langue & Région" subtitle="Français (FR) - EUR (€)" />
                        </div>
                    </div>

                    {/* Finance Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <Wallet className="w-4 h-4 text-zinc-500" />
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Finances</h3>
                        </div>
                        <div className="rounded-[2rem] bg-zinc-900/30 border border-white/5 overflow-hidden">
                            <SettingsRow icon={CreditCard} title="Abonnements & Facturation" subtitle="Gérer votre plan Premium" hasBorder />
                            <SettingsRow icon={Bell} title="Notifications" subtitle="Alertes de prix et rapports hebdos" hasBorder />
                            <SettingsRow icon={Palette} title="Apparence" subtitle="Thème sombre activé par défaut" />
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="rounded-[2rem] bg-linear-to-r from-gold/10 to-transparent border border-gold/10 p-8 flex items-center justify-between group cursor-pointer hover:border-gold/30 transition-all">
                        <div>
                            <h3 className="text-lg font-black text-white mb-2 group-hover:text-gold transition-colors">Besoin d'aide ?</h3>
                            <p className="text-sm text-zinc-400 max-w-sm">Contactez notre support premium disponible 24/7 pour toute question sur votre patrimoine.</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Sparkles className="w-5 h-5 text-gold" />
                        </div>
                    </div>

                </motion.div>
            </div>
        </motion.div>
    )
}

function SettingsRow({ icon: Icon, title, subtitle, hasBorder = false }: { icon: any, title: string, subtitle: string, hasBorder?: boolean }) {
    return (
        <div className={`p-6 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer group transition-colors ${hasBorder ? 'border-b border-white/[0.03]' : ''}`}>
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center group-hover:border-gold/30 group-hover:scale-105 transition-all shadow-lg shadow-black/20">
                    <Icon className="w-5 h-5 text-zinc-500 group-hover:text-gold transition-colors" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors mb-1">{title}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{subtitle}</p>
                </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                <ChevronRight className="w-4 h-4 text-gold" />
            </div>
        </div>
    )
}
