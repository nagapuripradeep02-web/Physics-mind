# QUALITY-AUDITOR REPORT — connected_bodies (Laws of Motion #2) — CYCLE 1 (post-fix re-audit)

- Concept: src/data/concepts/connected_bodies.json — 7 states, field_3d, scenario_type newtons_laws_body (Branch B coupled/Atwood)
- Cycle: 1 · Branch: feat/lom-a · Date: 2026-07-25
- Live walk: served sim at http://localhost:8089/connected_bodies/ (HTTP 200). Runtime probed by driving sim.html directly with SET_STATE + RESET_TRAJECTORY postMessages, reading window.PM_nlbEngine.bodies AND the DOM readout spans (#nlb_ro_BODY_KEY_val) via headless Chromium (Playwright, desktop viewport 1400x900 so the isMobile SVG fallback never triggers). S7 driven with TRUSTED keyboard input (Home/End on range sliders, ev.isTrusted seizes the idle sweep).
- Evidence discipline: every number below is a RUNTIME HUD/engine readout captured this session, sampled at BURST (~0.7s), MID (~2.6s), and LATE (~11.3s) per state. 0 console errors / 0 pageerrors across 18 samples plus the S6/S7 probes.

## VERDICT: FAIL

The two HIGH findings that caused the cycle-0 FAIL are BOTH RESOLVED at runtime — verified late-in-state (not just mid-burst) and confirmed even in THE EYE frozen baseline. Engine fix 1 (5a07aa9) makes S1/S2 glide; engine fix 2 (bc649d4) HOLDS the achieved dynamic solution after the bound halt instead of reverting to the rest/misconception value. Targeted, correct fixes.

FAIL is carried by ONE new ship-blocker surfaced this cycle: S6 (Atwood, the SUPPORTING-aha guided state) renders NO pulley wheel — the ropes terminate in open space and the declared glow_focal (nlb_pulley_wheel) is invisible. Visible immediately on entering S6, on the default view, in the frame a teacher pauses on, and in THE EYE frozen baseline — not an edge case. It is an ENGINE gap (surface.hidden hides the pulley, which is parented to the surface group), not a content defect. For a teacher-facing VISUAL product (Rule 24), an Atwood machine with no pulley and ropes-to-nowhere is not ship-ready.

Two lower-severity engine items ride along (Finding 3 sandbox a>g; S7 HUD bleed) — neither independently ship-blocking; both acceptable to carry to founder with the pulley fix.

## Cycle-0 findings — re-verification AT RUNTIME

### FINDING 1 (was HIGH) — S1/S2 coupled glide — RESOLVED
nlbSeedKinematics now clamps each coupled seed into its own bounds band BEFORE seeding v_string from the authored v0 (sim.html:29778-29802), removing the all-or-nothing veto that had zeroed the seed. Runtime:
- S1: v_string=0.35; BOTH bodies glide at v=0.35 m/s, a=0.00; positions advance A -3.959 to -3.282 to -0.252, B 1.391 to 2.068 to 5.098 across burst/mid/late. DOM: A_v=0.35, B_v=0.35, A_a=0.00, B_a=0.00. Shared-speed identity now demonstrable (both read 0.35, not the vacuous 0=0 of cycle 0). Glides the full authored 15s.
- S2: same glide; DOM A_T=19.60, B_T=19.60 (the deliberate earned-wrong-belief T=m2g at a=0). No longer static.

### FINDING 2 (was HIGH) — held dynamic solution after bound halt — RESOLVED
The bound veto now zeros MOTION only (sAdv=0, vs1=0) and NOT aStr (sim.html:30125-30151); D/M/friction are re-read from the live record every frame, so the halted state re-derives the achieved solution frame after frame (held by recompute, not a latch, so slider drags on a halted state stay live). Runtime LATE (t~11.3s, body pinned at bound, v=0) equals BURST in every case:

| State | Task-expected | BURST (t~0.7s) | LATE / held (t~11.3s) | DOM (late) |
|---|---|---|---|---|
| S1 | a=0.00 T=19.60 | a=0.00 v=0.35 | a=0.00 v=0.35 (gliding) | A_v/B_v=0.35, a=0.00 |
| S2 | a=0.00 T=19.60 | T=19.60 | T=19.60 (gliding) | A_T/B_T=19.60 |
| S3 (PRIMARY aha) | a=3.27 T=13.07 | a=3.267 T=13.07 | a=3.267 T=13.07 HELD | A_T/B_T=13.07, a=3.27 |
| S4 | a=0.65 T=18.29 | a=0.653 T=18.29 | a=0.653 T=18.29 HELD | A_a=0.65 A_T=18.29 |
| S5 | a=0.43 T=28.11 N=33.95 | a=0.43 T=28.11 N=33.95 f=6.79 | a=0.43 T=28.11 N=33.95 HELD | A_N=33.95 A_a=0.43 A_T=28.11 A_f=6.79 |
| S6 (SUPPORTING aha) | a=0.239 T=20.08 in (19.60,20.58) | a=0.239 T=20.08 | a=0.239 T=20.08 HELD | P_T/Q_T=20.08, P_a=0.24 Q_a=-0.24 |

Every task-expected value matches to the displayed precision. S3 held frame now shows T=13.07 < m2g=19.60 (was 19.60 = the misconception in cycle 0). S6 held frame shows ONE shared tension 20.08 between the weights (was the two separate weights 20.58/19.60 in cycle 0). Confirmed in THE EYE STATE_6__frozen.png: HUD reads m1 a=0.24 T=20.08, m2 a=-0.24 T=20.08 — the fix survives into the static frozen baseline a teacher pauses on.

### FINDING 3 (was LOW-MED) — S7 sandbox a>g — STILL REPRODUCES; acceptable to carry
Driven with TRUSTED keyboard input (seized: PM_nlbSweepSeized=true confirmed): m1=0.5 kg (DOM A_N=4.90 confirms it stuck at 0.5), F=+20 N, theta=0, mu=0 gives runtime DOM A_a=15.06, B_a=15.06 m/s2 (> g=9.8). The rigid Branch-B model keeps solving; the signed per-body tensions disagree (A.T=-10.51, B.T=+10.51 in the engine record) while the DOM prints abs T = 10.51, masking that the true string tension is negative — a taut string cannot push, so physically the rope should go slack (T=0) and B free-fall at g. No NaN, no crash, no visual break; numbers stay finite and internally Newton-consistent (A_F_net=7.53=m1*a, B_F_net=30.11=m2*a).
- [judgment] NOT ship-blocking for a teacher-facing sandbox. All six GUIDED states (1-6) are physically correct and now held. The a>g regime is reachable only by deliberately pushing the F slider to its extreme against a near-minimum m1 in the explicitly free-exploration state; a teacher would not naturally hit it, and if they did the sim degrades gracefully (finite numbers, no break). Acceptable to CARRY to founder as an engine-surface item, exactly as the dispatch intends. Recommended engine amendment (later pass): clamp T>=0 with a slack-rope visual, or narrow the shared F slider range.

## NEW findings this cycle (eye-walker items, independently verified)

### NEW-A (MED — SHIP-BLOCKER this cycle) — S6 pulley wheel not rendered; declared glow_focal invisible
[owner: peter_parker:field3d_surgeon] [reason: engine]
THE EYE STATE_6__frozen.png shows the two blocks (m1 blue, m2 red) with T arrows up and mg arrows down, but NO pulley wheel — the grey ropes rise from each block and terminate in open space near the top; the two ropes never converge over a wheel. The state reads as two independent hanging blocks on ropes to nowhere, not an Atwood machine — undermining the one-rope-over-one-pulley model S6 exists to teach.

Root cause — DEFINITE, engine (not content, not the new post_position_m):
- The pulley group is parented to the SURFACE group: surf.add(pulleyGrp) (sim.html:28973).
- Per-state visibility sets the surface GROUP visible flag from surface.hidden at sim.html:29638 (nlb_surface_group visible = not surface.hidden).
- S6 sets surface.hidden true (correct — an Atwood has no table). In three.js a child inherits an invisible parent, so hiding the surface group also hides its pulley child (post + arm + wheel + hub).
- The engine inline comment at 29635-29637 states the INTENT is only the surface slab itself is suppressed — but the implementation hides the whole group. Intent does not equal effect. Confirmed the wheel DOES render when the surface is shown: THE EYE STATE_7 keyframe (surface visible) shows the grey pulley wheel top-right.
- The new post_position_m -1.25 + camera [0,0.6,3.7] are NOT the cause (the wheel is hidden, not merely off-frame); they correctly frame where the wheel would sit.
- NOT content-fixable: the author cannot make the wheel appear without either un-hiding the slab (shows a table under a hanging Atwood pair — wrong) or an engine change. glow_focal nlb_pulley_wheel confirms the author INTENDS the wheel visible as the single focal element (Rule 32e) — it being invisible is clearly unintended.
- Fix (engine): suppress only the slab mesh (not the whole surface group), OR re-parent the pulley to the world group, OR force pulley visibility after the surface-group hide, in connected_atwood mode.

### NEW-B (LOW) — S7 readout block bleeds into the slider panel (Rule 34d)
[owner: peter_parker:field3d_surgeon] [reason: engine]
THE EYE STATE_7 keyframe: the m2 readout block last two lines (SigmaF = -1.42 N, F = 0.00 N, faint) overlap the top of the slider panel (m1 slider row). The sandbox HUD is the tallest in the concept (m1: 7 rows + m2: 4 rows) and its zone collides with the 7-slider panel below. Engine-generated layout, not concept-authored; minor legibility. Not a regression from this cycle changes.

### S7 formula_overlay removal — ACCEPTABLE (not a defect)
The content fix removed STATE_7 formula_overlay to clear a HUD collision. Rule 34b mandates AT MOST one formula surface per state, not one on EVERY state. S7 is the free-exploration sandbox (teaching complete; the student manipulates and watches live numbers); guided states 1-6 each carry their own formula. A sandbox with no formula surface is acceptable and arguably better (less clutter, the spirit of Rule 34). The removal cleared the formula-vs-HUD collision; the residual readout-vs-slider bleed (NEW-B) is a separate, smaller engine-layout item.

## Gate-by-gate (deltas from cycle 0 noted; unchanged content gates re-confirmed)

- Gate 0 DoD: PASS. 7 states match; misconception_watch at S1/S3/S6 pivots only; assessment + coverage_map consistent. Motion plan now EXECUTES at runtime (Findings 1-2 resolved).
- Gate 1 tsc: PASS (established this dispatch: 0 errors).
- Gate 2 validate:concepts: PASS (established: 126/126, target included, zero bounds warnings).
- Gate 3a mechanical: PASS. Rule 15: 2 distinct advance_modes (6x manual_click, 1x interaction_complete). Rule 19: every state prims=3. Rule 23: prerequisites advisory (4).
- Gate 3c Socratic: N/A (Rule-31 concept; no narrative_socratic).
- Gate 3d E42 9-condition: PASS. SigmaF=0 at S1/S2 verified (a=0.00 runtime); vectors bounded; mode_overrides suspended (correct).
- Gate 3e Rule 31 motion/controls: PASS (was FAIL). S1/S2 now glide at runtime — no static state remains. Contextual controls match table (S1/S2 none, S3 m2, S4 m+m2, S5 theta+mu_k, S6 m+m2, S7 all 7). Explore-last OK. No Socratic artifacts.
- Gate 3f Rule 32 + word budget: PASS (was cause-first FAIL). Words: S1=51 S2=55 S3=54 S4=51 S5=52 S6=52 (all in [25,55]; S2 at ceiling), S7=22 (exempt). Delta cues under 5 words. Cause-then-effect beats now play at runtime.
- Gate 3g Rule 33/34: PASS with one collision noted. One Unicode formula surface per guided state (Cambria Math); value-only HUD; no ASCII-math leak (grep NONE). S7 formula removal acceptable. NEW-B HUD-bleed is the one Rule-34d residual (LOW).
- Gate 4 live visual walk: FAIL — carried solely by NEW-A (S6 pulley wheel absent). All physics/motion verified across 7 states.
- Gate 7 console/log: PASS. 0 console errors, 0 pageerrors across all probes.
- Gate 8 engine_bug_queue: Findings 1 and 2 (cycle-0 OPEN scars nlb_coupled_readouts_revert_to_rest_values_on_bound_halt + the S1/S2 seed veto) verified FIXED at runtime — founder to flip the rows (no DB write per dispatch). NEW-A is a new scar candidate (surface.hidden hides the coupled pulley in connected_atwood). confusion_cluster_registry probe N/A-DORMANT (new conceptual-only concept) — not a FAIL.
- Gate 9 layout overlap: PASS with NEW-B noted (LOW HUD/slider bleed on S7).
- Gate 10 expression resolution: PASS. No brace-var leak; readouts engine-computed.
- Gate 11 plain English: PASS. No Hinglish/technical-notation leak (grep NONE).
- Gate 12 visual continuity: PASS-with-note. Same apparatus S1-S5/S7. S6 is the declared change (Atwood, slab dropped) — but the pulley SHOULD persist and does not (NEW-A).
- Gate 13 animation vocab: PASS. Only engine-native config.
- Gate 14 Pass-1 strategic: PASS. Prereq cliffs; JEE trace; misconception-entry mapping; 1 PRIMARY (S3) + 1 SUPPORTING (S6) aha; S3 in foundational range.
- Gate 15 Pass-2 four-question: PASS (was FAIL). The surprising motion now lands AND resolves and the resolving readout is HELD (Finding 2), so S3/S6 confusion beats no longer revert to the misconception. 15d focal ids physics-bearing EXCEPT S6, whose focal (nlb_pulley_wheel) is invisible (NEW-A); flagged there, routed engine.
- Gates 16-20 comprehension: PASS structural. assessment (6 Q, distractor_misconceptions, teaches_state, parallel_form_stem) + coverage_map consistent; distractors encode real beliefs; machine halves validator-enforced.
- Anti-plagiarism / Rule 35: PASS. Anchor = elevator+counterweight / gym cable machine — universal, culture-neutral. No country token (grep NONE). No text_te/text_hi (Rule 30i PASS).
- Rule 20 / mode_overrides: PASS (absent = correct).

## Routing summary (ranked by severity; one owner per finding)

1. MED / SHIP-BLOCKER — S6 pulley wheel not rendered; ropes end in open space; declared glow_focal invisible — surface.hidden hides the pulley (parented to the surface group) in connected_atwood mode — peter_parker:field3d_surgeon [reason: engine]
2. LOW-MED — S7 sandbox reaches a>g (a=15.06 m/s2); rigid coupled model masks a negative/slack tension as abs T = 10.51 — sandbox-only, deliberate extreme input required — peter_parker:field3d_surgeon [reason: engine] — ACCEPTABLE TO CARRY (not independently ship-blocking)
3. LOW — S7 readout block bleeds into the slider panel (Rule 34d) — engine-generated layout — peter_parker:field3d_surgeon [reason: engine]

Founder note: the two cycle-0 HIGH engine fixes are verified correct and held late-in-state and in the frozen baseline — the physics of connected_bodies is now fully sound across all six guided states. The remaining three items are all engine-surface and all owned by field3d_surgeon; NEW-A (the missing Atwood pulley) is the only one that blocks a teacher-facing ship and is a small, well-localized fix (do not hide the pulley when hiding the slab). Items 2 and 3 can be batched with it. No content routes to alex:json_author / alex:physics_author / alex:architect. No DB writes made.
