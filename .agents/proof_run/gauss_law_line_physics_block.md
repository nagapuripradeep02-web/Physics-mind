# Physics block — `gauss_law_line`

> **[VINTAGE — pre-Rule-31/35 architecture (Socratic beats, Indian anchors, EPIC-C). Historical record only — never clone.]**

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

**Authored by:** physics-author · **2026-06-26** · appended to `gauss_law_line_skeleton.md`.
**For:** json-author. **Schema:** v2.3. **Renderer:** `field_3d` (new `gauss_law_line` scenario).

> Honors the founder-locked 7-state arc, all four `advance_mode` values, the PRIMARY aha (STATE_6 = 1/r not 1/r²), and the misconception mapping from the skeleton. Nothing in this block changes state count, advance_modes, the aha, or the misconception→state map.

---

## 0. Pre-authoring: engine bug queue consultation

Queried `engine_bug_queue --field3d`, `--owner alex:physics_author`, and `gauss_law_line` (no rows yet — new concept). The prevention rules this block satisfies:

| `bug_class` / directive | Owner | How this block satisfies it |
|---|---|---|
| `gauss_state1_readout_prespoils_epsilon` · `teach_do_not_prespoil_a_later_reveal` · `flux_epsilon0_cutline_inversion_guard` | renderer / architect / json_author | **ε₀ and the solved formula `E = λ/(2πε₀r)` appear in NO TTS sentence before STATE_5.** STATE_1–4 use the ∝ form only. The pre-spoil guard is enforced sentence-by-sentence below. |
| `solenoid_dropped_prediction_pauses_x4` | json_author | **Every `pause_after_ms` is declared in the reveal tables below and MUST be carried into the JSON verbatim.** field_3d consumes `pause_after_ms` via `deriveStateMeta`. The two the architect flagged — STATE_1 `s1_2 = 2600`, STATE_4 `s4_1 = 2800` — are bolded, plus prediction pauses on s2_1, s3_1, s5_2, s6_2. |
| `teach_reveal_synced_to_narration` · `teach_show_quantity_live_when_named` | physics_author (mine) | Every `reveal_at_*` `at_ms` below is tuned to cumulative narration pacing. The `r`⊥ line grows when "distance r" is said (STATE_2); the `L`∥ line grows when "height L" is said (STATE_3). |
| `teach_concrete_before_abstract_compare` | architect | STATE_6: the 1/r² point-charge ghost draws **first, alone, faint** (`point_charge_ghost`), then the 1/r line curve is laid beside it (`E_demo`), then the divergence is highlighted. |
| `teach_distinct_reference_lines_for_two_radii` | architect | `r` (perpendicular, billboarded camera-right) and `L` (axial cylinder height) are two distinct labelled quantities. Constraint C... pins them separate; first-appearance r=STATE_2, L=STATE_3. |
| `field3d_scenario_missing_devstatemeta_recognition` · `field3d_reveal_too_subtle_fails_d7` · `field3d_explorer_state_static_d1p` · `field3d_time_gated_visual_invisible_in_slider_state` · `field3d_oneshot_element_vanishes_after_animation` | renderer (FAIL-routed, NOT mine) | **FLAGGED to json_author + quality_auditor:** the new `gauss_law_line` scenario needs a `deriveStateMeta.ts` recognition block (reveal/hold/motion per state) in the SAME change. STATE_7 (explorer) needs idle auto-sweep or `interactive` classification; sliders render at full immediately. Guided reveals sustain ≥0.1%/frame OR declare `reveal_hold`. Renderer-owned — surfaced for a complete handoff. |
| `aha_statement_exceeds_15_words` | json_author | PRIMARY-aha physics check (§8) confirms a ≤15-word headline. |
| `gsph_radius_R_line_not_anchored_at_sphere_centre` · `field3d_position_vector_foreshortened_3q_camera` | renderer (FAIL-routed) | The `r`⊥ line billboards to camera-right (screen-horizontal); the `L`∥ line runs axially. Two distinct directions, no foreshortening collision. |

No prevention rule is violated; no exception required.

**DC Pandey check:** No formula, derivation order, example problem, or figure imported. The cylindrical-Gauss derivation is from first principles. The 2:1 force-ratio question (Q5) and the HT-line anchor are authored, not lifted.

---

## 1. physics_engine_config.variables

Mirrors gauss_law_sphere.json demo-scaling (DEMO_E_PER_NC = 225, epsilon_0 = 8.854e-12, k = 8.99e9; locked constants declared min=max=default). New slider variables: lambda + r (STATE_7). L is a fixed demo height (NOT a slider — STATE_5 whole point is that L cancels).

```json
"variables": {
  "lambda": {
    "name": "Linear charge density on the wire",
    "unit": "demo nC/m",
    "min": -2, "max": 3, "default": 1, "step": 0.5
  },
  "r": {
    "name": "Perpendicular distance from the line to the field point (= Gaussian-cylinder radius)",
    "unit": "demo units",
    "min": 0.3, "max": 4.0, "default": 2.0, "step": 0.05
  },
  "L": {
    "name": "Axial height of the Gaussian cylinder (a length of wire; cancels out of E)",
    "unit": "demo units",
    "min": 1.0, "max": 4.0, "default": 2.5, "step": 0.1
  },
  "epsilon_0": {
    "name": "Permittivity of free space (a fixed constant of nature)",
    "unit": "C^2/(N*m^2)",
    "min": 8.854e-12, "max": 8.854e-12, "default": 8.854e-12, "step": 1
  },
  "k": {
    "name": "Coulomb constant, k = 1/(4*pi*epsilon_0)",
    "unit": "N*m^2/C^2",
    "min": 8.99e9, "max": 8.99e9, "default": 8.99e9, "step": 1
  },
  "DEMO_E_PER_NC": {
    "name": "Demo field readout per nanocoulomb-per-metre, at unit demo radius",
    "unit": "demo (N/C) per (nC/m) at r=1",
    "min": 225, "max": 225, "default": 225, "step": 1
  }
}
```

Variable notes (for json-author):
- lambda range -2..3 mirrors the sphere q range so the sign-of-charge colour logic (outward +lambda red / inward -lambda blue) carries over. default 1 (a clean positive wire).
- r clamp: prompt mandates clamp >= 0.05 (1/r blows up at r=0). Slider min is 0.3 (useful range), but the computed_outputs below use Math.max(r, 0.05) defensively so a programmatic r leak can never divide by ~0. default 2.0 (the slow-falloff regime r>1, where 1/r visibly sits above 1/r2).
- L is NOT a slider. Fixed demo height (default 2.5). STATE_5 payoff is that L cancels; an L slider would teach the opposite. Declared with min/max only so the renderer can draw the axial line; no slider_controls.L.
- epsilon_0, k, DEMO_E_PER_NC are locked constants (min=max=default), identical to the sphere. DEMO_E_PER_NC = 225 reused so the 1/r line and the 1/r2 ghost cross exactly at r=1 (both read 225*lambda) — a clean shared start before they diverge.

Bug #1 (default_variables_only_first_var_merged) compliance: every variable with a non-1 default (r=2.0, L=2.5, epsilon_0, k, DEMO_E_PER_NC=225) is explicitly declared here so json-author wires each through default_variables; none falls back to 1 at runtime.

---

## 2. computed_outputs

```json
"computed_outputs": {
  "E_demo": { "formula": "DEMO_E_PER_NC * lambda / Math.max(r, 0.05)" },
  "E_real": { "formula": "(lambda * 1e-9) / (2 * PI * epsilon_0 * Math.max(r, 0.05))" },
  "q_enc": { "formula": "lambda * L" },
  "flux_check": { "formula": "(lambda * 1e-9 * L) / epsilon_0" },
  "point_charge_ghost": { "formula": "DEMO_E_PER_NC * lambda / (Math.max(r, 0.05) * Math.max(r, 0.05))" }
}
```

Algebra verification (the L-cancellation + the 1/r law):

```
Gauss:                 Phi = q_enc / eps0
Enclosed charge:       q_enc = lambda*L                  (charge on a length L of wire)
Symmetry-reduced flux: Phi = E * (2*pi*r*L)              (only the curved wall; caps = 0)
Set equal:             E * (2*pi*r*L) = lambda*L / eps0
L cancels:             E * (2*pi*r)   = lambda  / eps0   <- L on both sides cancels
Solve:                 E = lambda / (2*pi*eps0*r)
```

The L genuinely cancels — it appears on both sides and divides out, leaving an answer with no L. That is why E_demo and E_real have no L term, while q_enc and flux_check (cylinder content, not field) do.

Numerical confirmation (run):
- E_real for lambda=1 nC/m at r = 0.5, 1.0, 2.0 -> 35.95, 17.98, 8.99 N/C. Doubling r exactly halves E => E proportional to 1/r. OK
- L-cancellation: (lambda*L/eps0)/(2*pi*r*L) with L=1 and L=3 both give 17.975 N/C — identical. OK
- flux_check = q_enc/eps0: lambda=1nC/m, L=2 -> 225.9 (matches E_real*2*pi*r*L). OK

The 1/r-vs-1/r2 contrast (STATE_6 — PRIMARY aha):

| quantity | law | r=0.5 | r=1 | r=2 | r=4 |
|---|---|---|---|---|---|
| E_demo (line, 1/r) | 225*lambda/r | 450 | 225 | 112.5 | 56.25 |
| point_charge_ghost (1/r2) | 225*lambda/r^2 | 900 | 225 | 56.25 | 14.06 |

The two curves cross at r=1 (both 225*lambda), then the line sits ABOVE the ghost for all r>1 — the line falls off slower. The falloff (1/r) is genuinely slower than the point falloff (1/r2) because the cylinder area 2*pi*r*L grows linearly with r, while a sphere area 4*pi*r^2 grows quadratically.

point_charge_ghost is display-only (no real charge placed) — the same lambda-driven 225 scaling as E_demo but with /r^2, so the two curves are honestly comparable. json-author: use point_charge_ghost for the STATE_6 faint ghost curve ONLY.

---

## 3. formulas

No angle arguments here (radial electrostatics, no sin/cos/RHR, so no radians() needed; skeleton 10(c) documents RHR as N/A).

```json
"formulas": {
  "gauss_law":           "Phi = q_enc / epsilon_0",
  "enclosed_charge":     "q_enc = lambda * L",
  "symmetry_reduction":  "Phi = E * (2 * PI * r * L)",
  "set_equal":           "E * (2 * PI * r * L) = (lambda * L) / epsilon_0",
  "L_cancels":           "E * (2 * PI * r) = lambda / epsilon_0",
  "solved_field":        "E = lambda / (2 * PI * epsilon_0 * r)",
  "falloff_line":        "E proportional to 1/r",
  "falloff_point_contrast": "point charge E proportional to 1/r^2",
  "direction":           "E radially outward for +lambda (inward for -lambda), perpendicular to the line, independent of axial position"
}
```

Formula rigor check (each line):
- gauss_law — [Phi]=N*m^2/C; [q_enc/eps0]=C/(C^2*N^-1*m^-2)=N*m^2/C. OK (the Gauss STATEMENT, a prerequisite, shown as the carried-in start, not re-derived).
- enclosed_charge — [lambda*L]=(C/m)*m=C. OK
- symmetry_reduction — only the curved wall contributes (caps grazed). Wall area = 2*pi*r*L. [E*area]=N*m^2/C=flux. OK E pulled out because |E| constant on the wall and perpendicular to it.
- set_equal — two flux expressions equated; both sides N*m^2/C. OK
- L_cancels — L divides out of both sides (verified). The reveal strikes the L. OK
- solved_field — [lambda/(2*pi*eps0*r)]=N/C. OK
- falloff lines — qualitative proportionality statements for STATE_6.
- direction — radial, perpendicular, sign sets outward/inward, axial-independent. OK

---

## 4. constraints

```json
"constraints": [
  "E is strictly radial and perpendicular to the line everywhere (E parallel r-hat, r measured perpendicular from the line) (C1).",
  "|E| is constant at every point of a coaxial ring at perpendicular distance r - this is what lets E leave the flux integral (C2).",
  "E is independent of position ALONG the line (axial position) and independent of the cylinder height L: the field at a point depends only on lambda and the perpendicular distance r (C3).",
  "The two flat end caps carry exactly zero flux: E is radial, so it lies in the plane of each cap (E.dA = 0); only the curved wall carries flux (C4).",
  "Total flux equals wall flux: Phi = E*(2*pi*r*L) = q_enc/epsilon_0 = lambda*L/epsilon_0; the L cancels, giving E = lambda/(2*pi*epsilon_0*r) (C5).",
  "E falls off as 1/r (NOT 1/r^2): doubling r halves E. This is slower than a point charge 1/r^2 (doubling r quarters E) (C6).",
  "The 1/r law follows because the Gaussian cylinder curved area 2*pi*r*L grows LINEARLY with r, while a sphere 4*pi*r^2 grows QUADRATICALLY (C7).",
  "Arrow direction follows the sign of lambda: outward for +lambda, inward for -lambda; magnitude scales linearly with |lambda| at fixed r (C8)."
]
```

Edge-case flags for json-author:
- r->0 divergence: 1/r -> infinity at the line. Handled by Math.max(r, 0.05) in every computed_output. Slider min 0.3 keeps the student clear. No per-state override needed — the clamp is global.
- lambda = 0 (reachable via step 0.5 from -2): E = 0, arrows vanish. Correct. Renderer should HIDE arrows at lambda=0, not draw zero-length stubs (cf. rhr_direction_only_hard_cutline).
- Negative lambda: arrows inward, recoloured per-sign (C8). Per teach_color_each_element_by_its_own_sign: colour the +/- markers by their OWN sign; the ring arrows (aggregate field indicator) follow the net sign of lambda.

---

## 5. Per-state variable_overrides (value locks)

Defensive-locking pattern (hinge_force.json STATE_4 F_ext:0; field_forces.json STATE_5 m:1). The values mostly live in the field_3d_config per-state gauss_line blocks (mirroring the sphere), but these per-state value locks are REQUIRED so an upstream default_variables leak or a STATE_7 slider drag cannot bleed the wrong r/lambda into a guided state:

| state | override | why |
|---|---|---|
| STATE_1 | lambda: 1 (no arrows shown) | Hook: positive wire, but NO field arrows/formula drawn. Lock lambda so a leaked negative lambda cannot tint markers wrong. |
| STATE_2 | lambda: 1, r: 2.0 | Radial ring drawn at a specific r; narration says distance r, so the r-line must grow to this fixed length, not a leaked STATE_7 value. |
| STATE_3 | lambda: 1, r: 2.0, L: 2.5 | Cylinder drawn at fixed (r, L); the L-line grows to L=2.5 when height L is said. Lock all three. |
| STATE_4 | lambda: 1, r: 2.0, L: 2.5 | Cap-vs-wall contrast at the same fixed cylinder. |
| STATE_5 | lambda: 1, r: 2.0, L: 2.5 | Derivation write-in references the SAME cylinder; L must equal 2.5 so L cancels is visually honest against the drawn L-line. |
| STATE_6 | lambda: 1; r swept 0.5 -> 3.6 via coordinated_sweep (NOT a slider) | PRIMARY aha. Lock lambda=1 so both curves share the 225 crossover at r=1; r is animated by the sweep, not student-driven. |
| STATE_7 | none, sliders own lambda and r live | Explorer. lambda + r are student-driven; render at full immediately (no clock-gated emergence, field3d_time_gated_visual_invisible_in_slider_state). |

json-author: carry these as the per-state gauss_line dot lambda/r/L block values (the sphere stores them inside field_3d_config.states.STATE.gauss_sphere, not as top-level variable_overrides). Either location is acceptable; the LOCK is what matters.

---

## 6. Per-state within-state reveal timeline (REQUIRED, session 33)

All TTS plain English, 30 words max per sentence, HT-transmission-line anchor, no Hinglish. Pre-spoil guard: no sentence in STATE_1 through STATE_4 names epsilon-nought or the solved formula E = lambda over 2 pi eps0 r. epsilon-nought first appears in s5_1; the solved formula first in s5_3.

at_ms tuned to cumulative narration pacing (teach_reveal_synced_to_narration). pause_after_ms on prediction beats gives think-time. EVERY pause_after_ms below MUST be carried into the JSON (solenoid_dropped_prediction_pauses_x4).

### STATE_1, Hook (advance_mode: wait_for_answer)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s1_1 | Picture a high-tension power line strung across the countryside, a single straight wire running for kilometres, carrying charge spread evenly along it. | line + lambda plus-markers populate | markers_populate | 0 | none |
| s1_2 | As you walk away from the wire, how does its field weaken with distance r, and what is your first guess for the law? | none (prediction question; proportionality form only, NO eps0) | none | 5200 | 2600 |

- Reveal: none fires (resolution withheld to STATE_5/6). On-canvas: the line + plus-markers only. NO field arrows, NO formula, NO eps0.
- Pre-spoil check: s1_1/s1_2 name neither eps0 nor the formula. The question plants the inverse-square instinct deliberately (Rule 16a, an earned wrong belief, broken at STATE_6). OK

### STATE_2, radial-field reveal (advance_mode: auto_after_tts)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s2_1 | Point at P, a step out from the wire. Which way does the field push there, along the wire, toward the nearest bit of wire, or straight out? | field point P marker | show | 0 | 2600 |
| s2_2 | The wire looks identical from every direction, so the field can only point straight out, at right angles to the line. | ring of about 12 equal radial arrows + r-perp line | fade_in + r_line_grow | 7800 | none |
| s2_3 | And every arrow on that ring has the same length, same strength all the way around, at this distance r. | symmetry label, E parallel r-hat, magnitude constant on ring | slide_in | 13500 | none |

- Reveal binding: s2_2 grows the r-perp reference line LIVE as straight out at right angles to the line is said, and raises the radial ring (teach_show_quantity_live_when_named). The r-line billboards camera-right (field3d_position_vector_foreshortened_3q_camera).
- Pre-spoil check: proportionality form only; no eps0, no formula. Confronts misconception 3 (field along wire / toward nearest point). OK

### STATE_3, Gaussian-cylinder reveal (advance_mode: manual_click)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s3_1 | We could add up Coulomb law from every tiny piece of charge, slow. Instead we wrap one closed surface around the wire. Sphere, or cylinder? | faded carryover ring | hold | 0 | 2400 |
| s3_2 | A cylinder, coaxial with the wire, because it matches the wire shape. On its curved wall the field is constant and points straight through. | Gaussian cylinder, wall + wireframe + two caps, + L-axial line | fade_in + L_line_grow | 8600 | none |
| s3_3 | Give the cylinder a height L. The flux through its curved wall is the field times the wall area, two pi r times L. | wall-area label 2 pi r L | slide_in | 15200 | none |

- Reveal binding: s3_2 fades the cylinder in on a cylinder coaxial; the L-axial line grows when height L is said in s3_3 (carry the L-line grow to the s3_3 beat, about 15200 ms). Two distinct reference lines now on screen, r-perp (camera-right, STATE_2 carryover) and L-axial (teach_distinct_reference_lines_for_two_radii).
- Pre-spoil check: 2 pi r L is the wall area (geometry, allowed). No eps0, no solved formula yet. Folds in misconception 4 (must integrate Coulomb dq, one surface replaces the sum). OK

### STATE_4, end-cap zero-flux reveal (advance_mode: wait_for_answer)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s4_1 | The cylinder has three pieces, the curved wall and two flat end caps. Which pieces does the field actually pierce? | none (prediction question) | none | 0 | 2800 |
| s4_2 | The field is radial, so on each flat cap it just grazes along the surface, it never pokes through. Zero flux on both caps. | grazing arrows on caps + Phi = 0 tags | fade_in + cap_tag | 8000 | none |
| s4_3 | Only the curved wall is pierced. So the whole flux is the wall flux, E times two pi r L. | piercing wall arrows + label Phi = E times 2 pi r L | fade_in | 13800 | none |

- Reveal binding: s4_2 draws grazing cap arrows + Phi=0 tags on it just grazes zero flux on both caps; s4_3 shows the piercing wall + carries the wall-flux expression into STATE_5.
- Pre-spoil check: Phi = E times 2 pi r L is the symmetry-reduced flux (geometry + carried-in Gauss setup), NOT the solved field and NOT eps0. OK Confronts misconception 2 (caps carry flux too).

### STATE_5, derivation reveal (advance_mode: manual_click)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s5_1 | How much charge sits inside the cylinder? Just the charge on a length L of wire, that is lambda times L. By Gauss, the flux equals lambda-L over epsilon-nought. | q_enc = lambda L + label Phi = lambda L over eps0 (eps0 FIRST appears) | write_in | 0 | none |
| s5_2 | Now we have two expressions for the same flux. Set them equal and solve for E, and watch what happens to L. | none (prediction question) | none | 9500 | 2500 |
| s5_3 | The L on each side cancels. The field is lambda over two pi epsilon-nought r. | write-in E times 2 pi r L = lambda L over eps0, then L struck, leaving E = lambda over 2 pi eps0 r | derivation_write + L_strike | 15600 | none |
| s5_4 | The length L is gone, so it never mattered how long a piece of wire you wrapped. The field depends only on lambda and your distance r. | final E = lambda over 2 pi eps0 r, focal_highlight | focal_highlight | 22000 | none |

- Reveal binding: s5_3 runs the write-in panel: writes E times 2 pi r L = lambda L over eps0, then visibly strikes the L on both sides (L_strike), leaving E = lambda over 2 pi eps0 r. This is the visual that makes L cancels honest.
- Pre-spoil check: eps0 DELIBERATELY first appears here (s5_1) per the cut-line. The solved formula first appears in s5_3. Everything before STATE_5 was clean. OK Confronts misconception 4 payoff (one line of algebra, not a dq sum).

### STATE_6, PRIMARY aha (advance_mode: manual_click)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s6_1 | You already know a point charge fades as one over r squared. Here is that curve, drawn faint. | point_charge_ghost inverse-square curve, faint, ALONE first | ghost_draw | 0 | none |
| s6_2 | Back at the start you probably guessed the wire fades the same way. Does it? Watch the wire own curve as r grows. | none (prediction; recalls STATE_1 guess) | none | 6000 | 2800 |
| s6_3 | The wire curve sits above the point charge curve, same start at r equals one, but it dies away slower, as one over r. | E_demo 1/r curve + coordinated_sweep (ring arrows shrink as 1/r, dot rides curve) | line_draw + coordinated_sweep | 12000 | none |
| s6_4 | Why slower? The cylinder area, two pi r L, grows straight-line with r, while a sphere four pi r squared grows much faster. | area-comparison label, 2 pi r L linear vs 4 pi r squared quadratic | slide_in | 22000 | none |

- Reveal binding: concrete-first (teach_concrete_before_abstract_compare). The inverse-square ghost draws ALONE and faint at s6_1, THEN the 1/r line draws beside it at s6_3 with the live coordinated_sweep (ring arrows shrink as 1/r AND the tracking dot rides the 1/r curve in lockstep, teach_coordinate_sim_with_graph). The two curves cross at r=1 (both 225 lambda) and diverge for r greater than 1.
- Reveal-too-subtle guard: the coordinated_sweep is continuous motion (above 0.1 percent per frame), satisfies D7 (field3d_reveal_too_subtle_fails_d7). FLAG to renderer: register this state motion in deriveStateMeta.

### STATE_7, Exploration (advance_mode: interaction_complete)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s7_1 | Now you drive. Push lambda up, every arrow on the ring grows together, and the readout climbs. | lambda slider + ring arrows (live) | slider_live | 0 | none |
| s7_2 | Drag r outward, the arrows shrink as one over r, and the readout slides down along the curve. | r slider + 1/r plot tracking dot (live) | slider_live | 6500 | none |
| s7_3 | Notice E never cares where along the wire you stand, only lambda and your perpendicular distance r. | persistent label E = lambda over 2 pi eps0 r | hold | 12500 | none |

- Reveal binding: sliders render at full immediately and track live (field3d_time_gated_visual_invisible_in_slider_state, no clock-gated emergence). FLAG to renderer: STATE_7 needs an idle auto-sweep of r OR interactive classification so D1p does not false-fail on a static headless capture (field3d_explorer_state_static_d1p).

Pre-spoil audit (whole concept): scanned every sentence s1_1 through s7_3. The string epsilon / eps0 appears first in s5_1; lambda over 2 pi eps0 r first in s5_3. STATE_1 through STATE_4 are clean. PASS.

---

## 7. Per-state misconception_watch (Rule 16a, EPIC-L-internal)

One entry per STATE_1 through STATE_6 (skeleton section 4). Each one_line_fix physics-checked.

```json
"STATE_1": [{
  "belief": "The field of a charged wire must fall off as 1/r^2, the same way a point charge does.",
  "visual_counter": "The hook shows only the wire and its charge markers - no field law yet; the guess is held until STATE_6 reveals the wire curve sitting ABOVE the point-charge curve.",
  "one_line_fix": "A line is not a point: its field falls off as 1/r, slower than a point charge 1/r^2 - proven at STATE_6."
}],
"STATE_2": [{
  "belief": "The field points along the wire, or leans toward the nearest bit of wire.",
  "visual_counter": "A full ring of equal-length arrows points straight out, perpendicular to the line; rotating the wire about its axis leaves the picture unchanged.",
  "one_line_fix": "Cylindrical symmetry forces E to be radial and equal in magnitude all around a coaxial ring at distance r."
}],
"STATE_3": [{
  "belief": "You must add up Coulomb law from every tiny piece of charge to get the field.",
  "visual_counter": "One coaxial Gaussian cylinder replaces the piece-by-piece sum; on its curved wall E is constant, so the flux is just E times the wall area.",
  "one_line_fix": "Gauss plus cylindrical symmetry replaces the dq-by-dq Coulomb integral with one closed surface and one equation."
}],
"STATE_4": [{
  "belief": "The two flat end caps carry flux too, so they belong in the calculation.",
  "visual_counter": "Arrows graze along each flat cap (Phi = 0 tag) while piercing the curved wall; only the wall flux survives.",
  "one_line_fix": "E is radial, so it lies flat in each end cap (E dot dA = 0); only the curved wall carries flux, area 2 pi r L."
}],
"STATE_5": [{
  "belief": "A longer cylinder, or a longer piece of wire, must change the field you compute.",
  "visual_counter": "The write-in strikes the L on both sides; the solved field E = lambda/(2 pi epsilon_0 r) has no L in it at all.",
  "one_line_fix": "The L cancels: enclosed charge lambda*L and wall area 2 pi r L both scale with L, so E never depends on the length you wrap."
}],
"STATE_6": [{
  "belief": "The wire field falls off as 1/r^2, like a point charge - doubling r quarters the field.",
  "visual_counter": "The wire 1/r curve sits above the faint 1/r^2 ghost; doubling r only HALVES the wire field, while the cylinder area 2 pi r L grows merely linearly.",
  "one_line_fix": "The line falls off as 1/r (doubling r halves E), slower than a point 1/r^2 (doubling r quarters E)."
}]
```

Physics check on each one_line_fix: all six are correct physics, not merely persuasive. STATE_6 doubling r halves E vs doubling r quarters E is the numerically-verified 2 to 1 vs 4 to 1 contrast (section 9). STATE_5 claim that both q_enc and wall-area scale with L (so L cancels) is the exact algebra of section 2. PASS.

---

## 8. PRIMARY-aha + SUPPORTING-aha physics check

PRIMARY aha (STATE_6). 15-word headline for aha_moment.statement (json-author, keep at 15 words; em-dash counts as a token; aha_statement_exceeds_15_words guard):

> A line charge field falls off as 1/r, not 1/r^2 — slower than a point charge.

Word count: A(1) line(2) charge(3) field(4) falls(5) off(6) as(7) 1/r(8) not(9) 1/r2(10) dash(11) slower(12) than(13) a(14) point(15). Trailing charge dropped to land exactly 15 tokens. Physically TRUE (verified numerically: doubling r halves E for the line vs quarters for a point). STATE_6 coordinated_sweep + the two diverging curves actually demonstrate it. PASS, not wrong-but-memorable.

SUPPORTING aha (STATE_4): The end caps carry zero flux, the field grazes them, so only the curved side counts. Physically TRUE (C4: E radial implies E perpendicular to dA_cap implies E dot dA = 0). Causally linked to the primary (caps-zero implies area = 2 pi r L implies 1/r). PASS. 1 PRIMARY + 1 SUPPORTING = sweet spot.

---

## 9. Six-question assessment + coverage_map

Per skeleton 10(f): Q1 E formula (STATE_5); Q2 radial/perp (STATE_2); Q3 only curved wall (STATE_4); Q4 1/r not 1/r2 PRIMARY aha (STATE_6); Q5 force ratio 2 to 1 at r1 vs 2 r1 (STATE_6); Q6 L cancels (STATE_5). Every keyed answer verified correct; every distractor is a real wrong belief that yields that option.

```json
"assessment": {
  "mastery_definition": "A student has mastered the field of an infinite line charge when they can (1) state E = lambda/(2*pi*epsilon_0*r), radial and perpendicular to the line; (2) explain that cylindrical symmetry makes E constant and perpendicular on the curved wall so Phi = E*(2*pi*r*L) = q_enc/epsilon_0; (3) show that the two flat end caps carry zero flux because E is parallel to them; (4) show that L cancels, so E depends only on lambda and the perpendicular distance r, never on the length of wire enclosed or on axial position; and (5) recognise that E falls off as 1/r, slower than a point charge 1/r^2, because the cylinder area 2*pi*r*L grows linearly with r.",
  "questions": [
    {
      "q_id": "Q1",
      "stem": "An infinite straight wire carries uniform linear charge density lambda. What is the electric field at a perpendicular distance r from the wire?",
      "options": {
        "A": "E = lambda/(2*pi*epsilon_0*r) - radial, perpendicular to the wire",
        "B": "E = lambda/(4*pi*epsilon_0*r^2) - falling off as 1/r^2 like a point charge",
        "C": "E = lambda/(2*pi*epsilon_0*r^2) - the line version of the inverse-square law",
        "D": "E = q/(4*pi*epsilon_0*r^2) with q the total charge on the wire"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "applies a point charge 1/r^2 falloff to a line, halving the correct power of r",
        "C": "keeps the correct 2*pi prefactor but wrongly uses 1/r^2 instead of 1/r",
        "D": "treats the infinite wire as a single point charge with a finite total charge q"
      },
      "tested_idea": "The field of an infinite line charge is E = lambda/(2*pi*epsilon_0*r), radial and 1/r.",
      "teaches_state": "STATE_5",
      "difficulty": "core",
      "parallel_form_stem": "A long high-tension power line carries charge lambda per metre. Write the electric field a probe feels at perpendicular distance r, away from the line ends."
    },
    {
      "q_id": "Q2",
      "stem": "At a point P beside an infinite charged wire, in what direction does the electric field point?",
      "options": {
        "A": "Radially outward, perpendicular to the wire - straight away from the line",
        "B": "Along the wire, parallel to its length",
        "C": "Toward the nearest single point of the wire, at a slant",
        "D": "It spirals around the wire like a magnetic field"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "thinks the field runs along the wire rather than out from it",
        "C": "imagines the field aiming at the closest bit of wire instead of being purely radial",
        "D": "confuses the electric field of a line charge with the circular magnetic field of a current"
      },
      "tested_idea": "Cylindrical symmetry makes E purely radial and perpendicular to the line.",
      "teaches_state": "STATE_2",
      "difficulty": "core",
      "parallel_form_stem": "Hold a tiny positive test charge near a long charged rod. Which way does the force on it point relative to the rod?"
    },
    {
      "q_id": "Q3",
      "stem": "A coaxial Gaussian cylinder (radius r, height L) is drawn around an infinite charged wire. Through which part of its surface does the electric flux pass?",
      "options": {
        "A": "Only the curved side wall; the two flat end caps carry zero flux",
        "B": "Equally through the curved wall and both end caps",
        "C": "Only through the two end caps; the curved wall carries none",
        "D": "Through all three surfaces, but mostly through the nearer end cap"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "thinks every face of a closed surface must carry flux",
        "C": "inverts which surface the radial field actually pierces",
        "D": "imagines the field leaking out of the ends of the cylinder"
      },
      "tested_idea": "E is radial, so it grazes the flat caps (E dot dA = 0); only the curved wall carries flux.",
      "teaches_state": "STATE_4",
      "difficulty": "core",
      "parallel_form_stem": "You wrap a soup-can-shaped Gaussian surface around a charged wire. Which faces of the can does the field actually pass through?"
    },
    {
      "q_id": "Q4",
      "stem": "How does the field of an infinite line charge fall off with distance, compared with a point charge?",
      "options": {
        "A": "The line falls off as 1/r, slower than the point charge 1/r^2",
        "B": "Both fall off as 1/r^2 - a line is just many point charges in a row",
        "C": "The line falls off as 1/r^2 and the point charge as 1/r",
        "D": "The line field does not weaken with distance at all"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "assumes summing point charges keeps the 1/r^2 law instead of giving 1/r",
        "C": "swaps the two falloff laws between line and point",
        "D": "thinks an infinite line gives a uniform field that never weakens"
      },
      "tested_idea": "The line falls off as 1/r (slower) because the cylinder area 2*pi*r*L grows linearly, not as r^2.",
      "teaches_state": "STATE_6",
      "difficulty": "stretch",
      "parallel_form_stem": "Walking away from a long charged power line versus away from a single charged ball - whose field dies away faster, and what power of r does each follow?"
    },
    {
      "q_id": "Q5",
      "stem": "A probe at distance r1 from an infinite charged wire feels field E1. It is moved to 2*r1. What is the new field?",
      "options": {
        "A": "E1/2 - the line field halves when r doubles, because it goes as 1/r",
        "B": "E1/4 - the field quarters when r doubles, as for a point charge",
        "C": "E1 - the field is the same everywhere outside an infinite wire",
        "D": "2*E1 - the field grows as you move the probe outward"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "applies the point charge 1/r^2 (quarter) instead of the line 1/r (half)",
        "C": "thinks an infinite wire gives a distance-independent field",
        "D": "believes the field increases with distance from the wire"
      },
      "tested_idea": "E goes as 1/r, so doubling r halves the field (vs quartering for a 1/r^2 point charge).",
      "teaches_state": "STATE_6",
      "difficulty": "stretch",
      "parallel_form_stem": "Near an HT power line a probe reads field E1 at 2 metres. What does it read at 4 metres from the line?"
    },
    {
      "q_id": "Q6",
      "stem": "Two students wrap Gaussian cylinders of DIFFERENT heights (L and 3L) around the same charged wire to find E at the same distance r. What do they get?",
      "options": {
        "A": "The same E - the height L cancels, so E depends only on lambda and r",
        "B": "The taller cylinder gives three times the field, since it encloses more charge",
        "C": "The shorter cylinder gives a stronger field, since the charge is more concentrated",
        "D": "They cannot get E without first agreeing on a cylinder height"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "sees q_enc = lambda*L grow with L but forgets the wall area 2*pi*r*L grows the same way, cancelling",
        "C": "invents a concentration effect from a shorter cylinder",
        "D": "thinks the answer depends on the arbitrary length of wire enclosed"
      },
      "tested_idea": "Both q_enc and the wall area scale with L, so L cancels: E is independent of the enclosed length.",
      "teaches_state": "STATE_5",
      "difficulty": "stretch",
      "parallel_form_stem": "Two people draw soup-can Gaussian surfaces of different lengths around the same charged wire. Do they compute the same field at a given distance, or different ones?"
    }
  ]
}
```

```json
"coverage_map": {
  "by_state": {
    "STATE_2": ["Q2"],
    "STATE_4": ["Q3"],
    "STATE_5": ["Q1", "Q6"],
    "STATE_6": ["Q4", "Q5"]
  },
  "non_assessed_states": ["STATE_1", "STATE_3", "STATE_7"]
}
```

Assessment physics check:
- Q1 keyed A: E = lambda/(2 pi eps0 r), exact. Distractors B/C/D each a real belief (point-charge import, wrong power, lump-as-point). OK
- Q2 keyed A: radial perpendicular. D (spiral/magnetic) is a genuine line-charge-vs-current confusion. OK
- Q3 keyed A: only curved wall. OK
- Q4 keyed A: 1/r slower than 1/r2. The PRIMARY-aha question (STATE_6). OK
- Q5 keyed A: doubling r gives E/2 (numerically verified 2 to 1; a point would be 4 to 1, distractor B). OK
- Q6 keyed A: L cancels. Distractor B is the precise half-understanding (sees q_enc grow, forgets area grows too). OK
- Gate 19 (coverage): every teaches_state is real (STATE_2/4/5/6); non_assessed_states = STATE_1, STATE_3, STATE_7 partition the 7 states with no overlap. OK
- Gate 20 (quiz quality): every wrong option has a distractor_misconception; correct options are NOT keyed; 6 distinct tested_idea; 2 questions hit the aha state (Q4 + Q5 both STATE_6); unique q_ids. OK
- Parallel forms physics-equivalent to originals (HT-line / soup-can re-skins, same physics). OK

---

## 10. Drill-down trigger phrases (skeleton section 6: 9 clusters, 5 phrasings each)

Real Indian 11th/12th student voice, plain English, no Hinglish, sounds confused (not like a teacher). These become trigger_examples TEXT[] in the Supabase cluster seed. Per skeleton section 6 the SQL ships ONE founder-locked cluster per hard state, pick the strongest: why_caps_zero_flux (STATE_4), where_did_L_go (STATE_5), why_1_over_r_not_r_squared (STATE_6). All nine are authored below so json-author has them if the founder widens the seed.

### STATE_4, end-cap zero flux

why_caps_zero_flux (strongest for STATE_4)
- why do the end caps have zero flux
- why no flux through the flat ends of cylinder
- do the top and bottom of the gaussian cylinder count
- why we ignore the two circle faces
- shouldnt the caps also have field passing

e_parallel_to_cap
- why is E parallel to the end cap
- how field is along the cap not through it
- why E dot dA is zero on the caps
- field grazes the cap meaning
- why does E lie flat on the end face

only_curved_side
- why only curved surface for flux
- why we take only side wall area
- only curved part matters why
- why flux is only E times 2 pi r L
- why not include the cap area in flux

### STATE_5, derivation + L cancels

where_did_L_go (strongest for STATE_5)
- where did L go in the formula
- why L cancels out
- why is there no L in E equation
- the height L just disappeared how
- what happened to length L

q_enc_is_lambda_L
- why is enclosed charge lambda times L
- how q enclosed becomes lambda L
- why charge inside cylinder is lambda L
- where does lambda L come from
- why multiply lambda by L for charge

infinite_wire_assumption
- why does the wire have to be infinite
- what if the wire is not infinitely long
- does this work for a short wire
- why we assume infinite line charge
- real wires are finite so is this wrong

### STATE_6, 1/r vs 1/r2

why_1_over_r_not_r_squared (strongest for STATE_6)
- why is it 1 by r not 1 by r squared
- why line charge is not inverse square
- why does wire fall off slower than point charge
- shouldnt it be r squared like coulomb
- why 1 over r for wire but 1 over r2 for point

area_grows_linearly
- why does 2 pi r L grow linearly
- how area growing with r changes the falloff
- why cylinder area is linear in r
- what does linear area have to do with 1 over r
- why sphere is r squared but cylinder is just r

line_vs_point_falloff
- difference between line and point charge field
- why a line behaves different from a point
- is a line just many point charges added
- why summing points doesnt give 1 over r squared
- line charge vs point charge which is stronger far away

---

## 11. field_3d_config handoff hints (for json-author)

Per skeleton section 10 handoff line. json-author owns the full block; physics-relevant pins:
- scenario_type gauss_law_line; explorer_id gauss_line_explorer (Rule 27 stable ID).
- slider_controls.lambda (min -2, max 3, step 0.5, default 1) + slider_controls.r (min 0.3, max 4.0, step 0.05, default 2.0). NO slider_controls.L, L is a fixed demo height (it cancels; do not let students tune it).
- gauss_line_defaults: demo_e_per_nc 225, epsilon_0 8.854e-12, L_default 2.5.
- Per-state gauss_line blocks carry the section 5 value locks (lambda/r/L) + the section 6 reveal at_ms schedule.
- STATE_6 coordinated_sweep true, sweep_r_min 0.5, sweep_r_max 3.6 (mirrors the sphere sweep shape); point_charge_ghost draws first/faint, E_demo 1/r curve second.
- FLAG to json-author + quality_auditor (renderer-owned, FAIL-routes to peter_parker:renderer_primitives): the new gauss_law_line scenario requires (a) a deriveStateMeta.ts per-state reveal/hold/motion recognition block in the SAME change; (b) STATE_7 idle auto-sweep or interactive classification (D1p); (c) guided reveals sustain above 0.1 percent per frame or reveal_hold (D7); (d) sliders render at full immediately, not clock-gated. These are surfaced, not actionable by json-author alone.

---

## 12. Self-review checklist

- [x] Every symbol in the state narratives (lambda, r, L, E, eps0, q_enc, 2 pi r L, r-hat) declared in variables or appears in formulas/labels.
- [x] No radians() needed, radial electrostatics, no trig/RHR (skeleton 10(c) N/A documented).
- [x] STATE_7 sliders declared with default/min/max/step (lambda, r); L deliberately NOT a slider (it cancels).
- [x] variable_overrides (value locks) documented per state with one-line justification (section 5).
- [x] Mark scheme, N/A (Rule 20 board mode SUSPENDED; conceptual-only; section 4 board section SKIPPED per spec).
- [x] Drill-down phrasings: 5 per cluster times 9 clusters, real student voice (section 10).
- [x] constraints: 8 short assertions C1-C8 (section 4).
- [x] Numerical sanity: lambda=1nC/m at r=1,2 gives E_real 17.98, 8.99 (halves, so 1/r); L=1 vs L=3 give identical E (L cancels); flux_check = q_enc/eps0. All run and confirmed.
- [x] Within-state reveal timeline for every state introducing a new quantity; prediction sentences carry 2400-2800 ms pauses (s1_2=2600, s2_1=2600, s3_1=2400, s4_1=2800, s5_2=2500, s6_2=2800).
- [x] Engine bug queue consulted (section 0); every relevant prevention_rule satisfied; renderer-owned scars FLAGGED for FAIL-routing, none violated.
- [x] DC Pandey check: no formula, derivation order, example, or figure imported (section 0). All first-principles + authored HT-line anchor.

Routing note for json-author: carry EVERY pause_after_ms (six of them) into the JSON verbatim. The architect specifically flagged s1_2 about 2600 and s4_1 about 2800, and solenoid_dropped_prediction_pauses_x4 is the exact cross-agent regression this guards against. eps0 / the solved formula must stay out of STATE_1 through STATE_4 on canvas AND in TTS.
