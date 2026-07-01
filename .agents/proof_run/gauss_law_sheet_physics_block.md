# Physics block — `gauss_law_sheet`

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

**Authored by:** physics-author · **2026-06-26** · appended to `gauss_law_sheet_skeleton.md`.
**For:** json-author. **Schema:** v2.3. **Renderer:** `field_3d` (new `gauss_law_sheet` scenario, ~88% copy-adapt of `gauss_law_line`).

> Honors the founder-locked 7-state arc, all four `advance_mode` values, the PRIMARY aha (STATE_6 = CONSTANT / no falloff), the SUPPORTING aha (STATE_4 = wall-zero / caps-carry, the INVERSE of the line), and the misconception map from the skeleton. Nothing in this block changes state count, advance_modes, the aha designations, or the misconception→state map.
>
> **This is the deliberately INVERTED sibling of `gauss_law_line`.** Three inversions are load-bearing and run through every section: (1) the **field is CONSTANT** (no `/d` divisor — the whole point), not `1/r`; (2) the **caps carry the flux** and the **curved wall is zero** — the exact opposite of the cylinder; (3) the **½ comes from TWO caps** (`2EA`), so the single-sheet answer is `σ/(2ε₀)`, NOT the conductor/two-plate `σ/ε₀`.

---

## 0. Pre-authoring: engine bug queue consultation

Queried `engine_bug_queue` via `query_engine_bug_queue.ts` — `gauss_law_sheet` (no rows yet; new concept), `--field3d` (70 rows), and `gauss_law_line` (the sibling; no rows). Read every `prevention_rule`. The directives + FIXED scars this block satisfies or surfaces:

| `bug_class` / directive | Owner | How this block satisfies it |
|---|---|---|
| **`teach_inverted_scenario_inverts_cutline_flags`** (MOST LOAD-BEARING) | architect | This block inverts EVERY line-inherited flag: `E_demo` has **NO `/d` divisor** (constant, not `1/r`); the **caps** carry flux and the **wall** is Φ=0 (not the reverse); the STATE_6 contrast is a **FLAT** sheet line above falling `1/d` & `1/d²` ghosts; constraints C2/C4/C6/C8 are the line's C2/C4/C6/C8 INVERTED. Never inherits the line's "falloff" suppression — the new atom OWNS "constant," so it surfaces it. |
| `teach_do_not_prespoil_a_later_reveal` · `flux_epsilon0_cutline_inversion_guard` · `gauss_state1_readout_prespoils_epsilon` | architect / json_author / renderer | **ε₀ and the solved formula `E = σ/(2ε₀)` appear in NO TTS sentence and on NO canvas before STATE_5.** STATE_1–4 use the ∝ / proportionality form only. Pre-spoil guard enforced sentence-by-sentence in §4 + audited at the end of §4. |
| `solenoid_dropped_prediction_pauses_x4` | json_author | **Every `pause_after_ms` declared in §4 MUST be carried into the JSON verbatim.** field_3d consumes `pause_after_ms` via `deriveStateMeta`. The three the architect flagged — `s1_2 = 2600`, `s4_1 = 2800`, `s5_2 = 2500` — are bolded, plus prediction pauses on s2_1, s3_1, s6_2. |
| `teach_concrete_before_abstract_compare` | architect | STATE_6: the known `1/d²` point ghost + `1/d` line ghost draw **first, faint, falling**, THEN the sheet's **flat** line is laid ABOVE them, THEN the divergence is highlighted. |
| `teach_distinct_reference_lines_for_two_radii` | architect | `d` (perpendicular sheet→P distance, billboarded camera-right) and the pillbox half-height (axial extent line) are two DISTINCT labelled quantities; cap **area `A`** is a third, labelled ON the cap face — never confused with a distance. First-appearance: `d` = STATE_2, half-height + `A` = STATE_3. |
| `teach_color_each_element_by_its_own_sign` | physics_author (mine) | The "+" σ markers + the field arrows are coloured by **σ's own sign** (outward red for +σ, inward blue for −σ); only the aggregate readout follows the net. |
| `teach_show_quantity_live_when_named` | physics_author (mine) | `d`-line grows when "distance" is said (S2); cap-area `A` label writes when "area A" is said (S3); ε₀ appears only on its beat (s5_1). |
| `field3d_overlay_line_occluded_over_geometry` (amperes-review occlusion class) | renderer (FAIL-routed) | **FLAG:** the `d`-line, the `A` label, and the Φ=0 cap/wall tags must read over the translucent pillbox (`material.depthTest=false` + high `renderOrder`). The skeleton explicitly flags occlusion re-check on S5/6/7 (pillbox must not be occluded by the derivation panel / ghosts). |
| `field3d_scenario_missing_devstatemeta_recognition` · `field3d_reveal_too_subtle_fails_d7` · `field3d_explorer_state_static_d1p` · `field3d_time_gated_visual_invisible_in_slider_state` · `field3d_oneshot_element_vanishes_after_animation` | renderer (FAIL-routed, NOT mine) | **FLAGGED to json_author + quality_auditor:** the new `gauss_law_sheet` scenario needs a `deriveStateMeta.ts` recognition block keyed on `state.gauss_sheet` (mirror the existing `gauss_line` block at deriveStateMeta.ts:343) in the SAME change. S2–S6 = `reveal_hold`; S7 = `interactive` + idle distance-sweep; sliders render at full immediately; one-shot reveals hold their end pose. Renderer-owned — surfaced for a complete handoff. |
| `field3d_position_vector_foreshortened_3q_camera` | renderer (FAIL-routed) | The `d`⊥ line billboards to camera-right (screen-horizontal); the pillbox half-height runs axially (perpendicular to the sheet plane in screen space). Two distinct directions, no foreshortening collision. |
| `field3d_array_form_show_sliders_not_marked_interactive` · `teach_auditor_reads_field3d_sliders_from_config_not_scene_composition` | renderer / visual_validator | STATE_7's two sliders (`sigma`, `d`) live in `field_3d_config.slider_controls`, judged from config + rendered frames, not from scene_composition placeholders. `advance_mode: interaction_complete` ⇒ interactive. |
| `aha_statement_exceeds_15_words` | json_author | PRIMARY-aha physics check (§7) confirms a ≤15-word headline. |

No prevention rule is violated; no exception required. The renderer-owned scars are surfaced (not actionable by json_author alone) so the handoff is complete and quality_auditor can FAIL-route them to `peter_parker:renderer_primitives` if the build trips them.

**DC Pandey check:** No formula, derivation order, example problem, or figure imported. The planar-Gauss derivation (pillbox, two caps, A-cancellation, the ½) is from first principles. The xerox-drum anchor, the "walk twice as far, field unchanged" secondary anchor, the 1:1 ratio question (Q5), and the σ/2ε₀-vs-σ/ε₀ question (Q6) are authored, not lifted.

---

## 1. physics_engine_config.variables

Mirrors `gauss_law_line` / `gauss_law_sphere` demo-scaling (`DEMO_E_PER_NC = 225`, `epsilon_0 = 8.854e-12`, `k = 8.99e9`; locked constants declared `min=max=default`). New slider variables: `sigma` + `d` (both in STATE_7). `A` is a fixed demo cap area (NOT a slider — STATE_5's whole point is that A cancels). **Critical inversion vs the line:** `d` is a POSITION (sheet→field-point distance), NOT a divisor — it must never appear in `E_demo` / `E_real`.

```json
"variables": {
  "sigma": {
    "name": "Surface charge density on the sheet",
    "unit": "demo nC/m^2",
    "min": -2, "max": 3, "default": 1, "step": 0.5
  },
  "d": {
    "name": "Perpendicular distance from the sheet to the field point (a POSITION, not a divisor — E does not depend on it)",
    "unit": "demo units",
    "min": 0.3, "max": 4.0, "default": 2.0, "step": 0.05
  },
  "A": {
    "name": "Area of each flat pillbox cap (a patch of sheet; cancels out of E)",
    "unit": "demo units^2",
    "min": 1.0, "max": 4.0, "default": 2.0, "step": 0.1
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
    "name": "Demo field readout per nanocoulomb-per-square-metre of sigma (CONSTANT — independent of distance)",
    "unit": "demo (N/C) per (nC/m^2)",
    "min": 225, "max": 225, "default": 225, "step": 1
  }
}
```

Variable notes (for json-author):
- `sigma` range −2..3 mirrors the line `lambda` / sphere `q` range so the sign-of-charge colour logic (outward +σ red / inward −σ blue) carries over verbatim. default 1 (a clean positive sheet).
- `d` clamp: there is NO physical divergence here (E is constant, no `1/d`), so the clamp is needed ONLY by the two STATE_6 contrast ghosts (`line_ghost`, `point_ghost`), which DO divide by d. They use `Math.max(d, 0.05)` defensively. **`E_demo` / `E_real` deliberately have no clamp and no `d` at all** — clamping `d` in the real field would be a code-smell signalling a wrong `/d`. default 2.0 (mid-range, where the flat sheet line sits clearly above the falling ghosts).
- `A` is NOT a slider. Fixed demo cap area (default 2.0). STATE_5 payoff is that **A cancels** (it appears on both sides of `2EA = σA/ε₀` and divides out); an A slider would teach the opposite. Declared with min/max only so the renderer can draw + label the cap; **no `slider_controls.A`**.
- `epsilon_0`, `k`, `DEMO_E_PER_NC` are locked constants (min=max=default), identical to the line/sphere. `DEMO_E_PER_NC = 225` reused so the flat sheet line, the `1/d` line ghost and the `1/d²` point ghost all CROSS exactly at d=1 (all read `225*σ`) — a clean shared start before the ghosts fall away and the sheet line holds.

**Bug #1 (`default_variables_only_first_var_merged`) compliance:** every variable with a non-1 default (`d=2.0`, `A=2.0`, `epsilon_0`, `k`, `DEMO_E_PER_NC=225`) is explicitly declared here so json-author wires each through `default_variables`; none falls back to 1 at runtime.

---

## 2. computed_outputs

```json
"computed_outputs": {
  "E_demo": { "formula": "DEMO_E_PER_NC * sigma" },
  "E_real": { "formula": "(sigma * 1e-9) / (2 * epsilon_0)" },
  "q_enc": { "formula": "sigma * A" },
  "flux_check": { "formula": "(sigma * 1e-9 * A) / epsilon_0" },
  "line_ghost": { "formula": "DEMO_E_PER_NC * sigma / Math.max(d, 0.05)" },
  "point_ghost": { "formula": "DEMO_E_PER_NC * sigma / (Math.max(d, 0.05) * Math.max(d, 0.05))" }
}
```

**The single most important line: `E_demo` has NO `/d`.** This is the whole concept. `E_demo = DEMO_E_PER_NC * sigma`, full stop — the demo field is the SAME number at every distance. Likewise `E_real = (sigma*1e-9)/(2*epsilon_0)` has no `d` term. The `½` lives in the `2 *` in the denominator (two caps). `line_ghost` and `point_ghost` are the ONLY outputs that touch `d`, and only because they are the STATE_6 falling-curve contrasts (display-only; no real line/point charge placed).

Algebra verification (the A-cancellation + the ½ from two caps):

```
Gauss:                 Phi = q_enc / eps0
Enclosed charge:       q_enc = sigma*A                  (charge on a patch of sheet of area A, one cap's worth)
Symmetry-reduced flux: Phi = E*A (cap 1) + E*A (cap 2) = 2EA   (wall = 0; flux leaves through BOTH caps)
Set equal:             2EA = sigma*A / eps0
A cancels:             2E  = sigma  / eps0              <- A on both sides cancels
Solve:                 E   = sigma / (2*eps0)
```

The A genuinely cancels — it multiplies both `q_enc` (one cap's worth of enclosed charge) and the flux (`E·A` per cap), so it divides out, leaving an answer with no A. That is why `E_demo` and `E_real` have no A term, while `q_enc` and `flux_check` (pillbox content, not field) do.

**The ½ is REAL and structural, not a slip.** It comes from the `2` in `2EA` — flux leaves through **two** caps. A conductor surface / one plate of a capacitor has flux through **one** cap only (the field is zero inside the conductor), giving `EA = σA/ε₀ ⇒ E = σ/ε₀`. Single isolated sheet = `σ/(2ε₀)`; conductor face / between two plates = `σ/ε₀`. This concept owns the `σ/(2ε₀)` case; `σ/ε₀` is explicitly OUT of scope (the NEXT concept).

Numerical confirmation (run):
- **Constancy:** `E_demo(σ=1)` at d = 0.3, 1, 2, 4 → 225, 225, 225, 225 — IDENTICAL. E does not depend on d. OK
- **A-cancellation:** `2EA = σA/ε₀` solved for E with σ=1 nC/m², A=1.0 → 56.47 N/C; with A=7.3 → 56.47 N/C — identical. A truly cancels. OK
- **The ½:** single sheet `σ/(2ε₀)` = 56.47 N/C; conductor `σ/ε₀` = 112.9 N/C — exactly 2×. The factor-of-two is honest. OK
- **`E_real`** for σ = 0.5, 1, 2, 3 nC/m² → 28.24, 56.47, 112.9, 169.4 N/C. Linear in σ, no d. OK
- **`flux_check` = q_enc/ε₀:** σ=1 nC/m², A=2 → 225.9 (= 2·E_real·A, the two-cap flux). OK

The flat-sheet-vs-falling-ghosts contrast (STATE_6 — PRIMARY aha):

| quantity | law | d=0.5 | d=1 | d=2 | d=4 |
|---|---|---|---|---|---|
| `E_demo` (sheet, CONSTANT) | `225*σ` | **225** | **225** | **225** | **225** |
| `line_ghost` (1/d) | `225*σ/d` | 450 | 225 | 112.5 | 56.25 |
| `point_ghost` (1/d²) | `225*σ/d²` | 900 | 225 | 56.25 | 14.06 |

All three meet at d=1 (all `225*σ`), then the two ghosts fall away while the sheet line **holds dead flat above them** for all d>1 — the field that never dies. `line_ghost` and `point_ghost` are display-only (no real charge placed) — same σ-driven 225 scaling as `E_demo` but with `/d` and `/d²`, so the three curves are honestly comparable. json-author: use `line_ghost` (1/d) + `point_ghost` (1/d²) for the STATE_6 faint falling ghosts ONLY.

---

## 3. formulas + constraints

No angle arguments here (planar electrostatics, no sin/cos/RHR; skeleton 10(c) documents RHR as N/A - sign of sigma sets direction). No radians() needed.

```json
"formulas": {
  "gauss_law":            "Phi = q_enc / epsilon_0",
  "enclosed_charge":      "q_enc = sigma * A",
  "symmetry_reduction":   "Phi = E*A + E*A = 2*E*A",
  "set_equal":            "2*E*A = (sigma * A) / epsilon_0",
  "A_cancels":            "2*E = sigma / epsilon_0",
  "solved_field":         "E = sigma / (2 * epsilon_0)",
  "factor_two_origin":    "the 1/2 comes from flux leaving BOTH caps (2EA); a single cap / conductor face gives sigma/epsilon_0",
  "falloff_constant":     "E is constant - independent of distance d (NOT 1/r like a line, NOT 1/r^2 like a point)",
  "direction":           "E perpendicular to the sheet, pointing away on BOTH sides for +sigma (toward for -sigma), equal everywhere"
}
```

Formula rigor check (each line, unit-checked):
- gauss_law - [Phi]=N*m^2/C; [q_enc/eps0]=C/(C^2*N^-1*m^-2)=N*m^2/C. OK (the Gauss STATEMENT, a prerequisite, carried in as the start, not re-derived).
- enclosed_charge - [sigma*A]=(C/m^2)*m^2=C. OK (the pillbox encloses one cap-area patch of sheet).
- symmetry_reduction - both caps pierced, wall grazed (Phi_wall=0). Each cap area = A, |E| constant and perpendicular to each cap, so each cap contributes E*A; TWO caps => 2EA. [2EA]=N*m^2/C=flux. OK. E pulled out because |E| is constant on the caps and perpendicular to them.
- set_equal - two flux expressions equated; both sides N*m^2/C. OK
- A_cancels - A divides out of both sides (verified A=1.0 vs A=7.3 give identical E). The reveal strikes the A. OK
- solved_field - [sigma/(2 eps0)]=(C/m^2)/(C^2*N^-1*m^-2)=N/C. OK
- factor_two_origin - the 1/2 is two caps; conductor/one-plate = sigma/eps0 (single cap, field zero inside conductor). Numerically 56.47 vs 112.9 N/C (exactly 2x). OK
- falloff_constant - qualitative: E has no d. Contrast statement for STATE_6. OK
- direction - perpendicular to sheet, away on BOTH sides for +sigma (toward for -sigma), equal everywhere; sign sets outward/inward. OK

```json
"constraints": [
  "E is perpendicular to the sheet everywhere, pointing away on BOTH sides for +sigma (toward the sheet on both sides for -sigma); E parallel n-hat (C1).",
  "|E| is CONSTANT at every point on either side: it does NOT depend on the perpendicular distance d, and does NOT depend on where along the sheet you stand (in-plane position) (C2 - the INVERSE of the line's r-dependence).",
  "The flux leaves through the TWO flat caps; the curved WALL of the pillbox carries ZERO flux because E grazes it (E.dA_wall = 0) - the exact INVERSE of the cylinder, where the wall carried flux and the caps were zero (C3).",
  "Total flux = both caps: Phi = E*A + E*A = 2*E*A = q_enc/epsilon_0 = sigma*A/epsilon_0; the A cancels, giving E = sigma/(2*epsilon_0) (C4).",
  "E does NOT fall off with distance (it is constant): walk twice as far and E is unchanged - unlike a line (1/r, doubling r halves E) or a point (1/r^2, doubling r quarters E) (C5).",
  "The field is constant because the pillbox encloses the SAME patch of charge sigma*A however far out its caps sit, while a Gaussian sphere/cylinder keeps growing - so here the enclosed charge over the cap area is fixed (C6).",
  "The 1/2 is structural: it comes from flux leaving BOTH caps (2EA). A single isolated sheet gives sigma/(2*epsilon_0); a conductor face or one plate between two plates gives sigma/epsilon_0 (one cap, field zero inside the conductor) - twice as large (C7).",
  "Arrow direction follows the sign of sigma: away from the sheet on both sides for +sigma, toward the sheet for -sigma; magnitude scales linearly with |sigma| and is the same at every distance (C8)."
]
```

These mirror the line's C1-C8 but INVERTED: C2 = constant (not 1/r); C3 = caps carry / wall zero (not wall carries / caps zero); C4 = 2EA over A cancels (not E*2 pi r L over L cancels); C5/C6 = no falloff (not 1/r); C7 = the 1/2 + the sigma/eps0 conductor distinction (new - the line had no factor to confront); C8 = constant magnitude at every distance.

Edge-case flags for json-author:
- No 1/d divergence: because E_demo/E_real have no d, there is no blow-up at d=0. The Math.max(d, 0.05) clamp lives ONLY in the two STATE_6 ghosts. If json-author ever sees a /d creep into E_demo, that is the inversion scar - reject it.
- sigma = 0 (reachable via step 0.5 from -2): E = 0, arrows vanish. Correct. Renderer should HIDE arrows at sigma=0, not draw zero-length stubs.
- Negative sigma: arrows point TOWARD the sheet on both sides, recoloured per-sign (C8). Per teach_color_each_element_by_its_own_sign: colour the +/- sigma markers + arrows by sigma's OWN sign; only the readout follows the net.

---

## 4. Per-state within-state reveal timeline (REQUIRED, session 33)

All TTS plain English, <=30 words per sentence, photocopier/laser-printer-drum anchor, no Hinglish. Pre-spoil guard: no sentence in STATE_1 through STATE_4 names epsilon-nought OR the solved formula E = sigma over 2 eps0. epsilon-nought first appears in s5_1; the solved formula first in s5_3; the constant / never-dies verdict first at STATE_6.

at_ms tuned to cumulative narration pacing (teach_reveal_synced_to_narration). pause_after_ms on prediction beats gives think-time. EVERY pause_after_ms below MUST be carried into the JSON (solenoid_dropped_prediction_pauses_x4). The three the architect flagged are bolded.

### STATE_1, Hook (advance_mode: wait_for_answer)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s1_1 | Picture the big flat drum inside a photocopier, charged evenly all over its face, ready to lay toner down across a whole page. | sheet + sigma plus-markers populate | markers_populate | 0 | none |
| s1_2 | As you walk straight out from a big charged sheet, how does its field weaken with distance, and what is your first guess for the law? | none (prediction question; proportionality form only, NO eps0) | none | 5200 | **2600** |

- Reveal: none fires (resolution withheld to STATE_5/6). On-canvas: the sheet + plus-markers only. NO field arrows, NO formula, NO eps0.
- Pre-spoil check: s1_1/s1_2 name neither eps0 nor the formula. The question plants the inverse-square / falloff instinct deliberately (Rule 16a, an earned wrong belief, broken at STATE_6). OK

### STATE_2, perpendicular-both-sides reveal (advance_mode: auto_after_tts)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s2_1 | Point at P, one step off the face. Which way does the field push there, along the sheet, slanting toward the nearest charge, or straight out? | field point P marker | show | 0 | 2600 |
| s2_2 | The sheet looks the same from every direction in its plane, so the field can only point straight out, at right angles, away on BOTH faces. | equal-length arrows straight out (perp) on both faces + d-perp line | fade_in + d_line_grow | 8000 | none |
| s2_3 | And every arrow has the same length, the same strength everywhere, at this distance d. | symmetry label, E parallel n-hat both sides, magnitude equal | slide_in | 14000 | none |

- Reveal binding: s2_2 grows the d-perp reference line LIVE as straight-out-at-right-angles is said, and raises equal arrows on BOTH faces (teach_show_quantity_live_when_named). The d-line billboards camera-right (field3d_position_vector_foreshortened_3q_camera).
- Pre-spoil check: proportionality form only; no eps0, no formula. Confronts misconception #4 (field along sheet / toward nearest charge). OK

### STATE_3, Gaussian-pillbox reveal (advance_mode: manual_click)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s3_1 | We could add up Coulombs law from every tiny patch, slow. Instead we pierce the sheet with one closed surface. A sphere, a cylinder along, or a flat pillbox? | faded carryover arrows | hold | 0 | 2400 |
| s3_2 | A short pillbox, its two flat caps parallel to the sheet on each side, its curved wall piercing through. It matches the flat shape of the sheet. | pillbox fades in (two caps + curved wall + half-height line) | fade_in + halfheight_line_grow | 8600 | none |
| s3_3 | Give each flat cap an area A. The field is straight out, so it pokes square through each cap. | cap-area label A written on a cap face | slide_in + A_label_write | 15200 | none |

- Reveal binding: s3_2 fades the pillbox in; the axial half-height line grows (a DISTINCT line from d - teach_distinct_reference_lines_for_two_radii). s3_3 writes the cap-area A label ON the cap when area A is said. Three reference quantities now on screen: d-perp (camera-right, STATE_2 carryover), pillbox half-height (axial), and cap-area A (a label on the cap, never a distance).
- Pre-spoil check: A is the cap area (geometry, allowed). No eps0, no solved formula yet. Folds in the one-surface-replaces-the-sum idea (one pillbox replaces the patch-by-patch Coulomb sum). OK

### STATE_4, wall-zero-flux reveal (SUPPORTING aha; INVERSE of the line) (advance_mode: wait_for_answer)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s4_1 | The pillbox has three pieces, two flat caps and one curved wall. Which pieces does the field actually pierce? | none (prediction question) | none | 0 | **2800** |
| s4_2 | The field is straight out, so along the curved wall it just grazes the surface, never poking through. Zero flux on the wall. With the wire, it was the exact opposite. | grazing wall arrows + Phi=0 wall tag + inverse-of-wire callback | fade_in + wall_tag | 8500 | none |
| s4_3 | It pierces straight through both flat caps. So the whole flux is the two caps together, E times A, plus E times A. | piercing cap arrows + label Phi = 2 E A | fade_in | 14500 | none |

- Reveal binding: s4_2 draws grazing wall arrows + a Phi=0 tag on the WALL (the inverse of the line, where the wall carried flux) + an explicit with-the-wire-it-was-the-exact-opposite callback; s4_3 shows BOTH caps pierced and carries Phi = 2EA into STATE_5.
- Pre-spoil check: Phi = 2EA is the symmetry-reduced flux (geometry + carried-in Gauss setup), NOT the solved field and NOT eps0. OK. Confronts misconception #2 (the curved wall carries flux too) - the SUPPORTING aha, the exact INVERSE of the cylinder.

### STATE_5, derivation reveal (confront sigma/eps0 vs sigma/2eps0) (advance_mode: manual_click)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s5_1 | How much charge sits inside the pillbox? Just the charge on one patch of sheet, that is sigma times A. By Gauss, the flux equals sigma-A over epsilon-nought. | q_enc = sigma A + label Phi = sigma A over eps0 (eps0 FIRST appears) | write_in | 0 | none |
| s5_2 | Now we have two expressions for the same flux. Set them equal and solve for E, and watch the area A, and where the factor of two lands. | none (prediction question) | none | 9500 | **2500** |
| s5_3 | The area A on each side cancels. Two E equals sigma over epsilon-nought, so E is sigma over two epsilon-nought. The two is the two caps. | write-in 2 E A = sigma A over eps0, then A struck, leaving E = sigma over 2 eps0, with the half highlighted two-caps | derivation_write + A_strike + half_highlight | 16000 | none |
| s5_4 | The area A is gone, it never mattered how big a patch you wrapped. And the two is real, both caps, so a single sheet is sigma over two epsilon-nought, not sigma over epsilon-nought. | final E = sigma over 2 eps0, focal_highlight + sigma/eps0 tagged conductor / two-plate case | focal_highlight | 23000 | none |

- Reveal binding: s5_3 runs the write-in panel: writes 2EA = sigma A over eps0, visibly strikes the A on both sides (A_strike), leaving E = sigma over 2 eps0, and highlights the 1/2 with a two-caps tag (half_highlight). This is the visual that makes both A-cancels AND the-half-is-two-caps honest. s5_4 tags sigma/eps0 as the conductor/two-plate case (out of scope, named only to draw the boundary).
- Pre-spoil check: eps0 DELIBERATELY first appears here (s5_1) per the cut-line. The solved formula first appears in s5_3. Everything before STATE_5 was clean. OK. Confronts misconception #3 (E = sigma/eps0, half dropped).

### STATE_6, PRIMARY aha (the field that never dies) (advance_mode: manual_click)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s6_1 | You already know a point charge fades as one over r squared, and a wire as one over r. Here are those two curves, drawn faint, falling away. | point_ghost (1/d^2) + line_ghost (1/d) curves, faint, falling, FIRST | ghosts_draw | 0 | none |
| s6_2 | Back at the start you probably guessed the sheet fades too. Does it? Watch the sheet own line as you walk away. | none (prediction; recalls STATE_1 guess) | none | 6500 | **2800** |
| s6_3 | The sheet line stays dead flat, above the two falling curves, the same at every distance. It does not fade at all. | E_demo flat line drawn ABOVE the ghosts + coordinated_sweep (d grows, arrow length CONSTANT, sheet dot rides flat, ghost dots fall) | line_draw + coordinated_sweep | 12000 | none |
| s6_4 | Why? The pillbox always wraps the same patch of charge, sigma times A, however far out the caps sit, while a sphere or cylinder keeps growing. The field that never dies. | same-patch label, sigma*A fixed vs sphere/cylinder growing | slide_in | 22500 | none |

- Reveal binding: concrete-first (teach_concrete_before_abstract_compare). The 1/d^2 point ghost + 1/d line ghost draw FIRST, faint and falling, at s6_1; THEN the flat sheet line is drawn ABOVE them at s6_3 with the live coordinated_sweep (d grows; the 3D arrow length stays CONSTANT; the sheet plot-dot rides flat while the two ghost dots fall - teach_coordinate_sim_with_graph). All three meet at d=1 (each 225*sigma) and the sheet diverges UPWARD (stays flat while ghosts fall) for d>1.
- Reveal-too-subtle guard: the coordinated_sweep is continuous motion of the d-position + the moving plot dots (above 0.1%/frame), satisfies D7 (field3d_reveal_too_subtle_fails_d7). Critical inversion note for the renderer: the sheet arrow length must NOT shrink as d slides - the motion that proves the aha is the arrow holding its length while its POSITION moves (the inverse of the line, where the arrows shrank). FLAG to renderer: register this in deriveStateMeta as motion, and read DENSE ramp frames (a frozen end-frame would hide a sheet line that wrongly droops).

### STATE_7, Exploration (advance_mode: interaction_complete)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s7_1 | Now you drive. Push sigma up, every arrow on both faces grows together, and the readout climbs. | sigma slider + both-face arrows (live) | slider_live | 0 | none |
| s7_2 | Drag the field point away from the sheet. The arrows do NOT shrink, and the readout does NOT move. It is constant. | d slider + field point moves out, arrow length held, flat readout (live) | slider_live | 6500 | none |
| s7_3 | The field depends only on sigma, never on your distance from the sheet. | persistent label E = sigma over 2 eps0 (constant) | hold | 12500 | none |

- Reveal binding: sliders render at full immediately and track live (field3d_time_gated_visual_invisible_in_slider_state, no clock-gated emergence). The d slider physically MOVES the field-point/arrow position while the arrow length is HELD CONSTANT (the constancy proof). FLAG to renderer: STATE_7 needs an idle auto-sweep of d OR interactive classification so D1p does not false-fail on a static headless capture (field3d_explorer_state_static_d1p); and the moving field point must not occlude the pillbox / readout (amperes-review occlusion class).

Pre-spoil audit (whole concept): scanned every sentence s1_1 to s7_3. The string epsilon / eps0 appears first in s5_1; sigma-over-two-epsilon-nought first in s5_3; the constant / never-fades / never-dies verdict first at s6_3/s6_4. STATE_1 through STATE_4 are clean. PASS.

---

## 5. Per-state variable_overrides (value locks)

Defensive-locking pattern (hinge_force.json STATE_4 F_ext:0; field_forces.json STATE_5 m:1). The values mostly live in the field_3d_config per-state gauss_sheet blocks (mirroring the line gauss_line blocks), but these per-state value locks are REQUIRED so an upstream default_variables leak or a STATE_7 slider drag cannot bleed a wrong sigma/d into a guided state:

| state | override | why |
|---|---|---|
| STATE_1 | sigma: 1 (no arrows shown) | Hook: positive sheet, but NO field arrows/formula drawn. Lock sigma so a leaked negative sigma cannot tint the "+" markers wrong. |
| STATE_2 | sigma: 1, d: 2.0 | Both-face arrows drawn at a specific d; narration says distance d, so the d-line must grow to this fixed length, not a leaked STATE_7 value. |
| STATE_3 | sigma: 1, d: 2.0, A: 2.0 | Pillbox drawn at fixed (d, A); the cap-area A label writes to A=2.0. Lock all three. |
| STATE_4 | sigma: 1, d: 2.0, A: 2.0 | Wall-vs-caps contrast at the same fixed pillbox. |
| STATE_5 | sigma: 1, d: 2.0, A: 2.0 | Derivation write-in references the SAME pillbox; A must equal 2.0 so A-cancels is visually honest against the drawn A label. |
| STATE_6 | sigma: 1; d swept 0.5 to 3.6 via coordinated_sweep (NOT a slider) | PRIMARY aha. Lock sigma=1 so all three curves share the 225 crossover at d=1; d is animated by the sweep, not student-driven. The sheet arrow length must NOT change as d sweeps - only its POSITION. |
| STATE_7 | none, sliders own sigma and d live | Explorer. sigma + d are student-driven; render at full immediately (no clock-gated emergence). |

json-author: carry these as the per-state gauss_sheet block values (mirror how the line stores them inside field_3d_config.states.STATE.gauss_line, NOT as top-level variable_overrides). Either location is acceptable; the LOCK is what matters.

---

## 6. Per-state misconception_watch (Rule 16a, EPIC-L-internal)

One entry per STATE_1 through STATE_6 (skeleton section 4). Each one_line_fix physics-checked.

```json
"STATE_1": [{
  "belief": "The field of a charged sheet must weaken with distance, the way a point charge (1/r^2) or a wire (1/r) does.",
  "visual_counter": "The hook shows only the sheet and its charge markers - no field law yet; the guess is held until STATE_6 reveals the sheet line staying dead flat above the two falling ghosts.",
  "one_line_fix": "A big sheet is not a point or a wire: its field is CONSTANT, the same at every distance - proven at STATE_6."
}],
"STATE_2": [{
  "belief": "The field points along the sheet, or slants toward the nearest bit of charge.",
  "visual_counter": "Equal-length arrows point straight out, perpendicular to the sheet, away on BOTH faces; sliding along the sheet leaves the picture unchanged.",
  "one_line_fix": "Planar symmetry forces E to be perpendicular to the sheet and equal in magnitude, pointing away on both sides."
}],
"STATE_3": [{
  "belief": "You must add up Coulombs law from every tiny patch of the sheet to get the field.",
  "visual_counter": "One pillbox piercing the sheet replaces the patch-by-patch sum; its caps are parallel to the sheet, so the field pokes straight through them.",
  "one_line_fix": "Gauss plus planar symmetry replaces the patch-by-patch Coulomb integral with one pillbox and one equation."
}],
"STATE_4": [{
  "belief": "The curved wall of the pillbox carries flux too, so it belongs in the calculation.",
  "visual_counter": "Arrows graze along the curved wall (Phi = 0 tag) while piercing both flat caps; only the two caps carry flux - the exact INVERSE of the cylinder.",
  "one_line_fix": "E is perpendicular to the sheet, so it grazes the curved wall (E dot dA = 0); only the two caps carry flux, total 2EA."
}],
"STATE_5": [{
  "belief": "The single-sheet field is sigma over epsilon_0 (the factor of one-half gets dropped).",
  "visual_counter": "The write-in shows 2EA = sigma A over epsilon_0; the 2 is tagged two-caps, and the solved field is sigma over 2 epsilon_0, with sigma over epsilon_0 tagged as the conductor / two-plate case.",
  "one_line_fix": "Flux leaves through BOTH caps (2EA), so a single isolated sheet gives sigma/(2 epsilon_0); a conductor face or one plate gives the doubled sigma/epsilon_0."
}],
"STATE_6": [{
  "belief": "The sheet field must fade with distance eventually - surely it weakens far away like everything else.",
  "visual_counter": "The sheet flat line holds dead level above the falling 1/r and 1/r^2 ghosts; the 3D arrow does NOT shrink as the field point slides away - only its position moves.",
  "one_line_fix": "The field is constant because the pillbox always encloses the same patch sigma*A however far out the caps sit - so E never depends on distance."
}]
```

Physics check on each one_line_fix: all six are correct physics, not merely persuasive. STATE_6 (constant because the pillbox encloses the same sigma*A patch at any distance) is the exact A-cancellation of section 2. STATE_5 (both caps => 2EA => sigma/(2 eps0) not sigma/eps0) is the numerically-verified 56.47-vs-112.9 N/C contrast. STATE_4 (E grazes the curved wall so E.dA_wall=0, only caps carry flux) is C3. PASS.

---

## 7. PRIMARY-aha + SUPPORTING-aha physics check

PRIMARY aha (STATE_6). <=15-word headline for aha_moment.statement (json-author, keep at <=15 words; em-dash counts as a token; aha_statement_exceeds_15_words guard):

> An infinite sheet field is constant - it never fades with distance, unlike a line or point.

Word count: An(1) infinite(2) sheet(3) field(4) is(5) constant(6) dash(7) it(8) never(9) fades(10) with(11) distance(12) unlike(13) a(14) line(15). Trailing "or point" dropped to land at 15 tokens. Physically TRUE (verified numerically: E_demo = 225 at d = 0.3, 1, 2, 4 - identical; E_real has no d term). STATE_6 coordinated_sweep (arrow length held while d-position moves, sheet dot flat while ghost dots fall) actually demonstrates it. PASS, not wrong-but-memorable.

SUPPORTING aha (STATE_4): The curved wall carries zero flux (E grazes it); only the two flat caps count - the exact INVERSE of the wire/cylinder. Physically TRUE (C3: E perpendicular to sheet => E parallel to curved-wall surface => E.dA_wall = 0; both caps pierced => Phi = 2EA). Causally linked to the primary: caps-carry => Phi = 2EA over a FIXED cap area A (q_enc = sigma A over the SAME A) => A cancels => no d => constant. The half and the constancy both flow from two-caps-over-a-fixed-patch. PASS. 1 PRIMARY + 1 SUPPORTING = sweet spot.

Wrong-belief setup (architect Block 2): S1 -> S6 (falloff guess; S5 hands E = sigma/(2 eps0) with no d in it, S6 proves it never fades); S3 -> S4 (closed-surface => flux-on-every-face; line-veterans expect the inverse and get it). Confirmed honoured.

---

## 8. Six-question assessment + coverage_map

Per skeleton section 10(f): Q1 -> E=sigma/2eps0, perp, both sides (STATE_5); Q2 -> perp/both sides (STATE_2); Q3 -> only caps carry flux, wall Phi=0 (STATE_4); Q4 -> CONSTANT, no falloff, PRIMARY aha (STATE_6); Q5 -> E same at d and 2d, ratio 1:1, stretch (STATE_6); Q6 -> why sigma/2eps0 not sigma/eps0, stretch (STATE_5). Every keyed answer verified correct; every distractor is a real wrong belief that yields that option.

```json
"assessment": {
  "mastery_definition": "A student has mastered the field of an infinite charged sheet when they can (1) state E = sigma/(2*epsilon_0), perpendicular to the sheet and pointing away on both sides; (2) explain that planar symmetry makes E perpendicular and equal on each cap, so a Gaussian pillbox gives Phi = E*A + E*A = 2*E*A = q_enc/epsilon_0; (3) show that the curved wall carries zero flux because E grazes it, so only the two flat caps count - the inverse of the cylinder; (4) show that the cap area A cancels, so E depends only on sigma and never on the distance from the sheet or on where along it you stand; and (5) recognise that the field is CONSTANT - it does not fall off with distance, unlike a line (1/r) or a point (1/r^2) - and that the factor of one-half comes from flux leaving both caps, so a single isolated sheet gives sigma/(2*epsilon_0), not the conductor/two-plate sigma/epsilon_0.",
  "questions": [
    {
      "q_id": "Q1",
      "stem": "An infinite plane sheet carries uniform surface charge density sigma. What is the electric field at a perpendicular distance d from the sheet?",
      "options": {
        "A": "E = sigma/(2*epsilon_0) - perpendicular to the sheet, pointing away on both sides, the same at every distance",
        "B": "E = sigma/epsilon_0 - perpendicular to the sheet",
        "C": "E = sigma/(2*epsilon_0*d) - perpendicular, falling off as 1/d",
        "D": "E = sigma*d/(2*epsilon_0) - growing with distance from the sheet"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "drops the factor of one-half - uses the single-cap conductor/two-plate result for an isolated sheet",
        "C": "invents a 1/d falloff, as if the sheet field weakened with distance like a wire",
        "D": "thinks the field grows with distance from the sheet"
      },
      "tested_idea": "The field of an infinite charged sheet is E = sigma/(2*epsilon_0), perpendicular, both sides, and constant.",
      "teaches_state": "STATE_5",
      "difficulty": "core",
      "parallel_form_stem": "The flat drum of a photocopier holds uniform surface charge sigma. Write the electric field a toner speck feels a small distance out from the drum face."
    },
    {
      "q_id": "Q2",
      "stem": "At a point P just off the face of an infinite charged sheet, in what direction does the electric field point?",
      "options": {
        "A": "Perpendicular to the sheet, straight out, away on both sides",
        "B": "Parallel to the sheet, lying in its plane",
        "C": "Slanting toward the nearest patch of charge on the sheet",
        "D": "Curving around the edge of the sheet"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "thinks the field runs along the sheet rather than out from it",
        "C": "imagines the field aiming at the closest bit of charge instead of being purely perpendicular",
        "D": "confuses an infinite sheet field with edge/fringe effects of a finite plate"
      },
      "tested_idea": "Planar symmetry makes E perpendicular to the sheet, pointing away on both faces.",
      "teaches_state": "STATE_2",
      "difficulty": "core",
      "parallel_form_stem": "Hold a tiny positive test charge near the middle of a large flat charged metal plate. Which way does the force on it point relative to the plate?"
    },
    {
      "q_id": "Q3",
      "stem": "A Gaussian pillbox (a short cylinder, caps parallel to the sheet on each side) pierces an infinite charged sheet. Through which part of its surface does the flux pass?",
      "options": {
        "A": "Only the two flat caps; the curved side wall carries zero flux",
        "B": "Only the curved side wall; the two caps carry zero flux",
        "C": "Equally through the curved wall and both caps",
        "D": "Through all three pieces, but mostly through the curved wall"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "inverts the result - this is the cylinder/wire case, where the wall carried flux and the caps were zero",
        "C": "thinks every face of a closed surface must carry flux",
        "D": "imagines the field leaking mostly out of the curved side"
      },
      "tested_idea": "E is perpendicular to the sheet, so it grazes the curved wall (E dot dA = 0); only the two caps carry flux.",
      "teaches_state": "STATE_4",
      "difficulty": "core",
      "parallel_form_stem": "You push a soup-can-shaped Gaussian surface through a charged sheet so its flat lids sit on each side. Which faces of the can does the field actually pass through?"
    },
    {
      "q_id": "Q4",
      "stem": "How does the field of an infinite charged sheet change as you walk away from it, compared with a point charge and a wire?",
      "options": {
        "A": "It stays constant - it does not weaken with distance at all, while the point fades as 1/r^2 and the wire as 1/r",
        "B": "It falls off as 1/r^2, the same as a point charge",
        "C": "It falls off as 1/r, the same as a wire",
        "D": "It falls off faster than a point charge because a sheet has the most charge"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "applies the point-charge 1/r^2 falloff to a sheet",
        "C": "applies the wire 1/r falloff to a sheet",
        "D": "thinks more charge means faster falloff, confusing total charge with the field law"
      },
      "tested_idea": "The sheet field is constant (no falloff) because the pillbox encloses the same sigma*A patch at any distance, unlike a growing sphere/cylinder.",
      "teaches_state": "STATE_6",
      "difficulty": "stretch",
      "parallel_form_stem": "Walking away from a big charged photocopier drum versus away from a single charged ball - whose field dies away, and whose stays the same?"
    },
    {
      "q_id": "Q5",
      "stem": "A probe at perpendicular distance d from an infinite charged sheet reads field E1. It is moved out to 2*d. What does it read now?",
      "options": {
        "A": "E1 - the field is the same at every distance from an infinite sheet",
        "B": "E1/2 - the field halves when the distance doubles",
        "C": "E1/4 - the field quarters when the distance doubles, like a point charge",
        "D": "2*E1 - the field doubles as you move the probe outward"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "applies a wire-like 1/d (half) falloff to a sheet",
        "C": "applies the point-charge 1/d^2 (quarter) falloff to a sheet",
        "D": "believes the field increases with distance from the sheet"
      },
      "tested_idea": "E is constant, so doubling the distance leaves the field unchanged - the ratio is 1 to 1 (vs half for a wire, quarter for a point).",
      "teaches_state": "STATE_6",
      "difficulty": "stretch",
      "parallel_form_stem": "Near a large charged plate a pith ball feels field E1 at 2 centimetres. What does it feel at 4 centimetres from the plate?"
    },
    {
      "q_id": "Q6",
      "stem": "Using a Gaussian pillbox on an isolated charged sheet gives E = sigma/(2*epsilon_0). A conductor surface (or one plate between two plates) gives E = sigma/epsilon_0 - twice as big. Where does the factor of two come from?",
      "options": {
        "A": "An isolated sheet sends flux out of BOTH caps (2EA); a conductor face has field on only ONE side (one cap), so its factor of two disappears",
        "B": "A conductor simply has twice as much charge as a sheet",
        "C": "It is a unit-conversion factor with no physical meaning",
        "D": "The isolated sheet result is wrong - every sheet gives sigma/epsilon_0"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "invents a charge difference instead of the one-cap-vs-two-cap flux geometry",
        "C": "dismisses the factor as bookkeeping rather than the two-cap origin",
        "D": "rejects the correctly derived isolated-sheet result sigma/(2 epsilon_0)"
      },
      "tested_idea": "The 1/2 comes from flux leaving both caps (2EA); a conductor face (field zero inside) has flux through one cap, giving the doubled sigma/epsilon_0.",
      "teaches_state": "STATE_5",
      "difficulty": "stretch",
      "parallel_form_stem": "A single isolated charged plate gives E = sigma/(2 epsilon_0), but the field just outside a charged conductor is sigma/epsilon_0. Explain the factor of two in terms of the pillbox caps."
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
- Q1 keyed A: E = sigma/(2 eps0), perp, both sides, constant - exact. Distractors B (sigma/eps0, half dropped), C (invented 1/d), D (grows with d) each a real belief. OK
- Q2 keyed A: perp both sides. D (edge/fringe) is a genuine finite-plate confusion. OK
- Q3 keyed A: only the two caps. B is the precise INVERSION trap (cylinder result on a sheet) - the load-bearing distractor for the inverted sibling. OK
- Q4 keyed A: constant, no falloff. The PRIMARY-aha question (STATE_6). B/C import the point/wire laws. OK
- Q5 keyed A: ratio 1:1 (E unchanged when d doubles; numerically verified 225 -> 225). Distractor B (half, wire), C (quarter, point), D (grows). OK
- Q6 keyed A: half = two caps; conductor = one cap = sigma/eps0. The sigma/2eps0-vs-sigma/eps0 stretch item. OK
- Gate 19 (coverage): every teaches_state real (STATE_2/4/5/6); non_assessed = STATE_1, STATE_3, STATE_7 partition the 7 states, no overlap. OK
- Gate 20 (quiz quality): every wrong option has a distractor_misconception; correct options NOT keyed; 6 distinct tested_idea; 2 questions hit the aha state (Q4 + Q5 both STATE_6); unique q_ids. OK
- Parallel forms physics-equivalent to originals (xerox-drum / charged-plate / soup-can re-skins, same physics). OK

---

## 9. Drill-down trigger phrases (skeleton section 6: 9 clusters, 5 phrasings each)

Real Indian 11th/12th student voice, plain English, no Hinglish, sounds confused (not like a teacher). These become trigger_examples TEXT[] in the Supabase cluster seed. Per skeleton section 6 the SQL ships ONE founder-locked cluster per hard state - recommended strongest: inverse_of_the_wire_caps (STATE_4), why_one_half_not_sigma_over_eps0 (STATE_5), why_field_is_constant_with_distance (STATE_6). All nine are authored below so json-author has them if the founder widens the seed.

### STATE_4 - wall-zero / caps-carry (the INVERSE of the line)

why_wall_zero_flux
- why does the curved wall have zero flux
- why no flux through the side of the pillbox
- why the curved part of the box has no field through it
- how come the wall doesnt count for flux
- shouldnt the side wall have some flux too

e_grazes_curved_wall
- why does E graze the curved wall
- how is the field parallel to the side wall
- why E dot dA is zero on the wall
- field slides along the wall meaning
- why does E lie flat along the curved side

inverse_of_the_wire_caps (strongest for STATE_4)
- why is the sheet opposite to the wire
- for the wire the wall had flux but here the caps why
- why did the caps and wall swap from the cylinder
- this is backwards from the line charge case
- in the wire the caps were zero now the caps carry flux why

### STATE_5 - the half + A cancels + conductor case

why_one_half_not_sigma_over_eps0 (strongest for STATE_5)
- why is it sigma over 2 epsilon not sigma over epsilon
- where does the factor of half come from
- why divide by 2 epsilon zero
- why one half in the sheet formula
- when is it sigma over epsilon and when sigma over 2 epsilon

where_did_area_A_go
- where did the area A go in the formula
- why does A cancel out
- why is there no A in the field
- the cap area just disappeared how
- what happened to the area of the cap

sigma_over_eps0_is_the_conductor_case
- when is the field sigma over epsilon zero
- why does a conductor give sigma over epsilon
- difference between a sheet and a conductor surface
- why does one plate give double the field
- between two plates is it sigma over epsilon or 2 epsilon

### STATE_6 - constant field, no falloff

why_field_is_constant_with_distance (strongest for STATE_6)
- why does the sheet field not weaken with distance
- why is the field constant no matter how far
- how can the field be the same everywhere
- why doesnt the sheet field fade like a point charge
- shouldnt it get weaker far from the sheet

same_q_enc_at_any_distance
- why is the enclosed charge the same at any distance
- why does the pillbox always wrap the same charge
- how is sigma A fixed however far out
- why doesnt the box enclose more charge further away
- the patch of charge stays the same size why

sheet_vs_line_vs_point_falloff
- difference between sheet line and point charge falloff
- why does a sheet not fall off but a wire does
- which one stays constant sheet wire or point
- why is a big sheet special compared to a wire
- sheet constant wire one over r point one over r squared why

---

## 10. field_3d_config handoff hints (for json-author)

Per skeleton Handoff section final line. json-author owns the full block; physics-relevant pins:
- scenario_type: "gauss_law_sheet"; explorer_id: "gauss_sheet_explorer" (Rule 27 stable ID).
- slider_controls.sigma (min -2, max 3, step 0.5, default 1) + slider_controls.d (min 0.3, max 4.0, step 0.05, default 2.0). NO slider_controls.A - A is a fixed demo cap area (it cancels; do not let students tune it).
- gauss_sheet_defaults: demo_e_per_nc: 225, epsilon_0: 8.854e-12, A_default: 2.0, sheet_half_extent (large, so the sheet reads as infinite - mirror the line line_half_length: 4.5).
- Per-state gauss_sheet blocks carry the section 5 value locks (sigma/d/A) + the section 4 reveal at_ms schedule.
- Cut-line INVERSION (the load-bearing handoff): FLAT E-vs-distance plot for the sheet + falling 1/d (line) and 1/d^2 (point) ghosts; caps flagged flux-bearing, wall Phi=0; show_constant_field: true (NOT a falloff flag). STATE_6 coordinated_sweep: true, sweep_d_min: 0.5, sweep_d_max: 3.6; ghosts (line_ghost then point_ghost) draw first/faint, sheet flat line second/above. The sheet arrow length must NOT change during the sweep - only the field-point position.
- STATE_7 d slider physically moves the field-point geometry while the arrow length is held constant (the constancy proof; acl_state8 lineage - move geometry, not just a readout).
- FLAG to json-author + quality_auditor (renderer-owned, FAIL-routes to peter_parker:renderer_primitives):
  (a) the new gauss_law_sheet scenario requires a deriveStateMeta.ts per-state reveal/hold/motion recognition block keyed on state.gauss_sheet - mirror the existing gauss_line block at deriveStateMeta.ts:343 (radial_arrow/emerge/caps_reveal/derivation/sweep/plot pins -> here: cap_arrow / emerge_d / wall_graze_reveal / derivation / sweep / plot) - in the SAME change;
  (b) STATE_7 needs an idle auto-sweep of d or interactive classification (D1p);
  (c) guided reveals sustain >0.1%/frame or reveal_hold (D7);
  (d) sliders render at full immediately, not clock-gated;
  (e) the d-line, A label, Phi=0 cap/wall tags, and the derivation panel must read over the translucent pillbox (depthTest=false + high renderOrder) and must not be occluded on S5/6/7 (amperes-review occlusion class);
  (f) re-check teach_inverted_scenario_inverts_cutline_flags: confirm E_demo has no /d, the FLAT plot is rendered (not a falling curve), and the caps (not the wall) glow as flux-bearing.
  These are surfaced, not actionable by json-author alone.

---

## 11. Self-review checklist

- [x] Every symbol in the state narratives (sigma, d, A, E, eps0, n-hat, q_enc, 2EA) declared in variables or appears in formulas/labels.
- [x] No radians() needed - planar electrostatics, no trig/RHR (skeleton 10(c) N/A documented; sign of sigma sets direction).
- [x] STATE_7 sliders declared with default/min/max/step (sigma, d); A deliberately NOT a slider (it cancels).
- [x] variable_overrides (value locks) documented per state with one-line justification (section 5).
- [x] Board mark scheme - N/A (Rule 20 board mode SUSPENDED; conceptual-only; output section 4 SKIPPED per spec).
- [x] Drill-down phrasings: 5 per cluster x 9 clusters, real student voice (section 9).
- [x] constraints: 8 short assertions C1-C8, INVERTED from the line (section 3).
- [x] Numerical sanity (RUN): E_demo constant (225 at d=0.3/1/2/4); A cancels (56.47 N/C at A=1.0 and A=7.3); single sheet sigma/2eps0 = 56.47 vs conductor sigma/eps0 = 112.9 (exactly 2x); ghosts cross at d=1 then fall while sheet holds flat; Q5 ratio 1:1. All confirmed.
- [x] Within-state reveal timeline for every state introducing a new quantity; prediction sentences carry 2400-2800 ms pauses (s1_2=2600, s2_1=2600, s3_1=2400, s4_1=2800, s5_2=2500, s6_2=2800).
- [x] Engine bug queue consulted (section 0); every relevant prevention_rule satisfied; the load-bearing inversion scar honoured end-to-end; renderer-owned scars FLAGGED for FAIL-routing, none violated.
- [x] DC Pandey check: no formula, derivation order, example, or figure imported (section 0). All first-principles + authored xerox-drum / charged-plate anchors.

Routing note for json-author: carry EVERY pause_after_ms (six of them) into the JSON verbatim. The architect specifically flagged s1_2 ~ 2600, s4_1 ~ 2800, and s5_2 ~ 2500, and solenoid_dropped_prediction_pauses_x4 is the exact cross-agent regression this guards against. eps0 / the solved formula must stay out of STATE_1 through STATE_4, on canvas AND in TTS. And the single most important physics invariant: E_demo has no /d - the field is CONSTANT. If a /d appears in E_demo or E_real, that is the inversion scar; reject it.
