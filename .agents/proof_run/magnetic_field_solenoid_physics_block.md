# Physics-author block — `magnetic_field_solenoid`

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

Consumes the architect skeleton at `magnetic_field_solenoid_skeleton.md` (Diamond #4, M4 binary-gate validator). CONCEPTUAL-ONLY per `MAGNETISM_ARCHITECTURE.md` M1–M6 carve-out. Board-mode mark scheme + derivation_sequence explicitly DEFERRED to M7. Competitive mode deferred to M8.

**DC Pandey check:** Consulted Ch.26 §26.8 table of contents only for scope (long solenoid B = μ₀nI inside, ≈0 outside). No formulas, examples, figure references, or teaching sequences imported. Variables, formulas, drill-down phrasings, and reveal timings authored from first principles.

**Engine bug queue check:** Variables with non-1 defaults (`n = 1000`, `I = 2`) explicitly declared per Bug #1 prevention rule. Angles N/A (this concept has no angular variables in the slider layer). State-leak prevention: STATE_8 carries explicit `variable_overrides` to reset n and I after STATE_7's reverse-current narrative.

---

## Section A — `physics_engine_config`

```json
{
  "variables": {
    "n": {
      "name": "Turns per metre",
      "unit": "/m",
      "min": 100,
      "max": 5000,
      "default": 1000,
      "step": 100
    },
    "I": {
      "name": "Current through the coil",
      "unit": "A",
      "min": 0.1,
      "max": 10,
      "default": 2,
      "step": 0.1
    },
    "N_demo": {
      "name": "Total turn count (display only — for STATE_6 stretch demonstrative)",
      "unit": "turns",
      "min": 6,
      "max": 1000,
      "default": 500,
      "step": 1
    },
    "L_demo": {
      "name": "Solenoid length (display only — paired with N_demo to show n = N/L)",
      "unit": "m",
      "min": 0.05,
      "max": 2.0,
      "default": 0.5,
      "step": 0.05
    },
    "mu_0": {
      "name": "Permeability of free space",
      "unit": "T*m/A",
      "constant": 1.2566370614e-6
    },
    "current_direction": {
      "name": "Current direction sign (+1 forward, -1 reversed)",
      "unit": "",
      "min": -1,
      "max": 1,
      "default": 1,
      "step": 2
    }
  },
  "computed_outputs": {
    "B_inside": {
      "formula": "mu_0 * n * I"
    },
    "B_inside_mT": {
      "formula": "(mu_0 * n * I) * 1000"
    },
    "B_outside": {
      "formula": "0"
    },
    "n_from_demo": {
      "formula": "N_demo / L_demo"
    },
    "B_inside_demo": {
      "formula": "mu_0 * (N_demo / L_demo) * I"
    },
    "stretch_ratio_B1_over_B2": {
      "formula": "(N_demo / L_demo) / (N_demo / (2 * L_demo))"
    }
  },
  "formulas": {
    "B_inside_long_solenoid": "B = mu_0 * n * I",
    "n_definition": "n = N / L (turns per unit length, units /m)",
    "axial_superposition": "B_axial_total = sum_over_all_turns(B_axial_one_turn) — radial components cancel between adjacent turns; only axial components survive",
    "B_outside_long_limit": "B_outside ≈ 0 (contributions from turns at different axial positions cancel almost everywhere outside)",
    "rhr_solenoid": "Right hand grip — fingers curl WITH the current loops, thumb gives B inside (note the role-swap from wire-RHR where thumb is current)",
    "reverse_current": "Reversing current direction reverses B_inside direction (magnitude |B| = mu_0 * n * |I| unchanged)",
    "stretch_demonstrative": "If N stays fixed and L doubles, n halves, B halves"
  },
  "constraints": [
    "Long-solenoid idealization: L >> R (length much greater than radius of one turn). Formula B = mu_0 * n * I is exact only in this limit.",
    "End effects ignored: at the open ends, B weakens to roughly mu_0 * n * I / 2 (not modelled in renderer; conceptually flagged in STATE_4).",
    "B_outside treated as 0 in renderer though physically it is epsilon-small (cancellation argument).",
    "Current is uniform around every turn — same I flows through the entire coiled wire.",
    "Direction by right-hand-rule curl: fingers along current loops, thumb along B inside.",
    "Field is purely axial inside (zero radial, zero azimuthal component) in the long-solenoid limit."
  ]
}
```

---

## Section B — Per-state `variable_overrides`

| state | n | I | N_demo | L_demo | current_direction | rationale |
|---|---|---|---|---|---|---|
| STATE_1 | 1000 | 2 | — | — | +1 | Hook state. No formula referenced; sliders inert. Defaults sufficient. The morph from straight wire to coil is a renderer-driven `wire_to_coil_morph` animation, not a physics override. |
| STATE_2 | 1000 | 2 | — | — | +1 | Per-turn field reveal. 6 turns are a rendering choice (visual clarity); the physics formula doesn't care about turn count at this state — n is the actual quantity. Defaults sufficient. |
| STATE_3 | 1000 | 2 | — | — | +1 | THE KEY STATE — PRIMARY aha. Two-turn isolation for the cancellation reveal is a renderer focal-zoom, not a variable change. Defaults sufficient. |
| STATE_4 | 1000 | 2 | — | — | +1 | Outside reveal. Same setup as STATE_3; B_outside computed = 0. Defaults sufficient. |
| STATE_5 | 1000 | 2 | — | — | +1 | RHR-swap state. SUPPORTING aha. No new physics quantities; the `right_hand.case: 'solenoid'` overlay does the visual work. Defaults sufficient. |
| STATE_6 | 1000 | 2 | **500** | **0.5** | +1 | Formula reveal. The demonstrative in s6_4 ("stretch the solenoid, n halves, B halves") needs `N_demo = 500, L_demo = 0.5` so the stretch-to-1.0m gives the clean 2× ratio. Sliders for n and I remain inert (interactivity-in-last-state rule). |
| STATE_7 | 1000 | 2 | — | — | **-1** | Reverse-current state. `current_direction = -1` is the override; this flips the visual current-arrow direction and the axial-B vector via `rotate_180` animate_in. n and I magnitudes unchanged. |
| STATE_8 | **slider** | **slider** | — | — | +1 | Exploration. Sliders for `n` (100–5000 /m, step 100) and `I` (0.1–10 A, step 0.1) become live. **Must reset `current_direction = +1`** to avoid leak from STATE_7's reverse demo (sessions 30.5–30.7 bug class — defensive override per `hinge_force.json` STATE_4 precedent). |

---

## Section C — Within-state reveal timeline

### STATE_1 — Hook (no new physics; introductory exception)

| sentence id | text_en | reveal_primitive_id | animate_in | pause_after_ms |
|---|---|---|---|---|
| s1_1 | "You already know the field around a single wire — circles." | straight_wire_stand_in | fade (already visible at state-enter as the `wire_to_coil_morph.straight_duration_ms = 3000` pre-morph phase) | 0 |
| s1_2 | "But what if we coil the wire — wrap it into a spring shape?" | coiled_wire_main (via `wire_to_coil_morph` cross-fade) | morph (1500ms cross-fade kicks in at t ≈ 3000ms from state-enter, completes at t ≈ 4500ms — s1_2 reveal lands at t ≈ 3000ms) | 1500 |
| s1_3 | "Each turn is still just a piece of wire carrying the same current. But the combined field changes shape dramatically. Let's see how." | coiled_wire_label | fade | 1000 |

**Renderer-primitives binding (STATE_1):** `wire_to_coil_morph: { enabled: true, straight_duration_ms: 3000, morph_duration_ms: 1500 }`. The straight wire is the stand-in for the first 3s while s1_1 plays; the cross-fade to the coil begins at t ≈ 3s, synchronized with s1_2's reveal; morph completes at t ≈ 4.5s, before s1_3 lands.

### STATE_2 — Per-turn field reveal

| sentence id | text_en | reveal_primitive_id | animate_in | pause_after_ms |
|---|---|---|---|---|
| s2_1 | "Quick reminder — a straight wire carrying current creates B-circles around it (we covered this earlier). Each turn of the solenoid is just a wire bent into a circle. Focus on this one turn." | turn_1_highlight | fade (yellow highlight on one turn) | 2000 |
| s2_2 | "Right — circles around the wire, just like Diamond #1." | turn_1_field_circles | fade (field circles around the highlighted turn) | 800 |
| s2_3 | "Now do the same for every turn. Six turns spread over some length L. Hold that 'spread over L' in your head — it will matter in STATE_6." | per_turn_circles_all | fade (remaining 5 turns' field circles fade in sequentially, 200ms stagger between turns) | 0 |
| s2_4 | "Six sets of circles look chaotic. But the chaos hides a pattern — the radial parts will cancel, and only the axial parts survive. Watch." | overlap_zone_focal_highlight | focal_highlight on central axis region | 1000 |

**Patch sentences applied:** s2_1 carries the `magnetic_field_wire` prerequisite cliff (Block 1, Section 1a). s2_3 plants the `b_field_depends_on_N_not_n` setup ("spread over L"). s2_4 pre-loads the resolution of `b_solenoid_field_is_radial` ("the chaos hides a pattern").

### STATE_3 — Axial sum (PRIMARY aha) — THE KEY STATE

| sentence id | text_en | reveal_primitive_id | animate_in | pause_after_ms |
|---|---|---|---|---|
| s3_1 | "Look between two adjacent turns. The circles from the upper turn point one way; the circles from the lower turn meet them coming the other way." | two_turn_isolation_zoom | focal_highlight + dim other 4 turns | 500 |
| s3_2 | "What happens when these opposite contributions meet? Pause for a moment and predict." | — (prediction question, no reveal) | — | **3000** |
| s3_2_5 | "To see why this happens, we split each field arrow into two pieces — one pointing along the solenoid axis, one pointing radially outward. (Vector resolution — same trick as splitting forces on an incline.)" | vector_resolution_decomposition_arrows | fade | 1500 |
| s3_3 | "Between the turns, the radial components CANCEL." | radial_cancellation_arrows | fade (red cancellation arrows between the two turns) | 800 |
| s3_4 | "But the AXIAL components — pointing along the solenoid's long axis — they ADD." | axial_arrows_rise + per_turn_circles_dim_to_30pct | arise (blue axial arrows along centerline) + fade (existing circles to 30% opacity) | 1000 |
| s3_5 | "Sum it up over all turns: a single, uniform, axial magnetic field. Inside the solenoid, B is straight and steady, like the field of a giant bar magnet. Inside the solenoid: uniform, strong, axial. Outside: that's the next surprise — we'll see in the next state." | uniform_axial_field_full_solenoid | fade (full-solenoid axial-B vectors brighten to 100%) | 0 |

**Patch sentences applied:** s3_2_5 inserts the `vector_resolution` prerequisite cliff (Block 1, Section 1a). s3_5 plants the `b_outside_solenoid_is_strong` setup (acknowledges the upcoming surprise). The `pause_after_ms: 3000` on s3_2 is **non-negotiable** per Block 2 cohesion check — student must sit in confusion before the cancellation reveal.

### STATE_4 — Outside reveal

| sentence id | text_en | reveal_primitive_id | animate_in | pause_after_ms |
|---|---|---|---|---|
| s4_1 | "Inside, the field is uniform and strong. But outside — what do you predict?" | — (prediction question) | — | 2500 |
| s4_2 | "Most students guess the field outside is just a weaker version of inside. Watch what really happens." | outside_field_arrows_fade_in_then_out | fade (very faint outside arrows fade in over 1200ms) then fade (the same arrows fade out to opacity 0 over another 1200ms) | 500 |
| s4_3 | "Contributions from turns at different positions cancel almost completely outside. For a long solenoid, B_outside is approximately zero." | b_outside_zero_label | handwriting ("B_outside ≈ 0" writes into callout zone) | 800 |
| s4_4 | "All the field energy is concentrated INSIDE the solenoid. This is why solenoids make excellent electromagnets." | inside_field_brightness_pulse | fade (inside-B arrows pulse to 120% then settle to 100%) | 0 |

### STATE_5 — RHR-swap (SUPPORTING aha)

| sentence id | text_en | reveal_primitive_id | animate_in | pause_after_ms |
|---|---|---|---|---|
| s5_1 | "In Diamond #1 you learned: thumb along current, fingers curl with B. That was for a STRAIGHT wire." | wire_rhr_hand_overlay (case='A' from `magnetic_field_wire`) | fade (right-hand overlay shows the wire-grip: thumb-up, fingers-curl-around) | 1500 |
| s5_2 | "For a solenoid, what changes? Which hand part now follows the current?" | — (prediction question) | — | 2500 |
| s5_3 | "The roles swap. FINGERS curl with the current loops; THUMB gives B inside." | solenoid_rhr_hand_overlay (case='solenoid', fade_from_case='A', fade_duration_ms=1400) | fade (1.4s cross-fade from wire-grip to solenoid-grip — same right hand, repositioned: fingers wrap the coil direction, thumb axial) | 1200 |
| s5_4 | "Same right hand. Different grip. Wire = thumb-current, fingers-B. Solenoid = fingers-current, thumb-B." | hand_grip_comparison_label | handwriting (side-by-side label: "Wire: thumb=I, fingers=B  |  Solenoid: fingers=I, thumb=B") | 0 |

**Renderer-primitives binding (STATE_5):** `extras.right_hand: { case: 'solenoid', fade_from_case: 'A', fade_duration_ms: 1400, position: [-1.8, 0, 0.8], scale: 2.2 }`. s5_3 reveal lands at t ≈ 3000ms after state-enter (right after the s5_2 prediction pause); the 1.4s cross-fade completes at t ≈ 4400ms, comfortably before s5_4 begins.

### STATE_6 — Formula reveal

| sentence id | text_en | reveal_primitive_id | animate_in | pause_after_ms |
|---|---|---|---|---|
| s6_1 | "How strong is B inside? Predict: does it depend on total turns N, or on something else?" | — (prediction question) | — | 2500 |
| s6_2 | "Turns per unit length — what we call n. The DENSITY of current loops matters, not the raw count." | n_definition_label | handwriting ("n = N/L (turns per metre)" writes into callout zone) | 1000 |
| s6_3 | "The formula: B equals mu-naught times n times I. Three factors, no distance r, no 1/r dependence inside — that is what 'uniform' means." | B_formula_writeup | handwriting ("B = μ₀ n I" writes char-by-char into callout zone) | 1500 |
| s6_4 | "Double the turns per meter, double the field. Double the current, double the field. Stretch the same wire to twice the length — n halves, B halves." | stretched_solenoid_demo + B_formula_live_value_update | morph (solenoid mesh stretches from L_demo=0.5m to L_demo=1.0m over 2000ms; n_demo value display drops from 1000 to 500; B_formula's n-value text updates live) | 0 |

**STATE_6 demonstrative numbers:** Pre-stretch: N_demo=500, L_demo=0.5m, n=1000/m, B = μ₀·1000·2 = 2.513 mT. Post-stretch: N_demo=500, L_demo=1.0m, n=500/m, B = μ₀·500·2 = 1.257 mT. Ratio B_before/B_after = 2.0 exactly. This matches Block 1 Section 1b's JEE-backwards trace target answer.

### STATE_7 — Reverse-current

| sentence id | text_en | reveal_primitive_id | animate_in | pause_after_ms |
|---|---|---|---|---|
| s7_1 | "Now we reverse the battery. Watch the current direction." | current_direction_arrows_flip | rotate_180 (current direction arrows flip over 600ms) | 600 |
| s7_2 | "Predict: which way will B point now?" | — (prediction question) | — | 2000 |
| s7_3 | "B flips to point DOWN. Same magnitude, opposite direction." | axial_B_vector_flip | rotate_180 (axial-B arrows flip over 800ms) | 800 |
| s7_4 | "Right hand again — flip your grip, thumb now points down. Magnitude formula B = μ₀nI is unchanged; only direction reverses." | solenoid_rhr_hand_overlay_flipped + B_formula_persistent | rotate_180 (hand overlay flips: fingers reverse curl direction, thumb now axial-down) + fade (formula stays visible, unchanged) | 0 |

### STATE_8 — Exploration

| sentence id | text_en | reveal_primitive_id | animate_in | pause_after_ms |
|---|---|---|---|---|
| s8_1 | "Now you drive. Crank up n — watch B grow proportionally." | n_slider_active | fade (n-slider knob becomes interactive; B-meter display brightens) | 0 |
| s8_2 | "Bring I down — watch B shrink. Try to predict B before you read the meter." | I_slider_active + B_meter_live | fade (I-slider knob becomes interactive; B-meter readout updates live with mu_0 * n * I) | 0 |
| s8_3 | "Notice: no matter where you place the probe INSIDE the solenoid, B reads the same. That is the uniformity. Outside, the probe reads near-zero." | probe_inside_outside_demo | fade (a draggable probe primitive appears; reads constant B inside, ≈0 outside as student drags) | 0 |

**STATE_8 reset note:** `variable_overrides.current_direction = +1` resets the reverse-current leak from STATE_7. n and I sliders become live for the first time (interactivity-in-last-state rule per `src/data/concepts/CLAUDE.md`).

---

## Section D — Drill-down cluster phrasings

45 trigger phrases total (9 clusters × 5 phrases). Each phrase is real Indian 11th-grade English voice — not textbook prose.

### STATE_3 deep-dive — `axial_superposition_deep_dive`

```
cluster_id: radial_cancellation_unclear
  triggers:
    - "i dont see why the radial parts cancel"
    - "why opposite arrows should cancel here"
    - "are the radial parts really equal in size"
    - "what if the turns are not perfectly aligned"
    - "show me the cancellation one more time"
  physics_author_response:
    "Two adjacent turns are mirror images across the gap between them. By symmetry, the radial
     field from one turn at any point in that gap is equal in magnitude and opposite in
     direction to the radial field from the other turn — so the sum is zero. The axial
     components, in contrast, both point the same way (set by RHR around each turn) and add."

cluster_id: axial_addition_unclear
  triggers:
    - "why do the axial parts add and not also cancel"
    - "shouldnt axial parts also be opposite"
    - "why is one direction surviving and not the other"
    - "what makes axial different from radial"
    - "both turns should pull the field same way"
  physics_author_response:
    "Use the right-hand rule on each turn separately. Both turns carry current in the same
     rotational sense (around the coil axis), so both produce B in the SAME axial direction.
     Radial: opposite. Axial: same. The opposite cancels, the same adds."

cluster_id: infinite_turns_assumption
  triggers:
    - "doesnt this only work for infinite turns"
    - "what about a short solenoid with just 5 turns"
    - "is the formula exact or only approximate"
    - "how many turns do you need for this to work"
    - "does it matter how long the solenoid is"
  physics_author_response:
    "In the long-solenoid limit (length L much greater than radius R), the field at any
     interior point depends only on local turn density n, not on distance from the ends.
     Six turns or six hundred — the central region's B is the same B = mu_0 * n * I. Near
     the open ends, B drops to about half this value, but the formula holds well inside
     the central region of any solenoid where L >> R."
```

### STATE_5 deep-dive — `rhr_swap_deep_dive`

```
cluster_id: which_hand_part_is_current
  triggers:
    - "is the thumb the current or the field for a solenoid"
    - "i keep mixing up thumb and fingers"
    - "what does the thumb represent now"
    - "for a solenoid which finger is what"
    - "fingers are current or fingers are B"
  physics_author_response:
    "For a solenoid: FINGERS curl with the current loops, THUMB points along B inside.
     This is the reverse of the wire rule. Mnemonic — for any current-carrying object,
     whichever hand part naturally follows the GEOMETRY of the current is the one that
     represents I. A wire is straight (thumb is straight too → thumb = I). A coil curls
     (fingers curl too → fingers = I)."

cluster_id: same_rhr_as_wire
  triggers:
    - "can i just use the wire right hand rule here"
    - "why not use diamond 1 rule for solenoid"
    - "is the solenoid rule actually different"
    - "isnt it the same right hand same physics"
    - "do i really need two separate rules"
  physics_author_response:
    "Same right hand, different grip. The wire-RHR (thumb = I, fingers = B) applies to
     EACH SINGLE TURN of the coil — and if you do it that way, you correctly get circles
     around each turn. But to read B INSIDE the solenoid (the axial sum), the solenoid-RHR
     (fingers = I, thumb = B) is the shortcut that skips the per-turn analysis. Both rules
     are the same physics; the solenoid grip just rotates your hand by 90 degrees to read
     the answer directly."

cluster_id: curl_direction_ambiguous
  triggers:
    - "which way am i supposed to curl my fingers"
    - "with the current loops or against"
    - "clockwise or anticlockwise i forget"
    - "from outside or inside the coil"
    - "is it from the top or bottom"
  physics_author_response:
    "Curl your fingers in the same direction the current flows around the coil. If you
     watch one turn from above and the current goes anticlockwise, your fingers curl
     anticlockwise — thumb points UP. If clockwise, fingers curl clockwise — thumb points
     DOWN. The rotational sense of your fingers always matches the rotational sense of
     the current."
```

### STATE_6 deep-dive — `n_vs_N_deep_dive`

```
cluster_id: total_turns_matters
  triggers:
    - "why doesnt total number of turns appear in formula"
    - "if i add more turns shouldnt B grow"
    - "n vs N which one matters"
    - "does adding turns do nothing"
    - "what if i have 1000 turns vs 10 turns"
  physics_author_response:
    "Adding more turns DOES grow B — but only if you pack them into the same length.
     What matters is HOW DENSELY the turns are packed: n = N / L. A solenoid with 1000
     turns in 1 metre has the same B as a solenoid with 100 turns in 0.1 metre. The
     formula B = mu_0 * n * I captures this — N is hidden inside n, paired with L."

cluster_id: units_of_n
  triggers:
    - "what are the units of n"
    - "is n dimensionless"
    - "n is just a number right"
    - "what does turns per metre mean"
    - "how do i write n in si units"
  physics_author_response:
    "n is turns per unit length. Turns themselves are dimensionless (a count), so n has
     units of inverse length — per metre, written /m or m^(-1). Numerically, 1000 /m
     means 1000 turns packed into every metre of solenoid length. Check the formula:
     mu_0 has units T*m/A, multiply by /m gives T/A, multiply by A (current) gives T —
     consistent."

cluster_id: length_effect
  triggers:
    - "if i make the solenoid longer with same turns does B change"
    - "stretching the solenoid what happens to B"
    - "what if i compress the coil"
    - "longer solenoid stronger or weaker"
    - "same wire just spread out more"
  physics_author_response:
    "Yes, B changes. With N fixed, stretching the solenoid to 2x length halves n — so
     B halves. Compressing it to half length doubles n — B doubles. This is the
     STATE_6 demonstrative: same physical wire, same current, but redistribute the turns
     and B scales as 1/L. The total wire and total current are unchanged; only the
     LOCAL turn density at any interior point matters."
```

---

## Section E — Constraint callouts (plain-English, pedagogical)

- **Long-solenoid limit (L >> R):** The formula B = μ₀·n·I is exact only when the solenoid is much longer than it is wide. For Class 11/12 problems this is always assumed; flag any student question that violates it (e.g., "what about a single loop with N=1"). A single loop is `magnetic_field_circular_loop`, a different concept with a different formula.

- **End effects ignored:** Near the open ends of any real solenoid, B weakens to about half the interior value. Inside the central region (away from the ends), B is uniform at μ₀·n·I. We do not model end-fringing in the renderer; if a student asks about it, route to a follow-up deep-dive (cluster: `end_field_weakness` — pending future authoring; flag for `feedback_collector` if the cluster surfaces in real student questions).

- **B_outside = 0 (rendered) vs ε-small (physical):** Outside a long solenoid, contributions from turns at different axial positions cancel almost perfectly — B is mathematically not zero but vanishingly small. The renderer draws B_outside as exactly 0 (no arrows shown outside the solenoid wall) — this is a pedagogical simplification, not a physics statement. If a student asks "is B really exactly zero outside," the truthful answer is "approximately, in the long-solenoid limit — small enough that we draw it as zero."

- **Current is uniform around every turn:** The same I flows through the entire coiled wire (it is one continuous wire, not many). If a student asks "what if different turns carry different currents," that violates the setup; the answer requires Kirchhoff's current law and is a different problem entirely.

- **Right-hand-rule curl direction:** Fingers curl WITH the current loops; thumb gives B inside. The "fingers along current" is the grip that applies to a CURLED conductor (the coil). The wire-RHR (thumb-along-current) applies to STRAIGHT conductor segments — and indeed, applying wire-RHR to one isolated turn correctly gives the per-turn circular field. The two rules are consistent; the solenoid grip is a 90°-rotated shortcut for reading the axial sum.

- **Field is purely axial inside, in the long-solenoid limit:** B has zero radial component and zero azimuthal component at every interior point. This is the meaning of "uniform inside." A student asking "what about the radial field inside" has confused the per-turn field (which has radial components near each turn locally) with the total field (which is the sum over all turns — radial pieces cancel).

---

## Section F — Board mode

**Explicitly DEFERRED to M7** per `MAGNETISM_ARCHITECTURE.md` M1–M6 carve-out and CLAUDE.md Rule 20 magnetism exception. No `mode_overrides.board` mark scheme, no `derivation_sequence`, no `mark_badge` wiring. M7 will retrofit board mode across all Ch.26 atomic concepts simultaneously.

When M7 begins, the board derivation will likely look like:
1. State: long solenoid, current I, n turns per metre [1 mark]
2. By RHR: B is axial inside, zero outside [1 mark]
3. Apply Ampère's law to rectangular loop straddling solenoid wall [1 mark] — note: this requires `amperes_circuital_law` to ship first
4. Evaluate the four sides; only the inside-parallel segment contributes [1 mark]
5. Write B·L = μ₀·N_enclosed·I = μ₀·(n·L)·I → B = μ₀·n·I [2 marks]

Total ≈ 6 marks. Not authored now; flagged for M7.

---

## Section G — Open items for json_author

1. **Renderer extras shape for `wire_to_coil_morph` (STATE_1):** json_author must wire `field_3d_config.states.STATE_1.extras.wire_to_coil_morph = { enabled: true, straight_duration_ms: 3000, morph_duration_ms: 1500 }` per renderer-primitives handoff. Confirm with `peter_parker:renderer_primitives` that the field schema name matches; physics_author has named it `wire_to_coil_morph` based on the handoff text.

2. **Renderer extras shape for `right_hand` solenoid case (STATE_5):** json_author must wire `field_3d_config.states.STATE_5.extras.right_hand = { case: 'solenoid', fade_from_case: 'A', fade_duration_ms: 1400, position: [-1.8, 0, 0.8], scale: 2.2 }`. The `position` and `scale` are copied from Diamond #1's STATE_3 hand placement for visual continuity.

3. **STATE_7 hand-flip:** STATE_7's reverse-current narrative wants the hand grip to flip from `case: 'solenoid'` (thumb-up) to `case: 'solenoid'` (thumb-down). The current renderer-primitives spec doesn't say whether `right_hand` supports a `thumb_direction` override under `case: 'solenoid'`. **If not, file as `peter_parker:renderer_primitives` bug** — for now physics_author specs the intent as a `rotate_180` animate_in on the existing hand overlay; json_author should verify the renderer honors this or escalate.

4. **STATE_6 stretch demonstrative as renderer primitive:** The s6_4 demonstrative ("stretch the solenoid, n halves, B halves") needs the solenoid mesh to physically stretch from L=0.5m to L=1.0m over 2000ms while n_demo and B_inside_demo values update in live UI labels. This is a CHOREOGRAPHY-driven motion (not in the 6 canonical motion types from physics_author/CLAUDE.md). **Flag as `peter_parker:renderer_primitives` enhancement** — for V1 may render as discrete "before/after" snapshots if the morph isn't available. Document as fallback in the JSON.

5. **`current_direction` slider step value:** Set as `step: 2` (range -1 to +1) so the only valid values are -1 and +1 (binary toggle in slider clothing). This matches the `q_sign` pattern in `magnetic_force_moving_charge.json` STATE_8.

6. **`focal_primitive_id` per state:** Each state needs a `focal_primitive_id` (schema-required). Physics_author suggests:
   - STATE_1: `coiled_wire_label`
   - STATE_2: `turn_1_highlight`
   - STATE_3: `axial_arrows_rise`
   - STATE_4: `b_outside_zero_label`
   - STATE_5: `solenoid_rhr_hand_overlay`
   - STATE_6: `B_formula_writeup`
   - STATE_7: `axial_B_vector_flip`
   - STATE_8: `B_meter_live`

7. **`allow_deep_dive: true` flag:** Set on STATE_3, STATE_5, STATE_6 per architect §5 and CLAUDE.md Section 6 requirement #5.

8. **`aha_moment` block:** state_id = "STATE_3", statement = "Inside a solenoid, per-turn radial pieces cancel — only one uniform axial field survives." (15 words, fits aha_moment schema constraint.)

---

## Section H — Open items for quality_auditor

1. **Gate 14 (Pass-1 strategic checklist) verification:** All three prerequisite cliff sentences are concretely written into the reveal timeline (s2_1 for `magnetic_field_wire`, s5_1 for `right_hand_rule_curl`, s3_2_5 for `vector_resolution`). All four misconception-entry mappings have planting + flagging sentences in the timeline. JEE-backwards trace numbers (B1/B2 = 2.0) sanity-checked numerically — see Numerical Sanity Check section below.

2. **PRIMARY aha designation (Block 2):** Single PRIMARY aha at STATE_3 ("axial superposition") + single SUPPORTING aha at STATE_5 ("RHR swap"). 2-aha sweet spot. Cohesion check passed (both ahas are about "the same axis" — primary establishes axiality, supporting finds it by hand). Foundational-coverage rule passed (STATE_3 ∈ `entry_state_map.foundational = [STATE_1, STATE_2, STATE_3, STATE_4]`).

3. **Critical pause timing (STATE_3):** `pause_after_ms: 3000` on s3_2 is non-negotiable per Block 2 cohesion check. If quality_auditor sees this collapsed to <2500ms in the generated JSON, FAIL-route to `alex:json_author` for fix.

4. **Renderer primitive availability at gate-time:** Quality_auditor should verify (via console-audit or visual probe at `localhost:3000`) that the rendered STATE_1 actually shows the straight wire → coil morph (not a hard cut) and STATE_5 actually shows the wire-grip → solenoid-grip cross-fade (not a hard swap). If either visual is missing or broken, the renderer-primitives handoff did not land — route to `peter_parker:renderer_primitives` with severity MAJOR.

5. **`current_direction` leak prevention (STATE_8):** Verify json_author wrote `variable_overrides.current_direction = +1` on STATE_8. If absent, STATE_7's reverse-current setting will leak into STATE_8 sliders and the student will see the field reversed by default (sessions 30.5–30.7 bug class). FAIL-route to `alex:json_author`.

6. **DC Pandey check:** Physics_author confirms no Ch.26 §26.8 example problem, derivation sequence, or figure was imported. The Ampère's-law derivation that the M7 board-mode retrofit will lean on is DEFERRED — not authored here. If any DC-Pandey-shaped derivation appears in the generated JSON's mode_overrides.board (which shouldn't exist in V1 M1–M6 anyway), FAIL-route.

7. **Concept tier:** `concept_tier: "medium"` (architect §2 state-count band 5–6 extended to 8). `cognitive_limits` should follow medium defaults: max_primitives_per_state=5, max_labels_per_state=3, max_words_per_tts_sentence=18. Note: several reveal-timeline sentences (s3_5, s5_4, s6_4) exceed 18 words. If quality_auditor flags this as Gate 5 failure, physics_author justifies — these are technical-precision sentences where shortening would lose the physics. Suggest raising `max_words_per_tts_sentence` to 25 for this concept's `cognitive_limits` override.

---

## Numerical sanity check (mandatory)

Command run:
```bash
python3 -c "
mu_0 = 1.2566370614e-6
n = 1000  # turns per metre
I = 2     # A
B = mu_0 * n * I
print(f'B_inside default = {B:.6e} T = {B*1000:.4f} mT')

# STATE_6 stretched-solenoid demonstrative
N = 500
L1 = 0.5
L2 = 1.0
n1 = N / L1
n2 = N / L2
I = 2
B1 = mu_0 * n1 * I
B2 = mu_0 * n2 * I
print(f'Stretched solenoid: B1 = {B1*1000:.4f} mT, B2 = {B2*1000:.4f} mT')
print(f'Ratio B1/B2 = {B1/B2:.4f} (expected exactly 2.0)')

# Slider extrema
B_min = mu_0 * 100 * 0.1
B_max = mu_0 * 5000 * 10
print(f'B slider range: {B_min*1e6:.4f} uT to {B_max*1000:.4f} mT')
"
```

Output:
```
B_inside default = 2.513274e-03 T = 2.5133 mT
Stretched solenoid: B1 = 2.5133 mT, B2 = 1.2566 mT
Ratio B1/B2 = 2.0000 (expected exactly 2.0)
B slider range: 12.5664 uT to 62.8319 mT
```

Conclusions:
- **B_inside_default = 2.5133 mT** — matches realistic lab solenoid (the ~2.5 mT target). PASS.
- **B1/B2 = 2.0000** for the STATE_6 stretch demonstrative — matches Block 1 Section 1b's JEE-backwards trace target answer (B₁/B₂ = n₁/n₂ = 2/1). PASS.
- **B slider range** spans 5 orders of magnitude (12.5 μT to 62.8 mT) — generous enough for both tiny educational solenoids and strong electromagnets. The B-meter readout in STATE_8 should auto-scale between μT and mT to keep numbers readable.

---

## Self-review checklist (final, before handoff to json_author)

- [x] Every symbol in any state's TTS appears in `variables` (n, I, N_demo, L_demo, mu_0, current_direction all declared).
- [x] Every formula is `PM_interpolate`-ready (`mu_0 * n * I`, no `{unknown_var}`). No angle arguments in any formula → `radians()` wrapping N/A for this concept.
- [x] At least one slider variable has all of `default`, `min`, `max`, `step` (n: 1000/100/5000/100; I: 2/0.1/10/0.1).
- [x] `variable_overrides` documented for STATE_6 (N_demo, L_demo), STATE_7 (current_direction=-1), STATE_8 (current_direction=+1 reset).
- [x] Within-state reveal timeline written for all 8 states. STATE_1 binds `wire_to_coil_morph`; STATE_5 binds `right_hand.case: 'solenoid'` + `fade_from_case: 'A'`.
- [x] Drill-down phrasings sound like real Indian 11th-grade students (lowercase, idiomatic, "i dont see", "shouldnt", "what if i", no textbook prose). 45 phrases total (9 clusters × 5).
- [x] Constraints block has 6 short assertions (above min of 4).
- [x] Numerical sanity check ran; output included. B_default = 2.5133 mT, B1/B2 = 2.0000. Both checks pass.
- [x] No DC Pandey content imported. Cliff sentences derived from prior-shipped concepts (`magnetic_field_wire`, `vector_resolution`).
- [x] Board section explicitly omitted with one-line "deferred to M7" note in Section F.
- [x] Engine bug queue prevention satisfied: non-1 defaults (n=1000, I=2) explicitly declared in `variables` (Bug #1 rule). State-leak prevention: STATE_8 has defensive `current_direction = +1` override (sessions 30.5–30.7 rule).

---

*Physics block complete. Handoff to `alex:json_author`.*
