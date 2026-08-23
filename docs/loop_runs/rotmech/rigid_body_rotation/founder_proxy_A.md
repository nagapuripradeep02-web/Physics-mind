# founder_proxy — Checkpoint A (DESIGN GATE) · `rigid_body_rotation` (rotmech #3) · fix cycle 1 of 2

**Reviewed:** `docs/loop_runs/rotmech/rigid_body_rotation/skeleton.md` REV 1 (Phase-0b design pass on a
0c-3-BLOCKED concept) + its engine mirror `docs/loop_runs/rotmech/_engine/findings_c.md` PASS 1.
**Date:** 2026-08-04 · **Desk:** C (`feat/rotmech-c`) · **Authority:** design gate only; no repo file
outside this report was touched, no agent dispatched, no SQL applied.

---

## VERDICT — `DESIGN_FIX`

Route every finding below to **`alex:architect`**. This is fix cycle 1 of a maximum 2.

**Why not DESIGN_OK.** On craft this is the strongest artifact this desk has produced: the tier
discipline is real (I spot-checked twenty-three cited line ranges in `field_3d_renderer.ts` and
**every one is accurate** — §A), the scar audit is a genuine both-directions superset, the ring cut
is coherent, and the scope discipline that *shrinks* 0c-3 (no `body_shape`, no `v` HUD row, no
`reference_marks`, no `ke_bar`, no second body) is exactly the judgment the loop wants. I would sign
its physics without hesitation.

It fails the gate on five things that are cheap this hour and expensive once Desk E scopes 0c-3 from
it:

1. **The lesson is authored in the rotation plane; the camera looks at that plane from 23.5°.** S2's
   entire claim — its delta cue reads *"Each point draws a circle"* — renders as an ellipse of aspect
   ratio 0.40 under the pinned pose. The per-state camera that fixes it is filed **OPTIONAL, P2**.
2. **The chapter has not decided who teaches `v = ωr`.** Three founder-approved artifacts put it in
   concept **#4**; this skeleton makes it S4's title, its supporting aha and its formula surface in
   three states, and settles the conflict unilaterally in §1.
3. **`v = ωr` is printed on canvas in S4/S5/S7 with no `r` value anywhere in the concept**, and with
   the ω readout row declared only at S3.
4. **S7's ω₀ control is `[LIVE]`, and its live path contradicts the beat S7 asserts** — the restart
   blanks the very labels S7 exists to make grow, for the whole drag.
5. **C7, the largest row in the engine ask, is costed "bought by #2 regardless".**
   `motion_of_centre_of_mass` is not one of the eight pre-registered ids, is in no desk's frozen set,
   and has no skeleton.

Two of the five (F1's chapter-camera half, F2) are **office decisions, not desk decisions** — the
architect's obligation is to file them under `APPARATUS_CONTRACT.md` §4 and design defensively, not
to resolve them. They are named for the dispatching session's open-ruling list. This is not an
ESCALATE: no physics is in doubt and the cycle budget is intact.

---

## FINDINGS

### P1-1 · The camera is not optional. The whole lesson lives in the plane the camera is 23.5° above.
*(S1, S2, S4, S5 · routed `alex:architect`, with an engine consequence for `findings_c.md`)*

**Machine evidence.** `field_3d_renderer.ts:50475-50477` pins the only camera pose the scenario has:
`spherical.radius = 9.6; spherical.phi = 1.16; spherical.theta = π/4`. The projection at `:4106-4109`
is `y = r·cos(phi)`, `x,z = r·sin(phi)·…` — the Three.js polar convention. `phi = 1.16 rad = 66.5°`
from +Y ⇒ elevation above the rotation plane **= 23.5°**; a circle in that plane projects to an
ellipse of minor/major `= sin(23.5°) = 0.40`. There is **no camera field in the rbr config** (verified
across `:977-1059`) — the skeleton's own C8 states this correctly and then files it P2.

**What the founder would say.** *"The caption says circle and the screen shows a flat oval."*

Under the pinned pose, concretely:

- **S2** — the state's one idea, its title (*"Every point moves in a circle"*) and its delta cue
  (*"Each point draws a circle"*) are all contradicted by the pixels. The C8 fallback clause covers
  this for S5/S6 (*"circles read as ellipses in honest perspective, and S5/S6 remain teachable"*) and
  never addresses S2, whose claim **is** the word "circle".
- **S1** — both gauges lie in the rotation plane, so their *projected* length oscillates between 1.0×
  and 0.40× once per half-revolution while the labels hold at `0.30 m` / `1.40 m`. S1's entire content
  is *"the numbers HOLD to the last digit"*. A segment visibly shortening beside a frozen number is a
  pixels-versus-number contradiction on the state that DEFINES the concept.
- **S4** — the four tangential arrows are mutually parallel (the markers are collinear), so the 1:2:3
  ratio survives projection — but their absolute apparent length collapses to 0.40× twice per
  revolution (every ~2.1 s at ω = 1.50). Over a 10 s state that is ~5 collapse events, and the 6.0 s
  pin is not budgeted against them. The skeleton disposes
  `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range` by
  checking the C2 **length map** and never the **projection**.
- **S5** — the drum-face beat needs the lift the skeleton already knows it needs.

**Required.** Promote C8 from `OPTIONAL, P2` to a **blocking row for this concept**, with the
per-state poses named. A near-top-down pose for S1–S5 is the obvious solve: everything this concept
teaches lives in the rotation plane and, unlike #10, it renders no axial vector at all. Under the
PRIME DIRECTIVE this is the engine fix, not the content workaround — the workaround is to re-word
S2's title, cue and narration away from "circle", which is not acceptable. Because the pose is shared
apparatus under Rule 32d, **the chapter-wide half is an office question**: file *"may a rotmech
concept author its own camera pose, and does that fork the one machine?"* to `findings_c.md` and the
open-ruling list. Keep the append-to-the-existing-OPEN-row instruction
(`field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`) but say that that row
is about the camera **target** and this is about the **pose**.

### P1-2 · `v = ωr` is claimed by two desks. This skeleton settles it unilaterally.
*(§1, S4, S5, S7 · routed `alex:architect` -> office)*

**Machine evidence — three founder-approved artifacts assign the relation to concept #4:**

- `docs/loop_runs/rotmech/phase0_survey.md:45` (THE APPROVED SPINE): row 4 `rotational_kinematics`
  reads "ω = dθ/dt, α = dω/dt, ω = ω₀ + αt. Same equations as linear motion, new variables.
  **v = ωr links the two**". Row 3 on `:42` says only "outer points travel further in the same time".
- `git show 4b289d4 -- src/lib/intentClassifier.ts`, the master pre-registration comment:
  "// Angular kinematics: θ, ω, α over time; **a point's v = ωr at radius r.**" against
  `rotational_kinematics`. The `rigid_body_rotation` comment reads only "Rigid body spinning on a
  fixed axle — the turntable apparatus itself."
- `git show c677482:docs/loop_runs/rotmech/_engine/findings_d.md` §4: "BLOCKING for
  `rotational_kinematics`'s **stated payload** … v = ωr is named in the approved spine entry for
  concept #4."

The skeleton's §1 asserts the opposite in a single clause — "`rotational_kinematics`, #4 — which USES
v = ωr as taught vocabulary" — citing no ruling. The header proves the architect **read Desk D's §4**
(it is cited by name for the C2/C3 engine reuse). It took the engine half of that section and left
the scope half behind.

**Why P1 and not a note.** If the office keeps v = ωr with #4, this concept loses S4 — its
quantitative state, its supporting aha, its formula surface in three states, one of its two Rule-16a
beats, half its drill-down clusters, its `entry_state_map` foundational payload and its whole DoD
numeric ladder. That is not a fix, it is a re-design. Ten minutes now; a rebuild after 0c-3 and
`json-author`.

**Required.** Do not resolve it here. File it to `findings_c.md` and the desk's open-ruling list in
the shape `APPARATUS_CONTRACT.md` §4 demands for an apparatus deviation, with the three citations
above and a line on what changes under each outcome. My own read, offered as input and not as the
ruling: #3 precedes #4 in the teaching order and #3's picture (one body, many radii) is the natural
home for the relation, while #4's payload is θ/ω/α over time — so #3 teaching it and #4 using it is
the better lesson. But the survey says otherwise in writing, and two desks cannot both be right
silently.

### P1-3 · The state that teaches v = ωr never puts r on the canvas, and may not put ω there either.
*(S4, S5, S7 · routed `alex:architect`)*

**Machine evidence.** The §10(b) symbol/term ledger has **no row for r** — no radius is printed in any
state. S1 prints two chord gauges (0.30 m, 1.40 m); S3 prints two arc lengths; S4/S5 print speeds
only. Meanwhile the formula surface reads v = ωr in S4, S5 and S7 (§3 Rule-34 budget). The ω readout
is declared exactly once — ledger row "Angular speed ω … First PRINTED S3, after that sentence
(`readout_at_ms`)" — and the PER-STATE x ENGINE-ROW WALK lists the ω HUD row under **S3 only**; S4, S5
and S7 do not claim it. Each state authors its own `readouts[]` (`:50158`, `:50233`), so a row not
re-declared is gone.

**Net:** the concept's quantitative core prints a three-symbol relation of which one symbol has a live
value in that state (v), one may have none (ω), and one has none anywhere in the concept (r). A
teacher pointing at v = ωr cannot read "1.50 times 0.30 = 0.45" off the screen. The skeleton disposes
`oncanvas_formula_asserts_a_value_the_renderer_cannot_show` as "satisfied — the formula surface stays
symbolic"; the defect is its mirror image — a symbolic surface whose symbols have no rendered
referents (Rule 33d; the OPEN row `teach_show_quantity_live_when_named`, which this skeleton itself
hands to physics_author).

**Required.** (a) Author `readouts: ['omega']` explicitly for every state that displays the formula,
and show it in the walk. (b) Give r a rendered value at S4. Mechanically this is already inside C5
("chord gauge between two markers", and S4 authors an axle marker at `r_m: 0`, so axis-to-P1 is a
legal marker pair) — but the C5 contract must **name the axis-to-marker radius form explicitly** or
Desk E builds only the two-marker form. (c) Re-run the displayed-numeral audit including the radii,
because printing them breaks it — see P2-1.

### P1-4 · S7's ω₀ control is [LIVE], and what it does live is not what S7 says it does.
*(S7 · routed `alex:architect`, with a NEW engine row for `findings_c.md`)*

**Machine evidence, traced end to end this session:**

- `:50115-50122` — every slider `input` event calls `rbrApplyParam(token, v)`.
- `:50075-50078` — the omega0 branch calls `rbrRestartNow(null)` unconditionally; the in-line comment
  is "omega0 re-pins L -> a RESTART".
- `:50053-50064` — `rbrRestartNow` sets `eng.evRepinT = t` and calls `rbrThetaReset()`.
- `:49896-49899` — `rbrBlanked(tMs)` is true for tMs in [evRepinT, evRepinT + blankMs), i.e. 500 ms
  (`RBR_DEF_BLANK_MS`, `:49745`).
- `:50243` — every readout writes an em dash while blanked; `:50283-50284` shows the "restarting"
  badge throughout.
- `:49967-49970` + `:49952-49965` — `rbrThetaReset` re-bases theta to theta0 and `rbrThetaAt`
  re-integrates from the grid origin with the NEW ω, so the drawn angle jumps by about t x delta-ω on
  every event.

A drag fires `input` on every step, so `evRepinT` keeps advancing: **the blank is continuous for the
whole drag and for 500 ms after it**, with the "restarting" badge on screen the entire time. The
skeleton's own C2 contract writes the new labels into that gate — "labels blank under `rbrBlanked`
(`:49896`) like the HUD" — while its S7 beat asserts "all v arrows and labels growing TOGETHER (one
ω)". They cannot grow together; they read an em dash until the teacher lets go. And at any
non-trivial t the apparatus teleports in angle on every step, taking the C3 traces with it.

The restart semantics are **correct for #10** (ω₀ re-pins L, a genuine discontinuity) and wrong here:
this concept teaches no L, tau_ext = 0 and I is constant, so ω₀ IS ω and changing it is a continuous
physical change.

**Required.** File a new engine row — a non-restarting live ω control for the turntable family (a
closed-form re-anchor: with tau = 0 and constant I, L becomes I x ω_new with no blank and no theta
re-base), or an authored opt-out of the re-pin for states that teach no L. This is a row the whole rbr
family will want and it is **missing from the ask entirely**, which is why the forward walk does not
close (P2-5). Do not resolve it by dropping ω₀ from S7 — that leaves the explore state with one
control and is the content workaround the PRIME DIRECTIVE rejects. Correct the C2 blanking clause at
the same time: per-marker v labels should follow the ω they display, not the L-restart blank.

### P1-5 · C7 is costed "bought by #2 regardless". #2 is not in this chapter wave.
*(S6 / engine ask · routed `alex:architect`)*

**Machine evidence.** `git show 4b289d4 -- src/lib/intentClassifier.ts` registers exactly eight ids:
`rigid_body_rotation, rotational_kinematics, tau_eq_i_alpha, rotational_work_energy, angular_momentum,
conservation_of_angular_momentum, pure_rolling, rolling_on_incline`. **`motion_of_centre_of_mass` (#2)
and `centre_of_mass` (#1) are absent.** No desk state file names them; `docs/loop_runs/rotmech/` holds
skeleton directories for five concepts, none of them #1/#2.

The C7 cost cell reads "large — but bought by #2 regardless", and the deliverable summary repeats
"C7 glide (bought by #2, consumed here)". Desk E, scoping 0c-3 from this document, reads that as "you
are paying for it anyway" — when in this wave C7 would be built **for one state of one blocked
concept, and that state is the cuttable advanced ring.** Largest row in the ask, thinnest consumer.

The 0a survey does back the sharing — `phase0_survey.md:197` (row 3, "General motion = translation +
rotation about CoM | no — shared with #2") and `:229` ("0c-1 | Multi-body system + live CoM marker and
path trace | #2, and #3's general-motion ring") — but that row was priced into **0c-1, which shipped
without it**, and #2 is not being authored. Both facts are true and neither is in the skeleton.

**Required.** Rewrite the cost cell honestly: "large; approved at 0a as a #2/#3 shared row
(`phase0_survey.md:197,229`), NOT delivered by 0c-1, and #2 is not in the Phase-0d wave — so in this
wave C7 has exactly ONE consumer state, which is cuttable." Then state the recommendation out loud:
**defer C7, ship the concept core|extended, and let S6 land when #2 is authored.** The ring cut is
already designed for it — I verified §10(i-1): no surviving state references the glide, the centre
term is defined only at S6, and both S7 controls map to surviving states. A Desk E reader should not
have to derive the recommendation.

---

### P2-1 · The marker ladder collides with the drawn apparatus, and with itself once r is printed.
*(S1, S4 · routed `alex:architect`)*

Three collisions in one numeric choice:

1. **P3 vs the mass sphere.** `RBR_MASS_R = 0.16` world (`:49798`) and `RBR_WORLD_PER_M = 1.8`
   (`:49736`), so a drawn mass at r = 0.80 m spans **0.711 – 0.889 m** along the rod. P3 sits at
   **0.90 m** — a clearance of 0.011 m (0.02 world units), i.e. touching. §2 asserts the markers are
   "all on material … and clear of the masses (0.80)". That is false as authored, on both arms (the
   pair is symmetric). Scar `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry`
   plus the OPEN row `field3d_label_sprite_overlap` — P3's dot, its 1.35 m/s label and its arrow all
   land on the mass and its own label.
2. **The 0.30 echo, in-state.** The S1 gauge P1-P2 reads 0.30 m and is drawn **collinear with the
   axle-to-P1 span, which is also 0.30 m and immediately adjacent on the same line**. A reader cannot
   tell which span the label belongs to. This is worse than a cross-state echo: both spans are in the
   same frame.
3. **The 0.90 echo, in-state, once P1-3 is fixed.** Printing radii puts "r = 0.90 m" on P3 in the same
   frame as "v = 0.90 m/s" on P2. The §2 displayed-numeral audit never included the radii because it
   never planned to print them.

**Required.** Re-tune the ladder against (a) the drawn mass extent 0.711–0.889 m, (b) the S1 chord
values, (c) the S4/S5 speed values, (d) the r values once printed — and re-run the audit over the
union. State the clearance in metres, not as an assertion.

### P2-2 · Both S1 gauges are drawn along the rod axis, so the state's only picture is invisible.
*(S1 · routed `alex:architect`)*

P1-P2 (0.30 to 0.60 on one arm) and P2-to-far-mass (0.60 on one arm, through the axis, to 0.80 on the
other) are **both collinear with the rod**, which the renderer draws as a solid cylinder at the same
height (`:50345-50351`, `rod.position.set(0, RBR_DEF_ROD_H * W, 0)`; the masses sit at the same rodY,
`:50676`). A distance gauge superimposed on the rod reads as a segment of the rod. S1's whole content
is those two gauges holding constant.

**Required.** Write the standoff into the C5 contract — the gauge draws parallel to its span at an
authored vertical or lateral offset, with end ticks — and say which offset. This is the difference
between S1 teaching and S1 being a spinning rod with two numbers floating near it.

### P2-3 · The S5 drum face already carries a bright radial stripe, and the rod projects across it.
*(S5 · routed `alex:architect`)*

`:50320-50327`: `rbr_drum_marker` is a BoxGeometry of length 0.92 x R_drum x W at x = 0.46 x R_drum x W,
colour `#FFF176` at `emissiveIntensity 0.42` — **a bright yellow radial stripe from the drum centre to
its rim, on the exact surface S5 populates**. It is in `RBR_ALWAYS_ON` (`:50585`) so it cannot be
hidden, and in the brighten-only solid set (`:50782-50788`) so it never dims behind a focal. It is
collinear with the rod (both along +x), and the rod (half-length 1.00 m = 1.8 world vs drum radius
0.99 world) projects across the whole drum face from any lifted camera, with the masses hanging 0.35
world above it.

The skeleton diffed this stripe carefully for S3 — it correctly rules it unusable as a fixed reference
because it rides the spin group (`:50327`) — and then never diffed it for S5, where it competes
directly with the authored dot line and reaches the rim ring at one point. Scar
`architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on`,
half-satisfied.

**Required.** Author the C1 angle_deg for the S5 dot line clear of the rod and the stripe (90 degrees
is the obvious choice), state the rod/mass occlusion budget for the drum-face camera, and say what the
stripe is doing during S5 — it is a legitimate 13th element competing for a Rule-32e focal.

### P2-4 · S5's real information gain is not what its title or delta cue names.
*(S5 · routed `alex:architect`)*

The dispatch asked whether populate-rule earns a state or should fold into S4. **It earns it** — but
not for the reason the skeleton gives. S4's four markers are collinear, so S4 can only show that v
grows along one line. S5's rim ring shows **v depends on r ALONE, not on angular position** — which S4
structurally cannot show, and which is the actual content of "every point of the body". The design
already carries it: two labels both reading 0.75 m/s at different angles and the same radius,
correctly deliberate. But the title "The whole disc follows the same rule" and the cue "Whole disc,
same rule" name a restatement, which is exactly why the state reads as derivable from S4.

**Required.** Re-point S5's declared one idea, title and delta cue at same radius, same speed (cue
e.g. "Same radius, same speed"), keeping the graded line as the supporting half. Cheapest single
upgrade in the review. **Keep the state and keep the archetype** — folding it into S4 would break Rule
31's one-idea/one-motion and destroy the arrow-per-sentence build.

### P2-5 · The per-state x engine-row walk does not close in the state to row direction.
*(engine ask · routed `alex:architect`)*

The reverse direction (every row claimed by a state) closes; I checked it. The forward direction does
not — four asserted visuals have no owning row.

1. **S4's "straight envelope"** — "the arrow tips line up along a straight envelope, the linear rule
   made visible". If it is a drawn line it is an unbought primitive, which the skeleton disposes as
   satisfied under `named_primitive_declared_without_the_surface_that_can_render_it`. If it is only
   the geometric fact, then "made visible" overclaims and S4 proves less than the skeleton thinks.
2. **S7's "all v arrows and labels growing TOGETHER"** under a live ω change — no row; see P1-4.
3. **v = ωr with a readable r and ω in S4/S5/S7** — no row; see P1-3. C5 must name the axis-to-marker
   form.
4. **S3's "both points cross the start line at the SAME instant" as a legible EVENT** — the [LIVE]
   phases channel could stage it, but nothing authors it, and two COLLINEAR markers crossing a ray is
   not a salient event by itself (the whole rod crosses at once). Without a staged cue, S3's
   misconception counter rests entirely on the arc labels.

**Required.** Close all four, then re-state the row count — the walk's headline "8 engine rows asked"
will change, and Desk E is scoping from that number.

### P2-6 · The ask does not cite the survey rows that already bought two of its biggest items.
*(engine ask · routed `alex:architect`)*

`phase0_survey.md:155` prices 0c-1 row 3 as "Axle + rigid body meshes; theta rotation; **per-point
circular traces at different radii**" — that is C3, founder-approved at 0a and **not delivered by
0c-1**. Lines 197 and 229 do the same for C7. The skeleton cites neither. A Desk E reader sees C1-C7
as eight new asks from one blocked concept and prices them as scope creep; cited, C3 and C7 are
undelivered approved scope, which is a different and much stronger conversation.

**Required.** Cite them, per row, in the C-table and in `findings_c.md`.

### P2-7 · The timed-surface count is disposed by assertion, and the chapter has an alarm rule about it.
*(engine ask · routed `alex:architect`)*

The skeleton disposes the scar
`skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant`
with "C4 one window (S3 only); C7 one detach instant + one loop; nothing else timed beyond per-element
reveal cues the scenario already patterns." Counting the C-rows as written, the ask adds **five new
timed field classes**: the C1 per-marker label reveal ms/cue, the C2 per-arrow reveal ms/cue, the C4
compare window plus its arc-label instants, the C7 detach instant, and the C7 loop reset. The
scenario's existing timed surface is `readout_at_ms`, `phases[]` at/until, `external_torque`
engage/release, `restart`, `reference_marks[]` at_ms and `param_ramp` — a per-marker reveal cue is a
new CLASS, not an instance of those.

`phase0_survey_amendment.md` (founder-signed) declares "The timed surface is exactly TWO field classes
… A third timed class is the alarm rule: **STOP and re-scope**" — written for 0c-2 and repeated in
`APPARATUS_CONTRACT.md` §2, with no equivalent stated for 0c-1.

**Required.** Count them, state the number, and ask the office in `findings_c.md` whether the
two-timed-class fence binds 0c-1. Do not answer it locally. A hand-wave here is exactly the shape of
the thing the fence was signed to prevent.

### P2-8 · "Turning rate ω" leads; "angular speed" is the word the syllabus and the formula use.
*(S3, §1, §4, ledger · routed `alex:architect`)*

The ledger authors the dual-label as "one turning rate ω (angular speed)", and §1/§4 repeat "one
shared turning rate ω" and "one body, one turning rate ω". Rule 38d's dual-label pattern
("Voltage V (p.d.)") pairs two **board dialects**; "turning rate" is a coinage in no syllabus, so the
convention is being satisfied with a gloss rather than a dialect. Rule 41b is explicit: physics
vocabulary is not jargon, use the word the formula uses.

**Required.** Lead with **angular speed ω**, gloss once as "how fast the body turns", then bare ω.

### P2-9 · S6's glide is unbounded in the skeleton while two of its own claims constrain it.
*(S6 · routed `alex:architect`)*

Two authored constraints exist and neither is written down.

- "P2 traces a **looping** curve" is true only while v_glide is less than ω x r_P2 = 1.50 x 0.60 =
  0.90 m/s. Above that the trochoid has no loops and the state's picture silently changes.
- With C8 unbuilt or deferred, the camera is the fixed radius-9.6 pose whose own build comment budgets
  "about 4.0 units of half-width" (`:50470-50474`). The rod alone is 1.8 world units each side,
  leaving roughly 2.0 world units (about 1.1 m) of usable travel each way. The skeleton defers the
  number to physics_author ("exact metres computed by physics_author with the C7 velocity") while also
  making the camera optional, so nothing bounds it.

**Required.** Author both bounds in the skeleton, as inequalities, so physics_author cannot break the
picture arithmetically.

---

### P3 notes (report-only; fix if cheap, do not spend a cycle on them)

- **P3-1 · cm_path_trace is comment-declared, not interface-declared.** C3 calls it "the declared
  `cm_path_trace` member". A grep returns exactly one hit, `:952` — inside the contract COMMENT. The
  TS interface (`:990-993`) declares only `particles`, `parts`, `axis_select`, `axis_pair`. Under the
  scar `deferred_enum_members_must_be_declared_not_merely_unimplemented` that is itself a small engine
  finding: C3/C7 must ADD `bodies[]`, `cm_marker`, `cm_path_trace` and `fragment_trigger` to the type,
  not merely implement them. Worth one line in `findings_c.md`.
- **P3-2 · Rule 38a's ordering clause is ticked on ring order, not content order.** §2 claims the
  ladder reads "qualitative (S1-S3) to quantitative (S4) to extended (S5) to advanced (S6)", which
  substitutes the RING ladder for 38a's qualitative-quantitative-derivation ladder. S5 and S6 are both
  largely qualitative and both follow the quantitative state, and the advanced ring is a decomposition,
  not a derivation. The STRUCTURAL clauses (contiguous advanced block immediately before explore;
  coherent under both cuts) are genuinely satisfied — I verified the cut. Just say so honestly: this
  concept has no derivation to stage, because s = r-theta implies v = ωr needs d-theta/dt, which §1
  correctly defers to #4.
- **P3-3 · S5's outermost line dot and its labelled rim dot may be the same point.** The line runs
  r = 0.10 to 0.50 and the ring sits at r = 0.50. If the labelled rim dot is the line's own end, the
  "same r, same v" pair collapses to one label. State that they sit at different angles.
- **P3-4 · S3 is the most over-subscribed state.** Inside 40-55 words it must open the compare window,
  deliver the aha, introduce ω, carry a ~9-word anchor and land the misconception counter. Name what
  physics_author cuts first if it will not fit.
- **P3-5 · S6's loop-reset instant is not stated.** The pin table asserts "the pin lands BEFORE the
  first loop reset" with a 12 s period and a 6.0 s last reveal, but the reset time is never authored.
  Give it a number.
- **P3-6 · S1 is the thinnest state in the arc.** Its null-result is a number that cannot change, on a
  body drawn as a solid cylinder that cannot deform. It is load-bearing — it defines "rigid", installs
  the markers and sets the measurement discipline — so it stays. But if P1-1's camera work gives you a
  near-top-down S1, ask whether S1 has anything that COULD have changed. Absent that, it is a
  definition slide with a spinning background.

---

## WHAT I AGREE WITH, ON THE RECORD

Ruled on explicitly so the architect does not re-litigate them in cycle 2:

1. **The missing v readout — the architect's ruling is CORRECT and I endorse it fully.** A v row in
   `RBR_RO_META` must not be built for this concept. v is per-point; S4 shows four different v at one
   instant on one body; a singleton HUD row structurally cannot say which point it describes, and
   picking or averaging one would reinforce the exact wrong belief S4 exists to break ("every point of
   one spinning body moves at the same speed"). Rule 33d puts the instrument where the teacher glances
   — at the point. The number must still be live and engine-computed, which the C2 contract requires;
   that is the right home for it. Endorsing Desk D's §2 loud-warn ask is also right and costs nothing.
   **Do not revisit this.**
2. **Withholding r, m and tau_brake from S7 is the right call.** Sliding r under the L-conserving
   engine (`rbrOmegaAt` = L/I, `:49945`, verified) raises ω — that is concept #10's aha, and #10 is
   DESIGN_OK on Desk A on the same apparatus. tau_brake stages torque (#5/#7/#13). Exposing either
   would steal a sibling's payoff. Rule 31's "explore exposes ALL" means all the controls THIS concept
   teaches, and two is the honest number. S7 still earns its place under Rule 37 through the r_point
   drag, which answers the first question a teacher asks after the aha — once P1-4 is fixed.
3. **populate-rule earns its state** (with the one change in P2-4), and **arc-compare and trace-draw
   are legitimately coined** — no seed archetype covers self-recording motion or a two-element compare
   inside one interval.
4. **S6 cuts cleanly.** I walked it: no surviving state references the glide, the centre-point term is
   defined only at S6, and both S7 controls map to surviving states under both cuts. §10(i-1) is
   accurate.
5. **The tier discipline is real.** See §A. This is the first skeleton I have read on this chapter
   where I could not find a single [LIVE] tag the file does not support.

---

## §A — TIER-TAG SPOT CHECK (scar `archetype_live_tier_unverified_against_renderer`)

Twenty-three cited ranges read against `src/lib/renderers/field_3d_renderer.ts` this session.
**Zero false [LIVE] tags.**

| Cited | Claim | Verdict |
|---|---|---|
| :49945 | rbrOmegaAt = L/I, omega always derived | exact |
| :49952 / :49958 | rbrThetaAt fixed-grid closed form; backwards-rebuild branch | exact |
| :49852 / :49858 | ramp and sweep consume param "r" only | exact; any other param is a silent no-op |
| :49865 | rbrIOf reads only the mass pair (the masslessness guard) | exact |
| :49829 / :49795 | force-arrow knee map and RBR_ARROW_MIN_LEN = 0.16 | exact |
| :49896 | rbrBlanked | exact |
| :49999 | omega0 slider spec, min 0.5 max 3.0 | exact |
| :50033 / :50137 | reserved-slot visibility:hidden row pattern | exact |
| :50053-50064 | rbrRestartNow | exact |
| :50128 | rbrToggleSliderRows | exact |
| :50147 / :50149 | RBR_RO_META, six rows, omega among them | exact |
| :50162 / :50236 | the silent skip in both the rebuild and the write | exact (:50163, :50237) |
| :50234-50241 | readout_at_ms per-row gating | exact |
| :50288-50412 | apparatus mesh set | exact |
| :50298-50302 | rbr_spin group | exact |
| :50322 | drum stripe rides the spin group, unusable as a fixed reference | exact, and the reasoning is right |
| :50435-50466 | DOM zone map, HUD at top:52px | exact |
| :50475-50477 | the single pinned camera pose | exact, and see P1-1 |
| :50570-50574 | the one formula surface | exact |
| :50581-50632 | exact-token visibility, overlays default OFF | exact |
| :50647-50656 | phases rewrite the glow focal only | exact |
| :50782-50788 | brighten-only solid set | exact |
| :49747 / :50448 | Cambria Math on the formula surface | exact |
| :977-1059 | no camera field in the rbr config | verified absent |

One correction to the CONTRACT, not to the skeleton: `theta0_rad` is listed as declared-and-inert in
`APPARATUS_CONTRACT.md` §1, but it is read at `:50499` into `eng.theta0` and seeded by `rbrThetaReset`
(`:49967-49970`). Desk D already recorded this (`findings_d.md` §3). Noted here so the contract gets
corrected once, in the office, rather than twice.

---

## §B — APPARATUS CONTRACT COMPLIANCE

| Pinned field | Contract | Skeleton | OK |
|---|---|---|---|
| home r | 0.80 m | 0.80 m, authored explicitly | yes |
| omega0 | +1.50 rad/s | +1.50 | yes |
| m | 2.0 kg | 2.0 | yes |
| i_frame_kgm2 | 0.50 | 0.50 | yes |
| rod_half_length_m | 1.00 | 1.00 | yes |
| brake_drum_radius_m | 0.55 | 0.55 (the drum face is the S5 disc) | yes |
| r_min / r_max | 0.15 / 0.90 | 0.15 / 0.90 | yes |
| derived I / L / KE | 3.06 / 4.59 / 3.44 | 3.06 / 4.59 / 3.44 | yes |
| author explicitly, never inherit | binding | done, and correctly: applyRigidBodyRotationState defaults r to RBR_DEF_R_MAX = 0.90 (:50496), NOT 0.80, so an omitted field would silently move the apparatus | yes |

**No apparatus deviation is taken locally.** The only chapter-wide asks this design generates are the
camera question (P1-1) and the v = ωr ownership question (P1-2), and both are routed to the office
rather than decided here — which is the contract §4 protocol working as intended.

---

## §C — CANDIDATE SCAR ROWS

For the dispatching session to append to `docs/loop_runs/rotmech/_engine/scar_candidates.sql`.
bug_class checked against that file (two existing rows:
`field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters` and
`engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work`) — no collision.
**Not applied to the DB by me; filing is the dispatcher job.**

```sql
-- Candidate A - P1-1. The design-side half; the engine-side camera gap already has an OPEN row.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'skeleton_asserts_a_planar_shape_claim_under_a_fixed_oblique_camera',
    'A skeleton authors a shape claim (circle, right angle, equal length) about motion in one plane while the scenario pins a single oblique camera, so the projected pixels contradict the state caption',
    'MAJOR',
    'alex:architect',
    'The rigid_body_rotation scenario pins exactly one camera pose at build time (field_3d_renderer.ts:50475-50477: radius 9.6, phi 1.16, theta pi/4) and declares no camera field anywhere in its config (:977-1059). The Three.js polar convention at :4106-4109 (y = r*cos(phi)) puts phi = 1.16 rad at 23.5 degrees of elevation above the rotation plane, so a circle drawn in that plane projects to an ellipse of minor/major = sin(23.5 deg) = 0.40, and an in-plane vector loses up to 60 percent of its apparent length twice per revolution. Concept 3 authored its S2 title, delta cue and narration around the literal word circle, its S1 null-result around two in-plane gauges whose labels hold while their projected length oscillates, and its S4 arrow ladder around lengths that collapse at two phases per turn. Every one of those claims is true in world units and false in pixels. The architect filed the per-state camera as OPTIONAL P2 with a stated fallback, having checked that fallback only against the two states where the ellipse is decorative and never against the state whose entire claim is the word circle.',
    'When a skeleton makes a claim about the SHAPE, LENGTH or ANGLE of something moving in a plane, the camera elevation relative to that plane is part of the design and must be stated with a number, not deferred to a fallback clause. Compute sin(elevation) and write it down: below about 0.7 a circle no longer reads as a circle and an in-plane length no longer reads as constant. If the scenario cannot author a camera, that is a BLOCKING engine row for the concept, never an optional one, and the alternative of rewording the claim to match the projection must be rejected rather than silently taken.',
    'js_eval',
    'For any field_3d concept whose states claim a planar shape: read the camera position and the scene target, compute the elevation angle above the plane of the taught motion, and assert sin(elevation) >= 0.7. Separately, capture the frozen frame of the claiming state, measure the drawn locus bounding-box aspect ratio, and assert it is within 10 percent of 1.0 for a circle claim.',
    'OPEN',
    ARRAY['rigid_body_rotation']::text[],
    ARRAY[]::text[],
    'rotmech desk C - rigid_body_rotation Checkpoint A 2026-08-04',
    'incident'
);
```

```sql
-- Candidate B - P1-2. Cross-concept payload collision between two blind desks.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'skeleton_claims_a_relation_the_approved_spine_assigns_to_a_different_concept',
    'A parallel-desk skeleton makes a relation its own primary payload when the founder-approved chapter spine, the master registration comment and a sibling desk all assign that relation to another concept',
    'MAJOR',
    'alex:architect',
    'rigid_body_rotation (concept 3) authored v = omega*r as its S4 title, its supporting aha, its formula surface in three of seven states, one of its two Rule-16a beats and its entire DoD numeric ladder. Three independent founder-approved artifacts assign v = omega*r to concept 4, rotational_kinematics: the approved spine row at phase0_survey.md line 45, the master pre-registration comment landed in commit 4b289d4 (Angular kinematics: theta, omega, alpha over time; a point v = omega*r at radius r), and Desk D findings_d.md section 4, which calls its absence BLOCKING for the rotational_kinematics stated payload. The skeleton header proves the architect read findings_d.md section 4, since it is cited by name for the engine-row reuse, so the engine half of that section was taken and the scope half was left. Five desks cannot see each other, nothing in the validator checks cross-concept payload overlap, and the chapter-wide Checkpoint C is the first gate that would catch it, by which time both concepts are built.',
    'A skeleton may not resolve a cross-concept payload overlap inside its own atomic-claim section. If the relation a state teaches appears in another concept row of the approved chapter spine, in that concept registration comment, or in another desk filed findings, the skeleton files the conflict to its engine/office findings file with all citations and states what changes under each outcome - the same protocol APPARATUS_CONTRACT.md section 4 requires for an apparatus deviation. Grep the approved spine and every sibling findings file for the relation, by symbol, before writing section 1.',
    'manual',
    'For each state formula surface and each stated aha in a new skeleton, grep the chapter phase0_survey spine table, the concept pre-registration comments and every docs/loop_runs/<chapter>/_engine/findings_*.md for the same relation. Any hit on a DIFFERENT concept id is a conflict that must appear in the skeleton findings mirror, never in its section 1.',
    'OPEN',
    ARRAY['rigid_body_rotation', 'rotational_kinematics']::text[],
    ARRAY[]::text[],
    'rotmech desk C - rigid_body_rotation Checkpoint A 2026-08-04',
    'incident'
);
```

```sql
-- Candidate C - P1-4. A live control whose live path contradicts the beat that uses it.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'explore_control_tagged_live_but_its_engine_path_blanks_the_readout_it_exists_to_drive',
    'A skeleton tags an explore control LIVE from its slider spec without following the apply path, and the apply path blanks or restarts the very readouts the explore beat asserts will move',
    'MAJOR',
    'alex:architect',
    'rigid_body_rotation S7 exposes two controls and asserts of the first that a change re-initialises the spin via the restart path with the 500 ms re-pin blank, all v arrows and labels growing TOGETHER. Following the path in field_3d_renderer.ts: every slider input event calls rbrApplyParam (:50115-50122); the omega0 branch calls rbrRestartNow unconditionally (:50075-50078); rbrRestartNow sets eng.evRepinT = t and calls rbrThetaReset (:50053-50064); rbrBlanked returns true for the interval evRepinT to evRepinT + 500 ms (:49896-49899); every readout writes an em dash while blanked (:50243) and a restarting badge is displayed (:50283). Because a drag fires input on every step, evRepinT keeps advancing and the blank is CONTINUOUS for the whole drag plus 500 ms. rbrThetaReset additionally re-bases theta from the grid origin with the new omega, so the drawn angle jumps by roughly t times delta-omega on every event. The skeleton own engine-row contract then wrote the new per-marker labels INTO that same blank gate. Net: the one manipulation the explore state exists to demonstrate shows dashes and a teleporting apparatus for as long as the teacher holds the slider. The restart semantics are correct for the concept the scenario was specced against, where the control re-pins L, and wrong for a concept that teaches no L.',
    'A control tagged LIVE in a skeleton must be traced from the DOM event through the apply function to the readout write, never inferred from the presence of a slider spec. State the trace with line numbers for every control an explore state exposes, and check specifically for blanking gates, restart or re-anchor calls, and integrator resets that re-base a drawn pose. If the engine semantics are right for a sibling concept and wrong for this one, that is an engine row, not a wording change, and it belongs in the engine ask.',
    'js_eval',
    'On the explore state, dispatch a sequence of input events across the slider range at 100 ms spacing and, at each step, read the readout element textContent and the drawn body rotation. Assert no readout shows the blank glyph at any point during the sweep, and assert the drawn angle is monotone across the sweep.',
    'OPEN',
    ARRAY['rigid_body_rotation']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'rotmech desk C - rigid_body_rotation Checkpoint A 2026-08-04',
    'incident'
);
```

```sql
-- Candidate D - P1-5. Engine cost justified by a consumer that is not in the wave.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'engine_row_costed_as_bought_by_a_concept_that_is_not_in_the_authoring_wave',
    'A skeleton prices its largest engine row as already bought by a sibling concept, when that sibling is not registered, not in any desk frozen set and has no skeleton',
    'MAJOR',
    'alex:architect',
    'The rigid_body_rotation engine ask prices row C7 (free-flight decomposition: detach, constant-velocity glide while spinning, centre trace, point trace, co-moving highlight, loop blank) as large but bought by concept 2 regardless, and repeats bought by 2, consumed here in its deliverable summary. The eight ids pre-registered for the wave in commit 4b289d4 do not include motion_of_centre_of_mass or centre_of_mass; no desk state file names either; no skeleton exists for either. The 0a survey does approve the sharing at phase0_survey.md lines 197 and 229, but priced it into build 0c-1, which shipped without it. So the largest single row in the ask has, in this wave, exactly ONE consumer state, and that state is the cuttable advanced ring the skeleton itself designs to be cut. An engine desk scoping from the cost column reads bought regardless as free.',
    'An engine-row cost cell may name a sharing consumer only if that consumer is in the current authoring wave: registered, in a desk frozen set, or holding a skeleton. Otherwise the cell must read that the row is approved but undelivered, that the sharing consumer is not in this wave, and that in this wave the row has N consumer states, and it must state the defer recommendation explicitly rather than leaving the engine desk to derive it. Cite the survey line for any approved-but-undelivered claim.',
    'manual',
    'For every engine row whose cost cell names another concept as a co-consumer, check that concept id against the wave registration commit and the desk state files. Any co-consumer absent from all of them makes the cost cell a finding.',
    'OPEN',
    ARRAY['rigid_body_rotation']::text[],
    ARRAY[]::text[],
    'rotmech desk C - rigid_body_rotation Checkpoint A 2026-08-04',
    'incident'
);
```

```sql
-- Candidate E - P1-3. A formula surface whose symbols have no rendered values.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'formula_surface_symbol_carries_no_rendered_value_in_the_state_that_prints_it',
    'A state prints its symbolic relation on the one formula surface while one or more of its symbols has no live value anywhere on the canvas in that state, so the relation cannot be checked or pointed at',
    'MAJOR',
    'alex:architect',
    'rigid_body_rotation prints v = omega*r on the formula surface in three states. v has a live per-marker label in all three. omega has a HUD row declared in exactly ONE state: the term ledger prints it at S3 and the per-state engine walk lists the row under S3 only, and each state authors its own readouts array (field_3d_renderer.ts :50158 and :50233), so a row not re-declared is absent. r has NO printed value in any state of the concept: the symbol-and-term ledger has no r row at all, and every printed length in the concept is a chord (0.30 m, 1.40 m) or an arc (0.81 m, 1.62 m), never a radius. The skeleton disposes the related scar oncanvas_formula_asserts_a_value_the_renderer_cannot_show as satisfied because the surface stays symbolic; the defect is the mirror image. A teacher pointing at v = omega*r cannot read 1.50 times 0.30 equals 0.45 off the screen.',
    'The symbol-and-term ledger must carry a row for EVERY symbol printed on a formula surface, naming the state where its live value appears, not merely the state where the term is defined in narration. Where a symbol is a per-element quantity, the value rides the element (Rule 33d); where it is global, the state must re-declare its readout row. A formula surface whose symbols do not all resolve to a rendered number in the SAME state is a design finding, not a physics_author detail.',
    'js_eval',
    'For each state with a formula surface, extract the symbols from the formula string and assert that each one has either a visible HUD readout row or a visible on-canvas value label in that same state at the pinned instant.',
    'OPEN',
    ARRAY['rigid_body_rotation']::text[],
    ARRAY[]::text[],
    'rotmech desk C - rigid_body_rotation Checkpoint A 2026-08-04',
    'incident'
);
```

---

## §D — ENGINE-ASK DELTA (for `findings_c.md`, PASS 2)

The engine ask is a real deliverable and Desk E scopes 0c-3 from it, so here is the delta as a list.

1. **C8 becomes BLOCKING**, not optional-P2, with per-state poses named. Keep the append-to-the-OPEN-row
   instruction and add that the OPEN row is about the camera TARGET while this is about the POSE.
   Attach the chapter-wide question: may a rotmech concept author its own camera pose. (P1-1)
2. **NEW ROW: a non-restarting live omega control** for the turntable family (closed-form re-anchor, no
   blank, no theta re-base), or an authored opt-out of the re-pin for states that teach no L. Correct
   the C2 blanking clause at the same time. (P1-4)
3. **C5: name the axis-to-marker radius form explicitly**, with its live length label, or Desk E builds
   only the two-marker chord form and r never reaches the canvas. Add the standoff contract so a gauge
   is not drawn inside the rod. (P1-3, P2-2)
4. **C7: rewrite the cost cell** with the wave fact, cite phase0_survey.md lines 197 and 229, and state
   the defer recommendation explicitly. (P1-5)
5. **C3: cite phase0_survey.md line 155.** Per-point circular traces at different radii were approved at
   0a for 0c-1 and not delivered. Undelivered approved scope, not new scope. (P2-6)
6. **C1: add the S5 angle_deg obligation** (clear of the rod and of the always-on drum stripe) and the
   P3-marker-versus-mass clearance constraint in metres. (P2-1, P2-3)
7. **Count the new timed field classes (five) and ask the office** whether the signed two-timed-class
   fence binds 0c-1. (P2-7)
8. **Add the interface-declaration obligation:** bodies[], cm_marker, cm_path_trace and fragment_trigger
   exist only in the contract comment (:952), not in the TS interface, so C3/C7 must declare them, per
   `deferred_enum_members_must_be_declared_not_merely_unimplemented`. (P3-1)
9. **Close the forward walk** (the S4 envelope, the S3 simultaneous-crossing cue, plus items 2 and 3),
   then re-state the row count Desk E is scoping from. (P2-5)

---

RUBRIC (advisory, unratified — `docs/EXEMPLAR_RUBRIC.md`; did not affect the verdict)
Checkpoint A scores the five dimensions answerable from a skeleton.

```
  D1 1 · D2 2 · D8 2 · D9 2 · D10 1                                        = 8/10
  weakest: D1 information gain - every state is load-bearing and none is derivable from its
           predecessor (S5 in particular earns its place on the rim-ring claim S4 structurally
           cannot make), but S1 is thin: its null-result is a number that cannot change, on a
           solid cylinder that cannot deform (evidence: the §3 S1 row, "the numbers HOLD to the
           last digit", with no element on screen that could have moved)
           D10 explore earns its place - two controls is the right number and r_point is a real
           teacher demonstration, but the second control cannot do what the state says it does
           (evidence: rbrApplyParam :50075-50078 -> rbrRestartNow :50053-50064 -> rbrBlanked
           :49896 -> the readout writes an em dash :50243, continuously for the whole drag)
```

This did not change the verdict. The verdict rests on the five P1 findings and their machine evidence,
each of which stands on its own.

---

## HANDOFF

- **Verdict:** `DESIGN_FIX` -> `alex:architect`, cycle 1 of 2.
- **Cycle-2 gate:** the five P1s closed, P2-1 through P2-9 addressed or explicitly declined with a
  reason, and §D landed in `findings_c.md`.
- **Two questions leave the desk** and belong on the founder/office ruling list alongside the
  prerequisites-naming question the desk state file already carries: (1) may a rotmech concept author
  its own camera pose (P1-1); (2) which concept teaches v = ωr (P1-2).
- **Nothing here is a shipping judgment.** Checkpoint A is a design gate; Rule 17 is untouched.
