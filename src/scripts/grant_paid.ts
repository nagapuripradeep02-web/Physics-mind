/**
 * grant_paid.ts — Payments Phase 1: flip a teacher's subscription after a manual payment.
 *
 * The founding cohort pays ₹699/mo via a Razorpay Payment Page link (sent personally at
 * trial end). When a payment lands in the Razorpay dashboard, run this to extend access:
 *
 *   npm run grant:paid -- <teacher-email> [months]        # months defaults to 1
 *   npm run grant:paid -- asmi@example.com 3              # e.g. after 3 months paid upfront
 *   npm run grant:paid -- asmi@example.com 0              # revoke (clears paid_until)
 *
 * What it does (PILOT project jqbnmltsupnnbuvqgkix — never the dev project):
 *   1. finds the auth user by email,
 *   2. confirms a teacher_profiles row exists (no profile = they never entered the app),
 *   3. upserts teacher_subscriptions: paid_until = (existing future paid_until || now) + N months
 *      — extending early never wastes days already paid for.
 *
 * Access enforcement is pm-auth's gate: access_end = max(trial_end, paid_until). The
 * teacher's next page load reopens the app; no rebuild/redeploy needed.
 *
 * Requires PILOT_SUPABASE_SERVICE_ROLE_KEY in .env.local (pilot project dashboard →
 * Project Settings → API → service_role). The service role bypasses RLS — this script and
 * the (Phase 2b) Razorpay webhook are the ONLY writers of teacher_subscriptions.
 */
import { createClient } from '@supabase/supabase-js';
import { PILOT_SUPABASE_URL } from './pilot_site_assets';

const SERVICE_KEY = process.env.PILOT_SUPABASE_SERVICE_ROLE_KEY;

function die(msg: string): never {
    console.error(`\n❌ ${msg}\n`);
    process.exit(1);
}

async function main(): Promise<void> {
    const [email, monthsArg] = process.argv.slice(2);
    if (!email || !email.includes('@')) {
        die('Usage: npm run grant:paid -- <teacher-email> [months]\n   e.g. npm run grant:paid -- teacher@school.in 1');
    }
    const months = monthsArg === undefined ? 1 : Number(monthsArg);
    if (!Number.isInteger(months) || months < 0 || months > 24) {
        die(`months must be an integer 0–24 (got "${monthsArg}"). 0 = revoke.`);
    }
    if (!SERVICE_KEY) {
        die(
            'PILOT_SUPABASE_SERVICE_ROLE_KEY is not set in .env.local.\n' +
            '   Get it from the PILOT project dashboard (physicsmind-pilot / jqbnmltsupnnbuvqgkix):\n' +
            '   Project Settings → API → service_role secret. Add to .env.local:\n' +
            '   PILOT_SUPABASE_SERVICE_ROLE_KEY=eyJ...'
        );
    }

    const admin = createClient(PILOT_SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // 1. auth user by email (25-teacher scale: one page is plenty)
    const { data: usersPage, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) die(`Could not list users: ${listErr.message}`);
    const user = usersPage.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (!user) die(`No auth user with email "${email}" in the pilot project.`);

    // 2. profile must exist (created by start_trial when they first entered the app)
    const { data: profile, error: profErr } = await admin
        .from('teacher_profiles').select('professor_id, display_name, trial_started_at, trial_days')
        .eq('professor_id', user.id).maybeSingle();
    if (profErr) die(`Profile lookup failed: ${profErr.message}`);
    if (!profile) die(`"${email}" has an auth account but no teacher profile — they never completed welcome.html. Nothing to grant.`);

    // 3. current subscription (extend from the later of now / existing paid_until)
    const { data: sub, error: subErr } = await admin
        .from('teacher_subscriptions').select('paid_until, plan')
        .eq('professor_id', user.id).maybeSingle();
    if (subErr) die(`Subscription lookup failed: ${subErr.message}`);

    let paidUntil: string | null = null;
    if (months > 0) {
        const existing = sub?.paid_until ? new Date(sub.paid_until).getTime() : 0;
        const base = new Date(Math.max(Date.now(), existing));
        base.setMonth(base.getMonth() + months);
        paidUntil = base.toISOString();
    }

    const { error: upErr } = await admin.from('teacher_subscriptions').upsert({
        professor_id: user.id,
        plan: sub?.plan || 'founding-699',
        paid_until: paidUntil,
        note: `manual grant ${new Date().toISOString().slice(0, 10)}: ${months} month(s) by grant_paid.ts`,
        updated_at: new Date().toISOString(),
    });
    if (upErr) die(`Subscription write failed: ${upErr.message}`);

    if (months === 0) {
        console.log(`\n✅ REVOKED — ${profile.display_name} <${email}> paid_until cleared.`);
        console.log('   Their trial window (if still open) is now the only access.');
    } else {
        console.log(`\n✅ GRANTED — ${profile.display_name} <${email}>`);
        console.log(`   plan:       ${sub?.plan || 'founding-699'}`);
        console.log(`   paid_until: ${paidUntil}  (+${months} month${months === 1 ? '' : 's'})`);
        console.log('   Access reopens on their next page load — nothing to deploy.');
    }
}

main().catch((e) => die(e instanceof Error ? e.message : String(e)));
