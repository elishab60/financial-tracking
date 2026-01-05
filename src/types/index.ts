export type Currency = string;

export type AssetType = 'cash' | 'stock' | 'crypto' | 'real_estate' | 'debt' | 'other';

export interface Asset {
  id: string;
  user_id: string;
  type: AssetType;
  name: string;
  symbol?: string;
  quantity: number;
  manual_value?: number;
  currency: Currency;
  valuation_mode: 'manual' | 'auto';
  provider?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetValuation {
  id: string;
  user_id: string;
  asset_id: string;
  as_of_date: string;
  value: number;
  currency: Currency;
  source: string;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  provider: string;
  external_id?: string;
  name: string;
  iban_masked?: string;
  currency: Currency;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  date: string;
  description: string;
  amount: number;
  currency: Currency;
  category?: string;
  merchant?: string;
  is_income: boolean;
  source: 'bank' | 'manual' | 'csv';
  created_at: string;
}

export interface DashboardStats {
  totalNetWorth: number;
  totalAssets: number;
  totalDebts: number;
  changeValue: number;
  changePercentage: number;
  allocation: {
    name: string;
    value: number;
    color: string;
  }[];
  topPositions: {
    name: string;
    value: number;
    change?: number;
  }[];
}
