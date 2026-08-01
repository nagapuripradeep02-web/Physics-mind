# Phase 0 — the bonding-successors wave (`hydrogen_bonding` · `bond_polarity_dipole_moment` · `ionic_bonding` · `metallic_bonding`)

**Status: 0a + 0b COMPLETE (2026-08-01). 0c NOT DISPATCHED — blocked on founder-proxy Checkpoint A.**
Doctrine: `docs/AUTHORING_PIPELINE.md` §0. Runs ONCE for this wave, BEFORE any concept desk opens.
Trigger: the 2026-08-01 coverage survey (`PROGRESS_CHEMISTRY.md`) found all four successors
**unranked and engine-blocked**, with three of four needing engine work across two surfaces — four
parallel desks would have put three sessions inside `field_3d_renderer.ts` at once, which is the
exact Rule-40 hazard that built the PCPL focal-glow fix twice.

> **The one-line result.** The four concepts need **ONE** new `field_3d` scenario, not two and not
> four: `bonding_scene`, a scene of charged *units* (molecules or ions) placed either freely or on a
> lattice, with links between them. It reuses `molecular_geometry`'s geometry table rather than
> re-deriving it. It lands on master in **three sequenced surgeon dispatches**, after which the two
> concept desks are **pure JSON** with zero renderer edits.

---

## 0a — CHAPTER SURVEY

### The four concepts, measured

Every candidate states its tier and its whiteboard-test justification before state design
(CHEMISTRY_DISCUSSIONS Session C5 §7.3). Capability numbers refer to C5 §2.

| Concept | Tier | Capability | Why a whiteboard cannot do it |
|---|---|---|---|
| `hydrogen_bonding` | 💎 | 1 + 4 | A board draws two water molecules and a dotted line. It cannot show forty molecules making and breaking links continuously, and it cannot make the boiling-point anomaly *emerge* from that motion rather than be asserted |
| `ionic_bonding` | 💎 | 3 + 4 | "There is no NaCl molecule" is a 3D fact about an endless lattice. The cleavage beat — shift one layer by one site and the crystal splits — is a motion, not a picture |
| `metallic_bonding` | 💎 | 1 + 4 | The sea is invisible and it is the whole concept; and *the same layer shift that shatters the ionic crystal leaves the metal intact* is a contrast only motion delivers |
| `bond_polarity_dipole_moment` | ⭐ (one 💎 state) | 3 | **Honest call: this is strong, not top-tier.** A teacher CAN draw CO₂ with two opposing arrows and say "they cancel." What a board genuinely cannot do is sum **four tetrahedral** bond dipoles to exactly zero and then break the symmetry with one substitution (CH₄/CCl₄ → CHCl₃). That state is a diamond; the rest of the concept is strong support |

`bond_polarity_dipole_moment` earns its build on the pairing, not on its own tier: **it is the
prerequisite of hydrogen bonding** (δ+/δ− is an untaught term otherwise — Rule 25 foundation-first),
and it shares an engine surface with it. Same for the other desk: **metallic bonding's aha state is a
contrast against ionic bonding's cleavage state**, so the pair must be built by one desk that owns
both motions.

### Curriculum reach (Rule 38g CLAIMS — every non-CBSE cell needs a teacher of that board)

| Concept | CBSE | JEE/NEET | IGCSE | IB DP | AP | A-level |
|---|---|---|---|---|---|---|
| `ionic_bonding` | full (Cl.11 Ch.4 §4.2) | full | **full — chapter opener** | full | partial | full |
| `hydrogen_bonding` | full (Cl.11 Ch.4 §4.9) | full | **full** | full | **full — an entire AP unit** | full |
| `bond_polarity_dipole_moment` | full (§4.4) | full | partial | full | full | full |
| `metallic_bonding` | ⚠ **partial / see caveat** | partial | **full** | full | partial | full |

**Two findings that change what this wave is worth.**

1. **This wave is the fix for the IGCSE hole.** The σ/π session recorded that *"for IGCSE our bonding
   chapter is effectively empty"* — hybridisation and σ/π both carry "hide the whole concept for this
   board", leaving VSEPR alone. **Ionic, metallic and hydrogen bonding are all full-coverage IGCSE
   topics.** This wave takes that chapter from one concept to four for the youngest international
   grade, which no ranked P2 concept does.
2. ⚠ **Metallic bonding carries the NCERT-rationalisation caveat.** Solid State was removed from the
   rationalised NCERT, and metallic bonding survives in CBSE only in thin descriptive form
   (Cl.11 Ch.3). It is the **weakest of the four on the home syllabus and the strongest abroad**.
   Build it — but as the fourth, and with its CBSE cell authored `partial`, never `full`.

**Standing gap, restated because it now applies to four more files:** ten concepts deep, **not one
international `curriculum_tags` cell has been confirmed by a teacher of that board.** Every cell in
the table above ships `needs_teacher_verification: true`, so Rule 38g blocks all of them from
teacher-visible presets. This wave does not close that gap; it enlarges it. It is the same shape as
the Asmi bottleneck and it silently caps the international story.

### Does an existing scenario family stretch? (the FIRST question — §0a)

*"The cheapest Phase 0 is the one you discover you don't need."* Measured against renderer code, not
against the pattern doc, whose own header warns that a tier label decays.

| Existing surface | Stretches? | Evidence |
|---|---|---|
| `field_3d` · `molecular_geometry` | **Partly — geometry only** | `MG_MOLECULES` / `mgIdealDirs` / `mgFrame` (`field_3d_renderer.ts:44815–44950`) derive one molecule about one central atom. There is no second unit, no per-atom charge, no inter-unit link, no lattice. Its `MG_MAX_BONDS = 6` and single `ligand:` string also block mixed ligands (CHCl₃) |
| `field_3d` · `orbital_shapes` | No | Single- and two-centre orbital fields. No unit concept, no lattice |
| `field_3d` · `dipole` / `dipole_potential` | No | An **electric** point-charge dipole field visualiser. Shares a word with bond polarity and nothing else |
| `particle_field` · `gas_box` | No | 2D hard-disc gas. All four concepts are structural and 3D — capability 3, the one thing a 2D canvas cannot reach |
| `parametric` | No | Flat 2D, pixel coordinates, no camera |

**Verdict: no existing scenario stretches, but `molecular_geometry`'s geometry layer is directly
reusable.** `mgFrame` / `mgIdealDirs` / `MG_ELEMENTS` / `mgOrientBetween` sit at the same 4-space
template scope as every other scenario's functions, so a new scenario **calls them** rather than
duplicating the VSEPR angle table. That is the whole reason this wave is one build and not two.

Rule 40a pre-existence sweep run across all branches — `bonding_scene`, `lattice_cell`, `rock_salt`,
`electron_sea`, `hydrogen_bond`, `molecular_assembly`, `unit_cell`: **0 hits each**. Nothing is being
built twice.

### The union of engine needs

| # | Need | H-bond | Polarity | Ionic | Metallic |
|---|---|:-:|:-:|:-:|:-:|
| A | Many discrete **units** in one 3D scene | ✅ | — | ✅ | ✅ |
| B | A unit = a rigid multi-atom molecule (internal frame from `mgFrame`) | ✅ | ✅ | — | — |
| C | Per-atom partial/formal **charge** + δ label | ✅ | ✅ | ✅ | ✅ |
| D | Intra-unit bond sticks | ✅ | ✅ | — | — |
| E | **Inter-unit links** that form/break on a geometric criterion | ✅ | — | — | — |
| F | Per-bond **dipole arrows** + a derived resultant | — | ✅ | — | — |
| G | Free-**electron swarm** with a drift bias | — | — | — | ✅ |
| H | Deterministic **thermal jiggle**, amplitude driven by T | ✅ | — | ✅ | ✅ |
| I | **Lattice placement** (rock salt / fcc / bcc) + a growth beat | — | — | ✅ | ✅ |
| J | **Layer shift** whose outcome (split / hold) is *derived* | — | — | ✅ | ✅ |
| K | **Electron transfer** with real ionic-radius re-scaling | — | — | ✅ | ✅ |
| L | Mixed ligands on one central atom (CHCl₃, NF₃) | — | ✅ | — | — |
| M | Live numeric HUD + ONE formula surface (Rules 33d / 34b) | ✅ | ✅ | ✅ | ✅ |

Rows A, C, H, M are shared by three or four concepts. That shared substrate is ~60–70% of the build,
which is what makes ONE configurable scenario correct here rather than two convenient ones.

---

## The engine decision — ONE scenario, `bonding_scene`

A **unit** is the abstraction that unifies all four: an addressable object with a position, an
orientation, a charge, and one or more atoms in a rigid internal frame.

* a **molecule** unit (H₂O, CH₄, CHCl₃) → polarity and hydrogen bonding
* an **ion** unit (Na⁺, Cl⁻) at a lattice site → ionic bonding
* a **cation** unit at a lattice site, plus a shared electron swarm → metallic bonding

`placement: 'free' | 'lattice'` is then the only structural switch, and every other feature is a flag
on top of the same unit list.

### Config contract (the authoritative shape json-author will target)

```
state.bonding_scene = {
  placement: 'free' | 'lattice',
  mode:  'assemble' | 'transfer' | 'dipole_sum' | 'approach_link' | 'network' | 'compare'
       | 'lattice_grow' | 'coordination' | 'layer_shift' | 'electron_sea' | 'drift' | 'melt'
       | 'explore',                                   // CLOSED enum — 13 modes

  units: [{ id, species, at:[x,y,z], orient:'auto'|[az_deg,el_deg], charge }],
  species: 'H2O'|'H2S'|'NH3'|'NF3'|'CH4'|'CCl4'|'CHCl3'|'CO2'|'HCl'|'HF'|'BF3'
         | 'Na'|'Cl'|'Na+'|'Cl-'|'Mg2+'|'O2-'|'K+'|'Li+'|'F-'|'Ca2+',

  lattice: { cell:'rock_salt'|'fcc'|'bcc', n:[nx,ny,nz], a_pm, grow_at_ms, grow_duration_ms },
  links:   { enabled, donor:'H', acceptor:['N','O','F'], form_pm, break_pm, angle_window_deg,
             show_count },
  dipole:  { show_bond_arrows, show_resultant, show_charges, arrow_scale },
  sea:     { count, speed, field, show_drift },
  transfer:{ at_ms, duration_ms, from, to },          // mode: transfer
  shift:   { at_ms, duration_ms, offset_sites, plane }, // mode: layer_shift
  thermal: { T_K, jiggle_scale },
  compare_at_ms, compare_species,                     // mode: compare

  show_hud, hud_lines: ['links'|'delta_chi'|'mu'|'radius'|'coordination'|'lattice_a'
                       |'lattice_enthalpy'|'melting_point'|'drift'|'valence'|'bp'],
  show_formula, formula,                              // ONE surface, Rule 34b
  controls: ['species'|'angle'|'delta_chi'|'temperature'|'count'|'separation'
            |'lattice_size'|'valence'|'field'|'shift'|'spin'],
  static_readouts: [...]                              // same rows, disabled, same position
}
```

**Glow-key enum is CLOSED** (scar #33 — a non-keyed `glow_focal` dims the whole scene with no focal
lit): `units | central | links | arrows | resultant | charges | electrons | lattice | layer |
neighbours`.

### Three engine decisions that must be made now, not discovered later

These are the Phase-0 payoff. Each one, discovered mid-build, costs a re-architecture.

**1. Every position is a closed-form pure function of state-local `t`. No integrator anywhere.**
The obvious implementation of "forty jiggling water molecules whose hydrogen bonds keep breaking" is
a molecular-dynamics step loop. **That would break the whole fleet's frozen-baseline contract**
(Rules 26/36): THE EYE's `SET_TIME_FREEZE` capture snaps to a pinned time and must reproduce
byte-identical pixels, which an accumulator cannot do. `molecular_geometry` is accumulator-free
including its spin, and `bonding_scene` must join that set.
*Required form:* each unit's offset is a sum of seeded sines with a per-unit phase derived from its
index, amplitude ∝ √(T/T₀). Link presence is then evaluated from those closed-form positions each
frame — so the network genuinely flickers, and it flickers *identically* every replay.

**2. The layer-shift outcome is DERIVED from the lattice's charge pattern, never authored.**
`shift` authors the motion only. Whether the crystal splits or holds must fall out of the charges the
lattice already has — like-charge alignment produces net repulsion and the halves separate; a
cation-only lattice with a shared electron sea produces none and the layers settle. This is the
`gas_box` `Ea_rev` lesson applied: *the derivation is why the beat is convincing instead of scripted*,
and it is what makes ionic S7 and metallic S5 a real contrast rather than two animations.

**3. ONE instrument per quantity — and the dipole readout is the open question.** *(OPEN-DECISION-1,
below.)* The σ/π scar was a slider printing `S/S₀ = 1.000` while the HUD 500 px above read `0.000` in
the same frame. Polarity has exactly that hazard: a *modelled* vector sum that moves with the angle
slider, and a *literature* μ in debye. Two instruments for one quantity will eventually disagree.

### Reuse contract (what `bonding_scene` must NOT re-derive)

| Reuse | From | Why |
|---|---|---|
| Molecular internal geometry | `mgFrame` / `mgIdealDirs` (`:44928`, `:44880`) | VSEPR angles are already verified against real values; a second table would drift |
| Element colours + **real** radii | `MG_ELEMENTS` (`:44797`) | Rule 29 — radius is a real magnitude, not an emphasis knob |
| Bond sticks | `mgOrientBetween`, `bond_sticks` (orbital_shapes) | already pooled and reposition-per-frame safe |
| Auto-fitting labels | `pmCreateAutoLabel` — **never `createLabelSprite`** | scar: a sprite measures its canvas once from its seed string; a later wider string renders clipped |
| Ramps / smoothing | `mgRamp`, `mgSmooth01` | already pure functions of state-local `t` |

**One edit to existing code is required and it is regression-bearing (row L).** `MG_MOLECULES`
entries carry a single `ligand:` string, which cannot express CHCl₃ or NF₃. The safe change is an
**optional** `ligands: [...]` array read only by the new scenario (`ligands || repeat(ligand, bonds)`),
leaving `mgFrame` and every existing entry byte-identical. **Verification is not optional:**
`npm run visual:eyes -- vsepr_molecular_shapes` must come back unchanged, and hybridisation and σ/π
must be re-run, before the dispatch is called done.

### What this wave is deliberately NOT building (the alarm-rule ledger)

§0's alarm rule says a later concept forcing an engine edit means Phase 0 under-generalised. So the
exclusions are declared here with their re-open conditions, rather than discovered by an ambush.

| Deferred | Why | Re-opens when |
|---|---|---|
| **Ice I_h hexagonal lattice** (why ice floats) | A third cell type + a 9% expansion beat, for one state | A dedicated `states_of_matter`/water concept is scheduled — it would carry the whole beat, not borrow one state |
| **Born–Haber cycle** | An energy-ladder *diagram*, i.e. archetype L on `parametric` — a different renderer, not this scenario | Scheduled as its own concept alongside reaction profiles (ranked #9) |
| **Dissolution / hydration shells** | Needs solvent units surrounding an ion — a fourth placement mode | A solubility or electrolysis concept (ranked #20/#21, P5) |
| **Fajans' rules / polarisation of the anion** | A deforming charge cloud; genuinely new rendering | Advanced-ring demand from a real teacher |
| **Alloys / substitutional lattices** | A second species on metal sites | An alloys concept is scheduled |
| **Covalent network solids** (diamond, SiO₂) | Directional lattice bonds, a different cell | Giant-covalent-structure concept (strong IGCSE candidate) |

---

## 0b — DEEPEST-CONCEPT DESIGN

The union has **two disjoint halves**, so one skeleton cannot spec the engine. Two are written in
full — the deepest of each half — and the other two carry engine-facing state tables.

* **`hydrogen_bonding`** is the deepest on the *free-placement* half (units + links + jiggle + species
  compare + temperature).
* **`ionic_bonding`** is the deepest on the *lattice* half (lattice + transfer + coordination + melt +
  layer shift).

Every state below names its motion **archetype** and its one-line **delta** (Rule 31b/32c), exposes
only its own controls (Rule 31), and holds to the 25–55 EN-word narration budget. No archetype
repeats except the one declared contrast pair.

### `hydrogen_bonding` — 8 states · `placement: free` · 💎 · NCERT Cl.11 Ch.4 §4.9

**Misconception (Rule 16a, confronted at S3 and S6):** *"a hydrogen bond is a bond like any other,"*
and its consequence, *"water boils high because the O–H bonds are strong."* Both die on the same
picture: heat the box, every dashed link fails, and **not one O–H stick ever yields**.
**Universal anchor (Rule 35):** water — it boils at the same temperature everywhere.
**Prerequisites (advisory, Rule 23):** `bond_polarity_dipole_moment` → `vsepr_molecular_shapes`.

| # | Ring | Teaches | Archetype | Delta cue (≤5 words) | Controls | Real number |
|---|---|---|---|---|---|---|
| 1 | core | The δ+ hydrogen is a bare proton — nothing shields it | `charge-reveal` | "Bare positive hydrogen" | — | δ from Δχ(O,H) = 1.24 |
| 2 | core | A second molecule turns and locks on | `approach-and-link` | "Second molecule locks on" | — | H···O 180 pm vs O–H 96 pm |
| 3 | core | **It is not a bond.** Pull them apart: the link fails, the stick does not | `pull-to-break` | "Weak link breaks first" | separation | 20 vs 464 kJ/mol (≈1:23) |
| 4 | core | It needs N, O or F — swap O for S and nothing forms | `species-swap` | "Sulfur cannot hold it" | species | Δχ 1.24 → 0.38 |
| 5 | core | Thirty molecules: links form and break everywhere at once | `network-flicker` | "Links keep re-forming" | count | live link count |
| 6 | ext | **Heat it.** Links fail one by one; every O–H survives | `heat-the-network` | "Heat breaks links only" | temperature | links vs T_K |
| 7 | ext | The anomaly you can now explain | `ladder-compare` | "Water boils far higher" | — | H₂O 373 · H₂S 213 · H₂Se 232 · H₂Te 271 K |
| 8 | core | Explore | `interaction_complete` | — | species · T · count | live link count |

Coherent-when-cut (Rule 38a): hiding S6–S7 leaves what an H-bond is, that it is weak, that it needs
N/O/F, and that it is a live network. Explore surfaces core-ring content only (Rule 38b).
**Engine features exercised:** A, B, C, D, E, H, M. **Not exercised:** F, G, I, J, K.

### `ionic_bonding` — 9 states · `placement: free → lattice` · 💎 · NCERT Cl.11 Ch.4 §4.2

**Misconception (Rule 16a, confronted at S4):** *"NaCl is a molecule — one Na stuck to one Cl."*
It dies when the pair refuses to stay a pair and the lattice grows outward past the frame.
**Universal anchor:** table salt, and why it splits into flat faces instead of denting.
**Prerequisites:** electron configuration, electronegativity.

| # | Ring | Teaches | Archetype | Delta cue | Controls | Real number |
|---|---|---|---|---|---|---|
| 1 | core | One atom has a spare electron, the other a gap | `shell-reveal` | "One spare, one gap" | — | Na 3s¹ · Cl 3s²3p⁵ |
| 2 | core | The transfer — **and both atoms change size** | `transfer-and-resize` | "Electron moves across" | — | Na 186→102 pm · Cl 99→181 pm |
| 3 | core | Opposite charges pull together | `charge-attract` | "Opposite charges pull" | — | Na–Cl 282 pm |
| 4 | core | **The pair does not stay a pair** — the lattice grows | `lattice-grow` | "The pair keeps growing" | — | a = 564 pm |
| 5 | core | Every ion is surrounded by six of the other | `neighbour-highlight` | "Six neighbours, every ion" | spin | coordination 6:6 |
| 6 | ext | Why it melts so high: the whole lattice must go at once | `melt-the-lattice` | "Heat frees the ions" | temperature | 788 kJ/mol · 1074 K |
| 7 | ext | **Why it shatters** — shift one layer one site, like charges meet | `layer-shift-snap` | "One shift, it splits" | shift | — |
| 8 | **adv** | Charge and size set the strength | `charge-swap-compare` | "Double charge, far stronger" | — | MgO 3791 kJ/mol · 3125 K |
| 9 | core | Explore | `interaction_complete` | — | ion pair · size · T · shift | lattice enthalpy · m.p. |

Advanced ring is the single contiguous block immediately before explore (Rule 38a) and is algebra-only
(Rule 38c) — `E ∝ q₁q₂/r`, never the Born–Landé form. Explore holds rock-salt only, which covers
NaCl, KCl, LiF, MgO and CaO from one cell.
**Engine features exercised:** A, C, H, I, J, K, M. **Not exercised:** B, D, E, F, G, L.

### `bond_polarity_dipole_moment` — 8 states · `placement: free`, 1 unit · ⭐

**Misconception:** *"polar bonds ⇒ a polar molecule."* Killed twice — CO₂ at S3, CCl₄ at S5.

| # | Ring | Teaches | Archetype | Delta cue | Controls | Real number |
|---|---|---|---|---|---|---|
| 1 | core | One atom pulls the shared pair harder | `cloud-shift` | "Electrons pull to chlorine" | — | Δχ 0.96 |
| 2 | core | The bond dipole arrow, drawn to scale | `arrow-grow` | "Arrow shows the shift" | ligand | Δχ per halide |
| 3 | core | Two polar bonds, zero molecular dipole | `vector-cancel` | "Opposite arrows cancel" | — | CO₂ μ = 0 D |
| 4 | core | **Bend it and it is polar** — same bonds, different shape | `bend-and-sum` | "Bent shape, arrows add" | bond angle | H₂O μ = 1.85 D |
| 5 | ext | **Four arrows in 3D still sum to zero** (the 💎 state) | `tetra-sum` | "Four arrows, still zero" | spin | CCl₄ μ = 0 D |
| 6 | ext | One substitution breaks the symmetry | `substitute-one` | "One swap breaks it" | — | CHCl₃ μ = 1.04 D |
| 7 | **adv** | The lone pair has a dipole too | `lone-pair-add` | "The lone pair counts" | — | NH₃ 1.47 vs NF₃ 0.23 D |
| 8 | core | Explore | `interaction_complete` | — | molecule · angle · Δχ | live resultant |

**Engine features exercised:** B, C, D, F, L, M.

### `metallic_bonding` — 7 states · `placement: lattice` + sea · 💎

**Misconception:** *"in a metal each electron still belongs to its own atom"* — and the second one,
that conduction is fast because electrons are fast (S4 shows the drift is ~10⁻⁴ m/s; cross-links to
the shipped physics concept `drift_velocity`).
S5 is the **declared contrast pair** with `ionic_bonding` S7 — the same layer-shift motion, the
opposite outcome. It is the only permitted archetype repeat in this wave (Rule 31b).

| # | Ring | Teaches | Archetype | Delta cue | Controls | Real number |
|---|---|---|---|---|---|---|
| 1 | core | Metal atoms pack in a regular lattice | `pack-the-lattice` | "Atoms pack in rows" | — | Na bcc a = 429 pm |
| 2 | core | The outer electrons leave; cores become cations | `release-to-sea` | "Electrons leave their atoms" | — | 1 e⁻ per atom |
| 3 | core | The shared sea is what holds it together | `sea-roam` | "Electrons move freely" | — | n ≈ 2.5×10²⁸ m⁻³ |
| 4 | core | Apply a field: a slow net drift appears | `bias-the-swarm` | "Field adds slow drift" | field | v_d ~10⁻⁴ m/s |
| 5 | core | **Same shift as the salt crystal — the metal holds** | `layer-shift-hold` ⇄ | "Same shift, no split" | shift | — |
| 6 | ext | More free electrons per atom, stronger metal | `valence-ladder` | "More electrons, stronger hold" | valence | Na 371 · Mg 923 · Al 933 K |
| 7 | core | Explore | `interaction_complete` | — | metal · valence · field · shift | m.p. · drift |

**Engine features exercised:** A, C, G, H, I, J, M.

**Union check — every engine row A–M is exercised by at least one designed state, and no designed
state needs a feature outside A–M.** That is the §0d success test made checkable in advance.

---

## 0c — ENGINE ONCE (planned, NOT dispatched)

Owner: **`field3d-surgeon`** (`peter_parker:field3d_surgeon`). Rule 40: lands on **master**,
separately and immediately, never inside a concept branch. Amendment 4: **ONE `bug_class` per
dispatch**, ~100 tool calls / ~45 min each, then a clean handoff note.

| # | Dispatch | Builds | Proven against | Unblocks |
|---|---|---|---|---|
| **E1** | `bonding_scene` substrate | units · species table · per-atom charge + δ labels · `mgFrame` reuse · optional `ligands` array · dipole arrows + derived resultant · deterministic jiggle · HUD + formula surface · closed glow enum · `deriveStateMeta` registration · `check:bonding-scene` skeleton | `bond_polarity_dipole_moment` (simplest consumer — one unit) | Desk 1 starts |
| **E2** | intermolecular link layer | link criterion (distance + angle window) · form/break · live count · species swap · temperature → jiggle amplitude | `hydrogen_bonding` | Desk 1 completes |
| **E3** | lattice layer | `placement:'lattice'` · rock_salt/fcc/bcc · growth beat · coordination highlight · electron transfer + radius re-scale · **derived** layer-shift outcome · electron sea + drift · melt | `ionic_bonding`, `metallic_bonding` | Desk 2 |

**Sequential, not parallel** — E2 and E3 both build on E1's unit layer, and two surgeons in
`field_3d_renderer.ts` at once is the hazard this whole Phase 0 exists to avoid.

### Mandatory for every dispatch (`docs/FIELD3D_SCENARIO_CHECKLIST.md`, pre-paid scars)

- **Register the new scenario in `src/lib/validators/visual/deriveStateMeta.ts` in the SAME change** —
  add `'bonding_scene'` to the field_3d block-key list (`:527`), derive frozen-pin candidates from
  every cue time, and classify `explore` as interactive. Skip it and THE EYE mis-classifies every
  state at the 1500 ms default and false-fails D7/D1p.
- **`config.field_lines.opacity` must exist** (an object, even `{}`) — `createTubeLine` reads it
  unconditionally. The fleet's "blank scene" trap.
- **No frozen tail** — every reveal sustains ≥0.1%/frame motion or the state declares `reveal_hold`.
  The network and sea states self-sustain; the compare/ladder states will need the declaration.
- **The explore state must move on its own** (idle auto-sweep) — the headless harness never drags.
- **`pmCreateAutoLabel` for every label whose text changes**, never `createLabelSprite`.
- **No backticks anywhere in the emitted template, including comments** — write mode names unquoted.
  `npm run check:renderer-syntax` catches it and names the line; it has fired twice on this surface.
- **Author `eye_capture_ms`** on any state whose payoff label lands after the derived pin — the σ/π
  session had eight labels missing from baselines that were minutes from being approved.

### The gate script — `npm run check:bonding-scene` (headless, $0, negative controls on every section)

Built in E1, extended by E2/E3. THE EYE was 39/39 green on the capture containing every one of σ/π's
eight blocking defects; the thing that actually caught them was deriving expected geometry from the
JSON and diffing it against pixels. So this gate asserts numbers, not pixels:

1. Determinism — the same `t` yields byte-identical unit positions across runs (the Rule-36 contract).
2. Charge conservation across the transfer beat (Σq = 0 before and after).
3. Ionic radii match the authored table after transfer (Na⁺ 102, Cl⁻ 181 pm).
4. Symmetric molecules sum to |μ| < 1e-12 (CO₂, CCl₄, CH₄, BF₃) — and CHCl₃ does **not**.
5. Link criterion is symmetric and hysteretic (`form_pm` < `break_pm`; no flicker at the boundary).
6. Rock-salt coordination = 6 for every interior site; fcc = 12; bcc = 8.
7. Layer-shift outcome is **derived** — flipping the lattice's charge pattern flips split ↔ hold with
   no authored change.
8. Jiggle amplitude scales as √T.
9. Every `mode` in the closed enum renders a distinct frame from every other (no silent no-op mode —
   σ/π shipped nine decorative `mode` strings that were never read).
10. `MG_MOLECULES` regression — every existing entry resolves identically with and without `ligands`.

---

## 0d — THE TWO DESKS (concepts as pure JSON)

One desk = one branch = one job, opened when the job starts and closed when it merges
(`docs/GIT_WORKFLOW.md` §7 — `npm run desk:new`).

| Desk | Branch | Concepts (in build order) | Opens after | Touches |
|---|---|---|---|---|
| **1** | `feat/chemistry-polarity-hbonding` | `bond_polarity_dipole_moment` → `hydrogen_bonding` | **E2 on master** | `src/data/concepts/chemistry/*.json` only |
| **2** | `feat/chemistry-ionic-metallic` | `ionic_bonding` → `metallic_bonding` | **E3 on master** | `src/data/concepts/chemistry/*.json` only |

**Both pairings are doubly justified** — by engine surface *and* by pedagogy. Polarity is hydrogen
bonding's prerequisite (Rule 25); metallic bonding's aha is a contrast against ionic bonding's
cleavage. Splitting either pair across desks would put one half of a contrast beat in a branch that
cannot see the other.

Desk 1 can open while E3 is still in flight — it never opens an engine file, so there is no Rule-40
conflict.

**Registration:** chemistry concepts register at **site #1 only** (`src/data/concepts/chemistry/`).
Sites 2/3/4/7/8 are forbidden for chemistry ids until the chemistry serving path lands — Gate 8b is
all-or-nothing (`docs/CHEMISTRY_ARCHITECTURE.md` §7). Validation is `npm run validate:chemistry`;
`validate:concepts` must keep reporting its physics count without ever seeing these files.

**Per concept, the full pipeline applies unchanged** — architect skeleton → founder-proxy
Checkpoint A → chemistry-author → json-author → quality-auditor → THE EYE + eye-walker →
founder-proxy Checkpoint B → `visual:approve` (founder only) → Checkpoint C → ⧉ LAND.

### ⚠ The alarm rule

**A concept after the first one forcing a renderer edit means this Phase 0 under-generalised — STOP
and re-scope with the surgeon.** Never extend the engine per concept; that is exactly how Ch.7 cost
~1,296M tokens for six concepts against Ch.8's ~177M for the same work. The success test is literal:
**concepts 2, 3 and 4 require zero renderer edits.**

---

## OPEN DECISIONS (must be settled before E1 is dispatched)

**OPEN-DECISION-1 — the dipole instrument.** A modelled vector sum moves with the angle slider; the
literature μ in debye does not. Two instruments for one quantity will eventually disagree, in the
same frame, on the primary aha state (the σ/π scar). *Recommendation:* **one instrument** — a single
global constant calibrated on HCl so the model reproduces a real debye value, printed as the live
readout on every state, with each named molecule's experimental μ appearing **once**, in the extended
ring, explicitly labelled as the measured value. To be ratified by `chemistry-author` with the
calibration shown, not asserted.

**OPEN-DECISION-2 — does `hydrogen_bonding` want the ice beat?** Currently deferred (a third cell
type for one state). If the founder wants "why ice floats" in this wave, it belongs to E3, not E2,
and the concept goes to 9 states.

**OPEN-DECISION-3 — build order between the desks.** Desk 2 (`ionic` + `metallic`) has the wider
curriculum reach and closes the IGCSE hole; desk 1 (`polarity` + `hydrogen bonding`) is unblocked
one dispatch sooner. Recommendation: **E1 → E2 → open desk 1 → E3 → open desk 2**, which keeps a desk
working at all times and never has two sessions in the renderer.

---

## GATE BEFORE 0c

Per §0b: **founder-proxy Checkpoint A runs on the deepest-concept skeletons BEFORE any engine code.**
It is the highest-ROI quality slot in the pipeline — a mediocre design caught here saves the whole
build. `hydrogen_bonding` and `ionic_bonding` above are the two skeletons that gate; E1 must not be
dispatched until that checkpoint returns DESIGN_OK.
