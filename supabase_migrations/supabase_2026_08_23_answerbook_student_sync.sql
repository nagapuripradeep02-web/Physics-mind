-- Answer Book — anonymous student sync (P2, 2026-08-23)
--
-- The student has NO login (founder's journey: open a WhatsApp link, start
-- reading). Identity is a random UUIDv4 minted in the browser and kept in
-- localStorage as `pm_device_id`. 122 bits of entropy makes it unguessable,
-- which is the same posture as an unlisted share link: enough for progress
-- ticks, and deliberately NOT a security boundary for anything that matters.
-- Nothing here is PII. Phone numbers arrive in P4 and belong in their OWN
-- table with their own policy — never in these three.
--
-- WHY THE MERGE LIVES IN THE UPSERT, NOT IN CODE
-- ---------------------------------------------
-- notebook.js `setStage` is first-tick-wins (`if (on && s[k]) return;`), so a
-- stage tick is a DATE that never moves once set. That makes the merge
-- `LEAST(existing, incoming)` — commutative, associative and idempotent, so
-- two devices syncing in either order converge on the same answer and a
-- replayed request changes nothing. There is no last-write-wins race to lose,
-- and no reconciliation code to drift from the client's rule. LEAST() ignores
-- NULLs, so an untouched stage never overwrites a real date.
--
-- The PLAN is the one genuine last-write-wins value (it is a single blob the
-- student can rebuild wholesale), so it carries a client timestamp. Client
-- clocks can skew; that is accepted here because the alternative — server
-- receipt time — lets a stale device clobber a newer plan.

create table if not exists ab_devices (
    device_id    uuid primary key,
    created_at   timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    -- Coarse only: the CATEGORY of device, never a fingerprint or raw UA.
    platform     text,
    -- Salted SHA-256 of the creating IP, exactly like answerbook-vidi-chat's
    -- ledger. Raw IPs are never stored. Used ONLY to cap device minting per
    -- IP per day; never read back for anything about a person.
    ip_hash      text
);

create table if not exists ab_progress (
    device_id   uuid not null references ab_devices(device_id) on delete cascade,
    question_id text not null,
    u_date      date,          -- understood on (first tick wins)
    r_date      date,          -- revised on   (first tick wins)
    updated_at  timestamptz not null default now(),
    primary key (device_id, question_id)
);

create table if not exists ab_plans (
    device_id     uuid primary key references ab_devices(device_id) on delete cascade,
    plan          jsonb not null,
    -- CLIENT clock, not server receipt: a stale device must not clobber a
    -- newer plan just because its request arrived later.
    plan_saved_at timestamptz not null,
    updated_at    timestamptz not null default now()
);

create index if not exists ab_progress_device_idx on ab_progress (device_id);
create index if not exists ab_devices_last_seen_idx on ab_devices (last_seen_at);
create index if not exists ab_devices_ip_day_idx on ab_devices (ip_hash, created_at);

-- RLS on, NO policies: every path in and out goes through the answerbook-sync
-- Edge Function on the service role. A student's anon key can never read
-- another device's rows, because it can never read ANY row. If a policy is
-- ever added here, it must key on device_id and stay deny-by-default.
alter table ab_devices  enable row level security;
alter table ab_progress enable row level security;
alter table ab_plans    enable row level security;

comment on table ab_devices  is 'Answer Book: anonymous browser identity (pm_device_id). No PII. P2 2026-08-23.';
comment on table ab_progress is 'Answer Book: per-question stage ticks. Merge = LEAST() (first tick wins), matching notebook.js setStage.';
comment on table ab_plans    is 'Answer Book: the study plan blob. Last-write-wins by CLIENT plan_saved_at.';

-- ── the whole sync, one atomic call ─────────────────────────────────────────
-- Push and pull in ONE round trip: the client sends everything it has, the
-- server merges, and the merged truth comes back. That makes the call
-- idempotent and order-independent — a retry after a dropped connection is
-- free, and two devices racing converge instead of clobbering.
--
-- Caps are arguments, not literals, so the Edge Function owns policy and this
-- function owns arithmetic. p_max_new_per_ip = 0 disables the mint cap.
create or replace function ab_sync(
    p_device          uuid,
    p_platform        text,
    p_ip_hash         text,
    p_rows            jsonb,          -- [{q,u,r}, ...]
    p_plan            jsonb,          -- null = client has no plan to offer
    p_plan_saved_at   timestamptz,
    p_max_rows        int default 5000,
    p_max_new_per_ip  int default 20
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
        -- Minting a NEW device is the only thing an abuser gains by looping,
        -- so it is the only thing capped here. An existing device syncing is
        -- never rate-limited by IP — students share school and cafe networks,
        -- and locking them out of their own progress would be the worse bug.
        if p_max_new_per_ip > 0 and p_ip_hash is not null then
            select count(*) into v_minted
              from ab_devices
             where ip_hash = p_ip_hash
               and created_at > now() - interval '1 day';
            if v_minted >= p_max_new_per_ip then
                return jsonb_build_object('ok', false, 'error', 'device_quota');
            end if;
        end if;
        insert into ab_devices (device_id, platform, ip_hash)
        values (p_device, p_platform, p_ip_hash)
        on conflict (device_id) do nothing;
    else
        update ab_devices
           set last_seen_at = now(),
               platform = coalesce(p_platform, platform)
         where device_id = p_device;
    end if;

    -- Stage ticks: first tick wins, in both directions at once.
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

    -- Plan: newest CLIENT timestamp wins; a stale push is refused, not merged.
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
        'server_time', now()
    );
end;
$$;

-- The function runs as its owner (security definer) and the Edge Function calls
-- it on the service role. Nothing else may execute it.
revoke all on function ab_sync(uuid, text, text, jsonb, jsonb, timestamptz, int, int) from public, anon, authenticated;
