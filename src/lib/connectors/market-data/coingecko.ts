import { MarketData, MarketDataConnector } from "../types";
import { Currency } from "@/types";

export class CoinGeckoConnector implements MarketDataConnector {
    private apiKey?: string;

    constructor() {
        this.apiKey = process.env.COINGECKO_API_KEY;
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch("https://api.coingecko.com/api/v3/ping");
            return response.ok;
        } catch {
            return false;
        }
    }

    async fetchPrice(symbol: string, currency: Currency): Promise<MarketData> {
        // For MVP, we'll map common symbols to IDs. In prod, we'd use their search/list API.
        const symbolMap: Record<string, string> = {
            BTC: "bitcoin",
            ETH: "ethereum",
            SOL: "solana",
            USDT: "tether",
        };

        const id = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
        const currencyLower = currency.toLowerCase();

        try {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currencyLower}`,
                {
                    headers: this.apiKey ? { "x-cg-demo-api-key": this.apiKey } : {},
                    next: { revalidate: 300 } // Cache for 5 mins
                }
            );

            if (!response.ok) throw new Error("CoinGecko error");

            const data = await response.json();
            const price = data[id][currencyLower];

            return {
                symbol: symbol.toUpperCase(),
                price,
                currency: currency.toUpperCase(),
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            console.error(`Error fetching BTC price from CoinGecko: ${error}`);
            // Fallback or rethrow
            throw error;
        }
    }
}
