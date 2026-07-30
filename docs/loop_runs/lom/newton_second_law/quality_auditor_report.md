# QUALITY_AUDITOR REPORT — newton_second_law (Laws of Motion, Class 11 — concept 2/3)

Worktree C:\Tutor\physics-mind-lom-b (branch feat/lom-b). Renderer family: field_3d
(newtons_laws_body scenario, engine already built + sealed via newton_first_law). Report-only:
no concept/source file edited, no DB row written. Evidence is machine-extracted (grep / node /
built sim.html), not recalled.

## Consumed (not re-run — orchestrator-supplied)
- npx tsc --noEmit -> 0 errors.
- npm run validate:concepts -> 127 PASS / 0 FAIL; newton_second_law PASSES.
- npm run check:renderer-syntax -> OK (no renderer touched).
- cache:clear:scoped + re-seed + npm run visual:eyes -- newton_second_law -> 19 deterministic
  checks, 19 passed, 0 failed, cost 0.
- npm run build:review -- newton_second_law -> built; review site HTTP 200 at
  http://localhost:8090/newton_second_law/.

---

## Gate results

Gate 0 — Definition of Done (skeleton section 10) — PASS (one advisory, non-blocking)
- 10(a) States: DoD lists S1 accelerate / S2 mass-compare 1:2 / S3 force-compare 1:2 / S4 sandbox
  -> JSON epic_l_path.state_count 4, ids STATE_1..STATE_4 matched. Each state newtons_laws_body.mode
  matches (accelerate_applied_force, compare_mass_same_force, compare_force_same_mass, sandbox).
- 10(b) Symbol labels: built sim.html carries Unicode SigmaF (25), m-sub-1 / m-sub-2 sprite labels
  (sub-1 x31, sub-2 x30), v-sub-0 (4), squared (95). All declared symbols on-canvas.
- 10(c) RHR: N/A — no cross products (documented, not TBD).
- 10(d) Motion: every guided state integrates under a visible applied-force cause; no static diagram
  where motion declared; placements computed against surface.length_m (clamp check below).
- 10(e) Modes: conceptual-only, mode_overrides absent — correct (Rule 20 [D]).
- 10(f) assessment + coverage_map: DoD declares a 3-item plan; JSON omits the blocks. Adjudicated
  ACCEPTABLE below (Item 1), mirrors the sealed sibling. misconception_watch (the half Gate 0
  requires this phase) IS present at the two genuine pivots only (S1 M1, S2 M2), never per-state.
- 10(g) Macro-micro: correctly NOT TRIGGERED (taught variables directly macroscopic).
- 10(h) Canvas budget: one formula_overlay per state, caption = <=5-word delta cue, value-only HUD
  (readouts never includes f / N — mu=0 zero-stub scar defended).

Gate 1 — Type check — consumed (0 errors).
Gate 2 — Validator — consumed (target PASSES; Gate 9 confirms no overlaps).

Gate 3a — CLAUDE.md section 6 mechanical —
- Rule 15: advance_mode = manual_click (S1-S3) + interaction_complete (S4) = 2 distinct.
- Rule 19: every state scene_composition.length = 3.
- Rule 23: prerequisites [newton_first_law, instantaneous_velocity] advisory.

Gate 3c — Socratic reveal — N/A (no narrative_socratic states; Rule-31 concept).

Gate 3d — E42 9 conditions — SigmaF = F_applied at every instant (theta=0, mu=0, documented
invariant); no angle referenced so angle_arc N/A; force vectors engine-driven (arrows[]); scene >=3;
epic_c absent (optional); no circular prereqs; only annotation primitives; mode_overrides suspended.

Gate 3e — Rule 31 distinct-motion + contextual controls —
- Archetypes: accelerate-run (S1) / side-by-side-race (S2) / side-by-side-race DECLARED contrast pair
  with S2 (S3, delta names the flip mass<->force) / drag-sandbox (S4). Only S2/S3 repeat and it is
  the declared contrast pair — permitted. No static state.
- controls_visible: S1 [], S2 [m2], S3 [], S4 [m,F,v0] — matches skeleton section 3 control table
  exactly. Explore-last exposes all this concept has (mu/theta excluded — frictionless flat). No
  control token shared between two guided states, so slider-row-jump scar cannot bite.
- No Socratic artifacts (no wait_for_answer, no pause_after_ms).

Gate 3f — Rule 32 legibility + word budget —
- Word counts on text_en (node-counted): S1 48, S2 54, S3 53 — all within 25-55 (S2/S3 near the 55
  ceiling but compliant). S4 = 21 (explore, budget-exempt; short orienting line, above the 20 floor).
- Delta cues <=5 words open every caption: Force on - speed climbs / Same force - heavier lags /
  Same mass - stronger force wins / All yours.
- Cause-first (F arrow glows on a resting body before visible motion), one-variable-moves (S2 only
  mass differs; S3 only force differs), exactly one glow_focal per state (S1 nlb_arrow_A_applied,
  S2 nlb_body_B, S3 nlb_arrow_B_applied, S4 nlb_body_A).

Gate 3g — Rule 33/34 macro-micro + uncluttered canvas —
- Rule 33 NOT TRIGGERED (macroscopic taught variables). Instruments = value-only HUD; the a readout
  is itself the star witness (pinned in S1, 2:1 in S2/S3).
- One formula surface per state, Unicode: built sim.html shows implies-arrow (48), proportional (66),
  SigmaF (25) — S1 constant F => constant a, S3 a prop F, S4 a = SigmaF/m render as real Unicode; S2
  a = F/m is plain letters + slash. All three text paths covered (DOM overlays Unicode; no canvas
  graph text; 3D sprite labels m-sub-1 / m-sub-2 / SigmaF).
- Advisory (non-blocking): grep finds ASCII => (14) and F_net (24) in sim.html, but these are (i) JS
  arrow-function syntax in embedded renderer code and (ii) the internal F_net readout/variable KEY
  (on-canvas HUD renders it as SigmaF). Neither is on-canvas rendered text — identical adjudication
  to the sealed sibling. Not a Rule-34c violation.

Gate 4 — Live visual walk — (field_3d -> THE EYE). 19/19 consumed; eye-walker owns the frame verdict.
Review page HTTP 200; sim.html assembled with all 4 states. Legacy chat probes 4a/4b: N/A.

Gate 5 / Gate 6 — N/A — deferred (deep-dive / drill-down dormant, Rule 18/22 [D]).

Gate 7 — Console + log discipline — Build clean, page 200, config assembled. Audio-manifest absence
EXPECTED (Rule 30h/30i — no TTS this loop), not an error. THE EYE runs the real renderer path with
0 failures.

Gate 8 — Engine bug queue regression (scar_candidates.sql file — NO DB reads/writes) —
Reviewed all rows. confusion_cluster_registry probe: N/A-DORMANT (new conceptual-only concept).
Every nlb seam scar is engine-owned (peter_parker) and either FIXED or structurally absent/defended:
- field3d_nlb_physics_clock_not_state_local (CRITICAL row that PARKED newton_first_law) — FIXED
  cross-branch (git 3e1b159); the ignores_reset_trajectory row is FIXED. All three guided states
  depend on it; THE EYE 19/19 (drives RESET->pin->dense->frozen) confirms the rebase holds.
- Seam B cand-2 (semi-implicit-Euler position not step-invariant, MAJOR) — engine property; engine
  ships fold-exact trapezoid form; frozen frames byte-stable -> no JSON-level regression. Engine-owned.
- Seam B cand-3 (hanging-body gravity sign) — no hanging body / no coupled branch here. Absent.
- Seam C / projection-blind label collision — no show_components, theta=0, only applied arrows on 2
  lanes (S3 0.4-vs-0.2 N doubled arrow is the one magnitude-scaled element; no multi-label FBD
  cluster). THE EYE frozen frames passed. Low risk, not a JSON defect.
- Seam D (pulley post + motion-bound-inside-mesh) — no pulley, no post; bare +/-length_m clamp;
  clamp-margin check confirms no body reaches it. Absent.
- Seam E pick-proxy-opaque + slider-row-jump — S4 authors trusted_drag_seizes true; engine-owned,
  verifiable only by founder hand-test (THE EYE cannot fire trusted events) — flagged for founder,
  not a JSON defect. Slider-row-jump not triggered (no shared control token across states).
- Seam F (deriveStateMeta F3D_REVEAL_KEYS) — engine-owned, already landed for newtons_laws_body.
No new scar candidate emitted from this audit.

Gate 9 — Layout overlap — validator Gate 9 clean; 3 static annotations/state in distinct zones.
Gate 10 — Expression resolution — no {var} template leak; annotations static text; formulas are
engine checksums, not rendered.
Gate 11 — Plain-English — no Hinglish; on-canvas text is labels/equations only (Rule 24).
Gate 12 — Visual continuity — same flat surface + body m-sub-1 across all states; S2/S3 share the
identical two-lane apparatus + start line (pos -8), only the varied dial differs (home-pose, 32d).
Gate 13 — Animation vocabulary — mode-driven motion; no silently-no-op animation types.

Gate 14 — Pass-1 strategic — Skeleton Block 1 carries 3 prerequisite cliffs, M1/M2 misconception
mapping (16a), aha declaration (PRIMARY S1 + 1 SUPPORTING across S2->S3), foundational-coverage
(PRIMARY aha S1 inside entry_state_map.foundational S1->S3). 14b JEE trace present (dormant phase).

Gate 15 — Pass-2 four-question (field_3d sole cognitive check) —
- S1: 15a (force sets a RATE not a speed — the F-vs-v cliff) / 15b (curiosity beat = readout pair:
  a pinned at 0.10 while v climbs without limit under an unchanging F arrow) / 15c (accelerate-run;
  cause arrow before motion) / 15d focal nsl_s1_watch_a (physics-bearing, not the title head).
- S2: contrast — two identical F arrows, only mass differs; growing 2:1 gap IS the readout; live m2
  drag. Focal nsl_s2_mass_gap.
- S3: declared contrast pair — equal mass, doubled arrow on B glows; mirror-image 2:1. Focal
  nsl_s3_force_gap.
- S4: sandbox. RHR N/A. First-frame orientation: bodies present + at rest, F arrow glows before
  motion. No systemic sub-check failure across states.

Gates 16-20 — N/A — deferred (no assessment block; dormant this phase — Item 1).

Anti-plagiarism / Rule 35 anchor probe — Anchor = an elevator starting to rise + loaded-vs-empty
luggage cart — universal, culture-neutral. No place, festival, currency, brand, name, or Indian-home
phrasing in any caption, label, or text_en (all states scanned). No DC Pandey / HC Verma setup
mirroring; no figure references; no Hinglish. Anchor used once (S1), not per state.

Rule 30i (English-only) — grep -c text_te = 0 (Telugu correctly NOT authored). text_hi = 0 (FYI only
— a missing Hindi text is not a failure this phase).

---

## Adjudication of open items

Item 1 — omitted assessment + coverage_map (DoD 10(f) declares a 3-item plan): ACCEPTABLE — NOT a
Gate 0 FAIL. The CURRENT-PHASE PRE-FLIGHT stands Gates 16-20 down (no students, no comprehension
metric). The schema assessment block requires min 6 backward-designed MCQs; the skeleton/physics-block
supplied only 3 conceptual test ideas. Authoring 3 fabricated fillers to clear the min(6) floor would
violate evidence-discipline; omitting the block is the correct call and the validator PASSES without
it — the identical, already-accepted precedent from the sealed sibling newton_first_law. The
required-this-phase half (misconception_watch at genuine pivots) IS present (S1, S2). Advisory
(non-blocking, route nowhere now): the architect should either drop the assessment mandate from the
DoD while Gates 16-20 are dormant, or supply a full 6-item plan, so this tension stops recurring.

Item 2 — the two sibling scars that PARKED newton_first_law, re-checked against the JSON real numbers:
BOTH DEFENDED.
- (a) Clamp margin — recomputed from the JSON authored bodies against surface.length_m 10 (+/-10 m):
  S1 pos -7, a = 0.2/2 = 0.10, s(14 s) = -7 + 9.8 = +2.8 m (7.2 m margin); S2 body A (m 1, F 0.2 ->
  a 0.20) s(12 s) = -8 + 14.4 = +6.4 m (3.6 m margin), body B -0.8 m; S3 body B (m 2, F 0.4 -> a 0.20)
  s(12 s) = +6.4 m (3.6 m margin), body A -0.8 m; S4 sandbox pos 0, idle sweep F in [-1,1] -> a in
  [-0.5,+0.5], teacher-driven. No body reaches the +/-length_m bound within its dwell window —
  binding case 3.6 m. Matches physics_block section 7 arithmetic exactly.
- (b) First-frame initial-velocity — every body authors initial_velocity_mps 0, so the first captured
  frame reads v = 0.00 for all bodies; a is correctly non-zero and pinned from frame 1 (constant
  applied_force_N, not phased in) — correct physics (flagged in physics_block section 3 as NOT a
  v0-leak), and the HUD does not contradict the caption (Force on - speed climbs, with v starting at
  0 and rising; annotation a pins at 0.10 ... v climbs every second). THE EYE 19/19 covers the
  first-frame + frozen-frame checks.

---

## Registration sites
src/data/concepts/newton_second_law.json OK; CONCEPT_RENDERER_MAP aiSimulationGenerator.ts:2956 =
field_3d OK; NOT in PCPL_CONCEPTS OK (the other aiSimulationGenerator hits are the unrelated legacy
newton_second_law_direction); panelConfig.ts present OK; VALID_CONCEPT_IDS + CLASSIFIER_PROMPT in
intentClassifier.ts present OK. PILOT_CONCEPTS deliberately untouched (founder-gated) — not a missing
site.

## Scar candidates to emit
None from this concept audit. All relevant newtons_laws_body scars are engine-owned and either FIXED
(clock/reset-trajectory rows) or structurally absent (pulley / hanging-body / FBD-label scars) or
defended by design (clamp margins, HUD zero-stub exclusion). No DB row written.

---

VERDICT: PASS
