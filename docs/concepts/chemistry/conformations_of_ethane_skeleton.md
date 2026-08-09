# Architect skeleton — `conformations_of_ethane`

**Subject** chemistry (organic) · **File** `src/data/concepts/chemistry/conformations_of_ethane.json` · **Registration** site #1 ONLY (sites 2/3/4/7/8 forbidden for chemistry ids — Gate 8b is all-or-nothing) · **Validator** `npm run validate:chemistry`
**Chapter** NCERT Class 11 Chemistry Ch.13 *Hydrocarbons* §13.2 (Alkanes → conformations) · **Wave** O-0 concept #2 · **Tier** 💎
**Renderer** `field_3d` · `scenario_type: "organic_structure"` — **LIVE ON MASTER** (dispatches S1 substrate + S2 energy instrument + A1 driven dihedral)
**Downstream** → `chemistry-author` (position #2 of the chemistry sequence) → `json-author` → `quality-auditor`

> **This concept is the success test of the Phase-0 doctrine: concepts 2..N require ZERO renderer edits.**
> The ALARM-RULE verdict is in §14. It is **NO** — every state below is authored from fields the shipped
> contract already implements, and the three places where the design pressed on an edge were resolved by
> **choosing an authored number that a probe measured**, not by asking for a field.

---

## §0 — Engine bug queue consultation (queries run, disposition)

Queries actually run (recorded per the OPEN directive `engine_bug_queue_consulted_by_scenario_name_returns_zero_because_rows_are_tagged_by_concept_id` — an agent reporting an empty queue must state its query, and a scenario-name probe returns zero):

```
npx tsx --env-file=<env> src/scripts/query_engine_bug_queue.ts --owner alex:architect
npx tsx --env-file=<env> src/scripts/query_engine_bug_queue.ts --row-type directive
npx tsx --env-file=<env> src/scripts/query_engine_bug_queue.ts conformations_of_ethane   # 10 rows
npx tsx --env-file=<env> src/scripts/query_engine_bug_queue.ts organic_structure         # 0 rows — the
                                                                                          # scenario-name probe
                                                                                          # is the wrong probe
npx tsx --env-file=<env> src/scripts/query_engine_bug_queue.ts --field3d --open
```

The concept-tagged rows are the ten filed by the S1/S2/A1 dispatches. Disposition of every row that binds
this document (the OPEN directive `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` requires the OPEN rows on the extended scenario to be walked, not only the FIXED ones):

| Row | Disposition here |
|---|---|
| `scheduled_field_named_bare_at_ms_inside_a_config_object_is_invisible_to_the_frozen_pin_evaluator` (FIXED) | **BINDS.** Every scheduled key in §9 is STEMMED: `phi_at_ms`/`phi_ramp_ms` inside `torsion`, `reveal_at_ms`/`reveal_ramp_ms` inside `energy`. Bare `at_ms`/`ramp_ms` appear ONLY inside the `measure` array leg (S3), which is where the pin evaluator legally reads them. Verified against `deriveStateMeta.ts:2165-2215` — the generic sweep pairs `<stem>_at_ms` with `<stem>_ramp_ms` inside an object and reads a bare `at_ms` only inside an array leg. |
| `live_slider_handle_written_from_the_unwrapped_driven_scalar_clamps_at_the_controls_maximum` (FIXED) | **BINDS, and S1 is the first shipped exercise of the fix.** S1 sweeps φ 60 → **390**, which overruns the 0–360 control range by 30°. The handle is written from the MEASURED, wrapped dihedral (`field_3d_renderer.ts:66130-66136`), so it must read 30, not clamp at 360. Named as an EYE acceptance in §14. |
| `published_value_interpolated_between_knots_makes_every_named_point_a_corner_not_a_stationary_point` (FIXED) | **BINDS.** S6's formula surface asserts `E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹`. **Measured, not assumed:** the raised-cosine interpolation over the shipped `ORG_ENERGY_TABLE.ethane` knots differs from that closed form by at most **2.665 × 10⁻¹⁴ kJ·mol⁻¹** over 3601 samples (probe, §10 row 6). The formula printed on canvas IS the curve drawn beside it. |
| `memoised_camera_solve_keyed_on_molecule_but_filled_from_the_live_pose_makes_the_camera_path_dependent` (FIXED) | **BINDS.** No guided state reaches `orgSolveHome` — S1 authors explicit `az`/`el`, S2–S7 author `sight_along`. The only path that reaches the HOME constant is the explore state's teacher "Standard" toggle, and §8 row 7 measures what that pose actually costs. |
| `config_field_parsed_but_never_consumed_renders_a_silent_no_op_instead_of_a_loud_rejection` (FIXED) | **BINDS.** §9 authors `torsion.about: 'C1-C2'`, which must equal `ORG_MOLECULES.ethane.torsion_bond` or the state is rejected. It does. No field outside the IMPLEMENTED set is authored anywhere. |
| `derived_extremum_span_printed_as_the_named_quantity_a_textbook_reserves_for_a_different_stationary_point` (FIXED) | **BINDS and is satisfied by the data.** The ethane registry row carries no `barrier_label`, because hi − lo = 12 − 0 IS the rotation barrier a textbook quotes; the default string `barrier` is correct here. (Butane's row NAMES its span; ethane's must not be given one.) |
| `unlabelled_measurement_instrument_prints_the_same_symbol_as_a_hud_line_measuring_a_different_quantity` (FIXED) | **BINDS.** S3 is the only state carrying a `measure`, and it authors **`show_hud: false`**, so the arc's self-identifying default `φ(C1–C2)` is the only φ string on screen. No state prints a bare HUD `φ` and a measure φ together. |
| `planning_doc_counts_degenerate_enantiomeric_minima_as_distinct_conformations` (FIXED, alex:architect) | **BINDS — this row was filed against a document exactly like this one.** The counts are stated separately in §10 row 5: over 0–360 the curve has **3 interior minima, 3 maxima (0 and 360 being one physical maximum, so the 7 registry rows are 6 physical stationary points), and exactly 2 distinct conformation LABELS.** No narration line may say "six conformations". |
| `periodic_motion_rewind_probe_samples_two_instants_an_integer_number_of_periods_apart` (FIXED) | **BINDS on THE EYE.** φ is periodic at 120°. Any determinism sample pair must be coprime with the period — §14 names the instants. |
| `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` (MAJOR/OPEN) | **BINDS.** S1–S3 and S7 author **no** `glow_focal`, so per-sentence glow stays available to `chemistry-author`. S4–S6 author `glow_focal: 'curve'`; that voids sentence glow in those three states, which is accepted because the only live element they add is the DOM graph panel. Declared, not discovered. |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` (OPEN) | **BINDS and changed the design.** `glow_focal: 'measures'` on S3 or `'rim'` on S2 would arm the mesh dim pass and dim the hydrogens whose alignment the state exists to teach. Both are therefore **null**. `'curve'` is safe by construction: `applyOrganicStructureGlow` sets `any = false` for the `curve` key (`field_3d_renderer.ts:66329`), so the DOM panel brightens and **nothing in the 3D scene dims**. |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` (OPEN) | **BINDS.** All seven archetypes in §3 are IN-STATE motions. S2's is the camera flight, which runs inside the state on the state clock — not a between-state delta. |
| `quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` (OPEN) | **BINDS.** S5 quantifies what S4 shows. S4's cue is "Turning draws an energy curve" and its HUD line is live `E`; S5's cue is "The barrier: 12 kJ·mol⁻¹" and its HUD line is `barrier`. Different cue, different instrument, different string. |
| `teach_coordinate_sim_with_graph` (OPEN directive) | **BINDS and is satisfied structurally.** S4, S5, S6 and S7 each drive ONE parameter — φ — and the engine MEASURES it off the built coordinates for both the molecule and the rider (`orgEnergyState` → `orgMeasuredPhi`), so a static curve is not authorable here. |
| `teach_concrete_before_abstract_compare` (OPEN directive) | **BINDS.** The concrete two-pose contrast (S3) precedes the abstract curve (S4), which precedes the closed form (S6). |
| `teach_do_not_prespoil_a_later_reveal` (OPEN directive) | **BINDS.** The curve appears first at S4, the barrier bracket first at S5, the closed form first at S6, and nothing earlier names them. |
| `teach_visual_must_match_narration` (OPEN directive) | **BINDS.** Enforced in §14(j), sentence by sentence. |
| `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` (OPEN directive) | **BINDS.** The anchor is bound to named narration slots in §6 — S1 sentence 1 and S5 sentence 3 — not left in a section nobody reads. |
| `authored_beat_ends_by_undoing_the_state_own_claim` (OPEN directive) | **BINDS and changed two states.** S3 stops AT eclipsed rather than passing through it back to staggered. S1 stops at φ = 390 rather than 420, so its final frame is not its first frame (§8 row 1). |
| `taught_delta_smaller_than_the_instruments_own_live_noise` (OPEN directive) | Does not bind: the scenario is closed-form in state-local t (D-1), no integrator, no noise. |
| `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (OPEN directive) | Does not bind: same reason. Every position is a pure function of ms, so a pin reproduces byte-identically. |
| `field3d_label_sprite_overlap` (MODERATE/OPEN) | **Watch item, not a blocker.** S3 carries the C1 carbon-id sprite AND the measure label sprite. §8 row 6 states where each lands and what THE EYE must confirm. |
| `new_scenario_buy_list_omits_the_visual_gate_platform_registration_sites` / `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` | Already satisfied by dispatch S1: `'organic_structure'` is registered in the reveal-key list at `deriveStateMeta.ts:820` and has its own pin branch at `:2165`. Cited, not assumed. |
| `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` (OPEN, json_author) | **BINDS on the downstream author.** S7's discoverables are the four LIVE control rows named in §3, not annotation text. |
| `concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count` (OPEN, alex:architect) | **BINDS.** `assessmentSchema.questions` is `.min(6)` (`src/schemas/conceptJson.ts:339`). Disposition in §14(f): the block is **omitted deliberately**, fleet-consistent, and six ready items are listed so it can be added without under-filling. |

No exception to any `prevention_rule` is being claimed.

---

## §1 — Tier and the whiteboard test

**Verdict: the 💎 tier is correct, and the build plan's one-line case understates it.**

The plan says "a board draws two poses and asserts the curve between them." That is exactly what a whiteboard
can do and exactly where it stops. Three specific failures make this a 3D concept rather than a diagram:

1. **A Newman projection is a projection, and a board can only draw the result.** A student who cannot already
   read one is shown a finished symbol — a circle with six lines — and told what it means. Here the camera
   starts on the 3D molecule and travels onto the C–C axis, so the student watches the familiar picture
   *become* the projection. Nothing on paper does that, and the inability to read a Newman projection is one of
   the three real misconceptions this concept must clear (§4).
2. **The claim "the projected angle IS the true dihedral" is only true from one viewpoint, and a board cannot
   demonstrate viewpoint.** The engine SOLVES the camera onto the bond axis (`orgSolveCamera`), so the arc the
   student sees is the angle the number reports. On a board it is an assertion.
3. **The curve and the molecule are one object here.** In S4 the same measured φ drives the molecule and the
   rider, and the curve is drawn by the rotation as it happens — the pen tip IS the rider. A board draws the
   curve first and then points at it; the causal order is reversed, and with it the whole idea that the curve
   is a record of the turning rather than a separate fact to memorise.

What a board still does better: nothing in this concept. There is one variable and one number, so the sim
never fights the teacher for attention.

---

## §2 — Atomic claim and state arc

**Atomic claim.** This concept teaches that rotation about the C–C single bond in ethane passes through
low-energy **staggered** and high-energy **eclipsed** arrangements, that the difference is **12 kJ·mol⁻¹**, and
that the **Newman projection** is the view that makes this visible. It does **not** cover butane's four
conformers or the gauche interaction (deferred to `conformations_of_butane`), ring conformations (deferred to
`cyclohexane_chair_flip`), or the physical origin of the barrier — hyperconjugation versus Pauli repulsion is a
live research question and is out of scope at Class 11 (§12, open question 1).

**State count: 7. Justified, not inherited.**

The concept has one degree of freedom, eight atoms and one number. Against the CLAUDE.md §5 calibration that
is "medium" — 5 to 6 states — and the arc lands at 7 only because the depth ladder needs a rung of its own at
each end. The four core teaching moves are irreducible: *the bond turns* (S1), *this is the view* (S2), *these
are the two arrangements* (S3), *turning costs energy* (S4). One extended state carries the number (S5), one
advanced state carries the closed form (S6), and the sandbox is last (S7). Nothing here is a pause, a recap or
a second look at the same picture.

For comparison, the sibling `cyclohexane_chair_flip` needs 9 for 18 atoms, a seven-waypoint reaction path, and
axial/equatorial tagging. Ethane is genuinely two thirds of that, and the arc reflects it.

**Arc, one line per state:**

| State | Purpose |
|---|---|
| STATE_1 | The two carbons turn about the C–C bond; it stays one molecule the whole way round. |
| STATE_2 | Sight straight down that bond — the 3D picture becomes the Newman projection. |
| STATE_3 | Turn 60°: the front and back hydrogens line up. Staggered → eclipsed. |
| STATE_4 | One full turn draws an energy curve that rises and falls three times. |
| STATE_5 | The height from staggered to eclipsed is 12 kJ·mol⁻¹ — the barrier to rotation. |
| STATE_6 | The whole curve is one formula, E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹, and it repeats every 120°. |
| STATE_7 | Teacher sandbox: turn φ by hand, switch views, hide the hydrogens. |

---

## §3 — Per-state control table (Rule 31, the required design artifact)

Word budgets are EN narration. Guided = 25–55 words; every budget below is set at **≤ 2.75 words/second of that
state's own motion**, so narration never outruns motion. Every archetype is an in-state motion. **Rail title** is
the string the reorderable state rail shows (Rule 41d — the rail truncates, so the first words carry the meaning).

| # | State id | **Rail title** | Teaches (ONE thing) | Motion archetype | Delta cue (≤5 words, on canvas) | Live controls | Words | Ring | `advance_mode` |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `STATE_1` | **The C–C bond turns** | The two carbons rotate about the single bond and it stays one molecule | `bond-axis-turn` — the molecule turns about its own C–C axis in an oblique 3D view | `The C–C bond turns` | `phi` **disabled**, handle tracks | 38–42 | core | `manual_click` |
| 2 | `STATE_2` | **Look down the C–C bond** | Sighting along the bond gives the Newman projection: front carbon at the centre, back carbon as a circle | `sight-line-collapse` — the camera glides onto the bond axis while the molecule holds its pose | `Now looking down the bond` | `view` **disabled**, reads "Along the bond" | 26–29 | core | `manual_click` |
| 3 | `STATE_3` | **Staggered and eclipsed** | Turning 60° takes the molecule from staggered to eclipsed and the dihedral arc closes to 0° | `arc-closes-to-zero` — the drawn dihedral arc shrinks to nothing as the hydrogens align | `Hydrogens line up: eclipsed` | `phi` **disabled**, handle tracks | 32–36 | core | `manual_click` |
| 4 | `STATE_4` | **Turning costs energy** | One full turn draws an energy curve that rises and falls three times | `turn-draws-the-curve` — the rotation is the pen: the rider IS the drawing tip | `Turning draws an energy curve` | `phi` **disabled**, handle tracks | 34–37 | core | `manual_click` |
| 5 | `STATE_5` | **The barrier is 12 kJ·mol⁻¹** | The height from staggered up to eclipsed is 12 kJ·mol⁻¹ | `peak-crossing` — the rider descends into one minimum and climbs the next maximum beneath a standing bracket | `The barrier: 12 kJ·mol⁻¹` | `phi` **disabled**, handle tracks | 26–28 | extended | `manual_click` |
| 6 | `STATE_6` | **One formula for the curve** | The whole curve is E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹, so it repeats every 120° | `period-repeat` — the rider traverses the NEXT identical peak while the formula stands on canvas | `Same peak every 120°` | `phi` **disabled**, handle tracks | 26–28 | advanced | `manual_click` |
| 7 | `STATE_7` | **Turn it yourself** | Teacher sandbox | `free-explore` — φ free-runs at 24 °/s until a teacher seizes the slider | `Turn it yourself` | `view`, `phi`, `implicit_h`, `spin` — **all four, live** | 0 / open | core | `interaction_complete` |

**No archetype repeats.** The three states that sweep φ do so with visibly different pictures and different
instruments: S3's picture is a shrinking arc on the molecule with no graph on screen; S4's is a curve being
DRAWN by the rotation with nothing standing still; S5's is a curve already standing still with a bracket beside
it and only the rider moving. S6 moves the rider across the *next* period, so its region of the curve has never
been occupied before. No contrast pair is claimed, and none is needed.

**`advance_mode`:** six `manual_click` + one `interaction_complete` = 2 distinct (Rule 15). No `wait_for_answer`
anywhere (Rule 31 — legacy).

**Rule 32 legibility, state by state.**
- **32a cause before effect.** S3: the hydrogens begin moving at 900 ms; the arc has been on screen since
  1000 ms (`measure.at_ms 300 + ramp_ms 700`), so the instrument is already present and it is the MOTION that
  changes it, not the instrument appearing on top of a change. S4: the reveal and the sweep share `at_ms 700`,
  which is correct here and is not a simultaneity fault — the curve is the *record* of the turn, so the pen tip
  must not lead or lag the molecule (both run on the same `mgRamp`, so `est.x` equals `xEnd` identically).
- **32b only the taught variable moves.** φ is the only thing that changes in S1 and S3–S6; the camera holds.
  In S2 the camera is the taught variable and the molecule holds a fixed staggered pose. `spin_rate` is 0 in
  every guided state.
- **32c the caption is the delta cue.** Column 6 above is the on-canvas caption verbatim; prose lives in the
  strip below the canvas (Rule 34a).
- **32d home pose, no teleport.** The molecule is the same eight atoms throughout. φ is continuous ACROSS the
  state boundaries by construction: S1 ends at 390 ≡ 30, S2 and S3 open staggered at 60, S3 ends at 0, S4 opens
  at 0 and ends at 358 ≡ ~0, S5 opens at 0 and ends at 120, S6 opens at 120 and ends at 240, S7 free-runs from
  60. The one deliberate jump, S1 → S2 (30 → 60), is masked by the camera flight, which is the state's own delta.
- **32e one focal.** S1, S2, S3, S7 author no `glow_focal` (see §0 — a focal on `measures` or `rim` would dim
  the hydrogens the state is about). S4, S5, S6 author `glow_focal: 'curve'`, which brightens the DOM graph and
  dims nothing in the 3D scene.

---

## §4 — Misconception plan (Rule 16a — proactive, inside EPIC-L, no predict-pause)

Three `misconception_watch` entries, on three states. **S3, S5, S6 and S7 carry none** — they are straightforward
teaching beats, and adding a watch to every state would be manufacturing misconceptions.

| Belief (real, and named by the founder brief) | State | `visual_counter` — what the student SEES | `one_line_fix` |
|---|---|---|---|
| **M1 — "Rotation about a single bond is completely free; it costs nothing."** | `STATE_4` | The identical rotation the student has already watched twice now draws a curve that rises and falls. The contrast beat is structural, not staged: S1 showed the turn looking effortless, S4 shows the same turn leaving a record with peaks in it. No question is asked and nothing pauses. | Single bonds turn, but not freely — the energy rises and falls as they turn. |
| **M2 — "Staggered and eclipsed are different compounds."** | `STATE_1` | The HUD prints `C 2 · H 6` for the whole turn, no bond ever breaks, and the rotation is continuous from one arrangement into the other. The student watches one molecule become both. | Staggered and eclipsed are the same molecule at different points of one rotation. |
| **M3 — "A Newman projection is two overlapping Y shapes; I cannot tell front from back."** | `STATE_2` | The camera travels from a familiar 3D view onto the bond axis over 9.5 seconds, and the front carbon becomes the point where three bonds meet while the back carbon becomes the circle those other three start from. The confusing symbol is built in front of the student rather than presented finished. | The centre point is the front carbon; the circle is the back carbon. |

No EPIC-C branches are authored (EPIC-L-first directive, 2026-06-10).

---

## §5 — Choreography timing and the frozen-pin budget

All times are state-local ms. The pin is `deriveStateMeta`'s `Math.max(candidates)`; the organic branch uses
`ORG_CUSHION = 600` and pushes `at_ms + span + 600` for every stemmed key, every `measure` leg, and every
`camera_steps` leg as `at_ms + ease_ms + 600` (`deriveStateMeta.ts:2165-2215` — read, not assumed).

| State | Scheduled fields | Motion ends (ms) | **Frozen pin (ms)** | What the pinned frame shows |
|---|---|---|---|---|
| 1 | `torsion.phi_at_ms 700`, `phi_ramp_ms 15000` | 15700 | **16300** | The molecule at φ = 390 ≡ 30° — a pose one third of the way off staggered, visibly NOT frame 0. HUD `C 2 · H 6` and `φ = 30.0°`. Slider handle at 30, not clamped at 360. |
| 2 | `camera_steps[0] at_ms 0 ease_ms 0`; `camera_steps[1] at_ms 1200 ease_ms 9500` | 10700 | **11300** | The settled Newman projection: rim circle, six hydrogens 60° apart. HUD `bond = C1–C2`, `pose = staggered`, `C 2 · H 6`. |
| 3 | `measure[0] at_ms 300 ramp_ms 700`; `torsion.phi_at_ms 900`, `phi_ramp_ms 11500` | 12400 | **13000** | Eclipsed. The arc has closed and the label reads `φ(C1–C2) = 0.0°`. No HUD. |
| 4 | `torsion.phi_at_ms 700`, `phi_ramp_ms 13000`; `energy.reveal_at_ms 700`, `reveal_ramp_ms 13000` | 13700 | **14300** | The full curve with three peaks, the rider at φ = 358 near the right edge, HUD `E = 12.0 kJ·mol⁻¹`. |
| 5 | `energy.reveal_at_ms 0`, `reveal_ramp_ms 900`; `torsion.phi_at_ms 1200`, `phi_ramp_ms 9000` | 10200 | **10800** | The rider at the top of the second peak, the barrier bracket standing, HUD `barrier = 12 kJ·mol⁻¹`. |
| 6 | `energy.reveal_at_ms 0`, `reveal_ramp_ms 900`; `torsion.phi_at_ms 1200`, `phi_ramp_ms 9000` | 10200 | **10800** | The rider at φ = 240, the formula surface reading `E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹`, HUD `φ = 240.0°` and `E = 12.0 kJ·mol⁻¹`. |
| 7 | `energy.reveal_at_ms 0`, `reveal_ramp_ms 600`; `torsion.continuous 24` | never (Rule 37) | **1500** (default) | Declared MOTION by `deriveStateMeta` (`mode: 'explore'` → static-declared, interactive hold classification relaxes the tail; `continuous` never settles). No settled pin is expected. |

`eye_capture_ms` per state = the pin above. Every pinned instant is ≥ 600 ms clear of the last thing that moves,
so no frame is photographed mid-ease.

---

## §6 — Real-world anchor (Rule 35 — universal, culture-neutral)

**Primary anchor: a hexagonal pencil lying on a flat table.** It rests on one of its flat faces. Push it and it
rolls, but not smoothly — it lifts over an edge and drops onto the next face. It can be rolled to any position,
yet it is almost always found resting on a face.

That is the whole concept in an object every student on every continent owns: a rotation that is possible but
not free, with preferred resting positions separated by small barriers. It is physics-true rather than
metaphorical — a periodic potential in a rotational coordinate, with minima at the faces and maxima at the
edges — and it fails only in the one place where honesty is easy: at room temperature the ethane barrier is
small enough that the molecule turns millions of times a second, whereas the pencil stays put. That difference
is worth one clause, not a state.

**Secondary (offered, optional): the lid of a screw-top bottle**, which turns freely — the counter-example that
sharpens the pencil. Use only if `chemistry-author` finds the primary needs a foil.

**Rule 35 audit:** no place, festival, food, currency, brand or personal name; a hexagonal pencil and a bottle
lid read identically in Hyderabad, Lagos and Ohio. **Rule 38f:** ethane itself is the widest-overlap "device"
here — every syllabus that teaches conformations at all teaches it on ethane first.

**Where the anchor reaches narration (binding, per the OPEN directive
`skeleton_anchor_specified_in_section_9_reaches_no_narration_line`):**
- `STATE_1`, sentence 1 — the pencil opens the concept, before the molecule is described.
- `STATE_5`, sentence 3 — the barrier number is tied back to the edge the pencil lifts over.
Nowhere else. Two touches, not a running joke.

---

## §7 — `entry_state_map`, depth rings, curriculum flex (Rule 38)

### 7.1 `entry_state_map`

```
entry_state_map:
  foundational:      STATE_1 → STATE_5     # "what are conformations of ethane"  (DEFAULT)
  newman_projection: STATE_2 → STATE_3     # "how do I read a Newman projection"
  energy_barrier:    STATE_4 → STATE_6     # "why is eclipsed higher in energy / what is the 12 kJ"
```

**Foundational-coverage rule satisfied directly.** The PRIMARY aha lives in `STATE_4`, which is inside
`foundational`. No exit-pill is required.

### 7.2 Depth rings

| Ring | States | Content |
|---|---|---|
| `core` | STATE_1, STATE_2, STATE_3, STATE_4, STATE_7 | The rotation; the Newman projection; the two named arrangements; the qualitative energy curve; the sandbox. |
| `extended` | STATE_5 | The barrier NAMED and NUMBERED: 12 kJ·mol⁻¹, the bracket, the `barrier` HUD line. |
| `advanced` | STATE_6 | The closed form E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹ and the 120° period. |

Order is qualitative → quantitative → derivation (38a). The advanced ring is a single contiguous state sitting
immediately before the explore state (38a).

### 7.3 Coherent-when-cut check, written out

**Cut A — hide `advanced` (drop STATE_6).** Surviving: S1, S2, S3, S4, S5, S7. Checked string by string:
no surviving narration line, delta cue, HUD line or formula surface mentions a closed form, a cosine, or a
period expressed as 3φ. S5's cue is "The barrier: 12 kJ·mol⁻¹" and its HUD line is `barrier`; neither depends on
S6. S7 carries no formula surface. The lesson ends on the number, which is exactly where CBSE and IGCSE-level
teaching ends. **Coherent.**

**Cut B — hide `advanced` + `extended` (drop STATE_5 and STATE_6).** Surviving: S1, S2, S3, S4, S7. The word
"barrier" never appears; the bracket is never drawn; no surviving line quotes 12 kJ·mol⁻¹ in narration or in a
caption. **One honest exception, declared:** the graph's y-axis ticks are drawn from the published stationary
levels (`orgDrawGraph`, `field_3d_renderer.ts:65719-65729`), so the numerals **0** and **12** are printed on the
axis of S4 and S7 under every preset. That is not hidden-ring content leaking — it is the axis of a graph the
core ring owns, and it is the reason S4's narration must describe the curve qualitatively ("rises and falls
three times in one turn; low at staggered, high at eclipsed") and must NOT name 12 as the barrier. The
quantitative claim, not the numeral, is what STATE_5 owns. **Coherent.**

### 7.4 Rule 38b — the explore state surfaces CORE-ring content only

`STATE_7` shows: the molecule, the Newman rim, the energy curve with its rider, HUD `φ` and `E`, and four live
controls. It authors `show_barrier: false` and no `show_formula`. Every symbol it prints — φ, E, kJ·mol⁻¹ — was
established in a core state (φ in S1, E and the curve in S4). Under Cut A and under Cut B the sandbox is
unchanged and references nothing the student has not been shown.

### 7.5 Rule 38e — graph axes

x = **φ (°)**, 0 → 360, left to right. y = **E (kJ·mol⁻¹)**, zero at staggered, increasing upward. This is the
universal textbook convention for a torsional profile across CBSE, JEE, IB, A-level and AP; there is no genuine
cross-board conflict, so **no axis-swap toggle is authored**. Note for the record: these labels are properties of
the `ORG_ENERGY_TABLE.ethane` row (`x_label`, `y_label`), **not** per-state authorable, so a board-specific
override would be an engine change and is not being requested.

### 7.6 Rule 38g — `curriculum_tags` (claims, not facts)

| curriculum | coverage | syllabus unit | `verified` | `needs_teacher_verification` |
|---|---|---|---|---|
| CBSE / NCERT | full | Class 11 Chemistry, Ch.13 *Hydrocarbons*, §13.2 — alkanes, conformations of ethane, sawhorse and Newman projections | **true** | false |
| JEE Main / Advanced | full | Organic Chemistry — General Organic Chemistry: conformational isomerism of ethane, energy profile, staggered/eclipsed | false | **true** |
| NEET | full | mirrors the NCERT unit above | false | **true** |
| IB Chemistry (HL) | partial | conformations are not a named HL topic; used as supporting material for structure and isomerism | false | **true** |
| A-level (Cambridge / Edexcel / AQA) | partial | not in every specification; where present, sits with alkane structure and free rotation about σ bonds | false | **true** |
| AP Chemistry | none/partial | conformational analysis is not an AP Chemistry topic; the σ-bond rotation statement may still be used | false | **true** |
| IGCSE | none | alkanes are covered; conformations are not | false | **true** |

Per 38g only the CBSE/NCERT row may be marked verified at authoring time. **No preset goes teacher-visible until
a teacher of that curriculum confirms its row.**

### 7.7 Rule 38h — preset proposal (hide, never reorder)

| Preset | Hides | Result |
|---|---|---|
| `full` | — | S1–S7 |
| `no_derivation` | `advanced` | S1–S5, S7 — ends on the 12 kJ·mol⁻¹ barrier |
| `qualitative` | `advanced`, `extended` | S1–S4, S7 — the picture and the shape of the curve, no named barrier |

Authored order is fixed; a teacher may still reorder at runtime (Rule 25d).

---

## §8 — The two 3D authoring traps, per state (constraints with measured answers)

Both traps are answered with numbers from the design-time probe in §10, computed by re-implementing the shipped
`orgBuildGeometry` / `orgSolveCamera` / `orgMinScreenGap` path exactly. The countability floor used throughout is
the engine's own: **`ORG_HOME_GAP_FLOOR = 0.12` scene units of clear background between two drawn atom discs**
(`field_3d_renderer.ts:65401`). A negative gap means two discs the narration counts have fused.

**Trap A — occlusion.** In a Newman view the back-carbon hydrogens sit behind the front ones *by definition*, and
at φ = 0 they are exactly aligned — which is simultaneously the whole meaning of "eclipsed" and the exact
condition under which a student cannot see them. The engine ships the conventional fix (back carbon's sphere
withheld, a rim circle drawn, back bonds drawn from the rim outward, hydrogen POSITIONS untouched).

**Trap B — projected angle.** Sighting down the bond is what makes the projected angle equal the true dihedral.
Off that axis, the arc on screen is not the number the HUD prints.

| State | Camera intent | Trap A — occlusion, measured | Trap B — why the state's claim is honest |
|---|---|---|---|
| **S1** | Fixed oblique 3D, `az 180, el 6, dist 9`. Reads as a sawhorse-like view: the C–C axis lies 41.2° off the view direction, so both carbons are separate and the turn is legible. | **This pose was SOLVED, not chosen.** A full az × el sweep over the whole rotation shows that no camera near the engine's `ORG_HOME` survives a 360° turn: `az 258 / el 18` dips to **−0.043** at φ = 225, `az 266 / el 10` (the pose `orgSolveHome` returns for ethane) dips to **−0.104** at φ = 170, and `az 254 / el 18` to **−0.089**. `az 180 / el 6` holds a worst-case gap of **+0.304 over the entire turn** (+0.301 at dist 9). It is the argmax, and it clears the floor by 2.5×. | S1 makes no angle claim. It shows that the bond turns and that the atom count never changes; the only number on screen is φ, which the engine measures on the built coordinates and not on the projection. |
| **S2** | Starts at S1's exact pose, glides onto the bond axis over 9.5 s, ends at the SOLVED sight pose `az 180.0000, el −35.2644, dist 8`. | The rim convention is live for the whole state (`newman: true` is per-state, not time-gated), so during the glide the back carbon is already drawn as a circle rather than a ball. Declared: this is visible for ~9 s as a small ring at C2 in an oblique view. It is not incorrect — it is the convention arriving early — and the pinned frame is fully on-axis. | The final camera step **must equal the solved sight pose to 4 dp**. `orgSolveCamera` places the camera on `norm(C1 − C2)`, which for ethane is exactly **az 180.0000°, el −35.2644° (= −asin(1/√3))**, and the probe confirms it is *independent of φ* (identical at φ = 0, 37, 60, 180, 300). Authoring any other number would end the flight off-axis and make every later state's angle claim false. |
| **S3** | Newman, `dist 8`. | **`dist 8` is the load-bearing number of this whole document.** At the engine default `dist 11.5` the eclipsed Newman frame has a gap of **+0.042** — below the 0.12 floor, i.e. front and back hydrogens fused at exactly the moment the state exists to teach. Perspective is the control: at `dist 9` it is +0.140, at **`dist 8` it is +0.198**, at `dist 7` +0.273. Swept over a full turn at `dist 8` the worst case anywhere is **+0.198 (at the eclipsed φ = 0/120/240/360)** and the best is +0.738 (staggered). So the whole rotation is countable at `dist 8`, with no renderer change and no dishonest offset: the front hydrogens simply project larger because they are nearer, which is true. Framing cost: the molecule fills 46% of the viewport half-height at dist 8 (bounding radius 2.137 scene units vs half-height 4.62), which is comfortable. | Exactly on-axis, so the drawn arc IS the dihedral. The arc is built from the two substituent directions **projected perpendicular to the central bond** (`field_3d_renderer.ts:66196-66200`) — which is what a dihedral is — and its label prints the value measured on the 3D coordinates, not the screen. |
| **S4** | Newman, `dist 8`, unchanged from S3. | Same +0.198 worst case; the sweep passes through eclipsed three times and each pass stays above the floor. | The claim is about the CURVE, and the curve's x is `orgMeasuredPhi` on the built geometry (`orgEnergyState`), so the rider cannot drift from the pose even if the camera were wrong. |
| **S5** | Newman, `dist 8`, unchanged. | Same. The pinned frame is at eclipsed φ = 120, gap +0.198. | The bracket spans published table values, not sampled ones (`orgEnergyRange`), so the 12 is a literature number and the canvas stamps `(literature)`. |
| **S6** | Newman, `dist 8`, unchanged. | Same; pinned at eclipsed φ = 240. | The formula is verified against the drawn curve to 2.665 × 10⁻¹⁴ (§10 row 6), so the on-canvas equation and the on-canvas curve are the same object. |
| **S7** | Newman, `dist 8`, with the `view` control live. | **Declared limitation of the sandbox, not of the lesson.** When a teacher picks "Standard", the renderer substitutes the raw `ORG_HOME` constant (az 254, el 18) at the state's own distance — it does **not** call `orgSolveHome` (`field_3d_renderer.ts:65965`). Measured over a full turn at dist 8 that pose dips to **−0.138** near φ = 310, i.e. two discs slightly fused for part of the turn. No teaching claim rests on it; it is a teacher-chosen alternate view in a sandbox. Filed as a scar CANDIDATE in §15 rather than an engine ask. | The sandbox makes no angle claim; the HUD φ is measured, whichever view is chosen. |

**Two further authoring constraints the traps produced** (both are engine facts, both are honoured in §9):

6. **The back carbon carries no id label in a Newman view.** Carbon-id sprites are drawn only for atoms in the
   visible set (`field_3d_renderer.ts:66036`), and `newman: true` removes C2 from that set. So the rim circle is
   unlabelled by construction. This matches the textbook convention (no textbook labels the back carbon either)
   and is covered by the `bond = C1–C2` HUD line in S2 plus narration. **Not an engine ask.** In S3 the only two
   sprites on screen are the `C1` id label (offset +0.42 right, +0.34 up from the front carbon) and the measure
   label (placed on the arc bisector at radius 0.62 + 0.62); THE EYE must confirm they do not collide
   (`field3d_label_sprite_overlap`, MODERATE/OPEN).
7. **The `pose` HUD line is STATIC and does not track a sweep.** It prints `os.torsion.pose` if authored,
   otherwise the molecule's `default_pose` (`field_3d_renderer.ts:66270`). On a state that authors `phi_deg` and
   sweeps, it would print "staggered" all the way to eclipsed — a rendered string contradicting the picture. It
   is therefore authored **only on STATE_2**, which holds a static `pose: 'staggered'`. Every sweeping state uses
   `phi` (live, measured) or no HUD at all.

---

## §9 — Per-state `organic_structure` contract mapping (the zero-renderer-edit proof)

Each block below is exactly what goes in `field_3d_config.states.STATE_N.organic_structure`. `glow_focal`,
`label`, `caption` and `eye_capture_ms` are **state-level** siblings of `organic_structure`, not members of it.
Every field used is in the IMPLEMENTED set: modes `rotate`/`explore`; hud lines `phi`/`bond`/`pose`/`atom_count`/
`energy`/`barrier`; controls `view`/`spin`/`implicit_h`/`phi`; measure kind `torsion`; poses `staggered`;
energy coordinate `torsion`; curve row `ethane`.

Config-level, once:
```
field_3d_config.scenario_type = "organic_structure"
field_3d_config.slider_controls = {
  phi:  { min: 0, max: 360, step: 1, default: 60, label: "φ" },
  spin: { min: 0, max: 40,  step: 1, default: 0,  label: "Turn speed" }
}
```

### STATE_1 — The C–C bond turns
```
label: "The C–C bond turns"          caption: "The C–C bond turns"
eye_capture_ms: 16300                glow_focal: (none)
organic_structure: {
  molecule: "ethane",
  mode: "rotate",
  torsion: { about: "C1-C2", phi_from: 60, phi_deg: 390,
             phi_at_ms: 700, phi_ramp_ms: 15000 },
  show_h: "all",
  show_labels: true,
  camera: { az: 180, el: 6, dist: 9 },
  show_hud: true,
  hud_lines: ["atom_count", "phi"],
  static_readouts: [{ id: "phi", min_ring: "core" }]
}
```
`phi_deg: 390` and not 420: at φ = 420 the picture is identical to φ = 60 (the hydrogens are unlabelled, so every
staggered pose looks the same), and the frozen pin would photograph frame 0 — THE EYE would read a 15-second
rotation as a static state. 330° is a full turn to every eye and leaves a distinguishable final frame.
`about` equals `ORG_MOLECULES.ethane.torsion_bond`, so it is not rejected.

### STATE_2 — Look down the C–C bond
```
label: "Look down the C–C bond"      caption: "Now looking down the bond"
eye_capture_ms: 11300                glow_focal: (none)
organic_structure: {
  molecule: "ethane",
  mode: "rotate",
  torsion: { pose: "staggered" },
  show_h: "all",
  show_labels: true,
  camera: { sight_along: "C1-C2", dist: 8, newman: true },
  camera_steps: [
    { at_ms: 0,    az: 180, el: 6,        dist: 9, ease_ms: 0 },
    { at_ms: 1200, az: 180, el: -35.2644, dist: 8, ease_ms: 9500 }
  ],
  show_hud: true,
  hud_lines: ["bond", "pose", "atom_count"],
  static_readouts: [{ id: "view", min_ring: "core" }]
}
```
The schedule's base is the solved sight pose, so step 0 (`ease_ms: 0`) snaps the camera back to S1's pose at
t = 0 and step 1 flies it onto the axis. The step-1 numbers must equal the solved pose exactly (§8, S2).

### STATE_3 — Staggered and eclipsed
```
label: "Staggered and eclipsed"      caption: "Hydrogens line up: eclipsed"
eye_capture_ms: 13000                glow_focal: (none)
organic_structure: {
  molecule: "ethane",
  mode: "rotate",
  torsion: { about: "C1-C2", phi_from: 60, phi_deg: 0,
             phi_at_ms: 900, phi_ramp_ms: 11500 },
  show_h: "all",
  show_labels: true,
  camera: { sight_along: "C1-C2", dist: 8, newman: true },
  measure: [ { kind: "torsion", between: ["C1H1", "C1", "C2", "C2H1"],
               at_ms: 300, ramp_ms: 700 } ],
  show_hud: false,
  static_readouts: [{ id: "phi", min_ring: "core" }]
}
```
Arity 4 for `torsion` (Gate: `ORG_MEASURE_ARITY`). No `label` on the measure — the engine default
`φ(C1–C2)` is self-identifying and is the fix the unlabelled-instrument scar installed. `show_hud: false` so no
bare φ competes with it. The state stops AT eclipsed and does not continue back to staggered.

### STATE_4 — Turning costs energy
```
label: "Turning costs energy"        caption: "Turning draws an energy curve"
eye_capture_ms: 14300                glow_focal: "curve"
organic_structure: {
  molecule: "ethane",
  mode: "rotate",
  torsion: { about: "C1-C2", phi_from: 0, phi_deg: 358,
             phi_at_ms: 700, phi_ramp_ms: 13000 },
  show_h: "all",
  show_labels: true,
  camera: { sight_along: "C1-C2", dist: 8, newman: true },
  energy: { show: true, curve: "ethane", coordinate: "torsion",
            show_point: true, show_barrier: false, label_stationary: true,
            reveal_at_ms: 700, reveal_ramp_ms: 13000 },
  show_hud: true,
  hud_lines: ["energy"],
  static_readouts: [{ id: "phi", min_ring: "core" }]
}
```
`phi_deg: 358`, not 360: `orgDihedral` returns 0–360, so a sweep landing on exactly 360 reports a MEASURED φ of
0, and `est.x` — which is that measured value — would snap the rider back to the left edge of a fully drawn
curve on the pinned frame. 358 leaves the rider at the right-hand end where the narration says it is.
Sweep and reveal share `at_ms` and `ramp_ms`, so `est.x` and the reveal's `xEnd` are the same `mgRamp` output
and the rider sits exactly at the drawing tip.

### STATE_5 — The barrier is 12 kJ·mol⁻¹
```
label: "The barrier is 12 kJ·mol⁻¹"  caption: "The barrier: 12 kJ·mol⁻¹"
eye_capture_ms: 10800                glow_focal: "curve"
organic_structure: {
  molecule: "ethane",
  mode: "rotate",
  torsion: { about: "C1-C2", phi_from: 0, phi_deg: 120,
             phi_at_ms: 1200, phi_ramp_ms: 9000 },
  show_h: "all",
  show_labels: true,
  camera: { sight_along: "C1-C2", dist: 8, newman: true },
  energy: { show: true, curve: "ethane", coordinate: "torsion",
            show_point: true, show_barrier: true, label_stationary: true,
            reveal_at_ms: 0, reveal_ramp_ms: 900 },
  show_hud: true,
  hud_lines: ["barrier"],
  static_readouts: [{ id: "phi", min_ring: "extended" }]
}
```
The bracket draws only once `rev > 0.98`, i.e. after ~900 ms, so the curve is complete before the span is
measured on it. `hud_lines` deliberately omits `energy`: at the pinned instant the live E is also 12.0, and two
lines printing 12 for different reasons is the degeneracy the checkpoint-flag scar warns about.

### STATE_6 — One formula for the curve
```
label: "One formula for the curve"   caption: "Same peak every 120°"
eye_capture_ms: 10800                glow_focal: "curve"
organic_structure: {
  molecule: "ethane",
  mode: "rotate",
  torsion: { about: "C1-C2", phi_from: 120, phi_deg: 240,
             phi_at_ms: 1200, phi_ramp_ms: 9000 },
  show_h: "all",
  show_labels: true,
  camera: { sight_along: "C1-C2", dist: 8, newman: true },
  energy: { show: true, curve: "ethane", coordinate: "torsion",
            show_point: true, show_barrier: false, label_stationary: true,
            reveal_at_ms: 0, reveal_ramp_ms: 900 },
  show_hud: true,
  hud_lines: ["phi", "energy"],
  show_formula: true,
  formula: "E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹",
  static_readouts: [{ id: "phi", min_ring: "advanced" }]
}
```
The rider crosses the SECOND peak, a region of the curve no earlier state has pinned, so the picture is new
even though the molecule at 240 looks like the molecule at 120 — which is the state's point. With the graph up
the formula surface re-anchors to top-left automatically (Rule 34d, `field_3d_renderer.ts:65934`), clear of the
top-right HUD.

### STATE_7 — Turn it yourself
```
label: "Turn it yourself"            caption: "Turn it yourself"
eye_capture_ms: 1500                 glow_focal: (none)
organic_structure: {
  molecule: "ethane",
  mode: "explore",
  torsion: { about: "C1-C2", continuous: 24 },
  show_h: "all",
  show_labels: true,
  camera: { sight_along: "C1-C2", dist: 8, newman: true },
  energy: { show: true, curve: "ethane", coordinate: "torsion",
            show_point: true, show_barrier: false, label_stationary: true,
            reveal_at_ms: 0, reveal_ramp_ms: 600 },
  show_hud: true,
  hud_lines: ["phi", "energy"],
  controls: [ { id: "view",       min_ring: "core" },
              { id: "phi",        min_ring: "core" },
              { id: "implicit_h", min_ring: "core" },
              { id: "spin",       min_ring: "core" } ]
}
```
All four implemented controls, live (Rule 31c). `continuous: 24` free-runs φ at 24 °/s from the default
staggered pose and wraps forever (Rule 37); a trusted drag on the φ slider seizes it for the rest of the state.
No `show_barrier`, no `show_formula` — Rule 38b.

**Fields deliberately NOT authored anywhere:** `spin_rate`/`spin_start_ms` on guided states (Rule 32b),
`show_h` values other than `"all"` (eight atoms; the 18-atom gating exists for cyclohexane), any deferred mode,
any deferred measure kind, `energy.stationary` overrides (the registry row is the source of truth).

---

## §10 — Measured values (each written ONCE; referenced elsewhere)

Every behavioural claim in this document carries a measured number or a cited renderer line. The probe
re-implements the shipped path exactly — `mgIdealDirs(4)` (`:59305`), `orgTetraSlots` (`:65107`),
`orgBuildGeometry` (`:65144`), `orgSetTorsion` (`:65241`), `orgDihedral` (`:65132`), `orgSolveCamera` (`:65355`),
`orgSolveHome` (`:65402`), `orgMinScreenGap` (`:65481`), with `MG_ELEMENTS` radii (`:59175`),
`MG_AZ0 = 237°` (`:59161`), `MG_BOND_LEN = 2.0` (`:59144`), `ORG_ATOM_SCALE = 0.50`, `ORG_U_PER_A = 2.0/1.54`.

| # | Quantity | Measured value | Used by |
|---|---|---|---|
| 1 | Ethane atom set and ids | `C1, C2` + `C1H1..C1H3, C2H1..C2H3` = **8 atoms, 7 bonds**. Reference dihedral `C1H1–C1–C2–C2H1`. `torsion_bond = "C1-C2"`. | §9 `measure.between`, HUD `atom_count` = `C 2 · H 6` |
| 2 | Solved sight-along camera | **az 180.0000°, el −35.2644°** ( = −asin(1/√3) ), invariant in φ (identical at φ = 0, 37, 60, 180, 300) | §9 STATE_2 `camera_steps[1]` |
| 3 | Newman countability vs distance, at eclipsed φ = 0 | dist 11.5 → **+0.042** · dist 9 → **+0.140** · **dist 8 → +0.198** · dist 7 → +0.273 (floor 0.12) | the choice of `dist: 8` on S2–S7 |
| 3b | Newman worst case over a FULL turn at dist 8 | **+0.198**, at φ = 0/120/240/360 (best +0.738 at staggered) | §8 |
| 4 | Best fixed 3D camera over a full turn | **az 180, el 6 → worst gap +0.304** (dist 11.5) / **+0.301** (dist 9). Runners-up all fail: az 266/el 10 → −0.104, az 258/el 18 → −0.043, az 254/el 18 → −0.089 | §9 STATE_1 `camera` |
| 4b | Raw `ORG_HOME` (254, 18) over a full turn | **−0.138** at dist 8 (−0.089 at dist 11.5) | §8 row S7, §15 scar candidate |
| 5 | **Stationary-point counts (kept separate, per the scar)** | Over 0–360 the registry lists **7 rows**, which are **6 physical stationary points** (0 and 360 are one maximum): **3 minima** (60, 180, 300) and **3 maxima** (0/360, 120, 240). Distinct conformation **LABELS: 2** — staggered and eclipsed. **Period 120°.** | §7.3, all narration |
| 6 | Closed-form identity | max ⏐6(1 + cos 3φ) − engine raised-cosine curve⏐ over 3601 samples = **2.665 × 10⁻¹⁴ kJ·mol⁻¹** | §9 STATE_6 `formula` |
| 7 | Published energies on the curve | E(0) = **12.0** · E(30) = **6.0** · E(45) = **1.8** · E(60) = **0.0** · E(90) = 6.0 · E(120) = 12.0 kJ·mol⁻¹. Barrier = hi − lo = **12**, unambiguous, so the default HUD word `barrier` is correct for this row | §5 pinned-frame column, §9 STATE_5 |
| 8 | Geometry constants (engine, not re-derived) | C–C **154 pm**, C–H **109 pm**, tetrahedral **109.47°**; rim radius **0.734** scene units (55% of the back-hydrogen projected radius 1.335) | §8, DoD symbol table |
| 9 | Closest cross-bond H···H | eclipsed **227 pm** · staggered **249 pm** | reference only — **not authored**; see §12 open question 2 |
| 10 | Framing | molecule bounding radius **2.137** scene units; at dist 8 the viewport half-height is 4.62, so the molecule fills **46%** of it (at dist 9, 41%) | §8, no clipping risk |

Chemistry values are `chemistry-author`'s, taken as given and not re-derived: eclipsed − staggered =
**12 kJ·mol⁻¹** (Kemp & Pitzer, *JACS* **59** (1937) 276; Weiss & Leroi, *JCP* **48** (1968) 962, V₃ ≈ 1024 cm⁻¹;
band 12.0–12.5, 12 kept because the H/H eclipsing increment is then exactly 4.0 kJ·mol⁻¹ per pair, which
reproduces butane's 16 and 19). NCERT's **12.5** is a 3.0 kcal rounding: it is the answer to "why does my book
say 12.5" and is **not** a value for the sim — see §12 open question 3.

---

## §11 — Prerequisites (advisory only, Rule 23)

| Prerequisite | Status | Why |
|---|---|---|
| `sigma_pi_bonding` | shipped (`src/data/concepts/chemistry/sigma_pi_bonding.json`) | A σ bond is cylindrically symmetric about its axis, which is *why* rotation is possible at all. That concept's `axis-spin` state is the direct set-up for STATE_1. |
| `hybridisation_sp_sp2_sp3` | shipped | Both carbons are sp³, which is why each carries three hydrogens at 109.47° — the fact that makes the Newman projection read as two sets of three. |
| `vsepr_molecular_shapes` | shipped | The tetrahedral centre and the 109.5° angle. |

Advisory. The UI offers "Builds on σ and π bonding — 5 min intro?" and never gates.

---

## §12 — `has_prebuilt_deep_dive` (cache hint, not a gate)

Every state shows the Explain button; these two are worth hand-authoring because they are where students
historically stall, and both carry a Pass-1 cliff sentence (§Block 1) — the two lists agree.

| State | Why invest | Candidate `cluster_id`s |
|---|---|---|
| `STATE_2` | Reading a Newman projection is the single most common blocker in this topic, and it is a skill, not a fact. | `newman_front_vs_back_carbon` · `newman_from_a_3d_model` · `newman_vs_sawhorse_projection` |
| `STATE_4` | "Why does turning cost anything?" is the question every attentive student asks, and the answer is where the concept becomes chemistry rather than geometry. | `why_eclipsed_is_higher` · `torsional_strain_named` · `barrier_vs_bond_breaking` |

`STATE_6` is a deliberate third-place: if analytics later flag it, author `three_fold_symmetry_of_a_methyl_rotor`.

**Open questions for `chemistry-author`:**
1. **The origin of the barrier.** Textbooks say torsional strain / repulsion between bonding electron pairs;
   the modern literature (Pophristic & Goodman, *Nature* 411 (2001) 565) attributes it largely to
   hyperconjugation. Recommended handling: name **torsional strain** as the textbook term for the cost, state
   the number, and make no mechanistic claim beyond that. Confirm.
2. **H···H distances (§10 row 9) are measured but NOT authored** into any state. A `distance` measure would need
   a published `reference_value_pm` to compare against, and a defensible one (a van der Waals contact) needs a
   source. Add only if you can source it; otherwise leave S3 with the torsion arc alone.
3. **NCERT's 12.5.** Should the deep-dive on STATE_4 carry a sentence reconciling 12 and 12.5 for an Indian
   student reading the sim beside the textbook? Architect's view: yes, in the deep-dive, never on canvas.

---

## §13 — Registration

**One site.** `src/data/concepts/chemistry/conformations_of_ethane.json`. Sites 2, 3, 4, 7 and 8 are
**forbidden** for chemistry ids — Gate 8b is all-or-nothing (`docs/CHEMISTRY_ARCHITECTURE.md` §7). Validation is
`npm run validate:chemistry`. No `concept_panel_config` row, no `CONCEPT_RENDERER_MAP` entry, no
`VALID_CONCEPT_IDS` entry, no `PCPL_CONCEPTS` entry, no `CLASSIFIER_PROMPT` line.

Visual-gate platform registration is already in place from dispatch S1 and needs nothing here:
`'organic_structure'` is in the reveal-key list (`src/lib/validators/visual/deriveStateMeta.ts:820`) and has its
own pin branch (`:2165`) and motion-declaration branch (`:295`).

---

## §14 — Definition of Done (Gate 0 — zero TBDs)

**(a) Every EPIC-L state by id, with one line of content.** The seven rows of §2's arc table, verbatim.

**(b) Symbol-label table — every quantity the narration names, and its exact on-canvas string.**

| Narration says | On-canvas string | Where it is drawn |
|---|---|---|
| the angle / the dihedral | `φ` | HUD `phi` line: `φ = 30.0°` |
| the dihedral between these two hydrogens | `φ(C1–C2) = 0.0°` | S3 measure label sprite (engine default) |
| the front carbon / the back carbon | `C1` | carbon id sprite; the back carbon has **no** sprite in a Newman view (§8 row 6) |
| the C–C bond | `bond = C1–C2` | S2 HUD `bond` line |
| two carbons and six hydrogens | `C 2 · H 6` | S1, S2 HUD `atom_count` line |
| the energy | `E = 12.0 kJ·mol⁻¹` | S4, S6, S7 HUD `energy` line |
| the barrier | `barrier = 12 kJ·mol⁻¹` | S5 HUD line **and** the canvas bracket, same string stem |
| staggered / eclipsed | `staggered`, `eclipsed` | curve stationary-point labels (from the registry row) + S2 HUD `pose = staggered` |
| the formula | `E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹` | S6 formula surface only |
| the axes | `φ (°)`, `E (kJ·mol⁻¹)` | graph axis labels (registry row, not per-state) |
| the source | `(literature)` | graph stamp, every state with the curve |

Every string above has a rendering path in the shipped renderer, cited in §9 or §8 (per the OPEN row
`skeleton_dod_declares_rendered_strings_the_shipped_engine_cannot_draw`). Unicode only: φ ° · ⁻¹ – (Rule 34c).

**(c) Chemistry variant of the direction-rule plan — the balanced-equation ledger.** **Not applicable and
deliberately empty:** conformational analysis involves no reaction, no equation, no state symbols, no oxidation
numbers and no particle-count scale factor. Nothing is balanced anywhere in this concept. Right-hand rules are
N/A (physics). The direction convention that DOES need declaring is the dihedral sign: `orgDihedral` returns the
IUPAC dihedral in 0–360 and `orgSetTorsion` corrects by `(current − target)`; all authored φ are in 0–390 and
positive, so no signed convention reaches a rendered string.

**(d) Motion plan.** The archetype column of §3 with the timings of §5. Seven states, seven motions, no static
state. `spin_rate` is 0 in every guided state; S7's idle motion is the `continuous` dihedral, not a view spin.

**(e) Modes required.** `rotate` (S1–S6) and `explore` (S7). Both IMPLEMENTED. No other mode is authored.

**(f) `assessment` / `coverage_map` / `misconception_watch`.**
- `misconception_watch`: three entries, on S1, S2, S4, fully written in §4.
- `assessment`: **omitted deliberately.** `assessmentSchema.questions` is `.min(6)`
  (`src/schemas/conceptJson.ts:339`) and Gates 19/20 fire only when the block is present; the entire shipped
  chemistry fleet omits it. Under-filling with four items would fail the schema, so the block is left out rather
  than padded. Six ready items, should the founder want it turned on (Gate 20b needs ≥3 distinct `tested_idea`;
  Gate 20c needs one on the aha state `STATE_4`; Gate 19d needs every other state assessed or declared
  `non_assessed_states`):

  | q | `tested_idea` | `teaches_state` | difficulty | stem, in one line |
  |---|---|---|---|---|
  | Q1 | one molecule, two arrangements | STATE_1 | core | Are staggered and eclipsed ethane different compounds, or the same molecule at different points of one rotation? |
  | Q2 | reading a Newman projection | STATE_2 | core | In a Newman projection of ethane, what does the circle represent? |
  | Q3 | naming the arrangements | STATE_3 | core | At φ = 0° the front and back hydrogens line up. What is this arrangement called? |
  | Q4 | rotation is not free | STATE_4 | core | As ethane rotates through one full turn, how many times does its energy reach a maximum? |
  | Q5 | the barrier value | STATE_5 | core | What is the energy difference between staggered and eclipsed ethane? |
  | Q6 | the threefold period | STATE_6 | stretch | Through how many degrees must ethane turn before the energy profile repeats exactly? |

  `non_assessed_states: ["STATE_7"]` (explore).

**(g) Macro↔micro plan (Rule 33).** **Not applicable, declared.** The taught variable φ is not macroscopic —
there is no macro object with a hidden micro mechanism here; the molecule IS the object, at one level, and the
energy instrument reads the same coordinate the molecule is drawn from. Rule 33d nonetheless binds and is met:
every instrument shows a live numeric reading (HUD `φ`, `E`, `barrier`; the arc label; the rider on the curve),
and the rider is the tracking needle.

**(h) Canvas budget (Rule 34), per state.**

| State | ONE formula surface | On-canvas caption (≤5 words) | HUD (value-only) | Graph |
|---|---|---|---|---|
| 1 | none | `The C–C bond turns` | `C 2 · H 6` / `φ = …°` | off |
| 2 | none | `Now looking down the bond` | `bond = C1–C2` / `pose = staggered` / `C 2 · H 6` | off |
| 3 | none | `Hydrogens line up: eclipsed` | **off** (the arc label is the only readout) | off |
| 4 | none | `Turning draws an energy curve` | `E = …  kJ·mol⁻¹` | on |
| 5 | none | `The barrier: 12 kJ·mol⁻¹` | `barrier = 12 kJ·mol⁻¹` | on, with bracket |
| 6 | `E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹` | `Same peak every 120°` | `φ = …°` / `E = … kJ·mol⁻¹` | on |
| 7 | none | `Turn it yourself` | `φ = …°` / `E = … kJ·mol⁻¹` | on |

Exactly one state carries a formula surface, and it is the advanced state. Zones do not collide: HUD top-right
(`top:52px`), graph bottom-left, sliders bottom-right, formula top-left whenever the graph is up (Rule 34d,
handled by the renderer). Prose narration lives in `#capStrip` below the canvas, never on it (Rule 34a).

**(i) Curriculum-flex block (Rule 38).** §7 in full: rings (7.2), both cuts checked string by string (7.3),
explore-is-core (7.4), decided axes (7.5), `curriculum_tags` with `needs_teacher_verification` on every
unverified row (7.6), preset proposal (7.7).

**(j) HUD string enumeration across every sweep** (per the OPEN row
`hud_qualifier_appears_and_disappears_mid_sweep_and_the_skeleton_declares_the_label_constant` — a "label
constant" claim covers the whole rendered string, qualifiers included). Enumerated shapes, per state:

- S1 `atom_count` → exactly one shape, `C 2 · H 6`, constant for the whole sweep (no bond is created or broken).
- S1 `phi` → one shape, `φ = N.N°`, N.N running 60.0 → 359.9 → 0.0 → 30.0. **The wrap is real and is visible**;
  narration must not say "φ climbs to 390".
- S2 `bond` → one shape, `bond = C1–C2`, constant (`sight_along` is authored). `pose` → one shape,
  `pose = staggered`, constant (static pose). `atom_count` → as S1.
- S3 measure label → one shape, `φ(C1–C2) = N.N°`, 60.0 → 0.0. The label appears only once the arc has drawn
  (`rev > 0.55`), so no number precedes its own evidence.
- S4 `energy` → one shape, `E = N.N kJ·mol⁻¹`, 12.0 → 0.0 → 12.0 → … → 12.0. `orgFx` clamps −0.0 to 0.0.
- S5 `barrier` → one shape, `barrier = 12 kJ·mol⁻¹`, constant. The ethane row carries no `barrier_label`, so no
  qualifier can appear or disappear.
- S6 `phi` + `energy` → one shape each, as above.
- S7 → as S6, with the values teacher-driven.
No line ever changes its shape mid-sweep, and no line prints `—` in any authored state (every instrument each
line names is present in the state that names it).

**(k) Plain language (Rule 41).** `staggered`, `eclipsed`, `conformation`, `Newman projection`, `dihedral`,
`torsional strain`, `barrier` are standard chemistry words and are used as such (41b). Banned register: the
molecule does not want, prefer, relax, fight, settle happily, seek, or resist; bonds do not know anything.
Every rail title in §3 is short and literal, with the meaning in the first two words (41d). "Peak" and
"rises and falls" describe the drawn curve literally and are not metaphors.

**(l) Rule 19 / Rule 15 floors.** Every state declares ≥3 `scene_composition.primitives` — for this scenario the
minimum honest set is `{ molecule_skeleton, hud_readout, delta_caption }`, plus `dihedral_arc` (S3),
`energy_curve` and `energy_rider` (S4–S7), `barrier_bracket` (S5), `formula_surface` (S6), `control_panel` (S7).
Two distinct `advance_mode` (§3).

**No TBDs.**

---

## §15 — Scar candidate arising from this design (report only — the session files it)

**Not an engine ask; a recorded observation.** Owner `peter_parker:field3d_surgeon`, severity MODERATE, concepts
`conformations_of_ethane`, `conformations_of_butane`, `cyclohexane_chair_flip`, `organic_structure`:

> `explore_view_toggle_falls_back_to_the_raw_home_constant_instead_of_the_solved_home_pose` — when a teacher
> picks "Standard" in the `view` control, `updateOrganicStructureFrame` substitutes
> `{ az: ORG_HOME.az, el: ORG_HOME.el, dist: <state dist> }` (`field_3d_renderer.ts:65965`) rather than calling
> `orgSolveHome`, which exists precisely because a single authored pose cannot serve every molecule. Measured on
> ethane at dist 8, the raw constant dips to a −0.138 disc gap near φ = 310 while the solved pose (az 266, el 10)
> holds +0.131 at its reference pose. DO: a view-toggle fallback resolves through the same solver an unspecified
> camera would, at the state's own distance, so the sandbox's "Standard" view is the same pose the engine would
> have chosen. PROBE: toggle `view` to home on an explore state at dist 8, sweep φ over a full turn, and assert
> `PM_orgMinGap >= ORG_HOME_GAP_FLOOR` at every sample.

---

## Block 1 — Pass-1 strategic checklist

**1. Prerequisite cliff.**
- *`sigma_pi_bonding` missing* → the concept breaks at **STATE_1**: a student who does not know a σ bond is
  cylindrically symmetric has no reason to expect rotation to be possible at all, and watches the animation as
  an arbitrary trick. Patch, in S1's narration, one clause that costs a student who has the prerequisite
  nothing: "the C–C bond is a single σ bond, so the two ends can turn about it."
- *`hybridisation_sp_sp2_sp3` / `vsepr_molecular_shapes` missing* → the concept breaks at **STATE_2**: the six
  bonds arriving at 60° intervals on screen look arbitrary rather than as the consequence of two tetrahedral
  centres. Patch, in S2's narration: "each carbon is sp³, so its three hydrogens sit at equal angles round the
  bond." One clause, no detour.

**2. JEE-backwards trace.** Target question, JEE-Main style:

> *In ethane, during one complete rotation about the C–C bond, the number of times the molecule passes through
> an eclipsed conformation is ___, and the energy difference between the eclipsed and staggered forms is ___.*

| Piece the student needs | State that delivers it |
|---|---|
| ethane rotates about C–C | STATE_1 |
| what "eclipsed" and "staggered" mean, and how to recognise them | STATE_3 (named), STATE_2 (readable) |
| the profile has three maxima per 360° | STATE_4 (drawn), STATE_6 (as 3φ) |
| the number is 12 kJ·mol⁻¹ | STATE_5 |
| that 12 is a difference, not an absolute energy | STATE_5 (the bracket spans two levels) |

No piece is missing, and no state exists that this trace does not use. **Trap declared:** the answer "three
eclipsed positions" and the answer "two distinct conformations" are both correct answers to different questions
(§10 row 5); narration must never conflate them, and Q4/Q6 in §14(f) test them separately.

**3. Misconception entry mapping (Rule 16a).** The three beliefs, their confrontation states and their
`misconception_watch` entries are in §4. **Where the lesson itself could PLANT a belief, and the prevention:**
- STATE_1's smooth, effortless-looking rotation is the strongest possible plant for M1 ("rotation is free").
  It is deliberate — the belief must be earned before STATE_4 can break it — but STATE_1's narration must not
  reinforce it verbally. Forbidden phrasings: "freely", "without resistance", "nothing stops it". Say what is
  seen: "the two ends turn about the bond."
- STATE_2's `pose = staggered` HUD line could plant the idea that a conformation is a fixed property of the
  molecule rather than of the moment. Mitigated because the line appears only on the one state where the pose
  really is static, and disappears the moment φ moves (§8 row 7).

No EPIC-C branch exists; 16b does not apply.

---

## Block 2 — Aha-moment designation

**PRIMARY aha (`aha_moment.state_id: "STATE_4"`).**
*Turning a single bond is not free — the same rotation the student has been watching all along is drawing an
energy curve with a peak in it, three times per turn.*

That is the ten-year memory: not the number, but the discovery that a bond everyone calls "freely rotating" has
a shape to its rotation.

**SUPPORTING aha (one).**
*Sighting straight down the bond turns an unreadable tangle into a picture where the angle you can see is the
real angle (STATE_2).*

It serves the primary directly: without the Newman view the student cannot see the hydrogens line up, and
without seeing them line up the curve in STATE_4 is a graph about nothing. One supporting, not two — the
barrier value and the closed form are refinements of the primary, not separate ahas.

**Cohesion check.** Both ahas are about the same single rotation. Neither stands alone; neither belongs in a
sibling JSON. The butane concept inherits the primary and extends it with unequal groups — a different aha,
correctly placed elsewhere.

**Wrong-belief setup, per aha.**
- *Primary (STATE_4)* is set up by **STATE_1 and STATE_3**. STATE_1 shows a full, smooth, apparently costless
  turn. STATE_3 shows the hydrogens lining up perfectly with nothing visibly happening — the student is
  confident, and slightly wrong, at exactly the moment the curve appears.
- *Supporting (STATE_2)* is set up by **STATE_1**, whose oblique 3D view is legible and comfortable; the student
  believes they can already see what is going on, and then discovers the one arrangement that shows the angle.

**Foundational-coverage rule.** `entry_state_map.foundational` is STATE_1 → STATE_5 and contains STATE_4. No
exit-pill needed.

---

## §16 — ALARM-RULE verdict

**Does this design need ANY renderer change? NO.**

Every one of the seven states is authored from fields the shipped `organic_structure` contract implements today:
modes `rotate` and `explore`; `torsion` with `about` / `pose` / `phi_from` / `phi_deg` / `phi_at_ms` /
`phi_ramp_ms` / `continuous`; `camera` as `{az, el, dist}` and as `{sight_along, dist, newman}`; `camera_steps`;
`energy` on the `ethane` registry row over the `torsion` coordinate; one `measure` of kind `torsion`;
`hud_lines` drawn only from `phi` / `bond` / `pose` / `atom_count` / `energy` / `barrier`; `controls` drawn only
from `view` / `spin` / `implicit_h` / `phi`; `show_h`, `show_labels`, `show_hud`, `show_formula`,
`static_readouts`. Nothing deferred is authored, so `PM_orgRejects` must be **empty on all seven states** — that
is the gate assertion that makes this claim checkable, and it is named in §14.

The three places the design pressed on an edge were each resolved with an authored number a probe measured,
not with a request:

1. Eclipsed hydrogens fusing in the Newman view → **`dist: 8`**, measured +0.198 against a 0.12 floor.
2. No stable 3D camera for a full turn near the engine's home pose → **`az 180, el 6`**, measured +0.304.
3. The frozen pin photographing frame 0 (S1) or a rider snapped to the left edge (S4) → **φ ends at 390 and 358**
   rather than 420 and 360.

Two engine limitations are recorded rather than requested, because no teaching claim rests on either: the back
carbon carries no id sprite in a Newman view (§8 row 6 — the textbook convention is the same), and the explore
"Standard" view toggle uses the raw home constant rather than the solver (§8 row S7, filed as the §15 scar
candidate).
