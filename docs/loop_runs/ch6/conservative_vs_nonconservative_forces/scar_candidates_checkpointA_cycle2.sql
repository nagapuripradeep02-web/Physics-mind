-- Checkpoint A CYCLE 2 scar candidates — ch6 concept #5
-- Source: docs/loop_runs/ch6/conservative_vs_nonconservative_forces/founder_proxy_A_cycle2.md
--
-- ⚠️ ORDER IS LOAD-BEARING: row 6 below is a CORRECTION to row 2 of
-- scar_candidates_checkpointA.sql, which the reviewer authored at cycle 0 and which was
-- PROVEN IMPOSSIBLE at cycle 2. Apply scar_candidates_checkpointA.sql FIRST, then this file.
--
-- ⚠️ APPLY HAZARD: verify no row here is already FIXED in the live table before applying —
-- a verbatim apply would reopen a closed row and discard its fixed_at. Row 5 is filed FIXED
-- deliberately (it was fixed and verified this session); do not flip it back to OPEN.

-- 5) The systemic gap found while adjudicating the F3 rejection: two renderer contracts
--    claimed THE EYE audits a console prefix NO capture in the repo could see.
--    FIXED on master 2026-08-07 — screenshotter.ts now collects [PM_*] console.warn into a
--    separate diagnostic_warnings channel written to the run manifest, deliberately NOT into
--    console_errors (which would have turned a visibility fix into a new hard gate).
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'renderer_selfdiagnostics_emitted_as_console_warn_are_invisible_to_every_gate',
  'The nlb energy-scale and track-clamp guards warn via console.warn, but every console capture filtered type()=error, so both self-diagnostics never reached a gate — while two contract comments assert THE EYE asserts zero of them',
  'MAJOR',
  'peter_parker:field3d_surgeon',
  'nlbEnWarnOnce (field_3d_renderer.ts L44898-44902) and nlbEnergyClampGuard (L44669-44686) both use console.warn, which Playwright types as warning. screenshotter.ts L318, founder_drive.ts L111 and numeric/probeHarness.ts L377 each recorded only m.type()===error. The contract comments at L1871-1874 ("the same prefix THE EYE asserts zero of") and L44672-44674 ("fails loudly at THE EYE console audit") were therefore false, and an overflowing work ledger or a bound-clamped energy layer shipped silently on every concept.',
  'A renderer self-diagnostic is only real if a gate can see it. Emit authoring-fault diagnostics at console.error, or widen the capture to record warning-level output into a separate manifest field. Never write a contract comment asserting an assertion without opening the consumer and confirming the filter — a comment that names an enforcement mechanism IS a claim, and this one shaped a Checkpoint A design decision before anyone checked it.',
  'js_eval',
  'Load a concept, drive a state authoring work_accumulators with a deliberately undersized work_scale_J, and assert the run manifest records the [PM_NLB_ENERGY_SCALE] occurrence under diagnostic_warnings. Independently grep every page.on(console) handler in src/ and assert none silently drops warning-level output for prefixes the renderer documents as gate-asserted.',
  'FIXED',
  ARRAY['conservative_vs_nonconservative_forces','work_done_by_constant_force','positive_negative_zero_work','kinetic_energy_definition','conservation_of_mechanical_energy']::text[],
  ARRAY['src/lib/validators/visual/screenshotter.ts','src/lib/validators/visual/frameDump.ts']::text[],
  'ch6 concept #5 founder_proxy Checkpoint A cycle 2 (2026-08-07)',
  'incident'
);

-- 6) CORRECTION to row 2 of scar_candidates_checkpointA.sql. Its prevention_rule ended with
--    an instruction now PROVEN IMPOSSIBLE; applied as written it sends the next architect
--    down a path no configuration of this engine can satisfy. UPSERT on the same bug_class.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'nlb_work_bar_zero_crossing_reading_is_unrenderable_at_teaching_speed',
  'A state claiming a work bar READS a particular value as a moving body passes a point asserts a number the renderer will show in roughly one frame in sixteen, and never in the frozen baseline',
  'CRITICAL',
  'alex:architect',
  'Unchanged on the reading defect (nlbEnFx 1 dp, |x|<0.05 clamp, ledger advancing F_along*v*16.7 ms per frame). CORRECTED 2026-08-07: the cycle-0 prevention_rule also instructed the author to "size loop_reset_ms so the firing precedes the 0.60R pin". That is IMPOSSIBLE for a closure stamp. The frozen pin is clamp(0.60R,150,R-150) (deriveStateMeta L3097-3109), so firing-before-pin forces a post-crossing tail tau >= 0.667*t_r + 0.333 s; on a slope the body accelerates through the whole tail, and the tail travel is never less than about 4.4x the up-flight (measured 6.5x frictionless, 4.7x at mu=0.3) — so the ledger at loop end is 4-7x the teaching peak and either clamps at full deflection under NLB_ENERGY_SCALE_WARN_PREFIX or forces a scale on which every taught number reads under 20 percent. Truncating the tail at the track bound is also closed: nlbEnergyClampGuard (L44669-44686) freezes the bars and warns whenever a body reaches a bound while energy_active, which work_accumulators alone makes true (L44504).',
  'Before asserting that a work bar READS a value at a moving instant, compute the per-frame ledger step F_along * v * 16.7 ms and confirm it is smaller than the display precision window; if it is not, the number is not renderable and must not be narrated or captioned. Express the claim instead as a LATCHED checkpoint stamp: a flag authored at exactly initial_position_m adopts side +1 at t=0 without firing (L46107-46108), fires once per cycle on the return crossing, and nlbCpFrac interpolates to s_m so the stamp is exact and holds to the reset. DO NOT then try to pull the firing before the 0.60R pin — that is unreachable (see root_cause). Instead: (a) declare in the skeleton that the latch is a LIVE-RECURRING beat the pin deliberately does not photograph, and request the Gate-8 exemption explicitly; (b) size loop_reset_ms to MAXIMISE the latch dwell against the track inset, not merely to clear the crossing — the dwell is the whole delivery of the claim; (c) narrate the latch off the zero crossing of the bar, a multi-hundred-ms geometric event at the same instant; (d) if the still must carry the claim, that is an ENGINE request (an authored frozen-pin phase for nlb loop states), never an authoring re-tune.',
  'js_eval',
  'For every guided state whose skeleton, caption, formula surface or narration asserts a specific work-bar reading: (a) drive one full loop at the fixed step and assert the asserted string appears either in the rendered bar value for at least 10 consecutive frames OR in a latched checkpoint stamp for at least 10 consecutive frames; (b) capture the state at its deriveStateMeta frozen pin and assert the claim is present as bar numeral or latched stamp, OR that the skeleton carries a written exemption naming the impossibility. A claim satisfied by none of these is this bug.',
  'OPEN',
  ARRAY['conservative_vs_nonconservative_forces','work_done_by_constant_force','positive_negative_zero_work']::text[],
  ARRAY[]::text[],
  'ch6 concept #5 founder_proxy Checkpoint A cycle 2 (2026-08-07)',
  'directive'
)
ON CONFLICT (bug_class) DO UPDATE SET
  root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule,
  probe_logic = EXCLUDED.probe_logic;

-- 7) The reviewer-side lesson from the cycle-0 error.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'worked_loop_resize_patch_bounded_at_the_pin_instant_instead_of_the_loop_end',
  'A review patch that lengthens loop_reset_ms bounded the work ledger at the frozen-pin instant and never carried it to the loop end, understating the real excursion by 8.7x and prescribing a state that clamps both bars every cycle',
  'MAJOR',
  'alex:architect',
  'Checkpoint A cycle 0 proposed s0=+0.1, v0=4, R=2900 for a round-trip state and quoted the green tail as +15.4 J (22 percent of a 70 J scale). +15.4 J is the value 247 ms into a 1407 ms tail. The body accelerates through the whole tail: D = 5.496 m, gravity +134.6 J and friction -97.3 J at the loop end, both over scale, both clamping at full deflection. The patch was written to fix a claim-the-renderer-cannot-show defect and would have shipped a worse one.',
  'Any loop_reset_ms proposal — from an author or a reviewer — states the bounding quantities at the LOOP END and at the track bound, never at the pin instant alone: end position vs the authoring inset, and every ledger extreme vs work_scale_J with one frame of slack. On an accelerating track the last third of the tail carries most of the travel, so a pin-instant bound is not a bound. A reviewer worked patch carries the same burden of proof as an authored one; the architect is expected to re-derive it and to REJECT it with arithmetic, and a rejection backed by numbers read at source outranks the review that proposed it.',
  'js_eval',
  'For every state authoring loop_reset_ms with work_accumulators: integrate the authored acceleration to t=loop_reset_ms and assert (a) abs(s_end) <= surface.length_m - 0.55 with two frames of slack, and (b) every abs(W) at t=loop_reset_ms is below work_scale_J with one frame of slack. Assert zero manifest diagnostic_warnings beginning [PM_NLB_ENERGY_SCALE] over three full loops.',
  'OPEN',
  ARRAY['conservative_vs_nonconservative_forces']::text[],
  ARRAY[]::text[],
  'ch6 concept #5 founder_proxy Checkpoint A cycle 2 (2026-08-07)',
  'directive'
);
