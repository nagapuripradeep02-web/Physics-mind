/**
 * Engine 2: Zone Layout Engine
 *
 * Authors write zone: "MAIN_ZONE" — engine resolves to pixel coordinates.
 * Canvas: 760x500 fixed.
 *
 * Sub-anchors: center, top_left, top_right, bottom_left, bottom_right,
 *              top_center, bottom_center
 * Slot sub-anchors (CALLOUT_ZONE_R only): slot_1, slot_2, slot_3
 *
 * Backward compatible: position:{x,y} still works (old format falls back).
 */

import type { Engine, SimSession, SimEvent, Zone } from '../types';
import { ZONES } from '../types';

export interface ZoneLayoutConfig {
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface ZoneLayoutState {
  zones: Record<string, Zone>;
}

export class SlotManager {
  private readonly slots: Array<{ x: number; y: number; w: number; h: number }>;
  private readonly allocated: boolean[];

  constructor(zone: Zone, slotCount = 3) {
    const slotH = Math.floor(zone.h / slotCount);
    this.slots = [];
    this.allocated = [];
    for (let i = 0; i < slotCount; i++) {
      this.slots.push({
        x: zone.x,
        y: zone.y + i * slotH,
        w: zone.w,
        h: slotH,
      });
      this.allocated.push(false);
    }
  }

  allocateSlot(): { x: number; y: number; w: number; h: number } | null {
    const idx = this.allocated.indexOf(false);
    if (idx === -1) return null;
    this.allocated[idx] = true;
    return { ...this.slots[idx] };
  }

  freeSlot(index: number): void {
    if (index >= 0 && index < this.allocated.length) {
      this.allocated[index] = false;
    }
  }

  resetSlots(): void {
    this.allocated.fill(false);
  }
}

export class ZoneLayoutEngine implements Engine<ZoneLayoutConfig, ZoneLayoutState> {
  readonly id = 'zone-layout';
  readonly dependencies: string[] = [];

  private state: ZoneLayoutState | null = null;
  private slotManagers = new Map<string, SlotManager>();

  async init(_config: ZoneLayoutConfig, _session: SimSession): Promise<ZoneLayoutState> {
    this.state = {
      zones: { ...ZONES },
    };
    // Pre-create slot manager for CALLOUT_ZONE_R
    this.slotManagers.set('CALLOUT_ZONE_R', new SlotManager(ZONES.CALLOUT_ZONE_R));
    return this.state;
  }

  resolveZone(zoneName: string): Zone | null {
    return this.state?.zones[zoneName] ?? null;
  }

  resolveZonePoint(zoneName: string, subAnchor: string): { x: number; y: number } | null {
    const zone = this.resolveZone(zoneName);
    if (!zone) return null;

    // Slot sub-anchors (CALLOUT_ZONE_R only)
    const slotMatch = subAnchor.match(/^slot_(\d+)$/);
    if (slotMatch) {
      const slotIndex = parseInt(slotMatch[1], 10) - 1; // 1-based → 0-based
      const manager = this.slotManagers.get(zoneName);
      if (!manager) return null;
      // Allocate and return center of slot
      const slot = manager.allocateSlot();
      if (!slot) return null;
      return { x: slot.x + slot.w / 2, y: slot.y + slot.h / 2 };
    }

    switch (subAnchor) {
      case 'center':
        return { x: zone.x + zone.w / 2, y: zone.y + zone.h / 2 };
      case 'top_left':
        return { x: zone.x, y: zone.y };
      case 'top_right':
        return { x: zone.x + zone.w, y: zone.y };
      case 'bottom_left':
        return { x: zone.x, y: zone.y + zone.h };
      case 'bottom_right':
        return { x: zone.x + zone.w, y: zone.y + zone.h };
      case 'top_center':
        return { x: zone.x + zone.w / 2, y: zone.y };
      case 'bottom_center':
        return { x: zone.x + zone.w / 2, y: zone.y + zone.h };
      default:
        return null;
    }
  }

  getSlotManager(zoneName: string): SlotManager | undefined {
    return this.slotManagers.get(zoneName);
  }

  async reset(): Promise<void> {
    this.state = null;
    this.slotManagers.clear();
  }

  async destroy(): Promise<void> {
    this.state = null;
    this.slotManagers.clear();
  }

  onEvent(_event: SimEvent): void {
    // Zone layout is static — no event handling needed
  }
}
