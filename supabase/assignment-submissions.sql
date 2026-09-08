-- Per-student assignment submissions with mentor review (run in Supabase SQL editor).
-- Before this, submissions only lived as meta.json blobs in the `assignments` bucket and
-- the single `assignments.status` column, so there was no way to review one student's work.

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id text not null references public.assignments (id) on delete cascade,
  clerk_id text not null,
  student_name text not null default 'Student',
  note text not null default '',
  submission_type text check (submission_type is null or submission_type in ('file', 'link')),
  file_url text,
  file_name text,
  link text,
  submitted_at timestamptz not null default now(),
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected')),
  review_note text,
  reviewed_at timestamptz,
  reviewed_by_clerk_id text,
  unique (assignment_id, clerk_id)
);

create index if not exists assignment_submissions_assignment_idx
  on public.assignment_submissions (assignment_id);

create index if not exists assignment_submissions_clerk_idx
  on public.assignment_submissions (clerk_id);

alter table public.assignment_submissions enable row level security;

drop policy if exists "assignment_submissions_all" on public.assignment_submissions;
create policy "assignment_submissions_all" on public.assignment_submissions
  for all using (true) with check (true);

-- Targeted (single-student) notifications for review decisions.
alter table public.class_notifications add column if not exists target_clerk_id text;

alter table public.class_notifications drop constraint if exists class_notifications_type_check;
alter table public.class_notifications add constraint class_notifications_type_check
  check (type in ('assignment', 'schedule', 'syllabus', 'update', 'review'));
