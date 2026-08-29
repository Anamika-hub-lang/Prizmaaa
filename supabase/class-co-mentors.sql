-- Co-mentors: share a class with another mentor account.
-- Run in Supabase SQL Editor after mentor-content-ownership.sql.

create table if not exists public.class_co_mentors (
  id uuid primary key default gen_random_uuid(),
  class_id text not null references public.classes (id) on delete cascade,
  mentor_clerk_id text not null,
  mentor_email text not null,
  invited_by_clerk_id text not null,
  created_at timestamptz not null default now(),
  unique (class_id, mentor_clerk_id)
);

create index if not exists class_co_mentors_mentor_idx
  on public.class_co_mentors (mentor_clerk_id);

create index if not exists class_co_mentors_class_idx
  on public.class_co_mentors (class_id);

alter table public.class_co_mentors enable row level security;
-- Service-role APIs only (no anon policies).
