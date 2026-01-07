"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CompoundInterestCalculator } from "@/components/simulations/compound-interest"
import { LoanCalculator } from "@/components/simulations/loan-calculator"
import { cn } from "@/lib/utils"

export default function SimulationsPage() {
    const [activeTab, setActiveTab] = useState<"compound" | "loan">("compound")

    return (
        <div className="max-w-7xl mx-auto space-y-16 py-12 px-6">
            <div className="text-center space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">
                    Simulateurs Financiers
                </h1>
                <p className="text-zinc-500 font-medium tracking-widest uppercase text-[10px]">Planifiez votre avenir avec précision</p>
            </div>

            <div className="flex items-center justify-center gap-12 border-b border-white/5">
                {[
                    { id: "compound", label: "Intérêts Composés" },
                    { id: "loan", label: "Crédit & Emprunt" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "pb-8 text-sm font-bold uppercase tracking-[0.2em] transition-all relative",
                            activeTab === tab.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div layoutId="activeTabUnderlineSim" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#c5a059]" />
                        )}
                    </button>
                ))}
            </div>

            <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === "compound" ? <CompoundInterestCalculator /> : <LoanCalculator />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
