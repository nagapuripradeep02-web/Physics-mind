-- rotmech 0c-3 engine scar candidates — Desk E (`feat/rotmech-0c3`).
--
-- ── STATUS: NOT APPLIED. Candidate text only. ─────────────────────────────
-- `bug_class` is the upsert key. Check for an existing row before applying; a
-- recurrence is an UPDATE, never a duplicate INSERT. No DB write has been made
-- from this desk (guardrail: engine_bug_queue writes are not a parallel-wave
-- desk action).
--
-- Schema mirrors docs/loop_runs/rotmech/_engine/scar_candidates.sql — 13
-- authored columns. `subject` is NOT NULL with a DEFAULT of 'physics'; these are
-- tooling/engine-mechanism defects, so file them subject = 'subject_neutral'
-- per the precedent recorded in that file's header.
--
-- ── NAMING COLLISION, read before using this file ─────────────────────────
-- Desk E's DISPATCH ids and THE EYE's GATE ids both run D1..D7/D9 and they are
-- NOT the same thing. In this file and in FROZEN_SCOPE_0c3.md, Desk E dispatches
-- are written E1..E9 and THE EYE's gates keep their bracket form [D5]/[D6]/[D7].
-- Candidate 1 below is about THE EYE's gates, and is a prerequisite for Desk E's
-- dispatch E2 (the nlb rolling-branch fix), whose result it cannot verify.


-- ═══════════════════════════════════════════════════════════════════════════
-- Candidate 1 — CRITICAL, row_type incident.
-- THE EYE's three dense-motion gates ALL pass, by construction, on a scene that
-- never moved at all. Measured: Desk B ran two concepts to 35/35 PASS whose
-- frames are MD5-identical across t=0 / t=5000 / t=10000 / frozen.
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'eye_dense_motion_gates_all_pass_by_construction_on_a_totally_static_scene',
    'A field_3d concept that never moves a single pixel passes every one of THE EYE''s dense-motion gates and reports all-green — the three gates are individually reasonable and jointly cannot detect total failure',
    'CRITICAL',
    'peter_parker:visual_validator',
    'THE EYE has exactly three dense-motion gates and a fully static scene defeats all three at once, each for a different and individually defensible reason. (1) [D5] "Dense motion present" is the only gate that asserts pixels moved, and it runs ONLY when deriveMotionExpectations returned true for the state; otherwise it takes the else branch at pixelGate.ts:302-305 and reports "Skipped — motion expectation unknown", counted as a PASS. deriveMotionExpectations declares field_3d motion per scenario_type, and has NO newtons_laws_body branch — deliberately, and documented as such at deriveStateMeta.ts:2880 ("nothing is asserted about a repeating state''s pixels ... Nothing to fix in either derivation"). So for every nlb concept, the one gate that could catch a dead scene abstains. (2) [D7] "No stuck tail" computes stuck = tailFrozen && earlierMoved (pixelGate.ts:320-322). earlierMoved is diffs.slice(0,-tailPairs).some(d => d >= 0.001). In a totally static scene NOTHING moved, so earlierMoved is FALSE, so stuck is FALSE, and the gate reports the actively misleading "OK — no frozen tail". D7 is built to catch an animation that DIES mid-state; it requires the scene to have lived first, so the worse defect — never having started — is invisible to it. (3) [D6] "No mid-state pixel teleport" gates its whole search on med > DENSE_TELEPORT_MIN_MEDIAN (0.001) at pixelGate.ts:309; a static series has median 0, so spikeIdx is -1 and it passes. Net: zero motion produces three green D-rows plus a green headline. Measured by Desk B on two rolling concepts: 35 of 35 checks PASS while MD5 over the dense captures returns ONE hash across t=0, t=5000, t=10000 and the frozen pin. The composition is the defect — no single gate is wrong on its own terms, which is why this survived review. This is the same silent-abstention family the chapter has now hit four times: the unknown-readouts-token skip (field_3d_renderer.ts:50163), the NaN guard in the rbr restart anchor (:49918), the starved motion map (findings_c PASS 14), and this.',
    'A gate that DECLINES to run must never be counted as a gate that PASSED. Three changes, and the first is the load-bearing one. (a) Add an absolute-floor stillness assertion that does not depend on expectsMotion: if EVERY adjacent pair in the dense series is below DENSE_MOTION_EPSILON for the WHOLE state — not merely the tail — that is a dead scene, and it must FAIL (or at the very least emit a loud non-pass status) regardless of whether motion was declared. A concept whose every frame is byte-identical is never a correct result. (b) THE EYE must not print an all-green summary while gates are abstaining: report "N passed, M skipped" and refuse the clean-bill headline when the motion map is entirely "?" — a skip count next to the pass count would have exposed this immediately, and the same fix answers findings_c PASS 14''s open office question. (c) The general rule, which is the same lesson F-C8 taught on the L-arrow probe: PAIR EVERY DELTA ASSERTION WITH AN ABSOLUTE FLOOR. D5, D6 and D7 are all delta assertions; not one of them can distinguish "it changed acceptably" from "there is nothing there to change". Note this row does NOT ask for a newtons_laws_body branch in deriveMotionExpectations — that omission is deliberate and correct, and adding one to paper over this would over-declare motion on legitimately repeating states.',
    'js_eval',
    'Construct a dense frame series of N >= 8 byte-identical PNGs (any real capture duplicated is sufficient) and run the pixelGate dense block over it with expectsMotion undefined and holdExpectation undefined — i.e. exactly the nlb path. Assert that the returned results do NOT contain a passing [D5], [D6] and [D7] triple. Today all three pass: [D5] "Skipped — motion expectation unknown", [D6] "OK — no adjacent pair exceeds max(20%, 8x median=0.00%)", [D7] "OK — no frozen tail". Second leg, end to end: seed any newtons_laws_body concept whose scene is static, run npm run visual:eyes, and assert the headline is not all-pass. Cross-check with md5sum over the STATE_n__dense_t*.png set — a single hash across the series is proof of a dead scene, and is the check that caught this.',
    'OPEN',
    ARRAY['pure_rolling', 'rolling_on_incline']::text[],
    ARRAY['src/lib/validators/visual/pixelGate.ts', 'src/scripts/visual_eyes.ts']::text[],
    'rotmech Phase 0c-3 — Desk E frozen-scope build 2026-08-05',
    'incident'
);


-- ═══════════════════════════════════════════════════════════════════════════
-- Candidate 2 — CRITICAL, row_type incident. Dispatch E2.
-- The newtons_laws_body rolling branch (SEAM R) had a DYNAMIC availability gate
-- and no KINEMATIC one, so on flat ground it adopted rolling on frame 1 for a
-- body whose contact was demonstrably sliding. FIXED in this dispatch.
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_rolling_branch_has_no_kinematic_gate',
    'A rolling body on FLAT ground adopts the rolling branch on frame 1 no matter what its spin is — the gate tests only whether the friction rolling demands is available, which on flat ground is the vacuous 0 <= mu_s*N',
    'CRITICAL',
    'peter_parker:field3d_surgeon',
    'SEAM R gated the rolling branch on ONE test — canRoll = |f_roll| <= mu_s*N — which is a DYNAMIC availability question ("is the friction rolling demands available?"). On an incline that is the complete and correct gate: drive = m*g*sin(theta) is nonzero, so it reduces exactly to mu_s >= (k/(1+k))*|tan theta|, which is what the seam header derives. On FLAT ground drive is identically 0, so a_roll = drive/(m*(1+k)) = 0 and f_roll = -k*m*a_roll = 0 on EVERY frame REGARDLESS of the body''s actual (v, omega), and the test degenerates to 0 <= mu_s*N — true for any mu_s >= 0. Nothing anywhere in the branch tested the KINEMATIC rolling condition v = omega*R. A wheel launched sliding (v0 = 2.0 m/s, omega0 = 0) therefore took the rolling branch on frame 1, with four traced consequences: (1) a = a_roll = 0 and f = f_roll = 0, so v never decelerated and the friction readout showed a dishonest 0.00 N beside a contact speed of 2.00 m/s; (2) the omega = v/R line is guarded by !_spinIndep, and authoring omega0_rad_s sets _spinIndep, so omega fell to nlbRollSpin''s lazily-created default segment whose alpha is 0 and stayed FROZEN at its seed forever; (3) _slipping is only ever set inside the kinetic branch, which rollHeld pre-empted, so the capture re-anchor could never fire; (4) the alternative authoring (omega0_rad_s with no rolling flag) was an equally dead end, because the kinetic branch''s two halves disagree about what a slipping body is — vRef is contact-relative under (rolling || _spinIndep) but the angular sub-block that integrates omega was gated on rolling ALONE. Net: a wheel authored per the approved design glided at constant v with its spin frozen, no deceleration, no spin-up, no capture. Measured (standalone port of the branch, fixed 1/60 s steps): v held at 2.0000 m/s and R*omega at 0.0000 for the entire run. A SECOND defect surfaced the moment the gate was added: a plain tolerance band |v - omega*R| < NLB_STOP_EPS_V (0.01 m/s) is NARROWER THAN ONE STEP of contact closure — 0.0245 m/s at a single 1/60 s step for pure_rolling STATE_7, 0.0706 m/s at the 3-step dtStep the master clock hands over on a slow frame — so the branch steps straight over the crossing and the contact chatters about zero forever, never rolling. Measured on the STATE_8 slider grid: 76 of 126 (omega0, mu_k, step-size) combinations NEVER captured with a band test alone. THE EYE cannot see any of this: deriveMotionExpectations has no newtons_laws_body branch, so [D5] abstains, and a scene that never moved defeats [D6] and [D7] by construction (see Candidate 1 in this file).',
    'A CONSTRAINT BRANCH NEEDS BOTH ITS GATES — the dynamic one (are the constraint forces available?) AND the kinematic one (is the constraint currently SATISFIED?). Checking only availability is safe wherever the drive term is nonzero and silently vacuous wherever it is zero, which is exactly the flat-ground case the concept was built to teach; a gate that reduces to 0 <= x is not a gate. Corollaries, each of which cost a separate diagnosis here: (a) a tolerance band on a quantity that is being driven to zero must be compared against |rate|*dt, not chosen for readability — where the per-step change can exceed the band, pair the band with a CROSSING test (does this step carry the quantity through zero?), the same idiom the translational rest test in this integrator already uses; (b) when two halves of one physical transition are gated separately, the gates must be spelled IDENTICALLY — vRef used (rolling || _spinIndep), the angular integrator used rolling, and the disagreement made one authoring path silently half-work; (c) a capture must SNAP the constrained quantity, not merely re-anchor at the pre-capture value: with alpha = a/R and dv/dt = a the two stay exactly parallel, so any gap present at the anchor never closes (measured: contact pinned at 0.0087 m/s forever, i.e. a HUD reading 0.01 under a caption claiming the contact is at rest); (d) a gate that reads a live quantity must read a SEED-SAFE one — b.omega is 0 at apply while b.omega0 carries the authored seed, and a gate reading b.omega alone mis-branches on frame 1 and loses the authored spin permanently.',
    'js_eval',
    'Port the Branch A inner loop (the rolling gate, the capture block, the kinetic branch and nlbRollSpin) into a standalone driver and run the flat launch: theta 0, m 1, R 0.25, k 0.5 (wheel), v0 2.0, omega0 0, mu_s = mu_k = 0.05. ASSERT (1) v strictly DECREASES and R*omega strictly INCREASES on every pre-capture frame; (2) they converge at the analytic t_c = v0*k/(mu_k*g*(1+k)) = 1360.5 ms — capture must land within one step of it; (3) after capture max|contact| == 0 and max|f| == 0 for the rest of the run; (4) the capture survives every step size the master clock produces — repeat with h in {1/60, [0.016,0.032], 0.048, [0.016,0.048,0.032]} and assert capture never fails; (5) sweep the STATE_8 sliders (omega0 0..7.2 x mu_k 0.02..0.4 x both clocks) and assert capture occurs and does not flip back in every cell. BACK-COMPAT leg, which is the one that must be run on every future edit to this branch: replay EVERY body of EVERY state of rolling_on_incline and pure_rolling through both the pre-change and post-change functions for 300 frames and diff t/rollHeld/stuck/a/f/v/s/omega/theta bitwise — the ONLY body-state permitted to differ is the one being fixed. Measured here: 25 of 26 body-states bit-identical under both the fixed 1/60 clock and the variable 0.016/0.032/0.048 clock, the sole DIFF being pure_rolling/STATE_7/wheel; rolling_on_incline was 17 of 17 identical INCLUDING its STATE_7 mu_s param_ramp slipping state. DETERMINISM leg: re-running from t=0 to frame N must reproduce frame N bit-for-bit, and five consecutive dt=0 pin frames (mid-slip AND post-capture) must leave every quantity bit-identical — no latch.',
    'FIXED',
    ARRAY['pure_rolling', 'rolling_on_incline']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'rotmech Phase 0c-3 — Desk E dispatch E2 2026-08-05',
    'incident'
);
