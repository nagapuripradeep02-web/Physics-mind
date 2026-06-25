# ARCHITECT SKELETON — `gauss_law_sphere`

**Chapter:** 1 — Electric Charges and Fields (Class 12, NCERT §1.15)
**Pipeline stage:** ① architect → hand to physics_author next.
**Directives in force:** EPIC-L-first (OMIT `epic_c_branches`); conceptual-only (OMIT `mode_overrides`); Rule 16a (confront wrong beliefs inside EPIC-L); Rule 24 (silent visual); Rule 29 (emphasis = brightness).

> **Engine bug queue consultation** deferred to quality-auditor Gate 8 (no DB access from architect sandbox). Every state declares ≥3 primitives, varied `advance_mode`, a `focal_primitive_id`, labels/equations only (no on-canvas prose).

---

## 1. Atomic claim

Teaches **how to USE Gauss's law plus spherical symmetry to solve for the field E(r) of a uniformly charged spherical shell — outside it equals a point charge kq/r² at the centre, inside it is exactly zero** — and only that. Does NOT re-teach the Gauss statement Φ = q_enc/ε₀ (`gauss_law`), the open-surface flux definition Φ = E·A (`electric_flux`), or the solid-sphere / line / plane cases (deferred to future siblings).

## 2. `concept_tier`

**`complex`.** Derivation-by-symmetry with a piecewise field + regime switch at r=R, four genuine misconceptions, dedicated E-vs-r visual. **7 states** (complex range 7–9).

## 3. State count + EPIC-L arc (7 states)

| State | Purpose | teaching_method | advance_mode |
|---|---|---|---|
| **STATE_1** | Hook + question. Charged metal ball/dome. "We KNOW Φ = q/ε₀, but that's total flux, not the field at a point. How do we get E(r) inside and outside?" | narrative_socratic | wait_for_answer |
| **STATE_2** | The symmetry argument (keystone). By spherical symmetry E is radial and depends only on r — same magnitude everywhere on a concentric sphere. This is what lets E come out of the flux integral. | narrative_socratic | manual_click |
| **STATE_3** | Gaussian sphere OUTSIDE (r ≥ R). Φ = E·4πr² = q/ε₀ ⇒ **E = q/(4πε₀r²) = kq/r²**. | derivation_first_principles | auto_after_tts |
| **STATE_4** | **PRIMARY AHA** — outside = point charge. Shell's external field is identical to a point charge q at the centre. | narrative_socratic | wait_for_answer |
| **STATE_5** | Shrink Gaussian sphere INSIDE (r < R) → q_enc = 0 ⇒ Φ = 0 ⇒ **E = 0 everywhere inside**. (SUPPORTING aha) | derivation_first_principles | manual_click |
| **STATE_6** | Full E-vs-r picture (synthesis). Flat zero for r<R, jump to kq/R² at r=R, then 1/r² falloff. | compare_contrast | manual_click |
| **STATE_7** | Explore slider. Drag Gaussian-sphere radius r across R; arrows vanish inside / follow 1/r² outside; live E readout switches regime at r=R. | exploration_sliders | interaction_complete |

## 4. Within-state Socratic-reveal choreography (new-quantity states)

**STATE_2 (symmetry → E radial & E(r) only):** point P at radius r, no arrow → prediction pause "could E point sideways, or must it point radially?" → radial arrow reveals + ghost-rotation shows invariance → label `E ⟂ surface, E = constant on the sphere`.

**STATE_3 (E = kq/r² outside):** Gaussian sphere r>R drawn → prediction pause "what is Φ in terms of E and area?" → `Φ = E·4πr²` writes → `E = q/(4πε₀r²) = kq/r²` writes.

**STATE_5 (E = 0 inside):** shrink Gaussian sphere to r<R → prediction pause "how much charge does it enclose?" → `q_enc = 0`, arrows collapse to zero → `E = 0 (everywhere inside)` writes, narrated "not small — exactly zero."

STATE_4 = PRIMARY-aha overlay (not a new quantity). STATE_6 = synthesis graph. STATE_1/7 = hook/explore.

## 5. Deep-dive — DORMANT (note only)

Do not author deep-dive child sims. Most-likely future picks: STATE_2 (symmetry) + STATE_5 (E=0 inside). Flag NOT set.

## 6. Drill-down cluster_id candidates

- STATE_2: `why_field_must_be_radial`, `symmetry_lets_E_leave_the_integral`, `same_E_on_whole_gaussian_sphere`
- STATE_4: `shell_looks_like_point_from_outside`, `why_r_measured_from_centre_not_surface`, `external_field_independent_of_radius_R`
- STATE_5: `why_enclosed_charge_is_zero_inside`, `zero_field_not_just_small_field`, `inside_shell_shielding`

## 7. `entry_state_map`

```
foundational:  STATE_1 → STATE_4   # "field of a charged shell / E outside a shell"
inside_shell:  STATE_5             # "field inside a hollow charged sphere / shielding / E=0 inside"
full_profile:  STATE_6             # "E vs r graph for a shell"
exploration:   STATE_7             # student-driven slider
```

PRIMARY aha STATE_4 ∈ foundational range → coverage rule satisfied directly. Cross-slice pill at end of foundational → `inside_shell` (STATE_5). Aspect keys → `ASPECT_VOCABULARY`.

## 8. Prerequisites (advisory — Rule 23)

```
prerequisites: [gauss_law, electric_flux]
```
Both shipped gold-standard. Dependency edge: `electric_flux → gauss_law → gauss_law_sphere`.

## 9. Real-world anchor (Indian, plain English, NCERT-style)

**Primary:** In the school physics lab, the metal dome of a Van de Graaff generator holds a fixed charge spread over its surface. Stand outside it and the dome pulls or pushes a small charge exactly as if all its charge were squeezed into a single point at its centre — a clean point-charge field. But climb inside that hollow dome and the field drops to nothing: a charge placed inside feels no electric force at all. The same metal shell that acts like a point from outside is a perfect shelter on the inside.

**Secondary:** A hollow charged metal ball shields whatever sits inside it — why a car's metal body keeps you safe in a lightning strike and why sensitive instruments are wrapped in metal cans. The closed shell forces the interior field to exactly zero, while outside it behaves as if every bit of charge sat at the centre.

Both halves map one-to-one onto the PRIMARY aha (outside = point charge; inside = zero). Physics-true at all depths.

---

## 10. Definition of Done (Gate 0)

**(b) Symbol–label table:** `R` shell radius · `r` Gaussian-sphere/field-point radius · `E` field magnitude / radial arrow · `Φ` flux · `q_enc` enclosed charge · `q` total shell charge · `4πr²` Gaussian area · `k` Coulomb constant · `ε₀` permittivity · `E = q/(4πε₀r²) = kq/r²` outside result · `E = 0` inside result. (Max 3 labels per state.)

**(c) Right-hand rule:** N/A — electrostatics, no cross-product. Direction content = radial-symmetry argument in STATE_2 (E ∥ r̂), via radial arrows + ghost-rotation invariance. Zero RHR rows by design.

**(d) Motion plan (every state animates):** S1 dome shimmer + question fade · S2 radial arrow grows + ghost-rotation · S3 Gaussian sphere fades in, arrows extend, equations write sequentially · S4 external arrows cross-fade into point-charge field · S5 Gaussian sphere shrinks through R, arrows collapse to zero · S6 E-vs-r curve draws left-to-right · S7 student drags r, arrows + readout update live.

**(e) Modes:** conceptual-only — OMIT `mode_overrides`.

**(f) Assessment + coverage_map + per-state misconception_watch:** mandatory. 6-question backward-designed `assessment` (each: `distractor_misconceptions`, `teaches_state`, `parallel_form_stem` using Van de Graaff/shielding anchor); `coverage_map` (`non_assessed_states` = [STATE_1, STATE_7]); per-state `misconception_watch`. Question targets: ≥1 each on E=kq/r² (S3/4), E=0 inside (S5), r-from-centre, regime switch at r=R; ≥1 on aha state S4.

**(g) RENDERER CALL-OUT — NEW field_3d scenario required (FLAG #R1, real engine work):**
`gauss_law_sphere` CANNOT reuse the `gauss_law` scenario (that one morphs a closed surface, no E-vs-r, no concentric shell). NEW `gauss_law_sphere` field_3d scenario must provide: concentric charged shell at radius R; expandable concentric Gaussian sphere of adjustable r (inside or outside); radial E-arrows that vanish inside (r<R) and follow 1/r² outside; E-magnitude readout switching regime at r=R (0 inside, kq/r² outside); E-vs-r plot for STATE_6; STATE_7 `r` slider with stable explorer ID `gauss_sphere_explorer` (Rule 27). Engine work for **peter_parker:renderer_primitives**, routed via quality-auditor FAIL — NOT by architect. json_author registers `available_renderer_scenarios.field_3d = ["gauss_law_sphere"]` and `field_3d_config.scenario_type = "gauss_law_sphere"`. THE EYE will fail until the scenario ships.

---

## Two-pass cognitive lens

### Block 1 — Pass-1 strategic checklist

**Prerequisite cliffs:** STATE_3 opens with "Φ = q/ε₀" (gauss_law cliff) and "Φ = E·4πr²" (electric_flux cliff). Patches: STATE_3 TTS1 half-clause recall of Gauss's law; STATE_3 prediction beat surfaces flux=E·area as a question.

**JEE-backwards trace** (thin shell radius R, charge q; find E at R/2 and 2R): r<R encloses zero → S5; E(R/2)=0 → S5; outside encloses full q → S3; E(2R)=kq/4R² → S3+S4; r from centre not surface → S3/S4 labels + drill-down. All pieces delivered.

**Misconception mapping (Rule 16a):**

| Wrong belief | State (misconception_watch) | visual_counter |
|---|---|---|
| Field strongest at the centre | STATE_5 | shrinking sphere reaches centre; arrows zero throughout |
| Inside, field still points outward (weaker) | STATE_5 | arrows collapse to exactly zero crossing R; "not small — exactly zero" |
| Shell thickness spreads/changes the field | STATE_4 | external field identical to point charge; kq/r² has no thickness term |
| E keeps rising as you approach from outside | STATE_6 | curve rises 1/r² to peak kq/R² at R, then drops to zero stepping inside |

### Block 2 — Aha designation

- **PRIMARY aha:** Outside a charged shell the field is exactly that of a point charge at the centre. → **STATE_4** (∈ foundational; coverage satisfied directly).
- **SUPPORTING aha:** Inside the shell the field is exactly zero — a perfect shelter. → **STATE_5.**
- **Cohesion:** "E=0 inside" is only remarkable *because* "outside it's a full point-charge field" — the contrast is the lesson. Belongs in this JSON.

**Handoff:** ready for physics_author (Stage ②).

---

# PHYSICS BLOCK — `gauss_law_sphere`

**Pipeline stage:** physics_author (Stage 2). Hand to json_author next.
**Demo-scaling:** mirrors `gauss_law.json` (`DEMO_FLUX_PER_NC=100`, `epsilon_0` locked `8.854e-12`). Analogue here: `DEMO_E_PER_NC = 225`, chosen so surface peak reads clean `E=100` at `q=1, R=1.5`. SI formulas carried alongside for correctness; only demo-scaled value shown on-canvas.

## 1. Variables

```json
"variables": {
  "q":         { "name": "Total charge on the spherical shell", "unit": "demo nC", "min": -2, "max": 3, "default": 1, "step": 0.5 },
  "R":         { "name": "Radius of the charged shell", "unit": "demo units", "min": 1.0, "max": 2.0, "default": 1.5, "step": 0.1 },
  "r_gauss":   { "name": "Radius of the Gaussian sphere / field point (distance from centre)", "unit": "demo units", "min": 0.3, "max": 4.0, "default": 2.4, "step": 0.05 },
  "epsilon_0": { "name": "Permittivity of free space (a fixed constant of nature)", "unit": "C^2/(N*m^2)", "min": 8.854e-12, "max": 8.854e-12, "default": 8.854e-12, "step": 1 },
  "k":         { "name": "Coulomb constant, k = 1/(4*pi*epsilon_0)", "unit": "N*m^2/C^2", "min": 8.99e9, "max": 8.99e9, "default": 8.99e9, "step": 1 },
  "DEMO_E_PER_NC": { "name": "Demo field readout per nanocoulomb, at unit demo radius", "unit": "demo (N/C) per nC at r=1", "min": 225, "max": 225, "default": 225, "step": 1 }
}
```

Ranges: `q` -2..3 (copied from gauss_law, signs explorable). `R=1.5` mirrors `GAUSS_SURF_R`, sits centred in scene. `r_gauss` 0.3..4.0 spans well inside to well outside; **default 2.4 is OUTSIDE R=1.5** so STATE_3 (foundational outside read) shows first. `epsilon_0`/`k` locked. `DEMO_E_PER_NC=225`: scaling `E_demo(r) = DEMO_E_PER_NC * q / r^2`; surface peak `E_R = 225*1/1.5^2 = 100` (clean integer, 100-scale family, NOT 1e11 SI).

## 2. Computed outputs

```json
"computed_outputs": {
  "q_enc":      { "formula": "(r_gauss < R) ? 0 : q" },
  "E_real":     { "formula": "((r_gauss < R) ? 0 : q * 1e-9) / (4 * PI * epsilon_0 * r_gauss * r_gauss)" },
  "E_demo":     { "formula": "(r_gauss < R) ? 0 : (DEMO_E_PER_NC * q / (r_gauss * r_gauss))" },
  "E_R":        { "formula": "DEMO_E_PER_NC * q / (R * R)" },
  "flux_check": { "formula": "((r_gauss < R) ? 0 : q * 1e-9) / epsilon_0" }
}
```

- `q_enc(r) = (r<R) ? 0 : q` — step function.
- `E_real` — SI field, carried for validation; `0` inside, `q/(4πε₀r²)` outside.
- `E_demo` — on-canvas readout: `0` inside, `225·q/r²` outside. Defaults: E_demo(2.4)≈39.1, E_demo(3.0)=25.
- `E_R = 225·q/R²` — surface peak (=100 at defaults), top of the STATE_6 jump.
- `flux_check Φ = E·4πr² = q_enc/ε₀` — r-independent outside (verified r=1.6/2.0/3.0 → Φ=112.94 SI).

**STATE_6 E-vs-r curve (demo, q=1, R=1.5, peak 100):** flat **0** on `[0, R)`; **discontinuous jump 0→100** at r=R; then 1/r² decay: r=2.0→56.25, r=2.4→39.06, r=3.0→25, r=4.0→14.06. The jump (not a smooth rise) is the load-bearing visual.

## 3. Per-state physics overrides

| State | r_gauss | regime | q_enc | equation on canvas |
|---|---|---|---|---|
| STATE_1 | — (dome only) | hook | n/a | Φ = q/ε₀ recalled; "but E(r) = ?" |
| STATE_2 | 2.4 (outside) | symmetry setup | q | E ∥ r̂, E = const on the sphere |
| STATE_3 | 2.4 (OUTSIDE) | outside | q | Φ = E·4πr² = q/ε₀ ⇒ E = kq/r² |
| STATE_4 | 2.4 (outside) | outside (PRIMARY aha) | q | outside shell ≡ point charge kq/r² at centre |
| STATE_5 | **0.75 (INSIDE)** ← override | inside | **0** | q_enc=0 ⇒ Φ=0 ⇒ E=0 (everywhere inside) |
| STATE_6 | sweep 0→4 | both | step 0→q | E=0 (r<R); E=kq/r² (r≥R); jump at r=R |
| STATE_7 | slider [0.3,4.0] default 2.4 | both (live) | live | live E=0 inside / kq/r² outside |

**STATE_5 r_gauss:0.75 is the load-bearing defensive override** — narrative needs the inside regime (q_enc=0); global default 2.4 is outside and would show the wrong regime. STATE_3/4 restate 2.4 defensively so a slider drag can't leak an inside value into the foundational derivation.

## 4. Within-state reveal timeline (every predict→reveal beat carries pause_after_ms — Gate 15b guard)

**STATE_2 (symmetry):** s2_1 point P shown (pause 800) · s2_2 PREDICTION "sideways or radial?" (**pause 2800**) · s2_3 E_radial_arrow fade_in (900) · s2_4 symmetry_ghost_rotation play (1200) · s2_5 symmetry_constant_label slide_in (1000).

**STATE_3 (E=kq/r² outside):** s3_1 gaussian_sphere_outside fade_in (900) · s3_2 PREDICTION "Φ in terms of E and area?" (**pause 2700**) · s3_3 flux_equals_E_area_label fade_in (1000) · s3_4 E_outside_equation write_sequential (1100) · s3_5 E_kq_over_r2_label slide_in (1000).

**STATE_5 (E=0 inside):** s5_1 gaussian_sphere_inside shrink_through_R (900) · s5_2 PREDICTION "how much charge enclosed?" (**pause 2600**) · s5_3 q_enc_zero_label fade_in (1000) · s5_4 E_arrows_collapse collapse_to_zero (1100) · s5_5 E_zero_inside_label slide_in (1300).

STATE_4 = external-arrows→point-charge cross-fade (no prediction beat). STATE_6 = curve drawn left-to-right. Motion on `PM_simTimeMs` (Rule 26), never on TTS events.

## 5. Physical constraints

```json
"constraints": [
  "E is exactly zero everywhere inside the shell (r < R) - not small, not approximate; q_enc = 0 there (C1).",
  "Outside the shell (r >= R) the field is exactly that of a point charge q at the centre: E = kq/r^2 = q/(4*pi*epsilon_0*r^2) (C2).",
  "E is discontinuous at the shell surface r = R: it jumps from 0 (just inside) to the peak kq/R^2 (just outside) - a step, not a smooth rise (C3).",
  "E is strictly radial everywhere (E parallel r-hat) and has the same magnitude at every point of a concentric sphere - this is what lets E leave the flux integral (C4).",
  "The external field depends only on q and r, NOT on the shell radius R: for fixed r > R, changing R leaves E unchanged (C5).",
  "q_enc(r) is a step function: 0 for r < R, full q for r >= R; the regime switches exactly at r = R (C6).",
  "The flux Phi = E*4*pi*r^2 = q_enc/epsilon_0 is independent of r outside the shell (the 1/r^2 cancels the r^2) - verified numerically (C7)."
]
```

## 6. Drill-down trigger phrases (5 per cluster, student voice, plain English)

**STATE_2** — `why_field_must_be_radial`: "why does the field point straight out not sideways" / "why cant E be along the surface" / "how do we know E is radial" / "why is the field perpendicular to the shell" / "what makes the field point outward only". `symmetry_lets_E_leave_the_integral`: "how does E come out of the integral" / "why can we pull E outside the flux" / "why is E times area just E times 4 pi r squared" / "what does symmetry do in this derivation" / "why is flux just E into area here". `same_E_on_whole_gaussian_sphere`: "is E the same at every point on the sphere" / "why is the field constant on the gaussian surface" / "does E change around the sphere" / "why same magnitude everywhere at radius r" / "is the field equal all over the gaussian sphere".

**STATE_4** — `shell_looks_like_point_from_outside`: "why does the shell act like a point charge" / "how can a big ball behave like a point" / "why is outside field same as point charge" / "does the shell really look like a point from far" / "why kq over r squared like a single charge". `why_r_measured_from_centre_not_surface`: "is r from the centre or from the surface" / "where do i measure r from" / "why distance from centre not from the shell" / "do i start r at the surface" / "is r the distance from the middle". `external_field_independent_of_radius_R`: "does the field depend on the shell radius" / "if i make the shell bigger does E change" / "why doesnt R appear in the formula" / "does a smaller shell give a stronger outside field" / "is the outside field the same for any shell size".

**STATE_5** — `why_enclosed_charge_is_zero_inside`: "why is enclosed charge zero inside" / "where is the charge if not inside the sphere" / "why does the inside gaussian sphere enclose nothing" / "isnt there charge inside the shell" / "why q enclosed is zero in the interior". `zero_field_not_just_small_field`: "is the field really zero or just small inside" / "is it exactly zero or approximately" / "could there be a tiny field inside" / "why exactly zero and not nearly zero" / "is there really no field at all inside". `inside_shell_shielding`: "why does a metal shell shield the inside" / "why is there no field inside a hollow charged ball" / "how does a shell protect what is inside" / "why are you safe inside a charged shell" / "what is electrostatic shielding here".

## 7. Constraint callouts for json_author

- Regime switch is a hard `(r_gauss < R)` ternary — q_enc, E_demo, arrow visibility, readout colour all flip exactly at r=R. Do NOT lerp across the boundary (C3 is the lesson).
- Show `E_demo` on canvas (100-scale); keep `E_real` for validation only; never print 1e11 SI. `kq/r²` label is symbolic.
- `E_R=100` is the graph peak anchor at defaults; recompute as `225·q/R²` if q/R vary.
- STATE_7 explorer: stable ID `gauss_sphere_explorer` (Rule 27), single slider `r_gauss`∈[0.3,4.0] step 0.05 default 2.4 — only interactive state.
- q may be negative: arrows point inward, E_demo readout negative outside (gauss_law red/inward convention); inside stays exactly 0 regardless of sign.
- `epsilon_0`/`k` locked — render `k` symbolically, never raw 8.99e9.

**Handoff:** ready for json_author (Stage 3). FLAG #R1 — the `gauss_law_sphere` field_3d scenario is NEW engine work (peter_parker:renderer_primitives), routed via quality-auditor FAIL; THE EYE fails until it ships.
