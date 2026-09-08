-- EAPCET Physics finder — the ep_* tables and RPCs (2026-09-10)
--
-- A SECOND product on the SAME Supabase project as the Answer Book. It reuses
-- the anonymous device identity (ab_devices), the Google linking
-- (ab_account_devices, ab_link_device), the team list (ab_accounts_internal,
-- ab_device_is_internal), the dashboard token (ab_admin_config) and the AI cost
-- ledger (ai_usage_log). Everything that is ENTITLEMENT, MONEY or USAGE gets
-- its own ep_* table, because:
--   - ab_price_for hardcodes sku = 'full_book' and ab_apply_payment writes
--     unit_key = 'all' — sharing ab_entitlements would let an Answer Book pass
--     unlock EAPCET (and the other way round);
--   - ab_events feeds ab_stats; mixing the two products' rows would inflate
--     every Answer Book number the founder reads.
--
-- Same posture as every ab_* object: RLS on, ZERO policies, service-role only
-- through the ep-* Edge Functions; every RPC revoked from public/anon/
-- authenticated. Nothing here is PII.
--
-- SAFE TO RE-RUN: create-if-not-exists + create-or-replace only. No DROP, no
-- UPDATE of existing rows, nothing touches an ab_* object except one INSERT
-- ... ON CONFLICT DO NOTHING into the price book.

-- ── 1. the SKU ──────────────────────────────────────────────────────────────
-- ₹399 per 31 days. No founding price unless the founder sets one
-- (founding_price_inr stays NULL → ep_price_for charges the list price).
insert into ab_skus (sku, label, price_inr, founding_price_inr, founding_limit, period_days, active)
values ('eapcet_physics_month', 'EAPCET Physics: solutions, retries and Vidi', 399, null, null, 31, true)
on conflict (sku) do nothing;

-- ── 2. runs, retries, chapter state ─────────────────────────────────────────
-- Mirrors the page's ep_state_v1 blob: one row per finished-or-running run,
-- one row per sibling retry, one row per chapter holding the streak and the
-- "strong now" dates. The page is the source while offline; the server merges
-- and returns the union so a second device sees the same picture.
create table if not exists ep_runs (
    device_id    uuid not null references ab_devices(device_id) on delete cascade,
    chapter_key  text not null,
    run_no       int  not null,
    seed         text,
    started_at   timestamptz,
    finished_at  timestamptz,               -- null while the run is in progress
    score        int,
    hist         jsonb,                      -- {concept, application, calculation, time}
    guessed_right int,
    weakness     text,                       -- concept|application|calculation|time|null
    sec_per_q    numeric,
    ids          jsonb not null default '[]'::jsonb,
    records      jsonb not null default '[]'::jsonb,   -- [{qid, picked, correct, ms, probe}]
    updated_at   timestamptz not null default now(),
    primary key (device_id, chapter_key, run_no)
);

create table if not exists ep_retries (
    id           bigint generated always as identity primary key,
    device_id    uuid not null references ab_devices(device_id) on delete cascade,
    chapter_key  text not null,
    qid          text not null,
    from_qid     text,
    mistake_type text,                       -- the probe type the retry is for
    picked       int,
    correct      boolean,
    probe        text,                       -- sure|guessed|concept|application|calculation|time
    ms           int,
    at           timestamptz not null,       -- the CLIENT clock, what the page keys on
    unique (device_id, qid, at)
);

create table if not exists ep_chapter_state (
    device_id    uuid not null references ab_devices(device_id) on delete cascade,
    chapter_key  text not null,
    streak       jsonb not null default '{}'::jsonb,   -- {type: n}
    strong_now   jsonb not null default '{}'::jsonb,   -- {type: 'YYYY-MM-DD'}
    updated_at   timestamptz not null default now(),
    primary key (device_id, chapter_key)
);

create index if not exists ep_runs_device_idx    on ep_runs (device_id);
create index if not exists ep_retries_device_idx on ep_retries (device_id, chapter_key);

alter table ep_runs          enable row level security;
alter table ep_retries       enable row level security;
alter table ep_chapter_state enable row level security;

comment on table ep_runs          is 'EAPCET finder: one row per ten-question run. A finished run never changes (finished_at is kept once set). 2026-09-10.';
comment on table ep_retries       is 'EAPCET finder: sibling retries. Unique on (device, qid, client at) so a replayed sync inserts nothing.';
comment on table ep_chapter_state is 'EAPCET finder: streak + strong-now per chapter, RECOMPUTED from ep_retries on every sync (never trusted from the page).';

-- ── 3. the solutions ────────────────────────────────────────────────────────
-- Pushed by src/scripts/push_eapcet_content.ts from the RELEASE file only, so
-- a row exists only for a question that passed the key gate, the blind audit
-- and the founder spot-check. The page never carries these bytes; an entitled
-- device fetches its chapter through ep-state into memory.
create table if not exists ep_solutions (
    qid         text primary key,
    chapter_key text not null,
    -- The question as the release file carries it: {asked_label, question_en,
    -- options_en, answer}. Stored beside the solution so ep-vidi-chat builds its
    -- grounding from ONE row, byte-stable per question, and never from what the
    -- page sends.
    question    jsonb not null default '{}'::jsonb,
    solution    jsonb not null,
    -- The two Answer Book cards the release grounds this question on, resolved
    -- to text at push time: [{question_id, title, text}].
    grounding   jsonb not null default '[]'::jsonb,
    verified    boolean not null default false,
    updated_at  timestamptz not null default now()
);
create index if not exists ep_solutions_chapter_idx on ep_solutions (chapter_key);
alter table ep_solutions enable row level security;
comment on table ep_solutions is 'EAPCET finder: verified worked solutions, one per question id, with the question and its grounding cards. Only the release file writes here (push_eapcet_content.ts).';

-- ── 4. entitlements + payments (column-for-column copies of the ab_ pair) ───
create table if not exists ep_entitlements (
    id         bigint generated always as identity primary key,
    device_id  uuid not null references ab_devices(device_id) on delete cascade,
    unit_key   text not null,                -- 'all' (the whole physics finder)
    source     text not null check (source in ('paid', 'grant')),
    created_at timestamptz not null default now(),
    expires_at timestamptz                   -- NULL = permanent (a grant)
);
create unique index if not exists ep_entitlements_dedup      on ep_entitlements (device_id, unit_key, source);
create index        if not exists ep_entitlements_device_idx on ep_entitlements (device_id);
alter table ep_entitlements enable row level security;
comment on table ep_entitlements is 'EAPCET finder: which device may read solutions. Kept apart from ab_entitlements so an Answer Book pass never unlocks EAPCET.';

create table if not exists ep_payments (
    payment_id   text primary key,           -- Razorpay payment id = the idempotency key
    event        text not null,
    device_id    uuid references ab_devices(device_id) on delete set null,
    sku          text not null default 'eapcet_physics_month',
    amount_paise integer not null,
    founding     boolean not null default false,
    period_days  integer not null default 31,
    received_at  timestamptz not null default now(),
    applied_at   timestamptz,                -- null = money banked, device unknown
    raw          jsonb,
    note         text
);
create index if not exists ep_payments_device_idx    on ep_payments (device_id);
create index if not exists ep_payments_founding_idx  on ep_payments (device_id) where founding;
create index if not exists ep_payments_unapplied_idx on ep_payments (received_at) where applied_at is null;
alter table ep_payments enable row level security;
comment on table ep_payments is 'EAPCET finder: every payment ep-razorpay-webhook has seen. PK = Razorpay payment_id. applied_at null = no device in notes, attach by hand.';

-- ── 5. events (a copy of ab_events with its four indexes) ───────────────────
create table if not exists ep_events (
    id          bigserial primary key,
    device_id   uuid,
    session_id  text not null,
    visit_id    text,
    event_type  text not null,
    happened_at timestamptz not null,
    props       jsonb not null default '{}'::jsonb,
    is_internal boolean not null default false,
    created_at  timestamptz not null default now()
);
create index if not exists ep_events_created_idx on ep_events (created_at desc);
create index if not exists ep_events_type_idx    on ep_events (event_type, created_at desc);
create index if not exists ep_events_device_idx  on ep_events (device_id, created_at desc);
create index if not exists ep_events_real_idx    on ep_events (created_at desc) where not is_internal;
alter table ep_events enable row level security;
comment on table ep_events is 'EAPCET finder: one row per student action (open, chapter_open, q_pick, probe, run_done, lock_hit…). is_internal = team device.';

-- ── 6. ep_sync — push everything, get the merged truth back ─────────────────
-- p_chapters is the page's ep_state_v1.chapters object:
--   {"<key>": {"runs": [{run_no, seed, ids, started_at, finished_at, records, diagnosis}],
--              "retries": [{qid, from_qid, type, picked, correct, probe, ms, at}], ...}}
-- Runs: a finished run is immutable — the first finished_at the server saw is
-- kept, later pushes of that run change nothing. An unfinished run is replaced
-- by whatever the page has (it is the same device continuing).
-- Retries: unique on (device, qid, at); replays insert nothing.
-- Chapter state: recomputed from ep_retries, mirroring 55_diag.js:
--   streak[type] = consecutive retries for that type that were correct AND
--   probed 'sure' (anything else resets to 0); strong_now[type] = the IST date
--   the streak first reached 3.
create or replace function ep_sync(
    p_device          uuid,
    p_platform        text,
    p_ip_hash         text,
    p_chapters        jsonb,
    p_max_new_per_ip  int default 20,
    p_internal        boolean default null   -- null = the page said nothing
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_exists  boolean;
    v_minted  int;
    v_ck      text;
    v_ch      jsonb;
    v_run     jsonb;
    v_ret     jsonb;
    v_out     jsonb := '{}'::jsonb;
    v_keys    text[];
    v_key     text;
    v_streak  jsonb;
    v_strong  jsonb;
    v_n       int;
    v_type    text;
    r         record;
begin
    if p_device is null then
        return jsonb_build_object('ok', false, 'error', 'device_required');
    end if;
    if p_chapters is not null and jsonb_typeof(p_chapters) <> 'object' then
        return jsonb_build_object('ok', false, 'error', 'bad_chapters');
    end if;

    -- The same mint rule as ab_sync: only a NEW device is IP-capped.
    select true into v_exists from ab_devices where device_id = p_device;
    if v_exists is null then
        if p_max_new_per_ip > 0 and p_ip_hash is not null then
            select count(*) into v_minted
              from ab_devices
             where ip_hash = p_ip_hash
               and created_at > now() - interval '1 day';
            if v_minted >= p_max_new_per_ip then
                return jsonb_build_object('ok', false, 'error', 'device_quota');
            end if;
        end if;
        insert into ab_devices (device_id, platform, ip_hash, is_internal)
        values (p_device, p_platform, p_ip_hash, coalesce(p_internal, false))
        on conflict (device_id) do nothing;
    else
        update ab_devices
           set last_seen_at = now(),
               platform = coalesce(p_platform, platform),
               is_internal = case when p_internal is null then is_internal else p_internal end
         where device_id = p_device;
    end if;

    -- ── push ──
    for v_ck, v_ch in select * from jsonb_each(coalesce(p_chapters, '{}'::jsonb)) loop
        if v_ck !~ '^p[12]-[0-9]{2}$' or jsonb_typeof(v_ch) <> 'object' then continue; end if;

        if jsonb_typeof(v_ch->'runs') = 'array' then
            for v_run in select * from jsonb_array_elements(v_ch->'runs') loop
                if jsonb_typeof(v_run->'run_no') <> 'number' then continue; end if;
                insert into ep_runs (device_id, chapter_key, run_no, seed, started_at, finished_at,
                                     score, hist, guessed_right, weakness, sec_per_q, ids, records, updated_at)
                values (p_device, v_ck, (v_run->>'run_no')::int, left(v_run->>'seed', 64),
                        nullif(v_run->>'started_at', '')::timestamptz,
                        nullif(v_run->>'finished_at', '')::timestamptz,
                        (v_run->'diagnosis'->>'score')::int,
                        v_run->'diagnosis'->'hist',
                        (v_run->'diagnosis'->>'guessed_right')::int,
                        left(v_run->'diagnosis'->>'weakness', 16),
                        (v_run->'diagnosis'->>'sec_per_q')::numeric,
                        coalesce(v_run->'ids', '[]'::jsonb),
                        coalesce(v_run->'records', '[]'::jsonb),
                        now())
                on conflict (device_id, chapter_key, run_no) do update
                   set seed = excluded.seed,
                       started_at = coalesce(ep_runs.started_at, excluded.started_at),
                       finished_at = excluded.finished_at,
                       score = excluded.score, hist = excluded.hist,
                       guessed_right = excluded.guessed_right, weakness = excluded.weakness,
                       sec_per_q = excluded.sec_per_q, ids = excluded.ids, records = excluded.records,
                       updated_at = now()
                 where ep_runs.finished_at is null;   -- a finished run never changes
            end loop;
        end if;

        if jsonb_typeof(v_ch->'retries') = 'array' then
            for v_ret in select * from jsonb_array_elements(v_ch->'retries') loop
                if coalesce(v_ret->>'qid', '') = '' or coalesce(v_ret->>'at', '') = '' then continue; end if;
                begin
                    insert into ep_retries (device_id, chapter_key, qid, from_qid, mistake_type,
                                            picked, correct, probe, ms, at)
                    values (p_device, v_ck, left(v_ret->>'qid', 80), left(v_ret->>'from_qid', 80),
                            left(v_ret->>'type', 16), (v_ret->>'picked')::int,
                            (v_ret->>'correct')::boolean, left(v_ret->>'probe', 16),
                            (v_ret->>'ms')::int, (v_ret->>'at')::timestamptz)
                    on conflict (device_id, qid, at) do nothing;
                exception when others then
                    -- one malformed retry must not cost the student the rest of the sync
                    null;
                end;
            end loop;
        end if;
    end loop;

    -- ── recompute the chapter state from the retries ──
    select coalesce(array_agg(distinct chapter_key), '{}'::text[]) into v_keys
      from (select chapter_key from ep_retries where device_id = p_device
            union select chapter_key from ep_runs where device_id = p_device) k;

    foreach v_key in array v_keys loop
        v_streak := '{}'::jsonb;
        v_strong := coalesce((select strong_now from ep_chapter_state
                               where device_id = p_device and chapter_key = v_key), '{}'::jsonb);
        for r in select mistake_type, correct, probe, at
                   from ep_retries
                  where device_id = p_device and chapter_key = v_key
                    and mistake_type in ('concept', 'application', 'calculation', 'time')
                  order by at, id loop
            v_type := r.mistake_type;
            v_n := coalesce((v_streak->>v_type)::int, 0);
            if r.correct and r.probe = 'sure' then v_n := v_n + 1; else v_n := 0; end if;
            v_streak := v_streak || jsonb_build_object(v_type, v_n);
            if v_n >= 3 and (v_strong->>v_type) is null then
                v_strong := v_strong || jsonb_build_object(v_type, to_char(r.at at time zone 'Asia/Kolkata', 'YYYY-MM-DD'));
            end if;
        end loop;
        insert into ep_chapter_state (device_id, chapter_key, streak, strong_now, updated_at)
        values (p_device, v_key, v_streak, v_strong, now())
        on conflict (device_id, chapter_key) do update
           set streak = excluded.streak, strong_now = excluded.strong_now, updated_at = now();
    end loop;

    -- ── pull: the merged chapters, in the page's own shape ──
    select coalesce(jsonb_object_agg(k.chapter_key, jsonb_build_object(
               'runs', coalesce((select jsonb_agg(jsonb_build_object(
                           'run_no', r2.run_no, 'seed', r2.seed, 'ids', r2.ids,
                           'started_at', r2.started_at, 'finished_at', r2.finished_at,
                           'records', r2.records,
                           'diagnosis', case when r2.finished_at is null then null else jsonb_build_object(
                               'score', r2.score, 'hist', r2.hist, 'guessed_right', r2.guessed_right,
                               'weakness', r2.weakness, 'sec_per_q', r2.sec_per_q) end)
                           order by r2.run_no)
                           from ep_runs r2 where r2.device_id = p_device and r2.chapter_key = k.chapter_key), '[]'::jsonb),
               'retries', coalesce((select jsonb_agg(jsonb_build_object(
                           'qid', t.qid, 'from_qid', t.from_qid, 'type', t.mistake_type, 'picked', t.picked,
                           'correct', t.correct, 'probe', t.probe, 'ms', t.ms, 'at', t.at)
                           order by t.at, t.id)
                           from ep_retries t where t.device_id = p_device and t.chapter_key = k.chapter_key), '[]'::jsonb),
               'streak', coalesce((select streak from ep_chapter_state s
                           where s.device_id = p_device and s.chapter_key = k.chapter_key), '{}'::jsonb),
               'strong_now', coalesce((select strong_now from ep_chapter_state s
                           where s.device_id = p_device and s.chapter_key = k.chapter_key), '{}'::jsonb)
           )), '{}'::jsonb)
      into v_out
      from unnest(v_keys) as k(chapter_key);

    return jsonb_build_object(
        'ok', true,
        'chapters', v_out,
        'server_time', now(),
        'internal', ab_device_is_internal(p_device)
    );
end;
$$;
revoke all on function ep_sync(uuid, text, text, jsonb, int, boolean) from public, anon, authenticated;

-- ── 7. what does THIS device pay? ───────────────────────────────────────────
-- ab_price_for's rule, on the EAPCET sku and the EAPCET ledger. With no
-- founding price set (the default) every device pays the list price.
create or replace function ep_price_for(p_device uuid)
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
      from ab_skus where sku = 'eapcet_physics_month' and active limit 1;
    if not found then return null; end if;

    if p_device is not null then
        select exists (select 1 from ep_payments where device_id = p_device and founding)
          into v_is_f;
    end if;

    select count(distinct device_id) into v_taken from ep_payments where founding;
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
        'founding', (v_sku.founding_price_inr is not null and v_price = v_sku.founding_price_inr),
        'founding_locked', v_is_f,
        'founding_slots_left', case when v_sku.founding_limit is null then null else v_left end,
        'period_days', v_sku.period_days
    );
end;
$$;
revoke all on function ep_price_for(uuid) from public, anon, authenticated;

-- ── 8. money in → access out, exactly once ──────────────────────────────────
create or replace function ep_apply_payment(
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
    if exists (select 1 from ep_payments where payment_id = p_payment_id) then
        return jsonb_build_object('ok', true, 'duplicate', true);
    end if;

    v_price := ep_price_for(p_device);
    v_found := coalesce((v_price->>'founding')::boolean, false);
    v_days  := coalesce((v_price->>'period_days')::int, 31);

    if p_device is null then
        insert into ep_payments (payment_id, event, device_id, amount_paise, founding, period_days, raw, note)
        values (p_payment_id, p_event, null, coalesce(p_amount_paise, 0), false, v_days, p_raw,
                'no device_id in notes — attach by hand');
        return jsonb_build_object('ok', true, 'pending', true, 'reason', 'no_device');
    end if;

    insert into ab_devices (device_id) values (p_device) on conflict (device_id) do nothing;

    begin
        insert into ep_payments (payment_id, event, device_id, amount_paise, founding, period_days, raw, applied_at)
        values (p_payment_id, p_event, p_device, coalesce(p_amount_paise, 0), v_found, v_days, p_raw, now());
    exception when unique_violation then
        return jsonb_build_object('ok', true, 'duplicate', true);
    end;

    -- Extend, never stack.
    select expires_at into v_current
      from ep_entitlements
     where device_id = p_device and unit_key = 'all' and source = 'paid';

    v_new := greatest(now(), coalesce(v_current, now())) + (v_days || ' days')::interval;

    insert into ep_entitlements (device_id, unit_key, source, expires_at)
    values (p_device, 'all', 'paid', v_new)
    on conflict (device_id, unit_key, source) do update set expires_at = v_new;

    return jsonb_build_object('ok', true, 'unlocked_until', v_new, 'founding', v_found);
end;
$$;
revoke all on function ep_apply_payment(text, text, uuid, integer, jsonb) from public, anon, authenticated;

-- ── 9. write a batch of events (ab_log_events, into ep_events) ──────────────
create or replace function ep_log_events(
    p_device   uuid,
    p_session  text,
    p_visit    text,
    p_internal boolean,
    p_events   jsonb               -- [{t, at, ...props}, ...]
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_internal boolean;
    v_n int;
begin
    if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) = 0 then
        return jsonb_build_object('ok', true, 'n', 0);
    end if;

    if p_internal and p_device is not null then
        insert into ab_devices (device_id, is_internal) values (p_device, true)
        on conflict (device_id) do update set is_internal = true;
    end if;

    v_internal := coalesce(p_internal, false)
        or (p_device is not null and ab_device_is_internal(p_device));

    insert into ep_events (device_id, session_id, visit_id, event_type, happened_at, props, is_internal)
    select p_device,
           left(coalesce(p_session, 'anon'), 64),
           left(p_visit, 32),
           left(e->>'t', 40),
           case
               when jsonb_typeof(e->'at') = 'number' and (e->>'at')::numeric between 1e12 and 1e13
                   then to_timestamp((e->>'at')::numeric / 1000.0)
               else now()
           end,
           (e - 't' - 'at'),
           v_internal
      from jsonb_array_elements(p_events) as e
     where coalesce(e->>'t', '') <> '';

    get diagnostics v_n = row_count;
    return jsonb_build_object('ok', true, 'n', v_n);
end $$;
revoke all on function ep_log_events(uuid, text, text, boolean, jsonb) from public, anon, authenticated;

-- ── 10. the numbers — the week-one read-out from the plan ───────────────────
-- Devices, not students. Internal rows out by default. The event names are the
-- ones 60_run.js / 80_screens.js / 90_boot.js actually log.
create or replace function ep_stats(
    p_token            text,
    p_since            timestamptz default '2026-09-10',
    p_include_internal boolean default false
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v jsonb;
    v_today timestamptz := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
begin
    if not exists (select 1 from ab_admin_config where key = 'stats_token' and value = p_token) then
        return jsonb_build_object('ok', false, 'error', 'unauthorized');
    end if;

    with ev as (
        select e.*
          from ep_events e
         where e.created_at >= p_since
           and (p_include_internal or not e.is_internal)
    ),
    dev as (
        select d.device_id, d.platform, d.created_at, d.last_seen_at,
               (d.is_internal or ab_device_is_internal(d.device_id)) as internal
          from ab_devices d
         where exists (select 1 from ep_events e where e.device_id = d.device_id)
    ),
    real_dev as (
        select * from dev where p_include_internal or not internal
    ),
    payers as (
        select distinct en.device_id
          from ep_entitlements en join real_dev d on d.device_id = en.device_id
         where en.unit_key = 'all'
    ),
    days_per_device as (
        select device_id, count(distinct date(happened_at at time zone 'Asia/Kolkata')) as days
          from ev where device_id is not null group by device_id
    ),
    per_type as (
        select event_type, count(*) as n, count(distinct device_id) as devices
          from ev group by event_type order by n desc
    ),
    by_day as (
        select date(happened_at at time zone 'Asia/Kolkata') as d,
               count(distinct device_id) filter (where event_type = 'open') as devices,
               count(*) filter (where event_type = 'run_start') as runs_started,
               count(*) filter (where event_type = 'run_done') as runs_done
          from ev group by 1 order by 1
    ),
    chapters as (
        select props->>'chapter' as chapter,
               count(*) filter (where event_type = 'chapter_open') as opens,
               count(*) filter (where event_type = 'run_start') as runs_started,
               count(*) filter (where event_type = 'run_done') as runs_done,
               count(distinct device_id) filter (where event_type = 'run_done') as devices_done,
               round(avg((props->>'score')::numeric) filter (where event_type = 'run_done'), 2) as avg_score
          from ev where props ? 'chapter'
         group by 1 order by opens desc
    ),
    weakness as (
        select props->>'weakness' as weakness, count(*) as n
          from ev where event_type = 'run_done' group by 1 order by n desc
    ),
    probes as (
        select props->>'type' as type, count(*) as n
          from ev where event_type = 'probe' group by 1 order by n desc
    ),
    picks as (
        select count(*) as n,
               count(*) filter (where (props->>'correct')::boolean) as correct,
               percentile_cont(0.5) within group (order by (props->>'ms')::numeric) as median_ms
          from ev where event_type = 'q_pick' and (props->>'ms') ~ '^[0-9]+$'
    ),
    run_done as (
        select count(*) as n,
               percentile_cont(0.5) within group (order by (props->>'sec_per_q')::numeric) as median_sec_per_q,
               round(avg((props->>'score')::numeric), 2) as avg_score,
               round(avg((props->>'guessed_right')::numeric), 2) as avg_guessed_right
          from ev where event_type = 'run_done'
    ),
    errs as (
        select left(props->>'msg', 120) as msg, count(*) as n, count(distinct device_id) as devices
          from ev where event_type = 'err' group by 1 order by n desc limit 15
    ),
    ledger as (
        select
            count(*)                                                                          as asks_all,
            coalesce(sum(estimated_cost_usd), 0)                                              as usd_all,
            count(*) filter (where actor = 'eapcet_student')                                  as asks_student,
            coalesce(sum(estimated_cost_usd) filter (where actor = 'eapcet_student'), 0)      as usd_student,
            count(*) filter (where actor = 'eapcet_team')                                     as asks_team,
            coalesce(sum(estimated_cost_usd) filter (where actor = 'eapcet_team'), 0)         as usd_team,
            count(*) filter (where actor in ('eapcet_probe', 'eapcet_local'))                 as asks_probe,
            coalesce(sum(estimated_cost_usd) filter (where actor in ('eapcet_probe', 'eapcet_local')), 0) as usd_probe,
            count(*) filter (where created_at >= v_today and actor = 'eapcet_student')        as asks_today_student,
            coalesce(sum(estimated_cost_usd) filter (where created_at >= v_today and actor = 'eapcet_student'), 0) as usd_today_student
          from ai_usage_log
         where task_type = 'eapcet_vidi_chat' and created_at >= p_since
    ),
    device_rows as (
        select d.device_id, d.platform, d.created_at, d.last_seen_at, d.internal,
               (select lower(u.email) from ab_account_devices ad join auth.users u on u.id = ad.user_id
                 where ad.device_id = d.device_id order by ad.linked_at desc limit 1) as email,
               (select count(*) from ep_events e where e.device_id = d.device_id) as events,
               (select count(*) from ep_runs r where r.device_id = d.device_id and r.finished_at is not null) as runs,
               (select count(*) from ep_retries t where t.device_id = d.device_id) as retries,
               (select count(*) from ep_chapter_state s, jsonb_each(s.strong_now)
                 where s.device_id = d.device_id) as strong_now,
               (select max(happened_at) from ep_events e where e.device_id = d.device_id) as last_event,
               exists (select 1 from payers p where p.device_id = d.device_id) as paid
          from dev d
         where p_include_internal or not d.internal
         order by coalesce((select max(happened_at) from ep_events e where e.device_id = d.device_id), d.last_seen_at) desc
         limit 300
    )
    select jsonb_build_object(
        'ok', true,
        'since', p_since,
        'generated_at', now(),
        'include_internal', p_include_internal,
        'excluded_devices', (select count(*) from dev where internal),
        'devices', jsonb_build_object(
            'active',    (select count(distinct device_id) from ev where device_id is not null),
            'new',       (select count(*) from real_dev where created_at >= p_since),
            'total',     (select count(*) from real_dev),
            'returning', (select count(*) from days_per_device where days >= 2),
            'signed_in', (select count(distinct ad.device_id) from ab_account_devices ad join real_dev d on d.device_id = ad.device_id),
            'paid',      (select count(*) from payers)
        ),
        -- chapter_open → run_start → run_done → diag_view → lock_hit → pay_start → unlock_seen
        'funnel', jsonb_build_object(
            'opened',       (select count(distinct device_id) from ev where event_type = 'open'),
            'chose_physics',(select count(distinct device_id) from ev where event_type = 'subject_pick'),
            'chapter_open', (select count(distinct device_id) from ev where event_type = 'chapter_open'),
            'run_start',    (select count(distinct device_id) from ev where event_type = 'run_start'),
            'run_done',     (select count(distinct device_id) from ev where event_type = 'run_done'),
            'diag_view',    (select count(distinct device_id) from ev where event_type = 'diag_view'),
            'lock_hit',     (select count(distinct device_id) from ev where event_type = 'lock_hit'),
            'pay_start',    (select count(distinct device_id) from ev where event_type = 'pay_start'),
            'unlock_seen',  (select count(distinct device_id) from ev where event_type = 'unlock_seen'),
            'fix_open',     (select count(distinct device_id) from ev where event_type = 'fix_open'),
            'retry',        (select count(distinct device_id) from ev where event_type = 'retry_pick'),
            'strong_now',   (select count(distinct device_id) from ev where event_type = 'strong_now'),
            'came_back',    (select count(*) from days_per_device where days >= 2)
        ),
        'runs', jsonb_build_object(
            'started',            (select count(*) from ev where event_type = 'run_start'),
            'done',               (select n from run_done),
            'completion_pct',     (select case when (select count(*) from ev where event_type = 'run_start') = 0 then null
                                          else round(100.0 * (select n from run_done) / (select count(*) from ev where event_type = 'run_start'), 0) end),
            'avg_score',          (select avg_score from run_done),
            'avg_guessed_right',  (select avg_guessed_right from run_done),
            'median_sec_per_q',   (select round(coalesce(median_sec_per_q, 0)::numeric, 1) from run_done),
            'exam_sec_per_q',     67.5,
            'picks',              (select n from picks),
            'picks_correct_pct',  (select case when n = 0 then null else round(100.0 * correct / n, 0) end from picks),
            'pick_median_ms',     (select round(coalesce(median_ms, 0)::numeric, 0) from picks)
        ),
        'weakness',  (select coalesce(jsonb_agg(to_jsonb(w)), '[]'::jsonb) from weakness w),
        'probes',    (select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from probes p),
        'chapters',  (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from chapters c),
        'by_day',    (select coalesce(jsonb_agg(to_jsonb(b)), '[]'::jsonb) from by_day b),
        'events',    (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) from per_type t),
        'errors',    (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from errs x),
        'payers', jsonb_build_object(
            'n',                  (select count(*) from payers),
            'retries_per_payer',  (select case when count(*) = 0 then null else
                                          round((select count(*) from ep_retries t join payers p on p.device_id = t.device_id)::numeric / count(*), 1) end from payers),
            'strong_now_total',   (select count(*) from ep_chapter_state s join payers p on p.device_id = s.device_id, jsonb_each(s.strong_now))
        ),
        'vidi', jsonb_build_object(
            'asks',               (select count(*) from ev where event_type = 'ask'),
            'chips',              (select count(*) from ev where event_type = 'chip'),
            'ledger_asks',        (select case when p_include_internal then asks_all else asks_student end from ledger),
            'ledger_usd',         (select round((case when p_include_internal then usd_all else usd_student end)::numeric, 4) from ledger),
            'ledger_asks_today',  (select asks_today_student from ledger),
            'ledger_usd_today',   (select round(usd_today_student::numeric, 4) from ledger),
            'asks_per_payer',     (select case when (select count(*) from payers) = 0 then null
                                          else round(asks_student::numeric / (select count(*) from payers), 1) end from ledger),
            'usd_per_payer',      (select case when (select count(*) from payers) = 0 then null
                                          else round((usd_student / (select count(*) from payers))::numeric, 4) end from ledger),
            -- never hidden: the all-actors total is what a forged team claim cannot lower
            'ledger_team_asks',   (select asks_team  from ledger),
            'ledger_team_usd',    (select round(usd_team::numeric, 4)  from ledger),
            'ledger_probe_asks',  (select asks_probe from ledger),
            'ledger_probe_usd',   (select round(usd_probe::numeric, 4) from ledger),
            'ledger_all_asks',    (select asks_all   from ledger),
            'ledger_all_usd',     (select round(usd_all::numeric, 4)   from ledger)
        ),
        'device_rows', (select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) from device_rows r)
    ) into v;

    return v;
end $$;
revoke all on function ep_stats(text, timestamptz, boolean) from public, anon, authenticated;
