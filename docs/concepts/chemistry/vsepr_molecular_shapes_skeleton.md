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

**Rule 32d (home pose):** all seven states share ONE frame — apex +y, tripod legs at azimuth
90°/210°/330° — and lone pairs always consume the apex-side slots, so the molecule never teleports
between states. Only the camera moves (S2 sits dead-on at `[0, 0.8, 9.2]` so its 90° reads as a true
right angle).

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
