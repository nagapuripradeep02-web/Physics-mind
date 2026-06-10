# Visual Validator Specification — Engine E29

**Version:** 2.0 | **Date:** 2026-06-10 | **Owner:** Pradeep
**Companion code:** [`src/lib/validators/visual/spec.ts`](../src/lib/validators/visual/spec.ts)
**Companion migrations:** [`supabase_2026-04-27_engine_bug_queue_visual_categories_migration.sql`](../supabase_2026-04-27_engine_bug_queue_visual_categories_migration.sql) + [`supabase_2026-06-10_engine_bug_queue_visual_upgrades_migration.sql`](../supabase_2026-06-10_engine_bug_queue_visual_upgrades_migration.sql)

> **v2.0 (2026-06-10, "advanced level" upgrade — founder-approved FULL BUILD):**
> 44 checks across 9 categories (A–I). New since v1.0:
> - **Dense adjacent-frame motion checks D5/D6/D7** — every state captured at ~1s
>   intervals; adjacent pairs pixel-diffed (deterministic, $0). Catches what 5
>   frozen keyframes can't: sliders not driving trajectories, mid-state teleports,
>   animations that die partway.
> - **H2 visual regression** — per-state renders pixelmatched against APPROVED
>   baselines in `visual_baselines/<concept_id>/` (approve via `npm run
>   visual:approve`). Catches silent drift after renderer/JSON changes.
> - **Category I — TTS↔visual semantic sync (I1/I2)** — every `glow` target and
>   `math_show` a tts_sentence declares must be present on screen. Runs only when
>   concept-JSON bindings are provided (smoke script does; auto-fire stays dormant).
> - **Cost ladder** — vision categories run Gemini 2.5 Flash FIRST; any
>   error/parse-failure/failed-check escalates that category to Sonnet 4.6
>   (authoritative); Opus tier flag-gated via `VISION_ESCALATION_MAX_TIER=opus`.
>   Kill-switch: `VISION_LADDER=off` → legacy direct-Sonnet.
> - **THE EYE protocol** — `npm run visual:eyes -- <concept_id>` dumps EVERY frame
>   to `.visual_runs/` so Claude actually LOOKS before founder review
>   (AUTHORING_PIPELINE.md §3). Surface-everything output: every check printed,
>   pass and fail, no truncation.

---

## What this document is

The canonical rubric for the post-render Visual Validator that gates every PhysicsMind simulation before it reaches a student. It exists in three synchronized forms:

1. **This document** — narrative reference for authoring agents (Alex, physics-author, peter_parker), founder reviews, and onboarding new contributors.
2. **`spec.ts`** — TypeScript types and runtime rubric, source of truth for the vision-model gate.
3. **`engine_bug_queue` rows** (44 seeded: 38 by the 2026-04-27 migration + 6 by the 2026-06-10 visual-upgrades migration) — durable bug-class taxonomy that quality-auditor probes against in Gate 8.

When this document, `spec.ts`, and the migration drift, **`spec.ts` is authoritative** — re-derive the others.

## How to use this spec

- **If you're authoring a concept JSON**: read every check below and ask "could my JSON cause this failure?" Anticipate the rubric. Authoring agents (Alex) reference this spec before drafting.
- **If you're implementing the validator**: each check has a pass criterion that maps directly to a vision-model prompt fragment (in `promptTemplates.ts`).
- **If you're reviewing a failed validation**: the `bug_class` ties the failure to a row in `engine_bug_queue` with prevention rule + probe logic.

## The 44 checks across 9 categories

### Category A — Layout integrity (single panel, 6 checks)

The vision model receives one screenshot per STATE_N and answers:

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **A1 Text overlap** | No text element overlaps any other text element (≥ 4px gap between bounding boxes). | `VISUAL_TEXT_OVERLAP` |
| **A2 Text-on-primitive overlap** | No text intrudes into a body, surface, or arrow path. Labels live in callout zones or above/below primitives. | `VISUAL_TEXT_INTRUDES_PRIMITIVE` |
| **A3 Canvas bounds** | Every primitive (head + tail of arrow, full body, full label) is inside the canvas frame with ≥ 4px margin. | `VISUAL_OUT_OF_BOUNDS` |
| **A4 Label readability** | Effective label font ≥ 12px after any zoom/scaling. Color contrast ≥ 4.5:1 against background. | `VISUAL_LABEL_UNREADABLE` |
| **A5 Whitespace and zoning** | MAIN_ZONE has at least 30% empty space. Annotations are not stacked on top of each other. | `VISUAL_OVERCROWDED` |
| **A6 Arrow head clarity** | Force arrow heads are not buried inside other primitives; arrow direction is unambiguous. | `VISUAL_ARROW_HEAD_BURIED` |

### Category B — Physics correctness (single panel, 7 checks)

Cross-references the JSON `physics_engine_config` against what's actually rendered:

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **B1 Vector direction match** | Every force_arrow rendered angle matches the angle declared in physics_engine_config (±2°). | `PHYSICS_DIRECTION_WRONG` |
| **B2 Vector magnitude proportionality** | Arrow length proportional to magnitude × UNIT_TO_PX. Two arrows with magnitudes 5N and 10N must visually differ by 2× length (within 10%). | `PHYSICS_MAGNITUDE_WRONG` |
| **B3 Equilibrium visualization** | When physics declares net force = 0, arrows must visually sum to zero (head-to-tail closes back to origin within 5% of the longest vector). | `PHYSICS_EQUILIBRIUM_BROKEN` |
| **B4 Gravity always down** | Any mg / weight / gravity-force vector points to canvas-bottom (270° in screen coords). No exceptions, even on inclined planes. | `PHYSICS_GRAVITY_WRONG` |
| **B5 Normal perpendicular to surface** | Normal force vector exactly 90° from surface orientation (±2°). On a 30° incline, N points at 60° in world frame. | `PHYSICS_NORMAL_NOT_PERPENDICULAR` |
| **B6 Friction opposes motion** | Friction arrow points opposite to declared velocity / motion direction (180° ± 5°). | `PHYSICS_FRICTION_WRONG_DIR` |
| **B7 No phantom vectors** | Every rendered arrow corresponds to an entry in `physics_engine_config.forces[]`. No undeclared arrows appear. | `PHYSICS_PHANTOM_VECTOR` |

### Category C — Choreography correctness (across states, 5 checks)

Vision model receives screenshot pairs (STATE_N, STATE_{N+1}) and compares:

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **C1 No teleport** | Same `body.id` between consecutive states does not jump > 30% of canvas width without a declared `motion_path` primitive. | `CHOREOGRAPHY_TELEPORT` |
| **C2 Continuity of scale** | Same `body.id` does not change visual size > 10% between states unless `physics_behavior` declares a transformation. | `CHOREOGRAPHY_SCALE_DRIFT` |
| **C3 Camera continuity** | Canvas zoom and pan do not snap discontinuously between states. Smooth or static only. | `CHOREOGRAPHY_CAMERA_SNAP` |
| **C4 Focal evolution** | The `focal_primitive_id` shifts sensibly state-to-state (highlighting matches the teaching script narrative). | `CHOREOGRAPHY_FOCAL_DRIFT` |
| **C5 Annotation persistence** | An annotation introduced in STATE_N persists in STATE_{N+1} unless `is_persistent: false` is explicitly set. | `CHOREOGRAPHY_ANNOTATION_FLICKER` |

### Category D — Animation correctness (8 checks: 4 vision + D1p + 3 dense-pixel)

Vision model receives 5 keyframes captured at t = 0s, 2.5s, 5s, 7.5s, 10s:

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **D1 Animation actually plays** | At least 30% of pixel area changes between t=0s and t=10s. (Static = failure unless concept declares static.) | `ANIMATION_NO_PLAYBACK` |
| **D2 Smooth motion** | No frame shows a body at a position outside the convex hull of (previous frame, next frame) — no jitter or mid-motion teleport. | `ANIMATION_JITTER` |
| **D3 Timing matches narration** | When `teacher_script` declares STATE_N narration is X seconds, the sim remains in STATE_N visuals for between (X−1) and (X+1) seconds. *Skipped when timing metadata absent.* | `ANIMATION_TIMING_DRIFT` |
| **D4 No stuck frames** | Sim does not freeze on the same frame for > 3 seconds mid-state (would indicate render crash). | `ANIMATION_STUCK` |

**Dense adjacent-frame checks (2026-06-10, deterministic pixelGate, $0):** every state is
captured at ~1s intervals (`visual:eyes` always; smoke with `--dense`); adjacent frame pairs are
pixel-diffed. These catch motion failures *between* keyframes that D1–D4 structurally cannot see:

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **D1p Plays (pixel)** | pixelmatch diff between first and last keyframe ≥ 30% (deterministic complement to D1). | `ANIMATION_NO_PLAYBACK_PIXEL` |
| **D5 Dense motion present** | When the state DECLARES motion (`trajectory_mode` ≠ static / `advance_mode: auto_after_animation`), ≥1 adjacent pair differs by ≥0.5% of pixels. *Skipped when motion expectation unknown — never guesses.* | `ANIMATION_NO_MOTION` |
| **D6 No mid-state pixel teleport** | No adjacent pair diff exceeds max(20%, 8× median pair diff). A spike = parameter snap / trail reset / camera jump mid-state. | `ANIMATION_TELEPORT_PIXEL` |
| **D7 No stuck tail** | The last 3+ adjacent pairs are not all frozen (<0.5%) while earlier pairs moved — a frozen tail means the animation died mid-state. | `ANIMATION_STUCK_TAIL` |

### Category E — Pedagogical quality (act as teacher, 6 checks)

The most distinctive category — vision model inspects the storyboard (all states + teacher script + transitions) and answers as a teacher would:

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **E1 Concept teachability** | A Class 11 student watching only this simulation, with no other resource, can correctly explain the concept afterward. Returns yes / partially / no with reasoning. Only "no" fails. | `PEDAGOGY_CONCEPT_UNCLEAR` |
| **E2 Focal attention** | Each state has exactly one visual element drawing the eye (the `focal_primitive_id`). It is highlighted via color, border, or halo clearly. | `PEDAGOGY_NO_FOCAL` |
| **E3 Real-world anchor visible** | The Indian context anchor declared in JSON metadata (e.g., Mumbai train, Manali highway) is visually represented as a label, sketch, or annotation. | `PEDAGOGY_NO_ANCHOR` |
| **E4 Misconception explicitly shown (EPIC-C only)** | For EPIC-C variants: STATE_1 must visually depict the **wrong belief** — never a neutral baseline. *Skipped when EPIC-C not authored.* | `PEDAGOGY_EPICC_NEUTRAL_NOT_WRONG` |
| **E5 Formula visible when referenced** | When teacher script references a formula (e.g., F = ma), the formula is rendered on screen at that state via a `formula_box` primitive. | `PEDAGOGY_FORMULA_MISSING` |
| **E6 No information overload** | Each state introduces at most 2 new concepts/elements. State doesn't dump 6 forces, 4 labels, and 3 equations simultaneously. | `PEDAGOGY_INFO_OVERLOAD` |

### Category F — Panel A / Panel B bilateral sync (multi-panel only, 4 checks)

**Hybrid validation**: F1 and F4 are timing-exact, so Playwright reads postMessage timestamps directly (`validationMethod: 'dom'`). F2 and F3 are visual coherence, so they go to vision (`validationMethod: 'vision'`). Vision cannot reliably tell you "panel A reached STATE_3 at t=2.1s, panel B at t=2.4s" — DOM inspection is exact and removes a known false-positive class.

| Check | Pass criterion | Method | Failure → bug class |
|---|---|---|---|
| **F1 Simultaneous state** | At the same wall-clock time, both panels render the same `STATE_N`. No lag > 200ms (measured from `STATE_REACHED` postMessage timestamps). | DOM | `DUALPANEL_STATE_DESYNC` |
| **F2 Equation-physics coherence** | Panel B `traces[].equation_expr` mathematically describes Panel A physics. (E.g., Panel A shows projectile, Panel B's equation `y = -0.5*g*t^2 + v0*t` matches.) | Vision | `DUALPANEL_EQUATION_INCOHERENT` |
| **F3 Live dot follows Panel A** | Panel B `live_dot` x-coordinate matches Panel A current variable value. Slider drag in either panel moves the dot in lockstep. | Vision | `DUALPANEL_LIVEDOT_DRIFT` |
| **F4 PARAM_UPDATE round-trip** | Slider change in either panel reaches the other within 200ms (measured by Playwright firing `PARAM_UPDATE` in one iframe and timing receipt in the other). | DOM | `DUALPANEL_PARAM_RELAY_BROKEN` |

### Category G — Panel B practical understanding (multi-panel only, 6 checks)

Panel B is a graph; it must be readable by a Class 11 student:

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **G1 Axes labeled** | Both x-axis and y-axis carry a non-empty label string with unit. Vision verifies the label is rendered, not just declared in config. | `DUALPANEL_AXES_UNLABELED` |
| **G2 Axis range sensible** | Y-values across the visible x-range are within ±2× the y-axis range (no curves running off-screen, no compression to a flat line). | `DUALPANEL_RANGE_OFF` |
| **G3 Gridlines visible** | Plotly grid is on, with contrast distinguishable from the background. | `DUALPANEL_GRID_INVISIBLE` |
| **G4 At least one trace visible** | The traces array renders at least one line that is actually visible inside the plotted canvas. | `DUALPANEL_NO_TRACE` |
| **G5 Live dot in visible range** | The yellow `live_dot` is inside the axis box, not clipped at the edges. | `DUALPANEL_LIVEDOT_OFF_GRAPH` |
| **G6 Legend if multiple traces** | When 2 or more traces render, a legend renders to disambiguate them. | `DUALPANEL_NO_LEGEND` |

### Category H — Authoring hygiene (deterministic, 2 checks)

No LLM. pixelGate (H1) + regressionGate (H2):

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **H1 Template substitution leak** | No rendered text contains unsubstituted `{var}` / `{expr.toFixed(N)}` placeholders. DOM scan in screenshotter + tesseract OCR backstop on canvas text. | `TEMPLATE_LEAK` |
| **H2 Visual regression vs baseline** | Each state render pixelmatches its APPROVED baseline (`visual_baselines/<concept_id>/<state>.png`, width-640 normalized) within tolerance (default 2%). *Skipped when no baseline approved; animated states default `compare:false` (flake guard — baseline kept for human reference).* | `VISUAL_REGRESSION` |

**Baseline workflow:** `npm run visual:eyes -- <id>` → review → `npm run visual:approve -- <id>`
(copies the newest run into `visual_baselines/`, git-tracked, ~70 KB/state) → every later run
auto-compares. Re-approve after intentional visual changes. Scope: hand-authored diamonds only.

### Category I — TTS↔visual semantic sync (vision, 2 checks per bound state)

Runs ONLY when the caller provides concept-JSON bindings (`extractTtsVisualBindings` →
`tts_visual_bindings` in the vision context). The generation-time auto-fire path passes none →
Category I dormant there. The smoke script loads `src/data/concepts/<id>.json` and wires it.

| Check | Pass criterion | Failure → bug class |
|---|---|---|
| **I1 Glow target present** | Every `tts_sentences[].glow` target in the state maps to a visible, identifiable element in the render (judged with a primitive legend). PRESENCE only — never glow brightness (the 1.8s pulse means any captured instant can be mid-pulse). | `TTS_GLOW_TARGET_MISSING` |
| **I2 Declared math rendered** | Every `math_show` expression declared in the state is visibly rendered on screen. Vacuous pass when none declared. | `TTS_MATH_NOT_RENDERED` |

---

## Model cost ladder (2026-06-10)

Vision category tasks run through a tiered ladder in `visionGate.ts`:

| Tier | Model | Role |
|---|---|---|
| 0 | deterministic (pixelGate / regressionGate / DOM) | Free checks always run first/parallel |
| 1 | **Gemini 2.5 Flash** | Cheap first pass per category task. A CLEAN PASS is accepted as-is. |
| 2 | **Claude Sonnet 4.6** (authoritative) | Runs when Gemini errors, fails JSON/schema parse, or reports ANY failed check. Sonnet's verdict replaces Gemini's. |
| 3 | **Claude Opus** (flag-gated) | `VISION_ESCALATION_MAX_TIER=opus` → re-judges once when Sonnet still fails. Default OFF. |

Correctness never depends on Gemini: anything non-clean escalates. Kill-switch `VISION_LADDER=off`
restores the legacy direct-Sonnet path (also auto-disabled when a test injects a mock client or no
`GOOGLE_GENERATIVE_AI_API_KEY` exists). Per-tier cost logged to `ai_usage_log`
(`metadata.ladder_tier`: gemini / sonnet_direct / sonnet_escalated / opus_escalated).

---

## THE EYE protocol (operational discipline)

The validator only has power when it RUNS and its output is LOOKED AT (AUTHORING_PIPELINE.md §3 —
the 25-iteration Diamond #2 session happened with this rig built but unused). Before ANY founder
review of a diamond:

```bash
npm run visual:eyes -- <concept_id>          # $0 — capture all states + dense frames,
                                             # run all deterministic gates, dump PNGs
# → Read EVERY printed PNG path. Actually look.
npm run smoke:visual-validator -- <concept_id> --dense   # vision categories (ladder)
npm run visual:approve -- <concept_id>       # once founder-approved → baseline locked
```

Surface-everything rule: both scripts print EVERY check result, pass and fail, full failure
evidence, no `+N more` truncation. Nothing ships hidden.

---

## Conditional checks

Three checks are skipped when prerequisites aren't present:

| Check | Skipped when |
|---|---|
| **D3** Timing matches narration | `teacher_script.tts_sentences[].duration_ms` not authored |
| **E4** Misconception shown | `epic_c_branches` not authored on this concept |
| **F1–F4, G1–G6** Multi-panel checks | `panel_count < 2` (single-panel sim) |

In all other cases, all applicable checks run on every state (dense D5–D7 require --dense / visual:eyes capture; H2 requires an approved baseline; Category I requires concept-JSON bindings) of every concept's first generation pass.

---

## Severity tiers

| Tier | Behavior on failure | Used for |
|---|---|---|
| **CRITICAL** | Hard fail. Falls back to canonical EPIC-L if 2-attempt retry exhausted. | Physics violations (B), no-playback (D1), pedagogical clarity (E1), dual-panel desync (F1) — anything that materially harms learning |
| **MAJOR** | Hard fail with retry. May fall back if retry doesn't fix. | Most layout (A), choreography (C), graph quality (G) |
| **MODERATE** | Soft fail — logged and retried. Ships if retry passes; ships with warning if both attempts fail in the absence of a CRITICAL/MAJOR fail. | Cosmetic (A4 readability), camera continuity (C3), gridline visibility (G3) |

Severity is recorded per-row in `engine_bug_queue` for each of the 44 seeded bug classes.

---

## Authoring impact (what this means for Alex / Pradeep)

When authoring a new concept JSON, anticipate these checks:

1. **Place labels with anchor + offset** (zone:CALLOUT_ZONE_R, anchor:"primitive.top", offset:{dir:"up", gap:8}) — prevents A1, A2, A4.
2. **Compute UNIT_TO_PX = MAIN_ZONE.height × 0.70 / maxMagnitude** before placing arrows — prevents A3, B2.
3. **Declare motion_path between any two states where bodies move > 30% canvas width** — prevents C1.
4. **Render mg vector straight down (270° screen) on inclined planes** — components mg sin θ and mg cos θ are SEPARATE arrows — prevents B4.
5. **Each state introduces ≤ 2 new visual elements** — prevents E6, A5.
6. **EPIC-C STATE_1 explicitly shows the wrong belief** with red X or visual contrast — prevents E4.
7. **Indian real-world anchor labeled in STATE_1 or STATE_2** (Mumbai train, Manali highway) — prevents E3.
8. **For multi-panel: derive Panel B equation from Panel A physics, verify range covers x-domain** — prevents G2, F2.

The validator is the safety net. The authoring is the first line of defense.

---

## Cost note and caps

Per validation run: ~7 vision-model calls × ~$0.005/call = **~$0.04 per concept**. Cached after first pass, runs only on first generation or `forceRegenerate`. Total for v1 (55 concepts × ~1.5 passes) ≈ **$3.30 one-time**. Negligible.

**Cost caps enforced at the API route**:
- **Per-concept hard cap**: $5.00 — catches retry storms (≈125 validation runs, well above any healthy retry pattern). Validator returns 429 once exceeded for the day.
- **Daily soft alert**: $50.00 — surfaces in `/admin/costs` dashboard, no auto-shutdown.
- Caps are tracked per `concept_id` and per UTC day in `ai_usage_log`.

---

*Last sync with `spec.ts`: 2026-06-10. Last sync with engine_bug_queue migrations: 2026-06-10 (44 rows live in DB — verified).*
