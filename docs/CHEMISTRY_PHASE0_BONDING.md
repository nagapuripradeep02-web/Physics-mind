# Phase 0 — the bonding-successors wave (`hydrogen_bonding` · `bond_polarity_dipole_moment` · `ionic_bonding` · `metallic_bonding`)

**Status: 0a + 0b COMPLETE · founder-proxy Checkpoint A `DESIGN_OK` at cycle 2 (2026-08-01).
0c — E1 CLEARED TO DISPATCH; E2/E3 carry the recorded items in the gate section.**
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

> **Amendment log — Checkpoint A cycle 1 (DESIGN_FIX, 2026-08-01).** The v1 union table was
> *asserted* rather than walked state by state, and the walk found **seven designed states — three of
> them core-ring — consuming capabilities the union did not list.** Nine P1 corrections applied:
> union rows N/O/P added and K widened (§union) · closed enums corrected against the actual contents
> of `MG_ELEMENTS`/`MG_MOLECULES` (§enums) · the reuse contract's "one edit" claim corrected
> (§reuse) · `controls` ring-gated (§contract) · the H-bond acceptor whitelist replaced by a derived
> charge threshold (§decision 2) · a derived `like_contacts` readout added to the contrast pair
> (ionic S6 / metallic S5) · engine decisions D-4/D-5/D-6 added · three OPEN scars added to the
> mandatory checklist · the ionic conduction state decided and added. Plus the P2 pass: metallic S6's
> number replaced, ionic S3 re-specced, ionic S9 given a motion, polarity S5 promoted to core, five
> Rule-41 delta cues rewritten.

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

**Why polarity earns its build (corrected at Checkpoint A).** The v1 justification leaned on
Rule 25 — δ+/δ− is hydrogen bonding's prerequisite. That argument justifies *two states*, not eight,
and used alone it is how filler concepts get built. **The real argument is coverage plus a real
examined failure:** full coverage on five of six boards (CBSE §4.4, JEE, IB, AP, A-level), and
"polar bonds ⇒ polar molecule" is a belief a static CO₂ drawing does not kill. Condition attached:
its one 💎 state (S5) is promoted to the **core** ring, so the concept stays defensible under every
reduced preset. The prerequisite relationship remains true and still sets the desk pairing.

Same for the other desk: **metallic bonding's aha state is a contrast against ionic bonding's
cleavage state**, so the pair must be built by one desk that owns both motions.

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

### <a id="union"></a>The union of engine needs

**Corrected at Checkpoint A.** v1 listed A–M and asserted that no designed state needed anything
outside it. Walking the state tables one row at a time (the walk is below) found seven that did.
Rows **N, O, P** are new; **K** is widened.

| # | Need | H-bond | Polarity | Ionic | Metallic |
|---|---|:-:|:-:|:-:|:-:|
| A | Many discrete **units** in one 3D scene | ✅ | — | ✅ | ✅ |
| B | A unit = a rigid multi-atom molecule (internal frame from `mgFrame`) | ✅ | ✅ | — | — |
| C | Per-atom partial/formal **charge** + δ label | ✅ | ✅ | ✅ | ✅ |
| D | Intra-unit bond sticks | ✅ | ✅ | — | — |
| E | **Inter-unit links** that form/break on a *derived* charge + geometry criterion | ✅ | — | — | — |
| F | Per-bond **dipole arrows** + a derived resultant | — | ✅ | — | — |
| G | Free-**electron swarm** with a drift bias | — | — | — | ✅ |
| H | Deterministic **thermal jiggle**, amplitude driven by T | ✅ | — | ✅ | ✅ |
| I | **Lattice placement** (rock salt / fcc / bcc) + a growth beat | — | — | ✅ | ✅ |
| J | **Layer shift** whose outcome (split / hold) is *derived* | — | — | ✅ | ✅ |
| K | **Electron transfer** + a **per-species radius on a linear-in-pm scale** | — | — | ✅ | ✅ |
| L | Mixed ligands on one central atom (CHCl₃, NF₃) | — | ✅ | — | — |
| M | Live numeric HUD + ONE formula surface (Rules 33d / 34b) | ✅ | ✅ | ✅ | ✅ |
| **N** | **Bound / shared valence electrons drawn on an atom** — shell dots, and a two-dot shared-pair glyph that translates rigidly along a bond axis | ✅ | ✅ | ✅ | ✅ |
| **O** | **Comparison / trend surface** — a small axis with plotted points and an extrapolation line | ✅ | — | ✅ | ✅ |
| **P** | **Interior reveal** on a lattice — a cutaway plane or peer-opacity, so an interior site's neighbours are visible | — | — | ✅ | ✅ |
| **Q** | **Ion mobility** — `field`/`drift` applying to ion units, not only to `sea` electrons | — | — | ✅ | — |
| **R** | **Two co-present samples in one frame** — independent lattice + thermal + field per group | — | — | ✅ | — |

**Why each new row exists (the states that forced it):**

- **N** — polarity S1 and h-bond S1 teach "one atom pulls the shared pair harder" and "the δ+ hydrogen
  has nothing shielding it": both are about where a *drawn* electron pair sits. Ionic S1 names
  Na 3s¹ / Cl 3s²3p⁵ and metallic S2 shows outer electrons *leaving*. Row C is a charge **label**, not
  an electron. **Scope guard:** N is a **discrete two-dot glyph that translates rigidly** along the
  bond axis — closed-form, no deforming cloud. That keeps the Fajans deferral honest (see the ledger).
- **O** — h-bond S7's ladder only reads as an *anomaly* against the rising H₂S 213 → H₂Se 232 →
  H₂Te 271 K line and its extrapolation to ~180 K. A value-only HUD (row M) states four numbers; it
  cannot show that water misses the line by ~190 K. Same class: ionic S9 and metallic S6.
- **P** — ionic S5 teaches "every ion is surrounded by six" from *inside* a block. Glow is brightness
  (Rule 29) and cannot defeat occlusion, and
  `field3d_uniform_translucent_same_family_surfaces_fuse_with_no_silhouette_cue` is a CRITICAL
  FIXED scar on three chemistry concepts — a rock-salt block is a wall of identical spheres.
- **K widened** — `MG_ELEMENTS` holds ONE radius per element **and it is legibility-compressed, not
  linear in pm** (H 0.30 vs Cl 0.52 = 1.7×, where real covalent radii are 31 vs 99 pm = 3.2×). Ionic
  S2's whole payoff is Na 186 → 102 pm and Cl 99 → 181 pm read as a *proportional* size change, so
  that state needs a separate per-species table on a linear pm scale.
- **Q** — decided at Checkpoint A along with the new ionic conduction state (see OPEN-DECISION-4).
  Declared now so it is in E3's scope rather than ambushing Desk 2.
- **R** *(added at Checkpoint A cycle 2)* — the two states cycle 1 added and re-specced both put **two
  samples on screen at once**: ionic S8 is *one field, two samples* (solid vs melt) and S9 is *one
  temperature, two lattices* (NaCl melts, MgO holds). A single `lattice` object, a scene-global
  `thermal` block and one flat `units: []` cannot express either, and `compare_at_ms` is a swap in
  *time*, not two co-present samples. The sample-vs-sample race **is** the teaching, so the contract
  gains a `groups: []` layer rather than the states being weakened to sequential swaps. Every other
  comparison in the wave is genuinely sequential (polarity S7 NH₃→NF₃; metallic S6 one cell, valence
  varies) — this row exists for exactly these two states.

> **The cycle-2 lesson, worth stating once:** a state added during a fix cycle was checked against the
> union rows and against the closed enums, and never against whether **one config object can hold
> it**. Cardinality is a third axis. Any state added after a contract exists is re-walked against the
> contract *shape*, not only its vocabulary.

#### The union WALK (replaces the v1 assertion — this is the §0d success test)

Every designed state, and the union rows it consumes. A state with no row is an under-specced engine.

| Concept | State → rows |
|---|---|
| `hydrogen_bonding` | S1 B,C,D,M,**N** · S2 A,B,C,D,E,M · S3 A,B,D,E,M · S4 A,B,C,E,M · S5 A,B,C,E,H,M · S6 A,B,E,H,M · S7 A,B,M,**O** · S8 A,B,C,E,H,M |
| `ionic_bonding` | S1 A,C,M,**N** · S2 A,C,K,M,**N** · S3 A,C,M · S4 A,C,I,M · S5 A,I,M,**P** · S6 A,C,I,J,M · S7 A,C,H,I,M · S8 A,C,H,I,M,**Q**,**R** · S9 A,I,M,**R** · S10 A,C,H,I,J,M,**Q** |
| `bond_polarity_dipole_moment` | S1 B,C,D,M,**N** · S2 B,C,D,F,M · S3 B,D,F,M · S4 B,D,F,M · S5 B,D,F,M · S6 B,D,F,L,M · S7 B,D,F,L,M · S8 B,C,D,F,L,M |
| `metallic_bonding` | S1 A,I,M · S2 A,C,G,I,**N** · S3 A,G,I,M · S4 A,G,I,M · S5 A,C,G,I,J,M · S6 A,G,I,M,**O** · S7 A,C,G,I,J,M |

Both directions check: every row A–Q is claimed by at least one state, and every state claims at
least one row. **Re-run this walk, not the claim, whenever a state is added or an enum changes.**

---

## The engine decision — ONE scenario, `bonding_scene`

A **unit** is the abstraction that unifies all four: an addressable object with a position, an
orientation, a charge, and one or more atoms in a rigid internal frame.

* a **molecule** unit (H₂O, CH₄, CHCl₃) → polarity and hydrogen bonding
* an **ion** unit (Na⁺, Cl⁻) at a lattice site → ionic bonding
* a **cation** unit at a lattice site, plus a shared electron swarm → metallic bonding

`placement: 'free' | 'lattice'` is then the only structural switch, and every other feature is a flag
on top of the same unit list.

### <a id="contract"></a>Config contract (the authoritative shape json-author will target)

```
state.bonding_scene = {
  placement: 'free' | 'lattice',
  mode:  'assemble' | 'transfer' | 'dipole_sum' | 'approach_link' | 'network' | 'compare'
       | 'lattice_grow' | 'coordination' | 'layer_shift' | 'electron_sea' | 'drift' | 'melt'
       | 'explore',                                   // CLOSED enum — 13 modes

  units: [{ id, species, at:[x,y,z], orient:'auto'|[az_deg,el_deg], charge }],

  lattice: { cell:'rock_salt'|'fcc'|'bcc'|'hcp', n:[nx,ny,nz], a_pm,
             grow_at_ms, grow_duration_ms,
             reveal:'none'|'cutaway'|'peer_fade', reveal_at_ms },   // row P
  groups:  [{ id, label, at:[x,y,z], units, lattice, thermal, field }],  // row R —
                                     // two co-present samples; overrides the singletons
                                     // above per group. Absent = one scene-wide sample.
  links:   { enabled, delta_min:{ donor, acceptor }, form_pm, break_pm,
             angle_window_deg, show_count },
                                     // NOT an element whitelist — see decision 2.
                                     // BOTH ends are thresholded: a donor H must be
                                     // δ+ enough AND the acceptor δ− enough.
  dipole:  { show_bond_arrows, show_resultant, show_charges, arrow_scale },
  sea:     { count, speed, field, show_drift },
  ions:    { mobile, field },                        // row Q — ion drift, distinct from `sea`
  electrons:{ show:'none'|'shells'|'pair_glyph', pair_shift },  // row N
  transfer:{ at_ms, duration_ms, from, to },          // mode: transfer
  shift:   { at_ms, duration_ms, offset_sites, plane }, // mode: layer_shift
  thermal: { T_K, jiggle_scale },
  trend:   { show, x_label, y_label, points:[{label,x,y}], extrapolate_from:[...] },  // row O
  compare_at_ms, compare_species,                     // mode: compare

  show_hud, hud_lines: ['links'|'links_per_unit'|'delta_chi'|'mu'|'radius_pm'|'coordination'
                       |'lattice_a'|'lattice_enthalpy'|'melting_point'|'drift'|'valence'
                       |'atomisation'|'bp'|'like_contacts'|'conductivity'],
  show_formula, formula,                              // ONE surface, Rule 34b
  controls: [{ id, min_ring }],                       // RING-GATED — see below
  static_readouts: [...]                              // same rows, disabled, same position
}
```

**`species` — CLOSED enum, corrected against the renderer's actual tables:**

```
molecules: H2O · H2S · H2Se · H2Te · NH3 · NF3 · CH4 · CCl4 · CHCl3 · CO2 · HF · HCl · HBr · HI · BF3
ions:      Na+ · K+ · Li+ · Mg2+ · Ca2+ · Al3+ · Cl- · F- · O2-
atoms:     H · Li · Be · B · C · N · O · F · Na · Mg · Al · P · S · Cl · K · Ca · Br · Se · I · Te
```

**`controls` is ring-gated — `{ id, min_ring }`, not a flat list.** Rule 38a requires that hiding a
ring leaves no surviving state referencing hidden content, and v1's flat control array broke that on
three of four explore states: hide `extended` on `ionic_bonding` and the sandbox still exposed a
`shift` slider that shatters a crystal in a lesson that never showed the shatter. Control ids:
`species · molecule · ligand · angle · temperature · count · separation · spin · shift · field ·
valence · ion_pair · metal`.

**Reconciled against the four state tables in BOTH directions** (Checkpoint A cycle 2). `delta_chi`
and `lattice_size` are gone — after the cycle-1 explore rewrites no state authored either, and an
enum member no state reads is the σ/π "nine decorative `mode` strings" scar in miniature. `ion_pair`
and `metal` are new because ionic S10 and metallic S7 author them. Gate assertion 10 covers `mode`;
**extend it to `controls`** — every declared id is read by ≥1 state, and every id a state authors is
declared.

**Glow-key enum is CLOSED** (scar #33 — a non-keyed `glow_focal` dims the whole scene with no focal
lit): `units | central | links | arrows | resultant | charges | electrons | lattice | layer |
neighbours`.

### Six engine decisions that must be made now, not discovered later

These are the Phase-0 payoff. Each one, discovered mid-build, costs a re-architecture.
**D-1 to D-3 are v1; D-4 to D-6 were added at Checkpoint A.**

**D-1 · Every position is a closed-form pure function of state-local `t`. No integrator anywhere.**
The obvious implementation of "forty jiggling water molecules whose hydrogen bonds keep breaking" is
a molecular-dynamics step loop. **That would break the whole fleet's frozen-baseline contract**
(Rules 26/36): THE EYE's `SET_TIME_FREEZE` capture snaps to a pinned time and must reproduce
byte-identical pixels, which an accumulator cannot do. `molecular_geometry` is accumulator-free
including its spin, and `bonding_scene` must join that set.
*Required form:* each unit's offset is a sum of seeded sines with a per-unit phase **derived from the
unit's index**, amplitude ∝ √(T/T₀). Deriving the phase from the index (not from a running counter)
means changing the `count` slider does not re-seed the units already on screen.
*Added at Checkpoint A:* **D-2's derivation must not smuggle an integrator back in.** The derived
outcome *selects among closed-form trajectories* and may scale their amplitude; the post-split
separation is a ramp of state-local `t`, never an accumulator.

**D-2 · Derived, not authored — and applied to EVERY beat whose conviction depends on emergence.**
`shift` authors the motion only. Whether the crystal splits or holds must fall out of the charges the
lattice already has — like-charge alignment produces net repulsion and the halves separate; a
cation-only lattice with a shared electron sea produces none and the layers settle. This is the
`gas_box` `Ea_rev` lesson: *the derivation is why the beat is convincing instead of scripted.*
**Corrected at Checkpoint A:** v1 stated this for the shift and then authored the h-bond criterion as
a hardcoded `acceptor: ['N','O','F']` whitelist — so S4's lesson ("sulfur cannot hold it") was
scripted in exactly the way this decision forbids, and its real number (Δχ 1.24 → 0.38) was
decoration. **The link criterion is a derived charge threshold:** δ per atom comes from Δχ, and a
link forms when `δ_acceptor ≥ delta_min` **and** distance ∈ [form_pm, break_pm] **and** the D–H···A
angle is inside the window. N, O and F then *emerge* instead of being listed, S4's number drives the
pixels, and the gate gets a real assertion (S fails the threshold; O passes).

**D-3 · ONE instrument per quantity.** The σ/π scar was a slider printing `S/S₀ = 1.000` while the
HUD 500 px above read `0.000` in the same frame. See OPEN-DECISION-1 for how polarity satisfies it.

**D-4 · Camera and countability policy for the four counting states.** *(new)* This wave walks into
two CRITICAL scars. `field3d_counted_element_occluded_along_view_axis` (FIXED, vsepr) was *methane's
fourth bond hidden behind the carbon under a caption reading "Four bonds, one shape"* — and
**polarity S5 is CCl₄ with four arrows under "Four arrows, still zero."** Same geometry, same count,
same caption shape. Both polarity S5 and ionic S5 also carry a `spin` control, which is
`field3d_default_spin_axis_rotates_solved_camera_out_of_countable_view` (CRITICAL, FIXED). **Decide
in E1:** a solved camera per counting mode, plus a `check:bonding-scene` assertion that every counted
element is pairwise separable in NDC at the frozen pin **and across the whole spin window**, using
the perspective projection — the OPEN row
`orthographic_separation_metric_underpredicts_perspective_overlap` says the orthographic metric
under-predicts overlap.

**D-5 · Interior-reveal policy, decided once** (row P): cutaway plane vs peer-opacity for lattice
coordination. One mechanism, authored per state via `lattice.reveal`, never improvised per concept.

**D-6 · Label budget / LOD.** *(new)* H-bond S5 is thirty water molecules — 90 atoms, 60 δ labels,
sticks and flickering links. Every label-collision scar on this surface fires at once
(`field3d_label_sprite_overlap`, `world_anchored_label_collides_needs_screen_space_placement`,
`field3d_name_label_parked_on_its_own_axis`). **Rule: δ labels render on focal units only, capped at
8 on screen at once; every other unit carries colour only.**

**D-7 · The derived contrast metric is defined by what it MEASURES, not by the two values it should
show.** *(added at Checkpoint A cycle 2 — this one nearly shipped wrong.)* `like_contacts` reads
0 → 6 on the ionic lattice and 0 → 0 on the metal. But **in a cation-only lattice every
nearest-neighbour contact is already like-charged** — a bcc metal site has 8 like neighbours before
anything moves. A literal "count like-charge nearest neighbours" metric would read 8 → 8, and gate
assertion 8 would have passed a metric teaching *"a metal has no like-charge neighbours,"* which is
false and is not why metals are malleable. **Definition:** `like_contacts` counts like-charge
nearest-neighbour contacts **created by the shift** (delta against the unshifted lattice) **and left
unscreened** — the electron sea screens every metal contact, before and after. Both 0 → 6 and 0 → 0
are then true, and the state teaches the real reason: non-directional, screened bonding. **Gate
assertion 8 asserts the DEFINITION**, on the case where a naive metric and the intended values
disagree — not just the two authored value pairs.

### <a id="reuse"></a>Reuse contract (what `bonding_scene` must NOT re-derive)

| Reuse | From | Why |
|---|---|---|
| Molecular internal geometry | `mgFrame` / `mgIdealDirs` (`:44928`, `:44857`) | VSEPR angles are already verified against real values; a second table would drift |
| Element colours | `MG_ELEMENTS` (`:44798`) | one palette, tuned for the deep-blue field background |
| Bond sticks | `mgOrientBetween`, `bond_sticks` (orbital_shapes) | already pooled and reposition-per-frame safe |
| Auto-fitting labels | `pmCreateAutoLabel` — **never `createLabelSprite`** | scar: a sprite measures its canvas once from its seed string; a later wider string renders clipped |
| Ramps / smoothing | `mgRamp`, `mgSmooth01` | already pure functions of state-local `t` |

**The edit to existing code is larger than v1 stated, and the regression scope grows with it.**
v1 said "one edit is required" (an optional `ligands` array). Read against the actual tables, the
wave also needs:

1. **~9 new `MG_MOLECULES` entries** — H₂S, H₂Se, H₂Te, CO₂, CCl₄, CHCl₃, NF₃, HBr, HI. The table
   today holds only BeCl₂, BF₃, CH₄, NH₃, H₂O, PCl₅, SF₆ (`:44818`).
2. **~10 new `MG_ELEMENTS` entries** — Na, Mg, Al, K, Ca, Li, Br, I, Se, Te. Today: H, Be, B, C, N,
   O, F, P, S, Cl (`:44798`).
3. **An optional `ligands: [...]` array** per entry, read only by the new scenario
   (`ligands || repeat(ligand, bonds)`), so `mgFrame` and every existing entry stay byte-identical.
4. **A separate per-species radius table on a linear-pm scale** (row K). `MG_ELEMENTS.radius` is
   legibility-compressed and must NOT be repurposed — changing it would move every existing VSEPR
   atom.
   **Which scale applies where (decided at Checkpoint A cycle 2 — E1 must not pick arbitrarily):**
   **molecule atoms use the compressed `MG_ELEMENTS` scale**, because the compression exists for
   legibility (an H at true proportion is a dot) and every VSEPR-derived molecule already reads
   correctly on it; **ions and lattice sites use the linear-pm table**, because there the size change
   *is* the lesson (ionic S2's Na 186 → 102 pm has to read as proportional). Pick one globally and
   either ionic S2's payoff flattens or every molecule renders lopsided.

**Verification is not optional and is now three concepts wide:** `vsepr_molecular_shapes`,
`hybridisation_sp_sp2_sp3` and `sigma_pi_bonding` must all come back unchanged from THE EYE, and
`MG_EXPLORE_MOLECULES` (`:44825`) must be checked so new entries do not leak into VSEPR's explore
picker.

### <a id="ledger"></a>What this wave is deliberately NOT building (the alarm-rule ledger)

§0's alarm rule says a later concept forcing an engine edit means Phase 0 under-generalised. So the
exclusions are declared here with their re-open conditions, rather than discovered by an ambush.

| Deferred | Why | Re-opens when |
|---|---|---|
| **Ice I_h hexagonal lattice** (why ice floats) | A third cell type + a 9% expansion beat, for one state | A dedicated `states_of_matter`/water concept is scheduled — it would carry the whole beat, not borrow one state |
| **Born–Haber cycle** | An energy-ladder *diagram*, i.e. archetype L on `parametric` — a different renderer, not this scenario | Scheduled as its own concept alongside reaction profiles (ranked #9) |
| **Dissolution / hydration shells** | Needs solvent units surrounding an ion — a fourth placement mode | A solubility or electrolysis concept (ranked #20/#21, P5) |
| **Fajans' rules / polarisation of the anion** | A *deforming* charge cloud. Row N is deliberately scoped to a **rigid two-dot glyph** so this stays out — that scoping is what keeps the deferral honest (Checkpoint A finding) | Advanced-ring demand from a real teacher |
| **Alloys / substitutional lattices** | A second species on metal sites | An alloys concept is scheduled |
| **Covalent network solids** (diamond, SiO₂) | Directional lattice bonds, a different cell | Giant-covalent-structure concept (strong IGCSE candidate) |

Checkpoint A walked all four state tables against this ledger: only the Fajans row was load-bearing,
and the row-N scoping above resolves it. The other five are genuinely not touched by these arcs.

---

## 0b — DEEPEST-CONCEPT DESIGN

The union has **two disjoint halves**, so one skeleton cannot spec the engine. Two are written in
full — the deepest of each half — and the other two carry engine-facing state tables.

* **`hydrogen_bonding`** is the deepest on the *free-placement* half (units + links + jiggle + species
  compare + temperature).
* **`ionic_bonding`** is the deepest on the *lattice* half (lattice + transfer + coordination + melt +
  layer shift + ion drift).

Every state below names its motion **archetype** and its one-line **delta** (Rule 31b/32c), exposes
only its own controls (Rule 31), and holds to the 25–55 EN-word narration budget. Delta cues are
basic literal English (Rule 41) — five were rewritten at Checkpoint A for personification or an
ambiguous referent.

**Two archetype repeats, both DECLARED (Rule 31b):**
1. `layer-shift-snap` (ionic S6) ⇄ `layer-shift-hold` (metallic S5) — the contrast pair. Same motion,
   same `like_contacts` readout, opposite derived outcome.
2. `pair-shift` (polarity S1) ⇄ `pair-shift` (hydrogen bonding S1) — *cross-concept*, and deliberate:
   the student meets the shared pair moving off the hydrogen in the prerequisite concept, then meets
   the identical picture where it is used. Declared rather than renamed, because the reuse is the
   pedagogy (Rule 25 foundation-first made visible).

### `hydrogen_bonding` — 8 states · `placement: free` · 💎 · NCERT Cl.11 Ch.4 §4.9

**Misconception (Rule 16a, confronted at S3 and S6):** *"a hydrogen bond is a bond like any other,"*
and its consequence, *"water boils high because the O–H bonds are strong."* Both die on the same
picture: heat the box, every dashed link fails, and **not one O–H stick ever yields**.
**Universal anchor (Rule 35):** water — it boils at the same temperature everywhere.
**Prerequisites (advisory, Rule 23):** `bond_polarity_dipole_moment` → `vsepr_molecular_shapes`.

| # | Ring | Teaches | Archetype | Delta cue (≤5 words) | Controls | Real number |
|---|---|---|---|---|---|---|
| 1 | core | The δ+ hydrogen is a bare proton — the shared pair sits far from it | `pair-shift` | "Bare positive hydrogen" | — | Δχ(O,H) = 1.24 |
| 2 | core | A second molecule turns and attaches | `approach-and-link` | "Second molecule attaches" | — | H···O 180 pm vs O–H 96 pm |
| 3 | core | **It is not a bond.** Pull them apart: the link fails, the stick does not | `pull-to-break` | "Weak link breaks first" | separation | 20 vs 464 kJ/mol (≈1:23) |
| 4 | core | It needs a strongly negative atom — swap O for S and no link forms | `species-swap` | "Sulfur is not negative enough" | species | δ from Δχ 1.24 → 0.38 |
| 5 | core | Thirty molecules: links form and break everywhere at once | `network-flicker` | "Links keep re-forming" | count | **≈3.5 links per molecule** |
| 6 | core | **Heat it.** Links fail one by one; every O–H survives | `heat-the-network` | "Heat breaks links only" | temperature | links vs T_K |
| 7 | core | The anomaly you can now explain | `trend-break` | "Water breaks the trend" | — | H₂S 213 · H₂Se 232 · H₂Te 271 K, trend → ~180; H₂O **373** |
| 8 | core | Explore | `interaction_complete` | — | species · count · temperature (all core) | live link count |

S4's number now *drives* the pixels (D-2). S5's readout is **links per molecule**, not a raw count —
it is the number that explains S7. S7 plots the trend (row O) rather than listing four values: the
anomaly is the ~190 K gap between water and its own family's line.
**All eight states are `core` (promoted at Checkpoint A cycle 2).** S6–S7 were `extended`, which put
**the boiling-point anomaly — this concept's literal whiteboard-test justification in the 0a table —
outside the core-only preset**, i.e. outside IGCSE, the youngest grade and the one this wave exists
to serve. It broke no rule (both cuts survived) but it was a preset-mapping the doc had not made.
The concept therefore has no extended ring and no advanced ring; the only cut is the trivial one, and
that is the honest tag for a topic IGCSE, IB, AP and A-level all treat in full.

### `ionic_bonding` — 10 states · `placement: free → lattice` · 💎 · NCERT Cl.11 Ch.4 §4.2

**Misconception (Rule 16a, confronted at S4):** *"NaCl is a molecule — one Na stuck to one Cl."*
It dies when the pair refuses to stay a pair and the lattice grows outward past the frame.
**Universal anchor:** table salt — why it splits into flat faces instead of denting.
**Prerequisites:** electron configuration, electronegativity.

| # | Ring | Teaches | Archetype | Delta cue | Controls | Real number |
|---|---|---|---|---|---|---|
| 1 | core | One atom has a spare outer electron, the other has a gap | `shell-reveal` | "One spare, one gap" | — | Na 3s¹ · Cl 3s²3p⁵ |
| 2 | core | The transfer — **and both atoms change size** | `transfer-and-resize` | "Electron moves, sizes swap" | — | Na 186→102 pm · Cl 99→181 pm |
| 3 | core | Attraction pulls them in; the cores stop them **at** 282 pm | `pull-to-balance` | "Attraction stops at 282" | — | Na–Cl 282 pm |
| 4 | core | **The pair does not stay a pair** — more ions keep joining | `lattice-grow` | "More ions keep joining" | — | a = 564 pm |
| 5 | core | Every ion is surrounded by six of the other | `neighbour-cutaway` | "Six neighbours, every ion" | spin | coordination 6:6 |
| 6 | core | **Why it shatters** — shift one layer one site, like charges meet | `layer-shift-snap` ⇄ | "One shift, it splits" | shift | **like-charge contacts 0 → 6** (D-7) |
| 7 | core | Why it melts so high: the whole lattice must go at once | `melt-the-lattice` | "Heat frees the ions" | temperature | 788 kJ/mol · 1074 K |
| 8 | core | **Molten conducts, solid does not** — the same field on both | `field-on-both` | "Free ions carry charge" | field | conductivity: melt vs solid, **≈10¹³-fold** ⚠ |
| 9 | **adv** | Charge and size set the strength | `melt-race` | "Double charge, far stronger" | — | MgO 3791 kJ/mol · 3125 K vs NaCl 788 · 1074 |
| 10 | core | Explore | `interaction_complete` | — | ion_pair · spin · temperature · shift · field (all core) | lattice enthalpy · m.p. |

Changes from v1, all Checkpoint A: **S3 re-specced** — "opposite charges pull" was directly
predictable from S2 and taught nothing new; the *balance* (attraction in, core repulsion out, settling
exactly at 282 pm) is real information and it sets S4's spacing. **S6 gains a derived number** —
`like_contacts` 0 → 6 makes D-2's derivation *readable* instead of implied; it is also what the
metallic contrast reads against. **S8 is new** (OPEN-DECISION-4). **S9 is now a motion** — both
lattices heat at one temperature, NaCl melts, MgO holds — instead of a static two-value comparison.
S2 labels both radii "atomic radius" and states the metallic / covalent basis once, so the 186 vs
99 pm comparison is honest.

**Cycle-2 changes.** S6–S8 promoted `extended` → **`core`**: they are the three examinable ionic
properties (shatters · high melting point · conducts when molten), and leaving all three outside the
core-only preset would have emptied this concept for exactly the IGCSE audience the wave targets —
where ionic bonding is the *chapter opener*. Only S9 (MgO) stays advanced, still contiguous and still
immediately before explore. Explore's controls are consequently all core. ⚠ **S8's conductivity
endpoints need `chemistry-author` ratification** — the teaching number is the *gap* (roughly thirteen
orders of magnitude between molten and solid NaCl), not the endpoint values, which must be quoted
with their units and temperatures or not at all (Rule 33d).

The advanced ring is the single contiguous block immediately before explore (Rule 38a) and is
algebra-only (Rule 38c) — `E ∝ q₁q₂/r`, never the Born–Landé form. Explore holds rock-salt only,
which covers NaCl, KCl, LiF, MgO and CaO from one cell.

### `bond_polarity_dipole_moment` — 8 states · `placement: free`, 1 unit · ⭐

**Misconception:** *"polar bonds ⇒ a polar molecule."* Killed twice — CO₂ at S3, CCl₄ at S5.
Six of eight states run `mode: dipole_sum`, so **each authors its own cue timing** — the
hybridisation scar (d): *an archetype is a claim about rhythm, not a label*, and same-element-count
states with identical timing deliver the same motion however they are named.

| # | Ring | Teaches | Archetype | Delta cue | Controls | Real number |
|---|---|---|---|---|---|---|
| 1 | core | One atom pulls the shared pair harder | `pair-shift` | "Shared pair moves to chlorine" | — | Δχ 0.96 |
| 2 | core | The bond dipole arrow, drawn to scale | `arrow-grow` | "Arrow shows the shift" | ligand | Δχ across HF/HCl/HBr/HI |
| 3 | core | Two polar bonds, zero molecular dipole | `vector-cancel` | "Opposite arrows cancel" | — | CO₂ μ = 0 D |
| 4 | core | **Bend it and it is polar** — same bonds, different shape | `bend-and-sum` | "Bent shape, arrows add" | bond angle | H₂O μ = 1.85 D |
| 5 | **core** | **Four arrows in 3D still sum to zero** (the 💎 state) | `tetra-sum` | "Four arrows, still zero" | spin | CCl₄ μ = 0 D |
| 6 | ext | One substitution breaks the symmetry | `substitute-one` | "One swap breaks symmetry" | — | CHCl₃ μ = 1.04 D |
| 7 | **adv** | The lone pair has a dipole too | `lone-pair-add` | "Lone pair adds a dipole" | — | NH₃ 1.47 vs NF₃ 0.23 D |
| 8 | core | Explore | `interaction_complete` | — | molecule · angle · ligand (all core) | live μ in debye |

**S5 promoted to `core` at Checkpoint A.** It is the concept's only 💎 state; leaving it in the
extended ring meant the core-only preset — which is exactly the IGCSE cut where this concept is
already marked `partial` — delivered only what a whiteboard can. NCERT §4.4 treats CCl₄/CO₂/H₂O/NH₃/
NF₃ as mainline, so `core` is also the truer tag. S2's halide ladder now has four rungs.

### `metallic_bonding` — 7 states · `placement: lattice` + sea · 💎

**Misconception:** *"in a metal each electron still belongs to its own atom"* — and the second one,
that conduction is fast because electrons are fast (S4 shows the drift is ~10⁻⁴ m/s; cross-links to
the shipped physics concept `drift_velocity`).
S5 is the **declared contrast pair** with `ionic_bonding` S6 — the same layer-shift motion, the same
`like_contacts` readout, the opposite outcome (0 → 6 vs 0 → 0). It is the only permitted archetype
repeat in this wave (Rule 31b).

| # | Ring | Teaches | Archetype | Delta cue | Controls | Real number |
|---|---|---|---|---|---|---|
| 1 | core | Metal atoms pack in a regular lattice | `pack-the-lattice` | "Atoms pack in rows" | — | Na bcc a = 429 pm |
| 2 | core | The outer electrons leave; cores become cations | `release-to-sea` | "Outer electrons come free" | — | 1 e⁻ per atom |
| 3 | core | The shared sea is what holds it together | `sea-roam` | "Electrons move everywhere" | — | n ≈ 2.5×10²⁸ m⁻³ |
| 4 | core | Apply a field: a slow net drift appears | `bias-the-swarm` | "Field adds slow drift" | field | v_d ~10⁻⁴ m/s |
| 5 | core | **Same shift as the salt crystal — the metal holds** | `layer-shift-hold` ⇄ | "Same shift, no split" | shift | **like-charge contacts 0 → 0** |
| 6 | ext | More free electrons per atom, stronger metal | `valence-ladder` | "More electrons, stronger hold" | valence | **ΔH_atomisation Na 107 · Mg 146 · Al 326 kJ/mol** |
| 7 | core | Explore | `interaction_complete` | — | metal · field · shift (core) · valence (**ext**) | drift · ΔH_at |

**S6's number replaced at Checkpoint A.** v1 used melting points — Na 371 → Mg 923 → **Al 933 K** is
a 1% rise for a 50% increase in valence electrons, so the number contradicted the claim, and m.p. is
a poor proxy for metallic bond strength anyway (packing dominates; Hg vs W). **Enthalpy of
atomisation is monotonic and it *is* bond strength.** Melting point stays available in explore as
context, never as the evidence for S6's claim.

**Species/cell decision for S6:** Mg is hcp, Na is bcc, Al is fcc. Rather than teach three packings
in a state whose taught variable is electron count (Rule 32b — only the taught variable moves), **S6
holds ONE representative cell and varies only the valence count**, and never labels that cell with a
metal whose real packing differs. `hcp` is nonetheless in the `lattice.cell` enum so explore can show
each metal in its true cell.

---

## 0c — ENGINE ONCE (planned, NOT dispatched)

Owner: **`field3d-surgeon`** (`peter_parker:field3d_surgeon`). Rule 40: lands on **master**,
separately and immediately, never inside a concept branch. Amendment 4: **ONE `bug_class` per
dispatch**, ~100 tool calls / ~45 min each, then a clean handoff note.

| # | Dispatch | Builds | Proven against | Unblocks |
|---|---|---|---|---|
| **E1** | `bonding_scene` substrate | units · species/element/molecule table growth · per-atom charge + δ labels · row N electron glyphs · `mgFrame` reuse · optional `ligands` array · linear-pm radius table · dipole arrows + derived resultant · deterministic jiggle · ring-gated controls · HUD + formula surface · closed glow enum · **D-4 camera/countability** · **D-6 label budget** · `deriveStateMeta` registration · `check:bonding-scene` skeleton | `bond_polarity_dipole_moment` (simplest consumer — one unit) | Desk 1 starts |
| **E2** | intermolecular link layer | **derived** charge-threshold link criterion · form/break hysteresis · links-per-unit readout · species swap · temperature → jiggle amplitude · **row O trend surface** | `hydrogen_bonding` | Desk 1 completes |
| **E3** | lattice layer | `placement:'lattice'` · rock_salt/fcc/bcc/hcp · growth beat · **row P interior reveal (D-5)** · coordination highlight · electron transfer + linear-pm radius re-scale · **derived** layer-shift outcome + the **D-7** `like_contacts` metric · electron sea + drift · **row Q ion drift** (with the solid-sample negative control) · **row R `groups` layer** · melt | `ionic_bonding`, `metallic_bonding` | Desk 2 |

**Sequential, not parallel** — E2 and E3 both build on E1's unit layer, and two surgeons in
`field_3d_renderer.ts` at once is the hazard this whole Phase 0 exists to avoid.

**Enum freeze rule (Checkpoint A):** the shared config enums freeze after **E1**. If E3 needs to
amend them, the amendment is written into this doc **before Desk 1 authors against them** — otherwise
Desk 1's JSON is written against a moving contract.

### Mandatory for every dispatch (`docs/FIELD3D_SCENARIO_CHECKLIST.md`, pre-paid scars)

- **Register the new scenario in `src/lib/validators/visual/deriveStateMeta.ts` in the SAME change** —
  add `'bonding_scene'` to the field_3d block-key list (`:527`), derive frozen-pin candidates from
  every cue time, and classify `explore` as interactive. Skip it and THE EYE mis-classifies every
  state at the 1500 ms default and false-fails D7/D1p.
- **`config.field_lines.opacity` must exist** (an object, even `{}`) — `createTubeLine` reads it
  unconditionally. The fleet's "blank scene" trap.
- **`render_annotations: true`, or `scene_composition` annotations are a silent no-op** — OPEN scars
  `field3d_scene_composition_annotation_silent_noop` and
  `rule19_primitives_satisfied_by_json_the_renderer_never_receives`: Rule 19 gets satisfied by JSON
  the renderer never sees. Every annotation also carries `at_ms`/`until_ms`.
- **A scripted beat and the slider that shares its quantity must move together** (drag-seize) —
  FIXED scar `scripted_change_desyncs_the_dom_control_that_shares_it`, plus the OPEN
  `ghost_compare_cause_invisible_slider_frozen`. Hit by h-bond S3 (`separation`) and ionic S6
  (`shift`), both of which have a scripted beat *and* a live control.
- **`top: 52px` clearance on any new top-anchored DOM panel** (both edges) — OPEN scar
  `field3d_sliders_panel_top12_vs_fsbtn_top10`; the HUD must clear the review-chrome full-screen
  button (Rule 34d).
- **No frozen tail** — every reveal sustains ≥0.1%/frame motion or the state declares `reveal_hold`.
  The network and sea states self-sustain; the trend/compare states will need the declaration.
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

1. Determinism — the same `t` yields byte-identical unit positions across runs (the Rule-36
   contract), **including after the `count` slider changes** (index-derived phase, D-1).
2. Charge conservation across the transfer beat (Σq = 0 before and after).
3. Ionic radii match the authored linear-pm table after transfer (Na⁺ 102, Cl⁻ 181 pm) — and the
   rendered radius ratio is linear in pm, not the compressed `MG_ELEMENTS` scale.
4. Symmetric molecules sum to |μ| < 1e-12 (CO₂, CCl₄, CH₄, BF₃); CHCl₃ does **not**; and NH₃ > NF₃
   (the lone-pair term, OPEN-DECISION-1).
5. **The resultant's direction convention (δ+ → δ−) asserted once** — a sign flip renders perfectly
   while teaching the reverse (CRITICAL scar
   `superposed_orbital_sign_convention_inverts_the_taught_direction`, hybridisation).
6. Link criterion is **derived** at BOTH ends: sweeping δ across `delta_min.acceptor` flips link
   formation with no authored change (O passes, S fails), and a donor whose δ+ is below
   `delta_min.donor` forms none; `form_pm` < `break_pm` so there is no flicker at the boundary.
7. Rock-salt coordination = 6 for every interior site; fcc = 12; bcc = 8; hcp = 12.
8. Layer-shift outcome is **derived** — flipping the lattice's charge pattern flips split ↔ hold with
   no authored change. **And the metric itself is asserted, not only its two outputs (D-7):** a naive
   like-neighbour count is evaluated on the cation-only lattice and must be non-zero *before* any
   shift, proving the shipped metric is change-based-and-screened rather than a raw count that
   happens to print the right pair of numbers.
9. Jiggle amplitude scales as √T.
10. Every `mode` in the closed enum renders a distinct frame from every other (no silent no-op mode —
    σ/π shipped nine decorative `mode` strings that were never read). **Same test for `controls` and
    `hud_lines`:** every declared id is read by ≥1 state, and every id a state authors is declared.
13. **Row Q negative control** — under a field, the ions of the SOLID sample must not move. A silent
    no-op there makes ionic S8 teach the exact opposite of its lesson, and nothing else catches it.
14. **Row R** — two `groups` render with independent lattice, thermal and field state: heating group A
    past its melting point leaves group B's lattice bit-for-bit unchanged.
11. **Countability (D-4)** — every counted element is pairwise separable in NDC under the perspective
    projection, at the frozen pin **and** across the full spin window.
12. **`MG_MOLECULES` / `MG_ELEMENTS` regression** — every pre-existing entry resolves identically
    with and without `ligands`, and `MG_EXPLORE_MOLECULES` is unchanged.

---

## 0d — THE TWO DESKS (concepts as pure JSON)

One desk = one branch = one job, opened when the job starts and closed when it merges
(`docs/GIT_WORKFLOW.md` §7 — `npm run desk:new`).

| Desk | Branch | Concepts (in build order) | Opens after | Touches |
|---|---|---|---|---|
| **1** | `feat/chemistry-polarity-hbonding` | `bond_polarity_dipole_moment` → `hydrogen_bonding` | **E2 on master** + the three-concept EYE regression green | `src/data/concepts/chemistry/*.json` only |
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
**concepts 2, 3 and 4 require zero renderer edits**, and it is checked by re-running the union WALK
above, not by re-asserting it.

---

## OPEN DECISIONS

**OPEN-DECISION-1 — the dipole instrument. RESOLVED at Checkpoint A; the v1 proposal is withdrawn.**
One instrument is right (D-3). The v1 method — *a single global constant calibrated on HCl* — was
wrong and would have recreated the very scar it was meant to prevent: a Δχ-linear model calibrated on
HCl does not reproduce H₂O 1.85 D or NH₃ 1.47 D, and it cannot produce NF₃ 0.23 D at all, because S7
exists precisely where a bond-dipole sum fails without a lone-pair term. It would have printed debye
values contradicting the debye values in the extended ring.
**Ratified instead:** a small table of **published bond moments** (O–H, N–H, C–Cl, C–H, C–O, N–F, …)
plus an **explicit lone-pair moment term**, summed vectorially in the `mgFrame`. That is the standard
treatment, it reproduces H₂O, CHCl₃ and the NH₃/NF₃ reversal within textbook tolerance, and the live
readout is then honestly in **debye** — one instrument, agreeing with literature by construction,
with arrow lengths driven by the same table (Rule 29). `chemistry-author` ratifies the table and
**shows the calibration**, never asserts it. Gate assertions 4 and 5 cover it.

**OPEN-DECISION-2 — the ice beat. RESOLVED: defer.** A third cell type + a 9% expansion + a density
instrument, to buy one state, in a concept that already lands its anomaly payoff at S7. Two anomaly
payoffs in one 8-state arc dilute each other. It belongs to a water/`states_of_matter` concept that
can carry the whole beat. In the ledger with its re-open condition.

**OPEN-DECISION-3 — build order. RESOLVED: E1 → E2 → desk 1 → E3 → desk 2**, with two conditions:
(a) Desk 1 does not open until the `MG_MOLECULES`/`MG_ELEMENTS` regression is green across
`vsepr_molecular_shapes`, `hybridisation_sp_sp2_sp3` and `sigma_pi_bonding`, plus the
`MG_EXPLORE_MOLECULES` leak check; (b) the enum freeze rule above.

**OPEN-DECISION-4 — ionic conduction. RESOLVED at Checkpoint A: BUILD IT (new state S8), and
declare row Q in E3's scope.** "It conducts when molten but not when solid" is the most-examined
ionic property across CBSE, IGCSE and A-level and was absent from the arc. It sits naturally after
the melt (the ions are already free), it is a motion rather than a claim (one field, two samples),
and it is cheap — **but only because `field`/`drift` are now declared to apply to ion units and not
only to `sea` electrons.** As drafted in v1 they were electron-only, so this would have been an
engine edit discovered inside Desk 2, i.e. the alarm rule. `ionic_bonding` goes to 10 states; the
core cut (S1–S5 + explore) is unchanged.

---

## GATE BEFORE 0c

Per §0b: **founder-proxy Checkpoint A runs on the deepest-concept skeletons BEFORE any engine code.**
It is the highest-ROI quality slot in the pipeline — a mediocre design caught here saves the whole
build.

- **Cycle 1 (2026-08-01): `DESIGN_FIX`.** Nine P1 findings + a P2 pass, all applied above. The
  load-bearing one: the union table was asserted rather than walked, and the walk found seven
  designed states — three core-ring — consuming capabilities the union did not list.
- **Cycle 2 (2026-08-01): `DESIGN_OK`.** All nine cycle-1 fixes verified as landed *correctly*
  rather than cosmetically; both ring cuts re-run against the new 10-state ionic arc; enums re-checked
  against `field_3d_renderer.ts:44781–44826`. Two blocking enum edits (`Al3+`; the `controls` list
  reconciled in both directions) and seven carry-forward items — all applied above:

  | Item | Where it landed |
  |---|---|
  | `Al3+` missing from the ions enum (metallic S6 needs it) | §contract species |
  | `controls` list unreconciled — `ion_pair`/`metal` unlisted, `delta_chi`/`lattice_size` unread | §contract + gate 10 |
  | **Ionic S8/S9 need two co-present samples; the contract had one `lattice` + one global `thermal`** | **row R + `groups` layer + gate 14** |
  | **`like_contacts` metric undefined — a naive count reads 8 → 8 on a metal and would pass gate 8** | **D-7 + gate 8** |
  | `links` lost its donor threshold in the cycle-1 rewrite | §contract + gate 6 |
  | No rule for which radius scale applies to molecules vs ions | §reuse item 4 |
  | Ionic S8 had a category, not a number; no negative control for row Q | S8 row + gate 13 |
  | h-bond S6–S7 and ionic S6–S8 sat outside the core preset — i.e. outside IGCSE | promoted to `core` |
  | Walk-row inaccuracies (5); `pair-shift` an undeclared cross-concept repeat; citation drift | walk · §0b · §reuse |

**E1 is CLEARED to dispatch.** B1/B2 (rows R and D-7) are recorded here so E3's dispatch prompt
carries them, and both meet Checkpoint A a second time on `ionic_bonding`'s own skeleton before
Desk 2 opens. No third proxy cycle is needed.
