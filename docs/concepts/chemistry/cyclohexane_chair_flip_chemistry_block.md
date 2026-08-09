# Chemistry block — `cyclohexane_chair_flip`

**Author:** chemistry-author · 2026-08-09 · worktree `Viditra-organic-o0`
**Input:** `docs/concepts/chemistry/cyclohexane_chair_flip_skeleton.md` (616 lines, read in full)
**Status:** Phase-0 **0b** — `scenario_type: "organic_structure"` does not exist. Nothing below is marked blocked or downgraded to a live archetype; this block, with the skeleton, is the engine specification. Every motion targets the `organic_structure` contract of `ORGANIC_PHASE0_CONFORMATION.md` §contract as amended by the skeleton's §9 and by §C-3 / §H-10 below.

**Numerical work is RUN, not eyeballed.** Every geometric claim below was re-derived from coordinates in an independent offline solve (chair closed-form; boat closed-form; twist-boat and boat by constrained relaxation; Cremer–Pople decomposition; Boltzmann and Eyring in closed form). Where my number differs from the skeleton's I say so and give the derivation.

---

## §0 — Engine bug queue consultation

Queries run 2026-08-09 against `engine_bug_queue` via `src/scripts/query_engine_bug_queue.ts` (worktree has no `.env.local`; ran with `--env-file` pointed at the main repo's).

| Query | Rows |
|---|---|
| `--owner alex:chemistry_author` | 11 |
| `--owner alex:physics_author` | 15 |
| `--owner alex:json_author` | 144 |
| `--owner peter_parker:runtime_generation` (variable-class) | scanned |

### Rows that BIND this block, and how each is discharged

| `bug_class` | Owner | Discharge |
|---|---|---|
| `prose_in_a_variable_derived_field_deletes_its_painted_value_from_scope_and_blocks_every_formula_referencing_it` **(CRITICAL/OPEN)** | physics_author | `E_kJ_per_mol` is a **published-table lookup**, not computable from declared variables. It is declared **INDEPENDENT with no `derived` field at all** (§C). Prose about it lives here, never in the JSON. Every other `computed_outputs` expression is substitutable and was evaluated numerically (§C-4) |
| `computed_output_name_encodes_a_symbol_no_instrument_paints_so_every_reading_is_harvested_then_discarded` | physics_author | Every key was run through the live `splitNameUnit` regex (`deriveAssertions.ts:45`) and matched against the caption it claims. `E_kJ_per_mol`→`E`, `equatorial_pct`→`equatorial`, `axial_pct`→`axial`, `T_K`→`T`, `barrier_kJ_per_mol`→`barrier`. **Two declared exceptions** with reasons in §C-5 |
| `physics_config_constraint_block_describes_a_transform_a_later_engine_change_made_dynamic` | physics_author | Every constraint in §G states whether its number is FIXED or DERIVED |
| `narration_quotes_a_point_value_of_a_noisy_instrument` · `narration_claims_a_net_average_the_visible_transient_contradicts` | chemistry_author | No stochastic instrument exists here (closed-form in t, zero noise). Every narrated numeral is byte-identical to a printed instrument value — checked line by line in §E |
| `gas_box_state4_asserts_unchanged_speed_with_no_instrument` | chemistry_author | Drove three "unchanged" claims to an instrument. **One failure found:** S5's "closer than two hydrogens fit" had no rendered 240 pm reference — engine ask **N-17** (§H-10) |
| `real_world_anchor_promises_a_lever_the_sim_does_not_have` | chemistry_author | Anchor rewritten against the control surface: it names only the ring shape and the equatorial arrangement, both rendered. Nothing about glucose metabolism, digestion or starch is promised |
| `the_most_likely_followup_question_was_undemonstrable_at_the_authored_range` | chemistry_author | The S8 temperature range is chosen by measuring the two questions a teacher asks first (cool it / heat it) — §C-2 |
| `authored_annotation_asserts_a_value_its_own_state_control_can_falsify` **(CRITICAL)** | json_author | S8 is the only state with a control. Its formula surface is **rewritten to a symbolic relation** so no numeral on it can be falsified by the T slider (§D-8, §I-3). Bars and HUD carry the live values |
| `narration_outruns_choreography` · `guided_state_overruns_pacing_target` | json_author | Every state's narration duration computed at 2.75 words·s⁻¹ and compared with its choreography end. **Six of eight states fail against the skeleton's §5 durations** — the largest disagreement in this block (§D-0, §I-1) |
| `explore_state_surfaces_non_core_ring_symbol` · `core_ring_state_shows_value_whose_only_derivation_is_higher_ring` | json_author | Both cuts run literally over every symbol and every unit-bearing value in §E-9 |
| `field3d_counted_element_occluded_along_view_axis` | json_author | Every counted thing (six axial, six equatorial, "two hydrogens", "two contact lines") is listed in §G-2 as a countability assertion |
| `default_variables_only_first_var_merged` | runtime_generation | All declared variables carry `default`; §C flags the merge requirement |
| `pcpl_radians_helper_missing` | physics_author | N/A — field_3d dialect. No `radians(` appears in any expression here; all angles are constants in degrees, never trig arguments |

**Exception declared, FLAGged to `quality_auditor`:** `concept_ships_zero_narration_glow_bindings` (MAJOR/OPEN) requires every `tts_sentences` entry to carry a glow naming an on-canvas element. §D gives a per-sentence focal for every sentence in all eight guided states, but the `organic_structure` contract has **no glow-target vocabulary** — no engine field exists for json_author to bind them to. This is engine ask **N-18** (§H-10). Until it lands the ratio is 0/N by engine limitation, not by authoring omission.

---

## §A — The published-value ledger (verification, with a named source per value)

**Every energy here is a literature value the engine PUBLISHES and never computes** (`ORGANIC_PHASE0_CONFORMATION.md` decision 1). A student is examined on these. This ledger is the evidence.

### A-1 · Conformational energies (kJ·mol⁻¹, chair = 0)

| Conformation | Value | kcal·mol⁻¹ cross-check | Source | Verdict |
|---|---|---|---|---|
| **chair** | **0** | 0 | datum by definition | ✔ |
| **half-chair** (the transition state) | **+45** | 10.76 | Anet & Bourn, *JACS* **89** (1967) 760 — ¹H DNMR of cyclohexane-d₁₁, barrier 10.8 kcal·mol⁻¹. Reproduced as the barrier in McMurry, *Organic Chemistry* (45 kJ·mol⁻¹ / 10.8 kcal·mol⁻¹) and Vollhardt & Schore | ✔ **CONFIRMED** |
| **twist-boat** | **+23** | 5.50 | Squillacote, Sheridan, Chapman & Anet, *JACS* **97** (1975) 3244 — twist-boat trapped at 77 K, 5.5 kcal·mol⁻¹ above chair. Eliel & Wilen, *Stereochemistry of Organic Compounds* (1994) ch. 11 | ✔ **CONFIRMED** |
| **boat** (the second transition state) | **+29** | 6.93 | boat lies ≈1.4 kcal·mol⁻¹ above twist-boat (Eliel & Wilen ch. 11) → 6.9 kcal·mol⁻¹ ≈ 29 kJ·mol⁻¹. McMurry quotes 29 kJ·mol⁻¹; Vollhardt 30 kJ·mol⁻¹ | ✔ **CONFIRMED** (literature band 29–30; keep 29) |

**The kcal cross-check is the strongest verification available and it passes cleanly.** Each kJ value maps onto a round, independently-famous kcal number: 10.76 ≈ 10.8, 5.50 = 5.5, 6.93 ≈ 6.9. A transcription error would not survive that.

**One correction to the profile shape (the skeleton's N-16 already half-caught it).** The path has **seven** stationary points, not four: chair 0 → **half-chair +45** → **twist-boat +23** → **boat +29** → **twist-boat′ +23** → **half-chair′ +45** → chair′ 0. Verified independently: the two twist-boats are genuinely distinct structures on the pseudorotation itinerary (Cremer–Pople φ₂ = 30° and 90°, separated by the boat at φ₂ = 60°) — §A-5.

### A-2 · Methyl A-value and populations

| Quantity | Value | Source | Verdict |
|---|---|---|---|
| **A(CH₃)** | **7.3 kJ·mol⁻¹** (1.74 kcal·mol⁻¹) | Eliel & Wilen, A-value table: A(CH₃) = 1.74 kcal·mol⁻¹ | ✔ **CONFIRMED** |
| eq : ax at 298 K | **95.0 : 5.0** | computed: *K* = exp(7300 / (8.3145 × 298.15)) = 19.007 → 95.00 % : 5.00 % | ✔ **CONFIRMED**, exact to 2 d.p. |
| back-check vs butane gauche | 2 × 3.8 = 7.6 vs 7.3 | 4.1 % apart — consistent with the drawn geometry (an axial methyl has exactly two gauche-butane units along C1–C2 and C1–C6; an equatorial methyl has none) | ✔ |

**Note for the record, not for the canvas.** McMurry quotes the same preference as **7.6 kJ·mol⁻¹** (1.8 kcal·mol⁻¹) and also reports 95 : 5 — because 7.6 gives 95.6 : 4.4, which rounds identically. Both books agree on the ratio; **7.3 is the primary literature A-value and gives 95.00 : 5.00 exactly**, so keep 7.3. The A-value that yields exactly 95.00 : 5.00 at 298.15 K is 7.2991 kJ·mol⁻¹.

### A-3 · Geometry

| Quantity | Value | Source / derivation | Verdict |
|---|---|---|---|
| tetrahedral angle | **109.47°** | arccos(−1/3) = 109.4712° | ✔ exact |
| C–C bond length | **154 pm** | standard sp³–sp³. Gas electron diffraction on cyclohexane: rg(C–C) = **153.6 pm** (Bastiansen, Fernholt, Seip, Kambara & Kuchitsu, *J. Mol. Struct.* **18** (1973) 163) | ✔ 154 is the textbook rounding of 153.6 |
| C–H bond length | **109 pm** | standard sp³ C–H (1.09 Å). The same ED study reports rg(C–H) = 112 pm — an ra/rg distance, not comparable to the 1.09 Å equilibrium value | ✔ **but see §I-6**: never render 109 pm as a *measured* cyclohexane value beside the 153.6/111.4/54.9 set |
| chair ring C–C–C angle | **111.4°** | same ED study, ∠CCC = 111.4(2)° | ✔ **CONFIRMED** (the brief's "111°" is a coarser rounding; publish 111.4°) |
| chair ring torsion | **±54.94°** | same ED study, 54.9(2)°. **Re-derived**: closing the ring at C–C 154 pm and ∠CCC 111.4° gives ring radius 1.4690 Å, pucker 0.4622 Å and torsions exactly ±54.94° | ✔ **CONFIRMED** — the skeleton's own solve reproduced |
| planar ring C–C–C | **120.00°** | geometry of a regular hexagon | ✔ |
| planar ring torsions | **0.00°, all six** | ✔ but see §I-2 — **not renderable in S1**, whose hydrogens are hidden |
| 1,3-diaxial H···H (chair) | **267.8 pm** | re-derived from coordinates | ✔ **CONFIRMED**. Note it is *clear* of the 240 pm H+H contact by 27.8 pm — the unsubstituted chair has no H···H violation |

### A-4 · Contacts, and the reference distances to quote against

van der Waals radii: **H 1.20 Å, C 1.70 Å** — Bondi, *J. Phys. Chem.* **68** (1964) 441. Sums: **H+H = 240 pm**, **C+H = 290 pm**. Both of the skeleton's assumed references are **CONFIRMED**. (Rowland & Taylor, *J. Phys. Chem.* **100** (1996) 7384 refine H to 1.09–1.10 Å from crystal data; Bondi remains the teaching standard and is the self-consistent choice alongside C = 1.70 Å.)

| Contact (metric: **atom-centre to atom-centre**) | Value | Verdict |
|---|---|---|
| axial CH₃ carbon ↔ axial H on C3 **and** on C5 | **274.3 pm** each | ✔ **CONFIRMED** — inside C+H (290) by 15.7 pm, twice |
| the same two named contacts after the flip (equatorial CH₃) | **424.6 pm** each | ✔ **CONFIRMED** — clear by 134.6 pm. Ratio 1.55× |
| **boat flagpole H···H** | **183 pm** | **CONFIRMED — with a hard parameterisation condition, see A-6** |

### A-5 · N-9 — the contact metric, and a correction that makes the trap worse

The architect measured that the **equatorial** methyl's nearest ring H is **270 pm**, closer than the **axial** methyl's 1,3-diaxial contact at 274 pm, and concluded that a generic "nearest contact" readout would show the equatorial methyl as the *more crowded* one. **The measurement is right and the conclusion is right, but the situation is worse than stated.** Full sorted contact list, re-derived (methyl-carbon centre → ring-H centre; the geminal H on C1 excluded as a 1,1 relationship fixed by the H–C–H angle, not a steric contact):

```
AXIAL methyl                              EQUATORIAL methyl
  H_eq(C2)   270.0 pm   vicinal             H_ax(C2)   270.0 pm   vicinal
  H_eq(C6)   270.0 pm   vicinal             H_ax(C6)   270.0 pm   vicinal
  H_ax(C3)   274.3 pm   1,3-DIAXIAL         H_eq(C2)   276.3 pm   vicinal
  H_ax(C5)   274.3 pm   1,3-DIAXIAL         H_eq(C6)   276.3 pm   vicinal
  H_ax(C2)   345.9 pm                       H_ax(C3)   424.6 pm   1,3-diaxial partner
  H_ax(C6)   345.9 pm                       H_ax(C5)   424.6 pm   1,3-diaxial partner
```

**Both conformers' nearest ring-H contact is 270.0 pm — the same number to 0.001 pm.** A generic nearest-contact readout would therefore print **270 pm before the flip and 270 pm after it**: not merely inverted, but a *null* readout on the state whose entire claim is that the flip changes the crowding. N-9 is upgraded from "would contradict the narration" to "**would silently report that nothing happened**".

**The physical reasoning, and the metric the engine must name.**

1. The 270 pm contacts are **vicinal** (1,2): methyl on C1 against a hydrogen on the adjacent C2 or C6. Every alkane has them; they are the ordinary gauche-type contacts of a staggered C–C bond, they exist in *both* conformers, and they **cancel exactly** in the comparison. They carry no information about which conformer is preferred.
2. The differentiating interaction is the **1,3-diaxial** contact — a *syn-axial* approach in which the methyl and the ring hydrogen both point the same way along the ring axis. It cannot be relieved by rotation about the C–CH₃ bond, it is present only when the methyl is axial, and there are exactly **two** of them (C3 and C5). Those two are precisely the two gauche-butane units whose sum, 2 × 3.8 = 7.6 kJ·mol⁻¹, reproduces the published A-value of 7.3.
3. Distance alone cannot tell (1) from (2) — 270 and 274 pm are indistinguishable as numbers. Only the **atom pair** distinguishes them. Therefore the instrument must be defined by named atoms, never by a search.

> **METRIC OF RECORD, to be written into the contract:** the S7 readout is the distance from the **methyl carbon centre** to the **axial ring-hydrogen centres on C3 and C5**, by explicit atom name, before and after the flip. Two lines before (274 pm each), the same two named pairs after (425 pm each). `measure.kind: 'distance'` accepts only two named atom ids. **No "nearest", "closest" or "minimum" contact mode may exist in the contract**, at any state, for any concept — if it exists it will eventually be authored.
>
> **Why the methyl CARBON and not its hydrogens.** The actual closest approach is H(methyl)···H(ring), but the methyl hydrogens' positions depend on the C–CH₃ torsion, so that readout would wobble as the methyl rotates. The methyl carbon is rotamer-independent. **Consequence, and an engine requirement:** the methyl rotamer must be **fixed staggered** with respect to the ring bonds at every u, so nothing about the drawn group is ambiguous.

**A companion honesty constraint.** Because the vicinal contact (270 pm) is *also* inside the C+H sum of 290 pm, the 290 pm reference is a **scale bar for the two named lines only**. Neither narration nor canvas may claim the equatorial methyl is "clear of close contacts" or "has no contacts inside 290 pm" — that is false. The permitted claim is exactly the one S7 makes: *those two named hydrogens* move from 274 pm to 425 pm.

### A-6 · The boat flagpole distance — CONFIRMED, and the condition attached to it

The architect did not compute this one. I did, three ways.

| Boat geometry | ∠C–C–C | Flagpole H···H |
|---|---|---|
| idealised all-tetrahedral, C–C 154 pm | 109.47° | **184.0 pm** |
| idealised all-tetrahedral, C–C **153.6 pm** (the ED value) | 109.47° | **183.3 pm** |
| **same parameterisation as the chair** (∠CCC 111.4°, ∠HCH 107.5°) | 111.4° | **215.9 pm** |

**≈183 pm is CONFIRMED as the literature value, and I have reproduced it to 0.3 pm** — it is the idealised all-tetrahedral boat at the experimental C–C length. Sources: McMurry, *Organic Chemistry* ("the flagpole hydrogens approach to within 183 pm"); Vollhardt & Schore and Solomons quote 1.83 Å. The reference to quote against is **H+H = 240 pm (Bondi)** — the flagpole pair is **57 pm inside** it.

**But 183 pm is parameterisation-dependent by 33 pm**, which is a rendering hazard the skeleton's own scar (`skeleton_geometry_block_quotes_rounded_values_the_engine_will_print_differently`) exists to catch. If the engine builds every waypoint at the chair's experimental parameterisation, its boat measures **216 pm** and a `183 pm` label on that line is a rendered falsehood.

> **DECISION (mine, and it is a chemistry decision, not a taste call): publish 183 pm, and require the engine's boat waypoint to BE the geometry that has it.** Grounds: (i) 183 pm is the number in every standard text and on every examination; (ii) it is reproducible — I reproduced it independently; (iii) **the boat is a transition state and has never been measured**, so there is no experimental geometry with a better claim than the idealised one; (iv) 216 pm is a number no source states and would put the sim in conflict with the student's own textbook; (v) the qualitative claim (inside the 240 pm contact distance) is true under both, so the *teaching* is robust either way.
>
> **Concretely:** the chair knots use ∠CCC 111.4° (measured); the boat knot uses ∠CCC 109.47° (idealised). This is not an inconsistency — the ring angle genuinely varies along the interconversion path, and **no state in this concept claims the ring angle is constant**. S1 and S2 measure the chair; S5 measures the boat. The two parameterisations must be **declared in the molecule table**, not discovered.
>
> **Gate assertion:** `| measured flagpole length in the rendered boat − printed value | ≤ 2 pm`. Same assertion for every drawn distance line. Recorded as constraint §G-6.

### A-7 · The waypoint torsion signatures (gate assertions for N-2)

Re-derived by constrained relaxation to C–C 154.00 pm and ∠CCC 111.40° (all residuals 0.000 pm / 0.00°):

| Waypoint | Cremer–Pople (Q Å, θ, φ₂) | Ring torsions |
|---|---|---|
| chair | 0.566, 0°, — | `+54.9 −54.9 +54.9 −54.9 +54.9 −54.9` |
| twist-boat | 0.767, 90°, 30° | `+30.6 +30.6 −64.4 +30.6 +30.6 −64.4` |
| **boat** | 0.764, 90°, 60° | `+54.9 **0.0** −54.9 +54.9 **0.0** −54.9` |
| twist-boat′ | 0.767, 90°, 90° | `+64.4 −30.6 −30.6 +64.4 −30.6 −30.6` |
| chair′ | 0.566, 180°, — | `−54.9 +54.9 −54.9 +54.9 −54.9 +54.9` |

Two results worth keeping:

- **The boat has exactly two ring torsions of 0.0°** — two fully eclipsed C–C bonds. **The twist-boat has none below 30.6°.** That is the chemically definitional difference between them and it is the right gate assertion (§G-4), far more robust than comparing a torsion list to literature.
- **The half-chair could not be relaxed onto the "all bonds 154 pm, all angles 111.4°" family — it slid back to the chair.** That is correct and worth stating: the half-chair is a transition state and *cannot* keep near-tetrahedral angles. Its angle strain is part of why it is the highest point. Its gate assertion must therefore be its definition, not a torsion list: **exactly four contiguous ring carbons coplanar** (one ring torsion within 2° of 0 with the four-atom best-plane RMS < 0.02 Å), the other two carbons on opposite sides.

### A-8 · Flip rate — DECISION on open question 3

Eyring at 298.15 K, k_BT/h = 6.212 × 10¹² s⁻¹:

| ΔG‡ | k | 1/k (mean chair lifetime) | ln2/k | ln2/2k (relaxation half-life) |
|---|---|---|---|---|
| 43 kJ·mol⁻¹ | 1.8 × 10⁵ s⁻¹ | 5.5 µs | 3.8 µs | 1.9 µs |
| **45 kJ·mol⁻¹** | **8.1 × 10⁴ s⁻¹** | 12.3 µs | 8.5 µs | 4.3 µs |
| 46 kJ·mol⁻¹ | 5.4 × 10⁴ s⁻¹ | 18.4 µs | 12.8 µs | 6.4 µs |

The architect's arithmetic is exactly reproduced. **My decision:**

> **Publish the ORDER OF MAGNITUDE only — "about a hundred thousand times a second" — in narration, and nowhere else. Do NOT publish 8.1 × 10⁴ s⁻¹. Do NOT publish any half-life.**
>
> 1. **The order of magnitude is not a derived number at all — it is a literature statement.** McMurry and Clayden both state that the ring flips roughly 10⁵ times per second at room temperature. Publishing it therefore needs no distinguishing stamp; it sits beside the other literature values as one of them.
> 2. **8.1 × 10⁴ s⁻¹ is not robust and would need a stamp it cannot carry.** Across the literature barrier band (43–45 kJ·mol⁻¹) the rate spans 0.8–1.8 × 10⁵ s⁻¹, a factor of 2.2. Every value in that band is "about a hundred thousand"; none of them is "8.1 × 10⁴". A further slop sits underneath: the 45 kJ·mol⁻¹ figure is a ΔG‡ measured near 213 K, and carrying it to 298 K assumes ΔG‡ is temperature-independent.
> 3. **The half-life is ambiguous and must not be rendered in any form.** For a degenerate two-state exchange, three different quantities have equal claim on the name: the mean chair lifetime 1/k = 12.3 µs, ln2/k = 8.5 µs, and the relaxation half-life ln2/(2k) = 4.3 µs. The architect's 8.5 µs is the middle of the three and is not a standard definition of either. Publishing any of them invites an examination answer that is wrong under the marker's definition.
> 4. **Placement:** narration only, in S6, as the final clause. **Not** on the formula surface, **not** in the HUD, **not** in a `static_readout`. There is no rendered numeral to be inconsistent with, so no stamp is required.

### A-9 · Sanity check RUN on one state's formulas (S8)

```
A = 7.3 kJ·mol⁻¹, R = 8.314 J·mol⁻¹·K⁻¹, T = 298 K
K = exp(7300 / (8.314 × 298)) = exp(2.94647) = 19.0365
equatorial % = 100 × 19.0365 / 20.0365 = 95.01  → HUD prints 95 %
axial %      = 100 /        20.0365 =  4.99  → HUD prints  5 %
```
Matches the narrated "95 to 5". ✔ (Note the ×1000 kJ→J factor — §G-7.)

---

## §B — The conservation ledger (the chemistry variant, and it carries the teaching claim)

There is no reaction here, so the balanced-equation ledger takes an unusual form. **It is not a formality: it is the state-by-state proof of exactly the misconception the skeleton's §4 M3 names — "a flipped chair is a different compound".**

### B-1 · The identity ledger

| Ledger row | u = 0 (chair) | every intermediate u | u = 1 (chair′) | Conserved? |
|---|---|---|---|---|
| Molecular formula | **C₆H₁₂** | **C₆H₁₂** | **C₆H₁₂** | ✔ |
| Carbon atoms | 6 | 6 | 6 | ✔ |
| Hydrogen atoms | 12 | 12 | 12 | ✔ |
| Total charge | 0 | 0 | 0 | ✔ |
| Bonds broken | — | **0** | **0** | ✔ |
| Bonds formed | — | **0** | **0** | ✔ |
| C–C ring bonds drawn | 6 | 6 | 6 | ✔ |
| C–H bonds drawn | 12 | 12 | 12 | ✔ |
| Valence at every C | 4 | 4 | 4 | ✔ |
| **Connectivity** (the adjacency list) | C1–C2–C3–C4–C5–C6–C1; two H on each C | **identical** | **identical** | ✔ |
| Stereochemistry | none (no stereocentre) | none | none | ✔ |
| State symbol | (l) — cyclohexane, mp 279.6 K, bp 353.9 K | (l) | (l) | ✔ |

**What the ledger proves.** Formula, atom count, charge, valence and — the load-bearing row — **the adjacency list are byte-identical before and after**. Two structures with identical connectivity and no stereochemical difference are, by definition, **the same compound**. The chair flip is a change of *shape only*: a conformational change, reached by rotation about σ bonds, with no bond event anywhere. The two chairs of cyclohexane are not isomers, not tautomers, and not separable.

**This ledger is what S4 renders**: the six ring bonds drawn continuously through the whole sweep, the `C₆H₁₂` surface unchanged from first frame to last, the traced bond keeping its identity, and the same twelve hydrogens on the same six carbons at the end.

**The gate must assert it, not the narration** (skeleton DoD (c)): at 20 sampled u values, assert `C = 6`, `H = 12`, `bonds = 18`, `valence(Cₖ) = 4 ∀k`, and `adjacency(u) == adjacency(0)`.

### B-2 · The substituted ledger (S7, S8)

| | before | after |
|---|---|---|
| Formula | **C₇H₁₄** (methylcyclohexane) | **C₇H₁₄** |
| Substitution | exactly one ring H replaced by CH₃ | unchanged |
| Charge | 0 → 0 | ✔ |
| Bonds broken / formed **during the flip** | 0 / 0 | ✔ |
| Connectivity | identical before and after the flip | ✔ |
| State symbol | (l) — methylcyclohexane, mp 146.6 K, bp 374 K | (l) |

**The formula surface must change to `C₇H₁₄` at S7 and stay C₇H₁₄ at S8.** The skeleton's DoD (c) requires this; the DoD (b) symbol table omits it. Engine ask covered by the existing `show_formula` field; §I-4.

**Both axial and equatorial methylcyclohexane are C₇H₁₄ with identical connectivity** — the two chairs are conformers of one compound, and the 95 : 5 in S8 is a population split of **one substance**, never a mixture of two. That distinction is the single thing q7-class questions punish. It is a rendering constraint (§G-9): the S8 canvas must never label the two laned chairs as two compounds, two species or two products.

### B-3 · What conserves *and what is exchanged*

The one thing that is **not** conserved is the only thing the concept teaches:

| | u = 0 | u = 1 |
|---|---|---|
| axial C–H bonds | 6 | 6 |
| equatorial C–H bonds | 6 | 6 |
| **the tag on any individual bond** | axial | **equatorial** |

The counts are a symmetry identity and carry no information (the skeleton's own `measured_equality_is_an_identity_at_the_authored_home_pose` disposition). **The tag SET is exactly inverted, bond by bond** — that is the assertion, and it is why S4's archetype must be follow-one-bond and not count-the-families.

---

## §C — `engine_config`

Lands in the concept JSON's `physics_engine_config` field (legacy name, subject-neutral shape).

### C-1 · The block

```json
{
  "variables": {
    "u":                  { "name": "flip progress",            "unit": "",         "min": 0,   "max": 1,   "default": 0 },
    "pucker_amplitude":   { "name": "ring pucker amplitude",    "unit": "",         "min": 0,   "max": 1,   "default": 1 },
    "T":                  { "name": "temperature",              "unit": "K",        "min": 250, "max": 400, "default": 298 },

    "A_Me_kJ":            { "name": "methyl A-value",           "unit": "kJ/mol",   "constant": 7.3 },
    "R_gas":              { "name": "gas constant",             "unit": "J/(mol K)","constant": 8.314 },

    "E_chair_kJ":         { "name": "chair energy",             "unit": "kJ/mol",   "constant": 0 },
    "E_half_chair_kJ":    { "name": "half-chair energy",        "unit": "kJ/mol",   "constant": 45 },
    "E_twist_boat_kJ":    { "name": "twist-boat energy",        "unit": "kJ/mol",   "constant": 23 },
    "E_boat_kJ":          { "name": "boat energy",              "unit": "kJ/mol",   "constant": 29 },

    "r_CC_pm":            { "name": "C-C bond length",          "unit": "pm",       "constant": 154 },
    "r_CH_pm":            { "name": "C-H bond length",          "unit": "pm",       "constant": 109 },
    "ang_tet_deg":        { "name": "tetrahedral angle",        "unit": "deg",      "constant": 109.47 },
    "ang_ccc_chair_deg":  { "name": "chair ring angle",         "unit": "deg",      "constant": 111.4 },
    "ang_ccc_planar_deg": { "name": "planar ring angle",        "unit": "deg",      "constant": 120.0 },
    "ang_cch_deg":        { "name": "C-C-H angle",              "unit": "deg",      "constant": 109.5 },
    "tau_chair_deg":      { "name": "chair ring torsion",       "unit": "deg",      "constant": 54.9 },

    "d_13diax_ax_pm":     { "name": "axial methyl 1,3-diaxial contact",      "unit": "pm", "constant": 274 },
    "d_13diax_eq_pm":     { "name": "equatorial methyl, same two contacts",  "unit": "pm", "constant": 425 },
    "d_flagpole_pm":      { "name": "boat flagpole H...H",                   "unit": "pm", "constant": 183 },
    "vdw_CH_pm":          { "name": "van der Waals contact C+H",             "unit": "pm", "constant": 290 },
    "vdw_HH_pm":          { "name": "van der Waals contact H+H",             "unit": "pm", "constant": 240 }
  },

  "formulas": {
    "K_eq_over_ax": "exp(A_Me_kJ * 1000 / (R_gas * T))",
    "frac_eq_pct":  "100 * exp(A_Me_kJ * 1000 / (R_gas * T)) / (1 + exp(A_Me_kJ * 1000 / (R_gas * T)))",
    "frac_ax_pct":  "100 / (1 + exp(A_Me_kJ * 1000 / (R_gas * T)))"
  },

  "computed_outputs": {
    "equatorial_pct": "100 * exp(A_Me_kJ * 1000 / (R_gas * T)) / (1 + exp(A_Me_kJ * 1000 / (R_gas * T)))",
    "axial_pct":      "100 / (1 + exp(A_Me_kJ * 1000 / (R_gas * T)))",
    "T_K":            "T"
  },

  "constraints": [
    "C6H12 at every u: 6 carbons, 12 hydrogens and 18 bonds are drawn in every frame of every state; no atom and no bond appears or disappears",
    "connectivity is FIXED and identical at u = 0, at u = 1 and at every u between; every ring carbon shows exactly four bonds",
    "the axial/equatorial tag set at u = 1 is the exact inverse of the set at u = 0, bond by bond; no a/e tag is rendered at any non-chair pose",
    "every energy, A-value and contact distance rendered is a published-table entry with a source stamp; the engine computes no steric energy at any u",
    "a drawn measurement line's length, measured in the rendered coordinates, equals its printed value to within 2 pm; a drawn arc equals its printed value to within 0.5 deg",
    "the S7 contact readout is between two NAMED atoms; no nearest/closest/minimum contact mode exists in the contract"
  ]
}
```

### C-2 · The temperature range — a decision, measured, not inherited

`T`: **min 250 K, max 400 K, default 298 K, step 5 K.** Measured populations across the authored range:

| T (K) | 250 | 275 | **298** | 325 | 350 | 375 | 400 |
|---|---|---|---|---|---|---|---|
| equatorial % | 97.1 | 96.1 | **95.0** | 93.7 | 92.5 | 91.2 | 90.0 |
| axial % | 2.9 | 3.9 | **5.0** | 6.3 | 7.5 | 8.8 | 10.0 |

**Why these limits** (discharging `the_most_likely_followup_question_was_undemonstrable_at_the_authored_range`):

1. **The two questions a teacher asks first are "cool it" and "heat it".** Both are visible at the limits, not marginal: cooling to 250 K moves axial 5.0 → 2.9 % (a 42 % reduction in the smaller bar); heating to 400 K moves axial 5.0 → 10.0 % (**exactly double**, and an easy number to read off a bar). Neither is inside any noise band — the model is deterministic.
2. **The substance is real matter over the whole range.** Methylcyclohexane melts at 146.6 K and boils at 374 K; at 250–374 K the sim depicts a liquid and at 374–400 K a vapour. Nothing on the slider depicts an impossible state.
3. **The two-state Boltzmann model with a temperature-independent ΔG° is safe over ~150 K**, and A-values measured in the gas phase and in common solvents agree within a few tenths of a kJ·mol⁻¹ for methyl.
4. **500 K was measured (85.3 : 14.7) and REJECTED.** It is far above the boiling point, well outside where a T-independent ΔG° is defensible, and it buys 4.7 percentage points for a 100 K extension. This is a decision, not a default.
5. **A teaching point the range makes available:** the ratio never reaches 50 : 50. It would take T → ∞. Available to a teacher; not narrated.

### C-3 · The pucker driver — a correction to the `planar` enum gap (N-12 / E-1)

The skeleton asks for `planar` to be added to the `pucker.waypoint` enum. **That is the wrong shape, and the chemistry says why.**

The chair-flip path lives on the surface of the Cremer–Pople puckering sphere: chair at θ = 0°, the flexible forms at θ = 90°, chair′ at θ = 180°, all at essentially fixed amplitude Q. **The planar ring is Q = 0 — the CENTRE of that sphere, not a point on its surface.** Flattening is a *radial* motion; flipping is an *angular* one. They are two different coordinates and `waypoint` cannot name both.

> **Revised engine ask (replaces N-12):** add a **separate scalar** `pucker.amplitude` (0 = planar, 1 = the chair's Q), independent of `u`. S1 is driven by `pucker_amplitude: 0 → 1` at `u = 0`. S4–S7 and S9 are driven by `u` at `pucker_amplitude: 1`. No `planar` member is added to `waypoint` — a `planar` waypoint on a path that never passes through it would be a lie in the contract.
>
> This also makes S1's Rule-16a beat exactly what it should be: the ring is held *flattened* (an imposed, strained geometry) and then released to its own amplitude. And it forecloses a real hazard — an explore-state pucker slider that can drive the ring back to planar. §G-8 bounds `pucker_amplitude` in S9 to [0.85, 1.0], matching the skeleton's own requirement that the sandbox cannot return the ring to flat.

### C-4 · `E_kJ_per_mol` is INDEPENDENT — no `derived` field

The live energy readout is a **published-table lookup at the current u**. It is not computable from any declared variable, so per the CRITICAL row `prose_in_a_variable_derived_field_deletes_its_painted_value_from_scope...`:

- it is declared **without a `derived` field**, as an independent painted value;
- the prose describing the table lives here, in this block, and never in the JSON;
- the four table entries are declared as separate constants (`E_chair_kJ`, `E_half_chair_kJ`, `E_twist_boat_kJ`, `E_boat_kJ`) so the published values are still visible to a validator and to a reader;
- every other `computed_outputs` expression was substituted and evaluated numerically at the default scope (§A-9) and returns a finite number.

### C-5 · Two declared naming exceptions

The live `splitNameUnit` regex was run over every key. Two painted captions have no identifier-shaped symbol, and this is deliberate:

| Painted caption | Output key | Why the exception |
|---|---|---|
| `CH₃···H = 274 pm` | `d_ax_pm` → symbol `d_ax` | the caption's "symbol" is a **species pair**, not an algebraic symbol. Renaming the caption to `d = 274 pm` would lose the chemistry a teacher points at |
| `axial 6 · equatorial 6` | — | a count with two fields, not a symbol-value pair |

Both are checked by the chemistry gate instead: `check:organic-structure` asserts each drawn line's measured length against its printed value (§G-6). Recorded so the auditor reads them as declared exceptions, not as `computed_output_name_encodes_a_symbol_no_instrument_paints`.

---

## §D — Within-state motion timeline, control spec, and narration

### D-0 · The pacing reconciliation — the largest disagreement in this block

Planning rate **2.75 words·s⁻¹** (Rule 31a's own calibration: 55 words ≈ 20 s, 25 words ≈ 10 s). Two hard requirements are in tension in the skeleton's §5:

- **Rule 31:** motion may outrun narration, never the reverse → `R ≥ N + 500 ms`.
- **Skeleton §5:** the frozen pin at `0.60·R` must land **after** the state's last asserted reveal `L`, with ≥ 167 ms margin → `R ≥ (L + 167) / 0.60`.

Against the skeleton's §5 durations, **six of eight guided states fail the first requirement** and, once the narration clauses are ordered so that cause precedes effect (Rule 32a), **five fail the second as well**. Revised durations, with the architect's beat *structure* preserved and the windows scaled:

| S | words | N (s) | last reveal L | **proposed R** | pin 0.60R | margin | skeleton R |
|---|---|---|---|---|---|---|---|
| 1 | 51 | 18.5 | 12000 | **21000** | 12600 | 600 | 13000 |
| 2 | 44 | 16.0 | 9300 | **17000** | 10200 | 900 | 14000 |
| 3 | 45 | 16.4 | 12800 | **23000** | 13800 | 1000 | 15000 |
| 4 | 48 | 17.5 | 11200 | **19500** | 11700 | 500 | 14000 |
| 5 | 46 | 16.7 | 9800 | **20000** | 12000 | 2200 | 20000 ✔ |
| 6 | 50 | 18.2 | 12500 | **22000** | 13200 | 700 | 16000 |
| 7 | 51 | 18.5 | 12800 | **22500** | 13500 | 700 | 18000 |
| 8 | 44 | 16.0 | 6600 | **17000** | 10200 | 3600 | 15000 |
| 9 | 0 | — | — | continuous | none | — | — |

Guided total **162 s** vs the skeleton's 125 s. **This is a proposal, not an overwrite** — §I-1.

Notation used below: `t-window · what animates · driven by`. Every branch is a pure function of the state clock (Rule 26, THE-EYE-safe). Focal per sentence is given for the eventual glow binding (N-18).

---

### D-1 · `STATE_1 — ring_is_not_flat` · core · `manual_click` · **R = 21000**

**Archetype:** flatten→relax (declared Rule-16a contrast beat, `docs/patterns/chemistry.md` archetype P family / `organic_structure.pucker`). **Delta cue:** `Flat drawing, then chair`. **Controls:** none. **Formula surface:** none — §I-5. **Hydrogens:** `show_h: 'none'` throughout.

| t-window | What animates | Driven by |
|---|---|---|
| 0 – 800 | flat ring held, camera FACE-ON (`flat_basis`), rigid | `pucker_amplitude = 0` (held) |
| 800 – 1800 | live C–C–C arc draws on the certified carbon, reads `120.0°` | measurement reveal |
| 2900 – 4200 | dimmed reference arc `109.5°` draws beside it, glows | measurement reveal (the prerequisite patch) |
| 4500 – 6800 | eased camera step FACE-ON → HOME; **molecule perfectly rigid**; HUD holds `120.0` throughout — the held value is the proof the re-framing is not the pucker | `camera_steps` (existing, `field_3d_renderer.ts:492`) |
| 6800 – 8600 | hold at HOME, both arcs up, nothing moves | — |
| **8600 – 12000** | **the ring folds**; live arc closes `120.0° → 111.4°` continuously | **`pucker_amplitude: 0 → 1`** (§C-3) |
| 12000 – 21000 | hold at the chair, arc reads `111.4°` | — |

**Rule 32a:** three strictly sequential phases (evidence → re-frame → fold), never simultaneous, and the fold starts 5.7 s after the "does not fit" reason is on screen. **Rule 32e:** one focal at a time — the 120.0° arc, then the 109.5° reference, then the folding ring. **Pin at 12600** — 600 ms after the fold ends, so the frozen frame can never archive the flat ring.

**`text_en` (51 words · 18.5 s):**

> Drawn flat, every ring angle is 120 degrees. A carbon bond angle is about 109.5 degrees, so a flat ring does not fit. Released, the ring folds into the shape called a chair, and the angle closes to 111.4 degrees. Sugar and cotton fibre are built from rings shaped like this.

| clause | words | window | focal |
|---|---|---|---|
| "Drawn flat, every ring angle is 120 degrees." | 8 | 0 – 2900 | the `120.0°` arc |
| "A carbon bond angle is about 109.5 degrees, so a flat ring does not fit." | 15 | 2900 – 8400 | the `109.5°` reference arc |
| "Released, the ring folds into the shape called a chair, and the angle closes to 111.4 degrees." | 17 | 8400 – 14600 | the folding ring |
| "Sugar and cotton fibre are built from rings shaped like this." | 11 | 14600 – 18600 | the settled chair |

**The anchor is moved to the END of S1** (skeleton §6 placed it as the opener). Reason: with the anchor first, the fold cannot start until t ≈ 12.8 s, which pushes the pin before the fold and archives the flat ring — the exact failure the skeleton budgeted against. Moved last, it also reads better: a closing grounding on the chair the student has just watched form, rather than an opening aside about a ring they have not seen yet. Budget honoured at 11 words (≈12 reserved).

**M1 confrontation:** both pictures shown back to back, no question asked, and the flat half carries its own quantitative cost (120.0° against a drawn 109.5° reference — 10.5° wrong) before the release.

---

### D-2 · `STATE_2 — every_bond_is_staggered` · core · `auto_after_tts` · **R = 17000**

**Archetype:** sight-along bond walk. **Delta cue:** `Sight down a bond`. **Controls:** none. **Formula surface:** none. **Hydrogens:** `show_h: ['C1','C2']` and re-targeted at each step; the rest of the ring is a dimmed stick.

| t-window | What animates | Driven by |
|---|---|---|
| 0 – 2500 | eased camera HOME → SIGHT-ALONG(C1–C2); the two focus carbons' H fade in at 1800 | `camera_steps` + `camera.sight_along` |
| 2500 – 5000 | hold in the Newman view; HUD `bond = C1–C2`, `torsion = 54.9°` | — |
| 5000 – 5800 | eased step to SIGHT-ALONG(C2–C3); H visibility retargets | `camera_steps` |
| 5800 – 8500 | hold; HUD `bond = C2–C3`, `torsion = 54.9°` | — |
| 8500 – 9300 | eased step to SIGHT-ALONG(C3–C4) | `camera_steps` |
| 9300 – 17000 | hold; HUD `bond = C3–C4`, `torsion = 54.9°` | — |

**The Newman rim convention is mandatory** (skeleton §8): front-carbon bonds to the centre, back-carbon bonds to a rim circle. **Recentring** onto each bond midpoint uses the scenario's own metres-to-world origin helper (N-4), never an authored camera target.

**A gap I am closing.** The torsion reads 54.9° at all three bonds — the point of the state, but it means the *only* changing quantity would be the camera. A camera-only motion reads as "the molecule spun" (Rule 32d hazard) and leaves the state with no changing number. **The HUD must therefore carry a line that names the current sight-along bond** (`bond = C1–C2` → `C2–C3` → `C3–C4`). The `hud_lines` enum has no such member and `pose` must not be re-purposed. **New enum gap E-3** (§H-10).

**`text_en` (44 words · 16.0 s):**

> Now look straight down one C–C bond. The three bonds on the front carbon sit between the three on the back carbon, not in front of them. That is staggered. The ring torsion reads 54.9 degrees. Step along: every C–C bond looks the same.

| clause | words | window | focal |
|---|---|---|---|
| "Now look straight down one C–C bond." | 7 | 0 – 2500 | the C1–C2 bond |
| "The three bonds on the front carbon sit between the three on the back carbon, not in front of them." | 20 | 2500 – 9800 | the front carbon's three bonds |
| "That is staggered." | 3 | 9800 – 10900 | the Newman rim |
| "The ring torsion reads 54.9 degrees." | 6 | 10900 – 13100 | the torsion HUD line |
| "Step along: every C–C bond looks the same." | 8 | 13100 – 16000 | the bond HUD line |

**No claim about the flat ring** — it is off-screen (skeleton §0). Consequence: the eclipsing evidence for "why not flat" has no renderable home and is **dropped from narration entirely** — §I-2.

---

### D-3 · `STATE_3 — axial_and_equatorial` · core · `manual_click` · **R = 23000**

**Archetype:** two-family reveal. **Delta cue:** `Six axial, six equatorial`. **Controls:** none. **Formula surface:** none. **Hydrogens:** all twelve.

| t-window | What animates | Driven by |
|---|---|---|
| 0 – 1200 | eased camera SIGHT-ALONG → HOME (az 254°, el 10–12°) | `camera_steps` |
| 1200 – 2100 | the **ring axis** reference line draws (labelled `ring axis`) | `measure.axis_line` |
| 2100 – 3000 | the **ring plane** reference disc draws (labelled `ring plane`) | `measure.plane_disc` |
| 3000 – 4000 | the **C–C–H arc** draws on the one carbon the camera solve certifies, reads `109.5°` | `measure.angle` |
| **5500 – 7500** | the six **axial** C–H bonds light **one per carbon, around the ring** (not as a spatial family) | staged reveal |
| 7500 – 8500 | the axial family glows, then dims to a held tint | glow (single focal) |
| **8800 – 10800** | the six **equatorial** C–H bonds light, again one per carbon, same path | staged reveal |
| 10800 – 11800 | the equatorial family glows, then dims to a held tint | glow (single focal) |
| 12800 – 13200 | HUD `axial 6 · equatorial 6` appears | HUD reveal |
| 13200 – 23000 | hold: both families tinted, both reference geometries and the arc up | — |

**M2 prevention is in the choreography, at the planting moment** (skeleton Block 1): the reveal is **per-carbon, never per-family in space**, so the picture the student forms is "every carbon has one", not "these carbons are the axial ones". **Rule 32e** strictly: axial glows alone → dims → equatorial glows.

**The arc is the C–C–H angle, not the axial–C–equatorial angle.** See §I-7 — this is a numeric correction to the skeleton's §10.

**`text_en` (45 words · 16.4 s):**

> Each ring carbon carries two C–H bonds, 109.5 degrees from the ring bonds beside them. One points along the ring axis: that is axial. The other points out near the ring plane: that is equatorial. Every carbon has one of each — six axial, six equatorial.

| clause | words | window | focal |
|---|---|---|---|
| "Each ring carbon carries two C–H bonds, 109.5 degrees from the ring bonds beside them." | 15 | 0 – 5500 | the `109.5°` arc |
| "One points along the ring axis: that is axial." | 9 | 5500 – 8800 | the axial family |
| "The other points out near the ring plane: that is equatorial." | 11 | 8800 – 12800 | the equatorial family |
| "Every carbon has one of each — six axial, six equatorial." | 10 | 12800 – 16400 | the `ae_count` HUD line |

**Skeleton's constraint honoured (Block 2): S3 does not hint that the labels can change.** No word here suggests impermanence — the student is meant to leave S3 confident and slightly wrong. **Skeleton's §10 caution honoured:** the 4.07° axial deviation and 21.57° equatorial tilt are parameterisation-dependent and are **not quoted**; "along the ring axis" and "near the ring plane" are true under both parameterisations.

---

### D-4 · `STATE_4 — the_flip_swaps_them` · core · **PRIMARY AHA** · `manual_click` · **R = 19500**

**Archetype:** follow-one-bond through the pucker. **Delta cue:** `Follow one axial bond`. **Controls:** none. **Formula surface:** `C₆H₁₂`. **Camera:** HOME, fixed for the whole flip.

| t-window | What animates | Driven by |
|---|---|---|
| 800 – 1800 | the traced C1–H(axial) bond is marked and labelled `C1 axial` | `trace` (N-10) |
| 1800 – 3300 | hold — the mark is the cause of attention, held before anything moves | — |
| **3300 – 11000** | **single-pass flip**; the traced bond keeps its identity and its mark throughout; all eighteen atoms move; the other eleven C–H bonds keep their family tint at reduced brightness | **`u: 0 → 1`** |
| (3800 – 10500) | the `ae_count` HUD reads `axial — · equatorial —` while off-chair (N-3) | derived from `u` |
| 11000 – 11200 | the traced bond's label re-reads `C1 equatorial`; `ae_count` returns to `axial 6 · equatorial 6` | derived at u = 1 |
| 11200 – 19500 | **hold at chair′. Single pass, no loop-back** — a loop would undo the state's own claim | — |

**The `C₆H₁₂` surface is up from t = 0 and never changes** — that is the M3 counter rendered, not narrated.

**`text_en` (48 words · 17.5 s):**

> Watch the one axial bond that is marked. The ring now folds the other way. No bond breaks, and the formula stays C₆H₁₂ all the way through. When the ring settles, the marked bond is equatorial. Every axial bond has become equatorial, and the compound is the same.

| clause | words | window | focal |
|---|---|---|---|
| "Watch the one axial bond that is marked." | 8 | 0 – 2900 | the traced bond |
| "The ring now folds the other way." | 7 | 2900 – 5400 | the ring |
| "No bond breaks, and the formula stays C₆H₁₂ all the way through." | 13 | 5400 – 10100 | the `C₆H₁₂` surface |
| "When the ring settles, the marked bond is equatorial." | 9 | 10100 – 13400 | the traced bond's new label |
| "Every axial bond has become equatorial, and the compound is the same." | 12 | 13400 – 17800 | the `ae_count` HUD line |

**Cut-2 compliance (skeleton §7):** no barrier, no named intermediate, no substituent, no energy. The flip passes through the intermediates without labelling or costing them.

---

### D-5 · `STATE_5 — shapes_in_between` · extended · `manual_click` · **R = 20000** *(unchanged)*

**Archetype:** waypoint step with holds. **Delta cue:** `Named shapes in between`. **Controls:** none. **Formula surface:** none. **Camera:** HOME, fixed.

| t-window | What animates | Driven by |
|---|---|---|
| 0 – 1500 | chair held; sprite `chair` | `u = 0` |
| 1500 – 3000 | → half-chair; sprite `half-chair` on arrival | `u: 0 → 0.208` |
| 3000 – 4500 | hold | — |
| 4500 – 5800 | → twist-boat; sprite `twist-boat` | `u: 0.208 → 0.375` |
| 5800 – 7300 | hold | — |
| 7300 – 8600 | → boat; sprite `boat` | `u: 0.375 → 0.500` |
| 8600 – 9200 | the **flagpole contact line** draws between the two flagpole H, labelled `H···H = 183 pm` | `measure.distance` |
| 9200 – 9800 | the **`240 pm` van der Waals reference** draws, visually distinct, labelled `contact distance 240 pm` | `measure.reference_value_pm` — **new, N-17** |
| 9800 – 13500 | **hold on the boat** (3.7 s), both labels readable | — |
| 13500 – 17500 | return legs: → twist-boat′ → half-chair′ | `u: 0.500 → 0.792` |
| 17500 – 20000 | chair′ hold; sprite `chair` | `u: 0.792 → 1` |

**Pin at 12000** — inside the boat hold, 2.2 s after the reference line completes. The boat is deliberately the archived frame: it is the state's single most informative picture.

**N-2 is load-bearing here:** the four intermediates must be REAL geometries as path knots. A linear interpolation of endpoint coordinates would put three labels on one shape. Gate assertions in §G-4; knot positions in §H-4.

**`text_en` (46 words · 16.7 s):**

> Shapes a molecule can twist into without breaking a bond are called conformations. On the way the ring passes through three: the half-chair, the twist-boat, then the boat. In the boat two hydrogens point straight at each other, 183 picometres apart — closer than two hydrogens fit.

| clause | words | window | focal |
|---|---|---|---|
| "Shapes a molecule can twist into without breaking a bond are called conformations." | 13 | 0 – 4700 | the ring |
| "On the way the ring passes through three: the half-chair, the twist-boat, then the boat." | 15 | 4700 – 10200 | each waypoint sprite in turn |
| "In the boat two hydrogens point straight at each other, 183 picometres apart — closer than two hydrogens fit." | 18 | 10200 – 16700 | the flagpole line |

**The Rule-38d dual-label for "conformation" is relocated here from S1** — §I-8. It lands where the named shapes appear, which is its natural home, and S1's 51-word budget cannot hold two dual-labels plus the anchor plus the prerequisite patch plus the contrast.

---

### D-6 · `STATE_6 — the_barrier` · extended · `auto_after_tts` · **R = 22000**

**Archetype:** curve-and-rider. **Delta cue:** `Energy along the flip` (**changed** — §I-9). **Controls:** none. **Formula surface:** `barrier = 45 kJ·mol⁻¹` (**changed** — §I-3). **Camera:** HOME for the molecule; the graph is a 2D overlay, bottom-left zone.

| t-window | What animates | Driven by |
|---|---|---|
| 500 – 3000 | the E(u) curve draws in left to right, all seven stationary points; axes `flip progress` / `energy (kJ·mol⁻¹)`, chair = 0 | curve reveal |
| 3000 – 3500 | hold; nothing else moves | — |
| **3500 – 12500** | **the rider travels the curve and the ring poses in lockstep** — ONE `u` drives both (N-16); HUD `E` reads live and stamps `(literature)` | **`u: 0 → 1`** |
| (5375, 10625) | at each half-chair instant the barrier callout pulses on the curve's peak | derived from `u` |
| 12500 – 22000 | hold: full curve, rider at chair′, `barrier = 45 kJ·mol⁻¹` on the surface | — |

**Rule 32a:** the curve completes before the rider or the ring moves. **`teach_coordinate_sim_with_graph`:** no static curve — the rider and the ring share one live parameter.

**`text_en` (50 words · 18.2 s):**

> Here is the energy along the flip, with the chair as zero. The two half-chairs are the highest points, 45 kilojoules per mole above the chair. The twist-boats sit at 23, the boat at 29. At room temperature the ring crosses this barrier about a hundred thousand times a second.

| clause | words | window | focal |
|---|---|---|---|
| "Here is the energy along the flip, with the chair as zero." | 12 | 0 – 4400 | the curve |
| "The two half-chairs are the highest points, 45 kilojoules per mole above the chair." | 14 | 4400 – 9500 | the peaks |
| "The twist-boats sit at 23, the boat at 29." | 9 | 9500 – 12800 | the three interior stationary points |
| "At room temperature the ring crosses this barrier about a hundred thousand times a second." | 15 | 12800 – 18200 | the rider |

**Plural "half-chairs" and "twist-boats" is deliberate** — the curve draws seven stationary points, and singular narration against a two-peak curve is the `teach_visual_must_match_narration` failure. The flip rate is order-of-magnitude only, narration-only, no rendered numeral (§A-8).

---

### D-7 · `STATE_7 — a_methyl_on_the_ring` · extended · `manual_click` · **R = 22500**

**Archetype:** substituent + contact-line reveal, then the flip (declared contrast pair with S4). **Delta cue:** `A methyl on the ring`. **Controls:** none. **Formula surface:** `C₇H₁₄` (**added** — §I-4). **Camera:** HOME, fixed.

| t-window | What animates | Driven by |
|---|---|---|
| 0 – 800 | the chair holds; the `C₆H₁₂` surface changes to `C₇H₁₄` at 800 | — |
| 800 – 1800 | the **methyl group appears at C1, axial**, replacing exactly one H; rotamer fixed staggered | `substituents` |
| 2500 – 4000 | **two contact lines draw** — methyl carbon to axial H on **C3** and on **C5**, drawn to two *different* carbons so both are separately countable; labels `CH₃···H = 274 pm` | `measure.distance` ×2 |
| 4000 – 4800 | the **`290 pm` van der Waals reference** draws, visually distinct from both, labelled `contact distance 290 pm` | `measure.reference_value_pm` |
| 4800 – 6500 | hold, all three labels readable | — |
| **6500 – 11500** | **the flip**; the two 274 pm lines lengthen continuously with the geometry and are removed at u = 1 | **`u: 0 → 1`** |
| 11800 – 12800 | one contact line redraws to the **same two named atoms**, labelled `CH₃···H = 425 pm` | `measure.distance` |
| 12800 – 22500 | hold: equatorial methyl, the 425 pm line up, the 290 pm reference still up | — |

**Rule 32a:** the methyl (cause) appears, the contact lines (effect) draw 700 ms later, then the flip. **The line LENGTH is never the evidence** — a distance foreshortens; the numeric labels and the drawn 290 pm standard carry the claim.

**`text_en` (51 words · 18.5 s):**

> Put a methyl group on the ring, pointing axial. It sits 274 picometres from the axial hydrogens on carbon 3 and carbon 5 — closer than a carbon and a hydrogen fit, which needs 290. Flip the ring: the methyl is now equatorial and those same two hydrogens are 425 picometres away.

| clause | words | window | focal |
|---|---|---|---|
| "Put a methyl group on the ring, pointing axial." | 9 | 0 – 3300 | the methyl |
| "It sits 274 picometres from the axial hydrogens on carbon 3 and carbon 5 — closer than a carbon and a hydrogen fit, which needs 290." | 26 | 3300 – 12800 | the two contact lines, then the 290 pm reference |
| "Flip the ring: the methyl is now equatorial and those same two hydrogens are 425 picometres away." | 16 | 12800 – 18500 | the 425 pm line |

**Cut-1 compliance (skeleton §7, open question 6):** the words *ratio*, *A-value*, *population*, *percent*, *stable* and *prefers* do not appear. The state ends on a complete qualitative conclusion. **Scoping honoured (§A-5):** the claim is about *those same two hydrogens*, never about the equatorial methyl being clear of everything.

---

### D-8 · `STATE_8 — how_many_of_each` · **advanced** · `manual_click` · **R = 17000**

**Archetype:** population bar fill over a laned pair. **Delta cue:** `How many of each chair`. **Controls:** `temperature` only. **Formula surface:** `N(equatorial) : N(axial) = exp(ΔG°/RT) : 1` (**changed** — §I-3).

| t-window | What animates | Driven by |
|---|---|---|
| 500 – 2500 | the two chairs lane into place along the **camera's screen-right axis** (never a world axis) | `compare.lane_axis: 'screen_right'` (N-14) |
| 3000 – 6000 | the **two bars fill side by side on one shared scale ceiling**, over the two rendered chairs | `equatorial_pct`, `axial_pct` |
| 6000 – 6600 | bar labels appear: `equatorial 95%`, `axial 5%`; HUD `T = 298 K`, `ΔG° = 7.3 kJ·mol⁻¹ (literature)` | computed |
| 7000 → | the `temperature` control goes live; bars and both labels track it continuously | **`T`** |
| 6600 – 17000 | hold | — |

**Every numeral on this state is live.** The bar labels are bound to `equatorial_pct` / `axial_pct`, never authored strings — otherwise the T slider falsifies them the moment a teacher touches it (`authored_annotation_asserts_a_value_its_own_state_control_can_falsify`, CRITICAL). The formula surface is **symbolic and T-independent**, so nothing on it can be falsified either.

**`text_en` (44 words · 16.0 s):**

> Because the axial chair is 7.3 kilojoules per mole higher, at 298 kelvin the ring sits 95 to 5 in favour of the equatorial methyl. Cellulose is a long chain of these rings with every bulky group equatorial. Cotton fibre is made of it.

| clause | words | window | focal |
|---|---|---|---|
| "Because the axial chair is 7.3 kilojoules per mole higher, at 298 kelvin the ring sits 95 to 5 in favour of the equatorial methyl." | 25 | 0 – 9100 | the two bars |
| "Cellulose is a long chain of these rings with every bulky group equatorial. Cotton fibre is made of it." | 19 | 9100 – 16000 | the equatorial chair |

**"at 298 kelvin" is load-bearing and must not be trimmed** — it scopes the narrated 95 : 5 so a teacher's slider move does not make the sentence false. Recorded as constraint §G-10.

**Anchor: 19 words against the reserved ~15.** The overrun buys chemical accuracy — §H-7.

---

### D-9 · `STATE_9 — explore` · core · `interaction_complete` · continuous (Rule 37)

**Archetype:** drag-sandbox. **Delta cue:** `Move the ring yourself`. **Narration:** 0 / open. **Formula surface:** none. Controls and HUD lines exactly as the skeleton's §7, ring-gated. `pucker_amplitude` bounded to [0.85, 1.0] so the sandbox cannot return the ring to planar (§C-3, §G-8).

---

## §E — Notation and dialect ladder (Rule 38c/38d, chemistry form)

### E-1 · The notation ladder — what may appear where

| Ring | Permitted notation | Rendered here |
|---|---|---|
| **core** (S1–S4, S9) | arithmetic and named values only: degrees, picometres, a molecular formula | `120.0°`, `111.4°`, `109.5°`, `54.9°`, `axial 6 · equatorial 6`, `C₆H₁₂` |
| **extended** (S5–S7) | adds units of energy and a difference; still arithmetic | `183 pm`, `240 pm`, `274 pm`, `290 pm`, `425 pm`, `E = 23 kJ·mol⁻¹`, `barrier = 45 kJ·mol⁻¹`, `C₇H₁₄` |
| **advanced** (S8) | the single exponential relation, and only here | `N(equatorial) : N(axial) = exp(ΔG°/RT) : 1`, `ΔG° = 7.3 kJ·mol⁻¹`, `T = 298 K` |

**No logarithm, no calculus and no quantum notation appears anywhere** — this concept needs none. **Nothing below the advanced ring carries `exp`, `ΔG°`, `R`, `T` or `‡`.**

**One removal, and it is a correction rather than a preference.** The skeleton's DoD (b) puts `ΔG‡ = 45 kJ·mol⁻¹` on S6's surface, in the **extended** ring. Two reasons it must go — §I-3.

### E-2 · Dialect dual-labels (Rule 38d) — once, then bare

| Term | Dual-label, at first appearance | Then |
|---|---|---|
| **chair** | S1: "the ring folds into **the shape called a chair**" — defined by the picture, which is stronger than a synonym | bare |
| **conformation** | S5: "**Shapes a molecule can twist into without breaking a bond are called conformations**" — relocated from S1, §I-8 | bare |
| **axial / equatorial** | S3, labelled on canvas beside their two reference geometries (`ring axis`, `ring plane`) | bare |
| **staggered** | S2: defined on screen ("the three bonds on the front carbon sit between the three on the back carbon") before the word is used | bare |
| **van der Waals contact distance** | S5, on the reference line. Never "contact radius", never "vdW radius" | bare |

**Board-neutral choices, stated:** "conformation" not "conformer" as the introduction; "twist-boat" not "skew-boat"; "half-chair" not "sofa"/"envelope" (they are different geometries — §A-7); "barrier" not "activation energy" (they are different quantities — §I-3); "picometres" spoken, `pm` on canvas.

### E-3 · IUPAC-first naming

| IUPAC (primary) | Common name (parenthesised at first use where a teacher may expect it) |
|---|---|
| **cyclohexane** | — (universal) |
| **methylcyclohexane** | — (universal) |
| **methyl group**, `CH₃` | — |
| cellulose | — (a material name, not a substitutive one) |
| **tert-butyl** (assessment q7 only) | 1,1-dimethylethyl (IUPAC substitutive) — *tert*-butyl is the retained IUPAC name and the one every board uses; use it bare |

### E-4 · Unicode (Rule 34c) — every rendered glyph

`°` · `·` · `⁻¹` · `₆` `₁` `₂` `₇` `₄` `₃` · `Δ` · `···` (U+22EF, the contact ellipsis) · `→` · `′` (prime, U+2032, for chair′) · `‡` **banned** · `⇌` **not used** (there is no equilibrium arrow on this canvas; the 95 : 5 is a population, not a written equilibrium).

**Explicitly banned ASCII transcriptions:** `C6H12`, `kJ/mol` on canvas (narration may say "kilojoules per mole"), `deg`, `->`, `...`, `dG`, `A-value` written as `Avalue`. `pm` is fine — it is the SI symbol, not a transcription.

**The sweep must cover all three text paths** (Rule 34c): DOM overlays from the concept JSON, canvas-drawn graph text in S6 (`ctx.fillText` for the axis labels `flip progress` and `energy (kJ·mol⁻¹)`), and any hardcoded 3D sprite labels in the scenario (`createLabelSprite`). A sweep of one silently skips the others.

### E-5 · Rule 41 sweep — the register audit the architect asked for (open question 9)

Every reader-facing string was read against the ban list. **Present nowhere:** want, prefer, like, hide, escape, relax into comfort, happier, comfortable, strain-free, seek, avoid, try, choose, need to, fight, crowded-out, cosy, roomy, unhappy, relieved, "all yours", "gives back", "budges", "rides on".

| Where a cause had to be stated | The literal form used |
|---|---|
| why a flat ring is wrong | "A carbon bond angle is about 109.5 degrees, so a flat ring does not fit." |
| why the axial methyl is disfavoured | "It sits 274 picometres from the axial hydrogens on carbon 3 and carbon 5 — closer than a carbon and a hydrogen fit, which needs 290." |
| the boat's flagpole | "two hydrogens point straight at each other, 183 picometres apart — closer than two hydrogens fit" |
| the population | "the ring sits 95 to 5 in favour of the equatorial methyl" |

**Standard chemistry words used bare, as instructed:** chair, boat, twist-boat, half-chair, axial, equatorial, staggered, conformation, methyl, van der Waals. These are the words the formula uses (Rule 41b), not jargon.

**Three near-misses I caught and changed:**
- S6's delta cue "The flip **costs** energy" → `Energy along the flip`. "Costs" is an economic metaphor (Rule 41a) and, separately, the cue must name the state's action, not a judgement.
- S6 narration "Forty-five is **small**, so..." → "At room temperature the ring crosses this barrier..." — "small" is a comparison with nothing on screen to compare against.
- S8 anchor "That is what makes cotton fibre **rigid**" → dropped. It is a causal overclaim (cellulose's stiffness needs the β-1,4 geometry *and* interchain hydrogen bonding) and the two facts stand better unlinked.

### E-6 · Symbols and units the explore state renders — the cut checks, run literally

**Cut 1 (hide advanced = S8).** Removed from anywhere on screen: `ΔG°`, `exp`, `R`, `T`, `%`, `K` (kelvin). S9's `temperature` control is `min_ring: advanced` and its `population` HUD line is `min_ring: advanced`, so both vanish. S7's narration and canvas contain none of them (checked word by word). **Coherent ✔**

**Cut 2 (hide advanced + extended = S5–S8).** Additionally removed: `kJ·mol⁻¹`, `pm`, `barrier`, `E`, `conformation`, `half-chair`, `twist-boat`, `boat`, `CH₃`, `C₇H₁₄`. S9's `substituent` / `group` controls are `min_ring: extended` and its `distance` / `energy` HUD lines are `min_ring: extended`. Surviving S1–S4 + S9 renders only: `°`, `C₆H₁₂`, `axial`, `equatorial`, `chair`, `ring axis`, `ring plane`, and the numerals 120.0 / 111.4 / 109.5 / 54.9 / 6. **Every one of those first appears in a core state. Coherent ✔**

**Rule 38b value check** (the `core_ring_state_shows_value_whose_only_derivation_is_higher_ring` row): every unit-bearing quantity S9 can print under the core preset — an angle in degrees and an a/e count — is shown concretely in S1/S3. No orphan. ✔

---

## §F — Drill-down cluster phrasings (5 per cluster, real student voice)

Nine clusters from the skeleton's §12. These become `trigger_examples TEXT[]` rows in `confusion_cluster_registry` — one row per cluster, `status: 'active'` (the CRITICAL `confusion_cluster_registry_unseeded_for_concept` row binds json_author to author and apply that migration).

### STATE_3 — `axial_and_equatorial`

**`which_bonds_are_axial`**
1. how do i know which bond is the axial one
2. is axial the one pointing up or the one pointing out
3. are the axial bonds always on the same carbons
4. why are three axial bonds up and three down
5. i keep drawing all six axial bonds pointing up, is that wrong

**`why_equatorial_is_not_in_the_plane`**
1. i thought equatorial means in the ring plane but it looks tilted
2. why isnt the equatorial bond flat with the ring
3. what does the ring plane even mean if the ring is not flat
4. is equatorial the same as horizontal
5. the equatorial bonds look like they point up a bit, which is it

**`how_to_draw_axial_and_equatorial`**
1. how do i draw a chair with all twelve hydrogens in an exam
2. my chair drawings always come out looking like a boat
3. which way do the equatorial bonds slant when i draw them
4. do i have to draw all the hydrogens or can i leave them out
5. is there a trick for getting the axial and equatorial right first time

### STATE_4 — `the_flip_swaps_them`

**`does_the_ring_break_when_it_flips`**
1. does a bond have to break for the ring to flip
2. how can it turn inside out without anything snapping
3. if nothing breaks how does the shape change that much
4. do the carbons swap places when it flips
5. is the flip the same thing as a reaction

**`does_every_bond_swap_or_only_some`**
1. do all six axial bonds become equatorial or just some
2. what happens to the equatorial ones when the axial ones flip
3. does the hydrogen on carbon 1 stay on carbon 1
4. if every axial becomes equatorial then does anything stay the same
5. do the C–C bonds swap too or only the C–H ones

**`same_compound_or_different`**
1. are the two chairs two different compounds
2. can you separate the two chairs in a lab
3. if they look different why are they the same molecule
4. is this isomerism or not
5. why is it a conformation and not an isomer

### STATE_7 — `a_methyl_on_the_ring`

**`what_is_a_1_3_diaxial_interaction`**
1. what does 1,3-diaxial actually mean
2. why carbon 3 and carbon 5 and not the ones next door
3. are there two of these interactions or three
4. is a 1,3-diaxial thing the same as a gauche interaction
5. how do i spot 1,3-diaxial interactions in a drawing

**`why_axial_is_crowded_but_equatorial_is_not`**
1. why is 274 picometres too close, what is it being compared to
2. the equatorial one has hydrogens near it too, so why is that fine
3. isnt the equatorial methyl sticking out where things could hit it
4. is it about distance or about direction
5. what happens if i just rotate the methyl group, does that fix it

**`does_a_bigger_group_change_it`**
1. what if i put a bigger group instead of methyl
2. is it always 95 to 5 or does it depend on the group
3. does a chlorine behave the same as a methyl
4. can a group be so big the ring never flips
5. what happens if there are two groups on the ring

---

## §G — Constraint callouts (what the engine must never render, and the algebra it must hide)

**Conservation first.**

**G-1 · Conservation, every frame, every state.** 6 C, 12 H, 18 bonds (14 C and 20 bonds with the methyl). No atom or bond may fade, blink or be culled at any u, at any camera pose, at any occlusion depth. A frame that renders 17 bonds during a sweep is a frame that teaches a bond broke. *(FIXED counts.)*

**G-2 · Countability, for everything the sim counts.** Minimum pairwise screen separation between rendered atom discs > 0, measured in **isotropic screen units (camX/camZ, camY/camZ)**, never in NDC — dividing x by the aspect ratio shears every measured direction by 1.78× at 16:9. Specifically countable: the twelve C–H bonds at S3; the two flagpole hydrogens during the boat hold at S5; the two 1,3-diaxial contact lines at S7 (drawn to **two different ring carbons**, C3 and C5, so "two" is verifiable); the two chairs and the two bars at S8. *(DERIVED per camera — the surgeon re-solves in perspective.)*

**G-3 · No axial/equatorial tag off-chair.** At the half-chair, twist-boat and boat, "axial" and "equatorial" have **no chemical meaning**. The tags fade out as `u` leaves a chair pose and re-read at the far end. `ae_count` renders in **exactly two string shapes**: `axial 6 · equatorial 6` in a chair, `axial — · equatorial —` off-chair. Rendering a count at the half-chair asserts a quantity that does not exist. *(FIXED.)*

**G-4 · Never render a boat where a twist-boat is meant, or vice versa.** The gate assertion is definitional, not a torsion list: **the boat has exactly two ring torsions within 2° of 0° (two fully eclipsed C–C bonds) on opposite bonds; the twist-boat has none below 25°** (measured: min |τ| = 30.6°). The half-chair has **exactly four contiguous ring carbons coplanar** (four-atom best-plane RMS < 0.02 Å). *(DERIVED from the knot geometry.)*

**G-5 · The path must pass through real geometries as knots.** A linear interpolation between chair and chair′ endpoint coordinates renders three labels on one shape. Every knot's full ring-torsion set is asserted against §A-7 within 2°. *(FIXED knots; DERIVED interpolation.)*

**G-6 · A drawn measurement equals its printed value.** `|measured − printed| ≤ 2 pm` for every distance line; `≤ 0.5°` for every arc. This is the assertion that catches the boat-parameterisation hazard of §A-6 and it is the substitute for the two declared naming exceptions of §C-5. *(DERIVED.)*

**G-7 · Unit conversions the UI hides.**
- **kJ → J in the Boltzmann exponent: `× 1000`.** `A_Me_kJ` is in kJ·mol⁻¹ and `R_gas` in J·mol⁻¹·K⁻¹. Omitting the factor gives `exp(0.00295) = 1.003` → 50.1 : 49.9, a plausible-looking and completely wrong answer. This is the single most likely numeric bug in the concept.
- **Temperature is authored, sliced and displayed in K throughout.** No °C anywhere — no `+273.15` conversion exists or is needed. The HUD prints `T = 298 K`.
- **Scene units ↔ picometres.** `MG_BOND_LEN = 2.0` scene units per 154 pm → **1 scene unit = 77 pm**. Every pm-valued readout must pass through **ONE** metres-to-world helper (N-4). A second copy of the conversion is how a drifting geometry table gets born.
- **Angles are degrees on canvas and in every declared constant.** No expression here takes a trig function, so `radians()` appears nowhere.
- **Slider step:** `T` in steps of 5 K (30 stops across 250–400 K — fine enough that the bars move on every click, coarse enough that the printed percentage is stable).

**G-8 · The sandbox cannot flatten the ring.** `pucker_amplitude` in S9 is bounded to [0.85, 1.0]. The flat ring appears once, in S1, and never again — including in the explore state. *(FIXED bound.)*

**G-9 · Scale factors — and the one that actually bites here.**
- **Molecular scale is 1 : 1.** Exactly 18 atoms are drawn and the molecule has exactly 18 atoms. **There is no representative scaling anywhere in the particulate view.** This is unusual for a chemistry concept and is stated so nobody introduces one.
- **The S8 population bars ARE a scale claim, and it must not leak into a count.** Two molecules are drawn; the 95 : 5 is a split over a mole-scale ensemble (~10²³ molecules). The bars are therefore labelled **`equatorial 95%` / `axial 5%` — percentages of molecules, never counts.** No string may read "95 molecules", "95 rings" or "19 out of 20 molecules". *(FIXED convention, DERIVED values.)*
- **Corollary the same state must respect (§B-2):** the two laned chairs are **one compound in two conformations**, never two species, two compounds, two products or a mixture.

**G-10 · Narrated numerals are scoped to their conditions.** S8's sentence carries "at 298 kelvin" precisely so a teacher's slider move does not falsify it. Trimming that phrase for word budget is a correctness change, not an edit.

**G-11 · No number the engine did not look up.** Every energy, A-value and contact distance carries a source stamp in the HUD (`(literature)`). The engine computes no steric energy at any u, ever — `ORGANIC_PHASE0_CONFORMATION.md` decision 1.

---

## §H — Answers to all nine open questions

**H-1 · Verify every published energy.** ✔ **All five CONFIRMED**, each with a named source and an independent kcal·mol⁻¹ cross-check that lands on a round literature figure: chair 0 · half-chair **+45** (10.76 kcal; Anet & Bourn 1967) · twist-boat **+23** (5.50 kcal; Squillacote *et al.* 1975) · boat **+29** (6.93 kcal; Eliel & Wilen) · A(CH₃) **7.3 kJ·mol⁻¹** (1.74 kcal; Eliel & Wilen A-value table). **No value changed.** One structural correction: the profile has **seven** stationary points, not four — two half-chair maxima and two distinct twist-boat minima flanking the boat (§A-1, §A-7). Full table with sources: §A-1, §A-2.

**H-2 · The boat flagpole distance and its references.** ✔ **≈183 pm CONFIRMED and independently reproduced** — 183.3 pm from the idealised all-tetrahedral boat at the ED C–C length of 153.6 pm; 184.0 pm at 154 pm. Sources: McMurry, Vollhardt & Schore, Solomons. ✔ **Both van der Waals references CONFIRMED**: H+H = **240 pm**, C+H = **290 pm**, from Bondi (1964) radii H 1.20 Å / C 1.70 Å. **Attached condition, and it is not optional:** at the chair's own parameterisation (∠CCC 111.4°) the same contact measures **216 pm**, so the engine's boat knot must be built at the idealised tetrahedral geometry or the 183 pm label is a rendered falsehood. Full reasoning and the decision: §A-6. Gate assertion: §G-6.

**H-3 · The flip rate — DECISION.** Publish **"about a hundred thousand times a second"** in S6 narration only. Do **not** publish 8.1 × 10⁴ s⁻¹; do **not** publish any half-life. The order of magnitude is itself a literature statement (McMurry, Clayden), so it needs no distinguishing stamp and sits beside the other published values as one of them; it is also robust across the entire literature barrier band (43–46 kJ·mol⁻¹ → 0.5–1.8 × 10⁵ s⁻¹) where the point value is not. The half-life is ambiguous for a degenerate two-state exchange — 1/k = 12.3 µs, ln2/k = 8.5 µs and ln2/2k = 4.3 µs all have equal claim on the name, and the architect's 8.5 µs is not a standard definition of either. Full reasoning: §A-8.

**H-4 · The u-positions of the waypoints.** **Endorsed, with a principled basis and a small refinement.** The architect's proposal turns out to be, to within 0.015, the **great-circle arc-length parameterisation of the Cremer–Pople puckering sphere** (Cremer & Pople, *JACS* **97** (1975) 1354) — the standard published coordinate system for six-ring conformations. The path is: a meridian at φ₂ = 30° from θ = 0° (chair) to θ = 90° (twist-boat), 90° of arc; along the equator through the boat at φ₂ = 60° to the second twist-boat at φ₂ = 90°, 60° of arc; a meridian from θ = 90° to θ = 180° (chair′), 90° of arc. **Total 240°.**

| waypoint | arc | **u (CP arc-length)** | architect | Δ |
|---|---|---|---|---|
| chair | 0° | **0.0000** | 0 | 0 |
| half-chair | θ_TS | **θ_TS / 240** = 0.2083 at θ_TS = 50° | 0.22 | 0.012 |
| twist-boat | 90° | **0.3750** | 0.36 | 0.015 |
| boat | 120° | **0.5000** | 0.50 | 0 |
| twist-boat′ | 150° | **0.6250** | 0.64 | 0.015 |
| half-chair′ | 240° − θ_TS | **0.7917** | 0.78 | 0.012 |
| chair′ | 240° | **1.0000** | 1.00 | 0 |

Recommendation to the surgeon: **adopt the CP arc-length set**, because it makes the knot positions *derivable* rather than chosen, and because the half-chair's u then follows automatically from whatever θ the sourced transition-state geometry has (`u = θ_TS / 240`) rather than being a taste call. Two caveats to record: Q is not constant along the path (0.566 Å at the chairs, 0.767 Å at the flexible forms), so true arc length in full (q₂, q₃) space differs slightly from the great-circle values — the great-circle definition is the recommended one because it is the standard pseudorotation coordinate and is exactly reproducible. And the path must be **symmetric about u = 0.5** (`u_k + u_{6−k} = 1` exactly); both sets satisfy this. Waypoint geometries and gate signatures: §A-7, §G-4, §G-5.

**H-5 · Do not quote 4.07° or 21.57°.** ✔ Honoured, and independently re-derived: both are parameterisation-dependent (4.07° / 21.57° at the experimental chair; **0.00° / 19.47°** at the idealised one). S3 says "along the ring axis" and "near the ring plane", true under both. **But the robust on-canvas measurement is NOT the one the skeleton names** — §I-7 and H-9 below.

**H-6 · S7 must not forward-reference the ratio, A-value or "population".** ✔ Honoured. S7's 51 words were swept: *ratio*, *A-value*, *population*, *percent*, *%*, *stable*, *prefers*, *favoured*, *equilibrium* and *Boltzmann* all absent. S7's formula surface is `C₇H₁₄`, not the Boltzmann relation. The state ends on a complete qualitative conclusion, so Cut 1 leaves a coherent lesson (§E-6).

**H-7 · The glucose anchor's phrasing.** **Confirmed with one substantive correction.** "In its common ring form every bulky group on glucose sits equatorial" is true of **β-D-glucopyranose** (all of OH-2, OH-3, OH-4 and the C-5 CH₂OH equatorial) but **not** of α-D-glucopyranose, whose anomeric OH is axial. D-glucose in water is roughly 64 % β / 36 % α, so the unqualified claim is true of a majority but not of "glucose". At 15 words there is no room for the anomeric hedge and a hedge would confuse.

> **Resolution: name cellulose, not glucose, at S8.** Cellulose is β-1,4-linked D-glucopyranose in which **every** ring is a chair with **every** substituent equatorial, without exception and without an anomeric caveat. The claim becomes unconditionally true, and it also closes the loop with S1's "cotton fibre".
>
> - **S1 (11 words, ≈12 reserved):** *"Sugar and cotton fibre are built from rings shaped like this."* — grounding only, no equatorial claim (S1 has not taught a/e), pre-spoils nothing.
> - **S8 (19 words, ≈15 reserved):** *"Cellulose is a long chain of these rings with every bulky group equatorial. Cotton fibre is made of it."* — the payoff clause, unconditionally true, two facts stated and no causal overclaim.
>
> The 4-word overrun buys the accuracy. **Dropped as an overclaim:** "…which is what makes cellulose rigid." Cellulose's stiffness needs the all-equatorial β-1,4 geometry *and* interchain hydrogen bonding into microfibrils; attributing it to the equatorial arrangement alone is the kind of half-truth a teacher corrects in front of the class.
>
> **Rule 35 audit:** sugar, cotton and cellulose are universal — no place, country, festival, food culture, currency, brand or personal name. Reads identically to a student anywhere. **Preset coherence:** the S1 clause is core and survives every cut; the S8 clause is advanced and disappears with S8, so the anchor still reaches narration under every preset. ✔
>
> **The skeleton's secondary anchor (medicines on six-membered rings) is DECLINED.** It names a mechanism the sim does not have — a protein binding site — and the row `real_world_anchor_promises_a_lever_the_sim_does_not_have` is exactly this failure. Nothing on the canvas lets a teacher point at it.

**H-8 · S6's units — no kcal·mol⁻¹ toggle needed.** ✔ Checked across all four claimed curricula plus AP: **CBSE/NCERT and JEE use kJ·mol⁻¹; IB (DP Chemistry) uses kJ·mol⁻¹; A-level (AQA, OCR, Edexcel, CIE) uses kJ·mol⁻¹; AP Chemistry uses kJ/mol.** No specification in the claimed set requires kcal·mol⁻¹. kcal survives only in some US organic textbooks and in the older primary literature — a book convention, not a syllabus requirement. **No units toggle is authored.** Recorded for the future: if a US-market preset ever appears, it is a *unit* toggle on the same axes, never an axis swap, and the kcal values are tabulated in §A-1 so nobody has to re-derive them. Axis convention (x = flip progress 0→1, y = energy kJ·mol⁻¹, chair = 0) confirmed as universal; no board conflict; no axis-swap toggle.

**H-9 · Rule 41 sweep.** ✔ Done over every reader-facing string — titles, delta cues, on-canvas labels, all eight narrations. Full audit at §E-5, including three near-misses caught and changed (S6's cue "The flip **costs** energy"; S6's "Forty-five is **small**"; S8's "**makes cotton fibre rigid**"). The exemplar sentence is used verbatim in spirit: *"It sits 274 picometres from the axial hydrogens on carbon 3 and carbon 5 — closer than a carbon and a hydrogen fit, which needs 290."*

**H-10 · Engine asks I am adding to the skeleton's N-1 … N-16.**

| id | Need | Consumer | Why it is not optional |
|---|---|---|---|
| **N-17** | `measure.reference_value_pm` must be authorable at **S5** as well as S7 — the boat needs a drawn **240 pm** H+H reference | S5 | Without it, "closer than two hydrogens fit" is a claim carried only by narration. Under Rule 24 the sim reads sound-off, so an unbacked claim is not carried at all (`gas_box_state4_asserts_unchanged_speed_with_no_instrument`) |
| **N-18** | a **glow-target vocabulary** — per-narration-sentence focal binding naming an addressable scene element | all | `concept_ships_zero_narration_glow_bindings` requires 1.0 coverage. §D gives a focal for every sentence; there is no field to bind them to. Currently 0/N by engine limitation |
| **E-3** | `hud_lines` has **no member naming the current sight-along bond** | S2 | S2's only changing quantity would otherwise be the camera; the torsion reads 54.9° at all three bonds. Do **not** re-purpose `pose` (which renders a conformation name) — `existing_hud_line_reused_for_a_different_physical_quantity` |
| **N-12 revised** | replace "add `planar` to `pucker.waypoint`" with a **separate `pucker.amplitude` scalar** (0 = planar, 1 = the chair's Q), independent of `u` | S1, S9 | The planar ring is Q = 0 — the **centre** of the Cremer–Pople sphere, not a point on the flip path. A `planar` waypoint on a path that never passes through it would be a false statement in the contract. §C-3 |
| **N-9 strengthened** | ban the nearest-contact mode contract-wide, not concept-wide; and **fix the methyl rotamer staggered** at every u | S7, S9, every future organic concept | Both conformers' nearest ring-H contact is **270.0 pm** — a nearest-contact readout reports *no change* through the flip. A rotamer-free metric requires a fixed rotamer. §A-5 |
| **N-16 strengthened** | the published `cyclohexane` curve must carry **seven** stationary points, not four | S6, S9 | Two half-chair maxima and two distinct twist-boat minima. A four-point table cannot draw the curve the state narrates |
| **N-2 strengthened** | the boat knot is built at the **idealised tetrahedral** parameterisation while the chair knots use the experimental one; both must be **declared in the molecule table** | S5, S6, S7, S9 | Otherwise the rendered flagpole is 216 pm under a `183 pm` label. §A-6 |
| **N-15 strengthened** | bar labels bound **live** to the computed percentages, never authored strings; and the bars are labelled as **percentages of molecules**, never counts | S8 | `authored_annotation_asserts_a_value_its_own_state_control_can_falsify` (CRITICAL) + §G-9 |

---

## §I — DISAGREEMENTS with the skeleton, stated plainly

Nine. Each is flagged, none silently overwritten.

**I-1 · State durations (§5) — the largest.** Six of eight guided states have narration that outruns their choreography at the architect's `R`, and five also put the frozen pin **before** their last asserted reveal once narration clauses are ordered cause-before-effect. Worst case S1: 51 words ≈ 18.5 s against `R = 13000`. Proposed revised durations in §D-0 (guided total 162 s vs 125 s), with the architect's beat *structure* preserved and every pin margin ≥ 500 ms. **Founder/architect call, not mine to impose.** The structural cause is worth recording: with the pin fixed at `0.60·R` and the last reveal at the end of narration, `R` must be ≈1.45× the narration duration for any state.

**I-2 · §4 M1 contradicts §8 S1 — the eclipsing evidence cannot be rendered.** §4 says the flat ring is held "with all twelve C–H bonds exactly eclipsed" as visible counter-evidence; §8 says S1 runs `show_h: 'none'` through the flat phase and the pucker. **Both cannot be true.** Compounding it, at S1's FACE-ON camera the hydrogens of a *planar* ring lie in the image plane pointing radially outward — eclipsing is invisible from that direction by construction, so even showing them would not carry the claim. And S2 is forbidden from referencing the off-screen flat ring (§0, `teach_visual_must_match_narration`), so the claim has no other home.
**My resolution: drop the eclipsing claim from narration entirely.** S1's counter-evidence is the angle alone — 120.0° against a drawn 109.5° reference, wrong by 10.5° — which is quantitative, immediate and fully rendered. This narrows §2's change-2 rationale ("the larger half is torsional"), which remains true chemistry the sim cannot show. The torsional half is carried implicitly by S2's staggered chair, never as a narrated comparison to a picture that is not on screen.

**I-3 · S6's formula surface `ΔG‡ = 45 kJ·mol⁻¹` must change.** Two independent reasons.
(a) **It is not clearly correct.** For cyclohexane ring inversion, ΔH‡ ≈ 45 kJ·mol⁻¹, the Arrhenius Ea is ≈ 50 kJ·mol⁻¹, and ΔG‡ at 298 K depends on a ΔS‡ the sources report inconsistently. Every standard text quotes "45 kJ·mol⁻¹" as *the barrier* without decomposing it; pinning that number to the specific symbol ΔG‡ asserts a decomposition the literature does not agree on, and "Ea = 45" would be flatly wrong.
(b) **Notation ladder (Rule 38c).** S6 is the **extended** ring. The ‡ symbol carries the whole apparatus of transition-state theory, which this concept never defines.

> **Replacement surface: `barrier = 45 kJ·mol⁻¹`.** True under every reading, plain English (Rule 41b), no ‡ below the advanced ring, and it matches the vertical measure the curve already draws from the chair level to the peak. The `(literature)` stamp lives on the HUD energy line, not on the surface.

**I-4 · S8's formula surface `ΔG° = 7.3 kJ·mol⁻¹` should become a relation.** As authored it is a *value*, not a relation; it does not "resolve to a percentage" the way the skeleton's §0 disposition requires; and it sits in the same units as S6's adjacent 45 kJ·mol⁻¹, inviting confusion between a barrier and a difference.

> **Replacement surface: `N(equatorial) : N(axial) = exp(ΔG°/RT) : 1`** — symbolic, T-independent, therefore unfalsifiable by the live temperature slider (the CRITICAL `authored_annotation_asserts_a_value_its_own_state_control_can_falsify` row), and it resolves through the bars to the 95 : 5 the HUD renders. `ΔG° = 7.3 kJ·mol⁻¹ (literature)` and `T = 298 K` move to the HUD as value-only lines (Rule 34b). Note `eq` cannot be subscripted — Unicode has no subscript **q** — so `N(equatorial)` in parentheses is the correct rendering, not `N_eq`.

**I-5 · S7 needs a `C₇H₁₄` formula surface, and DoD (b) omits it.** DoD (c) requires it ("the methyl replaces exactly one H, so the formula becomes C₇H₁₄ and the surface must say so") but the symbol-label table in (b) has no row for it. Added at §D-7 (t = 800 ms, when the methyl appears). This also gives S7 its one permitted surface without duplicating the contact labels or the 290 pm reference.

**I-6 · S1 should carry NO formula surface.** DoD (h) enumerates S2, S3, S5 and S9 as carrying none, implying S1 carries one. S1's picture is already two arcs plus a fold; a third numeric surface on the state whose entire point is one comparison works against Rule 34's canvas budget, and any candidate (`109.5°`) would duplicate the drawn reference arc. **Recommend S1 join the no-surface list.** Rule 34b permits zero.

**I-7 · A numeric error in §10: "axial–C–equatorial angle = 109.46°" is wrong.** Under the skeleton's own stated parameterisation (∠HCH = 107.5° by construction), the axial and equatorial C–H bonds on one carbon are the two hydrogens, so that angle **is** the H–C–H angle: **107.50°**, re-derived from coordinates. The measured **109.46°** is the **C–C–H** angle — ring carbon to ring carbon to hydrogen — which comes out at 109.46° for *both* the axial and the equatorial hydrogen. (The two coincide at 109.47° in the idealised all-tetrahedral chair, which is presumably how the mislabel arose; at 111.4° they differ by 2°.)

Three consequences:
- **If the engine draws an arc between the axial and equatorial C–H bonds and labels it 109.5°, it draws 107.5° and labels it 109.5°** — a rendered falsehood on the state that teaches axial vs equatorial.
- **The correct S3 arc is the C–C–H angle**, and it is the better one anyway: robust at 109.46–109.47° under *both* parameterisations (so it survives the §10 caution), and it lands the M1 callback directly — the same 109.5° the student was told at S1 is the angle they now measure on the chair. Adopted at §D-3.
- **The camera solve's angle-fidelity figures need re-deriving.** §8 reports "best-carbon projected axial–equatorial angle error = 1.93° (el 10°) / 3.81° (el 12°) against the true 109.46°" — measured against the wrong target, so both shift by ≈2°. This does not change the *conclusion* that el 10–12° is a narrow solved window, and the perspective re-solve the skeleton already requires subsumes the fix — but the surgeon must re-solve for the **C–C–H** arc, which is the angle S3 now renders, not for the ax–C–eq angle.

**I-8 · The "conformation" dual-label moves from S1 to S5.** §7's Rule-38d plan puts both dual-labels ("chair", "conformation") at S1. S1's 45–52 word budget cannot hold two dual-labels plus the 12-word anchor plus the 8-word prerequisite patch plus both halves of the contrast beat — I measured it at 68 words with all five. "Conformation" lands naturally at S5, where the named shapes appear and the definition ("shapes a molecule can twist into without breaking a bond") is exactly what the state is showing. **Ring consequence, checked:** S5 is extended, so under Cut 2 the word "conformation" is never rendered at all — which is correct, because under Cut 2 no state uses it.

**I-9 · Three delta cues and the anchor placement.**
- S6's cue `The flip costs energy` → **`Energy along the flip`**. "Costs" is an economic metaphor (Rule 41a), and separately the cue must name the state's action, true from t = 0, not a judgement.
- The S1 anchor moves from the opening to the closing clause. Reason at §D-1: as an opener it delays the fold past the pin and archives the flat ring — precisely the failure §5 budgeted against.
- The two remaining `nlb`-class cue rows were re-checked cue by cue against the revised timings; all nine cues name an action true from t = 0 and none paraphrases a watched belief.

---

## §J — Assessment answer key (chemistry verification only)

json_author writes the items; this is the correctness floor. Seven questions per DoD (f), schema floor `.min(6)`. Every distractor is a real belief that produces that option.

| q | State | Correct answer | Distractors, and the belief each encodes |
|---|---|---|---|
| **q1** | S1 | A flat ring would need 120° at every carbon, and a carbon bond angle is about 109.5° | *a flat ring would be too large* (size/strain confusion) · *the C–C bonds are different lengths* (unequal ring bonds) · *carbon forms only three bonds in a ring* (valence error) |
| **q2** | S2 | staggered | *eclipsed* (**M1 carried forward** — the flat picture survives into the chair) · *at 90° to each other* (tetrahedral→square) · *parallel* (the axial-only picture of the chair) |
| **q3** | S3 | one axial and one equatorial C–H bond | *two axial* (**M2**) · *two equatorial* (**M2**) · *one axial only* (misses that each carbon carries two H) |
| **q4** | S4 | equatorial, and no bond broke | *still axial, the label belongs to carbon 1* (**M2**) · *equatorial, because a C–H bond broke and re-formed* (**M3**) · *gone, the flipped ring is a different compound* (**M3**) |
| **q5** | S5/S6 | chair < twist-boat < boat < half-chair (0 < 23 < 29 < 45) | *chair < boat < twist-boat < half-chair* (**the commonest error** — boat and twist-boat swapped) · *chair < half-chair < twist-boat < boat* (half-chair read as a mild intermediate rather than the maximum) · *boat < chair < …* (chair not lowest) |
| **q6** | S7 | an axial methyl is about 274 pm from the axial hydrogens on carbons 3 and 5, closer than a carbon and a hydrogen fit | *an equatorial methyl is further from the two hydrogens on the same carbon* (geminal confusion — the metric trap of §A-5 in question form) · *the equatorial C–CH₃ bond is shorter and stronger* (bond-length confusion) · *the ring cannot flip once a methyl is attached* (substitution blocks the flip) |
| **q7** | S8, **transfer** | an even larger share sits equatorial, because a bulkier group has a larger A-value | *the same 95 : 5, the ratio depends only on temperature* (Boltzmann misread) · *a smaller share equatorial, a bigger group needs more room in the ring plane* (equatorial-crowding confusion) · *50 : 50, because the flip is fast* (rate/equilibrium confusion) |

**q7 chemistry verified:** A(*tert*-butyl) ≈ 20–24 kJ·mol⁻¹ (4.7–5.4 kcal·mol⁻¹, Eliel & Wilen) → > 99.9 % equatorial at 298 K. The answer is correct and the margin is not marginal. `coverage_map.notes` must record that no single state stages it. `non_assessed_states: [STATE_9]`. `misconception_watch` on S1, S3, S4 only.

---

## §K — Self-review

- [x] Every quantity in the skeleton's state narratives appears in `variables` with a unit (§C-1).
- [x] Conservation ledger complete — atom counts, charge, valence, bonds broken/formed and the **adjacency list** at u = 0, every intermediate u, and u = 1; separate ledger for the substituted C₇H₁₄ case. No redox, so no oxidation numbers (§B).
- [x] Every state's motion targets `organic_structure`, the Phase-0 0b scenario this document specs. **No state downgraded, none marked blocked.** Eight new/strengthened engine asks raised rather than improvised around (§H-10).
- [x] Rule 31 timeline for every state (t-window × what animates × driven-by), pure function of the state clock; no two states share a motion; no static state; controls match the architect's table exactly (§D).
- [x] Rule 32 verified per state — cause window before effect with ≥ 0.5 s gap in S1/S3/S4/S6/S7; only the taught variable moves; no idle spin S1–S8; single glow focal; home pose preserved (§D).
- [x] Rule 33 — 33a–c declared N/A by the architect and agreed (one molecule, one scale). **33d binds and is met:** every instrument shows a live number (arc, torsion, bond name, contacts, energy rider, population bars).
- [x] Rule 34 — one formula surface per state at most, Unicode-only, value-only HUD, zones fixed and non-colliding (§E-4, §D).
- [x] Word budget: every guided state 44–51 words, inside 25–55 and inside each architect per-state band; explore = 0/open. Speech duration computed per state and reconciled against choreography (§D-0).
- [x] Notation ladder: no logarithm, no calculus, no quantum notation anywhere; the single exponential confined to S8 (advanced); ‡ removed from the extended ring (§E-1, §I-3). Dual-labels once then bare; IUPAC-first (§E-2, §E-3).
- [x] Particle-count scale declared: **1 : 1, exactly 18 atoms, no representative scaling** — and the one real scale claim (S8's population bars over a mole-scale ensemble) isolated and constrained (§G-9).
- [x] 45 drill-down phrasings, 5 per cluster × 9 clusters, real student voice, plain English, no Hinglish (§F).
- [x] `constraints` block: 6 assertions, conservation first (§C-1).
- [x] Numerical sanity check **RUN** — chair, methylcyclohexane, boat (three parameterisations), twist-boat, Cremer–Pople decomposition, Boltzmann across the full slider range, Eyring across the literature barrier band, kJ↔kcal on every published value, `splitNameUnit` against every output key (§A, §C-4, §C-5).
- [x] Engine bug queue consulted; 13 binding rows discharged, 1 exception FLAGged (§0).
- [x] `aha_moment` chemistry check: the PRIMARY aha is chemically TRUE (§B-3 proves the tag set inverts bond-by-bond while connectivity is fixed) and S4 demonstrates it. `misconception_watch` counters M1/M2/M3 are correct chemistry, not merely persuasive. Assessment answers verified, every distractor a real belief (§J).

**Source check.** Consulted the NCERT Class-11 Chemistry Unit-13 *Hydrocarbons* chapter index for scope (cycloalkanes → conformations of cyclohexane: chair and boat named, chair stated more stable). **No teaching method, no example problem, no figure and no prose imported.** Note for the record: the `ncert_content` table in this project holds **physics only** — I enumerated its full chapter index and there is no NCERT Chemistry corpus on disk — so the scope claim rests on the published syllabus structure, not on a stored text. Energies, A-values, geometries and van der Waals radii are cited to named primary or standard sources in §A; every geometric consequence of them was re-derived independently rather than quoted.

**Values I could not source.** None of the nine the dispatch named. Two derived numbers are stamped as mine and are *not* published: the twist-boat's closest transannular H···H (≈257 pm, versus the boat's 216 pm at the same parameterisation — offered as optional S5 colour, and **not** used in narration), and the Cremer–Pople arc-length knot positions (derivable, not measured). One value is confirmed as literature but is **model-dependent and carries a condition**: the 183 pm flagpole distance (§A-6). One literature value has a small band I resolved by decision rather than by sourcing: the boat at 29 vs 30 kJ·mol⁻¹ (kept 29, McMurry).
