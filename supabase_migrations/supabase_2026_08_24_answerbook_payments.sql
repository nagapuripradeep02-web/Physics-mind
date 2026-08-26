-- Answer Book — payments (P4, 2026-08-24)
--
-- FOUNDER PRICING (2026-08-24): ₹99/month for the first 500 students, ₹249/month
-- after. The founding price is GRANDFATHERED — once a device has paid at ₹99 it
-- renews at ₹99 forever. Nobody's price ever rises; the January step-up applies
-- only to students who never saw ₹99. That is the whole trust story, and it is
-- enforced here (ab_price_for), not in the client.
--
-- Identity stays the anonymous P2 device_id. No login, no PII: a payment is
-- matched to the device that started it (Razorpay `notes.device_id`), so the
-- paying phone unlocks within seconds of the UPI confirmation.
--
-- Idempotency is keyed on the Razorpay payment_id, exactly like the teacher
-- app's apply_razorpay_payment: Razorpay retries any non-2xx for 24h, and a
-- retry must never buy a second month.
--
-- Same posture as every ab_* table: RLS on, ZERO policies, service-role only,
-- and both RPCs revoked from public/anon/authenticated.

-- ── 1. entitlements gain an expiry ───────────────────────────────────────────
-- NULL = never expires. The free chapter is NULL (it is a gift, not a rental);
-- a paid 'all' row carries a real date and is extended, never duplicated.
alter table ab_entitlements add column if not exists expires_at timestamptz;

comment on column ab_entitlements.expires_at is
  'NULL = permanent (the free chapter). A date = a paid pass; the content endpoint refuses the row once it is in the past.';

-- (No partial index on live rows: now() is not IMMUTABLE, so Postgres refuses it
-- in an index predicate. The dedup index already makes (device, unit_key, source)
-- unique, which is what lets a renewal EXTEND one row instead of stacking rows,
-- and a device has a handful of entitlement rows at most.)

-- ── 2. the price book ────────────────────────────────────────────────────────
alter table ab_skus add column if not exists founding_price_inr int;
alter table ab_skus add column if not exists founding_limit     int;
alter table ab_skus add column if not exists period_days        int not null default 31;

update ab_skus
   set label              = 'Every chapter, every subject',
       price_inr          = 249,     -- the list price (from student 501 on)
       founding_price_inr = 99,      -- the founding price, grandfathered forever
       founding_limit     = 500,
       period_days        = 31,
       active             = true
 where sku = 'full_book';

comment on column ab_skus.price_inr          is 'LIST price per period, in rupees. Charged once the founding slots are gone.';
comment on column ab_skus.founding_price_inr is 'Founding price per period. Held forever by any device that has already paid it (grandfathered).';
comment on column ab_skus.founding_limit     is 'How many devices may become founders. NULL = unlimited.';

-- ── 3. the payments ledger ───────────────────────────────────────────────────
create table if not exists ab_payments (
    payment_id   text primary key,          -- Razorpay payment id = the idempotency key
    event        text not null,
    device_id    uuid references ab_devices(device_id) on delete set null,
    sku          text not null default 'full_book',
    amount_paise integer not null,
    founding     boolean not null default false,
    period_days  integer not null default 31,
    received_at  timestamptz not null default now(),
    applied_at   timestamptz,               -- null = money banked, device unknown
    raw          jsonb,
    note         text
);

create index if not exists ab_payments_device_idx on ab_payments (device_id);
create index if not exists ab_payments_founding_idx on ab_payments (device_id) where founding;
create index if not exists ab_payments_unapplied_idx on ab_payments (received_at) where applied_at is null;

alter table ab_payments enable row level security;

comment on table ab_payments is
  'Every payment the Answer Book webhook has seen. PK = Razorpay payment_id (idempotency). applied_at null = money received but no device could be matched (notes.device_id missing) — recoverable by hand, never silently lost.';

-- ── 4. what does THIS device pay? ────────────────────────────────────────────
-- One rule, one place. A device that has ever paid the founding price keeps it;
-- otherwise it gets founding while slots remain, list price after.
create or replace function ab_price_for(p_device uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_sku    record;
    v_taken  int;
    v_is_f   boolean := false;
    v_left   int;
    v_price  int;
begin
    select sku, label, price_inr, founding_price_inr, founding_limit, period_days
      into v_sku
      from ab_skus where sku = 'full_book' and active limit 1;
    if v_sku is null then return null; end if;

    -- Already a founder? Then the price is locked, slots or no slots.
    if p_device is not null then
        select exists (select 1 from ab_payments where device_id = p_device and founding)
          into v_is_f;
    end if;

    select count(distinct device_id) into v_taken from ab_payments where founding;
    v_left := greatest(0, coalesce(v_sku.founding_limit, 0) - v_taken);

    if v_sku.founding_price_inr is null then
        v_price := v_sku.price_inr;
    elsif v_is_f or v_sku.founding_limit is null or v_left > 0 then
        v_price := v_sku.founding_price_inr;
    else
        v_price := v_sku.price_inr;
    end if;

    return jsonb_build_object(
        'sku', v_sku.sku,
        'label', v_sku.label,
        'price_inr', v_price,
        'list_price_inr', v_sku.price_inr,
        'founding', (v_price = v_sku.founding_price_inr),
        'founding_locked', v_is_f,
        'founding_slots_left', case when v_sku.founding_limit is null then null else v_left end,
        'period_days', v_sku.period_days
    );
end;
$$;

-- ── 5. money in → access out, exactly once ───────────────────────────────────
create or replace function ab_apply_payment(
    p_payment_id   text,
    p_event        text,
    p_device       uuid,
    p_amount_paise integer,
    p_raw          jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_price   jsonb;
    v_days    int;
    v_found   boolean;
    v_current timestamptz;
    v_new     timestamptz;
begin
    if coalesce(p_payment_id, '') = '' then
        return jsonb_build_object('ok', false, 'error', 'no_payment_id');
    end if;
    -- Idempotency first: a retry, or the same payment on two subscribed events.
    if exists (select 1 from ab_payments where payment_id = p_payment_id) then
        return jsonb_build_object('ok', true, 'duplicate', true);
    end if;

    -- The price this device was entitled to AT PURCHASE TIME decides whether the
    -- payment makes them a founder — read before the row is written, so the
    -- 500th and 501st payer cannot both take the last slot.
    v_price := ab_price_for(p_device);
    v_found := coalesce((v_price->>'founding')::boolean, false);
    v_days  := coalesce((v_price->>'period_days')::int, 31);

    if p_device is null then
        -- Money is real but no device came with it. Bank it, flag it, never lose it.
        insert into ab_payments (payment_id, event, device_id, amount_paise, founding, period_days, raw, note)
        values (p_payment_id, p_event, null, coalesce(p_amount_paise, 0), false, v_days, p_raw,
                'no device_id in notes — attach by hand');
        return jsonb_build_object('ok', true, 'pending', true, 'reason', 'no_device');
    end if;

    -- A payment can arrive for a device that has never synced.
    insert into ab_devices (device_id) values (p_device) on conflict (device_id) do nothing;

    begin
        insert into ab_payments (payment_id, event, device_id, amount_paise, founding, period_days, raw, applied_at)
        values (p_payment_id, p_event, p_device, coalesce(p_amount_paise, 0), v_found, v_days, p_raw, now());
    exception when unique_violation then
        return jsonb_build_object('ok', true, 'duplicate', true);
    end;

    -- Extend, never stack. Paying early never burns days already paid for.
    select expires_at into v_current
      from ab_entitlements
     where device_id = p_device and unit_key = 'all' and source = 'paid';

    v_new := greatest(now(), coalesce(v_current, now())) + (v_days || ' days')::interval;

    insert into ab_entitlements (device_id, unit_key, source, expires_at)
    values (p_device, 'all', 'paid', v_new)
    on conflict (device_id, unit_key, source) do update set expires_at = v_new;

    return jsonb_build_object('ok', true, 'unlocked_until', v_new, 'founding', v_found);
end;
$$;

revoke all on function ab_price_for(uuid) from public, anon, authenticated;
revoke all on function ab_apply_payment(text, text, uuid, integer, jsonb) from public, anon, authenticated;
