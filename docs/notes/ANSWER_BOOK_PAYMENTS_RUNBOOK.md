# Answer Book payments runbook (P4 — built 2026-08-24)

> Student product, distinct from the teacher app's `docs/notes/PAYMENTS_RUNBOOK.md`
> (different project, different ledger, different grant). Everything below is
> BUILT AND DEPLOYED except the three founder steps in §2 — until those are done,
> the pay button does not appear and the book behaves exactly as it does today.

## 1. The model (founder decision, 2026-08-24)

| | |
|---|---|
| **Founding price** | **₹99 / 31 days**, first **500** devices |
| **List price** | **₹249 / 31 days**, from device 501 on |
| **Grandfathering** | a device that has ever paid ₹99 renews at ₹99 **forever** |
| **Free** | ONE chapter per device, explicit tap, never expires |
| **Renewal** | pay again — no autopay mandate; extends from the later of now / current expiry |

The price lives in `ab_skus` and is decided by `ab_price_for(device)` **on the
server**. The page never names a number, so changing any of it is one `update`,
no rebuild, no deploy:

```sql
update ab_skus set founding_price_inr = 149, founding_limit = 1000 where sku='full_book';
```

**Why grandfathering matters:** the January step-up to ₹249 must never look like a
price rise. A student who joined at ₹99 keeps ₹99; only students who never saw the
founding price pay list. The sheet says this out loud ("Once you join at this
price, it stays yours") and a gate asserts that sentence.

## 2. FOUNDER STEPS — nothing charges until these are done

### 2.1 Razorpay keys (~10 min, unblocks the pay button)
Razorpay Dashboard → **Settings → API Keys → Generate Live Key**, then:
```bash
npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxxx RAZORPAY_KEY_SECRET=xxxx \
  --project-ref dxwpkjfypzxrzgbevfnx
```
Until set, `answerbook-pay` returns `payments_unconfigured` and the sheet simply
shows no pay button — verified live, never a broken button.

### 2.2 The webhook (~5 min, this is what actually unlocks a student)
Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**
- URL: `https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/ab-razorpay-webhook`
- Active events: **payment.captured**, **payment_link.paid**, **order.paid**
- Secret: invent a long random string, then:
```bash
npx supabase secrets set AB_RAZORPAY_WEBHOOK_SECRET=<same string> \
  --project-ref dxwpkjfypzxrzgbevfnx
```
Without the secret every webhook call is rejected 401 (verified live) — money
would be taken and access never granted, so **do 2.1 and 2.2 together or neither**.

### 2.3 Raise the AI spend ceiling BEFORE launch (paying students hit it otherwise)
The Vidi chat function fails closed at **$2/day** — sized for a pilot, not for 500
paying students (~₹9,000/month of DeepSeek at expected usage). A paying student
hitting "Vidi is resting today" is the worst possible bug.
```bash
npx supabase secrets set AB_DAILY_USD_CAP=15 --project-ref dxwpkjfypzxrzgbevfnx
```
$15/day is a hard backstop well above worst case, so runaway spend still cannot
happen. Consider also `AB_IP_PER_DAY=60` if paying students report the 40/day cap.

## 3. The money path

```
student taps [Unlock every chapter — ₹99]
   → answerbook-pay   : server prices THIS device, creates a Razorpay payment link
                        carrying notes.device_id (30-minute expiry)
   → student pays by UPI on Razorpay's page
   → ab-razorpay-webhook : HMAC-verifies the RAW body, calls ab_apply_payment
   → ab_apply_payment : idempotent on payment_id; writes ab_payments; EXTENDS the
                        device's 'all' entitlement by 31 days (never stacks rows)
   → the book re-lists on return and drops the student into the chapter they wanted
```

**Idempotency:** Razorpay retries any non-2xx for 24h; `ab_apply_payment` returns
`duplicate` on a repeat `payment_id`, so a retry can never buy a second month
(proven in SQL: same id twice → one entitlement row).

**Money never lost:** a payment with no `notes.device_id` is still recorded in
`ab_payments` with `applied_at = null` and a note. Attach by hand:
```sql
select ab_apply_payment('<new_id>', 'manual', '<device-uuid>', 9900, '{}'::jsonb);
-- (or grant directly)
insert into ab_entitlements (device_id, unit_key, source, expires_at)
values ('<device-uuid>', 'all', 'grant', now() + interval '31 days')
on conflict (device_id, unit_key, source) do update set expires_at = excluded.expires_at;
```

## 4. Daily operator queries

```sql
-- who is paying, and are they founders?
select date(received_at) d, count(*) n, sum(amount_paise)/100 rupees, bool_and(founding) all_founding
  from ab_payments group by 1 order by 1 desc;

-- founding slots left
select ab_price_for(null);

-- money received but not attached to a device (needs a human)
select payment_id, received_at, amount_paise, note from ab_payments where applied_at is null;

-- live passes / expiring in the next 5 days
select count(*) filter (where expires_at > now()) live,
       count(*) filter (where expires_at between now() and now() + interval '5 days') expiring
  from ab_entitlements where source = 'paid';
```

## 5. What is NOT built (deliberately)

- **Autopay / e-mandate.** Students renew by tapping again. Mandate friction kills
  student conversion; revisit only if renewal drops.
- **Phone OTP + second-device restore.** The pass belongs to the device that paid.
  A student who changes phones needs a manual grant (§3) until OTP lands — which
  needs **SMS/DLT registration (weeks of lead time, not started)**.
- **Refunds in-app.** Refund in the Razorpay dashboard, then expire the pass:
  `update ab_entitlements set expires_at = now() where device_id = '<uuid>' and source='paid';`
- **GST invoicing.** Not required at this scale; revisit with volume.

## 6. Go-live order (when the founder is ready)

1. §2.1 + §2.2 + §2.3 secrets.
2. `npm run build:answers:gated && npm run content:push`
3. Point `wrangler.answers.toml` `[assets] directory` at `./answer-book/dist-gated`.
4. `npx wrangler deploy -c wrangler.answers.toml`
5. Test with a **real ₹99 payment on your own phone** (it is the only end-to-end
   proof that keys + webhook + grant agree), then refund it in the dashboard and
   expire the pass per §5.
6. Watch `ab_payments` and the function logs for the first real student.
