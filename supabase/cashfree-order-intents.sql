-- Server-side binding of Cashfree order_id → Clerk user + class (set at create-order, verified at confirm).
-- Run in Supabase SQL Editor (safe to re-run).

create table if not exists public.cashfree_order_intents (
  order_id text primary key,
  clerk_id text not null,
  class_id text not null,
  purpose text not null check (purpose in ('paid', 'trial')),
  plan_tier text check (plan_tier is null or plan_tier in ('monthly', 'three-month')),
  created_at timestamptz not null default now()
);

//hello

create index if not exists cashfree_order_intents_clerk_id_idx
  on public.cashfree_order_intents (clerk_id);

alter table public.cashfree_order_intents enable row level security;

-- No client policies: only service role (server API) reads/writes this table.
