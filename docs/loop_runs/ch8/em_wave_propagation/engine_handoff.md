# em_wave_propagation — ENGINE HANDOFF (E2, per-state add-ons)

**Status: COMPLETE.** All build-target add-ons for `scenario_type: "em_wave_propagation"` are
built, verified, and NOT committed (loop commits). Did NOT hit the ceiling. Rollback point for E2
was `961fe87` (E1 core).

## What E2 added (all 7 targets, in state order)

1. **`emw_relay` (S2)** — zoom-band highlight + green E-kink glow + blue B-loop torus (BOTH always
   drawn, opacity floor 0.35 — only the GLOW highlight alternates) + chevron `»` marching +x +
   "change feeds change" label. Honors the §3.2 hard constraint (never a sequential
   appear/disappear that would plant the 90° belief). Self-contained marching glyph (see
   Simplification #1 below).
2. **`emw_triad` + RHR sweep (S4)** — x̂ (amber travel axis) + E field arrow (ŷ) + B field arrow (ẑ)
   that FLIP on the scripted trough (`(−Ê)×(−B̂)=Ê×B̂`, thrust STILL +x) + faint sweep-arc guide +
   moving sweep head (E into B) + E×B thrust arrow (+x, grows on the thrust cue) + billboarded
   x̂/ŷ/ẑ/E×B labels. **The ONE camera round-trip in the concept**: `animateCameraTo([8.0,0.6,0.9])`
   (near axis-on: E vertical, B horizontal) at `camera_out_at_ms`, restore the captured home pose at
   `camera_back_at_ms`, phase-tracked (`window.PM_emwCamPhase`) so it issues once per threshold and
   settles deterministically under a freeze pin.
3. **`emw_ghostb` + `emw_cursor` (S5)** — red desaturated ghost B train (Line, phase-shifted −π/2
   from the real in-phase B) + DOM `✗ expected: B peaks 90° after E` tag (clone of the dc S5
   pattern) + fixed-x phase-cursor plane with E/B sample dots + twin DOM readout (E V/m green, B µT
   blue) that peak/zero TOGETHER (verified E=−103, B=−0.34 same sign).
4. **`emw_gates` + stopwatch + two-line dock (S6)** — gate A/B bars (D = 6.00 m line between) with a
   tick flash at their cue times + Δt stopwatch in the HUD (climbs 0.0→20.0 ns, HOLDS) + the ONE
   two-line `emw_formula` surface: `v = D/Δt = 3.0×10⁸ m/s` docks first, `c = 1/√(μ₀ε₀) =
   2.998×10⁸ m/s` resolves as line 2 in the SAME surface, then ` ✓ MATCH` (skeleton §10h honored
   exactly — one two-line surface, MATCH on line-2's right edge). Cambria-Math serif confirmed.
5. **`emw_tanks` (S8)** — twin DOM fill bars (green u_E, blue u_B) + numeric. **FL4 met**: u_B uses
   the EXACT `c = 1/√(μ₀ε₀)` so both chains render the IDENTICAL string (smoke: uE="6.31×10⁻⁸"
   uB="6.31×10⁻⁸" identical=true; at a crest = 6.38×10⁻⁸).
6. **`emw_slab` (S10)** — translucent slab (scene x∈[−1.6,+1.6] = physics [3,7] m) slides down into
   place; BOTH trains stay drawn and bunch inside (F2/FL5) via the CUMULATIVE piecewise phase
   (`emwPhaseAt`, §6e — no boundary jump; `nEff` ramps 1→n smoothly in time); crest-counter chip
   `ν = 100 MHz · same both sides`; live n/v = c/n labels; the `emw_n_row` seize (E1) drives live
   bunching.
7. **S9 `formula_chain` + S7 ratio HUD** — S9 progressive chain-link dock (given `E_y`, three recall
   links direction ẑ / same phase / amplitude E₀/c, then assembled `B_z = (E₀/c)·sin(kx − ωt)`);
   S7 HUD lines `E₀`, `B₀ = 0.40 µT` (live), `E₀/B₀ = 3.0×10⁸` (frozen chip).

## Files touched
- `src/lib/renderers/field_3d_renderer.ts` (+~400 lines, all under the `emw_`/`buildEmWavePropagation`
  /`updateEmWavePropagationFrame`/`applyEmWavePropagationState`/`emwBuildDom`/`emwApplyWidgetVis`
  /`EMW_GLOW_ELS` surface — zero sibling-scenario lines touched, contamination grep = 0).
- `src/lib/validators/visual/deriveStateMeta.ts` (+11 lines — new one-shot cue pins in the emw
  `maxRevealForField3dState` push block).

## Verify chain (E2)
- `check:renderer-syntax` OK (field_3d 2220 KB) · `tsc --noEmit` 0 errors · `validate:concepts`
  125 PASS 0 FAIL (warning profile unchanged from E1).
- Throwaway Playwright smoke (deleted) across S2/S4/S5/S6/S7/S8/S9/S10 synthetic states: **0
  console/SIM errors**, every add-on overlay paints, FL4 identical-string verified, frames opened +
  read: `STATE_4_t3` (axis-on cross), `STATE_6_t3` (two-line dock + MATCH + Δt HUD), `STATE_10_t2`
  (both trains bunched in slab), `STATE_2_t1` (relay kink+loop), `STATE_5_t1` (ghost + twin
  readout), `STATE_9_t3` (assembled B_z).
- Regression pair (magnetisation_and_intensity, bar_magnet_as_dipole): re-seeded + THE EYE — SEE
  the E2 report / engine log for the measured percentages.
- Clock guard: **NO** `__pmSteps`/`dtStep`/integrator touched — no fleet sweep required.

## Simplifications / interpretive calls (flagged)
1. **S2 relay decoupled from the pulse packet.** The core pulse (period ~8.2 s) has transited by the
   relay's narration beat (~12 s), so the relay is a SELF-CONTAINED marching hand-off glyph over the
   near-axis region rather than riding the actual pulse-packet centroid. The mechanism teaching
   (change feeds change, both fields present) is intact and the hard constraint honored. A future
   increment could sync it to a slowed single-pulse if the founder wants exact front-tracking.
2. **DOM-only glow focals (ratio · tanks · formula) intentionally ABSENT from `EMW_GLOW_ELS`** —
   they carry their own DOM prominence; mapping them would set `anyScene=true` with no scene object
   to brighten (scar #33 total-dim). Absent ⇒ clean no-op.
3. **S9 recall glow-walk is minimal** — the formula chain docks progressively (the primary S9
   mechanism); the sequential triad→cursor→ratio-chip GLOW walk is left to the state's `glow_focal`
   + show flags rather than an in-frame timed brighten sequence. Adequate for the teaching; a timed
   recall-glow walk is a possible polish item.

## Next increment (if any)
None required for the engine. Remaining work is CONTENT-side (json_author authors the concept JSON
against the contract in the E2 report), then quality_auditor + Checkpoint B (THE EYE on the real
concept once the JSON lands — the frozen-frame checks for S3/S5/S8 wrong-expectation cues, the S6
overlay collisions, and n=2.0 crest legibility per physics_block flags).
