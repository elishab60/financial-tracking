"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts"

const data = [
    { date: "Jan", value: 85000 },
    { date: "Feb", value: 87200 },
    { date: "Mar", value: 86100 },
    { date: "Apr", value: 88500 },
    { date: "May", value: 92000 },
    { date: "Jun", value: 95400 },
    { date: "Jul", value: 98000 },
    { date: "Aug", value: 97500 },
    { date: "Sep", value: 101000 },
    { date: "Oct", value: 104500 },
    { date: "Nov", value: 107200 },
    { date: "Dec", value: 109300 },
]

export function NetWorthChart() {
    return (
        <Card className="bg-white/[0.02] border-white/[0.04] shadow-2xl backdrop-blur-3xl col-span-1 lg:col-span-3 rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
                <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Évolution du Patrimoine</CardTitle>
                <div className="flex bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
                    {['7J', '1M', '6M', '1A', 'ALL'].map((period) => (
                        <button
                            key={period}
                            className={`px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all ${period === '1A' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                                dy={15}
                            />
                            <YAxis
                                hide
                                domain={['dataMin - 5000', 'dataMax + 5000']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#09090b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                                itemStyle={{ color: '#D4AF37' }}
                                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#D4AF37"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
