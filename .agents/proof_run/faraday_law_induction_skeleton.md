# faraday_law_induction — architect skeleton (Rule 31 exemplar — CLONE THIS SHAPE)

> **[NEW MODEL — the canonical Rule 31 exemplar, 2026-07-02; archetype/delta columns + word budget 2026-07-08.]**
> This skeleton is reverse-engineered from the SHIPPED `src/data/concepts/faraday_law_induction.json`
> (built natively in the straightforward + per-state-contextual-controls model, founder-approved).
> New concepts clone THIS shape: straightforward distinct-motion beats (ONE idea + ONE complete motion,
> narration 25–55 EN words ≈ 2–4 tight sentences, no Socratic predict→reveal), per-state contextual
> controls, combined interactive explore-last, one scenario engine.
> **Word-budget caveat:** faraday's shipped narration (67–94 EN words/state, measured 2026-07-08)
> PREDATES the 25–55 budget — clone the arc/controls/archetypes, NOT the sentence length. The first
> true word-budget exemplar will be the next natively-authored concept (`magnetic_flux`).
> Companion: `magnetisation_and_intensity` (same model, retrofitted from founder video review).

## 1. Atomic claim

This concept teaches that a CHANGING magnetic flux — and only a changing one — induces an EMF
(ε = −N dΦ/dt), with the minus sign as Lenz's opposition. It does not cover motional EMF of a
sliding rod (ε = Bvl), self/mutual inductance, or AC generators (deferred to later Ch.6 concepts).

## 2. State count + arc (6 — complexity-driven)

Guided distinct-motion beats → combined interactive last. The hook MOVES (flux shimmer), no state
is static, no `teaching_method` fields (Rule 31 default).

## 3. Per-state choreography + control plan — THE CONTROL TABLE (Rule 31 — first design artifact)

| state | teaches | archetype | DISTINCT motion (no repeats; pure fn of state clock) | delta (→ ≤5-word caption cue, Rule 32c) | live control(s) | narration (EN words)* |
|---|---|---|---|---|---|---|
| S1 `flux_steady` | Φ = B·A·cosθ; steady flux → ε = 0 | `null-result-hold` | magnet HELD STILL partway in; flux lines shimmer/breathe; needle pinned at zero (the contrast beat) | setup: big flux, zero current | **none** (watch) | 79 |
| S2 `push_in` | changing flux induces ε (AHA) | `translate-through` | magnet SLIDES IN (smoothstep 2.2s); flux lines densify; needle swings; current beads start flowing | motion begins → needle kicks | **none** (guided) | 81 |
| S3 `pull_out` | sign of ε follows the change direction | `translate-through` (contrast pair of S2) | magnet SLIDES OUT; flux thins; needle swings the OTHER way; beads reverse | direction reverses → sign flips | **none** (guided) | 67 |
| S4 `lenz` | the − sign = opposition (energy conservation) | `cycle-compare` | two-phase LOOP: slow approach (coil face = red N, repels) → withdrawal (face flips blue S, attracts); force arrow always against the motion | pole face opposes BOTH ways | **none** (guided) | 94 |
| S5 `rate` | ε = −N dΦ/dt — rate + turns scale it | `oscillate/track` | magnet OSCILLATES; needle amplitude tracks the speed slider live | speed & turns scale ε | **speed v · turns N** | 84 |
| S6 `sandbox` | synthesis — recover every relation | `drag-sandbox` | teacher DRAGS the magnet; flux/needle/beads/readout all live | all yours | **ALL: position · speed · turns** | 0/open |

\* Measured 2026-07-08 from the shipped JSON — these counts PREDATE the 25–55 word budget (Rule 31a);
new concepts must land 25–55 per guided state. S2/S3 sharing `translate-through` is the canonical
declared contrast/reversal pair (delta names the flip); every other archetype appears once;
`drag-sandbox` on the explore state only.

Control-table catches honored: one panel (`far_sliders`) built once, rows (`far_pos_row` /
`far_speed_row` / `far_turns_row`) shown/hidden per state by the scenario block's `mode`; shared
sliders keep bottom-right position + row order; S1–S4 having zero controls is FINE — their
choreography auto-plays (motion ≠ interactivity). Rule 32 legibility honored: cause→effect ordering
(magnet moves, THEN needle/beads respond), one variable moves per state, apparatus persists (same
coil/magnet/needle home pose across all six states), delta column doubles as the caption cue.

## 4. Misconception confrontation plan (Rule 16a — contrast beats, no predict→reveal)

| wrong belief | state | how the MOTION confronts it |
|---|---|---|
| "a magnet near a coil induces current" | S1 | magnet sits INSIDE the coil, big Φ on the readout — needle pinned at 0 the whole beat |
| "the flux SIZE sets the EMF" | S2 | needle deflects only WHILE moving; stops → drops to zero despite large flux |
| "induced current always flows one way" | S3 | pull-out visibly reverses needle + beads vs S2 |
| "the − sign is just convention" | S4 | pole face flips N↔S with the motion direction; force arrow always opposes |
| "only a stronger magnet raises ε" | S5 | same magnet, faster/more turns → bigger deflection |

Each carries a `misconception_watch` entry (`belief` + `visual_counter` + `one_line_fix`).

## 5. advance_mode plan (Gate 12)

`manual_click` on S1–S5 + `interaction_complete` on S6 = 2 distinct modes. **No `wait_for_answer`**
(legacy mode, Rule 31). Never `auto_after_animation` on a live state (THE EYE false-fail).

## 6. aha_moment

STATE_2 (inside `entry_state_map.foundational`): "Moving the magnet changes the flux, and a changing
flux induces an EMF." Visual confirmation: flux lines pack denser + needle swings off zero.

## 7. entry_state_map

`foundational → STATE_1–4`, `exploration → STATE_5–6`.

## 8. Prerequisites (advisory, Rule 23)

`magnetic_field_solenoid`, `bar_magnet_as_dipole`.

## 9. Real-world anchor (Indian, plain English)

Primary: a magnet dropped down a copper pipe falls in slow motion — Lenz's opposition you can watch.
Secondary: the 220/400/765 kV grid step-up/step-down transformers + the induction cooktop.

## 10. Definition of Done (Gate 0)

- Every quantity narrated has an on-canvas symbol label (Φ, ε, N, B) — labels symbolic (Rule 24).
- Motion rows: all six table rows above — every branch a pure fn of `time − stateStartTime` (Rule 26).
- Controls: panel built once in `buildFaraday()`; visibility per the table; `ev.isTrusted` guard so a
  real drag seizes manual (trusted-drag rule).
- Readout carries the numbers (Φ, N, ε live); legend suppressed (silent visual, Rule 24).
- Trilingual TTS authored (EN/HI/TE, Rule 30 — symbols expanded in speech, colours stay English),
  narration off by default.
- Conceptual only (Rule 20); no assessment block (deferred); no EPIC-C branches.
- THE EYE clean + **runtime Playwright probe** (zero console errors — frozen capture cannot catch
  per-frame dispatch throws) + regression on sibling concepts sharing renderer helpers.
