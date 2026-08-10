-- Pending counselling bookings (created at create-order, fulfilled after Cashfree PAID)

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

-- Service role only (no client policies)
