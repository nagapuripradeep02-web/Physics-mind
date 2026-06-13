# Curriculum Architecture Proposal — v0.1 (§8 DATA FIXES APPLIED 2026-06-13)

> **Status: §8 data-hygiene items SOLVED (Batch 1, "core now"); build queue still awaiting build.**
> Founder approved solving the §8 list on 2026-06-13. The catalog DATA fixes (T5 page, 7 cycle breaks,
> T12 rename, transformer de-dup, rebuild, T50 finding) are DONE — see the resolution box in §8. The
> Top-20 BUILD queue (§5) is unchanged and still flows into the authoring pipeline when building starts.
>
> **⚠ "BUILT" CORRECTION (founder, 2026-06-13).** This proposal originally spoke of "67 built JSONs on
> disk." That is FILE COUNT, not product. The **only real current product is the diamonds** (≈5 finished:
> magnetic_field_wire, magnetic_force_moving_charge, biot_savart_law, torque_on_current_loop_in_field,
> friction_static_kinetic) **+ magnetic_field_solenoid still in progress.** The other ~60 disk JSONs
> (all vectors, kinematics, projectile, forces) are **OLD ARCHITECTURE / below the quality bar, set
> aside** — rebuild-to-diamond candidates, NOT shipped lessons (the project's own Session-59 note: "of 63
> built JSONs, only 4 are diamond-level"). Read every "built/shipped" mention below as "an old file exists
> on disk," not "done." The build-ORDER queue (§5) is UNAFFECTED — it already front-loads finishing the
> diamonds and treats almost everything else as not-yet-built.
>
> **Status (original): PROPOSAL.** Produced 2026-06-13 (Session 67) by the curriculum-architect pass over the
> full Stage-2 catalog. Nothing here edits the catalog or builds anything — this is the reviewable
> plan per Rule 17 (offline, human-approved). On approval, items flow into the normal authoring
> pipeline (architect → physics-author → json-author → quality-auditor, AUTHORING_PIPELINE.md).
>
> **Evidence base:** all 1,542 catalog rows parsed programmatically from
> `docs/exports/PhysicsMind_Concept_Catalog.csv` (713 atomic + 829 nano, 1,995 resolved prereq
> edges); all 44 chapter pathway files read; cross-topic-dependency-matrix + stage-4-consolidation +
> cognitive-error-prevention-index read; 67 JSON FILES on disk reconciled against catalog IDs (file
> presence only — NOT a quality-bar "built" claim; see the BUILT CORRECTION box above).
> Analysis script: throwaway, run from temp, not committed.

---

## 0. Standing decisions respected (stated back for correction)

1. **Scope = triple-covered only** — NCERT ∩ DC Pandey ∩ HC Verma = the 44 Stage-2 topics. Confirmed in stage-1 + stage-4 item (l).
2. **Conceptual depth first** — no JEE problem-class sims; `epic_l_path` only (Rule 20 suspended).
3. **V1 = one concept, one context** — no multi-context expansion in this queue.
4. **Source-role triad** — HCV = sequence, DCP = problems + misconception beliefs, NCERT = anchors.
5. **Nano = exactly 2 states**, smallest unit, never gets deep-dive.
6. **EPIC-L-first** — no EPIC-C branches; misconceptions confronted inside EPIC-L (Rule 16a).
7. **Prerequisites are advisory, never gating** (Rule 23).
8. **Professor-gate loop active** (AUTHORING_PIPELINE.md; contributor program live as of Session 66) — every queue item ships to the professor pool before students.

No standing decision is overturned by this proposal. One **verify-flag** (not a recommendation):
the catalog includes T50 Communication Systems, but the NCERT rationalised syllabus and JEE Main
(2024+) dropped Communication Systems. Verify current syllabus status before any T50 build —
it sits at the very bottom of the priority queue anyway.

---

## 1. Catalog data problems found (flagged, not fixed)

These are catalog defects the analysis surfaced. Each needs a founder decision before the
affected region is built; none blocks the Top-20 queue (§5).

| # | Problem | Evidence | Proposed fix (on approval) |
|---|---|---|---|
| D1 | **T5 Vectors has no catalog rows at all** — yet it is the single most-referenced prerequisite (35+ `Requires` refs: `vector_resolution` ×31, `dot_product` ×4, `vector_cross_product` ×8) and stage-4 item (h) names T5 "the vector DAG root (~21 IN-edges)". Paradox: vectors are our MOST-built chapter (19 sims on disk). | No `pilot-topic-5*.md`; no `chapter-05*.md`; 0 vector rows in CSV | Author a retroactive T5 catalog page FROM the 19 built JSONs (reverse-catalog). Cheap, closes 35+ dangling refs. |
| D2 | **"Built in repo?" column is wrong** — only 9 rows marked built; on disk there are 67 JSONs, and only 2 (`free_body_diagram`, `magnetic_field_solenoid`) match a catalog ID verbatim. The built corpus (DC Pandey-era IDs like `distance_displacement_basics`) and the catalog (IDs like `displacement_vs_distance_atomic`) are two ID universes. | Programmatic join, 2026-06-13 | Add an `alias_built_id` column (or a small mapping file) — ~50 of the 67 map 1-to-1 semantically. Without it, every future priority pass re-discovers this by hand. |
| D3 | **405 unresolved prerequisite refs (247 distinct) even after normalisation** — formats include backticked IDs, `parent: x`, `math-tools: y`, `x(T11)`, `x [T5 …`, composite `a+b`. | Parser output | One normalisation sweep over the `Requires`/`Required-by` columns; define ONE reference grammar. |
| D4 | **Concept-level prerequisite cycles** (catalog ⟲ flags + my SCC computation agree): see §2.3 for the 7 loops and proposed breaks. | SCC on resolved edges | Apply the 7 edge deletions in §2.3. |
| D5 | **Diamond markers are format-biased** — 63 💎 total, but ~18 chapters (incl. mechanics core T10 Circular, T12 Friction, T13 Work-Energy, T17 SHM, T29/T30/T31/T34 E&M core) have ZERO markers because those catalog formats never wrote the marker, not because nothing is important. | Per-topic 💎 counts | Don't trust 💎 alone for priority (this proposal compensates with computed descendant counts). Backfill markers opportunistically. |
| D6 | **T39 nano-cycle** `impedance_triangle_nano ↔ lcr_series_circuit_atomic` — a nano that is prerequisite to its own parent is structurally invalid (nanos hang under atomics). | SCC output | Delete the `lcr_series requires impedance_triangle` edge. |
| D7 | **T35/T39 duplicate**: `transformer_in_ac_atomic` (T39) duplicates `transformer_atomic` (T35) near-verbatim. | E&M chapter read | Keep T35 as owner; T39 cross-references. |
| D8 | **T12 naming**: `friction_drives_motion_misconception` is named as if it were a misconception sim but it teaches the positive concept (static friction *causes* walking/driving). | T12 pathway read | Rename on next touch. |

---

## 2. A — Prerequisite DAG

### 2.1 Topic-level layers (cross-topic teaching order)

From the cross-topic-dependency matrix (~512 edges at 44-pilot closure) + my computed cross-topic
edge groups. Gateway topics with topic-level IN-degree in parentheses.

```
ROOTS      T2 Units · T3 Math Tools · T5 Vectors (≈21 IN — and missing from catalog, see D1)
L1         T6 Kinematics-1D (13) · T7 K-2D/Relative · T11 Newton's Laws (20) ← GATEWAY
L2         T8 Projectile · T9 Circular Kinematics · T12 Friction · T13 Work-Energy (16) ← GATEWAY
L3         T10 Circular Motion · T14 Momentum · T15 Rotational · T16 Gravitation · T17 SHM (10) · T18 Elasticity
L4         T19 Wave Eq → T21 Wave Motion → T22 Superposition → T23 Sound  (densest misconception cluster, 41%)
L5         T20 Fluids · T25 Thermal → T26 Thermodynamics ↔ T27 Kinetic Theory (T27 OUT:18)
L6         T29 Charges → T30 Electrostatics (23) ← GATEWAY → T31 Capacitors
L7         T34 Current → T36 Moving Charges (20) ← GATEWAY → T35 EM Induction → T37 Matter → T39 AC · T38 EM Waves
L8         T41 Mirrors → T42 Lenses (→ T43 Instruments) · T44 Wave Optics
L9         T46 Dual Nature → T47 Atomic Models (17) → T45 Spectra · T48 Nuclei · T49 Semiconductor → T50 Comm
```

Strongest single cross-topic dependencies (top of 60 topic-pairs by edge count): T42→T43 (14
edges), T47→T45 (14), T19→T22 (13), T6→T7 (6), T49→T50 (6), T35→{T37,T38,T39} (5 each).
**Implication:** T19 (Wave Equation, 8 atomics) is a small chapter that unlocks the whole waves
cluster; T35 is the E&M crossroads.

### 2.2 Concept-level foundational ranking (computed, atomics only)

Transitive-descendant count over the 1,995 resolved edges — "how many concepts sit downstream":

| Desc | Concept | Topic | Note |
|---|---|---|---|
| 269 | newton_first_law_atomic | T11 | root of all dynamics |
| 266 | newton_second_law_atomic 💎 | T11 | 27 direct dependents — biggest direct hub in catalog |
| 94 | magnetic_flux_definition | T35 | biggest E&M upstream |
| 91 | gravity_force_atomic | T11 | |
| 89/87 | kt_assumptions / ideal_gas_equation | T27 | thermo cluster keys |
| 87 | faradays_law 💎 | T35 | 13 direct |
| 77/76 | position_frame_of_reference / sign_convention_1d | T6 | **sign convention = 30% of ALL catalogued cognitive errors** |
| 73 | magnetic_field_concept_B | T36 | unbuilt root of our beachhead chapter |
| 71/68/66 | displacement_vs_distance 💎 / avg_vs_instantaneous / acceleration_definition 💎 | T6 | largely built (alias IDs, D2) |
| 66 | transverse_vs_longitudinal 💎, wave_motion_energy_transport | T19/T21 | waves-cluster gates |
| 63 | shm_definition_force_minus_kx | T17 | 9 direct |
| 56 | stress_strain 💎 | T18 | feeds wave speed v=√(Y/ρ) |
| 54 | newton_law_of_gravitation 💎 | T16 | 17 direct dependents |
| 52 | vector_kinematics_2d 💎 | T7 | largely built |

Rule 23 placement: every cross-topic edge above becomes a soft `prerequisites: [x]` advisory
("builds on X — 5 min intro?") in the dependent's JSON — never a gate.

### 2.3 Cycles — all 7, with proposed breaks

Computed SCCs agree with the catalog's ⟲ flags (the famous "T46 = 18-atomic clique" is already
*mostly* broken in the export's best-effort levelling; 2 true loops remain there).

| Topic | Loop | Proposed break (edge to delete) | Reason |
|---|---|---|---|
| T14 | inelastic_collision ↔ coefficient_of_restitution | delete `inelastic requires restitution` | Teach the phenomenon (KE lost) first; *e* is its quantification |
| T17 | simple_pendulum ↔ physical_pendulum ↔ angular_shm_equation | keep `angular_shm → simple → physical`; delete back-edges | Angular SHM equation is the parent idea; pendulums are instances |
| T25 | specific_heat ↔ calorimetry_principle | delete `specific_heat requires calorimetry` | Q=mcΔT defines c; mixtures method *uses* it |
| T39 | impedance_triangle_nano ↔ lcr_series_atomic | delete `lcr_series requires impedance_triangle` | Nano can't precede its parent (D6) |
| T46 | wave_theory_fails ↔ threshold_frequency ↔ einstein_equation | order: fails → threshold (observation) → Einstein (explanation); delete back-edges | Phenomenon → anomaly → resolution is the historical and pedagogical order |
| T46 | work_function ↔ electron_emission_modes | delete `work_function requires emission_modes` | φ is a material property; emission modes presuppose it |
| T50 | space_wave_propagation ↔ antenna_range_formula | delete `space_wave requires antenna_range` | Formula quantifies the propagation mode |

---

## 3. B — Atomic vs nano audit (mis-granularisation)

Stage-4 item (d) stress-tested N=30 at 90% pass — these are the residual + newly-found cases:

| Concept | Current | Proposed | Why |
|---|---|---|---|
| `magnetic_force_direction_right_hand_rule` (T36) | nano | **atomic** (and queue item #2) | 3D spatial reasoning, two-RHR confusion, needs predict→reveal states — not a 2-state fragment. The diamond-classification doc itself ranks it Diamond #1. |
| `wave_parameters_atomic` (T19) | 1 atomic | atomic + nanos | Bundles A, λ, T, f, k, ω — six parameters; keep the relations as the atomic, push per-symbol to nanos |
| `electric_dipole_definition` (T30) | 1 atomic | atomic + 3 nanos | Bundles axial field + equatorial field + potential + torque |
| `ac_voltage_source_atomic` (T39) | 1 atomic | split | Bundles RMS + frequency + phase (2–3 teachable ideas) |
| `resistance_R_equals_rho_L_over_A` (T34) | atomic | nano | Single formula step from resistivity |
| `cyclotron_radius` + `cyclotron_period` (T36) | 2 atomics | merge candidates | Both fall out of qvB = mv²/r in one move (but keep `period_independent_of_speed` separate — that's the aha) |
| `electric_field_definition` (T29) | 1 atomic | atomic + nano | Definition + test-charge-limit are two ideas |
| `capacitor_basics`, `lens_formula` | atomic | split (stage-4 d carry-over) | Already flagged "too coarse" Session 50 |
| `antenna_range_formula` | atomic | merge into space_wave (stage-4 d carry-over) | Already flagged "too fine" |
| `complex_capacitor_network_methods` (T31) | 1 atomic | 2 atomics | Symmetry method and infinite-ladder method are two distinct teachable strategies |

None of these blocks the Top-20 queue except #1 (which the queue *adopts* as reclassified).

---

## 4. C — Misconception chains (the highest-leverage ordering signal)

A wrong belief uncorrected upstream silently corrupts every downstream sim. These chains say:
**the upstream sim must kill the belief before the downstream sim is built.** (Killing = Rule 16a
predict→reveal inside EPIC-L.) Sources: cognitive-error-prevention-index (115 decisions, 5 modal
patterns) + chapter pathway annotations.

| # | Wrong belief | Born in | Corrupts downstream | Killed by queue item |
|---|---|---|---|---|
| M1 | "Force causes velocity" (F=mv) | T11 | ALL of dynamics, momentum, SHM, charge-in-field | #10 newton_second_law |
| M2 | "Action–reaction cancel" | T11 | T14 momentum conservation → T27 KT pressure | #11 newton_third_law |
| M3 | Sign-convention errors (**~30% of ALL catalogued errors**) | T6 | T41/42 mirror-lens signs, T35 Lenz sign, circuits polarity | T6 built (`sign_convention`); re-anchored in #16 lenz_law |
| M4 | "Centripetal is an extra force" | T9/T10 | T16 orbits, banking, T36 charge circular motion | #4 centripetal_acceleration + later `centripetal_force_source_identification` |
| M5 | "Magnetic force does work" | T36 | T37 dipole energy, T35 induction energy accounting | #3 perpendicular_no_work |
| M6 | "Two right-hand rules, which one?" | T36 | every cross-product downstream (τ, L, Poynting) | #2 RHR (reclassified atomic) |
| M7 | "Lenz sign is memorised" | T35 | T39 AC phase reasoning | #16 lenz_law (energy-conservation derivation) |
| M8 | "Particle travels with the wave" | T19/T21 | T22 standing-wave energy, T23 sound | next tranche (transverse_vs_longitudinal 💎, travelling_wave 💎) |
| M9 | "Friction always opposes motion" | T12 | T15 rolling, walking/driving intuition | built (`friction_static_kinetic`) — verify the beat exists on next touch |
| M10 | "Work = F×d always / work always positive" | T13 | PE, fields, thermodynamic work signs | #18–19 |
| M11 | "Field lines are physical objects" | T29/T30 | every field chapter (T31, T35, T36, T38) | T36 builds re-anchor; properly killed when T29/T30 open (post-queue) |

---

## 5. D — Build priority queue (next ~20, in build order)

**Scoring (all inputs shown; reviewable):**
- **F** = transitive descendants (computed, §2.2) — foundational-ness
- **E** = exam weight 1–5 — source: public JEE Main/NEET chapter-weight analyses (E38 PYQ Ingester
  not built yet; `pyq_questions` not used). FLAG: re-score when E38 ships.
- **M** = misconception-kill value 1–5 (cognitive-error index §4)
- **A** = archetype unlock 1–5 (does it force a new visual capability that many siblings reuse — content-pull, Rule/Learning-Model meaning 1)
- **C** = beachhead/chapter-completion value 1–5 (finishing a chapter = a complete teacher-GTM demo + a coherent professor-pool packet)
- **Total = F/30 + E + M + A + C** (F normalised so ~270 desc ≈ 9 pts; equal-ish weighting, deliberately simple)

### Tranche 1 — finish the magnetism beachhead (T36; archetypes proven; contributor program already reviewing here)

| # | Concept (catalog id) | F | E | M | A | C | Total | Why now |
|---|---|---|---|---|---|---|---|---|
| 1 | magnetic_field_concept_B | 73 | 4 | 4 | 1 | 5 | 16.4 | Unbuilt ROOT of our own beachhead; "B is E in disguise" framing; reuses field-viz archetype |
| 2 | magnetic_force_direction_right_hand_rule (**nano→atomic**, §3) | ~51 | 5 | 5 | 4 | 5 | 20.7 | Diamond #1 in the T36 classification doc; unlocks the 3D RHR/cross-product archetype reused by τ, L, Poynting (~9 cross-product edges, stage-4 h) |
| 3 | magnetic_force_perpendicular_no_work_done | ~30 | 4 | 5 | 2 | 5 | 17.0 | Kills M5 before T35/T37 are built; energy-readout overlay |
| 4 | centripetal_acceleration_kinematic (T9 insert) | ~40 | 4 | 5 | 3 | 2 | 15.3 | **Prereq for #5/#6** (kills M4); 8 unlocks into T10; 💎 |
| 5 | circular_motion_charge_in_uniform_B | ~25 | 5 | 4 | 2 | 5 | 16.8 | F=qvB becomes centripetal — the visual where #3+#4 fuse; exam staple |
| 6 | cyclotron_period_independent_of_speed | ~15 | 3 | 5 | 2 | 5 | 15.5 | The re-sync aha; dual-particle race archetype |
| 7 | amperes_circuital_law | ~20 | 4 | 3 | 5 | 5 | 17.7 | **First derivation_led concept — exercises the Session-66 Addendum-12 derivation whiteboard**; re-derives the built solenoid |
| 8 | current_loop_acts_as_dipole_far_field | ~18 | 3 | 3 | 3 | 5 | 14.6 | Closes the T36 diamond list; bridges to T37 (whose root has 7 dependents) |

→ After #8: T36 is a **complete diamond chapter** (13 sims incl. the 5 built) — the teacher-GTM demo object and the professor-pool's first full-chapter packet set.

### Tranche 2 — the Newton spine (T11; the two biggest foundational nodes in the entire catalog)

| # | Concept | F | E | M | A | C | Total | Why |
|---|---|---|---|---|---|---|---|---|
| 9 | newton_first_law | 269 | 4 | 4 | 1 | 3 | 21.0 | Catalog's #1 by descendants |
| 10 | newton_second_law 💎 | 266 | 5 | 5 | 3 | 3 | 24.9 | Catalog's #1 direct hub (27); kills M1; T11 = 47% misconception density |
| 11 | newton_third_law | 70 | 4 | 5 | 3 | 3 | 17.3 | Kills M2 → protects future T14/T27 |
| 12 | block_on_incline 💎 | ~20 | 5 | 3 | 2 | 4 | 14.7 | Most-tested mechanics setup; reuses built `inclined_plane_components` + `friction_static_kinetic` |
| 13 | connected_bodies 💎 | ~25 | 5 | 3 | 4 | 4 | 16.8 | Unlocks multi-body-constraint archetype (pulleys/Atwood everywhere) |

(`normal_force`, `tension_force`, `gravity_force`, `free_body_diagram` map to built JSONs via D2 aliases — verify coverage on next touch rather than rebuild.)

### Tranche 3 — EM induction arc (T35; second E&M beachhead; entry = built solenoid; 4 💎)

| # | Concept | F | E | M | A | C | Total | Why |
|---|---|---|---|---|---|---|---|---|
| 14 | magnetic_flux_definition | 94 | 4 | 3 | 3 | 4 | 17.1 | Biggest E&M upstream node; flux-surface-counting visual |
| 15 | faradays_law 💎 | 87 | 5 | 4 | 3 | 4 | 18.9 | 13 direct dependents; the chapter's spine |
| 16 | lenz_law 💎 | ~40 | 5 | 5 | 2 | 4 | 17.3 | Sign from energy conservation, not memorisation (kills M7, re-anchors M3); derivation_led |
| 17 | motional_emf 💎 | ~25 | 4 | 3 | 2 | 4 | 13.8 | Rod-on-rails; mechanical→electrical energy beat |

### Tranche 4 — energy spine opener (T13; bridges mechanics ↔ thermo ↔ E&M)

| # | Concept | F | E | M | A | C | Total | Why |
|---|---|---|---|---|---|---|---|---|
| 18 | work_done_by_constant_force | 56 | 4 | 4 | 2 | 2 | 13.9 | T13 root; needs `dot_product` — built ✓ |
| 19 | positive_negative_zero_work | ~30 | 4 | 5 | 2 | 2 | 14.0 | Kills M10 (sign-pattern, the 30% modal error class) |
| 20 | work_energy_theorem_single_particle | ~45 | 5 | 4 | 4 | 2 | 16.5 | 10 dangling refs point at it (most-wanted unbuilt by the catalog itself); unlocks the energy-bar-chart accounting archetype reused by T16/T26/T35 |

**Next tranche (21–25, noted, unscored):** conservation_of_mechanical_energy ·
centripetal_force_source_identification (T10) · shm_definition_force_minus_kx (T17 root, 9 direct) ·
transverse_vs_longitudinal 💎 + travelling_wave_function 💎 (T19 — tiny chapter, unlocks the whole
waves cluster and kills M8) · centre_of_mass 💎 (T14 root, 8 direct).

**Pace note:** at the current professor-gated pace (~1/week effective), Top-20 ≈ 4–5 months.
Tranche 1 (8 sims) is the 6-week goal: it converts the existing beachhead + contributor pipeline
into a finished, demonstrable chapter.

---

## 6. E — Archetype coverage (engine capability in content-pull order)

| Archetype | Status | Queue items pulling it |
|---|---|---|
| A. Field-viz (2D/3D field maps) | ✅ proven (magnetic_field_wire, solenoid) | #1, #14 reuse |
| B. Force-in-field particle dynamics | ✅ proven (magnetic_force_moving_charge) | #5, #6, #10 reuse |
| C. Dipole-in-field | ✅ proven (torque_on_current_loop) | #8 reuses |
| Graphs (x-t/v-t/a-t) | ✅ proven (built T6 graph sims) | #4 reuses (rotating vectors + graph) |
| **NEW: 3D cross-product / RHR hand mesh** | ❌ | **#2** (then reused by τ, L, and every cross-product sibling — ~9 catalogued cross-product edges) |
| **NEW: derivation whiteboard** (`derivation_steps[]`, Session-66 Addendum 12) | ❌ (board-mode engine exists, reuse path defined) | **#7**, #16, #20 |
| **NEW: multi-body constraint (pulleys/connected FBDs)** | ❌ (single-body FBD built) | **#13**, #12 |
| **NEW: energy-accounting bar chart** | ❌ | **#20**, #3, #16, #18–19 |
| **NEW: dual-object race/compare** | partial (two_projectile sims) | #6 |

Every new archetype is pulled by ≥2 queue items — no speculative engine work (Learning-Model
meaning 1, content-pull discipline). **Engine risk flag:** deterministic visual gates currently
cover 2D PCPL only; #2 (3D RHR) will need the visual-validator dense-frame path extended or a
manual-eye-only gate declared for 3D states.

---

## 7. Adversarial self-check (and what it changed)

**(i) Founder-with-no-students lens:**
- *"Newton's laws are the most crowded content market — where's the moat?"* → Accepted: the queue
  front-loads **finishing T36** (where archetypes, the contributor program, and the Asmi packet
  pipeline already point) before opening the Newton spine. A complete diamond chapter is a sales
  object; 20 scattered sims are not. This re-ordered the original score-sorted list (raw scores
  would put #10 first).
- *"Why insert a T9 concept (#4) mid-magnetism?"* → Because #5/#6 are pedagogically broken without
  centripetal acceleration, and it kills M4 for three future chapters. One insert, three payoffs.
- *"4–5 months for 20 sims — too slow?"* → The SPEED doctrine (Session 66) applies *within* each
  item: release to professor pool fast, iterate from packets. The queue is an ordering, not a
  promise of polish-before-next.

**(ii) Student-learning-the-chapter lens:**
- Every queue item's prerequisites are either built (vectors, kinematics, FBD, friction) or appear
  earlier in the queue (flux→Faraday→Lenz; N2 before work-energy; centripetal before charge
  circles). Two advisory-only gaps remain, both acceptable under Rule 23: #4 assumes angular
  variables (T9 root, unbuilt — the sim carries a 1-state recap); #1 ideally follows T30
  electrostatics (unbuilt — the "B is like E" framing degrades gracefully to "B is a field" if the
  student lacks E).
- *"T19 waves unlock the densest misconception cluster (41%) — why are they outside the Top-20?"*
  → Genuine cost. Rationale: waves have zero built adjacency and zero archetype overlap with the
  current engine surface (oscillation rendering is a new family), while T35 compounds directly on
  built magnetism. T19 leads the next tranche.

---

## 8. Founder decision list

1. Approve/modify the Top-20 queue (§5) — especially the T36-first sequencing.
2. Approve the 7 cycle breaks (§2.3) — catalog edits, one sweep.
3. Approve D1 (retroactive T5 vectors catalog page) and D2 (alias mapping column).
4. Approve the §3 reclassifications (minimum: RHR nano→atomic, needed by queue item #2).
5. Verify-flag: T50 Communication Systems vs current NCERT/JEE syllabus.
6. Note: exam-weight scores are from public exam analyses until E38 (PYQ Ingester) ships — re-score then.

---

### §8 RESOLUTION (Batch 1 applied 2026-06-13, scope = "core now, rest staged")

| Item | Status | What was done |
|---|---|---|
| **D1 — T5 Vectors page** | ✅ DONE | Authored `docs/catalog/pilot-topic-5-vectors.md` (14 atomic + 5 nano; ids verbatim). **Marked OLD ARCHITECTURE / set aside — `In repo? = —` throughout, NOT shipped product** (per the BUILT CORRECTION box at top). Rebuild resolves the bare `vector_resolution` references (22×) that were dangling. Chapter export `chapter-05-vectors.md` generated (catalog now 45 chapters). |
| **D4 / §2.3 — 7 cycle breaks** | ✅ DONE | One Requires-cell edit each in T14, T17, T25, T39, T46(×2), T50. Rebuild confirms **"Chapters with circular prerequisites: none"** (was 7); global SCC check = 0. T25 broken in the correct direction (specific-heat is fundamental; calorimetry uses it). |
| **D7 — transformer de-dup** | ✅ DONE | T39 `transformer_in_ac_atomic` re-scoped to the AC extension (now depends on T35 `transformer_atomic`, no longer restates the turn-ratio principle). Kept as a thin atomic — NOT demoted to nano, because it owns 3 child nanos (demotion → nano-under-nano). Non-destructive. |
| **D8 — T12 rename** | ✅ DONE | `friction_drives_motion_misconception` → `static_friction_drives_motion` (teaches the positive concept; wrong belief is its Rule-16a opening beat). Single source edit; code `A26` references auto-resolve; no built JSON / src code used the id. |
| **§3 RHR + dipole reclassification** | ✅ NO EDIT NEEDED | Both already correct in SOURCE: `magnetic_force_direction_right_hand_rule` is already `atomic` in `pilot-topic-36`; `electric_dipole_definition` is already split into atomic + 3 nanos. The proposal flagged them off a STALE export — the rebuild refreshed them. (Real residual T5 gap: `vector_cross_product` is unbuilt — recommended next T5 atomic, unblocks queue item #2.) |
| **§8.5 — T50 syllabus** | ✅ NOTED | **Communication Systems was dropped from the rationalised NCERT Class-12 syllabus and is off-syllabus for JEE Main / NEET** (per knowledge through Jan 2026). Action: T50 parked at the very bottom of the build queue; **verify against the official 2026 syllabus PDF before any T50 build.** No catalog deletion. |
| **Build mechanics** | ✅ DONE | Added `npm run build:catalog` (extract + 3 builders). Regenerated CSV / chapter MD / diamonds one-pager. |
| **D2 full + D3 full** | ⏸ STAGED (next pass) | Full "Built in repo?" reconciliation for the ~48 kinematics/forces sims, and the full ~243-unresolved-reference normalization (incl. the 9× `vector_resolution_atomic` suffix-variant refs), deferred per the chosen scope. |
