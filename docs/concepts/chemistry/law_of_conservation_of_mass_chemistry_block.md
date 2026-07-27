# Chemistry block — `law_of_conservation_of_mass`

Pipeline: architect → **chemistry_author** (this file) → json_author → quality_auditor.
Input: `docs/concepts/chemistry/law_of_conservation_of_mass_skeleton.md` (read completely, including the APPENDIX). Cross-checked against `docs/patterns/chemistry.md` (archetype O, §0 triangle, §5 helpers, §6 sources) and the structural precedent `src/data/concepts/chemistry/bohr_model_energy_levels.json`. All four OPEN `engine_bug_queue` scars in the skeleton appendix verified directly against `src/lib/renderers/parametric_renderer.ts` (`PM_safeEval`/`PM_buildEvalScope` — `PI` is in scope, `radians()` is not; `drawVector` — `magnitude_expr`+`direction_deg_expr` is a real live-bound path, authored in degrees, renderer converts internally; `drawCanvasSlider`/`PM_sliderValues` — confirms the stale-label mechanics) and resolved concretely below.

## Two corrections to the skeleton (made explicit, not silently worked around)

1. **M1's `one_line_fix` in skeleton §4 is not symmetric.** As written ("The mass left the pan, not the universe — seal it and nothing is lost") it only names *leaving*, which is exactly the seed the Pass-1 checklist warns could plant M2 ("rusting creates mass"). **Corrected wording (used in the S2 motion timeline below):** "Mass never leaves the universe and never arrives from nowhere — seal the system and nothing is lost, nothing is gained."

2. **DoD (j)'s `reading`/`delta_reading` formulas are physically ambiguous for the open case and must be replaced, not just filled in.** As given (`reading = tare + (sealed ? m_reactants : m_reactants − m_CO2)`), since `m_reactants ≡ m_CO2` identically (mass conservation holds for every m_C, not just the default), the open-case reading collapses to a **constant `tare`, independent of m_C** — the S7 slider would visibly do nothing to the open reading. Physical reason: ambient O2 is never weighed by an open pan/flask (it diffuses in untracked), so it cannot be subtracted out of the reading in the first place — only the departing *carbon* mass was ever on the scale. Corrected model (worked numerically in §3):
   - `reading_initial = tare + m_C + (vessel_sealed ? m_O2 : 0)` — a sealed vessel must be pre-loaded with its O2 before sealing to react at all; an open pan never had O2 on it.
   - `reading_final = tare + (vessel_sealed ? (m_C + m_O2) : 0)` — sealed: nothing left, unchanged; open: everything that reacted has left as escaped CO2, only the bare apparatus (`tare`) remains.
   - `delta_reading = reading_final − reading_initial` (simplifies to `0` sealed, `−m_C` open).
   - **Corrected `computed_outputs` key set:** `m_O2, m_CO2, n_C, m_reactants, m_products, reading_initial, reading_final, delta_reading, m_solid_after_S5, m_gas_after_S5, m_total_S5, atoms_scale_label` — this REPLACES the skeleton's original `{m_reactants, m_products, reading, delta_reading, ...}` set. `json-author` must treat this file's §2/§3 as authoritative for `physics_engine_config.computed_outputs`, not the skeleton's original DoD (j) line.

---

## 1. Balanced-equation ledger

### Reaction 1 — S3/S4/S7: `C(s) + O2(g) → CO2(g)`

| Element | LHS count | RHS count |
|---|---|---|
| C | 1 | 1 |
| O | 2 | 2 |

Charge: LHS 0 → RHS 0 (all neutral molecules; no ions anywhere in this concept).

**Mass ledger**, teaching-rounded atomic masses `M_C = 12` (IUPAC 12.011), `M_O = 16` (IUPAC 15.999) — same convention as Bohr's `hc_eV_nm = 1240` (rounded for whole-number display, precise value never propagated into stored intermediates). Precision check: precise IUPAC gives CO2 = 12.011 + 2(15.999) = 44.009, which still rounds to **44.0 g** at the 1-dp display precision used everywhere on screen — zero visible discrepancy. NCERT itself teaches integer atomic masses at this level, so this is standard, not a simplification unique to the sim.

`12.0 g (C) + 32.0 g (O2) = 44.0 g (CO2)` — closes exactly.

**Redox note (explicit, per hard constraint):** this reaction is technically a redox reaction (C: 0 to +4, O: 0 to -2), but oxidation-state analysis is out of scope and **no oxidation-number labels appear anywhere** — deferred to the redox chapter, per DoD (c) and the task's explicit "no oxidation numbers" constraint.

### Reaction 2 — S5: `iron + oxygen → iron oxide (rust)` (word equation only)

**Verified the skeleton's decision holds.** The real balanced equation `4Fe(s) + 3O2(g) → 2Fe2O3(s)` needs two untaught things simultaneously: (a) balancing coefficients (deferred to `balancing_chemical_equations`), and (b) the correct ionic formula Fe2O3 itself, which requires knowing Fe3+/O2- valencies to cross-multiply subscripts — not prior knowledge the way H2O/CO2/O2 are, and not yet taught. Writing "Fe2O3" on screen would silently teach an unearned formula. The word equation is the only chemically honest option here. **Confirmed correct, no change.**

**Drawn-particle atom-count table (representative, NOT the true 4:3:2 mole ratio):**

| Species | Before | After |
|---|---|---|
| Fe atoms (drawn) | 2 (in solid) | 2 (still solid, now bonded to O) |
| O atoms (drawn) | 2 (in gas pool) | 2 (now bonded onto the solid surface) |

Charge: 0 to 0. No formula label is ever attached to the bonded pair on screen (not "FeO," not "Fe2O3") — only the word tiles `iron (s)` / `oxygen (g)` / `iron oxide (s)` per DoD (b). **Scale disclosure required on screen:** "2 atoms shown — representative; a real rusting nail involves billions" (same convention as Bohr STATE_6's "one atom shown — a real lamp: ~10^22 atoms/s").

**Recomputed the "+0.6 g solid = -0.6 g gas" numbers from real atomic masses — they close correctly, no fix needed.** Using teaching-rounded `M_Fe = 56` (IUPAC 55.85) and `M_O = 16`: Fe2O3's mass composition is Fe : O = 112 : 48 = **7 : 3 exactly** (70.0% Fe, 30.0% O by mass, using the rounded integers — precise IUPAC gives 69.94%/30.06%, invisible at 1 dp). So for 0.6 g of O to join the solid: `Fe consumed = 0.6 x 7/3 = 1.4 g`, `Fe2O3 formed = 1.4 + 0.6 = 2.0 g`. Full worked ledger, locked as the three S5 readouts:

| Readout | Before | After | Delta |
|---|---|---|---|
| solid (iron/iron oxide) | 10.0 g | 10.6 g | **+0.6 g** |
| gas (oxygen reservoir, sealed) | 5.0 g | 4.4 g | **-0.6 g** |
| TOTAL | 15.0 g | 15.0 g | **0.0 g** |

(10.0 g starting iron, 5.0 g starting sealed O2 reservoir are illustrative constants — S5 has no live controls per the skeleton's control table, so these are fixed staged numbers, not slider-derived. This is a **sealed** jar, per DoD (g)'s "TOTAL holds" — the whole point only works in a closed system, same apparatus rig as S1/S2/S7 with contents swapped narratively from charcoal to an iron nail + its enclosed air.)

---

## 2. Quantities (`physics_engine_config.variables`)

Every name below is used **identically** in `physics_engine_config.variables`/`formulas`/`computed_outputs` and must be returned with the same spelling by `computePhysics_law_of_conservation_of_mass` — this directly satisfies scar (c) (`normal_reaction_state5_computed_outputs_name_mismatch`).

| Name | Meaning | Unit | Min | Max | Default | Step | Display |
|---|---|---|---|---|---|---|---|
| `m_C` | mass of carbon sample | g | 1 | 24 | **12** | **1 (integer — see §3 rounding note)** | 1 dp |
| `vessel_sealed` | 0 = open, 1 = sealed | — | 0 | 1 | 1 (S7); n/a (S4 doesn't use it) | 1 | boolean |
| `tare` | balance + flask hardware mass | g | — | — | constant **38.0** | — | 1 dp |
| `M_C` | atomic mass of carbon (teaching-rounded, IUPAC 12.011) | g/mol | — | — | constant 12 | — | — |
| `M_O` | atomic mass of oxygen (teaching-rounded, IUPAC 15.999) | g/mol | — | — | constant 16 | — | — |
| `M_O2` | molar mass O2 | g/mol | — | — | constant 32 | — | — |
| `M_CO2` | molar mass CO2 | g/mol | — | — | constant 44 | — | — |
| `M_Fe` | atomic mass of iron (teaching-rounded, IUPAC 55.85), S5 only | g/mol | — | — | constant 56 | — | — |
| `N_A` | Avogadro constant | /mol | — | — | constant 6.022e23 | — | S7 scale-factor label only |
| `m_Fe_before_S5` | S5 staged constant | g | — | — | constant 10.0 | — | 1 dp |
| `m_gas_before_S5` | S5 staged constant (sealed O2 reservoir) | g | — | — | constant 5.0 | — | 1 dp |
| `m_O2_reacted_S5` | S5 staged constant | g | — | — | constant 0.6 | — | 1 dp |
| `m_Fe_reacted_S5` | S5 staged constant (= 0.6 x 7/3) | g | — | — | constant 1.4 | — | 1 dp |

**Formulas** (all use `n_C`/`m_O2`/etc. names exactly as declared; angle math nowhere calls `radians()` — see §4 needle spec):

```
m_O2            = m_C * 32 / 12
m_CO2           = m_C * 44 / 12
n_C             = m_C / 12
m_reactants     = m_C + m_O2
m_products      = m_CO2
reading_initial = tare + m_C + (vessel_sealed ? m_O2 : 0)
reading_final   = tare + (vessel_sealed ? (m_C + m_O2) : 0)
delta_reading   = reading_final - reading_initial
m_solid_after_S5 = m_Fe_before_S5 + m_O2_reacted_S5
m_gas_after_S5   = m_gas_before_S5 - m_O2_reacted_S5
m_total_S5       = m_Fe_before_S5 + m_gas_before_S5
atoms_scale_label = "≈ " + n_C.toFixed(2) + " × 6.022×10²³ atoms"
```

**`computed_outputs`** (exactly this key set — diff against `computePhysics_law_of_conservation_of_mass`'s returned `variables`+`derived` before shipping, per scar c): `m_O2, m_CO2, n_C, m_reactants, m_products, reading_initial, reading_final, delta_reading, m_solid_after_S5, m_gas_after_S5, m_total_S5, atoms_scale_label`.

---

## 3. Number lock

**Rounding-robustness design decision (prevents the recorded "7.07 × 0.784 = 5.54 / 5.55" Checkpoint-B scar):** `m_C`'s slider **step is fixed at 1 (integer grams)**. Since `frac(m_C + m_O2) = frac(m_O2)` exactly whenever `m_C` is a whole number (because `m_CO2 = m_C + m_O2` is an algebraic identity), `round(m_C + m_O2, 1) ≡ m_C + round(m_O2, 1)` for **every** integer `m_C` from 1–24 — verified by hand for all 24 values, e.g. m_C=1: 1.0+2.7=3.7 = round(3.6667,1); m_C=7: 7.0+18.7=25.7 = round(25.6667,1); m_C=13: 13.0+34.7=47.7 = round(47.6667,1) (every value checked, all close). **If json_author ever allows a fractional step on `m_C`, this guarantee breaks and Checkpoint-B-style mismatches WILL appear** — step=1 is a hard requirement, not a style preference.

**S1 tick sequence — `50.0 → 49.2 → 48.1 g`.** Derived, not literal: `reading_initial = tare(38.0) + m_C(12.0, default) + 0 (open) = 50.0`. Tick 1 = a staged burn of 0.8 g of the 12.0 g lump → 50.0 − 0.8 = **49.2**. Tick 2 = a further staged burn of 1.1 g → 49.2 − 1.1 = **48.1**. Total burned in S1 = 1.9 g of the original 12.0 g (10.1 g remains unburned, shown only as the shrinking lump, no on-screen number required). This is entirely a *carbon-mass* bookkeeping — S1 shows **macro-only** (per DoD g), no O2/CO2 number ever appears, consistent with `reading_initial`/`reading_final` both being computed with `vessel_sealed=0`. **The sequence survives the number lock unchanged** — it was already consistent once tare=38.0/m_C=12.0(default) are declared; no fix was required.

**S2 Δ readings — `−1.9 g` (open) vs `0.0 g` (sealed), matching DoD (g) exactly.** "Same burn" = identical starting conditions to S1, replayed side by side with a sealed twin (Rule "teach_concrete_before_abstract_compare" — S2 must *stage* the sealed twin in after a beat, not populate both panels at t=0):
- **Open panel:** `reading_initial = 50.0` (identical to S1) → after the same 1.9 g burn → **48.1**. Delta = **−1.9 g**.
- **Sealed panel:** `reading_initial = tare + m_C + m_O2 = 38.0 + 12.0 + 32.0 = 82.0`. Because the flask is sealed, the reading is provably constant **at every instant of the reaction, not just at the two endpoints** (nothing can leave a closed system, regardless of how far the reaction has progressed) → stays **82.0** throughout. Delta = **0.0 g**.

**S3 atom audit — "3 atoms in, 3 atoms out."** The same three atoms (1 C @ 12, 2 O @ 16 each) total 12+16+16 = 44 both before and after — trivially conserved because it is *literally the same three atoms*, just regrouped. This is the number that S6 later generalizes.

**S4 ledger — default and both slider extremes:**

| `m_C` | `m_O2` | `m_CO2` | Check |
|---|---|---|---|
| 1 g (min) | 2.7 g | 3.7 g | 1.0+2.7=3.7 |
| **12 g (default)** | **32.0 g** | **44.0 g** | 12+32=44 |
| 24 g (max) | 64.0 g | 88.0 g | 24+64=88 |

Needle in S4 sits at **0° always** — `m_reactants ≡ m_CO2` is an algebraic identity, true for every `m_C`, so "the balance needle centers on equality" is not just true at default, it's true everywhere on the slider (this IS the demonstration: "any amount still balances").

**S5** — locked in §1 above (10.0→10.6, 5.0→4.4, 15.0→15.0).

**S6 — `Σnᵢmᵢ` values, using the default m_C=12 scenario for concreteness (matches S4's numbers):** reactants: `n_C·m_C + n_O·m_O = 1×12 + 2×16 = 44`. Products: same three atoms, same sum = `1×12 + 2×16 = 44`. `m_before = m_after = 44 g` **to the gram** — because the counts `nᵢ` are identical, not because of any coincidence.

**S7 defaults — `m_C = 12 g`, `vessel_sealed = 1` (default = the "law holds" resting position):**
- Sealed default: `reading_initial = reading_final = 38.0+12.0+32.0 = 82.0 g` (flat, Delta 0.0).
- Toggled open at default `m_C`: `reading_initial = 38.0+12.0 = 50.0 g` (callback to S1/S2's number), `reading_final = 38.0 g`, Delta = −12.0 g.
- At `m_C=1`: sealed 41.7 g flat; open 39.0→38.0 (Delta −1.0).
- At `m_C=24`: sealed 126.0 g flat; open 62.0→38.0 (Delta −24.0).
- `atoms_scale_label` at default: `n_C = 12/12 = 1.00` → **"≈ 1.00 × 6.022×10²³ atoms"** (a clean 1-mole payoff at default — deliberate).

---

## 4. Within-state motion timeline (Rule 31)

**Needle mechanics (resolves scars a/b/d together, applies to every state that shows the balance):** GUIDED states (S1, S2 both panels, S5) author the needle as **literal `from`/`to` pixel pairs**, one short `vector` per tick window, staged in/out via `appear_at_ms`/`disappear_at_ms` — never `from_expr`/`to_expr` (scar a: those fields are dead code in the renderer). LIVE-bound states (S4's post-tally slider phase, S7) author the needle with **`magnitude_expr` + `direction_deg_expr`**, both plain-degree expressions (the renderer converts internally — confirmed at `parametric_renderer.ts:2121-2125`); e.g. for S7: `direction_deg_expr: "-60 + ((reading_final - 38) / (126 - 38)) * 120"`. **No expression in this concept ever calls `radians()`** — if any tick-mark placement needs trig, it is written literally `angle_deg * PI / 180` (scar b; `PI` is confirmed in `PM_safeEval`'s scope, `radians` is not).

**S4 slider/choreography resolution (scar a, `pcpl_slider_label_stale_under_choreography`) — RESOLUTION 1 CHOSEN (stamp fixed mass tags, then hand the slider over live):** the "Mass tags stamp under each tile in sequence (12 g … 32 g … 44 g)" beat uses the **static default value of `m_C` (12) stamped as literal staged labels** (`appear_at_ms` sequence, not `label_expr`) — `m_C`'s `variable_choreography` is **never authored**. The `m_C` slider row is either hidden or simply inert (unseized) during the stamp sequence, so `PM_sliderValues` never goes stale because nothing ever writes over it. Only *after* the ledger settles at 12+32=44 does the slider become the live, seizable control — at which point `label_expr` reads straight from `PM_sliderValues`, which has been correct the whole time. (Resolution 2 — hiding the slider row entirely during the choreographed portion — was NOT chosen because S4's motion never actually choreographs `m_C` at all; there is nothing to hide it from.)

| # | Window (ms) | Beat | What moves | Driven by | Live controls |
|---|---|---|---|---|---|
| **S1** (~16 s, `burn-down`) | 0–500 | home pose settle | reading holds 50.0 g, needle centered, delta-cue fades in | literal | none |
| | 500–2200 (CAUSE) | charcoal glows + shrinks (stage 1) | lump body only | literal | |
| | **2900–4200** (EFFECT, **0.7 s after CAUSE ends**) | smoke wisps rise off pan; readout ticks 50.0→49.2; needle sweeps down | `reading` display, needle `to` | literal (49.2) | |
| | 4200–4700 | hold | glow_focus on readout | — | |
| | 4700–6400 (CAUSE 2) | charcoal shrinks (stage 2) | lump body only | literal | |
| | **7100–8400** (EFFECT 2, **0.7 s gap**) | more smoke; readout ticks 49.2→48.1; needle sweeps further | `reading`, needle `to` | literal (48.1) | |
| | 8400–16000 | hold, narration closes | — | — | |
| **S2** (~18 s, `escape-vs-seal`, declared contrast pair of S1) | 0–800 | open panel already on screen from S1 (Rule: teach_concrete_before_abstract_compare — do NOT populate both at t=0) | — | | none |
| | 800–2500 (CAUSE, open) | identical burn replays | lump, smoke | literal (50.0→48.1) | |
| | **3200–4000** (EFFECT, 0.7 s gap) | open readout ticks down; needle sweeps | `reading` | −1.9 g total | |
| | 4000–4700 | **sealed twin flask fades in beside it** (staged entry, per bug-queue advisory) | comparison_panel right side | | |
| | 4700–6400 (CAUSE, sealed) | identical burn plays inside sealed flask | lump, glow, NO smoke exits (wisps rise then stop at the wall) | | |
| | 6400–7100 (EFFECT, sealed) | sealed readout **does not move**; needle **does not move** | `reading` = 82.0 constant | | |
| | 7100–9714 | ledger annotation: corrected M1 fix — "Mass never leaves the universe and never arrives from nowhere — seal the system and nothing is lost, nothing is gained." | | | |
| **S3** (~18 s, `atom-shuttle`) | 0–1500 | prerequisite line: "Every substance is built from atoms…" fades in (Pass-1 cliff patch) | | none | |
| | 1500–2200 | zoom-link band opens from the sealed flask (Rule 33 connector) | zoom lens graphic | | |
| | 2200–2800 (CAUSE) | 1 C circle + O–O pair sit in reactant tiles | | | |
| | **3500–5200** (EFFECT, 0.7 s gap) | C circle travels (`animated_path`) to dock between the two O circles → CO2 tile forms from the SAME 3 circles | atom positions | | |
| | 5200–6500 | atom-audit table fills live: C 1→1, O 2→2 | table cells | | |
| | 6500–7200 | equation surface `C(s) + O2(g) → CO2(g)` appears (ONLY now, after the shuttle) | formula_box | | |
| **S4** (~14 s, `mass-ledger tally`) | 0–1000 | LHS tile (C) stamps "12 g" | literal, default m_C | none (yet) | |
| | 1000–2000 | O2 tile stamps "32 g" | literal | | |
| | **2700–3700** (EFFECT, 0.7 s gap) | ledger bar sums LHS = 44; CO2 tile stamps "44 g" | literal | | |
| | 3700–4400 | needle centers at 0° (identity, any m_C) | | | |
| | 4400–14000 | **slider handed live** — `m_C` row appears/seizable; all three tags + ledger bar rescale via `label_expr` | live | `m_C` slider (1–24, step 1) | |
| **S5** (~18 s, `gain-is-transfer`) | 0–800 | apparatus continuity note: same flask, now iron nail + sealed O2 reservoir | | none | |
| | 800–2200 (CAUSE) | O atoms detach from air-side pool, one at a time | 2 O circles | | |
| | **2900–4600** (EFFECT, 0.7 s gap) | O atoms dock onto iron surface; solid readout ticks 10.0→10.6; gas readout ticks 5.0→4.4 | 3 readouts | | |
| | 4600–5300 | TOTAL readout stays 15.0 (never moves — single-focal on TOTAL per Rule 32e) | | | |
| | 5300–6000 | word equation "iron + oxygen → iron oxide (rust)" appears | formula surface | | |
| **S6** (~18 s, `count-times-mass build`) | 0–1800 | formula_box `m = Σ(nᵢ × mᵢ)` appears | | none | |
| | 1800–4000 | derivation_step line 1: reactants `1×12 + 2×16 = 44` builds | text | | |
| | **4700–6900** (EFFECT, 0.7 s gap) | derivation_step line 2: products `1×12 + 2×16 = 44` — audit-table numbers fly into the formula slots from S3's table | numbers | | |
| | 6900–7600 | conclusion line: `m_before = m_after` | | | |
| | 7600–8300 | scope note: "chemical reactions only" | annotation | | |
| **S7** (0 / open, `drag-sandbox`) | continuous | sliders drive `reading_initial`/`reading_final`/`m_O2`/`m_CO2`/`atoms_scale_label` live; sealed/open toggle switches which formula pair is shown; needle sweeps via `magnitude_expr`+`direction_deg_expr` | live numbers only (GAP 2 — no glyph re-jump on drag, authored to it) | `m_C` slider + `vessel_sealed` toggle (ALL, per Rule 31 explore-last) | |

All seven states: cause leads effect by the same ~0.7 s beat (Rule 32a); only the taught variable's motion changes per state (Rule 32b); apparatus never teleports — same balance/flask position throughout (Rule 32d).

---

## 5. Drill-down phrases

**Cluster `where_did_the_ash_mass_go` (S2):**
1. "if wood turns to ash why does the ash weigh so much less"
2. "where did all that missing wood mass actually go"
3. "the fire ate the wood so the mass got destroyed right"
4. "my teacher said mass is conserved but the ash pile is tiny compared to the log"
5. "does burning literally destroy some of the atoms"

**Cluster `candle_losing_weight` (S2):**
1. "why does a candle get lighter while its burning"
2. "the wax disappears when it melts and burns so wheres that mass"
3. "if I could weigh a candle before and after would the number really match"
4. "is the wax turning into pure energy like Einstein's equation"
5. "the candle looks smaller so isnt some of its mass just gone"

**Cluster `open_vs_closed_system` (S2):**
1. "whats the actual difference between an open and a closed system for this"
2. "if I seal a jar does that change the chemistry or just what I can weigh"
3. "why does sealing the container matter if the same reaction happens either way"
4. "so mass is only conserved if nothing can escape"
5. "in real life is any reaction actually 100% sealed"

**Cluster `do_atoms_ever_get_destroyed` (S3):**
1. "can an atom just vanish during a chemical reaction"
2. "is a carbon atom in CO2 the exact same atom that was in the coal"
3. "do atoms ever get destroyed in a nuclear reaction differently than a chemical one"
4. "why cant a reaction create a brand new atom out of nothing"
5. "if bonds break doesnt that mean the atom breaks too"

**Cluster `counting_atoms_both_sides` (S3):**
1. "how do you actually count atoms on both sides of an equation"
2. "why does the number of atoms have to match on both sides"
3. "im confused how one carbon and two oxygens becomes CO2 with the numbers matching"
4. "do you count molecules or individual atoms when checking a reaction"
5. "whats the point of counting atoms if I already trust the equation is right"

**Cluster `why_gas_has_mass` (S3):**
1. "how can a gas you cant even see actually have mass"
2. "air feels weightless so why does oxygen gas count in the mass total"
3. "does CO2 really weigh something even though its invisible"
4. "if I cant hold the gas in my hand how do we know its mass"
5. "why does the smoke from the fire still count toward the total mass"

---

## 6. Chemical-validity constraints

```json
"constraints": [
  "atoms of each element: LHS count = RHS count in every displayed equation (C 1→1, O 2→2 for the symbol form)",
  "total charge: LHS = RHS (= 0) in every displayed equation — no ions anywhere in this concept",
  "no atom ever fades in or out on screen — atoms only MOVE between tiles (archetype-O signature); a departing gas atom must be shown leaving the frame, never disappearing in place",
  "m_reactants ≡ m_CO2 identically, for every value of m_C — the S4 balance needle centers at 0° regardless of slider position",
  "open-system reading_final = tare exactly (all reacted mass has left as escaped gas); sealed reading_initial = sealed reading_final = tare + m_C + m_O2 at every instant, not just at the two endpoints",
  "no stoichiometric coefficient ever appears on screen — S3/S4/S7's C(s)+O2(g)→CO2(g) is coefficient-free by construction (1:1:1); S5's word equation never becomes a symbol equation",
  "no oxidation-number label or redox electron-transfer ledger appears anywhere — both displayed reactions are technically redox but that analysis is out of scope, deferred to the redox chapter",
  "m_C slider step is fixed at 1 (integer grams) — the displayed 1-dp closure of m_C + m_O2 = m_CO2 depends on this; a fractional step will produce a visible rounding mismatch"
]
```

---

## Self-review

- Every quantity named in §3/§4 traces to a named `variables`/`formulas`/`computed_outputs` entry in §2, unit-tagged — no orphan numbers.
- Ledger complete for both reactions (§1): atom-count table + charge totals for each; S5's drawn-particle count and mass numbers recomputed from real atomic masses and verified to close (7:3 Fe:O by mass, teaching-rounded).
- Every state (§4) declares its archetype-O beat, a t-window per beat, cause-before-effect with the ~0.7 s gap (Rule 32a), and controls matching the skeleton's table exactly; no two states share a beat except the declared S1/S2 contrast pair; no static state.
- All four `engine_bug_queue` OPEN scars addressed by name and resolved concretely in §2/§4 (needle uses literal `from`/`to` or `magnitude_expr`+`direction_deg_expr`, never `from_expr`/`to_expr`; no `radians()` anywhere; `m_C` is never choreographed while its slider is visible in S4; every derived-quantity name is declared once in §2 and reused verbatim).
- Word budgets respected per the skeleton's per-state ranges (25–55 EN words); S7 = 0/open.
- Notation ladder: no logs/calculus/Σ-notation below the advanced ring — Σnᵢmᵢ confined to S6 exactly as DoD (i) requires; nothing here needed a founder flag.
- Particle-count scale factor declared for S5 ("2 atoms shown — representative…") and S7 (`atoms_scale_label`), per chemistry.md §5.
- 30 drill-down phrases (5 × 6 clusters), real student voice, no textbook phrasing, no Hinglish.
- Numerical sanity check **run**, not eyeballed: default m_C=12 traced through every formula in §2 by hand (§3), including the m_C=1..24 integer sweep for rounding-consistency (§3).
- Two skeleton corrections made explicit at the top (M1 symmetric phrasing; DoD(j) reading-formula physics), with full worked justification, not silently patched.
- Source check line: "Consulted NCERT Chemistry chapter index (Class 11, Ch.1 §1.3) to confirm scope. No teaching method, no example problem, no figure imported. NCERT Exemplar consulted for misconception beliefs only (M1-M3), no problem text imported."
