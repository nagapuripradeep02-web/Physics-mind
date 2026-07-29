# Chemistry patterns library — v0.1 (seed)

> **Status: SEED (2026-07-23, CHEMISTRY_BUILD_PLAN.md Phase 2).** Sibling of
> `patterns/magnetism.md`, which grew section-by-section as each diamond shipped — this file starts
> with the archetype catalog + source roles (what the architect needs BEFORE the first chemistry
> skeleton) and grows its primitives/choreography/overlay sections the same way, one shipped concept
> at a time. Consumers: `architect` (skeleton archetype declarations), `chemistry_author`
> (Rule 31 timelines must cite an archetype here), `quality_auditor` (audits the declaration).
>
> **Hard interim rule (until Phase 5 builds the chemistry render surface) — THREE tiers, corrected
> 2026-07-23 per CHEMISTRY_DISCUSSIONS §C3.4 (the renderer reality-check):**
> - **[LIVE]** — maps to a renderer + scenario that EXISTS today; may appear in a skeleton now.
> - **[NEEDS-SCENARIO]** — the renderer exists but the specific scenario does NOT (e.g. no gas-particle
>   collision box exists in `particle_field_renderer`, which is entirely circuit-shaped). A modest
>   `renderer_primitives` build (one scenario, not the big Phase-5 Three.js surface) unlocks it. A
>   concept needing one is NOT buildable until that scenario ships — do not schedule it ahead of the build.
> - **[PHASE-5]** — needs the net-new Three.js molecule/orbital render surface (`CHEMISTRY_ARCHITECTURE.md`
>   §5c). Design target only; never schedule ahead of Phase-5 renderer work.
>
> Only **[LIVE]** archetypes may appear in a skeleton today. Archetype M was mislabeled [LIVE] in v0.1;
> the code check found NO gas-collision scenario anywhere — it is **[NEEDS-SCENARIO]** (Wave-2 build).
>
> **Update 2026-07-28:** archetype **P is no longer [PHASE-5] at all.** Both its 3D halves shipped in
> one day as scenarios on the EXISTING Three.js renderer, not as the new renderer file
> `CHEMISTRY_ARCHITECTURE.md` §5c anticipated: **electron-domain geometry** as `molecular_geometry`,
> and **orbital lobes** as `orbital_shapes`. Only **crystal lattices** remain [NEEDS-SCENARIO]. See
> archetype P below.
>
> **What §5c got wrong is worth remembering, because it cost two waves of scheduling:** it named a new
> FILE where a new CASE would do, and the phase table then called Phase 5 "high (biggest lift)" and
> founder-gated it behind everything else. `field_3d_renderer.ts` was already Three.js. **Re-read any
> "we need a new renderer" claim against what the existing renderer already is.**

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

### K — Particle trajectory / scattering **[SPLIT — see status]**
Charged or neutral particles fly through a field/target region; paths bend, bounce, or pass.
- **Renderer reality-check (verified 2026-07-23 against `field_3d_renderer.ts`):** the
  `magnetic_force_moving_charge` machinery is **[LIVE] only for closed-form in-field trajectories**
  (`trajectory_mode: circle/helix/static`, computed parametrically at `field_3d_renderer.ts:36186+`).
  It has **NO general force integrator** — it cannot represent a **1/r² hyperbolic SCATTERING** path
  off a fixed central nucleus, and no Coulomb scenario animates a moving particle. So **Rutherford
  α-scattering (aim→fly→deflect off a fixed nucleus, multi-particle beam) is [NEEDS-SCENARIO]** — a
  modest new `field_3d` scenario (~200–400 lines, `renderer_primitives`), NOT a free reuse. This was
  mislabeled [LIVE] in v0.1 (same error class as archetype M); corrected here.
- **[LIVE] today:** in-field circular/helical charged-particle deflection (the magnetic machinery
  as-is). **[NEEDS-SCENARIO]:** hyperbolic scattering / fixed-scatterer beams (Rutherford, Thomson
  deflection, collision-theory trajectories) — deferred to a Wave-1.5 scenario build.
- **Signature beats (once the scenario ships):** aim → fly → deflect (cause: the nucleus/charge,
  visible BEFORE the path bends); rare-event contrast (most pass straight ↔ few bounce back).

### L — Energy-level ladder / transitions **[LIVE — verified 2026-07-23]**
A vertical ladder of discrete levels; a marker (electron) jumps between rungs; each jump pairs with
an emitted/absorbed quantum (arrow/flash) and a real number (ΔE, wavelength).
- **Maps to:** 2D primitive composition on the `parametric` renderer (`renderer_pair.panel_a:
  "parametric"`) — no new engine code. Renderer + vocabulary CONFIRMED against
  `parametric_renderer.ts` and two shipped concepts (`vector_head_to_tail`,
  `newton_second_law_direction`): `body`, `label`, `annotation`, `animated_path` (straight from→to
  lerp — exactly a rung-to-rung jump / a photon arrow), `glow_focus`, `formula_box`,
  `comparison_panel`, `axes`, `derivation_step`, `smooth_camera`, canvas `slider`. Spectra via a
  `graph_interactive` panel-B or a body-strip in panel-A. **This is the Wave-1 zero-*renderer* path
  (Bohr, built 2026-07-23).**
- **Two build-proven caveats (Bohr, 2026-07-23) — "zero renderer" ≠ "zero code":**
  (1) **Each parametric concept still needs its own ~15-line `computePhysics_<id>`** in
  `parametric_renderer.ts` (iframe-side, for live labels) + a TS engine in
  `src/lib/physicsEngine/concepts/` — `computePhysics()` is a hardcoded per-id dispatch, not a generic
  evaluator. This is the "low engine cost" `CHEMISTRY_ARCHITECTURE.md` §9 forecast: additive,
  concept-gated, physics-neutral — NOT a new renderer. Without it, `{derived}` labels render as literal
  `{…}`. (2) **`smooth_camera` zooms the WHOLE draw pass** — on a canvas already ~90% full it clips
  content off-screen (killed Bohr S2's top rungs); use it only with real slack, or omit.
- **~~Known renderer limit (GAP 2)~~ — CLOSED 2026-07-27, verify before trusting any claim here.**
  GAP 2 said: "the parametric renderer binds only TEXT (`label_expr`/`text_expr`) to live variables —
  `body`/`animated_path` POSITIONS are static per state, so a slider-driven explore state updates its
  numeric readouts live but the moving glyph does NOT re-jump on drag." **That is no longer true.**
  `position_expr` landed in commit `369e263` (`feat(parametric): position_expr — bind a body's
  position to live variables`) and is consumed at `parametric_renderer.ts:1185-1188` inside
  `drawBody`; `from_expr`/`to_expr` on arrows are likewise consumed now
  (`PM_resolveArrowPoint` at `:1780-1781`, `PM_safeEvalPoint` at `:2152-2163`), which also makes the
  `parametric_from_expr_to_expr_never_consumed` scar row STALE. **A slider-driven explore state CAN
  now move glyphs, not just numbers.**
  *How this was found, and the lesson:* the `law_of_conservation_of_mass` build (2026-07-27) designed
  its whole explore state around GAP 2 — architect, chemistry_author and json_author each inherited it
  from this file — and the limitation had been closed days earlier on a branch that had since merged.
  No defect resulted (the workarounds are valid), but S7 shipped weaker than the engine allowed. This
  is the SAME failure class as the archetype-`[LIVE]` scar at the top of this file: **a renderer
  claim in this document is a CLAIM, and it decays.** Re-verify against renderer code before you let
  one constrain a design — `git log -S "<symbol>" --oneline` takes ten seconds.
- **Serving:** the review-site path (`build_review_site.ts`) gained a `parametric` branch 2026-07-23
  (`buildParametricConfig` + `assembleParametricHtml`) — parametric concepts now render on the teacher
  surface (previously field_3d/particle_field only). THE EYE still needs a chemistry cache-seed
  (`simulation_cache`) before `visual:eyes`.
- **Serves:** Bohr model, atomic spectra, ionisation energy trends; later: activation-energy
  profiles (the "ladder" rotated into a reaction-coordinate hill).
- **Signature beats:** quantised-jump (no between-rung stops — the misconception counter), absorb
  vs emit contrast pair, level-spacing → line-spectrum link.

### M — Particulate box (2D kinetic view) **[LIVE]**
A closed 2D region of moving particles; the taught variable (T, P, V, concentration) changes and
the particle behavior responds (speed, collision frequency, density).
- **Renderer status (SHIPPED 2026-07-28):** `particle_field` `scenario_type: "gas_box"` — a true 2D
  hard-disc gas: Maxwell–Boltzmann velocities, momentum- and energy-conserving elastic collisions on
  a uniform-grid broad phase, bouncing walls with impulse tallying, a working piston that does real
  work, two-species diffusion behind a liftable barrier, activation-energy threshold. HUDs: pressure,
  thermometer, live speed histogram + 2D theory curve, collision counter, P·A/N·T.
  *(This entry still read `[NEEDS-SCENARIO]` a day after the scenario shipped — the file's own
  warning applies to itself. Schedule off `git log -S`, never off a tier label.)*
- **Reaction sub-capability (SHIPPED 2026-07-28):** `gas.reaction` makes the box a reacting mixture,
  A + B ⇌ AB. Forward is bimolecular (line-of-centres energy ≥ Ea); reverse is first-order Arrhenius.
  **Ea_rev is DERIVED (Ea_fwd + E_bond) and must never be authored** — that derivation is why heating
  an exothermic box shifts it back by itself instead of being scripted. Compression favours the
  product because 2 particles become 1, emergent from the same collision sweep. Authored keys:
  `reaction: { enabled, reactants: [idA, idB], product: idAB, activation_fwd_kT, bond_energy_kT,
  reverse_attempt_per_s, inject }`, with `bond_energy_kT > 0` = exothermic forward. The product
  species must exist in `species`; its mass and radius are FORCED to the conserving values at init.
  Per-state overrides live in `state.reaction`. Widget flags: `show_reaction_readout`,
  `show_concentration_graph`, `show_energy_ledger` (a check instrument — default off).
  **Gate: `npm run check:gas-reaction`** (13 headless conservation checks) after any edit to the gas path.
- **Serves:** states of matter, gas laws, diffusion, collision theory, rates, dynamic equilibrium,
  Le Chatelier. ⚠ syllabus-check states-of-matter topics against the rationalised 2023+ NCERT.
- **Signature beats:** heat-the-box (T slider → speed distribution), crowd-the-box (V/concentration
  → collision count HUD), the count is REAL (Rule 33c — collisions/s readout, never vibes),
  both-arrows-live (forward and reverse rates equal while the composition line holds flat — the beat
  that makes "the reaction has stopped" impossible to keep believing).
- **Shipped on it:** `kinetic_particle_theory` (7 states, baseline-locked).
- **Authoring trap (scar, 2026-07-28):** single-letter slider ids are a SHARED NAMESPACE across every
  concept on this renderer — a Volume slider keyed `V` made a gas box print `V = 1.00 V / i = 59.71 A`.
  Prefer multi-character ids for anything new.

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

### P — Molecular 3D (orbitals / VSEPR / lattices) — **SPLIT 2026-07-28**
The 3D surface arrived as a `field_3d` **scenario**, not the separate `molecule_3d`/`orbital_3d`
renderer §5c imagined: `field_3d_renderer.ts` is already Three.js, so a new `scenario_type` was the
cheap path and no new renderer file exists. Two sub-tiers now:

- **P1 — electron-domain geometry [LIVE]** (`field_3d`, `scenario_type: "molecular_geometry"`, built
  2026-07-28, commit `b6a0259`). Central atom + bonded atoms + lone-pair lobes, where the arrangement
  is DERIVED from the domain count (2–6) rather than authored; lone pairs squeeze the bond angle in
  closed form; a live arc reads the angle as a real number, and a ligand-span readout gives it in
  picometres. Modes: `assemble` · `flat_vs_real` (the board sketch relaxes out of the page — the
  flat-Lewis misconception beat) · `domain_spread` (stepping through REAL molecules) · `lone_squeeze`
  · `shape_vs_geometry` (the domain cage vs the atoms that remain) · `expanded` (5- and 6-domain
  families) · `explore`. Molecule table: BeCl₂ · BF₃ · CH₄ · NH₃ · H₂O · PCl₅ · SF₆, every angle
  verified against its real value BEFORE any state was authored. Reference concept:
  `vsepr_molecular_shapes`. **Schedulable now** — hybridisation (#13) and σ/π (#17) should reuse it
  with zero new renderer code.
- **P2 — orbital lobes [LIVE 2026-07-28] · crystal lattices [NEEDS-SCENARIO]**. `field_3d`,
  `scenario_type: "orbital_shapes"` (commit `0ffb84c`, master `ed0d2a7`). s/p/d probability surfaces
  with a seeded measurement-dot swarm inside them, node planes, a camera-aligned cutaway exposing the
  2s radial node shell, and a probe plane reading live `|ψ|²`. Everything geometric is DERIVED from
  exact hydrogenic (Z=1) functions at build time — 1s r₉₀ = 141 pm · 2s 483 pm (node shell at
  2a₀ = 106 pm) · 2p tip 482 pm · 3d_xy 963 pm · E = −13.60/−3.40/−1.51 eV (agrees with the shipped
  `bohr_model_energy_levels`) — and the occupancy HUD MEASURES the enclosed fraction from the sample
  rather than asserting 90%. Modes: `orbit_dissolve` · `boundary` · `p_build` · `node_probe` ·
  `p_set` · `d_clover` · `radial_node` · `node_count` · `explore`. Eight solved cameras ship as
  per-mode defaults. Reference concept: `atomic_orbitals_s_p_d`. **Hybridisation (#13) and σ/π (#17)
  are now schedulable** — a lobe is `(angular factor in its OWN frame) × (frame list) × (scale)`, so
  #13 adds a frame list and lerps, and #17 needs only a per-lobe origin offset (one line).

  - **HYBRIDS ARE LIVE (2026-07-29, #13).** `kind: "hybrid"` on the same scenario:
    sp / sp² / sp³ as DERIVED geometry from `psi_h = -c_s psi_2s + c_p psi_2p`.
    Three things the next builder should not have to rediscover:
    (a) **a hybrid is NOT separable** — R20 != R21, so the `osRhoOuter(lev/A)` shortcut
    every s/p/d path uses does not apply; the replacement is a 1-D root table over
    `c = cos(angle from the lobe axis)`, built once.
    (b) **the leading minus is load-bearing** — R20 is negative for rho > 2, so `+c_s`
    puts 82.5% of an sp³ electron BEHIND the atom. It renders perfectly and every
    gate passes. Settle it by HEMISPHERE PROBABILITY, never by a tip radius (the back
    tip is genuinely longer either way).
    (c) **four full sp³ surfaces are not a picture of four hybrids** — the back lobes
    sit exactly in the gaps between the fronts, so the union fills space near-spherically.
    Multi-lobe states author `enclosure: 0.5` AND `front_only`, and the state that
    reveals the back lobe turns `front_only` off, so the omission is declared rather
    than hidden. A countability metric that counts only front lobes will under-call this.
    Reference concept: `hybridisation_sp_sp2_sp3`. **#17 sigma/pi is next and is one
    line** (a per-lobe origin offset); crystal lattices remain [NEEDS-SCENARIO].

  - **HYBRID AUTHORING LESSONS (2026-07-29 review round, 10 defects behind a 35/35 EYE):**
    (d) **An archetype is a claim about RHYTHM, not a label.** Two states animating the same
    element count deliver the SAME motion unless their per-element timing differs — use
    `bloom_offsets_ms`, and verify by diffing dense frames of the two states, not by reading
    the archetype names.
    (e) **A Rule-16a contrast beat is SEQUENTIAL, never superimposed.** A ghost set shown
    alongside the real one fuses with it (ghost lobes land in the gaps between the real ones,
    the same geometry that forces `front_only`). Deleting the ghost to fix that trades a
    legibility defect for a pedagogy one. Use `ghost_fade_at_ms`: the wrong picture leads
    alone, then dissolves as the real one assembles.
    (f) **`scene_composition` annotations do not reach the renderer** unless the concept sets
    `render_annotations: true` — they live in `epic_l_path` and the renderer is handed
    `field_3d_config`. Authoring them without the flag satisfies Rule 19 with content that
    cannot exist on screen. When they DO paint, give each `at_ms`/`until_ms` so no label
    precedes or outlives what it names.
    (g) The authored `orbital` base MUST equal `populate_steps[0]`, or the base paints and then
    vanishes when step 0 fires.
  **Still [NEEDS-SCENARIO]: crystal lattices / unit cells** (a repeating cell is not built), so
  solid state (#19) stays blocked. SN1/SN2 (#14) and stereochemistry (#15) still sit between the
  tiers: the molecule scaffold exists, the bond-breaking / inversion MOTION layer does not.
  - **The one authoring trap this surface has** (found by reading pixels, not by a gate): the TRUE
    90% boundary of a 2p orbital is plump — 482 × 334 pm, L/W 1.44 — not the slim textbook dumbbell.
    One reads fine; **three of them fuse into a featureless ball and stop being countable.** That is
    occlusion, not framing, so no camera solve fixes it (the global optimum was already found). Author
    such a state at `enclosure: 0.5` with `show_dots: false` — the lower contour is derived from the
    same functions and the HUD prints what is actually enclosed, so nothing is faked. Never recover
    countability by shrinking or displacing lobes: that lies about size (Rule 29).

> This split is the Session-C4 lesson applied to my own build: a tier is a CLAIM about renderer
> readiness for the SPECIFIC motion a concept needs. "Molecular 3D" was one label covering at least
> three separate engine builds, and only the first of them is done.

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

**P2 orbital-lobe choreographies** (coined by `atomic_orbitals_s_p_d`, the first concept on
`orbital_shapes`; cue names in brackets are the `SET_CUE_TIME` keys):

| Name | What moves | Cue |
|---|---|---|
| **measure-stipple** | a running trajectory is replaced by accumulating measurement flashes; the density emerges FROM the measurements | `dissolve`, `stipple` |
| **reveal-build** | the boundary surface grows over an existing swarm while the camera makes one slow orbit | `surface` |
| **axis-extrude** | a boundary surface grows outward from the nucleus along one declared axis | `extrude` |
| **sweep-probe** | a probe plane traverses the object while a live readout tracks it — the readout hitting exactly 0 IS the lesson | `probe` |
| **axis-populate** | one identical shape is stamped onto each of three perpendicular axes in turn | `populate_<i>` |
| **between-axes-bloom** | lobes grow in the DIAGONAL gaps while axis-aligned ghosts hold pose (the delta is *where*) | `bloom`, `ghost` |
| **cutaway-reveal** | a clipping plane sweeps through a grown cloud, exposing interior structure invisible from outside | `grow`, `cutaway` |
| **cycle-compare** | a gallery swaps through orbitals while a counter ticks | `gallery_<i>` |

**Two timing rules this surface taught, both general:**
1. **A cause-lead must be clamped to the event spacing.** A fixed "flash precedes its dot by 500 ms"
   (Rule 32a) with events 90 ms apart kept five flashes permanently in the air, and the beat read as
   a swarm of planets. `lead = min(authored_lead, event_period)` — **Rule 32a is about ORDER, not a
   constant.**
2. **Continuous motion does not satisfy the Rule-31a choreography ratio.** `spin_rate` and
   `ghost_at_ms` do NOT count (verified in `deriveStateMeta`); only discrete cues do. A state carried
   by spin alone will WARN however long it spins.

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
