-- Class attendance + Meet session timer (run in Supabase SQL Editor).
-- Progress = present sessions / total sessions (from classes.sessions, default 20).
-- Student Join Meet runs a 40-minute timer; mentor can also mark present/absent.

create table if not exists public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_id text not null references public.classes (id) on delete cascade,
  clerk_id text not null,
  session_date date not null,
  present boolean not null default true,
  source text not null check (source in ('meet_timer', 'mentor')),
  marked_by_clerk_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, clerk_id, session_date)
);

create index if not exists class_attendance_class_idx
  on public.class_attendance (class_id, session_date desc);

create index if not exists class_attendance_clerk_idx
  on public.class_attendance (clerk_id, class_id);

create table if not exists public.class_meet_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id text not null references public.classes (id) on delete cascade,
  clerk_id text not null,
  session_date date not null,
  started_at timestamptz not null default now(),
  last_heartbeat_at timestamptz not null default now(),
  accumulated_seconds integer not null default 0 check (accumulated_seconds >= 0),
  required_seconds integer not null default 2400 check (required_seconds > 0),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists class_meet_sessions_active_idx
  on public.class_meet_sessions (clerk_id, class_id, session_date)
  where completed = false;

create index if not exists class_meet_sessions_clerk_idx
  on public.class_meet_sessions (clerk_id, started_at desc);

alter table public.class_attendance enable row level security;
alter table public.class_meet_sessions enable row level security;

do $$ begin
  create policy "class_attendance_service_only"
    on public.class_attendance for all using (false) with check (false);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "class_meet_sessions_service_only"
    on public.class_meet_sessions for all using (false) with check (false);
exception when duplicate_object then null;
end $$;
