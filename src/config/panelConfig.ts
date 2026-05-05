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

    ohms_law: {
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
        layout: 'dual_horizontal',
        primary: {
            renderer: 'particle_field',
            config_key: 'coulombs_law_sim',
            label: 'Force Between Charges',
        },
        secondary: {
            renderer: 'graph_interactive',
            config_key: 'coulombs_law_graph',
            label: 'Force vs Distance',
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

    magnetic_field_wire: {
        concept_id: 'magnetic_field_wire',
        layout: 'single',
        primary: {
            renderer: 'field_3d',
            config_key: 'magnetic_field_wire',
            label: 'Wire Field (3D)',
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
