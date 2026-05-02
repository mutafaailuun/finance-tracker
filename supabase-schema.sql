-- Create tables for Finance Tracker
-- Run this in your Supabase SQL editor

-- Categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text default 'wallet',
  color text default '#3b82f6',
  type text check (type in ('income', 'expense')) not null default 'expense',
  created_at timestamp with time zone default now(),
  unique(user_id, name)
);

-- Transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  amount decimal(12,2) not null,
  type text check (type in ('income', 'expense')) not null default 'expense',
  description text,
  date date not null default current_date,
  created_at timestamp with time zone default now()
);

-- Budgets table
create table budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  amount decimal(12,2) not null,
  month text not null,
  created_at timestamp with time zone default now(),
  unique(user_id, category_id, month)
);

-- Enable Row Level Security
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

-- RLS Policies: users can only see their own data
create policy "Users can view own categories" on categories
  for select using (auth.uid() = user_id);

create policy "Users can insert own categories" on categories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own categories" on categories
  for update using (auth.uid() = user_id);

create policy "Users can delete own categories" on categories
  for delete using (auth.uid() = user_id);

create policy "Users can view own transactions" on transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);

create policy "Users can update own transactions" on transactions
  for update using (auth.uid() = user_id);

create policy "Users can delete own transactions" on transactions
  for delete using (auth.uid() = user_id);

create policy "Users can view own budgets" on budgets
  for select using (auth.uid() = user_id);

create policy "Users can insert own budgets" on budgets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own budgets" on budgets
  for update using (auth.uid() = user_id);

create policy "Users can delete own budgets" on budgets
  for delete using (auth.uid() = user_id);

-- Indexes for performance
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_date on transactions(date);
create index idx_transactions_category on transactions(category_id);
create index idx_categories_user_id on categories(user_id);
create index idx_budgets_user_month on budgets(user_id, month);
