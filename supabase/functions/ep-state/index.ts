/**
 * ep-state — the EAPCET finder's one state endpoint: sync, standing, bundle.
 *
 * A copy of answerbook-sync's transport and answerbook-content's entitlement
 * resolution, joined into one function because the finder has one client
 * module (20_sync.js) talking to it. Same origin allowlist, same salted-IP
 * discipline, same fail-closed posture. No model call, so no spend ceiling;
 * what it protects is storage (a bounded body, a mint cap per IP per day) and
 * the solutions (never a solution byte to a device that has not paid).
 *
 *   {action:'sync', device_id, chapters, internal?, access_token?}
 *       → ep_sync: push the page's ep_state_v1.chapters, get the merged truth
 *         back, plus this device's standing (so one round trip on open).
 *   {action:'standing', device_id, access_token?}
 *       → entitlements (unioned across the account's devices once signed in)
 *         + the server's price for this device.
 *   {action:'bundle', device_id, chapter_key, access_token?}
 *       → every verified solution of ONE chapter, entitled devices only.
 *         A locked reply is {ok:true, locked:true, sku} and nothing else.
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no Supabase account:
 *   npx supabase functions deploy ep-state --no-verify-jwt --use-api --project-ref <ref>
 *
 * It fails CLOSED:
 *   1. No service key               -> every request refused.
 *   2. Origin not in the allowlist  -> refused. EP_ALLOWED_ORIGINS must name
 *      the finder's domain once it exists; the default is localhost only.
 *   3. Body over EP_SYNC_MAX_BYTES  -> refused.
 *   4. Device-mint quota per IP per day (EP_SYNC_NEW_PER_IP, default 20) —
 *      first sight of a device id only; an existing device is never IP-limited.
 *   5. An entitlement read that fails -> the bundle is refused, never guessed.
 *
 *   optional secrets: EP_ALLOWED_ORIGINS, EP_SYNC_MAX_BYTES, EP_SYNC_NEW_PER_IP,
 *                     EP_IP_SALT
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const IP_SALT = Deno.env.get('EP_IP_SALT') ?? SERVICE_KEY.slice(0, 24);
const MAX_BYTES = Number(Deno.env.get('EP_SYNC_MAX_BYTES') ?? '524288');   // 512 KB: records ride along
const NEW_PER_IP = Number(Deno.env.get('EP_SYNC_NEW_PER_IP') ?? '20');

// Its own list, separate from AB_ALLOWED_ORIGINS on purpose: the finder is a
// separate site, and widening one product's allowlist must never widen the
// other's. The finder's domain is added here by the founder when it exists.
const ALLOWED_ORIGINS = (Deno.env.get('EP_ALLOWED_ORIGINS') ??
    'http://localhost:8120,http://127.0.0.1:8120')
    .split(',').map((s) => s.trim()).filter(Boolean);

// Kept LITERAL so that widening the allowlist can never reclassify a real
// domain as "local".
const LOCAL_ORIGINS = new Set(['http://localhost:8120', 'http://127.0.0.1:8120']);

const BOT_RE = /bot\b|crawler|spider|crawling|HeadlessChrome|Headless|Lighthouse|PhantomJS|Puppeteer|Playwright|curl\/|wget|python-requests|axios\/|node-fetch|Go-http-client|facebookexternalhit|WhatsApp|Slackbot|Twitterbot|bingpreview|AhrefsBot|SemrushBot|PetalBot|YandexBot|Googlebot/i;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHAPTER_RE = /^p[12]-\d{2}$/;

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

/** Only ever a coarse category — never a fingerprint. */
function platformOf(ua: string): string {
    if (/Android/i.test(ua)) return 'android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Windows/i.test(ua)) return 'windows';
    if (/Macintosh/i.test(ua)) return 'mac';
    if (/Linux/i.test(ua)) return 'linux';
    return 'other';
}

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

/** The standing of one device — or of EVERY device the account owns, once a
    student has signed in. Entitlements stay device-keyed; the account unions
    them, so a pass bought on a phone opens the finder on a laptop. */
async function entitlementsOf(deviceIds: string[]): Promise<EntRow[] | null> {
    if (!deviceIds.length) return [];
    const list = deviceIds.map((d) => `"${d}"`).join(',');
    const res = await rest(`ep_entitlements?select=unit_key,source,expires_at&device_id=in.(${list})`);
    if (!res.ok) return null;
    return await res.json() as EntRow[];
}

/** Who is signed in, if anyone. Verified by asking Supabase Auth itself; a bad
    or expired token is "not signed in", never an error. */
async function userOf(accessToken: string): Promise<string | null> {
    if (!accessToken || accessToken.length > 4096) return null;
    try {
        const res = await fetch(SUPABASE_URL + '/auth/v1/user', {
            headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + accessToken },
        });
        if (!res.ok) return null;
        const u = await res.json() as { id?: string };
        return typeof u.id === 'string' && UUID_RE.test(u.id) ? u.id : null;
    } catch { return null; }
}

/** Link this device to the account (the shared ab_link_device — one account
    spans both products) and return every device the account owns. */
async function devicesOfUser(userId: string, deviceId: string): Promise<string[]> {
    const res = await rest('rpc/ab_link_device', {
        method: 'POST',
        body: JSON.stringify({ p_user: userId, p_device: deviceId }),
    });
    if (!res.ok) return [deviceId];
    const out = await res.json() as { ok?: boolean; devices?: string[] };
    return out.ok && Array.isArray(out.devices) && out.devices.length ? out.devices : [deviceId];
}

function live(r: EntRow): boolean {
    return !r.expires_at || Date.parse(r.expires_at) > Date.now();
}

async function priceFor(deviceId: string): Promise<Record<string, unknown> | null> {
    const res = await rest('rpc/ep_price_for', {
        method: 'POST',
        body: JSON.stringify({ p_device: deviceId }),
    });
    if (!res.ok) return null;
    return await res.json() as Record<string, unknown> | null;
}

interface Standing {
    unlocked: boolean;
    paid_until: string | null;
    signed_in: boolean;
    devices: number;
    sku: Record<string, unknown> | null;
}

/** Everything the page needs to paint the lock wall or open the fix screen.
    Null means an entitlement read FAILED — the caller fails closed. */
async function standingOf(deviceId: string, accessToken: string): Promise<Standing | null> {
    const userId = accessToken ? await userOf(accessToken) : null;
    const deviceIds = userId ? await devicesOfUser(userId, deviceId) : [deviceId];
    const rows = await entitlementsOf(deviceIds);
    if (rows === null) return null;
    const liveRows = rows.filter(live).filter((r) => r.unit_key === 'all');
    const paidRow = liveRows.find((r) => r.source === 'paid');
    return {
        unlocked: liveRows.length > 0,
        paid_until: paidRow?.expires_at ?? null,
        signed_in: !!userId,
        devices: userId ? deviceIds.length : 1,
        sku: await priceFor(deviceId),
    };
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { ok: false, error: 'method' });

    if (!SERVICE_KEY || !SUPABASE_URL) {
        console.error('[ep-state] no service key — refusing (fail closed)');
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
    const action = typeof body.action === 'string' ? body.action : 'sync';
    const token = typeof body.access_token === 'string' ? body.access_token : '';

    // ── standing ──
    if (action === 'standing') {
        const standing = await standingOf(deviceId, token);
        if (!standing) {
            console.error('[ep-state] entitlement read failed — refusing (fail closed)');
            return reply(origin, 502, { ok: false, error: 'store' });
        }
        return reply(origin, 200, { ok: true, ...standing });
    }

    // ── bundle: one chapter's verified solutions, entitled devices only ──
    if (action === 'bundle') {
        const chapterKey = typeof body.chapter_key === 'string' ? body.chapter_key : '';
        if (!CHAPTER_RE.test(chapterKey)) return reply(origin, 400, { ok: false, error: 'bad_chapter' });
        const standing = await standingOf(deviceId, token);
        if (!standing) {
            console.error('[ep-state] entitlement read failed — refusing (fail closed)');
            return reply(origin, 502, { ok: false, error: 'store' });
        }
        if (!standing.unlocked) {
            // Locked. Never a solution byte in this branch.
            return reply(origin, 200, { ok: true, locked: true, sku: standing.sku });
        }
        const res = await rest(`ep_solutions?select=qid,solution,grounding&verified=is.true&chapter_key=eq.${chapterKey}`);
        if (!res.ok) {
            console.error('[ep-state] solutions read failed', res.status);
            return reply(origin, 502, { ok: false, error: 'store' });
        }
        const rows = await res.json() as { qid: string; solution: unknown; grounding: unknown }[];
        const solutions: Record<string, unknown> = {};
        for (const r of rows) solutions[r.qid] = { solution: r.solution, grounding: r.grounding ?? [] };
        return reply(origin, 200, { ok: true, unlocked: true, chapter_key: chapterKey, solutions, paid_until: standing.paid_until });
    }

    if (action !== 'sync') return reply(origin, 400, { ok: false, error: 'bad_action' });

    // ── sync ──
    const chapters = body.chapters && typeof body.chapters === 'object' && !Array.isArray(body.chapters)
        ? body.chapters : {};

    const rawIp = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
    const ipHash = rawIp ? await sha256Hex(IP_SALT + '|' + rawIp) : null;

    // TEAM DEVICES: the page's own claim (internal:true after #/notastudent/<word>,
    // internal:false from /off), else null = "the page said nothing" and the
    // device keeps the flag it has. With no claim, a bot user-agent or a local
    // origin is enough on its own.
    const ua = req.headers.get('user-agent') ?? '';
    const internal = typeof body.internal === 'boolean' ? body.internal
        : (BOT_RE.test(ua) || LOCAL_ORIGINS.has(origin)) ? true : null;

    try {
        const res = await rest('rpc/ep_sync', {
            method: 'POST',
            body: JSON.stringify({
                p_device: deviceId,
                p_platform: platformOf(ua),
                p_ip_hash: ipHash,
                p_chapters: chapters,
                p_max_new_per_ip: NEW_PER_IP,
                p_internal: internal,
            }),
        });
        if (!res.ok) {
            console.error('[ep-state] rpc failed', res.status, (await res.text()).slice(0, 300));
            return reply(origin, 502, { ok: false, error: 'store' });
        }
        const out = await res.json() as Record<string, unknown>;
        if (out && out.ok === false) {
            // A quota refusal is not "broken": the finder works offline regardless.
            return reply(origin, out.error === 'device_quota' ? 429 : 400, out);
        }
        // Standing rides the sync reply so the page paints the right screen on
        // open without a second round trip. A failed read here is reported as
        // absent, not as locked — the page keeps the standing it last saw.
        const standing = await standingOf(deviceId, token);
        return reply(origin, 200, { ...out, standing });
    } catch (e) {
        console.error('[ep-state] unreachable', (e as Error).message);
        return reply(origin, 502, { ok: false, error: 'store' });
    }
});
