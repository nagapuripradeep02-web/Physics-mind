# founder-proxy — Checkpoint C (handover gate) — ac_voltage_resistor (2026-07-22)

**Trial:** CHAPTER_LOOP Stage 1b — Ch.7 concept 1/8 — Checkpoint C — handover seal
**Prior verdicts:** Checkpoint A `DESIGN_OK` (1 DESIGN_FIX cycle, F1-F4) · quality-auditor PASS ·
Checkpoint B `APPROVE` + 2 ride-along `FIX(engine)`

## 1 · VERDICT — SEALED

Every A/B finding that claimed to land actually landed — diffed all four Checkpoint-A fixes against
the built renderer at the cited lines (not the reports' say-so), each present, correct, behaviorally
corroborated. Checkpoint B's adjudication of the quality-auditor/eye-walker disagreement is sound —
independently re-opened the single most-contested frame (S8's fold pane) and it decisively confirms B,
not eye-walker. The two ride-along engine findings (B1, B2) are real, correctly diagnosed, correctly
owned, correctly filed as files — their being unfixed at seal time is the expected ride-along state
(§3b runs them after this commit, before `phasors`). Both new scar rows schema-valid, non-duplicate.
`createTubeLine` fix (`d26d139`) is closed, independently-verified, not re-litigated. Zero silent
skips, zero unresolved blocking findings, zero physics doubt.

## 2 · Diff of Checkpoint-A F1-F4 (verified in the BUILT artifact)

| Fix | Lines | Found | Verdict |
|---|---|---|---|
| F1 drag-seize + S6 lockstep | :24390-393/:24676/:24756-759 | `ev.isTrusted`-gated drag flags; S6 sweep gated on `!PM_acrVdcDragged`; thumb+label lockstep. Corroborated: manifest `sliderDrags` shows S6 held at 17.5 after trusted drag (moved:true, reverted:false); same S1/S2/explore. | LANDED |
| F2 S7 squaring vs S8 fold | :24514/:24534/:24628-31 | S7: `iRaw²` at full progress, i-axis rescaled to `im²`. S8: 180° point-reflection through pAvg. Different quantity, different operation. | LANDED |
| F3 heater glow exemption | :24726-30/:24842 | Emissive pure function of `p/P_REF`; glow pass explicitly skips `acr_heater`/`acr_twin_heater`. | LANDED |
| F4 dedicated Cambria panel | :24346/:24350 | `#acr_formula`/`#acr_derivation` Cambria Math serif; generic `#formula_overlay` unused on this path. Visually confirmed in `STATE_8__dense_t04000.png`. | LANDED |

Agree with Checkpoint B: none of F1-F4 is a silent skip.

## 3 · Checkpoint-B adjudication soundness — independently re-opened the load-bearing frame

- **S8 fold — REFUTED eye-walker, confirmed with own eyes.** Dense-frame byte sizes alone falsify
  "empty": 29,563B(t0)→37,749→42,399→50,189B(t04000) — a static pane cannot gain 20KB. Opened the
  frames directly: t00000 shows a full sin² hump train in the magenta fold pane; t04000 shows humps
  folded flat to the ⟨p⟩ ½-level with the derivation chain revealed in Cambria-Math. Matches B's
  account exactly, opposite of eye-walker's.
- **S1 heater — REFUTED, code-backed.** Heater emissive is a pure function of `p`; `SET_TIME_FREEZE`
  snapshots `p` and the readout at the same absolute t, so no desync mechanism exists — eye-walker
  mismatched a frozen low-power frame against a peak-power dense frame.
- **S6 DC-twin — REFUTED for the live player; residual correctly captured as B1.** DC bead is the lone
  `dt`-accumulator (:24745); the `dt>0.2→dt=0` guard (:24686) zeroes it under THE EYE's time-pin steps
  while AC beads (pure `cosT`, :24707) render fine. Manifest timestamps consistent with B's measured
  live +26px/s drift.

None of eye-walker's 3 refuted findings were filed as scars (correct). B's adjudication is sound.

## 4 · Scar-candidate schema discipline

B1 (`field3d_dt_accumulated_motion_invisible_to_eye_timepin`, MODERATE/P2) and B2
(`field3d_rms_subscript_ascii_in_renderer_text_paths`, MINOR/P3): both `probe_type=js_eval`,
`row_type=incident`, non-NULL ARRAY literals, empty-but-not-NULL `fixed_in_files` (correct for OPEN
ride-alongs). All 9 `bug_class` names in this run's scar file cross-checked distinct — no collision.
Checkpoint-A directive (`field3d_new_scenario_engine_ask_precision_checklist`) correctly copied in,
action item discharged. B2's owner correction (json_author → engine) confirmed right: JSON
`formula_overlay` already Unicode (`Vᵣₘₛ`/`Iᵣₘₛ`, JSON :74-79); ASCII is renderer literals — saw
`V_rms = 7.07 V` on-screen in the t04000 HUD, so B2 is a genuine, still-unfixed, on-screen defect.

## 5 · `createTubeLine` fix (`d26d139`) — closed, not re-litigated

Confirmed commit exists, touches exactly 1 line of `field_3d_renderer.ts` + scar file + engine log,
null-guard live in the tree. Its own §3b verify chain (tsc/validate 125/125, runtime re-probe,
faraday_law_induction 27/27 + capacitance 44/44 zero-diff regression, clock-guard) logged and green.

## 6 · Carried forward to §3b (post-seal, before `phasors`)

- **B1** (P2, ride-along) → `peter_parker:renderer_primitives`: make S6 DC-bead drift a pure function
  of `PM_simTimeMs` (integrate piecewise-constant `I_dc` analytically; keep trusted-drag override).
- **B2** (P3, ride-along) → `peter_parker:renderer_primitives`: finish Unicode-rms sweep across 4
  renderer text paths; verify glyphs render (route through Cambria-Math if tofu); `createWideLabelSprite`
  for the meter so `Iᵣₘₛ` isn't truncated.

Neither compromises physics or teaching; both are verifiability/cosmetic.

## 7 · Founder-packet sentence

**Yes.** `ac_voltage_resistor` teaches AC-on-a-resistor completely and correctly for both the CBSE/JEE
core and the international extended/advanced rings — a nine-state arc from "AC swings both ways"
through the rms recipe to the exact ⟨sin²⟩=½ geometry, physics numerically exact end-to-end, 39/39 on
THE EYE, zero collisions/flags/console errors on live drive, drag-seize working, explore alive and
core-only — with exactly two named renderer-polish deltas outstanding (B1, B2), both filed as
ride-alongs landing before concept 2, neither touching the lesson's correctness or legibility; the gap
between "sealed" and "founder-perfect" is those two polish items and nothing else.

## 8 · Key images

1. `STATE_8__dense_t00000.png` — fold pane rendering full sin² hump train (eye-walker's "EMPTY" is false).
2. `STATE_8__dense_t04000.png` — humps folded flat to ½-level + Cambria-Math derivation chain.
3. `.founder_runs/ac_voltage_resistor/2026-07-22T18-23-01-527Z/manifest.json` — 0 collisions/flags/console errors, drag-seize proof.
4. `STATE_8__dense_t04000.png` HUD — `V_rms = 7.07 V` ASCII, the on-screen face of B2.

**Routing summary:** SEALED. Commit concept authoring artifacts. B1/B2 dispatch under §3b after this
seal commit, before `phasors` starts. No FIX, no ESCALATE.
