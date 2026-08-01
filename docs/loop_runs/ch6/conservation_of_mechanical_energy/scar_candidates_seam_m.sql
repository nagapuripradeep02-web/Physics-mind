-- Ch.6 conservation_of_mechanical_energy — Phase-0 stage 0c, SEAM M
-- (the energy layer's TEACHING INSTRUMENTS on newtons_laws_body).
-- Engine scar CANDIDATES. NOT APPLIED. No agent executes these; the founder
-- reviews and applies. Upsert key is bug_class: a recurrence UPDATEs/reopens
-- its row, never a duplicate INSERT. Columns are the 13 authored columns of
-- the 16-col engine_bug_queue schema.
-- Authored by peter_parker:field3d_surgeon, dispatch 2026-08-01.

-- ============================================================
-- 1. The DISPATCHED bug_class — fixed by this seam.
-- ============================================================
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_energy_layer_has_no_teaching_instruments',
    'The newtons_laws_body energy layer could compute and display energy but had no way to STAGE a lesson on it',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'SEAM K derived K, U_grav and U_spring every frame and SEAM L drew them as a stacked column, but a teacher had no instrument to teach WITH: no reveal that assembles the sum from its parts, no reference line to measure a height from, no predicted stop to test a claim against, no signed work ledger, and no way to capture the numbers at a named place. The layer could state a result but could not run an argument. Worse, two of the missing pieces were load-bearing for correctness rather than only for pedagogy: without a work accumulator the E_dissipated scope clause (E(t0) + W_applied - (K + U + Us)) could not be completed, so any state with an applied force would have read its own drive as dissipation; and without a phase-aware frozen-pin rule a loop_reset_ms state could mint its H2 baseline on a restart frame, i.e. on the home pose with every bar back at its seed value.',
    'An energy DISPLAY and an energy LESSON are different deliverables. When a display layer lands, name the instruments the lesson needs in the same spec pass (reveal cue, reference line, computed prediction, signed ledger, capture-on-pass) and check which of them are secretly correctness requirements rather than pedagogy — a term in a scope clause and a frozen-pin instant both look like polish and are not.',
    'js_eval',
    'For any state authoring work_accumulators, assert PM_nlbWork holds one signed entry per authored force and that a force of kind normal is EXACTLY 0 for every frame. For any state authoring height_markers.predicted_stop, assert PM_nlbMarkers.predicted_stop_m equals s0 + sign(v0) * v0^2/(2*9.8*sin(theta)) to 1e-9 AND that PM_nlbMarkers.meshes.marker_true.visible is true (presence of the number is not presence of the marker).',
    'FIXED',
    ARRAY['conservation_of_mechanical_energy','work_done_by_constant_force','positive_negative_zero_work','work_energy_theorem','conservative_vs_nonconservative_forces','mechanical_energy_loss_with_friction','instantaneous_power','average_power']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts','src/lib/validators/visual/deriveStateMeta.ts']::text[],
    'ch6 Phase-0 stage 0c SEAM M (teaching instruments) 2026-08-01',
    'incident'
);

-- ============================================================
-- 2. DIRECTIVE — found and fixed during this build, by a negative control.
--    The probe that caught it: a state deliberately mis-authored on BOTH the
--    bar scale and the ledger scale reported only ONE of the two faults.
-- ============================================================
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_two_authoring_faults_share_one_warn_once_latch',
    'Two independent authoring guards sharing a single warn-once flag silence each other, so an author fixes one fault and ships the second',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'A warn-once latch exists so a per-frame check cannot drown the console. SEAM L introduced one flag (_en_scale_warned) for the energy bar scale guard; SEAM M then reused the SAME flag for the work-ledger scale guard because both emit under the same console prefix. Whichever fired first set the flag and the other never spoke. The two guards report DIFFERENT authoring mistakes (bar_max_J too small / h_ref_m above the lowest point vs work_scale_J too small), so a concept mis-authored on both would be corrected on one, re-run, and pass — while the second fault was still there. Caught only because a deliberately mis-authored negative-control state expected two warnings and produced one.',
    'A warn-once latch is scoped to a DIAGNOSIS, never to a console prefix. Two guards may share a prefix (so one EYE assertion covers both) but must never share a flag. When adding a guard beside an existing one, give it its own latch and add it to the same reset funnel.',
    'js_eval',
    'Author a probe state that violates two guards at once under a single console prefix and assert BOTH distinct messages appear. A prefix count of 1 where 2 faults exist is the failure.',
    'FIXED',
    ARRAY['conservation_of_mechanical_energy']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'ch6 Phase-0 stage 0c SEAM M (teaching instruments) 2026-08-01',
    'directive'
);

-- ============================================================
-- 3. DIRECTIVE — measured, not assumed. The number is in the seam report.
-- ============================================================
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_pinned_rewind_reproduces_the_instant_but_not_the_last_float_bit',
    'A SET_TIME_FREEZE rewind returns to the same virtual instant but not to the same float, so any unrounded derived value written into a style string can move a pixel',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'animate() CRAWLS to freezeAtTime rather than jumping to it: the clock free-runs at the fixed step until time + dtStep >= freezeAtTime, then takes one partial step of the remainder and holds. The remainder depends on how many animation frames the host delivered, so a pin at 3000 ms reached after a 9000 ms detour accumulates a very slightly different float path to the SAME virtual instant. Measured on this seam: pin 3000 -> 9000 -> 3000 reproduced t_ms exactly (2992 both times) and every rendered DOM string identically, while the raw published floats differed in the 15th significant digit (E_display 55.600000000000094 vs 55.600000000000136; the integrator position s differed too, so the divergence is inherited from the integrator, not from any one layer). The exposure is that a DERIVED percentage or offset written straight into a style attribute carries that last bit into the DOM, where only the browser CSSOM normalisation happens to absorb it.',
    'Any value computed from integrator state and written into a style string (a percentage height, a pixel offset, a transform) is ROUNDED before it is written. Frozen-frame byte-identity must be a property of the code, not of the CSSOM normalising a long float. The same rule already covers measured layout rects (round to whole pixels); this extends it to derived physics magnitudes.',
    'js_eval',
    'Drive RESET -> pin(T) -> RESET -> pin(T2) -> RESET -> pin(T) and diff the FULL DOM style snapshot of the scenario overlays. Any key that differs is a defect; a difference confined to the raw PM_* float mirrors is expected and acceptable.',
    'OPEN',
    ARRAY['conservation_of_mechanical_energy']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'ch6 Phase-0 stage 0c SEAM M (teaching instruments) 2026-08-01',
    'directive'
);

-- ============================================================
-- 4. DIRECTIVE — the general form of the accumulator trap this seam avoided.
-- ============================================================
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_path_integral_accumulator_bills_a_teleport_as_displacement',
    'A path integral over position pays for every remap the engine performs, so a wrap, a loop reset or a bound clamp lands in the ledger as a huge phantom quantity',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'newtons_laws_body moves a body by three mechanisms that are NOT displacement: the sandbox wrap teleports s across the whole track and re-seeds v (SEAM J), loop_reset_ms snaps the kinematics back to the home pose (SEAM K), and the geometric bound clamp remaps s to the track end. A naive integral of F.ds over consecutive frames pays for all three: one wrap of a 24 m track under gravity would have added roughly 235 J to a ledger whose real scale is tens of joules, and the bar would have pinned at full deflection for the rest of the state. The reset funnel already re-zeros the ledgers at a wrap, but the teleport displacement is produced in the SAME frame as the reset, so the reset alone is not sufficient.',
    'Every path-integral accumulator carries a magnitude sanity gate on its own increment, sized from the apparatus (here: discard any single-step |ds| greater than half the track span) and INDEPENDENT of the reset funnel — because a remap and its reset happen in the same frame. Do not rely on remembering to flag each remap site; a new remap site added later will not know about the ledger.',
    'js_eval',
    'Drive a sandbox state with a work_accumulators block until the body wraps at least twice and assert that no ledger ever exceeds the authored work_scale_J by more than the physical maximum for one lap.',
    'FIXED',
    ARRAY['conservation_of_mechanical_energy','mechanical_energy_loss_with_friction']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'ch6 Phase-0 stage 0c SEAM M (teaching instruments) 2026-08-01',
    'directive'
);
