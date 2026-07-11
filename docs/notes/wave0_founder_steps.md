# Wave 0 — founder steps (do these in order, ~15 min total)

> Wave 0 shipped 2026-07-11: public self-serve trial (join.html → Google → 4 questions →
> "{Name}'s Class · powered by Viditra"), per-account saved layouts, 14-day soft trial clock.
> The pilot Supabase schema (teacher_profiles / teacher_layouts / start_trial) is **already
> applied** — only the Google OAuth credential and the deploy are yours.

## 1. Google OAuth credential (~10 min, one time)
1. https://console.cloud.google.com → project (create "viditra" if none) → APIs & Services → OAuth consent screen: External, app name **Viditra**, support email pradeep@viditra.co → publish.
2. APIs & Services → Credentials → Create credentials → OAuth client ID → **Web application**:
   - Authorized JavaScript origins: `https://app.viditra.co` and `https://viditra-app.nagapuripradeep02.workers.dev`
   - Authorized redirect URI: `https://jqbnmltsupnnbuvqgkix.supabase.co/auth/v1/callback`
3. Copy Client ID + Client secret.
4. Supabase dashboard → project **physicsmind-pilot** → Authentication → Providers → Google → Enable, paste ID + secret, Save.
5. Authentication → URL Configuration → Site URL: `https://app.viditra.co`; Redirect URLs — add:
   `https://app.viditra.co/login.html`, `https://app.viditra.co/welcome.html`,
   `https://viditra-app.nagapuripradeep02.workers.dev/login.html`, `https://viditra-app.nagapuripradeep02.workers.dev/welcome.html`
6. Leave "Allow new users to sign up" **ON** (Google needs it — one-trial-per-identity is the control, not the door).

## 2. Migration — ✅ ALREADY APPLIED (2026-07-11, via Supabase MCP)
`supabase_migrations/pilot_20260711_wave0_profiles_layouts.sql` is live on physicsmind-pilot.
Verified: anon sees zero rows; anon cannot execute `start_trial` (permission denied).
Nothing to do unless you ever rebuild the project — then paste that file in the SQL editor.

## 3. Pilot professors' 90-day terms
Asmi + professor #2 keep their password accounts. On next login they'll answer the 4 setup
questions once (their profile row is created with the default 14 days) — then run in the
SQL editor:
```sql
update teacher_profiles set trial_days = 90
 where professor_id in (select id from auth.users where email in
   ('asmisingh201@gmail.com', '<professor2 email>'));
```

## 4. Deploy
```
npm run build:pilot
npm run deploy:app
```
(Marketing site, for the CTA + pricing copy: the same `npx wrangler deploy` used on 2026-07-10 for viditra.co.)

## 5. Hand-test (fresh incognito window)
- [ ] Open `https://app.viditra.co/join.html` → trial landing renders (perks + Google button)
- [ ] Continue with Google (a NEW Google account, not founder) → lands on welcome.html, name prefilled
- [ ] Submit the 4 questions → splash "*<Name>'s Class · powered by Viditra*" → catalog says "<Name>'s Class", chip "Trial · 14 days left"
- [ ] Open a sim → brand load card fades in/out; "powered by Viditra" bottom-left
- [ ] Reorder + rename a state → Save → open the SAME sim in another browser/phone (same Google account) → layout is there
- [ ] Sign out, sign back in with the SAME Google account → NO setup questions again, trial days did NOT reset
- [ ] viditra.co "Start your free trial" buttons → land on join.html
- [ ] Founder account still enters with NO profile questions (staff bypass) and is not tracked
- [ ] Logged out, open `https://app.viditra.co/` directly → login page

## 6. WhatsApp message template (same link for everyone — nothing personal to generate)
> Hi <Name>! Here's Viditra — the 3D physics simulations we spoke about.
> Start your free trial here (sign in with Google, 4 quick questions, ~1 minute):
> https://app.viditra.co/join.html
> It's your own space — anything you reorder, rename, or save stays yours. Two weeks free, full library.
> Which chapter are you teaching next week? I'll point you to the exact sims for it.
