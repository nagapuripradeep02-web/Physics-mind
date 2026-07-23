# CHEMISTRY_DISCUSSIONS.md — chemistry strategy & decisions log

> Dedicated chemistry strategy log (sibling of `docs/DISCUSSIONS.md`, which stays the physics/product
> log). Newest session first. Captures the *why* behind chemistry decisions — the *what/how* lives in
> `PROGRESS_CHEMISTRY.md`, `docs/CHEMISTRY_ARCHITECTURE.md`, and `docs/CHEMISTRY_BUILD_PLAN.md`.

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
