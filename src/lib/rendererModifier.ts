// src/lib/rendererModifier.ts
// Pure TypeScript safety net. Zero AI cost.
// Injects correct animation parameters into any SimulationConfig
// before it reaches a renderer.

export interface RendererModifierInput {
  config: Record<string, unknown>;
  renderer: string;         // e.g. 'mechanics_2d', 'field_3d'
  scenario?: string;        // from MECHANICS_SCENARIO_MAP, not DB
  concept_id: string;
}

const TIME_STEP_MINIMUMS: Record<string, number> = {
  mechanics_2d: 0.016,
  wave_canvas: 0.016,
  field_3d: 0.020,
  thermodynamics: 0.016,
  particle_field: 0.016,
  circuit_live: 0.016,
  graph_interactive: 0.050,
  optics_ray: 0.016,
};

const ANIMATION_MULTIPLIERS: Record<string, number> = {
  mechanics_2d: 4.0,
  wave_canvas: 3.0,
  field_3d: 2.0,
  thermodynamics: 3.0,
  particle_field: 4.0,
  circuit_live: 2.5,
  graph_interactive: 1.0,
  optics_ray: 2.0,
};

const FIELD_3D_ANIMATION_MAP: Record<string, { motion: string; speed: number }> = {
  point_charge:        { motion: 'field_lines_pulse',        speed: 0.8 },
  bar_magnet:          { motion: 'field_lines_rotate_poles', speed: 0.6 },
  solenoid:            { motion: 'current_arrows_flow',      speed: 1.0 },
  gauss_law:           { motion: 'surface_pulse',            speed: 0.5 },
  electric_dipole:     { motion: 'field_lines_oscillate',    speed: 0.7 },
  magnetic_field_wire: { motion: 'circular_field_lines',     speed: 0.9 },
  capacitor:           { motion: 'field_lines_parallel',     speed: 0.4 },
};

const GRAVITY_CONCEPTS = new Set([
  'projectile_motion', 'laws_of_motion', 'circular_motion',
  'work_energy_theorem', 'simple_pendulum', 'gravitation',
  'banking_of_roads', 'vertical_circular_motion',
]);

export function applyRendererModifier(input: RendererModifierInput): Record<string, unknown> {
  const { config, renderer, scenario, concept_id } = input;
  const modified = structuredClone(config) as Record<string, unknown>;

  // ── 1. Enforce time_step minimum on every state ──────────────────────
  const minStep = TIME_STEP_MINIMUMS[renderer] ?? 0.016;
  if (modified.states && typeof modified.states === 'object') {
    const states = modified.states as Record<string, Record<string, unknown>>;
    for (const key of Object.keys(states)) {
      const s = states[key];
      if (s && typeof s === 'object') {
        const currentStep = s.time_step as number | undefined;
        if (!currentStep || currentStep < minStep) s.time_step = minStep;
      }
    }
  }
  const topLevelStep = modified.time_step as number | undefined;
  if (!topLevelStep || topLevelStep < minStep) {
    modified.time_step = minStep;
  }

  // ── 2. Inject animation_multiplier ───────────────────────────────────
  modified.animation_multiplier = ANIMATION_MULTIPLIERS[renderer] ?? 2.0;

  // ── 3. Renderer-specific injections ──────────────────────────────────

  if (renderer === 'field_3d') {
    modified.animate = true;
    const key = scenario || (modified.scenario as string) || '';
    const anim = FIELD_3D_ANIMATION_MAP[key];
    if (!modified.animation_type) {
      modified.animation_type  = anim?.motion ?? 'field_lines_pulse';
      modified.animation_speed = anim?.speed  ?? 0.6;
    }
  }

  if (renderer === 'mechanics_2d') {
    const dt = modified.dt as number | undefined;
    if (!dt || dt < 0.016) modified.dt = 0.016;
    if (GRAVITY_CONCEPTS.has(concept_id) && modified.gravity === undefined) {
      modified.gravity = 9.8;
    }
  }

  if (renderer === 'wave_canvas') {
    const freq = modified.frequency as number | undefined;
    const amp  = modified.amplitude as number | undefined;
    const spd  = modified.wave_speed as number | undefined;
    if (!freq  || freq  <= 0) modified.frequency  = 2.0;
    if (!amp   || amp   <= 0) modified.amplitude  = 50;
    if (!spd   || spd   <= 0) modified.wave_speed = 200;

    // ── Patch per-wave entries in the waves[] array ───────────────────
    // Renderer multiplies amplitude by 60 and wavelength by 80.
    // Safe display ranges:  amplitude 0.3–2.0,  wavelength 0.8–6.0,  frequency 0.5–5.0
    if (Array.isArray(modified.waves)) {
      const waves = modified.waves as Record<string, unknown>[];
      waves.forEach((w, i) => {
        const wAmp  = w.amplitude  as number | undefined;
        const wWl   = w.wavelength as number | undefined;
        const wFreq = w.frequency  as number | undefined;
        const wDir  = w.direction  as string | undefined;
        if (!wAmp  || wAmp  <= 0 || wAmp  > 5)   w.amplitude  = 0.83;  // → 50px
        if (!wWl   || wWl   <= 0 || wWl   > 20)   w.wavelength = 1.5;   // → 120px
        if (!wFreq || wFreq <= 0 || wFreq > 20)   w.frequency  = 1.5;
        if (!wDir || (wDir !== 'left' && wDir !== 'right' && wDir !== 'stationary')) {
          w.direction = i === 0 ? 'right' : 'left'; // wave_1 right, wave_2 left
        }
      });
    }

    // ── Enforce per-state show_resultant / show_node_antinode for standing_wave ──
    // Safety net: if AI omits these flags, force the correct progressive-reveal pattern:
    //   STATE_1 → travelling waves only  (no resultant, no markers)
    //   STATE_2 → add green resultant    (no node markers yet)
    //   STATE_3 → add node/antinode markers
    //   STATE_4 → same as STATE_3 (resultant prominent, travelling waves faint in renderer)
    if ((modified.scenario_type as string) === 'standing_wave' && modified.states && typeof modified.states === 'object') {
      const st = modified.states as Record<string, Record<string, unknown>>;
      const stateDefaults: Record<string, { show_resultant: boolean; show_node_antinode: boolean }> = {
        STATE_1: { show_resultant: false, show_node_antinode: false },
        STATE_2: { show_resultant: true,  show_node_antinode: false },
        STATE_3: { show_resultant: true,  show_node_antinode: true  },
        STATE_4: { show_resultant: true,  show_node_antinode: true  },
        STATE_5: { show_resultant: true,  show_node_antinode: true  },
        STATE_6: { show_resultant: true,  show_node_antinode: true  },
      };
      for (const [stKey, defaults] of Object.entries(stateDefaults)) {
        if (st[stKey]) {
          if (st[stKey].show_resultant === undefined) st[stKey].show_resultant = defaults.show_resultant;
          if (st[stKey].show_node_antinode === undefined) st[stKey].show_node_antinode = defaults.show_node_antinode;
        }
      }
    }
  }

  if (renderer === 'thermodynamics') {
    const pCount = modified.particle_count as number | undefined;
    const pSpeed = modified.particle_speed as number | undefined;
    if (!pCount || pCount < 20) modified.particle_count = 30;
    if (!pSpeed || pSpeed < 1.0) modified.particle_speed = 2.5;
  }

  if (renderer === 'optics_ray') {
    modified.demo_mode = true;
    const raySpd = modified.ray_speed as number | undefined;
    if (!raySpd || raySpd <= 0) modified.ray_speed = 3.0;
  }

  console.log(`[rendererModifier] ${renderer}/${concept_id}: time_step=${modified.time_step}, animation_multiplier=${modified.animation_multiplier}`);

  return modified;
}
