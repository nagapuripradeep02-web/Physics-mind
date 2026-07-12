# ARCHITECT SKELETON — `bar_magnet_in_uniform_field` (RECONSTRUCTION, Rule 31/32/34)

**Concept:** `bar_magnet_in_uniform_field` — A Bar Magnet in a Uniform Field (τ = m × B, U = −m·B, T = 2π√(I/mB))
**Chapter:** 5 (Magnetism and Matter), NCERT Class 12 §5.2.3 · `class_level: 12` · `concept_tier: complex`
**Mode:** Full-pipeline RECONSTRUCTION of the existing Socratic-era JSON (`src/data/concepts/bar_magnet_in_uniform_field.json`, 8 states) — NOT a retrofit-surgeon delta (whole-shape rebuild, state count changes 8 → 9).
**Renderer:** `field_3d`, scenario `bar_magnet_in_uniform_field` (exists; shares `applyDipoleInFieldState` with the electric-dipole sibling).
**Primary input:** `docs/superpowers/specs/2026-07-12-bar-magnet-in-uniform-field-design.md` (arc followed row-for-row).
**Shape reference:** `src/data/concepts/bar_magnet_as_dipole.json` (concept #1, founder-approved — clone its arc/controls/caption shape, not its sentence lengths).

---

## §0a — Engine bug queue consultation (pre-authoring)

Consulted `docs/FIELD3D_SCENARIO_CHECKLIST.md` (the human-readable distillation of the `engine_bug_queue` field_3d `incident` + `directive` rows). **Exception + FLAG:** this dispatch is read-only (no Bash), so the headless `query_engine_bug_queue.ts bar_magnet_in_uniform_field` / `--field3d --open` query could not be run here — **quality_auditor MUST run it at Gate 8** and re-check every OPEN row against this rebuild.

Directive rows applied in this skeleton:

- **Concrete before abstract** → the magnet visibly TURNS (S4) before the sine law is named (S5); the couple's two arrows (S3) before the ΣF=0 abstraction (S4).
- **Reveal synced to narration** → json_author tunes every `at_ms` / `scenario_cue` to the sentence that names the thing (τ appears on the "torque tau" sentence, badge on the "cancel exactly" sentence). Cues via `scenario_cue` + `SET_CUE_TIME`, keeping `*_at_ms` as THE EYE fallback.
- **Visual must match narration** → "it does not slide" is SHOWN: a fixed centre-pin marker holds while the magnet rotates (S4); S8's "stronger field" is SHOWN: the B arrows visibly lengthen/brighten at the step.
- **Don't pre-spoil** → formula surfaces are gated: `F = mB` first at S3, `τ = m × B` at S4, `τ = mB·sinθ` at S5, `τ_max = mB` at S6, `U = −mB·cosθ` at S7, `T = 2π√(I/mB)` at S8. The `energy_meter` never appears before S7; the T readout never before S8.
- **Colour each element by its own identity** → N red / S blue / B-field blue arrows / m yellow / τ purple / pole forces green — no aggregate recolouring.
- **json_author scars:** specific `visible_elements` tokens (substring matcher); sliders in the LAST state only (satisfied — guided S1–S8 are deterministic, no sliders); don't narrate what isn't drawn; `focal_primitive_id` never the title label; this JSON's old `pause_after_ms` beats are deliberately DELETED (Rule 31), not "silently dropped".
- **renderer scars (for the two NEW touches, §7 of the design spec):** register `pose_compare` + the S8 scripted B-step in `deriveStateMeta.ts` in the SAME change (else THE EYE false-fails D7/D1p); no frozen tail (declare `reveal_hold` where a beat ends static); the S9 explorer needs idle auto-sweep or `interactive` hold-intent (headless harness never drags); Rule 36 frame-rate independence + forced single-step under `SET_TIME_FREEZE` for the B-step; `npm run check:renderer-syntax` after any renderer edit; no backticks in the emitted template.

---

## §0b — Reconstruction grading pass (every OLD state re-earns its row)

Scenario triage: **Class A** — the scenario already has per-state motion modes (`rotation_mode: static/oscillation/theta_sweep/manual`, `idle_sway_deg`, `theta_sweep`, `energy_meter`, `force_vectors`, `tau_vector`, `sum_force_badge`, `show_sliders`), so this is a pure JSON pass **plus two likely-additive renderer deltas** (S6 `pose_compare`, S8 scripted B-step) and one verification (S7 unstable-flip continuation exists for the electric-dipole sibling). Decide at json_author; escalate via quality_auditor FAIL-route `[owner: peter_parker:renderer_primitives]` — never cold-call.

| Old state | Content | Verdict | New home |
|---|---|---|---|
| S1 (magnet + m, `auto_after_tts`, 4 sentences) | magnet + moment intro | **KEEP**, re-script to budget, `manual_click` | **S1** |
| S2 (uniform B on, θ arc, "What will the field do?" question beat) | field + angle | **KEEP**, strip the question tease, re-script | **S2** |
| S3 (force couple, `reveal_at_tts_id` × 2) | ±mB couple | **KEEP**, reveals re-bound to clock cues, motion made explicit (arrows GROW) | **S3** |
| S4 (ΣF=0, `wait_for_answer`, `pause_after_ms: 3000` predict→reveal) | zero force, still turns | **KEEP** — the predict→reveal PAIR collapses to ONE straightforward beat; PRIMARY aha survives here | **S4** ⭐ |
| S5 (θ sweep sine, `auto_after_tts`) | τ = mB·sinθ | **KEEP**, `manual_click` | **S5** |
| S6 (frozen at 90°, `wait_for_answer`, `pause_after_ms: 3000` predict→reveal) | τ max at 90° | **REBUILD** — static freeze violates no-static; predict→reveal collapses to a straightforward pose-compare in motion | **S6** |
| S7 (stable + unstable + U-meter + period T — 5 sentences, 28 s, TWO misconception_watch entries) | equilibria AND oscillation | **SPLIT** — two ideas in one state: stability → new S7, oscillation/period → new S8 | **S7 + S8** |
| S8 (sandbox, `interaction_complete`) | explore | **KEEP** | **S9** |

**Deletion/renumbering mechanics checklist (json_author accounts for ALL):**
- `state_count: 8 → 9`; contiguous STATE_1…STATE_9 in BOTH `epic_l_path.states` and `field_3d_config.states`.
- `entry_state_map` re-mapped to the new numbering (§7 below); shape follows concept #1's `{start, end}` object form.
- Gate 12: `manual_click` (S1–S8) + `interaction_complete` (S9) = 2 distinct modes ✓. Strip ALL of: `wait_for_answer` (old S4, S6), `auto_after_tts` (old S1, S5), `pause_after_ms` (old s4_2, s6_2), `reveal_at_tts_id` (old S3, S4, S6). Zero `narrative_socratic`.
- `aha_moment.state_id` stays `STATE_4` — add `"primary": true` (missing in the old JSON).
- `assessment` (6 MCQs) carries over verbatim; `teaches_state` remap: Q1→S3, Q2→S4, Q3→S5, Q4→S6, Q5→**S7**, Q6→**S8**. `coverage_map.non_assessed_states: [STATE_1, STATE_2, STATE_9]`.
- TTS: ALL nine states' scripts are REWRITTEN → full EN re-voice at ship time (Rule 30h: EN audio on-demand). Telugu `text_te` via the Sonnet-5 sub-agent (Rule 30g).
- `visual_baselines/bar_magnet_in_uniform_field/` regenerate ONLY after founder `visual:approve`.
- Registration: concept already exists — json_author VERIFIES all 8 sites; NOT `PCPL_CONCEPTS`, NOT `PILOT_CONCEPTS`. Keep `schema_version: "2.0.0"`.
- Re-seed the concept's cache after restructuring.

---

## §1 — Atomic claim

This concept teaches what a UNIFORM external field B does to a bar magnet of moment m — equal-and-opposite pole forces (±mB) forming a couple, so ΣF = 0 (no translation) yet τ = m × B = mB·sinθ rotates it toward alignment, with U = −mB·cosθ making θ=0° stable / θ=180° unstable and small oscillations of period T = 2π√(I/mB) — and only that. It does NOT cover the magnet's own field / closed loops / no-monopole / 1/r³ (prerequisite `bar_magnet_as_dipole`), nor ∮B·dA = 0 (deferred to `gauss_law_magnetism`), nor non-uniform-field translation (out of scope; noted only as the S4 contrast clause "a NON-uniform field would also pull").

## §2 — State count + arc

**9 states** (complex tier; founder-approved granularity). A student who watches all 9 can answer any conceptual exam question on τ, ΣF, U, stability, and T for a dipole in a uniform field.

| # | Headline (`label`) | Purpose (one line) | `teaching_method` |
|---|---|---|---|
| S1 | "A bar magnet carries a moment m, S → N" | Re-establish the object: magnet + its moment vector, no field yet | straightforward (omit field) |
| S2 | "A uniform field B — the same everywhere" | The environment: identical B arrows fill the volume; magnet tilted at θ | straightforward |
| S3 | "Each pole feels mB — a couple" | N gets +mB along B, S gets −mB against B: equal, opposite, different lines | straightforward |
| S4 ⭐ | "Net force zero — it still turns" | ΣF = 0 (centre pinned) yet τ = m × B swings it toward B — **PRIMARY aha** | straightforward |
| S5 | "τ = mB·sinθ — a sine in the angle" | Sweep θ; τ rises from zero, peaks, falls back | straightforward |
| S6 | "Biggest at 90°, zero at 0° and 180°" | The cross product: compare τ at the three key poses | straightforward |
| S7 | "0° springs back; 180° flips away" | Stable vs unstable equilibrium via U = −mB·cosθ | straightforward |
| S8 | "Stronger field, faster swing" | Oscillation about 0°, T = 2π√(I/mB) — the vibration magnetometer | straightforward |
| S9 | "Your turn — drag m, B and θ" | Free exploration, all readouts live | `exploration_sliders` |

`advance_mode`: S1–S8 `manual_click`, S9 `interaction_complete` (Gate 12 ✓). The hook MOVES from t=0 (S1's m arrow grows in over the idle-swaying magnet — no static setup state).

## §3 — Per-state choreography + control plan (Rule 31 — the control table)

Guided states expose **zero sliders** (deterministic for THE EYE); S9 exposes ALL three. No archetype repeats; S7's repeat is INTERNAL — a declared contrast pair within one state whose delta names the flip.

| # | Caption = delta cue (≤5 w) | Teaches | Motion archetype | Distinct motion (cause → beat → effect, Rule 32a) | Delta vs previous | Controls | Formula surface | HUD | Words |
|---|---|---|---|---|---|---|---|---|---|
| S1 | "A magnet's moment m" | The object carries a moment m, S→N | **reveal-build** | Magnet at home pose, gentle 3° idle sway → beat → yellow m arrow GROWS out S→N (`p_animate_in`). Focal: m arrow. | Fresh scene — object only, no field | — | `m` (label only) | — | 25–35 |
| S2 | "Now a uniform field B" | A uniform field = identical arrows everywhere; magnet tilted at θ | **sweep-in** | Field switch-on: blue B arrows sweep/fade in across the volume (`e_field_animate_in`) → beat → yellow θ arc draws itself between m and B. Focal: B arrows, then arc. | Environment appears; object unchanged | — | — | — | 25–35 |
| S3 | "Each pole: force mB" | Each pole feels its own force; equal + opposite on different lines = a couple | **vector-grow** | Field shimmers once (cause) → beat → green +mB arrow grows from N along B → beat → green −mB grows from S against B. Focal: the force pair. | The field now visibly ACTS — two new arrows | — | `F = mB` | — | 35–45 |
| S4 ⭐ | "Zero force, still turns" | ΣF = 0 yet τ ≠ 0 — the couple turns, never pushes. **PRIMARY aha.** | **rotate-toward-alignment** | The two force arrows pulse (cause) → ghost tip-to-tail sum collapses to nothing, ΣF = 0 badge stamps, centre-pin dot marks the fixed centre → beat → purple τ appears ⊥ the m–B plane and the magnet swings θ≈55°→0° (single damped relaxation swing), centre never drifting. Focal: forces → badge → τ. | The scene finally MOVES — rotation with a pinned centre | — | `ΣF = 0,  τ = m × B` | `τ = … N·m` | 45–55 |
| S5 | "τ grows, then fades" | τ = mB·sinθ — a sine in the angle | **parameter-sweep** | θ arc visibly opens as θ drives 0→180→0 (10 s cycle, cause) → τ arrow length and the τ HUD number track sinθ live. Focal: τ arrow. | Rotation becomes a measured scan | — | `τ = mB·sinθ` | `τ = … N·m` | 30–40 |
| S6 | "Biggest at 90°" | τ max at 90° (⊥), zero at 0°/180° (∥) — cross-product geometry | **pose-compare** | Snap to 0° (cause), hold ~1.5 s → τ absent, HUD reads 0 → snap to 90° → τ fully extended, HUD reads mB → snap to 180° → τ gone again. Loop. Focal: τ at the held pose. | Continuous sweep becomes three frozen verdicts | — | `τ_max = mB` | `τ = … N·m` | 35–45 |
| S7 | "Nudge: back vs flip" | θ=0° stable (U min) vs θ=180° unstable (U max) | **perturbation-release** — declared INTERNAL contrast pair | U-meter enters (camera eases back to frame it — the only camera move). Pair A: magnet at 0°, a visible ~15° nudge (cause) → beat → springs back, settles; U marker at BOTTOM. Pair B: magnet at 180°, the SAME small nudge → beat → deviation grows, magnet flips to 0°; U marker falls from TOP to bottom. Focal: U-meter. | Same perturbation, two opposite outcomes | — | `U = −mB·cosθ` | `U = … J` | 45–55 |
| S8 | "Stronger field, faster swing" | T = 2π√(I/mB) — the vibration magnetometer | **oscillate/track** + scripted rate-change | Steady oscillation about 0° (~25° amplitude), T HUD live → at a fixed clock timestamp B STEPS UP: the field arrows visibly lengthen/brighten (cause) → beat → the swing quickens, the T readout drops. Focal: T readout. | Oscillation itself becomes the measured thing; B changes mid-state for the first time | — | `T = 2π√(I/mB)` | `T = … s` | 45–55 |
| S9 | "Your turn — drag" | Free exploration | **drag-sandbox** | Idle demo motion (gentle θ auto-sway) until a trusted drag seizes manual; τ arrow, force couple, U-meter, all readouts live on every drag. Player free-runs (Rule 37). | All controls, all readouts | **m, B, θ** (ALL) | — | `τ … · U … · T …` | 0/open (≤20-word invite) |

**Rule 32 legibility plan:** cause always moves first, effect after a ~0.5–1 s readable beat · only the taught variable's motion changes per state · the caption column IS the ≤5-word delta cue · same apparatus persists from the home pose (magnet never teleports, field switches on once at S2 and stays, camera moves only once at S7) · exactly ONE glow focal at any instant (Rule 29 brightness-only, `tauThrob` only when the real magnitude changes).

## §4 — Misconception confrontation plan (Rule 16a — EXACTLY 5, at the pivots)

Each is a straightforward cause-then-effect contrast beat — NO prediction question, NO pause. All five are `misconception_watch` entries (`belief` + `visual_counter` + `one_line_fix`) on their pivot state; S1/S2/S5/S9 carry NONE.

| ID | State | Wrong belief | Straightforward contrast beat (visual_counter) |
|---|---|---|---|
| M2 | **S3** | The magnet feels no force at all — the poles cancel | Each pole visibly GROWS its own mB arrow, one after the other: equal + opposite but on different lines — the forces are real, arranged to twist |
| M1 | **S4** | A uniform field pushes the magnet bodily along B | The centre-pin dot holds fixed and the ΣF = 0 badge stamps while ONLY orientation changes — it turns, never translates |
| M3 | **S6** | Torque is maximum when m ∥ B (aligned) | At the 0° and 180° held poses the τ arrow is GONE; at 90° it is fully extended with HUD τ = mB |
| M4 | **S7** | θ = 180° is as stable as θ = 0° — torque is zero at both | The SAME nudge: at 0° the magnet springs back (U marker at bottom); at 180° it runs away and flips clear to 0° (U marker falls from top) |
| M5 | **S8** | The oscillation period is independent of the field | B visibly steps up (arrows lengthen) → the swing quickens and the T readout drops on screen |

**Note for quality_auditor:** 5 entries exceeds the usual 1–3/concept guardrail (founder 2026-07-04). Justified: this concept's pedagogical identity IS these five distinct confusions, each on a genuinely different idea/state — not a per-state tic (S1, S2, S5, S9 carry none). Sanity-check, don't auto-FAIL.

EPIC-C branches: **NONE** (EPIC-L-first directive 2026-06-10).

## §5 — `has_prebuilt_deep_dive` states (cache hint, NOT a gate; deep-dive dormant per Rule 18)

- **STATE_4** — the core insight and stickiest conflation (zero net force ≡ nothing happens).
- **STATE_6** — cross-product abstraction (why sinθ; why ⊥ maximizes and ∥ kills).
- **STATE_7** — energy abstraction (U = −mB·cosθ, the negative sign, stability-as-energy-minimum).

All other states `false`/omit.

## §6 — Drill-down clusters (3 candidates per deep-dive state; physics_author fleshes out trigger_examples)

**STATE_4:** `zero_force_but_torque` · `what_is_a_couple` · `uniform_vs_nonuniform_field_force`.
**STATE_6:** `torque_cross_product_geometry` · `torque_zero_at_alignment` · `tau_direction_right_hand_rule`.
**STATE_7:** `stable_vs_unstable_equilibrium` · `potential_energy_negative_sign` · `work_to_rotate_dipole` (W = ΔU; 0°→180° costs 2mB).

## §7 — `entry_state_map`

```
entry_state_map:
  foundational:       STATE_1 → STATE_9   # full arc; contains the PRIMARY aha (S4) ✓
  couple_force:       STATE_3 → STATE_4
  torque_angle:       STATE_5 → STATE_6
  stability_energy:   STATE_7 → STATE_7
  oscillation_period: STATE_8 → STATE_8
  explore:            STATE_9 → STATE_9
```

Object `{start, end}` form (match concept #1). Default aspect = `foundational`. json_author registers the new aspect values in `ASPECT_VOCABULARY` / `CLASSIFIER_PROMPT`. Foundational-coverage rule satisfied: STATE_4 is inside the foundational range.

## §8 — Prerequisites (advisory only, Rule 23)

- `bar_magnet_as_dipole` — SHIPPED (concept #1, founder-approved 2026-07-12). Supplies: what m is, S→N convention, the magnet-as-dipole identity.
- `torque_on_current_loop_in_field` — SHIPPED. Supplies: τ as a cross product, the couple-on-a-loop picture.

Graph edge: `bar_magnet_as_dipole → bar_magnet_in_uniform_field → gauss_law_magnetism / earths_magnetism`. Sibling analog (not a prerequisite): `electric_dipole_in_field` — same rotational engine, τ = p × E twin; narration may echo the analogy in one clause at most.

## §9 — Real-world anchor (Rule 35 — universal, culture-neutral)

- **Primary — the compass needle.** A magnetic compass needle is a tiny bar magnet in the Earth's roughly uniform field. Release it → swings until it points along the field; push it aside → springs straight back. That spring-back IS τ = mB·sinθ. Explains the one thing everyone has noticed about a compass but never named: it *snaps back*.
- **Secondary — the lab vibration magnetometer.** A small bar magnet hung from a thread: twist, release, time the swings. One swing takes T = 2π√(I/mB), so counting swings MEASURES a field (S8's state, literally).
- **Tertiary — a magnet floating on a cork.** Free to turn on water, it rotates until it lines up with the field and settles — τ = m × B parking the magnet in its lowest-energy pose.

All three culture-neutral (a compass, a lab instrument, a floating magnet — no places, festivals, currency, brands). Plain English throughout.

## §10 — Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 9 rows of §2/§3 — each with caption cue, label headline, motion, formula surface, HUD, script inside 25–55 EN words (S9 open).

**(b) Symbol-label table** (every narrated quantity → exact on-canvas label; ALL Unicode — τ θ ° × √ π Σ − · ⊥ ∥; **plain `m`, never `m⃗`** — the U+20D7 tofu scar; sweep covers DOM overlays, canvas graph text, 3D sprite labels):

| Narrated as | On-canvas label | Where |
|---|---|---|
| "magnetic moment m" | `m` (yellow arrow S→N) | S1+ |
| "magnetic field B" | `B` (blue identical arrows; one labelled) | S2+ |
| "angle theta" | `θ` (yellow arc between m and B) | S2+ |
| "force on the north pole" | `+mB` (green arrow at N) | S3, S4, S9 |
| "force on the south pole" | `−mB` (green arrow at S) | S3, S4, S9 |
| "net force" | `ΣF = 0` (badge) | S4 |
| "torque tau" | `τ` (purple arrow ⊥ m–B plane) | S4–S9 |
| "potential energy U" | `U` (U-meter + HUD `U = … J`) | S7, S9 |
| "period T" | HUD `T = … s` | S8, S9 |
| "moment of inertia I" | appears only inside the S8 formula surface `T = 2π√(I/mB)` | S8 |

**(c) Right-hand-rule plan:** ONE direction-teaching moment — S4. The cross-product rule delivered by the τ arrow itself (drawn ⊥ to both m and B, out of the rotation plane) plus one narration clause ("curl your fingers from m toward B — your thumb gives tau"). No 3D hand mesh; no grip rule.

**(d) Motion plan:** the §3 control table — something moves in ALL nine states; the two NEW renderer touches (S6 `pose_compare`, S8 scripted B-step) and the S7 unstable-flip verification are itemized in §0b + spec §7, routed via quality_auditor if renderer work is needed.

**(e) Modes:** conceptual-only — NO `mode_overrides` (Rule 20). `advance_mode` = `manual_click` ×8 + `interaction_complete` ×1.

**(f) Assessment + coverage + watch:** `assessment` carries over (6 MCQs, remapped Q1→S3, Q2→S4, Q3→S5, Q4→S6, Q5→S7, Q6→S8); `coverage_map.by_state` accordingly, `non_assessed_states: [STATE_1, STATE_2, STATE_9]`; the five `misconception_watch` entries at S3/S4/S6/S7/S8. Q2 hits the aha state (Gate 20 ✓); ≥3 distinct tested_ideas ✓.

---

## Two-pass lens — Block 1 (Pass-1 strategic checklist)

**1. Prerequisite cliff.** `bar_magnet_as_dipole`: breaks at **S1** if a student doesn't know m points S→N — patched by one S1 narration clause ("its moment m, pointing from the south pole to the north"). `torque_on_current_loop_in_field`: breaks at **S5/S6** if "cross product" is unfamiliar — patched by one S6 sentence deriving the behaviour from the picture, not the algebra. S1 is an introductory hook state (excluded from deep-dive by policy); its gap is patched in narration.

**2. JEE-backwards trace** (conceptual arc; board/competitive deferred — Rule 20). *"A bar magnet of moment 5 A·m² hangs in a uniform field 5×10⁻⁴ T at 30°. (i) torque? (ii) work 0°→180°? (iii) B quadrupled → period?"* — (i) τ = mB·sinθ → **S5** on foundation of **S3/S4**; (ii) W = U(180°)−U(0°) = 2mB → **S7**; (iii) T ∝ 1/√B → halves → **S8**. Every needed piece has a delivering state.

**3. Misconception entry mapping (16a).** Each state's honest teaching PLANTS the next wrong belief, killed by the very next pivot: **M2** planted by "poles cancel" → S3. **M1** planted BY S3 (two ±B arrows invite "so it gets shoved") → S4. **M3** planted by S4's "turns toward alignment" → S6. **M4** planted BY S6 (τ = 0 at BOTH ends) → S7. **M5** planted by pendulum intuition → S8. No EPIC-C fallback branches (deferred); 16a delivery only.

## Two-pass lens — Block 2 (Aha-moment designation)

- **PRIMARY aha (S4):** *Zero net force and non-zero torque are true at the same instant — the magnet turns without going anywhere.*
- **SUPPORTING aha 1 (S6):** torque is a cross product — biggest where the magnet is most crooked (90°), dead where aligned.
- **SUPPORTING aha 2 (S7):** the two zero-torque poses are opposites — 0° a valley, 180° a hilltop; the same nudge heals one and destroys the other.
- **Cohesion check:** both supporting ahas serve the primary's single thesis ("the field's grip is purely rotational — described by τ(θ), settled by U(θ)"). S8's period result is deliberately NOT an aha, just the primary's instrumental payoff.
- **Foundational-coverage rule:** PRIMARY aha (S4) ∈ `foundational: STATE_1 → STATE_9` ✓.

## Source check

Consulted NCERT Class 12 Ch.5 §5.2.3 table-of-contents scope only (confirms: dipole-in-uniform-field is its own section, matching this cut-line). No teaching method / example / figure imported; teaching sequence authored from first principles; physics is the old JSON's own verified content.

## Escalations

None blocking. Two renderer touches (S6 `pose_compare`, S8 scripted B-step) flagged as likely-additive — json_author attempts within existing scenario flags first; if the scenario can't render them, quality_auditor FAIL-routes `[owner: peter_parker:renderer_primitives]` with §0b's scar constraints attached. **One FLAG to quality_auditor:** run `query_engine_bug_queue.ts bar_magnet_in_uniform_field` + `--field3d --open` at Gate 8 (headless query not runnable from the read-only architect dispatch).

---

**Handoff:** ready for `physics-author` (motion timelines + numeric-lock table + final scripts) → `json-author` (JSON + 8-site verification) → `quality-auditor`.
