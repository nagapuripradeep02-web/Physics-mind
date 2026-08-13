# rotmech desk D — loop state

updated: 2026-08-14

## ⚡ K6 RULED (Option B) — json-author OPEN on both concepts (2026-08-14)

All three follow-ups executed (see the brief). **The honest capability wall, re-verified in the
synced tree before dispatch** — these rows are still UNBUILT, and each named state's payload waits
on them (author forward-compatible config per design; it is an inert no-op today):

| Unbuilt row | `rotational_kinematics` states | `tau_eq_i_alpha` states |
|---|---|---|
| K3 — base ray + swept θ arc (in C-1) | S1 (start line + arc) | — |
| K5 — `time_ticks` (§G row 2) | S2, S7 | — |
| C-1 — `point_markers[]` + v = ωr arrows | S6, explore's arrows | — |
| GAP 1 — `rbr_v_arrows` group focal (§G row 1) | S6 | — |
| E6 — `restart.runs[]` per-run overrides | — | S5 (run B re-pose) |
| GAP 4 / D7 — per-particle force arrows | — | S7 (ledger arrows) |
| E8 — live-drag rendered agent | — | S8 (drag-driven actuator show/hide) |

**Consequence: both JSONs are authored now, but NEITHER concept may be sealed** — no
quality-auditor final PASS, no eye-walker final verdict, no Checkpoint B — until its column above
is empty. This gate exists because an authored `time_ticks`/`point_markers`/`runs` key is an inert
SILENT no-op (only readout/mark/control tokens warn, per E5).

## Merge-gate checklist — the label de-collision PR (when the engine desk reports back)

Three checks before merging, none optional:
1. **Class, not instance:** the fix is rbr-scoped de-collision, not just the S5 offset — and it did
   **not** touch `createLabelSprite` unconditionally (that moves pixels in ~40 baseline-locked
   concepts).
2. **The live-value trap:** it says explicitly what it did with the drum cylinder/stripe sites —
   repointed, or deliberately-constant-with-reason.
3. **Its verification measured both labels separately at the ENGAGED pose in DENSE frames** — the
   frozen-only read is how this bug survived two filings.

Then: merge its PR → Desk A syncs → CoAM Checkpoint B convenes (the chapter's first shot at a
founder-proxy APPROVE).
desk: `feat/rotmech-d` · `C:\Tutor\physics-mind-rotmech-d`
cut from: `4b289d4` (the Phase-0d pre-registration commit)
review_port: **8113**
regression_sample: **normal_force, inductance**
engine_surface: `rigid_body_rotation` (rbr) — the 0c-1 frozen contract at `field_3d_renderer.ts:939`

## Concept set — FROZEN. This desk owns exactly these two.

| Wave | Concept | Status |
|---|---|---|
| 2 | `rotational_kinematics` | **BLOCKED on the K6 FOUNDER RULING ONLY** (state count 8 vs 9 — `rotational_kinematics/K6_decision_brief.md`). E10 landed + verified; C-1 (v = ωr arrows) and K5 (`time_ticks`) still unbuilt — S2/S6/S7 consume them. |
| 2 | `tau_eq_i_alpha` | **ENGINE-UNBLOCKED.** E4 + E5 + E10 all landed; E10 verified by this desk (PASS 6, 23/23). Held with its sibling pending the K6 ruling, per the office's json-author gate. |

## E10 VERIFIED — the last engine blocker is gone (2026-08-13)

E10 (`24373b2`) + the unit-override (`99ce132`) confirmed on master by ancestry, merged clean,
triad green (153 PASS / 0 FAIL). **PASS 6 filed: CONFIRMED, 23/23 measured** — a Node probe
executed the emitted `rbrActuatorAt` / `rbrDriveArrowLen` / `RBR_CTL_SCALE` / `rbrSrcTau` / `rbrSc`
against stubs. The actuator is five real meshes with the cause beat translating strictly before
engage; the rim-force map has a true zero and an exact 2.500 ratio; the α control resolves glyph,
unit AND scale, with τ = I(t)·α exact under a ramping I and resolution at the point of consumption.
Honest limit: emitted-code + static, **not pixels** — the pixel half lands with this desk's first
EYE run once `json-author` opens. **`json-author` stays closed until the founder rules K6.**

## ⚠ PRE-LOADED FOR `json-author` — read this BEFORE writing either JSON (2026-08-13)

Four carry-forwards. Each is silent if missed: the JSON validates, seeds, renders and passes THE EYE
with the defect in place.

1. **`slider_controls` overrides at step 0.01 for BOTH `tau_applied` and `tau_brake`.** E5 shipped
   both at **step 0.05**, which **cannot reach 1.53 N·m** — this concept's own taught value
   (τ = I·α = 3.06 × 0.50). Checked: `tau_applied` k = 70.60, `tau_brake` k = 30.60, neither on the
   grid; 0.60 is fine (k = 52). Without the overrides the S8 sandbox stops at 1.50 and the
   drive-vs-brake static hold sits 0.02 N·m off balance. **The override path is live and proven** —
   the shipped fleet already authors undeclared `slider_controls` keys (`ac_generator` → `omega`,
   `N`), and `rbrSc()` reads `min/max/step/default/dp/label` from it.
2. **D8's downgrade clause is VOID — do not apply it.** It said S7's term-by-term formula assembly
   would "downgrade to a sentence-synced whole-formula reveal". E1 landed
   **`formula_lines: [{ text, at_ms? }]`**, richer than the minimum D8 delegated, so
   `tau_eq_i_alpha` **S7's assembly is authorable exactly as designed.** (Do not author
   `formula_at_ms` — that name belongs to the `pef` scenario and means something else. A state
   authoring both `formula` and `formula_lines` renders only the lines; drop the string.)
3. **K6 RULED — Option B (founder, 2026-08-14): `rotational_kinematics` ships 8 STATES.** Design
   S8 dropped (named revisit when the graph panel is built chapter-wide); design S9 → **STATE_8**;
   `entry_state_map.calculus_graphs` removed; advanced ring empty (38a confirmed); advanced-ring
   curriculum-tag claims dropped, AP-C/IB-HL cells marked `revisit_when: graph_panel_lands`. Full
   record: `rotational_kinematics/K6_decision_brief.md`.
4. **Ruling 4 was CORRECTED on this desk's evidence** (Desk E, master `da71f64`): a relabelled
   `tau_applied` is **not** compliance. E10 must deliver a real α row with correct unit *and* scale,
   or the control stays τ-labelled and honest. The unit-override gap is now its own engine item.

## TRACKING (not ours to file — do not re-raise)

- **GAP 1 · `rbr_v_arrows` family-addressable `glow_focal` group token** is **row 1 of Desk E's
  cross-desk sweep** (§G, HIGH, owners **C *and* D** — filed independently by Desk C's
  `rigid_body_rotation` C1/C9(b) and this desk's K4 P2-9). Highest value in the sweep and needed by
  Desk C too. **Filed. Track only.**
- **PASS 4 §D closed:** Desk E granted the E8 ask — E8's own row now names `tau_eq_i_alpha` S8 as a
  second consumer.
- The other three PASS-5 gaps sit in §G as rows 2 (`time_ticks`), 3 (graph panel) and 4 (tangential
  force arrows). All filed. None ours to re-raise.

## PASS 5 — exhaustive self-audit of both item lists (2026-08-07)

All 20 items swept (K1–K10, D1–D10) against §8 · §B dispatches · §C/§D. **16 covered, 4 gaps**, all
filed in `_engine/findings_d.md` PASS 5, none raised as a scope demand:

1. **`rbr_v_arrows` group focal token** (K4·b) — C-1 buys the arrows, not the group token;
   `glow_focal` is single-token by design (Rule 32e). **S6** (core) needs both arrows lit as ONE
   focal to show the 2:1 ratio.
2. **`time_ticks`** (K5) — carried from PASS 4. **S2** (core) + **S7** (extended).
3. **θ(t)/ω(t) graph panel** (K6) — §7 informational only, never in §8. **The declared consequence
   has already silently triggered: K6 descoped ⇒ `rotational_kinematics` ships 8 STATES, S8 dropped,
   advanced ring empty (ruled compliant, Rule 38a), `entry_state_map.calculus_graphs` removed.**
   `json-author` must be told 8, not 9.
4. **Per-particle tangential FORCE arrows** (D7) — §4's body priced ONE mechanism with TWO consumers
   (m/s and N maps, never shared); §8 item 4 dropped the force consumer and C-1 + §D-5 hardened the
   narrowing. **S7** (advanced) renders nothing without it.

Plus one authoring note: **E5's `tau_applied` step 0.05 cannot reach 1.53** (nor can `tau_brake`) —
`json-author` must author `slider_controls` overrides for BOTH, step 0.01.

Also resolved: **D8's downgrade clause is VOID** — E1's `formula_lines` is richer than the minimum
buy, so `tau_eq_i_alpha` S7's term-by-term assembly is authorable as designed.

## STILL BLOCKED — E4 + E5 landed, E10 does not exist yet (2026-08-06)

E5 landed (`df87b6d`, in master via PR #29). **This desk is NOT unblocked** — the landing notice
said it was, and `FROZEN_SCOPE_0c3.md` §0 ruling 3 overruled that: findings_d §4b is **accepted as
BLOCKING** and filed as **E10** (`rbr_drive_torque_has_no_rendered_actuator`), the seventh
capability, taking the build to ten dispatches. The notice §7 paragraph is struck and corrected.

**`json-author` stays shut on both concepts until E10 lands.** 11 of 17 states still have no
rendered agent for their torque — a Rule-32a cause beat that never moves, on a sim that otherwise
looks finished (Rule 24 / §10(d): no stated agent without a rendered object).

**PASS 4 filed** (`_engine/findings_d.md`): both physics blocks conform to E5's readout rows with
zero edits owed; units comply with ruling 1 at every site; ruling 4 (α not τ) was already in the
block. Two asks raised — E10's α control needs an overridable **unit** and a **value scale**, not
just a label (relabelling `tau_applied` prints `α = 1.84 N·m`), and `tau_eq_i_alpha` S8 needs one
line in **E8's own row**, where it is currently absent. **One new escape found: `time_ticks` (K5)
is in no dispatch and no §C row** — S2 and S7 are built on it.

## HISTORY — E4 landed, E5 did not (2026-08-05)

`ENGINE_LANDING_NOTICE.md` §3/§7 + PR #29 (`bf7dac1`, **OPEN, not merged**). E4 = this desk's
findings_d §1: **signed torque, so α is physically producible for the first time.** Newly
authorable: signed `applied_torque_Nm` · `external_torque.sources[]` with `kind: drive|brake` ·
`omega0_rad_s: 0` with a slider that reaches 0 · `formula_lines: [{text, at_ms?}]` (E1).

**E5 has NOT landed and it is the hard gate.** Verified on `origin/feat/rotmech-0c3` @ `6c5ed6d`:
`RBR_RO_META` (`:50663`) is still exactly six rows, `reference_marks[].surface` (`:1060`) is still
the five-member union, `rbrApplyParam` (`:50576`) still has no applied-torque token. Both loops
still `if (!meta) continue`, so **an unknown readout token is skipped in silence** — a
`tau_eq_i_alpha` JSON authored today would pass Zod, pass `validate:concepts`, seed, render, get
EYE'd and could be sealed **with α simply never appearing.**

**Do not start `json-author` on either concept until E5 merges.** Not "prefer not to" — the failure
is invisible to every automated gate this desk has.

**PASS 3 filed** (`_engine/findings_d.md`): both physics blocks conform to E4's landed shape, no
edits owed; the P1-8 fallback and P2-B are dead; PASS-2 cross-doc item 3 is settled. **One escape
found** — findings_d §4b (no drive-wheel actuator mesh) is in no dispatch, no §C row and no §D row
of the frozen scope, because §8 omitted it and PASS 2 called §8 complete. It blocks the Rule-32a
cause beat on **11 of 17 states** across both concepts. Raised to Desk E, re-rated BLOCKING.

## This desk has NO wave-1 authoring, and that is deliberate

There is no fifth ready concept. Both of this desk's concepts are engine-blocked, so wave 1 is
**the 0b design pass for both** — architect skeleton + physics block + founder-proxy
Checkpoint A. Pure documentation, zero engine dependency, and it front-loads the highest-ROI
quality gate in the pipeline.

The payoff: when 0c-3 merges, this desk starts at `json-author` for both concepts instead of at
`architect`, so it catches up with the others in one step rather than three.

## next
1. **Wait for E10.** Nothing in `json-author` is safe before it. (E4 + E5 have landed; the desk is
   synced to master `994bb8f` and the verify chain is green — renderer-syntax OK, tsc 0,
   validate 149 PASS / 0 FAIL.)
2. On E10 merge: `npm run desk:sync` → verify chain → **start at `json-author`** for both concepts
   (not at `architect` — that is the payoff for the 0b-first decision) → `quality-auditor` ∥
   `eye-walker` → founder-proxy Checkpoint B.
3. `json-author` must write **`field_3d_config`** into this desk's seed scripts, not
   `physics_config: { epic_l_path }` alone — the cloned exemplar starves
   `deriveMotionExpectations` and `[D5]` abstains on exactly the rest-seeded states E4 enables
   (`ENGINE_LANDING_NOTICE.md` §4 trap 2). `rigid_body_rotation` HAS a motion branch, so a `?` on
   the `Motion map:` line is a real defect here, never by design.
4. `md5sum` the dense frames on every EYE run until the static-scene gate defect is fixed
   (§4 trap 1) — the three dense-motion gates all pass on a scene that never moved.
5. This desk is the named verifier for **E6, E8 and E9** once E4/E5 clear it.

## done
- **Wave 1 — the 0b design pass, COMPLETE** (2026-08-04). Both concepts `DESIGN_OK` at Checkpoint A
  cycle 2, both physics blocks written, `findings_d.md` PASS 2 landed as Desk E's freeze source.
- **PASS 3 — E4 landing check** (2026-08-05). Conformance verified against landed code; one escape
  from the freeze raised (§4b, the drive actuator); two precision asks filed on E5 before it
  dispatches. No `src/` file touched, nothing seeded.

## Why the wait is not optional

`RBR_RO_META` (`field_3d_renderer.ts:50147`) implements exactly six readout rows:
`I · ω · L · KE · dL/dt · F`. **There is no α row** — the quantity `tau_eq_i_alpha` exists to
teach.

> **CORRECTION 2026-08-04.** An earlier version of this file said θ and `theta0_rad` were also
> missing. **They are not**, and the mistake came from trusting the contract comment at
> `field_3d_renderer.ts:953` instead of grepping. Verified against the code:
> `rbrThetaAt` (`:49952`) is a complete, grid-cached, rewind-safe angle integrator, live at
> `:50232` (published as `window.PM_rbrTheta`) and `:50666` (it drives the visible rotation);
> `rbrThetaReset` (`:49967`) reseeds it; and `theta0_rad` IS read, at `:50499` into
> `eng.theta0`, which seeds `_th` at `:49958`/`:49970`.
>
> **The contract comments at `:953` and `:998` are WRONG** — they list `theta0_rad` under
> "DECLARED, NOT IMPLEMENTED" while `:962`/`:971-973` in the same block correctly document θ as
> implemented. Desk E has queued the comment fix.
>
> **What this changes for you:** θ needs only a **row in `RBR_RO_META`**, not an accumulator.
> `rotational_kinematics` is blocked on the **α readout** and the **v = ωr arrow** only. Design
> your θ beats against the integrator that already exists — read `rbrThetaAt` before you
> specify anything about angle behaviour, because it already defines the semantics. `rbrRebuildReadout` (`:50162`) does `if (!meta) continue`, so an unknown token
is skipped in **silence**: no throw, no gate failure. A `tau_eq_i_alpha` JSON authored today
would pass Zod, pass `validate:concepts`, seed, render, get EYE'd, and could be sealed — with α
simply never appearing on screen. Only a human reading the sim against the physics block would
catch it.

Authoring these now does not save time. It manufactures a concept that looks finished and is
not.

## Guardrails

1. **`npm run cache:clear:scoped -- <id>` ONLY.** The global 4-table wipe destroys four sibling
   desks' seeded rows mid-EYE.
2. **Cache one-owner rule.** This desk may seed exactly: `rotational_kinematics`,
   `tau_eq_i_alpha`, `normal_force`, `inductance`. Seeding any other key races a sibling desk.
   (Wave 1 is docs-only and seeds nothing.)
3. **Always re-seed immediately before `visual:eyes`.**
4. **Shared registration files are READ-ONLY here** (pre-registered on master in `4b289d4`).
5. **Never edit the six platform files** — above all `field_3d_renderer.ts` and
   `deriveStateMeta.ts`, not even a comment.
6. **Engine findings → `docs/loop_runs/rotmech/_engine/findings_d.md`.** Desk E is the sole
   engine owner. Never dispatch an engine fix here — but DO write findings early and precisely,
   because this desk defines half of 0c-3's scope.
7. **`APPARATUS_CONTRACT.md` is binding.** Home pose `r = 0.80`, `ω = +1.50`, `m = 2.0`,
   `I_frame 0.50`, `rod_half 1.00`, `drum 0.55`, `r` range 0.15–0.90. Six concepts share this
   turntable across four desks; a local deviation forks the chapter's apparatus.
8. **Progress lines → `docs/loop_runs/rotmech/_progress/d.md`**, never `PROGRESS.md`.
9. No `visual:approve` · no `tts:*` · no `PILOT_CONCEPTS` · no `build:pilot` · no `deploy:*` ·
   no `engine_bug_queue` DB writes · no merge to master · no `npm install` · no `git add -A`.
10. `npx --yes http-server review-site -p 8113 -c-1` (never `serve:review`, hardcoded to 8080).

## Open item needing a founder ruling
`torque` (#5) and `moment_of_inertia` (#6) precede `tau_eq_i_alpha` in the approved teaching
order and are not in this wave. `tau_eq_i_alpha` genuinely depends on both concepts' ideas, so
its `prerequisites` array will name ids with no concept JSON. Raise this at Checkpoint A, not
at seal.
