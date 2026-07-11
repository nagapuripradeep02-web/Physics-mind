# biot_savart_law — engine fix spec (pre-existing defects surfaced by THE EYE)

**Date:** 2026-07-09 · **Status:** SPEC ONLY — not yet implemented (blocked: shared tree dirty, see §Constraints)
**Trigger:** After the Rule-31 JSON reconstruction of `biot_savart_law` (2026-07-08, JSON-only — narration/pacing/`visible_controls`, `field_3d_config` untouched except the STATE_6 label), THE EYE ran (39/42 deterministic checks) and `eye-walker` (run `.visual_runs/biot_savart_law/20260709-002004/`) surfaced defects. **All are PRE-EXISTING in the `biot_savart_element` scenario — not regressions from the reconstruction** (proven: the only rendering-relevant diff line is the STATE_6 label text; every camera / `visible_elements` / reveal-timing field is byte-identical to the authored sim).

This spec is for a dedicated pass by `peter_parker:renderer_primitives` (+ one `deriveStateMeta`/THE-EYE fix) run **on a clean tree**. It is NOT the Rule-31 JSON reconstruction (that is done + gated: tsc 0, validate 113/113 PASS).

---

## Finding 1 — STATE_7 (+STATE_8) frozen-pin fires before the sequence assembles — MAJOR
**Owner:** `peter_parker:visual_validator` (THE EYE capture harness) · **File:** `src/lib/validators/visual/deriveStateMeta.ts`

**Symptom:** `STATE_7__frozen.png` (the H2 SET_TIME_FREEZE pin, also the visual:approve baseline source) shows a bare wire with **zero** field loops, while `STATE_7__dense_t16000.png` shows the fully assembled circle — the PRIMARY aha ("the circle assembles itself"). If `visual:approve` runs now, the STATE_7 baseline permanently encodes the empty frame and poisons every future regression diff.

**Root cause (verified by reading the code, NOT a live renderer bug):** the renderer animates STATE_7 correctly — `field_3d_renderer.ts:33754-33757` ramps the circle opacity from `revealAtB` (1500 ms) to `lastStartB = reveal_at_ms + (num_elements-1)*reveal_stagger_ms + reveal_fade_ms` = `1500 + 8*350 + 400 = 4700 ms`. But `deriveMaxRevealTimeMs()` in `deriveStateMeta.ts` has **no `biot_savart_element` handler** (it has handlers for gauss/flux/amperes/current_loop/helix/…, but nothing keyed on `biot_element.accumulate_mode`). So STATE_7's max-reveal falls through to the small default and the frozen frame is pinned at ~1500 ms — before assembly. STATE_8 (`accumulate_mode: sequence`, `reveal_at_ms: 800`, `weight_by_sin_theta`) has the same gap.

**Fix:** add a `biot_savart_element` branch to `deriveMaxRevealTimeMs` mirroring the proven `current_loop` `db_stack` pattern (`deriveStateMeta.ts:1302-1303`):
```
// biot_savart_element — accumulate_mode:'sequence' assembles the circle over num_elements
const be = asObj(state.biot_element);
if (be.accumulate_mode === 'sequence') {
    const n = asNum(cfg.biot_defaults?.num_elements, 9);
    candidates.push(
        asNum(be.reveal_at_ms, 1500)
        + Math.max(0, n - 1) * asNum(be.reveal_stagger_ms, 350)
        + asNum(be.reveal_fade_ms, 400)
        + 800  // cushion past full assembly
    );  // → ~5500 ms for STATE_7
}
```
Also register the sequence in the `reveal_hold` / motion-expectation derivation so D5/D6/D7 don't false-flag "motion died" during the staggered assembly. **After the fix:** re-run `visual:eyes -- biot_savart_law`, confirm `STATE_7__frozen.png` shows the assembled circle, THEN it is safe to `visual:approve`.

---

## Finding 2 — STATE_6 dot/cross direction lesson not rendered — CRITICAL
**Owner:** `peter_parker:renderer_primitives` (engine) with an `alex:json_author` interim option · **Files:** `field_3d_renderer.ts` (biot scenario) and/or `biot_savart_law.json` `field_3d_config`

**Symptom:** STATE_6 (top-down camera `[0.1, 6.5, 0.1]`, `direction_practice: true`) reads as a near-empty frame — a stray hand icon, an orphaned marker, P, and a faint orbiting arrow. The whole teaching payload — the ⊙/⊗ symbols and the two cases ("current OUT of page → field circles anti-clockwise" vs "current INTO page → clockwise") — is not legibly present.

**Root cause:** the ⊙/⊗ symbols and both case labels live ONLY in `epic_l_path.STATE_6.scene_composition` annotations (`case_out_label`, `case_in_label`, `predict_label`), and **field_3d does NOT render `scene_composition` annotations** (rendered on-canvas text = `field_3d_config.states.{label, formula_overlay, caption}` only — see memory `reference_field3d_oncanvas_text_source`). The wire from a top-down view is end-on (a point at origin = "current out of the page"), which is correct but unlabelled, and the renderer draws only ONE circulation arrow (`biot_orbit`, `field_3d_renderer.ts:33777-33790`) for the single out-of-page case — the into-page (⊗ → clockwise) case is never shown.

**Fix — two tiers:**
- **Interim (JSON-only, `alex:json_author`, unblocked — edits the concept JSON I own, not the renderer):** put the dot/cross teaching into rendered surfaces — set STATE_6 `field_3d_config.states.STATE_6.caption` to the ⊙/⊗ + circulation-sense text and use `formula_overlay` for "⊙ out → CCW · ⊗ in → CW". This makes the lesson legible immediately without engine work.
- **Full (engine, `renderer_primitives`):** add 3D ⊙/⊗ symbol primitives at the wire end-cap and render BOTH cases (either two side-by-side end-on wires, or a mid-state flip out→in with the orbit arrow reversing direction). Gate on `direction_practice` so sibling scenarios are byte-identical.

---

## Finding 3 — STATE_2 / STATE_3 / STATE_4 are static poses — MODERATE
**Owner:** `peter_parker:renderer_primitives` · **File:** `field_3d_renderer.ts` (biot scenario)

**Symptom:** after their ~1 s reveal, STATE_2/3/4 are pixel-identical for the rest of the state (13 s of no motion). STATE_4's caption promises "proportionality bars" (`show_proportion_bars: true`) but none render.

**Root cause:** `biot_savart_element` is a pre-Rule-31 static-pose scenario for the single-element teaching states — the same class as the Ch.1 `Ch1 field3d static-poses need engine rebuild` batch. Rule 31 "no static state" is satisfied at the JSON axis (narration/controls) but NOT at the engine-motion axis. `show_proportion_bars` appears to have no renderer implementation.

**Fix:** the live-instrument motion pass — per-state motion for the single-element beats (e.g. dl breathing, r̂/θ construction draw-on, proportionality bars that actually grow with I·dl·sinθ and shrink with 1/r²) + `applyVisibleControls(stateDef.visible_controls)` row-visibility (the JSON already declares the `visible_controls` contract; the renderer does not yet honor it) + trusted-drag seize. Mirror the torque `tq_*_row` + per-state-motion pattern shipped 2026-07-05. Re-baseline after (no re-voice — narration final).

---

## Finding 4 — STATE_8 dB arrow at P doesn't scale with contribution — MODERATE
**Owner:** `peter_parker:renderer_primitives` · **File:** `field_3d_renderer.ts:33739-33746`

**Symptom:** as the scan element travels down the wire, the dB arrow at P stays a fixed length, so the "far ends barely matter (∝ sinθ/r²)" point isn't visually demonstrated.

**Root cause:** the renderer scales the wire *marker* by `sinThetaWeight` (line 33741) but the dB *arrow* at P is not length-scaled by the element's contribution. **Fix:** scale the dB arrow length by the live `sinθ/r²` contribution of the current scan element (Rule 32a: cause visibly produces a visible, proportional effect).

---

## Constraints & sequencing
- **No-race BLOCK:** both `src/lib/renderers/field_3d_renderer.ts` AND `src/lib/validators/visual/deriveStateMeta.ts` are currently **dirty** in the working tree (concurrent resistivity/ohms sessions). Do this pass only after those commit and the tree is clean. Finding 2's interim JSON option is the only piece unblocked now.
- **Do NOT `visual:approve` biot** until Finding 1 (and ideally Finding 2) is fixed — the STATE_7 baseline would lock the empty aha frame.
- After the engine pass: re-seed `simulation_cache`, re-run `visual:eyes`, `eye-walker` re-walk, THEN `visual:approve` (re-baseline). **No re-voice** — the Rule-31 narration is final; only the 45 stale TTS clips (21 biot + 24 current_loop) from the reconstruction await the founder-gated Rule 30g re-translation + `tts:generate` ship step.
- **current_loop_acts_as_dipole (EYE ran 2026-07-09, run `20260710-001743`):** **38/38 deterministic checks PASS — physically correct, in far better shape than biot** (no CRITICAL/MAJOR, no broken states, no wrong-baseline pin; STATE_7's compass oscillation is the best-executed state in either concept). eye-walker found only **2 MODERATE legibility gaps, both pre-existing, neither blocking**: (1) `loop_dipole_couple_simultaneous_reveal` — STATE_6 shows external B + force couple + τ all at t=0 with no cause→effect beat (Rule 32a); the `force_vectors`/`mu_vector`/`tau_vector` extras have no `reveal_at_ms` hook (owner `renderer_primitives`); (2) `loop_dipole_micro_claim_without_micro_visual` — STATE_8 narrates the atomic origin of magnetism but reuses the STATE_2/3 macro-loop frame pixel-for-pixel (Rule 32c/33; owner ambiguous — a JSON `field_3d_config` distinct-visual fix, or a renderer micro/atom primitive). Both filed to `engine_bug_queue` (OPEN) via `src/scripts/_seed_engine_bug_queue_current_loop_defects.ts`. current_loop needs **no engine spec of biot's weight** — the 2 rows are the whole to-do, and it is closer to ship-ready (still not `visual:approve`'d; founder eyes on STATE_4 aha + the 2 gaps first).

## Tracked rows
Filed to `engine_bug_queue` via `src/scripts/_seed_engine_bug_queue_biot_engine_defects.ts` (status OPEN) when Supabase connectivity recovers — see that script.
