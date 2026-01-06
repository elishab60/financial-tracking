"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Info, Globe, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Hub {
    id: string
    name: string
    city: string
    index: string
    status: "open" | "closed"
    change: number
    price: string
    lat: number // Percentage from top
    lng: number // Percentage from left
}

const hubs: Hub[] = [
    { id: "ny", name: "Wall Street", city: "New York", index: "S&P 500", status: "open", change: 1.25, price: "5,123.40", lat: 35, lng: 25 },
    { id: "london", name: "LSE", city: "London", index: "FTSE 100", status: "closed", change: -0.42, price: "7,624.12", lat: 25, lng: 46 },
    { id: "paris", name: "Euronext", city: "Paris", index: "CAC 40", status: "closed", change: 0.15, price: "7,932.40", lat: 28, lng: 48 },
    { id: "tokyo", name: "TSE", city: "Tokyo", index: "Nikkei 225", status: "closed", change: 2.10, price: "39,234.55", lat: 38, lng: 85 },
    { id: "hk", name: "HKEX", city: "Hong Kong", index: "Hang Seng", status: "closed", change: -1.15, price: "16,543.20", lat: 45, lng: 78 },
    { id: "sydney", name: "ASX", city: "Sydney", index: "ASX 200", status: "open", change: 0.55, price: "7,712.30", lat: 75, lng: 88 },
]

export function MarketWorldMap() {
    const [hoveredHub, setHoveredHub] = useState<Hub | null>(null)

    return (
        <Card className="glass-card bg-black/40 border-none p-10 rounded-[2.5rem] relative overflow-hidden min-h-[500px] flex flex-col group">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Marchés Mondiaux</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-0.5">Performance en temps réel</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Open</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Closed</span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative mt-4">
                {/* Stylized Dot Matrix Map Background */}
                <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

                {/* Simple World Outline (Optional for better context) */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] select-none pointer-events-none" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
                    <path d="M150,150 Q200,100 300,150 T500,150 T700,100 T850,200 T700,350 T500,400 T300,350 T150,300 Z" fill="currentColor" className="text-white" />
                    {/* Replace with a more accurate path if needed, but the aesthetic dots are primary */}
                </svg>

                {/* Hubs Markers */}
                {hubs.map((hub) => (
                    <div
                        key={hub.id}
                        className="absolute"
                        style={{ top: `${hub.lat}%`, left: `${hub.lng}%` }}
                    >
                        <button
                            onMouseEnter={() => setHoveredHub(hub)}
                            onMouseLeave={() => setHoveredHub(null)}
                            className={cn(
                                "group/marker relative flex items-center justify-center w-8 h-8 -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
                                hoveredHub?.id === hub.id ? "scale-125" : "scale-100"
                            )}
                        >
                            {/* Marker Rings */}
                            <div className={cn(
                                "absolute inset-0 rounded-full animate-ping opacity-20",
                                hub.status === "open" ? "bg-emerald-500" : "bg-rose-500"
                            )} />
                            <div className={cn(
                                "absolute inset-0 rounded-full opacity-10",
                                hub.status === "open" ? "bg-emerald-500" : "bg-rose-500"
                            )} />

                            {/* Core Point */}
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full border-2 border-black relative z-10 transition-all shadow-xl",
                                hub.status === "open" ? "bg-emerald-500" : "bg-rose-500"
                            )} />

                            {/* Tooltip Popup */}
                            <AnimatePresence>
                                {hoveredHub?.id === hub.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                                    >
                                        <Card className="glass-card bg-zinc-950/90 border-white/10 p-4 min-w-[180px] shadow-2xl backdrop-blur-xl">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{hub.city}</span>
                                                    <div className={cn(
                                                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                                                        hub.status === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                                    )}>
                                                        {hub.status}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{hub.index}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-black text-white">{hub.price}</span>
                                                        <div className={cn(
                                                            "flex items-center text-[10px] font-black",
                                                            hub.change >= 0 ? "text-emerald-400" : "text-rose-400"
                                                        )}>
                                                            {hub.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                            {Math.abs(hub.change)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/10" />
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                ))}
            </div>

            {/* Bottom Info Bar */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-8">
                    {hubs.slice(0, 3).map(hub => (
                        <div key={hub.id} className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{hub.index}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white tracking-tight">{hub.price}</span>
                                <span className={cn(
                                    "text-[10px] font-bold",
                                    hub.change >= 0 ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {hub.change >= 0 ? "+" : ""}{hub.change}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 justify-end">
                        <Clock className="w-3 h-3" /> Updated 2m ago
                    </p>
                </div>
            </div>

            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-white/[0.02] to-transparent pointer-events-none" />
        </Card>
    )
}
