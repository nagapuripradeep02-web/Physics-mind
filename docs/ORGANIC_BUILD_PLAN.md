# Organic Chemistry Build Plan — v1.0 (the full concept map, waves O-0 → O-4)

> **Status: PLANNING ARTIFACT (Rule 17) — 2026-08-09, branch `docs/organic-build-plan`.**
> Scope: every organic-chemistry concept that earns a simulation, across CBSE + JEE + NEET and the
> international boards, filtered through the Session-C5 whiteboard test and mapped to the engine each
> one needs. Sibling of `docs/CHEMISTRY_BUILD_PLAN.md` (phase mechanics) and
> `docs/CHEMISTRY_DISCUSSIONS.md` (the ranked physical-chemistry order, Session C5 §6).
>
> **This doc decides ORDER and SCOPE for organic. It does not change how a concept is built** —
> the Alex pipeline, complexity-driven state count (Rule 11), and every quality gate are untouched.
>
> **⚠ THE ORDER IS A DEFAULT, NOT A CONTRACT** (founder, 2026-07-27, carried from C5 §6). If the
> founder asks for a concept out of order, build it. What is durable is the *reasoning*; the sequence
> is that reasoning applied to today's facts, and facts move.
>
> **⚠ Rule 38g — every curriculum cell below is a CLAIM.** Only CBSE/NCERT is author-verified. No
> preset goes teacher-visible until a real teacher of that board confirms the cell.

---

## 1. The curriculum reality check — organic is an INDIA-LED investment

Physical chemistry scored 6/6 across CBSE+JEE, IGCSE, IB, AP and A-level. **Organic does not, and the
gap is structural:**

- **AP Chemistry has no organic mechanism unit at all.** It was removed in the College Board
  redesign. Structure and bonding survive; SN1/SN2, EAS, carbonyl chemistry do not.
- **IGCSE keeps organic light** — homologous series, simple substitution/addition, no mechanism depth.
- **A-level and IB carry the international weight**, and they carry it seriously (A-level especially).
- **India carries the rest, and it is enormous** — CBSE Cl.11 Ch.12/13 + Cl.12 Ch.6–10, and organic is
  a very large share of both JEE and NEET.

**The consequence for scheduling:** a top organic diamond typically scores **4/6, not 6/6**. That is
not a reason to skip organic — it is the largest single block of the Indian syllabus, and the Indian
market is the paying one today (CLAUDE.md §3). It *is* a reason to decide deliberately: organic buys
depth in the market we are selling to, where physical chemistry bought universality.

## 2. The whiteboard test applied to organic (C5 §1)

> If a good teacher with a whiteboard and 60 seconds produces the same understanding, it is not a
> diamond — and we should not spend a build on it.

Organic has a **lower diamond ratio than it first appears**, because so much of the syllabus is
exactly what a board does well: arrow-pushing on flat paper, reagent lists, conversions, naming.

The organic diamonds concentrate in two places, and both are capability 3 (hold 3D spatial structure)
or capability 4 (make a counterintuitive result believable):

1. **Where the geometry IS the concept** — chair flips, anti-periplanar elimination, backside attack,
   the Bürgi–Dunitz approach angle, non-superimposable mirror images. Flat paper structurally cannot
   reach these, and hand-waving fails worst here.
2. **Where an invisible intermediate or a delocalised electron cloud decides the outcome** —
   carbocation stability, resonance, aromaticity, directing effects.

Everything else in organic is the demo tier (§7).

## 3. What is already built and serves organic

Four shipped concepts are organic foundation, already baseline-locked:

| Concept | What it gives organic |
|---|---|
| `hybridisation_sp_sp2_sp3` | the sp/sp²/sp carbon shapes — the geometry every organic structure inherits |
| `sigma_pi_bonding` | why C=C cannot rotate — the entire basis of cis/trans isomerism |
| `vsepr_molecular_shapes` | electron-domain geometry, the parent of all local shape reasoning |
| `atomic_orbitals_s_p_d` | the orbital picture hybridisation is built from |

**Engine assets:** `field_3d_renderer.ts` `scenario_type: "molecular_geometry"` (electron-domain
geometry, [LIVE]) and `"orbital_shapes"` ([LIVE] since 2026-07-28). Organic does not start from zero.

---

## 4. THE FULL LIST — 32 simulations in 5 waves

Tier: 💎 diamond · ⭐ strong. Curricula are Rule 38g claims (§1 caveat applies to every cell).

### Wave O-0 — Representation foundation (7 sims) · Engine A

*The student must be able to read a 3D structure off a flat drawing before any mechanism means
anything (Rule 25, foundation-first). Two of the subject's best diamonds live here anyway, so the
foundation wave is not a tax — it is already the payoff.*

| # | Concept | Tier | Curricula | Why not a whiteboard |
|---|---|---|---|---|
| 1 | **Bond-line ↔ 3D structure translation** | 💎 | all | Students read bond-line as flat and never recover. The translation itself is the lesson |
| 2 | **Conformations of ethane** (Newman, staggered vs eclipsed, energy curve) | 💎 | CBSE·JEE·IB·A-lvl | Rotation about a σ bond with a live energy plot — a board draws two poses and asserts the curve between them |
| 3 | **Conformations of butane** (gauche, anti, torsional + steric strain) | ⭐ | JEE·A-lvl | Four minima, two causes. Cheap once #2 exists |
| 4 | **Cyclohexane chair flip** (axial ↔ equatorial) | 💎 | JEE·IB HL·A-lvl | **Arguably the best 3D organic sim that exists.** A board cannot flip a chair, and every student draws the ring flat |
| 5 | **Chirality & optical isomerism** (non-superimposable mirror images, R/S) | 💎 | all | Superimposability is a 3D operation. Wedge-dash on paper asks the student to do it in their head |
| 6 | **Geometrical isomerism** (cis/trans, E/Z) | ⭐ | all | Compounds directly off shipped `sigma_pi_bonding` — the π bond is *why* rotation is locked |
| 7 | **Structural isomerism** (chain, position, functional) | ⭐ | all | Weakest of the wave; borderline demo. Build last in O-0 or drop |

### Wave O-1 — Electronic effects, the invisible causes (5 sims) · Engine B

*These explain every outcome in Wave O-2. Built first, the mechanism wave stops being memorisation.*

| # | Concept | Tier | Curricula | Why not a whiteboard |
|---|---|---|---|---|
| 8 | **Inductive effect** | ⭐ | CBSE·JEE·A-lvl | Density shifting along a chain, falling with distance — a board draws one arrow |
| 9 | **Resonance / delocalisation** | 💎 | all | **THE misconception:** students believe the molecule flips between structures. The sim's job is to show that nothing flips. Capability 4 |
| 10 | **Hyperconjugation** | ⭐ | CBSE·JEE | India-weighted; thin internationally |
| 11 | **Carbocation / carbanion / radical stability** | 💎 | CBSE·JEE·A-lvl·IB | Ties 8–10 together and predicts every product in O-2. The intermediate is invisible by definition |
| 12 | **Aromaticity & Hückel's rule** | 💎 | all | Planarity + continuous overlap + electron count, all at once and all 3D |

### Wave O-2 — The mechanism engine (12 sims) · Engine C

*The densest diamond cluster in the subject, and the largest engine build.*

| # | Concept | Tier | Curricula | Why not a whiteboard |
|---|---|---|---|---|
| 13 | **Homolytic vs heterolytic fission** | ⭐ | all | Where the electron pair goes — the fork every mechanism starts at |
| 14 | **Free-radical substitution** (initiation / propagation / termination) | ⭐ | all | A chain process is a *sequence in time*, not a diagram |
| 15 | **SN2 + Walden inversion** | 💎 | CBSE·JEE·IB·A-lvl | The inversion is impossible to draw. Arrow-pushing loses the 3D entirely |
| 16 | **SN1 + racemisation** | 💎 | CBSE·JEE·IB·A-lvl | Flat carbocation attacked from both faces → 50/50. The planarity is the whole explanation |
| 17 | **E2 + anti-periplanar requirement** | 💎 | JEE·IB·A-lvl | **The clearest 3D case after the chair flip.** The 180° H–C–C–LG alignment simply cannot be drawn |
| 18 | **E1 + Saytzeff** | ⭐ | CBSE·JEE·A-lvl | Shares the carbocation from #16 |
| 19 | **Substitution vs elimination competition** | ⭐ | JEE·A-lvl | Four variables, one outcome — the live-sweep case (capability 2) |
| 20 | **Electrophilic addition + Markovnikov** | 💎 | all | The rule is a consequence of #11, not a rule to memorise |
| 21 | **Carbocation rearrangement** (hydride / methyl shift) | 💎 | CBSE·JEE | Students memorise the "wrong" product. Watching the shift is the only thing that explains it |
| 22 | **Anti-Markovnikov / peroxide effect** | ⭐ | CBSE·JEE | Contrast pair with #20 (Rule 31 declared contrast) |
| 23 | **Electrophilic aromatic substitution** (arenium / σ-complex) | 💎 | all | Aromaticity is *lost then recovered* — a two-step story a board collapses into one arrow |
| 24 | **Directing effects** (o/p vs m) | 💎 | CBSE·JEE·A-lvl | Where the density actually goes, shown rather than asserted |

### Wave O-3 — Carbonyl chemistry & acid–base comparisons (7 sims) · Engines B + C

| # | Concept | Tier | Curricula | Why not a whiteboard |
|---|---|---|---|---|
| 25 | **Nucleophilic addition at C=O** (Bürgi–Dunitz, trigonal → tetrahedral) | 💎 | all | The nucleophile approaches at ~107°, not perpendicular, and the carbon rehybridises as it arrives |
| 26 | **Nucleophilic acyl substitution** (addition–elimination) | ⭐ | JEE·IB·A-lvl | Contrast pair with #25 — same start, different fate |
| 27 | **Aldol condensation** | ⭐ | CBSE·JEE·A-lvl | Enolate formation is an electron-density story (Engine B) |
| 28 | **Acidity of carboxylic acids** (carboxylate resonance) | 💎 | all | Two equivalent C–O bonds after deprotonation — the delocalisation IS the acidity |
| 29 | **Acidity of phenol vs alcohol** | 💎 | all | Direct comparison; the phenoxide ring carries the charge and the alkoxide cannot |
| 30 | **Basicity of amines** (aliphatic vs aromatic, + solvation) | 💎 | CBSE·JEE·A-lvl | The gas-phase/solution reversal is genuinely counterintuitive (capability 4) |
| 31 | **Haloarene inertness** (resonance + partial double-bond character) | ⭐ | CBSE·JEE | Explains a non-reaction — needs the delocalised picture |

### Wave O-4 — International extras (1 sim, + optional)

| # | Concept | Tier | Curricula | Note |
|---|---|---|---|---|
| 32 | **Polymerisation** (addition + condensation) | ⭐ | all | Repetition in time; the only genuinely universal cell left in organic |

**Optional, only if A-level / IB is being chased directly:** NMR / IR / MS spectroscopy (graph-based,
not 3D — would land on the PCPL `cartesian_plane` graph path, not Engines A–C); protein secondary
structure; DNA double helix. All three are outside CBSE organic.

---

## 5. Totals

| | Count |
|---|---|
| **Simulations** | **32** |
| 💎 diamond | 18 |
| ⭐ strong | 14 |
| Estimated states (at the shipped 7–9 states/concept) | **~250** |

## 6. The three engines that gate the whole subject

All three are new `scenario_type` cases on the **existing** `field_3d_renderer.ts` — not new renderer
files. This is the Session-C6 lesson applied up front: `CHEMISTRY_ARCHITECTURE.md` §5c named a new
FILE where a new CASE would do, and that inflated estimate founder-gated Phase 5 behind two waves of
2D work. **Re-read any "we need a new renderer" claim against what `field_3d_renderer.ts` already is.**

| Engine | What it must do | Unlocks | Relative cost |
|---|---|---|---|
| **A — conformational rotation** | drive a dihedral angle; ring pucker / chair-flip interpolation; a torsional-energy readout tracking the angle (Rule 33d) | Wave O-0 — 7 sims | Smallest |
| **B — electron-density shading** | per-atom / per-region charge-cloud colouring on an existing molecule; delocalised cloud that does NOT alternate | Waves O-1 + O-3 — 12 sims | Medium |
| **C — bond break / bond form + inversion** | break and form bonds mid-animation; invert a centre through a planar transition state; carry an intermediate between steps | Wave O-2 — 12 sims | Largest |

`docs/patterns/chemistry.md:227` already records SN1/SN2 and stereochemistry as sitting *between*
tiers for exactly this reason: the molecule scaffold exists, the motion layer does not.

**A separate, optional 2D asset:** a bond-line / curly-arrow molecule primitive would open flat
organic (arrow-pushing practice, GOC comparisons, aromatic mechanisms drawn conventionally).
`patterns/chemistry.md` §2 names "bond glyphs, Lewis dots" as Phase-5b scope. Not required for any
sim in this plan — every concept above is authored 3D-first.

## 7. Do NOT build — the organic demo tier

IUPAC nomenclature · functional-group tables · reagent and conversion lists · named-reaction recall ·
purification techniques (crystallisation, distillation, chromatography) · qualitative tests ·
retrosynthesis practice.

**These are whiteboard jobs.** Per C5 §4, deprioritised means *later in the queue*, never *smaller
when built* — if a syllabus gap eventually forces one, it gets the same complexity-driven state count
and the same quality bar as any other concept.

---

## 8. RECOMMENDED START — Wave O-0 behind an Engine-A Phase-0 build

**Do not start with mechanisms.** Three reasons:

1. **Rule 25, foundation-first.** Every mechanism sim assumes the student can read a 3D structure off
   a bond-line drawing. Most cannot. Building O-2 first means every sim in it silently depends on an
   untaught skill.
2. **Engine A is the cheapest of the three.** It de-risks the organic pattern — camera solving,
   occlusion, projected-angle honesty (the two 3D authoring traps from C6 §4) — before committing to
   Engine C, which is the largest engine build in the chemistry roadmap.
3. **The foundation wave is not a tax.** It contains the chair flip (#4) and chirality (#5), two of
   the strongest diamonds in the subject.

**The concrete first run — one chapter-shaped build:**

| Step | Work |
|---|---|
| Phase 0 | **Engine A** — `field3d-surgeon`, a conformational-rotation scenario on `field_3d`. Rule 40: lands on master separately and immediately |
| Concept 1 | **#1 bond-line ↔ 3D structure translation** |
| Concept 2 | **#2 conformations of ethane** |
| Concept 3 | **#4 cyclohexane chair flip** |
| Concept 4 | **#5 chirality & optical isomerism** |

Same shape as the bonding-scene Phase-0 build that preceded VSEPR (`docs/AUTHORING_PIPELINE.md` §0).
Four sims, one engine, and it makes the SN cluster (#15/#16) cheap afterwards — #5 is the
prerequisite that makes "inversion" a meaningful word in the first place.

**The two 3D authoring traps apply from state one** (C6 §4, learned on VSEPR): occlusion can delete
taught content (anything the narration counts must be countable in the projection), and a projected
angle is not the angle (fatal when a state's thesis is a comparison *between* two angles — which is
exactly what staggered-vs-eclipsed and axial-vs-equatorial are). Camera placement here is a
measurable quantity with correct answers, not a matter of taste.

---

## 9. Open questions for the founder

1. **Is organic the right next subject investment at all?** §1 is the honest case: it is India-deep
   and internationally narrower than physical chemistry. Physical chemistry still has un-built 6/6
   diamonds (titration curve, osmosis, electrochemistry).
2. **#7 structural isomerism** is borderline demo tier. Build it last in O-0, or cut it (→ 31 sims).
3. **Spectroscopy (O-4 optional)** is real A-level/IB weight but zero CBSE weight and lands on the
   graph engine, not Engines A–C. Separate decision from the rest of this plan.
