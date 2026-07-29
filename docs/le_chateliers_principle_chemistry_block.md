# CHEMISTRY BLOCK — `le_chateliers_principle`

> Stage ③ artifact. Produced by `chemistry-author` 2026-07-29, then amended by the main session
> after three engine capabilities landed on master. Companion to
> `le_chateliers_principle_skeleton.md`. **Every number here was MEASURED** on the emitted
> `particle_field_renderer.ts` via a headless vm harness modelled on
> `src/scripts/check_gas_reaction_physics.ts` — never computed, never guessed.
> Next stage: `json-author`.

## ⚠ THE EYE READS THE CACHE, NOT YOUR SOURCE — RE-SEED AFTER EVERY EDIT

`visual_eyes.ts` → `loadCachedSim()` reads **only** the `simulation_cache` row for the concept
(`src/scripts/lib/loadCachedSim.ts`). It never reads the concept JSON or the renderer. For chemistry
concepts that row is populated **by hand** and **does not refresh** when you edit either one:

```bash
npx tsx --env-file=.env.local src/scripts/_seed_chemistry_cache.ts le_chateliers_principle
```

**Run that after ANY concept-JSON or renderer change, BEFORE dispatching eye-walker.** Skipping it is
silent and total: on 2026-07-29 a post-fix re-walk returned **35/35 deterministic checks green** while
rendering entirely pre-fix content — the thermometer collision, the un-ramped piston, the old STATE_7
opening pose and the old slider label all "still broken" in frames, all four already fixed in source.
Every visual finding in that run was a false negative on the fix. The walk is only trustworthy if the
cache was re-seeded after the last edit.

## Engine capabilities available (all landed on master today, all merged here)

| Field | Commit | What it buys |
|---|---|---|
| `T_from` + `T_ramp_ms` | `4e6df01` | open a state cold and ramp to `T` — the heating is SEEN (Rule 32a) |
| `inject_cue` + `inject_n` + `inject_species` | `4e6df01` | add/remove reagent mid-state on the state clock |
| `show_k_ratio` | `4e6df01`, `aa21a14` | live K chip, 10 s window |
| `reaction_at_cue: { cue, <constant> }` | `532976f` | change a reaction constant mid-state — the catalyst beat |

Because these exist, **every disturbance in this concept arrives while the class watches.** The
skeleton's "opens already-disturbed" states are all reworked into cue-driven beats: the settled
equilibrium is on screen first, the disturbance arrives, the system responds. That ordering IS
Rule 32a and it is the whole point of the concept.

## Three corrections to the skeleton (found by measuring)

1. **S5's catalyst is ×2.16, not "~3×".** Measured `activation_fwd_kT: 0.5` vs baseline `1.2`:
   fwd 22.02/s vs 10.21/s, rev 21.95/s vs 10.27/s. A spoken number — it must be right.
   Narrate **"roughly doubles"**.
2. **S5 CAN now show its catalyst arriving** — this supersedes chemistry-author's §0.2, which
   correctly reported that no such field existed at the time. `reaction_at_cue` (`532976f`) was built
   for exactly this. Verified: Ea_fwd 6.3480 → 2.6450 on the cue, Ea_rev falls by exactly the bond
   energy (difference holds at 10.5800 to 1e-9), so the "no shift" result stays **emergent**.
3. **S7's K chip wanders and must NOT be narrated as constant.** Measured swing of the displayed
   value at this concept's configuration:

   | window | range | swing |
   |---|---|---|
   | per-frame | 0.0027–0.0195 | 86% |
   | 5 s | 0.0050–0.0139 | 64% |
   | **10 s (shipped)** | 0.0060–0.0120 | **50%** |
   | 60 s | 0.0080–0.0092 | 13% |

   Fluctuations are slow (autocorrelated over tens of seconds), so averaging buys far less than
   √n and 60 s is already twice S7's duration. A settling average across three seeds at 30 s gives
   baseline 0.0085 / 0.0097 / 0.0094 and disturbed 0.0082 / 0.0092 / 0.0095 — **the two populations
   overlap completely**, which is exactly the physics claim, but no single-run readout settles.
   **This framing was WRONG and was later removed.** "the amounts moved ~50%" was a BETWEEN-RUN
   comparison (baseline A 59 vs disturbed A 89) spoken as an in-state observation — the exact error the
   STATE_7 redesign was built to kill. Do not reintroduce it. The state now opens at its own settled
   pose and injects +80 A mid-state, so both numbers are observable inside one continuous state, and
   the density was raised until the chip could actually carry the claim (see the S7 row).

## Authoring trap — MUST be honoured by json_author

If a state omits a species from `species_counts`, `gasInit` treats it as undeclared and fills it with
`total − declared` split among undeclared species. Measured: X silently opened at **31, not 0**,
defeating the "inert gas arrives" beat. **Every state must author `X: 0` explicitly** unless X is
meant to be present at entry.

## Balanced-equation ledger

`A + B ⇌ AB` — abstract model species, no state symbols, no redox, charge 0 both sides.
A-content and B-content each conserved (free + bound). `m_AB = m_A + m_B` and
`r_AB = √(r_A² + r_B²)` are DERIVED and enforced at init (`gasRxResolveSpecies`), never authored.

`+ heat` on the RHS is thermodynamically honest: `bond_energy_kT = 2.1 > 0`, and `Ea_rev = Ea_fwd +
E_bond` is derived, so the dissociation barrier is always higher by exactly the bond energy.
Confirmed empirically — during S4's ramp the reverse rate overtakes forward at t≈1.75 s and stays
ahead. `+ heat` enters at S4 (earned) and persists to S8.

## Reaction constants — DO NOT RETUNE

`activation_fwd_kT 1.2` · `bond_energy_kT 2.1` · `reverse_attempt_per_s 8` · `ea_ref_T 300` ·
`speed_scale 0.105` · `count 180` · `inject: 'A'`.
`check:gas-reaction` and the shipped `dynamic_equilibrium` both depend on them.
**S5's `activation_fwd_kT: 0.5` via `reaction_at_cue` is the ONE authorised override.**

Species: A blue `#60A5FA` (m1 r5) · B pink `#F472B6` (m1 r5) · AB (m2 r7.0710678, drawn joined) ·
**X grey `#9CA3AF` (m1.5 r5), inert, count 0** unless authored.

Baseline measured plateau, isothermal 300 K from `{A:59,B:59,AB:31}`:
**AB mean 29.68 · fwd 10.21/s · rev 10.27/s** (long-window mismatch 0.6%) · **K = 0.00857**.

> **⚠ RATE AND PRESSURE FIGURES ARE VIEWPORT-DEPENDENT — NEVER SPEAK THEM AS ABSOLUTES.**
> `gasRxAreaNorm` normalises the equilibrium COMPOSITION, not the displayed readouts. Measured from
> 900×560 to 1600×900: **`fwd`/s spans ~3.9×** (13.36 → 3.45) and **pressure ~4×**. Every `/s` and
> pressure number in this document is "as measured at 900×560" and is NOT what a classroom display
> shows. **Composition counts ARE viewport-stable** (AB 28.7–36.9 across the same sweep) and may be
> narrated. Pressure is worse still: even the *fractional* jump in S6 ranges **15.4%–48.4%**
> run-to-run at a FIXED viewport, so no percentage is honest — narrate direction only.
> Recorded as an engine limitation for `peter_parker:renderer_primitives`; the authoring rule is to
> phrase rates comparatively ("both roughly double", "forward pulls ahead") and never absolutely.

## Per-state spec with measured numbers

| State | Opening | Disturbance | Measured result | Ring | Duration |
|---|---|---|---|---|---|
| **S1** Add reactant | `{A:59,B:59,AB:31}` settled | `inject_cue` @1000 ms, `inject_n:+30`, `inject_species:'A'` | plateau **AB 29.68 → 37.58** (+27%); rates re-meet at **fwd 12.50 / rev 12.42** — both HIGHER than before (kills "the reverse stops"); bars re-meet ≈6 s after the cue | core | 24000 ms |
| **S2** Remove reactant | `{A:59,B:59,AB:31}` settled | `inject_cue` @1000 ms, `inject_n:−30` | A crashes to ~26, then climbs and settles at **A≈38.9** (re-measured over 9 runs; the earlier ~41 was superseded) — visibly short of the original 59; AB plateau **→20.6**. Never breaks a bonded pair | core | 24000 ms |
| **S3** Squeeze | `{A:59,B:59,AB:31}` | `piston_from 1.0 → piston_frac 0.55`, **`piston_ramp_ms: 6000`**, `adiabatic:false` | peak measured T **322–337 K** (mean 331, 10 seeds) vs **7173–9594 K** on the default unramped stroke; forward leads on net through the response window (mean fwd−rev **+0.75/s, positive in all 10 seeds**); AB dips modestly (mean min 26.4) and never crashes below its 31 opening; settled plateau **43.1** (35.9–48.5) | core | 20000 ms |
| **S4** Heat it — **PRIMARY AHA** | `{A:59,B:59,AB:31}`, `T:500`, **`T_from:300`** | ramp | thermometer 300→~472 K by t=2 s **while AB is still 33 at t=1 s** — cause before effect, measured. Reverse overtakes forward at t≈1.75 s. Transient low **AB 14 at t=3.25 s**, settles **→22.28** (−25%). Final rates fwd 27.17 / rev 27.19 — *everything* got faster, only the ratio shifted | core | 26000 ms |
| **S5** Catalyst | `{A:59,B:59,AB:31}` | `cues:[{id:'add_catalyst',at_ms:...}]` + `reaction_at_cue:{cue:'add_catalyst', activation_fwd_kT:0.5}` | Ea_fwd 6.3480→2.6450, Ea_rev falls by exactly the bond energy; rates **×2.16 fwd / ×2.14 rev**; plateau **31.80 — inside the baseline band**. Narrate "roughly doubles" | core | 18000 ms |
| **S6** Inert gas | `{A:59,B:59,AB:31,`**`X:0`**`}` | `inject_cue` @1000 ms, `inject_n:+40`, `inject_species:'X'` | pressure **0.0967 → 0.1382 (+43%)**; AB 30.45, fwd 10.90, rev 11.04 — statistically identical to baseline. X held at **exactly 40** across 7 samples over 70 s: strictly elastic | extended | 22000 ms |
| **S7** Same K | `{A:156,B:156,AB:204,X:0}` — **~4x density, deliberate** | `inject_cue` @9000 ms, `inject_n:+80`, `inject_species:'A'` | `show_k_ratio`. Read off shipped frames: K **0.0089** pre-cue → **0.0094** at the end (+5.6%) while A goes **138 → 210** (+52%). Amounts outrun the ratio ~9:1; 0 of 8 seeds invert, at three viewports | **advanced** | 30000 ms |
| **S8** Explore | `{A:59,B:59,AB:31}` | sliders | `interaction_complete`, continuous (Rule 37). Core-ring only — **no K chip** | core | open |

## Slider spec

Guided states S1–S7: **no live sliders** (watch-this beats). S8: **all three.**

| Slider | Range | Default | Note |
|---|---|---|---|
| T | 250–900 K | 300 | step 10 |
| V | 0.35–1 | 1 | step 0.05 |
| N | **130–260** | 180 | step 10 — floor **re-derived by measurement**, not the skeleton's guessed 150 |

N floor evidence (A-only tap): at N=130 free A settles to 24 with 0.3% rate mismatch; at N=120 → 16;
at N=100 → 5 free A and rates collapse to ~1.2/s (box reads "dead"). Below ~130 the box starves of
visible blue discs — a legibility failure (Rules 33/34), not a numeric one.

## Chemical-validity constraints

- A-units (`n_A + n_AB`) and B-units (`n_B + n_AB`) individually conserved for the life of a state —
  verified 90/90 baseline, 120/90 after S1's +30, 60/90 after S2's −30, exact to the unit.
- Charge 0 = 0 in every displayed equation; no ions anywhere.
- `Ea_rev = Ea_fwd + E_bond` is DERIVED, never authored.
- The equilibrium position depends only on `bond_energy_kT`, `reverse_attempt_per_s`, temperature and
  density — `activation_fwd_kT` changes SPEED only. Verified via S5's plateau sitting in band.
- K as printed is a raw-count ratio specific to this box's geometry and particle count. Portable
  across STARTING COMPOSITIONS (the S7 claim); **not a literal textbook Kc** and never quoted as one.
- Species X strictly elastic — never converted, never removed.

## Notation ladder + dialect (Rule 38c/38d)

Core/extended states (S1–S6, S8) use no K / `[A]` / rate-law vocabulary at all. `K`, `Kc`, `[AB]`,
"equilibrium constant" are **vocabulary-quarantined to S7** — hiding S7 leaves S1–S6 + S8 coherent
with zero undefined terms (Rule 38a cut check). The on-canvas chip is engine-hardcoded to print bare
`K = 0.0086`, never `Kc`; a formula surface may write `Kc = [AB] / ([A][B])`, but narration
referring to the number on screen must say "K".

`text_hi` is authored downstream by the Rule 30g sub-agent — English-only product, Hindi text-only,
never a gate (Rule 30i).

## Drill-down clusters — 5 student-voice phrases each

**S2 `why_not_fully_restored`** — "if it's fighting the change why doesn't it just put all the A
back" · "so removing stuff is pointless then, it just fixes itself?" · "how much comes back, is there
a rule" · "does it ever get back to exactly where it started" · "I added A back later, does it now go
past the old amount"

**S2 `where_did_the_removed_A_come_from`** — "wait some of the AB just broke apart to make new A?
nobody told it to do that" · "is the AB breaking apart the same reaction running backwards or a
different thing" · "why would AB give up being a stable pair just because we took some A away" · "so
AB isn't actually stable, it was always breaking apart a little?" · "did we lose energy when AB broke
apart"

**S2 `shift_vs_new_equilibrium`** — "is this a new equilibrium or just the old one recovering" · "how
do I know when it's stopped shifting" · "does the K value change when it shifts like this" · "the
rates went unequal for a while — is that not equilibrium during that time" · "so 'shifting' just
means the rates are temporarily out of sync?"

**S4 `exothermic_vs_endothermic_direction`** — "how would I know just by looking at the equation which
way heating pushes it" · "if the forward reaction was endothermic, would heating make more product?"
· "does 'exothermic' mean the forward direction or can either direction release heat" · "why is bond
energy positive here, shouldn't breaking a bond need energy" · "is one direction always exothermic
and the other always endothermic?"

**S4 `why_heat_favors_bond_breaking`** — "why does the harder reaction benefit MORE from more heat,
that seems backwards" · "both reactions get faster when you heat it, so why does the balance move at
all" · "is it that hot collisions are more likely to break AB apart than to form it?" · "does the
same barrier math work for freezing something" · "if I could see individual collisions, what would
look different at 500 K vs 300 K"

**S4 `does_cooling_make_more_product`** — "so if heating destroys the product, does cooling make
more?" · "would cooling below 300 K turn basically all A and B into AB" · "is there a coldest point
where nothing happens" · "does cooling work the opposite way as fast as heating did" · "why don't we
just run this reaction cold from the start then"

**S7 `k_vs_position_of_equilibrium`** — "what's the difference between K and 'the equilibrium
position'" · "if K doesn't change but the amounts do, what does K even tell you" · "so two
different-looking boxes can have the same K?" · "is 'position of equilibrium' just a fancy way of
saying the actual amounts" · "why do we need both a number and a position"

**S7 `why_only_temperature_changes_k`** — "why does temperature get to change K when nothing else
does" · "a catalyst speeds things up, so why doesn't THAT change K" · "if I squeeze the box does K
change even a little" · "what is it about heat specifically that's different from concentration or
pressure" · "does every reaction's K respond to temperature the same direction?"

**S7 `same_ratio_different_amounts`** — "if the ratio's the same, why does it matter what amounts I
start with" · "so no matter how much extra A I dump in, I land on the same K?" · "does 'same ratio'
mean the same NUMBER of A and B, or something else" · "how is the ratio staying fixed while the
counts keep changing" · "could I use K to predict the amounts before running the box at all"
