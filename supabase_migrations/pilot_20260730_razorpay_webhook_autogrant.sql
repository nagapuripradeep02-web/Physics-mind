-- Payments Phase 2b (2026-07-30): automatic activation on payment.
-- APPLY TO THE PILOT PROJECT (physicsmind-pilot / jqbnmltsupnnbuvqgkix), NOT the dev project.
--
-- Replaces the manual `npm run grant:paid` step in the money loop. Two entry points,
-- one ledger:
--   * apply_razorpay_payment()  — called by the `razorpay-webhook` Edge Function
--     (service_role only) the moment Razorpay reports a captured payment.
--   * claim_pending_payments()  — called by the signed-in teacher's OWN client when a
--     payment arrived before she had an account/profile. This is what makes the
--     "paid first, signed up second" case recoverable instead of a dead end that
--     needed a human to untangle.
--
-- Idempotency is keyed on the Razorpay payment_id, so a webhook retry (Razorpay retries
-- for 24h on any non-2xx) can never buy a second month.
--
-- SECURITY: razorpay_payments has RLS on and NO policies — only service_role and the two
-- security-definer functions below can see it. A teacher can never read payment rows,
-- not even her own. apply_razorpay_payment is revoked from authenticated/anon so a
-- logged-in teacher cannot self-grant; claim_pending_payments is safe to expose because
-- it only ever acts on auth.uid() and matches on the OAuth-verified auth.users.email.

create table if not exists public.razorpay_payments (
  payment_id   text primary key,
  event        text not null,
  email        text,
  contact      text,
  amount_paise integer not null,
  months       integer not null default 1,
  received_at  timestamptz not null default now(),
  applied_at   timestamptz,
  professor_id uuid references auth.users(id) on delete set null,
  raw          jsonb,
  note         text
);

comment on table public.razorpay_payments is
  'Every payment the Razorpay webhook has seen. PK = razorpay payment_id (idempotency). applied_at null = money received but not yet attached to a teacher (never signed up, or paid from a different email) — claim_pending_payments() attaches it later.';

create index if not exists razorpay_payments_pending_email_idx
  on public.razorpay_payments (lower(email)) where applied_at is null;

alter table public.razorpay_payments enable row level security;

-- ── the webhook path ────────────────────────────────────────────────────────
create or replace function public.apply_razorpay_payment(
  p_payment_id   text,
  p_event        text,
  p_email        text,
  p_contact      text,
  p_amount_paise integer,
  p_months       integer,
  p_raw          jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid      uuid;
  v_email    text := lower(btrim(coalesce(p_email, '')));
  v_months   integer := greatest(1, least(coalesce(p_months, 1), 24));
  v_existing timestamptz;
  v_new      timestamptz;
begin
  -- Idempotency: a retry, or the same payment arriving on two subscribed events.
  if exists (select 1 from razorpay_payments where payment_id = p_payment_id) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  if v_email <> '' then
    select u.id into v_uid
      from auth.users u
     where lower(u.email) = v_email
       and exists (select 1 from teacher_profiles p where p.professor_id = u.id)
     limit 1;
  end if;

  begin
    insert into razorpay_payments (payment_id, event, email, contact, amount_paise, months, raw, professor_id)
    values (p_payment_id, p_event, nullif(v_email, ''), p_contact, p_amount_paise, v_months, p_raw, v_uid);
  exception when unique_violation then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end;

  if v_uid is null then
    -- Money is banked and recorded; it attaches the moment that email signs up.
    return jsonb_build_object('ok', true, 'pending', true, 'reason', 'no_matching_teacher',
                              'email', nullif(v_email, ''));
  end if;

  select paid_until into v_existing from teacher_subscriptions where professor_id = v_uid;
  -- Paying early never burns days already paid for.
  v_new := greatest(now(), coalesce(v_existing, now())) + (v_months || ' months')::interval;

  insert into teacher_subscriptions (professor_id, plan, paid_until, last_payment_id, last_payment_at, note, updated_at)
  values (v_uid, 'founding-499', v_new, p_payment_id, now(),
          'razorpay webhook ' || to_char(now(), 'YYYY-MM-DD') || ': +' || v_months || ' month(s)', now())
  on conflict (professor_id) do update
    set paid_until      = excluded.paid_until,
        last_payment_id = excluded.last_payment_id,
        last_payment_at = excluded.last_payment_at,
        note            = excluded.note,
        updated_at      = now();
  -- `plan` is intentionally NOT overwritten on conflict — historical founding-699 rows
  -- keep their id; the displayed price comes from PLAN_PRICE_INR, not from the plan id.

  update razorpay_payments set applied_at = now() where payment_id = p_payment_id;

  return jsonb_build_object('ok', true, 'granted', true, 'professor_id', v_uid,
                            'paid_until', v_new, 'months', v_months);
end $$;

revoke all on function public.apply_razorpay_payment(text, text, text, text, integer, integer, jsonb) from public, anon, authenticated;
grant execute on function public.apply_razorpay_payment(text, text, text, text, integer, integer, jsonb) to service_role;

-- ── the "paid before signing up" path ───────────────────────────────────────
create or replace function public.claim_pending_payments()
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_email    text;
  v_months   integer;
  v_last     text;
  v_existing timestamptz;
  v_new      timestamptz;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;
  if not exists (select 1 from teacher_profiles where professor_id = v_uid) then
    return jsonb_build_object('ok', true, 'claimed', 0, 'reason', 'no_profile');
  end if;

  select lower(email) into v_email from auth.users where id = v_uid;
  if v_email is null or v_email = '' then
    return jsonb_build_object('ok', true, 'claimed', 0, 'reason', 'no_email');
  end if;

  -- Serialize per email so two tabs claiming at once cannot double-grant.
  perform pg_advisory_xact_lock(hashtext('claim_pending:' || v_email));

  select coalesce(sum(months), 0), max(payment_id)
    into v_months, v_last
    from razorpay_payments
   where applied_at is null and lower(email) = v_email;

  if coalesce(v_months, 0) = 0 then
    return jsonb_build_object('ok', true, 'claimed', 0);
  end if;

  select paid_until into v_existing from teacher_subscriptions where professor_id = v_uid;
  v_new := greatest(now(), coalesce(v_existing, now())) + (v_months || ' months')::interval;

  insert into teacher_subscriptions (professor_id, plan, paid_until, last_payment_id, last_payment_at, note, updated_at)
  values (v_uid, 'founding-499', v_new, v_last, now(),
          'claimed ' || v_months || ' pending month(s) at sign-in', now())
  on conflict (professor_id) do update
    set paid_until      = excluded.paid_until,
        last_payment_id = excluded.last_payment_id,
        last_payment_at = excluded.last_payment_at,
        note            = excluded.note,
        updated_at      = now();

  update razorpay_payments
     set applied_at = now(), professor_id = v_uid
   where applied_at is null and lower(email) = v_email;

  return jsonb_build_object('ok', true, 'claimed', v_months, 'paid_until', v_new);
end $$;

revoke all on function public.claim_pending_payments() from public, anon;
grant execute on function public.claim_pending_payments() to authenticated;
