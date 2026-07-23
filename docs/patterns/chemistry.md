# Chemistry patterns library — v0.1 (seed)

> **Status: SEED (2026-07-23, CHEMISTRY_BUILD_PLAN.md Phase 2).** Sibling of
> `patterns/magnetism.md`, which grew section-by-section as each diamond shipped — this file starts
> with the archetype catalog + source roles (what the architect needs BEFORE the first chemistry
> skeleton) and grows its primitives/choreography/overlay sections the same way, one shipped concept
> at a time. Consumers: `architect` (skeleton archetype declarations), `chemistry_author`
> (Rule 31 timelines must cite an archetype here), `quality_auditor` (audits the declaration).
>
> **Hard interim rule (until Phase 5 builds the chemistry render surface):** only archetypes marked
> **[LIVE]** may appear in a skeleton — they map to renderers that exist today. **[PHASE-5]**
> archetypes are design targets; a concept needing one is not buildable yet and must not be
> scheduled ahead of the Phase-5 renderer work.

---

## 0. The representation triangle (the chemistry-specific teaching lens)

Chemistry understanding lives on three levels at once — **macroscopic** (what you observe: color,
temperature, fizzing), **particulate** (what particles do: collide, bond, transfer electrons), and
**symbolic** (what we write: H₂O, ⇌, K_c). The classic student failure is knowing the symbols
without the particles. This is Rule 33 (macro↔micro) with a third vertex:

- Every chemistry skeleton DECLARES, per state, which vertex leads and which supports.
- The symbolic vertex NEVER leads a core-ring state — symbols enter as labels on particulate/macro
  action already seen (Rule 25 foundation-first, chemistry form).
- The equation surface (ONE per state, Rule 34) is the symbolic vertex earning its place: it appears
  only after its particulate story has played.

## 1. Archetype catalog

### K — Particle trajectory / scattering **[LIVE]**
Charged or neutral particles fly through a field/target region; paths bend, bounce, or pass.
- **Maps to:** the force-in-field trajectory machinery proven in `magnetic_force_moving_charge`
  (field_3d) and the particle stream machinery in `particle_field_renderer`.
- **Serves (NCERT Cl.11 Ch.2 + kinetics):** Rutherford α-scattering, charged-particle deflection
  (Thomson), collision-theory beats in kinetics.
- **Signature beats:** aim → fly → deflect (cause: the nucleus/charge, visible BEFORE the path
  bends); rare-event contrast (most pass straight ↔ few bounce back).

### L — Energy-level ladder / transitions **[LIVE]**
A vertical ladder of discrete levels; a marker (electron) jumps between rungs; each jump pairs with
an emitted/absorbed quantum (arrow/flash) and a real number (ΔE, wavelength).
- **Maps to:** 2D primitive composition (`body`/`label`/`formula_box`/`animated_path`/`glow_focus`
  on `parametric_renderer`) — no new engine code; graph panel-B for spectra.
- **Serves:** Bohr model, atomic spectra, ionisation energy trends; later: activation-energy
  profiles (the "ladder" rotated into a reaction-coordinate hill).
- **Signature beats:** quantised-jump (no between-rung stops — the misconception counter), absorb
  vs emit contrast pair, level-spacing → line-spectrum link.

### M — Particulate box (2D kinetic view) **[LIVE]**
A closed 2D region of moving particles; the taught variable (T, P, V, concentration) changes and
the particle behavior responds (speed, collision frequency, density).
- **Maps to:** `particle_field` premium primitive + the kinetic-theory archetype
  (`docs/catalog/pilot-topic-27-kinetic-theory.md` machinery).
- **Serves:** states of matter, gas laws, diffusion, collision theory, Le Chatelier concentration/
  pressure beats. ⚠ syllabus-check states-of-matter topics against the rationalised 2023+ NCERT.
- **Signature beats:** heat-the-box (T slider → speed distribution), crowd-the-box (V/concentration
  → collision count HUD), the count is REAL (Rule 33c — collisions/s readout, never vibes).

### N — Graph-first relationship **[LIVE]**
The concept IS a curve: panel-B plots the relationship live while panel-A shows the particulate/
macro cause.
- **Maps to:** `graph_interactive_renderer` (panel_b_config) — titration curves, Maxwell-Boltzmann,
  rate-vs-concentration, P-V isotherms.
- **Serves:** titration (equivalence point), kinetics orders, gas-law curves, solubility.
- **Signature beats:** trace-as-you-cause (slider drags the cause; the curve draws), landmark-point
  glow (equivalence point, peak of the distribution).

### O — Reaction ledger (balance/rearrange) **[LIVE — composition only]**
Species as labeled tiles; a reaction rearranges atoms between tiles with every atom visibly
conserved (atoms MOVE, never fade out/in — the conservation law made visual).
- **Maps to:** 2D primitive composition (`body`/`label`/`animated_path`/`comparison_panel`);
  choreography is bespoke per concept until a dedicated primitive lands (Phase 5b).
- **Serves:** balancing equations, mole concept beats, stoichiometry, conservation-of-mass.
- **Signature beats:** atom-audit (count table fills live), the coefficient acts (×2 duplicates the
  visible molecule, never edits a subscript — THE misconception counter).

### P — Molecular 3D (orbitals / VSEPR / lattices) **[PHASE-5]**
s/p/d orbital lobes, electron-pair repulsion geometry, crystal cells — requires the Three.js
`molecule_3d`/`orbital_3d` render surface (`CHEMISTRY_ARCHITECTURE.md` §5c). Design target only;
do not schedule concepts that need it ahead of Phase 5.

### Q — Apparatus / wet-lab (titration, electrochemical cell) **[PHASE-5]**
Burette/flask/indicator, half-cells + salt bridge with electron/ion flow. Needs the 5b apparatus
primitives. Titration's CURVE is buildable today via archetype N; the apparatus drawing is not.

## 2. Primitives — extras catalog

*Grows per shipped concept, exactly as `patterns/magnetism.md` §2 did per diamond. Until then:
compose from the generic PCPL/premium set (`body`, `label`, `formula_box`, `annotation`,
`comparison_panel`, `animated_path`, `glow_focus`, `particle_field`, `smooth_camera`). New chemistry
primitives (bond glyphs, Lewis dots, apparatus) are Phase-5b scope — an
`engine_bug_queue` row to `peter_parker:renderer_primitives`, never improvised inline.*

## 3. Choreographies — named animation idioms

*Grows per shipped concept. Naming convention follows magnetism's (`aim-fly-deflect`,
`quantised-jump`, `heat-the-box`, `atom-audit` are the seed names used in §1's signature beats —
the first shipped concept of each archetype canonises its choreography here with t-windows.*

## 4. Overlay patterns

*Grows per shipped concept. Standing rules inherited fleet-wide: Rule 34 canvas budget (ONE
math-serif Unicode equation surface + value-only HUD; ⇌, subscripts, → as proper Unicode across
DOM/graph/sprite), Rule 32 single glow focal, delta-cue caption ≤5 words, overlays never collide
(magnetism §4 collision rule applies verbatim).*

## 5. Chemistry helpers

*Grows as formulas ship. Seed inventory the first concepts will need:*
- Mole bridge: `n = m / M` · number of particles `= n × 6.022e23` (display via scale-factor label,
  never literal particle count on canvas).
- Temperature: sliders in °C, formulas in K (`T + 273.15`) — declare the conversion in every
  engine_config that heats anything.
- Rutherford geometry: impact parameter → scattering angle (hyperbolic path); closest approach
  `d = kQq / E` — the ONE formula surface of the aha state.
- Bohr: `E_n = −13.6/n² eV` (advanced ring: algebra-only form on core states is the LEVEL DIAGRAM
  itself with ΔE numbers, not the formula).

## 6. Source roles (chemistry — Rule 35 unchanged)

| Source | Role | Never |
|---|---|---|
| **NCERT Chemistry** | syllabus backbone — coverage + sequencing, chapter indexes only | import prose/figures/examples |
| **NCERT Exemplar** | misconception *belief* source (which wrong beliefs are common) | import problem text |
| First principles | ALL teaching method, examples, phrasing, anchors | — |
| Universal anchors | rusting, soda fizz, electroplating, cooking-soda + vinegar | country-specific culture (Rule 35) |

Architect self-review line (chemistry form): *"Consulted NCERT Chemistry chapter index to confirm
scope. No teaching method, no example problem, no figure imported."*
