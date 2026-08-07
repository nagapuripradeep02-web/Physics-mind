# FOUNDER_PROXY — CHECKPOINT B (BUILD GATE) — `derivative_as_secant_limit`

> Dispatch context (recorded by the dispatching session, 2026-08-07): retroactive Checkpoint B,
> founder-ordered — the concept was already merged (PR #50) and its 9 baselines founder-approved
> before this gate ran. A FIX here means a follow-up branch + `visual:approve` re-baseline, not a
> revert. Frame dump walked: `.visual_runs/derivative_as_secant_limit/20260807-154027/` plus the
> proxy's own live-drive probes. The dispatching session independently re-verified both P1s
> (STATE_8 frozen: two identical unlabelled teal dots, no connector, no number; `s7_lim_zoom.png`:
> `lim` + subscript h + FULL-SIZE arrow + subscript 0) before committing this report.

**Verdict: `FIX`** — 2 × P1 · 9 × P2 · 6 × P3. Cycle 0. Two `FIX(engine)` findings, both **ride-along**.

**Justification.** A strong concept — the best-composed arc yet reviewed on the `cartesian_plane`
engine: perfect home-pose continuity across nine states, the equal-scale fix from Checkpoint A means
picture and numbers agree, three misconception beats at three genuine pivots, every displayed number
algebraically exact, and the explore state verified LIVE to genuinely teach (drag Q past P → h goes
negative while the chord slope tracks (x₀+x_q)/2 and the tangent holds). The mathematics block is the
most rigorous domain-and-validity ledger this pipeline has produced. It fails on two states:

- **P1 F-1 · STATE_8 — the payoff state does not draw its own claim.** The state where the
  derivative becomes a *function* (and the bridge to the two concepts naming this one as a
  prerequisite) renders two identical unlabelled teal dots 32 px apart, **no connector** between the
  curve point and the height it becomes, **no number anywhere in the state** (no readout, no
  `text_expr`, no chip — the only numeric surface is the `f′(x) = x` box at 17 000 ms), and the
  point whose slope is the story dimmed to 0.6α for all 24 s. Cue says "Slopes drawn as heights";
  nothing draws that link. First 6 s of the sweep: a lone teal dot in an empty quadrant
  (`fprime_trace` has zero length until the sweep runs). Manifest D5: max adjacent diff 0.17 %/s,
  lowest of all nine states. Named recurrence of OPEN row
  `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders`. Everything needed is in the
  primitive vocabulary already used: a dashed `vector` (u, u²/2)→(u, u), a `label` on the trace, a
  live slope chip. **Owner: `alex:json_author`.**
- **P1 F-2 · STATE_7 — `limₕ→₀` renders as malformed notation.** Subscript *h*, **full-size** →,
  subscript ₀ — three type sizes on one operator; invisible at 1×, obvious at 4×. There is no
  Unicode subscript arrow, so the construction was doomed at authoring time. This is the concept's
  ONLY formal-limit surface and the sole content of the 38c ladder's advanced step. Content fix
  available today (stacked construction / explicit "as h → 0" line); the long-term answer is engine
  E-1 — do not wait for it. **Owner: `alex:json_author`.** Secondary at the same zoom: the
  `x₀ = 1.00` chip's subscript sits so low it reads as a comma at 1×.

**Founder's question answered: both OPEN engine rows are acceptable-to-teach-with; neither blocks.**
Every primary teaching number renders on clean background in every state; what sibling ink strikes is
always a secondary coordinate readout (Q's `=` on S3, Q's glyph on S2/S9, `y = x²/2` on S2/S7). BUT —
new evidence raising row 2's priority: **in the explore state, dragging Q toward P (the exact
manoeuvre the state exists for) parks Q's readout on P's marker and destroys Q's x-coordinate**
(`s9_drag_zoom.png`) — the steady state of teacher use, not a frozen-frame artefact. Mechanism read
for the engine agent: `PM_readoutDangerZones` (`parametric_renderer.ts:3335–3346`) returns exactly
two rects (axis label bands) and knows nothing of curves, lines, markers or other readouts.
**Hand-placement is at its limit on this concept** — three placements were relocated during fix
rounds, each `_design_note` doing the solver's job by hand. Recommendation: do not ship a third
`cartesian_plane` concept before these rows close.

---

## PER-STATE TABLE (condensed; full table in the dispatch transcript)

| state | verdict | problem_or_missing | pri |
|---|---|---|---|
| S1 The Curve and One Point | Y | `y = x²/2` printed twice (curve label + formula box) on the emptiest frame — Rule 34b | P2 F-9 |
| S2 A Chord Through Two Points | Y | `run = h = 1.000` sits below the x-axis ~110 px from its segment (reads as an axis caption); `slope = 1.5000` live 8.5 s before the run/rise that explain it | P2 F-10/F-12 |
| S3 The Second Point Slides Closer (AHA) | Y | Q's `=` struck (known OPEN row) — but offset `{12,−30}` AIMS INTO the rising curve; left-side offset clears it with no engine work | P2 F-11 |
| S4 At h = 0 There Is No Chord | Y | Cue `h = 0: no chord` false for the first 13.5 s of 24 while a chord plainly rotates; `f(·)`/`x₀` introduced on a CORE state grounded only on advanced S7 (38a ring-cut → Cambridge 0606 / IB AA SL presets) | P2 F-3/F-4 |
| S5 The Tangent: One Line Remains | Y | The chord's readout never says "chord" — orphaned number under the tangent's named label, on the state whose claim is chord ≠ tangent; `secant_line.readout.offset` is authorable now, so pure authoring | P2 F-5 |
| S6 A Different Point, a Different Slope | Y | best teacher state; `−0` clamp missing on tan_label but unreachable by hand (~23 ms mid-sweep; drag quantised) | P3 F-13 |
| S7 The Algebra Behind the Number | **P1** | malformed `limₕ→₀` (F-2); static plane 24 s while cue+narration promise a shrink (F-6); "cost of the gap" metaphor (Rule 41a, F-8) | P1/P2 |
| S8 Every Slope Collected: a New Function | **P1** | the state's one idea is not drawn (F-1); narration names internal sweep variable `u` that no primitive labels (F-7); `ghost_fprime` reveals on top of the already-drawn trace (F-17) | P1/P2/P3 |
| S9 Explore: Drag Both Points | Y | dragging Q toward P destroys Q's readout on P's marker — the state's own target pose (F-11 worst case); 2 sentences shipped vs the block's specified 0 (F-16) | P2/P3 |

Live-drive pass (proxy's own, no `.founder_runs` dump existed): zero console/page errors; Rule 37
verified (explore keeps moving); both drags numerically exact (Q→0.19 ⇒ slope 0.5954 = (1.00+0.19)/2;
P→−1.13 ⇒ `slope at P = −1.13`, correct Unicode minus). Standing caveat honoured: OPEN row
`pcpl_state_level_once_choreography_skips_the_d5_motion_gate` means THE EYE's 56/56 is NOT motion
coverage — D5 skipped on states 1–8; motion judged from contact sheets and live probes.

## FINDINGS SUMMARY (owners)

- **P1 F-1** STATE_8 draws two identical markers, no connector/label/number — `alex:json_author`
- **P1 F-2** malformed `limₕ→₀` — `alex:json_author` (long-term: engine E-1)
- **P2 F-3** S4 cue false for 56 % of its state — `alex:architect`
- **P2 F-4** `f(·)`/`x₀` on core S4 grounded only on advanced S7 (38a) — `alex:json_author`
- **P2 F-5** S5 chord readout unnamed — `alex:json_author`
- **P2 F-6** S7 static while cue promises motion (cheapest: sweep h 0.800→0.020 under the algebra) — `alex:json_author`
- **P2 F-7** narration names internal variable `u` — `alex:mathematics_author`
- **P2 F-8** "cost of the gap" metaphor — `alex:mathematics_author`
- **P2 F-9** S1 same equation on two surfaces — `alex:json_author`
- **P2 F-10** S2 run label below the axis; vacate P's readout offset instead — `alex:json_author`
- **P2 F-11** Q's offset `{12,−30}` aims into the curve in S2/S3/S9; worst case teacher-reachable — `alex:json_author`
- **P2 F-12** derived number precedes its evidence (readout has no independent reveal gate) — engine E-2, ride-along
- **P3** F-13 −0 clamp (close on next touch) · F-14 "open the gap again" direction word · F-15 "then stops" vs the limit · F-16 explore narration deviation · F-17 invisible ghost reveal · **F-18 doctrine**: CBSE tag `verified: true` off the author's own reading — **14 concepts fleet-wide do the same; founder ruling requested, routed to nobody**

Rulings requested by upstream, answered: block FLAG 1 (S5 focal) — accepted as authored, no finding;
FLAG 2 (S2 dual-labels) — discharged, relocation verified; FLAG 3 (S9 no focal) — explore-exempt.

## ENGINE QUEUE (both ride-along; nothing gates APPROVE)

- **E-1 `formula_box` cannot render a two-level limit/sum/integral operator** — `peter_parker:renderer_primitives`.
  `drawFormulaBox` is single-baseline. Spec surface: `equation_parts: [{op:'lim', under:'h → 0'}]` or a
  recognised `\lim_{h→0}` escape. Probe: arrow glyph's rendered size equals the under-line size and its
  baseline sits below `lim`. Why engine: three of the four next ranked mathematics concepts need this
  glyph (`definite_integral_as_area`, `differential_equation_slope_fields`, any limits concept).
- **E-2 a primitive's readout has no independent reveal gate** — `peter_parker:renderer_primitives`.
  `drawSecantLine`@4110–4133 / `drawTangentLine`@4173–4189: the readout rides the primitive's own
  `PM_animationGate`. Spec: `readout: { appear_at_ms, animate_in_ms }`. Closes the FIXED
  `bonding_scene_answer_shown_before_its_setup` prevention rule for the PCPL family. The content
  workaround (a second shadowing `secant_line`) would itself be a finding.
- Recorded, not built: `drawVector`'s embedded label has no offset control (forced S2's run label
  below the axis) — recommend an exclusion-ledger entry, not a purchase; F-10's content fix suffices.

## SCAR ROWS

Six actions filed by the dispatching session via
`src/scripts/_seed_engine_bug_queue_derivative_checkpointB.ts` (insert-only + one targeted
concepts_affected append on the existing row `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders`):

1. `derived_curve_state_draws_two_identical_markers_with_no_connector_label_or_number` — CRITICAL, `alex:json_author`
2. `unicode_subscripts_cannot_express_a_two_level_limit_so_lim_h_to_0_renders_with_a_full_size_arrow` — CRITICAL, `alex:json_author`
3. `delta_cue_asserts_the_states_end_condition_so_it_is_false_while_most_of_the_state_plays` — MAJOR, `alex:architect`
4. `readout_offset_authored_from_one_sample_aims_the_text_into_the_curve_the_point_rides` — MAJOR, `alex:json_author`
5. `narration_names_an_internal_choreography_variable_that_no_primitive_labels` — MAJOR, `alex:mathematics_author`
6. `the_same_equation_string_is_printed_on_both_a_plane_label_and_the_formula_box` — MODERATE, `alex:json_author`

## RATCHET (Pass 1)

Recurrences found — 3: `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` (OPEN →
bites STATE_8, feeds F-1); `narration_names_a_reference_line_the_scene_never_draws` (FIXED → sibling
recurrence as F-7, symbol not line); `parametric_canvas_drawn_readout_overprints_its_own_line…`
(FIXED in code and working — its standing AUTHORING clause "choose the offset by reading frames
across the control range" was not followed for Q → F-11). Thirteen further classes checked by name
and clear (list in the dispatch transcript). Rule 38 checked in full: 38a coherent except F-4; 38b/c/d/f
clean; 38g the best execution reviewed to date, F-18 excepted. Rule 39 N/A (all-canvas concept).

## FIVE FRAMES FIRST

1. `.visual_runs/derivative_as_secant_limit/20260807-154027/STATE_8__frozen.png` — the P1: two identical dots, no connector, no number.
2. scratchpad `s7_lim_zoom.png` — the other P1 at 4×.
3. scratchpad `s9_drag_zoom.png` — Q's x destroyed by P's marker in the explore state's target pose.
4. `.visual_runs/.../STATE_4__contact_sheet.png` — the cue contradiction, and the numeric ladder working.
5. scratchpad `probe_S6_after_drag.png` — the concept at its best: P at −1.13, tangent down, exact readout.

```
RUBRIC (advisory, unratified; did not affect the verdict)
  D1 2 · D2 2 · D3 1 · D4 1 · D5 1 · D6 1 · D7 1 · D8 2 · D9 1 · D10 2 = 14/20
  weakest: D6 (STATE_8 renders no number at all) · D7 (S2/S7 reveal-only; S8 lowest motion of nine)
  D3 note: 0 of 26 sentences glow-bound — subject-wide (all three mathematics concepts at zero
  vs 18/18 and 16/16 on faraday_law_induction / resistivity).
```

## FLAGGED FORWARD

Professor gate (Asmi) is stage ④. If the two P1s are not fixed first, she spends a scarce human gate
on `limₕ→₀` and on asking what the two green dots are. Recommendation (non-binding): land the FIX
round and re-baseline BEFORE stage ④; hold TTS until after her pass per Rule 30h regardless.
