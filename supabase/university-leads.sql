-- University Lead & Counselling System
-- Run in Supabase SQL Editor (service role APIs only — no public RLS policies).

create table if not exists public.university_partners (
  id uuid primary key default gen_random_uuid(),
  university_id text not null unique,
  name text not null,
  short_name text,
  location text,
  state text,
  website text,
  admission_info text,
  is_active boolean not null default true,
  clerk_id text,
  lead_commission_inr numeric not null default 0,
  admission_commission_inr numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.university_programs (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.university_partners (id) on delete cascade,
  name text not null,
  fees_inr integer,
  eligibility text,
  duration text,
  created_at timestamptz not null default now()
);

create table if not exists public.university_leads (
  id uuid primary key default gen_random_uuid(),
  clerk_id text,
  full_name text not null,
  phone text not null,
  email text not null,
  course text not null,
  preferred_location text,
  qualification text not null,
  university_id text not null,
  university_name text not null,
  source text not null
    check (source in ('counselling', 'interested', 'apply')),
  status text not null default 'NEW'
    check (status in (
      'NEW',
      'CONTACTED',
      'COUNSELLING',
      'INTERESTED',
      'APPLICATION_STARTED',
      'ADMITTED',
      'CLOSED'
    )),
  assigned_counsellor_clerk_id text,
  share_consent boolean not null default false,
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists university_leads_clerk_university_uidx
  on public.university_leads (clerk_id, university_id)
  where clerk_id is not null;

create unique index if not exists university_leads_email_university_uidx
  on public.university_leads (lower(email), university_id);

create index if not exists university_leads_status_idx on public.university_leads (status);
create index if not exists university_leads_counsellor_idx
  on public.university_leads (assigned_counsellor_clerk_id);

create table if not exists public.university_lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.university_leads (id) on delete cascade,
  author_clerk_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.university_lead_shares (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.university_leads (id) on delete cascade,
  partner_id uuid not null references public.university_partners (id) on delete cascade,
  shared_by_clerk_id text not null,
  shared_at timestamptz not null default now(),
  unique (lead_id, partner_id)
);

create table if not exists public.university_commissions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.university_leads (id) on delete cascade,
  partner_id uuid references public.university_partners (id) on delete set null,
  university_id text not null,
  application_status text not null default 'none'
    check (application_status in ('none', 'started', 'submitted', 'offered', 'rejected')),
  admission_status text not null default 'none'
    check (admission_status in ('none', 'pending', 'admitted', 'declined')),
  commission_amount_inr numeric not null default 0,
  commission_status text not null default 'pending'
    check (commission_status in ('pending', 'invoiced', 'paid', 'cancelled')),
  payment_received_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.university_partners enable row level security;
alter table public.university_programs enable row level security;
alter table public.university_leads enable row level security;
alter table public.university_lead_notes enable row level security;
alter table public.university_lead_shares enable row level security;
alter table public.university_commissions enable row level security;
