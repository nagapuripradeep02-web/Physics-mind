/**
 * E42 — PCPL Physics Validator
 *
 * Pure, synchronous physics-correctness gate for PCPL scene_composition
 * payloads. Built to catch the Sonnet-emitted direction-degree errors that
 * session-20 visual audit surfaced on normal_reaction STATE_3 deep-dive:
 *   - mg_perp labelled at direction_deg=240° when physics requires 300°
 *     (= N + 180° where N = 90° + surface_angle_deg)
 *   - N drawn at ~60° when physics requires 90° + surface_angle_deg
 *   - angle_arc with angle_value=0 on an inclined surface (should match surface angle)
 *
 * Runs in <2 ms. Zero I/O. Zero AI calls.
 *
 * Intended call sites (Phase H wiring):
 *   - deepDiveGenerator.ts  — after Sonnet JSON parse, before cache upsert
 *   - drillDownGenerator.ts — same
 *   - Engine 25 5-agent pipeline (when built) — as hard gate before validator-green promotion
 *   - CLI audit script (scripts/audit-pcpl-physics.ts) — to retroactively scan
 *     existing deep_dive_cache rows for violations
 *
 * Convention (CRITICAL — must match parametric_renderer.ts drawForceArrow line 981):
 *   direction_deg is physics-y-up / world-frame. 0° = +x (right), 90° = up,
 *   180° = left, 270° = down. Block rotation does NOT rotate the direction_deg
 *   convention — direction_deg is always world-frame.
 *
 * Surface angle convention:
 *   angle_deg on a surface = math-CCW angle from +x axis. A surface going
 *   up-to-the-right (y0 > y1, x1 > x0) has positive angle_deg.
 *   For a block sitting on such a surface with orient_to_surface=true:
 *     - Normal direction (away from surface, into air above) = 90° + surface_angle_deg
 *     - Into-surface direction (opposite) = 270° + surface_angle_deg  (= N + 180)
 *     - Full weight mg direction is always 270° (straight down), INDEPENDENT of surface.
 */

export type ViolationCode =
  | 'NORMAL_DIRECTION_WRONG'
  | 'MG_PERP_DIRECTION_WRONG'
  | 'MG_FULL_DIRECTION_WRONG'
  | 'N_AND_PERP_NOT_OPPOSITE'
  | 'ANGLE_ARC_VALUE_WRONG'
  | 'ANGLE_ARC_MISSING_ON_INCLINE'
  | 'SURFACE_ANGLE_OUT_OF_RANGE'
  | 'BODY_MISSING_SURFACE_REF';

export type Severity = 'CRITICAL' | 'WARNING';

export interface PCPLViolation {
  code: ViolationCode;
  severity: Severity;
  primitive_id: string;
  state_id?: string;
  message: string;
  expected: number | string;
  actual: number | string;
}

export interface PCPLPhysicsValidationInput {
  scene_composition: unknown[];
  state_id?: string;
  /** Optional tolerance for direction_deg comparison (default ±2°). */
  direction_tolerance_deg?: number;
  /**
   * Optional parent-state scene_composition. Deep-dive and drill-down
   * sub-states often OMIT the surface primitive because the iframe hoists it
   * from the parent at render time; passing the parent scene here lets E42
   * know the actual surface angle and stops false-positive flags on N arrows.
   * Bodies / forces / angle_arcs from the parent are IGNORED — only `surface`
   * primitives are pulled in.
   */
  parent_scene_composition?: unknown[];
  /**
   * Optional default_variables — used to evaluate `angle_expr` when the
   * surface's angle is a string expression like "theta" referencing a state
   * variable. If the expression cannot be resolved, the surface angle is
   * left UNKNOWN and absolute direction checks for that surface are skipped
   * (relative N-vs-perp check still runs).
   */
  default_variables?: Record<string, number>;
}

export interface PCPLPhysicsValidationResult {
  valid: boolean;
  violations: PCPLViolation[];
  registry: {
    surfaces: number;
    bodies: number;
    forces: number;
  };
}

// ─── Internal shapes we care about ──────────────────────────────────────────

interface SurfaceInfo {
  id: string;
  orientation: string;
  angle_deg: number;
}

interface BodyInfo {
  id: string;
  surface_id?: string;
  orient_to_surface: boolean;
}

interface ForceLike {
  id?: string;
  type?: string;
  label?: string;
  from?: string;
  direction_deg?: number;
  direction_deg_expr?: string;
  magnitude?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mod360(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

function angleDiff(a: number, b: number): number {
  const d = Math.abs(mod360(a) - mod360(b));
  return Math.min(d, 360 - d);
}

/**
 * Classify a force primitive by its label/id to decide which rule to apply.
 * The classification is the SAME semantics the teacher script uses — N means
 * normal force, mg_perp means the component of weight perpendicular to the
 * surface, mg means full weight (straight down).
 */
type ForceKind = 'N' | 'mg_perp' | 'mg_parallel' | 'mg_full' | 'unknown';

function classifyForce(f: ForceLike): ForceKind {
  const id = (f.id || '').toLowerCase();
  const label = (f.label || '').toLowerCase();
  // Order matters — check most-specific first.
  if (/mg[_\s]*perp|mg[_\s]*cos|perp[_\s]*component/.test(id)
      || /mg\s*cos|perpendicular[_\s]*component|normal[_\s]*component/.test(label)) {
    return 'mg_perp';
  }
  if (/mg[_\s]*parallel|mg[_\s]*sin|parallel[_\s]*component|slide[_\s]*component/.test(id)
      || /mg\s*sin|parallel[_\s]*component/.test(label)) {
    return 'mg_parallel';
  }
  if (/^n(_|$)|normal[_\s]*force/.test(id) || /^n\s*=|^n\s*\(/.test(label)) {
    return 'N';
  }
  if (/^mg$|^weight|^gravity/.test(id) || /^mg\s*=|^weight/.test(label)) {
    return 'mg_full';
  }
  return 'unknown';
}

/**
 * Parse `from` anchor string like "block.top_center" → "block".
 * Returns null if the anchor is a zone or surface reference.
 */
function bodyFromAnchor(anchor: string | undefined): string | null {
  if (!anchor || typeof anchor !== 'string') return null;
  const dot = anchor.indexOf('.');
  if (dot === -1) return null;
  const lhs = anchor.substring(0, dot);
  // Heuristic: zones are ALL_CAPS. Surfaces usually contain 'floor'|'ramp'|'incline'|'wall'|'ground'.
  if (lhs === lhs.toUpperCase()) return null;
  if (/floor|ramp|incline|wall|ground|surface/i.test(lhs)) return null;
  return lhs;
}

// ─── Registry build ─────────────────────────────────────────────────────────

/**
 * Try to resolve an angle_expr string into a numeric degree value.
 * Supports:
 *   - Pure numeric literals ("30", "30.5")
 *   - Simple variable lookups ("theta" → default_variables.theta)
 *   - Basic arithmetic expressions ("90 - theta") via a tiny whitelist evaluator
 * Returns null when resolution fails — caller treats surface angle as UNKNOWN.
 */
function resolveAngleExpr(
  expr: string,
  vars: Record<string, number> | undefined,
): number | null {
  const trimmed = expr.trim();
  // Pure number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const n = parseFloat(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  // Simple variable reference
  if (/^[a-zA-Z_][\w]*$/.test(trimmed) && vars && Number.isFinite(vars[trimmed])) {
    return vars[trimmed];
  }
  // Arithmetic whitelist — only digits, dots, identifiers, + − * / ( ) spaces.
  if (/^[\w\s+\-*/().]+$/.test(trimmed) && vars) {
    try {
      const prepared = trimmed.replace(/[a-zA-Z_][\w]*/g, (name) => {
        const v = vars[name];
        return Number.isFinite(v) ? String(v) : 'NaN';
      });
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict"; return (${prepared});`)();
      if (typeof result === 'number' && Number.isFinite(result)) return result;
    } catch {
      return null;
    }
  }
  return null;
}

function buildRegistries(
  scene: unknown[],
  vars?: Record<string, number>,
): {
  surfaces: Map<string, SurfaceInfo>;
  bodies: Map<string, BodyInfo>;
  forces: ForceLike[];
  angleArcs: Array<{ id: string; surface_id?: string; angle_value?: number; to_deg?: number }>;
} {
  const surfaces = new Map<string, SurfaceInfo>();
  const bodies = new Map<string, BodyInfo>();
  const forces: ForceLike[] = [];
  const angleArcs: Array<{ id: string; surface_id?: string; angle_value?: number; to_deg?: number }> = [];

  for (const raw of scene) {
    if (!raw || typeof raw !== 'object') continue;
    const p = raw as Record<string, unknown>;
    const type = typeof p.type === 'string' ? p.type : '';
    const id = typeof p.id === 'string' ? p.id : '';
    if (!type || !id) continue;

    if (type === 'surface') {
      // Sonnet sub-states sometimes emit incomplete surface primitives —
      // no orientation/angle, or `angle_expr` instead of `angle`. Handle all
      // three: (a) pure stubs → don't register, wait for parent-seed merge;
      // (b) full numeric angle → register; (c) angle_expr as numeric-string
      // or state-variable reference → resolve via `vars`.
      const hasOrientation = typeof p.orientation === 'string';
      const hasAngle = typeof p.angle === 'number';
      const angleExpr = typeof p.angle_expr === 'string' ? p.angle_expr : null;
      const resolvedExpr = angleExpr ? resolveAngleExpr(angleExpr, vars) : null;
      if (!hasOrientation && !hasAngle && resolvedExpr === null) {
        // Stub only. Don't register — parent-seed pass will fill this in.
        continue;
      }
      const orientation = hasOrientation ? (p.orientation as string) : 'horizontal';
      let angle_deg = 0;
      if (orientation === 'horizontal') angle_deg = 0;
      else if (orientation === 'vertical') angle_deg = 90;
      else if (orientation === 'inclined' && hasAngle) angle_deg = p.angle as number;
      else if (orientation === 'inclined' && resolvedExpr !== null) angle_deg = resolvedExpr;
      surfaces.set(id, { id, orientation, angle_deg });
    } else if (type === 'body') {
      const ats = p.attach_to_surface;
      let surface_id: string | undefined;
      let orient_to_surface = false;
      if (typeof ats === 'string') {
        surface_id = ats;
      } else if (ats && typeof ats === 'object') {
        const o = ats as Record<string, unknown>;
        if (typeof o.surface_id === 'string') surface_id = o.surface_id;
        if (o.orient_to_surface === true) orient_to_surface = true;
      }
      // Some JSONs put orient_to_surface as a sibling of attach_to_surface.
      if (p.orient_to_surface === true) orient_to_surface = true;
      bodies.set(id, { id, surface_id, orient_to_surface });
    } else if (type === 'force_arrow' || type === 'vector') {
      forces.push(p as ForceLike);
    } else if (type === 'angle_arc') {
      angleArcs.push({
        id,
        surface_id: typeof p.surface_id === 'string' ? p.surface_id : undefined,
        angle_value: typeof p.angle_value === 'number' ? p.angle_value : undefined,
        to_deg: typeof p.to_deg === 'number' ? p.to_deg : undefined,
      });
    }
  }

  // ── Inference pass — Sonnet often omits the surface primitive inside
  // deep-dive sub-states (expecting the iframe to inherit it from the parent
  // state). Without it, E42 would default surface angle to 0 and false-flag
  // every inclined-surface force. Mitigation: when a body references a
  // surface_id that wasn't declared, use an angle_arc primitive bound to the
  // same surface_id to infer the angle.
  for (const arc of angleArcs) {
    if (!arc.surface_id) continue;
    if (surfaces.has(arc.surface_id)) continue;
    const angle = typeof arc.angle_value === 'number' ? arc.angle_value
      : typeof arc.to_deg === 'number' ? arc.to_deg
      : null;
    if (angle === null) continue;
    surfaces.set(arc.surface_id, {
      id: arc.surface_id,
      orientation: angle === 0 ? 'horizontal' : 'inclined',
      angle_deg: angle,
    });
  }

  return { surfaces, bodies, forces, angleArcs };
}

// ─── Rule runners ───────────────────────────────────────────────────────────

/**
 * Look up the surface that a force's `from` anchor ultimately lives on.
 * Returns surface_angle_deg, or null if the force isn't attached to a body
 * on a known surface.
 */
function resolveForceSurfaceAngle(
  force: ForceLike,
  bodies: Map<string, BodyInfo>,
  surfaces: Map<string, SurfaceInfo>,
): { surface_angle_deg: number; body_id: string } | null {
  const bodyId = bodyFromAnchor(force.from);
  if (!bodyId) return null;
  const body = bodies.get(bodyId);
  if (!body || !body.surface_id) return null;
  const surf = surfaces.get(body.surface_id);
  if (!surf) return null;
  return { surface_angle_deg: surf.angle_deg, body_id: bodyId };
}

// ─── Public entry ───────────────────────────────────────────────────────────

export function validatePCPLPhysics(
  input: PCPLPhysicsValidationInput,
): PCPLPhysicsValidationResult {
  const scene = Array.isArray(input.scene_composition) ? input.scene_composition : [];
  const tol = typeof input.direction_tolerance_deg === 'number' ? input.direction_tolerance_deg : 2;
  const violations: PCPLViolation[] = [];
  const stateId = input.state_id;

  const { surfaces, bodies, forces, angleArcs } = buildRegistries(scene, input.default_variables);

  // Seed with parent-state surfaces when the sub-state doesn't declare them.
  // Existing sub-state surface entries take precedence (the sub-state may
  // re-declare with a different angle — common in "what if θ=60°?" sub-states).
  if (Array.isArray(input.parent_scene_composition)) {
    const parentReg = buildRegistries(input.parent_scene_composition, input.default_variables);
    for (const [id, info] of parentReg.surfaces.entries()) {
      if (!surfaces.has(id)) surfaces.set(id, info);
    }
  }

  // ── Rule 1: surface.angle out of [0, 90] is nonsense for mechanics scenes.
  for (const s of surfaces.values()) {
    if (s.orientation === 'inclined' && (s.angle_deg < 0 || s.angle_deg > 90)) {
      violations.push({
        code: 'SURFACE_ANGLE_OUT_OF_RANGE',
        severity: 'WARNING',
        primitive_id: s.id,
        state_id: stateId,
        message: `Surface ${s.id} has angle ${s.angle_deg}°, expected 0–90°.`,
        expected: '0..90',
        actual: s.angle_deg,
      });
    }
  }

  // ── Rule 2: each force's direction_deg must match its classified kind and surface.
  // Collect N + mg_perp pairs per body to cross-check opposition (Rule 5).
  const perBody: Map<string, { N?: { deg: number; id: string }; perp?: { deg: number; id: string } }> = new Map();

  for (const f of forces) {
    const kind = classifyForce(f);
    if (kind === 'unknown') continue;
    const dirDeg = typeof f.direction_deg === 'number' ? f.direction_deg : null;
    // Forces with a dynamic direction_deg_expr bypass direction checks —
    // they're evaluated at render time against live slider state.
    if (dirDeg === null) continue;

    if (kind === 'mg_full') {
      const expected = 270;
      if (angleDiff(dirDeg, expected) > tol) {
        violations.push({
          code: 'MG_FULL_DIRECTION_WRONG',
          severity: 'CRITICAL',
          primitive_id: f.id || '(unnamed)',
          state_id: stateId,
          message:
            `Full weight mg must point straight down (270°), independent of surface tilt. ` +
            `Got ${dirDeg}°.`,
          expected,
          actual: dirDeg,
        });
      }
      continue;
    }

    const info = resolveForceSurfaceAngle(f, bodies, surfaces);
    if (!info) {
      violations.push({
        code: 'BODY_MISSING_SURFACE_REF',
        severity: 'WARNING',
        primitive_id: f.id || '(unnamed)',
        state_id: stateId,
        message:
          `Force ${f.id} (${kind}) anchored to "${f.from}" but the body or surface ` +
          `could not be resolved. Cannot physics-check direction.`,
        expected: 'body.surface_id resolvable',
        actual: String(f.from),
      });
      continue;
    }
    const theta = info.surface_angle_deg;

    if (kind === 'N') {
      const expected = mod360(90 + theta);
      if (angleDiff(dirDeg, expected) > tol) {
        violations.push({
          code: 'NORMAL_DIRECTION_WRONG',
          severity: 'CRITICAL',
          primitive_id: f.id || '(unnamed)',
          state_id: stateId,
          message:
            `Normal force N on a body resting on a ${theta}° surface must point ` +
            `perpendicular-out-of-surface at direction_deg = 90° + ${theta}° = ${expected}°. ` +
            `Got ${dirDeg}°.`,
          expected,
          actual: dirDeg,
        });
      }
      const entry = perBody.get(info.body_id) || {};
      entry.N = { deg: dirDeg, id: f.id || '(unnamed)' };
      perBody.set(info.body_id, entry);
    } else if (kind === 'mg_perp') {
      const expected = mod360(270 + theta);
      if (angleDiff(dirDeg, expected) > tol) {
        violations.push({
          code: 'MG_PERP_DIRECTION_WRONG',
          severity: 'CRITICAL',
          primitive_id: f.id || '(unnamed)',
          state_id: stateId,
          message:
            `Perpendicular component of weight (mg cos θ) on a body resting on a ${theta}° ` +
            `surface must point into-surface at direction_deg = 270° + ${theta}° = ${expected}° ` +
            `(exactly opposite to N). Got ${dirDeg}°.`,
          expected,
          actual: dirDeg,
        });
      }
      const entry = perBody.get(info.body_id) || {};
      entry.perp = { deg: dirDeg, id: f.id || '(unnamed)' };
      perBody.set(info.body_id, entry);
    } else if (kind === 'mg_parallel') {
      // mg_parallel = mg sin θ along the surface, pointing down-slope.
      // For a surface going up-to-the-right (angle_deg > 0), down-slope is
      // the surface direction reversed: angle_deg + 180° (= along-surface,
      // pointing away from the high end). For angle_deg = 0 (horizontal) this
      // rule is vacuous — there is no "down-slope" on a flat surface.
      if (theta === 0) continue;
      const expected = mod360(180 + theta);
      if (angleDiff(dirDeg, expected) > tol) {
        violations.push({
          code: 'MG_PERP_DIRECTION_WRONG',
          severity: 'WARNING',
          primitive_id: f.id || '(unnamed)',
          state_id: stateId,
          message:
            `Parallel component of weight (mg sin θ) on a ${theta}° surface should ` +
            `point down-slope at direction_deg = 180° + ${theta}° = ${expected}°. Got ${dirDeg}°.`,
          expected,
          actual: dirDeg,
        });
      }
    }
  }

  // ── Rule 5: N and mg_perp on the same body must be exactly 180° apart.
  for (const [bodyId, pair] of perBody.entries()) {
    if (pair.N && pair.perp) {
      const diff = angleDiff(pair.N.deg, pair.perp.deg);
      if (Math.abs(diff - 180) > tol) {
        violations.push({
          code: 'N_AND_PERP_NOT_OPPOSITE',
          severity: 'CRITICAL',
          primitive_id: `${pair.N.id}+${pair.perp.id}`,
          state_id: stateId,
          message:
            `On body "${bodyId}", N (${pair.N.deg}°) and mg_perp (${pair.perp.deg}°) must be ` +
            `exactly 180° apart (equal-and-opposite). Actual gap: ${diff}°.`,
          expected: 180,
          actual: diff,
        });
      }
    }
  }

  // ── Rule 6: angle_arc attached to an inclined surface should report the surface's angle.
  for (const arc of angleArcs) {
    if (!arc.surface_id) continue;
    const surf = surfaces.get(arc.surface_id);
    if (!surf) continue;
    if (surf.angle_deg === 0) continue; // horizontal surface — angle_value=0 is intentional.
    const reported = typeof arc.angle_value === 'number' ? arc.angle_value
      : typeof arc.to_deg === 'number' ? arc.to_deg
      : null;
    if (reported === null) continue;
    if (Math.abs(reported - surf.angle_deg) > 0.5) {
      violations.push({
        code: 'ANGLE_ARC_VALUE_WRONG',
        severity: 'CRITICAL',
        primitive_id: arc.id,
        state_id: stateId,
        message:
          `angle_arc ${arc.id} bound to surface ${arc.surface_id} (angle=${surf.angle_deg}°) ` +
          `reports angle_value=${reported}°. Must match surface angle.`,
        expected: surf.angle_deg,
        actual: reported,
      });
    }
  }

  const criticalCount = violations.filter(v => v.severity === 'CRITICAL').length;
  return {
    valid: criticalCount === 0,
    violations,
    registry: {
      surfaces: surfaces.size,
      bodies: bodies.size,
      forces: forces.length,
    },
  };
}

/**
 * Validate every state inside a sub-sim payload (deep-dive / drill-down).
 * Returns aggregate result. Good for post-Sonnet gating.
 *
 * @param parentSceneComposition Optional parent-state scene the sub-states
 *   inherit surface primitives from. Sub-states that omit the surface
 *   primitive fall back to this for angle-deg lookup — eliminating a
 *   major source of false-positive direction-wrong flags.
 */
export function validatePCPLSubSimStates(
  subStates: Record<string, { scene_composition?: unknown[] }>,
  direction_tolerance_deg = 2,
  parentSceneComposition?: unknown[],
  defaultVariables?: Record<string, number>,
): PCPLPhysicsValidationResult {
  const all: PCPLViolation[] = [];
  let totalSurfaces = 0, totalBodies = 0, totalForces = 0;
  for (const [stateId, state] of Object.entries(subStates || {})) {
    const scene = state?.scene_composition;
    if (!Array.isArray(scene)) continue;
    const r = validatePCPLPhysics({
      scene_composition: scene,
      state_id: stateId,
      direction_tolerance_deg,
      parent_scene_composition: parentSceneComposition,
      default_variables: defaultVariables,
    });
    all.push(...r.violations);
    totalSurfaces += r.registry.surfaces;
    totalBodies += r.registry.bodies;
    totalForces += r.registry.forces;
  }
  const criticalCount = all.filter(v => v.severity === 'CRITICAL').length;
  return {
    valid: criticalCount === 0,
    violations: all,
    registry: { surfaces: totalSurfaces, bodies: totalBodies, forces: totalForces },
  };
}
