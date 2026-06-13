# PhysicsMind — Curriculum Build-Out Roadmap (V1-first)

> **v1.0 — 2026-06-13 (Session 67). PLANNING ARTIFACT — founder-approved (Rule 17).**
> This is the missing master **build sequence**: it orders all 44 chapters from where we are
> (≈5 diamonds built) to a complete product, marks the near-term **V1 foundation subset** to build
> first, and names the immediate next action. It does NOT build simulations — it makes the rest
> buildable. It fulfils the long-deferred "Stage-5 cross-topic priority queue" (the per-chapter `v1?`
> flags existed in the catalogs; this is the cross-chapter sequence that was never written).
>
> **Companion docs:** `CURRICULUM_ARCHITECTURE_PROPOSAL.md` (the DAG, foundational rankings,
> misconception chains, archetypes — the analysis this sequence rests on) · `AUTHORING_PIPELINE.md`
> (how ONE concept is built) · `MAGNETISM_ARCHITECTURE.md` (the proven recursive-bootstrap method).

---

## 1. Where we stand (clean-slate accounting)

**Built to the diamond bar (the ONLY real current product):**
- `magnetic_field_wire`, `magnetic_force_moving_charge`, `biot_savart_law`,
  `torque_on_current_loop_in_field` (T36 Magnetism) + `friction_static_kinetic` (T12). **= 5 diamonds.**
- `magnetic_field_solenoid` — **95% built, NOT yet validated** (no visual gate, no professor). In progress.

**Everything else is to build.** The ~60 vector/kinematics/projectile/forces JSONs on disk are
**OLD ARCHITECTURE, set aside** (built Apr–May by an earlier, lower-bar process) — they are
**rebuild-to-diamond candidates and skeleton references, NOT finished sims.** (Session-59 record: "of 63
built JSONs, only 4 are diamond-level.")

**Catalog status:** COMPLETE. All 44 chapters fully inventoried — **727 atomics + 836 nanos = 1,563
concepts**, full A–J sections each. The *list* is done; only the *build* and this *build-order* remained.

**Archetypes already proven** (by the 5 diamonds) — these make whole clusters cheap:
- **A — Field-viz** (field lines/arrows around a source, RHR overlay, compass probe) → `magnetic_field_wire`.
- **B — Force-in-field** (F = qv×B, particle trajectory, per-frame force vector) → `magnetic_force_moving_charge`.
- **C — Dipole-in-field** (torque τ = μ×B, rotation) → `torque_on_current_loop_in_field`.
- **Graphs** (x-t/v-t/a-t) → the old kinematics sims (rebuild target, but the renderer works).

---

## 2. Two orders, reconciled (the core idea)

There are **two different orderings** and they are NOT the same:

- **TEACHING order** = the dependency graph a *student* traverses. Roots first:
  `T2 Units · T3 Math Tools · T5 Vectors → T6 Kinematics · T11 Newton → … → T46–T50 Modern`.
- **BUILD order** = what *we author* first. It is **impact-weighted, not strict dependency** — and that is
  allowed, because **prerequisites are advisory, never gating (Rule 23).** We build the highest-leverage,
  archetype-proven, demo-able concepts first.

That is why **magnetism (T36) was built first** even though it sits *late* in the teaching DAG: it is
visually rich, it proved archetypes A/B/C, and it anchors the contributor pipeline. The build order below
front-loads *completing that beachhead* + the *biggest foundation* (Newton), then expands outward.

> Reading rule: a chapter's **teaching** prerequisites (left column below) are advisories shown to students
> as "builds on X"; they do **not** block us from building a chapter earlier when impact justifies it.

---

## 3. PHASE 0 — Prove the loop, then cheapen it *(do this first — it gates everything)*

Nothing else should scale until two things are true:

1. **Finish the solenoid to *properly done*.** It is 95% structurally complete (architect + physics blocks
   done; JSON nearly complete) but has **never been rendered, visually-gated, or professor-reviewed.** It is
   the **M4 binary gate**: if it reaches diamond quality in ≤1 iteration through the loop, the recursive-
   bootstrap method is *proven*. Remaining work: json-author finishes the 3D scene primitives (coil morph,
   radial-cancellation arrows, hand-grip swap), then `npm run visual:eyes` + `smoke:visual-validator` +
   read every PNG, then professor gate. **This is the immediate next action (see §8).**

2. **Stand up the cheapening infrastructure** — the patterns library (`docs/patterns/<chapter>.md`) + a
   lightweight auto-eval loop. This is the master lever: it drops a *post-bootstrap* concept from **~5–6
   founder-hours to ~45 minutes** (atomic) / ~25 min (nano). Without it, the full curriculum is a decade
   solo; with it, it's a tractable content engine. **Build this before Phase 2 scales.**

---

## 4. PHASE 1 — V1 FOUNDATION SUBSET (~13 new concepts) — the near-term build target

The minimum that (a) completes a *demo-able chapter*, (b) lands the *highest-foundation* nodes, (c) proves
the comprehension loop with the professor + a first student cohort. Two blocks:

### 1a — Complete T36 Magnetism (the beachhead) — archetypes A/B/C already proven, contributor pipeline pointed here
| Concept | Archetype | Why |
|---|---|---|
| `magnetic_field_concept_B` | A | Unbuilt ROOT of our own chapter; "B is a field like E" |
| `magnetic_force_direction_right_hand_rule` | A + **new 3D-RHR mesh** | Diamond #1 in the T36 classification; unlocks the cross-product archetype reused by τ, L everywhere |
| `magnetic_force_perpendicular_no_work` | B | Kills "magnetic force does work" before T35/T37 depend on it |
| `circular_motion_charge_in_uniform_B` | B | F=qvB becomes centripetal; exam staple |
| `cyclotron_period_independent_of_speed` | B | The re-sync aha; dual-particle race |
| `amperes_circuital_law` | A + **derivation whiteboard** | First derivation-led concept; re-derives the solenoid |
| `current_loop_acts_as_dipole` | C | Closes the chapter; bridges to T37 |

→ With the 5 built + solenoid, **T36 becomes one COMPLETE chapter** = a real demo object + a full
professor-packet set for Asmi.

### 1b — T11 Newton's-Laws spine — the single biggest foundation in the catalog
| Concept | Downstream | Why |
|---|---|---|
| `newton_first_law` | 269 | Root of all dynamics |
| `newton_second_law` 💎 | 266 (27 direct) | Biggest hub in the entire catalog; kills "force causes velocity" |
| `newton_third_law` | 70 | Kills "action-reaction cancel" → protects momentum + kinetic theory |
| `free_body_diagram` 💎 | — | The universal mechanics tool |
| `block_on_incline` 💎 | — | Most-tested setup; reuses inclined-plane resolution |
| `connected_bodies` 💎 | — | Unlocks **new multi-body-constraint archetype** (pulleys/Atwood) |

**V1 = ~13 new concepts.** T11 carries 47% misconception density — high comprehension-loop signal.

---

## 5. PHASES 2–8 — the full 44-chapter dependency-ordered expansion

Each chapter: **teaching-prereqs · atomics/nanos · archetype · NEW build or REBUILD · why here.**
(Counts from the catalog. "REBUILD" = an old-architecture file exists as a skeleton, not a finished sim.)

### PHASE 2 — Foundation completion + E&M compounding
| Ch | Name | Prereqs | a/n | Archetype | Build | Why here |
|---|---|---|---|---|---|---|
| T6 | Kinematics 1D | T5 | 9/17 | Graphs | **REBUILD** | sign-convention = 30% of ALL catalogued errors; root of motion |
| T5 | Vectors | T2/T3 | 14/5 | new: cross-product | **REBUILD** | most-required prereq in the catalog; cross-product still unbuilt (architecture gap) |
| T13 | Work-Energy (opener) | T6, T11 | 33/42 | **new: energy bar-chart** | NEW | bridges mechanics↔thermo↔E&M; work-energy theorem is the catalog's "most-wanted" unbuilt |
| T35 | EM Induction | T36, T30 | 14/21 | A + B | NEW | compounds directly on built magnetism; flux→Faraday→Lenz→motional-emf; 4 diamonds |

### PHASE 3 — Rest of mechanics (dependency-ordered)
| Ch | Name | a/n | Archetype | Build | Note |
|---|---|---|---|---|---|
| T7 | Kinematics 2D / Relative | 5/16 | Graphs+vectors | REBUILD | river-boat, rain-umbrella |
| T8 | Projectile | 5/12 | B (parabola) | REBUILD | decoupling x/y |
| T9 | Circular kinematics | 4/11 | A/Graphs | NEW | centripetal accel (kills "extra force") — prereq for charge-in-B |
| T10 | Circular Motion | 32/43 | B | NEW | banking, vertical circle (big chapter) |
| T12 | Friction (beyond built diamond) | 28/41 | B | partial REBUILD | the `friction_static_kinetic` diamond exists; the other ~27 atomics don't |
| T14 | Momentum & Collisions | 10/14 | B | NEW | conservation; needs N3 killed first |
| T15 | Rotational Mechanics | 12/15 | C + new rotation | NEW | reuses cross-product/dipole machinery |
| T16 | Gravitation | 28/28 | A (field) | NEW | reuses field-viz; orbits |
| T17 | SHM | 29/37 | **new: oscillation** | NEW | the oscillation archetype (also unlocks waves + AC) |
| T18 | Elasticity | 10/14 | Graphs | NEW | stress-strain feeds wave speed |

### PHASE 4 — Waves (densest misconceptions, 41%; needs the oscillation/wave renderer from T17)
`T19 Wave Equation (8/15)` → `T21 Wave Motion (25/42)` → `T22 Superposition & Standing Waves (7/12)` →
`T23 Sound (6/19)`. T19 is small but unlocks the whole cluster.

### PHASE 5 — Thermo & Fluids
`T20 Fluid Mechanics (10/21, new: pressure/flow)` · `T25 Thermal (10/19)` → `T26 Thermodynamics (15/18,
new: PV-diagram)` ↔ `T27 Kinetic Theory (8/16)`.

### PHASE 6 — Electrostatics & circuits (E&M roots — *backfilled*, since magnetism was built first)
`T29 Charges (14/17, A)` → `T30 Electrostatics (30/36, A)` → `T31 Capacitors (26/23)` · `T34 Current
(28/13, new: circuit schematic)` · `T37 Magnetism & Matter (14/16, C)` · `T38 EM Waves (10/14)` ·
`T39 AC Circuits (12/17, oscillation+circuit)`.

### PHASE 7 — Optics (new ray-trace archetype)
`T41 Mirrors (13/19)` → `T42 Lenses & Prism (26/37)` → `T43 Optical Instruments (24/12)` · `T44 Wave
Optics (27/6)`.

### PHASE 8 — Modern physics (hardest to animate; lowest diamond density)
`T46 Dual Nature (18/4)` → `T47 Atomic Models (19/5)` → `T45 Atomic Spectra (19/5)` · `T48 Nuclei (19/6)` ·
`T49 Semiconductor (25/16)` · `T50 Communication (17/7) — VERIFY syllabus first; likely PARK (off current
NCERT/JEE/NEET)`.

### Support pass — slot as prerequisites demand (low visual glamour)
`T1 Physical World (3/8)` · `T2 Units (5/15)` · `T3 Math Tools (4/11)` · `T4 Lab (3/10)` — mostly
qualitative/nano; build thin where a downstream chapter genuinely needs them, else defer.

---

## 6. Build rules baked into every phase (the constant quality bar)

- **Conceptual-depth-first**: `epic_l_path` only. No problem-class/JEE sims; board + competitive modes
  deferred (Rule 20 suspended). New concepts ship WITHOUT `mode_overrides`.
- **One context per concept** (V1). Multi-context is Year 2+.
- **EPIC-L-first**: no EPIC-C branches yet; confront the wrong belief *inside* EPIC-L (Rule 16a predict→reveal).
- **Old-architecture chapters = REBUILD to diamond** (old file = skeleton reference, never "done").
- **Professor before students**: every chapter goes to the professor pool (Asmi) before any student.
- **Gates before "done"**: visual "eye" gate (E29 — `visual:eyes` + `smoke:visual-validator`, read every
  PNG) + `npm run validate:concepts` + quality-auditor's hard gates.
- **Compounding**: every bug → `engine_bug_queue` with a `prevention_rule`; every new visual idiom →
  `docs/patterns/<chapter>.md`. Future concepts inherit both automatically.

---

## 7. Honest pacing & the one lever

| Unit | Cost (current bar) | After Phase-0 infra |
|---|---|---|
| Diamond (invents an archetype) | ~5–6 founder-hours, 5–8 iterations | (still hand-iterated by design) |
| Atomic (follows a pattern) | ~5–6 h (no infra yet) | **~40–50 min** |
| Nano | — | **~25 min** |

- **V1 (~13 concepts)** ≈ a few months at the current bar — and it completes a chapter + proves the loop.
- **Full curriculum (~1,563)** = a **multi-year content engine.** This is expected and is the moat (a
  content company, not a one-time build).
- **The single highest-leverage move is Phase-0 infrastructure.** Patterns + auto-eval loop is what turns
  "decade solo" into "tractable." Do not skip it to chase concept count.

---

## 8. Immediate next action

**Finish the solenoid to properly done** — json-author completes the 3D scene primitives → `npm run
visual:eyes -- magnetic_field_solenoid` + `smoke:visual-validator --dense` → read every PNG → professor
gate. This is Phase 0, step 1, and the M4 proof that the whole build method works. Everything in §4–§5
scales off that result.

---

## Caveats
- Exam-weight / PYQ priority inputs are approximate until E38 (PYQ Ingester) ships — re-score the sequence then.
- Prerequisite edges are the catalog's cross-topic DAG — advisory, never gating (Rule 23).
- T50 Communication Systems: verify against the official 2026 NCERT/JEE/NEET syllabus before any build
  (believed dropped) — parked at the bottom regardless.

---

*The list was complete; only the path was missing. From 5 diamonds: prove the loop (solenoid) → cheapen it
(patterns + loop) → V1 (finish magnetism + the Newton spine) → expand outward, chapter by chapter, in
dependency order. Build order is impact-first; teaching order is the DAG. The two are reconciled above.*
