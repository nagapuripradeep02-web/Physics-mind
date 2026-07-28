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
