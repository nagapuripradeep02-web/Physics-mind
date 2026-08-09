# CHECKPOINT A — cycle 1 — `graph_transformations` — VERDICT: `DESIGN_FIX`

> founder_proxy (Opus-pinned, reject-biased), 2026-08-06, desk
> `Physics-mind-mathematics-graph-transformations` @ `994bb8f`.
> **3 × P1 · 9 × P2 · 7 × P3, all routed `alex:architect`.**
> Cycle 2 (the amendment round) was DISPATCHED and terminated on an API session
> limit before doing any work — **no amendment has been applied.** This file is the
> durable record so cycle 2 can resume without re-running the review.
> `mathematics_author` MUST NOT be dispatched until cycle 2 returns `DESIGN_OK`.

## What survived the attack

The proxy's own assessment: *"the best-evidenced architect document I have reviewed on
this desk."* It independently re-derived all 14 §12 choreography boundaries and every one
matched; every renderer citation resolves by symbol at `994bb8f`; `check:cartesian-plane`
passes on this desk; the parent-function degeneracy audit is endorsed as real reasoning.

**The probe claim is ~89% sound.** The `cartesian_plane` family genuinely paints and drives:
`k` translates vertically, `h` moves P′ right, `b` moves it to π/4, `a=−2` puts it below the
axis, zero console/page errors. Frame constants reconcile exactly (y=0 at px 264,
46.5 px/y-unit, 50.769 px/x-unit). Eight of nine §⓿ rows check out to sub-pixel.

**The orchestrator's dispatch framing was REFUTED and the refutation accepted:** synthetic
probing is the CORRECT method at Checkpoint A (no concept JSON exists yet), so the
measured-px tier survives. The real axis of degradation is *which `concept_id` the probe
ran under* — see P2-8, which is the sharper gate.

## P1 — blocking

**P1-1 · S7 renders a false equation on a mathematics canvas.**
§4/§12 fix the chip chain as `x: 1.57 ÷ 2 = 0.79`. **1.57 ÷ 2 = 0.785.** The first chip is a
literally false displayed equation, in the `derivation_first_principles` state whose claim is
"computed one operation at a time", and it contradicts §11(c)'s own "every surface identity
holds on the rendered numbers". Chips 2–4 are true; final `P′ = (1.79, 2.50)` is a correct
2-dp rendering of π/4 + 1 = 1.7854.
**Fix (teaching value, not cheapness): render the first hop SYMBOLICALLY —
`x: π/2 ÷ 2 = π/4 ≈ 0.79`.** Exact; teaches divide-by-b as an exact operation; removes the
rounding discontinuity. `≈` alone or 4-dp are inferior fallbacks.

**P1-2 · the PRIMARY AHA state's build order contradicts the law it exists to teach.**
§4's S6 row says the chip *"outside — acts on y, reads directly"* appears at 5500
*"after the two outside moves"* — but at 5500 only k has moved (a is 12000–15000). The
description contradicts its own sub-beat list. Deeper: the order **k(out) → h(in) → a(out) →
b(in)** matches neither the formula's reading order (b, h, a, k — which S7 correctly uses)
nor the outside/inside grouping the state is named after. Each half of the law is asserted
from ONE example; the two confirming examples arrive after their chips, unlabelled; the
alternation fights the generalisation.
**Fix, free (still four `once` ramps, one per variable — the one-entry-per-variable scar is
untouched): k → a → chip "outside — acts on y" → h → b → chip "inside — acts on x".**
Two examples land before each claim; the chip text becomes true; the rhythm becomes two
grouped pairs. This also answers the D1 rubric note (S6's picture is currently 100 %
derivable from S2–S5 — regrouping gives it a picture its predecessors never showed).

**P1-3 · `f` is in the concept's NAME and its assessment, and on no surface anywhere.**
§1, §2 and §11(b) all assert generality is carried by f-notation on S7. §11(h) then lists S7's
one permitted surface as `(x₀, y₀) → (x₀/b + h, a·y₀ + k)` — **which contains no `f`**, and
Rule 34b leaves no second surface. Two checkable consequences:
1. The concept name is `Graph Transformations — a·f(b(x−h))+k`, reader-facing in EVERY
   preset, and `f` is never defined on any canvas — **Rule 25 breaks in the FULL preset**, not
   only a reduced one.
2. **Assessment item 5** (`y = f(x)` moved 3 right and 1 up) maps to core S6 and is NOT
   ring-tagged, so it survives the advanced cut into a preset where S7 is hidden and no
   surviving state ever shows `f`.
§11(i-1) says the cut was *"checked once over four checklists"* (narration, captions,
surfaces, controls) and concluded COHERENT. **The assessment was not among them, and the
assessment is where the break is — that verdict is false as written.**
**Fix BOTH:** put `f` on S7's surface (e.g. `f(x) → a·f(b(x − h)) + k` above the coordinate
mapping, still one surface), AND ring-tag item 5 `advanced` or re-word it in the sine instance.

## P2

- **P2-8 (most dangerous) · `computePhysics_graph_transformations` is a hard blocker with a
  SILENT failure mode.** `parametric_renderer.ts` @5105:
  `if (!PM_physics) { text('Unknown concept: ' + concept_id, 380, 250); return; }` — the
  **entire draw loop is skipped**: no plane, no curves, no point. Run under
  `concept_id: 'graph_transformations'` it yields a blank canvas with red text and **zero
  console errors, zero page errors**. §11(f) names the deliverable (hence P2, not P1) — but
  §13 dispositions the governing scar as *"N/A-by-id"*. **It is not N/A; it is directly
  applicable and pre-empted.** Re-word as BINDING with the evidence attached: THE EYE will
  photograph a blank frame and report a clean run. Also record in §⓿'s tier table WHICH
  `concept_id` the probe ran under.
- **P2-1 · one §⓿ row does not reproduce, and the pattern is diagnostic.** The row
  `a=−2 : point cy 350 → data y −2 ✓` fails against the block's own constants (y=0 at px 264,
  46.5 px/y-unit ⇒ data y = −2 is px **357**; measured 357.0; `cy 350` is data y = −1.849).
  **It is the ONLY row with no stated prediction and the only one that does not reconcile** —
  the row without a prediction is the row nobody compared to anything. Re-probe or delete.
  Also state that `{70,78,660,372}` / x[−6.5,6.5] / y[−4,4] are the renderer's hardcoded
  DEFAULTS (@2078–2080), so the probe tested the default frame, not an authored one.
- **P2-2 · designed dwell values sit off the display grid.** S2's cell states caption `k: 0.8`
  AND readout `(1.57, 1.75)` together. The hold is k = 0.75; `(0.75).toFixed(1)` = `"0.8"`
  while the 2-dp readout prints 1.75 — a teacher reads 0.8 and expects 1.80. Same at the §12
  pin (k = 0.9125 → `0.9` vs `1.91`). S4's a = −1 and S5's b = 2 are clean; S2 is the outlier.
  The 1-dp caption is hardcoded @4580, so **the authored values must land on the grid**: move
  S2's hold to k = 1.0 and the pin to a grid value.
- **P2-3 · S5's width bracket has no declared geometry and LEAVES THE FRAME at the slider
  minimum.** Only "a `vector` width-bracket under one period" is specified — no `from`/`to`.
  §4's containment computes **y only**; no x-containment for any primitive. At b = 0.5 (S5's
  own minimum) the bracket is 2π/0.5 = **12.57 data units** against a 13-unit frame, and
  `drawVector` performs no viewport clipping — rendered, it runs off the canvas with its label
  stranded. A Gate-0 "zero TBDs" gap: containment was never computed because the geometry was
  never specified. **Fix: declare the endpoints as expressions AND raise S5's b-slider min to
  1.0** (S5 teaches squeezing; b < 1 is not its content — keep [0.5, 3] on S8, which draws no
  bracket).
- **P2-4 · negative-b deferral has no destination, and four curriculum tags claim coverage the
  design knowingly omits.** The deferral REASONING is endorsed, with a sharper reason than the
  skeleton's: sin is odd, so `sin(−bx) = −sin(bx)` makes y-axis reflection visually identical
  to x-axis reflection, reintroducing the exact a↔b ambiguity the parent was chosen to avoid.
  **Keep the deferral.** But IB DP AA, AP Precalculus, Cambridge 0606 and A-level Pure are
  tagged `full`, and every one names reflection in the y-axis (`y = f(−x)`) as required. A
  `full` claim known to be false is what Rule 38g exists to prevent;
  `needs_teacher_verification: true` does not launder it. Downgrade to `partial` with the
  omission named, and name a destination concept — `MATHEMATICS_DISCUSSIONS.md` §6 names no
  successor, so "deferred" currently means "dropped". **CBSE's `verified: true` rests on a
  chapter index — a chapter index is not a teacher**; it should carry the flag too.
- **P2-5 · S3's declared `visual_counter` does not exist in S3's own timeline.** §5 M1 says the
  counter is *"the guess curve beside the real curve's rightward motion"*. Per §12 the guess is
  gone by 7300 ms; the real ramp starts at 6800 and at 7300 has reached h = 0.11 — still
  essentially coincident with the ghost. They are never side by side, and the pinned frame at
  12000 says *"guess ABSENT"*. The sequential 16a beat is compliant; the declared counter is
  not real. **Take the retime, not the reword** (PRIME DIRECTIVE): extend `disappear_at_ms` to
  ≈11000 so the frozen wrong curve sits beside the real one travelling the other way. One
  number; strongest version of the most-documented misconception on this topic. Rule 32b is
  safe — the held guess is static, only h moves.
- **P2-6 · pacing monotony across S2–S5.** All three sweeps use an identical envelope (start
  1500, dur 12000, one hold, end 15.5–16.0 s) — ~78 s of one tempo. Shapes differ, so not an
  archetype violation, but no rhythm claim names a tempo (the sibling bar does).
  **The cited engine constraint does not bind:** `PM_choreoBuildSegments` @1158–1186 iterates a
  hold LIST, so multiple checkpoints in one entry are supported inside the one-entry-per-
  variable scar. Stepping S5 (holds at b = 1.5, 2, 2.5, 3) gives a distinct rhythm AND makes
  2π/b countable — teaching gain, zero engine cost.
- **P2-7 · three delta cues assert a value the canvas contradicts for most of the state.**
  `k = +1.5: straight up` is true only at 15.5 s of 18; `a = −2: flipped, doubled` only at
  15.5 s of 20; `b = 2: half the width` only during the 7.5–10 s hold. Rule 32c wants the
  ACTION, true throughout: "k slides it up", "a flips and doubles it", "b halves the width".
  Also better under Rule 41. This is the one real weakness riding on the coincident-open
  design (otherwise upheld) — fix the cues and it is fully clean.
- **P2-9 · Rule 41 register on the two strings carrying the PRIMARY AHA.** The S6 chips read
  `outside — acts on y, reads directly` / `inside — acts on x, reads backwards`.
  **"Reads backwards" is idiomatic** ("is interpreted as"), not literal — a Class-11 ESL
  student parses "the number reads backwards" as the number doing the reading. The concept's
  single most important sentence is the one that fails 41c. Suggested:
  `outside — acts on y, same direction` / `inside — acts on x, opposite direction`.
  S8's cue **`Four numbers, your hands`** is a verbless fragment in the register Rule 41a bans
  by name ("All yours") — suggest `All four sliders live`. Every state TITLE passes cleanly.

## Rulings requested — all in the skeleton's favour

- **Parent function (sin, fixed, no explore switch): SOUND, endorsed.** Every degeneracy
  identity verified. Declining the explore switch is right (dilution + Rule 38b).
  **But one supporting argument is REFUTED:** the claim that a parabola *"exits the frame
  across most of the control product (only D4 breaks would save it — a mostly-off-screen
  sandbox)"* is false. D4 breaks are shipped and working (@3033–3038, negative control fires),
  and a parabola clipped at y = 4 showing |x| ≤ 2 of its arms **is the standard textbook
  picture**. The decline stands on the dilution argument alone — drop the false one.
- **Coincident-open pose: GENUINE, not a rationalisation.** The scar targets states whose
  taught identity COLLAPSES at the opening value; here each state's claim is "this number moves
  the copy OFF the parent", so the coincident frame is the BEFORE half. The distinction is
  correctly made. (S8's ping_pong parking on identity every 8 s is a weaker version — suggest
  k 0.5↔1.5.)
- **S6 zero controls: CORRECT** — 31c(ii) is explicit that "no slider ≠ static", and the engine
  now enforces PARAM_UPDATE scoping (@2983 / @5482) so a timed build cannot be desynchronised
  by a stray drag. The finding is the build ORDER, not the controls.
- **S3's guess-ghost: Rule 16a COMPLIANT** — wrong picture drawn first, named, removed, then
  the real motion; no predict-pause. The defect is only the declared counter (P2-5).
- **8 states: CORRECT** — no idle state; both refused merges (S4→S2, S6→S7) correctly refused;
  degrades to 7 coherent under `core_only`.

## P3

Focal dimming compounds on the ghost: `PM_focalEmphasis` @891 (0.6) × ghost style @3079 (0.35)
= **0.21 alpha** in S2/S3/S5/S6 — rendered and still legible, so not a defect, but the ghost is
the reference against which every delta is read and 0.21 is marginal on a washed-out projector
(note for json_author: brighter ghost hex or `stroke_weight: 4`). · The y-axis tick-label column
runs down the MIDDLE of the plot (x_range straddles 0; @2254–2261) where the curve and P′ live —
not considered under Rule 34d; check the S2/S6 frames. · **§1 cites the sibling id as
`derivative_as_limit_of_secant_slope`; the catalog id is `derivative_as_secant_limit`**
(`mathematicsCatalog.ts:94`, two other ghosts name it as a prerequisite) — independently
confirmed by the orchestrator. · "Parent curve" is dialect, not plain-words-exempt — 38d wants
dual-label once in S1. · `P′` as "the moving copy's peak" is wrong at a < 0 (S4's endpoint) where
it is the minimum — bind mathematics_author not to narrate "the peak" in S4. · The self-review
claims "8 distinct archetypes" — it is 7 plus a declared contrast pair (correct and permitted);
separately `densify/rarefy`, `reveal-build` and `cycle-compare` are ALREADY in Rule 31b's
ratified seed vocabulary (`CLAUDE_RULES.md` line 53), so the "dialect coin, justified" note is
unnecessary — though `cycle-compare` is a poor NAME for a wrong-then-right sequence, since
nothing cycles. · **Rule 35 anchor, for the architect's judgment:** the phone-voice-recording
anchor OVER-CLAIMS — a recorder draws a speech oscillogram or amplitude envelope, not "this same
wave", so "the drawn trace IS a transformed sinusoid family" is not true of speech. A pure-tone /
tuning app is equally universal, exactly a sinusoid, and supports the S4/S5 reinforcement
("louder = taller, higher-pitched = narrower") precisely rather than loosely.

## RUBRIC (advisory, unratified — did not affect the verdict)

`D1 1 · D2 1 · D8 2 · D9 1 · D10 2 = 7/10`. Weakest: D1 information gain — S6's PICTURE is fully
derivable from S2–S5 (its new content is verbal, not visual); regrouping the build (P1-2) would
lift it. D2 arc grammar — the order is defensible (alternating so the misconception lands early
at S3) but the PRIMARY aha sits at state 6 of 8. D9 — 6 of 8 titles state a result; "The Parent
Curve" and "Where One Point Lands" are topic labels.

---

## SCAR CANDIDATES — filed here as a FILE, NOT YET APPLIED to `engine_bug_queue`

> Standing lesson (Ch.6 session, 2026-08-02): rows that exist only in an agent report are one
> session-end from being lost. These are persisted here deliberately. **Applying them to the DB
> is a separate follow-up step** — the dispatching session applies; founder_proxy never does.
> `bug_class` values were checked against the live queue and against every `scar_candidates*.sql`
> on this desk: no collisions.

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('skeleton_measurement_row_without_a_stated_prediction_is_the_unchecked_row',
 'The one probe row carrying a bare check mark and no parenthetical prediction is the one that does not reconcile with the block''s own frame constants',
 'MAJOR', 'alex:architect',
 'graph_transformations §0 reported "a=-2 : point cy 350 -> data y -2 OK". The same block states y=0 at px 264 and 46.5 px/y-unit, which puts data y=-2 at px 357; 350 is data y=-1.849. Every other row carried "(predicted X)" and every one of those reconciled.',
 'Every measured row in a skeleton probe block MUST carry its independently-computed prediction alongside the measurement, in the same row. A bare measurement with a check mark is not evidence — it is a number nobody compared to anything. Reviewers: audit the rows WITHOUT predictions first.',
 'js_eval',
 'For each px measurement in a skeleton section-0 block, recompute the predicted px from the block''s own declared viewport/range constants and assert |measured - predicted| <= strokeWeight/2 + 1.5.',
 'OPEN', ARRAY['graph_transformations']::text[], ARRAY[]::text[], 'founder_proxy checkpoint A graph_transformations 2026-08-06', 'incident'),

('rendered_equation_chip_states_a_rounded_intermediate_as_an_exact_equality',
 'A derivation chip prints "1.57 / 2 = 0.79" — literally false arithmetic on a mathematics canvas',
 'CRITICAL', 'alex:architect',
 'graph_transformations S7 fixes the chip chain at 2 dp. 1.57/2 = 0.785, displayed 0.79. The chain is self-consistent at 2 dp but the FIRST chip is a false equation, in the state whose whole claim is exact operation-by-operation arithmetic. Physics tolerates sig-fig rounding; mathematics does not.',
 'Any on-canvas string of the form "A <op> B = C" in a mathematics concept must be EXACT at the rendered precision, or must use the exact symbolic value (pi/2 / 2 = pi/4), or must print an approximately-equal sign. Verify every authored arithmetic chip by evaluating the literal displayed operands.',
 'js_eval',
 'Regex every label/annotation/chip string for "<num> <op> <num> = <num>"; evaluate the LHS from the literal displayed operands and assert exact equality with the displayed RHS at the displayed precision; fail unless the string contains an approximately-equal glyph.',
 'OPEN', ARRAY['graph_transformations']::text[], ARRAY[]::text[], 'founder_proxy checkpoint A graph_transformations 2026-08-06', 'incident'),

('ring_cut_coherence_checked_over_surfaces_but_not_over_the_assessment_items',
 'The Rule 38a coherent-when-cut check omitted assessment items, so an untagged item survives the advanced cut using notation only the cut state defined',
 'MAJOR', 'alex:architect',
 'graph_transformations section 11(i-1) checked narration, captions, surfaces and controls and concluded COHERENT. Assessment item 5 uses f-notation, maps to core S6, is not ring-tagged, and survives the cut that hides the only state where f is claimed to be defined — and section 11(h) shows f appears on no surface at all, so the break is present in the FULL preset too, including the concept NAME.',
 'The Rule 38a cut check has FIVE checklists, not four: narration, on-canvas captions, formula surfaces, controls, AND assessment items + the concept name. Every assessment item must be ring-tagged at or above the ring of the state that defines every symbol it uses. Any symbol appearing in the concept NAME must be defined on a CORE-ring surface, because the name is visible under every preset.',
 'js_eval',
 'For each assessment item, extract identifiers/notation; map each to the state that defines it; assert item.depth_ring >= max(defining state rings). Separately assert every symbol in concept_name is defined on a state with depth_ring = core.',
 'OPEN', ARRAY['graph_transformations']::text[], ARRAY[]::text[], 'founder_proxy checkpoint A graph_transformations 2026-08-06', 'incident'),

('choreography_hold_value_off_the_slider_caption_grid_contradicts_the_coordinate_readout',
 'A designed dwell at a value whose 1-dp slider caption disagrees with the 2-dp coordinate readout puts two contradictory numbers on screen at the exact frame a teacher pauses on',
 'MAJOR', 'alex:architect',
 'graph_transformations S2 holds k at 0.75. The slider caption is hardcoded toFixed(step<1?1:0) (parametric_renderer.ts @4580) so it prints "0.8"; plot_point.readout.decimals:2 prints P-prime y = 1.75. Teacher reads 1 + 0.8 and expects 1.80. The mismatch is guaranteed at every hold/pin whose 1-dp rounding is not exact.',
 'Every choreography hold value and every eye_capture_ms pin value must be chosen so the 1-dp slider caption and the 2-dp coordinate/HUD readout are EXACTLY consistent — i.e. the value must be exact at 1 dp. Pins and holds land on the display grid, never mid-step.',
 'js_eval',
 'For each variable_choreography holds[].at_value and each eye_capture_ms, compute v.toFixed(1) and assert Number(v.toFixed(1)) === v; then assert every dependent readout expression evaluated at v equals its expression evaluated at Number(v.toFixed(1)) to the readout precision.',
 'OPEN', ARRAY['graph_transformations']::text[], ARRAY[]::text[], 'founder_proxy checkpoint A graph_transformations 2026-08-06', 'incident'),

('plane_id_vector_has_no_viewport_clipping_so_an_expression_driven_bracket_leaves_the_frame',
 'A vector authored in plane data coordinates is drawn unclipped: at the slider extreme the bracket runs off the plot area and off the canvas',
 'MAJOR', 'alex:architect',
 'graph_transformations S5 authors a width bracket "under one period" with no declared endpoints. At the S5 b-slider minimum 0.5 the period is 2pi/0.5 = 12.57 data units against a 13-unit frame; drawVector plane-resolves both endpoints (@2716/@2748) and performs no viewport clamp. Reproduced: the bracket exits the right edge with its label stranded. The skeleton computed y-containment for the curve only and no x-containment for any primitive.',
 'A skeleton''s containment computation must cover EVERY authored primitive over the FULL slider cross-product, in BOTH axes — not just the function_plot in y. Any primitive whose extent is an expression of a live control needs its endpoints declared as expressions in the skeleton and its extremes checked, or the control range narrowed on that state. function_plot has D4 break-on-range-exit; vector/label/plot_point have no such protection.',
 'js_eval',
 'For every primitive with plane_id, evaluate its from/to/x/y expressions over the cross-product of that state''s live control ranges and assert every resolved point lies inside the plane viewport.',
 'OPEN', ARRAY['graph_transformations']::text[], ARRAY[]::text[], 'founder_proxy checkpoint A graph_transformations 2026-08-06', 'incident'),

('parametric_unregistered_concept_id_blanks_the_entire_scene_with_zero_console_errors',
 'parametric_renderer returns from draw() before any primitive when computePhysics has no entry for the concept_id — a blank canvas that passes every error probe',
 'MAJOR', 'peter_parker:renderer_primitives',
 'parametric_renderer.ts @5105: if (!PM_physics) { text("Unknown concept: "+concept_id); return; }. Reproduced with concept_id graph_transformations: no plane, no curves, no point, ZERO console errors and ZERO pageerrors. A skeleton probe run under a DIFFERENT (registered) id therefore cannot detect it, and THE EYE photographs a blank frame while reporting a clean run.',
 'A skeleton certifying a PCPL/parametric concept by browser probe MUST run the probe under the concept''s OWN concept_id, or explicitly record which id it substituted and why. The ENGINES + inline-dispatcher registration is a BINDING deliverable for every new parametric concept, never dispositioned N/A. Renderer side: the blank-scene branch should emit console.error so it is not silent.',
 'js_eval',
 'After SIM_READY, assert window.PM_physics is truthy AND assert the canvas contains no pixel matching the error red #EF4444 at (380,250); independently assert non-background pixel count inside the declared plane viewport exceeds 500.',
 'OPEN', ARRAY['graph_transformations']::text[], ARRAY[]::text[], 'founder_proxy checkpoint A graph_transformations 2026-08-06', 'incident'),

('primary_aha_state_sequences_its_examples_against_the_generalisation_it_names',
 'The aha state asserts a two-branch rule but lands one example per branch before each claim, with the two confirming examples arriving afterwards unlabelled',
 'MAJOR', 'alex:architect',
 'graph_transformations S6 builds k (outside) -> h (inside) -> a (outside) -> b (inside) and fires "outside acts on y" at 5500 ms, after k alone; the skeleton''s own prose says "after the two outside moves". The alternating order matches neither the formula reading order (which S7 correctly uses) nor the outside/inside grouping the state exists to teach.',
 'A state that names a rule with N branches must land ALL of that branch''s examples BEFORE the branch''s claim appears. Group the build by the partition the rule asserts, never by formula order or by convenience. Cross-check every chip''s text against the sub-beat list that precedes its reveal time.',
 'js_eval',
 'For each label whose text asserts a grouping, assert every choreography entry belonging to that group has completed (start_ms + duration_ms + holds) before the label''s appear_at_ms.',
 'OPEN', ARRAY['graph_transformations']::text[], ARRAY[]::text[], 'founder_proxy checkpoint A graph_transformations 2026-08-06', 'incident');
```

## Evidence images (scratchpad — session-scoped, may not survive)

- `shot_STATE_1.png` — the silent blank screen under this concept's own `concept_id`, zero
  console errors. **Look at this first** (P2-8).
- `g_C.png` — the S5 width bracket at b = 0.5 running off the frame; also shows the interior
  y-tick-label column (P2-3, P3).
- `g_B.png` — the S2 picture as designed (focal on the transform, k = 1.5). Assessed as
  *"genuinely good"* — the bright copy lifted a readable gap above the dim parent, gridlines
  carrying the measurement. Also shows the ghost at its dimmest (0.21 alpha).

Base path: `/private/tmp/claude-501/-Users-karthikyerragadda-Desktop-Viditra-Physics-mind/eae70c75-0f66-40ce-bc85-ebad501a15cf/scratchpad/`
