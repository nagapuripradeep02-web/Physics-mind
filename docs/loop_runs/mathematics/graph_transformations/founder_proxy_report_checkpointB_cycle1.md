# FOUNDER_PROXY — CHECKPOINT B (BUILD GATE) — `graph_transformations` — **CYCLE 1**

> Desk: `Physics-mind-mathematics-graph-transformations`, branch `fix/math-graph-transformations-checkpointB`
> (`2f18eb4` fix round, `85a2f9e` founder-approved re-baseline).
> Dump walked: `.visual_runs/graph_transformations/20260807-202738/` (THE EYE 48/50 — the two failures
> are the intended STATE_3 pin move, since re-approved).
> **Stale-cache episode independently cleared by the proxy:** all 8 run frames downscaled to 640×360 and
> compared against the committed baselines — **0.00 % differing pixels on every state**. The approved
> baselines are this tree.
> Dispatching session re-verified the P1 at the crop level before committing this report.

**Verdict: `FIX`** — 1 × P1 · 4 × P2 · 7 × P3. Cycle **1** (one cycle remains before escalation).
Four `FIX(engine)` findings, **all ride-along** — none blocks.

**Justification.** The cycle-0 P1 is genuinely discharged and the concept is transformed by it: STATE_2
now shows the bright copy peaking on the labelled `2` row with the ghost on `1`, so "slides up by exactly
k" is measurable on screen for the first time. P2-1/2/4/5 and P3-1/3/7/8 all landed, each verified against
pixels rather than the commit message. What blocks approval is **a regression the remedy itself
introduced**: raising `grid_color` `#1E293B` → `#72859F` made gridlines visible — including the y = 3
gridline that runs straight through `chip_inside` in STATE_6, the concept's primary aha line, and the
y = −2 gridline through STATE_5's `width = 2π/b = 3.14` readout. Both were invisible at 1.05:1 and are now
legible strikethroughs. A line drawn through the aha sentence is the visual grammar for "cancelled".
The fix is two y-coordinates.

---

## PASS 1 — SCAR RATCHET (the proxy's own six cycle-0 rows, now live)

| class (filed cycle 0) | recurrence? | evidence |
|---|---|---|
| `axis_declutter_sets_tick_labels_to_none…` | **discharged** | 5 `label` primitives in 6/8 states, 4 in S6/S7; legible in all 8 frozen frames |
| `readout_format_drops_the_point_name…` | no | `P′ = ({x}, {y})` verified rendered in all seven states |
| `state_title_asserts_a_sequence…` | no | all 8 titles re-derived against their choreography |
| `rule_chip_generalises_shift_direction_language…` | **PARTIAL RECURRENCE** | chip fixed; `s6_1` still says *"both act on y, in the direction their sign says"* of `k` **and** `a` — **P2-D** |
| `tts_sentence_glow_channel_unused…` | no | 20/20 non-empty sentences bound; every id resolves (script-verified) |
| `schema_requires_a_focal_primitive…` | still open | S8 `p_prime` readout still peer-dimmed 0.6 — engine E2, unchanged |

Pre-existing: tick-value enumeration **no recurrence** (x=0 at px 668.5, 73.17 px/unit) · readout-overprints-own-line **no recurrence** (all 8 zoom-checked) · **sibling-ink row bites in three new places** (P2-A, P3-1, and the gridline-over-text of P1-A) · D5 motion gate **still skipping 7 of 8 states** (unchanged from cycle 0, not a regression; proxy read the dense series manually instead).

## PER-STATE (condensed)

| state | verdict | problem | pri |
|---|---|---|---|
| S1 The Parent Curve | Y | two amber readouts, one named `P =`, one anonymous `(6.50, 0.22)` | P3 |
| S2 Add k | Y | the `1` row is overwritten by the curve's left endpoint t≈12–14 s | **P2** |
| S3 Subtract h Inside | Y | label column jumps to x = −5.28, unlike every other state | P3 |
| S4 Multiply by a | Y | pin lands 500 ms past the a = −1 hold; archived frame shows neither claim in its own title | **P2** |
| S5 Multiply x by b | Y | y = −2 gridline strikes through the width readout | **P1** |
| S6 Outside/Inside | Y | **y = 3 gridline strikes through the aha chip**; `3` row missing though the curve peaks at 2.5; narration contradicts its own chip | **P1** |
| S7 Where One Point Lands | Y | hop origin still unmarked at rest (carried); `3` row omitted without cause | P3 |
| S8 Explore | Y | `1` row overwritten on every ping-pong cycle; `P′` readout still peer-dimmed | **P2** |

All eight `correct_YN = Y`: P′ = (π/2b + h, a + k) re-derived at every pin, reconciled to 2 dp against
the rendered readouts. S5's bracket measures 231 px = 3.156 units against `2π/2 = 3.14`.

## FINDINGS

### P1-A — the gridline-contrast remedy turned gridlines into strikethroughs. `alex:json_author`
- **STATE_6 `chip_inside`**: author `y: 124` → rendered **178.7**; y = 3 gridline at **178.5**. The line runs
  the full width of *"inside — acts on x, inverted (÷ b, + h)"* — the primary aha line.
  Before/after at identical crop and scale: `crops/s6_chip_2x_OLD.png` vs `crops/s6_chip_2x.png`.
- **STATE_5 `bracket_label`**: data `y: −1.95` → rendered **510.6**; y = −2 gridline at **513.5**. Merges with
  both `=` signs of the state's only numeric instrument.
- Measured at an ink-free column with the ×0.6 peer-dim as rendered: **1.047:1 → 1.401:1**. Invisible
  before, visible now.
- Script-verified these are the **only** two cases across all 8 states.
- Fix (two numbers): `chip_inside.position.y` 124 → ~132; `bracket_label.position.y` −1.95 → ~−1.80.
  **Do not** revert `grid_color` — that re-breaks the cycle-0 P1.

### P2-A — the edge-label column sits inside the plotted band. `alex:json_author`
Data `x = −6.5` **is** `x_range.min` → px 193, `textAlign(CENTER)` centres on the boundary. Every
`function_plot` authors **no `x_domain`** (all 16 script-verified), so every curve begins exactly there.
Measured occlusion of the `1` label bbox by curve ink: STATE_2 t=12000 **19 %**, t=13000 **26 %** (window
t≈11.6–14.8 s, overlapping the tail of the k = 1.0 hold); STATE_5 twice; **STATE_8 recurs on every
ping-pong cycle, permanently**. Draw order does not rescue it — a `#64748B` glyph at 0.6α over a
`#38BDF8` stroke plus glow is unreadable regardless. **The exhaustive search searched the wrong
interval**: x ∈ [−6.5,−5.5] is entirely inside the band; the answer is **outside** it, at data x ≈ −6.9
(px ≈ 164), measured empty (max channel delta 0–1 of 765) in seven of eight frozen states.
This one change also discharges P2-B.

### P2-B — the scale ladder is not the same object state to state. `alex:json_author`
Column x is −6.5 in six states and **−5.28 in STATE_3**; row set is five rows in six states and **four in
S6/S7**. Rule 32d. S6's omission is justified (P1-A); **S7's is not** — its lowest chip renders to y≈166,
the `3` label would occupy 171–186, 5 px clearance. S6/S7 are the two states peaking at 2.5, i.e. the two
that most need a `3` reference. The margin move restores one uniform 5-row ladder.

### P2-C — STATE_4's pin still misses its hold; the proxy's own cycle-0 prescription was arithmetically wrong. `alex:json_author`
`a: 1 → −2`, `start_ms 1500`, `duration_ms 12000`, `holds:[{at_value:−1, hold_ms:2000}]`. **`duration_ms` is
MOVING time**, so the hold runs **9500–11500 ms**; the new pin **12000** is 500 ms past it. The frame reads
`a: -1.1`, `P′ = (1.57, -1.13)` — demonstrating neither "Flipped" nor "Twice as Tall", the two halves of
its own new title. Recommend **10500** (a = −1.00, clean flip) or **≥16000** (a = −2 at rest: flipped *and*
twice as tall, now measurable against the new ±2 rows). Proxy states the error as its own.

### P2-D — the claim was corrected on the chip but not on the narration repeating it. `alex:json_author`
`chip_outside` is now correct, but **`s6_1` still says "both act on y, in the direction their sign says"** —
direction language over `a`, a scale factor: exactly the class the cycle-0 row was filed against, now
contradicting the chip printed 26 px above it. Separately `chip_inside` says **"inverted"** while `s6_2`
says **"the opposite way"** — two words for one idea in one state — and "inverted" collides with STATE_4's
newly-authored "**Flipped**". Suggested: chip → *"inside — acts on x, the opposite way (÷ b, + h)"*;
`s6_1` tail → *"both act on y, as written (× a, + k)"*. Provenance is the proxy's on both halves.

### P3
1. **The parent ghost buries x-tick labels `−3` and `6`** in every state that draws it — plane + tick labels
   render Pass 0.25, curves Pass 0.3. → **engine E3**.
2. **Two different minus glyphs on one plane** — authored U+2212 vs the engine's ASCII hyphen from
   `PM_formatTickLabel`/readout/slider caption. Rule 34c. → **engine E4**.
3. **The contrast claim is overstated**: measured **1.047 → 1.401**, not 1.08 → 1.65; the stated >1.5:1 target
   is not met. **Explicitly not raised** — the labels now carry the reading and a brighter grid worsens
   P1-A. Recorded so the commit message's number is not inherited as fact.
4. y = 4 gridline crosses the `formula_box` in all 8 states at 1.24:1 — faint, note only.
5. STATE_1's two amber readouts, one named one anonymous — reads as an oversight, not a recurrence.
6. Carried and accepted: S7 hop origin unmarked · concept name carries `f` (founder-owned) · S6 chip colour semantics.
7. D5 motion gate skips 7 of 8 states (unchanged); motion machine-proved on STATE_8 only.

## ENGINE QUEUE — four, all ride-along

| # | finding | owner |
|---|---|---|
| E1 *(carried)* | sibling `function_plot` ink invisible to the de-overlap solver — **now covers three victim types**: a `plot_point` readout, a `label` primitive, and the plane's own gridlines over authored text | `peter_parker:renderer_primitives` |
| E2 *(carried)* | explore/sandbox cannot reach the renderer's existing no-dim path | `peter_parker:renderer_primitives` (+ `alex:architect`) |
| **E3 *(new)*** | **plane tick labels draw BEFORE curves** (`:5444` Pass 0.25 vs `:5569` Pass 0.3), so any curve crossing the axis buries them. **The correct fix for the whole class — it is why the author had to reach for `label` primitives at all.** No content edit can fix it. | `peter_parker:renderer_primitives` |
| E4 *(new)* | engine number formatters emit ASCII hyphen beside authored U+2212 on the same surface; affects every mathematics concept on this engine | `peter_parker:renderer_primitives` |

## RULING ON THE DISCLOSED RESIDUAL

**Not acceptable as stated — but smaller than the disclosure implies, and the remedy is cheaper.**
Of its three claims, two are wrong: the window is **~3 s**, not ≤1 s, and in STATE_8 it recurs on every
loop permanently; and the "exhaustive search" covered only the inside of the plotted band, never
x < −6.5, which is permanently clear. The draw-order claim is correct but irrelevant in effect.
**Remedy: move the whole column to data x ≈ −6.9, one uniform x, five rows, all eight states** — which
also kills the S3 special case and the S6/S7 omissions.
**Judging the deviation itself:** moving off the prescribed `x ≈ −6.2` was *right*; verifying against
rendered PNGs rather than arithmetic was *right*; disclosing rather than hiding was *right* and is why
this cycle is short. **The error was the search interval, not the method** — and the per-state divergence
is the tell that the space was wrong.

## SCAR CANDIDATES (4 new; filed by the dispatching session)

1. `raising_gridline_contrast_turns_every_overlay_text_that_sits_on_a_tick_row_into_a_strikethrough` — CRITICAL, `alex:json_author`
2. `axis_scale_labels_placed_inside_the_plotted_band_are_overwritten_by_the_curve_they_measure` — MAJOR, `alex:json_author`
3. `choreography_holds_shift_every_downstream_ms_so_a_pin_named_in_absolute_ms_lands_off_hold` — MAJOR, `alex:json_author`
4. `a_claim_corrected_on_one_rendered_surface_is_left_standing_on_the_sibling_surface_that_repeats_it` — MAJOR, `alex:json_author`

E3/E4 deliberately not minted as new classes — both are cleanly extensions of the live OPEN sibling-ink
row and of Rule 34c enforcement; appending `graph_transformations` to the former is the upsert-safe move.

```
RUBRIC (advisory, unratified; did NOT affect the verdict)
  D1 2 · D2 1 · D3 2 · D4 1 · D5 1 · D6 1 · D7 1 · D8 2 · D9 2 · D10 2 = 15/20  (cycle 0: 12/20)
  weakest: D6 (the "1" row overwritten for ~3 s inside the very window where "up by exactly 1" is
           the claim) · D5 (the plane IS the apparatus, and its gridlines now run through the aha
           chip and the width readout)
  D6 note: the proxy corrects its own cycle-0 score of 1 as too generous — with no y numbers at all
           it met the 0 anchor. Recorded so the +3 delta is not read as larger than it is.
```

## SELF-REVIEW (proxy's own, abridged)

- The P1 is founder-verifiable in under a minute: `crops/s6_chip_2x_OLD.png` beside `crops/s6_chip_2x.png`.
- All four FIX findings route to one owner (`alex:json_author`); all four engine findings are queue
  ride-alongs, never FIX routing. Nobody dispatched.
- PRIME DIRECTIVE per finding: **E3 is routed to the engine precisely because no content edit fixes it**;
  P1-A/P2-A are content because they are authoring mistakes, not engine gaps.
- Rule 38 re-checked in full (38a cut-test, 38b, 38c, 38d, 38f, 38g all clean). Rule 39 N/A.
- Rule 41 applied to every changed string; **"inverted" flagged** for colliding with STATE_4's "Flipped".
- **No P1 was lowered.** The label-occlusion finding was moved P1→P2 *before* the verdict was decided, on
  crop evidence (bisected, not erased), and the `s6_1` recurrence was declined for P1 after re-reading —
  both calls stated so the founder can overrule either.
- Two findings (P2-C's pin, P2-D's "inverted") originate in the proxy's own cycle-0 prescriptions; both labelled.

**Nothing here authorises shipping.** A later APPROVE is authoring sign-off only.
