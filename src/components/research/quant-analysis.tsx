"use client"

import { useEffect, useState } from "react"
import {
    Loader2,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    Zap,
    BarChart2,
    Brain,
    LineChart,
    ArrowUp,
    ArrowDown,
    Minus,
    Cpu,
    Shuffle,
    Gauge,
    Waves,
    Clock,
    RefreshCw,
    DollarSign,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuantAnalysisProps {
    symbol: string
}

interface HistoricalData {
    time: number
    open: number
    close: number
    high: number
    low: number
    volume: number
}

interface OptimalPrices {
    // Fibonacci-based levels
    fibonacci: {
        retracement236: number
        retracement382: number
        retracement500: number
        retracement618: number
        retracement786: number
        extension1618: number
    }
    // Dynamic Support/Resistance using clustering
    dynamicLevels: {
        strongSupport: number
        weakSupport: number
        strongResistance: number
        weakResistance: number
        clusterConfidence: number
    }
    // ML-based optimal prices
    optimalBuyPrice: number
    optimalSellPrice: number
    buyConfidence: number
    sellConfidence: number
    buyReasoning: string[]
    sellReasoning: string[]
    riskRewardRatio: number
    stopLoss: number
    takeProfit: number
}

interface AnalysisResult {
    // Linear Regression
    linearRegression: {
        slope: number
        intercept: number
        r2: number
        predictedPrice: number
        trendDirection: 'bullish' | 'bearish' | 'neutral'
        confidenceLevel: 'high' | 'medium' | 'low'
    }
    // Moving Averages
    movingAverages: {
        sma20: number
        sma50: number
        sma200: number
        ema12: number
        ema26: number
        macdLine: number
        signalLine: number
        macdHistogram: number
        trend: 'bullish' | 'bearish' | 'neutral'
    }
    // RSI
    rsi: {
        value: number
        signal: 'overbought' | 'oversold' | 'neutral'
    }
    // Stochastic Oscillator
    stochastic: {
        k: number
        d: number
        signal: 'overbought' | 'oversold' | 'neutral'
    }
    // ATR
    atr: {
        value: number
        percent: number
        level: 'high' | 'medium' | 'low'
    }
    // Momentum/ROC
    momentum: {
        roc10: number
        roc20: number
        signal: 'bullish' | 'bearish' | 'neutral'
    }
    // Volatility
    volatility: {
        dailyVolatility: number
        annualizedVolatility: number
        bollingerUpper: number
        bollingerLower: number
        bollingerMiddle: number
        level: 'high' | 'medium' | 'low'
    }
    // Support & Resistance
    levels: {
        support1: number
        support2: number
        resistance1: number
        resistance2: number
        pivotPoint: number
    }
    // ML Predictions
    mlPredictions: {
        knnPrediction: number
        knnConfidence: number
        monteCarlo: {
            median: number
            low: number
            high: number
            bullishProbability: number
        }
        exponentialSmoothing: number
        patternScore: number
        patternName: string
        consensusSignal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
        consensusScore: number
    }
    // Optimal Buy/Sell Prices
    optimalPrices: OptimalPrices
    // Current price for reference
    currentPrice: number
}

// Statistical helper functions
function mean(arr: number[]): number {
    if (arr.length === 0) return 0
    return arr.reduce((a, b) => a + b, 0) / arr.length
}

function standardDeviation(arr: number[]): number {
    if (arr.length === 0) return 0
    const avg = mean(arr)
    const squareDiffs = arr.map(value => Math.pow(value - avg, 2))
    return Math.sqrt(mean(squareDiffs))
}

function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    const n = x.length
    if (n === 0) return { slope: 0, intercept: 0, r2: 0 }
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0)

    const denominator = n * sumX2 - sumX * sumX
    if (denominator === 0) return { slope: 0, intercept: sumY / n, r2: 0 }

    const slope = (n * sumXY - sumX * sumY) / denominator
    const intercept = (sumY - slope * sumX) / n

    const yMean = sumY / n
    const ssTotal = y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0)
    const ssResidual = y.reduce((acc, yi, i) => acc + Math.pow(yi - (slope * x[i] + intercept), 2), 0)
    const r2 = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal)

    return { slope, intercept, r2: Math.max(0, r2) }
}

function calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0
    const slice = prices.slice(-period)
    return mean(slice)
}

function calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0
    const multiplier = 2 / (period + 1)
    let ema = calculateSMA(prices.slice(0, period), period)

    for (let i = period; i < prices.length; i++) {
        ema = (prices[i] - ema) * multiplier + ema
    }
    return ema
}

function calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50

    const changes = prices.slice(1).map((price, i) => price - prices[i])
    const gains = changes.map(c => c > 0 ? c : 0)
    const losses = changes.map(c => c < 0 ? -c : 0)

    let avgGain = mean(gains.slice(-period))
    let avgLoss = mean(losses.slice(-period))

    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
}

function calculateStochastic(closes: number[], highs: number[], lows: number[], period: number = 14): { k: number; d: number } {
    if (closes.length < period) return { k: 50, d: 50 }

    const recentHighs = highs.slice(-period)
    const recentLows = lows.slice(-period)
    const highestHigh = Math.max(...recentHighs)
    const lowestLow = Math.min(...recentLows)
    const currentClose = closes[closes.length - 1]

    const k = highestHigh === lowestLow ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100

    // Calculate %D as 3-period SMA of %K
    const kValues: number[] = []
    for (let i = period; i <= closes.length; i++) {
        const h = Math.max(...highs.slice(i - period, i))
        const l = Math.min(...lows.slice(i - period, i))
        const c = closes[i - 1]
        kValues.push(h === l ? 50 : ((c - l) / (h - l)) * 100)
    }
    const d = kValues.length >= 3 ? mean(kValues.slice(-3)) : k

    return { k, d }
}

function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 0

    const trueRanges: number[] = []
    for (let i = 1; i < closes.length; i++) {
        const tr = Math.max(
            highs[i] - lows[i],
            Math.abs(highs[i] - closes[i - 1]),
            Math.abs(lows[i] - closes[i - 1])
        )
        trueRanges.push(tr)
    }

    return mean(trueRanges.slice(-period))
}

function calculateROC(prices: number[], period: number): number {
    if (prices.length <= period) return 0
    const current = prices[prices.length - 1]
    const past = prices[prices.length - 1 - period]
    return past === 0 ? 0 : ((current - past) / past) * 100
}

function calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2) {
    const sma = calculateSMA(prices, period)
    const slice = prices.slice(-period)
    const std = standardDeviation(slice)

    return {
        upper: sma + multiplier * std,
        middle: sma,
        lower: sma - multiplier * std
    }
}

function calculatePivotPoints(high: number, low: number, close: number) {
    const pivot = (high + low + close) / 3
    const r1 = 2 * pivot - low
    const r2 = pivot + (high - low)
    const s1 = 2 * pivot - high
    const s2 = pivot - (high - low)

    return { pivot, r1, r2, s1, s2 }
}

// ============ MACHINE LEARNING ALGORITHMS ============

// K-Nearest Neighbors for price prediction
function knnPredict(prices: number[], k: number = 5, lookback: number = 10, horizon: number = 7): { prediction: number; confidence: number } {
    if (prices.length < lookback + horizon + k) {
        return { prediction: prices[prices.length - 1], confidence: 0 }
    }

    // Create feature vectors (price patterns)
    const patterns: { features: number[]; futureChange: number }[] = []

    for (let i = lookback; i < prices.length - horizon; i++) {
        const features = prices.slice(i - lookback, i).map((p, idx, arr) =>
            idx === 0 ? 0 : (p - arr[idx - 1]) / arr[idx - 1] * 100
        )
        const futurePrice = prices[i + horizon]
        const currentPrice = prices[i]
        const futureChange = (futurePrice - currentPrice) / currentPrice * 100
        patterns.push({ features, futureChange })
    }

    // Current pattern (last lookback days)
    const currentFeatures = prices.slice(-lookback).map((p, idx, arr) =>
        idx === 0 ? 0 : (p - arr[idx - 1]) / arr[idx - 1] * 100
    )

    // Calculate distances to all historical patterns
    const distances = patterns.map((pattern, idx) => {
        const distance = Math.sqrt(
            pattern.features.reduce((sum, f, i) => sum + Math.pow(f - currentFeatures[i], 2), 0)
        )
        return { distance, futureChange: pattern.futureChange, idx }
    })

    // Sort by distance and get k nearest neighbors
    distances.sort((a, b) => a.distance - b.distance)
    const kNearest = distances.slice(0, k)

    // Weighted average prediction (closer patterns have more weight)
    const totalWeight = kNearest.reduce((sum, n) => sum + 1 / (n.distance + 0.001), 0)
    const predictedChange = kNearest.reduce((sum, n) =>
        sum + (n.futureChange * (1 / (n.distance + 0.001))) / totalWeight, 0
    )

    // Calculate confidence based on variance of predictions
    const predictions = kNearest.map(n => n.futureChange)
    const variance = standardDeviation(predictions)
    const confidence = Math.max(0, Math.min(100, 100 - variance * 5))

    const currentPrice = prices[prices.length - 1]
    const prediction = currentPrice * (1 + predictedChange / 100)

    return { prediction, confidence }
}

// Monte Carlo Simulation for price range prediction
function monteCarloSimulation(prices: number[], simulations: number = 1000, days: number = 7): { median: number; low: number; high: number; bullishProbability: number } {
    if (prices.length < 30) {
        const currentPrice = prices[prices.length - 1] || 0
        return { median: currentPrice, low: currentPrice, high: currentPrice, bullishProbability: 50 }
    }

    // Calculate daily returns
    const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]))
    const meanReturn = mean(returns)
    const stdReturn = standardDeviation(returns)

    const currentPrice = prices[prices.length - 1]
    const finalPrices: number[] = []

    // Run simulations
    for (let sim = 0; sim < simulations; sim++) {
        let price = currentPrice
        for (let d = 0; d < days; d++) {
            // Generate random return using Box-Muller transform
            const u1 = Math.random()
            const u2 = Math.random()
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
            const dailyReturn = meanReturn + stdReturn * z
            price = price * Math.exp(dailyReturn)
        }
        finalPrices.push(price)
    }

    // Sort to get percentiles
    finalPrices.sort((a, b) => a - b)
    const low = finalPrices[Math.floor(simulations * 0.1)]  // 10th percentile
    const median = finalPrices[Math.floor(simulations * 0.5)]  // 50th percentile
    const high = finalPrices[Math.floor(simulations * 0.9)]  // 90th percentile

    // Calculate probability of going up
    const bullishCount = finalPrices.filter(p => p > currentPrice).length
    const bullishProbability = (bullishCount / simulations) * 100

    return { median, low, high, bullishProbability }
}

// Exponential Smoothing (Holt's method for trend)
function exponentialSmoothing(prices: number[], alpha: number = 0.3, beta: number = 0.1, horizon: number = 7): number {
    if (prices.length < 3) return prices[prices.length - 1] || 0

    // Initialize
    let level = prices[0]
    let trend = prices[1] - prices[0]

    // Apply Holt's exponential smoothing
    for (let i = 1; i < prices.length; i++) {
        const newLevel = alpha * prices[i] + (1 - alpha) * (level + trend)
        const newTrend = beta * (newLevel - level) + (1 - beta) * trend
        level = newLevel
        trend = newTrend
    }

    // Forecast
    return level + horizon * trend
}

// Pattern Recognition (simplified candlestick patterns)
function recognizePatterns(opens: number[], closes: number[], highs: number[], lows: number[]): { score: number; patternName: string } {
    if (opens.length < 5) return { score: 50, patternName: 'Données insuffisantes' }

    const n = opens.length
    let score = 50
    let patternName = 'Neutre'

    // Get last few candles
    const getCandle = (i: number) => ({
        open: opens[n - 1 - i],
        close: closes[n - 1 - i],
        high: highs[n - 1 - i],
        low: lows[n - 1 - i],
        body: closes[n - 1 - i] - opens[n - 1 - i],
        isBullish: closes[n - 1 - i] > opens[n - 1 - i]
    })

    const c0 = getCandle(0)  // Most recent
    const c1 = getCandle(1)
    const c2 = getCandle(2)

    const avgBody = Math.abs(mean(closes.slice(-10).map((c, i) => c - opens[opens.length - 10 + i])))

    // Hammer (bullish reversal)
    const lowerShadow0 = Math.min(c0.open, c0.close) - c0.low
    const upperShadow0 = c0.high - Math.max(c0.open, c0.close)
    if (lowerShadow0 > Math.abs(c0.body) * 2 && upperShadow0 < Math.abs(c0.body) * 0.5) {
        score += 15
        patternName = 'Marteau (Bullish)'
    }

    // Shooting Star (bearish reversal)
    if (upperShadow0 > Math.abs(c0.body) * 2 && lowerShadow0 < Math.abs(c0.body) * 0.5) {
        score -= 15
        patternName = 'Étoile Filante (Bearish)'
    }

    // Engulfing patterns
    if (c0.isBullish && !c1.isBullish && c0.body > Math.abs(c1.body) * 1.5) {
        score += 20
        patternName = 'Englobante Haussière'
    }
    if (!c0.isBullish && c1.isBullish && Math.abs(c0.body) > c1.body * 1.5) {
        score -= 20
        patternName = 'Englobante Baissière'
    }

    // Morning Star (bullish)
    if (!c2.isBullish && Math.abs(c1.body) < avgBody * 0.3 && c0.isBullish && c0.close > (c2.open + c2.close) / 2) {
        score += 25
        patternName = 'Étoile du Matin (Bullish)'
    }

    // Evening Star (bearish)
    if (c2.isBullish && Math.abs(c1.body) < avgBody * 0.3 && !c0.isBullish && c0.close < (c2.open + c2.close) / 2) {
        score -= 25
        patternName = 'Étoile du Soir (Bearish)'
    }

    // Three white soldiers / Three black crows
    if (c0.isBullish && c1.isBullish && c2.isBullish && c0.close > c1.close && c1.close > c2.close) {
        score += 20
        patternName = 'Trois Soldats Blancs'
    }
    if (!c0.isBullish && !c1.isBullish && !c2.isBullish && c0.close < c1.close && c1.close < c2.close) {
        score -= 20
        patternName = 'Trois Corbeaux Noirs'
    }

    // Doji (indecision)
    if (Math.abs(c0.body) < avgBody * 0.1) {
        patternName = patternName === 'Neutre' ? 'Doji (Indécision)' : patternName
    }

    return { score: Math.max(0, Math.min(100, score)), patternName }
}

// Consensus Signal Calculator
function calculateConsensus(
    lr: { trendDirection: string },
    ma: { trend: string },
    rsi: { signal: string },
    stochastic: { signal: string },
    momentum: { signal: string },
    patternScore: number,
    bullishProbability: number
): { signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'; score: number } {
    let score = 50

    // Linear Regression (+/- 10)
    if (lr.trendDirection === 'bullish') score += 10
    else if (lr.trendDirection === 'bearish') score -= 10

    // Moving Averages (+/- 15)
    if (ma.trend === 'bullish') score += 15
    else if (ma.trend === 'bearish') score -= 15

    // RSI (+/- 10)
    if (rsi.signal === 'oversold') score += 10
    else if (rsi.signal === 'overbought') score -= 10

    // Stochastic (+/- 10)
    if (stochastic.signal === 'oversold') score += 10
    else if (stochastic.signal === 'overbought') score -= 10

    // Momentum (+/- 10)
    if (momentum.signal === 'bullish') score += 10
    else if (momentum.signal === 'bearish') score -= 10

    // Pattern Score (+/- 15 based on deviation from 50)
    score += (patternScore - 50) * 0.3

    // Monte Carlo probability (+/- 10)
    score += (bullishProbability - 50) * 0.2

    score = Math.max(0, Math.min(100, score))

    let signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
    if (score >= 75) signal = 'strong_buy'
    else if (score >= 60) signal = 'buy'
    else if (score >= 40) signal = 'hold'
    else if (score >= 25) signal = 'sell'
    else signal = 'strong_sell'

    return { signal, score }
}

// ============ OPTIMAL BUY/SELL PRICE ALGORITHMS ============

// Fibonacci Retracement Calculator
function calculateFibonacciLevels(highs: number[], lows: number[], closes: number[]) {
    if (highs.length < 20 || lows.length < 20) {
        const currentPrice = closes[closes.length - 1] || 0
        return {
            retracement236: currentPrice,
            retracement382: currentPrice,
            retracement500: currentPrice,
            retracement618: currentPrice,
            retracement786: currentPrice,
            extension1618: currentPrice,
            swingHigh: currentPrice,
            swingLow: currentPrice
        }
    }

    // Find swing high and swing low from recent 50 periods
    const lookback = Math.min(50, highs.length)
    const recentHighs = highs.slice(-lookback)
    const recentLows = lows.slice(-lookback)

    const swingHigh = Math.max(...recentHighs)
    const swingLow = Math.min(...recentLows)
    const range = swingHigh - swingLow

    // Determine trend direction
    const currentPrice = closes[closes.length - 1]
    const midpoint = (swingHigh + swingLow) / 2
    const isUptrend = currentPrice > midpoint

    // Calculate retracement levels based on trend
    if (isUptrend) {
        // In uptrend: retracements are from high going down
        return {
            retracement236: swingHigh - range * 0.236,
            retracement382: swingHigh - range * 0.382,
            retracement500: swingHigh - range * 0.500,
            retracement618: swingHigh - range * 0.618,
            retracement786: swingHigh - range * 0.786,
            extension1618: swingHigh + range * 0.618,
            swingHigh,
            swingLow
        }
    } else {
        // In downtrend: retracements are from low going up
        return {
            retracement236: swingLow + range * 0.236,
            retracement382: swingLow + range * 0.382,
            retracement500: swingLow + range * 0.500,
            retracement618: swingLow + range * 0.618,
            retracement786: swingLow + range * 0.786,
            extension1618: swingLow - range * 0.618,
            swingHigh,
            swingLow
        }
    }
}

// K-Means Clustering for Dynamic Support/Resistance
function kMeansCluster(prices: number[], k: number = 5, maxIterations: number = 100): number[] {
    if (prices.length < k) return prices.slice()

    // Initialize centroids using k-means++ approach
    const centroids: number[] = []
    const sortedPrices = [...prices].sort((a, b) => a - b)

    // Pick evenly spaced initial centroids
    for (let i = 0; i < k; i++) {
        const idx = Math.floor((i / k) * sortedPrices.length)
        centroids.push(sortedPrices[idx])
    }

    for (let iter = 0; iter < maxIterations; iter++) {
        // Assign points to clusters
        const clusters: number[][] = Array.from({ length: k }, () => [])

        for (const price of prices) {
            let minDist = Infinity
            let closestCentroid = 0

            for (let c = 0; c < k; c++) {
                const dist = Math.abs(price - centroids[c])
                if (dist < minDist) {
                    minDist = dist
                    closestCentroid = c
                }
            }
            clusters[closestCentroid].push(price)
        }

        // Update centroids
        let converged = true
        for (let c = 0; c < k; c++) {
            if (clusters[c].length > 0) {
                const newCentroid = clusters[c].reduce((a, b) => a + b, 0) / clusters[c].length
                if (Math.abs(newCentroid - centroids[c]) > 0.001) {
                    converged = false
                }
                centroids[c] = newCentroid
            }
        }

        if (converged) break
    }

    return centroids.sort((a, b) => a - b)
}

function calculateDynamicSupportResistance(closes: number[], currentPrice: number) {
    const clusterCentroids = kMeansCluster(closes.slice(-100), 6)

    // Separate into support (below current) and resistance (above current)
    const supports = clusterCentroids.filter(c => c < currentPrice).sort((a, b) => b - a)
    const resistances = clusterCentroids.filter(c => c > currentPrice).sort((a, b) => a - b)

    // Calculate cluster confidence based on how tight the clusters are
    const priceRange = Math.max(...closes.slice(-100)) - Math.min(...closes.slice(-100))
    const avgClusterSpread = clusterCentroids.length > 1
        ? clusterCentroids.slice(1).reduce((sum, c, i) => sum + Math.abs(c - clusterCentroids[i]), 0) / (clusterCentroids.length - 1)
        : priceRange
    const clusterConfidence = Math.min(100, Math.max(0, (1 - avgClusterSpread / priceRange) * 100 + 30))

    return {
        strongSupport: supports[0] || currentPrice * 0.95,
        weakSupport: supports[1] || supports[0] || currentPrice * 0.90,
        strongResistance: resistances[0] || currentPrice * 1.05,
        weakResistance: resistances[1] || resistances[0] || currentPrice * 1.10,
        clusterConfidence
    }
}

// Ensemble Optimal Price Calculator
function calculateOptimalPrices(
    currentPrice: number,
    fibonacci: ReturnType<typeof calculateFibonacciLevels>,
    dynamicLevels: ReturnType<typeof calculateDynamicSupportResistance>,
    rsiValue: number,
    stochasticK: number,
    atrValue: number,
    maTrend: string,
    monteCarloLow: number,
    monteCarloHigh: number,
    bullishProbability: number,
    consensusScore: number
): OptimalPrices {
    const buyReasoning: string[] = []
    const sellReasoning: string[] = []

    // === CALCULATE OPTIMAL BUY PRICE ===
    const buyTargets: { price: number; weight: number; reason: string }[] = []

    // Fibonacci 61.8% (golden ratio) - strongest retracement
    buyTargets.push({
        price: fibonacci.retracement618,
        weight: 25,
        reason: 'Fibonacci 61.8% (Golden Ratio)'
    })

    // Fibonacci 50% zone
    buyTargets.push({
        price: fibonacci.retracement500,
        weight: 15,
        reason: 'Fibonacci 50%'
    })

    // Strong support from clustering
    buyTargets.push({
        price: dynamicLevels.strongSupport,
        weight: 20,
        reason: 'Support dynamique fort (K-Means)'
    })

    // Monte Carlo 10th percentile
    buyTargets.push({
        price: monteCarloLow,
        weight: 15,
        reason: 'Monte Carlo 10e percentile'
    })

    // RSI-adjusted target
    if (rsiValue < 30) {
        buyTargets.push({
            price: currentPrice * 0.98,
            weight: 15,
            reason: 'RSI survendu - entrée proche'
        })
    } else if (rsiValue > 70) {
        buyTargets.push({
            price: fibonacci.retracement786,
            weight: 10,
            reason: 'RSI suracheté - attendre correction'
        })
    }

    // Calculate weighted average buy price
    const totalBuyWeight = buyTargets.reduce((sum, t) => sum + t.weight, 0)
    const optimalBuyPrice = buyTargets.reduce((sum, t) => sum + t.price * t.weight, 0) / totalBuyWeight

    // Top 3 buy reasons
    buyTargets.sort((a, b) => b.weight - a.weight)
    buyReasoning.push(...buyTargets.slice(0, 3).map(t => t.reason))

    // === CALCULATE OPTIMAL SELL PRICE ===
    const sellTargets: { price: number; weight: number; reason: string }[] = []

    // Fibonacci extension 161.8%
    sellTargets.push({
        price: fibonacci.extension1618,
        weight: 20,
        reason: 'Extension Fibonacci 161.8%'
    })

    // Strong resistance from clustering
    sellTargets.push({
        price: dynamicLevels.strongResistance,
        weight: 25,
        reason: 'Résistance dynamique forte (K-Means)'
    })

    // Monte Carlo 90th percentile
    sellTargets.push({
        price: monteCarloHigh,
        weight: 20,
        reason: 'Monte Carlo 90e percentile'
    })

    // Fibonacci 23.6% (first major level)
    sellTargets.push({
        price: fibonacci.retracement236,
        weight: 10,
        reason: 'Fibonacci 23.6%'
    })

    // Trend-adjusted target
    if (maTrend === 'bullish') {
        sellTargets.push({
            price: currentPrice * 1.15,
            weight: 15,
            reason: 'Tendance haussière - objectif +15%'
        })
    } else if (maTrend === 'bearish') {
        sellTargets.push({
            price: currentPrice * 1.05,
            weight: 15,
            reason: 'Tendance baissière - objectif conservateur'
        })
    }

    // Calculate weighted average sell price
    const totalSellWeight = sellTargets.reduce((sum, t) => sum + t.weight, 0)
    const optimalSellPrice = sellTargets.reduce((sum, t) => sum + t.price * t.weight, 0) / totalSellWeight

    // Top 3 sell reasons
    sellTargets.sort((a, b) => b.weight - a.weight)
    sellReasoning.push(...sellTargets.slice(0, 3).map(t => t.reason))

    // === CALCULATE CONFIDENCE SCORES ===
    // Buy confidence: based on RSI, consensus, and cluster confidence
    let buyConfidence = 50
    if (rsiValue < 40) buyConfidence += 15
    if (rsiValue < 30) buyConfidence += 10
    if (stochasticK < 30) buyConfidence += 10
    if (consensusScore > 60) buyConfidence += 10
    buyConfidence += dynamicLevels.clusterConfidence * 0.15
    buyConfidence = Math.min(95, Math.max(20, buyConfidence))

    // Sell confidence
    let sellConfidence = 50
    if (rsiValue > 60) sellConfidence += 10
    if (rsiValue > 70) sellConfidence += 10
    if (stochasticK > 70) sellConfidence += 10
    if (bullishProbability > 50) sellConfidence += 10
    sellConfidence += dynamicLevels.clusterConfidence * 0.15
    sellConfidence = Math.min(95, Math.max(20, sellConfidence))

    // === RISK MANAGEMENT ===
    // ATR-based stop-loss (1.5x ATR below buy price)
    const stopLoss = optimalBuyPrice - (atrValue * 1.5)

    // Take-profit at optimal sell price
    const takeProfit = optimalSellPrice

    // Risk/Reward Ratio
    const risk = optimalBuyPrice - stopLoss
    const reward = takeProfit - optimalBuyPrice
    const riskRewardRatio = risk > 0 ? reward / risk : 0

    return {
        fibonacci: {
            retracement236: fibonacci.retracement236,
            retracement382: fibonacci.retracement382,
            retracement500: fibonacci.retracement500,
            retracement618: fibonacci.retracement618,
            retracement786: fibonacci.retracement786,
            extension1618: fibonacci.extension1618
        },
        dynamicLevels: {
            strongSupport: dynamicLevels.strongSupport,
            weakSupport: dynamicLevels.weakSupport,
            strongResistance: dynamicLevels.strongResistance,
            weakResistance: dynamicLevels.weakResistance,
            clusterConfidence: dynamicLevels.clusterConfidence
        },
        optimalBuyPrice,
        optimalSellPrice,
        buyConfidence,
        sellConfidence,
        buyReasoning,
        sellReasoning,
        riskRewardRatio,
        stopLoss,
        takeProfit
    }
}

export function QuantAnalysis({ symbol }: QuantAnalysisProps) {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [dataPoints, setDataPoints] = useState<number>(0)

    useEffect(() => {
        if (!symbol) return

        const fetchAndAnalyze = async () => {
            setLoading(true)
            setError(null)

            try {
                const res = await fetch(`/api/finance/chart?symbol=${encodeURIComponent(symbol)}&range=1y`)
                if (!res.ok) throw new Error("Failed to fetch data")

                const json = await res.json()
                if (!json.data || json.data.length === 0) throw new Error("No data available")

                const historicalData: HistoricalData[] = json.data
                setDataPoints(historicalData.length)
                const opens = historicalData.map(d => d.open)
                const closes = historicalData.map(d => d.close)
                const highs = historicalData.map(d => d.high)
                const lows = historicalData.map(d => d.low)
                const volumes = historicalData.map(d => d.volume)
                const currentPrice = closes[closes.length - 1]

                // Linear Regression
                const recentCloses = closes.slice(-30)
                const xValues = recentCloses.map((_, i) => i)
                const lr = linearRegression(xValues, recentCloses)
                const predictedPrice = lr.slope * (recentCloses.length + 7) + lr.intercept
                const trendDirection = lr.slope > 0.01 ? 'bullish' : lr.slope < -0.01 ? 'bearish' : 'neutral'
                const confidenceLevel = lr.r2 > 0.7 ? 'high' : lr.r2 > 0.4 ? 'medium' : 'low'

                // Moving Averages
                const sma20 = calculateSMA(closes, 20)
                const sma50 = calculateSMA(closes, 50)
                const sma200 = calculateSMA(closes, 200)
                const ema12 = calculateEMA(closes, 12)
                const ema26 = calculateEMA(closes, 26)
                const macdLine = ema12 - ema26
                const macdValues = closes.slice(26).map((_, i) => {
                    const sliceCloses = closes.slice(0, 26 + i + 1)
                    return calculateEMA(sliceCloses, 12) - calculateEMA(sliceCloses, 26)
                })
                const signalLine = calculateEMA(macdValues, 9)
                const macdHistogram = macdLine - signalLine
                const maTrend = currentPrice > sma50 && sma50 > sma200 ? 'bullish' :
                    currentPrice < sma50 && sma50 < sma200 ? 'bearish' : 'neutral'

                // RSI
                const rsiValue = calculateRSI(closes)
                const rsiSignal = rsiValue > 70 ? 'overbought' : rsiValue < 30 ? 'oversold' : 'neutral'

                // Stochastic
                const stoch = calculateStochastic(closes, highs, lows)
                const stochSignal = stoch.k > 80 ? 'overbought' : stoch.k < 20 ? 'oversold' : 'neutral'

                // ATR
                const atrValue = calculateATR(highs, lows, closes)
                const atrPercent = (atrValue / currentPrice) * 100
                const atrLevel = atrPercent > 3 ? 'high' : atrPercent > 1.5 ? 'medium' : 'low'

                // Momentum/ROC
                const roc10 = calculateROC(closes, 10)
                const roc20 = calculateROC(closes, 20)
                const momentumSignal = roc10 > 2 && roc20 > 0 ? 'bullish' :
                    roc10 < -2 && roc20 < 0 ? 'bearish' : 'neutral'

                // Volatility
                const returns = closes.slice(1).map((price, i) => Math.log(price / closes[i]))
                const dailyVolatility = standardDeviation(returns) * 100
                const annualizedVolatility = dailyVolatility * Math.sqrt(252)
                const bollinger = calculateBollingerBands(closes)
                const volatilityLevel = annualizedVolatility > 40 ? 'high' : annualizedVolatility > 20 ? 'medium' : 'low'

                // Support & Resistance
                const recentHigh = Math.max(...highs.slice(-20))
                const recentLow = Math.min(...lows.slice(-20))
                const pivotData = calculatePivotPoints(recentHigh, recentLow, currentPrice)

                // ML Predictions
                const knnResult = knnPredict(closes, 5, 10, 7)
                const monteCarloResult = monteCarloSimulation(closes, 1000, 7)
                const expSmoothPrediction = exponentialSmoothing(closes, 0.3, 0.1, 7)
                const patternResult = recognizePatterns(opens, closes, highs, lows)

                const consensus = calculateConsensus(
                    { trendDirection },
                    { trend: maTrend },
                    { signal: rsiSignal },
                    { signal: stochSignal },
                    { signal: momentumSignal },
                    patternResult.score,
                    monteCarloResult.bullishProbability
                )

                // Optimal Buy/Sell Prices
                const fibonacci = calculateFibonacciLevels(highs, lows, closes)
                const dynamicLevels = calculateDynamicSupportResistance(closes, currentPrice)
                const optimalPricesResult = calculateOptimalPrices(
                    currentPrice,
                    fibonacci,
                    dynamicLevels,
                    rsiValue,
                    stoch.k,
                    atrValue,
                    maTrend,
                    monteCarloResult.low,
                    monteCarloResult.high,
                    monteCarloResult.bullishProbability,
                    consensus.score
                )

                setAnalysis({
                    linearRegression: {
                        slope: lr.slope,
                        intercept: lr.intercept,
                        r2: lr.r2,
                        predictedPrice,
                        trendDirection: trendDirection as 'bullish' | 'bearish' | 'neutral',
                        confidenceLevel: confidenceLevel as 'high' | 'medium' | 'low'
                    },
                    movingAverages: {
                        sma20, sma50, sma200, ema12, ema26,
                        macdLine, signalLine, macdHistogram,
                        trend: maTrend as 'bullish' | 'bearish' | 'neutral'
                    },
                    rsi: { value: rsiValue, signal: rsiSignal as 'overbought' | 'oversold' | 'neutral' },
                    stochastic: { k: stoch.k, d: stoch.d, signal: stochSignal as 'overbought' | 'oversold' | 'neutral' },
                    atr: { value: atrValue, percent: atrPercent, level: atrLevel as 'high' | 'medium' | 'low' },
                    momentum: { roc10, roc20, signal: momentumSignal as 'bullish' | 'bearish' | 'neutral' },
                    volatility: {
                        dailyVolatility, annualizedVolatility,
                        bollingerUpper: bollinger.upper,
                        bollingerLower: bollinger.lower,
                        bollingerMiddle: bollinger.middle,
                        level: volatilityLevel as 'high' | 'medium' | 'low'
                    },
                    levels: {
                        support1: pivotData.s1, support2: pivotData.s2,
                        resistance1: pivotData.r1, resistance2: pivotData.r2,
                        pivotPoint: pivotData.pivot
                    },
                    mlPredictions: {
                        knnPrediction: knnResult.prediction,
                        knnConfidence: knnResult.confidence,
                        monteCarlo: monteCarloResult,
                        exponentialSmoothing: expSmoothPrediction,
                        patternScore: patternResult.score,
                        patternName: patternResult.patternName,
                        consensusSignal: consensus.signal,
                        consensusScore: consensus.score
                    },
                    optimalPrices: optimalPricesResult,
                    currentPrice
                })
                setLastUpdated(new Date())
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAndAnalyze()
    }, [symbol])

    const formatCurrency = (num: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num)

    const formatPercent = (num: number) => `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`

    if (loading) {
        return (
            <div className="glass-card rounded-3xl p-8">
                <div className="flex items-center justify-center gap-4">
                    <Loader2 className="w-6 h-6 text-gold animate-spin" />
                    <span className="text-zinc-400 text-sm font-bold">Analyse quantitative & ML en cours...</span>
                </div>
            </div>
        )
    }

    if (error || !analysis) {
        return (
            <div className="glass-card rounded-3xl p-6">
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-rose-400 text-sm">{error || "Analyse non disponible"}</p>
                </div>
            </div>
        )
    }

    const { linearRegression: lr, movingAverages: ma, rsi, stochastic, atr, momentum, volatility, levels, mlPredictions, optimalPrices, currentPrice } = analysis
    const priceChange = ((lr.predictedPrice - currentPrice) / currentPrice) * 100

    const consensusColors = {
        strong_buy: 'bg-emerald-500 text-white',
        buy: 'bg-emerald-500/20 text-emerald-400',
        hold: 'bg-zinc-500/20 text-zinc-400',
        sell: 'bg-rose-500/20 text-rose-400',
        strong_sell: 'bg-rose-500 text-white'
    }
    const consensusLabels = {
        strong_buy: 'ACHAT FORT',
        buy: 'ACHAT',
        hold: 'CONSERVER',
        sell: 'VENTE',
        strong_sell: 'VENTE FORTE'
    }

    return (
        <div className="glass-card rounded-3xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-gold" />
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        Analyse Quantitative & Machine Learning
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    {lastUpdated && (
                        <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                            <Clock className="w-3 h-3" />
                            <span>
                                Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-zinc-600">•</span>
                            <span>{dataPoints} jours de données</span>
                        </div>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-gold transition-colors"
                        title="Rafraîchir les données"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ML Consensus Signal */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-4">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">
                        Signal Consensus ML
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className={cn(
                            "text-xl font-black px-6 py-3 rounded-xl",
                            consensusColors[mlPredictions.consensusSignal]
                        )}>
                            {consensusLabels[mlPredictions.consensusSignal]}
                        </span>
                        <p className="text-[10px] text-zinc-500 font-bold mt-3">
                            Score de confiance: {mlPredictions.consensusScore.toFixed(0)}/100
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Pattern Détecté</p>
                        <p className="text-sm font-bold text-white">{mlPredictions.patternName}</p>
                    </div>
                </div>
            </div>

            {/* ============ OPTIMAL PRICES SECTION ============ */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-gold/10 to-rose-500/15 border-2 border-gold/30 shadow-lg shadow-gold/5">
                <div className="flex items-center gap-2 mb-5">
                    <DollarSign className="w-5 h-5 text-gold" />
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">
                        Prix Optimaux d'Achat & Vente
                    </span>
                    <span className="ml-auto text-[9px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">
                        Fibonacci + K-Means + ML
                    </span>
                </div>

                {/* Main Buy/Sell Prices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Optimal Buy */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <ArrowDown className="w-4 h-4 text-emerald-400" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                Prix d'Achat Optimal
                            </span>
                        </div>
                        <div className="flex items-end justify-between mb-3">
                            <div>
                                <p className="text-3xl font-black text-emerald-400">
                                    {formatCurrency(optimalPrices.optimalBuyPrice)}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-bold mt-1">
                                    {formatPercent(((optimalPrices.optimalBuyPrice - currentPrice) / currentPrice) * 100)} vs prix actuel
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span className="text-lg font-black text-emerald-400">
                                        {optimalPrices.buyConfidence.toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-[9px] text-zinc-600 font-bold">Confiance</p>
                            </div>
                        </div>
                        <div className="space-y-1.5 pt-3 border-t border-emerald-500/20">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Raisons :</p>
                            {optimalPrices.buyReasoning.map((reason, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <span className="text-[10px] text-zinc-400 font-medium">{reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Optimal Sell */}
                    <div className="p-5 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-900/20 border border-rose-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <ArrowUp className="w-4 h-4 text-rose-400" />
                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                                Prix de Vente Optimal
                            </span>
                        </div>
                        <div className="flex items-end justify-between mb-3">
                            <div>
                                <p className="text-3xl font-black text-rose-400">
                                    {formatCurrency(optimalPrices.optimalSellPrice)}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-bold mt-1">
                                    {formatPercent(((optimalPrices.optimalSellPrice - currentPrice) / currentPrice) * 100)} vs prix actuel
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <CheckCircle2 className="w-3 h-3 text-rose-400" />
                                    <span className="text-lg font-black text-rose-400">
                                        {optimalPrices.sellConfidence.toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-[9px] text-zinc-600 font-bold">Confiance</p>
                            </div>
                        </div>
                        <div className="space-y-1.5 pt-3 border-t border-rose-500/20">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Raisons :</p>
                            {optimalPrices.sellReasoning.map((reason, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                    <span className="text-[10px] text-zinc-400 font-medium">{reason}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Risk Management */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Stop-Loss</span>
                        </div>
                        <p className="text-xl font-black text-amber-400">{formatCurrency(optimalPrices.stopLoss)}</p>
                        <p className="text-[9px] text-zinc-600 font-bold mt-1">1.5x ATR sous le prix d'achat</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Take-Profit</span>
                        </div>
                        <p className="text-xl font-black text-cyan-400">{formatCurrency(optimalPrices.takeProfit)}</p>
                        <p className="text-[9px] text-zinc-600 font-bold mt-1">Prix de vente optimal</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Gauge className="w-4 h-4 text-purple-400" />
                            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Risk/Reward</span>
                        </div>
                        <p className={cn(
                            "text-xl font-black",
                            optimalPrices.riskRewardRatio >= 2 ? "text-emerald-400" :
                                optimalPrices.riskRewardRatio >= 1 ? "text-amber-400" : "text-rose-400"
                        )}>
                            1:{optimalPrices.riskRewardRatio.toFixed(2)}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-bold mt-1">
                            {optimalPrices.riskRewardRatio >= 2 ? "Excellent" :
                                optimalPrices.riskRewardRatio >= 1.5 ? "Bon" :
                                    optimalPrices.riskRewardRatio >= 1 ? "Acceptable" : "À risque"}
                        </p>
                    </div>
                </div>

                {/* Fibonacci & Dynamic Levels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fibonacci Levels */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-4 h-4 text-indigo-400" />
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                Niveaux Fibonacci
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <p className="text-[8px] text-zinc-600 font-bold mb-1">23.6%</p>
                                <p className="text-xs font-bold text-zinc-300">{formatCurrency(optimalPrices.fibonacci.retracement236)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] text-zinc-600 font-bold mb-1">38.2%</p>
                                <p className="text-xs font-bold text-zinc-300">{formatCurrency(optimalPrices.fibonacci.retracement382)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] text-zinc-600 font-bold mb-1">50%</p>
                                <p className="text-xs font-bold text-zinc-300">{formatCurrency(optimalPrices.fibonacci.retracement500)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] text-gold font-bold mb-1">61.8% ★</p>
                                <p className="text-xs font-bold text-gold">{formatCurrency(optimalPrices.fibonacci.retracement618)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] text-zinc-600 font-bold mb-1">78.6%</p>
                                <p className="text-xs font-bold text-zinc-300">{formatCurrency(optimalPrices.fibonacci.retracement786)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] text-cyan-400 font-bold mb-1">Ext 161.8%</p>
                                <p className="text-xs font-bold text-cyan-400">{formatCurrency(optimalPrices.fibonacci.extension1618)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic S/R from K-Means */}
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Cpu className="w-4 h-4 text-pink-400" />
                            <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest">
                                S/R Dynamique (K-Means)
                            </span>
                            <span className="ml-auto text-[9px] font-bold text-zinc-500">
                                Conf: {optimalPrices.dynamicLevels.clusterConfidence.toFixed(0)}%
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-rose-400 font-bold">Résistance Forte</span>
                                <span className="text-xs font-bold text-rose-400">{formatCurrency(optimalPrices.dynamicLevels.strongResistance)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-rose-300 font-bold">Résistance Faible</span>
                                <span className="text-xs font-bold text-rose-300">{formatCurrency(optimalPrices.dynamicLevels.weakResistance)}</span>
                            </div>
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-emerald-300 font-bold">Support Faible</span>
                                <span className="text-xs font-bold text-emerald-300">{formatCurrency(optimalPrices.dynamicLevels.weakSupport)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-emerald-400 font-bold">Support Fort</span>
                                <span className="text-xs font-bold text-emerald-400">{formatCurrency(optimalPrices.dynamicLevels.strongSupport)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ML Predictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* KNN Prediction */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                            K-NN Prédiction (K=5)
                        </span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-2xl font-black text-white">{formatCurrency(mlPredictions.knnPrediction)}</p>
                            <p className="text-[10px] text-zinc-500 font-bold">
                                {formatPercent(((mlPredictions.knnPrediction - currentPrice) / currentPrice) * 100)} vs actuel
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-blue-400">{mlPredictions.knnConfidence.toFixed(0)}%</p>
                            <p className="text-[9px] text-zinc-600 font-bold">Confiance</p>
                        </div>
                    </div>
                </div>

                {/* Monte Carlo Simulation */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Shuffle className="w-4 h-4 text-orange-400" />
                        <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">
                            Monte Carlo (1000 sim.)
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-400 font-bold">{formatCurrency(mlPredictions.monteCarlo.high)}</span>
                            <span className="text-[9px] text-zinc-500">90e percentile</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white font-bold">{formatCurrency(mlPredictions.monteCarlo.median)}</span>
                            <span className="text-[9px] text-zinc-500">Médiane</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-rose-400 font-bold">{formatCurrency(mlPredictions.monteCarlo.low)}</span>
                            <span className="text-[9px] text-zinc-500">10e percentile</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/5 flex justify-between">
                            <span className="text-[10px] text-zinc-500 font-bold">Prob. hausse:</span>
                            <span className={cn(
                                "font-bold text-sm",
                                mlPredictions.monteCarlo.bullishProbability > 50 ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {mlPredictions.monteCarlo.bullishProbability.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exponential Smoothing & Linear Regression */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20">
                <div className="flex items-center gap-2 mb-4">
                    <LineChart className="w-4 h-4 text-gold" />
                    <span className="text-[9px] font-black text-gold uppercase tracking-widest">
                        Prédictions Prix (7 jours)
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Prix Actuel</p>
                        <p className="text-xl font-black text-white">{formatCurrency(currentPrice)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Rég. Linéaire</p>
                        <p className={cn(
                            "text-xl font-black",
                            priceChange >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {formatCurrency(lr.predictedPrice)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Exp. Smoothing</p>
                        <p className={cn(
                            "text-xl font-black",
                            mlPredictions.exponentialSmoothing >= currentPrice ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {formatCurrency(mlPredictions.exponentialSmoothing)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Confiance R²</p>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white">{(lr.r2 * 100).toFixed(1)}%</span>
                            <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                lr.confidenceLevel === 'high' ? "bg-emerald-500/20 text-emerald-400" :
                                    lr.confidenceLevel === 'medium' ? "bg-amber-500/20 text-amber-400" :
                                        "bg-zinc-500/20 text-zinc-400"
                            )}>
                                {lr.confidenceLevel === 'high' ? 'Élevée' : lr.confidenceLevel === 'medium' ? 'Moyenne' : 'Faible'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Indicators Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* RSI */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-zinc-500" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">RSI (14)</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-white">{rsi.value.toFixed(1)}</span>
                        <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-1 rounded-md",
                            rsi.signal === 'overbought' ? "bg-rose-500/20 text-rose-400" :
                                rsi.signal === 'oversold' ? "bg-emerald-500/20 text-emerald-400" :
                                    "bg-zinc-500/20 text-zinc-400"
                        )}>
                            {rsi.signal === 'overbought' ? 'Suracheté' : rsi.signal === 'oversold' ? 'Survendu' : 'Neutre'}
                        </span>
                    </div>
                    <div className="mt-3 h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all",
                                rsi.value > 70 ? "bg-rose-500" : rsi.value < 30 ? "bg-emerald-500" : "bg-gold"
                            )}
                            style={{ width: `${rsi.value}%` }}
                        />
                    </div>
                </div>

                {/* Stochastic */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Gauge className="w-4 h-4 text-zinc-500" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Stochastique</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500 font-bold">%K</span>
                            <span className={cn(
                                "text-sm font-bold",
                                stochastic.k > 80 ? "text-rose-400" : stochastic.k < 20 ? "text-emerald-400" : "text-white"
                            )}>{stochastic.k.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500 font-bold">%D</span>
                            <span className="text-sm font-bold text-white">{stochastic.d.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* ATR */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Waves className="w-4 h-4 text-zinc-500" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">ATR (14)</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black text-white">{formatCurrency(atr.value)}</span>
                        <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-1 rounded-md",
                            atr.level === 'high' ? "bg-rose-500/20 text-rose-400" :
                                atr.level === 'medium' ? "bg-amber-500/20 text-amber-400" :
                                    "bg-emerald-500/20 text-emerald-400"
                        )}>
                            {atr.percent.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* Momentum */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-zinc-500" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Momentum</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500 font-bold">ROC 10j</span>
                            <span className={cn(
                                "text-sm font-bold",
                                momentum.roc10 >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>{formatPercent(momentum.roc10)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500 font-bold">ROC 20j</span>
                            <span className={cn(
                                "text-sm font-bold",
                                momentum.roc20 >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>{formatPercent(momentum.roc20)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MACD */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                    <BarChart2 className="w-4 h-4 text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">MACD (12, 26, 9)</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <span className="text-[10px] text-zinc-500 font-bold">Ligne</span>
                        <p className={cn(
                            "text-lg font-bold",
                            ma.macdLine >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>{ma.macdLine.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] text-zinc-500 font-bold">Signal</span>
                        <p className="text-lg font-bold text-white">{ma.signalLine.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] text-zinc-500 font-bold">Histogramme</span>
                        <p className={cn(
                            "text-lg font-bold",
                            ma.macdHistogram >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>{ma.macdHistogram.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Moving Averages */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Moyennes Mobiles</span>
                    <span className={cn(
                        "ml-auto text-[9px] font-black uppercase px-2 py-1 rounded-md",
                        ma.trend === 'bullish' ? "bg-emerald-500/20 text-emerald-400" :
                            ma.trend === 'bearish' ? "bg-rose-500/20 text-rose-400" :
                                "bg-zinc-500/20 text-zinc-400"
                    )}>
                        {ma.trend === 'bullish' ? 'Haussier' : ma.trend === 'bearish' ? 'Baissier' : 'Neutre'}
                    </span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold mb-1">SMA 20</p>
                        <p className={cn("text-sm font-bold", currentPrice > ma.sma20 ? "text-emerald-400" : "text-rose-400")}>
                            {formatCurrency(ma.sma20)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold mb-1">SMA 50</p>
                        <p className={cn("text-sm font-bold", currentPrice > ma.sma50 ? "text-emerald-400" : "text-rose-400")}>
                            {formatCurrency(ma.sma50)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold mb-1">SMA 200</p>
                        <p className={cn("text-sm font-bold", currentPrice > ma.sma200 ? "text-emerald-400" : "text-rose-400")}>
                            {formatCurrency(ma.sma200)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold mb-1">EMA 12</p>
                        <p className="text-sm font-bold text-white">{formatCurrency(ma.ema12)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-bold mb-1">EMA 26</p>
                        <p className="text-sm font-bold text-white">{formatCurrency(ma.ema26)}</p>
                    </div>
                </div>
            </div>

            {/* Volatility & Bollinger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-zinc-500" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Volatilité</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black text-white">{volatility.annualizedVolatility.toFixed(1)}%</span>
                        <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-1 rounded-md",
                            volatility.level === 'high' ? "bg-rose-500/20 text-rose-400" :
                                volatility.level === 'medium' ? "bg-amber-500/20 text-amber-400" :
                                    "bg-emerald-500/20 text-emerald-400"
                        )}>
                            {volatility.level === 'high' ? 'Élevée' : volatility.level === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-bold">Annualisée (252 jours)</span>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-zinc-500" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Bollinger (20, 2)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-[9px] text-rose-400 font-bold mb-1">Sup.</p>
                            <p className="text-sm font-bold text-rose-400">{formatCurrency(volatility.bollingerUpper)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-zinc-400 font-bold mb-1">Moy.</p>
                            <p className="text-sm font-bold text-white">{formatCurrency(volatility.bollingerMiddle)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-emerald-400 font-bold mb-1">Inf.</p>
                            <p className="text-sm font-bold text-emerald-400">{formatCurrency(volatility.bollingerLower)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support & Resistance */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-zinc-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Support & Résistance (Pivot)</span>
                </div>
                <div className="grid grid-cols-5 gap-4 text-center">
                    <div>
                        <p className="text-[9px] text-rose-400 font-bold mb-1">R2</p>
                        <p className="text-sm font-bold text-rose-400">{formatCurrency(levels.resistance2)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-rose-300 font-bold mb-1">R1</p>
                        <p className="text-sm font-bold text-rose-300">{formatCurrency(levels.resistance1)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-gold font-bold mb-1">Pivot</p>
                        <p className="text-sm font-bold text-gold">{formatCurrency(levels.pivotPoint)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-emerald-300 font-bold mb-1">S1</p>
                        <p className="text-sm font-bold text-emerald-300">{formatCurrency(levels.support1)}</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-emerald-400 font-bold mb-1">S2</p>
                        <p className="text-sm font-bold text-emerald-400">{formatCurrency(levels.support2)}</p>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-[9px] text-amber-500/70 font-bold">
                    ⚠️ Ces analyses utilisent des modèles ML (K-NN, Monte Carlo, Holt-Winters) entraînés sur les données historiques.
                    Elles ne constituent pas des conseils d'investissement. Les performances passées ne garantissent pas les résultats futurs.
                </p>
            </div>
        </div>
    )
}
