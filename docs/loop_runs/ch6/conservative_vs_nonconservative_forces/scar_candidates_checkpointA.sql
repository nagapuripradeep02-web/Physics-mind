-- Checkpoint A scar candidates — ch6 concept #5 conservative_vs_nonconservative_forces
-- Source: docs/loop_runs/ch6/conservative_vs_nonconservative_forces/founder_proxy_A.md (cycle 0)
--
-- Reviewer checked these against the other candidate files in this run for bug_class
-- collisions (none found) and verified the enums against the live CHECK constraints.
--
-- ⚠️ APPLY HAZARD (recorded in this chapter, concept #2): row 4 is an UPSERT that
-- REWRITES A CRITICAL ROW'S PROBE. Apply it ONLY if the adjudication in F4 is accepted.
-- Before applying, verify no row here is already FIXED in the live table — a verbatim
-- apply would silently reopen a closed row and discard its fixed_at.

-- 1) The design lesson from F1/F2. New class.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'nlb_angle_arc_to_displacement_measures_net_travel_so_it_hides_after_a_turnaround',
  'An angle_arc authored {from:''friction'', to:''displacement''} reads 180 deg only until the body turns around, then collapses below NLB_FANG_MIN_DEG and is set visible=false — a state claiming a constant "angle to the motion" renders nothing for the half of its loop that carries the claim',
  'CRITICAL',
  'alex:architect',
  'nlbFangDir(''displacement'') resolves s minus nlbDispOrigin(b) — the NET displacement from the authored home pose, not the instantaneous velocity. On the return leg the body is still above home, so displacement still points up-slope while friction has flipped up-slope too; the two are parallel, mag < NLB_FANG_MIN_DEG = 1.5, and both the arc and its label are hidden (field_3d_renderer.ts L45835-45838, L45924-45929, L45697). The closed enum has no velocity/motion token, so the claim is not expressible.',
  'A state whose claim is an ANGLE TO THE MOTION may not author angle_arc against ''displacement'': that token measures net travel from the home pose and is only parallel to the motion before the first turnaround. Where the motion reverses inside the loop, either state the angle against ''surface'' (a fixed reference, which honestly reads 180 deg then 0 deg) or drop the arc and carry the reversal with the force arrow plus a two-pass checkpoint stamp. The architect must name, per instrument, the exact vector the engine resolves — never the vector the physics sentence means.',
  'js_eval',
  'For every state authoring newtons_laws_body.angle_arc: drive the state through one full loop_reset_ms period sampling every 50 ms; assert the arc mesh and its label have .visible === true at every sample at which the skeleton or narration asserts an angle value, and assert the rendered label text matches the asserted value to within 1 degree. An arc that is invisible at any asserted instant is this bug.',
  'OPEN',
  ARRAY['conservative_vs_nonconservative_forces']::text[],
  ARRAY[]::text[],
  'ch6 concept #5 founder_proxy Checkpoint A cycle 0 (2026-08-07)',
  'directive'
);

-- 2) The design lesson from F3. New class.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'nlb_work_bar_zero_crossing_reading_is_unrenderable_at_teaching_speed',
  'A state claiming a work bar READS a particular value as a moving body passes a point asserts a number the renderer will show in roughly one frame in sixteen, and never in the frozen baseline',
  'CRITICAL',
  'alex:architect',
  'nlbEnFx rounds to the authored precision (default 1 dp, |x| < 0.05 clamped to 0), while the ledger advances F_along * v * 16.7 ms per rendered frame. On a 30 deg incline at 4 m/s that is 1.63 J per frame, so the 0.1 J-wide display window is crossed in about 1 ms — 6 percent of playthroughs ever render "0.0 J". Separately, the SEAM M frozen pin is fixed at 0.60 * loop_reset_ms, so a claim landing near the end of the loop is absent from every H2 baseline and from the only still a teacher sees when they pause.',
  'Before asserting that a work bar READS a value at a moving instant, compute the per-frame ledger step F_along * v * 16.7 ms and confirm it is smaller than the display precision window; if it is not, the number is not renderable and must not be narrated or captioned. Express the claim instead as a LATCHED checkpoint stamp: a flag authored at exactly initial_position_m adopts side +1 at t=0 without firing, fires once per cycle on the return crossing, and nlbCpFrac interpolates to s_m so the stamp is exact and holds until the loop reset. Then size loop_reset_ms so the firing precedes the 0.60R pin by at least 167 ms with the loop end inside the authored track inset.',
  'js_eval',
  'For every guided state whose skeleton, caption, formula surface or narration asserts a specific work-bar reading: (a) drive one full loop at the fixed step and assert the asserted string appears in the rendered bar value for at least 10 consecutive frames; (b) capture the state at its deriveStateMeta frozen pin and assert the asserted claim is present in the frame as either the bar numeral or a latched checkpoint stamp. A claim satisfied by neither is this bug.',
  'OPEN',
  ARRAY['conservative_vs_nonconservative_forces','work_done_by_constant_force','positive_negative_zero_work']::text[],
  ARRAY[]::text[],
  'ch6 concept #5 founder_proxy Checkpoint A cycle 0 (2026-08-07)',
  'directive'
);

-- 3) F5 — engine ride-along, shipped on #1/#2/#3. New class.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'nlb_energy_numerals_emit_ascii_hyphen_minus_instead_of_u2212',
  'Every negative work-bar value and checkpoint stamp on newtons_laws_body renders an ASCII hyphen-minus, breaking Rule 34c on three shipped concepts',
  'MODERATE',
  'peter_parker:field3d_surgeon',
  'nlbEnFx returns x.toFixed(d) + " J" (field_3d_renderer.ts L44876-44881) with no minus substitution. Other scenarios in the same file DO substitute — .replace("-", "−") at L65426 and L65576 — so this is an omission on the nlb path, not a house convention. Affects the bar numerals and every capture:[''W''] stamp.',
  'Any renderer-side numeric formatter whose output reaches a DOM overlay, a canvas fillText call or a 3D sprite label substitutes U+2212 for the leading ASCII hyphen at the formatter, not at each call site. A Rule 34c sweep that fixes call sites and not formatters silently re-breaks on the next call site.',
  'js_eval',
  'Load each newtons_laws_body concept, drive every state to a beat with a negative work value, and assert no textContent under #nlb_energy or #nlb_formula matches /(^|[\s=])-\d/. Any ASCII hyphen immediately preceding a digit in a rendered numeral is this bug.',
  'OPEN',
  ARRAY['work_done_by_constant_force','positive_negative_zero_work','kinetic_energy_definition','conservative_vs_nonconservative_forces']::text[],
  ARRAY[]::text[],
  'ch6 concept #5 founder_proxy Checkpoint A cycle 0 (2026-08-07)',
  'incident'
);

-- 4) F4 — PROBE CORRECTION on an existing CRITICAL row. Upsert on its own bug_class.
--    Apply ONLY if you accept the adjudication in F4; it rewrites a CRITICAL row's probe.
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
  'nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger',
  'A frictionless state whose applied force opposes the motion can never come to rest: it reverses at v=0 and the constant-force ledger climbs back to zero, erasing the sign the state teaches',
  'CRITICAL',
  'alex:architect',
  'Unchanged. PROBE SCOPE CORRECTED 2026-08-07: the probe is gated on a non-empty controls_visible, so it never reaches a guided state that authors no slider; and it false-fails mode:''sandbox'', where the SEAM J wrap legitimately re-zeroes every ledger each lap and loop_reset_ms is inert, so the row''s own seized-loop mechanism cannot occur.',
  'Unchanged, plus: this probe is scoped to states with a non-empty controls_visible AND a loop (loop_reset_ms, not mode:''sandbox''). A sandbox state is exempt and must be exempted with that reason stated, never silently skipped. A state whose taught claim IS a ledger returning to zero over a closed path (a round-trip / conservative-force concept) asserts instead: the gravity ledger stamps 0.0 J at an authored start-line checkpoint, and the friction ledger is monotone non-increasing between resets.',
  'js_eval',
  'For each state authoring work_accumulators with a non-empty controls_visible AND loop_reset_ms > 0 AND mode !== ''sandbox'': drive the state, fire ONE trusted slider input to seize the loop, run 20 s. Assert that with the slider value unchanged from its authored value, the sign of every rendered work bar never changes and |W_rendered| never falls below 60 percent of its authored peak. Independently assert the body velocity never changes sign while the authored along-force is nonzero and constant. Sandbox states and zero-control guided states are OUT OF SCOPE by construction.',
  'OPEN',
  ARRAY['positive_negative_zero_work','conservative_vs_nonconservative_forces','mechanical_energy_loss_with_friction']::text[],
  ARRAY[]::text[],
  'ch6 concept #5 founder_proxy Checkpoint A cycle 0 (2026-08-07)',
  'directive'
)
ON CONFLICT (bug_class) DO UPDATE SET
  root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule,
  probe_logic = EXCLUDED.probe_logic;
