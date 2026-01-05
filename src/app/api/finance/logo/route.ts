import { NextRequest, NextResponse } from "next/server"
import yahooFinance from "@/lib/yahoo-finance"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")
    const saveToId = searchParams.get("save_to")

    if (!symbol) {
        return new NextResponse("Symbol required", { status: 400 })
    }

    try {
        // Fetch profile to get website
        const summary = await yahooFinance.quoteSummary(symbol, { modules: ['summaryProfile'] })
        const website = summary?.summaryProfile?.website

        if (website) {
            try {
                // Extract domain (e.g., https://www.apple.com -> apple.com)
                const url = new URL(website)
                const domain = url.hostname.replace('www.', '')

                // Helper to save to DB
                const saveToDb = async (blob: Blob, contentType: string) => {
                    if (!saveToId) return
                    try {
                        const buffer = Buffer.from(await blob.arrayBuffer())
                        const base64 = `data:${contentType};base64,${buffer.toString('base64')}`
                        const supabase = await createClient()
                        await supabase.from('assets').update({ image: base64 }).eq('id', saveToId)
                        console.log(`[LOGO] Saved logo for ${symbol} to DB`)
                    } catch (dbError) {
                        console.error("[LOGO] Failed to save to DB", dbError)
                    }
                }

                // Strategy 1: Try Clearbit
                try {
                    const logoUrl = `https://logo.clearbit.com/${domain}`
                    // Set a timeout to avoid hanging
                    const imageRes = await fetch(logoUrl, { signal: AbortSignal.timeout(2000) })

                    if (imageRes.ok) {
                        const blob = await imageRes.blob()
                        const contentType = imageRes.headers.get("Content-Type") || "image/png"

                        // Async Save (Fire & Forget logic ideally, but we await to ensure it happens in serverless)
                        await saveToDb(blob, contentType)

                        return new NextResponse(blob, {
                            headers: {
                                "Content-Type": contentType,
                                // Aggressive caching since logos change rarely
                                "Cache-Control": "public, max-age=604800, mutable",
                            },
                        })
                    }
                } catch (e) {
                    // Start next strategy
                }

                // Strategy 2: Google Favicon (Robust Backup)
                try {
                    const googleFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
                    const backupRes = await fetch(googleFavicon, { signal: AbortSignal.timeout(2000) })

                    if (backupRes.ok) {
                        const blob = await backupRes.blob()
                        const contentType = backupRes.headers.get("Content-Type") || "image/png"

                        await saveToDb(blob, contentType)

                        return new NextResponse(blob, {
                            headers: {
                                "Content-Type": contentType,
                                "Cache-Control": "public, max-age=604800, mutable",
                            },
                        })
                    }
                } catch (e) {
                    console.error("Backup logo fetch failed", e)
                }

            } catch (e) {
                // URL parsing error
            }
        }

        // Fallback or 404
        return new NextResponse("Not found", { status: 404 })

    } catch (error) {
        console.error("Logo fetch error:", error)
        return new NextResponse("Error", { status: 500 })
    }
}
