# Design Spec — `bar_magnet_in_uniform_field` rebuild (Ch.5 #2, Socratic → straightforward)

**Date:** 2026-07-12
**Concept:** `bar_magnet_in_uniform_field` (NCERT Class 12 Ch.5 §5.2.3 — the dipole in a uniform field)
**Batch:** #2 of 4 in the founder's 2026-07-12 Ch.5 Socratic→straightforward rebuild directive
(1 ✅ `bar_magnet_as_dipole` · **2 ⏳ this** · 3 `gauss_law_magnetism` · 4 `earths_magnetism`).
**Renderer:** `field_3d`, scenario `bar_magnet_in_uniform_field` (already exists; shares
`applyDipoleInFieldState` with `dipole_in_uniform_field`).
**Reference shape:** concept #1 `bar_magnet_as_dipole` (guided-motion states + all-slider sandbox;
straightforward `misconception_watch` with `visual_counter`; no Socratic).

---

## 1. Why a rebuild (not a retrofit)

The existing `bar_magnet_in_uniform_field.json` (schema 2.0.0, 8 states) is **Socratic**: it uses
`advance_mode: "wait_for_answer"` (S4, S6), `pause_after_ms` predict→reveal beats (s4_2 "does that mean
nothing happens?", s6_2 "predict first…"), and `reveal_at_tts_id`-gated answer reveals. Rules 31/32
(founder 2026-07-01/08) retire that shape: guided states are **ONE idea + ONE complete motion**,
narration 25–55 EN words, cause-first, delta-cue captions, single glow-focal, no predict-pause. Per the
founder directive this is a **full-pipeline rebuild kept only if the visual quality holds**, not a
retrofit-surgeon Socratic-strip.

The **physics is complete and correct** and carries over unchanged:
τ = m × B, |τ| = mB·sinθ · ΣF = 0 in a uniform field (a couple) · U = −m·B = −mB·cosθ ·
T = 2π√(I/mB) · stable at θ=0° (U min), unstable at θ=180° (U max).

**Atomic claim.** A uniform external field B exerts on a bar magnet of moment m equal-and-opposite
pole forces (+mB on N along B, −mB on S against B) that form a **couple**: the net force is zero (no
translation), but the couple's torque τ = m × B, magnitude mB·sinθ, rotates the magnet toward
alignment — maximum at θ=90°, zero at θ=0°/180°; released near alignment it oscillates about θ=0° with
period T=2π√(I/mB); U = −mB·cosθ makes θ=0° stable (min) and θ=180° unstable (max).

**Cut-line.** The magnet's OWN field / closed loops / no-monopole / axial-equatorial 1/r³ is the
prerequisite `bar_magnet_as_dipole` (#1). Gauss's law for magnetism (∮B·dA = 0) is downstream
`gauss_law_magnetism` (#3). Conceptual-only ship (no `mode_overrides`). EPIC-L-first (no
`epic_c_branches`).

## 2. The five misconceptions (this concept's identity)

The source lists five confusions; each is confronted **at its own pivot** via a straightforward
`visual_counter` contrast beat (cause shown, then the real consequence — never a predict-pause):

| ID | Wrong belief | Confronted at | Visual counter |
|----|--------------|---------------|----------------|
| M1 | A uniform field pushes the magnet bodily **along B** | **S4** | Centre stays fixed (ΣF=0 badge) while only orientation changes — it turns, never translates |
| M2 | The magnet feels **no force at all** (poles cancel) | **S3** | Each pole visibly grows its own mB arrow; equal+opposite on different lines = a couple |
| M3 | Torque is **max when m ∥ B** (aligned) | **S6** | At 0°/180° the τ arrow is gone; at 90° it is fully extended |
| M4 | θ=180° is **as stable as** θ=0° | **S7** | Nudge at 0° springs back; nudge at 180° runs away and flips to 0° |
| M5 | The oscillation period is **independent of the field** | **S8** | B steps up → the swing visibly quickens, the T readout drops |

> **Note for quality_auditor:** 5 `misconception_watch` entries is above the usual 1–3/concept guidance
> (feedback: hooks-at-pivots-not-per-state). Justified here because the concept's whole pedagogical
> identity *is* these five distinct confusions, each attached to a genuinely different idea/state — not a
> per-state tic. Auditor to sanity-check, not auto-FAIL.

## 3. The 9-state arc (founder-approved granularity)

Each state = one idea + one **distinct** motion archetype (no repeat except S7's *declared* internal
contrast pair). Guided states are motion-driven with **no sliders** (deterministic for THE EYE); the
**S9 sandbox** exposes all three (m, B, θ). Narration 25–55 EN words/state (physics_author finalizes).

| # | Delta cue (≤5 w, `caption`) | One idea | Motion archetype (`rotation_mode` / flags) | Formula surface | Live HUD | Misc. |
|---|---|---|---|---|---|---|
| **S1** | "A magnet's moment m" | A bar magnet carries moment m (S→N); no field yet | **object-reveal**: m arrow grows in, gentle `idle_sway` (`static`, `p_animate_in`) | `m` (label) | — | — |
| **S2** | "Now a uniform field B" | A uniform field B (identical arrows) surrounds it at angle θ | **field sweep-in**: B arrows fade in, θ-arc appears (`static`, `e_field_animate_in`, `theta_arc`) | — | — | — |
| **S3** | "Each pole: force mB" | N feels +mB along B, S feels −mB against B → a couple | **vector-grow**: two pole-force arrows grow out (`static`, `force_vectors` both) | `F = mB` | — | **M2** |
| **S4** ⭐ | "Zero force, still turns" | ΣF=0 (no slide) yet the couple's τ turns it toward B — **PRIMARY aha** | **rotate-toward-alignment**: magnet swings θ→0°, centre fixed, ΣF=0 badge holds (`oscillation`, `tau_vector`, `sum_force_badge`) | `ΣF = 0,  τ = m × B` | `τ = … N·m` | **M1** |
| **S5** | "τ grows, then fades" | τ = mB·sinθ — a sine in the angle | **parameter-sweep**: θ 0→180→0, τ length scales sinθ (`theta_sweep`, `tau_vector`) | `τ = mB·sinθ` | `τ = … N·m` | — |
| **S6** | "Biggest at 90°" | τ max at θ=90° (⊥), zero at 0°/180° (∥) — a cross product | **discrete-pose compare**: snap 0°→90°→180°, τ compared at each (`pose_compare` ⚠ NEW, `tau_vector`) | `τ_max = mB` | `τ = … N·m` | **M3** |
| **S7** | "Nudge: back vs flip" | θ=0° stable (U min) vs θ=180° unstable (U max) | **perturbation-release contrast pair**: nudge@0°→springs back; nudge@180°→flips (`oscillation` then unstable-release; `energy_meter`) | `U = −mB·cosθ` | `U = … J` | **M4** |
| **S8** | "Stronger field, faster swing" | Oscillates about 0° with T=2π√(I/mB) — the vibration magnetometer | **periodic oscillation + rate-change**: steady swing, then B steps up → faster (`oscillation` + scripted B step ⚠ NEW) | `T = 2π√(I/mB)` | `T = … s` | **M5** |
| **S9** | "Your turn — drag" | Free exploration | **free explore** (`manual`, `show_sliders`: m, B, θ) | — | `τ … · U … · T …` | — |

⭐ PRIMARY aha = S4 (`aha_moment.state_id: "STATE_4"`, `primary: true`).

## 4. On-canvas text (Rule 34) & narration (Rule 30)

- **`caption`** = the ≤5-word delta cue (top pill) — the strings in the table above. NOT a prose sentence.
- **`label`** = a short student headline (bottom-left box), e.g. S4 "Net force zero — it still turns."
- **One formula surface/state** in the `formula_overlay` (Cambria-Math Unicode) — the "Formula" column.
- **HUD = value-only** live numbers (Rule 33d): `τ = 2.5×10⁻⁴ N·m`, `U = −…  J`, `T = … s` — no
  formula body duplicated in the HUD.
- **All math Unicode**: τ θ ° × √ π · ₀ ² ∥ ⊥ Σ — never ASCII (`tau`, `->`, `2pi`, `deg`). Sweep must
  cover all three text paths (DOM overlays, canvas graph text, 3D sprite labels). **Plain `m`, not `m⃗`**
  (concept #1: the U+20D7 combining arrow renders as tofu).
- **Narration** 25–55 EN words/state, 2–4 tight sentences; **expand bare symbols to spoken names**
  (m→"magnetic moment m", B→"magnetic field B", τ→"torque tau", θ→"angle theta", U→"potential energy U",
  T→"period T"); colour words stay English; plain English (no Hinglish). Telugu `text_te` authored last
  via the Sonnet-5 code-mix step (Rule 30g).

## 5. Real-world anchor (Rule 35 — universal)

Keep universal, no country-specific content: **(primary)** a magnetic compass needle is a tiny bar
magnet that swings to align with a field and springs back when pushed — τ = mB·sinθ at work;
**(secondary)** a lab vibration magnetometer — a suspended magnet whose timed swing T=2π√(I/mB) measures
a field; **(tertiary)** a magnet floating on a cork turning to line up with the field. All three are
culture-neutral (compass / lab instrument / floating magnet).

## 6. Physics config (carried over, re-verified)

Variables (unchanged from the old JSON): `m` A·m² [1,10] def 5 · `B` ×10⁻⁴ T [1,10] def 5 ·
`theta_deg` deg [0,180] def 45 · `I` kg·m² [1e-6,1e-4] def 1e-5.
Computed: `torque = m·(B·1e-4)·sin(θ)` · `torque_max = m·(B·1e-4)` · `U = −m·(B·1e-4)·cos(θ)` ·
`force_net = 0` · `period_T = 2π√(I/(m·B·1e-4))`. physics_author re-checks units/magnitudes and writes
the per-state numeric-lock table so a slider dragged in S9 cannot corrupt a guided state's readout.

## 7. Renderer touches (additive; via quality_auditor → renderer-primitives FAIL-route if needed)

The scenario already supports (from the old build + shared `applyDipoleInFieldState`):
`static`+`idle_sway_deg`, `oscillation` (amplitude/period), `theta_sweep`, an unstable-equilibrium flip
continuation, `energy_meter` (U-meter), the force couple (`force_vectors`), `tau_vector`,
`sum_force_badge`, `theta_arc`, and `show_sliders` (m/B/θ). Likely-additive work, expected to surface as
EYE-driven fix rounds (concept #1 took 3):

- **S6 `pose_compare` (NEW):** a rotation mode that snaps 0°→90°→180° on a clock so the τ arrow is
  compared at the three key angles (old S6 was a static freeze at 90°). Alternative if renderer work is
  disfavored: static at 90° with a small inset/annotation recalling τ=0 at 0°/180° — but pose-compare is
  the honest "delta visible" motion. **Decide during json_author; escalate to renderer FAIL-route.**
- **S7 unstable-release:** verify the existing unstable-flip continuation drives "nudge@180°→flip to 0°"
  as a *guided-state* motion (it exists for the electric-dipole sibling); wire it, or add a
  contrast-pair sub-clock (nudge@0° first, then nudge@180°).
- **S8 scripted B step-up (NEW):** a mid-state parameter step (B: default → higher) at a fixed timestamp
  so the swing visibly speeds and the T readout drops, proving M5. Must be frame-rate-independent
  (Rule 36) and forced-single-step under `SET_TIME_FREEZE` so THE EYE frozen frames stay byte-stable.

Every renderer edit: `npm run check:renderer-syntax`, no backticks inside the emitted template, and the
`bmProbeDispR`-style display/true-value decoupling if any probe leaves the 720px frame (concept #1).

## 8. Registration (8 sites) & schema

The concept already exists, so most sites are registered; json_author verifies all 8 and updates any
that reference the old state IDs/structure: concept JSON · `CONCEPT_PANEL_MAP`/`concept_panel_config` ·
`CONCEPT_RENDERER_MAP`→field_3d · `VALID_CONCEPT_IDS` · `CLASSIFIER_PROMPT` · clusters SQL migration
(authored-not-applied, N/A-DORMANT this phase) · seed-cache script · **NOT** `PCPL_CONCEPTS`, **NOT**
`PILOT_CONCEPTS` (reviewer-first). Keep `schema_version: "2.0.0"` (matches concept #1; the "2.2 gates"
are validator gates, not the JSON version string). `renderer_pair` both `field_3d`.

## 9. Verification & ship

1. `npx tsc --noEmit` 0 · `npm run validate:concepts` PASS (target concept).
2. Self-review checklist: Rule 15 (≥2 advance_mode: `manual_click` guided + `interaction_complete`
   sandbox) · Rule 19 (≥3 primitives/state) · Rule 24/34 (reads sound-off, one formula surface,
   value-only HUD, Unicode) · Rule 31 (one idea+motion/state, distinct archetypes, explore-last) ·
   Rule 32 (cause-first, delta-cue caption, home-pose continuity, single focal) · Rule 35 (universal
   anchor).
3. `npm run visual:eyes -- bar_magnet_in_uniform_field` (deterministic, $0) → **dispatch eye-walker +
   quality-auditor in parallel** (main session never loads the ~100 PNGs). Zero new `engine_bug_queue`
   rows; renderer FAIL-route rounds until EYE-clean.
4. **Founder visual review → founder triggers `npm run visual:approve`** (baselines locked per concept;
   a text-heavy de-clutter is an *expected* H2 baseline fail, re-baseline not a fix cycle — Rule 34e).
5. Telugu `text_te` via a `model: sonnet` sub-agent (Rule 30g code-mix). EN audio **on-demand only**
   (Rule 30h — the sim is a silent visual; render EN audio if the pilot needs it, not speculatively).
6. `npm run build:review -- bar_magnet_in_uniform_field` + serve on :8080 → provide the review link.
7. `PROGRESS.md` session log; NOT pushed / NOT in `PILOT_CONCEPTS` unless the founder promotes it.

## 10. Out of scope / YAGNI

No `mode_overrides` (board/competitive suspended, Rule 20) · no `epic_c_branches` (no real students,
2026-06-10) · no deep-dive/drill-down child states (dormant) · no new `scenario_type` (reuse the existing
one) · no PCPL/2D work · Hindi audio not rendered (text-only until a Hindi market). The `assessment`
block (6 MCQs) carries over, remapped to the new state IDs.
