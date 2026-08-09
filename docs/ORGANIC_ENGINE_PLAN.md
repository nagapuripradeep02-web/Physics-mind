# Organic Engine Plan — the union across ALL 32 simulations (Waves O-0 → O-4)

> **Status: PLANNING ARTIFACT (Rule 17) — 2026-08-09, branch `feat/organic-o0-engine-a`.**
> Founder directive 2026-08-09: *"we first plan to cover all organic simulations."* This doc is that
> plan. It surveys every one of the 32 sims in `docs/ORGANIC_BUILD_PLAN.md` §4 for what the ENGINE
> must do, unions those needs, and decides the architecture ONCE — before Engine A's contract freezes.
>
> **It amends `ORGANIC_BUILD_PLAN.md` §6.** That section named three engines (A conformational
> rotation · B electron density · C bond break/form). The waves and the concept list stand unchanged;
> what changes is that **three engines are three LAYERS on one substrate, not three
> `scenario_type`s** — see §3, which is the whole reason this doc exists.
>
> **Companion:** `docs/ORGANIC_PHASE0_CONFORMATION.md` is the Wave O-0 execution detail (0a/0b/0c).
> This doc sits above it. Nothing is dispatched by either.
>
> **⚠ Rule 38g — every curriculum cell in the build plan is a CLAIM.** Not re-asserted here.

---

## 1. Why this doc exists — the finding

`ORGANIC_PHASE0_CONFORMATION.md` surveyed Wave O-0 alone and specced `organic_structure` against
7 concepts. Surveying the remaining 25 changes two things about that spec, and both are cheaper to
fix now than after A1 freezes its enums:

1. **Nearly half the subject needs two "engines" at the same time.** Fourteen of the 32 sims consume
   two capability layers in a single state (§3). If A, B and C were three `scenario_type`s, those
   fourteen would each be unbuildable or duplicated. E2 elimination is the clearest: you cannot show
   the anti-periplanar requirement without Engine A's **dihedral**, and you cannot show E2 without
   Engine C's **bond breaking** — in the same state, on the same molecule.
2. **The energy instrument is one instrument, needed three different ways.** O-0 wants E(φ) over a
   torsion; O-2 wants a reaction profile with named stationary points (reactant → TS → intermediate →
   product); O-3 wants a two-species comparison. Built narrowly for O-0 in dispatch A2, it gets torn
   out and rebuilt at Wave O-2. Built once, generalised, it serves all three.

This is the Phase-0 doctrine's own thesis applied at subject scale: *the cost driver is UNPLANNED
engine work.* Ch.7 discovered its engine per concept and cost ~1,296M tokens for 6 concepts; Ch.8
planned it once and did equivalent work in ~177M.

---

## 2. The survey — what every wave needs from the engine

Waves O-0 and its seven concepts are surveyed in full in `ORGANIC_PHASE0_CONFORMATION.md` §0a and are
summarised here in one row. Concept numbers are `ORGANIC_BUILD_PLAN.md` §4's.

### Wave O-0 — representation foundation (7 sims)
Needs, in the layer language of §3: **skeleton** · **dihedral** · **ring pucker** · **energy curve** ·
**sight-along camera** · **mirror/superimpose** · **flat-sketch lift** · **blocked twist** ·
**substituent + axial/equatorial tagging** · **connectivity rewire**.

### Wave O-1 — electronic effects (5 sims)

| # | Concept | What MOVES | What is MEASURED | Layer needs |
|---|---|---|---|---|
| 8 | inductive effect | density shifts along a chain toward an electronegative atom, **falling with distance** | per-atom partial charge, δ+ → δδ+ → δδδ+ | B density gradient |
| 9 | resonance / delocalisation | the two contributing structures are shown — then **merge into one cloud that does not alternate** | equal bond lengths (benzene **139 pm**, between 154 and 134) | B cloud + **bond-length instrument** |
| 10 | hyperconjugation | a σ(C–H) **rotates into alignment** with the empty p, then density leaks in | count of α-H (3 / 6 / 9); stability order | **A dihedral + B density + orbital lobes** |
| 11 | carbocation / carbanion / radical stability | substituents added; the centre **rehybridises** (cation → planar sp², carbanion → pyramidal sp³) | relative stability; geometry at the centre | **A rehybridise + B density** |
| 12 | aromaticity & Hückel | the ring **flattens**, p orbitals align, the cloud closes into two faces | electron count, the 4n+2 test | **A pucker/planarity + B cloud + orbital lobes** |

### Wave O-2 — the mechanism engine (12 sims)

| # | Concept | What MOVES | What is MEASURED | Layer needs |
|---|---|---|---|---|
| 13 | homolytic vs heterolytic fission | a bond breaks; the **pair splits 1-1 or goes wholly to one atom** | where the two electrons went | C break + **electron-pair routing** |
| 14 | free-radical substitution | initiation → propagation → termination, **a sequence in time** | step index; radicals persisting between steps | C multi-step sequencing |
| 15 | SN2 + Walden inversion | backside approach at **180°**; bond forms as bond breaks; the centre **inverts through a planar TS** | one barrier; configuration flipped | C concerted + **inversion** + approach angle |
| 16 | SN1 + racemisation | LG leaves → **planar carbocation** → attack on both faces | two-step profile with an intermediate well; **50 : 50** outcome | C stepwise + A rehybridise + **branching populations** |
| 17 | E2 + anti-periplanar | the H–C–C–LG dihedral is driven to **180°**, then all bonds move at once | the dihedral; one barrier | **A dihedral + C concerted** |
| 18 | E1 + Saytzeff | shares #16's carbocation, then loses a β-H | which alkene, and in what ratio | C stepwise + branching |
| 19 | substitution vs elimination | four variables swept, outcome shifts | product proportions across the sweep | C branching + **live parameter sweep** |
| 20 | electrophilic addition + Markovnikov | π attacks H⁺; cation forms at the **more substituted** carbon; X⁻ adds | which carbon; why | C stepwise + A rehybridise |
| 21 | carbocation rearrangement | a hydride **migrates with its pair** to the adjacent centre | stability before vs after | C **atom migration** |
| 22 | anti-Markovnikov / peroxide | radical route, declared contrast pair with #20 | which carbon, and why it reverses | C radical route |
| 23 | electrophilic aromatic substitution | aromaticity is **lost, then recovered** | the arenium intermediate; the two-step profile | **B cloud + C stepwise** |
| 24 | directing effects | density accumulates at o/p or m; attack follows it | where density is, then where attack lands | **B density + C attack site** |

### Wave O-3 — carbonyl and acid–base (7 sims)

| # | Concept | What MOVES | What is MEASURED | Layer needs |
|---|---|---|---|---|
| 25 | nucleophilic addition at C=O | approach at the **Bürgi–Dunitz ~107°**; carbon goes trigonal → tetrahedral | the approach angle; the rehybridisation | C approach + **A rehybridise** |
| 26 | nucleophilic acyl substitution | addition, then elimination — contrast pair with #25 | which fate, and why | C stepwise |
| 27 | aldol condensation | enolate forms (density), then a **C–C bond** forms | the enolate; the new bond | **B density + C form** |
| 28 | acidity of carboxylic acids | O–H breaks; the two C–O bonds become **equal** | the two bond lengths converging | **B cloud + C break + bond-length instrument** |
| 29 | phenol vs alcohol acidity | two conjugate bases side by side; one spreads its charge | charge spread on each | **B cloud + compare** |
| 30 | basicity of amines | gas phase vs solution — the order **reverses** | basicity order in each medium | B density + **solvent shell** + compare |
| 31 | haloarene inertness | an attempted attack **fails** | partial double-bond character | **B cloud + C attempted-and-blocked** |

### Wave O-4 (1 sim)

| # | Concept | What MOVES | What is MEASURED | Layer needs |
|---|---|---|---|---|
| 32 | polymerisation | a bond-forming step **repeats** into a chain | chain length; repeat unit | C form, **repeated N times** |

---

## 3. THE ARCHITECTURE DECISION — one scenario, one substrate, three layers

### The cross-layer count

Fourteen of 32 sims need two layers in the same state:

| Layers | Concepts |
|---|---|
| A + B | 10 hyperconjugation · 11 carbocation stability · 12 aromaticity |
| A + C | 15 SN2 (inversion) · 16 SN1 · 17 **E2** · 20 Markovnikov · 21 rearrangement · 25 Bürgi–Dunitz |
| B + C | 23 EAS · 24 directing effects · 27 aldol · 28 carboxylic acidity · 31 haloarene |

**Therefore: ONE `scenario_type`, `organic_structure`.** Not three. The "three engines" of
`ORGANIC_BUILD_PLAN.md` §6 are retained as a *cost and sequencing* framing — they correctly describe
three tranches of spend — but they are **capability layers inside one scenario**, delivered as
additive dispatches. This is `bonding_scene`'s E1 → E2 → E3 pattern at larger scale, and it is the
same conclusion §6 already reached about files ("a new CASE where a new FILE would do"), pushed one
level further: a new LAYER where a new CASE would do.

### The substrate — what every one of the 32 needs

| | Substrate need | Consumers |
|---|---|---|
| **S1** | multi-atom skeleton from a closed molecule table: explicit connectivity, drawn bonds, per-atom identity + labels, >7 atoms | 32 / 32 |
| **S2** | the **energy instrument**, generalised: a curve over a named coordinate, a point riding it, named stationary points, a value-only HUD (Rule 33d) | 20+ |
| **S3** | camera solve incl. **sight-along-a-bond**, occlusion discipline, ONE formula surface, ring-gated controls, closed-form t | 32 / 32 |
| **S4** | **rehybridisation sp³ ↔ sp²** at a named centre (tetrahedral ⇄ trigonal planar) | 11, 12, 15, 16, 20, 25 |

S2 and S4 are the two the O-0-only survey **under-scoped**, and both are corrected in §5.

### The three layers

| Layer | Owns | Sims | Prior art |
|---|---|---|---|
| **A — geometry & motion** | dihedral · ring pucker · mirror/superimpose · flat lift · blocked twist · connectivity rewire · substituent + a/e tagging | O-0 (7) | `mgFrame`/`mgIdealDirs`/`mgFlatSources`; `orbital_shapes` twist |
| **B — electrons** | per-atom density shading & charge gradient · delocalised cloud that does **not** alternate · orbital lobes on a skeleton · bond-length instrument | O-1 (5) + O-3 (7) | **`bonding_scene`'s per-atom partial charge + `electrons.pair_glyph`/`pair_shift`** |
| **C — reaction** | bond break/form · electron-pair routing · approach trajectory at a named angle · concerted vs stepwise · inversion through a planar TS · intermediates across steps · branching outcomes with populations · repetition | O-2 (12) + O-3 + O-4 | **none — entirely new** |

**Cost correction vs `ORGANIC_BUILD_PLAN.md` §6.** §6 ranked A smallest, B medium, C largest. The
survey confirms C largest but **revises B downward**: `bonding_scene` already ships per-atom partial
charge with colour and a shiftable electron-pair glyph, so B is an extension, not a build. A is
larger than §6 implied, because the substrate (S1–S4) is bought with it.

---

## 4. THE DISPATCH LADDER — the whole subject

Twelve dispatches to `field3d-surgeon`, **ONE `bug_class` each** (Amendment 4; bundles banned), each
with a ~100-call ceiling and a clean handoff note. Every dispatch names the consumer it is proven
against — no dispatch lands without a concept to test it, exactly as E1/E2/E3 did on `bonding_scene`.

| # | `bug_class` | Builds | Proven against | Wave |
|---|---|---|---|---|
| **S1** | `organic_structure_substrate` | skeleton, molecule table, connectivity, labels, camera solve, chrome, closed-form t. **Enums freeze** | #2 ethane, static poses | O-0 |
| **S2** | `organic_structure_energy` | the generalised energy instrument (torsion curve **and** reaction profile shape) + sight-along camera | #2 ethane E(φ) | O-0 |
| **A1** | `organic_structure_torsion` | driven dihedral, pose targets | #2, then #3 butane | O-0 |
| **A2** | `organic_structure_pucker` | ring pucker path, a/e tagging, substituent layer | #4 chair flip | O-0 |
| **A3** | `organic_structure_stereo_ops` | mirror/superimpose, flat lift, blocked twist, rewire | #5, then #1, #6, #7 | O-0 |
| **S4** | `organic_structure_rehybridise` | sp³ ⇄ sp² at a named centre | #11 carbocation stability | O-1 |
| **B1** | `organic_structure_density` | per-atom density shading + charge gradient along a chain | #8 inductive effect | O-1 |
| **B2** | `organic_structure_delocalisation` | non-alternating cloud + bond-length instrument | #9 resonance, then #12 aromaticity | O-1 |
| **C1** | `organic_structure_bond_events` | bond break/form + electron-pair routing + the homo/heterolytic fork | #13 fission | O-2 |
| **C2** | `organic_structure_concerted` | approach trajectory at a named angle + inversion through a planar TS | #15 SN2 | O-2 |
| **C3** | `organic_structure_stepwise` | intermediates carried across steps, multi-step sequencing, branching outcomes with populations | #16 SN1 | O-2 |
| **C4** | `organic_structure_sweep_repeat` | the live competition sweep + repetition-to-a-chain | #19, then #32 | O-2/O-4 |

**Rule 40:** every one lands on **master separately and immediately**. Engine files are platform,
shared by both subjects; none of these rides inside a concept branch.

**Estimated shape:** 12 engine dispatches unlock 32 sims ≈ 250 states. For contrast, `bonding_scene`
spent 4 dispatches on 4 concepts — the ratio improves here precisely because S1–S4 are bought once.

**The alarm rule stands at every wave boundary.** A concept in O-1/O-2/O-3 that forces an *unplanned*
engine edit means this survey under-generalized → stop and re-scope with the surgeon, never extend
per concept.

---

## 5. WHAT THIS CHANGES IN THE O-0 PHASE-0 DOC

`ORGANIC_PHASE0_CONFORMATION.md` is correct in its survey, its reuse contract and its 0b design. Four
corrections follow from the all-32 union, all applied to that doc alongside this one:

1. **The energy instrument is generalised in S2, not narrowed to a torsion curve.** Its config must
   carry a named coordinate and named stationary points (`reactant | ts | intermediate | product`)
   from the start, even though O-0 only ever authors `torsion` and `pucker` coordinates. Otherwise
   Wave O-2 rebuilds it.
2. **`S4 rehybridise` is added to the substrate.** O-0 does not consume it, but six later sims do, and
   it is cheap given `mgIdealDirs(4)` → `mgIdealDirs(3)` already exists. Deciding its home now keeps
   it out of Layer C, where it would be built twice.
3. **The dispatch ladder replaces A1–A4** in that doc's §0c with S1/S2/A1/A2/A3 above (five O-0
   dispatches, not four — the energy instrument is separated out because it is subject-wide).
4. **The `mode` enum must not close over O-0's eight modes.** The O-0 doc froze
   `lift | rotate | pucker | mirror | block_twist | rewire | compare | explore` at A1. It must instead
   freeze over the union of all 32 — adding at minimum `break | form | approach | invert | migrate |
   sequence | delocalise | shade | rehybridise | sweep`. **A closed enum frozen against one wave is
   the single most expensive mistake available here**, because every later wave then either reopens
   it (churn across shipped concepts) or works around it (two code paths for one idea).

Correction 4 is the concrete payoff of the founder's instruction to plan all of organic first.

---

## 6. OPEN DECISIONS (founder)

1. **Sequencing: engine-first or wave-by-wave?** The ladder above interleaves — O-0's five dispatches,
   then O-1's three, then O-2's four — so concepts ship continuously and each engine tranche is paid
   for by sims that follow it immediately. The alternative (all 12 dispatches, then all 32 concepts)
   front-loads ~12 engine dispatches before a single organic sim exists.
   **Recommendation: interleave**, exactly as the ladder is written.
2. **Concept #7 structural isomerism** stays IN the plan per "cover all organic". It remains the
   borderline-demo case `ORGANIC_BUILD_PLAN.md` §9 Q2 flagged, and it is the only consumer of
   `rewire` — so it is the cheapest single cut if the O-0 ladder needs trimming. No action needed now.
3. **Spectroscopy (NMR/IR/MS)** is still out of scope — it lands on the PCPL graph path, not on
   `organic_structure`, and `ORGANIC_BUILD_PLAN.md` §9 Q3 keeps it a separate decision. Unchanged.
4. **Wave O-1 before O-2 is load-bearing, not preference.** Six O-2 sims are only explicable via O-1's
   electronic effects (Markovnikov *is* carbocation stability; directing effects *are* density). If
   O-2 is ever pulled forward, those sims become the memorisation the build plan is trying to replace.
