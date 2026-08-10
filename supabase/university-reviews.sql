-- University reviews (Glassdoor-style, student-submitted)

create table if not exists public.university_reviews (
  id uuid primary key default gen_random_uuid(),
  university_id text not null,
  author_name text not null,
  program text,
  graduation_year smallint,
  overall_rating smallint not null check (overall_rating between 1 and 5),
  academics_rating smallint check (academics_rating between 1 and 5),
  campus_rating smallint check (campus_rating between 1 and 5),
  placement_rating smallint check (placement_rating between 1 and 5),
  review_title text,
  pros text,
  cons text,
  advice text,
  clerk_id text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists university_reviews_university_id_idx
  on public.university_reviews (university_id);

create index if not exists university_reviews_created_at_idx
  on public.university_reviews (created_at desc);

alter table public.university_reviews replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.university_reviews;
exception when duplicate_object then null;
end $$;

alter table public.university_reviews enable row level security;

do $$ begin
  create policy "university_reviews_select"
    on public.university_reviews for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "university_reviews_insert"
    on public.university_reviews for insert with check (true);
exception when duplicate_object then null;
end $$;
