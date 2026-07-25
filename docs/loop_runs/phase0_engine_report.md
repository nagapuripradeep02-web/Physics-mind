# Phase 0 — `newtons_laws_body` field_3d engine: build report

Branch `feat/lom-a` (worktree `C:\Tutor\physics-mind-lom-a`), base `ec08a...ec09b28`. Date 2026-07-25.
Contract: `docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md` (founder-approved). No concept was authored.

---

## 1. What landed

All 14 spec §5 integration sites, built across 6 separate `field3d-surgeon` dispatches (Amendment 4
discipline — one seam each, no bundled multi-bug dispatch).

| Seam | Commit | Spec sites |
|---|---|---|
| scaffolding | `2ca62ad` | spec + agent + loop state into git |
| A — types + scene build | `6c7a319` | 1, 2, 6 (skeleton), 7, 8 (seed), **9** |
| B — integrator | `e642bc5` | 10, 8 (physics), both §2 branches |
| C — force-arrow overlay | `be12f32` | 6 (arrows), 8 (arrow visibility), §3 |
| D — pulley + rope geometry | `349e1af` | 6 (pulley), 8 (pulley), §6 extension flag #1 |
| E — sliders + explorer | `9c413f8` | 3, 4, 5, 11, 8 (`controls_visible`), §4 |
| F — deriveStateMeta | `9c4438e` | 12, 13, **+ a third undocumented site** |
| bring-up proof | `f921a3c` | §7 step 2 + one defect fix |

Files touched, total: `src/lib/renderers/field_3d_renderer.ts`,
`src/lib/validators/visual/deriveStateMeta.ts`, `src/scripts/_scratch_nlb_bringup.ts` (new harness),
`docs/loop_runs/lom/_engine/scar_candidates.sql`, `.gitignore`, `docs/loop_runs/lom_a_state.md`.
**No concept JSON, no registration site, no SQL migration, no DB write.**

---

## 2. Verify chain

Run after **every** seam, green every time:

```
npm run check:renderer-syntax   →  field_3d: syntax OK (2156 KB) · particle_field: syntax OK (220 KB)
npx tsc --noEmit                →  0 errors
npm run validate:concepts       →  125 PASS, 0 FAIL out of 125
```

Warning profile unchanged throughout (897 bounds / 405 word_budget / 209 tts_id_duplicate /
14 physics / 1 undeclared_derived — all pre-existing legacy-fleet).
`npx vitest run src/lib/validators/visual` → 4 files / 34 tests pass (seam F).

### Regression (spec §7 step 4)

| Concept | Deterministic gates | eye-walker verdict |
|---|---|---|
| `electric_flux` (10 states) | **62/62 passed, 0 failed**, $0.00 | **NO REGRESSION** |
| `magnetic_flux` (6 states) | **38/38 passed, 0 failed**, $0.00 | **NO REGRESSION** |

eye-walker read every frame in its own context: zero stray `nlb_*` geometry, no blank/partial scenes,
no clipping or overlay collision, no black/NaN material, no frozen frame sitting mid-animation. This
matters because seams A–E touched the **shared** `pmPickSensor` and `applyDragFrom` functions and the
glow pass — a leak would have shown as foreign geometry in an unrelated scenario. It did not.
The two pre-existing OPEN rows on these concepts (`field3d_particle_field_vestigial_dual_panel_config_gap`,
`mfl_loop_footprint_inverted_vs_theta`) are unchanged, not re-flagged.

Rule 36b full-fleet re-verify **not triggered** — no shared `animate()`/`dtStep`/`__pmSteps` clock
machinery was touched, only additive dispatch branches.

---

## 3. The two structural extremes are proved (spec §7 step 2)

Harness: **Playwright chromium against the real assembled sim HTML** (`assembleField3DHtml`), i.e. real
Three.js, real DOM, real `animate()` clock — not a mocked node driver, which is structurally blind to
clipping and occlusion. `requestAnimationFrame` + `performance.now` replaced by a virtual clock so
`__pmSteps` is drivable exactly. Harness committed at `src/scripts/_scratch_nlb_bringup.ts`;
its generated HTML/PNG/JSON artifacts sit in gitignored `.scratch_nlb/`.

**`free_body_diagram` extreme (7 states — arrows + ghost, no coupled branch):** all six arrow kinds
visible with magnitude-tracking lengths and correct Unicode labels (`mg`, `N`, `fₛ`/`fₖ`, `F`, `T`, `ΣF`,
`mg·sin θ`, `mg·cos θ`). A genuinely zero force **hides** its arrow — `ΣF` hidden on static states,
`normal` hidden on every hanging body, no stubs. `show_components` at θ=30° gives sin 0.588 + cos 1.0184,
`hypot = 1.1757` vs the `mg` arrow 1.1760 → **recomposes to mg**; both components and the right-angle
marker hide at θ=0 through the same config. A `ghost: true` body seeded `v=2, F=15 N` held `s = −3.00000`
across all 12 samples spanning 64→944 ms — **never integrated** — with zero arrows, no drag proxy, and
mesh opacity 0.40 against a focal at 1.00. Exactly ONE focal at opacity 1.00 in all 12 snapshots
(Rule 32e). Generic `#sliders` and generic formula overlay `display:none` in every state (site 9 holds).

**`connected_bodies` extreme (5 states — Branch B + new pulley geometry):** the coupled branch engages
(`eng.coupled === true`, `v_string`/`a_string` live). Both spec checksums reproduce:

| Case | Engine | Closed form |
|---|---|---|
| Atwood m₁=3, m₂=5 | `a = −2.4500`, \|T\| = **36.750 on both** | `(m₁−m₂)g/(m₁+m₂) = −2.45`; `m₂(g+a) = m₁(g−a) = 36.75` |
| Incline+hang θ=0, m_inc=4, m_hang=3, μₖ=0.2 | `a = 3.0800`, `N = 39.200`, \|T\| = **20.160 on both** | `(29.4 − 0 − 7.84)/7 = 3.08` |
| Incline+hang θ=25° | `a = 0.81829`, `N = 35.5274`, \|T\| = **26.9446 on both** | `(29.4 − 16.5666 − 7.10544)/7 = 0.81829`; `39.2·cos25° = 35.5274` |

Post + wheel + both rope segments visible and confirmed **in pixels**: rope A taut and parallel to the
incline from the block face to the rim tangent, rope B vertical from rim to the hanging cube's top face.
String inextensibility over 12 instants of real motion: a single unique value to 9 dp (Atwood 2.450000000;
θ=0 4.075000000; θ=25° 4.075000000). θ=0 and θ=25° differ **only** in `surface.theta_deg` — one code path,
no special case. An uncoupled state shows no post, no wheel, no rope, and hides the tension arrow.

**Rule 36 proved end-to-end on the real renderer:** 20 × `dtStep 0.016` vs 10 × `dtStep 0.032` from an
identical seed → FBD `Δs = Δv = Δa = ΔT = 0` exactly; coupled `Δs ≤ 2.78e−17`, `Δv = 1.11e−16` (1 ulp).
Under `SET_TIME_FREEZE`, all 12 pinned states gave a **byte-identical `page.screenshot()`** after 20
further pumped frames (`Buffer.compare === 0`) with identical engine JSON. No literal per-frame `0.016`
clock constant anywhere; the integrator is called once per tick with the combined `dtStep`.

Zero page errors, console errors or uncaught tick errors across 24 state applications.

---

## 4. Three spec corrections made (numerically forced, not stylistic)

The spec is founder-approved, so these are flagged rather than silently absorbed. Each was caught by
**executing** the spec's own checksums rather than eyeballing the algebra.

1. **Position update — spec §2's literal `s += v_new*dt` is not step-count invariant**, so it contradicts
   the Rule 36 fold-exactness the same section asserts twice: 3 steps of `h` give `s₀+3h·v₀+6ah²`, one
   step of `3h` gives `s₀+3h·v₀+9ah²`. Measured 2.304e−3 m divergence at 120 Hz for a 6 N / 2 kg case.
   Shipped `s += 0.5*(v_old+v_new)*dt` (≡ `v·dt + ½a·dt²`), which folds exactly (Δ = 0) and is the exact
   kinematic result for constant `a`. Velocity, the static-stick test, the friction sign logic, the
   zero-clamp and every reported quantity are unchanged from spec §2.
2. **Hanging-body gravity sign — spec §2's `theta_i = hanging ? 90` is wrong for its own axis
   convention.** A hanging body's positive axis points *downward*, so `F − m·g·sin(90°)` puts gravity in
   the wrong direction: taken literally, a free hanging body accelerates **upward** and **both** of the
   spec's checksums fail (Atwood returns `T = m(g+a)` instead of `m(g−a)`). Shipped gravity computed in
   the body's own axis (`hanging ⇒ +m·g`), plus tension from each body's own equation of motion
   (`T_i = m_i a_i − drive_i − f_i`), which yields equal \|T\| on both bodies in every case tested — the
   spec's literal form does not. Identical to the spec for all five non-hanging concepts.
3. **`deriveStateMeta` has THREE required sites, not two.** Spec §5 says "Both 12 and 13 are REQUIRED or
   THE EYE false-fails." There is a silent third: `F3D_REVEAL_KEYS`. `resolveField3dStates`' cached
   `physics_config` path — the shape THE EYE actually reads — is recognized only via
   `hasField3dTiming()`, which tests membership in that hardcoded list. Without the key both mandated
   sites are dead code on the cached path and every state derives PCPL-style at `DEFAULT_REVEAL_MS`.
   Added. **Recommend amending the spec** so the next new scenario does not repeat this.

Also noted, not fixed: `__pmSteps = 3` is unreachable — the accumulator clamps at `Math.min(50, …)` and
`3 × 1000/60 = 50.000000000000004 > 50`. Real range is 0–2, so the "0–3 fixed steps" wording in Rule 36
overstates it. Harmless (a 2-step fold is the general case and it passed).

Every existing scenario's `deriveStateMeta` output was proved **byte-identical** across all 126 concept
files before/after seam F (`diff` + `cmp` both clean), and the seam has zero deletions.

---

## 5. Open founder decisions (3) — nothing was silently extended

The state file says an under-generalization is a STOP-and-report condition. One was found:

1. **UNDER-GENERALIZATION — a both-hanging (Atwood) state cannot hide the surface slab.** The surface
   group is unconditionally forced visible in `applyNewtonsLawsBodyState` (correctly — it must beat the
   generic `visible_elements` matcher, which is scar candidate #1), and there is no `surface.hidden` key.
   In an Atwood state a 12 m empty plank is the largest object on screen in a scene that physically has no
   table. Today's workaround: `surface: { length_m: 0 }` + explicit `pulley.post_position_m` leaves a
   0.4-unit stub. Minimal fix = one optional boolean honoured in one place. **Not taken — founder call.**
   This is the ONLY thing standing between the engine and the spec's "concepts 2–6 need ZERO renderer
   edits" claim.
2. **Label de-collision is projection-blind.** Seam C's de-collision pass enforces a 0.30 **world-space**
   minimum and reports every pair separated; on screen at the default oblique field/flux camera, `mg` and
   `mg·cos θ` render as one blob. The separating direction is foreshortened by exactly that camera.
   Mitigation is a JSON concern (author a near side-on `camera_position` per state — see §6), so it is
   deferred to the first real authored state rather than fixed blind.
3. **`#nlb_formula` is edge-anchored with no width bound.** A long central equation wraps to two lines and
   runs through the pulley wheel (Rule 34d collision, invisible to every value-level probe). Also
   deferred to the first authored state, since the fix depends on real narration length.

Founder-glance frames in gitignored `.scratch_nlb/`: `nlb_smoke_fbd_STATE_4_800.png` (components + label
crowding), `nlb_smoke_connected_STATE_1_400.png` (Atwood + the empty slab), and
`nlb_smoke_connected_STATE_3_400.png` (pulley on incline + the formula collision).

One engine defect was found and fixed during bring-up (`f921a3c`): a hanging body printed
`N = 0.00 N` / `fₖ = 0.00 N` permanently, because `readouts` is a *state*-level enum while physics is
per-body. Both are zero by construction for a hanging body, so they are now suppressed there — the same
rule the arrow layer already follows ("a real zero force hides, never a stub").

---

## 6. JSON authoring contract (for Phase 1 / `json_author`) — read before authoring

- **`field_lines` is REQUIRED by the `Field3DConfig` type** even though this scenario draws none. Author
  an inert block: `{ count: 0, color_positive, color_negative, opacity: 0, arrow_spacing: 0 }`. `tsc`
  fails without it.
- **Every state MUST author `camera_position`** — a near side-on view. The shared default is an oblique
  three-quarter camera tuned for field/flux, and it foreshortens exactly the angles a force decomposition
  exists to show. This is the mitigation for open decision #2.
- **A body id's `hanging` flag must be CONSTANT across states.** The parent group (world vs the rotating
  surface group) is chosen at build time from the union of all states' `bodies[]`. Violating it
  mis-renders **silently with correct physics** — it was hit during bring-up: an Atwood pair reusing the
  incline block's ids drew the block dangling from the pulley while the integrator treated it as a surface
  body, and every numeric probe passed. **Give the Atwood beat its own body ids.**
- Closed enums (authoritative): `mode` = the 13 in §1 · arrow `show` = `weight|normal|friction|applied|tension|net`
  (unknown strings are dropped at seed time) · `readouts` = `N|f|a|v|T|F_net|F_applied` (`N`/`f` suppressed
  on a hanging body) · `controls_visible` = `m|m2|F|theta|mu_s|mu_k|v0`.
- `glow_focal` should be a **specific object id**: `nlb_arrow_<bodyId>_<kind>`, `nlb_comp_<bodyId>_sin|cos`,
  `nlb_body_<bodyId>`, `nlb_surface`, `nlb_pulley_post|_arm|_wheel|_hub`, `nlb_rope_a|_b`. The matcher also
  accepts a bare `bodyId`, which makes *every* object of that body focal — group emphasis, not "exactly one
  element" (Rule 32e). Prefer the specific id.
- Slider rows are built only for tokens some state of *this* concept names, in canonical order, and hidden
  rows keep a **reserved slot** (`visibility:hidden`, not `display:none`) so a shared slider never changes
  screen position (Rule 32d). So a one-slider concept gets a one-row panel.
- Sandbox state: `mode: 'sandbox'` + `advance_mode: 'interaction_complete'` + `trusted_drag_seizes: true`
  + `idle_auto_sweep` (verified sweeping both `F` and `theta` live; a trusted slider or drag seizes).
  Rule 37's continuous free-run is a player invariant — needs no per-concept work.
- `idle_auto_sweep` is a 4000 ms triangle starting at `range[0]` at `t=0`. **Author `range[0]` as the
  state's own value** if the first frame must not step.
- `deriveMotionExpectations` has no `newtons_laws_body` branch, so nlb states rely purely on the
  `reveal_hold` classification for D5/D6 — motion is unenforced by design (safe: never a false-fail, and
  it protects legitimately-static beats like `rest_equilibrium` / `fbd_isolate` where `a ≈ 0`). Author a
  top-level `trajectory_mode` if enforcement is wanted.
- `hanging: true` with **no** `pulley` block works (body hangs from the anchor, no bracket shown) but is
  physically odd — recommend the concept contract forbid it.
- For an Atwood state keep `pulley.post_position_m` at/near its default (`surface.length_m`); a mid-ramp
  post puts the near-side rope and its body over the slab.
- **`free_body_diagram` is a RETROFIT** (spec §8.8): flip its existing `CONCEPT_RENDERER_MAP` +
  `panelConfig.ts` entries from `mechanics_2d` to `field_3d` and clear its `simulation_cache` rows
  (Rule 9). Do **not** confuse it with the unrelated dormant `MECHANICS_SCENARIO_MAP` string
  `"free_body_diagram"` in `aiSimulationGenerator.ts` — leave that alone.

---

## 7. Scar candidates — founder review, NOT applied

`docs/loop_runs/lom/_engine/scar_candidates.sql` — **14 INSERTs**, all text only. No DB write was made in
this session and no row was inserted into `engine_bug_queue`. The rows follow the file's 13-authored-column
shape (`row_type` ∈ `incident|probe_definition|directive`; there is no `notes` column).

The two most reusable, both of which the spec would otherwise repeat on the next new scenario:
- `field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus` (MAJOR) — the generic
  visibility pass runs *earlier* in `applyState()` than every per-scenario apply and substring-matches, so
  a new scenario's static apparatus silently vanishes on any state whose `visible_elements` omits it. All
  `nlb` objects are therefore registered in a private index, never `addToScene`.
- `derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl` (MAJOR) — §4 item 3.

---

## 8. Deferred / not done (deliberate)

- **No concept JSON authored** and **no registration site touched** — spec §8 is Phase 1.
- **No `free_body_diagram` retrofit** — deliberate scope call; the smoke fixtures used scratch ids so the
  real concept was never touched.
- No TTS, no `build:pilot`, no deploy, no `PILOT_CONCEPTS` edit, no `visual:approve`, no merge to master.
- The three open decisions in §5 (surface-hide boolean, label projection, formula width bound).
- `.scratch_nlb/` artifacts are gitignored; the harness itself is committed so the proof is re-runnable
  (`npx tsx src/scripts/_scratch_nlb_bringup.ts`).
- Present in `git status` but **not mine and not committed**: `docs/CHAPTER_LOOP.md`, `scripts/lom_loop.ps1`
  (another session's uncommitted work).

**Bottom line:** the engine is built, committed on `feat/lom-a`, verified green after every seam, proved on
both structural extremes against the real renderer, and clean against the regression sample. Concepts 2–6
need zero renderer edits with one exception awaiting a founder call: the un-hideable surface slab on a
both-hanging Atwood state.
