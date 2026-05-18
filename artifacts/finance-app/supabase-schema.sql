-- FinanzasApp - Supabase Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com -> SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ACCOUNTS
create table if not exists accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('wallet', 'bank', 'savings')),
  balance numeric(12,2) not null default 0,
  color text not null default '#00d4aa',
  created_at timestamptz default now()
);

-- CREDIT CARDS
create table if not exists credit_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  "limit" numeric(12,2) not null default 0,
  balance numeric(12,2) not null default 0,
  closing_day int not null default 26,
  due_day int not null default 10,
  color text not null default '#00d4aa',
  created_at timestamptz default now()
);

-- CATEGORIES
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text not null default 'tag',
  color text not null default '#00d4aa',
  type text not null check (type in ('expense', 'income')),
  created_at timestamptz default now()
);

-- TRANSACTIONS
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('expense', 'income', 'card_expense', 'transfer')),
  amount numeric(12,2) not null,
  description text not null,
  date date not null,
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  card_id uuid references credit_cards(id) on delete set null,
  to_account_id uuid references accounts(id) on delete set null,
  status text not null check (status in ('paid', 'pending')) default 'paid',
  recurrence_id uuid,
  created_at timestamptz default now()
);

-- RECURRENCES
create table if not exists recurrences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric(12,2) not null,
  type text not null check (type in ('expense', 'income', 'card_expense')),
  category_id uuid references categories(id) on delete set null,
  account_id uuid references accounts(id) on delete set null,
  card_id uuid references credit_cards(id) on delete set null,
  day_of_month int not null default 1,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- BUDGETS
create table if not exists budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  amount numeric(12,2) not null,
  month int not null,
  year int not null,
  created_at timestamptz default now(),
  unique(user_id, category_id, month, year)
);

-- ROW LEVEL SECURITY (RLS)
alter table accounts enable row level security;
alter table credit_cards enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table recurrences enable row level security;
alter table budgets enable row level security;

-- RLS Policies
create policy "Users can manage own accounts" on accounts for all using (auth.uid() = user_id);
create policy "Users can manage own credit_cards" on credit_cards for all using (auth.uid() = user_id);
create policy "Users can manage own categories" on categories for all using (auth.uid() = user_id);
create policy "Users can manage own transactions" on transactions for all using (auth.uid() = user_id);
create policy "Users can manage own recurrences" on recurrences for all using (auth.uid() = user_id);
create policy "Users can manage own budgets" on budgets for all using (auth.uid() = user_id);

-- Optional: function to delete user and all data
create or replace function delete_user()
returns void language plpgsql security definer as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

-- Sample categories (optional — insert after creating a user)
-- These are inserted per user via the app UI, no seed needed here.
