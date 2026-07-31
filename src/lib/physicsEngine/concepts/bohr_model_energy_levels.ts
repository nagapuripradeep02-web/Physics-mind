// bohr_model_energy_levels — first CHEMISTRY concept through the pipeline
// (Wave 1, 2026-07-23). Renders on the existing 2D `parametric` renderer
// (renderer_pair.panel_a: "parametric") — zero new engine code, per
// docs/patterns/chemistry.md archetype L.
//
// Hydrogen Bohr energy levels: Eₙ = -13.6/n² eV. A transition between
// n_start and n_end absorbs a photon (n_end > n_start) or emits one
// (n_end < n_start) of energy ΔE = |E_hi - E_lo| eV; wavelength
// λ = hc/ΔE using the teaching-rounded hc = 1240 eV·nm constant (the
// precise value 1239.84 is never propagated into the stored ΔE — only
// the whole-nm λ display is rounded).
//
// What the engine returns:
//   - variables: n_start, n_end (integer level indices, 1..6, snap-required)
//   - derived: delta_E_ev (2dp), lambda_nm (whole-nm, null when
//              n_start === n_end — division-by-zero guard), direction
//              ('absorb'|'emit'|'none'), spectral_region
//              ('UV'|'VISIBLE'|'IR'|'none' — gates strip painting), n_hi, n_lo
//   - forces: [] — visuals are authored (ladder rungs, photon arrows,
//              strip lines), not engine-driven
//   - graph: [] — single panel (panel_a: parametric), no graph
//   - constraints_ok: true (n_start/n_end clamped to 1..6 by variable_ranges)
//
// Iframe-side fallback in parametric_renderer.ts
// (computePhysics_bohr_model_energy_levels) mirrors this exactly — keep the
// two in sync (Lesson learned from vector_head_to_tail / newton_second_law_direction).
//
// Type note: `derived` here intentionally carries string/null members
// (direction, spectral_region, lambda_nm) beyond PhysicsResult's
// numeric-only `Record<string, number>` typing (shared with every physics
// engine in this directory). This file casts locally rather than widening
// the shared type — the only concept that needs non-numeric derived fields
// so far. If a future concept needs the same shape, promote this to a
// proper type-level fix in ../types.ts instead of copying the cast.

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

function computeBohrDerived(n_start: number, n_end: number) {
  const n_hi = Math.max(n_start, n_end);
  const n_lo = Math.min(n_start, n_end);
  const E = (n: number) => -13.6 / (n * n);
  // Precise (unrounded) ΔE drives λ — rounding is a DISPLAY concern only and
  // must never be propagated into the stored ΔE before the division (chem
  // block §1 constraint: "rounding is for whole-nm display only, never
  // propagated into stored ΔE"). Rounding delta_E_ev first and dividing the
  // rounded value drifts λ by up to 1 nm off the verified ledger (e.g. 6→2
  // gives 411 nm instead of the verified 410 nm) — caught in the build:review
  // smoke check, session authoring this concept.
  const deltaEPrecise = Math.abs(E(n_hi) - E(n_lo));
  const delta_E_ev = Math.round(deltaEPrecise * 100) / 100;
  const direction = n_end > n_start ? 'absorb' : n_end < n_start ? 'emit' : 'none';
  const lambda_nm = deltaEPrecise > 0 ? Math.round(1240 / deltaEPrecise) : null;
  const spectral_region =
    lambda_nm == null ? 'none' : lambda_nm < 400 ? 'UV' : lambda_nm <= 700 ? 'VISIBLE' : 'IR';
  return { delta_E_ev, lambda_nm, direction, spectral_region, n_hi, n_lo };
}

export const bohrModelEnergyLevelsEngine: ConceptPhysicsEngine = {
  default_variables: { n_start: 3, n_end: 2 },
  variable_ranges: {
    n_start: { min: 1, max: 6, step: 1, unit: '' },
    n_end: { min: 1, max: 6, step: 1, unit: '' },
  },
  compute(variables): PhysicsResult {
    const { n_start, n_end } = variables;
    const derived = computeBohrDerived(n_start, n_end);
    return {
      concept_id: 'bohr_model_energy_levels',
      variables,
      derived,
      forces: [],
      graph: [],
      constraints_ok: true,
      warnings: [],
    } as unknown as PhysicsResult;
  },
};
