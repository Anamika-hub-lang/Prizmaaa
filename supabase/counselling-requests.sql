-- Counselling session bookings (₹200 / hour — booked via /counselling)

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

alter table public.counselling_requests enable row level security;

do $$ begin
  create policy "counselling_requests_insert" on public.counselling_requests for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "counselling_requests_select" on public.counselling_requests for select using (false);
exception when duplicate_object then null;
end $$;
