-- Answer Book — the cost ledger learns WHO asked (2026-09-02)
--
-- WHY. ab_stats already excludes team DEVICES from every event and device
-- number, but its ledger CTE reads ai_usage_log, which had no device column —
-- so the one line on the dashboard that shows MONEY counted the founder's own
-- testing, every teammate's phone, and every automated Claude probe as student
-- demand. Measured the day this was written: of 80 answerbook_vidi_chat rows,
-- 45 were script probes and 10 more were browser sessions on a team device's
-- network. 25 were real. The headline said 80.
--
-- WHAT. answerbook-vidi-chat now stamps an `actor` on every row it writes
-- (answerbook_student | answerbook_team | answerbook_probe | answerbook_local)
-- with metadata.actor_reason recording which signal decided it. This file
-- teaches ab_stats to read that column.
--
-- THE ALL-ACTORS TOTAL IS NEVER HIDDEN. Three of the four actor signals are
-- client-supplied, so a caller could claim to be the team; if team rows also
-- vanished from the screen, that claim would hide real spend from the only
-- page that watches it. ledger_all_* is the number that cannot be gamed, and
-- the dashboard prints it beside the student-only figure.
--
-- SAFE TO RE-RUN. create-or-replace only, unchanged signature: no DDL, no
-- DROP (dropping ab_stats' 3-arg form would leave PostgREST ambiguous), no
-- UPDATE, no data touched. Never re-run supabase_2026_08_28_answerbook_events
-- .sql — see the DO-NOT-RE-RUN banner at the top of that file.
--
-- Also fixes a second, quieter lie in the same function: `devices.total`
-- counted every device ever minted, including those created before the
-- instrumented page shipped, which carry no events and can never be attributed
-- to anyone. It is now bounded by p_since, and the old unbounded number stays
-- available as `total_ever`.

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
    -- Midnight IST, named once. The original repeated this expression four
    -- times inside the ledger CTE; the actor split needs it eight times.
    v_today timestamptz := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
    -- The day the INSTRUMENTED page went live. Devices minted before it carry
    -- no events and are unattributable; see 'total' below. A fixed constant on
    -- purpose — it is a fact about when counting began, not a user's filter.
    v_epoch timestamptz := '2026-09-02 00:00:00+05:30';
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
    -- WHO ASKED. ai_usage_log has no device column, so until 2026-09-02 a team
    -- ask and a student ask were the same row and every cost-per-student number
    -- here was a lie. answerbook-vidi-chat now stamps an actor on every row;
    -- metadata.actor_reason records which signal decided it. Rows written
    -- before that day are all 'answerbook_student' except the ones the reviewed
    -- 2026-09-02 relabel moved by explicit session id.
    --
    -- answerbook_local (someone serving a hosted build on their own machine)
    -- counts with the probes: it is testing, not demand.
    ledger as (
        select
            count(*)                                                                              as asks_all,
            coalesce(sum(estimated_cost_usd), 0)                                                  as usd_all,
            count(*) filter (where actor = 'answerbook_student')                                  as asks_student,
            coalesce(sum(estimated_cost_usd) filter (where actor = 'answerbook_student'), 0)      as usd_student,
            count(*) filter (where actor = 'answerbook_team')                                     as asks_team,
            coalesce(sum(estimated_cost_usd) filter (where actor = 'answerbook_team'), 0)         as usd_team,
            count(*) filter (where actor in ('answerbook_probe', 'answerbook_local'))             as asks_probe,
            coalesce(sum(estimated_cost_usd) filter (where actor in ('answerbook_probe', 'answerbook_local')), 0) as usd_probe,
            count(*) filter (where created_at >= v_today)                                         as asks_today_all,
            coalesce(sum(estimated_cost_usd) filter (where created_at >= v_today), 0)             as usd_today_all,
            count(*) filter (where created_at >= v_today and actor = 'answerbook_student')        as asks_today_student,
            coalesce(sum(estimated_cost_usd) filter (where created_at >= v_today and actor = 'answerbook_student'), 0) as usd_today_student
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
            -- Bounded by the INSTRUMENTATION EPOCH, deliberately NOT by p_since.
            -- Devices minted before the instrumented page shipped carry no
            -- events at all and can never be attributed to anyone, so they are
            -- dropped here — but bounding this by p_since instead would make it
            -- character-identical to 'new' above, and would read LOWER than
            -- 'active' the moment a device first seen before the window comes
            -- back inside it (active counts events, this counts creation).
            -- total_ever keeps the original unbounded number.
            'total',     (select count(*) from real_dev where created_at >= v_epoch),
            'total_ever',(select count(*) from real_dev),
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
            -- The headline follows the same "show team too" switch as every
            -- other number on the page.
            'ledger_asks',       (select case when p_include_internal then asks_all       else asks_student       end from ledger),
            'ledger_usd',        (select round((case when p_include_internal then usd_all else usd_student        end)::numeric, 4) from ledger),
            'ledger_asks_today', (select case when p_include_internal then asks_today_all else asks_today_student end from ledger),
            'ledger_usd_today',  (select round((case when p_include_internal then usd_today_all else usd_today_student end)::numeric, 4) from ledger),
            -- Always returned, never filtered. See the header: the all-actors
            -- total is what stops a forged "I am the team" claim from hiding
            -- real spend from the only page that watches it.
            'ledger_team_asks',  (select asks_team  from ledger),
            'ledger_team_usd',   (select round(usd_team::numeric, 4)  from ledger),
            'ledger_probe_asks', (select asks_probe from ledger),
            'ledger_probe_usd',  (select round(usd_probe::numeric, 4) from ledger),
            'ledger_all_asks',   (select asks_all   from ledger),
            'ledger_all_usd',    (select round(usd_all::numeric, 4)   from ledger),
            -- TODAY, all actors. This is the operationally important one:
            -- AB_DAILY_USD_CAP is a DAILY ceiling enforced over EVERY actor, so
            -- a heavy probing session can be about to start refusing real
            -- students while the student-only figure still reads near zero.
            'ledger_all_asks_today', (select asks_today_all from ledger),
            'ledger_all_usd_today',  (select round(usd_today_all::numeric, 4) from ledger)
        ),
        'device_rows', (select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb) from device_rows r)
    ) into v;

    return v;
end $$;
revoke all on function ab_stats(text, timestamptz, boolean) from public, anon, authenticated;
