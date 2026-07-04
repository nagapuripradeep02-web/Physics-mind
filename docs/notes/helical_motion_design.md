# Design doc — `helical_motion_charge_in_uniform_B` (Ch.4 §4.3.1)

> Overnight build 2026-07-04. Source of truth for json-author → renderer executor → quality-auditor.
> Produced by architect + physics-author (Alex pipeline). Clone target: `radius_in_uniform_field` scenario + bounded-helix extension.
> **Shared-tree note:** a concurrent session authored Ch.6 in this tree. Use a collision-free namespace (`hx_` or `hmf_` — grep-verify free; `hel_`/`helix` are the SOLENOID coil, 39 hits). Surgical Edit-only on shared files.

## Atomic claim
A charge entering a uniform B at angle θ traces a **HELIX**: the across-field part **v⊥ = v·sinθ** circles (r = m·v⊥/qB), the along-field part **v∥ = v·cosθ** sails straight through (B does no work on it, v∥×B = 0), giving **pitch p = v∥·T** per turn. Does NOT re-derive r=mv/qB, T=2πm/qB, or |F|=qvB sinθ (all CITED from shipped siblings `circular_motion_charge_in_uniform_B`, `cyclotron_period_independent_of_speed`, `magnetic_force_moving_charge`). No velocity-selector / cyclotron-device / toroid content.

## Prerequisites (advisory, Rule 23)
`circular_motion_charge_in_uniform_B` (r=mv/qB → here uses v⊥) · `cyclotron_period_independent_of_speed` (T=2πm/qB → sets pitch, θ-independent) · `magnetic_force_perpendicular_no_work` (|v| const, v∥ untouched) · `magnetic_force_direction_right_hand_rule` (cited, not re-taught) · `magnetic_field_concept_B`.

## Indian anchor (physics-true, plain English)
**SST-1 tokamak, Institute for Plasma Research, Gandhinagar** — to hold fusion plasma off the walls, charged particles are trapped so they **spiral along** the field lines (circle across B while streaming along it = a helix). Secondary: cosmic-ray protons entering Earth's field at an angle spiral down field lines toward the poles (auroras hug the poles) — studied at **GRAPES-3, Ooty**.

---

## Variables (final — physics-author)
Sliders surfaced: **theta, v, B**. `m` and `q_mag` LOCKED at 1.0 (owned by siblings), present for R_visual scaling, NEVER a slider (never in any `visible_controls`; `variable_overrides` pins them to 1.0 every state).

```json
"variables": {
  "theta":  { "name": "Entry angle between v and B (the ONLY knob that changes helix SHAPE; 90deg=flat circle, small angle=stretched spring; on canvas only the theta arc+symbol, never a derived degree readout).", "unit": "deg", "min": 10, "max": 90, "default": 45, "step": 5 },
  "v":      { "name": "Speed (sets overall helix SIZE via v_perp & v_par, NOT shape; number never shown on canvas).", "unit": "m/s", "min": 0.5, "max": 2.5, "default": 1.0, "step": 0.1 },
  "B":      { "name": "Field strength (denominator of both r and T, scales whole helix, leaves p/r unchanged — a SIZE knob; number never shown).", "unit": "T", "min": 0.5, "max": 2.5, "default": 1.0, "step": 0.1 },
  "m":      { "name": "Mass — LOCKED 1.0 (owned by siblings); present for R_visual scaling; never a slider.", "unit": "kg", "min": 0.5, "max": 2.5, "default": 1.0, "step": 0.1 },
  "q_mag":  { "name": "Charge magnitude — LOCKED 1.0 (owned by siblings); present for R_visual scaling; never a slider.", "unit": "C", "min": 0.5, "max": 2.5, "default": 1.0, "step": 0.1 }
}
```
Range rationale: θ min 10° = physics floor for a legible coil (r∝sinθ); θ max 90° = exact flat-circle limit (v∥→0, pitch→0); θ default 45° = balanced helix (v⊥=v∥, p/r=2π); step 5° hits 45/90 exactly.

**On-canvas readout discipline (RELATIVE-only, mirrors sibling):** every state `hide_period_readout:true` + `hide_magnitude_readout:true`. Pitch & radius = relative bars only (never metres). θ = arc+symbol on canvas; degree value only on the slider input. F = direction-only fixed glyph (Rule 29), never grows with magnitude.

## Formulas (all verified dimensionally + numerically; PM_interpolate syntax, angles wrapped in radians())
```
v_perp   = v * sin(radians(theta))
v_par    = v * cos(radians(theta))
r        = m * v * sin(radians(theta)) / (q_mag * B)          # cited r=mv/qB with v->v_perp
T        = 2 * PI * m / (q_mag * B)                            # cited; theta-INDEPENDENT (omega_c=qB/m; v_perp cancels)
p        = v * cos(radians(theta)) * (2 * PI * m / (q_mag * B))# = v_par * T
p_over_r = 2 * PI / tan(radians(theta))                        # = 2*pi*cot(theta) — SHAPE INVARIANT (m,q,v,B cancel)
```
**Central insight:** p/r = 2π·cotθ ⇒ shape depends on θ ALONE; v,B only scale the whole coil. → S6 frames θ as shape knob, v/B as size knobs; a clean EYE check (p/r moves only when θ moves).

Limits (v=B=m=q=1): θ=10°→ r0.174 p6.19 p/r35.6 (stretched); θ=45°→ r0.707 p4.44 p/r2π (balanced); θ=90°→ r1.0 p0 p/r0 (**flat circle**). θ→0°→ r→0 straight line. Speed invariant v⊥²+v∥²=v² ∀θ. ✓

---

## 6 states — EPIC-L distinct-motion arc (Rule 31; ≤3 sentences/state ~20s; no two motions alike; no static state)

| STATE | teaches | DISTINCT motion | live control | show_sliders | visible_controls | advance_mode | aha |
|---|---|---|---|---|---|---|---|
| S1 | tilted entry → a helix (not flat loop) | enter θ≈45°; trail coils forward into a 3D helix scrolling ∥ B; a faint "expected flat circle" GHOST is lifted off as the coil advances (Rule-16a contrast) | none | false | `[]` | auto_after_tts | — |
| S2 | v = v∥ + v⊥ | single amber v arrow SPLITS into v∥ (grey, ∥B) + v⊥ (orange, ⊥B); θ arc draws between v and B | none | false | `[]` | manual_click | — |
| S3 | v⊥ = v·sinθ makes the circle | fade v∥→0; helix COLLAPSES to a flat circle ⊥ B; relative radius bar reveals | none | false | `[]` | manual_click | — |
| S4 | v∥ = v·cosθ untouched by B | fade v⊥→0; circle shrinks to a point DRIFTING straight ∥ B at constant speed (equal-spaced dots) | none | false | `[]` | manual_click | SUPPORTING |
| S5 | pitch p = v∥·T | both restored; helix marches forward; a PITCH BRACKET animates in spanning one turn's advance (relative); θ knob stretches/flattens live | **θ** | true | `["theta"]` | manual_click | PRIMARY |
| S6 | θ,v,B set the shape (explore) | teacher morphs: θ→90° flat circle (pitch→0), θ→0° straight line (radius→0); v,B resize WITHOUT changing shape; live pitch+radius bars | **θ,v,B** | true | `["theta","v","B"]` | interaction_complete | — |

3 distinct advance_modes (Gate 15 ✓). **Shared-slider position:** θ first appears S5, persists to S6 in the SAME row/position; in S6 v,B rows appear BELOW θ. Build the panel ONCE (clone sibling `rad_*_row` → `hx_theta_row`/`hx_v_row`/`hx_B_row`); show/hide via `applyVisibleControls`; never rebuild per state. m,q_mag never get a row.

## Within-state motion/reveal timeline (t in ms from stateStart; each branch a pure fn of the state clock, Rule 26; reveals bound to naming sentence, t-windows = EYE fallback)
- **S1:** 0–2000 enter θ45 v tilted, trail curving · ~2500 faint flat-circle GHOST drawn ⊥B (`ghost_flat_circle_at_ms`) · 4000–8000 trail does NOT close on ghost — coils forward into 3D helix, ghost stays behind. Labels: setup@0 · "doesn't close flat — coils forward"@~4000 · "a helix — what sets its shape?"@~7000.
- **S2:** 0–2000 helix scrolling · 2000–4000 v arrow SPLITS: v∥ grey ∥B + v⊥ orange ⊥B grow; θ arc draws (`v_decompose`) · 4000–6500 tip labels "v cosθ"(v∥) "v sinθ"(v⊥), arc θ.
- **S3:** 0–1500 both shown · 1500 v∥ fade begins (`isolate_perp` fade_start 1500 dur 1500) · 1500–3000 helix COLLAPSES onto ⊥B plane → flat circle · 3000 radius line + relative radius bar reveal · 3500 label `r = m·v·sinθ/(qB)`.
- **S4:** 0–1500 both · 1500 v⊥ fade begins (`isolate_par` fade_start 1500 dur 1500) · 1500–3000 circle shrinks to point DRIFTING straight ∥B const speed · 3000–5000 label "B does no work on v∥ · v∥×B=0 — sails straight", equal-spaced drift dots.
- **S5:** 0–1500 both, marching · 1500–3500 one turn highlighted, PITCH BRACKET animates in (`show_pitch_bracket`, `pitch_bracket_at_ms 1500`) · 3500 label `p = v∥·T` (cite T=2πm/qB); pitch bar shown vs radius bar · 3500→open θ slider live: θ↑ flatten+pitch→0, θ↓ stretch+pitch↑; idle θ-sweep demo until teacher grabs.
- **S6:** 0→open teacher morphs θ (shape) + v,B (size); pitch bar + radius bar update every edit; p/r=2π·cotθ responds to θ ONLY.

## misconception_watch (Rule 16a — confront inside EPIC-L via straightforward contrast beat, NO predict-pause)
| state | belief | visual_counter | one_line_fix |
|---|---|---|---|
| S1 | "at an angle field does nothing / still a flat loop" | trail lifts OFF the flat-circle ghost, coils forward | "A tilted entry gives a HELIX, not a flat loop — B still acts on v⊥." |
| S2 | "velocity can't be split" | one v arrow resolves into v∥+v⊥, v⊥²+v∥²=v² | "Any v splits into along-B (v cosθ) + across-B (v sinθ)." |
| S3 | "radius uses the full speed v" | fading v∥ → circle radius uses v⊥ only | "Only v⊥=v sinθ circles: r = m·v sinθ/(qB), not the full v." |
| S4 | "the field bends v∥ too" | fading v⊥ → straight const-speed drift along B | "v∥×B=0 — B does no work on v∥; it sails straight." |
| S5 | "pitch & radius are the same / respond to B alike" | raising B shrinks BOTH but p/r shape stays fixed; θ moves p/r | "Pitch & radius both scale with 1/B; only θ changes their ratio (p/r=2π cotθ)." |
| S6 | "changing the angle just rotates the same shape" | θ→90° flat circle, θ→0° straight line | "θ sets the SHAPE (p/r=2π cotθ); v and B only resize it." |

## aha_moment (json-author owns block; pre-verified ≤15 words)
- **PRIMARY (S5):** "Each turn climbs one pitch along B: pitch equals v-parallel times T." (12 words)
- **SUPPORTING (S4):** "Along B the charge sails free — B never touches v-parallel."

## entry_state_map (ARRAY shape)
```
foundational:       [STATE_1, STATE_2, STATE_3, STATE_4, STATE_5]
why_helix:          [STATE_1]
decompose_velocity: [STATE_2, STATE_3, STATE_4]
pitch:              [STATE_5]
explore:            [STATE_6]
```

## constraints (invariants — do not violate)
1. |v| constant (magnetic force does no work); v⊥²+v∥²=v² ∀θ. 2. v∥ exactly conserved (v∥×B=0, force-free straight drift const speed — the S4 aha). 3. v⊥ magnitude const → perfect circle r=m·v⊥/(qB) in plane ⊥B. 4. circle ⊥B, helix axis ∥B. 5. pitch measured ALONG B = advance per revolution = v∥·T. 6. T=2πm/(qB) independent of θ and v (ω_c=qB/m). 7. p/r=2π·cotθ depends on θ ALONE (m,q,v,B cancel). 8. θ→90°: v∥→0, pitch→0, flat circle (r max); θ→0°: v⊥→0, r→0, straight line. 9. Teaches ONLY helix decomposition + pitch; cites r/T/|F|, no re-derivation; no velocity-selector/cyclotron-device/toroid/Ampere/loop/dipole. 10. No seconds/Newton/Tesla/metre number on canvas; pitch/radius relative bars, θ arc+symbol.

---

## field_3d_config contract (advising the renderer clone)
**Renderer ALREADY ships the core:** `trajectory_mode: 'static'|'circle'|'helix'|'straight'` (:629), per-state `theta_deg` (:631), v∥/v⊥ decomposition arrows + "v cosθ"/"v sinθ" labels (:8963–8999), 600-pt helix trail sized for θ=10° full loop (:9002). Extension = wire these into a `radius_in_uniform_field`-style per-state config + add ghost/collapse/pitch flags + swap 4-knob panel for θ/v/B panel.

Config fields the renderer consumes:
- `scenario_type`: NEW `"helix_in_uniform_field"` (grep-verify free) — clone the radius scenario's slider/R_visual/ghost/`*Interacted` trusted-grab machinery; swap panel for θ/v/B.
- per-state `trajectory_mode`: "helix" (S1,S2,S5,S6); resolves to "circle" (S3) and "straight" (S4) as the fade completes.
- per-state `theta_deg` (seed 45; S5/S6 driven live by θ slider).
- NEW per-state fade flags (the helix extension): `isolate_perp: {fade_start_ms, fade_duration_ms}` (S3 — fades v∥'s MOTION contribution to 0, collapsing helix→flat circle, not just shrinking the arrow); `isolate_par: {...}` (S4 — fades v⊥'s motion → straight drift).
- `helix` block (parallel to sibling's `radius` block): `show_radius_line`, `show_radius_readout`(relative), `show_pitch_bracket`, `show_pitch_readout`(relative), `v_decompose` (S2 arrows+θ arc), `ghost_flat_circle_at_ms` (S1), `pitch_bracket_at_ms`, `hide_period_readout:true`+`hide_magnitude_readout:true` every state.
- `slider_controls`: theta (drives theta_deg; label "θ (angle)", min10 max90 step5 def45), v, B. m,q_mag NOT sliders.
- per-state `variable_overrides`: every state pins `m:1,q_mag:1,v:1,B:1,theta:45` (defensive vs default-var leak; θ then driven live in S5/S6).
- **Spiral guard (CRITICAL scar `field3d_orbit_spiral_on_radius_ramp`):** when θ/v/B change live (S5/S6), redraw a COMPLETE helix each frame about a FIXED axis ∥B, wipe trail buffer on the edit (clone `radNeedsTrailWipe`→`hxNeedsTrailWipe`); never accumulate a drifting spiral.
- **Framing:** at θ=10°, p/r=35.6 (one turn advances 35× r) — camera/scale must fit the stretched helix along B without shooting off-canvas (fit-to-N-turns).
- **Cue binding:** bind one-shots (S1 ghost+coil, S2 split, S3 collapse, S4 drift, S5 pitch-bracket) to `scenario_cue` on the naming sentence (SET_CUE_TIME); keep t-windows as EYE fallback.
- **Narration source of truth:** omit `field_3d_config.states[*].teacher_script` OR keep byte-identical to `epic_l_path` (stale-mirror scar).

## Engine-bug-queue prevention (physics-author consulted; satisfied)
- `field3d_orbit_spiral_on_radius_ramp` (CRITICAL) → spiral guard above.
- `aha_statement_exceeds_15_words` (MODERATE) → aha 12 words.
- **`classifier_capital_B_suffix_truncation` (MAJOR) → FLAG: this id ends in `_B` (like the sibling). json-author MUST verify the classifier regex round-trips the `_B` id (fix shipped; test it).**
- `field3d_teacher_script_mirror_stale_deadcode` → one narration source of truth.
- `teach_read_dense_ramp_frames_not_just_frozen` → dense sampling across S3/S4/S5/S6 transition windows (the payoff is mid-transition, not frozen).
- colour each element by identity: v amber `#FFAB40`, v∥ grey `#9CA3AF`, v⊥ orange `#FFCC9F`, B grid blue `#42A5F5`.

## Carve-outs / modes
Conceptual-only (Rule 20): NO `mode_overrides`, NO board mark scheme, NO competitive. Light-atom (mirror siblings): NO `assessment`, NO `coverage_map`, NO `epic_c_branches`. Deep-dive/drill-down DEFERRED (no clusters/phrases). Per-state `misconception_watch` MANDATORY (delivered).

## Registration sites (json-author — mirror how `circular_motion_charge_in_uniform_B` is registered)
Concept-level: `src/data/concepts/helical_motion_charge_in_uniform_B.json` · `CONCEPT_PANEL_MAP` (panelConfig.ts) · `CONCEPT_RENDERER_MAP` (aiSimulationGenerator.ts) · `VALID_CONCEPT_IDS` + `CLASSIFIER_PROMPT` (intentClassifier.ts). Scenario-level (executor): new `helix_in_uniform_field` in field_3d_renderer.ts scenario dispatch/`scenario_map` + `deriveStateMeta.ts` (F3D_REVEAL_KEYS + motion + frozen-pin + hold). Plus `src/scripts/_seed_helical_motion_charge_in_uniform_B_cache.ts` + `supabase_2026-07-04_seed_helical_motion_charge_in_uniform_B_clusters_migration.sql` (authored, NOT applied) + add id to FIELD3D constant in query_engine_bug_queue.ts.
