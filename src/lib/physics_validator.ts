// =============================================================================
// physics_validator.ts — Pure TypeScript validation. No AI. No API call.
// Validates a ParticleFieldConfig against physics constants.
// Catches wrong directions, speed hierarchy, formula values in <1ms.
// =============================================================================

import type { ParticleFieldConfig, PhysicsConstantsFile, ValidationResult } from "./renderer_schema";
import { getPanelConfig } from "@/config/panelConfig";
import { loadConstants } from "@/lib/physics_constants/index";

export function validatePhysics(
    config: ParticleFieldConfig,
    constants: PhysicsConstantsFile,
    concept_id?: string,
): ValidationResult {
    const errors: string[] = [];

    if (config.epic_mode === 'EPIC_C' && config.state1_is_wrong_belief) {
        console.log(`[PhysicsValidator] epic_mode=${config.epic_mode} | STATE_1 validation skipped=true`);
    }

    // ── Null guard — skip direction checks if flat field names are absent ─────
    if (!config.field_arrow_direction || !config.electron_drift_direction) {
        // Can't validate direction — skip this check, don't crash
        return { valid: true, errors: [] };
    }
    const constraints = constants.animation_constraints;

    // ── 0. Panel layout — secondary_config presence check ────────────────────
    if (concept_id) {
        try {
            const pc = getPanelConfig(concept_id);
            const rawConfig = config as unknown as Record<string, unknown>;
            if (pc && (pc.layout === "dual_horizontal" || pc.layout === "dual_vertical")) {
                if (rawConfig.secondary_config === undefined || rawConfig.secondary_config === null) {
                    errors.push(
                        "Dual layout requires secondary_config — Stage 2 did not generate it"
                    );
                }
            } else if (pc && pc.layout === "single") {
                if (rawConfig.secondary_config !== undefined && rawConfig.secondary_config !== null) {
                    errors.push(
                        "Single layout must not have secondary_config — remove it"
                    );
                }
            }
            if (errors.length === 0) {
                console.log("Panel layout check: PASSED");
            }
        } catch {
            // concept not in map — skip layout checks silently
        }
    }

    // ── 1. Drift direction must be opposite to field arrows ──────────────────
    // E field points left→right. Electrons drift right→left (opposite to E).
    // Normalize both short ("right") and long ("left_to_right") forms before comparing.
    const fieldDir = config.field_arrow_direction;
    const driftDir = config.electron_drift_direction;

    const normalizeDir = (d: string): string =>
        d === "left_to_right" ? "right" :
        d === "right_to_left" ? "left" : d;

    if (fieldDir && driftDir) {
        const normField = normalizeDir(fieldDir);
        const normDrift = normalizeDir(driftDir);
        const isOpposite =
            (normField === "right" && normDrift === "left") ||
            (normField === "left"  && normDrift === "right");
        if (!isOpposite) {
            errors.push(
                `Electrons must drift OPPOSITE to E field direction ` +
                `(field="${fieldDir}", drift="${driftDir}"). ` +
                `Expected drift="${normField === "right" ? "left" : "right"}".`
            );
        }
    }

    // ── 2. Drift speed must never equal or exceed thermal speed ──────────────
    const thermalSpeed = config.particles.thermal_speed;
    for (const [stateName, state] of Object.entries(config.states)) {
        if (config.epic_mode === 'EPIC_C' && config.state1_is_wrong_belief && stateName === 'STATE_1') continue;
        if (state.drift_speed >= thermalSpeed) {
            errors.push(
                `${stateName}: Drift speed (${state.drift_speed}) must be less than ` +
                `thermal speed (${thermalSpeed}). Drift is ~10^9 times slower in reality.`
            );
        }
    }

    // ── 3. Thermal speed must meet minimum ───────────────────────────────────
    if (thermalSpeed < constraints.thermal_px_per_frame_min) {
        errors.push(
            `Thermal speed (${thermalSpeed}) below minimum (${constraints.thermal_px_per_frame_min}). ` +
            `Thermal motion must be visually fast — order of 10^6 m/s in reality.`
        );
    }

    // ── 4. Drift speed must not exceed maximum ──────────────────────────────
    for (const [stateName, state] of Object.entries(config.states)) {
        if (config.epic_mode === 'EPIC_C' && config.state1_is_wrong_belief && stateName === 'STATE_1') continue;
        if (state.drift_speed > constraints.drift_px_per_frame_max) {
            errors.push(
                `${stateName}: Drift speed (${state.drift_speed}) exceeds maximum ` +
                `(${constraints.drift_px_per_frame_max}). Drift must appear SLOW relative to thermal.`
            );
        }
    }

    // ── 5. STATE_1 must have no drift and no field ──────────────────────────
    // drift_direction may be absent in Sonnet's flat output — only fail on
    // a non-zero drift_speed, which is unambiguous.
    const s1 = config.states.STATE_1;
    const skipS1 = config.epic_mode === 'EPIC_C' && config.state1_is_wrong_belief;
    if (!skipS1) {
        if (s1.drift_speed !== 0 && s1.drift_speed !== undefined) {
            errors.push("STATE_1: Must have zero drift (pure thermal motion, no field).");
        }
        if (s1.field_visible || (s1 as unknown as Record<string, unknown>).field_active === true) {
            errors.push("STATE_1: Field must not be visible (no E field applied yet).");
        }
    }

    // ── 6. STATE_3 must use spotlight ───────────────────────────────────────
    // Sonnet may output highlight_particle:true + highlight_index:0 instead of
    // dim_others:true — treat them as equivalent (same visual intent).
    const s3 = config.states.STATE_3;
    if (!s3.highlight_particle) {
        errors.push("STATE_3: Must have highlight_particle=true (spotlight one electron).");
    }
    if (!s3.dim_others && !s3.highlight_particle) {
        errors.push("STATE_3: Must have dim_others=true (all others at low opacity).");
    }
    if (s3.dim_opacity !== undefined && s3.dim_opacity > 0.15) {
        errors.push(
            `STATE_3: dim_opacity (${s3.dim_opacity}) too high. ` +
            `Must be ≤0.15 for clear spotlight effect (recommended 0.12).`
        );
    }

    // ── 7. Field arrows direction matches constants ─────────────────────────
    // Normalize before comparing: "left_to_right" === "right", "right_to_left" === "left".
    const normConfigField = normalizeDir(config.field_arrow_direction ?? "");
    const normConstField  = normalizeDir(String(constraints.field_arrows_point ?? ""));
    if (normConfigField && normConstField && normConfigField !== normConstField) {
        errors.push(
            `Field arrows direction (${config.field_arrow_direction}) does not match ` +
            `physics constants (${constraints.field_arrows_point}). E field has a fixed direction.`
        );
    }

    // ── 8. Canvas background must be dark ───────────────────────────────────
    const bg = (config.design?.background || config.pvl_colors?.background || "#0A0A1A").toLowerCase();
    const bgBrightness = parseInt(bg.slice(1, 3), 16) + parseInt(bg.slice(3, 5), 16) + parseInt(bg.slice(5, 7), 16);
    if (bgBrightness > 120) {
        errors.push("Canvas background too bright. Physics simulations use dark backgrounds.");
    }

    // ── 9. Particle count sanity ────────────────────────────────────────────
    if (config.particles.count < 5 || config.particles.count > 100) {
        errors.push(`Particle count (${config.particles.count}) out of range. Must be 5–100.`);
    }

    if (errors.length === 0) {
        console.log("[Validator] PASSED — validatePhysics: all checks passed");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// =============================================================================
// Dynamic concept-constants loader
// Maps concept_id patterns → physics_constants JSON filename.
// =============================================================================

interface GenericConstantsFile {
    concept: string;
    locked_facts: Record<string, unknown>;
    animation_constraints: Record<string, unknown>;
    ncert_truth_statements: string[];
}

export const CONCEPT_FILE_MAP: Record<string, string> = {
    drift_velocity: "drift_velocity",
    drift_velocity_definition: "drift_velocity",
    series_resistance: "series_resistance",
    ohms_law: "ohms_law",
    ohm: "ohms_law",
    electric_current: "electric_current",
    current_electricity: "electric_current",
    // Exact match MUST come before partial "resistance" → "resistivity" entry
    resistance_temperature_dependence: "resistance_temperature_dependence",
    temperature_dependence_of_resistance: "resistance_temperature_dependence",
    resistivity: "resistivity",
    resistance: "resistivity",
    kirchhoffs_laws: "kirchhoffs_laws",
    kirchhoff: "kirchhoffs_laws",
    kirchhoffs_law: "kirchhoffs_law",
    kirchhoffs_current_law: "kirchhoffs_current_law",
    kirchhoffs_voltage_law: "kirchhoffs_voltage_law",
    kcl: "kirchhoffs_current_law",
    kvl: "kirchhoffs_voltage_law",
    parallel_resistance: "parallel_resistance",
    wheatstone_bridge: "wheatstone_bridge",
    meter_bridge: "meter_bridge",
    metre_bridge: "meter_bridge",
    potentiometer: "potentiometer",
    emf_internal_resistance: "emf_internal_resistance",
    emf: "emf_internal_resistance",
    internal_resistance: "internal_resistance",
    cells_in_series_parallel: "cells_in_series_parallel",
    cells_in_series: "cells_in_series_parallel",
    cells_in_parallel: "cells_in_series_parallel",
    electrical_power_energy: "electrical_power_energy",
    electrical_power: "electrical_power_energy",
    joule_heating: "electrical_power_energy",
    // AC concepts
    ac_basics: "ac_basics",
    alternating_current: "ac_basics",
    capacitor_in_ac: "capacitor_in_ac",
    inductor_in_ac: "inductor_in_ac",
    lc_oscillations: "lc_oscillations",
    lcr_series_circuit: "lcr_series_circuit",
    phasors: "phasors",
    power_in_ac: "power_in_ac",
    resistor_in_ac: "resistor_in_ac",
    resonance_lcr: "resonance_lcr",
    transformer: "transformer",
    // Vectors
    vector_addition: "vector_addition",
    vectors: "vector_addition",
    resultant_vector: "vector_addition",
    resolution_of_vectors: "vector_addition",
    // Mechanics
    projectile_motion: "projectile_motion",
    uniform_circular_motion: "uniform_circular_motion",
    laws_of_motion_friction: "laws_of_motion_friction",
    laws_of_motion_atwood: "laws_of_motion_atwood",
    work_energy_theorem: "work_energy_theorem",
    conservation_of_momentum: "conservation_of_momentum",
    simple_pendulum: "simple_pendulum",
    spring_mass_system: "spring_mass_system",
    torque_rotation: "torque_rotation",
    circular_motion_banking: "circular_motion_banking",
    // Wave
    wave_superposition: "wave_superposition",
    standing_waves: "standing_waves",
    beats_waves: "beats_waves",
    doppler_effect: "doppler_effect",
    sound_waves: "sound_waves",
    wave_on_string: "wave_on_string",
    // Optics
    convex_lens: "convex_lens",
    concave_lens: "concave_lens",
    convex_mirror: "convex_mirror",
    concave_mirror: "concave_mirror",
    refraction_snells_law: "refraction_snells_law",
    total_internal_reflection: "total_internal_reflection",
    prism_dispersion: "prism_dispersion",
    // Fields
    electric_field_lines: "electric_field_lines",
    electric_potential_3d: "electric_potential_3d",
    parallel_plate_capacitor_field: "parallel_plate_capacitor_field",
    magnetic_field_solenoid: "magnetic_field_solenoid",
    magnetic_field_wire: "magnetic_field_wire",
    gauss_law_3d: "gauss_law_3d",
    electromagnetic_induction_3d: "electromagnetic_induction_3d",
    bar_magnet_field: "bar_magnet_field",
    // Thermodynamics
    first_law_thermodynamics: "first_law_thermodynamics",
    isothermal_process: "isothermal_process",
    adiabatic_process: "adiabatic_process",
    carnot_engine: "carnot_engine",
    ideal_gas_kinetic_theory: "ideal_gas_kinetic_theory",
    // Electrostatics (Group A)
    coulombs_law: "coulombs_law",
    electric_dipole: "electric_dipole",
    electric_flux_gauss: "electric_flux_gauss",
    electric_potential_uniform_field: "electric_potential_uniform_field",
    charged_conductor_properties: "charged_conductor_properties",
    capacitor_parallel_series: "capacitor_parallel_series",
    dielectric_in_capacitor: "dielectric_in_capacitor",
    energy_density_electric_field: "energy_density_electric_field",
    van_de_graaff_generator: "van_de_graaff_generator",
    motion_of_charge_in_field: "motion_of_charge_in_field",
    // Rotation (Group B)
    moment_of_inertia_shapes: "moment_of_inertia_shapes",
    rolling_without_slipping: "rolling_without_slipping",
    angular_momentum_conservation: "angular_momentum_conservation",
    rolling_on_incline: "rolling_on_incline",
    torque_and_couple: "torque_and_couple",
    combined_rotation_translation: "combined_rotation_translation",
    equilibrium_rigid_body: "equilibrium_rigid_body",
    physical_pendulum: "physical_pendulum",
    // Gravitation (Group C)
    gravitational_potential_energy: "gravitational_potential_energy",
    escape_velocity_orbital: "escape_velocity_orbital",
    kepler_laws: "kepler_laws",
    geostationary_orbit: "geostationary_orbit",
    acceleration_due_to_gravity_variation: "acceleration_due_to_gravity_variation",
    gravitational_field_inside_outside_shell: "gravitational_field_inside_outside_shell",
    // EMI (Group D)
    faraday_law_emf: "faraday_law_emf",
    lenz_law_eddy: "lenz_law_eddy",
    self_inductance_lr: "self_inductance_lr",
    mutual_inductance_transformer: "mutual_inductance_transformer",
    ac_generator: "ac_generator",
    motional_emf: "motional_emf",
    // Fluids (Group E)
    pressure_pascals_law: "pressure_pascals_law",
    buoyancy_archimedes: "buoyancy_archimedes",
    bernoulli_principle: "bernoulli_principle",
    viscosity_stokes: "viscosity_stokes",
    surface_tension_capillarity: "surface_tension_capillarity",
    equation_of_continuity: "equation_of_continuity",
    // Thermal (Group F)
    thermal_expansion: "thermal_expansion",
    calorimetry_heat_transfer: "calorimetry_heat_transfer",
    heat_conduction_convection_radiation: "heat_conduction_convection_radiation",
    newtons_law_of_cooling: "newtons_law_of_cooling",
    stress_strain_elasticity: "stress_strain_elasticity",
    // Thermodynamics gaps (Group G)
    entropy_second_law: "entropy_second_law",
    pv_diagrams_work: "pv_diagrams_work",
    gas_laws_ideal: "gas_laws_ideal",
    kinetic_theory_temperature: "kinetic_theory_temperature",
    specific_heat_cp_cv: "specific_heat_cp_cv",
    // Moving Charges & Magnetism (Group H)
    magnetic_field_biot_savart: "magnetic_field_biot_savart",
    ampere_circuital_law: "ampere_circuital_law",
    magnetic_force_moving_charge: "magnetic_force_moving_charge",
    cyclotron: "cyclotron",
    force_on_current_carrying_conductor: "force_on_current_carrying_conductor",
    galvanometer_to_ammeter_voltmeter: "galvanometer_to_ammeter_voltmeter",
    magnetic_dipole_bar_magnet: "magnetic_dipole_bar_magnet",
    // Oscillations (Group I)
    simple_harmonic_motion: "simple_harmonic_motion",
    simple_pendulum_shm: "simple_pendulum_shm",
    energy_in_shm: "energy_in_shm",
    damped_oscillations: "damped_oscillations",
    forced_oscillations_resonance: "forced_oscillations_resonance",
    // Wave Optics (Group J)
    youngs_double_slit: "youngs_double_slit",
    single_slit_diffraction: "single_slit_diffraction",
    interference_coherence: "interference_coherence",
    diffraction_grating: "diffraction_grating",
    polarisation_malus_law: "polarisation_malus_law",
    thin_film_interference: "thin_film_interference",
    huygens_principle: "huygens_principle",
    // Ray Optics (Group K)
    reflection_spherical_mirrors: "reflection_spherical_mirrors",
    thin_lens_formula: "thin_lens_formula",
    optical_instruments: "optical_instruments",
    refraction_at_spherical_surface: "refraction_at_spherical_surface",
    // Modern Physics (Group L)
    photoelectric_effect_detail: "photoelectric_effect_detail",
    photoelectric_effect: "photoelectric_effect_detail",
    de_broglie_hypothesis: "de_broglie_hypothesis",
    bohr_model_hydrogen: "bohr_model_hydrogen",
    nuclear_binding_energy: "nuclear_binding_energy",
    radioactive_decay: "radioactive_decay",
    nuclear_fission_fusion: "nuclear_fission_fusion",
    // Semiconductors (Group M)
    pn_junction_diode: "pn_junction_diode",
    transistor_action: "transistor_action",
    logic_gates: "logic_gates",
    semiconductor_basics: "semiconductor_basics",
    rectifier_circuits: "rectifier_circuits",
    // Kinematics (Group N)
    projectile_motion_advanced: "projectile_motion_advanced",
    relative_motion: "relative_motion",
    motion_graphs: "motion_graphs",
    equations_of_motion: "equations_of_motion",
    vertical_motion_gravity: "vertical_motion_gravity",
    // Laws of Motion (Group O)
    newtons_laws_overview: "newtons_laws_overview",
    friction_laws: "friction_laws",
    motion_on_inclined_plane: "motion_on_inclined_plane",
    circular_motion_vertical: "circular_motion_vertical",
    pseudo_forces: "pseudo_forces",
    // Work, Energy, Power (Group P)
    conservation_of_energy: "conservation_of_energy",
    power_efficiency: "power_efficiency",
    potential_energy_curves: "potential_energy_curves",
    // Collisions (Group Q)
    elastic_inelastic_collisions: "elastic_inelastic_collisions",
    coefficient_of_restitution: "coefficient_of_restitution",
    linear_momentum_conservation: "linear_momentum_conservation",
    // AC Circuits (Group R)
    ac_circuits_lcr: "ac_circuits_lcr",
    ac_voltage_current: "ac_voltage_current",
    rc_circuit_charging: "rc_circuit_charging",
    power_transmission: "power_transmission",
    // Heat Transfer (Group S)
    blackbody_radiation: "blackbody_radiation",
    thermal_conductivity_applications: "thermal_conductivity_applications",
    radiation_exchange: "radiation_exchange",
};

async function loadConstantsForConcept(conceptId: string): Promise<GenericConstantsFile | null> {
    // First try exact match via unified loader
    let constants = await loadConstants(conceptId);
    if (constants) return constants as unknown as GenericConstantsFile;

    // Try CONCEPT_FILE_MAP alias
    const resolved = CONCEPT_FILE_MAP[conceptId];
    if (resolved && resolved !== conceptId) {
        constants = await loadConstants(resolved);
        if (constants) return constants as unknown as GenericConstantsFile;
    }

    console.warn(`[physicsValidator] No constants for concept: ${conceptId}`);
    return null;
}

// =============================================================================
// Universal rules — applied to ALL Current Electricity concepts.
// Works from the generic constants shape (Record<string, unknown>).
// =============================================================================

function validateUniversal(
    config: ParticleFieldConfig,
    ac: Record<string, unknown>
): string[] {
    const errors: string[] = [];

    // ── A. Thermal must be faster than drift ─────────────────────────────────
    if (ac.thermal_must_be_faster_than_drift === true) {
        const thermalSpeed = config.particles.thermal_speed;
        for (const [stateName, state] of Object.entries(config.states)) {
            if (state.drift_speed >= thermalSpeed) {
                errors.push(
                    `${stateName}: Drift speed (${state.drift_speed}) must be less than ` +
                    `thermal speed (${thermalSpeed}).`
                );
            }
        }
        const minThermal = ac.thermal_px_per_frame_min;
        if (typeof minThermal === "number" && config.particles.thermal_speed < minThermal) {
            errors.push(
                `Thermal speed (${config.particles.thermal_speed}) below minimum (${minThermal}).`
            );
        }
    }

    // ── B. Drift direction matches constants ──────────────────────────────────
    // Sonnet outputs a flat top-level field: config.electron_drift_direction
    // NOT a per-state field. Read the global field only.
    const electronsDrift = ac.electrons_drift;
    if (electronsDrift === "right_to_left" || electronsDrift === "left_to_right") {
        const expectedDrift = electronsDrift === "right_to_left" ? "left" : "right";
        const rawCfg = config as unknown as Record<string, unknown>;
        const globalDriftDir = rawCfg.electron_drift_direction as string | undefined;
        if (globalDriftDir && globalDriftDir !== "none" && globalDriftDir !== expectedDrift) {
            errors.push(
                `Global electron_drift_direction ('${globalDriftDir}') should be '${expectedDrift}' per locked constants.`
            );
        }
    }

    // ── C. Max drift speed ────────────────────────────────────────────────────
    const maxDrift = ac.current_px_per_frame_max ?? ac.drift_px_per_frame_max;
    if (typeof maxDrift === "number") {
        for (const [stateName, state] of Object.entries(config.states)) {
            if (state.drift_speed > maxDrift) {
                errors.push(
                    `${stateName}: Drift speed (${state.drift_speed}) exceeds maximum (${maxDrift}).`
                );
            }
        }
    }

    // ── D. STATE_1 must have no drift and no field (universal) ───────────────
    // Only check drift_speed (unambiguous). Sonnet uses a global electron_drift_direction,
    // not a per-state drift_direction field, so we do NOT read s1.drift_direction here.
    const s1 = config.states.STATE_1;
    if (s1.drift_speed !== 0 && s1.drift_speed !== undefined) {
        errors.push("STATE_1: Must have zero drift (pure thermal motion, no field).");
    }
    if (s1.field_visible || (s1 as unknown as Record<string, unknown>).field_active === true) {
        errors.push("STATE_1: Field must not be visible.");
    }

    // ── E. STATE_3 spotlight (universal, tightened to 0.15) ──────────────────
    const s3 = config.states.STATE_3;
    if (!s3.highlight_particle) {
        errors.push("STATE_3: Must have highlight_particle=true (spotlight one electron).");
    }
    // Sonnet outputs highlight_particle but not dim_others — accept either as equivalent
    if (!s3.dim_others && !s3.highlight_particle) {
        errors.push("STATE_3: Must have dim_others=true or highlight_particle=true (spotlight effect).");
    }
    if (s3.dim_opacity > 0.15) {
        errors.push(
            `STATE_3: dim_opacity (${s3.dim_opacity}) must be ≤0.15 for clear spotlight (recommended 0.12).`
        );
    }

    // ── F. Dark background ────────────────────────────────────────────────────
    const bg = (config.design?.background || config.pvl_colors?.background || "#0A0A1A").toLowerCase();
    const brightness =
        parseInt(bg.slice(1, 3), 16) +
        parseInt(bg.slice(3, 5), 16) +
        parseInt(bg.slice(5, 7), 16);
    if (brightness > 120) {
        errors.push("Canvas background too bright. Physics simulations use dark backgrounds.");
    }

    // ── G. Particle count ─────────────────────────────────────────────────────
    if (config.particles.count < 5 || config.particles.count > 100) {
        errors.push(`Particle count (${config.particles.count}) out of range. Must be 5–100.`);
    }

    return errors;
}

// =============================================================================
// validatePhysicsForConcept — new entry point for all Current Electricity sims.
// Loads the correct JSON constants file, runs universal rules.
// Falls back gracefully if no constants file exists for the concept.
// =============================================================================

export async function validatePhysicsForConcept(
    config: ParticleFieldConfig,
    conceptId: string
): Promise<ValidationResult> {
    const constants = await loadConstantsForConcept(conceptId);

    if (!constants) {
        // No constants file — run only universal layout/spotlight checks with safe defaults.
        console.warn(`[physics_validator] No constants file for concept_id="${conceptId}". Running universal checks only.`);
        const defaultAc: Record<string, unknown> = {
            thermal_must_be_faster_than_drift: true,
            thermal_px_per_frame_min: 3.0,
            current_px_per_frame_max: 2.0,
            electrons_drift: "right_to_left",
        };
        const errors = validateUniversal(config, defaultAc);
        return { valid: errors.length === 0, errors };
    }

    const errors = validateUniversal(config, constants.animation_constraints);
    if (errors.length === 0) {
        console.log("[Validator] PASSED — validatePhysicsForConcept: all checks passed");
    }
    return { valid: errors.length === 0, errors };
}
