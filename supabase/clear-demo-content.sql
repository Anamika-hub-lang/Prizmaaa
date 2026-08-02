-- Wipe demo/seed content so mentors start fresh (does not drop tables).
-- Run in Supabase SQL Editor if old sample classes/courses were auto-seeded.

delete from public.student_enrollments;
delete from public.assignments;
delete from public.free_courses;
delete from public.classes;
