-- Planner PDFs and topic logos for 1 / 3 / 6 month class plans.
-- Run AFTER supabase/class-teaching-plans.sql in the Supabase SQL Editor.

alter table public.class_teaching_plans
  add column if not exists planner_pdf_url text;

alter table public.class_teaching_plans
  add column if not exists planner_pdf_name text;

-- Public so enrolled students can open filled planner PDFs and topic logos via URL.
insert into storage.buckets (id, name, public)
values ('class-planners', 'class-planners', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('topic-logos', 'topic-logos', true)
on conflict (id) do nothing;
