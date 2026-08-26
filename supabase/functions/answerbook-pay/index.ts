/**
 * answerbook-pay — turn a tap into a Razorpay payment link (P4, 2026-08-24).
 *
 * The student taps [Unlock every chapter — ₹99/month]. This function asks
 * Razorpay for a payment link for THIS device at THIS device's price, carrying
 * `notes.device_id` so the webhook can grant access to the phone that paid.
 * No login, no OTP, nothing to type — the whole identity is the anonymous P2
 * device id (see the P2/P3 migrations).
 *
 * THE PRICE IS NEVER TAKEN FROM THE CLIENT. It comes from ab_price_for() on
 * the server: founding ₹99 while slots remain or if this device already holds
 * a founding payment (grandfathered forever), list ₹249 otherwise. A client
 * that posts its own amount is ignored — that is the whole point.
 *
 * Fourth sibling of the family (vidi-chat, sync, content): same origin
 * allowlist, same fail-closed posture.
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no account:
 *   npx supabase functions deploy answerbook-pay --no-verify-jwt --use-api \
 *     --project-ref <ref>
 *
 * REQUIRED SECRETS (founder, from the Razorpay dashboard → Settings → API Keys):
 *   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx RAZORPAY_KEY_SECRET=xxx
 *   optional: AB_ALLOWED_ORIGINS, AB_PAY_RETURN_URL (default answers.viditra.co)
 * Without the keys every request is refused — it never invents a price or a link.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RZP_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
const RETURN_URL = Deno.env.get('AB_PAY_RETURN_URL') ?? 'https://answers.viditra.co/';

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
    const origin = req.headers.get('origin') ?? '';
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (req.method !== 'POST') return reply(origin, 405, { ok: false, error: 'method' });

    if (!SERVICE_KEY || !SUPABASE_URL) return reply(origin, 503, { ok: false, error: 'unconfigured' });
    if (!ALLOWED_ORIGINS.includes(origin)) return reply(origin, 403, { ok: false, error: 'origin' });

    let body: Record<string, unknown>;
    try { body = JSON.parse(await req.text()) as Record<string, unknown>; }
    catch { return reply(origin, 400, { ok: false, error: 'bad_json' }); }

    const deviceId = typeof body.device_id === 'string' ? body.device_id : '';
    if (!UUID_RE.test(deviceId)) return reply(origin, 400, { ok: false, error: 'bad_device' });

    // The server's price, never the client's.
    const priceRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/ab_price_for', {
        method: 'POST',
        headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_device: deviceId }),
    });
    if (!priceRes.ok) {
        console.error('[answerbook-pay] price lookup failed', priceRes.status);
        return reply(origin, 502, { ok: false, error: 'price' });
    }
    const price = await priceRes.json() as {
        price_inr: number; label: string; founding: boolean; period_days: number;
    } | null;
    if (!price || !price.price_inr) return reply(origin, 503, { ok: false, error: 'not_priced' });

    // No keys = no link. It must never pretend a payment path exists.
    if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
        console.warn('[answerbook-pay] no Razorpay keys — refusing (fail closed)');
        return reply(origin, 503, { ok: false, error: 'payments_unconfigured', price });
    }

    const auth = 'Basic ' + btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`);
    const description = price.founding
        ? `${price.label} — founding price, ${price.period_days} days`
        : `${price.label} — ${price.period_days} days`;

    try {
        const rzp = await fetch('https://api.razorpay.com/v1/payment_links', {
            method: 'POST',
            headers: { Authorization: auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: price.price_inr * 100,          // paise
                currency: 'INR',
                description,
                // The device id rides the payment and comes back on the webhook.
                // This is the ENTIRE identity link between money and access.
                notes: { device_id: deviceId, sku: 'full_book', founding: String(price.founding) },
                callback_url: RETURN_URL,
                callback_method: 'get',
                reminder_enable: false,
                // A link is for one tap; it must not stay payable for days.
                expire_by: Math.floor(Date.now() / 1000) + 30 * 60,
            }),
        });
        const out = await rzp.json();
        if (!rzp.ok || !out?.short_url) {
            console.error('[answerbook-pay] razorpay refused', rzp.status, JSON.stringify(out).slice(0, 300));
            return reply(origin, 502, { ok: false, error: 'gateway' });
        }
        console.log(`[answerbook-pay] link ${out.id} ₹${price.price_inr} founding=${price.founding}`);
        return reply(origin, 200, { ok: true, url: out.short_url, price });
    } catch (e) {
        console.error('[answerbook-pay] unreachable', (e as Error).message);
        return reply(origin, 502, { ok: false, error: 'gateway' });
    }
});
