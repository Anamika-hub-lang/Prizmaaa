-- Assignment brief: task description + reference image URLs.
-- Run AFTER supabase/schema.sql in the Supabase SQL Editor.

alter table public.assignments
  add column if not exists description text not null default '';

alter table public.assignments
  add column if not exists reference_images jsonb not null default '[]'::jsonb;
