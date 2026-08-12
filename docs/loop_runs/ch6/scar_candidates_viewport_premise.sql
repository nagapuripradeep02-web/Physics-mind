-- Chapter-level scar candidate — the EYE/teacher viewport mismatch
-- Source: measured directly by the dispatching session 2026-08-07 while verifying the
-- premise both concept #4 and concept #5 budget their energy panels against.
--
-- APPLIED 2026-08-09 (verified absent from the live table first, so no closed row was reopened).
-- Scar-apply hazard (recorded in this chapter, concept #2): the upsert below does
-- ON CONFLICT DO UPDATE SET status = EXCLUDED.status. Before applying, verify this row
-- is not already FIXED in the live table -- a verbatim apply would silently reopen a
-- closed row and discard its fixed_at.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('the_eye_captures_a_fixed_720px_sim_height_while_the_teacher_iframe_is_responsive',
 'THE EYE photographs every baseline at a fixed 1280x720 while the review-site sim iframe is fully responsive, so any layout that depends on a measure-and-reflow rung is verified at a height no teacher necessarily sees',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'visual_eyes.ts passes no viewport to captureSimStates, so it falls back to screenshotter.ts default req.viewport ?? {width:1280,height:720}, and buildWrapperHtml sets iframe{height:100%} on a 720px body -- every baseline is captured at 720px of sim height. Meanwhile build_review_site.ts styles #sim as width:100%;height:100% inside #stage{flex:1 1 auto;min-height:0}, so the teacher iframe is responsive. Measured on the built kinetic_energy_definition review site: 1280x720 window -> sim 1052x551; 1366x768 -> 1138x599; 1440x900 -> 1212x731; 1920x1080 -> 1692x911. The teacher height STRADDLES the EYE height -- 720 is not a bound, it sits between 551 and 911. Corrects the record in docs/loop_runs/ch6_state.md, which asserts the iframe "is 1052x551, not 1280x720 ... on EVERY screen including every baseline"; the baselines clause is false and 1052x551 is one measurement at one window size generalised into an invariant.',
 'A measure-and-reflow overlay must be authored to hold across the full teacher height range (~550-911 px), never to land on a specific rung. No cross-state visual comparison may depend on which rung the panel selected, because the baseline that would catch a rung change is captured at a third height the concept was never designed for. Where a concept genuinely needs rung stability, THE EYE must be given the teacher viewport explicitly rather than the author assuming one.',
 'js_eval',
 'Load the built review site for the concept at browser sizes 1280x720, 1440x900 and 1920x1080; at each, read the rendered sim iframe height and the resolved reflow step of every measured overlay. Assert the reflow step is identical at all three, OR that no authored cross-state claim references a quantity whose pixel geometry changes with the step. Separately assert the height THE EYE captures at equals at least one of the sampled teacher heights, or fail as unverifiable.',
 'OPEN', ARRAY['work_energy_theorem','conservative_vs_nonconservative_forces','kinetic_energy_definition','positive_negative_zero_work','work_done_by_constant_force']::text[], ARRAY[]::text[],
 'ch6-premise-check-dispatching_session-2026-08-07', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected;
