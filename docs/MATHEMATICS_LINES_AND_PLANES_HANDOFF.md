# HANDOFF — `lines_and_planes_in_space` (#9), banked 2026-08-09 after an xhigh review

> **Read this file completely before touching anything.** It is the whole state: what is merged, what
> is open, what is broken, and the exact order to fix it in. Written because every finding below
> otherwise exists only in a chat log — the failure mode this chapter has now recorded five times.
>
> **Status: AUTHORED, WALKED TWICE, REVIEWED, NOT MERGED, NOT APPROVED.**
> Concept JSON is complete and gated green; a 60-agent review then found **15 confirmed defects**, none
> fixed. **PR #96 must NOT merge as-is.**
>
> **⚠ SUPERSEDED 2026-08-10 — the fix round below (§0.1) EXECUTED this file's §2 list.** §2a/§2b/§2c
> are done and committed; four §2c rows became six engine PRs (#108→#114) which are now **MERGED to
> master**, their authoring follow-ups landed, and a re-audit round closed two further defects. The
> queue reads **13 OPEN for this concept, down from 26**. Read §0.1 FIRST; the sections below it are
> the 2026-08-09 record, kept verbatim.
>
> Companions: `docs/skeletons/lines_and_planes_in_space_skeleton.md` (amended — read its STATUS block
> FIRST) · `docs/skeletons/lines_and_planes_in_space_mathematics_block.md` ·
> `docs/MATHEMATICS_VECTOR_PRODUCTS_HANDOFF.md` (Act I, #7 — still banked).

---

## 0.1 SESSION 2026-08-10 — the fix round (read this first)

**On the chapter branch** (`feat/mathematics-lines-and-planes`, commits `5a97b1c → 64690fb → bf72027
→ d6eb38f` + the fix-round queue commit): §2a seed-guard retrofit + round-2 corrections migration
(replay-verified against the live queue, write-set parity probe + negative control); §2b both fixes;
§2c authoring half (S5 counter at 1620 ms — computed against `reveal + 0.9·grow` through the
ease-out cubic; S2 half_extent-growth seam; four dead tokens swept — S1/S9 `lambda` **plus S2
`n_norm` and S9 `angle_lines_deg`**; S9 advanced strip; distance = capital **D** everywhere).

**quality_auditor's FIRST-ever pass FAILED the build and was right**: the cross_vec OBJECT had
survived the token strip (invisible to THE EYE — group B is never captured); STATE_6 opened at
θ=25° (`vgAnimValue` pre-rolls the ramp's `from` — the authored 69.3846 was dead config; a holding
window now precedes a 69.3846→115 ramp); two epic mirrors still said `d =`; and the missing d₁
label was **FRAMING** (camera r=5.0 sat outside `VG_SCENE_RADIUS` 4.5; label point 47.4° off-axis)
— fixed by authoring (camera → sibling r=13), pixel-verified, `vg_lp_line_label…` CLOSED with the
root cause proven. eye-walker verified 6/7 fixes from pixels; its two refutations were themselves
refuted with evidence (the high-θ detachment does not reproduce on the new camera at the exact
filed control angle 115.0°; STATE_4's "swap" is a 600 ms grow under 1 s sampling plus the
DELIBERATE disjoint-window gap of §5 — one design-record sentence fixed).

**The engine stack (founder-authorized, Rule 40, ONE bug_class each, sequential+stacked off
master 63ae197 — gate 712 → 1015 PASS across it):**
| PR | mechanism | queue row |
|---|---|---|
| **#108** | projection defers an angle token its arc owns (ownership at arc RESOLUTION — the perpendicular-line 90/0 promise survives) | `vg_projection_…` CLOSED (its own script rides the PR) |
| **#109** | `segment_length` token — the borrow is unrepresentable; latent co-arrival overwrite killed | `vg_segment_length_…` CLOSED |
| **#110** | θ row label DERIVED from what the knob rotates (never a per-mode literal); bare θ where nothing rotates | `vg_theta_deg_…` CLOSED |
| **#112** | norm bars: the defect was the FONT (serif has no usable U+2016 — both strokes merged at 13px; the string was always correct, `git log -S` proves it); panel fallback → monospace | NEW row `vg_readout_norm_bars_merge_to_one_stroke_in_the_readout_font_stack` filed FIXED |
| **#113** | authored `animate_loop_ms` (wrap inside `vgAnimValue` — reveals structurally unwrappable; first-cycle pin + D7 refuses `reveal_hold` on a looping state; deriveStateMeta same commit) | `vg_explore_animate_windows_…` OPEN pending S9 authoring |
| **#114** | authored `group_controls` (flat fallback; picker-path display re-run only; scene_group unpartitionable; inertness counts corrected — A=2, B=4, the filed row had them swapped) | `vg_explore_controls_…` OPEN pending S9 authoring |

**ALL SIX MERGED** in that order (founder-run, each child retargeted to master before its merge so
no base was ever deleted under an open child — the #92 incident). Branches deleted after.

**The merge-gated authoring follow-ups then LANDED** (they were blocked until the merges — the Δ7
scar forbids authoring against an unmerged mechanism): STATE_3 `value_readouts` gained
`segment_length`; STATE_9 collapsed to the closed two-window ping-pong + `animate_loop_ms: 18000`
and authored `group_controls { A: [lambda, lambda_span, half_extent, q_height], B: [theta_deg,
line2_offset] }`. Gate §27(i)/§28(h) — deliberate forcing functions that hard-FAILED until then —
now PASS. **Re-baseline note still live:** #112 changed the norm-bar glyph, so any state printing
`‖n‖`/`‖d₁×d₂‖` differs from a pre-#112 baseline BY DESIGN (Rule 34e, founder decision).

**RE-AUDIT ROUND (same day, after the merges).** quality_auditor re-ran: every prior fix HELD
(F1/F3/F4/F5 + all three follow-ups verified from pixels; S3's label flips `segment length` → `distance`
on the SAME number, so the relabel is honest; S9's loop proved BYTE-IDENTICAL t=1000 ≡ t=19000). It then
FAILED the build on two defects **both** audits had missed, now fixed (`f808dfe`): the anchor **`a`** was
named on three formula surfaces and labelled in no state — STATE_1 now draws it, revealed before the line
grows out of it — and **both ring cuts ended on a promise of a state their preset hides** (the skeleton's
per-preset remedy is UNAUTHORABLE: `presets` carry only `hidden_states`), now cut-safe in one sentence
each. Both filed as new FIXED rows with prevention rules. A stale STATE_6 note (25°→115°) corrected in the
JSON and the skeleton. eye-walker's 4th walk: CLEAN, 0 new findings; its one refutation (S6 apex at θ=115°)
was itself refuted by measurement — apex-to-arm distance is **0.000000 at every sampled instant**, since
each `offset.along` is parallel to its own `dir`; the row is scope-corrected, not reopened.

**Queue now: 13 OPEN for this concept** (from 26). Nothing left OPEN is a defect this concept introduced —
they are engine/gate classes it reproduces, the two documented residues, and one scope-corrected row.

**Founder-taste items, no rows filed:** the S1→S2 patch-shrink at the seam (auditor F7 — the
normal is safe, the plane's opening frame is a taste call); STATE_4's near-end-on Lpar (~30 px
stub); STATE_7's two arcs visually indistinguishable at 55°/35°; Gate-20 warning
`parallel_form_stem` missing on q3–q7. **Still OPEN with residue:** `vg_offset_animate_…` (a θ
drag during [0, 8000) detaches the arc — the slide beat's aux ramp is un-seizable; probe must
sample that window).

---

## 0. FIRST COMMAND ON RESUME

```bash
git fetch origin && git checkout feat/mathematics-lines-and-planes && git pull
npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts lines_and_planes_in_space --open
```
`.env.local` must be present in whatever desk you work from. Master is `bb73ee8`+; the branch is
`feat/mathematics-lines-and-planes` (PR **#96**, OPEN).

---

## 1. WHAT IS DONE AND MERGED — the durable asset

**Five platform fixes landed on master today, each separately per Rule 40.** Every one was found by
authoring and *walking* this concept, and every one was invisible to the deterministic gates.

| PR | fix | why it mattered |
|---|---|---|
| **#90** | D5 read `cached.physics_config` | A hand-seeded chemistry/mathematics cache row carries only `epic_l_path` — no states — so `deriveMotionExpectations` returned `{}`. **The motion gate had never run on ANY chemistry or mathematics concept.** First run of #9 read `39 checks · 39 passed` with **nine skips inside it**. Also explains why registering `vg` during the #7 wave "did not take": the registration was correct and *unreachable* |
| **#91** | `vg_vector_a`/`vg_vector_b` never hidden in `lines_planes` | Act I's explorer vectors rendered on **all 9 states**. Visibility is written TWICE (apply pass + per-frame updater); an apply-only fix would have been undone one frame later. 6 sites, one predicate |
| **#93** | readouts published before their subject existed | **19 sites across 7 constructs.** A panel-side fix would have been a **total no-op** |
| **#94** | `d.intersection` → `intersections[]` | Collision resolved by **REFUSAL, not precedence** — the tokens are names, not addresses |
| **#95** | reveal pin blind to `intersections[]` | The migration dropped STATE_4's pin **15900 → 10400 ms**. **Nothing would have failed**; the run goes green against the wrong frame |

`check:vector-geometry-3d`: **570/60 → 716 assertions / 85 negative controls.**

---

## 2. THE FIX LIST — in the order agreed with the founder

**All 13 rows are live and OPEN** (`discovered_in_session = session_2026-08-09_lines_and_planes_xhigh_review`),
plus 2 pre-existing rows this concept reproduces. Query them; each carries its own prevention rule and probe.

### 2a · FIRST — the scar-queue bookkeeping (mechanical, and it corrupts the record on every replay)
- `scar_seed_script_upsert_downgrades_a_row_that_was_fixed_after_it_was_authored` — **CRITICAL**
- `scar_migration_header_advertises_an_update_the_file_does_not_contain` — MAJOR

**The problem in one sentence:** the round-2 corrections (a `FALSE_POSITIVE` retraction, a CRITICAL
escalation, six PR-fix annotations) exist **only in the live DB**, while the committed scripts and
migrations still assert the round-1 state through unguarded full-row upserts — so replaying any of them
reverts FIXED rows to OPEN and resurrects a row this same session proved false.

**The fix, and it is already written down:** `src/scripts/_seed_engine_bug_queue_lines_and_planes_xhigh_review.ts`
**carries the guard the others lack** — copy its `PROTECTED` check and its
`WHERE engine_bug_queue.status NOT IN ('FIXED','FALSE_POSITIVE')` conflict predicate into the three
earlier scripts and regenerate their migrations. Then commit the round-2 corrections as their own
migration; a correction living only in a database is not in the record at all.

### 2b · SECOND — the two one-line-per-site authoring fixes
- `vg_state_authors_controls_without_show_sliders_so_the_row_is_unreachable` — add `show_sliders: true`
  to STATE_1, STATE_2, STATE_6. Their `controls` and `control_ranges` are dead config today; on STATE_6
  the narration says *"Now turn one direction"* and there is nothing to turn.
- `vg_offset_animate_ends_off_zero_so_a_rotated_line_leaves_its_shared_arc_apex` — STATE_6's second
  `aux_a` window must end at **0**, not −1.5. Measured: distance from origin to M2 is 0.000 at
  θ = 69.3846° but **1.049 at θ = 25° and 1.072 at θ = 115°**, so the arc's second arm detaches from
  its own apex for most of the state and on every teacher drag.

### 2c · THIRD — the timing / readout re-authoring (do LAST; it interacts with the reveal-gating shipped today)
- `vg_misconception_counter_number_arrives_after_the_false_picture_is_gone` — **CRITICAL.** STATE_5's
  `skew_distance` arrives ~5780 ms (`vgArrived` ≥ 0.999 through the easing, *not* `reveal_at_ms`) while
  `crossing_mark` hides at 3500 ms. **They are never co-present**, so the M3 rebuttal never happens.
- `vg_segment_length_readout_borrows_the_point_plane_distance_label` — **CRITICAL.** STATE_3's sweeping
  segment prints under the label **"distance"** for 9 s, asserting on screen the exact belief the state
  exists to break (and matching assessment q3's own distractor).
- `vg_projection_publishes_both_angle_tokens_before_either_arc_is_drawn` — STATE_7's answer is on the HUD
  ~11 s before the beat that derives it.
- `vg_readout_token_authored_on_a_state_whose_constructs_never_publish_it` — STATE_1/STATE_9's `lambda`
  row never renders at all. **Legality ≠ reachability**: the token is in the closed enum, so the enum
  cannot catch it.
- `vg_plane_reveal_fraction_scales_its_normal_so_a_carried_normal_is_deleted_and_regrown` — the chapter
  seam the skeleton forbids **by name**, reintroduced through a parent/child coupling invisible from the JSON.
- `vg_explore_controls_are_not_group_aware_so_half_the_sliders_are_inert`
- `vg_explore_animate_windows_are_finite_so_the_free_running_sandbox_freezes` — stops dead at 72 s.
  **Not fixable by adding windows** (a free-running clock has no end); needs an engine wrap/`ping_pong`
  or an idle sweep.
- `vg_explore_state_surfaces_advanced_ring_content_under_a_reduced_preset` — Rule 38a/38b, which the
  skeleton claims discharged in a section written before the explore state had two groups.
- `vg_one_symbol_carries_two_meanings_across_states_of_one_concept` — `d` is the direction for four
  states, then the distance in STATE_8's formula beside `d₁`/`d₂`.

### 2d · Pre-existing OPEN rows this concept reproduces (engine, not authoring)
- `vg_lp_plane_ghost_multiplier_applies_to_the_quad_but_not_to_its_normal_arrow` — STATE_1, breaks Rule 32e.
- `vg_lp_line_label_does_not_render_on_an_offset_animated_line_although_it_is_authored` — STATE_6's `d₁`
  is authored and never drawn. **Root cause UNPROVEN** — the row carries three discriminating tests;
  the eye-walk's dir1+offset attribution rests on n=1.
- Also open, found this session, not yet scheduled: `vg_theta_deg_slider_row_is_labelled_for_products_mode_objects_in_every_mode` ·
  `vg_readout_panel_is_unhidden_at_state_entry_before_any_frame_writes_its_rows` ·
  `vg_lambda_token_names_both_the_intersection_parameter_and_the_slider_knob` ·
  `visual_eyes_d5_ink_relative_lens_is_diluted_by_static_chrome_on_explore_states` (a gate FALSE POSITIVE
  — STATE_9's D5 failure is **not** a content defect) · `skeleton_discharges_a_scar_against_an_engine_delta_that_was_never_built` (Δ7 was never built).

---

## 3. AFTER THE FIXES — the verify chain, in order

```bash
npx tsc --noEmit                                   # 0
npm run validate:mathematics                       # 5/5 PASS, and READ THE WARN LIST — warnings do not fail the run
npm run check:vector-geometry-3d                   # ALL SECTIONS PASSED (716/85)
npx tsx --env-file=.env.local src/scripts/_seed_subject_cache.ts lines_and_planes_in_space
npm run visual:eyes -- lines_and_planes_in_space   # $0
```
**⚠ Re-seed the cache after ANY renderer or JSON change** — mathematics concepts are hand-seeded and
`assertCacheMatchesSource` hard-fails on drift (it exists because a session once walked 35 checks over
entirely pre-fix pixels).

**⚠ Check the skip list explicitly.** THE EYE's headline counts skips as passes. Expect exactly **1**
skip (H2, no baseline) and **1** failure (STATE_9 D5, the known false positive above).

Then: `quality_auditor` (never run on this concept) → `eye-walker` → founder review.

---

## 4. WHAT IS EXPLICITLY NOT DONE

No `quality_auditor` pass · no founder review · **no `visual:approve`, no baseline, no `PILOT_CONCEPTS`
entry, no TTS** · Checkpoint C not run. **Merging PR #96 is a founder decision and the review says not yet.**

---

## 5. MEASUREMENTS WORTH NOT REPEATING

- **Act I's chapter-seam camera is `[0.0, 8.0, 13.8564]` — R 16**, az 90 / el 30. The skeleton said R 9;
  az/el matched and the radius was *assumed*. A partial match is the most convincing way to ship a wrong pose.
- **`n·d` renders `0.574`, never `0.624`.** `vgLinePlaneMeet` normalizes both operands, so the token is a
  cosine: `cos 55° = sin 35° = 0.5736`.
- **`Lpar.dir` must be `[1, -0.35, 0]`, not a hand-normalized 6-dp form.** The rounded version gives
  `d̂·n̂ = 2.756e-07` — **276× the 1e-9 guard** — so the parallel branch never fires and the HUD prints
  `λ = −5,080,022` with a meeting point 4.8 M units away. Every gate was green while that was on screen.
- STATE_4's two intersections rely on **disjoint reveal windows** (Lpar 1000→9500, Lcut 15000+) so the
  engine's collision refusal is never reached. Widening either window silently blanks the readouts.

---

## 6. THE WORKING RULES THIS SESSION EARNED — apply them, don't rediscover them

1. **A check invariant under your likely error is not evidence.** I filed a `scene_group`-inert row after
   testing a *singular* `group` key; the JSON authors `groups` (plural), which is what the engine reads.
   Retracted as `FALSE_POSITIVE` — kept, not deleted, because the inference error is the lesson.
2. **A gate that is SKIPPED is not a gate that passed**, and a headline that aggregates skips into passes
   will read `39/39` over zero coverage.
3. **Reading frames finds what gates cannot.** Every MAJOR across three walks was one shape — *a text
   surface disagreeing with the picture beside it.* 716 assertions were blind to all of them.
4. **Fixing one surface exposes the one beneath it** — three times today. **Re-walk after removing an
   occluding element**; never assume the space it vacated is correct.
5. **Invite refutation and mean it.** Agents overturned me on the a/b fix (6 sites, not 1), the readout
   fix (19 sites, not 1), and the `groups` key. Every one was right.
6. **Rule 40**: engine/tooling files land on master **separately and immediately**, one `bug_class` per
   dispatch. Never `--delete-branch` on a PR that a stacked child is based on — it auto-closes the child,
   and a closed PR whose base is gone **cannot be reopened or retargeted** (cost one rebuild today, PR #93).
7. **A scar-queue write never downgrades**, and a correction applied only to the live DB is not in the record.

*Banked by founder decision. The engine ships; the concept waits — again, and for better reasons than last time.*
