"use client"

import { useEffect, useState } from "react"
import { Loader2, Newspaper, ExternalLink, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface NewsItem {
    title: string
    link: string
    pubDate: string | null
    description: string
    source: string
}

interface NewsFeedProps {
    symbol: string
}

export function NewsFeed({ symbol }: NewsFeedProps) {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!symbol) return

        const fetchNews = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/finance/news?symbol=${encodeURIComponent(symbol)}`)
                if (!res.ok) throw new Error("Failed to fetch news")

                const json = await res.json()
                setNews(json.news || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [symbol])

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return ""
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffHours < 1) return "Il y a moins d'1h"
        if (diffHours < 24) return `Il y a ${diffHours}h`
        if (diffDays < 7) return `Il y a ${diffDays}j`
        return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <p className="text-rose-400 text-sm">{error}</p>
            </div>
        )
    }

    if (news.length === 0) {
        return (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                <Newspaper className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">Aucune actualité disponible pour {symbol}</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-4 h-4 text-zinc-500" />
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                    Actualités
                </h3>
            </div>

            <div className="space-y-3">
                {news.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors line-clamp-2">
                                    {item.title}
                                </h4>
                                {item.description && (
                                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                        {item.source}
                                    </span>
                                    {item.pubDate && (
                                        <span className="text-[9px] text-zinc-600 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(item.pubDate)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    )
}
