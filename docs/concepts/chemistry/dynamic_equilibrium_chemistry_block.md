# Chemistry block — `dynamic_equilibrium`

Pipeline: architect → **chemistry_author** (this file) → json_author → quality_auditor.
Input: `docs/concepts/chemistry/dynamic_equilibrium_skeleton.md`, read complete including §0, §4, §11(j)/(j-bis) and the GATE 8 appendix. Cross-checked against `docs/patterns/chemistry.md` archetype **M**, the shipped precedent `src/data/concepts/chemistry/kinetic_particle_theory.json`, and — line by line at every read site — `src/lib/renderers/particle_field_renderer.ts` § `REACTION LAYER (A + B ⇌ AB)`.

**Every number in this file was MEASURED on the engine, not reasoned out.** Method: the headless harness from `src/scripts/check_gas_reaction_physics.ts` (renderer body in a Node `vm` with p5 stubs, `stepGas()` driven directly), parameterised and swept. ~1,100 runs. Scratch scripts were deleted after use, per instruction; every run is reproducible from the tables below by re-parameterising that check script.

---

## 0. Findings that change the architect's design

Six. None is a papering-over; each is a measurement that contradicted a design assumption, and the corrected design is given.

### F1 — `species.color` for the product is DEAD DATA, and there is no violet disc

`drawGasDimer()` (`particle_field_renderer.ts:4477`) draws a dimer as **the A disc and the B disc, still their own colours, joined by a white bond line, rotating about the centre of mass**. The product's authored `color` is never read for the particle. The readout's `AB nn` text and the concentration graph's AB curve are both hardcoded `#E2E8F0` (near-white) at `drawGasReaction()` and `drawGasConcGraph()`.

- Skeleton §11(j) asks for `AB … #C084FC` so the product is "visually unmistakable". **That colour changes nothing on screen.** Author it or don't; do not rely on it.
- Skeleton §4 S1: "become one **violet disc** that visibly spins away" — **the renderer never does this.** What it does is better: the blue A and the amber/pink B stay visible *as themselves*, now tied together and spinning. The atoms are visibly conserved — a student can count them — and S2/S5 fling the *same two coloured discs* apart again. Conservation made visual for free.
- **Binding on narration:** the product is "a bonded pair" / "the two joined together", never "a violet disc", never "a new particle". Colour vocabulary is A = blue, B = pink, the product = the joined pair (white bond, white curve, white number).

### F2 — B's authored colour collides with the reverse-bar orange; changed

Bar colours are engine-fixed: `fwd` = `#34D399` green, `rev` = `#FB923C` orange, and the event flash rings use the *same* two colours (green ring = a bond made, orange ring = a bond broken, `particle_field_renderer.ts:4468`). The skeleton's B `#FBBF24` is hue-adjacent to `#FB923C`, and B discs fly out of orange split-rings. **Recommend `B = #F472B6` (pink)** — distinct from green, orange, blue and white under projector conditions. A = `#60A5FA` blue stands.

The green/orange flash-ring convention is a large unearned legibility win and should be narrated once in S3: a green ring is one bond made, an orange ring is one bond broken, and they are the same colours as the two bars.

### F3 — the approach to equilibrium cannot be made to last 12–18 s; it is ~3 s, and this is a hard physical bound

Skeleton §11(j) wants the plateau reached "inside the state's narration window (~12–18 s)". Reached at **3.0 s**, comfortably inside. But if the intent was a *12-second watchable ramp*, that is not purchasable on this engine at any setting, and the reason is structural rather than a tuning failure.

Linearising A + B ⇌ AB about equilibrium (a = A_eq = B_eq, x = AB_eq) gives the relaxation time τ⁻¹ = R_eq·(2/a + 1/x), so

> **t_settle × R_eq ≈ 3·a·x / (2x + a)** — bounded by the particle count, and by nothing else.

The two things the concept needs are on opposite ends of that identity: a *slow, watchable* approach and *high event rates* (the rate bars are Poisson-noisy over a fixed 5 s window — `gasSampleStats()` — and two bars cannot be seen to be equal while they jitter). Measured across the whole sweep:

| act | R_eq (events/s) | bar mismatch, 10–40 s | rise to 90 % of plateau |
|---|---|---|---|
| 1.0 | 10.6 | **7 %** | 2.7 s |
| 1.2 | 9.2 | **8 %** | 2.7 s |
| 1.4 | 7.4 | 14 % | 3.6 s |
| 1.6 | 5.4 | **17 %** | 4.3 s |

(5 seeds each, 120 s runs, N = 90 per species.) Slowing the rise past ~4 s costs the equal-bars picture, which is the PRIMARY aha. Raising N buys rise time only linearly while raising density quadratically: N = 130/species (260 discs) buys 4.4 s instead of 3.0 s — 44 % more discs for 1.4 s.

**Resolution, and it is a good one.** The rise is not the state's motion; the *bars closing* is. Because the rate windows are 5 s deep, the fwd bar falls 18.8 → 8.8 /s and the rev bar climbs 0 → 8.6 /s over **0–8 s** — a readable eight-second cause-then-effect convergence — while the composition flattens at 3 s and then holds for the remaining ~14 s of narration with both counters climbing. Measured S3 timeline is in §4. Net effect on the graph: 3 s of fall, 17 s of flat — the *best* possible ratio for "the line goes flat".

**§4 S3's motion line should be re-read as "the two bars close over eight seconds while the curves flatten in three", not as a slow ramp.**

### F4 — S4's "B consumed almost to nothing" is not achievable, and asking for it is asking for the wrong chemistry

Measured, three lopsided openings, all at the S3 atom total (180), 3 seeds, plateau averaged over 15–60 s:

| opening | plateau | fwd / rev | bar gap | B consumed |
|---|---|---|---|---|
| **A 120 · B 60** | **A 93 · B 33 · AB 27** | 8.0 / 7.9 /s | **0 %** | 45 % |
| A 135 · B 45 | A 113 · B 23 · AB 22 | 6.4 / 6.4 /s | 0 % | 49 % |
| A 150 · B 30 | A 134 · B 15 · AB 16 | 4.5 / 4.6 /s | 1 % | 52 % |

B never approaches exhaustion, and it *cannot*: at equilibrium AB = K′·A·B, so the limiting reagent is left standing by definition. **A reaction that consumes its limiting reagent "almost to nothing" is a reaction that goes to completion — the exact opposite of what S4 teaches.** Skeleton §11(g)'s illustrative "A 35 · B 5 · AB 25" is unreachable for the same reason.

The measured A 93 · B 33 · AB 27 is also the better picture: **three clearly distinct numbers, none of them zero, with the two bars identical.** The A 135/B 45 and A 150/B 30 options put B and AB within 1–2 counts of each other, i.e. two overlapping curves on the graph. **S4 opening = A 120 · B 60 · AB 0.**

### F5 — S1 and S2 cannot show a single followable "hero" event at the density S3 needs; the state arc absorbs this

At the S3 opening (90 + 90) the forward reaction fires **18 merges in the first second** — a popcorn burst, not a followable pair. Measured S1 (reverse off):

| t | 1 s | 3 s | 6 s | 10 s | 16 s | 20 s |
|---|---|---|---|---|---|---|
| merges/s | 18.4 | 15.1→ | 7.1 | 3.3 | 1.4 | **0.7** |

**The burst decays into individually followable events inside the same state**, and that decay *is* S1's second teaching point ("the forward rate falls as they get used up"). So S1 keeps the 90 + 90 opening and the narration follows the arc: a crowd sticking together at first, thinning to one occasional flash by the end. The alternative — opening S1 at 45 + 45 for followability — was measured and **rejected**: it lands S1 at AB ≈ 32 after 20 s, one count away from S3's plateau of 31, so the two states' most-visible number would read the same and the S1→S3 contrast would be destroyed.

### F6 — dragging the `N` slider DOWN deletes matter on screen and corrupts the atom inventory

`gasSyncCount()` truncates the particle array on a negative delta (`particles.length = max(2, have + delta)`), removing whatever species sit at the end — including dimers, which take one A *and* one B with them. Measured, N 180 → 130 at equilibrium:

```
before: A 65  B 65  AB 25 | 155 discs | A-atoms 90  B-atoms 90
after : A 42  B 47  AB 13 | 102 discs | A-atoms 55  B-atoms 60      <- inventory now ASYMMETRIC
+30 s : A 42  B 47  AB 13 |            A-atoms 55  B-atoms 60       <- never recovers
```

Two failures at once: bonded pairs vanish *in place* (a visual that shows matter disappearing — forbidden), and the sandbox silently becomes lopsided. **Therefore `N.min = N.default = 180`: a one-way reagent tap.** Adding is clean (measured in §4 S7).

---

## 1. Balanced-equation ledger

### The displayed reaction — `A + B ⇌ AB`, all states

| Species unit | LHS count | RHS count |
|---|---|---|
| A | 1 | 1 |
| B | 1 | 1 |

| | LHS | RHS |
|---|---|---|
| **Total charge** | 0 | 0 |
| **Mass (engine units)** | m_A + m_B = 1 + 1 = **2** | m_AB = **2** |
| **Disc area (2D analogue of volume)** | πr_A² + πr_B² = π(25 + 25) | πr_AB² = π(50) |

All coefficients are 1; **no coefficient appears anywhere on screen** and none may be added. No state symbols on the species labels (the readout gives each label a ~46 px column; labels must be ≤ 4 characters) — the gaseous nature is narrated, per skeleton §11(b)/(c). No oxidation numbers: A and B are generic species, not elements, and nothing here is redox.

**A and B are deliberately generic and must stay generic.** The engine's reaction is strictly 1 + 1 ⇌ 1 (`gasRxTry` merges exactly one A with one B; `gasRxSplit` returns exactly one of each). Recording the rejection so it is not re-litigated: **`2NO₂ ⇌ N₂O₄` and `H₂ + I₂ ⇌ 2HI` do not fit this stoichiometry and must never be labelled onto this box** — either label would put a 2 : 1 or 1 : 1 : 2 equation over a 1 : 1 : 1 animation and teach the coefficient wrong. `CO + Cl₂ ⇌ COCl₂` fits but is obscure and toxic and buys nothing. Generic stands.

### Mass conservation is enforced in code, not trusted to the author

`gasRxResolveSpecies()` forces `m_AB = m_A + m_B` and `r_AB = √(r_A² + r_B²)` at init, cloning the species array before correcting so authored config is never mutated in place. Authoring `AB: { mass: 2, radius: 7.0710678 }` matches the enforced values to 1.2 × 10⁻⁸ (tolerance 1 × 10⁻⁶), so **no correction warning fires** — author them right anyway; the correction is a net, not a licence.

Momentum is exact per event (merge takes the centre-of-mass velocity; split places fragments symmetrically about the COM with equal and opposite momenta). Energy is carried in an explicit ledger, with the dimer's rotation taken out of the released heat rather than conjured.

### Conservation verified by measurement, in every state

Driving all seven states in rail order *and* in a reordered order (Rule 25d), 10 s each:

| state | opening | A-atoms after 10 s | B-atoms after 10 s | fwd_total − rev_total | dimers on screen |
|---|---|---|---|---|---|
| S1 | A 90 · B 90 | 90 | 90 | +67 | 67 ✔ |
| S2 | AB 45 | 45 | 45 | −29 | 45 − 29 = 16 ✔ |
| S3 | A 90 · B 90 | 90 | 90 | +35 | 35 ✔ |
| S4 | A 120 · B 60 | 120 | 60 | +34 | 34 ✔ |
| S5 | AB 90 | 90 | 90 | −57 | 90 − 57 = 33 ✔ |
| S6 | A 59 · B 59 · AB 31 | 90 | 90 | −3 | 31 − 3 = 28 ✔ |
| S7 | A 90 · B 90 | 90 | 90 | +35 | 35 ✔ |

The last two columns are the exact bookkeeping identity — **every bonded pair on screen is one net forward event**. A rate can be argued with; this cannot be noisy at all. It is also a narratable fact for S3's deep-dive: *the difference between the two totals is exactly the number of joined pairs on screen* (at 20 s: 202 made, 172 broken, 30 pairs).

`Ea_rev = Ea_fwd + E_bond` verified numerically in every state: Ea_fwd 3.969, E_bond 6.946, Ea_rev 10.915 px²·tick⁻² — derived, never authored, in all seven.

---

## 2. Quantities (`physics_engine_config.variables`)

Chemistry note on units: this box has **no chemical identity** — it is a count of discs, not moles. Counts are particles, not mol; the graph's y axis reads `count` (engine-fixed). §5 carries the count↔concentration bridge that Rule 25 requires before S6's square brackets.

| Name | Meaning | Unit | Min | Max | Default | Step | Role |
|---|---|---|---|---|---|---|---|
| `T` | temperature of the thermostat bath | K | **250** | 900 | **300** | 10 | slider (S7 only) |
| `V` | box volume as a fraction of full width (2D: area ∝ this) | — | 0.35 | 1 | 1 | 0.05 | slider (S7 only) |
| `N` | reagent tap — adds A and B in equal numbers | particles | **180** | 260 | **180** | 10 | slider (S7 only), **one-way (F6)** |
| `activation_fwd_kT` | forward barrier, in multiples of kT at `ea_ref_T` | — | — | — | **constant 1.2** | — | reaction constant |
| `bond_energy_kT` | energy released when the bond forms (> 0 = exothermic forward) | — | — | — | **constant 2.1** | — | reaction constant |
| `reverse_attempt_per_s` | Arrhenius pre-exponential A for dimer decay | s⁻¹ | — | — | **constant 8** | — | reaction constant |
| `ea_ref_T` | reference temperature the barriers are pinned to | K | — | — | constant 300 | — | calibration |
| `temperature_K` | config-level opening temperature | K | — | — | constant 300 | — | calibration |
| `speed_scale` | velocity calibration: σ = s·√(T/m) | px·tick⁻¹·K^−½ | — | — | constant **0.105** | — | clone of `kinetic_particle_theory` |
| `m_A`, `m_B` | reactant masses | engine mass units | — | — | 1, 1 | — | species |
| `m_AB` | product mass — **derived, enforced** | engine mass units | — | — | `m_A + m_B` = 2 | — | species |
| `r_A`, `r_B` | reactant radii | px | — | — | 5, 5 | — | species |
| `r_AB` | product radius — **derived, enforced** | px | — | — | `√(r_A²+r_B²)` = 7.0710678 | — | species |
| `n_A`, `n_B`, `n_AB` | live populations | particles | 0 | 180 | per state (§4) | 1 | read out live |
| `rate_f`, `rate_r` | forward / reverse event rates | events·s⁻¹ | 0 | ~50 | measured | — | read out live (5 s window) |

**Derived, never authored:** `Ea_fwd = activation_fwd_kT · speed_scale² · ea_ref_T` · `E_bond = bond_energy_kT · speed_scale² · ea_ref_T` · **`Ea_rev = Ea_fwd + E_bond`** · `k_r(T) = reverse_attempt_per_s · exp(−Ea_rev / (speed_scale²·T_measured))`. `Ea_rev` is derived on purpose: an author who could set all three independently could describe a reaction that releases energy in both directions, and heating an exothermic box would stop shifting it back by itself.

**`adiabatic` is ABSENT from every state.** Measured with the thermostat off (skeleton §11(j-bis) 1, reconfirmed here): the exothermic forward self-heats the box, the product-side run cools and freezes. Both S5's claim and S3's plateau depend on isothermal running. With `adiabatic` absent, the measured temperature holds 291–310 K against a 300 K setpoint across all seven states after 10 s — a ±3 % wobble from the thermostat's 10 %-per-tick relaxation against reaction heat, which is why the thermometer stays OFF in guided states.

**Do NOT author `activation_energy_kT` in any state.** It is a *separate* knob from `activation_fwd_kT` (`gasActivationE` vs `gasRxEaFwd`) and it lights a **yellow** flash ring on every collision clearing the barrier — including A–A and B–B pairs, which cannot react. Next to the green "made" and orange "broken" rings that is a third event colour that means nothing chemical. The collision counter still gives its real number (`NNN collisions/s`) without it.

**Do NOT author `reaction.inject`.** It is config-level only and forces the N tap to add one species alone — a directional stress, and direction is `le_chateliers_principle`'s subject. The default (alternating A and B, stoichiometric) is what S7 needs.

**`layout: "with_graph"` is INERT.** `gasHasGraphPane()` is defined and never called; the box always owns the full canvas. `kinetic_particle_theory` authors it harmlessly. Omit it — dead config that reads as meaningful is a hazard.

---

## 3. MEASURED reaction constants — the runs behind them

### 3.1 The locked set

```json
"reaction": {
  "enabled": true,
  "reactants": ["A", "B"],
  "product": "AB",
  "activation_fwd_kT": 1.2,
  "bond_energy_kT": 2.1,
  "reverse_attempt_per_s": 8
}
```
with `temperature_K: 300`, `ea_ref_T: 300`, `speed_scale: 0.105`, and species counts `A 90 · B 90 · AB 0` (180 discs).

### 3.2 How the search was constrained

The separation that made this tractable, derived from the code and then confirmed by sweep: since `k_f ∝ Z_coll·exp(−Ea_fwd/kT)` and `k_r = A_rev·exp(−(Ea_fwd+E_bond)/kT)`, the `exp(−Ea_fwd/kT)` factor **cancels** in K = k_f/k_r. So

- **`activation_fwd_kT` sets the SPEED of both directions and does not move the equilibrium position.**
- **`bond_energy_kT` and `reverse_attempt_per_s` set WHERE the plateau sits.**

That is the kinetics-vs-thermodynamics separation, correct chemistry, and it is why the sweep below is a two-stage search rather than a blind grid.

### 3.3 The runs

**Run 1 — coarse grid, 128 configurations.** act ∈ {0.6, 1.0, 1.4, 1.8} × bond ∈ {1.0, 1.5, 2.0, 2.5} × rev ∈ {2, 4, 8, 16} × N ∈ {45, 80} per species, 3600 ticks (60 s) each, single seed. Established the ranges and confirmed the cancellation above. 3 min 31 s.

**Run 2 — focused grid at N = 90/species, 80 configurations.** act ∈ {0.8…1.6} × bond ∈ {1.2…2.1} × rev ∈ {3, 4, 6, 8}, 2400 ticks. Narrowed to f = AB_eq/N ≈ 0.33. 1 min 50 s.

**Run 3 — six finalists × 5 seeds × 7200 ticks (120 s).** The table in F3. Only act ≤ 1.2 keeps the bar mismatch under 10 %.

**Run 4 — verification of the locked set, 5 seeds × 60 s** (S3 opening, `_states.ts s3`):

| t (s) | A | B | AB | fwd /s | rev /s | made | broken |
|---|---|---|---|---|---|---|---|
| 0 | 90.0 | 90.0 | 0.0 | 0.0 | 0.0 | 0 | 0 |
| 1 | 74.6 | 74.6 | 15.4 | **18.8** | 3.4 | 19 | 3 |
| 2 | 67.2 | 67.2 | 22.8 | 16.5 | 5.1 | 33 | 10 |
| 3 | 60.6 | 60.6 | 29.4 | 15.7 | 5.9 | 47 | 18 |
| 4 | 58.0 | 58.0 | 32.0 | 14.2 | 6.2 | 57 | 25 |
| 5 | 59.0 | 59.0 | 31.0 | 13.3 | 7.1 | 67 | 36 |
| 8 | 56.4 | 56.4 | 33.6 | 9.4 | 8.6 | 94 | 60 |
| 10 | 56.8 | 56.8 | 33.2 | 8.8 | 8.4 | 111 | 77 |
| 15 | 57.2 | 57.2 | 32.8 | **8.8** | **8.8** | 154 | 122 |
| 20 | 59.4 | 59.4 | 30.6 | 9.6 | 10.0 | 202 | 172 |
| 60 | 59.0 | 59.0 | 31.0 | 9.1 | 9.4 | 578 | 547 |

**Plateau (10–60 s, 5 seeds): AB = 31.19, sd 3.62, range [18, 40] → A = B = 58.81.**
**On-screen window (5–20 s, what S3 actually shows): AB = 32.47, sd 3.04, range [24, 39].**

### 3.4 Every target in skeleton §11(j), checked

| Target | Required | Measured | Verdict |
|---|---|---|---|
| plateau inside the narration window | ≤ 12–18 s | **3.0 s** to 90 % of plateau, bars converged by 8 s | ✔ (see F3) |
| plateau clearly unequal | not near 50 : 50 | **A 59 · B 59 · AB 31** — reactants are 1.9× the product; three levels on the graph | ✔ |
| plateau clearly non-zero | — | AB 31 of a possible 90 (34 % converted); never within 18 of zero across 5 seeds × 60 s | ✔ |
| both rates high enough to read | steady "they are equal" | **9.2 /s**, ≈ 46 events per 5 s window; mean bar mismatch **8 %** over 10–40 s | ✔ |
| S4 visibly lopsided, bars still equal | — | **A 93 · B 33 · AB 27**, fwd 8.0 / rev 7.9 (**0 %** gap) | ✔ with F4 correction |
| S6 opening = the MEASURED S3 plateau | — | **A 59 · B 59 · AB 31**; drift +0.9 counts over 20 s | ✔ |
| S2 reverse dominant for ~10 s from pure AB | — | dominant 0–7 s; fwd is 56 % of rev by 8 s | ✔ **with the window corrected to ~7 s** |
| S3 ≡ S5 plateau within noise | the central claim | **gap 0.46 counts = 1.5 %** | ✔ |

### 3.5 The central claim — S3 ≡ S5, measured

7 seeds each, 90 s runs, AB averaged over 20–90 s, **matched atom inventories (90 A-units and 90 B-units on both sides), isothermal**:

```
S3 (from pure reactants): AB = 30.75 ± 3.75   range [18,43]  ->  A = B = 59.25
S5 (from pure product)  : AB = 31.22 ± 4.01   range [19,43]  ->  A = B = 58.78
GAP = 0.46 counts = 1.50 %   (sd of the mean ~0.12)
```

**Both traps from the check script's comments were re-run and both reproduce.**

- *Isothermal trap:* with `adiabatic: true`, the exothermic forward self-heats and the product-side run cools and freezes solid — two different equilibria, a convincing false failure.
- *Inventory trap, measured here:* comparing S3 (90 + 90 atoms) against a pure-product run of **AB 45** (45 + 45 atoms) gives **AB = 10.73** against 30.75 — a 3× discrepancy that reads as a catastrophic failure of the concept's central claim, and is nothing but two different equilibria. **S5 must open at exactly AB 90. Not 45, not "about half".** This is the single most fragile number in the concept.

### 3.6 Fluctuation band at the chosen particle count, and the frame-rate cost

Skeleton §11(j-bis) 3 recommends raising N toward 160–200 so the flat line reads flat. **180 discs adopted. Measured band:**

| window | mean AB | 1 sd | full range (5 seeds) |
|---|---|---|---|
| 10–60 s | 31.19 | **± 3.62** | [18, 40] |
| 5–20 s (on screen in S3) | 32.47 | **± 3.04** | [24, 39] |
| S6, 0–20 s (seeded at balance) | 31.51 | ± 4.02 | [21, 43] |

Read against the graph: the concentration graph auto-scales to the peak of its visible trace (`drawGasConcGraph`, 260-sample / 26 s buffer), and for the first 26 s of S3 that peak is the **initial A = 90**. So the wobble is **± 3.4 % of graph height at 1 sd, ± 8 % peak-to-peak**, against an initial fall of 31 counts = **34 % of graph height**. The flat section's wobble is roughly a quarter the size of the fall that precedes it: it reads as *flat with a live wobble*, which is what it is.

**Honest note on why N was raised.** The relative wobble improves only as 1/√N (sd/peak: 4.4 % at 90 discs → 4.1 % at 180), so raising the count barely flattens the line. What it *does* fix is the rate bars: bar mismatch falls from ~25 % at 45/species to **8 %** at 90/species. **The reason to raise N is the bars, not the flat line** — and the flat line must therefore never be narrated as perfectly constant (§6).

**Frame-rate cost, measured (physics only, headless, 3600 ticks after a 600-tick settle):**

| discs at t = 0 | ms / tick | % of a 60 Hz frame |
|---|---|---|
| 90 | 0.373 | 2.2 % |
| 120 (`kinetic_particle_theory`) | 0.454 | 2.7 % |
| **180 (this concept)** | **0.591** | **3.5 %** |
| 260 | 0.799 | 4.8 % |

O(N) as designed (uniform-grid broad phase). 180 discs costs 0.14 ms/tick more than the shipped 120-disc concept. **Acceptable with a wide margin.**

---

## 4. Within-state motion timeline + per-state control spec (Rule 31)

**Nothing in this concept is a keyframe.** Every window below is what the collision sweep *produces* from the authored opening — measured, 5 seeds, means. The only authored drivers are the opening composition (`species_counts`, DELTA A), `reverse_attempt_per_s: 0` in S1, and which instruments are lit. That is also why the timings are given as measured bands rather than exact cues.

Apparatus home pose, all seven states: one box, full canvas 900 × 560, piston parked at 1.0 in S1–S6 (no state authors `piston_frac`; `gasStableDefault('V', 1)` supplies 1). Rate readout top-right, concentration graph bottom-left inset, collision counter bottom-right, formula overlay DOM, delta cue top. **The only things that change between states are the opening composition and which instrument is lit.**

### S1 — `collide-and-stick` · core · `manual_click` · 30–45 words

Opening `A 90 · B 90 · AB 0`; `reaction: { reverse_attempt_per_s: 0 }`. Live controls: **none**. Instruments: reaction readout **on**, collision counter **on**, concentration graph **off**.

| t (s) | what moves | driven by |
|---|---|---|
| 0.0–1.0 | 180 loose discs drifting, blue A and pink B; both bars empty while the 5 s windows fill; **145 collisions/s** already on the counter | opening composition |
| **1.0–3.0 (CAUSE)** | green flash rings pop across the box at **18.4/s falling to 15.1/s**; each leaves a blue+pink pair joined by a white bond, spinning; AB 0 → 30 | forward reaction (bimolecular) |
| **3.5–6.0 (EFFECT, ~1 s after the fwd bar first reads full)** | the **fwd bar visibly shortens**, 15.1 → 7.1 /s; A and B thin 60 → 36; rev bar **pinned at 0.0/s** all state | reactant depletion |
| 6.0–12.0 | popping audibly thins: 7.1 → 1.9 /s; collisions/s falls 99 → 72 while bonds/s falls 7.4 → 0.5 — **the two numbers fall at different rates**, which is the point | reactant depletion |
| 12.0–18.0 | one green flash every 1–2 s, individually followable; fwd bar nearly empty (**0.7/s**); AB ≈ 73 of 90 | reactant depletion |

Delta cue: **"A and B stick together"**. Focal: the green flash and the pair it leaves. Rule 32b: the reverse is switched off so only the taught process moves — narrated as *"look at the forward direction first"*, **never** as "the reaction only goes forward".

### S2 — `break-apart` · declared contrast pair of S1 · core · `manual_click` · 30–45 words

Opening `species_counts: { A: 0, B: 0, AB: 45 }`. Live controls: **none**. Instruments: reaction readout **on**, graph **off**.

| t (s) | what moves | driven by |
|---|---|---|
| 0.0–1.0 | 45 bonded pairs, **not one loose disc**; readout reads `A 0  B 0  AB 45`; fwd bar **0.0/s — it cannot do otherwise, there is nothing to react** | opening composition |
| **1.0–3.0 (CAUSE)** | orange flash rings; pairs tear apart and the same blue and pink discs fly apart; **rev 9.8 → 7.9 /s**; AB 45 → 22 | first-order decay |
| **3.0–5.0 (EFFECT, ~1.5 s later)** | the **fwd bar leaves zero** (0.4 → 1.0 /s) as fragments accumulate — real physics, no override | fragment accumulation |
| 5.0–12.0 | rev falls 6.4 → 3.2 /s, fwd rises 1.0 → 2.8 /s, the two closing; AB 17.6 → 13.2 | both directions |
| 12.0–18.0 | bars within ~10 % at ~3.2 /s; AB ≈ 12, A = B ≈ 33 | both directions |

Delta cue: **"AB breaks back apart"**. Focal: the orange flash and the two discs leaving it. **Corrected window (F3/§3.4):** the reverse is *visibly dominant for ~7 s*, not ~10 s; by 8 s the forward is 56 % of the reverse. The narration must land its point inside the first 7 s. There is deliberately no mirrored trick — the engine cannot switch the forward off (`Ea_rev` is derived) and S2 does not need it, because with no A or B present the forward rate is zero on its own.

*Why 45 dimers and not 90:* 90 would make S2's opening frame and evolution **identical to S5's**, and S5's opening is fixed at 90 by the inventory-match requirement (§3.5). Two states may not share a motion (Rule 31). 45 also halves the split rate into the followable range (9.8/s vs 17.8/s).

### S3 — `rates-converge` · **PRIMARY AHA** · core · `manual_click` · **`continuous_motion: true`** · 45–55 words

Opening `A 90 · B 90 · AB 0` (config default — no `species_counts`). Live controls: **none**. Instruments: reaction readout **on**, **concentration graph on for the first time**, collision counter off.

| t (s) | what moves | driven by |
|---|---|---|
| 0.0–1.0 | **the identical opening frame to S1** — 180 loose discs. That sameness *is* the delta: the only change is that the reverse is now live | opening composition |
| **1.0–4.0 (CAUSE)** | fwd **18.8 → 14.2 /s**, green rings everywhere; the A and B curves fall from 90, the AB curve rises; AB 0 → 32 | forward reaction |
| **2.0–8.0 (EFFECT, lagging by ~1 s and continuing)** | orange rings appear and multiply; **rev 3.4 → 8.6 /s**; the two bars visibly close on each other | reverse reaction |
| **~3.0** | the three curves flatten (90 % of plateau) | equilibrium |
| 8.0–12.0 | bars level at **8.8–9.4 /s**; readout holds `A 57  B 57  AB 33` | equilibrium |
| **12.0–22.0** | the only things still moving are the discs, the green **and** orange rings, and the two totals: **111 · 77 at 10 s → 202 · 172 at 20 s.** The line is dead flat | equilibrium |

Delta cue: **"Flat line, both still running"**. Focal: the two rate bars. This is the state whose motion is *the bars closing over eight seconds*, not a slow composition ramp (F3).

**Rule 25 bridge — required here and nowhere else:** the graph's y axis reads `count`, not concentration. S3's narration must say **once**, before any square bracket appears in S6, that at this fixed box volume the count is proportional to the concentration.

### S4 — `replateau-lopsided` · core · `manual_click` · 35–50 words

Opening `species_counts: { A: 120, B: 60, AB: 0 }` — the same 180 atoms as S3, deliberately lopsided (F4). Live controls: **none**. Instruments: reaction readout **on**, graph **on**.

| t (s) | what moves | driven by |
|---|---|---|
| 0.0–2.0 | the opening frame is **visibly lopsided** — a crowd of blue A, half as many pink B | opening composition |
| **2.0–6.0 (CAUSE)** | AB climbs 0 → 24; blue A discs visibly drift past one another unable to react — **an A must find a B** | forward reaction, rate ∝ n_A·n_B |
| **4.0–12.0 (EFFECT)** | bars close: 14.5/4.1 → 8.8/6.4 → **7.4/6.5** | reverse reaction |
| 12.0–20.0 | readout holds **`A 93  B 33  AB 27`** — three clearly different numbers — while the bars sit **identical at ~8.0/s (0 % gap)**; totals 128 · 100 → 166 · 141 | equilibrium |

Delta cue: **"Equal rates, unequal amounts"**. Focal: the three counts in the readout. **The payload is the contradiction between the readout's three numbers and its two identical bars, in one glance.**

### S5 — `converge-from-above` · declared contrast pair of S3 · extended · `manual_click` · **`continuous_motion: true`** · 40–55 words

Opening `species_counts: { A: 0, B: 0, AB: 90 }` — **exactly S3's atom inventory** (§3.5; this number is load-bearing). Live controls: **none**. Instruments: reaction readout **on**, graph **on**.

| t (s) | what moves | driven by |
|---|---|---|
| 0.0–1.0 | 90 bonded pairs, **no loose disc anywhere** — the opposite frame to S3's | opening composition |
| **1.0–5.0 (CAUSE)** | orange rings everywhere, **rev 17.8 → 13.0 /s**; AB **falls** 90 → 40; blue and pink discs fill the box | first-order decay |
| **3.0–10.0 (EFFECT)** | the **fwd bar climbs off zero**, 0.4 → 6.5 /s, as fragments accumulate; the AB curve keeps falling *toward the level S3's curve rose to* | forward reaction |
| 10.0–16.0 | AB 30.8 → 29.2; bars meet at 8.7 / 9.6 /s | equilibrium |
| 16.0–22.0 | flat at **`A 59  B 59  AB 31`** — the same three numbers S3 landed on; totals **146 made · 203 broken** | equilibrium |

Delta cue: **"Same end, opposite start"**. Focal: the falling AB curve.

**Two free, measured payloads the architect did not have:**
1. **S5's approach is genuinely slower than S3's** — 8–10 s to plateau versus 3 s — because the reverse is first-order in a scarce species while the forward is second-order in an abundant one. The two states therefore have visibly *different* motions, not merely mirrored ones. Rule 31 satisfied on measurement, not assertion.
2. **The totals read backwards in S5**: S3 ends `202 made · 172 broken`, S5 ends `146 made · 203 broken`. Same plateau, opposite journey, and the gap in each is exactly the dimer count.

### S6 — `seed-at-balance` · advanced · `manual_click` · **`continuous_motion: true`** · 45–55 words

Opening `species_counts: { A: 59, B: 59, AB: 31 }` — **the measured S3 plateau, rounded** (31.19 → 31, 58.81 → 59; A-units 90, B-units 90 ✔). Live controls: **none**. Instruments: reaction readout **on**, graph **on**, derivation formula surface **on** (it *replaces* `A + B ⇌ AB`, never both — Rule 34b).

| t (s) | what moves | driven by |
|---|---|---|
| 0.0–1.0 | opens already mixed; the three curves start **at** their plateau values — no transient anywhere on screen | opening composition |
| 1.0–2.0 | **both bars come up together** to 8.9–10.7 /s as the windows fill. Neither leads | equilibrium |
| 0.0–22.0 | composition flat: mean **31.5**, sd 4.0, **drift +0.9 counts over 20 s** | equilibrium |
| 0.0–22.0 | both totals climb **in lockstep**: 10 · 11 at 1 s, 44 · 45 at 5 s, **88 · 88 at 10 s**, 133 · 134 at 15 s, 183 · 182 at 20 s | equilibrium |
| staged | the only thing that BUILDS is the derivation, line by line, on the formula surface | authored reveals |

Delta cue: **"Start balanced: nothing drifts"**. Focal: the active derivation line.

**Measured drift, 7 seeds, mean AB over 0–2 s vs 18–20 s:** `[−8.2, +3.8, +2.6, +6.2, +8.2, −1.6, −4.6]`, **mean +0.91 counts**. Mean over 0–20 s = 31.34; mean over 30–60 s (true equilibrium) = 30.77. **There is no systematic drift — every per-seed excursion is inside the ±4 fluctuation band.** The alternative round seed `A 60 · B 60 · AB 30` measures identically (mean drift +2.06, 0–20 s mean 31.51); either is defensible, and 59/59/31 is chosen because it is literally the rounded measurement.

**Declared Rule 32a exception:** S6 has *no* cause-before-effect gap, deliberately — the state's claim is that **neither direction leads**. The cause is the seeded composition, present at t = 0; the effect is two counters climbing together. Faking a lag here would falsify the state.

### S7 — `drag-sandbox` · core-content only (38b) · `interaction_complete` · 0 words / open

Opening: config default (`A 90 · B 90 · AB 0` — no `species_counts`). Live controls: **ALL THREE — `T`, `V`, `N`** (`show_sliders: true`). Instruments: reaction readout, concentration graph, collision counter. **No derivation surface, no ratio** (38b). Runs continuously — Rule 37 exempts `interaction_complete` from the end-of-timeline freeze.

Measured slider responses (3 seeds, plateau after 30 s settle, isothermal, piston parked unless stated):

| `T` | 250 K | 300 K | 400 K | 500 K | 700 K | 900 K |
|---|---|---|---|---|---|---|
| AB | 35.5 | 30.0 | 24.6 | 22.4 | 19.0 | 18.0 |
| both rates /s | 5.7 | 9.3 | 16.8 | 24.8 | 36.9 | **47.7** |

| `V` | 1.00 | 0.80 | 0.60 | 0.45 | 0.35 |
|---|---|---|---|---|---|
| AB | 30.0 | 35.0 | 38.8 | 43.8 | 47.5 |
| both rates /s | 9.3 | 10.7 | 12.0 | 13.5 | 14.6 |

**At every single setting the two rates land equal** (the two columns agree to the last measured digit in every case). That — and only that — is S7's claim.

`N` tap, measured (180 → 220 at t = 15 s, stoichiometric, no `inject`):
```
t=15.0s  A 55  B 55  AB 35 | fwd 10.8 rev 10.8 | 145 discs
t=15.5s  A 75  B 75  AB 35 | fwd 11.4 rev 11.8 | 185 discs   <- 20 A + 20 B poured in
t=20.0s  A 77  B 77  AB 33 | fwd 14.2 rev 14.6 | 187 discs   <- rates already re-converged
t=60.0s  A 67  B 67  AB 43 | fwd 11.8 rev 11.4 | 177 discs   <- composition re-settled
```
**The rates re-converge in ~5 s; the composition takes ~45 s.** That asymmetry is honest and worth the teacher knowing — and it is exactly why S7's claim is about the *rates*.

**`T.min = 250 K`, not kinetic's 150 K:** measured, below 250 K both rates fall under 5.7 /s, which is fewer than ~29 events per 5 s window, and the two bars stop reading as equal. A slider position at which the instrument contradicts the state's own claim should not exist.

**S7 narrates re-establishment, never direction.** "Whatever you change, the two rates come back together and the line goes flat again" is this concept's claim. *Which way* it shifts is `le_chateliers_principle` — the student will see the direction on the T and V sliders, and the narration must not name it.

### Control table (Rule 31 — matches skeleton §4 exactly)

| state | live controls | `show_reaction_readout` | `show_concentration_graph` | `show_collision_counter` | formula surface |
|---|---|---|---|---|---|
| S1 | none | ✔ | — | ✔ | `A + B ⇌ AB` |
| S2 | none | ✔ | — | — | `A + B ⇌ AB` |
| S3 | none | ✔ | ✔ | — | `A + B ⇌ AB` |
| S4 | none | ✔ | ✔ | — | `A + B ⇌ AB` |
| S5 | none | ✔ | ✔ | — | `A + B ⇌ AB` |
| S6 | none | ✔ | ✔ | — | **rate-law derivation (replaces it)** |
| S7 | **T · V · N** | ✔ | ✔ | ✔ | `A + B ⇌ AB` |

`show_energy_ledger`, `show_pressure`, `show_gas_thermometer`, `show_speed_histogram`, `show_gas_law`, `show_trails`, `adiabatic`, `barrier`, `piston_frac`, `piston_from`, `activation_energy_kT`, `hist_species`: **absent in every state.**

**Fall-through probe RUN, not assumed** (`gas_box_state_param_falls_through_to_stale_slider_dom` + `gas_box_slider_default_overrode_authored_state_value`). All seven states driven in rail order *and* in the reordered order `S6 → S1 → S7 → S2 → S4 → S3 → S5`: every state opened at its authored composition, `reverse_attempt_per_s: 0` never leaked out of S1 (every other state read 8), and the 10 s outcomes were identical in both orders. Drag-seize confirmed working as designed: a seized `T` slider overrides a guided state's authored T until the player clears `userTouched` on state entry.

---

## 5. Notation + dialect ladder (Rule 38c/38d)

**Engine-fixed vocabulary — narration must use these exact words, and changing any of them is an engine delta:**

| quantity | on-canvas | source |
|---|---|---|
| forward / reverse rate | `fwd` · `rev` + bars + `N.N/s` | engine |
| cumulative events | `<n> made · <n> broken` | engine |
| composition axes | `count` (y) · `time →` (x) | engine |
| live populations | `A 59   B 59   AB 31` | engine |
| collisions | `NNN collisions/s` | engine |
| the reaction | `A + B ⇌ AB` (⇌ = U+21CC, math-serif Unicode) | authored `formula_overlay` |
| rate laws (**S6 only**) | `rate_f = k_f[A][B]` · `rate_r = k_r[AB]` · `[AB]/([A][B]) = k_f/k_r` | authored `formula_overlay` |

**Ladder (38c).** Core and extended surfaces carry the arrow equation and plain counts — arithmetic and proportionality in words only. `[A]`, `[AB]`, `k_f`, `k_r`, "rate law" and "equilibrium constant" appear in **S6 and nowhere else, including S7**. No logarithms, no calculus rate form (`−d[A]/dt`), no K numerical value, no K-versus-Q anywhere: those are `equilibrium_constant`'s subject and would need a ring below advanced. **Nothing in this concept needed a founder flag.**

**The count↔concentration bridge (Rule 25, required).** The y axis reads `count`. At the fixed box volume of S1–S6 the count is proportional to the concentration, and **S3 must say so once, in plain words, before S6's first square bracket.** In S7 the `V` slider breaks that proportionality — **S7 narration must never read the graph's height as "concentration"**.

**Dialect (38d) — dual-label once, then bare.** "the forward reaction (fwd)" → `fwd`. "reversible reaction (it goes both ways)" → bare. "closed container (a sealed system)" → "closed". Use **"amount"** in the core states and **"concentration"** only after the S3 bridge. IUPAC-first naming is not engaged — A, B and AB are generic placeholders, deliberately (§1).

**Graph axes (38e):** engine-fixed `count` against `time →`, left to right, universal across CBSE, IGCSE, IB, AP and A-level. No board conflict exists, so **no axis-swap toggle is authored** — recorded as a decided non-issue.

---

## 6. Chemical-validity constraints

```json
"constraints": [
  "atoms of each unit are conserved in every state: A-units (n_A + n_AB) and B-units (n_B + n_AB) are constant for the whole life of a state — verified 90/90, 45/45 and 120/60 across all seven states",
  "total charge: LHS = RHS = 0 in every displayed equation; there are no ions anywhere in this concept",
  "m_AB = m_A + m_B and r_AB = sqrt(r_A^2 + r_B^2), forced at init by gasRxResolveSpecies() — mass and disc area are both conserved by a reaction event, so the packing fraction never changes",
  "Ea_rev = Ea_fwd + E_bond is DERIVED and must never be authored; reverse_attempt_per_s is the only reverse knob",
  "fwd_total - rev_total = (dimers on screen) - (dimers at state entry), exactly, at every instant of every state",
  "the equilibrium position depends only on bond_energy_kT, reverse_attempt_per_s, temperature and density; activation_fwd_kT changes the speed of both directions and never where the plateau sits",
  "adiabatic is absent from every state: with the thermostat off the exothermic forward self-heats and the pure-product run freezes, and the same-plateau-from-either-side claim collapses",
  "every state is isothermal at 300 K; measured 291-310 K across all seven states, so no temperature claim may be made in any guided state"
]
```

### Never narrated, never shown

1. **Never "halfway", "half", "half-finished" or "partly finished."** The flat line invites a third wrong belief — that equilibrium is a reaction that ran 50 % of the way — and none of these words has a defence once said. The measured plateau is 34 % converted, which is not half of anything.
2. **Never "perfectly constant", "completely still", "the numbers stop".** Measured, the plateau wobbles ±3.0 counts (1 sd) and ±8 counts peak-to-peak on screen. Say **"stop changing"**, **"hold steady"**, **"stays at about"** — the screen would contradict the stronger word within seconds, and the correction it teaches is worse than the imprecision it fixes.
3. **Never "the reaction has stopped", "the reaction is finished", "nothing is happening"** except in the mouth of the misconception being killed (S3's `misconception_watch.belief`).
4. **Never a violet disc, never "a new particle".** The product is drawn as the two reactant discs joined (F1). "A bonded pair", "the two joined together".
5. **`[A]`, `[AB]`, `k_f`, `k_r`, "rate law", "equilibrium constant" — S6 only** (38c cut-1 coherence: hiding S6 must leave S1–S5 + S7 whole). This includes S7.
6. **"from either direction", "the same equilibrium from both sides", or any reference to starting from pure product — S5 only** (cut-2 coherence: hiding S5 and S6 must leave S1–S4 + S7 whole). S7's invitation is phrased **"disturb it"**, never "start it from the other end".
7. **Le Chatelier's *direction* is out of scope entirely.** The T and V sliders visibly move the plateau (§4 S7) and the narration must not name which way, in any state, including S7. This concept's claim is that the rates always come back together.
8. **Never narrate the count as a concentration before the S3 bridge, and never in S7 at all** (§5).
9. **Never claim a quantity is unchanged without its instrument on screen** (§7).
10. **Never anthropomorphise:** particles do not "want" to bond, do not "try", do not "look for" a partner. They meet, and the meeting either clears the barrier or does not.
11. **No Avogadro-scale label anywhere, and no scale factor.** Every disc on screen is one particle and the counters count discs — skeleton §11(c). A "representative sample" caption would be *false* here, unlike every other chemistry concept in the fleet. Say "particles", never "molecules of a real gas".
12. **No coefficient may ever be written on the equation** — the engine's stoichiometry is strictly 1 + 1 ⇌ 1 (§1).

---

## 7. Gate-8 binding row — `gas_box_state4_asserts_unchanged_speed_with_no_instrument`

> *"A state that asserts a quantity is UNCHANGED must show the instrument that proves it. Under Rule 24 the sim reads with sound off, so a claim carried only by narration is not carried at all."* (owner **alex:chemistry_author**, FIXED)

Every unchanged-claim in this concept, with the instrument that proves it. **S3 makes two at once, and both instruments must be lit.**

| state | the unchanged-claim | the instrument that proves it | what the teacher points at |
|---|---|---|---|
| **S1** | *(none — S1 claims the rate FALLS)* | reaction readout: the `fwd` bar and its `N.N/s` | 18.4 /s → 0.7 /s over the state |
| **S2** | *(none — S2 claims the reverse dominates)* | reaction readout: `rev` long, `fwd` reading exactly `0.0/s` | fwd 0.0 /s at t = 0 with `A 0  B 0` beside it |
| **S3 (a)** | **"the amounts have stopped changing"** | **concentration graph** — three curves flat from ~3 s to the end of the state | the flat right-hand 80 % of the graph |
| **S3 (b)** | **"but the reaction has NOT stopped"** | **reaction readout — both bars lit at equal length AND the `<n> made · <n> broken` totals climbing** | 111 · 77 at 10 s → 202 · 172 at 20 s, under a flat line |
| **S4** | "the two rates are equal" (while the amounts are not) | reaction readout: bars at 8.0 / 7.9 /s **and** the three live counts `A 93  B 33  AB 27` in the same chip | the one chip that carries both halves of the contradiction |
| **S5** | "the plateau is the same one S3 reached" | concentration graph (the level) + reaction readout (`A 59  B 59  AB 31`) | the three numbers, compared with S3's by the teacher |
| **S6** | "nothing drifts, from the very first second" | concentration graph flat from t = 0 **and** both totals climbing in lockstep (88 · 88 at 10 s) | two numbers that stay equal to each other under a flat line |
| **S7** | "the rates always come back together" | reaction readout, live, through every drag | the bars re-levelling after each disturbance |

**Honest limit, recorded rather than papered over:** S5's claim is a *cross-state* comparison, and no instrument can display S3's plateau while S5 is running. The best available proof is the graph level plus three readout numbers that a teacher reads against S3's. The engine-level guarantee behind it is the permanent check `npm run check:gas-reaction` ("same equilibrium from either side"), re-measured here at a 1.5 % gap (§3.5). quality_auditor should treat S5 as the one state whose unchanged-claim is teacher-mediated by design.

**The other GATE 8 rows, discharged.** `pf_readout_ohms_branch_keys_on_bare_slider_name` — this concept adds **no** new single-letter slider id (reuses `T`/`V`/`N` only) ✔. `gas_box_state_param_falls_through_to_stale_slider_dom` + `gas_box_slider_default_overrode_authored_state_value` — probed by driving all seven states in two orders (§4) ✔. `gas_box_freeze_resim_uses_wrong_stepper` ("a green deterministic gate proves frames are REPRODUCIBLE, not correct") — honoured literally: every number in this file is a measurement, not a frame ✔. `gas_box_compressed_state_empty_pane_no_affordance` — S1 and S2 hide the concentration graph that S3 shows; the graph is a bottom-left **inset over the box**, not a reserved pane, so no dead space appears ✔. `chemistry_cache_seeder_missing_particle_field_family` — THE EYE needs a chemistry cache-seed before `visual:eyes` ✔ (json_author). `field3d_particle_field_vestigial_dual_panel_config_gap` — N/A, chemistry ids are forbidden from `concept_panel_config` ✔.

> **Consultation caveat, stated plainly:** this session had no database tool, so I could not run the `engine_bug_queue` SELECT myself. I worked from the orchestrator's run recorded in the skeleton's GATE 8 appendix and re-verified each binding row **against the renderer source and by measurement** rather than taking the row text on trust. If any row has landed since 2026-07-28, quality_auditor should re-run the query.

---

## 8. Drill-down phrasings

**Cluster `does_the_reaction_actually_stop` (S3):**
1. "if the numbers arent changing then the reaction has stopped right"
2. "how can something be happening if nothing is happening"
3. "why do the counters keep going up when the line is flat"
4. "is the reaction actually still going or is that just the animation looping"
5. "at equilibrium do the particles just sit still"

**Cluster `why_doesnt_it_go_to_completion` (S3):**
1. "why doesnt all the A and B just turn into AB eventually"
2. "there is still loads of A and B left so why did it stop"
3. "if you waited a really long time would it finish"
4. "what stops the forward reaction from using everything up"
5. "does equilibrium mean the reaction failed halfway"

**Cluster `what_keeps_the_amounts_constant` (S3):**
1. "what is actually holding the numbers steady"
2. "if particles keep reacting shouldnt the amounts keep changing"
3. "how do the two rates know to be the same"
4. "why does the line wobble a bit if its supposed to be constant"
5. "is something balancing it or does it just happen"

**Cluster `must_products_equal_reactants` (S4):**
1. "shouldnt there be the same amount of reactant and product at equilibrium"
2. "why isnt it 50 50 if its balanced"
3. "i thought equilibrium meant equal amounts on both sides"
4. "how is it balanced when there is way more A than AB"
5. "does balanced mean equal or not, im confused"

**Cluster `reading_equilibrium_amounts` (S4):**
1. "how do i know what the amounts will be at equilibrium"
2. "why did B end up so much lower than A"
3. "can you predict the final numbers or do you have to measure them"
4. "if i started with different amounts would i get different final amounts"
5. "why is there still B left if A is in excess"

**Cluster `equal_rates_vs_equal_concentrations` (S4):**
1. "whats the difference between equal rates and equal concentrations"
2. "how can the rates be equal when the amounts are so different"
3. "does a bigger amount not mean a faster rate"
4. "the bars are the same but the numbers arent, is one of them wrong"
5. "which one actually defines equilibrium, the rates or the amounts"

---

## 9. Values for `json_author` — copy exactly

```jsonc
"particle_field_config": {
  "scenario_type": "gas_box",
  "design": { "background": "#0A0A1A", "phys_seed": 987654321 },
  "canvas": { "width": 900, "height": 560 },
  "gas": {
    "count": 180,
    "temperature_K": 300,
    "ea_ref_T": 300,
    "speed_scale": 0.105,
    "species": [
      { "id": "A",  "mass": 1, "radius": 5,         "color": "#60A5FA", "label": "A",  "count": 90 },
      { "id": "B",  "mass": 1, "radius": 5,         "color": "#F472B6", "label": "B",  "count": 90 },
      { "id": "AB", "mass": 2, "radius": 7.0710678, "color": "#C084FC", "label": "AB", "count": 0 }
    ],
    "reaction": {
      "enabled": true, "reactants": ["A", "B"], "product": "AB",
      "activation_fwd_kT": 1.2, "bond_energy_kT": 2.1, "reverse_attempt_per_s": 8
    }
    // NO "inject". NO "layout" (inert). NO "hist_ref_T"/"pressure_full_scale" (unused instruments).
  },
  "slider_controls": {
    "T": { "label": "Temperature", "min": 250, "max": 900, "step": 10, "default": 300, "unit": "K" },
    "V": { "label": "Volume",      "min": 0.35, "max": 1,  "step": 0.05, "default": 1 },
    "N": { "label": "Add A + B",   "min": 180, "max": 260, "step": 10, "default": 180 }
  },
  "states": {
    "STATE_1": { "label": "STATE_1", "caption": "A and B stick together", "T": 300,
                 "reaction": { "reverse_attempt_per_s": 0 },
                 "show_reaction_readout": true, "show_collision_counter": true },
    "STATE_2": { "label": "STATE_2", "caption": "AB breaks back apart", "T": 300,
                 "species_counts": { "A": 0, "B": 0, "AB": 45 },
                 "show_reaction_readout": true },
    "STATE_3": { "label": "STATE_3", "caption": "Flat line, both still running", "T": 300,
                 "continuous_motion": true,
                 "show_reaction_readout": true, "show_concentration_graph": true },
    "STATE_4": { "label": "STATE_4", "caption": "Equal rates, unequal amounts", "T": 300,
                 "species_counts": { "A": 120, "B": 60, "AB": 0 },
                 "show_reaction_readout": true, "show_concentration_graph": true },
    "STATE_5": { "label": "STATE_5", "caption": "Same end, opposite start", "T": 300,
                 "species_counts": { "A": 0, "B": 0, "AB": 90 },
                 "continuous_motion": true,
                 "show_reaction_readout": true, "show_concentration_graph": true },
    "STATE_6": { "label": "STATE_6", "caption": "Start balanced: nothing drifts", "T": 300,
                 "species_counts": { "A": 59, "B": 59, "AB": 31 },
                 "continuous_motion": true,
                 "show_reaction_readout": true, "show_concentration_graph": true },
    "STATE_7": { "label": "STATE_7", "caption": "All yours — disturb it", "T": 300,
                 "show_sliders": true,
                 "show_reaction_readout": true, "show_concentration_graph": true,
                 "show_collision_counter": true }
  }
}
```

**Authoring-notes block for the JSON** (skeleton §11(j) requires the S3/S5 numbers recorded there): *"Reaction constants measured on the engine 2026-07-28, not chosen. Plateau from pure reactants AB = 30.75 ± 3.75; from pure product (same 90/90 atom inventory, isothermal) AB = 31.22 ± 4.01; gap 1.5 %. Both runs 7 seeds × 90 s. STATE_6's opening is that measured plateau rounded (59/59/31); drift over 20 s = +0.9 counts, inside the ±4 fluctuation band. Do not retune any of the three reaction constants without re-running the S3/S5 pair — they are what makes STATE_5 true."*

`physics_engine_config.formulas` (words, not PM_interpolate — this renderer computes its own physics; nothing here is interpolated into a label):
```json
"formulas": {
  "forward_rate":   "rate of the forward reaction is proportional to n_A x n_B (an A must meet a B)",
  "reverse_rate":   "rate of the reverse reaction is proportional to n_AB (a bonded pair breaks on its own)",
  "reverse_barrier":"Ea_rev = Ea_fwd + E_bond (derived, never authored)",
  "equilibrium":    "at equilibrium the two rates are equal, so the amounts stop changing while both reactions keep running"
}
```

---

## Self-review

- Every quantity named in §3/§4 traces to a `variables`/`formulas` entry in §2 with a unit; no orphan numbers.
- Balanced-equation ledger complete (§1): unit-count table, charge totals, mass and area closure, **and the engine-enforcement site named**; conservation re-verified by measurement in all seven states, both rail orders. No redox, no coefficients, no state symbols on labels (column width) — all three deliberate and recorded.
- Every state declares its archetype-M beat from `docs/patterns/chemistry.md`, a t-window per beat, and controls matching the skeleton's §4 table exactly. **Nothing in this concept needs an unbuilt render surface** — the reaction layer shipped 2026-07-28 and was read at every read site before a number was quoted.
- Rule 32a cause-before-effect verified by measurement in S1 (~1 s), S2 (~1.5 s), S3 (~1 s and continuing to 8 s), S4 (~2 s), S5 (~2 s); **S6's absence of a lag is a declared exception, because "neither leads" is the state's claim.** Rule 32b: only the taught variable's motion changes (S1's reverse-off is the one isolation, declared, never narrated as a claim). Rule 32e single focal named per state.
- Rule 33: the taught variable (two event rates) and its observable (a composition that stops changing) are on one canvas simultaneously — no `macro_view` band, per skeleton §11(g). Every state exposes a real number (§7).
- Rule 34: ONE formula surface per state, the derivation *replacing* the arrow equation in S6; captions are the ≤5-word delta cues only; HUDs are value-only; ⇌ ∝ · → ₂ ≠ are real Unicode.
- Word budget (31a) per state carried from skeleton §4: S1/S2 30–45, S3 45–55, S4 35–50, S5 40–55, S6 45–55, S7 0/open.
- Notation ladder (38c): logs, calculus rate forms and any K value are absent; `[ ]`, `k_f`, `k_r` confined to S6; the count↔concentration bridge placed in S3. Nothing needed a founder flag.
- **No particle-count scale factor is declared, and none may be** — every disc is one particle (§6.11). This is the one chemistry concept in the fleet where a "representative sample" caption would be false.
- 30 drill-down phrases (5 × 6 clusters), student voice, plain English, no Hinglish.
- Numerical sanity check **RUN, not eyeballed**: ~1,100 headless runs across four sweeps plus per-state verification; every table above is output, not arithmetic. The exact bookkeeping identity (fwd − rev = Δ dimers) closes in all seven states.
- Engine bug queue: consulted via the skeleton's recorded GATE 8 appendix (no DB tool this session — caveat stated in §7), every binding row re-verified against source or by measurement, `gas_box_state4_asserts_unchanged_speed_with_no_instrument` discharged state by state in §7.
- Six findings where the physics contradicted the architect's design are stated as findings in §0 with the corrected design, not worked around silently.
- Source check: *"Consulted the NCERT Chemistry chapter index to confirm scope (Class 11, Ch.6 'Equilibrium', §6.2). No teaching method, no example problem, no figure imported. NCERT Exemplar consulted for misconception beliefs only (M1–M3), no problem text imported."* Real-world anchors (a sealed fizzy drink, a sealed bottle half full of water) are universal — no brand, place, currency or festival (Rule 35).
