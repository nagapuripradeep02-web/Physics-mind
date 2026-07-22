# founder-proxy — Checkpoint B (build gate) — ac_voltage_resistor (2026-07-22)

**Trial:** CHAPTER_LOOP Stage 1b — Ch.7 concept 1/8 — Checkpoint B — fix cycle 0 (first build review)

## 1 · VERDICT — APPROVE (authoring sign-off only) + 2 ride-along FIX(engine)

Strong, physics-correct, legible build; highest-value version achievable within loop authority once
two renderer ride-along fixes land. **The dispatch's central question — quality-auditor vs eye-walker's
disagreement over S8 — resolves decisively against eye-walker and for quality-auditor**: founder-proxy
opened the actual frame files itself (not averaging the two reports) and all three of eye-walker's
findings are refuted by fresh evidence. APPROVE is authoring sign-off only (Rule 17 untouched — no
shipper/visual:approve/TTS/deploy triggered). Zero authoring P1s, zero unresolved Pass-1 recurrences,
zero blocking engine findings.

## 2 · The adjudication (opened frames, did not average the two reports)

- **S8 fold — eye-walker's CRITICAL "fold pane renders EMPTY" is FALSE.** Opened
  `STATE_8__dense_t00000/t02000/t04000` + contact sheet directly. The magenta "p vs t — folding to ½"
  pane renders a full sin² hump train at t0, half-collapsed humps at t02000, and a flat line exactly on
  the ⟨p⟩ ½-level from t04000 onward — a correct, animated point-symmetry fold, with the derivation
  chain revealing progressively. Dense-frame file sizes alone flagged this (t0=29.5KB growing to
  50KB — impossible for a static pane). quality-auditor's read was correct. Checkpoint-A item ② (S7
  squaring vs S8 fold genuinely distinct) is SATISFIED: S7 squares current (amber i² humps, meter
  "2.00 A²"), S8 folds power (magenta p pane, fold-to-flat-½) — different quantity/pane/colour/operation.
- **S1 heater — eye-walker's MAJOR "frozen bright-white vs dense dim at same p" desync is FALSE.**
  Frozen (v=−1.5V, p=0.4W) shows a DIM olive heater; dense t0 (p=0.5W) and t02000 (p=0.4W) show the SAME
  dim heater — mutually consistent. Contact sheet shows the heater cycling bright-white at power peaks
  and dim at zero-crossings — a clean 2f modulation. eye-walker mismatched the frozen low-power frame
  against a peak-power dense frame. Checkpoint-A item ③ CONFIRMED working.
- **S6 DC-twin — eye-walker's MODERATE "pixel-static, no drift cue" is FALSE for the live player.** In
  the LIVE-driven `founder_drive` frames the DC bead cores translate +26 px/s rightward — a steady
  one-directional drift, exactly the intended "DC beads drift, AC beads rock" contrast. In THE EYE
  frames the same beads jitter ±1-2px with no net drift. Root cause (code, not opinion): the DC bead
  drift is an incremental `dt`-accumulator (`field_3d_renderer.ts:24745`), and the
  `dt = t − lastT; if (dt>0.2) dt=0` guard at `:24686` zeroes THE EYE's ~1s-per-frame time-pin stepping
  — freezes in SET_TIME_FREEZE capture, drifts under real elapsed time. Every other element (AC beads
  `:24707`, heater `:24727`, E_dc) is a pure function of absolute `t`; the DC bead is the lone exception.
  Confirms Checkpoint-A item ① (S6 V_dc thumb/label lockstep + drag-seize): founder_drive drag held,
  S6 dense t06000 shows scripted wind-down moved the thumb to 7.1V in lockstep.

**Checkpoint-B verify item (auditor's handoff) — SATISFIED.** Playwright probe of the served site
opened the ⚙ Widgets panel: 17 rows, teacher-readable auto-derived labels, Save/Defaults present,
hover-ping present, 0 console errors.

## 3 · Findings — both ride-along FIX(engine), owner `peter_parker:renderer_primitives`

**B1 — P2 — ride-along — DC-twin bead drift is a `dt`-accumulator, invisible to THE EYE.**
`field_3d_renderer.ts:24745` `PM_acrTwinBeadAccum += ACR_TWIN_DRIFT_K * I_dc * dt`; the `dt>0.2→dt=0`
guard at `:24686` zeroes THE EYE's time-pin steps. Live proof it drifts: founder_drive DC bead
x=682.0→710.0 (+26px/s). Frozen proof it's blind in-gate: dense t00000/t06000/t18000 beads static at
x≈638. Why P2: directly produced this reviewer contradiction, and leaves THE EYE permanently blind to
a future regression of the DC drift. Why ride-along not blocking: the live player drifts correctly, so
S6's core claim is supported on the teacher-facing screen. Fix direction: make the DC bead phase a
pure function of absolute `PM_simTimeMs` like the AC beads (integrate the piecewise-constant I_dc
analytically; keep trusted-drag override for interactivity).

**B2 — P3 — ride-along — Rule 34c ASCII `V_rms`/`I_rms` across 4 renderer text paths + meter-sprite
truncation.** Concept JSON `formula_overlay` correctly uses Unicode `Vᵣₘₛ`/`Iᵣₘₛ`
(`ac_voltage_resistor.json:74-79`), but the renderer hardcodes ASCII on: HUD innerHTML
(`:24812-24813`), canvas graph labels via `ctx.fillText` (`:24575`,`:24589`), meter sprite (`:24793`),
S7/S8 derivation chain (`:24477-24478`). Owner corrected from json_author (auditor's original routing)
to the engine — the JSON is already Unicode; the ASCII strings are renderer literals. Sub-note: the S7
meter sprite reads "2.00 A² → I_" with "rms" apparently truncated — likely needs `createWideLabelSprite`
sizing in addition to the Unicode swap. Fix caveat: verify `ᵣₘₛ` glyphs (U+1D63/U+2098/U+209B) render
in the monospace HUD + 9px canvas-graph fonts before swapping (may tofu) — route through Cambria-Math
serif if so, as the formula panel already does.

## 4 · Pass-1 scar recurrence check

`bulb_glow_not_modulating` (FIXED) — no recurrence. `ghost_compare_cause_invisible_slider_frozen`
(OPEN) — no recurrence (fix landed). `field3d_formula_overlay_generic_not_cambria_math` (OPEN) — no
recurrence. `field3d_sliders_panel_top12_vs_fsbtn_top10` (OPEN) — no recurrence (0 overlayCollisions).
`field3d_createtubeline_undefined_field_lines_throws` (FIXED this loop) — no recurrence. 
`graph_marker_label_clipped`/`label_sprite_wide_string_clipped` (FIXED) — one possible minor
recurrence on the S7 meter sprite, folded into B2 as P3, not blocking.

## 5 · Per-state table (Pass-4)

Direct-frame-verified: S1, S6, S7, S8, S9 (+ live founder_drive S6). S2–S5 assessed from aggregate
gates (THE EYE 39/39, founder_drive 0 collisions/0 flags/0 console errors, auditor per-gate PASS,
eye-walker "OK" — its errors confined to S1/S6/S8). All 9 states: correct, order_ok, labels,
reads_sound_off, clearly_different all Y. Only non-blocking notes: S5/S6/S7 ASCII `I_rms` (P3, →B2);
S6 DC drift invisible to THE EYE (P2, →B1). S9 explore confirmed core-ring only (v/i/p, "i=v/R", no
rms — Rule 38b), all 3 sliders live (Rule 37 continuous run).

## 6 · Candidate scar rows

Filed verbatim to `docs/loop_runs/ch7/_engine/scar_candidates.sql` (schema-checked: probe_type=js_eval,
row_type=incident, severity∈{MODERATE,MINOR}, ARRAY literals non-NULL, both bug_class names new).

## 7 · Key images for the founder

1. `STATE_8__dense_t00000.png` — magenta fold pane rendering full sin² humps at t0 (refutes eye-walker's "EMPTY" CRITICAL).
2. `STATE_8__dense_t04000.png` — fold settled to flat ½-level + full derivation revealed.
3. `STATE_1__contact_sheet.png` — heater cycles bright-white@peaks/dim@zero-crossings, frozen matches dense low-power (refutes S1 desync).
4. `.founder_runs/ac_voltage_resistor/2026-07-22T18-23-01-527Z/S6_t0.png` + `S6_mid.png` — live DC-bead drift +26px/s (refutes S6 "pixel-static").
5. `STATE_9__frozen.png` — explore is core-only (Rule 38b), all sliders live (Rule 37).

## Routing summary

APPROVE (authoring sign-off; loop commits to chapter branch, proceeds toward Checkpoint C). Two
ride-along FIX(engine) → `peter_parker:renderer_primitives` (B1 P2, B2 P3), dispatched by the loop
under the §3b verify chain to run AFTER the Checkpoint-C seal commit, BEFORE `phasors` starts. Zero
blocking, zero authoring P1s, zero unresolved recurrences.

**Highest-value version achievable within loop authority?** Yes — the sim teaches AC-on-a-resistor
completely and correctly for both CBSE/JEE and the international rings, with an elegant twin-compare
(S6) and point-symmetry fold (S8); the only gap between "approved" and "founder-perfect" is the two
renderer polish items (make the DC drift THE-EYE-verifiable, finish the Unicode-rms sweep across the
renderer's own text paths), both landing as ride-alongs before concept 2.
