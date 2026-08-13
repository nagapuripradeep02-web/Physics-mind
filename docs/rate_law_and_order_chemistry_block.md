# Chemistry block — `rate_law_and_order` (extends architect skeleton REV 3)

> Companion to `docs/rate_law_and_order_skeleton.md`. Renderer: `particle_field`, `scenario_type: "gas_box"`,
> kinetics instrument per `docs/GAS_BOX_KINETICS_INSTRUMENT_SPEC.md` (built + verified: `check:gas-reaction` 81/81,
> tsc clean, THE EYE 194/194 at 0.00% diff on the four locked baselines).
>
> **SESSION NOTE (2026-08-07), read before S4 and S11:** chemistry_author's DQ-3 found that the compression test
> cannot read ×4 on a count-basis chip, and proposed replacing S4's piston with a pour-both. The session did NOT take
> that swap. The root cause is broader than S4 — see **§DQ-3 SESSION RULING** below — and is being fixed in the
> instrument instead, which preserves S4's piston beat and also repairs S11's volume slider.

**Engine bug-queue consultation (run):** `query_engine_bug_queue.ts rate_law_and_order` → 9 rows, all applied:
`misconception_beat_whose_own_evidence_confirms_the_wrong_belief` (DQ-2 found a viable charge before S8 was
authored) · `batch_box_rate_ratio_pinned_to_an_earlier_value_measures_the_run_down_not_the_disturbance` (the
two-fresh-runs method is used throughout) · `fleet_constant_transplanted_across_a_reversible_to_irreversible_regime_boundary`
(half-life re-measured, §DQ-0) · `new_renderer_instrument_ships_without_a_dim_key...` (`glow_focal` restricted to the
four wired names) · `density_mitigation_for_one_state_breaks_a_null_result_claimed_by_another` (S5 measured at the
pinned N=180) · `explore_state_runs_its_reaction_to_completion_and_has_no_teacher_facing_rerun` (confirmed live,
§DQ-0) · `misconception_planted_in_core_ring_and_confronted_only_in_a_hideable_ring` (S1 plant and S8 confront are
both core) · the two spec-merge rows (closed upstream).

**Source check:** *Consulted NCERT Chemistry Class-12 Ch.3 chapter index for scope only (rate expression, order,
initial-rate method). No teaching method, example, or figure imported. NCERT Exemplar consulted for misconception
belief only.*

---

## MEASURED FINDINGS — read before the per-state content

All probes were throwaway headless `vm` harnesses driving the **actual emitted** renderer (`stepGas`,
`gasKinReseed`, `gasKinFitWindow`, `gasRxFwdTotal/RevTotal`), cloned from `check_gas_reaction_physics.ts`. Deleted
after; `git status` clean of them.

### DQ-0 — half-life sanity check
Home pose (A90/B90, N=180, Ea 3, reverse 0), seed 29919362:

| t | 2s | 5s | 10s | 20s | 30s | 40s | 60s | 90s | 120s |
|---|---|---|---|---|---|---|---|---|---|
| A left | 84 | 75 | 59 | 48 | 41 | 34 | 27 | 19 | 17 |

Half-life ≈ **24 s** — same order as the skeleton's ~27 s, confirming Ea 3 (not 1.2) is right for this irreversible
regime. **Explore liveness: only 2 forward events in the final 30 s of a 120 s run** — the box is effectively dead by
t≈90 s, confirming the filed dead-box row on this exact concept. **`show_kinetics_new_run` on S11 is REQUIRED**, now
with a number behind it.

### DQ-1 — fitted-slope repeatability × the S5 inert null (coupled)
Window 2000 ms, 8 seeds, home pose: `2.35, 4.19, 5.61, 4.65, 6.61, 3.70, 3.01, 3.49` discs/s — **mean 4.20, stdev
1.30, CV 31%**. Widening to 3000 ms drops CV to 26.8% but consumes 14.4% of A — **over the ≤10% "still initial"
bound**. So the honesty-bounded window caps at ~2000–2200 ms with CV ~28–31%. This is real Poisson rare-event noise
(~6–10 events per window at Ea 3, N 180): mitigation rung (a) is exhausted, and rung (b) has no mechanism — the built
instrument fits ONE window per mark, with no averaging primitive.

**Coupled S5 check** (A90/B90 vs +X90, 40 seeds): individual ratios ranged **0.23–7.61**, but **median 1.08** and a
paired ratio-of-sums estimate **1.03** — both consistent with the **+4% predicted by the g(η) excluded-volume
coupling**. The physics is right; a single realization is noisy.

**Resolution — seed selection, not a new instrument.** `design.phys_seed` is one global value per concept, reseeded
fresh from `config.design.phys_seed` on every `rebuildScene()`, so a shipped concept is deterministic, never
live-random. A joint search over 40 candidate seeds, scored against ALL FIVE run-pair targets at once:

**`design.phys_seed: 29919362`** → S2 **×1.88** · S3 **×2.73** · S4 (pour-both variant) **×3.37** · S5 **×0.82** ·
S8 **×2.83**. **json_author must re-verify this seed against the fully assembled JSON before baseline-lock** — the
probes used a minimal single-state config.

### DQ-2 — S8 viability (the must-measure gate) — CLEARS
The retired target is confirmed dead: **n=30 (A60/B60/AB60) sits AT equilibrium**, net₁ = **−0.50 to −0.58/s**, so the
ratio divides by ~zero. Fine sweep (12–15 seeds/charge):

| n | window | measured ratio | predicted (2F−R)/(F−R) |
|---|---|---|---|
| 5 | 2000 | 1.46 | 2.06 |
| 10 | 2000 | 2.03 | 2.34 |
| **13** | **2500** | **2.29 (30-seed batch)** | 2.80 |
| 15 | 2000 | 2.27 | 2.45 |
| 16 | 2000 | 2.79 | 2.93 |
| 20+ | any | unstable — net₁ near zero, factors swing −29 to +122 | — |

**Chosen: n = 13 → A77 / B77 / AB13** (167 particles = 180 atoms), window 2500 ms. At the chosen seed it reads
**×2.83** — clearly more than ×2, which is all the S8 lesson needs. **DQ-2 clears; the §4 fallback is not invoked.**

### DQ-3 — S4 compression — **CRITICAL FINDING, and the SESSION RULING that supersedes the proposed fix**

**The finding (accepted, and correct).** Measured literally as designed (piston 1.0 → 0.5, same A90/B90, window
2000 ms): single seed ×1.35; 40-seed ratio-of-sums **×1.15**; 80-seed mean-of-ratios ×1.43–1.59. **Nothing near ×4.**

The reason is exact, not statistical. The R1 chip prints `discs/s` — an **absolute event-count rate**. For 2D hard
discs, total A–B collisions per second ∝ N_A·N_B / Area. Halving the area therefore **doubles** it. The textbook ×4
belongs to the **concentration** rate, d[A]/dt ∝ N_A·N_B / Area², because [A] = N_A/Area carries a second factor of
area. A count-basis chip cannot report a volume change correctly. Same failure family as the retired K-vs-k scar: a
plausible chip reporting a different quantity from the one the caption claims.

**SESSION RULING — the proposed fix is NOT taken, because the defect is wider than S4.**
chemistry_author proposed replacing the piston with "pour both species doubled at fixed volume" (measured ×3.87
across 40 seeds; ×3.37 at the chosen seed). That is arithmetically sound and would fix S4 alone. Three reasons it is
the wrong repair:

1. **It leaves `S11` broken.** The explore state exposes a live **`V` slider**. A teacher who halves the volume there
   gets a chip reading ~×2 for what every textbook, and this very concept's rate law, calls ×4. The sandbox would
   quietly teach the wrong number, with no narration anywhere to catch it.
2. **It removes the one JEE-staple this concept's own Block-1 trace is built on** — *"the vessel volume is halved at
   constant T; by what factor does the rate change?"* Answering that by pouring instead of compressing dodges the
   question rather than demonstrating it.
3. **Chemistry's "rate" IS the concentration rate.** The whole concept teaches rate = k[A]ˣ[B]ʸ, in which [A] is a
   concentration. An instrument built to teach rate laws must report the concentration basis whenever volume varies.
   (Where volume is FIXED — every other state, and the whole sibling concept — count basis and concentration basis
   differ by a constant that cancels in every ratio, which is why nothing else is affected.)

**Repair taken instead:** a `kinetics_rate_basis: 'count' | 'concentration'` option on the rate readout, dividing the
fitted event rate by the live box area (`gasBoxArea()`, already computed). Small, additive, opt-in. **S4 keeps its
piston and its `compress-the-box` archetype** (which also preserves Rule 32's no-repeat-archetype discipline against
S2/S3's pours), and S11's `V` slider becomes honest. Routed to `peter_parker:renderer_primitives`.
**S4's numbers below must be re-measured on the concentration basis once that lands** — the ×3.37 recorded here is
the pour-both variant and does not apply.

### DQ-4 — S6 k-chip flatness
22.5 s run-down, k sampled every 2.5 s: `0.000556, 0.000582, 0.000548, 0.000198, 0.000182, 0.000710, 0.000674,
0.000396, 0.000590` — mean 0.000493, stdev 0.000182, **CV 36.8%: visibly not flat frame to frame**, matching the
fleet's existing `show_k_ratio` noise scar. **No systematic drift** (no monotonic trend), so the physics is right —
k genuinely does not track concentration. **Narration must be comparative only** ("k stays in the same rough range
while the rate visibly shrinks"), never "watch this stay fixed", never a quoted value.

### DQ-5 — S9/S10 line quality
At the default `kinetics_window_ms: 5000`, a 30 s dwell yields only **5–6 points**, each with 2.1×–2.6× scatter.
**Author `kinetics_window_ms: 2500`** on both — more, noisier points read as "a cloud along a rising trend" better
than five precise-looking sparse ones.

### DQ-6 — S10 decay pace
AB over time (Ea 3, reverse 8): `t=0:90, 5s:68, 10s:57, 15s:42, 20s:37, 25s:38, 30s:37` — **plateaus by t≈20 s** (the
system finds a new equilibrium as free A/B accumulate). The Ea-1.2 precedent's pace does not transfer. **Author S10's
dwell / `eye_capture_ms` ≈ 19000–20000 ms**, not 30000.

### DQ-7 — run-pair dwell
relax-settle (~55 ticks) + run-1 fit (2000 ms) + readable gap before the reseed cue (~1000–1500 ms, Rule 32a) +
run-2 fit (2000–2500 ms) + a beat to read the ratio (~1000–1500 ms) ≈ **6.5–7.5 s of mechanics**, inside a 25–55-word
state. Viable.

---

## §1 — `engine_config` (gas_box form)

```json
"physics_engine_config": {
  "variables": {
    "T":  { "name": "temperature of the thermostat bath", "unit": "K", "min": 250, "max": 900, "default": 300, "step": 10, "role": "taught_variable" },
    "nA": { "name": "A poured (teacher control, S9/S11)", "unit": "particles", "min": 0, "max": 120, "default": 90, "step": 5 },
    "nB": { "name": "B poured (teacher control, S11)", "unit": "particles", "min": 0, "max": 120, "default": 90, "step": 5 },
    "V":  { "name": "box volume as a fraction of full width (S4 reseed, S11 slider)", "unit": "", "min": 0.35, "max": 1, "default": 1, "step": 0.05 },
    "activation_fwd_kT":     { "name": "forward barrier, multiples of kT at ea_ref_T", "unit": "", "constant": 3, "role": "reaction_constant" },
    "bond_energy_kT":        { "name": "energy released on bonding", "unit": "", "constant": 2.1, "role": "reaction_constant" },
    "reverse_attempt_per_s": { "name": "Arrhenius pre-exponential for breakup", "unit": "1/s", "role": "reaction_constant", "per_state_table": "see §3" },
    "ea_ref_T": { "name": "reference temperature for activation_fwd_kT", "unit": "K", "constant": 300 },
    "k": { "name": "rate constant (forward)", "unit": "", "derived": "fitted_fwd_rate / (nA_live * nB_live)", "role": "computed_output" }
  },
  "computed_outputs": {
    "initial_rate_ratio": "fitted rate of run 2 ÷ kept fitted rate of run 1 (R1 mechanism)",
    "k_live": "readout E: k = rate ÷ (A×B), value-only — NOT the equilibrium-K chip",
    "order_x": "1 (measured in S2)",
    "order_y": "1 (measured in S3)",
    "overall_order": "x + y = 2 (S4, via the volume halving on the CONCENTRATION basis — see DQ-3)"
  },
  "constraints": [
    "atoms of each model species conserve: LHS count = RHS count in every displayed equation",
    "total charge LHS = RHS = 0 (neutral model species throughout)",
    "every authored species_counts object, INCLUDING each run of a two-run state, sums exactly to that run's own particle total",
    "a rate comparison ACROSS a volume change must use the concentration basis; the count basis is valid only at fixed area (DQ-3)",
    "k is read only from readout E (rate ÷ (A×B)); the equilibrium constant K = [AB]/([A][B]) is a DIFFERENT quantity and must never source a k narration",
    "forward and reverse run simultaneously in S8/S10; no visual may show either direction stopping while the other continues"
  ]
}
```

---

## §2 — Balanced-equation ledger

| Form | States | Atom count (LHS=RHS) | Charge |
|---|---|---|---|
| A(g) + B(g) → AB(g) | S1–S7, S9, S11 | A: 1=1, B: 1=1 | 0 = 0 |
| A(g) + B(g) ⇌ AB(g) | S8 (first ⇌, declared once in narration) | A: 1=1, B: 1=1 | 0 = 0 |
| AB(g) → A(g) + B(g) | S10 | A: 1=1, B: 1=1 | 0 = 0 |

No redox, no oxidation numbers. State symbols (g) on every label, every state.

---

## §3 — Per-state motion timeline + control spec (Rule 31)

Home pose: A `#60A5FA` (r5, m1, 90) · B `#F472B6` (r5, m1, 90) · AB `#C084FC` (m2, r7.0710678, 0) · X `#9CA3AF`
(m1.5, r5, 0 — S5 only) · T 300 K · `activation_fwd_kT: 3` · `bond_energy_kT: 2.1` · `ea_ref_T: 300` ·
`speed_scale: 0.105` · **`design.phys_seed: 29919362`** (re-verify before baseline-lock).

### S1 — "The exponents are unknowns" (core, `reveal-build`)
- **Motion:** 0–800 ms box opens reacting at home pose; 800–3000 ms the formula surface writes `A(g) + B(g) → AB(g)`
  then `rate = k[A]ˣ[B]ʸ` with x, y blinking `?`; onward, continuous reaction in the background.
  `show_species_counts_only: true` (no rate instrument before the word is earned — Rule 25).
- **Controls:** none. **glow_focal:** none authored (the "?" slots are not a wired dim name — narrated focus only).
- **Narration (44 words):** "This box holds A and B reacting to make AB. The rate law is rate equals k times A to the x, times B to the y. The coefficients in the equation cannot tell us x and y — only an experiment can. Today, we measure them."

### S2 — "Double A: rate doubles" (core, `run-pair-compare`) — **PRIMARY AHA**
- **Charges:** run 1 A90/B90/AB0 = 180 · run 2 (`kinetics_reseed_charge`) A180/B90/AB0 = 270.
- **Motion:** 0–2000 ms run 1, fit `kinetics_marks[0] = {t0:0, t1:2000, series:'fwd', keep:true}`, kept chip settles
  ×1.00 at ~2100 ms; 3200 ms `kinetics_reseed_cue` (visible pour of blue — cause first); run 2 fit
  `{t0:3200, t1:5200, series:'fwd', at_cue:'reseed'}`; ratio settles ~×1.88 at ~5300 ms; x-slot fills ~5600 ms.
- **Controls:** none. **glow_focal:** `kinetics_mark`.
- **Narration (48 words):** "Run one: ninety of each, rate measured and kept. Run two: A doubled, B unchanged. The rate reads about twice run one's. Order with respect to A is one. Here the order matches the coefficient because this step is a single collision — that will not always be true."

### S3 — "Double B: same test" (core, `run-pair-compare`, **contrast pair with S2**)
- **Charges:** run 1 A90/B90/AB0 = 180 · run 2 A90/B180/AB0 = 270.
- **Motion:** identical timing to S2, mirrored onto B (pink pour).
- **Controls:** none. **glow_focal:** `kinetics_mark`.
- **Narration (33 words):** "Same test, other reactant. Ninety of each, kept. Now B doubles, A stays put. The rate again reads about twice run one's. Order with respect to B is also one."

### S4 — "Half the volume: rate ×4" (core, `compress-the-box`) — **PISTON RETAINED; numbers pending the concentration basis**
- **Charges:** run 1 A90/B90/AB0 = 180 at `piston_frac: 1.0` · run 2 same 180 discs at `piston_frac: 0.5`.
- **Readout basis:** `kinetics_rate_basis: 'concentration'` (the DQ-3 repair — without it this state reads ~×2 and
  contradicts its own caption).
- **Motion:** 0–2000 ms run 1 fit at `piston_frac: 1.0`, kept ×1.00; at the reseed cue the wall drives in and run 2's
  fit window opens **immediately, with NO settle gap** (measured — see below); ratio ≈ ×4; surface adds `x + y = 2`.
- **AUTHORING CONSTRUCTION — measured, and the naive version does not work.** `kinetics_reseed_charge.piston_frac`
  has **no staying power on its own**: `gasMovePiston()` eases `gasPistonF` back toward the STATE's authored
  `piston_frac` at 6%/tick every tick, so a reseed that hard-sets 0.5 springs back to 1.0000 within **1500 ms** —
  inside the 2000 ms fit window. Measured naive result: count ratio 1.03, concentration ratio 1.10. **Working
  construction:** author at STATE level `piston_from: 1.0`, `piston_frac: 0.5`, `piston_ramp_ms: 60`, and set
  `piston_cue` to the **same cue id** as `kinetics_reseed_cue`. That routes the post-cue ticks through the *driven*
  ramp branch rather than the free ease; traced tick-by-tick it settles by ~1100 ms and holds.
- **No settle gap — and the tradeoff runs the counterintuitive way.** Waiting before the run-2 window gets the area
  exactly right but costs reactant (the reaction never pauses; A falls 90 → 77–88 during the wait), and that depletion
  lowers the ratio *more* than the area overshoot inflates it. Swept 0 / 300 / 600 / 900 / 1200 / 1600 ms:
  **gap 0 wins** — count 2.20 / concentration 4.23, falling monotonically to 1.40 / 2.81 at 1600 ms.
- **Measured (25–40 seeds, `kinetics_rate_basis: 'concentration'`, fresh-reseed run-pair):** ratio-of-sums
  **count 2.05–2.20, concentration 3.94–4.23** — reliably near the theoretical ×4. `concRatio / countRatio =
  area₀/area₁ = 1.9225` (not exactly 2.000 because the driven ramp's brief overshoot lifts the window-mean area) —
  close enough for "about four times". **At `design.phys_seed: 29919362`: S4 = ×4.13**, and the joint five-target
  search confirms that seed remains best (S2 1.88 · S3 2.73 · S4 4.13 · S5 0.82 · S8 2.83) — **no re-pick needed.**
- **Controls:** `V`. **glow_focal:** `kinetics_mark`.
- **Narration (52 words, carries the required reconciliation):** "Same particles, half the room — so both concentrations double at once. The rate reads about four times run one's, not two. In collision theory, crowding barely changed the fraction of collisions clearing the barrier. That has not changed. What changed is how many times A meets B, and doubling both multiplies it by four."
- **Re-measure duty — AND the construction to measure it with.** `kinetics_rate_basis: 'concentration'` is now built
  and proven exact: at fixed area the concentration ratio equals the count ratio to 1e-9 (the area cancels), and under
  a halved box it is exactly 2.000× the count ratio — i.e. exactly Area₁/Area₂. But the surgeon's acceptance test
  measured **×2.10, not ×4**, and the reason is the test construction, not the physics:
  **it used a WITHIN-RUN piston stroke** (`piston_from` → `piston_frac` inside one run), which carries the batch
  run-down bias — reactant is consumed between the two marks, so the compression gain is partly cancelled. Its own
  count-basis number gives it away: ×1.05, when a fixed-count halved area should give ×2 on the count basis alone.
  **This state does not use a within-run stroke.** Under the REV 3 run-pair method, run 2 is a *fresh re-seed* at
  `piston_frac: 0.5` with the same counts, measured at its own initial slope — no run-down to cancel. Fresh box at
  area A: count rate ∝ N_A·N_B/A. Fresh box at A/2: ∝ 2N_A·N_B/A. On the concentration basis those become
  N_A·N_B/A² and 4N_A·N_B/A² → **×4**. **chemistry_author must measure the two-fresh-run construction before
  json_author locks the state**, and if it lands outside "about four times", re-pick the seed against all five
  run-pair targets jointly rather than re-wording the caption. Do NOT carry the ×2.10 figure forward — it belongs to
  a construction this state does not use.

### S5 — "Extra inert particles change nothing" (core, `null-result-hold`)
- **Charges:** run 1 A90/B90/AB0/X0 = 180 · run 2 A90/B90/AB0/X90 = 270.
- **Motion:** 0–2000 ms run 1 fit, kept ×1.00, collision counter live throughout; 3200 ms cue pours 90 grey X;
  3200–5200 ms run 2 fit; ratio settles ~×0.82–1.08 while the collision counter visibly reads higher.
- **Controls:** none. **glow_focal:** `kinetics_mark`. Legend gains "X: inert" this state only.
- **Narration (46 words, honest about the noise — "barely moves", not "exactly the same"):** "Same test — but this time we pour in ninety inert grey particles, not more reactant. The collision counter climbs: many more hits per second. But the rate barely moves. Particles the rate law doesn't name don't change the rate, even when they fill the box."

### S6 — "k stays fixed" (core, `run-down-hold`)
- **Charge:** A90/B90/AB0 = 180, `reverse_attempt_per_s: 0`, no reseed.
- **Motion:** 0–22000 ms continuous; curves fall, rate bar shrinks; `show_rate_constant: true`,
  `kinetics_window_ms: 5000`, k chip live (wanders CV ~37% — never narrate a value).
- **Controls:** none. **glow_focal:** `rate_constant`.
- **Narration (41 words):** "Watch the rate bar shrink as A and B run out. Now watch k. It doesn't fall with the rate — it wanders in the same rough range the whole time. k is the part of the law that concentration cannot touch."

### S7 — "Heating changes k" (extended, `heat-the-box`, **contrast pair with S6**)
- **Charge:** A90/B90/AB0 = 180, `reverse_attempt_per_s: 0`, `T_from: 300`, `T: 450`, `T_cue: 'heat'`.
- **Motion:** 0–1000 ms held at 300 K; `heat` cue at 1000 ms; 1000–4000 ms ramp to 450 K (thermometer climbs FIRST,
  k chip responds ~1200 ms later — Rule 32a); k climbs through the remaining dwell.
- **Controls:** `T`. **glow_focal:** `rate_constant`.
- **Narration (38 words):** "Same box, same concentrations — only the temperature climbs now. Watch the same k chip that just held flat. This time it climbs with the thermometer. Concentration didn't move k; temperature does."

### S8 — "Measure at the start" (core, `repeat-and-mismatch`) — **DQ-2 cleared at n = 13**
- **Entry recomposition:** `species_counts: {A:77, B:77, AB:13}` (167 particles = 180 atoms),
  `reaction.reverse_attempt_per_s: 8`, purple product visible, breakup flashes live from entry.
- **Static chip:** `kinetics_reference_chip: "fresh box ×2.0"` (quotes S2's verdict).
- **Motion:** 0–2500 ms run 1 with `kinetics_rate_series: 'net'`, kept net chip ×1.00; 3700 ms cue doubles A
  (`kinetics_reseed_charge: {species_counts: {A:154, B:77, AB:13}}`); 3700–6200 ms run 2 net fit; ratio ~×2.83.
- **Controls:** none. **glow_focal:** `kinetics_mark`.
- **Narration (55 words, closing multi-step caveat):** "Fresh boxes always read about twice — the reference chip up top. Now try the same test on a box that has already been running, with the reverse reaction on. Double A here, and the net rate reads clearly more than twice. If you trusted this, x would come out wrong. Real reactions can hide several steps — one more reason to measure fresh."

### S9 — "Rate against concentration: a line" (advanced, `trace-the-line`)
- **Charge:** A90/B90/AB0 = 180, `reverse_attempt_per_s: 0`. `kinetics_mode: 'rate_vs_quantity'`,
  `kinetics_rate_series: 'fwd'`, `kinetics_x_source: 'reactant_product'`, **`kinetics_window_ms: 2500`** (DQ-5).
- **Motion:** 0–32000 ms run-down accumulating ~10–12 points; `nA` live — a teacher drag extends the line outward.
- **Controls:** `nA`. **glow_focal:** `kinetics_plot`.
- **Narration (45 words):** "Every few seconds this plots one point: the rate right now, against A times B right now. The points land on one straight line through the origin — that is what order one in each looks like. Its slope is k. Pour in more A, and the new points land on the same line."

### S10 — "Breaking apart: order one" (advanced, `trace-the-line`, **contrast pair with S9**)
- **Entry recomposition:** `species_counts: {A:0, B:0, AB:90}`, `reverse_attempt_per_s: 8`.
  `kinetics_rate_series: 'rev'`, `kinetics_x_source: 'product_count'`, `kinetics_window_ms: 2500`,
  **dwell / `eye_capture_ms` ≈ 19000–20000 ms** (DQ-6 — the decay plateaus by t≈20 s).
- **Motion:** dimers break one by one; the plot accumulates its own line as AB sweeps 90 → ~40.
- **Controls:** none. **glow_focal:** `kinetics_plot`.
- **Narration (42 words):** "Start from pure product this time. Now we plot the breakup rate against how much AB is left. Again a straight line through the origin — but a different line, a different slope. Breaking apart is order one: a different law from the one that built it."

### S11 — "Your experiments" (core, `drag-sandbox`, `interaction_complete`)
- **Charge:** home pose A90/B90/AB0/X0 = 180, `reverse_attempt_per_s: 0`; slider defaults = home pose (drag-seize).
- **Motion:** continuous (Rule 37); **`show_kinetics_new_run: true` (REQUIRED — DQ-0)**; kept-chip row persists the
  previous run's fitted rate. `kinetics_rate_basis: 'concentration'` so the `V` slider reads honestly (DQ-3).
- **Controls:** `nA`, `nB`, `V`, `T`, `New run`. **glow_focal:** none (teacher's own focus).
- **Narration:** none (0 / open).

**Per-state reverse layer:** 0 on S1–S7, S9, S11 · **8** on S8 and S10 (authored explicitly everywhere — the renderer
default is 3.5 and inheriting it would teach `dynamic_equilibrium`'s lesson by accident).

---

## §4 — Notation + dialect ladder (Rule 38c/38d)

- Core/extended (S1–S8, S11): arithmetic and ratio forms only — `rate = k[A]ˣ[B]ʸ`, `x = ? → 1`, `x + y = 2`,
  `k = rate ÷ (A × B)`. No logarithms, no calculus, no vector notation below the advanced ring.
- Advanced (S9–S10): straight-line graphs with slope = k — still arithmetic (a slope, not a derivative).
  **No `d[A]/dt` anywhere in this concept** — genuinely not needed at this depth; declared N/A, not smuggled.
- No dual-label needed: "order", "rate constant", "initial rate" are standard across every board in scope.
- Unicode throughout: `rate = k[A]ˣ[B]ʸ`, `→`, `⇌`, `×`; species chips read `A`, `B`, `AB`, never `N_A`.

---

## §5 — Drill-down cluster phrasings (5 student-voice phrases each)

**`order_from_doubling`** — "if I double A and the rate stays the same, is the order zero?" · "why does order 2 mean
the rate goes up by 4, not 2?" · "how do I turn 'rate tripled' into an exponent?" · "is order always a whole number?" ·
"what if doubling A makes the rate go up by 3, not a clean power of 2?"

**`why_not_coefficients`** — "the equation already has the numbers in it, why do we need to measure again?" · "why
doesn't the balanced equation just tell us the order?" · "if this reaction's order does match the equation, isn't that
the same thing?" · "how would I even know if a reaction has hidden steps?" · "why did doubling A give the wrong answer
on the second box?"

**`initial_rate_data_tables`** — "why do we only look at the START of the graph, not the whole curve?" · "if the rate
keeps changing, which rate do I even write down?" · "how is initial rate different from average rate?" · "why can't I
just use the rate from the middle of the reaction?" · "what if two experiments don't start at the exact same
concentration?"

**`rate_constant_vs_rate`** — "if k doesn't change, why does the rate still fall?" · "is k just the rate at the very
start?" · "why does the unit of k look different for different reactions?" · "does k depend on how much A and B I put
in?" · "if I double the temperature, does k double too?"

**`k_units_by_order`** — "why does k have different units for a first-order vs second-order reaction?" · "how do I
figure out the units of k just from the rate law?" · "is k ever unitless?" · "why does mol/L show up in k's units at
all?" · "does the unit of k tell me the order?"

**`k_only_temperature`** — "does a catalyst change k?" · "why does heating change k but stirring doesn't?" · "is k the
same thing as the activation energy?" · "if I cool the reaction back down, does k go back to where it was?" · "why
does k not care how much A or B I have?"

**`rate_vs_conc_graph_shapes`** — "how do I tell order 0 from order 1 just by looking at the graph?" · "why is the
order-2 graph a curve and not a line?" · "what does a flat line on this graph mean?" · "if the graph curves upward, is
that order 2 automatically?" · "why does the graph start at zero?"

**`slope_reads_k`** — "why is the slope of this line equal to k?" · "what if my points don't actually make a straight
line?" · "does a steeper line mean a bigger k or a bigger order?" · "how do I read k off the graph without doing
algebra?" · "why does the line have to pass through the origin?"

**`line_through_origin_meaning`** — "why does the line have to start at zero, zero?" · "what would it mean if the line
didn't pass through the origin?" · "is zero rate at zero concentration obvious, or does it need proving?" · "could two
different reactions give the exact same line?" · "what does the line look like for an order-2 reaction instead?"

---

## §6 — Constraint callouts for json_author

1. **No unit conversions live here** — raw particle counts throughout; T is already in K per the shared apparatus.
2. **Particle-count scale factor:** counts REPRESENT concentration at fixed box volume — legend
   `counts stand for concentration (box volume fixed)` on S2 only, dropped after (Rule 25). **S4 narration must note
   that the piston changes concentration by changing volume, not counts.**
3. **Per-run species-count sums (the validator checks only ONE sum per state — get these right by hand):**

| State | Run 1 sum | Run 2 sum (reseed) |
|---|---|---|
| S2 | A90+B90+AB0 = **180** | A180+B90+AB0 = **270** |
| S3 | A90+B90+AB0 = **180** | A90+B180+AB0 = **270** |
| S4 | A90+B90+AB0 = **180** | A90+B90+AB0 = **180** (volume changes, counts do not) |
| S5 | A90+B90+AB0+X0 = **180** | A90+B90+AB0+X90 = **270** |
| S8 | A77+B77+AB13 = **167** | A154+B77+AB13 = **244** |
| S10 (entry only) | A0+B0+AB90 = **90** particles (= 180 atoms) | — |
| S1, S6, S7, S9, S11 | A90+B90+AB0(+X0) = **180** | — |

4. **Window/dwell fields authored as measured, never left to defaults:** `kinetics_window_ms: 2000` on S2/S3/S4/S5
   (the honesty-bound ceiling, DQ-1) · `2500` on S8/S9/S10 (DQ-2/DQ-5) · S10 dwell ≈ 19000–20000 ms (DQ-6).
5. **`kinetics_rate_basis: 'concentration'` on S4 and S11** (DQ-3); count basis elsewhere.
6. **No log scale anywhere in this concept.**
7. **`design.phys_seed: 29919362`** at config level — re-verify against the assembled JSON before `visual:approve`.

---

## Self-review confirmations

Every quantity carries a unit and a `variables` entry ✓ · balanced-equation ledger complete for all three forms ✓ ·
every state's motion maps to a `gas_box` [LIVE] capability ✓ · Rule 31 timeline for all 11 states with t-windows and
controls ✓ · Rule 32 cause-first on every reseed (readable 1000–1500 ms gap before the second fit opens) ✓ · Rule 33
instruments carry live numbers ✓ · word budget honored on every guided state (44 / 48 / 33 / 52 / 46 / 41 / 38 / 55 /
45 / 42; S11 open) ✓ · Rule 41 plain literal English, no idioms ✓ · ratios and directions only — no absolute rate or k
in any narration line ✓ · notation ladder holds; no calculus needed even in advanced ✓ · 5 phrases × 9 clusters ✓ ·
constraints conservation-first ✓ · every DQ item is a live measurement against the emitted renderer, not an estimate ✓ ·
bug queue consulted, 9 rows applied ✓ · source-check line present ✓.

**Open items carried to json_author / the founder:**
1. **S4 numbers pending** the `kinetics_rate_basis: 'concentration'` engine addition (DQ-3 session ruling). The piston
   stays; the ×4 must be re-measured on the new basis before the state is locked.
2. **`design.phys_seed: 29919362`** — measured against a minimal harness; re-verify on the assembled JSON.
