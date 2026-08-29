# Supabase setup for Educture (real-time mentor ↔ student data)

## 1. Create project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Copy **Project URL** and **anon public** key from **Settings → API**.

## 2. Environment variables

In the project root, create or edit `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Restart `npm run dev` after changing `.env`.

## 3. Database schema

In Supabase **SQL Editor**, run the full script:

`supabase/schema.sql`

This creates `classes`, `free_courses`, `assignments`, and `profiles`, enables **Realtime** on content tables, and sets demo RLS.

### Clerk → profiles sync

Profiles are upserted from Clerk (sign-up, profile edits, role onboarding) via a **server-side** sync using `SUPABASE_SERVICE_ROLE_KEY` (never exposed to the browser).

**Local dev (`npm run dev`):**

```env
CLERK_SECRET_KEY=sk_test_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VITE_SUPABASE_URL=https://xxxx.supabase.co
```

Optional webhook (Clerk Dashboard → Webhooks → `user.created`, `user.updated`):

- Endpoint: `https://your-host/api/webhooks/clerk` (use ngrok in dev)
- Secret: `CLERK_WEBHOOK_SECRET=whsec_...`

The app also calls `POST /api/user/profile-sync` when a signed-in user’s Clerk data changes.

**Production:** host the same API routes on your backend (or Supabase Edge Function) with the same env vars — static `dist` alone cannot run the Vite dev middleware.

## 4. Realtime in dashboard

Confirm in **Database → Replication** that `classes`, `free_courses`, and `assignments` are enabled for realtime (the SQL script usually adds them to `supabase_realtime`).

## 5. How the app behaves

- **Fresh start:** tables stay empty until the mentor adds online classes, free courses, and assignments.
- **Teacher**: add/remove content and Meet links → writes to Supabase.
- **Student**: browse, enroll, assignments, calendar → reads live data from Supabase.
- **Realtime**: changes on content tables refresh all open tabs.

To remove old seeded rows from an earlier version of the app, run `supabase/clear-demo-content.sql`.

Without `VITE_SUPABASE_*` set, portals show empty lists (no demo fill-in).

## 6. Roles, counselling types & CSV uploads

After the core + counselling scripts, run:

`supabase/roles-counselling-uploads.sql`

This:

- Widens `profiles.role` to `admin | student | teacher | counsellor | intern`
- Creates `counselling_types`, `counsellor_profiles`, `counsellor_type_assignments`, `csv_uploads`
- Adds counsellor assignment columns on `counselling_requests`
- Seeds Career / Abroad / Tech counselling types

Intern CSV uploads stay `pending` until an admin approves them into `classes`.

## 7. Class co-mentors (shared teaching)

Run `supabase/class-co-mentors.sql` in the SQL Editor.

This lets a class owner invite another mentor by email. Both dashboards show the same class (schedule / Meet / teach). Only the owner can invite, remove co-mentors, or delete the class.

## 8. Class notifications (student bell)

Run `supabase/class-notifications.sql` in the SQL Editor.

Creates `class_notifications` and `class_notification_reads`, plus a public `class-materials` storage bucket for syllabus PDFs. Mentors notify enrolled students when they publish an assignment, save a Meet schedule, or post a syllabus/update (with optional PDF) from Classes. Students see these in the bell icon and can download the PDF.

## 9. University leads, partners & commissions

Run `supabase/university-leads.sql` in the SQL Editor.

This creates:

- `university_partners`, `university_programs`
- `university_leads` (unique per student + campus)
- `university_lead_notes`, `university_lead_shares`
- `university_commissions`

RLS is on with **no anon policies**. Staff and partner access goes through service-role APIs. Student phone numbers are omitted from public responses. Partner dashboards only receive contact details after student consent and an explicit admin share to a matched campus.

## 10. Category pricing (admin-editable)

Run `supabase/category-pricing.sql` in the SQL Editor.

Seeds Skills / Professional / Academic monthly, 3-month, and 6-month amounts. Admins edit them at `/admin/pricing`. Checkout charges use the database values (falls back to defaults if the table is missing).

## 11. Security note

Current policies allow anyone with the anon key to read/write content tables. Privileged tables (uploads, counsellor profiles) deny anon select; use the service role from the API. Before launch, tighten RLS further.

