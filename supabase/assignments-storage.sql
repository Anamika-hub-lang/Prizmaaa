-- Student assignment submissions (uploaded files + optional links).
-- Run AFTER supabase/schema.sql in the Supabase SQL Editor.

alter table public.assignments
  add column if not exists submission_type text;

alter table public.assignments
  drop constraint if exists assignments_submission_type_check;

alter table public.assignments
  add constraint assignments_submission_type_check
  check (submission_type is null or submission_type in ('file', 'link'));

alter table public.assignments
  add column if not exists submission_file_url text;

alter table public.assignments
  add column if not exists submission_file_name text;

alter table public.assignments
  add column if not exists submission_link text;

-- Public so mentors and the submitting student can open the file via URL.
insert into storage.buckets (id, name, public)
values ('assignments', 'assignments', true)
on conflict (id) do nothing;
