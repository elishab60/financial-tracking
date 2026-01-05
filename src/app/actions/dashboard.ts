"use server"

import { getAssets } from "./assets"
import { DashboardStats } from "@/types"

export async function getDashboardStats(): Promise<DashboardStats> {
    const assets = await getAssets()

    const totalAssets = assets
        .filter(a => a.type !== 'debt')
        .reduce((acc, curr: any) => acc + (curr.current_value || 0), 0)

    const totalDebts = assets
        .filter(a => a.type === 'debt')
        .reduce((acc, curr: any) => acc + (curr.current_value || 0), 0)

    const totalNetWorth = totalAssets - totalDebts

    // Placeholder for allocation and trends (to be improved with history)
    return {
        totalNetWorth,
        totalAssets,
        totalDebts,
        changeValue: 0,
        changePercentage: 0,
        allocation: [
            { name: "Cash", value: assets.filter(a => a.type === 'cash').reduce((acc, curr: any) => acc + curr.current_value, 0), color: "#ffffff" },
            { name: "Stocks", value: assets.filter(a => a.type === 'stock').reduce((acc, curr: any) => acc + curr.current_value, 0), color: "#a1a1aa" },
            { name: "Crypto", value: assets.filter(a => a.type === 'crypto').reduce((acc, curr: any) => acc + curr.current_value, 0), color: "#71717a" },
            { name: "Real Estate", value: assets.filter(a => a.type === 'real_estate').reduce((acc, curr: any) => acc + curr.current_value, 0), color: "#3f3f46" },
        ].filter(a => a.value > 0),
        topPositions: assets
            .sort((a: any, b: any) => b.current_value - a.current_value)
            .slice(0, 3)
            .map((a: any) => ({
                name: a.name,
                value: a.current_value
            }))
    }
}
