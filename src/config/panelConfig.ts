// =============================================================================
// panelConfig.ts
// Defines which renderer(s) each concept uses and how they are laid out.
// Single source of truth for the simulation panel system.
// =============================================================================

export type RendererType =
    | 'particle_field'
    | 'graph_interactive'
    | 'circuit_live'
    | 'wave_canvas'
    | 'field_3d'
    | 'mechanics_2d'
    | 'optics_ray'
    | 'thermodynamics';

export type PanelLayout =
    | 'single'
    | 'dual_horizontal'
    | 'dual_vertical';

export interface PanelDefinition {
    renderer: RendererType;
    config_key: string;
    label: string;
}

export interface ConceptPanelConfig {
    concept_id: string;
    layout: PanelLayout;
    primary: PanelDefinition;
    secondary?: PanelDefinition; // only for dual layouts
}

// =============================================================================
// CONCEPT_PANEL_MAP
// Keys match concept_id values from the intent classifier.
// =============================================================================

export const CONCEPT_PANEL_MAP: Record<string, ConceptPanelConfig> = {
    drift_velocity: {
        concept_id: 'drift_velocity',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'drift_velocity',
            label: 'Electron Drift',
        },
    },

    // Ch.3 Current Electricity #2 — Alex pipeline (2026-07-08), same engine
    // family as drift_velocity. The V–I graph is drawn INSIDE the single
    // particle_field canvas (particle_field_config.vi_graph, bottom_corner
    // dock), not a separate graph_interactive panel — single-panel layout,
    // mirrors drift_velocity's registration exactly. Replaces the earlier
    // dual_horizontal placeholder (pre-dated the particle_field vi_graph
    // Phase-A build).
    ohms_law: {
        concept_id: 'ohms_law',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'ohms_law',
            label: 'Ohm’s Law',
        },
    },

    // Ch.3 Current Electricity #3 — Alex pipeline (2026-07-08), same engine
    // family as drift_velocity/ohms_law. Single particle_field canvas (R/rho
    // readouts + thermometer drawn INSIDE it, particle_field_config.states),
    // no separate graph panel — mirrors drift_velocity/ohms_law's registration.
    resistivity: {
        concept_id: 'resistivity',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'resistivity',
            label: 'Resistivity',
        },
    },

    // Ch.3 Current Electricity #4 — Alex pipeline (2026-07-09), same engine
    // family as drift_velocity/ohms_law/resistivity. Dedicated circuit
    // scenario (battery + wire loop + resistor boxes + junction + ammeters)
    // drawn INSIDE the single particle_field canvas — mirrors the three
    // siblings' registration exactly.
    combination_of_resistors: {
        concept_id: 'combination_of_resistors',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'combination_of_resistors',
            label: 'Combination of Resistors',
        },
    },

    // Ch.3 Current Electricity #5 — Alex pipeline (2026-07-10), same engine
    // family as combination_of_resistors. New circuit scenario (charge-pump
    // cell + potential ladder + terminal voltmeter) teaching emf = W/q.
    // Diamond 1 of the two-diamond emf / internal-resistance split.
    emf_definition: {
        concept_id: 'emf_definition',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'emf_definition',
            label: 'EMF — Energy per Charge',
        },
    },

    // Ch.3 Current Electricity #6 — Alex pipeline (2026-07-10). Diamond 2 of the
    // emf / internal-resistance split: reveals the hidden r inside the emf_definition
    // cell (V = ε − ir droop, short circuit, two-reading r measurement, charging).
    internal_resistance: {
        concept_id: 'internal_resistance',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'internal_resistance',
            label: 'Internal Resistance — the Hidden r',
        },
    },

    // Ch.3 Current Electricity #7 — Alex pipeline (2026-07-10), same engine
    // family as the six particle_field siblings. New "electric_power" circuit
    // scenario: glowing rated bulbs whose brightness IS live power, reusing
    // the shared circuit-family engine (wire loop / topology / switch /
    // ammeter). PRIMARY aha: series->parallel brightness flip on two rated
    // bulbs (P=I²R vs P=V²/R).
    electrical_power_in_resistor: {
        concept_id: 'electrical_power_in_resistor',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'electrical_power_in_resistor',
            label: 'Electrical Power — P = VI = I²R = V²/R',
        },
    },

    // Ch.3 Current Electricity #8 — Alex pipeline (2026-07-11), same engine
    // family as the seven particle_field siblings. Reuses the
    // combination_of_resistors scenario_type as the renderer selector, but
    // rides NEW per-state flags added to the circuit engine (per-state
    // R1/R2/R3 locks, three_branch, kcl_sum_readout, ghost_text). Teaches
    // Sigma i_in = Sigma i_out (KCL) via the SAME two-branch junction: equal
    // split -> PRIMARY aha unequal-conductance split (still sums) ->
    // generalization to any junction.
    kirchhoff_junction_rule_KCL: {
        concept_id: 'kirchhoff_junction_rule_KCL',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'kirchhoff_junction_rule_KCL',
            label: "Kirchhoff's Junction Rule — Σi_in = Σi_out",
        },
    },

    // Ch.3 Current Electricity #9 — Alex pipeline (2026-07-12), sibling of
    // kirchhoff_junction_rule_KCL, same engine family as the eight particle_field
    // siblings. Reuses the emf_definition scenario_type as the renderer selector,
    // riding NEW per-state flags added to the emf-family circuit engine
    // (kvl_multi_ladder, show_element_voltmeters, kvl_sum_readout, ghost_text
    // wiring, r2_autosweep/r3_draw_in cues, show_hl_tags — see the JSON's
    // source_book for the exact engine-gap list). Teaches ΣV = 0 (KVL) via a
    // single series loop: round trip = 0 -> quantitative rise=drops -> PRIMARY
    // aha signed sum (no leftover) -> generalization to any loop.
    kirchhoff_loop_rule_KVL: {
        concept_id: 'kirchhoff_loop_rule_KVL',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'kirchhoff_loop_rule_KVL',
            label: "Kirchhoff's Loop Rule — ΣV = 0",
        },
    },

    // Ch.3 Current Electricity #10 — Alex pipeline (2026-07-12), first of the
    // founder's lab trio (Wheatstone c20 -> potentiometer c23 -> meter bridge).
    // Reuses the combination_of_resistors scenario_type as the renderer
    // selector, riding a NEW 'bridge' topology + drawGalvanometerC + ratio
    // HUD / node-readout engine additions (see the JSON's source_book for the
    // exact engine-gap list, flagged for peter_parker:renderer_primitives).
    // Was previously routed to the legacy circuit_live placeholder in
    // CONCEPT_RENDERER_MAP — this is the first authoritative panel config.
    wheatstone_bridge: {
        concept_id: 'wheatstone_bridge',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'wheatstone_bridge',
            label: 'Wheatstone Bridge — Balance Condition P/Q = R/S',
        },
    },

    // Ch.3 Current Electricity #11 — Alex pipeline (2026-07-13), second of the
    // founder's lab trio (Wheatstone c20 -> potentiometer c23 -> meter bridge).
    // Reuses the combination_of_resistors scenario_type as the renderer
    // selector, riding a NEW 'wire' topology + sliding jockey + gradient ramp
    // + reused drawGalvanometerC + voltmeter-compare engine additions (see the
    // JSON's source_book for the exact engine-gap list, flagged for
    // peter_parker:renderer_primitives). Was previously routed to the legacy
    // circuit_live placeholder in CONCEPT_RENDERER_MAP — this is the first
    // authoritative panel config. NOT added to PILOT_CONCEPTS (novel 'wire'
    // renderer path -> reviewer-first).
    potentiometer: {
        concept_id: 'potentiometer',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'potentiometer',
            label: 'Potentiometer — Measuring True EMF by Nulling (E = k·l)',
        },
    },

    // Ch.3 Current Electricity #12 — Alex pipeline (2026-07-14), direct sequel of
    // emf_definition + internal_resistance (same charge-pump cell + ladder +
    // terminal voltmeter + r-interior machinery, now MULTIPLIED into 2-3 cells).
    // Reuses the internal_resistance scenario_type as the renderer selector,
    // riding NEW per-state flags on the circuit engine (cell_topology, cell_count,
    // flip_cell2, dock_cell, switch_close_cue, flip_cell, regroup, R_autosweep_down/
    // R_autosweep_to REUSED verbatim, cycle_compare + per-phase fields,
    // compare_readout/compare_chip/compare_grid, ghost_text, glow keys cells/ammeter
    // — engine additions authored-but-not-yet-implemented as of 2026-07-14,
    // flagged for peter_parker:renderer_primitives via quality_auditor). NOT added
    // to PCPL_CONCEPTS (parametric_renderer only). NOT added to PILOT_CONCEPTS
    // (novel multi-cell engine path -> reviewer-first, potentiometer precedent).
    combination_of_cells: {
        concept_id: 'combination_of_cells',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'combination_of_cells',
            label: 'Combination of Cells — Series Adds, Parallel Shares',
        },
    },

    // Ch.3 Current Electricity #13 — Alex pipeline (2026-07-20), FINALE of the
    // founder's lab trio (Wheatstone c20 -> potentiometer c23 -> meter bridge).
    // Reuses the combination_of_resistors scenario_type as the renderer
    // selector, riding a NEW 'meter_bridge' topology (joining wheatstone's
    // 'bridge' diamond with potentiometer's 'wire' + sliding jockey) + reused
    // drawGalvanometerC + NEW segment-ratio highlight + error-band engine
    // additions (see the JSON's source_book for the exact engine-gap list,
    // flagged for peter_parker:renderer_primitives). 'meter_bridge' previously
    // existed only as a placeholder concept_id routed to the legacy
    // circuit_live renderer (see CONCEPT_RENDERER_MAP) — this is the first
    // authoritative panel config, replacing that placeholder exactly as
    // wheatstone_bridge and potentiometer each did on their own prior slot.
    meter_bridge: {
        concept_id: 'meter_bridge',
        layout: 'single',
        primary: {
            renderer: 'particle_field',
            config_key: 'meter_bridge',
            label: 'Meter Bridge — Finding an Unknown Resistance by Nulling on a Slide Wire',
        },
    },

    wave_superposition: {
        concept_id: 'wave_superposition',
        layout: 'single',
        primary: {
            renderer: 'wave_canvas',
            config_key: 'wave_superposition_canvas',
            label: 'Wave Animation',
        },
    },

    standing_waves: {
        concept_id: 'standing_waves',
        layout: 'single',
        primary: {
            renderer: 'wave_canvas',
            config_key: 'standing_waves_canvas',
            label: 'Standing Wave',
        },
    },

    beats_waves: {
        concept_id: 'beats_waves',
        layout: 'single',
        primary: {
            renderer: 'wave_canvas',
            config_key: 'beats_waves_canvas',
            label: 'Beat Pattern',
        },
    },

    doppler_effect: {
        concept_id: 'doppler_effect',
        layout: 'single',
        primary: {
            renderer: 'wave_canvas',
            config_key: 'doppler_effect_canvas',
            label: 'Doppler Effect',
        },
    },

    sound_waves: {
        concept_id: 'sound_waves',
        layout: 'single',
        primary: {
            renderer: 'wave_canvas',
            config_key: 'sound_waves_canvas',
            label: 'Sound Wave',
        },
    },

    wave_on_string: {
        concept_id: 'wave_on_string',
        layout: 'single',
        primary: {
            renderer: 'wave_canvas',
            config_key: 'wave_on_string_canvas',
            label: 'Wave on String',
        },
    },

    photoelectric: {
        concept_id: 'photoelectric',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'particle_field',
            config_key: 'photoelectric_sim',
            label: 'Photoelectric Setup',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'photoelectric_graph',
            label: 'KE vs Frequency',
        },
    },

    coulombs_law: {
        concept_id: 'coulombs_law',
        // Rebuilt 2026-06-23 as a single-panel field_3d diamond (the old
        // dual particle_field + graph_interactive panels were OLD architecture,
        // never a finished product). New scenario coulombs_law_force.
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'coulombs_law',
            label: 'Coulomb Force Between Two Charges (3D)',
        },
    },

    electric_power_heating: {
        concept_id: 'electric_power_heating',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'particle_field',
            config_key: 'electric_power_heating_sim',
            label: 'Joule Heating',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'electric_power_heating_graph',
            label: 'P vs I² Graph',
        },
    },

    // ── AC Concepts ──────────────────────────────────────────────────────────

    ac_basics: {
        concept_id: 'ac_basics',
        layout: 'single',
        primary: {
            renderer: 'graph_interactive',
            config_key: 'ac_basics_graph',
            label: 'AC Voltage & Current',
        },
    },

    lc_oscillations: {
        concept_id: 'lc_oscillations',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'circuit_live',
            config_key: 'lc_oscillations_circuit',
            label: 'LC Circuit',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'lc_oscillations_graph',
            label: 'Charge & Current vs Time',
        },
    },

    lcr_series_circuit: {
        concept_id: 'lcr_series_circuit',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'circuit_live',
            config_key: 'lcr_series_circuit_circuit',
            label: 'LCR Series Circuit',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'lcr_series_circuit_graph',
            label: 'Impedance vs Frequency',
        },
    },

    resonance_lcr: {
        concept_id: 'resonance_lcr',
        layout: 'single',
        primary: {
            renderer: 'graph_interactive',
            config_key: 'resonance_lcr_graph',
            label: 'Resonance Curve',
        },
    },

    transformer: {
        concept_id: 'transformer',
        layout: 'single',
        primary: {
            renderer: 'circuit_live',
            config_key: 'transformer_circuit',
            label: 'Transformer',
        },
    },

    phasors: {
        concept_id: 'phasors',
        layout: 'single',
        primary: {
            renderer: 'graph_interactive',
            config_key: 'phasors_graph',
            label: 'Phasor Diagram',
        },
    },

    power_in_ac: {
        concept_id: 'power_in_ac',
        layout: 'single',
        primary: {
            renderer: 'graph_interactive',
            config_key: 'power_in_ac_graph',
            label: 'Power vs Phase',
        },
    },

    resistor_in_ac: {
        concept_id: 'resistor_in_ac',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'circuit_live',
            config_key: 'resistor_in_ac_circuit',
            label: 'Resistor in AC',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'resistor_in_ac_graph',
            label: 'V & I vs Time',
        },
    },

    inductor_in_ac: {
        concept_id: 'inductor_in_ac',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'circuit_live',
            config_key: 'inductor_in_ac_circuit',
            label: 'Inductor in AC',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'inductor_in_ac_graph',
            label: 'V & I Phase Lag',
        },
    },

    capacitor_in_ac: {
        concept_id: 'capacitor_in_ac',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'circuit_live',
            config_key: 'capacitor_in_ac_circuit',
            label: 'Capacitor in AC',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'capacitor_in_ac_graph',
            label: 'V & I Phase Lead',
        },
    },

    // ── Mechanics 2D Concepts ───────────────────────────────────────────────

    // Ch.8 — Laws of Motion (Section 8.1)
    field_forces: {
        concept_id: 'field_forces',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'field_forces', label: 'Field Forces' },
        secondary: { renderer: 'graph_interactive', config_key: 'field_forces_graph', label: 'W = mg' },
    },

    contact_forces: {
        concept_id: 'contact_forces',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'contact_forces', label: 'Contact Forces' },
        secondary: { renderer: 'graph_interactive', config_key: 'contact_forces_graph', label: 'F = √(N²+f²)' },
    },

    normal_reaction: {
        concept_id: 'normal_reaction',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'normal_reaction', label: 'Normal Reaction' },
        secondary: { renderer: 'graph_interactive', config_key: 'normal_reaction_graph', label: 'N vs θ' },
    },

    tension_in_string: {
        concept_id: 'tension_in_string',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'tension_in_string', label: 'Tension in String' },
        secondary: { renderer: 'graph_interactive', config_key: 'tension_in_string_graph', label: 'T vs m₂/m₁' },
    },

    hinge_force: {
        concept_id: 'hinge_force',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'hinge_force', label: 'Hinge Force' },
        secondary: { renderer: 'graph_interactive', config_key: 'hinge_force_graph', label: 'H vs V' },
    },

    free_body_diagram: {
        concept_id: 'free_body_diagram',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'free_body_diagram', label: 'Free Body Diagram' },
        secondary: { renderer: 'graph_interactive', config_key: 'fbd_graph', label: 'Force Balance' },
    },

    // Atomic splits from former scalar_vs_vector bundle (Ch.5.1)
    current_not_vector: {
        concept_id: 'current_not_vector',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'current_not_vector', label: 'Why Current Is Not a Vector' },
    },

    parallelogram_law_test: {
        concept_id: 'parallelogram_law_test',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'parallelogram_law_test', label: 'Parallelogram Law Test' },
    },

    // Phase 0 validation demo Sim 1 (Ch.5.4 head-to-tail addition, session 56).
    // First concept that uses the premium primitives (glow_focus + animated_path + sound_cue).
    vector_head_to_tail: {
        concept_id: 'vector_head_to_tail',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'vector_head_to_tail', label: 'Head-to-Tail Vector Addition' },
    },

    // Phase 0 validation demo Sim 2 (Ch.5.4-5.5 Newton II direction, session 59).
    // First concept with full board mode (cumulative renderer + 5-mark scheme).
    newton_second_law_direction: {
        concept_id: 'newton_second_law_direction',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'newton_second_law_direction', label: "Newton's 2nd Law — Direction Matters" },
    },

    pressure_scalar: {
        concept_id: 'pressure_scalar',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'pressure_scalar', label: 'Why Pressure Is Scalar' },
    },

    area_vector: {
        concept_id: 'area_vector',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'area_vector', label: 'Area Vector' },
    },

    // Atomic splits from former vector_basics bundle (Ch.5.2)
    unit_vector: {
        concept_id: 'unit_vector',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'unit_vector', label: 'Unit Vector' },
    },

    angle_between_vectors: {
        concept_id: 'angle_between_vectors',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'angle_between_vectors', label: 'Angle Between Vectors' },
    },

    scalar_multiplication: {
        concept_id: 'scalar_multiplication',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'scalar_multiplication', label: 'Scalar Multiplication' },
    },

    negative_vector: {
        concept_id: 'negative_vector',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'negative_vector', label: 'Negative Vector' },
    },

    equal_vs_parallel: {
        concept_id: 'equal_vs_parallel',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'equal_vs_parallel', label: 'Equal vs Parallel Vectors' },
    },

    // Atomic splits from former vector_addition bundle (Ch.5.2)
    resultant_formula: {
        concept_id: 'resultant_formula',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'resultant_formula', label: 'Resultant Formula' },
    },

    special_cases: {
        concept_id: 'special_cases',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'special_cases', label: 'Special Angle Cases' },
    },

    range_inequality: {
        concept_id: 'range_inequality',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'range_inequality', label: 'Range of Resultant' },
    },

    direction_of_resultant: {
        concept_id: 'direction_of_resultant',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'direction_of_resultant', label: 'Direction of Resultant' },
    },

    // Atomic splits from former vector_components bundle (Ch.5.3)
    unit_vector_form: {
        concept_id: 'unit_vector_form',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'unit_vector_form', label: 'i-hat, j-hat, k-hat Form' },
    },

    inclined_plane_components: {
        concept_id: 'inclined_plane_components',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'inclined_plane_components', label: 'Inclined-Plane Components' },
    },

    negative_components: {
        concept_id: 'negative_components',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'negative_components', label: 'Negative Components' },
    },

    // Skeleton — Architect-authored vector_resolution.json content pending.
    // Teaches how to resolve any vector along any axis (world, along-surface, custom angle).
    vector_resolution: {
        concept_id: 'vector_resolution',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'vector_resolution', label: 'Resolving Vectors' },
        secondary: { renderer: 'graph_interactive', config_key: 'vector_resolution_graph', label: 'Component vs θ' },
    },

    dot_product: {
        concept_id: 'dot_product',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'dot_product', label: 'Dot Product' },
        secondary: { renderer: 'graph_interactive', config_key: 'dot_product_graph', label: 'A·B vs θ' },
    },

    // Atomic splits from former distance_vs_displacement bundle (Ch.6.1-6.5)
    distance_displacement_basics: {
        concept_id: 'distance_displacement_basics',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'distance_displacement_basics', label: 'Distance vs Displacement' },
    },

    average_speed_velocity: {
        concept_id: 'average_speed_velocity',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'average_speed_velocity', label: 'Average Speed vs Velocity' },
    },

    instantaneous_velocity: {
        concept_id: 'instantaneous_velocity',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'instantaneous_velocity', label: 'Instantaneous Velocity' },
    },

    sign_convention: {
        concept_id: 'sign_convention',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'sign_convention', label: 'Sign Convention (1D)' },
    },

    s_in_equations: {
        concept_id: 's_in_equations',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 's_in_equations', label: "'s' in Equations = Displacement" },
    },

    // Atomic splits from former uniform_acceleration bundle (Ch.6.6-6.9)
    three_cases: {
        concept_id: 'three_cases',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'three_cases', label: 'Three Kinematic Cases' },
    },

    free_fall: {
        concept_id: 'free_fall',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'free_fall', label: 'Free Fall' },
    },

    sth_formula: {
        concept_id: 'sth_formula',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'sth_formula', label: 's in n-th Second' },
    },

    negative_time: {
        concept_id: 'negative_time',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'negative_time', label: 'Negative Time Roots' },
    },

    // Atomic splits from former non_uniform_acceleration bundle (Ch.7.1-7.4)
    a_function_of_t: {
        concept_id: 'a_function_of_t',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'a_function_of_t', label: 'a = a(t)' },
    },

    a_function_of_x: {
        concept_id: 'a_function_of_x',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'a_function_of_x', label: 'a = a(x) and v dv/dx' },
    },

    a_function_of_v: {
        concept_id: 'a_function_of_v',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'a_function_of_v', label: 'a = a(v) and Terminal Velocity' },
    },

    initial_conditions: {
        concept_id: 'initial_conditions',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'initial_conditions', label: 'Initial Conditions' },
    },

    // Atomic splits from former motion_graphs bundle (Ch.7.5)
    xt_graph: {
        concept_id: 'xt_graph',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'xt_graph', label: 'Position-Time Graph' },
    },
    vt_graph: {
        concept_id: 'vt_graph',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'vt_graph', label: 'Velocity-Time Graph' },
    },
    at_graph: {
        concept_id: 'at_graph',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'at_graph', label: 'Acceleration-Time Graph' },
    },
    direction_reversal: {
        concept_id: 'direction_reversal',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'direction_reversal', label: 'Direction Reversal' },
    },

    // Atomic splits from former relative_motion bundle (Ch.6.10)
    vab_formula: {
        concept_id: 'vab_formula',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'vab_formula', label: 'V_AB = V_A − V_B' },
    },
    relative_1d_cases: {
        concept_id: 'relative_1d_cases',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'relative_1d_cases', label: 'Same vs Opposite Direction' },
    },
    time_to_meet: {
        concept_id: 'time_to_meet',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'time_to_meet', label: 'Time to Meet' },
    },

    relative_motion_in_2d: {
        concept_id: 'relative_motion_in_2d',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'river_boat_problems', label: 'River Boat Problems' },
        secondary: { renderer: 'graph_interactive', config_key: 'river_boat_problems_graph', label: 'Speed vs Angle' },
    },

    // Atomic splits from former river_boat_problems bundle (Ch.6.11)
    upstream_downstream: {
        concept_id: 'upstream_downstream',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'upstream_downstream', label: 'Upstream vs Downstream' },
    },
    shortest_time_crossing: {
        concept_id: 'shortest_time_crossing',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'shortest_time_crossing', label: 'Shortest-Time Crossing' },
    },
    shortest_path_crossing: {
        concept_id: 'shortest_path_crossing',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'shortest_path_crossing', label: 'Shortest-Path Crossing' },
    },

    // Atomic splits from former rain_umbrella bundle (Ch.6.12)
    apparent_rain_velocity: {
        concept_id: 'apparent_rain_velocity',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'apparent_rain_velocity', label: 'Apparent Rain Velocity' },
    },
    umbrella_tilt_angle: {
        concept_id: 'umbrella_tilt_angle',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'umbrella_tilt_angle', label: 'Umbrella Tilt Angle' },
        secondary: { renderer: 'graph_interactive', config_key: 'umbrella_tilt_angle_graph', label: 'θ vs v_person' },
    },

    // Ch.8.5 Friction (atomic, shipped session 34 — first v2.2-native gold-standard)
    friction_static_kinetic: {
        concept_id: 'friction_static_kinetic',
        layout: 'dual_horizontal',
        primary: { renderer: 'mechanics_2d', config_key: 'friction_static_kinetic', label: 'Static vs Kinetic Friction' },
        secondary: { renderer: 'graph_interactive', config_key: 'friction_static_kinetic_graph', label: 'fs vs F_applied' },
    },

    // Atomic splits from former aircraft_wind_problems bundle (Ch.6.13)
    ground_velocity_vector: {
        concept_id: 'ground_velocity_vector',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'ground_velocity_vector', label: 'Ground Velocity Vector' },
    },
    heading_correction: {
        concept_id: 'heading_correction',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'heading_correction', label: 'Heading Correction Angle' },
    },

    // Atomic splits from former projectile_motion bundle (Ch.7.6)
    time_of_flight: {
        concept_id: 'time_of_flight',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'time_of_flight', label: 'Time of Flight' },
    },
    max_height: {
        concept_id: 'max_height',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'max_height', label: 'Maximum Height' },
    },
    range_formula: {
        concept_id: 'range_formula',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'range_formula', label: 'Range Formula' },
    },

    // Atomic splits from former projectile_inclined bundle (Ch.7.7)
    up_incline_projectile: {
        concept_id: 'up_incline_projectile',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'up_incline_projectile', label: 'Projectile Up Incline' },
    },
    down_incline_projectile: {
        concept_id: 'down_incline_projectile',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'down_incline_projectile', label: 'Projectile Down Incline' },
    },

    // Atomic splits from former relative_motion_projectiles bundle (Ch.7.8)
    two_projectile_meeting: {
        concept_id: 'two_projectile_meeting',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'two_projectile_meeting', label: 'Two Projectiles Meeting' },
    },
    two_projectile_never_meet: {
        concept_id: 'two_projectile_never_meet',
        layout: 'single',
        primary: { renderer: 'mechanics_2d', config_key: 'two_projectile_never_meet', label: 'Two Projectiles Miss' },
    },

    uniform_circular_motion: {
        concept_id: 'uniform_circular_motion',
        layout: 'single',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'uniform_circular_motion',
            label: 'Circular Motion',
        },
    },

    simple_pendulum: {
        concept_id: 'simple_pendulum',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'simple_pendulum_sim',
            label: 'Pendulum Animation',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'simple_pendulum_graph',
            label: 'Displacement vs Time',
        },
    },

    spring_mass_system: {
        concept_id: 'spring_mass_system',
        layout: 'single',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'spring_mass_system',
            label: 'Spring-Mass Oscillation',
        },
    },

    laws_of_motion_friction: {
        concept_id: 'laws_of_motion_friction',
        layout: 'single',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'laws_of_motion_friction',
            label: 'Friction Forces',
        },
    },

    laws_of_motion_atwood: {
        concept_id: 'laws_of_motion_atwood',
        layout: 'single',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'laws_of_motion_atwood',
            label: 'Atwood Machine',
        },
    },

    work_energy_theorem: {
        concept_id: 'work_energy_theorem',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'work_energy_theorem_sim',
            label: 'Forces & Motion',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'work_energy_theorem_graph',
            label: 'Work & Energy Bars',
        },
    },

    conservation_of_momentum: {
        concept_id: 'conservation_of_momentum',
        layout: 'single',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'conservation_of_momentum',
            label: 'Collision Simulation',
        },
    },

    torque_rotation: {
        concept_id: 'torque_rotation',
        layout: 'single',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'torque_rotation',
            label: 'Torque & Rotation',
        },
    },

    circular_motion_banking: {
        concept_id: 'circular_motion_banking',
        layout: 'single',
        primary: {
            renderer: 'mechanics_2d',
            config_key: 'circular_motion_banking',
            label: 'Banking of Roads',
        },
    },

    // ── Optics Ray Concepts ───────────────────────────────────────────────────

    convex_lens: {
        concept_id: 'convex_lens',
        layout: 'single',
        primary: {
            renderer: 'optics_ray',
            config_key: 'convex_lens',
            label: 'Convex Lens',
        },
    },

    concave_lens: {
        concept_id: 'concave_lens',
        layout: 'single',
        primary: {
            renderer: 'optics_ray',
            config_key: 'concave_lens',
            label: 'Concave Lens',
        },
    },

    concave_mirror: {
        concept_id: 'concave_mirror',
        layout: 'single',
        primary: {
            renderer: 'optics_ray',
            config_key: 'concave_mirror',
            label: 'Concave Mirror',
        },
    },

    convex_mirror: {
        concept_id: 'convex_mirror',
        layout: 'single',
        primary: {
            renderer: 'optics_ray',
            config_key: 'convex_mirror',
            label: 'Convex Mirror',
        },
    },

    refraction_snells_law: {
        concept_id: 'refraction_snells_law',
        layout: 'single',
        primary: {
            renderer: 'optics_ray',
            config_key: 'refraction_snells_law',
            label: 'Refraction (Snell\'s Law)',
        },
    },

    total_internal_reflection: {
        concept_id: 'total_internal_reflection',
        layout: 'single',
        primary: {
            renderer: 'optics_ray',
            config_key: 'total_internal_reflection',
            label: 'Total Internal Reflection',
        },
    },

    prism_dispersion: {
        concept_id: 'prism_dispersion',
        layout: 'single',
        primary: {
            renderer: 'optics_ray',
            config_key: 'prism_dispersion',
            label: 'Prism Dispersion',
        },
    },

    // ── Field 3D Concepts ───────────────────────────────────────────────────

    electric_field_lines: {
        concept_id: 'electric_field_lines',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_field_lines',
            label: 'Electric Field Lines (3D)',
        },
    },

    electric_field_point_charge: {
        concept_id: 'electric_field_point_charge',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_field_point_charge',
            label: 'Field of a Point Charge (3D)',
        },
    },

    charge_distribution: {
        concept_id: 'charge_distribution',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'charge_distribution',
            label: 'Charge Densities λ, σ, ρ (3D)',
        },
    },

    electric_field_dipole: {
        concept_id: 'electric_field_dipole',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_field_dipole',
            label: 'Field of an Electric Dipole (3D)',
        },
    },

    electric_dipole_in_field: {
        concept_id: 'electric_dipole_in_field',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_dipole_in_field',
            label: 'Dipole in a Uniform Field (3D)',
        },
    },

    electric_flux: {
        concept_id: 'electric_flux',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_flux',
            label: 'Electric Flux Φ = E·A (3D)',
        },
    },

    gauss_law: {
        concept_id: 'gauss_law',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'gauss_law',
            label: "Gauss's Law Φ = q/ε₀ (3D)",
        },
    },

    gauss_law_sphere: {
        concept_id: 'gauss_law_sphere',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'gauss_law_sphere',
            label: 'Charged Shell: E=0 inside, kq/r² outside (3D)',
        },
    },

    gauss_law_solid_sphere: {
        concept_id: 'gauss_law_solid_sphere',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'gauss_law_solid_sphere',
            label: 'Solid Charged Sphere: E∝r inside, peak at R, kq/r² outside (3D)',
        },
    },

    gauss_law_line: {
        concept_id: 'gauss_law_line',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'gauss_law_line',
            label: "Gauss's Law — Infinite Line Charge: E = λ/(2πε₀r) (3D)",
        },
    },

    gauss_law_sheet: {
        concept_id: 'gauss_law_sheet',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'gauss_law_sheet',
            label: "Gauss's Law — Infinite Charged Sheet: E = σ/2ε₀ (3D)",
        },
    },

    // Ch.2 — Electrostatic Potential and Capacitance (§2.1-2.2). The MEANING
    // diamond: V = W/q (work per unit charge from infinity), path-independence,
    // U vs V, V(∞)=0 + ΔV, V is a scalar (equipotential shells) vs E the ⊥ arrow.
    // Stops short of V = kQ/r (sibling electric_potential_point_charge).
    electric_potential_meaning: {
        concept_id: 'electric_potential_meaning',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_potential_meaning',
            label: 'Electric Potential — V = W/q (3D)',
        },
    },

    // Ch.2 — Electrostatic Potential and Capacitance (§2.2). The point-charge
    // FORMULA diamond: V = kQ/r and its 1/r falloff (one power of r, gentler
    // than the field's 1/r²). Declares electric_potential_meaning (what V MEANS,
    // V = W/q) as a prerequisite; does NOT re-teach it, and stops short of
    // superposition / E = −dV/dr / capacitance.
    electric_potential_point_charge: {
        concept_id: 'electric_potential_point_charge',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_potential_point_charge',
            label: 'Potential of a Point Charge — V = kQ/r (3D)',
        },
    },

    // Ch.2 — Electrostatic Potential and Capacitance (§2.7). The GEOMETRY
    // diamond: an equipotential surface is the locus of all points at one
    // common V — concentric spheres for a point charge, E ⟂ surface, zero work
    // along (W = F·d·cos90° = 0), spacing↔field-strength (crowded = strong).
    // Declares electric_potential_meaning (V = W/q), electric_potential_point_charge
    // (V = kQ/r) and electric_field_point_charge (E = kQ/r²) as prerequisites;
    // does NOT re-teach them, and stops short of the value V = kQ/r, dipole /
    // uniform-field equipotentials, and conductors / capacitance.
    equipotential_surfaces: {
        concept_id: 'equipotential_surfaces',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'equipotential_surfaces',
            label: 'Equipotential Surfaces of a Point Charge (3D)',
        },
    },

    // Ch.2 — Electrostatic Potential and Capacitance (§2.4). The dipole
    // POTENTIAL diamond: V = kp cosθ/r² (the scalar sum of the two charge
    // potentials) — sign follows cos θ (position), V = 0 across the WHOLE
    // equatorial plane (but E ≠ 0 there), and V falls as 1/r² (steeper than a
    // point charge's 1/r). Declares electric_potential_point_charge (V = kQ/r),
    // electric_potential_meaning (V = W/q) and electric_field_dipole (the FIELD)
    // as prerequisites; does NOT re-teach them, and stops short of capacitance.
    electric_potential_dipole: {
        concept_id: 'electric_potential_dipole',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_potential_dipole',
            label: 'Potential of a Dipole — V = kp cosθ/r² (3D)',
        },
    },

    // Potential of a SYSTEM of charges — the scalar-superposition diamond
    // (Class 12 Ch.2 §2.5). The total potential at a point is V = Σ k qᵢ/rᵢ,
    // a plain SCALAR sum of each charge's signed contribution: every charge
    // counts (distance shrinks a term but never zeroes it), an equal +q/−q
    // equidistant pair cancels exactly, and — the aha — the FIELD at the same
    // point needs vector addition while V is one easy scalar sum. Declares
    // electric_potential_point_charge (V = kQ/r), electric_potential_dipole
    // (the two-charge sum) and electric_potential_meaning (V = W/q) as
    // prerequisites; does NOT re-teach them, and stops short of capacitance.
    electric_potential_system_of_charges: {
        concept_id: 'electric_potential_system_of_charges',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_potential_system_of_charges',
            label: 'Potential of a System of Charges — V = Σ k qᵢ/rᵢ (3D)',
        },
    },

    // Potential ENERGY of a system of charges — the energy companion to the
    // electric_potential_system_of_charges (V) diamond. U = Σ k qᵢqⱼ/rᵢⱼ over every
    // unique pair: charges fly in from infinity, pairwise energy bonds light up, a
    // signed meter banks +U (stored) / −U (released). Declares
    // electric_potential_system_of_charges, coulombs_law and electric_potential_meaning
    // as prerequisites; does NOT re-teach them, and stops short of capacitor energy.
    potential_energy_system_of_charges: {
        concept_id: 'potential_energy_system_of_charges',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'potential_energy_system_of_charges',
            label: 'Potential Energy of a System of Charges — U = Σ k qᵢqⱼ/rᵢⱼ (3D)',
        },
    },
    // Potential energy in an EXTERNAL field (Class 12 Ch.2 §2.8). U = qV for a
    // charge sampling a GIVEN external potential, U = q₁V₁+q₂V₂ for a system, and
    // U = −p·E for a dipole (two qV terms collapsed). DISTINCT from the mutual PE
    // kq₁q₂/r of potential_energy_system_of_charges (contrasted in STATE_5).
    potential_energy_in_external_field: {
        concept_id: 'potential_energy_in_external_field',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'potential_energy_in_external_field',
            label: 'Potential Energy in an External Field — U = qV, U = −p·E (3D)',
        },
    },

    force_on_charge_in_field: {
        concept_id: 'force_on_charge_in_field',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'force_on_charge_in_field',
            label: 'Force on a Charge — F = qE (3D)',
        },
    },

    electric_potential_3d: {
        concept_id: 'electric_potential_3d',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'field_3d',
            config_key: 'electric_potential_3d_field',
            label: 'Potential & Field (3D)',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'electric_potential_3d_graph',
            label: 'V vs Distance',
        },
    },

    parallel_plate_capacitor_field: {
        concept_id: 'parallel_plate_capacitor_field',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'parallel_plate_capacitor_field',
            label: 'Capacitor Field (3D)',
        },
    },

    magnetic_field_solenoid: {
        concept_id: 'magnetic_field_solenoid',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_field_solenoid',
            label: 'Solenoid Field (3D)',
        },
    },

    magnetic_field_concept_B: {
        concept_id: 'magnetic_field_concept_B',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_field_concept_B',
            label: 'What Is a Magnetic Field? (3D)',
        },
    },

    magnetic_field_wire: {
        concept_id: 'magnetic_field_wire',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_field_wire',
            label: 'Wire Field (3D)',
        },
    },

    biot_savart_law: {
        concept_id: 'biot_savart_law',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'biot_savart_law',
            label: 'Biot-Savart (3D)',
        },
    },

    magnetic_field_circular_loop: {
        concept_id: 'magnetic_field_circular_loop',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_field_circular_loop',
            label: 'Field of a Circular Loop — B = μ₀NI/2R (3D)',
        },
    },

    moving_coil_galvanometer: {
        concept_id: 'moving_coil_galvanometer',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'moving_coil_galvanometer',
            label: 'Moving Coil Galvanometer — φ = (NAB/k)·I (3D)',
        },
    },

    galvanometer_to_ammeter_voltmeter: {
        concept_id: 'galvanometer_to_ammeter_voltmeter',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'galvanometer_to_ammeter_voltmeter',
            label: 'Galvanometer → Ammeter & Voltmeter — shunt / series R (3D)',
        },
    },

    bar_magnet_as_dipole: {
        concept_id: 'bar_magnet_as_dipole',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'bar_magnet_as_dipole',
            label: 'The Bar Magnet as a Magnetic Dipole — closed-loop field, 1/r³ (3D)',
        },
    },

    bar_magnet_in_uniform_field: {
        concept_id: 'bar_magnet_in_uniform_field',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'bar_magnet_in_uniform_field',
            label: 'Bar Magnet in a Uniform Field — τ = m×B, U = −m·B, T = 2π√(I/mB) (3D)',
        },
    },

    gauss_law_magnetism: {
        concept_id: 'gauss_law_magnetism',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'gauss_law_magnetism',
            label: "Gauss's Law for Magnetism — ∮B·dA = 0, no monopole, closed loops (3D)",
        },
    },

    earths_magnetism: {
        concept_id: 'earths_magnetism',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'earths_magnetism',
            label: "Earth's Magnetism — tilted dipole, declination D, dip I, B = √(H²+V²) (3D)",
        },
    },

    magnetisation_and_intensity: {
        concept_id: 'magnetisation_and_intensity',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetisation_and_intensity',
            label: 'Magnetisation & Magnetic Intensity — H = nI, M = χH, B = μ₀(H+M) (3D)',
        },
    },

    faraday_law_induction: {
        concept_id: 'faraday_law_induction',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'faraday_law_induction',
            label: 'Faraday\'s Law of Induction — ε = −N dΦ/dt (3D)',
        },
    },

    magnetic_flux: {
        concept_id: 'magnetic_flux',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_flux',
            label: 'Magnetic Flux — Φ = B·A·cosθ (3D)',
        },
    },

    motional_emf: {
        concept_id: 'motional_emf',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'motional_emf',
            label: 'Motional EMF — ε = Bvl (3D)',
        },
    },

    eddy_currents: {
        concept_id: 'eddy_currents',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'eddy_currents',
            label: 'Eddy Currents — Lenz\'s law inside a bulk conductor (3D)',
        },
    },

    inductance: {
        concept_id: 'inductance',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'inductance',
            label: 'Inductance — Self & Mutual (ε_L = −L·dI/dt, ε₂ = −M·dI₁/dt) (3D)',
        },
    },

    ac_generator: {
        concept_id: 'ac_generator',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'ac_generator',
            label: 'AC Generator — ε = NBAω·sin(ωt) (3D)',
        },
    },

    amperes_circuital_law: {
        concept_id: 'amperes_circuital_law',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'amperes_circuital_law',
            label: "Ampère's Law: B = μ₀I/2πr (3D)",
        },
    },

    magnetic_force_moving_charge: {
        concept_id: 'magnetic_force_moving_charge',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_force_moving_charge',
            label: 'Lorentz Force (3D)',
        },
    },

    magnetic_force_direction_right_hand_rule: {
        concept_id: 'magnetic_force_direction_right_hand_rule',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_force_direction_right_hand_rule',
            label: 'Right-Hand Rule for F = q v × B (3D)',
        },
    },

    magnetic_force_perpendicular_no_work: {
        concept_id: 'magnetic_force_perpendicular_no_work',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_force_perpendicular_no_work',
            label: 'Magnetic Force Does No Work (3D)',
        },
    },

    circular_motion_charge_in_uniform_B: {
        concept_id: 'circular_motion_charge_in_uniform_B',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'circular_motion_charge_in_uniform_B',
            label: 'Circle Radius r = mv/qB (3D)',
        },
    },

    helical_motion_charge_in_uniform_B: {
        concept_id: 'helical_motion_charge_in_uniform_B',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'helical_motion_charge_in_uniform_B',
            label: 'Helix & Pitch p = v‖·T (3D)',
        },
    },

    cyclotron_period_independent_of_speed: {
        concept_id: 'cyclotron_period_independent_of_speed',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'cyclotron_period_independent_of_speed',
            label: 'Lap Time T = 2πm/qB (3D)',
        },
    },

    torque_on_current_loop_in_field: {
        concept_id: 'torque_on_current_loop_in_field',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'torque_on_current_loop_in_field',
            label: 'Torque on Loop (3D)',
        },
    },

    current_loop_acts_as_dipole: {
        concept_id: 'current_loop_acts_as_dipole',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'current_loop_acts_as_dipole',
            label: 'Loop as a Magnetic Dipole (3D)',
        },
    },

    parallel_currents_force: {
        concept_id: 'parallel_currents_force',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'parallel_currents_force',
            label: 'Force Between Parallel Currents (3D)',
        },
    },

    force_on_current_carrying_wire: {
        concept_id: 'force_on_current_carrying_wire',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'force_on_current_carrying_wire',
            label: 'Force on Wire (3D)',
        },
    },

    gauss_law_3d: {
        concept_id: 'gauss_law_3d',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'gauss_law_3d',
            label: "Gauss's Law (3D)",
        },
    },

    electromagnetic_induction_3d: {
        concept_id: 'electromagnetic_induction_3d',
        layout: 'dual_horizontal',
        primary: {
            renderer: 'field_3d',
            config_key: 'electromagnetic_induction_3d_field',
            label: 'Induction (3D)',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'electromagnetic_induction_3d_graph',
            label: 'EMF vs Time',
        },
    },

    bar_magnet_field: {
        concept_id: 'bar_magnet_field',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'bar_magnet_field',
            label: 'Bar Magnet Field (3D)',
        },
    },

    // ── Thermodynamics Concepts ───────────────────────────────────────────────

    first_law_thermodynamics: {
        concept_id: 'first_law_thermodynamics',
        layout: 'single',
        primary: {
            renderer: 'thermodynamics',
            config_key: 'first_law_thermodynamics',
            label: 'First Law — Q = ΔU + W',
        },
    },

    isothermal_process: {
        concept_id: 'isothermal_process',
        layout: 'single',
        primary: {
            renderer: 'thermodynamics',
            config_key: 'isothermal_process',
            label: 'Isothermal Process',
        },
    },

    adiabatic_process: {
        concept_id: 'adiabatic_process',
        layout: 'single',
        primary: {
            renderer: 'thermodynamics',
            config_key: 'adiabatic_process',
            label: 'Adiabatic Process',
        },
    },

    carnot_engine: {
        concept_id: 'carnot_engine',
        layout: 'single',
        primary: {
            renderer: 'thermodynamics',
            config_key: 'carnot_engine',
            label: 'Carnot Engine',
        },
    },

    ideal_gas_kinetic_theory: {
        concept_id: 'ideal_gas_kinetic_theory',
        layout: 'single',
        primary: {
            renderer: 'thermodynamics',
            config_key: 'ideal_gas_kinetic_theory',
            label: 'Kinetic Theory of Gases',
        },
    },
};

// =============================================================================
// getPanelConfig
// Returns the ConceptPanelConfig for a given concept_id.
// Throws a descriptive error if the concept is not registered.
// =============================================================================

export function getPanelConfig(concept_id: string): ConceptPanelConfig | null {
    // 1. Exact match
    if (CONCEPT_PANEL_MAP[concept_id]) return CONCEPT_PANEL_MAP[concept_id];
    // 2. Partial match — e.g. "ohms_law_basic" contains key "ohms_law"
    for (const [key, config] of Object.entries(CONCEPT_PANEL_MAP)) {
        if (concept_id.includes(key)) return config;
    }
    return null;
}
