-- Budget Categories (Poles)
create table if not exists budget_categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target_amount decimal default 0 not null,
  icon text,
  color text,
  type text default 'expense', -- 'expense', 'investment'
  group_name text, -- e.g. 'Logement', 'Vie quotidienne'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name, group_name)
);

-- Budget Income
create table if not exists budget_income (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  amount decimal default 0 not null,
  is_recurring boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table budget_categories enable row level security;
create policy "Users can manage their own budget categories" on budget_categories for all using (auth.uid() = user_id);

alter table budget_income enable row level security;
create policy "Users can manage their own budget income" on budget_income for all using (auth.uid() = user_id);

-- Default categories for new users
-- Note: This would typically be handled by a trigger on profile creation or a service.
-- For now, we expect the app to seed default categories if none exist.
