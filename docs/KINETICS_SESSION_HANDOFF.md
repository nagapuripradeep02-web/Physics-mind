# Chemistry kinetics pair — session handoff (2026-08-07/08)

Desk: worktree `Viditra-chemistry-kinetics`, branch `feat/chemistry-kinetics`, off master `b0ebd33`. Port 3006.
Concepts: `rate_of_reaction` (7 states) + `rate_law_and_order` (11 states), NCERT Cl.12 Ch.3 Chemical Kinetics,
`particle_field` / `gas_box`. Chosen because that engine is the only one no other desk touches — `field_3d`
(periodicity, bonding, rotmech) and `parametric` (mathematics) were never opened.

## Status

| Stage | State |
|---|---|
| Design, both concepts | ✅ 3 cycles through founder_proxy Checkpoint A |
| Engine — kinetics instrument | ✅ built (~1400 insertions, one file) |
| Chemistry blocks | ✅ every DQ measured on the real engine |
| Concept JSONs | ✅ 12/12 `validate:chemistry` PASS, tsc clean, 0 word-budget warnings |
| THE EYE | ✅ 31/31 and 47/47 deterministic |
| eye-walker ×2 · quality-auditor ×2 | ❌ **both concepts FAIL** — see below |
| Engine fix round | 🔄 in flight (clock ordering · converge-drives-fit · repeat-run averaging) |
| Scar rows filed | **22** |

## The blocker, stated plainly

**The gas box cannot separate ×1 from ×2 at this event density.** Measured on the assembled build, 10 seeds:
`rate_law_and_order` S2's ratio spans **1.12–4.78** (must read ~2); S5's null spans **0.52–3.90** (must read ~1).
At ~6–10 reaction events per 2 s window this is Poisson noise, not a tuning miss. The design's own DQ-1 ladder
terminates here — *"if neither clears → named BLOCKER to the founder, not a third instrument."*

Rungs already closed: widening the window is capped by the ≤10% consumption honesty bound; raising density breaks
S5's inert null via the measured excluded-volume coupling (4% at N=180 → 20% at N=720); lowering the barrier burns
the box down in ~1 s and contradicts `collision_theory_activation_energy`'s narrated "a handful in a hundred".
**Seed selection was a fourth rung nobody put on the ladder** and it did not survive assembly.

**The rung never tried, now in flight: repeat the experiment.** Run each composition R times, fit each, report the
mean — noise falls as 1/√R. Pedagogically this is the method itself, not a workaround.

## Findings that must be closed before either concept ships

**Engine (in flight):**
1. **CRITICAL — phantom kinetics samples.** `resetToHomePose()` rebuilds the scene before zeroing `PM_simTimeMs`,
   so 55 settle samples carry the PREVIOUS state's clock. The displayed ratio therefore depends on how long the
   teacher lingered on the previous state: S2's primary aha reads ×1.24 / ×2.75 / **×0.03** at dwells of
   1000 / 3500 / 4500 ms. THE EYE is orthogonal to this — it pins one sequence and faithfully reproduces one
   arbitrary point of the family. **Reproducible ≠ correct.**
2. **`converge_from` is cosmetic** — it animates the drawn edges while the fit reads a fixed window, so the chip
   prints a partial fit that swings 20.0 → 23.5 → 16.6 under narration reading "it holds steady", then freezes for
   16 s after the shrink ends. The honest monotonic settle (18.87 → 16.61) already exists on the teacher-drag path.
3. Sub-pixel dash on the coincident A/B curves — reads as one solid line at native projector scale.

**Authoring:**
4. `rate_of_reaction` ships `phys_seed: 246813579`, **invented, never measured** — while its sibling's was chosen by
   a 40-candidate joint search. Its S4 renders ~3:1 (or 2.2:1 off the frames) under narration saying "roughly four
   times slower".
5. **The window floor and the window centre were mutually unsatisfiable** — "no window before t0_ms 2000" and
   "±5 s about a centre at 5 s" cannot both hold; a ±5 s window centred at 5 s starts at zero. The measured floor
   should be ~8000 ms (the box is still +2.4% hot at 2 s), and the centre is the free variable.
6. `rate_of_reaction` S6's A↔AB mirror is an **identity**, not a measurement — `count(A) + count(AB)` is conserved
   by construction, so no authored parameter can falsify it. The notation teaching is sound; the "measured" framing
   is not.
7. Rule 38b ring leak: S7 (core) narration references extended-ring content ("shrink it to settle on an instant").
8. Rule 41 hit: `rate_law_and_order` s11_2 "watch the rate **answer**" — on the explicit ban list.
9. Stale `authoring_notes` in both JSONs describing defects that are now FIXED (`na_nb_engine_gap`, the rate_A chip
   note at `rate_of_reaction.json:176`). A note describing a live defect is a bug report; a note describing a fixed
   one is a trap for the next author.

**Design (needs a founder/architect ruling, NOT a text edit):**
10. **`rate_law_and_order`'s misconception refutation does not land.** The belief is "the coefficients give the
    order". S2/S3/S4 each end on a measured number that agrees exactly with the coefficients — three core states,
    ~54 s, confirming the belief. S8 refutes a *different* proposition: it shows a MEASUREMENT failing when taken at
    the wrong time, so a student concludes the equation was reliable and the experiment was not. It strengthens the
    belief. The whole refutation rests on two narrated assertions with no instrument behind them. The architect's
    own §4 names the honest resolution: demote the coefficients contrast to a narrated caveat and re-aim the primary
    aha at "the exponent is a measured number", without staging a refusal the data contradicts.

## The lesson this desk paid for

Every defect that mattered was invisible to the automated gates. Both concepts passed `tsc`, passed
`validate:chemistry` with zero warnings, and passed THE EYE's deterministic checks (31/31 and 47/47) while
containing: a chip printing a negative rate on the concept teaching that rates are positive; a "watch it hold
steady" state whose number swung by 14×; a re-seed that sprang back inside its own measuring window; a piston
comparison reading ×1.10 under a ×4 caption; a slider wired to nothing; a thermometer frozen at 300 K through the
state about heating; and a primary aha whose value depended on how long the teacher lingered on the previous slide.

They were found by measuring the engine, by reading the rendered pixels, and by agents who read the code instead of
trusting the document handed to them. **Green gates are a licence to start looking.**

Three of the authoring defects were the dispatching session's own: the unsatisfiable window constraint, the seed
allowed to ship unmeasured on one concept after insisting on a measured one for its sibling, and a stale note left
behind by a cleanup that removed two others on the same file.

## UPDATE 2026-08-09 — the founder said "fix all of those"; here is what changed

**Both concepts now validate green** (12/12 PASS, tsc 0, zero word-budget warnings) and both review sites build.
**28 scar rows** filed. Engine PR **#71** is open on master but predates the 2026-08-09 renderer pass — **fold today's
three renderer fixes into it before it merges.**

**Root cause found for every harness-vs-render divergence this session:** `design.fill_viewport` is true and the
canvas IS the browser viewport, so box area — hence density, hence any depletion-derived rate — is set by the
teacher's screen. Measured S4 ratio: 2.40:1 at 1280×720, 2.00:1 at 1440×900, 2.39:1 at 1920×1080, 1.79:1 at
1024×768, 3.35:1 only at the authored-but-unused 900×560. **No fitted-slope ratio can be narrated on this engine.**
Ratios comparing two runs at the SAME viewport (the sibling's run-pairs) are unaffected — area cancels.

**`rate_of_reaction` (7 states):** S4 re-aimed off the fitted slope onto PARTICLE COUNTS (360 → ~117), which are
authored and screen-independent, and which is what its aha sentence already claimed. All screen-dependent numeric
claims purged from the file. S5's window centre moved to 7000 ms so the floor is satisfiable, and its reveal is now
cue-gated at 12000 ms — proven, not tuned: the animated right edge is ≤ 12000 for every frame, so the window is
guaranteed closed. S2's narration rewritten to describe what renders (pink over blue, 1:1 consumption) rather than a
dash. Presets authored. Slider default aligned.

**`rate_law_and_order` (10 states, was 11):** the measured calibration is authored — baseline A90/B360, quadruple
the varied reactant to 360, 350 ms windows, R=3, cue at 2500 ms. Quadrupling replaced doubling because ×2 vs ×1 is
inside the noise floor and ×4 vs ×1 is not. **STATE_8 was DELETED under the design's own §4/DQ-2 named fallback** —
its counterexample was swept across 40+ configurations (AB 10–200, windows 350–1000 ms, R up to 20) and never
separated from the fresh-box reference without blowing up near equilibrium. The cause is structural: forward rate
goes as N_A·N_B while the reverse step is first-order in AB alone, so a large B dominates unless AB sits near the
crossover — exactly where an initial-rate measurement stops being well-posed. Its assessment item and its multi-step
caveat survive in S2. **The concept therefore teaches order as a measured quantity but no longer claims to refute
"the coefficients give you the order" — a smaller promise than Checkpoint A approved, and the true one.**

**Renderer:** the chip no longer prints from an unfilled window and the chord no longer draws past real data (this
is what made S5's caption false); the coincident-series dash is chosen by stoichiometric role rather than list
position, so the PRODUCT can never be the dashed curve, and is legible at 1×; sliders display seconds.

**TWO SHIPPED BASELINES MOVED** — `dynamic_equilibrium` (0.06–0.09%) and `le_chateliers_principle` (0.07–0.12%),
caused entirely by the dash fix, all 194 checks passing, well under the 2% gate. **NOT re-approved — founder call.**

**Known remaining:** neither concept has had a frame-read since these changes (every prior pass found 3–4 real
defects that passed all gates); `rate_of_reaction` S4 asserts "a much smaller number" a few seconds before the late
window can print one — early, never wrong.

## Next actions, in order

1. Land the engine fix round (in flight), including the R = 1/3/5 spread measurement on S2 and S5. **If ×2 is still
   not reliably distinguishable from ×1 at R = 5, that is a finding about this engine's suitability for quantitative
   ratio teaching — bring it to the founder rather than attempting a fifth rung.**
2. Founder/architect ruling on finding 10 (the misconception arc).
3. Re-measure BOTH concepts' seeds and narrated ratios **against the rendered chips**, not a harness — three
   measurement contexts have now disagreed on the same concept at the same seed (18.7 / 16.61 / 12.93).
4. Fix findings 4–9, re-run THE EYE, re-run eye-walker + quality-auditor.
5. Rule 40: the renderer change is ~1400 insertions in one file with the legacy draw path untouched — land it on
   master as its own PR ahead of any chapter content. All four locked gas_box baselines have held at 0.00% diff
   through every engine pass so far.

Nothing has been staged, committed, approved, or shipped. `visual:approve` has not been run.
