# Checkpoint A — `conservative_vs_nonconservative_forces` (concept #5) — cycle 2 (FINAL)

**VERDICT: `DESIGN_OK`** · proceeds to physics-author · cycle 2 of 2 spent, checkpoint CLOSED.

The architect did the right thing. It rejected the cycle-0 F3 patch with arithmetic that is **correct at
source**, and the design it authored instead is the best one this engine can express. The residual — the
round-trip closure line is not in the H2 still — is a **verified engine limit, not an authoring failure**,
and the concept shows its claim without it.

---

## (1) The architect's rejection of the F3 patch — **it is right; the reviewer's patch was wrong**

Re-derived independently. S2 at the proposed `s₀ = +0.1, v₀ = 4, μ = 0.3, R = 2900`:

| quantity | cycle-0 patch | architect | re-derived at cycle 2 |
|---|---|---|---|
| a_up / a_down | — | 7.446 / 2.354 | 7.44611 / 2.353886 ✓ |
| d_up, t_r | 1493 ms | 1493 ms | 1.07441 m, **1492.6 ms** ✓ |
| v at recross | — | 2.249 | 2.24907 ✓ |
| tail τ | (not computed) | 1407 ms | **1407.4 ms** ✓ |
| tail travel D | (not computed) | 5.49 m | **5.496 m** ✓ |
| gravity ledger at loop end | **+15.4 J** | +134.6 J | 24.5 × 5.496 = **+134.6 J** ✓ |
| friction ledger at loop end | (not computed) | −97.3 J | −27.36 − 12.7306×5.496 = **−97.3 J** ✓ |

**The +15.4 J figure was evaluated at the pin instant (247 ms into a 1407 ms tail) and never carried to
the loop end. That is the error.** On a 70 J scale both ledgers pass `frac > 1` in `nlbUpdateWorkPanel`
(L46386–46398; prefix at L44851), so both bars sit **pinned at full deflection for the last ~1.1 s of
every cycle** — the gravity bar at full GREEN while the state's title says its round-trip total is zero.
That is precisely the `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` class F3 was written to
prevent. **The cycle-0 patch would have shipped the defect it was written to kill. The architect caught
it; the reviewer did not.**

Two secondary points also check out: the patch moved `initial_position_m` to +0.1, breaking the Rule-32d
shared home pose; and its loop end −5.39 sits 0.004 m inside the ±5.4 slab limit — under one frame of
travel at 5.5 m/s.

**One correction to the architect, on enforcement not substance.** It cited the contract comment at
L1871–1874 ("the same prefix THE EYE asserts zero of"). **That comment is false today** —
`nlbEnWarnOnce` uses `console.warn` (L44901), and every console capture in the repo filtered
`m.type() === 'error'` (`screenshotter.ts` L318, `founder_drive.ts` L111, `probeHarness.ts` L377).
Playwright types `console.warn` as `'warning'`. **No gate had ever seen `[PM_NLB_ENERGY_SCALE]` or
`[PM_NLB_ENERGY_CLAMP]`.** The rejection stands on the *rendering* defect (a clamped, unreadable bar),
which is real whether or not a gate catches it — but the enforcement claim was not. Scar row 1 filed.
*(Dispatching session note: this blind spot has since been closed on master — diagnostic `[PM_*]`
warnings are now captured into a separate `diagnostic_warnings` channel and written to the run manifest.)*

### The impossibility is structural — and STRONGER than the architect argued

The algebra is right: pin ≥ firing + margin ⇒ `0.6R ≥ t_r + 0.2` ⇒ `τ ≥ 0.667·t_r + 0.333 s`. The
scale-invariant form the architect did not write down: with `u = a·τ/v₀`, the tail-to-flight travel ratio
is `2u + u²`, and `u ≥ 1.333` for every launch (the +0.333 s constant makes **small** launches worse).

> **The post-closure tail is never shorter than ~4.4× the up-flight, for any mass, angle, μ or launch speed.**

Measured: 6.51× frictionless (S1), 4.72× at μ = 0.3 (S2). Avoiding the warn therefore requires
`work_scale_J ≈ 4–7×` the teaching peak, putting every taught number below ~10–20% of full deflection.

**The one escape the architect did not test is also closed.** Could the *track bound* truncate the tail
(block hits the wall at −6.0, ledgers cap at +58.8 / −57.9 J, both under 70, latch in the still)? No:
`nlbEnergyClampGuard` (L44669–44686) sets `eng.energy_held = true` — **the bars FREEZE** — and warns,
whenever a body reaches a bound while `energy_active`, which `work_accumulators` alone makes true
(L44504). A bound-truncated tail freezes the work bars and trips a filed OPEN directive
(`nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm`). The no-loop variant fails the
same way (the round trip requires μ < tan θ, so the block can never rest before the wall).

**Conclusion: there is no authoring configuration of this engine in which a closure stamp lands in the
0.60R frozen pin.**

---

## (2) The fallback — **ACCEPTABLE.** The still is silent on the number, not contradictory

**What the fix bought.** Cycle 0's defect was *quantitative*: the `0.0 J` reading existed ~1 ms per cycle,
~6% (S1) / ~11% (S2) of playthroughs. It is now a **latched text line, deterministic, every cycle,
217 / 207 ms** — a ~200× improvement, and the difference between "essentially unobservable" and
"observable". That is the substance of F3 and it is fixed.

**What cycle 0 got wrong.** It wrote that the frozen baselines "carry the OPPOSITE picture". Re-inspected,
they do not. S2's still (t = 2720, phase 1020) shows two red bars (−19.6, −17.2) and the pass-1 stamp —
the claim is **absent**, not contradicted. S1's still shows the bar at −34.8 J with the block visibly
above its start line mid-trip: **incomplete**, not contradicted. That is materially weaker than the
chapter's signature defect (#1 F11, #2 S4 shipped stills that *contradicted*). Overstated at cycle 0;
corrected here.

**What the still does carry, which neither agent stated.** `nlbMkLabel(id, e.label || ("point " + (c+1)))`
(L45566) — **the authored label IS the rendered 3D label.** So S1's and S2's stills each contain a
permanent, `depthTest:false` flag post at the launch line captioned **"back at the start"**, with the
block descending toward it and (S1) the `d` arrow at 1.42 m. The still carries the *structure* of the
round-trip claim; only the numeral is missing. And `nlbRenderStamps` skips unfired checkpoints
(`if (!cps[i].text) continue;`, L46267) — so S1's formula surface is clean, not a gap.

**The visible physical correlate, also unstated.** At the recross the gravity bar *passes through the zero
line* — red shrinking to nothing, green growing — and the latch fires at exactly that instant, so bar and
stamp read zero **together**. That crossing is a geometric event spanning hundreds of ms, not a 1 ms
numeral. Cycle 0 under-weighted it by judging only the rounded text.

**The honest weakness, named.** 207 ms is below the reading time of the latched line (~11 tokens, ~2–3 s
to read once). A teacher gets ~6 exposures per 10 s and cannot hold it (Pause hits the window ~12% of the
time). That is a real cost — and it is **fixable inside authoring** with no engine change (CF-2).

**Ruling.** The concept shows its own claim — live, deterministically, every cycle, on a labelled
instrument, with a visible bar crossing at the same instant. Rule 24 governs the sim read sound-off, not
the H2 artifact. The frozen-frame residual is routed as an engine ride-along (E1), not parked.

---

## (3) F2's correction, R 1350 → 1400 — **confirmed, the architect is right**

Re-derived from `deriveStateMeta.ts` L3097–3109:

| | R = 1350 (cycle 0) | R = 1400 (architect) |
|---|---|---|
| pin phase | 810 ms | 840 ms |
| pass-2 fires | 617.7 ms | 617.7 ms |
| margin raw | 192.3 ms | 222.3 ms |
| margin net of ≤33 ms discrete slack | **159 ms — under the 167 floor** ✗ | **189 ms** ✓ |
| loop end | −4.05 | −4.166 ✓ |
| friction extreme at reset | — | −22.6 J (32% of 70) ✓ |

The 192 ms was raw; the skeleton's own DoD (d) discipline — ratified at cycle 0 — subtracts the slack. It
caught the reviewer's inconsistency with its own rule.

**Stamp arithmetic reproduced exactly, independently:** out crossing `3.72305t² − 3t + 0.55 = 0` →
**282.1 ms**, stamp −12.7306 × 0.55 = **−7.0 J**; return = 402.895 + 214.795 = **617.7 ms**, stamp
−12.7306 × 0.658642 = **−8.4 J "(pass 2)"**. Every other number in §"Arithmetic" re-run end to end — all
four pins (2960 / 2720 / 2240 / 3360), all six flag crossings, all four tails, all four green bounds,
S4's back-crossings at 1763 / 1913 ms, the 70 J scale audit. **Every value correct. The cleanest
arithmetic audited in this chapter.**

---

## (4) F1 and F4–F9 — all landed; S3 retention justified

- **F1** ✓ `angle_arc` survives only in the §0.13 removal record and the "Not used" list. S3's formula
  re-based to `W friction = −f·d (both legs)`; §4's S3 counter cites the arrow + bar only; 180° remains
  only as the *arrow's* rotation and in two drill-down cluster **ids** (never rendered).
- **F2(i)** ✓ DoD (c): S2 `arrows.show: ['weight']`, rationale sentence added, the friction first-frame
  reveal-tint eye-walker note moved to S3.
- **F4** ✓ verbatim · **F5** ✓ · **F6** ✓ · **F7** ✓ · **F8** ✓ · **F9** ✓ DoD (j).

**S3 retained, and the retention is justified.** Its frozen frame is provably not a subset of S2's: S3 has
the **friction arrow** (S2 no longer draws it), a **"(pass 2)" head** at 840 ms (S2's pin shows pass-1),
and a one-ledger bar. Cutting S3 would leave S2's result unexplained. **Dependency named in CF-6:** S3's
distinctness is created partly by *withholding* the arrow from S2 — one json-author keystroke from
collapsing back into cycle-0 F2.

---

## Per-state design table

| state | claim in its own still | claim shown live | clearly different | residual | P |
|---|---|---|---|---|---|
| S1 `gravity_round_trip` | **partial** — labelled flag + `d` 1.42 m + bar −34.8; no stamp (fires 1633, pin 1110) | Y — latch 217 ms/cycle + bar crossing zero | Y (baseline) | still has no rendered numeral → CF-1/CF-3 | P2 |
| S2 `friction_round_trip` (PRIMARY) | **partial** — two red bars + pass-1 stamp; the 0.0/−27.4 line fires 1493, pin 1020 | Y — latch 207 ms/cycle, both ledgers in one line | Y — second bar + rough slope, no friction arrow | dwell thin; R lever in CF-2 | P2 |
| S3 `friction_flips_direction` | **Y** — friction arrow up-slope while block descends + `(pass 2) −8.4 J`, margin 189 ms net | Y — flip at 403 ms | Y — arrow debut + pass-2 head | flag post ~0.09 units from block at pin → CF-4 | P3 |
| S4 `work_depends_only_on_position` | **Y** — both pass-1 stamps −14.7 / −29.4, margins ≥ 982 ms | Y — pass-2 at 1763 / 1913 ms | Y — two flags, two-line map | flag A pass-2 dwell 187 raw / 154 net | P3 |
| S5 `explore` | n/a (sandbox, Rule 37) | Y | Y | scale 460 vs guided 70 — declared exemption | P3 |

Zero P1s. Both P2s are the same residual, adjudicated above.

---

## CARRY-FORWARD (hand down verbatim; no third cycle)

**CF-1 · json-author + quality-auditor · MANDATORY paperwork.** The design knowingly violates the OPEN
DIRECTIVE `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula` (which
names this concept) on **two flags**: S1's and S2's start-line latches fire at 1633 / 1493 ms against
0.55R = 1017 / 935, and S1's pin carries no stamp label. Add this second Gate-8 exemption or Gate 8 fails
S1/S2 mid-build:
> *Exempt the `capture_mode:'first'` start-line flags on S1/S2 from the 0.55R clause. Their firing is the
> RETURN crossing — the taught event — and no loop can place it before the 0.60R pin (tail ≥ 0.667·t_r +
> 0.333 s forces a ledger 4.4–6.5× the teaching peak; the bound-truncation alternative trips
> `nlbEnergyClampGuard`). Assert instead: each start-line flag fires exactly once per cycle at t_r, its
> stamp holds ≥ 174 ms net to the reset, and it re-arms at every reset. The 0.55R clause continues to bind
> every `'every'` flag (S2 flag-1 52.6, S3 282.1, S4 128.0/277.8 — all pass).*

**CF-2 · Checkpoint B / eye-walker · the residual, with its lever.** Judge the latch from **dense frames
and the founder_drive live dump, never the frozen pin** — the pin cannot contain it, by proof. If
207/217 ms reads as an unreadable flash, the dwell is an **authoring** knob, no engine change needed:
- **S2: R 1700 → 2050.** τ 557 ms (**2.7× dwell**); D = 1.618 m; loop end −5.218 (0.182 m margin, 3
  frames); gravity green +39.6 J (57%), friction −48.0 J (69%) — both inside 70, no overflow; pin phase
  1230; pin picture gravity −12.5 / friction −20.9.
- **S1: R 1850 → 1950.** τ 317 ms (**1.46×**); D = 1.516 m; end −5.116 (0.284 m margin); green +37.1 J
  (53%); pin phase 1170, picture −32.5 J, v −1.73. (S1 gains less — its tail is frictionless; more would
  need the home pose off −3.6, which Rule 32d forbids.)
- Cost: a louder green tail beside the latched "0.0 J". A founder/B taste call, not a defect either way.

**CF-3 · optional, decide at B.** An interior `'first'` flag on S1 at `initial_position_m + 0.2 = −3.4`,
label "at the flag", fires at 52.6 ms, stamps `W gravity = −4.9 J`, latches all cycle. Puts a rendered
numeral in S1's frozen frame and satisfies the directive probe's stamp-label half; **cannot pre-spoil S4**
(`'first'` never re-stamps, so no "(pass 2)" comparison exists). Cost: a second flag post in S1, and −4.9
shared with S2 (already the declared contrast-pair pattern, as 0.0 is).

**CF-4 · eye-walker contrast pass.** Checkpoint posts are `MeshBasicMaterial{depthTest:false}`
(L45450–45457) and draw **over** the block. At t = 0 and at the latch instant the start-line post is inside
the block's silhouette; at S3's pin the block sits ~0.09 world units from its flag (body half-width 0.275).
Marker labels sit at `NLB_MK_H + 0.30 = 1.35` and are **not** in `nlbStackBodyLabels` (which iterates
`nlb.bodies` only, L41791) — collision with the body's `m` billboard unlikely by height but unverified.
Sample S1/S2 at the recross and S3 at its pin.

**CF-5 · physics-author.** The DoD (f-7) latch narration duty is load-bearing: the sentence naming the
latched line must land inside its ~200 ms window or the beat is unnarrated. Author it as the sentence that
follows the **bar's zero crossing** — bar and stamp read zero at the same instant, and the crossing is the
multi-hundred-ms visual cue that makes the flash findable. **Never claim the bar "stops" at zero.**

**CF-6 · json-author, do not regress.** S2's `arrows.show` is `['weight']` deliberately. Adding
`'friction'` back collapses S3 into S2 (cycle-0 F2).

**CF-7 · Checkpoint B.** The two dimensions this design puts at risk are **D6 (quantity legibility)** and
**D7 (motion completeness)** — both unscorable from a skeleton. Score them hard at B.

---

## engine_queue

**E1 · `FIX(engine)` · RIDE-ALONG · owner `peter_parker:field3d_surgeon`** — authored frozen-pin phase for
nlb loop states.
- **Defect:** `deriveStateMeta.ts` L3097–3109 hardcodes the pin phase at `clamp(0.60R, 150, R−150)`. A
  closure beat necessarily fires **after** 0.6R (proved structurally), so its latched stamp can never enter
  an H2 baseline — the aha of every closure state is permanently outside the byte-compared regression net.
- **Fix shape:** honour an authored per-state pin-phase hint (`frozen_pin_phase_ms`, or
  `pin_after_checkpoint: N`), clamped to `[150, R−150]`, for nlb states with `loop_reset_ms` +
  `checkpoints`. ~20 lines, additive, no default change.
- **Payoff, computed:** with the hint, S1 at R = 2000 / phase 1850 (latch 1633, margin 217 ms, green
  +44.0 J = 63%) and S2 at R = 1900 / phase 1700 (latch 1493, margin 207 ms, green +27.2 J = 39%, friction
  −41.5 J = 59%) both land their latched line **in the still**, inside the 70 J scale and inside ±5.4.
  Fleet-general: #6, #9 and #10 all want closure stamps.
- **Why ride-along, not blocking:** the concept teaches correctly without it. It requires a skeleton re-tune
  (R, tails, pin pictures), so if the founder wants it, it should land **before** json-author, not after.
- **Evidence:** `deriveStateMeta.ts` L3091–3110; `field_3d_renderer.ts` L46085–46120 (fire), L44746–44750
  (re-arm), L46386–46398 (scale clamp).

**E2 · `FIX(engine)` · RIDE-ALONG** — the console-warning blind spot (scar row 1). Not this concept's
defect; it is why two nlb self-diagnostics had never once fired at a gate. *(Dispatching session note:
CLOSED on master — see `diagnostic_warnings` in `screenshotter.ts` / `frameDump.ts`.)*

---

```
RUBRIC (advisory, unratified — did not affect the verdict)
Checkpoint A subset:  D1 2 · D2 2 · D8 2 · D9 2 · D10 2   = 10/10
  weakest: D1 — every state is load-bearing (cutting S3 leaves S2's result unexplained),
           but S3's distinctness is now partly MANUFACTURED by withholding the friction
           arrow from S2; it is one json-author keystroke from the friction_force
           STATE_4 class.
           D2 — arc grammar sound, but S1's job is to plant a generalisation S2 breaks,
           and S1's still is the one carrying no rendered numeral.
  not scorable at A, and where this design's risk lives: D6 quantity legibility and
  D7 motion completeness. Score both hard at Checkpoint B.
```

**Budget: cycle 2 of 2 spent. Checkpoint A CLOSED.**
