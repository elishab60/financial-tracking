export type Currency = string;

export type AssetType = 'cash' | 'stock' | 'crypto' | 'real_estate' | 'debt' | 'other';

// Individual purchase record for PRU calculation
export interface AssetPurchase {
  id: string;
  asset_id: string;
  user_id: string;
  quantity: number;
  unit_price: number;
  fees: number;
  purchase_date?: string;
  notes?: string;
  created_at: string;
  // Computed
  total_cost?: number; // (quantity * unit_price) + fees
}

export interface Asset {
  id: string;
  user_id: string;
  type: AssetType;
  name: string;
  symbol?: string;
  quantity: number;
  manual_value?: number;
  buy_price?: number; // DEPRECATED: use purchases
  buy_date?: string; // DEPRECATED: use purchases
  fees?: number; // DEPRECATED: use purchases
  notes?: string;
  currency: Currency;
  valuation_mode: 'manual' | 'auto';
  provider?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  current_value?: number;
  current_price?: number; // current market price per unit
  // PRU (average cost) fields - computed from purchases
  purchases?: AssetPurchase[];
  purchase_count?: number;
  total_invested?: number; // sum of all (quantity * unit_price + fees)
  pru?: number; // PRU = total_invested / total_quantity
  cost_basis?: number; // same as total_invested for P&L calculation
  market_value?: number; // quantity * current_price
  pnl_value?: number; // market_value - cost_basis
  pnl_percent?: number; // (pnl_value / cost_basis) * 100
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
  // Performance metrics
  totalInvested: number; // sum of all cost_basis
  totalPnlValue: number; // sum of all pnl_value
  totalPnlPercent: number; // (totalPnlValue / totalInvested) * 100
  assetsWithoutCostBasis: number; // count of assets with no purchases
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
