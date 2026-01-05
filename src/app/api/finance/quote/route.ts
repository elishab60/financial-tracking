import { NextRequest, NextResponse } from "next/server"
import yahooFinance from "@/lib/yahoo-finance"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    try {
        if (!yahooFinance || typeof yahooFinance.quote !== 'function') {
            throw new Error("Yahoo Finance instance is not correctly initialized");
        }
        const quote = await yahooFinance.quote(symbol)
        return NextResponse.json(quote)
    } catch (error: any) {
        console.error("Yahoo Finance Quote Error Details:", {
            message: error.message,
            stack: error.stack,
            symbol
        })
        return NextResponse.json({
            error: error.message || "Failed to fetch quote",
            details: "Check server logs for more information"
        }, { status: 500 })
    }
}
