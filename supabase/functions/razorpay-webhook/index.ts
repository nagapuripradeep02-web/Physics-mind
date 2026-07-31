/**
 * razorpay-webhook — Payments Phase 2b: a captured payment activates the teacher
 * within seconds, with no human in the loop.
 *
 * DEPLOY TO THE PILOT PROJECT (physicsmind-pilot / jqbnmltsupnnbuvqgkix) with JWT
 * verification OFF — Razorpay cannot send a Supabase JWT. The function is not
 * unauthenticated for that reason: every request must carry a valid
 * X-Razorpay-Signature (HMAC-SHA256 of the RAW body, keyed with the webhook secret
 * you set in the Razorpay dashboard). No secret configured = every request is
 * rejected. It fails CLOSED, always.
 *
 *   supabase secrets set RAZORPAY_WEBHOOK_SECRET=...   (or the dashboard UI)
 *   optional: PLAN_PRICE_PAISE (default 49900 = ₹499) — how many paise buy 1 month.
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
 *
 * Status codes matter here: Razorpay retries any non-2xx for ~24h. So
 *   401 = bad/missing signature   (never retried into a grant — it is not our event)
 *   500 = our database failed     (retry is DESIRABLE; apply_razorpay_payment is
 *                                  idempotent on payment_id, so a retry is safe)
 *   200 = handled, or deliberately ignored (unknown event type)
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const PRICE_PAISE = Number(Deno.env.get('PLAN_PRICE_PAISE') ?? '49900');

/** Events that mean "money captured". All of them carry payload.payment.entity. */
const PAYMENT_EVENTS = new Set(['payment.captured', 'order.paid', 'payment_link.paid']);

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
 * Razorpay puts the payer's email in different places depending on how the page was
 * built (Payment Page customer fields land in `notes`, a plain checkout fills
 * `entity.email`). Check every one we might see rather than assume a shape.
 */
function payerEmail(payment: Record<string, unknown>, body: Record<string, any>): string {
    const notes = (payment.notes ?? {}) as Record<string, unknown>;
    const candidates = [
        payment.email,
        notes.email, notes.Email, notes.email_address, notes['Email address'],
        body?.payload?.payment_link?.entity?.customer?.email,
        body?.payload?.order?.entity?.notes?.email,
    ];
    for (const c of candidates) {
        const s = typeof c === 'string' ? c.trim() : '';
        if (s && s.includes('@')) return s.toLowerCase();
    }
    return '';
}

/** ₹499 buys one month; a larger page (3 months upfront) scales, never below 1. */
function monthsFor(amountPaise: number): number {
    if (!Number.isFinite(amountPaise) || amountPaise <= 0 || !Number.isFinite(PRICE_PAISE) || PRICE_PAISE <= 0) return 1;
    return Math.max(1, Math.min(24, Math.round(amountPaise / PRICE_PAISE)));
}

Deno.serve(async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    if (!(await signatureValid(raw, signature))) {
        console.warn('[razorpay-webhook] rejected: bad or missing signature');
        return new Response(JSON.stringify({ ok: false, error: 'invalid signature' }), {
            status: 401, headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: Record<string, any>;
    try {
        body = JSON.parse(raw);
    } catch {
        return new Response(JSON.stringify({ ok: false, error: 'bad json' }), {
            status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    const event = String(body.event ?? '');
    const payment = body?.payload?.payment?.entity;
    if (!PAYMENT_EVENTS.has(event) || !payment?.id) {
        // Subscribed to something we don't act on. 2xx so Razorpay stops retrying.
        console.log(`[razorpay-webhook] ignored event=${event || '(none)'}`);
        return new Response(JSON.stringify({ ok: true, ignored: event }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });
    }

    const email = payerEmail(payment, body);
    const amount = Number(payment.amount ?? 0);
    const months = monthsFor(amount);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/apply_razorpay_payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({
            p_payment_id: String(payment.id),
            p_event: event,
            p_email: email,
            p_contact: typeof payment.contact === 'string' ? payment.contact : null,
            p_amount_paise: amount,
            p_months: months,
            p_raw: body,
        }),
    });

    const text = await res.text();
    if (!res.ok) {
        // 500 → Razorpay retries → apply_razorpay_payment dedupes on payment_id.
        console.error(`[razorpay-webhook] grant failed ${res.status}: ${text}`);
        return new Response(JSON.stringify({ ok: false, error: 'grant failed' }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }

    // Log WITHOUT the raw payload — these logs are readable in the dashboard.
    console.log(`[razorpay-webhook] ${event} ${payment.id} amount=${amount} months=${months} → ${text}`);
    return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
});
