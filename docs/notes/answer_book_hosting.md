# Answer Book hosting runbook — turning Vidi's live chat on

**Status:** prepared 2026-08-22 (Vidi Rungs 1+2 build). Nothing here has been run —
every step below is founder-gated (Rule 17).

## What exists after the Vidi build

- `npm run build:answers` — the DEFAULT build. `PM_VIDI_BASE = ""` → deterministic
  Vidi only (greeting, chips, triage, exam-eve, check verdict, rename), zero network,
  fully offline. This is the copy that stays emailable/WhatsApp-able as one file.
- `npm run build:answers:hosted` — same page with the chat base baked in
  (`https://dxwpkjfypzxrzgbevfnx.supabase.co/functions/v1/answerbook-vidi-chat`,
  override with `ANSWER_BOOK_VIDI_BASE`). This copy shows the free-text "Ask" row
  and flushes telemetry — it only works when served from an allowlisted origin.
- `supabase/functions/answerbook-vidi-chat/index.ts` — the Edge Function (sibling of
  Quick Learn's `quicklearn-chat`, its own `task_type=answerbook_vidi_chat` ledger,
  own $2/day cap, 4/min + 40/day per hashed IP, fail-closed; `{type:'events'}`
  telemetry batches land in `simulation_feedback`).

## Testing the persona without deploying anything

```
npm run vidi:server        # terminal 1 — localhost mirror, byte-identical PERSONA, uses .env.local DEEPSEEK_API_KEY
npm run vidi:shakedown     # terminal 2 — 15 probes → .answerbook_logs/shakedown.md
```
Cost ≈ ₹0.31 a run (measured ₹0.021/question). **Re-run this after ANY persona edit** — the
33 e2e gates cannot see persona defects; the first run found four, including an English
question answered in romanised Telugu. If you change the persona, change it in BOTH
`supabase/functions/answerbook-vidi-chat/index.ts` and `src/scripts/answerbook_vidi_server.ts`
(no shared import across runtimes — same discipline as the Quick Learn desk). Parity check:

```
node -e "const f=require('fs');const g=p=>{const s=f.readFileSync(p,'utf8');const i=s.indexOf('const PERSONA = [');return s.slice(i,s.indexOf(\"].join('\",i)).replace(/\r/g,'')};console.log(g('supabase/functions/answerbook-vidi-chat/index.ts')===g('src/scripts/answerbook_vidi_server.ts'))"
```

## Founder steps, in order

1. **Deploy the Edge Function.** ⚠ Verified 2026-08-22: this machine's supabase CLI is signed
   into the **`automation-copilot-dev`** account — `npx supabase projects list` returns only that
   org, so a deploy at `dxwpkjfypzxrzgbevfnx` 403s. And `supabase login` CANNOT be done through
   Claude Code's `!` prefix (non-TTY — the browser handshake dies; standing scar). Two working
   routes:

   **a. Dashboard (simplest):** Supabase → project `dxwpkjfypzxrzgbevfnx` → Edge Functions →
   *Deploy a new function* → name it exactly `answerbook-vidi-chat`, paste the contents of
   `supabase/functions/answerbook-vidi-chat/index.ts`, and turn **JWT verification OFF**.
   Set the secret in the same place (Edge Functions → Secrets) — this is where Quick Learn's
   `DEEPSEEK_API_KEY` already lives, so it may be present project-wide already.

   **b. A real terminal window** (not `!`, not this session):
   ```
   npx supabase login                      # browser handshake — needs a real TTY
   npx supabase functions deploy answerbook-vidi-chat --no-verify-jwt --project-ref dxwpkjfypzxrzgbevfnx
   npx supabase secrets set DEEPSEEK_API_KEY=sk-... --project-ref dxwpkjfypzxrzgbevfnx
   ```

   With no key set the function refuses politely at zero cost — safe to deploy first.

2. **Local verification** (before any student link) — run the shakedown above against the DEPLOYED
   function too (`VIDI_ENDPOINT=<function-url> npm run vidi:shakedown`, origin allowlist permitting),
   then the page itself: `npm run build:answers:hosted`
   then `npm run serve:answers` → http://localhost:8100 (already in the default
   allowlist). Ask a free-form question; confirm the reply, the `ai_usage_log` row
   (`task_type=answerbook_vidi_chat`), and telemetry rows in `simulation_feedback`
   (`interaction_data.surface = 'answer_book'`).

3. **Host the page.** The dist is ONE file (`answer-book/dist/index.html`). Put it in
   the existing Cloudflare site flow (e.g. `viditra.co/answers/`). Then set the real
   origin in the function's allowlist (the secret REPLACES the default list — include
   localhost again):
   ```
   supabase secrets set AB_ALLOWED_ORIGINS=https://viditra.co,https://www.viditra.co,http://localhost:8100,http://127.0.0.1:8100 --project-ref dxwpkjfypzxrzgbevfnx
   ```

4. **Send the cohort link.** The exam-eve deep link for the 6 a.m. WhatsApp message is
   `<hosted-url>/#/exam-eve/<unit-number>` (e.g. `…/#/exam-eve/8` before the
   Oscillations exam).

## Standing cautions

- The `website/` tree in some desks diverges from the office's uncommitted marketing
  edits — reconcile before any `deploy:cf-site` (recorded scar).
- The emailed `file://` copy can never use chat (no verifiable origin — deliberate).
  Deterministic Vidi works fully there; the ask row hides itself.
- Guard budgets are env vars: `AB_DAILY_USD_CAP` (default $2/day), `AB_IP_PER_MIN` (4),
  `AB_IP_PER_DAY` (40). Raise deliberately, never by default.
