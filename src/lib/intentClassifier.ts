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
    'combination_of_resistors', 'emf_definition',
    'electrical_power_in_resistor',
    'kirchhoff_junction_rule_KCL', 'kirchhoff_loop_rule_KVL',
    'temperature_dependence_of_resistance', 'resistance_temperature_dependence',
    'potentiometer',
    // Combination of cells — direct sequel of emf_definition/internal_resistance
    // (series signed emf/r sum, parallel identical-cell current sharing, the
    // series-vs-parallel load-matching decision). Alex pipeline, 2026-07-14.
    'combination_of_cells',
    // Vectors / kinematics (Ch.5-7)
    'vector_resolution',
    // Atomic splits from former vector_basics bundle (Ch.5.2)
    'unit_vector', 'angle_between_vectors', 'scalar_multiplication',
    'negative_vector', 'equal_vs_parallel',
    // scalar_vs_vector is now a real, standalone concept (Class 11 Mechanics
    // Ch.1 "Vectors" — the DAG root; prerequisites: []). It is NOT a redirect
    // to current_not_vector anymore — see CONCEPT_SYNONYMS below, that alias
    // was removed 2026-07-23.
    'scalar_vs_vector',
    // vector_addition_law — concept #2 of the new Class 11 Mechanics Ch.1
    // "Vectors" DAG track (prerequisite: scalar_vs_vector). Alex pipeline,
    // 2026-07-24.
    'vector_addition_law',
    // resultant_direction — concept #3 of the Vectors DAG track (prerequisite:
    // vector_addition_law) — direction of the resultant, tan alpha = B sin
    // theta / (A + B cos theta). Alex pipeline, 2026-07-24. NOT a synonym of
    // the legacy 'direction_of_resultant' id below (byte-frozen, untouched).
    'resultant_direction',
    // Atomic splits from former scalar_vs_vector bundle (Ch.5.1)
    'current_not_vector', 'parallelogram_law_test', 'pressure_scalar',
    'area_vector',
    // Atomic splits from former vector_addition bundle (Ch.5.2)
    'resultant_formula', 'special_cases', 'range_inequality',
    'direction_of_resultant',
    // Atomic splits from former vector_components bundle (Ch.5.3)
    'unit_vector_form', 'inclined_plane_components', 'negative_components',
    'dot_product',
    // Kinematics — NEW DAG track (Ch.2, field_3d). Alex pipeline, 2026-07-25.
    // displacement_vs_distance is concept #1 of the Class 11 Kinematics "Motion
    // in a Straight Line" DAG (prerequisite: scalar_vs_vector) — Δx = x_f − x₀
    // (signed, endpoint-only change of position) vs d = accumulated path length
    // (always positive), including the round-trip Δx=0 aha and the
    // signed-direction case. See CONCEPT_SYNONYMS below, which now retires the
    // legacy distance_displacement_basics/distance_vs_displacement bundle names
    // to this atomic (2026-07-25).
    'displacement_vs_distance',
    // Atomic splits from former distance_vs_displacement bundle (Ch.6.1-6.5).
    // distance_displacement_basics RETIRED 2026-07-25 — superseded by the new
    // field_3d displacement_vs_distance atomic above; its legacy JSON is
    // renamed distance_displacement_basics.legacy.json.deleted and both
    // 'distance_displacement_basics' and 'distance_vs_displacement' now
    // redirect via CONCEPT_SYNONYMS.
    'average_speed_velocity',
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
    // Laws of Motion #2 — connected bodies / pulleys (newtons_laws_body field_3d engine)
    'connected_bodies',
    // Laws of Motion #3 — block on an incline, static friction threshold (newtons_laws_body field_3d engine)
    'block_on_incline',
    // Friction (Ch.8.5)
    'friction_static_kinetic',
    // Newton's first law / inertia (Class 11 Ch.8.2 — first concept of the new
    // Laws of Motion field_3d chapter engine, newtons_laws_body scenario,
    // docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md). A body's velocity stays exactly
    // constant (including v=0) unless a NET external force acts on it: a
    // frictionless coast at constant v (F_net = 0.00), the same launch with
    // friction switched on (a real backward force stops it, not "motion
    // wearing off"), and rest as the v=0 case of the SAME law (N = mg,
    // ΣF = 0, balanced not absent forces). Does NOT cover how much a net
    // force changes velocity (newton_second_law), force pairs
    // (newton_third_law), or the friction threshold model (block_on_incline).
    'newton_first_law',
    // Normal force (Class 11 Ch.8.3 — newtons_laws_body field_3d engine,
    // docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md). The normal force is a contact
    // force perpendicular to the surface whose magnitude ADJUSTS to exactly
    // what is needed to stop the body sinking into the surface — it is NOT a
    // fixed "mg", only the flat-ground special case: flat floor (N = mg,
    // lockstep with mass), tilt (N detaches, N = mg*cos(theta)), vertical
    // (nothing presses in, N = 0, free fall at g), and a two-body contrast
    // where the friction ceiling f_max = mu_s*N rides on N, not weight (same
    // push, light body slides, heavy body holds). Does NOT cover the
    // friction-threshold break-away angle itself (block_on_incline owns
    // tan(theta_c) = mu_s), the accelerating-lift case N = m(g +/- a)
    // (deferred), or drawing complete free-body diagrams (free_body_diagram).
    // Distinct from the legacy mechanics_2d 'normal_reaction' concept, which
    // both remain valid concept IDs for now (founder synonym decision
    // pending — see docs/loop_runs/lom/normal_force/skeleton.md §8).
    'normal_force',
    // Newton's second law / F = ma (Class 11 Ch.8.4 — second concept of the
    // Laws of Motion field_3d chapter engine, newtons_laws_body scenario,
    // docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md). A net force gives a body
    // ACCELERATION — proportional to the force and inversely proportional to
    // the mass (a = ΣF/m): a steady force from rest (a pins, v climbs
    // without limit), same force / different mass (double m, half a), same
    // mass / different force (double F, double a). Does NOT cover why zero
    // net force means constant velocity (newton_first_law), force pairs
    // (newton_third_law), drawing all forces (free_body_diagram), friction
    // or inclines (block_on_incline), or the vector/direction form of the
    // law (newton_second_law_direction).
    'newton_second_law',
    // Newton's third law / action-reaction (Class 11 Ch.8.5 — third concept
    // of the Laws of Motion field_3d chapter engine, newtons_laws_body
    // scenario, docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md). Forces come in
    // pairs: when body 1 pushes body 2, body 2 simultaneously pushes body 1
    // with EQUAL magnitude and OPPOSITE direction, and because the two
    // forces act on DIFFERENT bodies they never cancel: a symmetric push
    // (equal masses recoil equally), unequal masses (arrows stay identical,
    // accelerations split 3:1), and isolating one body's own diagram (mg/N
    // cancel because they share a body; the pair's partner force never
    // does). Does NOT cover how much a force accelerates a body
    // (newton_second_law), drawing complete force diagrams
    // (free_body_diagram), friction or inclines (block_on_incline),
    // string-coupled bodies (connected_bodies), or momentum conservation.
    'newton_third_law',
    // Friction Force (Class 11 Ch.8.6 — fourth concept of the Laws of Motion
    // field_3d chapter engine, newtons_laws_body scenario, Branch A, FLAT
    // push only — docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md). Static friction is
    // not a fixed value — it self-adjusts to exactly cancel an applied push
    // up to a ceiling f_max = μₛN, past which the body breaks free and
    // friction DROPS to the smaller constant kinetic value μₖN: no push
    // means zero friction even though the ceiling is ready, a rising push
    // tracked in exact lockstep below the ceiling, the break-away snap at
    // F = μₛN, two identical blocks at one force showing two different
    // fates (resting holds, already-sliding runs away), and kinetic
    // friction's speed-independence (fast and slow glides read the same f).
    // Does NOT cover the incline decomposition or tan θ = μₛ break-away
    // angle (block_on_incline), the full friction-opposes-relative-motion
    // direction subtlety, or the legacy friction_static_kinetic bundle.
    'friction_force',
    // Rolling Friction (Class 11 Ch.5.9 — sixth concept of the Laws of
    // Motion field_3d chapter engine, newtons_laws_body scenario, Branch A +
    // SEAM G bodies[].shape:'wheel' — docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md).
    // Same mass, same push, two contact types: a sliding block (μₖ = 0.40)
    // and a rolling wheel (μᵣ ≈ 0.002) obey the SAME law f = μN, but the
    // rolling coefficient is about 200x smaller — the wheel crosses the
    // whole track while the block barely moves. Confronts "rolling means
    // frictionless" (the wheel's friction reads nonzero and it visibly
    // slows while coasting) and shows both frictions grow with load, but
    // only the sliding side's growth can stop motion entirely (STATE_4).
    // Does NOT cover rotational dynamics (no torque, no moment of inertia,
    // no angular acceleration) or re-teach static vs kinetic friction
    // (owned by the sibling friction_force — this concept fixes μₛ = μₖ on
    // the block deliberately).
    'rolling_friction',
    // Tension Force (Class 11 Ch.8.4 — fifth concept of the Laws of Motion
    // field_3d chapter engine, newtons_laws_body scenario: Branch B/pulley
    // then SEAM H/train — docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md). A string
    // exerts a pull along its own line at both ends, whose SIZE is set by
    // the motion, not by the string itself: at rest T equals the hanging
    // weight, but that is a special case (T = m2g only when a = 0); once
    // released, T = m2(g-a) drops strictly below the weight; one ideal
    // string carries one tension throughout (an ideal pulley changes
    // direction only, never size); and a CHAIN of separate strings carries
    // a DIFFERENT tension in each one — a string only moves the mass behind
    // it, so T1 != T2. Does NOT re-derive the shared-|a|/one-T pulley
    // SOLVING METHOD, T != m2g as a solving step, the incline variant, or
    // Atwood (all owned by the sealed connected_bodies sibling — this
    // concept teaches what tension IS and the same-vs-different question,
    // not the elimination method). Distinct from the legacy mechanics_2d
    // tension_in_string bundle (bare formula lookup, kept for historical
    // cache compatibility only).
    'tension_force',
    // Equilibrium of Particles (Class 11 Ch.8.5 — eighth concept of the Laws of
    // Motion track, and the FIRST on the force_rig field_3d engine, Branch A
    // `force_table` — docs/loop_runs/lom_g/_engine/force_rig_json_contract.md).
    // A particle acted on by several concurrent forces is in equilibrium when,
    // and only when, the vector sum of those forces is zero — which means each
    // direction balances on its own (ΣFₓ = 0 AND ΣF_y = 0). On the force table
    // the hanging weight sets each string's tension exactly (T = m g), so arrow
    // length means something; three UNEQUAL pulls (29.4, 39.2, 49.0 N) sum to
    // nothing while every arrow stays full length; balance is a live condition
    // (move a pulley and the balance point moves with it); and the symmetric
    // two-cable support gives 2 T sin θ = W, so a flatter cable pulls HARDER —
    // without limit as θ → 0, which is why a loaded rope can never be pulled
    // perfectly straight. Does NOT cover friction as a balancing force
    // (friction_force), equilibrium on an incline (block_on_incline), connected
    // bodies and shared acceleration (connected_bodies, tension_force), torque
    // or rotational equilibrium (a particle is a point — no lever arm), or
    // Lami's theorem (deliberately cut: the engine exposes no inter-string angle
    // readout, so it could only be asserted in text, never shown).
    'equilibrium_of_particles',
    // Uniform Circular Motion (Class 11 Ch.4 §4.11 + Ch.5 §5.9 — retrofitted
    // 2026-08-01 onto the force_rig field_3d engine, Branch B `whirl` —
    // docs/loop_runs/lom_g/_engine/force_rig_json_contract.md). A body
    // circling at constant SPEED is not in equilibrium: its velocity's
    // direction is always changing, so it needs a net inward force, here the
    // string's tension, T = m ω² r, growing with the SQUARE of the spin rate.
    // Cut the string and the body departs straight along the tangent at
    // unchanged speed — no outward force is ever drawn or ever existed. Once
    // gravity joins (a conical pendulum), the SAME tension splits into a
    // vertical component balancing weight and a horizontal component that is
    // the net inward force, and the cone angle is SOLVED, never chosen:
    // cos θ = g / (ω²L), so the string approaches horizontal but never
    // reaches it, and below ω = √(g/L) no cone exists at all — the bob simply
    // hangs. Does NOT cover the kinematic derivation a = v²/r (that is
    // centripetal_acceleration_kinematic, not yet shipped), a car on a level
    // or banked road (circular_motion_banking), non-uniform vertical circular
    // motion, or centrifugal force as a rotating-frame tool.
    'uniform_circular_motion',
    // Work, Energy and Power #1 (Class 11 Ch.6.3 — the chapter's opener, on
    // the newtons_laws_body field_3d engine extended with the SEAM K/L/M/N
    // energy layer, docs/loop_runs/ch6_state.md). Work done by a CONSTANT
    // force is W = F·d·cos θ: force acting through a displacement, and only
    // the component of the force ALONG that displacement — a steady pull
    // moving a crate from rest (the joule, live), the same pull against a
    // rough floor that never lets it move (the PRIMARY aha: exactly zero
    // work, however hard the push), the same pull tilted upward (half the
    // joules per metre, cos θ), a live numeric prediction stamped against
    // the meter's own reading, and the general vector form W = F⃗·d⃗ at a
    // third angle. Covers θ from 0° up to (not including) 90° ONLY —
    // zero/negative work and the full sign taxonomy across all three angle
    // regimes are deliberately deferred to the sibling
    // positive_negative_zero_work (concept #2). Does NOT cover kinetic
    // energy, the work-energy theorem, or power. Alex pipeline, 2026-08-01.
    'work_done_by_constant_force',
    // Work, Energy and Power #2 (Class 11 Ch.6.3 — same newtons_laws_body
    // field_3d engine + SEAM K/L/M/N energy layer as #1, opening the F_ang
    // regime #1 ceded, 0…180° instead of #1's 0…85°). The work done by a
    // force carries a SIGN, set by the angle between the force and the
    // displacement: positive along the motion (a forward pull), zero at 90°
    // (the normal force, acting the whole way and doing nothing), negative
    // against the motion (kinetic friction on a launched crate, decelerating
    // it to a permanent stop), and net work is the signed sum over every
    // force acting (four bars: pull, friction, normal, net). Covers the full
    // sign taxonomy across all three angle regimes AND the sole obtuse-angle
    // sign-flip state. Does NOT cover kinetic energy, the work-energy
    // theorem, or power, and assumes work_done_by_constant_force's
    // definition/joule/cos θ for 0°≤θ<90° as prerequisite. Alex pipeline,
    // 2026-08-02.
    'positive_negative_zero_work',
    // Work, Energy and Power #3 (Class 11 Ch.6.4 — same newtons_laws_body
    // field_3d engine, and the FIRST concept in the fleet to author the SEAM L
    // energy_layer, i.e. the live K bar). A moving body HAS kinetic energy,
    // K = ½mv², measured in joules: proportional to the mass, proportional to
    // the SQUARE of the speed (two identical carts at 2 and 4 m/s read 10.0 J
    // and 40.0 J — four times, not twice, the PRIMARY aha), a scalar with no
    // direction and no sign (two carts at the same speed in opposite
    // directions read the same 22.5 J), and exactly 0.0 J at rest. Does NOT
    // cover what CHANGES kinetic energy (that is work_energy_theorem), where
    // the energy goes when friction stops a body, potential energy,
    // conservation, or power — and it authors no work bar and never uses the
    // word 'work'. It does NOT require work_done_by_constant_force or
    // positive_negative_zero_work: kinetic energy is fully teachable without
    // work, which is what keeps the boundary clean. Alex pipeline, 2026-08-02.
    'kinetic_energy_definition',
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
    // E-from-symmetry for a uniformly charged SOLID (insulating) sphere: E grows
    // LINEARLY inside (E = kq·r/R³, q_enc = q·(r/R)³, zero at the centre), equals
    // kq/r² outside, and is CONTINUOUS at r=R (peak at the surface, no jump).
    // Reuses the field_3d gauss_law_sphere scenario with gauss_sphere.distribution
    // = 'solid'. Distinct from the hollow shell (gauss_law_sphere). Prereqs
    // gauss_law + electric_flux.
    'gauss_law_solid_sphere',
    // E-from-symmetry for an INFINITE LINE / WIRE of uniform linear charge density
    // λ (Class 12 Ch.1.15): cylindrical symmetry → E radial, ⊥ to the line, constant
    // on a coaxial ring; a coaxial Gaussian CYLINDER (the two flat end caps carry
    // zero flux, only the curved wall counts) gives Φ = E·(2πrL) = λL/ε₀, the L
    // cancels ⇒ E = λ/(2πε₀r). The headline: the line falls off as 1/r, NOT 1/r²
    // like a point charge (the cylinder area 2πrL grows LINEARLY with r, a sphere's
    // 4πr² grows quadratically). Distinct from the sphere siblings (1/r² / ramp-then-
    // 1/r²) and from the bare statement (gauss_law) / flux definition (electric_flux).
    // WIRE / LINE ONLY — no plane/sheet, no finite-line end effects. NEW field_3d
    // gauss_law_line scenario. Prereqs gauss_law + electric_flux + charge_distribution.
    'gauss_law_line',
    // E-from-symmetry for an INFINITE PLANE SHEET of uniform surface charge density
    // σ (Class 12 Ch.1.15): planar symmetry → E ⊥ the sheet, pointing away on BOTH
    // sides, equal everywhere; a Gaussian PILLBOX (the curved wall carries zero flux,
    // only the two flat caps count — the exact INVERSE of the line's cylinder) gives
    // Φ = 2EA = σA/ε₀, the A cancels ⇒ E = σ/(2ε₀). The headline: the field is
    // CONSTANT — it does NOT fall off with distance at all (unlike the line's 1/r or
    // the point's 1/r²), because the pillbox encloses the same σA patch however far
    // out the caps sit. The ½ comes from flux leaving BOTH caps, so an ISOLATED sheet
    // gives σ/2ε₀, distinct from the σ/ε₀ conductor-surface / between-two-plates case
    // (a DIFFERENT concept). SHEET / PLANE ONLY — no line/sphere, no edge effects. NEW
    // field_3d gauss_law_sheet scenario. Prereqs gauss_law + electric_flux + charge_distribution.
    'gauss_law_sheet',
    // Force on a charge placed in an electric field, F = qE (Class 12 Ch.1.7 —
    // companion/inverse of electric_field_point_charge; field_3d uniform_field_force
    // scenario: uniform plate field, constant force, parabolic deflection, a = qE/m).
    'force_on_charge_in_field',
    // Electric dipole in a uniform external field, τ = p × E (Class 12 Ch.1.12 —
    // field_3d dipole_in_uniform_field scenario: force couple ±qE, zero net force,
    // torque toward alignment, stable/unstable equilibrium, U = −pE cos θ). The
    // electric sibling of torque_on_current_loop_in_field.
    'electric_dipole_in_field',
    // The FIELD OF a dipole itself (Class 12 Ch.1.11 — field_3d scenario): the
    // ± pair's combined E pattern, axial vs equatorial points, 1/r³ falloff.
    // NOT the dipole placed in an external field (electric_dipole_in_field).
    'electric_field_dipole',
    // Electric potential — the MEANING of V (Class 12 Ch.2.1-2.2). V at a point is
    // the work done per unit positive test charge to bring it from infinity to the
    // point: V = W/q. A single SCALAR per location (no direction), path-independent
    // because the electrostatic force is conservative, measured against V(inf)=0; so V
    // is a property of the PLACE, not of the test charge that probes it, and ΔV = V_B
    // − V_A is the per-unit-charge work between two points. Equal-V points wrap the
    // charge as equipotential shells; E is the perpendicular downhill arrow (V is
    // altitude, E is slope). Foundation/meaning diamond — teaches V = W/q and STOPS
    // SHORT of V = kQ/r (deferred to the sibling electric_potential_point_charge,
    // which declares THIS as a prerequisite). Routed to the field_3d
    // point_charge_positive scenario + the new potential primitives (labelled shells,
    // route-animating test charge + work tally, ΔV/inf markers, draggable V explorer).
    // Prereqs electric_field_point_charge + coulombs_law.
    'electric_potential_meaning',
    // Potential of a point charge — the FORMULA/VALUE diamond (Class 12 Ch.2.2). V at
    // distance r from a point charge Q is V = kQ/r, and it falls off as 1/r — ONE power
    // of r, SLOWER than the field's 1/r². CUT-LINE vs electric_potential_meaning: that
    // sibling (the opener) teaches what potential MEANS (V = W/q, work per unit charge);
    // THIS one teaches the point-charge VALUE/FORMULA V = kQ/r and its 1/r falloff. So
    // "V = kQ/r" / "potential at distance r from a point charge" / "why 1/r not 1/r²" /
    // "halve r and V doubles not quadruples" / "equipotential spheres around a point
    // charge" → here; "what potential means" / "V = W/q" / "work per unit charge" →
    // electric_potential_meaning. Halving r DOUBLES V (not ×4); V is a signed scalar
    // (+Q hill, −Q well, no arrow). Routed to the field_3d point_charge_positive scenario
    // (reuses the labelled-shell + draggable potential_explorer primitives) plus a new
    // V-vs-r curve panel (bright 1/r over a dimmed 1/r² ghost meeting at r0=2). Declares
    // electric_potential_meaning as a prerequisite; does NOT re-teach it, and stops short
    // of multi-charge superposition, E = −dV/dr, or capacitance.
    'electric_potential_point_charge',
    // Equipotential surfaces — the GEOMETRY diamond (Class 12 Ch.2.7). An
    // equipotential surface is the locus of all points sharing one common V; for a
    // point charge these are concentric SPHERES (r = kQ/V); the field is everywhere
    // PERPENDICULAR to them and points from high V to low V; NO work is done moving a
    // charge ALONG one (W = F·d·cos90° = 0) while moving BETWEEN surfaces costs
    // W = qΔV; equal V-steps CROWD where the field is strong (r ~ 1/V). CUT-LINE vs
    // the three prerequisite siblings: electric_potential_meaning teaches what V MEANS
    // (V = W/q); electric_potential_point_charge teaches the VALUE/FORMULA V = kQ/r;
    // electric_field_point_charge teaches the VECTOR E = kQ/r². THIS one teaches the
    // GEOMETRY of constant-V surfaces and STOPS SHORT of the value V = kQ/r, the
    // dipole / uniform-field equipotentials, and conductors / capacitance. So "what is
    // an equipotential surface" / "surfaces of constant potential" / "why is the field
    // perpendicular to the equipotential" / "do you do work moving a charge along an
    // equipotential" / "equipotential spheres / lines" / "why do equipotentials get
    // closer together" → here. Routed to the field_3d point_charge_positive scenario
    // (reuses the labelled-shell + draggable explorer primitives) plus the new
    // slide_along_shell cos90° rig, the show_field_lines_cross_shells ⟂ overlay, and
    // per-state shells_override for the equal-V-step crowding relabel. Declares
    // electric_potential_meaning + electric_potential_point_charge + electric_field_point_charge
    // as prerequisites; does NOT re-teach them.
    'equipotential_surfaces',
    // Potential of a dipole — the dipole POTENTIAL/VALUE diamond (Class 12 Ch.2.4).
    // The potential of a dipole at a far point is V = kp cosθ/r², the SCALAR sum
    // of the two charge potentials (V = kq/r₊ − kq/r₋); its SIGN follows cos θ,
    // i.e. POSITION (positive on the +q side, negative on the −q side, not set by
    // which charge "wins"); it is ZERO across the WHOLE equatorial plane (θ=90°),
    // where the field E is nonetheless NON-zero (E = −grad V); and it falls as
    // 1/r² — one power STEEPER than a single charge's 1/r (because +q and −q
    // nearly cancel far away). CUT-LINE vs siblings: electric_potential_point_charge
    // is the SINGLE-charge value V = kQ/r (1/r); electric_field_dipole is the
    // dipole's vector FIELD (and torque), the arrow not the scalar; THIS one is
    // the dipole's scalar POTENTIAL V = kp cosθ/r². Routed to the field_3d
    // dipole_potential scenario (new): two charges + p arrow, draggable probe with
    // a live signed V readout, a two-term superposition callout, a θ-arc far-field
    // formula callout, a sign-by-position recolor, the equatorial V=0 disc with a
    // persistent non-zero E arrow, a V-vs-θ cosine curve, a dipole-1/r² over
    // point-charge-1/r ghost falloff curve, and 2D equipotential contour lobes.
    // Declares electric_potential_point_charge + electric_potential_meaning +
    // electric_field_dipole as prerequisites; does NOT re-teach them, and stops
    // short of capacitance.
    'electric_potential_dipole',
    // Potential of a SYSTEM of charges — the scalar-superposition diamond
    // (Class 12 Ch.2 §2.5). Total V at a point = Σ k qᵢ/rᵢ, a SCALAR sum of
    // each charge's signed contribution: every charge counts (distance shrinks
    // a term, never zeroes it), an equal +q/−q equidistant pair cancels
    // exactly, and the FIELD at the same point needs vector addition while V
    // is one easy scalar sum. Declares electric_potential_point_charge,
    // electric_potential_dipole and electric_potential_meaning as
    // prerequisites; does NOT re-teach them, and stops short of capacitance.
    'electric_potential_system_of_charges',
    // Potential ENERGY of a system of charges (Class 12 Ch.2 §2.8). U = Σ k qᵢqⱼ/rᵢⱼ
    // over every unique pair — the work to assemble the charges from infinity. Each
    // pair term is signed (like pair +U stored, unlike pair −U released), adding a
    // charge adds a term with EVERY existing charge (N−1 new terms), and U is one
    // path-independent number for the whole system. The ENERGY companion to
    // electric_potential_system_of_charges (the scalar potential V at a point).
    // Declares electric_potential_system_of_charges, coulombs_law and
    // electric_potential_meaning as prerequisites; stops short of capacitor energy.
    'potential_energy_system_of_charges',
    // Potential energy in an EXTERNAL field (Class 12 Ch.2 §2.8): U = qV for a
    // charge sampling a GIVEN external potential, U = q₁V₁+q₂V₂ for a system, and
    // U = −p·E for a dipole (two qV terms collapsed). The EXTERNAL-field energy —
    // DISTINCT from the mutual PE kq₁q₂/r of potential_energy_system_of_charges.
    'potential_energy_in_external_field',
    // Parallel-plate capacitor field — the UNIFORM-field diamond (Class 12 Ch.2). The
    // field between two oppositely charged parallel plates is UNIFORM: straight,
    // parallel, equally-spaced lines from + to −, the SAME magnitude E = V/d = σ/ε₀ at
    // every interior point, independent of position; ≈0 outside (the two sheets' fields
    // cancel) with only a small edge fringe; at fixed V, E ∝ 1/d. Built by superposing
    // two charged-sheet fields (each σ/2ε₀, add inside, cancel outside). Declares
    // electric_field_point_charge + gauss_law_sheet + electric_potential_meaning as
    // prerequisites; does NOT teach capacitance C = ε₀A/d, energy ½CV², or dielectrics.
    // Routed to the field_3d parallel_plates scenario.
    'parallel_plate_capacitor_field',
    // Capacitance — a capacitor's charge and voltage always move in lockstep
    // so their ratio C = Q/V is a FIXED property of the device — set by
    // geometry alone, C = ε₀A/d — not by how much charge or voltage you give
    // it (Class 12 Ch.2 §2.11-2.12). Opens on the parallel_plate_capacitor_field
    // apparatus and teaches what that diamond deliberately stopped short of.
    // STOPS SHORT of stored energy ½CV², dielectrics, combinations, and RC
    // charging. Routed to the field_3d capacitance scenario.
    'capacitance',
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
    // Magnetic field of a CIRCULAR current LOOP — B = μ₀NI/2R at the centre,
    // axial (⊥ the loop plane, grip RHR), built by superposition (every element's
    // dB at the centre is axial and they ADD, never cancel); and on the axis
    // B(z) = μ₀NIR²/2(R²+z²)^{3/2}, maximal at the centre (Class 12 Ch.4 §4.6,
    // archetype A-meta fused with A). Distinct from biot_savart_law (the single
    // element dB), amperes_circuital_law / magnetic_field_wire (the straight-wire
    // field), current_loop_acts_as_dipole (the bar-magnet identity / m = NIA), and
    // magnetic_field_solenoid (B = μ₀nI). Routed to the field_3d
    // magnetic_field_circular_loop scenario. Prereqs biot_savart_law +
    // magnetic_field_wire.
    'magnetic_field_circular_loop',
    // Ampère's circuital law — ∮B·dl = μ₀ I_enc applied to a long straight wire
    // (Class 12 Ch.4.5). Choose a coaxial circular Amperian loop, use symmetry
    // (|B| constant AND tangent on the loop ⇒ cosθ = 1) to reduce the line integral
    // to ∮B·dl = B·(2πr), set it equal to μ₀I and DERIVE B = μ₀I/(2πr). The
    // integral-law route to the straight-wire field (vs the Biot-Savart
    // element-summation route in biot_savart_law) — returns the SAME field. WIRE
    // ONLY — no solenoid, no toroid, no off-axis / non-symmetric loop. Routed to
    // the field_3d amperes_circuital_law scenario.
    'amperes_circuital_law',
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
    // How BIG the circle is — the radius r = mv/qB for a charge moving
    // perpendicular to a uniform field (Class 12 Ch.4.2). The radius / SIZE
    // sibling of magnetic_force_moving_charge: a charge perpendicular to a
    // uniform B travels in a CLOSED circle whose radius grows with momentum
    // (m or v, the numerator) and tightens with grip (q or B, the denominator),
    // r = mv/qB. The only surfaced quantity is r, and only as a RELATIVE
    // readout. Deliberately teaches NO period T = 2πm/qB (that is the future
    // cyclotron_period_independent_of_speed) and NO force magnitude / qvB sinθ
    // (that is magnetic_force_moving_charge). Routed to the field_3d
    // radius_in_uniform_field scenario.
    'circular_motion_charge_in_uniform_B',
    // The HELIX — a charge entering a uniform field at an ANGLE theta (Class 12
    // Ch.4 §4.3.1). The oblique-entry sibling of circular_motion_charge_in_uniform_B:
    // the across-field part v⊥ = v sinθ circles (r = m v⊥/qB) while the along-field
    // part v∥ = v cosθ sails straight through (v∥ × B = 0, B does no work on it),
    // giving a pitch p = v∥·T per turn. The new surfaced insight is the pitch (a
    // RELATIVE bar, never metres); theta alone sets the SHAPE (p/r = 2π cotθ), v and
    // B only resize the coil. CITES r = mv/qB, T = 2πm/qB and F = qvB sinθ without
    // re-deriving them; no velocity-selector / cyclotron-device / toroid / Ampere /
    // loop / dipole. Routed to the field_3d helix_in_uniform_field scenario.
    'helical_motion_charge_in_uniform_B',
    // How LONG one orbit takes — the period T = 2πm/qB for a charge in a uniform
    // field, and its independence from speed v and radius r (Class 12 Ch.4.2). The
    // PERIOD / TIMING sibling of circular_motion_charge_in_uniform_B: it surfaces
    // the one quantity #4 hid (lap time) and proves a faster charge traces a BIGGER
    // circle but completes each lap in the SAME time — the extra distance is paid by
    // the extra speed (v cancels: T = 2πr/v with r = mv/qB → T = 2πm/qB). The only
    // surfaced quantity is T, and only as a RELATIVE lap-timer (never seconds, never
    // a frequency number). Teaches NO radius re-derivation (cites #4), NO force
    // magnitude / qvB sinθ (that is magnetic_force_moving_charge), and no
    // Ampere / loop / dipole. Routed to the field_3d cyclotron_period scenario.
    'cyclotron_period_independent_of_speed',
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
    // A current loop acts as a magnetic dipole — the FIELD-EQUIVALENCE concept:
    // the loop sources a field identical to a bar magnet's, has moment m = NIA
    // (a vector along the axis), and aligns like a compass in an external field.
    // Distinct from torque_on_current_loop_in_field (τ=μ×B dynamics). Uses the
    // field_3d current_loop_acts_as_dipole scenario.
    'current_loop_acts_as_dipole',
    // The moving-coil galvanometer MECHANISM — how a coil-in-field reads current
    // (Class 12 Ch.4 §4.10, archetype C device sim). The BIL force on the coil's
    // two sides is a couple (ΣF = 0, τ = NIAB); a RADIAL field (concave poles +
    // soft-iron core) keeps τ = NIAB at every angle (no sinθ fade); a hairspring
    // gives τ = kφ; equilibrium NIAB = kφ → φ = (NAB/k)·I (linear → uniform scale);
    // current sensitivity φ/I = NAB/k is a fixed device constant. Distinct from
    // torque_on_current_loop_in_field (the τ=μ×B couple it re-uses) and
    // current_loop_acts_as_dipole (the field-equivalence). Does NOT cover the
    // ammeter/voltmeter shunt-or-series conversion. Routed to the field_3d
    // moving_coil_galvanometer scenario. Prereqs torque_on_current_loop_in_field +
    // force_on_current_carrying_wire.
    'moving_coil_galvanometer',
    // Converting a galvanometer into an AMMETER (small shunt S in parallel,
    // S = Ig·G/(I−Ig), ammeter ≈ 0 Ω in series) and a VOLTMETER (large R in
    // series, R = V/Ig − G, voltmeter ≈ ∞ Ω in parallel). Class 12 Ch.4 §4.11.
    // The downstream CIRCUIT-TOPOLOGY sibling of moving_coil_galvanometer (it
    // re-uses, does NOT re-derive, how the coil reads current). Routed to the
    // field_3d galvanometer_to_ammeter_voltmeter scenario. Prereq moving_coil_galvanometer.
    'galvanometer_to_ammeter_voltmeter',
    // The bar magnet as a MAGNETIC DIPOLE (NCERT Ch.5 §5.2): field lines are
    // continuous CLOSED loops (no monopole — break it → two dipoles), magnetic
    // moment m (S→N, m = NIA), equivalent to a SOLENOID, far field 1/r³ with
    // B_axial = 2·B_equatorial — the electrostatic analog of an electric dipole
    // (m↔p, μ₀/4π↔1/4πε₀). field_3d bar_magnet_as_dipole scenario; opens Ch.5.
    'bar_magnet_as_dipole',
    // A bar magnet IN a uniform external field B (NCERT Ch.5 §5.2.3): pole forces
    // ±mB form a couple → ΣF = 0 but τ = m × B = mB·sinθ rotates it toward
    // alignment; it oscillates about θ=0 with period T = 2π√(I/mB); U = −m·B =
    // −mB·cosθ (θ=0 stable, θ=180° unstable). The magnetic twin of
    // electric_dipole_in_field. field_3d bar_magnet_in_uniform_field scenario.
    'bar_magnet_in_uniform_field',
    // Gauss's Law for Magnetism (NCERT Ch.5 §5.3): the net magnetic flux through
    // ANY closed surface is zero — ∮B·dA = 0 — because magnetic field lines are
    // continuous CLOSED loops (every line that leaves a surface re-enters it) and
    // there is NO magnetic monopole; even a surface around a single pole nets zero.
    // The magnetic twin of the electric gauss_law. field_3d gauss_law_magnetism scenario.
    'gauss_law_magnetism',
    // The Earth's Magnetism (NCERT Ch.5 §5.4): the Earth behaves as a giant bar
    // magnet whose axis is tilted ~11° off the spin axis, so a compass points to
    // MAGNETIC north — the horizontal-plane offset from true north is the DECLINATION
    // D. A freely-pivoting needle DIPS below the horizontal by the DIP angle I; the
    // field splits into horizontal H = B cos I and vertical V = B sin I, with
    // tan I = V/H and B = √(H²+V²). The dip grows with magnetic latitude
    // (tan I = 2 tan λ): 0° at the magnetic equator, 90° at the magnetic poles.
    // field_3d earths_magnetism scenario.
    'earths_magnetism',
    // field_3d magnetisation scenario (§5.5 H / M / χ / μ_r).
    'magnetisation_and_intensity',
    // Faraday's law of electromagnetic induction (Ch.6 §6.3–6.5): magnetic flux
    // Φ = B·A·cosθ; a CHANGING flux induces ε = −N dΦ/dt; Lenz's law = the minus
    // sign. field_3d faraday scenario (moving magnet + coil + galvanometer).
    'faraday_law_induction',
    // Magnetic flux itself (Ch.6 §6.3): Φ = B·A·cosθ counts how many field
    // lines thread a loop's window — a fixed snapshot count, not a flow. Only
    // B/A/θ matter; NO induction, NO EMF, NO change-over-time here (that
    // layers on top in faraday_law_induction). field_3d magnetic_flux_loop
    // scenario (tiltable/resizable loop in a uniform field).
    'magnetic_flux',
    // Motional EMF of a rod sliding on rails (Ch.6 §6.6, spans into §6.7 Energy
    // Consideration): ε = Bvl by two consistent routes (macroscopic dΦ/dt AND
    // microscopic qv×B charge separation), the right-hand rule for polarity,
    // open- vs closed-circuit current, and the energy argument (mechanical
    // work in = I²R heat out). field_3d motional_emf_rod scenario. Prereq
    // faraday_law_induction. Sibling of faraday_law_induction — NOT the same
    // concept (see CRITICAL DISAMBIGUATION below).
    'motional_emf',
    // Eddy currents (Ch.6 §6.8): Lenz's-law consequence inside a BULK
    // conductor (not a wire loop) — a swinging conducting plate crossing a
    // magnetic-field gap develops closed, swirling induced currents at its own
    // edges; connectivity of the current path (slots, lamination), not the
    // material, controls the damping/heating strength. Applications: induction
    // cooktops/furnaces (wanted) vs laminated transformer cores (suppressed).
    // field_3d eddy_current_pendulum scenario. Prereqs faraday_law_induction,
    // motional_emf. Sibling of both — NOT the same concept (see CRITICAL
    // DISAMBIGUATION below). Next in this authoring pass: ac_generator (not yet
    // built — do not invent routing for it).
    'eddy_currents',
    // Inductance — self & mutual (Ch.6 §6.9): SELF — a coil is electrical
    // inertia, ε_L = −L·dI/dt opposes the CHANGE in its own current (current
    // ramps, never jumps), L is pure geometry (turns/area/length/core, never I),
    // and it stores U = ½LI² released as the switch-off spark. MUTUAL — a
    // changing current in one coil induces ε₂ = −M·dI₁/dt in a DISCONNECTED
    // neighbour across empty space, M = k√(L₁L₂) (symmetric), the transformer /
    // wireless-charging principle. field_3d inductance scenario. Prereqs
    // faraday_law_induction, magnetic_field_solenoid. Sibling of
    // faraday_law_induction / motional_emf / eddy_currents — NOT the same concept
    // (see CRITICAL DISAMBIGUATION below).
    'inductance',
    // AC generator (Ch.6 §6.10, the LAST concept of Ch.6 EMI): a coil of N turns
    // and area A rotating steadily at omega in a uniform field B produces a
    // sinusoidal (alternating) EMF eps = NBA·omega·sin(omega t) by Faraday's law.
    // Flux linkage Phi = NBA·cos(omega t) is a COSINE, the EMF is its RATE of
    // change (a SINE) → 90 deg phase lag: the EMF peaks exactly where the flux is
    // zero (coil edge-on), zero where the flux is maximum (coil face-on). Peak
    // eps0 = NBA·omega, so faster rotation raises BOTH the peak and f = omega/2pi;
    // steady omega still gives AC (the geometry reverses the flux each half turn).
    // Two continuous slip rings deliver AC; a split-ring commutator gives DC.
    // field_3d ac_generator scenario. Prereqs faraday_law_induction,
    // torque_on_current_loop_in_field. Sibling of faraday_law_induction /
    // motional_emf / eddy_currents / inductance — NOT the same concept (see
    // CRITICAL DISAMBIGUATION below). COMPLETES Ch.6 EMI.
    'ac_generator',
    // AC Voltage Applied to a Resistor (Ch.7 §7.2, the FIRST concept of
    // Alternating Current — chapter baseline): a resistor obeys Ohm's law at
    // every instant of a sinusoidal voltage v = vm sin(omega t), so current
    // i = v/R is exactly IN PHASE with voltage (zero phase lag/lead); the
    // instantaneous power p = v*i = vm*im*sin^2(omega t) is NEVER negative — a
    // resistor only ever dissipates, never returns energy (the baseline later
    // inductor/capacitor concepts break); the cycle-average current is EXACTLY
    // zero, so an averaging meter cannot rate AC; the single honest DC-
    // equivalent rating is the RMS value, Vrms = vm/sqrt(2) ~ 0.707*vm — every
    // mains rating is this rms number, the true peak sits root two higher.
    // field_3d ac_resistor scenario (new, built for this concept). Prereqs
    // ohms_law, electrical_power_in_resistor, ac_generator. FIRST of the Ch.7
    // AC map (ac_voltage_inductor/ac_voltage_capacitor/phasors/
    // series_lcr_circuit/ac_power_factor now built, see below;
    // lc_oscillations/transformer follow — NOT yet built, do not invent
    // routing for them).
    'ac_voltage_resistor',
    // AC Voltage Applied to an Inductor (Ch.7 §7.3, SECOND concept of
    // Alternating Current, founder-reordered chapter map): a pure inductor's
    // current lags the applied sinusoidal voltage by EXACTLY a quarter cycle
    // (90 degrees) because voltage sets the current's SLOPE (v = L di/dt, the
    // coil's own back-emf fighting every change) rather than its size, so the
    // current is geometrically forced to crest where the voltage vanishes;
    // the opposition is frequency-made reactance Xl = omega*L (the same coil
    // chokes fast AC harder than slow AC — unlike a resistor's fixed R); and
    // the cycle-average power is EXACTLY zero — every joule borrowed into the
    // magnetic field during one quarter cycle is fully returned during the
    // next (the anti-resistor: opposition without consumption). field_3d
    // ac_inductor scenario (new, clean standalone sibling of ac_resistor,
    // built for this concept, engine log Stage 2, commit 35ae566). Prereqs
    // ac_voltage_resistor, inductance, faraday_law_induction. SECOND of the
    // Ch.7 AC map after resistor (phasors now sits AFTER the three element
    // concepts — ac_voltage_capacitor/phasors/series_lcr_circuit/
    // ac_power_factor now built, see below; lc_oscillations/transformer
    // follow — NOT yet built, do not invent routing for them).
    'ac_voltage_inductor',
    // AC Voltage Applied to a Capacitor (Ch.7 §7.4, THIRD concept of Ch.7
    // Alternating Current, founder-reordered chapter map): a pure capacitor's
    // current LEADS the applied sinusoidal voltage by EXACTLY a quarter cycle
    // (90 degrees) — the opposite direction from the inductor's lag — because
    // charge must flow onto the plates before the plate voltage can build:
    // i = C dv/dt, current is the voltage's SLOPE, not its size, so the
    // current crests exactly where the voltage's slope is steepest and is
    // zero exactly where the voltage peaks (plates momentarily full). The
    // opposition is a frequency-made reactance X_C = 1/(omega*C) that FALLS
    // as frequency rises (opposite the coil's Xl = omega*L) and blocks DC
    // outright — doubling the frequency doubles the peak current. The
    // cycle-average power is EXACTLY zero — every joule stored in the electric
    // field between the plates during one quarter cycle is fully returned
    // during the next (the anti-resistor, mirroring the inductor). field_3d
    // ac_capacitor scenario (new, clean standalone sibling of ac_resistor/
    // ac_inductor, built for this concept, engine log commit 21e1f0f). Prereqs
    // ac_voltage_inductor, ac_voltage_resistor, capacitance. THIRD of the Ch.7
    // AC map (phasors/series_lcr_circuit/ac_power_factor now built, see
    // below; lc_oscillations/transformer follow — the latter two NOT yet
    // built, do not invent routing for them).
    'ac_voltage_capacitor',
    // Phasors — Rotating Vectors for AC (Ch.7 §7.5, FOURTH concept of Ch.7
    // Alternating Current, founder-reordered chapter map — sits AFTER all
    // three individual R/L/C element concepts, introducing the combining
    // TOOL once students have seen what's being combined). Teaches
    // REPRESENTATION, not new physics: a sinusoid is the vertical shadow of
    // an arrow (a phasor) rotating steadily at angular speed omega — the
    // arrow's LENGTH is the constant peak amplitude, its shadow is the
    // changing instantaneous value. Every phasor in a circuit rides ONE
    // shared clock, so the angle between two co-rooted arrows is CONSTANT —
    // this is why a single frozen phasor diagram fully captures a phase
    // relationship. The chapter's three settled facts become three frozen
    // angles: a resistor's current phasor is drawn IN STEP (0 deg), an
    // inductor's current phasor 90 degrees BEHIND (lag), a capacitor's
    // current phasor 90 degrees AHEAD (lead) — reading convention:
    // counterclockwise rotation, the arrow ahead in the spin reaches the
    // peak reference line first (peaks first in time); angle converts to
    // time via Delta t = (phi/360deg)*T. No phasor ADDITION anywhere (no
    // tip-to-tail — that is series_lcr_circuit's front door), no impedance,
    // no complex numbers, no reactance numeral/symbol (Xl, Xc) rendered
    // anywhere in this sim. field_3d ac_phasor scenario (new, clean
    // standalone sibling of ac_resistor/ac_inductor/ac_capacitor — engine
    // build pending as of this authoring pass, do not assume it is live
    // until the ac_phasor scenario ships in field_3d_renderer.ts). Prereqs
    // ac_voltage_resistor, ac_voltage_inductor, ac_voltage_capacitor.
    // FOURTH of the Ch.7 AC map (series_lcr_circuit/ac_power_factor now
    // built, see below; lc_oscillations/transformer follow — NOT yet built,
    // do not invent routing for them).
    'phasors',
    // Series LCR Circuit — Impedance and Resonance (Ch.7 §7.6, FIFTH concept
    // of Ch.7 Alternating Current, founder-reordered chapter map — sits right
    // after phasors, the tool this concept finally puts to use). Teaches
    // SYNTHESIS, not new element mechanisms: R, L and C share ONE series
    // loop and ONE common current; each element's settled voltage phase (in
    // phase / a quarter behind / a quarter ahead) is a one-clause callback,
    // never re-derived. The three element voltages combine tip-to-tail as
    // PHASORS (never arithmetically — the confronted misconception) into
    // the source voltage: vm^2 = V_R^2 + (V_L-V_C)^2. This gives a net
    // reactance X = X_L - X_C, an impedance Z = sqrt(R^2+X^2) (NEVER
    // R+X_L+X_C, a demoted third misconception), a phase angle
    // tan(phi) = X/R (whichever reactance is LARGER sets whether current
    // leads or lags), and one special RESONANT frequency f0 =
    // 1/(2*pi*sqrt(LC)) where X_L = X_C, the two reactances erase each
    // other, impedance collapses to R alone, and the current peaks at
    // vm/R — the primary aha, breaking the earned-but-wrong belief that
    // more circuit elements always means less current. R alone sets how
    // SHARP that resonance peak is (Q = f0/delta_f) without ever moving
    // WHERE it sits (f0 depends only on L and C). Route "series LCR
    // circuit", "impedance of a circuit", "Z equals root R squared plus X
    // squared", "why don't AC voltages in series just add up", "why is one
    // element's voltage bigger than the source", "phasor addition tip to
    // tail", "resonance in an LCR circuit", "why does current peak at one
    // frequency", "resonant frequency formula", "f0 equals one over two pi
    // root LC", "does more resistance change the resonant frequency",
    // "sharpness of resonance", "Q factor", "bandwidth of resonance",
    // "how does a radio tune to one station", "why can't impedances just
    // add like resistances" here. Does NOT cover the individual R/L/C
    // mechanisms themselves (those are ac_voltage_resistor /
    // ac_voltage_inductor / ac_voltage_capacitor, the prerequisites — a
    // callback only, never re-derived here), the frozen-angle phasor
    // REPRESENTATION itself with no addition/impedance/resonance in play
    // (that is phasors, the prerequisite this concept builds on), or power,
    // power factor, wattless current, or free LC energy oscillation (those
    // are ac_power_factor, now built, see below, and lc_oscillations, later
    // — this concept's own deliberate withholdings; its power HUD slot
    // stays empty on purpose).
    'series_lcr_circuit',
    // Power in AC Circuits — The Power Factor (Ch.7 §7.7, SIXTH concept of
    // Ch.7 Alternating Current, founder-reordered chapter map — sits right
    // after series_lcr_circuit, teaching the POWER consequence of the
    // impedance/resonance machinery just built). Teaches the double-
    // frequency instantaneous power p(t)=v*i riding a non-zero average,
    // <p> = V_rms*I_rms*cos(phi) — the power factor cos(phi) = R/Z as the
    // fraction of apparent power S = V_rms*I_rms that is REAL — the wattless
    // quadrature current I_rms*sin(phi) that flows without ever spending a
    // joule (a bigger current does NOT always mean bigger power) — where the
    // real power physically lands (P = I_rms^2*R, all in the resistor, never
    // the reactive elements) — and the power triangle P/Q/S as the settled
    // impedance triangle uniformly scaled by I_rms^2. Impedance, phase angle,
    // and resonance arrive as one-clause SETTLED CALLBACKS from
    // series_lcr_circuit, never re-derived. Route "power factor", "cos phi",
    // "average power in an AC circuit", "why isn't power just V times I",
    // "apparent power vs real power", "what is a volt-ampere", "wattless
    // current", "why does more current sometimes mean less power", "where
    // does the power actually get dissipated in an LCR circuit", "power
    // triangle", "P Q S relations", "reactive power", "kVA vs kW rating",
    // "why is my equipment rated in kVA not kW" here. field_3d ac_power
    // scenario (new, clone-sibling of ac_series_lcr, built for this concept,
    // engine log Stage 6, commit 9df14e3). Prereqs series_lcr_circuit,
    // ac_voltage_resistor, ac_voltage_inductor, ac_voltage_capacitor,
    // phasors. SIXTH of the Ch.7 AC map (lc_oscillations/transformer follow
    // — NOT yet built, do not invent routing for them). Does NOT cover free
    // LC energy oscillation with the source removed (that is
    // lc_oscillations, later — this concept's own deliberate withholding;
    // every energy gauge here runs under the driven source), transmission-
    // line voltage step-up (that is transformer, later — transmission stays
    // narration-only here), or complex power notation (out of syllabus
    // scope).
    'ac_power_factor',
    // LC Oscillations — The Circuit's Own Rhythm (Ch.7 §7.8, SEVENTH concept
    // of Ch.7 Alternating Current, founder-reordered chapter map — sits right
    // after ac_power_factor). Teaches the FREE (source-free) circuit: a
    // capacitor charged to V0 is connected to an inductor and the SOURCE IS
    // PHYSICALLY REMOVED (a battery + two-position switch replace it) — the
    // L-C pair then oscillates by itself at its own NATURAL frequency
    // omega0 = 1/sqrt(LC), never a source-imposed one. The current is
    // MAXIMUM exactly when the charge is zero (the coil's inertia carries the
    // motion through and recharges the plates reversed — the primary aha,
    // breaking "a discharged capacitor is a finished circuit"); the swing
    // repeats at f0 = 0.25 Hz, the exact frequency the driven series_lcr_circuit
    // favoured at resonance (the circuit owned that number all along); the
    // stored energy trades intact between the capacitor's electric field
    // (1/2 q^2/C) and the inductor's magnetic field (1/2 L i^2), an
    // ALL-WATTLESS exchange where nothing is ever spent (breaking "an ideal
    // oscillation must still run down"); the motion is the exact electrical
    // twin of a mass on a spring (q<->x, i<->v, L<->m [inertia], 1/C<->k); and
    // real resistance damps the swing out. field_3d lc_oscillation scenario
    // (new, clone-sibling of ac_power, built for this concept). Prereqs
    // ac_voltage_capacitor, ac_voltage_inductor, series_lcr_circuit,
    // ac_power_factor, capacitance, inductance. SEVENTH of the Ch.7 AC map
    // (transformer now built, see below — the chapter's eighth and LAST
    // concept). Does NOT cover element mechanisms, impedance, resonance, or
    // power (settled one-clause callbacks from the six sealed siblings),
    // driven/forced oscillation (that was series_lcr_circuit), or mutual
    // coupling/voltage transformation (deferred to transformer).
    'lc_oscillations',
    // Transformer — Trading Voltage for Current (NCERT Ch.7 §7.9, the EIGHTH
    // and LAST concept of Ch.7 Alternating Current, sitting right after
    // lc_oscillations — the chapter CLOSES here). Teaches the two-coil
    // machine: one AC-driven flux circulating a closed iron core threads
    // BOTH a primary and a secondary winding — two electrically DISJOINT
    // circuits, no wire between them — inducing in each turn an equal share
    // of EMF (per_turn = Vp/Np = Vs/Ns identically) so that the turns ratio
    // sets the voltage ratio, Vs/Vp = Ns/Np (more secondary turns = step-up,
    // fewer = step-down). An IDEAL transformer passes power through
    // unchanged, Vp*Ip = Vs*Is — nothing is amplified, volts up means amps
    // down (the PRIMARY aha, breaking "step-up = free power"). It works
    // ONLY on CHANGING flux: swap in a steady DC battery and there is one
    // transient blip at the throw, then the secondary reads exactly zero
    // forever after, even though the primary keeps a huge STEADY flux alive
    // (the second confronted misconception, breaking "a transformer works on
    // DC too — steady current still makes flux"). Real transformers leak a
    // little — copper heat, eddy currents (fought by LAMINATING the core,
    // which chops the wide eddy loops a solid block would carry), hysteresis,
    // and stray flux — landing around 95% efficient, with the core's own
    // flexing audible as a faint hum. This is WHY long-distance power
    // transmission works: stepping the send voltage up collapses the line
    // current (I=P/V), and since line loss is I^2*R, a tenfold voltage step
    // cuts the loss a hundredfold — the entire reason a power grid exists.
    // field_3d 'transformer' scenario (NEW, Class-B clone-sibling of
    // lc_oscillation, engine build dispatched separately from this
    // registration pass — src/data/concepts/transformer.json's
    // field_3d_config is the contract that dispatch builds against).
    // Prereqs faraday_law_induction, ac_voltage_resistor, ac_power_factor,
    // electrical_power_in_resistor, ac_voltage_inductor. Route "transformer",
    // "step up or step down transformer", "turns ratio", "Vs over Vp equals
    // Ns over Np", "why does a transformer need AC not DC", "why does the
    // secondary read zero on a battery", "does a transformer amplify power",
    // "why does the primary current rise when I add a load to the
    // secondary", "why are transformer cores laminated", "eddy currents in a
    // transformer core", "transformer efficiency", "why is electricity
    // transmitted at high voltage", "why do power lines lose less energy at
    // high voltage" here. Does NOT cover Faraday's law itself, rms values,
    // real power, or I^2R heating (settled one-clause callbacks from the
    // sealed siblings), does NOT quantify mutual inductance M in henries
    // (that is inductance, the Ch.6 prerequisite), and does NOT treat
    // loaded-primary back-EMF regulation, magnetizing current, rectification,
    // or switch-mode electronics (out of scope). CHAPTER END — this is the
    // last concept of Ch.7; no successor concept follows.
    'transformer',
    // Force between two parallel currents — F/L = μ₀I₁I₂/2πd; parallel currents
    // ATTRACT, antiparallel REPEL (opposite of like charges); defines the ampere.
    // field_3d parallel_currents_force scenario.
    'parallel_currents_force',
    // Magnetic field of a long solenoid — B = μ₀nI inside, ≈0 outside
    // (Class 12 Ch.4.8 — Diamond #4 of the magnetism chapter, M4 binary-gate
    // validator per MAGNETISM_ARCHITECTURE.md, archetype A — field-viz).
    // PRIMARY aha: per-turn radial components cancel → uniform axial B inside.
    // SUPPORTING aha: right-hand grip swaps roles — fingers curl with current,
    // thumb gives B. Conceptual-only ship; board (M7) and competitive (M8)
    // deferred. Renderer wires wire_to_coil_morph (STATE_1) and
    // right_hand.case='solenoid' with fade_from_case='A' (STATE_5).
    'magnetic_field_solenoid',
    // Electromagnetic Waves (Ch.8) — displacement current, the chapter's
    // load-bearing opener (NCERT §8.2). A changing electric flux acts as a
    // current — I_d = ε₀ dΦ_E/dt — repairing the two-surface contradiction
    // Ampère's law hits at a charging capacitor, completing the law as
    // ∮B·dl = μ₀(I_c + I_d). field_3d displacement_current scenario (new).
    'displacement_current',
    // Electromagnetic Waves (Ch.8) — EM wave propagation, the chapter's
    // second diamond (NCERT §8.3). Mutually regenerating changing E and B
    // fields self-propagate through empty space as a transverse wave — E ⊥ B
    // ⊥ direction of travel, E×B ahead, E and B in phase with E₀/B₀ = c,
    // energy split equally between the two fields, at c = 1/√(μ₀ε₀) ≈
    // 3×10⁸ m/s — the speed that identifies light itself as an
    // electromagnetic wave (v = c/n in a medium). field_3d
    // em_wave_propagation scenario (new). Absorbs the seeded siblings
    // em_wave_nature + speed_of_em_waves (CONCEPT_SYNONYMS redirect-only —
    // neither is a real concept_id).
    'em_wave_propagation',
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
    // `normal_force` is now a real atomic in VALID_CONCEPT_IDS, so normalizeConceptId
    // returns it before ever reading this map — the old `normal_force: 'normal_reaction'`
    // entry was dead and is removed. The PLURAL was NOT dead: `normal_forces` is not a
    // valid ID, so it fell through to the synonym and resolved every "normal forces"
    // query to the legacy mechanics_2d bundle — contradicting the CLASSIFIER_PROMPT's
    // own "never return normal_reaction for a new query". Repointed at the live atomic.
    normal_forces: 'normal_force',
    // `tension_force` is now the live newtons_laws_body-engine atomic for
    // what tension IS + T1 != T2 in a chain (registered 2026-07-30). Both
    // bare-word synonyms redirect there — the legacy `tension_in_string`
    // bundle (bare formula lookup) is kept only for historical cache
    // compatibility, per docs/loop_runs/lom/lom_e_design.md §0.
    // `atwood_machine` repointed at `connected_bodies` (2026-07-30). It aimed at
    // the legacy `tension_in_string` bundle, which is DEAD mechanics_2d with no
    // field_3d_config — so every "Atwood machine" query resolved to a
    // non-product sim, while `connected_bodies` (sealed, on master) teaches
    // exactly that case in a dedicated both-hanging state. Deliberately NOT sent
    // to `tension_force`: that concept owns what tension IS and where it changes
    // along a chain, and it has no Atwood state — solving a coupled pair is
    // `connected_bodies`' job by design (see the concept boundary in
    // docs/loop_runs/lom/tension_force/skeleton.md §1).
    tension: 'tension_force',
    rope_tension: 'tension_force',
    atwood_machine: 'connected_bodies',
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
    distance_vs_displacement: 'displacement_vs_distance',
    distance_displacement_basics: 'displacement_vs_distance',
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
    // Ch.8 sibling absorption (2026-07-25): em_wave_propagation absorbs the
    // two previously-seeded siblings the displacement_current skeleton named
    // (em_wave_nature, speed_of_em_waves) per the founder's chapter_map merge.
    // REDIRECT-ONLY (design-gate guardrail) — neither id is a real concept;
    // do NOT add either to VALID_CONCEPT_IDS or CLASSIFIER_PROMPT.
    em_wave_nature: 'em_wave_propagation',
    speed_of_em_waves: 'em_wave_propagation',
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
        // First token on a concept line is the slug (lowercase start, then
        // letters/digits/underscores — including a trailing capital like the
        // `_B` in magnetic_field_concept_B / circular_motion_charge_in_uniform_B,
        // which the old [a-z0-9_] class truncated, causing a drift misclassify).
        const match = trimmed.match(/^([a-z][A-Za-z0-9_]*)/);
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
  ohms_law              ← V=IR, straight V-I line + slope=R, current not used up by a resistor (voltage drops instead), non-ohmic/filament conductors (aspects: foundational=V=IR/slope, conservation=current not used up, non_ohmic=filament bends the line, exploration=both dials)
  parallel_resistance   ← 1/R = 1/R1 + 1/R2, current splits across branches
  series_resistance     ← R = R1 + R2, same current through every element
  kirchhoffs_voltage_law
  kirchhoffs_current_law
  kirchhoffs_laws       ← combined KVL+KCL questions
  wheatstone_bridge      ← four resistors P, Q, R, S in a diamond, a battery across one diagonal (A-C) and a galvanometer across the other (B-D), balanced when P/Q = R/S because the two midpoints then sit at the SAME potential so the galvanometer branch carries ZERO current (a null, not a magnitude) even though all four arms keep flowing; the null depends only on the resistance RATIO never the battery, so an unknown resistance reads off the knowns via S = R*(Q/P) with no current or voltage ever measured (aspects: foundational=topology+difference-detector through the PRIMARY null aha, measurement=S=R*(Q/P)+why it's battery-independent, exploration=all five dials)
  meter_bridge           ← a meter bridge finds an unknown resistance X by NULLING a slide-wire Wheatstone bridge — a known resistance R and the unknown X sit in two upper gaps meeting at a junction, a uniform one-metre wire runs below carrying a sliding jockey, and a galvanometer bridges the junction to the jockey; because the wire is uniform, its two segments' resistances are directly proportional to their lengths, so sliding the jockey to the one balance length l1 where the galvanometer reads exactly zero gives X = R*(100-l1)/l1 — a resistance computed from two lengths and one known resistor, never read off any meter directly; balancing near the MIDDLE of the wire (by choosing R close to X) minimizes the error from jockey-placement uncertainty (aspects: foundational=topology+wire-as-resistance-ruler through the PRIMARY null aha at l1, sensitivity=why balancing near the middle minimizes error, exploration=R/X/jockey/battery all live)
  internal_resistance    ← a real cell carries a hidden resistance r inside it, so current flowing spends i·r volts inside the cell itself — terminal voltage V = epsilon − i·r (open circuit still reads the full epsilon), short circuit caps current at the finite i_max = epsilon/r (never infinite, the cell heats instead), charging pushes V ABOVE epsilon (V = epsilon + i·r), r is measured from two readings via r = (epsilon − V)/i — Diamond 2 of the emf/internal-resistance split, reuses emf_definition's cell (aspects: foundational=the droop under load + where the missing volts went through the primary aha, short_circuit=R→0 current caps at epsilon/r, measuring_r=two-reading method for r, charging=terminal voltage climbs above epsilon, exploration=all four dials)
  electric_power_heating ← P=I²R, Joule heating, bulb glows, heating effect
  drift_velocity        ← v_d = eEτ/m, thermal speed vs drift speed, why current is instant though electrons crawl, i = neAv_d
  resistivity            ← R = ρL/A (resistance factorizes into shape × material), ρ = m/(ne²τ) (why materials differ), ρ_T = ρ₀(1+αΔT) (why hot metals resist more), nichrome vs copper vs manganin (aspects: foundational=R=ρL/A geometry, microscopic=ρ=m/ne²τ material identity, temperature=ρ rises with heat/alloy contrast, exploration=all four dials)
  combination_of_resistors ← series: R_eq=R1+R2, same current everywhere, voltages add (V1+V2=V); parallel: 1/R_eq=1/R1+1/R2, same voltage on every branch, currents add (i=i1+i2), R_eq is LESS than the smallest branch; why homes wire appliances in parallel (aspects: foundational=baseline through the parallel aha, series=R_eq adds/same current/voltage divides, parallel=current divides/R_eq below smallest branch, home_wiring=branch independence/why parallel at home, exploration=all five dials)
  emf_definition          ← a cell is a charge pump, epsilon = W/q (volts = joules per coulomb), emf is energy PER charge not a force (electromotive-force misnomer), emf set by chemistry not the circuit, open-circuit voltmeter reads the full emf (measurement bridge to internal_resistance) — IDEAL cell only, no droop here (aspects: foundational=pump+definition+per-charge-not-a-force through the primary aha, cell_chemistry=different cells different epsilon, measuring_emf=open circuit V=epsilon, exploration=all three dials)
  electrical_power_in_resistor ← a resistor turns delivered energy into heat/light at the rate P=VI=I²R=V²/R (one quantity, three faces via Ohm's law), energy E=P·t piles up (Joule heating), and whether a higher resistance dissipates MORE or LESS power depends on what's held constant — at fixed current (series) higher R wins, at fixed voltage (parallel) higher R loses, the series↔parallel brightness FLIP on two rated bulbs (aspects: foundational=P=VI through the three-faces identity and the primary series/parallel flip aha, joule_heating=power is a rate/E=P·t accumulates, series_vs_parallel=the rated-bulb contrast pair and the flip, exploration=all five dials)
  kirchhoff_junction_rule_KCL ← Kirchhoff's junction rule / current rule / KCL: at any junction Σi_in = Σi_out because charge cannot pile up or vanish at a point; when current splits at a fork it redistributes by branch CONDUCTANCE (1/R, lower R takes more), never automatically fifty-fifty, but the branch currents always add back to exactly what entered; a resistor spends ENERGY not CHARGE so the ammeter reads the same before a split and after the branches recombine; generalizes to Σi_in=Σi_out at ANY junction with any number of wires (aspects: foundational=charge-can't-pile-up through the equal-split earned belief to the PRIMARY unequal-split aha, multi_branch=the any-number-of-wires generalization and solving an unknown branch current, exploration=both resistor dials)
  kirchhoff_loop_rule_KVL ← Kirchhoff's loop rule / voltage rule / KVL: around any closed loop the algebraic sum of potential changes is zero (ΣV=0) because a charge that travels the loop returns to exactly the potential it started at (energy conservation); the EMF RAISES the potential (+ε, a rise, low-to-high at the source) and each resistor DROPS it (−IR, along the current, high-to-low), so the rise always equals the total of the drops (ε=IR1+IR2 for a two-resistor loop); changing one resistor REDISTRIBUTES the individual drops but never changes their signed sum — adding all element voltages as positive numbers (ignoring the sign convention) is the classic wrong equation; generalizes to ΣV=0 for any loop with any number of elements (aspects: foundational=round-trip-equals-zero through the quantitative rise-equals-drops to the PRIMARY signed-sum-no-leftover aha, multi_element=the any-number-of-elements generalization with a third resistor, exploration=all four dials — epsilon and every resistor)
  resistance
  temperature_dependence_of_resistance
  resistance_temperature_dependence
  potentiometer          ← a potentiometer measures a cell's true EMF by NULLING — a driver cell sends a steady current down a long uniform wire so the potential drops UNIFORMLY along it (a gradient k = V/L); a sliding jockey taps the drop from the start of the wire to itself (k·l), and when that tapped drop exactly equals the tested cell's EMF the galvanometer reads ZERO (a null, not a magnitude) — E = k·l, the balance length DIRECTLY PROPORTIONAL to EMF — and because at balance NO CURRENT is drawn from the tested cell, the reading is the TRUE EMF, which an ordinary voltmeter can never give (it draws current through the cell's internal resistance and reads the smaller terminal voltage E − I·r) (aspects: foundational=gradient+tapping-the-drop through the PRIMARY null aha, measurement=true EMF vs voltmeter's E−Ir droop + why zero current matters, exploration=tested E/driver ε_d/jockey all live)
  combination_of_cells   ← joining real cells (each its own emf epsilon and internal r) in SERIES adds both the pushes and the tolls — epsilon_eq = sum of the emfs signed by polarity, r_eq = sum of the r's always (even a reversed, cancelled cell still adds its own r — a dead circuit can hold two live cells); joining IDENTICAL cells in PARALLEL keeps the push but SHARES the toll — epsilon_eq = epsilon unchanged, r_eq = r/m — so which grouping actually helps depends on the load: series wins when R is much bigger than r, parallel wins when R is comparable to or smaller than r, and "more cells" is never automatically "more current" — direct sequel of emf_definition/internal_resistance, same home cell multiplied (aspects: foundational=baseline through both groupings to the PRIMARY load-matching aha, series=emfs and r's add + the reversed-cell trap, parallel=voltage unchanged + current sharing via r/m, grouping_choice=the decision rule + explore)

  ── Vectors (Ch.5) ── atomic splits
  scalar_vs_vector         ← the general TEST for whether a quantity is a scalar or a vector — magnitude+direction is necessary but NOT sufficient, it must also add by the triangle/parallelogram law (3 km + 4 km at a right angle gives 5 km, not 7); mass on a scale adds as a plain number regardless of orientation/angle. The general classification test — NOT a specific worked trap (current_not_vector, pressure_scalar are the specific applications of this same test).
  vector_addition_law      ← HOW two vectors add once you already know something IS a vector — carry the second vector parallel to itself and dock its tail on the first one's head (triangle law), equivalently draw both from a common tail and take the parallelogram's diagonal; R = sqrt(A² + B² + 2AB cosθ) spans |A−B| ≤ R ≤ A+B (7 at θ=0, 5 at θ=90, 1 at θ=180 for the 3-4 legs); either order (A then B, or B then A) lands the same finishing corner — one law, two drawings. Prerequisite of scalar_vs_vector (the DAG root); does NOT cover resultant direction angle α, vector subtraction, or component resolution (aspects: foundational=numbers-lie through the PRIMARY tip-to-tail aha, parallelogram=either-order-same-diagonal, magnitude=the angle-dials-the-sum sweep + the smaller-than-both surprise, exploration=all three dials).
  resultant_direction      ← WHICH WAY the resultant of two vectors points, once you already know |R| — drop one perpendicular from B onto A's line, splitting B into an along part (B cosθ) and an across part (B sinθ); tan α = B sinθ / (A + B cosθ), where the along side is the WHOLE base A + B cosθ, not A alone (the classic denominator error); α always trails θ (α<θ), R leans toward whichever vector is bigger (bisects θ only in the A=B accident), θ=90° collapses to tan α=B/A, base=0 (θ=arccos(−A/B)) makes R exactly perpendicular to A, θ=180° flips R along the bigger vector. Prerequisite of vector_addition_law (cashes out the direction formula that concept explicitly deferred); does NOT cover the magnitude formula or general component resolution on arbitrary axes (aspects: foundational=which-way through the perpendicular-drop to the PRIMARY tan-alpha aha, dominance=R leans toward the bigger vector/bisector is the tie accident, angle_cases=the θ-sweep landmarks (90°/perpendicular/180° flip), exploration=all three dials).
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

  ── Kinematics (Ch.2) ── NEW DAG track (field_3d, Alex pipeline 2026-07-25)
  displacement_vs_distance ← displacement Δx = x_f − x₀ (signed, endpoint-only change of position) vs distance d = always-positive accumulated path length; equal only for one-directional motion, diverging the instant motion reverses — the round-trip Δx=0-while-d-keeps-climbing aha, the signed-direction case (Δx<0 for motion along −x, d never negative), and the endpoints-only law (Δx depends only on start/final position, never the path taken). Prerequisite: scalar_vs_vector. Supersedes the legacy distance_displacement_basics/distance_vs_displacement bundle names (see CONCEPT_SYNONYMS).

  ── Kinematics (Ch.6-7) ── atomic splits (legacy mechanics_2d, non-product)
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
  normal_reaction         ← N perpendicular to surface, N = mg cosθ on incline (legacy 2D bundle — prefer normal_force for new queries)
  normal_force            ← the normal force ADJUSTS, it is never a fixed mg: flat floor N=mg (lockstep with mass), tilt detaches N=mg cosθ, vertical surface N=0 (free fall at g), friction ceiling f_max=μₛN rides on N not weight (same push, light body slides, heavy body holds); N never depends on an along-surface applied force F
  tension_in_string       ← rope tension, Atwood machine, T = 2m₁m₂g/(m₁+m₂)
  hinge_force             ← pin joint, rod on wall, hinge reaction
  free_body_diagram       ← FBD, isolate body, force diagram, N = mg cosθ on incline, string tension T = mg
  connected_bodies        ← two blocks joined by a rope over a pulley, ONE shared acceleration + ONE tension, T ≠ hanging weight unless a=0, Atwood machine, block on table + hanging mass, incline + hanging mass
  block_on_incline        ← single block on a rough incline, static friction tracks mg sinθ up to μₛN, breaks away exactly at tan θ = μₛ (mass cancels), then slides with a = g(sinθ − μₖ cosθ); μₖ < μₛ so kinetic friction is weaker once moving
  friction_static_kinetic ← static vs kinetic friction, μₛ vs μₖ, push almirah, slipping threshold
  newton_second_law_direction ← F = m·a as a vector equation, direction matters, a along F not v
  newton_first_law        ← law of inertia, ΣF=0 ⇔ v constant, why moving things need no force to keep moving, rest = balanced not absent forces
  newton_second_law       ← F = ma, a = ΣF/m, force sets acceleration not velocity, same force different mass, same mass different force
  newton_third_law        ← action-reaction pair, F₁₂ = -F₂₁, forces always equal and opposite no matter the masses, why the pair never cancels (acts on different bodies), heavier object "pushes harder" myth
  friction_force          ← static friction self-adjusts to cancel a FLAT push exactly, up to a ceiling f_max = μₛN, then DROPS to the smaller constant μₖN once sliding; two identical blocks at one force can have two different fates (resting held vs already-sliding runs away); kinetic friction is speed-independent. NO incline, NO tan θ (that is block_on_incline)
  rolling_friction        ← same mass, same push: a sliding block (μₖ = 0.40) vs a rolling wheel (μᵣ ≈ 0.002), SAME law f = μN but ~200× smaller coefficient — the wheel crosses the whole track while the block barely moves; rolling friction is small but NEVER zero (a coasting wheel still slows); both frictions grow with load, but only the sliding side's growth can stop motion entirely. NO torque, NO moment of inertia, NO angular acceleration; does NOT re-teach static vs kinetic friction (that is friction_force)
  tension_force           ← what tension IS as a force: a pull along the string's own line at both ends, whose SIZE is set by the motion, not by the string — T = m₂g only at rest (a=0); T = m₂(g−a) strictly less than m₂g the instant it accelerates; one ideal string carries ONE tension throughout (a pulley changes direction only, never size); a CHAIN of separate strings carries a DIFFERENT tension in each one, since each string only moves the mass behind it (T₁ ≠ T₂). Does NOT re-derive the shared-|a|/one-T pulley SOLVING METHOD or Atwood (that is connected_bodies)
  equilibrium_of_particles ← a particle held by several CONCURRENT forces (a force-table ring pulled by 3–4 strings): equilibrium is ΣF = 0, and that is TWO independent statements, ΣFₓ = 0 AND ΣF_y = 0; three UNEQUAL pulls (29.4, 39.2, 49.0 N) can sum to nothing while every arrow stays full length — "not moving" never means "no forces"; the hanging weight sets each tension exactly (T = m g), independent of the pulley's angle; balance is a live condition (move a pulley, the balance point moves and the ring follows); and a symmetric two-cable support gives 2 T sin θ = W, so a FLATTER cable pulls HARDER, without limit as θ → 0 — a loaded rope can never be pulled perfectly straight. NO friction (that is friction_force), NO incline (block_on_incline), NO shared acceleration or Atwood (connected_bodies), NO torque / rotational equilibrium, NO Lami's theorem
  uniform_circular_motion ← a body circling at CONSTANT SPEED still needs a net INWARD force, because its velocity's direction keeps changing (a whirled ball on a string): T = m ω² r, growing with the SQUARE of the spin rate; cut the string and it departs STRAIGHT along the tangent at unchanged speed — no outward force is ever drawn or ever existed ("flung outward" is the exact misconception this confronts); once gravity joins (conical pendulum) the SAME tension splits into a vertical part balancing weight and a horizontal part that is the net inward force, T cos θ = m g so T > m g always; the cone angle is SOLVED, never chosen, cos θ = g/(ω²L), so the string approaches horizontal but never reaches it at any finite spin rate; and below ω = √(g/L) no cone exists — the bob simply hangs. NO a = v²/r kinematic derivation (centripetal_acceleration_kinematic, not shipped), NO car on a road (circular_motion_banking), NO vertical circular motion, NO centrifugal / rotating-frame force

  ── Work, Energy and Power (Class 11 Ch.6) ──
  work_done_by_constant_force ← work done by a CONSTANT force, W = F·d·cos θ: force acting through a displacement, and only the component of the force ALONG that displacement counts; NO displacement means ZERO work, however large the force (pushing a stalled car, holding a heavy bag still); a tilted pull does LESS work per metre, set by cos θ; a live numeric prediction stamps against the meter's own live reading; work is the SCALAR (dot) product of two vectors, W = F⃗·d⃗ = F d cos θ, NOT the cross product; work done by a force is INDEPENDENT of the mass being moved. Covers θ from 0° up to (not including) 90° ONLY — zero/negative work and the full sign taxonomy across all three angle regimes belong to the sibling positive_negative_zero_work. Does NOT cover kinetic energy, the work-energy theorem, or power.
  positive_negative_zero_work ← the SIGN of work: the angle between a force and the displacement decides it — θ<90° positive (a forward pull, the bar climbs above zero), θ=90° ZERO however long the force acts (the normal force pushing up while the crate coasts; the carried-bag case), θ>90° negative (kinetic friction on a launched, still-moving crate, decelerating it to a permanent stop; the friction arrow VANISHES at rest but the bar holds its negative reading); NET work is the signed SUM of every force's work (four bars at once: the pull, friction, the normal force, and their net); the SAME formula W = F·d·cos θ spans all three sign regimes, and the sign lives in cos θ, never in the force's own magnitude (a 25 N pull at 120° still reads +25 N on the HUD while its work bar goes negative). Opens the F_ang regime (0°…180°) that the sibling work_done_by_constant_force deliberately ceded. Does NOT cover kinetic energy, the work-energy theorem, or power.
  kinetic_energy_definition ← what kinetic ENERGY IS: a moving body has kinetic energy K = ½mv², measured in joules, and a live meter reads it — proportional to the MASS (double the mass at a fixed speed and the reading doubles, 16.0 J to 32.0 J), proportional to the SQUARE of the SPEED (two identical 5 kg carts at 2 m/s and 4 m/s read 10.0 J and 40.0 J — FOUR times, not twice, because the speed is squared); kinetic energy is a SCALAR with no direction and no sign, so two identical carts at the same speed moving in OPPOSITE directions read exactly the same 22.5 J and kinetic energy can never be negative; and the reading falls continuously as the speed falls, reaching exactly 0.0 J when and only when the body is at rest. Does NOT cover what CHANGES kinetic energy (W = ΔK, the work-energy theorem), where the energy goes when friction stops a body, potential energy, conservation, or power — and it never uses the word work at all. Does NOT require the two work concepts as prerequisites.

  ── Electric Charges and Fields (Class 12 Ch.1) ──
  coulombs_law                    ← force between two point charges F = k q₁q₂/r², k ≈ 9×10⁹; like charges repel / unlike attract; equal & opposite pair (Newton's 3rd); 1/r² inverse-square falloff; F ∝ q₁q₂; vector form along the line joining; superposition (net force = vector sum)
  electric_field_point_charge     ← electric field of a point charge E = kQ/r², radial direction (out for +Q, in for −Q), field lines, line density = field strength, E = F/q
  charge_distribution             ← linear (λ), surface (σ), volume (ρ) charge density; field of an extended/continuous charge
  electric_flux                   ← electric flux Φ = ∫E·dA; flux through a surface, dependence on field strength and orientation; net flux through a closed surface (stops at net flux ∝ enclosed charge — does NOT introduce ε₀ or Φ = q/ε₀)
  gauss_law                       ← Gauss's law STATEMENT: net flux through ANY closed (Gaussian) surface = q_enc/ε₀; ε₀ = 8.854×10⁻¹² is a fixed constant of nature; net set ONLY by the enclosed charge (independent of the surface's shape/size); a charge outside contributes zero; q_enc is the signed algebraic sum Σ qᵢ. Statement only — no E-from-symmetry derivation.
  gauss_law_sphere                ← APPLYING Gauss's law + spherical symmetry to a uniformly charged SHELL to SOLVE for E(r): E = 0 everywhere inside (r<R), E = kq/r² = q/(4πε₀r²) outside (r≥R, like a point charge at the centre); r from the CENTRE not the surface; external field independent of shell radius R; E jumps from 0 to peak kq/R² at the surface; shielding (E=0 inside a hollow charged shell). The E-FROM-SYMMETRY application for a shell — NOT the bare statement (gauss_law) and NOT the flux definition Φ=E·A (electric_flux).
  gauss_law_solid_sphere          ← APPLYING Gauss's law + spherical symmetry to a uniformly charged SOLID (insulating) sphere to SOLVE for E(r): E = kq·r/R³ inside (r<R, grows LINEARLY from 0 at the centre because only q_enc = q·(r/R)³ is enclosed), E = kq/r² outside (r≥R, like a point charge); CONTINUOUS at r=R (both give kq/R²), so the field peaks AT the surface with NO jump. The SOLID-ball case — distinct from the hollow shell (gauss_law_sphere, which is zero inside and jumps at the surface). Route "field inside a solid sphere", "uniformly charged solid sphere / ball", "insulating charged sphere", "volume charge density sphere", "E inside a charged ball" here.
  gauss_law_line                  ← APPLYING Gauss's law + CYLINDRICAL symmetry to an INFINITE LINE / WIRE of uniform linear charge density λ to SOLVE for E(r): a coaxial Gaussian CYLINDER (flat end caps carry zero flux, only the curved wall counts) gives Φ = E·(2πrL) = λL/ε₀, the L cancels ⇒ E = λ/(2πε₀r), radial and ⊥ to the line and independent of axial position. The headline: the line falls off as 1/r, NOT 1/r² like a point charge (cylinder area 2πrL grows linearly with r). WIRE / LINE ONLY — no plane/sheet, no finite-line ends. Route "field of an infinite/line charge", "E near a charged wire", "E = λ/2πε₀r", "why 1/r not 1/r²", "Gaussian cylinder for a wire" here.
  gauss_law_sheet                 ← APPLYING Gauss's law + PLANAR symmetry to an INFINITE PLANE SHEET of uniform surface charge density σ to SOLVE for E: a Gaussian PILLBOX (the curved WALL carries zero flux, only the two flat CAPS count — the exact INVERSE of the line's cylinder) gives Φ = 2EA = σA/ε₀, the A cancels ⇒ E = σ/(2ε₀), ⊥ to the sheet, pointing away on BOTH sides, equal everywhere. The headline: the field is CONSTANT — it does NOT fall off with distance at all (NOT the line's 1/r, NOT the point's 1/r²), because the pillbox encloses the same σA patch however far out the caps sit. The ½ is from flux leaving BOTH caps, so an ISOLATED sheet gives σ/2ε₀ — distinct from the σ/ε₀ conductor-surface / between-two-plates case (a DIFFERENT concept). SHEET / PLANE ONLY — no line/sphere, no edge effects. Route "field of an infinite charged sheet/plane", "E = σ/2ε₀", "why doesn't the sheet field fall off", "uniform field from a sheet", "Gaussian pillbox" here.
  force_on_charge_in_field        ← force on a charge placed in a field F = qE, direction by sign (along E for +q, opposite for −q), constant force in a uniform field, a = qE/m, parabolic deflection of a launched charge
  electric_dipole_in_field        ← electric dipole in a UNIFORM field: torque τ = p × E = pE sin θ, the force couple ±qE with zero net force, rotation toward alignment, stable (θ=0) vs unstable (θ=180°) equilibrium, potential energy U = −pE cos θ
  electric_field_dipole           ← the FIELD OF an electric dipole itself: the ± pair's combined E pattern, axial point (along p, fields add) vs equatorial point (⊥ bisector, opposite to p), 1/r³ falloff — faster than a point charge's 1/r². The dipole as a SOURCE — NOT the dipole placed in an external field (that is electric_dipole_in_field)

  ── Electrostatic Potential and Capacitance (Class 12 Ch.2) ──
  electric_potential_meaning      ← the MEANING of electric potential V = W/q: the work done per unit positive test charge to bring it from infinity to a point; a single SCALAR per place (no direction, NOT a vector, NOT the field E); path-independent because the electrostatic force is conservative; the reference V(∞)=0; ΔV = V_B − V_A is the per-unit-charge work between two points (closer to a +source ⇒ higher V); potential energy U = qV (belongs to the charge, scales with q) vs potential V (belongs to the place, does not). Mentions equipotential surfaces only in passing (V = altitude, E = slope); the DEDICATED equipotential-surface GEOMETRY (concentric spheres, E ⟂ surface, zero work along, crowding↔field-strength) is the separate sibling equipotential_surfaces. Teaches V = W/q and STOPS SHORT of V = kQ/r. Route "what is electric potential", "what does voltage at a point mean", "V = W/q", "work per unit charge", "is potential a vector or scalar", "potential vs potential energy", "potential at a point" here.
  electric_potential_point_charge ← the FORMULA/VALUE of the potential of a point charge: V = kQ/r at distance r, which falls off as 1/r — ONE power of r, SLOWER than the field's 1/r². Halving r only DOUBLES V (not ×4 — the ×4 is the field's 1/r² instinct); V rides ABOVE E far out (they meet at r₀=2 then diverge); V is a SIGNED SCALAR (+Q hill, −Q well, no arrow). Teaches the point-charge VALUE V = kQ/r and its 1/r falloff; declares electric_potential_meaning (what V MEANS) as a prerequisite and does NOT re-teach it, and STOPS SHORT of multi-charge superposition of potentials, E = −dV/dr, the dipole potential, or capacitance. Route "V = kQ/r", "potential at distance r from a point charge", "potential due to a point charge", "why does potential fall off 1/r not 1/r²", "halve r does V quadruple", "is the potential of a negative charge negative" here.
  equipotential_surfaces          ← the GEOMETRY of constant-V surfaces: an equipotential surface is the locus of all points sharing one common V; for a point charge these are concentric SPHERES (r = kQ/V); the field is everywhere PERPENDICULAR to them and points from high V to low V; NO work is done moving a charge ALONG one (W = F·d·cos90° = 0) while moving BETWEEN surfaces costs W = qΔV; equal V-steps CROWD where the field is strong (r ~ 1/V); two distinct surfaces never intersect. Declares electric_potential_meaning (V = W/q), electric_potential_point_charge (V = kQ/r) and electric_field_point_charge (E = kQ/r²) as prerequisites and does NOT re-teach them; STOPS SHORT of the value V = kQ/r, dipole / uniform-field equipotentials, and conductors / capacitance. Route "what is an equipotential surface", "surfaces of constant potential", "why is the field perpendicular to the equipotential", "do you do work moving a charge along an equipotential", "equipotential spheres / lines", "why do equipotentials get closer together" here.
  electric_potential_dipole       ← the dipole POTENTIAL/VALUE: V = kp cosθ/r² at a far point, the SCALAR sum of the two charge potentials (V = kq/r₊ − kq/r₋). Its SIGN follows cos θ, i.e. POSITION (positive on the +q side, negative on the −q side, NOT set by which charge "wins"); it is ZERO across the WHOLE equatorial plane (θ=90°, every point equidistant from ±q), where the field E is nonetheless NON-zero (E = −grad V — potential is height, field is slope); and it falls as 1/r², one power STEEPER than a single charge's 1/r (because +q and −q nearly cancel far away). Declares electric_potential_point_charge (V = kQ/r), electric_potential_meaning (V = W/q) and electric_field_dipole (the dipole's vector FIELD) as prerequisites and does NOT re-teach them; STOPS SHORT of capacitance and the dipole's field magnitude/torque. Route "potential due to a dipole", "electric potential of a dipole", "V = kp cosθ/r²", "is the potential zero on the dipole's equator", "why is dipole potential zero on the perpendicular bisector", "does dipole potential fall as 1/r or 1/r squared", "is potential a vector or scalar" here.
  parallel_plate_capacitor_field  ← the UNIFORM field between two oppositely charged PARALLEL PLATES: straight, parallel, equally-spaced field lines from + to −, the SAME magnitude E = V/d = σ/ε₀ at EVERY interior point (independent of position), ≈0 OUTSIDE (the two sheet-fields cancel) with only a small edge fringe, and at fixed V, E ∝ 1/d (double the gap halves the field). Built by superposing two charged-sheet fields (each σ/2ε₀: ADD inside, CANCEL outside). Declares electric_field_point_charge, gauss_law_sheet (the σ/2ε₀ single sheet) and electric_potential_meaning as prerequisites and does NOT re-teach them; STOPS SHORT of capacitance C = ε₀A/d (→ capacitance), stored energy ½CV², and dielectrics. Route "uniform field between plates", "is the field the same everywhere between capacitor plates", "why is the field uniform between parallel plates", "field outside parallel plates", "what is E between parallel plates", "E = V/d", "field lines between capacitor plates" here.
  capacitance                     ← a capacitor's charge and voltage always move in LOCKSTEP so their ratio C = Q/V is a FIXED property of the device — set by geometry ALONE, C = ε₀A/d — not by how much charge or voltage you give it. Headlines: no charge ever crosses the gap (one plate charges +Q, the other −Q); Q/V stays numerically identical to C at every voltage (give it more charge or more volts and you've changed what it HOLDS, never what it IS); the slope of a Q-V graph IS the capacitance, in farads; at fixed V, doubling the plate area A doubles C (C ∝ A); at fixed V, doubling the separation d HALVES C (closer plates hold MORE charge, not less — C = ε₀A/d); and the formula derives by chaining σ = Q/A → E = σ/ε₀ → V = E·d. Declares parallel_plate_capacitor_field (the uniform field E = V/d it builds on) and electric_potential_meaning (what voltage/p.d. means) as prerequisites and does NOT re-teach them; STOPS SHORT of stored energy ½CV² (capacitor_energy_storage), dielectrics κ (dielectric_in_capacitor), series/parallel combinations (combination_of_capacitors), and RC charging. Route "what is capacitance", "C = Q/V", "C = epsilon0 A over d", "why doesn't capacitance change when I add more charge", "farad", "why does a smaller gap store more charge", "does capacitance depend on plate area", "capacitor charge vs voltage" here.

  ── Moving Charges and Magnetism (Class 12 Ch.4) ──
  magnetic_field_concept_B        ← what a magnetic field IS: a vector field sourced by MOVING charge (current), revealed (not created) by a compass; B circulates around the wire; no current = no field; just like E but from moving charge. Does NOT cover the magnitude B = μ₀I/(2πr).
  magnetic_field_wire             ← B around a straight current-carrying wire, B = μ₀I/(2πr), right-hand rule (thumb = I, fingers = B)
  biot_savart_law                 ← the Biot-Savart law itself: dB = (μ₀/4π) I(dl × r̂)/r² for a current element, sinθ dependence, summed/integrated to recover B = μ₀I/(2πr)
  magnetic_field_circular_loop    ← B on-axis = μ₀NI/2R, the field at the centre of a circular loop/coil of N turns: axial (⊥ the loop plane, grip RHR), built by superposition (every element's dB adds, never cancels); B ∝ N, ∝ 1/R (bigger loop = weaker); on the axis B(z) = μ₀NIR²/2(R²+z²)^{3/2}, maximal at the centre. The CENTRE/ON-AXIS LOOP field — distinct from the single-element law (biot_savart_law), the straight-wire field (magnetic_field_wire / amperes_circuital_law), the loop-as-bar-magnet (current_loop_acts_as_dipole), and the solenoid (magnetic_field_solenoid).
  amperes_circuital_law           ← Ampère's circuital law ∮B·dl = μ₀I_enc applied to a long straight wire: choose a coaxial circular Amperian loop, use symmetry (|B| constant & tangent) to get ∮B·dl = B·(2πr), set = μ₀I to DERIVE B = μ₀I/(2πr). The integral-law route (vs the Biot-Savart element-summation route). WIRE ONLY — no solenoid/toroid.
  magnetic_force_moving_charge    ← Lorentz force F = q v × B on a moving charge: the MAGNITUDE F = qvB sinθ and the resulting circular/cyclotron motion (radius r = mv/qB)
  magnetic_force_direction_right_hand_rule ← which WAY the magnetic force points: the right-hand rule for F = q v × B (fingers v, curl to B, thumb F), F ⊥ both v and B, a negative charge flips F by 180°, ⊗/⊙ into/out-of-page, v∥B → F = 0. DIRECTION only — no magnitude, no F = qvB sinθ, no circular motion.
  magnetic_force_perpendicular_no_work ← why a magnetic force can NEVER change a charge's SPEED: F ⊥ v at every instant → W = F·d·cos90° = 0 → ΔKE = 0 (work-energy theorem) → |v| is locked; the force only TURNS the velocity, never adds energy ("steers, not accelerates"). NO-WORK / energy only — no magnitude, no F = qvB sinθ, no radius r = mv/qB.
  circular_motion_charge_in_uniform_B ← how BIG the circle is: the RADIUS r = mv/qB for a charge moving perpendicular to a uniform field. Bigger with momentum (m or v, numerator), tighter with grip (q or B, denominator); the curved path CLOSES into a circle. SIZE / radius only — no period T = 2πm/qB (that is a separate concept), no force magnitude / qvB sinθ.
  helical_motion_charge_in_uniform_B ← what happens when the charge enters at an ANGLE (not perpendicular): it traces a HELIX. The across-field part v⊥ = v sinθ circles (r = m v⊥/qB) while the along-field part v∥ = v cosθ sails straight (v∥ × B = 0, no work), so each turn advances one PITCH p = v∥·T. theta alone sets the SHAPE (p/r = 2π cotθ); v and B only resize the coil. HELIX / pitch only — cites r = mv/qB, T = 2πm/qB, F = qvB sinθ without re-deriving; no velocity-selector / cyclotron device / toroid.
  cyclotron_period_independent_of_speed ← how LONG one orbit takes: the PERIOD T = 2πm/qB and why it is INDEPENDENT of speed v and radius r. A faster charge traces a bigger circle but finishes each lap in the SAME time (T = 2πr/v with r = mv/qB → v cancels → T = 2πm/qB). Also the cyclotron frequency f = qB/2πm. TIMING / period only — no radius re-derivation (cites the size concept), no force magnitude / qvB sinθ.
  force_on_current_carrying_wire  ← force on a current-carrying wire F = I L × B, BIL sinθ, the motor force, right-hand rule on L and B
  torque_on_current_loop_in_field ← τ = μ × B on a current loop, magnetic moment μ = NIA, loop ↔ bar magnet equivalence
  current_loop_acts_as_dipole     ← a current loop IS a magnetic dipole: its EXTERNAL field is identical to a bar magnet's, m = NIA is a vector along the axis, two faces are N and S poles, and it aligns like a compass in a field. The FIELD-EQUIVALENCE concept (vs torque_on_current_loop_in_field, which is the τ=μ×B dynamics).
  moving_coil_galvanometer        ← how a moving-coil galvanometer READS current: the BIL force on the coil's two sides is a couple (ΣF = 0, deflecting torque τ = NIAB); a RADIAL field (concave poles + soft-iron core) keeps the sides ⊥ B so τ stays NIAB at every angle (no sinθ fade, otherwise the scale crowds); a hairspring gives restoring τ = kφ; at equilibrium NIAB = kφ → φ = (NAB/k)·I, linear in current → a UNIFORM scale; current sensitivity φ/I = NAB/k is a fixed device constant. The instrument/MECHANISM concept. Does NOT cover ammeter/voltmeter conversion (shunt/series resistance).
  galvanometer_to_ammeter_voltmeter ← CONVERTING a galvanometer into an ammeter or a voltmeter: a galvanometer carries only a tiny full-scale current Ig and has coil resistance G. AMMETER = a SMALL shunt resistance S in PARALLEL so the current splits (only Ig through the coil, I−Ig through S); equal branch voltage Ig·G = (I−Ig)·S → S = Ig·G/(I−Ig) (small); the combined G‖S ≈ 0 Ω so an ammeter is in SERIES. VOLTMETER = a LARGE resistance R in SERIES so only Ig flows while the chain drops V → R = V/Ig − G (large); the combined G+R ≈ ∞ Ω so a voltmeter is in PARALLEL. The CONVERSION/CIRCUIT-TOPOLOGY concept. Does NOT re-derive how the coil reads current (that is moving_coil_galvanometer).
  bar_magnet_as_dipole            ← the BAR MAGNET as a magnetic dipole (NCERT Ch.5 §5.2): its magnetic field lines are continuous CLOSED loops (out of N, around to S, through the magnet S→N inside), so there is NO magnetic monopole — cut a magnet and you get two complete dipoles with new poles at the cut. It has a magnetic moment m (points S→N, m = NIA) and is EQUIVALENT to a solenoid; its far field is the 1/r³ dipole field with B_axial = (μ₀/4π)(2m/r³) = 2·B_equatorial — the electrostatic analog of an electric dipole (m↔p, μ₀/4π↔1/4πε₀). The "what a bar magnet IS / its field" concept. Does NOT cover a bar magnet's torque/energy in an external uniform field (τ = m×B, U = −m·B).
  bar_magnet_in_uniform_field     ← a bar magnet placed IN a uniform external field B (NCERT Ch.5 §5.2.3): each pole feels a force ±mB; equal-opposite on different lines → a COUPLE, so ΣF = 0 (no translation) but a torque τ = m × B = mB·sinθ rotates the magnet toward alignment (max at θ=90°, zero at θ=0°/180°). Released near alignment it OSCILLATES about θ=0° with period T = 2π√(I/mB) (the vibration magnetometer); potential energy U = −m·B = −mB·cosθ, a minimum at θ=0° (stable) and a maximum at θ=180° (unstable). The torque/oscillation/energy-IN-a-field concept; the magnetic twin of electric_dipole_in_field. Does NOT cover the bar magnet's OWN field (closed loops / no monopole / axial-equatorial), which is bar_magnet_as_dipole.
  gauss_law_magnetism             ← Gauss's Law for Magnetism (NCERT Ch.5 §5.3): the net magnetic flux through ANY closed surface is exactly zero, ∮B·dA = 0. Because magnetic field lines are continuous CLOSED loops with no start or end, every line that LEAVES a closed surface also RE-ENTERS it (flux out = flux in). Even a surface around a SINGLE pole nets zero — there is NO magnetic monopole (no magnetic "charge" to enclose). The deep contrast with the ELECTRIC Gauss law ∮E·dA = q/ε₀, where field lines start/end on charges so an enclosed charge gives non-zero flux. The flux-LAW / no-monopole concept; the magnetic twin of gauss_law. Does NOT cover a single bar magnet's field shape (bar_magnet_as_dipole) or electric flux (gauss_law / electric_flux).
  earths_magnetism                ← The Earth's Magnetism (NCERT Ch.5 §5.4): the Earth is a giant bar magnet tilted ~11° off its spin axis, so a compass points to MAGNETIC north and the horizontal angle from true (geographic) north is the DECLINATION D. A freely-pivoting needle DIPS below the horizontal by the DIP / inclination angle I; the total field B resolves into a horizontal component H = B cos I and a vertical component V = B sin I, with tan I = V/H and B = √(H²+V²) — the three "elements of the Earth's magnetic field" (declination, dip, horizontal component). The dip grows with magnetic latitude (tan I = 2 tan λ): I = 0° at the magnetic equator (needle flat, V = 0, B = H) and I = 90° at the magnetic poles (needle vertical, H = 0, B = V). Route "Earth's magnetic field", "magnetic declination", "angle of dip / inclination", "why does a dip needle point into the ground", "horizontal component of Earth's field", "elements of Earth's magnetism", "tan I = 2 tan λ", "why is the dip 90 at the poles and 0 at the equator", "does a compass point to true north" here. Does NOT cover a bar magnet's own field shape (bar_magnet_as_dipole) or the no-monopole flux law (gauss_law_magnetism).
  magnetisation_and_intensity     ← Magnetisation & Magnetic Intensity (NCERT Ch.5 §5.5): a solenoid's free current sets the magnetic INTENSITY H = nI (units A/m), independent of any material. A material core develops a MAGNETISATION M — net magnetic dipole moment per unit volume — as its atomic dipoles align to H. The TOTAL field inside is B = μ₀(H + M). Susceptibility χ = M/H and relative permeability μ_r = 1 + χ classify matter: diamagnetic (χ < 0, dipoles oppose), paramagnetic (small χ > 0), ferromagnetic (huge χ, B multiplied hundreds of times — why electromagnets have iron cores). Route "magnetisation", "magnetic intensity", "H and B and M relationship", "B = mu0(H+M)", "magnetic susceptibility", "relative permeability", "diamagnetic / paramagnetic / ferromagnetic", "why does an iron core make a stronger electromagnet", "M = chi H" here. Does NOT cover the Earth's field elements (earths_magnetism) or a bar magnet's own field (bar_magnet_as_dipole).
  parallel_currents_force         ← force between two parallel current-carrying wires: F/L = μ₀I₁I₂/2πd. Parallel (same-direction) currents ATTRACT, antiparallel REPEL (opposite of like charges). Defines the ampere.
  magnetic_field_solenoid         ← B = μ₀nI inside a long solenoid, ≈ 0 outside, RHR-swap (fingers = I, thumb = B inside)

  ── Electromagnetic Induction (Class 12 Ch.6) ──
  magnetic_flux                   ← Magnetic Flux itself (NCERT Ch.6 §6.3): Φ = B·A·cosθ counts how many magnetic field lines thread a loop's window — a fixed SNAPSHOT count, not a flow. A stronger B packs the lines denser; a bigger A catches more of them; tilting the loop toward θ = 90° (edge-on) shrinks the effective area to nothing and drops Φ to ZERO even though B is completely unchanged (the classic "strong field, zero flux" trap); past 90° the area vector tips to the far side and Φ turns NEGATIVE. θ is measured from the loop's AREA VECTOR (the normal), never from the flat face of the loop itself. Unit is the weber, Wb = T·m². Route "magnetic flux", "what is flux", "Phi = B A cos theta", "why is flux zero if the field is strong", "why does tilting the loop change the flux", "is theta the angle with the plane or the normal", "why is flux negative", "flux sounds like something is flowing", "weber unit" here. Does NOT cover a CHANGING flux inducing an EMF, Lenz's law, or the galvanometer/needle deflection (that is faraday_law_induction — the sibling and downstream concept that layers induction ON TOP of this one).
  faraday_law_induction           ← Faraday's Law of Electromagnetic Induction (NCERT Ch.6 §6.3–6.5): magnetic FLUX Φ = B·A·cosθ measures how much magnetic field threads a coil. A STEADY flux induces nothing; only a CHANGING flux induces an EMF, ε = −N dΦ/dt (Faraday) — the induced EMF is proportional to the RATE of change of flux and to the number of turns N. The minus sign is LENZ'S LAW: the induced current always flows so as to OPPOSE the change that caused it (energy conservation) — which is why a magnet falls slowly through a copper pipe, and why pushing a magnet in vs pulling it out reverses the sign of the EMF. Route "Faraday's law", "electromagnetic induction", "induced EMF", "why does moving a magnet make a current", "epsilon = -N dPhi/dt", "Lenz's law", "why does a magnet fall slowly through a copper pipe", "induced current direction", "changing flux induces voltage", "how does a transformer / generator work" here. Does NOT cover the flux DEFINITION itself with no induction/EMF in play (that is magnetic_flux — the prerequisite), motional EMF of a sliding rod (ε = Bvl), self/mutual inductance, or AC generators in detail (later Ch.6 concepts).
  motional_emf                    ← Motional EMF (NCERT Ch.6 §6.6, spanning into §6.7 Energy Consideration): a ROD sliding on two parallel rails in a uniform field B develops ε = B·v·l, derived TWO consistent ways — the macroscopic flux-rate route (Φ = B·l·x, dΦ/dt = Blv, same as Faraday's law) AND the microscopic route (the qv×B force on the rod's own free charges separates them along the rod, building an internal field E_internal = vB at equilibrium). The RIGHT-HAND RULE fixes WHICH end is positive (fingers along v, curl toward B, thumb gives F — reversing v flips the polarity deterministically). ε EXISTS the instant the rod moves whether or not the circuit is closed (an open-circuit voltmeter reads it; I = 0 exactly only because the circuit is open, not because ε is absent); closing the circuit lets current I = ε/R flow, and Lenz's law gives a retarding force F_retard = BIl on the rod itself (no coil/loop geometry required — the same opposition principle Faraday's law names). The ENERGY argument (§6.7): keeping the rod at constant v needs an external force F_ext = F_retard, and the mechanical power delivered (F_ext·v) exactly equals the electrical power dissipated (I²R) — nothing is created or destroyed; a magnetic force does zero work on any single charge, yet the resistor visibly heats because the ROD is pushed. Route "motional EMF", "rod sliding on rails", "epsilon = Blv", "EMF of a moving rod", "why does a sliding rod have an EMF", "which end of the rod is positive", "right-hand rule for motional EMF", "does a rod need a closed circuit to have an EMF", "retarding force on a sliding rod", "why do I need to push the rod if the magnetic force does no work", "where does the electrical energy in the resistor come from", "regenerative braking" here. Does NOT cover the flux-through-a-coil / moving-magnet route (that is faraday_law_induction — the sibling and prerequisite), self/mutual inductance, or AC generators.
  eddy_currents                   ← Eddy Currents (NCERT Ch.6 §6.8): a Lenz's-law consequence that forms INSIDE a BULK conductor (not a wire loop) whenever the local flux through it changes — a swinging conducting plate crossing a magnetic-field gap develops closed, swirling induced currents at its own leading/trailing edges, and those currents' own field opposes the plate's motion (a retarding force, the same opposition principle as Faraday/motional EMF, now on a solid block instead of a coil or rod). The STRENGTH of the effect is controlled by the CONNECTIVITY of the current path inside the metal, not by the material's resistivity — cutting radial slots (or laminating a stack of thin insulated sheets) breaks the loops into small, weak, nearly-harmless ones without changing what the metal is made of. The mechanism is neither good nor bad by itself: an induction cooktop/furnace WANTS it strong (heating a conductor with no flame or contact); a transformer core wants it SUPPRESSED by lamination (to avoid wasting energy as heat). Route "eddy currents", "why does a swinging metal plate slow down in a magnetic field", "induction damping", "why does cutting slots into a plate reduce the braking", "why are transformer cores laminated", "how does an induction cooktop / induction furnace heat a pan with no flame", "electromagnetic damping", "Foucault currents" here. Does NOT cover self/mutual inductance or AC generators.
  inductance                      ← Inductance — Self & Mutual (NCERT Ch.6 §6.9, Exp 6.3). SELF-INDUCTANCE: a coil is electrical INERTIA — a changing current links a changing flux to ITSELF, inducing a back-EMF ε_L = −L·dI/dt that opposes the CHANGE in its own current, so the current RAMPS and never jumps; L is PURE GEOMETRY (turns N, area A, length l, core μ_r) and NEVER depends on the current; the coil stores field energy U = ½LI² that escapes as the switch-off spark (bigger dI/dt at switch-off → huge back-EMF spike → spark, e.g. an ignition coil). MUTUAL INDUCTANCE: a changing current in ONE coil induces ε₂ = −M·dI₁/dt in a SECOND, DISCONNECTED coil across empty space with no wire between them (a transformer, a wireless charging pad); M = k√(L₁L₂) with k∈[0,1] falling with separation and rising with a shared core, and M is symmetric (M₁₂ = M₂₁). Both halves are the SAME Faraday flux-linkage physics (Λ = LI self, Λ = MI₁ mutual). Route "inductance", "self-inductance", "mutual inductance", "back EMF", "why does current in a coil rise gradually / not jump", "epsilon = -L dI/dt", "why is the back EMF zero at steady current", "why do I get a spark when I open a switch on a coil", "energy stored in an inductor", "U = 1/2 L I squared", "epsilon_2 = -M dI1/dt", "why does a transformer / wireless charger work with no wire between the coils", "coefficient of coupling", "M = k root L1 L2", "how does an ignition coil make a spark" here. Does NOT cover the AC GENERATOR (that is ac_generator — a rotating coil producing AC) or transformer voltage-ratio numerics.
  ac_generator                    ← AC Generator (NCERT Ch.6 §6.10, the LAST concept of Ch.6 Electromagnetic Induction). A coil of N turns and area A rotating STEADILY at angular speed omega in a uniform magnetic field B produces a sinusoidal (ALTERNATING) EMF by Faraday's law. The flux LINKAGE Phi = N·B·A·cos(omega t) is a COSINE (maximum when the coil is face-on / plane perpendicular to B, zero when edge-on / plane parallel to B); the induced EMF is the RATE of change of that flux, eps = -dPhi/dt = N·B·A·omega·sin(omega t) — a SINE, 90 DEGREES out of phase with the flux, so the EMF PEAKS exactly where the flux is ZERO (coil edge-on) and is zero where the flux is maximum (the classic JEE trap). The PEAK EMF eps0 = N·B·A·omega has omega INSIDE it, so cranking faster raises BOTH the peak AND the frequency f = omega/2pi; a perfectly STEADY rotation speed still gives an alternating output (no acceleration needed — the changing geometry reverses the flux every half turn). Two continuous SLIP RINGS + fixed brushes carry the coil's natural AC out; a single SPLIT-RING commutator instead flips the connection each half turn to give pulsating DC. Route "AC generator", "how does an AC generator / dynamo work", "how is alternating current produced", "coil rotating in a magnetic field", "epsilon = NBA omega sin(omega t)", "peak EMF of a generator", "eps0 = NBA omega", "why is the EMF maximum when the coil is parallel to the field / flux is zero", "phase difference between flux and EMF in a generator", "why does a generator give AC not DC", "slip rings vs split ring / commutator", "how a bicycle dynamo works", "why does faster rotation give more voltage AND higher frequency" here. Does NOT cover self/mutual inductance (that is inductance), transformer voltage-ratio numerics, rms/averaged EMF, or AC-circuit reactance (next chapter).

  ── Electromagnetic Waves (Class 12 Ch.8) ──
  displacement_current            ← Displacement Current (NCERT Ch.8 §8.2, the chapter's load-bearing opener). A charging capacitor's constant current I_c fills the wires but NOTHING crosses the gap between the plates — one plate charges +Q, the other -Q. Applying Ampère's law ∮B·dl = μ₀I_enc with a loop around the wire hits a CONTRADICTION: a flat disk surface is pierced by the wire (I_enc = I_c), but a balloon-shaped surface bulging through the gap is pierced by nothing (I_enc = 0) — the SAME loop, two different answers. A probe placed in the gap settles the contradiction empirically: B is measurably there, equal to the field beside the wire, even with zero conduction current. Maxwell's fix: the CHANGING electric flux Phi_E through the gap itself acts as a current — the DISPLACEMENT current I_d = epsilon-nought times dPhi_E/dt, which equals I_c exactly while charging and drops to zero the instant charging stops (I_d is not moving charge; it is changing flux acting like a current for magnetism). This completes Ampère's law into the generalized Ampère-Maxwell law: loop-integral of B.dl = mu-naught times (I_c + epsilon-nought dPhi_E/dt) — a sum that stays invariant no matter which surface the loop bounds. Also covers how B varies radially in the gap (rising linearly inside the plate radius, peaking at the edge, falling as 1/r beyond it). Route "displacement current", "why does a magnetic field exist in a capacitor's gap", "Ampere's law two surfaces contradiction", "I_d = epsilon0 dPhi_E/dt", "Ampere-Maxwell law", "why doesn't Ampere's law work for a charging capacitor", "is displacement current a real current", "how can there be a magnetic field with no current crossing the gap", "generalized Ampere's circuital law" here. Does NOT cover how the coupled changing E and B fields propagate as electromagnetic waves or the wave speed c = 1/root(mu0 epsilon0) (that is em_wave_propagation — the direct sequel, absorbing the once-separate em_wave_nature/speed_of_em_waves ideas), or the EM spectrum (em_spectrum, deferred). Declares amperes_circuital_law and capacitance as prerequisites; does not re-teach them.
  em_wave_propagation             ← Electromagnetic Wave Propagation (NCERT Ch.8 §8.3, the direct sequel to displacement_current). Mutually regenerating changing E and B fields self-propagate through EMPTY SPACE as a transverse wave — no material medium is needed, since the fields regenerate each other rather than something material vibrating. E, B, and the direction of travel are mutually PERPENDICULAR, with E×B always pointing along the direction of travel (crest or trough alike). E and B oscillate IN PHASE — same crests, same zeros, not 90° apart. The wave's speed is c = 1/root(mu0 epsilon0) ≈ 3×10⁸ m/s — the identity that reveals LIGHT ITSELF is an electromagnetic wave. The amplitudes are locked, B0 = E0/c (so B0 is numerically tiny in Tesla, ~0.4 microtesla for a strong E0 of 120 V/m), and energy is split EXACTLY half-and-half between the two fields (u_E = u_B at every instant, despite B0's tiny-looking number). Given E_y = E0 sin(kx - omega t), the partner B_z = (E0/c) sin(kx - omega t) is fully determined — same phase, amplitude E0/c, axis fixed by E×B. Inside a medium of refractive index n, v = c/n = 1/root(mu_r epsilon_r); frequency stays fixed at the source value, only wavelength shortens (lambda = v/nu). Route "electromagnetic wave", "why does light need no medium to travel through vacuum", "are E and B in phase or 90 degrees apart", "why is E perpendicular to B", "direction of E cross B", "speed of light from mu0 epsilon0", "is c matching light a coincidence", "B0 equals E0 over c", "energy carried by an electromagnetic wave", "why is B tiny if it carries half the energy", "write B given E for an EM wave", "speed of an EM wave in a medium", "does frequency change in a medium", "why does wavelength shorten in glass but not frequency" here. Does NOT cover the electromagnetic spectrum's bands/uses (electromagnetic_spectrum, deferred), quantitative intensity/radiation pressure/momentum (em_wave_energy_momentum, deferred), the displacement-current law itself (prerequisite displacement_current), or Faraday's law (prerequisite faraday_law_induction). Absorbs the once-separately-seeded em_wave_nature and speed_of_em_waves ideas into one atomic diamond (aspects: foundational=phenomenon through the speed payoff, structure_and_phase=E⊥B⊥v and in-phase oscillation, field_relations=amplitude ratio/energy split/write-B-given-E, in_medium=v=c/n and wavelength shortening, exploration=all controls live).

CRITICAL DISAMBIGUATION (electromagnetic waves, Ch.8):
- "displacement current" / "why is there a B field in a capacitor's gap" / "Ampere's law fails for a charging capacitor" / "I_d = epsilon0 dPhi_E/dt" / "Ampere-Maxwell law" / "two surfaces different Ampere's law answers" / "is displacement current real" → displacement_current (does NOT cover EM wave propagation, wave speed, or the spectrum — those are downstream siblings)
- "how does light travel through empty space with no medium" / "why are E and B perpendicular" / "are E and B in phase or 90 degrees apart" / "speed of light from mu0 and epsilon0" / "is it a coincidence that this equals the speed of light" / "B0 equals E0 over c" / "why is the magnetic field so tiny if it carries half the energy" / "write the magnetic field given the electric field for an EM wave" / "speed of an electromagnetic wave in a medium" / "does frequency change when a wave enters glass" → em_wave_propagation (does NOT cover the displacement-current law itself, which is the PREREQUISITE displacement_current, or the spectrum's bands/uses, which is electromagnetic_spectrum — deferred)
  ── Alternating Current (Class 12 Ch.7) ──
  ac_voltage_resistor             ← AC Voltage Applied to a Resistor (NCERT Ch.7 §7.2, the FIRST concept of Ch.7 Alternating Current — the chapter's baseline). A resistor obeys Ohm's law at EVERY instant of a sinusoidal voltage v = vm sin(omega t), so the current i = v/R is exactly IN PHASE with the voltage — iₘ = vₘ/R, zero phase lag or lead, peaks together, zeros together (never a lag/lead like an inductor or capacitor will show later this chapter). The instantaneous power p = v·i = vₘiₘ sin²(omega t) is NEVER negative — a resistor only ever DISSIPATES energy, never returns it (the baseline that inductors/capacitors ahead will break). The CYCLE-AVERAGE current is EXACTLY zero over any whole number of periods, so an averaging meter cannot rate AC — yet the resistor keeps heating the whole time (the zero-average paradox). The single honest DC-equivalent rating is the RMS value: Vᵣₘₛ = vₘ/√2 ≈ 0.707vₘ (and Iᵣₘₛ = iₘ/√2) — every mains/appliance rating you will ever see IS this rms number, and the true peak sits √2 higher (the classic "the rating is not the peak" trap). The recipe behind 0.707 is square → mean → root: ⟨i²⟩ = iₘ²/2, then Iᵣₘₛ = √⟨i²⟩ = iₘ/√2, giving ⟨p⟩ = Iᵣₘₛ²R = ½vₘiₘ. The mean of sin²(omega t) is EXACTLY ½ (not approximately), from the identity sin²(omega t) = (1 − cos 2·omega·t)/2, where the cos 2·omega·t term is the SAME double-frequency (2f) pulse visible in the power curve. Route "AC voltage on a resistor", "resistor in AC circuit", "is current in phase with voltage for a resistor", "i = v/R for AC", "why is power never negative for a resistor", "average current in AC is zero", "why doesn't an AC ammeter read zero", "what is rms value", "root mean square", "Vrms = Vm / root 2", "why is the peak higher than the rated voltage", "230 volts is rms or peak", "square mean root", "why is average power half the peak power", "why is the average of sin squared one half" here. Does NOT cover phasor diagrams (that is phasors, next), the phase shifts of an inductor or capacitor in AC (that is ac_voltage_inductor / ac_voltage_capacitor, later), or how the sinusoidal EMF itself is generated (that is ac_generator, the prerequisite — a callback only, never re-derived here).
  ac_voltage_inductor             ← AC Voltage Applied to an Inductor (NCERT Ch.7 §7.3, the SECOND concept of Ch.7 Alternating Current). A pure (near-zero-resistance) inductor's current LAGS the applied sinusoidal voltage by EXACTLY a quarter cycle (90 degrees) — i = iₘ sin(omega t − 90°) = −iₘ cos(omega t), NEVER in phase and NEVER leading (leading is the capacitor's later story). WHY: the coil's own changing flux induces a back-emf that opposes the change, so the applied voltage v = L(di/dt) sets the current's SLOPE, not its instantaneous size — the current is geometrically forced to crest exactly where the voltage crosses zero, and to be zero-but-changing-fastest exactly where the voltage peaks. The opposition is a frequency-MADE reactance, Xₗ = omega·L (unlike a resistor's fixed R) — iₘ = vₘ/Xₗ, so the SAME coil chokes a fast AC signal harder than a slow one; doubling the frequency halves the peak current. The cycle-average power is EXACTLY zero — p = v·i = −(vₘiₘ/2) sin(2·omega·t) swings symmetrically positive and negative, and every joule stored in the magnetic field (U = ½Li²) during one quarter cycle is fully returned during the next — reactance opposes current WITHOUT ever dissipating energy, unlike a resistor. Route "AC voltage on an inductor", "inductor in AC circuit", "does current lag or lead voltage for an inductor", "why does current lag behind voltage in a coil", "v equals L di dt for AC", "inductive reactance", "Xl = omega L", "why does a coil's opposition depend on frequency", "why does a coil choke high frequency AC", "average power in a pure inductor", "why is average power zero in an inductor if current is flowing", "where does the energy stored in a coil go", "im = vm over omega L", "why does doubling frequency halve the current through a coil" here. Does NOT cover the capacitor's mirror (LEADING) behaviour (that is ac_voltage_capacitor, now built, see below), phasor diagrams (that is phasors, later), inductor DC transients / the LR time constant (that is inductance, the prerequisite — a callback only, never re-derived here), or combining L with R and C (that is series_lcr_circuit, later).
  ac_voltage_capacitor            ← AC Voltage Applied to a Capacitor (NCERT Ch.7 §7.4, the THIRD concept of Ch.7 Alternating Current). A pure (ideal, no-leakage) capacitor's current LEADS the applied sinusoidal voltage by EXACTLY a quarter cycle (90 degrees) — i = iₘ sin(omega t + 90°) = iₘ cos(omega t), NEVER in phase and NEVER lagging (lagging is the inductor's earlier story). WHY: charge must physically accumulate on the plates before the plate voltage can build, so the current — the RATE charge is delivered, i = C(dv/dt) — is largest exactly where the voltage's slope is steepest (voltage crossing zero) and is exactly zero where the voltage peaks (the plates momentarily full, nothing more can arrive). The opposition is a frequency-MADE reactance, X_C = 1/(omega·C) that FALLS as frequency rises (unlike the coil's Xₗ = omega·L, which RISES) — iₘ = vₘ/X_C, so the SAME capacitor welcomes a fast AC signal and starves a slow one, blocking steady DC outright; doubling the frequency (or the capacitance) doubles the peak current. The cycle-average power is EXACTLY zero — p = v·i = +(vₘiₘ/2) sin(2·omega·t) swings symmetrically positive and negative, and every joule stored in the electric field between the plates (U = ½Cv²) during one quarter cycle is fully returned during the next — reactance opposes current WITHOUT ever dissipating energy, unlike a resistor. Route "AC voltage on a capacitor", "capacitor in AC circuit", "does current lag or lead voltage for a capacitor", "why does current lead voltage in a capacitor", "i equals C dv dt for AC", "capacitive reactance", "Xc = 1 over omega C", "why does a capacitor's opposition fall with frequency", "why does a capacitor block DC", "why does a capacitor pass high frequency AC easily", "average power in a pure capacitor", "why is average power zero in a capacitor if current is flowing", "where does the energy stored in a capacitor go", "im = omega C vm", "why does doubling frequency double the current through a capacitor" here. Does NOT cover the inductor's mirror (LAGGING) behaviour (that is ac_voltage_inductor, the prerequisite — a callback only, never re-derived here), phasor diagrams (that is phasors, now built, see below), capacitor DC charging transients / the RC time constant (that is capacitance, the prerequisite — a callback only), or combining C with R and L (that is series_lcr_circuit, later).
  phasors                         ← Phasors — Rotating Vectors for AC (NCERT Ch.7 §7.5, the FOURTH concept of Ch.7 Alternating Current, sitting AFTER all three individual R/L/C element concepts). Teaches REPRESENTATION, not new physics: a sinusoid is the vertical SHADOW of an arrow (a phasor) rotating steadily at angular speed omega — the arrow's LENGTH is the constant peak amplitude, its shadow is the changing instantaneous value (confusing the two — "the arrow's length IS the value right now" — is the concept's own confronted misconception). Every phasor in a circuit rides ONE shared clock, so the angle between two co-rooted arrows is CONSTANT at every instant — this is WHY a single frozen phasor diagram fully captures a phase relationship (the second confronted misconception: "a frozen diagram can't hold timing, you need to watch a whole cycle"). The chapter's three settled facts become three frozen angles on the SAME rotating disc: a resistor's current phasor is drawn IN STEP with voltage (phi = 0 degrees), an inductor's current phasor 90 degrees BEHIND (lag), a capacitor's current phasor 90 degrees AHEAD (lead) — the capacitor's diagram is the exact MIRROR of the inductor's, same right angle, opposite side. Reading convention: rotation is COUNTERCLOCKWISE, and the arrow AHEAD in the spin reaches the peak reference line FIRST — ahead-in-rotation means peaks-first-in-time. Angle converts to time via Delta t = (phi/360 degrees)*T (a 90-degree gap at a 4-second period is exactly 1.0 second). The formal algebra, theta = omega*t with omega = 2*pi/T = 2*pi*f, and i = im*sin(omega*t -+ pi/2), is the LAST idea taught — the frozen diagrams written as equations, not the other way round. Route "phasor diagram", "rotating vector for AC", "what is a phasor", "why does a spinning arrow draw a sine wave", "phasor length vs instantaneous value", "why does one frozen diagram show the whole phase relationship", "phase angle on a phasor diagram", "which phasor leads or lags on a diagram", "how do you read lead or lag off a phasor diagram", "counterclockwise rotation convention for phasors", "theta equals omega t", "converting phase angle to time delay", "delta t equals phi over 360 times T", "im sin omega t plus or minus pi over two" here. Does NOT cover ADDING phasors tip-to-tail, impedance, or resonance (that is series_lcr_circuit, now built, see below — those are this concept's deliberate withholdings), power factor (ac_power_factor, now built, see below), or the individual R/L/C mechanisms themselves — WHY a coil lags or a capacitor leads (those are ac_voltage_inductor / ac_voltage_capacitor, the prerequisites — a callback only, never re-derived here).
  series_lcr_circuit              ← Series LCR Circuit — Impedance and Resonance (NCERT Ch.7 §7.6, the FIFTH concept of Ch.7 Alternating Current, sitting right after phasors — the tool this concept finally puts to use). Teaches SYNTHESIS, not new element mechanisms: R, L and C share ONE series loop and ONE common current; each element's settled voltage phase (in phase / a quarter behind / a quarter ahead) is a one-clause callback, never re-derived. The three element voltages combine TIP-TO-TAIL as phasors (never arithmetically — the confronted misconception: "AC voltages in series add like numbers") into the source voltage, vm^2 = V_R^2 + (V_L-V_C)^2. This gives a net reactance X = X_L - X_C, an impedance Z = sqrt(R^2+X^2) (NEVER R+X_L+X_C, a demoted third misconception), a phase angle tan(phi) = X/R (whichever reactance is LARGER sets whether current leads or lags), and one special RESONANT frequency f0 = 1/(2*pi*sqrt(LC)) where X_L = X_C, the two reactances erase each other, impedance collapses to R alone, and the current peaks at vm/R — breaking the earned-but-wrong belief that more circuit elements always means less current. Resistance alone sets how SHARP that resonance peak is (Q = f0/delta_f, bandwidth delta_f = R/(2*pi*L)) without ever moving WHERE it sits (f0 depends only on L and C, never on R). Route "series LCR circuit", "impedance of a circuit", "Z equals root R squared plus X squared", "why don't AC voltages in series just add up", "why is one element's voltage bigger than the source", "phasor addition tip to tail", "resonance in an LCR circuit", "why does current peak at one frequency", "resonant frequency formula", "f0 equals one over two pi root LC", "does more resistance change the resonant frequency", "sharpness of resonance", "Q factor", "bandwidth of resonance", "how does a radio tune to one station", "why can't impedances just add like resistances" here. Does NOT cover the individual R/L/C mechanisms themselves (those are ac_voltage_resistor / ac_voltage_inductor / ac_voltage_capacitor, the prerequisites — a callback only, never re-derived here), the frozen-angle phasor REPRESENTATION itself with no addition/impedance/resonance in play (that is phasors, the prerequisite this concept builds on), or power, power factor, wattless current, or free LC energy oscillation (those are ac_power_factor, now built, see below, and lc_oscillations, later — this concept's own deliberate withholdings; its power HUD slot stays empty on purpose).
  ac_power_factor                 ← Power in AC Circuits — The Power Factor (NCERT Ch.7 §7.7, the SIXTH concept of Ch.7 Alternating Current, sitting right after series_lcr_circuit — teaching the POWER consequence of the impedance/resonance machinery just built). Instantaneous power p(t)=v*i is a DOUBLE-FREQUENCY wave riding a non-zero average — an averaging wattmeter reads that average, <p> = V_rms*I_rms*cos(phi), the AVERAGE (real) power. The POWER FACTOR cos(phi) = R/Z is the fraction of the APPARENT power S = V_rms*I_rms (the naive volts-times-amps ceiling) that is actually real — volts times amps ALONE over-predicts whenever a phase angle exists (the confronted misconception: "average power is just V_rms times I_rms"). Only the current's IN-PHASE component, I_rms*cos(phi), delivers energy; the perpendicular component, I_rms*sin(phi), is WATTLESS — it flows, but spends nothing, so a BIGGER current does NOT always mean bigger power (the second confronted misconception, shown by a resistance step where current rises while the meter's reading falls). All real power lands in the resistor alone, P = I_rms^2*R — the inductor and capacitor only borrow and fully return energy every cycle, dissipating nothing. The power triangle P/Q/S is the settled impedance triangle (R, X, Z) uniformly scaled by I_rms^2, with reactive power Q measured in VAR (never called "Q factor" — that symbol belongs to series_lcr_circuit's sharpness, a different quantity). Impedance, phase angle, and resonance are one-clause SETTLED CALLBACKS here, never re-derived. Route "power factor", "cos phi", "average power in an AC circuit", "why isn't power just V times I", "apparent power vs real power", "what is a volt-ampere", "wattless current", "why does more current sometimes mean less power", "where does the power actually get dissipated in an LCR circuit", "power triangle", "P Q S relations", "reactive power", "VAR unit", "kVA vs kW rating", "why is my equipment rated in kVA not kW" here. Does NOT cover impedance/phase-angle/resonance derivation itself (those are series_lcr_circuit, the prerequisite — a callback only, never re-derived here), free LC energy oscillation with the source removed (that is lc_oscillations, now built, see below), or transmission-line voltage step-up (that is transformer, now built, see below — transmission stays narration-only here).
  lc_oscillations                 ← LC Oscillations — The Circuit's Own Rhythm (NCERT Ch.7 §7.8, the SEVENTH concept of Ch.7 Alternating Current, sitting right after ac_power_factor). Teaches the FREE (source-free) circuit: a capacitor charged to V0 is connected to an inductor and the SOURCE IS PHYSICALLY REMOVED (a battery plus a two-position switch replace it, then the switch throws and the battery leaves the loop entirely) — the L-C pair then oscillates by itself at its own NATURAL frequency omega0 = 1/sqrt(LC), never a source-imposed one. The current is MAXIMUM exactly when the charge is zero — the coil's own inertia keeps a flowing current from stopping, driving it through and recharging the plates with REVERSED polarity (the primary aha, breaking "a discharged capacitor is a finished circuit" / "q=0 means i=0"). The swing repeats at f0 = 0.25 Hz — the EXACT frequency the driven series_lcr_circuit favoured at resonance, now revealed as the circuit's OWN property, set only by L and C, never by the initial voltage (the supporting aha). The stored energy trades intact between the capacitor's electric field (1/2 q^2/C) and the inductor's magnetic field (1/2 L i^2), an ALL-WATTLESS exchange where the total never moves and nothing is ever spent (breaking "an ideal oscillation must still run down" — there is no heat bar at all until resistance is added). The whole motion is the EXACT electrical twin of a mass on a spring: charge maps to displacement, current maps to velocity, inductance maps to mass (inertia — why the current doesn't stop at zero charge), and reciprocal capacitance maps to the spring constant. Real resistance damps the swing: energy leaks away as heat, the amplitude decays inside a shrinking envelope, and sustaining an oscillation forever needs a periodic push at the circuit's own natural frequency (the honest reason a real driven circuit needs a source at all). Route "LC oscillations", "LC circuit with no source", "charged capacitor connected to an inductor with the battery removed", "why doesn't the current stop when the capacitor is empty", "why is the current maximum when the charge is zero", "does an LC circuit oscillate forever", "natural frequency of an LC circuit", "omega0 equals one over root LC", "energy exchange between capacitor and inductor", "why doesn't an ideal LC circuit lose energy", "mass spring analogy for LC circuit", "electrical equivalent of simple harmonic motion", "why does inductance act like mass", "why does a real LC circuit's oscillation die out", "free oscillation with the source removed" here. Does NOT cover the individual R/L/C element mechanisms, impedance, resonance, or power (those are the six sealed AC siblings — one-clause callbacks only, never re-derived here), driven or forced oscillation with an active AC source (that is series_lcr_circuit — a source-DRIVEN circuit, the opposite front door from this concept's source-REMOVED story), or mutual inductance / turns ratio / voltage step-up (that is transformer, now built, see below).
  transformer                     ← Transformer — Trading Voltage for Current (NCERT Ch.7 §7.9, the EIGHTH and LAST concept of Ch.7 Alternating Current, sitting right after lc_oscillations — the chapter CLOSES here). Teaches the two-coil machine: one AC-driven flux, made by the primary, circulates a closed iron core and threads BOTH windings — two electrically DISJOINT circuits (no wire between them, ever) linked only by the shared changing flux (Faraday's law, a one-clause callback). Because every turn on either winding rides the SAME changing flux, every turn earns the same EMF share (per_turn = Vp/Np = Vs/Ns identically), so the TURNS RATIO sets the VOLTAGE ratio: Vs/Vp = Ns/Np — more secondary turns steps voltage UP, fewer steps it DOWN. An IDEAL transformer passes power through completely unchanged, Vp*Ip = Vs*Is — nothing is amplified, volts up means amps down (the PRIMARY aha, breaking "step-up = free power": the current does NOT double along with the voltage, it HALVES). A transformer works ONLY on CHANGING flux: swap the AC source for a steady DC battery and there is exactly ONE transient blip at the instant of connection, then the secondary reads zero forever after — even though the primary still carries a large STEADY current sustaining a large STEADY flux (dPhi/dt=0 means induced EMF=0, however big the flux is; the second confronted misconception, breaking "a transformer works on DC too — steady current still makes flux" — and the reason the power grid is AC, not DC). Real transformers leak a little energy as four named losses — copper (I^2R) heat in the windings, EDDY CURRENTS swirling inside the core (suppressed by LAMINATING the core into thin insulated sheets, which chop the wide eddy loops a solid block would carry), hysteresis (the core's own magnetic domains flipping, audible as a faint hum), and stray flux that misses the secondary — landing a well-designed transformer around 95% efficient. This is WHY long-distance power transmission works at high voltage: sending the same power at a higher voltage lowers the line current (I=P/V), and since resistive line loss is I^2*R_line, a tenfold voltage step-up collapses the line loss a HUNDREDFOLD — the entire reason a power grid exists, cashing ac_power_factor's grid-transmission anchor seed. Route "transformer", "how does a transformer work", "step up or step down transformer", "turns ratio", "Vs over Vp equals Ns over Np", "how do you find the secondary voltage from the turns ratio", "why does a transformer need AC and not DC", "why does the secondary read zero on a battery", "why did the needle jump once when I connected a battery to a transformer", "does a transformer amplify power", "if the voltage doubles why doesn't the power double", "why does the primary current rise when I add a load to the secondary", "why are transformer cores laminated", "eddy currents in a transformer core", "transformer efficiency", "why does a transformer hum", "why is electricity transmitted at high voltage", "why do power lines lose less energy at high voltage", "why are pylon cables at such high voltage" here. Does NOT cover Faraday's law itself, rms values, real power, or I^2R heating (settled one-clause callbacks from the sealed AC siblings and electrical_power_in_resistor), does NOT quantify mutual inductance M in henries (that is inductance, the Ch.6 prerequisite — a callback only), and does NOT treat loaded-primary back-EMF regulation, magnetizing current, rectification, or switch-mode electronics (out of scope, beyond syllabus). CHAPTER END: this is the last concept of Ch.7 Alternating Current — no successor concept follows.

CRITICAL DISAMBIGUATION (electromagnetic induction, Ch.6):
- "what is magnetic flux" / "Phi = B A cos theta" / "why is flux zero if the field is strong" / "why does tilting the loop change the flux" / "is theta measured from the plane or the normal" / "why is flux negative past ninety degrees" / "does flux mean something is flowing" / "weber unit" (NO induction/EMF/needle/current in the question) → magnetic_flux
- "Faraday's law" / "flux through a coil" / "moving magnet induces current" / "epsilon = -N dPhi/dt" / "Lenz's law" / "magnet falls slowly through a copper pipe" → faraday_law_induction
- "motional EMF" / "rod sliding on rails" / "epsilon = Blv" / "which end of the sliding rod is positive" / "right-hand rule for a sliding rod" / "does an open-circuit rod still have an EMF" / "retarding force on a sliding rod" / "why push the rod if the magnetic force does no work" / "energy dissipated in the resistor from a sliding rod" → motional_emf
- "eddy currents" / "why does a swinging metal plate brake itself in a field" / "why do slots in a plate reduce the drag" / "why are transformer cores laminated" / "induction cooktop / furnace heating" / "Foucault currents" / "electromagnetic damping of a solid conductor" → eddy_currents
- "inductance" / "self-inductance" / "mutual inductance" / "back EMF" / "why does the current in a coil rise gradually and not jump" / "epsilon = -L dI/dt" / "why is the back EMF zero at steady current" / "why do I get a spark when I open a switch on a coil" / "energy stored in an inductor" / "U = 1/2 L I squared" / "epsilon_2 = -M dI1/dt" / "why does a transformer or wireless charger work with no wire between the coils" / "coefficient of coupling k" / "M = k root L1 L2" / "how does an ignition coil make a spark" → inductance
- "AC generator" / "how does an AC generator or dynamo work" / "how is alternating current produced" / "coil rotating in a magnetic field gives AC" / "epsilon = NBA omega sin omega t" / "peak EMF of a generator" / "eps0 = NBA omega" / "why is the EMF maximum when the coil is parallel to the field or the flux is zero" / "phase difference between flux and EMF in a generator" / "why does a generator give AC not DC" / "slip rings vs split ring or commutator" / "how a bicycle dynamo works" / "why does faster rotation give more voltage AND higher frequency" → ac_generator
  (DISAMBIGUATION faraday_law_induction vs motional_emf vs eddy_currents vs inductance vs ac_generator: ALL FOUR are Lenz's-law-flavoured ε = −dΦ/dt physics, but the STUDENT-FACING CAUSE and GEOMETRY differ. If a MAGNET moves and a STATIONARY COIL sees its flux change (push-in/pull-out, needle deflection, Lenz's-law pole-repulsion) → faraday_law_induction. If a ROD/CONDUCTOR itself slides along rails in a field B and the question is about ε = Bvl, the qv×B force on the rod's own charges, which END is positive, or the retarding-force/energy argument for a moving rod → motional_emf. If the conductor is a BULK/SOLID block (a plate, a pan, a transformer core — NOT a wire loop or a rod-on-rails) and the question is about induced currents forming INSIDE the solid metal itself, why cutting slots or laminating reduces the effect, or induction heating → eddy_currents. If a COIL'S OWN CHANGING CURRENT is the cause — the current ramping instead of jumping, the back-EMF ε_L = −L·dI/dt, why the back-EMF is zero at steady current, the switch-off spark, energy ½LI² stored in a coil, OR a changing current in one coil inducing a voltage in a SECOND disconnected coil (ε₂ = −M·dI₁/dt, transformer/wireless-charging with no wire between them) → inductance. "Same physics, different picture": faraday_law_induction is the moving-magnet-and-coil picture; motional_emf is the rod-and-rails picture; eddy_currents is the solid-block picture; inductance is the coil-reacting-to-ITS-OWN-or-a-NEIGHBOUR'S-changing-current picture. Route ε = Bvl / RHR-for-polarity / open-vs-closed-circuit rod questions to motional_emf; slots/lamination/induction-heating to eddy_currents; back-EMF / L-is-geometry / ½LI² / switch-off-spark / mutual-M-across-a-gap questions to inductance specifically. If a COIL is ROTATING in a field and the question is about producing ALTERNATING current, the sinusoidal EMF eps = NBA·omega·sin(omega t), why the EMF is maximum when the flux is zero (the 90-degree phase lag), the peak eps0 = NBA·omega, why faster rotation raises both peak and frequency, or slip-rings-vs-commutator → ac_generator (the moving-magnet/coil is faraday_law_induction; the ROTATING coil that GENERATES AC is ac_generator — the last Ch.6 concept, now built).)

CRITICAL DISAMBIGUATION (alternating current, Ch.7):
- "AC voltage on a resistor" / "resistor in an AC circuit" / "is current in phase with voltage for a resistor" / "i = v/R for AC" / "why is power never negative for a resistor" / "average current in AC is zero but the resistor still heats up" / "why doesn't an AC ammeter read zero" / "what is rms value" / "root mean square" / "Vrms = Vm over root 2" / "why is the peak voltage higher than the rated voltage" / "is 230 volts the peak or rms" / "square mean root" / "why is average power half the peak power" / "why is the average of sine squared one half" → ac_voltage_resistor
  (DISAMBIGUATION ac_voltage_resistor vs ohms_law vs ac_generator: ohms_law is the STEADY, DC-only V = IR relationship — no time-varying voltage, no rms, no phase; route plain "V=IR" / "resistance" / "why does current reduce after a resistor" questions there, not here. ac_generator is about HOW the sinusoidal EMF is produced (a coil rotating in a field, slip rings, flux-linkage phase lag) — it never mentions a resistor's OWN response, in-phase current, rms, or power; if a coil/rotation/slip-ring/flux-linkage is the subject, route to ac_generator. ac_voltage_resistor is about what happens ONCE that sinusoidal voltage is APPLIED ACROSS a resistor — in-phase current, power never negative, the zero-average paradox, and the rms/DC-equivalent rating. phasors (now built, see below) is where a phase-angle/rotating-vector-diagram question belongs; series_lcr_circuit (now built, see below) is where impedance/resonance/tip-to-tail addition questions belong — never route those to ac_voltage_resistor; ac_power_factor (now built, see below) is where power/power-factor/wattless-current questions belong; lc_oscillations (now built, see below) is where a source-REMOVED free-oscillation question belongs; transformer (now built, see below) is where a turns-ratio/second-winding question belongs; a LAG/reactance/coil question routes to ac_voltage_inductor (now built, see below); a LEAD/capacitive-reactance question routes to ac_voltage_capacitor (now built, see below); if no other Ch.7 concept is advertised in VALID_CONCEPT_IDS for that question, fall through to the nearest advertised sibling per the general unknown-concept fallback, do not invent a routing here.)
- "AC voltage on an inductor" / "inductor in an AC circuit" / "does current lag or lead voltage for a coil" / "why does current lag behind voltage in an inductor" / "v equals L di dt for AC" / "inductive reactance" / "Xl = omega L" / "why does a coil's opposition depend on frequency" / "why does a coil choke high frequency AC harder" / "average power in a pure inductor" / "why is average power zero in a coil if current is flowing" / "where does the energy stored in a coil go" / "im = vm over omega L" / "why does doubling frequency halve the current through a coil" / "why is a coil's opposition not fixed like resistance" → ac_voltage_inductor
  (DISAMBIGUATION ac_voltage_inductor vs ac_voltage_resistor vs inductance vs phasors vs ac_voltage_capacitor: ac_voltage_resistor stays the in-phase, never-negative-power, rms baseline — no lag, no reactance, no coil; if the question names a resistor or heater with no lag/reactance language, route there instead. inductance is the coil's DC-transient/self-inductance story (current RAMPING and never jumping, back-emf epsilon=-L dI/dt, the switch-off spark, U=1/2 L I squared as a ONE-TIME stored value, mutual inductance) — it never involves a continuously alternating source, a phase LAG, or a frequency-dependent reactance Xl=omega L; if the question is about a coil's response to a STEADY current changing once (switch closing/opening) rather than a continuous sinusoidal AC supply, route to inductance instead. phasors (now built, see below) is where this concept's quarter-cycle lag FORMALIZED as a rotating-vector angle belongs — "phasor diagram for an inductor" / "draw the phasor for a coil" routes there, not here; this concept stays the WHY (v = L di/dt sets the current's slope). ac_voltage_capacitor (now built, see below) is the LEADING mirror-image of this concept — never route a "current leads voltage" or "capacitive reactance" question here, route it there instead; if no other Ch.7 concept is advertised in VALID_CONCEPT_IDS for that question, fall through to the nearest advertised sibling per the general unknown-concept fallback, do not invent a routing here.)
- "AC voltage on a capacitor" / "capacitor in an AC circuit" / "does current lag or lead voltage for a capacitor" / "why does current lead voltage in a capacitor" / "i equals C dv dt for AC" / "capacitive reactance" / "Xc = 1 over omega C" / "why does a capacitor's opposition fall with frequency" / "why does a capacitor block DC" / "why does a capacitor pass high frequency AC easily" / "average power in a pure capacitor" / "why is average power zero in a capacitor if current is flowing" / "where does the energy stored in a capacitor go" / "im = omega C vm" / "why does doubling frequency double the current through a capacitor" / "why is a capacitor's opposition not fixed like resistance" → ac_voltage_capacitor
  (DISAMBIGUATION ac_voltage_capacitor vs ac_voltage_resistor vs ac_voltage_inductor vs capacitance vs phasors: ac_voltage_resistor stays the in-phase, never-negative-power, rms baseline — no lead, no reactance, no plates; if the question names a resistor or heater with no lead/reactance language, route there instead. ac_voltage_inductor is the LAGGING mirror-image (current behind voltage, reactance RISING with frequency) — never route a "current lags voltage" or "inductive reactance" question here, route it there instead. capacitance is the capacitor's DC-transient/geometry story (q=Cv, plate area/separation, RC charging, the energy ½Cv² as a ONE-TIME stored value) — it never involves a continuously alternating source, a phase LEAD, or a frequency-dependent reactance Xc=1/(omega C); if the question is about a capacitor's response to a STEADY voltage changing once (charging/discharging) rather than a continuous sinusoidal AC supply, route to capacitance instead. phasors (now built, see below) is where this concept's quarter-cycle lead FORMALIZED as a rotating-vector diagram belongs — "phasor diagram for a capacitor" routes there, not here; if no other Ch.7 concept is advertised in VALID_CONCEPT_IDS for that question, fall through to the nearest advertised sibling per the general unknown-concept fallback, do not invent a routing here.)
- "phasor diagram" / "rotating vector for AC" / "what is a phasor" / "why does a spinning arrow draw a sine wave" / "phasor length vs instantaneous value" / "why does one frozen diagram show the whole phase relationship" / "phase angle on a phasor diagram" / "which phasor leads or lags on a diagram" / "how do you read lead or lag off a phasor diagram" / "counterclockwise rotation convention for phasors" / "theta equals omega t" / "converting phase angle to time delay" / "delta t equals phi over 360 times T" → phasors
  (DISAMBIGUATION phasors vs ac_voltage_resistor vs ac_voltage_inductor vs ac_voltage_capacitor vs series_lcr_circuit: the three ac_voltage_* concepts each derive WHY one element's current leads, lags, or stays in phase (i = v/R, v = L di/dt, i = C dv/dt) — no rotating-vector diagram appears in any of them; if the question is about the MECHANISM for a SINGLE named element with no phasor/diagram language, route to that element's ac_voltage_* concept instead. phasors is about REPRESENTING those three already-settled facts as frozen angles on ONE rotating disc, reading lead/lag off a diagram, and converting angle to time — never re-derive WHY an element lags or leads here, that is a one-clause callback only. series_lcr_circuit (now built, see below) is where phasors get ADDED tip-to-tail and impedance/resonance appear — this concept explicitly withholds phasor addition, impedance, complex numbers, and any reactance numeral or symbol (Xl, Xc); never route an "add the phasors" / "impedance" / "resonance" / "Z = ..." question here, route it to series_lcr_circuit instead.)
- "series LCR circuit" / "impedance of a circuit" / "Z equals root R squared plus X squared" / "why don't AC voltages in series just add up" / "why is one element's voltage bigger than the source" / "phasor addition tip to tail" / "resonance in an LCR circuit" / "why does current peak at one frequency" / "resonant frequency formula" / "f0 equals one over two pi root LC" / "does more resistance change the resonant frequency" / "sharpness of resonance" / "Q factor" / "bandwidth of resonance" / "how does a radio tune to one station" / "why can't impedances just add like resistances" → series_lcr_circuit
  (DISAMBIGUATION series_lcr_circuit vs phasors vs ac_voltage_resistor vs ac_voltage_inductor vs ac_voltage_capacitor vs ac_power_factor: phasors stops at REPRESENTING one element's settled angle on a rotating disc — no addition, no impedance, no reactance numeral ever renders there; if the question has no addition/impedance/resonance language and is really about reading a SINGLE frozen phasor diagram, route to phasors instead. The three ac_voltage_* concepts each derive a SINGLE element's own behaviour in isolation (i = v/R, v = L di/dt, i = C dv/dt) — if the question names only ONE element with no series-combination/impedance/resonance language, route to that element's own concept instead. series_lcr_circuit is about what happens once R, L and C sit in the SAME series loop: tip-to-tail phasor addition of the three element voltages, impedance Z = sqrt(R^2+X^2), phase angle tan(phi) = X/R, and the resonance condition X_L = X_C where the current peaks — route "impedance", "resonance", "Z = ...", "does adding a coil and capacitor together always reduce current", "why does the current spike at one frequency", "Q factor" and "bandwidth" questions here. ac_power_factor (now built, see below) is where power, cos(phi), and wattless current belong — this concept's power HUD slot stays deliberately empty; never route a "power factor" / "average power in an LCR circuit" / "wattless current" / "apparent power" / "power triangle" / "kVA" question here, route it to ac_power_factor instead.)
- "power factor" / "cos phi" / "average power in an AC circuit" / "why isn't power just V times I" / "apparent power vs real power" / "what is a volt-ampere" / "wattless current" / "why does more current sometimes mean less power" / "where does the power actually get dissipated in an LCR circuit" / "power triangle" / "P Q S relations" / "reactive power" / "VAR unit" / "kVA vs kW rating" / "why is my equipment rated in kVA not kW" → ac_power_factor
  (DISAMBIGUATION ac_power_factor vs series_lcr_circuit vs lc_oscillations: series_lcr_circuit stops at impedance/phase-angle/resonance — no power quantity, no cos(phi), no wattless current ever renders there; its power HUD slot stays deliberately empty on purpose. If the question is purely about Z, phi, or resonance with no power/wattage/power-factor language, route to series_lcr_circuit instead. ac_power_factor takes those settled facts as ONE-CLAUSE CALLBACKS (never re-derived) and teaches what they mean for POWER: instantaneous power p=vi as a double-frequency wave, average power P=V_rms*I_rms*cos(phi), the power factor cos(phi)=R/Z, the wattless quadrature current I_rms*sin(phi), where real power physically lands (P=I_rms^2*R, all in the resistor), and the power triangle P/Q/S. lc_oscillations (now built, see below) is the UNDRIVEN circuit — the source REMOVED, free oscillation at a natural frequency, the q(t)/i(t) SHM analogy, and damped decay; if the question has no active AC source / no "power factor" / "wattless" language and is instead about a charged capacitor and inductor left to oscillate on their own with no driving voltage, do NOT route to ac_power_factor — route it to lc_oscillations instead.)
- "LC oscillations" / "LC circuit with no source" / "charged capacitor connected to an inductor with the battery removed" / "why doesn't the current stop when the capacitor is empty" / "why is the current maximum when the charge is zero" / "does an LC circuit oscillate forever" / "natural frequency of an LC circuit" / "omega0 equals one over root LC" / "energy exchange between capacitor and inductor" / "why doesn't an ideal LC circuit lose energy" / "mass spring analogy for LC circuit" / "electrical equivalent of simple harmonic motion" / "why does inductance act like mass" / "why does a real LC circuit's oscillation die out" / "free oscillation with the source removed" → lc_oscillations
  (DISAMBIGUATION lc_oscillations vs series_lcr_circuit vs ac_power_factor vs ac_voltage_inductor vs ac_voltage_capacitor: the single decisive test is whether an AC SOURCE is still actively driving the circuit. series_lcr_circuit and ac_power_factor both keep the sinusoidal source connected and sweep its frequency — if the question mentions a source frequency, phase angle relative to a driving voltage, impedance, resonance, or power factor with the source still in the picture, route to series_lcr_circuit (impedance/resonance) or ac_power_factor (power quantities), never here. lc_oscillations is about the OPPOSITE setup: the capacitor is charged once, the source is then PHYSICALLY REMOVED (a switch throws, the battery leaves the circuit entirely), and the circuit is left to oscillate on its own at its own natural frequency — if the question has no active/continuing source and instead describes a charged capacitor and inductor left alone, or asks why the oscillation eventually dies out with no source to blame, route here. ac_voltage_inductor and ac_voltage_capacitor describe a SINGLE element's own response to a continuous external AC source — never route a two-element, source-removed, free-oscillation question to either of them. If the question is about a charged capacitor discharging through a plain resistor only (no inductor, no oscillation), that is an RC transient, not this concept — fall through to the nearest advertised sibling per the general unknown-concept fallback. If the question is instead about TWO coils sharing a core, a turns ratio, or voltage step-up/step-down, route to transformer, never here — this concept never has a second winding.)
- "transformer" / "how does a transformer work" / "step up or step down transformer" / "turns ratio" / "Vs over Vp equals Ns over Np" / "how do you find the secondary voltage from the turns ratio" / "why does a transformer need AC and not DC" / "why does the secondary read zero on a battery" / "why did the needle jump once when I connected a battery to a transformer" / "does a transformer amplify power" / "if the voltage doubles why doesn't the power double" / "why does the primary current rise when I add a load to the secondary" / "why are transformer cores laminated" / "eddy currents in a transformer core" / "transformer efficiency" / "why does a transformer hum" / "why is electricity transmitted at high voltage" / "why do power lines lose less energy at high voltage" → transformer
  (DISAMBIGUATION transformer vs inductance vs eddy_currents vs lc_oscillations vs ac_power_factor vs electrical_power_in_resistor: inductance is where "mutual inductance" / "M = k root L1 L2" / "coefficient of coupling" / a quantitative henries-valued coupling belongs — this concept NEVER quantifies M in henries, it teaches the turns-ratio/voltage/power consequence instead; if the question asks to compute or name a mutual inductance value, route to inductance instead. eddy_currents is where a bare "why are transformer cores laminated" question with NO turns-ratio/voltage/power language belongs if it's asked as a general induction-damping question about a solid conductor (a swinging plate, an induction cooktop) — but if the question is clearly ABOUT a transformer specifically (turns, primary/secondary, step up/down, DC failure, efficiency, transmission), route here instead, since this concept owns the full transformer story including its own lamination beat (STATE_9). lc_oscillations is the single-loop UNDRIVEN free-oscillation story — it has only ONE coil and ONE capacitor, never two coupled windings; never route a two-winding, turns-ratio, or voltage-step question there. ac_power_factor seeded the grid-transmission motivation narration-only — it is where power/power-factor/wattless-current questions with NO turns-ratio or second-winding language belong; if a question moves from "why is transmission at high voltage" into "how does STEPPING UP the voltage happen" (turns, windings, ratio), route here instead. electrical_power_in_resistor (Ch.3) is the general I^2R wire-heating law used inside this concept's own transmission-loss arithmetic (STATE_7) — a bare "why do wires heat up" question with no transformer/transmission-line language belongs there, not here.)

CRITICAL DISAMBIGUATION (current electricity):
- "why does current reduce after resistor?" → ohms_law
- "does current decrease as it flows through a resistor?" → ohms_law
- "is current the same before and after a resistor?" → ohms_law
- "what is V=IR?" → ohms_law
- "how does voltage relate to current?" → ohms_law
- "which materials obey ohms law" / "is a metal wire always ohmic" / "what makes something non ohmic" / "does ohms law ever completely fail" / "why does a bulbs resistance change when it heats up" / "why isnt R constant for a light bulb" / "why does the filament curve bend upward" / "whats the difference between R equals V over I and dV over dI" / "static resistance vs dynamic resistance" / "why is slope R and not 1 over R on the V-I graph" / "why does the line have to pass through zero" → ohms_law (non-ohmic / slope aspects, NOT electric_power_heating — this is about the SHAPE of the V-I relationship, not the heat produced)
- "why does a wire get hot when current flows?" → electric_power_heating (NOT ohms_law)
- "why does the bulb glow?" → electric_power_heating
- "joule heating" / "P = I²R" / "heating effect of current" → electric_power_heating
- "why does current flow instantly if electrons are so slow" / "electrons dont actually travel down the wire" / "what is drift velocity" / "v d equals e E tau over m" / "signal speed vs electron speed" / "thermal speed vs drift speed" / "why does area affect current but not drift speed" / "what is relaxation time tau" / "why does a thicker wire carry more current" / "i equals n e A v d" → drift_velocity (NOT electric_power_heating — this is about the MECHANISM of current, not heating)
- "why does a longer wire have more resistance" / "does thickness affect resistance" / "R equals rho L over A" / "whats the difference between R and rho" / "why does resistance become four times not two times when stretched" / "why does nichrome resist more than copper" / "whats rho made of" / "rho equals m over n e squared tau" / "why does a metals resistance rise when heated" / "why is manganin used for standard resistors" / "does every material get more resistive when heated" / "alpha meaning units resistivity" → resistivity (NOT ohms_law — this is about WHY R takes the value it does, geometry × material, not the V-I relationship)
- "resistors in series" / "resistors in parallel" / "how do resistors combine" / "R equals R1 plus R2" / "1 over R eq equals 1 over R1 plus 1 over R2" / "why does adding a resistor in parallel decrease the resistance" / "why is equivalent resistance smaller than the smallest resistor" / "does current split equally in parallel" / "how much current goes through each branch" / "why do both branches get the same voltage" / "why is current the same everywhere in series" / "why does voltage divide in series but not in parallel" / "why are household appliances wired in parallel" / "why does a whole string of old-style decorative lights go dark when one bulb dies" / "product over sum shortcut for two resistors" / "n equal resistors in series vs parallel" → combination_of_resistors (NOT ohms_law/resistivity — this is about how MULTIPLE resistors COMBINE into one equivalent resistance, not the V-I relationship of a single resistor or why a single resistor's R takes the value it does)
- "what is emf" / "define emf" / "emf definition" / "why is emf measured in volts" / "epsilon equals W over q" / "is emf a force" / "electromotive force isnt actually a force" / "why is it called electromotive force if its not a force" / "is emf the same as potential difference" / "whats the difference between emf and terminal voltage" / "why does a 1.5V cell and a 12V battery have different emf" / "what decides a cells emf" / "does the circuit affect emf" / "how is emf actually measured" / "why must no current flow to measure emf" / "does a voltmeter reading equal emf" / "open circuit voltage" → emf_definition (NOT ohms_law/internal_resistance — this is the DEFINITION ε = W/q, the per-charge-not-a-force distinction, and the ideal open-circuit measurement condition; questions about V = ε − Ir, the droop under load, or a cell's OWN internal resistance route to internal_resistance instead)
- "why does terminal voltage drop when current flows" / "V equals epsilon minus i r" / "the cell says 1.5V but the meter reads less, where did the volts go" / "what is internal resistance of a cell" / "is there an actual resistor inside a battery" / "why is short circuit current not infinite" / "i max equals epsilon over r" / "ohms law says i equals V over R so zero R should mean infinite current, why doesnt it" / "why do shorted cells get hot" / "why do car headlights dim when the starter cranks" / "how do you measure internal resistance with a voltmeter and ammeter" / "why do you need two readings to find r" / "why does a battery read full voltage on a meter but die under load" / "why does voltage go above the emf while charging" / "V equals epsilon plus i r while charging" / "can terminal voltage ever exceed emf" → internal_resistance (NOT emf_definition/ohms_law — this is the REAL cell with r > 0: the droop under load, the finite short-circuit ceiling i_max = ε/r, the two-reading measurement of r, and the charging sign-reversal V = ε + ir; emf_definition stays the IDEAL r=0 cell and its definition-only measurement condition)
- "why are there three power formulas" / "is P equals VI the main one and I squared R and V squared over R just substitutes" / "does higher resistance mean more power or less, I squared R says up but V squared over R says down" / "power in series vs parallel" / "why does a bulb dim in series but blaze in parallel" / "why do old string lights all dim when one bulb has more resistance" / "does a 6 watt bulb always draw 6 watts" / "what does the wattage on a bulb actually promise" / "is a watt an amount of energy or a speed of using it" / "energy equals power times time" / "why do household bulbs stay full brightness when one burns out" → electrical_power_in_resistor (NOT combination_of_resistors — this is P=VI=I²R=V²/R as one quantity, energy E=P·t accumulating, and the series-vs-parallel brightness-order FLIP on two RATED bulbs; combination_of_resistors stays about how resistances themselves combine, not the power dissipated. General "why does a wire get hot" / "why does the bulb glow" / "joule heating" / "heating effect of current" phrasing with no series/parallel or rated-bulb framing still routes to electric_power_heating, per the disambiguation above.)
- "kirchhoffs junction rule" / "kirchhoffs current law" / "KCL" / "sigma i in equals sigma i out" / "why doesnt current get used up at a junction" / "shouldnt some current be lost at the junction" / "why is inflow same as outflow isnt some of it used up" / "current gets consumed by resistors right so output should be less" / "why doesnt it split half half at the fork" / "shouldnt both branches always get equal current" / "why is one branch getting more current than the other" / "isnt a junction always fifty fifty by definition" / "how can unequal resistors still not give an equal split" / "which current counts as positive in kirchhoffs junction law" / "how do i know if a branch current is entering or leaving the node" / "why is sigma i equal to zero if directions are all mixed up" / "3A and 2A enter a junction 4A leaves find the remaining wire" → kirchhoff_junction_rule_KCL (NOT combination_of_resistors — this is charge CONSERVATION at a node, Σi_in=Σi_out for any number of wires, and the unequal-split-by-conductance misconception; combination_of_resistors stays about how two resistors' VALUES combine into R_eq, not the junction-current conservation identity itself. Does NOT cover the loop rule/KVL — that is the separate kirchhoff_loop_rule_KVL concept.)
- "kirchhoffs loop rule" / "kirchhoffs voltage law" / "KVL" / "sigma V equals zero" / "why does the sum of voltages around a loop equal zero" / "epsilon equals I R1 plus I R2" / "why doesnt some voltage get left over after crossing both resistors" / "shouldnt there be leftover voltage after the drops" / "why cant i just add all three voltages as positive" / "i added 6 plus 4 plus 2 and got 12 is that wrong" / "why is the resistor drop negative in the loop equation" / "should i add or subtract voltages going around a loop" / "why does the sign flip for a resistor but not the cell" / "which end is high potential and which is low" / "does changing one resistor change the total voltage drop" / "why do the individual drops change but the sum stays the same" / "why does the loop rule work for any number of resistors" → kirchhoff_loop_rule_KVL (NOT kirchhoff_junction_rule_KCL — this is energy CONSERVATION around a closed loop, ΣV=0 with the rise/drop sign convention, and the no-leftover-voltage / add-all-positive misconceptions; kirchhoff_junction_rule_KCL stays about current conservation at a single node, not potential conservation around a loop. Does NOT cover internal resistance (its own shipped diamond internal_resistance) or a second/opposing EMF in the same loop (deferred).)
- "wheatstone bridge" / "four arm bridge" / "P over Q equals R over S" / "balance condition of a bridge" / "why does the galvanometer read zero at balance" / "does the current stop everywhere when a bridge is balanced" / "does a bridge need all four resistors equal to balance" / "how do you find an unknown resistance with a bridge" / "S equals R times Q over P" / "why doesnt the battery voltage matter for the bridge answer" / "do i need to measure a current or voltage to find the unknown resistor" / "why is a null method more accurate than reading a meter" / "galvanometer shows zero but is current still flowing in the arms" → wheatstone_bridge (NOT kirchhoff_junction_rule_KCL/kirchhoff_loop_rule_KVL — this is the four-arm RATIO-balance null method P/Q=R/S, a zero-current DETECTION at one branch while the other four keep flowing, and the battery-independent unknown-resistance formula S=R*(Q/P); does NOT cover the meter bridge (a 1 m wire + jockey realization) or the potentiometer (a different null method for EMF comparison, downstream sibling).)
- "potentiometer" / "potentiometer wire" / "jockey" / "balance point" / "balance length" / "E equals k times l" / "why does the galvanometer read zero on a potentiometer" / "does the jockey draw current from the cell" / "why does a potentiometer measure the true emf" / "why is a potentiometer more accurate than a voltmeter" / "why does a voltmeter read less than the actual emf" / "why do you need a driver cell / second battery on a potentiometer" / "what happens if the driver voltage is smaller than the cells emf" / "why does the balance point disappear when the driver voltage is turned down" / "potential gradient" / "k equals v over l" → potentiometer (NOT wheatstone_bridge — a potentiometer is a DIFFERENT null method, on a single uniform wire with a sliding jockey, measuring a cell's true EMF via E=k*l; wheatstone_bridge is a four-arm RATIO-balance method for an unknown resistance, P/Q=R/S; both are zero-current null methods but measure different things on different apparatus. Does NOT cover comparing two EMFs E1/E2=l1/l2, measuring internal resistance by potentiometer, or the meter bridge — all downstream/sibling apparatus.)
- "meter bridge" / "metre bridge" / "slide wire bridge" / "wheatstone bridge on a wire" / "jockey on a meter bridge" / "balance length on a meter bridge" / "X equals R times 100 minus l1 over l1" / "why does the wire act like a resistor" / "why doesnt the wires actual resistance per cm matter" / "why should the balance point be near the middle" / "why should R be close to the unknown resistance" / "end errors in a meter bridge" / "why do you swap R and the unknown and repeat" / "is a meter bridge the same as a potentiometer" → meter_bridge (NOT wheatstone_bridge — a meter bridge is the SAME P/Q=R/S ratio-balance idea REALIZED on a single uniform one-metre wire with a sliding jockey, X=R*(100-l1)/l1, not four separate resistor arms; NOT potentiometer — a meter bridge balances a RESISTANCE ratio via a sliding jockey, a potentiometer balances a POTENTIAL via the same kind of sliding jockey on a different wire — same mechanism, different quantity measured. Does NOT cover the four-arm bridge's general P/Q=R/S identity (wheatstone_bridge, the direct prerequisite) or EMF measurement (potentiometer).)
- "cells in series" / "cells in parallel" / "combining cells" / "grouping of cells" / "why doesnt the voltage go up when I add a second battery side by side" / "two batteries in parallel still show only one batterys voltage, why" / "shouldnt more cells always mean more volts" / "I connected two cells side by side and the reading didnt change" / "why does series double the voltage but parallel doesnt" / "I added an extra cell in series and my motor got weaker" / "more batteries but the bulb is not any brighter, why" / "isnt more cells always more current" / "adding a cell made things worse, that doesnt make sense" / "one of my cells is in backwards, do I just ignore it" / "if two cells cancel out does their resistance also disappear" / "why is the current zero but the cells are still fresh" / "how can two working batteries make a dead circuit" / "epsilon eq equals epsilon 1 plus epsilon 2" / "r eq equals r over m" / "when should I use series vs parallel cells" / "why does a flashlight use series cells but a drill battery pack use parallel strings" → combination_of_cells (NOT internal_resistance/emf_definition — this is MULTIPLE real cells JOINED: series signed-emf-sum + always-adding internal resistances (even a reversed, cancelled cell still adds its own r), identical-cell parallel voltage-unchanged + current-sharing via r/m, and the series-vs-parallel load-matching decision rule; internal_resistance/emf_definition stay about a SINGLE cell's own ε and r, never a group of cells. Does NOT cover unequal-emf parallel cells or maximum-power-transfer grouping optimization — deferred/downstream.)

CRITICAL DISAMBIGUATION (vectors, Ch.5):
- "triangle law" / "parallelogram law" / "resultant of two vectors" → resultant_formula
- "direction of resultant" / "angle of resultant vector" → direction_of_resultant
- "resolve a vector" / "x and y components" → vector_resolution
- "dot product" / "scalar product" → dot_product
- "unit vector" → unit_vector
- "i cap j cap k cap" / "vector in ijk form" → unit_vector_form

CRITICAL DISAMBIGUATION (kinematics, Ch.2 + Ch.6-7):
- "distance vs displacement" / "displacement vs distance" / "why is my displacement zero after a round trip" / "is displacement always positive" / "does the path matter for displacement" / "delta x equals x final minus x initial" → displacement_vs_distance (the NEW Ch.2 field_3d atomic — supersedes the legacy distance_displacement_basics id)
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
  (gauss_law_sphere is APPLYING Gauss's law + symmetry to SOLVE for the field of a charged SHELL: E=0 inside (r<R), E=kq/r² outside (r≥R). Route here anything asking for the actual field E(r) of a shell/sphere, the inside-is-zero / shielding result, or the outside-looks-like-a-point-charge result. The CUT-LINE: gauss_law_sphere = APPLYING Gauss to get E(r) for a shell; gauss_law = the STATEMENT Φ=q/ε₀ alone; electric_flux = the flux definition Φ=E·A. If the student wants a NUMBER or formula for the field inside/outside a HOLLOW sphere/shell, it is gauss_law_sphere, never gauss_law. If they specify a SOLID / uniformly charged ball / volume charge, route to gauss_law_solid_sphere instead.)
- "field inside a solid sphere" / "uniformly charged solid sphere" / "uniformly charged ball" / "insulating charged sphere" / "E inside a charged ball" / "volume charge density sphere" / "field inside a sphere of charge that grows with r" / "E proportional to r inside" → gauss_law_solid_sphere
  (gauss_law_solid_sphere is the SOLID-ball case: E grows LINEARLY inside (E=kq·r/R³, zero at the centre), E=kq/r² outside, CONTINUOUS at the surface with the peak AT r=R. The CUT-LINE vs gauss_law_sphere: a SOLID / uniformly-charged-volume / insulating ball → gauss_law_solid_sphere (nonzero, rising inside); a HOLLOW shell / conductor / surface charge → gauss_law_sphere (zero inside, jumps at R).)
- "field of an infinite line charge" / "field near a charged wire" / "E of a long charged wire" / "E = λ/2πε₀r" / "E = lambda over 2 pi epsilon naught r" / "why 1/r not 1/r²" / "why does the wire field fall off slower than a point charge" / "Gaussian cylinder for a wire" / "linear charge density field" / "field of a charged transmission line" → gauss_law_line
  (gauss_law_line is the INFINITE LINE / WIRE case: a coaxial Gaussian CYLINDER (end caps carry zero flux) gives E = λ/(2πε₀r), radial and ⊥ to the line, FALLING OFF AS 1/r — NOT 1/r² like a point charge — because the cylinder area 2πrL grows LINEARLY with r. The CUT-LINE: a straight LINE / WIRE / rod / 1-D charge → gauss_law_line (1/r); a SPHERE / shell / ball → gauss_law_sphere or gauss_law_solid_sphere (1/r²); a POINT charge → electric_field_point_charge. Anything asking for the field, formula, or 1/r-vs-1/r² falloff of a long/infinite charged WIRE belongs here, NOT to the bare statement gauss_law or the flux definition electric_flux.)
- "field of an infinite charged sheet" / "field of a charged plane" / "E of an infinite plane sheet" / "E = σ/2ε₀" / "E = sigma over 2 epsilon naught" / "why doesn't the sheet field fall off" / "why is the sheet field constant" / "uniform field from a sheet" / "Gaussian pillbox" / "surface charge density field" / "field of a charged photocopier drum/plate" → gauss_law_sheet
  (gauss_law_sheet is the INFINITE PLANE SHEET case: a Gaussian PILLBOX (the curved WALL carries zero flux, only the two flat CAPS count) gives E = σ/(2ε₀), ⊥ to the sheet, away on BOTH sides, and CONSTANT — it does NOT fall off with distance at all, unlike the line (1/r) or the point (1/r²), because the pillbox encloses the same σA patch at any distance. The CUT-LINE: a flat PLANE / SHEET / large charged plate → gauss_law_sheet (constant field, σ/2ε₀); a LINE / WIRE → gauss_law_line (1/r); a SPHERE / shell / ball → gauss_law_sphere / gauss_law_solid_sphere (1/r²). IMPORTANT — distinguish σ/2ε₀ (an ISOLATED sheet → gauss_law_sheet) from σ/ε₀ (the field just outside a CONDUCTOR surface, or between TWO parallel plates — a DIFFERENT concept, NOT gauss_law_sheet). Anything asking why a sheet's field is constant / doesn't weaken, or for E = σ/2ε₀ of a single isolated sheet, belongs here.)
- "force on a charge in a field" / "F = qE" / "force on a charge between plates" / "why does a charge curve in a field" / "charge deflected by an electric field" / "a = qE/m" → force_on_charge_in_field
- "dipole in a uniform field" / "torque on a dipole" / "τ = pE sinθ" / "p cross E" / "why does a dipole rotate in a field" / "dipole potential energy" / "U = −pE cosθ" / "stable equilibrium of a dipole" → electric_dipole_in_field

CRITICAL DISAMBIGUATION (electrostatic potential, Ch.2):
- "what is electric potential" / "what does voltage at a point mean" / "meaning of potential" / "V = W/q" / "work per unit charge" / "potential at a point" / "is potential a vector or a scalar" / "does potential have a direction" / "potential vs potential energy" / "why divide work by charge" / "V(∞)=0 / reference at infinity" / "potential difference between two points" / "ΔV = V_B − V_A" → electric_potential_meaning
  (electric_potential_meaning is the MEANING of V: V = W/q, a SCALAR property of the place, path-independent, with V(∞)=0 and ΔV = V_B − V_A. It STOPS SHORT of the point-charge formula V = kQ/r — if the student asks for the actual VALUE/FORMULA of V at distance r from a point charge, that is the separate sibling electric_potential_point_charge, NOT this concept. Distinct from electric_field_point_charge (the VECTOR E = kQ/r²) — V is the scalar, E is the arrow. Distinct from potential ENERGY of a system of charges. The GEOMETRY of equipotential surfaces — what they are, why E is ⊥ to them, zero work along them, crowding↔field-strength — is the dedicated sibling equipotential_surfaces, NOT this concept. Anything asking what potential/voltage MEANS, why it is a scalar, V = W/q, V-vs-U, or the infinity reference belongs here.)
- "V = kQ/r" / "potential due to a point charge" / "potential at distance r from a point charge" / "how big is the potential a distance r away" / "why does potential fall off as 1/r" / "why 1/r not 1/r²" / "why isn't potential 1/r squared like the field" / "if I halve the distance does the potential quadruple / double" / "halve r and V doubles" / "is the potential of a negative charge negative" → electric_potential_point_charge
  (electric_potential_point_charge is the point-charge FORMULA/VALUE: V = kQ/r, falling off as 1/r — ONE power of r, SLOWER than the field's 1/r². The CUT-LINE vs electric_potential_meaning: if the student asks what potential/voltage MEANS, V = W/q, work per unit charge, or whether V is a scalar → electric_potential_meaning (the opener); if they ask for the VALUE/FORMULA of V at distance r from a point charge, V = kQ/r, the 1/r falloff, the halve-r-doubles result, or why it is gentler than the field's 1/r² → electric_potential_point_charge. Distinct from electric_field_point_charge (the VECTOR E = kQ/r², which falls off as 1/r²) — V = kQ/r is the scalar with the GENTLER 1/r falloff. Halving r DOUBLES V here (the ×4 quadrupling is the field's instinct, the wrong answer). The GEOMETRY of equipotential surfaces (concentric spheres, E ⟂ surface, zero work along) is equipotential_surfaces, NOT this concept. STOPS SHORT of multi-charge superposition of potentials, E = −dV/dr, the dipole potential, and capacitance.)
- "what is an equipotential surface" / "surfaces of constant potential" / "equipotential spheres" / "equipotential lines / shells" / "why is the field perpendicular to the equipotential" / "why is E ⊥ to the equipotential surface" / "do you do work moving a charge along an equipotential" / "is work zero along an equipotential" / "why do equipotentials get closer together" / "why do equipotential surfaces crowd near the charge" / "equipotential surfaces of a point charge" → equipotential_surfaces
  (equipotential_surfaces is the GEOMETRY of constant-V surfaces: the locus of all points at one common V, concentric SPHERES for a point charge (r = kQ/V), the field everywhere PERPENDICULAR to them pointing high V → low V, NO work moving ALONG one (W = F·d·cos90° = 0) but W = qΔV moving BETWEEN them, and equal-V-step surfaces CROWDING where the field is strong (r ~ 1/V). The CUT-LINE vs the three sibling prerequisites: what V MEANS (V = W/q, work per unit charge, is V a scalar) → electric_potential_meaning; the VALUE/FORMULA V = kQ/r and its 1/r falloff → electric_potential_point_charge; the VECTOR field E = kQ/r² → electric_field_point_charge. If the student asks about the SHAPE of constant-V surfaces, why the field crosses them at 90°, whether sliding a charge along one does work, or what the spacing of the surfaces tells you about field strength → equipotential_surfaces. It STOPS SHORT of the value V = kQ/r itself, the equipotentials of a DIPOLE or a UNIFORM field, and conductors / capacitance.)
- "potential due to a dipole" / "electric potential of a dipole" / "V = kp cos theta / r squared" / "V = kp cosθ/r²" / "is the potential zero on the dipole's equator" / "why is dipole potential zero on the perpendicular bisector" / "why is V zero on the equatorial plane of a dipole" / "does dipole potential fall as 1/r or 1/r squared" / "why does a dipole's potential fall off faster than a point charge" / "is potential a vector or scalar" → electric_potential_dipole
  (electric_potential_dipole is the dipole's scalar POTENTIAL: V = kp cosθ/r² at a far point, the SCALAR sum of the two charge potentials (V = kq/r₊ − kq/r₋). Headlines: the SIGN follows cos θ (POSITION — positive on the +q side, negative on the −q side, NOT decided by which charge "wins"); V = 0 across the WHOLE equatorial plane (θ=90°), not just the midpoint, because every equatorial point is equidistant from ±q; V = 0 there does NOT mean E = 0 (E = −grad V, the slope of V, is alive across the plane); and a dipole's V falls as 1/r², one power STEEPER than a point charge's 1/r. The CUT-LINE: the SINGLE point-charge value V = kQ/r (the gentler 1/r) → electric_potential_point_charge; the dipole's vector FIELD and its TORQUE in a uniform field (τ = pE sinθ, the arrow not the scalar) → electric_field_dipole / electric_dipole_in_field; the dipole's scalar POTENTIAL V = kp cosθ/r² → electric_potential_dipole (THIS one). If the student asks for the potential/voltage of a dipole, whether V is zero on its equator/perpendicular bisector, or how fast a dipole's potential falls off → here. It STOPS SHORT of capacitance and of the dipole's field magnitude/direction.)
- "potential due to a system of charges" / "net potential of several charges" / "do potentials add as vectors or scalars" / "do I add potentials or fields" / "potential at a point from multiple charges" / "total voltage from many charges" / "how do I combine the potentials of several charges" / "does the far charge still count in the potential" / "why do an equal plus and minus charge cancel the potential" → electric_potential_system_of_charges
  (electric_potential_system_of_charges is the SCALAR-SUPERPOSITION diamond: the total potential at a point is V = Σ k qᵢ/rᵢ, the algebraic SUM of each charge's own signed potential k qᵢ/rᵢ. Headlines: V is a SCALAR — add signed NUMBERS directly, never as vectors/components/angles; EVERY charge contributes a nonzero k q/r term (distance shrinks a term but never zeroes a far charge out); an equal +q and −q equidistant from the point cancel EXACTLY to zero (signs and distances decide the total, not the count of charges); and the aha — the FIELD at the same point needs vector addition by components, while the potential is one easy scalar sum. The CUT-LINE: a SINGLE point charge's value V = kQ/r → electric_potential_point_charge; EXACTLY TWO charges forming a dipole, V = kp cosθ/r², the equatorial zero and the 1/r² falloff → electric_potential_dipole; the meaning of V, V = W/q → electric_potential_meaning; the force between two charges → coulombs_law; a CONTINUOUS smear of charge → charge_distribution. If the student asks how to combine the potentials of THREE OR MORE discrete charges, whether potentials add as scalars or vectors, whether a far charge still counts, or why an equal +/− pair cancels the potential → here. It STOPS SHORT of continuous distributions, the system's vector FIELD, potential energy of a system, and capacitance.)
- "potential energy of a system of charges" / "energy of a configuration of charges" / "work done to assemble charges" / "work to bring charges together from infinity" / "energy stored in a group of charges" / "U = kq1q2/r" / "interaction energy of charges" / "how many pairs of charges" / "is the energy positive or negative for like/unlike charges" / "lattice energy" / "does the order of assembling charges matter" → potential_energy_system_of_charges
  (potential_energy_system_of_charges is the ENERGY companion to electric_potential_system_of_charges: the potential ENERGY of a configuration is U = Σ k qᵢqⱼ/rᵢⱼ over every UNIQUE PAIR — the total work to assemble the charges from infinity. Headlines: energy belongs to PAIRS, not single charges (one term per pair, summed over all N(N−1)/2 pairs); each pair term is SIGNED — a like pair (qq>0) STORES +U (work done against repulsion), an unlike pair (qq<0) RELEASES −U (the field does the work); adding a charge adds a new term with EVERY charge already present (N−1 new terms, not just the nearest); and U is PATH/ORDER-INDEPENDENT, a state function. The CUT-LINE — the SCALAR POTENTIAL V (a value AT a point, summed PER CHARGE as Σ k qᵢ/rᵢ) → electric_potential_system_of_charges; the meaning V = W/q → electric_potential_meaning; the FORCE between two charges → coulombs_law; the energy stored in a CAPACITOR (½CV²) → capacitor concepts. The litmus: V is one number at a chosen POINT (per-charge sum); U is one number for the whole SYSTEM (per-pair sum). If the student asks for the energy to assemble/bring-together charges, the energy of a charge configuration, whether that energy is positive or negative, how many pair terms there are, or whether assembly order matters → here. It STOPS SHORT of the energy of a charge in an external field, continuous distributions, capacitor energy ½CV², and dipole-in-field energy.)
- "potential energy of a charge in a field" / "energy of a dipole in a field" / "U = qV" / "work to place a charge in a field" / "energy of a charge at a point of potential V" / "why is dipole energy lowest when aligned" / "U = -p.E" / "potential energy in an external field" / "energy of a charge in an external potential" / "electron accelerated through a voltage energy" → potential_energy_in_external_field
  (potential_energy_in_external_field is the EXTERNAL-FIELD energy diamond of §2.8: U = qV for a single charge sitting at a point where a GIVEN external potential V is held by sources somewhere else (the charge SAMPLES the field, it does NOT create the V), U = q₁V₁+q₂V₂ for a system of charges in the SAME external field, and U = −p·E = −pE·cosθ for a dipole (the two qV terms collapsed into one formula). Headlines: U carries the SIGN of q·V — a like sign stores +U (a hill), an opposite sign gives −U (a well); the dipole energy is a MINIMUM at θ=0° (aligned, stable) and a MAXIMUM at θ=180° (anti-aligned, unstable); and the energy extrema (0°/180°) are NOT the torque peak (90°). The CUT-LINE — the MUTUAL energy kq₁q₂/r BETWEEN charges (the work to assemble them) → potential_energy_system_of_charges (these LOOK alike but are DIFFERENT quantities; you do NOT add the mutual term into the external-field U); the meaning V = W/q → electric_potential_meaning; a single charge's potential V = kQ/r → electric_potential_point_charge; the torque DYNAMICS τ = p×E and oscillation → electric_dipole_in_field; capacitor energy ½CV² → capacitor concepts. The litmus: external-field PE uses a GIVEN external V/E and is U=qV or U=−p·E; mutual PE is the charges' energy with EACH OTHER, kq₁q₂/r. If the student asks for the energy of a charge AT a point of potential, the work to place a charge in a field, why a dipole's energy is lowest when aligned, or the energy of a dipole in a field → here.)
- "uniform field between plates" / "is the field the same everywhere between capacitor plates" / "why is the field uniform between parallel plates" / "field between two parallel plates" / "field outside parallel plates" / "what is E between parallel plates" / "E = V/d" / "E = sigma over epsilon naught" / "field lines between capacitor plates" / "why are the field lines straight between plates" / "does the field change if I move the plates apart" → parallel_plate_capacitor_field
  (parallel_plate_capacitor_field is the UNIFORM-field diamond: between two oppositely charged parallel plates the field is straight, parallel, equally-spaced lines from + to −, the SAME magnitude E = V/d = σ/ε₀ at EVERY interior point (independent of position), ≈0 OUTSIDE the plates (the two sheet-fields cancel) with only a small edge fringe, and at fixed V, E ∝ 1/d. Built by superposing two charged-sheet fields (each σ/2ε₀: ADD inside, CANCEL outside). The CUT-LINE: a SINGLE isolated infinite sheet → gauss_law_sheet (E = σ/2ε₀, the ½); TWO parallel plates / the field in a capacitor gap → parallel_plate_capacitor_field (E = σ/ε₀ = V/d, uniform, confined); the CAPACITANCE of that same pair of plates (C = Q/V = ε₀A/d) → capacitance, NOT this concept. It STOPS SHORT of capacitance C = ε₀A/d, stored energy ½CV², and dielectrics. Anything asking whether/why the field between capacitor plates is uniform, what E is in the gap, E = V/d, or why the field is ≈0 outside the plates belongs here.)
- "what is capacitance" / "C = Q/V" / "C = epsilon0 A over d" / "why doesn't capacitance change when I add more charge" / "does capacitance depend on how much charge is on it" / "what is a farad" / "why does a smaller gap store more charge" / "why does moving plates closer increase capacitance" / "does capacitance depend on plate area" / "capacitor charge vs voltage" / "where does epsilon naught A over d come from" / "capacitor stores charge how" → capacitance
  (capacitance is the FIXED-RATIO diamond: a capacitor's charge Q and voltage V always move in lockstep so their ratio C = Q/V is a fixed property of the DEVICE — set by geometry alone, C = ε₀A/d — not by how much charge or voltage you give it. Headlines: no charge ever crosses the gap (one plate charges +Q, the other −Q, conduction current flows only in the external wires); Q/V stays numerically identical to C at every voltage (more charge or more volts changes what it HOLDS, never what it IS — the confronted misconception); the slope of a Q-V graph IS the capacitance, in farads; at fixed V, doubling the plate area A doubles C (C ∝ A); at fixed V, doubling the separation d HALVES C (closer plates hold MORE charge, not less — the confronted "bigger gap, more room" misconception); and C = ε₀A/d derives by chaining σ = Q/A → E = σ/ε₀ → V = E·d. The CUT-LINE: the UNIFORM FIELD E = V/d = σ/ε₀ between the plates → parallel_plate_capacitor_field (prerequisite, NOT this concept); the ENERGY ½CV² stored in a charged capacitor → capacitor_energy_storage; a DIELECTRIC slab inserted between the plates → dielectric_in_capacitor; capacitors wired in SERIES or PARALLEL → combination_of_capacitors; a capacitor CHARGING/DISCHARGING through a resistor over time (i = C·dV/dt) → an RC-circuit concept. If the student asks what capacitance IS, why it doesn't change with charge/voltage, why a smaller gap stores more, C = Q/V, C = ε₀A/d, or what a farad is → here.)

CRITICAL DISAMBIGUATION (magnetism, Ch.4):
- "what is a magnetic field" / "where does a magnetic field come from" / "does a current make a magnetic field" / "compass moves near a wire" / "Oersted experiment" / "is a magnetic field like an electric field" / "no current no field" / "moving charge makes magnetic field" → magnetic_field_concept_B
- "field around a wire" / "B-field of a current-carrying wire" / "right-hand rule for wire" / "how strong is the field" / "B = μ₀I/2πr" → magnetic_field_wire
- "Biot-Savart law" / "dB from a current element" / "dl × r" / "where does B = μ₀I/2πr come from" / "field of one current element" / "sinθ in magnetic field" → biot_savart_law
- "field at the center of a loop" / "field at the centre of a circular coil" / "B of a circular coil" / "B = μ₀NI/2R" / "magnetic field at the centre of a current loop" / "on the axis of a loop" / "B(z) on the axis of a coil" / "field of an N-turn circular coil" / "tangent galvanometer field" / "why is the loop centre field 2R not 2πR" → magnetic_field_circular_loop
- DISAMBIGUATION (loop FIELD vs loop AS A MAGNET vs straight WIRE): "how strong is the field at the centre / on the axis of a loop" / "B = μ₀NI/2R" → magnetic_field_circular_loop; "is the loop a magnet / loop acts as a dipole / m = NIA / loop field looks like a bar magnet" → current_loop_acts_as_dipole; "field around a STRAIGHT wire / B = μ₀I/2πr" → magnetic_field_wire. The loop-FIELD atom gives the magnitude/direction of B a circular loop PRODUCES (centre + on-axis); it does NOT cover the loop's dipole identity, its torque, or the solenoid.
- "Ampère's circuital law" / "∮B·dl = μ₀I_enc" / "circulation of B" / "Amperian loop" / "derive B=μ₀I/2πr from Ampère" / "why is the loop a circle" / "what is enclosed current" → amperes_circuital_law
- "how big is the magnetic force" / "F = qvB sinθ" / "magnitude of the Lorentz force" / "the size of the magnetic force" → magnetic_force_moving_charge
- "how big is the circle" / "radius of the circular path" / "r = mv/qB" / "why does the charge go in a circle" / "how big is the orbit" / "does a heavier / faster charge make a bigger circle" / "does a stronger field make a smaller circle" / "what sets the size of the circle" → circular_motion_charge_in_uniform_B
- "helix" / "helical path" / "spiral" / "charge enters at an angle" / "not perpendicular to the field" / "pitch of the helix" / "p = v cosθ · T" / "why does it move in a spiral / coil" / "v parallel and v perpendicular" / "v sinθ and v cosθ" / "component of velocity along the field" / "how far does it advance per turn" → helical_motion_charge_in_uniform_B
- "which way does the magnetic force point" / "right-hand rule for a moving charge" / "fingers v curl to B thumb F" / "direction of F = qv × B" / "F perpendicular to v and B" / "does the force flip for a negative charge / electron" / "cross and dot into the page out of the page force" / "v parallel to B force is zero" → magnetic_force_direction_right_hand_rule
- "why does a magnetic force do no work" / "why can't a magnetic field speed up a charge" / "does the speed change in a magnetic field" / "magnetic force only changes direction not speed" / "force perpendicular to velocity does no work" / "why is kinetic energy constant in a magnetic field" / "magnetic field steers but doesn't accelerate" → magnetic_force_perpendicular_no_work
- DISAMBIGUATION: "Lorentz force" or "F = qv × B" alone, asking WHICH WAY / right-hand rule / sign flip / into-the-page → magnetic_force_direction_right_hand_rule; asking WHY NO WORK / why speed doesn't change / "steers not speeds up" / ΔKE = 0 → magnetic_force_perpendicular_no_work
- "period / time per orbit / how long is one lap / how often it goes round / does the lap time change with speed / T = 2πm/qB / cyclotron frequency / f = qB/2πm / why is the period independent of speed" → cyclotron_period_independent_of_speed
- DISAMBIGUATION (RADIUS vs MAGNITUDE vs PERIOD vs HELIX of circular motion): "radius / how big the circle / r = mv/qB / does m,v,q,B change the size" → circular_motion_charge_in_uniform_B; "magnitude / how strong the force / F = qvB sinθ / how many Newtons" → magnetic_force_moving_charge; "period / time per orbit / how often / how long is one lap / T = 2πm/qB / cyclotron frequency" → cyclotron_period_independent_of_speed; "helix / spiral / enters at an ANGLE / not perpendicular / pitch / v∥ and v⊥ / v sinθ v cosθ / how far per turn" → helical_motion_charge_in_uniform_B. The RADIUS atom surfaces ONLY the circle's size r (never the force magnitude, never the period); the PERIOD atom surfaces ONLY the lap time T (it cites r = mv/qB but never re-derives it, and never shows the force magnitude); the HELIX atom is the ANGLED-entry case — it decomposes v into v∥ (along B, straight) and v⊥ (across B, circles) and surfaces the pitch, citing r = mv/qB and T = 2πm/qB without re-deriving them.
- "force on a current-carrying wire" / "F = IL×B" / "BIL sinθ" / "force on a wire in a magnetic field" / "motor force" → force_on_current_carrying_wire
- "torque on a current loop" / "couple on a loop" / "τ = μ × B" / "loop rotating in a magnetic field" → torque_on_current_loop_in_field
- "is a current loop a magnet" / "loop acts as a dipole" / "current loop is a magnetic dipole" / "loop field is like a bar magnet" / "why is a loop a dipole" / "magnetic moment of a loop m = NIA" → current_loop_acts_as_dipole
- DISAMBIGUATION (loop torque vs loop-as-dipole): if the question is about the loop TURNING / the torque / the couple in a field → torque_on_current_loop_in_field; if it is about the loop BEING a magnet / its field looking like a bar magnet / what m = NIA is → current_loop_acts_as_dipole.
- "moving coil galvanometer" / "galvanometer" / "how does a galvanometer work" / "why is the galvanometer scale uniform / linear / evenly spaced" / "radial field galvanometer" / "why a radial field in a galvanometer" / "current sensitivity" / "φ = NAB I / k" / "soft iron core in a galvanometer" / "hairspring restoring torque" → moving_coil_galvanometer
- DISAMBIGUATION (galvanometer mechanism vs loop torque vs loop-as-dipole): if the question is about the INSTRUMENT — how a galvanometer reads current, the radial field, the uniform scale, current sensitivity NAB/k → moving_coil_galvanometer; if it is just the bare couple τ = μ × B on a loop in a uniform field → torque_on_current_loop_in_field; if it is the loop being a bar-magnet / m = NIA field-equivalence → current_loop_acts_as_dipole.
- "convert a galvanometer into an ammeter / voltmeter" / "shunt resistance" / "why is the shunt small" / "S = Ig G / (I − Ig)" / "high resistance in series with galvanometer" / "R = V/Ig − G" / "why is an ammeter connected in series" / "why is a voltmeter connected in parallel" / "why does an ammeter have low resistance" / "why does a voltmeter have high resistance" / "ideal ammeter / voltmeter resistance" → galvanometer_to_ammeter_voltmeter
- DISAMBIGUATION (galvanometer MECHANISM vs CONVERSION): if the question is about how the galvanometer itself reads current — the radial field, the uniform scale, current sensitivity NAB/k → moving_coil_galvanometer; if it is about CONVERTING it into a measuring instrument — a shunt in parallel, a series resistance, ammeter/voltmeter placement or ideal resistance → galvanometer_to_ammeter_voltmeter.
- "bar magnet" / "magnetic field of a bar magnet" / "why are magnetic field lines closed loops" / "no magnetic monopole" / "can you isolate a north pole" / "cut a magnet in half" / "break a magnet" / "magnetic moment of a bar magnet" / "bar magnet is like a solenoid" / "axial vs equatorial magnetic field" / "magnetic field on the axis of a bar magnet" / "dipole field 1/r³" / "electrostatic analog of a bar magnet" → bar_magnet_as_dipole
- "bar magnet in a uniform field" / "torque on a bar magnet" / "τ = mB sinθ" / "couple on a magnet" / "why does a compass needle swing to north" / "oscillation of a bar magnet" / "vibration magnetometer" / "T = 2π√(I/mB)" / "potential energy of a magnet in a field" / "U = −mB cosθ" / "stable and unstable equilibrium of a magnet" → bar_magnet_in_uniform_field
- "Gauss's law for magnetism" / "∮B·dA = 0" / "net magnetic flux through a closed surface" / "why is magnetic flux through a closed surface zero" / "no magnetic monopole" / "magnetic field lines are closed loops" / "magnetic flux entering equals leaving" / "divergence of B is zero" / "why can't you have an isolated magnetic pole" → gauss_law_magnetism
- "Earth's magnetic field" / "Earth's magnetism" / "magnetic declination" / "angle of dip" / "angle of inclination" / "why does a compass not point to true north" / "why does a dip needle dive into the ground" / "horizontal and vertical components of Earth's field" / "elements of the Earth's magnetic field" / "tan I = V/H" / "B = √(H²+V²)" / "tan I = 2 tan λ" / "why is the dip zero at the equator and ninety at the poles" → earths_magnetism
- DISAMBIGUATION (bar magnet IDENTITY/FIELD vs bar magnet IN A FIELD vs GAUSS-FOR-MAGNETISM vs EARTH'S-MAGNETISM vs loop-as-dipole): if the question is about what a bar magnet IS or its own field — closed-loop lines, no monopole, moment m, equivalent solenoid, axial/equatorial 1/r³ → bar_magnet_as_dipole; if it is about a bar magnet's torque/oscillation/energy placed IN an external field (τ = m×B, U = −m·B, T = 2π√(I/mB)) → bar_magnet_in_uniform_field; if it is about the NET MAGNETIC FLUX through a CLOSED SURFACE being zero (∮B·dA = 0, no monopole as a flux law) → gauss_law_magnetism; if it is about the EARTH as a tilted magnet — declination D, angle of dip I, the horizontal/vertical field components, dip vs latitude → earths_magnetism; if it is about ELECTRIC flux / charge enclosed (∮E·dA = q/ε₀) → gauss_law or electric_flux; if it is about a CURRENT LOOP being a magnetic dipole (m = NIA) → current_loop_acts_as_dipole.
- "force between two parallel wires" / "two wires carrying current attract or repel" / "F/L = μ₀I₁I₂/2πd" / "parallel currents attract" / "why does the ampere get defined this way" → parallel_currents_force
- "solenoid" / "B inside a solenoid" / "B = μ₀nI" / "turns per metre" / "RHR for solenoid" / "field of a coil" → magnetic_field_solenoid

CRITICAL DISAMBIGUATION (vectors, Ch.5.1):
- "is X a scalar or a vector" / "how do you tell if something is a vector" / "does having a direction make it a vector" / "two conditions for a vector" / "3 km + 4 km at 90 degrees" / "why doesn't 3+4=7 on the ground" / "does spinning/rotating something change what it weighs" / "triangle law vs plain addition" → scalar_vs_vector (the GENERAL test — magnitude+direction is necessary but not sufficient, must also add by the triangle/parallelogram law)
- "why is current not a vector" / "current has direction but is scalar" → current_not_vector (a SPECIFIC worked application of the scalar_vs_vector test)
- "why is pressure a scalar" / "pressure pushes in all directions" → pressure_scalar (a SPECIFIC worked application of the scalar_vs_vector test)
- "two conditions for a vector, formally, with more examples" / "surface tension / finite rotation / polar vs axial" → parallelogram_law_test
- "how do you actually add two vectors" / "triangle law of vector addition" / "parallelogram law" / "tip to tail" / "why do you put the tail on the head" / "does it matter which vector you add first" / "resultant of two vectors" / "R = sqrt(a squared + b squared + 2ab cos theta)" / "can the sum be smaller than both vectors" / "range of the resultant" → vector_addition_law (the CONSTRUCTION/formula for adding two already-known vectors — distinct from scalar_vs_vector's classification TEST)
- "which way does the resultant point" / "direction of the resultant" / "what is alpha" / "angle the resultant makes with a" / "tan alpha formula" / "tan alpha = q sin theta over p plus q cos theta" / "does the resultant bisect the angle" / "which vector does R lean toward" / "resultant perpendicular to a vector" / "resultant at 90 degrees" / "resultant at 180 degrees" → resultant_direction (the DIRECTION formula, given the two vectors already known — distinct from vector_addition_law's MAGNITUDE-only construction, which explicitly defers this)

CRITICAL DISAMBIGUATION (forces, Ch.8):
- "gravitational force" / "weight of object" → field_forces
- "normal force" / "N = mg cosθ" / "is normal force always equal to weight" / "does the surface push back with a fixed force" / "normal force on an incline" / "why is normal force zero on a vertical surface" / "why does a heavier box grip the floor more" / "friction ceiling depends on normal force" → normal_force (the CURRENT field_3d atomic — N adjusts to whatever presses in: flat N=mg, tilt N=mg cosθ, vertical N=0, friction ceiling f_max=μₛN rides on N not weight. NOT normal_reaction, a legacy 2D bundle kept only for historical cache compatibility — never return normal_reaction for a new query)
- "friction and normal force together" → contact_forces
- "tension in rope" / "Atwood machine" → tension_in_string
- "hinge force on rod" → hinge_force
- "draw FBD" / "free body diagram" / "forces on block" / "isolate the body" / "why is N smaller on an incline" / "tension instead of normal force" → free_body_diagram
- "two blocks connected by a string over a pulley" / "Atwood machine" / "why isn't tension equal to the hanging weight" / "block on table connected to a hanging mass" / "block on incline connected over a pulley" / "counterweight problem" → connected_bodies (NOT tension_in_string — that concept is the bare formula lookup; connected_bodies teaches the shared-constraint + elimination METHOD with a live coupled sim)
- "block on an incline with friction" / "when does a block start to slide on a ramp" / "why does it slip at exactly that angle" / "tan theta equals mu" / "does mass affect when it slips" / "static vs kinetic friction on a slope" / "block slipping down a ramp" (NO pulley, NO second body connected by a rope) → block_on_incline (NOT connected_bodies — that concept requires a rope/pulley; this one is a single uncoupled block, T is never authored)
- "static vs kinetic friction" / "μₛ vs μₖ" / "why is it easier to push once moving" / "when does block slip" / "coefficient of friction" → friction_static_kinetic
- "why doesn't friction just equal mu N" / "does friction change as I push harder" / "why does the block suddenly lurch when it starts moving" / "why is friction weaker once something is already sliding" / "does a faster-sliding block feel more friction" / "push a heavy box until it slides" (FLAT surface, NO incline, NO tilt) → friction_force (NOT block_on_incline — that concept needs a ramp/tilt; this one is a flat push with static self-adjustment + the ceiling + the drop to kinetic. NOT friction_static_kinetic — that is the legacy bundle; friction_force is the new newtons_laws_body-engine concept)
- "why is rolling friction so much smaller than sliding friction" / "does a rolling wheel have any friction at all" / "isn't rolling supposed to be frictionless" / "why does a ball eventually stop rolling" / "why do heavy things get moved on wheels" / "why is a wheeled suitcase easier to move than dragging it" / "does a heavier wheel still roll easily" → rolling_friction (NOT friction_force — that concept is the sliding-only static/kinetic self-adjust arc on ONE contact type; this one COMPARES a sliding block to a rolling wheel at the same push, ~200× friction gap, and confronts "rolling means frictionless". NOT block_on_incline — flat concept, no tilt anywhere)
- "why isn't tension always equal to the weight" / "does tension in a string ever change" / "why is tension less than mg once it starts accelerating" / "why do two strings in a line read different tensions" / "why does the front string carry more than the back string" / "does one pull mean one tension everywhere" / "why isn't the front string's tension just equal to the applied force" / "tension in an elevator cable while accelerating" / "why does a pulley change tension" → tension_force (NOT connected_bodies — that concept teaches the shared-constraint SOLVING METHOD with one string/one T; this one teaches what tension IS and the same-vs-different question across a CHAIN of strings, T1 vs T2. NOT tension_in_string — that is the legacy mechanics_2d bare-formula bundle)
- "equilibrium of a particle" / "concurrent forces" / "when do forces balance" / "does balanced mean the forces are equal" / "why doesn't it move if forces act on it" / "sum of forces is zero in both directions" / "force table experiment" / "a sign hanging from two cables" / "tension in each of two support cables" / "why does a tight rope pull so hard" / "why can't a clothes line be pulled perfectly straight" / "why is the cable tension bigger than the weight it holds" → equilibrium_of_particles (NOT free_body_diagram — that concept teaches how to DRAW the arrows for one body; this one teaches the equilibrium CONDITION itself, ΣFₓ = 0 and ΣF_y = 0, on a live many-string rig. NOT connected_bodies or tension_force — those need a rope over a pulley joining two MOVING bodies with a shared acceleration; this one is a single particle at rest under several concurrent pulls. NOT block_on_incline — no ramp, no friction anywhere)
- "circular motion" / "centripetal force" / "why does a whirled ball need a force" / "does constant speed mean no force" / "why is tension bigger when it spins faster" / "cut the string what happens" / "why does it go outward when released" / "conical pendulum" / "why does the string tilt when it spins" / "cos theta equals g over omega squared L" / "minimum spin for a conical pendulum" / "why can't the string ever go horizontal" → uniform_circular_motion (NOT centripetal_acceleration_kinematic — that concept, not yet shipped, derives a = v²/r kinematically; this one is the FORCE-side concept, T = m ω² r read off a live rig. NOT circular_motion_banking — that concept is a car on a road, not a whirled ball or a conical pendulum. NOT pseudo_forces — this concept shows only that no outward force exists in the ground frame; it does NOT teach the rotating-frame centrifugal-force tool. NOT equilibrium_of_particles — that concept is a particle at REST under concurrent forces; this one is a particle IN MOTION around a circle)
- "F = ma" / "Newton's second law" / "direction of acceleration" / "force and direction" / "does velocity follow force" / "F = mv mistake" → newton_second_law_direction
- "Newton's first law" / "law of inertia" / "why does a moving object keep moving" / "does something need to keep pushing it" / "why don't things move at rest if forces act" / "is a resting object force-free" → newton_first_law (NOT newton_second_law_direction — that concept is about F=ma's direction/magnitude once a net force exists; this one is about whether ANY net force is needed at all, and the v=0 balanced-forces case)
- "Newton's second law" / "F = ma" / "why does force cause acceleration not speed" / "does mass affect acceleration" / "same push heavier object" / "double the force what happens" → newton_second_law (NOT newton_second_law_direction — that concept is about the DIRECTION of a relative to F once a net force exists; this one is about the a = F/m proportionality itself, force sets a rate not a speed)
- "Newton's third law" / "action and reaction" / "for every action there is an equal and opposite reaction" / "why don't equal and opposite forces cancel" / "does the heavier one push harder" / "does a wall push back" / "why can I still move if the reaction pushes back equally" → newton_third_law (NOT newton_second_law — that concept is about ONE body's a = F/m; this one is about the PAIR of forces on TWO different bodies and why they never cancel)

CRITICAL DISAMBIGUATION (work-energy, Ch.6):
- "what is work in physics" / "work done by a force" / "W = F d cos theta" / "why is work zero if nothing moves" / "I pushed hard so did I do work" / "does holding something up count as work" / "why does a tilted pull do less work" / "why cos theta and not sin theta in work" / "work as a dot product" / "F dot d" / "is work a vector or a scalar" / "does mass affect the work done" / "work done by a constant force" (force between 0 degrees and just under 90 degrees ONLY — some positive component along the motion) → work_done_by_constant_force (does NOT cover work at exactly 90 degrees, negative work, or the full positive/negative/zero sign taxonomy — that is the sibling positive_negative_zero_work; does NOT cover kinetic energy or the work-energy theorem)
- "can work be negative" / "how can work be negative" / "why is friction's work negative" / "does friction do work" / "is work zero if the force is at 90 degrees" / "why does a perpendicular force do no work" / "does carrying a bag count as work" / "is holding a bag up zero work" / "what is net work" / "how do you add up work from different forces" / "why does the same force do different work at different angles" / "is negative work the same as a negative force" / "work at an obtuse angle" / "sign of work" / "positive negative or zero work" → positive_negative_zero_work (covers the FULL sign taxonomy across all three angle regimes — θ<90° positive, θ=90° zero, θ>90° negative — plus net work as a signed sum; does NOT cover the θ<90° definition/joule/cos θ basics, which are work_done_by_constant_force's prerequisite scope, and does NOT cover kinetic energy or the work-energy theorem)
- "what is kinetic energy" / "kinetic energy formula" / "half m v squared" / "K = 1/2 mv^2" / "energy of a moving object" / "why is v squared in kinetic energy" / "double the speed what happens to kinetic energy" / "twice as fast four times the energy" / "does kinetic energy depend on mass" / "double the mass what happens to kinetic energy" / "can kinetic energy be negative" / "moving backward is the kinetic energy negative" / "is kinetic energy a vector or a scalar" / "does a body at rest have kinetic energy" / "when is kinetic energy zero" / "difference between momentum and kinetic energy" / "calculate the kinetic energy of a 5 kg body at 4 m/s" → kinetic_energy_definition (this is WHAT kinetic energy IS and what it depends on — mass, the SQUARE of the speed, no sign, zero at rest. It does NOT cover what CHANGES it: "work equals change in kinetic energy" / "work-energy theorem" / "W = ΔK" is the sibling work_energy_theorem. It does NOT cover where the energy goes when friction stops a body, potential energy, conservation, or power. NOT work_done_by_constant_force or positive_negative_zero_work — those two are about WORK, a different quantity; a question naming only a moving body's energy, never a force acting through a displacement, belongs here)

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
