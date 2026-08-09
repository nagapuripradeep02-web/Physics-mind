import { fieldForcesEngine } from './concepts/field_forces';
import { contactForcesEngine } from './concepts/contact_forces';
import { normalReactionEngine } from './concepts/normal_reaction';
import { tensionInStringEngine } from './concepts/tension_in_string';
import { hingeForceEngine } from './concepts/hinge_force';
import { freeBodyDiagramEngine } from './concepts/free_body_diagram';
import { vectorResolutionEngine } from './concepts/vector_resolution';
import { frictionStaticKineticEngine } from './concepts/friction_static_kinetic';
import { vectorHeadToTailEngine } from './concepts/vector_head_to_tail';
import { newtonSecondLawDirectionEngine } from './concepts/newton_second_law_direction';
import { magneticFieldWireEngine } from './concepts/magnetic_field_wire';
import { magneticForceMovingChargeEngine } from './concepts/magnetic_force_moving_charge';
import { torqueOnCurrentLoopInFieldEngine } from './concepts/torque_on_current_loop_in_field';
import { bohrModelEnergyLevelsEngine } from './concepts/bohr_model_energy_levels';
import { lawOfConservationOfMassEngine } from './concepts/law_of_conservation_of_mass';
import { unitCircleToSineWaveEngine } from './concepts/unit_circle_to_sine_wave';
import { graphTransformationsEngine } from './concepts/graph_transformations';
import { derivativeAsSecantLimitEngine } from './concepts/derivative_as_secant_limit';
import { definiteIntegralAsAccumulatedAreaEngine } from './concepts/definite_integral_as_accumulated_area';
import type { ConceptPhysicsEngine, PhysicsResult } from './types';

const ENGINES: Record<string, ConceptPhysicsEngine> = {
  field_forces: fieldForcesEngine,
  contact_forces: contactForcesEngine,
  normal_reaction: normalReactionEngine,
  tension_in_string: tensionInStringEngine,
  hinge_force: hingeForceEngine,
  free_body_diagram: freeBodyDiagramEngine,
  vector_resolution: vectorResolutionEngine,
  friction_static_kinetic: frictionStaticKineticEngine,
  vector_head_to_tail: vectorHeadToTailEngine,
  newton_second_law_direction: newtonSecondLawDirectionEngine,
  magnetic_field_wire: magneticFieldWireEngine,
  magnetic_force_moving_charge: magneticForceMovingChargeEngine,
  torque_on_current_loop_in_field: torqueOnCurrentLoopInFieldEngine,
  bohr_model_energy_levels: bohrModelEnergyLevelsEngine,
  law_of_conservation_of_mass: lawOfConservationOfMassEngine,
  unit_circle_to_sine_wave: unitCircleToSineWaveEngine,
  graph_transformations: graphTransformationsEngine,
  derivative_as_secant_limit: derivativeAsSecantLimitEngine,
  definite_integral_as_accumulated_area: definiteIntegralAsAccumulatedAreaEngine,
};

export function computePhysics(
  conceptId: string,
  variables?: Record<string, number>
): PhysicsResult | null {
  const engine = ENGINES[conceptId];
  if (!engine) return null;

  const mergedVars = {
    ...engine.default_variables,
    ...(variables ?? {}),
  };

  return engine.compute(mergedVars);
}

export function getDefaultVariables(conceptId: string): Record<string, number> | null {
  return ENGINES[conceptId]?.default_variables ?? null;
}

export function getVariableRanges(conceptId: string) {
  return ENGINES[conceptId]?.variable_ranges ?? null;
}

export type { PhysicsResult, Force, Vector2D, GraphTrace, GraphPoint, ConceptPhysicsEngine } from './types';
