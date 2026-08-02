-- Run in Supabase SQL Editor — profile fields for student/mentor onboarding

alter table public.profiles
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists how_did_you_find_us text check (
    how_did_you_find_us is null or how_did_you_find_us in (
      'linkedin', 'friends', 'social_media', 'reference', 'marketing', 'other'
    )
  ),
  add column if not exists how_did_you_find_us_detail text,
  add column if not exists student_education_level text check (
    student_education_level is null or student_education_level in (
      'school', 'college', 'working', 'other'
    )
  ),
  add column if not exists student_grade_or_program text,
  add column if not exists student_learning_goals text,
  add column if not exists mentor_expertise text,
  add column if not exists mentor_experience_years integer,
  add column if not exists mentor_qualifications text,
  add column if not exists mentor_bio text,
  add column if not exists mentor_portfolio_url text,
  add column if not exists profile_details_complete boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();
