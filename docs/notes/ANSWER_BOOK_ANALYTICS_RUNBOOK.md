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

**Counting started 2026-08-28.** Every device that existed before the migration ran (28 of them,
all the team's testing) is marked internal. Nothing before that day is a student.

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
| Migration | `supabase_migrations/supabase_2026_08_28_answerbook_events.sql` (applied 2026-08-28) |

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
(`task_type='answerbook_vidi_chat'`), which has no device id, so the dashboard's model-ledger
line includes the team.

## 5. Deploy order (when any of this changes)

1. Migration first (`apply_migration` on the dev project) — every RPC is additive/defaulted, so
   the old functions keep working against the new SQL.
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
