# PHYSICS BLOCK — `bar_magnet_in_uniform_field` (rebuild, 9 states)

**Prepared by:** physics-author · **Input:** `.agents/proof_run/bar_magnet_in_uniform_field_skeleton.md` + design spec `2026-07-12-bar-magnet-in-uniform-field-design.md` · **Physics source:** old JSON `src/data/concepts/bar_magnet_in_uniform_field.json` (verified, unchanged) · **Handoff to:** json-author

---

## §0 — Engine bug queue consultation

Live query (Bash available):
```
query_engine_bug_queue.ts bar_magnet_in_uniform_field --field3d --open  → No matching rows (clean)
query_engine_bug_queue.ts bar_magnet_in_uniform_field                   → 2 FIXED rows, both apply
```

- `dipole_growth_timer_desync` (FIXED): one-shot growth timers (`p_animate_in`, `e_field_animate_in`) must be pure `time − stateStartTime`. S1 m-arrow grow + S2 B-arrow sweep-in specified as clock-relative windows; use the existing flags exactly. eye_walker probe: S1/S2 dense frames must show progression (not final at t=0).
- `dipole_replay_animations_scenario_type_gap` (FIXED): generalized to gate on `findTorqueLoopGroup()` presence — this concept is covered, but quality_auditor must re-verify REPLAY_ANIMATIONS rebases `rotation_start_time` for the NEW S6 `pose_compare` mode.
- Fleet-wide relevant: `default_variables_only_first_var_merged` (CRITICAL/FIXED) → addressed by §3's per-state numeric-lock table. `mfl_control_panel_slider_desync` (CRITICAL/FIXED) → any HUD number must recompute from the CURRENT per-frame angle/field, not a cached snapshot (S4 swing, S5 sweep, S6 holds, S7 both phases, S8 osc+step, S9 sliders).

No OPEN rows block this rebuild.

---

## §1 — Variable declarations

```json
"variables": {
  "m":         { "name": "Magnetic moment of the bar magnet",       "unit": "A·m²",    "min": 1,    "max": 10,   "default": 5,    "step": 0.5 },
  "B":         { "name": "Magnitude of the uniform external field", "unit": "×10⁻⁴ T", "min": 1,    "max": 10,   "default": 5,    "step": 0.5 },
  "theta_deg": { "name": "Angle between m and B",                   "unit": "deg",     "min": 0,    "max": 180,  "default": 45,   "step": 1 },
  "I":         { "name": "Moment of inertia of the magnet",         "unit": "kg·m²",   "min": 1e-6, "max": 1e-4, "default": 1e-5, "step": 1e-6 }
}
```

**Two corrections to the old JSON:**
1. `theta_deg.default` was inconsistent (physics_engine_config=60 vs slider_controls=45). **Standardize to 45°** in BOTH places (only affects S9 entry pose; guided states lock their own θ).
2. `I` is **never a UI slider** — fixed constant at default 1×10⁻⁵ kg·m² everywhere, appears only inside the S8/S9 formula surface `T = 2π√(I/mB)`. Do NOT add I to `slider_controls` or any `visible_controls`.

`B`'s unit is a display convention: slider value `B_raw ∈ [1,10]` represents `B_raw × 10⁻⁴ T`. Every formula multiplies by `1e-4` for true Tesla. Must be consistent — see §7 flag on the existing renderer `bmf_readout`, which uses a DIFFERENT ("relative") scaling and must be reconciled.

---

## §2 — Per-state motion timeline + narration + cue bindings

Convention: `τ = m·(B×10⁻⁴)·sinθ` [N·m] · `U = −m·(B×10⁻⁴)·cosθ` [J] · `T = 2π√(I/(m·(B×10⁻⁴)))` [s], I = 1×10⁻⁵ fixed.

### STATE_1 — "A magnet's moment m" (reveal-build)
- 0–∞: magnet at home pose, ±3° idle sway (`rotation_mode:"static"`, `idle_sway_deg`). ~1000–2200 ms: yellow `m` arrow grows S→N (`p_animate_in`, pure `t−stateStart`).
- **Narration (27w):** "This is a bar magnet — north pole red, south pole blue. Its magnetic moment m, in yellow, points from south to north and measures how strong it is."
- Cues: s1_1 @0 · s1_2 @~1000 (p_animate_in; `*_at_ms:1000` EYE fallback).
- Locked: `theta_deg:90` (no field), `e_field:false`. duration 14s. Glow: `m`.

### STATE_2 — "Now a uniform field B" (sweep-in)
- 0–1200 ms: blue B arrows fade/sweep in identical everywhere (`e_field_animate_in`). 1800–2600 ms (≥0.5s beat): yellow θ-arc draws between m and B.
- **Narration (32w):** "Now switch on a uniform magnetic field B — every blue arrow is identical, same length and direction everywhere. The magnet sits tilted at angle theta to the field, marked by the yellow arc."
- Cues: s2_1 @0 → e_field_animate_in · s2_2 @~1800 → theta_arc.show.
- Locked: `theta_deg:60`, `e_field:true`, `theta_arc.show:true`. duration 16s. Glow: `field`→`theta`.

### STATE_3 — "Each pole: force mB" (vector-grow)
- 0–500 ms: field shimmers once (cause). 800–1600 ms (≥0.5s beat): green `+mB` grows from N along B. 1900–2700 ms (≥0.5s beat): green `−mB` grows from S against B. ≥2900: "couple" emphasis.
- **Narration (45w):** "The field shimmers once, then each pole answers separately. The north pole feels a force m B along the field; the south pole feels the same size force, m B, but directed against it. Equal, opposite, on different lines — that pairing is a couple, not a cancellation."
- Cues: s3_1 @0 · s3_2 @800 · s3_3 @1900 · s3_4 @2900.
- Locked: `theta_deg:60` (unchanged from S2 — only the force pair moves), `force_vectors:{show_plus,show_minus}`. Formula `F = mB` (label only, NO live HUD). duration 21s. Glow: `forces`.

### STATE_4 ⭐ — "Zero force, still turns" (rotate-toward-alignment, PRIMARY aha)
- 0–1000 ms: both force arrows pulse (cause). 1200–1800 ms: ghost tip-to-tail sum collapses, `ΣF=0` badge stamps, centre-pin dot appears. 2200–~5200 ms (≥0.4s beat): purple `τ` appears ⊥ m–B plane, magnet swings θ≈55°→0° **single damped relaxation** (`rotation_mode:"damped_swing"` — NOT `oscillation`), centre FIXED.
- **Narration (53w):** "Add the two pole forces: plus m B and minus m B cancel exactly, so the net force is zero — a badge confirms it, and the centre stays pinned. Yet the couple still creates a torque tau, shown as the purple arrow, and the magnet swings toward the field. Zero force, non-zero torque — both true at once."
- Cues: s4_1 @0 · s4_2 @1200 (badge+pin) · s4_3 @2200 (τ, swing) · s4_4 @~4800.
- Locked: `rotation_init_theta_deg:55`, `swing_decay_s:~2.2`, `sum_force_badge:true`, `tau_vector:{show}`. Motion outruns narration (settles ~5s > narration ~4.8s) — compliant. duration 24s (holds settled θ≈0°). Glow: `forces`→`sum`→`tau`.

### STATE_5 — "τ grows, then fades" (parameter-sweep)
- 0–10000 ms repeating: θ sweeps 0→180→0 (`theta_sweep`); τ length + τ HUD track sinθ live.
- **Narration (34w):** "Watch the angle theta sweep smoothly from zero to one eighty degrees and back. The torque arrow tau grows, peaks at the middle, then shrinks again — tracing a sine curve, tau equals m B sine theta."
- Cues: s5_1 @0 · s5_2 @~2500 (θ≈90° peak).
- Locked: m=5,B=5 (only θ moves). `tau_vector:{show}`, `force_vectors:none`. duration 18s. Glow: `theta`→`tau`.

### STATE_6 — "Biggest at 90°" (pose-compare ⚠ NEW mode)
- Snap 0° (hold 1.5s, τ absent, HUD 0) → snap 90° (hold 1.5s, τ full, HUD mB) → snap 180° (hold 1.5s, τ absent). Loop. transition ~400ms.
- **Narration (43w):** "The magnet snaps to three poses. At zero degrees, aligned with the field, the torque arrow vanishes. At ninety degrees it fully extends — tau equals m B, the maximum. At one eighty it vanishes again: a cross product peaks when perpendicular, dies when parallel."
- Cues: s6_1 @0 · s6_2 @300 (0°) · s6_3 @2200 (90°) · s6_4 @4100 (180°).
- Recommended JSON:
```json
"rotation_mode": "pose_compare",
"pose_compare": { "poses": [ {"theta_deg":0,"hold_ms":1500}, {"theta_deg":90,"hold_ms":1500}, {"theta_deg":180,"hold_ms":1500} ], "transition_ms": 400, "loop": true }
```
- Locked: m=5,B=5. `tau_vector:{show}`. Formula `τ_max = mB`. duration 18s. Glow: `tau`.

### STATE_7 — "Nudge: back vs flip" (perturbation-release, declared INTERNAL contrast pair)
- 0–600 ms: camera eases back to frame U-meter (ONLY camera move in arc). 600–1400 ms: Pair A nudge to θ≈15°. 1400–~3000 ms (≥0.5s beat): springs back via `damped_swing` (small amp, fast decay), settles 0°; U marker BOTTOM. 3500–4300 ms: Pair B nudge to θ≈165° (from 180°). 4300–~8000 ms (≥0.6s beat): lingers near unstable max, then flips to 0° via `damped_pendulum` (existing mode, EXACT match); U marker TOP→bottom.
- **Narration (53w):** "Nudge the magnet slightly from zero degrees — it springs right back, and the U meter sits at the bottom, its energy minimum. Nudge it the same small amount from one eighty — the deviation grows instead, and it flips all the way to zero as the U marker falls from top to bottom. Same nudge, opposite fate."
- Cues: s7_1 @600 · s7_2 @3500 · s7_3 @~8200.
- Renderer note (LOW-MED): both sub-modes exist; NEW part is sequencing two inside one state's clock (sub-clock schedule), not new physics.
- Locked: `energy_meter` shown. duration 28s. Glow: `u`.

### STATE_8 — "Stronger field, faster swing" (oscillate/track + scripted B step-up ⚠ NEW)
- 0–6000 ms: steady oscillation about 0°, ±25°, visual period ≈3.0s (`oscillation`); T HUD reads TRUE physics value. 6000–6400 ms: B steps up 5→10 (arrows lengthen/brighten, cause, phase-continuous rebase). 6400–6800 ms (≥0.4s beat): swing quickens (visual period ≈2.12s), T HUD drops. 6800–~9500 ms: continues faster.
- **Narration (55w):** "The magnet oscillates steadily about zero degrees; the period T ticks on the readout. Now the field steps up, B doubling — the blue arrows lengthen and brighten. Watch the swing quicken at once, and T on the readout drop, exactly as T equals two pi root I over m B predicts: a stronger field means a faster swing."
- Cues: s8_1 @0 · s8_2 @6000 (B step) · s8_3 @9000.
- Renderer note (HIGHEST risk): THREE synchronized changes at one timestamp (field arrows, oscillation period, T HUD) + frame-rate independent (Rule 36) + forced single-step under SET_TIME_FREEZE. Recommended `field_step:{at_ms:6000, from_B:5, to_B:10}`.
- Locked: I fixed. duration 24s. Glow: `field`→`readout`.

### STATE_9 — "Your turn — drag" (drag-sandbox, interaction_complete, Rule 37 continuous)
- Idle gentle θ auto-sway until trusted drag seizes manual; τ arrow, force couple, U-meter, τ/U/T readout live on every drag.
- **Narration (17w):** "Your turn — drag m, B, and theta, and watch torque tau, energy U, and period T respond live."
- duration 0/open, runs continuously (Rule 37). Controls: **m, B, θ (ALL)**. Glow: none fixed.

---

## §3 — Per-state numeric-lock table (prevents the electrical_power/KVL slider-bleed scar)

`τ = m·(B×10⁻⁴)·sinθ`, `U = −m·(B×10⁻⁴)·cosθ`, `T = 2π√(I/(m·(B×10⁻⁴)))`, I=1×10⁻⁵.

| State | m | B(×10⁻⁴T) | θ | τ (N·m) | U (J) | T (s) |
|---|---|---|---|---|---|---|
| S1 | 5 | off | 90° | n/a | n/a | n/a |
| S2 | 5 | 5 | 60° | not shown | not shown | not shown |
| S3 | 5 | 5 | 60° | F=mB label | — | — |
| S4 start | 5 | 5 | 55° | 2.048×10⁻³ | −1.434×10⁻³ | — |
| S4 end | 5 | 5 | →0° | →0 | — | — |
| S5 θ=45° | 5 | 5 | 45° | 1.768×10⁻³ | — | — |
| S5 θ=90° | 5 | 5 | 90° | **2.500×10⁻³** (τ_max) | — | — |
| S6 pose 0° | 5 | 5 | 0° | **0** | — | — |
| S6 pose 90° | 5 | 5 | 90° | **2.500×10⁻³** | — | — |
| S6 pose 180° | 5 | 5 | 180° | **0** | — | — |
| S7 Pair A start | 5 | 5 | 15° | 6.470×10⁻⁴ | −2.415×10⁻³ | — |
| S7 Pair A settled | 5 | 5 | →0° | →0 | **−2.500×10⁻³ (min)** | — |
| S7 Pair B start | 5 | 5 | 165° | 6.470×10⁻⁴ | +2.415×10⁻³ | — |
| S7 Pair B peak | 5 | 5 | 180° | 0 | **+2.500×10⁻³ (max)** | — |
| S7 Pair B settled | 5 | 5 | →0° | →0 | **−2.500×10⁻³** | — |
| S8 before step | 5 | **5** | osc ±25° | varies | — | **0.3974 s** |
| S8 after step | 5 | **10** | osc ±25° | varies (τ_max→5.0×10⁻³) | — | **0.2810 s** |
| S9 (defaults) | 5 | 5 | 45° | 1.768×10⁻³ | −1.768×10⁻³ | 0.3974 s |

Verified (`node -e`): T(5,5)=0.3974, T(5,10)=0.2810, ratio=0.7071 (=1/√2, T∝1/√B exact).

**Defensive-lock instruction to json_author:** every guided state (S1–S8) must explicitly set its own `theta_deg` in `field_3d_config.states.STATE_N` (old JSON already did). Never inherit θ from previous state or a stale S9 slider. S8 additionally needs explicit `field_step:{at_ms:6000, from_B:5, to_B:10}` so the step is locked on every replay.

---

## §4 — Value-only HUD spec per state (Rule 33d)

| State | HUD | Notes |
|---|---|---|
| S1/S2 | — | no HUD |
| S3 | — | `F=mB` static LABEL not live HUD |
| S4 | `τ = 2.05×10⁻³ N·m` → decays to `τ = 0.00 N·m`; `ΣF = 0` badge | recompute every frame from live θ(t) |
| S5 | `τ = … N·m` tracking sinθ, peak `2.50×10⁻³` | continuous live |
| S6 | `τ = 0.00` (0°) → `2.50×10⁻³` (90°) → `0.00` (180°) | recompute at each pose transition |
| S7 | `U = −2.50×10⁻³ J` (0°, min) ↔ `U = +2.50×10⁻³ J` (180°, max) | **sign: U neg at 0°, ZERO at 90°, POS at 180°** = `U=−mB·cosθ` |
| S8 | `T = 0.40 s` → `T = 0.28 s` after step | HUD shows TRUE physics T |
| S9 | `τ = … N·m · U = … J · T = … s` live off sliders (defaults τ=1.77×10⁻³, U=−1.77×10⁻³, T=0.40) | MUST use same real-unit formulas as S4–S8 (see §7 fix) |

**Sign confirmation:** U(0°)=−mB<0 (min, stable), U(90°)=0 (reference), U(180°)=+mB>0 (max, unstable).

---

## §5 — Drill-down trigger phrases (5 per cluster, real student voice)

**S4 zero_force_but_torque:** "if forces cancel how does it turn" · "net force is zero so why does it move" · "doesnt zero force mean nothing happens" · "how can something rotate with no force on it" · "why does the magnet turn if the pushes cancel out"
**S4 what_is_a_couple:** "what exactly is a couple in physics" · "is a couple just two equal opposite forces" · "why do the two mB forces not cancel completely" · "difference between a couple and just balanced forces" · "why does a couple twist but not push"
**S4 uniform_vs_nonuniform_field_force:** "would a magnet slide in a field that is not uniform" · "why only uniform field gives zero net force" · "does a non uniform field pull the magnet sideways" · "why does the same magnet behave differently near a pole" · "so is there ever a real net force on a magnet in a field"
**S6 torque_cross_product_geometry:** "why is torque biggest at 90 degrees not 0" · "how is torque related to cross product geometry" · "why does sin theta control the torque size" · "isnt aligned position supposed to be the strongest" · "why does perpendicular give maximum turning effect"
**S6 torque_zero_at_alignment:** "why is torque zero when magnet is aligned with field" · "if m and B are parallel why is there no twist" · "why does 180 degrees also give zero torque" · "at 0 degrees the forces are still there so why no turning" · "why does the couple stop turning exactly at alignment"
**S6 tau_direction_right_hand_rule:** "which way does torque point using right hand rule" · "how do i find the direction of tau from m and B" · "why is torque perpendicular to both m and B" · "does the direction of tau ever flip" · "how do i curl my fingers for m cross B"
**S7 stable_vs_unstable_equilibrium:** "why is 180 degrees not stable if torque is zero there too" · "what makes one equilibrium stable and another unstable" · "why does a small nudge bring it back at 0 but not at 180" · "is zero torque enough to call something an equilibrium" · "why does the magnet flip all the way around from 180"
**S7 potential_energy_negative_sign:** "why does U have a negative sign in the formula" · "what does negative potential energy actually mean here" · "why is U lowest exactly where the magnet is stable" · "does negative U mean negative work is being done" · "why is U zero at 90 degrees and not at 0"
**S7 work_to_rotate_dipole:** "how much work does it take to flip the magnet from 0 to 180" · "why does rotating the magnet cost energy at all" · "is the work done equal to the change in U" · "where does the energy go when the magnet swings back on its own" · "why does it take more work to go from 0 to 90 than 90 to 180"

---

## §6 — Physical constraints list

```json
"constraints": [
  "B must be uniform across the magnet — a non-uniform field adds a net force (gradient term) so the magnet would also translate; this concept only covers the uniform case.",
  "The magnet is rigid — its magnetic moment m and length are fixed during rotation.",
  "τ = m × B is a vector perpendicular to BOTH m and B; its magnitude is mB·sinθ, and ΣF = 0 exactly, for every θ, in a uniform field.",
  "θ is measured from m to B; a small positive θ near 0° gives a restoring torque back toward θ = 0° (stable); a small departure from θ = 180° gives a torque that GROWS away from it (unstable).",
  "U = −m·B is defined up to an additive constant; the reference used throughout is U = 0 at θ = 90°, so U ranges from −mB (θ=0°, minimum) to +mB (θ=180°, maximum).",
  "The small-oscillation period T = 2π√(I/mB) holds for small amplitudes about the stable equilibrium θ = 0° — S8 uses a ±25° amplitude, within the small-angle regime NCERT scope assumes.",
  "B is expressed on a ×10⁻⁴ T scale for slider range; every torque/energy/period formula must multiply the raw slider value by 1e-4 before use — never compute with the raw slider integer as if it were Tesla."
]
```

---

## §7 — Renderer-capability flags (grounded in `field_3d_renderer.ts`, verified via grep/read)

Existing `rotation_mode` enum in shared `applyDipoleInFieldState`/`updateDipoleInFieldFrame` (lines ~14282–14460, ~10824–11040): `static`, `oscillation`, `theta_sweep`, `manual`, `damped_swing`, `damped_pendulum`, `slow_rotation`, `swap_loop`, `current_flow_idle`. NO `pose_compare` and NO scripted mid-state parameter-step (zero hits for `step_at_ms`/`field_step`/`B_step`).

| Item | Exists? | Risk | Recommendation |
|---|---|---|---|
| S1/S2/S3 (`static`, `p_animate_in`, `e_field_animate_in`) | YES | none | pure JSON |
| S4 damped relaxation swing 55°→0° | YES — `damped_swing` EXACT match | none | **use `damped_swing`, NOT `oscillation`** (old JSON used oscillation which loops forever, colliding with S8) |
| S5 `theta_sweep` | YES | none | pure JSON |
| S6 `pose_compare` (snap-hold-snap) | **NO — NEW** | MEDIUM | new rotation_mode branch (state machine over poses[]+hold_ms+transition_ms, looping); escalate `[owner: peter_parker:renderer_primitives]` |
| S7 Pair A (nudge→spring at 0°) | YES — `damped_swing` small amp | LOW | reuse |
| S7 Pair B (nudge→linger→flip at 180°) | YES — `damped_pendulum` EXACT match | LOW-MED | only new piece = running both modes back-to-back in one state clock (sub-clock schedule); verify replay rebases rotation_start_time at mode switch |
| S7 U-meter | YES — `energy_meter` block wired | LOW | reuse, gate per-state |
| S8 steady oscillation | YES — `oscillation` | none | pure JSON |
| S8 scripted mid-state B step-up (field visual + period + T HUD synced) | **NO — NEW, highest risk** | HIGH | new `field_step:{at_ms,from_B,to_B}` schedule; oscillation re-reads period post-step WITHOUT phase discontinuity (rebase rotation_start_time like REPLAY_ANIMATIONS); Rule 36 frame-rate indep + forced single-step under SET_TIME_FREEZE; escalate |
| Live τ/U/T HUD for guided states S4–S8 | **PARTIALLY NEW** — before this, only the S9 sandbox `bmf_readout` had a live numeric readout | MEDIUM | per-state readout element recomputing from state's own live θ(t)/m/B each frame |
| **⚠ S9 sandbox readout uses WRONG UNIT CONVENTION** — `bmf_readout` computes `tauB=0.1*mv*bv*|sinθ|`, `uB=-0.1*mv*bv*cosθ`, `periodB=10/√(mv*bv)` (relative/scaled) | Exists but INCONSISTENT with `computed_outputs` (real ×1e-4 SI + real 2π√(I/mB)) | **REQUIRED FIX** | Replace `bmf_readout` formula with the real one (`tau=m*(B*1e-4)*sinθ`, `U=-m*(B*1e-4)*cosθ`, `T=2π√(I/(m*(B*1e-4)))`, I=1e-5) so S9 is numerically continuous with S4–S8. Small (~3 lines in `refreshBmfLabels`) but IS a renderer edit → `peter_parker:renderer_primitives` FAIL-route, NOT a direct json_author edit. Flag to quality_auditor. |

Every renderer edit: `npm run check:renderer-syntax`; no backticks in emitted template; `bmProbeDispR`-style decoupling if an arrow leaves the 720px frame (note: τ arrow near-zero at θ≈0°/180° is CORRECT physics, not a clipping bug — don't defensively "fix").

---

## Self-review
- [x] Every narrated symbol (m,B,θ,τ,U,T,I,ΣF) in variables/computed_outputs.
- [x] Formulas use `radians(theta_deg)` convention for json_author's PM_interpolate expressions.
- [x] Live controls per state: S1–S8 none, S9 m/B/θ.
- [x] Per-state locked-θ documentation = de facto variable_overrides (guided states have no sliders).
- [x] No board mark scheme (conceptual-only, Rule 20).
- [x] 45 drill-down phrases (5×9), real student voice.
- [x] 7 constraints.
- [x] Numerical sanity via node -e.
- [x] Motion timeline all 9 states, no repeated archetype (S7 = declared internal contrast pair), no static state, explore-last.
- [x] Rule 32 cause→effect ≥0.4–1s gaps per state.
- [x] Word budgets: S1 27 · S2 32 · S3 45 · S4 53 · S5 34 · S6 43 · S7 53 · S8 55 · S9 17. All in range.
- [x] Bug queue consulted; FIXED rows applied; mfl slider-desync flagged for new HUDs + S9.

**Handoff:** json-author builds `src/data/concepts/bar_magnet_in_uniform_field.json` (9 states) + 8 registration sites + SQL migration from this block. Renderer touches (§7: S6 pose_compare, S8 B-step, S9 readout-formula fix) = attempt-in-JSON-then-escalate; expect ≥1 `quality_auditor → peter_parker:renderer_primitives` FAIL-route round (most likely S8 B-step + S9 readout-formula fix).
