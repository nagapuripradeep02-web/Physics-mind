# Solution Generator — architecture for the Solutions tab (v1 draft, 2026-09-11)

> Founder decisions, 2026-09-11, that this document implements: **EAPCET text questions → DeepSeek V4.1 Flash `high` (maths `max`), one call, with a second opinion only on triggers; questions with a figure, graph, circuit or drawn structure → Gemini 3.7 Flash and DeepSeek `high` in parallel with the agreement gate; one cheap intake call that transcribes, classifies and fingerprints the photo for the bank and the cache.** Companion documents: `docs/MODEL_PROBES.md` (Runs 1–13, ~3,000 calls — every number below cites its section), `docs/SOLUTION_REVIEWER_ARCHITECTURE.md` (the reviewer consumes this generator's output as its reference solution), `docs/PRODUCT_GAPS_AND_BANK_STRATEGY.md` (the bank plan).
>
> The bar: **never a confident wrong answer.** Every answer carries one of three labels — *checked two ways*, *checked once*, *unsure (two workings)* — and the label is decided by code, not by a model. Anything not measured is marked *assumption*.

## 1. Scope

The photo path of the Solutions tab ("doubt desk", `eapcet-app/js/84_solutions.js` on the app desk `C:\Tutor\physics-mind-eapcet-app`, branch `feat/eapcet-app`): a student photographs one question from any material and asks for the solution. Today that flow ends in an honest "not available yet" card; the typed-question path (`58_match.js`, on-phone match against the public pool → the fix page) is unchanged by this design.

EAPCET first. JEE Main differs in one place: DeepSeek is weak on JEE organic chemistry even as text (22/29 vs Gemini 28/29, §18), so on JEE the chemistry route goes to Gemini regardless of figure. NEET is untested.

Out of scope here: the reviewer (own doc), multi-page or multi-question photos, Telugu/Hindi explanations, the JEE bank.

## 2. The pipeline

```
photo ─► S0 client ─► S1 intake (Flash-Lite) ─► S2 bank + cache ─┬─ hit ───────────────────────────► S8 respond
                                                                └─ miss ─► S3 route ─► S4 triggers ─► S5 arbiter ─► S6 conventions ─► S7 syllabus ─► S8 respond ─► S9 persist
```

### S0 — Client
`86_photo.js` already downscales to 1600 px JPEG q0.8 and posts under the 1.5 MB body cap. The page shows progress states ("reading the question", "solving", "checking a second way") because the honest latency is 5–25 s (§4).

### S1 — Intake: read, classify, fingerprint (one cheap call)
Gemini 3.5 Flash-Lite, structured JSON via `RESPONSE_SCHEMA`:
`{question_text, options[], subject: physics|chemistry|maths|other, has_figure: bool, figure_kind: graph|circuit|structure|diagram|none, legible: 0–1, questions_in_frame: n}`.
- **Fingerprint** = SHA-256 of the normalised question text + options (lower-case, whitespace and punctuation collapsed, digits kept). This is the key for the bank lookup, the cache, and the reviewer's later reference.
- Cost: reader calls on Flash-Lite measured $0.0015 per photo (§16); a short classification output should be under $0.001. Latency: *assumption* 2–4 s (Run 7's Flash-Lite calls averaged 20 s only because they wrote long transcripts; the intake output is ~200 tokens) — measure.
- Reject early: `legible < 0.5` → "retake the photo", no read consumed; `questions_in_frame > 1` → "crop to one question".
- **Why not skip S1 and send everything to the strong model?** Because S1's transcript is what the bank and cache key on, and a hit costs nothing; S1 pays for itself the first time two students in one batch send the same page.
- Measurable before ship: `has_figure` accuracy on the 238 labelled probe photos (148 figure, 90 text) already on disk under `pdfs/probes/`. Target ≥ 97%; a figure misrouted to the text path still gets a DeepSeek answer at the text label, so the failure is soft.

### S2 — Bank and cache (free answers first)
1. **Exact bank hit**: fingerprint or near-verbatim match (Jaccard ≥ 0.9 on tokens, same subject) against the EAPCET bank (4,159 PYQs with official keys and chapter; `ep_solutions` where a verified working exists). EAPCET 2025 reused earlier years' questions verbatim — 4 of 60 sampled had a near-identical twin (§23) — so this path is real. The response cites the source ("same as TS EAPCET 2023, 13 May FN, Q 51") and uses the verified key; if the bank row has no working yet, the model path runs but the bank key decides the label (a model answer that matches a verified key is *checked two ways* by construction).
2. **Cache hit**: `ep_solve_cache` by fingerprint (new table, §3). Students in one batch send the same material; the second student is free and gets the same answer.
3. **Related bank questions** (Jaccard 0.6–0.9 or top BM25 in the same chapter) are attached as `similar[]` for the "try a similar one" step — never as evidence for the answer (Run 12: keys-only examples did not lift accuracy, §23).

### S3 — Route and solve
| route | trigger | model | measured on EAPCET | $ per question | latency |
|---|---|---|---|---|---|
| text | `has_figure = false` | DeepSeek V4.1 Flash `high` (`max` for maths) | physics 29/30 (the miss is a wrong official key), chemistry 29/30, maths 30/30 (§5) | $0.0007–0.0016 (§5) | avg 10–15 s, p95 19–49 s |
| figure | `has_figure = true` | Gemini 3.7 Flash **and** DeepSeek `high`, in parallel | Gemini: physics 27/30 (+1 wrong key), chemistry 30/30; DeepSeek: 26 and 28 (§18) | $0.005–0.007 + $0.003 ≈ $0.009–0.010 | Gemini 5 s; DeepSeek 25–30 s avg, p95 60 s |

Prompt: the student's own one-line ask ("Please solve this question") plus a syllabus clause (§7) — the probes measured exactly this input, not a long system prompt. DeepSeek thinking cap **12,000 tokens** (`EP_SOLVE_THINK_CAP`): figure questions average 4–6k thinking tokens (§10–11); the 32,000 cap was hit by 6 of 480 figure calls and by hard text items (§20), always returning nothing. A hit cap is a trigger (S4), never a blank answer.

### S4 — Second-opinion triggers on the text route
DeepSeek is at ~99% on EAPCET text, so a second model on every text question would multiply cost by five to catch about one question in a hundred (§22). Instead the second model (Gemini 3.7 Flash) runs only when a signal fires — all detectable in code at $0:
- no clean final option in the answer (the arbiter's extractor returns none or two);
- hedging ("option 2, or 3 depending on…") — measured on both models (§20);
- thinking cap or timeout hit;
- the transcript names a drawn structure, reaction scheme or graph that S1 did not flag (chemistry safety net — the drawing-reading failures are DeepSeek's known weakness, §13);
- the subject is chemistry organic on JEE (always, §1).

### S5 — Arbiter (code decides the label)
Final-option extraction carries every lesson from the probes' hand grading (§6, §10, §18 `hand.json` files): the last-stated option wins; option named by its text or by a 2023-style 11-digit option ID → ordinal; integer answers compared by value with 1% tolerance (`numberOf`/`matchOption` already in `ep-photo-read`); "1.93 × 10⁵" vs an exam integer key; a hedge counts as no answer.

| situation | label | what the student sees |
|---|---|---|
| two solvers (or a solver and a verified bank key) agree | **checked two ways** | the answer, the working |
| one solver answered cleanly, no trigger fired (text route) | **checked once** | the answer, the working, "checked once" |
| second opinion ran and disagrees, or a trigger fired and could not be resolved | **unsure** | no verdict; both workings; "this one is hard — two solutions reach different answers; check with your teacher or the key" |

Measured basis (§22): on the 148 hardest questions the two solvers agreed 129 times and were right **129 of 129**; the 17 disagreements contained every wrong answer. The known hole is a shared wrong *convention* — S6.

### S6 — Convention pass (our code, $0)
Exam conventions the models get physically right and the exam marks wrong (§20, the capacitor error: every model computes the quadrature error 0.01; EAPCET wants the summed relative error 0.023):
- error propagation = sum of relative errors (EAPCET);
- significant figures and rounding to the printed options;
- g = 10 m/s² unless the question gives g;
- unit and prefix normalisation before option matching.
When a convention rule changes the option, the response says so in one line ("EAPCET uses the summed-error rule here, which gives 0.023 → option 3"). The library starts with these four and grows only from measured misses.

### S7 — Syllabus post-check
The Run 13 judge (DeepSeek, thinking off, JSON; $0.0001; 0 of 506 stored solutions flagged; positive control 4 of 4 planted beyond-syllabus solutions flagged, 2 of 2 within passed — §24) runs on every model-generated working. A flag regenerates the working once with the flag quoted in the prompt; a second flag ships the answer with the working replaced by the bank's similar-question pointer. Expected rate: ~0 on exam questions; kept on because a student's free-text ask can pull a model off-syllabus.

### S8 — Response contract
```json
{ "ok": true, "source": "bank" | "cache" | "model",
  "label": "two_ways" | "once" | "unsure",
  "option": 3, "answer": "0.9 ± 0.023 µF",
  "working": [ { "step": 1, "text": "…", "tex": "$…$", "kind": "line" | "cont" | "note" }, … ],   // the answer sheet: tex typeset, text the plain twin; both workings when unsure
  "answer_tex": "$…$" | null, "format": "tex" | "plain",
  "conventions": [ "EAPCET summed-error rule applied" ],
  "similar": [ { "qid": "tg_eapcet_2023_…_q051", "chapter": "…" } ],
  "models": [ { "model": "deepseek-flash", "effort": "high", "option": 3, "ms": 11200 }, … ],
  "reads_left": 17, "cost_usd": 0.0031, "ms": 12800 }
```
Failure replies mirror `ep-photo-read`: `{locked:true}` (not entitled), `{ok:false, reason: "cap" | "busy" | "down" | "unreadable" | "many_questions"}`; `down` and `unreadable` consume no read. A **"report wrong"** tap posts `{fingerprint, option, label}` to `ep_events` and a row to `ep_solve_reports` — the review queue a human clears, and the cache row is marked `disputed` until then.

### S9 — Persist and telemetry
- `ep_solve_cache` upsert by fingerprint (the image is never stored — same rule as `ep-photo-read`).
- `ai_usage_log`: one row per model call, `task_type = 'eapcet_solve'`, `estimated_cost_usd`, metadata `{route, model, effort, thoughts, ms, image_bytes}` — never the image or the question text.
- `ep_events`: one `solve` row per request with `{source, label, route, ms, reads_left}`.

## 3. Function and data contract

**New edge function `ep-solve`**, cloned from the `ep-photo-read` skeleton so the tested paths are reused unchanged: origin allowlist (`EP_ALLOWED_ORIGINS`), body cap, entitlement (`ep_entitlements`, `unit_key = all`, device linked to the user by `ab_link_device`), per-device daily cap, daily spend cap, per-IP per-minute cap, hashed IP, `ai_usage_log` ledger, `ep_events` telemetry, probe token, 503 → `down`.

| env | default | meaning |
|---|---|---|
| `EP_SOLVE_INTAKE_MODEL` | `gemini-3.5-flash-lite` | S1 |
| `EP_SOLVE_TEXT_MODEL` / `EP_SOLVE_TEXT_EFFORT` | `deepseek-flash` / `high` (`max` when subject = maths) | S3 text |
| `EP_SOLVE_FIGURE_MODEL` | `gemini-3.7-flash` | S3 figure (paired with the text model at `high`) |
| `EP_SOLVE_THINK_CAP` | `12000` | DeepSeek thinking budget |
| `EP_SOLVE_MODEL_TIMEOUT_MS` | `45000` | per call |
| `EP_SOLVE_PAIR_WAIT_MS` | `25000` | how long to wait for the slower solver before degrading to *checked once* |
| `EP_SOLVE_PER_DAY` | `20` | per device, launch value; see §6 for the monthly-allowance recommendation |
| `EP_SOLVE_DAILY_USD_CAP` | `2` | project-wide stop |
| `EP_IP_PER_MIN` | `4` | as today |
| `DEEPSEEK_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY` | — | secrets on the project; the Google key's project must be on the paid tier (§14: the free tier caps each model at a handful of requests per project per day) |

**Tables (one migration):**
- `ep_solve_cache(fingerprint text pk, subject, has_figure bool, question_text, options jsonb, option int, answer text, working jsonb, label text, source text, models jsonb, conventions jsonb, similar jsonb, hit_count int, disputed bool default false, created_at, updated_at)`.
- `ep_solve_reports(id, fingerprint, device_id, option_shown, label, note, created_at, resolved_at, resolution)` — the human review queue.

**Request:** `{device_id, access_token?, image_base64, media_type, session}` — same shape as the photo read, plus an optional `typed_text` for the typed path if it ever needs the model (not in v1).

## 4. Latency budget and the wait rule

| path | expected | worst measured |
|---|---|---|
| bank / cache hit | S1 only: ~2–4 s (*assumption*) | — |
| text, no trigger | S1 + DeepSeek `high`: 12–20 s | p95 49 s on maths (§5) |
| text, trigger fired | + Gemini 5 s | — |
| figure pair | S1 + max(Gemini 5 s, DeepSeek 25–30 s) ≈ 12–35 s | DeepSeek p95 60–105 s on figures (§10–11) |

Wait rule: after `EP_SOLVE_PAIR_WAIT_MS` (25 s) with Gemini's clean answer in hand and DeepSeek still running, respond *checked once* with Gemini's working and let DeepSeek finish in the background to upgrade the cache row. The thinking cap is what keeps the tail short: the 60–105 s figures were the 32,000-token cases.

## 5. Failure modes

| failure | behaviour |
|---|---|
| DeepSeek runaway (cap hit, no answer) | trigger → Gemini; label *checked once*; never a blank |
| Gemini 503 / 429 | text route unaffected; figure route → DeepSeek alone, *checked once* |
| both models down | `reason: "down"`, no read consumed (as the photo function does today) |
| unreadable photo | `reason: "unreadable"` from S1, no read consumed |
| two questions in frame | `reason: "many_questions"` with the crop hint |
| solvers disagree | *unsure*, both workings, no verdict — by design, not a failure |
| our answer differs from the student's printed key | the working is shown with "our working differs from the printed key — here is why"; three official EAPCET keys were found wrong this way in 300 questions (§5, §10, §18), so the flow must exist and must be right when used; a "report wrong" tap routes it to a human |
| shared wrong convention | S6; the library grows from confirmed reports |

## 6. Cost

Measured per-question costs, off-peak (DeepSeek doubles in its peak windows, 01–04 and 06–10 UTC weekdays = 06:30–09:30 and 11:30–15:30 IST; Gemini has no peak):

| path | $ per question |
|---|---|
| bank / cache hit | ≈ $0.001 (intake only) |
| text, DeepSeek alone | $0.001–0.002 (+ intake) |
| text with a triggered second opinion (~5% of text, *assumption*) | + $0.005 |
| figure pair | $0.009–0.010 (+ intake) |
| syllabus post-check | $0.0001 |
| **blended, EAPCET mix ≈ 4 text : 1 figure, no bank hits** | **≈ $0.003 → $3 per 1,000 (≈ ₹250)** (§22) |

Cap: 20 a day per device holds launch cost under $0.06 per student-day worst case. §22 of `MODEL_PROBES.md` recommends replacing it with a monthly allowance (e.g. 400 photos) so a mock-review day is not blocked; that is a pricing decision, not part of this build.

## 7. Prompts, in one place

- **Ask**: the student's own line ("Please solve this question") — this is what every score was measured on.
- **Syllabus clause** (system): "Use only methods in the NCERT Class 11–12 syllabus and the standard techniques EAPCET/JEE Main coaching teaches. Do not use university-level methods (Lagrangian mechanics, Laplace/Fourier transforms, residues, Jacobians, matrix exponentials, group theory, reagents outside NCERT)." Measured need: ~0 (§24); kept as a guard.
- **Format clause** (rewritten 2026-09-11 after the founder's first test — the v1 "numbered steps, plain English, no LaTeX" rule produced a hint list, not a solution): the working is written exactly as a top student writes on the answer sheet — one line of mathematics per line (the given values, the formula or principle, the substitution with the numbers, the result), a continuation line starts with `=` or `\Rightarrow`, words only where a student would write them ("Given:", "By energy conservation,", "Let t = sin x"), never an instruction or commentary to the reader ("Write", "Use", "Cancel", "Now", "We", "You"), every expression in `$…$` on one line, no `$$`/`\[ \]`/`aligned`/`\ce{}`, no headings, bullets, bold, numbering or tables; the final option stated once on its own last line as "Answer: option N" (or "Answer: $<value with unit>$") — this is what makes S5's extractor reliable; hedges are still detected. For the "explain" ask one extra clause allows a student's margin note before each block of lines. The parser (`toLines`) returns `{step, text, tex, kind}` per line — `tex` as written, `text` the plain-text twin for the cache, the judge and the phone's fallback — and the ledger counts `instr_lines` (lines that talk to the reader), the number §8 reads; `EP_SOLVE_FORMAT=plain` restores the v1 rule. The page typesets `tex` with KaTeX from a CDN and falls back to `text`.
- **Intake schema** (S1) and the **syllabus judge prompt** (S7) are copied from `scripts/model_probes/syllabus_sweep.py` and the intake spec above, and versioned; any change re-runs the positive control (§24).

## 8. Measurement gate before ship

Same discipline as Runs 1–13; results append to `docs/MODEL_PROBES.md` as their own run:
1. **Intake**: `has_figure` and subject accuracy on the 238 labelled probe photos; the fingerprint is stable across the four ask variants and across the phone-photo effect (same question → same key).
2. **End to end** through the deployed `ep-solve` on the 358 probe photos (EAPCET text 90, EAPCET figures 60, JEE 90 + 60 as the JEE preview): targets **text ≥ 98%, figures ≥ 96%, unsure ≤ 8%, confident-wrong = 0 on the disputed-key items**, cost per question within 20% of §6, p95 latency ≤ 35 s.
3. **Caps and entitlement** proved on a TEMP `ep_entitlements` grant for a throwaway device — never the founder's — exactly as the photo function was proved (21st read refused, IP cap `busy`, 503 → `down` consumes nothing).
4. **Cache**: the same photo twice → second reply `source: cache`, no model row in `ai_usage_log`.
5. **Real phone photos**: 30 photos of printed coaching material taken on a phone (glare, angle, a thumb) — the first measurement off typeset crops; expect the numbers to move.

## 9. Build order (on the app desk, not master)

1. Migration `supabase_2026_09_1x_eapcet_solve.sql`: `ep_solve_cache`, `ep_solve_reports`; extend `ep_sync` only if the page must carry solve history (v1: no).
2. `supabase/functions/ep-solve/index.ts` from the `ep-photo-read` skeleton; the DeepSeek client is the only new transport (OpenAI-compatible `chat/completions`, `thinking` + `reasoning_effort`, data-URL image — as in `scripts/model_probes/ds_probe.py`).
3. `eapcet-app/js/84_solutions.js`: the photo flow posts to `EP_SOLVE_BASE`; render the three labels, both workings on *unsure*, the "report wrong" tap, `reads_left`.
4. `e2e/eapcet_solve.spec.ts` on a stubbed function; `smoke:eapcet` stays green.
5. The measurement gate (§8); then the preview worker; then the founder walks it on a real phone.

## 10. Deferred

JEE routing table (chemistry → Gemini), multi-question and multi-page photos, Telugu/Hindi "explain again", streaming partial workings, the reviewer's pipeline (own doc — it starts from this response's `working[]` as its reference), retrieval of *worked* bank solutions once the bank has them (§23), the monthly allowance.
