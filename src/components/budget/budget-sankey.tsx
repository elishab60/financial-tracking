"use client"

import React, { useMemo, useState, useEffect } from "react"
import { sankey, sankeyLinkHorizontal, sankeyCenter } from "d3-sankey"
import { motion } from "framer-motion"

interface SankeyNode {
    id: string
    name: string
    color?: string
}

interface SankeyLink {
    source: string
    target: string
    value: number
    color?: string
}

interface BudgetSankeyProps {
    data: {
        nodes: SankeyNode[]
        links: SankeyLink[]
    }
    width?: number
    height?: number
}

export function BudgetSankey({ data, width = 1000, height = 500 }: BudgetSankeyProps) {
    const sankeyData = useMemo(() => {
        const nodes = data.nodes.map((d) => ({ ...d }))
        const links = data.links.map((d) => ({
            ...d,
            source: d.source,
            target: d.target,
        }))

        if (nodes.length === 0 || links.length === 0) return null

        const layout = sankey<SankeyNode, SankeyLink>()
            .nodeId((d: any) => d.id)
            .nodeWidth(4)
            .nodePadding(40)
            .nodeAlign(sankeyCenter)
            .extent([
                [0, 20],
                [width, height - 20],
            ])

        try {
            return layout({
                nodes: nodes as any,
                links: links as any,
            })
        } catch (e) {
            console.error("Sankey layout error:", e)
            return null
        }
    }, [data, width, height])

    if (!sankeyData) return null

    return (
        <svg width={width} height={height} className="overflow-visible">
            <defs>
                {sankeyData.links.map((link: any, i: number) => (
                    <linearGradient
                        key={`gradient-${i}`}
                        id={`gradient-${i}`}
                        gradientUnits="userSpaceOnUse"
                        x1={link.source.x1}
                        x2={link.target.x0}
                    >
                        <stop offset="0%" stopColor={link.source.color || "#4f46e5"} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={link.target.color || "#8b5cf6"} stopOpacity={0.2} />
                    </linearGradient>
                ))}
            </defs>

            <g>
                {sankeyData.links.map((link: any, i: number) => (
                    <motion.path
                        key={`link-${i}`}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        d={sankeyLinkHorizontal()(link) || ""}
                        fill="none"
                        stroke={`url(#gradient-${i})`}
                        strokeWidth={Math.max(1, link.width || 1)}
                        onMouseEnter={() => { }} // Optional: tooltips
                    />
                ))}

                {sankeyData.nodes.map((node: any, i: number) => (
                    <g key={`node-${i}`}>
                        <rect
                            x={node.x0}
                            y={node.y0}
                            width={node.x1 - node.x0}
                            height={node.y1 - node.y0}
                            fill={node.color || "#fff"}
                            rx={2}
                        />
                        <text
                            x={node.x0 < width / 2 ? node.x1 + 10 : node.x0 - 10}
                            y={(node.y0 + node.y1) / 2}
                            dy="0.35em"
                            textAnchor={node.x0 < width / 2 ? "start" : "end"}
                            className="text-[10px] font-medium fill-zinc-400"
                        >
                            {node.name}
                        </text>
                    </g>
                ))}
            </g>
        </svg>
    )
}
