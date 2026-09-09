-- EAPCET Physics finder — routes and shapes (2026-09-11)
--
-- The precise-diagnosis design (docs/superpowers/specs/2026-09-09-eapcet-
-- precise-diagnosis-design.md). A run's record now carries the ROUTE the
-- student tapped ('r', 'm<k>', 'guess', 'sure') instead of a self-reported
-- probe; a sibling retry is keyed by the SHAPE of the question it came from;
-- a run's whole diagnosis (parameters, outcomes, shapes, confirmed share) is
-- stored as the phone computed it, so a pull returns exactly what the page
-- showed. ep_solutions gains the question's shape so ep-vidi-chat can name it.
--
-- SAFE TO RE-RUN: add-column-if-not-exists + create-or-replace only. No DROP,
-- no UPDATE of existing rows. ep_sync and ep_stats keep their signatures, so
-- the revokes of 2026-09-10 stand.

alter table ep_solutions add column if not exists shape jsonb;
alter table ep_retries  add column if not exists shape_key  text;
alter table ep_retries  add column if not exists route      text;
alter table ep_retries  add column if not exists same_shape boolean;
alter table ep_runs     add column if not exists diagnosis  jsonb;

-- ep_sync, same contract as before, three things changed:
--   runs:    the diagnosis is stored whole (hist falls back to params);
--   retries: shape_key, route, same_shape ride along;
--   state:   streak[shape_key] = consecutive retries for that shape that were
--            correct AND by the right route (probe 'sure'); a retry from before
--            shapes (shape_key null) is left out; strong_now keeps every date
--            it already holds.
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
    v_shape   text;
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
                                     score, hist, guessed_right, weakness, sec_per_q, ids, records, diagnosis, updated_at)
                values (p_device, v_ck, (v_run->>'run_no')::int, left(v_run->>'seed', 64),
                        nullif(v_run->>'started_at', '')::timestamptz,
                        nullif(v_run->>'finished_at', '')::timestamptz,
                        (v_run->'diagnosis'->>'score')::int,
                        coalesce(v_run->'diagnosis'->'hist', v_run->'diagnosis'->'params'),
                        (v_run->'diagnosis'->>'guessed_right')::int,
                        left(v_run->'diagnosis'->>'weakness', 16),
                        (v_run->'diagnosis'->>'sec_per_q')::numeric,
                        coalesce(v_run->'ids', '[]'::jsonb),
                        coalesce(v_run->'records', '[]'::jsonb),
                        case when jsonb_typeof(v_run->'diagnosis') = 'object' then v_run->'diagnosis' else null end,
                        now())
                on conflict (device_id, chapter_key, run_no) do update
                   set seed = excluded.seed,
                       started_at = coalesce(ep_runs.started_at, excluded.started_at),
                       finished_at = excluded.finished_at,
                       score = excluded.score, hist = excluded.hist,
                       guessed_right = excluded.guessed_right, weakness = excluded.weakness,
                       sec_per_q = excluded.sec_per_q, ids = excluded.ids, records = excluded.records,
                       diagnosis = excluded.diagnosis,
                       updated_at = now()
                 where ep_runs.finished_at is null;   -- a finished run never changes
            end loop;
        end if;

        if jsonb_typeof(v_ch->'retries') = 'array' then
            for v_ret in select * from jsonb_array_elements(v_ch->'retries') loop
                if coalesce(v_ret->>'qid', '') = '' or coalesce(v_ret->>'at', '') = '' then continue; end if;
                begin
                    insert into ep_retries (device_id, chapter_key, qid, from_qid, mistake_type,
                                            picked, correct, probe, ms, at, shape_key, route, same_shape)
                    values (p_device, v_ck, left(v_ret->>'qid', 80), left(v_ret->>'from_qid', 80),
                            left(v_ret->>'type', 16), (v_ret->>'picked')::int,
                            (v_ret->>'correct')::boolean, left(v_ret->>'probe', 16),
                            (v_ret->>'ms')::int, (v_ret->>'at')::timestamptz,
                            left(v_ret->>'shape_key', 40), left(v_ret->>'route', 16),
                            (v_ret->>'same_shape')::boolean)
                    on conflict (device_id, qid, at) do nothing;
                exception when others then
                    -- one malformed retry must not cost the student the rest of the sync
                    null;
                end;
            end loop;
        end if;
    end loop;

    -- ── recompute the chapter state from the retries, keyed by shape ──
    select coalesce(array_agg(distinct chapter_key), '{}'::text[]) into v_keys
      from (select chapter_key from ep_retries where device_id = p_device
            union select chapter_key from ep_runs where device_id = p_device) k;

    foreach v_key in array v_keys loop
        v_streak := '{}'::jsonb;
        v_strong := coalesce((select strong_now from ep_chapter_state
                               where device_id = p_device and chapter_key = v_key), '{}'::jsonb);
        for r in select shape_key, correct, probe, at
                   from ep_retries
                  where device_id = p_device and chapter_key = v_key
                    and shape_key is not null
                  order by at, id loop
            v_shape := r.shape_key;
            v_n := coalesce((v_streak->>v_shape)::int, 0);
            if r.correct and r.probe = 'sure' then v_n := v_n + 1; else v_n := 0; end if;
            v_streak := v_streak || jsonb_build_object(v_shape, v_n);
            if v_n >= 3 and (v_strong->>v_shape) is null then
                v_strong := v_strong || jsonb_build_object(v_shape, to_char(r.at at time zone 'Asia/Kolkata', 'YYYY-MM-DD'));
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
                           'diagnosis', case when r2.finished_at is null then null else coalesce(r2.diagnosis, jsonb_build_object(
                               'score', r2.score, 'hist', r2.hist, 'guessed_right', r2.guessed_right,
                               'weakness', r2.weakness, 'sec_per_q', r2.sec_per_q)) end)
                           order by r2.run_no)
                           from ep_runs r2 where r2.device_id = p_device and r2.chapter_key = k.chapter_key), '[]'::jsonb),
               'retries', coalesce((select jsonb_agg(jsonb_build_object(
                           'qid', t.qid, 'from_qid', t.from_qid, 'type', t.mistake_type, 'picked', t.picked,
                           'correct', t.correct, 'probe', t.probe, 'ms', t.ms, 'at', t.at,
                           'shape_key', t.shape_key, 'route', t.route, 'same_shape', t.same_shape)
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

-- ep_stats: the same function as 2026-09-10 with ONE change — the `probes`
-- distribution now reads the `route` event (grouped by the outcome the engine
-- assigned) instead of the retired `probe` event. The key name and the `type`
-- column are kept so the dashboard reads it unchanged.
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
        select props->>'outcome' as type, count(*) as n
          from ev where event_type = 'route' group by 1 order by n desc
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
