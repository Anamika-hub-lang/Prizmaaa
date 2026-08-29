-- Class notifications for enrolled students (run in Supabase SQL editor).
-- Mentors post assignment / schedule / syllabus (optional PDF) updates; students see them in the bell.

create table if not exists public.class_notifications (
  id uuid primary key default gen_random_uuid(),
  class_id text not null references public.classes (id) on delete cascade,
  type text not null check (type in ('assignment', 'schedule', 'syllabus', 'update')),
  title text not null,
  body text not null default '',
  link_path text,
  attachment_url text,
  attachment_name text,
  created_by_clerk_id text not null,
  created_at timestamptz not null default now()
);

-- Safe if table already existed without PDF columns:
alter table public.class_notifications
  add column if not exists attachment_url text;

alter table public.class_notifications
  add column if not exists attachment_name text;

create index if not exists class_notifications_class_id_idx
  on public.class_notifications (class_id);

create index if not exists class_notifications_created_at_idx
  on public.class_notifications (created_at desc);

create table if not exists public.class_notification_reads (
  notification_id uuid not null references public.class_notifications (id) on delete cascade,
  clerk_id text not null,
  read_at timestamptz not null default now(),
  primary key (notification_id, clerk_id)
);

create index if not exists class_notification_reads_clerk_id_idx
  on public.class_notification_reads (clerk_id);

alter table public.class_notifications enable row level security;
alter table public.class_notification_reads enable row level security;

-- Public bucket so enrolled students can open syllabus PDFs via URL.
insert into storage.buckets (id, name, public)
values ('class-materials', 'class-materials', true)
on conflict (id) do nothing;
