/**
 * answerbook-content — the chapter gate behind the GATED Answer Book (P3).
 *
 * Third sibling in the family (answerbook-vidi-chat, answerbook-sync): same
 * origin allowlist, same salted-IP discipline, same fail-closed posture, no
 * spend ceiling (no model call). What it guards is the PRODUCT: answer bodies
 * live in ab_content and leave only for a device that ab_entitlements says may
 * read them. The gated page carries the full catalog (question text, stars,
 * marks — the sell) and asks here the moment a student opens a question.
 *
 * FOUR chapters are free for everyone (founder, 2026-08-27) — one per subject,
 * marked `free` in ab_content, read live so the set changes with one UPDATE and
 * no redeploy. They are not entitlements: no device row, nothing to spend.
 *
 * The older model — ONE free chapter per device, claimed by an explicit tap —
 * is DORMANT. claim_free / ab_claim_free and its partial unique index are left
 * in place and unused, so the per-device slot can return without a rebuild;
 * free_available is reported false so no client offers the claim.
 *
 * Requests (POST, JSON):
 *   {device_id, list:true}                      → {ok, unlocked:[unit_keys], free_available, sku}
 *   {device_id, unit_key}                       → entitled: {ok, unlocked:true, bundle}
 *                                                  locked:  {ok, locked:true, free_available, sku}
 *   {device_id, unit_key, claim_free:true}      → grants the free chapter, then the bundle
 *
 * A locked reply NEVER carries an answer byte.
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no account:
 *   npx supabase functions deploy answerbook-content --no-verify-jwt --use-api \
 *     --project-ref <ref>
 *
 *   optional secrets: AB_ALLOWED_ORIGINS, AB_IP_SALT, AB_SYNC_NEW_PER_IP
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const IP_SALT = Deno.env.get('AB_IP_SALT') ?? SERVICE_KEY.slice(0, 24);
// Shared with answerbook-sync on purpose: minting a device is minting a device,
// whichever door it walks in through.
const NEW_PER_IP = Number(Deno.env.get('AB_SYNC_NEW_PER_IP') ?? '20');

const ALLOWED_ORIGINS = (Deno.env.get('AB_ALLOWED_ORIGINS') ??
    'https://answers.viditra.co,https://viditra.co,https://www.viditra.co,http://localhost:8100,http://127.0.0.1:8100,http://localhost:8101,http://127.0.0.1:8101')
    .split(',').map((s) => s.trim()).filter(Boolean);

function corsHeaders(origin: string): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Vary': 'Origin',
    };
}

function reply(origin: string, status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

async function sha256Hex(s: string): Promise<string> {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNIT_RE = /^[a-z0-9_]+-\d+$/;

async function rest(path: string, init?: RequestInit): Promise<Response> {
    return await fetch(SUPABASE_URL + '/rest/v1/' + path, {
        ...init,
        headers: {
            apikey: SERVICE_KEY,
            Authorization: 'Bearer ' + SERVICE_KEY,
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });
}

interface EntRow { unit_key: string; source: string; expires_at: string | null }

/** The device's standing: which units it may read, and whether the free slot is spent. */
async function entitlementsOf(deviceId: string): Promise<{ rows: EntRow[] } | null> {
    const res = await rest(`ab_entitlements?select=unit_key,source,expires_at&device_id=eq.${deviceId}`);
    if (!res.ok) return null;
    return { rows: await res.json() as EntRow[] };
}

/** A row unlocks only while it is LIVE. expires_at null = permanent (the free
    chapter is a gift, not a rental); a paid pass stops opening the book the
    moment it lapses — which is what makes a renewal mean anything. */
function live(r: EntRow): boolean {
    return !r.expires_at || Date.parse(r.expires_at) > Date.now();
}

/** THIS device's price: founding ₹99 while slots remain or if it already holds a
    founding payment (grandfathered forever), list price otherwise. Computed by
    ab_price_for on the server — the client never names a price. */
async function priceFor(deviceId: string): Promise<Record<string, unknown> | null> {
    const res = await rest('rpc/ab_price_for', {
        method: 'POST',
        body: JSON.stringify({ p_device: deviceId }),
    });
    if (!res.ok) return null;
    return await res.json() as Record<string, unknown> | null;
}

async function bundleOf(unitKey: string): Promise<unknown | null> {
    const res = await rest(`ab_content?select=bundle&unit_key=eq.${unitKey}`);
    if (!res.ok) return null;
    const rows = await res.json() as { bundle: unknown }[];
    return rows[0]?.bundle ?? null;
}

/** The chapters that are free for EVERYONE (founder, 2026-08-27) — one per
    subject, marked `free` in ab_content. Not an entitlement: no device row, no
    claim, nothing to spend. Read live so the four can be changed with one UPDATE
    and no redeploy. Null means the read FAILED — the caller must fail closed
    rather than treat it as "nothing is free". */
async function freeUnits(): Promise<Set<string> | null> {
    const res = await rest('ab_content?select=unit_key&free=is.true');
    if (!res.ok) return null;
    const rows = await res.json() as { unit_key: string }[];
    return new Set(rows.map((r) => r.unit_key));
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { ok: false, error: 'method' });

    if (!SERVICE_KEY || !SUPABASE_URL) {
        console.error('[answerbook-content] no service key — refusing (fail closed)');
        return reply(origin, 503, { ok: false, error: 'unconfigured' });
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return reply(origin, 403, { ok: false, error: 'origin' });
    }

    let body: Record<string, unknown>;
    try {
        body = JSON.parse(await req.text()) as Record<string, unknown>;
    } catch {
        return reply(origin, 400, { ok: false, error: 'bad_json' });
    }

    const deviceId = typeof body.device_id === 'string' ? body.device_id : '';
    if (!UUID_RE.test(deviceId)) return reply(origin, 400, { ok: false, error: 'bad_device' });

    const ents = await entitlementsOf(deviceId);
    if (ents === null) {
        console.error('[answerbook-content] entitlement read failed — refusing (fail closed)');
        return reply(origin, 502, { ok: false, error: 'store' });
    }
    const free = await freeUnits();
    if (free === null) {
        console.error('[answerbook-content] free-chapter read failed — refusing (fail closed)');
        return reply(origin, 502, { ok: false, error: 'store' });
    }

    const liveRows = ents.rows.filter(live);
    const unlocked = new Set(liveRows.map((r) => r.unit_key));
    // The four free chapters are open to every device, always — they need no
    // entitlement row, so they simply join the unlocked set before anything
    // else looks at it.
    for (const k of free) unlocked.add(k);
    const hasAll = unlocked.has('all');
    // The per-device free chapter (claim_free / ab_claim_free) is DORMANT since
    // 2026-08-27: the free content is now four FIXED chapters open to everyone,
    // so there is no slot to spend. Reported as unavailable so the client never
    // offers the claim button; the RPC and its partial unique index stay in
    // place, unused, in case the per-device slot ever comes back.
    const freeSpent = true;
    const paidRow = liveRows.find((r) => r.source === 'paid');

    if (body.list === true) {
        return reply(origin, 200, {
            ok: true,
            unlocked: hasAll ? ['all'] : Array.from(unlocked),
            free_available: !freeSpent,
            paid_until: paidRow?.expires_at ?? null,
            sku: await priceFor(deviceId),
        });
    }

    const unitKey = typeof body.unit_key === 'string' ? body.unit_key : '';
    if (!UNIT_RE.test(unitKey)) return reply(origin, 400, { ok: false, error: 'bad_unit' });

    let entitled = hasAll || unlocked.has(unitKey);

    if (!entitled && body.claim_free === true) {
        // The tap on [Read this chapter free]. The RPC is atomic — a race, a
        // replay and a spent slot all come back as honest answers.
        const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
        const ipHash = rawIp ? await sha256Hex(IP_SALT + '|' + rawIp) : null;
        const res = await rest('rpc/ab_claim_free', {
            method: 'POST',
            body: JSON.stringify({
                p_device: deviceId, p_unit_key: unitKey,
                p_ip_hash: ipHash, p_max_new_per_ip: NEW_PER_IP,
            }),
        });
        if (!res.ok) {
            console.error('[answerbook-content] claim rpc failed', res.status);
            return reply(origin, 502, { ok: false, error: 'store' });
        }
        const out = await res.json() as { ok: boolean; error?: string };
        if (out.ok) entitled = true;
        else if (out.error === 'free_used') {
            return reply(origin, 200, { ok: true, locked: true, free_available: false, sku: await priceFor(deviceId) });
        } else {
            return reply(origin, out.error === 'device_quota' ? 429 : 400, { ok: false, error: out.error ?? 'claim' });
        }
    }

    if (!entitled) {
        // Locked. Never an answer byte in this branch.
        return reply(origin, 200, { ok: true, locked: true, free_available: !freeSpent, sku: await priceFor(deviceId) });
    }

    const bundle = await bundleOf(unitKey);
    if (bundle === null) {
        console.error('[answerbook-content] no bundle for', unitKey, '— content:push missing?');
        return reply(origin, 404, { ok: false, error: 'no_content' });
    }
    return reply(origin, 200, { ok: true, unlocked: true, bundle });
});
