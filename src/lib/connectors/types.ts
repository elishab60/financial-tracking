import { Currency } from "@/types";

export interface NormalizedBalance {
    externalId: string;
    name: string;
    balance: number;
    currency: Currency;
    type: string;
}

export interface NormalizedTransaction {
    externalId: string;
    date: string;
    description: string;
    amount: number;
    currency: Currency;
    category?: string;
    merchant?: string;
}

export interface MarketData {
    symbol: string;
    price: number;
    currency: Currency;
    lastUpdated: string;
}

export interface Connector {
    testConnection(): Promise<boolean>;
}

export interface BankingConnector extends Connector {
    fetchBalances(): Promise<NormalizedBalance[]>;
    fetchTransactions(accountId: string, fromDate?: string): Promise<NormalizedTransaction[]>;
}

export interface MarketDataConnector extends Connector {
    fetchPrice(symbol: string, currency: Currency): Promise<MarketData>;
}

export interface FXConnector extends Connector {
    fetchRate(base: Currency, target: Currency): Promise<number>;
}
