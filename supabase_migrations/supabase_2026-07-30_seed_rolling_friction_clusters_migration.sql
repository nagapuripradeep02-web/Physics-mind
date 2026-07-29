-- supabase_2026-07-30_seed_rolling_friction_clusters_migration.sql
-- Seeds confusion_cluster_registry with 6 clusters for rolling_friction.json —
-- Laws of Motion (Class 11) #6, on the newtons_laws_body field_3d engine
-- (docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md), Branch A + SEAM G
-- (bodies[].shape:'wheel'). Same mass, same push: a sliding block (mu_k = 0.40)
-- beside a rolling wheel (mu_r = 0.002), same law f = mu*N, ~200x smaller
-- coefficient. chapter:8, section:"8.9", prerequisites:
-- ["friction_force","normal_force","newton_second_law"].
--
-- Authored 2026-07-30 by alex:json_author, using the physics_author's
-- drill-down trigger phrases VERBATIM (docs/loop_runs/lom/rolling_friction/
-- physics_block.md §5): STATE_2 — rolling_resistance_origin_deformation,
-- mu_r_typical_values_tyres_rails, rolling_vs_ball_bearings;
-- STATE_3 — rolling_friction_not_zero, why_rolling_objects_stop,
-- mu_r_depends_on_surface_and_pressure.
--
-- Migration is AUTHORED, NOT APPLIED — quality_auditor's pre-run step
-- applies it (json_author is forbidden from apply_migration). Drill-down
-- itself is DEFERRED (Rule 18, 2026-06-10 directive) — the
-- confusion_cluster_registry Gate-8 probe is N/A-DORMANT this phase per the
-- documented false-FAIL scar (memory: auditor-cluster-registry-false-fail).
-- Do not let the auditor re-route json_author to "fix" this.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- status='pending_review' per the current cluster-registry convention.
--
-- has_prebuilt_deep_dive picks (architect skeleton §6, metadata only, Rule 18):
-- STATE_2 (why is mu_r so small — the mechanism question a comparison always
-- raises) and STATE_3 (the misconception's long tail — "does rolling have
-- friction at all") — both states carry a drill_downs array in the concept
-- JSON referencing these cluster_ids.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_2 rolling_resistance_origin_deformation deep-dive ──────────
(
  'rolling_resistance_origin_deformation',
  'rolling_friction',
  'STATE_2',
  'If nothing is sliding at the contact point, where does rolling friction actually come from?',
  'Student pictures rolling as a perfectly rigid circle touching a perfectly rigid floor at one mathematical point, in which case there is genuinely nothing to resist and rolling friction SHOULD be exactly zero. Real wheels and real floors are not perfectly rigid: both deform slightly at the contact patch, so the wheel presses a small flattened area into the surface (or sinks a tiny amount into it) rather than touching at one point. As the wheel rolls forward, that deformed patch is constantly being created at the front and released at the back, and the material does not spring back with perfect efficiency — some energy is lost to internal friction within the deforming material itself, and the front edge of the contact patch experiences a slightly larger reaction than the back edge, tilting the effective normal force slightly forward and creating a small torque that opposes rolling. That entire mechanism, small as it is, is what f = mu_r*N is standing in for — a real, physical resistance from deformation, not from any sliding at all.',
  ARRAY[
    'why is rolling friction smaller than sliding friction',
    'what causes rolling friction if nothing is sliding',
    'does the wheel squash the ground a tiny bit',
    'why does a heavier wheel still roll easily',
    'how can there be friction with no sliding at all'
  ],
  'pending_review'
),
-- ─── STATE_2 mu_r_typical_values_tyres_rails deep-dive ────────────────
(
  'mu_r_typical_values_tyres_rails',
  'rolling_friction',
  'STATE_2',
  'What does a rolling friction coefficient of about 0.002 actually correspond to in real wheels?',
  'Student has just been given a single clean number (mu_r about 0.002) and reasonably wonders whether that is a universal constant or a rough figure that depends on what is rolling on what. Rolling resistance coefficients vary by roughly an order of magnitude depending on the materials and conditions: a hard steel train wheel on a steel rail can be as low as 0.001 to 0.002 (very little deformation in either surface), a good car tyre on smooth pavement is typically around 0.01 to 0.02 (rubber deforms far more than steel), and a soft or underinflated tyre on loose ground can climb to 0.03 or higher. The concept authors 0.002 as a clean, physically realistic figure at the steel-on-steel end of that range so the ~200x contrast with mu_k = 0.40 sliding friction is exact and easy to compute, while the real-world range (0.001 to a few hundredths) is always far smaller than any typical sliding coefficient (commonly 0.3 to 0.6).',
  ARRAY[
    'what is a typical rolling friction value for tyres',
    'is rolling friction different for train wheels on rails',
    'why is mu for rolling so much smaller than mu for sliding',
    'does tyre pressure change the rolling friction number',
    'what is the rolling friction coefficient for a car'
  ],
  'pending_review'
),
-- ─── STATE_2 rolling_vs_ball_bearings deep-dive ───────────────────────
(
  'rolling_vs_ball_bearings',
  'rolling_friction',
  'STATE_2',
  'Are ball bearings just a fancier version of a rolling wheel, or a genuinely different way of cutting friction?',
  'Student hears "ball bearings have almost no friction" right after learning that rolling itself already has very low friction, and reasonably wonders if the two are the same idea repeated. They are the same MECHANISM taken further, not a different law: a ball bearing is still rolling contact, still governed by f = mu_r*N, but engineered specifically to push mu_r even lower than an ordinary wheel achieves. A sphere rolling inside a hardened, precisely machined race deforms less than a rubber tyre on tarmac (harder materials, smaller and more uniform contact patches, and a free-spinning cage that removes most residual sliding between the balls and the races), so a good ball bearing can reach mu_r values in the range of 0.001 to 0.0015 or even lower — smaller again than the concept''s own 0.002 wheel. That is exactly why machines use bearings at axles instead of letting a shaft simply rub or even letting a plain wheel simply rest on a surface: it takes rolling friction''s already-tiny mechanism and refines it further.',
  ARRAY[
    'why do ball bearings have almost no friction',
    'are ball bearings rolling friction or something else',
    'why do machines use ball bearings instead of plain wheels',
    'is ball bearing friction the same law as wheel friction',
    'how small can rolling friction actually get'
  ],
  'pending_review'
),
-- ─── STATE_3 rolling_friction_not_zero deep-dive ──────────────────────
(
  'rolling_friction_not_zero',
  'rolling_friction',
  'STATE_3',
  'Everyone says "rolling is frictionless" — so does a rolling wheel really have any friction at all?',
  'Student has absorbed the common shorthand "rolling eliminates friction" literally, when it actually means "rolling friction is far smaller than sliding friction," not "rolling friction is exactly zero." The sim''s own numbers settle this directly: a coasting wheel with zero applied push still shows a nonzero friction reading (about 0.10 N in this concept''s setup) and its speed reading visibly falls the entire time it coasts. If rolling truly had zero friction, Newton''s first law says the speed would stay perfectly constant forever once the push stopped — that this never happens, for ANY real rolling object on ANY real surface, is the direct proof that f_r = mu_r*N is greater than zero whenever N is greater than zero. The everyday phrase is really comparing rolling to sliding (where it is overwhelmingly true that rolling wins), not asserting rolling has literally no resistance.',
  ARRAY[
    'does a rolling wheel have any friction at all',
    'why does a ball eventually stop rolling on a flat floor',
    'if there is no push why does the wheel slow down',
    'isnt rolling supposed to be frictionless',
    'why do people say wheels have no friction'
  ],
  'pending_review'
),
-- ─── STATE_3 why_rolling_objects_stop deep-dive ───────────────────────
(
  'why_rolling_objects_stop',
  'rolling_friction',
  'STATE_3',
  'With no one pushing it and no obvious force acting, what actually makes a rolling object slow down and stop?',
  'Student sees a coasting wheel or a rolled ball drifting to a stop and, absent any visible push or pull, sometimes reaches for a vague explanation like "it just runs out of motion" rather than identifying a real force. The full answer for a wheel rolling on a flat surface is rolling friction itself, f_r = mu_r*N, acting the entire time exactly as any other friction force does — opposing the direction of motion and producing a small deceleration, a = -mu_r*g on flat ground with no other horizontal forces. It is easy to miss because the deceleration is so gentle (roughly 0.02 m/s^2 at mu_r = 0.002) that the slow-down is barely perceptible moment to moment, unlike a sliding object''s much sharper stop — but the mechanism is identical in kind to sliding friction, just about two hundred times weaker in this concept''s numbers. (On a real rolling ball across a genuinely long distance, a very small amount of air resistance also contributes, but rolling friction is the dominant term at ordinary speeds and is the only mechanism this concept models.)',
  ARRAY[
    'why does a rolling ball stop on its own',
    'what force slows down a coasting wheel',
    'why doesnt the wheel keep rolling forever',
    'does air resistance stop the wheel or is it friction',
    'why does a coin stop spinning and rolling eventually'
  ],
  'pending_review'
),
-- ─── STATE_3 mu_r_depends_on_surface_and_pressure deep-dive ───────────
(
  'mu_r_depends_on_surface_and_pressure',
  'rolling_friction',
  'STATE_3',
  'Why does rolling get noticeably harder on soft ground or with a soft tyre, if rolling friction is supposed to be tiny?',
  'Student has just seen mu_r treated as a small, almost negligible number and is surprised that pushing a cart across grass, or riding a bike with a soft tyre, clearly takes more effort than the same cart or bike on a hard, smooth surface. Rolling friction''s coefficient is small on HARD, minimally-deforming surfaces (steel rail, smooth pavement) precisely because the deformation causing it (STATE_2''s mechanism) is small there — but mu_r is not one universal constant, it depends directly on how much the surface (or the tyre) deforms under the load. Soft or loose ground (grass, sand, mud) deforms far more under the wheel than pavement does, so mu_r rises, sometimes by a factor of ten or more; a soft or underinflated tyre similarly flattens more against the road, increasing its own contribution to mu_r. This is exactly the same STATE_3 lesson in a different guise: mu_r is small, but it responds to real physical conditions — it is a genuine, surface-dependent friction coefficient, not a fixed universal zero-adjacent constant.',
  ARRAY[
    'why does rolling friction change on soft ground',
    'why is it harder to push a cart on grass than on tile',
    'does low tyre pressure make a bike harder to pedal',
    'why do mountain bike tyres feel heavier to roll',
    'does the surface type change how much rolling friction there is'
  ],
  'pending_review'
)
ON CONFLICT (cluster_id) DO UPDATE
SET concept_id        = EXCLUDED.concept_id,
    state_id          = EXCLUDED.state_id,
    label             = EXCLUDED.label,
    description       = EXCLUDED.description,
    trigger_examples  = EXCLUDED.trigger_examples,
    status            = EXCLUDED.status,
    updated_at        = now();
