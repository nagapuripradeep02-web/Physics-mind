# CHEMISTRY_DISCUSSIONS.md — chemistry strategy & decisions log

> Dedicated chemistry strategy log (sibling of `docs/DISCUSSIONS.md`, which stays the physics/product
> log). Newest session first. Captures the *why* behind chemistry decisions — the *what/how* lives in
> `PROGRESS_CHEMISTRY.md`, `docs/CHEMISTRY_ARCHITECTURE.md`, and `docs/CHEMISTRY_BUILD_PLAN.md`.

---

## Session C5 — The whiteboard test: build order is driven by IRREPLACEABILITY, not renderer cost; the ranked chemistry priority list (2026-07-27)

**The founder's challenge, after watching `law_of_conservation_of_mass` come off the line:** *"These
types of concepts are suitable for explaining even without simulation. A teacher can do that more
effectively — a teacher might use only the last state as a reference. Which simulations are more
impactful on students and more dependable for teachers?"*

**The challenge is correct, and it overturns the build order this project was using.**

### 1. The whiteboard test (LOCKED — the gate every candidate concept passes before it is scheduled)

> **If a good teacher with a whiteboard and 60 seconds produces the same understanding, it is not a
> diamond — and we should not spend a build on it.**

`law_of_conservation_of_mass` mostly fails this test. "Atoms rearrange, nothing is created or
destroyed" is one sentence and one sketch. Its arithmetic (12 + 32 = 44) is genuinely *better* on a
board, because the teacher controls pace and can read a confused face. **Exactly one state survives
the test — S2, open pan vs sealed flask** — because that is a real experiment a teacher cannot run in
a classroom (you cannot burn charcoal in a sealed flask on a balance in front of 40 students). The
other six states are scaffolding around a beat that needed two.

This confirms `docs/DISCUSSIONS.md` Topic 14 from the inside: chemistry is **~30–40% diamond**, and
the diamonds are *concentrated* in physical chemistry, organic mechanisms and stereochemistry.
Bookkeeping is the demo tier.

### 2. What a simulation does that a teacher cannot — the four capabilities

A concept earns a build only if it needs at least one of these. Everything else is a whiteboard job.

1. **Show the invisible at scale** — 500 particles responding to temperature; electrons drifting;
   field lines. A teacher draws three particles and asks the class to imagine the rest.
2. **Run "what if" with guaranteed-correct physics** — drag a variable, watch everything respond,
   infinitely, always right. A teacher redraws two cases and asserts the trend between them.
3. **Hold 3D spatial structure** — orbitals, VSEPR, stereochemistry, lattices. The place where
   hand-waving fails worst and a 2D board simply cannot go.
4. **Make a counterintuitive result believable** — the student's intuition says X, reality is Y, and
   only *watching it happen* changes the belief.

Bookkeeping, definitions, nomenclature and algebra fail all four. That is the whole demo tier.

### 3. The corrected doctrine — renderer-compounding applies INSIDE the diamond zone only

Session C3 locked "build by renderer archetype, not by chapter" so each build makes the next cheaper.
**That is still right, but it optimizes COST, and cost is the wrong master variable.** Applied
without the whiteboard test it produces a cheap catalog of concepts that did not need to be
simulations.

**Withdrawn this session:** the recommendation (made 2026-07-27, same day) to harvest the Ch.1 ledger
cluster next — mole concept → percentage composition → stoichiometry → limiting reagent — on the
grounds that they reuse the archetype-O machinery `law_of_conservation_of_mass` just built. They are
*more* bookkeeping than the concept the founder is questioning. **Cheap is irrelevant when the output
did not need to be a simulation**, and a thin catalog of demo-tier sims actively costs teacher trust —
which is the buy-trigger (CLAUDE.md §3), not concept count.

**Locked rule: compounding is a tie-breaker between diamonds, never a reason to build a demo.**

### 4. State count gets a second axis (proposed refinement to Rule 31 / §5)

Rule 31 sets state count by *complexity*. The founder's observation — that a teacher would use only
the last state — exposes a second axis: **irreplaceability**. When a sim's value concentrates in one
or two beats, building seven is wasted effort and dilutes the teacher's attention.

- **Diamond** → full complexity-driven arc (the current rule).
- **Strong** → trimmed arc, only the states carrying un-drawable content.
- **Demo (built only if a syllabus gap forces it)** → **2–3 states maximum**, built around the single
  beat that passes the whiteboard test, plus explore.

`law_of_conservation_of_mass` under this rule would have been ~3 states (the open/sealed contrast,
the atom shuttle, explore) at roughly 40% of the cost. **Not retrofitted** — it is built, approved,
baseline-locked and voiced; it stays as-is and serves as the ledger-choreography reference. The rule
applies from the next concept onward.

### 5. "Dependable" is a SEPARATE axis from "impactful"

The founder named two things, and they are not the same:
- **Impactful** = irreplaceability (the four capabilities above).
- **Dependable** = will a teacher *risk it live*, mid-explanation, in front of a class — loads fast,
  does exactly what they expect, no surprises, and they can drive it.

Dependability is why Rule 31's per-state contextual controls and Rule 32's legibility discipline
matter more than catalog size, and it is the second half of the §3 buy-trigger (coverage **+
classroom reliability**). A diamond that a teacher does not trust in front of a class scores zero.

### 6. THE RANKED PRIORITY LIST

Ordering = **(irreplaceability tier) × (curriculum weight) ÷ (renderer dependency)**, with
prerequisite chains respected inside each wave. Curriculum cells are **Rule 38g CLAIMS** — only
CBSE/NCERT is author-verified; every international cell needs a real teacher of that board to confirm.

**⚠ NCERT rationalisation caveat (carried from `CHEMISTRY_ARCHITECTURE.md` §9 and
`chemistryCatalog.ts`): States of Matter and Solid State were REMOVED from the rationalised NCERT.
Any chapter beyond Cl.11 Ch.1–4 must be verified against the current syllabus before scheduling.**

#### P0 — ENGINE: the particle-box scenario (`particle_field`, one modest scenario build)

Not a concept. **The highest-ROI action in the chemistry roadmap:** one gas-collision-box scenario
unlocks all six P1 diamonds below. Until it ships, P1 is unbuildable (archetype M is
`[NEEDS-SCENARIO]`). Owner: `peter_parker:renderer_primitives`. Rule 40: lands on master separately.

#### P1 — The physical-chemistry diamonds (harvest the particle box, in this order)

| # | Concept | Tier | NCERT | International | Why it cannot be a whiteboard |
|---|---|---|---|---|---|
| 1 | **Le Chatelier's principle** | 💎 | Cl.11 Ch.6 | IGCSE · IB · AP · A-level | **The single best chemistry sim that exists to be built.** Change concentration/pressure/temperature, watch the system shift and re-settle. All four capabilities at once. No teacher can show it |
| 2 | **Dynamic equilibrium** (forward rate = backward rate, both still running) | 💎 | Cl.11 Ch.6 | IGCSE · IB · AP · A-level | The whole misconception is "the reaction stopped." Only motion kills it |
| 3 | **Rate of reaction** (concentration · temperature · surface area · catalyst) | 💎 | Cl.12 Ch.3 | IGCSE (heavy) · IB · AP · A-level | Four causes, one visible effect, live-swept |
| 4 | **Collision theory + activation energy** | 💎 | Cl.12 Ch.3 | IB · AP · A-level | Invisible by definition; the "not every collision reacts" beat needs to be watched |
| 5 | **Maxwell–Boltzmann distribution** | 💎 | Cl.12 Ch.3 | IB · AP · A-level | A distribution *shifting* is a motion, not a picture |
| 6 | **Kinetic particle theory / states of matter** | 💎 | ⚠ removed from rationalised NCERT | IGCSE (opener) · IB · AP · A-level | The substrate for 1–5. Build even though NCERT dropped it — it is the foundation and it is universal abroad |
| 7 | **Diffusion / Graham's law** | ⭐ | ⚠ verify | IGCSE · A-level | Cheap once the box exists |

#### P2 — Live-renderer diamonds (parametric + graph_interactive; NO new engine work)

| # | Concept | Tier | NCERT | International | Note |
|---|---|---|---|---|---|
| 8 | **Titration curve** (the curve, not the apparatus) | 💎 | Cl.11 Ch.6 | IB · AP · A-level (heavy) | Archetype N, `[LIVE]` today. The equivalence-point cliff is the payoff |
| 9 | **Reaction profiles / enthalpy / activation energy** (exo vs endo) | ⭐ | Cl.11 Ch.5 | IGCSE · IB · AP · A-level | Archetype L rotated into a reaction coordinate. Reuses the Bohr ladder machinery |
| 10 | **Hydrogen emission spectrum** | ⭐ | Cl.11 Ch.2 | IB · AP · A-level | Direct successor to the shipped `bohr_model_energy_levels`; cheapest remaining strong concept |
| 11 | **Periodic trends** (atomic radius · ionisation energy · shielding) | ⭐ | Cl.11 Ch.3 | all boards | The *mechanism* (effective nuclear charge) is invisible; the trend alone is a graph |

#### P3 — ENGINE: Phase-5 Three.js molecule/orbital surface

The largest investment and the **highest ceiling in the subject** — it unlocks the entire P4 block,
which is where chemistry's densest diamond cluster lives. Founder-gated (`CHEMISTRY_BUILD_PLAN.md`
Phase 5). Schedule after P1 proves the particle-box compounding thesis.

#### P4 — The 3D diamonds (need P3)

| # | Concept | Tier | NCERT | International | Note |
|---|---|---|---|---|---|
| 12 | **VSEPR / molecular shapes** | 💎 | Cl.11 Ch.4 | all boards, heavily examined | Arguably #2 overall after Le Chatelier. Pure 3D — capability 3 |
| 13 | **Hybridisation (sp/sp²/sp³)** | 💎 | Cl.11 Ch.4 | IB · AP · A-level | Inseparable from 12; build as a pair |
| 14 | **SN1 vs SN2 + Walden inversion** | 💎 | Cl.12 Ch.6 | IB · AP · A-level | The inversion is *impossible* to draw. Arrow-pushing on a board loses the 3D entirely |
| 15 | **Stereochemistry / chirality / optical isomerism** | 💎 | Cl.12 organic | IB · A-level | 3D is the entire concept |
| 16 | **Atomic orbitals s/p/d** | 💎 | Cl.11 Ch.2 | all boards | Closes the Ch.2 atomic-structure arc |
| 17 | **σ / π bonding** | 💎 | Cl.11 Ch.4 | IB · AP · A-level | |
| 18 | **E1 / E2 elimination** | 💎 | Cl.12 Ch.6 | IB · A-level | Pairs with 14 |
| 19 | **Solid state / unit cells** | 💎 | ⚠ removed from rationalised NCERT | A-level · IB | International-only value for now |

#### P5 — ENGINE: apparatus / wet-lab primitives (Phase 5b) → then

| # | Concept | Tier | NCERT | International | Note |
|---|---|---|---|---|---|
| 20 | **Electrochemical cell** (Daniell, salt bridge, electron + ion flow) | 💎 | Cl.12 Ch.2 | IGCSE · IB · AP · A-level | Two invisible flows at once, in opposite directions |
| 21 | **Electrolysis** | 💎 | Cl.12 Ch.2 | IGCSE (heavy) · A-level | |
| 22 | **Titration apparatus + indicator** | ⭐ | Cl.11 Ch.6 | all boards | Completes #8 |

#### DEPRIORITISED — the demo tier (build ONLY if a syllabus gap forces it, and then at 2–3 states)

Mole concept · stoichiometry · limiting reagent · percentage composition · empirical/molecular
formula · balancing equations · nomenclature · descriptive inorganic · qualitative analysis ·
metallurgy · biomolecules. **These are whiteboard jobs.** `law_of_conservation_of_mass` (built) is the
reference for what this tier looks like and why we are not building more of it.

### 7. What changes immediately

1. **Next chemistry action is the P0 particle-box scenario build**, not another concept.
2. The Ch.1 ledger harvest is **cancelled**.
3. Every future chemistry skeleton states its tier (💎 / ⭐ / demo) and its whiteboard-test
   justification in §1 of the skeleton, before state design begins.
4. `CHEMISTRY_BUILD_PLAN.md`'s phase tracker should point here for concept ORDER; it remains the
   authority on phase *mechanics*.

---

## Session C4 — First diamond built (Bohr): the archetype→renderer map is systematically optimistic; verify against code before scheduling (2026-07-23)

**The recurring finding.** Three of the five chemistry archetypes in `docs/patterns/chemistry.md` v0.1
were marked more renderer-ready than the code supports — and each was caught only by reading the
actual renderer:
- **M (particle-box):** claimed [LIVE]; `particle_field_renderer` is entirely circuit-shaped, no
  gas-collision box. → corrected to [NEEDS-SCENARIO] (Session C3).
- **K (particle scattering):** claimed [LIVE] via `magnetic_force_moving_charge` reuse; that machinery
  is hardcoded closed-form circle/helix with NO general force integrator, so Rutherford's 1/r²
  hyperbolic scattering needs a new ~200–400-line `field_3d` scenario. → split: in-field
  circular/helical = [LIVE]; scattering = [NEEDS-SCENARIO] (this session).
- **L (energy ladder):** genuinely [LIVE] on the `parametric` renderer — BUT "no new engine code" was
  wrong twice: (a) every parametric concept needs its own ~15-line `computePhysics_<id>` (hardcoded
  per-id dispatch, the §9 "low engine cost"); (b) the review site (`build_review_site.ts`) never
  supported the parametric renderer AT ALL — it hard-gated on field_3d/particle_field, so even physics
  parametric concepts had no teacher-surface path. Both closed additively this session.

**Doctrine takeaway (captured):** an archetype's [LIVE] tier is a CLAIM about renderer readiness, and
like Rule 38g curriculum tags it must be VERIFIED against the code before a concept is scheduled — not
trusted from the pattern doc. The architect/chemistry_author now cite the tier; a `[LIVE]` that hasn't
been code-verified for the SPECIFIC motion the concept needs is a scheduling risk. The cost ladder was
worth it: reading the renderer first (an Explore pass) turned two potential dead-end pipeline runs
(Rutherford; a "zero-code" Bohr that renders literal `{…}` labels) into one clean, correct, viewable
first diamond.

**GAP 2 (parametric live-position) noted as the one genuine renderer limitation** — text binds to live
vars, positions don't; a `renderer_primitives` follow-up if drag-driven explore motion is wanted.
Guided teaching is unaffected. Detail: `PROGRESS_CHEMISTRY.md` (this session) + `patterns/chemistry.md`
archetype L.

---

## Session C3 — International-first build FLOW: build by renderer archetype, not by chapter; the "universal passport" cluster; prove-first / Rutherford decision (2026-07-23)

**The question (founder):** "We serve international curricula AND NCERT at the same time. In what FLOW
should we create simulations so each one makes the next easier to build (renderer reuse), goes faster
with high quality, and maximizes value across both international and Indian syllabi?"

**1. The reframe — build by renderer archetype, not by chapter.** A simulation's real cost is the
renderer scenario behind it. So the compounding flow is: make one renderer investment, then harvest
every concept that reuses it before moving on. This is the physics *magnetism recursive-bootstrap*
(`docs/MAGNETISM_ARCHITECTURE.md`) applied to chemistry — each concept EXTENDS a shared surface
instead of starting over, so cost-per-concept falls as the catalog grows.

**2. Chemistry's "universal passport" = the physical chemistry of change.** For physics, Session 86
found the circuits chapter was the one cluster present in all six curricula. The chemistry analog —
the cluster that is BOTH highest cross-curriculum overlap AND most simulatable — is **kinetic theory →
rates → energetics → equilibrium** (Topic-14's "physical chemistry" diamonds). Every one sits in
NCERT AND Cambridge IGCSE AND IB DP AND AP Chem AND A-level. Atomic structure and bonding are also
universal, but bonding's payoff is 3D (Phase-5 renderer).

**3. Cross-curriculum overlap (Rule 38g CLAIMS — `needs_teacher_verification`; only CBSE/NCERT is
author-verified):**

| Concept cluster | In every board? | Simulatability | Renderer status |
|---|---|---|---|
| Kinetic particle theory / states of matter | ✅ (IGCSE opener; IB/AP/A-level KMT) | ★★★ | needs particle-box scenario |
| Rates of reaction / collision theory | ✅ | ★★★ | needs particle-box + graph |
| Energetics / enthalpy & reaction profiles | ✅ | ★★★ | ~[LIVE] (2D ladder + graph pane) |
| Equilibrium / Le Chatelier | ✅ (light IGCSE) | ★★★ | needs particle-box |
| Atomic structure / models | ✅ | ★★ | Rutherford [LIVE]; orbitals Phase 5 |
| Bonding / VSEPR | ✅ | ★★★ | 3D → Phase 5 |
| Mole / stoichiometry | ✅ | ★ weak | generic primitives |
| Organic mechanisms, electrochem cells | higher levels | ★★★ | → Phase 5 |

**4. Renderer reality check (VERIFIED against the code, not assumed).** `particle_field_renderer` is
entirely circuit-shaped (topology bridge/wire/meter_bridge; scenarios resistors/emf/power). There is
NO gas-particle/collision/kinetic-box scenario anywhere, and kinetic theory is not a built physics
concept. So:
- **Archetype M (particle-box) is NOT truly [LIVE]** — it needs a modest gas-collision-box scenario
  built once (a `renderer_primitives` task, NOT the big Phase-5 Three.js build). Once built it serves
  kinetic theory + rates + equilibrium + diffusion — best ROI in the roadmap.
- **The only genuine zero-renderer start is Rutherford** (archetype K, reuses the *built*
  `magnetic_force_moving_charge` trajectory) and graph panes (archetype N, `graph_interactive`).
- **ACTION:** `docs/patterns/chemistry.md` currently mislabels archetype M as [LIVE] — correct it
  (add a "needs-a-scenario" tier between [LIVE] and [PHASE-5]).

**5. The locked build FLOW (5 waves).** Cost-per-concept inverts: Wave 1 = 1 renderer for ~1 concept;
Wave 2 = 1 renderer for ~6; Wave 3 mostly reuse. The one big Three.js build (Wave 5) waits until
~12–15 high-overlap concepts are banked.

1. **Wave 1 — Prove it (K, £0):** Rutherford α-scattering [+ electron-discovery deflection].
2. **Wave 2 — Passport (M particle-box + N graph, build box once):** kinetic theory/states →
   diffusion → rates → collision theory → equilibrium/Le Chatelier.
3. **Wave 3 — Energy (L ladder + N):** Bohr/energy levels/spectra · reaction profiles/enthalpy/
   activation energy (reuses Wave 2's collision story + this ladder).
4. **Wave 4 — Bookkeeping (O ledger, generic primitives):** balancing · conservation of mass · mole
   concept · stoichiometry.
5. **Wave 5 — Structure (P Three.js, Phase 5):** orbitals · bonding/VSEPR · hybridization · organic
   mechanisms · electrochem cells.

**6. Build order ≠ learning order.** The catalog is non-linear (teachers pick concepts); the
pedagogical prerequisite chain lives in the ghosts' `prerequisites` metadata. Build order is optimized
for renderer compounding + curriculum overlap; the learning sequence is a separate data layer.

**7. Decision (founder): prove-first.** Wave 1 = Rutherford α-scattering, next session — validates the
untested chemistry pipeline on a zero-renderer concept before any new scenario is built. The
particle-box investment + the international-passport cluster follow immediately after in Wave 2.

**8. Depth doctrine reaffirmed (Session 63 / Rule 38).** Author each concept at NCERT/JEE depth (the
deepest); IGCSE/IB/AP just hide the advanced ring (Rule 38a/38c). What adapts DOWN cheaply is depth,
not syllabus — so "serve international" is solved by choosing the universal-passport CONCEPTS, then
depth-ringing them, not by re-authoring per board.

---

## Session C2 — Parity audit: "is chemistry as strong as physics? why wasn't the architect changed?" (2026-07-23)

**Founder's challenge before building any sim.** Correct instinct — the biggest live gap was exactly
the architect. Two audits (agent-spec misfires + serving-path tooling) found:

- **Design was right, execution incomplete.** ONE shared architect/quality_auditor/eye_walker (not
  sibling roles) is correct — the skeleton framework is subject-neutral. But their SPEC adaptation
  (designed in CHEMISTRY_ARCHITECTURE §4/§7) had never been APPLIED, so they were still physics-worded.
- **Four misfire clusters:** (a) architect never referenced `docs/patterns/chemistry.md` → would emit
  physics archetypes that `chemistry_author` must reject (input-contract violation by construction);
  (b) auditor had no `alex:chemistry_author` FAIL route + Gate 2 demanded the concept appear in the
  flat validator's PASS list (impossible — non-recursive scan → false-FAIL every chemistry concept) +
  Gates 4a/4b false-FAIL on deliberately-unregistered chemistry; (c) json_author's flat output path +
  "8 registration sites, miss one = failure" is INVERTED for chemistry (registries must NOT be
  touched); (d) eye_walker lacked chemistry visual-sanity checks.
- **Tooling:** 3 build/verify scripts hardcoded the flat physics dir, incl. a silent-degradation trap
  in THE EYE. No chemistry schema gate existed at all.

**Fixes (all additive, physics specs byte-preserved):** "Chemistry concepts (2026-07-23)" sections in
all four canonicals + same-session emission regen; shared `resolveConceptJson.ts` (flat-first =
byte-identical physics); `validate:chemistry` v0; SOP + operating-manual addenda. See
`PROGRESS_CHEMISTRY.md` and commit `ed49664`.

**Takeaway captured as doctrine:** chemistry is now genuinely at parity — every layer a physics
concept flows through has a defined, tested chemistry path.

---

## Session C1 — Foundation architecture: extend, don't duplicate; the two seams (2026-07-23)

**The founding decision.** Four read-only architecture passes over the live tree established that the
factory is subject-agnostic at its spine (concept-JSON schema, EPIC-L state machine, TTS, quizzes,
sliders, player, catalog — all reusable). Chemistry-specific work is concentrated in exactly TWO
seams:
1. **The rigor author role** (`physics_author` → `chemistry_author`) — balanced equations,
   stoichiometry, equilibrium/kinetics, thermodynamics, bonding. DONE (Phase 2).
2. **The render/validate engines** — physics primitives/renderers are Newtonian; chemistry needs its
   own (particle-box → Phase 5 Three.js molecule/orbital). PHASED.

Everything between those seams is shared infrastructure to EXTEND, not fork. Full design in
`docs/CHEMISTRY_ARCHITECTURE.md`; phased execution in `docs/CHEMISTRY_BUILD_PLAN.md`.

**Reference — chemistry simulatability map (from `docs/DISCUSSIONS.md` Topic 14, chemistry slice):**
Chem ~50–60% useful / ~30–40% diamond. Diamonds concentrate in **physical chemistry** (atomic
structure/orbitals, bonding/VSEPR, kinetics, equilibrium, electrochem, solid-state) + **organic
mechanisms** (SN1/SN2/E1/E2, EAS) + **stereochemistry**. Demo/weak = descriptive inorganic,
qualitative analysis, metallurgy, biomolecules (facts, not motion). Chemistry is Three.js-heavy
(molecules/orbitals/lattices); the existing renderer stack already covers the diamond zones →
expansion is content, not new engine tech (except the particle-box + Three.js molecular surfaces).
