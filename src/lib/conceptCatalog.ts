import 'server-only';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CONCEPT_PANEL_MAP } from '@/config/panelConfig';
import type { ClassLevel } from '@/types/student';

export type ConceptStatus = 'live' | 'ghost';
export type CardType = 'atomic' | 'nano';

export interface NanoDef {
    id: string;
    name: string;
    one_line: string;
    diagram_primitive?: string;
}

export interface CatalogConcept {
    concept_id: string;
    concept_name: string;
    chapter: number;
    // Internal section reference (e.g. "5.1") — used for sorting and JSON matching.
    // Never rendered directly; UI must use `section_name` instead.
    section: string;
    section_name?: string;
    class_level: ClassLevel;
    prerequisites: string[];
    status: ConceptStatus;
    // Atomic = full lesson card with deep-dive support.
    // Nano = quick-reference content, surfaced via in-lesson footer or chat (NOT in catalog).
    card_type: CardType;
    // Phase 2: marks must-do concepts for the "Today's Path" guided spine.
    is_spine?: boolean;
    // Phase 3: nano definitions surfaced in LessonCard footer + side-chat answers.
    nano_definitions?: NanoDef[];
    // Phase 3: one-sentence "why am I learning this?" pitched at the student.
    // Renders at the top of LessonCard when present. Authored per concept.
    why_learn?: string;
}

export interface CatalogChapter {
    chapter_number: number;
    chapter_name: string;
    class_level: ClassLevel;
    concepts: CatalogConcept[];
    live_count: number;
    total_count: number;
    entry_point_concept_id: string | null;
}

// Chapter numbering aligned with DC Pandey Vol 1 (Ch.1–10) + Vol 2 (Ch.11+).
// Vol 1 Ch.10 = Circular Motion (was incorrectly missing).
const CHAPTER_NAMES: Record<number, string> = {
    1: 'Basic Mathematics',
    2: 'Measurements & Errors',
    3: 'Experiments',
    4: 'Units & Dimensions',
    5: 'Vectors',
    6: 'Kinematics',
    7: 'Projectile Motion',
    8: 'Laws of Motion',
    9: 'Work, Energy & Power',
    10: 'Circular Motion',
    11: 'Centre of Mass & Linear Momentum',
    12: 'Rotational Motion',
    13: 'Gravitation',
    14: 'Simple Harmonic Motion',
    15: 'Elasticity',
    16: 'Fluid Mechanics',
    17: 'Heat & Calorimetry',
    18: 'Wave Motion',
    19: 'Superposition of Waves',
    20: 'Sound Waves',
    21: 'Thermodynamics',
    22: 'Kinetic Theory of Gases',
};

// Section labels per DC Pandey Vol 1 + Vol 2 ToC.
// Keyed as `${chapter}.${majorSection}`. JSON `section` strings can carry a
// third number ("8.7.2") so we match by the first two components only.
const SECTION_NAMES: Record<string, string> = {
    // Ch.5 Vectors — themed labels (no textbook §-signal)
    '5.1': 'Vectors vs Scalars',
    '5.2': 'Vector Anatomy',
    '5.3': 'Combining Vectors',
    '5.4': 'Breaking Vectors into Pieces',
    '5.5': 'Two Ways to Multiply',

    // Ch.6 Kinematics
    '6.1': 'Mechanics & Kinematics — Intro',
    '6.2': 'General Points of Motion',
    '6.3': 'Classification of Motion',
    '6.4': 'Basic Definitions',
    '6.5': 'Uniform Motion',
    '6.6': '1D Motion — Uniform Acceleration',
    '6.7': '1D Motion — Non-uniform Acceleration',
    '6.8': 'Motion in 2D & 3D',
    '6.9': 'Motion Graphs',
    '6.10': 'Relative Motion',

    // Ch.7 Projectile Motion
    '7.1': 'Introduction',
    '7.2': 'Projectile Motion',
    '7.3': 'Two Methods of Solving',
    '7.4': 'Time of Flight, Max Height & Range',
    '7.5': 'Projectile on Inclined Plane',
    '7.6': 'Relative Motion between Projectiles',

    // Ch.8 Laws of Motion (DC Pandey numbering — 8.5 = Constraint Equations, 8.7 = Friction)
    '8.1': 'Types of Forces',
    '8.2': 'Free Body Diagram',
    '8.3': 'Equilibrium',
    '8.4': "Newton's Laws of Motion",
    '8.5': 'Constraint Equations',
    '8.6': 'Pseudo Force',
    '8.7': 'Friction',

    // Ch.9 Work, Energy & Power
    '9.1': 'Introduction to Work',
    '9.2': 'Work Done',
    '9.3': 'Conservative & Non-conservative Forces',
    '9.4': 'Kinetic Energy',
    '9.5': 'Work–Energy Theorem',
    '9.6': 'Potential Energy',
    '9.7': 'Three Types of Equilibrium',
    '9.8': 'Power',
    '9.9': 'Conservation of Mechanical Energy',

    // Ch.10 Circular Motion (DC Pandey Vol 1)
    '10.1': 'Introduction',
    '10.2': 'Kinematics of Circular Motion',
    '10.3': 'Dynamics of Circular Motion',
    '10.4': 'Centrifugal Force',
    '10.5': 'Motion in a Vertical Circle',

    // Ch.11 Centre of Mass & Linear Momentum (DC Pandey Vol 2)
    '11.1': 'Centre of Mass',
    '11.2': 'Conservation of Linear Momentum',
    '11.3': 'Variable Mass System',
    '11.4': 'Impulse',
    '11.5': 'Collision',

    // Ch.12 Rotational Motion (DC Pandey Vol 2)
    '12.1': 'Introduction',
    '12.2': 'Moment of Inertia',
    '12.3': 'Angular Velocity',
    '12.4': 'Torque',
    '12.5': 'Rotation about a Fixed Axis',
    '12.6': 'Angular Momentum',
    '12.7': 'Conservation of Angular Momentum',
    '12.8': 'Combined Translational & Rotational Motion',
    '12.9': 'Uniform Pure Rolling',
    '12.10': 'Instantaneous Axis of Rotation',
    '12.11': 'Accelerated Pure Rolling',
    '12.12': 'Angular Impulse',
    '12.13': 'Toppling',
};

function sectionKey(section: string): string {
    if (!section) return '';
    const parts = section.split('.');
    return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : section;
}

function sectionName(section: string): string | undefined {
    return SECTION_NAMES[sectionKey(section)];
}

interface GhostSeed {
    concept_id: string;
    concept_name: string;
    chapter: number;
    section: string;
    class_level: ClassLevel;
    prerequisites: string[];
    card_type?: CardType;          // defaults to 'atomic'
    is_spine?: boolean;            // Phase 2 — marks Today's Path spine
    nano_definitions?: NanoDef[];  // Phase 3 — for atomic ghosts that own nano refs
    why_learn?: string;            // Phase 3 — one-sentence motivation surfaced in LessonCard
}

// Comprehensive ghost catalog — every atomic concept that should exist for
// Class 11 mechanics (DC Pandey Vol 1 + Vol 2 Ch.11–12). Live JSONs in
// src/data/concepts/ override these by concept_id at runtime.
export const GHOST_CONCEPTS: GhostSeed[] = [
    // ── Ch.5 Vectors ──────────────────────────────────────────────────────
    // §5.1 Vectors vs Scalars
    { concept_id: 'scalar_vs_vector', concept_name: 'Scalar vs Vector Quantities', chapter: 5, section: '5.1', class_level: 11, prerequisites: [], is_spine: true, why_learn: 'Every problem you solve in mechanics — projectile motion, forces, momentum — starts by deciding whether each quantity has a direction. Get this wrong and the rest unravels.' },
    { concept_id: 'vector_basics', concept_name: 'Vector — Basics', chapter: 5, section: '5.1', class_level: 11, prerequisites: ['scalar_vs_vector'], is_spine: true, why_learn: 'The shorthand and conventions you’ll use for the next 4 chapters — magnitude, direction, arrow, head-tail. Skip these and every diagram becomes a guess.' },
    { concept_id: 'pressure_scalar', concept_name: 'Why Pressure is a Scalar', chapter: 5, section: '5.1', class_level: 11, prerequisites: ['scalar_vs_vector'] },
    { concept_id: 'current_not_vector', concept_name: 'Why Current is Not a Vector', chapter: 5, section: '5.1', class_level: 11, prerequisites: ['scalar_vs_vector'] },
    { concept_id: 'quantity_inventory', concept_name: 'Scalar & Vector Inventory', chapter: 5, section: '5.1', class_level: 11, prerequisites: ['scalar_vs_vector'], card_type: 'nano' },
    { concept_id: 'non_vector_examples', concept_name: 'Subtle Cases — Surface Tension, Rotation, Polar vs Axial', chapter: 5, section: '5.1', class_level: 11, prerequisites: ['vector_basics'], card_type: 'nano' },

    // §5.2 Vector Anatomy
    { concept_id: 'equal_vs_parallel', concept_name: 'Equal vs Parallel Vectors', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'], is_spine: true },
    { concept_id: 'negative_vector', concept_name: 'Negative of a Vector', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'] },
    { concept_id: 'unit_vector', concept_name: 'Unit Vector', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'], is_spine: true },
    { concept_id: 'area_vector', concept_name: 'Area as a Vector', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'] },
    { concept_id: 'angle_between_vectors', concept_name: 'Angle Between Two Vectors', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'] },
    { concept_id: 'scalar_multiplication', concept_name: 'Scalar Multiplication of a Vector', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'] },
    { concept_id: 'kinds_of_vectors', concept_name: 'Kinds of Vectors — Anti-parallel, Concurrent, Coplanar, Orthogonal, Zero', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'], card_type: 'nano' },
    { concept_id: 'parallel_transport', concept_name: 'Parallel Transport — Vector Unchanged', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'], card_type: 'nano' },
    { concept_id: 'vector_notation', concept_name: 'Vector Notation & Graphical Representation', chapter: 5, section: '5.2', class_level: 11, prerequisites: ['vector_basics'], card_type: 'nano' },

    // §5.3 Combining Vectors
    { concept_id: 'vector_addition_triangle', concept_name: 'Vector Addition — Triangle Law', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['vector_basics'], is_spine: true },
    { concept_id: 'parallelogram_law_test', concept_name: 'Parallelogram Law of Addition', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['vector_addition_triangle'] },
    { concept_id: 'resultant_formula', concept_name: 'Magnitude of Resultant', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['parallelogram_law_test'], is_spine: true },
    { concept_id: 'direction_of_resultant', concept_name: 'Direction of Resultant', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['resultant_formula'] },
    { concept_id: 'vector_subtraction', concept_name: 'Vector Subtraction', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['vector_addition_triangle', 'negative_vector'], is_spine: true },
    { concept_id: 'range_inequality', concept_name: 'Range of Resultant Magnitude', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['resultant_formula'] },
    { concept_id: 'polygon_law_addition', concept_name: 'Polygon Law — Adding Three or More Vectors', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['vector_addition_triangle'] },
    { concept_id: 'equal_magnitude_resultant', concept_name: 'Equal-Magnitude Resultant — |R| = 2A cos(θ/2)', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['resultant_formula'] },
    { concept_id: 'special_cases_resultant', concept_name: 'Resultant at θ = 0°, 90°, 180°', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['resultant_formula'], card_type: 'nano' },
    { concept_id: 'equal_magnitude_subtraction', concept_name: 'Equal-Magnitude Subtraction — |S| = 2A sin(θ/2)', chapter: 5, section: '5.3', class_level: 11, prerequisites: ['vector_subtraction'], card_type: 'nano' },

    // §5.4 Breaking Vectors into Pieces
    { concept_id: 'vector_components', concept_name: 'Vector Components', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['vector_basics'], is_spine: true },
    { concept_id: 'vector_resolution', concept_name: 'Vector Resolution into Axes', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['vector_components'], is_spine: true },
    { concept_id: 'negative_components', concept_name: 'Sign of Components', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['vector_resolution'] },
    { concept_id: 'inclined_plane_components', concept_name: 'Components on an Inclined Plane', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['vector_resolution'], is_spine: true, why_learn: 'JEE Mains tests this in 2 of every 3 papers — and every friction, banking, and pulley problem in Ch.8 reduces to splitting weight along and across a slope.' },
    { concept_id: 'unit_vector_form', concept_name: 'î ĵ k̂ Unit Vector Form', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['vector_components', 'unit_vector'] },
    { concept_id: 'direction_cosines', concept_name: 'Direction Cosines — cos α, cos β, cos γ', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['vector_resolution'] },
    { concept_id: 'non_perpendicular_resolution', concept_name: 'Resolution into Non-Perpendicular Axes', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['vector_resolution'] },
    { concept_id: 'position_vector', concept_name: 'Position Vector', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['vector_components'] },
    { concept_id: 'displacement_vector', concept_name: 'Displacement Vector', chapter: 5, section: '5.4', class_level: 11, prerequisites: ['position_vector'] },

    // §5.5 Two Ways to Multiply
    {
        concept_id: 'dot_product', concept_name: 'Dot Product', chapter: 5, section: '5.5', class_level: 11,
        prerequisites: ['vector_resolution'], is_spine: true,
        why_learn: 'Work, power, and projection of one vector onto another all reduce to the dot product. It’s the single tool that turns 3D physics into one number you can compute.',
        nano_definitions: [
            { id: 'perpendicularity_test', name: 'Perpendicularity test', one_line: 'Two vectors are perpendicular ⇔ A · B = 0. Single equation, no calculator.' },
            { id: 'commutative', name: 'Commutativity', one_line: 'A · B = B · A. Order doesn’t matter — unlike the cross product.' },
            { id: 'distributive', name: 'Distributivity', one_line: 'A · (B + C) = A · B + A · C. Lets you expand brackets in vector algebra.' },
            { id: 'unit_dot_table', name: 'Unit-vector dot table', one_line: 'î·î = ĵ·ĵ = k̂·k̂ = 1; î·ĵ = ĵ·k̂ = î·k̂ = 0. Memorise these once and forever.' },
        ],
    },
    { concept_id: 'cross_product', concept_name: 'Cross Product', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['vector_resolution'], is_spine: true, why_learn: 'Torque, angular momentum, area of a triangle, induced EMF — anywhere physics needs a perpendicular direction, the cross product gives it to you.' },
    { concept_id: 'right_hand_rule', concept_name: 'Right-Hand Rule for Cross Product', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['cross_product'], is_spine: true, why_learn: 'Torque, angular momentum, magnetic force — every rotational and electromagnetic problem in JEE/NEET hangs on getting this rule right. Most students fumble it; you won’t.' },
    { concept_id: 'dot_product_component_form', concept_name: 'Dot Product — Component Form (a₁a₂ + b₁b₂ + c₁c₂)', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['dot_product', 'unit_vector_form'] },
    { concept_id: 'scalar_projection', concept_name: 'Scalar Projection — Component Along Another Vector', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['dot_product'] },
    { concept_id: 'cross_product_determinant', concept_name: 'Cross Product — Determinant Form', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['cross_product', 'unit_vector_form'] },
    { concept_id: 'unit_vector_perpendicular', concept_name: 'Unit Vector Perpendicular to A and B', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['cross_product_determinant'] },
    { concept_id: 'dot_product_physics_apps', concept_name: 'Dot Product in Physics — Work, Power, Flux', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['dot_product'] },
    { concept_id: 'cross_product_physics_apps', concept_name: 'Cross Product in Physics — Torque, Angular Momentum, Lorentz', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['cross_product', 'right_hand_rule'] },
    { concept_id: 'scalar_triple_product', concept_name: 'Scalar Triple Product — A · (B × C)', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['dot_product', 'cross_product'] },
    { concept_id: 'coplanarity_test', concept_name: 'Coplanarity Test — STP = 0', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['scalar_triple_product'] },
    { concept_id: 'dot_product_quick_tests', concept_name: 'Dot Product — Quick Reference', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['dot_product'], card_type: 'nano' },
    { concept_id: 'cross_product_quick_tests', concept_name: 'Cross Product — Quick Reference', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['cross_product'], card_type: 'nano' },
    { concept_id: 'geometric_apps_of_cross', concept_name: 'Geometric Applications — Triangle Area, Parallelogram Area, Volume', chapter: 5, section: '5.5', class_level: 11, prerequisites: ['cross_product', 'scalar_triple_product'], card_type: 'nano' },

    // ── Ch.6 Kinematics ───────────────────────────────────────────────────
    { concept_id: 'classification_of_motion', concept_name: '1D, 2D and 3D Motion', chapter: 6, section: '6.3', class_level: 11, prerequisites: [] },
    { concept_id: 'translational_vs_rotational', concept_name: 'Translational vs Rotational Motion', chapter: 6, section: '6.3', class_level: 11, prerequisites: [] },
    { concept_id: 'distance_displacement_basics', concept_name: 'Distance vs Displacement', chapter: 6, section: '6.4', class_level: 11, prerequisites: [] },
    { concept_id: 'average_speed_velocity', concept_name: 'Average Speed vs Average Velocity', chapter: 6, section: '6.4', class_level: 11, prerequisites: ['distance_displacement_basics'] },
    { concept_id: 'instantaneous_velocity', concept_name: 'Instantaneous Velocity', chapter: 6, section: '6.4', class_level: 11, prerequisites: ['average_speed_velocity'] },
    { concept_id: 'acceleration_definition', concept_name: 'Acceleration — Definition', chapter: 6, section: '6.4', class_level: 11, prerequisites: ['instantaneous_velocity'] },
    { concept_id: 'uniform_motion', concept_name: 'Uniform Motion', chapter: 6, section: '6.5', class_level: 11, prerequisites: ['instantaneous_velocity'] },
    { concept_id: 'three_cases', concept_name: 'Three Kinematic Cases (v=u+at)', chapter: 6, section: '6.6', class_level: 11, prerequisites: ['acceleration_definition'] },
    { concept_id: 's_in_equations', concept_name: "Meaning of 's' in Equations", chapter: 6, section: '6.6', class_level: 11, prerequisites: ['three_cases'] },
    { concept_id: 'sign_convention', concept_name: 'Sign Convention in 1D', chapter: 6, section: '6.6', class_level: 11, prerequisites: ['three_cases'] },
    { concept_id: 'sth_formula', concept_name: 'Distance in n-th Second', chapter: 6, section: '6.6', class_level: 11, prerequisites: ['three_cases'] },
    { concept_id: 'direction_reversal', concept_name: 'Direction Reversal Cases', chapter: 6, section: '6.6', class_level: 11, prerequisites: ['sign_convention'] },
    { concept_id: 'free_fall', concept_name: 'Free Fall', chapter: 6, section: '6.6', class_level: 11, prerequisites: ['three_cases'] },
    { concept_id: 'negative_time', concept_name: 'Negative Time Solutions', chapter: 6, section: '6.6', class_level: 11, prerequisites: ['three_cases'] },
    { concept_id: 'a_function_of_t', concept_name: 'a = a(t) — Acceleration as Function of Time', chapter: 6, section: '6.7', class_level: 11, prerequisites: ['acceleration_definition'] },
    { concept_id: 'a_function_of_x', concept_name: 'a = a(x) — Acceleration as Function of Position', chapter: 6, section: '6.7', class_level: 11, prerequisites: ['acceleration_definition'] },
    { concept_id: 'a_function_of_v', concept_name: 'a = a(v) — Acceleration as Function of Velocity', chapter: 6, section: '6.7', class_level: 11, prerequisites: ['acceleration_definition'] },
    { concept_id: 'initial_conditions', concept_name: 'Initial Conditions in Integration', chapter: 6, section: '6.7', class_level: 11, prerequisites: ['a_function_of_t'] },
    { concept_id: 'xt_graph', concept_name: 'Position–Time Graph', chapter: 6, section: '6.9', class_level: 11, prerequisites: ['instantaneous_velocity'] },
    { concept_id: 'vt_graph', concept_name: 'Velocity–Time Graph', chapter: 6, section: '6.9', class_level: 11, prerequisites: ['xt_graph'] },
    { concept_id: 'at_graph', concept_name: 'Acceleration–Time Graph', chapter: 6, section: '6.9', class_level: 11, prerequisites: ['vt_graph'] },
    { concept_id: 'area_under_vt', concept_name: 'Area Under v–t = Displacement', chapter: 6, section: '6.9', class_level: 11, prerequisites: ['vt_graph'] },
    { concept_id: 'relative_1d_cases', concept_name: 'Relative Motion — 1D Cases', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['instantaneous_velocity'] },
    { concept_id: 'vab_formula', concept_name: 'Relative Velocity Formula (v_AB)', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['relative_1d_cases'] },
    { concept_id: 'time_to_meet', concept_name: 'Time to Meet — Relative Motion', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['vab_formula'] },
    { concept_id: 'upstream_downstream', concept_name: 'Upstream vs Downstream — River-Boat', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['vab_formula'] },
    { concept_id: 'shortest_time_crossing', concept_name: 'Shortest Time to Cross a River', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['upstream_downstream'] },
    { concept_id: 'shortest_path_crossing', concept_name: 'Shortest Path to Cross a River', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['upstream_downstream'] },
    { concept_id: 'apparent_rain_velocity', concept_name: 'Rain–Umbrella — Apparent Velocity', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['vab_formula'] },
    { concept_id: 'umbrella_tilt_angle', concept_name: 'Umbrella Tilt Angle', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['apparent_rain_velocity'] },
    { concept_id: 'ground_velocity_vector', concept_name: 'Ground Velocity in Aircraft–Wind', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['vab_formula'] },
    { concept_id: 'heading_correction', concept_name: 'Heading Correction in Wind', chapter: 6, section: '6.10', class_level: 11, prerequisites: ['ground_velocity_vector'] },

    // ── Ch.7 Projectile Motion ────────────────────────────────────────────
    { concept_id: 'projectile_motion_intro', concept_name: 'Projectile Motion — Introduction', chapter: 7, section: '7.2', class_level: 11, prerequisites: ['vector_components', 'free_fall'] },
    { concept_id: 'horizontal_projectile', concept_name: 'Horizontal Projectile', chapter: 7, section: '7.2', class_level: 11, prerequisites: ['projectile_motion_intro'] },
    { concept_id: 'oblique_projectile', concept_name: 'Oblique Projectile', chapter: 7, section: '7.2', class_level: 11, prerequisites: ['projectile_motion_intro'] },
    { concept_id: 'component_method', concept_name: 'Component Method', chapter: 7, section: '7.3', class_level: 11, prerequisites: ['oblique_projectile', 'vector_components'] },
    { concept_id: 'vector_method_projectile', concept_name: 'Vector Method', chapter: 7, section: '7.3', class_level: 11, prerequisites: ['oblique_projectile'] },
    { concept_id: 'time_of_flight', concept_name: 'Time of Flight', chapter: 7, section: '7.4', class_level: 11, prerequisites: ['oblique_projectile'] },
    { concept_id: 'max_height', concept_name: 'Maximum Height', chapter: 7, section: '7.4', class_level: 11, prerequisites: ['oblique_projectile'] },
    { concept_id: 'range_formula', concept_name: 'Range Formula R = u² sin 2θ / g', chapter: 7, section: '7.4', class_level: 11, prerequisites: ['time_of_flight'] },
    { concept_id: 'complementary_angles_range', concept_name: 'Same Range from Complementary Angles', chapter: 7, section: '7.4', class_level: 11, prerequisites: ['range_formula'] },
    { concept_id: 'max_range_at_45', concept_name: 'Maximum Range at 45°', chapter: 7, section: '7.4', class_level: 11, prerequisites: ['range_formula'] },
    { concept_id: 'up_incline_projectile', concept_name: 'Projectile up an Inclined Plane', chapter: 7, section: '7.5', class_level: 11, prerequisites: ['oblique_projectile'] },
    { concept_id: 'down_incline_projectile', concept_name: 'Projectile down an Inclined Plane', chapter: 7, section: '7.5', class_level: 11, prerequisites: ['oblique_projectile'] },
    { concept_id: 'range_on_incline', concept_name: 'Range on an Inclined Plane', chapter: 7, section: '7.5', class_level: 11, prerequisites: ['up_incline_projectile'] },
    { concept_id: 'two_projectile_meeting', concept_name: 'Two Projectiles Meeting', chapter: 7, section: '7.6', class_level: 11, prerequisites: ['oblique_projectile', 'vab_formula'] },
    { concept_id: 'two_projectile_never_meet', concept_name: 'Two Projectiles Never Meeting', chapter: 7, section: '7.6', class_level: 11, prerequisites: ['oblique_projectile'] },

    // ── Ch.8 Laws of Motion (DC Pandey numbering) ─────────────────────────
    { concept_id: 'field_forces', concept_name: 'Field Forces', chapter: 8, section: '8.1', class_level: 11, prerequisites: [] },
    { concept_id: 'contact_forces', concept_name: 'Contact Forces', chapter: 8, section: '8.1', class_level: 11, prerequisites: [] },
    { concept_id: 'normal_reaction', concept_name: 'Normal Reaction', chapter: 8, section: '8.1', class_level: 11, prerequisites: ['contact_forces'] },
    { concept_id: 'tension_in_string', concept_name: 'Tension in a String', chapter: 8, section: '8.1', class_level: 11, prerequisites: ['contact_forces'] },
    { concept_id: 'spring_force', concept_name: 'Spring Force (Hooke’s Law)', chapter: 8, section: '8.1', class_level: 11, prerequisites: ['contact_forces'] },
    { concept_id: 'gravitational_force_intro', concept_name: 'Gravitational Force — Intro', chapter: 8, section: '8.1', class_level: 11, prerequisites: ['field_forces'] },
    { concept_id: 'electromagnetic_force_intro', concept_name: 'Electromagnetic Force — Intro', chapter: 8, section: '8.1', class_level: 11, prerequisites: ['field_forces'] },
    { concept_id: 'hinge_force', concept_name: 'Hinge Force', chapter: 8, section: '8.1', class_level: 11, prerequisites: ['contact_forces'] },
    { concept_id: 'free_body_diagram', concept_name: 'Free Body Diagram', chapter: 8, section: '8.2', class_level: 11, prerequisites: ['contact_forces'] },
    { concept_id: 'multi_body_fbd', concept_name: 'FBD — Multi-Body System', chapter: 8, section: '8.2', class_level: 11, prerequisites: ['free_body_diagram'] },
    { concept_id: 'static_equilibrium', concept_name: 'Static Equilibrium', chapter: 8, section: '8.3', class_level: 11, prerequisites: ['free_body_diagram'] },
    { concept_id: 'dynamic_equilibrium', concept_name: 'Dynamic Equilibrium', chapter: 8, section: '8.3', class_level: 11, prerequisites: ['static_equilibrium'] },
    { concept_id: 'lami_theorem', concept_name: "Lami's Theorem", chapter: 8, section: '8.3', class_level: 11, prerequisites: ['static_equilibrium'] },
    { concept_id: 'newton_first_law', concept_name: "Newton's First Law of Motion", chapter: 8, section: '8.4', class_level: 11, prerequisites: [] },
    { concept_id: 'inertial_frame', concept_name: 'Inertial Frame of Reference', chapter: 8, section: '8.4', class_level: 11, prerequisites: ['newton_first_law'] },
    { concept_id: 'newton_second_law', concept_name: "Newton's Second Law (F = ma)", chapter: 8, section: '8.4', class_level: 11, prerequisites: ['newton_first_law'] },
    { concept_id: 'newton_third_law', concept_name: "Newton's Third Law", chapter: 8, section: '8.4', class_level: 11, prerequisites: ['newton_second_law'] },
    { concept_id: 'action_reaction_pairs', concept_name: 'Action–Reaction Pairs', chapter: 8, section: '8.4', class_level: 11, prerequisites: ['newton_third_law'] },
    { concept_id: 'constraint_string_pulley', concept_name: 'String–Pulley Constraint', chapter: 8, section: '8.5', class_level: 11, prerequisites: ['tension_in_string'] },
    { concept_id: 'constraint_wedge_block', concept_name: 'Wedge–Block Constraint', chapter: 8, section: '8.5', class_level: 11, prerequisites: ['vector_components'] },
    { concept_id: 'constraint_pulley_systems', concept_name: 'Movable Pulley Systems', chapter: 8, section: '8.5', class_level: 11, prerequisites: ['constraint_string_pulley'] },
    { concept_id: 'non_inertial_frame', concept_name: 'Non-Inertial Frame of Reference', chapter: 8, section: '8.6', class_level: 11, prerequisites: ['inertial_frame'] },
    { concept_id: 'pseudo_force', concept_name: 'Pseudo Force', chapter: 8, section: '8.6', class_level: 11, prerequisites: ['non_inertial_frame'] },
    { concept_id: 'pseudo_force_inclined', concept_name: 'Pseudo Force on Inclined Surfaces', chapter: 8, section: '8.6', class_level: 11, prerequisites: ['pseudo_force'] },
    { concept_id: 'friction_static_kinetic', concept_name: 'Static vs Kinetic Friction', chapter: 8, section: '8.7', class_level: 11, prerequisites: ['normal_reaction'] },
    { concept_id: 'coefficient_of_friction', concept_name: 'Coefficient of Friction (μs vs μk)', chapter: 8, section: '8.7', class_level: 11, prerequisites: ['friction_static_kinetic'] },
    { concept_id: 'angle_of_friction', concept_name: 'Angle of Friction (λ)', chapter: 8, section: '8.7', class_level: 11, prerequisites: ['coefficient_of_friction'] },
    { concept_id: 'angle_of_repose', concept_name: 'Angle of Repose (α)', chapter: 8, section: '8.7', class_level: 11, prerequisites: ['angle_of_friction'] },
    { concept_id: 'friction_on_incline', concept_name: 'Friction on an Inclined Plane', chapter: 8, section: '8.7', class_level: 11, prerequisites: ['angle_of_repose', 'inclined_plane_components'] },
    { concept_id: 'blocks_on_blocks_friction', concept_name: 'Blocks on Blocks — Stacked Friction', chapter: 8, section: '8.7', class_level: 11, prerequisites: ['friction_static_kinetic'] },
    { concept_id: 'friction_in_non_inertial', concept_name: 'Friction in Non-Inertial Frames', chapter: 8, section: '8.7', class_level: 11, prerequisites: ['friction_static_kinetic', 'pseudo_force'] },

    // ── Ch.9 Work, Energy & Power ─────────────────────────────────────────
    { concept_id: 'work_definition', concept_name: 'Work — Definition', chapter: 9, section: '9.1', class_level: 11, prerequisites: ['dot_product'] },
    { concept_id: 'work_constant_force', concept_name: 'Work Done by a Constant Force', chapter: 9, section: '9.2', class_level: 11, prerequisites: ['work_definition'] },
    { concept_id: 'work_variable_force', concept_name: 'Work Done by a Variable Force', chapter: 9, section: '9.2', class_level: 11, prerequisites: ['work_constant_force'] },
    { concept_id: 'area_under_force_displacement', concept_name: 'Area Under F–s Graph = Work', chapter: 9, section: '9.2', class_level: 11, prerequisites: ['work_variable_force'] },
    { concept_id: 'conservative_force', concept_name: 'Conservative Force', chapter: 9, section: '9.3', class_level: 11, prerequisites: ['work_definition'] },
    { concept_id: 'non_conservative_force', concept_name: 'Non-Conservative Force', chapter: 9, section: '9.3', class_level: 11, prerequisites: ['conservative_force'] },
    { concept_id: 'path_independence', concept_name: 'Path Independence Test', chapter: 9, section: '9.3', class_level: 11, prerequisites: ['conservative_force'] },
    { concept_id: 'kinetic_energy', concept_name: 'Kinetic Energy', chapter: 9, section: '9.4', class_level: 11, prerequisites: ['work_definition'] },
    { concept_id: 'work_energy_theorem', concept_name: 'Work–Energy Theorem', chapter: 9, section: '9.5', class_level: 11, prerequisites: ['kinetic_energy', 'work_constant_force'] },
    { concept_id: 'gravitational_pe', concept_name: 'Gravitational Potential Energy', chapter: 9, section: '9.6', class_level: 11, prerequisites: ['conservative_force'] },
    { concept_id: 'spring_pe', concept_name: 'Spring Potential Energy', chapter: 9, section: '9.6', class_level: 11, prerequisites: ['spring_force', 'conservative_force'] },
    { concept_id: 'pe_force_relation', concept_name: 'Force from Potential Energy (F = −dU/dx)', chapter: 9, section: '9.6', class_level: 11, prerequisites: ['gravitational_pe'] },
    { concept_id: 'stable_equilibrium', concept_name: 'Stable Equilibrium', chapter: 9, section: '9.7', class_level: 11, prerequisites: ['pe_force_relation'] },
    { concept_id: 'unstable_equilibrium', concept_name: 'Unstable Equilibrium', chapter: 9, section: '9.7', class_level: 11, prerequisites: ['pe_force_relation'] },
    { concept_id: 'neutral_equilibrium', concept_name: 'Neutral Equilibrium', chapter: 9, section: '9.7', class_level: 11, prerequisites: ['pe_force_relation'] },
    { concept_id: 'average_power', concept_name: 'Average Power', chapter: 9, section: '9.8', class_level: 11, prerequisites: ['work_definition'] },
    { concept_id: 'instantaneous_power', concept_name: 'Instantaneous Power (P = F·v)', chapter: 9, section: '9.8', class_level: 11, prerequisites: ['average_power'] },
    { concept_id: 'conservation_mechanical_energy', concept_name: 'Conservation of Mechanical Energy', chapter: 9, section: '9.9', class_level: 11, prerequisites: ['kinetic_energy', 'gravitational_pe'] },

    // ── Ch.10 Circular Motion ─────────────────────────────────────────────
    { concept_id: 'circular_motion_intro', concept_name: 'Circular Motion — Introduction', chapter: 10, section: '10.1', class_level: 11, prerequisites: ['instantaneous_velocity'] },
    { concept_id: 'angular_displacement', concept_name: 'Angular Displacement', chapter: 10, section: '10.2', class_level: 11, prerequisites: ['circular_motion_intro'] },
    { concept_id: 'angular_velocity_circular', concept_name: 'Angular Velocity (ω)', chapter: 10, section: '10.2', class_level: 11, prerequisites: ['angular_displacement'] },
    { concept_id: 'angular_acceleration', concept_name: 'Angular Acceleration (α)', chapter: 10, section: '10.2', class_level: 11, prerequisites: ['angular_velocity_circular'] },
    { concept_id: 'tangential_centripetal_accel', concept_name: 'Tangential vs Centripetal Acceleration', chapter: 10, section: '10.2', class_level: 11, prerequisites: ['angular_velocity_circular'] },
    { concept_id: 'centripetal_force', concept_name: 'Centripetal Force', chapter: 10, section: '10.3', class_level: 11, prerequisites: ['tangential_centripetal_accel', 'newton_second_law'] },
    { concept_id: 'banking_of_roads', concept_name: 'Banking of Roads', chapter: 10, section: '10.3', class_level: 11, prerequisites: ['centripetal_force', 'friction_static_kinetic'] },
    { concept_id: 'conical_pendulum', concept_name: 'Conical Pendulum', chapter: 10, section: '10.3', class_level: 11, prerequisites: ['centripetal_force', 'tension_in_string'] },
    { concept_id: 'centrifugal_force', concept_name: 'Centrifugal Force', chapter: 10, section: '10.4', class_level: 11, prerequisites: ['centripetal_force', 'pseudo_force'] },
    { concept_id: 'vertical_circle_motion', concept_name: 'Motion in a Vertical Circle', chapter: 10, section: '10.5', class_level: 11, prerequisites: ['centripetal_force', 'conservation_mechanical_energy'] },
    { concept_id: 'minimum_speed_top', concept_name: 'Minimum Speed at Top of Loop', chapter: 10, section: '10.5', class_level: 11, prerequisites: ['vertical_circle_motion'] },
    { concept_id: 'tension_at_extremes', concept_name: 'Tension at Top vs Bottom', chapter: 10, section: '10.5', class_level: 11, prerequisites: ['vertical_circle_motion'] },

    // ── Ch.11 Centre of Mass & Linear Momentum ────────────────────────────
    { concept_id: 'centre_of_mass_definition', concept_name: 'Centre of Mass — Definition', chapter: 11, section: '11.1', class_level: 11, prerequisites: [] },
    { concept_id: 'com_two_particle', concept_name: 'COM of a Two-Particle System', chapter: 11, section: '11.1', class_level: 11, prerequisites: ['centre_of_mass_definition'] },
    { concept_id: 'com_continuous_body', concept_name: 'COM of a Continuous Body', chapter: 11, section: '11.1', class_level: 11, prerequisites: ['com_two_particle'] },
    { concept_id: 'com_motion', concept_name: 'Motion of the Centre of Mass', chapter: 11, section: '11.1', class_level: 11, prerequisites: ['com_two_particle', 'newton_second_law'] },
    { concept_id: 'linear_momentum', concept_name: 'Linear Momentum (p = mv)', chapter: 11, section: '11.2', class_level: 11, prerequisites: ['newton_second_law'] },
    { concept_id: 'momentum_conservation', concept_name: 'Conservation of Linear Momentum', chapter: 11, section: '11.2', class_level: 11, prerequisites: ['linear_momentum', 'newton_third_law'] },
    { concept_id: 'rocket_propulsion', concept_name: 'Rocket Propulsion', chapter: 11, section: '11.3', class_level: 11, prerequisites: ['momentum_conservation'] },
    { concept_id: 'variable_mass', concept_name: 'Variable Mass System', chapter: 11, section: '11.3', class_level: 11, prerequisites: ['linear_momentum'] },
    { concept_id: 'impulse_definition', concept_name: 'Impulse — Definition', chapter: 11, section: '11.4', class_level: 11, prerequisites: ['linear_momentum'] },
    { concept_id: 'impulse_momentum_theorem', concept_name: 'Impulse–Momentum Theorem', chapter: 11, section: '11.4', class_level: 11, prerequisites: ['impulse_definition'] },
    { concept_id: 'elastic_collision_1d', concept_name: 'Elastic Collision in 1D', chapter: 11, section: '11.5', class_level: 11, prerequisites: ['momentum_conservation', 'kinetic_energy'] },
    { concept_id: 'inelastic_collision_1d', concept_name: 'Inelastic Collision in 1D', chapter: 11, section: '11.5', class_level: 11, prerequisites: ['momentum_conservation'] },
    { concept_id: 'perfectly_inelastic', concept_name: 'Perfectly Inelastic Collision', chapter: 11, section: '11.5', class_level: 11, prerequisites: ['inelastic_collision_1d'] },
    { concept_id: 'collision_2d', concept_name: 'Collision in 2D', chapter: 11, section: '11.5', class_level: 11, prerequisites: ['elastic_collision_1d', 'vector_components'] },
    { concept_id: 'coefficient_of_restitution', concept_name: 'Coefficient of Restitution (e)', chapter: 11, section: '11.5', class_level: 11, prerequisites: ['elastic_collision_1d'] },

    // ── Ch.12 Rotational Motion ───────────────────────────────────────────
    { concept_id: 'rigid_body_intro', concept_name: 'Rigid Body — Introduction', chapter: 12, section: '12.1', class_level: 11, prerequisites: [] },
    { concept_id: 'moment_of_inertia_definition', concept_name: 'Moment of Inertia — Definition', chapter: 12, section: '12.2', class_level: 11, prerequisites: ['rigid_body_intro'] },
    { concept_id: 'moi_common_shapes', concept_name: 'MOI of Common Shapes', chapter: 12, section: '12.2', class_level: 11, prerequisites: ['moment_of_inertia_definition'] },
    { concept_id: 'parallel_axis_theorem', concept_name: 'Parallel Axis Theorem', chapter: 12, section: '12.2', class_level: 11, prerequisites: ['moi_common_shapes'] },
    { concept_id: 'perpendicular_axis_theorem', concept_name: 'Perpendicular Axis Theorem', chapter: 12, section: '12.2', class_level: 11, prerequisites: ['moi_common_shapes'] },
    { concept_id: 'radius_of_gyration', concept_name: 'Radius of Gyration', chapter: 12, section: '12.2', class_level: 11, prerequisites: ['moment_of_inertia_definition'] },
    { concept_id: 'angular_velocity_rigid', concept_name: 'Angular Velocity of a Rigid Body', chapter: 12, section: '12.3', class_level: 11, prerequisites: ['angular_velocity_circular'] },
    { concept_id: 'torque_definition', concept_name: 'Torque (τ = r × F)', chapter: 12, section: '12.4', class_level: 11, prerequisites: ['cross_product'] },
    { concept_id: 'torque_couple', concept_name: 'Couple', chapter: 12, section: '12.4', class_level: 11, prerequisites: ['torque_definition'] },
    { concept_id: 'rotational_kinematics_equations', concept_name: 'Rotational Kinematic Equations', chapter: 12, section: '12.5', class_level: 11, prerequisites: ['angular_acceleration', 'three_cases'] },
    { concept_id: 'rotational_dynamics_fixed_axis', concept_name: 'Rotational Dynamics about a Fixed Axis (τ = Iα)', chapter: 12, section: '12.5', class_level: 11, prerequisites: ['torque_definition', 'moment_of_inertia_definition'] },
    { concept_id: 'angular_momentum_particle', concept_name: 'Angular Momentum of a Particle', chapter: 12, section: '12.6', class_level: 11, prerequisites: ['cross_product', 'linear_momentum'] },
    { concept_id: 'angular_momentum_rigid_body', concept_name: 'Angular Momentum of a Rigid Body (L = Iω)', chapter: 12, section: '12.6', class_level: 11, prerequisites: ['angular_momentum_particle', 'moment_of_inertia_definition'] },
    { concept_id: 'conservation_angular_momentum', concept_name: 'Conservation of Angular Momentum', chapter: 12, section: '12.7', class_level: 11, prerequisites: ['angular_momentum_rigid_body'] },
    { concept_id: 'combined_motion', concept_name: 'Combined Translational + Rotational Motion', chapter: 12, section: '12.8', class_level: 11, prerequisites: ['com_motion', 'angular_velocity_rigid'] },
    { concept_id: 'pure_rolling', concept_name: 'Uniform Pure Rolling (v = rω)', chapter: 12, section: '12.9', class_level: 11, prerequisites: ['combined_motion'] },
    { concept_id: 'velocity_of_contact_point', concept_name: 'Velocity of Contact Point in Rolling', chapter: 12, section: '12.9', class_level: 11, prerequisites: ['pure_rolling'] },
    { concept_id: 'iar', concept_name: 'Instantaneous Axis of Rotation', chapter: 12, section: '12.10', class_level: 11, prerequisites: ['pure_rolling'] },
    { concept_id: 'velocity_via_iar', concept_name: 'Velocities via the IAR', chapter: 12, section: '12.10', class_level: 11, prerequisites: ['iar'] },
    { concept_id: 'rolling_with_friction', concept_name: 'Accelerated Rolling with Friction', chapter: 12, section: '12.11', class_level: 11, prerequisites: ['pure_rolling', 'friction_static_kinetic'] },
    { concept_id: 'rolling_down_incline', concept_name: 'Rolling Down an Inclined Plane', chapter: 12, section: '12.11', class_level: 11, prerequisites: ['rolling_with_friction', 'inclined_plane_components'] },
    { concept_id: 'angular_impulse', concept_name: 'Angular Impulse', chapter: 12, section: '12.12', class_level: 11, prerequisites: ['torque_definition', 'impulse_definition'] },
    { concept_id: 'toppling_condition', concept_name: 'Toppling Condition', chapter: 12, section: '12.13', class_level: 11, prerequisites: ['torque_definition', 'static_equilibrium'] },
];

interface RawConceptJson {
    concept_id?: string;
    concept_name?: string;
    chapter?: number;
    section?: string;
    class_level?: number;
    prerequisites?: string[];
    card_type?: CardType;
    is_spine?: boolean;
    nano_definitions?: NanoDef[];
    why_learn?: string;
}

async function loadLiveConceptsFromJsons(): Promise<Omit<CatalogConcept, 'status'>[]> {
    const dir = join(process.cwd(), 'src', 'data', 'concepts');
    const files = await readdir(dir);
    const jsonFiles = files.filter(f =>
        f.endsWith('.json') && !f.includes('.legacy.') && !f.includes('.deleted')
    );

    const entries = await Promise.all(jsonFiles.map(async (file) => {
        try {
            const raw = await readFile(join(dir, file), 'utf-8');
            const parsed = JSON.parse(raw) as RawConceptJson;
            const conceptId = parsed.concept_id;
            if (!conceptId) return null;
            // Only show concepts also registered in panelConfig — those are wired end-to-end
            if (!CONCEPT_PANEL_MAP[conceptId]) return null;
            const classLevel = parsed.class_level;
            if (classLevel !== 10 && classLevel !== 11 && classLevel !== 12) return null;
            const section = typeof parsed.section === 'string' ? parsed.section : '';
            const result: Omit<CatalogConcept, 'status'> = {
                concept_id: conceptId,
                concept_name: parsed.concept_name ?? conceptId,
                chapter: typeof parsed.chapter === 'number' ? parsed.chapter : 0,
                section,
                class_level: classLevel,
                prerequisites: Array.isArray(parsed.prerequisites) ? parsed.prerequisites : [],
                card_type: parsed.card_type ?? 'atomic',
                ...(parsed.is_spine !== undefined ? { is_spine: parsed.is_spine } : {}),
                ...(parsed.nano_definitions ? { nano_definitions: parsed.nano_definitions } : {}),
                ...(typeof parsed.why_learn === 'string' && parsed.why_learn.trim()
                    ? { why_learn: parsed.why_learn.trim() }
                    : {}),
            };
            const name = sectionName(section);
            if (name) result.section_name = name;
            return result;
        } catch {
            return null;
        }
    }));

    return entries.filter((e): e is Omit<CatalogConcept, 'status'> => e !== null);
}

function createChapter(num: number, level: ClassLevel): CatalogChapter {
    return {
        chapter_number: num,
        chapter_name: CHAPTER_NAMES[num] ?? `Chapter ${num}`,
        class_level: level,
        concepts: [],
        live_count: 0,
        total_count: 0,
        entry_point_concept_id: null,
    };
}

function pickEntryPoint(concepts: CatalogConcept[]): string | null {
    const live = concepts.filter(c => c.status === 'live');
    if (live.length === 0) return null;
    const conceptIdSet = new Set(concepts.map(c => c.concept_id));
    // Prefer a live concept with no in-chapter prerequisites — that's the
    // canonical "where to start" pick. Concepts are already sorted by section.
    const noIntraChapterDeps = live.find(
        c => !c.prerequisites.some(p => conceptIdSet.has(p)),
    );
    return (noIntraChapterDeps ?? live[0]).concept_id;
}

function compareSection(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export async function getCatalogTree(classLevels: ClassLevel[]): Promise<CatalogChapter[]> {
    if (classLevels.length === 0) return [];

    const live = await loadLiveConceptsFromJsons();
    // Filter nano cards out of catalog rendering — they live invisibly in the
    // data model and surface only via in-lesson footers and chat answers.
    const liveAtomic = live.filter(c => c.card_type !== 'nano');
    const filteredLive = liveAtomic.filter(c => classLevels.includes(c.class_level));
    const filteredGhosts = GHOST_CONCEPTS.filter(
        g => classLevels.includes(g.class_level) && (g.card_type ?? 'atomic') !== 'nano',
    );

    // Index ghosts so live concepts can inherit spine + nano flags from the
    // central seed without each live JSON having to set them.
    const ghostById = new Map(GHOST_CONCEPTS.map(g => [g.concept_id, g]));

    const liveIds = new Set(filteredLive.map(c => c.concept_id));
    const byChapter = new Map<number, CatalogChapter>();

    for (const c of filteredLive) {
        const chapter = byChapter.get(c.chapter) ?? createChapter(c.chapter, c.class_level);
        const seed = ghostById.get(c.concept_id);
        const merged: CatalogConcept = {
            ...c,
            status: 'live',
            // Live JSON wins on `card_type`; otherwise inherit from seed; default atomic.
            card_type: c.card_type ?? seed?.card_type ?? 'atomic',
            // Spine flag is curated centrally — inherit from seed unless the
            // live JSON explicitly overrides.
            ...(c.is_spine === undefined && seed?.is_spine !== undefined
                ? { is_spine: seed.is_spine }
                : {}),
            // Why-learn copy can also live in the seed so we don't have to
            // touch every JSON file just to add motivational text.
            ...(c.why_learn === undefined && seed?.why_learn
                ? { why_learn: seed.why_learn }
                : {}),
            // Nano definitions live in the seed too — keeps the live JSON
            // focused on the simulation/teaching payload.
            ...(c.nano_definitions === undefined && seed?.nano_definitions
                ? { nano_definitions: seed.nano_definitions }
                : {}),
        };
        chapter.concepts.push(merged);
        chapter.live_count += 1;
        chapter.total_count += 1;
        byChapter.set(c.chapter, chapter);
    }

    for (const g of filteredGhosts) {
        if (liveIds.has(g.concept_id)) continue;
        const chapter = byChapter.get(g.chapter) ?? createChapter(g.chapter, g.class_level);
        chapter.concepts.push({
            ...g,
            section_name: sectionName(g.section),
            status: 'ghost',
            card_type: g.card_type ?? 'atomic',
        });
        chapter.total_count += 1;
        byChapter.set(g.chapter, chapter);
    }

    for (const ch of byChapter.values()) {
        ch.concepts.sort((a, b) => compareSection(a.section, b.section));
        ch.entry_point_concept_id = pickEntryPoint(ch.concepts);
    }

    return [...byChapter.values()].sort((a, b) => a.chapter_number - b.chapter_number);
}

export async function getCatalogConcept(conceptId: string): Promise<CatalogConcept | null> {
    const live = await loadLiveConceptsFromJsons();
    const liveHit = live.find(c => c.concept_id === conceptId);
    if (liveHit) {
        // Same seed-merge pattern as getCatalogTree so the lesson page sees
        // is_spine / why_learn / nano_definitions authored centrally.
        const seed = GHOST_CONCEPTS.find(g => g.concept_id === conceptId);
        return {
            ...liveHit,
            status: 'live',
            card_type: liveHit.card_type ?? seed?.card_type ?? 'atomic',
            ...(liveHit.is_spine === undefined && seed?.is_spine !== undefined
                ? { is_spine: seed.is_spine }
                : {}),
            ...(liveHit.why_learn === undefined && seed?.why_learn
                ? { why_learn: seed.why_learn }
                : {}),
            ...(liveHit.nano_definitions === undefined && seed?.nano_definitions
                ? { nano_definitions: seed.nano_definitions }
                : {}),
        };
    }
    const ghostHit = GHOST_CONCEPTS.find(g => g.concept_id === conceptId);
    if (ghostHit) {
        return {
            ...ghostHit,
            section_name: sectionName(ghostHit.section),
            status: 'ghost',
            card_type: ghostHit.card_type ?? 'atomic',
        };
    }
    return null;
}

export async function getNextConcept(
    currentConceptId: string,
    classLevels: ClassLevel[],
): Promise<CatalogConcept | null> {
    const tree = await getCatalogTree(classLevels);
    const flatLive = tree.flatMap(ch => ch.concepts.filter(c => c.status === 'live'));
    const idx = flatLive.findIndex(c => c.concept_id === currentConceptId);
    if (idx < 0 || idx >= flatLive.length - 1) return null;
    return flatLive[idx + 1];
}
