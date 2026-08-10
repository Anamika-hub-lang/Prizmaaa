-- PRIZMA: roles, counselling types, counsellor profiles, CSV uploads
-- Run in Supabase SQL Editor after schema.sql + counselling-setup.sql

-- ---------------------------------------------------------------------------
-- 1. Widen profiles.role
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (
    role is null
    or role in ('admin', 'student', 'teacher', 'counsellor', 'intern')
  );

-- ---------------------------------------------------------------------------
-- 2. Counselling types
-- ---------------------------------------------------------------------------
create table if not exists public.counselling_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subdomain text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.counselling_types enable row level security;

do $$ begin
  create policy "counselling_types_select_all"
    on public.counselling_types for select using (true);
exception when duplicate_object then null;
end $$;

insert into public.counselling_types (name, subdomain, slug)
values
  ('Career', 'career.prizma.com', 'career'),
  ('Abroad', 'abroad.prizma.com', 'abroad'),
  ('Tech', 'tech.prizma.com', 'tech')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Counsellor profiles + type assignments
-- ---------------------------------------------------------------------------
create table if not exists public.counsellor_profiles (
  clerk_id text primary key,
  availability boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.counsellor_type_assignments (
  clerk_id text not null references public.counsellor_profiles(clerk_id) on delete cascade,
  type_id uuid not null references public.counselling_types(id) on delete cascade,
  primary key (clerk_id, type_id)
);

alter table public.counsellor_profiles enable row level security;
alter table public.counsellor_type_assignments enable row level security;

do $$ begin
  create policy "counsellor_profiles_select_deny"
    on public.counsellor_profiles for select using (false);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "counsellor_type_assignments_select_deny"
    on public.counsellor_type_assignments for select using (false);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 4. CSV uploads (intern → admin approval → classes)
-- ---------------------------------------------------------------------------
create table if not exists public.csv_uploads (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null,
  file_name text not null,
  file_url text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  row_count integer not null default 0,
  parsed_rows jsonb not null default '[]'::jsonb,
  error_message text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists csv_uploads_clerk_id_idx on public.csv_uploads (clerk_id);
create index if not exists csv_uploads_status_idx on public.csv_uploads (status);

alter table public.csv_uploads enable row level security;

do $$ begin
  create policy "csv_uploads_select_deny"
    on public.csv_uploads for select using (false);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Extend counselling_requests for auto-assign
-- ---------------------------------------------------------------------------
alter table public.counselling_requests
  add column if not exists type_id uuid references public.counselling_types(id) on delete set null;

alter table public.counselling_requests
  add column if not exists counsellor_clerk_id text;

alter table public.counselling_requests
  add column if not exists assignment_status text
    check (assignment_status is null or assignment_status in ('assigned', 'unassigned'));

alter table public.counselling_requests
  add column if not exists session_status text
    check (session_status is null or session_status in ('upcoming', 'completed'));

-- Best-effort backfill for existing paid bookings
update public.counselling_requests
set
  assignment_status = coalesce(assignment_status, 'unassigned'),
  session_status = coalesce(session_status, 'upcoming')
where payment_status = 'paid'
  and (assignment_status is null or session_status is null);

-- ---------------------------------------------------------------------------
-- 6. Storage bucket for CSV files (create via dashboard if this fails)
-- ---------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public)
-- values ('csv-uploads', 'csv-uploads', false)
-- on conflict (id) do nothing;
