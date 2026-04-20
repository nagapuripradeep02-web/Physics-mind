import type { P5Instance, PrimitiveSpec, SurfaceSpec, ZonePositioning } from './types';
import type { PhysicsResult } from '../physicsEngine/types';
import type { ZoneLayoutEngine } from '../engines/zone-layout';
import type { AnchorResolverEngine } from '../engines/anchor-resolver';
import type { ScaleEngine } from '../engines/scale';
import { resolveDrawFrom } from './layout';

import { drawBody } from './primitives/body';
import { drawSurface } from './primitives/surface';
import { drawForceArrow } from './primitives/force_arrow';
import { drawVector } from './primitives/vector';
import { drawAngleArc } from './primitives/angle_arc';
import { drawLabel } from './primitives/label';
import { drawFormulaBox } from './primitives/formula_box';
import { drawAnnotation } from './primitives/annotation';
import { drawComparisonPanel } from './primitives/comparison_panel';
import { drawProjectionShadow } from './primitives/projection_shadow';
import { drawMotionPath } from './primitives/motion_path';
import { drawDerivationStep } from './primitives/derivation_step';
import { drawMarkBadge } from './primitives/mark_badge';

const DEFAULT_ORIGIN = { x: 380, y: 350 };

type BodyBounds = { x: number; y: number; w: number; h: number };

export interface RenderEngines {
  anchorResolver?: AnchorResolverEngine;
  zoneLayout?: ZoneLayoutEngine;
  scaleEngine?: ScaleEngine;
}

// Spec types that use {x, y} position and support zone/anchor resolution.
// SliderSpec uses string position ('bottom' etc.) — excluded.
const RESOLVABLE_TYPES = new Set([
  'body', 'surface', 'label', 'formula_box', 'annotation',
  'derivation_step', 'mark_badge',
]);

/**
 * Resolve zone/anchor-based positioning to concrete {x,y} coordinates.
 *
 * Resolution priority:
 *   1. position:{x,y} exists → pass through unchanged (backward compat)
 *   2. zone field → resolve via zoneLayout.resolveZonePoint(zone, 'center')
 *   3. anchor field → resolve via anchorResolver.resolve(anchor) + applyOffset
 *   4. No positioning fields → return unchanged
 */
export function resolvePositions(
  primitives: PrimitiveSpec[],
  engines?: RenderEngines
): PrimitiveSpec[] {
  if (!engines?.zoneLayout && !engines?.anchorResolver) return primitives;

  return primitives.map(prim => {
    // Only resolve position for spec types that use {x, y} coordinates
    if (!RESOLVABLE_TYPES.has(prim.type)) return prim;

    const zp = prim as PrimitiveSpec & Partial<ZonePositioning>;

    // Skip if position already defined
    if ('position' in prim && prim.position != null) return prim;

    // Try zone
    if (zp.zone && engines?.zoneLayout) {
      const pt = engines.zoneLayout.resolveZonePoint(zp.zone, 'center');
      if (pt) {
        return { ...prim, position: pt } as PrimitiveSpec;
      }
    }

    // Try anchor
    if (zp.anchor && engines?.anchorResolver) {
      let pt = engines.anchorResolver.resolve(zp.anchor);
      if (zp.offset) {
        pt = engines.anchorResolver.applyOffset(pt, zp.offset);
      }
      return { ...prim, position: pt } as PrimitiveSpec;
    }

    return prim;
  });
}

/**
 * Compute surface endpoints from SurfaceSpec position, length, and orientation.
 */
export function computeSurfaceEndpoints(spec: SurfaceSpec): { x1: number; y1: number; x2: number; y2: number } {
  const { x, y } = spec.position;
  const len = spec.length;
  switch (spec.orientation) {
    case 'horizontal':
      return { x1: x, y1: y, x2: x + len, y2: y };
    case 'vertical':
      return { x1: x, y1: y, x2: x, y2: y + len };
    case 'inclined': {
      const angleDeg = spec.angle ?? 30;
      const rad = (angleDeg * Math.PI) / 180;
      return {
        x1: x,
        y1: y,
        x2: x + len * Math.cos(rad),
        y2: y - len * Math.sin(rad), // y-up in physics → y-down canvas
      };
    }
    default:
      return { x1: x, y1: y, x2: x + len, y2: y };
  }
}

export function renderSceneComposition(
  p: P5Instance,
  scene: PrimitiveSpec[],
  physics: PhysicsResult,
  origin?: { x: number; y: number },
  bodyRegistry?: Map<string, BodyBounds>,
  engines?: RenderEngines,
  stateElapsedMs?: number
): void {
  const effectiveOrigin = origin ?? DEFAULT_ORIGIN;
  const registry = bodyRegistry ?? new Map<string, BodyBounds>();
  const dynamicScale = engines?.scaleEngine?.getScale();

  // Pre-pass: resolve zone/anchor positions
  const resolved = resolvePositions(scene, engines);

  for (const prim of resolved) {
    switch (prim.type) {
      case 'body':
        drawBody(p, prim);
        if (prim.id && prim.position && prim.size) {
          const w = typeof prim.size === 'object' ? prim.size.w : prim.size;
          const h = typeof prim.size === 'object' ? prim.size.h : prim.size;
          const bounds = { x: prim.position.x, y: prim.position.y, w, h };
          registry.set(prim.id, bounds);
          engines?.anchorResolver?.registerBody(prim.id, bounds);
        }
        break;

      case 'surface':
        drawSurface(p, prim);
        if (prim.id) {
          const endpoints = computeSurfaceEndpoints(prim);
          engines?.anchorResolver?.registerSurface(prim.id, endpoints);
        }
        break;

      case 'force_arrow': {
        const force = physics.forces.find(f => f.id === prim.force_id);
        const bodyBounds = force ? findBodyForForce(force.draw_from, registry) : null;
        const drawOrigin = resolveDrawFrom(prim.draw_from ?? force?.draw_from ?? 'body_center', bodyBounds, effectiveOrigin);
        drawForceArrow(p, prim, physics, drawOrigin, dynamicScale);
        break;
      }

      case 'vector':
        drawVector(p, prim);
        break;

      case 'angle_arc':
        drawAngleArc(p, prim);
        break;

      case 'label':
        drawLabel(p, prim);
        break;

      case 'formula_box':
        drawFormulaBox(p, prim);
        break;

      case 'annotation':
        drawAnnotation(p, prim);
        break;

      case 'comparison_panel':
        drawComparisonPanel(p, prim, physics, (p2, prims, phys, ox, oy) =>
          renderSceneComposition(p2, prims, phys, { x: ox, y: oy }, new Map(), engines));
        break;

      case 'projection_shadow': {
        const srcForce = physics.forces.find(f => f.id === prim.source_force_id);
        const srcBody = srcForce ? findBodyForForce(srcForce.draw_from, registry) : null;
        const projOrigin = resolveDrawFrom(srcForce?.draw_from ?? 'body_center', srcBody, effectiveOrigin);
        drawProjectionShadow(p, prim, physics, projOrigin, dynamicScale);
        break;
      }

      case 'motion_path':
        drawMotionPath(p, prim);
        break;

      case 'derivation_step':
        drawDerivationStep(p, prim, stateElapsedMs);
        break;

      case 'mark_badge':
        drawMarkBadge(p, prim);
        break;

      case 'slider':
        break;
    }
  }
}

function findBodyForForce(
  drawFrom: import('./types').DrawFrom | undefined,
  registry: Map<string, BodyBounds>
): BodyBounds | null {
  if (!drawFrom || typeof drawFrom === 'object') return null;
  if (registry.size === 1) return registry.values().next().value ?? null;
  return null;
}

export { createSliderElement } from './primitives/slider';
export type { PrimitiveSpec, P5Instance } from './types';
