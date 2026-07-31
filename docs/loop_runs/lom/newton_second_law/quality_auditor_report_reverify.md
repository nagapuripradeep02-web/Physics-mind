# QUALITY_AUDITOR RE-AUDIT — newton_second_law (Laws of Motion, Class 11 — concept 2/3)

Worktree C:\Tutor\physics-mind-lom-b (branch feat/lom-b). CHAPTER_LOOP Amendment 6 (no founder-proxy).
FULL re-audit — the prior PASS is stale because BOTH the content (physics_block REVISION 2, uniform
x75 force+mass rescale) AND the engine (commit 3a576ea, nlbBodyLaneZ two-body lane offset) changed
after it. Report-only: only this report written; no DB write. Evidence is machine-extracted (grep /
node / renderer source / THE EYE PNGs), pasted verbatim — not recalled.

Frame dump audited: .visual_runs/newton_second_law/20260725-212557/ (post-rescale, post-reseed).

## Consumed (orchestrator-supplied, not re-run)
- npx tsc --noEmit -> 0 errors.
- npm run validate:concepts -> 127 PASS / 0 FAIL (newton_second_law PASSES).
- cache:clear:scoped + re-seed via _seed_newton_second_law_cache.ts (2,268,319 chars).
- npm run visual:eyes -- newton_second_law -> 19 deterministic checks / 19 passed / 0 failed / 0.00.

## VERDICT: FAIL

Route to: alex:json_author  [reason: config-rescale-incomplete — the x75 rescale was written to
physics_engine_config.variables but NOT to field_3d_config.slider_controls, the block the field_3d
renderer actually reads to build the sliders. Maps to the silent-failure slider-body scale-mismatch
class (session 30.7 bug-2 lineage), json_author-owned.]

One blocking defect. It is NOT a regression of either thing this session set out to fix — both of
those reproduced correctly (see Gate 4). It is a NEW defect the x75 rescale introduced, which the
prior audit could not have seen (the rescale post-dates it).

## THE BLOCKER — slider ranges left at pre-rescale scale (Gate 4 / Gate 3e / Bug-1 slider-body class)

Machine evidence (node dump of the shipped JSON):

  field_3d_config.slider_controls  (what the renderer reads):
    m  {min:0.5, max:5, step:0.5, default:2}
    m2 {min:0.5, max:5, step:0.5, default:2}
    F  {min:-2,  max:2, step:0.1, default:0}
    v0 {min:-2,  max:2, step:0.5, default:0}

  physics_engine_config.variables  (rescaled x75, DOC-ONLY — renderer does NOT read this for sliders):
    m  {min:50, max:300, step:10, default:150}
    m2 {min:50, max:300, step:10, default:150}
    F  {min:-40, max:40, step:2,  default:0}

  per-state bodies (rescaled x75, ARE what the engine builds):
    STATE_1 m[150]     F[15]     cv[]
    STATE_2 m[75,150]  F[15,15]  cv[m2]
    STATE_3 m[150,150] F[15,30]  cv[]
    STATE_4 m[150]     F[0]      cv[m,F,v0]

Renderer proof (src/lib/renderers/field_3d_renderer.ts):
- nlbSc(token) L30402-30416 reads (config.slider_controls || {})[token] — slider min/max/step/default
  come from field_3d_config.slider_controls, i.e. the OLD 0.5-5 kg / -2..2 N scale.
  physics_engine_config.variables is never consulted for the widgets.
- nlbBuildSliderRows() L30436-30451 emits the range-input min/max/value from nlbSc.
- On state entry the value is synced from the BUILT body mass via nlbSliderValueFromEngine (returns
  bB.m = 150) -> nlbSyncSliderRow L30562 sets el.value = 150 on an input whose max is 5, so the
  browser CLAMPS the thumb to the rail while the numeric span prints the true 150.0.
- Drag path nlbWireSlider -> nlbApplyParam L30500-30508: a trusted drag emits a value inside the input
  own [0.5,5] (m/m2) or [-2,2] (F) band and writes it straight onto bB.m / tg.F_applied.

Visible in THE EYE (this run, not recalled):
- STATE_4__dense_t00000.png: HUD m1 = 150.0 kg with the thumb pinned hard at the FAR-RIGHT rail;
  F = -20.0 N with the thumb pinned hard at the FAR-LEFT rail (idle_auto_sweep drives F to -20, which
  the +-2 N input cannot represent); only v0 = 0.0 m/s (never rescaled) sits correctly centred.
- STATE_2__frozen.png / STATE_2__dense_t*.png: HUD m2 = 150.0 kg with the thumb pinned at the
  far-right rail — the state sole live control (controls_visible [m2], the whole point of S2).

Impact (why it blocks):
1. S2 live control inverts the lesson. The narration explicitly instructs the teacher to drag the m2
   slider heavier or lighter and watch its acceleration change live. A drag emits mass_b in [0.5,5] ->
   body B collapses from 150 kg toward <=5 kg, i.e. LIGHTER than body A (75 kg). Same-force-heavier-
   lags flips to B-rockets-ahead the instant the teacher touches the only interactive slider in any
   guided state. Rule 31 live-control contract broken.
2. S4 sandbox is internally two-scale. Idle sweep runs the 150 kg body over F in [-20,20] N
   (a=+-0.133). The moment the teacher grabs m or F, mass jumps to <=5 kg and |F| to <=2 N — a
   completely different regime. The a = SigmaF/m the state exists to let a teacher explore is unusable
   at the built scale, and both thumbs are visibly stuck at their rails while the numbers read
   150 / -20.
3. This is exactly the Bug-1 slider-body-mismatch silent-failure class (Gate-4 guard: slider value
   must equal the built physics variable). The physics_block REVISION 2 section 6 explicitly specified
   the intended ranges (m/m2 10 kg range 50-300, F 2 N range -40 to 40) and changelog rows 27-29 list
   them — json_author applied them to physics_engine_config.variables and missed the parallel
   field_3d_config.slider_controls block that actually drives the widgets.

Named fix (not a re-derivation): in field_3d_config.slider_controls set m and m2 ->
{min:50, max:300, step:10, default:150}, F -> {min:-40, max:40, step:2, default:0}; leave v0 as-is
(v0 was not rescaled). idle_auto_sweep.range [-20,20] already sits inside the new +-40 band. Then
re-seed -> re-run THE EYE (widget thumbs must track their values) -> re-dispatch this gate + eye_walker.

Why the sealed sibling did not hit this (cross-check): newton_first_law.json slider_controls m {0.5-5,
def 2} MATCHES its body masses (2 kg everywhere) and F {-4,4} matches its F=0 bodies — internally
consistent, which is why it sealed. This concept rescaled the bodies but not the slider block.

## What this session set out to verify — BOTH fixes reproduced correctly (not the blocker)

(1) x75 rescale — internally consistent and physically correct: CONFIRMED.
- F = ma holds everywhere (node + HUD in frames): S1 15/150 = 0.10 (STATE_1__dense_t00000.png a=0.10,
  F=15.00 N); S2 A 15/75 = 0.20 / B 15/150 = 0.10 (STATE_2 HUD); S3 A 15/150 = 0.10 / B 30/150 = 0.20
  (STATE_3__dense_t00000.png HUD); S4 -20/150 = -0.13 (STATE_4 HUD). Accelerations numerically
  identical to REVISION 1 — only N/kg moved.
- HUD numerics match captions/narration; anchor 75 kg (loaded suitcase) / 150 kg (loaded luggage cart)
  is physical and Rule 35 universal (no place/brand/currency/name in any caption/label/text_en).

(2) Engine nlbBodyLaneZ (commit 3a576ea) — two bodies read as SEPARATE, individually labelled objects;
2:1 comparison legible: CONFIRMED.
- field_3d_renderer.ts L29516-29527 nlbBodyLaneZ: non-hanging non-ghost bodies with >=2 lanes and no
  pulley get a (k-(n-1)/2)*NLB_LANE_GAP z-offset; single-body / pulley / hanging return 0 (single-body
  baselines bit-identical by construction). L29541 applies it in nlbSetBodyPosition.
- STATE_2__dense_t08000.png: m1 (blue, 75 kg, a=0.20) clearly ahead, m2 (pink, 150 kg, a=0.10) lagging
  — a legible 2:1 gap with two distinct, separately-readable labels.
- Residual (eye_walker call): the H2 frozen pin lands early (~t3000) where s-separation is still small;
  lane-z mitigates but does not erase the early merged-label overlap. Deferred to eye_walker.

(3) Arrow-floor fix (REVISION 2 content): CONFIRMED. S1 F=15 -> len 0.45 renders a visible arrow
(STATE_1__dense_t00000.png); S3 15/30 -> 0.45/0.90 (STATE_3__dense_t00000.png). Restores S1 glow_focal
and the S3 Rule-29 1:2 length payload.

## Gate results

- Gate 0 — Definition of Done: PASS with the blocker noted. 10a states/modes match; 10b symbol labels
  on-canvas (Sigma, m1/m2 sprites, v0, squared) present, but the m/m2/v0 SLIDER widgets are
  functionally broken (blocker). 10c RHR N/A. 10d motion present. 10e conceptual-only. 10f assessment
  omitted — ACCEPTABLE this phase (Gates 16-20 dormant; misconception_watch present at the two pivots
  S1/S2 only) — same adjudication as the sealed sibling; advisory to architect to drop the assessment
  mandate from the DoD while 16-20 are dormant. 10g macro-micro correctly NOT triggered. 10h canvas
  budget OK (one formula_overlay/state, <=5-word caption, value-only HUD, f/N excluded).
- Gate 1 — Type check: consumed, 0 errors.
- Gate 2 — Validator: consumed, target PASSES; Gate 9 clean.
- Gate 3a: Rule 15 manual_click x3 + interaction_complete = 2 distinct OK; Rule 19 3 primitives/state
  OK; Rule 23 prerequisites advisory OK.
- Gate 3c: N/A (no narrative_socratic; Rule-31 concept).
- Gate 3d (E42 9-cond): SigmaF=F_applied (theta=0, mu=0 documented invariant); no angle -> angle_arc
  N/A; force vectors engine-driven; scene>=3; epic_c absent (optional); no circular prereqs;
  annotations only; mode_overrides suspended. OK
- Gate 3e — Rule 31 distinct-motion + contextual controls: archetypes accelerate-run /
  side-by-side-race / declared-contrast-pair / drag-sandbox — no illegal repeat, no static state OK.
  BUT the contextual-control HALF FAILS: S2 sole live control (m2) and S4 m/F are built at the wrong
  scale (blocker) — a control that inverts its own lesson on drag is not a working control. FAIL.
- Gate 3f — Rule 32 legibility + word budget: node word counts S1=48, S2=54, S3=53 (all in 25-55),
  S4=21 (explore-exempt, above floor) OK; <=5-word delta cues open every caption; cause-first,
  one-variable-moves, one glow_focal OK.
- Gate 3g — Rule 33/34: Rule 33 NOT triggered (macroscopic vars); one Unicode formula surface/state
  (implies-arrow, proportional, Sigma render); value-only HUD; caption = delta cue only OK.
- Gate 4 — Live visual walk (field_3d -> THE EYE): 19/19 consumed; every state looked at. Rescale +
  lane fix + arrow fix all reproduce. FAIL on the slider-scale blocker — thumbs pinned at rails, live
  control inverts the lesson. 4a/4b (chat) N/A (retired stack).
- Gate 5 / Gate 6: N/A — deferred (deep-dive / drill-down dormant, Rule 18/22 [D]).
- Gate 7 — Console/log: build clean, page HTTP 200, config assembled; audio-manifest absence expected
  (Rule 30h/30i). No errors on THE EYE renderer path.
- Gate 8 — engine_bug_queue (file scar_candidates.sql; NO DB read/write): confusion_cluster_registry
  probe N/A-DORMANT. Both prior eye_walker candidates addressed — two-body lane-offset (CRITICAL) FIXED
  by nlbBodyLaneZ (code + STATE_2__dense_t08000.png); arrow-min-length-floor (MAJOR) fixed by the x75
  content rescale (S1/S3 frames). Carried non-blocking scar field3d_nlb_phase_glow_handoff_not_visible
  (MODERATE, ambiguous owner) does NOT reproduce — this concept authors ZERO phases[]. Flagged per
  instruction; not a new finding. No new scar candidate emitted — the blocker is JSON content, not an
  engine scar.
- Gate 9 — Layout overlap: validator Gate 9 clean; 3 static annotations/state, distinct zones.
- Gate 10 — Expression resolution: no {var} leak; annotations static; formulas are engine checksums.
- Gate 11 — Plain-English: no Hinglish; on-canvas text is labels/equations only.
- Gate 12 — Visual continuity: same flat surface + m1 across states; S2/S3 share the two-lane
  apparatus + start line (-8), only the varied dial differs.
- Gate 13 — Animation vocabulary: mode-driven motion; no silently-no-op animation types.
- Gate 14 — Pass-1 strategic: skeleton carries 3 prerequisite cliffs, M1/M2 (16a), aha (PRIMARY S1 +
  1 SUPPORTING S2->S3), foundational-coverage (S1 in foundational S1-S3); 14b JEE trace present. OK
- Gate 15 — Pass-2 four-question: S1 15a force-sets-a-RATE cliff / 15b readout-pair curiosity beat /
  15c accelerate-run cause-first / 15d focal nsl_s1_watch_a. S2 two identical arrows, growing 2:1 gap
  IS the readout. S3 declared contrast pair, doubled arrow glows. S4 sandbox. No systemic failure. OK
- Gates 16-20: N/A — deferred (no assessment block).
- Anti-plagiarism / Rule 35: anchor = elevator rising + loaded-vs-empty luggage cart — universal; no
  place/festival/currency/brand/name/Indian-home phrasing; no DC Pandey / HC Verma mirroring; no
  figure refs; no Hinglish. Anchor used once (S1). OK
- Rule 30i (English-only): text_te = 0 (correctly not authored), text_hi = 0 (FYI, not a failure).

## Summary
Content numerics (x75 rescale) are internally consistent and physically correct; the engine lane-offset
fix and the arrow-floor fix both reproduce in pixels. Blocked by ONE new defect the rescale introduced:
field_3d_config.slider_controls (the block the field_3d renderer reads for its widgets) was not rescaled
alongside physics_engine_config.variables and the per-state bodies, so every mass/force slider thumb is
pinned at its rail and S2 live m2 drag inverts the lesson. Single, named, mechanical fix. Amendment-6
auto-approve must NOT fire.

VERDICT: FAIL -> alex:json_author (rescale field_3d_config.slider_controls to m/m2 {50,300,10,150} .
F {-40,40,2,0} . v0 unchanged; then re-seed -> THE EYE -> re-audit).
