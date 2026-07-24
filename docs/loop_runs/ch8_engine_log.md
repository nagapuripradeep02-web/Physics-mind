# ch8 engine-loop log

Every §3b engine dispatch: finding → fix commit → verify evidence. Founder reviews all diffs at chapter end via `git log --grep=engine-loop -p`. Scar candidates (files only, not applied) live in `docs/loop_runs/ch8/_engine/scar_candidates.sql`.

---

## E1 — `displacement_current_scenario` (NEW field_3d scenario build)
- **Concept:** displacement_current (Ch.8 #1, NCERT §8.2)
- **Owner:** peter_parker:renderer_primitives (built by field3d-surgeon)
- **Rollback point (pre-dispatch HEAD):** `7d96be6`
- **Fix commit:** `59cdd53` — `feat(engine-loop): displacement_current field_3d scenario [owner: peter_parker:renderer_primitives]`
- **Files:** `src/lib/renderers/field_3d_renderer.ts` (+691/−3: buildDisplacementCurrent / applyDisplacementCurrentState / updateDisplacementCurrentFrame / applyDisplacementCurrentGlow + helpers + 6 shared glue sites), `src/lib/validators/visual/deriveStateMeta.ts` (+71: F3D_REVEAL_KEYS + motion/hold expectations + per-cue reveal pins).
- **New primitive:** `dc_surface` disk↔balloon paraboloid vertex-morph on a pre-built 11×28 grid BufferGeometry (positions rewritten in place, no geometry churn). Flat disk (s=0) pierced by wire; balloon (s=1) apex into the gap, pierced by nothing.
- **Verify chain (ALL pass):**
  1. check:renderer-syntax OK → tsc 0 errors → validate:concepts 125 PASS / 0 FAIL (displacement_current PASS, warning profile unchanged).
  2. Re-seed + THE EYE on displacement_current: **43/43 deterministic checks passed, 0 failed** (H2 skipped — no approved baseline yet, expected for a new concept). Frames confirm S1 beads-stop-at-plates, S3 loop+disk+I_enc=1.2A, S4 balloon+I_enc=0?, S5 B=2.4µT (after S5 fix), S6 I_c=I_d=1.20A, S7 B tracks + R=6.0cm tag + peak marker, S8 chain closes ≈1.2A (no 1.204 artifact), S9 ledger frozen at μ₀×1.20A while terms trade, S10 all-3-sliders I_d=I_c live.
  3. Regression sample (Amendment 5, ch8 disjoint pair): magnetisation_and_intensity **38/38** (H2 0.00%), bar_magnet_as_dipole **56/56** (H2 ≤0.23%, known compass-easing residual under 2.0% tol). No ch7 baselines touched.
  4. Clock guard: diff does NOT touch __pmSteps/dtStep/accumulator — no fleet sweep required.
- **In-build fix (found + fixed same dispatch):** S5 froze at B=0.0µT (reveal pin landed in a Loop-A HOLD zero-window, contradicting the caption). Fixed renderer-side: `dcPhase()` forces SUSTAINED charge for mode `b_lives_in_the_gap` (honors physics_author Flag #1). No concept-JSON content edit. → scar candidate `field3d_charge_hold_reveal_pin_lands_in_zero_window` (MAJOR) appended to scar_candidates.sql.
- **Open flags for eye-walker / founder-proxy / founder hand-test:**
  - S10's three sliders + trusted-drag seize + idle-sweep-stops-on-grab cannot be fired by THE EYE (untrusted events) — founder hand-test.
  - S9 ledger mid-morph "genuine mix" legibility in live playback (frozen pin shows s≈1.0 all-displacement extreme).
  - `dl` / Ampèrian-loop billboard labels + S7 R/peak tags sit near the loop edge — no clipping in frozen frames, possible polish pass.

---

## E2 — `field3d_scene_composition_annotation_silent_noop` (S5 ghost tag, BLOCKING → routed by founder-proxy Checkpoint B)
- **Concept:** displacement_current, STATE_5 (b_lives_in_the_gap — the central Rule-16a confrontation)
- **Owner:** peter_parker:renderer_primitives (field3d-surgeon)
- **Finding (founder-proxy CP-B, P1 blocking):** the authored wrong-expectation cue ("no current → B should be 0") rendered on ZERO frames (scene_composition annotation silent no-op) → sound-off (Rule 24) the confrontation was narration-only. No clean authoring channel → scoped renderer element.
- **Rollback point:** `59cdd53`
- **Fix commit:** `aa724f8` — `fix(engine-loop): displacement_current S5 wrong-expectation ghost tag [owner: peter_parker:renderer_primitives]`
- **Files:** `src/lib/renderers/field_3d_renderer.ts` (+26, dc-only functions): new `dc_ghost_tag` DOM overlay (position:fixed bottom-centre, ghosted grey #90A4AE @0.6 opacity, italic, z-index:8 below formula/HUD; innerHTML `✗ Expected: no current → B̶=̶0̶`, real Unicode ✗/→ + strikethrough); mode-gated in dcApplyWidgetVis (display only when mode === b_lives_in_the_gap); in-frame reveal wired to the authored ghost_tag_at_ms hook (pure fn of state-local ms, deterministic under freeze). deriveStateMeta NOT touched (existing reveal_hold classification suffices; no false-fail).
- **Verify chain (ALL pass):** check:renderer-syntax OK → tsc 0 errors → validate:concepts 125 PASS. Re-seed + EYE displacement_current 43/43 (H2 skipped). **S5 frozen confirmation: ghost cue visible + B=2.4µT BOTH present** (.visual_runs/displacement_current/20260724-202229/STATE_5__frozen.png); tag on S5 ONLY, no leak (STATE_6 frozen clear). Regression: magnetisation_and_intensity 38/38 (H2 0.00%), bar_magnet_as_dipole 56/56 (H2 ≤0.22% known AA jitter). No clock touch, no fleet sweep.
- **Styling calls:** ≤6-word cue condensed from the authored visual_counter; leading ✗ + strikethrough on "B = 0" (Rule 29 subordinate — S5 glow focal stays probe, Rule 32e); bottom-centre reserved zone (Rule 34d, DOM collision-safe). No concept-JSON edit.
- **Ride-along still queued (Finding #1):** S4 vertex-morph monotonicity guard — runs AFTER the concept's approve commit (§3 step 4 ride-along).

---

## E3 — `field3d_vertex_morph_nonmonotonic_at_cue_boundary` (S4 morph guard, RIDE-ALONG → founder-proxy Checkpoint B Finding #1)
- **Concept:** displacement_current, STATE_4 (dc_surface disk↔balloon vertex-morph — reused by S9 continuous scrub + future scenarios)
- **Owner:** peter_parker:renderer_primitives (field3d-surgeon)
- **Finding (founder-proxy CP-B, P2 ride-along):** eye-walker frame-by-frame flagged a one-frame spurious full-balloon at s=0.00 (STATE_4__dense_t02000.png); founder-proxy read the same frame as flat (non-reproduction). At worst a transient single-frame non-monotonic pop at the morph_start_at_ms:2000 cue boundary — not persistent wrong geometry; endpoints + I_enc readout correct.
- **Rollback point:** `aa724f8`
- **Fix commit:** `32f032d` — `fix(engine-loop): dc_surface vertex-morph monotonicity guard [owner: peter_parker:renderer_primitives]`
- **Files:** `src/lib/renderers/field_3d_renderer.ts` (+11/−2, dc-only fns): (1) dcUpdateSurface(s) clamps s to [0,1] with NaN→0 floor = single geometry authority; (2) updateDisplacementCurrentFrame clamps the frame-computed s once so mesh + ledger + HUD share the same bounded value; (3) dcScriptedS same_loop_two_answers branch makes the flat-disk boundary explicit (ms<=st → 0, ms>=st+du → 1; mathematically identical to prior smoothstep). No accumulator/dtStep/integrator touched; pure fn of state-local ms → SET_TIME_FREEZE byte-stable. No JSON edit; choreography/timing/endpoints/S9 scrub unchanged.
- **Verify chain (ALL pass):** check:renderer-syntax OK → tsc 0 → validate 125 PASS. Re-seed + EYE displacement_current 43/43. **STATE_4 dense monotonicity confirmed**: t=0/1000/2000 flat s=0.00 (no balloon pop at the cue boundary), t=3000 s=0.07, t=5000 s=0.50, t=8000→18000 s=1.00 held — single monotone ramp, mesh matches reported s every frame; transient now structurally impossible. S9 scrub clean (ledger sum 1.20A frozen at every s), S5 ghost tag intact. Regression: magnetisation_and_intensity 38/38, bar_magnet_as_dipole 56/56, no H2 regressions. No clock touch, no fleet sweep.

---

### Engine-commit summary (this concept): `59cdd53` (scenario build) · `aa724f8` (S5 ghost tag) · `32f032d` (morph guard). 3 commits — below the ≥8 runaway-guard threshold. All grep-able via `git log --grep=engine-loop`.

---

## E1 · `em_wave_propagation_scenario` · [owner: peter_parker:renderer_primitives]
**Concept:** `em_wave_propagation` (Ch.8 #2) · **Dispatch:** field3d-surgeon (Amendment 4 routing) · **Date:** 2026-07-24
**Rollback point recorded before dispatch:** `4205e1a`

**Finding / ask.** NEW `scenario_type: "em_wave_propagation"` — no existing field_3d scenario renders a translating transverse vector train with two orthogonal polarizations, a phase-speed clock, or a medium slab (registry verified against the union in `field_3d_renderer.ts`). Class-B new-scenario build, spec = skeleton §0b (design-gate `DESIGN_OK`). Staged core-first per founder-proxy finding F1.

**Increment 1 (this commit) — the load-bearing core.** `emw_source` (antenna + amber charge bead + ON/OFF switch glyph) · `emw_axis` (+x, 10 m, metre ticks, direction tag; plain cylinder NOT createTubeLine, defensive per scar #9) · `emw_e_train` (green, y-hat) / `emw_b_train` (blue, z-hat) envelope polyline + 13-arrow array each, orthogonal, in phase · `emw_receiver` (dual live gauge E V/m + B uT, numeric + tracking needles, Rule 33d) · `emw_motes` (40 seeded-deterministic motes, never displaced, vanish cue) · per-state `wave_mode: pulse|train` · source on/off with launch-gate so an in-flight pulse continues after the switch opens (S2 seed).

Physics: phase `x - v*t`, `v = c/n`; `E = E0*sin(k(x-vt))` on y-hat, `B = E/c` on z-hat; `omega = 2*pi*nu` region-independent (ready for the slab). **All values are pure functions of state-local ms** — no per-frame delta, no integrator touched (Rule 26/36).

Same-change registration: union member · `emw_defaults?` config type · buildScenario/applyState/animate dispatch · accumulator-free freeze-snap list · `#sliders` NOT-list (`isEmw`) · generic-legend suppression (Rule 24) · closed glow enum with `brightenOnly` · 4 slider rows with trusted-drag seize, **`emw_n_row` seize sets `freezeAtTime = null` (FL1 — un-pins S10's manual_click clock so the n-drag drives live bunching)** · Rule 39g discovery conventions · NO backticks in the template body · `deriveStateMeta.ts`: `'em_wave'` in `F3D_REVEAL_KEYS`, motion block, cue-pins (motes_vanish / nochange / needle_kick / source_off), hold block (guided -> `reveal_hold`, `interactive:true` -> `interactive`).

**Verify chain (ALL pass):**
1. `check:renderer-syntax` -> field_3d syntax OK (2190 KB), particle_field syntax OK.
2. `npx tsc --noEmit` -> **0 errors**.
3. `npm run validate:concepts` -> **125 PASS, 0 FAIL**; warning profile unchanged.
4. Regression sample (Amendment-5 DISJOINT ch8 pair) — re-seeded, then THE EYE: `magnetisation_and_intensity` **38/38**, all 12 H2 baselines 0.00% · `bar_magnet_as_dipole` **56/56**, all H2 0.00% except STATE_1__frozen 0.23% (within the 2.0% tolerance; pre-existing animation-tail jitter, not from this additive change).
5. Live render smoke (throwaway Playwright, synthetic 3-state config, deleted after): SIM_READY fired, STATE_REACHED x3, wave_mode switched pulse->pulse->train, **ZERO** pageerror/console.error/SIM_ERROR; screenshot confirmed orthogonal E/B trains, antenna+bead, axis+direction tag, receiver `E = 120 V/m` / `B = 0.40 uT`, motes. **S1-S3 render end-to-end.**

**Clock guard (Rule 36b):** diff does NOT touch `__pmSteps`, `dtStep`, or any shared integrator — only an additive entry in the accumulator-free freeze-snap OR. **No full-fleet sweep required.**

**Scope proof:** diff = exactly `field_3d_renderer.ts` (+510/-3) + `deriveStateMeta.ts` (+44/-0). The 3 deletions are benign in-place extensions of shared one-line chains. Every dispatch branch guarded by `scenario_type === "em_wave_propagation"`; only the `emw_` prefix introduced; zero sibling logic altered.

**Ceiling:** NOT hit. Stopped at the clean increment boundary (core complete, S1-S3 verified).

**Interpretive calls flagged to founder-proxy:** (a) in-slab B amplitude keeps the vacuum ratio E/c — per the skeleton's F2-decline; (b) axis = plain cylinder rather than createTubeLine (defensive, deliberate); (c) `interactive: true` is a NEW per-state enum key on the `em_wave` block (explore-state discriminator, mirrors dc's `displacement_sandbox` split); (d) receiver gauge shows arriving PEAK amplitude (steady 120 V/m for a train, 0->120->0 ramp for a pulse = the S1 needle-kick-after-delay), needle tracks the signed instantaneous value.

**Scar candidate:** 1 directive row (`field3d_traveling_vector_train_primitive`) written to `docs/loop_runs/ch8/_engine/scar_candidates.sql`. NOT applied to the DB (trial constraint).

**Next increment (E2):** layer per-state add-ons in state order — `emw_relay` (S2) · `emw_triad` + RHR sweep-arc (S4) · `emw_ghostb` + `emw_cursor` (S5) · `emw_gates` + stopwatch + two-line `emw_formula` dock (S6, densest — honor the §10(h) overlay-zone map) · `emw_tanks` (S8, FL4 identical string) · `emw_slab` (S10, F2/FL5 both trains bunch, piecewise spatial-phase integration across the boundary).
