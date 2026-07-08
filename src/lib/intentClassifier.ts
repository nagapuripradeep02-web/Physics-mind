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
  gauss_law_solid_sphere          ← APPLYING Gauss's law + spherical symmetry to a uniformly charged SOLID (insulating) sphere to SOLVE for E(r): E = kq·r/R³ inside (r<R, grows LINEARLY from 0 at the centre because only q_enc = q·(r/R)³ is enclosed), E = kq/r² outside (r≥R, like a point charge); CONTINUOUS at r=R (both give kq/R²), so the field peaks AT the surface with NO jump. The SOLID-ball case — distinct from the hollow shell (gauss_law_sphere, which is zero inside and jumps at the surface). Route "field inside a solid sphere", "uniformly charged solid sphere / ball", "insulating charged sphere", "volume charge density sphere", "E inside a charged ball" here.
  gauss_law_line                  ← APPLYING Gauss's law + CYLINDRICAL symmetry to an INFINITE LINE / WIRE of uniform linear charge density λ to SOLVE for E(r): a coaxial Gaussian CYLINDER (flat end caps carry zero flux, only the curved wall counts) gives Φ = E·(2πrL) = λL/ε₀, the L cancels ⇒ E = λ/(2πε₀r), radial and ⊥ to the line and independent of axial position. The headline: the line falls off as 1/r, NOT 1/r² like a point charge (cylinder area 2πrL grows linearly with r). WIRE / LINE ONLY — no plane/sheet, no finite-line ends. Route "field of an infinite/line charge", "E near a charged wire", "E = λ/2πε₀r", "why 1/r not 1/r²", "Gaussian cylinder for a wire" here.
  gauss_law_sheet                 ← APPLYING Gauss's law + PLANAR symmetry to an INFINITE PLANE SHEET of uniform surface charge density σ to SOLVE for E: a Gaussian PILLBOX (the curved WALL carries zero flux, only the two flat CAPS count — the exact INVERSE of the line's cylinder) gives Φ = 2EA = σA/ε₀, the A cancels ⇒ E = σ/(2ε₀), ⊥ to the sheet, pointing away on BOTH sides, equal everywhere. The headline: the field is CONSTANT — it does NOT fall off with distance at all (NOT the line's 1/r, NOT the point's 1/r²), because the pillbox encloses the same σA patch however far out the caps sit. The ½ is from flux leaving BOTH caps, so an ISOLATED sheet gives σ/2ε₀ — distinct from the σ/ε₀ conductor-surface / between-two-plates case (a DIFFERENT concept). SHEET / PLANE ONLY — no line/sphere, no edge effects. Route "field of an infinite charged sheet/plane", "E = σ/2ε₀", "why doesn't the sheet field fall off", "uniform field from a sheet", "Gaussian pillbox" here.
  force_on_charge_in_field        ← force on a charge placed in a field F = qE, direction by sign (along E for +q, opposite for −q), constant force in a uniform field, a = qE/m, parabolic deflection of a launched charge
  electric_dipole_in_field        ← electric dipole in a UNIFORM field: torque τ = p × E = pE sin θ, the force couple ±qE with zero net force, rotation toward alignment, stable (θ=0) vs unstable (θ=180°) equilibrium, potential energy U = −pE cos θ

  ── Electrostatic Potential and Capacitance (Class 12 Ch.2) ──
  electric_potential_meaning      ← the MEANING of electric potential V = W/q: the work done per unit positive test charge to bring it from infinity to a point; a single SCALAR per place (no direction, NOT a vector, NOT the field E); path-independent because the electrostatic force is conservative; the reference V(∞)=0; ΔV = V_B − V_A is the per-unit-charge work between two points (closer to a +source ⇒ higher V); potential energy U = qV (belongs to the charge, scales with q) vs potential V (belongs to the place, does not). Mentions equipotential surfaces only in passing (V = altitude, E = slope); the DEDICATED equipotential-surface GEOMETRY (concentric spheres, E ⟂ surface, zero work along, crowding↔field-strength) is the separate sibling equipotential_surfaces. Teaches V = W/q and STOPS SHORT of V = kQ/r. Route "what is electric potential", "what does voltage at a point mean", "V = W/q", "work per unit charge", "is potential a vector or scalar", "potential vs potential energy", "potential at a point" here.
  electric_potential_point_charge ← the FORMULA/VALUE of the potential of a point charge: V = kQ/r at distance r, which falls off as 1/r — ONE power of r, SLOWER than the field's 1/r². Halving r only DOUBLES V (not ×4 — the ×4 is the field's 1/r² instinct); V rides ABOVE E far out (they meet at r₀=2 then diverge); V is a SIGNED SCALAR (+Q hill, −Q well, no arrow). Teaches the point-charge VALUE V = kQ/r and its 1/r falloff; declares electric_potential_meaning (what V MEANS) as a prerequisite and does NOT re-teach it, and STOPS SHORT of multi-charge superposition of potentials, E = −dV/dr, the dipole potential, or capacitance. Route "V = kQ/r", "potential at distance r from a point charge", "potential due to a point charge", "why does potential fall off 1/r not 1/r²", "halve r does V quadruple", "is the potential of a negative charge negative" here.
  equipotential_surfaces          ← the GEOMETRY of constant-V surfaces: an equipotential surface is the locus of all points sharing one common V; for a point charge these are concentric SPHERES (r = kQ/V); the field is everywhere PERPENDICULAR to them and points from high V to low V; NO work is done moving a charge ALONG one (W = F·d·cos90° = 0) while moving BETWEEN surfaces costs W = qΔV; equal V-steps CROWD where the field is strong (r ~ 1/V); two distinct surfaces never intersect. Declares electric_potential_meaning (V = W/q), electric_potential_point_charge (V = kQ/r) and electric_field_point_charge (E = kQ/r²) as prerequisites and does NOT re-teach them; STOPS SHORT of the value V = kQ/r, dipole / uniform-field equipotentials, and conductors / capacitance. Route "what is an equipotential surface", "surfaces of constant potential", "why is the field perpendicular to the equipotential", "do you do work moving a charge along an equipotential", "equipotential spheres / lines", "why do equipotentials get closer together" here.
  electric_potential_dipole       ← the dipole POTENTIAL/VALUE: V = kp cosθ/r² at a far point, the SCALAR sum of the two charge potentials (V = kq/r₊ − kq/r₋). Its SIGN follows cos θ, i.e. POSITION (positive on the +q side, negative on the −q side, NOT set by which charge "wins"); it is ZERO across the WHOLE equatorial plane (θ=90°, every point equidistant from ±q), where the field E is nonetheless NON-zero (E = −grad V — potential is height, field is slope); and it falls as 1/r², one power STEEPER than a single charge's 1/r (because +q and −q nearly cancel far away). Declares electric_potential_point_charge (V = kQ/r), electric_potential_meaning (V = W/q) and electric_field_dipole (the dipole's vector FIELD) as prerequisites and does NOT re-teach them; STOPS SHORT of capacitance and the dipole's field magnitude/torque. Route "potential due to a dipole", "electric potential of a dipole", "V = kp cosθ/r²", "is the potential zero on the dipole's equator", "why is dipole potential zero on the perpendicular bisector", "does dipole potential fall as 1/r or 1/r squared", "is potential a vector or scalar" here.
  parallel_plate_capacitor_field  ← the UNIFORM field between two oppositely charged PARALLEL PLATES: straight, parallel, equally-spaced field lines from + to −, the SAME magnitude E = V/d = σ/ε₀ at EVERY interior point (independent of position), ≈0 OUTSIDE (the two sheet-fields cancel) with only a small edge fringe, and at fixed V, E ∝ 1/d (double the gap halves the field). Built by superposing two charged-sheet fields (each σ/2ε₀: ADD inside, CANCEL outside). Declares electric_field_point_charge, gauss_law_sheet (the σ/2ε₀ single sheet) and electric_potential_meaning as prerequisites and does NOT re-teach them; STOPS SHORT of capacitance C = ε₀A/d, stored energy ½CV², and dielectrics. Route "uniform field between plates", "is the field the same everywhere between capacitor plates", "why is the field uniform between parallel plates", "field outside parallel plates", "what is E between parallel plates", "E = V/d", "field lines between capacitor plates" here.

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

CRITICAL DISAMBIGUATION (electromagnetic induction, Ch.6):
- "what is magnetic flux" / "Phi = B A cos theta" / "why is flux zero if the field is strong" / "why does tilting the loop change the flux" / "is theta measured from the plane or the normal" / "why is flux negative past ninety degrees" / "does flux mean something is flowing" / "weber unit" (NO induction/EMF/needle/current in the question) → magnetic_flux
- "Faraday's law" / "flux through a coil" / "moving magnet induces current" / "epsilon = -N dPhi/dt" / "Lenz's law" / "magnet falls slowly through a copper pipe" → faraday_law_induction
- "motional EMF" / "rod sliding on rails" / "epsilon = Blv" / "which end of the sliding rod is positive" / "right-hand rule for a sliding rod" / "does an open-circuit rod still have an EMF" / "retarding force on a sliding rod" / "why push the rod if the magnetic force does no work" / "energy dissipated in the resistor from a sliding rod" → motional_emf
- "eddy currents" / "why does a swinging metal plate brake itself in a field" / "why do slots in a plate reduce the drag" / "why are transformer cores laminated" / "induction cooktop / furnace heating" / "Foucault currents" / "electromagnetic damping of a solid conductor" → eddy_currents
- "inductance" / "self-inductance" / "mutual inductance" / "back EMF" / "why does the current in a coil rise gradually and not jump" / "epsilon = -L dI/dt" / "why is the back EMF zero at steady current" / "why do I get a spark when I open a switch on a coil" / "energy stored in an inductor" / "U = 1/2 L I squared" / "epsilon_2 = -M dI1/dt" / "why does a transformer or wireless charger work with no wire between the coils" / "coefficient of coupling k" / "M = k root L1 L2" / "how does an ignition coil make a spark" → inductance
- "AC generator" / "how does an AC generator or dynamo work" / "how is alternating current produced" / "coil rotating in a magnetic field gives AC" / "epsilon = NBA omega sin omega t" / "peak EMF of a generator" / "eps0 = NBA omega" / "why is the EMF maximum when the coil is parallel to the field or the flux is zero" / "phase difference between flux and EMF in a generator" / "why does a generator give AC not DC" / "slip rings vs split ring or commutator" / "how a bicycle dynamo works" / "why does faster rotation give more voltage AND higher frequency" → ac_generator
  (DISAMBIGUATION faraday_law_induction vs motional_emf vs eddy_currents vs inductance vs ac_generator: ALL FOUR are Lenz's-law-flavoured ε = −dΦ/dt physics, but the STUDENT-FACING CAUSE and GEOMETRY differ. If a MAGNET moves and a STATIONARY COIL sees its flux change (push-in/pull-out, needle deflection, Lenz's-law pole-repulsion) → faraday_law_induction. If a ROD/CONDUCTOR itself slides along rails in a field B and the question is about ε = Bvl, the qv×B force on the rod's own charges, which END is positive, or the retarding-force/energy argument for a moving rod → motional_emf. If the conductor is a BULK/SOLID block (a plate, a pan, a transformer core — NOT a wire loop or a rod-on-rails) and the question is about induced currents forming INSIDE the solid metal itself, why cutting slots or laminating reduces the effect, or induction heating → eddy_currents. If a COIL'S OWN CHANGING CURRENT is the cause — the current ramping instead of jumping, the back-EMF ε_L = −L·dI/dt, why the back-EMF is zero at steady current, the switch-off spark, energy ½LI² stored in a coil, OR a changing current in one coil inducing a voltage in a SECOND disconnected coil (ε₂ = −M·dI₁/dt, transformer/wireless-charging with no wire between them) → inductance. "Same physics, different picture": faraday_law_induction is the moving-magnet-and-coil picture; motional_emf is the rod-and-rails picture; eddy_currents is the solid-block picture; inductance is the coil-reacting-to-ITS-OWN-or-a-NEIGHBOUR'S-changing-current picture. Route ε = Bvl / RHR-for-polarity / open-vs-closed-circuit rod questions to motional_emf; slots/lamination/induction-heating to eddy_currents; back-EMF / L-is-geometry / ½LI² / switch-off-spark / mutual-M-across-a-gap questions to inductance specifically. If a COIL is ROTATING in a field and the question is about producing ALTERNATING current, the sinusoidal EMF eps = NBA·omega·sin(omega t), why the EMF is maximum when the flux is zero (the 90-degree phase lag), the peak eps0 = NBA·omega, why faster rotation raises both peak and frequency, or slip-rings-vs-commutator → ac_generator (the moving-magnet/coil is faraday_law_induction; the ROTATING coil that GENERATES AC is ac_generator — the last Ch.6 concept, now built).)

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
  (parallel_plate_capacitor_field is the UNIFORM-field diamond: between two oppositely charged parallel plates the field is straight, parallel, equally-spaced lines from + to −, the SAME magnitude E = V/d = σ/ε₀ at EVERY interior point (independent of position), ≈0 OUTSIDE the plates (the two sheet-fields cancel) with only a small edge fringe, and at fixed V, E ∝ 1/d. Built by superposing two charged-sheet fields (each σ/2ε₀: ADD inside, CANCEL outside). The CUT-LINE: a SINGLE isolated infinite sheet → gauss_law_sheet (E = σ/2ε₀, the ½); TWO parallel plates / the field in a capacitor gap → parallel_plate_capacitor_field (E = σ/ε₀ = V/d, uniform, confined). It STOPS SHORT of capacitance C = ε₀A/d, stored energy ½CV², and dielectrics. Anything asking whether/why the field between capacitor plates is uniform, what E is in the gap, E = V/d, or why the field is ≈0 outside the plates belongs here.)

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
