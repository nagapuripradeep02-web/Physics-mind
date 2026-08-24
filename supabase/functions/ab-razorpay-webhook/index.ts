/**
 * ab-razorpay-webhook — money captured → the student's device unlocks (P4).
 *
 * The Answer Book's own webhook, deliberately SEPARATE from the teacher app's
 * `razorpay-webhook`: different project, different ledger, different grant
 * (a device pass, not a teacher subscription). Same proven shape though —
 * HMAC-verified raw body, idempotent on payment_id, retry-friendly status codes.
 *
 * DEPLOY TO THE DEV PROJECT (where the ab_* tables live) with JWT verification
 * OFF — Razorpay cannot send a Supabase JWT. It is not unauthenticated for that
 * reason: every request must carry a valid X-Razorpay-Signature (HMAC-SHA256 of
 * the RAW body, keyed with the webhook secret from the Razorpay dashboard).
 * No secret configured = every request rejected. It fails CLOSED, always.
 *
 *   npx supabase functions deploy ab-razorpay-webhook --no-verify-jwt --use-api \
 *     --project-ref <ref>
 *   supabase secrets set AB_RAZORPAY_WEBHOOK_SECRET=...
 *
 * Status codes matter — Razorpay retries any non-2xx for ~24h:
 *   401 = bad/missing signature  (not our event; never retried into a grant)
 *   500 = our database failed    (retry is DESIRABLE; ab_apply_payment is
 *                                 idempotent on payment_id, so it is safe)
 *   200 = handled, or deliberately ignored (event we do not act on)
 *
 * The device id rides in `notes.device_id`, put there by answerbook-pay. A
 * payment with no device id is still BANKED (ab_payments with applied_at null)
 * so the money is never lost — it is attachable by hand.
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const WEBHOOK_SECRET = Deno.env.get('AB_RAZORPAY_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const PAYMENT_EVENTS = new Set(['payment.captured', 'order.paid', 'payment_link.paid']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const enc = new TextEncoder();
function hex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time compare — a length-leaking early return is enough to grind out a signature. */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

async function signatureValid(rawBody: string, signature: string): Promise<boolean> {
    if (!WEBHOOK_SECRET || !signature) return false;
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const mac = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
    return timingSafeEqual(hex(mac), signature.trim().toLowerCase());
}

/**
 * Razorpay puts notes in different places depending on how the payment was
 * made (payment link vs order vs plain checkout). Check every shape we might
 * see rather than assume one — the device id is the whole identity link.
 */
function deviceIdFrom(payment: Record<string, any>, body: Record<string, any>): string {
    const candidates = [
        payment?.notes?.device_id,
        body?.payload?.payment_link?.entity?.notes?.device_id,
        body?.payload?.order?.entity?.notes?.device_id,
    ];
    for (const c of candidates) {
        const s = typeof c === 'string' ? c.trim() : '';
        if (UUID_RE.test(s)) return s;
    }
    return '';
}

Deno.serve(async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    if (!(await signatureValid(raw, signature))) {
        console.warn('[ab-razorpay-webhook] rejected: bad or missing signature');
        return new Response(JSON.stringify({ ok: false, error: 'invalid signature' }), {
            status: 401, headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: Record<string, any>;
    try { body = JSON.parse(raw); }
    catch {
        return new Response(JSON.stringify({ ok: false, error: 'bad json' }), {
            status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    const event = String(body.event ?? '');
    const payment = body?.payload?.payment?.entity;
    if (!PAYMENT_EVENTS.has(event) || !payment?.id) {
        console.log(`[ab-razorpay-webhook] ignored event=${event || '(none)'}`);
        return new Response(JSON.stringify({ ok: true, ignored: event }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });
    }

    const deviceId = deviceIdFrom(payment, body);
    const amount = Number(payment.amount ?? 0);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ab_apply_payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({
            p_payment_id: String(payment.id),
            p_event: event,
            p_device: deviceId || null,
            p_amount_paise: amount,
            p_raw: body,
        }),
    });

    const text = await res.text();
    if (!res.ok) {
        // 500 → Razorpay retries → ab_apply_payment dedupes on payment_id.
        console.error(`[ab-razorpay-webhook] grant failed ${res.status}: ${text.slice(0, 200)}`);
        return new Response(JSON.stringify({ ok: false, error: 'grant failed' }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }

    // Log WITHOUT the raw payload — these logs are readable in the dashboard.
    console.log(`[ab-razorpay-webhook] ${event} ${payment.id} amount=${amount} device=${deviceId || '(none)'} → ${text.slice(0, 160)}`);
    return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
});
