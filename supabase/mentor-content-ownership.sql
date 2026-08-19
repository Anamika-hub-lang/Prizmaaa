-- Link mentor-created content to the signed-in mentor (Clerk user id).
-- Run in Supabase SQL Editor after schema.sql.

alter table public.classes
  add column if not exists mentor_clerk_id text;

alter table public.free_courses
  add column if not exists mentor_clerk_id text;

alter table public.assignments
  add column if not exists mentor_clerk_id text;

create index if not exists classes_mentor_clerk_id_idx
  on public.classes (mentor_clerk_id);

create index if not exists free_courses_mentor_clerk_id_idx
  on public.free_courses (mentor_clerk_id);

create index if not exists assignments_mentor_clerk_id_idx
  on public.assignments (mentor_clerk_id);
