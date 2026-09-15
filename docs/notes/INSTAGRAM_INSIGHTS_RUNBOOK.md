# Instagram register + insights — runbook (built 2026-09-15)

The Viditra Instagram account's register and performance numbers, at
**viditra.co/admin/instagram**. Every post the account publishes gets one row
(what it is, its authored hook / keyword / format, posted at which IST **and**
Berlin time) and a daily snapshot of its lifetime counters for as long as the
pull looks back, so the 48 h and 7 d ratios exist without anyone typing them.

The knowledge half — how a post gets its authored metadata, the weekly analyst,
the R0 promotion table — lives in the reel studio:
`C:\Tutor\viditra-film\marketing\INSIGHTS.md`. This file is the plumbing half.

## 0. Prerequisites (founder, once) — and the six curls

1. **Make the Instagram account Professional (Creator or Business) BEFORE the
   first post.** Instagram only records insights for media published after the
   switch; a post that goes out on a personal account never gets numbers.
2. Meta app: [developers.facebook.com/apps](https://developers.facebook.com/apps)
   → Create app → type **Business** → add the **Instagram** product → "API setup
   with Instagram business login" → add the Viditra account → **Generate token**.
   The token from the dashboard is long-lived (60 days). Note the
   **Instagram user id** from
   `GET https://graph.instagram.com/v25.0/me?fields=user_id,username&access_token=…`.
   Scopes needed: `instagram_business_basic`, `instagram_business_manage_insights`.
   Your own account, with you as the app admin, works in Development mode
   without App Review. No Facebook Page is needed on this login flow.
3. Verify the API facts the pull job was written against (they drift —
   `plays` became `views` in 2024). Run each once with the real token; the
   expected shape is in brackets:

   ```bash
   T=<token>; U=<ig_user_id>; V=https://graph.instagram.com/v25.0
   curl -s "$V/$U/media?fields=id,media_type,media_product_type,caption,permalink,timestamp,thumbnail_url,like_count,comments_count&access_token=$T"
   #   -> {"data":[...]} (empty before the first post; HTTP 200)
   curl -s "$V/<reel-media-id>/insights?metric=views,reach,likes,comments,shares,saved,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time,reels_skip_rate&access_token=$T"
   #   -> one entry per metric; note whether reels_skip_rate comes back as 35 or 0.35
   curl -s "$V/<carousel-media-id>/insights?metric=views,reach,likes,comments,shares,saved,total_interactions,profile_visits,follows&access_token=$T"
   curl -s "$V/<story-media-id>/insights?metric=views,reach,replies,shares,follows,profile_visits,link_clicks&access_token=$T"
   #   -> stories under 5 views return error code 10 ("no data yet") — expected
   curl -s "$V/$U/insights?metric=reach,profile_views,accounts_engaged,total_interactions&period=day&metric_type=total_value&access_token=$T"
   curl -s "$V/$U/insights?metric=follower_count&period=day&access_token=$T"
   #   -> under 100 followers it is silently OMITTED from the response (verified 2026-09-15) — the job falls back to followers_count
   curl -s "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=$T"
   #   -> {"access_token":"…","token_type":"bearer","expires_in":5183944} (token must be ≥ 24 h old)
   ```

   **Verified 2026-09-15 with the real token (app "Viditra" 1638861014239075, IG app
   3608351842661937, user 17841434532927112, reel `DdT4onxKIZi`):** the media list and the
   REEL metric set work; **`reposts` is rejected** ("endpoint does not support the metrics:
   reposts") so it is no longer requested; `reels_skip_rate` comes back as a PERCENT
   (`59.4`) and the parser divides by 100; the day-period account insights return
   `reach, profile_views, accounts_engaged, total_interactions` and **silently omit
   `follower_count`** under 100 followers (no error — the row's `follower_count` is null,
   `followers_total` comes from the user node); the refresh endpoint answered at once with
   `expires_in: 5183738` and the permission list `instagram_business_basic,
   instagram_business_manage_messages, instagram_business_content_publish,
   instagram_business_manage_insights, instagram_business_manage_comments`. The token
   was generated on the dashboard's "API setup with Instagram login" page after adding
   the account as an **Instagram Tester** (App roles → Add People → Instagram Tester →
   the account accepts under Instagram Settings → Apps and websites → Tester invitations)
   — without that role the "Add account" popup completes but no account appears.

   A metric the API rejects is not a failure: the job drops it, logs
   `metric rejected: <name>`, retries once, and stores the whole response in
   `ig_insights_daily.raw` so nothing is lost while the column mapping catches up
   (`src/lib/ig/graph.ts` → `METRIC_TO_COLUMN`).

## 1. The pieces

| Piece | Where | What |
|---|---|---|
| `ig_posts` | dev project `dxwpkjfypzxrzgbevfnx` | the register — one row per media id; API columns by the job, authored columns only via `ig_apply_registrations()` |
| `ig_insights_daily` | same | one row per (post, IST day, slot): lifetime counters + `age_hours`; the 48 h / 7 d rows are DERIVED |
| `ig_account_daily` | same | one row per IST day: followers, reach, profile views |
| `ig_registrations` | same | the inbox viditra-film's `npm run ig:register` writes to, keyed by permalink shortcode |
| `ig_admin_config` | same | `stats_token` (dashboard), `meta_access_token`, `meta_token_expires_at`, `ig_user_id`, `last_pull_at`, `last_pull_summary` — RLS on, zero policies |
| `ig_horizon()` · `ig_post_ratios` · `ig_stats()` | same | nearest-snapshot jsonb · the view every reader uses (revoked from anon) · the one jsonb behind the page |
| `src/scripts/ig_pull.ts` | repo, `npm run ig:pull` | the daily job (flags in its header) |
| `.github/workflows/ig-pull.yml` | repo | the schedule: `30 12 * * *` UTC = 18:00 IST = 14:30 Berlin |
| `supabase/functions/ig-stats` | Edge Function | the only door to `ig_stats`; token in the body |
| `website/admin/instagram.html` | `viditra` Worker (`npm run deploy:cf-site`) | the page |
| `supabase_migrations/supabase_2026_09_15_instagram_insights.sql` | repo | the schema (safe to re-run) |

**Ratios** (founder, 2026-09-15): send rate = shares ÷ views · save rate = saves ÷
views · keyword intent = comments ÷ likes · completion = avg watch time ÷ reel
length · hook hold = 1 − `reels_skip_rate` · follow rate = follows ÷ reach ·
profile-visit rate = profile visits ÷ reach · **rank = saves + shares** (R0).
48 h = nearest snapshot within ±18 h of 48 h; 7 d = within ±24 h of 168 h;
lifetime = the latest. `basis` = 7 d when present, else 48 h (provisional).
Lifetime never ranks.

Why the horizon windows are that wide: one snapshot a day means the "48 h" row
is up to ±12 h off. The `slot` column exists so a second daily run
(`--slot 1`, commented in the workflow) can halve that without a migration.

## 2. Tokens

**The dashboard token** — read it, paste it once into the page (it stays in that
browser's `localStorage` under `pm_ig_stats_token`):
```sql
select value from ig_admin_config where key = 'stats_token';
```
Rotate it (every browser has to paste again):
```sql
update ig_admin_config set value = replace(gen_random_uuid()::text,'-',''), updated_at = now() where key = 'stats_token';
```

**The Meta token** lives in `ig_admin_config`, not in `.env.local` and not in a
GitHub secret, so the laptop and CI share one rotating token. Seed it once:
```powershell
$env:IG_ACCESS_TOKEN = '<token from the app dashboard>'
$env:IG_USER_ID = '<ig user id>'
$env:IG_TOKEN_EXPIRES_AT = '60'        # days, or an ISO date
npm run ig:pull -- --bootstrap
```
The job refreshes it when under 10 days remain and persists the new one. When
under 7 days remain even after that, the run exits 1 — on Actions that is a red
run and an email, which is the alert. If the token has already expired, refresh
is impossible: generate a new one in the app dashboard and run `--bootstrap`
again. The page's second chip shows days left (yellow < 14, red < 7).

## 3. Secrets

GitHub → repo → Settings → Secrets and variables → Actions:
`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (the same values as
`.env.local`). Nothing else — the Meta token is in the database.

Supabase: no new secret. `AB_ALLOWED_ORIGINS`, if ever set, **replaces** the
default origin list on every function — keep `https://viditra.co,https://www.viditra.co`
in it or the dashboard 403s.

## 4. Deploy order — the four halves (no npm script covers them together)

1. **Migration** — the Supabase MCP `apply_migration` on `dxwpkjfypzxrzgbevfnx`
   with the SQL file (safe to re-run; applied 2026-09-15).
2. **Edge Function** — `ig-stats` via the MCP `deploy_edge_function`,
   `verify_jwt=false` (the local CLI is logged into the wrong org).
3. **The schedule** — merge `.github/workflows/ig-pull.yml` to `master`
   (schedules fire only from the default branch), add the two secrets, run it
   once by hand: Actions → ig-pull → Run workflow.
4. **The page** — from `master`, after `git pull`: `npm run deploy:cf-site`.
   **It publishes `website/` wholesale and deletes what the branch lacks**, so
   first prove the branch carries what is live:
   ```bash
   sha1sum website/admin/answers.html
   curl -s https://viditra.co/admin/answers.html | sha1sum
   ```

## 5. Verify after a deploy (liveness = a row count, never "it deployed")

```bash
# the function, three ways
FN=https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/ig-stats
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Origin: https://evil.example" -H "Content-Type: application/json" -d '{"token":"x"}' $FN        # 403
curl -s -w " %{http_code} %{time_total}s\n" -X POST -H "Origin: https://viditra.co" -H "Content-Type: application/json" -d '{"token":"wrongwrongwrongwrong"}' $FN   # 401, ~1 s
curl -s -X POST -H "Origin: https://viditra.co" -H "Content-Type: application/json" -d '{"token":"<stats_token>"}' $FN | head -c 300   # {"ok":true,"since":…,"liveness":{…
# the page, live, by its own vocabulary
curl -s https://viditra.co/admin/instagram | grep -c ig-stats            # ≥ 1
curl -s https://viditra.co/admin/answers   | grep -c answerbook-stats    # ≥ 1 — the other page survived the wholesale deploy
```
```sql
select count(*) from ig_account_daily;   -- ≥ 1 the day after the first pull (the liveness number before any post exists)
select count(*) from ig_insights_daily;  -- ≥ 1 the day after the first post
select value from ig_admin_config where key = 'last_pull_summary';
```
On Actions: a green `ig-pull` run per day, its last line
`ig:pull ok · N posts (…) · N snapshots written, N skipped · … · token Nd · Ns`.

The SQL fixture the schema was verified with (rollback-wrapped; run it again
after any change to `ig_horizon` / `ig_post_ratios`):
```sql
begin;
insert into ig_posts (ig_media_id, shortcode, permalink, media_type, media_product_type, posted_at, duration_s)
values ('selftest','SELFTEST','https://www.instagram.com/reel/SELFTEST/','VIDEO','REELS','2026-09-22T13:35:00Z',30);
insert into ig_insights_daily (ig_media_id, snapshot_date, age_hours, views, likes, comments, shares, saved, avg_watch_time_ms, skip_rate, reach, follows) values
 ('selftest','2026-09-23',23,1000,100,40,10,20,21000,0.30,800,4),
 ('selftest','2026-09-24',47,4000,300,150,60,110,24000,0.25,3000,12),
 ('selftest','2026-09-29',168,9000,500,300,150,280,25200,0.22,7000,30);
select posted_ist, posted_berlin, basis, at48->>'views' v48, at48->>'send_rate' send48, at48->>'completion' c48, at7d->>'rank' rank7d
from ig_post_ratios where ig_media_id='selftest';
-- expect: 2026-09-22 19:05 | 2026-09-22 15:35 | 7d | 4000 | 0.01500 | 0.8000 | 430
rollback;
```

## 6. Failure modes

| Symptom | Cause | Do |
|---|---|---|
| `metric rejected: <name>` in the run log | Meta renamed or removed a metric | the run still succeeds; map the new name in `METRIC_TO_COLUMN` (`src/lib/ig/graph.ts`); `raw` has the data meanwhile |
| `follower_count unavailable` | the account has under 100 followers | expected; `followers_total` comes from the user node and the curve still draws |
| `TOKEN EXPIRES IN N DAYS` and a red run | refresh failed (token already expired, or < 24 h old) | §2 — generate a new token, `--bootstrap` |
| `registrations waiting: <shortcode>` on the page | `ig:register` ran before the daily pull saw the post | it attaches on the next pull; or run `npm run ig:pull` now (or `gh workflow run ig-pull.yml`) |
| a post shows *unregistered* | nobody ran `ig:register` for it | viditra-film: `npm run ig:register -- --reel <id> --permalink <url>` |
| `pending` at 48 h / 7 d | no snapshot within the window (the pull missed a day) | nothing to fix; the lifetime column still fills; a second daily slot narrows the gap |
| the page says *Could not load: HTTP 403* | the origin is not in the function's allowlist | §3 |
| `ig:pull` on the laptop hangs or fails on `fetch` | the Node-fetch-to-Supabase flake | Actions is the primary runner; locally, retry — the job retries each call four times |

## 7. Where the rest lives

- `C:\Tutor\viditra-film\marketing\INSIGHTS.md` — the ratio definitions in the
  founder's words, the weekly ritual, how to register a post.
- `C:\Tutor\viditra-film\tools\ig_register.mjs` · `ig_export.mjs` · `ig_r0.mjs` ·
  `ledger_measure.mjs --from db` — the studio's side of the seam.
- `.agents/marketing_analyst/CLAUDE.md` (viditra-film) — the weekly analyst,
  a Claude sub-agent on the subscription; reports only.
