# Physics block — `electric_potential_meaning`

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

**Authored by:** physics-author · **2026-06-26** · appended to `electric_potential_meaning_skeleton.md`.
**For:** the FOUNDER-APPROVED `peter_parker:renderer_primitives` engine build (consumes the §12 data contract), then `json-author`. **Schema:** v2.3. **Renderer:** `field_3d`, scenario `point_charge_positive` (extended with new potential primitives).

> Honors the founder-locked 7-state arc, all four `advance_mode` values, the PRIMARY aha (STATE_6 = V is a scalar, E is the perpendicular downhill arrow), the SUPPORTING aha (STATE_2 = path-independence), and the misconception→state map from the skeleton. Nothing in this block changes state count, advance_modes, the aha, or the misconception map. This is the **foundation/meaning** diamond: it teaches V = W/q and stops short of V = kQ/r (the next sibling `electric_potential_point_charge`). **No `V = kQ/r` is authored anywhere below.**

---

## 0. Pre-authoring: engine bug queue consultation

Queried `engine_bug_queue --field3d`, `--owner alex:physics_author`, `--owner alex:json_author`, and `electric_potential_meaning` (no rows — new concept). The prevention rules this block satisfies:

| `bug_class` / directive | Owner | How this block satisfies it |
|---|---|---|
| `default_variables_only_first_var_merged` (Bug #1) | alex:json_author / peter_parker:runtime_generation | **Every variable with a non-1 default is declared explicitly** in §1 (`DEMO_V_PER_NC: 9`, `r: 1.5`, the locked constants `k`/`epsilon_0`). json-author must wire each through `default_variables`; none may fall back to 1 at runtime. |
| `solenoid_dropped_prediction_pauses_x4` | alex:json_author | **Every `pause_after_ms` is declared in the §7 reveal tables and MUST be carried into the JSON verbatim.** field_3d consumes `pause_after_ms` via `deriveStateMeta`. The architect-flagged pauses (s1_2≈2600, s2_1≈2800) are bolded, plus prediction pauses on s3_1, s4_2, s5_3, s6_2. |
| `pause_after_ms_clone_gotcha` | alex:json_author | This block declares the prediction pauses as a first-class column so the clone path cannot silently omit them (the `electric_flux` regression that fails Gate 15b). |
| `teach_do_not_prespoil_a_later_reveal` | architect / json_author | **The symbol `V` and `V = W/q` appear in NO TTS sentence or canvas label before STATE_4.** `U` (potential energy) first in STATE_3; `V(∞)=0` first in STATE_5; "scalar"/"equipotential" + the shells first in STATE_6. The `V = kQ/r` teaser is gated to a single closing pill in STATE_7. The pre-spoil guard is enforced sentence-by-sentence in §7. |
| `teach_reveal_synced_to_narration` · `teach_show_quantity_live_when_named` | physics_author (mine) | Every `at_ms` below is tuned to cumulative narration pacing. The work tally ticks live as the charge moves (STATE_2/3); `V = W/q` writes when "this place has a potential V" is said (STATE_4); the ΔV bracket draws when "difference between two points" is said (STATE_5); the shells fade in when "surfaces of equal potential" is said (STATE_6). |
| `teach_concrete_before_abstract_compare` | architect | STATE_6: the already-known vector E draws **first, alone, faint**, THEN the scalar shells are laid beside it, THEN the E arrow is drawn perpendicular to a shell. STATE_4: the SAME concrete work-from-infinity divided by q to abstract into V. |
| `teach_distinct_reference_lines_for_two_radii` | architect | Two distinct positional quantities — the test charge's **current position** (placed sphere + its shell) and the **reference at infinity** (a far ghost marker "∞ · V=0"). Separate, clearly labelled; first-appearance position=STATE_2, ∞-marker=STATE_5. |
| `teach_visual_must_match_narration` | architect | STATE_2 "same total effort either way" = two routes, two identical tallies; STATE_4 "twice the charge, twice the work, same ratio" = 2q bigger, W doubles (6→12), W/q unchanged (6); STATE_6 "scalar — one number, no direction" = shells carry plain numbers, E carries an arrowhead, meeting at 90°. |
| `teach_color_each_element_by_its_own_sign` | architect | Source +Q red `#EF5350`; positive test charge +q amber `#FFF176`; equipotential shells neutral scalar cyan `#4FC3F7`; E vector green `#66BB6A` (inherited from `electric_field_point_charge`). |
| `field3d_scenario_missing_devstatemeta_recognition` · `field3d_reveal_too_subtle_fails_d7` · `field3d_explorer_state_static_d1p` · `field3d_time_gated_visual_invisible_in_slider_state` · `field3d_oneshot_element_vanishes_after_animation` · `field3d_position_vector_foreshortened_3q_camera` | peter_parker:renderer_primitives (FOUNDER-APPROVED engine build) | **COVERED by the approved engine build** (skeleton §"ENGINE PREREQUISITE"). The new potential primitives + a `deriveStateMeta.ts` recognition block for THIS arc ship in the SAME change. §12 specifies the exact data contract the engine reads: per-state reveal/hold/motion, STATE_7 idle auto-sweep, reveals sustaining ≥0.1%/frame or `reveal_hold`, one-shot `V`/`U` labels holding their end pose (never fading to 0), and `∞`/ΔV markers billboarding camera-right. Surfaced here so the engine build and json-author share one contract. |
| `aha_statement_exceeds_15_words` | json_author | PRIMARY-aha physics check (§9) confirms a ≤15-word headline. |

No prevention rule is violated; no exception required. The renderer-owned scars are not FAIL-routed this time — they are the scope of the approved upstream engine build, and §12 is the data contract that build implements against.

**DC Pandey check:** No formula, derivation order, example problem, or figure imported. V = W/q is derived from the definition of work against a conservative force per unit test charge; U = qV from energy = (charge)×(potential); path-independence from conservativeness — all first principles. The Van de Graaff "potential hill" anchor, the 2q divide-out demonstration, the A/B closer-is-higher question, and all six assessment items are authored, not lifted.

---

## 1. physics_engine_config.variables

Mirrors the sibling `electric_field_point_charge.json` scaling convention but for **potential**: where the sibling used `DEMO_E_PER_NC = 225` for a 1/r² field readout, this concept uses a new `DEMO_V_PER_NC = 9` for the 1/r potential readout, chosen so equal-ΔV shells land at camera-visible, physically bunched radii (§12 shell list; verified §2). Locked constants declared `min = max = default`.

```json
"variables": {
  "Q": {
    "name": "Source charge on the dome (kept positive across the whole arc)",
    "unit": "demo nC",
    "min": 1, "max": 1, "default": 1, "step": 1
  },
  "q_test": {
    "name": "Test charge brought in from infinity (doubles to 2 in the STATE_4 reveal)",
    "unit": "demo nC",
    "min": 1, "max": 2, "default": 1, "step": 1
  },
  "r": {
    "name": "Distance of the test charge from the source (drives which shell it sits on; STATE_7 drag owns this)",
    "unit": "demo units",
    "min": 0.5, "max": 4.0, "default": 1.5, "step": 0.05
  },
  "k": {
    "name": "Coulomb constant, k = 1/(4*pi*epsilon_0) (declared so a numeric V value can show on points; the FORMULA V=kQ/r is withheld until the STATE_7 teaser)",
    "unit": "N*m^2/C^2",
    "min": 8.99e9, "max": 8.99e9, "default": 8.99e9, "step": 1
  },
  "epsilon_0": {
    "name": "Permittivity of free space (a fixed constant of nature)",
    "unit": "C^2/(N*m^2)",
    "min": 8.854e-12, "max": 8.854e-12, "default": 8.854e-12, "step": 1
  },
  "DEMO_V_PER_NC": {
    "name": "Demo potential readout per demo-nC of source charge at unit demo radius (mirror of the sibling DEMO_E_PER_NC convention)",
    "unit": "demo V per (demo nC) at r=1",
    "min": 9, "max": 9, "default": 9, "step": 1
  }
}
```

Variable notes (for json-author):
- **`Q` is locked positive (min = max = default = 1) across the whole arc.** Sign-flip (negative dome ⇒ V<0, downhill reverses) is deliberately deferred to the formula sibling. Locking Q means a leaked negative Q can never tint the dome or invert the downhill direction in a guided state.
- **`q_test` default 1**, with `max: 2` solely to permit the STATE_4 reveal (q → 2q). This is NOT a student slider — the doubling is a scripted reveal, not a control. STATE_1–3 lock it at 1 (§6).
- **`r` default 1.5** (the destination point A — sits exactly on the V=6 hero shell, clean). Slider range 0.5–4.0 is used ONLY in STATE_7 (the drag). Guided states STATE_2–6 lock `r` (§6). The clamp `max(r, 0.05)` in every computed_output prevents a divide-by-zero if a programmatic r leak ever drives r→0.
- **`k`, `epsilon_0`, `DEMO_V_PER_NC` are locked constants.** `DEMO_V_PER_NC = 9` is the new scaling choice (analogous to the sibling 225); §2 shows it makes the hero shells land at V = 9, 6, 4.5, 3 and radii r = 1.0, 1.5, 2.0, 3.0 — physically bunched near +Q, camera-visible. `k`/`epsilon_0` are declared so the engine can render a numeric V *value* on points even though the V=kQ/r *formula label* is withheld; they are otherwise unused on canvas before STATE_7.

**Bug #1 (`default_variables_only_first_var_merged`) compliance:** every variable with a non-1 default (`r = 1.5`, `k`, `epsilon_0`, `DEMO_V_PER_NC = 9`) is explicitly declared here so json-author wires each through `default_variables`; none falls back to 1 at runtime. `Q` and `q_test` default to 1 but are also explicitly declared (and per-state locked in §6).

---

## 2. computed_outputs

The single demo relation behind every number is `V_demo = DEMO_V_PER_NC * Q / max(r, 0.05)`. Because **V = W/q**, the work tally is `W_demo = q_test * V_demo`, the potential energy is `U_demo = q_test * V_demo`, and the invariant ratio is `W_per_q = W_demo / q_test = V_demo`.

```json
"computed_outputs": {
  "V_demo":   { "formula": "DEMO_V_PER_NC * Q / Math.max(r, 0.05)" },
  "W_demo":   { "formula": "q_test * (DEMO_V_PER_NC * Q / Math.max(r, 0.05))" },
  "W_per_q":  { "formula": "DEMO_V_PER_NC * Q / Math.max(r, 0.05)" },
  "U_demo":   { "formula": "q_test * (DEMO_V_PER_NC * Q / Math.max(r, 0.05))" },
  "delta_V":  { "formula": "(DEMO_V_PER_NC * Q / Math.max(r_B, 0.05)) - (DEMO_V_PER_NC * Q / Math.max(r_A, 0.05))" }
}
```

> Note on `delta_V`: `r_A` and `r_B` are the two marked radii in STATE_5 (A = the destination 1.5; B = the closer point 1.0). They are passed as the STATE_5 config values `delta_v_r_A: 1.5`, `delta_v_r_B: 1.0` (§12), NOT as global slider variables — `delta_V` is a STATE_5-only display output. json-author may inline the two radii or read them from the STATE_5 block; either is acceptable as long as B is the closer point.

### Algebra verification (V = W/q is the spine)

```
Definition:            V = W / q                      (work per unit positive test charge, from infinity)
=> work tally:         W = q * V                       (so W scales with q, V does not)
=> energy banked:      U = work done against field = q * V          (STATE_3: U = qV)
=> invariant ratio:    W/q = V                          (STATE_4: divide out q, the prober vanishes)
Reference:             V(infinity) = 0                  (STATE_5 zero line)
Difference:            Delta V = V_B - V_A              (STATE_5: per-unit-charge work to go A -> B)
Demo number:           V_demo = DEMO_V_PER_NC * Q / max(r, 0.05)   (internally 1/r-shaped; NO kQ/r label emitted pre-STATE_7)
```

### Numerical confirmation (run with `DEMO_V_PER_NC = 9`, `Q = 1`)

Destination point **A at r = 1.5** (the guided-states value):

| quantity | formula | q=1 | q=2 |
|---|---|---|---|
| `V_demo`(A) | `9*1/1.5` | **6.000** | **6.000** (unchanged — V is the place's property) |
| `W_demo`(A) | `q*V` | **6.000** | **12.000** (doubled — work scales with q) |
| `W_per_q`(A) | `W/q` | **6.000** | **6.000** (invariant — the definition) |
| `U_demo`(A) | `q*V` | **6.000** | 12.000 |

- **STATE_2 path-independence:** path 1 work = path 2 work = **6.000** (identical; the field is conservative, so only the endpoints matter). The two side-by-side tallies read the same number.
- **STATE_3 stored energy:** `U_demo = q*V = 1*6 = 6.000` for q=1 — equals the banked work, which drains to 0 as the released charge flies back out.
- **STATE_4 divide-out-q:** q→2q DOUBLES the tally (6→12) but `W/q` is UNCHANGED (6→6). `V_demo = W_per_q = 6` is the place property, the same number whatever charge probes it.
- **STATE_5 reference + ΔV:** A at r=1.5 → V_A = **6.000**; B closer at r=1.0 → V_B = **9.000**; `ΔV = V_B − V_A = 9 − 6 = +3.000`. B closer to +Q ⇒ V_B > V_A ⇒ ΔV > 0 (closer to a positive dome is HIGHER potential, C5). `V(∞) → 0`: V_demo(r=1000) = 0.009 → 0 (C4).
- **Monotonicity:** V rises as r falls and → 0 as r grows:

  | r | 0.5 | 1.0 | 1.5 | 2.0 | 3.0 | 6.0 | 20.0 |
  |---|---|---|---|---|---|---|---|
  | V_demo | 18.0 | 9.0 | 6.0 | 4.5 | 3.0 | 1.5 | 0.45 |

- **Downhill direction (field_relation_teaser):** numeric `dV/dr` at r=1.5 is −4.0 (V decreases outward), so `E_radial = −dV/dr = +4.0` points OUTWARD for +Q — i.e. from the high-V inner shell toward the low-V outer shell ("downhill"), perpendicular to the shells. Consistent with C7.

All checks PASS. `W_per_q` is identical for q_test = 1 and 2; V_demo rises as r falls; V_demo → 0 as r → large; ΔV = V_B − V_A with B closer ⇒ higher.

---

## 3. formulas

No angle arguments (electrostatic potential is a scalar; no sin/cos/RHR, so no `radians()` needed — skeleton §10(c) documents RHR as N/A). **`V = kQ/r` is NOT authored** (it is the next sibling).

```json
"formulas": {
  "potential_definition":  "V = W / q",
  "potential_energy":      "U = q V",
  "path_independence":     "W depends only on the start and end points, never on the route (the electrostatic force is conservative)",
  "reference":             "V(infinity) = 0",
  "potential_difference":  "Delta V = V_B - V_A",
  "scalar_nature":         "V is a scalar; equipotential surfaces are the level sets of V (one number per surface, no direction)",
  "field_relation_teaser": "E points in the direction of decreasing V, perpendicular to the equipotential surfaces (the full gradient relation E = -dV/dr is deferred)"
}
```

Formula rigor check (each line):
- `potential_definition` — `[W/q] = J/C = volt`. V is work per unit positive test charge to bring it from infinity. OK. This is THE definition (STATE_4).
- `potential_energy` — `[qV] = C * (J/C) = J`. U is the energy the charge has by sitting at potential V; scales with q. OK (STATE_3).
- `path_independence` — qualitative statement of conservativeness: a conservative force does path-independent work, so the work to reach a point is a single fixed number for that point (which is what lets V be well-defined). OK (STATE_2, SUPPORTING aha).
- `reference` — the conventional zero: infinitely far, the field can't reach, so no work to sit there. OK (STATE_5).
- `potential_difference` — ΔV(A→B) = V_B − V_A = per-unit-charge work to move from A to B. `[ΔV] = volt`. OK (STATE_5).
- `scalar_nature` — V has magnitude only, no direction; points of equal V form whole surfaces (level sets). OK (STATE_6, PRIMARY aha).
- `field_relation_teaser` — E is the negative gradient of V, hence perpendicular to equipotentials and pointing toward lower V ("downhill"). Stated qualitatively only; the gradient computation is deferred. OK (STATE_6/7).

---

## 4. constraints (C1–C8, from the skeleton handoff)

```json
"constraints": [
  "V is a SCALAR: one number per point, no direction - it is NOT a vector and is NOT the field E (C1).",
  "The work to bring a charge to a point, and therefore V at that point, is path-independent: it depends only on the endpoints because the electrostatic force is conservative (C2).",
  "V is independent of the test charge used to probe it: V = W/q, NOT W*q - doubling the test charge doubles W but leaves W/q unchanged (C3).",
  "The reference is V(infinity) = 0: potential is measured as work per unit charge brought in from infinitely far away (C4).",
  "Closer to a positive source means more work to bring a positive charge in, hence HIGHER potential: V rises as r falls and V -> 0 as r grows large (C5).",
  "Potential energy U = qV scales with the charge q; potential V = U/q = W/q does NOT - U belongs to the charge, V belongs to the place (C6).",
  "The field E is perpendicular to the equipotential surfaces and points toward LOWER V (downhill); equipotential surfaces are the level sets of V (C7).",
  "Delta V between two points is the per-unit-charge work to move a charge between them, Delta V = V_B - V_A - that is what a voltage between two points means (C8)."
]
```

Edge-case flags for json-author / the engine build:
- **r → 0 divergence:** V_demo ∝ 1/r blows up at the source. Handled by `Math.max(r, 0.05)` in every computed_output. Slider min 0.5 keeps the student clear of it. No per-state override needed — the clamp is global.
- **Q sign:** locked positive whole arc (§1). Negative dome (V<0, downhill reverses) is deferred to the formula sibling. No state may show a negative Q.
- **q_test = 2 reveal:** only in STATE_4; it is a scripted doubling, not a slider value. After the reveal the label `V = W/q` and the V value must HOLD their end pose (guards `field3d_oneshot_element_vanishes_after_animation`) — never fade to 0.

---

## 5. Board-mode mark scheme + derivation sequence

**SKIPPED.** Rule 20 conceptual-only directive is active (board + competitive modes SUSPENDED). No `mode_overrides`, no mark scheme, no derivation_sequence authored for this concept. The DoD (skeleton §10(e)) explicitly requires **Conceptual-only**.

---

## 6. Per-state variable_overrides (value locks)

Defensive-locking pattern (`hinge_force.json` STATE_4 `F_ext: 0`; `field_forces.json` STATE_5 `m: 1`). These per-state value locks are REQUIRED so an upstream `default_variables` leak or the STATE_7 drag cannot bleed the wrong `Q`/`q_test`/`r` into a guided state.

| state | `variable_overrides` | why |
|---|---|---|
| STATE_1 | `Q: 1, q_test: 1, r: 3.5` | Hook: positive dome, test charge sitting FAR out (r=3.5, near the V≈2.6 edge) where the field barely reaches. Lock all three so no leaked value tints the dome or mis-places the charge. NO V, NO W/q, NO tally shown. |
| STATE_2 | `Q: 1, q_test: 1` (r animates 3.5 → 1.5 along each route) | Both routes start at r=3.5 and end at the destination r=1.5; the work tally must read the fixed W=6 on arrival. Lock Q and q_test=1 so both tallies are honestly equal. `r` is animated by the route, not student-driven. |
| STATE_3 | `Q: 1, q_test: 1, r: 1.5` | Charge held at the destination (r=1.5, V=6); the energy badge reads U = qV = 6 for q=1, draining to 0 on release. Lock r so the badge value is exact. |
| STATE_4 | `Q: 1, r: 1.5; q_test: 1 -> 2 (scripted reveal)` | The definition. q_test starts locked at 1 (W=6) then the reveal doubles it to 2 (W=12), W/q stays 6, V=6 writes onto the point. r locked at 1.5 so V is stable across the doubling. **q_test=2 is the revealed value, not a slider.** |
| STATE_5 | `Q: 1, q_test: 1, r: 1.5` (point A); B placed at `r_B = 1.0` | A is the destination (r=1.5, V_A=6); B is the closer point (r=1.0, V_B=9); the ΔV bracket reads +3. Lock A's r so the ∞-marker, A, and B are positioned consistently. |
| STATE_6 | `Q: 1, q_test: 1, r: 1.5` | PRIMARY aha. The hero shells (V=9,6,4.5,3 at r=1.0,1.5,2.0,3.0) fade in; the carried-over V=6 at A still floats; E is drawn ⊥ to a shell. Lock Q=1 so all shell V values match the §12 list. |
| STATE_7 | none — the drag owns `q_test: 1`, `Q: 1`, `r` live | Explorer. `r` is student-driven across 0.5–4.0; the shell the charge sits on highlights and its V reads out; E rotates to stay ⊥. Render at full immediately (no clock-gated emergence — guards `field3d_time_gated_visual_invisible_in_slider_state`). Q and q_test still pinned to 1 (no sliders for them this concept). |

json-author: carry these as the per-state `field_3d_config.states.STATE_N` value block (mirroring how the sibling stores per-state `show_*` flags) AND/OR as top-level `variable_overrides`. Either location is acceptable; **the LOCK is what matters** — a leaked r or q_test must not corrupt a guided state.

## 7. Per-state within-state reveal timeline (REQUIRED, session 33)

All TTS plain English, <=30 words per sentence, Van de Graaff / charged-comb anchor, no Hinglish. **Pre-spoil guard:** no sentence/label in STATE_1-3 names `V`, `W/q`, "potential" (as the quantity), or any formula; `U` ("potential energy") first in STATE_3; the quantity `V` (= W/q) first in STATE_4; `V(inf)=0` first in STATE_5; "scalar"/"equipotential" + the shells first in STATE_6; `V = kQ/r` only in the STATE_7 closing pill.

`at_ms` tuned to cumulative narration pacing (`teach_reveal_synced_to_narration`). **EVERY `pause_after_ms` below MUST be carried into the JSON verbatim** (`solenoid_dropped_prediction_pauses_x4` + `pause_after_ms_clone_gotcha`).

### STATE_1 - Hook (advance_mode: `wait_for_answer`)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s1_1 | This metal dome is charged up, like the top of a Van de Graaff generator. A tiny positive charge sits far out, where the push barely reaches. | dome `+Q` + faint radial field lines + far `+q` at r=3.5 | populate + drift | 0 | none |
| s1_2 | To push that small charge in close to the dome, against the field shoving it away, will it take effort, and does it matter which way you walk it in? | none (prediction; NO V, NO W/q, NO tally on canvas) | none | 6000 | **2600** |

- Reveal: none fires - resolution withheld to STATE_2 (path) and STATE_4 (definition). On-canvas: dome + faint field lines + far test charge only. NO work tally, NO V, NO formula.
- Pre-spoil check: s1_1/s1_2 name neither `V` nor `W/q` nor "potential". The question plants BOTH the altitude/effort instinct (wanted) and "does the path matter?" (misconception #2, broken at STATE_2). OK.

### STATE_2 - path-independence reveal (advance_mode: `wait_for_answer`) - SUPPORTING aha

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s2_1 | Watch me bring it in two ways. Path one is a straight dash inward. Path two loops the long way around. Predict: same effort, or different? | empty work tally `W = ...` in corner + two faint route hints | tally_show | 0 | **2800** |
| s2_2 | Here goes path one, straight in. Watch the work tally climb as I push it against the field, all the way to the point. | `+q` animates straight (r 3.5->1.5) + path-1 tally ticks to W=6 | route_animate + tally_tick | 5400 | none |
| s2_3 | Now path two, the long looping way to the very same point. Its own tally climbs, and lands on the same total. | ghost `+q` animates looping route + path-2 tally ticks to W=6 | route_animate + tally_tick | 12000 | none |
| s2_4 | Two completely different routes, identical effort. The electrostatic force is conservative, so only the start and end points matter, never the path. | two equal tallies side by side (W=6, W=6) + "conservative" label | reveal_hold | 19000 | none |

- Reveal binding: each route ticks its OWN tally LIVE as the charge moves (`teach_show_quantity_live_when_named`); both land on the identical W=6 (`teach_visual_must_match_narration` - "same total effort"). The two equal tallies hold side by side (`reveal_hold`).
- Pre-spoil check: "work tally W" is the named work (allowed from STATE_2 per the symbol table); no `V`, no `W/q`, no "potential". Confronts misconception #2 (different routes cost different effort). OK.

### STATE_3 - potential-energy reframe (advance_mode: `auto_after_tts`)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s3_1 | That effort you spent pushing in did not vanish. If I let go of the charge right now, what do you think happens? | `+q` held at destination (r=1.5) + "stored energy" badge (value 6, no symbol yet) | hold | 0 | **2500** |
| s3_2 | Watch. Let go, and it flies straight back outward along the field, picking up speed as the stored energy drains away to nothing. | `+q` released, flies outward + badge drains 6 -> 0 | release_animate + badge_drain | 5200 | none |
| s3_3 | The work you did was banked as the charge electric potential energy, U, at that spot. Stored effort the field gives back when released. | `U` label written on the badge ("U = stored energy") | write_in + reveal_hold | 12000 | none |

- Reveal binding: the badge drains LIVE as the charge speeds up (`teach_show_quantity_live_when_named`); the symbol `U` first appears here (s3_3), written onto the badge and HELD (`reveal_hold`, guards the one-shot-vanish scar).
- Pre-spoil check: "potential energy U" is allowed first in STATE_3; the quantity `V` is still NOT named. The stored quantity is explicitly called *energy* (U), pre-empting misconception #3 (V is a push) and #5 (V and U are the same). OK.

### STATE_4 - the definition V = W/q (advance_mode: `manual_click`)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s4_1 | The work to bring a charge here depends on how big the charge is. A fatter charge fights the field harder, so it costs more effort. | `+q` at destination (r=1.5) + tally reading W=6 | hold | 0 | none |
| s4_2 | Swap the small charge for one twice as big, a 2q. Predict the work to bring it to the same point, and predict the work divided by the charge. | none (prediction) | none | 6500 | **2800** |
| s4_3 | Watch. The charge doubles, and the work tally doubles with it, from 6 up to 12. But the work divided by the charge stays exactly the same. | `+q` grows to `+2q` + tally 6->12 + second label `W/q = 6` holds | grow + tally_double + reveal_hold | 12500 | none |
| s4_4 | That unchanging ratio is the electric potential, V. V equals W over q. This place has a potential V, no matter which charge you used to find it. | `V = W/q` writes into callout + `V = 6` writes onto the point | write_in + reveal_hold | 19500 | none |
| s4_5 | Dividing out the test charge strips away the prober. What is left, V, is a property of the place and the source, the same number for any charge. | focal_highlight on `V = W/q` | focal_highlight | 26000 | none |

- Reveal binding: the tally doubles LIVE (6->12) while `W/q` holds at 6 (`teach_visual_must_match_narration` - "twice the charge, twice the work, same ratio"). The symbol `V` + `V = W/q` first appear here (s4_4), written and HELD (`reveal_hold`; must hold the V label visible, not fade to 0 - guards `field3d_oneshot_element_vanishes_after_animation`).
- Pre-spoil check: this is the FIRST appearance of `V`/`W/q`. Confronts misconception #4 (V depends on the test charge) and #5 (V vs U). OK.

### STATE_5 - reference at infinity + Delta V (advance_mode: `manual_click`)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s5_1 | We have been saying "work to bring it here", but from where? We need a starting line. The natural zero is infinitely far away, where the field cannot reach. | point A carrying `V = 6` + far ghost marker at the edge | hold | 0 | none |
| s5_2 | So we set the potential at infinity to zero. The far marker lights up: at infinity, V equals zero. Everything is measured from there. | far marker lights `inf . V = 0` (reference convention) | fade_in + reveal_hold | 6000 | none |
| s5_3 | Now mark a second point, B, closer in than A. Predict: for this positive dome, is B potential higher than A, or lower? | point B marker placed at r=1.0 | show | 12000 | **2600** |
| s5_4 | B is closer, so it took more work to reach, so its potential is higher: 9 against A 6. The gap between them, V_B minus V_A, is the potential difference, Delta V equals 3. | `Delta V = V_B - V_A` bracket drawn between A and B (=3) | bracket_draw + reveal_hold | 18000 | none |
| s5_5 | That difference, the per-unit-charge work to move from A to B, is exactly what people mean by a "voltage between two points". | focal_highlight on `Delta V = V_B - V_A` | focal_highlight | 25000 | none |

- Reveal binding: `inf . V=0` first appears here (s5_2), as a marker, not a formula. The Delta V bracket draws when "the gap between them" is said (s5_4), reading +3 (`teach_show_quantity_live_when_named`). The infinity marker and Delta V bracket billboard camera-right (guards `field3d_position_vector_foreshortened_3q_camera`).
- Pre-spoil check: `V(inf)=0` and `Delta V` first appear here, per the symbol table. Confronts the "B is lower because it is closer" sign error (Q5 distractor). OK.

### STATE_6 - PRIMARY aha: scalar shells + perpendicular E (advance_mode: `manual_click`)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s6_1 | You already know E. It is an arrow, a vector, one at every point, pointing the way a charge gets pushed. Here it is, faint. | faint radial field lines (the known E) drawn ALONE first | ghost_draw | 0 | none |
| s6_2 | Is potential an arrow too? Does the potential at a point have a direction, like E does? Predict before I reveal the shells. | none (prediction that breaks V-is-a-vector) | none | 6000 | **2800** |
| s6_3 | No. Watch the surfaces of equal potential appear: nested shells, each carrying one plain number, no arrow. Every point on a shell shares one V. | cyan equipotential shells fade in (V = 9,6,4.5,3 at r = 1.0,1.5,2.0,3.0) | shells_fade_in + reveal_hold | 12000 | none |
| s6_4 | V is a scalar, one number per place. Equal-V points form whole surfaces. And here is E, drawn on a shell, meeting it square at ninety degrees, pointing downhill. | `E` arrow drawn perpendicular to a shell, high-V -> low-V + `E perp shells` label | arrow_draw + reveal_hold | 19000 | none |
| s6_5 | So potential is your altitude, a single number for each height, and the field E is the slope, the arrow that points straight downhill, always perpendicular. | "scalar" + "equipotential" labels + focal_highlight | focal_highlight | 26000 | none |

- Reveal binding: concrete-first (`teach_concrete_before_abstract_compare`) - the already-known vector E draws ALONE and faint at s6_1, THEN the scalar shells fade in beside it at s6_3, THEN E is drawn perpendicular to a shell at s6_4. The shells carry plain numbers (no arrowheads); E carries an arrowhead at 90 degrees (`teach_visual_must_match_narration` - "scalar, no direction" vs "perpendicular arrow"). "scalar"/"equipotential" first appear here.
- Reveal-too-subtle guard: the shells fade in concentrically (motion above 0.1%/frame) AND the state declares `reveal_hold` on the final shells+E pose - satisfies D7 (`field3d_reveal_too_subtle_fails_d7`).
- Pre-spoil check: shells + "scalar"/"equipotential" first appear here. Confronts the PRIMARY misconception #1 (V is a vector / V is the field). OK.

### STATE_7 - Exploration (advance_mode: `interaction_complete`)

| id | text_en | reveal_primitive_id | reveal_action | at_ms | pause_after_ms |
|---|---|---|---|---|---|
| s7_1 | Now you drive. Drag the test charge. The shell it sits on lights up and its potential V reads out: the same V anywhere on that shell. | draggable `+q` + shell highlight + live `V` readout (all live) | drag_live | 0 | none |
| s7_2 | Walk it inward across the shells and V climbs. The green arrow, E, always points straight downhill, square to the shells. V is your altitude, E is the slope. | `E` arrow rotating to stay perpendicular + `V = altitude . E = slope` label (live) | drag_live | 7000 | none |
| s7_3 | One question left for next time: exactly how big is V at distance r from a point charge? That is V = kQ/r, the formula behind these shells. | single closing pill `V = kQ/r ->` (forward teaser ONLY) | reveal_hold | 13500 | none |

- Reveal binding: the draggable charge + V readout render at FULL immediately and track live (`field3d_time_gated_visual_invisible_in_slider_state` - no clock-gated emergence). An idle auto-sweep moves the charge across shells when un-dragged (guards `field3d_explorer_state_static_d1p`).
- Pre-spoil check: `V = kQ/r` appears ONLY here, as a single forward-teaser pill - the one place the next diamond is hinted. Everything before was clean. OK.

**Pre-spoil audit (whole concept):** scanned every sentence s1_1 -> s7_3. The symbol `V` (as the quantity) and `W/q` first appear in s4_3/s4_4; `U` first in s3_3; `V(inf)=0` first in s5_2; "scalar"/"equipotential" first in s6_3/s6_4; `V = kQ/r` only in s7_3. STATE_1-3 never name `V`. **PASS.**

---

## 8. Per-state misconception_watch (Rule 16a, EPIC-L-internal)

One entry per STATE_1-STATE_6 (skeleton section 4; STATE_7 omits). Each `one_line_fix` physics-checked.

```json
"STATE_1": [{
  "belief": "Potential is something a battery has at its terminals - a point in empty space cannot 'have a potential'.",
  "visual_counter": "The hook shows a charged dome and a test charge far out in empty space, posing the effort question - no battery anywhere, yet pushing the charge in plainly takes work.",
  "one_line_fix": "Every point in a field has a potential: it is the work per unit charge to bring a test charge there from infinity, no battery required."
}],
"STATE_2": [{
  "belief": "Different routes to the same point cost different amounts of effort - the path you take matters.",
  "visual_counter": "A straight dash and a long looping route both end on the same point with two identical work tallies (W = 6 and W = 6).",
  "one_line_fix": "The electrostatic force is conservative, so the work to reach a point depends only on the endpoints, never on the path."
}],
"STATE_3": [{
  "belief": "The stored effort is a force pushing the charge, or the potential itself is what pushes it.",
  "visual_counter": "Releasing the charge converts the stored energy U into motion - it flies outward and the badge drains to zero; nothing pushes except the field E.",
  "one_line_fix": "The banked work is potential ENERGY (U = qV), energy that converts to motion on release - not a force and not the potential itself."
}],
"STATE_4": [{
  "belief": "The potential at a point depends on the test charge you use - a bigger charge gives a bigger potential.",
  "visual_counter": "Doubling the charge to 2q doubles the work tally (6 -> 12) but the ratio W/q stays exactly 6; V = 6 is the same for q and 2q.",
  "one_line_fix": "V = W/q divides the test charge out, so V is the same number whatever charge probes it - it belongs to the place, not the charge."
}],
"STATE_5": [{
  "belief": "A point closer to the charge has a LOWER potential, or the potential difference depends on the path A to B.",
  "visual_counter": "Point B, closer in, reads V = 9 against A's V = 6; the Delta V bracket reads +3, and is the same whatever route joins A and B.",
  "one_line_fix": "Closer to a positive source means more work to arrive, so HIGHER V; Delta V = V_B - V_A is path-independent, set only by the two points."
}],
"STATE_6": [{
  "belief": "Potential is a vector with a direction, or potential IS the electric field E.",
  "visual_counter": "The shells carry one plain number each and no arrowhead; the only arrow is E, drawn perpendicular to a shell, pointing downhill.",
  "one_line_fix": "V is a scalar - one number per place, no direction; equal-V points form whole surfaces. E is the separate vector that points straight downhill, perpendicular to them."
}]
```

Physics check on each `one_line_fix`: all six are correct physics, not merely persuasive.
- STATE_1: a potential is defined at every field point (work/charge from infinity), independent of any battery. Correct.
- STATE_2: conservativeness => path-independent work. Correct (C2).
- STATE_3: U = qV is energy, not force; it converts to kinetic energy on release. Correct (C6).
- STATE_4: V = W/q (the numerically verified 6->12 doubling with W/q invariant at 6). Correct (C3).
- STATE_5: closer to +Q => higher V (V_B=9 > V_A=6), and Delta V is endpoint-determined. Correct (C5, C8).
- STATE_6: V scalar (level-set surfaces), E perpendicular to shells, downhill (numerically verified E_radial = -dV/dr = +4 outward). Correct (C1, C7).

**PASS.**

---

## 9. PRIMARY-aha + SUPPORTING-aha physics check

**PRIMARY aha (STATE_6).** <=15-word headline for `aha_moment.statement` (json-author, keep at 15 words; em-dash counts as a token; `aha_statement_exceeds_15_words` guard):

> Potential is a scalar - one number per place; the field E points downhill.

Word count: Potential(1) is(2) a(3) scalar(4) -(5) one(6) number(7) per(8) place(9) the(10) field(11) E(12) points(13) down(14)hill(15) = 15 tokens. (Matches the skeleton's exact `aha_moment.statement` text.) Physically TRUE: V is a scalar field, its level sets are the equipotential shells, and E = -gradient(V) is perpendicular to them pointing toward lower V (numerically verified: E_radial = +4 outward at r=1.5, from the V=9 inner shell toward the V=3 outer shell). STATE_6's shells (plain numbers, no arrows) beside the perpendicular E arrow actually demonstrate it. PASS - not wrong-but-memorable. The 10-year memory line "V is altitude, E is slope" is also TRUE: altitude is a scalar height, slope is its gradient vector pointing downhill.

**SUPPORTING aha (STATE_2):** "The work to bring a charge to a point doesn't care which path you take - the field is conservative, so a point has ONE potential." Physically TRUE: a conservative force does path-independent work (C2), which is precisely what makes V a single well-defined number per point - it SETS UP the PRIMARY (you cannot have one scalar per place unless the work to get there is path-independent). Causally linked. PASS. 1 PRIMARY + 1 SUPPORTING = sweet spot.

---

## 10. Six-question assessment + coverage_map

Per skeleton section 10(f): Q1 -> V=W/q (STATE_4); Q2 -> V is a scalar not a vector (STATE_6, aha); Q3 -> work is path-independent (STATE_2); Q4 -> V independent of the test charge (STATE_4); Q5 -> Delta V = work per unit charge, closer to +Q is higher V (STATE_5); Q6 -> V (place) vs U = qV (energy of the charge) (STATE_3/4 boundary). Every keyed answer verified correct; every distractor is a real wrong belief that yields that option.

```json
"assessment": {
  "mastery_definition": "A student has mastered the meaning of electric potential when they can (1) state V = W/q, the work per unit positive test charge to bring it from infinity to the point; (2) explain that this work, and therefore V, is path-independent because the electrostatic force is conservative; (3) show that V is independent of the test charge used, since doubling the charge doubles the work but leaves the ratio W/q unchanged; (4) distinguish potential V (a scalar property of the place) from potential energy U = qV (energy of the charge, scaling with q); (5) use the reference V(infinity) = 0 and read Delta V = V_B - V_A as the per-unit-charge work between two points, knowing that closer to a positive source means higher V; and (6) recognise that V is a scalar whose equal-value points form equipotential surfaces, with the field E perpendicular to them, pointing toward lower V.",
  "questions": [
    {
      "q_id": "Q1",
      "stem": "Electric potential V at a point is defined as the work W done to bring a test charge q there from infinity, combined how?",
      "options": {
        "A": "V = W/q - the work per unit charge",
        "B": "V = W*q - the work times the charge",
        "C": "V = W - just the work done, the charge does not enter",
        "D": "V = q/W - the charge per unit work"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "multiplies by the charge instead of dividing, confusing potential V with potential energy U = qV",
        "C": "drops the test charge entirely, so the number would change with the charge used",
        "D": "inverts the ratio, giving charge per unit work instead of work per unit charge"
      },
      "tested_idea": "Electric potential is the work done per unit positive test charge, V = W/q.",
      "teaches_state": "STATE_4",
      "difficulty": "core",
      "parallel_form_stem": "It takes work W to carry a small charge q from far away up to a charged Van de Graaff dome's surroundings. How is the potential V at that spot built from W and q?"
    },
    {
      "q_id": "Q2",
      "stem": "Which statement about electric potential V at a point is correct?",
      "options": {
        "A": "V is a scalar - a single number with no direction",
        "B": "V is a vector pointing along the electric field E",
        "C": "V is a vector pointing radially outward from a positive charge",
        "D": "V is just another name for the electric field E"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "imagines potential as an arrow aligned with E, treating a scalar as a vector",
        "C": "gives potential the radial direction of the field instead of recognising it has no direction",
        "D": "conflates the scalar potential V with the vector field E"
      },
      "tested_idea": "V is a scalar (one number per place); equal-V points form equipotential surfaces. E is the separate vector.",
      "teaches_state": "STATE_6",
      "difficulty": "core",
      "parallel_form_stem": "Around a charged dome, is the potential at a point an arrow (with a direction) or a plain number? Pick the correct description."
    },
    {
      "q_id": "Q3",
      "stem": "You bring a charge from infinity to a point P by a short straight route, and a friend brings an identical charge to the same point P by a long winding route. Compare the work each of you does.",
      "options": {
        "A": "The work is the same - it depends only on the start and end points",
        "B": "The longer winding route requires more work",
        "C": "The work depends on the exact route each person takes",
        "D": "The winding route stores extra energy in the charge along the way"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "thinks a longer path costs more work, ignoring that the electrostatic force is conservative",
        "C": "believes the route matters, not just the endpoints",
        "D": "imagines a path-dependent extra energy, which a conservative field cannot store"
      },
      "tested_idea": "Work to reach a point is path-independent because the electrostatic force is conservative, so V is well-defined.",
      "teaches_state": "STATE_2",
      "difficulty": "core",
      "parallel_form_stem": "Two students slide a charged ball up to the same spot near a charged comb, one straight in, one looping around. Do they do the same total work, or different amounts?"
    },
    {
      "q_id": "Q4",
      "stem": "At a point near a charged dome, the potential is V. If you probe the SAME point with a charge twice as large (2q instead of q), what is the potential there?",
      "options": {
        "A": "Still V - the potential is the same, since V = W/q and both W and q double",
        "B": "2V - twice the charge gives twice the potential",
        "C": "V/2 - a bigger charge sees a smaller potential",
        "D": "It depends on q, so it cannot be stated without knowing the charge"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "doubles V with the charge, confusing potential V with potential energy U = qV (which does double)",
        "C": "invents an inverse dependence of V on the probing charge",
        "D": "thinks V cannot be defined without specifying the test charge"
      },
      "tested_idea": "V is independent of the test charge: doubling q doubles W but leaves W/q unchanged.",
      "teaches_state": "STATE_4",
      "difficulty": "stretch",
      "parallel_form_stem": "A spot near a charged rod has potential V when probed with a tiny charge. Probe the very same spot with a charge ten times bigger. What potential do you read?"
    },
    {
      "q_id": "Q5",
      "stem": "Near a positively charged dome, point B is closer to the dome than point A. Taking V(infinity) = 0, compare the potentials and the meaning of Delta V = V_B - V_A.",
      "options": {
        "A": "V_B is higher than V_A; Delta V is the work per unit charge to move from A to B",
        "B": "V_B is lower than V_A, because being closer means less potential",
        "C": "V_B equals V_A, since potential is the same everywhere around the dome",
        "D": "Delta V depends on which path you take from A to B"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "thinks closer to the charge means lower potential, getting the sign of the gradient backwards",
        "C": "imagines a uniform potential around the dome, ignoring that V rises toward the source",
        "D": "believes the potential difference is path-dependent, contradicting the conservative field"
      },
      "tested_idea": "Closer to a positive source means higher V; Delta V = V_B - V_A is the path-independent per-unit-charge work between the points.",
      "teaches_state": "STATE_5",
      "difficulty": "stretch",
      "parallel_form_stem": "Standing near a charged Van de Graaff dome, point B is nearer the dome than point A. Is B at a higher or lower potential, and what does the difference between them mean?"
    },
    {
      "q_id": "Q6",
      "stem": "A charge q sits at a point where the potential is V. How do the potential V of the place and the potential energy U of the charge relate, and which one changes if you swap in a bigger charge?",
      "options": {
        "A": "U = qV; the energy U scales with the charge, but the potential V of the place does not",
        "B": "V and U are the same quantity with the same value",
        "C": "U does not depend on the charge q at all",
        "D": "V = qU; the potential scales with the charge"
      },
      "correct": "A",
      "distractor_misconceptions": {
        "B": "conflates the place's potential V with the charge's energy U, treating them as identical",
        "C": "forgets that U = qV scales with the charge, while V does not",
        "D": "inverts the relation, making the place's potential depend on the probing charge"
      },
      "tested_idea": "U = qV: potential energy belongs to the charge and scales with q; potential belongs to the place and does not.",
      "teaches_state": "STATE_3",
      "difficulty": "stretch",
      "parallel_form_stem": "Two different charges, q and 2q, sit at the same spot near a charged dome. Do they have the same potential energy, the same potential, both, or neither?"
    }
  ]
}
```

```json
"coverage_map": {
  "by_state": {
    "STATE_2": ["Q3"],
    "STATE_3": ["Q6"],
    "STATE_4": ["Q1", "Q4"],
    "STATE_5": ["Q5"],
    "STATE_6": ["Q2"]
  },
  "non_assessed_states": ["STATE_1", "STATE_7"]
}
```

Assessment physics check:
- Q1 keyed A: V = W/q, exact definition. B is the classic V-vs-U confusion (xq instead of /q); C drops the divide; D inverts. OK.
- Q2 keyed A: V is a scalar. B/C give it a (wrong) direction; D conflates V with E. Hits the PRIMARY-aha state (STATE_6). OK.
- Q3 keyed A: path-independent (conservative). B/C/D are the real route-matters beliefs. OK.
- Q4 keyed A: V unchanged for 2q (numerically: W 6->12 but W/q stays 6). B doubles V (U-confusion); C/D mis-depend on q. OK.
- Q5 keyed A: B closer => V_B(9) > V_A(6); Delta V path-independent. B is the sign-flip; C uniform; D path-dependent. OK.
- Q6 keyed A: U = qV scales with q, V does not. B (V=U), C (U not q-dependent), D (V=qU) are the three real confusions. OK.
- Gate 19 (coverage): every `teaches_state` is real (STATE_2/3/4/5/6); `non_assessed_states = [STATE_1, STATE_7]` partition the 7 states with no overlap. OK.
- Gate 20 (quiz quality): every wrong option carries a `distractor_misconception`; correct options are NOT keyed as distractors; 6 distinct `tested_idea`; >=1 question hits the aha state (Q2 -> STATE_6); unique q_ids. OK.
- Parallel forms physics-equivalent to originals (Van de Graaff / comb / rod re-skins, same physics). OK.

---

## 11. Drill-down trigger phrases (skeleton section 6: 9 clusters, 3-5 phrasings each)

Real Indian 11th/12th student voice, plain English, no Hinglish, sounds confused (not like a teacher). These become `trigger_examples TEXT[]` in the Supabase cluster seed. Per skeleton section 6 the SQL ships ONE FOUNDER-LOCKED cluster per hard state - the strongest: `why_divide_by_charge` (STATE_4), `why_path_doesnt_matter` (STATE_2), `is_potential_a_vector` (STATE_6). All nine clusters are authored below so json-author has them if the founder widens the seed.

### STATE_4 - the definition V = W/q

**`why_divide_by_charge`** (FOUNDER-LOCKED, strongest for STATE_4)
- why do we divide the work by the charge
- why is it W over q and not W times q
- whats the point of dividing by q to get potential
- why not just use the work as the potential
- why divide out the test charge

`potential_vs_potential_energy`
- whats the difference between potential and potential energy
- is V the same as U
- potential vs potential energy im confused
- why is one called energy and the other potential
- how is V different from the energy of the charge

`v_independent_of_test_charge`
- why doesnt V change when i use a bigger charge
- if i double the charge why is the potential the same
- does the potential depend on the test charge
- why is V the same for q and 2q
- shouldnt a bigger charge have more potential

### STATE_2 - path-independence

**`why_path_doesnt_matter`** (FOUNDER-LOCKED, strongest for STATE_2)
- why does the path not matter for the work
- why is the work same for both routes
- why doesnt taking the long way cost more
- shouldnt a longer path need more work
- why path independent

`what_makes_field_conservative`
- what does conservative force mean here
- why is the electric force conservative
- what makes the field conservative
- why only start and end points matter
- conservative field meaning

`work_depends_only_on_endpoints`
- why work depends only on endpoints
- why only the two points matter not the route
- how can two routes give the same work
- why endpoints decide the work
- does the starting and ending point fix the work

### STATE_6 - V is a scalar

**`is_potential_a_vector`** (FOUNDER-LOCKED, strongest for STATE_6)
- is potential a vector or scalar
- does potential have a direction
- is V an arrow like the field
- why is potential not a vector
- is electric potential the same as the field

`why_E_perpendicular_to_shells`
- why is E perpendicular to the equipotential
- why does the field meet the shell at 90 degrees
- why is E always perpendicular to the surface
- how is the arrow perpendicular to the shells
- why field is at right angles to equipotential

`what_is_an_equipotential_surface`
- what is an equipotential surface
- what do the shells mean
- why do points have the same potential on a shell
- what is the cyan shell showing
- meaning of equal potential surface

---

## 12. THE `field_3d_config` DATA CONTRACT (engine build + json-author)

This is the precise JSON shape the FOUNDER-APPROVED `peter_parker:renderer_primitives` build implements against, and that json-author fills into `electric_potential_meaning.json`. All numbers below are the section-2-verified demo values.

```json
"field_3d_config": {
  "scenario_type": "point_charge_positive",
  "explorer_id": "potential_explorer",
  "potential_defaults": {
    "demo_v_per_nc": 9,
    "Q": 1,
    "r_destination": 1.5,
    "clamp_r_min": 0.05
  },
  "colors": {
    "positive": "#EF5350",
    "test_charge": "#FFF176",
    "equipotential": "#4FC3F7",
    "field": "#66BB6A",
    "text": "#D4D4D8",
    "background": "#0A0A1A"
  },
  "equipotential": {
    "show": false,
    "color": "#4FC3F7",
    "opacity": 0.14,
    "label_each_shell": true,
    "shells": [
      { "radius": 1.0, "V_label": "9" },
      { "radius": 1.5, "V_label": "6" },
      { "radius": 2.0, "V_label": "4.5" },
      { "radius": 3.0, "V_label": "3" }
    ],
    "_note": "Radii are 1/r-physical: r_i = demo_v_per_nc * Q / V_i (equal-dV step 1.5 -> bunched near +Q, NOT evenly spaced). Replaces any hardcoded even radius = 1.0 + i*1.2."
  },
  "test_charge_route": {
    "explorer_id": "potential_explorer",
    "start_r": 3.5,
    "destination_r": 1.5,
    "paths": [
      { "id": "path_1", "shape": "straight_radial", "tally_id": "W_path1" },
      { "id": "path_2", "shape": "looping_arc",     "tally_id": "W_path2" }
    ],
    "work_tally": {
      "W_path1_value": 6,
      "W_path2_value": 6,
      "W_2q_value": 12,
      "W_per_q_value": 6,
      "_note": "Both paths land on W=6 (path-independence). STATE_4 q->2q doubles tally to 12; W/q holds 6."
    },
    "doubling": { "from_q": 1, "to_q": 2, "grow_label": "+q -> +2q" }
  },
  "reference_marker": {
    "show": false,
    "label": "infinity . V = 0",
    "position_r": 4.0,
    "billboard": "camera_right"
  },
  "delta_v_bracket": {
    "show": false,
    "point_A": { "r": 1.5, "V_label": "6", "name": "A" },
    "point_B": { "r": 1.0, "V_label": "9", "name": "B" },
    "delta_v_label": "delta V = V_B - V_A = 3",
    "billboard": "camera_right"
  },
  "energy_badge": {
    "show": false,
    "U_value": 6,
    "drains_to": 0,
    "label": "U = stored energy"
  },
  "states": {
    "STATE_1": {
      "label": "Hook - effort to push a charge in?",
      "visible_elements": ["charge_plus", "field_lines_faint", "test_charge_far"],
      "show_charge": "plus",
      "show_field": "faint",
      "show_test_charge": true,
      "test_charge_r": 3.5,
      "show_work_tally": false,
      "show_equipotential": false,
      "formula_overlay": "",
      "camera_position": [2.6, 1.6, 4.2],
      "motion": "field_lines_populate + test_charge_drift, then reveal_hold"
    },
    "STATE_2": {
      "label": "Two paths, same work - conservative",
      "visible_elements": ["charge_plus", "field_lines_faint", "test_charge_route", "work_tally_x2"],
      "show_charge": "plus",
      "show_field": "faint",
      "show_test_charge": true,
      "animate_route": ["path_1", "path_2"],
      "show_work_tally": true,
      "show_equipotential": false,
      "formula_overlay": "W = 6 both routes",
      "camera_position": [2.8, 1.4, 4.2],
      "motion": "route_animate (path_1 then path_2), tally_tick to 6 each, reveal_hold on two equal tallies"
    },
    "STATE_3": {
      "label": "Stored effort = potential energy U",
      "visible_elements": ["charge_plus", "field_lines_faint", "test_charge_at_dest", "energy_badge"],
      "show_charge": "plus",
      "show_field": "faint",
      "show_test_charge": true,
      "test_charge_r": 1.5,
      "show_energy_badge": true,
      "show_equipotential": false,
      "formula_overlay": "U = q V",
      "camera_position": [2.8, 1.5, 4.0],
      "motion": "release_animate (charge flies outward) + badge_drain 6->0, then U label write_in + reveal_hold"
    },
    "STATE_4": {
      "label": "Divide out q - V = W/q (the definition)",
      "visible_elements": ["charge_plus", "test_charge_at_dest", "work_tally", "v_callout", "v_value_on_point"],
      "show_charge": "plus",
      "show_field": "faint",
      "show_test_charge": true,
      "test_charge_r": 1.5,
      "doubling_reveal": { "from_q": 1, "to_q": 2, "tally_from": 6, "tally_to": 12, "w_per_q_holds": 6 },
      "show_work_tally": true,
      "show_v_definition": true,
      "show_equipotential": false,
      "formula_overlay": "V = W/q",
      "camera_position": [2.8, 1.5, 4.0],
      "motion": "grow q->2q + tally_double 6->12 (W/q holds 6), then V=W/q write_in + V=6 onto point, reveal_hold (V label MUST hold, never fade to 0)"
    },
    "STATE_5": {
      "label": "Reference V(inf)=0 and delta V",
      "visible_elements": ["charge_plus", "test_charge_at_dest", "reference_marker", "delta_v_bracket", "point_A", "point_B"],
      "show_charge": "plus",
      "show_field": "faint",
      "show_reference_marker": true,
      "show_delta_v_bracket": true,
      "delta_v_r_A": 1.5,
      "delta_v_r_B": 1.0,
      "show_equipotential": false,
      "formula_overlay": "delta V = V_B - V_A = 3",
      "camera_position": [2.8, 1.6, 4.2],
      "motion": "reference_marker fade_in (billboard camera-right), B placed, delta_V bracket_draw to +3, reveal_hold"
    },
    "STATE_6": {
      "label": "PRIMARY aha - V scalar shells, E perpendicular",
      "visible_elements": ["charge_plus", "field_lines_faint", "equipotential_shells", "e_arrow_perp", "scalar_label"],
      "show_charge": "plus",
      "show_field": "faint",
      "show_equipotential": true,
      "show_e_arrow": true,
      "e_arrow_perpendicular_to_shells": true,
      "formula_overlay": "V = scalar . E perpendicular to shells",
      "camera_position": [2.6, 1.7, 3.8],
      "motion": "field_lines draw alone faint first, then shells_fade_in concentric (>=0.1%/frame), then E arrow_draw perpendicular high-V->low-V, reveal_hold"
    },
    "STATE_7": {
      "label": "Explore - drag the test charge, read V",
      "visible_elements": ["charge_plus", "equipotential_shells", "test_charge_draggable", "v_readout_live", "e_arrow_live", "teaser_pill"],
      "show_charge": "plus",
      "show_equipotential": true,
      "show_test_charge": true,
      "draggable_test_charge": true,
      "show_v_readout": true,
      "show_e_arrow": true,
      "idle_auto_sweep": true,
      "teaser_pill": "V = kQ/r ->",
      "formula_overlay": "V = altitude . E = slope",
      "camera_position": [2.8, 1.8, 4.5],
      "motion": "render at full immediately (no clock-gating), drag drives r live across 0.5-4.0, shell highlight + V readout + E rotate to stay perpendicular; idle auto-sweep when un-dragged"
    }
  }
}
```

### Engine-build contract notes (the values the build must honor)

1. **Equipotential shells** - read `{radius, V_label}` from `equipotential.shells`. The four hero shells are V = 9, 6, 4.5, 3 at r = 1.0, 1.5, 2.0, 3.0 - physically bunched near +Q (`r_i = demo_v_per_nc * Q / V_i`), NOT evenly spaced. `show: false` until STATE_6 fades them in; STATE_7 keeps them shown. Radii fit the sibling camera extents (~1.0..4.0). Opacity 0.14 (matches the skeleton handoff pin), cyan `#4FC3F7`.
2. **Test-charge route + work tally** - `start_r: 3.5`, `destination_r: 1.5`. Two paths (`straight_radial`, `looping_arc`) each tick their own tally to 6 (path-independence). The STATE_4 doubling grows q->2q, doubles the tally to 12, and the `W/q` readout holds 6. The grown `V = W/q` + `V = 6` labels must HOLD their end pose (never fade to 0).
3. **Reference + Delta V** - the `inf . V=0` marker at `position_r: 4.0` (STATE_5, billboard camera-right). The Delta V bracket between A (r=1.5, V=6) and B (r=1.0, V=9) reads Delta V = +3 (billboard camera-right). Both `show: false` until STATE_5.
4. **Energy badge** - STATE_3 only; `U_value: 6` draining to 0 on release; `U` symbol written on the badge and held.
5. **`deriveStateMeta.ts` recognition block for THIS arc** ships in the SAME engine change (guards `field3d_scenario_missing_devstatemeta_recognition`): per-state reveal/hold/motion per the `motion` strings above.
6. **STATE_7 explorer** - `idle_auto_sweep: true` (or `interactive` classification) so D1p does not false-fail on a static headless capture; `draggable_test_charge` + `v_readout_live` render at full immediately (no clock-gating, D7). `explorer_id: "potential_explorer"` (Rule 27 stable addressable ID).
7. **Billboarding** - `reference_marker` and `delta_v_bracket` billboard `camera_right` under the 3/4 camera (guards `field3d_position_vector_foreshortened_3q_camera`).

---

## 13. Self-review checklist

- [x] Every symbol in the state narratives (`Q`, `q_test`, `r`, `W`, `W/q`, `U`, `V`, `Delta V`, `V_B`, `V_A`, `inf.V=0`, `E`) is declared in `variables`, or appears in `formulas`/labels/the symbol table.
- [x] No `radians()` needed - electrostatic potential is a scalar, no trig/RHR (skeleton 10(c) N/A documented).
- [x] STATE_7 is the ONLY interactive state; the draggable test charge owns `r` live (0.5-4.0). No sliders in STATE_1-6.
- [x] `variable_overrides` (value locks) documented per state with one-line justification (section 6).
- [x] Board mark scheme - SKIPPED (Rule 20 board mode SUSPENDED; conceptual-only; section 5).
- [x] Drill-down phrasings: 3-5 per cluster x 9 clusters, real student voice; 1 founder-locked strongest per hard state marked (section 11).
- [x] `constraints`: 8 short assertions C1-C8 (section 4).
- [x] Numerical sanity: DEMO_V_PER_NC=9, Q=1 -> shells V=9,6,4.5,3 at r=1.0,1.5,2.0,3.0; A(r=1.5)->V=6, W=6(q=1)/12(q=2), W/q=6 invariant, U=6; B(r=1.0)->V=9, Delta V=+3; V(inf)->0. All run and confirmed (section 2).
- [x] Within-state reveal timeline for every state introducing a new quantity; prediction sentences carry their pauses verbatim (s1_2=2600, s2_1=2800, s3_1=2500, s4_2=2800, s5_3=2600, s6_2=2800).
- [x] Engine bug queue consulted (section 0); every relevant `prevention_rule` satisfied; the renderer-owned scars are covered by the FOUNDER-APPROVED engine build (data contract = section 12), none violated.
- [x] `aha_moment.statement` <=15 words, physically TRUE, demonstrated by STATE_6 (section 9).
- [x] `misconception_watch` STATE_1-6, each `one_line_fix` physics-checked (section 8).
- [x] 6-question `assessment` + `coverage_map`; every keyed answer correct, every distractor a real wrong belief, parallel forms physics-equivalent (section 10).
- [x] NO `V = kQ/r` authored anywhere except the single STATE_7 forward-teaser pill (the next sibling owns the formula).
- [x] DC Pandey check: no formula, derivation order, example, or figure imported (section 0). All first-principles + authored Van de Graaff anchor.

Routing note for json-author: carry EVERY `pause_after_ms` (six prediction beats) into the JSON verbatim - `solenoid_dropped_prediction_pauses_x4` + `pause_after_ms_clone_gotcha` are the exact cross-agent regressions this guards against. The symbol `V`/`W/q` must stay out of STATE_1-3 on canvas AND in TTS; `V = kQ/r` stays out of the entire concept except the STATE_7 teaser pill. The section-12 data contract is the engine build's spec - hand it to `peter_parker:renderer_primitives` first, then fill the JSON.
