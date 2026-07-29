# ARCHITECT SKELETON — collision_theory_activation_energy
# "Collision theory and activation energy" · P1 #4 · tier 💎
# NCERT Chemistry Class 12 Ch.3 (Chemical Kinetics) §3.5 · IB DP Reactivity 2.2 · AP Chem Unit 5 · Cambridge A-level Reaction Kinetics
# Renderer: particle_field · scenario_type: "gas_box" (SAME engine as le_chateliers_principle / kinetic_particle_theory / dynamic_equilibrium — no new renderer family)
# Authored 2026-07-29, branch feat/chemistry-collision-theory
# EVERY number below is from docs/skeletons/collision_theory_measurements.txt and
# docs/skeletons/collision_theory_dq.txt — nothing computed from theory.

---

## 1. Atomic claim

This concept teaches ONE thing: a reaction's rate is set by the small fraction of collisions
energetic enough to clear the activation-energy barrier — not by the collision count — and only
that. It does NOT cover the reaction-coordinate energy profile / transition state (deferred to
P2 #9 `reaction_energy_profile`), the four-factor rate survey (deferred to P1 #3
`rate_of_reaction`, which this concept is the mechanism FOR), or the quantitative
Maxwell–Boltzmann distribution (deferred to P1 #5).

## 2. State count + arc — 8 states (rationale)

Medium-complex (CLAUDE.md §5: complex 7–9). Eight states because the concept has exactly seven
demonstrable, measured, mutually distinct beats plus the explore sandbox — and every one of the
seven earns its click with a measured number: the 3-in-100 fraction (S1), the barrier on the
distribution (S2), the heat contrast ×6.06-clearing-vs-×1.34-collisions (S3), the crowding contrast
flat-fraction (S4), the catalyst barrier-drop (S5), the partner requirement 183→6→2 ladder (S6),
and measured Arrhenius linearity R² 0.95 (S7). Nothing is padding; nothing demonstrable is cut.

Arc: rare-event hold → barrier revealed → heat contrast → crowd contrast (declared pair with S3)
→ catalyst → partner filter → Arrhenius line → explore.

## 3. Per-state control table (Rule 31 — THE first design artifact; auditor checks the build against this)

Home pose (Rule 32d, ALL states open here): 180 discs (A:90 blue, B:90 pink, AB:0 explicit),
T = 300 K, Eₐ = 3 kT, ea_ref_T = 300, speed_scale = 0.105, hist_ref_T = 300, reaction layer
DISABLED until S6. Measured home readout: **183 collisions/s · 6.0/s clear Eₐ · 3.30%**
(5-seed band 2.91–3.45%).

| # | ring | teaches (one idea) | motion archetype | ≤5-word delta cue | DISTINCT motion + delta line | live controls | key instruments (focal ★) | EN words | dur |
|---|---|---|---|---|---|---|---|---|---|
| S1 | core | almost no collision has enough energy — the counter proves it | `rare-event-hold` (coined: the story is the RATIO of two live event streams — constant collision traffic vs rare clearing flashes) | Collisions everywhere, almost none | box runs at home pose; clearing collisions FLASH and mark discs hot, ~once per 2 s against constant traffic. Delta: opening — the 3-in-100 number lands | none | ★collision counter chip | 25–45 | 20s |
| S2 | core | the barrier sits ON the speed distribution; only the fast tail is over it | `reveal-build` | The barrier on the distribution | histogram assembles live from the moving particles, theory curve settles over it, THEN the yellow Eₐ threshold line drops in and the tail SHADES. Delta: the barrier becomes a visible line | none | ★speed histogram + threshold (`hist_ref_T` 300; **counter OFF** — trap 1) | 30–55 | 22s |
| S3 | core | heating multiplies the CLEARING fraction, barely the collision count — **PRIMARY aha** | `heat-the-box` | Heat: the tail explodes | `T_from` 300 → 600 over 6 s (thermometer climbs FIRST, Rule 32a); curve slides right against the PINNED axis, shaded tail swells, chip fraction climbs 3.30% → 14.7%. Delta: same box, hotter — fraction ×4.45, collisions only ×1.34 | none | thermometer, histogram (pinned axis), ★counter chip | 35–55 | 26s |
| S4 | core | crowding raises the rate the OTHER way: more hits, same odds — **declared contrast pair with S3** | `crowd-the-box` (realised as the piston squeeze) | Crowded: more hits, same odds | piston slides 1.00 → 0.40 over 6000 ms (`piston_ramp_ms`; `adiabatic: false`, temperature never narrated); traffic thickens ×2.79, fraction holds 3.95% → 3.32%. Delta: same molecules, less room — count up, odds unchanged | none | piston, ★counter chip | 30–55 | 20s |
| S5 | core | a catalyst LOWERS the bar; it does not speed the molecules | `barrier-drop` (coined: the ONLY moving element is an instrument line sliding down an unchanged distribution) | Barrier drops, same speeds | `ea_at_cue` fires mid-state: Eₐ 3 → 1.5 kT at fixed 300 K. The histogram curve HOLDS POSE (speeds never change — the visual counter); the ★yellow line slides DOWN, newly-shaded tail lights, chip goes 3.13% → 18.06%. Delta: the bar moved, the molecules didn't | none | histogram + ★threshold line, counter chip | 30–55 | 22s |
| S6 | extended | clearing Eₐ is necessary, not sufficient — the right PARTNERS must meet | `filter-funnel` (coined: one event stream through two successive visible filters — energy, then identity) | Clearing isn't enough | reaction layer ON for the first time: clearing A–A / B–B pairs flash and bounce apart; clearing A–B pairs BOND into joined pairs. The ladder reads across the chips: collisions → clear Eₐ → react. Measured **react/clear = 37.8% (band 34.9–40.0%)**. Delta: a second filter appears | none | counter chip + ★reaction readout | 35–55 | 26s |
| S7 | advanced | the box obeys Arrhenius: ln(fraction) vs 1/T is a straight line, slope −Eₐ/k | `trace-as-you-cause` | One straight line | T ramps 250 → 800 K while the Arrhenius plot accumulates measured points; **measured R² 0.9535, slope −885 against the ideal −900 (1.7%)** at a 4 s sampling window, 8 points in 32 s. Delta: every temperature beat collapses onto one law | none | ★Arrhenius plot (NEW instrument, `show_arrhenius_plot`), counter chip, thermometer | 30–55 | 34s |
| S8 | core | your turn — every lever moves the same two numbers | `drag-sandbox` | All yours — push it | continuous run (Rule 37); teacher drags T / Eₐ / V and the counter + histogram respond live. The fridge beat lives here: T → 200 drops the fraction to 0.67% | ALL: T (200–800 K), Eₐ (1–5 kT, the kT-calibrated slider), V (piston) | counter chip, histogram + threshold, ★gas box | 0/open, ≤40 | 14s |

**Rule 32 legibility plan (all states):** cause first with a readable beat — S3 thermometer before
the tail, S4 wall before the traffic, S5 the line before the chip, S6 the bond flash before the
readout; only the taught variable moves per state (S4 authored isothermal so temperature never
smuggles in — the le_chatelier S3 precedent); the delta cue is the caption opener; same box, same
home pose, every state; exactly one glow focal (★) per state.

**Narration number policy — MEASURED, non-negotiable.** Speak ONLY the percentage, the ratio and
the direction. Never an absolute collisions/s or clear/s value. **This is now proven, not assumed:
across 900×560 / 1280×720 / 1600×900 / 760×480 the absolute collision rate spans ×5.29 (54–283 /s)
while the PERCENTAGE spans ×1.05 (3.22%–3.39%).** The percentage is a ratio of two co-varying
rates and is the only magnitude on this chip that is safe to speak.

## 4. Misconception confrontation plan (Rule 16a — 3 genuine pivots, not a per-state tic)

| wrong belief | state | contrast beat (sequential, never superimposed; no predict→reveal) |
|---|---|---|
| "Every collision between reactant molecules produces a reaction" | S1 | the naive expectation plays first — the box IS full of collisions, traffic constant — then the chip's second number lands: barely 3 in 100 carry enough energy. `visual_counter`: clearing flashes are visibly RARE against constant traffic. Fix: "colliding is common; colliding hard enough is rare." |
| "Heating speeds reactions by making molecules collide more often" | S3 | the chip shows the collision count FIRST ("collisions barely rise — about a third more"), THEN the clearing number soars. `visual_counter`: collisions ×1.34 vs clearing ×6.06 on the same chip. Fix: "heat's real gift is the energy of each hit, not the number of hits." |
| "A catalyst works by making molecules move faster" | S5 | the histogram holds pose through the whole state — speeds untouched — while the barrier line alone slides down and the fraction jumps. `visual_counter`: an unchanged distribution under a moved threshold. Fix: "the catalyst lowers the bar; it never touches the molecules." |

Fourth governing belief — "activation energy is the energy the reaction gives out" — is handled by
NARRATION FRAMING in S2 (Eₐ introduced as a cost of entry, "a bar to clear on the way in", tested
on the INCOMING pair at impact), not by a `misconception_watch` row: its full visual confrontation
needs the reaction-profile energy diagram, which is P2 #9's apparatus and this box cannot draw it
(§"cannot show"). Declared, not quietly dropped.

EPIC-C branches: none authored (EPIC-L-first directive).

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S3** — the primary aha and the historically stickiest point (why a modest T rise multiplies rate).
- **S5** — catalysis is the most-asked exam mechanism and the most-misheld belief.

## 6. Drill-down clusters

S3: `fraction_vs_frequency` · `exponential_tail_sensitivity` · `cooling_slows_reactions`
(the fridge run in reverse — measured: 300 → 200 K takes the fraction 3.22% → 0.67%, clearing ×0.17).
S5: `catalyst_alternate_pathway` · `catalyst_not_heat` · `catalytic_converter_case`.

## 7. entry_state_map

```
foundational:            STATE_1 → STATE_4   # CONTAINS the primary aha (S3)
temperature:             STATE_3
concentration_pressure:  STATE_4
catalyst:                STATE_5
effective_collisions:    STATE_6
arrhenius:               STATE_7
exploration:             STATE_8
```

## 8. Prerequisites (advisory, Rule 23)

- `kinetic_particle_theory` (SHIPPED, baseline-locked) — moving particles, temperature-as-speed.
Note: `le_chateliers_principle` (shipped) already DECLARES this concept a prerequisite — building
it closes that dangling edge. `rate_of_reaction` (P1 #3, unbuilt) will declare this concept as ITS
mechanism prerequisite, not the reverse.

## 9. Real-world anchor (Rule 35 / 38f — universal, physics-true)

**Primary — the spark.** Fuel vapour and air sit mixed in a tank or a lighter, molecules colliding
billions of times a second, for months — and nothing happens. One spark, and the same mixture burns
instantly. The gap between "colliding" and "reacting" IS the activation energy. Universal
(fuel, lighters, gas stoves exist everywhere), device-neutral, true at every depth.
**Secondary — the fridge.** The same food keeps days on a counter and weeks in the cold: cooling
300 → 200 K cuts the clearing fraction to a fifth (measured 3.22% → 0.67%) — spoilage reactions
starved of energetic collisions. Surfaces in S3's deep-dive + S8.
**Catalyst hook (S5, one clause):** a catalytic converter cleans exhaust by lowering the bar for
reactions that would otherwise need far more heat — widest-syllabus-overlap device (38f).

## 10. Definition of Done (Gate 0 — no TBDs)

(a) **States:** S1 rare-event hold (3.30%) · S2 histogram + threshold reveal · S3 heat contrast
(×1.34 vs ×6.06) · S4 piston crowd contrast (×2.79 count, flat fraction) · S5 `ea_at_cue` catalyst
drop (3.13% → 18.06%) · S6 reaction-on partner filter (react/clear 37.8%) · S7 Arrhenius trace
(R² 0.95, slope within 1.7%) · S8 explore (T, Eₐ, V; continuous).
(b) **Symbol-label table:** Eₐ → "Eₐ" (chip + threshold line) · T → "T = NNN K" (thermometer) ·
speed axis → "speed →" with the engine's v_mp/v_avg/v_rms markers **suppressed via
`hist_speed_marks: false`** (Rule 25 — those are P1 #5's untaught terms) · fraction → the chip's
"(N.N%)" · species → A (blue), B (pink), AB (joined pair, narrated "a joined pair" — engine-fixed
vocabulary) · S7 axes → "ln f" vs "1/T".
(c) **Balanced-equation ledger:** the ONLY reaction is A + B → AB, surfaced in S6 alone; abstract
model species — no state symbols, no oxidation numbers, counts are model counts never moles; atoms
conserved by the engine (`check:gas-reaction`). Forward direction only is narrated; the engine's
first-order reverse runs but is never mentioned (AB net-positive: 28 after 20 s at 300 K).
(d) **Motion plan:** per the control table — every state's motion column, no static state, cause first.
(e) **Config/modes:** `particle_field` · `gas_box` · `T_from`/`T_ramp_ms` (S3, S7),
`piston_from/frac` + `piston_ramp_ms: 6000` + `adiabatic: false` (S4), `ea_at_cue` (S5),
`reaction.enabled` per-state S6 only, `hist_ref_T: 300` wherever the histogram shows,
**`species_counts` authoring `{A, B, AB}` EXPLICITLY in every state** (gasInit leftover-budget
trap), `Ea` slider in kT with the `userTouched` guard, `scenario_cue` bound on the narration
sentence for EVERY cue, `eye_capture_ms` ≥ state duration.
(f) **misconception_watch:** exactly as §4 (three rows).
(g) **Rule 33:** the taught variables are natively particulate — the particulate view LEADS every
state; the macro level is carried by the anchor narration (spark / fridge / converter); symbolic
enters only as S6's equation and S7's line, AFTER their particulate story plays. Instruments carry
33d: chip and thermometer show live numbers; the S7 plot accumulates measured points.
(h) **Canvas budget (Rule 34):** ONE formula surface per state — S1/S2: none; S3–S5 + S8:
`rate ∝ (collisions/s) × (fraction clearing Eₐ)` (algebra-only, earned in S3, persists);
S6: `A + B → AB`; S7: `ln f = c − Eₐ/kT` (with c explicit — **NEVER `f = e^(−Eₐ/RT)` as a value
claim**). Captions = the delta cues only; chips are value-only; Unicode throughout (Eₐ, ×, ∝, −).
(i) **Curriculum-flex (Rule 38):**
  (i-1) cut checks: hide advanced (S7) → S1–S6 + S8 coherent; hide advanced+extended (S6+S7) →
  S1–S5 + S8 coherent (reaction layer, AB, "partner" and the equation surface are QUARANTINED to S6).
  (i-2) explore = core content only: no reaction layer, no Arrhenius plot, core formula surface.
  (i-3) curriculum_tags: CBSE/NCERT Cl.12 Ch.3 §3.5 `verified: true`; IB DP Reactivity 2.2 · AP Chem
  Unit 5 · Cambridge A-level Reaction Kinetics · Cambridge IGCSE (partial — qualitative only) —
  ALL `needs_teacher_verification: true`.
  (i-4) presets: full · core+extended (hide S7) · core-only (hide S6+S7). Hide, never reorder.
  (i-5) graph axes: histogram v(x)/count(y); Arrhenius ln f (y) vs 1/T (x) — the convention shared
  by NCERT, IB, AP and A-level. **No closed-form distribution formula is printed anywhere** — this
  is a 2D Rayleigh gas, not the 3D NCERT form.

## Two-pass lens — Block 1 (strategic)

**Prerequisite cliff.** `kinetic_particle_theory` → the concept breaks at S2 if the student doesn't
hold "one temperature, many speeds": the threshold line means nothing on a distribution they don't
believe exists. Patch: S2's histogram ASSEMBLES from the live particles the student is already
watching — the opening sentence re-derives the spread from the box itself.

**Exam-backwards trace (NEET/JEE-Main style).** *"A 10 K temperature rise near room temperature
roughly doubles the rate of many reactions, although the collision frequency rises only a few
percent. Explain using collision theory. How does a catalyst achieve a similar rate increase
without changing the temperature?"* — distribution + barrier: S2; fraction vs frequency with
measured ratios: S3 (S4 the control case); Arrhenius quantitative form: S7; catalyst at fixed T:
S5; effective-collision vocabulary: S1 + S6. No missing piece.

**Misconception entry mapping.** Beliefs 1–3 → S1/S3/S5 watch rows. Planting risk: S1's "collisions
everywhere" opening could itself reinforce belief 1 if the fraction lands late — choreography puts
the chip's clearing number in the SAME beat; S4 could plant "crowding doesn't matter" — its
narration closes with the rate direction. Belief 4 → framed at S2, fully confronted in P2 #9.

## Two-pass lens — Block 2 (aha designation)

- **PRIMARY aha (S3):** heating multiplied the reaction-relevant number six-fold while the collision
  count barely moved — the rate lives in the FRACTION of collisions over the barrier, not in the traffic.
- **SUPPORTING (2):** S1 — almost no collision counts (installs the fraction as a thing that exists);
  S5 — the catalyst moves the SAME fraction from the other side, bar down instead of tail up.
  S4 is the deliberate foil (a rate rise that does NOT go through the fraction).
- **Wrong-belief setup:** S1+S2 leave the student holding "more/harder collisions is about how OFTEN
  they hit"; S3 breaks it. S3 has just taught "raise the tail", so "a catalyst must also energise
  molecules" is freshly earned; S5 breaks it with the held-pose histogram.
- **Foundational coverage:** primary aha S3 ∈ foundational (S1–S4). Satisfied.

## What this sim CANNOT show (declared omissions)

1. **True molecular orientation / steric geometry.** The engine's honest analogue is the PARTNER
   requirement (an A must meet a B — measured: only 37.8% of Eₐ-clearing collisions react). This IS
   teachable honestly in S6 as identity-of-partners and it is real chemistry — but it is NOT
   orientation, and the narration NEVER uses the word "orientation" or claims to show NCERT's steric
   factor P. Orientation is a declared omission.
2. **The reaction-profile energy diagram** (reactants → hump → products, ΔH, transition state) —
   P2 #9's job; also the full confrontation of belief 4.
3. **The 3D Maxwell–Boltzmann form** — this is a true 2D gas (2D Rayleigh); no distribution formula
   is printed anywhere.
4. **Absolute Arrhenius values** — the slope is measured right to 1.7%; the prefactor is geometric
   (~0.66) and `f = e^(−Eₐ/RT)` is never printed as a value claim.
5. **The histogram-tail % and the counter %** are different questions (4.98% of particles above
   √(2Eₐ/m) vs 3.30% of collisions clearing Eₐ along the line of centres): S2 shows the histogram
   WITHOUT the counter; S3 shows both but narrates direction only; no sentence ever joins them.
6. **Surface area** (solid-phase cause — no solid phase in this box; P1 #3's declared snag).
7. In S1–S5 the reaction layer is OFF: clearing collisions flash but nothing reacts. Narration in
   those states says "carry enough energy to clear the barrier", never "react" — "react" is first
   spoken in S6 where reacting is visible.

## Reaction layer decision

ON in **S6 only**. The three-number ladder is the engine's strongest single beat and needs the
layer; everywhere else it would blur each state's one idea and drag AB vocabulary across the
extended-ring quarantine. Constants: shipped defaults with `activation_fwd_kT: 3` matching the
concept's `activation_energy_kT: 3`, so both barriers on screen stay ONE number.

## Design questions — ALL FOUR SETTLED BY MEASUREMENT (2026-07-29)

- **DQ-4 — is the chip PERCENTAGE viewport-stable? YES, decisively.** Absolute collisions/s spans
  ×5.29 across four viewports (54–283 /s); the percentage spans **×1.05** (3.22–3.39%). The
  narration policy is measured, not assumed.
- **DQ-2 — is a live-ramp Arrhenius line signal or noise? SIGNAL.** 8 points at a 4 s sampling
  window: **R² 0.9535, slope −885 vs the ideal −900 (1.7% off)**, and 8 × 4 s = 32 s fits inside one
  state. An 8 s window gives R² 0.9910 but needs 64 s (too long). Tripling the density does NOT help
  (R² 0.9508, slope −1020) — so **no Rule-32d density exception is needed**, unlike le_chatelier's K chip.
- **DQ-1 — does an Arrhenius instrument earn its build? YES**, on DQ-2's numbers. Built as
  `show_arrhenius_plot`, landed on master separately (Rule 40) with its own gate checks. If the
  founder reverses this, CUT S7 → 7 states, the advanced ring empties, and both cut checks still hold.
- **DQ-3 — piston or injection for S4? PISTON, decisively.** Measured: the piston gives ×2.79
  collision count at a flat fraction (3.95% → 3.32%). **Injection measured ×1.00 — it does
  literally nothing**, because with the reaction layer OFF `gasSyncCount` truncates the box straight
  back to N on the very next tick. `inject_cue` is a reaction-mode-only mechanism. Recorded as a
  scar candidate; the piston is the right beat anyway (the wall is a cause that visibly moves).

## Scar-list compliance note

Doc-mirrored scars applied: stale sim-cache seeding (`_seed_chemistry_cache.ts` before any
eye_walker dispatch) · viewport-dependent absolute readouts (narration policy above, now measured) ·
cue/narration desync (`scenario_cue` on every cue sentence) · gasInit leftover-budget species fill
(explicit `AB: 0` everywhere) · archetype = RHYTHM not label (S3/S4/S5 differ in WHAT moves) ·
contrast beats sequential · piston default stroke overheats (`piston_ramp_ms: 6000`) ·
duplicate JSON keys resolve last-wins and no gate reports it (whole-file audit before declaring done).

## New scar candidates raised by THIS build (measured, not yet filed)

1. **`inject_cue` is silently undone when the reaction layer is off** — `gasSyncCount` truncates the
   box back to N on the next tick. Measured ×1.00 effect. An authored disturbance that vanishes.
2. **A per-state `N` is inert on entry in a reacting box** — `gasInit` places by `species_counts`
   (or the species list's own counts) and never consults `gasCount()` unless a species is left
   undeclared; `gasSyncCount` then pins `gasNPrev` and returns. Measured: a state authoring `N: 360`
   opens at 120. Now pinned by a `check:gas-reaction` assertion.
3. **The `Ea` slider had no `userTouched` guard** — merely DECLARING it replaced every state's
   authored barrier with the slider default (measured 9.9225 → 6.6 raw, 3.16% → 10.01%). Every other
   gas slider had the guard; this one was the outlier. Fixed + pinned.
