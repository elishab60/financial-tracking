import { NextRequest, NextResponse } from "next/server"
import yahooFinance from "@/lib/yahoo-finance"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")
    const date = searchParams.get("date") // Format: YYYY-MM-DD

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    if (!date) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    try {
        // Parse the date and create range for historical query
        const targetDate = new Date(date)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        // For very recent dates, use current quote instead
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (targetDate >= today) {
            // Use current quote for today or future dates
            const quote = await yahooFinance.quote(symbol)
            return NextResponse.json({
                symbol,
                date,
                price: quote.regularMarketPrice,
                currency: quote.currency,
                source: "current"
            })
        }

        // Fetch historical data for past dates
        const historical = await yahooFinance.historical(symbol, {
            period1: targetDate,
            period2: nextDay,
            interval: "1d"
        })

        if (historical && historical.length > 0) {
            // Use the close price of the requested date
            const dayData = historical[0]
            return NextResponse.json({
                symbol,
                date,
                price: dayData.close,
                open: dayData.open,
                high: dayData.high,
                low: dayData.low,
                currency: "USD", // Yahoo historical doesn't always include currency
                source: "historical"
            })
        }

        // If no data found for exact date, try to get closest available
        const extendedHistorical = await yahooFinance.historical(symbol, {
            period1: new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
            period2: nextDay,
            interval: "1d"
        })

        if (extendedHistorical && extendedHistorical.length > 0) {
            // Get the closest date
            const closest = extendedHistorical[extendedHistorical.length - 1]
            return NextResponse.json({
                symbol,
                date,
                price: closest.close,
                actualDate: closest.date,
                currency: "USD",
                source: "nearest",
                note: "No data for exact date, using closest available"
            })
        }

        return NextResponse.json({
            error: "No historical data available for this date",
            symbol,
            date
        }, { status: 404 })

    } catch (error: any) {
        console.error("Historical Price Error:", {
            message: error.message,
            symbol,
            date
        })
        return NextResponse.json({
            error: error.message || "Failed to fetch historical price"
        }, { status: 500 })
    }
}
