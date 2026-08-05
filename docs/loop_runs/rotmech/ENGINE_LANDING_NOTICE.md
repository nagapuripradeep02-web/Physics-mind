# ⚠ ENGINE LANDING NOTICE — 0c-3 group 1 (E1–E4)

**From:** Desk E (`feat/rotmech-0c3`), sole engine owner for the Phase-0d run
**Status:** PR [#29](https://github.com/nagapuripradeep02-web/Physics-mind/pull/29) — OPEN, MERGEABLE, CLEAN, CI green, **awaiting founder merge**
**Head:** `bf7dac1` · **Read this the moment `desk:audit` shows you behind master.**

Four engine dispatches land together. **Shared rbr and nlb code has changed underneath work some
desks have already sealed.** This notice is the containment: what moved, what you must re-verify,
and what is newly authorable.

---

## §1 — MANDATORY on sync. This is desk contract guardrail 6, not a suggestion.

The moment you `npm run desk:sync` past this merge:

1. **Re-seed and re-EYE every concept you have already sealed**, and **diff against your OWN
   earlier frames** — not against a fresh baseline. Shared engine code changed under sealed work
   and nothing else catches that drift.
2. **Read the `Motion map:` line on every EYE run.** If it shows `?`, `[D5]` did not run — see §4.
3. **Re-seed before every EYE run, always.** The renderer changed, so a cached `sim_html` is
   stale. A stale seed silently re-tests the old engine: this desk hit exactly that and caught it
   only because the assembled `sim_html` byte count had not moved.

**An H2 diff you cannot explain is a FAIL, not a re-baseline.** Note that on this desk's canaries
a stable sub-0.35% H2 delta proved to be pre-existing baseline vintage, *demonstrated* by two
consecutive no-change runs reporting identical percentages. Use that method before concluding
anything: run twice with no change and compare.

---

## §2 — What changed, by subsystem

### `newtons_laws_body` / SEAM R — **Desk B**
- **E2 `nlb_rolling_branch_has_no_kinematic_gate`.** The rolling branch had only a *dynamic
  availability* gate; on flat ground `drive ≡ 0` made it vacuous, so `rollHeld` was true on frame 1
  for a sliding contact — no deceleration, no spin-up, no capture, a dishonest `f 0.00 N`. A real
  v–ω mismatch now falls through to the existing `_slipping` / `nlbRollSeg` closed-form capture.
  **Blast radius measured: 26 body-states × 300 frames on both clocks → 25 identical, 1 differing
  (the target). `rolling_on_incline` 17/17 identical**, including its μ_s `param_ramp` slip state.
- **E3 `nlb_seam_r_slider_tokens_declared_but_unwired`.** `R`, `R2`, `omega0` were in the enum but
  in neither `NLB_SLIDER_TOKENS` nor `NLB_SLIDER_SPEC`, and unknown tokens were dropped in
  silence. Now wired end to end; a radius write re-lifts, re-scales and re-spaces (marks move by
  exactly 2πR); unknown tokens now **warn**. **A/B: 11 concepts, 58 states, 94 bodies, 0
  differing.**
- **Two build-time geometry defects fixed as prerequisites:** a SEAM-G `wheel` was *drawn* at the
  constant `NLB_WHEEL_R` while its lift/spin radius already used `radius_m` — a wheel authoring
  `radius_m: 0.25` stood on a 0.25 m axle while drawn at 0.55 m, **sunk through the track before
  any slider existed**; and state apply never re-resolved drawn radius. Both are no-ops on master
  (no committed concept authors `radius_m`), but they change what happens the moment you do.

### `rigid_body_rotation` (rbr) — **Desks A, C, D**
- **E1 `rbr_formula_surface_has_no_timed_reveal`.** `formula_lines: [{ text, at_ms? }]` ported from
  the nlb scenario. **`formula_at_ms` was deliberately NOT built** — that name is already taken by
  the `pef` scenario meaning *whole overlay at one instant*.
- **E4 `rbr_torque_cannot_spin_a_body_up`.** `rbrLAt` subtracted unconditionally and `eng.tau` was
  `Math.abs()` at both config sites, so **no torque could increase |L|** — α was unreachable at any
  authored value and a rest-seeded body stayed dead forever. `rbrLAt` is now a breakpoint walk over
  per-source engaged windows. **The rest clamp is now a property of the `brake` *kind*, not of the
  integrator.** `sources[]` (drive-vs-brake tug) is in. `omega0` slider floor lowered to 0 at both
  sites. The `source` union now declares `'applied_torque'`, which was a live branch missing from
  its own enum.
  **`brake` byte-identical: 125,280 L samples + 125,280 θ samples, all `Object.is`-equal.**

### THE EYE (`deriveStateMeta.ts`) — **everyone**
The rbr motion branch is **amended in place** to declare motion from the torque as well as the
seed. Without it `[D5]` would have gone silent on exactly the rest-seeded states E4 enables.
`sources[]` engage/release instants are registered for reveal-pinning.

---

## §3 — Newly authorable (was silently dead before)

| You can now author | Desk | Was |
|---|---|---|
| `formula_lines: [{text, at_ms?}]` on an rbr state — term-by-term assembly | A, D | the whole equation flashed at t = 0 |
| signed `applied_torque_Nm`; `sources[]` with `kind: drive\|brake`; `omega0_rad_s: 0` + a slider that reaches 0 | D | α unreachable; rest-seeded body dead |
| `controls_visible` `R`, `R2`, `omega0` on nlb; live radius respace | B | token silently dropped |

**Contract note for `json_author`:** a state authoring **both** `formula` and `formula_lines`
renders **only the lines** — drop the string rather than leaving a misleading no-op.
Full `sources[]` shape is in `FROZEN_SCOPE_0c3.md` §B E4 and the E4 commit body (`bf7dac1`).

---

## §4 — Two traps that make a green run meaningless. Both are live.

1. **THE EYE's three dense-motion gates ALL pass on a scene that never moved.** `[D5]` abstains
   whenever `deriveMotionExpectations` returns `undefined` (no `newtons_laws_body` branch exists,
   deliberately); `[D7]` computes `stuck = tailFrozen && earlierMoved`, so a scene that never
   moved has `earlierMoved === false` and it reports the actively misleading *"OK — no frozen
   tail"*; `[D6]` needs a nonzero median to search at all. **Desk B measured two concepts at 35/35
   PASS whose frames are MD5-identical across t=0/5000/10000/frozen.**
   **Until this is fixed, `md5sum` your dense frames.** One hash across the series = a dead scene,
   whatever the headline says. Filed as `eye_dense_motion_gates_all_pass_by_construction_on_a_totally_static_scene`
   in `_engine/scar_candidates_0c3.sql` (CRITICAL, `peter_parker:visual_validator`, **not applied**).
2. **Your seed script probably disarms `[D5]` on rbr concepts.** The cloned exemplar writes
   `physics_config: { epic_l_path }` with `field_3d_config` **absent**, starving
   `deriveMotionExpectations`. Add it (this desk fixed both its canary seeds; Desk C fixed its
   own). **Caveat, because PASS 14 over-generalised:** this only restores `[D5]` for scenarios that
   *have* a motion branch — `rigid_body_rotation` does, `newtons_laws_body` and `coulombs_law_force`
   do not, and for those the `?` is by design.

---

## §5 — Verification partners. A dispatch is LANDED, not VERIFIED, until its partner confirms it.

Desk E's canaries are `newton_second_law` and `coulombs_law` — **neither exercises rbr**, so for
E1 and E4 they prove only *no collateral damage outside rbr*. This desk will never seed an rbr
concept: its checkout holds unmerged engine code, and seeding one would leave the desk that later
EYEs it silently testing code on no reviewed branch.

| Dispatch | Verifier | On |
|---|---|---|
| E2, E3 | **Desk B** | `pure_rolling`, `rolling_on_incline` |
| E1, E4, E5 | **Desk A** | `conservation_of_angular_momentum` — Desk D cannot verify its own blockers while blocked on them |
| E7 | **Desk C** | `angular_momentum` |
| E6, E8, E9 | **Desk D** once E4/E5 clear it | its two concepts |

**Please report back what you find** — to `_engine/findings_<desk>.md` as usual. A confirmation is
as valuable as a defect.

---

## §6 — ⚠ Desk B: one defect this merge does NOT fix, and it is yours

`pure_rolling` STATE_7 will **still read as broken** after you sync. The cause is **authoring, not
engine**: it authors `initial_position_m: 2.4` on a `surface.length_m: 3` track (bounds ±3) while
travelling in **+s**, leaving 0.6 m of runway — so it hits the bound at **~309 ms**, long before
the capture at `t_c` = 1361 ms. Probed with the authored numbers: `t=500 roll=0 v=0.0000
Rw=0.1307` — dead at the wall, spin barely started.

Every state of both your concepts authors `s0 = 2.4`. That is correct on the **incline** (gravity
drives −s, so 2.4 is the top) and backwards on the **flat** states, where motion is +s.
`pure_rolling` S1/S2/S3/S6/S7/S8 all launch forward from 2.4.

**Fix: `s0 = −2.4`, or a longer `length_m`. Owner `alex:json_author`, Desk B.**

Related, same desk: STATE_7 pins at 1500 ms while its only phase window closes at `until_ms: 1361`,
so the frozen frame is taken after the focal is handed back. Authoring-side — extend the window
past capture, or add a second phase ≥ 1500 ms. A `deriveStateMeta` change would move the pin for
the whole nlb fleet and is deliberately **not** taken.

---

## §7 — Still blocked after this merge

`rigid_body_rotation` (Desk C) and Desk D's two concepts remain blocked. Outstanding: **E5**
(θ/α/τ readout rows — the table is still the closed six and both loops still skip unknown tokens
in silence), **E6** (a one-shot `restart` with no `every_ms` still computes `NaN` and zeroes L for
the whole state), **E7** (the L arrow is still 15 px of ink inside the axle), **E8**, **E9**
(camera). See `_engine/FROZEN_SCOPE_0c3.md` §B.

**Desk C:** `angular_momentum`'s `every_ms: 99000` workaround must stay until **E6** lands, and its
authored `rbr_l_arrow` focal handoff stays correct-but-illegible until **E7**. Do not "fix" either
in the JSON — both are right as authored.
