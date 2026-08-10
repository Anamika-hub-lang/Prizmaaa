-- Mentor applications + public reviews (testimonials)

create table if not exists public.mentor_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  expertise text not null,
  experience text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.community_reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  role_type text not null check (role_type in ('student', 'mentor')),
  quote text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.community_reviews replica identity full;

do $$ begin alter publication supabase_realtime add table public.community_reviews; exception when duplicate_object then null; end $$;

alter table public.mentor_applications enable row level security;
alter table public.community_reviews enable row level security;

do $$ begin create policy "mentor_applications_insert" on public.mentor_applications for insert with check (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "mentor_applications_select" on public.mentor_applications for select using (false); exception when duplicate_object then null; end $$;

do $$ begin create policy "community_reviews_all" on public.community_reviews for all using (true) with check (true); exception when duplicate_object then null; end $$;
