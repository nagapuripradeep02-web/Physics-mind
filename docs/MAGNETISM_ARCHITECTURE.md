# Magnetism Architecture — Proof-of-Concept for the Recursive Bootstrap Method

**Version:** 1.0 | **Date:** 2026-05-08 | **Owner:** Pradeep
**Scope:** DC Pandey Volume 2, Chapter 26 (Magnetics, sections 26.1–26.18)
**Audience:** Future Claude sessions (loaded on demand) + founder review
**Status:** Diamond #1 shipped (`magnetic_field_wire`). Diamonds #2 and #3 next.

---

## Table of contents

1. [Why this document exists](#1-why-this-document-exists)
2. [Current status snapshot](#2-current-status-snapshot)
3. [The four visual archetypes in Ch.26](#3-the-four-visual-archetypes-in-ch26)
4. [Diamond seed strategy — three diamonds, one per archetype](#4-diamond-seed-strategy--three-diamonds-one-per-archetype)
5. [Atomic JSON catalog (Ch.26)](#5-atomic-json-catalog-ch26)
6. [Nano JSON catalog (Ch.26)](#6-nano-json-catalog-ch26)
7. [The recursive bootstrap method](#7-the-recursive-bootstrap-method)
8. [Patterns library — structure and contents](#8-patterns-library--structure-and-contents)
9. [Agent extensions — `scene_designer`](#9-agent-extensions--scene_designer)
10. [Phase sequence](#10-phase-sequence)
11. [Critical files](#11-critical-files)
12. [Verification — when is the architecture proven?](#12-verification--when-is-the-architecture-proven)
13. [Generalization to other chapters](#13-generalization-to-other-chapters)
14. [How a fresh Claude session uses this doc](#14-how-a-fresh-claude-session-uses-this-doc)
15. [Open decisions / deferred work](#15-open-decisions--deferred-work)

---

## 1. Why this document exists

PhysicsMind ships ~150 concepts long-term. Hand-authoring each at "diamond" quality (the standard `magnetic_field_wire` was iterated to in sessions 58–60) takes 5–6 rounds × ~1 hour per round = 5–6 hours per concept. At 150 concepts, that's ~900 engineer-hours of authoring. Not viable.

The bottleneck is **not the model's reasoning** — Sonnet can write physics. The bottleneck is **the model's blindness** to per-state pedagogical decisions and the chapter's specific visual archetypes. The model has no domain-specific patterns library to draw from, so it improvises. Improvisation gives mediocre output. Iteration corrects it. Iteration is expensive.

The recursive-bootstrap method removes the bottleneck:

```
Step 1.  Hand-author 1 diamond per visual archetype in the chapter.
Step 2.  Extract reusable patterns from the diamonds (primitives, choreographies, overlays).
Step 3.  Build a per-state pedagogical decision agent (scene_designer).
Step 4.  Inject the patterns + agent into the existing Alex authoring pipeline.
Step 5.  Author the rest of the chapter at ~90% diamond first try.
Step 6.  When a generated concept fails the diamond bar, file the failure as a missing
         pattern and update the library — the patterns compound.
```

**Magnetism (DC Pandey Ch.26) is the proof-of-concept chapter.** It has clean, separable visual archetypes; the physics is well-bounded; the diamond bar is achievable in the field_3d renderer we already have. If the method works here, the same procedure scales to mechanics, optics, thermodynamics, modern physics — each chapter gets its own 3-diamond seed and patterns library.

If the method *doesn't* work here, we learn what's missing before generalizing — much cheaper than discovering the gap mid-mechanics rollout.

---

## 2. Current status snapshot

| | Concept / Work | Archetype | DC Pandey § | Status | Sessions |
|---|---|---|---|---|---|
| **Diamond #1** | `magnetic_field_wire` | A — Field-visualization | 26.8 | ✅ Shipped | ~58–60 |
| **Diamond #2** | `force_on_moving_charge` (Lorentz, F = qv × B) | B — Force-in-field | 26.2 | ⏳ Next (M1) | TBD |
| **Diamond #3** | `torque_on_current_loop_in_field` | C — Dipole-in-field | 26.6 | ⏳ After #2 (M2) | TBD |
| Pattern extraction + `scene_designer` agent | — | — | — | ⏳ After #3 (M3) | 2 sessions |
| **Autoresearch-inspired auto-eval loop** | — | — | — | ⏳ After patterns (M3.5) | 3–4 sessions |
| Validation: author `magnetic_field_solenoid` via loop | — | A | 26.8 | ⏳ Gate M4 | 1 session |
| Remaining ~14 atomic concepts via loop | — | A/B/C | 26.2–26.13, 26.18 | ⏳ Loop-driven (M5) | ~7 sessions |
| ~17 nano concepts via loop | — | A/B/C | various | ⏳ Loop-driven (M6) | ~5 sessions |
| **🚢 SHIP V1.0** — Ch.26 conceptual mode complete | — | — | 26.1–26.13, 26.18 | ⏳ At session ~23 | — |
| Board mode retrofit pass (all 34 concepts) | — | — | same | ⏳ Post-ship (M7) | 5–7 sessions |
| Competitive mode retrofit pass | — | — | same | ⏳ After M7 (M8) | ~5 sessions |
| Diamond #4 + materials concepts (Archetype D) | `ferromagnetism_domains` + 3 atomic + 3 nano | D — Atomic magnetism | 26.14–26.17 | 🟡 Deferred (M9, separate sub-architecture) | TBD |

---

## 3. The four visual archetypes in Ch.26

Concepts within an archetype share the same renderer pattern, animation choreography, and pedagogical narrative. Diamonds map to archetypes 1:1, not to concepts.

### Archetype A — Field-visualization
**Visual signature:** Source object → field surrounds it → probe (compass, test charge) detects.
**Key patterns:** 3D field-line geometry around source; current/source direction indicator; right-hand-rule overlay; probe approach + reaction animation; Biot-Savart in animate loop.
**Concepts using it:** straight wire, solenoid, circular loop, moving point charge, bar magnet, Earth's magnetism.

### Archetype B — Force-in-field
**Visual signature:** Ambient external uniform B exists. A moving charge or current-carrying conductor enters → force F vector emerges → trajectory bends.
**Key patterns:** Ambient field rendering (faint background grid or arrows); point-charge or current-segment visualization; velocity vector + force vector that update per-frame; F = qv × B (or F = IL × B) cross-product in animate loop; particle trajectory animation (circle, helix).
**Concepts using it:** Lorentz force, force on current-carrying conductor, parallel-currents force, charged particle in uniform field, helical motion.

### Archetype C — Dipole-in-uniform-field
**Visual signature:** External uniform B field. A magnetic dipole (current loop, bar magnet) sits in it. Opposing forces on opposite sides of the loop → couple → torque → rotation/oscillation.
**Key patterns:** Closed loop or bar geometry; force pair on parallel sides; rotation animation about an axis; magnetic dipole moment vector μ = IA; torque vector τ = μ × B.
**Concepts using it:** torque on current loop, bar magnet in field, vibration magnetometer, moving-coil galvanometer.

### Archetype D — Atomic-magnetism (DEFERRED)
**Visual signature:** Atomic-level — electron spins, magnetic domains, hysteresis loops.
**Status:** Out of scope for this proof-of-concept. May share patterns with future chemistry / atomic physics concepts; building Diamond #4 in isolation risks over-fitting magnetism-only patterns onto something that wants to be a cross-domain primitive.
**When to revisit:** When materials (sections 26.14–26.17) are explicitly prioritized.

---

## 4. Diamond seed strategy — three diamonds, one per archetype

### Why three, in this order

**Diamond #1 — `magnetic_field_wire` (✅ Shipped)**
Simplest source-field-probe pattern. 1D source (vertical wire), 2D field circles concentric to source, 3D scene rendered via Three.js. Establishes:
- 3D scene composition: wire as Y-axis, field circles, current arrows
- Compass approach + deflection animation (state-level lerp + Biot-Savart needle target)
- Right-hand rule overlay as HTML/CSS (👍/👎 emoji + I-direction arrow + curl SVG)
- Field rotation animation around the wire (CCW/CW per current direction)
- Yellow flowing dots for current direction visualization
- Per-state `field_3d_config` block embedded in concept JSON (bypasses Sonnet runtime — CLAUDE.md Rule 18)

**Diamond #2 — `force_on_moving_charge` (Lorentz, F = qv × B)**
Completely different visual archetype from #1. Must establish:
- Ambient uniform B field rendering (faint arrow grid, not field lines around a source)
- Single charged particle with velocity vector arrow
- Force vector F = qv × B that updates as the particle moves
- Particle trajectory animation (uniform circular motion when v ⊥ B; helical when v has parallel component)
- Hand orientation for F = qv × B (palm rule, distinct from RHR curl in #1)

**Diamond #3 — `torque_on_current_loop_in_field`**
Third archetype. Closed-loop geometry with rotational dynamics. Establishes:
- Rectangular loop in external uniform B
- Force pair animation: opposite sides feel opposite-direction forces
- Net force = 0, but torque ≠ 0 → rotation about a chosen axis
- Magnetic dipole moment vector μ pointing through the loop face
- τ = μ × B vector; oscillation when μ misaligned with B; equilibrium when μ ∥ B
- Visual link to bar magnet (μ vector ↔ N-S of an equivalent bar magnet)

### After three diamonds — pattern coverage map

| Pattern | Diamond it lives in | Reused by |
|---|---|---|
| Field circles around 1D source | #1 | solenoid, circular loop |
| RHR curl overlay (HTML/CSS) | #1 | Biot-Savart applications generally |
| Compass approach + deflection | #1 | bar magnet probing |
| Ambient uniform field grid | #2 | torque #3, parallel currents, all "in external field" concepts |
| Force vector F that updates per-frame | #2 | force on current conductor, parallel currents |
| Particle trajectory (circular/helical) | #2 | charged particle in field, mass spectrometer (extension) |
| Closed loop + force pair | #3 | bar magnet in field, galvanometer, vibration magnetometer |
| μ × B torque + rotation animation | #3 | bar magnet in field, vibration magnetometer |
| Oscillation animation (μ around B) | #3 | vibration magnetometer (period derivation) |

Three diamonds cover ≥85% of pattern needs for atomic concepts in Ch.26 archetypes A, B, C.

---

## 5. Atomic JSON catalog (Ch.26)

Atomic = "one teachable idea = one student question = one JSON" (CLAUDE.md glossary). Has hard sub-states warranting `allow_deep_dive: true` on 2–3 states.

| § | Atomic concept | Archetype | Templated from | Effort post-bootstrap |
|---|---|---|---|---|
| 26.2 | `force_on_moving_charge` | B | (Diamond #2) | — |
| 26.3 | `circular_motion_in_uniform_field` | B | #2 | ~1.5h |
| 26.3 | `helical_motion_in_field` | B | #2 + velocity-component decomposition | ~1.5h |
| 26.4 | `force_on_current_in_field` | B | #2 (charge → current segment) | ~1.5h |
| 26.5 | `magnetic_dipole_moment` | C | #3 | ~1.5h |
| 26.6 | `torque_on_current_loop_in_field` | C | (Diamond #3) | — |
| 26.6 | `bar_magnet_in_uniform_field` | C | #3 (loop → bar) | ~1.5h |
| 26.7 | `biot_savart_law` | A meta | #1 (integrate the law) | ~2h (more abstract) |
| 26.8 | `magnetic_field_wire` | A | (Diamond #1) | — |
| 26.8 | `magnetic_field_circular_loop` | A | #1 (source geometry change) | ~1.5h |
| 26.8 | `magnetic_field_solenoid` | A | #1 (source = coiled wire) | ~1.5h ← M4 GATE concept |
| 26.9 | `amperes_circuital_law` | A meta | #1 (integral form, Ampèrian loop) | ~2h |
| 26.10 | `parallel_currents_force` | B | #2 (two source wires, force on each) | ~1.5h |
| 26.11 | `bar_magnet_field` | A | #1 (source = permanent dipole) | ~1.5h |
| 26.12 | `earths_magnetism` | A | #1 (giant bar magnet) | ~1.5h |
| 26.13 | `vibration_magnetometer` | C | #3 (oscillation period derivation) | ~2h |
| 26.18 | `moving_coil_galvanometer` | C | #3 (torque + spring restore) | ~2h |

**Total atomic in scope (excluding materials):** 17 (incl. 3 diamonds).
**Estimated post-bootstrap authoring:** ~17 atomics × ~1.7h average ≈ 29h.

---

## 6. Nano JSON catalog (Ch.26)

Nano = single term, symbol, unit, or definition. 2–3 states. **No `allow_deep_dive` flag** — a nano concept is already at the smallest teachable granularity.

| Nano concept | What it teaches |
|---|---|
| `right_hand_rule_curl` | Fingers curl in direction of B around a wire, thumb in direction of I |
| `right_hand_rule_palm` | F = qv × B — palm pushes in direction of F when fingers point along v, curl into B |
| `flemings_left_hand_rule` | Mnemonic alternative to F = qv × B (motor convention) |
| `magnetic_field_unit_tesla` | 1 T = 1 N/(A·m); gauss conversion |
| `magnetic_field_lines_rules` | (a) closed loops, (b) never cross, (c) density ∝ field strength |
| `magnetic_moment_definition` | μ = IA, units A·m² |
| `magnetic_pole_strength` | m, units A·m, force law analogous to Coulomb |
| `magnetic_intensity_H_definition` | H vs B vs M relationship |
| `magnetization_M_definition` | M = magnetic moment per unit volume |
| `magnetic_susceptibility_chi` | χ = M/H |
| `relative_permeability` | μᵣ = 1 + χ |
| `bohr_magneton` | μ_B as the natural atomic-scale magnetic moment unit |
| `curie_temperature` | T_c — phase transition above which ferromagnetism collapses |
| `hysteresis_loop_basics` | Shape of B-H curve for ferromagnets |
| `retentivity_coercivity` | Residual field; demagnetizing field needed |
| `magnetic_declination` | Angle between true north and magnetic north |
| `magnetic_dip` | Angle of B field below horizontal at a location |

**Total nano in scope:** 17.
**Estimated post-bootstrap authoring:** ~17 × ~0.5h ≈ 9h.

---

## 7. The recursive bootstrap method

The procedure that makes magnetism (and every chapter after) author at template speed.

```
Step 1.  HAND-AUTHOR DIAMOND
         Pick the simplest exemplar of the archetype. Iterate to "diamond"
         quality (no further hand iteration would improve it). Document every
         non-obvious choice.

Step 2.  EXTRACT PATTERNS
         From the diamond, identify reusable units at three levels:
           (a) PRIMITIVES — renderer-level building blocks (e.g., right_hand
               overlay, compass with approach animation, current-direction
               yellow dots). These live in the renderer code already.
           (b) PATTERNS — multi-primitive scene compositions (e.g., "1D
               source + concentric field circles + probe at radius r").
           (c) CHOREOGRAPHIES — state-to-state animations (e.g., probe
               glides in → field becomes visible → probe deflects).

Step 3.  WRITE PATTERNS LIBRARY
         Document patterns in physics-mind/docs/patterns/magnetism.md
         (start as one file; split when the file exceeds ~500 lines).
         Each pattern entry has: name, archetype tag, when-to-use, code
         pointer, JSON example.

Step 4.  WRITE SCENE_DESIGNER AGENT SPEC
         New agent at .agents/scene_designer/CLAUDE.md. Domain-agnostic.
         Per-state job: given (concept_id, state_id, pedagogical_goal,
         physics_engine_output, archetype), select the right pattern from
         the library, choose primitives, set the choreography. Output is
         a "scene plan" the existing json_author agent then renders into
         scene_composition.

Step 5.  RUN THE PIPELINE ON A NEW CONCEPT
         Pick the simplest non-diamond concept in the chapter (for
         magnetism: magnetic_field_solenoid). Run Alex pipeline (architect
         → physics_author → scene_designer → json_author → quality_auditor).
         If output is diamond on first try → method validated.
         If not → root-cause:
            • Missing pattern → file as gap; add to library.
            • Wrong archetype assignment → fix scene_designer rubric.
            • Agent prompt gap → tighten prompt.
            • Renderer can't express the needed visual → add primitive,
              or downgrade the concept to a pattern the renderer supports.

Step 6.  AUTHOR REMAINING CONCEPTS
         Run pipeline once per concept. Human review each output. Failures
         feed back into Step 5's loop (the patterns library compounds).

Step 7.  DECLARE CHAPTER COMPLETE
         All atomic + nano concepts authored, validated, cached. Move to
         next chapter (different physics, different archetypes, but same
         method).
```

**Critical principle:** the patterns library and the agent prompts are the durable artifacts. Individual JSONs are disposable — regenerable when the patterns improve.

---

## 8. Patterns library — structure and contents

### Initial structure (single file)

```
physics-mind/docs/patterns/
└── magnetism.md
```

Start as one file. Split when it exceeds ~500 lines, into the directory layout shown below — which includes a `programs/` subdirectory for per-concept program.md files (see next subsection).

```
physics-mind/docs/patterns/magnetism/
├── README.md             # how to use these patterns
├── archetypes/
│   ├── A_field_visualization.md   # full archetype spec (state arc, default patterns)
│   ├── B_force_in_field.md
│   └── C_dipole_in_field.md
├── primitives.md         # field_3d_config extras catalog
├── choreographies.md     # named state-to-state animations
├── overlays.md           # HTML/CSS overlays (RHR, formula, sliders)
├── physics_helpers.md    # Biot-Savart, F=qv×B, τ=μ×B implementations
├── pedagogy.md           # state-arc patterns, when to invoke deep-dive
└── programs/             # one program.md per atomic/nano concept (M5/M6 inputs)
    ├── magnetic_field_solenoid.md
    ├── magnetic_field_circular_loop.md
    ├── biot_savart_law.md
    └── ...               # 34 total (17 atomic + 17 nano)
```

### Per-concept `program.md` files (M3.5 / M5 / M6)

Each atomic and nano concept gets its own short `program.md` that drives the M3.5 auto-eval loop. Think of it as the *concept-specific delta* — what makes this concept different from its parent diamond. Schema, validator rules, the 8 registration sites, and the render contract are NOT in program.md (they're invariant across the chapter and live elsewhere in the patterns library).

**Diamonds do NOT get a `program.md`.** Their JSONs are the source of truth, and they serve as few-shot exemplars in the LLM judge's context. The `programs/` directory contains entries only for non-diamond concepts.

**Atomic concept program.md** — ~30–50 lines. Example for `magnetic_field_solenoid`:

```markdown
# program.md — magnetic_field_solenoid

archetype: A
parent_diamond: magnetic_field_wire
source_type: coiled_wire (was: straight_wire)
physics: B_inside = μ₀nI; B_outside ≈ 0
real_world_anchor: MRI machine in an Indian hospital
prerequisites: [magnetic_field_wire]
hard_states_for_deep_dive: ["B_inside_uniform_proof", "RHR_with_curled_fingers"]
state_arc_override: null  # use archetype A default
patterns_to_invoke:
  - field_circles_from_1d_source  # adapt: 1D source becomes coil axis
  - compass_approach_then_deflect # reuse from Diamond #1
  - rhr_curl_overlay              # adapt: thumb = B (not I) inside coil
patterns_to_exclude:
  - top_down_view_⊗_⊙_pattern     # not pedagogically useful for solenoid
score_target: ≥8.5/10 against archetype A rubric
```

**Nano concept program.md** — ~10–15 lines. Example for `magnetic_field_unit_tesla`:

```markdown
# program.md — magnetic_field_unit_tesla

type: nano
state_count: 2
pedagogy: define 1 T = N/(A·m), show gauss conversion (1 T = 10000 G)
real_world_anchor: MRI = 1.5 T; fridge magnet ≈ 5 mT
patterns_to_invoke: [unit_definition_two_state_pattern]
```

**Authoring effort:**
- Atomic program.md: ~10 minutes per concept (template + concept-specific delta)
- Nano program.md: ~5 minutes per concept
- Total for Ch.26: 17 × 10 min + 17 × 5 min ≈ 4.5 hours of program.md authoring across the whole chapter

**Compounding opportunity** (V1.5+, see §16): once 5–6 program.mds are hand-written, ~90% of each subsequent one is derivable from `concept_panel_config` row + archetype assignment + DC Pandey section. A small `program_md_generator` agent can emit the skeleton; human edits ~10%. This drops authoring further toward ~3 minutes per concept. Captured as a deferred refinement, not a V1 dependency.

### Contents to extract from Diamond #1 (`magnetic_field_wire`)

After Diamond #1 alone, we already have these documentable patterns:

**Primitives** (live in `field_3d_renderer.ts`):
- `extras.right_hand` with `case: 'A'|'B'|'both'` — HTML/CSS overlay with emoji + curl SVG
- `extras.compass` with `position`, `radius`, `animate_swing`, `swing_delay_ms`, `approach_from`, `approach_duration_ms`
- `extras.highlighted_point` with `position`, `label`, `color`, `radius`
- State-level flags: `field_rotation_direction: 'cw'|'ccw'`, `current_direction_indicator: 'up'|'down'`, `show_sliders`, `formula_overlay`

**Choreographies** (animation idioms):
- `compass-approach-then-deflect`: probe glides from far → final position over `approach_duration_ms`, then needle swings to physics-correct angle after `swing_delay_ms`
- `field-circle-rotation`: field-line arrows orbit the source axis at fixed angular velocity, sense controlled by `field_rotation_direction`
- `current-flow-dots`: yellow spheres interpolate along the source path to visualize conventional current

**Overlay patterns:**
- Two-case A/B overlay (one for each polarity) with `rhr-show-a-only` / `rhr-show-b-only` classes for state-driven visibility
- Sliders + B-readout panel (when `show_sliders: true`)
- Formula overlay (multi-line, monospace, top-right corner)

**Pedagogy patterns:**
- State arc: setup at rest → reveal field → polarity case A → polarity case B → single-point analysis → top-down view → free explore
- Per-state caption that names the *why* of the visual change (not just the visual itself)
- Deep-dive flag on the 2–3 hardest states (RHR application, top-down ⊗/⊙ pattern)

After Diamond #2 and #3, this catalog will roughly triple.

### Code anchors

| Pattern | Code location |
|---|---|
| `field_3d_config` interface | [src/lib/renderers/field_3d_renderer.ts](../../src/lib/renderers/field_3d_renderer.ts) — `Field3DConfig` type |
| Compass approach + swing | `field_3d_renderer.ts` — `createCompass()` + animate loop |
| RHR HTML overlay | `field_3d_renderer.ts` — `assembleField3DHtml()` `#rhr_overlay` block |
| Biot-Savart B-direction | `field_3d_renderer.ts` — animate loop, `compass.animate_swing` block |
| Per-state visibility tokens | `field_3d_renderer.ts` — `applyState()` substring matcher |

---

## 9. Agent extensions — `scene_designer`

### Why a new agent

The existing Alex pipeline (architect → physics_author → json_author → quality_auditor) is generic. Each agent is good at its own job, but **none of them owns per-state pedagogical reasoning**: "for STATE_3 of `magnetic_field_solenoid`, which patterns from the magnetism library do I invoke, in what order, with what choreography?"

That decision is what makes the difference between a diamond and a 5-iteration mediocre output. Currently, `physics_author` and `json_author` improvise it. The improvisation is the bottleneck.

`scene_designer` is a **domain-agnostic** agent that lives between `physics_author` and `json_author` in the pipeline. Per-state, it produces a "scene plan":

```yaml
# Example scene plan output for magnetic_field_solenoid STATE_3
state_id: STATE_3
archetype: A
patterns_invoked:
  - field_circles_from_1d_source   # source is now coil, not straight wire
  - compass_approach_then_deflect  # reuse from Diamond #1
  - rhr_curl_overlay               # reuse, case = 'A' (current up, B inside coil pointing through axis)
choreography: compass_glides_in_then_field_inside_coil_revealed_then_deflection
focal_primitive_id: compass_oersted
deep_dive_eligible: true            # students confuse coil B-direction with wire B-direction
caption_intent: "B inside a long solenoid is uniform and along the axis (RHR with curled fingers = current sense)"
```

`json_author` then renders the scene plan into actual `scene_composition.primitives[]` and `extras` blocks, drawing from the patterns library.

### Where it lives

```
.agents/scene_designer/CLAUDE.md
```

Follows the existing Alex agent file structure (see `ARCHITECTURE_v2.2.md` §2.1). Spec NOT YET WRITTEN — this is M3 work.

### How chapter-specific knowledge is injected

`scene_designer` is generic; magnetism-specific knowledge is injected via the patterns library. When invoked on a magnetism concept, the agent loads `physics-mind/docs/patterns/magnetism/*.md` into context.

For other chapters: same agent, different patterns directory (e.g., `physics-mind/docs/patterns/optics/`).

This keeps the agent count low (one new agent, not one per chapter) and concentrates chapter-specific authoring knowledge in the patterns library where it can be edited without touching agent code.

---

## 10. Phase sequence

| Phase | Work | Sessions (est.) | Gate |
|---|---|---|---|
| **M1** | Diamond #2: `force_on_moving_charge` (Lorentz). Hand-author at diamond bar. | 1–2 | End-to-end test page renders all states; physics validator passes; visual review by founder is "diamond — no more iterations needed". |
| **M2** | Diamond #3: `torque_on_current_loop_in_field`. Hand-author at diamond bar. | 1–2 | Same as M1. |
| **M3** | Pattern extraction → `physics-mind/docs/patterns/magnetism.md`. Write `scene_designer` agent spec at `.agents/scene_designer/CLAUDE.md`. | 2 | Patterns doc covers ≥20 distinct patterns with code anchors; scene_designer spec covers magnetism's archetype decision tree. |
| **M3.5** | **Autoresearch-inspired auto-eval loop.** Playwright visual probe + Sonnet judge against patterns library + threshold-based iteration. Replaces hand-iteration in M5/M6 with overnight pipeline runs. Local execution for now (Modal deferred to V1.5+, see §16). | 3–4 | Loop converges on a smoke-test concept in ≤5 iterations; rubric scorer ≥85% agreement with founder spot-check on diamond-tier outputs. |
| **M4** | **VALIDATION GATE**: author `magnetic_field_solenoid` end-to-end through the loop (architect → physics_author → scene_designer → json_author → quality_auditor + M3.5 auto-eval). | 1 | Output is diamond on first run with ≤1 round of human iteration. **If this gate fails, the architecture is not yet proven — do not proceed to M5.** |
| **M5** | Author remaining ~14 atomic concepts via the loop. Human writes program.md per concept (~10 min), loop generates + scores candidates, human reviews top-3, ships winner. | ~7 | Each passes E42 Physics Validator + founder review on first or second loop attempt. |
| **M6** | Author ~17 nano concepts via the loop. Same procedure, ~5 min program.md each. | ~5 | Same. |
| **🚢 SHIP V1.0** | Ch.26 conceptual mode complete: 3 diamonds + 14 atomic + 17 nano = 34 concepts. Mobile = existing SVG fallback (`field_3d_renderer.ts:19`). Board/competitive tabs hidden or labeled "coming soon". | — | Beta cohort onboarded; feedback collection live. |
| **M7** | **Board mode retrofit pass.** Templated retrofit of all 34 conceptual JSONs. Per-concept program.md is tiny: "convert this conceptual JSON to a 5–8 state board mode derivation with mark_scheme aligned to NCERT format." Reuses M3.5 loop infrastructure. | 5–7 | Each concept has working `mode_overrides.board` with `canvas_style: "answer_sheet"`, `derivation_sequence`, and `mark_scheme` per CLAUDE.md Rule 21. |
| **M8** | **Competitive mode retrofit pass.** Same templated-retrofit pattern. Adds shortcuts, edge cases, JEE/NEET tricks per concept. | ~5 | Each concept has working `mode_overrides.competitive`. |
| **M9** | (Deferred) Diamond #4 + 3 atomic + 3 nano concepts for materials sub-architecture (sections 26.14–26.17). Separate visual archetype (atomic-level). | ~5 | Out of magnetism main proof-of-concept scope. Triggers when materials are explicitly prioritized. |

**Total to SHIP V1.0 (conceptual-only, 34 concepts):** ~23 sessions. Deep-dive authoring is analytics-driven post-launch (no upfront sessions allocated) — see Deep-dive authoring contract in [patterns/magnetism.md §6](patterns/magnetism.md).
**To all three modes for Ch.26 (V1.0 + M7 + M8):** ~33–35 sessions.
**Materials (M9):** +5 sessions when scheduled.

### Iteration philosophy — threshold-based, not fixed-count

Karpathy's autoresearch runs hundreds of iterations because its problem (ML research, noisy `val_bpb` metric, no exemplars) requires search. PhysicsMind has strong priors after M3 (patterns library + 3 diamond exemplars), so we use **two distinct iteration regimes**:

| Concept type | Authoring mode | Expected iterations | Why this count |
|---|---|---|---|
| **Diamonds (#1, #2, #3)** | Hand-author in M1, M2 | **5–8 iterations by hand** | Diamonds *invent* the patterns. Each iteration teaches us something we'll codify into the patterns library. Higher iteration count is the cost of establishing the archetype. |
| **Atomic + nano concepts (M5, M6)** | Loop-driven via M3.5 | **2–3 typical, 5 maximum (auto-halt ceiling)** | These *follow* established patterns. The loop should converge fast because the patterns library + diamond exemplars + scene_designer agent give a strong first attempt. |

For loop-driven authoring, iteration count is a *diagnostic*, not a target:

- **1–3 iterations** → score ≥ 8.5/10 → ship to human review
- **4–5 iterations** → mild patterns gap → ship but file fix-up ticket
- **Hits the 5-iteration ceiling unresolved** → architecture bug: stop loop, root-cause (missing pattern? wrong archetype? agent prompt gap?), fix the patterns library, retry. The library compounds; subsequent concepts benefit.

**Per-concept cost:** ~$0.05–0.15 API spend, ~30s wall-clock per iteration.
**Total Ch.26 (17 atomic + 17 nano):** ~$5 API + ~7 hours human writing program.mds + ~10 hours founder review of top-3 candidates per concept = **~17 hours post-M3.5**. Compare ~34 hours pure hand-authoring in the post-bootstrap-no-loop case, and ~190 hours in the pre-bootstrap hand-iterating case.

### Hard gate at M4

M4 is the proof. If the patterns library + scene_designer agent + Alex pipeline + M3.5 loop together produce a diamond `magnetic_field_solenoid` on the first run, the architecture works. If not, we're back to hand-authoring solenoid as Diamond #4 of the same archetype — which means the patterns we extracted from Diamond #1 didn't generalize and we have a debugging task.

**Do not skip M4.** Do not start M5 until M4 passes.

---

## 11. Critical files

| File | Role |
|---|---|
| `physics-mind/src/data/concepts/magnetic_field_wire.json` | Diamond #1 source-of-truth |
| `physics-mind/src/data/concepts/force_on_moving_charge.json` (NEW, M1) | Diamond #2 |
| `physics-mind/src/data/concepts/torque_on_current_loop_in_field.json` (NEW, M2) | Diamond #3 |
| `physics-mind/src/data/concepts/magnetic_field_solenoid.json` (NEW, M4) | Validation concept |
| `physics-mind/src/lib/renderers/field_3d_renderer.ts` | 3D scene assembler — existing primitives |
| `physics-mind/src/lib/renderers/field_3d_renderer.ts` (extended in M1/M2) | New extras for Lorentz: ambient field grid, particle trajectory, force vector that updates per-frame |
| `physics-mind/src/lib/physicsEngine/concepts/magnetic_field_wire.ts` | Engine pattern reference |
| `physics-mind/src/lib/physicsEngine/concepts/force_on_moving_charge.ts` (NEW, M1) | F = qv × B engine |
| `physics-mind/src/lib/physicsEngine/concepts/torque_on_current_loop.ts` (NEW, M2) | τ = μ × B engine |
| `physics-mind/src/lib/intentClassifier.ts` | `VALID_CONCEPT_IDS` — append each new concept |
| `physics-mind/src/lib/aiSimulationGenerator.ts` | `CONCEPT_RENDERER_MAP` — append each new concept |
| `physics-mind/src/lib/physicsEngine/index.ts` | `ENGINES` record — append each new engine |
| `physics-mind/src/proxy.ts` | Public route allowlist — append each `/admin/test-*` page |
| `physics-mind/src/app/admin/test-*/page.tsx` (NEW per concept) | End-to-end verification page |
| `physics-mind/docs/patterns/magnetism.md` (NEW, M3) | Patterns library |
| `.agents/scene_designer/CLAUDE.md` (NEW, M3) | Per-state pedagogy agent spec |
| `physics-mind/docs/MAGNETISM_ARCHITECTURE.md` (this doc) | Strategic plan, loaded on demand |

### Eight-update checklist for each new atomic concept

(Per CLAUDE.md §6 — quoted here for the future Claude session that picks this up):

1. `src/data/concepts/{concept_id}.json` — concept JSON with full v2.2 schema
2. SQL INSERT into `concept_panel_config` (or `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`)
3. `CONCEPT_RENDERER_MAP` entry in `src/lib/aiSimulationGenerator.ts`
4. `VALID_CONCEPT_IDS` set in `src/lib/intentClassifier.ts`
5. Tag hard states with `allow_deep_dive: true` (typically 2–3 per concept)
6. Engine registration in `src/lib/physicsEngine/index.ts`
7. (For field_3d concepts) `field_3d_config` block embedded in JSON — bypasses Sonnet runtime per CLAUDE.md Rule 18
8. (For verification) Admin test page at `src/app/admin/test-{concept_id}/page.tsx` + `proxy.ts` allowlist

---

## 12. Verification — when is the architecture proven?

### M4 binary gate

The architecture is **proven** if and only if `magnetic_field_solenoid` (M4) is authored at diamond quality with ≤1 round of human iteration, using only:
- The Alex pipeline + the new `scene_designer` agent
- The magnetism patterns library populated by M3
- The 3 diamond JSONs as few-shot exemplars in agent context

The architecture is **not proven** if solenoid still needs ≥2 rounds of hand-iteration. Failure modes to root-cause:

| Symptom | Likely cause | Fix |
|---|---|---|
| Wrong scene composition | Pattern library missing the needed primitive | Add primitive to library + `field_3d_renderer.ts` |
| Wrong choreography | scene_designer rubric chose wrong pattern | Tighten rubric in `.agents/scene_designer/CLAUDE.md` |
| Wrong physics | physics_author prompt gap on coil geometry | Update physics_author prompt + add to `physics_helpers.md` |
| Wrong pedagogy / state arc | Architect prompt missing solenoid context | Update architect prompt with archetype-A pattern reminders |
| Renderer can't render the needed visual | Primitive missing | Extend `field_3d_renderer.ts` (or document as known-gap and downgrade scope) |

### Cross-chapter verification (later)

After M4 passes for magnetism, the next test is generalizing to a different chapter. Pick optics (geometric optics has clean archetypes: ray reflection, refraction, lens systems). Run the same procedure: identify archetypes, build 2–3 diamonds, extract patterns, validate with one template-driven concept. If that also passes → the recursive-bootstrap method is the canonical authoring approach for PhysicsMind.

---

## 13. Generalization to other chapters

After Ch.26 magnetism succeeds, the generalization map:

| Chapter | Likely archetypes | Diamond candidates |
|---|---|---|
| **Optics — geometric** | Ray-traced reflection / refraction; lens-system imaging | Single-mirror reflection; single-lens imaging |
| **Optics — wave** | Interference patterns; diffraction | Young's double slit; single-slit diffraction |
| **Mechanics — kinematics** | (Already partially done — ~17 atomics in `src/data/concepts/`) Trajectory; relative motion; graphs | Projectile motion; relative-motion frame switch; v-t graph |
| **Mechanics — Newton's laws** | (Already done at gold-standard — `normal_reaction.json`, `friction_static_kinetic.json`, etc.) FBD; constraint motion; pseudo-force | Already shipped |
| **Thermodynamics** | Process diagrams (P-V, T-V); cycle visualizations | Carnot cycle; isothermal vs adiabatic process |
| **Modern physics** | Photon-particle interactions; energy level transitions | Photoelectric effect; H-atom Balmer series |
| **Electrostatics** | (Mirror of magnetism!) Field-from-source; force-in-field; dipole-in-field | Coulomb field; Gauss's law; dipole in uniform E |

**Order of attack:** chapters where the founding-student wedge is largest and archetypes are cleanest. Mechanics and electrostatics are likely next; modern physics is hardest because archetypes are less visual.

The key claim: **the recursive-bootstrap method is chapter-agnostic.** Each chapter just gets its own `physics-mind/docs/patterns/<chapter>.md` library and a one-time investment of 2–3 diamonds to seed it. The `scene_designer` agent and the Alex pipeline don't change.

---

## 14. How a fresh Claude session uses this doc

When a new conversation begins on Ch.26 magnetism work:

1. **CLAUDE.md** is loaded automatically (per its own instructions).
2. The CLAUDE.md reference-files block points to **PLAN.md** (loaded every session) which has Phase E.6 referencing this doc.
3. The fresh Claude session reads `physics-mind/docs/MAGNETISM_ARCHITECTURE.md` (this file) **on demand** — typically when the user mentions magnetism, Diamond #2/#3, or asks about Ch.26 strategy.
4. From this doc the session can:
   - Identify which diamond is next (§2 status snapshot)
   - Find the archetype definitions and decide which patterns apply (§3)
   - Read the phase-sequence gate (§10) to know what's expected
   - Cross-reference the patterns library at `physics-mind/docs/patterns/magnetism.md` (when M3 is done)
   - Look up critical files (§11) to know what to touch
   - Apply the verification rubric (§12) before declaring work done

**Self-test:** Before relying on this doc, future Claude should verify it isn't stale. Quick checks:
- `git log -- physics-mind/docs/MAGNETISM_ARCHITECTURE.md` — last edit recent?
- Does §2 status snapshot match `git log -- physics-mind/src/data/concepts/`? (e.g., Diamond #2 might already be shipped)
- Does the patterns library at `physics-mind/docs/patterns/magnetism*` exist or not (M3 done?)

If the doc is more than 2 weeks stale, refresh §2 from current code before acting on §10 phase recommendations.

---

## 15. Open decisions / deferred work

### Deferred to M3+

- **`scene_designer` spec details:** the exact rubric structure, prompt template, and YAML scene-plan schema. Designed in M3 from observed reality after Diamond #2 and #3 are shipped (avoids over-specifying before we have ground truth).
- **Patterns library file split:** start as one `magnetism.md`; split into a directory when it crosses ~500 lines.
- **Cross-archetype patterns:** some primitives might be shared across A/B/C (e.g., RHR overlay variants). Defer the abstraction — extract from concrete diamonds, don't predict.

### Deferred indefinitely

- **Materials sub-architecture (Diamond #4):** sections 26.14–26.17 (paramagnetism, diamagnetism, ferromagnetism, magnetic susceptibility). Different visual archetype (atomic-level domain walls, electron spins, hysteresis loop). When prioritized, reopen with a fresh archetype-D diamond seed; may share patterns with future chemistry/atomic-physics chapters.
- **Variant strategy for magnetism:** the ~17 atomic concepts ship with one canonical variant each per PLAN.md MVP. Type-B variants deferred to year-2 per existing PLAN.md guardrails.
- **Board mode + competitive mode for magnetism atomics:** originally specced as part of each concept's effort estimate per CLAUDE.md Rule 20. Strategy changed during the 2026-05-08 session: V1 ships conceptual-only; board and competitive added as dedicated retrofit passes M7 and M8 post-V1 ship. CLAUDE.md Rule 20 carries a magnetism exception clause. See §16 for the full mode-deferral rationale.

### Decisions to revisit after M4

- Whether `scene_designer` is one agent or splits into per-archetype agents.
- Whether the patterns library should also be machine-readable (TypeScript exports) in addition to markdown specs.
- Whether to formalize a `CONCEPT_TEMPLATE.json` that the pipeline uses as a starting skeleton.

---

## 16. Deferred to V1.5+ — captured, not lost

These items were evaluated during the 2026-05-08 strategy session and explicitly deferred to keep V1 lean. They're recorded here so future sessions don't re-litigate the decisions or accidentally pull them into M1–M6.

### V1.5 — distribution and three-tier rendering strategy

**The three-tier rendering strategy** (deferred to V1.5; V1.0 ships with Tier 1 + the existing SVG fallback only):

| Tier | Target device | Renderer | Status |
|---|---|---|---|
| **Tier 1** | Desktop, laptop, premium phones (≥6 GB RAM, WebGL 2 or strong WebGL 1) | Full interactive Three.js (current implementation) | ✅ Working today |
| **Tier 2** | Mid-range Android (4 GB RAM, Mali-G52 / Adreno 610, WebGL 1) | Three.js with `is_mobile` quality preset (InstancedMesh, capped DPR, shadows off, frame-rate target 30) | ⏳ V1.5 |
| **Tier 3** | Low-end Indian phones (3 GB RAM, 10–15k INR bracket) AND WhatsApp / Instagram / offline sharing | Pre-rendered MP4 from HyperFrames pipeline (hardware-accelerated H.264 playback works on any phone since 2014) | ⏳ V1.5 |

V1.0 ships Tier 1 + the existing SVG fallback (`field_3d_renderer.ts:19`, threshold 768px) covering the floor non-interactively. Tier 2 and Tier 3 are V1.5+.

| Item | What it is | Why deferred | Trigger to revisit |
|---|---|---|---|
| **HyperFrames pipeline** ([github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)) | Auto-render MP4 from each concept's HTML/iframe. Two uses: (1) WhatsApp / Instagram / YouTube distribution, (2) Tier-3 device fallback. | Real value once 34 concepts exist. Building it pre-V1 = optimizing distribution with no inventory. | Day of V1.0 ship — start the pipeline on the top 10 concepts by founder review score. |
| **Mobile renderer audit + `is_mobile` quality preset (Tier 2)** | Profile `field_3d_renderer.ts` on a low-end Indian phone (10–15k INR: Mali-G52 GPU, 3–4 GB RAM, WebGL 1.0). Add InstancedMesh / lower DPR / shadow disable / capped frame rate presets. | Existing SVG fallback covers the floor. Per-concept performance handled inline during M1/M2/M5/M6 authoring (use InstancedMesh for ambient field grids in Diamond #2, cap particle counts, etc.). | When real user telemetry shows ≥10% of sessions hitting the SVG fallback on devices that *could* run Three.js with mobile presets. |
| **Tier-3 device routing logic** | Auto-detect low-end devices → serve MP4 (from HyperFrames) instead of Three.js | Requires HyperFrames pipeline + telemetry first. Both prerequisites are V1.5+. | After both prerequisites land. |

### V1.5+ — auto-eval / agent infrastructure

| Item | What it is | Why deferred | Trigger to revisit |
|---|---|---|---|
| **Inspect AI** (UK AISI eval framework) | Rigorous LLM eval harness with versioning and regression tracking | M3.5 starts with a hand-rolled rubric scorer (~200 lines TypeScript). Adopt Inspect when the rubric needs versioning or when regression coverage exceeds ~50 test points. | M5–M6 mid-phase if rubric drift becomes a maintenance pain. |
| **Promptfoo** | YAML-config LLM eval framework, lighter alternative to Inspect AI | Same as above; one alternative path. | Choose between Inspect / Promptfoo at the trigger point. |
| **DSPy** (Stanford) | Declarative prompt optimization — takes (prompt + examples + metric) and searches for better prompts | Use after diamonds + rubric exist. Optimizes `scene_designer` and any `magnetism_author` prompt automatically against the 3 diamond exemplars. | Post-M4, when manual prompt tuning slows down the loop. |
| **Modal** (or any serverless compute) | Cloud-run the autoresearch loop overnight without keeping a laptop on | Local execution is fine at ~$5 / Ch.26 cost and ~30s per iteration. Modal becomes worth it when running parallel loops across multiple chapters. | When starting the second chapter (post-Ch.26) and parallel loops are needed. |
| **`program_md_generator` agent** | Auto-emits the ~90% boilerplate of a per-concept program.md from `concept_panel_config` + archetype + DC Pandey section; human edits ~10% | Build after 5–6 program.mds are hand-written and the template is clear. | Post-M5 mid-phase when program.md authoring becomes the new bottleneck. |

### Mode coverage deferred

| Item | Why deferred | Trigger |
|---|---|---|
| **Board mode for Ch.26** | Splitting attention across 3 modes per concept degrades all 3. Templated retrofit (M7) is much faster and higher quality than parallel authoring. | M7 starts immediately after M6 ships V1.0. |
| **Competitive mode for Ch.26** | Same logic. | M8 starts after M7 ships. |
| **Materials sub-architecture (Archetype D)** | Different visual archetype (atomic-level domain walls, electron spins, hysteresis loops). May share patterns with future chemistry / atomic physics concepts. Diamond #4 risks over-fitting if built in isolation. | M9 — when materials sections 26.14–26.17 are explicitly prioritized. |

### Explicitly skipped (not deferred — declined)

| Item | Why skipped |
|---|---|
| **Printing Press CLI** ([printingpress.dev](https://printingpress.dev)) | Solves an external-API integration problem PhysicsMind doesn't have. Our APIs are Anthropic / Google / DeepSeek SDKs + Supabase + internal Next.js routes — already covered by their own SDKs. No third-party CLI surface to generate. |

---

*MAGNETISM_ARCHITECTURE.md is the proof-of-concept charter. Once Ch.26 ships in full, this method becomes the canonical authoring approach for PhysicsMind.*
