/**
 * Engine 5: Collision Detection Engine
 *
 * Algorithm: AABB overlap check on every label/annotation
 *   Overlap <= 10% → draw as-is
 *   Overlap 10-40% → nudge by delta along zone flow axis
 *   Overlap > 40% → shift to next zone slot
 *   No slots free → shrink font 2pt; still overflowing → elide "..."
 *
 * Run as Pass 3.5 (after bodies+arrows, before labels lock)
 */

import type { Engine, SimSession, SimEvent } from '../types';
import type { ZoneLayoutEngine, SlotManager } from '../zone-layout';

export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CollisionPair {
  indexA: number;
  indexB: number;
  overlap: number; // 0-1 ratio
}

export interface CollisionConfig {
  overlapThresholdNudge?: number;   // default 0.10
  overlapThresholdShift?: number;   // default 0.40
}

export interface CollisionState {
  boxes: AABB[];
}

const DEFAULT_NUDGE_THRESHOLD = 0.10;
const DEFAULT_SHIFT_THRESHOLD = 0.40;

export class CollisionEngine implements Engine<CollisionConfig, CollisionState> {
  readonly id = 'collision';
  readonly dependencies = ['zone-layout', 'anchor-resolver'];

  private state: CollisionState | null = null;
  private nudgeThreshold = DEFAULT_NUDGE_THRESHOLD;
  private shiftThreshold = DEFAULT_SHIFT_THRESHOLD;
  private zoneLayout: ZoneLayoutEngine | null = null;

  async init(config: CollisionConfig, session: SimSession): Promise<CollisionState> {
    this.nudgeThreshold = config.overlapThresholdNudge ?? DEFAULT_NUDGE_THRESHOLD;
    this.shiftThreshold = config.overlapThresholdShift ?? DEFAULT_SHIFT_THRESHOLD;
    this.zoneLayout = session.getEngine<ZoneLayoutEngine>('zone-layout');
    this.state = { boxes: [] };
    return this.state;
  }

  /**
   * Check overlap ratio between two AABBs.
   * Returns ratio of overlap area to smaller box area (0-1).
   */
  checkOverlap(a: AABB, b: AABB): number {
    const overlapX = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    const overlapY = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const overlapArea = overlapX * overlapY;
    const minArea = Math.min(a.w * a.h, b.w * b.h);
    return minArea > 0 ? overlapArea / minArea : 0;
  }

  /**
   * Detect all pairwise collisions in a set of bounding boxes.
   */
  detectCollisions(boxes: AABB[]): CollisionPair[] {
    const pairs: CollisionPair[] = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const overlap = this.checkOverlap(boxes[i], boxes[j]);
        if (overlap > 0) {
          pairs.push({ indexA: i, indexB: j, overlap });
        }
      }
    }
    return pairs;
  }

  /**
   * Resolve collisions by nudging, shifting, or shrinking.
   * Returns new bounding boxes with adjustments applied.
   */
  resolveCollisions(pairs: CollisionPair[], boxes: AABB[]): AABB[] {
    const result = boxes.map(b => ({ ...b }));

    for (const pair of pairs) {
      if (pair.overlap <= this.nudgeThreshold) {
        // No action needed
        continue;
      }

      if (pair.overlap <= this.shiftThreshold) {
        // Nudge: move box B right by the overlap amount
        const a = result[pair.indexA];
        const b = result[pair.indexB];
        const overlapX = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        result[pair.indexB] = { ...b, x: b.x + overlapX };
        continue;
      }

      // > shiftThreshold: try to shift to next CALLOUT_ZONE_R slot
      const slotManager = this.zoneLayout?.getSlotManager('CALLOUT_ZONE_R');
      if (slotManager) {
        const slot = slotManager.allocateSlot();
        if (slot) {
          result[pair.indexB] = { ...result[pair.indexB], x: slot.x, y: slot.y };
          continue;
        }
      }

      // No slots available: shrink font (reduce height by 2px as proxy for font shrink)
      result[pair.indexB] = {
        ...result[pair.indexB],
        h: Math.max(result[pair.indexB].h - 2, 8),
      };
    }

    return result;
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
    // Recheck collisions after layout changes
  }
}
