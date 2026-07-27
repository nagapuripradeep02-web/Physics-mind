-- Scar candidates — law_of_conservation_of_mass build, 2026-07-27
-- STATUS: FILES ONLY, NOT APPLIED. engine_bug_queue writes are a founder decision.
-- Both rows were found by json_author while authoring, and independently verified by
-- the orchestrator against parametric_renderer.ts before being recorded here.
--
-- Verification command used:
--   awk '/^function drawVector/,/^}/' src/lib/renderers/parametric_renderer.ts | grep -c PM_animationGate   -> 0
--   awk '/^function drawDerivationStep/,/^}/' ... | grep -c "PM_animationGate|appear_at_ms"                 -> 0
--   grep -n "PM_animationGate(" src/lib/renderers/parametric_renderer.ts                                    -> 9 call sites, neither of the above

INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, prevention_rule) VALUES (
  'parametric_vector_primitive_ignores_appear_at_ms',
  'peter_parker:renderer_primitives',
  'chemistry',
  'OPEN',
  'drawVector() in parametric_renderer.ts never calls PM_animationGate(spec), so appear_at_ms / '
  'disappear_at_ms / animate_in_ms are SILENTLY IGNORED on every `vector` primitive — all authored '
  'poses render simultaneously from t=0. Nine sibling draw functions (body, label, annotation, '
  'surface, formula_box, comparison_panel, ...) do gate. Authoring a staged multi-pose vector '
  'reveal therefore produces a pile-up with no error and no validator warning. Fix: add the same '
  '`var gate = PM_animationGate(spec); if (!gate.visible) return;` prologue drawVector''s siblings '
  'use. Until then: do not author staged `vector` reveals on the parametric renderer — use '
  '`force_arrow` (which IS gated and supports literal from/to as well as magnitude + '
  'direction_deg_expr). Found while authoring the balance needle for law_of_conservation_of_mass; '
  'json_author worked around it by switching the needle to force_arrow.'
);

INSERT INTO engine_bug_queue (bug_class, owner_cluster, subject, status, prevention_rule) VALUES (
  'parametric_derivation_step_reveal_ungated_concurrent_typing',
  'peter_parker:renderer_primitives',
  'chemistry',
  'OPEN',
  'drawDerivationStep() runs its handwriting-reveal animation from raw PM_simClockMs every frame '
  'with no PM_animationGate call and no appear_at_ms support — so N authored derivation_step lines '
  'all begin "typing" concurrently at t=0 regardless of their authored timing, instead of building '
  'one at a time. This silently defeats Rule 31 (ONE idea, ONE complete motion) and Rule 32a '
  '(cause before effect) on any derivation state. Fix: gate the reveal on the primitive''s own '
  'appear_at_ms so each line''s typing clock starts when that line appears. Until then: stage '
  'derivation lines as `annotation` primitives (the precedent bohr_model_energy_levels STATE_7 '
  'already uses). Found while authoring STATE_6 of law_of_conservation_of_mass.'
);

-- Founder ruling needed on a THIRD, lower-confidence item (no INSERT drafted — it is a tooling
-- false-positive, not an engine defect):
--   check-layout-overlap.mjs estimates a text_expr label's rendered width from the literal
--   placeholder string ("{m_C.toFixed(1)} g" ~ 19 chars) rather than the substituted value
--   ("24.0 g" ~ 6 chars), manufacturing collisions between adjacent live readouts that cannot
--   actually touch on screen. Reported on STATE_4 / STATE_7 of this concept and dismissed by hand
--   computation. If this recurs on the next parametric concept it is worth a tooling fix, since a
--   validator that cries wolf on live readouts trains authors to ignore it.
