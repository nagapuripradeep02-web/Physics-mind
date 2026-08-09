# Phase 0 — Wave O-0, the representation foundation (`organic_structure`, Engine A)

> **Status: PLANNING ARTIFACT (Rule 17) — 2026-08-09, branch `feat/organic-o0-engine-a`.**
> Executes step 1 of `docs/ORGANIC_BUILD_PLAN.md` §8 ("Wave O-0 behind an Engine-A Phase-0 build").
> Follows the Phase-0 doctrine in `docs/AUTHORING_PIPELINE.md` §0 (0a survey → 0b deepest-concept
> design → 0c engine once → 0d concepts as pure JSON). Sibling of `docs/CHEMISTRY_PHASE0_BONDING.md`,
> which is the shape this doc copies.
>
> **⚠ AMENDED 2026-08-09 by `docs/ORGANIC_ENGINE_PLAN.md`** (founder: *"we first plan to cover all
> organic simulations"*). That doc unions the engine needs of all 32 organic sims and supersedes this
> one wherever they differ. Four corrections are already applied below — the `mode` enum now closes
> over all 32 rather than over Wave O-0, the energy instrument is generalised, `rehybridise` is named
> as substrate, and §0c is five dispatches instead of four. **Read `ORGANIC_ENGINE_PLAN.md` first;
> this doc is the O-0 execution detail beneath it.**
>
> **NOTHING IS DISPATCHED.** 0c below is a plan, not a build. The gate before 0c is founder-proxy
> Checkpoint A on the 0b skeleton, then founder go.
>
> **⚠ Rule 38g — every curriculum cell is a CLAIM.** Only CBSE/NCERT is author-verified.

---

## 0a — CHAPTER SURVEY

### The seven O-0 concepts, measured

Ordered as `ORGANIC_BUILD_PLAN.md` §4 numbers them. "Explore state" = the Rule-31 final sandbox.

| # | Concept | Apparatus on stage | What MOVES | What is MEASURED | Explore state |
|---|---|---|---|---|---|
| 1 | **bond-line ↔ 3D structure** | a flat bond-line sketch + the same molecule as a 3D skeleton | the flat cross relaxes out of the sketch plane into tetrahedral slots; implicit H appear | C–C–C angle: **109.5°** true vs the ~120° the paper shows; implicit-H count | drag the camera; toggle implicit H; step chain length |
| 2 | **conformations of ethane** | C₂H₆, front C + back C, Newman view | the **dihedral φ** sweeps 0→360° | φ in degrees; **E(φ)** in kJ/mol on a live curve; barrier **12 kJ/mol** | φ slider, free-running; view toggle (Newman ↔ sawhorse) |
| 3 | **conformations of butane** | C₄H₁₀, torsion about C2–C3 | the same dihedral, now with a CH₃ on each end | φ; E(φ) with **three minima** and **four distinct conformations** (gauche⁺/gauche⁻ are a degenerate enantiomeric pair — one literature value appearing twice); anti 0, gauche **+3.8**, CH₃/H ecl **+16**, syn **+19** kJ/mol | φ slider + which substituent sits on the front carbon |
| 4 | **cyclohexane chair flip** | C₆H₁₂, 18 atoms, ring drawn | the ring **puckers** chair → half-chair → twist-boat → boat → … → chair′; every axial bond becomes equatorial | pucker coordinate; E along it, barrier **45 kJ/mol** via the half-chair; with a CH₃, the **95 : 5** equatorial preference | pucker slider; place a substituent; temperature |
| 5 | **chirality & optical isomerism** | a stereocentre with four different groups, and its mirror image | the mirror image is generated, then **rigid-body rotated in an attempt to superimpose** — and fails | the residual after best-fit overlay; CIP priorities → R/S | rotate either molecule freely; swap any two groups and watch R/S flip |
| 6 | **geometrical isomerism (cis/trans, E/Z)** | C₂H₄-type skeleton with a C=C | an attempted twist about the C=C — π overlap **collapses**, so the twist is costed and blocked | twist angle; π overlap falling to zero; the two distinct compounds | twist slider (it resists); swap substituents to flip E/Z |
| 7 | **structural isomerism** | one molecular formula, several skeletons | connectivity rewires between chain / position / functional isomers | atom count held constant while connectivity changes | pick the formula; step through its isomers |

### Curriculum reach (Rule 38g CLAIMS)

| # | CBSE/JEE/NEET | IGCSE | IB | AP | A-level | Score |
|---|---|---|---|---|---|---|
| 1 | ✅ author-verified | ✅ | ✅ | ✅ | ✅ | 5/5 claim |
| 2 | ✅ | — | ✅ | — | ✅ | 3/5 |
| 3 | ✅ (JEE) | — | — | — | ✅ | 2/5 |
| 4 | ✅ (JEE) | — | ✅ HL | — | ✅ | 3/5 |
| 5 | ✅ | light | ✅ | — | ✅ | 4/5 |
| 6 | ✅ | ✅ | ✅ | — | ✅ | 4/5 |
| 7 | ✅ | ✅ | ✅ | — | ✅ | 4/5 |

Consistent with `ORGANIC_BUILD_PLAN.md` §1: organic is **India-led**. AP carries almost none of this
wave. Nothing here is a 6/6 the way physical chemistry was — that trade was made deliberately in the
build plan and is not re-litigated here.

### The FIRST question — does an existing scenario family stretch?

The doctrine's cheapest Phase 0 is the one you discover you do not need. Three live families were
read against the union. **None stretches, and the reason is the same in each case: every organic
concept above needs an INTERNAL degree of freedom inside ONE molecule, and no live scenario has one.**

| Family | What it gives | Why it does not stretch | Evidence |
|---|---|---|---|
| `molecular_geometry` | one central atom, up to 6 electron domains, verified VSEPR angles | one centre only. Ethane has two, cyclohexane six. No dihedral concept exists | `MG_MAX_BONDS = 6` (renderer :58209); `mgFrame(molKey, angleDeg, domainsOverride)` returns one frame (:58455) |
| `bonding_scene` | many addressable UNITS, per-atom charge, thermal jiggle, ring-gated controls, closed-form t | a UNIT is *"one or more atoms in a **RIGID** internal frame"* — rigid is the whole abstraction. Its only internal freedom is a bond **angle** bend, which is not a torsion | header :59306-59310; `BS_MAX_ATOMS = 7` (:59416) vs ethane 8 / butane 14 / cyclohexane 18; `angle_deg / angle_from / angle_ramp_ms` (:59349) is a bend |
| `orbital_shapes` | **`twist_deg` + `twist_ramp`** — a scripted rotation about a bond axis, with overlap falling as it turns | the right MECHANISM on the wrong stage: two atoms' worth of lobes, no substituents, no skeleton, no energy curve | :63876-63877, the σ/π `twist` payoff |

**Verdict: a real gap → one new scenario.** But the gap is narrower than it looks, and §reuse below
holds the engine to what it must *not* re-derive. `orbital_shapes`' twist is the direct ancestor of
concept #6, and `mgFlatSources()` (:58494) — *"greedy max-dot pairing from the FLAT board-sketch
cross onto the true tetrahedral slots"* — is concept #1's central move, already built and already
camera-basis aware.

### <a id="union"></a>The union of engine needs

| | Need | Consumers |
|---|---|---|
| **U1** | a multi-atom **skeleton** from a closed molecule table: explicit connectivity, >7 atoms, drawn bonds, per-atom labels | all 7 |
| **U2** | a driven **dihedral** about a named bond — closed-form φ(t), plus discrete pose targets (staggered / eclipsed / anti / gauche) | 2, 3, (4) |
| **U3** | **ring pucker** along a named path (chair → half-chair → twist-boat → boat), with axial/equatorial bond directions following the pucker and re-tagging at the far end | 4 |
| **U4** | a live **energy instrument**: E(coordinate) curve + a point riding it + a value-only HUD (Rule 33d) | 2, 3, 4, 6 |
| **U5** | a **sight-down-the-bond (Newman) camera mode**, plus an honest-angle discipline | 2, 3 |
| **U6** | a **mirror + superimposition-attempt** operation with a published residual | 5 |
| **U7** | a **flat-sketch ↔ 3D lift** | 1 |
| **U8** | a **blocked/costed twist** about a double bond, π overlap collapsing as it turns | 6 |
| **U9** | **substituent placement + axial/equatorial tagging** on any skeleton site | 3, 4, 5, 6 |
| **U10** | **connectivity swap** between isomers of one formula, atom count visibly held | 7 |

U1 is the expensive one and every concept needs it. U2–U10 are comparatively small operations layered
on top. That is the argument for ONE scenario rather than two.

---

## The engine decision — ONE scenario, `organic_structure`

A new `scenario_type` **case** on `field_3d_renderer.ts` — **not a new renderer file**. This is
`ORGANIC_BUILD_PLAN.md` §6 applied and the Session-C6 lesson honoured: re-read any "we need a new
renderer" claim against what `field_3d_renderer.ts` already is.

**Named for the substrate, not the first consumer.** `conformation_scene` was rejected: four of the
seven O-0 concepts (#1, #5, #6, #7) are not conformational, and a scenario named after one mode
invites the alarm rule the moment #5 arrives. Same reasoning that named `bonding_scene` and
`vector_geometry_3d`.

### <a id="contract"></a>Config contract (the shape json-author will target)

Closed enums are authoritative and **freeze after A1**. Shape follows `bonding_scene` deliberately so
json-author is writing a dialect it already knows.

```
state.organic_structure = {
  molecule: ethane | butane | cyclohexane | methane | propane | ethene |
            stereocentre | isomer_set,            // CLOSED, from OS_MOLECULES
  mode: // ⚠ CLOSED over ALL 32 ORGANIC SIMS, never over Wave O-0 alone
        // (ORGANIC_ENGINE_PLAN.md §5 correction 4). O-0 authors only the
        // first row; the rest are declared now so no later wave reopens
        // the enum across shipped concepts.
        lift | rotate | pucker | mirror | block_twist | rewire | compare | explore |
        rehybridise | shade | delocalise |                      // Layer B, Wave O-1
        break | form | approach | invert | migrate | sequence | sweep,  // Layer C, O-2+

  // ── U2 the dihedral ────────────────────────────────────────────────
  torsion: { about: '<bond id>',                  // e.g. 'C1-C2'
             phi_deg,                             // DESTINATION (static when no ramp)
             phi_from, at_ms, ramp_ms,            // scripted sweep, closed form in t
             pose: staggered | eclipsed | anti | gauche | syn,   // snaps phi
             continuous },                        // explore: free-run, phi wraps

  // ── U3 the ring ────────────────────────────────────────────────────
  pucker: { path: chair_flip,                     // CLOSED (one path today)
            u,                                    // 0..1 along the path
            u_from, at_ms, ramp_ms,
            waypoint: chair | half_chair | twist_boat | boat | chair_alt,
            tag_axial_equatorial },               // draws the a/e tags, re-tagged at u=1

  // ── U9 substituents ────────────────────────────────────────────────
  substituents: [{ at: '<atom id>', group: H | CH3 | Cl | Br | OH | NH2 | COOH,
                   highlight }],

  // ── U4 the energy instrument ───────────────────────────────────────
  //    GENERALISED at S2, not narrowed to a torsion curve
  //    (ORGANIC_ENGINE_PLAN.md §5 correction 1). O-0 authors only
  //    coordinate: torsion | pucker, but the stationary-point vocabulary
  //    ships from the start so Wave O-2's reaction profiles reuse this
  //    instrument instead of rebuilding it.
  energy: { show, curve: ethane | butane | cyclohexane,   // CLOSED, PUBLISHED tables
            coordinate: torsion | pucker | reaction,
            units: 'kJ/mol', show_point, show_barrier,
            stationary: [{ at, kind: minimum | maximum | reactant | ts |
                                 intermediate | product, label }],
            label_minima, zero_at },              // which pose is the datum

  // ── U6 / U8 / U7 / U10 the ops ─────────────────────────────────────
  mirror: { plane: xy|yz|xz, at_ms, attempt_overlay,
            overlay_at_ms, overlay_duration_ms, show_residual },
  block_twist: { about, phi_deg, phi_from, at_ms, ramp_ms,
                 show_overlap, resist },          // reuses the orbital_shapes twist law
  lift: { from_sketch, at_ms, duration_ms, basis, show_implicit_h },  // mgFlatSources
  rewire: { to: '<isomer id>', at_ms, duration_ms },

  // ── shared chrome (identical to bonding_scene) ─────────────────────
  camera: { az, el, dist } | { sight_along: '<bond id>' },   // U5 Newman
  spin_start_ms, spin_rate,
  show_hud, hud_lines: [...],                     // CLOSED, OS_HUD_LINES
  show_formula, formula,                          // ONE surface, Rule 34b
  controls: [{ id, min_ring }] or [id],           // RING-GATED, OS_CONTROL_IDS
  static_readouts: [...]
}
```

`hud_lines` closed enum: `phi` · `energy` · `barrier` · `angle` · `pose` · `overlap` · `residual` ·
`ae_count` · `population`. `controls` closed enum: `phi` · `pucker` · `substituent` · `group` ·
`temperature` · `implicit_h` · `view` · `mirror` · `isomer`.

### Six decisions that must be made NOW, not discovered later

1. **Energy is a PUBLISHED TABLE, never a force field.** The engine ships one closed table per
   `energy.curve` with the literature stationary points below, and interpolates between them with a
   named, documented form. It does **not** compute sterics. Same discipline as `orbital_shapes`
   printing a *measured* ionisation energy rather than deriving one — the engine must never invent a
   number a student will be examined on.

   | curve | stationary points (kJ/mol, chair/anti = 0) |
   |---|---|
   | ethane | staggered 0 (φ = 60/180/300) · eclipsed **+12** (φ = 0/120/240) |
   | butane | anti 0 (180) · gauche **+3.8** (60, 300) · CH₃/H eclipsed **+16** (120, 240) · syn **+19** (0) |
   | cyclohexane | chair 0 · half-chair **+45** (the barrier) · twist-boat **+23** · boat **+29** |

   Substituent preference ships as an A-value table (CH₃ = **7.3 kJ/mol** → **95 : 5** equatorial at
   298 K). Every number is a `chemistry-author` verification item before A1 closes, and every one
   gets a CITED stamp in the HUD the way `orbital_shapes` stamps "(measured)".

2. **Closed form in state-local t — no integrator, anywhere.** Inherited verbatim from
   `bonding_scene` D-1, and it is what puts this scenario in the accumulator-free snap-to-pin set so
   THE EYE's `SET_TIME_FREEZE` frames stay byte-identical. The φ sweep, the pucker, the spin and the
   overlay attempt are all pure functions of t. Rule 36 (linear in dt) is satisfied by construction.

3. **The Newman camera is a SOLVED constraint, not a taste call.** `sight_along: '<bond id>'` places
   the camera exactly on the bond axis so the projected angle **is** the true dihedral. This is the
   C6 §4 trap in its sharpest form: staggered-vs-eclipsed is a comparison *between two angles*, so a
   camera that is 8° off the axis silently makes the sim lie. The engine asserts the axis alignment
   and the HUD publishes φ numerically, so the claim never rests on the projection alone.

4. **Occlusion is a gate, not an aesthetic.** Anything the narration counts must be countable in the
   projection (C6 §4, learned on VSEPR). In a Newman view the three back-carbon H sit *behind* the
   three front ones by definition — at φ = 0 they are exactly hidden, which is the entire point of
   "eclipsed" and also the exact condition under which a student cannot see them. The engine must
   ship the conventional fix (back bonds drawn to a rim circle, front bonds to the centre) rather
   than leaving each concept to discover it.

5. **Rule 29 — emphasis is brightness, never size.** The only things that may change size are real
   physical magnitudes: bond lengths (C–C 154 pm, C–H 109 pm) and the energy point's position on its
   curve. A conformer is never "zoomed to show strain".

6. **Axial/equatorial tags are DERIVED from the pucker, never authored per waypoint.** A tag authored
   at chair and re-authored at chair′ would drift out of sync with the interpolation and quietly
   teach the wrong thing at the half-chair. One derivation, read at every u.

### <a id="reuse"></a>Reuse contract — what `organic_structure` must NOT re-derive

Violating this is how a second, drifting geometry table gets born (the `bonding_scene` §reuse lesson).

| Must reuse | Where it lives |
|---|---|
| tetrahedral / trigonal ideal directions, and the VSEPR angle table | `mgIdealDirs(n)` :58349, `mgFrame()` :58455 — **already verified**, a second table would drift |
| the flat-sketch → tetrahedral relaxation, camera-basis aware | `mgFlatSources(tetraDirs, basis)` :58494 — this **is** concept #1 |
| bond length in scene units | `MG_BOND_LEN = 2.0` / `BS_BOND_LEN = 2.0` (:58205, :59414) — the third copy must not appear |
| the twist law + overlap falloff for a costed rotation | `orbital_shapes` `twist_deg` / `twist_ramp` (:63876) — concept #6 |
| ring-gated control lists, the `_row` slider conventions, drag-seize | `bscControlList` shape (:55294, :1313) — Rule 39 comes free through the discovery conventions |
| HUD / ONE-formula-surface / legend-off conventions | the `bonding_scene` branches at :72414, :72942, :73462 |
| the frozen-pin registration and the settled-frame candidate logic | `deriveStateMeta.ts` + the freeze list at :76024 |
| `config.field_lines.opacity` must exist (object, even `{}`) | the fleet blank-scene trap, :59398 |

### <a id="ledger"></a>What this wave is deliberately NOT building (the alarm-rule ledger)

Named now so that a later concept hitting one of these is a **scope decision**, not a surprise engine
edit. If a Wave O-0 concept needs one of these, Phase 0 under-generalized → stop and re-scope.

- **No bond breaking or forming.** That is Engine C (Wave O-2) and it is the largest build in the
  chemistry roadmap. Nothing in O-0 breaks a bond — #6 *resists* a twist, it does not break the π bond.
- **No electron-density shading.** Engine B (Wave O-1).
- **No curly arrows / 2D bond-line primitive.** `ORGANIC_BUILD_PLAN.md` §6 marks it optional and
  Phase-5b; every O-0 concept is authored 3D-first. Concept #1's flat sketch is a 3D plane, not a new
  2D primitive.
- **No force field, no conformer search, no energy minimisation** (decision 1).
- **No reaction coordinate between different molecules** — the pucker path is within one molecule.
- **No solvent, no temperature-dependent dynamics** beyond the published Boltzmann population line.

---

## 0b — DEEPEST-CONCEPT DESIGN

**The deepest concept is #4, `cyclohexane_chair_flip`** — and it is the engine's real spec:

- the largest skeleton (18 atoms) → sizes U1;
- the only U3 consumer, and U3 is the hardest need in the union;
- it subsumes U2 (a chair flip *is* correlated rotation about six C–C bonds), so an engine specced by
  #4 gets #2 and #3 nearly free;
- it carries U9 (substituent + a/e tagging) and U4 (a four-stationary-point energy curve) at once.

It is built **third** (after #1 and #2, per `ORGANIC_BUILD_PLAN.md` §8) but designed **first**. That
inversion is the whole point of the doctrine: the engine is specced by the concept that stresses it
most, not by the one that ships first.

> **Full skeleton + physics block are the next work item, not this doc.** `AUTHORING_PIPELINE.md` §0
> puts an architect skeleton + `chemistry-author` block here, then **founder-proxy Checkpoint A before
> any engine code**. The sketch below is the survey's input to that skeleton, not a substitute for it.

**Design sketch — `cyclohexane_chair_flip`, ~9 states** (Rule 11: complexity-driven; Rule 31: one
idea + one motion each, a declared archetype + delta per state, explore last):

| # | Teaches | Archetype · delta | Ring gate |
|---|---|---|---|
| 1 | the ring is **not** flat — the drawn hexagon relaxes into a chair | lift · "flat ring becomes a chair" | core |
| 2 | why: a flat ring would force 120° at a carbon that wants 109.5° | compare · "angle strain appears" | core |
| 3 | the chair has **two kinds of bond** — six axial, six equatorial | tag reveal · "two bond directions" | core |
| 4 | the flip: chair → half-chair → twist-boat → boat → chair′ | pucker sweep · "the ring flips" | core |
| 5 | **every axial becomes equatorial** — the payoff | tag re-read · "axial and equatorial swap" | core |
| 6 | the cost: 45 kJ/mol at the half-chair, and it happens anyway at room temperature | energy curve · "the barrier is small" | extended |
| 7 | put a CH₃ on the ring: axial is crowded, equatorial is not | substituent · "one position is crowded" | extended |
| 8 | so the ring sits **95 : 5** in favour of equatorial | population · "the ring prefers equatorial" | advanced |
| 9 | explore | free pucker + substituent + view | core only (Rule 38b) |

Rule 38a holds: states 6–8 are a contiguous extended/advanced block immediately before explore, and
cutting them leaves states 1–5 + 9 as a coherent lesson (the flip and the a/e swap, which is the
IGCSE/IB-HL depth).

---

## 0c — ENGINE ONCE (planned, NOT dispatched)

Four dispatches to `field3d-surgeon`, **ONE `bug_class` each** (Amendment 4 — bundles are banned),
each with a ~100-call ceiling and a clean handoff note. Ordered so every dispatch has a real consumer
to be proven against, exactly as E1/E2/E3 were on `bonding_scene`.

**FIVE dispatches, not four** — `ORGANIC_ENGINE_PLAN.md` §5 correction 3 separates the energy
instrument out of the torsion dispatch, because it is subject-wide rather than an O-0 asset.

| Dispatch | `bug_class` | Builds | Proven against |
|---|---|---|---|
| **S1** | `organic_structure_substrate` | U1 skeleton + closed molecule table + camera solve + HUD/formula chrome + closed-form t. Enums FREEZE here — **over all 32 sims, not over O-0** | #2 ethane, static poses only |
| **S2** | `organic_structure_energy` | U4 energy instrument, **generalised** (torsion + pucker + reaction-profile shape) + U5 sight-along/Newman camera | #2 ethane E(φ) |
| **A1** | `organic_structure_torsion` | U2 dihedral + pose targets | #2, then #3 butane |
| **A2** | `organic_structure_pucker` | U3 ring pucker + U9 a/e tagging + the substituent layer | #4 chair flip (the 0b spec) |
| **A3** | `organic_structure_stereo_ops` | U6 mirror/superimposition · U7 flat lift · U8 blocked twist · U10 rewire | #5, then #1, #6, #7 |

`S4 organic_structure_rehybridise` (sp³ ⇄ sp²) is substrate too, but **no O-0 concept consumes it** —
it is dispatched at Wave O-1 against #11. It is named here so it is not re-invented inside Layer C,
where six later sims would otherwise each grow their own copy.

**Rule 40:** every one of these lands on **master separately and immediately** — engine files are
platform, shared by both subjects. They do not ride inside a concept branch.

**Mandatory for every dispatch:** `docs/FIELD3D_SCENARIO_CHECKLIST.md` (the pre-paid scar list) +
`npm run check:renderer-syntax` (Rule 36c) + the tripwire (`npx tsc --noEmit` 0 · `validate:concepts`
unchanged · `validate:chemistry` PASS · vitest green).

**A gate script, `npm run check:organic-structure`** — headless, $0, negative controls per section,
modelled on `check:bonding-scene`. It must assert at minimum: φ = 0 puts the back H exactly behind the
front H (the eclipsed definition); the Newman camera axis is aligned to the named bond to within a
stated tolerance; E(φ) reproduces the published table at every stationary point; the a/e tag set is
exactly inverted between u = 0 and u = 1; atom count is conserved across a `rewire`.

**SUCCESS TEST (0d):** concepts #1, #2, #5 require **ZERO** renderer edits after A4.

---

## GATE BEFORE 0c

1. Founder answers the open decisions below.
2. `architect` writes the #4 skeleton; `chemistry-author` writes its block — **including sign-off on
   every energy number in decision 1**.
3. **founder-proxy Checkpoint A** on that skeleton. `DESIGN_OK` required.
4. Founder go → A1 dispatched.

No renderer line is written before step 4.

---

## OPEN DECISIONS (founder)

1. **Is Wave O-0 the right spend now?** `ORGANIC_BUILD_PLAN.md` §9 Q1 is unresolved and this doc does
   not resolve it: physical chemistry still has un-built 6/6 diamonds (titration curve, osmosis,
   electrochemistry) while this wave averages ~3.5/5. The build plan's own answer is that organic is
   India-deep and India is the paying market. **Recommendation: proceed** — you asked for organic and
   for the basics, and O-0 is exactly the basics.
2. **Four dispatches, or fewer?** A1–A4 is ~the bonding wave's shape (E1/E2/E3a/E3b). Collapsing A1+A2
   is tempting since #2 needs both, but it bundles two `bug_class`es and Amendment 4 exists because a
   ten-bug bundle once cost 156M tokens. **Recommendation: keep four.**
3. **Concept #7 structural isomerism** — `ORGANIC_BUILD_PLAN.md` §9 Q2 already flags it borderline
   demo tier. It is the only consumer of U10 (`rewire`). **Cutting it removes a whole engine op from
   A4.** Recommendation: cut #7 from O-0 (→ 6 concepts, 31 in the plan) unless you want it.
4. **Does #1 need A4 at all?** `mgFlatSources` already exists, so the flat lift may be a thin wrapper
   rather than an op — which would let #1 be built straight after A1. Worth a 20-minute probe before
   A4 is scoped, not a decision to make now.
