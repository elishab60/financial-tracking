"use client"

import { AuthForm } from "@/components/auth/auth-form"
import Globe from "@/components/ui/globe"
import { motion } from "framer-motion"

export default function AuthPage() {
    return (
        <div className="relative min-h-screen w-full bg-[#030303] flex items-center justify-center overflow-hidden">
            {/* Background Globe - Large and offset for a "cinematic" look */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] opacity-30 pointer-events-none scale-150">
                <Globe className="w-full h-full" />
            </div>

            {/* Atmosphere Overlays - High Impact */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#030303_90%)] z-10" />

            {/* Colorful Halos */}
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#c5a059]/10 blur-[120px] rounded-full z-10 animate-pulse duration-[10000ms]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[100px] rounded-full z-10" />
            <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[80px] rounded-full z-10" />

            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#c5a059]/10 via-transparent to-[#030303]/80 z-10" />

            {/* Content */}
            <div className="relative z-20 w-full flex flex-col items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="w-full flex justify-center"
                >
                    <AuthForm />
                </motion.div>

                {/* Branding Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1, duration: 1.5 }}
                    className="mt-12 flex items-center gap-6"
                >
                    <div className="h-px w-12 bg-zinc-800" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] select-none">
                        WORTHFLOW
                    </span>
                    <div className="h-px w-12 bg-zinc-800" />
                </motion.div>
            </div>
        </div>
    )
}
