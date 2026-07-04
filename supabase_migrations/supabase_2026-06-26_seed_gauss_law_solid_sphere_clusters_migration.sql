-- supabase_2026-06-26_seed_gauss_law_solid_sphere_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- gauss_law_solid_sphere.json (Class 12 Ch.1 — field of a uniformly charged
-- SOLID sphere). Authored 2026-06-26. 5 student-voice trigger phrases each.
--
-- Cluster placement:
--   STATE_3 (outside ≡ point charge at the centre) — 3 clusters
--     solid_outside_like_point_charge, solid_outside_independent_of_R,
--     solid_r_from_centre
--   STATE_4 (PRIMARY aha — inside grows linearly, E = kq·r/R³) — 3 clusters
--     solid_not_zero_inside_like_shell, solid_q_enc_cubic,
--     why_field_grows_inside_solid
--   STATE_5 (continuity at the surface, peak at r=R) — 3 clusters
--     solid_field_continuous_at_R, solid_peak_at_surface, solid_centre_field_zero
--
-- STATE_3 and STATE_4 carry has_prebuilt_deep_dive: true + allow_deep_dive: true
-- in the JSON.
--
-- cluster_ids are unique vs the hollow-shell migration
-- (supabase_2026-06-25_seed_gauss_law_sphere_clusters_migration.sql).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'solid_outside_like_point_charge',
  'gauss_law_solid_sphere',
  'STATE_3',
  'Why does a solid charged ball look like a point charge from outside?',
  'Student is surprised that a ball of spread-out charge behaves like a single point charge. Answer: outside the ball a Gaussian sphere encloses the full charge q, so E = kq/r² — exactly the field of a point charge q at the centre, no matter how the charge is spread inside.',
  ARRAY[
    'why does a solid ball act like a point charge outside',
    'how can spread out charge look like a point',
    'why is the outside field kq over r squared',
    'does it matter that the charge fills the volume',
    'why same as a point charge from far away'
  ],
  'active'
),
(
  'solid_outside_independent_of_R',
  'gauss_law_solid_sphere',
  'STATE_3',
  'Does the outside field depend on the ball''s radius R?',
  'Student expects a bigger or smaller ball to give a different external field. Answer: outside, E = kq/r² contains only q and r — the ball radius R does not appear, so two balls with the same charge give the same field at the same distance from the centre.',
  ARRAY[
    'does the outside field depend on the ball radius',
    'if i make the ball bigger does the outside field change',
    'why doesnt R appear in the outside formula',
    'does a smaller ball give a stronger field outside',
    'is the outside field the same for any ball size'
  ],
  'active'
),
(
  'solid_r_from_centre',
  'gauss_law_solid_sphere',
  'STATE_3',
  'Is r measured from the centre or from the surface?',
  'Student is unsure where to start measuring r. Answer: r is the distance from the CENTRE of the ball, not from its surface — the Gaussian sphere is concentric with the ball, both inside and outside.',
  ARRAY[
    'is r from the centre or from the surface',
    'where do i measure r from for a solid sphere',
    'why distance from the middle not the surface',
    'do i start r at the ball surface',
    'is r the distance from the centre of the ball'
  ],
  'active'
),
(
  'solid_not_zero_inside_like_shell',
  'gauss_law_solid_sphere',
  'STATE_4',
  'Isn''t the field zero inside, like a hollow shell?',
  'Student carries the hollow-shell result (E=0 inside) over to the solid ball. Answer: a solid ball encloses real charge at every interior radius, q_enc = q·(r/R)³, so the field is NOT zero inside — only a hollow shell is zero inside. The solid field grows from 0 at the centre to a peak at the surface.',
  ARRAY[
    'isnt the field zero inside like a shell',
    'why isnt E zero inside a solid sphere',
    'i thought inside a charged sphere is always zero',
    'how is a solid ball different from a hollow shell inside',
    'why does the solid sphere have a field inside'
  ],
  'active'
),
(
  'solid_q_enc_cubic',
  'gauss_law_solid_sphere',
  'STATE_4',
  'Why is only q·(r/R)³ enclosed inside?',
  'Student does not see why an interior Gaussian sphere encloses only part of the charge. Answer: the charge fills the volume uniformly, so the enclosed charge scales with the enclosed VOLUME — which grows as r³ — giving q_enc = q·(r/R)³.',
  ARRAY[
    'why is only q times r over R cubed enclosed',
    'why does enclosed charge scale with r cubed',
    'how much charge is inside a smaller sphere',
    'why volume fraction not radius fraction',
    'where does the r cubed come from'
  ],
  'active'
),
(
  'why_field_grows_inside_solid',
  'gauss_law_solid_sphere',
  'STATE_4',
  'Why does the field grow as you move out from the centre?',
  'Student does not see why E rises with r inside the ball. Answer: as r increases the Gaussian sphere encloses more charge (q·(r/R)³) but its area grows as r², and the net result is E = kq·r/R³ — a straight-line rise from 0 at the centre to the peak at the surface.',
  ARRAY[
    'why does the field grow as you go outward inside',
    'why is E proportional to r inside',
    'why is the field zero at the centre',
    'why does E increase toward the surface',
    'why a straight line for E inside'
  ],
  'active'
),
(
  'solid_field_continuous_at_R',
  'gauss_law_solid_sphere',
  'STATE_5',
  'Why is there no jump at the surface?',
  'Student expects a discontinuous jump like a shell. Answer: at r=R the inside formula kq·r/R³ becomes kq/R², and the outside formula kq/r² also becomes kq/R² — the two pieces meet at the same value, so the field passes through the surface continuously with no jump.',
  ARRAY[
    'why is there no jump at the surface',
    'does the field jump at r equals R for a solid sphere',
    'why is the field continuous at the surface',
    'do the inside and outside formulas match at R',
    'why no sudden change crossing the surface'
  ],
  'active'
),
(
  'solid_peak_at_surface',
  'gauss_law_solid_sphere',
  'STATE_5',
  'Where is the field strongest?',
  'Student is unsure where the maximum field is. Answer: the field rises linearly inside and falls as 1/r² outside, so its maximum sits exactly at the surface r=R, where E = kq/R².',
  ARRAY[
    'where is the field strongest in a solid sphere',
    'is the field biggest at the centre or surface',
    'at what radius is E maximum',
    'why is the peak at the surface',
    'where is the maximum electric field'
  ],
  'active'
),
(
  'solid_centre_field_zero',
  'gauss_law_solid_sphere',
  'STATE_5',
  'Is the field really zero at the very centre?',
  'Student suspects the field should be largest at the centre where charge is most packed. Answer: at the exact centre a Gaussian sphere encloses essentially no charge (q_enc → 0 as r → 0), so E = kq·r/R³ → 0 — the centre is the minimum, not the maximum.',
  ARRAY[
    'is the field zero at the very centre',
    'shouldnt the field be strongest at the centre',
    'why is E zero at the middle of the ball',
    'is there really no field at the centre',
    'why is the centre the weakest point'
  ],
  'active'
)
ON CONFLICT (cluster_id) DO UPDATE
  SET concept_id       = EXCLUDED.concept_id,
      state_id         = EXCLUDED.state_id,
      label            = EXCLUDED.label,
      description      = EXCLUDED.description,
      trigger_examples = EXCLUDED.trigger_examples,
      status           = EXCLUDED.status,
      updated_at       = now();

-- Verify:
-- SELECT cluster_id, state_id FROM confusion_cluster_registry
--   WHERE concept_id = 'gauss_law_solid_sphere' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_3, 3 STATE_4, 3 STATE_5).
