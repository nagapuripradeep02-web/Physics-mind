/**
 * Engine 4: Scale Engine
 *
 * Formula: UNIT_TO_PX = MAIN_ZONE.height * 0.70 / maxMagnitude
 *   maxMagnitude = max of all force magnitudes in current state
 *   Every arrow: pixel_length = force.magnitude * UNIT_TO_PX
 *   Guard: if maxMagnitude < 0.01 or empty → use 10 (prevent divide-by-zero)
 *
 * Replaces: hardcoded scale_pixels_per_unit: 5
 */

import type { Engine, SimSession, SimEvent } from '../types';
import type { ZoneLayoutEngine } from '../zone-layout';

export interface ScaleEngineConfig {
  mainZoneKey?: string;
}

export interface ScaleEngineState {
  unitToPx: number;
  maxMagnitude: number;
}

const DEFAULT_MAX_MAGNITUDE = 10;
const MIN_MAGNITUDE_THRESHOLD = 0.01;
const ZONE_HEIGHT_FRACTION = 0.70;

export class ScaleEngine implements Engine<ScaleEngineConfig, ScaleEngineState> {
  readonly id = 'scale';
  readonly dependencies = ['physics', 'zone-layout'];

  private state: ScaleEngineState | null = null;
  private session: SimSession | null = null;
  private mainZoneHeight = 380; // MAIN_ZONE.h default

  async init(config: ScaleEngineConfig, session: SimSession): Promise<ScaleEngineState> {
    this.session = session;
    const zoneLayout = session.getEngine<ZoneLayoutEngine>('zone-layout');
    if (zoneLayout) {
      const zone = zoneLayout.resolveZone(config.mainZoneKey ?? 'MAIN_ZONE');
      if (zone) this.mainZoneHeight = zone.h;
    }
    this.state = {
      unitToPx: 1,
      maxMagnitude: DEFAULT_MAX_MAGNITUDE,
    };
    return this.state;
  }

  computeScale(magnitudes: number[]): void {
    const validMags = magnitudes.filter(m => m >= MIN_MAGNITUDE_THRESHOLD);
    const maxMag = validMags.length > 0 ? Math.max(...validMags) : DEFAULT_MAX_MAGNITUDE;
    const unitToPx = (this.mainZoneHeight * ZONE_HEIGHT_FRACTION) / maxMag;

    if (this.state) {
      this.state.unitToPx = unitToPx;
      this.state.maxMagnitude = maxMag;
    }
  }

  getScale(): number {
    return this.state?.unitToPx ?? 1;
  }

  onEvent(event: SimEvent): void {
    if (event.type === 'PHYSICS_COMPUTED') {
      const magnitudes = event.forces.map(f => f.magnitude);
      this.computeScale(magnitudes);
      this.session?.emit({
        type: 'SCALE_UPDATED',
        unitToPx: this.state!.unitToPx,
        maxMagnitude: this.state!.maxMagnitude,
      });
    }
  }

  async reset(): Promise<void> {
    this.state = null;
    this.session = null;
  }

  async destroy(): Promise<void> {
    this.state = null;
    this.session = null;
  }
}
