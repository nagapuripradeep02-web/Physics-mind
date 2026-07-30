# spring anchoring + mass legibility — engine fix report

> 2026-07-30. Engine-only session answering TWO named founder findings from a recording review of
> `newton_third_law`. NO concept JSON authored. Three `field3d-surgeon` commits on `feat/lom-a` in
> `C:\Tutor\physics-mind-lom-a`. Prior seams: `d9d07a0`/`208a8ba` (`push_off` + spring geometry),
> `64fc247` (repeat cycle), `2b6f503`/`9421ba2` (spring choreography — `docs/loop_runs/spring_choreo_report.md`).

| Fix | Commit | What |
|---|---|---|
| 1 (CRITICAL) | `76dad78` | the spring coil is PINNED to a `fixed` body's face; only the free end tracks the cart |
| 2 (MAJOR) | `f234aea` | every body renders its MASS — HUD group header + a new on-block sprite; `fixed` = `m ≫ m₁` |
| 2b | `ff6939c` | the three Rule 34d / formatting violations eye-walker caught in `f234aea` |

Verify chain green at HEAD (`ff6939c`), re-run independently by the orchestrator after each surgeon's own
run: `check:renderer-syntax` OK (field_3d 2254 KB, particle_field 220 KB) · `npx tsc --noEmit` **0 errors** ·
`validate:concepts` **127 PASS / 0 FAIL** (warning profile unchanged throughout).

Both findings are answered **with pixels**, by eye-walker, never by the orchestrator loading PNGs.

---

## 1. Fix 1 — the spring is locked to the wall

**Founder:** *"the spring is moving with the block. It should not be the case. The spring should be locked
to the wall, and it should show the block compressing it and moving towards the other way where the
spring pushes it."*

The diagnosis in the brief was right, and it was **two independent defects**, not one:

**(a) The slide.** `nlbFitSpring` mounted the coil at the midpoint of the two body positions — correct and
symmetric for two free carts, wrong the moment one body is `fixed`, because half the free body's
displacement is handed to the mount point so BOTH ends translate. Measured pre-fix on the real renderer:
the wall-side coil end travelled **0.8466 m** per cycle (the founder's 640 px → 628 px). Secondary: the only
two phases that already mounted on a face (`approach`, ring) mounted on `spring.between[0]` — an authoring
accident, so a reversed pair bolted the coil to the *moving* cart.

**(b) The t=0 gap — NOT a geometry mismatch.** The brief suspected the slab's visual half-width. It is
correct: `BoxGeometry(0.275, 1.76, 1.43)` is `translate`d in **Y only**, and the live faces measure
**0.275 m** (slab) / **0.550 m** (cart), exactly the `push_off_report.md` §2 contract. The gap was pure mount
arithmetic: `cx = (pA+pB)/2` is the midpoint of the two **centres**, while the coil's length is the
**face-to-face gap**. Those coincide only for equal half-extents, so cart-vs-slab offset the coil by
`(hA−hB)/2 = 0.1375 m` — an air gap at the slab and 0.1375 m of coil buried in the cart. Measured pre-fix at
the mid-hold pin: **0.1375 m**, the predicted value to the digit.

**What landed** (`field_3d_renderer.ts`, +69/−1, all inside the seam-B spring block): a new
`nlbSpringAnchorId(idA, idB)` returns the `fixed` body's id (build-time fact off `userData.fixed`, so it
cannot change mid-state) or `""` for a free-free pair. `nlbFitSpring`'s mount block gained a third,
**overriding** case: with an anchor, the coil's anchored end is pinned on that body's facing face in *every*
phase; the old `approach`/ring face-mount and the default midpoint became the `else if`/`else`, textually
unchanged. Five `PM_nlbSpring*` diagnostic globals published (zero consumers in `src/` — probe surface only,
so the probe never re-implements the formula it tests). `deriveStateMeta.ts` needed no change.

Requirement 5 (the free body takes the whole stroke) was **already true** — `nlbSpringLoadPose` gives all of
`mvA/mvB` to the free body: the wall's `s` held at `−0.7725` for the whole cycle while the cart moved
through 363 distinct poses.

**Probe (real assembled renderer under Playwright), pre-fix → post-fix, same probe:**

| Assertion | PRE | POST |
|---|---|---|
| wall-side coil end, x span over 419 visible frames | 0.8466 m | **0.0000 m** (5.6e-17) |
| max coil-end-to-slab-face distance, all phases | 0.9742 m | **0.0000 m** |
| seam at the six pins (t0/approach/compress/hold/release/ring) | 0.375 / 0.354 / 0.141 / **0.1375** / 0.128 / 0.161 m | **0 m at all six** |
| free end still travels | 1.12 m | 1.00 m (tracks the cart face to ≤0.020 m = half a rebuild quantum) |
| two-FREE-cart control, 900 frames | — | **0 diffs**, screenshot byte-identical (32585 B) |
| freeze byte-identity | — | **all six pins** held, screenshots byte-identical |

**eye-walker verdict — PASS on all four questions.** Wall-side coil end constant at x≈618 px in t0,
mid-approach, mid-compress, mid-hold, mid-release and ring; flush on the slab face in every one (including
at maximum compression); the free end visibly opens and closes; the two-free-cart control frame is
indistinguishable from its baseline. `slow motion ×6` badge clear of everything, HUD legible, F₁₂ = −F₂₁.

## 2. Fix 2 — mass is on screen, in the HUD and on the block

**Founder:** *"in state two you did not define m1, m2 with the numbers. You gave there two unequal masses,
but which one is heavier? You did not show anywhere."*

Root cause: the HUD enumerated `readouts[]`, which is an **outputs-only** enum — so a *parameter* the whole
claim depends on had no surface anywhere.

**What landed** (`f234aea`, +169/−13): one formatter `nlbFxMass`, one identifier normalizer `nlbMassSymbol`,
one header composer `nlbHeaderHtml`; the HUD group header became **unconditional** (single-body states gained
one); a new on-block white mass sprite (`elementType: "nlb_body_mass"`, brighten-only in the glow list) per
free body; the mass slider rows adopted `nlbFxMass`. The nlb layer prints a body identifier on exactly
**three** surfaces — DOM HUD header, DOM slider row label, 3D sprite — and there is **no `ctx.fillText` path**
in the nlb region (verified by scan). All three go through `nlbMassSymbol`; the header also carries
`NLB_MATH_FONT`, because monospace has no `₁ ₂ ≫` glyphs (the subscript-tofu trap).

Rendered strings: free body → HUD `m₁ = 4 kg`, block `4 kg`, slider `m₁ = 4 kg`, identifier `m₁`.
`fixed` body → `Wall — fixed, m ≫ m₁` (free-body list joined `, `; correct for one or five free bodies), and
**no on-block number at all** — its 1000000 kg is a stand-in for infinity, not a reading.

**eye-walker verdict on the core fix — CONFIRMED, and it answers the founder's question as a student
would:** in the 4 kg vs 12 kg frame it reads `m₁ = 4 kg` / `m₂ = 12 kg` in the HUD and `4 kg` / `12 kg` on
the blocks, with the heavier cart's smaller acceleration magnitude reinforcing it. `₁ ₂ ≫` all render as real
glyphs, no tofu. **Zero ASCII `m1`/`m2` anywhere** across ~45 frames. No `1000000`. On-block white text legible
against both cart colours, on the incline, and at reduced size.

### 2b — the three violations eye-walker caught, and the fix (`ff6939c`)

The first round's numeric bounding-box probe passed, but it only checked one instant and never the explore
state's grown HUD. Pixels caught what the box check could not:

1. **MAJOR — the HUD panel overlapped the slider panel.** Making the header unconditional grew the two-body
   HUD to 8 rows; in `connected_bodies` STATE_7 its bottom line bled into the top slider row. **Fixed** by
   `nlbFitReadoutPanel()`: it **measures** `#nlb_sliders`'s top edge (or the viewport bottom when hidden) and
   walks a ladder, stopping at the first fitting step — `13px/1.7` authored → `12px/1.35` compact →
   `display:flex`, one column per body (worst case 3 bodies × a full `readouts[]`). Called twice per entry,
   the second time *after* `nlbToggleSliderRows`, because the rebuild would otherwise measure the previous
   state's panel. A state that already fits is byte-identical.
2. **MODERATE — on-block labels passed behind the fixed control panel mid-fall.** Invisible to a t=0 probe:
   the collision exists only for part of the motion. **Fixed** by `nlbDodgeBodyLabels`: reset both labels to a
   memoized home pose, `updateWorldMatrix` the body (no stale-matrix lag), project the mass label's **real ink
   rect** (the shared sprite helpers now retain `_pmInkFrac` — property writes only), and if it lands in a
   visible overlay rect slide the **pair** along world x past that panel's near edge, capped at 1.10 world.
   Pure function of current pose + current rects — no clock, no accumulator, no physics write.
3. **MODERATE — `8.464 kg` on the live path.** The surgeon corrected my read: the live path *was* already
   calling `nlbFxMass`; the hole was **inside** `nlbFxMass` (a 3-dp allowance), so patching the call site
   would have left the next live writer exposed. Now one decimal (the slider step is 0.5) with a 3-dp fallback
   below 0.1 kg so a tiny mass cannot round to `0`. And the `8.464` came from the explore state's **Rule 37
   idle auto-sweep**, not a human drag.

Across-motion probe, driving the **real** `connected_bodies.json` `field_3d_config` at THE EYE's 1280×720,
sampling every ~0.17 s — 30 checks, all PASS:

| State | HUD bottom vs slider top | Motion samples | Overlaps (HUD / slider / label-label / off-screen) |
|---|---|---|---|
| STATE_3 | 214 / 341 → **128 px clear** | 55 | 0 / 0 / 0 / 0 |
| STATE_4 | 258 / 341 → **84 px clear** | 55 | 0 / 0 / 0 / 0 |
| STATE_7 (explore, full `readouts[]`) | 303 / 341 → **39 px clear** | 55 | 0 / 0 / 0 / 0 |

Format across the STATE_7 sweep: `5 kg, 2 kg, 5.4, 5.9, 6.4, 6.9, 7.4, 7.8, 8.3, 8.8, 9.3, 9.8, 4.5, 4 …` —
all ≤1 dp, on the exact path that previously printed `8.464`.

**eye-walker verdict — PASS on all three fixes, PASS on "core fix still intact", MOSTLY PASS on "no new
problems".** STATE_7's HUD clears the sliders with a visible margin, single-column 13px, fully legible
`label = value` rows, nothing clipped. m₂'s mass is bright and readable through the whole fall in STATE_3/4/7
including the bottom of travel, with **no jump or jitter** across consecutive dense frames and no detachment
from its block. No 3-decimal value anywhere. One new finding — see §5.

## 3. H2 / regression

**`electric_flux` (the required shared-renderer leakage check):** `cache:clear:scoped` → re-seed →
`visual:eyes` = **62/62 deterministic checks, 0 failed, $0.00**. eye-walker read all ~100 frames across 10
states: **CLEAN** — no stray coil, wall slab, cart, mass label, `kg`, `≫`, badge or unexpected HUD header;
every existing sprite renders correctly (the shared `pmCreateAutoLabel` / `updateLabelSpriteText` edit was the
one plausible leakage vector, with ~60 call sites); geometry, field lines, flux tubes, single glow focal,
framing and readouts all unchanged. It went further than asked and diffed today's run against the run
immediately **before** these commits: `STATE_1__frozen`, `STATE_8__frozen`, `STATE_10__frozen` are
**byte-identical pre/post**. Zero candidate rows.

**The three nlb concepts** (the only baseline-locked field_3d concepts that execute the changed lines), all
re-seeded before each run — final round at `ff6939c`:

| Concept | Checks | H2 | Read |
|---|---|---|---|
| `connected_bodies` | 44/44 | 0.12 · 0.12 · 0.17 · 0.19 · 0.19 · 0.37/0.54 · **1.04**/1.00 % | STATE_3/4/5 rose ~0.05 pt = the label-pair dodge (~1500 px² of text moved ~15 px). STATE_7's 1.04 % is the HUD reflow: all 14 rows change font size and y-position — the largest expected Rule-34e text move, still half the 2 % tolerance, geometry/glow/framing/values confirmed untouched. |
| `free_body_diagram` | 38/38 | 0.05 · 0.19 · 0.07 · 0.23 · 0.13 · 0.41 % | Single-body: no reflow, no dodge. The delta is the brand-new header line + `2 kg` on the block. |
| `block_on_incline` | 32/32 | 0.11 · 0.16 · 0.21 · 0.09 · 0.25 % | **Byte-for-byte the same numbers as the previous round** — the strongest evidence both new mechanisms are inert where they aren't needed. |

**"H2 = 0.00 %" is not a well-formed gate** and this session proved it: `connected_bodies` STATE_6 moved
0.24 → 0.22 % between two runs of *identical* code, and a direct pixel diff of a `free_body_diagram` pair gave
4315 differing pixels in a single 68×68 box at max channel delta **3/255** — sub-perceptual rasterizer/AA
wobble, not displacement (a displacement gives large edge deltas). Logged as a scar row. Every number above
is "passes tolerance **and** the delta is explained", never an equality.

Rule 36: contamination greps of every added line for `0.016|+= dt|Date.now|performance.now|setInterval|__pmSteps|dtStep`
returned **0 hits** across all three commits; `animate()` / `dtStep` / `__pmSteps` untouched ⇒ **no Rule 36b
fleet sweep triggered**. Freeze byte-identity verified at six pins (Fix 1) and on a held pin plus a re-entered
state (Fix 2).

## 4. Authoring numbers `newton_third_law` must change on `feat/lom-b`

The `spring_action` / `repeat_every_ms` numbers in `spring_choreo_report.md` §3 **stand as written** — nothing
in these two fixes changes them. Three things are now load-bearing that were not:

1. **`release_at_ms` for a cart-vs-`fixed` pair drops the wall's 1/m.** `1000·sqrt(2·stroke/a_rel)` with only
   the cart's mass: 30 N on a 4 kg cart = **484 ms**, not the 420 ms of the 4+12 kg free pair. With
   `slow_factor: 6` that is a 2904 ms wall release, so the wall state's `repeat_every_ms` floor is
   `3400 + 2904 = 6304 ms` — **7200 still clears it.**
2. **The position contract is now visibly enforced.** Cart-vs-wall `|s_a − s_b| = 0.72 + 0.55 + 0.275 = 1.545 m`
   (e.g. `+0.7725 / −0.7725`). With the coil pinned to the slab, an authored seed gap ≠ 0.72 m now shows as a
   wrong coil length at `hold` instead of being half-hidden by the old mount offset. `spring.between` ORDER no
   longer matters for the mount — the `fixed` body wins regardless.
3. **`mass_kg` is now RENDERED TEXT, so it is a teaching number, not a hidden parameter.** The unequal-mass
   state must author a ratio that reads cleanly — **4 kg and 12 kg** prints `4 kg` / `12 kg` and states the 1:3
   ratio for the student. Avoid values like `2.1` / `2.0` unless the near-equality *is* the point. If the
   narration quotes a ratio ("three times the mass"), the authored masses must actually produce it.
   `bodies[].label` should be the mass symbol for a free body (`m₁`/`m₂`; ASCII `m1` is auto-normalized, so
   either authoring is safe) and a plain English word for a `fixed` body (`Wall`), because the wall header
   renders `<label> — fixed, m ≫ …`. The wall keeps `mass_kg: 1000000` + `fixed: true` — never printed.

**No new JSON key is required anywhere.** Both fixes are pure generic engine behaviour with zero per-concept
authoring, exactly as the brief required. Expect H2 fails against any pre-fix `newton_third_law` baselines —
that is the Rule 34e re-baseline path after founder OK, not a fix cycle.

## 5. Founder calls / deferred

1. **NEW, OPEN — camera-rotated explore label bleed-through** (scar row 9,
   `nlb_camera_rotated_body_label_bleed_through_slider_panel`, MODERATE). eye-walker found that after a
   teacher rotates the camera in an explore state, an **on-table** (non-falling) cart can project under the
   semi-transparent slider panel and its mass + identifier bleed through faded. Not a regression of `ff6939c`
   — it is the residual scope of the same dodge: the dodge slides along **world x** with a 1.10-world cap,
   which is no longer the screen-clearing direction once the camera has turned. Reachable only by the
   teacher's own camera drag (Rule 25d), never during authored guided playback. **Deliberately not fixed** —
   it is a third `bug_class` and Amendment 4 caps a dispatch at one. Logged with the fix doctrine (dodge in
   *screen* space off the projected panel edge normal, size the cap from measured pixel overlap).
2. **`mg` and the other five ARROW labels still pass behind the slider panel** in `connected_bodies`
   STATE_3/4/7. Pre-existing (the panel predates this work) and deliberately deferred: an arrow label is
   positioned at its arrow tip by the seam-C `nlbDeCollideLabels` pass, and dodging it would **detach it from
   the arrow it names**, changing what the label points at. eye-walker independently agrees this is acceptable
   to leave, and confirms it is neither better nor worse than before. Founder call.
3. **`connected_bodies` STATE_6's baseline looks STALE, unrelated to this work.** eye-walker read the 0.22 %
   diff as a *real* compositional change — smaller, right-shifted Atwood rig, pulley cropped, ~3× wider slider
   panel — not AA wobble. That concept authors no spring and no `fixed` body, so neither commit can have caused
   it; it reads as a baseline predating an unrelated panel-width redesign. Worth a founder look and a
   `visual:approve`, separately from this session. Frames: `visual_baselines\connected_bodies\STATE_6__frozen.png`
   vs `.visual_runs\connected_bodies\20260725-220424\STATE_6__frozen.png`.
4. **`electric_flux` STATE_10** has a pre-existing caption/formula overlap and a `θ=0°` label sitting on the
   `n̂` arrowhead. Confirmed byte-identical to the pre-commit run, so pre-existing; candidate row only.
5. **A `fixed` body gets no on-block number** — its mass is meaningless as a value and the string would push
   past the thin slab into the cart/spring gap. The HUD carries `Wall — fixed, m ≫ m₁`, phrased so the teacher
   learns it never moves, not only that it is heavy. Interpretive call.
6. **The HUD header is now unconditional**, so single-body states gained one line of HUD height — that is where
   their mass appears, and it is the bulk of their H2 delta. A state with **no `readouts[]` at all** still has
   no HUD (`free_body_diagram` STATE_1); its mass is legible only on the block. I did not conjure a HUD panel
   into a state the author left instrument-free.
7. **The reflow ladder's deeper tiers are unexercised by pixels.** eye-walker measured STATE_7 clearing by
   ~57 px at step 0 (single-column 13px) where the surgeon's probe measured 39 px with the compact step — both
   clear, but it means the *compact* and *multi-column* tiers are proven only by the probe's synthetic 3-body
   worst case, not by a real concept's frames. Stated plainly rather than claimed as covered.
8. Carried from the choreography seam, still open and unchanged: HUD `a` reads 0.00 during the hold beat, and
   HUD `v` reads 0 while the scripted loading beat visibly moves the carts (both are the latch). Founder call.
9. **Two lines in shared helpers** (`pmCreateAutoLabel`, `updateLabelSpriteText`) now retain `_pmText` and
   `_pmInkFrac`. ~60 call sites across many scenarios take the property write; no pixel can move, and the
   `electric_flux` byte-identical frames confirm it. Flagged because it is outside the nlb seams.

## 6. Deliberately not done

No concept JSON (both fixes are engine-generic; `newton_third_law` lives on `feat/lom-b` and §4 has its
numbers). No DB write — all findings are text-only in
`docs/loop_runs/lom/_engine/scar_candidates.sql` (now 32 INSERT blocks; rows 6–8 FIXED for the three
follow-up defects, row 9 OPEN for the new camera-rotation finding, plus the two Fix-1 rows FIXED and the H2
probe-definition row OPEN). No schema/validator change (Zod is `.passthrough()`). No `visual:approve`, no
re-baseline, no TTS, no deploy, no branch/worktree change, no shared-clock edit, no Rule 36b fleet sweep, no
refactor of `nlbResetTrajectory` / `nlbDeCollideLabels` / `animate()`. The `capacitance` /
`faraday_law_induction` cross-family baselines do not exist in this worktree, so `electric_flux` plus the
three nlb concepts are the full pixel-regression surface available here.
