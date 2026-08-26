# Vidi — the AI companion for the IPE Answer Book (design)

**Date:** 2026-08-22 · **Status:** RUNGS 1+2 IMPLEMENTED (2026-08-22) — Rung 3 (voice/photo
check) deliberately not built (founder call). Implementation notes: the deterministic layer +
flag-gated chat live in `answer-book/notebook.js` (`Vidi`/`VidiPanel`), the Edge Function at
`supabase/functions/answerbook-vidi-chat/`, memory tips authored for the 3★+LAQ subset
(179 steps / 56 questions / 12 insider notes), hosting runbook at
`docs/notes/answer_book_hosting.md`. Two one-line rulings still PENDING founder signature:

> **Rule 18 amendment (proposed):** the Answer Book's live Vidi chat is a founder-approved
> amendment in the spoken-recall precedent's shape — the model presents and explains the
> authored bank, grounded in per-question ANSWER FACTS; it never writes a mark scheme, never
> decides marks, and never exists in the default offline build.
>
> **Telugu code-mix carve-out (proposed):** Rule 30i's English-only scope is the TEACHER
> product. The student-facing Vidi chat may reply in natural Telugu-English code-mix, TEXT
> ONLY (no Telugu TTS — Telugu audio stays retired); physics terms stay in English, never
> transliterated.
**Scope:** the IPE Answer Book (student-facing) ONLY. Quick Learn stays shelved; this design
*borrows* its built pieces (persona prompt, Edge Function pattern, usage logging) but builds no
Quick Learn surface. The teacher product is untouched — **Vidi never appears in the teacher app**
(Rule 24: the teacher is the voice; the persona would undercut the ₹699/mo positioning).

---

## 0. Persona shakedown — evidence (2026-08-22)

The gates prove the panel renders and the page stays offline; only real model output proves
the persona. `npm run vidi:server` (localhost mirror of the Edge Function, byte-identical
PERSONA) + `npm run vidi:shakedown` (15 probes across the §3 question taxonomy) — transcripts
in `.answerbook_logs/shakedown.md` (gitignored).

**Run 1 found four real defects**, all fixed and re-verified in run 2:

| Defect | Fix |
|---|---|
| English question answered in romanised Telugu (P13) | PERSONA: answer in the SAME language the student wrote in; Telugu only when asked in Telugu, and then in Telugu script |
| Markdown (`**bold**`) leaking into bubbles that render as plain text | PERSONA: plain text only **+** a client-side `plain()` strip in `notebook.js` (defence in depth; unit-checked, does not mangle `3 * 4`) |
| Replies up to 8 sentences vs the 2–4 rule | PERSONA: never more than 5, with the reason (a phone screen) |
| Idioms: "the trick is", "you've got this" (Rule 41) | PERSONA: named and banned, with literal replacements |

**Run 2 verdict — the safety-critical behaviours all hold:** out-of-bank question refused and
noted (never answered) · mark questions answered ONLY from the authored split · a student
claiming their teacher drops the minus sign is corrected from the bank without insulting the
teacher · abuse handled calmly · off-topic redirected in one sentence · identity admitted ·
Telugu code-mix correct (Telugu script, physics terms in English). Residual: 2 of 15 replies
ran 6 sentences (soft cap 5) — monitored, not blocking. One checker flag on P5 is a FALSE
POSITIVE: the model summed authored marks (2+1+1=4), which is legitimate; the checker only
knows per-step values.

**Measured economics (30 billed probes):** ₹0.021/question · prompt-cache hit 26/30 ·
latency p50 2.0 s / p90 3.2 s · total spend for both runs ₹0.63.

**LIVE — deployed and verified 2026-08-22.** `answerbook-vidi-chat` is deployed to
`dxwpkjfypzxrzgbevfnx` (JWT off, `--use-api`), `DEEPSEEK_API_KEY` set as a project secret
(it did NOT already exist — Quick Learn had never set it). Verified against the live URL:
foreign origin → **403** · empty question → **400** · telemetry batch → **200** and a row in
`simulation_feedback` (`surface: answer_book`) · the 4/min per-IP burst limit fires exactly as
designed (an unpaced 15-probe run trips it, which is why `VIDI_DELAY_MS` exists) · **paced
shakedown 15/15 clean, zero flags** · **19 rows in `ai_usage_log`** (`task_type=answerbook_vidi_chat`,
its own ledger) with **19/19 prompt-cache hits**, ip_hash 64-char SHA-256 and the raw IP never
stored. **Live cost ₹0.0074/question** — 3x cheaper than the local mirror because the byte-stable
context keeps the cache warm.

**Remaining before students:** host the page at an allowlisted origin (the function already
allows viditra.co / www.viditra.co / localhost:8100). Until then the chat-enabled build runs
locally: `npm run build:answers:hosted` + `npm run serve:answers`. **Run `npm run build:answers`
(default, offline) before `npm run smoke:answers`** — the offline gates assert `PM_VIDI_BASE === ""`.

## 1. Positioning — one sentence

**The bank is the brain; Vidi is the voice.** Every mark, step, star rank, `why` line, and rubric
is authored and human-verifiable (Rule 17/18 shape). Vidi presents that verified substance warmly;
a live model handles only the unpredictable tail — free-form questions and checking. Students
recommend a *character*, not "an AI feature": "Ask Vidi" is repeatable in a WhatsApp group.

The buyer is the **crammer** (vault decision 2026-08-19: students buy marks, rank, and relief from
fear — serve the cramming moment, smuggle the understanding inside it). The design consequence:
most of the crammer's questions are answered by authored data, so the core buyer is the *cheapest*
segment to serve.

## 2. The character

- **Default name: Vidi** (brand asset — ads, demo page, screenshots all say "Ask Vidi").
- **Rename after first value:** after the student's first completed self-check (never at first
  open — no naming ceremony between an impatient crammer and their first answer), Vidi asks:
  *"You can give me your own name if you want. What should I be called?"*
- **Names are display data, never identifiers.** No uniqueness check — two students both naming
  it "Chintu" is two kids with dogs named Tommy. Identity is the account underneath (later).
- **Moderation, light but real:** profanity blocklist (English + Telugu + transliterated Telugu),
  ~20-char cap, rename allowed anytime. Nothing more.
- **Storage:** `localStorage` now (same-origin surfaces share it on one device — 90% of the felt
  magic at ₹0). Moves into the account profile **at ₹199 launch**, when payments create identity
  anyway (claim-at-signup pattern exists in the teacher app). Do not build accounts earlier for
  the name alone.
- **Authoring rule, effective immediately: scripted/voiced lines never speak the assistant's own
  name.** The name lives in text/UI only (chat header, bubbles, captions). Any future pre-rendered
  clip that says "Vidi" breaks the moment a student renames her.
- **Log chosen names** — free telemetry on what relationship students want (friend / crush /
  their own name / "sir") that informs paid-tier copy.
- **Language:** replies in plain English with Telugu code-mix where natural, **text only** (no TTS
  Telugu — retired, Rule 30i). ⚠ This is a deliberate carve-out from the English-only teacher
  product ruling; needs a one-line founder ruling recorded so no agent "fixes" it back.

## 3. The three rungs (each independently shippable)

### Rung 1 — Deterministic Vidi (static, ships inside the current single-file product)

Vidi appears and talks, but every word is authored or template-rendered from data already in the
bank. No API call, no server, no key, works offline. A typing-indicator chat bubble is
indistinguishable from "the AI said it" — the friend-feeling is *what* she says and *when*.

| Moment | Trigger | Data it reads |
|---|---|---|
| Chapter triage — "do these 3 first, they come almost every year" | opening a unit | star ranks + `appearances[]` (board/year) + section types |
| Insider chip — "asked 3 times; most students lose the figure mark" | question card | `appearances[]` + one authored sentence per question (archetype-shared where possible) |
| Honest check verdict — "6/8. You dropped the figure mark and the final substitution — here's the line for each" | "Tick it myself" completion | existing client-side scoring + per-step marks (pure re-skin of what works today) |
| "How do I remember this?" | button per answer step | authored memory tips (see §7 authoring cost) |
| Exam-eve view — `#/exam-eve/<unit>`, "your weakest + the 3-star set, 15 minutes" | deep link | localStorage self-check history + star ranks. **Founder sends the link to the WhatsApp group at 6 a.m.** — no push infra; build real notifications only if the paid tier proves demand |
| The naming moment | first completed check | scripted |

### Rung 2 — Live chat (chips + free text; the flywheel)

**No empty chat box.** On every question card the Vidi panel shows tappable chips — the chips ARE
the capability list, and they teach it by being it:

> **[Will this come?] [Why this step?] [How to remember?] [How much to write?] [Check me]** … or type anything

- Chips fire the deterministic answer instantly (₹0). Tapping a step first scopes the chip to
  that step — zero typing, which matters for students who won't compose an English question.
- Free text → DeepSeek via the Edge Function pattern proven in Quick Learn (deployed v4: origin
  allowlist, 4 q/min + 40 q/day per hashed IP, global $2/day ceiling, all enforced against
  `ai_usage_log` itself; measured ₹0.025/question, 2.5 s). New work: allowlist the answer-book
  origin; per-card context = the question JSON itself (steps, `why` lines, marks, star rank,
  appearances, cut labels) — far easier grounding than Quick Learn's sims (no pixels to describe;
  the `stage`-block problem largely disappears).
- **Out-of-bank honesty:** if the question isn't in the bank, Vidi says so plainly and flags it
  ("I don't have this one yet — noted") — never improvises a mark scheme. The miss is demand
  telemetry. A crammer who memorizes one wrong answer never opens her again.
- First-run: Vidi introduces herself with the chip list — what she can do on any question — and
  what she can't.

**The flywheel (answers the cold-start question):**
1. Chips + authored moments serve the predictable ~70% free.
2. Every free-form question is logged (question text, card id, unit, cost — `ai_usage_log`,
   `task_type=answerbook_vidi_chat`). **Chip taps are logged too** — the deterministic tier also
   reports which capability matters.
3. Weekly: cluster the logged questions → common ones get authored, human-verified deterministic
   answers → migrate to the free tier.
4. Cost per student falls while quality rises; the bank grows exactly where demand proved it
   should. (The `student_confusion_log` doctrine applied to a new product.)

**The question taxonomy the design serves (crammer → topper):** importance/probability · length
for marks · what to skip / 2-days-left plan · memory · step explanation · why-lines ·
X-vs-Y confusions · check my answer · ESL vocabulary · explain in Telugu · variant forms ·
physical why (later: deep-link to sims) · EAMCET/JEE bridge · fear/planning · chit-chat (persona
guardrails + existing rate limits). Rows 1–5 are the crammer core and are authored-data answers.

### Rung 3 — Checking (voice first, photo second)

**One grader, two input adapters.** Precision comes from the architecture, not model size:
grading is never "is this physics right?" (hallucination-prone) but *"here is the verified rubric
— per step: present / partial / missing, quoting the student's own words as evidence."* A matching
task, which small cheap models do well; a quoted-evidence output makes a wrong verdict visible.
The recall rubrics already exist per question (deliberately kept out of the browser payload).

**Voice (near-free, no new model — ship first):**
1. Student speaks the answer → **Web Speech API on-device** (₹0, `en-IN` pinned) — the standing
   "cost swap" blocker, now the plan of record.
2. Transcript → rubric-match on DeepSeek → per-step verdict. ≈ ₹0.03–0.05/check.
3. Transcription noise is tolerated by design — the match works at concept level.

**Photo (two stages, deliberately separated):**
1. **Transcription stage:** vision model converts the notebook photo to text — *only* transcribes,
   never grades. Gemini Flash **paid tier** is the natural fit (the exhausted quota is the free
   tier; ballpark well under ₹0.5/image — verify current pricing before committing).
2. **Grading stage: the same rubric-matcher as voice.** One grader to maintain and calibrate.

**Four safeguards (the "really strong and precise" engineering):**
1. **Show the transcription before the verdict** — "here's what I read — is this right?" Student
   confirms/corrects, *then* Vidi grades. Converts OCR errors from silent grading mistakes into a
   visible correction step. Biggest trust protector; costs nothing.
2. **Fail honest, never confident** — unreadable → "retake closer"; uncertain step → "check this
   one yourself against step 3", never a silent award or deduction.
3. **Figure marks scoped honestly** — v1 checks *labels* present (reliable) and says "the drawing
   itself, compare against mine." No promised diagram judgment we can't deliver.
4. **Golden-set gate before any student sees it** — hand-grade ~30–50 real photographed/spoken
   answers (several founder-written with planted mistakes: dropped minus sign, missing label,
   skipped substitution). Ship only at the bar: within ±1 mark on ≥90%, zero confidently-wrong
   step verdicts. Failures fix the prompt or rubric, re-run. Precision is measured into
   existence.

**Model escalation ladder:** cheap model + rubric architecture + golden set → only if the golden
set shows systematic failure, try a mid-tier model *on the failing cases* and re-measure. Never
start with a premium model grading freestyle — more expensive AND less safe than a cheap model
checking verified rubrics.

## 4. Telemetry (must ship WITH the free window, not after)

The answer book currently has no analytics. A lightweight event log ships with Rung 1–2 (the
pilot-Supabase batching pattern, already written once for the teacher app): chip taps, free-form
questions, check completions + scores, exam-eve opens, rename events, out-of-bank misses. This is
what tells you the ₹199 headline (check vs memory-tips vs insider-knowledge) instead of guessing.
Free-form question text + costs ride `ai_usage_log` (sacred, never delete).

## 5. Cost model and guards

| Path | Unit cost | Guard |
|---|---|---|
| Deterministic (chips, triage, verdicts, tips, exam-eve) | ₹0 | none needed |
| Free-form chat | ~₹0.025/q measured | existing Edge Function guards ($2/day global, 4/min, 40/day per hashed IP) |
| Voice check | ~₹0.03–0.05 | same guards |
| Photo check | ~₹0.3–0.6 | 10/day cap (~₹23/student/month capped, per the earlier cost model) |

Free window is affordable even if the whole seed cohort uses it daily. **Photo check is the
natural ₹199 headline** — free tier keeps answer book + self-tick + a daily taste of Vidi;
₹199 = unlimited Vidi + voice/photo checking + exam-eve. Pitch to a term-1 student: "Vidi's back
for half-yearlies." Grandfather the seeds (founding rate / free months per referral — pay them in
access, not money).

## 6. Build order

1. **Rung 1 + telemetry + rename** → the term-1 free cohort link. No blockers touched.
2. **Rung 2** → founder sets `DEEPSEEK_API_KEY` secret; allowlist the origin; ship chips + chat.
3. **Voice check** → Web Speech + the rubric grader endpoint (needs hosting — the one real infra
   blocker; the grader is small enough for the same Edge Function family).
4. **Photo check** → vision transcription stage + golden-set gate + 10/day cap. Arrives with (or
   as the headline of) the ₹199 tier.

## 7. Costs that are authoring, not AI

- **Memory tips**: taxonomy designed; per-step tips largely unwritten across 157+ files. Scope
  per-unit, crammer-priority: LAQs and 3-star questions first. The long pole of "how do I
  remember this?".
- **Insider sentences**: one per question, archetype-shared where honest.
- **Rubric verification**: the standing blocker stands — a Telangana IPE teacher verifies invented
  mark splits (`needs_teacher_verification`); the golden set does not substitute for it.

## 8. Non-goals / boundaries

- No Vidi in the teacher product. No push-notification infra in v1. No diagram-geometry grading
  in v1. No LLM ever writes a mark scheme at serve time (Rule 17/18). No Telugu TTS. No accounts
  before payments. Quick Learn surfaces stay shelved.
- Stored bank stays authored from syllabus + past papers — **never scraped from publishers'
  guides** (standing caveat).

## 9. Open founder decisions

1. The Telugu code-mix carve-out ruling (one line, so 30i isn't mis-applied here).
2. Exam calendar: term-1 exam dates → the real deadline for Rung 1.
3. Golden-set pass bar sign-off (±1 mark on ≥90% proposed).
4. ₹199 tier composition at half-yearlies (proposed split in §5) + founding-student grandfather
   terms.
5. Hosting choice for the grader endpoint (Edge Function family proposed).
