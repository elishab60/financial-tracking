"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts"
import { TrendingUp, Percent, Calendar, Wallet } from "lucide-react"

export function CompoundInterestCalculator() {
    const [initialAmount, setInitialAmount] = useState<number>(1000)
    const [monthlyContribution, setMonthlyContribution] = useState<number>(100)
    const [annualRate, setAnnualRate] = useState<number>(7)
    const [years, setYears] = useState<number>(20)

    const data = useMemo(() => {
        const result = []
        let balance = initialAmount
        const monthlyRate = annualRate / 100 / 12
        let totalInvested = initialAmount

        for (let year = 0; year <= years; year++) {
            result.push({
                year,
                balance: Math.round(balance),
                totalInvested: Math.round(totalInvested)
            })

            // Calculate next year's monthly growth
            for (let month = 1; month <= 12; month++) {
                balance = (balance + monthlyContribution) * (1 + monthlyRate)
                totalInvested += monthlyContribution
            }
        }
        return result
    }, [initialAmount, monthlyContribution, annualRate, years])

    const totalBalance = data[data.length - 1].balance
    const totalInvested = data[data.length - 1].totalInvested
    const totalInterest = totalBalance - totalInvested

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
                <div className="space-y-5">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20">
                                <Wallet className="w-4 h-4 text-[#c5a059]" />
                            </div>
                            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Capital Initial (€)</Label>
                        </div>
                        <Input
                            type="number"
                            value={initialAmount}
                            onChange={(e) => setInitialAmount(Number(e.target.value))}
                            className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] h-14 text-xl font-bold text-white pl-5 pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Versement Mensuel (€)</Label>
                        </div>
                        <Input
                            type="number"
                            value={monthlyContribution}
                            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
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
                                value={annualRate}
                                onChange={(e) => setAnnualRate(Number(e.target.value))}
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
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                                className="bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#c5a059]/30 focus:border-[#c5a059] h-14 text-xl font-bold text-white pl-5 pr-5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                    </div>
                </div>

                <Card className="p-6 bg-gradient-to-br from-[#c5a059]/15 to-[#c5a059]/5 border border-[#c5a059]/20 rounded-2xl space-y-4 backdrop-blur-sm">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Valeur Finale Estimée</p>
                        <p className="text-3xl font-black text-white">{totalBalance.toLocaleString()} €</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Total Investi</p>
                            <p className="text-sm font-bold text-white">{totalInvested.toLocaleString()} €</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Intérêts Gagnés</p>
                            <p className="text-sm font-bold text-emerald-400">+{totalInterest.toLocaleString()} €</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-8 bg-black/40 rounded-[2.5rem] border border-white/5 p-8 h-[500px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-[#c5a059]/5 to-transparent pointer-events-none" />
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c5a059" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="year"
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Années', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#52525b' }}
                        />
                        <YAxis
                            stroke="#52525b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '10px' }}
                            itemStyle={{ fontWeight: 'bold' }}
                            labelStyle={{ color: '#c5a059', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="balance"
                            name="Capital Final"
                            stroke="#c5a059"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorBalance)"
                        />
                        <Area
                            type="monotone"
                            dataKey="totalInvested"
                            name="Investissement Cumulé"
                            stroke="#ffffff"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorInvested)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
