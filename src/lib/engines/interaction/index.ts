/**
 * Engine 9: Interaction Engine
 *
 * Converts UI slider/hotspot events into physics recomputation and bus emissions.
 *
 * Event pipeline on slider change:
 *   handleSliderChange(var, value)
 *     → computePhysics(conceptId, {...all sliders})
 *     → emit PHYSICS_COMPUTED {conceptId, forces[]}      (Scale Engine listens)
 *     → emit SLIDER_CHANGE  {variable, value}            (Panel B, State Machine listen)
 */

import type { Engine, SimSession, SimEvent } from '../types';
import { computePhysics } from '@/lib/physicsEngine';

export interface SliderSpec {
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface InteractionConfig {
  conceptId: string;
  sliders: Record<string, SliderSpec>;
  hotspots?: string[];
}

export interface InteractionState {
  sliderValues: Record<string, number>;
  activeHotspot: string | null;
}

export class InteractionEngine implements Engine<InteractionConfig, InteractionState> {
  readonly id = 'interaction';
  readonly dependencies = ['physics', 'scale'];

  private config: InteractionConfig | null = null;
  private session: SimSession | null = null;
  private state: InteractionState = { sliderValues: {}, activeHotspot: null };

  async init(config: InteractionConfig, session: SimSession): Promise<InteractionState> {
    this.config = config;
    this.session = session;
    this.state = {
      sliderValues: this.seedDefaults(config),
      activeHotspot: null,
    };
    return this.state;
  }

  async reset(): Promise<void> {
    if (this.config) {
      this.state = { sliderValues: this.seedDefaults(this.config), activeHotspot: null };
    } else {
      this.state = { sliderValues: {}, activeHotspot: null };
    }
  }

  async destroy(): Promise<void> {
    this.config = null;
    this.session = null;
    this.state = { sliderValues: {}, activeHotspot: null };
  }

  handleSliderChange(variable: string, value: number): void {
    if (!this.config || !this.session) return;

    this.state.sliderValues[variable] = value;

    const result = computePhysics(this.config.conceptId, { ...this.state.sliderValues });
    if (result) {
      this.session.emit({
        type: 'PHYSICS_COMPUTED',
        conceptId: this.config.conceptId,
        forces: result.forces.map((f) => ({ id: f.id, magnitude: f.vector.magnitude })),
      });
    }
    this.session.emit({ type: 'SLIDER_CHANGE', variable, value });
  }

  handleHotspotTap(primitiveId: string): void {
    if (!this.session) return;
    this.state.activeHotspot = primitiveId;
    this.session.emit({ type: 'HOTSPOT_TAP', primitive_id: primitiveId });
  }

  getSliderValues(): Readonly<Record<string, number>> {
    return Object.freeze({ ...this.state.sliderValues });
  }

  getSliderValue(variable: string): number | undefined {
    return this.state.sliderValues[variable];
  }

  getActiveHotspot(): string | null {
    return this.state.activeHotspot;
  }

  onEvent(event: SimEvent): void {
    if (event.type === 'STATE_ENTER' && this.config) {
      this.state.sliderValues = this.seedDefaults(this.config);
      this.state.activeHotspot = null;
    }
  }

  private seedDefaults(config: InteractionConfig): Record<string, number> {
    const values: Record<string, number> = {};
    for (const [key, spec] of Object.entries(config.sliders)) {
      values[key] = spec.default;
    }
    return values;
  }
}
