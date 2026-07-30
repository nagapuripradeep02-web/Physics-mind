# quality_auditor report - newton_third_law (REBUILD, FINAL audit, post FIX CYCLE 3)

Run audited: `.visual_runs/newton_third_law/20260729-231113/` - gate log `docs/loop_runs/lom/newton_third_law/eye_run.log`
Artifact: `src/data/concepts/newton_third_law.json` (working tree). Review site: http://localhost:8090/newton_third_law/ (HTTP 200, dispatch-verified).
THE EYE NOT re-run (per dispatch). Prior pixel/numeric verdicts treated as STALE and re-derived from the current JSON + the 20260729-231113 frames.
(Unicode math glyphs referred to by codepoint in this ASCII report; the JSON carries the literal glyphs - verified below.)

## VERDICT: PASS

- Founder-criterion verdict: PASS - a student SEES two bodies push each other through a visible on-screen object (the compressed spring). The v1 "arrows from nowhere, nothing touching" failure is genuinely resolved.
- STATE_4 verdict: PASS - the eye-walker MAJOR finding (nlb_bound_stop_sigma_f_zeroed_contradicts_shown_formula) is genuinely gone; STATE_4 still teaches its payload.
- Prior blocker (Gate 3g / Rule 34c ASCII formula overlays): RESOLVED - all overlays + sprite/arrow/slider labels are literal Unicode.
- One ADVISORY (non-blocking): STATE_5 sandbox idle-auto-sweep shows an intermittent ~0.2-0.3 N F-mirror-lag asymmetry. Self-healing on interaction, confined to the non-baselined explore sandbox, already advisory in the prior audit. Does NOT block ship.

---

## TOP GATE - founder rejection criterion (judged FIRST)

Does a student watching this SEE two bodies push each other, or is the pair still merely asserted? PASS.

Machine evidence (frames read this run):
- STATE_1__dense_t00000.png: a yellow compressed spring coil sits BETWEEN two touching carts (red m2 left, blue m1 right); both green applied arrows drawn pointing outward; HUD m1 F=30.00 N / m2 F=-30.00 N; v=+/-0.16 m/s. The CAUSE is a real physical object on screen.
- STATE_2__dense_t00000.png: same spring, arrows pixel-identical, HUD F=30.00/-30.00, a=7.50/-2.50.
- STATE_3__dense_t00000.png: cart pushes a visible green wall slab through the spring; cart + wall arrows equal length, both full brightness; wall a=0.00.
- STATE_1__frozen.png: symmetric recoil - m2 ~133 px left of centre, m1 ~135 px right (~1.5% symmetric); the v1 ~28% lateral-camera asymmetry is gone; v=+/-2.08 m/s. camera x=0 all five states.

Caveat (non-blocking, unchanged): spring+arrows visible during the ~420 ms release window (dense t=0); the frozen H2 pin (release+2000) shows only the coasting aftermath with F=0 and no arrows (by design, brief 3.3). The push plays in real time for the teacher, so the interaction IS on screen.

---

## STATE_4 - the specific re-audit (eye-walker MAJOR finding)

Fix applied: F_net REMOVED from STATE_4 readouts (now ["F_applied","f"]); formula changed to the pair statement F21 = -F12.

- Contradiction gone - PASS. STATE_4__frozen.png (bound-stop tail): HUD m1 F=30.00 / f_k=0.00, m2 F=-30.00 / f_k=0.00; formula F21 = -F12 -> 30 = -(-30) = 30, TRUE at every frame incl. the clamped tail. NO SigmaF readout and no live-SigmaF formula, so the "30+0=0 on screen" self-contradiction cannot recur.
- Still teaches its payload - PASS. STATE_4__dense_t00000.png (held): each cart carries an applied arrow (green) AND a friction arrow (pink) of equal length, opposite direction - the "push and its own grip cancel on the SAME body" beat is legible; glyph f_s. STATE_4__dense_t03000.png (post-breakaway): friction arrows vanish, glyph flips to f_k=0.00, both carts separate; F stays 30.00/-30.00. Narration s4_1..s4_4 (49 words) matches the frames.
- F_applied exact +/-30.00 whole state incl. breakaway - PASS. t=0/2000/3000/frozen all read 30.00/-30.00; no drift, no lag. Ramp is on mu_s (both bodies one pass, no mirror), never on F.
- Single clean breakaway, no chatter - PASS. t=2000 held (f_s), t=3000 broken (f_k); D6 profile 0.00 -> 0.16 -> 0.45%.
- Glyph <-> HUD consistent - PASS. Same _stuck flag; no disagreement in any sampled frame.

---

## Gate table (machine evidence)

- 0 DoD: OK - 5 EPIC-L states id-matched to field_3d states; F21/F12 arrow labels each push_off state; motion each state; conceptual-only.
- 1 tsc: OK - npx tsc --noEmit exit 0.
- 2 validate: OK - PASS newton_third_law.json; 128 PASS / 0 FAIL; zero bounds warnings on target (the two epic_c_branches OVERLAP WARNs belong to another file - this JSON has no epic_c_branches block).
- 3a rules: OK - Rule 15: 2 distinct advance_mode (manual_click x4, interaction_complete x1); Rule 19: 4 primitives/state; Rule 23: prerequisites advisory.
- 3c Socratic: N/A - no narrative_socratic state.
- 3d E42: OK - theta=0 all states; SigmaF held=0; vectors in-bounds; epic_c optional; no circular prereqs; modes suspended.
- 3e Rule 31: OK - archetypes distinct (S1/S2 declared mirror-recoil contrast pair, S3 anchor-recoil, S4 reveal-build, S5 drag-sandbox); controls_visible [] on S1-S4, [m,m2,F] on S5; no static state; no Socratic artifacts.
- 3f Rule 32/words: OK - narrations 46/43/42/49/24 EN words (guided S1-S4 in 25-55; S5 explore exempt); delta cues <=5 words; cause before effect; one variable moves.
- 3g Rule 33/34: OK - all five formula_overlay strings literal Unicode (codepoints via python json load: U+21D2, U+221D, U+2192, U+2248, U+2212, U+2081, U+2082); zero JSON backslash-u escapes; sprite/arrow labels F21/F12 + slider labels m1/m2 all Unicode; no mojibake. HUD value-only. Rule 33 N/A. One formula surface per state.
- 4 visual walk: OK - every state looked at; interaction visible; arrows/HUD correct; H1 no template leaks.
- 7 console: OK - H3 zero console.error / zero uncaught exceptions.
- 8 bug-queue/scars: OK (scar table below); confusion_cluster_registry probe N/A-DORMANT (Rule 22 [D]).
- 9 layout: N/A - field_3d; epic_l_path annotations not canvas-rendered.
- 10 expr: OK - no {var} leak (H1).
- 11 plain-English: OK - no Hinglish; ASCII-math was Gate 3g (resolved).
- 12 continuity: OK - same apparatus; camera [0,3.2,12.5] x=0 identical all 5 states.
- 13 anim vocab: OK - push_off / action_reaction / param_ramp / phases / spring / fixed / idle_auto_sweep all real engine keys.
- 14 Pass-1: OK - PRIMARY aha = STATE_2 (inside entry_state_map.foundational S1-S2); entry_state_map + prerequisites present; 14b dormant.
- 15 Pass-2: OK - per-state cause->effect + focal + motion S1-S5; S4 15a-15d pass.
- Anti-plag / Rule 35: OK - universal anchors (ice skaters, swimmer pushing off pool wall); no country/brand/festival/currency; text_en only.
- Rule 30i: OK - text_te count 0, text_hi count 0.

Registration verified: CONCEPT_RENDERER_MAP field_3d (aiSimulationGenerator.ts:2957), VALID_CONCEPT_IDS (intentClassifier.ts:138), CLASSIFIER_PROMPT (intentClassifier.ts:805/1013), panelConfig.ts:1534. Not in PCPL. All 4 pre-existing sites intact.

---

## Scar re-verification (all recorded classes)

- Spring position: S1/S2 A(+0.91)/B(-0.91) gap 1.82 m = 0.72+0.55+0.55; S3 A(+0.7725)/W(-0.7725) gap 1.545 m = 0.72+0.55+0.275. body_a_id on the positive side in every push_off state (A).
- release_at_ms: S1/S2 = 420 = 1000*sqrt(1.76/(30*(1/6+1/6))); S3 = 593 = 1000*sqrt(1.76/(30*(1/6))) with the fixed body 1/m dropped. Coil hides after release.
- STATE_4 mu_s ramp: reactive static friction pegged 30.00 N while stuck; param_ramp on mu_s not F; F exactly +/-30.00 every frame incl. breakaway; single breakaway; f_s->f_k glyph consistent with HUD.
- STATE_2 AHA: applied arrows pixel-identical at t=0 while HUD a=7.50/-2.50; at frozen positions split ~3:1 (m1 far right, m2 slightly left of centre). Measurable.
- STATE_3: wall 30 N arrow full magnitude + full brightness, pixel-identical to cart; wall a=0.00, static.
- STATE_1: equal-mass recoil symmetric (~+/-134 px), no lateral-camera asymmetry.
- Slider-clamp: slider_controls m/m2 [2,14], F [15,45]; every value written (m up to 12, F 30 / sweep 15-45) is contained.
- Arrow clamp len = clamp(0.55,2.80,N*0.048): 30 N->1.44; S5 sweep 15->0.72, 45->2.16 - nothing below 11.5 N or above 58.3 N.
- controls_visible: no F on S1-S4 (all []); F present on S5.
- camera x=0: all five states [0,3.2,12.5].
- Rule 34c sprite path: arrow labels F21/F12, body/slider labels m1/m2 swept to Unicode.
- Binding integrity (dispatch #2): every glow_focal / push_off.body_*_id / spring.between / action_reaction.driver_body_id / param_ramp.param / controls_visible token references an ID (A/B/W) or param token (m/m2/F/mu_s), never a display-label string. glow_focal values resolve: nlb_spring, nlb_arrow_B_applied, nlb_arrow_W_applied, nlb_arrow_A_friction (+phase nlb_arrow_B_applied), nlb_body_B - all valid engine keys. No broken glow/push_off binding; frames render the intended focal each state.

---

## ADVISORY (non-blocking) - STATE_5 sandbox F-mirror-lag

KEYFRAMES_STATE_5__t02856.png: HUD m1 F=35.16 N / m2 F=-35.40 N - unequal pair (delta ~0.24 N) beside the formula F21 = -F12. KEYFRAMES_STATE_5__t00111.png: F=15.96/-15.96 (equal). Documented one-frame F-mirror lag (physics_block FIX CYCLE 1 (b)): idle_auto_sweep writes F on the driver only; action_reaction re-derives the partner from the previous frame, so while the sweep is actively changing F the partner lags ~0.2-0.3 N. Vanishes when F stops changing (teacher grabs the F slider -> exact +/-F).

Non-blocking because: (1) confined to STATE_5, the non-baselined explore sandbox - every GUIDED state incl. PRIMARY-aha S2 shows exact +/-30.00; (2) self-heals on interaction; (3) already advisory in the prior audit, not newly introduced; (4) the guided lesson teaches exact equality throughout.

Recommended (future touch, not required for ship): drop idle_auto_sweep from STATE_5 - the sandbox already recoils via applied_force_N: 30 + action_reaction, staying alive (Rule 37) with exact +/-F on the HUD. Owner if pursued: alex:json_author (drop the sweep) or peter_parker:renderer_primitives (within-frame F mirror). Flag only - do not route this cycle.

---

## Expected / ignored per dispatch
- 8x [H2] diffs on S1-S4 vs OLD-arc baselines - expected (Rule 34e -> re-baseline via visual:approve after founder OK); STATE_5 has no baseline; all deterministic gates (D1p/D5/D6/D7/H1/H3) PASS.
- Silent narration / no audio manifest (Rule 30h; TTS founder-gated, banned here).
- cluster migration authored-not-applied (Rule 22 [D]).

---

## Routing
No FAIL routing. VERDICT PASS. Hands off to founder -> reviewer (Asmi). The STATE_5 sweep-lag is a documented advisory for a future touch, not a blocker.
