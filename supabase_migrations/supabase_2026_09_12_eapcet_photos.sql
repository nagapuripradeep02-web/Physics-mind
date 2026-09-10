-- EAPCET Physics finder — photos of the student's working (2026-09-12)
--
-- The fix page can read a photo of the student's handwritten working
-- (ep-photo-read, Gemini 2.5 Flash) and show a tick-list the student confirms.
-- What is kept is the READ, never the image: the final value read, the option
-- it matches, the step where the working leaves the verified one, the model's
-- confidence, and whether the student confirmed the reading. A finished run
-- never changes (ep_sync), so a photo is its own row, keyed like a retry by
-- (device, qid, at) and merged the same way.
--
-- SAFE TO RE-RUN: create-table-if-not-exists + create-or-replace only. ep_sync
-- keeps its signature, so the revokes of 2026-09-10 stand.

create table if not exists ep_photos (
    id           bigint generated always as identity primary key,
    device_id    uuid not null references ab_devices(device_id) on delete cascade,
    chapter_key  text not null,
    qid          text not null,
    run_no       int,
    at           timestamptz not null,       -- the CLIENT clock, what the page keys on
    read_value   text,                       -- the final number read, with its unit, as written
    read_option  int,                        -- the option that value equals within one percent, or null
    diverges_at  int,                        -- 1-based verified step the working leaves, or null
    confidence   numeric,
    confirmed    boolean not null default false,
    evidence     jsonb,                      -- [{step, found, evidence, confidence}] as the page showed it
    created_at   timestamptz not null default now(),
    unique (device_id, qid, at)
);
create index if not exists ep_photos_device_idx on ep_photos (device_id, chapter_key);
alter table ep_photos enable row level security;
comment on table ep_photos is 'EAPCET finder: what ep-photo-read read from a photo of the student''s working and the student confirmed. Never the image.';

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
    v_ph      jsonb;
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

        -- photos: what the fix page read from a photo of the student's working and the
        -- student confirmed. A photo row never carries image bytes; it is keyed like a
        -- retry (qid, at) and merged the same way, because the run it belongs to is
        -- already frozen by the rule above.
        if jsonb_typeof(v_ch->'photos') = 'array' then
            for v_ph in select * from jsonb_array_elements(v_ch->'photos') loop
                if coalesce(v_ph->>'qid', '') = '' or coalesce(v_ph->>'at', '') = '' then continue; end if;
                begin
                    insert into ep_photos (device_id, chapter_key, qid, run_no, at, read_value, read_option,
                                           diverges_at, confidence, confirmed, evidence)
                    values (p_device, v_ck, left(v_ph->>'qid', 80),
                            case when jsonb_typeof(v_ph->'run_no') = 'number' then (v_ph->>'run_no')::int else null end,
                            (v_ph->>'at')::timestamptz,
                            left(v_ph->>'read_value', 80),
                            case when jsonb_typeof(v_ph->'read_option') = 'number' then (v_ph->>'read_option')::int else null end,
                            case when jsonb_typeof(v_ph->'diverges_at') = 'number' then (v_ph->>'diverges_at')::int else null end,
                            case when jsonb_typeof(v_ph->'confidence') = 'number' then (v_ph->>'confidence')::numeric else null end,
                            coalesce((v_ph->>'confirmed')::boolean, false),
                            case when jsonb_typeof(v_ph->'evidence') = 'array' then v_ph->'evidence' else null end)
                    on conflict (device_id, qid, at) do nothing;
                exception when others then
                    null;
                end;
            end loop;
        end if;
    end loop;

    -- ── recompute the chapter state from the retries, keyed by shape ──
    select coalesce(array_agg(distinct chapter_key), '{}'::text[]) into v_keys
      from (select chapter_key from ep_retries where device_id = p_device
            union select chapter_key from ep_runs where device_id = p_device
            union select chapter_key from ep_photos where device_id = p_device) k;

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
               'photos', coalesce((select jsonb_agg(jsonb_build_object(
                           'qid', p.qid, 'run_no', p.run_no, 'at', p.at, 'read_value', p.read_value,
                           'read_option', p.read_option, 'diverges_at', p.diverges_at,
                           'confidence', p.confidence, 'confirmed', p.confirmed, 'evidence', p.evidence)
                           order by p.at, p.id)
                           from ep_photos p where p.device_id = p_device and p.chapter_key = k.chapter_key), '[]'::jsonb),
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
