-- Mentor application workflow: request → admin approve → allowlist
-- Run in Supabase SQL Editor after reviews-and-mentor-apply.sql

alter table public.mentor_applications
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected'));

alter table public.mentor_applications
  add column if not exists college text;

alter table public.mentor_applications
  add column if not exists portfolio_url text;

alter table public.mentor_applications
  add column if not exists reviewed_at timestamptz;

alter table public.mentor_applications
  add column if not exists admin_note text;

update public.mentor_applications
set status = 'pending'
where status is null;

create index if not exists mentor_applications_status_idx
  on public.mentor_applications (status, created_at desc);

create index if not exists mentor_applications_email_lower_idx
  on public.mentor_applications (lower(email));
