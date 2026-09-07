-- Assignment brief: task description + mentor reference images.
-- Run AFTER supabase/schema.sql in the Supabase SQL Editor.

alter table public.assignments
  add column if not exists description text not null default '';

alter table public.assignments
  add column if not exists reference_images jsonb not null default '[]'::jsonb;

-- Same public bucket as student submissions. Mentor reference images are stored under
-- references/{assignmentId}/... (student work stays under submissions/{assignmentId}/...).
insert into storage.buckets (id, name, public)
values ('assignments', 'assignments', true)
on conflict (id) do nothing;
