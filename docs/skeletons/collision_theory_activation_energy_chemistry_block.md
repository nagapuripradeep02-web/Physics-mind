
---

# CHEMISTRY BLOCK — collision_theory_activation_energy
Authored by `chemistry_author` · 2026-07-29 · branch `feat/chemistry-collision-theory`
Renderer: `particle_field` / `scenario_type: "gas_box"` (same engine + reaction sub-capability as
`le_chateliers_principle` / `dynamic_equilibrium` / `kinetic_particle_theory`). All numbers below
trace to `docs/skeletons/collision_theory_measurements.txt` and `collision_theory_dq.txt`, or to a
direct read of `src/lib/renderers/particle_field_renderer.ts` (line refs given inline). Nothing here
is computed from theory alone without a measured or code-verified anchor.

**Engine bug queue consulted (per role spec) before authoring.** Queried
`alex:chemistry_author`, `alex:physics_author`, `alex:json_author`, `peter_parker:runtime_generation`
(variable-class rows), plus concept-specific rows for `kinetic_particle_theory`, `dynamic_equilibrium`,
`le_chateliers_principle`. Prevention rules load-bearing on this build, all satisfied below:
- `gas_box_state4_asserts_unchanged_speed_with_no_instrument` — every state that asserts an unchanged
  quantity (S4's flat fraction, S5's held speed distribution) keeps its proving instrument on screen
  the whole state (counter chip in S4; histogram+threshold in S5).
- `gas_box_slider_default_overrode_authored_state_value` / `pf_readout_ohms_branch_keys_on_bare_slider_name`
  — this concept must NOT reuse a bare single-letter slider id already meaning something else on this
  renderer; `T`, `V` are safe (shared meaning across every gas_box concept); `Ea` is this concept's own
  new addition, landed and gated today (`check:gas-reaction`); no `N` slider is used at all (see §1).
- `gas_box_reaction_count_sync_destroys_atoms` / the `species_counts` leftover-budget trap — every
  state below authors `A`, `B`, `AB` explicitly, `AB: 0` everywhere except S6.
- `eye_frozen_pin_blind_to_emergent_physics` — every guided state below authors `eye_capture_ms` at
  or after its content actually lands (never the 1.5 s default).
- No open/unaddressed row applies to a `particle_field` gas-reaction concept beyond what's threaded
  through §2/§6 below (the two NEW findings this build raised — the reaction layer's config-level-only
  gate, and the `Ea` slider's coupling into `activation_fwd_kT` — are original to this concept and are
  filed as scar candidates in §7, not yet in the queue).

**Source check line:** Consulted the NCERT Chemistry Class 12 Ch.3 (Chemical Kinetics) chapter index
and NCERT Exemplar's collision-theory misconceptions for scope and belief only. No teaching method, no
worked example, no figure imported. All anchors (spark/fuel, fridge, catalytic converter) are
first-principles, universal (Rule 35).

---

## 1. Quantity declarations (`physics_engine_config.variables`)

```json
{
  "T": {
    "name": "temperature of the gas",
    "unit": "K",
    "min": 200, "max": 800, "default": 300, "step": 10,
    "role": "taught_variable",
    "note": "Floor is 200 K, not 250 — measured (collision_theory_dq.txt, S3/S8 cooling table): at 200 K the box is still visibly alive (152 collisions/s, fwd-equivalent clear/s 1.00, fraction 0.67%), and 200 K is the exact floor the fridge beat (S8, and S3's cooling drill-down) needs. Ceiling 800 K matches S7's Arrhenius ramp top and Q2's measured sweep top."
  },
  "Ea": {
    "name": "activation-energy slider, in multiples of kT at ea_ref_T",
    "unit": "",
    "min": 1, "max": 5, "default": 3, "step": 0.5,
    "role": "taught_variable",
    "note": "S8 ONLY. Range justified by Q1/Q4: Ea=1 gives 30.17% (nearly a third of collisions clear — barely a barrier), Ea=5 gives 0.42% (barely any clear — an almost-impenetrable wall). Requires the userTouched guard fixed today (Q7: without it, merely DECLARING this slider silently overrode every state's authored barrier — 3.16% became 10.01% with no drag at all). CAUTION (see §2/§6): touching this slider ALSO overrides physics_engine_config.reaction.activation_fwd_kT (particle_field_renderer.ts:3671) — a coupling built today specifically so the counter and the reaction bars agree in S6 when both show. In S8 this means a teacher who drags Ea low enough can start real AB bonding even though the reaction readout is hidden there (§6 constraint 6)."
  },
  "V": {
    "name": "box volume as a fraction of full width (piston)",
    "unit": "",
    "min": 0.40, "max": 1.00, "default": 1.00, "step": 0.05,
    "role": "taught_variable",
    "note": "S4 + S8 only. Range measured directly (DQ-3 Q3b): piston 1.00→0.40 gives collisions/s x2.79 at a flat fraction (3.95%→3.32%). DQ-3 also PROVED the alternative (injecting more A) does nothing when reaction is off — inject_n is truncated back to N on the very next tick by gasSyncCount (measured x1.00 effect) — so this concept has NO N/concentration slider anywhere, unlike le_chateliers_principle. Do not add one."
  },
  "activation_energy_kT": {
    "name": "the collision-theory barrier the counter/histogram test against, per state (authored, not sliderised except in S8)",
    "unit": "",
    "role": "taught_variable",
    "per_state_values": {
      "S1": 3, "S2": "0 -> 3 via ea_at_cue (see §3 timeline)", "S3": 3,
      "S4": 3, "S5": "3 -> 1.5 via ea_at_cue", "S6": 3, "S7": 3, "S8": "1-5 (Ea slider)"
    }
  },
  "ea_ref_T": { "name": "reference temperature the barrier is pinned to", "unit": "K", "constant": 300, "role": "calibration" },
  "temperature_K": { "name": "opening temperature of the box", "unit": "K", "constant": 300, "role": "calibration" },
  "speed_scale": { "name": "velocity calibration, sigma = speed_scale * sqrt(T/m)", "unit": "px/tick/K^0.5", "constant": 0.105, "role": "calibration" },
  "hist_ref_T": { "name": "pins the histogram's speed axis so the curve moves against a fixed frame", "unit": "K", "constant": 300, "role": "calibration" },
  "N": {
    "name": "total particle count (fixed — no slider in this concept)",
    "unit": "particles",
    "constant": 180,
    "role": "calibration",
    "note": "A:90, B:90, AB:0 at home pose. Not a taught_variable here — crowding is taught via V (piston), not N (see DQ-3)."
  },
  "m_A": { "name": "mass of reactant A", "unit": "engine mass units", "constant": 1, "role": "species" },
  "m_B": { "name": "mass of reactant B", "unit": "engine mass units", "constant": 1, "role": "species" },
  "m_AB": { "name": "mass of the bonded pair — derived, never authored", "unit": "engine mass units", "derived": "m_A + m_B", "role": "species" },
  "r_A": { "name": "disc radius of A", "unit": "px", "constant": 5, "role": "species" },
  "r_B": { "name": "disc radius of B", "unit": "px", "constant": 5, "role": "species" },
  "r_AB": { "name": "disc radius of the bonded pair — derived, never authored", "unit": "px", "derived": "sqrt(r_A^2 + r_B^2)", "role": "species" },
  "activation_fwd_kT": {
    "name": "the REACTION layer's own forward barrier (distinct from activation_energy_kT, the counter's teaching barrier — see §2/§6)",
    "unit": "",
    "role": "reaction_constant",
    "per_state_values": {
      "S1,S2,S3,S4,S5,S7,S8": "suppressed — authored huge (recommend 30) so the reaction never fires while reaction.enabled stays config-level true (see §6 constraint 5)",
      "S6": "3, pinned equal to activation_energy_kT so both barriers on screen are the SAME number"
    }
  },
  "bond_energy_kT": { "name": "energy released on bonding (exothermic forward)", "unit": "", "constant": 2.1, "role": "reaction_constant", "note": "Reused verbatim from the shipped dynamic_equilibrium/le_chateliers_principle constant — not retuned. Never narrated in this concept (declared omission)." },
  "reverse_attempt_per_s": { "name": "Arrhenius pre-exponential factor for a bonded pair's spontaneous decay", "unit": "s^-1", "constant": 8, "role": "reaction_constant", "note": "Reused verbatim, same source. The engine's reverse reaction runs in S6 but is never mentioned (DoD c)." },
  "n_A": { "name": "live population of A", "unit": "particles", "min": 0, "max": 180, "role": "live_readout" },
  "n_B": { "name": "live population of B", "unit": "particles", "min": 0, "max": 180, "role": "live_readout" },
  "n_AB": { "name": "live population of bonded pairs (S6 only)", "unit": "particles", "min": 0, "max": 90, "role": "live_readout" },
  "collisions_per_s": { "name": "total pair-collision rate (gasCollRate)", "unit": "s^-1", "role": "live_readout", "note": "NEVER narrated as an absolute value — viewport span x5.29 (DQ-4)." },
  "clear_per_s": { "name": "rate of collisions clearing Ea (gasSuccessRate)", "unit": "s^-1", "role": "live_readout", "note": "NEVER narrated as an absolute value — same viewport instability as collisions_per_s." },
  "cleared_fraction_pct": { "name": "percentage of collisions clearing Ea — the ONE number safe to speak", "unit": "%", "role": "live_readout", "note": "Viewport span only x1.05 (DQ-4: 3.22-3.39%)." },
  "react_per_s": { "name": "forward reaction rate (gasRxFwdRate, S6 only — engine-fixed label 'fwd')", "unit": "s^-1", "role": "live_readout" },
  "react_clear_ratio_pct": { "name": "react/s divided by clear/s — S6's honest ladder number", "unit": "%", "role": "live_readout", "note": "Measured 37.84% (band 34.86-40.00%) — narrate as 'about a third', never the two raw rates." },
  "arrhenius_slope": { "name": "least-squares slope of ln(cleared fraction) vs 1/T (S7)", "unit": "K", "role": "live_readout", "note": "Measured -885 (R² 0.9535) at a 4 s window / 8 points; nominal -Ea/k = -900 K." },
  "arrhenius_r2": { "name": "goodness of fit of the S7 line", "unit": "", "role": "live_readout" }
}
```

**Numerical sanity check — RUN, not eyeballed** (`python3`):
`s=0.105; refT=300 -> per-kT raw energy = s*s*refT = 3.3075`. `Ea=3 kT -> raw 9.9225` (matches Q6
exactly: "Ea(raw px/tick energy) = 9.9225"). `Ea=1.5 kT -> raw 4.96125`, and `e^-1 = 36.79%`,
`e^-1.5 = 22.31%` reproduce Q1's theory column to the printed precision. Cross-check on the S3
contrast: `246/183 = 1.344` (collisions ratio, matches "collisions only x1.34"); `14.71/3.30 = 4.458`
(fraction ratio, matches "fraction climbs... x4.45"); `36.2/6.0 = 6.033` (absolute clear-rate ratio,
matches the misconception table's "clearing x6.06" — see §2 flag on why these are three DIFFERENT
numbers, not one). `1.344 x 4.458 = 5.99 ≈ 6.03`, confirming the clear-rate ratio is the PRODUCT of
the frequency ratio and the fraction ratio, not an independent measurement of the fraction alone.

---

## 2. The chemistry rigor pass

### Balanced-equation ledger (S6 only — the ONLY reaction this concept surfaces)

**A(model) + B(model) → AB(model)**

- **No state symbols.** A, B, AB are abstract model species, not real substances — there is no (g),
  (l), (s), (aq) anywhere in this concept, and none should ever be printed.
- **No oxidation numbers.** This is not a redox reaction; there is nothing to assign oxidation states to.
- **No ions, no charge.** LHS charge = RHS charge = 0 — trivially, since nothing here carries charge.
- **Atom-count table** (reading "atom" as "model unit", since A/B are not elements):

| unit | LHS count | RHS count (bound inside AB) |
|---|---|---|
| A-units | 1 | 1 |
| B-units | 1 | 1 |

  Conserved by construction at every reaction event (`gasRxResolveSpecies()`; `m_AB = m_A + m_B`,
  `r_AB = sqrt(r_A^2 + r_B^2)`, forced at init — never authored freely).
- **Particle counts are MODEL COUNTS.** `n_A: 90` on screen means ninety model particles, full stop —
  never "0.09 mol", never "a concentration of X mol dm⁻³". This box has no Avogadro-scale content and
  no molarity; narration must never use "mol" or "concentration" language anywhere in this concept.

### Rigor-check on the six committed claims

**(a) "Activation energy is a barrier the colliding pair must clear, tested on the way in."** ✅
**Correct, and verified against the exact collision code.** `gasResolvePair()` (particle_field_renderer.ts
:4279-4324) computes `vn`, the PRE-impulse approach speed along the line of centres, tests
`0.5 * mu * vn^2 >= ea` (reduced mass `mu`, the textbook line-of-centres criterion), and does this
BEFORE applying the elastic bounce — the code's own comment confirms: "Reaction test LAST, on the
pre-impulse approach speed captured above." "Tested on the way in" is not a simplification here; it is
literally what the engine computes. Keep this exact framing.

**(b) "Raising temperature raises the fraction far more than it raises collision frequency"
(×4.45 vs ×1.34, 300→600 K).** ✅ **Correct as stated in the per-state table — but flag a wording trap
elsewhere in the skeleton.** The §4 misconception table for S3 instead cites "collisions ×1.34 vs
clearing ×6.06" — that "×6.06" is the ratio of the **absolute clearing rate** (clear/s), which equals
the frequency ratio **times** the fraction ratio (1.344 × 4.458 = 5.99 ≈ 6.03 — confirmed above, not a
coincidence). It is a real, on-screen, ratio-of-two-readable-numbers and is fine to narrate as its own
observation ("the number of successful hits per second rose six-fold"), but **it must never be spoken
as if it were the fraction's own growth** — that would double-count the frequency's own small
contribution as if it were all barrier effect. Keep exactly one clean isolated claim in the PRIMARY-aha
sentence: **the fraction (percentage) rose ×4.45 while the frequency rose only ×1.34** — that pairing,
and only that pairing, is the state's teaching point. The ×6.06 clearing-rate number, if used at all,
belongs in a SEPARATE sentence framed as "and because of that, six times as many collisions per second
actually cleared it" — a consequence, not the isolated variable.

**(c) "Crowding raises collision frequency and leaves the fraction unchanged."** ✅ **Correct, cleanly
measured, no caveat needed.** Q3 (N sweep): fraction 3.06%–3.57% across N=90–360 (no trend). Q3b (piston
sweep): fraction 3.19%–3.33% across piston 1.00–0.40 while collisions/s climbs 183→499. This is a
genuinely flat invariant, unlike (b)'s compound number — safe to narrate as "the odds don't change."

**(d) "A catalyst lowers Eₐ and does not change the speed distribution."** ✅ **Correct by
construction.** `ea_at_cue` changes only the value `gasActivationE()` returns; nothing it touches calls
`gasRescaleToT()` or otherwise perturbs velocities. The histogram bars and theory curve are recomputed
every frame straight from the live particle speeds, which the cue never touches — so "the curve holds
pose" is not staging, it is the necessary consequence of the two mechanisms being wired to different
state.

**(e) "Clearing isn't enough — the right partners must meet" as the honest, NON-orientation analogue.**
✅ **Defensible, with one boundary to hold precisely.** The engine has no directional bonding sites at
all (discs are rotationally symmetric), so there is genuinely no orientation factor represented, full
stop — the skeleton is right to declare true orientation/steric geometry a hard omission (§"cannot
show" #1). The "identity of partners" beat (an A must meet a B, not an A-A or B-B pair; measured
react/clear = 37.84%) is REAL, separate, honest chemistry — it is NOT a stand-in FOR orientation, and
must never be framed as one. **Hold this exact boundary in every drill-down and deep-dive**, not just
the top-level narration: never let a follow-up answer say "this is basically what orientation means"
or "so orientation is why only a third react" — the true reason in THIS model is species identity, not
geometry, and NCERT's steric factor P bundles orientation together with other geometric effects this
box does not model at all. The safest phrasing pattern: "in this box, the only thing left to fail after
clearing the barrier is meeting the right kind of partner — real molecules also have to arrive
pointing the right way, which this model doesn't show."

**(f) The Arrhenius claim — exact wording boundary.** Measured: slope −885 to −948 K (band across
sampling conditions) against a nominal −Eₐ/k of −900 K (1.7% off at the shipped 4 s/8-point
configuration), R² 0.9535. Prefactor check (run above): the ratio of measured-to-theoretical fraction
runs from **0.606 to 0.820** across the Ea = 1–5 kT sweep at fixed T = 300 K — "roughly constant" is
fair as a qualitative description (it is NOT a fixed 0.66; that number is only the Ea=3 kT sample).
**Narration MAY say:** "plot the natural log of the cleared fraction against one over temperature, and
the points fall close to one straight line, sloped by the size of the barrier" / "the slope comes out
within about two percent of the barrier's true value." **Narration MUST NOT say:** any literal equality
("the fraction equals e to the minus Ea over kT"), any claim of a fixed universal prefactor, any claim
the fit is exact or R²=1, and the printed formula surface must stay `ln f = c − Eₐ/kT` **with `c`
explicit** (per Definition of Done h) — never `f = e^(−Eₐ/RT)` as a value claim anywhere on canvas.

---

## 3. Within-state motion timeline (Rule 31)

General note applying to S3, S4, S7 (every ramp-driven state): because `T_from`/`piston_from` ramps
are continuous, the physical CAUSE and its EFFECT update from the *same* live variable every frame —
there is no natural temporal gap to insert (unlike a discrete cue). Rule 32a is satisfied here the way
`le_chateliers_principle` S4 already satisfies it: through **narration/glow-focal sequencing**, not a
hard delay — the cause's own instrument (thermometer / piston wall) is the glow-focal for the ramp's
opening seconds, and focus hands off to the counter/histogram once its number has visibly moved. Author
this explicitly per state below; do not try to build an artificial delay into a naturally-simultaneous
physical relationship.

| state | t-window (ms) | animates | driven by | instrument response | cue / `scenario_cue` |
|---|---|---|---|---|---|
| **S1** | 0–20000 | box runs at home pose continuously; per-tick emergent success flashes | nothing authored (steady state) | counter chip live from t=0: "N collisions/s • M/s clear Eₐ (3.3%)" | none — no authored cue this state |
| **S2** | 0–~9000 | histogram + theory curve visible from open (already fully formed at spawn — see flag below); `activation_energy_kT: 0` (no threshold, no shading) | nothing (particles already Maxwellian from `gasPlaceSpecies`'s Gaussian draw) | histogram + curve only; counter OFF | none yet |
| | ~9000 | `ea_at_cue: {cue:"show_barrier", activation_energy_kT:3}` fires — threshold line + shaded tail appear **instantly** (step, not a slide — see §7 flag) | Ea (cue) | threshold + tail from 9000ms on | `show_barrier` cue bound to the sentence introducing Eₐ via `scenario_cue` |
| | 9000–22000 | held; narration completes | — | — | — |
| **S3** | 0–1000 | settled at T=300 | — | thermometer @300K, counter @3.30% | none |
| | 1000 | `T_from:300, T:600, T_ramp_ms:6000` fires | T (cue) | thermometer glow-focal first 0–2000ms (Rule32a sequencing, not a delay) | `"heat"` cue bound to the narration sentence that names the temperature rise |
| | 1000–7000 | T ramps; curve slides right against pinned axis; fraction climbs continuously | T | counter chip glow-focal takes over ~2000ms+ as fraction visibly moves 3.30%→14.7% | — |
| | 7000–26000 | held at 600K; narration states ×4.45 fraction / ×1.34 collisions | — | — | — |
| **S4** | 0–1000 | settled, piston open (1.00) | — | pressure gauge + counter @3.95% | none |
| | 1000 | `piston_from:1.00, piston_frac:0.40, piston_ramp_ms:6000` fires | V (cue) | wall glow-focal first (Rule32a) | `"squeeze"` cue bound to the sentence naming the piston |
| | 1000–7000 | wall visibly slides in; traffic thickens; T fixed 300 throughout (`adiabatic:false`) | V | counter glow-focal takes over as density visibly builds; fraction holds flat 3.95%→3.32% | — |
| | 7000–20000 | held at 0.40; narration states flat-fraction contrast with S3 | — | — | — |
| **S5** | 0–1000 | settled, Ea=3, T=300 fixed all state | — | histogram+threshold @3.13% | none |
| | 1000 | `ea_at_cue:{cue:"catalyst", activation_energy_kT:1.5}` fires — threshold line jumps **instantly** (step, see §7 flag) | Ea (cue) | threshold jump instant; chip % climbs over the next few seconds (rolling-window catch-up, NOT instant) | `"catalyst"` cue bound to the sentence naming the catalyst |
| | 1000–22000 | histogram curve holds pose (only the line moved); chip 3.13%→18.06% | Ea | — | — |
| **S6** | 0–26000 | reaction layer un-suppressed this state only (`reaction:{activation_fwd_kT:3}`); clearing A-A/B-B pairs flash+bounce, clearing A-B pairs bond, live from open — no cue needed, this is a steady-state reveal like S1 | nothing authored | counter chip + NEW reaction-readout chip (fwd/rev bars) both live from t=0; AB count climbs toward ~28-29 by ~20s | none |
| **S7** | 0–1000 | settled at 250K | — | thermometer @250K | none |
| | 1000 | `T_from:250, T:800, T_ramp_ms:32000` fires (**NOT the 2000ms default** — must span the full 8×4000ms Arrhenius accumulation window; 1000+32000+1000 = 34000, the exact authored duration) | T (cue) | thermometer ramps continuously | `"ramp"` cue bound to the sentence introducing the sweep |
| | 5000, 9000, ...33000 | each 4000ms window closes, one Arrhenius point plots (8 total) | Ea fixed 3, T from ramp | Arrhenius plot (NEW instrument, ★focal) accumulates points; thermometer/counter supporting | first several points must land before the "one straight line, R²0.95" sentence's `scenario_cue` fires — recommend ≥21000ms |
| **S8** | 0–14000, continuous (Rule 37, no freeze) | teacher drags T/Ea/V live | teacher | counter chip + histogram+threshold + gas box, all continuously live; no reaction readout, no Arrhenius plot (core-ring only) | none authored (teacher-driven) |

---

## 4. Per-state live control spec (Rule 31)

**CONFIRMED: no live sliders in S1–S7; all three (T, Ea, V) only in S8.** This is the right call —
every guided state's taught variable is driven by an authored ramp or cue, never a teacher-draggable
control; exposing a slider early would let a teacher pre-empt the choreographed contrast (the whole
point of S3 vs S4 as a declared pair is that the CAUSE arrives in a controlled, comparable way).

**One wrinkle to flag, not to redesign:** because the `Ea` slider is wired at the engine level
(particle_field_renderer.ts:3671) to override `reaction.activation_fwd_kT` the instant it is touched
(built today, specifically so S6's counter and reaction bars agree when both are shown), **exposing
`Ea` in S8 also re-exposes the reaction layer's forward barrier** — even though `show_reaction_readout`
is authored `false` there and no Arrhenius/reaction vocabulary appears. A teacher who drags Ea low
enough in S8 CAN start real AB bonding invisibly (no readout shown, but AB discs would visually appear
in the joined-pair colour if it happens). There is no per-state way in the current engine to decouple
this. Recommend: accept it (harmless — a curious teacher who drags Ea very low and notices a new pair
appear is, if anything, reinforcing S6, not contradicting it), but do NOT narrate or design around it
as an intentional beat, and soften Definition-of-Done (i-2)'s "explore = ... no reaction layer" to "no
reaction layer is SHOWN or NARRATED; the underlying bonding capability is not hard-disabled, since no
per-state engine gate exists for it (see §7 scar candidate 2)."

---

## 5. Drill-down student-voice phrases

**`fraction_vs_frequency`** (S3):
1. "wait, if collisions barely go up when you heat it, why does the rate shoot up so much"
2. "so heating doesn't really make them hit each other more, it just makes the hits count more?"
3. "how can the reaction go so much faster if the molecules aren't bumping into each other any more often"
4. "is the fraction the same thing as the rate or is it a totally different number"
5. "why does a small rise in temperature make such a huge difference if collision speed only goes up a little"

**`exponential_tail_sensitivity`** (S3):
1. "why does such a small change in temperature move the fraction so much, that seems too sensitive"
2. "is there a formula for how fast the fraction grows with temperature or is it just random"
3. "why can't I just double the temperature and expect double the fraction"
4. "does the fraction ever stop growing no matter how hot it gets"
5. "why does the tail of the graph move so much more than the peak does"

**`cooling_slows_reactions`** (S3, the fridge run in reverse):
1. "so if heating speeds up a reaction, does cooling always slow it down the same way"
2. "why does putting food in the fridge stop it from going bad if the molecules are still colliding"
3. "does cooling ever completely stop a reaction or does it just get really slow"
4. "why does such a small drop in temperature in the fridge make such a big difference to spoiling"
5. "if I cool something down enough will the reaction just stop happening completely"

**`catalyst_alternate_pathway`** (S5):
1. "how exactly does a catalyst lower the activation energy, what is it actually doing"
2. "does the catalyst turn the reactants into something else first"
3. "if the catalyst lowers the barrier does that mean the reaction becomes exothermic when it wasn't before"
4. "why doesn't lowering the barrier change how fast the molecules are moving"
5. "is the catalyst making a completely different reaction happen or just the same one faster"

**`catalyst_not_heat`** (S5):
1. "isn't a catalyst basically just heating the reaction without a flame"
2. "if a catalyst speeds up molecules like heat does, why does the graph in the video not move"
3. "how is lowering the bar different from raising the temperature if both make the reaction go faster"
4. "does the catalyst give energy to the molecules the way heating does"
5. "why do the two ways of speeding up a reaction look so different if the result is the same"

**`catalytic_converter_case`** (S5):
1. "what is actually happening inside a catalytic converter that makes the exhaust cleaner"
2. "does the catalytic converter get used up over time since it's doing all this work"
3. "why do cars need a catalyst instead of just running the engine hotter"
4. "is the metal inside the converter reacting with the gases or just helping them react"
5. "why does the converter need to warm up first before it starts working properly"

---

## 6. Chemical-validity constraints (`physics_engine_config.constraints`)

```json
"constraints": [
  "A-units and B-units are conserved: n_A + n_AB and n_B + n_AB are each constant across a state's life except the S6 reaction event, which MOVES a unit from free to bound, never creates or destroys one; this concept authors no inject_cue anywhere, so no external tap ever disturbs that conservation",
  "m_AB = m_A + m_B and r_AB = sqrt(r_A^2 + r_B^2), forced at init by gasRxResolveSpecies() — mass and disc area are both conserved by the one reaction event this concept shows",
  "Ea_rev = Ea_fwd + E_bond is DERIVED and must never be authored; only activation_fwd_kT and bond_energy_kT are ever set directly, and only in S6",
  "activation_energy_kT (the taught collision-theory barrier) is pinned to ea_ref_T = 300 K, never to the live T — if it tracked T, heating the box would leave the fraction exactly where it started and S3's PRIMARY aha would be undemonstrable",
  "gas.reaction is a CONFIG-LEVEL switch only (gasRxOn() reads physics_engine_config-level enabled, with no per-state toggle) — every state except S6 must therefore author a per-state reaction override with an enormous activation_fwd_kT (recommend >=30) to keep bonding practically at zero everywhere except S6, which alone authors activation_fwd_kT: 3 (pinned equal to activation_energy_kT so both barriers on screen read the same number); every non-S6 state must also author species_counts.AB: 0 explicitly (gasInit's leftover-budget trap)",
  "the S8 Ea slider, once touched, overrides BOTH the collision-counter threshold AND reaction.activation_fwd_kT in the same act (an engine coupling built for S6's benefit) — a teacher who drags Ea low enough in the explore state can start real AB bonding with no readout shown; this is accepted as harmless, not narrated, and not fixable per-state with the current engine (scar candidate, see §7)",
  "no absolute collisions/s or clear/s value may be narrated: measured across four viewports the collision rate spans x5.29 (54-283/s) while the cleared PERCENTAGE spans only x1.05 (3.22-3.39%) — percentage, ratios (x4.45, x1.34, x2.79, ~a third) and directions are the only safe magnitudes",
  "the histogram's shaded tail (single-particle speed > sqrt(2*Ea/m), measured 4.98% of particles) and the collision counter's percentage (3.30% of PAIR collisions clearing Ea along the line of centres, reduced mass) are different questions computed different ways and must never be narrated as the same number — S2 shows the histogram WITHOUT the counter for exactly this reason",
  "this is a true 2D gas (2D Rayleigh speed distribution), not the 3D NCERT Maxwell-Boltzmann form — no distribution formula, 2D or 3D, is ever printed on canvas; the histogram + theory curve ARE the distribution, never a labelled equation of it",
  "the Arrhenius line (S7) is a MEASUREMENT, never an evaluation of e^(-Ea/kT): the slope may be narrated as close to the barrier's true value (measured within ~2-5%), but f = e^(-Ea/RT) must never appear as a value claim, no fixed universal prefactor may be asserted (measured ratio of actual-to-theoretical fraction runs 0.61-0.82 across the Ea sweep, not a fixed 0.66), and the fit must never be called perfect or R²=1",
  "ea_at_cue has no ramp/easing companion field (unlike T_from/T_ramp_ms and piston_from/piston_ramp_ms) — both S2's threshold-appear and S5's threshold-drop are engine-level INSTANT steps at the moment their cue fires; narration must describe an appearance/relocation, never a smooth slide, unless a ramp field is added to the engine before authoring",
  "'react' is first spoken in S6, never before — S1-S5 narrate only 'clear the barrier', matching the reaction layer being practically suppressed (not visually reacting) in every state before S6"
]
```

---

## 7. Escalations / new scar candidates raised by this rigor pass (measured or code-verified, not yet filed)

1. **S1's "~once per 2 s" flash-cadence claim is measurably wrong.** Home pose clear/s = 6.0 at the
   authoring viewport (900×560) — a flash roughly every 167 ms, not every 2000 ms — and even the
   narrowest measured viewport (1600×900, 1.7/s) gives one every ~590 ms, still nowhere near 2 s. This
   number is also inherently non-portable (DQ-4-style viewport instability applies to clear/s just as
   it does to collisions/s). **Recommend: drop the cadence claim from S1's narration entirely** — let
   the chip's own "(3.3%)" carry the "rare" framing, which is honest and portable; describe the flashes
   only qualitatively ("here and there, against constant traffic"), never with an invented rate.
2. **The reaction layer has no per-state on/off gate** — `gasRxOn()` reads only the config-level
   `gas.reaction.enabled`; `gasRxCfg()` never consults per-state data for enablement (only for
   individual constant overrides via `state.reaction[key]`). "Reaction layer ON in S6 only" is
   therefore achieved by suppression (a per-state `activation_fwd_kT` override large enough to make
   bonding practically impossible), not by a true off-switch. Verification duty before shipping: a
   headless run of every non-S6 state at its full authored duration, 5 seeds, confirming AB stays
   exactly 0 throughout. Recommend filing as `peter_parker:renderer_primitives`: "gas.reaction has no
   per-state enabled toggle — every reacting concept with non-reacting states must suppress via a
   giant activation_fwd_kT rather than disabling the layer outright."
3. **The Ea slider (S8) is unconditionally coupled to `reaction.activation_fwd_kT`** the moment it is
   touched (particle_field_renderer.ts:3671), with no per-state or per-widget way to decouple it. First
   concept to combine a teacher-facing Ea slider with a config-level reaction layer, so this interaction
   has never been exercised before. Recommend filing as `peter_parker:renderer_primitives`: "Ea slider
   touch overrides activation_fwd_kT with no opt-out — a concept exposing the slider without wanting
   its reaction layer touched has no engine-level way to keep them separate."
4. **`ea_at_cue` has no ramp/easing field.** Unlike `T_from`/`T_ramp_ms` and `piston_from`/
   `piston_ramp_ms`, a barrier changed via `ea_at_cue` jumps instantly on the next frame — S2's "the
   threshold line DROPS IN" and S5's "the line SLIDES down" are both, as currently engineered, a single-
   frame step. Not a blocker (an instant appearance is still legible and arguably reads as decisively as
   a slide), but the narration verbs should be revised to match what will actually be on screen, or the
   renderer team should add `ea_at_cue.ramp_ms` before this ships, mirroring the existing pattern.

## Self-review checklist (chemistry_author)

- Every quantity in the skeleton's state narratives appears in §1 with a unit. ✓
- Balanced-equation ledger complete (atom/unit table, charge total, abstract-species declaration). ✓ (no redox, so no oxidation-number rows apply)
- Every state's motion in §3 declares its archetype (from the skeleton) and traces to a concrete mechanism. ✓
- Rule 31 timeline present for all 8 states; Rule 32 sequencing addressed explicitly (including the ramp-state nuance). ✓; Rule 33 macro↔micro — this concept IS the particulate view throughout, per skeleton (g). Rule 34 — one formula surface per state per DoD (h), untouched here.
- Word budget: not re-authored here (skeleton's narration stands; no new sentences written in this block).
- Notation ladder / dialect: untouched (skeleton's DoD (i-3) stands); no logs/calculus introduced below the advanced ring by anything in this block (S7's `ln f = c − Eₐ/kT` is already advanced-ring per DoD).
- Particle-count scale factor: N/A — this concept's counts are already declared MODEL counts, not scaled-to-Avogadro (§2).
- Drill-down phrasings: 30 total, 5 per cluster, plain English, no Hinglish. ✓
- Constraints: 12 items, conservation first. ✓ (exceeds the 4-6 minimum given this concept's two novel engine-interaction findings)
- Numerical sanity check RUN via `python3` (§1), not eyeballed. ✓
- Engine bug queue consulted (see header); every relevant prevention_rule satisfied or exception flagged (§7).
- Source check line present (header).
- `aha_moment` chemistry check: S3's PRIMARY aha ("heating multiplies the CLEARING fraction, barely the collision count") is chemically TRUE and cleanly measured (×4.45 vs ×1.34) — but see §2(b)'s flag on keeping this pairing clean of the compound ×6.06 number. `misconception_watch` counters (§4 of the skeleton) are correct chemistry as far as they go; S1's fix line and S3/S5's fix lines were checked and none accidentally uses "react" (reserved for S6) or "orientation" (reserved never — §2e).
