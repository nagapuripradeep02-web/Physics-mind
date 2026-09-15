/**
 * ig-stats — the numbers behind viditra.co/admin/instagram (2026-09-15).
 *
 * A copy of answerbook-stats with one job: it is the only door to ig_stats,
 * and the dashboard token travels in the body, never in a URL. The page
 * ships no Supabase key at all (the same rule the answer book dashboard
 * keeps — this project still has tables with RLS off, so its anon key must
 * never sit on a public page).
 *
 * Actions (POST, JSON):
 *   { token, since? }   -> ig_stats(p_token, p_since) — the register, the
 *                          per-post ratios, the leagues, the account curve
 *
 * DEPLOY WITH JWT VERIFICATION OFF — the founder has no session on viditra.co.
 * From Claude Code: the Supabase MCP `deploy_edge_function` with
 * verify_jwt=false (the local CLI is logged into the wrong org). Deploy order
 * and liveness checks: docs/notes/INSTAGRAM_INSIGHTS_RUNBOOK.md §4–5.
 *
 * It fails CLOSED:
 *   1. No service key              -> refused.
 *   2. Origin not in the allowlist -> refused.
 *   3. Wrong token                 -> 401, and a small delay so guessing is slow.
 * The token itself is checked INSIDE ig_stats against ig_admin_config
 * (RLS on, zero policies — unreadable by anon), never compared here.
 *
 *   optional secrets: AB_ALLOWED_ORIGINS (REPLACES the default list — keep
 *   https://viditra.co,https://www.viditra.co in it or the dashboard 403s)
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// The same list the other answerbook-* functions carry. localhost:8100 lets
// the founder open website/admin/ locally against the live function.
const ALLOWED_ORIGINS = (Deno.env.get('AB_ALLOWED_ORIGINS') ??
    'https://answers.viditra.co,https://viditra.co,https://www.viditra.co,http://localhost:8100,http://127.0.0.1:8100,http://localhost:8101,http://127.0.0.1:8101')
    .split(',').map((s) => s.trim()).filter(Boolean);

const TOKEN_RE = /^[a-zA-Z0-9_-]{16,128}$/;
// The day counting began; anything unparseable falls back here rather than erroring.
const DEFAULT_SINCE = '2026-09-15T00:00:00Z';

function corsHeaders(origin: string): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store',
        'Vary': 'Origin',
    };
}

function reply(origin: string, status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

async function rpc(name: string, args: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                apikey: SERVICE_KEY,
                Authorization: 'Bearer ' + SERVICE_KEY,
            },
            body: JSON.stringify(args),
        });
        if (!res.ok) {
            console.error('[ig-stats] rpc', name, res.status, (await res.text()).slice(0, 300));
            return null;
        }
        return await res.json() as Record<string, unknown>;
    } catch (e) {
        console.error('[ig-stats] rpc unreachable', name, (e as Error).message);
        return null;
    }
}

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { ok: false, error: 'method' });

    if (!SERVICE_KEY || !SUPABASE_URL) {
        console.error('[ig-stats] no service key — refusing (fail closed)');
        return reply(origin, 503, { ok: false, error: 'unconfigured' });
    }
    if (!ALLOWED_ORIGINS.includes(origin)) {
        return reply(origin, 403, { ok: false, error: 'origin' });
    }

    let body: Record<string, unknown>;
    try {
        body = await req.json() as Record<string, unknown>;
    } catch {
        return reply(origin, 400, { ok: false, error: 'bad_json' });
    }

    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!TOKEN_RE.test(token)) return reply(origin, 401, { ok: false, error: 'unauthorized' });

    const sinceRaw = typeof body.since === 'string' ? Date.parse(body.since) : NaN;
    const since = Number.isNaN(sinceRaw) ? DEFAULT_SINCE : new Date(sinceRaw).toISOString();
    const out = await rpc('ig_stats', { p_token: token, p_since: since });

    if (!out) return reply(origin, 502, { ok: false, error: 'store' });
    if (out.ok === false) {
        if (out.error === 'unauthorized') {
            // Slow a guess down; the token is 32 hex chars, so this is belt and braces.
            await new Promise((r) => setTimeout(r, 800));
            return reply(origin, 401, { ok: false, error: 'unauthorized' });
        }
        return reply(origin, 400, out);
    }
    return reply(origin, 200, out);
});
