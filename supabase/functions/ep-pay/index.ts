/**
 * ep-pay — turn a tap on [Unlock the worked solutions — ₹399/month] into a
 * Razorpay payment link for THIS device at THIS device's price.
 *
 * A copy of answerbook-pay pointed at the EAPCET price book: ep_price_for on
 * the server names the price (list ₹399 unless the founder sets a founding
 * price on the eapcet_physics_month sku), the link carries notes.device_id and
 * notes.sku so ep-razorpay-webhook grants the phone that paid. The client never
 * names an amount.
 *
 * DEPLOY WITH JWT VERIFICATION OFF — students have no account:
 *   npx supabase functions deploy ep-pay --no-verify-jwt --use-api --project-ref <ref>
 *
 * REQUIRED SECRETS: the same RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET the Answer
 * Book uses (one Razorpay account, two products).
 *   optional: EP_ALLOWED_ORIGINS, EP_PAY_RETURN_URL (the finder's own URL —
 *             set it with the domain; the default is the local dev server).
 * Without the keys every request is refused — it never invents a price or a link.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RZP_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
const RETURN_URL = Deno.env.get('EP_PAY_RETURN_URL') ?? 'http://localhost:8120/';
const SKU = 'eapcet_physics_month';

const ALLOWED_ORIGINS = (Deno.env.get('EP_ALLOWED_ORIGINS') ??
    'http://localhost:8120,http://127.0.0.1:8120')
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
    const priceRes = await fetch(SUPABASE_URL + '/rest/v1/rpc/ep_price_for', {
        method: 'POST',
        headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + SERVICE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_device: deviceId }),
    });
    if (!priceRes.ok) {
        console.error('[ep-pay] price lookup failed', priceRes.status);
        return reply(origin, 502, { ok: false, error: 'price' });
    }
    const price = await priceRes.json() as {
        sku: string; price_inr: number; label: string; founding: boolean; period_days: number;
    } | null;
    if (!price || !price.price_inr || price.sku !== SKU) return reply(origin, 503, { ok: false, error: 'not_priced' });

    // No keys = no link. It must never pretend a payment path exists.
    if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
        console.warn('[ep-pay] no Razorpay keys — refusing (fail closed)');
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
                // The device id and the sku ride the payment and come back on
                // the webhook: the sku is what keeps an EAPCET payment out of
                // the Answer Book's grant path and the other way round.
                notes: { device_id: deviceId, sku: SKU, founding: String(price.founding) },
                callback_url: RETURN_URL,
                callback_method: 'get',
                reminder_enable: false,
                expire_by: Math.floor(Date.now() / 1000) + 30 * 60,
            }),
        });
        const out = await rzp.json();
        if (!rzp.ok || !out?.short_url) {
            console.error('[ep-pay] razorpay refused', rzp.status, JSON.stringify(out).slice(0, 300));
            return reply(origin, 502, { ok: false, error: 'gateway' });
        }
        console.log(`[ep-pay] link ${out.id} ₹${price.price_inr} founding=${price.founding}`);
        return reply(origin, 200, { ok: true, url: out.short_url, price });
    } catch (e) {
        console.error('[ep-pay] unreachable', (e as Error).message);
        return reply(origin, 502, { ok: false, error: 'gateway' });
    }
});
