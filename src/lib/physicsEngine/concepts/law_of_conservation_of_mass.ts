// law_of_conservation_of_mass — second CHEMISTRY concept through the pipeline
// (2026-07-27). Renders on the existing 2D `parametric` renderer
// (renderer_pair.panel_a: "parametric") — zero new engine code, per
// docs/patterns/chemistry.md archetype O (reaction ledger).
//
// Closed-system mass ledger for C(s) + O2(g) -> CO2(g): m_O2 = m_C*32/12,
// m_CO2 = m_C*44/12 (teaching-rounded integer atomic masses, M_C=12, M_O=16).
// The balance reading model (chemistry block §2, corrected from the
// architect skeleton's original DoD (j) — see the concept JSON's authoring
// note): a sealed vessel is pre-loaded with its O2 before reacting, so its
// reading never moves (reading_initial === reading_final === tare + m_C +
// m_O2, an algebraic identity for every m_C); an open pan never had O2 on
// it, so once the reacted mass has escaped as CO2 gas, only the bare
// apparatus (tare) remains on the reading.
//
// STATE_5's rusting twin-misconception ledger uses fixed staged constants
// (m_Fe_before_S5, m_gas_before_S5, m_O2_reacted_S5), independent of the
// m_C/vessel_sealed sliders — the solid gains exactly what the sealed gas
// reservoir loses, so the TOTAL never moves.
//
// What the engine returns:
//   - variables: m_C (integer grams, 1..24, step 1 — the rounding-robustness
//                lock, chemistry block §3), vessel_sealed (0/1 toggle)
//   - derived: m_O2, m_CO2, n_C, m_reactants, m_products, reading_initial,
//              reading_final, delta_reading, m_solid_after_S5,
//              m_gas_after_S5, m_total_S5, atoms_scale_label — EXACTLY the
//              physics_engine_config.computed_outputs key set (diffed
//              against this file at authoring time per engine_bug_queue
//              scar normal_reaction_state5_computed_outputs_name_mismatch)
//   - forces: [] — visuals are authored (balance, tiles, atoms), not
//              engine-driven
//   - graph: [] — single panel (panel_a: parametric), no graph
//   - constraints_ok: true (m_C/vessel_sealed clamped by variable_ranges)
//
// Iframe-side fallback in parametric_renderer.ts
// (computePhysics_law_of_conservation_of_mass) mirrors this exactly — keep
// the two in sync (Lesson learned from bohr_model_energy_levels).
//
// Type note: `derived` here intentionally carries a string member
// (atoms_scale_label) beyond PhysicsResult's numeric-only
// Record<string, number> typing (same accommodation bohr_model_energy_levels
// made for direction/spectral_region/lambda_nm). This file casts locally
// rather than widening the shared type.

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

const TARE = 38.0;
const M_FE_BEFORE_S5 = 10.0;
const M_GAS_BEFORE_S5 = 5.0;
const M_O2_REACTED_S5 = 0.6;

function computeLedgerDerived(m_C: number, vessel_sealed: number) {
  const sealed = vessel_sealed >= 0.5;
  const m_O2 = (m_C * 32) / 12;
  const m_CO2 = (m_C * 44) / 12;
  const n_C = m_C / 12;
  const m_reactants = m_C + m_O2;
  const m_products = m_CO2;
  const reading_initial = TARE + m_C + (sealed ? m_O2 : 0);
  const reading_final = TARE + (sealed ? m_C + m_O2 : 0);
  const delta_reading = reading_final - reading_initial;
  const m_solid_after_S5 = M_FE_BEFORE_S5 + M_O2_REACTED_S5;
  const m_gas_after_S5 = M_GAS_BEFORE_S5 - M_O2_REACTED_S5;
  const m_total_S5 = M_FE_BEFORE_S5 + M_GAS_BEFORE_S5;
  const atoms_scale_label = `≈ ${n_C.toFixed(2)} × 6.022×10²³ atoms`;
  return {
    m_O2,
    m_CO2,
    n_C,
    m_reactants,
    m_products,
    reading_initial,
    reading_final,
    delta_reading,
    m_solid_after_S5,
    m_gas_after_S5,
    m_total_S5,
    atoms_scale_label,
  };
}

export const lawOfConservationOfMassEngine: ConceptPhysicsEngine = {
  default_variables: { m_C: 12, vessel_sealed: 1 },
  variable_ranges: {
    m_C: { min: 1, max: 24, step: 1, unit: 'g' },
    vessel_sealed: { min: 0, max: 1, step: 1, unit: '' },
  },
  compute(variables): PhysicsResult {
    const { m_C, vessel_sealed } = variables;
    const derived = computeLedgerDerived(m_C, vessel_sealed);
    return {
      concept_id: 'law_of_conservation_of_mass',
      variables,
      derived,
      forces: [],
      graph: [],
      constraints_ok: true,
      warnings: [],
    } as unknown as PhysicsResult;
  },
};
