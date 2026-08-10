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

In Clerk Dashboard, set sign-in/up URLs and webhook endpoint to your Next.js host (local: `http://localhost:3000`).
