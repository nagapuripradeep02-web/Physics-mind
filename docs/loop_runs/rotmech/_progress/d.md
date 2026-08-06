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

### Fix cycle 1 re-run + Checkpoint A cycle 2 — BOTH `DESIGN_OK`

API access was restored; both fix cycles re-ran successfully. **Write protocol changed after the
abort:** each architect wrote to a NEW `skeleton_rev2.md` and was forbidden to touch `skeleton.md`,
which the orchestrating session promoted only after verifying completeness itself (section list,
header claims vs body, 157/157 scar rows, and for `tau_eq_i_alpha` that the P1-4 physics fix was
genuinely present). The live document can no longer be left half-rewritten by an abort.

Both skeletons are now REV 2 at `skeleton.md`; REV 1 at `skeleton_rev1.md`; the aborted partials are
deleted and survive in history at `4aa2059`.

**Both cycle-2 gates confirmed the cross-skeleton fork is CLOSED** — all four reconciled items agree
by direct comparison, no fifth fork, the phantom-arrow beat gone from every state that carried it,
and no second actuator anywhere.

Notable outcomes:
- **`tau_eq_i_alpha` P1-4 (physics) fixed properly.** S6's brake contract restores the
  `frictional — opposes ω` qualifier; never-reversing is scoped to friction; driven reversal is named
  real but out of scope; §4's claim to "kill" that belief is deleted with a tombstone, because for a
  sustained driven opposing torque the belief is correct physics.
- **Carried P1 with an engine half → filed in findings_d §2:** `τ` must display the NET resolved
  torque, never the authored value, or S6's frozen pin archives `τ = −1.53` beside `α = 0.00` and
  `I = 3.06` — τ = Iα contradicted in the concept whose atomic claim it is.
- **Empty advanced ring RULED COMPLIANT** under Rule 38a (an empty set is trivially contiguous; the
  fleet already ships `friction_force` and `equilibrium_of_particles` with zero advanced states).
  Rider: if K6 is descoped, drop the advanced curriculum-tag claims in (i-3) and record it
  revisit-when-K6-lands.
- **The kinematics gate caught a defect in `findings_d.md` itself** — §1 still presented both α
  candidates and called the choice "a physics call for the office" after the ruling had been made.
  Since both skeletons declare themselves non-canonical, the ruling existed in no canonical
  location while §8 invited an early freeze. Closed: §1 now carries the canonical ruled paragraph.

### `findings_d.md` PASS 2 — LANDED

The file is now the freeze source and says so. It records what PASS 2 settled (α formula; no
contract deviation needed for a start from rest; sequential contrast over a second body; the tug
kept so `sources[]` is in scope; the `tau`-row semantic), the four cross-document items the merge
must close (two visibility rules for one wheel · Unicode-minus on the α row carried by the wrong
concept · the `sources[]` back-compat clause · rim ticks must be base-frame, not `spin`-group), and
one honest gap: the cycle-2 scar pass could not reach the live `engine_bug_queue` (Cloudflare
525/522) and ran against a one-cycle-old 157-row union.

**Desk E: nothing further is owed from this desk before the freeze.**

### Physics blocks — BOTH WRITTEN. Wave 1 (the 0b design pass) is COMPLETE.

`rotational_kinematics/physics_block.md` (473 lines) · `tau_eq_i_alpha/physics_block.md` (565 lines).
Both authors re-derived every number from first principles rather than inheriting it, and both
report zero disagreement with their skeleton's ground truth (the 4.64 ratio was checked by three
independent routes).

- **`rotational_kinematics`** — Rule 25 verified holding: "torque" and "moment of inertia" appear
  nowhere in the narration section; τ and I exist only as internal numbers (`τ_internal = 3.06·α`).
  F-8 applied at S1: the narration states the PATTERN ("each full turn adds two pi radians to the
  running count") rather than a value the ≈9.00 rad pin would contradict. `r` and `m` declared FIXED
  constants, never sliders — this concept has no radial slide anywhere.
- **`tau_eq_i_alpha`** — P1-A landed at both sites Checkpoint C must diff (§1 variable + formula +
  ground-truth table; §3 readout metrics + timelines). **It explicitly SUPERSEDES a sentence in
  skeleton REV 2** that still describes τ as "the signed authored schedule value" — wrong wherever
  the rest clamp or S8's static hold is active. The skeleton is `DESIGN_OK` and frozen, so the
  supersession is recorded in the physics block rather than edited into the skeleton;
  **Checkpoint C must not reconcile them the wrong way round.** P2-A pin budgets recomputed with
  park instants (S4 14 s, S5 14 s, S7 15 s, margins 0.47–0.77 s), and S5's pin still photographs
  chip 1.25 beside live 5.80. P3-4 taken: the formula surface reads `τ = Iα`, never `τ_net = Iα`,
  since only S8's tug gives "net" an on-screen referent.

Neither author found a new engine need: everything required is already covered by `findings_d.md`
PASS 2. **No PASS 3 is owed.**

### Next

1. ~~`physics-author` block for each concept~~ — DONE. Carry-forwards on record:
   `tau_eq_i_alpha` P1-A (the τ-row semantic, to be diffed at Checkpoint C), P2-A (pin budgets stop
   at actuator release but retraction is animated over `padTravelMs` — S4/S5/S7 need ~14/14/15 s),
   P2-B (the fallback puts signed τ on a core-ring control while negative τ is extended-ring — a
   Rule 38b breach that exists only in the fallback branch); `rotational_kinematics` F-8 (S1's
   "6.28 rad" is transient — the 0.60R pin photographs ≈9.00 rad, so word the held claim as the
   picture, not the number) and F-9a (S3→S4 thinness, accepted, lesson frozen).
2. **No concept JSON until the 0c-3 PR merges and this desk syncs.** Unchanged.
3. **`findings_d.md` PASS 2** — exact readout tokens/units/dp, reference marks, control-table
   demands, any `APPARATUS_CONTRACT` deviation (a start from rest at ω₀ = 0 is the likely ask for
   both, and is an office decision, never a local one), and the ruling on a second body for the
   "same τ, double I" comparison.
4. **No concept JSON until 0c-3 merges and this desk syncs.**

### Open, needs a founder ruling

`torque` (#5) and `moment_of_inertia` (#6) precede `tau_eq_i_alpha` in the approved teaching order
and are not in this wave, so its `prerequisites` array will name ids with no concept JSON. Raised
at Checkpoint A per the desk contract, not deferred to seal.

---

## 2026-08-05 — E4 landing check (still docs-only; no `src/`, nothing seeded)

**Half-unblocked.** E4 landed on `feat/rotmech-0c3` (`bf7dac1`, PR #29 **OPEN, not merged**) — this
desk's own findings_d §1. Signed torque means **α is physically producible for the first time**.
**E5 did not land**, verified rather than assumed: `RBR_RO_META` (`:50663`) is still exactly six
rows, `reference_marks[].surface` (`:1060`) still five members, `rbrApplyParam` (`:50576`) still has
no applied-torque token, and both readout loops still `if (!meta) continue`. **`json-author` stays
shut on both concepts** — an unknown token is skipped in silence, so a JSON written today passes
Zod, `validate:concepts`, the seed, the render and THE EYE with α simply never on screen.

The unpushed master-merge commit (`d904fca`) is pushed.

### `findings_d.md` PASS 3 filed

- **Both physics blocks conform to E4's landed shape — no edits owed to either.** Checked
  claim-by-claim against the code, including the brake-is-a-magnitude rule (`:51103`), static hold
  with breakaway at ω = 0, the ω₀ = 0 floor at both sites, and per-source `engage_cue`. Every number
  re-derived clean (I = 3.06 · τ = 1.84/1.53 · S7 ticks 1:3:5 · S2 end 5.56 · S4 F = 1.09 N). E4
  changes no authored value.
- **Two carry-forwards die:** the P1-8 fallback (`sources[]` shipped, so `tau_eq_i_alpha`'s tug
  stands) and **P2-B with it** — its Rule-38b breach existed only in the fallback branch. Strike both
  from the Checkpoint C list. PASS-2 cross-doc item 3 (back-compat) is settled by E4's byte-identity
  proof; Desk A still owes the desk-verification.
- **ONE ESCAPE FROM THE FREEZE — §4b.** The drive torque has **no rendered actuator of any kind**,
  and §4b appears in no dispatch, no §C row and no §D row of `FROZEN_SCOPE_0c3.md`. Cause: §8's
  priority table omitted it and PASS 2 told Desk E *"freeze from §8. It is complete."* **The omission
  is this desk's, not Desk E's** — §4b was rated MEDIUM the day before Checkpoint A reconciled both
  skeletons onto ONE drive wheel, and was never re-rated. Cost: the Rule-32a cause beat on **11 of
  17 states** across both concepts, plus P1-1 becomes unenforceable and PASS-2 cross-doc item 1 is
  stranded. Re-rated **BLOCKING**; the ask now also needs a **per-entry travel field on `sources[]`**,
  since `pad_travel_ms` is singular and top-level and cannot address a list.
- **Two precision asks on E5**, cheap now: (1) `rotational_kinematics`'s explore control is **α, not
  τ** — E5 buys "the applied-torque control token", and a τ-labelled slider puts an untaught term in
  the sandbox of a concept whose Rule-25 compliance depends on never naming torque; (2)
  `tau_eq_i_alpha` S8 is a **second consumer of E8**, which names only Desk A's S8 — its entry
  `tau_app = 0, tau_brake = 0` is dropped by the `Math.abs(tv) > 0` guard, and while
  `rbrSetBrakeSource` revives the physics on a live drag, `rbrApplyVisibility` never re-runs.

---

## 2026-08-06 — E5 landing check (docs-only; no `src/`, nothing seeded, nothing dispatched)

**Synced 72 commits of master** (now at `994bb8f`) and re-ran the chain: `check:renderer-syntax` OK
on all three renderers, `tsc --noEmit` **0**, `validate:concepts` **149 PASS / 0 FAIL**.
`git diff origin/master...HEAD -- src/` = **0 files**. Both physics blocks survive the merge
unchanged.

**Still blocked, and the notice was wrong about that.** E5 landed (`df87b6d`), as did E7 and E11.
`ENGINE_LANDING_NOTICE.md` §7 had said E4 + E5 unblocked this desk; **founder ruling 3 overruled it**
— findings_d §4b is accepted as **BLOCKING** and filed as **E10**, the seventh capability, ten
dispatches not nine. `json-author` stays shut on both concepts.

### `findings_d.md` PASS 4 filed

- **Both physics blocks conform to E5's readout rows — zero edits owed.** `rotational_kinematics`
  authors `theta`/`omega`/`alpha` and never surfaces τ (Rule 25 intact); `tau_eq_i_alpha` authors
  `I`/`omega`/`alpha`/`tau`; neither authors `W` (Desk A's row). Both semantics this desk filed
  landed as filed — τ = resolved net torque including the rest-clamp 0.00, α = per-step finite
  difference of ω. E5's "must not `param_ramp` r" constraint is satisfied **vacuously**: neither
  concept authors a ramp anywhere.
- **Units comply with ruling 1 at every site.** θ rad · α rad/s² · τ N·m, dp 2 throughout, and the
  only `reference_marks` either concept authors are ω chips in rad/s — neither authors a θ mark, so
  the SI clause has no consumer here and cannot be got wrong. **PASS-2 cross-doc item 2 closes**:
  `rbrFx` emits U+2212, and E5's own comment names this concept's α = −0.50.
- **Ruling 4 (α, not τ) was already in the block** — S9 exposes ω₀ and **α**, with
  `τ_internal = 3.06·α` already specified as the internal resolution. **One ask raised:** E5's
  `tau_applied` row can be relabelled but its **unit is not overridable** (`sp.unit`, not
  `sc.unit`) and `rbrApplyParam` applies **no scale** — so a label-only fix satisfies ruling 4's
  letter and prints **`α = 1.84 N·m`** where α is 0.60 rad/s². E10 needs an overridable unit *and* a
  value scale, or its own token.
- **`tau_eq_i_alpha` S8 is NOT recorded where E8's surgeon will see it.** E8's row still reads
  "BLOCKS DESK A's S8"; the only Desk-D mention sits inside **E10's** notes as a family remark.
  Asked for one line in E8's own row.
- **§4b is correctly represented** at all four sites (§0 ruling 3, §B E10 with all three build notes
  and ruling 4 bound to it, §7 struck-and-corrected, Desk A's half left standing). Every technical
  claim matches the code. Nothing owed.
- **A SECOND ESCAPE — `time_ticks` (K5) is in no dispatch and no §C row.** Found while checking the
  tick set against E5's new `rbrWarnTickSurface`. Same mechanism as §4b: a skeleton-local K-item
  that yielded ownership to findings_d while naming a capability findings_d never carried, so it
  never reached §8 and Desk E froze from §8 correctly. **S2 and S7 are built on it** — even spacing
  at constant ω, 1 : 3 : 5 widening under constant α; each state's delta cue *is* the tick geometry.
  Filed, not raised as a scope demand. **Recommended one grep-sweep across the other desks' K/A/B/C
  item lists** — that is two escapes for two on this desk alone.

---

## 2026-08-07 — exhaustive self-audit for scope escapes (docs-only)

Swept **all 20 items** across both skeletons (`rotational_kinematics` K1–K10, `tau_eq_i_alpha`
D1–D10) against three places each: `findings_d.md` §8, a `FROZEN_SCOPE_0c3.md` §B dispatch, and a
§C/§D row. **16 covered, 4 gaps.** Filed as PASS 5, none raised as a scope demand.

### The four gaps

1. **`rbr_v_arrows` group focal token** (K4·b) — zero hits anywhere. §C C-1 buys the tangential
   arrows themselves but names no group token, and in code `glow_focal?: string` (`:1141`) is
   *"exactly ONE scene focal (Rule 32e)"* over `RBR_ELEMENT_TYPES` (19 individual meshes, no
   grouping). **S6** (core) is *"one turning rate, many speeds"* — two arrows in a 2 : 1 ratio.
   One focal lights one arrow and destroys the comparison; two focals breach 32e. No third option.
2. **`time_ticks`** (K5) — carried from PASS 4, still absent. **S2** (core, even spacing) and
   **S7** (extended, 1 : 3 : 5) are each built on the tick geometry.
3. **θ(t)/ω(t) graph panel** (K6) — in §7 *informational* only, never in §8; zero rows in the frozen
   scope. **The skeleton pre-decided this one (P1-8): descope K6 ⇒ S8 is DROPPED.** So the
   consequence has already silently triggered — `rotational_kinematics` ships **8 states, not 9**,
   the advanced ring is empty (already ruled compliant under Rule 38a at Checkpoint A cycle 2), and
   `entry_state_map.calculus_graphs` is removed. **Nothing anywhere records that**, and the
   Checkpoint-A rider on the advanced curriculum tags is unexecuted. This is the item most likely to
   reach seal wrong — not a missing capability, a state that should not exist.
4. **Per-particle tangential FORCE arrows** (D7) — §4's body priced *"one tangential-vector
   mechanism, two consumers… the maps differ (m/s vs N) and must not be shared."* §8 item 4 wrote
   only the velocity form "shared with concept #3"; C-1 inherited the narrowed form and §D-5
   hardened it to *"wanted by #4 alone."* **S7** (advanced) is the τ = Σ(r·F) derivation whose ledger
   sums to 1.53 — absent, nothing renders. Cheapest fix is one restored clause on C-1, not a row;
   E7 already makes exactly this two-consumers/two-maps argument for the arrow shafts.

### Two things that are not gaps

- **E5's `tau_applied` step 0.05 cannot reach 1.53** (nor can `tau_brake`; 0.60 is fine). That is
  this concept's own taught value, so `json-author` must author `slider_controls` overrides for BOTH
  tokens at step 0.01. The override path is live and proven — the shipped fleet already authors
  undeclared `slider_controls` keys (`ac_generator` → `omega`/`N`), so the missing type declaration
  is hygiene, not breakage.
- **D8's downgrade clause is VOID.** E1 landed `formula_lines: [{text, at_ms?}]`, richer than the
  minimum buy D8 delegated — so `tau_eq_i_alpha` S7's term-by-term assembly is authorable as
  designed, and the sealed CoAM block's "formula_surface assembles" assumption is satisfied.

### The pattern, sharpened

Four instances instead of two, and they split into **omission** (§4b, K5, K6 — never in §8) and
**narrowing** (D7 — in §8, but the one-line summary dropped a clause the body carried, and the
narrowed form then propagated and hardened downstream until it read as deliberate). **Narrowing is
the dangerous shape**: the row *is* in the scope, nothing looks missing, and the loss only surfaces
at build time. Recommended method for the cross-desk sweep: for any item that IS present, diff its
source paragraph against its §8 line for dropped clauses — consumers, second maps, group tokens,
origin fields. Two of this desk's four gaps were sub-clauses of rows that already looked covered.

### Notes for whoever picks this desk up

- Desk E's worktree is `C:\Tutor\physics-mind-rotmech-0c3`. `findings_d.md` is committed AND
  pushed to `origin/feat/rotmech-d` (the post-commit auto-push hook is live in this worktree), so
  Desk E can reach it with `git fetch origin feat/rotmech-d` — no absolute-path read needed.
