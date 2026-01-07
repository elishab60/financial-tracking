-- 1. Create budgets table
create table if not exists budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add budget_id to existing tables
alter table budget_categories add column if not exists budget_id uuid references budgets on delete cascade;
alter table budget_income add column if not exists budget_id uuid references budgets on delete cascade;

-- 3. Enable RLS on budgets
alter table budgets enable row level security;
drop policy if exists "Users can manage their own budgets" on budgets;
create policy "Users can manage their own budgets" on budgets for all using (auth.uid() = user_id);

-- 4. Update constraints
alter table budget_categories drop constraint if exists budget_categories_user_id_name_group_name_key;
alter table budget_categories add constraint budget_categories_user_id_budget_id_name_group_name_key unique(user_id, budget_id, name, group_name);

-- 5. Helper function or migration logic to create a default budget for existing users
-- For each user that has budget categories but no budget, create a "Défaut" budget and link everything.
do $$
declare
    u_id uuid;
    b_id uuid;
begin
    for u_id in select distinct user_id from budget_categories where budget_id is null
    loop
        insert into budgets (user_id, name, is_active) values (u_id, 'Défaut', true) returning id into b_id;
        update budget_categories set budget_id = b_id where user_id = u_id and budget_id is null;
        update budget_income set budget_id = b_id where user_id = u_id and budget_id is null;
    end loop;
end $$;
