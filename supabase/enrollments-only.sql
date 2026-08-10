-- Run this if you only need student_enrollments (safe to re-run)

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

do $$ begin alter publication supabase_realtime add table public.student_enrollments; exception when duplicate_object then null; end $$;

alter table public.student_enrollments enable row level security;

do $$ begin
  create policy "student_enrollments_all" on public.student_enrollments for all using (true) with check (true);
exception when duplicate_object then null;
end $$;
