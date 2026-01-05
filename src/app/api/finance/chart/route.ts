import { NextRequest, NextResponse } from "next/server"
import yahooFinance from "@/lib/yahoo-finance"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")
    const range = searchParams.get("range") || "1mo" // 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    try {
        // Map range to period and interval
        const rangeConfig: Record<string, { period1: Date; interval: string }> = {
            "1d": {
                period1: new Date(Date.now() - 24 * 60 * 60 * 1000),
                interval: "5m"
            },
            "5d": {
                period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                interval: "15m"
            },
            "1mo": {
                period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                interval: "1d"
            },
            "3mo": {
                period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                interval: "1d"
            },
            "6mo": {
                period1: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
                interval: "1d"
            },
            "1y": {
                period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                interval: "1wk"
            },
            "5y": {
                period1: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
                interval: "1mo"
            },
            "max": {
                period1: new Date("1970-01-01"),
                interval: "1mo"
            }
        }

        const config = rangeConfig[range] || rangeConfig["1mo"]

        const data = await yahooFinance.chart(symbol, {
            period1: config.period1,
            period2: new Date(),
            interval: config.interval as any,
        })

        if (!data || !data.quotes || data.quotes.length === 0) {
            return NextResponse.json({ error: "No data found" }, { status: 404 })
        }

        // Transform to our format
        const chartData = data.quotes
            .filter((q: any) => q.open != null && q.close != null)
            .map((q: any) => ({
                time: Math.floor(new Date(q.date).getTime() / 1000),
                open: q.open,
                high: q.high,
                low: q.low,
                close: q.close,
                volume: q.volume
            }))

        return NextResponse.json({
            symbol,
            range,
            data: chartData,
            meta: {
                currency: data.meta?.currency || "USD",
                regularMarketPrice: data.meta?.regularMarketPrice,
                previousClose: data.meta?.previousClose
            }
        })
    } catch (error: any) {
        console.error("Chart API error:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch chart data" }, { status: 500 })
    }
}
