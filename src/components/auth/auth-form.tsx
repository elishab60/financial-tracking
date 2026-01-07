"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Eye, EyeOff, ShieldCheck, Mail, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function AuthForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                toast.success("Veuillez vérifier vos e-mails pour confirmer l'inscription.")
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                toast.success("Authentification réussie.")
                window.location.href = "/dashboard"
            }
        } catch (error: any) {
            toast.error(error.message || "Erreur d'authentification.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-[480px]">
            {/* Main Portal Card */}
            <Card className="glass-card bg-zinc-950/60 border-white/10 p-12 md:p-16 rounded-[3.5rem] relative overflow-hidden backdrop-blur-3xl shadow-[0_25px_100px_rgba(0,0,0,0.8)]">

                {/* Visual Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent" />

                <div className="text-center mb-16 relative">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <ShieldCheck className="w-8 h-8 text-[#c5a059]" />
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.h1
                            key={isSignUp ? "signup" : "login"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-4xl font-black text-white tracking-tighter uppercase mb-2"
                        >
                            {isSignUp ? "Créer un compte" : "Connexion"}
                        </motion.h1>
                    </AnimatePresence>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.4em] opacity-80">
                        {isSignUp ? "Rejoignez Worthflow" : "Accédez à votre espace"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-10 relative">
                    <div className="space-y-8">
                        {/* Email Field */}
                        <div className="space-y-3 group">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] group-focus-within:text-[#c5a059] transition-colors">E-mail</label>
                                <Mail className="w-3 h-3 text-zinc-700" />
                            </div>
                            <Input
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-16 bg-white/[0.02] border-white/5 rounded-2xl px-8 text-white placeholder:text-zinc-700 text-sm focus:border-[#c5a059]/30 focus:bg-white/[0.04] transition-all"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-3 group">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] group-focus-within:text-[#c5a059] transition-colors">Mot de passe</label>
                                {!isSignUp && (
                                    <button type="button" className="text-[9px] font-black text-zinc-600 hover:text-[#c5a059] transition-colors uppercase tracking-widest">Oublié ?</button>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-16 bg-white/[0.02] border-white/5 rounded-2xl px-8 pr-16 text-white placeholder:text-zinc-800 text-sm focus:border-[#c5a059]/30 focus:bg-white/[0.04] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-6 flex items-center text-zinc-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-16 bg-white text-black hover:bg-[#c5a059] hover:text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? "Chargement..." : (
                            <>
                                {isSignUp ? "S'inscrire" : "Se connecter"}
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-16 pt-12 border-t border-white/5 text-center">
                    <button
                        className="text-[10px] text-zinc-500 hover:text-[#c5a059] transition-all font-black uppercase tracking-[0.3em] relative group"
                        onClick={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? "Déjà un compte ? Se connecter" : "Nouveau ? Créer un profil"}
                        <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#c5a059]/40 group-hover:w-full transition-all duration-500" />
                    </button>
                </div>
            </Card>

            {/* Background Decorative Circles */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-900/40 rounded-full blur-[100px] pointer-events-none -z-10" />
        </div>
    )
}

function Card({ children, className, ...props }: any) {
    return <div className={cn("relative", className)} {...props}>{children}</div>
}
