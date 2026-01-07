"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, Percent, Calendar, Calculator, Info } from "lucide-react"

export function LoanCalculator() {
    // State for Loan Tab
    const [loanAmount, setLoanAmount] = useState<number>(250000)
    const [interestRate, setInterestRate] = useState<number>(3.5)
    const [loanTerm, setLoanTerm] = useState<number>(20)

    // State for Borrowing Capacity Tab
    const [netIncome, setNetIncome] = useState<number>(3500)
    const [currentDebts, setCurrentDebts] = useState<number>(0)
    const [maxDebtRatio, setMaxDebtRatio] = useState<number>(35)

    // Calculations for Loan
    const monthlyPayment = useMemo(() => {
        const r = interestRate / 100 / 12
        const n = loanTerm * 12
        if (r === 0) return loanAmount / n
        const payment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        return Math.round(payment)
    }, [loanAmount, interestRate, loanTerm])

    const totalCost = (monthlyPayment * loanTerm * 12) - loanAmount

    // Calculations for Capacity
    const maxMonthlyPayment = (netIncome * (maxDebtRatio / 100)) - currentDebts
    const estimatedCapacity = useMemo(() => {
        const r = interestRate / 100 / 12
        const n = loanTerm * 12
        if (r === 0) return maxMonthlyPayment * n
        const capacity = (maxMonthlyPayment * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
        return Math.round(capacity)
    }, [maxMonthlyPayment, interestRate, loanTerm])

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* 1. Loan Calculator */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Simulateur de crédit</h3>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Estimez vos mensualités</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10">
                                    <Home className="w-4 h-4 text-white" />
                                </div>
                                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Montant du prêt (€)</Label>
                            </div>
                            <Input
                                type="number"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] h-14 text-xl font-bold text-white pl-5 pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <Percent className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Taux (%)</Label>
                                </div>
                                <Input
                                    type="number"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] h-14 text-xl font-bold text-white pl-5 pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                        <Calendar className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Durée</Label>
                                </div>
                                <Input
                                    type="number"
                                    value={loanTerm}
                                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                                    className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] h-14 text-xl font-bold text-white pl-5 pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    <Card className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="space-y-6 relative">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mensualité estimée</span>
                                <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-white uppercase tracking-tighter">Assurance exclue</div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white">{monthlyPayment.toLocaleString()}</span>
                                <span className="text-xl font-bold text-zinc-600">€/mois</span>
                            </div>
                            <div className="pt-6 border-t border-white/5 flex gap-12">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Coût total du crédit</p>
                                    <p className="text-lg font-black text-rose-500">{totalCost.toLocaleString()} €</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Montant total remboursé</p>
                                    <p className="text-lg font-black text-white">{(loanAmount + totalCost).toLocaleString()} €</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. Borrowing Capacity */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/20">
                            <Calculator className="w-5 h-5 text-[#c5a059]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Capacité d'emprunt</h3>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Que pouvez-vous acheter ?</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <Calculator className="w-4 h-4 text-emerald-500" />
                                </div>
                                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Revenu Net Mensuel (€)</Label>
                            </div>
                            <Input
                                type="number"
                                value={netIncome}
                                onChange={(e) => setNetIncome(Number(e.target.value))}
                                className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] h-14 text-xl font-bold text-white pl-5 pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                        <Home className="w-4 h-4 text-rose-400" />
                                    </div>
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Charges (€)</Label>
                                </div>
                                <Input
                                    type="number"
                                    value={currentDebts}
                                    onChange={(e) => setCurrentDebts(Number(e.target.value))}
                                    className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] h-14 text-xl font-bold text-white pl-5 pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20">
                                        <Percent className="w-4 h-4 text-[#c5a059]" />
                                    </div>
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Endettement (%)</Label>
                                </div>
                                <Input
                                    type="number"
                                    value={maxDebtRatio}
                                    onChange={(e) => setMaxDebtRatio(Number(e.target.value))}
                                    className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] h-14 text-xl font-bold text-white pl-5 pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        </div>
                    </div>

                    <Card className="p-8 bg-linear-to-br from-[#c5a059]/20 to-transparent border-none rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a059]/5 blur-3xl rounded-full -mr-24 -mt-24 group-hover:bg-[#c5a059]/10 transition-all pointer-events-none" />
                        <div className="space-y-6 relative">
                            <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-[0.2em]">Enveloppe Finançable</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-white">{estimatedCapacity.toLocaleString()}</span>
                                <span className="text-xl font-bold text-white/40">€</span>
                            </div>
                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mensualité Maximale</span>
                                    <span className="text-sm font-bold text-white">{maxMonthlyPayment.toLocaleString()} €</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${maxDebtRatio}%` }}
                                        className="h-full bg-[#c5a059]"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-zinc-600 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <Info className="w-4 h-4" />
                                    <p className="text-[9px] font-medium leading-relaxed uppercase tracking-tight">Basé sur un taux de {interestRate}% sur {loanTerm} ans</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
