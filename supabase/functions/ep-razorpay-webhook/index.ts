/**
 * ep-razorpay-webhook — money captured → the student's device unlocks the
 * EAPCET finder.
 *
 * The finder's OWN webhook, registered as a second webhook URL on the same
 * Razorpay account, with its own secret. The Answer Book's ab-razorpay-webhook
 * is never edited. Same proven shape: HMAC-verified raw body, idempotent on
 * payment_id, retry-friendly status codes.
 *
 * Both webhooks receive EVERY payment on the account, so each must know which
 * product a payment belongs to: ep-pay writes notes.sku = 'eapcet_physics_month'
 * on every link it creates, and this function acts ONLY on that sku. A payment
 * carrying another sku (or none — every Answer Book link predates the note) is
 * acknowledged with 200 and ignored, so Razorpay never retries it here.
 *
 * DEPLOY with JWT verification OFF — Razorpay cannot send a Supabase JWT:
 *   npx supabase functions deploy ep-razorpay-webhook --no-verify-jwt --use-api --project-ref <ref>
 *   supabase secrets set EP_RAZORPAY_WEBHOOK_SECRET=...
 *
 * Status codes matter — Razorpay retries any non-2xx for ~24h:
 *   401 = bad/missing signature  (never retried into a grant)
 *   500 = our database failed    (retry is DESIRABLE; ep_apply_payment is
 *                                 idempotent on payment_id, so it is safe)
 *   200 = handled, or deliberately ignored
 */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const WEBHOOK_SECRET = Deno.env.get('EP_RAZORPAY_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SKU = 'eapcet_physics_month';

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

/** Razorpay puts notes in different places depending on how the payment was
    made; check every shape rather than assume one. */
function notesOf(payment: Record<string, any>, body: Record<string, any>): Record<string, unknown>[] {
    return [
        payment?.notes,
        body?.payload?.payment_link?.entity?.notes,
        body?.payload?.order?.entity?.notes,
    ].filter((n) => n && typeof n === 'object') as Record<string, unknown>[];
}

function deviceIdFrom(notes: Record<string, unknown>[]): string {
    for (const n of notes) {
        const s = typeof n.device_id === 'string' ? n.device_id.trim() : '';
        if (UUID_RE.test(s)) return s;
    }
    return '';
}

function skuFrom(notes: Record<string, unknown>[]): string {
    for (const n of notes) {
        if (typeof n.sku === 'string' && n.sku.trim()) return n.sku.trim();
    }
    return '';
}

Deno.serve(async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';
    if (!(await signatureValid(raw, signature))) {
        console.warn('[ep-razorpay-webhook] rejected: bad or missing signature');
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
        console.log(`[ep-razorpay-webhook] ignored event=${event || '(none)'}`);
        return new Response(JSON.stringify({ ok: true, ignored: event }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });
    }

    const notes = notesOf(payment, body);
    const sku = skuFrom(notes);
    if (sku !== SKU) {
        // Another product's money (the Answer Book's, most likely). Its own
        // webhook handles it; acknowledging here stops Razorpay retrying.
        console.log(`[ep-razorpay-webhook] not ours: ${payment.id} sku=${sku || '(none)'}`);
        return new Response(JSON.stringify({ ok: true, ignored: 'sku', sku }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });
    }

    const deviceId = deviceIdFrom(notes);
    const amount = Number(payment.amount ?? 0);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ep_apply_payment`, {
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
        console.error(`[ep-razorpay-webhook] grant failed ${res.status}: ${text.slice(0, 200)}`);
        return new Response(JSON.stringify({ ok: false, error: 'grant failed' }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }

    console.log(`[ep-razorpay-webhook] ${event} ${payment.id} amount=${amount} device=${deviceId || '(none)'} → ${text.slice(0, 160)}`);
    return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } });
});
