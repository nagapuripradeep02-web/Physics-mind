-- supabase_2026-07-08_seed_resistivity_clusters_migration.sql
-- Seeds confusion_cluster_registry with 9 clusters for resistivity.json —
-- the THIRD concept on the particle_field (2D p5.js) renderer, same engine
-- family as drift_velocity/ohms_law.
-- Authored 2026-07-08 by alex:json_author per architect skeleton §6 +
-- physics_author drill-down trigger phrases §6. Migration is AUTHORED, not
-- applied — quality_auditor's pre-run step applies it (json_author is
-- forbidden from apply_migration).
--
-- Schema columns: cluster_id, concept_id, state_id, label, description, trigger_examples, status.
-- PRIMARY KEY is (cluster_id) alone; ON CONFLICT updates the other columns idempotently.
-- Each trigger_examples array carries 5 real-Indian-11th/12th-grade phrasings
-- (lowercase, idiomatic, no textbook prose). status='pending_review' per the
-- current cluster-registry convention (mirrors supabase_2026-07-08_seed_ohms_law_clusters_migration.sql).
--
-- THREE has_prebuilt_deep_dive-flagged states (json_author §5, drill-down is a
-- DEFERRED feature — Rule 18 — hand-authored only after analytics flag the state),
-- 3 candidate clusters each (json_author §6 / architect §6):
--   STATE_3 — PRIMARY aha: R = rho*L/A factorization + the constant-volume stretch trap
--   STATE_4 — rho = m/(ne^2 tau); the microscopic origin of a material's resistivity
--   STATE_5 — temperature dependence of resistance; metal vs semiconductor boundary

INSERT INTO confusion_cluster_registry (cluster_id, concept_id, state_id, label, description, trigger_examples, status)
VALUES
-- ─── STATE_3 stretched_wire_r_scales_l_squared deep-dive ──────────────
(
  'stretched_wire_r_scales_l_squared',
  'resistivity',
  'STATE_3',
  'If I stretch a wire to double length at constant volume, does R just double?',
  'Student expects R proportional to L directly, missing that stretching at CONSTANT VOLUME also thins the wire (A = A0*L0/L). Substituting gives R = rho*L^2/(A0*L0) — R scales as L squared, not L. Doubling length quadruples resistance, the stock JEE trap this state draws live.',
  ARRAY[
    'if i stretch a wire to double length does r just double',
    'why does resistance become four times not two times',
    'whats different about stretching vs just having a longer wire',
    'does the volume staying same change the answer',
    'why cant i just use r proportional to l here'
  ],
  'pending_review'
),
-- ─── STATE_3 r_vs_rho_which_is_material deep-dive ─────────────────────
(
  'r_vs_rho_which_is_material',
  'resistivity',
  'STATE_3',
  'Which one is actually the material property — R or rho?',
  'Student conflates R with rho. Rho (resistivity) is the material''s own fixed number, unaffected by cutting or stretching; R is what a PARTICULAR wire''s shape does with that number via R = rho*L/A. Cutting a wire in half changes R but never rho.',
  ARRAY[
    'which one is actually the material property r or rho',
    'why does r change but rho stays exactly the same',
    'if i cut the wire in half does rho change',
    'is rho like density for resistance',
    'so r is not really a property of copper then'
  ],
  'pending_review'
),
-- ─── STATE_3 units_of_resistivity deep-dive ───────────────────────────
(
  'units_of_resistivity',
  'resistivity',
  'STATE_3',
  'Why is resistivity measured in ohm-metre?',
  'Student is unsure why rho carries units of ohm times metre. From R = rho*L/A, rearranging gives rho = R*A/L, so [rho] = ohm * m^2 / m = ohm*m. Length appears on top (in the definition of rho, area cancels the wire''s own length), giving the compound unit.',
  ARRAY[
    'why is resistivity measured in ohm meter',
    'how do you get rho from r if you know l and a',
    'whats the physical meaning of ohm times meter',
    'why does area go in the bottom and length on top',
    'is rho ever negative or can it only be positive'
  ],
  'pending_review'
),
-- ─── STATE_4 why_nichrome_resists_more deep-dive ──────────────────────
(
  'why_nichrome_resists_more',
  'resistivity',
  'STATE_4',
  'Why does nichrome resist so much more than copper?',
  'Student wants the microscopic cause of the ~65x rho jump. Nichrome''s alloy lattice disorder shortens the electrons'' relaxation time tau dramatically compared to copper''s ordered lattice; this simulation holds n (electron density) fixed across all three materials as a declared teaching simplification, so the taught difference is entirely in tau (real materials differ in both n and tau).',
  ARRAY[
    'why does nichrome resist so much more than copper',
    'is it the atoms themselves or something else that makes nichrome different',
    'does nichrome have fewer free electrons than copper',
    'why would an alloy resist more than a pure metal',
    'is tau different or is n different between the two'
  ],
  'pending_review'
),
-- ─── STATE_4 where_geometry_went deep-dive ────────────────────────────
(
  'where_geometry_went',
  'resistivity',
  'STATE_4',
  'If rho = m/(ne²τ), where did L and A go?',
  'Student is confused that the microscopic formula for rho has no length or area terms. Rho is deliberately a property of the MATERIAL alone — m, n, e are fixed constants and tau depends only on the lattice/temperature, never on the wire''s shape. Geometry enters only later, when R = rho*L/A is built from rho.',
  ARRAY[
    'if rho equals m over ne squared tau where did l and a go',
    'does rho depend on the wires length at all',
    'why does the microscopic formula not have length or area in it',
    'so is rho only about what atoms the wire is made of',
    'how is rho the same for a thick wire and a thin wire of the same metal'
  ],
  'pending_review'
),
-- ─── STATE_4 rho_from_drift_chain deep-dive ───────────────────────────
(
  'rho_from_drift_chain',
  'resistivity',
  'STATE_4',
  'How do you actually derive rho from the drift velocity chain?',
  'Student wants the full bridge from drift_velocity''s i = neAv_d to rho. v_d = eEτ/m, E = V/L, i = neAv_d combine to i = (ne²Aτ/(mL))*V, so R = V/i = mL/(ne²Aτ) = rho*L/A with rho = m/(ne²τ) — the same derivation pattern ohms_law used for R = m*L/(n*e^2*A*τ), now isolating rho as the material-only factor.',
  ARRAY[
    'how do you actually derive rho from the drift velocity stuff',
    'wheres the connection between i equals neav_d and rho',
    'how does e squared tau over m become resistivity',
    'is rho derived the same way r was in the ohms law chapter',
    'how is tau related to rho exactly'
  ],
  'pending_review'
),
-- ─── STATE_5 metal_vs_semiconductor_temperature deep-dive ────────────
(
  'metal_vs_semiconductor_temperature',
  'resistivity',
  'STATE_5',
  'Does every material get MORE resistive when heated?',
  'Student over-generalizes the metal result to all materials. For METALS, n (electron density) stays essentially frozen while heating shortens tau, so rho rises. For SEMICONDUCTORS, heating instead frees vastly more charge carriers (n explodes), which dominates and makes resistivity FALL with temperature — the opposite sign. Band theory itself is deferred to a later concept; this cluster only names the boundary.',
  ARRAY[
    'does every material get more resistive when heated',
    'why do semiconductors do the opposite of metals when heated',
    'is n changing too when a metal heats up or just tau',
    'why does this only apply to metals',
    'whats different about semiconductors that flips the sign'
  ],
  'pending_review'
),
-- ─── STATE_5 alpha_meaning_and_units deep-dive ────────────────────────
(
  'alpha_meaning_and_units',
  'resistivity',
  'STATE_5',
  'What does alpha actually represent, and is the linear formula always valid?',
  'Student wants alpha''s physical meaning and scope. Alpha is the temperature coefficient of resistivity — the fractional rise in rho per degree above T0 — units per-degree-Celsius (or per-Kelvin), different for every material (copper''s is ~200x manganin''s). rho_T = rho0(1+alpha*deltaT) is a LINEAR approximation valid only over a limited temperature window (here 20-220 C); it is not the same quantity as a thermal expansion coefficient, though both describe a material''s response to heat.',
  ARRAY[
    'what does alpha actually represent physically',
    'why is alpha different for every material',
    'what are the units of alpha in this formula',
    'does the linear formula work for any temperature range',
    'is alpha the same as a thermal expansion coefficient'
  ],
  'pending_review'
),
-- ─── STATE_5 filament_curve_explained deep-dive ───────────────────────
(
  'filament_curve_explained',
  'resistivity',
  'STATE_5',
  'Is this why the filament bulb graph from Ohm''s law bent upward?',
  'Student wants to close the loop between ohms_law STATE_5 (the filament''s bending V-I curve) and this concept''s temperature mechanism. Yes — the filament''s R_eff rising with V in ohms_law is exactly this concept''s rho_T = rho0(1+alpha*deltaT): as current heats the filament, its resistivity climbs, so R rises with drive, bending the V-I trace off the straight ohmic line. A hot filament and a hot copper wire obey the identical mechanism; only the material (and hence alpha) differs.',
  ARRAY[
    'is this why the bulb graph from ohms law bent upward',
    'so the filament bending was really about rho changing with heat',
    'why didnt we call it rho then in the ohms law chapter',
    'is a hot filament like the hot copper wire here',
    'does the filaments material even matter or just its temperature'
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
