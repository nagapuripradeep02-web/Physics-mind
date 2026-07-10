# Cloudflare hosting runbook — viditra.co (Workers Static Assets)

**How the marketing site actually deploys (confirmed 2026-07-10).** viditra.co is NOT Cloudflare Pages —
it's a **Cloudflare Worker named `viditra`** serving the `website/` folder as static assets ("Automatic
deployment on upload"), on the `nagapuripradeep02@gmail.com` account (`a7c8ea…`), with `viditra.co`
attached as a custom domain. Deploy config lives at repo-root **`wrangler.toml`**:

```toml
name = "viditra"
compatibility_date = "2026-06-01"
[assets]
directory = "./website"
```

Redeploying with the same name updates the service in place — **custom domain + routes are preserved**.
Supabase (auth/data/TTS) is host-independent and never moves.

## Deploy the marketing site + demo

```
# 1. (re)build the demo folder if the sim/concept changed:
npm run build:review -- ac_generator
cp review-site/ac_generator/index.html review-site/ac_generator/sim.html website/demo/
#    then re-apply the 5 demo hand-patches (see below) — diff must show ONLY those 5 hunks.

# 2. sanity-check without uploading:
npx wrangler deploy --dry-run          # "Read N files from the assets directory …"

# 3. deploy (the permission classifier blocks this from the agent — run it yourself):
npm run deploy:cf-site                  # = npx wrangler deploy
```

Rollback if needed: `npx wrangler rollback`, or Cloudflare dashboard → Workers & Pages → **viditra** →
Deployments → pick the previous version.

**Verify from the shell** (note: Workers Static Assets 307-redirects `/demo/sim.html` → `/demo/sim`, so
use `curl -sL` to follow it):
```
curl -sL https://viditra.co/demo/sim.html | grep -Fc "Cambria Math"     # >0 = new build live
curl -s  https://viditra.co/demo/ | grep -Fc "AC Generator — Viditra"   # 1 = branding live
```

### The 5 demo hand-patches (re-apply after every `cp` from review-site)

`website/demo/` is a baked build:review copy with 5 public-demo edits; a fresh copy wipes them.
1. `index.html` title → `AC Generator — Viditra` + `<link rel="icon" … href="../favicon.svg">`
2. Replace the 5 `pm-*.js` script tags with: auth-strip comment + rail-pre-collapse script + `.demoCta` styles + `#rail.collapsed{overflow:hidden}`
3. Header wordmark `PhysicsMind` → `Viditra`
4. `.hd-right` → the demoCta teaser anchor ("This is 1 of 20 simulations …")
5. `sim.html` `var isMobile = window.innerWidth < 768;` → `var isMobile = false;` (+ comment)

Final `diff review-site/ac_generator/<f> website/demo/<f>` must show exactly these 5 hunks.

---

## ✅ DONE 2026-07-10: the teacher APP is on Cloudflare — https://app.viditra.co

Executed as below. Worker **`viditra-app`** serves `review-site/` (fresh `build:pilot`, 21 concepts,
capStrip chrome, non-pilot folders pruned to `review-site-archive/`); custom domain attached via the
`routes = [{ pattern = "app.viditra.co", custom_domain = true }]` entry in **`wrangler.app.toml`**.
Deploy command: **`npm run deploy:app`**. Fallback URL: viditra-app.nagapuripradeep02.workers.dev.
Verified: gate → /login (200), catalog 21 cards, sim pages + audio manifests 200. Supabase needed NO
change (pure password auth, hostname-based dev detection — as predicted).
**TOML gotcha (cost one deploy):** `routes` is a TOP-LEVEL key — if placed after `[assets]`, TOML scopes
it into the assets table and wrangler silently ignores it (only a "Unexpected fields" warning); the
domain never attaches. Keep `routes` above any `[table]` header.
**Netlify status:** old site (physicsmind-review-13308.netlify.app) left live as a cold backup.
Founder follow-ups: share app.viditra.co with the pilot professors; after a few stable days stop
auto-publish / delete the Netlify site and drop `deploy:review`; optionally `workers_dev = false`;
pre-handoff Supabase TODOs (disable public signups, delete the test account) still open.

## Original migration plan (for reference — executed 2026-07-10)

The pilot app (`review-site/`) still lives on Netlify (`physicsmind-review-13308.netlify.app`), whose
free tier credit-blocks on audio-heavy deploys (see `project_netlify_deploy_credits_blocked`). Move it
to a **second Worker** on the same account, mirroring viditra.co (Workers free tier is generous; if
request volume ever warrants it, Pages' unlimited-request tier is the alternative). Verified clean: the
Netlify URL is referenced only in PROGRESS/DISCUSSIONS, never in source.

1. `npm run build:pilot` → emits `review-site/` with pilot auth + `pm-feedback.js`.
2. Create a **separate** wrangler config (do NOT reuse the root one — that's the marketing site), e.g.
   `wrangler.app.toml`:
   ```toml
   name = "viditra-app"
   compatibility_date = "2026-06-01"
   [assets]
   directory = "./review-site"
   ```
3. First deploy: `npx wrangler deploy --config wrangler.app.toml` → prints `viditra-app.<acct>.workers.dev`.
4. Verify on the workers.dev URL: catalog loads, a sim opens, audio plays, login gate behaves.
5. **Supabase → Auth → URL Configuration:** add the workers.dev origin and `https://app.viditra.co` to
   Site URL / Redirect URLs, or login redirects fail on the new origin.
6. Dashboard → Workers → **viditra-app** → Settings → Domains & Routes → add custom domain
   `app.viditra.co` (the `viditra.co` zone is already on this account → CNAME + TLS auto-provision).
7. Update teacher-facing links from the netlify.app URL to `https://app.viditra.co`; watch a few days,
   then retire the Netlify site (keep `deploy:review` as a cold-backup wrapper until fully verified).

Free-tier headroom (why this ends the credit problem): Workers Static Assets has no bandwidth/egress
charge; the 20-sim app + EN/TE audio is well within limits.
