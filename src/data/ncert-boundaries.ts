// ── NCERT Syllabus Boundaries ────────────────────────────────────────────────
// Used to keep AI responses strictly within NCERT scope.

export const NCERT_BOUNDARIES = {

    class_10: {
        electricity: [
            "Electric current", "Potential difference",
            "Ohm's law", "Resistance", "Resistivity",
            "Series circuit", "Parallel circuit",
            "Heating effect of current", "Electric power",
            "Domestic electric circuits",
        ],
        NOT_IN_CLASS_10: [
            "KCL", "KVL", "EMF", "Internal resistance",
            "Wheatstone bridge", "Potentiometer",
            "Drift velocity", "Terminal voltage",
        ],
    },

    class_11: {
        mechanics: [
            "Motion in straight line", "Motion in plane",
            "Newton's laws of motion", "Work energy theorem",
            "System of particles", "Rotational motion",
            "Gravitation", "Oscillations",
        ],
        thermodynamics: [
            "Thermal properties", "Thermodynamics", "Kinetic theory",
        ],
        waves: ["Waves", "Doppler effect"],
        NOT_IN_CLASS_11: [
            "Current electricity", "Electrostatics", "Magnetism",
        ],
    },

    class_12: {
        ch1_electrostatics: [
            "Electric charges", "Coulomb's law",
            "Electric field", "Electric flux",
            "Gauss's law", "Electric potential",
            "Potential energy", "Conductors",
            "Polarisation", "Capacitance",
            "Parallel plate capacitor", "Dielectrics",
            "Energy stored in capacitor",
            "Van de Graaff generator",
        ],
        ch2_current_electricity: [
            "Electric current", "Drift velocity",
            "Current density", "Ohm's law",
            "Resistance", "Resistivity",
            "Temperature dependence of resistance",
            "Electrical energy and power",
            "Carbon resistors", "Colour coding",
            "EMF", "Internal resistance",
            "Terminal voltage", "Cells in series",
            "Cells in parallel", "KCL", "KVL",
            "Wheatstone bridge", "Metre bridge",
            "Potentiometer principle",
            "EMF comparison using potentiometer",
            "Internal resistance using potentiometer",
            "Galvanometer", "Ammeter", "Voltmeter",
        ],
        ch3_magnetic_effects: [
            "Magnetic force on moving charge",
            "Magnetic force on current",
            "Motion in magnetic field", "Helical motion",
            "Biot-Savart law", "Magnetic field of straight wire",
            "Magnetic field of circular loop",
            "Ampere's circuital law", "Solenoid",
            "Toroid", "Force between parallel currents",
            "Torque on current loop", "Magnetic dipole",
            "Moving coil galvanometer",
        ],
        ch4_magnetism: [
            "Bar magnet as magnetic dipole",
            "Magnetic field lines", "Earth's magnetism",
            "Declination", "Dip", "Horizontal component",
            "Magnetisation", "Magnetic intensity",
            "Susceptibility", "Permeability",
            "Diamagnetic", "Paramagnetic", "Ferromagnetic",
            "Hysteresis",
        ],
        ch5_emi: [
            "Magnetic flux", "Faraday's law",
            "Lenz's law", "Motional EMF",
            "Energy consideration in Lenz's law",
            "Eddy currents", "Inductance",
            "Self inductance", "Mutual inductance",
            "AC generator",
        ],
        ch6_ac_circuits: [
            "AC voltage", "AC current", "Phasors",
            "Resistor in AC", "Inductor in AC",
            "Capacitor in AC", "LC oscillations",
            "LCR series circuit", "Impedance",
            "Resonance", "Sharpness Q factor",
            "Power in AC circuit", "Power factor",
            "Wattless current", "Transformer",
        ],
        ch7_em_waves: [
            "Displacement current",
            "Maxwell's equations (statement only)",
            "EM waves properties", "EM spectrum",
            "Uses of different EM waves",
        ],
        ch8_optics_ray: [
            "Reflection", "Mirror formula",
            "Refraction", "Total internal reflection",
            "Lenses", "Lens maker equation",
            "Refraction at spherical surface",
            "Prism", "Dispersion", "Scattering",
            "Optical instruments", "Eye", "Microscope", "Telescope",
        ],
        ch9_optics_wave: [
            "Huygens principle",
            "Reflection by Huygens principle",
            "Refraction by Huygens principle",
            "Coherent sources",
            "Young's double slit experiment",
            "Interference fringe width",
            "Diffraction at single slit",
            "Resolving power",
            "Polarisation", "Brewster's law", "Polaroids",
        ],
        ch10_modern: [
            "Photoelectric effect",
            "Einstein photoelectric equation",
            "Wave nature of matter",
            "de Broglie wavelength",
            "Davisson Germer experiment",
        ],
        ch11_atoms: [
            "Alpha scattering", "Rutherford model",
            "Bohr model", "Energy levels",
            "Hydrogen spectrum",
            "de Broglie explanation of Bohr",
        ],
        ch12_nuclei: [
            "Nuclear size", "Nuclear mass",
            "Binding energy", "Nuclear force",
            "Radioactivity", "Alpha beta gamma decay",
            "Half life", "Nuclear fission", "Nuclear fusion",
        ],
        ch13_semiconductor: [
            "Energy bands", "Intrinsic semiconductor",
            "Extrinsic semiconductor", "p-n junction",
            "Junction diode", "Rectifier",
            "Zener diode", "Optoelectronic devices",
            "Transistor", "Transistor as switch",
            "Transistor as amplifier", "Logic gates",
        ],
    },

    FORBIDDEN_FOR_ALL: [
        "Maxwell's equations full derivation",
        "Quantum field theory",
        "Special or general relativity",
        "Statistical mechanics",
        "Tensor mathematics",
        "Hamiltonian mechanics",
        "Lagrangian mechanics",
        "Solid state band theory at degree level",
        "University-level derivations of any kind",
    ],
};

export function getBoundaryPrompt(classLevel: string, mode: string): string {
    if (mode === "board") {
        return `CONCEPT BOUNDARY — MANDATORY:
You are teaching Class ${classLevel} CBSE board exam.
Use ONLY concepts from Class ${classLevel} NCERT.
Use NCERT's own language where possible.
Derivations must follow NCERT's exact sequence.
A student writing your explanation word-for-word should get full marks from any CBSE examiner.
Never introduce concepts from higher classes.
Never use university-level physics.`;
    }

    if (mode === "competitive") {
        return `CONCEPT BOUNDARY — MANDATORY:
You are teaching for JEE/NEET competitive exams.
Use concepts from Class 10 + 11 + 12 NCERT combined.
Apply at maximum JEE depth.
JEE Advanced is hard because it COMBINES Class 11 and 12 concepts — not new physics.
FORBIDDEN: Any concept beyond Class 12 NCERT.
FORBIDDEN: University-level physics.`;
    }

    return `Use only NCERT Class ${classLevel} concepts.`;
}
