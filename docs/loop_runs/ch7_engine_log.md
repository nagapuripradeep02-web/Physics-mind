# Ch.7 engine-loop log

Per docs/CHAPTER_LOOP.md §3b commit + audit discipline. Founder reviews via
`git log --grep=engine-loop -p` + this file.

---

## Stage 1a — particle_field chrome-collision shakedown (2026-07-22)

**Rollback point (pre-dispatch HEAD):** `7a2fee1ab958eab348f06bb63a60ae14734415a2`

**Finding:** `docs/loop_runs/stage0_calibration/CALIBRATION_REPORT.md` §4 — the OPEN scar
`field3d_sliders_panel_top12_vs_fsbtn_top10` names a Rule-34d class (top-anchored DOM overlay
collides with the review chrome) that field_3d was fixed for but `particle_field_renderer.ts:727`
(`#pm-sliders`, `top:10px;right:10px`) was never migrated. Affects all 13 shipped particle_field
concepts.

**Owner dispatched:** `peter_parker:renderer_primitives`, via a `general-purpose` stand-in carrying
`.claude/agents/renderer-primitives.md` as its operating spec — the native `renderer-primitives`
dispatch type is not registered in this session (roster gap, not a protocol change; founder confirmed
the stand-in for this run). Two dispatch attempts: the first was interrupted mid-flight by the founder
(who wanted the founder-proxy decision explained in plain language first) and left an uncommitted
hardcoded `top:52px` edit + 4 scar blocks in the working tree; the re-dispatch below found, reconciled,
and superseded that stray edit before landing the founder-approved fix shape.

**Founder decision (before re-dispatch):** reject the hardcoded field_3d-parity shape. THE EYE
screenshots the raw sim page (no chrome), so `#pm-sliders` sits inside the LOCKED baselines of all 13
particle_field concepts, and the trial forbids `visual:approve` (no in-loop re-lock). Chosen fix:
**chrome-aware conditional** — shift to `top:52px` only when the review chrome is detected present,
else stay `top:10px`, so raw-capture baselines stay byte-identical.

**Fix landed:** `src/lib/renderers/particle_field_renderer.ts` only.
- New `pfInReviewChrome()` helper (before `buildOverlayUI`): `window.parent !== window` AND the
  parent document exposes `#fsTopControls`/`#fsBtn` → true only inside the real review tool
  (same-origin parent); false in THE EYE's bare-wrapper capture (no chrome, or cross-origin).
- `#pm-sliders` cssText: `top:10px` (literal) → `top: pfInReviewChrome() ? '52px' : '10px'`.
- Other two `position:fixed` overlays (`#pm-caption`, `#pm-formula`) audited, NOT moved — no genuine
  chrome overlap (driver: 0 caption collisions across 5 states; formula is bottom-right, chrome is
  top-anchored only).

**Verify chain (§3b):**
1. `check:renderer-syntax` → PASS · `tsc --noEmit` → PASS · `validate:concepts` → PASS
   (124/124 atomic; pre-existing unrelated WARNs only).
2. Reseed + rebuild + drive `wheatstone_bridge`: chrome branch — collisions **8 → 0**, flags=0,
   consoleErrors=0. Raw branch — `visual:eyes -- wheatstone_bridge` **32/32, 0 diffs** vs locked
   baseline (proves the conditional's false-branch is a no-op under THE EYE).
3. Regression sample (particle_field): `visual:eyes -- ohms_law` **38/38, 0 diffs**.
4. Clock guard (Rule 36b): diff touches no `__pmSteps`/`dtStep`/`deltaTime`/integrator — full-fleet
   sweep not required.

**Scar candidates (files only, NOT applied):** `docs/loop_runs/ch7/_engine/scar_candidates.sql`
blocks (1)–(4) are from the interrupted first attempt (block 1's prevention_rule needs a founder edit
— it currently overstates a hardcode that was not what landed); block (5) is the authoritative record
for the fix that actually shipped (`particle_field_sliders_panel_top10_vs_reviewchrome`, status FIXED
in the candidate text, `concepts_affected` = all 13). Also logged but NOT fixed this dispatch (deferred,
own future findings): canvas-drawn HUD top-corner collisions (`pf_canvas_hud_top_corner_vs_review_chrome`,
invisible to the DOM-only driver probe), the caption max-width latent risk
(`pf_caption_maxwidth_68pct_can_reach_review_chrome`), and the tall-panel-vs-formula-overlay risk on
short viewports (`pf_tall_slider_panel_can_reach_formula_overlay_on_short_stage`).

**Commit:** see `git log --grep=engine-loop -p` for `fix(engine-loop): particle_field_sliders_panel_top10_vs_reviewchrome [peter_parker:renderer_primitives]`.

**Outcome:** Stage 1a shakedown PASSED — dispatch + verify chain + rollback-readiness + commit
discipline all exercised successfully on a known defect before Stage 1b's novel content run.

---

## Stage 1b — NEW field_3d scenario_type `ac_resistor` (2026-07-22)

**Rollback point (pre-dispatch HEAD):** `06b2c27`

**Trigger:** the founder-proxy-approved (Checkpoint A: DESIGN_OK after 1 fix cycle) architect skeleton
for `ac_voltage_resistor` (`docs/loop_runs/ch7/ac_voltage_resistor/skeleton.md`) declared a Class-B
triage in §0b — the concept needs a brand-new `field_3d` scenario type that does not exist, and
`json_author` may not start until it lands. `physics_block.md` supplied the exact functional forms.

**Owner dispatched:** `peter_parker:renderer_primitives`, via a `general-purpose` stand-in carrying
`.claude/agents/renderer-primitives.md` as its operating spec (native dispatch type not registered
this session, per the founder-approved workaround from Stage 1a).

**Built:** `scenario_type: "ac_resistor"` — sine source + oscillating bead flow (new pattern, not the
existing one-way stream) + p(t)-driven heater emissive (exempted from `applyGlowEmphasis`, extended
past the FIXED `bulb_glow_not_modulating` pattern to cover heater-as-glow_focal); dual-strip scope pane
(v/i overlay + p(t) with its own zero baseline); sampling-cursor + product-walk cues (S2/S4); an
averaging meter re-tasked as the S7 running-mean/rms instrument; an energy counter; a twin DC-circuit
compare (S6, `R_dc` hard-locked to `R`, scripted `V_dc` sweep with DOM-thumb+label lockstep, a reusable
drag-seize guard applied to `f_demo`/`R`/`V_dc`); two DISTINCT curve morphs (S7 genuine squaring
`y→y²`, S8 genuine point-symmetry fold — not conflated); a dedicated Cambria-Math formula/derivation
panel (never the generic `#formula_overlay`).

**Files touched:** `src/lib/renderers/field_3d_renderer.ts` (+789 net lines: scenario union member,
build/apply/animate/glow functions ~L24103–24856, scene/state/animate dispatch hooks, `#sliders`
exclusion, generic-formula-overlay + generic-legend suppression) + `src/lib/validators/visual/deriveStateMeta.ts`
(+71 net lines: `F3D_REVEAL_KEYS` registration, per-mode reveal-pin candidates for all 9 modes,
motion/hold expectation branches) — co-registered in the same change per the mandatory field3d
scenario checklist.

**Verify chain (§3b):**
1. `check:renderer-syntax` → PASS · `tsc --noEmit` → PASS · `validate:concepts` → PASS (124/124 atomic,
   identical warning profile to pre-change — no fleet regression).
2. Regression sample: `faraday_law_induction` reseed + `visual:eyes` → **27/27, 0 diffs**;
   `capacitance` reseed + `visual:eyes` → **44/44, 0 diffs** — both byte-identical to locked baselines.
3. Clock guard (Rule 36b): `__pmSteps`/`dtStep`/the shared fixed-step accumulator untouched; the new
   scenario's phase is a local scoped accumulator mirroring the existing `ac_generator` pattern
   (needed because `f_demo`/`V_dc` are live-draggable) — no full-fleet sweep required.
4. Standalone numeric verification (scratchpad script, not committed) reproduced every locked number
   from `physics_block.md` exactly: defaults `vm=10.0V, R=5.0Ω, f_demo=0.25Hz` at `t=1.0s` →
   `v=10.0000, i=2.0000, p=20.0000`; `t=3.0s` (−)×(−) beat → `v=−10.0, i=−2.0, p=+20.0`;
   `p_peak=20.0, ⟨p⟩=10.0, Vrms=7.0711, Irms=1.4142`; S6 match voltage `=7.0711V` with `P_dc=10.0=⟨p⟩`;
   S7 settle `i²_running→2.0 A², Irms_running→1.4142A`; S8 point-symmetry identity holds exactly at 4
   sample τ; `E(t)` closed form matches numeric `dE/dt=p(t)` at 5 points, monotone over a full period.

**Three documented visual-fidelity simplifications (not physics/pedagogy compromises — flagged
explicitly in both the report and the code's own header comment):**
1. S2 sampling cursor renders as three cue-gated static markers (zero/mid/peak) rather than a literal
   scrubbing cursor across a scrolling window — numerically identical, materially less renderer risk.
2. S6 twin DC beads animate on the top wire only, not a full return loop — the drift-vs-rock contrast
   is fully legible on one wire.
3. The averaging/RMS meter is a simple arc+needle gauge, not a modeled instrument body — satisfies
   Rule 33d (live numeric + tracking needle) without decorative geometry.

**New scar candidates:** none — every checklist item was designed around proactively. One process note
surfaced: the state file referenced a scar `field3d_new_scenario_engine_ask_precision_checklist` as
already filed in `scar_candidates.sql`, but it is NOT actually in that file (founder-proxy's
Checkpoint-A cycle-0 report proposed it as SQL text in its own report markdown, but it was never
copied into the shared `scar_candidates.sql` file) — **orchestrator action item: copy it in before
chapter end**, since it is a real, well-formed candidate the founder should be able to rule on.

**JSON contract for `json_author` (the literal handoff — build the concept JSON against this):**

`physics_engine_config.variables`: `vm, R, f_demo, V_dc` as sliders (min/max/step/default/role per
`physics_block.md` §1) + derived keys `omega, theta, v, im, i, p, p_peak, p_avg, i_avg_cycle, Vrms,
Irms, E, i2_running, Irms_running, R_dc, I_dc, P_dc, E_dc`. Slider ranges read from
`config.slider_controls.vm/R/f_demo/V_dc` (renderer has physics_block-matching fallbacks if omitted).

Per-state `field_3d_config.states.STATE_N.ac_resistor` object — required keys: `mode` (one of
`ac_swings_both_ways | ohm_at_every_instant | both_halves_heat | power_never_negative |
zero_average | rms_dc_equivalent | square_mean_root | why_half | explore`), `controls: [...]` (live
rows), `static_readouts: [...]`, `show_graph_vi`/`show_graph_p` (bool), `show_twin_dc` (bool — DOM
twin readout only, 3D twin visibility is via `visible_elements`), `meter_mode` (`avg_i | rms_i2`),
`show_energy`/`show_rms_readout` (bool), `show_vm_peak_line`/`show_vrms_line`/`show_pavg_line` (bool),
`derivation` (bool — true routes to `#acr_derivation` chain-dock instead of `#acr_formula`),
`formula_text` (string, when `derivation=false`), plus optional `*_at_ms` cue fallbacks (renderer has
sensible per-mode defaults — see `deriveStateMeta.ts:1158`). Sibling `variable_overrides` per
`physics_block.md` §2's table on every state.

**`visible_elements` CLOSED enum — DEVIATES from the skeleton's §0a literal-guess strings; use
exactly:** `acr_source | acr_beads | acr_arrow | acr_heater | acr_meter | acr_twin_dc` (beads token
covers both wire tubes; graph/derivation/energy/readout DOM panels are controlled by the typed flags
above, not visible_elements). Teacher-script `glow` arrays use bare short keys: `source | beads |
arrow | heater | meter | twin_dc | v_trace | i_trace | p_strip | rms_line | energy_counter | formula`.

**Commit:** see `git log --grep=engine-loop -p` for
`feat(engine-loop): NEW field_3d scenario_type ac_resistor [peter_parker:renderer_primitives]`.

**Outcome:** Stage 1b engine delta PASSED — the largest build this trial has attempted (9-state new
scenario in a 37.6K-line shared renderer), full verify chain green, zero regression to the existing
fleet, physics numerically exact. `json_author` may now proceed.

---

## Stage 1b — engine fix: `createTubeLine` blank-scene trap (2026-07-22)

**Rollback point (pre-dispatch HEAD):** `6b97ede832dae8905b4875f09cd9cf04e91b3b54`

**Trigger:** `json_author` completed `ac_voltage_resistor.json` (9 states, `scenario_type: "ac_resistor"`)
and registered all 8 sites (tsc 0 errors, `validate:concepts` 125/125). Re-seeding and running
`npm run visual:eyes -- ac_voltage_resistor` came back **38 passed / 1 failed**, with a `SIM_READY
timeout` warning plus a `Sim-time poll stalled...reached 0/Nms` warning on every one of the 9 states —
the full per-check breakdown was lost to an orchestrator piping mistake (`| tail -80` on the original
foreground run), so a targeted Playwright probe was written to reproduce the failure directly against
the concept's assembled `sim_html`, isolating an exact stack trace: `TypeError: Cannot read properties
of undefined (reading 'opacity')` at `createTubeLine (field_3d_renderer.ts:2983)`, called from
`buildAcResistor` → `buildScenario`. Root cause: `createTubeLine()` — a shared Three.js tube-geometry
helper with **90 call sites fleet-wide** — unconditionally read `config.field_lines.opacity`;
`ac_voltage_resistor.json` correctly has no `field_lines` block (it is not a field-lines concept), so
the read threw synchronously and aborted the entire scene-construction/render loop before
`window.PM_simTimeMs` could ever be set or `SIM_READY` could post — explaining every symptom. This is
a KNOWN, previously-documented fleet trap: `capacitance`'s own scenario header comment (~L5327) already
calls it out ("the fleet's 'blank scene' trap"), but it was never filed as a tracked
`engine_bug_queue` incident (confirmed via `query_engine_bug_queue.ts --field3d --open` — zero
matches) — only an informal code comment + project memory note.

**Owner dispatched:** `peter_parker:renderer_primitives`, via the same `general-purpose` stand-in
pattern as Stage 1a/1b (native dispatch type unavailable this session).

**Decision (per CHAPTER_LOOP PRIME DIRECTIVE):** rejected the fast workaround (add a `field_lines: {}`
block to just `ac_voltage_resistor.json`) in favor of hardening the shared helper — the remaining 6
Ch.7 concepts reuse this same scope-pane/apparatus family (per the architect's own skeleton and the
open `field3d_new_scenario_engine_ask_precision_checklist` directive scar above) and would hit the
identical omission.

**Fix landed:** `src/lib/renderers/field_3d_renderer.ts` line 2983 ONE line, inside `createTubeLine`:
```
BEFORE: opacity: config.field_lines.opacity || 0.8
AFTER:  opacity: (config.field_lines && config.field_lines.opacity) || 0.8
```
No other file touched (concept JSON left as-is — correctly field_lines-less).

**Verify chain (§3b):**
1. `check:renderer-syntax` → PASS · `tsc --noEmit` → PASS · `validate:concepts` → PASS (125/125 atomic).
2. Runtime re-probe (the actual proof, since the original defect was invisible to tsc/validator):
   re-seeded `ac_voltage_resistor`'s `simulation_cache`, loaded the rebuilt `sim_html` headless — **0
   page errors**, `PM_simTimeMs` samples 300ms apart: `1376.0, 1696.0, 1984.0, 2304.0, 2608.0, 2928.0`
   (monotonic, climbing), `SET_STATE→STATE_2` did not throw (clock re-anchored to `752.0`, confirming
   the scene rebuilt live).
3. Regression sample (touches a 90-call-site shared helper, not just this scenario): `faraday_law_induction`
   reseed + `visual:eyes` → **27/27, 0 diffs**; `capacitance` (the scenario whose own header comment
   documents this exact trap — most exposed regression candidate) reseed + `visual:eyes` → **44/44, 0
   diffs**. Both byte-identical to locked baselines.
4. Clock guard (Rule 36b): `git diff --stat` confirms exactly 1 line changed in `createTubeLine`;
   `__pmSteps`/`dtStep`/no integrator touched — no fleet sweep required.
5. Exposure check: grepped all shipped concept JSONs — 36 of ~125 already declare `field_3d_config.field_lines`
   (every concept whose scenario calls `createTubeLine` for genuine field-lines purposes), so none were
   relying on the old crashing behavior; the fix only changes the previously-undefined→crash case to a
   graceful 0.8 fallback. `ac_voltage_resistor` was the only fleet concept missing the block.

**Scar candidate filed:** `docs/loop_runs/ch7/_engine/scar_candidates.sql`, new incident row
`field3d_createtubeline_undefined_field_lines_throws` (CRITICAL, status FIXED, `row_type: incident`) —
confirmed via a full `query_engine_bug_queue.ts` scan (not just `--field3d --open`) that no existing row
already covered this bug class.

**Commit:** see `git log --grep=engine-loop -p` for
`fix(engine-loop): field3d_createtubeline_undefined_field_lines_throws [peter_parker:renderer_primitives]`.

**Outcome:** Fix PASSED — `ac_voltage_resistor` is now render-live (clock advancing, `SIM_READY` firing,
state transitions working). `npm run visual:eyes -- ac_voltage_resistor` must be re-run clean (without
truncating output) before `quality-auditor` ∥ `eye-walker` dispatch, to confirm 39/39 and (separately)
identify which single check was the original "1 failed" for the record.

(Re-run confirmed clean: 39/39, 0 failed. quality-auditor PASS ∥ eye-walker FINDINGS(3) dispatched next
— see Checkpoint B/C reports under `docs/loop_runs/ch7/ac_voltage_resistor/` for the reviewer
disagreement and its resolution. `ac_voltage_resistor` SEALED and committed as `72910d1`.)

---

## Stage 1b — ride-along engine fix B1: DC-twin drift made pure-`t` (2026-07-22)

**Rollback point (pre-dispatch HEAD):** `72910d1a131720593649bbff4acb41da53b0c79a`

**Trigger:** founder-proxy Checkpoint B (`ac_voltage_resistor`), independently re-confirmed at
Checkpoint C. While adjudicating a quality-auditor/eye-walker disagreement over S8's fold pane,
founder-proxy opened the S6 frames directly and found the DC-twin bead drift — real and visible
(~26 px/s) in the live `founder_drive` dump — pixel-static across every THE-EYE frame. Root cause: the
drift was computed via an incremental per-frame accumulator (`PM_acrTwinBeadAccum += K*I_dc*dt`,
`field_3d_renderer.ts:24745`), and a `dt>0.2→dt=0` guard (`:24686`) zeroes it under THE EYE's
`SET_TIME_FREEZE` pin (which jumps ~1000ms between captured frames). Live-correct, gate-invisible —
ride-along per Checkpoint B (does not contradict the concept's core teaching claim on the live screen),
filed as `field3d_dt_accumulated_motion_invisible_to_eye_timepin` (MODERATE).

**Owner dispatched:** `peter_parker:renderer_primitives`, `general-purpose` stand-in (established
pattern this run).

**Fix landed:** `src/lib/renderers/field_3d_renderer.ts` only (+69/-4 lines, scoped entirely to the
`ac_resistor` scenario's own S6 twin-drift code). Two new pure-`t` helpers — `acrRampIntegral` (the
closed-form antiderivative of the existing `capRamp` cubic smoothstep, mirroring its own "pure fn of
t" contract one level up) and `acrTwinScriptedDist` (divides that integral by `R_dc`, scaled by the
existing `ACR_TWIN_DRIFT_K` pacing constant) — replace the accumulator. While neither `V_dc` nor `R`
has been dragged this state-visit, distance is the exact closed-form integral of the scripted
`V_dc(τ)/R` profile, reconstructible at any pinned `t` with zero per-frame history. The instant either
control is dragged, a `(segment-start t, distance-at-start, rate)` triple is baselined once (continuous
with the closed form at the drag instant) and only re-baselined on a further rate change — a genuine
discrete history event THE EYE never visits (it never drags). `window.PM_acrTwinDist` now exposes the
computed value each frame, matching the existing `window.PM_acr*` convention.

**Verify chain (§3b):**
1. `check:renderer-syntax` → PASS · `tsc --noEmit` → PASS · `validate:concepts` → PASS (125/125, no new
   warnings).
2. Runtime proof (the actual fix, not just tsc): pinned STATE_6 at two different absolute timestamps —
   distinct `PM_acrTwinDist` values (`0.594576…` at t=3000ms, `1.053555` at t=6000ms). **Determinism/
   rewind proof:** re-pinning back to t=3000ms after visiting t=6000ms reproduced the exact same value
   (diff=0) — a running accumulator cannot rewind; a pure function of `t` can, which is the actual bug
   fix. An independent from-scratch reimplementation of the closed form (written separately, never
   calling renderer code) matched the renderer's live value at both instants to <1e-6. F1 preservation:
   a real trusted drag on `#acr_V_dc_slider` (9.24V→8.4V) then advancing the pin 600ms gave an implied
   drift rate matching `K·(8.4/5)` exactly — the drag-seize/lockstep gating from Checkpoint A's F1 fix
   is untouched.
3. `visual:eyes -- ac_voltage_resistor` → **39/39, 0 failed** (no locked baseline yet — H2 correctly
   "Skipped"). Regression sample: `visual:eyes -- faraday_law_induction` → **27/27, 0 diffs** vs locked
   baseline.
4. Clock guard (Rule 36b): diff confined to `updateAcResistorFrame`'s local S6 block + 2 adjacent
   state-entry-reset sites; `__pmSteps`/`dtStep`/the shared fixed-step accumulator untouched. Full fleet
   sweep NOT warranted — `ac_resistor` is used by exactly one shipped concept, and the edit is scoped
   entirely to that scenario's own local drift math.

**Scar status updated:** `field3d_dt_accumulated_motion_invisible_to_eye_timepin` in
`scar_candidates.sql`: `OPEN → FIXED`, `fixed_in_files` populated, documentation header added recording
the before/after + all 4 verify proofs above.

**Commit:** see `git log --grep=engine-loop -p` for
`fix(engine-loop): field3d_dt_accumulated_motion_invisible_to_eye_timepin [peter_parker:renderer_primitives]`.

**Outcome:** Fix PASSED. B2 (ASCII rms Unicode sweep) dispatches next, sequentially (same file), before
`phasors` starts.
