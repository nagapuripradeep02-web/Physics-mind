# Payments runbook — founding cohort (₹699/mo, monthly only)

> Decided 2026-07-12. Phase 1 = manual Razorpay link + `grant:paid`. Phase 2b = webhook
> automation (not built yet). Branch: `feat/pilot-payments`, worktree `C:\Tutor\physics-mind-payments`.

## The model

- **Plan:** `founding-699` — ₹699/month, locked for the first 25 teachers. Monthly only.
- **Access rule (pm-auth):** `access_end = max(trial_end, paid_until)`. A teacher hits
  `expired.html` only when BOTH the trial window and `paid_until` are in the past.
- **Storage:** `teacher_subscriptions` in the PILOT Supabase (`jqbnmltsupnnbuvqgkix`).
  Service-role writes ONLY — teachers can read their own row (the account dropdown shows
  "Founding · ₹699/mo"), never write it. The same migration column-scopes
  `teacher_profiles` updates (closed hole: teachers could previously update their own
  `trial_days` via the REST API).

## One-time setup (in order)

1. **Apply the migration** `supabase_migrations/pilot_20260712_subscriptions.sql` to the
   PILOT project (SQL editor or MCP). ⚠️ Apply BEFORE deploying the new gate — until the
   table exists, the new profile query errors and the gate fails open (no expiry
   enforcement at all).
2. **Add the service key** to `.env.local` (both worktrees if needed):
   `PILOT_SUPABASE_SERVICE_ROLE_KEY=eyJ...` (pilot dashboard → Project Settings → API).
3. **Razorpay** (founder, KYC 2–5 days): activate account → create a Payment Page
   "Viditra — Founding Teacher", ₹699 → paste its URL into `PAYMENT_LINK` in
   `src/scripts/pilot_site_assets.ts` → `npm run build:pilot` → `npm run deploy:app`.
   The expired page then leads with a "Continue — ₹699/month" button (until then it
   keeps the mailto-first copy).

## Monthly loop (Phase 1, manual)

1. Teacher's trial ends → they land on `expired.html` → they pay via the Razorpay link
   (or you send it on WhatsApp).
2. Razorpay dashboard shows the payment (payer email/phone).
3. `npm run grant:paid -- <teacher-email>` (defaults to +1 month; `3` = three months;
   `0` = revoke). Extending early never wastes paid days (extends from the later of
   now / current `paid_until`).
4. Done — their next page load reopens the app. No rebuild, no deploy.

## Phase 2b (to build when Razorpay is active)

- Supabase Edge Function `razorpay-webhook`: verify `X-Razorpay-Signature` (HMAC-SHA256,
  webhook secret), on `payment_link.paid` / `payment.captured` → upsert
  `teacher_subscriptions` keyed by payer email → replaces step 3 above.
- Then: Razorpay **Subscriptions** plan `founding-699` (UPI Autopay / card e-mandate) so
  renewals charge automatically; webhook handles `subscription.charged`.
- Phase 3 (>25 teachers): in-app checkout, GST invoicing, dunning. Not before.
