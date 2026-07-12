-- Payments Phase 2a (2026-07-12): teacher subscriptions + paid_until access gate.
-- APPLY TO THE PILOT PROJECT (physicsmind-pilot / jqbnmltsupnnbuvqgkix), NOT the dev project.
--
-- Model: the founding cohort pays ₹699/mo via a Razorpay Payment Page link (Phase 1 =
-- founder sends the link at trial end and flips paid_until via `npm run grant:paid`;
-- Phase 2b = a signature-verified Razorpay webhook Edge Function does the flip).
-- Access rule in pm-auth: access_end = max(trial_end, paid_until) — a paid teacher
-- never sees expired.html while paid_until is in the future.
--
-- SECURITY: teachers can READ their own subscription row but never write it — there are
-- deliberately NO insert/update/delete policies for `authenticated`; all writes go through
-- the service role (grant script / webhook). This also fixes a pre-existing hole on
-- teacher_profiles: profiles_update_own allowed updating ANY column of one's own row,
-- including trial_started_at/trial_days (a teacher could extend their own trial via the
-- REST API). The blanket UPDATE grant is revoked and re-granted column-scoped to the
-- four profile-panel fields only.

create table if not exists public.teacher_subscriptions (
  professor_id             uuid primary key references public.teacher_profiles(professor_id) on delete cascade,
  plan                     text not null default 'founding-699',
  paid_until               timestamptz,
  razorpay_customer_id     text,
  razorpay_subscription_id text,
  last_payment_id          text,
  last_payment_at          timestamptz,
  note                     text,
  updated_at               timestamptz not null default now()
);
comment on table public.teacher_subscriptions is
  'One row per paying teacher. Service-role writes ONLY (grant:paid script / Razorpay webhook). pm-auth grants access while paid_until is in the future. plan founding-699 = ₹699/mo locked, first-25 cohort.';

alter table public.teacher_subscriptions enable row level security;

-- Teachers may see their own subscription (the account dropdown shows the plan);
-- no write policies for authenticated — service role bypasses RLS for the flip.
create policy subs_select_own on public.teacher_subscriptions
  for select to authenticated using (professor_id = auth.uid());

-- Belt-and-braces: even if a write policy ever appears, authenticated lacks the
-- table-level privilege.
revoke insert, update, delete on public.teacher_subscriptions from authenticated;
revoke insert, update, delete on public.teacher_subscriptions from anon;

-- ── teacher_profiles column hardening (pre-existing hole, closed here) ──────────
-- profiles_update_own (RLS) still scopes WHICH ROWS a teacher can update; this
-- grant now also scopes WHICH COLUMNS — the profile-panel fields only. Trial terms
-- (trial_started_at, trial_days) become founder/service-role-only, as the Wave-0
-- migration's comment always intended ("Founder grants special terms via dashboard").
revoke update on public.teacher_profiles from authenticated;
grant update (display_name, school, teaches, next_chapter)
  on public.teacher_profiles to authenticated;
