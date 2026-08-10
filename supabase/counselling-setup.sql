-- PRIZMA counselling — run this ONCE in Supabase SQL Editor
-- Fixes: relation "public.counselling_requests" does not exist

-- 1) Main bookings table (paid sessions after Cashfree confirm)
create table if not exists public.counselling_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  category_id text not null,
  preferred_mode text not null check (preferred_mode in ('meet', 'call')),
  note text,
  created_at timestamptz not null default now()
);

-- 2) Payment + scheduling columns (safe if already added)
alter table public.counselling_requests
  add column if not exists payment_status text not null default 'paid';

alter table public.counselling_requests
  add column if not exists cashfree_order_id text;

alter table public.counselling_requests
  add column if not exists scheduled_date date;

alter table public.counselling_requests
  add column if not exists scheduled_time text;

alter table public.counselling_requests
  add column if not exists clerk_id text;

alter table public.counselling_requests
  add column if not exists group_id text;

-- Ensure payment_status check exists (ignore if already there)
do $$ begin
  alter table public.counselling_requests
    add constraint counselling_requests_payment_status_check
    check (payment_status in ('pending', 'paid', 'failed'));
exception
  when duplicate_object then null;
end $$;

create unique index if not exists counselling_requests_cashfree_order_id_idx
  on public.counselling_requests (cashfree_order_id)
  where cashfree_order_id is not null;

alter table public.counselling_requests enable row level security;

do $$ begin
  create policy "counselling_requests_insert" on public.counselling_requests for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "counselling_requests_select" on public.counselling_requests for select using (false);
exception when duplicate_object then null;
end $$;

-- 3) Pending intents (created at create-order, deleted after confirm)
create table if not exists public.counselling_booking_intents (
  order_id text primary key,
  clerk_id text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  category_id text not null,
  group_id text,
  preferred_mode text not null check (preferred_mode in ('meet', 'call')),
  note text,
  scheduled_date date not null,
  scheduled_time text not null,
  amount_inr smallint not null default 200,
  created_at timestamptz not null default now()
);

create index if not exists counselling_booking_intents_clerk_id_idx
  on public.counselling_booking_intents (clerk_id);

alter table public.counselling_booking_intents enable row level security;
