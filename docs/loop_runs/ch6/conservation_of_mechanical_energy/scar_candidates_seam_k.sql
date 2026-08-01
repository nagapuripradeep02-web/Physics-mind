-- Ch.6 conservation_of_mechanical_energy — Phase-0 stage 0c, SEAM K
-- (GENUINE spring physics on newtons_laws_body). Engine scar CANDIDATES.
-- NOT APPLIED. No agent executes these; the founder reviews and applies.
-- Upsert key is bug_class: a recurrence UPDATEs/reopens its row, never a
-- duplicate INSERT. Columns are the 13 authored columns of the 16-col
-- engine_bug_queue schema.
-- Authored by peter_parker:field3d_surgeon, dispatch 2026-08-01.

-- ============================================================
-- 1. The DISPATCHED bug_class — fixed by this seam.
-- ============================================================
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_spring_is_scripted_not_physical',
    'The newtons_laws_body spring was a scripted choreography with no force law, so no honest energy quantity could be derived from it',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'spring_action (2026-07-30) made the coil LOOK real by scripting its length and its carts from a closed form of the wall phase (approach / compress / hold / release / coast) and holding the pair in a latch until release. The picture was honest; the physics was not. There was no k, no F = -kx and no compression state anywhere in the engine, so the stored energy had no expression: an energy layer could not compute Us = 0.5*k*x^2 because neither k nor x existed, and a "conservation of mechanical energy" concept built on that apparatus would have been asserting a sum it could not compute. The founder ruling 2026-08-01 resolves it: build the real spring and slow the PLAYBACK over it, preserving the 2026-07-30 directive intent (a real spring bounces too fast to teach from) and replacing only its mechanism.',
    'When a concept teaches a QUANTITY that a piece of apparatus stores, that apparatus needs a real constitutive law in the integrator, not a choreography that resembles one. The legibility problem a script was solving (the event is too fast) is a PLAYBACK problem and is solved by scaling the integrator dt inside a detected window, with a visible slow-motion badge — never by replacing the dynamics.',
    'js_eval',
    'With spring.k_N_per_m authored, assert PM_nlbSpringK > 0, PM_nlbSpringX > 0 for at least one frame of a contact, and PM_nlbSpringForceN === PM_nlbSpringK * PM_nlbSpringX to 1e-9 on every frame.',
    'FIXED',
    ARRAY['conservation_of_mechanical_energy','elastic_potential_energy_spring','newton_third_law']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'ch6 Phase-0 stage 0c SEAM K (genuine spring physics) 2026-08-01',
    'incident'
);

-- ============================================================
-- 2. DISCOVERED while building it — measured, not theorised.
-- ============================================================
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'contact_detected_slow_window_arms_one_frame_late_and_buries_the_body_at_full_dt',
    'A contact-detected dt window tested on the PRE-step position arms one frame late, so the first contact frame runs at full dt and the body gains potential energy nothing did work for',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'The natural way to write a contact-detected slow window is "overlap > 0 this frame => shrink dt". But on the frame BEFORE that test first passes, the overlap is still zero, the contact force is therefore zero, and the step is taken at the FULL dt — so the body travels up to v*dt straight INTO the spring with no force resisting it, and arrives already holding 0.5*k*(v*dt)^2 of potential energy that no work produced. Measured on the ch6 apparatus (m = 2 kg, k = 370 N/m, theta = 30, slow_factor 6, dt = 1/60): max|E_display - E(t0)| was 0.0216 J with the late arm and 0.0052 J with a one-step lookahead; on the flat-surface case (9 J total) it was 0.1156 J vs 0.0016 J — a 72x difference, and over the 0.05 J acceptance bar. It also reads wrong: the block SNAPS into the coil instead of settling into it.',
    'Arm a contact-detected dt window on a ONE-STEP LOOKAHEAD (overlap > -|v_rel| * dt_full), not on the current overlap. The lookahead is self-sustaining — once armed the step shrinks, so the remaining distance cannot be closed in one frame either — and it costs only a few slowed frames before touch, which is the beat the teaching wants anyway.',
    'js_eval',
    'Drive the body into the spring and record PM_nlbEnergy.E_display every frame; assert max|E_display - E_display(first frame)| stays below the state''s acceptance bar ACROSS the contact-entry frame specifically, not only over the compression.',
    'OPEN',
    ARRAY['conservation_of_mechanical_energy','elastic_potential_energy_spring']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'ch6 Phase-0 stage 0c SEAM K (genuine spring physics) 2026-08-01',
    'directive'
);

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'derived_energy_sum_pairs_prestep_position_with_poststep_velocity',
    'A derived energy panel reads its potential term from the pre-step position and its kinetic term from the post-step velocity, putting an O(dt) hole in the sum it exists to show constant',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'A semi-implicit integrator DELIBERATELY evaluates its force at the position the frame started at — that is what makes the step symplectic. The natural implementation stores the position-derived quantities (compression x, height h) at that input stage and lets the presentation pass read them back. But the presentation pass runs AFTER the writeback, where v is already the NEW velocity. The published sum is then evaluated at two different instants, which is not a state function at all: the mismatch is first order in dt and it appears as a slow breathing of the total exactly where a conservation concept is claiming the total does not move. It is invisible to any check that only asks whether the individual bars look plausible.',
    'A state function must be evaluated at ONE instant. Re-derive every position-dependent term from the POST-step positions inside the publish pass (that is also the instant the geometry is drawn at and the instant the velocity belongs to); keep the integrator''s own pre-step value local to the force computation and never publish it.',
    'js_eval',
    'At the frame of maximum compression, assert PM_nlbSpringX matches the compression implied by the CURRENTLY DRAWN coil length (PM_nlbSpringMeshLen) to within the geometry quantum, and assert PM_nlbEnergy.U_spring === 0.5 * PM_nlbSpringK * PM_nlbSpringX^2 to 1e-9.',
    'OPEN',
    ARRAY['conservation_of_mechanical_energy']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'ch6 Phase-0 stage 0c SEAM K (genuine spring physics) 2026-08-01',
    'directive'
);

-- ============================================================
-- 3. The probe the clamp/wrap honesty guard exists to feed.
-- ============================================================
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'geometric_track_clamp_rendered_as_an_energy_change',
    'PROBE — a velocity zeroed by the geometric track clamp (or teleported by the sandbox wrap) must never reach the energy bars',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'nlbBoundsM() zeroes a body''s velocity when it reaches the end of the finite track, and nlbSandboxWrap() teleports its position across the track and re-seeds the velocity. Neither is physics. With an energy layer live, either one silently collapses K to zero (or steps U by a whole track length) while the caption says the total is constant — the concept teaches its own negation, and no value-level check notices because every individual bar is still internally consistent.',
    'The engine HOLDS the last pre-clamp bar values and emits a console warning under the unique prefix [PM_NLB_ENERGY_CLAMP] when the clamp fires with the energy layer active; the sandbox wrap is treated as a state re-entry (baseline re-captured, latches re-armed, bars rebaselined in the same frame). THE EYE''s console audit must assert ZERO occurrences of the prefix — a state that trips it is mis-authored and must be re-authored so the spring turnaround or loop_reset_ms fires before the bound (spec note 17a).',
    'js_eval',
    'Across the whole capture, assert the console produced zero messages containing the literal [PM_NLB_ENERGY_CLAMP]. Non-zero = the state lets a tracked body reach the track bound while the energy layer is active; route to alex:architect (state motion plan), not to the engine.',
    'OPEN',
    ARRAY['conservation_of_mechanical_energy','mechanical_energy_loss_with_friction','elastic_potential_energy_spring']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'ch6 Phase-0 stage 0c SEAM K (genuine spring physics) 2026-08-01',
    'probe_definition'
);
