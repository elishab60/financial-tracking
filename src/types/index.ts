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
  current_value?: number;
  image?: string;
  buy_price?: number; // Legacy or Initial
  buy_date?: string; // Legacy or Initial
  fees?: number; // Legacy or Initial
  notes?: string;
  current_price?: number;
  pnl_value?: number;
  pnl_percent?: number;
  total_invested?: number;

  // New Purchase History Fields
  purchases?: AssetPurchase[];
  purchase_count?: number;
  pru?: number; // Unit Cost Average
  cost_basis?: number; // Total Invested
  market_value?: number; // Total Value
  last_purchase_date?: string | null;
}

export interface AssetPurchase {
  id: string;
  asset_id: string;
  user_id: string;
  quantity: number;
  unit_price: number;
  fees: number;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  total_cost?: number; // Computed
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
  totalInvested: number;
  totalPnlValue: number;
  totalPnlPercent: number;
  assetsWithoutCostBasis: number;
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

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  icon?: string;
  color?: string;
  type: 'expense' | 'investment';
  group_name?: string;
  created_at: string;
}

export interface BudgetIncome {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  is_recurring: boolean;
  created_at: string;
}

export interface BudgetSummary {
  totalIncome: number;
  totalBudgeted: number;
  totalSpent: number;
  remaining: number;
  savingsMargin: number;
  savingsRate: number;
  categories: (BudgetCategory & {
    spent: number;
    remaining: number;
    percentage: number;
  })[];
}
