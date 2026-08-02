# Ch.6 Work, Energy & Power — Phase-0 survey (0a)

> Founder-approved 2026-08-01: 12-concept V1 spine · extend `newtons_laws_body` (do NOT build a new
> scenario) · start immediately.
> Source catalog: `docs/catalog/pilot-topic-13-work-energy-power.md` (33 atomics, founder decisions
> WE-G1…WE-G6 applied 2026-05-25).

## The 0a question: does an existing scenario family stretch?

**YES — `newtons_laws_body` carries the entire apparatus.** It already serves 10 shipped concepts
and provides, as pure JSON config, everything this chapter's mechanics needs:

| Chapter need | `newtons_laws_body` support | Status |
|---|---|---|
| Block on flat ground OR incline | `surface.theta_deg` (0 = flat, SAME code path) | ✅ exists |
| Mass, initial velocity/position | `bodies[].mass_kg / initial_velocity_mps / initial_position_m` | ✅ exists |
| Static + kinetic friction | `bodies[].mu_s / mu_k`, `surface.frictionless` | ✅ exists |
| Applied force | `bodies[].applied_force_N` | ✅ exists |
| **Spring** | `nlbSpring*` geometry + phase machine (built for `newton_third_law` push-off) | ✅ exists |
| Two bodies / pulley / Atwood | `bodies[]` ×2 + `pulley{}` | ✅ exists |
| Force arrows + component resolution | `arrows[].show`, `show_components` | ✅ exists |
| Live numeric readouts | `readouts: N f a v T F_net F_applied` | ✅ exists |
| Per-state sliders (Rule 31) | `controls_visible` | ✅ exists |
| Guided monotonic reveal / sandbox | `param_ramp`, `idle_auto_sweep`, `trusted_drag_seizes` | ✅ exists |
| Real fixed-step integrator w/ friction | Branch A / Branch B, semi-implicit Euler | ✅ exists |

## The gap — the ONLY thing 0c must build

Searched the whole renderer (57,711 lines): **no energy accounting exists anywhere in `field_3d`.**
Zero hits for energy bars, K/U/E tracking, work accumulation, or a `U(x)` curve.

**The gap is an ENERGY LAYER over the existing mechanics — not a new scenario.**

### Union of energy needs across the approved 12 concepts

| Need | Concepts requiring it |
|---|---|
| **`K` bar** — live ½mv², updates as the body moves | 3, 4, 9, 10 |
| **`U_grav` bar** — mgh, with an authored zero-reference line | 7, 9, 10 |
| **`U_spring` bar** — ½kx² | 8, 9 |
| **`E_total` bar** — sum; visibly CONSTANT when only conservative forces act | 9 |
| **`E_dissipated` bar** — the friction sink; makes "where did it go?" visible | 10 |
| **`W` accumulator** — running ∫F·ds for a named force, with SIGN | 1, 2, 4, 11, 12 |
| **cos θ decomposition** — F, d, and the angle between them, shown geometrically | 1, 2 |
| **Round-trip work test** — out-and-back path, W summed over the closed loop | 5 |
| **`P` readout** — instantaneous F·v, and average W/Δt | 11, 12 |
| **ΔU = −W_c coupling** — the two must be shown as the same quantity | 6 |

### Explicitly OUT of scope for this Phase 0 (do not build)

- `U(x)` **graph panel** — the potential-energy-curve group (F = −dU/dx, curve reading, equilibrium
  classification). Deferred with the concepts that need it; a later, separate Phase 0.
- **Pendulum**, **vertical loop**, **walking stride**, **hanging chain** — different apparatus,
  different chapter batch.

## The approved 12, in teaching order

| # | concept_id | Engine need beyond what exists |
|---|---|---|
| 1 | `work_done_by_constant_force` | W accumulator, cos θ decomposition |
| 2 | `positive_negative_zero_work` | W sign (same accumulator, three angles) |
| 3 | `kinetic_energy_definition` | K bar |
| 4 | `work_energy_theorem` | W accumulator + K bar (before/after) |
| 5 | `conservative_vs_nonconservative_forces` | round-trip W over a closed path |
| 6 | `potential_energy_definition` | ΔU = −W_c coupling |
| 7 | `gravitational_potential_energy` | U_grav bar + zero-reference line |
| 8 | `elastic_potential_energy_spring` | U_spring bar |
| 9 | `conservation_of_mechanical_energy` | **all bars at once** — the 0b spec driver |
| 10 | `mechanical_energy_loss_with_friction` | E_dissipated bar |
| 11 | `instantaneous_power` | P = F·v readout |
| 12 | `average_power` | P_av = W/Δt readout |

## 0b — deepest concept

**`conservation_of_mechanical_energy` (#9).** It is the only concept that exercises K, U_grav,
U_spring and E_total simultaneously, on a moving body, with the "total bar stays flat" claim as its
PRIMARY aha. Its physics block is therefore the engine's real spec. #10 adds exactly one term
(`E_dissipated`), so 0c builds against the union table above, not against #9 alone.

## SUCCESS TEST (Phase-0 alarm rule)

Concepts 1–12 must require **ZERO further renderer edits** after 0c lands. A later concept forcing
an engine change means this survey under-generalized → STOP and re-scope with the surgeon; never
extend the engine per concept (that is how Ch.7 reached ~1,296M tokens for 6 concepts).

## ⚠ Rule 35 conflict in the source catalog — architect MUST re-author anchors

The catalog predates **Rule 35 (founder, 2026-07-10: no country-specific culture in any sim)** and
its mined anchors are explicitly India-specific — a railway-station porter, PM Suryaghar rooftop
solar, a Manali/Gulmarg chairlift, ISRO launch casings, "Indian monsoon raindrop". **The physics in
those examples is sound; the cultural framing is not importable.** Author universal equivalents
(a suitcase lifted onto a shelf, a crate on a loading ramp, a spring-loaded door closer). NCERT
remains the syllabus backbone; its Indian examples are NOT imported (CLAUDE.md §5).
