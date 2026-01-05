"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface AllocationDonutProps {
    data: { name: string; value: number; color: string }[]
}

export function AllocationDonut({ data }: AllocationDonutProps) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0)

    return (
        <Card className="bg-white/[0.02] border-white/[0.04] shadow-2xl backdrop-blur-3xl rounded-[2rem]">
            <CardHeader className="p-8 pb-0">
                <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Répartition</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={8}
                                dataKey="value"
                                cornerRadius={6}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                ))}
                            </Pie>
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
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-8 space-y-4">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{item.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase">
                                {((item.value / total) * 100).toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
