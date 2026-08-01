# ch6 loop state — Work, Energy & Power (Class 11)

updated: 2026-08-01
desk: C:\Tutor\physics-mind-ch6-work-energy-power  (branch feat/ch6-work-energy-power)
review_port: 8093
regression_sample: capacitance + parallel_currents_force
  # DISJOINT from any other running loop (Amendment 5). ch6 touches newtons_laws_body, so the
  # regression pair must also include a locked newtons_laws_body concept once one exists —
  # see engine verify chain below.

phase: 0 (chapter opening — Phase-0 doctrine, AUTHORING_PIPELINE.md §0)
phase0_survey: docs/loop_runs/ch6/phase0_survey.md   (0a DONE — founder-approved 2026-08-01)
engine_decision: EXTEND `newtons_laws_body` with an ENERGY LAYER. Do NOT build a new scenario_type.

next: 0c — SEAM K + SEAM L DONE and verified; SEAM M (teaching instruments) dispatched 2026-08-01
done: (none yet)
parked: (none)
in_flight: conservation_of_mechanical_energy  stage=0c-building  checkpointA=CLOSED
engine_commits: 9f479f6 SEAM K — genuine spring physics · dd2b869 SEAM L — energy display layer
  (both on the branch; NOT yet landed on master — see "Rule 40 landing decision" below)
desk_synced: origin/master f69dc28 merged into the desk 2026-08-01 (merge bb6a89c, pushed).
  Zero file overlap — the desk's 3 commits were docs-only. Baseline re-verified GREEN after the
  merge: check:renderer-syntax OK · tsc 0 errors. The merge pulled +1063 lines into
  field_3d_renderer.ts (chemistry `bonding_scene` substrate), so ALL pre-merge renderer line
  numbers — including the ones quoted in skeleton.md's ENGINE SPEC NOTES — are STALE.

## 0c SEAM PLAN (added 2026-08-01) — the 19 spec notes do NOT fit one dispatch

Amendment 4 caps a dispatch at ONE bug_class / ~100 calls; the spec carries 19 notes. Decomposed
into 4 sequential seams, mirroring how `momentum_bench` was built on lom-f (SEAM A/B/C). Seam
letters A–J are already taken inside `newtons_laws_body`, so the energy layer starts at K.
Sequential, never parallel — all four edit the same region of one shared file.

| Seam | Owns spec notes | Mechanism | Regression sample |
|---|---|---|---|
| **K** — spring physics substrate | 8a–8d, 17a–c, 9, 18e–f | genuine `F = −kx` in the integrator; slow motion becomes a PLAYBACK modifier; clamp + sandbox-wrap invariants; `loop_reset_ms` | `newton_third_law` (owns the legacy scripted apparatus) + electric_flux + magnetic_flux |
| **L** — energy panel + derived bars | 1, 2, 3, 4, 5, 12, 13, 16, 15(i)(ii) | LEFT-edge panel w/ measure-and-reflow; K/U/Uₛ derived every frame; stacked E column; ripple-corrected total displayed | nlb fleet |
| **M** — teaching instruments | 6, 7, 10, 11, 14, 18 (full), 15(iii) | `sum_merge` one-shot; h=0 line + computed/ghost markers; N concurrent SIGNED W accumulators; checkpoint latch; P readout | nlb fleet |
| **N** — off-axis force geometry | 19a–c | displacement vector `d`, angle arc, `applied_force {N, angle_deg}`, `N ≥ 0` lift-off clamp | **WIDER than the choreography spec's list — ~10 shipped concepts read `N`** |

Seam N is union-only (concepts #1/#2, unused by the 0b driver) and is the riskiest for regression
because it changes shared `N`. It goes LAST, on its own, with the wide sample.

**Corrected anchors** (post-merge; supersede the stale numbers inside skeleton.md):
`nlbBoundsM` L42574 (skeleton says 42897 ✗) · `nlbSandboxWrap` L41641 (skeleton says ~42881 ✗) ·
nlb config type L922–1250 · scenario region L39139–~43100 (SEAM MAP comment at L39148) ·
`nlbUpdateSlowBadge` L42113 · scenario RESET_TRAJECTORY L42474 · per-tick entry L55473 ·
per-state seed L51345.

**Rule 40a pre-check DONE and clean:** `git log --all -S "energy_layer"` and `-S "k_N_per_m"`
return no renderer hits — neither mechanism exists anywhere in history. Re-run per new symbol.

Per 0c doctrine each seam REPORT's closed enums — not skeleton.md's literal guesses — are the
authoritative JSON contract for json-author.

## SEAM K RESULT 2026-08-01 — DONE, verified, commit `9f479f6`

+512/−13 in `field_3d_renderer.ts`, all `nlb*`/`PM_nlb*` prefixed, contamination grep vs sibling
prefixes = 0 matches. Verify chain green: renderer-syntax OK · tsc 0 · validate:concepts 146/146
PASS · regression EYE `newton_third_law` 32/32, `electric_flux` 62/62, `magnetic_flux` 38/38 with
**all 42 H2 baselines at 0.00%** — the direct proof note 8c's additive claim holds.

**JSON contract (authoritative — supersedes skeleton literals).** Under `newtons_laws_body.spring`:
`k_N_per_m` (>0, absent = legacy scripted path bit-for-bit — **THE GATE**) · `natural_length_m`
(default 1.6, metres, drives physics AND drawn coil) · `slow_factor` (≥1, default 6; <1 ignored) ·
`compressed` IGNORED on the genuine path · `between` still required (one body `fixed: true`).
New top-level: `loop_reset_ms` (>0; inert under `push_off`, in `mode:'sandbox'`, and once seized).
**No new closed enum members.** Position contract: compressed when
`|s_block − s_wall| − (halfA+halfB) < natural_length_m`, half-extents 0.275 m wall slab / 0.55 m
cart — author the home pose with the block CLEAR of the coil or the state opens pre-loaded.
`k_N_per_m` + `spring_action` together is unsupported; `k_N_per_m` wins.

**Ripple acceptance probe MEASURED (not asserted):** 0.005240 J at m=2, k=370, slow_factor 6
(bar < 0.05 J); uncorrected 0.928 J — a 177× reduction, confirming the cycle-2 catch was real.
Additivity 600 no-contact frames bit-identical to 17 s.f.; rewind byte-identical.

**Independently re-verified by the dispatching session** (the one deviation from a founder-ruled
spec line): SEAM K ships `s += 0.5(v₀+v₁)h + 0.5·a_spring·h²`, NOT spec 8a's literal
`s += v·dtPhysics`. Expanding with `a = a_const + a_spring` gives exact integration for the constant
part plus `v₀h + a_spring·h²` — i.e. the spec's semi-implicit form for the spring, with gravity
error-free. Taking 8a literally would apply symplectic Euler to gravity and drift ≈0.29 J per second
of FREE SLIDE with no spring present, visibly tilting the flat-topped E column that is S1/S2's
PRIMARY aha. The deviation is correct and protective; the added term vanishes identically when
`Fspr = 0`, which is why all 42 legacy baselines moved 0.00%. **Accepted.**

⚠ The code comment at ~L43330 claims "strictly affine in dt" for this step. That is overstated for
the spring branch — the `h²` term is quadratic, and the surgeon's own measured 3-folded-step row
(0.124 J, OVER bar) is the honest number. No explicit integrator is fold-exact against a
position-dependent force, so this is inherent, transient and self-correcting on a dropped frame —
not a defect. `SET_TIME_FREEZE` forces dt=0 so frozen baselines stay byte-identical by construction.
Trust the REPORT's number, not the comment, if founder-proxy asks.

### Open items SEAM K hands forward (must not be lost)

- **A. Sandbox real-time ripple — a genuine spec tension, unresolved.** Spec 8d says sandbox = real
  time (`slow_factor: 1`), but the measured ripple at `slow_factor: 1` is **0.457 J** — 9× over the
  0.05 J bar. On S8's ~39 J total at 0.1 J display precision that is a visible wobble, in the very
  sandbox whose claim is "total flat when μₖ = 0". The founder's slow window turns out to be doing
  NUMERICAL work, not only legibility work. SEAM L owns resolving this on the DISPLAY side (coarser
  sandbox precision / display smoothing / a mild sandbox slow factor) — flag to founder-proxy, do
  not silently pick.
- **B. Note 15 `deriveStateMeta.ts` co-edit is still OWED.** SEAM K correctly needed none (no new
  scenario_type, no reveal key, no cue time). All three sites belong to SEAM L/M + the concept's own
  registration. Do not let this fall through the seam boundary.
- **C. `U_grav` reference is currently `s = 0`** (surface origin). SEAM L must widen it to an
  authored reference in the `energy_layer` block (the `h = 0` line is authored per skeleton §3).
- **D. Scar rows 2–4 are OPEN directives** in `scar_candidates_seam_k.sql`, SQL text only, NOT
  applied to the DB. Row 4 defines the `[PM_NLB_ENERGY_CLAMP]` console assertion THE EYE should
  enforce (zero occurrences).
- **E. Do not author a spring state at `slow_factor: 1` outside the sandbox** — it fails the ripple
  bar even corrected. An authoring constraint json-author must honour.

## SEAM L RESULT 2026-08-01 — DONE, verified, commit `dd2b869`

+569/−11 renderer, +45 `deriveStateMeta.ts`. Contamination grep vs sibling prefixes = 0. Rule 40a
`-S` check clean on all 11 invented symbols. Verify chain green: renderer-syntax OK · tsc 0 ·
validate:concepts 146/146 · 0 backticks in the scenario region (Rule 14).

**`energy_layer` config contract (authoritative).** Per-state under `newtons_laws_body`; **presence
of the block is the gate** — absent, not one pixel changes.
`bars` (REQUIRED, **CLOSED enum exactly** `'K'|'U_grav'|'U_spring'|'E_total'|'E_dissipated'`; the
authored ARRAY ORDER IS DISCARDED — bars always render in the fixed panel order so a bar never
changes screen position between states, Rule 32d) · `bar_max_J` (REQUIRED, >0, shared linear scale;
author ABOVE the state's real peak — overflow clamps and warns) · `body_ids` (optional, 1–2;
**omitted = ONE group showing the whole rig's aggregate**, which is what every single-body state
wants; with it, per-body from `b.K_J`/`b.U_grav_J`, `U_spring` attributed to the spring's free body
alone) · `h_ref_m` (optional, default 0, metres above surface origin — the SAME height SEAM M draws
the dashed `h = 0` line at, so number and line cannot disagree; author at/below the body's lowest
point, the stack is unsigned) · `precision` (0|1|2, default 1, carries a `−0.000` clamp).
The skeleton's singular `body_id` was dropped in favour of `body_ids` — one key, no second code path.
New on `spring`: `sandbox_slow_factor` (≥1, **default 1 = spec 8d verbatim**).
Rendered symbols are engine-fixed Unicode: `K`, `U`, `Uₛ`, `E`, `Eₗₒₛₜ` (there is no Unicode
subscript "d", which is why `E_dissipated` is not `E_d`).

**Glow ids** (a glow id names a QUANTITY, not a body — with two compare groups one focal lights the
same bar in both, which is what a mass-independence beat wants): `energy_panel` · `energy_bar_K` ·
`energy_bar_U_grav` · `energy_bar_U_spring` · `energy_bar_E_dissipated` · `energy_col_E` ·
`energy_seg_K` · `energy_seg_U_grav` · `energy_seg_U_spring`. Verified live: mesh focal leaves every
panel element at 1.0 — finding F14 honoured.

### The sandbox ripple was RE-DIAGNOSED — and the new diagnosis is the right one

SEAM K's 0.457 J at `slow_factor: 1` is **NOT** shadow-Hamiltonian ripple. The shipped kick-drift
step's modified Hamiltonian is exactly conserved for the linear oscillator, which is why the
correction reaches 0.005 J at slow 6. The residual is a **contact-ENTRY quantization step**: with no
slow window the block crosses the coil face mid-frame and lands up to `v·h` inside it with zero force
having acted, acquiring `½k(v·h)²` that no work paid for. **Dispatching session re-derived it
independently: ½·370·(3/60)² = 0.4625 J vs 0.457 measured** — and it coheres exactly with SEAM K's
own scar row 2, because that one-step lookahead only helps by SHRINKING dt, so at `slow_factor: 1`
there is no shrink and the full burial occurs. It is a one-time STEP at each contact, not a shimmer,
which makes it worse for the teaching claim, not better: the column top jumps and holds.

Resolution (two parts; **the second is load-bearing**): (1) `sandbox_slow_factor`, **default 1 so
founder-approved 8d is not silently overridden** — error falls as dt², so 4 divides it by 16 →
≈0.029 J, inside the bar; 8d's INTENT survives because the window is contact-gated (shut for the
whole free slide) and any trusted drag/slider cancels it, so a teacher never feels lag on a control.
**json-author MUST author `spring.sandbox_slow_factor: 4` on S8.** (2) A **drift guard**: a state
that shows `E_total`, shows no `E_dissipated`, and has no friction and no applied force is a state
whose whole authored claim is "this total does not change" — if the displayed total then moves >0.05 J
from its entry baseline, `[PM_NLB_ENERGY_DRIFT]` fires once and THE EYE's console audit fails the
concept. The guard is deliberately blind to the CAUSE and checks only the CLAIM, so it also catches
causes nobody has thought of. Rejected: display-side smoothing (hides a real artifact, and its
cross-frame state would break rewind determinism + `SET_TIME_FREEZE` byte-identity — the exact scar
class SEAM K was built to avoid), coarser precision alone (2.2 px of step survives rounding), and a
higher-order correction (the error is at the switching boundary, not the interior — no shadow term
captures a discontinuous force turning on). **Flagged for founder-proxy: 8d's real-time default is
UNCHANGED; a state may now opt out, and one that should have and didn't fails loudly.**

### Open item B DISCHARGED — `deriveStateMeta.ts` sites (i) and (ii)

(i) reveal floor: an energy state's payoff is the bars, and a state authoring no
`phases[]`/`param_ramp`/`push_off` with an unlisted `mode` fell to `DEFAULT_REVEAL_MS = 1500` — the
`field3d_scenario_missing_maxreveal_block_frozen_pin_defaults_1500ms…` scar exactly. `energy_layer`
now raises `NLB_ENERGY_SETTLE_MS = 3000`. It is a FLOOR (`Math.max` of candidates), so SEAM M's
better-informed candidate still wins. (ii) `loop_reset_ms` states kept `'reveal_hold'` — a considered
call: `reveal_hold` RELAXES pixelGate (never asserts stillness, so a perpetual loop cannot false-fail),
whereas strict `undefined` ASSERTS motion, and a spring state legitimately passes through v=0 at
turnaround where a dense pair reads as stuck. Relaxing is safe both ways here; asserting is not.
**(iii) the frozen-pin instant is still OWED to SEAM M.**

### A defect only the pixels caught (worth remembering)

The panel first rendered ON TOP of the slow-motion badge. The measure-and-reflow ladder ran once at
state apply — when the badge is blanked on entry — so it measured a HIDDEN badge and never moved when
the badge opened at contact. Fixed: re-measure every frame, churn-guarded, rounded to whole pixels so
sub-pixel layout cannot shift a frozen baseline. **An overlay whose position depends on a sibling that
can appear MID-STATE must re-measure per frame; entry-time fit is only valid against siblings whose
visibility is decided by the STATE, not by the PHYSICS.** Filed as a directive scar row in
`scar_candidates_seam_l.sql` (SQL text, NOT applied). A code read could not have seen this.

### Regression gap CLOSED by the dispatching session

SEAM L honestly reported `connected_bodies` 0.23–1.08% and `friction_force` 0.15–0.27% H2 with **no
0.00% predecessor to compare against** (neither was in SEAM K's sample), and explicitly declined to
claim they were vintage. Closed it directly: reverted both files to `9f479f6` (SEAM K), re-seeded, and
re-ran THE EYE on `connected_bodies` → **0.23 / 0.23 / 0.23 / 0.23 / 0.25 / 0.25 / 0.27 / 0.27 / 0.26
/ 0.26 / 0.72 / 0.73 / 1.08 / 1.08%, 44/44 pass** — the IDENTICAL range. The diffs are pre-existing
baseline vintage; **SEAM L moved zero pixels on a non-energy concept.** Files restored to `dd2b869`,
renderer-syntax re-verified. `newton_third_law` (the only sampled concept exercising the spring path)
was 0.00% across 10 baselines under SEAM L.

### SEAM L carry-forward

- **`E_dissipated`'s `+ W_applied` term (note 3 scope clause) is NOT built** — it needs SEAM M's work
  accumulators. The bar and its reserved slot exist and the state-function form is correct for the
  no-external-work case. **Until SEAM M lands, a state with an applied force must not show this bar**
  — it would read the drive as dissipation. This concept never shows it.
- **`E_t0` capture:** `if (eng.E_t0 == null)` means 0 is not null, so a state whose first published
  frame has zero energy pins `E_t0 = 0` permanently. Correct for a genuine zero-energy start, but a
  state authored with `v₀ > 0` captures its baseline on the first TICK, not on the seeded pose.
  json-author should not be surprised.
- Interpretive call flagged for founder-proxy: note 13 says glow rides "the existing
  `applyGlowEmphasis` path", but that is a Three.js mesh traversal and structurally cannot reach a DOM
  overlay, while note 1/F12 mandates a left-edge measured DOM panel — the two cannot both be literal.
  Kept the DOM panel; gave the energy ids identical semantics via `nlbEnergyApplyGlow` at the same
  `GLOW_DIM_OPACITY = 0.4`, brightness only, one focal.

### Rule 40 landing decision (dispatching session, 2026-08-01)

SEAM K is PUSHED to `feat/ch6-work-energy-power` but deliberately NOT yet landed on master. Rule 40's
stated origin is duplicate work on branches *neither side had pushed*; pushing addresses that risk in
full (`git log --all -S` now sees it, and both sibling sessions fetch). Landing a HALF-BUILT energy
layer on master would put the shared platform in a state no one wants. **Land the K+L+M+N engine
commits on master as one coherent platform change when seam N verifies** — separately from all ch6
concept JSON work, which is the separation Rule 40 actually requires. Revisit if a sibling session
needs the spring substrate sooner.

## Approved chapter map (founder 2026-08-01) — teaching order

1. work_done_by_constant_force
2. positive_negative_zero_work
3. kinetic_energy_definition
4. work_energy_theorem
5. conservative_vs_nonconservative_forces
6. potential_energy_definition
7. gravitational_potential_energy
8. elastic_potential_energy_spring
9. conservation_of_mechanical_energy      ← 0b spec driver (deepest)
10. mechanical_energy_loss_with_friction
11. instantaneous_power
12. average_power

Deferred to a later batch (needs a U(x) graph panel — a separate Phase 0):
  work_done_by_variable_force_integral · F_equals_minus_dU_dx · potential_energy_curve_reading ·
  stable_unstable_neutral_equilibrium_from_U · potential_energy_curve_turning_points
Deferred (different apparatus): pendulum · vertical loop · walking stride · hanging chain

## Checkpoint A result (2026-08-01) — DESIGN_FIX, cycle 1 of 2

Report: docs/loop_runs/ch6/conservation_of_mechanical_energy/founder_proxy_A.md
Pedagogy PASSED (arc, aha, misconception beats, Rule 35/41 all clean — keep verbatim).
The ENGINE SPEC failed: 3 claims the engine cannot render + 4 of 11 union concepts still needing
renderer edits (the survey's own STOP condition).

BLOCKING, independently verified by the dispatching session:
  F1 no spring constant `k` exists; the spring is the founder-approved SCRIPTED spring_action cycle
     → an energy layer plotting 1/2kx^2 over it draws a non-flat total. **FOUNDER DECISION NEEDED.**
  F3 nlbBoundsM forces v=0 at the track bound (L42897-42901) → K and E_total collapse to zero for
     ~85% of every guided state, including the frozen frame + H2 baseline.
  F2 S4's theta->0 ramp makes U_grav identically 0 (three-segment claim false) + apparatus teleport
     at S4->S5.
Fix 1 (incline + fixed wall + spring at the base, permanent home pose) collapses F2, most of F3, F8.

NOTHING dispatches to field3d-surgeon until the spec is corrected — building against the current
text would build the wrong engine, the exact failure Phase-0 exists to prevent.

## CHECKPOINT A CLOSED 2026-08-01 — skeleton.md IS the 0c build contract

Cycle 1: DESIGN_FIX, 16 findings (3 blocking, independently verified against renderer source).
Cycle 2: 14/16 landed; 2 must-fix spec-text patches supplied VERBATIM by the reviewer and applied by
the dispatching session (no third cycle — the reviewer explicitly directed "apply and proceed to 0c,
no re-review needed"). Union table CLOSED: all 11 sibling concepts now authorable as pure JSON.

The cycle-2 catch worth remembering: the architect asserted the symplectic energy ripple would sit
"below 0.1 J display precision". The real figure is ~0.55 J (|dE| ~ (w*dt/2)*E is LINEAR in w*dt) —
re-derived independently before applying. Building it as written would have visibly wobbled the total
in the very state whose caption claims it is constant. Fix = a display-side shadow-Hamiltonian
correction term, NOT a bigger slow_factor.

## 0c DISPATCH BRIEF (field3d-surgeon) — read before dispatching

Build target: an ENERGY LAYER on `newtons_laws_body` per skeleton.md "ENGINE SPEC NOTES" (19 notes).
- ONE bug_class per dispatch, ~100-call ceiling, clean handoff note at the ceiling (Amendment 4).
- Rule 40: this is a SHARED platform file. lom-f and lom-g are LIVE on branches touching it —
  diff-first, region-disjoint, and land the engine commit on master separately from concept work.
- Regression EYE sample MUST include `newton_third_law` (owns the legacy scripted spring apparatus,
  which note 8c keeps working) AND — because note 19c changes shared `N` — a wider sample than the
  choreography spec's list (~10 shipped concepts read N).
- Verify chain: check:renderer-syntax -> tsc -> validate:concepts -> re-seed cache -> visual:eyes ->
  regression sample. Never leave the build broken.
- Scar candidates from Checkpoint A (3 directive rows) are FILES only, not yet applied to the DB.

## FOUNDER DECISION 2026-08-01 — spring: real physics, slowed playback (AMENDS the 2026-07-30 directive)

F1 surfaced a collision: `NLB_SPRING_CHOREOGRAPHY_SPEC.md` (founder-approved 2026-07-30) scopes the
SCRIPTED `spring_action` cycle to "every state that uses a spring, in every concept, now and later",
but an honest energy layer needs a real force law.

**Ruling: build GENUINE spring physics (authored `k`, force `F = -kx` inside the integrator, `x`
exposed to the energy layer), and achieve the teachable slow-motion look by SLOWING PLAYBACK over
that real physics — never by scripting the stroke.** The 2026-07-30 directive's INTENT (a real spring
bounces too fast to teach from) is preserved in full; only its mechanism changes. `slow_factor`
becomes a playback modifier over real physics rather than a replacement for it.

Consequences:
- Unblocks union concept #8 `elastic_potential_energy_spring`, which cannot be authored honestly
  without a real force law.
- `NLB_SPRING_CHOREOGRAPHY_SPEC.md` MUST be amended to record this when the engine change lands on
  master (Rule 40: the platform doc travels with the platform change, not with chapter work).
- The existing scripted push-off states must keep working — the surgeon's build is additive and must
  re-verify `newton_third_law` (which owns the push-off apparatus) as part of its regression sample.

## Notes the next resume must know

- **`newtons_laws_body` is a SHARED engine file** and two other sessions (lom-f, lom-g) are live on
  branches that also touch it. Rule 40: land the energy-layer commit on master separately and
  immediately; never bundle it into concept work. Re-check `git log --all -S "<symbol>"` before
  building any mechanism (Rule 40a).
  **Verified 2026-08-01:** neither sibling is merged to origin/master yet, and both work in regions
  DISJOINT from ours — `feat/lom-f-momentum` owns the `momentum_bench` scenario (SEAM A/B/C, 10
  commits) and `feat/lom-g-offaxis` owns `force_rig` (10 commits). Ours is `newtons_laws_body`.
  Staying region-disjoint is what keeps the eventual three-way merge tractable; every seam dispatch
  carries that instruction. Expect all three to land on master within the same window — whoever
  lands second merges, never force-pushes.
- Desk auto-push hook logs occasional `FAILED rc=1 / cannot lock ref` lines. Checked 2026-08-01:
  those are **stale queued pushes racing each other**, not lost work — `git ls-remote` showed the
  remote already holding the newer commit each time. Confirm with `ls-remote` before treating an
  autopush failure as a real problem.
- Source catalog is PRE-Rule-35: its India-specific anchors must be re-authored universal. See the
  survey's Rule 35 section.
- Engine verify chain (AUTHORING_PIPELINE.md engine-dispatch discipline): check:renderer-syntax →
  tsc → validate:concepts → re-seed target cache → visual:eyes → regression sample. ONE bug_class
  per dispatch, ~100-call ceiling.
- THE CALCULATOR (`npm run numeric:calc -- <id>`) is ADVISORY and applies from concept #1 onward.
- Machine is loaded (8 cores, 2 other live sessions running THE EYE). Expect slower visual runs.
