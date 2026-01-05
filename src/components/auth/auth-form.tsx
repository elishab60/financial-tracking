"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Mail, Lock, Eye, EyeOff, Facebook, Chrome, Apple } from "lucide-react"

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
                toast.success("Veuillez vérifier vos e-mails pour confirmer votre inscription.")
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
            toast.error(error.message || "Une erreur d'authentification est survenue.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-[500px] px-4 animate-in fade-in zoom-in-95 duration-700">
            <div className="glass-card p-16 rounded-[3rem] border-white/[0.08]">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
                        {isSignUp ? "Créer un compte" : "Se connecter"}
                    </h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                        {isSignUp
                            ? "Rejoignez Worthflow"
                            : "Gestion de patrimoine privée"
                        }
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Identifiant</label>
                            <Input
                                type="email"
                                placeholder="Adresse e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-glass h-14 rounded-2xl px-6 text-sm"
                            />
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Mot de passe</label>
                                {!isSignUp && (
                                    <button type="button" className="text-[10px] font-bold text-[#c5a059] hover:text-[#e2c695] transition-colors uppercase tracking-[0.2em]">
                                        Oublié ?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="input-glass h-14 rounded-2xl px-6 pr-12 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-5 flex items-center text-zinc-500 hover:text-[#c5a059] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 premium-button rounded-2xl mt-6 shadow-2xl"
                        disabled={loading}
                    >
                        {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Connexion"}
                    </Button>
                </form>

                <div className="mt-12 pt-10 border-t border-white/[0.04] text-center">
                    <button
                        className="text-[10px] text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-[0.2em]"
                        onClick={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? "Déjà membre ? Connexion" : "Nouveau ? Créer un compte"}
                    </button>
                </div>
            </div>

            <p className="mt-12 text-[9px] text-zinc-600 text-center uppercase tracking-[0.3em] font-bold select-none opacity-40">
                Worthflow &copy; 2025
            </p>
        </div>
    )
}
