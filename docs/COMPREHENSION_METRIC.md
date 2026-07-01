# COMPREHENSION_METRIC.md

> **Status:** v1.0 spec — implementation-ready. Authored 2026-05-23.
> **Owner:** Founder. **First implementation target:** Diamond #4 (`magnetic_field_solenoid`) when it ships.
> **North Star:** every chapter reaches ≥ 85% comprehension score across ≥ 100 unique student sessions before being marked "verified."

## 1. Purpose

PhysicsMind ships content but does not measure whether it teaches. This spec adds state-level instrumentation so every shipped concept produces a comprehension score that compounds chapter-by-chapter. Without this, the moat doesn't compound — content accumulates untested.

**What this spec covers:**
- 3 new Supabase tables (interaction log + quiz authoring + attempts).
- Score rollup (state → concept → chapter).
- Behavior-signature taxonomy for routing retouch work.
- Dashboard at `/admin/comprehension`.
- MCQ overlay component + lifecycle hooks.
- Authoring contract (what concept-JSON authors add per state).
- Privacy + cost guardrails.

**What this spec does NOT cover (deferred to v2):**
- Time-decay re-tests at 7/30/90 days (Phase 2 — `comprehension_revisit_log` table).
- Misconception ID from distractor clustering (Phase 2 — adds `distractor_cluster` field).
- Confidence-vs-score gap (Phase 2 — adds confidence slider to MCQ).
- PYQ calibration (Phase 3 — separate `pyq_concept_mapping` table).
- Chatbot conversation as comprehension signal (Phase 3 — gated by chatbot launch).
- Voice / Feynman explanation grading (Phase 4 — gated by voice agent launch).

Ship v1 first. Phase 2-4 unlock once v1 has 1000+ sessions of data validating the v1 design.

---

## 2. The three Supabase tables

### 2.1 `state_interaction_log`

Fires on every state transition. Captures dwell time + behavior signals per state. ZERO chatbot dependency.

```sql
CREATE TABLE state_interaction_log (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,                  -- anonymous, cookie-based
  user_email TEXT,                            -- nullable; populated post-MCQ if email provided
  concept_id TEXT NOT NULL,                   -- 'magnetic_field_solenoid'
  state_id TEXT NOT NULL,                     -- 'STATE_5'
  state_index INT NOT NULL,                   -- 5 (derived from STATE_N)
  mode TEXT NOT NULL DEFAULT 'conceptual',    -- conceptual | board | competitive
  class_level INT,                            -- 10 | 11 | 12

  entered_at TIMESTAMPTZ NOT NULL,
  exited_at TIMESTAMPTZ,                      -- null if student abandoned
  dwell_ms INT,                               -- computed on exit

  replay_count INT NOT NULL DEFAULT 0,        -- # times this state was rewound
  asked_explain BOOLEAN NOT NULL DEFAULT FALSE,  -- clicked "Explain step-by-step"
  typed_confusion BOOLEAN NOT NULL DEFAULT FALSE,  -- typed confusion phrase
  completed BOOLEAN NOT NULL DEFAULT FALSE,   -- true if interactive state was completed
  abandoned BOOLEAN NOT NULL DEFAULT FALSE,   -- true if user left before state advance

  device_class TEXT,                          -- mobile | tablet | desktop
  network_type TEXT,                          -- 4g | wifi | 3g (best-effort)

  metadata JSONB                              -- room for future signals
);

CREATE INDEX idx_sil_concept_state ON state_interaction_log (concept_id, state_id);
CREATE INDEX idx_sil_session ON state_interaction_log (session_id);
CREATE INDEX idx_sil_entered ON state_interaction_log (entered_at);
```

**Write path:** `TeacherPlayer` listens for `STATE_REACHED` postMessage events from the sim iframe, opens a new row on entry, updates on exit (closes the prior row). Use `useEffect` cleanup to handle navigate-away cases.

---

### 2.2 `state_comprehension_quiz`

The MCQ bank. Authored alongside the concept JSON. 1-2 questions per state. Each question tagged to the specific state whose content it tests.

```sql
CREATE TABLE state_comprehension_quiz (
  id BIGSERIAL PRIMARY KEY,
  concept_id TEXT NOT NULL,
  state_id TEXT NOT NULL,                     -- the state this question tests
  question_index INT NOT NULL,                -- 1 or 2 within (concept, state)

  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,                -- mcq_single | mcq_multi | true_false
  options JSONB NOT NULL,                     -- [{id:'A', text:'...', is_correct:true, distractor_label:'common_mistake_X'}]
  correct_explanation TEXT,                   -- shown after answer, used as feedback
  difficulty TEXT DEFAULT 'medium',           -- easy | medium | hard

  state_concept_tag TEXT NOT NULL,            -- semantic tag: 'axial_field_uniformity', 'rhr_grip_swap'
  pyq_reference TEXT,                         -- optional: 'JEE Main 2019 Q42' for Phase 3 calibration
  weight NUMERIC DEFAULT 1.0,                 -- 2.0 for PRIMARY-aha state questions

  active BOOLEAN NOT NULL DEFAULT TRUE,       -- can deactivate stale questions without delete
  authored_at TIMESTAMPTZ DEFAULT now(),
  authored_by TEXT,

  UNIQUE (concept_id, state_id, question_index)
);

CREATE INDEX idx_scq_concept ON state_comprehension_quiz (concept_id) WHERE active;
```

**Authoring contract:** see §6 below. Authors add MCQ JSON to the concept file under a `comprehension_quiz` field; a build-time script syncs to this table.

---

### 2.3 `comprehension_attempt`

Student's quiz answers. One row per question answered.

```sql
CREATE TABLE comprehension_attempt (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  user_email TEXT,
  concept_id TEXT NOT NULL,
  state_id TEXT NOT NULL,                     -- denormalized for fast per-state aggregation
  question_id BIGINT NOT NULL REFERENCES state_comprehension_quiz(id),

  chosen_option TEXT NOT NULL,                -- 'A' | 'B' | 'C' | 'D' (or comma-list for multi)
  is_correct BOOLEAN NOT NULL,
  time_to_answer_ms INT,

  attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ca_concept_state ON comprehension_attempt (concept_id, state_id);
CREATE INDEX idx_ca_session ON comprehension_attempt (session_id);
CREATE INDEX idx_ca_question ON comprehension_attempt (question_id);
```

**Note:** for v1 we keep one row per attempt (no "best of N" logic). If a student retries a quiz, they get a new session_id and new row set. Phase 2 adds revisit tracking.

---

## 3. Score rollup logic

Computed nightly by a Supabase Edge Function (cheap) and cached in a materialized view. Refresh trigger: every 6 hours OR on demand from the dashboard.

### 3.1 Per-state comprehension score

```
state_score(concept_id, state_id) =
  COUNT(attempts WHERE is_correct) / COUNT(attempts)
  -- across all attempts in the trailing 30 days
  -- minimum 10 attempts required for the score to be "trusted"
  -- below 10 attempts → display as "—" with attempt count
```

### 3.2 Per-concept comprehension score

```
concept_score(concept_id) =
  weighted_average(state_score across all states in concept,
                   weights = state.weight from quiz table)
  -- PRIMARY-aha state questions carry weight=2.0
  -- all others weight=1.0
```

### 3.3 Per-chapter comprehension score

```
chapter_score(chapter_id) =
  AVG(concept_score across all atomic + nano concepts in chapter)
  -- chapter_id derived from concept's chapter tag in concept JSON
  -- atomic and nano weighted equally for v1; revisit in Phase 2
```

### 3.4 Status badges

| Score range | Badge | Meaning |
|---|---|---|
| ≥ 85% | ✅ Verified | Ship-ready, public launch quality |
| 75-84% | 🟡 Early Access | Western paid tier OK with "Early Access" framing; India free OK |
| 60-74% | 🔧 Needs retouch | In active iteration; visible to internal only |
| < 60% | ❌ Broken | Hide from production; rebuild |
| < 10 attempts | — | Insufficient data; show attempt count |

---

## 4. Behavior signature taxonomy

When a state's score drops below 80%, compute its `state_failure_signature` from `state_interaction_log` data. Each signature maps to a fix recipe.

| Signature | Pattern | Likely cause | Fix recipe |
|---|---|---|---|
| `confused_engaged` | high dwell (>2× median) + 1+ replays + asked_explain or typed_confusion | Student is trying but the explanation isn't landing | Add a distinct motion beat that SHOWS the confusing step; add the contextual slider for that variable; slow choreography (Rule 31 — not prediction pauses) |
| `skipped_no_engagement` | low dwell (<0.5× median) + no interaction + low score | Student tuned out before any insight landed | Redesign hook state; lead with surprise/contradiction; shorter intro |
| `almost_there` | medium dwell + 1+ replay + score 60-79% | Concept is close to landing; one more clarifying state would close gap | Insert an intermediate motion beat OR extend the existing state's choreography window (Rule 31) |
| `interactive_failure` | reached state but completed=false on interactive state | Interactive controls confusing or insufficient guidance | Redesign sliders/controls; add starter values; add hint after 10s idle |
| `abandoned_mid_concept` | abandoned=true mid-sim | Pacing too slow OR content too dense at this point | Tighten dialogue; cut redundant primitives; check spatial-contiguity Gate 3b.ii |
| `passive_pass` | low dwell + no interaction + high score (>85%) | Student already knew this; state may be skippable for this aspect | Move state behind a "Show me again" toggle OR mark as `auto_advance` for advanced learners |

Signatures are computed nightly per (concept_id, state_id) and written to a derived view `state_signature_view`. Dashboard surfaces top-10 weakest states with their signatures.

---

## 5. Dashboard wireframe (`/admin/comprehension`)

Server Component, no auth (founder-only access via Vercel password protect or similar). Pages:

### 5.1 Top-level — chapter view

```
COMPREHENSION DASHBOARD                            [refresh] [export CSV]

CH.26 Magnetism            87%  ✅ Verified      18 concepts | 412 sessions
CH.27 EM Induction         72%  🔧 Retouch        9 concepts | 145 sessions
CH.5 Vectors               89%  ✅ Verified      14 concepts | 287 sessions
CH.7 Kinematics            76%  🟡 Early Access  17 concepts | 198 sessions
...

OVERALL          83%   ~1042 sessions trailing 30d
```

Click a chapter → drill into concepts.

### 5.2 Chapter view — concept list

```
CH.26 MAGNETISM                                    87%  ✅ 412 sessions

magnetic_field_wire (atomic)        91%  ✅      87 sessions
magnetic_force_moving_charge        88%  ✅     102 sessions
torque_on_current_loop_in_field     79%  🟡     78 sessions   ⚠ STATE_7 dragging
magnetic_field_solenoid             82%  🟡     67 sessions   ⚠ STATE_5 confused_engaged
rhr_for_solenoid (nano)             92%  ✅      45 sessions
...
```

### 5.3 Concept view — state breakdown

```
magnetic_field_solenoid                            82%  🟡 67 sessions

STATE_1 (hook)                93%  ✅  median 22s dwell
STATE_2 (single turn)         88%  ✅  median 31s dwell
STATE_3 (axial sum) ⭐ PRIMARY 78%  🟡  confused_engaged signature
STATE_4 (outside ≈ 0)         85%  ✅  median 19s dwell
STATE_5 (RHR grip) ⭐ SUPPORT  62%  ❌  confused_engaged + 1.8 avg replays
STATE_6 (formula)             89%  ✅  median 25s dwell
STATE_7 (reverse current)     91%  ✅  median 18s dwell
STATE_8 (interactive)         76%  🔧  interactive_failure (53% completion)

PRIMARY aha state            ⭐ 78%  ← weighted 2x in concept score
```

Click a state → see MCQs + recent sessions.

### 5.4 State detail view

```
magnetic_field_solenoid / STATE_5 (RHR grip)       62%  ❌  CONFUSED_ENGAGED

QUESTIONS:
Q1 [62% correct, 48 attempts]
   "If current flows clockwise when viewed from the right end..."
   ✓ A: Field points right        (62% chose)
     B: Field points left          (28% chose) ← MISCONCEPTION
     C: Field points up            (5% chose)
     D: No field inside            (5% chose)

Q2 [71% correct, 47 attempts]
   "What changes if you reverse the current direction?"
   ✓ B: Field reverses direction   (71% chose)
   ...

INTERACTION SIGNATURE (last 30 days):
  median dwell:        47s (vs 28s overall median for this concept — 1.7×)
  replay rate:         62% of students replayed at least once (1.8 avg)
  asked_explain:       34% of students clicked "Explain step-by-step"
  typed_confusion:     18% typed a confusion phrase
  abandonment:         8% left during this state

TOP CONFUSION PHRASES TYPED:
  "why does the field point along axis" (7×)
  "how do i know which way to grip" (5×)
  "is right hand always the same" (4×)

RECENT 10 SESSIONS:
  [list with timestamps, scores, interaction summaries]

RETOUCH SUGGESTIONS (from signature — Rule 31 vocabulary):
  → Add a motion beat: animate the field-direction build-up before the formula overlay lands
  → Expose the contextual slider for the confusing variable on that state
  → Consider splitting into STATE_5a (single-turn RHR review) + STATE_5b (apply to solenoid)
```

---

## 6. MCQ overlay component

### 6.1 UX flow

After student finishes the simulation (reaches the final state OR clicks "Done"):

1. MCQ overlay slides up from bottom: *"Quick check — answer 3 questions to track your understanding"*
2. Sample 3 questions weighted by state importance:
   - 1 from PRIMARY-aha state (mandatory)
   - 1 from any SUPPORTING-aha state (if exists)
   - 1 from a randomly-picked other state
3. Student answers; each answered question shows result + `correct_explanation` immediately.
4. After 3rd: show "You scored X/3 on this concept" + chapter context if available.
5. Optional email capture: *"Want notified when next concept ships? Drop your email."* — non-mandatory.
6. Each answer writes a row to `comprehension_attempt`.

### 6.2 UX rules

- **Skippable** (button: "Skip questions") — but log the skip as a row in interaction_log with `metadata: {mcq_skipped: true}`.
- **No login required.** Anonymous `session_id` cookie persists across visits.
- **Email optional.** Captures lead but doesn't gate.
- **Max 3 questions per session** even if concept has 5+ states authored. Sample weighted.
- **One quiz per concept per session.** Replaying the sim in the same session doesn't re-prompt.
- **Mobile-first.** Indian Class 11/12 are 80%+ mobile users.

### 6.3 Component file structure

```
src/components/comprehension/
  ComprehensionMCQOverlay.tsx       -- the slide-up panel
  MCQQuestionCard.tsx                -- single question UI
  MCQResultSummary.tsx               -- post-quiz score display
  useComprehensionAttempt.ts         -- writes to comprehension_attempt
  sampleQuestions.ts                  -- 3-from-N weighted sampler
```

---

## 7. Integration points in existing code

### 7.1 `TeacherPlayer` lifecycle (`src/components/TeacherPlayer.tsx` or similar)

Add `useEffect` that:
- On mount: generate or read `session_id` from `localStorage`.
- On `STATE_REACHED` postMessage from iframe: open a new `state_interaction_log` row.
- On next `STATE_REACHED` or unmount: update the prior row with `exited_at`, `dwell_ms`, etc.
- On simulation completion (final state OR "Done" click): show `<ComprehensionMCQOverlay>`.

### 7.2 Iframe sim → parent postMessage events

The renderers (parametric, mechanics_2d, field_3d) already emit:
- `SIM_READY` on load
- `STATE_REACHED` on each state transition
- (need to add) `REPLAY_REQUESTED` when student rewinds
- (need to add) `INTERACTIVE_COMPLETED` when student finishes an interactive state

The new events are small renderer additions — slot into existing postMessage `case` branches in each renderer.

### 7.3 Existing "Explain step-by-step" + "Confused?" buttons

These already emit interaction signals to other systems (`deep_dive_cache`, `drill_down_cache`). Extend the same dispatch to also flip `asked_explain`/`typed_confusion` flags in the current `state_interaction_log` row.

### 7.4 Concept JSON authoring

Authors add a new top-level field to each concept JSON:

```json
{
  "concept_id": "magnetic_field_solenoid",
  "...": "...",
  "comprehension_quiz": [
    {
      "state_id": "STATE_3",
      "state_concept_tag": "axial_field_uniformity",
      "questions": [
        {
          "question_text": "Inside a long solenoid carrying current I with n turns/m, the magnetic field at the center...",
          "question_type": "mcq_single",
          "options": [
            { "id": "A", "text": "Is zero", "is_correct": false, "distractor_label": "outside_inside_confusion" },
            { "id": "B", "text": "Points along the axis with magnitude μ₀nI", "is_correct": true },
            { "id": "C", "text": "Points perpendicular to the axis", "is_correct": false, "distractor_label": "circular_path_confusion" },
            { "id": "D", "text": "Varies with position inside", "is_correct": false, "distractor_label": "uniformity_misconception" }
          ],
          "correct_explanation": "The radial components from individual turns cancel; what survives is a uniform axial field with magnitude μ₀nI.",
          "difficulty": "medium",
          "weight": 2.0
        }
      ]
    }
  ]
}
```

A build-time script (`npm run seed:comprehension-quiz`) syncs `comprehension_quiz` from all concept JSONs to the `state_comprehension_quiz` table.

### 7.5 Validator addition

`npm run validate:concepts` gets a new check: every concept JSON authored on or after 2026-06-01 must have `comprehension_quiz` covering at least the PRIMARY-aha state + 50% of other states. Backfill carve-out: existing concepts exempt until next touch.

---

## 8. Privacy + cost guardrails

### 8.1 Privacy

- **No login required**, no PII collected by default.
- `session_id` is anonymous UUID stored in localStorage; clearing browser data resets it.
- `user_email` is optional and only set if student voluntarily provides it for "notify me" feature.
- IP addresses NOT stored in the comprehension tables (only in standard server logs per Vercel/Supabase defaults).
- Standard Indian DPDP compliance (no children's data protections required for Class 11+12 = 16+).

### 8.2 Cost

| Cost line | At 100 sessions/day | At 1000 sessions/day | At 10000 sessions/day |
|---|---|---|---|
| Supabase row writes (5 states × 100 sessions + 3 MCQ + 3 attempts) | <$1/mo | ~$5/mo | ~$50/mo |
| Dashboard reads (founder only) | $0 | $0 | $0 |
| Materialized view refresh (6h) | <$1/mo | <$1/mo | ~$5/mo |
| **Total** | **<$2/mo** | **~$6/mo** | **~$55/mo** |

Free-tier safe up to ~2000 sessions/day. At 10K+ sessions/day you're a real product and the cost is irrelevant.

### 8.3 Abuse vectors

- Anonymous quiz attempts could be spammed. Mitigate: rate-limit (max 50 MCQ attempts per session_id per day) at API level.
- Email signups for "notify me" need basic captcha after 3 signups/IP/day.
- No chatbot in v1 = no LLM cost exposure.

---

## 9. Implementation order (1 sprint, ~10 days founder-solo)

| Day | Task |
|---|---|
| 1 | Apply migration: 3 tables + indexes. Test inserts manually via Supabase MCP. |
| 2 | Build `state_interaction_log` writes in TeacherPlayer (state entered/exited/dwell). Test with Diamond #4 locally. |
| 3 | Build `ComprehensionMCQOverlay` component + supporting components (`MCQQuestionCard`, `MCQResultSummary`). |
| 4 | Add `comprehension_quiz` field to Diamond #4 JSON. Author 2 MCQs per state for 8 states (~16 MCQs). |
| 5 | Build `npm run seed:comprehension-quiz` script. Sync Diamond #4 quizzes to DB. End-to-end test: play sim, see MCQ overlay, answer, row appears in `comprehension_attempt`. |
| 6 | Build score rollup as Postgres view or materialized view. Test manually. |
| 7 | Build `/admin/comprehension` dashboard top-level chapter view. |
| 8 | Build chapter → concept → state drill-down views. |
| 9 | Author MCQs for Diamonds #1-#3 (backfill, ~40 MCQs total). |
| 10 | Internal test with 3-5 friends/family Class 11. Fix bugs surfaced. Ready for r/JEE launch. |

After this sprint: comprehension metric is fully live for Diamonds #1-#4. First public test on r/JEE.

---

## 10. Phase 2 enhancements (deferred — DO NOT BUILD IN v1)

Order of value when v1 is shipped + 1000+ sessions of data exist:

1. **Distractor clustering** (~3 days) — analyze which wrong answers students pick most → auto-flag candidate EPIC-C branches. Misconception-discovery engine.
2. **Confidence-vs-score gap** (~2 days) — add 1-5 confidence slider to each MCQ. Dunning-Kruger detection.
3. **Time-decay re-tests** (~5 days) — new `comprehension_revisit_log` table + 7/30/90 day re-prompt logic via email.
4. **PYQ calibration** (~7 days) — `pyq_concept_mapping` table + quarterly regression against actual PYQ scores.
5. **Chatbot conversation signal** (~5 days, gated on chatbot launch) — extract comprehension proxy from chatbot turn quality.
6. **Feynman voice grading** (~14 days, gated on voice agent launch) — student talks through concept; AI grades against `physics_engine_config` + misconceptions.

---

## 11. Open questions for the founder

- **Chapter ID convention:** today concepts don't carry an explicit `chapter_id` field. Should we infer from a `chapter` field in concept JSON, or maintain a separate `chapter_concept_map` table? Recommendation: add `chapter_id` to concept JSON, lazy-default to inference from CONCEPT_PANEL_MAP entries.
- **MCQ skippability:** I assumed skippable. Confirm — or should it be mandatory before student can advance to next concept?
- **MCQ presentation timing:** after sim completion, or after EACH state? Recommendation: after sim completion (less interruptive, matches "did you understand the whole concept" framing).
- **Score visibility to students:** show students their own score, or keep dashboard internal? Recommendation: show students ("You scored 2/3 — want to retry the simulation?") — drives re-engagement.
- **Class-level adjustment:** Class 10 student vs Class 12 student shouldn't be compared 1:1. Track class_level in interaction log; segment dashboard by class.

---

## 12. References

- `physics-mind/docs/PASS_2_PROPOSAL.md` — Pass-2 four-question lens; per-state instrumentation here feeds the lens's Q1+Q2.
- `physics-mind/.agents/architect/CLAUDE.md` §"Two-pass cognitive lens" — PRIMARY-aha designation drives MCQ weight=2.0.
- `physics-mind/.agents/quality_auditor/CLAUDE.md` Gate 14 — backfill carve-out (2026-05-22+) extends naturally to comprehension_quiz requirement.
- `physics-mind/docs/HARNESS_REVIEW.md` — quarterly review walks this metric's evolution.
- `physics-mind/docs/MAGNETISM_ARCHITECTURE.md` M4 binary gate — scene_designer ship gate now ALSO requires Ch.26 to hit 80%+ comprehension across measured concepts.
- `student_confusion_log` (sacred table) — existing 159 rows; seeds initial state_failure_signature taxonomy.
- `feedback_unified` (Phase-I) — extends naturally; MCQ skipped + low score → feedback row.

---

*"What gets measured gets improved. What doesn't, doesn't."*
*— the comprehension metric is the difference between PhysicsMind as a content company and PhysicsMind as a learning company.*
