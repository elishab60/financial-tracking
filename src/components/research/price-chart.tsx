"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, Time, CandlestickSeries, LineSeries, AreaSeries } from "lightweight-charts"
import { Loader2, CandlestickChart, LineChart, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChartDataPoint {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface PriceChartProps {
    symbol: string
    currency?: string
}

const timeRanges = [
    { label: "1J", value: "1d" },
    { label: "5J", value: "5d" },
    { label: "1M", value: "1mo" },
    { label: "3M", value: "3mo" },
    { label: "6M", value: "6mo" },
    { label: "1A", value: "1y" },
    { label: "5A", value: "5y" },
]

type ChartType = "candlestick" | "line" | "area"

export function PriceChart({ symbol, currency = "USD" }: PriceChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)

    const [range, setRange] = useState("1mo")
    const [chartType, setChartType] = useState<ChartType>("candlestick")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<ChartDataPoint[]>([])
    const [priceChange, setPriceChange] = useState<{ value: number; percent: number } | null>(null)

    // Fetch chart data
    useEffect(() => {
        if (!symbol) return

        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/finance/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`)
                if (!res.ok) throw new Error("Failed to fetch data")

                const json = await res.json()
                if (json.error) throw new Error(json.error)

                setData(json.data || [])

                // Calculate price change
                if (json.data && json.data.length > 1) {
                    const first = json.data[0].close
                    const last = json.data[json.data.length - 1].close
                    setPriceChange({
                        value: last - first,
                        percent: ((last - first) / first) * 100
                    })
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [symbol, range])

    // Create/update chart
    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return

        // Clean up existing chart
        if (chartRef.current) {
            chartRef.current.remove()
            chartRef.current = null
        }

        const chart: any = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#71717a",
                fontSize: 11,
            },
            grid: {
                vertLines: { color: "rgba(255,255,255,0.03)" },
                horzLines: { color: "rgba(255,255,255,0.03)" },
            },
            crosshair: {
                vertLine: { color: "rgba(255,255,255,0.1)", width: 1, style: 3 },
                horzLine: { color: "rgba(255,255,255,0.1)", width: 1, style: 3 },
            },
            rightPriceScale: {
                borderColor: "rgba(255,255,255,0.05)",
            },
            timeScale: {
                borderColor: "rgba(255,255,255,0.05)",
                timeVisible: true,
                secondsVisible: false,
            },
            handleScale: {
                mouseWheel: true,
                pinch: true,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: false,
            },
        })

        chartRef.current = chart

        const isPositive = priceChange ? priceChange.value >= 0 : true
        const mainColor = isPositive ? "#10b981" : "#f43f5e"
        const lightColor = isPositive ? "rgba(16, 185, 129, 0.1)" : "rgba(244, 63, 94, 0.1)"

        // Transform data for the chart
        const candleData = data.map(d => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }))

        const lineData = data.map(d => ({
            time: d.time as Time,
            value: d.close,
        }))

        if (chartType === "candlestick") {
            const series = chart.addSeries(CandlestickSeries, {
                upColor: "#10b981",
                downColor: "#f43f5e",
                borderUpColor: "#10b981",
                borderDownColor: "#f43f5e",
                wickUpColor: "#10b981",
                wickDownColor: "#f43f5e",
            })
            series.setData(candleData)
        } else if (chartType === "line") {
            const series = chart.addSeries(LineSeries, {
                color: mainColor,
                lineWidth: 2,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
            })
            series.setData(lineData)
        } else if (chartType === "area") {
            const series = chart.addSeries(AreaSeries, {
                lineColor: mainColor,
                topColor: lightColor,
                bottomColor: "transparent",
                lineWidth: 2,
            })
            series.setData(lineData)
        }

        chart.timeScale().fitContent()

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: 400,
                })
            }
        }

        window.addEventListener("resize", handleResize)
        handleResize()

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [data, chartType, priceChange])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.remove()
            }
        }
    }, [])

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Time Range Selector */}
                <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/5">
                    {timeRanges.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => setRange(r.value)}
                            className={cn(
                                "px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                                range === r.value
                                    ? "bg-white text-black"
                                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/5">
                    <button
                        onClick={() => setChartType("candlestick")}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            chartType === "candlestick"
                                ? "bg-white text-black"
                                : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                        title="Chandeliers"
                    >
                        <CandlestickChart className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setChartType("line")}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            chartType === "line"
                                ? "bg-white text-black"
                                : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                        title="Ligne"
                    >
                        <LineChart className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setChartType("area")}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            chartType === "area"
                                ? "bg-white text-black"
                                : "text-zinc-500 hover:text-white hover:bg-white/5"
                        )}
                        title="Zone"
                    >
                        <BarChart3 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <p className="text-rose-400 text-sm">{error}</p>
                    </div>
                )}
                <div ref={chartContainerRef} style={{ height: 400 }} />
            </div>
        </div>
    )
}
