-- Ensure primary mentor email is always on the allowlist.
-- Safe to re-run (upsert by email).

insert into public.mentor_allowlist (email, note)
values (
  'anusgt99@gmail.com',
  'Primary mentor — created original courses'
)
on conflict (email) do update
set note = excluded.note;
