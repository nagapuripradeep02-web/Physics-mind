// ─────────────────────────────────────────────────────────────────────────────
// NCERT Syllabus concept lookup
// Used to accurately set beyond_ncert flag.
// If concept_id matches any known NCERT concept → beyond_ncert = false
// regardless of whether NCERT vector search returned chunks.
// ─────────────────────────────────────────────────────────────────────────────

const NCERT_SYLLABUS_CONCEPTS = [
    // ─── Class 12 Physics ───
    "electric_charge", "coulomb", "electric_field", "electric_flux",
    "gauss_law", "electric_potential", "equipotential",
    "capacitance", "capacitor", "dielectric",
    "current_electricity", "drift_velocity", "drift",
    "ohm", "ohms_law", "resistance", "resistivity", "resistor",
    "kirchhoff", "wheatstone", "potentiometer", "meter_bridge",
    "emf", "internal_resistance", "cell",
    "magnetic_field", "biot_savart", "ampere", "ampere_law",
    "solenoid", "toroid", "magnetic_force", "lorentz", "cyclotron",
    "galvanometer", "ammeter", "voltmeter",
    "electromagnetic_induction", "faraday", "faraday_law",
    "lenz", "lenz_law", "eddy_current",
    "mutual_inductance", "self_inductance", "inductance",
    "ac_circuit", "ac", "impedance", "resonance", "transformer",
    "electromagnetic_wave", "em_wave", "em_spectrum",
    "ray_optics", "refraction", "reflection", "snell",
    "lens", "mirror", "prism", "total_internal_reflection", "tir",
    "wave_optics", "interference", "young", "diffraction",
    "polarization", "polarisation",
    "photoelectric", "photoelectric_effect", "work_function",
    "dual_nature", "de_broglie", "matter_wave",
    "atom", "atomic_model", "bohr", "bohr_model",
    "hydrogen_spectrum", "rydberg",
    "nuclear", "radioactivity", "alpha", "beta", "gamma",
    "nuclear_fission", "nuclear_fusion", "binding_energy",
    "mass_defect",
    "semiconductor", "pn_junction", "diode", "zener",
    "transistor", "logic_gate", "nand", "nor",

    // ─── Class 11 Physics ───
    "units", "measurement", "dimension", "dimensional_analysis",
    "kinematics", "motion", "velocity", "acceleration",
    "projectile", "projectile_motion", "relative_motion",
    "newton", "newton_law", "laws_of_motion", "inertia",
    "friction", "static_friction", "kinetic_friction",
    "circular_motion", "centripetal", "centrifugal",
    "work", "energy", "work_energy_theorem", "kinetic_energy",
    "potential_energy", "conservation_energy", "power",
    "center_of_mass", "centre_of_mass", "momentum",
    "impulse", "collision", "elastic_collision",
    "rotational_motion", "torque", "moment_of_inertia",
    "angular_momentum", "angular_velocity", "rolling",
    "gravitation", "gravity", "kepler", "orbital",
    "escape_velocity", "satellite", "geostationary",
    "elasticity", "stress", "strain", "young_modulus",
    "hooke", "bulk_modulus", "shear_modulus",
    "fluid", "pressure", "pascal", "archimedes", "buoyancy",
    "bernoulli", "viscosity", "surface_tension", "capillary",
    "thermal_expansion", "specific_heat", "calorimetry",
    "heat_transfer", "conduction", "convection", "radiation_heat",
    "thermodynamics", "first_law", "second_law",
    "carnot", "entropy", "heat_engine", "refrigerator",
    "kinetic_theory", "ideal_gas", "gas_law", "rms_speed",
    "oscillation", "shm", "simple_harmonic", "pendulum",
    "spring", "damped", "forced_oscillation",
    "wave", "transverse", "longitudinal", "standing_wave",
    "sound", "sound_wave", "doppler", "resonance_tube",

    // ─── Class 10 Physics ───
    "light", "lens_class10", "mirror_class10",
    "human_eye", "myopia", "hypermetropia",
    "electricity_class10", "series_parallel",
    "magnetic_effect", "electromagnet",
    "electromagnetic_induction_class10",
    "sources_energy", "solar", "wind_energy",
];

/**
 * Check if a concept_id refers to a topic covered in NCERT Class 10-12 Physics.
 * Uses substring matching so "drift_velocity_basic" matches "drift_velocity".
 */
export function isConceptInNCERT(conceptId: string): boolean {
    if (!conceptId) return false;
    const normalized = conceptId.toLowerCase().replace(/\s+/g, "_");

    return NCERT_SYLLABUS_CONCEPTS.some(
        syllabusItem =>
            normalized.includes(syllabusItem) ||
            syllabusItem.includes(normalized)
    );
}
