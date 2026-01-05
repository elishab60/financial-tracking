import { NextRequest, NextResponse } from "next/server"

// Note: Yahoo Finance news requires web scraping or a paid API
// For now, we'll use a simplified approach with quoteSummary
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    try {
        // Try to fetch news from Yahoo Finance RSS or search
        // This is a fallback that may have limited results
        const response = await fetch(
            `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`,
            { next: { revalidate: 300 } } // Cache for 5 min
        )

        if (!response.ok) {
            // Return empty array if RSS fails
            return NextResponse.json({ news: [], source: "unavailable" })
        }

        const text = await response.text()

        // Parse RSS XML
        const newsItems: any[] = []
        const itemRegex = /<item>([\s\S]*?)<\/item>/g
        let match

        while ((match = itemRegex.exec(text)) !== null) {
            const itemContent = match[1]

            const title = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
                || itemContent.match(/<title>(.*?)<\/title>/)?.[1] || ""
            const link = itemContent.match(/<link>(.*?)<\/link>/)?.[1] || ""
            const pubDate = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ""
            const description = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
                || itemContent.match(/<description>(.*?)<\/description>/)?.[1] || ""

            if (title && link) {
                newsItems.push({
                    title: title.trim(),
                    link: link.trim(),
                    pubDate: pubDate ? new Date(pubDate).toISOString() : null,
                    description: description.replace(/<[^>]*>/g, '').trim().slice(0, 200),
                    source: "Yahoo Finance"
                })
            }
        }

        return NextResponse.json({
            news: newsItems.slice(0, 10), // Limit to 10 articles
            source: "yahoo_rss"
        })
    } catch (error: any) {
        console.error("News API error:", error)
        return NextResponse.json({ news: [], source: "error", error: error.message })
    }
}
