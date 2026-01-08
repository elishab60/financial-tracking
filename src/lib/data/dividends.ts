// Known dividend data for common stocks and ETFs
// This serves as a fallback when API data is unavailable

export interface DividendInfo {
    yield: number // Annual yield percentage
    annualAmount: number // Annual dividend per share
    frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
    type: 'distributing' | 'accumulating' // Whether dividends are paid out or reinvested
    nextExDate?: string // Next ex-dividend date (if known)
}

// Common dividend-paying stocks and ETFs
export const DIVIDEND_DATA: Record<string, DividendInfo> = {
    // US Dividend Stocks
    'AAPL': { yield: 0.50, annualAmount: 0.96, frequency: 'quarterly', type: 'distributing' },
    'MSFT': { yield: 0.75, annualAmount: 3.00, frequency: 'quarterly', type: 'distributing' },
    'JNJ': { yield: 2.90, annualAmount: 4.76, frequency: 'quarterly', type: 'distributing' },
    'KO': { yield: 3.10, annualAmount: 1.84, frequency: 'quarterly', type: 'distributing' },
    'PG': { yield: 2.40, annualAmount: 3.76, frequency: 'quarterly', type: 'distributing' },
    'T': { yield: 6.50, annualAmount: 1.11, frequency: 'quarterly', type: 'distributing' },
    'VZ': { yield: 6.80, annualAmount: 2.66, frequency: 'quarterly', type: 'distributing' },
    'XOM': { yield: 3.40, annualAmount: 3.80, frequency: 'quarterly', type: 'distributing' },
    'CVX': { yield: 4.00, annualAmount: 6.04, frequency: 'quarterly', type: 'distributing' },
    'MCD': { yield: 2.20, annualAmount: 6.68, frequency: 'quarterly', type: 'distributing' },
    'WMT': { yield: 1.40, annualAmount: 2.28, frequency: 'quarterly', type: 'distributing' },
    'PEP': { yield: 2.70, annualAmount: 5.06, frequency: 'quarterly', type: 'distributing' },
    'HD': { yield: 2.50, annualAmount: 8.36, frequency: 'quarterly', type: 'distributing' },
    'JPM': { yield: 2.30, annualAmount: 4.60, frequency: 'quarterly', type: 'distributing' },

    // Monthly Dividend Stocks
    'O': { yield: 5.50, annualAmount: 3.08, frequency: 'monthly', type: 'distributing' },
    'MAIN': { yield: 6.20, annualAmount: 2.76, frequency: 'monthly', type: 'distributing' },
    'STAG': { yield: 4.00, annualAmount: 1.47, frequency: 'monthly', type: 'distributing' },
    'AGNC': { yield: 14.00, annualAmount: 1.44, frequency: 'monthly', type: 'distributing' },

    // Dividend ETFs - Distributing
    'JEPI': { yield: 7.80, annualAmount: 4.20, frequency: 'monthly', type: 'distributing' },
    'SCHD': { yield: 3.40, annualAmount: 2.70, frequency: 'quarterly', type: 'distributing' },
    'VYM': { yield: 3.00, annualAmount: 3.50, frequency: 'quarterly', type: 'distributing' },
    'HDV': { yield: 3.80, annualAmount: 3.90, frequency: 'quarterly', type: 'distributing' },
    'SPHD': { yield: 3.50, annualAmount: 1.60, frequency: 'monthly', type: 'distributing' },
    'SPYD': { yield: 4.50, annualAmount: 1.80, frequency: 'quarterly', type: 'distributing' },
    'VIG': { yield: 1.80, annualAmount: 3.20, frequency: 'quarterly', type: 'distributing' },
    'DVY': { yield: 3.30, annualAmount: 4.10, frequency: 'quarterly', type: 'distributing' },

    // European ETFs - Distributing (D suffix)
    'VWRL.L': { yield: 1.80, annualAmount: 1.50, frequency: 'quarterly', type: 'distributing' },
    'VHYL.L': { yield: 3.20, annualAmount: 1.80, frequency: 'quarterly', type: 'distributing' },
    'IUKD.L': { yield: 5.00, annualAmount: 0.40, frequency: 'quarterly', type: 'distributing' },

    // European ETFs - Accumulating (no dividends paid out)
    'VWCE.PA': { yield: 1.80, annualAmount: 0, frequency: 'quarterly', type: 'accumulating' },
    'IWDA.AS': { yield: 1.40, annualAmount: 0, frequency: 'quarterly', type: 'accumulating' },
    'CW8.PA': { yield: 1.50, annualAmount: 0, frequency: 'quarterly', type: 'accumulating' },
    'SWDA.L': { yield: 1.40, annualAmount: 0, frequency: 'quarterly', type: 'accumulating' },
    'EUNL.DE': { yield: 1.50, annualAmount: 0, frequency: 'quarterly', type: 'accumulating' },

    // Popular French/European stocks
    'AI.PA': { yield: 1.30, annualAmount: 2.20, frequency: 'annual', type: 'distributing' }, // Air Liquide
    'MC.PA': { yield: 1.70, annualAmount: 13.00, frequency: 'semi-annual', type: 'distributing' }, // LVMH
    'OR.PA': { yield: 1.50, annualAmount: 6.40, frequency: 'annual', type: 'distributing' }, // L'Oréal
    'SAN.PA': { yield: 3.80, annualAmount: 3.56, frequency: 'annual', type: 'distributing' }, // Sanofi
    'BNP.PA': { yield: 6.00, annualAmount: 4.60, frequency: 'annual', type: 'distributing' }, // BNP Paribas
    'TTE.PA': { yield: 5.50, annualAmount: 3.00, frequency: 'quarterly', type: 'distributing' }, // TotalEnergies
}

// Calculate dividend for a specific asset
export function calculateAssetDividend(
    symbol: string | undefined,
    quantity: number,
    currentPrice: number = 0
): {
    annualDividend: number
    monthlyDividend: number
    nextPayment: number
    yield: number
    frequency: string
    type: 'distributing' | 'accumulating'
    isEstimate: boolean
} {
    if (!symbol) {
        return {
            annualDividend: 0,
            monthlyDividend: 0,
            nextPayment: 0,
            yield: 0,
            frequency: 'N/A',
            type: 'distributing',
            isEstimate: true
        }
    }

    const upperSymbol = symbol.toUpperCase()
    const data = DIVIDEND_DATA[upperSymbol]

    if (data) {
        const annualDividend = data.type === 'accumulating' ? 0 : quantity * data.annualAmount
        let nextPayment = 0
        let paymentsPerYear = 1

        switch (data.frequency) {
            case 'monthly': paymentsPerYear = 12; break
            case 'quarterly': paymentsPerYear = 4; break
            case 'semi-annual': paymentsPerYear = 2; break
            case 'annual': paymentsPerYear = 1; break
        }

        nextPayment = annualDividend / paymentsPerYear

        return {
            annualDividend,
            monthlyDividend: annualDividend / 12,
            nextPayment,
            yield: data.yield,
            frequency: data.frequency,
            type: data.type,
            isEstimate: false
        }
    }

    // Estimate based on S&P 500 average if unknown
    const estimatedYield = 2.0
    const estimatedAnnualDividend = (currentPrice * quantity * estimatedYield) / 100

    return {
        annualDividend: estimatedAnnualDividend,
        monthlyDividend: estimatedAnnualDividend / 12,
        nextPayment: estimatedAnnualDividend / 4, // Assume quarterly
        yield: estimatedYield,
        frequency: 'quarterly',
        type: 'distributing',
        isEstimate: true
    }
}

// Get frequency label in French
export function getFrequencyLabel(frequency: string): string {
    const labels: Record<string, string> = {
        'monthly': 'Mensuel',
        'quarterly': 'Trimestriel',
        'semi-annual': 'Semestriel',
        'annual': 'Annuel',
        'N/A': '-'
    }
    return labels[frequency] || frequency
}

// Get type label in French
export function getTypeLabel(type: 'distributing' | 'accumulating'): string {
    return type === 'accumulating' ? 'Capitalisant' : 'Distribuant'
}
