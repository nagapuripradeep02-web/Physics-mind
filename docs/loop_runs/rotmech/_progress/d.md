# Desk D — progress log (`rotational_kinematics` · `tau_eq_i_alpha`)

Per `_progress/README.md`: this desk writes here, never to `PROGRESS.md`.

---

## 2026-08-04 — wave 1 (0b design pass), session 1

**Scope:** design documentation only. No concept JSON authored for either concept, deliberately —
both are engine-blocked on 0c-3 (desk contract, `docs/loop_runs/rotmech_d_state.md`). No file
under `src/` touched.

### Done

- **Engine audit of the frozen 0c-1 `rigid_body_rotation` surface**, read against
  `field_3d_renderer.ts:939–1060` (contract) and `:49737–50700` (implementation).
- **`docs/loop_runs/rotmech/_engine/findings_d.md` — PASS 1 filed**, ahead of the skeletons, so
  0c-3's scope cannot freeze without Desk D's input. Six findings, prioritised. The two that
  block both concepts outright:
  1. **No torque source can increase |L|.** `rbrLAt` (`:49937`) subtracts unconditionally and
     clamps at 0, for `applied_torque` exactly as for `brake`. A constant torque on a body at rest
     leaves it dead: `L0 = 0`, ω = 0, θ never advances. **α is not producible at any authored
     value.** This is a physics gap, and it is larger than the desk state file's "α has nowhere to
     print" — recorded there as a correction.
  2. **`RBR_RO_META` (`:50147`) has no `theta` and no `alpha` row**, and the skip is silent
     (`if (!meta) continue`). Confirmed worse than recorded: **`field_3d_config` is not modelled
     in `src/schemas/` at all**, so there is no Zod enum for an unknown token to fail against.
     Asked Desk E for a one-line `console.warn` on unknown tokens alongside the rows — that
     warning protects every future rbr concept, not just these two.
- Correction filed on `theta0_rad`: it is **not** inert. It is read (`:50499`) and seeds the θ
  integrator (`rbrThetaReset`, `:49967`). It is **wired but unobservable** — no angular reference
  exists on screen, and the symmetric two-mass rod's π-symmetry makes θ₀ and θ₀ + π
  pixel-identical. Needs a base reference line + an asymmetric body mark, not an integrator.
- Also filed: no tangential `v = ωr` arrow (blocks concept #4's stated payload, shared with
  concept #3); θ/α absent from `reference_marks[].surface` and from `controls_visible`, so neither
  concept can author a Rule-31-legal explore state; no graph surface in rbr, so the survey's
  "θ(t)/ω(t) graph panel already exists" pricing for #4's advanced ring is misleading for **this**
  scenario.
- **`architect` dispatched for both concepts** (`tau_eq_i_alpha`, `rotational_kinematics`),
  against the `conservation_of_angular_momentum` REV-4 exemplar and the binding
  `APPARATUS_CONTRACT.md`. Briefed to design the sim each concept deserves rather than around
  today's limits, and to mark every requirement `[LIVE]` (with file:line) or `[NEEDS-0c-3]`.

### Next

1. founder-proxy **Checkpoint A** on each skeleton; fix cycles as routed (max 2).
2. `physics-author` block for each, on the `DESIGN_OK` skeleton.
3. **`findings_d.md` PASS 2** — exact readout tokens/units/dp, reference marks, control-table
   demands, any `APPARATUS_CONTRACT` deviation (a start from rest at ω₀ = 0 is the likely ask for
   both, and is an office decision, never a local one), and the ruling on a second body for the
   "same τ, double I" comparison.
4. **No concept JSON until 0c-3 merges and this desk syncs.**

### Open, needs a founder ruling

`torque` (#5) and `moment_of_inertia` (#6) precede `tau_eq_i_alpha` in the approved teaching order
and are not in this wave, so its `prerequisites` array will name ids with no concept JSON. Raised
at Checkpoint A per the desk contract, not deferred to seal.

### Notes for whoever picks this desk up

- Desk E's worktree is `C:\Tutor\physics-mind-rotmech-0c3`. `findings_d.md` is committed on
  `feat/rotmech-d` **but not pushed** — until it is, Desk E must read it by absolute path from
  this worktree.
