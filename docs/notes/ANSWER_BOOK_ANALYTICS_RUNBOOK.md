# Answer Book usage dashboard — runbook (built 2026-08-28)

> Student product (answers.viditra.co). The dashboard is **viditra.co/admin/answers**;
> the teacher funnel at `/admin/` is a different product on a different Supabase project.

## 1. What it answers, and what a number means

| Number | Means | Does NOT mean |
|---|---|---|
| Devices that opened it | distinct `pm_device_id`s with an `app_open` in the period | students — one student on a phone + a laptop is two devices until they sign in |
| Came back | devices with events on 2+ different IST days | retention of a person |
| Visits | distinct per-tab visit ids; median minutes = first event → last event in that tab | time with the screen on (that is the `dwell` heartbeat, 1/min while visible) |
| Read to the end | (device, question) pairs whose deepest `advance` reached the last step | understanding |
| Excluded: N team devices | devices marked internal — hidden from every number unless "show team devices too" is ticked | — |

**Counting really started 2026-09-02**, not 2026-08-28. The tables and the dashboard were built on
the 28th, but the analytics branch never merged and every deploy after it rebuilt the site from
master — so the shipped page carried no event code at all and `ab_events` sat at **0 rows** for five
days. Devices minted in that window (33 of them) have no events and can never be attributed to
anyone, so `ab_stats` bounds `devices.total` by the `since` date and the "Since launch" button is
2026-09-02. The old unbounded count is still returned as `total_ever`.

The 29 devices that existed on 2026-08-28 are marked internal (all team testing). If a real student
is ever caught by a marking, un-mark them from the device table — one click, and it re-stamps their
history back.

## 2. Keeping yourself out of the numbers — three ways, any one is enough

1. **On each phone/laptop you use, open once:** `https://answers.viditra.co/#/notastudent/viditra-team`
   → "This device is marked as team." The mark lives beside `pm_device_id` in localStorage,
   rides every telemetry batch and every sync, and sticks to the device server-side.
   `…/notastudent/viditra-team/off` reverses it. A wrong word does nothing.
   The word is `ANSWER_BOOK_STAFF_WORD` at build time (default `viditra-team`);
   change it and redeploy the site to rotate it.
2. **Sign in with a listed Google account.** `ab_accounts_internal` holds the team's emails
   (founder ×2 + Razorpay account holder seeded). Any device that signs in as one is marked the
   moment `ab_link_device` runs. Add a friend:
   ```sql
   insert into ab_accounts_internal (email, note) values ('friend@gmail.com', 'friend') on conflict do nothing;
   ```
3. **The dashboard's device table** — "mark team" / "not team" per row. This is the catch-all
   for a cleared browser or an incognito visit, and it re-stamps that device's history too.

**Cleared site data = a new device.** Incognito or "clear browsing data" mints a fresh
`pm_device_id` with no mark; it will count as a student until you do 1, 2 or 3 again.

## 3. The token

```sql
select value from ab_admin_config where key = 'stats_token';   -- dev project dxwpkjfypzxrzgbevfnx
```
Paste it once into the dashboard; it stays in that browser's localStorage. Rotate with
`update ab_admin_config set value = replace(gen_random_uuid()::text,'-','') where key='stats_token';`.
The table has RLS on and zero policies — the anon key cannot read it, and the page ships no
Supabase key at all: everything goes through the `answerbook-stats` Edge Function.

## 4. The pieces

| Piece | Where |
|---|---|
| Events (one row each) | `ab_events` — `device_id`, `session_id`, `visit_id`, `event_type`, `happened_at` (client clock), `props`, `is_internal` |
| The flag | `ab_devices.is_internal` + `ab_accounts_internal` (by email) → `ab_device_is_internal(device)` |
| Writers | page `Vidi.log()` → `answerbook-vidi-chat` `{type:'events'}` → RPC `ab_log_events` (stamps the flag); `answerbook-sync` → `ab_sync(..., p_internal)` |
| Reader | `website/admin/answers.html` → `answerbook-stats` → RPC `ab_stats(token, since, include_internal)` / `ab_mark_internal(token, device, on)` |
| Migration | `supabase_2026_08_28_answerbook_events.sql` (applied 2026-08-28 — **DO NOT RE-RUN**, see its header) + `supabase_2026_09_02_answerbook_ledger_actor.sql` (the actor split; create-or-replace only, safe to re-run) |

Events the page sends (all through `Vidi.log`, so the offline build sends none):
`app_open` (once per page load: track, year, referrer host, viewport, signed_in, newdev) ·
`door_choose` · `track_interest` · `cat_subject` / `cat_unit` / `cat_qtype` / `cat_search` ·
`open_q` (qid, cut, unit, subject) · `advance` (qid, step, i, n — depth of read) · `step_jump` ·
`restart` · `soon_tap` (a tap on an unwritten card = demand) · `stage` · `ask_answer` (the "Not yet") ·
`chip` · `vidi_open` / `vidi_close` / `vidi_ask` (length only, never the text) / `vidi_mic` ·
`plan_implemented` / `plan_rescoped` · `rename*` · `exam_eve` · `lock_wall` / `unlock_free` /
`pay_start` · `sign_in_start` / `sign_in_done` · `dwell` (1/min visible) · `page_leave` · `err` (≤10/page) ·
`team_mark`.

Free-text Vidi questions are NOT in `ab_events` — the text lives in `ai_usage_log`
(`task_type='answerbook_vidi_chat'`). That table still has no device column, but since 2026-09-02
every row carries an `actor`, so the model-ledger line now separates students from the team and
from automated tests. See §7.

## 5. Deploy order (when any of this changes)

0. **Never re-run `supabase_2026_08_28_answerbook_events.sql`** — it drops the `ab_sync` overload
   (ambiguous PostgREST call = progress sync dies for every device) and its section 10 would mark
   every device alive today, students included. Read its header banner before touching it.
1. Migration first (`apply_migration` on the dev project) — every RPC is additive/defaulted, so
   the old functions keep working against the new SQL. The `..._ledger_actor.sql` file is
   create-or-replace with an unchanged signature: safe to re-run, no DDL, no data touched.
2. Edge Functions: `answerbook-stats` (new), `answerbook-vidi-chat`, `answerbook-sync` — all
   `--no-verify-jwt`. The Supabase MCP connector's `deploy_edge_function` works from Claude Code;
   the local CLI is logged into the wrong org (`answer_book_hosting.md`).
3. Site: `npm run deploy:answers` (bakes `PM_STAFF_WORD`, ships the instrumented `notebook.js`).
4. Dashboard: `npm run deploy:cf-site` (the `viditra` Worker serves `website/`, so `/admin/answers`).

**Origin allowlist:** `viditra.co` is in every function's DEFAULT list. If the
`AB_ALLOWED_ORIGINS` secret is ever set, it REPLACES the list — include
`https://viditra.co,https://www.viditra.co` or the dashboard 403s.

## 6. Verify after a deploy (the negative control)

1. Fresh incognito window → open the book → the dashboard (7 days) shows 1 more device.
2. In that window open `#/notastudent/viditra-team` → refresh the dashboard → that device is gone
   from the headline and "Excluded" went up by one. **If the number does not move, the exclusion
   does not work.**
3. Tick "show team devices too" → it is back, tagged `team`.

## 7. The AI cost ledger — `actor` (added 2026-09-02)

The device flag above covers the DASHBOARD. It never covered the MONEY: `ai_usage_log` has no
device column, so until 2026-09-02 every Vidi ask — the founder's, a teammate's, and every
automated Claude probe — was written as `actor: 'answerbook_student'`. Measured that day: of 80
rows, **45 were script probes and 10 more were browser sessions on a team device's network. 25 were
real.** The dashboard said 80.

`answerbook-vidi-chat` now stamps one of four actors on every row, with
`metadata.actor_reason` recording which signal decided it:

| `actor` | `actor_reason` | Set when | Trustworthy? |
|---|---|---|---|
| `answerbook_student` | `none` | nothing else matched | the honest default |
| `answerbook_team` | `device_flag` | `ab_device_is_internal(device_id)` — the `#/notastudent` mark, a team Gmail, or the dashboard toggle | **yes**, server-side state |
| `answerbook_team` | `client_claim` | the page sent `internal: true` | no — forgeable |
| `answerbook_local` | `origin_localhost` | request `Origin` is localhost/127.0.0.1 | no — forgeable |
| `answerbook_probe` | `probe_token` | body carries `probe_token` == the `AB_PROBE_TOKEN` secret | the secret is not public |

**Two rules, and they are load-bearing:**

1. **The actor is a LABEL, never a GUARD.** The $2/day spend cap and the per-IP limits still read
   the WHOLE ledger, every actor included. A team ask costs the same dollar a student's does.
   Never add an actor filter to `readTodayLedger()` — that would quietly raise our own rate limits
   and hand anyone who forges the flag a free budget.
2. **The all-actors total is never hidden.** The dashboard prints `everything: N ($X)` beside the
   student-only figure, precisely because three of the four signals are forgeable. If team rows
   could vanish from that line, a forged claim would hide real spend from the page that watches it.

### Automated testing must carry the probe token

```bash
# PowerShell
$env:AB_PROBE_TOKEN = "<the secret>"; npm run vidi:shakedown
```

`vidi_shakedown.ts` and `vidi_audit.ts` **refuse to run** against a `*.supabase.co` endpoint when
`AB_PROBE_TOKEN` is unset, rather than silently filing the run as student demand. Any hand-rolled
`curl` against the live function must include `"probe_token": "<secret>"` in the body — without it
the ask is counted as a real student, and that is exactly how the 45 rows above happened.

The token labels; it does **not** exempt. A live probe run still eats the per-IP 40/day and pushes
the $2/day global cap, so it degrades the product for real students while it runs — **don't run a
live probe during school hours.** Rotate with `supabase secrets set AB_PROBE_TOKEN=...`; a token
shorter than 16 characters is ignored, so an unset secret shuts the door rather than opening it.

### Serving a hosted build locally

`serve:answers` on `localhost:8100/8101` is in every function's origin allowlist, so it is
production traffic. It is now auto-classified: the ledger row is `answerbook_local`, and both the
sync push and the event batch mark the device internal. Nothing to remember.

### Playwright against the LIVE site

Any script that opens `answers.viditra.co` in a real browser mints a device per context —
`answer-book/tools/out/door_walk.mjs` mints two per run. Mark them before the first page load:

```js
const ctx = await browser.newContext();
await ctx.addInitScript(() => { try { localStorage.setItem('pm_internal', '1'); } catch (e) {} });
const page = await ctx.newPage();          // now this device is team from its very first sync
```

The bot user-agent check in `answerbook-sync` is a coarse second net (modern headless Chrome does
not advertise itself), so this line stays the reliable path.

### Mark, never delete

The old habit was to DELETE team rows from `ab_devices` (recorded twice in PROGRESS.md). Stop:
deleting loses the entitlement and progress rows that hang off the device, and it cannot be undone.
Mark instead — it is reversible, and it re-stamps the device's history in `ab_events`.

## 8. The one-time cleanup (founder-gated — run ONCE, after the deploy)

Written 2026-09-02 with the counts measured that day. **Run the dry-run first and compare;** if the
numbers have moved, the historical set has changed and the lists below need re-deriving.

### 8a. Dry run — see it before you change it

```sql
select actor, session_id, count(*) as rows, min(created_at)::date as first, max(created_at)::date as last
  from ai_usage_log
 where task_type = 'answerbook_vidi_chat'
 group by 1, 2 order by 3 desc;
```
Expected on 2026-09-02: 80 rows, all `answerbook_student`, across 27 session ids.

### 8b. Label the automated probes

**By an explicit list, never by a regex on the session id.** The page mints
`'ab_' + Math.random().toString(36).slice(2,10) + …`, and `toString(36)` is **not fixed width** —
`^ab_[a-z0-9]{12}$` matches all nine of today's browser sessions but would eventually relabel a real
student as a probe, corrupting the one number this exercise exists to produce.

```sql
update ai_usage_log
   set actor = 'answerbook_probe'
 where task_type = 'answerbook_vidi_chat'
   and actor = 'answerbook_student'          -- idempotent: a re-run is a no-op
   and session_id in (
     'shakedown', 'oob_live_probe', 'senior_audit_probe', 'persona_verify', 'preflight',
     'probe', 'final', 'live3', 'livecheck_deploy', 'livecheck-1', 'deploy_verify',
     'deployverify', 'deploy-verify', 'deploy-verify-2', 'deploy-verify-2b',
     'deploy-verify-2b-oob', 'verify-slice-live', 'verify-stepid-live'
   );
```
Expected: **45 rows.**

### 8c. Label the team's own browser sessions

An `ip_hash` is a household or a CGNAT range, **not a person** — so read the list before running it,
and drop any session you do not recognise as yours.

```sql
-- look first
select session_id, count(*), min(created_at)::date, max(created_at)::date
  from ai_usage_log
 where task_type = 'answerbook_vidi_chat' and actor = 'answerbook_student'
   and metadata->>'ip_hash' in (select ip_hash from ab_devices where is_internal)
 group by 1 order by 2 desc;

-- then, for the ones you confirm are yours:
update ai_usage_log set actor = 'answerbook_team'
 where task_type = 'answerbook_vidi_chat' and actor = 'answerbook_student'
   and session_id in ( /* the confirmed ids */ );
```
Expected on 2026-09-02: **10 rows**, leaving **25** as genuine students.

### 8d. Devices that share a network with a probe session

Founder-approved 2026-09-02. Reversible from the dashboard with one click, so a wrongly caught
student is a small, visible mistake rather than a silent one.

```sql
-- count first (expected 14)
select count(*) from ab_devices
 where not is_internal
   and ip_hash in (select distinct metadata->>'ip_hash' from ai_usage_log
                    where task_type = 'answerbook_vidi_chat' and actor = 'answerbook_probe');

update ab_devices set is_internal = true
 where not is_internal
   and ip_hash in (select distinct metadata->>'ip_hash' from ai_usage_log
                    where task_type = 'answerbook_vidi_chat' and actor = 'answerbook_probe');
```

**Never `delete` from `ab_devices`** — it takes the entitlement and progress rows with it. Mark.
