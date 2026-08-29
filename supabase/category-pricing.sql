-- Category plan prices (Skills / Professional / Academic).
-- Admin can edit monthly, 3-month, and 6-month amounts in the admin panel.
-- Run in Supabase SQL Editor.

create table if not exists public.category_pricing (
  category_id text primary key check (category_id in ('skills', 'professional', 'academic')),
  title text not null,
  monthly_inr integer not null check (monthly_inr > 0),
  three_month_inr integer not null check (three_month_inr > 0),
  six_month_inr integer not null check (six_month_inr > 0),
  image text,
  updated_at timestamptz not null default now(),
  updated_by_clerk_id text
);

insert into public.category_pricing (
  category_id, title, monthly_inr, three_month_inr, six_month_inr, image
) values
  (
    'skills',
    'Skills Sessions',
    999,
    2499,
    4999,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80'
  ),
  (
    'professional',
    'Professional Sessions',
    1499,
    3899,
    7499,
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'
  ),
  (
    'academic',
    'Academic Sessions',
    599,
    1599,
    2999,
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80'
  )
on conflict (category_id) do nothing;

alter table public.category_pricing enable row level security;
-- Service-role APIs only (no anon policies).
