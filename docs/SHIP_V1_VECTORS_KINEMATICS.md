# PhysicsMind v1 — Vectors & Kinematics Ship Plan

**Version:** 1.0 | **Date:** 2026-04-27 | **Owner:** Pradeep
**Scope:** DC Pandey Vol 1 Chapters 5 (Vectors) + 6 (Kinematics)
**Audience:** First 20–30 founding students (Class 11 JEE/NEET aspirants) + internal team
**Quality bar:** 99% on EPIC-L, 95% on Deep-Dive, basic Board mode v1

---

## Document scope

This document is **two things at once**:

1. **A founding-student curriculum guide** — what they get, how to use it, how to give feedback. Distributable as-is to the WhatsApp beta cohort.
2. **An internal shipping spec** — every atomic concept, every state count, every gate, every week of the 10-week sprint. Alex, Peter Parker, and Pradeep work directly from Sections D + E.

Where the two audiences diverge, sections are tagged 🎓 (student-facing) or 🛠️ (internal). Sections without tags are both.

---

## Conflict reconciliation with existing docs

Before authoring, I cross-checked against `CLAUDE.md`, `PLAN.md`, `PROGRESS.md` (session 37), and `CLAUDE_REFERENCE.md`. Three reconciliations:

| Prior doc | Said | This doc says | Why |
|---|---|---|---|
| PLAN.md (2026-04-22) | "150-concept scale" target | **~55 concepts (Ch.5+Ch.6 only) for v1 ship** | Session 37 narrowed to 30; this further narrows to 2 chapters for actual launch wedge. PLAN.md's 150 is post-v2. |
| PLAN.md Phase E | "Ch.8 forces retrofit" | **Phase E.5 inserted: Ch.5+Ch.6 v1 ship before Phase E** | Pradeep redirected scope: ship 2 chapters perfectly first, then return to Ch.8 retrofit as Phase E proper. |
| CLAUDE_REFERENCE.md | "~60 atomic concepts shipped" | **17 Ch.5 + 27 Ch.6 = 44 panelConfig-registered, but only ~2 at gold-standard quality** | "Live" in catalog ≠ "gold-standard." Most need retrofit per Rules 15–21 of CLAUDE.md §2. |

**No conflict** on: engine architecture (44 engines), agent system (Alex/Peter Parker/etc.), `engine_bug_queue` (29 rows), capability manifest plan, async author-from-failure pipeline, runtime mode strategy (classify+retrieve, not generate).

This document is the **canonical scope** for v1 ship. PLAN.md's longer-term roadmap remains valid for v1.1+.

---

# Part A — For Founding Students 🎓

## Welcome, Founding Student

You're getting access to PhysicsMind before anyone else.

Right now, the app focuses on **two chapters**: Vectors (Ch.5) and Kinematics (Ch.6) — the foundation of all of mechanics. By the time you've finished both, you'll have built the conceptual base every JEE / NEET problem in mechanics rests on.

This is a **closed beta**. We're shipping Ch.5 + Ch.6 first because:
- These are the chapters most students struggle with silently — vectors break early, kinematics gets memorized, and 80% of JEE Mains mechanics points are lost here.
- Getting these two perfect is more useful than getting all 21 chapters mediocre.
- Your feedback shapes what gets built next.

## What you'll learn

### From Vectors (Ch.5):

- What makes a vector a vector (and why pressure or current isn't one despite having a "direction-feel")
- Triangle and parallelogram law for adding vectors — visually, not just by formula
- Vector resolution into components, including on inclined planes (the JEE classic)
- Dot product and cross product — when to use each, and what the geometric meaning is
- Why complementary projection angles give the same range (the trick examiners love)

### From Kinematics (Ch.6):

- Distance vs displacement, speed vs velocity — the difference that costs students 1 mark per mistake
- The three kinematic equations (`v = u + at`, `s = ut + ½at²`, `v² = u² + 2as`) and exactly when each one applies
- Free fall — including the negative-time solutions that confuse 90% of students
- Motion graphs (x-t, v-t, a-t) and how to read them as fast as you'd read a sentence
- Relative motion — river-boat, rain-umbrella, aircraft-wind — the three problem patterns that always show up
- Non-uniform acceleration: when `a` depends on time, position, or velocity (the calculus part)

## How to use the app

> **Open the app → click Learn → pick Class 11 → expand Ch.5 or Ch.6 → click any concept**

Each concept opens a **lesson card**:

1. **Watch the simulation** — it plays automatically through 5–12 states (depending on concept depth). Real physics, not just animations.
2. **Pick your mode**: Conceptual (default) for understanding, Board / Exam for answer-sheet style derivation that mirrors what you'd write on a CBSE / state-board paper.
3. **If you're confused at any state**, click **🤔 I'm confused** — opens a chat scoped to exactly the state you're stuck on. Type a question, get an answer.
4. **For hard states**, the **🪜 Step-by-step** chip appears — it elaborates that one state in 4–6 sub-states.
5. **Rate your understanding** after each state with the emoji meter (😕 😐 🙂 😊 💪). Low ratings auto-trigger a different explanation approach.

## What's complete vs in progress

| Chapter | What's ready now | What's coming in beta |
|---|---|---|
| **Ch.5 Vectors** | 17 of 23 atomic concepts have working simulations | Remaining 6 + Board mode + Deep-dives shipping over 4 weeks |
| **Ch.6 Kinematics** | 27 of 32 atomic concepts have working simulations | Remaining 5 + Board mode + Deep-dives shipping over 5 weeks |

Concepts that aren't ready yet show as **"Coming soon"** in the catalog with the prerequisites visible — so you can see what's coming and the order it'll arrive.

## How to give feedback

Three ways, ranked by how much they help us:

1. **In-app**: Use the emoji meter (😕 😐 🙂 😊 💪) after every state. We see this real-time.
2. **WhatsApp group** (link in your welcome email): Day-of feedback. "This simulation broke at STATE_3" type stuff.
3. **Weekly form** (Tally link in welcome email): Structured — what's working, what's not, what concepts you want next.

If you find a bug or something looks wrong on screen, **screenshot + WhatsApp group** is the fastest path to a fix. Most bugs get patched within 24 hours.

## Beta cohort commitments (what we ask of you)

In exchange for free lifetime access + Founding Student certificate:

- Use the app **3× per week for 4 weeks**
- Fill out a 5-minute weekly feedback form
- Stay in the WhatsApp group (no spam — only updates from Pradeep + bug reports)
- One short video testimonial at the end of beta (only if you find it useful — no obligation)

---

# Part B — The Catalog (atomic concepts in scope)

## Ch.5 Vectors — 23 atomic concepts

DC Pandey Vol 1 Ch.5 sections: 5.1–5.5. Concept entry-point in dependency order.

| § | Concept ID | Concept Name | EPIC-L states | Deep-dive states | JEE weight | Status today |
|---|---|---|---|---|---|---|
| 5.1 | scalar_vs_vector | Scalar vs Vector Quantities | 4 | 0 | low | ❌ ghost |
| 5.1 | vector_basics | Vector — Basics (magnitude, direction, representation) | 5 | 1 | medium | ❌ ghost |
| 5.1 | pressure_scalar | Why Pressure is a Scalar Despite Acting in All Directions | 4 | 1 | low | ✅ live (retrofit needed) |
| 5.1 | current_not_vector | Why Electric Current Is Not a Vector | 3 | 0 | low | ✅ live (retrofit needed) |
| 5.2 | equal_vs_parallel | Equal vs Parallel Vectors | 4 | 0 | low | ✅ live (retrofit needed) |
| 5.2 | negative_vector | Negative of a Vector | 3 | 0 | low | ✅ live (retrofit needed) |
| 5.2 | unit_vector | Unit Vector | 5 | 1 | high | ✅ live (retrofit needed) |
| 5.2 | area_vector | Area as a Vector — Two Faces of One Quantity | 5 | 1 | medium | ✅ live (retrofit needed) |
| 5.3 | vector_addition_triangle | Vector Addition — Triangle Law | 6 | 1 | high | ❌ ghost |
| 5.3 | parallelogram_law_test | Parallelogram Law of Addition | 6 | 1 | high | ✅ live (retrofit needed) |
| 5.3 | resultant_formula | Magnitude of Resultant (R² = A² + B² + 2AB cos θ) | 5 | 1 | high | ✅ live (retrofit needed) |
| 5.3 | direction_of_resultant | Direction of Resultant (tan α = ...) | 5 | 1 | medium | ✅ live (retrofit needed) |
| 5.3 | vector_subtraction | Vector Subtraction (A − B = A + (−B)) | 5 | 1 | medium | ❌ ghost |
| 5.3 | range_inequality | Range of Resultant: \|A−B\| ≤ \|R\| ≤ A+B | 4 | 0 | high | ✅ live (retrofit needed) |
| 5.4 | vector_components | Vector Components | 5 | 1 | high | ❌ ghost |
| 5.4 | vector_resolution | Vector Resolution into Axes | 6 | 2 | high | ✅ live (retrofit needed) |
| 5.4 | negative_components | Sign of Components in Each Quadrant | 4 | 1 | medium | ✅ live (retrofit needed) |
| 5.4 | inclined_plane_components | Components on an Inclined Plane (mg sin θ, mg cos θ) | 7 | 2 | **highest** | ✅ live (retrofit needed) |
| 5.4 | unit_vector_form | î ĵ k̂ Unit Vector Form | 5 | 1 | high | ✅ live (retrofit needed) |
| 5.5 | dot_product | Dot Product (A·B = AB cos θ) | 7 | 2 | high | ✅ live (retrofit needed) |
| 5.5 | angle_between_vectors | Finding Angle Between Two Vectors | 5 | 1 | high | ✅ live (retrofit needed) |
| 5.5 | cross_product | Cross Product (A×B = AB sin θ n̂) | 7 | 2 | high | ❌ ghost |
| 5.5 | scalar_multiplication | Scalar Multiplication of a Vector | 4 | 0 | low | ✅ live (retrofit needed) |

**Ch.5 totals:**
- Atomic concepts: **23**
- Total EPIC-L states across the chapter: **~115**
- Total Deep-dive states: **~22 hard states × 5 sub-states = ~110 sub-sims**
- Concepts to author from scratch (ghost → gold): **6**
- Concepts to retrofit: **17**
- Board mode coverage required on every concept: **23**

## Ch.6 Kinematics — 32 atomic concepts

DC Pandey Vol 1 Ch.6 sections: 6.1–6.10.

| § | Concept ID | Concept Name | EPIC-L states | Deep-dive states | JEE weight | Status today |
|---|---|---|---|---|---|---|
| 6.3 | classification_of_motion | 1D, 2D and 3D Motion | 4 | 0 | low | ❌ ghost |
| 6.3 | translational_vs_rotational | Translational vs Rotational Motion | 4 | 0 | low | ❌ ghost |
| 6.4 | distance_displacement_basics | Distance vs Displacement | 5 | 1 | high | ✅ live (retrofit) |
| 6.4 | average_speed_velocity | Average Speed vs Average Velocity | 5 | 1 | high | ✅ live (retrofit) |
| 6.4 | instantaneous_velocity | Instantaneous Velocity (limit of avg as Δt→0) | 6 | 2 | high | ✅ live (retrofit) |
| 6.4 | acceleration_definition | Acceleration — Definition (dv/dt) | 5 | 1 | medium | ❌ ghost |
| 6.5 | uniform_motion | Uniform Motion (a = 0) | 4 | 0 | low | ❌ ghost |
| 6.6 | three_cases | Three Kinematic Cases (v = u+at, s = ut+½at², v² = u²+2as) | 8 | 2 | **highest** | ✅ live (retrofit) |
| 6.6 | s_in_equations | Meaning of 's' in Kinematic Equations | 5 | 1 | medium | ✅ live (retrofit) |
| 6.6 | sign_convention | Sign Convention in 1D Motion | 6 | 2 | high | ✅ live (retrofit) |
| 6.6 | sth_formula | Distance in n-th Second (s_n = u + a(n−½)) | 5 | 1 | medium | ✅ live (retrofit) |
| 6.6 | direction_reversal | Direction Reversal Cases (turnaround) | 6 | 2 | high | ✅ live (retrofit) |
| 6.6 | free_fall | Free Fall (g, multiple drops, simultaneous starts) | 8 | 3 | **highest** | ✅ live (retrofit) |
| 6.6 | negative_time | Negative Time Solutions (when to keep, when to discard) | 5 | 2 | high | ✅ live (retrofit) |
| 6.7 | a_function_of_t | a = a(t) — Acceleration as Function of Time | 7 | 2 | high | ✅ live (retrofit) |
| 6.7 | a_function_of_x | a = a(x) — Acceleration as Function of Position | 7 | 2 | high | ✅ live (retrofit) |
| 6.7 | a_function_of_v | a = a(v) — Acceleration as Function of Velocity | 7 | 2 | high | ✅ live (retrofit) |
| 6.7 | initial_conditions | Initial Conditions in Integration | 5 | 1 | medium | ✅ live (retrofit) |
| 6.9 | xt_graph | Position–Time Graph | 6 | 2 | high | ✅ live (retrofit) |
| 6.9 | vt_graph | Velocity–Time Graph | 6 | 2 | high | ✅ live (retrofit) |
| 6.9 | at_graph | Acceleration–Time Graph | 5 | 1 | medium | ✅ live (retrofit) |
| 6.9 | area_under_vt | Area Under v–t = Displacement | 5 | 1 | high | ❌ ghost |
| 6.10 | relative_1d_cases | Relative Motion — 1D Cases | 6 | 2 | high | ✅ live (retrofit) |
| 6.10 | vab_formula | Relative Velocity Formula (v_AB = v_A − v_B) | 5 | 1 | high | ✅ live (retrofit) |
| 6.10 | time_to_meet | Time to Meet — Relative Motion Setup | 6 | 2 | high | ✅ live (retrofit) |
| 6.10 | upstream_downstream | Upstream vs Downstream — River-Boat | 6 | 2 | high | ✅ live (retrofit) |
| 6.10 | shortest_time_crossing | Shortest Time to Cross a River | 5 | 1 | high | ✅ live (retrofit) |
| 6.10 | shortest_path_crossing | Shortest Path to Cross a River | 6 | 2 | high | ✅ live (retrofit) |
| 6.10 | apparent_rain_velocity | Rain–Umbrella — Apparent Velocity | 6 | 2 | high | ✅ live (retrofit) |
| 6.10 | umbrella_tilt_angle | Umbrella Tilt Angle | 5 | 1 | medium | ✅ live (retrofit) |
| 6.10 | ground_velocity_vector | Ground Velocity in Aircraft–Wind Problems | 6 | 2 | high | ✅ live (retrofit) |
| 6.10 | heading_correction | Heading Correction in Crosswind | 6 | 2 | medium | ✅ live (retrofit) |

**Ch.6 totals:**
- Atomic concepts: **32**
- Total EPIC-L states across the chapter: **~180**
- Total Deep-dive states: **~50 hard states × 5 sub-states = ~250 sub-sims**
- Concepts to author from scratch (ghost → gold): **5**
- Concepts to retrofit: **27**
- Board mode coverage required on every concept: **32**

## v1 grand total

| | Ch.5 | Ch.6 | **Total** |
|---|---|---|---|
| Atomic concepts | 23 | 32 | **55** |
| EPIC-L states | ~115 | ~180 | **~295** |
| Deep-dive sub-sims | ~110 | ~250 | **~360** |
| Board mode JSONs | 23 | 32 | **55** |
| Ghost-to-gold authoring | 6 | 5 | **11** |
| Live-to-gold retrofit | 17 | 27 | **44** |

---

# Part C — Per-Concept Authoring Spec 🛠️

Every atomic concept in the v1 scope must satisfy this spec to ship. This is the gate Alex draft → Pradeep approve runs against.

## C.0 ⚠ v1 JSON authoring scope — what's IN the JSON vs what's NOT

**This is the most important section for Alex. Read carefully. Misreading this doubles the per-concept authoring time.**

The full gold-standard v2.1 schema (per CLAUDE.md §6) supports six teaching modes: EPIC-L, EPIC-C, LOCAL, MICRO, DEEP-DIVE, DRILL-DOWN. **For v1, we author only TWO modes as simulations** (EPIC-L + Deep-dive) and let the side-chat handle the other four as text responses. This is a deliberate scope cut to ship Ch.5+Ch.6 in 10 weeks.

### Author IN the JSON for v1

| Field | Required | What |
|---|---|---|
| `concept_id`, `concept_name`, `chapter`, `section`, `class_level` | ✅ | Identity + catalog metadata |
| `prerequisites: [concept_id, ...]` | ✅ | Soft-advisory, shown in lesson card header |
| `epic_l_path.states.STATE_N` (5–12 states, complexity-driven) | ✅ | The default lesson — Conceptual mode |
| `scene_composition.primitives` (≥3 per state, Rule 19) | ✅ | The visual layer |
| `advance_mode` per state (≥2 distinct values, Rule 15) | ✅ | Variety = pedagogy; all-auto rejected |
| `teacher_script.text_en` per state | ✅ | Narration (Rule 13: text_en, not text) |
| `allow_deep_dive: true` on 1–3 hard states | ✅ | Triggers the 🪜 chip in UI |
| Deep-dive sub-states (4–6 per flagged state) | ✅ | The ONLY runtime-triggered sim besides EPIC-L |
| `mode_overrides.board.canvas_style: "answer_sheet"` | ✅ | Board mode toggle |
| `mode_overrides.board.derivation_sequence` | ✅ | Handwriting-animation answer |
| `mode_overrides.board.mark_scheme` | ✅ | Step → mark mapping |
| Mark band tags `bands: [2, 3, 5]` per derivation step | ✅ | v1 mark band filter |
| `mode_overrides.competitive` (shortcuts + edge_cases) | ✅ | JEE / NEET tips overlay |
| Real-world Indian context anchor | ✅ | CLAUDE.md §8: plain English, no Hinglish |

### NOT in the v1 JSON (handled by side-chat text-only)

| Field | v1 status | When to add |
|---|---|---|
| `epic_c_branches` (misconception correction paths) | ❌ **DO NOT AUTHOR** | v1.1 — only after beta `chat_feedback` data shows top misconceptions per concept |
| `drill_downs` (confusion-cluster sub-sims) | ❌ **DO NOT AUTHOR** | v1.1 — only after `confusion_cluster_registry` has real student phrases logged |
| MICRO sub-states (one-symbol/formula refreshers) | ❌ **DO NOT AUTHOR** | v1.2+ — side-chat text response handles "what does μ mean?" in v1 |
| LOCAL skip-the-hook entry points | ❌ **DO NOT AUTHOR** | v1.2+ — URL param `?path=local` routes to EPIC-L for v1 |
| Empty/placeholder EPIC-C fields | ❌ **OMIT ENTIRELY** | Don't leave empty `epic_c_branches: []` arrays — schema validator accepts absence. Cleaner. |

**Rationale for the cut (per session 37 Decision 4 in PROGRESS.md):**

The student input is unbounded (infinite ways to ask "I'm confused"). The correct response set is bounded — there are only so many actual misconceptions, only so many actual symbols. **Don't speculatively author the bounded responses. Let beta data tell you which ones to author for v1.1.** Authoring 240 EPIC-C variants and 1,800 drill-down clusters speculatively before launch is the trap that kills solo founders. v1 = EPIC-L + Deep-dive + Board mode + Competitive mode. Everything else is graceful side-chat fallback.

### UI surface for v1 (what triggers what)

| Student action | v1 response | Why |
|---|---|---|
| Opens concept page | EPIC-L plays (cached or generated once, then cached) | Default lesson |
| Toggles Conceptual ⇄ Board | `mode_overrides.board` re-renders | Mode toggle on lesson card |
| Clicks 🪜 Step-by-step (only on `allow_deep_dive: true` states) | Deep-dive sub-states render inline in same iframe | The ONLY sim-based runtime trigger besides EPIC-L |
| Clicks 🤔 I'm confused | Side-chat drawer opens, **text-only** response from Sonnet/Haiku scoped to current state | No EPIC-C sim authored — text suffices for v1 |
| Rates 😕 or 😐 (≤2) on ConfidenceMeter | Side-chat auto-opens, **text-only** response | Same text path |
| Types "what does μ mean?" in side-chat | Sonnet/Haiku writes a text answer | No MICRO sim — text in v1 |
| Types any other confusion | Sonnet/Haiku writes a text answer + phrase logged to `confusion_cluster_registry` | Demand signal for v1.1 authoring |

### The async loop that turns v1 text answers into v1.1 simulations

```
Week 1 of beta — student types: "but what if surface is wet?"
                                 ↓
v1: Side-chat returns text answer. Phrase logged to confusion_cluster_registry.
                                 ↓
Week 4 of beta — Alex reviews registry: "5 students asked wet-surface variants."
                                 ↓
v1.1 sprint: Alex drafts a drill-down sub-sim for the cluster. Pradeep approves.
                                 ↓
Cluster ships in v1.1 deploy. Same student type tomorrow → cached sub-sim served (no text fallback needed anymore).
```

**This is the moat.** Every confusion phrase that comes back as text in v1 becomes a hand-authored sub-sim in v1.1. Library converges on what students *actually need*, not speculation. Anthropic / Google can't replicate this without paying for the same student data we're collecting for free.

---

## C.1 EPIC-L (the default lesson) requirements

Per CLAUDE.md §2 self-review checklist + §7 state count rules:

| Requirement | Rule | What it means |
|---|---|---|
| State count | concept-driven, NOT fixed | Simple concept (e.g., scalar_vs_vector): 3–4 states. Complex concept (e.g., free_fall, three_cases): 8–12 states. **No template.** |
| Variety in `advance_mode` | Rule 15 | At least 2 distinct values across states: `auto_after_tts`, `manual_click`, `wait_for_answer`, `interaction_complete`. All-`auto_after_tts` = passive video, REJECTED. |
| Scene composition | Rule 19 | Every state has `scene_composition.primitives.length ≥ 3`. Empty arrays are gate-rejected. |
| Real-world anchor | CLAUDE.md §8 | Indian context, plain English, no Hinglish. E.g., "block sliding on a rough Karnataka highway" not "block on incline." |
| Misconception (EPIC-C STATE_1) | Rule 16 | **NOT REQUIRED in v1** — EPIC-C is omitted from v1 JSONs entirely (see C.0). When v1.1 adds EPIC-C, this rule re-activates. |
| Schema validation | `npm run validate:concepts` | Zod-typed JSON. Gate 0 — no JSON ships if this fails. |
| Prerequisites | Gold-standard schema | `prerequisites: [concept_id, ...]` array. Used in catalog header + soft suggestions. |
| Deep-dive flags | Gold-standard schema | `epic_l_path.states.STATE_N.allow_deep_dive: true` on hard states (typically 1–3 per concept). |

### State-count guidance per concept type

| Complexity | Examples in v1 | EPIC-L states |
|---|---|---|
| Trivial | scalar_vs_vector, classification_of_motion, uniform_motion | 3–4 |
| Simple | unit_vector, average_speed_velocity, sth_formula | 4–5 |
| Medium | dot_product, sign_convention, vt_graph | 5–7 |
| Complex | three_cases, free_fall, inclined_plane_components | 7–9 |
| Very complex | a_function_of_v (calculus chain), heading_correction (vector + relative) | 8–12 |

## C.2 Deep-dive requirements

For each state flagged `allow_deep_dive: true`:

| Requirement | Detail |
|---|---|
| Sub-state count | 4–6 sub-states (driven by complexity, not template) |
| Trigger | Student clicks **🪜 Step-by-step** chip — only renders on flagged states |
| Cache key | `concept_id \| state_id \| class_level \| mode` (4D) |
| Inline rendering | Sub-states render in the SAME iframe via `inline_scene_composition` postMessage — no new iframe |
| State id format | `STATE_N_DD_M` (e.g., `STATE_3_DD_1`) — never overlaps with parent |
| Status badge | First-student deep-dive shows `pending_review` until Pradeep approves; auto-promoted after 20 positive feedbacks with zero negatives (per CLAUDE.md §18) |

**Per-concept budget:** ~2–3 hard states × 5 sub-states avg = **~12 sub-sims per concept**. Across 55 concepts: **~660 sub-sims total**. Authored at ~30 minutes per sub-sim by Alex (with Pradeep approval at 5 min/sub-sim) = **~50 founder-approval-hours total** for all v1 deep-dives.

## C.3 Board mode requirements

Per CLAUDE.md §5 Rule 21 + session 37 Decision 6:

| Requirement | Detail |
|---|---|
| `canvas_style: "answer_sheet"` | White ruled-paper background. CSS swap, no new renderer. |
| `derivation_sequence` | Per-state `primitives` array with `animate_in: "handwriting"` — writes the answer character-by-character on the answer sheet. |
| `mark_scheme` | Object mapping step IDs to mark values. E.g., `{ "step_1": 1, "step_2": 1, "step_3": 2, "step_4": 1 }` totaling the question's marks. |
| `mark_badge` primitive | Yellow "+N marks" overlay per state, accumulates as student progresses. Tied to a specific line in `mark_scheme`. |
| Mark-band tags | Each step in `derivation_sequence` carries `bands: [2, 3, 5]` array. Filter at render time per student's selected mark band. v1 mark band set: **{2, 3, 5}**. (7-mark deferred to v1.2.) |
| PYQ links | After ship, query `pyq_questions` table for top 3–5 past-year questions tagged `concept_id`. Render below sim with click-through. **PYQ table must be backfilled — see Section E timeline.** |
| Final state | The complete answer template student should reproduce on a real exam paper. |

**Per-concept board mode authoring time:** ~2 hours (Alex 1.5h draft + Pradeep 0.5h approve). Across 55 concepts: **~30 founder-approval-hours total**.

## C.4 The gate stack (Gate 0 → Gate 8)

Every concept must pass all 9 gates before shipping:

| Gate | Check | Tool / method |
|---|---|---|
| **0** | JSON schema valid (Zod) | `npm run validate:concepts` |
| **1** | All 3 modes present (Conceptual + Board + Competitive) | `physicsValidator.ts` mode check |
| **2** | EPIC-L state count concept-appropriate (Section C.1 table) | `physics-author` agent review |
| **3** | Rule 15: ≥2 distinct `advance_mode` values | `quality-auditor` Rule-15 probe |
| **4** | Rule 16: EPIC-C STATE_1 wrong belief | **SKIPPED for v1** — EPIC-C not authored in v1 JSONs (see C.0). Re-enables in v1.1. |
| **5** | Rule 19: every state ≥3 primitives | `quality-auditor` Rule-19 probe |
| **6** | Rule 20: all 3 modes shipped | `quality-auditor` Rule-20 probe |
| **7** | Rule 21: board mode complete (canvas_style + derivation_sequence + mark_scheme) | `quality-auditor` Rule-21 probe |
| **8** | `engine_bug_queue` — 29-bug regression probe set passes | `quality-auditor` Gate 8 (existing infrastructure) |

A concept that fails ANY gate is sent back to Alex for fixes. Pradeep does not approve concepts with open gate failures.

---

# Part D — Internal Shipping Workflow 🛠️

## D.1 Agent roles + division of labor

| Agent | Owns | Output | Pradeep's role |
|---|---|---|---|
| **architect** (Claude main) | Strategic design, schema decisions, scope changes | Specs, decision docs | Approve scope changes |
| **alex (json-author)** | Drafts EPIC-L JSONs from concept_id + DC Pandey ToC | New / retrofitted concept JSONs (Conceptual + Board + Competitive modes) | Approve final JSON |
| **physics-author** | Validates derivations, formulas, edge cases | Marked-up JSON with physics corrections | Spot-check derivations |
| **peter_parker (renderer-primitives)** | Implements/extends PCPL primitives + `mechanics_2d_renderer` scenarios | Renderer code, primitive additions | Approve new primitives (CLAUDE.md §17) |
| **peter_parker (runtime-generation)** | Bug fixes in runtime path (deep-dive, drill-down generators) | Patches to runtime code | Approve patches |
| **quality-auditor** | Runs Gate 0–8 against every concept JSON | Pass/fail report per concept | Resolve gate failures |
| **feedback-collector** | Mines confusion data from beta cohort | Cluster proposals for new drill-downs | Approve cluster additions |

**Pradeep's irreplaceable bottleneck:** approval. Per CLAUDE.md §17, every JSON, every new primitive, every cluster needs Pradeep's eye. Time spent doing what an agent could do is time stolen from approval throughput.

## D.2 Per-concept workflow (the loop that runs 55 times)

```
1. Pradeep picks next concept from priority queue
   ↓
2. Alex drafts EPIC-L JSON (Conceptual + Board + Competitive modes)
   - References DC Pandey Vol 1 ToC for syllabus scope only (CLAUDE.md §8)
   - Uses existing PCPL primitives + scenarios (no new renderer code)
   - Authors prerequisites array, allow_deep_dive flags, mark_scheme
   ↓
3. physics-author reviews derivations (autonomous)
   ↓
4. quality-auditor runs Gate 0–8 (autonomous)
   ↓
5. Failures → Alex iterates, OR peter_parker patches a primitive bug
   ↓
6. Pradeep reviews final JSON (5–15 min per concept)
   - Approves OR sends back with notes
   ↓
7. Concept ships to /learn/[concept_id] route
   ↓
8. Alex authors deep-dive sub-sims for allow_deep_dive states (~12 per concept)
   ↓
9. quality-auditor + Pradeep approve deep-dives
   ↓
10. Concept fully shipped (EPIC-L + Deep-dive + Board mode)
```

**Per-concept founder hours:** ~2.5–3.5 hours (steps 6 + 9). Across 55 concepts: **~150 founder-hours total**.

## D.3 Engine bug queue integration

Every concept ships with the **29-row engine_bug_queue** as Gate 8 regression probe. New bugs discovered during v1 ship get **logged + fixed + added to the queue** so they never recur.

Per CLAUDE.md "Engines learn nothing. JSONs learn everything. Humans approve everything." — the bug queue is the *engines learning* part, but only via Pradeep-approved migrations to the queue.

Expected new bugs from v1 ship: **~10–20 net-new entries** as Ch.5/Ch.6 stress-tests scenarios that Ch.8 friction work didn't cover (e.g., relative-motion frame swaps, calculus-driven acceleration plots).

## D.4 Capability manifest (Layer 1 of runtime defense)

Before deep-dives ship at scale, the **capability manifest** must be in Sonnet's prompt (per session 37 Decision 3). This is engineering work, not authoring — Claude does 90% of the code. Schedule: **Week 4 of the sprint** (sweet spot before deep-dives ramp).

Effect: Sonnet's deep-dive briefs reference only manifest-listed primitives. Schema-validator rejects briefs with hallucinated primitives. **Bug class A (library gap) drops from ~15% → ~2%.** Cost neutral due to prompt caching.

---

# Part E — 10-Week Sprint Timeline 🛠️

## Locked sprint plan (revisable at week-5 mid-sprint review)

Pradeep budget: **14 build-hours/week** + **5 GTM-hours/week** = 19 hr/week total.

### Phase 1 — Ch.5 Vectors (weeks 1–4)

| Week | Concept targets | Founder time spend |
|---|---|---|
| **Week 1** | Author 4 ghost concepts (scalar_vs_vector, vector_basics, vector_addition_triangle, vector_subtraction). Retrofit 4 simple live concepts (current_not_vector, equal_vs_parallel, negative_vector, scalar_multiplication). | 8 concepts × 1.5 hr Pradeep approval = **12 hrs** |
| **Week 2** | Retrofit 6 medium concepts (unit_vector, area_vector, parallelogram_law_test, resultant_formula, direction_of_resultant, range_inequality). | 6 × 1.5 = **9 hrs** + 2 hrs deep-dive backfill = **11 hrs** |
| **Week 3** | Author 2 ghost concepts (vector_components, cross_product). Retrofit 5 medium concepts (vector_resolution, negative_components, unit_vector_form, dot_product, angle_between_vectors). | 7 × 1.5 = **10 hrs** + 2 hrs deep-dive = **12 hrs** |
| **Week 4** | Retrofit complex (inclined_plane_components — JEE highest weight, deserves extra care). Capability manifest engineering (Claude does 90%, Pradeep approves). Backfill all Ch.5 deep-dives. | 1 hr concept + 2 hrs manifest review + 8 hrs deep-dive approval = **11 hrs** |

**End of Week 4:** All 23 Ch.5 concepts shipped at gold-standard with EPIC-L + Deep-dive + Board mode v1.

### Phase 2 — Ch.6 Kinematics (weeks 5–9)

| Week | Concept targets | Founder time spend |
|---|---|---|
| **Week 5** | Author 5 ghost concepts (classification_of_motion, translational_vs_rotational, acceleration_definition, uniform_motion, area_under_vt). Mid-sprint review — adjust if behind schedule. | 5 × 1.5 = **7 hrs** + 4 hrs review/adjust = **11 hrs** |
| **Week 6** | Retrofit 6 §6.4–6.6 simple concepts (distance_displacement_basics, average_speed_velocity, instantaneous_velocity, sth_formula, s_in_equations, sign_convention). | 6 × 1.5 = **9 hrs** + 3 hrs deep-dive = **12 hrs** |
| **Week 7** | Retrofit 5 §6.6 complex concepts (three_cases ⭐, free_fall ⭐, direction_reversal, negative_time, initial_conditions). Three-cases and free-fall are JEE highest weight — extra Pradeep care. | 5 × 2 = **10 hrs** + 2 hrs deep-dive = **12 hrs** |
| **Week 8** | Retrofit 6 §6.7–6.9 calculus-driven (a_function_of_t, a_function_of_x, a_function_of_v, xt_graph, vt_graph, at_graph). | 6 × 1.5 = **9 hrs** + 3 hrs deep-dive = **12 hrs** |
| **Week 9** | Retrofit 9 §6.10 relative-motion concepts (relative_1d_cases, vab_formula, time_to_meet, upstream_downstream, shortest_time/path_crossing, apparent_rain_velocity, umbrella_tilt_angle, ground_velocity_vector, heading_correction). | 9 × 1 = **9 hrs** + 5 hrs deep-dive = **14 hrs** |

**End of Week 9:** All 32 Ch.6 concepts shipped at gold-standard.

### Phase 3 — Polish + ship (week 10)

| Week | Activity | Founder time |
|---|---|---|
| **Week 10** | Backfill remaining Ch.6 deep-dives. Visual regression run across all 55 concepts. PYQ table backfill for top 30 concepts. Bug-queue net-new entries closed. Beta launch readiness check (catalog renders, lesson cards play, ConfidenceMeter logs, side-chat responds). | **14 hrs** |

**End of Week 10:** v1 is shippable. Open beta to first 30 founding students.

## Parallel GTM track (5 hrs/week, runs throughout)

| Week | GTM action |
|---|---|
| 1–2 | Record 90-second screencast. Post to r/JEE + Twitter + own YouTube. Cold-email 20 physics teachers. Set up Tally beta sign-up form + WhatsApp group. |
| 3–4 | Onboard first 10 sign-ups for closed alpha (Ch.5 only). Founder demo calls. Collect testimonials. |
| 5–6 | Open closed alpha to 20 students. Daily WhatsApp engagement. Weekly feedback form. |
| 7–8 | Post-alpha pivot — fix any P0 bugs. Add more Ch.6 invitees. |
| 9–10 | Open beta launch sequence: pre-launch email, launch post, AMA on r/JEE, founder thread on Twitter (#JEE2027). |

## Risk register (and mitigations)

| Risk | Likelihood | Mitigation |
|---|---|---|
| Pradeep falls behind by week 4 | HIGH | Mid-sprint review at week 5 — drop deep-dives for low-JEE-weight concepts (cross_product, scalar_multiplication, area_vector) before dropping core retrofits |
| New PCPL primitive needed for relative-motion sims | MEDIUM | peter_parker authors offline Week 5–6; manifest update Week 7 |
| Visual probe surfaces new bug class (e.g., calculus-graph rendering) | MEDIUM | Reserve 4 buffer-hours/week (already in plan). New bugs added to engine_bug_queue immediately. |
| Beta sign-up < 15 students by Week 6 | MEDIUM | Pivot GTM channel mix — escalate Telegram + cold-email teacher outreach |
| Anthropic API cost overrun | LOW | Capability manifest with prompt caching (Week 4) keeps costs flat. Monitor `/admin/costs` weekly. |

---

# Part F — Distribution Plan 🎓 + 🛠️

## F.1 Beta cohort target: 30 founding students

| Channel | Target sign-ups | Funnel |
|---|---|---|
| r/JEE detailed founder post | 8–12 | Reddit → Tally form → WhatsApp |
| 5 JEE Telegram channels (cross-post) | 8–12 | TG → Tally → WhatsApp |
| Cold-email 20 Tier-2-city physics teachers | 6–10 | Teacher → student email → Tally |
| Twitter/X #JEE2027 build-in-public | 3–5 | Twitter DM → Tally |
| Founder's own YouTube channel (3 short videos) | 3–5 | YouTube comment → Tally |
| **Total funnel target** | **28–44** | Aim for 30 confirmed |

## F.2 Founding Student program (the offer)

In exchange for the 4-week beta commitment:

- **Lifetime free access** to PhysicsMind (Class 11 mechanics + future chapters)
- **"Founding Student" certificate** (PDF, founder-signed) — usable on resume/LinkedIn
- **Direct WhatsApp line to Pradeep** (he replies personally)
- **Top-5 ambassadors** (most engaged) get: ₹500 Amazon voucher per quarter, LinkedIn recommendation from Pradeep, exclusive v2 preview access

## F.3 Onboarding sequence (per student)

```
Day 0  — Tally form submission
Day 0  — Auto-email: "Welcome, founding student! Join WhatsApp here: [link]"
Day 1  — Pradeep personal welcome DM in WhatsApp
Day 2  — First lesson assignment: "Start with Vectors → vector_resolution"
Day 7  — Weekly feedback form #1 (Tally, 5 min)
Day 14 — Weekly feedback form #2
Day 21 — Weekly feedback form #3 + "Do you want a video testimonial slot?"
Day 28 — Beta complete. Founding Student certificate emailed.
```

## F.4 What ships to students at week 10

Open the catalog → see only **Ch.5 + Ch.6** as Class 11 mechanics. (Ch.7–Ch.12 hidden from Class 11 view until v1.1.) Every concept clickable, every concept plays, every concept toggleable to Board mode.

The catalog header reads: *"Class 11 Mechanics — Foundations. 55 concepts. More chapters coming."*

---

# Part G — Success Metrics

## G.1 Ship-readiness (binary — does this go live to students?)

| Metric | v1 ship gate |
|---|---|
| All 55 concepts pass Gate 0–8 | ✅ required |
| `npx tsc --noEmit` clean | ✅ required |
| Visual probe pass rate ≥ 95% across 55 concepts | ✅ required |
| `engine_bug_queue` regression run: 0 new failures | ✅ required |
| Capability manifest live in Sonnet's prompt (Layer 1) | ✅ required |
| ConfidenceMeter writes to `chat_feedback` table | ✅ required |
| Side-chat scoped to current state functioning | ✅ required |
| Beta sign-up form + WhatsApp group live | ✅ required |

## G.2 Beta success (4-week cohort metrics)

| Metric | Target | What it means |
|---|---|---|
| Sign-ups | 30 | Demand signal for the wedge |
| Week-1 active rate | ≥ 70% (21/30) | Real usage, not curiosity click |
| Week-4 retention | ≥ 50% (15/30) | Sticky — they kept coming back |
| ConfidenceMeter median | ≥ 4 (😊 Clear!) | Concepts actually teaching |
| Confusion clusters logged | ≥ 50 | Async author loop has fuel for v1.1 |
| Video testimonials | ≥ 5 | Marketing ammo for public launch |
| WhatsApp engagement | ≥ 100 messages over 4 weeks | Community starting |
| Net Promoter Score (post-beta survey) | ≥ +30 | Healthy founder-friend recommendability |

## G.3 What "successful v1" looks like in one paragraph

> 30 founding students used PhysicsMind for 4 weeks. 18 of them gave high confidence ratings on Vectors and Kinematics concepts. 50+ confusion phrases got logged that we can author drill-downs for in v1.1. 7 students recorded video testimonials, three of which are usable in launch marketing. The catalog rendered Ch.5 + Ch.6 reliably. The capability manifest cut runtime sim bugs by ~60%. We have the data and the social proof to launch publicly in month 4.

---

# Appendix

## A.1 Real-world Indian context anchors per concept

Per CLAUDE.md §8 — Indian context, plain English, no Hinglish. Suggested anchors for the highest-weight concepts:

| Concept | Anchor |
|---|---|
| inclined_plane_components | Hilly highway near Manali — truck on a 20° incline, brake force vs gravity component |
| three_cases | Mumbai local train pulling out of Dadar station — uniform acceleration from 0 |
| free_fall | Coconut falling from a Kerala tree onto a tin roof — terminal vs free fall |
| dot_product | Pulling a suitcase at Indira Gandhi Airport — angle of strap and energy spent |
| upstream_downstream | Boat on Ganga at Varanasi — current 4 km/h, boat 6 km/h still water |
| relative_1d_cases | Two trains on parallel tracks at Howrah Station |
| apparent_rain_velocity | Cyclist in Bengaluru monsoon — angle to tilt umbrella |
| ground_velocity_vector | Air India flight Delhi → Mumbai with crosswind |
| projectile (Ch.7 future) | Cricket ball at Wankhede stadium — boundary distance |

Alex draws from this list when authoring; Pradeep approves substitutions if more vivid.

## A.2 Catalog filter for v1 (hide chapters 7–12 from Class-11 view at launch)

Add a feature flag `V1_CATALOG_FILTER_ENABLED = true` that limits Class-11 catalog rendering to Ch.5 + Ch.6 only. Ch.7–Ch.12 still exist in `conceptCatalog.ts` (so the data is there for v1.1) but don't render. **Implementation: 1-hour Claude task, ship Week 10.**

## A.3 PYQ table backfill priority

For Week 10's PYQ link integration, top 20 concepts (by JEE weight) should have at least 5 past-year questions tagged in `pyq_questions` table. Source: CBSE 2022, 2023, 2024 + JEE Main 2022, 2023, 2024. Alex agent can mine these from open archives — Pradeep approves the tagging. **Estimated effort: 6 hrs Pradeep approval across 100 PYQs.**

## A.4 CLAUDE.md update suggestions (proposed, awaiting approval)

After v1 ship completes, propose to Pradeep:

1. **§6 — Add "v1 catalog filter" to "Adding a New Concept" checklist:** When adding a concept outside Ch.5/Ch.6, ensure it's hidden by `V1_CATALOG_FILTER_ENABLED` until v1.1 launches.

2. **§11 — Update PLAN.md Phase E:** Insert "Phase E.5 — Ch.5+Ch.6 v1 ship (10 weeks)" before existing Phase E (Ch.8 forces retrofit). E.5 completes; then E continues for Ch.7+Ch.8.

3. **§9 — Glossary additions:** "Founding Student", "v1 ship", "Mark band filter", "Catalog filter".

## A.5 What's explicitly OUT OF SCOPE for v1

To prevent scope creep:

**Out of v1 chapters:**
- ❌ Ch.7 Projectile Motion (becomes v1.1, weeks 11–14 post-launch)
- ❌ Ch.8 Laws of Motion (becomes v1.2, picks up Phase E original plan)
- ❌ Ch.9–Ch.12 chapters (v1.3+ post-revenue)

**Out of v1 JSON authoring** (per Section C.0 — Alex DOES NOT author these fields in v1):
- ❌ `epic_c_branches` — misconception correction sims (defer until beta `chat_feedback` data shows top misconceptions)
- ❌ `drill_downs` — confusion-cluster sub-sims (defer until `confusion_cluster_registry` has real student phrases)
- ❌ MICRO sub-states — one-symbol/formula refreshers (side-chat text covers this in v1)
- ❌ LOCAL paths — skip-the-hook entry points (URL param routes to EPIC-L for v1)

**Out of v1 UI (no triggers exposed):**
- ❌ EPIC-C trigger button (auto-trigger on low confidence is a v1.1 feature)
- ❌ Drill-down classifier routing to sub-sim (text response only in v1)
- ❌ MICRO inline 2-state cards in side-chat (text only in v1)

**Out of v1 platform/features:**
- ❌ Hindi/Hinglish UI (v2)
- ❌ Solve mode polish (existing image-upload stays, no enhancement for v1)
- ❌ Mobile-app wrapper (web-only for v1)
- ❌ Payment integration (free for all v1 users)
- ❌ Visual Validator E29 (deferred to month 4 post-launch)
- ❌ 7-mark band board variant (defer to v1.2)
- ❌ Board-specific variants (CBSE-default for v1; Maharashtra/TN bands later)

If any of these tries to creep in mid-sprint, Pradeep + Claude reject it citing this document.

## A.6 The "v1 trigger surface" — single source of truth for the next session

When you (Pradeep) start a new session and ask Alex to draft Ch.5 / Ch.6 JSONs, paste this short reminder into the prompt:

> **v1 JSON authoring rules:**
> - Author EPIC-L (5–12 states), `mode_overrides.board`, `mode_overrides.competitive`, `prerequisites`, `allow_deep_dive: true` on 1–3 hard states, deep-dive sub-states for those states.
> - DO NOT author `epic_c_branches`, `drill_downs`, MICRO sub-states, or LOCAL paths. Omit those fields entirely.
> - Real-world Indian context. Plain English. No Hinglish.
> - Variety in `advance_mode` (Rule 15). Every state ≥3 primitives (Rule 19). All 3 modes present (Rule 20).
> - Reference `physics-mind/docs/SHIP_V1_VECTORS_KINEMATICS.md` Section C.0 for full IN/OUT field list.

This 6-line reminder keeps Alex from over-authoring. Founder approval time per concept stays in the 1.5–2 hour band.

---

## One-line summary

**v1 = 55 atomic concepts (Ch.5 Vectors + Ch.6 Kinematics) at gold-standard quality (EPIC-L + Deep-dive + Board mode v1), shipped over 10 weeks via Alex/Peter Parker/quality-auditor agent workflow with Pradeep as approval bottleneck, distributed to 30 founding students through 5 creator-led India channels, with Founding Student certificates instead of cash incentives.**

Document ends. Execute the Week 1 plan starting tomorrow.
