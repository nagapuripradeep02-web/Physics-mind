# T36 — Moving Charges & Magnetism — Diamond Classification (PILOT)

> **Read this first.** Every one of the 77 concepts below **still becomes a simulation** with TTS narration — that is the product, and nothing here is "dropped." This document only sorts them into **effort tiers**: which sims get bespoke, hand-crafted, highest-polish treatment (Signature / Diamond) vs which are solid template-built sims (Standard). It answers *"where do we spend our best craft first,"* not *"which concepts get a sim."*

## How each concept was judged (the rubric you approved)
A simulation is **diamond** when the student understands *because they watched it move*, not because the TTS told them. Scored on four criteria:
1. **Dynamic insight** — motion/transformation over time is essential (not a static labelled diagram).
2. **Misconception break** — confronts a specific documented wrong belief.
3. **Spatial / directional** — 3D arrangement, vectors, cross-products, handedness.
4. **Leverage** — exam-critical and/or many concepts depend on it.

- **Signature** = hits all 4 + is a chapter-defining "wow" demo (the archetype exemplar). ~1 per visual archetype.
- **Diamond** = strong dynamic insight + at least one other criterion. Bespoke build.
- **Standard sim** = still a full sim + TTS, but the visual *supports* a mostly-verbal point (a formula, a special case, a definition, a derivation step). Template-built is fine.

**Grounding sources used:** the T36 Stage-2 catalogue (PRIMARY-aha + CRITICAL-EPIC-C + Sim? + Indian-anchor flags per concept), `docs/patterns/magnetism.md` (the 4 visual archetypes + the 3 built seed-diamonds), `MAGNETISM_ARCHITECTURE.md`, and the 4 shipped JSONs. The catalogue's own archetype map (A field-viz / B force-in-field / C dipole-in-field / D atomic) is the spine of the diamond picks — concepts that map to an active visual archetype are exactly the diamond-eligible ones.

---

## Result at a glance

| | Signature | Diamond | Standard sim | Total |
|---|---:|---:|---:|---:|
| **Atomic** | 3 | 18 | 13 | 34 |
| **Nano** | 0 | 2 | 41 | 43 |
| **Total** | **3** | **20** | **54** | **77** |

→ **23 of 77 (≈30%) are diamond-tier.** This is the *highest* diamond density you will see in any chapter — T36 is the most visual topic in all of physics (3D fields, moving charges, cross-products, handedness). Mechanics and modern-physics chapters will land far lower (rough expectation: 4–8 diamond-tier per chapter). Treat T36 as the ceiling, not the average.

---

## ⭐ The 3 SIGNATURE simulations (the chapter's showcase — one per visual archetype)

These are the demo sims. Build to absolute highest fidelity; they define the product.

| ID | Concept | Archetype | Why it's signature |
|---|---|---|---|
| **A3** `lorentz_magnetic_force_F_equals_qv_cross_B` | Force F = qv×B on a moving charge | **B (force-in-field)** | The archetype-B exemplar (shipped as `magnetic_force_moving_charge`). Particle deflecting in a 3D B-grid + the bespoke 3D right-hand mesh = the chapter's defining "wow." All four criteria, max leverage (A4, A5, A6, A7, A15, A34 all build on it). |
| **A21** `magnetic_field_long_straight_wire_B=μ₀I/2πr` | B-field circling a current wire | **A (field-viz)** | The archetype-A exemplar (shipped as `magnetic_field_wire`, Diamond #1). Field lines curling in 3D + compass-approach-then-deflect choreography. The founding field-visualisation. |
| **A30** `torque_on_current_loop_τ=m×B` | Torque rotating a current loop | **C (dipole-in-field)** | The archetype-C exemplar (`torque_on_current_loop_in_field`, Diamond #3). ΣF=0 **but** τ≠0 → loop visibly rotates. The seed of motors & galvanometers. |

---

## 💎 The 18 DIAMOND atomics (bespoke build, highest polish)

| ID | Concept | Archetype | The "aha" the motion creates | Breaks misconception |
|---|---|---|---|---|
| **A1** `magnetic_field_concept_B` | B is a vector field around currents | A | Field exists in 3D space, separate from E (PRIMARY aha) | "magnetism is just E in disguise" |
| **A2** `oersted_experiment` | Current deflects a compass | A | The founding moment: switch on current → needle swings. Electricity *is* magnetism | "electricity and magnetism are unrelated" |
| **A4** `magnetic_force_direction_RHR` | Right-hand rule for F=qv×B | B | The 3D hand mesh shows handedness words can't | confusing the two right-hand rules |
| **A5** `magnetic_force_⊥v_no_work` | F⊥v → KE constant, speed never changes | B | Particle circles forever at constant speed (**CRITICAL EPIC-C**) | "a force must do work / speed it up" |
| **A7** `circular_motion_charge_in_B` | v⊥B → circular path | B | F=qvB becomes the centripetal force; the circle emerges | — |
| **A10** `cyclotron_period_independent_of_v` | T = 2πm/qB, independent of speed | B/other | Two particles, different speeds, **same period** — they re-sync (**CRITICAL EPIC-C**) | "faster particle takes longer to circle" |
| **A11** `helical_motion` | v at angle → helix | B | The 3D helix winding along B; aurora anchor | — |
| **A13** `velocity_selector_v=E/B` | Crossed E & B select one speed | B | Only the matched-velocity particle flies straight; others deflect | — |
| **A14** `cyclotron_device` | Spiral acceleration between dees | B/other | Particle spirals outward, gaining energy each pass (**Indian anchor: Accelerators in India / Saha Institute**) | — |
| **A15** `force_on_current_wire_F=IL×B` | Current wire jumps in a field | B | The motor effect — the wire physically deflects | — |
| **A17** `closed_loop_net_force_zero` | Loop in uniform B: ΣF=0, but τ≠0 | C | Loop rotates without translating | "a loop in a field gets pushed/pulled" |
| **A18** `force_between_parallel_currents` | Parallel currents attract | A/B | Two wires pull together — **opposite** of like-charges-repel (**CRITICAL EPIC-C**, Indian anchor: Roget's spiral) | "like things always repel" |
| **A20** `biot_savart_law` | Field built from current elements | A | Each dl contributes a dB ⊥ to it; field assembles from pieces | vs Coulomb (sin θ direction-dependence) |
| **A26** `amperes_circuital_law` | ∮B·dL = μ₀I_enc | A | Symmetry + an Ampèrian loop give B with no integration (Maxwell antecedent) | — |
| **A27** `solenoid_field_B=μ₀nI` | Uniform field inside a coil | A | Dense parallel field inside, ~zero outside (**Indian anchor: MRI**). Built: `magnetic_field_solenoid` | "field is strongest at the wires" |
| **A29** `magnetic_dipole_moment_m=NIA` | A loop is a magnetic dipole vector | C | The m-vector pops out of the loop via RHR; gateway to all magnetism | — |
| **A31** `current_loop_acts_as_dipole` | Loop field ≡ dipole field; no monopoles | C | A loop's far-field *is* a bar magnet's — Ampère's hypothesis; bridges to Topic 37 | "magnets have separable N/S monopoles" |
| **A33** `revolving_electron_magnetic_moment` | An orbiting electron is a tiny magnet | D (deferred) | Why matter is magnetic at all: μ_l = −(e/2m)L | — |

## 💎 The 2 DIAMOND nanos (rare — nanos are usually sub-points, but these are visual ahas in their own right)

| ID | Parent | Concept | Why diamond |
|---|---|---|---|
| **N1.2** `B_field_visualisation_with_iron_filings` | A1 | Iron filings snap into concentric circles around a wire | The classic field-geometry *reveal* — catalogue itself flags "strong simulation visual." |
| **N11.2** `auroras_charged_particles_helix` | A11 | Solar particles spiral down Earth's field lines → aurora | Spectacular real-world payoff of helical motion (visible from N. India in big storms). |

---

## ◻️ The 54 Standard simulations (still built + narrated; visual is supportive)

These are real simulations — just template-built rather than bespoke. The visual illustrates a formula, special case, definition, or derivation step that the TTS mostly carries.

**Atomic (13):** `A6` F=0 when v∥B (special case), `A8` radius r=mv/qB (slider on A7's circle), `A9` period T=2πm/qB (formula), `A12` helix pitch (formula), `A16` curved-wire = straight-wire-endpoints (problem trick), `A19` ampere SI definition (⚠ definitional, hard to animate — catalogue flags this), `A22` RHR-around-wire (procedure inside A21), `A23` loop axial field (formula via integration), `A24` loop centre field (special case of A23), `A25` finite-wire field (specialised), `A28` toroid field (V2, niche; ITER anchor), `A32` dipole PE U=−m·B (formula), `A34` combined Lorentz F=q[E+v×B] (shown in action by A13).

**Nano (41):** all remaining sub-points — unit conversions (N1.1 tesla/gauss), notation (N4.3 ⊙/⊗), force-magnitude expression (N3.1), sign-flip (N3.3), Fleming's-rule mnemonic (N4.1), the various r∝√K / r∝√qV JEE patterns (N8.1–8.3), derivation steps (N15.1–2, N20.1–4, N26.1–3), the dipole sub-cases (N30.1–3, N31.1–3), parallel-current details (N18.1–3), etc. Each is one symbol/term/edge-case — correctly a 2-state nano, supportive of its parent diamond.

---

## What this pilot tells us about the whole project
- **Diamond ≠ coverage.** All 77 get built; 23 get bespoke craft. Same will hold for the other ~1,470 concepts.
- **T36 is the diamond ceiling (~30%)** because E&M is the most visual topic. The honest average across 44 chapters is lower — my earlier ~200–280 total-diamond estimate stands, with this chapter contributing an outsized ~23.
- **The catalogue's archetype map is the reusable diamond-detector.** Any concept that maps to an active visual archetype (field-viz / force-in-field / dipole-in-field / motion / counterintuitive-misconception) is diamond-eligible; formulas, special cases, unit definitions, and derivation steps are Standard. This rule can be applied chapter-by-chapter.

*Pilot generated 2026-05-31 from the T36 catalogue + magnetism patterns library. Awaiting your go/no-go before classifying the other 43 chapters.*
