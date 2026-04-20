// =============================================================================
// conceptMap.ts
// Single source of truth for all physics concepts supported by PhysicsMind.
// Each entry declares display metadata and the panel layout for its simulation.
// =============================================================================

import type { ConceptPanelConfig } from '@/config/panelConfig';

export interface ConceptMapEntry {
    concept_id: string;
    display_name: string;
    chapter: string;
    class_level: 11 | 12;
    panels: ConceptPanelConfig;
}

// =============================================================================
// CONCEPT_MAP
// Keys match concept_id values from the intent classifier.
// =============================================================================

export const CONCEPT_MAP: Record<string, ConceptMapEntry> = {

    // ── Current Electricity (Class 12) ────────────────────────────────────────

    drift_velocity: {
        concept_id: 'drift_velocity',
        display_name: 'Drift Velocity',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'drift_velocity',
            layout: 'single',
            primary: {
                renderer: 'particle_field',
                config_key: 'drift_velocity',
                label: 'Electron Drift',
            },
        },
    },

    ohms_law: {
        concept_id: 'ohms_law',
        display_name: "Ohm's Law",
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'ohms_law',
            layout: 'dual_horizontal',
            primary: {
                renderer: 'particle_field',
                config_key: 'ohms_law_microscopic',
                label: 'Microscopic View',
            },
            secondary: {
                renderer: 'graph_interactive',
                config_key: 'ohms_law_graph',
                label: 'V–I Graph',
            },
        },
    },

    resistivity: {
        concept_id: 'resistivity',
        display_name: 'Resistivity',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'resistivity',
            layout: 'dual_horizontal',
            primary: {
                renderer: 'particle_field',
                config_key: 'resistivity_microscopic',
                label: 'Conductor View',
            },
            secondary: {
                renderer: 'graph_interactive',
                config_key: 'resistivity_graph',
                label: 'ρ vs Temperature',
            },
        },
    },

    emf_internal_resistance: {
        concept_id: 'emf_internal_resistance',
        display_name: 'EMF & Internal Resistance',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'emf_internal_resistance',
            layout: 'single',
            primary: {
                renderer: 'circuit_live',
                config_key: 'emf_internal_resistance',
                label: 'Cell Circuit',
            },
        },
    },

    kirchhoffs_laws: {
        concept_id: 'kirchhoffs_laws',
        display_name: "Kirchhoff's Laws",
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'kirchhoffs_laws',
            layout: 'single',
            primary: {
                renderer: 'circuit_live',
                config_key: 'kirchhoffs_laws',
                label: 'Junction & Loop',
            },
        },
    },

    series_parallel_resistance: {
        concept_id: 'series_parallel_resistance',
        display_name: 'Series & Parallel Resistance',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'series_parallel_resistance',
            layout: 'single',
            primary: {
                renderer: 'circuit_live',
                config_key: 'series_parallel_resistance',
                label: 'Resistor Network',
            },
        },
    },

    wheatstone_bridge: {
        concept_id: 'wheatstone_bridge',
        display_name: 'Wheatstone Bridge',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'wheatstone_bridge',
            layout: 'single',
            primary: {
                renderer: 'circuit_live',
                config_key: 'wheatstone_bridge',
                label: 'Bridge Circuit',
            },
        },
    },

    meter_bridge: {
        concept_id: 'meter_bridge',
        display_name: 'Meter Bridge',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'meter_bridge',
            layout: 'single',
            primary: {
                renderer: 'circuit_live',
                config_key: 'meter_bridge',
                label: 'Meter Bridge',
            },
        },
    },

    potentiometer: {
        concept_id: 'potentiometer',
        display_name: 'Potentiometer',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'potentiometer',
            layout: 'single',
            primary: {
                renderer: 'circuit_live',
                config_key: 'potentiometer',
                label: 'Potentiometer Wire',
            },
        },
    },

    electric_power_heating: {
        concept_id: 'electric_power_heating',
        display_name: 'Electric Power & Heating',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'electric_power_heating',
            layout: 'dual_horizontal',
            primary: {
                renderer: 'circuit_live',
                config_key: 'electric_power_circuit',
                label: 'Power Circuit',
            },
            secondary: {
                renderer: 'graph_interactive',
                config_key: 'electric_power_graph',
                label: 'P vs I Graph',
            },
        },
    },

    electric_current: {
        concept_id: 'electric_current',
        display_name: 'Electric Current',
        chapter: 'Current Electricity',
        class_level: 12,
        panels: {
            concept_id: 'electric_current',
            layout: 'single',
            primary: {
                renderer: 'particle_field',
                config_key: 'electric_current',
                label: 'Charge Flow',
            },
        },
    },

    // ── Electrostatics (Class 12) ─────────────────────────────────────────────

    coulombs_law: {
        concept_id: 'coulombs_law',
        display_name: "Coulomb's Law",
        chapter: 'Electric Charges and Fields',
        class_level: 12,
        panels: {
            concept_id: 'coulombs_law',
            layout: 'single',
            primary: {
                renderer: 'field_3d',
                config_key: 'coulombs_law',
                label: 'Force Field',
            },
        },
    },

    electric_field_lines: {
        concept_id: 'electric_field_lines',
        display_name: 'Electric Field Lines',
        chapter: 'Electric Charges and Fields',
        class_level: 12,
        panels: {
            concept_id: 'electric_field_lines',
            layout: 'single',
            primary: {
                renderer: 'field_3d',
                config_key: 'electric_field_lines',
                label: 'Field Lines',
            },
        },
    },

    capacitors: {
        concept_id: 'capacitors',
        display_name: 'Capacitors',
        chapter: 'Electrostatic Potential and Capacitance',
        class_level: 12,
        panels: {
            concept_id: 'capacitors',
            layout: 'dual_horizontal',
            primary: {
                renderer: 'circuit_live',
                config_key: 'capacitor_circuit',
                label: 'Capacitor Circuit',
            },
            secondary: {
                renderer: 'graph_interactive',
                config_key: 'capacitor_graph',
                label: 'Q vs V Graph',
            },
        },
    },

    // ── Magnetism (Class 12) ──────────────────────────────────────────────────

    magnetic_field: {
        concept_id: 'magnetic_field',
        display_name: 'Magnetic Field',
        chapter: 'Moving Charges and Magnetism',
        class_level: 12,
        panels: {
            concept_id: 'magnetic_field',
            layout: 'single',
            primary: {
                renderer: 'field_3d',
                config_key: 'magnetic_field',
                label: 'Magnetic Field Lines',
            },
        },
    },

    // ── Waves (Class 11) ──────────────────────────────────────────────────────

    wave_superposition: {
        concept_id: 'wave_superposition',
        display_name: 'Wave Superposition',
        chapter: 'Waves',
        class_level: 11,
        panels: {
            concept_id: 'wave_superposition',
            layout: 'dual_horizontal',
            primary: {
                renderer: 'wave_canvas',
                config_key: 'wave_superposition_canvas',
                label: 'Wave Animation',
            },
            secondary: {
                renderer: 'graph_interactive',
                config_key: 'wave_superposition_graph',
                label: 'Displacement Graph',
            },
        },
    },

    // ── Mechanics (Class 11) ──────────────────────────────────────────────────

    simple_harmonic_motion: {
        concept_id: 'simple_harmonic_motion',
        display_name: 'Simple Harmonic Motion',
        chapter: 'Oscillations',
        class_level: 11,
        panels: {
            concept_id: 'simple_harmonic_motion',
            layout: 'dual_horizontal',
            primary: {
                renderer: 'mechanics_2d',
                config_key: 'shm_animation',
                label: 'SHM Motion',
            },
            secondary: {
                renderer: 'graph_interactive',
                config_key: 'shm_graph',
                label: 'x–t / v–t Graph',
            },
        },
    },

    // ── Modern Physics (Class 12) ─────────────────────────────────────────────

    photoelectric_effect: {
        concept_id: 'photoelectric_effect',
        display_name: 'Photoelectric Effect',
        chapter: 'Dual Nature of Radiation and Matter',
        class_level: 12,
        panels: {
            concept_id: 'photoelectric_effect',
            layout: 'dual_horizontal',
            primary: {
                renderer: 'graph_interactive',
                config_key: 'photoelectric_graph',
                label: 'I vs V Graph',
            },
            secondary: {
                renderer: 'particle_field',
                config_key: 'photoelectric_photons',
                label: 'Photon Emission',
            },
        },
    },

    bohr_model: {
        concept_id: 'bohr_model',
        display_name: 'Bohr Model of the Atom',
        chapter: 'Atoms',
        class_level: 12,
        panels: {
            concept_id: 'bohr_model',
            layout: 'single',
            primary: {
                renderer: 'field_3d',
                config_key: 'bohr_model',
                label: 'Atomic Orbits',
            },
        },
    },

    // ── Optics (Class 12) ─────────────────────────────────────────────────────

    refraction: {
        concept_id: 'refraction',
        display_name: 'Refraction of Light',
        chapter: 'Ray Optics and Optical Instruments',
        class_level: 12,
        panels: {
            concept_id: 'refraction',
            layout: 'single',
            primary: {
                renderer: 'wave_canvas',
                config_key: 'refraction',
                label: 'Ray Diagram',
            },
        },
    },
};

// =============================================================================
// getConceptEntry
// Returns the ConceptMapEntry for a given concept_id.
// Returns null (not throws) so callers can fall back gracefully.
// =============================================================================

export function getConceptEntry(concept_id: string): ConceptMapEntry | null {
    // 1. Exact match
    if (CONCEPT_MAP[concept_id]) return CONCEPT_MAP[concept_id];
    // 2. Partial match — e.g. "ohms_law_basic" contains key "ohms_law"
    for (const [key, entry] of Object.entries(CONCEPT_MAP)) {
        if (concept_id.includes(key)) return entry;
    }
    return null;
}
