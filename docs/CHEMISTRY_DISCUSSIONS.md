# CHEMISTRY_DISCUSSIONS.md — chemistry strategy & decisions log

> Dedicated chemistry strategy log (sibling of `docs/DISCUSSIONS.md`, which stays the physics/product
> log). Newest session first. Captures the *why* behind chemistry decisions — the *what/how* lives in
> `PROGRESS_CHEMISTRY.md`, `docs/CHEMISTRY_ARCHITECTURE.md`, and `docs/CHEMISTRY_BUILD_PLAN.md`.

---

## Session C6 — The whiteboard test, executed: capability 3 gets an engine; and a green machine gate is not a verdict (2026-07-28)

> **⚠ Session C5 is missing from this file on master.** The whiteboard test and THE RANKED PRIORITY
> LIST — which drive everything below — were committed to branch **`docs/chemistry-priority-order`**
> (`988b15b`, `9397863`, `feb7c9e`; pushed to origin, NOT merged). Read them there, or merge that
> branch, before treating this log as complete. C6 assumes C5.

**What this session was for.** C5 ranked the roadmap by irreplaceability and named four capabilities a
simulation has that a whiteboard does not. Three already had engines. The fourth — **capability 3,
hold 3D spatial structure** — had none, and C5 §6 put the whole P4 block behind it (VSEPR,
hybridisation, SN1/SN2, stereochemistry, orbitals, σ/π: six of the subject's densest diamonds). So P3
was built, and P4 #12 was authored on it in the same session.

### 1. "The biggest lift" was one scenario, because §5c named the wrong artefact

`CHEMISTRY_ARCHITECTURE.md` §5c specified a NEW Three.js renderer (`molecule_3d`/`orbital_3d`)
"analogous to `field_3d`", and the phase table called Phase 5 "high (biggest lift)". But `field_3d`
**is already Three.js** — so the real cost was one new `scenario_type` on the existing renderer,
inheriting its camera, clock, glow, widget, clean-mode, freeze-pin and EYE integration for free. No
new renderer file exists, and none is needed for this class of concept.

**Takeaway, and it generalises past chemistry:** an architecture doc that names a new FILE where a new
CASE would do inflates the estimate that gates the work. §5c's estimate is why Phase 5 sat
founder-gated behind two waves of 2D work. Re-read any "we need a new renderer" claim against what the
existing renderer already is.

### 2. Archetype P was one label over three different builds (the C4 lesson, self-inflicted)

C4 established that a tier is a CLAIM about renderer readiness for the SPECIFIC motion a concept
needs. "P — Molecular 3D (orbitals / VSEPR / lattices)" was that same mistake in the other direction:
three unrelated engine builds under one [PHASE-5] label. Now split — **P1 electron-domain geometry
[LIVE]**, **P2 orbitals + lattices [NEEDS-SCENARIO]** — with SN1/SN2 and stereochemistry recorded as
sitting *between* the tiers (the molecule scaffold exists; the bond-breaking/inversion motion layer
does not). Scheduling #14 or #16 off the old label would have produced exactly the dead-end pipeline
run C4 warned about.

### 3. THE EYE ran four times, was 31/31 green every time, and every real defect came from the frames

The sharpest evidence yet for the §③ doctrine that the deterministic checks are a pre-flight and the
frame-read is the gate. All four runs: 31/31, zero console errors. Meanwhile the frames showed live
labels clipped mid-word; **methane's fourth bond invisible behind the carbon, under a caption reading
"Four bonds, one shape"** (a student counts three); and STATE_2 projecting 133.6° while its own label
read 109.5° — in the one state that exists to correct a false picture.

No gate in the suite can catch any of those, because each is a claim about whether the picture means
what the words say. **A 31/31 run is a licence to start looking, not a result.**

**And my own looking was not enough either.** After I had read the frames and called the concept
finished, the founder asked whether the quality-auditor had actually been run. It had not. Running it
— plus eye_walker — produced **six more real defects**, on a build that was 31/31 green across four
runs. Two of them were regressions introduced by my own earlier fixes (pushing the arc label clear of
the molecule drove it into the span label on the aha frame; moving the central symbol away from the
arc parked it on a hydrogen). One exposed a flaw in the method I had just congratulated myself for:
the camera solver measured each domain's foreshortening but never PAIRWISE screen separation, so all
three "solved" cameras had atoms sitting on top of each other. The correct order is **solve, then
look, then have someone else look** — and the third step is not optional just because the first two
were done carefully. The measurement can be wrong in a way only a second pair of eyes will name.

### 4. Two failure modes specific to authoring in 3D (new to the fleet)

Both are inherent to a projected 3D scene; neither exists in the 2D engines.

- **Occlusion can delete taught content.** A domain aimed along the view axis foreshortens to nothing
  behind the central atom. The physics is right, the label is right, and the picture silently
  contradicts the caption. Rule 33d says an instrument must show a real number; the 3D analogue is
  that **every element the narration counts must be countable in the projection.**
- **A projected angle is not the angle.** The label states the true 3D value, the screen shows a
  projection. Textbooks do this too and it is an acceptable norm — but it stops being acceptable when a
  state's whole thesis is a comparison BETWEEN two angles (90° flat vs 109.5° real), because then the
  distortion attacks the lesson instead of decorating it.

Both were fixed by **solving** rather than looking: a scratch solver swept azimuth × elevation against
"every domain projects at ≥34% of its length" and "the measured angle projects near its label", and a
new authorable `flat_basis` puts the flat sketch plane perpendicular to the camera so its 90° is a
true right angle. **Camera placement in a 3D chemistry sim is a measurable quantity with correct
answers, not a matter of taste** — treat it that way from the first state.

### 5. A gate that cannot be satisfied is worse than no gate

`validate-chemistry`'s Rule-31a choreography check read `scene_composition` only — the PCPL shape —
while on field_3d that block is a silent no-op. It therefore reported "choreography settles ~0ms" for
every field_3d chemistry concept regardless of how its motion was timed. That is not a false negative;
it is a gate that trains the author to ignore it. Fixed to consult the shared `deriveMaxRevealTimeMs`,
whereupon it produced two genuine findings on the new concept AND cleared a false positive that had
been sitting on the shipped `bohr_model_energy_levels`.

**Pattern to watch:** chemistry keeps inheriting physics tooling that hardcodes the parametric shape
(three scripts in C2, Gate 9 in the convergence session, this one now). The next such fix should ask
whether the tool can be made renderer-agnostic rather than taught one more special case.

### 6. What did NOT change

The C5 ranked order stands, and this session executed it as written: P3, then P4 #12. Compounding
remains a tie-breaker between diamonds and never a reason to build a demo — VSEPR earned the build
because a board structurally cannot reach it; that it also unlocks #13 and #17 for free is the
tie-break, not the argument.

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
