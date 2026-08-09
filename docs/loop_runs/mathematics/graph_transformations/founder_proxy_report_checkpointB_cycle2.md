# FOUNDER_PROXY — CHECKPOINT B (BUILD GATE) — `graph_transformations` — **CYCLE 2**

> Desk: `Physics-mind-mathematics-graph-transformations`, branch `fix/math-graph-transformations-checkpointB`, HEAD `7d4adb0`, tree clean.
> Dump walked: `.visual_runs/graph_transformations/20260808-090031/` — 50/50, H2 **0.00 % on all 8 states** vs the
> re-baselined `8f6d60c`, so these frames ARE the approved baselines. (The dispatching session re-seeded and
> re-ran THE EYE before dispatch because the prior dump predated the last commit.)
> Live drive by the proxy: review-site on :8199, Playwright, 8 states walked, canvas sliders dragged in S5/S8,
> explore run to ~20 s, `__pmDebug.readouts` read at every state. Zero console/page errors. Queue: 879 rows.

**Verdict: `APPROVE`** — authoring sign-off only. **0 × P1** · 3 × P2 (all ride-along) · 8 × P3.
Five `FIX(engine)` findings, all ride-along. **Nothing here authorises shipping; Rule 17 untouched.**

**Justification.** All six cycle-1 items landed, each verified against pixels rather than the commit message.
Both gridline strikethroughs are gone (S5 label bottom 505 vs y=−2 gridline 513 = 8 px; S6 chip ink top 183 vs
y=3 gridline 179 = 4 px — *not* the 8.5 px claimed, but three clear rows and no strike). The label-column
relocation is **structural, not tuned**: 176 dense + 8 frozen + 5 keyframes scanned for curve ink inside the five
label boxes → **zero occlusion events**, including at both previously-worst offenders (STATE_2 t≈12–14 s and
STATE_8's every-ping-pong recurrence). The ladder now renders at byte-identical positions in all eight states —
Rule 32d on the scale ladder is perfect. P2-D closed across all six surfaces that repeat the claim.

**The honest reason for APPROVE rather than a fourth cycle: the residue is no longer in the authoring.** The three
remaining content items are one y-coordinate, one readout format, one word. Everything substantive — gridlines
over overlay text, curves cutting readouts, x-tick labels buried, the explore peer-dim, the slider-caption ASCII
hyphen — lives in `parametric_renderer.ts`, outside `alex:*` authority. A fourth authoring cycle has nothing to
bite on. Not a speed call: the concept's ceiling **under loop authority** has been reached.

**On escalation, since it was asked for by name.** Even with a P1 the proxy would not have escalated on the
budget trigger: escalation would mean *"the loop cannot fix this, hand the founder a decision"* — and the founder
already **has** that decision, in the engine queue. Parking the concept would withhold a good sim while changing
nothing about the engine work.

**Two errors of the proxy's own, stated up front.** (1) At cycle 1 it wrote it had "script-verified these are the
only two cases across all 8 states" — that script tested only *horizontal* gridline rows and never vertical
columns. The residual the dispatching session found at 4× is the same "searched the wrong space" error the proxy
criticised the fix agent for at cycle 1. (2) Its cycle-0 P3-5 (name the anonymous pen readout) made the STATE_1
readout 48 px wider and pushed it to 1 px from the canvas edge — P2-β below.

---

## PASS 1 — RATCHET over all ten rows the proxy filed at cycles 0 and 1

| # | bug_class | now | evidence |
|---|---|---|---|
| 1 | `axis_declutter_sets_tick_labels_to_none…` | **CLOSABLE** | 5-row ladder, byte-identical in all 8 states (x 157–171; rows 178/245/312/446/513) |
| 2 | `readout_format_drops_the_point_name…` | **CLOSABLE** | `P′ =` in all 7; the last anonymous readout (S1 pen) named this cycle |
| 3 | `state_title_asserts_a_sequence…` | **CLOSABLE** | S4 title matches the sweep *and* the pin now renders both halves of it |
| 4 | `rule_chip_generalises_shift_direction_language…` | **CLOSABLE** | verified across all six surfaces incl. `aha_moment.statement` + 2 assessment items |
| 5 | `tts_sentence_glow_channel_unused…` | instance closed, **ROW NOT closable** | 20/20 bound here, but the row's scope is the SUBJECT namespace; drop this concept from `concepts_affected`, keep OPEN |
| 6 | `schema_requires_a_focal_primitive…` | **NOT closable** | S8's `P′` still visibly dimmer than S1's — engine E2 |
| 7 | `raising_gridline_contrast…strikethrough` | **NOT closable; title too narrow** | horizontal half fixed; the same mechanism still cuts every overlay *vertically* in all 8 states |
| 8 | `axis_scale_labels_placed_inside_the_plotted_band…` | **CLOSABLE** | zero curve ink across 189 frames; labels at data x=−6.9, outside every `function_plot` domain |
| 9 | `choreography_holds_shift_every_downstream_ms…` | incident **CLOSABLE**, keep as prevention | pin verified at settled rest; the class is a standing trap → convert to `probe_definition` |
| 10 | `a_claim_corrected_on_one_surface_is_left_standing_on_its_sibling` | **RECURRED — bump + rescope** | twice, both engine-side: `PM_fmtNum` not wired at the slider caption (`:5077`); the ASCII `-0` guard that could never match U+2212 |

**Engine round PR #59 — honest scoring.** Four sub-rows correctly `FIXED`, and **the umbrella row correctly left
OPEN**. The proxy notes this explicitly: the engine agent closed what it built and did not close the class it did
not solve.

## PER-STATE (all 8; every `correct_YN = Y`, re-derived at pins and under live drive)

| state | note | pri |
|---|---|---|
| S1 The Parent Curve | pen readout cut by curve, x-axis and the x=6 gridline; right edge **1 px** from the canvas edge | **P2** |
| S2 Add k | readout crossed by the curve at "(1.57," | P3 |
| S3 Subtract h Inside | x-tick numbers — which this state's whole claim is read against — chewed by all three curves (E3) | P3 |
| S4 Multiply by a | **none new — the best archive frame in the concept** | — |
| S5 Multiply x by b | vertical gridlines through the bracket label; curve through the readout; "width" where every board says "period" | P3 |
| S6 Outside/Inside | the restored "3" scale row sits on the aha sentence ("³inside"); 4 vertical gridlines through the chip; curve erases the "=" | **P2** |
| S7 Where One Point Lands | vertical gridlines through two of four chips | P3 |
| S8 Explore | the only numeric instrument (P′) peer-dimmed while the teacher drags (E2) | P3 |

Values re-derived independently: S1 sin(6.5)=0.2151→`0.22` · S2 P′=(1.57,2.00) · S3 h=0.71→(2.28,1.00) ·
S4 a=−2→(1.57,−2.00) · S5 bracket 231 px = 3.157 u vs 3.142 (0.5 %) · S6 (1.79,2.50) · S7 all four chips exact ·
S8 live drag to b=3,h=2 → `(2.52, 1.50)` = (π/6+2, 1·1+0.5) ✓. **No physics/mathematics doubt anywhere.**

## RULINGS REQUESTED

**1. The vertical-gridline residual — real, correctly disclosed, correctly NOT blocking.** Measured across every
overlay in all 8 states (S6 chips at x=229.5/303/376/449.5; S5 `bracket_label` at 3 columns; **and the `P′` readout
in every state**) — fleet-wide, not a STATE_6 residual, and the cycle-1 P1 rotated 90°. **It is engine, not content,
decisively: gridlines are 73 px apart and the readout box is 87 px wide, so no placement can avoid them** —
obstacle-avoidance is structurally incapable, and the readout moves with the point so it can never leave the grid.
A content workaround exists for the *static* chips only; taking it would leave the readouts broken, so it was
declined per the PRIME DIRECTIVE. Severity rests on one distinction: a vertical stroke *between* characters is
noise; a horizontal stroke *through* them reads as "cancelled".

**2. `eye_capture_ms` 16000 — better than the proxy's own prescription, and it withdraws the 10500 suggestion.**
At 10500 the frame shows a=−1: flipped, same height — *half* the title. At 16000: a=−2.0, curve exactly inverted
against the parent, peaks on the labelled `2`/`−2` rows, `P′ = (1.57, −2.00)` with the dot on the −2 gridline.
Both halves of "Flipped, Then Twice as Tall" from one still. Re-derivation confirmed (1500 + 8000 + 2000 + 4000 =
15500, +500 ms rest).

**3. P2-D — fully discharged, sweep complete.** "inverted" survives nowhere. All six surfaces agree, and the claim
is **true for every parameter it covers**: a→×a as written; k→+k as written; b→written ×b, graph ÷b; h→written −h,
graph +h.

**4. E4 — NOT closable. One surface of four still leaks.** `PM_fmtNum` is wired at readout (`:3560`), tangent
(`:4146`) and tick (`:2149`) paths — **not** at the slider caption (`parametric_renderer.ts:5077`). Rendered proof
on one frame: `STATE_4__frozen.png` carries `−2` (edge label), `−2.00` (readout) and `a: -2.0` (**ASCII**)
simultaneously. Fleet-wide on every PCPL concept with a negative-capable slider.

**5. E3 — confirmed not built; the proxy holds it where it put it.** Draw order verified in source (tick labels
`:2384`/`:2399` Pass 0.25 vs `drawFunctionPlot` Pass 0.3). Visible in `STATE_3__frozen.png`: `−6` and `−5`
substantially erased on the one state whose claim must be read off those numbers. **The proxy explicitly declines
the available temptation to raise this to P1 at the last cycle** — the pixels are identical to cycle 1, when it
judged P3 on the same evidence. *"Grade discipline runs both ways — I must not raise a severity at the last cycle
any more than I may lower one to reach APPROVE."* It remains the finding it would fix first.

**6. The dead-gate episode.** One half is already filed (`check_cartesian_plane_sign_parsing_is_ascii_only…`,
FIXED). The other half is filed nowhere in 879 rows: **a gate outside CI died at load and reported green by
absence** for ~2 h. Every gate-blindness row in the queue is about a gate that ran and looked at the wrong thing;
none about a gate that never started. New row minted.

**7. Stale TTS clip — not a shipping blocker, but do not leave it as-is.** Hash-verified: exactly one stale clip,
`s6_1_en` (121 rendered chars vs 110 authored); `s8_1_en` correctly `available:false`. **But a stale clip is worse
than a missing one:** missing = silence = the default; stale = the aha state *speaking the exact sentence this
cycle fixed* while the chip 26 px above reads the corrected wording. Zero-cost interim: drop the `s6_1_en` entry
from `audio_manifest.json` so that state falls back to silence. *"Silence is correct by default; wrong words are
not."*

## FINDINGS — P2 (all ride-along, each defended as polish with its one-line remedy)

- **P2-α · STATE_6: the restored "3" scale row lands on the aha sentence.** Label ink x161–167 y174–183 vs
  `chip_inside` ink x143–465 y183–198 — sharing row 183, reading as "³inside". The "3" renders 39 grey px in S6
  vs 41 elsewhere. **Root cause is process:** cycle 1 said S6's omission was *justified* and only S7's was not; the
  fix restored both while the chip had simultaneously moved down 11.5 px onto that row — a uniformity fix
  over-applied to the one member the finding explicitly excepted. Fix: `chip_inside.position.y` 132 → ~137.
- **P2-β · STATE_1: naming the pen readout pushed it into the busiest square inch — the proxy's own cycle-0
  prescription's fault.** `(x, y) = (6.50, 0.22)` renders x 1040–1188 on a 1189 px canvas (**1 px from clipping**),
  cut by curve, axis and gridline. Options: revert to `"({x}, {y})"`, shorten to `"pen ({x}, {y})"`, or stop the
  `xdraw` sweep at 6.2.
- **P2-γ · the `s6_1` clip speaks the sentence this cycle fixed** — ruling 7 above.

## P3 (8)

Vertical gridlines over all overlay text (E5) · curve still cuts `P′` in 6 states despite PR #59 (E1; hardest:
S6, 105 px of `#38BDF8` inside the readout bbox, erasing the "=") · x-ticks buried (E3) · slider ASCII hyphen (E4) ·
explore peer-dim (E2) · **Rule 38d: `width = 2π/b` where every board — and this concept's own `mastery_definition`
— says *period*** (passed over at cycles 0 and 1; raised now as a note, not a verdict input) · no `text_hi`
(Rule 30i FYI) · **checked and cleared so nobody reopens it:** S3's guess curve genuinely IS dashed
(`setLineDash([7.5,6])`, run pattern verified at column 900) — it merely reads near-solid at 1×.

## ENGINE QUEUE — five, all ride-along

| # | finding | owner |
|---|---|---|
| **E5 (new)** | **Plane gridlines draw above every canvas text overlay, so no placement can avoid them.** Grid Pass 0.25 vs overlay text Pass 3. 73 px pitch vs 87 px readout box. Correct fix: a scrim/halo behind canvas text, or a grid-under-text compositing pass — **never** a placement remedy. | `peter_parker:renderer_primitives` |
| **E1 (carried, 3rd cycle)** | Sibling curve ink still crosses the readout at the pin after PR #59. Resolver IS running (`__pmDebug` reports resolved −6 vs authored +6) but its chosen candidate still lands on the curve — either polylines aren't reaching the obstacle set, or every candidate overlaps and it silently returns least-bad. **Expectation: report `resolvedClean: false` so the failure is observable rather than silent.** | `peter_parker:renderer_primitives` |
| **E3 (carried)** | Tick labels drawn before curves. Correctly not built — needs a founder re-baseline sweep. Still the strongest remaining defect. | `peter_parker:renderer_primitives` |
| **E4 (carried, partial)** | `PM_fmtNum` not wired at the slider caption (`:5077`). Fleet-wide. | `peter_parker:renderer_primitives` |
| **E2 (carried)** | Schema requires non-empty `focal_primitive_id`, so an explore sandbox can't reach the renderer's no-dim path. | `peter_parker:renderer_primitives` (+ `alex:architect`) |

## THE APPROVE LIST — what ships unfixed

**Content (`alex:json_author`), ~10 min + a re-baseline, all overrulable for one number each:**
P2-α `chip_inside.position.y` 132→~137 · P2-β the STATE_1 pen readout format/anchor · P3-6 `width`→`period`.
**Audio:** `s6_1_en` stale — drop the manifest entry now, re-voice at chapter end.
**Engine (none fixable by this loop):** E5 · E1 · E3 (**needs the founder's re-baseline decision**) · E4 · E2.

```
RUBRIC (advisory, unratified; did NOT affect the verdict)
  D1 2 · D2 2 · D3 2 · D4 2 · D5 1 · D6 2 · D7 2 · D8 2 · D9 1 · D10 2 = 18/20
  (cycle 0: 12/20 · cycle 1: 15/20)
  weakest: D5 — the plane IS the apparatus and its grid draws over every text overlay, its
           x-ticks are buried under the curves, its live readout is cut by the curve it rides
           D9 — "width" where every syllabus, and this concept's own mastery_definition, says "period"
```

## SELF-REVIEW (proxy's own)

Zero authoring P1s; both prior P1s verified discharged at pixel level, neither recurred. **No P1 lowered to reach
APPROVE**, and the available temptation to *raise* E3 to P1 at the last cycle was explicitly declined on evidence
unchanged since cycle 1. Every P2 defended in writing as polish with its remedy. No `alex:*` FIX routing issued;
all five `peter_parker:*` findings are queue ride-alongs. **Nobody dispatched, nothing edited, no SQL applied,
`visual:approve` untouched.** Zoom rule honoured — two of the three P2s are invisible at 1×. Pass 1 ran over all
ten of the proxy's own rows plus nine pre-existing classes, each named with how it was checked; one recurrence
found and reported rather than absorbed. Rule 38 checked in full (38d gap filed as P3-6); Rule 39 N/A. Rule 31
word budgets re-counted 33–41, all inside 25–55. Rules 26/36/37 verified live. Two findings originate in the
proxy's own prescriptions; both labelled as its own.
