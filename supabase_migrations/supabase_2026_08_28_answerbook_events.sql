-- ═══════════════════════════════════════════════════════════════════════════
-- APPLIED 2026-08-28 to dxwpkjfypzxrzgbevfnx.  **DO NOT RE-RUN.**
--
-- Committed for the record only. This file was applied out-of-band on the day
-- the analytics branch was built, and that branch never merged — so every
-- object below already exists live with exactly these definitions (verified
-- 2026-09-02: ab_events, ab_accounts_internal, ab_admin_config, the
-- ab_devices.is_internal column, and all five RPCs).
--
-- Re-running it is DESTRUCTIVE in two separate ways:
--   1. Section 10 (see its own note at the foot of this file) marked every
--      device that existed on 2026-08-28. Run today it would mark every device
--      that exists NOW — real students included — and ab_sync cannot clear a
--      flag the page never claimed, so each one would stay mislabelled until
--      somebody found it in the dashboard by hand.
--   2. It DROPS the 8-arg ab_sync overload before recreating the 9-arg form.
--      Two live overloads make the PostgREST call ambiguous, which breaks
--      progress sync for every device at once.
--
-- Later changes to these objects ship as their own create-or-replace files —
-- see supabase_2026_09_02_answerbook_ledger_actor.sql.
-- ═══════════════════════════════════════════════════════════════════════════

-- Answer Book — usage events + the internal-device exclusion (2026-08-28)
--
-- WHY. answers.viditra.co is handed to students over WhatsApp, and nobody can
-- answer "did anyone use it?". Telemetry existed (13 event types, one jsonb
-- blob per batch in simulation_feedback) but carried only pm_vidi_session, so
-- it could never be tied to a device — and every row so far is the founder and
-- two friends testing, with no way to say so. 28 devices read as 28 students
-- when the true number is zero.
--
-- WHAT. (1) ab_events: one row per event, joined to ab_devices by device_id.
-- (2) ab_devices.is_internal: a device the team has marked as "not a student",
-- stamped onto every event at write time so the dashboard never has to guess
-- retroactively. (3) ab_accounts_internal: the same by Google account — a
-- device that signs in as a listed email is marked internal the moment
-- ab_link_device runs. (4) ab_admin_config: the dashboard token, in this
-- project (the pilot project's admin_config guards a different product).
-- (5) The RPCs the Edge Functions call: ab_log_events, ab_stats,
-- ab_mark_internal — all service-role only, like everything here.
--
-- CLEAN START (founder, 2026-08-28): every device that exists when this runs
-- is marked internal. Real counting begins the day the dashboard ships. The
-- historical simulation_feedback rows are a sacred table and stay untouched.

-- ── 1. the events table ─────────────────────────────────────────────────────
create table if not exists ab_events (
    id          bigserial primary key,
    device_id   uuid,                 -- null only when the page had no sync base
    session_id  text not null,        -- pm_vidi_session (per browser, persistent)
    visit_id    text,                 -- per tab-open; what "a session" means on the dashboard
    event_type  text not null,
    happened_at timestamptz not null, -- the CLIENT clock at the moment it happened
    props       jsonb not null default '{}'::jsonb,
    is_internal boolean not null default false,
    created_at  timestamptz not null default now()
);

create index if not exists ab_events_created_idx on ab_events (created_at desc);
create index if not exists ab_events_type_idx    on ab_events (event_type, created_at desc);
create index if not exists ab_events_device_idx  on ab_events (device_id, created_at desc);
create index if not exists ab_events_real_idx    on ab_events (created_at desc) where not is_internal;

-- RLS on, NO policies: the answerbook-vidi-chat function writes and the
-- answerbook-stats function reads, both on the service role. The page ships no
-- Supabase key at all.
alter table ab_events enable row level security;

comment on table ab_events is
    'Answer Book: one row per student action (open, advance, chip, ask…). is_internal = team device, excluded from every count by default. 2026-08-28.';

-- ── 2. the internal flag, by device and by account ──────────────────────────
alter table ab_devices add column if not exists is_internal boolean not null default false;
create index if not exists ab_devices_internal_idx on ab_devices (is_internal);

comment on column ab_devices.is_internal is
    'Marked by the team via #/notastudent/<word>, the dashboard toggle, or a listed internal account. Never a student.';

create table if not exists ab_accounts_internal (
    email    text primary key,          -- lower-cased Google account email
    note     text,
    added_at timestamptz not null default now()
);
alter table ab_accounts_internal enable row level security;
comment on table ab_accounts_internal is
    'Answer Book: Google accounts that belong to the team. Any device that signs in as one is marked internal.';

-- The founder. Add the two friends with:
--   insert into ab_accounts_internal(email, note) values ('x@gmail.com', 'friend');
insert into ab_accounts_internal (email, note) values
    ('nagapuripradeep02@gmail.com',   'founder'),
    ('nagapuripradeep2000@gmail.com', 'founder'),
    ('rahulbachala11@gmail.com',      'team — Razorpay account holder')
on conflict (email) do nothing;

-- ── 3. the dashboard token ──────────────────────────────────────────────────
-- Same shape as the pilot project's admin_config: RLS on, zero policies, so the
-- anon key cannot read it. Read the token once with:
--   select value from ab_admin_config where key = 'stats_token';
create table if not exists ab_admin_config (
    key   text primary key,
    value text not null
);
alter table ab_admin_config enable row level security;
insert into ab_admin_config (key, value)
values ('stats_token', replace(gen_random_uuid()::text, '-', ''))
on conflict (key) do nothing;

-- ── 4. is this device internal? one definition, used everywhere ─────────────
-- A device is internal when its own flag is set OR it is linked to an account
-- whose email is listed. Computed at read time as well as stamped at write
-- time, so adding an email later also re-classifies that account's history.
create or replace function ab_device_is_internal(p_device uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce((select is_internal from ab_devices where device_id = p_device), false)
        or exists (
            select 1
              from ab_account_devices ad
              join auth.users u on u.id = ad.user_id
              join ab_accounts_internal i on i.email = lower(u.email)
             where ad.device_id = p_device
        );
$$;
revoke all on function ab_device_is_internal(uuid) from public, anon, authenticated;

-- ── 5. sync learns the flag ─────────────────────────────────────────────────
-- The page sends internal:true after #/notastudent/<word>; the flag is STICKY
-- (only an explicit internal:false from the /off route clears it), so a
-- device the team marked once stays marked on every later sync.
-- Signature changes (a 9th argument), so the old overload is dropped first —
-- two overloads would make the PostgREST call ambiguous.
drop function if exists ab_sync(uuid, text, text, jsonb, jsonb, timestamptz, int, int);

create or replace function ab_sync(
    p_device          uuid,
    p_platform        text,
    p_ip_hash         text,
    p_rows            jsonb,
    p_plan            jsonb,
    p_plan_saved_at   timestamptz,
    p_max_rows        int default 5000,
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
    v_out     jsonb;
    v_plan    jsonb;
    v_saved   timestamptz;
begin
    if p_device is null then
        return jsonb_build_object('ok', false, 'error', 'device_required');
    end if;
    if jsonb_typeof(p_rows) = 'array' and jsonb_array_length(p_rows) > p_max_rows then
        return jsonb_build_object('ok', false, 'error', 'too_many_rows');
    end if;

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

    if jsonb_typeof(p_rows) = 'array' and jsonb_array_length(p_rows) > 0 then
        insert into ab_progress (device_id, question_id, u_date, r_date, updated_at)
        select p_device,
               r->>'q',
               nullif(r->>'u', '')::date,
               nullif(r->>'r', '')::date,
               now()
          from jsonb_array_elements(p_rows) as r
         where coalesce(r->>'q', '') <> ''
        on conflict (device_id, question_id) do update
           set u_date     = least(ab_progress.u_date, excluded.u_date),
               r_date     = least(ab_progress.r_date, excluded.r_date),
               updated_at = now();
    end if;

    if p_plan is not null and p_plan_saved_at is not null then
        insert into ab_plans (device_id, plan, plan_saved_at, updated_at)
        values (p_device, p_plan, p_plan_saved_at, now())
        on conflict (device_id) do update
           set plan          = excluded.plan,
               plan_saved_at = excluded.plan_saved_at,
               updated_at    = now()
         where excluded.plan_saved_at > ab_plans.plan_saved_at;
    end if;

    select coalesce(jsonb_agg(jsonb_build_object(
               'q', question_id,
               'u', coalesce(to_char(u_date, 'YYYY-MM-DD'), ''),
               'r', coalesce(to_char(r_date, 'YYYY-MM-DD'), ''))), '[]'::jsonb)
      into v_out
      from ab_progress where device_id = p_device;

    select plan, plan_saved_at into v_plan, v_saved
      from ab_plans where device_id = p_device;

    return jsonb_build_object(
        'ok', true,
        'stages', v_out,
        'plan', v_plan,
        'plan_saved_at', v_saved,
        'server_time', now(),
        'internal', ab_device_is_internal(p_device)
    );
end;
$$;
revoke all on function ab_sync(uuid, text, text, jsonb, jsonb, timestamptz, int, int, boolean) from public, anon, authenticated;

-- ── 6. signing in as a listed account marks the device ──────────────────────
create or replace function ab_link_device(
    p_user   uuid,
    p_device uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_devices uuid[];
begin
    if p_user is null or p_device is null then
        return jsonb_build_object('ok', false, 'error', 'bad_request');
    end if;

    insert into ab_devices (device_id)
    values (p_device)
    on conflict (device_id) do nothing;

    insert into ab_account_devices (user_id, device_id)
    values (p_user, p_device)
    on conflict (user_id, device_id) do nothing;

    -- The team signs in like anyone else; the list is what tells them apart.
    update ab_devices d
       set is_internal = true
     where d.device_id = p_device
       and not d.is_internal
       and exists (select 1 from auth.users u
                     join ab_accounts_internal i on i.email = lower(u.email)
                    where u.id = p_user);

    select array_agg(device_id) into v_devices
      from ab_account_devices where user_id = p_user;

    return jsonb_build_object('ok', true, 'devices', to_jsonb(v_devices));
end $$;
revoke all on function ab_link_device(uuid, uuid) from public, anon, authenticated;

-- ── 7. write a batch of events ──────────────────────────────────────────────
-- Called by answerbook-vidi-chat for every {type:'events'} POST. The flag is
-- resolved HERE, once per batch: the page's own claim (internal:true after the
-- secret route) OR anything the device/account already carries. A batch that
-- arrives before the device's first sync still lands correctly because the
-- page's claim travels with it.
create or replace function ab_log_events(
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

    -- A page that says "I am the team" is believed and remembered.
    if p_internal and p_device is not null then
        insert into ab_devices (device_id, is_internal) values (p_device, true)
        on conflict (device_id) do update set is_internal = true;
    end if;

    v_internal := coalesce(p_internal, false)
        or (p_device is not null and ab_device_is_internal(p_device));

    insert into ab_events (device_id, session_id, visit_id, event_type, happened_at, props, is_internal)
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
revoke all on function ab_log_events(uuid, text, text, boolean, jsonb) from public, anon, authenticated;

-- ── 8. the dashboard toggle ─────────────────────────────────────────────────
-- Re-stamps that device's history too, so a device found to be the founder's
-- disappears from every past count, not only future ones.
create or replace function ab_mark_internal(
    p_token  text,
    p_device uuid,
    p_on     boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
    if not exists (select 1 from ab_admin_config where key = 'stats_token' and value = p_token) then
        return jsonb_build_object('ok', false, 'error', 'unauthorized');
    end if;
    if p_device is null then
        return jsonb_build_object('ok', false, 'error', 'bad_device');
    end if;
    insert into ab_devices (device_id, is_internal) values (p_device, p_on)
    on conflict (device_id) do update set is_internal = excluded.is_internal;
    update ab_events set is_internal = p_on where device_id = p_device and is_internal <> p_on;
    return jsonb_build_object('ok', true, 'device_id', p_device, 'internal', p_on);
end $$;
revoke all on function ab_mark_internal(text, uuid, boolean) from public, anon, authenticated;

-- ── 9. the numbers ──────────────────────────────────────────────────────────
-- Aggregates only — never raw events. Everything is DEVICES, not students: one
-- student with a phone and a laptop is two devices until they sign in, and the
-- dashboard says so. Internal rows are out by default; p_include_internal
-- flips them in for the "show all" view.
create or replace function ab_stats(
    p_token            text,
    p_since            timestamptz default '2026-08-28',
    p_include_internal boolean default false
) returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
    v jsonb;
begin
    if not exists (select 1 from ab_admin_config where key = 'stats_token' and value = p_token) then
        return jsonb_build_object('ok', false, 'error', 'unauthorized');
    end if;

    with ev as (
        select e.*
          from ab_events e
         where e.created_at >= p_since
           and (p_include_internal or not e.is_internal)
    ),
    dev as (
        select d.device_id, d.platform, d.created_at, d.last_seen_at,
               (d.is_internal or ab_device_is_internal(d.device_id)) as internal
          from ab_devices d
    ),
    real_dev as (
        select * from dev where p_include_internal or not internal
    ),
    days_per_device as (
        select device_id, count(distinct date(happened_at at time zone 'Asia/Kolkata')) as days
          from ev where device_id is not null group by device_id
    ),
    visits as (
        select visit_id, device_id,
               extract(epoch from (max(happened_at) - min(happened_at))) / 60.0 as mins
          from ev where visit_id is not null group by visit_id, device_id
    ),
    per_type as (
        select event_type, count(*) as n, count(distinct device_id) as devices
          from ev group by event_type order by n desc
    ),
    by_day as (
        select date(happened_at at time zone 'Asia/Kolkata') as d,
               count(distinct device_id) filter (where event_type = 'app_open') as devices,
               count(*) filter (where event_type = 'app_open') as opens,
               count(*) filter (where event_type = 'open_q') as questions
          from ev group by 1 order by 1
    ),
    top_q as (
        select props->>'qid' as qid, props->>'unit' as unit,
               count(*) as opens, count(distinct device_id) as devices
          from ev where event_type = 'open_q' and props ? 'qid'
         group by 1, 2 order by opens desc limit 25
    ),
    top_units as (
        select props->>'unit' as unit, count(*) as opens, count(distinct device_id) as devices
          from ev where event_type = 'open_q' and props ? 'unit'
         group by 1 order by opens desc limit 40
    ),
    subjects as (
        select props->>'subject' as subject, count(*) as opens, count(distinct device_id) as devices
          from ev where event_type = 'open_q' and props ? 'subject'
         group by 1 order by opens desc
    ),
    soon as (
        select props->>'unit' as unit, props->>'ref' as ref, count(*) as n
          from ev where event_type = 'soon_tap'
         group by 1, 2 order by n desc limit 40
    ),
    tracks as (
        select props->>'track' as track, count(*) as n
          from ev where event_type = 'track_interest'
         group by 1 order by n desc
    ),
    chips as (
        select props->>'chip' as chip, count(*) as n
          from ev where event_type = 'chip' group by 1 order by n desc
    ),
    searches as (
        select props->>'q' as q, count(*) as n
          from ev where event_type = 'cat_search' and coalesce(props->>'q', '') <> ''
         group by 1 order by n desc limit 30
    ),
    depth as (
        -- deepest step reached per (device, question): what "read it" means
        select device_id, props->>'qid' as qid,
               max((props->>'i')::int) as deepest, max((props->>'n')::int) as n
          from ev where event_type = 'advance' and (props->>'i') ~ '^[0-9]+$' and (props->>'n') ~ '^[0-9]+$'
         group by 1, 2
    ),
    errs as (
        select left(props->>'msg', 120) as msg, count(*) as n, count(distinct device_id) as devices
          from ev where event_type = 'err' group by 1 order by n desc limit 15
    ),
    ledger as (
        select count(*) as asks,
               coalesce(sum(estimated_cost_usd), 0) as usd,
               count(*) filter (where created_at >= date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata') as asks_today,
               coalesce(sum(estimated_cost_usd) filter (where created_at >= date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata'), 0) as usd_today
          from ai_usage_log
         where task_type = 'answerbook_vidi_chat' and created_at >= p_since
    ),
    device_rows as (
        select d.device_id, d.platform, d.created_at, d.last_seen_at, d.internal,
               (select lower(u.email) from ab_account_devices ad join auth.users u on u.id = ad.user_id
                 where ad.device_id = d.device_id order by ad.linked_at desc limit 1) as email,
               (select count(*) from ab_events e where e.device_id = d.device_id) as events,
               (select count(distinct props->>'qid') from ab_events e
                 where e.device_id = d.device_id and e.event_type = 'open_q') as questions,
               (select max(happened_at) from ab_events e where e.device_id = d.device_id) as last_event,
               (select props->>'track' from ab_events e
                 where e.device_id = d.device_id and e.event_type = 'app_open' and props ? 'track'
                 order by happened_at desc limit 1) as track,
               exists (select 1 from ab_entitlements en where en.device_id = d.device_id and en.unit_key = 'all') as paid
          from dev d
         where p_include_internal or not d.internal
         order by coalesce((select max(happened_at) from ab_events e where e.device_id = d.device_id), d.last_seen_at) desc
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
            'paid',      (select count(distinct en.device_id) from ab_entitlements en join real_dev d on d.device_id = en.device_id where en.unit_key = 'all')
        ),
        'visits', jsonb_build_object(
            'n', (select count(*) from visits),
            'median_min', (select round(coalesce(percentile_cont(0.5) within group (order by mins), 0)::numeric, 1) from visits where mins > 0),
            'p90_min',    (select round(coalesce(percentile_cont(0.9) within group (order by mins), 0)::numeric, 1) from visits where mins > 0)
        ),
        'funnel', jsonb_build_object(
            'opened',      (select count(distinct device_id) from ev where event_type = 'app_open'),
            'chose_track', (select count(distinct device_id) from ev where event_type = 'door_choose'),
            'browsed',     (select count(distinct device_id) from ev where event_type in ('cat_unit','cat_subject','cat_qtype','cat_search')),
            'opened_q',    (select count(distinct device_id) from ev where event_type = 'open_q'),
            'read_3',      (select count(distinct device_id) from depth where deepest >= 3),
            'finished_q',  (select count(distinct device_id) from depth where deepest >= n),
            'used_vidi',   (select count(distinct device_id) from ev where event_type in ('chip','vidi_ask')),
            'marked_done', (select count(distinct device_id) from ev where event_type = 'stage'),
            'came_back',   (select count(*) from days_per_device where days >= 2),
            'hit_wall',    (select count(distinct device_id) from ev where event_type = 'lock_wall'),
            'signed_in',   (select count(distinct device_id) from ev where event_type = 'sign_in_done'),
            'pay_start',   (select count(distinct device_id) from ev where event_type = 'pay_start')
        ),
        'reading', jsonb_build_object(
            'questions_opened', (select count(distinct props->>'qid') from ev where event_type = 'open_q'),
            'question_reads',   (select count(*) from depth),
            'finished_reads',   (select count(*) from depth where deepest >= n),
            'avg_depth_pct',    (select round(coalesce(avg(deepest::numeric / nullif(n, 0)) * 100, 0)::numeric, 0) from depth)
        ),
        'by_day',   (select coalesce(jsonb_agg(to_jsonb(b)), '[]'::jsonb) from by_day b),
        'events',   (select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) from per_type t),
        'top_questions', (select coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb) from top_q q),
        'top_units',     (select coalesce(jsonb_agg(to_jsonb(u)), '[]'::jsonb) from top_units u),
        'subjects',      (select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb) from subjects s),
        'soon_taps',     (select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb) from soon s),
        'track_interest',(select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) from tracks t),
        'searches',      (select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb) from searches s),
        'errors',        (select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb) from errs x),
        'vidi', jsonb_build_object(
            'chips',      (select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from chips c),
            'asks',       (select count(*) from ev where event_type = 'vidi_ask'),
            'opens',      (select count(*) from ev where event_type = 'vidi_open'),
            'mic',        (select count(*) from ev where event_type = 'vidi_mic'),
            -- the ledger counts EVERY ask including the team's — it has no device id
            'ledger_asks',       (select asks from ledger),
            'ledger_usd',        (select round(usd::numeric, 4) from ledger),
            'ledger_asks_today', (select asks_today from ledger),
            'ledger_usd_today',  (select round(usd_today::numeric, 4) from ledger)
        ),
        'device_rows', (select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) from device_rows r)
    ) into v;

    return v;
end $$;
revoke all on function ab_stats(text, timestamptz, boolean) from public, anon, authenticated;

-- ── 10. CLEAN START — ran ONCE, 2026-08-28. Deliberately not re-runnable. ───
-- What ran that day, verbatim:
--
--     update ab_devices set is_internal = true;
--
-- It marked the 29 devices that existed then, all of which were the team
-- testing before counting began. It is left here as a COMMENT, not as code,
-- because the statement carries no date bound: running it now would sweep in
-- every device minted since — real students included — and nothing clears that
-- flag automatically (ab_sync keeps a flag the page never claimed). A wrongly
-- marked student silently disappears from every number on the dashboard, which
-- is the exact failure this whole migration exists to prevent.
--
-- To mark devices after the fact, use the dashboard's per-device "mark team"
-- toggle (ab_mark_internal), which is reversible and retro-stamps ab_events.
