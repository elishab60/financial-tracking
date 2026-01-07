"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Building2, ChevronRight, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { BROKERS, BrokerData } from "@/lib/data/brokers"
import { cn } from "@/lib/utils"

interface BrokerSelectorProps {
    value?: string
    onSelect: (broker: BrokerData | null) => void
    className?: string
}

export function BrokerSelector({ value, onSelect, className }: BrokerSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedBroker = value ? BROKERS.find(b => b.id === value) : null

    // Filter brokers based on search
    const filteredBrokers = BROKERS.filter(broker =>
        broker.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (broker: BrokerData) => {
        onSelect(broker)
        setIsOpen(false)
        setSearchQuery("")
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onSelect(null)
    }

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Trigger */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen) }}
                className={cn(
                    "w-full h-14 px-4 flex items-center justify-between gap-3 cursor-pointer",
                    "bg-white/[0.03] border border-white/10 rounded-2xl",
                    "hover:border-white/20 hover:bg-white/[0.05] transition-all",
                    "text-left group",
                    isOpen && "border-gold/30 bg-white/[0.05]"
                )}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {selectedBroker ? (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img
                                    src={selectedBroker.logo}
                                    alt={selectedBroker.name}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                />
                            </div>
                            <span className="text-white font-bold text-sm truncate">{selectedBroker.name}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-4 h-4 text-zinc-500" />
                            </div>
                            <span className="text-zinc-500 font-medium text-sm">Sélectionner un courtier</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {selectedBroker && (
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleClear}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClear(e as any) }}
                            className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X className="w-3 h-3 text-zinc-400" />
                        </span>
                    )}
                    <ChevronRight className={cn(
                        "w-4 h-4 text-zinc-500 transition-transform",
                        isOpen && "rotate-90"
                    )} />
                </div>
            </div>

            {/* Slide-out Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 top-full left-0 right-0 mt-2"
                    >
                        <div className="bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                            {/* Search Header */}
                            <div className="p-3 border-b border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input
                                        placeholder="Rechercher un courtier..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 pl-10 bg-white/[0.03] border-white/10 rounded-xl text-sm focus:border-gold/30"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Broker List */}
                            <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                                {filteredBrokers.length === 0 ? (
                                    <div className="p-6 text-center">
                                        <p className="text-zinc-500 text-sm">Aucun courtier trouvé</p>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {filteredBrokers.map((broker) => (
                                            <motion.button
                                                key={broker.id}
                                                type="button"
                                                onClick={() => handleSelect(broker)}
                                                whileHover={{ x: 4 }}
                                                className={cn(
                                                    "w-full p-3 flex items-center gap-3 rounded-xl transition-all",
                                                    "hover:bg-white/[0.05]",
                                                    value === broker.id && "bg-gold/10 border border-gold/20"
                                                )}
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/5">
                                                    <img
                                                        src={broker.logo}
                                                        alt={broker.name}
                                                        className="w-6 h-6 object-contain"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.style.display = 'none'
                                                            // Show fallback
                                                            const fallback = target.nextElementSibling as HTMLElement
                                                            if (fallback) fallback.style.display = 'flex'
                                                        }}
                                                    />
                                                    <div className="hidden items-center justify-center text-xs font-black text-zinc-400">
                                                        {broker.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "font-bold text-sm",
                                                    value === broker.id ? "text-gold" : "text-white"
                                                )}>
                                                    {broker.name}
                                                </span>
                                                {value === broker.id && (
                                                    <div className="ml-auto w-2 h-2 rounded-full bg-gold" />
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
