-- Profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  base_currency text default 'EUR' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Assets
create table if not exists assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null, -- cash, stock, crypto, real_estate, debt, other
  name text not null,
  symbol text,
  quantity decimal default 0,
  manual_value decimal,
  currency text default 'EUR' not null,
  valuation_mode text default 'manual' not null, -- manual, auto
  provider text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Asset Valuations (History)
create table if not exists asset_valuations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  asset_id uuid references assets on delete cascade not null,
  as_of_date timestamp with time zone default timezone('utc'::text, now()) not null,
  value decimal not null,
  currency text not null,
  source text not null, -- manual, auto, snapshot
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Accounts (Open Banking)
create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  provider text not null,
  external_id text,
  name text not null,
  iban_masked text,
  currency text default 'EUR' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Account Snapshots
create table if not exists account_snapshots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete cascade not null,
  as_of_date timestamp with time zone default timezone('utc'::text, now()) not null,
  balance decimal not null,
  currency text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete cascade,
  date timestamp with time zone not null,
  description text not null,
  amount decimal not null,
  currency text not null,
  category text,
  merchant text,
  is_income boolean default false,
  source text not null, -- bank, manual, csv
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Price Cache
create table if not exists price_cache (
  id uuid default gen_random_uuid() primary key,
  provider text not null,
  symbol text not null,
  currency text not null,
  price decimal not null,
  fetched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Integrations (Tokens)
create table if not exists integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  provider text not null,
  access_token_encrypted text,
  refresh_token_encrypted text,
  scope text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

alter table assets enable row level security;
create policy "Users can manage their own assets" on assets for all using (auth.uid() = user_id);

alter table asset_valuations enable row level security;
create policy "Users can manage their own valuations" on asset_valuations for all using (auth.uid() = user_id);

alter table accounts enable row level security;
create policy "Users can manage their own accounts" on accounts for all using (auth.uid() = user_id);

alter table account_snapshots enable row level security;
create policy "Users can manage their own snapshots" on account_snapshots for all using (auth.uid() = user_id);

alter table transactions enable row level security;
create policy "Users can manage their own transactions" on transactions for all using (auth.uid() = user_id);

alter table price_cache enable row level security;
create policy "Anyone can read price cache" on price_cache for select using (true);

alter table integrations enable row level security;
create policy "Users can manage their own integrations" on integrations for all using (auth.uid() = user_id);
