# COMPREHENSION_LOOP_PLAN.md — Connecting Part 1 ↔ Part 2

**Status:** 📋 PROPOSAL — paper-first. **No code, schema, spec, or CLAUDE.md changes have been made.** This doc is the reviewable artifact; nothing ships until founder sign-off on §11.
**Date:** 2026-05-30
**Author:** Claude (Architect+Engineer)
**Relates to:** DISCUSSIONS.md Session 59 (two-loop audit) + Session 60 (North Star, two profiles, cram mode); `PASS_2_PROPOSAL.md`; `ARCHITECTURE_v2.2.md`; CLAUDE.md Rules 16/17/18 + §6 + §7.
**One-line purpose:** Turn the two disconnected feedback loops into one closed loop whose shared currency is **comprehension** — so a simulation is gated on "did a cold student learn?", not just "is it bug-free?"

---

## 0. Decisions status (so we don't re-litigate)

| Decision | Status |
|---|---|
| North Star is the success bar (80–85% 1st pass / 95–98% 2nd / 2–3 min / 80–90% MCQ) | ✅ LOCKED (S60) |
| V1 = prove the loop on ~15–20 foundation concepts, *then* cram mode | ✅ LOCKED (S59 T1 + S60) |
| **DC Pandey usage = option (b):** TOC + problem variants + misconception-extraction (extract the *wrong belief*, never the prose/sequence) | ✅ LOCKED (this session) |
| Folder consolidation — agents + commands copied to `C:\Tutor\.claude\` | ✅ DONE (this session) |
| Paper-first before implementation | ✅ LOCKED (this doc) |
| **Move misconception confrontation INTO EPIC-L (POE); demote EPIC-C to fallback** (Rule 16 change) | 🟡 RECOMMENDED — needs sign-off (§11 Q1) |
| `assessment.pre_post` quiz schema + `coverage_map` + Gate 18 | 🟡 RECOMMENDED — needs sign-off (§11 Q2) |
| Gates 15/16/17 (POE / one-variable / concrete-first) | 🟡 RECOMMENDED — needs sign-off (§11 Q3) |

---

## 1. The problem this plan solves

From the Session 59 audit (against the **real codebase**, not the docs):

- **Part 1 (authoring loop): ~65% built, works.** `engine_bug_queue` (30 logged bugs, 24 fixed, 100% carry a prevention_rule), Visual Validator E29 (`aiSimulationGenerator.ts:6964`), admin triage UI. **But it only proves *correctness + visual validity* — not *comprehension*.**
- **Part 2 (production loop): wired but EMPTY.** `state_interaction_log` = 0 rows, `simulation_feedback` = 0 rows, `feedback_unified` doesn't exist, `proposal_queue` has no table, Tier-8 agents are markdown only.
- **The two loops don't share a language.** Even if Part 2 had data, it could not tell Part 1 *which state* failed to teach.

**The #1 killer risk (S59 T10): the thesis is unproven — 0 rows of comprehension data.** The metric apparatus exists but is switched off. This plan switches it on *at authoring time* (on the founder + 1–2 test learners) so we don't have to wait for traffic to start closing the loop.

---

## 2. The connecting idea (the whole plan in one sentence)

> **Author a pre/post quiz + a `coverage_map` (quiz-question ↔ state) with every concept. The quiz is the shared currency: authored in Part 1, measured in Part 2, and used to trace any student failure back to the exact state that failed to teach it.**

```
   quiz authored in Part 1 ──┐
                             ├──► measured on learners in Part 2
   coverage_map (Q ↔ state) ─┘            │
        ◄─────────────────────────────────┘
        a failed question points back to ONE state to fix
```

Without `coverage_map`, Part 2 data is just "students scored low" — undiagnosable. With it, "Q4 fail-rate 55%" becomes "STATE_3 is weak → re-author STATE_3."

---

## 3. The upgraded connected pipeline

`[NEW]` = to build · `[EXISTS]` = already wired · `[UPGRADE]` = existing thing, extended

```
╔══════════════ PART 1 — AUTHORING (upgraded) ══════════════╗
║ ① architect [UPGRADE]                                      ║
║    • BACKWARD DESIGN: write the 6-Q mastery quiz FIRST [NEW]║
║    • map each quiz Q → the state that teaches it       [NEW]║
║    • plant + confront each wrong belief INSIDE EPIC-L      ║
║      via Predict-Observe-Explain (not a side branch)   [NEW]║
║    • consult evidence packs (§8) before skeleton       [NEW]║
║        │                                                   ║
║ ② physics_author [EXISTS] → physics block                  ║
║        │                                                   ║
║ ③ json_author [UPGRADE] → JSON now includes:               ║
║    • assessment.pre_post  (6-Q quiz)                   [NEW]║
║    • coverage_map         (quiz_Q ↔ state_id)          [NEW]║
║        │                                                   ║
║ ④ quality_auditor [UPGRADE] runs:                          ║
║    • Gates 9–14            [EXISTS]                         ║
║    • Visual Validator E29  [EXISTS]                         ║
║    • Gate 15 POE / 16 one-variable / 17 concrete-first [NEW]║
║    • Gate 18 COVERAGE (no orphan states / no uncovered Q)[NEW]║
║    • Gate 19 QUIZ-QUALITY (distractors map to misconceptions)[NEW]║
║        │                                                   ║
║ ⑤ HUMAN COMPREHENSION GATE [NEW] (proxy until students)    ║
║    • founder, cold → post-quiz ≥ 80%?                      ║
║    • 1 real cold learner → ≥ 80%?                          ║
║    fail → traceback via coverage_map → back to ① or ③      ║
║        │                                                   ║
║        ▼  SHIP versioned diamond (quiz + coverage baked in)║
╚════════════════════════╪═══════════════════════════════════╝
                         │  THE BRIDGE: quiz + coverage_map
                         │  travel WITH the concept
╔════════════════════════╪═══ PART 2 — PRODUCTION (fed) ══════╗
║ ⑥ student flow [PARTLY EXISTS]                             ║
║    pre-quiz → watch sim → post-quiz                        ║
║        │                                                   ║
║ ⑦ capture                                                  ║
║    • state_interaction_log (dwell/clicks per state)[EXISTS]║
║    • comprehension_result (pre, post, per-Q correct)[NEW tbl]║
║        │                                                   ║
║ ⑧ nightly aggregation [NEW]                                ║
║    per (concept, state, quiz_Q): delta · fail% · dwell     ║
║        │                                                   ║
║ ⑨ Tier-8 Proposer [SPEC → BUILD]                           ║
║    uses coverage_map to trace failed Q → weak state,       ║
║    writes a PROPOSAL                                       ║
║        │                                                   ║
║ ⑩ proposal_queue [NEW tbl]                                 ║
║    NOW:   founder approves every proposal  ◄─ hard floor   ║
║    LATER: auto-promote IF all gates pass AND no regression ║
╚════════════════════════╪═══════════════════════════════════╝
                         ▼
   approved proposal routes BACK into Part 1 at the right station:
     sequence/pacing → architect ① · content → json_author ③
     visual/renderer → Peter Parker (break-glass, quality_auditor routes)
   → re-author → re-run ALL gates → re-ship as a NEW VERSION
                         │
                         └──► loop closes; quality compounds
```

---

## 4. What changes — the change list

| # | Component | Today | After | Type |
|---|---|---|---|---|
| 1 | `assessment.pre_post` (6-Q quiz in JSON) | absent | the object 80–85% is measured against | NEW |
| 2 | `coverage_map` (quiz_Q ↔ state_id) | absent | the wire enabling traceback | NEW |
| 3 | Authoring direction | forward (build→hope) | backward (quiz first→build to cover) | UPGRADE |
| 4 | Misconception location | reactive EPIC-C branch | proactive POE in EPIC-L; EPIC-C = fallback | UPGRADE (Rule 16) |
| 5 | Gates 15–19 | aspirations | enforced in quality_auditor | NEW |
| 6 | Human comprehension gate (⑤) | none | founder + 1 learner, ≥80%, pre-launch | NEW |
| 7 | `comprehension_result` table | none | per-Q pre/post scores | NEW |
| 8 | Nightly aggregation (⑧) | none | per-state failure + dwell rollup | NEW |
| 9 | Tier-8 Proposer | markdown spec | built + coverage-map-aware | UPGRADE |
| 10 | `proposal_queue` table | no table | founder-approved → auto-promote later | NEW |
| 11 | Traceback router | absent | approved proposal → correct Part-1 station | NEW |

**Unchanged (explicitly preserved):** `engine_bug_queue`, Visual Validator E29, Gates 9–14, agent playbooks, the Rule 18 hard floor (no un-reviewed runtime generation of physics). The comprehension loop sits *alongside* the bug loop — two channels into Part 1, not a replacement.

---

## 5. Schema additions (DRAFT — for review, friction used as example)

### 5.1 `assessment.pre_post` (new top-level block in each atomic JSON)

```json
"assessment": {
  "mastery_definition": "A student who has mastered static-vs-kinetic friction can predict whether a pushed block moves, and whether friction grows, holds, or drops.",
  "questions": [
    {
      "q_id": "Q4",
      "stem": "You push a heavy box harder and harder but it still doesn't move. As you push harder, the friction force on the box…",
      "options": {
        "A": "stays the same (friction is constant)",
        "B": "increases to match your push",
        "C": "decreases",
        "D": "disappears"
      },
      "correct": "B",
      "distractor_misconceptions": {
        "A": "friction_is_a_fixed_force",
        "C": "friction_always_opposes_and_shrinks",
        "D": "no_motion_means_no_friction"
      },
      "tested_idea": "static friction grows with applied force up to a maximum",
      "teaches_state": "STATE_3",
      "difficulty": "core"
    }
  ],
  "parallel_form_post": [ /* optional: equivalent but reworded Qs to blunt the memory effect — see gap #2 */ ]
}
```

### 5.2 `coverage_map` (new top-level block)

```json
"coverage_map": {
  "by_state":    { "STATE_1": [], "STATE_2": ["Q1"], "STATE_3": ["Q2","Q4"], "STATE_4": ["Q3"], "STATE_5": ["Q5","Q6"] },
  "non_assessed_states": ["STATE_1"],          // pure hook — exempt by declaration
  "_orphan_states": [],                         // states with no Q and not declared non-assessed → Gate 18 FAIL if non-empty
  "_uncovered_questions": []                    // Qs whose teaches_state is missing/invalid → Gate 18 FAIL if non-empty
}
```

**Design choices to confirm:** 6 questions (3 ideas × pre+post, or 6 distinct ideas?); whether `parallel_form_post` is V1 or deferred; whether `assessment` is required for all new atomics or phased in like Gate 14 was.

---

## 6. New validator gates (DRAFT definitions)

> **⚠️ RENUMBERED AT IMPLEMENTATION (2026-05-30):** the codebase already reserves **Gate 15** for the Pass-2 four-question audit (`quality_auditor/CLAUDE.md`), so the five new gates shipped as **16–20**, not 15–19. Authoritative mapping: **Gate 16 = POE**, **17 = one-variable**, **18 = concrete-first**, **19 = coverage** (machine), **20 = quiz-quality** (machine). The table below keeps the original draft labels for reference; the live definitions are in the quality_auditor spec + `conceptJson.ts`.

| Gate | Rule | Fails when |
|---|---|---|
| **Gate 15 — POE** | ≥2 EPIC-L states use Predict→Observe→Explain (prediction prompt *before* reveal). Any state mapped to a Q with non-empty `distractor_misconceptions` MUST be POE. | misconception-bearing state has no prediction beat |
| **Gate 16 — one new variable/state** | each EPIC-L state introduces ≤1 new physical variable/symbol | a state introduces μs + threshold + inequality at once |
| **Gate 17 — concrete before abstract** | first teaching state is a visible concrete scene; no general-formula state precedes a concrete one | STATE_2 is "F = μN" before any block-on-floor scene |
| **Gate 18 — coverage** | every Q maps to a valid state; every state is covered OR declared `non_assessed` | `_orphan_states` or `_uncovered_questions` non-empty |
| **Gate 19 — quiz quality** | every wrong option has a `distractor_misconception`; questions span ≥3 distinct ideas; ≥1 Q hits the PRIMARY aha | a distractor is arbitrary / not a real wrong belief |

These extend the existing Gate 9–14 family in quality_auditor; they don't replace anything.

---

## 7. Rule 16 change (the EPIC-C relocation) — RECOMMENDED

**Today (old architecture):** misconception correction is *reactive* — it lives in an EPIC-C branch triggered only when a student *types* a confusion phrase (`epic_c_branches[].trigger_phrases`). A silent cold student never triggers it.

**Problem for the North Star:** a cold, teacherless student who silently holds the wrong belief never types anything → never gets corrected → fails the MCQ. The reactive model **cannot** deliver 80–85% first-pass.

**Proposed:** move the confrontation **into EPIC-L** via POE (Gate 15). The "predict" beat surfaces the wrong belief; "observe" contradicts it; "explain" resolves it — for **every** student, proactively. **EPIC-C demotes to a fallback** for confusions that survive the proactive pass.

**Rule 16 rewording (proposed):** *"The wrong belief must be confronted explicitly during the first pass — primarily inside EPIC-L at the POE 'predict' beat of the relevant state. EPIC-C branches remain as a reactive fallback for residual confusions; they reuse EPIC-L states and are never a separate concept or simulation."*

This also resolves the architect-spec note (line 157) that ties EPIC-C STATE_1 to "a misconception planted in EPIC-L" — the plant and the confrontation now live in the same place.

---

## 8. The two evidence-pack pipelines (feed the architect, §3 stage ①)

Both inputs feed the architect — **into different parts of the skeleton**:

| Input | Feeds | Because |
|---|---|---|
| **Master teachers** (Lewin / HCV / PW) | EPIC-L **arc** (state count, sequence, what-before-what) | "how to build the explanation" = pedagogical design |
| **Mining** (PER / YouTube / Reddit / books) | EPIC-C branches + POE "predict" prompts + quiz distractors | "what students get wrong" = diagnostic |

Mining can **diagnose** which EPIC-L state is weak, but never **author** the sequence. (The "diagnose vs author" rule.)

### 8.1 Mining pipeline → `evidence/<concept_id>/misconceptions.md`

```
1. COLLECT  per-concept raw text
2. FILTER   Haiku classifier → keep only misconception phrases (~$1/concept)
3. CLUSTER  group → cluster_id → write to confusion_cluster_registry  [TABLE EXISTS]
4. REVIEW   founder eyeballs clusters (~10 min)
5. EMIT     misconceptions.md evidence pack
```

| Source | Have on disk? | Tool | DCP option-(b) note |
|---|---|---|---|
| PER inventories (FCI/CSEM/BEMA) | ❌ pull | PDF → Haiku | — |
| OpenStax misconception notes | ✅ `physics-book-source/` (283 .md) | Grep + Haiku | — |
| NCERT callouts | ✅ `ncert_content` (6,069) | DB query | — |
| **DC Pandey chunks** | ✅ `books/` + `physics-mind/*.jsonl` (~7,250 chunks: Mech I/II, Waves, EM, Optics) | normalize → Haiku | **extract the wrong belief only; never copy prose/sequence** |
| HCV "Points to Ponder" | ❌ pull (physical book) | manual scan | highest Indian signal |
| YouTube timestamped doubts | ❌ pull | YouTube Data API v3 `commentThreads.list` → Haiku | — |
| Reddit r/JEE | ❌ pull | Reddit API (PRAW) → Haiku | — |
| Doubtnut | ❌ pull | small-scale scrape (research-only, no redistribution) | — |

### 8.2 Master-teacher pipeline → `evidence/<concept_id>/teacher_study.md`

Semi-automated; **the design judgment stays human.**

| Teacher | Tool | Extract (SEQUENCE only, never content) |
|---|---|---|
| Walter Lewin (MIT 8.01) | OCW transcript → LLM summarize | "demo before F=ma" |
| HC Verma | manual read | "kinetic before static" |
| Physics Wallah | YouTube captions / Whisper → LLM summarize | Indian framing; attention peaks |

> **DC Pandey is NOT a master-teacher source.** CLAUDE.md §8 bans copying its teaching sequence; EPIC-L pedagogy is HCV's role. Having DCP chunks does **not** close the master-teacher gap.
> **§8 reconciliation needed:** §8 ("DCP = TOC only") vs memory `feedback_source_role_triad` ("DCP = problems") vs this plan's option (b) ("+ misconception extraction"). On sign-off, CLAUDE.md §8 + the memory note get updated to one consistent statement.

### 8.3 Storage (new — does not exist today)

```
physics-mind/evidence/<concept_id>/
    ├── misconceptions.md   (mining)
    └── teacher_study.md    (master-teacher)
```
Architect spec gains two Pass-1 lines: *"consult misconceptions.md → POE prompts + EPIC-C + distractors"* and *"consult teacher_study.md → state sequence."*

### 8.4 Sequencing honesty — **do not over-build extraction for V1**

For 15–20 concepts: **semi-manual, ~3–4 hrs/concept** (PER read + book points-to-ponder + 3 YouTube videos Haiku-filtered + Reddit skim). **Build the automated YouTube/Reddit scraper only at ~100+ concepts.** Building it now repeats the "Part-2 brain on an empty dataset" mistake.

---

## 9. Gap audit — what the pipeline is still missing (address before/at build)

### Measurement integrity (these make the 80% number lie if ignored)
1. **Unvalidated quiz** — if the 6 MCQs ≠ mastery, the metric is fiction → **Gate 19** + founder review of the quiz.
2. **Pre/post memory effect** — same Qs twice → measures recall, not learning → `parallel_form_post` or accept + document.
3. **No baseline/control** — 80% proves nothing vs "they already knew it" or "YouTube does it too" → needs a **comparison arm** (our sim vs YouTube vs notes). This is the answer to the #1 risk and is *separate* from the per-concept gate.
4. **Sample size** — stage ⑤ (founder + 1 cousin) is a **smoke test, not proof**; real proof needs N students. State it plainly.

### Loop logic (these make traceback blame the wrong thing)
5. **Prerequisite confounder** — failure from a missing prerequisite must not blame a state. Tag it.
6. **Narration vs visual attribution** — a state can be well-designed but badly narrated; attribute to script/pacing too.
7. **Completion gate** — only count a post-quiz if `state_interaction_log` shows the sim was watched through.

### Scope / sequencing
8. **Concept selection** — *which* 15–20? The Stage-5 priority queue is deferred/unbuilt; it's upstream of this pipeline.
9. **Second pass (95–98%) undesigned** — pipeline only measures pass 1. Define pass-2 delivery (re-watch vs cram/revision entry) and measurement.

### Cost / compliance
10. **ToS + cost** — YouTube quota (10k/day), Haiku cost, scraping ToS (research-scale, no redistribution). Budget, don't discover.

### Meta-gap
11. **The loop is NOT autonomous** — between "STATE_3 is weak" and "a better STATE_3 exists" sits human design judgment (by Rule 18 design). Plan accordingly; it does not self-heal.

---

## 10. Proposed build order (phases)

| Phase | What | Depends on | Students needed? |
|---|---|---|---|
| **P0** | Sign-off on §11 | — | no |
| **P1 — keystone** | `assessment.pre_post` + `coverage_map` schema + **Gate 18 + Gate 19**; author them for **friction** (existing diamond) | P0 | no |
| **P2 — comprehension gate** | Stage ⑤ run on friction (founder cold + 1 learner); POE retrofit of friction (Gates 15–17); Rule 16 reword | P1 | no (2 humans) |
| **P3 — evidence packs (manual)** | `evidence/friction/` misconceptions.md + teacher_study.md, semi-manual; architect spec lines | P0 | no |
| **P4 — baseline experiment design** | control-arm protocol (sim vs YouTube vs notes); answers #1 risk | P1 | yes (small) |
| **P5 — roll to remaining V1 concepts** | repeat P1–P3 per concept; pick set via Stage-5 queue | P2,P3 | no |
| **P6 — Part-2 build (DEFER)** | `comprehension_result` + `proposal_queue` tables, nightly aggregation, Tier-8 Proposer, traceback router | real traffic | **yes — defer until students exist** |

**Critical-path insight:** P1→P2 deliver the connected loop's *benefit* (catch comprehension failures at authoring time) **with zero students**. P6 just scales the same wire up later. Don't block on traffic.

---

## 11. Open decisions for founder (sign-off needed before any code)

1. **Rule 16 / POE relocation (§7):** confirm Option A — confrontation moves into EPIC-L (POE), EPIC-C demoted to fallback? *(Recommended: yes.)*
2. **Schema (§5):** approve the `assessment.pre_post` + `coverage_map` shape? Specifically: 6 questions; `parallel_form_post` in V1 or deferred; required-for-all-new-atomics or phased in like Gate 14?
3. **Gates (§6):** approve Gates 15–19 as defined?
4. **Pilot concept:** friction as the P1/P2 pilot? *(Recommended: yes — it's a shipped diamond and the North Star example.)*
5. **§8 reconciliation:** on sign-off, update CLAUDE.md §8 + memory note so DCP usage (option b) is stated once, consistently. Approve?

---

## 12. What this plan deliberately does NOT do

- Does **not** touch the Rule 18 hard floor — no un-reviewed runtime generation of physics; every Part-2→Part-1 change is offline, reviewable, founder-gated (graduating to auto-promote only as Tier-9 gates earn trust).
- Does **not** build the Part-2 brain now (no students → no fuel).
- Does **not** build automated mining scrapers now (premature at 15–20 concepts).
- Does **not** remove or weaken `engine_bug_queue`, Visual Validator E29, or Gates 9–14.
- Does **not** edit any spec, schema, or CLAUDE.md yet — paper-first.

---

*Next action: founder reviews §11. On sign-off, I open a DISCUSSIONS.md Session 61 entry recording the decisions and begin Phase P1 (friction keystone).*
