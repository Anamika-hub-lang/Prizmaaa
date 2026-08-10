-- Fix: allow admin/counsellor/intern on profiles.role
-- Run this in Supabase → SQL Editor → New query → Run

alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (
    role is null
    or role in ('admin', 'student', 'teacher', 'counsellor', 'intern')
  );
