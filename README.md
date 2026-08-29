# PRIZMA (Next.js)

Education platform — Next.js App Router, Clerk auth, Supabase, Cashfree payments.

## Setup

1. Copy `.env.example` to `.env` and fill in keys (`NEXT_PUBLIC_*` for client, secrets without that prefix for server).
2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Next.js development server
- `npm run build` — production build
- `npm start` — serve production build

## Important routes

- Cashfree returns (public): `/student/payment/return`, `/counselling/payment/return`
- Clerk webhook: `POST /api/webhooks/clerk`
- Payments API: `POST /api/cashfree/create-order`, `POST /api/cashfree/confirm`
- University leads: `/admin/leads`, `/counsellor/leads`, `/partner`
- University lead capture: `POST /api/university-leads`

## University leads schema

In Supabase **SQL Editor**, also run `supabase/university-leads.sql` after the core scripts. This creates partners, programmes, leads, notes, shares, and commissions. APIs use the service role only — student phone numbers are never public.

For shared teaching between mentors, also run `supabase/class-co-mentors.sql`.

For student notification bell (assignments / schedule / syllabus PDF), run `supabase/class-notifications.sql`.

For admin-editable Academic / Professional / Skills plan prices, run `supabase/category-pricing.sql`. Then open **Admin → Pricing**.

In Clerk Dashboard, set sign-in/up URLs and webhook endpoint to your Next.js host (local: `http://localhost:3000`).
