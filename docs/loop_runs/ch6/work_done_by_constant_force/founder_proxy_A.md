# Checkpoint A report — `work_done_by_constant_force`

> founder-proxy, 2026-08-01. Report-only (the agent wrote no repo files; persisted here by the
> dispatching session). Concept #1 of Ch.6, the first 0d concept after Phase 0c closed.

# VERDICT: `DESIGN_FIX` — cycle 1 of 2 · routed to `alex:architect`

**3 blocking (P1) · 5 P2 · 3 P3.**

The pedagogy is strong and should survive verbatim: the arc grammar is the equation's own build order
(product → the `d` factor → the `cos θ` factor → numeric closure → notation), the aha lands at S2 of 6
(matching the exemplars' unanimous first-half property), the misconception beats sit at exactly 2
genuine pivots, the anchors are universal and physics-true at depth, and the Rule-41 title audit is
clean. **Two of the three decisions submitted for scrutiny are right and are endorsed with reasoning
below.**

The failure is the ENGINE FIT CHECK — which is exactly where the brief said the expensive error would
be. Its *central* claim is verified TRUE at source and belongs on record: `work_accumulators` +
`checkpoints` alone light the left-edge panel with **no `energy_layer` block**, so `#1` teaches W
before K without pre-teaching #3/#7. That was the single biggest fit risk and it holds:

```
L42747  eng.energy_active = !!(eng.energy_layer || eng.work_state || eng.checkpoint_state);
L43241  if (!cfg && !hasWk) { p.style.display = "none"; return; }
```

But three other fit claims do **not** hold, and each silently decides whether a state's central number
is correct on screen or in the frozen baseline. All three are cheap to fix now and expensive after
json-author. **No engine edit is required for any of them — the 0d success test survives.**

---

## Findings

### P1 — BLOCKING

**F1 · `checkpoints.s_m` is an ABSOLUTE TRACK COORDINATE, not displacement from release. S1 and S4
would stamp the wrong joules.** — S1, S4 — `[owner: alex:architect]`

The skeleton writes `s_m: 1.0` / `s_m: 2.0` and claims the stamps read `20.0 J` and `40.0 J`; §3 says
outright *"crossing the flag at s = 1 m"* — treating `s` and `d` as the same number. They are equal
only when `initial_position_m = 0`, which the home pose contradicts (*"one crate at the left third of
the track"*).

```
L44203  var side = (b.s >= cp.s_m) ? 1 : -1;        // compared against b.s, not b.s − b.s0
L44543  s:  d.initial_position_m || 0,               // b.s seeds from initial_position_m
L45050  return { lo: -lenM, hi: hiS };               // track spans −lenM … +lenM
L39622  var NLB_DEFAULT_LEN_M = 6;                   // lenM is a HALF-length; default track = −6…+6 m
```

With the crate at the left third (`s₀ ≈ −4 m`), `s_m: 1.0` is **5 m of displacement** — S1 stamps
≈ 100 J, S4 stamps ≈ 120 J. **S4 is the state whose entire claim is "the formula's prediction equals
the meter's measurement."** It would be false on screen, and no gate catches it (THE CALCULATOR is
advisory; the auditor does not cross-check a stamp against a formula).

**Fix:** pin the home pose at `initial_position_m = −length_m` (the left bound — this also maximises
run length and closes F6), and write flag positions in the DoD as arithmetic, not literals:
`s_m = initial_position_m + d_target`. State it once in §3's home-pose paragraph so physics-author and
json-author cannot diverge.

**F2 · The checkpoint stamp does NOT survive a `loop_reset_ms` cycle. The skeleton asserts twice that
it does — and the frozen baseline may photograph an empty formula surface.** — S1, S4 —
`[owner: alex:architect]`

§3 S4: *"loop re-runs, stamp holds."* DoD (d): *"latched under `formula_base`… re-armed on
`RESET_TRAJECTORY`"* — treating the loop reset and `RESET_TRAJECTORY` as different paths. They are the
same path:

```
L43023  nlbResetTrajectory();                 // nlbRunLoopReset — "the ONE rewind path"
L42989-92  cp._side = null; cp._count = 0; cp.text = "";
L43002  nlbRenderStamps(eng);                 // re-renders formula_base with NO stamp
```

The stamp is **wiped at every loop boundary**. Combined with SEAM M's contracted frozen-pin rule (pin
at `cycle·R + clamp(0.60R, 150, R−150)`, i.e. **60% of the loop phase**), S4's canonical reviewer frame
and its H2 baseline show an empty formula surface unless the flag is crossed before 60% of `R` — the
rubric's R4 failure class, designed in rather than discovered. For a live teacher the number also
blinks off periodically in the one state whose whole point is the stamped number.

**Fix:** correct both claims and add a stated authoring invariant beside the bounding discipline: *the
checkpoint crossing must occur before 55% of `loop_reset_ms`*, with physics-author computing the
crossing time against the state's authored acceleration.

**F3 · Decision 2's engine premise is FALSE — `slider_controls` is a built, contracted per-concept
range/label override. The decision must be re-made on true facts, and Decision 3 is currently
aspirational because of it.** — S3, S6 — `[owner: alex:architect]`

§3 states the `'F_ang'` range is *"engine-fixed at −90…180"* and that *"per-state range clamping is not
a contracted mechanism… do not open a surgeon dispatch for it."* −90…180 is the **default**, not a
fixed range:

```
L1877   slider_controls?: { …                              // top-level config key
L41893  F_ang: { … min: -90, max: 180, step: 5, def: 0 }   // NLB_SLIDER_SPEC default
L41894+ function nlbSc(token) { var o = (config.slider_controls || {})[token] || {}; … }
        // "Per-concept min/max/step/default/label override, keyed by the SAME token
        //  the per-state controls_visible[] uses."
```

`slider_controls.F_ang: { min: 0, max: 85 }` is one JSON line, zero renderer edits.

Two things the architect must reconcile:

- The clamp is **per-concept, not per-state** — so it is not a free win: clamping to 0…85 makes a
  guided θ slider on S3 safe *and* closes the sandbox, in one move.
- **Decision 3 is currently only aspirational.** §1 says θ = 90° and beyond is *"ceded entirely to
  #2"*; §3 then declares a teacher dragging past 90° in S6 *"acceptable."* Those contradict. Either the
  cession is real (clamp `F_ang` concept-wide — and then S3 can have its slider) or it is not (in which
  case stop claiming it in §1). The current design withholds the slider from the state that **teaches
  θ** while leaving it wide open in the state that teaches nothing about θ — the inverse of Rule 31's
  contextual-control logic.

Reading offered, not imposed: clamp `F_ang` to `0…85` concept-wide and give **S3 the θ slider**. It
makes the taught variable manipulable in the teacher's hands (the live-instrument model), makes
Decision 3 true instead of stated, and costs one config line. What is *not* acceptable is shipping on a
premise that is false against the built engine.

### P2

**F4 · S5's angle-arc "re-anchor" is a verified pixel-for-pixel no-op. Its declared delta has no
visible referent.** — S5 — `[owner: alex:architect]`

On a flat floor with forward motion the two tokens return the **identical unit vector**:

```
L43964  if (token === "surface")      return axis.clone();
L43984  if (token === "displacement") { var dsd = (b.s||0) - (b.s0||0); … return nlbSignedDir(axis, dsd); }
```

`nlbSignedDir(axis, +ds)` **is** `axis`. Same arc, same radius, same degree readout, same pixels. So
S5's only genuinely new content is the formula string `W = F⃗·d⃗`, over a motion the skeleton itself
calls *"Same 40 N / 60° run"* — identical to S4. That is the R1 class the rubric exists to catch: a
state clearing every gate (it declares a distinct archetype, `reveal-build`) while adding no new
picture. Triggers the OPEN directive `teach_visual_must_match_narration`.

The IDEA is real and correctly ringed advanced (38c). **Fix the visual, not the idea:** run S5 at a
**different θ** (30° rather than 60°) so the arc reads a different number, the F arrow sits at a
different tilt, the bar climbs at a different rate, and `W = F⃗·d⃗` is demonstrated as *general* rather
than as a re-caption of S4. Drop the re-anchor claim. (S5's title is also the one topic-label title in
an otherwise result-stating set.)

**F5 · The DoD's on-canvas strings do not match what the engine actually renders.** — all states —
`[owner: alex:architect]`

- The work-panel section header is **engine-hardcoded** `"Work done"` (`nlb_wk_cap`, L43198) — not authorable.
- The per-bar caption is the FORCE NAME, defaulting to `"applied force"` (`NLB_WK_LABEL`, L43551). The
  authored `"Work by the pull"` renders as **"Work done / Work by the pull"** — redundant, and it
  word-wraps inside a fit-ladder slot.
- The stamp format is `head + ":  " + "W " + label + " = " + value` (`nlbCpStampText`, L44215-44236),
  so with `label: "Work by the pull"` the stamp reads `flag at 1 m:  W Work by the pull = 20.0 J` —
  broken English on canvas (Rule 41) in the one state whose claim is the number (Rule 34).

**Fix:** choose the label so `"W " + label` reads as English — `label: "by the pull"` →
`"W by the pull = 20.0 J"` — and rewrite §10(b) to the engine's real strings. The bar's own numeric is
bare (`"20.0 J"`), not `"W = 20.0 J"`.

**F6 · S6's sandbox wrap breaks the `d` ↔ `W` agreement the explore state exists to demonstrate.** —
S6 — `[owner: alex:architect]`

The V1 resolution recorded in the skeleton is correct as far as it goes (and there is an even stronger
path than the one cited — the wrap calls `nlbEnergyOnWrap(eng)` → `nlbSpringPhysReset(eng)`, which
re-zeroes every W ledger at L42987-42993 and drops `_s_pre`). But it stopped one object short:

```
L45428  if (s1 > bd.hi) { s1 -= span; v1 = (b.v0 != null) ? b.v0 : 0; nlbEnergyOnWrap(eng); }
```

`b.s` is remapped. **`b.s0` is not.** And `b.s0` is the `d` arrow's origin
(`ds2 = (b.s||0) - (b.s0||0)`). So the instant after a wrap the `d` arrow points **backward** with a
live value of up to `(s0 − lo)` metres while the work bar reads `0.0 J` and climbs positive — under a
formula surface saying `W = F·d·cos θ`. With `s₀` at the left third that contradiction persists for
~2 m of travel, every lap. `loop_reset_ms` cannot rescue it (SEAM K: inert in `mode:'sandbox'`).

This is the un-covered half of this run's own scar class
`field3d_path_integral_accumulator_bills_a_teleport_as_displacement` — the ledger was hardened, the
*arrow* was not.

**Fix (zero cost, and the same fix F1 wants):** author `initial_position_m = −length_m`. The wrap then
lands the crate essentially back on its release point, `|Δs|` falls below `NLB_DISP_MIN_M = 0.02` and
the `d` arrow **hides in the same frame the ledger zeroes**. Adopt it for the guided states too so the
home pose is uniform. A one-line engine fix (`b.s0 -= span`) is the more general answer and is filed as
a **ride-along** scar candidate — **not routed, not a 0d alarm**; the JSON fix is not a workaround but
the physically honest home pose.

**F7 · S1's checkpoint stamp duplicates S4's device and thins S4's information gain.** — S1, S4 —
`[owner: alex:architect]`

S1 already shows every number live at the flag instant (bar `20.0 J`, `d = 1.00 m`, HUD `F = 20 N`).
The stamp adds only permanence, puts a non-focal extra object on the state whose focal is
`displacement_vector` (Rule 34 clutter), and spends S4's device one state early — leaving S4's delta as
*"the same stamp, now with cos θ in it."* **Fix:** drop S1's checkpoint entirely.

**F8 · Three unstated design constraints decide whether S1–S5 work at all. They belong in the DoD.** —
S1–S5 — `[owner: alex:architect]`

- **(a) S2's ramp target has no margin.** The static hold is exact:
  `stuck = … && (Math.abs(drive) <= maxStat)`, `maxStat = b.mu_s * N` (L45338, L45358). *"just under
  μₛmg"* invites `0.98·μₛN`; the crate then breaks free at the end of the **PRIMARY aha state** — and
  on the frozen pin. State a ceiling (≤ ~0.85·μₛN) with the arithmetic. `mu_s` maxes at 1.0, so
  `maxStat ≤ mg = 49 N` at m = 5 kg.
- **(b) S1/S3/S4/S5 must be declared frictionless.** §3 says μₛ is high *"this state only"* but never
  states the others. With realistic μ, S3's along-drive is 10 N against `μ·31.7 N` — the crate barely
  moves and the S1↔S3 "half the joules per metre" comparison dies. Author `surface.frictionless: true`
  explicitly.
- **(c) `work_scale_J` is unspecified and must clear the LOOP's peak, not the flag's value.** An
  over-run clamps the bar and fires `NLB_ENERGY_SCALE_WARN_PREFIX` (L44373), which THE EYE's console
  audit asserts zero of → concept fails. Additionally **S1/S3/S4/S5 must SHARE one `work_scale_J`**, or
  "climbs at half the joules per metre" is not readable as bar slope (Rule 32d).

Physics arithmetic otherwise checked and correct: `N = mg − F sin θ` = 31.7 N at S3 ✓ and 14.4 N at
S4 ✓, both > 0 so no lift-off clamp; `20 × 1 × cos 0 = 20 J` ✓; `40 × 2 × cos 60 = 40 J` ✓.

### P3

**F9 · Two token-name imprecisions in the FIT CHECK.** `param_ramp` on *"the legacy scalar
`applied_force_N`"* — the contracted enum is `param_ramp.param: 'theta'|'F'|'mu_s'|'mu_k'|'m'` (L1577);
the token is `'F'`. Separately the `F` slider's default range is **−20…+20 N** (L41881) while S4 authors
40 N and S2 ramps toward ~40 N — `slider_controls.F` is the built widening mechanism (see F3).

**F10 · "the pull begins ~0.8 s in" has no contracted mechanism** for a constant `applied_force`. Only
`param_ramp`/`phases[]` can delay it. Author it as a short ramp or drop the claim.

**F11 · Observation, deliberately NOT routed — the `cos θ` component is never drawn as an object.**
S3's `one_line_fix` names *"the component of the force along the motion"* and nothing on canvas is that
component. `show_components` resolves the **weight** only and is gated on an inclined surface (L1319;
L40862) — inert on a flat floor, and it cannot decompose the applied force. Drawing `F cos θ` would
require an engine edit, i.e. 0d ALARM territory. **Checked specifically to avoid routing an engine
dispatch, and the correct call is not to.** The arc, the F arrow at its true angle, and the two
work-bar slopes carry the lesson. Recorded so #2 does not rediscover it, and so the founder can see the
one place the built engine is thinner than the textbook picture.

---

## The three submitted decisions — rulings

**Decision 1 — PRIMARY aha on the `d = 0` beat (S2), not the formula beat. ✅ RIGHT. Keep verbatim.**
The formula beat is a *definition*; definitions are not ahas. The everyday-vs-physics collision on the
word "work" is the stickiest thing in the topic and the one a teacher is actually asked about, and its
visual — a large force arrow over a meter frozen at `0.0 J` with the crate motionless — is the ten-year
memory. It sits inside the `foundational` entry range, so every default entry path reaches it. The
boundary holds: zero-via-`d = 0` is definitional to the product (#1's `d` factor), while
zero-via-`θ = 90°` is a sign-taxonomy case (#2's `cos θ` factor). The S1→S2 adjacency is the correct
16a shape.

**Decision 2 — no θ slider on any guided state. ❌ Premise false. Re-make it. → F3.**

**Decision 3 — θ = 90° and beyond ceded entirely to #2. ✅ RIGHT boundary — but only true if F3's
clamp lands.** The opener is **not** hollow: four separable ideas plus the notation ladder, and `cos θ`
is the *hard* half, not the leftovers. Taking θ = 90° as well would leave #2 opening on negative work
alone (thin) and push #1 to five ideas in six states. The line is in the right place. The one
condition: §1 claims the cession while §3 hands every teacher an unclamped slider to break it. Make it
true or stop claiming it.

---

## Per-state design table

| # | order_ok | idea distinct | labels | sound-off | how a teacher points at it | problem | P |
|---|---|---|---|---|---|---|---|
| S1 `pull_and_move` | Y | Y — the product + the joule | Y | Y | *"Watch the meter grow exactly as the distance grows — 20 newtons through 1 metre is 20 joules."* | F1, F7, F8b/c | P1 |
| S2 `force_without_motion` | Y | Y — the `d` factor can be zero | Y | Y — the missing `d` arrow IS the content | *"He is pushing as hard as he can. Read the meter. Zero."* | F8a (do not let the crate creep on the PRIMARY aha) | P2 |
| S3 `tilted_pull` | Y | Y — the `cos θ` factor | Y | Y | *"Same 20 newtons. Tilt it. Now count the joules per metre."* | F3, F11 (accepted), F8b | P1 |
| S4 `numbers_agree` | Y | Y, thin once S1 stamps | Y | Y | *"Predict it: 40 times 2 times cos 60. Now cross the flag."* | F1, F2, F7 | P1 |
| S5 `scalar_product` | Y | Idea yes, PICTURE no | Y | Marginal | *"Two arrows. One number. That is the dot product."* | F4 — declared delta is a verified no-op | P2 |
| S6 `explore` | Y | n/a | Y | Y | *"Change the angle and watch the bar slope change."* | F6, F3 | P2 |

Rule 38 checked in full: 38a rings ordered, advanced contiguous before explore ✓ · both cut checks
coherent ✓ · 38b explore core-only ✓ (subject to F3) · 38c notation ladder ✓ · 38d dialect fine ·
38f suitcase-handle is the widest-overlap device ✓ · 38g CBSE verified, others carry
`needs_teacher_verification` ✓. Rule 35 clean (porter / named-resort chairlift / ISRO correctly
refused). Rule 41 clean across all six titles, all six delta cues, both bar labels — one topic-label
title noted in F4.

---

## 0d success test — status

**The test HOLDS. Zero renderer edits required; no surgeon dispatch opened.** Every state maps to a
built, verified contract: `applied_force {N, angle_deg}` ✓ · `displacement_vector` and its
`NLB_DISP_MIN_M = 0.02` auto-hide (which S2 uses elegantly — the hide genuinely is the lesson) ✓ ·
`angle_arc` with both `'surface'` and `'displacement'` in the closed enum ✓ · `work_accumulators` +
`work_scale_J` lighting the panel with no `energy_layer` ✓ · `checkpoints` with `capture: ['W']` ✓ ·
`param_ramp` on `'F'` ✓ · genuine static friction reporting `f = -drive` so S2's *"the f readout climbs
to match"* is true (L45362) ✓ · `controls_visible` tokens `'F'`, `'F_ang'`, `'m'` present (L1340) ✓ ·
`mode:'sandbox'` + `trusted_drag_seizes` ✓ · no `deriveStateMeta.ts` co-edit ✓.

All eight findings are JSON/design fixes. **F11 is the one place the built engine is thinner than the
ideal picture, and routing it is explicitly declined** — the concept teaches correctly without it, and
a per-concept engine extension is exactly what Phase 0 exists to prevent.

---

## Rubric (advisory, unratified — did not affect the verdict)

```
Checkpoint A subset (D1, D2, D8, D9, D10)
D1 1 · D2 2 · D8 2 · D9 2 · D10 1   = 8/10

weakest: D1 information gain — S5's picture is derivable from S4's: the arc
         re-anchor is a verified no-op ('surface' and 'displacement' return the
         same unit vector, L43964/L43984) over the identical "same 40 N / 60° run",
         leaving a formula string as the only new content. S1's checkpoint stamp
         additionally spends S4's own device one state early.
         D10 explore earns its place — the sandbox demonstrates real dials, but two
         defects sit inside it: after every wrap the d arrow contradicts the work
         bar (b.s0 not remapped, L45428), and the unclamped F_ang slider reaches
         the 90°/120° regime §1 states is ceded to concept #2.
```

---

## Dispatching-session verification (2026-08-01)

The two findings that most change the design were independently re-verified at source before routing:

- **F1 CONFIRMED.** `var side = (b.s >= cp.s_m) ? 1 : -1;` (L44203) compares against the absolute
  track coordinate, and `s: d.initial_position_m || 0` (L44543) seeds it; `NLB_DEFAULT_LEN_M = 6` is a
  visible HALF-length, so the default track spans −6…+6 m. The wrong-joules consequence is real.
- **F3 CONFIRMED.** `slider_controls` exists as a top-level config key (L1877) and `nlbSc(token)`
  merges `config.slider_controls[token]` over `NLB_SLIDER_SPEC[token]`, commented *"Per-concept
  min/max/step/default/label override, keyed by the SAME token the per-state `controls_visible[]`
  uses."* The architect's "engine-fixed range" premise is false, and founder-proxy's nuance is also
  correct: the override is per-CONCEPT, not per-state.

Verdict accepted; routed to `alex:architect` for cycle 2 of 2.
