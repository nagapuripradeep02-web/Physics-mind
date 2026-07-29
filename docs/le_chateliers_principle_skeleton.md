# ARCHITECT SKELETON — `le_chateliers_principle`

> Stage ② artifact (CLAUDE.md §5). Produced by `architect` 2026-07-29 on branch
> `feat/chemistry-le-chatelier`. Next stage: `chemistry-author`.

**Concept:** Le Chatelier's principle · **class_level:** 11 · **schema:** 2.0.0
**Chapter:** NCERT Cl.11 Unit 6 Equilibrium §6.8 · IGCSE · IB (Reactivity 2.3) · AP (Unit 7) · A-level
**renderer_pair:** `particle_field` / `particle_field` · **scenario_type:** `gas_box`
(archetype **M — Particulate box [LIVE]**, reaction sub-capability)
**prerequisites (advisory, Rule 23):** `dynamic_equilibrium` (shipped), `kinetic_particle_theory`
(shipped), `collision_theory_activation_energy` + `rate_of_reaction` (forward refs, not yet built)

## Reaction — KEEP A + B ⇌ AB (2 gas moles → 1), exothermic forward

A decision, not an inheritance:
- The **mole-count asymmetry is required** — a 1→1 reaction shows nothing under compression.
- **Exothermic forward** (`bond_energy_kT = 2.1 > 0`) makes heating shift toward reactants by itself
  via the derived `Ea_rev = Ea_fwd + E_bond` (`particle_field_renderer.ts` ~3458). Nothing scripted.
- Reusing `dynamic_equilibrium`'s constants means the 300 K plateau (**A 59 · B 59 · AB 31**) is
  already measured, seven-seed verified, and gated by `npm run check:gas-reaction`.
  **Do not retune the three reaction constants.**

## Atomic claim

When a settled equilibrium is disturbed (concentration, pressure/volume, temperature), the two rates
go unequal, the composition shifts in the direction that counteracts the disturbance, and the system
re-settles at a NEW position — **partially compensating, never fully undoing.**

Out of scope: what dynamic equilibrium *is* (prerequisite); K_c calculations (future
`equilibrium_constant_kc`); ionic/solubility equilibria (acids-bases arc).

## State count — 8 (complexity-driven)

Exam test: a student watching all eight can predict the shift for adding/removing any species
(S1/S2), compression/expansion with mole-count reasoning (S3), heating/cooling for exo- AND
endothermic (S4), the catalyst non-effect (S5), the inert-gas-at-constant-volume non-effect (S6),
K vs position (S7), and drive it all live (S8).

## Rule 31 per-state control table

All guided states expose ZERO sliders (watch-this beats, matching the shipped predecessor); the
disturbance is AUTHORED so the beat is choreographed, not teacher-dependent. Explore exposes ALL.

| State | Teaches | Archetype | Distinct motion | ≤5-word cue | Controls | Words | Ring |
|---|---|---|---|---|---|---|---|
| **S1** Add reactant | Adding A makes fwd outrun rev → shifts right | `densify/rarefy` (pair w/ S2) | Opens at plateau +30 blue A; fwd bar leaps past rev, green flashes surge, AB curve climbs to a NEW higher flat line, bars re-meet | **"Extra A: shifts right"** | none | 40–55 | core |
| **S2** Remove reactant | The system replaces PART of what was removed — never all | `densify/rarefy` (**declared contrast pair w/ S1**; sign of nudge flips) | Opens at plateau −30 A; orange flashes lead, AB curve FALLS as pairs break to replenish A; A climbs but flattens visibly BELOW its old level | **"A removed: partly replaced"** | none | 40–55 | core |
| **S3** Squeeze the box | Compression favors the side with fewer particles (2→1) | `squeeze-the-box` (coined; the piston IS the cause object) | Piston slides 1.00 → 0.55 (cause first); everything crowds; BOTH rates rise but fwd gains more; AB plateau steps UP | **"Squeezed: fewer particles win"** | none | 35–55 | core |
| **S4** Heat it — **PRIMARY AHA** | Heating an exothermic mixture un-makes product, by collision statistics alone | `heat-the-box` | Thermometer climbs 300 → 500 K (cause); discs blur faster; orange flashes surge — the break-up direction has the bigger barrier and gains more from hotter hits; AB curve slides DOWN | **"Heated: the bond loses"** | none | 40–55 | core |
| **S5** Catalyst | Speeds BOTH directions equally; position does not move | `null-result-hold` (pair w/ S6) | Both barriers lowered; both rate numbers ~3× — while counts sit exactly at 59·59·31 and the line stays flat | **"Catalyst: faster, same place"** | none | 30–50 | core |
| **S6** Inert gas | Adding non-reacting gas at constant volume changes NOTHING | `null-result-hold` (**declared contrast pair w/ S5**: S5 both rates surge / S6 neither moves) | 40 grey inert discs bounce among the mixture; pressure gauge reads HIGHER, yet fwd, rev and all three counts hold the plateau | **"Inert gas: nothing shifts"** | none | 30–45 | extended |
| **S7** Same K, new position | Concentration shifts change amounts but not the ratio; only T changes K | `step-injection/hold` (**declared contrast pair w/ S1**: same +A step, but S1's focal is the rate bars MOVING and S7's is the K chip HOLDING) | Opens at its own settled pose at ~4x density (deliberate, so n_AB is large enough for the chip to be readable); +80 A pour in at 9 s; A relocates while the K chip holds | **"New amounts, same ratio"** | none | 35–55 | **advanced** |
| **S8** Your turn | Every disturbance live; always re-settles part-way | `drag-sandbox` | Continuous run (Rule 37); bars split and re-meet, line re-flattens at a new level after every push | **"All yours — push it"** | **ALL: T · V · N** | 0/open | core |

No archetype repeats except the three declared pairs (S1/S2, S5/S6, S1/S7). No static state.
Advanced ring (S7) is contiguous and immediately before explore ✓ (Rule 38a).

## Misconception watch (Rule 16a — contrast beats, no predict-pause)

| State | belief | visual_counter | one_line_fix |
|---|---|---|---|
| S1 | "Shifting right means the reverse reaction stops" | rev bar never reads zero during the shift and re-meets fwd at a HIGHER rate than before | The shift is a temporary *imbalance* of two running rates, not a shutdown of one. |
| S2 | "The system undoes the disturbance completely" | A's curve flattens visibly SHORT of its old level; narration reads the settled number against the old one | The system pushes back part-way; it never gets all the way home. |
| S5 | "A catalyst shifts equilibrium toward more product" | both rate values ~3× higher while the three counts and the flat line sit where the whole lesson left them | A catalyst lowers both barriers equally — faster arrival, same destination. |
| S7 | "Adding more reactant changes the equilibrium constant" | counts are nothing like 59·59·31, yet the live ratio chip converges to the same K | Amounts move, the ratio doesn't — only temperature changes K. |

EPIC-C branches: ZERO (EPIC-L-first directive).

## Aha designation

- **PRIMARY (S4):** heating un-makes the product all by itself — nobody scripted it; it falls out of
  collision statistics, because the reverse barrier is the forward barrier plus the bond energy.
  *"The system opposes you" is not a will — it's arithmetic.*
- **SUPPORTING (S2):** the opposition is only ever PARTIAL. Establishes that shifts are
  re-settlements, not restorations — which is what makes S4 readable as statistics, not a force.
- **Wrong-belief setup:** S1 and S3 both happen to INCREASE product; by S4 the student expects a
  third increase and watches it fall.
- PRIMARY aha sits inside `entry_state_map.foundational` (S1→S4) ✓.

## Real-world anchor (Rule 35 universal · Rule 38f widest overlap)

**Primary — the ammonia reactor (Haber process).** Named in every syllabus this ships to; no country,
brand, or person. The engineers cannot change the chemistry, so they *disturb* it: high pressure
squeezes toward the side with fewer gas molecules, and removing ammonia keeps the system chasing a
settle-point it never reaches. Turns the principle from a rule to memorize into an engineering lever —
exactly the 2→1 beat of S3. **Secondary:** an opened fizzy-drink bottle going flat.

## entry_state_map

```
foundational:         STATE_1 → STATE_4      # PRIMARY aha inside ✓
concentration:        STATE_1 → STATE_2
pressure_volume:      STATE_3
temperature:          STATE_4
catalyst:             STATE_5
inert_gas:            STATE_6
equilibrium_constant: STATE_7
exploration:          STATE_8
```

## has_prebuilt_deep_dive + drill-down clusters

- **S2** `why_not_fully_restored` · `where_did_the_removed_A_come_from` · `shift_vs_new_equilibrium`
- **S4** `exothermic_vs_endothermic_direction` · `why_heat_favors_bond_breaking` · `does_cooling_make_more_product`
- **S7** `k_vs_position_of_equilibrium` · `why_only_temperature_changes_k` · `same_ratio_different_amounts`

## gas_box config knob plan (★ = chemistry_author MUST measure, never compute)

Concept-level `gas` block inherited verbatim from `dynamic_equilibrium`: `count 180` ·
`temperature_K 300` · `ea_ref_T 300` · `speed_scale 0.105` · A(m1,r5,#60A5FA) / B(m1,r5,#F472B6) /
AB(m2,r7.071) · `reaction { enabled, reactants:[A,B], product:AB, activation_fwd_kT 1.2,
bond_energy_kT 2.1, reverse_attempt_per_s 8, inject:"A" }`. Add species `X` (inert, m 1.5, r 5,
grey `#9CA3AF`, count 0) — verify `check:gas-reaction` still passes 13/13 with a third
non-reacting species and that the pair sweep leaves X strictly elastic.

| State | opening counts | T | piston | reaction override | show_* | note |
|---|---|---|---|---|---|---|
| S1 | A 89 · B 59 · AB 31 | 300 | 1.0 | — | reaction_readout, conc_graph | `continuous_motion`; ★new plateau + re-meet time |
| S2 | A 29 · B 59 · AB 31 | 300 | 1.0 | — | reaction_readout, conc_graph | `continuous_motion`; ★where A flattens (must land visibly < 59) |
| S3 | A 59 · B 59 · AB 31 | 300 | `piston_from 1.0` → `piston_frac 0.55` | — | + **show_pressure** | isothermal (`adiabatic:false`) — a heated compression would smuggle S4's variable in (Rule 32b); ★compressed plateau; ★rate-bar honesty at 0.55 packing |
| S4 | A 59 · B 59 · AB 31 | **500** | 1.0 | — | + **show_gas_thermometer** | ★**see ENGINE GAP G2 — T applies at entry with no ramp** |
| S5 | A 59 · B 59 · AB 31 | 300 | 1.0 | `activation_fwd_kT: 0.5` | reaction_readout, conc_graph | Ea_rev falls equally by derivation — the null is emergent; ★plateau stays 59/59/31 ± band, rates ~3× |
| S6 | A 59 · B 59 · AB 31 · **X 40** | 300 | 1.0 | — | + **show_pressure** | ★pressure up, rates + counts inside the known fluctuation band |
| S7 | A 89 · B 59 · AB 31 | 300 | 1.0 | — | + **show_k_ratio** (gap G1) | `continuous_motion`; ★converged ratio must equal the printed formula value |
| S8 | A 59 · B 59 · AB 31 | slider | slider | inject "A" | + **show_sliders** | `interaction_complete`; T 250–900 · V 0.35–1 · N ★~150–240 (re-derive the rate-bar-honesty floor for asymmetric compositions) |

## Symbol / label table (Rule 34c — engine-fixed vocabulary; narration uses these exact words)

| Quantity | On-canvas |
|---|---|
| rates | `fwd` / `rev`, `N.N/s` (engine-drawn) |
| species | `A` blue · `B` pink · AB narrated "joined pair" (drawn joined, never a violet disc) · inert `X` grey (S6 only) |
| counts | `A 59  B 59  AB 31` |
| event totals | `<n> made · <n> broken` |
| graph axes | `count` / `time →` |
| equation | `A + B ⇌ AB` (S1–S3, S5, S6) · `A + B ⇌ AB + heat` (S4, S8) · `Kc = [AB] / ([A][B])` (S7 only) |

`+ heat` ENTERS at S4 (earned by its beat) and persists. State symbols (s/l/g) deliberately omitted —
A/B are abstract model gas species. Particle-count scale factor stated once in S1
("each disc stands for an enormous number of molecules"), never repeated.

## Rule 38 curriculum-flex

- **Cut checks:** hide advanced (S7) → S1–S6 + S8 coherent (K, Kc, `[A]`, "ratio",
  "equilibrium constant" are **vocabulary-quarantined to S7**). Hide advanced+extended (S6, S7) →
  S1–S5 + S8 coherent (inert gas and species X appear nowhere else).
- **S8 surfaces CORE-ring only** (Rule 38b): `A + B ⇌ AB + heat`, readout + graph. **No ratio chip
  authored in S8** — a teacher may summon it via the ⚙ widget panel (override, not authored content).
- **Presets (hide, never reorder):** `full` = S1–S8 · `no_advanced` = hide S7 · `core_only` = hide S6+S7.

| curriculum | coverage | unit | verified | needs_teacher_verification |
|---|---|---|---|---|
| CBSE/NCERT | full | Cl.11 Unit 6 §6.8 | true | false |
| Cambridge IGCSE | partial (K_c/inert-gas out of scope → S6/S7 hidden) | Reversible reactions and equilibrium | false | **true** |
| IB DP | full | Reactivity 2.3 | false | **true** |
| AP Chemistry | full | Unit 7 (7.9–7.10) | false | **true** |
| Cambridge A Level | full | Equilibria — Le Chatelier, K_c qualitative | false | **true** |

## ENGINE GAPS — `[owner: peter_parker:renderer_primitives]`, Rule 40 (master, separately)

- **G1 — live K-ratio chip (`show_k_ratio`). REQUIRED for S7 as designed.** Value-only instrument
  reading `[AB]/([A][B])`, riding the same full-box-area normalisation as the viewport-independence
  fix (or the number is monitor-dependent — that exact scar). One `drawGas*` chip + flag +
  `PF_WG_FLAGS` registration + `pfWgVis` gate (Rule 39 canvas-HUD path).
  *Fallback if refused:* S7 demotes to formula-surface + narrated measured numbers — weaker
  (violates Rule 33d spirit); quality_auditor must review the exception explicitly.
- **G2 — mid-state disturbance cues (`T_from` ramp, injection cue).** The architect scoped this
  "optional, low priority". **Verified against the engine and escalated to REQUIRED for S4** — see
  the session note below.

## Verification note (main session, 2026-07-29) — G2 is required, not optional

`gasInit()` sets `gasTempK = gasTargetT()` then `gasRescaleToT(gasTempK)`
(`particle_field_renderer.ts` ~3726 / ~3768): particles are **seeded at the state's target
temperature**. `gasThermostat()` does ease (`next = meas + (target − meas) * 0.10`, commented
"Eased so the change is watchable"), but that easing **never engages on state entry** because
measured ≈ target from frame 1.

Consequence: S4 authored as `T: 500` opens **already hot**. The thermometer reads 500 from the first
frame and the heating — the CAUSE, on the concept's PRIMARY aha state — is never seen.
That is a Rule 32a violation (cause must move visibly before the effect).

The engine already solves exactly this problem for the piston: `piston_from` exists so the wall
"is SEEN to move (Rule 32a)", with the comment noting the alternative is that a state "opens at the
end pose and the ghost outline has to carry the delta alone." **There is no `T_from` equivalent, and
no authored-injection equivalent for N.** So of Le Chatelier's three disturbances, the engine can
currently show the cause for exactly one (the piston).

`T_from` is cheap because the easing machinery already exists — seed at `T_from` instead of the
target and the existing thermostat ramps to it. `barrier_lift_cue` proves gas_box already carries
authored mid-state cue ids, giving the pattern for an injection cue.
