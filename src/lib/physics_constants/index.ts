// =============================================================================
// src/lib/physics_constants/index.ts
//
// Loader for per-concept physics constants JSON files.
// These files are the authoritative source of NCERT-locked facts and
// animation constraints — they are never generated or overridden by AI.
//
// Usage:
//   import { loadConstants } from "@/lib/physics_constants";
//   const constants = await loadConstants("drift_velocity");
// =============================================================================

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { normalizeOldStates } from "@/lib/jsonBridge";

// ---------------------------------------------------------------------------
// PhysicsConstantsFile — shape of every {conceptId}.json file
// ---------------------------------------------------------------------------

/**
 * The structure of a physics constants JSON file located at
 * `src/lib/physics_constants/{concept}.json`.
 *
 * All values are locked — they must never be overwritten by AI output.
 */
export interface PhysicsConstantsFile {
  /**
   * Concept identifier, matching the filename stem.
   * Example: "drift_velocity", "ohms_law"
   */
  concept: string;

  /**
   * NCERT-verified facts that the simulation must faithfully represent.
   * Keys are fact names; values are string representations of the fact
   * (direction strings, formula strings, order-of-magnitude strings, etc.).
   *
   * Example: { "formula": "vd = (e * E * tau) / m" }
   */
  locked_facts: Record<string, string>;

  /**
   * Bounds and invariants that the animation renderer must satisfy.
   * Values can be numbers (px/frame limits), booleans (must-hold flags),
   * or strings (direction labels).
   *
   * Example: { "drift_px_per_frame_max": 1.5, "thermal_must_be_faster_than_drift": true }
   */
  animation_constraints: Record<string, string | number | boolean>;

  /**
   * Plain-English NCERT statements used by the Truth Anchor (Claude Sonnet)
   * to validate that a generated simulation config is physically correct.
   *
   * Each string maps to one checkable assertion about the concept.
   */
  ncert_truth_statements: string[];
}

// ---------------------------------------------------------------------------
// normalizeConstants — unify Schema A + Schema B into PhysicsConstantsFile
// ---------------------------------------------------------------------------

function normalizeConstants(raw: Record<string, unknown>): PhysicsConstantsFile {
  // New format (src/data/concepts/) — has epic_l_path, return as-is
  if (raw.epic_l_path) {
    // locked_facts may be object (new format) — normalize if array
    const lf = raw.locked_facts;
    let lockedFacts: Record<string, string>;
    if (Array.isArray(lf)) {
      lockedFacts = {};
      (lf as string[]).forEach((fact, i) => {
        lockedFacts[`fact_${i + 1}`] = fact;
      });
    } else {
      lockedFacts = (lf as Record<string, string>) ?? {};
    }
    return {
      // Passthrough all new-format fields (epic_l_path, epic_c_branches, etc.)
      ...raw,
      // Override with normalized values
      concept: String(raw.concept_id ?? raw.concept_name ?? raw.concept ?? ''),
      locked_facts: lockedFacts,
      animation_constraints: (raw.animation_constraints as Record<string, unknown>) ?? {},
      ncert_truth_statements: (
        raw.truth_statements ??
        raw.ncert_truth_statements ??
        []
      ) as string[],
    } as unknown as PhysicsConstantsFile;
  }

  // Old format with simulation_states array — build epic_l_path bridge
  if (Array.isArray(raw.simulation_states) && raw.simulation_states.length > 0) {
    const epicLPath = normalizeOldStates(
      raw.simulation_states as Array<{ id: string; label: string; description: string; emphasis: string }>,
      String(raw.concept ?? ''),
    );
    // Detect Schema B: locked_facts is an array
    let lockedFacts: Record<string, string>;
    if (Array.isArray(raw.locked_facts)) {
      lockedFacts = {};
      (raw.locked_facts as string[]).forEach((fact, i) => {
        lockedFacts[`fact_${i + 1}`] = fact;
      });
    } else {
      lockedFacts = (raw.locked_facts as Record<string, string>) ?? {};
    }
    return {
      concept: String(raw.concept_id ?? raw.concept_name ?? raw.concept ?? ''),
      locked_facts: lockedFacts,
      animation_constraints: (raw.animation_constraints as Record<string, unknown>) ?? {},
      ncert_truth_statements: (
        raw.truth_statements ??
        raw.ncert_truth_statements ??
        []
      ) as string[],
      renderer_hint: raw.renderer_hint,
      aha_moment: raw.aha_moment,
      simulation_states: raw.simulation_states,
      common_misconceptions: raw.common_misconceptions,
      legend: raw.legend,
      concept_id: String(raw.concept_id ?? ''),
      epic_l_path: epicLPath,
    } as unknown as PhysicsConstantsFile;
  }

  // Schema A (no simulation_states, no epic_l_path) — return as-is
  return raw as unknown as PhysicsConstantsFile;
}

// ---------------------------------------------------------------------------
// loadConstants — async loader
// ---------------------------------------------------------------------------

/**
 * Load and parse the physics constants JSON file for a given concept.
 *
 * The file is read from:
 *   `<projectRoot>/src/lib/physics_constants/{conceptId}.json`
 *
 * @param conceptId  Concept identifier matching the JSON filename stem,
 *                   e.g. `"drift_velocity"`, `"ohms_law"`.
 * @returns          Parsed `PhysicsConstantsFile` object.
 * @throws           If the file does not exist or cannot be parsed.
 *
 * @example
 * const constants = await loadConstants("drift_velocity");
 * console.log(constants.locked_facts.formula);
 * // → "vd = (e * E * tau) / m"
 */
export async function loadConstants(conceptId: string): Promise<PhysicsConstantsFile | null> {
  const CONCEPT_ALIASES: Record<string, string> = {
    'relative_motion_in_2d': 'river_boat_problems',
    'kinematics_1d': 'uniform_acceleration',
    'projectile_2d': 'projectile_motion',
  };
  if (CONCEPT_ALIASES[conceptId]) {
    conceptId = CONCEPT_ALIASES[conceptId];
  }

  // Priority 1: new-format JSON in src/data/concepts/
  const projectRoot = process.cwd();
  const newFormatPath = path.join(projectRoot, "src", "data", "concepts", `${conceptId}.json`);

  if (existsSync(newFormatPath)) {
    console.log(`[loadConstants] Found new-format: ${conceptId} at ${newFormatPath}`);
    const raw = await readFile(newFormatPath, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return normalizeConstants(parsed);
  }

  // Priority 2: old-format JSON in src/lib/physics_constants/
  const oldFormatPath = path.join(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
    `${conceptId}.json`,
  );

  console.log(`[loadConstants] Looking for old-format: ${conceptId} at ${oldFormatPath}`);

  let raw: string;
  try {
    raw = await readFile(oldFormatPath, "utf-8");
  } catch {
    console.warn(`[physics_constants] No physics constants found for ${conceptId} — proceeding without constants`);
    return null;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    throw new Error(
      `Failed to parse physics constants JSON for concept: ${conceptId}\n` +
      `File: ${oldFormatPath}\n` +
      `Original error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  return normalizeConstants(parsed);
}
