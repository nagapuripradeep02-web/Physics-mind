-- supabase_2026-06-25_seed_gauss_law_sphere_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 drill-down clusters for
-- gauss_law_sphere.json (Class 12 Ch.1 — field of a uniformly charged spherical
-- shell). Authored 2026-06-25 by json_author from the physics-author drill-down
-- trigger phrasings (physics block §6), 5 student-voice trigger phrases each.
--
-- Cluster placement:
--   STATE_2 (symmetry → E radial & constant on the sphere) — 3 clusters
--     why_field_must_be_radial, symmetry_lets_E_leave_the_integral,
--     same_E_on_whole_gaussian_sphere
--   STATE_4 (PRIMARY aha — outside ≡ point charge at the centre) — 3 clusters
--     shell_looks_like_point_from_outside, why_r_measured_from_centre_not_surface,
--     external_field_independent_of_radius_R
--   STATE_5 (SUPPORTING aha — E=0 everywhere inside) — 3 clusters
--     why_enclosed_charge_is_zero_inside, zero_field_not_just_small_field,
--     inside_shell_shielding
--
-- STATE_3 and STATE_5 carry has_prebuilt_deep_dive: true + allow_deep_dive: true
-- in the JSON.
--
-- Schema columns: cluster_id, concept_id, state_id, label, description,
--   trigger_examples, status, created_at, updated_at.
-- PRIMARY KEY is (cluster_id). ON CONFLICT (cluster_id) DO UPDATE so re-running
-- this migration re-syncs the label/description/triggers idempotently.

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
(
  'why_field_must_be_radial',
  'gauss_law_sphere',
  'STATE_2',
  'Why does the field point straight out, not sideways?',
  'Student does not see why the field of a charged shell must be purely radial. Answer: the shell looks identical from every direction, so E has no way to pick a sideways direction — spherical symmetry forces E to point radially.',
  ARRAY[
    'why does the field point straight out not sideways',
    'why cant E be along the surface',
    'how do we know E is radial',
    'why is the field perpendicular to the shell',
    'what makes the field point outward only'
  ],
  'active'
),
(
  'symmetry_lets_E_leave_the_integral',
  'gauss_law_sphere',
  'STATE_2',
  'How does E come out of the flux integral?',
  'Student cannot see how the surface integral collapses. Answer: because E is constant and radial on the Gaussian sphere, the flux integral becomes simply E times the area, E·4πr², letting E be pulled out and solved for.',
  ARRAY[
    'how does E come out of the integral',
    'why can we pull E outside the flux',
    'why is E times area just E times 4 pi r squared',
    'what does symmetry do in this derivation',
    'why is flux just E into area here'
  ],
  'active'
),
(
  'same_E_on_whole_gaussian_sphere',
  'gauss_law_sphere',
  'STATE_2',
  'Is E the same at every point on the Gaussian sphere?',
  'Student is unsure whether the field magnitude varies around the Gaussian sphere. Answer: by spherical symmetry the magnitude of E is identical at every point of a concentric sphere of radius r.',
  ARRAY[
    'is E the same at every point on the sphere',
    'why is the field constant on the gaussian surface',
    'does E change around the sphere',
    'why same magnitude everywhere at radius r',
    'is the field equal all over the gaussian sphere'
  ],
  'active'
),
(
  'shell_looks_like_point_from_outside',
  'gauss_law_sphere',
  'STATE_4',
  'Why does the shell act like a point charge from outside?',
  'Student is surprised that a large charged shell behaves like a single point charge. Answer: outside the shell E = kq/r², exactly the field of a point charge q sitting at the centre, so from anywhere outside the shell is indistinguishable from a point charge.',
  ARRAY[
    'why does the shell act like a point charge',
    'how can a big ball behave like a point',
    'why is outside field same as point charge',
    'does the shell really look like a point from far',
    'why kq over r squared like a single charge'
  ],
  'active'
),
(
  'why_r_measured_from_centre_not_surface',
  'gauss_law_sphere',
  'STATE_4',
  'Is r measured from the centre or from the surface?',
  'Student is unsure where to start measuring r in the kq/r² formula. Answer: r is the distance from the CENTRE of the shell, not from its surface — the Gaussian sphere is concentric with the shell.',
  ARRAY[
    'is r from the centre or from the surface',
    'where do i measure r from',
    'why distance from centre not from the shell',
    'do i start r at the surface',
    'is r the distance from the middle'
  ],
  'active'
),
(
  'external_field_independent_of_radius_R',
  'gauss_law_sphere',
  'STATE_4',
  'Does the outside field depend on the shell radius R?',
  'Student expects a bigger or smaller shell to give a different external field. Answer: outside, E = kq/r² contains only q and r — the shell radius R does not appear, so two shells with the same charge give the same field at the same r.',
  ARRAY[
    'does the field depend on the shell radius',
    'if i make the shell bigger does E change',
    'why doesnt R appear in the formula',
    'does a smaller shell give a stronger outside field',
    'is the outside field the same for any shell size'
  ],
  'active'
),
(
  'why_enclosed_charge_is_zero_inside',
  'gauss_law_sphere',
  'STATE_5',
  'Why is the enclosed charge zero inside the shell?',
  'Student does not see why a Gaussian sphere inside the shell encloses no charge. Answer: all the charge lives on the shell at radius R, which is OUTSIDE any interior Gaussian sphere (r<R), so q_enc = 0 there.',
  ARRAY[
    'why is enclosed charge zero inside',
    'where is the charge if not inside the sphere',
    'why does the inside gaussian sphere enclose nothing',
    'isnt there charge inside the shell',
    'why q enclosed is zero in the interior'
  ],
  'active'
),
(
  'zero_field_not_just_small_field',
  'gauss_law_sphere',
  'STATE_5',
  'Is the field really zero inside, or just small?',
  'Student suspects there may be a tiny residual field inside the shell. Answer: it is EXACTLY zero everywhere inside — q_enc = 0 forces Φ = 0 and so E = 0 at every interior point, not merely small.',
  ARRAY[
    'is the field really zero or just small inside',
    'is it exactly zero or approximately',
    'could there be a tiny field inside',
    'why exactly zero and not nearly zero',
    'is there really no field at all inside'
  ],
  'active'
),
(
  'inside_shell_shielding',
  'gauss_law_sphere',
  'STATE_5',
  'Why does a metal shell shield the inside?',
  'Student wants the real-world consequence of E=0 inside. Answer: because the field inside a hollow charged shell is exactly zero, a charge placed inside feels no force — this is electrostatic shielding, why a car body protects you in a lightning strike.',
  ARRAY[
    'why does a metal shell shield the inside',
    'why is there no field inside a hollow charged ball',
    'how does a shell protect what is inside',
    'why are you safe inside a charged shell',
    'what is electrostatic shielding here'
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
--   WHERE concept_id = 'gauss_law_sphere' ORDER BY state_id, cluster_id;
-- Should return 9 rows (3 STATE_2, 3 STATE_4, 3 STATE_5).
