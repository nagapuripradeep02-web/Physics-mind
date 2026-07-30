# ARCHITECT SKELETON — collision_theory_activation_energy
# "Collision theory and activation energy" · P1 #4 · tier 💎
# NCERT Chemistry Class 12 Ch.3 (Chemical Kinetics) §3.5 · IB DP Reactivity 2.2 · AP Chem Unit 5 · Cambridge A-level Reaction Kinetics
# Renderer: particle_field · scenario_type: "gas_box" (SAME engine as le_chateliers_principle / kinetic_particle_theory / dynamic_equilibrium — no new renderer family)
# Authored 2026-07-29; REWRITTEN AS-BUILT 2026-07-30 after the founder question
# "what is activation energy? did you define anything in the simulation?" — the
# arc is now NINE states, not eight. Every state number below is the SHIPPED one.
# branch feat/chemistry-collision-theory
# EVERY number below is from docs/skeletons/collision_theory_measurements.txt and
# docs/skeletons/collision_theory_dq.txt — nothing computed from theory.

---

## 1. Atomic claim

This concept teaches ONE thing: a reaction's rate is set by the small fraction of collisions
energetic enough to clear the activation-energy barrier — not by the collision count — and only
that. It DOES now show the reaction-coordinate energy profile — the hill is this concept's opening
instrument, added 2026-07-30 after the founder found that a concept named after activation energy
never drew it. (The transition state as a species, and ΔH / exo-vs-endo as a topic, remain P2 #9's.)
It does NOT cover the four-factor rate survey (deferred to P1 #3
`rate_of_reaction`, which this concept is the mechanism FOR), or the quantitative
Maxwell–Boltzmann distribution (deferred to P1 #5).

## 2. State count + arc — 9 states (rationale)

Eight demonstrable measured beats plus the explore sandbox. The ninth state was NOT padding: the
build originally opened by COUNTING a quantity it had not named — the collision counter prints
"clear Eₐ" and a percentage derived from it, while the words "activation energy" were first spoken a
state later, and the concept never drew the energy hill students are examined on. Both were found by
the founder, not by a gate. STATE_1 now motivates the barrier, names Eₐ and shows it on a hill, and
carries no counter and no histogram so the symbol appears nowhere before it is defined.

Arc: why a barrier exists (definition + hill) → almost none clear it → where the bar sits on the
speed distribution → heat contrast (PRIMARY aha) → crowd contrast (declared pair with S4) → catalyst
→ partner filter → Arrhenius → explore.

**Rings:** core S1–S6 + S9 · extended S7 · advanced S8. The advanced ring is a contiguous block
immediately before the explore state, and both cuts were verified coherent on the built concept.

## 3. Per-state control table (Rule 31 — the auditor checks the build against this)

Home pose (Rule 32d): 180 discs (A:90 blue, B:90 pink, AB:0 explicit), T = 300 K, Eₐ = 3 kT,
`ea_ref_T` 300, `speed_scale` 0.105, `hist_ref_T` 300, `counter_window_ms` 5000 on every counter
state. The reaction layer is OFF everywhere except S7. **S8 is a declared Rule 32d density exception
at 720 discs** (measured: the fitted slope missed the law by 21% at 180, 2.8% at 720).

| # | ring | teaches (one idea) | motion archetype | ≤5-word delta cue | instruments (focal ★) | dur | words |
|---|---|---|---|---|---|---|---|
| S1 | core | a barrier exists, and why: old bonds must break before new ones form | `static-hook` (declared: the gas mills while a fixed diagram carries the idea — the only state with no temporal delta, accepted as the opening hook) | Why nothing reacts yet | ★energy hill with the Eₐ arrow. **No counter, no histogram, no formula surface** — nothing may print a symbol this state has not defined | 22 | 55 |
| S2 | core | almost no collision carries enough energy | `rare-event-hold` | Collisions everywhere, almost none | ★collision counter | 20 | 50 |
| S3 | core | where the bar sits on the speed distribution | `reveal-build` (barrier APPEARS, instant, at a 9 s cue) | The barrier on the distribution | ★histogram + threshold; **counter OFF** (trap 1) | 22 | 53 |
| S4 | core | heating multiplies the FRACTION, barely the count — **PRIMARY aha** | `heat-the-box` (`T_cue`-gated ramp 300→600 K) | Heat: the tail explodes | thermometer, histogram, ★counter | 26 | 52 |
| S5 | core | crowding raises the count and leaves the odds flat — **declared contrast pair with S4** | `crowd-the-box` (`piston_cue`-gated stroke, `piston_ramp_ms` 6000, isothermal) | Crowded: more hits, same odds | piston, ★counter | 20 | 52 |
| S6 | core | a catalyst lowers the bar and never touches the speeds | `barrier-drop` (`ea_at_cue` with `ramp_ms` 3000 — the barrier SLIDES, where S3's APPEARED) | Barrier drops, same speeds | ★hill (3.0→1.5 kT) + histogram threshold, both moving as one number; counter | 22 | 54 |
| S7 | **extended** | clearing is necessary, not sufficient — the partners must match | `filter-funnel` (reaction layer ON, here only) | Clearing isn't enough | counter + ★reaction readout | 20 | 49 |
| S8 | **advanced** | the box obeys Arrhenius | `trace-as-you-cause` (`T_cue`-gated ramp 250→800 K over 28 s) | One straight line | ★Arrhenius plot, thermometer, counter | 34 | 49 |
| S9 | core | your turn | `drag-sandbox` (`interaction_complete`, continuous) | All yours — push it | ★box, hill, histogram, counter, all three sliders | 14 | 32 |

**Term-introduction ledger (Rule 25 — the artifact this build was FAILed twice for lacking).**
A formula surface counts as USE, not just an instrument.

| symbol | first canvas use | defined | 
|---|---|---|
| Eₐ | S1 (hill) | S1 `s1_3` — same state, and the arrow geometry is itself a definition |
| A, B | S7 (`A + B → AB`) | S2 `s2_1` ("ninety blue A discs…") |
| AB | S7 | S7 `s7_1` |
| f, k | S8 (`ln f = constant − Eₐ/kT`) | S8 `s8_3` binds f, `s8_4` binds Boltzmann's k |
| reactants / products / energy | S1 (hill) | S1 `s1_4` |

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

## 4. Misconception confrontation plan (Rule 16a — FOUR rows, at genuine pivots)

| wrong belief | state | contrast beat (sequential, never superimposed) |
|---|---|---|
| "Activation energy is the energy the reaction gives out" | **S1** | the Eₐ span runs UPWARD from the reactant level to the peak — a cost paid on the way in — while `products` sits on a separate LOWER dashed line, which is the energy released. **This belief had no visual counter at all before the hill existed**; the original skeleton deferred it to P2 #9. |
| "Every collision between reactant molecules produces a reaction" | S2 | the box is full of collisions and the chip's second number lands: only a handful in every hundred clear the barrier |
| "Heating speeds reactions by making molecules collide more often" | S4 | the collision count moves first and only modestly, then the clearing percentage climbs several times over, on the same chip |
| "A catalyst works by making molecules move faster" | S6 | the histogram holds pose for the whole state — pixel-verified, the curve peak pinned — while the barrier alone drops on BOTH the hill and the threshold line |

## 5. `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S4** — the primary aha and the historically stickiest point (why a modest T rise multiplies rate).
- **S6** — catalysis is the most-asked exam mechanism and the most-misheld belief.

## 6. Drill-down clusters

S4: `fraction_vs_frequency` · `exponential_tail_sensitivity` · `cooling_slows_reactions`
(the fridge run in reverse — measured: 300 → 200 K takes the fraction 3.22% → 0.67%, clearing ×0.17).
S6: `catalyst_alternate_pathway` · `catalyst_not_heat` · `catalytic_converter_case`.

## 7. entry_state_map

```
definition:              STATE_1 → STATE_2   # the barrier named and shown before anything counts it
foundational:            STATE_1 → STATE_5   # CONTAINS the primary aha (S4)
temperature:             STATE_4
concentration_pressure:  STATE_5
catalyst:                STATE_6
effective_collisions:    STATE_7
arrhenius:               STATE_8
exploration:             STATE_9
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

(a) **States:** S1 the barrier defined on a hill (no counter, no histogram, no formula surface) ·
S2 rare-event hold (3.30%) · S3 histogram + threshold reveal · S4 heat contrast — PRIMARY aha ·
S5 piston crowd contrast · S6 `ea_at_cue` catalyst drop, hill AND threshold moving as one number ·
S7 reaction-on partner filter · S8 Arrhenius trace (slope within 2.8% at the shipped seed) ·
S9 explore (T, Eₐ, V; continuous).
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

- **PRIMARY aha (S4):** heating multiplied the reaction-relevant number six-fold while the collision
  count barely moved — the rate lives in the FRACTION of collisions over the barrier, not in the traffic.
- **SUPPORTING (2):** S1 — almost no collision counts (installs the fraction as a thing that exists);
  S5 — the catalyst moves the SAME fraction from the other side, bar down instead of tail up.
  S4 is the deliberate foil (a rate rise that does NOT go through the fraction).
- **Wrong-belief setup:** S1+S2 leave the student holding "more/harder collisions is about how OFTEN
  they hit"; S3 breaks it. S3 has just taught "raise the tail", so "a catalyst must also energise
  molecules" is freshly earned; S5 breaks it with the held-pose histogram.
- **Foundational coverage:** primary aha S4 ∈ foundational (S1–S5). Satisfied.

## What this sim CANNOT show (declared omissions)

1. **True molecular orientation / steric geometry.** The engine's honest analogue is the PARTNER
   requirement (an A must meet a B — measured: only 37.8% of Eₐ-clearing collisions react). This IS
   teachable honestly in S6 as identity-of-partners and it is real chemistry — but it is NOT
   orientation, and the narration NEVER uses the word "orientation" or claims to show NCERT's steric
   factor P. Orientation is a declared omission.
2. ~~The reaction-profile energy diagram~~ — **NOW SHOWN** (`show_reaction_profile`, S1/S6/S9). Its
   peak is the reaction's forward barrier and its product level the bond energy, so the reverse
   barrier measurable off the picture equals the engine's derived Ea_rev. Still P2 #9's: the
   transition state as a species, and ΔH / exothermic-vs-endothermic as a taught topic.
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

## As-built delta (what the two review rounds changed, 2026-07-29/30)

The 8-state build was FAILed by `quality_auditor` twice and re-walked by `eye_walker` twice. The
changes that altered this skeleton rather than just the JSON:

1. **A ninth state, at the front.** The lesson opened by counting Eₐ before naming it (Rule 25), and
   the concept never drew the hill. Both founder-found. STATE_1 fixes both and closes the fourth
   misconception the original skeleton had deferred.
2. **`show_reaction_profile` was built** — the original skeleton declared the profile undrawable and
   deferred it. A declared omission is a decision, not an exemption; it was re-examined against the
   concept TITLE and reversed.
3. **S8 is a declared density exception** (720 discs). Not in the original design: the Arrhenius
   slope missed the law by 21% at the lesson's normal density.
4. **The term-introduction ledger is now a required artifact** (§3). Fixing Eₐ was not the end of it —
   A/B/AB and f/c/k were all printed before being defined, and a formula surface counts as use.

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
