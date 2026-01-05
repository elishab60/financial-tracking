import { NextRequest, NextResponse } from "next/server"
import yahooFinance from "@/lib/yahoo-finance"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")

    if (!query) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    try {
        if (!yahooFinance || typeof yahooFinance.search !== 'function') {
            throw new Error("Yahoo Finance instance is not correctly initialized");
        }
        const results = await yahooFinance.search(query)
        return NextResponse.json(results)
    } catch (error: any) {
        console.error("Yahoo Finance Search Error Details:", {
            message: error.message,
            stack: error.stack,
            query
        })
        return NextResponse.json({
            error: error.message || "Failed to search",
            details: "Check server logs for more information"
        }, { status: 500 })
    }
}
