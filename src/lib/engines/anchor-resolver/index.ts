/**
 * Engine 3: Anchor Resolver
 *
 * Resolution strategy (priority order):
 *   1. Zone anchor: "MAIN_ZONE.center" → split on '.', delegate to zoneLayout
 *   2. Surface parametric: "on_surface:floor at:0.45" → interpolate endpoints
 *   3. Surface named: "floor.mid" → lookup in surface registry
 *   4. Body: "block.center" → lookup in body registry
 *   5. Fallback: unknown → MAIN_ZONE.center + console.warn
 */

import type { Engine, SimSession, SimEvent } from '../types';
import { ZONES } from '../types';
import type { ZoneLayoutEngine } from '../zone-layout';

export interface AnchorResolverConfig {
  bodies?: Record<string, { x: number; y: number; w: number; h: number }>;
  surfaces?: Record<string, { x1: number; y1: number; x2: number; y2: number }>;
}

export interface ResolvedAnchor {
  x: number;
  y: number;
}

export interface AnchorResolverState {
  bodies: Record<string, { x: number; y: number; w: number; h: number }>;
  surfaces: Record<string, { x1: number; y1: number; x2: number; y2: number }>;
}

// MAIN_ZONE.center fallback
const FALLBACK: ResolvedAnchor = {
  x: ZONES.MAIN_ZONE.x + ZONES.MAIN_ZONE.w / 2,
  y: ZONES.MAIN_ZONE.y + ZONES.MAIN_ZONE.h / 2,
};

const ZONE_NAMES = new Set(Object.keys(ZONES));

const SURFACE_PARAMETRIC_RE = /^on_surface:(\w+)\s+at:([\d.]+)$/;

export class AnchorResolverEngine implements Engine<AnchorResolverConfig, AnchorResolverState> {
  readonly id = 'anchor-resolver';
  readonly dependencies = ['zone-layout'];

  private state: AnchorResolverState | null = null;
  private zoneLayout: ZoneLayoutEngine | null = null;

  async init(config: AnchorResolverConfig, session: SimSession): Promise<AnchorResolverState> {
    this.zoneLayout = session.getEngine<ZoneLayoutEngine>('zone-layout');
    this.state = {
      bodies: { ...(config.bodies ?? {}) },
      surfaces: { ...(config.surfaces ?? {}) },
    };
    return this.state;
  }

  resolve(anchorExpr: string): ResolvedAnchor {
    // 1. Surface parametric: "on_surface:floor at:0.45"
    const paramMatch = anchorExpr.match(SURFACE_PARAMETRIC_RE);
    if (paramMatch) {
      const surfaceId = paramMatch[1];
      const t = parseFloat(paramMatch[2]);
      return this.resolveSurfaceParametric(surfaceId, t);
    }

    // 2. Dotted expression: "SOMETHING.subanchor"
    const dotIdx = anchorExpr.indexOf('.');
    if (dotIdx !== -1) {
      const prefix = anchorExpr.slice(0, dotIdx);
      const suffix = anchorExpr.slice(dotIdx + 1);

      // 2a. Zone anchor: "MAIN_ZONE.center"
      if (ZONE_NAMES.has(prefix)) {
        return this.resolveZoneAnchor(prefix, suffix);
      }

      // 2b. Surface named: "floor.mid"
      if (this.state?.surfaces[prefix]) {
        return this.resolveSurfaceNamed(prefix, suffix);
      }

      // 2c. Body anchor: "block.center"
      if (this.state?.bodies[prefix]) {
        return this.resolveBodyAnchor(prefix, suffix);
      }
    }

    // 3. Fallback
    console.warn(`[AnchorResolver] Unknown anchor expression: "${anchorExpr}", falling back to MAIN_ZONE.center`);
    return { ...FALLBACK };
  }

  registerBody(id: string, bounds: { x: number; y: number; w: number; h: number }): void {
    if (this.state) {
      this.state.bodies[id] = { ...bounds };
    }
  }

  registerSurface(id: string, endpoints: { x1: number; y1: number; x2: number; y2: number }): void {
    if (this.state) {
      this.state.surfaces[id] = { ...endpoints };
    }
  }

  applyOffset(point: ResolvedAnchor, offset: { dir: 'up' | 'down' | 'left' | 'right'; gap: number }): ResolvedAnchor {
    switch (offset.dir) {
      case 'up':    return { x: point.x, y: point.y - offset.gap };
      case 'down':  return { x: point.x, y: point.y + offset.gap };
      case 'left':  return { x: point.x - offset.gap, y: point.y };
      case 'right': return { x: point.x + offset.gap, y: point.y };
    }
  }

  private resolveZoneAnchor(zoneName: string, subAnchor: string): ResolvedAnchor {
    if (this.zoneLayout) {
      const pt = this.zoneLayout.resolveZonePoint(zoneName, subAnchor);
      if (pt) return pt;
    }
    // Direct computation fallback (in case zone-layout not booted)
    const zone = ZONES[zoneName];
    if (!zone) return { ...FALLBACK };
    switch (subAnchor) {
      case 'center':        return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
      case 'top_left':      return { x: zone.x, y: zone.y };
      case 'top_right':     return { x: zone.x + zone.w, y: zone.y };
      case 'bottom_left':   return { x: zone.x, y: zone.y + zone.h };
      case 'bottom_right':  return { x: zone.x + zone.w, y: zone.y + zone.h };
      case 'top_center':    return { x: zone.x + zone.w / 2, y: zone.y };
      case 'bottom_center': return { x: zone.x + zone.w / 2, y: zone.y + zone.h };
      default:              return { ...FALLBACK };
    }
  }

  private resolveBodyAnchor(bodyId: string, subAnchor: string): ResolvedAnchor {
    const body = this.state?.bodies[bodyId];
    if (!body) return { ...FALLBACK };
    const { x, y, w, h } = body;
    switch (subAnchor) {
      case 'center': return { x: x + w / 2, y: y + h / 2 };
      case 'top':    return { x: x + w / 2, y };
      case 'bottom': return { x: x + w / 2, y: y + h };
      case 'left':   return { x, y: y + h / 2 };
      case 'right':  return { x: x + w, y: y + h / 2 };
      default:       return { x: x + w / 2, y: y + h / 2 }; // default to center
    }
  }

  private resolveSurfaceNamed(surfaceId: string, subAnchor: string): ResolvedAnchor {
    const s = this.state?.surfaces[surfaceId];
    if (!s) return { ...FALLBACK };
    switch (subAnchor) {
      case 'start': return { x: s.x1, y: s.y1 };
      case 'end':   return { x: s.x2, y: s.y2 };
      case 'mid':   return { x: (s.x1 + s.x2) / 2, y: (s.y1 + s.y2) / 2 };
      default:      return { x: (s.x1 + s.x2) / 2, y: (s.y1 + s.y2) / 2 };
    }
  }

  private resolveSurfaceParametric(surfaceId: string, t: number): ResolvedAnchor {
    const s = this.state?.surfaces[surfaceId];
    if (!s) return { ...FALLBACK };
    const clampedT = Math.max(0, Math.min(1, t));
    return {
      x: s.x1 + (s.x2 - s.x1) * clampedT,
      y: s.y1 + (s.y2 - s.y1) * clampedT,
    };
  }

  async reset(): Promise<void> {
    this.state = null;
    this.zoneLayout = null;
  }

  async destroy(): Promise<void> {
    this.state = null;
    this.zoneLayout = null;
  }

  onEvent(_event: SimEvent): void {
    // Anchor positions update when bodies move — handled by registerBody calls
  }
}
