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

### Checkpoint A — both concepts `DESIGN_FIX` (cycle 1 of 2)

Reports: `<id>/founder_proxy_A.md`. Both gates independently found the SAME dominating problem:
**the two skeletons forked on the engine semantics they share**, and both marked the scar
`two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field` as
discharged. It was discharged by neither. Desk E freezes 0c-3 scope from these documents, so the
fork would have become two incompatible engine surfaces. **Running both concepts on one desk is
what caught this** — on separate desks nothing would have.

Reconciled by the orchestrating session and handed to both fix cycles verbatim:
1. **α = the per-step finite difference of ω**, from the same post-step snapshot, blanked across
   re-pins. (`rotational_kinematics` had specified analytic τ/I; its own gate ruled the finite
   difference honest, and it keeps τ out of a concept that must not use it.)
2. **ONE motor drive wheel** that translates in, contact = engage, with the rim force arrow
   layered on it. (`tau_eq_i_alpha`'s floating tangential arrow dropped — it also drew a force
   0.7 s before τ engaged, at four states.)
3. **Signed-torque semantics live in `_engine/findings_d.md` §1**, consumed BY REFERENCE by both.
   Each skeleton had claimed to be the definition site while telling the other to consume.
4. **One ω₀ floor request** — lower to 0 at BOTH sites (`:49999` min and the `:50075` write
   guard), explore-state only.

Also caught: `tau_eq_i_alpha` S6 taught that an opposing torque never reverses a spin. That is a
property of **friction**, not of an opposing torque; CoAM's S5 carries the qualifier and the
mirroring dropped it. Routed P1.

### BLOCKED — fix cycle 1 died on an API auth error, not on the work

Both `alex:architect` fix-cycle dispatches terminated mid-write:
**"Your organization has disabled Claude subscription access for Claude Code — use an Anthropic
API key instead, or ask your admin to enable access."** Nothing agent-side to debug.

Desk state after cleanup:
- `<id>/skeleton.md` — **restored to the committed REV 1** for both concepts. Known-good, gated,
  `DESIGN_FIX` verdict attached. This is the live document.
- `<id>/skeleton_rev2_partial.md` — the abandoned rewrites, **preserved with a blocking warning
  header**. `rotational_kinematics` is truncated before a SCAR AUDIT its own status block claims
  to contain; `tau_eq_i_alpha` is half-patched (REV-2 header, REV-1 handoff) **and still carries
  the P1-4 physics error** — "frictional" appears nowhere in it. Neither may be read as REV 2 or
  fed to an agent or to Desk E.
- `<id>/skeleton_rev1.md` — the architects' history copies, identical to committed REV 1.
- `_fixtable.tmp` — removed.

**`findings_d.md` is unaffected and remains valid** — every entry in it was verified against
renderer code by this session, not taken from a skeleton. Desk E can freeze scope from it today.

### Next

1. **Restore API access, then re-run fix cycle 1 from REV 1 for both concepts** — the shared
   contract text is in this log above and in the two gate reports; the partials are reference
   material for the re-run, never its input.
2. founder-proxy Checkpoint A cycle 2 on each revised skeleton.
3. `physics-author` block for each, on the `DESIGN_OK` skeleton.
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

- Desk E's worktree is `C:\Tutor\physics-mind-rotmech-0c3`. `findings_d.md` is committed AND
  pushed to `origin/feat/rotmech-d` (the post-commit auto-push hook is live in this worktree), so
  Desk E can reach it with `git fetch origin feat/rotmech-d` — no absolute-path read needed.
