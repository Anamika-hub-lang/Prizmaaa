-- Trial billing fields on student enrollments (run once in Supabase SQL Editor)

alter table public.student_enrollments
  add column if not exists billing_status text check (
    billing_status is null or billing_status in ('trial', 'active', 'cancelled')
  ),
  add column if not exists trial_ends_at timestamptz,
  add column if not exists payment_method_type text check (
    payment_method_type is null or payment_method_type in ('upi', 'bank', 'card')
  ),
  add column if not exists payment_method_label text,
  add column if not exists auto_renew boolean not null default true;
