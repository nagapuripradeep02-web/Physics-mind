# Architect skeleton — `atomic_orbitals_s_p_d`

**NCERT Class 11 Chemistry, Ch.2 "Structure of Atom", §2.6 (quantum mechanical model — orbitals and
their shapes).** Renderer: `field_3d`, **`scenario_type: "orbital_shapes"` — DOES NOT EXIST YET**;
this skeleton includes its buildable spec (§E), founder-authorised 2026-07-28 (PROGRESS_CHEMISTRY §D).
Roadmap position: C5 §6 **P4 #16**, deliberately ahead of #13 hybridisation and #17 σ/π (curriculum
order + it de-risks both — they consume the same lobes).

**Concept id `atomic_orbitals_s_p_d` CONFIRMED** — fleet-unique (no hit in `src/data/concepts/` or
`src/data/concepts/chemistry/`), snake_case, self-describing.

**NCERT scope check (rationalised syllabus):** Ch.2 Structure of Atom survived the 2023+
rationalisation intact — the pruning removed whole units elsewhere (States of Matter, Solid State,
Hydrogen, s/p-block, Environmental); §2.6's quantum-mechanical model, quantum numbers, and "Shapes of
Atomic Orbitals" (s, p, and d boundary surfaces, radial + angular nodes) are all in the CURRENT
chapter index. In scope, author-verifiable for CBSE/NCERT. *"Consulted NCERT Chemistry chapter index
to confirm scope. No teaching method, no example problem, no figure imported."* NCERT Exemplar Ch.2
consulted for misconception BELIEFS only (orbit-vs-orbital confusions are its recurring item class).

---

## §1 — Tier + the whiteboard test (C5 §7.3 — before any state design)

**Tier: 💎 diamond.**

Capabilities (C5 §2):
- **3 — hold 3D spatial structure: ✅✅ the entire concept.** A board cannot draw a p_z dumbbell that
  is actually three-dimensional, cannot show three mutually perpendicular dumbbells occupying the
  same atom, and structurally cannot show a *spherical node shell hidden inside* the 2s cloud — that
  one needs a cutaway of a 3D object.
- **4 — make a counterintuitive result believable: ✅.** "The electron has no path" is asserted in
  every textbook and believed by almost no one — the Bohr picture the student just learned (our own
  shipped `bohr_model_energy_levels` included) actively re-plants it. Only *watching* thousands of
  position measurements refuse to land on the orbit changes the belief. The node — zero probability
  between two occupied lobes — is the same class, harder.
- 1 — show the invisible at scale: ✅ supporting (a probability density is invisible by definition;
  the dot swarm is the only honest rendering of it).

No state survives on a whiteboard: every beat is a claim about a 3D probability density.
**Dependability (C5 §5):** high by design — every motion in §E is a closed-form function of
state-local t (no integrator), the orbital library is precomputed from exact hydrogenic functions,
and the teacher drives it with a picker and three sliders.

## §2 — Atomic claim

**This concept teaches that an orbital is a 3D region of probability (|ψ|²) with a definite shape —
s sphere, p dumbbell, d cloverleaf — and only that.** It does NOT cover: the quantum-number system as
bookkeeping (n/l/m assignment — deferred to `quantum_numbers`), orbital filling (Aufbau/Hund/Pauli —
deferred to `electron_configuration`), hybridisation (`hybridisation_sp_sp2_sp3`, #13), orbital
overlap/bonding (`sigma_pi_bonding`, #17), or the radial-distribution-function graph (deferred to a
hydrogen-atom successor; see §10 38e note).

## §3 — Per-state control table (Rule 31 — the FIRST design artifact)

**State count: 9 — complex (7–9 band).** Justified: one representational revolution (path → density,
2 states) + three shape families (3 states) + two node types (2 states) + one quantitative rule
(1 state) + explore. Nothing here is scaffolding; every row is a distinct spatial claim.

| # | State id | Ring | Teaches (ONE idea) | Motion archetype | Delta cue (≤5 words) | Controls | EN words | Advance |
|---|---|---|---|---|---|---|---|---|
| 1 | `the_orbit_dissolves` | core | the electron has no path — measurements build a cloud instead | **measure-stipple** † (contrast beat, Rule 16a) | "No path — a cloud" | — | ~50 | manual_click |
| 2 | `the_90_percent_boundary` | core | the orbital = the region holding ~90% of the finds; density is the whole truth | **reveal-build** (surface grows over the swarm; camera makes one slow full orbit) | "The boundary is the orbital" | `dots` | ~50 | manual_click |
| 3 | `the_p_dumbbell` | core | the second shape family: two lobes along one axis | **axis-extrude** † | "Two lobes, one axis" | — | ~40 | auto_after_tts |
| 4 | `the_node` | core | a plane of exactly zero probability separates the lobes | **sweep-probe** † | "Zero. Exactly zero." | `probe` | ~55 | manual_click |
| 5 | `three_perpendicular_twins` | core | 2pₓ, 2p_y, 2p_z — same shape, three perpendicular axes, same energy | **axis-populate** † | "Three axes, one energy" | — | ~50 | auto_after_tts |
| 6 | `the_d_cloverleaf` | extended | the third family: four lobes BETWEEN the axes, two node planes | **between-axes-bloom** † | "Lobes between the axes" | — | ~45 | manual_click |
| 7 | `bigger_shell_hidden_node` | extended | 2s = same sphere, larger, with a spherical node shell inside; n survives as size/energy | **cutaway-reveal** † | "Same shape, hollow shell" | — | ~50 | manual_click |
| 8 | `counting_nodes` | advanced | nodes are countable: angular = l, radial = n − l − 1 | **cycle-compare** (gallery 1s → 2s → 2p → 3d, node counter ticking) | "Count the nodes" | — | ~45 | auto_after_tts |
| 9 | `explore` | core | sandbox | **drag-sandbox** | "All yours" | `orbital` picker · `dots` · `spin` · `probe` | 0/open | interaction_complete |

† **Coined archetypes (one-line justifications, per the coin-only-with-justification rule — archetype
P2 has no canonised choreography vocabulary yet; the first shipped concept canonises these into
`patterns/chemistry.md` §3):**
- **measure-stipple** — a running trajectory is replaced by accumulating position-measurement flashes;
  the density emerges FROM the measurements (the misconception's consequence, then the real physics).
- **axis-extrude** — a boundary surface grows outward from the nucleus along one declared axis.
- **sweep-probe** — a probe plane traverses the object while a live numeric readout tracks it
  (cousin of physics `oscillate/track`; the readout hitting exactly 0 IS the lesson).
- **axis-populate** — one identical shape is stamped onto each of three perpendicular axes in turn.
- **between-axes-bloom** — lobes grow in the DIAGONAL gaps while the axis-aligned ghosts hold pose
  (the delta is *where*, which no other archetype expresses).
- **cutaway-reveal** — a clipping plane sweeps through a grown cloud, exposing interior structure
  that is invisible from outside (the capability-3 beat a board cannot even approximate).

**No archetype repeats.** Nine states, nine distinct archetypes; `drag-sandbox` explore-only.
**advance_mode:** 3 distinct values (Gate 12 ✓). **teaching_method:** all guided states are
straightforward motion beats (no field / omit); S9 = `exploration_sliders`; S1's contrast framing is
Rule-16a choreography, not Socratic.

**Rule 32 legibility plan (per state):**
- 32a cause-first: S1 measurement flashes precede the cloud (each dot lands ~0.5 s after its flash);
  S4 the probe moves, the readout responds a beat later; S7 the cloud grows FIRST, the cutaway sweeps
  ~1 s after growth completes.
- 32b one-variable: nucleus + axes triad hold pose in every state; only the declared shape/probe/
  clip-plane moves. The slow spin is OFF during any morph/extrude beat (VSEPR precedent), ON at
  constant rate only in S5/S6/S8 where the beat is a populate/bloom/swap.
- 32c: the delta column above IS the on-canvas caption (Rule 34a).
- 32d home pose: ONE apparatus for all nine states — nucleus at origin, axes triad, dot swarm +
  boundary surface as the two persistent representations. No teleport; camera moves only to frame
  the new thing, and every camera is SOLVED (§E-9).
- 32e: exactly one glow focal per instant, from the CLOSED key enum (§E-8).

## §4 — Misconception confrontation plan (Rule 16a — 3 genuine pivots, not a per-state tic)

| State | Wrong belief (source: NCERT Exemplar belief class + the shipped Bohr concept itself) | Visual counter (contrast beat, no predict-pause) |
|---|---|---|
| S1 | "The electron travels a circular path around the nucleus" — planted by `bohr_model_energy_levels` and by the atom icon on science branding worldwide | the believed orbit RUNS for ~4 s; then measurement flashes land — scattered, never on the ring; the ring fades while the cloud it never predicted builds |
| S4 | "The electron is a little ball that moves through the space — so it must cross the middle to get from lobe to lobe" | the probe reads \|ψ\|² = 0.00 at the plane while dots visibly populate BOTH lobes; narration answers the honest question head-on: the question assumes the path picture S1 already dissolved — a standing wave has no journey between its crests |
| S5 | "The three 2p orbitals are stacked or nested inside each other" — planted by textbook figures that draw them in three separate panels | all three drawn on ONE shared axes triad, appearing one axis at a time, energies read equal |

**Flag-at-planting duty (Pass-1 mapping, Block 1):** the dot representation itself risks planting
"the electron was definitely at each dot." S2's narration defuses it at the planting moment: each dot
is one measurement's ANSWER; the stable truth is the density, and the `dots` slider proves it — 100
dots look like noise, 5000 look like the same smooth cloud every time.

## §5 — `has_prebuilt_deep_dive` states (cache hints, not gates)

- **S1** — the representational break; the historically stickiest moment in Ch.2.
- **S4** — the node; the honest hard edge ("how does it cross?") generates the most typed confusion.
- **S8** — node counting; the exam workhorse (every JEE/NEET Ch.2 paper has a node-count item).

## §6 — Drill-down cluster candidates

- S1: `orbit_vs_orbital` · `where_is_the_electron_really` · `is_the_cloud_the_electron_smeared`
- S4: `node_zero_probability` · `how_electron_crosses_node` · `standing_wave_picture`
- S8: `radial_vs_angular_nodes` · `node_count_formula` · `why_2s_has_a_node_but_2p_plane`

## §7 — `entry_state_map`

```
foundational:   STATE_1 → STATE_5   # what an orbital is; s and p shapes; the node
d_orbitals:     STATE_6             # d cloverleaf
size_and_nodes: STATE_7 → STATE_8   # n as size; counting nodes
```
Default aspect `foundational`; PRIMARY aha (S1) is inside it ✓. Cross-slice pills invite S6–S8 after
the foundational slice. (No chemistry serving path yet — authored for forward-compat, per house
convention.)

## §8 — Prerequisites (advisory, Rule 23)

`bohr_model_energy_levels` (shipped, gold-standard) — supplies the energy ladder and n. This concept
deliberately CORRECTS its orbit picture while PRESERVING its energy result (S7's formula surface,
E ∝ −1/n², is the continuity handshake). No other prerequisite.

## §9 — Real-world anchor (Rule 35 universal; 38f widest-overlap)

**Primary:** the atom icon — a nucleus with electrons on crossing ellipses — appears on science logos,
apps, and classroom posters everywhere on Earth, and it is wrong. In 2013 physicists photographed a
hydrogen atom's actual electron cloud with a quantum microscope: the photograph shows these lobes and
shells, not orbits. The student is about to see what the photograph sees. Universal (no place, brand,
festival, currency), age-appropriate, physics-true at every depth.
**Secondary:** orbital shapes are why molecules have shapes at all — water bends at 104.5°
(`vsepr_molecular_shapes`, shipped) because oxygen's orbitals point in specific directions. Shape at
the atom's scale becomes shape at the molecule's scale, which becomes everything chemistry does.

## §E — ENGINE REQUIREMENTS (P2 orbital-lobe scenario — the buildable contract)

> **Owner: `peter_parker:renderer_primitives`. Rule 40: lands on master separately, before the
> concept branch merges.** New `scenario_type: "orbital_shapes"` on `field_3d_renderer.ts` (the C6 §1
> lesson: a new CASE, not a new file — inherits camera, clock, glow, widgets, clean-mode, freeze-pin,
> EYE integration). Rule 40a pre-check already run 2026-07-28: `orbital_shapes` / `p_orbital` /
> `orbital_lobe` / `MG_ORBITAL` etc. — zero hits across all history; nothing exists to reuse except
> the fleet patterns named below. Forward-compat REQUIREMENT: #13 hybridisation will morph these
> lobes and #17 σ/π will overlap two atoms' worth — build the lobe as a parameterised mesh keyed by
> (orbital id, orientation, scale), not as baked per-orbital geometry.

**E-1. Orbital library `OS_ORBITALS`** — exact hydrogenic shapes, DERIVED not authored (the
`mgIdealDirs`/`mgSqueeze` discipline: verify every number numerically BEFORE any state is authored):
`1s` (boundary sphere, r₉₀ ≈ 141 pm), `2s` (sphere, r₉₀ ≈ 490 pm scaled to frame; radial node shell
at r = 2a₀ ≈ 106 pm), `2p_x` / `2p_y` / `2p_z` (two-lobe boundary surface from the |Y₁|² angular
factor — a surface of revolution about the lobe axis, oriented per axis; one nodal PLANE through the
nucleus), `3d_xy` (four congruent lobes in the xy diagonals — one lobe mesh instanced at 4 rotations;
two nodal planes: xz and yz). Each entry carries: mesh builder, axis/orientation, r₉₀ (real pm),
node spec (plane(s) | shell radius), display label, n, l, E_n (−13.6/n² eV — must agree with the
shipped Bohr concept). Store real pm values; render scaled by ONE declared frame constant.

**E-2. Probability dot sampler (the load-bearing piece).** A SEEDED, precomputed sample table per
orbital (inverse-CDF over the real radial density × angular density), so dot i's position is a pure
lookup and dot count is a pure function of state-local t (`count = clamp((t − stipple_at_ms) /
per_dot_ms, 0, target)`). **NO per-frame RNG, no accumulator** — THE EYE's freeze pin must reproduce
byte-identical stipple (the gas_box scar: this scenario must be registered in the freeze/snap set at
BOTH stepping call sites — the `:47182` snap list AND wherever stepping dispatches; one `stepFor`-style
dispatcher, never two branches). `dots` slider sets target count 100–5000; instanced points/sprites
(5000 must hold 60 fps).

**E-3. Bohr-orbit prop (S1 only).** A circular orbit ring + electron bead at closed-form angle ωt;
`dissolve_at_ms` starts measurement flashes (brief flash sprite at sampled position, dot lands ~500 ms
after its flash — Rule 32a) and ramps ring+bead opacity → 0 over `dissolve_duration_ms`.

**E-4. Boundary surface + occupancy HUD.** Translucent surface mesh per orbital with an opacity ramp
cue `surface_at_ms`; HUD line `inside boundary: NN%` COMPUTED from the actual dot sample (a real
number, Rule 33c — it should land ~90%, and it must be measured, not asserted).

**E-5. Node visuals.** (a) node PLANE: translucent disc through the nucleus, edge-highlighted,
`show_node_plane`; (b) node SHELL (2s): rendered via **camera-aligned clipping plane** (Three.js
`clippingPlanes`) with sweep cue `cutaway_at_ms`/`cutaway_duration_ms` — the clip face must show the
empty shell as a visible dark gap in the dot density (require: shell gap ≥ ~12 px at the shipped
camera); (c) node-counter HUD `nodes: 1 radial · 0 angular` for S8's gallery.

**E-6. Probe instrument (S4/S9).** A plane perpendicular to the active lobe axis at s ∈ [−r, +r];
slider `probe` (id is MULTI-LETTER — the gas_box single-letter-namespace scar bans `V`-class ids);
auto-sweep cue `probe_auto: {from, to, at_ms, duration_ms}` hands off to the slider afterwards
(drag-seize pattern). Readouts (Rule 33d, live numbers): `|ψ|² = 0.00 … 1.00` (normalised to max) +
`dots in slice: N` (counted from the sample). At the node BOTH must read exactly 0.

**E-7. Labels.** Orbital labels need SUBSCRIPTS Unicode cannot supply (no subscript y/z exists):
label sprites MUST support a two-run draw — main run + smaller baseline-dropped axis run ("2p" + "z")
— and MUST be auto-width (`pmCreateAutoLabel` class; the C6 clipped-sprite scar: a canvas measured
once from a seed string clips live text). Axes triad x/y/z with per-axis colors matching the three
p-orbital tints.

**E-8. Per-state config shape** (mirrors `molecular_geometry`'s authoring surface):
```
state.orbital_shapes = {
  mode: 'orbit_dissolve'|'boundary'|'p_build'|'node_probe'|'p_set'|
        'd_clover'|'radial_node'|'node_count'|'explore',
  orbital: '1s'|'2s'|'2p_x'|'2p_y'|'2p_z'|'3d_xy',
  spin_start_ms, spin_rate,                    // rad/s about +y; 0 = hold
  orbit_ms, dissolve_at_ms, dissolve_duration_ms,      // S1
  stipple_at_ms, per_dot_ms, dot_target,
  surface_at_ms,                                        // S2
  extrude_at_ms, extrude_duration_ms,                   // S3 (lobe growth along axis)
  probe_auto: {from,to,at_ms,duration_ms},              // S4
  populate_steps: [{at_ms, orbital}],                   // S5
  bloom_at_ms, ghost_at_ms,                             // S6 (p-pair → ghost, clover blooms)
  grow_at_ms, cutaway_at_ms, cutaway_duration_ms,       // S7
  gallery_steps: [{at_ms, orbital}],                    // S8
  show_axes, show_surface, show_dots, show_node_plane, show_probe, show_hud, show_formula,
  hud_lines: ['occupancy','psi2','slice_dots','energy','nodes'],
  formula,                                     // ONE Cambria-Math surface (Rule 34b)
  camera: {az, el},                            // SOLVED values (E-9), never eyeballed
  controls: ['orbital','dots','spin','probe'], // Rule 31 rows shown per state
}
```
**Glow-key enum CLOSED** (VSEPR scar #33 pattern): `orbit | dots | surface | node_plane | node_shell |
probe | axes | lobe_set`. **`config.field_lines.opacity` must exist** (the fleet blank-scene trap).
**`deriveStateMeta` registered in the SAME change** (standing scar rule). No emphasis bulge (Rule 29):
the ONLY size changes are real magnitudes — 2s larger than 1s, lobe extrusion during growth.

**E-9. Camera contract — SOLVED, not eyeballed (C6 §4, both failure modes designed out):**
- **Countability:** every element the caption counts must be countable in the projection, measured
  PAIRWISE (the C6 addendum flaw: per-element foreshortening alone is insufficient). S5 is the hard
  case: solve az×el such that all SIX lobe tips have pairwise screen separation > 0, each axis
  projects at ≥34% of its length, and no axis lies within ~15° of the view axis. S3/S4: the active
  lobe axis lies within ~10° of the screen plane (both lobes AND the gap visible). S6: view within
  ~25° of +z so the clover reads as four separate lobes; both node planes drawn as edge lines. S7:
  cutaway plane faces the camera.
- **Projected angle ≠ angle:** S5's thesis is mutual perpendicularity. Do NOT stage a measured
  on-screen angle claim; perpendicularity is carried by the axes triad + a DERIVED readout
  (`90.0° apart — derived`), and the solver must keep pairwise projected inter-axis angles ≥45° so
  the picture does not contradict the claim.
- Deliverable: a scratch solver run (the VSEPR precedent) with achieved numbers recorded in the
  concept's DoD before baselines.

**E-10. Determinism + gates:** every beat closed-form in state-local t → joins the accumulator-free
snap-to-pin set; `npm run check:renderer-syntax` on every renderer edit; THE EYE frames stepped by
THE SAME dispatcher the freeze path uses (the gas_box lesson, verbatim).

## §10 — Curriculum-flex block (Rule 38)

**Rings:** core = S1–S5 + S9 · extended = S6–S7 (contiguous) · advanced = S8 (contiguous, immediately
before explore). Order is qualitative → quantitative ✓.
**Cut check 1 (hide advanced):** S1–S7 + S9 — no surviving state references node COUNTING or l. ✓
**Cut check 2 (hide advanced + extended):** S1–S5 + S9 — no surviving state references d, 2s, radial
nodes, or n-scaling; the explore picker (below) never offered them. ✓ Coherent lesson: cloud →
boundary → dumbbell → node → three p's → sandbox.
**38b explore = CORE only:** picker offers `1s · 2pₓ · 2p_y · 2p_z` ONLY (no 2s, no 3d — they live
inside the extended states that teach them; VSEPR precedent). Explore formula surface: none, or the
S2 core surface re-shown; no advanced symbols.
**38c notation ladder:** core/extended surfaces are symbol-labels and algebra only (`|ψ|²`, `E ∝
−1/n²`); no wavefunction mathematics anywhere (the Schrödinger equation is out of scope entirely).
Formula surfaces per state: S2 `|ψ|² = probability of finding the electron` · S4 `|ψ|² = 0 at the
node` · S5 `E(2pₓ) = E(2p_y) = E(2p_z)` · S7 `E ∝ −1/n²` · S8 `angular nodes = l · radial = n − l − 1`
· S1/S3/S6/S9 none.
**38d dialect:** "orbital" dual-labelled once against the retired word — "orbital (not an orbit)" in
S2, then bare. "Shell" used only in S7 with its NCERT meaning.
**38e graphs:** NO graph panel in this concept — the radial-probability curve (4πr²|ψ|²) is
deliberately deferred to a hydrogen-atom successor concept; the probe readout is the quantitative
surface. Recorded as a decided omission, so no axis convention arises.
**38g curriculum_tags (CLAIMS):**

| Curriculum | Claim | Verified? |
|---|---|---|
| CBSE/NCERT Cl.11 Ch.2 §2.6 | full concept incl. d shapes + node counting | ✅ author-verified (chapter index, rationalised edition) |
| JEE Main/Adv · NEET | full concept; node counting is a recurring item | `needs_teacher_verification` |
| Cambridge A-level (9701) | s/p (and d for transition chem) shapes in AS/A2 — full or no-advanced preset | `needs_teacher_verification` |
| IB DP | s/p shapes SL; d likely AHL — no-advanced preset candidate | `needs_teacher_verification` |
| AP Chemistry | orbital shapes touched lightly; quantum-number assignment excluded — light preset candidate | `needs_teacher_verification` |
| Cambridge IGCSE | orbitals NOT taught (shells only) — likely out of scope entirely | `needs_teacher_verification` |

**38h presets (hide, never reorder):** `full` (all 9) · `no_advanced` (hide S8) · `light` (hide
S6–S8). No preset teacher-visible until its board's teacher confirms.

## §11 — Registration (INVERTED vs physics — json_author read this)

**Site #1 ONLY:** `src/data/concepts/chemistry/atomic_orbitals_s_p_d.json`. Sites 2/3/4/7/8 are
FORBIDDEN for chemistry ids (Gate 8b all-or-nothing). Validation: `npm run validate:chemistry`,
NEVER `validate:concepts` (which must keep reporting 141/141 without seeing this file).

## §12 — Definition of Done (Gate 0 — zero TBDs, front-loaded)

**(a) States:** the 9 states of §3, exactly as tabled, in that order.
**(b) Symbol-label table:**

| Narrated quantity | On-canvas label |
|---|---|
| the orbital names | two-run subscript sprites: `1s`, `2s`, `2pₓ`, `2p_y`, `2p_z`, `3d_xy` (E-7) |
| probability density | `\|ψ\|²` (U+03C8 + U+00B2) — HUD value normalised 0.00–1.00 |
| boundary occupancy | HUD `inside boundary: 90%` (measured from the dot sample) |
| the node | `node` on the plane edge / `node shell` on the 2s gap; counter `nodes: 1 radial · 0 angular` |
| energy | HUD `E = −3.4 eV` (hydrogenic, agrees with Bohr concept); S5 adds `same energy ×3` |
| sizes | r₉₀ in real pm (`r₉₀ = 141 pm`), HUD value-only |
| axes | `x y z` triad, colored to match the three p tints |

**(c) Direction/rule plan (chemistry variant — no reaction, so no equation ledger; no RHR):** the
**chemical-validity ledger** = every shape and number DERIVED from exact hydrogenic functions and
verified numerically before authoring (E-1): boundary radii, node radii/planes, energies, occupancy
percentages. No rendered number the engine does not compute.
**(d) Motion plan:** the archetype column of §3 — nine states, nine distinct motions, none static;
spin OFF during morph/extrude beats, constant elsewhere (Rule 32b).
**(e) Modes:** `epic_l_path` only (Rule 20 [D]); renderer_pair field_3d/field_3d, no panel B.
**(f) Assessment/coverage_map/misconception_watch:** `misconception_watch` = exactly the 3 entries of
§4. `assessment` deliberately ABSENT this phase (Gates 19/20 dormant — house convention, all four
shipped chemistry concepts; revisit when students exist).
**(g) Macro↔micro (Rule 33): N/A, deliberately** — the orbital IS the taught object at its only
scale (VSEPR/Bohr precedent); the anchor carries the macro link. Instruments still show live numbers
(occupancy %, |ψ|², slice count, node counter) per 33c/33d.
**(h) Canvas budget (Rule 34):** per state ONE Cambria formula surface (§10 list), top caption = the
≤5-word delta cue only, HUD value-only at `top:52px;right:12px` (clears the Full-screen chrome),
sliders bottom-right, all math real Unicode, overlays in distinct corners, collision-checked.
**(i) Curriculum-flex:** §10 in full — both cuts checked coherent, explore core-only, tags as
claims, presets derived, graph decision recorded.
**(j) 3D projection check (the surface's own gate, VSEPR §7(i) precedent):** solved cameras with
recorded achieved numbers — pairwise screen separation > 0 for everything counted, S5 six-lobe
countability, node gaps ≥ ~12 px, no measured-angle claim staged where projection distorts it.
**(k) Representation triangle (chemistry.md §0):** particulate leads EVERY state; symbolic enters
only as labels after its picture has played (S2's |ψ|² surface appears after the cloud exists);
macro vertex lives in the anchor only — declared, not omitted.
**(l) Pipeline:** tsc 0 · `check:renderer-syntax` · `validate:chemistry` PASS (physics validator
never sees the file) · THE EYE (frames stepped by the shared dispatcher) + eye_walker frame-read ·
quality_auditor · every slider swept min→max→home via the product rail (not `applyState` in-iframe —
the gas_box methodology scar) · founder `visual:approve` · EN narration audio (2026-07-28 TTS
directive: every concept ships EN clips; ids state-scoped `s1_1…` from birth) · `text_hi` via the
Rule-30g Sonnet-5 sub-agent · Asmi professor review.

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** `bohr_model_energy_levels` → breaks at **S7** for a student who never met the
energy ladder: patch, one sentence — "n is the level number from the energy ladder — it survives; the
orbit does not." S1 does NOT depend on having studied Bohr formally: the orbit picture is culturally
pre-planted (the logo), so S1 names it "the familiar picture" rather than "as you learned."
**JEE-backwards trace.** *"How many radial and angular nodes does a 3p orbital have, and along which
plane is its probability zero?"* Pieces → states: orbital = probability region (S1–S2); p has one
nodal plane through the nucleus (S3–S4); the three p's are axis-labelled, so "which plane" is
answerable (S5); radial nodes exist and are interior shells (S7); angular = l, radial = n − l − 1 →
3p: 1 + 1 (S8). Complete. Full quantum-number bookkeeping (m values, orbital counts per subshell) is
declared out of scope (§2) — S8 introduces l in one line ("each shape family has a number: s 0, p 1,
d 2"), satisfying Rule 25 no-untaught-term.
**Misconception entry mapping.** §4 table + the flag-at-planting duty on the dot representation
(S2). No EPIC-C branches (EPIC-L-first).

## Block 2 — Aha-moment designation

- **PRIMARY aha — S1:** *the electron has no path; thousands of measurements refuse to land on the
  orbit and build a cloud instead.* The 10-year memory: the atom logo is wrong. Inside
  `foundational` ✓.
- **SUPPORTING aha — S4:** the node — a plane where the electron is NEVER found, with the electron
  on both sides of it. Reinforces the primary: if the ball-on-a-path picture had survived S1, S4
  kills it beyond recovery.
- **Cohesion:** S1 destroys the path, S2–S3 build the replacement language, S4 proves the
  replacement is not a soft metaphor, S5–S8 furnish the shape catalog exams draw from. One line.
- **Wrong-belief setup:** S1's belief is pre-planted (Bohr concept + the logo) — S1 opens by RUNNING
  it, which is the earned-confidence beat. S4's belief is planted by S3 itself (two confident lobes
  invite "it commutes between them") — one state of setup, immediately confronted.
- **Deep-dive cross-ref:** the §5 flags (S1, S4, S8) match the cliff/stuck analysis; S8 diverges
  from the cliff list deliberately — it is exam-stuck, not concept-stuck. Documented.

---

## §E-AS-BUILT — what the engine ACTUALLY shipped (2026-07-28, commit `0ffb84c`, on master `ed0d2a7`)

> **json_author: author against THIS section, not §E.** §E was the spec; the build found real
> constraints and drifted. Where the two disagree, this section wins.

**Verified on landing:** `check:renderer-syntax` OK · `tsc` 0 · `validate:chemistry` 4/4 ·
`validate:concepts` 141/141 · additive (4 existing lines edited, all shared chains, each re-emitted
with one added clause) · `orbital_shapes` registered in the snap-to-pin freeze set · **THE EYE re-run
on `vsepr_molecular_shapes` (the existing concept on this same surface): 44/44, H2 = 0.00% pixel
difference on all 14 approved baselines** — no regression, tested not assumed.

**Derived values live in the renderer** (exact hydrogenic Z=1; the only imported constants are 12
iso-density levels, each solved offline by bisection against the same functions):
1s r₉₀ = 141 pm · 2s 483 pm (radial node shell at 2a₀ = 106 pm, empty band 95.4–126.0 pm) ·
2p lobe tip 482 pm (half-angle 82.5°) · 3d_xy tip 963 pm · E = −13.60 / −3.40 / −1.51 eV (agrees with
`bohr_model_energy_levels`). Occupancy is MEASURED from the dot sample (0.89–0.91 observed), not asserted.

### Config-surface deltas vs §E-8 — all ADDITIVE, all must be authored knowingly
- **`camera: {az, el, dist}`** — `dist` is REQUIRED (§E-8 said `{az, el}`). A plain `camera_position`,
  if authored, wins and derives the cutaway normal.
- **`spin_axis: [x,y,z]`** — NEW, default `[0,1,0]`. **Load-bearing:** spinning the three-p set about
  +y swings it out of its solved camera within seconds. S5 must use `[1,1,1]` (the view axis — leaves
  every solved metric invariant); S6 must use `[0,0,1]` (keeps the clover face-on).
- **`enclosure: 0.9 | 0.7 | 0.5`** + **`surface_opacity`** — NEW, default 0.9. See the occlusion
  finding below.
- **`ghost_orbitals: [...]`** — NEW (defaults to `['2p_x','2p_y']` when `ghost_at_ms` is set);
  **`bloom_duration_ms`**, **`grow_duration_ms`** added for symmetry.
- **`show_*`**: `show_axes, show_surface, show_dots, show_node_plane, show_node_shell, show_probe,
  show_orbit, show_labels, show_hud, show_formula`. `show_node_shell` / `show_orbit` / `show_labels`
  are additions. **`show_surface: true` is REQUIRED for any lobe to draw** when the state authors no
  `surface_at_ms` — the blank-scene trap for this scenario.
- **`hud_lines`**: `occupancy | psi2 | slice_dots | energy | nodes | radius | label | dots`
  (`radius`, `label`, `dots` are additions; `radius` prints e.g. `lobe tip = 482 pm (90%)`).
- **`probe`** is authored/read as a FRACTION of the orbital's own tip radius (−1…1); the slider
  displays pm.
- **Cue names** for `SET_CUE_TIME`: `stipple, surface, extrude, bloom, ghost, grow, cutaway, probe,
  dissolve, populate_<i>, gallery_<i>`.
- Glow keys CLOSED, as specified: `orbit | dots | surface | node_plane | node_shell | probe | axes |
  lobe_set`. `config.field_lines.opacity` must exist (an object, even `{}`).

### Solved cameras baked in as per-mode defaults (`OS_CAMERAS`)
A state that authors no camera inherits a solved one. Achieved numbers at 1280×720 / fov 60:
`orbit_dissolve`+`boundary` 35/28/3.2 · `p_build`+`node_probe` 6/26/8.22 (lobe axis 4.5° off the
screen plane; tip-to-tip 365 px) · **`p_set` 45/35.26/8.22 — the (1,1,1) view: all three axes
foreshortened 0.816, 54.7° off the view axis, projected inter-axis angles exactly 120°, min pairwise
separation of the six tips 160.3 px (global optimum, swept at 1°)** · `d_clover` 98/15/14.54 (min
pairwise tip separation 274 px) · `radial_node` 35/26/7.2 (node band 13.3 px, over the 12 px floor) ·
`node_count` 90/18/13.33 · `explore` 45/35.26/8.0.

**⚠ Distances are solved for `enclosure: 0.9`.** A state using 0.5 must scale distance by ~0.64 or the
object under-fills the frame (observed in the build frames).

### ⚠ THE ONE PLACE THE SKELETON WAS WRONG — S5 must change
**The true 90% boundary of a 2p orbital is plump, not the textbook slim dumbbell:** 482 pm long ×
334 pm wide (L/W 1.44), pinching to a point only in the last ~6° before the nodal plane. For ONE
orbital that reads fine (S3/S4/S9 frames are unambiguous dumbbells). For **S5 it fails** — three 90%
shells plus three dot clouds fuse into a featureless ball and the six lobes stop being countable.

This is **occlusion, not framing** (C6 §4 failure mode 1 exactly), so no camera solve can fix it, and
the global-optimum camera above was already found. The fix is the `enclosure` lever: the 70% and 50%
contours are solved from the same functions and are genuinely slimmer (50% lobe = 308 × 177 pm), and
the HUD **measures and prints** what is actually enclosed, so nothing is faked.

**S5 MUST be authored:** `enclosure: 0.5` · `show_dots: false` · `surface_opacity: ~0.34` ·
`spin_axis: [1,1,1]` · camera dist ~5.3 (0.9-solve 8.22 × 0.64). That frame reads as six countable
coloured lobes.

**No setting was found where three DOT CLOUDS are simultaneously legible — the physics is against it
(a filled p subshell really is spherical).** Do not try to recover it by shrinking or displacing the
lobes: that would lie about size and violate Rule 29.

### Four defects the build found by reading pixels, all fixed
Recorded because each is a class, not a one-off: (1) the canonical lobe mesh evaluated its angular
factor in WORLD axes, so a 2p_z rendered as a sphere with bumps on the wrong axis — every deterministic
gate passed on it; (2) orbital name labels landed on top of axis letters; (3) five measurement flashes
were in the air at once and read as planets (a fixed 500 ms cause-lead outran the 90 ms event spacing —
**Rule 32a is about ORDER, not a constant**); (4) the node-shell label covered the very gap it names.
**4 scar-candidate rows drafted, NOT applied** — founder ruling needed before they go in
`engine_bug_queue`.

### Forward-compat (why #16 was sequenced first)
A lobe is `(angular factor in the lobe frame) × (lobe frame list) × (scale)`. **#13 hybridisation**
adds an `osLobeAngLocal` branch + a tetrahedral frame list; morphing is a lerp of frames + growth,
no new mesh machinery. **#17 σ/π** needs a per-lobe origin offset — currently the one thing hardcoded
to the nucleus (`osAimFrame` sets `position(0,0,0)`), a one-line parameterisation. Neither is forced
into a rewrite.

---

## Provenance + open items (architect dispatch, 2026-07-28)

- **`engine_bug_queue` SQL not run** in the architect dispatch (no DB access). Scar coverage was
  mitigated from the documented mirrors — the 20 gas_box rows (PROGRESS_CHEMISTRY 2026-07-28), the
  C6 findings, and the VSEPR scar candidates: freeze-path stepping dispatch, `field_lines.opacity`
  blank-scene trap, closed glow-key enum, auto-width label sprites, pairwise-separation camera solve,
  single-letter slider-id namespace, `deriveStateMeta` same-change. **quality_auditor must re-run the
  query at Gate 8 and diff against §E.**
- **NCERT scope** confirmed in scope (Ch.2 §2.6 shapes of s/p/d retained post-rationalisation, per
  chapter index). All non-CBSE curriculum cells are CLAIMS with `needs_teacher_verification`.
- **`assessment` absent** by house convention this phase (matches all four shipped chemistry
  concepts) — flagged, not forgotten.
- `docs/patterns/chemistry.md` archetype **P2 row flips to [LIVE]** when the `orbital_shapes`
  scenario ships, and §3 gains the six coined choreographies above.

---

## CHEMISTRY BLOCK — 2026-07-28 (`chemistry_author`)

> Authored against **§E-AS-BUILT**, not §E, per the skeleton's own override note. Renderer read
> directly (`field_3d_renderer.ts` `OS_ORBITALS`/`OS_CAMERAS`/`buildOrbitalShapes`/
> `applyOrbitalShapesState`/`updateOrbitalShapesFrame`, lines ~42869–44420) wherever the skeleton
> was ambiguous — the renderer is the source of truth per the task brief, and it resolved every
> ambiguity below. `validate-chemistry.ts` + `deriveStateMeta.ts` also read directly (see §3 note on
> the choreography-ratio gate — this mattered more than expected; see Deviation D5).

**Engine bug queue consultation:** no DB access in this worktree (no `psql`/Supabase MCP available
to this session). Per the spec's fallback, scar coverage was mirrored from the documented sources the
skeleton itself already cites (§ "Provenance + open items"): the freeze/snap dispatcher registration,
the closed glow-key enum, `field_lines.opacity` blank-scene trap, auto-width label sprites, pairwise
camera-separation solving, and the single-letter slider-id ban. All are already satisfied by the
AS-BUILT engine (multi-letter `os_*` slider ids throughout; glow keys used below are all inside the
closed enum `orbit|dots|surface|node_plane|node_shell|probe|axes|lobe_set`). **`quality_auditor` must
re-run the live SQL query at Gate 8** per the skeleton's own standing instruction — this consultation
is a mirror, not a substitute.

### 1. Rigor check — every asserted number independently re-derived, not accepted on the engine's word

Re-derived from the exact hydrogenic radial functions (`R_1s(ρ)=2e^{-ρ}`, `R_2s(ρ)=(1/2√2)(2-ρ)e^{-ρ/2}`,
`R_2p(ρ)=(1/2√6)ρe^{-ρ/2}`, `R_3d(ρ)=(4/81√30)ρ²e^{-ρ/3}`, ρ=r/a₀) by independent numerical
integration + bisection (Simpson's rule, 3000–4000-point grids), NOT by reading the renderer's output:

| Claim | AS-BUILT value | Independently computed | Verdict |
|---|---|---|---|
| 1s r₉₀ | 141 pm | 140.82 pm → 141 pm | ✅ match |
| 2s r₉₀ | 483 pm | 482.89 pm → 483 pm | ✅ match — **and this supersedes the ORIGINAL §E skeleton estimate of "≈490 pm"**, which was a preliminary approximation, not an error to carry forward |
| 2s radial node at 2a₀ | ≈106 pm | R₂ₛ(ρ=2) = 0 **exactly** (symbolic: 2−ρ=0 at ρ=2); 2×52.9177=105.8 pm→106 pm | ✅ exact |
| 2p lobe tip (90%) | 482 pm | 482.45 pm | ✅ match |
| 2p lobe half-angle (90%) | 82.5° | 82.54° | ✅ match |
| 2p lobe width (90%) | 334 pm, L/W 1.44 | max perpendicular half-width 333.98 pm; 482.45/333.98 = 1.44 | ✅ exact match, including the "plump, not slim" occlusion finding |
| 2p lobe tip/width (50%, the S5 enclosure) | 308 × 177 pm | 308.24 × 177.34 pm (L/W 1.74 — genuinely slimmer than 90%'s 1.44, confirming the fix works) | ✅ match |
| 3d_xy lobe tip (90%) | 963 pm | 963.42 pm | ✅ match |
| Node-count rule (angular = l, radial = n−l−1) | 1s(0,0)·2s(0,1)·2p(1,0)·3d(2,0) | recomputed from n,l for all four: identical | ✅ matches the standard NCERT rule exactly |
| E_n = −13.6/n² eV | −13.60 / −3.40 / −1.51 eV (n=1,2,3) | identical; matches `bohr_model_energy_levels` bit-for-bit | ✅ continuity confirmed |
| Degeneracy of 2pₓ/2p_y/2p_z | "same energy" (S5) | **TRUE for any atom** — a rotational-symmetry fact of the p subshell, not a one-electron accident. Safe to state generally. | ✅ no scoping needed |
| Degeneracy of 2s vs 2p | not asserted anywhere in this concept | **TRUE only for one-electron (hydrogenic) atoms** — an accident of the pure 1/r Coulomb potential; false for every real multi-electron atom (penetration/shielding orders s<p<d within a shell). **No state in this authoring makes this claim** (S5 only compares the three 2p's to each other; S7 only compares 1s to 2s, both l=0) — confirmed clean on inspection, but flagged explicitly per the task brief as a trap `json_author`/`quality_auditor` must not introduce later. |

**One genuine gap found (not a numeric error — a vocabulary gap between skeleton and shipped engine):**
skeleton §E-9 says S5's perpendicularity should carry "a DERIVED readout (`90.0° apart — derived`)" in
addition to the axes triad. **The shipped `hud_lines` vocabulary has no such key** — the only valid
values read by `updateOrbitalShapesFrame` are `occupancy|psi2|slice_dots|energy|nodes|radius|label|dots`
(verified by reading the `want[i]` dispatch directly, ~L44030-44242). There is no "angle" line for
`orbital_shapes` (unlike `molecular_geometry`'s arc+angle readout). **S5 must carry perpendicularity
by the axes-triad geometry + narration only — do not author a nonexistent `hud_line` key for it.**
Flagged for `quality_auditor`; this is a documentation/engine mismatch, not something to route back
to the architect (the skeleton's intent — "perpendicularity should read as a real fact, not just look
that way" — is still honored: the three real axes ARE exactly 90° apart by construction, so the plain
narration claim is true even without a live instrument printing it).

Sanity-check run (not eyeballed): `n = 4 g / 2 g·mol⁻¹` mole-style check doesn't apply here (no mass/
mole quantities in this concept — the analogous "plug defaults into every formula" check is the table
above, each row independently computed).

**Source check:** Consulted NCERT Chemistry Ch.2 chapter index to confirm §2.6 scope (already done at
skeleton stage). No teaching method, example problem, or figure imported for this chemistry-authoring
pass; the four hydrogenic functions above are derived directly from the Schrödinger equation's known
closed-form solutions, not copied from any textbook's worked example.

### 2. Quantity declarations

| Quantity | Unit | Min | Max | Default | Slider id | Notes |
|---|---|---|---|---|---|---|
| orbital | — | — | — | `1s` | `orbital` | picker; explore offers CORE-ring only: `1s · 2pₓ · 2p_y · 2p_z` (`OS_EXPLORE_ORBITALS`, Rule 38b) |
| measurements (dot count) | count | 100 | 5000 | 1200 (explore); per-state override via `dot_target` | `dots` | a MEASUREMENT count, not a particle count — see §5 constraint on scale |
| turn speed | rad/s | 0 | 0.6 | 0.16 (explore) | `spin` | presentation-only; OFF (0) in S1/S3/S4/S7 (morph/extrude/cutaway beats), constant ON in S2/S5/S6/S8 |
| probe position | fraction of tip radius | −1 | 1 | 0 | `probe` | **declared as a FRACTION** (raw DOM slider is −100…100, divided by 100 in `os_probe_slider`'s input handler) — **displayed to the teacher in pm** (`os_probe_val`, `Math.round(probeU * OS_PM_PER_UNIT)`) |
| enclosure | fraction | 0.5 | 0.9 | 0.9 | — (authored per-state, not teacher-facing) | only 3 solved contours exist: 50/70/90; S5 mandates 0.5 |
| a₀ (Bohr radius) | pm | — | — | 52.9177 | constant | `OS_A0` |
| frame scale | pm/world-unit | — | — | 200 | constant | `OS_PM_PER_UNIT` — ONE declared frame constant per E-1 |
| r₉₀ / lobe tip | pm | — | — | per-orbital, computed | HUD `radius` line | 1s 141 · 2s 483 · 2p 482(90%)/372(70%)/308(50%) · 3d_xy 963 |
| node-shell radius (2s) | pm | — | — | 106 (2a₀) | HUD (via `show_node_shell`) | radial node, computed as `shellRho(=2) × a₀` |
| E_n | eV | — | — | −13.60/−3.40/−1.51 (n=1/2/3) | HUD `energy` line | `E_n = −13.6/n²`, must agree with `bohr_model_energy_levels` |
| \|ψ\|² (normalised) | — (0–1) | 0 | 1 | computed live at probe position | HUD `psi2` line | normalised to the orbital's own peak density, `osPlaneMaxDensity` |
| dots in slice | count | 0 | — | computed live | HUD `slice_dots` line | dots inside a 2.2%-of-r₉₀ slab about the probe plane |
| occupancy | % | 0 | 100 | computed live | HUD `occupancy` line | measured from the actual dot sample at the active enclosure key — must read ≈89–91% at 90%, ≈69–71% at 70%, ≈49–51% at 50% |
| nodes (radial, angular) | count, count | 0 | — | per-orbital, computed | HUD `nodes` line | `n−l−1`, `l` |

**Scale-factor note (constraint callout, chemistry analogue of "particle counts are representative"):**
unlike `gas_box`, this concept's dot swarm needs **no** depicted:actual ratio disclosure. There is
exactly ONE electron in this hydrogen atom; each dot is one independent position MEASUREMENT of that
same electron over time, not a rendering of multiple particles at Avogadro scale. The HUD is honest by
construction (`measurements: N`, never `electrons: N`) — no scale-factor label is needed or should be
added.

**Unit-conversion note:** none needed — every quantity here is already in its natural teaching unit
(pm, eV, rad/s, count, fraction); there is no °C↔K or g↔mol bridge in this concept (contrast
`kinetic_particle_theory`/VSEPR, which do need one).

### 3. Per-state motion timeline (Rule 31/31a) — numbers verified against the ratio gate itself

`validate-chemistry.ts`'s `narrationChoreographyWarnings` computes `estSpeech = words/2.8 × 1000 ms`
and `choreo = max(choreoEndMs, deriveMaxRevealTimeMs[state])`, WARNing if `choreo < 0.70 × estSpeech`.
**Read `deriveStateMeta.ts`'s `orbital_shapes` branch directly (~L1835-1870) to confirm exactly which
cue fields count**: `stipple_at_ms + dot_target×per_dot_ms (+700)`, `dissolve_at_ms + dissolve_duration_ms
(+600)`, `surface_at_ms (+1100)`, `extrude_at_ms + extrude_duration_ms (+600)`, `bloom_at_ms +
bloom_duration_ms (+600)`, `grow_at_ms + grow_duration_ms (+600)`, `cutaway_at_ms + cutaway_duration_ms
(+700)`, `probe_auto.at_ms + probe_auto.duration_ms (+600)`, each `populate_steps`/`gallery_steps` entry
`at_ms (+900)`. **Two things do NOT count toward this gate, confirmed by reading the code**:
`spin_rate`/`spin_start_ms` (continuous spin is invisible to the derivation) and `ghost_at_ms` (present
in the renderer but absent from the candidates list). Every timing below was chosen so the counted cues
ALONE clear the 0.70 floor — this is the exact mistake flagged against `kinetic_particle_theory`
(spin/ambient motion ≠ counted choreography), not repeated here.

Word counts below are the EXACT `split(/\s+/)` count the validator uses (machine-counted, not
hand-counted) — see §4 for the sentences themselves.

| # | State | mode | orbital(s) | camera | dur(s) | words | estSpeech(ms) | choreo(ms), driving cue | ratio |
|---|---|---|---|---|---|---|---|---|---|
| 1 | the_orbit_dissolves | orbit_dissolve | 1s | default 35/28/3.2 | 20 | 48 | 17143 | 17700 (stipple) | 1.03 |
| 2 | the_90_percent_boundary | boundary | 1s | default 35/28/3.2 | 21 | 53 | 18929 | 15900 (stipple) | 0.84 |
| 3 | the_p_dumbbell | p_build | 2p_z | default 6/26/8.22 | 15 | 36 | 12857 | 13100 (extrude) | 1.02 |
| 4 | the_node | node_probe | 2p_z | default 6/26/8.22 | 22 | 55 | 19643 | 19900 (probe_auto) | 1.01 |
| 5 | three_perpendicular_twins | p_set | 2pₓ→+2p_y→+2p_z | **OVERRIDE 45/35.26/5.3** | 21 | 54 | 19286 | 15400 (last populate) | 0.80 |
| 6 | the_d_cloverleaf | d_clover | 3d_xy (+ghost 2pₓ,2p_y) | default 98/15/14.54 | 17 | 42 | 15000 | 11800 (bloom) | 0.79 |
| 7 | bigger_shell_hidden_node | radial_node | 2s | default 35/26/7.2 | 24 | 55 | 19643 | 22000 (cutaway) | 1.12 |
| 8 | counting_nodes | node_count | 1s→2s→2pₓ→3d_xy | default 90/18/13.33 | 19 | 48 | 17143 | 17900 (last gallery step) | 1.04 |
| 9 | explore | explore | 1s (picker: 1s/2pₓ/2p_y/2p_z) | default 45/35.26/8.0 | 0/open | — | exempt (`interaction_complete`) | — | — |

**Per-state `orbital_shapes` config (the literal fields `json_author` transcribes):**

**S1 `the_orbit_dissolves`** — `orbit_ms:2200`; `show_orbit:true`; `dissolve_at_ms:4200,
dissolve_duration_ms:5000`; `stipple_at_ms:4200, per_dot_ms:32, dot_target:400`; `show_dots:true,
show_surface:false, show_axes:true, show_labels:false` (axis labels not yet meaningful — introduced
at S3); `show_hud:true, hud_lines:["dots"]`; `formula:` none; `spin_rate:0`; `controls:[]`. Glow:
`orbit` (ms 0–4200) → `dots` (4200–end) — one focal at a time (Rule 32e). Cause-first (32a): the
believed orbit runs alone for its full 4.2 s before any contradicting measurement appears.

**S2 `the_90_percent_boundary`** — `surface_at_ms:800`; `stipple_at_ms:800, per_dot_ms:16,
dot_target:900` (re-stipples across the beat — this literally performs the skeleton's own point:
"100 dots look like noise, 5000 look like the same cloud," staged as the swarm visibly thickening
while narration says so); `show_dots:true, show_surface:true, show_axes:true`; `spin_axis:[0,1,0],
spin_start_ms:1800, spin_rate:0.33` (≈1 full turn over the remaining ~19.2 s); `show_hud:true,
hud_lines:["occupancy","dots"]`; `formula:"|ψ|² = probability of finding the electron"`;
`controls:["dots"]`. Glow: `surface` (build) → `dots` (once the dots-slider point is made). Dialect
38d dual-label ("orbital, not an orbit") carried in narration s2_1, not a canvas parenthetical (Rule
34a caption stays ≤5 words: `"The boundary is the orbital"`).

**S3 `the_p_dumbbell`** — `extrude_at_ms:500, extrude_duration_ms:12000`; `dot_target:600` (no
stipple fields set → near-instant fill, static context, not itself animating — Rule 32b: only the
extruding lobe moves); `show_dots:true, show_surface:true, show_axes:true, show_labels:true` (first
state the `2p_z` two-run subscript label appears); `show_hud:true, hud_lines:["radius","label"]`;
`formula:` none; `spin_rate:0` (morph beat — spin OFF per the skeleton's own rule); `controls:[]`.
Glow: `surface` throughout. **Judgment call flagged:** I chose `2p_z` as the S3/S4 orbital (any of the
three would work by symmetry under the solved `p_build`/`node_probe` camera — AS-BUILT does not pin a
specific axis) — `json_author`/`quality_auditor` should sanity-check this is the axis the actual
camera solve assumed if that record exists; if not, `2p_z` is a safe default (z is the canonical axis
the shared lobe geometry pool is built from, `lobeGeo.p[gk] = osLobeGeometry(OS_ORBITALS["2p_z"], …)`).

**S4 `the_node`** — `probe_auto:{from:-1, to:1, at_ms:800, duration_ms:18500}`; `show_probe:true,
show_node_plane:true` (static reference disc, visible from state start — it is the geometry, not a
"reveal," so showing it early doesn't spoil the discovery); `dot_target:700` (static); `show_surface:
true, show_axes:true, show_labels:true`; `show_hud:true, hud_lines:["psi2","slice_dots"]`;
`formula:"|ψ|² = 0 at the node"`; `spin_rate:0`; `controls:["probe"]`. Glow: `probe` (dominant,
tracks the moving instrument) → `node_plane` (as narration names the plane explicitly). The live
`psi2`/`slice_dots` readouts update every frame with the probe (an instrument tracking in real time,
Rule 33d) — no artificial lag needed for a continuously-tracking readout (Rule 32a's cause→effect gap
governs discrete events, not live instruments).

**S5 `three_perpendicular_twins` — THE MANDATED DEVIATION STATE.** `enclosure:0.5, show_dots:false,
surface_opacity:0.34, spin_axis:[1,1,1]`, `camera:{az:45, el:35.26, dist:5.3}` (all four exactly per
the task brief; `dist` = the AS-BUILT `p_set` solve 8.22 × 0.64 = 5.26, rounded 5.3, per the
"⚠ distances solved for 0.9" note). `populate_steps:[{at_ms:700,orbital:"2p_x"},
{at_ms:7000,orbital:"2p_y"},{at_ms:14500,orbital:"2p_z"}]` — deliberately slow/spaced (6.3–7.5 s
between reveals) so each axis registers individually before the next arrives; `spin_start_ms:15500,
spin_rate:0.10` (starts only after all three are present and settled — the discrete population is the
whole taught content; the gentle post-reveal spin about the view axis `[1,1,1]` is cosmetic 3D-sell,
confirmed by AS-BUILT to leave every solved metric — pairwise separation, foreshortening — invariant,
since it rotates the object around the camera's own line of sight rather than tumbling it out of
frame). `show_surface:true, show_axes:true, show_labels:true`; `show_hud:true,
hud_lines:["energy","radius"]` (the `radius` line prints `lobe tip = 308 pm (50%)` — this is the HUD
"measuring and printing the real enclosed fraction" the task brief requires; nothing is faked);
`formula:"E(2pₓ) = E(2p_y) = E(2p_z)"`; `controls:[]`. Glow: `lobe_set` throughout (the enum has no
per-axis glow key — the growing SET is the one focal object, which is a defensible single "thing"
being emphasized, not three). **No `angle` hud_line authored — see §1 gap.**

**S6 `the_d_cloverleaf`** — `ghost_at_ms:600` (default `ghost_orbitals:["2p_x","2p_y"]` — NOT
overridden); `bloom_at_ms:2200, bloom_duration_ms:9000`; `spin_axis:[0,0,1]` (MANDATED by AS-BUILT —
"keeps the clover face-on"), `spin_start_ms:0, spin_rate:0.08` (constant from state start — S6 is a
populate/bloom/swap-type state per the skeleton's own spin rule, unlike S3/S4/S7); `show_surface:true,
show_node_plane:true` (both xz and yz planes, static reference), `show_dots:false` (kept clean —
already taught the density-cloud idea in S1/S2, this state is purely a shape-family catalog entry),
`show_axes:true, show_labels:true`; `show_hud:true, hud_lines:["nodes","label"]`; `formula:` none;
`controls:[]`. Glow: `lobe_set` (bloom) → `node_plane` (as narration names the two planes). Note:
`ghost_at_ms` does NOT feed the choreography-ratio gate (§ above) — `bloom_at_ms`/`bloom_duration_ms`
alone were sized to clear 0.70 independent of the (real, but ungated) ghost cue.

**S7 `bigger_shell_hidden_node`** — `grow_at_ms:800, grow_duration_ms:6000`; `cutaway_at_ms:7800`
(exactly 1000 ms after growth completes at 6800 — matches the skeleton's explicit Rule 32a spec
verbatim: "the cutaway sweeps ~1 s after growth completes"), `cutaway_duration_ms:13500`;
`show_node_shell:true` (only actually renders once `cutF > 0.35`, i.e., partway through the cutaway
ramp, per the engine's own gate); `show_surface:true, show_dots:true, dot_target:1000` (static,
generous density so the shell gap reads clearly against the swarm), `show_axes:true, show_labels:true`;
`show_hud:true, hud_lines:["nodes","energy"]`; `formula:"E ∝ −1/n²"`; `spin_rate:0` (cutaway = morph
beat, OFF); `controls:[]`. Glow: `surface` (grow) → `node_shell` (cutaway/reveal). This is the
prerequisite-cliff patch state (Block 1) — s7_4 explicitly names "the level number n" surviving from
the energy ladder (Rule 30 pattern followed verbatim).

**S8 `counting_nodes`** — `gallery_steps:[{at_ms:600,orbital:"1s"},{at_ms:6000,orbital:"2s"},
{at_ms:11500,orbital:"2p_x"},{at_ms:17000,orbital:"3d_xy"}]`; `spin_start_ms:0, spin_rate:0.08`
(default `spin_axis:[0,1,0]` — populate/bloom/swap-type, spin ON, per skeleton rule); `show_surface:
true, show_dots:false` (clean gallery, matches S6's reasoning), `show_node_plane:true` (shows for the
p/d steps, gracefully absent for the s steps since `osNodePlaneNormals` returns `[]` for l=0),
`show_axes:true, show_labels:true`; `show_hud:true, hud_lines:["label","nodes","energy"]`;
`formula:"angular nodes = l · radial = n − l − 1"`; `controls:[]`. Glow: `surface` (whichever orbital
is currently on screen). **3p is never rendered** (not in `OS_ORBITALS` — only 1s/2s/2p/3d_xy exist) —
the JEE-backwards-trace 3p example (skeleton Block 1) is answered by APPLYING the general rule
demonstrated on these four concrete cases, not by literally showing 3p; this is consistent with the
skeleton's own out-of-scope declaration (full quantum-number bookkeeping deferred), confirmed clean.

**S9 `explore`** — `mode:"explore"`, orbital picker defaults `"1s"` (CORE-ring only,
`OS_EXPLORE_ORBITALS`); `dot_target` default 1200 (engine fallback, `SC.dots.default`); `spin_rate`
default 0.16, `spin_axis:[0,1,0]`; `probe` default 0; `show_dots:true, show_surface:true,
show_axes:true, show_labels:true, show_probe:true, show_node_plane:true`; `show_hud:true,
hud_lines:["label","occupancy","energy"]` (deliberately NOT `nodes`/`psi2` — kept to CORE-taught
numbers only, Rule 38b); `formula:"|ψ|² = probability of finding the electron"` (S2's core surface
re-shown, exactly per 38b's own suggestion); `controls:["orbital","dots","spin","probe"]`.
`duration:0`, `advance_mode:"interaction_complete"` — exempt from both the word-budget and
choreography-ratio gates by construction (Rule 31, `interaction_complete`).

### 4. Per-state narration plan (`text_en`, EN word counts machine-counted via `split(/\s+/)`)

**S1** (48 words) —
`s1_1`: "This is the picture everyone already carries: an electron circling the nucleus on a fixed
path, like a tiny planet."
`s1_2`: "Watch it run, then watch position measurements land, one by one, and never once on that ring."
`s1_3`: "Together, the measurements build a cloud, not a path at all."

**S2** (53 words) —
`s2_1`: "That cloud has a name: the orbital, not an orbit, a region."
`s2_2`: "Its boundary is the region holding ninety percent of every measurement; everything past it is
rare."
`s2_3`: "Turn it. The shape holds; only the view changes."
`s2_4`: "Add more measurements and the cloud only gets clearer; the density was always the whole
truth."

**S3** (36 words) —
`s3_1`: "A different shape now: the p orbital."
`s3_2`: "Two lobes grow outward from the nucleus along one axis, with nothing at the centre."
`s3_3`: "This is the shape behind every dumbbell drawing you have seen, now genuinely
three-dimensional."

**S4** (55 words) —
`s4_1`: "Sweep a plane through the gap between the lobes and watch the reading cross the middle."
`s4_2`: "There, the probability density reads exactly zero, and so does the count of measurements;
nothing is ever found on that plane."
`s4_3`: "Dots keep landing on both sides at once, because a standing wave has no journey between its
crests."

**S5** (54 words) —
`s5_1`: "Three p orbitals live on the same atom, one on each axis, drawn here at a smaller,
easier-to-count boundary."
`s5_2`: "Same shape, same size, each pointing along x, y, or z, and every pair sits at exactly ninety
degrees."
`s5_3`: "All three share the same energy, not stacked inside each other; three directions of one
idea."

**S6** (42 words) —
`s6_1`: "A third shape: four lobes, not two."
`s6_2`: "They do not sit on the axes at all; they grow in the gaps between x and y, while the
axis-aligned p orbitals fade to ghosts."
`s6_3`: "Two invisible planes now cut the shape, not one."

**S7** (55 words) —
`s7_1`: "The same s shape, one size up: 2s."
`s7_2`: "Watch it grow larger than 1s, then a clipping plane reveals what hides inside."
`s7_3`: "A whole empty shell sits inside; zero probability at one fixed radius, electron density on
both sides."
`s7_4`: "The level number n survives from the ladder you already met; only the orbit is gone."

**S8** (48 words) —
`s8_1`: "One simple rule counts every node."
`s8_2`: "The angular nodes equal the shape number l: s is zero, p is one, d is two."
`s8_3`: "The radial nodes equal the level number n, minus the shape number l, minus one; watch the
count tick through 1s, 2s, 2p, and 3d."

**S9** (open, 15 words, exempt) —
`s9_1`: "Now it's yours. Pick an orbital, sweep the probe, and turn it however you like."

Plain English throughout, no Hinglish. Rule 30 symbol-expansion applied where a bare letter appears
in speech (`n` → "the level number n", `l` → "the shape number l" — S8; on-canvas labels stay bare
symbols per Rule 24). No untaught term introduced early: "shell" is not used before S7 (38d); "node"
is introduced in S4 and reused, never a synonym invented mid-stream.

### 5. Chemical/physical validity constraints

```
"constraints": [
  "Every rendered radius, node position, and energy is COMPUTED from the exact hydrogenic R_nl(rho) and |Y_lm|^2 functions at build time (osBuildTables/osROutPm/osPlaneMaxDensity) — never a typed-in number.",
  "The occupancy HUD is MEASURED from the actual dot sample at the state's active enclosure key: ~90% at enclosure 0.9, ~70% at 0.7, ~50% at 0.5 (S5) — never a fixed 90% regardless of which contour is drawn.",
  "At the true nodal plane/shell, BOTH |psi|^2 and the dots-in-slice count read exactly 0 (S4 at s=0 on the 2p axis; S7's cutaway through the 2s shell at rho=2, r=2a0=106 pm) — any non-zero reading there is a defect, not a rounding artifact.",
  "Node counts satisfy angular = l, radial = n - l - 1 for every orbital shown: 1s(0,0), 2s(0,1), 2p(1,0), 3d_xy(2,0).",
  "E_n = -13.6/n^2 eV for every orbital, and the n=1/2/3 values (-13.60/-3.40/-1.51 eV) are bit-for-bit identical to bohr_model_energy_levels.",
  "Degeneracy scope: the three 2p orbitals are degenerate for ANY atom (rotational symmetry); 2s-vs-2p degeneracy is a ONE-ELECTRON (hydrogenic) accident only and is never asserted as a general atomic fact in this concept."
]
```

### 6. Drill-down cluster phrasings (5 per cluster, real student voice)

**`orbit_vs_orbital`**
1. "wait is an orbital just a fancy word for orbit or is it actually different"
2. "so there's no path, the electron just... appears in different spots?"
3. "if there's no orbit then what keeps the electron from falling into the nucleus"
4. "my teacher still draws circles around the nucleus, is that just wrong then"
5. "orbit sounds like moving, orbital sounds like a place, which one is it"

**`where_is_the_electron_really`**
1. "ok but where IS the electron right now, like actually"
2. "if we can't know where it is, does that mean it's everywhere at once"
3. "is the electron just vibrating really fast inside that cloud"
4. "so nobody has ever actually seen an electron move, we just guess from the dots?"
5. "does the electron know where it's allowed to be or is it random"

**`is_the_cloud_the_electron_smeared`**
1. "is the cloud like the electron got smeared out into a mist"
2. "wait is one electron actually spread across the whole cloud at the same time"
3. "is the fuzzy picture because there's actually many electrons or just the one blurred"
4. "if I could freeze time would the electron be a tiny dot somewhere in there"
5. "is the density cloud a real physical thing or just a probability map we drew"

**`node_zero_probability`**
1. "zero percent chance sounds impossible, how can a spot just have NOTHING ever"
2. "is the node like a wall the electron can't pass through"
3. "if the density is zero there, is there literally no electron stuff at that spot ever"
4. "how do we even know it's exactly zero and not just really really small"
5. "does the node move around or is it stuck in the same place forever"

**`how_electron_crosses_node`**
1. "if it can't be at the node, how does it get from one lobe to the other"
2. "does the electron teleport across the gap or something"
3. "so it's on both sides but never in between, that doesn't make sense to me"
4. "is there like a tunnel underneath the node it sneaks through"
5. "wait does this mean the electron is basically two electrons, one per lobe"

**`standing_wave_picture`**
1. "what does 'standing wave' even mean here, like a wave that doesn't move?"
2. "is the electron behaving like a guitar string vibrating instead of a ball flying around"
3. "if it's a wave, why do we still draw it as a little dot sometimes"
4. "so the node is like the still point on a vibrating string, is that the same idea"
5. "does the wave thing mean the electron isn't really a particle at all"

**`radial_vs_angular_nodes`**
1. "what's actually the difference between a radial node and an angular node, they sound the same"
2. "why does the radial node look like a hollow ball but the angular node looks like a flat gap"
3. "can an orbital have both kinds of nodes at once"
4. "why is the p orbital's node a flat plane but the s orbital's node is a whole sphere"
5. "do radial nodes and angular nodes count as the same thing on a test or is that a mistake"

**`node_count_formula`**
1. "is it n minus l minus 1 or l minus n minus 1, I keep mixing it up"
2. "how do I even know what l is for a given orbital"
3. "does 1s really have zero nodes total, that seems too simple"
4. "if 3p has one radial and one angular node, why don't I ever see that drawn here"
5. "is there a quick way to remember this formula for the exam"

**`why_2s_has_a_node_but_2p_plane`**
1. "why does 2s get a hollow sphere but 2p gets a flat plane instead"
2. "both are n equals 2, so why don't they have the same kind of node"
3. "is the shape of the node just random or does it depend on something"
4. "so l decides whether the node is a plane or a shell, is that right"
5. "why doesn't 2p also have a spherical node hiding inside it somewhere"

### Self-review checklist (chemistry_author)

- [x] Every quantity referenced in the narrations above appears in §2 with a unit.
- [x] N/A: no reaction/balanced-equation ledger this concept (§10(c) of the skeleton's own DoD already
      declares this — the analogue is the hydrogenic-derivation ledger in §1 above).
- [x] All 9 states declare an archetype from `docs/patterns/chemistry.md` (archetype P2, the six coined
      choreographies) mapping to the shipped `orbital_shapes` scenario — no unbuilt surface needed.
- [x] Rule 31 timeline given for all 9 states; no two states share a motion; no static state; controls
      match the architect's per-state table exactly.
- [x] Rule 32 sequencing: cause-before-effect verified per state (S1 orbit-then-dissolve, S7
      grow-then-cutaway with an exact 1000 ms gap, S4/instrument tracking); only the taught variable
      moves per state (spin OFF during S1/S3/S4/S7 morph beats, ON in S2/S5/S6/S8); Rule 33 N/A per
      skeleton §12(g) (declared, not omitted); Rule 34 one formula surface + value-only HUD per state,
      real Unicode (ψ, ², °, ×, →, subscripts via the two-run sprite convention).
- [x] Word budget: every guided state machine-counted 36–55 words (§4); S9 exempt.
- [x] Choreography ratio ≥ 0.70 for every guided state, computed against the ACTUAL
      `validate-chemistry.ts`/`deriveStateMeta.ts` formula, not guessed (§3 table).
- [x] Notation ladder: no logs/calculus/quantum-mechanical notation anywhere in this concept (out of
      scope entirely per skeleton §2); dialect dual-label ("orbital, not an orbit") + IUPAC/plain
      naming N/A (no organic nomenclature here).
- [x] No particle-scale-factor needed (§2 note) — the dot swarm is honestly measurements of one
      electron, not a representative sample of many.
- [x] Drill-down phrasings: 45 total (5 × 9 clusters), real student voice, no Hinglish.
- [x] `constraints`: 6 short assertions, conservation/derivation-first (§5).
- [x] Numerical sanity check RUN via independent Simpson/bisection code, not eyeballed (§1 — every
      AS-BUILT number reproduced independently to sub-pm/sub-degree precision).
- [x] Engine bug queue: mirrored (no DB access this session); flagged for `quality_auditor` re-run.
- [x] Source check: NCERT chapter index for scope only (already done at skeleton stage); nothing
      imported this pass — all derivations are first-principles hydrogenic math.
- [x] `aha_moment` (S1) and `misconception_watch` (S1/S4/S5, skeleton §4): verified chemically true —
      the electron genuinely has no classical path (Copenhagen/measurement framing, appropriately
      simplified for Cl.11); the node genuinely reads |ψ|²=0; the three 2p's are genuinely degenerate.
      No `assessment` block this phase (house convention, per skeleton §12(f)).

**Deviations from the skeleton, summarized for `quality_auditor`:**
- **D1 (mandated).** S5 authored `enclosure:0.5, show_dots:false, surface_opacity:0.34,
  spin_axis:[1,1,1], camera dist 5.3` per the task brief's explicit engine-occlusion finding; narration
  reworded to avoid the "region where the electron is found" claim the task flagged as catchable.
- **D2 (gap found, not authored around).** Skeleton E-9's "derived 90.0°-apart readout" does not exist
  in the shipped `hud_lines` vocabulary — omitted rather than invented; perpendicularity carried by
  narration + the real axes triad only.
- **D3 (chemistry_author's normal job, not a deviation).** The skeleton's archetype descriptions did
  not include exact millisecond cue values; all cue timings in §3 were designed FROM SCRATCH against
  the real `validate-chemistry.ts` ratio formula (confirmed by reading its source and
  `deriveStateMeta.ts`'s `orbital_shapes` branch directly) rather than guessed — this is the
  `kinetic_particle_theory` mistake this pass was explicitly told not to repeat.
- **D4 (minor, flagged).** S3/S4's orbital axis (`2p_z`) is my own reasonable choice; AS-BUILT does not
  pin one, and by symmetry it should be interchangeable, but flagging in case the actual camera solve
  assumed a specific axis.
- **D5 (informational).** Confirmed by reading the code that continuous `spin_rate` and `ghost_at_ms`
  do NOT count toward the choreography-ratio gate — every state's ratio compliance in §3 rests on
  cues that DO count (stipple/extrude/probe_auto/bloom/cutaway/populate/gallery), never on spin alone.

**Could not verify:** live `engine_bug_queue` state (no DB access this session — mirrored from
documented scars only, per the spec's own fallback instruction); whether the AS-BUILT camera solves
(`OS_CAMERAS`) were solved assuming a specific p-orbital axis for `p_build`/`node_probe` (D4).
