-- Answer Book — the content gate (P3, 2026-08-23)
--
-- The gated page ships the catalog; answer bodies live in ab_content and are
-- released per device by ab_entitlements. Every device gets ONE free chapter,
-- claimed by an explicit tap (founder decision — a stray tap must never burn
-- the slot, so the claim always carries claim_free:true from a button).
--
-- Same posture as the P2 sync tables: RLS on, ZERO policies — every path goes
-- through the answerbook-content Edge Function on the service role, and the
-- claim RPC has execute revoked from every client role. No PII anywhere;
-- device_id is the anonymous P2 identity.

create table if not exists ab_content (
    unit_key   text primary key,          -- 'physics-4', 'mathematics-3', ...
    name       text not null,
    bundle     jsonb not null,            -- {unit_key, name, questions:[full projected questions]}
    question_n int not null,
    updated_at timestamptz not null default now()
);

create table if not exists ab_skus (
    sku       text primary key,
    label     text not null,
    -- NULL until the founder prices it (P4). The client shows "coming soon"
    -- for a null price — never a number the founder has not set.
    price_inr int,
    active    boolean not null default true
);

insert into ab_skus (sku, label, price_inr, active)
values ('full_book', 'Every chapter, both subjects', null, true)
on conflict (sku) do nothing;

create table if not exists ab_entitlements (
    id         bigint generated always as identity primary key,
    device_id  uuid not null references ab_devices(device_id) on delete cascade,
    unit_key   text not null,             -- a unit key, or 'all'
    source     text not null check (source in ('free_chapter', 'paid', 'grant')),
    created_at timestamptz not null default now()
);

-- THE free-slot atomicity: at most one free_chapter row per device, enforced
-- by the index itself — two racing claims cannot both win.
create unique index if not exists ab_entitlements_one_free
    on ab_entitlements (device_id) where source = 'free_chapter';
-- Grants/purchases stay idempotent.
create unique index if not exists ab_entitlements_dedup
    on ab_entitlements (device_id, unit_key, source);
create index if not exists ab_entitlements_device_idx on ab_entitlements (device_id);

alter table ab_content      enable row level security;
alter table ab_skus         enable row level security;
alter table ab_entitlements enable row level security;

comment on table ab_content      is 'Answer Book gate: per-unit answer bundles (full build projection). Pushed by content:push. P3 2026-08-23.';
comment on table ab_skus         is 'Answer Book gate: purchasable SKUs. price_inr NULL = not yet priced (P4).';
comment on table ab_entitlements is 'Answer Book gate: which device may read which unit. One free_chapter per device (partial unique index).';

-- ── the free-chapter claim, atomic ───────────────────────────────────────────
-- Mints the device if unseen (same 20/day/IP posture as ab_sync — minting is
-- the only thing worth capping) and takes the one free slot. The partial
-- unique index is the real guard; the insert's exception handler turns a lost
-- race into the same honest answer a late tap gets: free_used.
create or replace function ab_claim_free(
    p_device         uuid,
    p_unit_key       text,
    p_ip_hash        text,
    p_max_new_per_ip int default 20
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_exists boolean;
    v_minted int;
begin
    if p_device is null or coalesce(p_unit_key, '') = '' then
        return jsonb_build_object('ok', false, 'error', 'bad_request');
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
        insert into ab_devices (device_id, platform, ip_hash)
        values (p_device, null, p_ip_hash)
        on conflict (device_id) do nothing;
    end if;

    begin
        insert into ab_entitlements (device_id, unit_key, source)
        values (p_device, p_unit_key, 'free_chapter');
    exception when unique_violation then
        -- Either the free slot is spent, or the same claim replayed. A replay
        -- of the SAME unit is success (idempotent); a different unit is refused.
        if exists (select 1 from ab_entitlements
                    where device_id = p_device and source = 'free_chapter'
                      and unit_key = p_unit_key) then
            return jsonb_build_object('ok', true, 'replay', true);
        end if;
        return jsonb_build_object('ok', false, 'error', 'free_used');
    end;

    return jsonb_build_object('ok', true);
end;
$$;

revoke all on function ab_claim_free(uuid, text, text, int) from public, anon, authenticated;
