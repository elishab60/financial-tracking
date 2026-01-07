-- Investment Accounts (PEA, CTO, PEE, Assurance Vie, etc.)
-- These are "folders" for grouping assets by investment account type

create table if not exists investment_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  account_type text not null, -- 'pea', 'cto', 'pee', 'assurance_vie', 'per', 'other'
  broker_id text, -- identifier matching the BROKERS list
  broker_name text, -- display name (for custom brokers)
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add investment_account_id to assets table (nullable - assets may be unassigned)
alter table assets add column if not exists investment_account_id uuid references investment_accounts on delete set null;

-- RLS for investment_accounts
alter table investment_accounts enable row level security;
create policy "Users can manage their own investment accounts" on investment_accounts for all using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists idx_assets_investment_account_id on assets(investment_account_id);
create index if not exists idx_investment_accounts_user_id on investment_accounts(user_id);
