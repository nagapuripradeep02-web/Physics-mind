# FOUNDER_PROXY — CHECKPOINT B (BUILD GATE) · CYCLE 1 — `derivative_as_secant_limit`

> Desk: `Physics-mind-mathematics-derivative`, branch `fix/math-derivative-checkpointB`
> (`09c01c9` fix round, `884d393` founder-approved re-baseline).
> Dump walked: `.visual_runs/derivative_as_secant_limit/20260807-203226/` (THE EYE 56/56) + the proxy's
> own live drag probes. Dispatching session re-verified the P1 frame before committing.

**Verdict: `FIX`** — 1 × P1 · 4 × P2 · 4 × P3. Cycle 1 of 3.
**Cycle-0's two P1s are both CLOSED and verified at 4×.** Two new `FIX(engine)` findings, both ride-along.

**Justification.** The fix round did the hard work well. STATE_8 now draws its claim — an amber `point` on
the curve, a dashed connector, a teal `height = slope` head on the trace, a live `slope at point = 1.60`,
and a focal sequence running cause → link → effect. STATE_7's `lim (x₀ + h/2) as h → 0` renders at one
uniform type size, and the h7 sweep makes the chord genuinely rotate (0.58–2.37 %/s across 13 000–18 000 ms,
against a flat 0.00 % before). Fourteen of eighteen cycle-0 findings landed cleanly, each confirmed against
rendered pixels rather than the commit message.

It fails on one thing the fix round itself created. **F-11's remedy — pushing Q's readout +130 px right —
moves Q's readout INTO P's readout whenever the two points share a height.** On the explore state that is
`xq ≈ −x0`: the symmetric pose, where the chord slope is exactly 0.0000 — the single best demonstration the
sandbox offers. Both numbers are destroyed. The old offset `{12,−30}` put those boxes 50 px apart and never
collided. It is a textbook recurrence of the row this concept filed at cycle 0, whose prevention rule says
verbatim: *"check the offset against every other point's marker **and readout box**, not just against the lines."*

**The deeper cause deserves more attention than the finding.** The fix round's design notes reason about the
*authored* offset while the renderer draws a different one: `PM_readoutResolveOffset`
(`parametric_renderer.ts:3408`) negates **both** components when a plot_point box lands on an axis band.
S2's P readout is authored `{−104, 20}` and renders `{+104, −20}` — a 180° mirror. The design note asserts,
in detail, a placement that does not exist on screen. It happens to land clean, so nobody noticed. Every
hand-placement this round was validated by arithmetic in a comment rather than by reading the frame.

---

## THE FOUNDER'S THREE QUESTIONS, ANSWERED

**Q1 — does STATE_8 now draw its claim? YES, F-1 closed.** Two *distinct* markers (amber `#FBBF24` with a
`point` label; teal `#2DD4BF` with `height = slope`), a dashed `corr_vector` between them at the same u, and
a live number from t=0. The proxy checked that `drawVector` does consume `PM_focalEmphasis` (fixed
2026-08-05) — had this been a `glow_focus` primitive the OPEN row `pcpl_glow_focus_cannot_resolve…` would
have made it a blob; it is `focal_primitive_id`, the separate path. Residual: the `height = slope` label is
centre-anchored so its offset straddles rather than clears (G-5).

**Q2 — S9's left branch: acceptable, or F-11 unfixed on half its range? NEITHER.** F-11 is fixed on *both*
branches; the round introduced a different, worse defect. The founder's named case (`xq = −1.9`) renders
clean — the flip fires, the offset mirrors, the clamp parks it at the edge (ugly, legible, P3). On the left
branch at Q-near-P the new offset actually *rescues* Q. **The real band is `xq ∈ (−1.22, −0.72)` for x0 = 1**
(~13 % of the drag range, containing `xq = −x0` exactly) — deterministic, reachable by drag. That is G-1.
A second, **pre-existing** tangle sits on the left branch: P's flipped readout and the chord's auto-placed
readout fuse. Not a regression, but the same fix must clear it — a teacher hits both in one gesture.

**Q3 — Rule 40 on the h7 line: AGREED with the dispatching session.** 7 added lines wholly inside
`computePhysics_derivative_as_secant_limit`, an existing per-concept dispatch entry; one defensive variable
read matching its five siblings verbatim, one key in the returned object. No shared mechanism, no new
primitive, no new draw path — nothing another chapter could build twice, so 40a's failure mode cannot apply.
Mirrored correctly in the TS twin. Caveat for the PR body, not for action: it does place a chapter-branch
edit inside a Rule-40 file, carrying a trivial merge-conflict surface until this branch lands.

---

## PER-STATE (condensed)

| state | verdict | note | pri |
|---|---|---|---|
| S1 | Y | F-9 landed; now the cleanest frame in the concept | — |
| S2 | Y | `run = h = 1.000` moved up into the wedge and is now struck by **both** curve and chord (G-3); Q's readout lives 258 px right of Q in the instrument column (G-6, accepted trade) | **P2** |
| S3 | Y | F-11 fully landed here; end-frame P/Q readouts side by side with a clean gap; end value 1.0050 matches narration | — |
| S4 | Y | F-3 + F-4 both landed — cue true for all 24 s, live `x₀` chip grounds the symbol on the core ring. New chip at font 13, the size F-2 just declared inadequate on S7 (G-7) | P3 |
| S5 | Y | F-5 landed, but the readout sits **on** the x-axis tick row: the "2" tick inside the word, the "x" label under the "=" (G-4). Under-reported by the fix round as "grazes the small x" | **P2** |
| S6 | Y | still the best teacher state; **ASCII hyphen** in `P = (-0.97, 0.47)` beside Unicode `−0.97` (G-2). −0 clamp landed | **P2** |
| S7 | Y | **F-2 CLOSED** (4×), **F-6 CLOSED** (live sweep). Residual: 13 s of 24 still static before the sweep begins | P3 |
| S8 | Y | **F-1 CLOSED.** Residual: `height = slope` centre-anchored, struck at the pin and crossed by four elements at u≈0 (G-5); declared focal is a 1 px hairline that shrinks to zero length mid-beat (G-8) | **P2** |
| S9 | Y | **P and Q readouts print on top of each other at `xq ≈ −x0`** (G-1). P + chord fuse on the left branch (pre-existing, same fix) | **P1** |

## FINDINGS

**G-1 (P1) · STATE_9 · the fix to Q's readout moved it onto P's readout. `alex:json_author`**
At `x0 = 1.00, xq = −1.00` (chord slope exactly 0.0000) the frame renders `Q = (-1.00, 0.50)` and
`P = (1.00, 0.50)` overprinted, both destroyed. Geometry deterministic (origin px (252,294), k=80):
P box x 344–458 row 274; Q box x 302–420 row 279; overlap 344–420 × 272–286. Old offset flipped to
`{−12,+30}` → box 160–278: no overlap. Band `xq ∈ (−1.22, −0.72)`, ~13 % of drag range.
**Binding instruction for the fix round: verify by RENDERING, not by arithmetic** — `PM_readoutResolveOffset`
negates both components on an axis-band hit, so the authored offset is frequently not what renders. Walk
the full drag range: both branches, the symmetric pose, and the coincidence pose.

**G-2 (P2) · fleet-wide · ASCII hyphen-minus in every plot_point/secant/tangent readout.** → engine E-3.
Visible on guided core S6 for the negative half of a 24 s sweep. **Third** documented occurrence of a FIXED
class whose own row records "shipped twice". Not authorable — `readout.format` interpolates `toFixed()` with
no transform hook, so per the PRIME DIRECTIVE the engine fix is routed rather than a workaround (there is none).

**G-3 (P2) · S2 · `run = h = 1.000` traded one defect for another. `alex:json_author`** The chord and the
curve both pass through the word "run". The design note verified clearance at the label's centre x only; at
data x ≈ 1.19 — inside the label's own span — the curve sits inside the text band. Cycle 0: "reads as an axis
caption". Cycle 1: "the word it names is struck out". Lateral, not forward.

**G-4 (P2) · S5 · `chord slope = 1.0020` sits on the x-axis tick-label row. `alex:json_author`** Authored
`{55,55}` → bbox rows 302–316 vs danger band 291–314 — it *should* have flipped and did not, because the
resolver is wired only at the plot_point call site. Content fix available now (y ≈ 30); engine sibling filed.

**G-5 (P2) · S8 · `height = slope` is centre-anchored, so the offset straddles rather than clears.
`alex:json_author`** Struck by the curve at the frozen pin; at u≈0 crossed by axis, both dots, curve and
tangent at once (~1.5 s). The design note's "never occupy the same pixels" is true of the two labels and
false of the ink.

**P3:** G-6 Q's readout now outside the plane (accepted trade) · G-7 new chip at font 13 vs the 15 the same
commit declared necessary · G-8 S8's declared focal is a hairline shrinking to zero length mid-beat ·
G-9 `tts_sentences: ['']` — empty *string* not empty array, identical in `graph_transformations`, so the
subject's existing convention correctly followed; **raised as a subject-wide schema question, routed to
nobody** · G-10 S6's "at the valley floor" is a metaphor (Rule 41), same register as the phrase this round
correctly removed.

## ENGINE QUEUE (both ride-along)

**E-3 · readout number formatting has no sign hook** — `PM_plotPointResolve` (`:3422–3440`) and the secant
(`:4110–4137`) / tangent (`:4173–4193`) readouts all interpolate `toFixed()`. Expectation: one shared
`PM_fmtNum()` emitting U+2212. `peter_parker:renderer_primitives`.

**E-4 · the collision-flip resolver is wired at one call site of three** — `PM_readoutResolveOffset` runs
only at `:3519` (plot_point); secant/tangent get `PM_clampOffsetToCanvas` only. So an authored offset means
different things per primitive, **and the flip is invisible to the author**. Expectation: route all three
through the same resolver **and expose the resolved offset on `__pmDebug`** so an author can read what
rendered instead of asserting it. `peter_parker:renderer_primitives`.

**Unchanged, both confirmed still non-blocking:** E-1 (two-level `lim` operator — *this concept no longer
needs it*, the plain-words route reads correctly at 4×; priority undiminished for the three ranked concepts
that follow) · E-2 (readout reveal gate).

## RATCHET

**Cycle-0 rows CLOSED and verified — 5 of 6.** The sixth (`readout_offset_authored_from_one_sample…`) is the
recurrence above and stays OPEN, upgraded to CRITICAL.
**Recurrences — 3:** that row (twice inside its own fix round) · `ascii_minus_in_oncanvas_math_from_tofixed`
(third shipping, via an engine path no authoring rule reaches) · the readout-overprint row's standing
authoring clause.
**Checked by name and clear — 11**, including a deliberate check of `pcpl_glow_focus_cannot_resolve…`
because the round made an expression-driven vector the focal.
**Rule 38 in full:** 38a **the `no_advanced` cut is now coherent** — F-4's chip was the only unsupported
symbol and it is grounded · 38b/c clean · 38d the best dialect execution in the subject · 38f universal
anchor · 38g unchanged, **F-18 remains a founder-owned doctrine question**. Rule 39 N/A.
**Live-drive:** zero console/page errors across five driven poses; all displayed numbers algebraically exact.

## WHAT SHIPS UNFIXED IF THE FOUNDER OVERRIDES

Both cycle-0 P1s are genuinely closed and the concept teaches correctly end to end. What would ship: (a) two
coordinate readouts that destroy each other in ~13 % of the explore drag range, including the symmetric pose;
(b) three struck-through captions (S2 `run`, S5 `chord slope`, S8 `height = slope`); (c) an ASCII minus
wherever a value goes negative, on guided S6 as well as explore. **None is wrong physics or mathematics.**
All are text-on-ink — cosmetic in kind, corrosive in aggregate — and (a) is the one the proxy would not
defend as polish.

**Recommendation, strengthened from cycle 0:** land this round, then hold `cartesian_plane` concept #3 until
`canvas_drawn_readouts_never_enter_the_de_overlap_solver` and E-4 close. *"Three fix rounds on this concept
have each moved a label and each exposed a new collision. That is not an authoring failure any more; it is
the engine telling us the hand-placement budget is spent."*

```
RUBRIC (advisory, unratified; did not affect the verdict)
  D1 2 · D2 2 · D3 0 · D4 1 · D5 1 · D6 1 · D7 1 · D8 2 · D9 1 · D10 2 = 13/20
  D3 = 0 is a CORRECTION of the proxy's own cycle-0 score of 1, not a regression — nothing on
  that dimension changed; 0 of 27 sentences carry a glow, which is literally the 0 anchor.
  D6 moved within band: S8's "no number anywhere" is closed; the residual is placement, not absence.
```
