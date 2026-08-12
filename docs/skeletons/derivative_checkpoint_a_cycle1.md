# CHECKPOINT A — cycle 1 — `derivative_as_limit_of_secant_slope` — VERDICT: `DESIGN_FIX`

> founder_proxy (Opus-pinned, reject-biased), 2026-08-06, desk
> `Physics-mind-mathematics-derivative` @ `994bb8f`.
> **4 × P1 · 6 × P2 · 7 × P3, all routed `alex:architect`.**
> Cycle 2 (the amendment round) was DISPATCHED and terminated on an API session limit
> before doing any work — **no amendment has been applied.** This file is the durable
> record so cycle 2 can resume without re-running the review.
> `mathematics_author` MUST NOT be dispatched until cycle 2 returns `DESIGN_OK`.

## ⚠ CONCEPT ID CORRECTION (orchestrator finding — the proxy did NOT catch this)

**The id must be `derivative_as_secant_limit`, not `derivative_as_limit_of_secant_slope`.**
The registry already reserves it: `src/lib/mathematicsCatalog.ts:94` carries the ghost row
`concept_id: 'derivative_as_secant_limit'`, and TWO other ghosts name it as a prerequisite —
`:102` (`definite_integral_as_area`) and `:156`. Authoring under the longer id would orphan
both edges and create a second ghost for the same concept. The architect's collision check
grepped `src/data/concepts/` (correctly returning 0 hits); the id was reserved in the CATALOG,
which that grep cannot see. **Update everywhere: skeleton header, registration plan, §10f
`computePhysics_*` name, scar SQL `concepts_affected`, and the skeleton FILENAME.** The ghost
also carries `prerequisites: ['graph_transformations']` — reconcile with §8's `prerequisites: []`.
Generalisable lesson worth a scar row: *an id-collision check that scans only the concept
directories cannot see an id the registry has already reserved for a concept that does not
exist yet.*

## What survived the attack — the headline

**The 0d verdict under attack — "ZERO renderer edits, ZERO STOP-flags, engine purchase list
EMPTY" — SURVIVES.** The proxy could not find a single required renderer edit. All four
watchpoint claims are true statements about the code at `994bb8f`, independently re-derived,
and all eight §12 choreography cells reproduce to the digit against a verbatim
re-implementation of `PM_choreoBuildSegments/SampleSegments/Value`. **This closes the standing
`PROGRESS_MATHEMATICS.md` open item ("#2 needs a 0b-level skeleton before its zero-edits claim
is trusted").** The engine-fit work is honest and the probe discipline is real.

**What does not survive is the design that rests on it.** The skeleton verified the MECHANISMS
it named and did not verify the PICTURES those mechanisms produce. Three of the four P1s are
cases where a mechanism works exactly as cited and the resulting frame contradicts the state's
own claim. The "ZERO renderer edits" success test was measured against the feature list, not
against the frames — and the frames are where three P1s live.

## The four watchpoints — independent verdicts

**(a) "undefined at h = 0" callout — CLAIM SUSTAINED, all three mechanisms real.**
`PM_animationGate` @805 (disappear @819, fade_out @820, fade branch @827–831); `drawLabel`
consumes it @1780–1783; `PM_secantLineCompute` → `valid:false` @3704 and `drawSecantLine`
@3786 `if (!computed.valid) return;` — the readout is drawn inside that same function, so it
cannot survive the line; choreographed `h` returns **exactly** 0 at ramp end
(`segT = Math.min(1,…)`; probe: `S4 t=12000 h=0 valid=FALSE`); `PM_interpolate` @1096–1104
`return String(result)` — a conditional string fallback is real.
**But the constraint this verdict creates is over-broad, and it is what strands S5** (P1-2).

**(b) secant↔tangent handover — SUSTAINED for the lines, FAILS for the readouts.**
Both draw functions consume `PM_animationGate` AND `PM_focalEmphasis`; alpha is exactly
`255 * gate.alpha * emph.alphaMul` (@3796 / @3848); no opacity field was assumed into
existence. `focal_sequence` handover at 14 000 ms is expressible.
**The `ASSUMPTION — probe-before-authoring` flag can be CLOSED now, by arithmetic:** at the S5
pin Δslope = 0.0020235, so the maximum chord−tangent separation anywhere in the visible frame
(at x = −2.4) is `0.0020235 × 3.4 = 0.00688` data units = **0.58 px** at 84.545 px/y-unit.
Under one pixel with 2 px strokes, everywhere. The lines WILL read as one line — the flag was
correctly scoped as non-load-bearing and is now stronger than flagged.

**(c) ledger item 7 (`angle_arc` has no `plane_id`) — DECISION RIGHT, REASON WRONG.**
`drawAngleArc` @4026–4151 contains zero `plane`/`PM_planeResolve` references (confirmed).
**Not building the arc is correct on TEACHING grounds** — first principles is taught as
rise ÷ run and as a number in every claimed syllabus; θ is notation Rule 41c does not need.
**But the reason given is an accommodation to a self-inflicted problem:** §⓿c argues a drawn
angle "would measure the SCREEN" *because* x and y pixel scales differ — which is equally true
of the rise/run triangle S2 DOES draw (P1-1). The plane distortion is a choice, not a law of
the concept. Restate the reason as pedagogy, not as a workaround.

**(d) h choreography-only, never a slider — DISPATCH PREMISE CORRECTLY REFUTED.**
`drawCanvasSlider` @4579 verbatim:
`var labelText = (spec.label || spec.variable) + ': ' + Number(val).toFixed(spec.step && spec.step < 1 ? 1 : 0) + pmUnitSuffix;`
An h slider at `step: 0.001` prints `h: 0.0` at every value below 0.05. The refusal is right.
**Do not buy a caption-precision field for this concept** (Rule 40 platform item; record only).
The Q-point substitute is sound at every joint: `PM_stateLiveControlVars` @2983 unions
`plot_point.drag.bind_variable` with `slider.variable`; seize @3163; stand-down @2877/@4961;
per-state clear on true `SET_STATE`; single-touch claim @3159. Gate 9(d) has BOTH FATAL doors
built (`conceptGates.ts` @436 slider, @443 drag-bound, unioned at `seizableVars` @380) and `u`
is seizable nowhere → passes by construction. **ACCEPTED.**
One unmodelled consequence: `PM_planeResolveInverse` does no snapping, so one screen pixel =
**0.00727 data units** — the finest h a teacher can reach is ≈ 0.007 (`slope = 1.0036`), which
is comfortably distinguishable at 4 dp (good) and makes the advertised vanish impossible (P1-4).

## The arithmetic — every number checked

All eight §12 measured cells reproduce exactly (independent node re-implementation, run this
session):

```
S3 segments: ramp 2257.7 [1500→3757.7] · hold 2000 [3757.7→5757.7] · ramp 5242.3 [→11000]
             · hold 2000 [→13000] · ramp 7500 [→20500]      ← §12's 3758/5758/11000/13000 OK
S3 t=14400  hlog=-1.1867  h=0.0651  slope=1.0325   OK      t=20500 h=0.0100 slope=1.0050 OK
S4 t=11990  h=4.444e-4 slope=1.0002 valid=true
   t=12000  h=0 (exact) slope=1.0000 valid=FALSE           OK vanish lands on a known ms
S5 t=13200  h=0.00405 sec=1.0020    t=16000 h=0.00100 sec=1.0005   OK
S6 x0@12000=0.7538  @15000=1.4000 exact     OK
S8 u@14400=1.1200   @16500=1.6000 exact     OK   trace samples = 176 <= 240 OK
S9 xq ping_pong 2500:1.90 6500:1.50 10500:1.10 14500:1.50 18500:1.90 26500:1.10  OK
S1 xdraw@5000=0.0000 @8500=2.1000 exact · x0@13000=-0.1000 @16000=1.0000 exact  OK
```

Closed forms verified algebraically, not just asserted: `m(x₀,h) = (2x₀h + h²)/2h = x₀ + h/2`;
`m − tangent = h/2`; `f′ = x`.

**Precision doctrine at EVERY pinned instant** (not just the floor): S2 `1.5000` (rise 1.500 /
run 1.000) · S3 `1.0325`, dwells `1.2500`/`1.0500`, end `1.0050` · S4 **no readout** (chord
invalid) · S5 pin `1.0020` vs `1.0000` (20 units in last digit), end `1.0005` vs `1.0000`
(5 ULD, the floor) · S7 `1.4000` vs surface `x₀ + h/2` = 1.4 exact · S8 trace head (1.12, 1.12),
marker (1.12, 0.63). **The one instant it could break, checked:** the chord slope crosses into
`1.0000` only when h < 1e−4, i.e. during the final **2.25 ms** of a 9 000 ms ramp — under one
frame at 60 Hz — and S4's claim is *"there is no chord at h = 0"*, not *"it has not arrived"*.
**The doctrine holds at every asserted instant.**

Range containment OK. **The §11 HUD-band proof does NOT hold — see P2-5.**

## P1 — blocking (all four are content fixes; no engine purchase)

**P1-1 · the plane's unequal axis scales make the rise/run triangle contradict its own slope
number.** `equal_scale: false` with viewport 660×372 over x_range 4.8 / y_range 4.4 gives
**137.5 px/x-unit vs 84.545 px/y-unit**. In S2, run = 1.000 unit = **137.5 px**; rise = 1.500
units = **126.8 px**. A student reading the picture computes rise ÷ run ≈ **0.92** while the
label says 1.500 and the readout says `slope = 1.5000` — the definitional state of the whole
concept, off by a factor of 1.63. §11 prints the proving coordinates itself. Beyond S2: every
slope on screen is visually understated by 0.615 — the tangent at P (slope exactly 1) renders
at **31.6°**, not 45°; S6's "repertoire of tilts" is compressed.
**The trade was argued on a number that is wrong by 2×:** `PM_planeBuildTransform` @2079–2087
computes `k = Math.min(viewport.w/dx, viewport.h/dy)` = min(137.5, 84.545) = **84.545 px/unit**
with a 405.8 × 372 centred rect — **not** the "44 px/unit slivers" §11 claims.
*Direction (architect's call):* a 406-px-wide viewport with `equal_scale: true` yields k = 84.545
on both axes, an honest triangle (126.8 px vs 84.5 px = 1.5), slope 1 at 45°, and a free 254-px
instrument column — which also dissolves P1-2 and P2-5. Cost: re-run §11 and the containment
walk. **This is the PRIME-DIRECTIVE call: the frame is 38 % smaller and the mathematics stops
lying.**

**P1-2 · the secant and tangent slope readouts OVERPRINT; the design's own constraint forbids
the only escape.** `drawSecantLine` @3818–3820 draws its readout at
`((rFrom.x+rTo.x)/2 + 10, (rFrom.y+rTo.y)/2 − 12)` — the chord's MIDPOINT, which converges to P
as h → 0. `drawTangentLine` @3856–3858 draws at `(rAt.x + 10, rAt.y − 12)` — P itself. Neither
exposes an offset field; **`plot_point` DOES** (`readout.offset` @3208–3210), so the asymmetry
is invisible unless you read all three. At S5's pin (t = 13 200, h = 0.0040472): secant readout
px **(547.78, 234.92)**, tangent readout px **(547.50, 235.09)** — **0.34 px apart**, 12 px
text, tangent painted after secant (@5249–5260). `slope = 1.0020` and `slope = 1.0000` render as
one illegible double-exposure. If P's `plot_point.readout` uses the default offset it is a THIRD
string on the same pixel. **The state whose entire claim is "the numbers refuse to merge"
renders them merged.** Same collision in S6 (tangent vs P readout) and S9 (Q near P).
*Escape, currently closed by the design's own rule:* §11 callout 2 / §10b forbid ANY label
expression from rendering slope. The stated reason (`x₀ + h/2` → `1.0000` at h = 0) applies
**only to the CHORD slope**; the tangent's `slope_expr = x₀` is defined at every h including 0.
**Narrow the constraint to "no label expression may render the CHORD slope"** — the h = 0 safety
is entirely preserved — and the tangent number becomes a placed `label` with `plane_id` +
`position_expr` riding P at an authored ≥24 px horizontal / ≥14 px vertical separation.
**No engine edit.**

**P1-3 · S4's void carries its entire teaching payload in on-canvas PROSE, and its frozen frame
is S1's frame.** §4 authors ~20-word sentences as canvas `label`s at (537, 180) and (537, 330):
*"Two points became one: no chord, no slope — 0/0 is not a number"* and *"But the values were
heading somewhere: 1.0050, 1.0005, … → 1.0000. That number is the limit — the slope AT the
point"*. **Rule 24** (on-canvas text = labels + equations + derivation steps, never prose) and
**Rule 34a** (prose lives in the strip below). Compounding: S4's focal is P, so
`PM_focalEmphasis` @890 renders both callouts as 0.6α dimmed peers — the state's only content at
60 % opacity. And strip the prose and S4's frozen frame is *a curve, one dot, and `h = 0.000`* —
pixel-equivalent to S1.
*Direction:* **render the numeric ladder the chord left behind** — `1.5000 / 1.2500 / 1.0500 /
1.0050 / 1.0005 / ?` as a stack, each row revealed as the chord passed that value, surviving the
vanish. Values-not-prose (Rule 24 compliant); it IS the definition of a limit made visual; it
makes S4 unmistakably different from S1 sound-off; the sentences move to narration.
**Ruling on the design question: yes, a state whose payoff is absence IS teachable — but only if
the absence is framed by something that stayed.**

**P1-4 · the "teacher re-performs the h = 0 vanish live" claim is FALSE at the engine level.**
The guard is `if (Math.abs(tx - fx) < 1e-12) return out;` (@3704) — exact float coincidence.
`PM_planeResolveInverse` @2110 does no snapping, so xq lands on a pixel grid of
**1/137.5 = 0.00727 data units**. A teacher parking Q on P reaches |h| ≈ 0.007
(`slope = 1.0036`) with the chord fully drawn. **Unreachable by ~10 orders of magnitude.** Two
places rest on it: §⓿a mechanism 2 and §3's S9 row. Left unchanged, narration will name an event
that never happens (scar class `narration_names_a_reference_line_the_scene_never_draws`).
*Claim the true payoff instead, which is better:* what a teacher actually discovers is
**"however close I park it, a chord still exists and the number is still not 1.0000"** — M3's
lesson, delivered by the teacher's own hand.

## P2

- **P2-5 · the "PROVEN ink-free" HUD proof compares against the WRONG EDGE of the band.**
  Band px (330–465, 96–150) ⇒ data x ∈ [−0.5091, 0.4727], data y ∈ [**1.6484**, 2.2871].
  Ink-free requires max chord y < **1.6484** (the bottom); the skeleton compares against **2.3**
  (the top) and concludes "0.6 data-units below the band" — a statement that cannot be true of a
  band whose interior it is comparing to. Recomputed over the same corner product: max chord y =
  **1.6945** at (x₀ = −1.6, xq = 2.0, x = 0.4727) → py **146.1**, i.e. **3.9 px inside the band**.
  Reachable only in one explore corner and it grazes the edge rather than the text — but the
  proof METHOD is wrong and the document calls it "Computed, not eyeballed". (Tangents are
  genuinely clear: max 0.13.)
- **P2-6 · "chord" vs "secant": the answer is NEITHER option the flag offers.** *For "chord":*
  students meet it in Class 9/10 circle geometry, and "secant" collides head-on with
  `sec θ = 1/cos θ` — a real confusion risk, not hypothetical; A-level Pure and the Indian texts
  say "gradient of the chord". *Against:* AP Calculus CED and IB AA say **"secant line"** in the
  examined language, so an AP student never hears their exam's word. **The skeleton already
  solved this exact problem one row above** — §10b dual-labels `slope (gradient)` once then bare,
  per Rule 38d. Refusing the same treatment for the concept's CENTRAL noun is an internal
  inconsistency in its own dialect policy. **Author "chord (secant line)" on first use in S2,
  bare "chord" thereafter.** Keep `secant_line` as the contract name.
- **P2-7 · curriculum tags claim "full" for a board that does not examine the method, leaving the
  ring split with no customer.** §10(i-3) marks all seven rows "full". **Cambridge IGCSE 0606
  does not examine differentiation from first principles** (it begins from standard derivatives);
  **IB DP AA splits** — first principles is AA **HL**, AA SL carries only the informal
  gradient-as-limit idea. The sibling #3 skeleton applies exactly this discipline (0606 →
  *partial*). Two consequences: 38g claims that are probably wrong, and — since every claimed
  board is "full" — **no board ever takes the `no_advanced` cut**, so the advanced ring, both
  preset names and the whole §10(i-1) argument are machinery with zero customers. **Correcting
  the tags GIVES the rings their reason to exist** (0606 and AA SL are precisely that audience).
  If the rings are instead the teacher's own depth control, say so in one line. Keep
  `needs_teacher_verification: true` on all non-CBSE cells (correct as authored); consider
  whether CBSE's `verified: true` is a teacher confirmation or the architect's own reading —
  38g wants the former.
- **P2-8 · the focal plan dims the element each reveal-ordered state is revealing.**
  `PM_focalEmphasis` @890 returns `alphaMul: 0.6` for every non-focal primitive once a state
  declares any focal — including labels, the plane, and the curve. S2's focal is *the chord*,
  which does not appear until 15 000 ms of a 22 000 ms state: for 15 s the run and rise segments
  — the state's actual new things — are dimmed peers. S5 declares `sec → tan @14000`, but **the
  tangent reveals at 1 500 ms** and is the state's new object: it spends 1 500→14 000 ms at 0.6α
  while the focal points at a chord that has not returned. Rule 32e + Rule 29 want the focal to
  TRACK the reveal. **Author `focal_sequence` in both: S2 run → rise → chord; S5 tan → sec → tan.**
- **P2-9 · S1's stated idea is not rendered.** §3 gives S1 *"a curve is steep by different amounts
  at different places"*, but nothing on S1's canvas shows steepness varying — no tangent (first
  drawn S5), no slope readout, only P sliding with a coordinate readout. The delta cue is honest;
  the Teaches line is not, and it is the line `mathematics_author` narrates. Either restate the
  idea to what the canvas shows, or cut the P-slide to a simple arrival (20 s is long for
  apparatus alone).
- **P2-10 · every assessment item lives on f = x²/2; nothing tests transfer.** Six items, one
  function — a student answering all six has demonstrated recall of one worked curve, not the
  method. **Add one transfer item: `f(x) = 3x` from first principles**, where the chord slope is
  **3 for every h** — it tests the method, probes M1 ("does the chord slope always change?"), and
  needs no new number the sim renders. (Items 1–6 are all mathematically correct — 2.0, "approaches
  1 never equals at any h>0", 0/0, tangent-as-limit, −1, x — with no worked-pair reuse.)

## P3

`readout.decimals` is per-primitive per-state (@3685): §10g's blanket 4 dp contradicts §3's S6
numbers (`0.75`, `0.00`), and a 4-dp number churning through a 13 s sweep is poor at-a-glance
instrumentation (Rule 33d) — decide explicitly. · S7's identity `x₀ + h/2` = `1.4000` is
unverifiable on screen: §10b's S7 HUD lists neither x₀ nor h. · S9 hit-test: radius ≈ 20 px
(@3157); whichever `plot_point` is EARLIER in `scene_composition` claims the press (@5265 +
@3159) — **author Q before P** so a teacher can grab Q near P. · S8's revealed `f′(x) = x` ghost:
if it inherits `x_domain [−2.1, 2.1]`, D4's range break (@3037) clips it at y = −1.9 while the
trace spans only [−1.6, 1.6] — author its domain to match the trace. · Assessment item 1 uses
x = 3, outside the drawn window — legitimate transfer, but note it in §10c's interval-honesty
line so nobody "fixes" the range. · S5's title *"The Line the Chords Settle Onto"* — Rule 41d,
the rail truncates and the first words don't carry the meaning. · S9's −0 clamp threshold
(0.0005) is finer than the drag quantum (0.00727) so it never fires and h reads ±0.007, never
`0.000` — harmless; note it so nobody debugs it later.

## `engine_queue` — EMPTY (blocking) · one RIDE-ALONG, record-don't-build

**No `FIX(engine)` finding is blocking; the engine purchase list is genuinely EMPTY.** Each P1
was checked against the PRIME DIRECTIVE for whether an engine fix would give the better sim:
P1-1 the engine already implements `equal_scale` correctly (nothing to buy); P1-2 an engine
`readout.offset` on `secant_line`/`tangent_line` would be marginally cleaner, but the authoring
fix is equally good and the 0d alarm rule forbids per-concept extension — **do not buy**;
P1-3/P1-4 and all P2/P3 are content.

**RIDE-ALONG, record only — `peter_parker:renderer_primitives`:** `plot_point.readout` accepts
`offset: {x,y}` (@3208–3210); `secant_line`/`tangent_line` readouts hardcode `+10, −12` (@3819,
@3857). This asymmetry is the mechanical root of P1-2 and will recur on any concept where two
line readouts converge. **Recommend adding it to
`docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md`'s exclusion ledger as item 8 (record, do not
build)** — same shape as founder-ruled item 7. Not this desk's work.

## Pass-1 ratchet — scar classes checked BY NAME (two recurrences found)

`pcpl_locus_trace_sweep_parameter_exposed_as_a_slider` — **clear** (sole trace on `u`; both FATAL
doors pass by construction). · `archetype_live_tier_unverified_against_renderer` — **clear and
genuinely discharged**. · **label-collision family (`pcpl_vector_label_at_segment_midpoint…`,
`angle_arc_label_collides…`, both FIXED) — RECURRENCE in a NEW primitive family** → this is why
P1-2 is P1 and not P2: the fix landed for `vector`/`angle_arc`; `secant_line`/`tangent_line`
reintroduced the class with hardcoded offsets, and `check_layout_overlap` cannot see them (they
carry no authored position). · `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders`
— **correctly applied** (it deleted S6's premature `f′` surface) but did not catch the GEOMETRIC
analogue: S2's rise/run picture contradicts its own printed identity (P1-1), same class, visual
register. · `state_opens_on_the_degenerate_value…` / `ping_pong_endpoint…` — **clear**. ·
`narration_names_a_reference_line_the_scene_never_draws` — **RECURRENCE RISK twice** → P1-4 (a
vanish that cannot happen) and P2-9 (S1's stated idea never drawn); both would reach narration
unchanged. · `hud_prints_negative_zero…` — clear. ·
`pm_applychoreography_silently_keeps_only_the_last_entry_per_variable` — **clear** (one entry per
variable throughout; the 1e−4 update epsilon @4962 also verified — every ramp moves > 1e−4 per
frame, no stutter). · `pcpl_solver_cannot_register_expression_driven_vector_primitives` — correct
approach (hand-placed labels) but the placement math is wrong in one case (P2-5) and absent in
another (P1-2). · `frozen_pin_unbudgeted_on_a_sequential_misconception_state` — **clear** (S3/S4/S5
pins verified in the correct half with real margins). · `skeleton_discharges_a_ring_cut_with_a_field`
— **clear** (`depth_ring` confirmed a real schema field, `conceptJson.ts` @105). ·
`concept_schema_assessment_minimum` — **clear** (6 vs `.min(6)` @328). · `renderer_pair_panel_b` —
`"none"` authored. · hazard 12 `drawAnnotation` — **clear** (callouts are `label`s; §14 correctly
binds a literal `position` beside every `position_expr`). · anchor row — clear, universal.

## RUBRIC (advisory, unratified — did not affect the verdict)

`D1 2 · D2 2 · D8 2 · D9 1 · D10 2 = 9/10`. Weakest: D9 title-as-teaching-claim — four of eight
guided titles are topic labels, not results ("The Curve and One Point", "A Chord Through Two
Points", "The Second Point Slides Closer", "The Algebra Behind the Number"); the four that DO
state a result are the strongest in the arc ("At h = 0 There Is No Chord", "A Different Point, a
Different Slope"). D1 is thin at S1 for the P2-9 reason.

---

## SCAR CANDIDATES — filed here as a FILE, NOT YET APPLIED to `engine_bug_queue`

> Standing lesson (Ch.6 session, 2026-08-02): rows that exist only in an agent report are one
> session-end from being lost. Persisted here deliberately. **Applying them to the DB is a
> separate follow-up step.** `bug_class` values checked against the live queue and every
> `scar_candidates*.sql` on this desk: no collisions.
> **NOTE:** `concepts_affected` below still carries the OLD id — update to
> `derivative_as_secant_limit` before applying.

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES

('plane_unequal_axis_scales_render_a_rise_run_triangle_that_contradicts_its_own_slope_readout',
 'A cartesian_plane with equal_scale:false draws the rise/run triangle in a pixel ratio that contradicts the slope number printed beside it',
 'MAJOR', 'alex:architect',
 'viewport w/dx and h/dy differ (660/4.8=137.5 vs 372/4.4=84.5), so a 1.5 rise over a 1.0 run renders 126.8 px over 137.5 px — a visual ratio of 0.92 against a printed 1.5000',
 'Any state that DRAWS a slope as a rise/run triangle, an angle, or a visually-compared tilt must run on a plane whose scaleX equals scaleY (equal_scale:true, or ranges whose aspect matches the viewport). If the plane is deliberately unequal, no state may draw slope geometrically — number and rise/run labels only. State the choice and its consequence in the skeleton layout section.',
 'js_eval',
 'For every state authoring a vector/segment pair labelled as rise and run: compute scaleX=viewport.w/(x_range.max-x_range.min), scaleY=viewport.h/(y_range.max-y_range.min); assert abs(scaleX-scaleY)/max(scaleX,scaleY) < 0.02 OR that no secant_line/tangent_line readout is co-present.',
 'OPEN', ARRAY['derivative_as_secant_limit']::text[], ARRAY[]::text[],
 'founder_proxy Checkpoint A, derivative concept, 2026-08-06', 'incident'),

('two_primitive_owned_readouts_converge_on_one_anchor_and_overprint',
 'secant_line and tangent_line readouts have hardcoded +10/-12 offsets from anchors that coincide as h to 0, so the two slope numbers overprint at the exact instant the state compares them',
 'MAJOR', 'alex:architect',
 'drawSecantLine draws its readout at the chord MIDPOINT +10/-12 and drawTangentLine at the tangency point +10/-12; neither exposes readout.offset (plot_point does). At h=0.004 the two land 0.34 px apart.',
 'When a design compares two numbers that belong to converging geometry, at least one of them must be rendered by a primitive whose readout position is AUTHORABLE (label + plane_id + position_expr, or plot_point.readout.offset). Compute both readout pixel positions at the pinned instant in the skeleton layout section; a separation under 24 px is a defect, not a note.',
 'js_eval',
 'At each state pin, evaluate every secant_line/tangent_line/plot_point readout anchor through the plane transform, add the primitive default offset, and assert pairwise |dx|>24 or |dy|>14 between any two non-empty readout strings.',
 'OPEN', ARRAY['derivative_as_secant_limit']::text[], ARRAY[]::text[],
 'founder_proxy Checkpoint A, derivative concept, 2026-08-06', 'incident'),

('skeleton_promises_a_teacher_reachable_degenerate_state_the_engine_guards_at_float_epsilon',
 'An explore payoff (park Q on P and the chord vanishes) is unreachable because the guard is |dx|<1e-12 while the drag quantum is one pixel of data',
 'MAJOR', 'alex:architect',
 'PM_secantLineCompute guards the vertical/degenerate chord at 1e-12; PM_planeResolveInverse maps mouse pixels to data with no snapping, so the finest reachable |xq-x0| is 1/scaleX (0.00727 data units here) — ten orders of magnitude away',
 'Before a skeleton claims a teacher can reproduce a degenerate/limiting event by dragging, compare the engine guard threshold against 1/scaleX (or 1/scaleY) for the authored plane. If the guard is finer than the drag quantum, the event is choreography-only — say so, and author the explore narration around what a teacher CAN reach.',
 'js_eval',
 'For each drag-bound variable, compute quantum = (range.max-range.min)/viewport_px_extent; for every guard threshold the design relies on, assert threshold > quantum before allowing the skeleton to claim teacher reachability.',
 'OPEN', ARRAY['derivative_as_secant_limit']::text[], ARRAY[]::text[],
 'founder_proxy Checkpoint A, derivative concept, 2026-08-06', 'incident'),

('state_whose_payoff_is_absence_carries_its_lesson_only_in_on_canvas_prose',
 'A deliberate-void state removes its geometry and replaces it with prose callouts, violating Rule 24/34a and leaving a frozen frame identical to an earlier state',
 'MAJOR', 'alex:architect',
 'when the taught event is a disappearance, the only remaining content is text; the skeleton authored two ~20-word sentences as canvas labels and the state frozen-pins to curve+dot+text, pixel-equivalent to the apparatus state',
 'A state whose payoff is the ABSENCE of an element must leave a non-text visual residue that no earlier state shows — a numeric ladder of the values the vanished element printed, a marked empty corridor, or a persisted trace. On-canvas text stays labels/equations/values only (Rule 24); the sentence goes to narration. Diff the state frozen frame against every earlier state frozen frame at design time.',
 'manual',
 'Read the skeleton state block: list every element visible at the frozen pin; if that list is a subset of an earlier state list plus text-only primitives, the state fails.',
 'OPEN', ARRAY['derivative_as_secant_limit']::text[], ARRAY[]::text[],
 'founder_proxy Checkpoint A, derivative concept, 2026-08-06', 'incident'),

('hud_ink_free_proof_compares_against_the_far_edge_of_the_reserved_band',
 'A computed "HUD band is ink-free" proof compared the max curve/chord height against the band TOP instead of its BOTTOM, passing a case that enters the band',
 'MODERATE', 'alex:architect',
 'the band spans py 96-150 = data y 1.6484 (bottom) to 2.2871 (top); the proof tested max y = 1.688 < 2.3 (the top) and concluded clearance, when the binding edge is 1.6484',
 'An ink-free proof for a reserved rectangle must name BOTH data-space edges of the rectangle and test against the one the ink approaches. Write the criterion as an inequality against the named edge value, never against the far edge.',
 'js_eval',
 'For each reserved overlay rect, convert its four px corners to data via the plane transform, then maximise every authored curve/line expression over the rect x-window across the full control product and assert the max is below the rect BOTTOM data-y (or above its top).',
 'OPEN', ARRAY['derivative_as_secant_limit']::text[], ARRAY[]::text[],
 'founder_proxy Checkpoint A, derivative concept, 2026-08-06', 'incident'),

('focal_declaration_dims_the_very_element_the_state_is_revealing',
 'A state declares a static focal on an element that appears late, so every earlier reveal renders as a 0.6-alpha dimmed peer during its own reveal beat',
 'MODERATE', 'alex:architect',
 'PM_focalEmphasis dims every non-focal primitive to alphaMul 0.6 once any focal is declared, including labels and axes; a focal naming a late-arriving element dims the whole reveal chain before it',
 'In a reveal-ordered state, the focal must TRACK the reveal: author focal_sequence with one window per revealed element, in reveal order. A static focal_primitive_id is only correct when its target is present from t=0.',
 'js_eval',
 'For each state, compare every primitive appear_at_ms against the focal window covering that instant; flag any primitive whose appear_at_ms falls inside a focal window naming a different primitive whose own appear_at_ms is later.',
 'OPEN', ARRAY['derivative_as_secant_limit']::text[], ARRAY[]::text[],
 'founder_proxy Checkpoint A, derivative concept, 2026-08-06', 'incident'),

('curriculum_tag_claims_full_for_a_board_that_does_not_examine_the_method_leaving_the_ring_split_with_no_customer',
 'Every curriculum row tagged full, so no preset ever takes the no_advanced cut and the depth-ring machinery has zero audience',
 'MODERATE', 'alex:architect',
 'tags authored by concept-topic match rather than by method: IGCSE 0606 does not examine differentiation from first principles and IB AA splits SL/HL, yet both are tagged full',
 'Tag by the METHOD the concept teaches, not the topic heading, and split a board by tier where the syllabus does. Then check the ring split has at least one real customer: if every tagged curriculum is full, either name the non-board reason the rings exist (teacher depth control, class level) or the ring assignment is decorative.',
 'manual',
 'Read curriculum_tags: assert at least one row is partial/absent for the ring the design marks advanced; assert every non-verified row carries needs_teacher_verification true.',
 'OPEN', ARRAY['derivative_as_secant_limit']::text[], ARRAY[]::text[],
 'founder_proxy Checkpoint A, derivative concept, 2026-08-06', 'incident');
```

## One more scar candidate — the orchestrator's id finding (not in the proxy's set)

```sql
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
('id_collision_check_scans_the_concept_directories_but_not_the_registry_that_reserved_the_id',
 'An architect id-collision grep over src/data/concepts/ returns zero hits for an id the catalog has already reserved for that same concept, so the desk authors under a second, orphaning id',
 'MAJOR', 'alex:architect',
 'the mathematics catalog carries roadmap GHOST rows naming each ranked concept id before any JSON exists (mathematicsCatalog.ts). A grep of the concept directories cannot see them, and two other ghosts named the reserved id as their prerequisite — authoring under a new id would have orphaned both edges.',
 'The id-collision check for a NEW concept must cover the registry that reserves ids as well as the directories that hold them: grep the subject catalog for the concept by NAME and by ranked-list position, not only the id string, and adopt the reserved id when one exists. Also grep for inbound prerequisite references before renaming anything.',
 'js_eval',
 'Before authoring, assert the proposed concept_id appears in the subject catalog ghost list, OR that no ghost row matches the concept by name/ranked position; independently list every ghost naming the proposed id as a prerequisite.',
 'OPEN', ARRAY['derivative_as_secant_limit']::text[], ARRAY[]::text[],
 'orchestrator, mathematics two-desk session, 2026-08-06', 'directive');
```
