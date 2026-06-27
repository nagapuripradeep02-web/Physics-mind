# RENDERER REGEN DIRECTIVE — electric_potential_meaning

- cluster: renderer_primitives
- fix_summary: added the electric_potential_meaning field_3d primitives (config-driven labelled equipotential shells, route-animating test charge + live work tally, q→2q grow, ΔV bracket + ∞·V=0 reference marker billboarded camera-right, draggable V-readout explorer with idle auto-sweep) + deriveStateMeta recognition for the V=W/q arc
- affected_cache_tables: [simulation_cache]
- affected_concept_ids: [electric_potential_meaning]
- affected_modes: [conceptual]
- handoff_to: runtime_generation

## THE EYE follow-up fixes (post first frame-read, 2026-06-26)

Five human-frame-read defects in the new primitives — all fixed ENGINE-SIDE (no JSON change required):

1. **STATE_6 shells never rendered + STATE_2 tallies stuck at ~0 + STATE_3 drain never started (CRITICAL, root cause).** NOT a rendering-logic bug — the reveal math was correct. ROOT CAUSE: the `SET_TIME_FREEZE` mechanism advances the renderer clock by `time += 0.016` per rAF and only holds once it crawls to the pin. Under headless rAF throttling the clock cannot reach a late state-local target (STATE_6 `shells_at_ms=12000`; STATE_2 routes; STATE_3 release) inside the screenshotter's poll window (manifest warnings: STATE_6 "reached 2608/20000ms", STATE_2 "5440/16500ms", STATE_3 "3056/9200ms" — then "capturing anyway"), so the frozen frame photographed a pre-reveal moment. FIX: because `electric_potential_meaning` is accumulator-free (every reveal is a pure function of `time - stateStartTime` — no trails/integration), the freeze now SNAPS straight to `freezeAtTime` in one frame (gated on `config.potential_meaning`; every other scenario keeps the deterministic crawl). The snap is byte-identical to crawling for pure-function reveals. `deriveStateMeta` targets were already correct (it asked for 20000ms) — no change there.
2. (covered by #1 — same fix.)
3. **STATE_3 energy badge mislabelled "E = 6" → fixed to "U = 6".** The badge value prefix was "E =" (mislabels potential ENERGY as the field E — the exact confusion the concept breaks). Changed all four spots (build + apply + drain + held) to "U =".
4. **STATE_4 charge stays "+q" while W=12 → now flips to "+2q" on the doubling reveal** (parses `test_charge_route.doubling.grow_label`, flips at half-grow, resets to "+q" on state re-entry).
5. **STATE_5 "∞·V=0" reference marker off-camera → now positioned camera-right + camera-up (in-frame), not at fixed world +X=4.0** that orbited off-screen.
6. **Shared point_charge legend "Red sphere = +q" mislabelled the SOURCE +Q → legend now suppressed when `config.potential_meaning`** (the concept carries its own in-scene labels; matches how gauss/flux suppress the legend). Gated so NO other point_charge concept is affected.

`npx tsc --noEmit` → 0 errors after all defect fixes.

**JSON recommendation for json_author:** none required. The reveal `*_at_ms` values (e.g. `shells_at_ms: 12000`) can STAY at their narration-synced pedagogical timings — the engine fast-forward now reaches them deterministically in the frozen capture. No `*_at_ms` value needs to shrink.

## THE EYE follow-up #2 (billboard label clipping, 2026-06-26)

**Defect:** long billboard label strings clipped from the edges (STATE_5 ΔV showed "= V_B − V_A" with "ΔV " and "= +3" sheared off; STATE_3 "U = stored energy" showed "= stored ene"). ROOT CAUSE: `createLabelSprite` uses a FIXED 384px-wide canvas with centre-anchored text, so any string wider than 384px overflows both canvas edges and is clipped — and `updateLabelSpriteText` (used for the live tallies/readout) inherited the same fixed width. FIX (engine-side, scoped to the potential path): added `pmCreateAutoLabel(text,color,heightScale)` — sizes the canvas to the MEASURED full text width AND retains canvas/ctx/color so `updateLabelSpriteText` can redraw it live; `updateLabelSpriteText` now RE-MEASURES + re-fits the canvas width on a longer live redraw (`_pmAutoWidth` path) so "U = 6" → "U = stored energy" never clips. Routed all 14 potential-concept billboard labels (shell V-labels, +q label, work tallies, W/q, U badge, V callout, V-on-point, ∞ marker, A/B labels, ΔV label, E label, V readout) through it. `createLabelSprite` / `createWideLabelSprite` are UNCHANGED — every other scenario keeps its existing label sizing. `npx tsc --noEmit` → 0 errors.

**Framing FYI (no engine fix):** the STATE_6/7 "~40% pixel width" observation is NOT an engine camera bug. The authored per-state `camera_position` magnitudes are near-identical across all 7 states (radius ≈ 4.0–5.6; STATE_6 ≈ 4.85, STATE_7 ≈ 5.6 vs STATE_1 ≈ 5.18) and the renderer applies them verbatim via `animateCameraTo` → `targetSpherical.radius`. The renderer has NO auto-fit/auto-zoom that reacts to the shells' bounding box. The width difference is a headless-capture/crop artifact in THE EYE's screenshotter (visual_validator scope), to be confirmed on the live full-size review site. No engine change made.

## What changed (engine, additive + backward-compatible)

Two files edited, both renderer_primitives sacred-scope:
- `src/lib/renderers/field_3d_renderer.ts` — `Field3DConfig` interface extended with OPTIONAL fields (`equipotential.shells` / `label_each_shell`, `potential_meaning`, `test_charge_route`, `reference_marker`, `delta_v_bracket`, `energy_badge`, per-state `states[].potential`); `buildEquipotentialSurfaces()` upgraded (config-driven shells + per-shell V labels, legacy even-spacing preserved); new `buildPotentialMeaning()` + `applyPotentialMeaningState()` + `updatePotentialMeaningFrame()`; drag wired via `pmPotentialStateIsDraggable()` + `pmPickSensor`/`applyDragFrom` branches; dispatch hooks in `buildScenario()` (point_charge_positive case), `applyState()`, and the animate loop.
- `src/lib/validators/visual/deriveStateMeta.ts` — `potential` block recognition in `deriveMotionExpectations` (STATE_2 route + STATE_3 release = motion), `maxRevealForField3dState` (pin past every reveal beat), and `deriveHoldExpectations` (STATE_7 draggable = interactive; reveal states = reveal_hold).

NO content JSON edited. NO cache DELETE run by this cluster.

## Why a re-seed is needed

`electric_potential_meaning` is a NEW concept. Its `simulation_cache` row (when json_author seeds it via `src/scripts/_seed_electric_potential_meaning_cache.ts`) must be created AFTER this engine change so the cached iframe HTML embeds the new `FIELD_3D_RENDERER_CODE` (which now contains `buildPotentialMeaning` etc.). If a row was seeded against the pre-change renderer, the potential primitives would be absent.

## Action for runtime_generation / json_author

1. json_author fills `electric_potential_meaning.json` `field_3d_config` per the §12 data contract (see the JSON contract mapping in the engine-build hand-back).
2. Re-seed: `DELETE FROM simulation_cache WHERE concept_id = 'electric_potential_meaning';` then run `npx tsx --env-file=.env.local src/scripts/_seed_electric_potential_meaning_cache.ts` (or the standard prewarm against `/api/generate-simulation`).
3. No other concept is affected — `deep_dive_cache` / `drill_down_cache` need no sweep (deep-dive/drill-down are dormant for this concept and no shared primitive's drawing changed for any existing concept; `buildEquipotentialSurfaces` is a no-op for every concept that does not set `config.equipotential`, and none currently do).

## Backward-compatibility statement

Every existing field_3d concept is unaffected:
- `buildEquipotentialSurfaces()` now early-returns when `config.equipotential` is absent (every current concept) — identical to the prior guard. The new labelled-shell path runs ONLY when `config.equipotential.shells` is present; the legacy even-spacing path runs ONLY when `config.equipotential.show` + `surfaces` (dormant in current data, preserved byte-for-byte).
- The `point_charge_positive` case branches to `buildPotentialMeaning()` ONLY when `config.potential_meaning` is present; otherwise the legacy radial-field build runs unchanged.
- `applyPotentialMeaningState()` / `updatePotentialMeaningFrame()` are gated on `config.potential_meaning`, so no other scenario executes them.
- `deriveStateMeta` only reads the per-state `potential` block; states without it are untouched.
- `npx tsc --noEmit` → 0 errors (no new errors introduced).
