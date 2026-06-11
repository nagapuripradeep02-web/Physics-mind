# AUTHORING_PIPELINE.md — How every PhysicsMind simulation gets built

# Canonical SOP — v1.0 | 2026-06-10
# The end-to-end process for authoring ONE new simulation, from source to ship.
# Locked with founder (Pradeep) on 2026-06-10. Every session follows this exactly.

> **One frame:** Source the *pedagogy* from the best teacher → design the states →
> **look** (visual testing) → **professor gate** (before any student) → student.
> Every bug, fix, and lesson logged with a `prevention_rule` so the architecture
> compounds value from day 1 to day N.

This SOP is the *process* spine. It does not replace the deeper specs — it sequences them:
- **Pedagogy distillation** → `docs/pedagogy_sources/` (e.g. `T36_chapter_scope.md`)
- **Concept JSON authoring** → CLAUDE.md §6 + the Alex agent pipeline (architect → physics_author → json_author → quality_auditor)
- **Visual testing** → `docs/VISUAL_VALIDATOR_SPEC.md`
- **Patterns library** → `docs/patterns/<chapter>.md`
- **Compounding / feedback loops** → Session 59 audit (DISCUSSIONS.md Topic 3)

---

## The pipeline

```
For every NEW simulation:

①  SOURCE THE PEDAGOGY
    Pick a best, high-viewing YouTube professor explaining that concept.
    Pull the transcript → extract HOW he teaches it:
      what he stresses · the misconception he fights · the must-see moment · his teaching order.
      (Same role DC Pandey plays — we mine the TEACHING, never the words. See IP guardrail.)
        │
        ▼
②  DESIGN THE STATES
    Decide how to SHOW it to a cold student — the relationship in each state,
    state by state — then build it to the v2 gold-standard spec. Build it perfectly.
        │
        ▼
③  VISUAL TESTING — the eye  (MANDATORY, non-optional)
    Run the Visual Validator AND render every frame into Claude's own view.
    Confirm: what was DESIGNED == what was SHIPPED. Every issue visible, minor → major,
    nothing hidden behind a "ships with warning." Gap found → fix → re-test. No skipping.
        │
        ▼
④  PROFESSOR GATE  (before any student ever sees it)
    The reviewing professor (Venkata / Asmi) reviews the PEDAGOGY:
      "Is anything wrong, unclear, or out of order? Where will a student trip?"
    Take the feedback → update the simulation → re-run ③.
    The professor's lesson is ALSO logged to the queue with a prevention_rule (see below).
        │
        ▼
⑤  STUDENT  (later — only once the sim is proven correct + professor-approved)

   ┌──────────────────────────────────────────────────────────────────────┐
   │  RUNNING ALONGSIDE EVERY STAGE: engine_bug_queue + patterns library   │
   │  every bug / fix / professor-lesson → logged WITH a prevention_rule    │
   │  → every FUTURE simulation inherits it automatically                   │
   │  → value compounds, day 1 → day N                                      │
   └──────────────────────────────────────────────────────────────────────┘
```

---

## Stage ② — the Definition of Done (build the COMPLETE version in ONE pass)

"Build it perfectly" only collapses the iteration count if you decide what *complete* means **before** building, then build to all of it at once. The `biot_savart_law` sim (2026-06-11) took ~7 founder turns because the spec arrived piecemeal — concept, then "add the symbols," then "add the right-hand rule," then "animate the hand" — each a separate round. Labels, the rule, and motion are **table stakes** for a direction-teaching field sim, not surprises. They belong in v1.

**Before building any sim, write its Definition of Done — the full list of what a finished version contains — and build to ALL of it before the first founder showing:**

- [ ] Every EPIC-L state designed (count derived from the sub-truth list, never copied).
- [ ] Every vector/quantity the narration names has an in-scene **symbol label** (dl, r̂, θ, dB, B, F, v, μ, …).
- [ ] Where **direction** is taught: the correct **right-hand rule** on those states — grip rule for circulation, cross-product rule for a single dB/F. Right rule on the right state (see `patterns/magnetism.md`).
- [ ] **Motion wherever something moves or a rule is performed** — no static diagram where an animation teaches better (curling hand, flowing current, assembling field, orbiting tangent). The founder rejects passive states.
- [ ] All three modes if the concept's phase requires them (conceptual always; board + competitive unless a documented carve-out).
- [ ] `assessment` + `coverage_map` + per-state `misconception_watch` if authored 2026-05-30+.

**Compute, don't guess.** Every placement, timing, and orientation is derivable up front — guess-and-recapture costs more than the math:
- **Screen position** of an overlay/hand → from the camera basis: screen-right ≈ `normalize(viewDir × up)`. Its z-component is negative for the default +x+y+z camera, so increasing world-z moves an object **left**, not right. Prefer **camera-relative anchoring** (position computed from `stateDef.camera_position`) over per-state hand-tuned world coords — framing-correct by construction, zero tuning.
- **Timing** (curl, reveal, stagger) → explicit phase fractions, not eyeballed.
- **Orientation** → `makeBasis` / quaternion with a determinant/handedness check (det = +1 = a true right hand, never mirrored — a mirrored RHR teaches the wrong physics).

**Iteration budget.** The irreducible loop is ONE compute + ONE visual-verify pass (stage ③ requires actually looking — you cannot trust framing you have not rendered). Target **2–3 rounds total, not 7.** Iteration is the *method*; guess-and-recapture and piecemeal-spec are the *waste*.

---

## The three rules that make this work

### 1. IP guardrail — extract pedagogy, never prose
From the YouTube professor (and DC Pandey) we take only: the **misconception** he targets,
the **must-see** moment, the **teaching order**, where students **resist**. We **never** copy
his words, exact phrasing, exact example values, or exact sequence verbatim. Our restructured
teaching notes only. **Plain English. No Hinglish. No Devanagari.** (Extends CLAUDE.md §8 to YouTube.)

### 2. The video is the delivery layer — the books are the skeleton
The YouTube professor is the **nervous system** (pacing, emphasis, what makes it click). The
**skeleton** still comes from the source triad — don't let one charismatic video become the sole source:
- **HC Verma** → teaching sequence / derivation order
- **DC Pandey** → problem types + misconception beliefs (the belief only)
- **NCERT** → Indian real-world anchors
Cross-check the video against the skeleton so nothing required is missing.

### 3. Visual testing means Claude actually LOOKS — every time
Stage ③ only works if the validator **auto-runs and renders every frame into Claude's own eyes
before showing the founder** — not "glanced at a screenshot and called it done." This is the most
common failure mode (e.g. A5 on 2026-06-10 shipped to founder review without a validator run).
The fix is discipline + automation, not a new check. See `VISUAL_VALIDATOR_SPEC.md`.

**THE EYE protocol (operational, built 2026-06-10):**
```bash
npm run visual:eyes -- <concept_id>     # $0 — captures EVERY state + dense ~1s frames,
                                        # runs all deterministic gates (D1p/H1/D5/D6/D7/H2),
                                        # dumps every PNG to .visual_runs/<id>/<timestamp>/
# → Claude Reads EVERY printed PNG path. Actually looks. Only then founder review.
npm run smoke:visual-validator -- <concept_id> --dense   # vision categories A–G + I
                                        # (cost ladder: Gemini Flash → Sonnet → Opus-flag)
npm run visual:approve -- <concept_id>  # after founder approval → lock regression baselines
```
Surface-everything rule: both scripts print EVERY check result, pass AND fail, full failure
evidence — nothing summarized away.

---

### Logging a professor lesson (stage ④ → the queue)

Every professor/founder lesson goes into `engine_bug_queue` WITH a prevention rule, so it
protects every future concept — not just the one reviewed:

```bash
npm run log:lesson -- \
  --bug-class FLEMING_SCOPE_UNSTATED \
  --title "Fleming overlay shown without its +q / 90° scope caveat" \
  --severity MODERATE \
  --owner alex:json_author \
  --root-cause "Authored the Class-10 mnemonic panel without stating its limits." \
  --prevention-rule "Any Fleming overlay must state: works for +q only; right-hand rule stays canonical." \
  --concept magnetic_force_moving_charge
```

`--prevention-rule` is mandatory — a lesson without a prevention rule does not compound.
(SQL fallback: INSERT into `engine_bug_queue` with `probe_type='manual'`.)

---

## What compounds NOW vs LATER (no illusion)

| Channel | Compounds when? | Mechanism |
|---|---|---|
| **Bug-prevention** | ✅ Day 1 (live) | `engine_bug_queue` — 30 logged, 24 fixed, 100% carry a `prevention_rule`. Every fix protects all future concepts. |
| **Pedagogy rules** | ✅ Day 1 (live) | Professor lessons + diamond lessons → patterns library. Diamond #N is born knowing everything #1…#N-1 learned. |
| **Comprehension** ("did a cold student learn?") | ⏳ Later (needs students) | pre/post quiz → `comprehension_result` → Tier-8 Proposer → `proposal_queue`. Currently **0 rows** — lights up at stage ⑤. |

The day-1 compounding is genuine — it compounds on **correctness + pedagogy** now, and **adds
comprehension** once students exist. You are not waiting for the flywheel to start; half of it
already turns.

---

## The hard floor (never bends — Rule 18 / The Learning Model)

Every feedback-driven change is **offline, written as a reviewable artifact, and human-gated**
(founder approves now; graduates to auto-promote only when Tier-9 gates earn trust and
comprehension does not regress). **No un-reviewed generative process ever decides the physics a
student sees at runtime.** The loop compounds quality without ever letting the machine secretly
rewrite a lesson.

---

*Status of the loop today: Part 1 (authoring) ~65% built and battle-tested; Part 2 (production /
student) wired but empty — 0 students, `proposal_queue` table not yet created, Tier-8 agents are
markdown specs. The professor gate (④) is the human comprehension/pedagogy gate that lets the loop
close NOW on 1–2 reviewers instead of waiting for 2,000 students. See Session 59 audit.*
