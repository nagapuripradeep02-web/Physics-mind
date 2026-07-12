# Architect skeleton — `electric_potential_meaning`

> **[VINTAGE — pre-Rule-31/35 architecture (Socratic beats, Indian anchors, EPIC-C). Historical record only — never clone.]**

> **[OLD MODEL — superseded by Rule 31, 2026-07-02.]** This exemplar predates the straightforward +
> per-state-contextual-controls doctrine: it uses Socratic predict→reveal pacing, `wait_for_answer` /
> `pause_after_ms` beats, and/or "sliders in the last state only". Do NOT clone its pacing or control
> placement for new concepts — clone `faraday_law_induction_skeleton.md` instead. Physics content and
> structure remain valid reference.

**Concept:** Electric Potential — Work Done per Unit Charge · **chapter:** Class 12, Electrostatic Potential and Capacitance (Ch.2) §2.1 Introduction + §2.2 Electrostatic Potential · **renderer:** `field_3d`, scenario `point_charge_positive` (equipotential shells = the hero primitive) · **schema:** v2.3 · Authored 2026-06-26.

**Status:** Pass-1 v2.3 skeleton. CONCEPTUAL-ONLY (Rule 20 suspension — no `mode_overrides`). EPIC-L-first (Rule 11 / 2026-06-10 — no `epic_c_branches`; misconceptions confronted inside EPIC-L via Rule 16a). This is the **foundation/meaning** diamond of Ch.2: it teaches what V *means* (V = W/q) and stops short of the V = kQ/r formula, which is a separate sibling (`electric_potential_point_charge`) that will declare THIS one as a prerequisite.

**Engine bug queue consulted:** Read `engine_bug_queue` field_3d `incident` + `directive` rows + the FIELD3D_SCENARIO_CHECKLIST distillation. No row names `electric_potential_meaning` (new concept). Renderer-owned scars (`field3d_scenario_missing_devstatemeta_recognition`, `field3d_reveal_too_subtle_fails_d7`, `field3d_explorer_state_static_d1p`, `field3d_time_gated_visual_invisible_in_slider_state`, `field3d_position_vector_foreshortened_3q_camera`, `field3d_oneshot_element_vanishes_after_animation`) are FLAGged in §10(d)/Handoff for the engine build — the `point_charge_positive` scenario today has NO per-state equipotential-shell toggle, NO labeled-shell-with-V primitive, NO discrete test-charge-at-position placement, and NO `deriveStateMeta` recognition for this teaching arc.

> **FOUNDER DECISION (2026-06-26):** the FLAGged renderer gap is APPROVED for engine work — build the reusable potential primitives in `peter_parker:renderer_primitives` (1/r-spaced V-labelled shells with per-state reveal, route-animating test charge + work tally, ΔV/∞ markers, draggable V-readout explorer, deriveStateMeta recognition). These primitives are reused across the whole Ch.2→capacitance ladder. Engine build happens AFTER physics-author firms the data contract, BEFORE json-author.

---

## 1. Atomic claim

Electric potential V at a point is the **work done per unit positive test charge to bring that charge from infinity to the point** — a single scalar number attached to each location in the field (no direction), path-independent because the electrostatic force is conservative, measured against the reference V(∞) = 0 — so V is a property of the place, not of the test charge you probe it with, and the potential difference ΔV between two points is the per-unit-charge work to move between them.

Does **not** cover: the point-charge formula V = kQ/r (deferred to `electric_potential_point_charge`); E = −dV/dr / V = −∫E·dl as a computational tool (a one-line "E is the slope of V" teaser at the very end is the most this diamond does); potential energy of a *system* of charges; the volt as a unit beyond "joules per coulomb"; capacitance; conductor equipotential.

One student question: *"Everyone says voltage at a point — but a point isn't a battery terminal. What does it actually MEAN to say this spot in space has a potential, and why is it just one number and not an arrow like the field?"*

---

## 2. State count + arc

**State count: 7** (medium-to-complex foundation). Carries one new scalar quantity (V), one non-obvious property (path-independence from conservativeness), one stored-energy reframing (W → U), the divide-out-q abstraction (W/q makes V a property of the place), one reference convention (V(∞)=0 + ΔV), and one unifying contrast (V = altitude scalar vs E = slope vector). Must defeat *two* deep misconceptions (V-is-a-vector/field AND work-needs-a-path) and still land the scalar-altitude aha.

| # | state_id | Title (one-line content) | Purpose | `teaching_method` | `advance_mode` |
|---|---|---|---|---|---|
| 1 | STATE_1 | "A +Q source — how much effort to push a test charge in close?" | **Hook + plant the altitude intuition.** +Q at origin, faint radial field lines, a test charge +q far out. Pose the effort question. NO V symbol, NO W/q, NO formula yet. | `narrative_socratic` | `wait_for_answer` |
| 2 | STATE_2 | "Two different paths, same total effort: the field is conservative" | Bring +q from far to the SAME point along two visibly different routes; the work tally is identical. Confronts "you need a particular path." | `narrative_socratic` | `wait_for_answer` |
| 3 | STATE_3 | "That stored effort is potential ENERGY of the charge" | The work done against the field is banked as the charge's electric potential energy U; release it and it flies back out. | `narrative_socratic` | `auto_after_tts` |
| 4 | STATE_4 | "Divide out the test charge: V = W/q is a property of the PLACE" | Use a 2q test charge → twice the work, SAME W/q. Dividing by q removes the prober; V = W/q belongs to the location/field. **The definition.** | `derivation_first_principles` | `manual_click` |
| 5 | STATE_5 | "Reference at infinity: V(∞)=0, and ΔV between two points" | Anchor the zero at infinity; V at a point = W/q from infinity; ΔV(A→B) = work per unit charge to go A→B = V_B − V_A. | `narrative_socratic` | `manual_click` |
| 6 | STATE_6 | "V is a SCALAR: shells of equal potential; E is the perpendicular arrow" | **PRIMARY aha.** Equipotential shells light up (one number per shell, no arrow); the vector E is drawn ⊥ to the shells, "downhill." Confronts "V is a vector / V is the field." | `compare_contrast` | `manual_click` |
| 7 | STATE_7 | "Explore: drag the test charge across shells, read V — altitude vs slope" | Final interactive. Drag the test charge; the shell it sits on highlights and its V-label reads out; E-arrow rotates to stay ⊥. Altitude (V, scalar) vs slope (E, vector). | `exploration_sliders` | `interaction_complete` |

**advance_mode variety (Rule 15):** four distinct — `wait_for_answer` (1,2), `auto_after_tts` (3), `manual_click` (4,5,6), `interaction_complete` (7). PASS.

**Primitives per state (Rule 19, ≥3):** every state carries +Q source + radial field lines + ≥1 of {test charge, equipotential shells, work tally, V-label, E-arrow, contrast label}; most 4–5. Inherit sibling cognitive limits: `max_primitives_per_state: 5`, `max_labels_per_state: 3`, `max_words_per_tts_sentence: 30`.

**Interactivity rule:** sliders / draggable test charge / `interaction_complete` only in STATE_7. No interactive controls in STATE_1–6.

### Engine-scar conformance (architect-owned directives)

| `bug_class` | How satisfied |
|---|---|
| `teach_concrete_before_abstract_compare` | STATE_6: student already knows E (prerequisite vector) — E referenced first, then shells laid beside it, then "V is the number on the shell, E is the perpendicular arrow." STATE_4: the SAME work-from-infinity (concrete) divided by q to abstract into V. |
| `teach_reveal_synced_to_narration` | Every reveal `at_ms` tuned to its narration beat. Shells appear when "surfaces of equal potential" is said; the second path draws when "a completely different route" is said. |
| `teach_show_quantity_live_when_named` | Work tally W increments visibly as the charge moves (STATE_2/3); the `V` label writes onto a shell when "this place has a potential V" is said (STATE_4/6); ΔV draws between two markers when "difference between two points" is said (STATE_5). |
| `teach_distinct_reference_lines_for_two_radii` | Two distinct positional quantities — the test charge's **current position** (a placed sphere + its shell) and the **reference at infinity** (a far ghost marker "∞, V=0"). Separate, clearly-labelled. |
| `teach_visual_must_match_narration` | STATE_2 "same total effort either way" = two routes, two identical tallies; STATE_4 "twice the charge, twice the work, same ratio" = 2q bigger, W doubles, W/q unchanged; STATE_6 "scalar — one number, no direction" = shells carry plain numbers, E carries an arrowhead; "perpendicular" = E meets shell at 90°. |
| `teach_do_not_prespoil_a_later_reveal` | STATE_1 shows NO `V`, NO `W/q`, NO formula. Symbol `V` + `V = W/q` first in STATE_4; "scalar" + shells reveal first in STATE_6; `V(∞)=0` first in STATE_5. Forward V = kQ/r teaser gated to a single closing pill in STATE_7. |
| `teach_color_each_element_by_its_own_sign` | Source +Q red (positive); positive test charge +q amber; equipotential shells a neutral scalar colour (cyan `#4FC3F7`, with a per-shell +/− number); E vector green (field colour inherited from `electric_field_point_charge`). |

---

## 3. Within-state choreography plan (Socratic reveal)

All TTS plain English, ≤30 words/sentence, Van de Graaff / charged-comb anchor, no Hinglish. **Pre-spoil guard:** no sentence/label in STATE_1–3 names `V`, `W/q`, "potential" (as the quantity), or any formula; "potential energy" (U) first in STATE_3, the quantity V (= W/q) first in STATE_4, `V(∞)=0` first in STATE_5, "scalar" + equipotential shells first in STATE_6.

**STATE_1 — Hook (prediction; no new physics revealed):**
- t=0: +Q source sphere at origin (red) + faint radial field lines + a +q test charge far out. No work tally, no V, no formula.
- s1_1: introduces the charged dome (Van de Graaff anchor) and the small test charge sitting far away where the field barely reaches.
- s1_2 (prediction): "To push this small positive charge in close to the dome — against the field shoving it away — will it take effort, and does it matter which way you walk it in?" — NO V, NO W/q on canvas.
- `pause_after_ms ≈ 2600` after s1_2. No reveal fires; resolution withheld to STATE_2 (path) and STATE_4 (definition). Plants BOTH the altitude instinct and "which path matters?".

**STATE_2 — path-independence reveal (predict→reveal):**
- t=0: +Q + faint field lines + +q far out + empty work tally "W = …" in a corner zone.
- s2_1 (prediction): "Watch me bring it in two ways. Path one is a straight dash inward. Path two loops the long way around. Predict — same effort, or different?" `pause_after_ms ≈ 2800`.
- Reveal (s2_2): path 1 (straight radial) animates +q inward; the **work tally W ticks up** as it moves; lands on the destination with "W = W₀".
- Reveal (s2_3): path 2 (a visibly different curved/looping route) animates a ghost +q from the same start to the same end; its **own tally ticks up** — lands on the identical W₀. Two tallies side by side, equal.
- s2_4 (explanation): the electrostatic force is conservative — only start and end points matter, never the route, so the work to reach a point is a fixed number for that point.

**STATE_3 — potential-energy reframe (predict→reveal):**
- t=0: +Q + +q held at the destination + the banked work value as a small "energy stored" badge (no symbol U at t=0).
- s3_1 (prediction): "That effort you spent pushing in didn't vanish. If I let go of the charge right now, what happens?"
- Reveal (s3_2): release — +q is let go and **flies back outward** along the field, the stored-energy badge draining to zero as it speeds up.
- s3_3 (explanation): the work went into the charge's electric **potential energy** U at that location — stored effort the field gives back when released. **Label `U` first appears here.**

**STATE_4 — the definition V = W/q (predict→reveal):**
- t=0: +Q + +q at the destination + the work value W on the tally.
- s4_1 (setup): the work to bring a charge here depends on how big the charge is — a fatter charge fights the field harder.
- s4_2 (prediction): "Swap the small +q for a +2q, twice the charge. Predict the work to bring it to the same point — and predict the work divided by the charge."
- Reveal (s4_3): the test charge **doubles in size to 2q**; the **work tally doubles** (W → 2W); a second label **W/q stays unchanged**.
- Reveal (s4_4): the `V = W/q` label **writes into the callout zone** and a `V` value writes onto the destination point — "this place has a potential V." **Symbol `V` + `V = W/q` first appear here.**
- s4_5 (explanation): dividing out the test charge strips away the prober — what's left, V = W/q, is a property of the place and the source field, the same number whatever charge you used.

**STATE_5 — reference at infinity + ΔV (predict→reveal):**
- t=0: +Q + destination point carrying its V + a far ghost marker at the edge.
- s5_1: we needed a starting line to measure "work from where?" — the natural zero is infinitely far away, where the field can't reach.
- Reveal (s5_2): the far ghost marker lights up with **"∞ · V = 0"** (the reference). No formula — only the convention marker.
- s5_3 (prediction): "Now mark a second point, B, closer in than A. Predict — is B's potential higher or lower than A's, for this positive dome?"
- Reveal (s5_4): a second point B is placed; a **ΔV bracket draws between A and B** labelled `ΔV = V_B − V_A` = work per unit charge to go A→B.
- s5_5 (explanation): closer to a positive dome = more work needed = higher V; the difference ΔV between two points is the per-unit-charge work to move between them — that's what a "voltage between two points" really is.

**STATE_6 — PRIMARY aha: scalar shells + perpendicular E (compare_contrast):**
- t=0: +Q + faint field lines (the known E) + the V values from STATE_4/5 still floating.
- s6_1 (concrete-first): "You already know E — it's an arrow, a vector, one at every point, pointing which way a charge gets pushed. Here it is, faint."
- s6_2 (prediction that breaks V-is-a-vector): "Is V an arrow too? Does the potential at a point have a direction? Predict before I reveal the shells."
- Reveal (s6_3): the **equipotential shells fade in** — concentric cyan wireframe spheres, each carrying a single plain V number (no arrowhead). All points on one shell share one V.
- Reveal (s6_4): the **E vector is drawn on a shell, meeting it at 90°**, pointing from high-V shell toward low-V shell ("downhill").
- s6_5 (explanation): V is a scalar — one number per place, no direction, so points of equal V form whole surfaces (the shells). E is the vector that points straight downhill, always perpendicular. **"scalar" + "equipotential" first appear here.**

**STATE_7 — Exploration (interaction_complete):**
- t=0: +Q + equipotential shells (each labelled with its V) + a draggable +q test charge + a live V readout + E-arrow on the charge + the V = W/q label persisting.
- s7_1: "Now you drive. Drag the test charge. The shell it sits on lights up and its potential V reads out — same V anywhere on that shell."
- s7_2: "Walk it inward across shells: V climbs. The green arrow, E, always points straight downhill, square to the shells — V is your altitude, E is the slope."
- s7_3 (forward teaser — ONLY place the next diamond is hinted): "Next: exactly how big is V at distance r from a point charge? That's V = kQ/r — the formula behind these shells."
- Draggable test charge + readout render at full immediately and track live; an idle auto-sweep moves the charge across shells when un-dragged.

---

## 4. Misconception confrontation plan (Rule 16a)

EPIC-C branches OMITTED (Rule 11 / EPIC-L-first). All five wrong beliefs confronted proactively inside EPIC-L via per-state `misconception_watch` + predict→reveal.

| # | Wrong belief | State | `visual_counter` (intent) | Predict→reveal |
|---|---|---|---|---|
| 1 | **"V is a vector / V has a direction / V IS the field."** (PRIMARY) | STATE_6 | Shells carry plain numbers (no arrowheads); the only arrow is E, ⊥ to shells. One number per place vs one arrow per place. | s6_2 "Does potential have a direction?"; s6_3/s6_4 reveal numbered shells (scalar) beside the perpendicular E. |
| 2 | **"You need a particular path / different routes cost different effort."** | STATE_2 | Two visibly different routes end with two identical work tallies. | s2_1 "same effort, or different?"; s2_2/s2_3 reveal two routes, equal W. |
| 3 | **"Potential is a force / V is what pushes the charge."** | STATE_3 + STATE_6 | STATE_3: stored effort is *energy* that converts to motion on release, not a push; STATE_6: the push is E, V is the number. | s3_1 "let go — what happens?"; s6 contrast E-arrow vs V-number. |
| 4 | **"V depends on the test charge used."** | STATE_4 | 2q doubles W but W/q unchanged; V same for q and 2q. | s4_2 "predict the work, and work ÷ charge, for 2q"; s4_3 reveals W doubles, W/q identical. |
| 5 | **"Potential and potential energy are the same."** | STATE_3 → STATE_4 transition | STATE_3 shows U (energy, scales with q); STATE_4 divides by q to get V (charge-independent). | s4_1/s4_2 contrast: U was the charge's energy; V = U/q = W/q is the place's property. |

**Rule 16a planting check:** STATE_1's question deliberately plants the altitude/effort instinct (wanted) + #2 (does the path matter — broken at STATE_2). No state inadvertently plants #1/#3/#4/#5: STATE_1–3 never name V; STATE_3 explicitly calls the stored quantity *energy* (U).

---

## 5. `has_prebuilt_deep_dive` states (cache hint, NOT a UI gate — Rule 18)

1. **STATE_4** — the V = W/q definition + divide-out-q abstraction (most-mishandled; students conflate V with U and with the test charge).
2. **STATE_2** — path-independence (the conservative-field step students resist hardest).
3. **STATE_6** — the scalar-vs-vector PRIMARY-aha state (V-is-a-vector / V-is-the-field, the single most common error).

All three remain `false`-routing for V1 ship (Explain → one-sentence feedback form; Sonnet never generates at serve time, Rule 18). Hand-author only after analytics flag the (concept, state) pair.

---

## 6. Drill-down clusters

**STATE_4:** `why_divide_by_charge`, `potential_vs_potential_energy`, `v_independent_of_test_charge`.
**STATE_2:** `why_path_doesnt_matter`, `what_makes_field_conservative`, `work_depends_only_on_endpoints`.
**STATE_6:** `is_potential_a_vector`, `why_E_perpendicular_to_shells`, `what_is_an_equipotential_surface`.

physics_author fleshes out `trigger_examples` (3–5 real-student phrasings each, plain English, no Hinglish). Per the gauss_law_line precedent, the SQL seed ships ONE founder-locked cluster per hard state — the strongest: `why_divide_by_charge` (STATE_4), `why_path_doesnt_matter` (STATE_2), `is_potential_a_vector` (STATE_6).

---

## 7. `entry_state_map`

```yaml
entry_state_map:
  foundational: [STATE_1, STATE_2, STATE_3, STATE_4, STATE_5, STATE_6]
  definition:   [STATE_4, STATE_5]
  exploration:  [STATE_7]
```

PRIMARY aha = STATE_6 ∈ `foundational` (Foundational-coverage satisfied). Aspect vocabulary for `CLASSIFIER_PROMPT` / `ASPECT_VOCABULARY`: `foundational`, `definition`, `exploration`. Default aspect = `foundational`.

---

## 8. Prerequisites

```yaml
prerequisites:
  - electric_field_point_charge   # the VECTOR E = kQ/r² — V introduced by contrast against it
  - coulombs_law                  # the conservative inverse-square force whose work defines V
```

Both shipped. Advisory only (Rule 23). Dependency edge:

```
coulombs_law
 └─ electric_field_point_charge (E, the vector)
     └─ electric_potential_meaning (V, the scalar — THIS concept)
         └─ electric_potential_point_charge (V = kQ/r — next sibling, declares THIS as prereq)
```

---

## 9. Real-world anchor

**Primary:** the metal dome of a **Van de Graaff generator** in a school physics lab — piles positive charge onto the dome, the space around it a steep "hill" of potential; sliding a tiny charged ball up close takes work against the field; higher up the hill = higher potential; far away ≈ zero (the V(∞)=0 reference); the dome's potential is one number for the whole hilltop regardless of approach — a scalar.

**Secondary:** a **plastic comb run through dry hair**, held near a thin water stream or bits of paper — sets up a potential hill; closer test charge = more work = higher potential.

**Tertiary:** a **monsoon storm cloud** before lightning — charge separates until cloud base and ground sit at hugely different potentials (a ΔV of millions of volts); the strike is ΔV made visible.

Plain English; no Hinglish, no figure references, no DC Pandey / HC Verma phrasing.

---

## 10. Definition of Done (Gate 0)

### (a) EPIC-L states by id + content — see §2 table (7 states).

### (b) Symbol-label table

| Quantity | On-canvas label | First appears |
|---|---|---|
| Source charge | `+Q` (red sphere) | STATE_1 |
| Test charge | `+q` (amber; grows to `+2q` in STATE_4) | STATE_1 |
| Electric field (faint) | `E` (green arrow / faint lines) | STATE_1 (faint), labelled STATE_6 |
| Work done | `W` (tally, increments live) | STATE_2 |
| Two paths | `path 1` / `path 2` | STATE_2 |
| Potential energy of the charge | `U` ("stored energy") | STATE_3 (NEVER earlier) |
| Work-per-charge ratio | `W / q` | STATE_4 |
| **Electric potential (definition)** | `V = W/q` + a `V` value at the point | STATE_4 (NEVER earlier) |
| Reference at infinity | `∞ · V = 0` (far ghost marker) | STATE_5 (NEVER earlier) |
| Two marked points | `A`, `B` | STATE_5 |
| Potential difference | `ΔV = V_B − V_A` (bracket A,B) | STATE_5 |
| Scalar / equipotential | `V` numbers on each cyan shell + words "scalar"/"equipotential" | STATE_6 (NEVER earlier) |
| Field ⊥ shells | `E ⟂ shells` | STATE_6 |
| Altitude vs slope | `V = altitude · E = slope` | STATE_7 |
| Forward teaser only | `V = kQ/r →` | STATE_7 (single closing pill) |

### (c) Right-hand-rule plan: **N/A** — electrostatic potential is a scalar; no cross-product, no circulation, no RHR. The only directional element is the E vector (radially outward for +Q / "downhill" ⊥ to shells), set by sign of Q and the V-gradient.

### (d) Motion plan — every state animates (D7/D1p must pass):
- **STATE_1:** field lines populate + far test charge drifts gently + the effort question writes in. (`reveal_hold` after populate.)
- **STATE_2:** charge animates inward along path 1 with W ticking up; ghost charge along path 2 with its own ticking tally; both land equal. (Continuous motion → `reveal_hold` on the two equal tallies.)
- **STATE_3:** release — charge flies outward, stored-energy badge drains to zero. (Motion → `reveal_hold` on emptied badge.)
- **STATE_4:** test charge grows q→2q; W doubles; W/q stays; `V = W/q` writes into callout + V value onto the point. (One-shot grow + write-in → `reveal_hold`; **must hold the V label visible, not fade to 0** — guards `field3d_oneshot_element_vanishes_after_animation`.)
- **STATE_5:** `∞ · V=0` marker lights up; B places; ΔV bracket draws. (Write-in → `reveal_hold`.)
- **STATE_6:** equipotential shells fade in concentrically (each with its V number); E vector draws at 90°. (Shell emergence → `reveal_hold`; fade sustains ≥0.1%/frame OR declare `reveal_hold` — guards `field3d_reveal_too_subtle_fails_d7`.)
- **STATE_7:** draggable test charge + live V readout + E-arrow rotating to stay ⊥; **idle auto-sweep** when un-dragged. (Full immediately, no clock-gating — guards `field3d_time_gated_visual_invisible_in_slider_state`; idle sweep guards `field3d_explorer_state_static_d1p`.)

**Reference-line note (guards `field3d_position_vector_foreshortened_3q_camera`):** the `∞ · V=0` marker and any A→B / ΔV bracket that must read horizontal should billboard to camera-right under the 3/4 camera.

### (e) Modes: **Conceptual-only.** No `mode_overrides`.

### (f) assessment + coverage_map + misconception_watch:
- **assessment:** 6 questions, backward-designed (full stems + 4 options + `distractor_misconceptions` + `tested_idea` + `teaches_state` + `parallel_form_stem` + `difficulty`):
  - Q1 → V = W/q (`STATE_4`) — distractors V=Wq, V=W (no divide), V=qW.
  - Q2 → V is a scalar, not a vector (`STATE_6`, aha) — distractors "V is a vector along E," "V points outward from +Q," "V is the field E."
  - Q3 → work is path-independent (`STATE_2`) — distractors "longer path = more work," "depends on the route," "curved path stores extra energy."
  - Q4 → V independent of the test charge (`STATE_4`) — distractors "2q has double the potential," "a tiny charge sees a tiny V," "V depends on q."
  - Q5 → ΔV = work per unit charge between two points; closer to +Q is higher V (`STATE_5`) — distractors sign-flip, "ΔV depends on path," "B is lower because it's closer."
  - Q6 → V (place property) vs U (= qV, energy of the charge) (`STATE_3`/`STATE_4` boundary) — distractors "V and U are the same," "U doesn't depend on q," "V = qU."
  - Q2 hits the aha state; ≥3 distinct `tested_idea`.
- **coverage_map:** `by_state` covers STATE_2 (Q3), STATE_3/4 (Q1, Q4, Q6), STATE_5 (Q5), STATE_6 (Q2); `non_assessed_states: [STATE_1, STATE_7]`.
- **misconception_watch:** one entry per STATE_1–STATE_6 (`belief` + `visual_counter` + `one_line_fix`). STATE_7 may omit.

**No TBDs.**

---

## Block 2 — Aha designation

**PRIMARY aha (STATE_6):** "Electric potential is a single scalar number at each point — surfaces of equal V wrap the charge like contour shells — and the electric field E is just the arrow pointing straight downhill, perpendicular to those shells." (10-year memory: *V is altitude, E is slope.*)
- `aha_moment.statement` (≤15 words): "Potential is a scalar — one number per place; the field E points downhill."

**SUPPORTING aha (STATE_2):** "The work to bring a charge to a point doesn't care which path you take — the field is conservative, so a point has ONE potential." Path-independence is *what makes V a well-defined single number per point* — it sets up the PRIMARY. **1 PRIMARY + 1 SUPPORTING.**

**Foundational-coverage:** PRIMARY aha STATE_6 ∈ `foundational`. PASS — no exit-pill needed.

---

## Handoff to physics_author

- **`physics_engine_config.variables`:** `Q` (source charge, demo nC, default +1, keep positive whole arc), `q_test` (default 1, =2 in STATE_4 reveal), `r` (test-charge distance, demo units — drives which shell in STATE_7), `k` + `epsilon_0` (locked, min=max=default — declared so a numeric V *value* shows on points even though the *formula* V=kQ/r is withheld from canvas), `DEMO_V_PER_NC` (locked; mirror the sibling `DEMO_E_PER_NC = 225` convention). Declare every non-1 default explicitly.
- **`computed_outputs`:** `W_demo` (work from infinity to r; clamp r ≥ 0.05), `W_per_q` (= W_demo / q_test — the invariant ratio, STATE_4), `V_demo` (= DEMO_V_PER_NC * Q / max(r, 0.05) — the demo number on points/shells; **internally uses kQ/r but NO formula label emitted before the STATE_7 teaser**), `delta_V` (= V_demo(B) − V_demo(A), STATE_5), `U_demo` (= q_test * V_demo, STATE_3). Verify: W_per_q identical for q_test = 1 and 2; V_demo rises as r falls; V_demo → 0 as r → large.
- **`formulas`:** `potential_definition` "V = W/q"; `potential_energy` "U = qV"; `path_independence` "W depends only on the endpoints (conservative force)"; `reference` "V(∞) = 0"; `potential_difference` "ΔV = V_B − V_A"; `scalar_nature` "V is a scalar; equipotential surfaces are level sets of V"; `field_relation_teaser` "E points along decreasing V, ⊥ to equipotential surfaces (full gradient relation deferred)". **Do NOT author V = kQ/r.**
- **`constraints`:** C1 V is a scalar; C2 work/V path-independent (endpoints only); C3 V independent of q (V=W/q, not Wq); C4 V(∞)=0; C5 closer to +Q ⇒ higher V; C6 U = qV scales with q, V does not; C7 E ⊥ equipotential surfaces, toward lower V; C8 ΔV is per-unit-charge work between two points. (r→0 handled by max(r,0.05); Q positive whole arc — sign-flip deferred to the formula sibling.)
- **Per-state `variable_overrides`:** lock `Q: 1` every state; lock `q_test: 1` STATE_1–3, `q_test: 2` the revealed value in STATE_4; lock the destination `r` STATE_2–6 (stable V + fixed shell radii); STATE_7 lets the drag own `r` live.
- **Per-state reveal timeline (`at_ms` + `pause_after_ms`):** tune to §3. **Carry EVERY `pause_after_ms` into the JSON verbatim** (guards `solenoid_dropped_prediction_pauses_x4`). Pauses: STATE_1 s1_2 ≈ 2600, STATE_2 s2_1 ≈ 2800; add prediction pauses on s3_1, s4_2, s5_3, s6_2.
- **`assessment` + `coverage_map` + per-state `misconception_watch`:** per §10(f) and §4.
- **Drill-down trigger phrases:** 3–5 per §6 cluster; SQL ships the 1 founder-locked strongest per hard state.
- **`field_3d_config` (json_author owns; physics-relevant pins):** `scenario_type: "point_charge_positive"`, `explorer_id: "potential_explorer"` (Rule 27 stable ID). `equipotential` block (`show`, `surfaces`, `color: "#4FC3F7"`, `opacity ≈ 0.14`).

### ENGINE PREREQUISITE (FOUNDER-APPROVED — `peter_parker:renderer_primitives` build, data-driven config):
1. **Per-state equipotential-shell control** (fade-in on cue at STATE_6, hidden before) + **V-value labels on each shell** + **1/r-physical shell radii** (equal-ΔV ⇒ `r_i = kQ/V_i`, bunched near +Q — replaces the hardcoded `radius = 1.0 + i*1.2` even spacing). Shells read their `{radius, V_label}` from config.
2. A **discrete test-charge-at-position** primitive: place +q at a chosen point, animate it along a route (path 1 straight + path 2 looping) with a live **work tally**, grow it q→2q.
3. A **`∞ · V=0` reference marker** + an **A→B / ΔV bracket** primitive (STATE_5), billboarding to camera-right.
4. A new **`deriveStateMeta.ts` per-state reveal/hold/motion recognition block** for THIS arc, in the SAME change (guards `field3d_scenario_missing_devstatemeta_recognition`).
5. STATE_7 explorer **idle auto-sweep** OR `interactive` classification (D1p); slider/drag visuals render at full immediately (D7); guided reveals sustain ≥0.1%/frame OR declare `reveal_hold`; one-shot elements hold end pose, never fade to 0; `∞`/ΔV markers billboard camera-right.

**Files referenced:** `.agents/architect/CLAUDE.md`, `.agents/proof_run/gauss_law_line_skeleton.md`, `.agents/proof_run/gauss_law_line_physics_block.md`, `src/data/concepts/gauss_law_sphere.json`, `src/data/concepts/electric_field_point_charge.json`, `src/lib/renderers/field_3d_renderer.ts` (equipotential lines 147–152, 2186–2197, 7545–7557; point_charge_positive 14856–14870), `docs/FIELD3D_SCENARIO_CHECKLIST.md`, `docs/AUTHORING_PIPELINE.md`.
