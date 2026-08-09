# FOUNDER_PROXY — CHECKPOINT A · `kinetic_energy_definition` · CYCLE 2 (final)

## VERDICT: `DESIGN_OK`

All four P1s discharged, all four P2s applied, all six P3s applied or moot. The architect replaced
three of my remedies and **is right on all three** — I checked the arithmetic, not the disagreement.
No new P1 or P2. Six named watch items handed forward, none disqualifying.

Cycle 0 report: `founder_proxy_A.md`. Skeleton: `skeleton.md` (500 lines); cycle 0 preserved at
`skeleton_cycle0.md`.

---

## 1 · D1 — `bar_max_J = 45`: recomputed from scratch, ACCEPTED

| State | m | v | K | fill (K/45) | skeleton | ok |
|---|---|---|---|---|---|---|
| S1 | 5 | 4 | 40.0 J | 88.889% | 88.9% | yes |
| S2 slow | 5 | 2 | 10.0 J | 22.222% | 22.2% | yes |
| S2 fast | 5 | 4 | 40.0 J | 88.889% | 88.9% | yes |
| S3 start | 2 | 4 | 16.0 J | 35.556% | 35.6% | yes |
| S3 end | 4 | 4 | 32.0 J | 71.111% | 71.1% | yes |
| S4 each | 5 | +/-3 | 22.5 J | 50.000% | 50.0% | yes |
| S5 launch | 3 | 5 | 37.5 J | 83.333% | 83.3% | yes |
| S5 flag | 3 | 4 | 24.0 J | 53.333% | 53.3% | yes |

**Concept peak = 40.0 J** (S1 and S2 fast), not S5 — the architect's premise is correct: taking S5 to
3 kg drops its launch to 37.5 J, *below* S1/S2, which is what unlocks 45. My cycle-0 55 assumed S5
kept 5 kg; F4 forced that to change anyway, so the architect found a strictly better point in a space
my own remedy had disturbed. Better than mine; accepted without reservation.

**Overflow unreachable:** the warn fires at `val > maxJ + 1e-9` (L43798); max authored value 40.0
against 45. Confirmed **no guided state carries a slider** (S1-S5 all `none`) and no state has a
transient above its stated peak — S5 only falls from launch, S3 only rises to its ramp `to`, S1/S2/S4
are constant-speed `frictionless` coasts. Peaks are exactly determined.

**S6 re-checked:** `v0` in [-5,5], `m` in [1,6] → K_max = 0.5 x 6 x 25 = **75.0 J < 80** (93.75%).
Default pose 5 kg at 4 m/s = 40.0 J = **50.0%** — a live instrument at mid-scale, neither flat nor
pegged. Drag cannot import energy (`b.v = 0`, L42578); the sandbox wrap re-seeds from `b.v0` (<= 5).
`nlbSc` merges the authored `max: 6` over `NLB_SLIDER_SPEC.m`'s `max: 10` (L42232-35), so the clamp
is real.

---

## 2 · D3 — the PRIMARY aha: **F2 DISCHARGED, no escalation**

Re-wording onto "the reading" is an **honest fix**, and one argument inside it is better than
anything I wrote in cycle 0.

What now renders in S2: two identical 186 px tracks, one above the other. Top: caption `slow cart`,
a **41 px** amber fill (22.2%), `10.0 J`. Below: caption `fast cart`, a **165 px** amber fill
(88.9%), `40.0 J`.

Cycle 0 was 18.6 px against 74.4 px — two stubs, and the founder would have had to *measure* to see
the ratio. 22.2% against 88.9% is a different picture: **nearly-empty against nearly-full is a
categorical read, not a metric one.** You do not need aligned baselines to see it, which is exactly
what defeats the vertical stacking. The same move fixes S4: two half-full tracks read as equal
without precise height comparison, because "half" is also categorical.

**The architect's strongest argument is one I should have made myself and did not.** `nlbEnPct`
writes a *percentage* into `style.height`, so the fill FRACTION is invariant under the reflow ladder
— only the absolute pixels change. At `NLB_EN_STEPS[1]` (`trk: 138`) the fills are 30.6 px and
122.7 px: still nearly-empty against nearly-full. Anchoring the aha on the reading and the fraction
makes S2 and S4 **immune to my own F6 finding**, whereas my remedy (which left the memory on relative
height) did not. The architect turned F6 into an argument against my own remedy, correctly.

The §3 binding constraint is the right guard and sits where json-author and physics-author will read
it:

> *"No narration, caption, title or aha statement in this concept may describe one bar as physically
> beside another, and none may rest solely on relative height."*

**On escalation.** I stand by the founder note as written and am not invoking it. A conditional row
layout (gated on group and slot count, because #9's five-slot stack would run ~570 px) is a genuine
engine feature with real blast radius across #4/#9/#10, and is not warranted by a state that already
reads clearly. The architect filed it as a recommendation alongside my E1 ride-along rather than a
request — the correct disposition. **No Phase-0 alarm.**

Residual, handed forward as a probe (already authored in §10(h) with a named JSON-only fallback): the
whole argument rests on the fills actually rendering at 22.2%/88.9%, which RISK-2's probe asserts
directly.

---

## 3 · F1 — S3's ramp: strings now true, contrast now on screen

Ramp `m` 2 to 4, K 16.0 to 32.0. 4/2 = 2 and 32/16 = 2. Title "Twice the mass, twice the energy" is
TRUE. Delta cue "Double mass, double K" is TRUE.

Contrast: **S2's bar ratio 40/10 = x4; S3's 32/16 = x2.** Distinct, and both on the same 45 J scale
so the cross-state memory is fair. The comparison is cross-state (two simultaneous bars vs one
sweeping bar), which requires the teacher to name it; §2 hands physics-author exactly that
instruction. That is as good as this apparatus allows without a third compare state, which would be
padding under Rule 11. Discharged.

---

## 4 · F3 — the weight arrow: verified at source, and arithmetically exact

- `NLB_ARROW_DEFAULT_LABELS = { weight: "mg", normal: "N", ... }` — **L39680, `mg` confirmed, not
  `W`.** The §1 boundary invariant survives, and the `W`-weight / `W`-work collision that would have
  poisoned #1, #2 and #4 never arises. This was the load-bearing check and it passes.
- Config shape confirmed: `arrows?: Array<{ body_id: string; show: Array<'weight'|...>; ... }>`
  (L1316-21). `body_id` is **required**, and the architect authored it.
- Length: `nlbArrowLen = |F| x 0.048` clamped [0.55, 2.80] (L39661-63, L40808-13). At 2 kg:
  19.6 x 0.048 = **0.9408**; at 4 kg: 39.2 x 0.048 = **1.8816**. Ratio = **2.0000 exactly** — neither
  clamp bites (the max clamp would bite at 58.3 N ~ 5.95 kg, which independently confirms 2 to 8 was
  the wrong ramp). The arrow doubles *exactly* when the mass doubles, so a viewer comparing arrow
  lengths reads the true ratio. This is the strongest possible form of the remedy.
- Renders at all: `NLB_ARROW_EPS = 0.05` N; mg = 19.6 N.
- **Unanticipated support:** L39706-13 documents that the weight label *sweeps* as mass changes and
  that `nlbDeCollideLabels` was built for exactly that case. A mass-driven weight arrow is an
  anticipated, handled configuration — better precedent than I knew when I proposed it.
- The false "billboard changes first" claim is **deleted**, replaced by an argued 32a exemption (§3)
  stating the principle (a continuously-varying parameter is not an event; cause and effect are
  simultaneous by physics) and showing 32a's readability purpose met another way. Argued, not
  asserted. Term ledger gains an `mg` row defined by S3.

---

## 5 · F4 — S5 rebuilt: every scar number re-derived at h = 1/60

a = mu*g = 0.5 x 9.8 = **4.9 m/s^2** (mass-independent — the architect's note is right, the 3 kg
change does not move it).

| Quantity | My derivation | Skeleton | ok |
|---|---|---|---|
| flag `d` | (25 - 16)/9.8 = 0.918367 m | 0.9184 | yes |
| flag `s_m` | -5.4 + 0.918367 = **-4.481633** | -4.4816 | yes |
| flag `t` | (5 - 4)/4.9 = 0.204082 s | 0.2041 | yes |
| flag K | 0.5 x 3 x 16 = **24.0 J** | 24.0 | yes |
| launch K | 0.5 x 3 x 25 = **37.5 J** | 37.5 | yes |
| rest `d` / `s` | 2.551020 m -> **-2.848980** | -2.849 | yes |
| rest t (analytic) | 5/4.9 = 1.020408 s | 1.0204 | yes |
| **rest t (discrete)** | v_n = 5 - 4.9n/60; n=61 -> +0.018333, n=62 -> sign flip => **t = 62/60 = 1.033333 s** | 1.0333 | yes |
| pin | clamp(0.60 x 2100, 150, 1950) = **1260 ms** | 1260 | yes |
| margin (rest) | 1260 - 1033.3 = **226.7 ms** >= 167 | 227 | yes |
| margin (stamp) | 1260 - 237.4 = **1022.6 ms** >= 167 | 1023 | yes |
| crossing vs 0.55R | 204.08/2100 = **0.0972** << 0.55 | 0.097 | yes |
| bounds | rest at -2.849, abs(s) < 5.4 throughout | — | yes |

The architect reproduced my own C4 method exactly and got the same discrete rest frame. Every scar
row discharged.

**Number reuse eliminated:** S5's (m, v, K) triples are (3, 5.00, 37.5), (3, 4.00, 24.0) and
(3, 0, 0.0). No earlier state renders a 3 kg body or a 24.0 J / 37.5 J reading. The 4.00 m/s speed
recurs but at a different mass and therefore a different reading — which quietly reinforces S3.
Delta cue "K falls to zero" and title "Kinetic energy falls to zero" name S5's own claim, not S2's.

**The 51% rest tail is structurally forced, and the frozen frame lands ON the claim.** The pin sits
at 0.60R and needs a 167 ms margin, so t_stop <= 0.60R - 167 => R >= 2000 ms for a 1033 ms stop;
R = 2100 is near-minimal. The pin at 1260 ms lands in the rest phase *deliberately*, because "at
rest, exactly 0.0 J" is now the state's titled claim. That is the exact inverse of rubric R4
(`166d4d4`, the canonical frame in the dead zone) — here the canonical frame IS the content.

---

## 6 · F5-F14 + D4 — applied, not merely noted

F5 applied (50.0%). F6 applied (§10(f-2) rewritten with the 315/567/579 px arithmetic **and** a
binding cross-state guard). F7 **deleted** — S2's row now carries only a projection-disjointness
statement, and the deletion is recorded in the Rule-41 audit. F8 re-declared *and* repurposed: the
drag's `b.v = 0` becomes the `intro` preset's only route to K = 0. F9 three bounds, three sources,
correctly attributed. F10 camera `[3, 2.5, 9]`. F11 moot. F12 anchor qualitative, stopping distance
recorded as a declared forward reference for #10's architect — better than deletion. F13 one flag; my
own recount gives **~308 px** (22 non-space glyphs x ~11 px + 12 spaces x ~5.5 px), ~317 px with
synthesized bold, against the 340 px cap — the architect's ~319 is sound, and probe *and* fallback are
both authored. F14 explicit. Inherited friction-ink scar named on S5, engine-owned, not routed.

**D4 — I accept the caution and it is real.** `#FFD54F` (255,213,79) vs `#FFCA28` (255,202,40):
delta-G = 11, delta-B = 39. Genuinely close. Different zones and different shapes (a 3D shaft-and-head
on the cart vs a DOM fill in a black left-edge track with a caption and numeral) make confusion
unlikely, but the EYE check is the right ask and the JSON-only remedy (`bodies[].color`, L962) is
valid. Watch item, not a finding. Good catch by the architect on its own remedy.

---

## 7 · RISK-3 — a physics-author confirmation probe, NOT a design risk. Call chain now closed.

Both the architect and I asserted "`nlbResetTrajectory` never touches `b.m`" from the function body
alone. **Neither of us followed the call it makes to `nlbSeedKinematics()` (L45459)** — the one path
in the rewind that could have re-seeded mass from the authored `mass_kg` and invalidated S3. I closed
it this cycle:

```js
function nlbSeedKinematics() {          // L45371
    var eng = window.PM_nlbEngine;
    if (!eng) return;
    eng.a_string = 0;
    if (!eng.coupled) { eng.v_string = 0; return; }   // <- S3 returns HERE
```

S3 is uncoupled (no `pulley`, no `train`, one body), so the function early-returns before touching
anything. The complete rewind path is now verified end to end: `nlbRunLoopReset` ->
`nlbResetTrajectory` (s, v, a, F_net, `_stuck`, `_boundArrestedSliding`, `nlbSetBodyPosition`) ->
`nlbSeedKinematics` (early-return) -> `t_ms = 0`, `_ramp_last = null` -> `nlbSpringPhysReset`
(spring/energy latches, `_loop_cycle`, warn latches — no mass) -> `t_ms` restored monotonic (L43356).

**`b.m` is written on no rewind path.** With `_ramp_last` nulled, the churn guard is bypassed and
`nlbRunParamRamp` rewrites `bA.m` on the very next frame from the restored monotonic `t_ms`. **No
snap-back is possible.** The ramp's `end_ms = 7200` against `R = 2400` means the cart traverses three
times, getting visibly heavier each pass while the bar rises monotonically through all three — a
coherent beat.

This is now **verification of a proven chain, not an open design risk.** The S3 fallback the skeleton
warns about should not be needed. Keep the probe.

---

## Watch items handed forward (none disqualifying; for physics-author and Checkpoint B)

1. **S4 loop: keep 1300 ms; do NOT take the 1400 ms option as stated.** At R = 1400 the carts reach
   exactly +/-5.4 *at t = R*, but the reset fires on the first frame past R — at 1416.7 ms the
   position is **+/-5.45**, exactly the overhang threshold the skeleton's own §3 table derives. Zero
   margin. At R = 1300 the worst discrete frame (1316.7 ms) gives +/-5.150 — 0.30 m of margin. If a
   calmer loop is wanted, use <= 1350 ms.
2. **§3's three-bounds table, row 3.** The row value reads "+/-5.4" while its explanation derives 5.45
   (a 0.55 half-width against a slab drawn to +/-6.0). 5.4 is 5.45 with an undeclared 0.05 m safety
   margin. Harmless and conservative, but state it as such — the table's whole purpose was to stop
   conflating numbers.
3. **Apparent tension between §2 and §10(f-2).** §10(f-2) forbids comparing a bar's *height* across
   states; §2 instructs physics-author to narrate the S2-vs-S3 comparison. These do not conflict — the
   S2/S3 comparison is of **ratios** (x4 vs x2), which are scale- and viewport-free — but they sit in
   different sections and could read as contradictory. One clarifying clause in the physics block.
4. **S3 shows the weight arrow with no normal arrow.** A lone downward `mg` on a cart in vertical
   equilibrium may read as an unbalanced net force. I *recommend against* adding `'normal'`: it would
   introduce an untaught `N` symbol (breaching the term ledger) and make two arrows change length
   together, muddying "the arrow that IS the mass". Weight-only is the better authored choice — just
   have eye_walker confirm it doesn't read as a net force.
5. **D4's amber-vs-amber check at THE EYE**, with `bodies[].color` as the named JSON-only remedy.
6. **RISK-2's fill assertion is the one that carries the concept.** 22.2%/88.9% is what makes D3's
   judgement correct. If the probe returns different fractions, the D3 reasoning must be re-opened
   **before** the build, not after.

---

## Founder note

My cycle-0 scar row `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause`
carried the prevention rule *"find a rendered correlate that scales with it (a force arrow, an
instrument needle)"*. The architect applied exactly that and it produced an arrow that doubles to four
decimal places. **A scar row that prevented a defect inside the same chapter, one cycle after being
written** — that is the ratchet working as intended, and it is the first ch6 instance of it.

---

## Rubric (advisory, unratified — did not affect the verdict)

```
Checkpoint A subset (D1, D2, D8, D9, D10)
D1 2 · D2 2 · D8 2 · D9 2 · D10 2   = 10/10   (cycle 0: 8/10)

Both cycle-0 weaknesses closed, and closed by evidence rather than by wording:
  D1 1 -> 2 : S3's evidence is now distinct from S2's (bar x2 against x4, which is the
              concept's actual thesis appearing on screen for the first time), and S5
              no longer reuses S2's (m, v, K) triples or its claim
  D9 1 -> 2 : "Twice the mass, twice the energy" is now true against its own ramp, and
              "Kinetic energy falls to zero" replaces the topic-label "Check the
              numbers: K = 1/2mv^2"
Weakest remaining (both scored 2, offered as the honest margin): D1 — S5 verifies
1/2mv^2 at one flag rather than two, so the numeric check rests on a single point;
D2 — the x2-vs-x4 contrast is cross-state and needs the teacher to name it.
Not scored at Checkpoint A: D3-D7.
Report-only per the founder's 2026-08-01 ruling. My verdict is DESIGN_OK on the findings
alone and would be identical without this section.
```

---

## Closing

Two cycles, four P1s, zero escalations, zero renderer edits, no Phase-0 alarm. The architect accepted
every finding and improved three of the four remedies — including one argument (fill fractions are
invariant under the reflow ladder, so anchoring the aha on the reading defeats F6) that is better than
what I wrote. That is the checkpoint working the way it is supposed to.

**Design is sealed. Proceed to `alex:physics_author`**, with the four RISK probes to be run **before**
the physics block is written, plus the six watch items above.
