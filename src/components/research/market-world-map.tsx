"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe as GlobeIcon, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Globe from "@/components/ui/globe"

interface Hub {
    id: string
    name: string
    city: string
    index: string
    status: "open" | "closed"
    change: number
    price: string
    lat: number
    lng: number
}

const hubs: Hub[] = [
    { id: "ny", name: "Wall Street", city: "New York", index: "S&P 500", status: "open", change: 1.25, price: "5,123.40", lat: 40.7128, lng: -74.0060 },
    { id: "london", name: "LSE", city: "London", index: "FTSE 100", status: "closed", change: -0.42, price: "7,624.12", lat: 51.5074, lng: -0.1278 },
    { id: "paris", name: "Euronext", city: "Paris", index: "CAC 40", status: "closed", change: 0.15, price: "7,932.40", lat: 48.8566, lng: 2.3522 },
    { id: "tokyo", name: "TSE", city: "Tokyo", index: "Nikkei 225", status: "closed", change: 2.10, price: "39,234.55", lat: 35.6762, lng: 139.6503 },
    { id: "hk", name: "HKEX", city: "Hong Kong", index: "Hang Seng", status: "closed", change: -1.15, price: "16,543.20", lat: 22.3193, lng: 114.1694 },
    { id: "sydney", name: "ASX", city: "Sydney", index: "ASX 200", status: "open", change: 0.55, price: "7,712.30", lat: -33.8688, lng: 151.2093 },
]

export function MarketWorldMap() {
    const [activeHubIdx, setActiveHubIdx] = useState(0)

    const globeMarkers = useMemo(() =>
        hubs.map(hub => ({
            location: [hub.lat, hub.lng] as [number, number],
            size: hub.status === "open" ? 0.08 : 0.04
        }))
        , [])

    // Cycle through hubs for the bottom display
    React.useEffect(() => {
        const timer = setInterval(() => {
            setActiveHubIdx(prev => (prev + 1) % hubs.length)
        }, 3000)
        return () => clearInterval(timer)
    }, [])

    return (
        <Card className="glass-card bg-zinc-950 border-white/5 rounded-[2.5rem] relative overflow-hidden flex flex-col group min-h-[700px] shadow-2xl items-center justify-center">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-10 z-30 pointer-events-none flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                        <GlobeIcon className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Marchés Mondiaux</h3>
                    </div>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                    <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Real-time Feed</span>
                    </div>
                </div>
            </div>

            {/* 3D Globe Container */}
            <div className="relative z-10 scale-110 md:scale-125 transition-transform duration-[2000ms] group-hover:scale-[1.3] ease-out">
                <Globe
                    markers={globeMarkers}
                    className="opacity-90 grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
                />
            </div>

            {/* Bottom Right Floating Stats Sidebar - Vertical Carousel */}
            <div className="absolute bottom-10 left-10 z-30 pointer-events-none flex flex-col items-end gap-6">

                <div className="flex flex-col gap-3 pointer-events-auto items-end">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hubs[activeHubIdx].id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col gap-3"
                        >
                            {[
                                hubs[activeHubIdx],
                                hubs[(activeHubIdx + 1) % hubs.length],
                                hubs[(activeHubIdx + 2) % hubs.length]
                            ].map(hub => (
                                <Card key={hub.id} className="bg-zinc-950/40 border-white/5 backdrop-blur-md p-4 px-6 rounded-2xl hover:bg-zinc-900/60 transition-all group/stat min-w-[220px] shadow-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover/stat:text-[#c5a059] transition-colors">{hub.index}</span>
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full",
                                            hub.status === "open" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                                        )} />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm font-black text-white">{hub.price}</span>
                                        <span className={cn(
                                            "text-[10px] font-bold flex items-center gap-1",
                                            hub.change >= 0 ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {hub.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {Math.abs(hub.change)}%
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Glow Overlays for atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#09090b_100%)] pointer-events-none z-15 opacity-80" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
        </Card>
    )
}
