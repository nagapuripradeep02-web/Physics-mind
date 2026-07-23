// ── Chemistry catalog data (NCERT Class 11) ──────────────────────────────────
// Sibling of the physics catalog data embedded in `conceptCatalog.ts`, kept in a
// SEPARATE file so the physics and chemistry teams don't collide in one array
// (CHEMISTRY_BUILD_PLAN.md Phase 1; the concurrency rationale from
// src/data/concepts/chemistry/README.md).
//
// This file is DATA ONLY — the routing that selects it by subject lives in
// `conceptCatalog.ts` (`sourcesFor`). Type-only imports below keep the dependency
// one-directional at runtime (conceptCatalog imports these values; this file
// imports only erased types from conceptCatalog) — no import cycle.
//
// Everything here is STATUS 'ghost' (roadmap placeholders). No chemistry concept
// is live until Phase 3 authors one into src/data/concepts/chemistry/ AND registers
// its render path. Chapter scope is deliberately narrow (Ch.1–4, the foundational
// physical-chemistry block) — extend per CHEMISTRY_ARCHITECTURE.md §9 as concepts land.

import type { GhostSeed } from './conceptCatalog';

// NCERT Class 11 Chemistry — the four foundational chapters (stable across the
// 2023 rationalisation). Numbering follows the NCERT textbook order.
// ⚠ Any chapter beyond these four must be verified against the current rationalised
// syllabus before seeding (states-of-matter / hydrogen were dropped) — see the
// curriculum caution in CHEMISTRY_ARCHITECTURE.md §9.
export const CHEMISTRY_CHAPTER_NAMES: Record<number, string> = {
    1: 'Some Basic Concepts of Chemistry',
    2: 'Structure of Atom',
    3: 'Classification of Elements & Periodicity',
    4: 'Chemical Bonding & Molecular Structure',
};

// Section labels, keyed `${chapter}.${majorSection}` (same convention as physics
// SECTION_NAMES). Seeded for Ch.2 — the first-concept working area.
export const CHEMISTRY_SECTION_NAMES: Record<string, string> = {
    '2.1': 'Sub-atomic Particles',
    '2.2': 'Atomic Models',
    '2.3': 'Quantum Model of the Atom',
};

// Roadmap ghosts for Ch.2 "Structure of Atom" — the foundational, most-simulatable
// entry per CHEMISTRY_ARCHITECTURE.md §9. These name the candidate first concepts
// (Rutherford / Bohr recommended; orbitals are Phase-5 renderer scope). concept_ids
// are chemistry-scoped and do not collide with physics (separate array, queried only
// under subject='chemistry'). All 'ghost' until authored.
export const CHEMISTRY_GHOSTS: GhostSeed[] = [
    // §2.1 Sub-atomic particles
    { concept_id: 'discovery_of_electron', concept_name: 'Discovery of the Electron', chapter: 2, section: '2.1', class_level: 11, prerequisites: [] },
    { concept_id: 'discovery_of_proton_neutron', concept_name: 'Discovery of Proton & Neutron', chapter: 2, section: '2.1', class_level: 11, prerequisites: ['discovery_of_electron'] },
    { concept_id: 'atomic_number_mass_number', concept_name: 'Atomic Number & Mass Number', chapter: 2, section: '2.1', class_level: 11, prerequisites: ['discovery_of_proton_neutron'] },

    // §2.2 Atomic models — the first-simulation candidates
    { concept_id: 'thomson_model', concept_name: 'Thomson (Plum-Pudding) Model', chapter: 2, section: '2.2', class_level: 11, prerequisites: ['discovery_of_electron'] },
    { concept_id: 'rutherford_alpha_scattering', concept_name: 'Rutherford α-Particle Scattering', chapter: 2, section: '2.2', class_level: 11, prerequisites: ['thomson_model'], is_spine: true, why_learn: 'The experiment that discovered the nucleus — a few α-particles bouncing straight back proved the atom is almost entirely empty space with a tiny dense centre. Everything about atomic structure starts here.' },
    { concept_id: 'bohr_model', concept_name: 'Bohr Model — Quantised Energy Levels', chapter: 2, section: '2.2', class_level: 11, prerequisites: ['rutherford_alpha_scattering'], is_spine: true, why_learn: 'Why atoms only emit certain colours of light: electrons live on fixed energy rungs and jump between them. The bridge from "planetary atom" to the quantum picture.' },
    { concept_id: 'hydrogen_spectrum', concept_name: 'Hydrogen Emission Spectrum', chapter: 2, section: '2.2', class_level: 11, prerequisites: ['bohr_model'] },

    // §2.3 Quantum model — Phase-5 renderer scope (orbitals)
    { concept_id: 'atomic_orbitals_spd', concept_name: 'Atomic Orbitals — s, p, d Shapes', chapter: 2, section: '2.3', class_level: 11, prerequisites: ['bohr_model'] },
    { concept_id: 'electronic_configuration', concept_name: 'Electronic Configuration & Filling Rules', chapter: 2, section: '2.3', class_level: 11, prerequisites: ['atomic_orbitals_spd'], is_spine: true },
];
