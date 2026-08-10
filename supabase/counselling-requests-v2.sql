-- Add payment + scheduling to counselling_requests
-- IMPORTANT: Run supabase/counselling-requests.sql first, OR use counselling-setup.sql (all-in-one)

alter table public.counselling_requests
  add column if not exists payment_status text not null default 'paid'
    check (payment_status in ('pending', 'paid', 'failed'));

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

create unique index if not exists counselling_requests_cashfree_order_id_idx
  on public.counselling_requests (cashfree_order_id)
  where cashfree_order_id is not null;
