-- Answer Book: Google accounts, so a pass follows the STUDENT, not the phone.
-- (founder, 2026-08-27)
--
-- The problem this fixes: identity was an anonymous device UUID, so a student
-- who paid ₹99 on their phone and opened the book on a laptop was a stranger to
-- the server and saw the paywall again. That is the first complaint a paying
-- student would have made.
--
-- THE DESIGN — an account LINKS devices, it does not replace them.
--
-- ab_entitlements stays keyed by device_id exactly as it is. Nothing migrates,
-- no existing row moves, and the anonymous journey still works untouched: open
-- a WhatsApp link, read the free chapters, never sign in. Signing in only adds
-- a row here saying "this device belongs to this account", and entitlement
-- resolution then unions across every device the account has linked.
--
--   phone pays        → ab_entitlements(phone, 'all', paid)
--   phone signs in    → ab_account_devices(user, phone)
--   laptop signs in   → ab_account_devices(user, laptop)
--   laptop asks       → union over {phone, laptop} → sees the pass
--
-- Order does not matter: pay-then-sign-in and sign-in-then-pay both land the
-- same way, because the union is computed at read time, never copied.

create table if not exists ab_account_devices (
    user_id    uuid        not null references auth.users (id) on delete cascade,
    device_id  uuid        not null,
    linked_at  timestamptz not null default now(),
    primary key (user_id, device_id)
);

create index if not exists ab_account_devices_device_idx on ab_account_devices (device_id);

alter table ab_account_devices enable row level security;

comment on table ab_account_devices is
    'Answer Book: which devices belong to which signed-in student. Entitlements stay device-keyed; this is what lets a pass follow the student across phones. 2026-08-27.';

-- ── link a device to an account, and report what that account can read ───────
-- Called by answerbook-content AFTER it has verified the access token, so the
-- user id is trusted by the time it arrives. Service-role only, like every other
-- function here.
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

    -- The device may not exist yet (a student who signs in before reading
    -- anything). Mint it so the link never dangles.
    insert into ab_devices (device_id)
    values (p_device)
    on conflict (device_id) do nothing;

    insert into ab_account_devices (user_id, device_id)
    values (p_user, p_device)
    on conflict (user_id, device_id) do nothing;

    select array_agg(device_id) into v_devices
      from ab_account_devices where user_id = p_user;

    return jsonb_build_object('ok', true, 'devices', to_jsonb(v_devices));
end $$;

revoke all on function ab_link_device(uuid, uuid) from public, anon, authenticated;

comment on function ab_link_device is
    'Answer Book: link a verified account to a device and return every device it owns. Service-role only. 2026-08-27.';
