-- Educture: run in Supabase SQL Editor (Dashboard → SQL → New query)

-- Tables
create table if not exists public.classes (
  id text primary key,
  title text not null,
  category_id text not null check (category_id in ('skills', 'academic', 'professional')),
  image text not null default '',
  mentor text not null default '',
  mentor_image text not null default '',
  duration text not null default '',
  sessions text not null default '',
  description text not null default '',
  price integer not null default 999,
  meet_link text not null default 'https://meet.google.com/',
  next_session_label text not null default 'Set schedule in Meet tab',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.free_courses (
  id text primary key,
  title text not null,
  image text not null default '',
  instructor text not null default '',
  lessons integer not null default 0,
  hours integer not null default 0,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id text primary key,
  title text not null,
  course text not null default '',
  due text not null default '',
  img text not null default '',
  status text not null default 'pending' check (status in ('pending', 'submitted')),
  submitted_at text,
  student_note text,
  submitted_by text,
  created_at timestamptz not null default now()
);

-- Realtime (replica identity for delete events)
alter table public.classes replica identity full;
alter table public.free_courses replica identity full;
alter table public.assignments replica identity full;

do $$ begin alter publication supabase_realtime add table public.classes; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.free_courses; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.assignments; exception when duplicate_object then null; end $$;

-- Profiles (synced from Clerk)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null unique,
  full_name text,
  email text,
  role text check (role is null or role in ('student', 'teacher')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create index if not exists profiles_clerk_id_idx on public.profiles (clerk_id);

alter table public.profiles enable row level security;

do $$ begin
  create policy "profiles_select_own" on public.profiles for select using (false);
exception when duplicate_object then null;
end $$;

-- Student enrollments (live dashboard courses)
create table if not exists public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null,
  class_id text references public.classes(id) on delete set null,
  free_course_id text references public.free_courses(id) on delete set null,
  kind text not null check (kind in ('online', 'free')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'ongoing' check (status in ('ongoing', 'completed', 'draft')),
  plan_tier text,
  enrolled_at timestamptz not null default now(),
  constraint enrollment_target check (
    (kind = 'online' and class_id is not null)
    or (kind = 'free' and free_course_id is not null)
  )
);

create unique index if not exists student_enrollments_clerk_class_idx
  on public.student_enrollments (clerk_id, class_id) where class_id is not null;

create unique index if not exists student_enrollments_clerk_free_idx
  on public.student_enrollments (clerk_id, free_course_id) where free_course_id is not null;

alter table public.student_enrollments replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.student_enrollments;
exception
  when duplicate_object then null;
end $$;

alter table public.student_enrollments enable row level security;

do $$ begin
  create policy "student_enrollments_all" on public.student_enrollments for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

alter table public.classes enable row level security;
alter table public.free_courses enable row level security;
alter table public.assignments enable row level security;

do $$ begin create policy "classes_all" on public.classes for all using (true) with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "free_courses_all" on public.free_courses for all using (true) with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "assignments_all" on public.assignments for all using (true) with check (true); exception when duplicate_object then null; end $$;
