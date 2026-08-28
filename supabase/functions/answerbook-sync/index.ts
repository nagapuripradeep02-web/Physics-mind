/**
 * answerbook-sync — anonymous progress sync for the IPE Answer Book (P2).
 *
 * Sibling of answerbook-vidi-chat: same origin allowlist, same salted-IP
 * discipline, same fail-closed posture. It is deliberately SIMPLER in one
 * way — there is no model call, so there is no money to burn and therefore no
 * spend ceiling. What it protects instead is storage: a bounded payload and a
 * cap on minting new devices per IP per day.
 *
 * ONE ROUND TRIP, BOTH DIRECTIONS. The client posts everything it has; the
 * database merges (see ab_sync in the migration — stage ticks are
 * first-tick-wins via LEAST(), so the call is idempotent and order-independent)
 * and the merged truth comes back. A retry after a dropped connection is free.
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no Supabase account:
 *   npx supabase functions deploy answerbook-sync --no-verify-jwt --use-api \
 *     --project-ref <ref>
 *
 * It fails CLOSED:
 *   1. No service key            -> every request refused.
 *   2. Origin not in the allowlist -> refused.
 *   3. Body over AB_SYNC_MAX_BYTES -> refused.
 *   4. Device-mint quota per IP per day (AB_SYNC_NEW_PER_IP, default 20).
 * Guard 4 applies ONLY to first sight of a device id. An existing device is
 * never IP-limited: students share school and cafe networks, and locking one
 * out of their own progress is worse than the abuse it would prevent.
 *
 * PRIVACY. The device id is an unguessable random UUID minted in the browser,
 * not an identity — no name, no phone, no account. Raw IPs are never stored,
 * only a salted SHA-256 used to count device minting. Phone numbers arrive in
 * P4 and belong in their own table, never in these three.
 *
 * TEAM DEVICES (2026-08-28). The page may send internal:true (after the
 * founder opened #/notastudent/<word> on that browser) or internal:false (the
 * /off route); anything else is null = "the page said nothing", and the
 * device keeps whatever flag it has. The flag lives on ab_devices and is what
 * keeps the team's own testing out of the usage dashboard.
 *
 *   optional secrets: AB_ALLOWED_ORIGINS, AB_SYNC_MAX_BYTES,
 *                     AB_SYNC_NEW_PER_IP, AB_SYNC_MAX_ROWS, AB_IP_SALT
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const IP_SALT = Deno.env.get('AB_IP_SALT') ?? SERVICE_KEY.slice(0, 24);
const MAX_BYTES = Number(Deno.env.get('AB_SYNC_MAX_BYTES') ?? '262144');   // 256 KB
const MAX_ROWS = Number(Deno.env.get('AB_SYNC_MAX_ROWS') ?? '5000');
const NEW_PER_IP = Number(Deno.env.get('AB_SYNC_NEW_PER_IP') ?? '20');

// Shared with answerbook-vidi-chat on purpose: one list, one thing to update
// when a domain is added. Origin stops the endpoint being embedded on someone
// else's page — a browser cannot forge it. It is NOT the boundary against a
// scripted attacker (curl sends any Origin); the quotas are.
const ALLOWED_ORIGINS = (Deno.env.get('AB_ALLOWED_ORIGINS') ??
    'https://answers.viditra.co,https://viditra.co,https://www.viditra.co,http://localhost:8100,http://127.0.0.1:8100')
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
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Only ever a coarse category — never a fingerprint. */
function platformOf(ua: string): string {
    if (/Android/i.test(ua)) return 'android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Windows/i.test(ua)) return 'windows';
    if (/Macintosh/i.test(ua)) return 'mac';
    if (/Linux/i.test(ua)) return 'linux';
    return 'other';
}

interface StageIn { q?: unknown; u?: unknown; r?: unknown }

/**
 * Client input is never trusted into SQL shape. A malformed date is DROPPED
 * rather than rejecting the whole batch: one bad row must not cost a student
 * the rest of their progress.
 */
function cleanRows(raw: unknown): { q: string; u: string; r: string }[] {
    if (!Array.isArray(raw)) return [];
    const out: { q: string; u: string; r: string }[] = [];
    for (const item of raw.slice(0, MAX_ROWS)) {
        const s = item as StageIn;
        const q = typeof s?.q === 'string' ? s.q.trim() : '';
        if (!q || q.length > 200) continue;
        const u = typeof s?.u === 'string' && DATE_RE.test(s.u) ? s.u : '';
        const r = typeof s?.r === 'string' && DATE_RE.test(s.r) ? s.r : '';
        if (!u && !r) continue;                 // nothing to record
        out.push({ q, u, r });
    }
    return out;
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { ok: false, error: 'method' });

    if (!SERVICE_KEY || !SUPABASE_URL) {
        console.error('[answerbook-sync] no service key — refusing (fail closed)');
        return reply(origin, 503, { ok: false, error: 'unconfigured' });
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return reply(origin, 403, { ok: false, error: 'origin' });
    }

    const raw = await req.text();
    if (raw.length > MAX_BYTES) return reply(origin, 413, { ok: false, error: 'too_large' });

    let body: Record<string, unknown>;
    try {
        body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
        return reply(origin, 400, { ok: false, error: 'bad_json' });
    }

    const deviceId = typeof body.device_id === 'string' ? body.device_id : '';
    if (!UUID_RE.test(deviceId)) return reply(origin, 400, { ok: false, error: 'bad_device' });

    const rows = cleanRows(body.stages);

    // A plan is only offered when it carries a timestamp — without one the
    // server cannot tell new from stale, and silently guessing is how a good
    // plan gets clobbered by an old device.
    const planSaved = typeof body.plan_saved_at === 'string' && !Number.isNaN(Date.parse(body.plan_saved_at))
        ? new Date(body.plan_saved_at).toISOString() : null;
    const plan = planSaved && body.plan && typeof body.plan === 'object' ? body.plan : null;

    // Strictly a boolean or nothing — a string "false" must not read as a claim.
    const internal = typeof body.internal === 'boolean' ? body.internal : null;

    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
    const ipHash = rawIp ? await sha256Hex(IP_SALT + '|' + rawIp) : null;

    try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/ab_sync', {
            method: 'POST',
            headers: {
                apikey: SERVICE_KEY,
                Authorization: 'Bearer ' + SERVICE_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                p_device: deviceId,
                p_platform: platformOf(req.headers.get('user-agent') ?? ''),
                p_ip_hash: ipHash,
                p_rows: rows,
                p_plan: plan,
                p_plan_saved_at: planSaved,
                p_max_rows: MAX_ROWS,
                p_max_new_per_ip: NEW_PER_IP,
                p_internal: internal,
            }),
        });
        if (!res.ok) {
            console.error('[answerbook-sync] rpc failed', res.status, (await res.text()).slice(0, 300));
            return reply(origin, 502, { ok: false, error: 'store' });
        }
        const out = await res.json();
        if (out && out.ok === false) {
            // A quota refusal is not an error the student should see as broken:
            // the book works offline regardless, so the client keeps its data.
            return reply(origin, out.error === 'device_quota' ? 429 : 400, out);
        }
        return reply(origin, 200, out);
    } catch (e) {
        console.error('[answerbook-sync] unreachable', (e as Error).message);
        return reply(origin, 502, { ok: false, error: 'store' });
    }
});
