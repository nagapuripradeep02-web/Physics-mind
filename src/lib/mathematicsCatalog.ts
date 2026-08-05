// ── Mathematics catalog data (NCERT Class 11 + 12) ──────────────────────────
// Sibling of `chemistryCatalog.ts` and of the physics catalog data embedded in
// `conceptCatalog.ts`, kept in a SEPARATE file so the three subject teams don't
// collide in one array (MATHEMATICS_BUILD_PLAN.md Phase 1; the same concurrency
// rationale as src/data/concepts/chemistry/README.md).
//
// This file is DATA ONLY — the routing that selects it by subject lives in
// `conceptCatalog.ts` (`sourcesFor`). Type-only imports below keep the dependency
// one-directional at runtime (conceptCatalog imports these values; this file
// imports only erased types from conceptCatalog) — no import cycle.
//
// Everything here is STATUS 'ghost' (roadmap placeholders). No mathematics
// concept is live until one is authored into src/data/concepts/mathematics/ AND
// its render path exists.
//
// ⚠ SEEDING DISCIPLINE — read before adding a row.
// This is NOT a transcription of the NCERT contents page, and it must never
// become one. Mathematics is the most whiteboard-native of the three subjects,
// so most of the syllabus is demo tier: a good teacher with a board and 60
// seconds produces the same understanding, and a sim would be waste
// (docs/MATHEMATICS_DISCUSSIONS.md §1, §5). Every row below is a concept that
// PASSED the whiteboard test and appears on the ranked list in
// docs/MATHEMATICS_DISCUSSIONS.md §6. A ghost catalog that outruns the ranked
// list is the demo-tier trap wearing a different hat — it makes unbuildable
// promises visible to teachers and invites authoring off-list.
//
// Chapters are seeded ONLY where a ranked concept lives. The many NCERT chapters
// absent below (Sets, Linear Inequalities, Permutations & Combinations, Binomial
// Theorem, Sequences & Series, Matrices, Determinants, Linear Programming, …) are
// omitted DELIBERATELY, not by oversight: each is demo tier per §5.
//
// ⚠ Chapter numbering follows the post-2023 rationalised NCERT books and is a
// CLAIM until verified against the current edition (Rule 38g discipline applied
// to the catalog layer). Verify before relying on a number for anything
// teacher-visible.

import type { GhostSeed } from './conceptCatalog';

// Chapter names, keyed by `${class_level}.${chapter}` because mathematics — unlike
// physics and chemistry, whose catalogs are effectively single-class — spans two
// class levels with COLLIDING chapter numbers (Cl.11 Ch.10 is Conic Sections;
// Cl.12 Ch.10 is Vector Algebra). A bare chapter-number key would silently merge
// them.
export const MATHEMATICS_CHAPTER_NAMES: Record<string, string> = {
    // Class 11
    '11.2': 'Relations and Functions',
    '11.3': 'Trigonometric Functions',
    '11.4': 'Complex Numbers and Quadratic Equations',
    '11.10': 'Conic Sections',
    '11.12': 'Limits and Derivatives',
    // Class 12
    '12.8': 'Application of Integrals',
    '12.9': 'Differential Equations',
    '12.10': 'Vector Algebra',
    '12.11': 'Three Dimensional Geometry',
    '12.13': 'Probability',
};

// Section labels, keyed `${class_level}.${chapter}.${majorSection}`.
export const MATHEMATICS_SECTION_NAMES: Record<string, string> = {
    '11.2.1': 'Functions and their Graphs',
    '11.3.1': 'The Unit Circle and Trigonometric Functions',
    '11.4.1': 'The Argand Plane',
    '11.10.1': 'Conics as Loci',
    '11.12.1': 'Limits',
    '11.12.2': 'Derivatives',
    '12.8.1': 'Area Under a Curve',
    '12.8.2': 'Volumes by Revolution',
    '12.9.1': 'Solutions and Slope Fields',
    '12.10.1': 'Vector Products',
    '12.11.1': 'Lines and Planes in Space',
    '12.13.1': 'Conditional Probability',
    '12.13.2': 'Distributions and Sampling',
};

// Roadmap ghosts — one row per ranked-list entry, in ranked order. `is_spine` marks
// the P1 diamonds. `why_learn` is authored only where the concept's irreplaceability
// is not obvious from its name.
//
// concept_ids are checked against the physics and chemistry namespaces: ids are ONE
// namespace across all three subjects even though the directories are separate
// (src/scripts/lib/resolveConceptJson.ts throws loudly on a collision). Mathematics
// is the most collision-prone subject — 'vectors', 'circle', 'limits' and 'work' all
// have physics senses — so every id below is qualified rather than bare.
export const MATHEMATICS_GHOSTS: GhostSeed[] = [
    // ── P1 — the diamonds (ranked list §6) ──────────────────────────────────
    {
        concept_id: 'graph_transformations',
        concept_name: 'Graph Transformations — a·f(b(x−h))+k',
        chapter: 2, section: '2.1', class_level: 11, prerequisites: [], is_spine: true,
        why_learn: 'Four numbers reshape any curve — stretch, squeeze, shift, flip. A teacher can redraw two cases and assert the pattern; a slider shows the whole family moving, which is the only way the pattern becomes obvious rather than memorised. The widest Indian-and-international overlap in school mathematics.',
    },
    {
        concept_id: 'derivative_as_secant_limit',
        concept_name: 'The Derivative as the Limit of a Secant Slope',
        chapter: 12, section: '12.2', class_level: 11, prerequisites: ['graph_transformations'], is_spine: true,
        why_learn: 'Why a gradient can exist at a single point. The secant interval shrinks continuously while the slope readout settles on one number — the gap stays visible and never closes, which is exactly the distinction between approaching and reaching that a static board sketch cannot make.',
    },
    {
        concept_id: 'definite_integral_as_area',
        concept_name: 'The Definite Integral as Accumulated Area',
        chapter: 8, section: '8.1', class_level: 12, prerequisites: ['derivative_as_secant_limit'], is_spine: true,
        why_learn: 'A teacher draws four rectangles and says "imagine a thousand". The sim runs four to a thousand while the running sum converges on screen, so the limit is watched rather than asserted.',
    },
    {
        concept_id: 'unit_circle_to_sine_wave',
        concept_name: 'The Unit Circle Unrolled into Sine and Cosine',
        chapter: 3, section: '3.1', class_level: 11, prerequisites: [], is_spine: true,
        why_learn: 'Where the sine wave actually comes from: a point going round a circle, its height carried sideways. The continuity of the correspondence is the whole lesson, and a board can only show two or three frozen positions.',
    },

    // ── P2 — strong, cheapest available ─────────────────────────────────────
    {
        concept_id: 'vector_dot_and_cross_product',
        concept_name: 'Vectors in Space — Dot and Cross Product',
        chapter: 10, section: '10.1', class_level: 12, prerequisites: [],
        why_learn: 'The cross product points out of the plane of the two vectors, and its length is the area of the parallelogram they span. Both facts are three-dimensional, which is precisely where a flat board and a waving hand fail.',
    },
    {
        concept_id: 'conditional_probability_base_rates',
        concept_name: 'Conditional Probability and Base Rates',
        chapter: 13, section: '13.1', class_level: 12, prerequisites: [],
        why_learn: 'A test that is 99% accurate can still be wrong most of the time it says yes. A thousand cases fill in on screen and the result contradicts the intuition directly — the counterintuitive answer becomes believable instead of merely proved.',
    },
    {
        concept_id: 'conic_sections_as_loci',
        concept_name: 'Conic Sections as Loci',
        chapter: 10, section: '10.1', class_level: 11, prerequisites: [],
        why_learn: 'Each conic is one distance condition traced out. Changing a single constant morphs ellipse into parabola into hyperbola continuously, showing they are one family rather than three memorised equations.',
    },

    // ── P3 — real diamonds, narrower or costlier ────────────────────────────
    {
        concept_id: 'solids_of_revolution',
        concept_name: 'Solids of Revolution — Volume by Integration',
        chapter: 8, section: '8.2', class_level: 12, prerequisites: ['definite_integral_as_area'],
    },
    {
        concept_id: 'lines_and_planes_in_space',
        concept_name: 'Lines and Planes in Space',
        chapter: 11, section: '11.1', class_level: 12, prerequisites: ['vector_dot_and_cross_product'],
    },
    {
        concept_id: 'sampling_and_central_limit',
        concept_name: 'Sampling and the Central Limit Theorem',
        chapter: 13, section: '13.2', class_level: 12, prerequisites: ['conditional_probability_base_rates'],
    },
    {
        concept_id: 'argand_plane_complex_numbers',
        concept_name: 'Complex Numbers on the Argand Plane',
        chapter: 4, section: '4.1', class_level: 11, prerequisites: [],
    },
    {
        concept_id: 'differential_equation_slope_fields',
        concept_name: 'Differential Equations and Slope Fields',
        chapter: 9, section: '9.1', class_level: 12, prerequisites: ['derivative_as_secant_limit'],
    },
];
