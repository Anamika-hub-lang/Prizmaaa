-- Per-class teaching plans aligned to 1 / 3 / 6 month plan cards.
-- Run in Supabase SQL Editor. Mentors + co-mentors edit via service-role API.

create table if not exists public.class_teaching_plans (
  id uuid primary key default gen_random_uuid(),
  class_id text not null references public.classes (id) on delete cascade,
  plan_tier text not null check (plan_tier in ('monthly', 'three-month', 'six-month')),
  topics jsonb not null default '[]'::jsonb,
  notes text,
  updated_by_clerk_id text,
  updated_at timestamptz not null default now(),
  unique (class_id, plan_tier)
);

create index if not exists class_teaching_plans_class_idx
  on public.class_teaching_plans (class_id);

alter table public.class_teaching_plans enable row level security;

do $$ begin
  create policy "class_teaching_plans_service_only"
    on public.class_teaching_plans for all using (false) with check (false);
exception when duplicate_object then null;
end $$;
