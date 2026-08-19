-- Mentor email allowlist: only these emails can apply / log in as mentor.
-- Run in Supabase SQL Editor.

create table if not exists public.mentor_allowlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  note text,
  created_at timestamptz not null default now()
);

create unique index if not exists mentor_allowlist_email_lower_idx
  on public.mentor_allowlist (lower(email));

alter table public.mentor_allowlist enable row level security;

do $$ begin
  create policy "mentor_allowlist_no_client"
    on public.mentor_allowlist
    for all
    using (false)
    with check (false);
exception when duplicate_object then null;
end $$;

-- Applications must go through /api/mentor/apply (service role), not the public anon key.
drop policy if exists "mentor_applications_insert" on public.mentor_applications;
do $$ begin
  create policy "mentor_applications_no_client"
    on public.mentor_applications
    for all
    using (false)
    with check (false);
exception when duplicate_object then null;
end $$;
