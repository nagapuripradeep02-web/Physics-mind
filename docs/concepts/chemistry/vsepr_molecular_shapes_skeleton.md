# Architect skeleton — `vsepr_molecular_shapes`

**NCERT Class 11 Chemistry, Ch.4 "Chemical Bonding and Molecular Structure", §4.6 (VSEPR theory).**
Renderer: `field_3d`, `scenario_type: "molecular_geometry"` (built 2026-07-28, commit `b6a0259`).
Position in the roadmap: `docs/CHEMISTRY_DISCUSSIONS.md` Session C5 §6 — **P4 #12**, the first concept
harvested off the P3 3D surface. C5 §6 calls it *"arguably #2 overall after Le Chatelier."*

---

## §1 — Tier + the whiteboard test (required by C5 §7.3, before any state design)

**Tier: 💎 diamond.**

> The whiteboard test: if a good teacher with a whiteboard and 60 seconds produces the same
> understanding, it is not a diamond and does not earn a build.

This concept fails to be replaceable in the strongest way available. A teacher at a board can write
"109.5°" and say "tetrahedral", and the student will still leave with a **flat** mental picture,
because everything they have ever seen drawn is flat — including the Lewis structure they were taught
last week, which shows four bonds at 90°. The board cannot show a tetrahedron; it can only assert one.

Capabilities needed (C5 §2 — a concept earns a build if it needs at least one):

| # | Capability | Used here? |
|---|---|---|
| 1 | Show the invisible at scale | — |
| 2 | Sweep "what if" with guaranteed-correct physics | ✅ the explore sandbox: any molecule, any orientation, lone pairs on/off |
| 3 | **Hold 3D spatial structure** | ✅✅ **the entire concept.** "The place where hand-waving fails worst and a 2D board simply cannot go" |
| 4 | Make a counterintuitive result believable | ✅ the flat Lewis sketch is a lie, and S2 shows the molecule leaving the page |

Two of four, including the one that is definitionally out of a board's reach. Contrast with
`law_of_conservation_of_mass` (built, demo tier): there, exactly one state survived the test. Here,
**no state survives without the third dimension** — every beat is a spatial claim.

**Dependability (C5 §5 — the separate axis):** high. There is no integrator, no drag-dependent
physics, no timing subtlety; the geometry is closed-form and exact, the molecule always returns to
one home pose, and a teacher can drive it with one dropdown and one slider. A teacher can put this on
a projector mid-explanation without rehearsal, which is the second half of the §3 buy-trigger.

---

## §2 — State arc (7 states: 5 core + 1 extended + explore)

State count is **complexity-driven** (Rule 31) and the C5 §4 irreplaceability axis is applied: every
state below carries content that cannot be drawn, so nothing is trimmed as scaffolding. Depth rings
per Rule 38a — the `extended` ring is a contiguous block immediately before explore, and hiding it
leaves S1–S5 + explore as a coherent lesson (a lighter board never meets 5- and 6-domain geometries).

| # | State | Teaches | Motion archetype | Delta line (the ≤5-word caption) | Controls | Ring | Advance |
|---|---|---|---|---|---|---|---|
| 1 | `a_molecule_is_3d` | methane's four bonds point at tetrahedron corners; 109.5° | **assemble** (bonds grow out one by one, then the molecule turns) | "Four bonds, one shape" | static `spin` | core | manual_click |
| 2 | `the_flat_sketch_lies` | the Lewis cross at 90° is a drawing convention, not a shape | **flatten→relax** (the flat cross leaves the page; angle 90°→109.5°, H···H 154→178 pm) | "Flat sketch, then real" | live `spin` | core | manual_click |
| 3 | `domains_repel` | the *mechanism*: electron domains push apart to maximum separation — 2→180°, 3→120°, 4→109.5° | **stepped spread** (BeCl₂ → BF₃ → CH₄, each real) | "More domains, wider spread" | static `spin` | core | auto_after_tts |
| 4 | `lone_pairs_push_harder` | a lone pair occupies more room than a bond pair: 109.5° → 107° → 104.5° | **substitute + squeeze** (a bond becomes a lobe, *then* the survivors close) | "Lone pairs push harder" | live `spin` | core | manual_click |
| 5 | `geometry_is_not_shape` | electron geometry counts ALL domains; shape counts only atoms | **cage + strip** (the 4-domain cage draws in, then the lobes hide and bent is what remains) | "Count domains, name shape" | live `spin`, `lone` | core | manual_click |
| 6 | `five_and_six_domains` | the trigonal-bipyramidal (120°/90°) and octahedral (90°) families | **geometry swap** (PCl₅ → SF₆) | "Five, then six domains" | live `spin` | **extended** | auto_after_tts |
| 7 | `explore` | sandbox | free (continuous turn) | "All yours" | `molecule`, `spin`, `lone` | core | interaction_complete |

**Distinct motion every state (Rule 31), no archetype repeated.** S2 is the declared **contrast pair**
beat (flat expectation vs real geometry — Rule 16a's straightforward contrast, no predict-pause).

**Rule 32a (cause before effect):** S4 is the strict case — the bond→lone-pair conversion lands at
`at_ms`, and the angle only starts closing `convert_ms` (1000 ms) later, so the cause is visibly first.

**Rule 32b (only the taught variable moves):** the slow 3D turn is held OFF during every state whose
beat is itself a shape morph (S1–S4: `spin_start_ms` sits after the last ramp completes), so a morph
is never read against a rotation. S5/S6 turn from t=0 at a constant rate because their beat is a
toggle/swap, not a morph, and an octahedron seen dead-on is unreadable.

**Rule 32d (home pose):** all seven states share ONE frame — apex +y, non-apex domains at azimuth
`MG_AZ0` + k·120° — and lone pairs always consume the apex-side slots, so the molecule never teleports
between states. Six of the seven states also share ONE camera (az 255° / el 16°); only S6 differs,
because five chlorines separate on screen only from a steeper view with longer bonds. S2 keeps the
shared camera and authors its sketch plane (`flat_basis`) as that camera's own screen basis, so its
flat 90° is a true right angle without needing a private viewpoint.

**Rule 38b:** the explore state's molecule picker offers **core-ring molecules only** (CH₄, NH₃, H₂O,
BF₃, BeCl₂). PCl₅/SF₆ stay inside the extended-ring state that teaches them, so a syllabus preset
that hides `extended` leaves a coherent sandbox.

---

## §3 — Misconception watch (Rule 16a — confronted proactively, inside EPIC-L)

| State | Belief | Visual counter |
|---|---|---|
| 2 | "A molecule has the shape its Lewis diagram is drawn in — flat, with 90° corners." | the flat cross relaxes out of the page; the angle counts 90.0° → 109.5° and the H···H span grows 154 → 178 pm, so the flat drawing is shown to *crowd* the hydrogens by 24 pm |
| 4 | "A lone pair is just an unused bond — it takes up the same room." | the lobe is visibly fatter and closer in than a bond, and the surviving bond angle measurably closes twice |
| 5 | "Water is tetrahedral" / "water is bent, so it has three domains." | the cage counts four domains while only three atoms exist — both statements are half-right, and the state separates them |

---

## §4 — Real-world anchor (Rule 35 — universal, no country-specific content)

**Primary:** water's bent shape is why water is a polar solvent — a straight O–H–O would cancel its
two bond dipoles and water would not dissolve salt, would not climb a plant, and ice would not float.
Shape is not decoration; it decides what a substance does.
**Secondary:** methane's tetrahedral symmetry is why natural gas is non-polar and burns cleanly, and
why it is a greenhouse gas at all — a molecule's behaviour follows from its geometry.

Both anchors are true anywhere on Earth and name no place, brand, currency, or festival.

---

## §5 — Engine ask

**None.** The `molecular_geometry` scenario was built and committed first (`b6a0259`), with its
geometry verified numerically before this skeleton was written. This concept is pure data over it —
the P3-surface thesis (one renderer investment, then a harvest) working as designed. Concept #13
(hybridisation) and #17 (σ/π) should reuse it with **zero** new renderer code; #14/#15 (SN1/SN2,
stereochemistry) will need a motion layer added to it, not a new surface.

## §6 — Registration

**Site #1 only** — `src/data/concepts/chemistry/vsepr_molecular_shapes.json`. Sites 2/3/4/7/8 are
FORBIDDEN for chemistry ids until the chemistry serving path lands (root CLAUDE.md §6;
`docs/CHEMISTRY_ARCHITECTURE.md` §7). Gate 8b is all-or-nothing. Validation is
`npm run validate:chemistry`; the physics validator must not see this file.

---

## §7 — Definition of Done (Gate 0 — zero TBDs)

**(a) States:** the 7 states of §2, exactly as tabled, in that order.

**(b) Symbol-label table:**

| Narrated quantity | On-canvas label |
|---|---|
| bond angle | live arc sprite `H–C–H = 109.5°` (ligand–central–ligand, element symbols substituted per molecule) |
| electron-domain count | HUD `domains = 4`, and `domains = 4 (2 bond + 2 lone)` whenever lone pairs exist |
| electron geometry | HUD `electron geometry: tetrahedral` |
| molecular shape | HUD `shape: bent` |
| ligand separation | HUD `H···H = 178 pm` (value-only; **no on-canvas sprite** — see (h)) |
| atoms | element symbols on the central atom and on the TWO ligands the arc measures, never on all six |
| lone pair | `lone pair` / `lone pairs`, on the lobe cluster |
| the rule itself | ONE Cambria-Math formula surface, e.g. `4 bonding pairs → 109.5°` |

**(c) Chemical-validity ledger (the chemistry variant — replaces the balanced-equation ledger, since
no reaction occurs here):** every angle rendered is the real value, and the renderer DERIVES it rather
than being told it — `mgIdealDirs` for the maximum-separation arrangement, `mgSqueeze` (closed form)
for the lone-pair compression. Verified numerically before any state was authored: BeCl₂ 180.0 ·
BF₃ 120.0 · CH₄ 109.471 · NH₃ 107.0 · H₂O 104.5 · PCl₅ 120.0 eq / 90.0 ax-eq · SF₆ 90.0. NH₃ and H₂O
are EXPERIMENTAL values, and `physics_engine_config.constraints` says so explicitly — VSEPR predicts
the direction of the effect, not the number. A multiple bond is ONE domain (stated in `constraints`,
tested by q5, and never contradicted on canvas because no multiple-bonded molecule is drawn).

**(d) Motion plan:** exactly the archetype column of §2. No static state. The slow 3D turn is OFF
during any state whose beat is itself a morph (S1–S4), ON at a constant rate where the beat is a
toggle or a swap (S5–S7).

**(e) Modes:** `epic_l_path` only (Rule 20 [D] — no `mode_overrides`). `renderer_pair` field_3d /
field_3d; no second panel.

**(f) Assessment + coverage_map + misconception_watch:** 6 backward-designed questions; ≥1 on the aha
(q1 → S2); q5 is a deliberate TRANSFER item (CO₂) that no single state stages, and `coverage_map.notes`
says so; every wrong option keyed to an M1–M3-class belief; `by_state` covers S1–S6,
`non_assessed_states: [STATE_7]`. `misconception_watch` is exactly the three entries of §3.

**(g) Macro↔micro (Rule 33): N/A, and deliberately.** There is no macroscopic manipulable cause driving
a separate microscopic mechanism — the molecule IS the taught object at the only scale it has. Same
precedent as `bohr_model_energy_levels`. Recorded as a decided non-issue, not an omission.

**(h) Canvas budget (Rule 34):** per state ONE Cambria formula surface (left, `top:44%`); the top
caption is the ≤5-word delta cue only; prose lives in the subtitle strip; the HUD (`top:52px;right:12px`,
clearing the review-chrome Full-screen button) is value-only; sliders bottom-right. **The span carries
its LINE on canvas but its NUMBER only in the HUD** — the span midpoint sits on the same bisector ray
the arc label uses, so two wide sprites there overlap by construction.

**(i) 3D projection check (NEW — this render surface's own gate, and the one THE EYE's deterministic
checks cannot perform):**
- **Countability.** Every element the caption or HUD counts must be separately countable in the frozen
  frame. Measured, not eyeballed: with atoms projected as discs, the minimum screen gap between any two
  atoms — and between any atom and the central atom — must be **> 0**. Achieved gaps: 0.51 (tetra
  states), 0.92 BeCl₂, 1.02 BF₃, 0.34 PCl₅, 0.38 SF₆.
- **Angle fidelity.** The projected arc angle must stay near its label: ≤3.4° error on the shared
  camera, ≤4° on S3, ≤3.4° on S6.
- **Flat-vs-real honesty.** S2's sketch plane is authored (`flat_basis`) as the screen basis of its own
  camera, so its 90° is exactly 90.00° and the relaxed angle still reads near 109.5°.
- **No claim without a measurement.** Every number on canvas must be produced by something rendered.
  S6's formula was descoped to `5 → 120° equatorial · 6 → 90°` for exactly this reason: the scenario
  draws ONE arc, so the axial-equatorial 90° of PCl₅ was asserted but never shown.

**(j) Engine contract the scenario must supply** (`molecular_geometry`; no `computePhysics_*` — this is
field_3d, not PCPL): domain directions for 2–6 domains · closed-form lone-pair compression · a live arc
with `setDrawRange` sweep + auto-width label · a ligand-span line + picometre value · a domain
ghost/hull cage · per-state `bond_scale` · `flat_basis` · the cues `assemble_at_ms`, `flat_hold_ms`,
`spread_steps`, `squeeze_steps`, `compare_at_ms`, `hull_at_ms`, `hide_lone_at_ms` · controls
`molecule` / `spin` / `lone`, with any scripted change reflected back into the control a teacher drives.

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** The real prerequisite is a Lewis structure — knowing which atoms are bonded and
that non-bonding electrons come in pairs. No shipped concept covers it. The concept breaks at **S4**
without it: a student who has never drawn a lone pair cannot accept that one exists on nitrogen. Patch:
S4's first sentence defines it in one line ("two electrons that belong to the central atom alone")
before the lobe appears. S1–S3 need only "atoms are joined by bonds", which is safe.

**JEE-backwards trace.** *"Predict the shape of ClF₃ / why is H₂O bent while CO₂ is linear?"* Knowledge
pieces → states: (1) count electron domains, multiple bond = one → S3 + q5; (2) domains repel to maximum
separation → S3; (3) that arrangement names the ELECTRON geometry → S5; (4) lone pairs repel harder, so
the bond angle closes → S4; (5) the SHAPE is what the atoms alone trace → S5; (6) beyond four domains,
axial vs equatorial → S6. The full ClF₃ answer (which sites lone pairs occupy in a bipyramid) is
deliberately out of scope — it needs the lone-pair-placement rule, a separate concept.

**Misconception entry mapping.** M1 (flat molecules) is *planted by every Lewis diagram the student has
ever seen* — S2 confronts it directly rather than pretending it is not already there. M2 (a lone pair is
an empty slot) risks being planted by S3, which shows only bonding domains; S4 confronts it one state
later. M3 (geometry = shape) is planted by S1–S4, all of which name a single geometry per molecule; S5
exists precisely to split it. No EPIC-C branches (EPIC-L-first).

## Block 2 — Aha-moment designation

- **PRIMARY aha:** *the flat cross on paper is a bookkeeping convention, not the molecule — the real one
  leaves the page, and its hydrogens sit 24 pm further apart than the drawing implies.* At **S2**
  (inside `foundational` ✔).
- **SUPPORTING aha:** at **S5** — electron geometry and molecular shape are answers to two different
  questions, and water is both tetrahedral and bent without contradiction.
- **Cohesion:** S2 destroys the wrong picture, S3 supplies the mechanism that replaces it, S4 refines it,
  S5 shows the refined picture answers exam questions the naive one cannot. One line.
- **Wrong-belief setup:** S1 builds a confident, CORRECT picture (tetrahedral methane) and S2 immediately
  contrasts it with the flat sketch the student already carries — the belief is pre-planted by prior
  schooling, so S1 does not need to plant it.
- **Deep-dive cross-reference:** the Pass-1 cliff states (S4, S5) are the two worth `has_prebuilt_deep_dive`
  tags if deep-dive ever reactivates; not authored now (Rule 18 [D]).
