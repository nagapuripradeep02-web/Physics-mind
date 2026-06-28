# PHYSICS BLOCK — `magnetic_field_circular_loop`

> Stage 2 (physics_author), appended to `magnetic_field_circular_loop-architect.md`. Conceptual-only (Rule 20 → Section 4 board mark scheme SKIPPED). All numerics hand-verified. Hand off to json_author.

## Section 1 — `physics_engine_config`

```json
"physics_engine_config": {
  "variables": {
    "I":   { "name": "Current in the loop", "unit": "A", "min": 0.1, "max": 10, "default": 2, "step": 0.1 },
    "R":   { "name": "Loop radius", "unit": "m", "min": 0.02, "max": 0.15, "default": 0.05, "step": 0.005 },
    "N":   { "name": "Number of turns in the loop", "unit": "", "min": 1, "max": 50, "default": 1, "step": 1 },
    "z":   { "name": "Axial distance from the loop center", "unit": "m", "min": 0, "max": 0.20, "default": 0, "step": 0.005 },
    "dl":  { "name": "Length of one representative current element (illustrative, STATE_2)", "unit": "m", "constant": 0.01 },
    "mu_0":{ "name": "Magnetic permeability of free space", "unit": "T·m/A", "constant": 1.2566370614e-6 }
  },
  "computed_outputs": {
    "B_center":      { "formula": "mu_0 * N * I / (2 * R)" },
    "B_center_uT":   { "formula": "(mu_0 * N * I / (2 * R)) * 1e6" },
    "B_axis":        { "formula": "mu_0 * N * I * R * R / (2 * (R*R + z*z) * sqrt(R*R + z*z))" },
    "B_axis_uT":     { "formula": "(mu_0 * N * I * R * R / (2 * (R*R + z*z) * sqrt(R*R + z*z))) * 1e6" },
    "dB_element":    { "formula": "(mu_0 * I * dl) / (4 * PI * R * R)" },
    "dB_element_uT": { "formula": "((mu_0 * I * dl) / (4 * PI * R * R)) * 1e6" }
  },
  "formulas": {
    "B_center":   "B = μ₀NI / 2R",
    "B_axis":     "B(z) = μ₀NIR² / 2(R²+z²)^{3/2}",
    "dB_element": "dB = (μ₀/4π)·I dl / R²",
    "dB_direction": "dB ∥ dl × r̂ — ⊥ to the loop plane (axial), since dl and r̂ both lie in the plane",
    "grip_rule":  "Curl the right hand with the current I; the thumb gives the field B along the axis",
    "reduces_to_center": "B(z=0) = μ₀NI/2R"
  },
  "constraints": [
    "At the loop center every element's dB is purely axial: dl and r̂ both lie in the loop plane, so dl × r̂ is ⊥ the plane.",
    "dB from opposite elements ADD at the center (both point the same axial way) — they never cancel.",
    "On the axis with z ≠ 0 each dB has a transverse part, but those cancel by ring symmetry; only the axial component survives.",
    "B_center ∝ N, ∝ I, ∝ 1/R — a bigger loop gives a WEAKER center field.",
    "B(z) is maximal at z = 0 and falls monotonically with |z|; exactly B(z=0) = μ₀NI/2R.",
    "Reversing the current reverses both dB and B (dl flips → dl × r̂ flips)."
  ]
}
```

**Encoding notes:** No `radians()` anywhere (only physical angle is fixed at 90°, sinθ=1 baked in). `(R²+z²)^{3/2}` → `(R*R + z*z) * sqrt(R*R + z*z)` (whitelist-safe; no `pow`/`**`). `dl` is a `constant` (no slider). µT display = SI × 1e6.

### Verified numerics (json_author sanity-check the live readout)
μ₀ = 1.2566370614e-6 T·m/A; μ₀/4π = 1e-7 exactly.

| Case | Inputs | Result |
|---|---|---|
| Single turn | N=1, I=1, R=0.05 | B_center = **12.566 µT** |
| JEE trace center | N=50, I=0.5, R=0.04 | **392.70 µT** |
| JEE trace on-axis | N=50, I=0.5, R=0.04, z=0.03 | **201.06 µT** (0.512× center) |
| z=0 reduces to center | — | B_axis(0) = 392.70 µT = B_center ✓ |
| **Sim default** | N=1, I=2, R=0.05, z=0 | **25.13 µT** ← verify this on screen |
| Q6 double-R | R=0.05 → 25.13; R=0.10 → 12.57 | ratio **0.500** ✓ halves |
| One element | I=2, R=0.05, dl=0.01 | dB = **0.80 µT** |

**STATE_6 axial falloff** (N=1, I=2, R=0.05; center 25.13 µT) — drives `cl_bz_graph`/`cl_b_bar`:
z=0→25.13 · 0.025→17.98 · 0.05→8.89 · 0.10→2.25 · 0.15→0.79 · 0.20→0.36 µT (ratios 1.000/0.716/0.354/0.0894/0.0316/0.0143).

---

## Section 2 — Per-state `variable_overrides` (complete maps; defensive against partial-merge scar)

| State | `variable_overrides` | Justification |
|---|---|---|
| STATE_1 | `{ "N":1, "I":2, "R":0.05, "z":0 }` | canonical single turn at center; deterministic ring + dots |
| STATE_2 | `{ "N":1, "I":2, "R":0.05, "z":0 }` | one element's dB at the center; dB = 0.80 µT |
| STATE_3 | `{ "N":1, "I":2, "R":0.05, "z":0 }` | superposition at center (z=0 essential — only there is every dB purely axial) |
| STATE_4 | `{ "N":1, "I":2, "R":0.05, "z":0 }` | clean B_center = 25.13 µT; N/R beats narrated not slid |
| STATE_5 | `{ "N":1, "I":2, "R":0.05, "z":0 }` | direction + flip; reversal is a **direction flag**, not negative I |
| STATE_6 | `{ "N":1, "I":2, "R":0.05 }` — **z swept** (animates 0→0.20) | on-axis falloff; only z moves; R drawn as a distinct in-plane line |
| STATE_7 | none — sliders live (I,R,N,z) | sandbox; defaults I=2,R=0.05,N=1,z=0; idle auto-sweep z; render full immediately |

---

## Section 3 — Within-state reveal timeline (json_author MUST carry every `pause_after_ms`)

TTS v3-compliant (standalone symbols as `<name> <symbol>`), text_en only. `reveal_primitive_id` = the `cl_*` ids.

### STATE_1 — Hook + setup (`auto_after_tts`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s1_1 | "Here is a circular coil. It carries current I, has radius R, and N turns." | cl_current_arrow, cl_radius_line, cl_turns_caption | show | 1200 |
| s1_2 | "Watch the current I march around the ring." | cl_current_dot | flow | 1000 |
| s1_3 | "How strong is the magnetic field B right at the center O?" | cl_center | focal_highlight | 1500 |

### STATE_2 — One element's dB (`manual_click`) — `formula_overlay`: `dB = (μ₀/4π)·I dl / R²`
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s2_1 | "Zoom in on one tiny current element dl on the ring." | cl_dl_marker | fade_in + focal_highlight | 1200 |
| s2_2 | "Draw the unit vector r-hat from this element straight to the center O." | cl_rhat_arrow | draw_in | 1200 |
| s2_3 | "This element makes a field dB at the center — which way does it point?" | — (prediction) | — | **3000** |
| s2_4 | "The field dB is dl crossed with r-hat — and it points straight out along the axis." | cl_db_arrow (+ cl_cross_hand) | grow_axial + hand curl | 1500 |
| s2_5 | "Its size: the field dB equals mu-naught over four pi, times I d-l over R squared." | formula_overlay | slide_in | 1500 |

### STATE_3 — Σ dB, PRIMARY AHA (`wait_for_answer`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s3_1 | "Keep that one field dB. Now go all the way round the ring." | cl_db_arrow | focal_highlight (held) | 1200 |
| s3_2 | "Element by element — do the dB's cancel, or do they add?" | — (prediction) | — | **3500** |
| s3_3 | "Look at the opposite element first — its field dB also points the same way, straight up the axis." | cl_db_arrow (opposite) | fade_in (opposite FIRST) | 1500 |
| s3_4 | "Every element's field dB points the same axial way — so they all add." | cl_db_arrow (full set → bundle) | stagger_stack | 1800 |

### STATE_4 — B_center magnitude (`manual_click`) — `formula_overlay`: `B = μ₀NI / 2R`
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s4_1 | "Add every element's field dB and the bundle collapses to one bold arrow — the center field B." | cl_B_center | merge_grow | 1500 |
| s4_2 | "The field B equals mu-naught N I over 2R. Clean, axial, largest right here at the center." | formula_overlay | slide_in | 1800 |
| s4_3 | "Compare the straight wire: its field is mu-naught I over 2-pi-R." | cl_wire_compare | fade_in | 1500 |
| s4_4 | "So the loop gives 2R, not 2-pi-R — and the field B threads through the loop." | cl_wire_compare, cl_B_center | focal_highlight | 1500 |
| s4_5 | "More turns N raise the field B in step; a bigger radius R makes it weaker." | cl_turns_caption | pulse | 1500 |

### STATE_5 — Direction + current flip (`wait_for_answer`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s5_1 | "Which way does the center field B point? Use the right-hand grip rule." | cl_grip_hand | fade_in | 1500 |
| s5_2 | "Curl your fingers with the current I; your thumb points along the field B, up the axis." | cl_grip_hand, cl_B_center | curl + focal_highlight | 1800 |
| s5_3 | "Now reverse the current I — which way does the field B point?" | — (prediction) | — | **3000** |
| s5_4 | "The current I flips, the hand re-curls, and the field B flips to point the other way." | cl_current_dot, cl_grip_hand, cl_B_center | reverse_flow + re-curl + flip | 1800 |

### STATE_6 — On-axis falloff B(z) (`wait_for_answer`) — `formula_overlay` (gated HERE): `B(z) = μ₀NIR² / 2(R²+z²)^{3/2}`
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s6_1 | "Step off the center along the axis by a distance z." | cl_axis_line, cl_axis_point | draw_in | 1300 |
| s6_2 | "As you slide out along the axis, where is the field B strongest?" | — (prediction) | — | **3000** |
| s6_3 | "Slide out and the axial field B of z shrinks — tallest at the center, weaker as z grows." | cl_axis_point, cl_B_axis, cl_b_bar, cl_bz_graph | slide_track + shrink + graph dot | 1800 |
| s6_4 | "The axial field B of z equals mu-naught N I R squared, over 2 times R squared plus z squared, to the three-halves." | formula_overlay | slide_in | 1800 |

### STATE_7 — Explore (`interaction_complete`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s7_1 | "Your turn. Drag current I, radius R, turns N, and axial distance z." | cl_sliders | show | 1200 |
| s7_2 | "Watch the center field B and the axial field B of z update live in the readout." | cl_readout | pulse | 1200 |
| s7_3 | "Bigger current I or more turns N strengthen the field; a bigger radius R weakens it." | cl_readout | focal_highlight | 1500 |

**deriveStateMeta classification (FLAG → renderer-primitives):** S1 motion(dots); S2 reveal_hold; S3 reveal_hold(stack); S4 reveal_hold; S5 reveal_hold(flip end pose); S6 motion(z-sweep ≥0.1%/frame)→settle; S7 interactive + idle z-sweep.

---

## Section 5 — Drill-down trigger phrases (→ confusion_cluster_registry seed)

**why_dbs_dont_cancel:** "why opposite sides dont cancel" · "shouldnt the two sides cancel out" · "left and right element field should subtract na" · "why does it add and not cancel" · "opposite current so why is field not zero"
**only_axial_survives:** "why only the axial part stays" · "where did the sideways field go" · "why no field in the plane of the loop" · "how do the in plane parts cancel" · "why is center field only up not sideways"
**sum_to_clean_number:** "how does the messy sum become mu0 N I by 2R" · "where does the 2R come from" · "how does adding tiny dB give a clean formula" · "why is there no pi in the loop center formula" · "how do all the dB add to one number"
**R_versus_z_in_formula:** "what is R and what is z in the formula" · "is R the same as z" · "which one is radius which is distance" · "why are there two distances in B z" · "confused between R and z in the axis formula"
**why_max_at_center:** "why is the field strongest at the center" · "why is B maximum at z equals zero" · "shouldnt it be max somewhere off the center" · "why does B drop as i move along the axis" · "is the axial field the same everywhere"
**far_field_axial_limit:** "what happens to B far along the axis" · "why does the field fall as 1 over z cube far away" · "does a loop look like a dipole far away" · "field very far from the loop formula" · "why z cubed not z squared far on the axis"

---

## Section 6 — Constraint callouts (json_author MUST encode)
1. No `radians()` — sinθ=1 baked in; no theta slider.
2. `(R²+z²)^{3/2}` → `(R*R + z*z) * sqrt(R*R + z*z)`. No `Math.pow`/`**`.
3. **R and z in METRES inside formulas; sliders DISPLAY cm** (R 2–15 cm / z 0–20 cm; renderer ÷100 → m before PM_interpolate). Verify default reads **25.13 µT**, not 2513 µT.
4. µT display = SI × 1e6 (use `*_uT` outputs).
5. **STATE_5 current reversal = direction flag** (`reverse_current`/`current_direction:-1`), NOT negative I; magnitude stays 2.
6. Far-field z≫R: B(z) → μ₀NIR²/2z³ ∝ 1/z³ (documentation only; full formula already produces it).
7. Steps: I 0.1 A, R 0.005 m, N 1 (integer), z 0.005 m.

---

## DoD-alignment

### Symbol-label table (label / host id / unit / length-or-readout expr)
| Quantity | Label | Host id | Unit | Expression |
|---|---|---|---|---|
| Current | I | cl_current_arrow (+cl_current_dot) | A | dot speed ∝ I; `"I = {I.toFixed(1)} A"` |
| Loop radius | R | cl_radius_line | m(cm) | line len = R(m); `"R = {(R*100).toFixed(1)} cm"` |
| Turns | N | cl_turns_caption | — | `"N = {N} turns"` |
| One element | dl | cl_dl_marker | m | fixed; dl=0.01 m |
| Unit vec el→O | r̂ | cl_rhat_arrow | — | unit; element→O |
| Element field | dB | cl_db_arrow | T(µT) | len ∝ dB_element; `"dB = {((mu_0*I*dl/(4*PI*R*R))*1e6).toFixed(2)} µT"` |
| Center field | B | cl_B_center | T(µT) | len ∝ B_center; `"B = {((mu_0*N*I/(2*R))*1e6).toFixed(1)} µT"` |
| Center point | O | cl_center | — | static |
| Axial distance | z | cl_axis_line/cl_axis_point | m(cm) | len = z; `"z = {(z*100).toFixed(1)} cm"` |
| Axial field | B(z) | cl_B_axis | T(µT) | len ∝ B_axis; `"B(z) = {((mu_0*N*I*R*R/(2*(R*R+z*z)*sqrt(R*R+z*z)))*1e6).toFixed(1)} µT"` |
| B bar | (num) | cl_b_bar | T(µT) | height ∝ B (S4) or B_axis (S6) |
| Field lines | — | cl_field_line | — | axial threading only, S4/5, sparing |

On-canvas equations gated: S2 `dB=(μ₀/4π)·I dl/R²`; S4 `B=μ₀NI/2R`; S6 `B(z)=μ₀NIR²/2(R²+z²)^{3/2}` (keep B(z) off-canvas before S6).

### RHR math (det=+1 verified)
Convention (single source): current **counterclockwise viewed from +z**.
- **STATE_2 cross-product:** element at (R,0,0): `dl=+ŷ`, `r̂=−x̂`, `dB=dl×r̂=(0,1,0)×(−1,0,0)=+ẑ` (axial). Basis `[ŷ,−x̂,ẑ]` det=+1 (proper, not mirrored). Opposite element (−R,0,0): `dl=−ŷ`,`r̂=+x̂`,`dB=+ẑ` → adds. Reuse `createLorentzHand` relabelled dl/r̂/dB; anchor from camera basis.
- **STATE_5 grip:** `thumb_direction:[0,0,1]`, thumb=B=+ẑ; reverse → clockwise → thumb=−ẑ, cl_B_center flips; still det=+1.

### Motion → E11: N/A (field-derivation diamond; no kinematic motion). STATE_6 z is a parametric visualization sweep, not a trajectory.

### aha (STATE_3): "Every element's dB points the same axial way — so they all add." Physically TRUE (verified opposite element also +ẑ). SUPPORTING (STATE_4): sum collapses to B=μ₀NI/2R.

### misconception_watch M1–M6 one_line_fix all physics-checked correct (M1 dB⊥plane; M2 opposite dB add; M3 2R not 2πR; M4 B∝1/R; M5 reverse I→flip; M6 monotonic, max z=0).

### Assessment (6 Q) — all keyed answers verified, distractors are real misconceptions:
Q1 `μ₀NI/2R` (S4); Q2 axial/grip (S5); Q3 all-axial-add (S3, aha); Q4 element dB axial `dl×r̂` (S2); Q5 max at z=0 (S6); Q6 **halves** B∝1/R (S4, verified 25.13→12.57).
`coverage_map.by_state={STATE_2:[Q4],STATE_3:[Q3],STATE_4:[Q1,Q6],STATE_5:[Q2],STATE_6:[Q5]}`; `non_assessed_states=[STATE_1,STATE_7]`.

### Modes: conceptual ONLY. No `mode_overrides`, no `epic_c_branches`, no authored deep-dive child sims. `has_prebuilt_deep_dive:true` on STATE_3+STATE_6 = cache hint only.

## FLAGs for json_author
1. Carry every `pause_after_ms` verbatim. Sliders R,z in cm (renderer ÷100 → m); verify default = 25.13 µT. STATE_5 reversal = direction flag, not negative I. If `pvl_colors` set, include `"background":"#0A0A1A"`. Colour: current amber; dB/B one field colour; field lines green.
2. → renderer-primitives (via auditor FAIL): register in `deriveStateMeta.ts` same change; NEW ids `cl_radius_line`, `cl_rhat_arrow`, `cl_bz_graph`, cross-product hand (reuse createLorentzHand).
