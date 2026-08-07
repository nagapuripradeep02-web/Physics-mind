# PROGRESS_MATHEMATICS.md — PhysicsMind Mathematics Build

> Dedicated mathematics build log (sibling of `PROGRESS.md`, the physics/engine log, and
> `PROGRESS_CHEMISTRY.md`). Newest session first. Mathematics work started 2026-08-04 on branch
> `feat/mathematics-foundation`.
>
> **Companion docs:** `docs/MATHEMATICS_DISCUSSIONS.md` (the whiteboard test applied + THE RANKED
> LIST — read first; nothing is authored off it) · `docs/MATHEMATICS_ARCHITECTURE.md` (design —
> extend, don't duplicate) · `docs/MATHEMATICS_BUILD_PLAN.md` (phase mechanics + tracker) ·
> `docs/patterns/mathematics.md` (architect pattern library) ·
> `.agents/mathematics_author/CLAUDE.md` (the rigor role).

## Phase status

| Phase | Name | Status |
|---|---|---|
| 0 | Safety baseline | ✅ 2026-08-04 |
| A | Ranked diamond list (BLOCKING gate) | ✅ 2026-08-04 |
| 2 | Authoring layer (`mathematics_author` + pattern library) | ✅ 2026-08-04 |
| 1 | Curriculum plumbing (subject first-class) | ✅ 2026-08-04 |
| 2.5 | `validate:mathematics` + shared-gate extraction + CI | ✅ 2026-08-04 |
| 2.6 | THE EYE made subject-correct (`2d4cb06`) | ✅ 2026-08-05 |
| — | DB migration authored + pre-flighted (`84e85bc`) | ✅ **APPLIED 2026-08-05** by the founder to dev `dxwpkjfypzxrzgbevfnx`, verbatim. Verified after: 681 rows intact, 9 owners, both CHECKs carry the mathematics values. `alex:mathematics_author` + `subject='mathematics'` are now writable. |
| P0 | **`cartesian_plane` scenario** (engine; master, Rule 40) | ✅ **MERGED 2026-08-06** — CP-A…CP-D (PRs #36–#40) on master; F1–F17 built, gate `check:cartesian-plane` all-negative-controlled (**338** assertions — 339 is a doc off-by-one, corrected 2026-08-07). **Pixel layer now exercised (2026-08-07):** THE EYE ran the p5 draw path on two concepts (`derivative_as_secant_limit` 56/56, `graph_transformations` 50/50) and it held — the compute layer was right, but readout PLACEMENT was not, and the fix landed as PR #46. Unblocks ranked P1 #1–#3. |
| 3 | First concept — **`unit_circle_to_sine_wave`** (ranked P1 #4) | ✅ **BASELINE-LOCKED 2026-08-06**, zero known defects encoded. Was 🟡 AWAITING FOUNDER; on desk `feat/mathematics-unit-circle`. Skeleton + mathematics block + TS engine + JSON committed. Gate chain run in full: THE EYE ×4 · `quality_auditor` (FAIL → fixed) · `eye_walker` ×3 · founder_proxy Checkpoint B (**FIX**, on 2 platform blockers only). 18 scar rows filed, 15 closed. Both Rule-40 platform blockers fixed on master (`084f06c`, `e0734a9`). |
| 4 | Mathematics-specific gates | ◐ **interval honesty is now EARNED** — S6 licensed a universal identity empirically (2026-08-05); write the gate |
| 5 | Further scenarios (3D solids, sampling box) | ☐ founder-gated |

**Mathematics is a first-class subject in the tooling, and its visual gate is now correct for it.
The first concept is in flight; nothing is authored off-list.**

---

## 📐 SESSION — PCPL readout placement fixed in two rounds (PR #46), `derivative_as_secant_limit` re-baselined, auto-push found broken on 4 of 4 desks (PR #49) (2026-08-07, `feat/pcpl-readout-placement` + `fix/autopush-hook` → master; `feat/mathematics-derivative`)

> The first session where a mathematics concept's PIXELS drove a platform engine change — P0 was
> proven at the compute layer only, and this is the pixel layer answering back. Two PRs merged, six
> baselines re-approved. The durable output is a verification lesson repeated three times in one
> day: **every wrong call came from reading a rendered artifact at the wrong zoom or the wrong crop.**
> Round 1 called a readout "fixed (soft focal-glow halo grazes 's', legible)" — at 3× the opaque pink
> secant AND the blue curve cut through the "o" and "p", in four states. I then reported an
> off-canvas `Q` truncation that does not exist: the crops I judged were 894×834 and 715×667, not the
> **760×500 canvas**, so I read a CROP BOUNDARY as a canvas edge and dispatched against a phantom.
> The agent refused, measured 250 px of headroom, and was right.

- **🔴 The `slope` strike-through was systematic, and the fix is geometric rather than a tuned constant.** A fixed 13 px perpendicular offset cannot clear a ~170 px HORIZONTAL label straddling a STEEP line: moving the box CENTRE off the stroke leaves its far end swinging back across it. `PM_perpendicularOffset` → `PM_upwardNormal` + `PM_labelClearOffset`, displacing along the line normal by the label's own **support function** (`|hw·nx| + |hh·ny| + margin`) from real measured `textWidth()`. Clearance is now a guarantee at every slope — verified over **360 angles × 5 widths**, worst case exactly the margin — reducing to "half the width + margin" for a vertical line and to the old behaviour for a horizontal one. **Six states were struck, not the four I counted:** STATE_3 as well, and STATE_4 geometrically though it draws no chord readout there.
- **Round 1 also delivered `readout.offset` parity** for `secant_line`/`tangent_line` with `plot_point`, needing **zero schema change** — `scene_composition` primitives are `z.record(z.string(), z.unknown())`, an open record — plus a collision-aware side-flip for `plot_point.readout` scoped to axis / tick-label band / off-canvas. That flip is what fixed the founder's own repro, `P = (0.75, 0.28)` on STATE_6.
- **🔴 The defect I invented, and the agent that refused to build it.** `Q` renders complete (`Q = (2.00, 2.00)`, `Q = (1.90, 1.80)`); swept across its authored slider range its box reaches **x1 = 508.4 of 760**. The clamp shipped anyway as **asserted no-op robustness** with a negative control recording that a side-flip can never fix a horizontal overrun — `graph_transformations`' `p_prime` at x1 = 732.4 of 760 is the fleet's tightest and where it would first earn its place. **Second session running that a subagent was right to refute the dispatching session's premise.**
- **The fix introduced one new defect, disclosed rather than absorbed.** Freeing STATE_2's readout drove it onto the authored `slope_dual_label` caption — a 34 px text-on-text overlap, confirmed at 4×. Structural cause: **canvas-drawn readouts never enter the de-overlap solver** (`subSimSolverHost.ts`) that places `label` primitives, so neither side can avoid the other and no gate can see it. Filed OPEN/MAJOR, kept separate from the sibling-ink row because it has a cheaper remedy — register readout boxes as solver obstacles.
- **🔴 The solver is worse than that row says.** Live logs read `subSimSolverHost enabled=true states=9 primitives_resolved=0 warnings=2`: on this concept it resolves **nothing at all**, and cannot register the `run`/`rise` vectors as obstacles either. Wants folding into the row before anyone picks it up.
- **Fixed by content, not engine, deliberately.** `slope_dual_label` moved from (382,166) — CENTER-aligned (`drawLabel` uses `textAlign(CENTER,CENTER)`), so spanning x 340–424, straight across the freed readout at 297–375 — to **(640,152)**, stacking under `chord_dual_label` (640,130) in the right-hand definitions column and matching that label's own design note. Outside the plane viewport (x ∈ [60,460]) and **independent of the readout's slope-dependent placement**, so no future clearance change can re-collide it. The engine desk refused to touch the chapter's JSON (Rule 40); the chapter desk carried it.
- **THE EYE's stale-cache gate did its job on a mathematics concept.** It refused to run against a pre-edit cache (`cached 1b492a5f` / `source 3e106bbc`), naming the documented scar `eye_reads_the_hand_seeded_cache_not_the_current_source`. Separately, **`npm run seed:concepts` is broken** for this path (`sh: tsx: command not found` — the script calls bare `tsx`, not `npx tsx`); mathematics re-seeds via `src/scripts/_seed_subject_cache.ts`, which is what the gate's own message tells you.
- **`git apply --3way` is the only safe way to test an engine diff on a sibling desk.** A bare renderer file-copy silently drops that branch's own unmerged `computePhysics_*` registration, nulls `PM_physics`, and yields `EYE_CAPTURE_ABORTED` — three stalls in round 1. Also worth recording: `git apply --3way` **stages** its result, so reverting needs `git restore --staged --worktree`, not `git checkout --`, which restores from the index and looks like a no-op.
- **🔴 Cross-cutting: the auto-push hook was broken on 4 of 4 worktrees — 11 FAILED/SKIP against 6 ok.** Belongs here because it is what stranded this round's engine work. Three defects. (1) **rc=128, real loss:** the push path was chosen by asking *"does an upstream exist?"*, TRUE for a worktree branched off a remote-tracking start point (upstream = `origin/master`) — a bare `git push` under `push.default=simple` then fatals. `feat/pcpl-readout-placement`: **0 successes, 2 failures**, both rounds on one disk, found by accident. (2) **The retry loop was dead code** — `for attempt in 1 2 3` could never reach iteration 2 after a failure. (3) **A stale failure printed as a live one**, which misled me mid-session. Also fixed: the divergence message asserted "history rewritten" and recommended `--force-with-lease`, but a remote that merely ADVANCED reaches the same branch and needs the opposite remedy — force there destroys a teammate's commits.
- **Corrected in-session: the hook was NOT losing work everywhere.** The `rc=1` failures on `feat/mathematics-derivative` were **benign races** — the log shows it pushing `ec682a68` while the rejection says the remote "is at `ec682a68`". A concurrent push had already landed it. Only rc=128 stranded anything; all five desks checked, **none missing commits**.
- **That scar became a permanent gate, verified in BOTH directions.** `scripts/check-autopush-hook.sh` → `npm run check:autopush-hook`, wired into `verify.yml` at position 5. Fixed hook **4 passed / 0 failed**; pre-fix hook **1 passed / 3 FAILED** — the control was run first, because a gate that cannot fail is worthless. Hermetic (temp bare repos, scratch `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_NOSYSTEM=1`, no network), and **`push.default` is deliberately NOT pinned** in the sandbox: git's own default is what triggers case 1, so pinning it would erase the bug.
- **A documentation off-by-one caught by counting instead of trusting.** The round-2 commit message and my brief both cite `check:cartesian-plane` **339/339**; git-steward counted `PASS` lines independently, found **338**, confirmed there is no separate total print, and noted it in the PR rather than reconciling it silently. Everything passes either way — but P0's gate count in this log is 338.
- **Verification:** `check:renderer-syntax` OK ×3 · `tsc` **0** · `validate:concepts` **149 PASS** · `validate:mathematics` **2/2 PASS** · `vitest` **354/354** · `check:cartesian-plane` **338 PASS / 0 FAIL** · `check:autopush-hook` **4/4** locally and in CI (~9 s) · THE EYE `derivative_as_secant_limit` **56/56** (×3 across the round) · `graph_transformations` **50/50, 0.00% on all 8 states — it never moved**, so no signal there · CI green on both PRs.
- **Re-baseline (founder-approved):** `visual:approve` → **9 baselines**, 13 files. Changed exactly **STATE_2/3/5/6/7/9**; STATE_1/4/8 byte-identical — the forecast held with no surprises. Every changed state's readout was read at frame level before approval, not gate-checked. A final EYE run against the NEW baselines returned **56/56, 0 failed**, which also re-tests determinism (Rule 36).
- **State at close:** **PR #46 MERGED** (`aa04883`) · **PR #49 MERGED** (`8c82110`) · master at `8c82110` · `feat/mathematics-derivative` at `03e63e7`, pushed, **no PR yet** — it carries the `slope_dual_label` fix and the re-baseline. All five desks: **0 commits existing only on this machine.**
- **NEXT:** (1) **PR `feat/mathematics-derivative`** — the only branch holding session work without one. (2) **Widen the de-overlap-solver row** to record `primitives_resolved=0`, then fix it by registering canvas-drawn readout boxes as obstacles — that closes the STATE_2 class properly instead of by moving captions. (3) The **sibling-ink row** stays OPEN: `Q = (1.07, 0.57)` (S3) and `y = x²/2` (S2/S7) are still struck by curve/secant ink. (4) **Fix `npm run seed:concepts`** (bare `tsx` → `npx tsx`). (5) Decide whether the asserted-no-op canvas clamp stays or comes out. (6) Add `derivative_as_secant_limit` and `graph_transformations` rows to the Phase status table once each reaches a defined state.

---

## 🏗️ SESSION — the engine round: Checkpoint A closes, CP-A…CP-D land, six PRs merge in stack order (2026-08-06, docs branch + five engine desks → master)

> The session that took `cartesian_plane` from a design document to a merged engine. Checkpoint A's
> cycle budget was spent, four surgeon dispatches built F1–F17 as a stacked PR chain, every dispatch
> surfaced a real defect by being told to refute rather than comply, and the whole stack merged to
> master with the composed tree re-verified. P0 is closed at the compute layer.

### Checkpoint A cycle 1 — the real founder-proxy, Opus-pinned, DESIGN_FIX (3 P1 · 8 P2 · 6 P3)
- Two founder rulings recorded first so cycle 1 reviewed the settled document: **FLAG 1 ratified**
  (`∫` on core S4, `lim` denied on core) and **FLAG 6 bought** (9 contract deltas +
  `show_partition`, `reveal_stagger_ms` named; CP-C enlargement accepted).
- The proxy's three P1s, each independently re-verified before acting: **every renderer line
  citation in §⓿ was stale** (two engine commits landed between survey and skeleton; `:1111` — the
  value-fraction line the n-law rests on — was a closing brace; fix = `symbol @line @SHA`);
  **S4 taught "the gap is exactly 4/n"** against the document's own closed form `4/n − 4/(3n²)`
  (0.039867 vs 0.040000 on a 6-dp HUD at the state's own entry value); **the FLAG-1 ruling was
  applied on 3 of 5 symbol surfaces** (S3's HUD still printed `∫` one state early).
- The probe-don't-grep mandate (`34c43c4`, same morning) was **not grandfathered**: the one number
  nobody probed (S4 cap crossing: claimed 3908 ms, measured 6316.5) was the one that was wrong,
  beside five the probe reproduced exactly. §12 now carries a measured column with pasted probe
  output; §⓿ an evidence tier per row.
- **Amendment round 2 applied all 17 findings**; cycle budget (2) exhausted → **ESCALATED TO
  FOUNDER**, three content rulings still open: the exact two-term gap surface vs `≈ 4/n` · the
  published per-state `words_max = ⌊2.5 × motion_window⌋` budget · `Σ`/`xᵢ` on S2's core surface.
  Landed as **PR #35** with the Phase-0 doc's AMENDMENT 3 + the `angle_arc` ledger row (below).

### CP-A…CP-D — four dispatches, five PRs, every one told to refute and every one finding something
- **CP-A (PR #36)** — the frame: `PM_planeRegistry` + Pass 0.25, `PM_planeResolve` funnel,
  authored ticks (`number|pi|none`), `equal_scale` (shrink-only), `plane_id` opt-in for
  body/vector/label/locus_trace, F11 tracking-label contract (position_expr reads DATA under a
  plane). Gate sections 1–4, 11, 15.
- **CP-B (PR #37)** — `function_plot` (x-domain sampler, D4 break-on-discontinuity) + `plot_point`
  (drag + readout). **Found: the draft contract's `focal_id` exists nowhere in the renderer** (doc
  defect #2). The F5 seizure clause turned out to be four independent slider-scans unified into ONE
  `PM_stateLiveControlVars`; the φ-law Gate 9(d) extension unions `plot_point.drag.bind_variable`
  (seizure, not sliders, is the mechanism — concept #2 sketches the exact collision).
- **CP-C split on measurement** (CP-B burned 95 of ~100 calls; the doc pre-authorised the split).
  **CP-C1 (PR #38)** — `region_fill` (signed) + `riemann_bars` (4 modes incl. `trapezoid`) + the
  D11 publication contract (computed once in the placing loop, published, never printed —
  refusing the sigma/pi relocate-the-duplicate topology). **Found: the publication clobber** —
  `drawPlotPoint`'s drag branch reassigns `PM_physics` wholesale mid-pass, wiping same-frame
  publishes; C1 worked around it by inverting D12's draw order and flagged the debt honestly.
- **CP-C2 (PR #39)** — the real fix: **`PM_riemannPublish`, a frame-scoped map OUTSIDE
  `PM_physics`** (supersedes Checkpoint A F6's `PM_physics.derived` ruling — correct when measured,
  pre-dating the reassignment discovery), D12's order **restored**. C2 also found the inversion's
  hidden defect: fill and curve read two different values of `b` in one drag frame. Orchestrator
  pushed back once (the two byte-identical scope functions had diverged — 14 call sites blind to
  published keys); surgeon agreed, unified, nothing moved (214 gate assertions unchanged).
  Non-finite rule reconciled (drop/break, matching D4); signed colour = sign of `bar.area`.
- **CP-D (PR #40)** — `secant_line`/`tangent_line`, slope in DATA coordinates (the trap: pixel
  deltas give −0.1521 where cos(1)=0.5403 on the spec driver's own 220/62 px-per-unit plane —
  wrong sign AND magnitude, gate-pinned). Liang-Barsky clip data-in/data-out. **Found doc defect
  #4: #11's sketch claims `arg z` renders "via F7" but `drawAngleArc` has no `plane_id` support.**
  Closing assessment: F1–F17 all built; zero-renderer-edits holds with high confidence for #3
  (it drove the engine), **thinner for #2** (survey sketch only, never a 0b pass — and #3's 0b
  surfaced ten contract changes its sketch missed).

### The doc catches up + the scars are filed
- **AMENDMENT 3** (PR #35): D11 scope map superseded → `PM_riemannPublish`, merged into BOTH scope
  functions, with the durable rule stated; phantom `focal_id` removed; Gate-14 signed-colour
  generalized to net contribution. **Ledger item 7**: `plane_id` on `angle_arc` — founder-ruled
  record-don't-build (no queued concept needs it; #11 is P3).
- **Two `engine_bug_queue` rows filed and read-back-verified** (seed script
  `_seed_engine_bug_queue_pcpl_cartesian_plane_round.ts`, committed):
  `pcpl_riemann_bars_composition_and_draw_order_undeclared` (FIXED, directive — *a value published
  for same-frame reading lives in a frame-scoped map, never in `PM_physics`*) and
  `pcpl_cannot_draw_a_secant_or_tangent_with_a_live_slope` (FIXED, incident).

### The merge — six PRs, stack order, composed tree re-verified
`#35 → #36 → #37 → #38 → #39 → #40`, each stacked PR retargeted to master only after its
predecessor merged. Merged master verified directly: renderer syntax ×3 · `tsc` 0 ·
`check:cartesian-plane` ALL PASS (every negative control) · vitest 354/354 · `validate:concepts`
149/149. Five desks closed (`desk:close --yes`; branches preserved on GitHub).
**CI note:** GitHub's hosted runners were degraded all afternoon — the red checks on #37/#39/#40
were "not acquired by Runner" cancellations with zero steps executed, not test failures; every
commit passed the local chain twice under two independent agents.

### Open at session end
1. **Founder: three content rulings** on the escalated skeleton (gap surface · words_max approach ·
   Σ on core) — `mathematics_author` is blocked on them.
2. **The pixel-layer test**: no p5 draw code in the new family has ever executed; the first
   authoring pass through THE EYE is the true close of P0. Plan order: #1 `graph_transformations`
   ships first; #3 is the spec driver.
3. **#2 (`derivative`) needs a 0b-level skeleton** before its zero-edits claim is trusted; watch
   for: the "undefined at h=0" callout (no conditional-visibility on `label`), secant↔tangent
   fade composition, and ledger item 7.
4. Legacy validator backfill noise (400 word-budget + 199 tts-id warnings) impersonated a real
   failure twice today — clear it or silence it, founder call.

---

## 🔧 SESSION — fix all: the two platform blockers land on master, and the concept re-baselines clean (2026-08-05/06, master + desk `feat/mathematics-unit-circle`)

> Founder directive: **fix all.** Both Rule-40 platform blockers, the shared tooling defect, every
> remaining cosmetic, and the scar-list hygiene. `unit_circle_to_sine_wave` is re-approved on a build
> with **zero known defects encoded** — the previous baseline knowingly carried three.

### Two platform commits on master, separately (Rule 40)

**`084f06c` — the three missing primitive brackets in `parametric_renderer.ts`.** All three were found
by walking THE EYE's frames on the first mathematics concept; all three bind shipped physics concepts.

| Fix | What it repairs |
|---|---|
| `drawCanvasSlider` reads the live choreographed value before a drag seizes | the caption and knob no longer print the untouched seed while the HUD tracks live — **two readouts of one quantity disagreeing in one frame.** Repairs `scalar_vs_vector` and `resultant_direction` too |
| `drawVector` + `drawAngleArc` consume `PM_animationGate` | `appear_at_ms` is no longer silently inert on a vector or an arc, so a reveal chain stops half-firing |
| `drawVector` consumes `PM_focalEmphasis`, and offsets a near-vertical label ACROSS its segment | a vector can finally brighten as focal / dim as a peer (Rule 29); the `y` on a height segment stops being bisected by its own stroke and read as a stray arrowhead |

The slider fix is the one the scar row said had no alternative: `visible_controls`, the remedy its own
DO clause prescribed, **does not exist on this renderer** (zero hits), and `drawCanvasSlider` has no
animation gate, so a PCPL slider cannot be time-gated at all. The engine fix was the only path.

**`e0734a9` — `check-layout-overlap.mjs`.** It measured the **raw template**: a HUD row authored as
`"θ = {s.toFixed(2)} rad ({theta.toFixed(0)}°)"` is 45 source characters and renders as 19, so boxes
came out up to 5× too wide. Measured before/after on this concept: `hud_2` was **x = −19..319**, a
338 px box running off the left edge of a 760 px canvas; it is now **x = 73..227**. Ten reported
collisions become zero and **all ten were false** — worse than reporting nothing, because it trains
authors to ignore the output. It also could not open a mathematics concept at all (ENOENT against the
flat dir): the same blindness that left chemistry with no CI for five sessions, so the namespaces are
now enumerated in one list rather than added one incident at a time.

### THE LESSON: the fix that introduced the defect, at the pose nobody samples

The re-approval walk returned **APPROVE-READY: NO** on exactly one frame class — and the defect was
created by the previous commit's own fix. Moving `π − θ` off the arc's midpoint label to a **fixed**
position cleared the frozen pin at 62° and was swallowed by the mirror point at 45°. That is the
ping-pong's lower turning point, where velocity is zero and the eye rests, and it is the pose the
symbol is *introduced* in — the entire 2400→4000 ms mirror build happens there. It rendered as `– θ`.

**A fixed label annotating a moving body must clear that body's entire authored range, not its pose at
the pin — and a ping-pong DWELLS at its endpoints, so those are the most-seen poses, not the least.**
The symbol went back onto the arc it names, at radius 116 so its midpoint label rides outside the rim,
verified by computation across the whole 45–80° range against both the mirror point and the point's
own height segment.

### Scar hygiene — 15 closed, 5 left open on purpose

A row that is fixed but left OPEN is the defect this session had already reported once:
`parametric_from_expr_to_expr_never_consumed` sat OPEN long after `drawVector` began consuming both
fields, and would have steered an author away from the very fields this concept is built on. Closures
set status + `fixed_in_files` only — `root_cause` and `probe_logic` are the incident's evidence and
must survive its closure so a recurrence stays recognisable.

**Left open deliberately, each with its reason in `_close_engine_bug_queue_unit_circle_fixes.ts`:**
`glow_focus` still cannot resolve an expression-driven vector or a trace, and still ignores its
target's gate (both worked around in authoring, engine untouched) · `drawAngleArc` still places its
label at mid-angle blind to what is drawn there · the superseded-run-dir row is process, not code ·
and **`eye_pixel_gates_pass_over_a_body_frozen_at_the_renderer_default_coordinate`** — THE EYE is
unchanged and still cannot see a body that fails to move. That is the row that most deserves its gate.

### Verification

`tsc` **0** · `validate:concepts` **149/149** · `validate:chemistry` **10/10** ·
`validate:mathematics` **1/1** · `npm test` **327/327** · `check:agents` **15/15** ·
`check:renderer-syntax` + `check:renderer-backticks` clean · `check-layout-overlap` **0 collisions
across 8 states** · THE EYE **50/50** (35 pixel + 15 H2 regression).

An eye_walker read all 203 frames of the pre-fix build and confirmed every platform fix in pixels —
including that the new focal-dimming **broke nothing**: apparatus recedes, the taught element carries
the eye, and nothing load-bearing became too faint. Baselines re-approved on run `20260806-000750`.

### ⏭ NEXT — two founder actions

1. **Nothing is pushed.** master carries two platform commits; the desk has diverged and needs
   `--force-with-lease`.
2. **The fleet re-baseline.** `drawVector`'s focal channel dims non-focal vectors on every PCPL
   concept declaring a `focal_primitive_id`, and the slider fix changes every choreographed caption.
   Those H2 diffs are **expected and correct, not regressions** — but resolving them ends in
   `visual:approve` across the fleet, which is founder-only (Rule 17).

---

## 🔬 SESSION — the concept walked: THE EYE said 35/35 over a build whose main marker never moved (2026-08-05, desk `feat/mathematics-unit-circle`)

> Ran the full gate chain on `unit_circle_to_sine_wave`: seed → gates → THE EYE → `quality_auditor`
> **‖** `eye_walker` in parallel → fix → re-run → founder_proxy Checkpoint B. Four EYE runs, three
> frame walks, one audit, one build gate. **Nothing is approved** — `visual:approve`, TTS,
> `PILOT_CONCEPTS` and deploy are untouched (Rule 17).

### Bottom line

**Path (b) is proved: mathematics goes end-to-end on the shipped parametric renderer at zero engine
spend, and the PRIMARY AHA is delivered by the pixels rather than asserted by the narration.** That is
Checkpoint B's own wording, and `STATE_4__frozen.png` is the evidence — point, dead-horizontal
carrier, pen, half-drawn wave, all at one angle.

The gate returned **FIX, not APPROVE**, on two platform defects no JSON can work around. Everything
else found across the four passes is fixed and re-verified in pixels.

### THE LESSON: four green runs, and the first three could not be trusted

`npm run visual:eyes` returned **35 checks / 35 passed / 0 failed** on every run, including the one
where **eight expression-driven bodies — the point on the circle, both wave pens, the continuation
pen, the mirror point, the foot and both explore tracking dots — never moved at all**, in any of the
8 states. Measured at logical (199.4, 199.0): identical centroid, identical pixel count, every frame.

The cause is a genuine trap rather than a slip. **The two expression-driven position fields on this
one renderer take different shapes:**

| field | shape | reader |
|---|---|---|
| `vector.from_expr` / `to_expr` | ONE object-literal **string** `"{x: …, y: …}"` | `PM_safeEvalPoint` (`:2251-2262`) |
| `body.position_expr` | an **object** of separate `.x` / `.y` expression strings | `PM_safeEval` ×2 (`:1268-1272`) |

Author the body field in the vector's shape and `.x` is `undefined` on a String, so both coordinates
take the fallback branch into drawBody's hardcoded `{x: 200, y: 200}` (`:1250`). The Zod schema does
not type the field. `tsc` passes. `validate:mathematics` passes. And the pixel gates pass **because
the traces and segments around the frozen bodies legitimately move**, which is exactly what the
aggregate thresholds measure. The mathematics block's §1b table wrote both fields in the same
notation, which is how they got conflated.

**The gates are structurally incapable of seeing this**, and that is now a filed row
(`eye_pixel_gates_pass_over_a_body_frozen_at_the_renderer_default_coordinate`): D1p/D5/D6/D7 reason
about changed-pixel ratios over the whole canvas and carry no per-primitive expectation, so an
element that *should* move but does not is invisible whenever anything else moves. It is the exact
complement of the recorded D6 blind spot — **D6 cannot see a thin element teleport; these gates
cannot see a thin element fail to move.** Both were found by a human-equivalent frame read, twice.

### What each pass caught that the others did not

- **The auditor alone** caught the one defect that was not a rendering bug: **S6 licensed a universal
  identity empirically.** The surface asserts `sin(θ + 2π) = sin θ` for all real θ while the narration
  inferred it from the drawing — "the same heights come back in the same order, so the wave repeats" —
  over 0.43 of one extra period. The mathematics block §2b forbids exactly that phrasing and names it
  the failure mode the subject exists to prevent. Rewritten to license the identity by the returning
  construction. **This is the class `validate:mathematics` was always going to need a gate for, and it
  is the first real defect to seed one** (Phase 4's "interval honesty" candidate, now earned).
- **The walkers** caught halos rendering in empty canvas, the frozen/H2 pin archiving each state's END
  pose (S3 — whose whole job is that sine is *signed* — was baselining θ=360° with a **zero-length**
  height segment and `−0.00`), beaded recap traces, `−0.00`, and the formula box striking through the
  `cos θ` label.
- **Checkpoint B** caught the sharpest one: **S7 opened on the degenerate case of its own identity.**
  The advanced state whose claim is that two *distinct* angles share one height held at θ = 0 for four
  seconds — both heights 0.00, both points coincident, the identity vacuously true and showing
  nothing. `PM_choreoValue` returns `from` before `start_ms`, so `from` **is** the opening frame, and
  the design had already chosen 45° because sin 45° = cos 45° = √2/2 is exact.
- **Checkpoint B also caught the process failure**, and it is the row worth keeping: the JSON violated
  the **authoring-side DO clause of an OPEN scar filed against this same concept, in the same session
  that filed it**, in three primitives. The scar list was consulted before authoring and never re-run
  against the finished artifact. A field authored on a primitive type that silently ignores it is
  indistinguishable from correct authoring at every gate the repo runs.

### Verification (evidence, not assertion)

Tripwire green on the final build: `tsc` **0** · `validate:concepts` **149/149** (isolation intact) ·
`validate:chemistry` **10/10** · `validate:mathematics` **1/1** · `npm test` **327/327** ·
`check:agents` **15/15** · `check:renderer-syntax` clean · THE EYE **35/35** (run `20260805-220751`).

The final walk confirmed **all seven claimed fixes landed in the pixels**, including the three that
mattered: no body sits at (200,200) in any of 173 dense frames; S3's frozen frame archives θ = 220°
with the height segment hanging **below** the line and `sin θ = −0.64`; and S4's equality holds at
every one of 22 sampled instants with the carrier dead horizontal.

### Open items

1. **TWO PLATFORM BLOCKERS — Rule 40, must land on master separately, dispatched to `pcpl_surgeon`.**
   Neither is fixable from any JSON, and both are why Checkpoint B says FIX rather than APPROVE.
   - **`drawCanvasSlider` reads only `PM_sliderValues`** (`:3097-3104`), which `PM_applyChoreography`
     never writes — so S3/S7/S8 print `angle θ: 0°` beside a HUD reading 220° / 45° / 317°. Two
     readouts of one quantity, disagreeing, on the state a teacher scrubs. The existing row
     `pcpl_slider_label_stale_under_choreography` forbids shipping a new PCPL concept in this shape,
     and **its own prescribed alternative does not exist**: `visible_controls` has zero hits in
     `parametric_renderer.ts`, and `drawCanvasSlider` has no `PM_animationGate`, so a PCPL slider
     cannot be time-gated at all. ~3 lines; repairs `scalar_vs_vector` and `resultant_direction` too.
     **Founder call recorded, not taken:** Checkpoint B recommends escalating that row MODERATE →
     MAJOR. It belongs to `peter_parker:renderer_primitives` and severity is that owner's scheduling
     signal, so it is flagged rather than edited.
   - **`drawVector` has neither `PM_animationGate` nor `PM_focalEmphasis`; `drawAngleArc` lacks the
     gate.** So `appear_at_ms` is inert on vectors and arcs, and a vector can be neither brightened as
     focal nor dimmed as a peer. The inert fields are now **deleted** rather than left claiming timing
     the renderer discards — which costs S7 its authored reveal-build beat. Recorded, not faked.
     Bundle both halves in one commit; expect a fleet-wide re-baseline.
2. **`pcpl_vector_label_at_segment_midpoint_is_bisected_by_a_vertical_segment`** (MAJOR) — `drawVector`
   puts a label at the segment midpoint 4 px up, which clears a horizontal segment and splits a
   vertical one. The height segment is vertical *by construction*, so the symbol `y` is bisected in
   five states and reads as a stray arrowhead. `y` is asserted on two formula surfaces and legibly
   defined on canvas nowhere.
3. **`parametric_from_expr_to_expr_never_consumed` is STALE-OPEN.** It states there are zero
   non-comment hits; `drawVector` consumes both at `:2251-2262` and the comment there records the fix.
   An author consulting the scar list today would avoid the very fields this concept is built on.
   Closing a row is an owner action.
4. **The drill-down cluster migration is AUTHORED, NOT APPLIED** (9 clusters, 45 phrasings verbatim).
   Applying is a founder action.
5. **`check-layout-overlap.mjs` measures the un-interpolated template**, reporting boxes up to 5×
   too wide — 5 collisions reported on this concept, 4 of them false. It should interpolate first.
6. Unchanged from the previous session: the D6 thin-content lens gap, `graph_interactive` rendering
   nowhere on 48 physics concepts, `cartesian_plane` gating ranked P1 #1–#3.

### Scar rows filed — 14 this session, across four seed scripts

`_checkpoint_a.ts` (design time, prior session) · **`_build_gate.ts`** (4: the `position_expr` shape,
glow_focus unable to resolve an expression-driven vector or a trace, `drawVector`'s missing focal
channel, the EYE passing over a frozen body) · **`_walk.ts`** (6: `appear_at_ms` inert on
vector/arc, halo before its target appears, budgeted pins never transcribed to `eye_capture_ms`,
signed zero, formula-surface footprint, walking a superseded run dir) · **`_checkpoint_b.ts`** (4: the
bisected vector label, narration naming an undrawn reference line, opening on a degenerate identity,
and the DO-clause-never-re-checked directive). Plus recurrences on
`pcpl_slider_label_stale_under_choreography` and `frozen_pin_unbudgeted_…`.
**24 rows now tagged on this concept, and Checkpoint B recorded zero recurrences of any design-time
class** — the Pass-1 ratchet held.

### ⏭ NEXT

**Founder review of the frames, then a decision on the two platform blockers.** The concept is
authoring-complete and gate-clean apart from them. Recommended order: dispatch the two `pcpl_surgeon`
fixes to master as one Rule-40 commit (they are ~3 lines and one bracket, and both repair shipped
physics concepts), re-run THE EYE fleet-wide, then re-walk this concept and take it to
`visual:approve`. Phase 4's interval-honesty gate is now **earned by a real defect** (S6) rather than
anticipated, and should be written next.

---

## 📄 SESSION — the concept JSON authored: seven places the design met the renderer and one of them had to give (2026-08-05, desk `feat/mathematics-unit-circle`)

> Session opened on a stale "⏭ NEXT". The previous log said *"commit the skeleton + mathematics block
> + TS engine, seed the cache, then `visual:eyes`"* — but `src/data/concepts/mathematics/` held only
> its README. **The `json_author` stage had never run**, so there was nothing for the cache seed to
> seed. Corrected before any work started; the seed/EYE steps are still ahead, not behind.

### Bottom line

`src/data/concepts/mathematics/unit_circle_to_sine_wave.json` now exists — 8 states, 192 primitives,
83 KB — and the whole verification chain is green. **Seven places the authored design met the actual
renderer needed a decision; six were mechanical, one (J2) changes how object-anchored text is authored
on this engine for every future mathematics concept.** All seven are written down below rather than
absorbed silently, which is the only reason they are cheap.

### Verification (evidence, not assertion)

`npx tsc --noEmit` **0** · `validate:mathematics` **1/1 PASS** · `validate:concepts` **149/149 PASS,
0 FAIL** (byte-unchanged — the flat scan still cannot see the subject subfolder, isolation intact) ·
`validate:chemistry` **10/10 PASS** · `npm test` **28 files / 327 tests** · `check:renderer-syntax`
clean on all three engines · `check:agents` **15/15**.

**A geometry pass was written and RUN, not eyeballed.** It models `PM_choreoValue`,
`PM_choreoVarsAtTime` and `PM_interpolate` exactly as the renderer implements them, then sweeps every
state at 100 ms and every trace at 40 sample points:

| Check | Result |
|---|---|
| **the φ law** — slider vars ∩ trace identifiers per state | **∅ in all 8** ✅ |
| **the equality invariant** — θ ≡ φ at every instant a pen or carrier is on screen | holds to 1e-6 across every state ✅ |
| locus sample budgets ≤ 240 | max 233 (S2) ✅ |
| **template leak** — any literal `{` surviving interpolation | **zero**, over every state × every 100 ms ✅ |
| safe box x∈[40,720] y∈[40,460] | every evaluated point inside ✅ |
| slider-band clearance (nothing below y≈445 on S3/S7/S8) | lowest authored text y = 426 ✅ |

**Every pin frame the skeleton §12 asserts reproduces exactly**, which is the real test that the
degrees-native revision survived transcription into pixels:

| Pin | Skeleton says | Measured |
|---|---|---|
| S2 @12600 | `s = 4.00` over `θ = 4.00 rad (229°)` | `s = 4.00`, `θ = 4.00 rad (229°)` — the formula surface `s = θ (r = 1)` reads TRUE against its own HUD (F19) ✅ |
| S4 @12600 | θ = φ ≈ 3.86 rad, sin θ ≈ −0.66 | 3.86 rad (221°), −0.66 ✅ |
| S5 @12600 | θ = φ ≈ 3.42 rad, cos θ ≈ −0.96 | 3.42 rad (196°), −0.96 ✅ |
| S6 @11400 | θ ≈ 7.80 rad, curve head x ≈ 659 | 7.80 rad, x = 659 ✅ |

The ASCII-minus scar (`ascii_minus_in_oncanvas_math_from_tofixed`) is discharged **inside the authored
string**, not left to a downstream sweep: every signed readout is
`{sin_theta.toFixed(2).replace('-','−')}`, which reaches `PM_interpolate`'s complex-expression branch
(`new Function`, no sanitisation — verified at `:1041-1050`). 19 U+2212 in the file, 9 guards. `theta`
and `s` are never negative here and carry no guard, exactly as callout 4 specifies.

### The seven findings — where the design met the renderer

**J2 is the load-bearing one.** `drawLabel` reads **only** `spec.position` / `_solverPosition`
(`parametric_renderer.ts:1676-1684`) — it has no `position_expr` and no anchor resolution. The
skeleton §10(b) types three symbols as object-anchored `label` primitives (`θ` on the arc, `y` beside
the height segment, `s` riding the rim); **none of the three can track as a `label`.** Object-anchored
text on this engine must ride the OWNING primitive's own label field instead: `angle_arc.label`
(drawn at the arc's mid-angle at `radius + 14`, `:2695-2703`) and `vector.label` (drawn at the segment
midpoint, `:2308-2313`) — both genuinely track. `locus_trace` has no label field at all, so `s` is
delivered by the HUD row + the formula surface, which §10(b) already required anyway. **This is a
pattern-library fact, not a one-concept workaround** — it belongs in `docs/patterns/mathematics.md`
beside the F1 φ-law erratum the skeleton already filed.

1. **J1 — assessment count.** Skeleton §10(f) specifies **4** items; the shared Zod schema requires
   **≥6** whenever `assessment` is present (`assessmentSchema.questions.min(6)`), and Gate 19d then
   forces every uncovered state into `non_assessed_states`. With only 4, that list would have had to
   contain **STATE_4 — the PRIMARY AHA** — and STATE_6. Declaring the aha state "teaches no testable
   claim" is not true, and the auditor sanity-checks that list for truthfulness. Authored **6**: the
   skeleton's four verbatim in intent, plus two on ideas its OWN Block-1 exam-backwards trace already
   names (reading what the graph's horizontal axis measures → S4; the period → S6). No scope invented.
2. **J3 — `renderer_pair.panel_b`.** Required as a string by the schema; the skeleton specifies no
   panel B. Authored **`"none"`**, not `"graph_interactive"` — writing the latter would have made this
   the 49th concept claiming a panel the review builder never paints (open item 3). "none" is the
   honest encoding and costs nothing to change if a panel-B branch ever lands.
3. **J4 — S6's angle arc past one full turn.** θ runs to 515.66°, which `drawAngleArc` hands to p5's
   `arc()` as a span > 2π — undefined rendering. Authored `angle_value_expr: "min(theta, 360)"` so the
   arc **saturates at one whole turn** while the HUD counts on past 360°. Truthful ("at least one full
   turn done"), deterministic, and `min` is already injected by `PM_buildEvalScope`.
4. **J5 — the two-entry θ choreography in S7.** `PM_applyChoreography` keeps the **last** entry per
   variable (`:3477-3488`), so the skeleton's separate "hold" entry would have been dead code; and
   `PM_choreoValue` already returns `from` before `start_ms` (`:1160`), so **the 0–4000 ms hold is
   automatic** from the single ping-pong entry. Authored as one entry. The same reading collapses the
   written holds in S5 (θ at 0 through 0–4000) and S6 (θ at 2π through 0–3000) — both are now
   structural rather than authored, which is strictly safer.
5. **J6 — HUD row spacing is 34 px, not the ≥40 px §11 states.** Three rows at 40 px would put the
   bottom row at y = 456, **inside the renderer-owned slider band** (y≈445–470, callout 9). 34 px is
   more than twice the 14 px line height, so collision is impossible; the ≥40 px figure is a
   de-overlap margin for scattered text, not a deliberate stacked column. Lowest row: 426.
6. **J7 — the unit circle is drawn as an outline via `opacity: 0` + `border_color`.** `drawBody`
   applies `spec.opacity` to `fill()` only, while `stroke()` takes `border_color` at full alpha
   (`:1504-1512`). **No shipped concept uses this shape** — it is verified by code read, not by
   precedent, and is the first thing to re-check if the rim ever renders filled.

### What the JSON encodes

8 states (core ×5, extended ×1, advanced ×1, explore core), 2 distinct `advance_mode` values
(Rule 15), **sliders on exactly S3/S7/S8** — the F13 decision, unchanged. Word budgets land at
43/54/55/49/48/39/43/17 EN words, every guided state inside its authored band. `misconception_watch`
on S3/S4/S5 only. `curriculum_tags` carries 8 entries — CBSE verified, **all seven others
`needs_teacher_verification: true`** (38g), including Cambridge split into 0606 (full) and 0580
(partial, degrees-only) rather than one blurred cell.

### Open items

1. **The JSON has not been through `quality_auditor`, and nothing has been committed.** Commits happen
   on founder go. The whole desk (`docs/patterns/mathematics.md`, `src/lib/physicsEngine/index.ts`,
   the skeleton, the mathematics block, the TS engine, the checkpoint-A seed script, and now the JSON)
   is uncommitted.
2. **THE EYE has not run on this concept.** Next after the audit: seed via `_seed_subject_cache.ts` →
   `visual:eyes` → eye_walker (the mathematics addendum) → founder approval → `visual:approve`.
   Nothing about the JSON has been seen as pixels yet — every claim above is code-level, not visual.
3. **J2 belongs in `docs/patterns/mathematics.md`**, together with the two errata the skeleton's own
   FLAGS section already raised (archetype C's `animated_path` carrier; archetype B's slider-drag
   caveat superseded by the φ law). Three pattern-library edits, none applied yet.
4. **The DB migration is APPLIED** (`914124b`, founder, 2026-08-05) and the org-access question is
   **settled doctrine, not an open item** — see below.
5. Items 2–5 of the previous session (D6 thin-content blind spot, `graph_interactive` on 48 physics
   concepts, `cartesian_plane` gating ranked P1 #1–#3, `feat/mathematics-foundation` safe to delete)
   are all unchanged.

### Database access — SETTLED, and this section exists so it is never re-raised

The migration was **APPLIED by the founder on 2026-08-05** (`914124b`) to dev
`dxwpkjfypzxrzgbevfnx`, verbatim. Verified after: both CHECKs carry the mathematics values, 681 rows
intact (physics 497 · chemistry 106 · subject_neutral 78 · mathematics 0), 9 distinct owners.
`alex:mathematics_author` and `subject='mathematics'` are writable.

**The org-access question is answered NO, permanently and by design** — DDL rights on that org would
also cover `student_confusion_log`, `ncert_content` and `pyq_questions`, three NEVER DELETE tables.
DDL is a founder action on the founder's machine (Rule 17), roughly once per subject lifetime.
**An authoring session needs no dashboard access at all:** scar READS run headless through
`src/scripts/query_engine_bug_queue.ts` on the service-role key, scar WRITES are plain data INSERTs
via `_seed_engine_bug_queue_*.ts`. Both were exercised this session from this desk. An earlier draft
of this very log carried a re-diagnosis of the connector and a recommendation to re-authorize it;
that text was **wrong to still be here** and has been deleted rather than annotated — which is the
whole point of the lesson `914124b` records.

### ⏭ NEXT

`quality_auditor` + `eye_walker` on the JSON, the three `docs/patterns/mathematics.md` edits (J2 + the
skeleton's two FLAGS errata), and the S3/S7/S8 slider question (see the next session's log).

---

## 🔭 SESSION — THE EYE audited for mathematics: one blocker fixed, one blind spot recorded, and a migration bug my own pre-flight caught (2026-08-05, master + desk `feat/mathematics-unit-circle`)

> Founder question that started it: *"the EYE is nothing but a set of deterministic tests — does it
> also work properly for mathematics? For every simulation we need to run the eye, the eye walker,
> and the visual approval. All three should run properly."* Correct question to ask before the first
> concept, not after it. The answer was **mostly yes, with one blocker** — and finding it cost
> nothing compared to what it would have cost later.

### Bottom line

Four commits landed on master. The mathematics foundation merged (`a54b993`), the first concept's
platform hunk landed separately per Rule 40 (`5e26843`), THE EYE was made subject-correct
(`2d4cb06`), and the DB migration was fixed after its own pre-flight caught a real bug in it
(`84e85bc`). The unit-circle desk is open, synced and in flight.

### THE EYE audit — what was checked, not assumed

THE EYE is exactly two gates: `runPixelGate` (D1p, D5, D6, D7) + `runRegressionGate`. **Neither
contains a single subject or concept-id branch** — the only hits for `physics|chemistry|conceptId ===`
are calibration comments. `deriveStateMeta`, `deriveStateIds`, `pixelGate`, `regressionGate` and
`visual_approve` have zero subject references. So capture, gates, baselines and approve are
subject-agnostic by construction.

**The part that mattered for mathematics is thin-line content**, and it was already handled:

- **D5** — the canvas-ratio motion lens was calibrated on `field_3d` and, in the file's own words,
  *"structurally cannot see a THIN primitive (a 3-4px force_arrow line, an angle_arc, a traced
  locus)"*. That is `locus_trace`, the unit circle's own primitive. Filed as
  `visual_eyes_d5_thin_primitive_undercounted_on_large_canvas` and **fixed 2026-07-23** with a second
  ink-relative lens, ground-truthed on `scalar_vs_vector STATE_2` — a thin rotating pointer on PCPL,
  the exact content class. 1.39–1.48% of ink against a 0.02% noise ceiling: >20× margin.
- **D7** — reads the plain canvas ratio, but fires only on `tailFrozen && earlierMoved`. On thin
  content nothing clears the canvas epsilon, so `earlierMoved` is false and D7 passes. No false
  failure.
- **D6 — a REAL blind spot, recorded rather than fixed.** Its threshold is
  `max(20% of canvas, 8 × median)`; on thin content the median is tiny so it falls back to the 20%
  floor, which a traced locus can never reach. It will not false-fail a mathematics sim — it will
  **silently miss a genuine mid-state teleport**. On this subject that must be caught by eye. Now
  written into the eye_walker mathematics addendum so the frame-reader knows the gate will not do it
  for them.

**The empirical proof that beat all of the above:** three parametric/PCPL concepts across TWO
subjects are already baseline-locked, so eyes → eye_walker → `visual:approve` has completed on this
renderer twice — `scalar_vs_vector` (physics, 11 baselines), `bohr_model_energy_levels` (chemistry,
19), `law_of_conservation_of_mass` (chemistry, 15).

### THE BLOCKER: a green EYE run that could not be trusted

`assertCacheMatchesSource` (`loadCachedSim.ts`) read `built.subject !== 'chemistry'` — an allowlist
of one. **Mathematics was skipped entirely.**

Mathematics concepts are hand-seeded into `simulation_cache` for the identical reason chemistry's
are: they register at site #1 only (the isolation contract) and never touch the live generation
pipeline. THE EYE reads **only** that row. The guard exists because the class it catches
(`eye_reads_the_hand_seeded_cache_not_the_current_source`, CRITICAL) returned **"35 checks / 35
passed" over entirely PRE-fix pixels — twice** — and was caught by a human diffing frames by hand,
which is not a gate.

**The cost of that miss is not a broken run. It is a GREEN one.**

Rewritten as a **physics exclusion** (`=== 'physics'` returns early) rather than a chemistry
allowlist. Physics is the one namespace legitimately served by the live pipeline, whose output
differs from a bare renderer assembly, so comparing there would false-fail every run. Everything
else is hand-seeded and now guarded **by construction — no edit needed for the next subject.**

Verified with a negative control, not asserted:

| case | result |
|---|---|
| chemistry + tampered html | **HARD FAIL** ✅ |
| physics + tampered html | passes through silently ✅ |
| chemistry + matching html | no false positive ✅ |
| physics / non-assemblable | skipped, unchanged ✅ |

Mathematics fires by construction (`subject !== 'physics'`).

Two smaller fixes rode along: `_seed_chemistry_cache.ts` → **`_seed_subject_cache.ts`** (nothing in
its code ever gated on chemistry — only the name did, which made it undiscoverable the moment a third
subject existed; the stale-cache failure message now names the actual subject too), and an
**eye_walker mathematics addendum** mirroring the chemistry one: interval honesty, readout-agrees-
with-picture, approaching-is-not-reaching, exact-vs-decimal, stable precision, axis/scale honesty.

### THE LESSON: my own migration was wrong, and only the census caught it

Running the migration's own pre-flight against dev returned **FAIL**. The restated `owner_cluster`
CHECK list had **dropped `peter_parker:runtime_generation` — 27 live rows.** I had hand-carried the
list forward from the 2026-07-24 chemistry migration and lost a line in transit.

Why that is worse than a typo: Step 1 is `DROP CONSTRAINT` then `ADD CONSTRAINT`. The DROP would have
**succeeded** and the ADD would have failed on those 27 rows, leaving `engine_bug_queue` with **no
owner_cluster constraint at all** — a half-applied migration that silently removes a guard. Nothing
downstream would have reported it.

Fixed in `84e85bc`. The file now carries the census inline (681 rows · 9 owner values · 3 subject
values) and an explicit warning: **a restated CHECK is only ever as good as the census taken
immediately before it — never copy the list forward without re-running it.** The re-run parses the
CHECK lists straight out of the `.sql` file rather than a retyped copy, which is the actual lesson.
Result: **PASS**. Also corrected an inherited comment — `visual_validator` is 50 live rows, not 39.

### Repo hygiene (founder directive: plan in the office, build at a desk)

The foundation had been built in the **office** on a branch created in place — the anti-pattern
`docs/GIT_WORKFLOW.md` §7 names by name. Corrected this session: foundation merged to master, office
returned to `master` and clean, and the concept work moved to a proper worktree via
`npm run desk:new`. Also: `.gitignore` hardening committed (`c2b8c72`, verified against
`git ls-files` first — zero tracked paths matched, so nothing changed status), the desk's branch
re-pointed from `origin/master` to its own remote, and the desk synced twice.

`npm run desk:audit` now reads **"Nothing to do — every desk is pushed, current, and earning its
place."** `commits existing ONLY on this machine: 0`.

### Verification

`tsc` 0 · `check:renderer-syntax` clean · `check:agents` **15/15** · `validate:concepts` **149/149**
· `validate:chemistry` **10/10** · `validate:mathematics` PASS · `npm test` **327/327** ·
migration pre-flight **PASS** against 681 live rows.

### Open items

1. ~~**The DB migration is authored, pre-flighted and NOT APPLIED.**~~ **CLOSED 2026-08-05 — APPLIED**
   by the founder from the master checkout via the Supabase MCP, verbatim (no apply-time deviation).
   Verified after: both CHECKs carry the mathematics values, 681 rows intact (physics 497 · chemistry
   106 · subject_neutral 78 · mathematics 0), 9 distinct owners — zero rows lost or retagged.
   `alex:mathematics_author` and `subject='mathematics'` are writable as of now.
   **⚠ DOCTRINE SETTLED — do not re-raise this as a blocker.** The org-access question is answered
   NO, permanently, and by design rather than by accident: an MCP connector with DDL rights on that
   org would also hold them over `student_confusion_log`, `ncert_content` and `pyq_questions` —
   three tables `CLAUDE.md` marks NEVER DELETE. DDL stays a founder action on the founder's machine
   (Rule 17), roughly once per subject lifetime. **Authoring sessions need no dashboard access ever:**
   scar READS run headless through `src/scripts/query_engine_bug_queue.ts` (service-role), and scar
   WRITES are plain data INSERTs via `_seed_engine_bug_queue_*.ts` seed scripts — both already work
   from any clone holding `.env.local`. This is exactly how chemistry has run since 2026-07-27.
2. **D6 cannot see a teleport of thin content** (above). Recorded in the eye_walker addendum; a real
   fix would need an ink-relative lens for D6 the way D5 got one. Scar-row candidate.
3. **`graph_interactive` renders nowhere on 48 shipped physics concepts** — surfaced by the Session
   M1 renderer survey, still open. Either wire a `panel_b` branch into `build_review_site.ts` or drop
   the field so the JSON stops claiming a panel that never paints.
4. **`cartesian_plane` still gates ranked P1 #1–#3.** Needs its own Phase-0 survey before dispatch.
5. **`feat/mathematics-foundation` is merged and deskless** — safe to delete.

### ⏭ NEXT

Finish `unit_circle_to_sine_wave` on its desk: commit the skeleton + mathematics block + TS engine,
seed the cache with `_seed_subject_cache.ts`, then `visual:eyes` → `eye_walker` → founder approval →
`visual:approve`. The EYE path is now trustworthy for it, which was the point of this session.

---

## 📐 SESSION — Mathematics opened as the third subject: the foundation, the ranked list, and the finding that the most fundamental maths visual does not exist (2026-08-04, branch `feat/mathematics-foundation`)

> Founder directive: open mathematics **the way chemistry was opened** — intersection-first across
> Indian and international curricula rather than NCERT-only like physics — with each sim's states
> ordered easy → intermediate → advanced so one file serves every syllabus. Scope agreed up front:
> **foundation only, no concept authored**, with a **blocking ranked diamond list** deciding what may
> ever be authored, and **one new agent** (`mathematics_author`).

### Bottom line

The subject is buildable end-to-end in the tooling — role, pattern library, ranked list, subject
plumbing, validator, CI step and DB migration — and the whole of it is provably invisible to physics
and chemistry. Three findings drove the shape of it, and the third changed the plan.

**1. The founder's "easy → intermediate → advanced across both syllabi" mechanism already exists as
law.** It is **Rule 38** (`CLAUDE_RULES.md:63`): `depth_ring: core | extended | advanced`, the
advanced ring contiguous before the explore state, both reduced cuts required to stay coherent, the
notation ladder, and `curriculum_tags` as claims (38g). Proven on `capacitance` and shipped on all ten
chemistry concepts. **Mathematics needed no new rule** — it needed the ranked list and an author role
that applies Rule 38 to maths. Nothing was invented that already existed.

**2. Mathematics is the harshest subject the whiteboard test has ever been applied to.** More than
half of school mathematics is *better* on a board — a board with chalk is the medium the subject was
designed around, so a maths sim justifies itself against a stronger incumbent than a chemistry sim
did. The demo tier is written down explicitly in `MATHEMATICS_DISCUSSIONS.md` §5 (algebra, sequences,
identities, matrix arithmetic, counting, mensuration) so it is not re-proposed.

**3. THE LOAD-BEARING FINDING, made before any code: the single most fundamental mathematics visual —
a coordinate plane with numeric axes and a curve that responds to a slider — does not exist in any
renderer the teacher product can ship.** This was measured, not surveyed, and it **corrects the
working hypothesis** that maths would be the cheapest subject on engine cost. It is the cheapest in
its geometry half and blocked in its graphing half.

- `build_review_site.ts:3603` ships exactly three engine families: `field_3d_config`,
  `particle_field_config`, `physics_engine_config` (PCPL/parametric).
- **`graph_interactive_renderer.ts` is a real Plotly plotter that is NOT one of them.** It is named
  as `renderer_pair.panel_b` on **48 shipped physics concepts**, and the review builder has no
  panel-B branch at all. On 48 concepts this is authored metadata the teacher product never renders.
  Same class as the filed chemistry scar `review_site_missing_renderer_family_branch`. **Pre-existing,
  not a mathematics regression** — surfaced by this survey, filed as a founder call.
- The PCPL `axes` primitive (`parametric_renderer.ts:2668`) is two labelled arrows: no grid, no
  ticks, no numeric scale, no data↔pixel transform. It is a free-body-diagram orientation indicator
  inherited from physics.
- **But PCPL `locus_trace` already traces an arbitrary curve that responds live to a slider**
  (`:2356`, sampling via `PM_choreoVarsAtTime` `:2311`, which merges live slider values under the
  drag-seize guard). Capability 2 works on the shipped engine today; what is missing is the *frame*.
- The 3D half is near-free: `field_3d_renderer.ts` carries 193 occurrences of
  `crossProduct`/`PlaneGeometry`/`ArrowHelper` from magnetism, directly reusable.

**Rule 40a sweep** (`git fetch origin` + `git log --all -S`, 1062 commits, all branches): **0 hits**
for `cartesian_plane`, `function_plot`, `graph_paper`, `axis_ticks`, `riemann`, `secant_slope`,
`tangent_line`, `solid_of_revolution`, `unit_circle`, `argand`, `slope_field`, `sampling_box`.
Nothing is being built twice.

**Consequence:** one foundational scenario, **`cartesian_plane`**, gates the front of the ranked list
and must land on master separately (Rule 40) before any concept desk opens. It is a new CASE on the
existing parametric renderer, not a new file — the explicit lesson `docs/patterns/chemistry.md`
records against `CHEMISTRY_ARCHITECTURE.md` §5c, which named a new FILE where a new CASE would do and
cost two waves of scheduling.

### The curriculum answer (the founder's specific ask)

Ordering formula changed from chemistry's to reflect the directive:
`(irreplaceability tier) × (INTERSECTION BREADTH) ÷ (renderer dependency)`, scored across
**CBSE · ICSE/ISC · JEE · IB DP · AP · Cambridge IGCSE · A-level**. Full table:
`MATHEMATICS_DISCUSSIONS.md` §4.

**What it says, and it is not what an Indian-only ranking would say:** the widest Indian ∩
international overlap is **the calculus core + graph behaviour + probability**. Coordinate geometry of
the straight line, sequences and series, and matrix algebra all rank high in CBSE/JEE and fail either
the intersection test, the whiteboard test, or both.

- **Graph transformations is the highest-value single concept in school mathematics by intersection
  breadth — 7/7, every board, every level** — and it is pure Capability 2.
- **3D coordinate geometry is the mirror image:** strong CBSE/JEE/IB-HL, **absent from AP and
  IGCSE**. A JEE/CBSE depth play, built deliberately for that audience, never by momentum (Rule 38f).

### What shipped

**Docs (4 new).** `docs/MATHEMATICS_DISCUSSIONS.md` (whiteboard test applied · four-capability
scoring · measured renderer reality-check · intersection table · demo tier · THE RANKED LIST) ·
`docs/MATHEMATICS_ARCHITECTURE.md` · `docs/MATHEMATICS_BUILD_PLAN.md` · `docs/patterns/mathematics.md`
(archetypes A–I, three-tier LIVE/NEEDS-SCENARIO/PHASE-5, maths motion-archetype vocabulary, and seven
authoring hazards seeded from the sibling subjects' scars).

**The agent.** `.agents/mathematics_author/CLAUDE.md` + emission (`check:agents` 14 → **15/15**).
Its central artifact is the **domain & validity ledger** — chemistry's failure mode is a visual that
violates conservation; mathematics' is *a statement true on the interval drawn and false off it, or a
theorem applied outside its hypotheses*. Also: **quantities are UNITLESS**, so the `physics_author`
units checklist is explicitly *replaced*, not inherited (it would misfire on every concept).
Registered in `.agents/CLAUDE.md` (roster + hard-rules addendum + role count 14→15),
`.agents/README.md`, `.agents/peter_parker/OVERVIEW.md`, both admin bug-queue enums, and
`scripts/sync-agents.js`.

**The DB migration, shipped WITH the role — the chemistry trap pre-corrected.** Chemistry's Phase 2
added `alex:chemistry_author` to the two UI enums and never migrated the `owner_cluster` CHECK, so
the UI offered an owner the database rejected on write; latent for days, and it went on to cost a
later session a *wrong diagnosis* in its scar rows. `supabase_2026-08-04_engine_bug_queue_mathematics_subject_migration.sql`
adds `alex:mathematics_author` and widens `subject` to include `'mathematics'`. **Not applied —
applying is a founder action.**

**Subject plumbing.** `Subject` union · `src/lib/mathematicsCatalog.ts` · third `sourcesFor()` branch ·
`src/data/concepts/mathematics/` + README · N-way `resolveConceptJsonPath` ·
`NCERT_MATHEMATICS_BOUNDARIES` · `SUBJECT_LABEL`.

**Validator + CI.** Subject-neutral gates extracted **by move** into `src/scripts/lib/conceptGates.ts`
(word budget · indicator binding · duplicate-key scanner · narration-vs-choreography), shared by
chemistry and mathematics; `gasPopulationErrors` stayed chemistry-local. `validate-mathematics.ts` +
`package.json` script + **a `verify.yml` step in the same commit** — chemistry ran four concepts deep
across five sessions with *no CI coverage at all*, because `validate:concepts` cannot see a subfolder.

### THE LESSON: the probe found a data-corruption bug no gate could have

Walking the mathematics catalog tree by hand — not any validator — surfaced this:
**`conic_sections_as_loci` appeared under a chapter titled "Vector Algebra".**

`byChapter` in `conceptCatalog.ts` was keyed by the **bare chapter number**. NCERT mathematics
numbering restarts each class, so Cl.11 Ch.10 (Conic Sections) and Cl.12 Ch.10 (Vector Algebra)
collided: whichever arrived second found the first's `CatalogChapter` and silently appended to it. No
error, no warning, a plausible-looking tree.

**The first fix was wrong, and being wrong is what found the real invariant.** Keying every subject by
`(class_level, chapter)` moved physics output. Measurement explained why: **physics chapters 1, 2, 5,
6, 7 and 8 all legitimately carry BOTH Class-11 and Class-12 concepts**, because physics numbering is
a single DC Pandey sequence that is *global to the subject* — "Chapter 5" means Vectors at any level,
and merging is correct there. NCERT maths numbering is *scoped to the class level*. Two genuinely
different data models, one of which had never been written down. Now it is, as
`chaptersAreLevelScoped` on `SubjectCatalogSources`, with the reasoning in the comment.

Same root cause, second instance: `sectionName` and `createChapter` both took bare keys and gained
optional level-qualified overrides consulted first.

### One more silent-degradation trap, fixed on sight

`/api/catalog` and `/api/catalog/concept` both parsed the subject as
`raw === "chemistry" ? "chemistry" : "physics"`. Adding a third subject to the union would have left
both routes behind: **`?subject=mathematics` would have returned the PHYSICS catalog with a 200**,
which reads as "mathematics has no concepts" rather than as an error. Both now parse off a
`Set<Subject>`.

### Verification (evidence, not assertion)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run validate:concepts` | **149/149 PASS, 0 FAIL** (unchanged) |
| `npm run validate:chemistry` | **10/10 PASS** — and output **byte-identical** to the pre-extraction capture |
| `npm run validate:mathematics` | **PASS**, 0 files scanned (empty namespace by design) |
| `npm test` | **28 files / 327 tests, all pass** |
| `npm run check:agents` | **15/15 emissions in sync** |
| `npm run build` | **`✓ Compiled successfully` + `Finished TypeScript`** — the admin bug-queue page type-checks with the new owner tag, which is what this check exists to prove. See the build caveat below. |
| Catalog probe | **byte-identical**: `getCatalogTree` × 6 level-combos × 3 subject-args + 6 concept lookups, 750 KB, diff empty — re-run after *each* of the two grouping-key attempts |
| Resolver probe | 3-namespace ambiguity **throws**, including the chemistry↔mathematics pair the old 2-way check could not see; physics-only resolution unchanged and silent |

> ⚠ **Build caveat, recorded rather than glossed.** `npm run build` compiles and type-checks clean,
> but its static-export stage intermittently fails on **`/admin/sim-viewer`** with
> *"took more than 60 seconds"*. **Not caused by this work and not in its diff.** That page is a
> server component that calls `supabaseAdmin` to list every `simulation_cache` row
> (`src/app/admin/sim-viewer/page.tsx:13`), so prerendering it requires a live Supabase round-trip —
> the build is network- and DB-latency dependent at that step, which is why it succeeded on one run
> and timed out on the next with an identical tree. Nothing in this session touches `supabaseAdmin`,
> `deriveStateIds` or that route. **Standing risk worth a founder call:** a build that can fail on DB
> latency is a deploy hazard for `build:pilot` too; the fix is `export const dynamic = 'force-dynamic'`
> (or equivalent) on that admin page so it is never statically prerendered.

> ⚠ **Sync before you measure.** The local checkout opened **128 commits behind `origin/master`** and
> its first baseline read 146/146. It was fast-forwarded before any file was written and re-measured
> at 149/149. A baseline from a stale tree is a false tripwire, and building on one is the exact
> Rule-40 conflict hazard the repo already records twice.

### Proposed `CLAUDE.md` deltas — AWAITING FOUNDER APPROVAL (§9: no unapproved edits)

`CLAUDE.md` was deliberately **not** edited. Three parentheticals are proposed, each mirroring the
chemistry one already in place:

1. **§1 (Alex cluster)** — after the chemistry sentence: *"(Mathematics concepts substitute
   `mathematics-author` at position #2 — added 2026-08-04; see `docs/MATHEMATICS_ARCHITECTURE.md` +
   `docs/MATHEMATICS_BUILD_PLAN.md`.)"*
2. **§5 (source roles)** — after the chemistry source-roles note: *"(Mathematics source roles —
   2026-08-04: NCERT Mathematics = backbone, NCERT Exemplar = misconception beliefs, international
   specifications for scope/coverage claims only; HCV/DCP are physics-only. See
   `docs/patterns/mathematics.md` §3.)"*
3. **§6 (the eight registration sites)** — extend the chemistry carve-out to name mathematics:
   mathematics ids live in `src/data/concepts/mathematics/` and register **nowhere else** (sites
   2/3/4/7/8 forbidden — Gate 8b is all-or-nothing); validation is `npm run validate:mathematics`.

### Open items

1. **`cartesian_plane` is the gate.** Ranked P1 #1–#3 cannot be built without it. It needs a Phase-0
   survey on the `docs/CHEMISTRY_PHASE0_BONDING.md` model, then a single dispatch landing on master
   separately with its own headless gate (`check:cartesian-plane`, negative controls per section).
   **P1 #4 (the unit circle) does not need it** — that is why it is the recommended first concept:
   it proves the whole mathematics path at zero engine spend, exactly as `bohr_model_energy_levels`
   did for chemistry on the same renderer.
2. **The professor gate has still never run on any subject outside physics.** Ten chemistry concepts
   have passed every machine gate and none has passed Asmi's review — the stated bottleneck for six
   consecutive sessions. Mathematics starts behind the same closed gate. **Founder decision worth
   taking explicitly:** sequence the first mathematics concept *behind* the first professor review,
   or accept a third subject on an unvalidated pedagogy gate.
3. **Every international `curriculum_tags` cell will ship unverified** (Rule 38g), so no mathematics
   preset can go teacher-visible either. An intersection-first subject whose intersection claims are
   all unverified is a thesis, not a shipped feature. Closing it needs one teacher per board.
4. **`graph_interactive` renders nowhere on 48 physics concepts** — pre-existing, surfaced here.
   Founder call: wire a `panel_b` branch into `build_review_site.ts`, or drop the field so the JSON
   stops claiming a panel that never paints. Scar-row candidate.
5. **The DB migration is not applied.** Until it is, `alex:mathematics_author` is offered by the admin
   UI and rejected by the database — the exact chemistry defect, now with the fix already written.
6. **Nothing is committed.** Work sits on `feat/mathematics-foundation`, unpushed, per the standing
   rule that commits happen on founder go.

### ⏭ NEXT

**founder review of `docs/MATHEMATICS_DISCUSSIONS.md` §6 (the ranked list) — before anything else.**
The list decides every subsequent build, and re-ordering it is free today and expensive after a
scenario is dispatched. Then either (a) dispatch the `cartesian_plane` Phase-0 survey, or (b) author
the unit circle on the existing parametric renderer and prove the path first. Recommendation on
record: **(b) then (a)** — a proven path costs nothing to have and de-risks the engine spend.
