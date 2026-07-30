-- Payments in the behaviour timeline (2026-07-30).
-- APPLY TO THE PILOT PROJECT (physicsmind-pilot / jqbnmltsupnnbuvqgkix), NOT the dev project.
--
-- A payment landed in razorpay_payments but never in pilot_events, so "used 40 sims →
-- hit the paywall → paid" could not be read as one story from one table. Both grant
-- paths now also write a pilot_events row.
--
-- Notes:
--   * professor_id is set EXPLICITLY — inside these security-definer functions on the
--     webhook path there is no auth.uid() to default from.
--   * session_id 'rzp:<payment_id>' keeps the row joinable back to the ledger.
--   * page 'server' marks it as not-browser-emitted (every client row carries the page
--     it came from since the 2026-07-30 telemetry pass).
--   * These rows come from the SERVER, so they bypass the founder/staff client-side
--     suppression: a founder test payment WILL appear in pilot_events. Expected.
--
-- Re-declares both functions verbatim from pilot_20260730_razorpay_webhook_autogrant.sql
-- with only the pilot_events insert added — keep the two files in sync if either changes.

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
    return jsonb_build_object('ok', true, 'pending', true, 'reason', 'no_matching_teacher',
                              'email', nullif(v_email, ''));
  end if;

  select paid_until into v_existing from teacher_subscriptions where professor_id = v_uid;
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

  update razorpay_payments set applied_at = now() where payment_id = p_payment_id;

  -- NEW: the payment joins her behaviour timeline.
  begin
    insert into pilot_events (professor_id, session_id, event_type, payload, client_ts)
    values (v_uid, 'rzp:' || p_payment_id, 'payment_captured',
            jsonb_build_object('amount_paise', p_amount_paise, 'months', v_months,
                               'page', 'server', 'via', 'webhook'),
            now());
  exception when others then null;   -- analytics must never break a payment grant
  end;

  return jsonb_build_object('ok', true, 'granted', true, 'professor_id', v_uid,
                            'paid_until', v_new, 'months', v_months);
end $$;

revoke all on function public.apply_razorpay_payment(text, text, text, text, integer, integer, jsonb) from public, anon, authenticated;
grant execute on function public.apply_razorpay_payment(text, text, text, text, integer, integer, jsonb) to service_role;

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

  -- NEW: a claimed (pay-before-signup) payment is also part of her story.
  begin
    insert into pilot_events (professor_id, session_id, event_type, payload, client_ts)
    values (v_uid, 'rzp:' || coalesce(v_last, 'claim'), 'payment_claimed',
            jsonb_build_object('months', v_months, 'page', 'server', 'via', 'claim'),
            now());
  exception when others then null;
  end;

  return jsonb_build_object('ok', true, 'claimed', v_months, 'paid_until', v_new);
end $$;

revoke all on function public.claim_pending_payments() from public, anon;
grant execute on function public.claim_pending_payments() to authenticated;
