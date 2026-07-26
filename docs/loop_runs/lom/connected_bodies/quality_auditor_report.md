# QUALITY-AUDITOR REPORT — connected_bodies (Laws of Motion #2)

- Concept: src/data/concepts/connected_bodies.json — 7 states, field_3d, scenario_type: newtons_laws_body (Branch B, coupled/pulley)
- Cycle: 0 · Branch: feat/lom-a · Date: 2026-07-25
- Live walk: review site served at http://localhost:8089/connected_bodies/ (HTTP 200) — runtime probed via Playwright + trusted keyboard input against the served sim.html.
- Method note: per the concept-1 lesson (auditor certified T=19.60 that runtime contradicted), every number below is a RUNTIME HUD readout read from the live DOM (#nlb_ro_BODY_KEY_val), NOT worksheet arithmetic. 0 console errors / 0 pageerrors across all probes.

## VERDICT: FAIL

The JSON is authored cleanly against the frozen engine contract (all content gates pass). It FAILs on RUNTIME behavior of the frozen newtons_laws_body engine: the two states designed to carry full-duration motion are frozen, and the four accelerating states display their (correct) physics only for a 1–3.5 s burst, then revert the HUD to the rest/misconception value for the bulk of each state — including both aha states, which end up displaying the exact belief they exist to break. All three findings are ENGINE-SURFACE; none route to json/physics/architect. Matches the documented concept-1 pattern (31/31 deterministic + gate 0–20 PASS at cycle 0, defects visible only on runtime probe).

## Physics-truth runtime probe (task focus #1) — headline evidence

Live HUD, during-burst (t~0.7s) vs held-after-halt (t>=2.2s):

| State | Expected (task) | Runtime DURING burst | Runtime HELD (rest of state) | Held value |
|---|---|---|---|---|
| S1 | a=0.00, T=19.60 | a=0.00, v=0.00 both | A pinned s=-4.2, v=0, no glide | STATIC entire state |
| S2 | a=0.00, T=19.60 | T=19.60 both OK | A pinned s=-4.2, no glide | STATIC entire state |
| S3 | a=3.27, T=13.07 | a=3.27, T=13.07 both MATCH | a=0.00, A.T=0.00, B.T=19.60 | reverts to T=m2g=19.60 (misconception) |
| S4 | a=0.65, T=18.29 | a=0.65, T=18.29 both MATCH | a=0.00, A.T=15.68, B.T=19.60 | reverts to B.T=19.60 |
| S5 | a=0.43,T=28.11,N=33.95 | a=0.43,T=28.11,N=33.95,f=6.79 MATCH | a=0.00, A.T=26.39, B.T=29.40, N=33.95 | reverts to B.T=m2g=29.40 |
| S6 | a=0.239,T=20.08 in[19.60,20.58] | a=0.24/-0.24, T=20.08 both MATCH | a=0.00, P.T=20.58, Q.T=19.60 | reverts to two separate weights (misconception) |
| S7 | sandbox | live, m auto-sweeping 4->10 | continuous (Rule 37 OK) | see Finding 3 |

Every expected value is confirmed present at runtime DURING its motion burst — physics correct, not certified from paper. But the values are TRANSIENT: S3 burst ~1.1s of 20s, S4 ~2.5s of 20s, S5 ~3s of 18s, S6 ~3.5s of 15s. For the remaining ~80–95% of each state — the frame a teacher pauses on, and THE EYE frozen baseline — the HUD shows the reverted value (Findings 1 & 2).

## Findings (ranked by severity) — ALL engine-surface

### FINDING 1 (HIGH) — S1 and S2 are fully STATIC; the declared coupled-glide never happens
[owner: peter_parker:field3d_surgeon] [reason: engine]

Runtime PM_nlbEngine.bodies: body A holds s=-4.2, v=0 and body B holds s=1.15, v=0 for the ENTIRE duration of both S1 and S2 (probed to 11.6s). The authored initial_velocity_mps: 0.35 on body A is NOT seeded into the Branch-B shared v — no glide, no displacement, both v readouts show 0.00.

Why this is a real defect, not designed-around:
- Violates Rule 31 "no static state" — S1 (coupled-glide archetype, the concept HOOK) and S2 both have zero motion.
- Destroys S1 taught content. Narration: "Both speed readouts match at every instant... sharing one shared speed"; misconception_watch.visual_counter: "Both v readouts stay identical the whole glide." Runtime both read 0.00 — the identity is vacuous (0=0), no shared speed to demonstrate coupling. Delta cue "One rope, one motion" shows no motion.
- Invalidates the design's own motion-budget mitigation. physics_block sec.3/sec.6 makes S1/S2 the full-duration constant-v glides that compensate for the no-motion-loop gap. That mitigation does not execute at runtime.
- Corroborated by THE EYE frames: STATE_1__dense_t00000..t15000.png are byte-identical (all 19167 B) — a static scene that still passed 31/31.

Primary fix engine: seed the coupled shared v from a body initial_velocity_mps in Branch B. Fallback if the engine will not (founder call): architect/json re-frame S1/S2 honestly as static-comparison states (like S5 static incline) with narration that never promises a glide — a design retreat, not the intended beat.

### FINDING 2 (HIGH) — accelerating states revert the HUD to the rest/misconception value after the burst
[owner: peter_parker:field3d_surgeon] [reason: engine]

When a body reaches the coupled track bound and halts (v=0, pinned at post_position_m), the engine recomputes a=0 and the tension readout reverts to the static/rest value for the rest of the state (table above). The halt-and-hold itself is expected-by-design (no motion loop); the readout REVERTING is NOT — physics_block sec.3 promises the held frame reads the achieved value ("held after halt: T reads 13.07 N, below m2g=19.60"). Runtime does the opposite.

Worst exactly where it matters:
- S3 (PRIMARY aha, "T is not m2g"): displays B.T=19.60=m2g for ~19 of 20s while caption says "T is not m2g" and narration says "Tension now reads 13.07." The teacher paused/frozen frame shows the misconception.
- S6 (SUPPORTING aha, "one tension between the weights"): reverts to P.T=20.58, Q.T=19.60 — the two separate weights, i.e. the "each side its own tension" belief S6 exists to break.
- S4/S5 revert to B.T=m2g (19.60 / 29.40).

Same defect class as concept-1 T=19.60 trap, inverted: the correct number is real but transient, the resting display is the wrong belief.

### FINDING 3 (LOW-MED) — S7 sandbox reaches a non-physical a>g regime (confirms physics_author sec.5 item 10)
[owner: peter_parker:field3d_surgeon] [reason: engine, sandbox-only]

Driven with TRUSTED keyboard input (non-trusted dispatchEvent is overridden by the idle m-sweep — verified: it silently drove m back to ~9.9kg, N=97): m1=0.5 (N=4.90 confirms it stuck), mu_k=mu_s=0, theta=0, F=+20 -> runtime a=15.06 m/s^2 > g=9.8. A taut inextensible string cannot drive a>g; it should go slack and decouple. The rigid Branch-B model keeps solving and shows T=10.51 N — tension does NOT render negative (engine reports magnitude), but the state is physically impossible. Reachable by a teacher via trusted drags. Not JSON-fixable (F slider +/-20N range is the engine shared, non-per-concept panel). Sandbox-only -> LOW-MED. Engine-gap candidate: clamp T>=0 with a slack-rope visual, or narrow the shared F slider.

## Gate-by-gate results

- Gate 0 Definition of Done: PASS. Skeleton sec.10 DoD present, no TBDs. 7 states (ids STATE_1..7 match). Symbol labels = engine Unicode sprites (Cambria Math). RHR N/A. assessment + coverage_map authored; misconception_watch at S1/S3/S6 ONLY (pivots), not per-state. Registration sites 1-4,7,8 present. Motion plan authored; runtime execution FAILs (Findings 1-2).
- Gate 1 tsc: PASS (established per dispatch: 0 errors).
- Gate 2 validate:concepts: PASS (established: 126/126, target included, zero bounds warnings).
- Gate 3a mechanical: PASS. Rule 15: 2 distinct advance_modes (manual_click x6, interaction_complete x1). Rule 19: every state scene_composition.length=3. Rule 23: prerequisites advisory (4).
- Gate 3c Socratic reveal: N/A (no narrative_socratic; Rule-31 concept).
- Gate 3d E42 9-condition: PASS. Vectors bounded; SigmaF=0 at S1/S2 (a=0 verified at runtime); epic_c absent/optional; primitives in-spec; no circular prereqs; mode_overrides suspended.
- Gate 3e Rule 31 motion/controls: FAIL. S1 & S2 static at runtime (Finding 1) — violates "no static state." Contextual controls MATCH table (S1/S2 none, S3 m2, S4 m+m2, S5 theta+mu_k, S6 m+m2, S7 all 7). Explore-last OK. No Socratic artifacts.
- Gate 3f Rule 32 + word budget: budget PASS / cause-first FAIL. Words: S1=51 S2=55 S3=54 S4=51 S5=52 S6=52 (all in [25,55]; S2 at ceiling), S7=22 (exempt). Delta cues all <=5 words. Cause-first: S3 ghost-freeze->release plays only in ~1.1s burst then reverts (Finding 2); S1/S2 no cause beat (static). json-author claim that phases[] only drives glow (not arrow reveal) is CORRECT per engine spec sec.1 — the undercut S2/S3/S5 cause-first motion beats fail via Findings 1-2, not via missing phases.
- Gate 3g Rule 33/34: PASS. One dedicated formula surface #nlb_formula (Cambria Math), correct per-state Unicode (T1=T2=T; T=m2(g-a); a=(m2g-m1g.sin-f)/(m1+m2); a=(m1-m2)g/(m1+m2)). Value-only HUD. Rule 33 N/A-macro (constraint IS the taught variable; live T/a/v/N readouts carry the number duty). No ASCII-math leak (grep NONE). Caption = delta cue only; prose in scene_composition annotations which field_3d does NOT render (non-cluttering by design).
- Gate 4 live visual walk: FAIL. All 7 states walked on served site + runtime probe. Findings 1-3. Path-2 chat/pill N/A (retired chat stack).
- Gate 7 console/log: PASS. 0 console errors, 0 pageerrors across 4 probe runs.
- Gate 8 engine_bug_queue: PARTIAL. Runtime scar re-checks done manually (DB write forbidden per dispatch; confusion_cluster_registry probe N/A-DORMANT for new conceptual-only concept — not a FAIL). GAP-3 RESET_TRAJECTORY inherited-fixed cd8fe67. Findings 1 & 2 are NEW runtime scars -> recommend two OPEN rows (founder to author; no DB written).
- Gate 9 layout overlap: PASS. Overlays in distinct zones; no clipping; HUD clears review chrome.
- Gate 10 expression resolution: PASS. No {var} leak; readouts engine-computed.
- Gate 11 plain English: PASS. No Hinglish/technical-notation leak (grep NONE).
- Gate 12 visual continuity: PASS. Same pulley/rope/body apparatus S1-S5/S7; S6 slab-hide is the one declared change; bodies at authored home positions (frozen, Finding 1).
- Gate 13 animation vocab: PASS. Only engine-native config (mode, phases[], idle_auto_sweep).
- Gate 14 Pass-1 strategic: PASS. 14a prereq cliffs; 14b JEE trace; 14c misconception-entry mapping (T=m2g planted S2, broken S3); 14d aha 1 PRIMARY (S3) + 1 SUPPORTING (S6); 14e S3 in foundational range.
- Gate 15 Pass-2 four-question: FAIL. Flow depends on the surprising motion landing then resolving. S1/S2: NO motion (15c FAIL, Finding 1). S3/S6: confusion beat plays for the burst then resolving readout reverts to the misconception (15b/15c FAIL for the held bulk, Finding 2). 15d focal ids physics-bearing (nlb_arrow_B_tension, nlb_pulley_wheel). Systemic -> single [reason: engine].
- Gates 16-20 comprehension: PASS structural. assessment (6 Q, each distractor->distractor_misconception, teaches_state, parallel_form_stem) + coverage_map (STATE_1-6 -> Q1-6, STATE_7 non-assessed) present & consistent; distractors encode real beliefs; machine halves enforced by validator.
- Anti-plagiarism / Rule 35: PASS. Anchor = elevator car + counterweight / gym cable machine — universal, culture-neutral, plain English. No country-specific token (grep NONE). No DC Pandey import.
- Rule 20 / mode_overrides: PASS (absent = correct).
- Rule 30i language: PASS. No text_te/text_hi; English-only. Missing audio manifest expected (silent by design).

Registration: CONCEPT_RENDERER_MAP -> connected_bodies:"field_3d" (aiSimulationGenerator.ts:2826), NOT in PCPL_CONCEPTS; panelConfig.ts (3 hits); intentClassifier.ts VALID_CONCEPT_IDS + CLASSIFIER_PROMPT (3 hits); seed cache + SQL migration created. Sites 1-4,7,8 present; 5 optional, 6 N/A.

## Routing summary

All three findings ENGINE-SURFACE — the JSON is authored correctly against the frozen contract; nothing routes to alex:json_author / alex:physics_author / alex:architect.

1. HIGH — S1/S2 fully static; initial_velocity_mps not seeded into Branch-B shared v; declared coupled-glide never runs — peter_parker:field3d_surgeon [reason: engine]
2. HIGH — Accelerating states revert HUD to rest/misconception value after the burst (S3->19.60, S6->two separate weights) for the bulk of each state — peter_parker:field3d_surgeon [reason: engine]
3. LOW-MED — S7 sandbox reaches a>g non-physical regime (T magnitude-masked); shared F slider unclamped — peter_parker:field3d_surgeon [reason: engine]

Founder note: Findings 1 & 2 are the no-motion-loop gap family (engine_gap.md GAP-1) biting harder than the design anticipated — the S1/S2 full-duration-glide mitigation does not execute, and the halt reverts readouts rather than freezing them. Both warrant an engine amendment decision (seed coupled v0; freeze the achieved readout on halt, or a run_loop re-seed) before more Branch-B concepts are built. No engine_bug_queue rows written, per the dispatch.
