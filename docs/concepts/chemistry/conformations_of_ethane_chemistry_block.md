# Chemistry block — `conformations_of_ethane`

**Author:** chemistry-author · 2026-08-10 · worktree `Viditra-organic-ethane`, branch `feat/organic-ethane`
**Input:** `docs/concepts/chemistry/conformations_of_ethane_skeleton.md` (866 lines, read in full)
**Downstream:** `json-author` → `quality-auditor`
**Status:** **LIVE ENGINE.** `scenario_type: "organic_structure"` is shipped on master (S1 substrate + S2 energy
instrument + A1 driven dihedral). The skeleton's §16 ALARM-RULE verdict is **NO renderer change**, and this
block does not reopen it.

> **I request NO engine capability anywhere in this document.** Every claim below is authored against a field
> the shipped contract implements today, verified by reading `src/lib/renderers/field_3d_renderer.ts`. Where a
> piece of chemistry I would have liked to say has no render surface, the claim is **CUT** and the cut is
> recorded in §G-3 as a limitation of what this concept teaches — never as an ask. Four claims were cut on that
> rule: the origin of the barrier (§H-1), the H···H contact distances (§H-2), the C–C bond dissociation
> enthalpy comparison (§B-4), and the room-temperature occupancy of the staggered arrangement (§B-5).

**Numerical work is RUN, not eyeballed.** Every timing, every printed string and every energy in this document
was reproduced offline from the shipped code paths (`mgRamp`, `mgSmooth01`, `orgEnergyAt`, `orgEnergyRange`,
`orgPhiAt`, `orgFx`, the HUD `lines.push` block) and is reported in §A-4 and §D-0. Two of the skeleton's own
numbers do not survive that re-run; both are in §I.

---

## §0 — Engine bug queue consultation

Queries run 2026-08-10 against `engine_bug_queue` via `src/scripts/query_engine_bug_queue.ts`
(worktree has no `.env.local`; run with `--env-file=/Users/…/Viditra/.env.local`, the main repo's).

| Query | Rows |
|---|---|
| `--owner alex:chemistry_author` | 12 |
| `--owner alex:physics_author` | 15 |
| `--owner alex:json_author` | 144 (filtered to the narration / ring / glow / plain-language classes) |
| `conformations_of_ethane` | 13 |
| `--row-type directive` | 111 (walked for the teach_* and architect rows the skeleton §0 binds) |

Per the OPEN directive `engine_bug_queue_consulted_by_scenario_name_returns_zero_because_rows_are_tagged_by_concept_id`,
the queries are stated above rather than a bare "queue consulted". The scenario-name probe (`organic_structure`)
returns 0 and is the wrong probe; the concept-id probe returns the thirteen rows the S1/S2/A1 dispatches filed.

### Rows that BIND this block, and how each is discharged

| `bug_class` | Owner / status | Discharge here |
|---|---|---|
| `prose_in_a_variable_derived_field_deletes_its_painted_value_from_scope_and_blocks_every_formula_referencing_it` | physics_author, **CRITICAL/OPEN** | `variables[].derived` is used as an EXPRESSION SLOT once only, on `E_kJ_per_mol`, and it is a real substitutable expression (`6 * (1 + cos(radians(3 * phi_deg)))`). Every other declared quantity is INDEPENDENT and carries **no `derived` key at all**. All prose lives in this markdown. Both expressions were substituted and evaluated numerically (§C-4) |
| `computed_output_name_encodes_a_symbol_no_instrument_paints_so_every_reading_is_harvested_then_discarded` | physics_author, **CRITICAL/OPEN** | `computed_outputs` holds exactly the two keys an instrument paints — `E_kJ_per_mol` → `E` (HUD `E = 12.0 kJ·mol⁻¹`) and `barrier_kJ_per_mol` → `barrier` (HUD `barrier = 12 kJ·mol⁻¹`). Nothing else is declared as a computed output, because nothing else is painted. **One declared exception**, §C-5 |
| `physics_config_constraint_block_describes_a_transform_a_later_engine_change_made_dynamic` | physics_author, MODERATE/FIXED | Every constraint in §C that states a number also states whether the number is **FIXED** or **DERIVED** |
| `concept_ships_zero_narration_glow_bindings` · `tts_sentence_glow_channel_unused_across_an_entire_subject_namespace` | physics_author / json_author, MAJOR/OPEN | **Exception declared and FLAGged — see §I-1.** `applyOrganicStructureGlow` reads ONLY `stateDef.glow_focal` and never `glowTargets`; a `tts_sentences[].glow` on this scenario is inert. Authoring one would be a false claim in the JSON, so **zero** are authored and the reason is recorded, per the row's own "partial bindings name which sentences carry none and why" |
| `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state` | json_author, MAJOR/OPEN | Moot on this scenario for the reason above; the skeleton's §0 reading of it is corrected in §I-1 |
| `state_glow_focal_dims_one_half_of_the_relation_the_state_exists_to_teach` | json_author, DIRECTIVE/OPEN | Ratified. `glow_focal` stays **null** on S1/S2/S3/S7 and `'curve'` on S4/S5/S6. `'curve'` sets `any = false` (`field_3d_renderer.ts:66329`) so nothing in the 3D scene dims — read, not assumed |
| `narration_quotes_a_point_value_of_a_noisy_instrument` · `narration_claims_a_net_average_the_visible_transient_contradicts` | chemistry_author, MAJOR/FIXED | No stochastic instrument exists (D-1: every value is closed-form in state-local t, zero noise). Every numeral spoken in §D is byte-identical to a string an instrument prints at that instant — checked sentence by sentence in §D-0 |
| `gas_box_state4_asserts_unchanged_speed_with_no_instrument` | chemistry_author, MAJOR/FIXED | Drove every "unchanged" and every quantitative claim to an instrument. **Three claims failed and were CUT**, not narrated: the barrier's origin, the C–C bond dissociation comparison and the room-temperature occupancy (§G-3). The one surviving "unchanged" claim — atoms conserved — has the HUD `atom_count` line as its instrument, on the state that makes it |
| `narration_claim_outlives_the_instrument_that_proves_it` | json_author, MAJOR/FIXED | Every sentence in §D carries an explicit `[t_start → t_end]` window, and the reading its claim depends on was evaluated across that window, not at design intent. This moved two sentences (§D-3 s2, §D-5 s2) |
| `real_world_anchor_promises_a_lever_the_sim_does_not_have` | chemistry_author, MAJOR/FIXED | The hexagonal-pencil anchor names only *a rotation with preferred resting positions separated by small barriers* — the energy curve and its minima, both rendered. It promises no lever the sandbox lacks |
| `the_most_likely_followup_question_was_undemonstrable_at_the_authored_range` | chemistry_author, MODERATE/FIXED | The first thing a teacher does in S7 is drag φ to an eclipsed value. Measured: the φ control is 0–360 step 1, and the three maxima at 0/120/240 and three minima at 60/180/300 are all reachable EXACTLY at step 1 (§C-2) |
| `narration_outruns_choreography` · `guided_state_overruns_pacing_target` | json_author, MAJOR/OPEN + FIXED | Every state's word count was divided by its own motion length. **One state fails the skeleton's own 2.75 words·s⁻¹ rule (S3) and one cannot carry the claims assigned to it (S2)** — §I-2, §I-3. Fixed by RETIMING one state, per the row's DO clause, never by splitting |
| `explore_state_surfaces_non_core_ring_symbol` · `core_ring_state_shows_value_whose_only_derivation_is_higher_ring` | json_author, MAJOR/FIXED | Both cuts re-run literally over every rendered symbol AND every unit-bearing value in §E-5 |
| `explore_state_discoverables_authored_only_as_unrendered_scene_composition_annotations` | json_author, MAJOR/OPEN | S7 has **zero narration and zero annotations**. Its discoverables are the four LIVE control rows (`view`, `phi`, `implicit_h`, `spin`) and the caption `Turn it yourself` — all rendered paths |
| `plain_language_sweep_covered_narration_and_missed_the_sibling_config_strings` | json_author, MODERATE/OPEN | The Rule-41 sweep in §E-4 enumerates string PATHS: rail titles, delta cues, `text_en`, `misconception_watch`, the formula surface, `real_world_anchor`, and the four control labels the renderer hardcodes |
| `aha_statement_exceeds_15_words` | json_author, MODERATE/FIXED | The 13-word statement is counted in §J-1 |
| `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` | physics_author, MODERATE/OPEN | S1 and S2 each carry one prerequisite clause. Both name an IDEA (a sigma bond; an sp³ carbon), never a sibling concept's apparatus, and both refer to an object on screen (the C–C bond; the carbons) |
| `derived_extremum_span_printed_as_the_named_quantity_a_textbook_reserves_for_a_different_stationary_point` | field3d_surgeon, MODERATE/FIXED | Ratified as a chemistry fact, not merely a data fact: for ethane hi − lo = 12 − 0 **is** the rotation barrier every textbook quotes, so the bare default label `barrier` is correct. Butane's row must keep its `barrier_label`; ethane's must not gain one |
| `planning_doc_counts_degenerate_enantiomeric_minima_as_distinct_conformations` | architect, MODERATE/FIXED | Counted separately everywhere in this block: **3 minima · 3 distinct maxima · 4 drawn maximum dots · 2 conformation labels**. The four-dot problem is new here and forced a narration rewording — §I-4 |
| `pcpl_radians_helper_missing` | physics_author, MODERATE/OPEN | Not the PCPL dialect, but `radians()` IS required by my one derived expression and IS in scope: `exprEval.ts:217` installs it and `cos` is in `MATH_WHITELIST` (`animation_vocabulary.ts:57`). Read, not assumed |
| `teach_visual_must_match_narration` · `teach_do_not_prespoil_a_later_reveal` · `teach_concrete_before_abstract_compare` · `teach_show_quantity_live_when_named` · `teach_reveal_synced_to_narration` | directives, OPEN | Each is checked per sentence in §D-0's window table. The pre-spoil check is the reason S4's narration names no number and S5's names no cosine |

**No exception to any `prevention_rule` is claimed except the glow row in §I-1, which is an engine limitation
measured in the shipped source, not an authoring omission.**

---

## §A — What is taken as given, and what I re-verified

### A-1 · Given, not re-derived (the 2026-08-10 sourcing pass, now stamped in the engine registry)

| Value | Status |
|---|---|
| eclipsed − staggered = **12 kJ·mol⁻¹** (2.9 kcal·mol⁻¹) | GIVEN. Kemp & Pitzer, *JACS* **59** (1937) 276; Weiss & Leroi, *JCP* **48** (1968) 962 (V₃ ≈ 1024 cm⁻¹). Band 12.0–12.5 |
| **12 kept over 12.1** | GIVEN. The H/H eclipsing increment is then exactly 12/3 = **4.0 kJ·mol⁻¹ per eclipsing pair**, which reproduces butane's 16 and 19 in the sibling concept |
| threefold profile, closed form `(V/2)(1 + cos 3φ)`; D₃d minima at 60/180/300, D₃h maxima at 0/120/240 exact by symmetry | GIVEN |
| C–C **154 pm** · C–H **109 pm** · tetrahedral **109.47°** | GIVEN |
| NCERT's **12.5** is a 3.0 kcal rounding — the outlier | GIVEN. Answer to "why does my book say 12.5"; **never a value for the sim** (§H-3) |

The engine's `ORG_ENERGY_TABLE.ethane` row carries all seven stationary knots, the source string above,
`needs_verification: false`, and **no `barrier_label`** — read at `field_3d_renderer.ts:64855-64879`. It matches
this ledger exactly. Nothing in this block asks for a data change.

### A-2 · The one value I add, with a source

| Quantity | Value | Source | Where it may appear |
|---|---|---|---|
| C–C bond dissociation enthalpy in ethane | **377 kJ·mol⁻¹** (90.2 kcal·mol⁻¹) | Blanksby & Ellison, *Acc. Chem. Res.* **36** (2003) 255, ΔH₂₉₈(CH₃–CH₃) = 377.4 ± 0.8 kJ·mol⁻¹ | **§B-4 ledger and the `barrier_vs_bond_breaking` drill-down ONLY.** Nothing renders it, so nothing narrates it |

### A-3 · Chemistry values deliberately NOT added

| Not added | Why |
|---|---|
| H···H cross-bond distances (227 pm eclipsed / 249 pm staggered) | §H-2 — sourceable, but authoring the `distance` measure would put a second instrument on S3 and would invite exactly the mechanistic claim §H-1 rules out of scope |
| van der Waals H+H contact 240 pm (Bondi 1964) | Only meaningful as the reference for the row above; falls with it |
| Boltzmann / Arrhenius forms | Above the notation ladder for this concept (§E-1) and unpainted by any instrument |
| Any state symbol on a rendered string | §B-6 — the canvas shows one molecule, and phase is a bulk property |

### A-4 · Sanity check RUN (not eyeballed) — the script and its output

Re-implemented `mgSmooth01` / `mgRamp` (`:59260`, `:59263`), `orgEnergyAt` (`:64933`), `orgEnergyRange`
(`:64955`), `orgPhiAt` (`:65288`), `orgFx` (`:65786`) and the HUD `lines.push` block (`:66264-66290`) in Python
and ran them over every authored schedule.

```
closed-form identity, 3601 samples
  max |6(1 + cos 3φ) − engine raised-cosine| = 1.78e-14 kJ·mol⁻¹

published energies (engine vs closed form vs the string the HUD prints)
  E(  0) = 12.0000 / 12.0000 → "12.0"      E(180) =  0.0000 /  0.0000 → "0.0"
  E( 30) =  6.0000 /  6.0000 → "6.0"       E(240) = 12.0000 / 12.0000 → "12.0"
  E( 45) =  1.7574 /  1.7574 → "1.8"       E(300) =  0.0000 /  0.0000 → "0.0"
  E( 60) =  0.0000 /  0.0000 → "0.0"       E(358) = 11.9671 / 11.9671 → "12.0"
  E(120) = 12.0000 / 12.0000 → "12.0"      E(360) = 12.0000 / 12.0000 → "12.0"

barrier from the registry (never sampled)
  lo = 0, hi = 12, barrier = hi − lo = 12
  HUD line prints   "barrier = 12 kJ·mol⁻¹"     (orgFx dp = 0)
  canvas bracket prints "barrier 12.0 kJ·mol⁻¹" (orgFx dp = 1, no "=")   ← see §I-5

pinned frames, from the authored schedules
  S1  pin 16300 ms → φ_authored 390.0000 → MEASURED 30.0000 → HUD "φ = 30.0°"  · handle 30
  S3  pin 13000 ms → φ 0.0000    → arc label "φ(C1–C2) = 0.0°"                 · HUD off
  S4  pin 14300 ms → φ 358.0000  → HUD "E = 12.0 kJ·mol⁻¹"   (true value 11.9671)
  S5  pin 10800 ms → φ 120.0000  → HUD "barrier = 12 kJ·mol⁻¹"
  S6  pin 10800 ms → φ 240.0000  → HUD "φ = 240.0°" and "E = 12.0 kJ·mol⁻¹"

narration arithmetic
  eclipsed − staggered = 12 − 0 = 12 kJ·mol⁻¹
  per eclipsing H/H pair = 12 / 3 = 4.0 kJ·mol⁻¹
  maxima per 360° turn = 3 (0≡360, 120, 240)  ·  minima = 3 (60, 180, 300)
  drawn maximum DOTS on the 0–360 axis = 4    ← §I-4
  conformation labels = 2  ·  period = 120°
```

**Every pinned string the skeleton §5 predicts is reproduced, with one correction (§I-5).**

---

## §B — The conservation ledger (its unusual form, and it carries the teaching claim)

**There is no reaction in this concept — and that is not a formality to be waived. It is the ledger, and it is
the direct counter to misconception M2 ("staggered and eclipsed are different compounds").** The architect's
§14(c) declares the balanced-equation ledger "not applicable and deliberately empty". I disagree with the word
*empty*: what is absent is an *equation*, not the *conservation argument*. The argument below is what STATE_1
teaches, and quality-auditor's chemistry correctness gate should audit against it. (§I-6.)

### B-1 · The identity ledger — one molecule, at every φ

| Quantity | φ = 0° (eclipsed) | φ = 60° (staggered) | φ = 137° (nothing) | φ = 240° (eclipsed) | **Every φ** |
|---|---|---|---|---|---|
| carbon atoms | 2 | 2 | 2 | 2 | **2** |
| hydrogen atoms | 6 | 6 | 6 | 6 | **6** |
| molecular formula | C₂H₆ | C₂H₆ | C₂H₆ | C₂H₆ | **C₂H₆** |
| C–C sigma bonds | 1 | 1 | 1 | 1 | **1** |
| C–H sigma bonds | 6 | 6 | 6 | 6 | **6** |
| total bonds drawn | 7 | 7 | 7 | 7 | **7** |
| connectivity (adjacency list) | C1–C2, C1–H×3, C2–H×3 | identical | identical | identical | **identical** |
| bond order, C–C | 1 | 1 | 1 | 1 | **1** |
| hybridisation, both carbons | sp³ | sp³ | sp³ | sp³ | **sp³** |
| valence electrons | 14 | 14 | 14 | 14 | **14** (2×4 + 6×1) |
| bonding pairs / lone pairs | 7 / 0 | 7 / 0 | 7 / 0 | 7 / 0 | **7 / 0** |
| formal charge on every atom | 0 | 0 | 0 | 0 | **0** |
| **total charge** | **0** | **0** | **0** | **0** | **0** |
| unpaired electrons | 0 | 0 | 0 | 0 | **0** |
| oxidation number, C | −3 | −3 | −3 | −3 | **−3** (H = +1; 2(−3) + 6(+1) = 0 ✔) |

**Rendered evidence:** the HUD `atom_count` line prints `C 2 · H 6`, recomputed every frame by counting
`geom.atoms` (`field_3d_renderer.ts:66266`) — it is a live count of the drawn scene, not a static caption. It is
authored on S1 (through a full 360° turn) and on S2. That is the instrument, and it is why the M2 counter is a
claim the sim carries with sound off.

### B-2 · What changes and what does not — the whole concept in two rows

| | |
|---|---|
| **Changes with φ** | the dihedral angle φ, and therefore the torsional energy E(φ) |
| **Does not change with φ** | molecular formula · connectivity · bond count · bond order · hybridisation · charge · oxidation numbers · the identity of the compound |

Every row of the right-hand column is a conservation statement, and together they are the balanced-equation
ledger's job done in the only form this concept has: **there is no LHS and no RHS, because there is only one
side.**

### B-3 · The classification, in the sentence an exam wants

Same molecular formula **and** same connectivity **and** interconvertible by rotation about a single bond, with
no bond broken → **conformers** (conformational isomers). They are **not** constitutional isomers (those differ
in connectivity, and the table above shows connectivity is identical) and **not** configurational stereoisomers
(those need a bond broken to interconvert). At room temperature the interconversion is far faster than any
separation, so **"eclipsed ethane" is not a substance that can be bottled** — it is a moment in a rotation.

### B-4 · Why the barrier is not a bond breaking — with a number

| | kJ·mol⁻¹ |
|---|---|
| rotation barrier, eclipsed − staggered | **12** |
| C–C bond dissociation enthalpy in ethane (§A-2) | **377** |
| ratio | **31.4×** — the barrier is about **3 %** of the energy needed to break the bond |

**CUT from narration.** Nothing on canvas renders 377, and a comparative number with no instrument is a claim
the sim does not carry (the `gas_box_state4` rule). It lives here and in the `barrier_vs_bond_breaking`
drill-down cluster (§F). No narration line, caption, HUD line or formula surface may mention bond breaking.

### B-5 · Where the molecule actually spends its time — and why the sim does not say so

Classical Boltzmann over the torsional coordinate at 298.15 K (RT = 2.479 kJ·mol⁻¹, barrier/RT = 4.84):

```
fraction of time within ±30° of a staggered minimum  = 95.4 %
fraction of time within ±20° of an eclipsed maximum  =  1.56 %
exp(−12/RT)                                          =  7.9 × 10⁻³
```

**CUT from narration.** The shipped contract's `population` HUD line is DEFERRED to dispatch A2
(`ORG_HUD_LINES_DEFERRED`, `:64714`), so **no instrument in this sim shows occupancy**. Therefore no line may
say "the molecule spends most of its time staggered", and — the trap the founder named — **no line may say the
molecule "prefers" staggered.** What the narration says instead is exactly what the picture proves: *staggered
is the low point of the curve, eclipsed is the high point, and the difference is 12 kJ·mol⁻¹.* The occupancy
statement lives in the drill-down (§F, `why_eclipsed_is_higher` phrase 5's answer territory), with its model
assumption attached.

### B-6 · State symbols — declared, not omitted

Ethane is **C₂H₆(g)** at room temperature and pressure, and that is the substance identity for this ledger. It
is **deliberately not rendered anywhere**: the canvas shows one molecule, and a phase label on a single molecule
would be a category error (phase is a bulk property). If a later state ever shows a sample rather than a
molecule, the symbol becomes mandatory. Until then, zero state symbols is the correct answer, not an omission.

### B-7 · What the sim's geometry holds fixed that the real molecule does not — the overclaim guard

`orgBuildGeometry` draws C–C at a constant `ORG_CC_A = 1.54` Å, C–H at a constant 1.09 Å, and every CH₃ as an
exact `mgIdealDirs(4)` tetrahedron at **every** φ (`:64663-64667`). The real molecule relaxes slightly as it
turns:

| Real molecule, eclipsed vs staggered | Rendered by the sim? |
|---|---|
| C–C lengthens by ≈ **0.01 Å (1 pm)** at the eclipsed maximum | **No** — the sim's C–C is constant |
| H–C–H angles and C–H lengths relax by a fraction of a degree / pm | **No** — the sim holds the exact tetrahedron |

**Consequence for narration, and it is a hard one.** No line may claim *"nothing about the molecule changes
except the angle"* or *"the bond length never changes"* as a statement about the real molecule, because the
first is false by 1 pm and the second is a property of the drawing. The true claim, which is what §D actually
narrates, is: **no bond is broken, no bond is made, and the connectivity never changes.** That is exactly true
of both the drawing and the molecule.

---

## §C — `engine_config`

Lands in the concept JSON's `physics_engine_config` field (legacy field name, subject-neutral shape —
`CHEMISTRY_ARCHITECTURE.md` §3).

### C-1 · The block

```json
"physics_engine_config": {
  "variables": {
    "phi_deg": {
      "name": "dihedral angle about C1-C2, measured C1H1-C1-C2-C2H1",
      "unit": "deg", "min": 0, "max": 360, "default": 60
    },
    "E_kJ_per_mol": {
      "name": "torsional energy above staggered",
      "unit": "kJ/mol", "min": 0, "max": 12, "default": 0,
      "derived": "6 * (1 + cos(radians(3 * phi_deg)))"
    },
    "barrier_kJ_per_mol": {
      "name": "rotation barrier, eclipsed minus staggered",
      "unit": "kJ/mol", "constant": 12
    },
    "V3_kJ_per_mol": {
      "name": "threefold torsional constant V3",
      "unit": "kJ/mol", "constant": 12
    },
    "n_fold": {
      "name": "rotor symmetry number of a methyl group",
      "unit": "", "constant": 3
    },
    "period_deg": {
      "name": "period of the torsional energy profile",
      "unit": "deg", "constant": 120
    },
    "eclipsing_increment_kJ_per_mol": {
      "name": "eclipsing strain per H/H pair",
      "unit": "kJ/mol", "constant": 4
    },
    "d_CC_pm": { "name": "C-C bond length", "unit": "pm", "constant": 154 },
    "d_CH_pm": { "name": "C-H bond length", "unit": "pm", "constant": 109 },
    "theta_tet_deg": { "name": "tetrahedral bond angle", "unit": "deg", "constant": 109.47 },
    "spin_deg_per_s": {
      "name": "view spin rate", "unit": "deg/s", "min": 0, "max": 40, "default": 0
    }
  },
  "computed_outputs": {
    "E_kJ_per_mol": { "formula": "6 * (1 + cos(radians(3 * phi_deg)))" },
    "barrier_kJ_per_mol": { "formula": "12" }
  },
  "formulas": {
    "torsional_profile": "6 * (1 + cos(radians(3 * phi_deg)))",
    "barrier_from_profile": "max(E) - min(E)"
  },
  "constraints": [
    "atoms are conserved at every phi: C 2 and H 6 on every frame, no bond made and no bond broken (FIXED)",
    "connectivity is invariant at every phi: exactly 1 C-C bond and 6 C-H bonds, same adjacency (FIXED)",
    "total charge is 0 at every phi; every formal charge is 0 and every carbon oxidation number is -3 (FIXED)",
    "E(phi) = 6(1 + cos 3phi) kJ/mol with phi in degrees, E = 0 at staggered (FIXED, published table; the engine never computes an energy)",
    "barrier = max(E) - min(E) = 12 - 0 = 12 kJ/mol (DERIVED from the published stationary rows, not sampled)",
    "phi is reported wrapped into [0, 360): an authored 390 reads 30 on the HUD and on the slider handle (FIXED)"
  ]
}
```

Six constraints, conservation first, each stating FIXED or DERIVED.

### C-2 · The φ control range — a decision, measured

`slider_controls.phi = { min: 0, max: 360, step: 1, default: 60 }` (the skeleton's §9). Measured against the
question a teacher asks first in the sandbox — *"show me eclipsed"* — every stationary point of the curve is
reachable **exactly** at step 1: maxima 0, 120, 240, 360 and minima 60, 180, 300 are all integers. A step of 2
or 5 would still hit them; a step of 7 would not. Step 1 is the decision, not an inherited default. `default: 60`
puts the sandbox at staggered, the molecule's own `default_pose`.

`spin` is 0–40 °/s, default 0. It is authored 0 in every guided state (Rule 32b) and exposed only in S7.

### C-3 · `E_kJ_per_mol` is DERIVED here, unlike its cyclohexane sibling

In `cyclohexane_chair_flip` the energy was declared INDEPENDENT with **no** `derived` key, because a
seven-waypoint pucker profile is a table lookup no expression reproduces. **Ethane is the opposite case and the
difference is the whole point of §A-1:** the raised-cosine interpolation over evenly spaced alternating knots
*is* `6(1 + cos 3φ)`, verified to 1.78 × 10⁻¹⁴ over 3601 samples. So the expression is not an approximation of
the drawn curve — it is the drawn curve, and declaring it `derived` gives THE CALCULATOR a real check instead of
a skipped one.

### C-4 · The two expressions, substituted and evaluated

`radians` is installed in the evaluator scope (`exprEval.ts:217`) and `cos` is in `MATH_WHITELIST`
(`animation_vocabulary.ts:57`). Both expressions are pure ASCII and parse as JS.

| φ_deg | `6 * (1 + cos(radians(3 * phi_deg)))` | engine `orgEnergyAt` | HUD string |
|---|---|---|---|
| 0 | 12.000000 | 12.000000 | `E = 12.0 kJ·mol⁻¹` |
| 30 | 6.000000 | 6.000000 | `E = 6.0 kJ·mol⁻¹` |
| 60 | 0.000000 | 0.000000 | `E = 0.0 kJ·mol⁻¹` |
| 120 | 12.000000 | 12.000000 | `E = 12.0 kJ·mol⁻¹` |
| 240 | 12.000000 | 12.000000 | `E = 12.0 kJ·mol⁻¹` |
| 358 | 11.967082 | 11.967082 | `E = 12.0 kJ·mol⁻¹` |

`barrier_from_profile` is documentation of a DERIVED quantity, not a per-frame expression: `orgEnergyRange`
takes hi − lo over the **published stationary rows** (`:64955`), never over samples. The `computed_outputs`
entry is therefore the literal `12`, which is what the instrument prints.

### C-5 · One declared naming exception

`phi_deg` is **not** in `computed_outputs`, deliberately. `splitNameUnit("phi_deg")` gives the symbol `phi`,
while the instrument paints the Unicode `φ`, and the numeric validator has no Greek↔Latin mapping
(`deriveAssertions.ts:59-66` normalises Ω and µ only). Declaring it would produce a symbol claim nothing can
match. The variable is still declared — it is the input every expression reads — but it is not asserted as a
painted output. THE CALCULATOR is ADVISORY (CLAUDE.md §6) and every number in this scenario is engine-published
rather than concept-computed, so nothing is lost. **FLAGged to `quality_auditor`.**

---

## §D — Within-state motion timeline, per-state control spec, and narration

Every branch below is a pure function of the state clock `PM_simTimeMs` (Rule 26). The scenario is closed-form
in state-local t with no integrator (contract note D-1), so every frame is byte-reproducible under a
`SET_TIME_FREEZE` pin.

### D-0 · Pacing, and the sentence-window audit

Word counts, the motion each state actually runs, and the resulting rate. The skeleton's rule is **≤ 2.75
words·s⁻¹ of that state's own motion.**

| State | Motion ends | Words | words·s⁻¹ | Skeleton budget | Verdict |
|---|---|---|---|---|---|
| S1 | 15700 ms | **39** | 2.48 | 38–42 | ✔ |
| S2 | 13700 ms **(retimed, §I-3)** | **35** | 2.55 | 26–29 @ 10700 ms | ✔ after retime; **fails at the authored 10700 ms** |
| S3 | 12400 ms | **33** | 2.66 | 32–36 | ✔ at 33; the budget's own **upper bound of 36 is unreachable** (§I-2) |
| S4 | 13700 ms | **36** | 2.63 | 34–37 | ✔ |
| S5 | 10200 ms | **28** | 2.75 | 26–28 | ✔ |
| S6 | 10200 ms | **26** | 2.55 | 26–28 | ✔ |
| S7 | never (Rule 37) | **0** | — | 0 / open | ✔ |

Every guided state is inside Rule 31a's 25–55 EN words. Every state's motion outruns its narration, never the
reverse. `narration_outruns_choreography`'s probe (`choreo_end < 0.7 × words/2.8 × 1000`) passes everywhere with
margin.

**Sentence-window audit — the reading each claim depends on, measured across the window it is spoken in.**

| Sentence | Window | Claim | Instrument, over that window |
|---|---|---|---|
| S1 s3 | 8.0 → 13.6 s | two carbons, six hydrogens | HUD `C 2 · H 6`, constant for the whole sweep — one shape, no qualifier |
| S3 s1 | 0 → 4.3 s | φ starts at 60° | arc label `φ(C1–C2) = …°` reads 60.0 → 48.1 over the window; the claim is anchored at the start and is not a live point value |
| S3 s3 | 6.4 → 12.1 s | φ falls to 0°, hydrogens line up | arc label 33.2 → 0.1, closing to `0.0°` at 12.4 s. A process claim that completes after the sentence — the correct direction |
| S4 s3 | 6.5 → 11.1 s | falls three times, climbs three times | the rider has crossed the 120 peak (5.75 s), the 180 valley (7.22 s), the 240 peak (8.70 s) and the 300 valley (10.38 s) inside this window; the full claim completes at 13.7 s |
| S5 s2 | 3.2 → 7.2 s | 12 kJ·mol⁻¹ | bracket standing since ≈ 820 ms (`rev > 0.98`) and HUD `barrier = 12 kJ·mol⁻¹` constant. Both hold across the whole window |
| S6 s3 | 7.2 → 10.1 s | this peak matches the one just before | rider climbs to the 240 maximum, arriving at 10.2 s; both the 120 and 240 dots are labelled `eclipsed` on screen |

**Rule 32a (cause before effect) per state.** S3: the arc is fully drawn at 1000 ms and its label appears at
**673 ms**, while the hydrogens do not begin moving until 900 ms — the instrument precedes the change it
measures by ≈ 0.3 s of visible presence and 1.0 s of readable label. S4: the sweep and the reveal share
`at_ms 700` deliberately — the curve is the *record* of the turn, so the pen tip must neither lead nor lag
(both run on the same `mgRamp`, so `est.x` equals `xEnd` identically). S5/S6: the curve and bracket settle at
≈ 820 ms, the rider does not move until 1200 ms — a **380 ms** gap. S1/S2: single-cause states.

### D-1 · `STATE_1 — The C–C bond turns` · core · `manual_click` · pin 16300 ms

**Archetype** `bond-axis-turn` — the molecule turns about its own C–C axis in a fixed oblique 3D view.
**Delta cue (on canvas, ≤5 words)** `The C–C bond turns`
**Rail title** `The C–C bond turns`
**Controls:** `phi` shown but **disabled** (`static_readouts: [{id:"phi", min_ring:"core"}]`); the handle tracks
the measured, wrapped dihedral. No other row. `spin_rate` absent → 0.

| t (ms) | What animates | Driven by |
|---|---|---|
| 0 → 700 | nothing moves; the molecule holds the staggered pose at φ = 60°. HUD `C 2 · H 6` and `φ = 60.0°` are already up | `mgRamp` holds `phi_from` until `phi_at_ms` |
| 700 → 15700 | φ sweeps 60° → 390° on a smoothstep ramp. The eight atoms rotate about the C1–C2 axis; the camera holds `az 180, el 6, dist 9`. The HUD φ counts 60.0 → 359.9 → 0.0 → 30.0 and **the wrap is visible**; the disabled slider handle tracks it and reads 30, never clamping at 360 | `phi_deg` (the driven dihedral) |
| passing marks | φ = 120 at 4781 ms · 180 at 6821 · 240 at 8655 · 300 at 10550 · **360 at 12910** (HUD reads `0.0°`) · 390 at 15700 (HUD `30.0°`) | measured, not authored |
| 15700 → 16300 | settled; the pinned frame is φ = 30°, one third of the way off staggered — visibly not frame 0 | pin cushion |

**Narration `text_en` (39 words).**

1. `[0.0 → 5.1 s]` **"A hexagonal pencil rolls to any position, yet it rests on a flat face."** (14)
2. `[5.1 → 8.7 s]` **"Ethane turns the same way about its C–C sigma bond."** (10)
3. `[8.7 → 14.1 s]` **"The angle φ measures the turn. Two carbons and six hydrogens, through the whole turn."** (15)

*Why these words.* Sentence 1 is the anchor's first of exactly two touches (§6 of the skeleton). Sentence 2
carries the architect's prerequisite patch — it names the *idea* of a sigma bond, and the C–C bond it names is
the object on screen. Sentence 3 is the M2 counter and it is bound to the `atom_count` instrument.
**Forbidden phrasings avoided, as the Pass-1 block requires:** "freely", "without resistance", "nothing stops
it" appear nowhere — the state shows an effortless-looking turn on purpose, and STATE_4 breaks it.

**`misconception_watch` (M2).** belief: *"Staggered and eclipsed are different compounds."* · visual_counter:
*the HUD prints `C 2 · H 6` for the whole turn and no bond ever breaks; one molecule becomes both arrangements
without interruption* · one_line_fix: **"Staggered and eclipsed are the same molecule at different points of
one rotation."**

### D-2 · `STATE_2 — Look down the C–C bond` · core · `manual_click` · pin **14300 ms** (retimed, §I-3)

**Archetype** `sight-line-collapse` — the camera glides onto the bond axis while the molecule holds its pose.
**Delta cue** `Now looking down the bond` · **Rail title** `Look down the C–C bond`
**Controls:** `view` shown but **disabled**, reading "Along the bond". No other row.

| t (ms) | What animates | Driven by |
|---|---|---|
| 0 | `camera_steps[0]` with `ease_ms 0` snaps the camera back to S1's exact pose (`az 180, el 6, dist 9`), so the state opens on the picture the student just left — no teleport | camera schedule |
| 0 → 1200 | held. The molecule sits static at `pose: "staggered"`; HUD shows `bond = C1–C2`, `pose = staggered`, `C 2 · H 6` | static pose |
| 1200 → 13700 | the camera eases to the SOLVED sight pose `az 180.0000, el −35.2644, dist 8`. The two carbons close together on screen and the six C–H bonds open out into the six-spoke pattern. **The molecule does not move** (Rule 32b: the camera is the taught variable here) | `camera_steps[1]`, `ease_ms 12500` |
| whole state | the Newman rim convention is live throughout (`newman: true` is per-state, not time-gated), so C2 is drawn as a circle from t = 0. Declared: for ~12 s that reads as a small ring at C2 in an oblique view — the convention arriving early, not an error | engine convention |
| 13700 → 14300 | settled on-axis; the pinned frame is the finished Newman projection | pin cushion |

**Narration `text_en` (35 words).**

1. `[0.0 → 4.6 s]` **"The camera moves onto the bond axis. This view is the Newman projection."** (13)
2. `[4.6 → 9.3 s]` **"The front carbon is the centre point; the back carbon is the circle."** (13)
3. `[9.3 → 12.5 s]` **"Each sp³ carbon puts its three hydrogens 120° apart."** (9)

*Why these words.* Sentence 2 is the M3 counter, and it is the one sentence in the concept that must be
unambiguous: it names which drawn thing is which carbon. Sentence 3 is the architect's second prerequisite
patch, and it also answers the question the picture raises — *why six spokes at even angles* — with the fact the
projection makes visible: on a tetrahedral carbon the three hydrogens project 120° apart. It lands at 9.3 s,
when the camera is nearly on-axis and the spokes are readable; earlier, the claim would be spoken over a
picture that does not yet show it.

**`misconception_watch` (M3).** belief: *"A Newman projection is two overlapping Y shapes; I cannot tell front
from back."* · visual_counter: *the camera travels from the familiar 3D view onto the bond axis over 12.5
seconds, so the confusing symbol is built in front of the student rather than presented finished* ·
one_line_fix: **"The centre point is the front carbon; the circle is the back carbon."**

### D-3 · `STATE_3 — Staggered and eclipsed` · core · `manual_click` · pin 13000 ms

**Archetype** `arc-closes-to-zero` — the drawn dihedral arc shrinks to nothing as the hydrogens align.
**Delta cue** `Hydrogens line up: eclipsed` · **Rail title** `Staggered and eclipsed`
**Controls:** `phi` shown but **disabled**; the handle tracks. `show_hud: false` — the arc's self-identifying
label `φ(C1–C2) = …°` is the only φ string on screen (the unlabelled-instrument scar).

| t (ms) | What animates | Driven by |
|---|---|---|
| 300 → 1000 | the torsion arc draws in between `C1H1` and `C2H1`, built from the two substituent directions projected perpendicular to the C–C bond. Its label appears at **673 ms** (`rev > 0.55`) reading `φ(C1–C2) = 60.0°` | `measure[0].at_ms/ramp_ms` |
| 900 → 12400 | φ sweeps 60° → 0° on a smoothstep ramp. The three front hydrogens rotate onto the three back ones; the arc narrows continuously and its label counts down | `phi_deg` |
| passing marks | φ = 45.0 at 4653 ms · 30.0 at 6650 · 15.0 at 8647 · 5.0 at 10359 · 1.0 at 11520 · 0.0 at 12400 | measured |
| 12400 → 13000 | settled at eclipsed. **The state stops AT eclipsed and does not continue back to staggered** — the beat does not undo its own claim | pin cushion |

**Narration `text_en` (33 words).**

1. `[0.0 → 4.3 s]` **"The angle φ starts at 60°, with the hydrogens between each other."** (12)
2. `[4.6 → 6.4 s]` **"This is the staggered arrangement."** (5)
3. `[6.4 → 12.1 s]` **"As the bond turns, φ falls to 0° and front and back hydrogens line up: eclipsed."** (16)

*Why these words.* Sentence 1 is anchored ("starts at"), so it is not a live point value that the sweep
falsifies mid-sentence. Sentence 3 is a process claim whose window is spanned by the process. The two names —
staggered, eclipsed — are the state's whole content and each is spoken exactly once, beside the picture that
defines it (Rule 25 co-location).

**No `misconception_watch`** — a straightforward naming beat.

### D-4 · `STATE_4 — Turning costs energy` · core · **PRIMARY AHA** · `manual_click` · pin 14300 ms

**Archetype** `turn-draws-the-curve` — the rotation is the pen and the rider is the drawing tip.
**Delta cue** `Turning draws an energy curve` · **Rail title** `Turning costs energy`
**Controls:** `phi` shown but **disabled**; the handle tracks. `glow_focal: "curve"`.

| t (ms) | What animates | Driven by |
|---|---|---|
| 0 → 700 | held at φ = 0° (eclipsed). The graph panel is present but undrawn | `mgRamp` hold |
| 700 → 13700 | φ sweeps 0° → 358° **and** the curve reveals over the identical window, so the rider sits exactly at the drawing tip. The molecule turns in the Newman view while the curve grows left to right beneath it. HUD `E = … kJ·mol⁻¹` runs live: 12.0 → 0.0 → 12.0 → 0.0 → 12.0 → 0.0 → 12.0 | `phi_deg`; `energy.reveal_*` on the same `mgRamp` |
| passing marks | φ = 60 (E 0.0) at 4079 ms · 120 (12.0) at 5748 · 180 (0.0) at 7224 · 240 (12.0) at 8704 · 300 (0.0) at 10384 · 358 (11.97 → prints 12.0) at 13700 | measured |
| 13700 → 14300 | settled; the full curve with the rider at the right-hand end | pin cushion |

**Narration `text_en` (36 words).**

1. `[0.0 → 2.9 s]` **"The same turn now draws an energy curve."** (8)
2. `[2.9 → 5.8 s]` **"The moving dot is this molecule's own angle."** (8)
3. `[6.5 → 11.1 s]` **"In one full turn the curve falls three times and climbs three times."** (13)
4. `[11.3 → 13.8 s]` **"Rotation about a single bond costs energy."** (7)

*Why these words.* Sentence 2 is the state's structural claim — the curve is a record of the turning, not a
separate fact — and it is true by construction (`est.x` is `orgMeasuredPhi` on the built geometry, one call
site). Sentence 3's count is deliberate and is **not** "three peaks": the drawn axis carries FOUR maximum dots,
because 0° and 360° are the same arrangement seen at the start and the end of one turn. Three falls and three
climbs is what a student traces on the screen dot for dot, **and** it delivers the exam answer (the energy
reaches a maximum three times in one turn) without contradicting the picture. §I-4. Sentence 4 is the M1
counter, in the student's own vocabulary.

**No number is spoken.** The graph's y-axis ticks carry the numerals 0 and 12 under every preset (they are the
axis of a core-ring graph), but the quantitative CLAIM — that 12 is the barrier — belongs to STATE_5 and is not
pre-spoiled here. `teach_do_not_prespoil_a_later_reveal`, satisfied literally.

**`misconception_watch` (M1).** belief: *"Rotation about a single bond is completely free; it costs nothing."*
· visual_counter: *the identical rotation the student has already watched twice now draws a curve that rises
and falls; the contrast is structural, not staged, and nothing pauses to ask a question* · one_line_fix:
**"Single bonds turn, but not freely — the energy rises and falls as they turn."**

### D-5 · `STATE_5 — The barrier is 12 kJ·mol⁻¹` · **extended** · `manual_click` · pin 10800 ms

**Archetype** `peak-crossing` — the rider descends into one minimum and climbs the next maximum beneath a
standing bracket.
**Delta cue** `The barrier: 12 kJ·mol⁻¹` · **Rail title** `The barrier is 12 kJ·mol⁻¹`
**Controls:** `phi` shown but **disabled**, `min_ring: "extended"`. `glow_focal: "curve"`.

| t (ms) | What animates | Driven by |
|---|---|---|
| 0 → 900 | the complete curve reveals in one short sweep (`reveal_at_ms 0`, `reveal_ramp_ms 900`). At **≈ 820 ms** (`rev > 0.98`) the yellow barrier bracket snaps up, spanning the published lo = 0 to hi = 12. HUD reads `barrier = 12 kJ·mol⁻¹` | `energy.reveal_*` |
| 900 → 1200 | held. The curve and its bracket stand; nothing else has moved yet — a **380 ms** readable gap before the rider starts (Rule 32a) | — |
| 1200 → 5700 | the rider descends from the eclipsed maximum at φ = 0 into the staggered minimum at φ = 60 (E 12.0 → 0.0), the molecule turning with it | `phi_deg` |
| 5700 → 10200 | the rider climbs from φ = 60 back to the eclipsed maximum at φ = 120 (E 0.0 → 12.0) — the traverse the bracket measures | `phi_deg` |
| 10200 → 10800 | settled at the second peak beneath the standing bracket | pin cushion |

**Narration `text_en` (28 words).**

1. `[0.0 → 2.9 s]` **"The bracket runs from staggered up to eclipsed."** (8)
2. `[3.2 → 7.2 s]` **"That height is the rotation barrier: 12 kJ·mol⁻¹ of torsional strain."** (11)
3. `[7.4 → 10.3 s]` **"It is the edge a rolling pencil lifts over."** (8)

*Why these words.* Sentence 1 describes the bracket, which is standing and unchanging for the whole state — so
the claim never outlives its instrument even though the rider is descending while it is spoken. Sentence 2 does
three jobs in eleven words: it speaks the printed word `barrier`, it attaches the exam term **torsional
strain**, and it states the number exactly as the HUD prints it. It is also the only dual-label in the concept
(§E-2). Sentence 3 is the anchor's second and last touch (§6 of the skeleton — two touches, not a running
joke), and it closes the loop opened in STATE_1 sentence 1.

*Chemistry check on sentence 2.* "12 kJ·mol⁻¹ of torsional strain" is exact: with staggered taken as zero, the
eclipsed conformation carries 12 kJ·mol⁻¹ of torsional strain and that same 12 is the barrier to rotation.
The two names are the same number **for ethane**, which is why they can share a sentence here and must not in
butane (where hi − lo = 19 is the syn barrier, not the interconversion barrier).

**No `misconception_watch`** — a straightforward quantitative beat.

### D-6 · `STATE_6 — One formula for the curve` · **advanced** · `manual_click` · pin 10800 ms

**Archetype** `period-repeat` — the rider traverses the NEXT identical peak while the formula stands.
**Delta cue** `Same peak every 120°` · **Rail title** `One formula for the curve`
**Controls:** `phi` shown but **disabled**, `min_ring: "advanced"`. `glow_focal: "curve"`.
**Formula surface (the one and only in the concept):** `E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹`

| t (ms) | What animates | Driven by |
|---|---|---|
| 0 → 900 | the complete curve reveals; the formula surface is up from t = 0, re-anchored to the top-left because the graph owns the bottom-left (`:65934`). **No bracket** (`show_barrier: false`) | `energy.reveal_*` |
| 900 → 1200 | held; a readable gap before the rider moves | — |
| 1200 → 5700 | the rider descends from the eclipsed maximum at φ = 120 into the staggered minimum at φ = 180. HUD `φ` counts 120.0 → 180.0, `E` counts 12.0 → 0.0 | `phi_deg` |
| 5700 → 10200 | the rider climbs to the eclipsed maximum at φ = 240 — a region of the curve no earlier state has occupied | `phi_deg` |
| 10200 → 10800 | settled at φ = 240; HUD `φ = 240.0°`, `E = 12.0 kJ·mol⁻¹` | pin cushion |

**Narration `text_en` (26 words).**

1. `[0.0 → 2.4 s]` **"One formula covers the whole curve."** (6)
2. `[2.7 → 7.0 s]` **"The 3 in cos 3φ makes the whole profile repeat every 120°."** (12)
3. `[7.2 → 10.1 s]` **"This peak matches the one just before it."** (8)

*Why these words.* The state's job is the closed form and the period, and both are named once. **Sentence 1
deliberately does not recite the equation:** it is standing on the ONE formula surface, in `'Cambria Math'`, big
and readable (Rule 34b). Reading `6(1 + cos 3φ) kJ·mol⁻¹` aloud would spend seven of twenty-six words restating
the thing the student is already looking at, and it is clumsy spoken. Sentence 2 ties the symbol the student can
see on that surface (the 3) to the number the axis can be measured against (120°) — the notation ladder's one
legitimate step up. Sentence 3 is the picture: the molecule at 240° looks identical to the molecule at 120°,
which is the state's whole point rather than a repetition fault.

**Degrees, not radians, and the axis says so.** The x-axis prints `φ (°)`. (The period is 120° under either
convention, so no ambiguity reaches a rendered number — but the axis label is the disambiguation and must
not be removed.)

**No `misconception_watch`.**

### D-7 · `STATE_7 — Turn it yourself` · core · `interaction_complete` · continuous (Rule 37)

**Archetype** `free-explore` — φ free-runs until a teacher seizes the slider.
**Delta cue** `Turn it yourself` · **Rail title** `Turn it yourself` · `glow_focal`: none
**Controls: all four, LIVE** — `view`, `phi`, `implicit_h`, `spin`.

| t | What animates | Driven by |
|---|---|---|
| 0 → 600 ms | the curve reveals | `energy.reveal_*` |
| 0 → ∞ | φ free-runs at **24 °/s** from the staggered default 60°, wrapping forever. One full turn takes **15.0 s**; one 120° period takes **5.0 s**. HUD `φ` and `E` run live; the rider circulates over the curve | `torsion.continuous: 24` |
| any trusted drag | the φ slider seizes the coordinate for the rest of the state; the molecule, the HUD and the rider all follow the handle | Rule 39b drag-seize |

**Narration: NONE (0 sentences).** Rule 31, explore-last, 0/open. The discoverables are the four live control
rows and the caption — all rendered paths, no annotations (the `explore_state_discoverables` row).

**Verified free-run values** (24 °/s from 60°): t = 1 s → φ 84.0, E 4.1 · t = 5 s → φ 180.0, E 0.0 · t = 7.5 s →
φ 240.0, E 12.0 · t = 15 s → φ 60.0, E 0.0 (one full turn, back to the start).

**What a teacher will do, and whether it works.** Drag φ to 0, 120 or 240 → the hydrogens line up and E reads
12.0. Drag to 60, 180 or 300 → staggered, E reads 0.0. Switch `view` to "Standard" → the oblique 3D view returns
(with the disc-fusion caveat the skeleton §15 recorded as a scar candidate — no teaching claim rests on it).
Uncheck `Show hydrogens` → the two carbons and the C–C bond alone. Raise `Turn speed` → the whole molecule spins
about the view axis, on top of the dihedral free-run.

---

## §E — Notation and dialect ladder (Rule 38c/38d, chemistry form)

### E-1 · The ladder — what may appear where

| Ring | States | Notation permitted | Actually used |
|---|---|---|---|
| `core` | S1, S2, S3, S4, S7 | integers, angles in degrees, a named difference, an axis with numerals | `φ`, `°`, `C 2 · H 6`, `E`, `kJ·mol⁻¹`, the axis numerals 0 and 12 |
| `extended` | S5 | the above + one arithmetic difference stated as a number | `barrier = 12 kJ·mol⁻¹`; the words *rotation barrier* and *torsional strain* |
| `advanced` | S6 | the above + one trigonometric closed form | `E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹` |

**Below the advanced ring there is no cosine anywhere** — not in narration, not in a caption, not on a HUD line.
**Nowhere in the concept, at any ring, is there:** a logarithm, a derivative or integral, an exponential, a
Boltzmann or Arrhenius form, an equilibrium constant, or any quantum notation. The occupancy arithmetic of §B-5
uses an exponential and is therefore drill-down text only, never a rendered string. Nothing needed to be
smuggled and nothing is FLAGged as needing to be.

### E-2 · Dialect dual-labels (Rule 38d) — once, then bare

| Term | Board variation | Handling |
|---|---|---|
| **barrier / torsional strain** | boards say "energy barrier to rotation", "rotational barrier", "torsional strain", "torsional energy" | **Dual-labelled once**, in S5 sentence 2: *"the rotation barrier: 12 kJ·mol⁻¹ of torsional strain"*. The canvas prints only `barrier`, the neutral word every board accepts |
| **dihedral angle / torsion angle** | CBSE/NCERT and most Indian texts say *dihedral angle*; some UK/IB sources say *torsion angle* | The sim renders only `φ` and `φ(C1–C2)`, which no board disputes, and narration says *"the angle φ"*. The two words appear together exactly once, in the `newman_from_a_3d_model` drill-down. **Deliberately not spent from the guided word budget** |
| **conformation / conformer / conformational isomer** | interchangeable across boards | Narration uses neither word; it uses *arrangement*, which needs no gloss. The technical trio lives in the drill-down and in the B-3 ledger sentence a teacher may read out |
| **staggered / eclipsed** | universal | bare, no gloss needed |
| **Newman projection** | universal; *sawhorse* is the sibling representation | *Newman projection* is named in S2. *Sawhorse* is never rendered, and its comparison is a whole drill-down cluster |
| **sigma bond** | universal (σ) | Written as the words **"sigma bond"** in `text_en`, not as the glyph: Rule 30 expands bare symbols to their spoken name in narration, and the canvas carries no σ anywhere |

### E-3 · IUPAC-first naming

**Ethane** is both the IUPAC name and the only common name; there is nothing to dual-label. The atom ids the
engine draws (`C1`, `C2`, `C1H1`…) are locants, not names, and the C1/C2 numbering is the engine's own —
consistent with IUPAC lowest-locant numbering for a two-carbon chain by symmetry. No trivial name, no
abbreviation, no formula shorthand (`Me`, `Et`) appears anywhere.

### E-4 · Rule 41 sweep, by string PATH (not by string source)

| Path | Strings | Verdict |
|---|---|---|
| `epic_l_path.states[].label` (rail titles) | The C–C bond turns · Look down the C–C bond · Staggered and eclipsed · Turning costs energy · The barrier is 12 kJ·mol⁻¹ · One formula for the curve · Turn it yourself | ✔ all literal; meaning in the first two words (41d) |
| `field_3d_config.states[].caption` (delta cues) | The C–C bond turns · Now looking down the bond · Hydrogens line up: eclipsed · Turning draws an energy curve · The barrier: 12 kJ·mol⁻¹ · Same peak every 120° · Turn it yourself | ✔ |
| `tts_sentences[].text_en` | all 17 sentences in §D | ✔ swept below |
| `misconception_watch[]` | the three entries in §D | ✔ |
| `field_3d_config.states[].organic_structure.formula` | `E(φ) = 6(1 + cos 3φ) kJ·mol⁻¹` | ✔ notation, not language |
| `real_world_anchor` | hexagonal pencil; screw-top bottle lid (secondary, unused) | ✔ |
| renderer-hardcoded control labels | `View:` / `Standard` / `Along the bond` / `Turn speed:` / `Show hydrogens` / `φ:` | ✔ already plain; nothing to author |

**Banned register, checked and absent.** The molecule does not *want*, *prefer*, *like*, *relax*, *settle*,
*fight*, *resist*, *seek*, *try*, *choose* or *escape*. Bonds do not *know*, *feel* or *dislike*. There is no
*fate*, *grip*, *ceiling*, *comfort*, *tension* in the emotional sense, or *happy* position. The single riskiest
word in this concept is **"prefers"**, and it appears nowhere: the sim says *staggered is the lowest-energy
arrangement*, never *the molecule prefers staggered*.

**Physics/chemistry vocabulary used bare, as Rule 41b requires:** staggered, eclipsed, dihedral, Newman
projection, torsional strain, barrier, sigma bond, sp³, conformation (drill-down only). "Peak", "falls",
"climbs", "rises" describe the drawn curve literally and are not metaphors. "Rolls", "rests", "lifts over"
describe a pencil literally.

### E-5 · The two cuts, re-run over every rendered symbol AND every value

**Cut A — hide `advanced` (drop S6).** Surviving rendered strings: `φ`, `°`, `E`, `kJ·mol⁻¹`, `barrier`,
`C 2 · H 6`, `bond = C1–C2`, `pose = staggered`, `φ(C1–C2)`, `staggered`, `eclipsed`, `(literature)`, the axis
labels `φ (°)` / `E (kJ·mol⁻¹)`, the axis numerals 0 and 12. **No cosine, no `E(φ) = …`, no "120°" survives in
any narration, caption or HUD line.** S5 stands alone on the number. **Coherent.**

**Cut B — hide `advanced` + `extended` (drop S5, S6).** Additionally lost: the word `barrier`, the bracket, the
term *torsional strain*, and the spoken numeral 12. Surviving values: the y-axis numerals **0** and **12** are
still drawn on S4's and S7's graph, because they come from the published stationary levels and are properties of
a core-ring graph's own axis. That is why S4's narration counts falls and climbs and names **no number** — the
quantitative *claim*, not the numeral, is what STATE_5 owns. **Coherent.**

**Rule 38b, explore-is-core.** S7 renders `φ`, `°`, `E`, `kJ·mol⁻¹`, the curve, the rider, the stationary
labels `staggered`/`eclipsed`, `(literature)`, and four control rows. Earliest appearance of each: `φ` and `°`
in S1 (core); `E` and `kJ·mol⁻¹` and the curve and the labels in S4 (core); the controls' own labels are
renderer chrome. **No symbol and no value in S7 first appears outside the core ring.** No `show_barrier`, no
`show_formula`.

### E-6 · Unicode (Rule 34c) — every rendered glyph

`φ` U+03C6 · `°` U+00B0 · `·` U+00B7 · `⁻` U+207B · `¹` U+00B9 · `–` U+2013 (the en dash in `C1–C2`, `C–C`,
`C–H`) · `³` U+00B3 (in `sp³`, narration only) · `₂` U+2082 and `₆` U+2086 (in `C₂H₆`, this document and the
drill-down only — **not** rendered; the HUD prints `C 2 · H 6`, which is the engine's own format and must not
be "corrected"). No ASCII transcription anywhere: never `phi`, `deg`, `kJ/mol`, `->`, `C2H6` in a rendered
string. The formula surface is `'Cambria Math'` serif per the engine (`:65744`).

---

## §F — Drill-down cluster phrasings (5 per cluster, real student voice)

These become `trigger_examples TEXT[]`. Lower case, no punctuation, plain English, no Hinglish — how a student
actually types, not how a textbook writes.

### STATE_2 — `newman_front_vs_back_carbon`
1. `which carbon is the circle again`
2. `why does one of the carbons just disappear`
3. `how do i know if a line is in front or behind`
4. `the three lines from the middle and the three from the circle look the same to me`
5. `is the circle an atom or is it just a drawing thing`

### STATE_2 — `newman_from_a_3d_model`
1. `how do i turn the 3d picture into that circle drawing`
2. `which way am i supposed to look at the molecule`
3. `when i look down the bond doesnt everything just overlap`
4. `do i have to draw it looking down the bond every single time`
5. `my teacher drew it from the other end and it looked different`

### STATE_2 — `newman_vs_sawhorse_projection`
1. `whats the difference between newman and sawhorse`
2. `which one should i draw in the exam`
3. `can i just draw the sawhorse one its easier`
4. `does the sawhorse show the angle as well`
5. `are they the same molecule drawn two ways or two different things`

### STATE_4 — `why_eclipsed_is_higher`
1. `why does lining up cost energy`
2. `nothing is touching so what is pushing`
3. `why is eclipsed worse if the atoms are the same distance apart`
4. `my book says electron clouds repel but i cant see any clouds`
5. `is it the hydrogens bumping into each other`

### STATE_4 — `torsional_strain_named`
1. `what exactly is torsional strain`
2. `is torsional strain the same thing as steric hindrance`
3. `does staggered have zero torsional strain or just less`
4. `is strain an actual force or just a name for the energy`
5. `why call it strain if nothing is being stretched`

### STATE_4 — `barrier_vs_bond_breaking`
1. `does the c c bond break when it turns`
2. `if turning costs energy where does that energy come from`
3. `how can it keep turning if there is a barrier`
4. `12 is tiny compared to a bond energy so why does it matter`
5. `my book says 12 point 5 but the sim says 12`

**STATE_6's third-place cluster is NOT authored** (the architect's §12 decision). If analytics later flag it,
`three_fold_symmetry_of_a_methyl_rotor` with phrasings around "why 3 and not 2" and "what does the 3 in cos 3φ
mean".

---

## §G — Constraint callouts: what the engine must never render, what it must hide, and what it does not show

### G-1 · Must NEVER render (conservation first)

1. **A bond breaking or forming at any φ.** The bond set is exactly `{C1–C2, C1H1..3, C2H1..3}` at every frame.
   A frame in which a bond disappears, thins to nothing, changes colour to signal strain, or is drawn with a
   different count is a conservation failure, not a stylistic one.
2. **The two carbons drifting apart.** `d(C1,C2)` is 154 pm at every φ. A frame where the C–C distance changes
   is the "the barrier is a bond stretching" misconception rendered.
3. **A staggered pose labelled eclipsed, or the reverse.** The stationary labels come from the registry row, and
   the arc label is measured — so this can only fail if a state authors `torsion.pose` while also sweeping.
   **`pose` is authored on STATE_2 only**, which holds a static pose. No sweeping state may print the `pose` HUD
   line.
4. **Any implication that the barrier is a bond being broken.** No caption, HUD line, formula surface or
   narration sentence may contain "break", "snap", "come apart" or a bond-dissociation number. This is torsional
   strain, not bond cleavage (§B-4).
5. **Two φ strings on one screen.** S3 authors `show_hud: false` so the measure label is the only φ. No state
   may author both a `torsion` measure and a `phi` HUD line.
6. **A number spoken that no instrument prints.** The only numerals in narration are 60, 0, 12, 3, 120 and 360,
   and each is on screen in the state that speaks it (arc label · arc label · HUD `barrier` + bracket · the
   formula's coefficient + the count of drawn falls · the axis · the axis).

### G-2 · Countability assertions (what the narration counts must be countable)

| Counted in narration | State | Countable because |
|---|---|---|
| "two carbons and six hydrogens" | S1 | the HUD prints the live count, and the oblique pose `az 180, el 6` holds a worst-case disc gap of +0.304 over the whole turn (skeleton §10 row 4) against a floor of 0.12 |
| "the front carbon … the back carbon" | S2 | the rim convention makes them structurally distinguishable — a filled sphere and an open circle |
| "three hydrogens 120° apart" | S2 | at the settled on-axis pose the six spokes are 60° apart; each carbon's three are 120° apart |
| "front and back hydrogens line up" | S3 | `dist: 8` holds +0.198 at eclipsed against the 0.12 floor — the front discs project larger because they are nearer, which is true, so the pairs stay two discs and not one |
| "falls three times and climbs three times" | S4 | six monotone segments between seven drawn dots; see §I-4 |

### G-3 · What the sim genuinely does NOT show — so nothing narrated overclaims

| Not shown | Consequence for authoring |
|---|---|
| **The C–C bond lengthening by ≈ 0.01 Å at the eclipsed maximum** (§B-7) | No line may say "nothing changes but the angle" or "the bond length is constant" as a claim about the real molecule. Say **"no bond is broken and the connectivity never changes"** |
| **The origin of the barrier** — no electron density, no orbital, no repulsion surface exists in this scenario | No line explains *why*; §H-1 |
| **Occupancy / population** — the `population` HUD line is deferred to A2 | No line says where the molecule spends its time; §B-5 |
| **H···H distances** — no `distance` measure is authored | No line quotes a contact distance; §H-2 |
| **Quantised torsional levels** — the curve is a classical potential | No line says the molecule "sits at the bottom"; the drill-down answer that uses Boltzmann states its model |
| **Temperature** — no thermometer, no T control | No line mentions room temperature as a rendered condition. §D-1's pencil anchor is a shape analogy, not a thermal claim |
| **The back carbon's id label** — carbon-id sprites are drawn only for atoms in the visible set, and `newman: true` removes C2 | The rim circle is unlabelled by construction. This matches the textbook convention. **Not an ask** — S2's `bond = C1–C2` HUD line plus sentence 2 carry the identification |

### G-4 · Hidden algebra and conventions json_author must encode

| Item | Value | Note |
|---|---|---|
| φ wrapping | authored 390° renders and reads as **30°** | `orgDihedral` returns 0–360; the HUD, the arc label and the slider handle all read the MEASURED wrapped value. Narration must never say "φ climbs to 390" |
| φ never lands on exactly 360 in a swept state | S4 ends at **358** | a sweep landing on 360 measures as 0 and snaps the rider to the left edge of a complete curve |
| S1 never lands on 420 | ends at **390** | 420 ≡ 60 is the opening frame, so the pin would photograph a static state |
| degrees, not radians | the formula surface's φ is in degrees | the x-axis label `φ (°)` is the disambiguation and must not be removed |
| bracket vs HUD decimals | bracket `barrier 12.0 kJ·mol⁻¹`, HUD `barrier = 12 kJ·mol⁻¹` | two different `orgFx` precisions on the same quantity; §I-5 |
| no unit conversion is hidden anywhere | — | every quantity is authored in the unit it is displayed in: degrees, kJ·mol⁻¹, pm. No °C↔K, no g↔mol, no log scale, no scale factor |
| **particle-count scale factor: N/A, declared** | — | the canvas draws **one molecule with its true eight atoms**, not a representative sample. There is no depicted:actual ratio to declare, and no label may imply a bulk sample |

---

## §H — Rulings on the architect's three open questions

### H-1 · The origin of the barrier — hyperconjugation vs Pauli repulsion. **RULING: state the measured fact, name the standard term for the cost, make no mechanistic claim. The narration attributes nothing.**

**What is contested and what is not.** Nobody disputes the number or the shape: Kemp & Pitzer's 12 kJ·mol⁻¹ and
the threefold profile are settled experiment. What Pophristic & Goodman (*Nature* **411** (2001) 565) and
Bickelhaupt & Baerends (*Angew. Chem. Int. Ed.* **42** (2003) 4183) argue about is which *term of an energy
decomposition* dominates — hyperconjugative σ(C–H) → σ*(C–H) stabilisation of the staggered form, or Pauli
exchange repulsion destabilising the eclipsed one. **An energy decomposition is a partition of a model, not a
measurement**; different partitions give different answers, which is precisely why the argument has run for two
decades. There is no experiment that reads out "the cause".

**Four reasons the sim must not adjudicate it, in order of force.**

1. **Rule 24/34 — there is no instrument.** This scenario draws atoms, bonds, a rim, an arc and an energy curve.
   It has no electron-density surface, no orbital, no repulsion field. A mechanistic sentence would be narration
   with no picture behind it, which is the `gas_box_state4_asserts_unchanged_speed_with_no_instrument` failure
   exactly: with sound off — the default — the claim would not exist at all. **And the fix is not to buy the
   surface: this concept is a live-engine build with a NO alarm verdict, and a mechanism state would be a
   different concept.**
2. **Rule 25 — both candidates are untaught terms.** Hyperconjugation needs σ* antibonding orbitals and donor–
   acceptor overlap; the concept's prerequisites (`sigma_pi_bonding`, `hybridisation_sp_sp2_sp3`,
   `vsepr_molecular_shapes`) teach σ/π and hybrid orbitals and stop there. Pauli repulsion needs antisymmetry
   and exchange, which no Class-11 syllabus carries. Even NCERT's own softer phrasing — "repulsion between the
   electron clouds of the C–H bonds" — introduces *electron cloud* as a load-bearing noun in a concept that has
   never drawn one.
3. **Teaching a contested attribution as fact is teaching a model as a measurement**, and this product's whole
   floor is that verified physics decides what a student sees. Half the modern literature would call the NCERT
   sentence the wrong half of a decomposition.
4. **The concept does not need it.** The atomic claim (skeleton §2) is: rotation passes through low- and
   high-energy arrangements, the difference is 12 kJ·mol⁻¹, and the Newman projection is the view that shows it.
   Every one of those is measured, rendered and examinable without a mechanism.

**What the narration therefore says.** *Eclipsed is 12 kJ·mol⁻¹ higher in energy than staggered, and that
difference is the rotation barrier — 12 kJ·mol⁻¹ of torsional strain* (S5 s2). **"Torsional strain" is a name
for the cost, defined by the curve itself, not a mechanism** — which is exactly why it is safe: it is the
standard term across NCERT, McMurry, Clayden and Vollhardt, it is the word an examiner wants, and it asserts
nothing contested.

**Where the mechanism does live.** The `why_eclipsed_is_higher` drill-down (§F), which is text, has room for a
gloss, and can be honest: *the usual textbook explanation is repulsion between the bonding electron pairs of the
C–H bonds; modern calculations disagree about how much of the effect is that repulsion and how much is a
stabilisation of the staggered form, and the measured 12 kJ·mol⁻¹ is not in dispute either way.* A Class-11
student who reads that has learned their board's answer plus the fact that chemistry is still arguing — which is
a better outcome than a false certainty on canvas.

**This confirms the architect's recommendation, with the reasoning made explicit and one addition:** the NCERT
"electron cloud" phrasing is also excluded from guided narration, not merely the modern dispute.

### H-2 · H···H distances (skeleton §10 row 9) — **RULING: do NOT author. The source exists; the state does not have room and the claim would import H-1's problem.**

The reference is sourceable — van der Waals H+H = 240 pm from Bondi, *J. Phys. Chem.* **68** (1964) 441 — so the
architect's stated blocker (no defensible `reference_value_pm`) is removable. I am still declining, for three
reasons that are about teaching rather than sourcing:

1. **It would put a second instrument on S3**, whose entire content is one arc closing to zero, and S3 carries
   `show_hud: false` precisely so one number owns the screen.
2. **The numbers argue against the naive reading.** Eclipsed H···H is 227 pm and staggered is 249 pm — a 22 pm
   difference, and the eclipsed contact is only 13 pm inside the Bondi sum. A student shown those two numbers
   concludes "the hydrogens are bumping", which is drill-down phrase 5 of `why_eclipsed_is_higher` and is the
   belief the deep-dive has to *correct*. Rendering the distances would teach it.
3. It reopens H-1 on canvas, where H-1 has ruled the mechanism must not go.

The numbers stay in the drill-down, where phrase 5 can be answered properly.

### H-3 · NCERT's 12.5 — **RULING: yes, reconcile it, in the drill-down, never on canvas. The architect's view is right and the cluster is already named.**

12.5 kJ·mol⁻¹ is 3.0 kcal·mol⁻¹ rounded; 12 kJ·mol⁻¹ is 2.9 kcal·mol⁻¹. They are the same measurement reported
at different precision, and the sim's 12 is the value that makes the H/H eclipsing increment exactly 4.0
kJ·mol⁻¹ per pair — the increment that reproduces butane's 16 and 19 in the sibling concept, which is a
consistency a student can actually check. A student reading the sim beside the textbook will notice the
mismatch, and an unexplained mismatch costs more trust than the 0.5 kJ·mol⁻¹ is worth. `barrier_vs_bond_breaking`
phrase 5 (`my book says 12 point 5 but the sim says 12`) is the entry point, and it must be answered as *the
same measurement, rounded differently — neither is wrong*, never as *your book is wrong*. **Nothing changes on
canvas: the canvas prints 12, once, with the `(literature)` stamp already beside the curve.**

---

## §I — DISAGREEMENTS with the skeleton, stated plainly

Six. Two are corrections to claims about the shipped engine, two are arithmetic, one is a wording constraint the
skeleton did not derive, and one is a scoping disagreement. **None requires an engine change.**

### I-1 · Per-sentence narration glow is NOT available on `organic_structure`. The skeleton says it is.

The skeleton §0 disposes of `authored_state_glow_focal_silently_voids_every_tts_sentence_glow_in_that_state`
with: *"S1–S3 and S7 author **no** `glow_focal`, so per-sentence glow stays available to `chemistry-author`."*

**Measured in the shipped source, that is false.** `applyOrganicStructureGlow` (`field_3d_renderer.ts:66319`)
reads `stateDef.glow_focal` and nothing else; it never consults the `glowTargets` array that `SET_GLOW`
populates (`:82009`), and it re-runs `applyGlowEmphasis` over every `org_*` object on every frame, so it would
overwrite a sentence glow even if one were applied upstream. **A `tts_sentences[].glow` on this scenario is
inert on all seven states, whether or not the state authors a `glow_focal`.**

**Disposition, and it is not an ask.** I author **zero** `tts_sentences[].glow` values. Authoring a glow that
does nothing would put a false claim in the JSON and would satisfy the
`concept_ships_zero_narration_glow_bindings` probe with a lie. The row's own DO clause allows this: *"partial
bindings name which sentences deliberately carry none and why."* The reason is named here, per sentence: all 17
of them, engine limitation, `organic_structure` has no sentence-glow path. **FLAGged to `quality_auditor`** so
the 0/17 ratio is read as declared rather than discovered. It is the same finding I recorded on
`cyclohexane_chair_flip`, now confirmed against the landed engine with a line number instead of a prediction.

*Ratified, separately:* the skeleton's `glow_focal` choices are all correct — `null` on S1/S2/S3/S7 (a focal on
`measures` or `rim` would dim the very hydrogens those states teach) and `'curve'` on S4/S5/S6 (which sets
`any = false` at `:66329`, so the DOM panel brightens and nothing in the 3D scene dims).

### I-2 · STATE_3's word budget upper bound violates the skeleton's own pacing rule.

§3 states every budget is set at ≤ 2.75 words·s⁻¹ of that state's motion. S3's motion ends at 12400 ms, so its
ceiling is 12.4 × 2.75 = **34.1 words**. The table authors **32–36**. Thirty-six words is 2.90 words·s⁻¹.

**Disposition:** authored at **33 words** (2.66 words·s⁻¹), inside both the stated range and the stated rule. No
timing change. Reported because the arithmetic error would otherwise propagate into
`conformations_of_butane`, which will clone this table.

### I-3 · STATE_2 cannot carry the claims the skeleton assigns it at the authored duration. **I recommend a retime.**

Block 1 §1 prescribes an sp³ clause *in S2's narration* ("each carbon is sp³, so its three hydrogens sit at
equal angles round the bond"). §4 assigns S2 the M3 counter (which carbon is which). §2 assigns S2 the name
*Newman projection*. That is three claims. The shortest honest phrasing of all three is **35 words**. S2's
motion ends at 10700 ms, giving a ceiling of **29.4 words**. The three claims do not fit; the skeleton's own
budget of 26–29 confirms it, and the state's tension is real rather than a wording problem.

**Recommendation, entirely inside the shipped contract — two authored numbers change:**

| Field | Skeleton | Recommended |
|---|---|---|
| `camera_steps[1].ease_ms` | 9500 | **12500** |
| `eye_capture_ms` | 11300 | **14300** |

Motion then ends at 13700 ms; 35 words is 2.55 words·s⁻¹; the pin stays 600 ms clear of the last motion. This
is the `narration_outruns_choreography` DO clause verbatim — *fix by RETIMING, never by splitting* — and a
slower camera flight is better pedagogy for the one state whose entire job is a transformation of viewpoint. It
is also the only state in the concept whose motion is a camera move, so nothing else re-times with it. §14's
"one honest exception" about the rim appearing early during the glide becomes ~12 s instead of ~9 s; still
declared, still the convention arriving early.

**Fallback if the founder declines the retime**, at the skeleton's 10700 ms and 29 words — the sp³ *cause* is
dropped and only its observable survives:
> 1. `[0.0 → 2.5 s]` "The camera moves onto the bond axis." (7)
> 2. `[2.5 → 7.2 s]` "The front carbon becomes the centre point; the back carbon becomes the circle." (13)
> 3. `[7.2 → 10.4 s]` "Three hydrogens on each, evenly spaced: the Newman projection." (9)

I recommend the retime. The fallback loses the prerequisite bridge the architect specifically asked for.

### I-4 · "Three peaks" is chemically right and visually wrong. The narration must count falls and climbs.

The scar `planning_doc_counts_degenerate_enantiomeric_minima_as_distinct_conformations` made the skeleton
careful to state 3 minima, 3 maxima and 2 labels. Correct. But **the drawn graph is a different count from the
chemistry count**: `orgDrawGraph` renders a labelled dot for every registry row with `x ≤ xEnd`, and the ethane
row has seven — so the 0–360 axis carries **four** maximum dots (0, 120, 240, 360) and three minimum dots. A
student counting humps on screen sees four.

The skeleton's §7.3 prescribes narration "rises and falls three times in one turn". Spoken over a picture with
four maximum dots, that is `teach_visual_must_match_narration`.

**Disposition:** S4 narrates **"In one full turn the curve falls three times and climbs three times."** Between
seven drawn dots there are exactly six monotone segments — three falls and three climbs — so the count is
traceable on the screen dot for dot. It also delivers the exam answer without ambiguity: the energy *reaches* a
maximum three times during the turn (at 120, 240, 360; the 0 dot is where it starts). Assessment Q4's answer
stays **3**, and it is now provable from the picture rather than in tension with it.

**Binding on every downstream string:** no caption, HUD line, narration sentence or assessment stem may say
"three peaks", "four peaks", or ask the student to count the peaks on the graph.

### I-5 · The barrier's two rendered strings are not the same string. §14(b) says they are.

§14(b) row 7: *"the barrier | `barrier = 12 kJ·mol⁻¹` | S5 HUD line **and** the canvas bracket, same string
stem."* Read at source:

- HUD line (`:66286`): `est.barrierLabel + " = " + orgFx(est.barrier, 0) + " kJ·mol⁻¹"` → **`barrier = 12 kJ·mol⁻¹`**
- canvas bracket (`:65767`): `est.barrierLabel + " " + orgFx(est.barrier) + " kJ·mol⁻¹"` → **`barrier 12.0 kJ·mol⁻¹`**

Different separator (`" = "` vs `" "`) and different precision (dp 0 vs dp 1). The **label stem is identical**,
which is what the underlying scar requires, so the scar is satisfied — but the DoD's "same string" claim is not
accurate and would fail a literal string check.

**Disposition:** none needed for chemistry — 12 and 12.0 are the same value and narration says "12 kJ·mol⁻¹",
which is true of both. Recorded so `quality_auditor` does not read the difference as a defect, and so
`json_author` does not "fix" one to match the other (both are engine-side, and neither is authorable).

### I-6 · §14(c) calls the conservation ledger "not applicable and deliberately empty". It is applicable, and it is the M2 counter.

The architect is right that there is no equation, no state symbol on canvas, no oxidation-number bookkeeping to
display, and no particle-count scale factor. The architect is wrong that this leaves the ledger *empty*.
**Conformational analysis is the case where the conservation ledger stops being a formality and becomes the
teaching claim**: the reason staggered and eclipsed are the same compound is precisely that every conserved
quantity — formula, connectivity, bond count, bond order, hybridisation, charge, oxidation number — is identical
at every φ, and the HUD's live `C 2 · H 6` is the instrument that proves it with sound off.

**Disposition:** §B is written as the ledger. It is what `quality_auditor`'s chemistry correctness gate should
audit this concept against, and the atom-count row has a rendered instrument, which is more than most
equation-bearing concepts can say.

---

## §J — `aha_moment`, `misconception_watch` and assessment verification

### J-1 · `aha_moment`

```
state_id:  "STATE_4"
statement: "Rotation about a single bond is not free: the energy rises and falls."
```

**13 words** (Rotation·about·a·single·bond·is·not·free·the·energy·rises·and·falls), under the Gate-2 ceiling of
15. **Chemically true:** rotation about the C–C σ bond in ethane is hindered, with a threefold potential of
amplitude 12 kJ·mol⁻¹. **Demonstrated by the designated state:** STATE_4 draws that exact curve, with the rider
measured off the molecule the student is watching turn. No personification (the *energy* rises and falls, not
the molecule). The supporting aha (STATE_2, the Newman view) is a view claim and correctly stays supporting.

### J-2 · `misconception_watch` — chemistry correctness of each counter

| # | State | Belief | Counter is correct chemistry because |
|---|---|---|---|
| M1 | STATE_4 | rotation about a single bond is completely free | Hindered rotation is the measured fact; "not freely" is the standard correction and the 12 kJ·mol⁻¹ profile is its evidence. The counter deliberately does **not** say the rotation is slow — at 298 K it is fast, which is why the fix says the energy rises and falls, not that the molecule stops |
| M2 | STATE_1 | staggered and eclipsed are different compounds | They are conformers: same formula, same connectivity, interconvertible without breaking a bond (§B-1, §B-3). "Same molecule at different points of one rotation" is exact |
| M3 | STATE_2 | a Newman projection is two overlapping Y shapes | The convention is unambiguous: the point where three bonds meet is the front atom, the circle is the back atom. This is a representational fact, not a chemical claim, and it is drawn correctly by the engine's rim convention |

### J-3 · Assessment — verified as chemistry (the block itself stays omitted, §14(f))

| q | Correct answer | Verified | The wrong belief a distractor should encode |
|---|---|---|---|
| Q1 | the same molecule at different points of one rotation | ✔ §B-3 | "different compounds" (M2) — a student who thinks conformers are isolable |
| Q2 | the back carbon | ✔ engine rim convention | "a ring of atoms" / "the front carbon" — the M3 inversion |
| Q3 | eclipsed | ✔ registry row, `x = 0`, `label: "eclipsed"` | "staggered" — a student who reads φ = 0 as "no twist, therefore relaxed" |
| Q4 | three | ✔ §A-4, and see §I-4 | "four" — counting the drawn dots including both edge dots; "one" — thinking there is a single high point |
| Q5 | 12 kJ·mol⁻¹ | ✔ §A-1 | "12.5 kJ·mol⁻¹" (the NCERT rounding, §H-3) and "377 kJ·mol⁻¹" (confusing the barrier with the bond energy, §B-4) |
| Q6 | 120° | ✔ threefold rotor, period 360/3 | "360°" — not seeing the threefold symmetry; "60°" — confusing the staggered–eclipsed spacing with the period |

Every distractor above is a real wrong belief that produces that exact wrong option; none is a decoy.

---

## §K — Self-review

- [x] **Every quantity in the skeleton's state narratives appears in `variables` with a unit** — φ (deg), E (kJ/mol), barrier (kJ/mol), V₃, n, period (deg), eclipsing increment, C–C and C–H (pm), tetrahedral angle (deg), spin (deg/s).
- [x] **Conservation ledger complete, in its unusual form** — §B: no reaction, so the ledger is the identity table (atoms, bonds, connectivity, charge, oxidation numbers, valence electrons) at four representative φ and at every φ, with the live `C 2 · H 6` HUD as its rendered instrument. Isomer classification stated (§B-3). No redox, so no oxidation-number balance is needed — but the oxidation numbers are tabulated and check out (2(−3) + 6(+1) = 0).
- [x] **Every state's motion declares an archetype that maps to a SHIPPED render path** — all seven target `organic_structure` fields in the IMPLEMENTED sets (`ORG_MODES_IMPL`, `ORG_HUD_LINES_IMPL`, `ORG_CONTROL_IDS_IMPL`, `ORG_MEASURE_KINDS_IMPL`, `ORG_ENERGY_COORDS_IMPL`), read at `field_3d_renderer.ts:64703-64760`. **Nothing needing an unbuilt surface is authored, and nothing is FLAGged as needed.**
- [x] **Rule 31 timeline for every state** — §D, t-window × what animates × driven-by, every branch a pure function of the state clock. No two states share a motion; no static state; controls match the skeleton's §3 table exactly.
- [x] **Rule 32** — 32a gaps measured per state in §D-0 (S3: 0.3 s instrument-before-motion with a 1.0 s readable label; S5/S6: 380 ms; S4's deliberate simultaneity justified). 32b: φ is the only mover in S1 and S3–S6; the camera is the only mover in S2; `spin_rate` is 0 everywhere guided. 32c/32d/32e ratified from the skeleton.
- [x] **Rule 33** — declared N/A with a reason (the taught variable is not macroscopic; the molecule is the object at one level). 33d met: every instrument shows a live number, and the rider is the tracking needle.
- [x] **Rule 34** — ONE formula surface, on S6 only; captions are the ≤5-word delta cues; the HUD is value-only; all math Unicode (§E-6); zones do not collide (HUD top-right at `top:52px`, graph bottom-left, sliders bottom-right, formula re-anchored top-left when the graph is up).
- [x] **Word budget (31a)** — 39 / 35 / 33 / 36 / 28 / 26 / 0, counted by whitespace token (the same way the pacing probe counts — a formula string tokenises to seven words, which is why S6 does not recite its equation). Every guided state inside 25–55. Every state's motion outruns its narration. §D-0.
- [x] **Notation ladder (38c)** — no logarithm, no calculus, no exponential, no quantum notation at any ring; the one cosine is on the advanced state alone. Nothing smuggled, nothing FLAGged as needing to be.
- [x] **Dialect (38d) + IUPAC-first** — one dual-label (barrier / torsional strain, S5 s2); dihedral/torsion handled in drill-down; ethane needs no dual name; no trivial names or shorthand.
- [x] **Particle-count scale factor** — N/A and declared (§G-4): one molecule, eight real atoms, no representative sample.
- [x] **Drill-down phrasings** — 30 phrases across 6 clusters, lower case, student voice, no Hinglish (§F).
- [x] **`constraints` block** — six assertions, conservation first, each marked FIXED or DERIVED (§C-1).
- [x] **Numerical sanity check RUN** — §A-4: closed-form identity to 1.78e-14 over 3601 samples, every published energy, every pinned frame, every passing mark, every printed string, reproduced from the shipped code paths in Python. Two skeleton numbers did not survive (§I-2, §I-5).
- [x] **Engine bug queue consulted** — five queries stated in §0; twenty-two binding rows walked; **one exception declared and FLAGged** (§I-1, the inert sentence-glow channel), plus one naming exception (§C-5, `phi_deg` vs the painted `φ`).
- [x] **`aha_moment` chemistry check** — 13 words, chemically true, demonstrated by STATE_4 (§J-1). `misconception_watch` counters verified as chemistry (§J-2). Assessment answers verified and every distractor tied to a real wrong belief (§J-3).
- [x] **Rule 35 / Rule 41** — the anchor is a hexagonal pencil and a bottle lid, which read identically everywhere; the banned-register sweep runs over string PATHS in §E-4 and the word "prefers" appears nowhere.
- [x] **Source check line.** *Consulted the NCERT Class 11 Chemistry Ch.13 (Hydrocarbons) chapter index for scope and the NCERT quoted barrier value only. No teaching method, no example problem, no figure, no prose imported. Every energy carries a primary literature citation; every teaching sequence, anchor, sentence and drill-down phrase is authored from first principles.*
- [x] **No engine capability requested.** Zero engine asks, zero new fields, zero new enum members, zero new registry rows. Four chemistry claims were CUT rather than converted into a request (§H-1, §H-2, §B-4, §B-5), and the two engine limitations found while writing (§I-1 the inert sentence-glow channel, §I-5 the two barrier strings) are recorded as limitations, not asks.
