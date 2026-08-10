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

## 7. Security note

Current policies allow anyone with the anon key to read/write content tables. Privileged tables (uploads, counsellor profiles) deny anon select; use the service role from the API. Before launch, tighten RLS further.

