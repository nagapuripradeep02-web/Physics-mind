import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { logUsage } from '@/lib/usageLogger';
import crypto from 'crypto';

export interface QuestionFingerprint {
    concept_id: string;
    intent: Intent;
    class_level: string;
    mode: string;
    aspect: string;
    cache_key: string;
    confidence: number;
    ncert_chapter?: string;
    variables_changing?: string[];
    parse_failed?: boolean;  // true when JSON was truncated/unparseable — skip MVS + cache
}

export type Intent =
    | 'understand'
    | 'derive'
    | 'hypothetical'
    | 'compare'
    | 'apply'
    | 'define'
    | 'specific_confusion';  // student has a specific wrong belief about HOW something works

// ══════════════════════════════════════════════════════════════════
// Canonical concept_id registry — single source of truth.
// Must match the list advertised to the classifier LLM below, and
// must match filenames in src/data/concepts/ (minus .json).
// Any upstream layer (inputUnderstanding, intentResolver, vision)
// that returns a concept_id NOT in this set is untrusted and will
// be dropped by the route handler's validity guard.
// ══════════════════════════════════════════════════════════════════
export const VALID_CONCEPT_IDS: ReadonlySet<string> = new Set([
    // Current electricity
    'ohms_law', 'parallel_resistance', 'series_resistance',
    'kirchhoffs_voltage_law', 'kirchhoffs_current_law', 'kirchhoffs_laws',
    'wheatstone_bridge', 'meter_bridge', 'internal_resistance',
    'electric_power_heating', 'drift_velocity', 'resistivity', 'resistance',
    'temperature_dependence_of_resistance', 'resistance_temperature_dependence',
    'potentiometer',
    // Vectors / kinematics (Ch.5-7)
    'vector_resolution',
    // Atomic splits from former vector_basics bundle (Ch.5.2)
    'unit_vector', 'angle_between_vectors', 'scalar_multiplication',
    'negative_vector', 'equal_vs_parallel',
    // Atomic splits from former scalar_vs_vector bundle (Ch.5.1)
    'current_not_vector', 'parallelogram_law_test', 'pressure_scalar',
    'area_vector',
    // Atomic splits from former vector_addition bundle (Ch.5.2)
    'resultant_formula', 'special_cases', 'range_inequality',
    'direction_of_resultant',
    // Atomic splits from former vector_components bundle (Ch.5.3)
    'unit_vector_form', 'inclined_plane_components', 'negative_components',
    'dot_product',
    // Atomic splits from former distance_vs_displacement bundle (Ch.6.1-6.5)
    'distance_displacement_basics', 'average_speed_velocity',
    'instantaneous_velocity', 'sign_convention', 's_in_equations',
    // Atomic splits from former uniform_acceleration bundle (Ch.6.6-6.9)
    'three_cases', 'free_fall', 'sth_formula', 'negative_time',
    // Atomic splits from former non_uniform_acceleration bundle (Ch.7.1-7.4)
    'a_function_of_t', 'a_function_of_x', 'a_function_of_v', 'initial_conditions',
    // Atomic splits from former motion_graphs bundle (Ch.7.5)
    'xt_graph', 'vt_graph', 'at_graph', 'direction_reversal',
    // Atomic splits from former relative_motion bundle (Ch.6.10)
    'vab_formula', 'relative_1d_cases', 'time_to_meet',
    // Atomic splits from former river_boat_problems bundle (Ch.6.11)
    'upstream_downstream', 'shortest_time_crossing', 'shortest_path_crossing',
    // Atomic splits from former rain_umbrella bundle (Ch.6.12)
    'apparent_rain_velocity', 'umbrella_tilt_angle',
    // Atomic splits from former aircraft_wind_problems bundle (Ch.6.13)
    'ground_velocity_vector', 'heading_correction',
    // Atomic splits from former projectile_motion bundle (Ch.7.6)
    'time_of_flight', 'max_height', 'range_formula',
    // Atomic splits from former projectile_inclined bundle (Ch.7.7)
    'up_incline_projectile', 'down_incline_projectile',
    // Atomic splits from former relative_motion_projectiles bundle (Ch.7.8)
    'two_projectile_meeting', 'two_projectile_never_meet',
    // Forces (Ch.8)
    'field_forces', 'contact_forces', 'normal_reaction', 'tension_in_string',
    'hinge_force', 'free_body_diagram',
    // Friction (Ch.8.5)
    'friction_static_kinetic',
    // Vector head-to-tail addition (Ch.5.4 — first Phase 0 validation demo Sim 1, session 56)
    'vector_head_to_tail',
    // Newton's 2nd law: direction matters (Class 11 Ch.5.4-5.5 — Phase 0 validation demo Sim 2, session 59)
    'newton_second_law_direction',
    // Coulomb's law — force between two point charges, F = k q₁q₂/r² (Class 12
    // Ch.1.5/1.6 — the FOUNDATION of the electrostatics family + prerequisite of
    // electric_field_point_charge; field_3d coulombs_law_force scenario: equal &
    // opposite pair, sign→attract/repel, 1/r² falloff, ∝q₁q₂, vector form,
    // superposition. Vacuum law only — the dielectric/K-factor is a separate sim).
    'coulombs_law',
    // Electric field of a point charge + its field lines (Class 12 Ch.1.6/1.8 —
    // first electrostatics diamond; field_3d point_charge_positive scenario via the
    // electric_explorer dual-field path). Built for reviewer Asmi (2026-06-18).
    'electric_field_point_charge',
    // Continuous charge distributions — linear λ (C/m), surface σ (C/m²), volume
    // ρ (C/m³) charge density + the dq-superposition idea (Class 12 Ch.1.15).
    // An extended body's field is NOT kQ/r² of a point at its centre; each piece
    // dq is a Coulomb point charge dE = k·dq/r², and the body's field is the
    // vector sum E = Σ dE → ∫ dE. New unified field_3d charge_distribution
    // scenario: ONE morphing body (rod → sheet → solid) with dq highlights, a
    // field point P, and dynamic dE/net-E arrows. Prereqs coulombs_law +
    // electric_field_point_charge.
    'charge_distribution',
    // Electric flux Φ = E·A = EA cosθ + net flux through a closed surface
    // (Class 12 Ch.1.16). Flux counts how much of a field pierces an oriented
    // area, NOT the field strength; θ is measured to the area's NORMAL n̂; edge-on
    // gives zero; flux is signed (out = +, in = −); and the NET flux through any
    // closed surface depends only on the charge enclosed — not its position or
    // the box's shape. New field_3d electric_flux scenario: an open disc with a
    // tiltable normal, θ arc, live pierce-tally + Φ readout, then a closed cube
    // with a movable interior charge and per-face flux accumulation. Prereqs
    // electric_field_point_charge + area_vector + dot_product. Gauss's law proper
    // (Φ = q/ε₀) is the separate gauss_law concept below.
    'electric_flux',
    // Gauss's law (STATEMENT): the net electric flux through ANY closed surface
    // equals the enclosed charge over ε₀, Φ = q_enc/ε₀ (Class 12 Ch.1.18 —
    // follows electric_flux §1.16). ε₀ = 8.854×10⁻¹² is a fixed constant of
    // nature; the net is set ONLY by q_enc, independent of the closed (Gaussian)
    // surface's shape or size; a charge outside contributes exactly zero; and
    // q_enc is the signed algebraic sum Σ qᵢ, so net flux can be 0 or negative.
    // STATEMENT only — no E-from-symmetry derivation. New field_3d gauss_law
    // scenario: closed-surface morph (sphere→cube→blob) with the readout pinned
    // at q_enc/ε₀, inside/outside charge, signed multi-charge sum, live readout.
    // Prereqs electric_flux + charge_distribution.
    'gauss_law',
    // Field of a uniformly charged spherical SHELL by APPLYING Gauss's law +
    // spherical symmetry (Class 12 Ch.1.15): E = 0 everywhere inside (r<R,
    // q_enc=0) and E = kq/r² = q/(4πε₀r²) outside (r≥R, full charge enclosed,
    // identical to a point charge at the centre). r is measured from the CENTRE;
    // the external field is independent of the shell radius R; E jumps from 0 to
    // the peak kq/R² across the surface. Distinct from gauss_law (the STATEMENT
    // Φ=q_enc/ε₀) and electric_flux (Φ=E·A) — this is the E-from-symmetry
    // APPLICATION for a shell. NEW field_3d gauss_law_sphere scenario (FLAG #R1):
    // concentric shell + expandable Gaussian sphere + radial arrows that vanish
    // inside / follow 1/r² outside + E-vs-r plot. Prereqs gauss_law + electric_flux.
    'gauss_law_sphere',
    // Force on a charge placed in an electric field, F = qE (Class 12 Ch.1.7 —
    // companion/inverse of electric_field_point_charge; field_3d uniform_field_force
    // scenario: uniform plate field, constant force, parabolic deflection, a = qE/m).
    'force_on_charge_in_field',
    // Electric dipole in a uniform external field, τ = p × E (Class 12 Ch.1.12 —
    // field_3d dipole_in_uniform_field scenario: force couple ±qE, zero net force,
    // torque toward alignment, stable/unstable equilibrium, U = −pE cos θ). The
    // electric sibling of torque_on_current_loop_in_field.
    'electric_dipole_in_field',
    // What IS a magnetic field — B as a vector field SOURCED by moving charge,
    // REVEALED (not created) by a compass (Class 12 Ch.4.3 — slots BEFORE
    // magnetic_field_wire §4.4). Conceptual-only: establishes source→Oersted→
    // no-current-no-field→field-fills-space→B-is-a-vector-field→just-like-E.
    // Deliberately does NOT teach the magnitude B = μ₀I/(2πr); that is
    // magnetic_field_wire. Routed to the field_3d straight_wire_current scenario.
    'magnetic_field_concept_B',
    // Magnetic field of a long straight current-carrying wire + right-hand rule
    // (Class 12 Ch.4.4 — Phase 0 validation demo Sim 3, session 60). First field_3d
    // (Three.js) concept authored end-to-end; routed via CONCEPT_RENDERER_MAP.
    'magnetic_field_wire',
    // The Biot-Savart law — dB = (μ₀/4π) I(dl × r̂)/r² for a single current element,
    // summed along a straight wire to recover B = μ₀I/(2πr) (Class 12 Ch.4.4,
    // archetype A meta). Distinct from the legacy magnetic_field_biot_savart id;
    // routed to the field_3d biot_savart_element scenario.
    'biot_savart_law',
    // Lorentz force on a moving charge — F = q v × B (Class 12 Ch.4.2 — Diamond #2
    // of the magnetism chapter, M1 of MAGNETISM_ARCHITECTURE.md, archetype B —
    // force-in-field). Establishes ambient B grid, moving particle, per-frame
    // F = qv×B vector, palm-rule overlay in field_3d_renderer.ts.
    'magnetic_force_moving_charge',
    // Right-hand rule for the DIRECTION of F = q v × B (Class 12 Ch.4.2). The
    // direction-only sibling of magnetic_force_moving_charge: F ⊥ both v and B,
    // fingers-v → curl-to-B → thumb-F, a negative charge flips F by 180°, ⊗/⊙
    // into/out-of-page mapping, v∥B → F=0 edge. Deliberately teaches NO magnitude
    // (no F = qvB sinθ, no r = mv/qB, no orbit). Routed to the field_3d
    // rhr_force_direction scenario (shares the 3D right-hand mesh).
    'magnetic_force_direction_right_hand_rule',
    // Why a magnetic force can never change a charge's SPEED (Class 12 Ch.4.2).
    // The no-work / energy sibling of magnetic_force_moving_charge: F = q(v × B)
    // is perpendicular to v at every instant, so W = F·d·cos90° = 0; by the
    // work-energy theorem ΔKE = 0 and |v| is locked — the force only TURNS the
    // velocity, it never adds energy. Electric-vs-magnetic split screen seals the
    // aha "steers, never speeds up". Teaches NO magnitude (no F = qvB sinθ, no
    // r = mv/qB, no period). Routed to the field_3d magnetic_no_work scenario.
    'magnetic_force_perpendicular_no_work',
    // Magnetic force on a current-carrying wire — F = I L × B (Class 12 Ch.36,
    // concept A15). The macroscopic successor to magnetic_force_moving_charge:
    // a wire is a pipe of moving charges, so summing q v × B over n·A·L carriers
    // gives F = I L × B. Teaches the derivation-as-picture, RHR on L and B, the
    // sin θ(L,B) angle trap, the bent-wire = straight-chord result, and the
    // closed-loop net-zero force (which seeds torque_on_current_loop_in_field).
    // Routed to the field_3d force_on_current_wire scenario.
    'force_on_current_carrying_wire',
    // Torque on a current loop in a uniform magnetic field — τ = μ × B
    // (Class 12 Ch.4.10 — Diamond #3 of the magnetism chapter, phase M2 of
    // MAGNETISM_ARCHITECTURE.md, archetype C — closed-loop rotational dynamics).
    // Establishes rectangular loop, force-pair animation, μ vector through loop
    // face, τ vector along rotation axis, and loop↔bar-magnet swap in field_3d_renderer.ts.
    'torque_on_current_loop_in_field',
    // Magnetic field of a long solenoid — B = μ₀nI inside, ≈0 outside
    // (Class 12 Ch.4.8 — Diamond #4 of the magnetism chapter, M4 binary-gate
    // validator per MAGNETISM_ARCHITECTURE.md, archetype A — field-viz).
    // PRIMARY aha: per-turn radial components cancel → uniform axial B inside.
    // SUPPORTING aha: right-hand grip swaps roles — fingers curl with current,
    // thumb gives B. Conceptual-only ship; board (M7) and competitive (M8)
    // deferred. Renderer wires wire_to_coil_morph (STATE_1) and
    // right_hand.case='solenoid' with fade_from_case='A' (STATE_5).
    'magnetic_field_solenoid',
]);

// Synonyms → canonical IDs. Gemini/Flash often return physicist-common synonyms
// ("normal_force", "tension", "weight") instead of the slug we store. Map them
// before the validity guard so the override can still apply.
//
// Also: the second block below covers legacy parent-bundle names. After the
// 2026-04-18 atomic-split migration these bundles are no longer valid concept
// IDs. Historical caches and older classifier outputs can still reference them,
// so each legacy name redirects to the foundational atomic child as a safety
// net. The CLASSIFIER_PROMPT has been pruned of these bundles — Gemini should
// never return them for new queries — but keeping the redirect is defensive.
export const CONCEPT_SYNONYMS: Readonly<Record<string, string>> = {
    electric_field_lines: 'electric_field_point_charge',
    normal_force: 'normal_reaction',
    normal_forces: 'normal_reaction',
    tension: 'tension_in_string',
    rope_tension: 'tension_in_string',
    atwood_machine: 'tension_in_string',
    contact_force: 'contact_forces',
    field_force: 'field_forces',
    weight: 'field_forces',
    gravitational_force: 'field_forces',
    fbd: 'free_body_diagram',
    laws_of_motion: 'free_body_diagram',
    newtons_second_law: 'newton_second_law_direction',
    newton_second_law: 'newton_second_law_direction',
    f_equals_ma: 'newton_second_law_direction',
    f_ma: 'newton_second_law_direction',
    second_law: 'newton_second_law_direction',
    friction: 'friction_static_kinetic',
    static_friction: 'friction_static_kinetic',
    kinetic_friction: 'friction_static_kinetic',
    coefficient_of_friction: 'friction_static_kinetic',
    mu_s: 'friction_static_kinetic',
    mu_k: 'friction_static_kinetic',
    kirchhoffs_law: 'kirchhoffs_laws',
    // Legacy parent-bundle redirects (post-split). See PROGRESS.md 2026-04-18
    // for the split history. Each bundle routes to its foundational atomic child.
    vector_basics: 'unit_vector',
    vector_addition: 'resultant_formula',
    vector_components: 'vector_resolution',
    scalar_vs_vector: 'current_not_vector',
    distance_vs_displacement: 'distance_displacement_basics',
    uniform_acceleration: 'three_cases',
    non_uniform_acceleration: 'a_function_of_t',
    motion_graphs: 'xt_graph',
    relative_motion: 'vab_formula',
    river_boat_problems: 'upstream_downstream',
    rain_umbrella: 'apparent_rain_velocity',
    aircraft_wind_problems: 'ground_velocity_vector',
    projectile_motion: 'time_of_flight',
    projectile_inclined: 'up_incline_projectile',
    relative_motion_projectiles: 'two_projectile_meeting',
};

export function normalizeConceptId(id: string | null | undefined): string | null {
    if (!id) return null;
    const slug = id.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
    if (VALID_CONCEPT_IDS.has(slug)) return slug;
    const aliased = CONCEPT_SYNONYMS[slug];
    if (aliased && VALID_CONCEPT_IDS.has(aliased)) return aliased;
    return null;
}

// ══════════════════════════════════════════════════════════════════
// CLASSIFIER_PROMPT ↔ VALID_CONCEPT_IDS drift detector.
// Runs once at module load (dev only). Parses the concept IDs advertised in
// the prompt against VALID_CONCEPT_IDS + CONCEPT_SYNONYMS and logs a warning
// for any mismatch. This is the sentinel that catches session-31.5 + 32's
// silent failure class: the prompt advertised legacy bundle names that were
// split months earlier, Gemini returned them, `normalizeConceptId` silently
// resolved to the wrong atomic child, and downstream pipelines misrouted.
//
// Any concept a json_author registers in VALID_CONCEPT_IDS must also appear in
// the prompt's valid list — otherwise Gemini won't know to return it. Any
// concept in the prompt that's not in VALID_CONCEPT_IDS (and isn't an alias)
// is a stale entry — prune it.
//
// Reads only the "VALID CONCEPT IDs" block (before "CRITICAL DISAMBIGUATION")
// so disambiguation hint IDs are free to reference valid concepts without
// re-declaration.
// ══════════════════════════════════════════════════════════════════

function extractAdvertisedConcepts(prompt: string): Set<string> {
    const anchor = 'VALID CONCEPT IDs — you MUST return one of these exactly as written:';
    const start = prompt.indexOf(anchor);
    const end = prompt.indexOf('CRITICAL DISAMBIGUATION');
    if (start < 0 || end < 0 || end <= start) return new Set();
    const block = prompt.slice(start, end);
    const ids = new Set<string>();
    for (const raw of block.split('\n')) {
        const trimmed = raw.trim();
        // Skip section separators (── Heading ──), the anchor itself, and empty lines.
        if (!trimmed || trimmed.startsWith('──') || trimmed.startsWith('════') || trimmed.startsWith('VALID CONCEPT')) continue;
        // First token on a concept line is the slug (lowercase + underscores).
        const match = trimmed.match(/^([a-z][a-z0-9_]*)/);
        if (match) ids.add(match[1]);
    }
    return ids;
}

function assertClassifierPromptInSync(): void {
    const advertised = extractAdvertisedConcepts(CLASSIFIER_PROMPT);
    const missingFromPrompt: string[] = [];
    const unknownInPrompt: string[] = [];

    for (const valid of VALID_CONCEPT_IDS) {
        if (!advertised.has(valid)) missingFromPrompt.push(valid);
    }
    for (const adv of advertised) {
        if (!VALID_CONCEPT_IDS.has(adv) && !(adv in CONCEPT_SYNONYMS)) {
            unknownInPrompt.push(adv);
        }
    }

    if (missingFromPrompt.length > 0) {
        console.warn(
            '[intentClassifier] ⚠️ VALID_CONCEPT_IDS not advertised in CLASSIFIER_PROMPT:',
            missingFromPrompt.join(', '),
            '\n  → Gemini will never classify queries to these IDs until the prompt lists them.',
            '\n  → json_author registration site #8: add each new atomic ID to the prompt\'s VALID CONCEPT IDs block.',
        );
    }
    if (unknownInPrompt.length > 0) {
        console.warn(
            '[intentClassifier] ⚠️ CLASSIFIER_PROMPT advertises IDs not in VALID_CONCEPT_IDS or CONCEPT_SYNONYMS:',
            unknownInPrompt.join(', '),
            '\n  → Gemini may return these, `normalizeConceptId` will reject them, and /api/chat will fail.',
            '\n  → Prune the prompt or add the ID to VALID_CONCEPT_IDS.',
        );
    }
}

// The assertion runs at the bottom of this file — after CLASSIFIER_PROMPT is
// defined — to avoid a temporal-dead-zone ReferenceError.

const CLASSIFIER_PROMPT = `You are a physics question analyzer for Indian Class 10-12 students.

════════════════════════════
VALID CONCEPT IDs — you MUST return one of these exactly as written:
════════════════════════════
  ── Current electricity (Ch.3) ──
  ohms_law              ← V=IR, non-ohmic conductors, current same through series resistors
  parallel_resistance   ← 1/R = 1/R1 + 1/R2, current splits across branches
  series_resistance     ← R = R1 + R2, same current through every element
  kirchhoffs_voltage_law
  kirchhoffs_current_law
  kirchhoffs_laws       ← combined KVL+KCL questions
  wheatstone_bridge
  meter_bridge
  internal_resistance
  electric_power_heating ← P=I²R, Joule heating, bulb glows, heating effect
  drift_velocity
  resistivity
  resistance
  temperature_dependence_of_resistance
  resistance_temperature_dependence
  potentiometer

  ── Vectors (Ch.5) ── atomic splits
  vector_resolution        ← resolving a force/vector at an angle into axes
  unit_vector              ← definition, magnitude, direction of unit vector
  angle_between_vectors
  scalar_multiplication    ← scaling a vector by a scalar
  negative_vector
  equal_vs_parallel
  current_not_vector       ← why current is scalar despite having direction
  parallelogram_law_test
  pressure_scalar          ← why pressure is scalar
  area_vector
  resultant_formula        ← R = sqrt(P² + Q² + 2PQcosθ), triangle/parallelogram
  special_cases            ← θ=0, θ=90, θ=180 specific resultant outcomes
  range_inequality         ← |P−Q| ≤ |R| ≤ P+Q
  direction_of_resultant   ← tanα = Qsinθ/(P+Qcosθ)
  unit_vector_form         ← a = axî + ayĵ + azk̂
  inclined_plane_components ← mgsinθ along incline, mgcosθ perpendicular
  negative_components
  dot_product              ← A·B = AB cosθ, scalar product

  ── Kinematics (Ch.6-7) ── atomic splits
  distance_displacement_basics   ← path length vs displacement
  average_speed_velocity
  instantaneous_velocity
  sign_convention
  s_in_equations
  three_cases             ← v = u + at / s = ut + ½at² / v² = u² + 2as
  free_fall
  sth_formula             ← s_nth displacement in n-th second
  negative_time
  a_function_of_t
  a_function_of_x
  a_function_of_v
  initial_conditions
  xt_graph                ← position-time graph interpretation
  vt_graph                ← velocity-time graph interpretation
  at_graph                ← acceleration-time graph interpretation
  direction_reversal

  ── Relative motion (Ch.6.10-6.13) ── atomic splits
  vab_formula             ← v_AB = v_A − v_B, 1D/2D relative velocity definition
  relative_1d_cases
  time_to_meet
  upstream_downstream     ← boat in river, along vs against stream
  shortest_time_crossing
  shortest_path_crossing
  apparent_rain_velocity  ← v_rain_rel = v_rain − v_person (magnitude + direction)
  umbrella_tilt_angle     ← tanθ = v_person / v_rain, which way to tilt umbrella
  ground_velocity_vector  ← aircraft + wind: v_ground = v_air + v_wind
  heading_correction      ← pilot's heading to counter crosswind

  ── Projectiles (Ch.7.6-7.8) ── atomic splits
  time_of_flight          ← T = 2u sinθ / g
  max_height              ← H = u² sin²θ / 2g
  range_formula           ← R = u² sin2θ / g
  up_incline_projectile   ← projectile up an inclined plane
  down_incline_projectile ← projectile down an inclined plane
  two_projectile_meeting
  two_projectile_never_meet

  ── Forces (Ch.8) ──
  field_forces            ← gravitational force, electrostatic force, weight = mg
  contact_forces          ← normal + friction at contact surface, resultant
  normal_reaction         ← N perpendicular to surface, N = mg cosθ on incline
  tension_in_string       ← rope tension, Atwood machine, T = 2m₁m₂g/(m₁+m₂)
  hinge_force             ← pin joint, rod on wall, hinge reaction
  free_body_diagram       ← FBD, isolate body, force diagram
  friction_static_kinetic ← static vs kinetic friction, μₛ vs μₖ, push almirah, slipping threshold
  newton_second_law_direction ← F = m·a as a vector equation, direction matters, a along F not v

  ── Electric Charges and Fields (Class 12 Ch.1) ──
  coulombs_law                    ← force between two point charges F = k q₁q₂/r², k ≈ 9×10⁹; like charges repel / unlike attract; equal & opposite pair (Newton's 3rd); 1/r² inverse-square falloff; F ∝ q₁q₂; vector form along the line joining; superposition (net force = vector sum)
  electric_field_point_charge     ← electric field of a point charge E = kQ/r², radial direction (out for +Q, in for −Q), field lines, line density = field strength, E = F/q
  charge_distribution             ← linear (λ), surface (σ), volume (ρ) charge density; field of an extended/continuous charge
  electric_flux                   ← electric flux Φ = ∫E·dA; flux through a surface, dependence on field strength and orientation; net flux through a closed surface (stops at net flux ∝ enclosed charge — does NOT introduce ε₀ or Φ = q/ε₀)
  gauss_law                       ← Gauss's law STATEMENT: net flux through ANY closed (Gaussian) surface = q_enc/ε₀; ε₀ = 8.854×10⁻¹² is a fixed constant of nature; net set ONLY by the enclosed charge (independent of the surface's shape/size); a charge outside contributes zero; q_enc is the signed algebraic sum Σ qᵢ. Statement only — no E-from-symmetry derivation.
  gauss_law_sphere                ← APPLYING Gauss's law + spherical symmetry to a uniformly charged SHELL to SOLVE for E(r): E = 0 everywhere inside (r<R), E = kq/r² = q/(4πε₀r²) outside (r≥R, like a point charge at the centre); r from the CENTRE not the surface; external field independent of shell radius R; E jumps from 0 to peak kq/R² at the surface; shielding (E=0 inside a hollow charged shell). The E-FROM-SYMMETRY application for a shell — NOT the bare statement (gauss_law) and NOT the flux definition Φ=E·A (electric_flux).
  force_on_charge_in_field        ← force on a charge placed in a field F = qE, direction by sign (along E for +q, opposite for −q), constant force in a uniform field, a = qE/m, parabolic deflection of a launched charge
  electric_dipole_in_field        ← electric dipole in a UNIFORM field: torque τ = p × E = pE sin θ, the force couple ±qE with zero net force, rotation toward alignment, stable (θ=0) vs unstable (θ=180°) equilibrium, potential energy U = −pE cos θ

  ── Moving Charges and Magnetism (Class 12 Ch.4) ──
  magnetic_field_concept_B        ← what a magnetic field IS: a vector field sourced by MOVING charge (current), revealed (not created) by a compass; B circulates around the wire; no current = no field; just like E but from moving charge. Does NOT cover the magnitude B = μ₀I/(2πr).
  magnetic_field_wire             ← B around a straight current-carrying wire, B = μ₀I/(2πr), right-hand rule (thumb = I, fingers = B)
  biot_savart_law                 ← the Biot-Savart law itself: dB = (μ₀/4π) I(dl × r̂)/r² for a current element, sinθ dependence, summed/integrated to recover B = μ₀I/(2πr)
  magnetic_force_moving_charge    ← Lorentz force F = q v × B on a moving charge: the MAGNITUDE F = qvB sinθ and the resulting circular/cyclotron motion (radius r = mv/qB)
  magnetic_force_direction_right_hand_rule ← which WAY the magnetic force points: the right-hand rule for F = q v × B (fingers v, curl to B, thumb F), F ⊥ both v and B, a negative charge flips F by 180°, ⊗/⊙ into/out-of-page, v∥B → F = 0. DIRECTION only — no magnitude, no F = qvB sinθ, no circular motion.
  magnetic_force_perpendicular_no_work ← why a magnetic force can NEVER change a charge's SPEED: F ⊥ v at every instant → W = F·d·cos90° = 0 → ΔKE = 0 (work-energy theorem) → |v| is locked; the force only TURNS the velocity, never adds energy ("steers, not accelerates"). NO-WORK / energy only — no magnitude, no F = qvB sinθ, no radius r = mv/qB.
  force_on_current_carrying_wire  ← force on a current-carrying wire F = I L × B, BIL sinθ, the motor force, right-hand rule on L and B
  torque_on_current_loop_in_field ← τ = μ × B on a current loop, magnetic moment μ = NIA, loop ↔ bar magnet equivalence
  magnetic_field_solenoid         ← B = μ₀nI inside a long solenoid, ≈ 0 outside, RHR-swap (fingers = I, thumb = B inside)

CRITICAL DISAMBIGUATION (current electricity):
- "why does current reduce after resistor?" → ohms_law
- "does current decrease as it flows through a resistor?" → ohms_law
- "is current the same before and after a resistor?" → ohms_law
- "what is V=IR?" → ohms_law
- "how does voltage relate to current?" → ohms_law
- "why does a wire get hot when current flows?" → electric_power_heating (NOT ohms_law)
- "why does the bulb glow?" → electric_power_heating
- "joule heating" / "P = I²R" / "heating effect of current" → electric_power_heating

CRITICAL DISAMBIGUATION (vectors, Ch.5):
- "triangle law" / "parallelogram law" / "resultant of two vectors" → resultant_formula
- "direction of resultant" / "angle of resultant vector" → direction_of_resultant
- "resolve a vector" / "x and y components" → vector_resolution
- "dot product" / "scalar product" → dot_product
- "unit vector" → unit_vector
- "i cap j cap k cap" / "vector in ijk form" → unit_vector_form

CRITICAL DISAMBIGUATION (kinematics, Ch.6-7):
- "distance vs displacement" → distance_displacement_basics
- "equations of motion" / "suvat" → three_cases
- "free fall" → free_fall
- "nth second displacement" → sth_formula
- "v-t graph" → vt_graph
- "s-t graph" / "x-t graph" / "position-time graph" → xt_graph
- "a-t graph" → at_graph

CRITICAL DISAMBIGUATION (relative motion, Ch.6.10-6.13):
- "relative velocity" / "v_AB formula" → vab_formula
- "river crossing" / "boat in river" → upstream_downstream (or shortest_time_crossing / shortest_path_crossing for specific crossing strategy)
- "rain falling" / "rain umbrella" without tilt angle question → apparent_rain_velocity
- "at what angle to tilt umbrella" / "umbrella tilt angle" / "tilt my umbrella" → umbrella_tilt_angle
- "aircraft wind" / "plane flying with wind" → ground_velocity_vector
- "pilot heading" / "plane direction correction" → heading_correction

CRITICAL DISAMBIGUATION (projectiles, Ch.7.6-7.8):
- "range of projectile" → range_formula
- "maximum height" → max_height
- "time of flight" → time_of_flight
- "projectile on incline" (upward) → up_incline_projectile
- "projectile on incline" (downward) → down_incline_projectile
- "two projectiles meeting" → two_projectile_meeting

CRITICAL DISAMBIGUATION (electrostatics, Ch.1):
- "coulomb's law" / "force between two charges" / "F = kq₁q₂/r²" / "inverse square law" / "Coulomb force" / "do two charges attract or repel" / "force between point charges" / "superposition of forces" → coulombs_law
- "electric field of a point charge" / "E = kQ/r²" / "field due to a charge" / "electric field lines" / "field lines of a positive/negative charge" / "E = F/q" → electric_field_point_charge
- "charge density" / "linear charge density" / "surface charge density" / "volume charge density" / "λ" / "σ" / "ρ" → charge_distribution
- "field from a rod" / "line of charge" / "charged sheet" / "charged disc" / "sphere of charge" → charge_distribution
- "electric flux" / "Φ" / "flux through a surface" / "E dot A" / "E·A" / "field through an area" / "field through a surface" / "flux through a closed surface" / "net flux" / "how much field passes through" / "∫E·dA" → electric_flux
  (electric_flux is the FLUX of a field through an area — Φ = E·A and net flux through a closed box. Use area_vector ONLY for the geometric area-vector intro — "what is the area vector" / "why does area have a direction" / "A = A n̂" with no field/flux. Route Φ = q/ε₀, the ε₀ constant, and Gauss's-law-as-a-shortcut to gauss_law, NOT here — electric_flux stops at "net flux ∝ enclosed charge" and never names ε₀.)
- "Gauss's law" / "gauss law" / "Φ = q/ε₀" / "flux equals charge over epsilon naught" / "q over epsilon naught" / "q over epsilon zero" / "enclosed charge" / "charge enclosed over epsilon" / "Gaussian surface" / "net flux through a closed surface in terms of charge" / "epsilon naught in flux" → gauss_law
  (gauss_law is the STATEMENT Φ = q_enc/ε₀ with the named constant ε₀ = 8.854×10⁻¹². Anything that asks for the EXACT value of net flux in terms of the enclosed charge, names ε₀, says "Gauss's law", or asks "what is a Gaussian surface" belongs here. electric_flux only sets up "net flux ∝ q_enc" without ε₀; the E-from-symmetry derivation for a sphere/cylinder/sheet is a SEPARATE later concept (gauss_law_sphere), NOT gauss_law.)
- "field inside a shell" / "field outside a charged sphere" / "field of a charged shell" / "E inside a hollow sphere" / "E=0 inside conductor" / "E=0 inside a shell" / "field of a uniformly charged spherical shell" / "shielding" / "electrostatic shielding" / "why is there no field inside a charged ball" / "field of a Van de Graaff dome" / "charged shell acts like a point charge" → gauss_law_sphere
  (gauss_law_sphere is APPLYING Gauss's law + symmetry to SOLVE for the field of a charged SHELL: E=0 inside (r<R), E=kq/r² outside (r≥R). Route here anything asking for the actual field E(r) of a shell/sphere, the inside-is-zero / shielding result, or the outside-looks-like-a-point-charge result. The CUT-LINE: gauss_law_sphere = APPLYING Gauss to get E(r) for a shell; gauss_law = the STATEMENT Φ=q/ε₀ alone; electric_flux = the flux definition Φ=E·A. If the student wants a NUMBER or formula for the field inside/outside a sphere, it is gauss_law_sphere, never gauss_law.)
- "force on a charge in a field" / "F = qE" / "force on a charge between plates" / "why does a charge curve in a field" / "charge deflected by an electric field" / "a = qE/m" → force_on_charge_in_field
- "dipole in a uniform field" / "torque on a dipole" / "τ = pE sinθ" / "p cross E" / "why does a dipole rotate in a field" / "dipole potential energy" / "U = −pE cosθ" / "stable equilibrium of a dipole" → electric_dipole_in_field

CRITICAL DISAMBIGUATION (magnetism, Ch.4):
- "what is a magnetic field" / "where does a magnetic field come from" / "does a current make a magnetic field" / "compass moves near a wire" / "Oersted experiment" / "is a magnetic field like an electric field" / "no current no field" / "moving charge makes magnetic field" → magnetic_field_concept_B
- "field around a wire" / "B-field of a current-carrying wire" / "right-hand rule for wire" / "how strong is the field" / "B = μ₀I/2πr" → magnetic_field_wire
- "Biot-Savart law" / "dB from a current element" / "dl × r" / "where does B = μ₀I/2πr come from" / "field of one current element" / "sinθ in magnetic field" → biot_savart_law
- "how big is the magnetic force" / "F = qvB sinθ" / "magnitude of the Lorentz force" / "cyclotron" / "radius of the circular path" / "r = mv/qB" / "why does the charge go in a circle" → magnetic_force_moving_charge
- "which way does the magnetic force point" / "right-hand rule for a moving charge" / "fingers v curl to B thumb F" / "direction of F = qv × B" / "F perpendicular to v and B" / "does the force flip for a negative charge / electron" / "cross and dot into the page out of the page force" / "v parallel to B force is zero" → magnetic_force_direction_right_hand_rule
- "why does a magnetic force do no work" / "why can't a magnetic field speed up a charge" / "does the speed change in a magnetic field" / "magnetic force only changes direction not speed" / "force perpendicular to velocity does no work" / "why is kinetic energy constant in a magnetic field" / "magnetic field steers but doesn't accelerate" → magnetic_force_perpendicular_no_work
- DISAMBIGUATION: "Lorentz force" or "F = qv × B" alone, asking HOW BIG / circular motion → magnetic_force_moving_charge; asking WHICH WAY / right-hand rule / sign flip / into-the-page → magnetic_force_direction_right_hand_rule; asking WHY NO WORK / why speed doesn't change / "steers not speeds up" / ΔKE = 0 → magnetic_force_perpendicular_no_work; asking the magnitude / radius / period (r = mv/qB, T) → magnetic_force_moving_charge (NOT the no-work concept, which shows no magnitude)
- "force on a current-carrying wire" / "F = IL×B" / "BIL sinθ" / "force on a wire in a magnetic field" / "motor force" → force_on_current_carrying_wire
- "torque on a current loop" / "magnetic moment" / "μ = NIA" / "loop in magnetic field" → torque_on_current_loop_in_field
- "solenoid" / "B inside a solenoid" / "B = μ₀nI" / "turns per metre" / "RHR for solenoid" / "field of a coil" → magnetic_field_solenoid

CRITICAL DISAMBIGUATION (forces, Ch.8):
- "gravitational force" / "weight of object" → field_forces
- "normal force" / "N = mg cosθ" → normal_reaction
- "friction and normal force together" → contact_forces
- "tension in rope" / "Atwood machine" → tension_in_string
- "hinge force on rod" → hinge_force
- "draw FBD" / "free body diagram" / "forces on block" → free_body_diagram
- "static vs kinetic friction" / "μₛ vs μₖ" / "why is it easier to push once moving" / "when does block slip" / "coefficient of friction" → friction_static_kinetic
- "F = ma" / "Newton's second law" / "direction of acceleration" / "force and direction" / "does velocity follow force" / "F = mv mistake" → newton_second_law_direction

If the student question matches any of the above concepts, return that exact
concept_id string. Do NOT invent variations (e.g. "ohms_law_basic",
"current_reduction_due_to_resistance", "kvl_single_loop"). Do NOT modify,
hyphenate, or paraphrase these strings. These exact IDs exist in the database —
returning any other string for these topics will cause a pipeline failure.

For questions that do NOT match any of the above, return concept_id: "unknown"
════════════════════════════

Analyze this question and output a JSON fingerprint.

STUDENT QUESTION: "{QUESTION}"
STUDENT CLASS: "{CLASS}"
STUDENT MODE: "{MODE}"

MODE meanings:
- "conceptual" = student wants deep intuition, analogies, visual understanding. No exam pressure.
- "board" = student preparing for CBSE/State boards. Needs NCERT language, marks format.
- "jee" = student preparing for JEE/NEET. Needs tricks, traps, shortcuts, edge cases.

Respond with ONLY a valid JSON object. No markdown code blocks. No explanation.
Start your response with { and end with }

Example output (EXACTLY 6 fields, no more, no less):
{
  "concept_id": "ohms_law",
  "intent": "specific_confusion",
  "class_level": "12",
  "mode": "conceptual",
  "aspect": "none",
  "confidence": 0.9
}

════════════════════════════
RULES FOR concept_id:
════════════════════════════
Must be SPECIFIC sub-concept in snake_case.

GOOD (specific):
  "parallel_plate_capacitor_basic"
  "capacitor_energy_storage"
  "capacitor_charging_rc_circuit"
  "capacitor_discharging_rc_circuit"
  "kvl_single_loop"
  "kvl_multi_loop"
  "resistance_temperature_dependence"
  "wire_resistance_length_area"
  "ohms_law_basic"
  "ohms_law_non_ohmic"

BAD (too vague):
  "capacitor"
  "electricity"
  "circuit"
  "resistance"

Rule: if unsure → add MORE specificity, not less.
"capacitor" → "parallel_plate_capacitor_basic"
"wave" → "transverse_wave_properties"
"lens" → "convex_lens_image_formation"

════════════════════════════
RULES FOR intent:
════════════════════════════
"understand": explain, what is, how does, describe, tell me about, show me, visualize
"derive": derive, prove, show that, step by step derivation, how is formula obtained, mathematical proof
"hypothetical": what if, what happens when, if X increases/decreases, effect of changing, what would happen, suppose X doubles
"compare": difference between, compare, X vs Y, which is better, similarities between
"apply": find, calculate, given values present, numerical problem, a wire of resistance X, any question with specific numbers given
"define": define, what do you mean by, definition of, units of, SI unit, formula for
"specific_confusion": student states a WRONG belief or reports contradictory observation that reveals a specific misconception.
  Use this when: "I thought", "isn't it", "shouldn't", "but why does", "I read that", "my book says", "doesn't that mean",
  "why does X happen" (where X contradicts expected behavior), "how can X if Y", "that can't be right because"
  Examples:
  - "why does current reduce after the resistor?" → specific_confusion (student believes current is consumed)
  - "does current decrease after passing through a resistor?" → specific_confusion
  - "I thought current reduces as it flows past a resistor" → specific_confusion
  - "why does the resistor not use up current?" → specific_confusion
  - "why is current same before and after resistor?" → specific_confusion
  - "doesn't resistance reduce current?" → specific_confusion
  - "how can EMF be greater than terminal voltage?" → specific_confusion
  - "how does a parallel circuit draw more current?" → specific_confusion
  - "shouldn't current be less after the bulb?" → specific_confusion

════════════════════════════
RULES FOR aspect:
════════════════════════════
ONLY for hypothetical intent.
For ALL other intents: always "none"

If hypothetical, identify what is changing:
"if length increases" → "length_increasing"
"if area halves" → "area_decreasing"
"if temperature rises" → "temperature_increasing"
"if voltage doubles" → "voltage_increasing"
"if dielectric inserted" → "dielectric_inserted"
"if dielectric removed" → "dielectric_removed"
"if plates move closer" → "separation_decreasing"
"if plates move apart" → "separation_increasing"
"if length doubles and area halves" → "length_up_area_down"
"if resistance doubles" → "resistance_increasing"
"if frequency increases" → "frequency_increasing"

════════════════════════════
RULES FOR variables_changing:
════════════════════════════
Empty [] for non-hypothetical.
Variable symbols for hypothetical:
["L"] ["A"] ["T"] ["V"] ["d"] ["R"] ["f"]
Multiple: ["L", "A"] ["d", "A"]

════════════════════════════
RULES FOR ncert_chapter:
════════════════════════════
Exact chapter name in lowercase.

Class 12 Physics Part 1:
  "electric charges and fields"
  "electrostatic potential and capacitance"
  "current electricity"
  "moving charges and magnetism"
  "magnetism and matter"
  "electromagnetic induction"
  "alternating current"
  "electromagnetic waves"

Class 12 Physics Part 2:
  "ray optics and optical instruments"
  "wave optics"
  "dual nature of radiation and matter"
  "atoms"
  "nuclei"
  "semiconductor electronics"

Class 11 Physics:
  "physical world"
  "units and measurements"
  "motion in a straight line"
  "motion in a plane"
  "laws of motion"
  "work energy and power"
  "system of particles and rotational motion"
  "gravitation"
  "mechanical properties of solids"
  "mechanical properties of fluids"
  "thermal properties of matter"
  "thermodynamics"
  "kinetic theory"
  "oscillations"
  "waves"

Class 10 Physics:
  "light reflection and refraction"
  "human eye and colourful world"
  "electricity"
  "magnetic effects of electric current"
  "sources of energy"

════════════════════════════
RULES FOR confidence:
════════════════════════════
0.95-1.0: Question is clear and specific
0.70-0.94: Question is somewhat ambiguous
Below 0.70: Too vague, needs clarification
  Examples of low confidence:
  "explain that thing" → 0.3
  "I dont understand" → 0.2
  "help me" → 0.1`;

export async function classifyQuestion(
    question: string,
    classLevel: string,
    mode: string
): Promise<QuestionFingerprint | null> {
    const startTime = Date.now();

    try {
        const promptText = CLASSIFIER_PROMPT
            .replace('{QUESTION}', question)
            .replace('{CLASS}', classLevel || '12')
            .replace('{MODE}', mode || 'conceptual');

        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: promptText,
            temperature: 0.05,
            maxOutputTokens: 2048,  // raised from 1024 — truncation still occurring
        });

        logUsage({
            taskType: 'intent_classification',
            provider: 'google',
            model: 'gemini-2.5-flash',
            inputChars: promptText.length,
            outputChars: text.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: (promptText.length / 1_000_000 * 0.30) + (text.length / 1_000_000 * 2.50),
            wasCacheHit: false,
        });

        let fp: Omit<QuestionFingerprint, 'cache_key'>;
        const raw = text;
        console.log('[CLASSIFIER RAW]', JSON.stringify(raw).slice(0, 500));

        try {
            // Strip markdown fences if present
            const clean = raw
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            
            // Attempt 1: direct parse
            fp = JSON.parse(clean);

        } catch (e1) {
            try {
                // Attempt 2: extract just the JSON object if there's surrounding text
                const match = raw.match(/\{[\s\S]*\}/);
                if (!match) throw new Error('No JSON object found');
                fp = JSON.parse(match[0]);
                
            } catch (e2) {
                // Attempt 3: truncated JSON — try to close it and parse
                try {
                    const match = raw.match(/\{[\s\S]*/);
                    if (!match) throw new Error('No opening brace found');
                    
                    // Count unclosed braces and close them
                    const partial = match[0];
                    const opens = (partial.match(/\{/g) || []).length;
                    const closes = (partial.match(/\}/g) || []).length;
                    const closed = partial + '}'.repeat(Math.max(0, opens - closes));
                    fp = JSON.parse(closed);
                    
                } catch (e3) {
                    // All attempts failed (likely truncation) — return safe unknown fingerprint.
                    // parse_failed: true tells chat/route to skip MVS + cache entirely.
                    // Do NOT build concept_id from raw question text — that produces invented ids.
                    console.error('[CLASSIFIER] All parse attempts failed (truncated?):', raw.slice(0, 120));
                    return {
                        concept_id: 'unknown',
                        intent: 'understand' as Intent,
                        class_level: classLevel || '12',
                        mode: mode || 'conceptual',
                        aspect: 'none',
                        cache_key: '',   // empty — cache must be skipped
                        confidence: 0,
                        parse_failed: true,
                    };
                }
            }
        }

        let cache_key = [
            fp.concept_id,
            fp.intent,
            fp.class_level,
            fp.mode,
            fp.aspect,
        ].join('|');

        console.log('[CLASSIFIER] base key:', cache_key);
        console.log('[CLASSIFIER] confidence:', fp.confidence);

        return { ...fp, cache_key } as QuestionFingerprint;

    } catch (err) {
        console.error('[CLASSIFIER] error:', err);
        return null;
    }
}

// Run the boot-time drift assertion after CLASSIFIER_PROMPT is fully defined.
// Console-only (no throw) so production boots even if someone forgets the sync
// step — but the warning is loud enough that dev + CI notice on first request.
if (process.env.NODE_ENV !== 'production') {
    assertClassifierPromptInSync();
}
