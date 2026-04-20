// =============================================================================
// mechanics_2d_renderer.ts
// Pre-built p5.js renderer for 2D mechanics simulations.
// Engineer-written — NOT AI-generated.
//
// Architecture: reads window.SIM_CONFIG (Mechanics2DConfig), draws any
// mechanics scenario from that config. Zero hardcoded physics — everything
// is driven by the JSON.
//
// Scenarios supported (via config.scenario):
//   projectile       — parabolic trajectory, velocity components
//   circular         — centripetal acceleration toward center
//   friction         — block on surface, static/kinetic friction
//   atwood           — two masses over pulley, tension, acceleration
//   work_energy      — object under force, KE bar increasing
//   momentum         — collision, momentum arrows before/after
//   pendulum         — bob swing, small-angle harmonic motion, energy bars
//   spring_mass      — mass on spring, restoring force, SHM
//   torque           — rigid body rotation, force at distance
//   banking          — banked road, normal force components
//
// postMessage bridge:
//   IN:  { type: 'SET_STATE', state: 'STATE_N' }
//   OUT: { type: 'SIM_READY' }        — on load
//        { type: 'STATE_REACHED', state: 'STATE_N' } — on state apply
// =============================================================================

// ── TypeScript interfaces (exported for config generation) ───────────────────

export interface Mechanics2DConfig {
    scenario: string;
    objects: MechanicsObject[];
    forces: ForceVector[];
    initial_conditions: Record<string, number>;
    show_components: boolean;
    show_path: boolean;
    show_labels: boolean;
    show_energy_bar: boolean;
    canvas_scale: number;        // pixels per meter
    canvas_width?: number;
    canvas_height?: number;
    surface?: {
        exists: boolean;
        slope_degrees: number;
        color?: string;
    };
    pulley?: {
        x: number;
        y: number;
        radius: number;
    };
    spring?: {
        anchor_x: number;
        anchor_y: number;
        natural_length_m: number;
        spring_k?: number;
    };
    states: Record<string, MechanicsState>;
    pvl_colors?: {
        background: string;
        text: string;
        grid?: string;
    };
}

export interface MechanicsObject {
    id: string;
    shape: 'circle' | 'rect' | 'pendulum_bob';
    mass: number;
    color: string;
    initial_x: number;
    initial_y: number;
    label: string;
    width?: number;
    height?: number;
    radius?: number;
    // Per-object pendulum parameters (used when multiple pendulums needed)
    pendulum_length_m?: number;      // overrides ic.length_m for this specific bob
    pendulum_angle_deg?: number;     // overrides ic.angle_deg for this specific bob
    pendulum_pivot_x?: number;       // pivot x position for this bob (canvas pixels)
    pendulum_pivot_y?: number;       // pivot y position for this bob (canvas pixels)
    // Per-object spring parameters (for future dual-spring scenarios)
    spring_k?: number;               // overrides ic.spring_k for this specific mass
    spring_amplitude_m?: number;     // overrides ic.amplitude_m
    spring_anchor_x?: number;        // anchor point for this specific spring
    spring_anchor_y?: number;
}

export interface ForceVector {
    on_object: string;
    name: string;
    direction_degrees: number;   // 0=right, 90=up (physics convention)
    magnitude: number;
    color: string;
    show_in_states: string[];
}

export interface MechanicsState {
    label: string;
    what_student_sees: string;
    highlight_forces?: string[];
    time_step: number;           // loop ceiling — animation resets after this many seconds
    freeze_at_t?: number;        // if set, freeze simulation at exactly this time — do not loop
    show_path?: boolean;
}

// ── EpicConfig interfaces (new format — epic_l_path) ─────────────────────────

export interface EpicPhysicsLayer {
    concept?: string;
    simulation_focus?: string;
    what_to_show?: string;
    freeze_at_t?: number;
    key_observation?: string;
}
export interface EpicState {
    label: string;
    physics_layer?: EpicPhysicsLayer;
    pedagogy_layer?: { teacher_script?: string; opening_question?: string; };
    description?: string;
    emphasis?: string;
    labels_visible?: string[];
    interactive?: boolean;
    sliders?: Array<{ id: string; label: string; min: number; max: number; default: number; unit?: string; step?: number; }>;
}
export interface EpicConfig {
    epic_l_path?: { states: Record<string, EpicState> };
    renderer_hint?: { scenario_type: string; scene_mode?: boolean; panel_count?: number; };
    locked_facts?: Record<string, unknown>;
    variables?: Record<string, unknown>;
    parameter_slots?: Record<string, { default: number; min?: number; max?: number }>;
    legend?: Record<string, string>;
    canvas_width?: number;
    canvas_height?: number;
    pvl_colors?: { background: string; text?: string; };
}

// ── HTML assembler ───────────────────────────────────────────────────────────

export function assembleMechanics2DHtml(config: Mechanics2DConfig | EpicConfig): string {
    const bg = (config as Mechanics2DConfig).pvl_colors?.background ?? '#0f0f1a';
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
html, body { margin: 0; padding: 0; overflow: hidden; background: ${bg}; }
canvas { display: block; }
</style>
</head><body>
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
<\/script>
<script>
${MECHANICS_2D_RENDERER_CODE}
<\/script>
<!-- FALLBACK: fires even if main p5.js script has syntax error -->
<script>
(function() {
  var fallbackFired = false;
  function fireFallbackReady() {
    if (fallbackFired) return;
    fallbackFired = true;
    window.parent.postMessage({
      type: 'SIM_READY',
      states: ['STATE_1','STATE_2','STATE_3','STATE_4','STATE_5','STATE_6'],
      source: 'fallback'
    }, '*');
    console.log('[mechanics_2d] fallback SIM_READY fired');
  }
  window.addEventListener('load', function() {
    setTimeout(fireFallbackReady, 1500);
  });
  window.__suppressFallback = function() { fallbackFired = true; };
})();
<\/script>
</body></html>`;
}

// ── Renderer code (p5.js, embedded as string) ────────────────────────────────

export const MECHANICS_2D_RENDERER_CODE = `
// ============================================================
// Mechanics 2D Renderer — p5.js global mode
// Reads window.SIM_CONFIG (Mechanics2DConfig)
// ============================================================

var M2_cfg;
var M2_state  = 'STATE_1';
var M2_simT   = 0;      // current simulation time (seconds)
var M2_path   = [];     // [{x,y}] accumulated trajectory
var M2_flash  = 0;      // border-flash alpha (fades after state change)
var M2_prevSt = 'STATE_1';
var M2_G      = 9.8;    // m/s²

// ── New-format (EpicConfig) globals ─────────────────────────
var M2_isNewFormat  = false;
var M2_newStates    = {};
var M2_newStateKey  = 'STATE_1';
var M2_animPhase    = 0;        // continuous phase for ambient animations
var M2_sliderValues = {};       // { id: value } for canvas sliders

// ── SIM_READY guard (fires once; fallback if p5.js CDN fails) ───────────────
var M2_simReadyFired = false;
function M2_fireReady() {
  if (M2_simReadyFired) return;
  M2_simReadyFired = true;
  parent.postMessage({ type: 'SIM_READY' }, '*');
}
// Tell fallback script it is not needed — main script loaded successfully
if (window.__suppressFallback) window.__suppressFallback();
// Fallback: if p5.js CDN fails to load, setup() is never called.
// window 'load' fires after all scripts succeed or fail, so use a
// short delay to give p5.js one last chance before forcing SIM_READY.
window.addEventListener('load', function() {
  setTimeout(M2_fireReady, 500);
});

// ── colour helpers ──────────────────────────────────────────
function M2_rgb(h) {
  if (!h || h.length < 7) return [200,200,200];
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
function M2_fill(h, a) {
  var c = M2_rgb(h);
  fill(c[0], c[1], c[2], (a===undefined?1:a)*255);
}
function M2_stroke(h, a) {
  var c = M2_rgb(h);
  stroke(c[0], c[1], c[2], (a===undefined?1:a)*255);
}

// ── SETUP ───────────────────────────────────────────────────
function setup() {
  M2_cfg = window.SIM_CONFIG;
  if (!M2_cfg) { console.error('[Mechanics2D] No SIM_CONFIG'); M2_fireReady(); return; }
  try {
    M2_isNewFormat = (M2_cfg.epic_l_path !== undefined);
    if (M2_isNewFormat) {
      M2_newStates   = (M2_cfg.epic_l_path && M2_cfg.epic_l_path.states) || {};
      M2_newStateKey = 'STATE_1';
    }
    createCanvas(windowWidth || 800, windowHeight || 450);
    frameRate(60);
  } catch (err) {
    parent.postMessage({
      type: 'SIM_ERROR',
      error: err.message,
      source: 'mechanics_2d',
      line: err.stack
    }, '*');
    console.error('[mechanics_2d] init crash:', err);
  }
  M2_fireReady();
}

// ── MAIN DRAW ───────────────────────────────────────────────
function draw() {
  if (!M2_cfg) return;
  try {
  // ── New-format early return ─────────────────────────────
  if (M2_isNewFormat) {
    M2_animPhase += 0.016;
    M2_drawNewScenario();
    return;
  }
  var cfg = M2_cfg;
  var st  = cfg.states && cfg.states[M2_state];
  if (!st) return;

  var bg = (cfg.pvl_colors && cfg.pvl_colors.background) || '#0A0A1A';
  background(bg);

  var dt   = 1 / 60;
  var scen = (cfg.scenario || 'projectile').toLowerCase();

  // ── Projectile: state-driven time control ──────────────────
  if (scen === 'projectile') {
    var ic_p  = cfg.initial_conditions || {};
    var v0_p  = ic_p.v0 || 20;
    var th_p  = ((ic_p.angle_deg || 45) * Math.PI) / 180;
    var vy0_p = v0_p * Math.sin(th_p);
    var tFlight_p = (2 * vy0_p) / M2_G;
    if (tFlight_p <= 0) tFlight_p = 3;

    var freezeT_p = (typeof st.freeze_at_t === 'number') ? st.freeze_at_t : -1;

    if (freezeT_p >= 0) {
      // Frozen at a specific moment
      if (M2_simT < freezeT_p) {
        M2_simT += dt;
        if (M2_simT > freezeT_p) M2_simT = freezeT_p;
      }
    } else {
      // Free-running animation — loop on full flight
      M2_simT += dt;
      if (M2_simT > tFlight_p + 0.3) {
        M2_simT = 0;
        M2_path = [];
      }
    }

  } else {
    // ── Non-projectile: freeze_at_t takes priority over loop ──
    var tgt = (typeof st.time_step === 'number' && st.time_step > 0) ? st.time_step : 5;
    var freezeT = (typeof st.freeze_at_t === 'number') ? st.freeze_at_t : -1;

    if (freezeT >= 0) {
      // Frozen state — advance toward freeze_at_t then hold
      if (M2_simT < freezeT) {
        M2_simT += dt;
        if (M2_simT > freezeT) M2_simT = freezeT;
      }
      // Once reached, hold forever — no reset
    } else {
      // Looping state — animate and reset at time_step
      M2_simT += dt;
      if (M2_simT > tgt) {
        M2_simT = 0;
        M2_path = [];
      }
    }
  }

  // ── Build path trail every frame (only while animating) ────
  var shouldTrail = cfg.show_path && st.show_path !== false;
  // For projectile STATE_1, skip trail; STATE_4 accumulates then holds
  if (shouldTrail && scen === 'projectile' && M2_state === 'STATE_1') {
    shouldTrail = false;
  }
  if (shouldTrail) {
    var pp = M2_getPos((cfg.objects && cfg.objects[0]), M2_simT);
    if (pp) M2_path.push({ x: pp.x, y: pp.y });
    if (M2_path.length > 600) M2_path.shift();
  }

  // ── Compute positions for all objects ─────────────────────
  var positions = {};
  if (cfg.objects) {
    for (var i = 0; i < cfg.objects.length; i++) {
      var obj = cfg.objects[i];
      positions[obj.id] = M2_getPos(obj, M2_simT);
    }
  }

  // ── Draw layers (back → front) ─────────────────────────────
  M2_drawSurface(cfg);
  
  if (scen === 'projectile') {
    var pX  = width * 0.10;
    var dW  = width - 2 * pX;
    var gY  = height * 0.85;
    
    push();
    strokeWeight(2);
    M2_stroke('#4FC3F7', 0.8);
    line(pX - 5, gY - 5, pX + 5, gY + 5);
    line(pX - 5, gY + 5, pX + 5, gY - 5);
    
    M2_stroke('#FF8A65', 0.8);
    line(pX + dW - 5, gY - 5, pX + dW + 5, gY + 5);
    line(pX + dW - 5, gY + 5, pX + dW + 5, gY - 5);
    pop();
  }
  M2_drawPulleyAndRope(cfg, positions);
  M2_drawSpring(cfg, positions);
  if (cfg.show_path && st.show_path !== false) M2_drawPath(cfg);
  M2_drawForces(cfg, st, positions);
  if (scen === 'non_inertial_frame') {
    M2_drawFrameBackground(cfg, M2_state);
  }
  M2_drawObjects(cfg, positions);
  M2_drawPendulumPeriodLabels(cfg, positions);   // ← ADD THIS LINE
  M2_drawVelocityArrows(cfg, st, positions);
  if (cfg.show_energy_bar) M2_drawEnergyBars(cfg, M2_simT);
  M2_drawAngleArcs(cfg, st, positions);

  // ── Projectile STATE_3: draw "vy = 0" annotation at apex ──
  if (scen === 'projectile' && M2_state === 'STATE_3') {
    var apexObj = cfg.objects && cfg.objects[0];
    if (apexObj) {
      var apexPos = positions[apexObj.id];
      if (apexPos) {
        noStroke();
        fill(255, 200, 0, 220);
        textSize(12);
        textAlign(CENTER, BOTTOM);
        text('v\\u1D67 = 0  (apex)', apexPos.x, apexPos.y - 22);
      }
    }
  }

  M2_drawLabel(st);
  M2_drawBorderFlash();

  // ── Unknown scenario warning ────────────────────────────────
  if (window._M2_unknownScenario) {
    push();
    noStroke();
    fill(220, 80, 40, 220);
    rect(10, 10, width - 20, 48, 6);
    fill(255, 255, 255, 240);
    textSize(12);
    textAlign(LEFT, CENTER);
    text('[mechanics_2d] Unknown scenario: "' + window._M2_unknownScenario + '"', 20, 24);
    textSize(11);
    fill(255, 200, 180, 200);
    text('Add this branch to M2_getPos() in mechanics_2d_renderer.ts', 20, 44);
    pop();
    console.error('[Mechanics2D] Unknown scenario:', window._M2_unknownScenario);
  }
  } catch (err) {
    parent.postMessage({
      type: 'SIM_ERROR',
      error: err.message,
      source: 'mechanics_2d_draw',
      line: err.stack
    }, '*');
    console.error('[mechanics_2d] draw crash:', err);
    M2_cfg = null;
  }
}

// ── DRAW: accelerating frame background (for non_inertial_frame) ─
function M2_drawFrameBackground(cfg, state) {
  var fOff = (typeof window._M2_frameOffset === 'number') ? window._M2_frameOffset : 0;
  var ic  = cfg.initial_conditions || {};
  var acc = ic.frame_acceleration_ms2 || 5;
  // Box stays fixed in STATE_3/STATE_4 to show resolution
  var boxOff = (state === 'STATE_3' || state === 'STATE_4') ? 0 : fOff * 0.3;

  push();
  noFill();
  stroke(180, 130, 50, 200);
  strokeWeight(2);
  rect(width * 0.15 + boxOff, height * 0.2, width * 0.65, height * 0.55, 12);

  // 'Accelerating Bus' label inside box
  fill(180, 130, 50, 160);
  noStroke();
  textSize(11);
  textAlign(CENTER, CENTER);
  text('Accelerating Bus', width * 0.15 + boxOff + width * 0.325, height * 0.78);

  // Ground arrow below box (stays fixed — ground is reference)
  stroke(255, 165, 50, 200);
  strokeWeight(2.5);
  var arrowY = height * 0.88;
  line(width * 0.15, arrowY, width * 0.75, arrowY);
  fill(255, 165, 50, 200);
  noStroke();
  triangle(width*0.77, arrowY, width*0.73, arrowY-8, width*0.73, arrowY+8);

  fill(255, 165, 50, 180);
  textSize(11);
  textAlign(CENTER, CENTER);
  text('Frame accelerating at ' + acc + ' m/s\u00b2  \u2192', width * 0.5, arrowY + 18);
  pop();
}

// ── PHYSICS: Full flight canvas mapping (projectile only) ──
function M2_projCanvasMap(realX, realY) {
  var ic = M2_cfg.initial_conditions || {};
  var v0   = ic.v0 || 20;
  var ang  = ((ic.angle_deg || 45) * Math.PI) / 180;
  var vx0  = v0 * Math.cos(ang);
  var vy0  = v0 * Math.sin(ang);
  var g    = M2_G;
  
  var tFlight  = (2 * vy0) / g;
  if (tFlight <= 0) tFlight = 1;
  var maxRange = vx0 * tFlight;
  var maxH     = (vy0 * vy0) / (2 * g);
  
  var padX  = width * 0.10;
  var padY  = height * 0.10;
  var drawW = width - 2 * padX;
  var drawH = height * 0.65;
  var groundY = height * 0.85;
  
  var canvasX = padX + (maxRange === 0 ? 0 : (realX / maxRange) * drawW);
  var canvasY = groundY - (maxH === 0 ? 0 : (realY / (maxH * 1.3)) * drawH);
  
  return { x: canvasX, y: canvasY };
}

// ── PHYSICS: compute object position at time t ──────────────
function M2_getPos(obj, t) {
  if (!obj || !M2_cfg) return { x: 0, y: 0, vx: 0, vy: 0 };
  var cfg  = M2_cfg;
  var ic   = cfg.initial_conditions || {};
  var sc   = cfg.canvas_scale || 50;
  var scen = (cfg.scenario || 'projectile').toLowerCase();

  var x = obj.initial_x, y = obj.initial_y, vx = 0, vy = 0;

  // ── projectile ──────────────────────────────────────────
  if (scen === 'projectile') {
    var v0  = ic.v0 || 20;
    var th  = ((ic.angle_deg || 45) * Math.PI) / 180;
    var vx0 = v0 * Math.cos(th);
    var vy0 = v0 * Math.sin(th);          // physics: +y = up

    var realX = vx0 * t;
    var realY = vy0 * t - 0.5 * M2_G * t * t;
    if (realY < 0 && t > 0) realY = 0; // clamp to ground
    
    var pos = M2_projCanvasMap(realX, realY);
    x  = pos.x;
    y  = pos.y;
    
    // Scale velocities just for arrow rendering sizes (px/s equivalent)
    vx = vx0 * sc;
    vy = (-vy0 + M2_G * t) * sc;         // screen: +y = down

  // ── pendulum ────────────────────────────────────────────
  } else if (scen === 'pendulum') {
    if (obj.shape === 'pendulum_bob' || obj.id.indexOf('bob') !== -1) {
      // Per-object fields take priority — allows dual/triple pendulum configs
      var L   = (typeof obj.pendulum_length_m  === 'number') ? obj.pendulum_length_m  : (ic.length_m  || 1.0);
      var th0_deg = (typeof obj.pendulum_angle_deg === 'number') ? obj.pendulum_angle_deg : (ic.angle_deg || 30);
      var th0 = (th0_deg * Math.PI) / 180;
      var om  = Math.sqrt(M2_G / L);
      var tht = th0 * Math.cos(om * t);

      // Per-object pivot overrides cfg.pulley (which is the shared global pivot)
      var px, py;
      if (typeof obj.pendulum_pivot_x === 'number' && typeof obj.pendulum_pivot_y === 'number') {
        px = obj.pendulum_pivot_x;
        py = obj.pendulum_pivot_y;
      } else if (cfg.pulley) {
        px = cfg.pulley.x;
        py = cfg.pulley.y;
      } else {
        px = width / 2;
        py = height * 0.15;
      }

      x  = px + L * sc * Math.sin(tht);
      y  = py + L * sc * Math.cos(tht);
      var dth = -om * th0 * Math.sin(om * t);
      vx = L * sc * Math.cos(tht) * dth;
      vy = -L * sc * Math.sin(tht) * dth;
    }

  // ── circular ────────────────────────────────────────────
  } else if (scen === 'circular') {
    var r_c  = (ic.radius_m || 2) * sc;
    var v_c  = ic.speed_ms || 10;
    var om_c = v_c / (ic.radius_m || 2);         // rad/s
    var cx   = ic.center_x != null ? ic.center_x : width  / 2;
    var cy   = ic.center_y != null ? ic.center_y : height / 2;
    var ph0  = ((ic.start_angle_deg || 0) * Math.PI) / 180;
    var phi  = ph0 + om_c * t;
    x  = cx + r_c * Math.cos(phi);
    y  = cy - r_c * Math.sin(phi);               // flip y: CCW = up
    vx = -v_c * sc * Math.sin(phi) / sc;         // keep in px/frame-like units
    vy =  v_c * sc * Math.cos(phi) / sc;
    vx = vx * sc; vy = vy * sc;                  // scale for arrow drawing

  // ── friction (block on surface) ─────────────────────────
  } else if (scen === 'friction') {
    var slope_r = ((cfg.surface && cfg.surface.slope_degrees) || 0) * Math.PI / 180;
    var m_f     = obj.mass || 1;
    var mu_k    = ic.mu_k || 0.3;
    var mu_s    = ic.mu_s || 0.5;
    var F_app   = ic.f_applied || 0;
    var N       = m_f * M2_G * Math.cos(slope_r);
    var grav_along = m_f * M2_G * Math.sin(slope_r);
    var f_k     = mu_k * N;
    var F_net   = F_app + grav_along - f_k;       // net force along slope downward
    // Check static: if F_app < mu_s * N, block is static
    var f_s_max = mu_s * N;
    var sliding = (F_app > f_s_max) || (grav_along > f_s_max);
    var s = sliding ? (0.5 * (F_net / m_f) * t * t) : 0;
    x  = obj.initial_x + s * sc * Math.cos(slope_r);
    y  = obj.initial_y + s * sc * Math.sin(slope_r);
    vx = 0; vy = 0;

  // ── spring-mass ─────────────────────────────────────────
  } else if (scen === 'spring_mass') {
    var k_s  = ic.spring_k || 10;
    var m_s  = obj.mass || 1;
    var A_s  = ic.amplitude_m || 0.5;
    var om_s = Math.sqrt(k_s / m_s);
    var ph_s = ((ic.phase_deg || 0) * Math.PI) / 180;
    x  = obj.initial_x + A_s * sc * Math.cos(om_s * t + ph_s);
    y  = obj.initial_y;
    vx = -A_s * sc * om_s * Math.sin(om_s * t + ph_s);
    vy = 0;

  // ── Atwood machine ──────────────────────────────────────
  } else if (scen === 'atwood') {
    var m1_a = ic.mass1_kg || 2;
    var m2_a = ic.mass2_kg || 1;
    var a_at = (m1_a - m2_a) / (m1_a + m2_a) * M2_G;
    // First object in array = heavier (goes down = +y in screen)
    var isFirst = (!M2_cfg.objects || obj === M2_cfg.objects[0]);
    var sign_a  = isFirst ? 1 : -1;
    var disp    = 0.5 * a_at * t * t;
    x  = obj.initial_x;
    y  = obj.initial_y + sign_a * disp * sc;
    vx = 0;
    vy = sign_a * a_at * t * sc;

  // ── work-energy ─────────────────────────────────────────
  } else if (scen === 'work_energy') {
    var F_we = ic.force_n || 10;
    var m_we = obj.mass  || 1;
    var a_we = F_we / m_we;
    x  = obj.initial_x + 0.5 * a_we * sc * t * t;
    y  = obj.initial_y;
    vx = a_we * sc * t;
    vy = 0;

  // ── conservation of momentum ─────────────────────────────
  } else if (scen === 'momentum') {
    var tc    = ic.collision_time || 1;
    var objs  = M2_cfg.objects || [];
    var isObj0 = (objs.length > 0 && obj === objs[0]);
    var m1_p = (objs[0] ? objs[0].mass : 1) || 1;
    var m2_p = (objs[1] ? objs[1].mass : 1) || 1;
    var v1i  = ic.v1_initial || 5;
    var v2i  = ic.v2_initial || 0;
    // Elastic collision velocities:
    var v1f = ((m1_p - m2_p) * v1i + 2 * m2_p * v2i) / (m1_p + m2_p);
    var v2f = ((m2_p - m1_p) * v2i + 2 * m1_p * v1i) / (m1_p + m2_p);
    if (isObj0) {
      var vi = t < tc ? v1i : v1f;
      var xc = obj.initial_x + v1i * sc * tc;
      x  = t < tc ? (obj.initial_x + v1i * sc * t) : (xc + v1f * sc * (t - tc));
      vx = vi * sc;
    } else {
      var vi2 = t < tc ? v2i : v2f;
      var xc2 = obj.initial_x + v2i * sc * tc;
      x  = t < tc ? (obj.initial_x + v2i * sc * t) : (xc2 + v2f * sc * (t - tc));
      vx = vi2 * sc;
    }
    y = obj.initial_y; vy = 0;

  // ── torque/rotation ─────────────────────────────────────
  } else if (scen === 'torque') {
    var I_t   = ic.moment_of_inertia || 1;
    var tau_t = ic.torque_nm || 5;
    var alph  = tau_t / I_t;
    var r_t   = (ic.radius_m || 1) * sc;
    var ang_t = 0.5 * alph * t * t;
    x  = obj.initial_x + r_t * Math.cos(ang_t - Math.PI / 2);
    y  = obj.initial_y + r_t * Math.sin(ang_t - Math.PI / 2);
    vx = 0; vy = 0;

  // ── banked road ─────────────────────────────────────────
  } else if (scen === 'banking') {
    x = obj.initial_x; y = obj.initial_y;
    vx = (ic.speed_ms || 20) * sc * 0.03; vy = 0;

  // ── non_inertial_frame (pseudo-forces / accelerating frame) ──
  } else if (scen === 'non_inertial_frame') {
    var a_frame = ic.frame_acceleration_ms2 || 5;
    // Object stays fixed; frame box animates rightward
    x = obj.initial_x;
    y = obj.initial_y;
    vx = 0; vy = 0;
    // Animate frame offset for the box overlay
    window._M2_frameOffset = (window._M2_frameOffset || 0);
    if (M2_state === 'STATE_1' || M2_state === 'STATE_2') {
      window._M2_frameOffset += a_frame * (1/60) * 4.0;
      if (window._M2_frameOffset > 120) window._M2_frameOffset = 0;
    } else if (M2_state === 'STATE_3' || M2_state === 'STATE_4') {
      window._M2_frameOffset = 0;
    }

  // ── free_body_diagram (fluids, equilibrium, generic) ─────────
  } else if (scen === 'free_body_diagram') {
    // Static object, no motion, only forces shown
    x = obj.initial_x;
    y = obj.initial_y;
    vx = 0; vy = 0;
  } else {
    // ── UNKNOWN SCENARIO — flag it ────────────────────────────
    window._M2_unknownScenario = cfg.scenario || 'undefined';
    x = obj.initial_x;
    y = obj.initial_y;
    vx = 0; vy = 0;
  }

  return { x: x, y: y, vx: vx, vy: vy };
}

// ── DRAW: ground / inclined surface ─────────────────────────
function M2_drawSurface(cfg) {
  if (!cfg.surface || !cfg.surface.exists) return;
  var scen = (cfg.scenario || 'projectile').toLowerCase();
  var sColor    = cfg.surface.color || '#555555';

  if (scen === 'projectile') {
    var padX  = width * 0.10;
    var drawW = width - 2 * padX;
    var groundY = height * 0.85;

    push();
    M2_stroke(sColor, 0.9);
    strokeWeight(2);
    line(0, groundY, width, groundY);

    M2_fill(sColor, 0.15);
    noStroke();
    rect(0, groundY, width, height - groundY);

    M2_stroke(sColor, 0.4);
    strokeWeight(1);
    for (var hx = 20; hx < width; hx += 20) {
      line(hx, groundY, hx - 10, groundY + 10);
    }
    pop();
    return;
  }

  var slope_deg = cfg.surface.slope_degrees || 0;
  var slope_r   = slope_deg * Math.PI / 180;

  push();
  translate(0, height);
  rotate(-slope_r);

  // Surface line
  M2_stroke(sColor, 0.9);
  strokeWeight(2);
  line(0, 0, width * 1.5, 0);

  // Ground fill
  M2_fill(sColor, 0.15);
  noStroke();
  beginShape();
  vertex(0, 0);
  vertex(width * 1.5, 0);
  vertex(width * 1.5, height * 0.5);
  vertex(0, height * 0.5);
  endShape(CLOSE);

  // Hatch marks
  M2_stroke(sColor, 0.4);
  strokeWeight(1);
  for (var hx = 0; hx < width * 1.5; hx += 20) {
    line(hx, 0, hx - 12, 12);
  }
  pop();
}

// ── DRAW: pulley + rope ─────────────────────────────────────
function M2_drawPulleyAndRope(cfg, positions) {
  var scen = (cfg.scenario || '').toLowerCase();

  if (scen === 'pendulum') {
    // Each pendulum-bob may have its own pivot — draw pivot dot + rope for each
    var objs = cfg.objects || [];
    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];
      if (obj.shape !== 'pendulum_bob' && obj.id.indexOf('bob') === -1) continue;
      var op = positions[obj.id];
      if (!op) continue;

      // Determine this bob's pivot
      var pivX, pivY;
      if (typeof obj.pendulum_pivot_x === 'number' && typeof obj.pendulum_pivot_y === 'number') {
        pivX = obj.pendulum_pivot_x;
        pivY = obj.pendulum_pivot_y;
      } else if (cfg.pulley) {
        pivX = cfg.pulley.x;
        pivY = cfg.pulley.y;
      } else {
        pivX = width / 2;
        pivY = height * 0.15;
      }

      // Draw pivot point
      noFill();
      M2_stroke('#AAAAAA', 0.9);
      strokeWeight(2);
      ellipse(pivX, pivY, 16, 16);
      M2_fill('#CCCCCC', 0.9);
      noStroke();
      ellipse(pivX, pivY, 6, 6);

      // Draw rope from pivot to bob
      M2_stroke('#DDDDDD', 0.7);
      strokeWeight(2);
      noFill();
      line(pivX, pivY + 8, op.x, op.y);
    }
    return;
  }

  // Non-pendulum: original pulley drawing
  if (!cfg.pulley) return;
  var px = cfg.pulley.x, py = cfg.pulley.y, pr = cfg.pulley.radius || 20;
  noFill();
  M2_stroke('#AAAAAA', 0.9);
  strokeWeight(2);
  ellipse(px, py, pr * 2);
  M2_stroke('#888888', 0.6);
  strokeWeight(4);
  ellipse(px, py, pr * 2 - 4);
  noStroke();
  M2_fill('#CCCCCC', 0.9);
  ellipse(px, py, 6);

  // Atwood ropes
  if ((cfg.scenario || '').toLowerCase() === 'atwood') {
    M2_stroke('#DDDDDD', 0.7);
    strokeWeight(2);
    noFill();
    var objs = cfg.objects || [];
    for (var j = 0; j < objs.length; j++) {
      var op2 = positions[objs[j].id];
      if (!op2) continue;
      var side = (j === 0) ? -1 : 1;
      line(px + side * pr, py, op2.x, op2.y);
    }
  }
}

// ── DRAW: zigzag spring ─────────────────────────────────────
function M2_drawSpring(cfg, positions) {
  if (!cfg.spring) return;
  var ax = cfg.spring.anchor_x, ay = cfg.spring.anchor_y;
  var sc = cfg.canvas_scale || 50;
  var objs = cfg.objects || [];
  // Connect to first object
  var op = objs.length > 0 ? positions[objs[0].id] : null;
  var bx = op ? op.x : ax, by = op ? op.y : ay + 100;

  var segs = 12, amp = 10;
  var dx = (bx - ax) / (segs + 1), dy = (by - ay) / (segs + 1);
  var len = Math.sqrt(dx*dx + dy*dy);
  // Perpendicular direction
  var nx = -dy / len, ny = dx / len;

  M2_stroke('#00BCD4', 0.8);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(ax, ay);
  // First straight segment (1/2)
  vertex(ax + dx * 0.5, ay + dy * 0.5);
  for (var j = 0; j < segs; j++) {
    var cx = ax + dx * (0.5 + j + 0.5);
    var cy = ay + dy * (0.5 + j + 0.5);
    var side = (j % 2 === 0) ? 1 : -1;
    vertex(cx + nx * amp * side, cy + ny * amp * side);
  }
  // Last straight segment
  vertex(ax + dx * (segs + 0.5), ay + dy * (segs + 0.5));
  vertex(bx, by);
  endShape();

  // Anchor dot
  noStroke();
  M2_fill('#888888', 0.9);
  ellipse(ax, ay, 10);
}

// ── DRAW: trajectory path ───────────────────────────────────
function M2_drawPath(cfg) {
  if (M2_path.length < 2) return;
  noFill();
  for (var i = 1; i < M2_path.length; i++) {
    var alpha = (i / M2_path.length) * 0.6;
    M2_stroke('#FFFFFF', alpha);
    strokeWeight(1);
    // Dotted effect: draw every other segment
    if (i % 3 !== 0) {
      line(M2_path[i-1].x, M2_path[i-1].y, M2_path[i].x, M2_path[i].y);
    }
  }
  noStroke();
}

// ── DRAW: force arrows ───────────────────────────────────────
function M2_drawForces(cfg, st, positions) {
  if (!cfg.forces || cfg.forces.length === 0) return;

  // Compute max magnitude for proportional scaling
  var maxMag = 0;
  for (var i = 0; i < cfg.forces.length; i++) {
    if (cfg.forces[i].magnitude > maxMag) maxMag = cfg.forces[i].magnitude;
  }
  if (maxMag === 0) maxMag = 1;
  var arrowScale = 80;   // pixels for max-magnitude force
  var arrowMin   = 24;   // minimum arrow length — no force ever renders below this

  var hlForces = (st.highlight_forces) || [];

  for (var fi = 0; fi < cfg.forces.length; fi++) {
    var fv = cfg.forces[fi];
    // Visibility: check show_in_states
    if (fv.show_in_states && fv.show_in_states.length > 0) {
      var visible = false;
      for (var si = 0; si < fv.show_in_states.length; si++) {
        if (fv.show_in_states[si] === M2_state) { visible = true; break; }
      }
      if (!visible) continue;
    }

    // Find attached object position
    var op = positions[fv.on_object];
    if (!op) {
      // Try first object as fallback
      var firstObj = cfg.objects && cfg.objects[0];
      op = firstObj ? positions[firstObj.id] : { x: width/2, y: height/2 };
    }

    // Arrow geometry
    var dir_rad = fv.direction_degrees * Math.PI / 180;
    var len = Math.max(arrowMin, (fv.magnitude / maxMag) * arrowScale);
    var dx  =  Math.cos(dir_rad) * len;
    var dy  = -Math.sin(dir_rad) * len; // screen y flipped

    var isHL = hlForces.indexOf(fv.name) !== -1;
    var alpha = isHL ? 1.0 : 0.75;
    M2_drawArrow(op.x, op.y, op.x + dx, op.y + dy, fv.color, fv.name, alpha, cfg.show_labels);
  }
}

// ── UTILITY: draw arrow with label ───────────────────────────
function M2_drawArrow(x1, y1, x2, y2, col, label, alpha, showLabel) {
  var dx = x2 - x1, dy = y2 - y1;
  var len = Math.sqrt(dx*dx + dy*dy);
  if (len < 2) return;

  M2_stroke(col, alpha);
  strokeWeight(2.5);
  line(x1, y1, x2, y2);

  // Arrowhead
  var hSize = 10;
  var ang   = Math.atan2(dy, dx);
  fill(M2_rgb(col)[0], M2_rgb(col)[1], M2_rgb(col)[2], alpha * 255);
  noStroke();
  push();
  translate(x2, y2);
  rotate(ang);
  triangle(0, 0, -hSize, -hSize * 0.4, -hSize, hSize * 0.4);
  pop();

  // Label — zone-based to avoid overlap
  if (showLabel && label) {
    var angle = Math.atan2(dy, dx); // -PI to PI
    var lx, ly;

    // RIGHT force (angle near 0): label in right zone
    if (angle > -0.8 && angle < 0.8) {
      lx = Math.max(x1, x2) + 28;
      ly = (y1 + y2) / 2;
    }
    // LEFT force (angle near PI or -PI): label in left zone
    else if (angle > 2.3 || angle < -2.3) {
      lx = Math.min(x1, x2) - 28;
      ly = (y1 + y2) / 2;
    }
    // UP force (angle near -PI/2): label above and to the right
    else if (angle < -0.8 && angle > -2.3) {
      lx = (x1 + x2) / 2 + 36;
      ly = Math.min(y1, y2) - 8;
    }
    // DOWN force (angle near PI/2): label below and to the right
    else {
      lx = (x1 + x2) / 2 + 36;
      ly = Math.max(y1, y2) + 16;
    }

    // Dark pill background
    textSize(11);
    var tw = textWidth(label);
    noStroke();
    fill(0, 0, 0, 200);
    rect(lx - tw/2 - 4, ly - 9, tw + 8, 18, 4);

    // Label text
    fill(M2_rgb(col)[0], M2_rgb(col)[1], M2_rgb(col)[2], alpha * 230);
    textAlign(CENTER, CENTER);
    text(label, lx, ly);
  }
}

// ── DRAW: velocity arrows (with optional components) ─────────
function M2_drawVelocityArrows(cfg, st, positions) {
  if (!cfg.objects) return;
  var scen = (cfg.scenario || '').toLowerCase();
  // Don't draw velocity arrows for static/banking displays
  if (scen === 'banking' || scen === 'friction') return;

  for (var i = 0; i < cfg.objects.length; i++) {
    var obj = cfg.objects[i];
    var op  = positions[obj.id];
    if (!op) continue;
    var vx = op.vx || 0, vy = op.vy || 0;
    var speed = Math.sqrt(vx*vx + vy*vy);
    if (speed < 0.5) continue;

    // Scale to readable length (max 60px)
    var maxV = 80;
    var scale = Math.min(60, Math.sqrt(speed)) / Math.sqrt(maxV);
    var dvx = vx * scale, dvy = vy * scale;

    M2_drawArrow(op.x, op.y, op.x + dvx, op.y + dvy, '#FFEB3B', 'v', 0.85, cfg.show_labels);

    // Component decomposition
    if (cfg.show_components) {
      if (Math.abs(dvx) > 2) M2_drawArrow(op.x, op.y, op.x + dvx, op.y, '#4FC3F7', 'v\\u2093', 0.7, cfg.show_labels);
      if (Math.abs(dvy) > 2) M2_drawArrow(op.x, op.y, op.x, op.y + dvy, '#EF9A9A', 'v\\u1D67', 0.7, cfg.show_labels);
    }

    // Centripetal acceleration arrow (circular only)
    if (scen === 'circular' && cfg.initial_conditions) {
      var ic  = cfg.initial_conditions;
      var cx  = ic.center_x != null ? ic.center_x : width  / 2;
      var cy2 = ic.center_y != null ? ic.center_y : height / 2;
      var ax  = cx - op.x, ay  = cy2 - op.y;
      var aLen = Math.sqrt(ax*ax + ay*ay);
      if (aLen > 2) {
        var aScale = 45 / aLen;
        M2_drawArrow(op.x, op.y, op.x + ax*aScale, op.y + ay*aScale, '#F48FB1', 'a\\u2063', 0.75, cfg.show_labels);
      }
    }
  }
}

// ── DRAW: pendulum period labels ─────────────────────────────
function M2_drawPendulumPeriodLabels(cfg, positions) {
  var scen = (cfg.scenario || '').toLowerCase();
  if (scen !== 'pendulum') return;
  var objs = cfg.objects || [];
  var sc   = cfg.canvas_scale || 50;
  
  // Only draw period labels when there are 2+ pendulum bobs
  var bobs = objs.filter(function(o) { 
    return o.shape === 'pendulum_bob' || o.id.indexOf('bob') !== -1; 
  });
  if (bobs.length < 2) return;

  for (var i = 0; i < bobs.length; i++) {
    var obj = bobs[i];
    var L = (typeof obj.pendulum_length_m === 'number') ? obj.pendulum_length_m : (cfg.initial_conditions.length_m || 1.0);
    var T = 2 * Math.PI * Math.sqrt(L / M2_G);

    var pivX = (typeof obj.pendulum_pivot_x === 'number') ? obj.pendulum_pivot_x : width / 2;
    var pivY = (typeof obj.pendulum_pivot_y === 'number') ? obj.pendulum_pivot_y : height * 0.15;

    // Draw T label above pivot
    textSize(12);
    textAlign(CENTER, BOTTOM);
    noStroke();
    
    // Background pill
    var lbl = 'T = ' + T.toFixed(2) + 's';
    var tw = textWidth(lbl);
    fill(0, 0, 0, 160);
    rect(pivX - tw/2 - 6, pivY - 34, tw + 12, 20, 4);
    
    // Text in object's color
    var col = obj.color || '#FFFFFF';
    fill(M2_rgb(col)[0], M2_rgb(col)[1], M2_rgb(col)[2], 230);
    text(lbl, pivX, pivY - 16);
  }

  // If all T values are equal (within 0.01s), add a banner: "T₁ = T₂ — mass doesn't matter"
  if (bobs.length >= 2) {
    var L0 = (typeof bobs[0].pendulum_length_m === 'number') ? bobs[0].pendulum_length_m : (cfg.initial_conditions.length_m || 1.0);
    var T0 = 2 * Math.PI * Math.sqrt(L0 / M2_G);
    var allSame = true;
    for (var j = 1; j < bobs.length; j++) {
      var Lj = (typeof bobs[j].pendulum_length_m === 'number') ? bobs[j].pendulum_length_m : (cfg.initial_conditions.length_m || 1.0);
      var Tj = 2 * Math.PI * Math.sqrt(Lj / M2_G);
      if (Math.abs(Tj - T0) > 0.01) { allSame = false; break; }
    }
    if (allSame) {
      // Green confirmation banner at bottom
      noStroke();
      fill(30, 158, 117, 200);
      rect(width/2 - 170, height - 46, 340, 28, 6);
      fill(255, 255, 255, 240);
      textSize(12);
      textAlign(CENTER, CENTER);
      text('T\\u2081 = T\\u2082  \\u2014  period is independent of mass', width/2, height - 32);
    }
  }
}

// ── DRAW: energy bars (KE / PE / Total) ─────────────────────
function M2_drawEnergyBars(cfg, t) {
  var ic    = cfg.initial_conditions || {};
  var scen  = (cfg.scenario || '').toLowerCase();
  var objs  = cfg.objects || [];
  var m     = (objs[0] ? objs[0].mass : 1) || 1;
  var sc    = cfg.canvas_scale || 50;
  var KE = 0, PE = 0, Total = 0;

  if (scen === 'projectile') {
    var v0_e  = ic.v0 || 20;
    var th_e  = ((ic.angle_deg || 45) * Math.PI) / 180;
    var vy0_e = v0_e * Math.sin(th_e);
    // Height at time t (physics y, positive up)
    var h_e   = vy0_e * t - 0.5 * M2_G * t * t;
    Total = 0.5 * m * v0_e * v0_e;
    PE    = m * M2_G * Math.max(h_e, 0);
    KE    = Math.max(Total - PE, 0);

  } else if (scen === 'pendulum') {
    var L_e   = ic.length_m || 1.0;
    var th0_e = ((ic.angle_deg || 30) * Math.PI) / 180;
    var om_e  = Math.sqrt(M2_G / L_e);
    var tht_e = th0_e * Math.cos(om_e * t);
    Total = m * M2_G * L_e * (1 - Math.cos(th0_e));
    PE    = m * M2_G * L_e * (1 - Math.cos(tht_e));
    KE    = Math.max(Total - PE, 0);

  } else if (scen === 'spring_mass') {
    var k_e  = ic.spring_k || 10;
    var A_e  = ic.amplitude_m || 0.5;
    var om_e2 = Math.sqrt(k_e / m);
    var ph_e = ((ic.phase_deg || 0) * Math.PI) / 180;
    var x_disp = A_e * Math.cos(om_e2 * t + ph_e);
    Total = 0.5 * k_e * A_e * A_e;
    PE    = 0.5 * k_e * x_disp * x_disp;
    KE    = Math.max(Total - PE, 0);

  } else if (scen === 'work_energy') {
    var F_e = ic.force_n || 10;
    var a_e = F_e / m;
    var v_e = a_e * t;
    KE    = 0.5 * m * v_e * v_e;
    PE    = 0;
    Total = KE;

  } else if (scen === 'atwood') {
    var m1_e = ic.mass1_kg || 2;
    var m2_e = ic.mass2_kg || 1;
    var a_e2 = (m1_e - m2_e) / (m1_e + m2_e) * M2_G;
    var v_e2 = a_e2 * t;
    KE    = 0.5 * (m1_e + m2_e) * v_e2 * v_e2;
    var h_e2 = 0.5 * a_e2 * t * t;
    PE    = Math.abs((m1_e - m2_e)) * M2_G * h_e2;
    Total = KE + PE;

  } else {
    // Generic: show KE only
    var firstPos = objs.length > 0 ? M2_getPos(objs[0], t) : null;
    if (firstPos) {
      var spd = Math.sqrt(firstPos.vx*firstPos.vx + firstPos.vy*firstPos.vy) / (cfg.canvas_scale||50);
      KE = 0.5 * m * spd * spd;
    }
    Total = KE;
    PE    = 0;
  }

  // Render bars
  var barW = 28, barH = 120, bx = width - 120, by = 20;
  var maxE = Math.max(Total, 1);

  var bars = [
    { label: 'KE', val: KE,    color: '#FF9800' },
    { label: 'PE', val: PE,    color: '#42A5F5' },
    { label: 'E',  val: Total, color: '#66BB6A' },
  ];

  // Panel background
  noStroke();
  fill(0, 0, 0, 160);
  rect(bx - 10, by - 10, 110, barH + 50, 6);

  for (var bi = 0; bi < bars.length; bi++) {
    var bar  = bars[bi];
    var bxb  = bx + bi * 36;
    var barFill = constrain(bar.val / maxE, 0, 1) * barH;

    // Trough
    M2_stroke('#333333', 0.8);
    strokeWeight(1);
    noFill();
    rect(bxb, by, barW, barH, 3);

    // Fill
    noStroke();
    M2_fill(bar.color, 0.85);
    rect(bxb, by + barH - barFill, barW, barFill, 3);

    // Label below
    M2_fill(bar.color, 0.9);
    textSize(10);
    textAlign(CENTER, TOP);
    noStroke();
    text(bar.label, bxb + barW/2, by + barH + 6);

    // Value
    fill(200, 200, 200, 180);
    textSize(9);
    text(bar.val.toFixed(1), bxb + barW/2, by + barH + 18);
  }
  textAlign(LEFT, BASELINE);
}

// ── DRAW: angle arcs ─────────────────────────────────────────
function M2_drawAngleArcs(cfg, st, positions) {
  var scen = (cfg.scenario || '').toLowerCase();
  var ic   = cfg.initial_conditions || {};
  var sc   = cfg.canvas_scale || 50;

  if (scen === 'projectile') {
    // Launch angle arc from start position
    var obj0 = cfg.objects && cfg.objects[0];
    if (!obj0) return;
    var bx  = obj0.initial_x, by = obj0.initial_y;
    var ang = (ic.angle_deg || 45) * Math.PI / 180;
    var arcR = 40;
    noFill();
    M2_stroke('#FFD54F', 0.7);
    strokeWeight(1.5);
    arc(bx, by, arcR*2, arcR*2, -ang, 0);
    // Label
    M2_fill('#FFD54F', 0.8);
    noStroke();
    textSize(12);
    textAlign(LEFT, CENTER);
    text(Math.round(ic.angle_deg || 45) + '\\u00B0', bx + arcR + 6, by - arcR * 0.3);

  } else if (scen === 'pendulum') {
    // Equilibrium line
    var ppu = cfg.pulley;
    if (!ppu) return;
    M2_stroke('#555555', 0.5);
    strokeWeight(1);
    line(ppu.x, ppu.y, ppu.x, ppu.y + (ic.length_m||1)*sc);
    // Current angle arc
    var L_a  = ic.length_m || 1;
    var th0_a = (ic.angle_deg || 30) * Math.PI / 180;
    var om_a  = Math.sqrt(M2_G / L_a);
    var tht_a = th0_a * Math.cos(om_a * M2_simT);
    noFill();
    M2_stroke('#FFD54F', 0.6);
    strokeWeight(1.5);
    arc(ppu.x, ppu.y, 60, 60, Math.PI/2 - tht_a, Math.PI/2);

  } else if (scen === 'banking') {
    // Banking angle arc on the road
    var slope_b = ((cfg.surface && cfg.surface.slope_degrees) || 15) * Math.PI / 180;
    noFill();
    M2_stroke('#FFD54F', 0.7);
    strokeWeight(1.5);
    var bxb = width/2 - 40;
    arc(bxb, height - 20, 50, 50, -slope_b - Math.PI/2, -Math.PI/2);
    M2_fill('#FFD54F', 0.8);
    noStroke();
    textSize(11);
    textAlign(CENTER, CENTER);
    text(Math.round((cfg.surface&&cfg.surface.slope_degrees)||15) + '\\u00B0', bxb + 35, height - 35);
  }
}

// ── DRAW: objects ────────────────────────────────────────────
function M2_drawObjects(cfg, positions) {
  if (!cfg.objects) return;
  for (var i = 0; i < cfg.objects.length; i++) {
    var obj = cfg.objects[i];
    var op  = positions[obj.id];
    if (!op) continue;
    M2_drawOneObject(obj, op.x, op.y, cfg);
  }
}

function M2_drawOneObject(obj, ox, oy, cfg) {
  var col    = obj.color || '#FFFFFF';
  var sc     = cfg.canvas_scale || 50;
  var scen   = (cfg.scenario || '').toLowerCase();

  noStroke();
  M2_fill(col, 0.9);

  if (obj.shape === 'circle' || obj.shape === 'pendulum_bob') {
    var r = (obj.radius || 0.2) * sc;
    r = constrain(r, 8, 50);
    // Glow
    M2_fill(col, 0.12);
    ellipse(ox, oy, r * 3.2);
    M2_fill(col, 0.25);
    ellipse(ox, oy, r * 2.0);
    M2_fill(col, 0.9);
    ellipse(ox, oy, r);
    // Highlight
    fill(255, 255, 255, 60);
    ellipse(ox - r*0.22, oy - r*0.22, r * 0.45);

  } else if (obj.shape === 'rect') {
    var bw = (obj.width  || 0.8) * sc;
    var bh = (obj.height || 0.4) * sc;
    bw = constrain(bw, 20, 120);
    bh = constrain(bh, 12,  60);

    // Rotate if on inclined surface
    if (cfg.surface && cfg.surface.slope_degrees && cfg.surface.slope_degrees !== 0) {
      var slope_r = cfg.surface.slope_degrees * Math.PI / 180;
      push();
      translate(ox, oy);
      rotate(-slope_r);
      M2_fill(col, 0.85);
      rect(-bw/2, -bh/2, bw, bh, 3);
      // Shine
      fill(255, 255, 255, 25);
      rect(-bw/2, -bh/2, bw, bh/3, 3);
      pop();
    } else {
      M2_fill(col, 0.85);
      rect(ox - bw/2, oy - bh/2, bw, bh, 3);
      fill(255, 255, 255, 25);
      rect(ox - bw/2, oy - bh/2, bw, bh/3, 3);
    }
  }

  // Label — top-right corner of object, never at center
  if (cfg.show_labels && obj.label) {
    textSize(10);
    textAlign(LEFT, BOTTOM);
    var labelX = ox + (obj.shape === 'rect'
      ? (obj.width  || 0.8) * (cfg.canvas_scale || 50) * 0.5 + 4
      : (obj.radius || 0.2) * (cfg.canvas_scale || 50) + 4);
    var labelY = oy - (obj.shape === 'rect'
      ? (obj.height || 0.4) * (cfg.canvas_scale || 50) * 0.5
      : (obj.radius || 0.2) * (cfg.canvas_scale || 50));
    var lw = textWidth(obj.label);
    noStroke();
    fill(0, 0, 0, 160);
    rect(labelX - 2, labelY - 12, lw + 6, 14, 3);
    fill(200, 200, 200, 220);
    text(obj.label, labelX, labelY);
  }
}

// ── DRAW: state label ────────────────────────────────────────
function M2_drawLabel(st) {
  var lbl = st.label || M2_state;
  textSize(12);
  var tw = textWidth(lbl);
  noStroke();
  fill(0, 0, 0, 140);
  rect(8, height - 32, tw + 20, 24, 6);
  fill(200, 200, 210, 220);
  textAlign(LEFT, CENTER);
  text(lbl, 18, height - 20);
}

// ── DRAW: border flash on state change ───────────────────────
function M2_drawBorderFlash() {
  var curSt = M2_isNewFormat ? M2_newStateKey : M2_state;
  if (curSt !== M2_prevSt) {
    M2_flash  = 1.0;
    M2_prevSt = curSt;
  }
  if (M2_flash > 0) {
    noFill();
    stroke(59, 130, 246, M2_flash * 0.6 * 255);
    strokeWeight(3);
    rect(1, 1, width - 2, height - 2, 4);
    noStroke();
    M2_flash -= 0.025;
  }
}

// ── postMessage bridge ───────────────────────────────────────
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.type) return;
  if (e.data.type === 'SET_STATE') {
    var ns = e.data.state;
    if (M2_isNewFormat) {
      if (M2_newStates[ns]) {
        M2_newStateKey  = ns;
        M2_simT         = 0;
        M2_animPhase    = 0;
        M2_path         = [];
        M2_sliderValues = {};
        parent.postMessage({ type: 'STATE_REACHED', state: ns }, '*');
      }
    } else {
      if (M2_cfg && M2_cfg.states && M2_cfg.states[ns]) {
        M2_simT  = 0;
        M2_path  = [];
        M2_state = ns;
        parent.postMessage({ type: 'STATE_REACHED', state: ns }, '*');
      }
    }
  }
});

// ── New-format helpers ────────────────────────────────────────

function M2_stateIdx() {
  var s = M2_newStateKey || 'STATE_1';
  var n = parseInt(s.replace('STATE_', ''), 10);
  return isNaN(n) ? 1 : n;
}

function M2_unknownBanner(name) {
  fill(40, 40, 40); noStroke(); rect(0, 0, width, height);
  fill(255, 220, 80); textAlign(CENTER, CENTER); textSize(16);
  text('Unknown scenario: ' + name, width/2, height/2);
}

function M2_drawNewStateBanner(stateData) {
  if (!stateData) return;
  var lbl = stateData.label || M2_newStateKey;
  M2_fill('#000000', 0.55);
  noStroke();
  rect(10, height - 38, 220, 28, 6);
  fill(255); textSize(12); textAlign(LEFT, CENTER);
  text(lbl, 18, height - 24);
}

function M2_newArrow(x1, y1, x2, y2, hexCol, lbl) {
  M2_drawArrow(x1, y1, x2, y2, hexCol, lbl, 1.0, lbl !== '');
}

function M2_textBox(x, y, txt, hexCol, sz) {
  var tw = textWidth(txt);
  M2_fill('#000000', 0.6);
  noStroke();
  rect(x - 6, y - (sz || 14) * 0.75, tw + 12, (sz || 14) * 1.4, 4);
  fill(hexCol || '#FFFFFF');
  textSize(sz || 14);
  textAlign(LEFT, BASELINE);
  text(txt, x, y);
}

function M2_getCanvasSliderVal(id, minV, maxV, defV, slotY, label) {
  if (M2_sliderValues[id] === undefined) M2_sliderValues[id] = defV;
  var slotX = 60, slotW = width - 120;
  var frac = (M2_sliderValues[id] - minV) / (maxV - minV);
  var knobX = slotX + frac * slotW;
  stroke('#555555'); strokeWeight(3); line(slotX, slotY, slotX + slotW, slotY);
  M2_fill('#FFDC64', 1.0); stroke('#888888'); strokeWeight(1);
  ellipse(knobX, slotY, 16, 16);
  fill('#CCCCCC'); noStroke(); textSize(11); textAlign(LEFT, CENTER);
  text(label + ': ' + M2_sliderValues[id].toFixed(1), slotX, slotY - 14);
  if (mouseIsPressed && abs(mouseY - slotY) < 18 && mouseX > slotX && mouseX < slotX + slotW) {
    var newFrac = constrain((mouseX - slotX) / slotW, 0, 1);
    M2_sliderValues[id] = parseFloat((minV + newFrac * (maxV - minV)).toFixed(1));
    parent.postMessage({
      type: 'PARAM_UPDATE',
      key: id,
      value: M2_sliderValues[id]
    }, '*');
  }
  return M2_sliderValues[id];
}


// ── Shared Utility Functions ─────────────────────────────────────

function M2_drawAxes(ox, oy, xLen, yLen, xLabel, yLabel, col) {
  M2_stroke(col || '#555566', 0.8);
  strokeWeight(1);
  line(ox, oy, ox + xLen, oy);
  line(ox, oy, ox, oy - yLen);
  M2_fill(col || '#555566', 0.8);
  noStroke();
  triangle(ox + xLen, oy, ox + xLen - 6, oy - 3, ox + xLen - 6, oy + 3);
  triangle(ox, oy - yLen, ox - 3, oy - yLen + 6, ox + 3, oy - yLen + 6);
  fill(150); textSize(10);
  textAlign(CENTER, TOP); text(xLabel || 'x', ox + xLen - 10, oy + 4);
  textAlign(RIGHT, CENTER); text(yLabel || 'y', ox - 6, oy - yLen + 10);
}

function M2_drawAngleArc(cx, cy, r, startRad, endRad, col, label) {
  noFill();
  M2_stroke(col || '#FFD54F', 0.7);
  strokeWeight(1.5);
  arc(cx, cy, r * 2, r * 2, -endRad, -startRad);
  if (label) {
    var midA = (startRad + endRad) / 2;
    M2_fill(col || '#FFD54F', 0.8);
    noStroke(); textSize(11); textAlign(CENTER, CENTER);
    text(label, cx + (r + 14) * Math.cos(midA), cy - (r + 14) * Math.sin(midA));
  }
}

function M2_drawDashedLine(x1, y1, x2, y2, col, dashLen, gapLen) {
  M2_stroke(col || '#888888', 0.7);
  strokeWeight(1.5);
  drawingContext.setLineDash([dashLen || 6, gapLen || 4]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);
}

function M2_drawFormulaBox(x, y, w, lines, bgCol, txtCol) {
  var h = lines.length * 22 + 16;
  M2_fill(bgCol || '#000000', 0.65);
  noStroke();
  rect(x, y, w, h, 6);
  var c = txtCol ? M2_rgb(txtCol) : [220, 220, 230];
  for (var i = 0; i < lines.length; i++) {
    fill(c[0], c[1], c[2], 230);
    textSize(12); textAlign(LEFT, TOP);
    text(lines[i], x + 10, y + 8 + i * 22);
  }
}

function M2_drawParallelogram(ox, oy, ax, ay, bx, by, shade, outline) {
  M2_fill(shade || '#FFFFFF', 0.08);
  M2_stroke(outline || '#888888', 0.4);
  strokeWeight(1);
  beginShape();
  vertex(ox, oy); vertex(ox + ax, oy + ay);
  vertex(ox + ax + bx, oy + ay + by); vertex(ox + bx, oy + by);
  endShape(CLOSE);
}

function M2_drawVelocityTriangle(cx, cy, v1x, v1y, v1Col, v1Lbl, v2x, v2y, v2Col, v2Lbl, rCol, rLbl) {
  M2_newArrow(cx, cy, cx + v1x, cy + v1y, v1Col, v1Lbl);
  M2_newArrow(cx + v1x, cy + v1y, cx + v1x + v2x, cy + v1y + v2y, v2Col, v2Lbl);
  M2_newArrow(cx, cy, cx + v1x + v2x, cy + v1y + v2y, rCol, rLbl);
}

function M2_drawNumberLine(y, minVal, maxVal, col, nTicks) {
  var px1 = 50, px2 = width - 50;
  M2_stroke(col || '#AAAAAA', 0.8); strokeWeight(2);
  line(px1, y, px2, y);
  var n = nTicks || 5;
  for (var i = 0; i <= n; i++) {
    var tx = px1 + (px2 - px1) * i / n;
    var val = minVal + (maxVal - minVal) * i / n;
    strokeWeight(1); line(tx, y - 5, tx, y + 5);
    noStroke(); M2_fill(col || '#AAAAAA', 0.7);
    textSize(9); textAlign(CENTER, TOP);
    text(val.toFixed(0), tx, y + 7);
  }
  return { x1: px1, x2: px2 };
}

function M2_drawParticle(px, py, r, col, lbl) {
  noStroke();
  M2_fill(col || '#60a5fa', 0.15); ellipse(px, py, r * 3);
  M2_fill(col || '#60a5fa', 0.3); ellipse(px, py, r * 2);
  M2_fill(col || '#60a5fa', 0.9); ellipse(px, py, r);
  fill(255, 255, 255, 60); ellipse(px - r * 0.2, py - r * 0.2, r * 0.4);
  if (lbl) { M2_fill(col || '#60a5fa', 0.9); textSize(10); textAlign(CENTER, BOTTOM); noStroke(); text(lbl, px, py - r - 2); }
}

function M2_drawGraphCurve(ox, oy, w, h, points, col, cursorT, tMax) {
  M2_stroke(col || '#60a5fa', 0.9); strokeWeight(2); noFill();
  beginShape();
  for (var i = 0; i < points.length; i++) { vertex(ox + points[i].x * w, oy - points[i].y * h); }
  endShape();
  if (cursorT !== undefined && tMax > 0) {
    var cx2 = ox + (cursorT / tMax) * w;
    stroke(255, 255, 255, 150); strokeWeight(1);
    line(cx2, oy - h, cx2, oy);
    var frac = constrain(cursorT / tMax, 0, 1);
    var idx2 = Math.floor(frac * (points.length - 1));
    idx2 = constrain(idx2, 0, points.length - 2);
    var localF = frac * (points.length - 1) - idx2;
    var py2 = points[idx2].y + (points[idx2 + 1].y - points[idx2].y) * localF;
    M2_fill('#fbbf24', 1.0); noStroke(); ellipse(cx2, oy - py2 * h, 7, 7);
  }
}

function M2_easeInOut(val) { return val < 0.5 ? 2 * val * val : 1 - Math.pow(-2 * val + 2, 2) / 2; }

function M2_drawRightAngle(x, y, sz, rot) {
  push(); translate(x, y); rotate(rot || 0);
  noFill(); stroke(200, 200, 200, 150); strokeWeight(1);
  line(0, 0, sz, 0); line(sz, 0, sz, -sz);
  pop();
}

function M2_drawStickFigure(px, py, walking, umbAngleDeg) {
  var tm = millis();
  var legSw = walking ? ((tm % 1000 < 500) ? -1 : 1) : 0;
  stroke(220, 220, 220); strokeWeight(2); noFill();
  ellipse(px, py, 16, 16);
  line(px, py + 8, px, py + 38);
  line(px - 12, py + 20, px + 12, py + 20);
  line(px, py + 38, px + legSw * 10, py + 55);
  line(px, py + 38, px - legSw * 10, py + 55);
  if (umbAngleDeg !== undefined) {
    var ua = umbAngleDeg * Math.PI / 180;
    var ux = px + 45 * Math.sin(ua);
    var uy = py - 45 * Math.cos(ua);
    stroke(180, 120, 220); strokeWeight(2);
    line(px, py, ux, uy);
    noFill(); strokeWeight(2.5);
    arc(ux, uy, 70, 40, ua - Math.PI / 2 - Math.PI / 3, ua - Math.PI / 2 + Math.PI / 3);
  }
}

function M2_valFromFacts(cfg, key, fallback) {
  if (cfg.locked_facts && cfg.locked_facts[key] !== undefined) return cfg.locked_facts[key];
  if (cfg.variables && cfg.variables[key] !== undefined) return cfg.variables[key];
  return fallback;
}

function M2_paramSlot(cfg, key, fallback) {
  if (cfg.parameter_slots && cfg.parameter_slots[key] && cfg.parameter_slots[key]['default'] !== undefined) return cfg.parameter_slots[key]['default'];
  return fallback;
}

// ── Scenario Router (updated) ────────────────────────────────────

function M2_drawNewScenario() {
  var cfg = M2_cfg;
  var stateData = M2_newStates[M2_newStateKey] || {};
  var pl = stateData.physics_layer || {};
  var freeze = pl.freeze_at_t;
  if (freeze !== undefined && M2_simT >= freeze) {
    M2_simT = freeze;
  } else {
    M2_simT += 0.016;
  }
  var t = M2_simT;
  var scenario = (cfg.renderer_hint && cfg.renderer_hint.scenario_type) || 'vector_addition';
  if      (scenario === 'scalar_vs_vector')          M2_scalarVsVector(cfg, stateData, t);
  else if (scenario === 'vector_basics')             M2_vectorBasics(cfg, stateData, t);
  else if (scenario === 'vector_addition')           M2_vectorAddition(cfg, stateData, t);
  else if (scenario === 'vector_components')         M2_vectorComponents(cfg, stateData, t);
  else if (scenario === 'dot_product')               M2_dotProduct(cfg, stateData, t);
  else if (scenario === 'distance_vs_displacement')  M2_distanceVsDisplacement(cfg, stateData, t);
  else if (scenario === 'uniform_acceleration')      M2_uniformAcceleration(cfg, stateData, t);
  else if (scenario === 'non_uniform_acceleration')  M2_nonUniformAcceleration(cfg, stateData, t);
  else if (scenario === 'motion_graphs')             M2_motionGraphs(cfg, stateData, t);
  else if (scenario === 'relative_motion' || scenario === 'relative_velocity') M2_relativeMotion(cfg, stateData, t);
  else if (scenario === 'river_boat')                M2_riverBoat(cfg, stateData, t);
  else if (scenario === 'rain_umbrella')             M2_rainUmbrella(cfg, stateData, t);
  else if (scenario === 'aircraft_wind')             M2_aircraftWind(cfg, stateData, t);
  else if (scenario === 'projectile_motion')         M2_projectileMotion(cfg, stateData, t);
  else if (scenario === 'projectile_inclined')       M2_projectileInclined(cfg, stateData, t);
  else if (scenario === 'two_projectiles')           M2_twoProjectiles(cfg, stateData, t);
  else                                               M2_unknownBanner(scenario);
  M2_drawNewStateBanner(stateData);
  M2_drawBorderFlash();
}

// ── Environment Painters (enhanced) ──────────────────────────────

function M2_drawRiverEnv(t, d_m) {
  for (var sy = 0; sy < height * 0.30; sy++) {
    var sf = sy / (height * 0.30);
    stroke(140 + sf * 40, 190 + sf * 20, 220 + sf * 20); strokeWeight(1);
    line(0, sy, width, sy);
  }
  M2_fill('#7B5B3A', 1.0); noStroke();
  rect(0, height * 0.30, width, height * 0.05);
  M2_fill('#5C8A3C', 1.0);
  rect(0, 0, width, height * 0.30);
  for (var ry = 0; ry < height * 0.30; ry++) {
    var rf = ry / (height * 0.30);
    stroke(30 + rf * 20, 80 + rf * 20, 160 + rf * 30); strokeWeight(1);
    line(0, height * 0.35 + ry, width, height * 0.35 + ry);
  }
  for (var wp = 0; wp < 50; wp++) {
    var wx = ((wp * 47 + t * 50) % (width + 80)) - 40;
    var wy = height * 0.35 + (wp * 31 % (height * 0.30));
    M2_fill('#88BBFF', 0.4); noStroke();
    ellipse(wx, wy, 4, 2);
  }
  for (var ca = 0; ca < 5; ca++) {
    var cax = ((ca * 160 + t * 60) % (width + 100)) - 50;
    var cay = height * 0.40 + ca * height * 0.05;
    M2_stroke('#64B4FF', 0.5); strokeWeight(1.5);
    drawingContext.setLineDash([8, 5]);
    line(cax, cay, cax + 40, cay);
    drawingContext.setLineDash([]);
    M2_fill('#64B4FF', 0.5); noStroke();
    triangle(cax + 42, cay, cax + 36, cay - 3, cax + 36, cay + 3);
  }
  M2_fill('#7B5B3A', 1.0); noStroke();
  rect(0, height * 0.65, width, height * 0.05);
  M2_fill('#5C8A3C', 1.0);
  rect(0, height * 0.70, width, height * 0.30);
  fill(255, 255, 255, 200); textSize(11); textAlign(LEFT, CENTER);
  text('BANK A', 10, height * 0.15);
  text('BANK B', 10, height * 0.82);
  M2_stroke('#FF5050', 0.9); strokeWeight(2);
  line(width / 2, height * 0.30 - 4, width / 2, height * 0.30 - 24);
  M2_fill('#FF5050', 0.9); noStroke();
  triangle(width / 2, height * 0.30 - 24, width / 2, height * 0.30 - 14, width / 2 + 12, height * 0.30 - 19);
  var dVal = d_m || 30;
  M2_stroke('#FFFFFF', 0.5); strokeWeight(1);
  drawingContext.setLineDash([4, 3]);
  line(width - 40, height * 0.35, width - 40, height * 0.65);
  drawingContext.setLineDash([]);
  fill(255, 255, 255, 180); textSize(10); textAlign(CENTER, CENTER); noStroke();
  text('d = ' + dVal + ' m', width - 40, height * 0.50);
}

function M2_drawRainEnv(t, rainAngleDeg, vMan, vRain) {
  for (var sy2 = 0; sy2 < height - 40; sy2++) {
    var sf2 = sy2 / (height - 40);
    stroke(70 + sf2 * 30, 80 + sf2 * 20, 100 + sf2 * 20); strokeWeight(1);
    line(0, sy2, width, sy2);
  }
  M2_fill('#3A3A3A', 1.0); noStroke();
  rect(0, height - 40, width, 40);
  M2_fill('#556688', 0.3); noStroke();
  ellipse(100, height - 20, 60, 8);
  ellipse(400, height - 25, 80, 10);
  ellipse(650, height - 18, 50, 6);
  var rAngle = (rainAngleDeg || 0) * Math.PI / 180;
  stroke(170, 190, 220, 120); strokeWeight(1);
  for (var ri = 0; ri < 50; ri++) {
    var rx = ((ri * 43 + t * 140 * Math.sin(rAngle + 0.01)) % (width + 100)) - 50;
    var ry2 = ((ri * 67 + t * 140) % (height - 40));
    var rLen = 20;
    line(rx, ry2, rx + rLen * Math.sin(rAngle), ry2 + rLen * Math.cos(rAngle));
  }
}

function M2_drawAircraftMapEnv(ax_a, ay_a, bx_a, by_a) {
  for (var my = 0; my < height; my++) {
    var mf = my / height;
    stroke(180 + mf * 20, 210 - mf * 10, 160 + mf * 20); strokeWeight(1);
    line(0, my, width, my);
  }
  stroke(160, 190, 140, 80); strokeWeight(1);
  for (var gx2 = 0; gx2 < width; gx2 += 50) line(gx2, 0, gx2, height);
  for (var gy2 = 0; gy2 < height; gy2 += 50) line(0, gy2, width, gy2);
  var crx = width - 40, cry = 40;
  stroke(80); strokeWeight(1.5);
  line(crx, cry - 20, crx, cry + 20);
  line(crx - 20, cry, crx + 20, cry);
  fill(60); noStroke(); textSize(10); textAlign(CENTER, CENTER);
  text('N', crx, cry - 26); text('S', crx, cry + 26);
  text('E', crx + 26, cry); text('W', crx - 26, cry);
  var ptAx = ax_a || width * 0.2, ptAy = ay_a || height * 0.75;
  var ptBx = bx_a || width * 0.8, ptBy = by_a || height * 0.25;
  M2_fill('#FF5050', 0.9); noStroke();
  ellipse(ptAx, ptAy, 12, 12);
  fill(60); textSize(11); textAlign(CENTER, TOP);
  text('A', ptAx, ptAy + 8);
  M2_fill('#50FF50', 0.9); noStroke();
  ellipse(ptBx, ptBy, 12, 12);
  fill(60); textSize(11); textAlign(CENTER, TOP);
  text('B', ptBx, ptBy + 8);
}

// ── Scenario Renderers (rebuilt) ─────────────────────────────────

function M2_scalarVsVector(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','scalar_examples','vector_examples','scalar_addition','vector_addition_direction','vector_properties','svv_comparison_table']; sub = fm[idx] || 'scalar_examples'; }
  background(15, 15, 26);
  var cx = width / 2, cy = height / 2;
  if (sub === 'scalar_examples') {
    var angleDeg = M2_getCanvasSliderVal('jAngle', 0, 180, 60, height - 50, 'Angle between wires (\u00B0)');
    var angRad = angleDeg * Math.PI / 180;
    var jx = cx, jy = cy - 20;
    M2_fill('#FFFFFF', 0.9); noStroke(); ellipse(jx, jy, 10, 10);
    var w1x = jx - 100 * Math.cos(angRad / 2), w1y = jy - 100 * Math.sin(angRad / 2);
    M2_newArrow(w1x, w1y, jx, jy, '#60a5fa', 'i\u2081 = 3A');
    var w2x = jx + 100 * Math.cos(angRad / 2), w2y = jy - 100 * Math.sin(angRad / 2);
    M2_newArrow(w2x, w2y, jx, jy, '#60a5fa', 'i\u2082 = 4A');
    M2_newArrow(jx, jy, jx, jy + 100, '#ef4444', 'i = 7A');
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(16); textAlign(CENTER, CENTER);
    text('TOTAL: 7A (always!)', cx, jy + 130);
    var vecResult = Math.sqrt(9 + 16 + 24 * Math.cos(angRad));
    M2_drawFormulaBox(20, 20, 320, ['Scalar sum: i\u2081+i\u2082 = 7A  \u2714', 'If vector: \u221A(9+16+24cos' + angleDeg.toFixed(0) + '\u00B0) = ' + vecResult.toFixed(1) + 'A  \u2718'], '#000000', '#FFFFFF');
    M2_textBox(20, height - 80, 'Current at junction = 7A regardless of angle \u2192 SCALAR', '#fbbf24', 12);
  } else if (sub === 'vector_examples') {
    var midX = width / 2;
    stroke(80); strokeWeight(1); line(midX, 0, midX, height);
    fill(200); textSize(11); textAlign(CENTER, TOP);
    text('DISPLACEMENT (vector)', midX / 2, 8); text('CURRENT (scalar)', midX + midX / 2, 8);
    var angDeg2 = M2_getCanvasSliderVal('vAng', 0, 180, 60, height - 50, '\u03B8 (\u00B0)');
    var angR2 = angDeg2 * Math.PI / 180;
    var A2 = 60, B2 = 45;
    var lox = midX * 0.2, loy = cy + 20;
    M2_newArrow(lox, loy, lox + A2, loy, '#60a5fa', 'A=5');
    M2_newArrow(lox, loy, lox + B2 * Math.cos(angR2), loy - B2 * Math.sin(angR2), '#34d399', 'B=3');
    var Rx = A2 + B2 * Math.cos(angR2), Ry = -B2 * Math.sin(angR2);
    var Rmag = Math.sqrt(Rx * Rx + Ry * Ry);
    M2_drawParallelogram(lox, loy, A2, 0, B2 * Math.cos(angR2), -B2 * Math.sin(angR2), '#fbbf24', '#fbbf24');
    M2_newArrow(lox, loy, lox + Rx, loy + Ry, '#fbbf24', 'R=' + (Rmag / 12).toFixed(1));
    M2_textBox(10, cy + 50, 'R changes with \u03B8', '#fbbf24', 11);
    var rox = midX + 60, roy = cy;
    M2_fill('#FFFFFF', 0.8); noStroke(); ellipse(rox + 80, roy, 8, 8);
    M2_newArrow(rox, roy - 30, rox + 80, roy, '#60a5fa', '3A');
    M2_newArrow(rox + 160, roy - 30, rox + 80, roy, '#60a5fa', '4A');
    M2_newArrow(rox + 80, roy, rox + 80, roy + 70, '#ef4444', '7A');
    M2_fill('#34d399', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('\u2714 Always 7A', rox + 80, roy + 100);
  } else if (sub === 'scalar_addition') {
    if (typeof M2_sortState === 'undefined' || M2_sortState === null || M2_sortState.length === 0) {
      M2_sortState = [
        { name: 'Current', isVector: false, placed: 0 },
        { name: 'Pressure', isVector: false, placed: 0 },
        { name: 'Force', isVector: true, placed: 0 },
        { name: 'Velocity', isVector: true, placed: 0 },
        { name: 'Temperature', isVector: false, placed: 0 },
        { name: 'Torque', isVector: true, placed: 0 },
        { name: 'Surface Tension', isVector: false, placed: 0 }
      ];
    }
    M2_fill('#fbbf24', 0.9); noStroke(); textSize(15); textAlign(CENTER, TOP);
    text('SCALAR', width * 0.25, 15);
    M2_fill('#34d399', 0.9); text('VECTOR', width * 0.75, 15);
    stroke(100); strokeWeight(1); line(width / 2, 35, width / 2, height - 20);
    for (var si = 0; si < M2_sortState.length; si++) {
      var item = M2_sortState[si];
      var cardW = 130, cardH = 28, cardX, cardY;
      if (item.placed === 0) { cardX = width / 2 - cardW / 2; cardY = 50 + si * 34; }
      else if (item.placed === 1) { cardX = width * 0.25 - cardW / 2; cardY = 45 + si * 34; }
      else { cardX = width * 0.75 - cardW / 2; cardY = 45 + si * 34; }
      var isCorrect = (item.placed === 1 && !item.isVector) || (item.placed === 2 && item.isVector);
      var isWrong = (item.placed === 1 && item.isVector) || (item.placed === 2 && !item.isVector);
      var bgCol = item.placed === 0 ? '#333344' : (isCorrect ? '#1a4a2a' : (isWrong ? '#4a1a1a' : '#333344'));
      M2_fill(bgCol, 0.9); M2_stroke('#666688', 0.6); strokeWeight(1);
      rect(cardX, cardY, cardW, cardH, 4);
      fill(220); noStroke(); textSize(12); textAlign(CENTER, CENTER);
      text(item.name, cardX + cardW / 2, cardY + cardH / 2);
      if (isCorrect) { fill(100, 255, 100); text(' \u2714', cardX + cardW - 16, cardY + cardH / 2); }
      if (isWrong) { fill(255, 100, 100); text(' \u2718', cardX + cardW - 16, cardY + cardH / 2); }
      if (mouseIsPressed && mouseX > cardX && mouseX < cardX + cardW && mouseY > cardY && mouseY < cardY + cardH) {
        if (!M2_sortState._clickLock) { M2_sortState._clickLock = true; item.placed = (item.placed + 1) % 3; }
      }
    }
    if (!mouseIsPressed) M2_sortState._clickLock = false;
    M2_textBox(10, height - 30, 'Click items to cycle: Center \u2192 Scalar \u2192 Vector', '#FFFFFF', 11);
  } else if (sub === 'vector_addition_direction') {
    M2_textBox(cx - 180, 15, 'Finite rotation: order matters \u2192 NOT a vector', '#ef4444', 14);
    var panW = width / 2 - 20;
    M2_fill('#000000', 0.3); noStroke();
    rect(10, 50, panW, height - 70, 6); rect(width / 2 + 10, 50, panW, height - 70, 6);
    fill(200); textSize(12); textAlign(CENTER, TOP);
    text('90\u00B0 about X, then 90\u00B0 about Y', panW / 2 + 10, 55);
    text('90\u00B0 about Y, then 90\u00B0 about X', width / 2 + panW / 2 + 10, 55);
    var bkW = 60, bkH = 80;
    var bk1x = panW / 2 + 10 - bkW / 2, bk1y = cy - 10;
    M2_fill('#60a5fa', 0.7); noStroke(); rect(bk1x, bk1y, bkW, bkH / 2, 2);
    M2_fill('#34d399', 0.5); beginShape();
    vertex(bk1x + bkW, bk1y); vertex(bk1x + bkW + 25, bk1y - 15);
    vertex(bk1x + bkW + 25, bk1y + bkH / 2 - 15); vertex(bk1x + bkW, bk1y + bkH / 2);
    endShape(CLOSE);
    fill(255); textSize(10); textAlign(CENTER, CENTER);
    text('Front', bk1x + bkW / 2, bk1y + bkH / 4); text('P1', bk1x + bkW / 2, bk1y + bkH / 2 + 20);
    var bk2x = width / 2 + panW / 2 + 10 - bkW / 2, bk2y = cy - 10;
    M2_fill('#34d399', 0.7); noStroke(); rect(bk2x, bk2y, bkW, bkH / 2, 2);
    M2_fill('#60a5fa', 0.5); beginShape();
    vertex(bk2x + bkW, bk2y); vertex(bk2x + bkW + 25, bk2y - 15);
    vertex(bk2x + bkW + 25, bk2y + bkH / 2 - 15); vertex(bk2x + bkW, bk2y + bkH / 2);
    endShape(CLOSE);
    fill(255); textSize(10); textAlign(CENTER, CENTER);
    text('Side', bk2x + bkW / 2, bk2y + bkH / 4); text('P2', bk2x + bkW / 2, bk2y + bkH / 2 + 20);
    M2_fill('#ef4444', 1.0); noStroke(); textSize(18); textAlign(CENTER, CENTER);
    text('P1 \u2260 P2', cx, height - 40);
  } else if (sub === 'vector_properties') {
    var cx=width/2, cy=height/2;
    var props = [
      {name:'Pressure',col:'#ef4444',why:'Acts equally ALL directions'},
      {name:'Finite Rotation',col:'#ef4444',why:'Order matters — NOT a vector'},
      {name:'Area (flux)',col:'#fbbf24',why:'Context-dependent (scalar or vector)'},
      {name:'Stress',col:'#C896FF',why:'Rank-2 tensor — neither scalar nor vector'}
    ];
    for(var pi=0;pi<4;pi++){
      var pw=(width-40)/4, bx=20+pi*pw;
      M2_fill('#000000',0.4); noStroke(); rect(bx,cy-60,pw-8,110,4);
      fill(M2_rgb(props[pi].col)[0],M2_rgb(props[pi].col)[1],M2_rgb(props[pi].col)[2]);
      textSize(12); textAlign(CENTER,TOP); text(props[pi].name,bx+pw/2-4,cy-55);
      fill(180); textSize(9); textAlign(CENTER,TOP);
      text(props[pi].why,bx+pw/2-4,cy-38,pw-16);
    }
    M2_textBox(cx-140,20,'JEE TRAPS — appear directional but fail vector test','#fbbf24',12);
    M2_drawFormulaBox(20,height-70,width-40,['Two conditions: (1) direction + (2) parallelogram law','Pressure: all directions → no single direction → SCALAR'],'#000000','#FFFFFF');

  } else if (sub === 'svv_comparison_table') {
    var cx=width/2;
    var cols=['SCALAR','VECTOR'], colX=[width*0.25,width*0.75], colC=['#60a5fa','#34d399'];
    for(var ci=0;ci<2;ci++){
      M2_fill(colC[ci],0.15); noStroke(); rect(ci===0?0:cx,0,cx,height);
      fill(M2_rgb(colC[ci])[0],M2_rgb(colC[ci])[1],M2_rgb(colC[ci])[2]);
      textSize(14); textAlign(CENTER,TOP); text(cols[ci],colX[ci],10);
    }
    stroke(80); strokeWeight(1); line(cx,0,cx,height);
    var sc=['Mass','Speed','Temp','Current','Pressure','Work','Energy'];
    var vv=['Displacement','Velocity','Force','Torque','Momentum','E-field','B-field'];
    for(var si=0;si<7;si++){
      M2_fill('#000000',0.3); noStroke(); rect(20,40+si*34,cx-30,28,3);
      fill(150); textSize(11); textAlign(CENTER,CENTER); text(sc[si],width*0.25,54+si*34);
      M2_fill('#000000',0.3); noStroke(); rect(cx+10,40+si*34,cx-30,28,3);
      fill(150); textSize(11); textAlign(CENTER,CENTER); text(vv[si],width*0.75,54+si*34);
    }
    M2_textBox(cx-80,height-30,'Current & Pressure: direction ≠ vector!','#fbbf24',11);

  } else if (sub === 'svv_wrong_addition') {
    var cx=width/2, cy=height/2;
    var jx=cx, jy=cy-10;
    M2_fill('#FFFFFF',0.9); noStroke(); ellipse(jx,jy,10,10);
    M2_newArrow(jx-100,jy-30,jx,jy,'#60a5fa','i₁=3A');
    M2_newArrow(jx+100,jy-30,jx,jy,'#60a5fa','i₂=4A');
    M2_newArrow(jx,jy,jx,jy+80,'#ef4444','i=7A');
    M2_fill('#ef4444',0.9); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text('7A (scalar sum)',cx,jy+110);
    var vecResult=Math.sqrt(25+24*Math.cos(Math.PI/3));
    M2_drawFormulaBox(20,20,340,['IF current were vector: i=√(9+16+24cosθ)='+vecResult.toFixed(1)+'A','But REALITY: i=7A regardless of θ'],'#000000','#ef4444');
    M2_projWatermark('IF it were a vector...','#888888');

  } else if (sub === 'svv_direction_matters') {
    var cx=width/2, cy=height/2;
    var theta=M2_getCanvasSliderVal('svvTh',0,180,60,height-50,'θ (°)');
    var rad=theta*Math.PI/180;
    var jx=cx, jy=cy-20;
    M2_fill('#FFFFFF',0.8); noStroke(); ellipse(jx,jy,10,10);
    M2_newArrow(jx-100,jy-30,jx,jy,'#60a5fa','i₁=3A');
    M2_newArrow(jx+100,jy-30,jx,jy,'#60a5fa','i₂=4A');
    M2_newArrow(jx,jy,jx,jy+80,'#ef4444','i=7A (always)');
    var vecPrediction=Math.sqrt(9+16+24*Math.cos(rad));
    M2_fill('#888888',0.5); noStroke(); ellipse(jx+vecPrediction*8,jy+50,6,6);
    M2_textBox(20,20,'Scalar sum: 7A (flat line)','#ef4444',11);
    M2_textBox(20,38,'Vector prediction: '+vecPrediction.toFixed(1)+'A (changes with θ)','#888888',11);
    M2_drawFormulaBox(20,height-60,340,['Measurement: always 7A → scalar','Vector formula disagrees → current is SCALAR'],'#000000','#FFFFFF');

  } else if (sub === 'svv_correct_addition') {
    var cx=width/2, cy=height/2;
    var theta2=M2_getCanvasSliderVal('svvCorr',0,180,90,height-50,'θ between displacements (°)');
    var rad2=theta2*Math.PI/180, A=80, B=60, ox=cx-80, oy=cy+40;
    M2_newArrow(ox,oy,ox+A,oy,'#60a5fa','A');
    M2_newArrow(ox,oy,ox+B*Math.cos(rad2),oy-B*Math.sin(rad2),'#34d399','B');
    var Rx=A+B*Math.cos(rad2),Ry=-B*Math.sin(rad2),Rm=Math.sqrt(Rx*Rx+Ry*Ry);
    M2_newArrow(ox,oy,ox+Rx,oy+Ry,'#fbbf24','R='+Rm.toFixed(1));
    M2_textBox(20,20,'Displacement: R changes with θ → VECTOR','#34d399',12);
    M2_drawFormulaBox(20,height-60,340,['R=√(A²+B²+2ABcosθ) — CHANGES with θ','This is the parallelogram law — proves displacement is a vector'],'#000000','#34d399');

  } else if (sub === 'svv_aha_direction') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(20,cy-90,width-40,80,6);
    fill(255,235,60); textSize(18); textAlign(CENTER,CENTER);
    text('TWO CONDITIONS BOTH REQUIRED',cx,cy-65);
    M2_fill('#000000',0.4); noStroke(); rect(20,cy,width/2-30,70,4); rect(width/2+10,cy,width/2-30,70,4);
    M2_fill('#34d399',0.9); noStroke(); textSize(13); textAlign(CENTER,CENTER);
    text('(1) Has direction',width*0.25,cy+20);
    fill(200); textSize(11); text('Necessary but not sufficient',width*0.25,cy+40);
    M2_fill('#34d399',0.9); noStroke(); textSize(13); textAlign(CENTER,CENTER);
    text('(2) Obeys parallelogram law',width*0.75,cy+20);
    fill(200); textSize(11); text('THE definitive test',width*0.75,cy+40);
    M2_drawFormulaBox(20,height-55,width-40,['Current: has direction (condition 1 ✓) — but FAILS parallelogram law (condition 2 ✗)','Therefore: SCALAR'],'#000000','#fbbf24');

  } else if (sub === 'direction_means_vector_s5') {
    var cx=width/2, cy=height/2;
    M2_fill('#1a1a2e',1.0); noStroke(); ellipse(cx,cy,8,8);
    var nArrows=12;
    for(var ai=0;ai<nArrows;ai++){
      var ang2=ai/nArrows*Math.PI*2, l=70;
      M2_newArrow(cx,cy,cx+l*Math.cos(ang2),cy+l*Math.sin(ang2),'#60a5fa','');
    }
    M2_fill('#fbbf24',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('Pressure at a point — ALL directions equally',cx,cy+110);
    M2_drawFormulaBox(20,20,width-40,['Which ONE direction represents pressure?','Answer: NONE — acts in all directions equally','Therefore: no single direction → cannot be a vector'],'#000000','#FFFFFF');

  } else if (sub === 'direction_means_vector_s6') {
    var cx=width/2, cy=height/2;
    var items=[
      {name:'Electric potential',ans:'SCALAR',why:'Magnitude only — no direction',y:cy-80},
      {name:'Torque',ans:'VECTOR',why:'Direction by right-hand rule, obeys parallelogram law',y:cy-10},
      {name:'Surface tension',ans:'SCALAR',why:'No specific direction',y:cy+60}
    ];
    for(var ii=0;ii<3;ii++){
      M2_fill('#000000',0.4); noStroke(); rect(20,items[ii].y,width-40,60,4);
      fill(200); textSize(12); textAlign(LEFT,TOP); text(items[ii].name,30,items[ii].y+6);
      var ac=items[ii].ans==='SCALAR'?'#60a5fa':'#34d399';
      fill(M2_rgb(ac)[0],M2_rgb(ac)[1],M2_rgb(ac)[2]); textSize(13); textAlign(RIGHT,TOP);
      text(items[ii].ans,width-30,items[ii].y+6);
      fill(160); textSize(10); textAlign(LEFT,TOP); text(items[ii].why,30,items[ii].y+30);
    }
    M2_textBox(cx-120,20,'Classify using the two-condition test','#fbbf24',12);

  } else if (sub === 'pressure_is_vector_s1') {
    var cx=width/2, cy=height/2;
    M2_fill('#1a1a2e',1.0); noStroke(); ellipse(cx,cy,10,10);
    for(var ai2=0;ai2<8;ai2++){
      var ang3=ai2/8*Math.PI*2, l2=60;
      M2_newArrow(cx,cy,cx+l2*Math.cos(ang3),cy+l2*Math.sin(ang3),'#ef4444','');
    }
    M2_projWatermark('Acts in all dirs = vector?','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['Student belief: pressure acts in all directions','Therefore it must be a vector','Is this reasoning correct?'],'#000000','#ef4444');

  } else if (sub === 'pressure_is_vector_s2') {
    var cx=width/2, cy=height/2;
    M2_fill('#1a1a2e',1.0); noStroke(); ellipse(cx,cy,10,10);
    for(var ai3=0;ai3<12;ai3++){
      var ang4=ai3/12*Math.PI*2, l3=70;
      M2_newArrow(cx,cy,cx+l3*Math.cos(ang4),cy+l3*Math.sin(ang4),'#888888','');
    }
    M2_fill('#fbbf24',0.9); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text('Which ONE direction?',cx,cy+110);
    M2_drawFormulaBox(20,20,width-40,['Arrows in ALL directions → no preferred direction','A vector needs ONE direction — pressure has none','Conclusion: pressure is SCALAR'],'#000000','#fbbf24');

  } else if (sub === 'pressure_is_vector_s3') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(cx-190,cy-70,380,['Scalar field: one NUMBER at each point','Pressure P at depth h: P = ρgh (one value)','No direction needed — same from all sides','Compare: gravitational field g IS a vector (has direction)'],'#000000','#fbbf24');
    M2_fill('#34d399',0.8); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('Pressure: one value per point = SCALAR',''+cx,cy+70);

  } else if (sub === 'pressure_is_vector_s4') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.4); noStroke(); rect(20,cy-80,width/2-30,70,4); rect(width/2+10,cy-80,width/2-30,70,4);
    fill(200); textSize(12); textAlign(CENTER,TOP); text('Force (N)',width*0.25,cy-75); text('Pressure (Pa)',width*0.75,cy-75);
    var fx=width*0.25, fy=cy-30;
    M2_newArrow(fx,fy,fx+60,fy,'#34d399','F→');
    M2_fill('#34d399',0.8); textSize(10); textAlign(CENTER,TOP); text('Has direction → VECTOR',fx,fy+20);
    M2_fill('#1a1a2e',1.0); noStroke(); ellipse(width*0.75,cy-30,10,10);
    for(var ai4=0;ai4<6;ai4++){ var a4=ai4/6*Math.PI*2; M2_newArrow(width*0.75,cy-30,width*0.75+30*Math.cos(a4),cy-30+30*Math.sin(a4),'#888888',''); }
    M2_fill('#60a5fa',0.8); textSize(10); textAlign(CENTER,TOP); text('All directions → SCALAR',width*0.75,cy-10);
    M2_drawFormulaBox(20,height-55,width-40,['P = F/A where F is on a SPECIFIC surface','The surface chooses the direction — P itself has none'],'#000000','#FFFFFF');

  } else if (sub === 'pressure_is_vector_s5') {
    var cx=width/2, cy=height/2;
    var items2=[
      {name:'Temperature',ans:'SCALAR',y:cy-80},
      {name:'Gravitational field g',ans:'VECTOR',y:cy-10},
      {name:'Work done by force',ans:'SCALAR',y:cy+60}
    ];
    for(var ii2=0;ii2<3;ii2++){
      M2_fill('#000000',0.4); noStroke(); rect(20,items2[ii2].y,width-40,55,4);
      fill(200); textSize(12); textAlign(LEFT,CENTER); text(items2[ii2].name,30,items2[ii2].y+27);
      var ac2=items2[ii2].ans==='SCALAR'?'#60a5fa':'#34d399';
      fill(M2_rgb(ac2)[0],M2_rgb(ac2)[1],M2_rgb(ac2)[2]); textSize(13); textAlign(RIGHT,CENTER);
      text(items2[ii2].ans,width-30,items2[ii2].y+27);
    }

  } else if (sub === 'all_physical_quantities_scalar_or_vector_s1') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(cx-200,cy-100,400,['Stress has TWO directions:','  (1) Direction of applied force','  (2) Direction of surface normal','A vector has only ONE direction','Stress cannot be a vector!'],'#000000','#ef4444');
    M2_newArrow(cx-50,cy+40,cx-50+60,cy+40,'#60a5fa','Force →');
    M2_newArrow(cx+50,cy+40,cx+50,cy+40-60,'#34d399','Normal ↑');
    M2_textBox(cx-50,cy+80,'Two directions → needs rank-2 tensor','#fbbf24',11);

  } else if (sub === 'all_physical_quantities_scalar_or_vector_s2') {
    var cx=width/2, cy=height/2;
    var ranks=[
      {name:'Scalar (rank 0)',ex:'Mass, speed, charge, current',col:'#60a5fa'},
      {name:'Vector (rank 1)',ex:'Force, velocity, momentum, fields',col:'#34d399'},
      {name:'Tensor (rank 2)',ex:'Stress, strain, moment of inertia',col:'#C896FF'}
    ];
    for(var ri=0;ri<3;ri++){
      var ry=60+ri*90;
      M2_fill('#000000',0.4); noStroke(); rect(20,ry,width-40,75,4);
      fill(M2_rgb(ranks[ri].col)[0],M2_rgb(ranks[ri].col)[1],M2_rgb(ranks[ri].col)[2]);
      textSize(14); textAlign(LEFT,TOP); text(ranks[ri].name,30,ry+8);
      fill(180); textSize(11); textAlign(LEFT,TOP); text(ranks[ri].ex,30,ry+32);
    }
    M2_textBox(cx-120,20,'Three types of physical quantities','#fbbf24',13);

  } else if (sub === 'all_physical_quantities_scalar_or_vector_s3') {
    var cx=width/2, cy=height/2;
    var traps=[
      {A:'Stress is a vector',R:'It has direction',verdict:'A false, R false — it is a TENSOR',col:'#ef4444',y:50},
      {A:'Moment of inertia is a scalar',R:'It has only magnitude',verdict:'A false — it is a tensor (depends on axis)',col:'#ef4444',y:150},
      {A:'Current is a vector',R:'It has direction',verdict:'A false, R true — fails parallelogram law',col:'#ef4444',y:250}
    ];
    for(var ti2=0;ti2<3;ti2++){
      var tr=traps[ti2];
      M2_fill('#000000',0.4); noStroke(); rect(20,tr.y,width-40,80,4);
      fill(200); textSize(11); textAlign(LEFT,TOP);
      text('Assertion: '+tr.A,30,tr.y+6);
      text('Reason: '+tr.R,30,tr.y+24);
      fill(M2_rgb(tr.col)[0],M2_rgb(tr.col)[1],M2_rgb(tr.col)[2]);
      textSize(10); textAlign(LEFT,TOP); text('→ '+tr.verdict,30,tr.y+48);
    }
    M2_textBox(cx-80,20,'JEE Assertion-Reason Traps','#fbbf24',13);

  } else if (sub === 'all_physical_quantities_scalar_or_vector_s4') {
    var cx=width/2;
    M2_drawFormulaBox(40,30,width-80,['SCALAR (rank 0): mass, speed, temp, current, pressure, work','VECTOR (rank 1): displacement, velocity, force, torque, momentum, fields','TENSOR (rank 2): stress, strain, moment of inertia','','Test: (1) direction? (2) parallelogram law? Both → vector. Only (1) → check tensor.'],'#000000','#fbbf24');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_vectorBasics(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','vector_representation','unit_vector_definition','vector_magnitude_formula','vector_direction_angle','negative_vector','equal_vectors']; sub = fm[idx] || 'vector_representation'; } background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (sub === 'vector_representation') {
    var m = M2_getCanvasSliderVal('scalarM', -3, 3, 1.5, height - 50, 'Scalar m');
    var baseLen = 80, len = Math.abs(m) * baseLen, ang = -Math.PI / 4;
    var col = m >= 0 ? '#60a5fa' : '#ef4444', dir = m >= 0 ? 1 : -1;
    M2_drawDashedLine(cx, cy, cx + baseLen * Math.cos(ang), cy + baseLen * Math.sin(ang), '#FFFFFF', 4, 4);
    M2_textBox(cx + baseLen * Math.cos(ang) + 5, cy + baseLen * Math.sin(ang), 'A', '#AAAAAA', 11);
    if (Math.abs(m) > 0.05) M2_newArrow(cx, cy, cx + dir * len * Math.cos(ang), cy + dir * len * Math.sin(ang), col, 'mA');
    M2_drawFormulaBox(20, 20, 280, ['|mA| = |m| \u00D7 |A| = ' + Math.abs(m).toFixed(1) + ' \u00D7 |A|', m >= 0 ? 'm > 0: same direction' : 'm < 0: opposite direction'], '#000000', '#FFFFFF');
  } else if (sub === 'unit_vector_definition') {
    var phase = (t * 0.8) % 3, origLen = 120;
    var shrinkLen = phase < 1.5 ? origLen * (1 - M2_easeInOut(Math.min(phase / 1.5, 1)) * (1 - 40 / origLen)) : 40;
    var ang2 = -Math.PI / 6;
    M2_newArrow(cx - 100, cy, cx - 100 + shrinkLen * Math.cos(ang2), cy + shrinkLen * Math.sin(ang2), '#60a5fa', phase < 1.5 ? 'A' : '\u00C2');
    if (phase >= 1.5) M2_textBox(cx - 100, cy + 40, '|\u00C2| = 1 (always!)', '#34d399', 13);
    var axOx = cx + 80, axOy = cy + 40;
    M2_drawAxes(axOx, axOy, 80, 80, '', '', '#555566');
    M2_newArrow(axOx, axOy, axOx + 40, axOy, '#fbbf24', '\u00EE');
    M2_newArrow(axOx, axOy, axOx, axOy - 40, '#34d399', '\u0135');
    M2_drawFormulaBox(20, 20, 250, ['\u00C2 = A / |A|', '|\u00C2| = 1 always', 'Any A = |A| \u00D7 \u00C2'], '#000000', '#FFFFFF');
  } else if (sub === 'vector_magnitude_formula') {
    var cases = [{ label: 'Parallel (0\u00B0)', ang: 0, x: width * 0.25, y: height * 0.3 }, { label: 'Antiparallel (180\u00B0)', ang: Math.PI, x: width * 0.75, y: height * 0.3 }, { label: 'Perpendicular (90\u00B0)', ang: Math.PI / 2, x: width * 0.25, y: height * 0.72 }, { label: 'Arbitrary', ang: -1, x: width * 0.75, y: height * 0.72 }];
    var arbAng = M2_getCanvasSliderVal('arbAng', 0, 180, 120, height - 50, '\u03B8 for arbitrary (\u00B0)');
    for (var ci = 0; ci < cases.length; ci++) {
      var cs = cases[ci], a = cs.ang === -1 ? arbAng * Math.PI / 180 : cs.ang;
      M2_fill('#000000', 0.3); noStroke(); rect(cs.x - 85, cs.y - 50, 170, 80, 4);
      fill(180); textSize(10); textAlign(CENTER, TOP); text(cs.label, cs.x, cs.y - 48);
      M2_newArrow(cs.x - 30, cs.y, cs.x + 40, cs.y, '#60a5fa', 'A');
      M2_newArrow(cs.x - 30, cs.y, cs.x - 30 + 50 * Math.cos(a), cs.y - 50 * Math.sin(a), '#34d399', 'B');
      M2_drawAngleArc(cs.x - 30, cs.y, 18, 0, a, '#fbbf24', cs.ang === -1 ? arbAng.toFixed(0) + '\u00B0' : '');
    }
    M2_textBox(cx - 120, 10, 'ALWAYS measure from same starting point', '#fbbf24', 12);
  } else if (sub === 'vector_direction_angle') {
    var types = [{ name: 'Concurrent', desc: 'Same starting point', x: width * 0.2, y: cy - 30 }, { name: 'Coplanar', desc: 'Same plane', x: width * 0.5, y: cy - 30 }, { name: 'Equal', desc: 'Same mag + dir', x: width * 0.8, y: cy - 30 }, { name: 'Parallel', desc: 'Same dir, diff mag', x: width * 0.35, y: cy + 80 }];
    for (var ti = 0; ti < types.length; ti++) {
      var tp = types[ti];
      M2_fill('#000000', 0.35); noStroke(); rect(tp.x - 70, tp.y - 40, 140, 75, 4);
      fill(200); textSize(11); textAlign(CENTER, TOP); text(tp.name, tp.x, tp.y - 38);
      fill(150); textSize(9); text(tp.desc, tp.x, tp.y - 25);
      if (ti === 0) { M2_newArrow(tp.x - 10, tp.y + 10, tp.x + 40, tp.y - 10, '#60a5fa', ''); M2_newArrow(tp.x - 10, tp.y + 10, tp.x + 30, tp.y + 30, '#34d399', ''); }
      else if (ti === 1) { M2_fill('#60a5fa', 0.08); noStroke(); rect(tp.x - 50, tp.y, 100, 30, 2); M2_newArrow(tp.x - 40, tp.y + 15, tp.x, tp.y + 5, '#60a5fa', ''); M2_newArrow(tp.x - 20, tp.y + 25, tp.x + 40, tp.y + 10, '#34d399', ''); }
      else if (ti === 2) { M2_newArrow(tp.x - 40, tp.y + 5, tp.x, tp.y - 10, '#60a5fa', ''); M2_newArrow(tp.x, tp.y + 25, tp.x + 40, tp.y + 10, '#60a5fa', ''); }
      else { M2_newArrow(tp.x - 40, tp.y + 5, tp.x + 30, tp.y + 5, '#60a5fa', ''); M2_newArrow(tp.x - 40, tp.y + 20, tp.x, tp.y + 20, '#34d399', ''); }
    }
  } else if (sub === 'negative_vector') {
    var cx=width/2, cy=height/2;
    M2_drawAxes(cx-100,cy+60,200,180,'x','y','#555566');
    M2_newArrow(cx-80,cy+50,cx-80+100,cy+50,'#60a5fa','A');
    M2_newArrow(cx-80,cy+50,cx-80-100,cy+50,'#ef4444','-A');
    M2_drawFormulaBox(20,20,width-40,['|A| = |-A| always (magnitude never negative)','Direction of -A is OPPOSITE to A','A + (-A) = zero vector'],'#000000','#FFFFFF');
    M2_textBox(cx-80,height-30,'Negative flips direction, magnitude stays the same','#fbbf24',11);

  } else if (sub === 'equal_vectors') {
    var cx=width/2, cy=height/2;
    var positions=[[100,cy-40],[250,cy+20],[450,cy-60],[width-100,cy+30]];
    for(var ei=0;ei<4;ei++){
      M2_newArrow(positions[ei][0],positions[ei][1],positions[ei][0]+80,positions[ei][1]-30,'#60a5fa',ei===0?'A':'');
    }
    M2_textBox(cx-120,20,'All four arrows = SAME vector A (position irrelevant)','#34d399',12);
    M2_drawFormulaBox(20,height-60,width-40,['Equal vectors: same magnitude AND same direction','Position in space is IRRELEVANT (free vectors)','Any of these arrows represents the identical vector'],'#000000','#fbbf24');

  } else if (sub === 'unit_vector_magnitude_confusion_s1') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-120,cy,cx+80,cy,'#60a5fa','A = 10 units');
    M2_newArrow(cx-120,cy+50,cx+80,cy+50,'#ef4444','Â also = 10? (belief)');
    M2_projWatermark('Belief: |Â| = |A|','#ef4444');
    M2_drawFormulaBox(20,20,380,['If |Â| = 10, then 10×Â = 100 units — not A!','The formula A = |A|×Â would break.','|Â| must equal 1 — always.'],'#000000','#ef4444');

  } else if (sub === 'unit_vector_magnitude_confusion_s2') {
    var cx=width/2, cy=height/2;
    var phase=constrain(M2_animPhase*0.4,0,2);
    var origLen=160, shrinkLen=phase<1.5?origLen*(1-M2_easeInOut(Math.min(phase/1.5,1))*(1-40/origLen)):40;
    M2_newArrow(cx-80,cy,cx-80+shrinkLen,cy,'#60a5fa',phase<1.5?'A':'Â');
    M2_fill('#34d399',0.8); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text(phase<0.5?'|A|='+origLen.toFixed(0):phase<1.5?'Dividing by |A|...':'|Â| = 1 ✓',cx,cy+60);
    M2_drawFormulaBox(20,20,250,['Â = A / |A|','= A / '+origLen.toFixed(0),'Shrinks to length 1'],'#000000','#FFFFFF');

  } else if (sub === 'unit_vector_magnitude_confusion_s3') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(cx-200,cy-80,400,['Proof: |Â| = |A/|A|| = |A|/|A| = 1','','This always equals 1. Every time. No exceptions.','The division NORMALIZES the vector — removes magnitude, keeps direction.'],'#000000','#34d399');
    M2_fill('#34d399',1.0); noStroke(); textSize(32); textAlign(CENTER,CENTER); text('|Â| = 1  ✓',cx,cy+60);

  } else if (sub === 'unit_vector_magnitude_confusion_s4') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.4); noStroke(); rect(20,cy-70,width-40,130,6);
    M2_drawFormulaBox(30,cy-65,width-60,['If A is a force (Newtons):  Â has NO units','If A is a velocity (m/s):    Â has NO units','Proof: Â = A/|A|  →  [N]/[N] = dimensionless','','î, ĵ, k̂ are dimensionless — pure direction markers'],'#000000','#fbbf24');

  } else if (sub === 'unit_vector_magnitude_confusion_s5') {
    var cx=width/2, cy=height/2;
    var ox=cx-80, oy=cy+40, sc2=20;
    M2_drawAxes(ox,oy,200,180,'x','y','#555566');
    M2_newArrow(ox,oy,ox+3*sc2,oy-4*sc2,'#60a5fa','A=(3,4)');
    M2_newArrow(ox,oy,ox+3*sc2*0.2,oy-4*sc2*0.2,'#fbbf24','Â');
    M2_drawFormulaBox(20,20,350,['|A|=√(9+16)=5','Â=(3î+4ĵ)/5 = 0.6î+0.8ĵ','Check: |Â|=√(0.36+0.64)=1 ✓'],'#000000','#34d399');

  } else if (sub === 'angle_measurement_wrong_method_s1') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy+40,cx+40,cy+40,'#60a5fa','A');
    M2_newArrow(cx+40,cy+40,cx+100,cy-20,'#34d399','B (at tip of A)');
    M2_drawAngleArc(cx+40,cy+40,30,0,-Math.PI/4,'#fbbf24','45°?');
    M2_projWatermark('Measuring from tail-to-head diagram','#ef4444');
    M2_drawFormulaBox(20,20,380,['Student reads angle from tail-to-head diagram','This gives WRONG angle — NOT the angle between A and B','Must redraw both from SAME starting point'],'#000000','#ef4444');

  } else if (sub === 'angle_measurement_wrong_method_s2') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-60,cy,cx+80,cy,'#60a5fa','A');
    M2_newArrow(cx-60,cy,cx-60+80*Math.cos(Math.PI/4),cy-80*Math.sin(Math.PI/4),'#34d399','B');
    M2_drawAngleArc(cx-60,cy,35,0,Math.PI/4,'#fbbf24','45° ✓');
    M2_textBox(20,20,'CORRECT: both tails from same point → 45°','#34d399',12);
    M2_drawFormulaBox(20,height-60,width-40,['Step 1: Move both vectors so tails meet at one point','Step 2: Arrows point OUTWARD','Step 3: Take the SMALLER angle (≤ 180°)'],'#000000','#fbbf24');

  } else if (sub === 'angle_measurement_wrong_method_s3') {
    var cx=width/2, cy=height/2;
    var cases3=[{ang:Math.PI/4,correct:45,x:width*0.2,y:cy},{ang:5*Math.PI/6,correct:150,x:cx,y:cy},{ang:7*Math.PI/36,correct:35,x:width*0.8,y:cy}];
    for(var ci3=0;ci3<3;ci3++){
      var c3=cases3[ci3];
      M2_newArrow(c3.x,c3.y,c3.x+60,c3.y,'#60a5fa','');
      M2_newArrow(c3.x,c3.y,c3.x+50*Math.cos(c3.ang),c3.y-50*Math.sin(c3.ang),'#34d399','');
      M2_drawAngleArc(c3.x,c3.y,20,0,c3.ang,'#fbbf24','');
      fill(255,210,40); textSize(12); textAlign(CENTER,TOP); noStroke(); text(c3.correct+'°',c3.x,c3.y+30);
    }
    M2_textBox(cx-120,20,'DC Pandey Fig 5.12 — three examples','#fbbf24',12);

  } else if (sub === 'angle_measurement_wrong_method_s4') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-60,cy,cx+60,cy,'#60a5fa','A');
    M2_newArrow(cx-60,cy,cx-60-60,cy,'#888888','-A (antiparallel)');
    M2_drawAngleArc(cx-60,cy,45,-Math.PI,0,'#fbbf24','180°');
    M2_textBox(20,20,'180° is the maximum possible angle between any two vectors','#fbbf24',12);
    M2_drawFormulaBox(20,height-60,width-40,['Smaller angle rule: 210° → use 360°-210°=150°','Angle always between 0° and 180° inclusive'],'#000000','#FFFFFF');

  } else if (sub === 'angle_measurement_wrong_method_s5') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy,cx+40,cy,'#60a5fa','a');
    M2_newArrow(cx-80,cy,cx-80-60,cy,'#ef4444','-(3/2)a');
    M2_drawAngleArc(cx-80,cy,50,0,-Math.PI,'#fbbf24','180°');
    M2_drawFormulaBox(20,20,width-40,['a and -(3/2)a are antiparallel','Scalar -(3/2) flips direction → opposite direction → 180°','The magnitude (3/2) does NOT affect the angle'],'#000000','#fbbf24');

  } else if (sub === 'vb_wrong_position_dependent') {
    var cx=width/2, cy=height/2;
    M2_newArrow(60,cy-50,160,cy-80,'#60a5fa','A=5, NE');
    M2_newArrow(200,cy+30,300,cy,'#60a5fa','A=5, NE');
    M2_newArrow(380,cy-20,480,cy-50,'#60a5fa','A=5, NE');
    M2_textBox(cx-100,20,'Three arrows: same vector A (position irrelevant)','#34d399',12);
    M2_projWatermark('Belief: position changes the vector','#ef4444');
    M2_drawFormulaBox(20,height-60,width-40,['A vector is defined by magnitude + direction ONLY','Position in space is irrelevant — vectors are FREE'],'#000000','#34d399');

  } else if (sub === 'vb_position_independent') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(cx-200,cy-80,400,['FREE VECTOR: can be placed anywhere in space','Same magnitude + same direction = identical vector','Drag any of these to any position — still the same A:'],'#000000','#34d399');
    for(var fp=0;fp<3;fp++){
      var fx2=100+fp*200, fy2=cy+20;
      M2_newArrow(fx2,fy2,fx2+80,fy2-30,'#60a5fa',fp===0?'A':'');
    }

  } else if (sub === 'vb_aha_only_mag_dir') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(cx-200,cy-60,400,120,8);
    M2_fill('#fbbf24',1.0); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text('Vector = Magnitude + Direction',cx,cy-20);
    M2_fill('#FFFFFF',0.8); textSize(13); text('Nothing else. Position is irrelevant.',cx,cy+20);
    M2_textBox(20,height-30,'Two vectors at completely different positions can be identical','#34d399',12);

  } else if (sub === 'equal_vs_parallel_confusion_s4') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.4); noStroke(); rect(20,cy-90,width-40,180,6);
    M2_drawFormulaBox(30,cy-85,width-60,['JEE Assertion-Reason:','','Assertion: Two equal vectors are always parallel. → TRUE','Reason: Two parallel vectors are always equal. → FALSE','','Equal = same direction AND same magnitude','Parallel = same direction ONLY (magnitudes may differ)','','Answer: A is correct, R is incorrect'],'#000000','#fbbf24');

  } else if (sub === 'negative_vector_magnitude_confusion_s1') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy,cx+40,cy,'#60a5fa','A = 5 units →');
    M2_newArrow(cx-80,cy+50,cx-80-70,cy+50,'#ef4444','alleged: magnitude = -5?');
    M2_projWatermark('Belief: |-A| = -5','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['What does a -5 unit arrow even mean physically?','Length of an arrow cannot be negative!','|-A| = |A| always — only direction changes'],'#000000','#ef4444');

  } else if (sub === 'negative_vector_magnitude_confusion_s2') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy-20,cx+80,cy-20,'#60a5fa','A = 5 East');
    M2_newArrow(cx-80,cy+30,cx+80-160,cy+30,'#ef4444','-A = 5 West (same length!)');
    M2_drawFormulaBox(20,20,width-40,['|-A| = |-1 × A| = |-1| × |A| = 1 × |A| = |A|','The minus sign FLIPS DIRECTION only','Magnitude is ALWAYS positive'],'#000000','#fbbf24');

  } else if (sub === 'negative_vector_magnitude_confusion_s3') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(cx-200,cy-70,400,['Magnitude = length of arrow = ALWAYS ≥ 0','Magnitude = 0 only for zero vector','|A| = 0 iff A = 0 (zero vector)','','Analogy: a road of -5km does not exist','A road of 5km in the opposite direction DOES exist'],'#000000','#fbbf24');
    M2_fill('#34d399',1.0); noStroke(); textSize(24); textAlign(CENTER,CENTER); text('|A| ≥ 0  always',cx,cy+80);

  } else if (sub === 'negative_vector_magnitude_confusion_s4') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,40,width-80,['(1) |-3A| = |-3| × |A| = 3|A|','(2) If A = 4î-3ĵ: |A|=5, |-A|=5 (same!)','(3) If A is unit vector: |-A|=|-1|×1=1  (still unit!)','','Magnitude is always positive — the sign is in the DIRECTION'],'#000000','#34d399');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_vectorAddition(cfg, stateData, t) {
  var pl = stateData.physics_layer || {};

  // EPIC-L animated parallelogram construction (vector_addition.json STATE_2):
  // 5-stage Euclid-style proof — A draws, B from origin, dashed copies complete
  // the shape, diagonal flashes in. Holds completed at T=2.5s. Gated on
  // physics_layer.animate_construction === true; bypasses sub-scenario routing.
  if (pl.animate_construction === true && pl.construction_sequence) {
    background(15, 15, 26);
    var cxA = width / 2, cyA = height / 2;
    var UTP = Math.min(width, height) / 20;
    var ox = cxA - 80, oy = cyA + 60;

    var vA = pl.vector_A || {};
    var vB = pl.vector_B || {};
    var magA = (vA.magnitude || 4) * UTP;
    var magB = (vB.magnitude || 3) * UTP;
    var radA = (vA.direction_deg || 30) * Math.PI / 180;
    var radB = (vB.direction_deg || 90) * Math.PI / 180;
    var colA = vA.color || '#4FC3F7';
    var colB = vB.color || '#FF8A65';
    var colR = (pl.resultant && pl.resultant.color) || '#66BB6A';
    var labelR = (pl.resultant && pl.resultant.label) || 'R = diagonal';
    var labelsOn = pl.show_labels !== false;

    // p5 y-axis inverted: negate sin so positive direction_deg renders upward
    var Ax = magA * Math.cos(radA), Ay = -magA * Math.sin(radA);
    var Bx = magB * Math.cos(radB), By = -magB * Math.sin(radB);

    // Hold completed state after T = 2.5s by clamping locally — M2_simT untouched
    var T = Math.min(t, 2.5);

    // STAGE 1 — draw_vector_A (T 0.0 → 0.5, ~frames 0–30)
    var p1 = Math.min(T / 0.5, 1);
    if (p1 > 0) {
      M2_newArrow(ox, oy, ox + Ax * p1, oy + Ay * p1, colA, p1 >= 1 && labelsOn ? 'A' : '');
    }

    // STAGE 2 — draw_vector_B_from_origin (T 0.5 → 1.0, ~frames 30–60)
    if (T > 0.5) {
      var p2 = Math.min((T - 0.5) / 0.5, 1);
      M2_newArrow(ox, oy, ox + Bx * p2, oy + By * p2, colB, p2 >= 1 && labelsOn ? 'B' : '');
    }

    // STAGE 3 — draw_dashed_A_from_B_head (T 1.0 → 1.5, ~frames 60–90)
    if (T > 1.0) {
      var p3 = Math.min((T - 1.0) / 0.5, 1);
      var c3 = M2_rgb(colA);
      stroke(c3[0], c3[1], c3[2], 128); strokeWeight(1.5);
      drawingContext.setLineDash([6, 4]);
      line(ox + Bx, oy + By, ox + Bx + Ax * p3, oy + By + Ay * p3);
      drawingContext.setLineDash([]);
    }

    // STAGE 4 — draw_dashed_B_from_A_head (T 1.5 → 2.0, ~frames 90–120) — completes the parallelogram outline
    if (T > 1.5) {
      var p4 = Math.min((T - 1.5) / 0.5, 1);
      var c4 = M2_rgb(colB);
      stroke(c4[0], c4[1], c4[2], 128); strokeWeight(1.5);
      drawingContext.setLineDash([6, 4]);
      line(ox + Ax, oy + Ay, ox + Ax + Bx * p4, oy + Ay + By * p4);
      drawingContext.setLineDash([]);
    }

    // STAGE 5 — flash_diagonal_resultant (T 2.0 → 2.5, ~frames 120–150)
    if (T > 2.0) {
      if (pl.shade_parallelogram !== false) {
        noStroke();
        fill(102, 187, 106, 38); // rgba(102,187,106,0.15) → alpha 0.15 × 255 ≈ 38
        beginShape();
        vertex(ox, oy);
        vertex(ox + Ax, oy + Ay);
        vertex(ox + Ax + Bx, oy + Ay + By);
        vertex(ox + Bx, oy + By);
        endShape(CLOSE);
      }
      var p5 = Math.min((T - 2.0) / 0.5, 1);
      var diagX = ox + (Ax + Bx) * p5;
      var diagY = oy + (Ay + By) * p5;
      var flashing = (T - 2.0) < 0.25; // strokeWeight 4 for first 15 frames then settle to 2
      var c5 = M2_rgb(colR);
      stroke(c5[0], c5[1], c5[2], 255);
      strokeWeight(flashing ? 4 : 2);
      line(ox, oy, diagX, diagY);
      if (p5 >= 1) {
        M2_newArrow(ox, oy, ox + Ax + Bx, oy + Ay + By, colR, '');
        if (labelsOn) {
          var midX = ox + (Ax + Bx) / 2;
          var midY = oy + (Ay + By) / 2;
          textSize(11);
          var lw = textWidth(labelR);
          M2_fill('#000000', 0.7); noStroke();
          rect(midX - lw / 2 - 5, midY - 22, lw + 10, 16, 3);
          M2_fill(colR, 1.0); noStroke(); textAlign(CENTER, CENTER);
          text(labelR, midX, midY - 14);
        }
      }
    }

    if (labelsOn) {
      M2_fill('#FFFFFF', 0.7); noStroke();
      textSize(11); textAlign(RIGHT, BASELINE);
      text('O', ox - 6, oy + 14);
    }
    return;
  }

  var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','two_vectors_given','parallelogram_law','triangle_law','resultant_formula','special_cases_0_90_180','r_vs_theta_curve']; sub = fm[idx] || 'two_vectors_given'; } background(15, 15, 26); var cx = width / 2, cy = height / 2; var UNIT_TO_PX = Math.min(width, height) / 20; var A = 5 * UNIT_TO_PX, B = 3 * UNIT_TO_PX;
  if (sub === 'two_vectors_given') {
    var theta = M2_getCanvasSliderVal('theta', 0, 180, 60, height - 50, '\u03B8 (\u00B0)');
    var rad = theta * Math.PI / 180; var ox = cx - 80, oy = cy + 40;
    M2_newArrow(ox, oy, ox + A, oy, '#60a5fa', 'A=5');
    M2_newArrow(ox, oy, ox + B * Math.cos(rad), oy - B * Math.sin(rad), '#34d399', 'B=3');
    if (pl.show_parallelogram !== false) {
      M2_drawParallelogram(ox, oy, A, 0, B * Math.cos(rad), -B * Math.sin(rad), '#fbbf24', '#fbbf24');
    }
    var Rx = A + B * Math.cos(rad), Ry = -B * Math.sin(rad); var Rmag = Math.sqrt(Rx * Rx + Ry * Ry);
    if (pl.show_resultant !== false) {
      M2_newArrow(ox, oy, ox + Rx, oy + Ry, '#fbbf24', 'R=' + (Rmag * 5 / A).toFixed(1));
    }
    M2_drawAngleArc(ox, oy, 25, 0, rad, '#FFD54F', theta.toFixed(0) + '\u00B0');
    var barX = width - 60, barY = 40, barH = height - 120;
    M2_fill('#000000', 0.4); noStroke(); rect(barX - 15, barY, 30, barH, 4);
    var maxR = (5 + 3) * A / 5; var barFill = constrain(Rmag / maxR, 0, 1) * barH;
    M2_fill('#fbbf24', 0.8); rect(barX - 10, barY + barH - barFill, 20, barFill, 3);
    fill(200); textSize(9); textAlign(CENTER, BOTTOM); noStroke(); text('|R|', barX, barY - 2);
    M2_drawFormulaBox(20, 20, 340, ['R = \u221A(A\u00B2+B\u00B2+2ABcos\u03B8)', 'R = \u221A(25+9+30cos' + theta.toFixed(0) + '\u00B0) = ' + (Rmag * 5 / A).toFixed(2)], '#000000', '#fbbf24');
  } else if (sub === 'triangle_law') {
    var phase = constrain(t * 0.5, 0, 2); var ox2 = 100, oy2 = cy + 60; var angB = -Math.PI / 4;
    M2_newArrow(ox2, oy2, ox2 + A, oy2, '#60a5fa', 'A');
    if (phase > 0.5) { var bFrac = constrain((phase - 0.5) / 0.8, 0, 1); M2_newArrow(ox2 + A, oy2, ox2 + A + B * Math.cos(angB) * bFrac, oy2 + B * Math.sin(angB) * bFrac, '#34d399', 'B'); }
    if (phase > 1.3) { var fullRx = A + B * Math.cos(angB), fullRy = B * Math.sin(angB); var rFrac = constrain((phase - 1.3) / 0.7, 0, 1); M2_newArrow(ox2, oy2, ox2 + fullRx * rFrac, oy2 + fullRy * rFrac, '#fbbf24', 'R=A+B'); }
    M2_textBox(20, 20, 'Triangle Law: place B at tip of A', '#fbbf24', 14);
  } else if (sub === 'parallelogram_law') {
    var ox3 = cx - 100, oy3 = cy + 40; var angB3 = Math.PI / 4;
    var Ax3 = A, Ay3 = 0;
    var Bx3 = B * Math.cos(angB3), By3 = -B * Math.sin(angB3);
    var T3 = Math.min(t, 2.5);

    // STAGE 1 — draw vector A (T 0.0 → 0.5)
    var p3_1 = Math.min(T3 / 0.5, 1);
    if (p3_1 > 0) {
      M2_newArrow(ox3, oy3, ox3 + Ax3 * p3_1, oy3, '#60a5fa', p3_1 >= 1 ? 'A' : '');
    }

    // STAGE 2 — draw vector B from origin (T 0.5 → 1.0)
    if (T3 > 0.5) {
      var p3_2 = Math.min((T3 - 0.5) / 0.5, 1);
      M2_newArrow(ox3, oy3, ox3 + Bx3 * p3_2, oy3 + By3 * p3_2, '#34d399', p3_2 >= 1 ? 'B' : '');
    }

    // STAGE 3 — dashed A copy from B's head (T 1.0 → 1.5)
    if (T3 > 1.0) {
      var p3_3 = Math.min((T3 - 1.0) / 0.5, 1);
      var c3_3 = M2_rgb('#60a5fa');
      stroke(c3_3[0], c3_3[1], c3_3[2], 128); strokeWeight(1.5);
      drawingContext.setLineDash([6, 4]);
      line(ox3 + Bx3, oy3 + By3, ox3 + Bx3 + Ax3 * p3_3, oy3 + By3);
      drawingContext.setLineDash([]);
    }

    // STAGE 4 — dashed B copy from A's head (T 1.5 → 2.0)
    if (T3 > 1.5) {
      var p3_4 = Math.min((T3 - 1.5) / 0.5, 1);
      var c3_4 = M2_rgb('#34d399');
      stroke(c3_4[0], c3_4[1], c3_4[2], 128); strokeWeight(1.5);
      drawingContext.setLineDash([6, 4]);
      line(ox3 + Ax3, oy3, ox3 + Ax3 + Bx3 * p3_4, oy3 + By3 * p3_4);
      drawingContext.setLineDash([]);
    }

    // STAGE 5 — resultant diagonal flashes in (T 2.0 → 2.5)
    if (T3 > 2.0) {
      M2_drawParallelogram(ox3, oy3, Ax3, 0, Bx3, By3, '#fbbf24', '#fbbf24');
      var p3_5 = Math.min((T3 - 2.0) / 0.5, 1);
      var diagX3 = ox3 + (Ax3 + Bx3) * p3_5;
      var diagY3 = oy3 + By3 * p3_5;
      var flashing3 = (T3 - 2.0) < 0.25;
      stroke(251, 191, 36, 255); strokeWeight(flashing3 ? 4 : 2);
      line(ox3, oy3, diagX3, diagY3);
      if (p3_5 >= 1) {
        M2_newArrow(ox3, oy3, ox3 + Ax3 + Bx3, oy3 + By3, '#fbbf24', 'R (diagonal)');
      }
    }

    M2_textBox(20, 20, 'Parallelogram Law: both from same origin', '#fbbf24', 14);
  } else if (sub === 'special_cases_0_90_180') {
    var cases4 = [{ th: 0, label: '\u03B8=0\u00B0: R=A+B=8 (max)', col: '#34d399' }, { th: 90, label: '\u03B8=90\u00B0: R=\u221A(A\u00B2+B\u00B2)', col: '#60a5fa' }, { th: 120, label: '\u03B8=120\u00B0,A=B: R=A', col: '#fbbf24' }, { th: 180, label: '\u03B8=180\u00B0: R=|A-B| (min)', col: '#ef4444' }];
    for (var ci4 = 0; ci4 < 4; ci4++) {
      var cs4 = cases4[ci4]; var bx4 = 40 + (ci4 % 2) * (width / 2); var by4 = ci4 < 2 ? 80 : cy + 50;
      var r4 = cs4.th * Math.PI / 180; var a4 = 60, b4 = ci4 === 2 ? 60 : 36;
      M2_newArrow(bx4, by4 + 40, bx4 + a4, by4 + 40, '#60a5fa', '');
      if (cs4.th === 0) M2_newArrow(bx4 + a4, by4 + 40, bx4 + a4 + b4, by4 + 40, '#34d399', '');
      else if (cs4.th === 180) M2_newArrow(bx4, by4 + 40, bx4 - b4, by4 + 40, '#34d399', '');
      else M2_newArrow(bx4, by4 + 40, bx4 + b4 * Math.cos(r4), by4 + 40 - b4 * Math.sin(r4), '#34d399', '');
      var rx4 = a4 + b4 * Math.cos(r4), ry4 = -b4 * Math.sin(r4);
      M2_newArrow(bx4, by4 + 40, bx4 + rx4, by4 + 40 + ry4, cs4.col, '');
      M2_textBox(bx4 - 10, by4 - 5, cs4.label, cs4.col, 11);
    }
  } else if (sub === 'resultant_formula') {
    var theta5 = M2_getCanvasSliderVal('th5', 0, 180, 60, height - 70, '\u03B8 (\u00B0)');
    var A5 = M2_getCanvasSliderVal('A5', 1, 10, 5, height - 40, 'A');
    var B5 = 3, rad5 = theta5 * Math.PI / 180, ox5 = cx - 60, oy5 = cy + 40, sc5 = UNIT_TO_PX * 0.75;
    M2_newArrow(ox5, oy5, ox5 + A5 * sc5, oy5, '#60a5fa', 'A=' + A5.toFixed(0));
    M2_newArrow(ox5, oy5, ox5 + B5 * sc5 * Math.cos(rad5), oy5 - B5 * sc5 * Math.sin(rad5), '#34d399', 'B=' + B5);
    var Rx5 = A5 * sc5 + B5 * sc5 * Math.cos(rad5), Ry5 = -B5 * sc5 * Math.sin(rad5);
    M2_newArrow(ox5, oy5, ox5 + Rx5, oy5 + Ry5, '#fbbf24', 'R');
    var beta5 = Math.atan2(B5 * Math.sin(rad5), A5 + B5 * Math.cos(rad5));
    M2_drawAngleArc(ox5, oy5, 35, 0, beta5, '#C896FF', '\u03B2=' + (beta5 * 180 / Math.PI).toFixed(1) + '\u00B0');
    M2_drawFormulaBox(20, 20, 360, ['\u03B2 = tan\u207B\u00B9(Bsin\u03B8/(A+Bcos\u03B8))', '\u03B2 = ' + (beta5 * 180 / Math.PI).toFixed(1) + '\u00B0'], '#000000', '#C896FF');
  } else if (sub === 'r_vs_theta_curve') {
    var A6 = M2_getCanvasSliderVal('A6', 1, 10, 5, height - 90, 'A');
    var B6 = M2_getCanvasSliderVal('B6', 1, 10, 3, height - 60, 'B');
    var th6 = M2_getCanvasSliderVal('th6', 0, 180, 60, height - 30, '\u03B8 (\u00B0)');
    var rad6 = th6 * Math.PI / 180, sc6 = UNIT_TO_PX * 0.6, ox6 = cx - 80, oy6 = cy + 20;
    M2_newArrow(ox6, oy6, ox6 + A6 * sc6, oy6, '#60a5fa', 'A=' + A6.toFixed(1));
    M2_newArrow(ox6, oy6, ox6 + B6 * sc6 * Math.cos(rad6), oy6 - B6 * sc6 * Math.sin(rad6), '#34d399', 'B=' + B6.toFixed(1));
    M2_drawParallelogram(ox6, oy6, A6 * sc6, 0, B6 * sc6 * Math.cos(rad6), -B6 * sc6 * Math.sin(rad6), '#fbbf24', '#fbbf24');
    var Rx6 = A6 + B6 * Math.cos(rad6), Ry6 = B6 * Math.sin(rad6);
    var Rmag6 = Math.sqrt(Rx6 * Rx6 + Ry6 * Ry6);
    var beta6 = Math.atan2(B6 * Math.sin(rad6), A6 + B6 * Math.cos(rad6)) * 180 / Math.PI;
    M2_newArrow(ox6, oy6, ox6 + Rx6 * sc6, oy6 - Ry6 * sc6, '#fbbf24', 'R=' + Rmag6.toFixed(2));
    M2_drawFormulaBox(20, height - 130, 200, ['R = ' + Rmag6.toFixed(2), '\u03B2 = ' + beta6.toFixed(1) + '\u00B0'], '#000000', '#fbbf24');
  // --- EPIC-C: resultant_always_larger branch ---
  } else if (sub === 'va_wrong_always_larger') {
    if (pl.pattern === 'naive_scalar_addition') {
      // STATE_1 (scalar-add belief): A and B head-to-tail at θ=0°,
      // labeled "R = A+B ✓" as if correct. Red tint background. No angle arc, no formula.
      // Magnitudes are read from physics_layer.vector_a/vector_b (spread flat by the injector).
      var aLen = (pl.vector_a && pl.vector_a.magnitude) ? pl.vector_a.magnitude : 4;
      var bLen = (pl.vector_b && pl.vector_b.magnitude) ? pl.vector_b.magnitude : 3;
      var rSum = aLen + bLen;

      push();
      noStroke();
      fill(180, 0, 0, 26);
      rect(0, 0, width, height);
      pop();

      var oxS = cx - ((aLen + bLen) / 2) * UNIT_TO_PX, oyS = cy + 30, scS = UNIT_TO_PX;
      var aTipX = oxS + aLen * scS, aTipY = oyS;
      var bTipX = aTipX + bLen * scS, bTipY = oyS;

      M2_newArrow(oxS, oyS, aTipX, aTipY, '#60a5fa', 'A=' + aLen);
      M2_newArrow(aTipX, aTipY, bTipX, bTipY, '#34d399', 'B=' + bLen);
      M2_newArrow(oxS, oyS, bTipX, oyS, '#fbbf24', '');

      push();
      noStroke();
      fill('#fbbf24');
      textSize(22);
      textAlign(CENTER, BOTTOM);
      text('R = ' + rSum + ' \u2713', (oxS + bTipX) / 2, oyS - 20);
      pop();
    } else {
      // STATE_1 WRONG BELIEF: R always bigger? No — at 150°, R=2.2 < A=5
      var ox = cx - 80, oy = cy + 40, sc = UNIT_TO_PX;
      var rad = 150 * Math.PI / 180;
      M2_newArrow(ox, oy, ox + 5 * sc, oy, '#60a5fa', 'A=5');
      M2_newArrow(ox, oy, ox + 3 * sc * Math.cos(rad), oy - 3 * sc * Math.sin(rad), '#34d399', 'B=3');
      var Rx = 5 + 3 * Math.cos(rad), Ry = 3 * Math.sin(rad);
      var Rmag = Math.sqrt(Rx * Rx + Ry * Ry);
      M2_newArrow(ox, oy, ox + Rx * sc, oy - Ry * sc, '#ef4444', 'R=' + Rmag.toFixed(1));
      M2_drawAngleArc(ox, oy, 30, 0, Math.PI - rad, '#FFD54F', '150\u00B0');
      M2_projWatermark('Your belief: R > both always', '#ef4444');
      M2_drawFormulaBox(20, height - 70, 300, ['R = ' + Rmag.toFixed(1) + '  but  A = 5!', 'R < A when angle is large'], '#000000', '#ef4444');
    }
  } else if (sub === 'va_angle_determines') {
    // STATE_2: angle slider shows R shrinking
    var aLen = (pl.vector_a && typeof pl.vector_a.magnitude === 'number')
      ? pl.vector_a.magnitude : 5;
    var bLen = (pl.vector_b && typeof pl.vector_b.magnitude === 'number')
      ? pl.vector_b.magnitude : 3;
    var theta = M2_getCanvasSliderVal('vaAD', 0, 180, 90, height - 50, '\u03B8 (\u00B0)');
    var rad = theta * Math.PI / 180, sc = UNIT_TO_PX, ox = cx - (aLen / 2) * sc, oy = cy + 40;
    M2_newArrow(ox, oy, ox + aLen * sc, oy, '#60a5fa', 'A=' + aLen);
    M2_newArrow(ox, oy, ox + bLen * sc * Math.cos(rad), oy - bLen * sc * Math.sin(rad), '#34d399', 'B=' + bLen);
    var Rmag2 = Math.sqrt(aLen * aLen + bLen * bLen + 2 * aLen * bLen * Math.cos(rad));
    var Rx2 = aLen + bLen * Math.cos(rad), Ry2 = bLen * Math.sin(rad);
    M2_newArrow(ox, oy, ox + Rx2 * sc, oy - Ry2 * sc, Rmag2 < aLen ? '#ef4444' : '#fbbf24', 'R=' + Rmag2.toFixed(1));
    var barX = width - 30, barH = 120;
    M2_fill('#000000', 0.35); noStroke(); rect(barX - 6, 60, 12, barH, 3);
    var barFill = constrain(Rmag2 / (aLen + bLen), 0, 1) * barH;
    M2_fill(Rmag2 < aLen ? '#ef4444' : '#34d399', 0.75); rect(barX - 4, 60 + barH - barFill, 8, barFill, 2);
    M2_textBox(barX - 10, 40, '|R|', '#fbbf24', 9);
    M2_drawFormulaBox(20, 20, 300, ['R shrinks as \u03B8 increases', 'R=' + Rmag2.toFixed(1) + (Rmag2 < aLen ? ' < A=' + aLen + '!' : '')], '#000000', '#fbbf24');
  } else if (sub === 'va_minimum_resultant') {
    // STATE_3: three cases side by side, green box on 180°
    var aLenM = (pl.vector_a && typeof pl.vector_a.magnitude === 'number')
      ? pl.vector_a.magnitude : 5;
    var bLenM = (pl.vector_b && typeof pl.vector_b.magnitude === 'number')
      ? pl.vector_b.magnitude : 3;
    var rMax = aLenM + bLenM;
    var r90 = Math.sqrt(aLenM * aLenM + bLenM * bLenM);
    var rMin = Math.abs(aLenM - bLenM);
    var cases3 = [
      {th: 0,   lbl: '0\u00B0: R=' + rMax.toFixed(0) + ' (max)',  col: '#34d399'},
      {th: 90,  lbl: '90\u00B0: R=' + r90.toFixed(1),              col: '#60a5fa'},
      {th: 180, lbl: '180\u00B0: R=' + rMin.toFixed(0) + ' (min)', col: '#ef4444'},
    ];
    var pw = (width - 40) / 3;
    var pxPerUnit = 10;
    for (var ci3 = 0; ci3 < 3; ci3++) {
      var bx3 = 20 + ci3 * pw + pw / 2 - 30, by3 = cy;
      var a3 = aLenM * pxPerUnit, b3 = bLenM * pxPerUnit;
      var r3 = cases3[ci3].th * Math.PI / 180;
      M2_newArrow(bx3, by3, bx3 + a3, by3, '#60a5fa', '');
      if (cases3[ci3].th === 0) M2_newArrow(bx3 + a3, by3, bx3 + a3 + b3, by3, '#34d399', '');
      else if (cases3[ci3].th === 180) M2_newArrow(bx3 + a3, by3, bx3 + a3 - b3, by3, '#34d399', '');
      else M2_newArrow(bx3, by3, bx3 + b3 * Math.cos(r3), by3 - b3 * Math.sin(r3), '#34d399', '');
      M2_textBox(bx3 - 15, by3 + 35, cases3[ci3].lbl, cases3[ci3].col, 10);
    }
    M2_stroke('#34d399', 0.5); strokeWeight(2); noFill(); rect(20 + 2 * pw, 40, pw - 20, height - 80, 6);
    M2_textBox(cx - 80, 20, '|A\u2212B| \u2264 R \u2264 |A+B|', '#fbbf24', 14);
  } else if (sub === 'va_aha_direction_controls') {
    // STATE_4: R dot slides on number line between min and max
    var aLenD = (pl.vector_a && typeof pl.vector_a.magnitude === 'number')
      ? pl.vector_a.magnitude : 5;
    var bLenD = (pl.vector_b && typeof pl.vector_b.magnitude === 'number')
      ? pl.vector_b.magnitude : 3;
    var rMaxD = aLenD + bLenD;
    var rMinD = Math.abs(aLenD - bLenD);
    var theta4 = M2_getCanvasSliderVal('vaSlide', 0, 180, 90, height - 50, '\u03B8 (\u00B0)');
    var Rmag4 = Math.sqrt(aLenD * aLenD + bLenD * bLenD + 2 * aLenD * bLenD * Math.cos(theta4 * Math.PI / 180));
    var nlY = cy; var nl = M2_drawNumberLine(nlY, 0, rMaxD, '#AAAAAA', Math.max(2, Math.floor(rMaxD)));
    var dotX = nl.x1 + (Rmag4 / rMaxD) * (nl.x2 - nl.x1);
    M2_drawParticle(dotX, nlY, 10, '#fbbf24', 'R');
    var minX = nl.x1 + (rMinD / rMaxD) * (nl.x2 - nl.x1), maxX = nl.x2;
    M2_stroke('#ef4444', 0.8); strokeWeight(2); line(minX, nlY - 15, minX, nlY + 15);
    M2_stroke('#34d399', 0.8); line(maxX, nlY - 15, maxX, nlY + 15);
    M2_textBox(minX - 15, nlY + 20, '|A\u2212B|=' + rMinD, '#ef4444', 9);
    M2_textBox(maxX - 15, nlY + 20, 'A+B=' + rMaxD, '#34d399', 9);
    M2_drawFormulaBox(20, 20, 360, ['R = \u221A(A\u00B2+B\u00B2+2ABcos\u03B8)', 'A=' + aLenD + ', B=' + bLenD + ', \u03B8=' + theta4.toFixed(0) + '\u00B0 \u2192 R=' + Rmag4.toFixed(1), '|A\u2212B| \u2264 R \u2264 |A+B|'], '#000000', '#fbbf24');
  } else if (sub === 'resultant_always_larger_s5') {
    // STATE_5: aha — frozen
    M2_drawFormulaBox(cx - 180, cy - 60, 360, ['R can be LESS than either vector!', '', 'A=5, B=3, \u03B8=150\u00B0 \u2192 R=2.2', 'R < A  \u2713', '', '|A\u2212B| \u2264 R \u2264 |A+B|'], '#000000', '#34d399');
    M2_fill('#34d399', 1.0); noStroke(); textSize(28); textAlign(CENTER, CENTER); text('\u2713', cx + 140, cy - 30);
  // --- EPIC-C: scalar_addition branch ---
  } else if (sub === 'va_ab_order') {
    // STATE_1 WRONG BELIEF: vectors add like numbers, ignoring direction
    var ox = cx - 80, oy = cy + 20;
    M2_newArrow(ox, oy, ox + 5 * UNIT_TO_PX, oy, '#60a5fa', 'A=5');
    M2_newArrow(ox + 5 * UNIT_TO_PX + 10, oy, ox + 5 * UNIT_TO_PX + 10 + 3 * UNIT_TO_PX, oy, '#34d399', 'B=3');
    M2_fill('#ef4444', 0.9); noStroke(); textSize(20); textAlign(CENTER, CENTER);
    text('5 + 3 = 8', cx, oy - 50);
    M2_textBox(cx - 60, oy + 40, '(directions ignored!)', '#888888', 11);
    M2_projWatermark('Belief: vectors add like numbers', '#ef4444');
  } else if (sub === 'va_ba_order') {
    // STATE_2: scalar says 8 vs vector says 2 (opposing directions)
    M2_fill('#000000', 0.3); noStroke(); rect(15, 50, width / 2 - 25, height - 100, 4);
    M2_fill('#000000', 0.3); rect(width / 2 + 10, 50, width / 2 - 25, height - 100, 4);
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke();
    text('Scalar says', width / 4, 55); text('Vector says', width * 3 / 4, 55);
    M2_newArrow(40, cy, 120, cy, '#60a5fa', '5'); M2_newArrow(120, cy, 168, cy, '#34d399', '3');
    M2_textBox(50, cy + 25, '5+3 = 8', '#ef4444', 13);
    var ox2 = width / 2 + 40;
    M2_newArrow(ox2, cy, ox2 + 80, cy, '#60a5fa', '5\u2192');
    M2_newArrow(ox2 + 80, cy, ox2 + 32, cy, '#34d399', '3\u2190');
    M2_textBox(ox2 + 10, cy + 25, 'R = 5\u22123 = 2', '#34d399', 13);
    M2_fill('#ef4444', 0.8); textSize(18); text('\u2717', width / 4, cy + 60);
    M2_fill('#34d399', 0.8); text('\u2713', width * 3 / 4, cy + 60);
  } else if (sub === 'va_aha_commutative') {
    // STATE_3: triangle law head-to-tail animation
    var phase = constrain(t * 0.4, 0, 3);
    var ox = cx - 100, oy = cy + 50, aLen = 5 * UNIT_TO_PX, bLen = 3 * UNIT_TO_PX, angB = -Math.PI / 4;
    M2_newArrow(ox, oy, ox + aLen, oy, '#60a5fa', 'A=5 \u2192');
    if (phase > 0.5) { var f = constrain((phase - 0.5) / 0.8, 0, 1); M2_newArrow(ox + aLen, oy, ox + aLen + bLen * Math.cos(angB) * f, oy + bLen * Math.sin(angB) * f, '#34d399', 'B=3'); }
    if (phase > 1.5) { var Rx = aLen + bLen * Math.cos(angB), Ry = bLen * Math.sin(angB); M2_newArrow(ox, oy, ox + Rx, oy + Ry, '#fbbf24', 'R (head-to-tail)'); }
    M2_textBox(20, 20, 'Head-to-tail: direction matters!', '#fbbf24', 13);
  } else if (sub === 'scalar_addition_s4') {
    // STATE_4: 3m East + 4m North: scalar=7m WRONG, vector=5m CORRECT
    var ox = cx - 60, oy = cy + 60, sc = UNIT_TO_PX;
    M2_drawAxes(ox, oy, 180, 160, 'E', 'N', '#555566');
    M2_newArrow(ox, oy, ox + 3 * sc, oy, '#60a5fa', '3m East');
    M2_newArrow(ox + 3 * sc, oy, ox + 3 * sc, oy - 4 * sc, '#34d399', '4m North');
    M2_newArrow(ox, oy, ox + 3 * sc, oy - 4 * sc, '#fbbf24', 'R=5m');
    M2_drawFormulaBox(20, 20, 320, ['Scalar: 3+4 = 7m  \u2717', 'Vector: \u221A(9+16) = 5m  \u2713', '3-4-5 right triangle!'], '#000000', '#fbbf24');
  } else if (sub === 'scalar_addition_s5') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(20,20,width-40,['CORRECT formula: R = √(A²+B²+2ABcosθ)','','This formula contains cosθ — the angle makes the difference','At θ=0°: cosθ=1 → R=A+B (your formula works HERE ONLY)','Any other θ: R < A+B'],'#000000','#34d399');
    M2_fill('#fbbf24',0.9); noStroke(); textSize(18); textAlign(CENTER,CENTER);
    text('R = A+B is a SPECIAL CASE at θ=0° only',cx,cy+60);

  } else if (sub === 'scalar_addition_s6') {
    var cx=width/2, cy=height/2;
    var A6=5, B6=5, th6=60, r6=th6*Math.PI/180;
    var R6=Math.sqrt(A6*A6+B6*B6+2*A6*B6*Math.cos(r6));
    var sc6=20, ox6=cx-80, oy6=cy+40;
    M2_newArrow(ox6,oy6,ox6+A6*sc6,oy6,'#60a5fa','A=5');
    M2_newArrow(ox6,oy6,ox6+B6*sc6*Math.cos(r6),oy6-B6*sc6*Math.sin(r6),'#34d399','B=5');
    var Rx6=A6*sc6+B6*sc6*Math.cos(r6), Ry6=-B6*sc6*Math.sin(r6);
    M2_newArrow(ox6,oy6,ox6+Rx6,oy6+Ry6,'#fbbf24','R='+R6.toFixed(2));
    M2_drawFormulaBox(20,20,350,['A=5, B=5, θ=60°','Naive: 5+5=10','Actual: √(25+25+50cos60°)=√75='+R6.toFixed(2),'Gap = '+(10-R6).toFixed(2)+' — direction cost!'],'#000000','#fbbf24');

  } else if (sub === 'scalar_addition_s7') {
    var cx=width/2, cy=height/2;
    var A7=M2_getCanvasSliderVal('saA7',1,10,3,height-70,'A');
    var B7=M2_getCanvasSliderVal('saB7',1,10,4,height-45,'B');
    var th7=M2_getCanvasSliderVal('saTh7',0,180,60,height-20,'θ(°)');
    var r7=th7*Math.PI/180, R7=Math.sqrt(A7*A7+B7*B7+2*A7*B7*Math.cos(r7));
    var sc7=18, ox7=cx-80, oy7=cy+40;
    M2_newArrow(ox7,oy7,ox7+A7*sc7,oy7,'#60a5fa','A='+A7.toFixed(0));
    M2_newArrow(ox7,oy7,ox7+B7*sc7*Math.cos(r7),oy7-B7*sc7*Math.sin(r7),'#34d399','B='+B7.toFixed(0));
    var Rx7=A7*sc7+B7*sc7*Math.cos(r7), Ry7=-B7*sc7*Math.sin(r7);
    M2_newArrow(ox7,oy7,ox7+Rx7,oy7+Ry7,'#fbbf24','R='+R7.toFixed(2));
    M2_drawFormulaBox(20,20,340,['Naive: A+B='+( A7+B7).toFixed(0),'Actual: R='+R7.toFixed(2),'Set θ=0° to confirm R=A+B'],'#000000','#fbbf24');

  } else if (sub === 'direction_irrelevant_s1') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.3); noStroke(); rect(15,50,width/2-25,height-100,4);
    M2_fill('#000000',0.3); rect(width/2+10,50,width/2-25,height-100,4);
    fill(200); textSize(11); textAlign(CENTER,TOP); noStroke();
    text('A=5, B=5, θ=0°: R=10',width/4,55); text('A=5, B=5, θ=180°: R=0',width*3/4,55);
    M2_newArrow(40,cy,40+80,cy,'#60a5fa','5→');
    M2_newArrow(40+80+10,cy,40+80+10+80,cy,'#34d399','5→');
    M2_fill('#fbbf24',0.9); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('R=10',width/4,cy+40);
    M2_newArrow(width/2+40,cy,width/2+40+80,cy,'#60a5fa','5→');
    M2_newArrow(width/2+40+80+10+80,cy,width/2+40+80+10,cy,'#34d399','←5');
    M2_fill('#ef4444',0.9); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('R=0!',width*3/4,cy+40);
    M2_projWatermark('Belief: direction irrelevant','#ef4444');

  } else if (sub === 'direction_irrelevant_s2') {
    var cx=width/2, cy=height/2;
    var cases2=[{th:0,R:10,col:'#34d399'},{th:60,R:8.66,col:'#60a5fa'},{th:90,R:7.07,col:'#fbbf24'},{th:120,R:5,col:'#FFA050'},{th:180,R:0,col:'#ef4444'}];
    var bw2=50, bh2=200, bx2=40;
    for(var ci2=0;ci2<5;ci2++){
      var bfill2=cases2[ci2].R/10*bh2;
      M2_fill('#000000',0.3); noStroke(); rect(bx2+ci2*60,cy-bh2*0.5,bw2,bh2,3);
      M2_fill(cases2[ci2].col,0.8); rect(bx2+ci2*60,cy-bh2*0.5+bh2-bfill2,bw2,bfill2,3);
      fill(200); textSize(10); textAlign(CENTER,TOP); noStroke();
      text(cases2[ci2].th+'°',bx2+ci2*60+bw2/2,cy+bh2*0.5+3);
      text('R='+cases2[ci2].R.toFixed(1),bx2+ci2*60+bw2/2,cy+bh2*0.5+16);
    }
    M2_textBox(cx-120,20,'A=5, B=5 in all cases — only θ differs','#fbbf24',12);

  } else if (sub === 'direction_irrelevant_s3') {
    var cx=width/2, cy=height/2;
    M2_fill('#34d399',0.2); noStroke(); rect(cx-80,cy-20,160,30,3);
    M2_newArrow(cx-100,cy-40,cx-100+60,cy-40,'#60a5fa','F₁=5N');
    M2_newArrow(cx-100,cy-40,cx-100+50*Math.cos(Math.PI/3),cy-40-50*Math.sin(Math.PI/3),'#34d399','F₂=5N');
    M2_textBox(cx-40,cy+25,'Object moves along R direction','#fbbf24',11);
    M2_textBox(20,height-30,'Without direction, we cannot predict where the box goes!','#fbbf24',12);

  } else if (sub === 'direction_irrelevant_s4') {
    var cx=width/2, cy=height/2;
    stroke(80); strokeWeight(1); line(cx,0,cx,height);
    M2_fill('#000000',0.4); noStroke(); rect(20,cy-50,cx-30,100,4); rect(cx+10,cy-50,cx-30,100,4);
    fill(200); textSize(12); textAlign(CENTER,CENTER); text('Scalar: 5+5=10 (always)',width/4,cy); text('Vector: 5+5 = 0 to 10 (depends on θ)',width*3/4,cy);
    M2_fill('#ef4444',0.3); noStroke(); rect(20,cy-50,cx-30,100,4);
    M2_fill('#34d399',0.3); rect(cx+10,cy-50,cx-30,100,4);
    M2_textBox(cx-120,20,'Scalars ignore direction. Vectors ARE their direction.','#fbbf24',12);

  } else if (sub === 'direction_irrelevant_s5') {
    var cx=width/2, cy=height/2;
    var th5=M2_getCanvasSliderVal('dirTh5',0,180,90,height-50,'θ(°)');
    var R5=Math.sqrt(50+50*Math.cos(th5*Math.PI/180))*Math.sqrt(2);
    var sc5=18, ox5=cx-80, oy5=cy+40, r5=th5*Math.PI/180;
    M2_newArrow(ox5,oy5,ox5+5*sc5,oy5,'#60a5fa','A=5');
    M2_newArrow(ox5,oy5,ox5+5*sc5*Math.cos(r5),oy5-5*sc5*Math.sin(r5),'#34d399','B=5');
    M2_drawFormulaBox(20,20,300,['A=5, B=5, θ='+th5.toFixed(0)+'°','R='+Math.sqrt(25+25+50*Math.cos(r5)).toFixed(2)],'#000000','#fbbf24');
    M2_textBox(20,height-30,'Count how many distinct R values you can produce','#fbbf24',11);

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_vectorComponents(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','component_decomposition','trig_component_formulas','unit_vector_form','reconstruction_from_components','negative_components_quadrants','three_d_extension']; sub = fm[idx] || 'component_decomposition'; } background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (sub === 'component_decomposition') {
    var ang = Math.PI / 5, A = 140, ox = cx - 60, oy = cy + 60;
    M2_drawAxes(ox, oy, 200, 180, 'x', 'y', '#555566');
    var ax = A * Math.cos(ang), ay = A * Math.sin(ang);
    if (pl.show_drop_lines !== false) {
      M2_drawDashedLine(ox + ax, oy, ox + ax, oy - ay, '#60a5fa', 5, 3);
      M2_drawDashedLine(ox, oy - ay, ox + ax, oy - ay, '#34d399', 5, 3);
    }
    var pulse = 0.7 + 0.3 * Math.sin(t * 3);
    if (pl.show_components !== false) {
      M2_drawArrow(ox, oy, ox + ax, oy, '#60a5fa', 'Ax=Acos\u03B8', pulse, true);
      M2_drawArrow(ox, oy, ox, oy - ay, '#34d399', 'Ay=Asin\u03B8', pulse, true);
    }
    M2_newArrow(ox, oy, ox + ax, oy - ay, '#fbbf24', 'A');
    if (pl.show_components !== false) {
      M2_drawAngleArc(ox, oy, 30, 0, ang, '#FFD54F', '\u03B8');
      M2_drawRightAngle(ox + ax, oy, 10, 0);
    }
  } else if (sub === 'trig_component_formulas') {
    var th2 = M2_getCanvasSliderVal('cTh', 0, 90, 45, height - 70, '\u03B8 (\u00B0)');
    var A2 = M2_getCanvasSliderVal('cA', 1, 10, 6, height - 40, '|A|');
    var rad2 = th2 * Math.PI / 180, sc2 = 18, ox2 = cx - 60, oy2 = cy + 60;
    M2_drawAxes(ox2, oy2, 220, 200, 'x', 'y', '#555566');
    var axv = A2 * sc2 * Math.cos(rad2), ayv = A2 * sc2 * Math.sin(rad2);
    M2_newArrow(ox2, oy2, ox2 + axv, oy2 - ayv, '#fbbf24', 'A=' + A2.toFixed(1));
    M2_newArrow(ox2, oy2, ox2 + axv, oy2, '#60a5fa', 'Ax=' + (A2 * Math.cos(rad2)).toFixed(2));
    M2_newArrow(ox2 + axv, oy2, ox2 + axv, oy2 - ayv, '#34d399', 'Ay=' + (A2 * Math.sin(rad2)).toFixed(2));
    M2_drawAngleArc(ox2, oy2, 30, 0, rad2, '#FFD54F', th2.toFixed(0) + '\u00B0');
  } else if (sub === 'unit_vector_form') {
    var phase3 = constrain(t * 0.4, 0, 2); var ox3 = cx - 80, oy3 = cy + 60; var Ax3 = 80, Ay3 = 60;
    M2_drawAxes(ox3, oy3, 200, 180, 'x', 'y', '#555566');
    M2_newArrow(ox3, oy3, ox3 + Ax3, oy3, '#60a5fa', 'Ax');
    if (phase3 > 0.5) { var ayFrac = constrain((phase3 - 0.5) / 0.7, 0, 1); M2_newArrow(ox3 + Ax3, oy3, ox3 + Ax3, oy3 - Ay3 * ayFrac, '#34d399', 'Ay'); }
    if (phase3 > 1.2) M2_newArrow(ox3, oy3, ox3 + Ax3, oy3 - Ay3, '#fbbf24', 'A');
    M2_drawFormulaBox(20, 20, 300, ['A = \u221A(Ax\u00B2+Ay\u00B2) = ' + Math.sqrt(Ax3 * Ax3 + Ay3 * Ay3).toFixed(1), '\u03B8 = tan\u207B\u00B9(Ay/Ax) = ' + (Math.atan2(Ay3, Ax3) * 180 / Math.PI).toFixed(1) + '\u00B0'], '#000000', '#fbbf24');
  } else if (sub === 'reconstruction_from_components') {
    var vecs = [{ A: 5, ang: 30, col: '#60a5fa', name: 'A' }, { A: 4, ang: 120, col: '#34d399', name: 'B' }, { A: 3, ang: 210, col: '#C896FF', name: 'C' }];
    var ox4 = cx - 40, oy4 = cy + 80, sc4 = 14; M2_drawAxes(ox4, oy4, 250, 220, 'x', 'y', '#555566');
    var Rx4 = 0, Ry4 = 0;
    for (var vi = 0; vi < vecs.length; vi++) { var v = vecs[vi]; var vrad = v.ang * Math.PI / 180; M2_newArrow(ox4, oy4, ox4 + v.A * sc4 * Math.cos(vrad), oy4 - v.A * sc4 * Math.sin(vrad), v.col, v.name); Rx4 += v.A * Math.cos(vrad); Ry4 += v.A * Math.sin(vrad); }
    M2_newArrow(ox4, oy4, ox4 + Rx4 * sc4, oy4 - Ry4 * sc4, '#fbbf24', 'R');
    M2_drawFormulaBox(20, 20, 300, ['Rx = ' + Rx4.toFixed(2), 'Ry = ' + Ry4.toFixed(2), 'R = ' + Math.sqrt(Rx4 * Rx4 + Ry4 * Ry4).toFixed(2)], '#000000', '#fbbf24');
  } else if (sub === 'negative_components_quadrants') {
    var ox5 = cx - 40, oy5 = cy + 60; M2_drawAxes(ox5, oy5, 200, 180, 'x', 'y', '#555566');
    var A5 = 120, ang5 = Math.PI / 5; var phase5 = constrain(t * 0.5, 0, 3);
    if (phase5 < 1.5) M2_newArrow(ox5, oy5, ox5 + A5 * Math.cos(ang5), oy5 - A5 * Math.sin(ang5), '#60a5fa', 'A');
    if (phase5 >= 1.5) { M2_newArrow(ox5, oy5, ox5 + 40 * Math.cos(ang5), oy5 - 40 * Math.sin(ang5), '#fbbf24', '\u00C2'); noFill(); M2_stroke('#fbbf24', 0.3); strokeWeight(1); arc(ox5, oy5, 80, 80, -Math.PI / 2, Math.PI / 2); }
    M2_drawFormulaBox(20, 20, 320, ['\u00C2 = (Ax/|A|)\u00EE + (Ay/|A|)\u0135', '|\u00C2| = 1 (unit circle)'], '#000000', '#fbbf24');
  } else if (sub === 'three_d_extension') {
    var ox6 = cx - 60, oy6 = cy + 60, sc6 = 12, ang6 = 30 * Math.PI / 180;
    M2_drawAxes(ox6, oy6, 200, 180, 'x', 'y', '#555566');
    M2_newArrow(ox6, oy6, ox6 + 10 * sc6 * Math.cos(ang6), oy6 - 10 * sc6 * Math.sin(ang6), '#fbbf24', 'A=10');
    M2_newArrow(ox6, oy6, ox6 + 10 * sc6 * Math.cos(ang6), oy6, '#60a5fa', 'Ax=8.66');
    M2_newArrow(ox6 + 10 * sc6 * Math.cos(ang6), oy6, ox6 + 10 * sc6 * Math.cos(ang6), oy6 - 10 * sc6 * Math.sin(ang6), '#34d399', 'Ay=5');
    M2_drawAngleArc(ox6, oy6, 35, 0, ang6, '#FFD54F', '30\u00B0');
    M2_drawFormulaBox(20, 20, 320, ['A=10 at 30\u00B0', 'Ax = 10cos30\u00B0 = 5\u221A3 \u2248 8.66', 'Ay = 10sin30\u00B0 = 5'], '#000000', '#FFFFFF');
  } else if (sub === 'vc_wrong_one_component') {
    var cx=width/2, cy=height/2, sc=20;
    M2_drawAxes(cx-80,cy+60,200,180,'x','y','#555566');
    M2_newArrow(cx-80,cy+50,cx-80+3*sc,cy+50-4*sc,'#60a5fa','R=5');
    M2_newArrow(cx-80,cy+50,cx-80+3*sc,cy+50,'#34d399','Rx=3');
    M2_fill('#ef4444',0.9); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('"Ry is lost! Rx < R!"',cx,cy-30);
    M2_projWatermark('Belief: components lose information','#ef4444');
    M2_drawFormulaBox(20,20,350,['Rx=3, Ry=4, R=5','Check: 3²+4²=9+16=25=5² ✓','Nothing is lost — Pythagoras guarantees it!'],'#000000','#ef4444');

  } else if (sub === 'vc_both_needed') {
    var cx=width/2, cy=height/2, sc=20;
    var phase=constrain(M2_animPhase*0.4,0,3);
    M2_drawAxes(cx-80,cy+60,200,180,'x','y','#555566');
    if(phase>0.3){M2_newArrow(cx-80,cy+50,cx-80+3*sc,cy+50,'#34d399','Rx=3');}
    if(phase>1.0){M2_newArrow(cx-80+3*sc,cy+50,cx-80+3*sc,cy+50-4*sc,'#ef4444','Ry=4');}
    if(phase>1.8){M2_newArrow(cx-80,cy+50,cx-80+3*sc,cy+50-4*sc,'#fbbf24','R=5 ✓');}
    M2_textBox(20,20,'Watch: Rx placed first, Ry at its tip → exactly R!','#34d399',12);

  } else if (sub === 'vc_aha_need_both') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(cx-200,cy-60,400,120,8);
    M2_fill('#fbbf24',1.0); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('Breaking 100 into 60+40:',cx,cy-30);
    M2_fill('#FFFFFF',0.8); textSize(13); text('60 alone ≠ 100. But 60+40 = 100.',cx,cy);
    text('Same with vectors: Rx+Ry = R (exactly!)',cx,cy+30);
    M2_drawFormulaBox(20,height-60,width-40,['Components are SMALLER individually — but TOGETHER they are exactly R','Rₓî + Rᵧĵ = R  (always, no exceptions)'],'#000000','#34d399');

  } else if (sub === 'components_are_less_than_original_s4') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.3); noStroke(); rect(15,50,cx-25,height-100,4); rect(cx+10,50,cx-25,height-100,4);
    fill(200); textSize(11); textAlign(CENTER,TOP); noStroke();
    text('With components',cx/2,55); text('Without (parallelogram)',cx+cx/2,55);
    M2_drawFormulaBox(25,90,cx-35,['Step 1: Add x-parts','Step 2: Add y-parts','Result: done in 2 steps'],'#000000','#34d399');
    M2_drawFormulaBox(cx+15,90,cx-35,['Draw parallelogram','Find diagonal','Trig calculation'],'#000000','#888888');
    M2_fill('#34d399',0.8); noStroke(); textSize(16); textAlign(CENTER,CENTER); text('2 steps',cx/2,cy+60);
    M2_fill('#888888',0.8); textSize(13); text('many steps',cx+cx/2,cy+60);

  } else if (sub === 'components_are_less_than_original_s5') {
    var cx=width/2, cy=height/2;
    var th5=M2_getCanvasSliderVal('vc5',0,90,37,height-50,'α(°)');
    var R5=10, r5=th5*Math.PI/180;
    var Rx5=R5*Math.cos(r5), Ry5=R5*Math.sin(r5);
    var sc5=15, ox5=cx-60, oy5=cy+60;
    M2_drawAxes(ox5,oy5,200,180,'x','y','#555566');
    M2_newArrow(ox5,oy5,ox5+R5*sc5*Math.cos(r5),oy5-R5*sc5*Math.sin(r5),'#fbbf24','R=10');
    M2_newArrow(ox5,oy5,ox5+Rx5*sc5,oy5,'#60a5fa','Rx='+Rx5.toFixed(1));
    M2_newArrow(ox5+Rx5*sc5,oy5,ox5+Rx5*sc5,oy5-Ry5*sc5,'#34d399','Ry='+Ry5.toFixed(1));
    M2_drawFormulaBox(20,20,340,['Rₓ²+Rᵧ²='+((Rx5*Rx5+Ry5*Ry5).toFixed(1))+'=R²='+( R5*R5)+' ✓','Change α — sum always equals R²'],'#000000','#34d399');

  } else if (sub === 'vc_wrong_angle_always_x') {
    var cx=width/2, cy=height/2;
    M2_drawAxes(cx-80,cy+60,200,180,'x','y','#555566');
    var angWrong=Math.PI/5;
    M2_newArrow(cx-80,cy+50,cx-80+120*Math.cos(angWrong),cy+50-120*Math.sin(angWrong),'#60a5fa','R');
    M2_drawAngleArc(cx-80,cy+50,30,0,angWrong,'#fbbf24','α');
    M2_fill('#ef4444',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('"α from y-axis!"',cx,cy-30);
    M2_projWatermark('Belief: angle from wrong axis','#ef4444');
    M2_drawFormulaBox(20,20,340,['α is ALWAYS measured from the positive x-axis','This is the convention — not from y-axis!','Rx = R cosα (adjacent), Ry = R sinα (opposite)'],'#000000','#ef4444');

  } else if (sub === 'vc_angle_convention_varies') {
    var cx=width/2, cy=height/2;
    M2_drawAxes(cx-80,cy+60,200,180,'x','y','#555566');
    var ang=Math.PI/5;
    M2_newArrow(cx-80,cy+50,cx-80+120*Math.cos(ang),cy+50-120*Math.sin(ang),'#60a5fa','R');
    M2_drawAngleArc(cx-80,cy+50,30,0,ang,'#fbbf24','α (from x-axis)');
    M2_newArrow(cx-80+120*Math.cos(ang),cy+50,cx-80+120*Math.cos(ang),cy+50,'#34d399','');
    M2_drawDashedLine(cx-80+120*Math.cos(ang),cy+50,cx-80+120*Math.cos(ang),cy+50-120*Math.sin(ang),'#34d399',4,3);
    M2_drawDashedLine(cx-80,cy+50-120*Math.sin(ang),cx-80+120*Math.cos(ang),cy+50-120*Math.sin(ang),'#60a5fa',4,3);
    M2_drawFormulaBox(20,20,340,['α from x-axis → adjacent = Rx, opposite = Ry','cos = adjacent/hypotenuse → Rx = Rcosα','sin = opposite/hypotenuse → Ry = Rsinα'],'#000000','#fbbf24');

  } else if (sub === 'vc_aha_use_geometry') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(cx-200,cy-90,400,180,8);
    M2_drawFormulaBox(cx-190,cy-85,380,['Memory rule: X and Cos both come first','  Rx = R Cosα','  Ry = R Sinα','','Sanity check:','  α=0°: cosα=1, sinα=0 → all in x ✓','  α=90°: cosα=0, sinα=1 → all in y ✓'],'#000000','#34d399');

  } else if (sub === 'cos_sin_confusion_s4') {
    var cx=width/2, cy=height/2, sc=15;
    var cases4=[{a:0,Rx:'R',Ry:'0',col:'#34d399'},{a:90,Rx:'0',Ry:'R',col:'#60a5fa'},{a:45,Rx:'R/√2',Ry:'R/√2',col:'#fbbf24'}];
    var pw=(width-40)/3;
    for(var ci4=0;ci4<3;ci4++){
      var bx4=20+ci4*pw, cs4=cases4[ci4];
      M2_fill('#000000',0.35); noStroke(); rect(bx4,cy-50,pw-8,100,4);
      fill(M2_rgb(cs4.col)[0],M2_rgb(cs4.col)[1],M2_rgb(cs4.col)[2]);
      textSize(11); textAlign(CENTER,TOP);
      text('α='+cs4.a+'°',bx4+pw/2-4,cy-47);
      text('Rx='+cs4.Rx,bx4+pw/2-4,cy-28);
      text('Ry='+cs4.Ry,bx4+pw/2-4,cy-10);
      text('✓',bx4+pw/2-4,cy+8);
      var aRad=cs4.a*Math.PI/180, len=30;
      M2_newArrow(bx4+pw/2-4,cy+50,bx4+pw/2-4+len*Math.cos(aRad),cy+50-len*Math.sin(aRad),cs4.col,'');
    }
    M2_textBox(cx-100,20,'Three sanity checks — all pass with Rx=Rcosα','#fbbf24',12);

  } else if (sub === 'cos_sin_confusion_s5') {
    var cx=width/2, cy=height/2;
    var th5=M2_getCanvasSliderVal('csc5',0,90,53,height-50,'α from x-axis (°)');
    var R5=15, r5=th5*Math.PI/180;
    var Rx5=R5*Math.cos(r5), Ry5=R5*Math.sin(r5);
    var sc5=12, ox5=cx-70, oy5=cy+60;
    M2_drawAxes(ox5,oy5,200,180,'x','y','#555566');
    M2_newArrow(ox5,oy5,ox5+R5*sc5*Math.cos(r5),oy5-R5*sc5*Math.sin(r5),'#fbbf24','R=15');
    M2_newArrow(ox5,oy5,ox5+Rx5*sc5,oy5,'#60a5fa','Rx='+Rx5.toFixed(1));
    M2_newArrow(ox5+Rx5*sc5,oy5,ox5+Rx5*sc5,oy5-Ry5*sc5,'#34d399','Ry='+Ry5.toFixed(1));
    M2_drawFormulaBox(20,20,340,['Rx=15cos'+th5.toFixed(0)+'°='+Rx5.toFixed(1),'Ry=15sin'+th5.toFixed(0)+'°='+Ry5.toFixed(1),'Check: √('+( Rx5*Rx5).toFixed(0)+'+'+( Ry5*Ry5).toFixed(0)+')='+Math.sqrt(Rx5*Rx5+Ry5*Ry5).toFixed(1)+' ✓'],'#000000','#fbbf24');

  } else if (sub === 'unit_vector_confusion_s1') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-40,cy,cx+40,cy,'#fbbf24','î  (length=1, East)');
    M2_newArrow(cx-40,cy+50,cx-40,cy+50-40,'#34d399','ĵ  (length=1, North)');
    M2_fill('#ef4444',0.8); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('"î is imaginary number i=√(-1)??"',cx,cy-40);
    M2_projWatermark('Belief: î = imaginary i','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['In PHYSICS: î (i-hat) = unit vector along positive x-axis','The hat (^) symbol means UNIT VECTOR','Nothing imaginary about it — it is a physical arrow of length 1'],'#000000','#ef4444');

  } else if (sub === 'unit_vector_confusion_s2') {
    var cx=width/2, cy=height/2;
    var scales=[1,3,8], cols=['#FFFFFF','#60a5fa','#34d399'];
    var ox2=80, base=40;
    for(var si2=0;si2<3;si2++){
      var y2=cy-40+si2*60;
      M2_newArrow(ox2,y2,ox2+scales[si2]*base,y2,cols[si2],scales[si2]+'î — '+scales[si2]+' units East');
    }
    M2_textBox(20,20,'Multiplying î stretches it — direction stays East','#fbbf24',12);
    M2_drawFormulaBox(20,height-60,width-40,['8î = take î (length 1, East) and stretch to length 8','Number scales the length. î provides the direction.'],'#000000','#FFFFFF');

  } else if (sub === 'unit_vector_confusion_s3') {
    var cx=width/2, cy=height/2;
    var phase=constrain(M2_animPhase*0.4,0,3);
    var ox3=cx-80, oy3=cy+40, sc3=25;
    if(phase>0.3){M2_newArrow(ox3,oy3,ox3+3*sc3,oy3,'#34d399','3î → 3 East');}
    if(phase>1.2){M2_newArrow(ox3+3*sc3,oy3,ox3+3*sc3,oy3-4*sc3,'#60a5fa','4ĵ → 4 North');}
    if(phase>2.0){M2_newArrow(ox3,oy3,ox3+3*sc3,oy3-4*sc3,'#fbbf24','Result: magnitude 5, 53° NE');}
    M2_drawFormulaBox(20,20,340,['3î+4ĵ = go 3 East AND 4 North','Result: |r|=5 at arctan(4/3)=53° from East','Not scalar addition — vector construction!'],'#000000','#fbbf24');

  } else if (sub === 'unit_vector_confusion_s4') {
    var cx=width/2, cy=height/2;
    var compX=M2_getCanvasSliderVal('ucX',-8,8,3,height-70,'x-component (î)');
    var compY=M2_getCanvasSliderVal('ucY',-8,8,4,height-40,'y-component (ĵ)');
    var sc4=20, ox4=cx-60, oy4=cy+40;
    M2_drawAxes(ox4,oy4,200,180,'x','y','#555566');
    M2_newArrow(ox4,oy4,ox4+compX*sc4,oy4-compY*sc4,'#fbbf24','');
    M2_drawFormulaBox(20,20,340,['Notation: ('+compX.toFixed(0)+'î + '+compY.toFixed(0)+'ĵ)','Magnitude: √('+( compX*compX).toFixed(0)+'+'+( compY*compY).toFixed(0)+')='+Math.sqrt(compX*compX+compY*compY).toFixed(1),'Set x=6, y=-8 → |r|=10'],'#000000','#fbbf24');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_dotProduct(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','dot_definition_geometric','projection_interpretation','component_formula','dot_product_sign','perpendicular_test','work_application_preview']; sub = fm[idx] || 'dot_definition_geometric'; } background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (sub === 'dot_definition_geometric') {
    var th1 = M2_getCanvasSliderVal('dpTh1', 0, 180, 60, height - 50, '\u03B8 (\u00B0)');
    var rad1 = th1 * Math.PI / 180;
    var ox1 = cx - 60, oy1 = cy + 40;
    var A1 = 100, B1 = 80;
    M2_newArrow(ox1, oy1, ox1 + A1, oy1, '#fbbf24', 'A');
    M2_newArrow(ox1, oy1, ox1 + B1 * Math.cos(rad1), oy1 - B1 * Math.sin(rad1), '#60a5fa', 'B');
    M2_drawAngleArc(ox1, oy1, 30, 0, rad1, '#a78bfa', th1.toFixed(0) + '\u00B0');
    var dotVal1 = (A1/20) * (B1/20) * Math.cos(rad1);
    var dotColor1 = dotVal1 > 0.5 ? '#34d399' : dotVal1 < -0.5 ? '#ef4444' : '#fbbf24';
    M2_drawFormulaBox(20, 20, 340, ['A\u00B7B = AB cos\u03B8 = ' + (dotVal1).toFixed(2), '\u03B8 = ' + th1.toFixed(0) + '\u00B0 \u2192 ' + (dotVal1 > 0.5 ? 'positive (aligned)' : dotVal1 < -0.5 ? 'negative (opposing)' : 'zero (perpendicular)')], '#000000', dotColor1);
    M2_textBox(ox1 - 40, oy1 + 20, 'Both from same origin', '#94a3b8', 11);
  } else if (sub === 'projection_interpretation') {
    var animAng = M2_animPhase * 0.4; var ox2 = cx - 100, oy2 = cy + 40;
    var A2 = 150, B2 = 100, angB = animAng % (Math.PI * 0.8);
    M2_newArrow(ox2, oy2, ox2 + A2, oy2, '#60a5fa', 'A');
    var bx = B2 * Math.cos(angB), by = -B2 * Math.sin(angB);
    M2_newArrow(ox2, oy2, ox2 + bx, oy2 + by, '#34d399', 'B');
    var projLen = B2 * Math.cos(angB);
    M2_drawDashedLine(ox2 + bx, oy2 + by, ox2 + projLen, oy2, '#888888', 4, 3);
    if (projLen > 0) { M2_stroke('#fbbf24', 0.6); strokeWeight(4); line(ox2, oy2, ox2 + projLen, oy2); }
    noStroke(); M2_textBox(ox2 + projLen / 2 - 30, oy2 + 8, 'Bcos\u03B8 = ' + Math.cos(angB).toFixed(2) + 'B', '#fbbf24', 11);
    M2_textBox(20, 20, 'A\u00B7B = |A| \u00D7 (projection of B on A)', '#fbbf24', 13);
  } else if (sub === 'component_formula') {
    var cases3 = [{ th: 0, val: 'AB = 20', col: '#34d399', label: '\u03B8=0\u00B0 Maximum', x: cx - 220 }, { th: 90, val: '0', col: '#fbbf24', label: '\u03B8=90\u00B0 Zero', x: cx }, { th: 180, val: '-AB = -20', col: '#ef4444', label: '\u03B8=180\u00B0 Minimum', x: cx + 220 }];
    for (var ci = 0; ci < cases3.length; ci++) {
      var c3 = cases3[ci]; var rad3 = c3.th * Math.PI / 180; var oy3 = cy + 20;
      M2_newArrow(c3.x - 50, oy3, c3.x + 50, oy3, '#fbbf24', '');
      M2_newArrow(c3.x - 50, oy3, c3.x - 50 + 80 * Math.cos(rad3), oy3 - 80 * Math.sin(rad3), '#60a5fa', '');
      M2_fill('#000000', 0.4); noStroke(); rect(c3.x - 60, oy3 + 60, 120, 50, 6);
      fill(color(c3.col)); textSize(13); textAlign(CENTER, CENTER); text('A\u00B7B = ' + c3.val, c3.x, oy3 + 78);
      fill(180); textSize(11); text(c3.label, c3.x, oy3 + 100);
    }
    M2_drawFormulaBox(20, 20, 300, ['A\u00B7B = AB cos\u03B8', 'Sign depends only on \u03B8'], '#000000', '#fbbf24');
  } else if (sub === 'dot_product_sign') {
    var rules4 = [{ a: '\u00EE\u00B7\u00EE', b: '= 1', note: 'same axis', col: '#34d399' }, { a: '\u0135\u00B7\u0135', b: '= 1', note: 'same axis', col: '#34d399' }, { a: 'k\u0302\u00B7k\u0302', b: '= 1', note: 'same axis', col: '#34d399' }, { a: '\u00EE\u00B7\u0135', b: '= 0', note: 'perpendicular', col: '#ef4444' }, { a: '\u0135\u00B7k\u0302', b: '= 0', note: 'perpendicular', col: '#ef4444' }, { a: 'k\u0302\u00B7\u00EE', b: '= 0', note: 'perpendicular', col: '#ef4444' }];
    var startY4 = 60;
    for (var ri = 0; ri < rules4.length; ri++) {
      var r4 = rules4[ri]; var ry = startY4 + ri * 52;
      M2_fill('#000000', 0.35); noStroke(); rect(cx - 240, ry, 480, 44, 6);
      fill(color(r4.col)); textSize(15); textAlign(LEFT, CENTER); text(r4.a + '  ' + r4.b, cx - 220, ry + 22);
      fill(150); textSize(11); textAlign(RIGHT, CENTER); text(r4.note, cx + 220, ry + 22);
    }
    M2_drawFormulaBox(20, startY4 + 6 * 52 + 10, 480, ['\u2234 A\u00B7B = AxBx + AyBy + AzBz', 'Only matching axes contribute'], '#000000', '#60a5fa');
  } else if (sub === 'perpendicular_test') {
    var th5 = 60; var rad5 = th5 * Math.PI / 180;
    var ox5 = cx - 80, oy5 = cy + 30;
    M2_newArrow(ox5, oy5, ox5 + 160, oy5, '#60a5fa', 's');
    M2_newArrow(ox5 + 80, oy5, ox5 + 80 + 80 * Math.cos(rad5), oy5 - 80 * Math.sin(rad5), '#fbbf24', 'F');
    var Fcomp5 = 80 * Math.cos(rad5);
    stroke(251, 191, 36, 120); strokeWeight(1.5); drawingContext.setLineDash([5, 4]);
    line(ox5 + 80 + Fcomp5, oy5, ox5 + 80 + Fcomp5, oy5 - 80 * Math.sin(rad5));
    drawingContext.setLineDash([]);
    M2_drawAngleArc(ox5 + 80, oy5, 30, 0, rad5, '#a78bfa', th5 + '\u00B0');
    fill(200); noStroke(); textSize(11); textAlign(CENTER, TOP);
    text('F cos\u03B8 = ' + (Math.cos(rad5)).toFixed(2) + 'F', ox5 + 80 + Fcomp5 / 2, oy5 + 8);
    M2_drawFormulaBox(20, 20, 360, ['W = F\u00B7s = |F||s| cos\u03B8', 'W = Fs cos60\u00B0 = 0.500 Fs', 'Only F cos\u03B8 (along s) does work'], '#000000', '#34d399');
    M2_fill('#000000', 0.35); noStroke(); rect(20, height - 80, width - 40, 50, 6);
    fill(239, 68, 68); textSize(13); textAlign(CENTER, CENTER);
    text('At \u03B8 = 90\u00B0: W = 0 \u2014 perpendicular force does NO work', cx, height - 55);
  } else if (sub === 'work_application_preview') {
    var th6 = M2_getCanvasSliderVal('dp_theta', 0, 180, 60, height - 50, '\u03B8 (degrees)');
    var rad6 = th6 * Math.PI / 180;
    var A6 = 5, B6 = 4, aLen6 = 100, bLen6 = 80;
    var ox6 = cx - 60, oy6 = cy + 20;
    M2_newArrow(ox6, oy6, ox6 + aLen6, oy6, '#60a5fa', 'A=' + A6);
    M2_newArrow(ox6, oy6, ox6 + bLen6 * Math.cos(rad6), oy6 - bLen6 * Math.sin(rad6), '#34d399', 'B=' + B6);
    M2_drawAngleArc(ox6, oy6, 30, 0, rad6, '#fbbf24', th6.toFixed(0) + '\u00B0');
    var dotVal6 = A6 * B6 * Math.cos(rad6);
    M2_drawFormulaBox(20, 20, 380, ['A\u00B7B = |A||B|cos\u03B8', 'A\u00B7B = ' + A6 + '\u00D7' + B6 + '\u00D7cos' + th6.toFixed(0) + '\u00B0 = ' + dotVal6.toFixed(2), dotVal6 > 0.01 ? 'Positive \u2014 vectors aligned' : (dotVal6 < -0.01 ? 'Negative \u2014 vectors opposed' : 'ZERO \u2014 perpendicular!')], '#000000', dotVal6 > 0.01 ? '#34d399' : (dotVal6 < -0.01 ? '#ef4444' : '#fbbf24'));
  } else if (sub === 'dp_wrong_vector_result') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy,cx+40,cy,'#60a5fa','A=5');
    M2_newArrow(cx-80,cy,cx-80+60*Math.cos(Math.PI/3),cy-60*Math.sin(Math.PI/3),'#34d399','B=4');
    M2_fill('#ef4444',0.8); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('"A·B is a vector pointing in some direction"',cx,cy+60);
    M2_projWatermark('Belief: dot product = vector','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['Student expects an arrow as output of A·B','In reality: A·B = AB cosθ = a SINGLE NUMBER','Output box: just a number — no direction, no arrow'],'#000000','#ef4444');

  } else if (sub === 'dp_scalar_result_shown') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy,cx+40,cy,'#60a5fa','A=5');
    M2_newArrow(cx-80,cy,cx-80+60*Math.cos(Math.PI/3),cy-60*Math.sin(Math.PI/3),'#34d399','B=4');
    M2_fill('#000000',0.6); noStroke(); rect(cx+60,cy-30,120,60,6);
    fill(255,235,60); textSize(24); textAlign(CENTER,CENTER);
    text('10',cx+120,cy);
    fill(200); textSize(11); textAlign(CENTER,TOP); text('A·B = AB cos60° = 10',cx+120,cy+32);
    M2_textBox(20,20,'Output is just a number — SCALAR','#fbbf24',12);
    M2_drawFormulaBox(20,height-55,width-40,['Dot product: TWO vectors go in, ONE number comes out','Compare cross product: two vectors → one vector'],'#000000','#FFFFFF');

  } else if (sub === 'dp_aha_scalar_product') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(cx-200,cy-60,400,120,8);
    M2_fill('#fbbf24',1.0); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text('A·B = SCALAR (a number)',cx,cy-25);
    M2_fill('#FFFFFF',0.8); textSize(13);
    text('Cross product A×B = VECTOR',cx,cy+10);
    text('Dot product = ALIGNMENT measure, not new direction',cx,cy+35);
    M2_textBox(20,height-30,'Zero at 90°: no alignment. Max at 0°: full alignment.','#fbbf24',12);

  } else if (sub === 'dot_product_is_vector_s4') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Unit vector dot products:','î·î = 1  (same direction: cos0°=1)','ĵ·ĵ = 1','k̂·k̂ = 1','î·ĵ = 0  (perpendicular: cos90°=0)','ĵ·k̂ = 0','k̂·î = 0','','All results are SCALARS — no direction'],'#000000','#FFFFFF');

  } else if (sub === 'dot_product_is_vector_s5') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(cx-200,cy-50,400,100,8);
    M2_fill('#34d399',1.0); noStroke(); textSize(18); textAlign(CENTER,CENTER);
    text('A·B = scalar — measures alignment',cx,cy-15);
    M2_fill('#FFFFFF',0.8); textSize(12);
    text('Zero = perpendicular. Positive = same side. Negative = opposite.',cx,cy+18);
    M2_textBox(20,height-30,'Remember: work W=F·s gives Joules — a scalar, not a vector','#fbbf24',12);

  } else if (sub === 'dp_wrong_nonzero_perp') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy,cx+80,cy,'#60a5fa','A=5 (East)');
    M2_newArrow(cx-80,cy,cx-80,cy-100,'#34d399','B=4 (North)');
    M2_fill('#ef4444',0.8); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text('"A·B ≠ 0 because both are non-zero!"',cx,cy+50);
    M2_projWatermark('Belief: non-zero vectors → non-zero dot product','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['East · North = 0 cos90° = 0','Neither vector is zero, but dot product IS zero','Perpendicular vectors have ZERO dot product — always'],'#000000','#ef4444');

  } else if (sub === 'dp_cos90_is_zero') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy,cx+80,cy,'#60a5fa','A');
    M2_newArrow(cx-80,cy,cx-80,cy-80,'#34d399','B');
    M2_drawAngleArc(cx-80,cy,35,0,Math.PI/2,'#fbbf24','90°');
    var projLen=0;
    M2_stroke('#fbbf24',0.3); strokeWeight(4); line(cx-80,cy,cx-80+projLen,cy);
    M2_fill('#fbbf24',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('Projection of B onto A = 0',cx,cy+50);
    M2_drawFormulaBox(20,20,width-40,['A·B = |A| × (projection of B onto A)','Projection = B cos90° = B × 0 = 0','Therefore A·B = 0 — correctly and physically!'],'#000000','#34d399');

  } else if (sub === 'dp_aha_orthogonality_test') {
    var cx=width/2, cy=height/2;
    var cases3=[{th:0,val:'AB',col:'#34d399'},{th:90,val:'0',col:'#fbbf24'},{th:180,val:'-AB',col:'#ef4444'}];
    var pw=(width-40)/3;
    for(var ci3=0;ci3<3;ci3++){
      var bx3=20+ci3*pw, ang3=cases3[ci3].th*Math.PI/180;
      M2_fill('#000000',0.35); noStroke(); rect(bx3,cy-60,pw-8,120,4);
      fill(200); textSize(10); textAlign(CENTER,TOP); text('θ='+cases3[ci3].th+'°',bx3+pw/2-4,cy-57);
      M2_newArrow(bx3+30,cy,bx3+30+50,cy,'#60a5fa','');
      M2_newArrow(bx3+30,cy,bx3+30+40*Math.cos(ang3),cy-40*Math.sin(ang3),'#34d399','');
      fill(M2_rgb(cases3[ci3].col)[0],M2_rgb(cases3[ci3].col)[1],M2_rgb(cases3[ci3].col)[2]);
      textSize(14); textAlign(CENTER,CENTER); text('A·B='+cases3[ci3].val,bx3+pw/2-4,cy+35);
    }
    M2_textBox(cx-100,20,'cos0°=1, cos90°=0, cos180°=-1','#fbbf24',12);

  } else if (sub === 'theta_90_means_formula_fails_s4') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['î·ĵ = 0 — designed to be zero!','These are the perpendicular basis vectors','Their zero dot product is CORRECT and INTENTIONAL','','When î·ĵ=0, computation of A·B = AxBx + AyBy + AzBz','simplifies beautifully — cross terms vanish.'],'#000000','#FFFFFF');

  } else if (sub === 'theta_90_means_formula_fails_s5') {
    var cx=width/2, cy=height/2;
    M2_newArrow(cx-80,cy+20,cx-80+100,cy+20,'#60a5fa','F (force, North)');
    M2_newArrow(cx-80,cy+20,cx+80,cy+20,'#34d399','s (displacement, East)');
    M2_drawAngleArc(cx-80,cy+20,40,0,Math.PI/2,'#fbbf24','90°');
    M2_fill('#fbbf24',0.9); noStroke(); textSize(18); textAlign(CENTER,CENTER);
    text('W = F·s = F×s×cos90° = 0 J',cx,cy-30);
    M2_textBox(20,height-30,'Normal force does no work — force ⊥ displacement!','#34d399',12);

  } else if (sub === 'theta_90_means_formula_fails_s6') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(cx-200,cy-60,400,120,8);
    M2_fill('#34d399',1.0); noStroke(); textSize(18); textAlign(CENTER,CENTER);
    text('A·B = 0 means PERPENDICULAR',cx,cy-15);
    M2_fill('#FFFFFF',0.8); textSize(12); text('Formula did NOT fail — it gave the correct answer!',cx,cy+18);
    M2_textBox(20,height-30,'Zero dot product is the TEST for perpendicularity','#34d399',12);

  } else if (sub === 'dot_product_only_magnitude_s1') {
    var cx=width/2, cy=height/2, sc=15;
    var cases1=[{th:0,v:25},{th:60,v:12.5},{th:90,v:0}];
    var pw=(width-40)/3;
    for(var ci1=0;ci1<3;ci1++){
      var bx1=20+ci1*pw, ang1=cases1[ci1].th*Math.PI/180;
      M2_fill('#000000',0.35); noStroke(); rect(bx1,cy-50,pw-8,100,4);
      fill(200); textSize(10); textAlign(CENTER,TOP); text('θ='+cases1[ci1].th+'°',bx1+pw/2-4,cy-47);
      M2_newArrow(bx1+30,cy,bx1+30+40,cy,'#60a5fa','');
      M2_newArrow(bx1+30,cy,bx1+30+35*Math.cos(ang1),cy-35*Math.sin(ang1),'#34d399','');
      fill(255,235,60); textSize(14); textAlign(CENTER,CENTER);
      text('A·B='+cases1[ci1].v.toFixed(0),bx1+pw/2-4,cy+35);
    }
    M2_textBox(cx-120,20,'Same magnitudes, THREE different answers — angle matters!','#fbbf24',12);
    M2_projWatermark('Belief: A·B = AB always','#ef4444');

  } else if (sub === 'dot_product_only_magnitude_s2') {
    var cx=width/2, cy=height/2;
    M2_fill('#fbbf24',0.9); noStroke(); textSize(28); textAlign(CENTER,CENTER);
    text('A·B = AB cosθ',cx,cy);
    M2_fill('#FFFFFF',0.7); textSize(14);
    text('cosθ is the ANGLE FILTER',cx,cy+40);
    text('It keeps only the ALIGNED portion',cx,cy+65);
    M2_textBox(20,height-30,'Without cosθ, you miss the whole point of dot product','#ef4444',12);

  } else if (sub === 'dot_product_only_magnitude_s3') {
    var cx=width/2, cy=height/2;
    var ang3=Math.PI/4, A3=120, B3=90;
    var ox3=cx-80, oy3=cy+30;
    M2_newArrow(ox3,oy3,ox3+A3,oy3,'#60a5fa','A');
    M2_newArrow(ox3,oy3,ox3+B3*Math.cos(ang3),oy3-B3*Math.sin(ang3),'#34d399','B');
    var projLen3=B3*Math.cos(ang3);
    M2_stroke('#fbbf24',0.7); strokeWeight(5); line(ox3,oy3,ox3+projLen3,oy3);
    M2_textBox(ox3+projLen3/2-30,oy3+10,'Bcos45°','#fbbf24',10);
    M2_textBox(20,20,'A·B = |A| × (B cosθ) = projection × magnitude','#fbbf24',12);

  } else if (sub === 'dot_product_only_magnitude_s4') {
    var cx=width/2, cy=height/2, sc4=20;
    M2_drawAxes(cx-80,cy+60,200,180,'x','y','#555566');
    M2_newArrow(cx-80,cy+50,cx-80+3*sc4,cy+50-2*sc4,'#60a5fa','A=(3,2)');
    M2_newArrow(cx-80,cy+50,cx-80+4*sc4,cy+50-1*sc4,'#34d399','B=(4,1)');
    M2_drawFormulaBox(20,20,340,['A·B = AxBx + AyBy + AzBz','A·B = 3×4 + 2×1 = 14','Only MATCHING components contribute!'],'#000000','#FFFFFF');

  } else if (sub === 'dot_product_only_magnitude_s5') {
    var cx=width/2, cy=height/2;
    var th5=M2_getCanvasSliderVal('dpo5',0,90,60,height-50,'θ(°)');
    var F5=100, s5=120, W5=F5*s5*Math.cos(th5*Math.PI/180)/10000;
    M2_newArrow(cx-80,cy,cx-80+s5,cy,'#34d399','s=displacement');
    M2_newArrow(cx-80,cy,cx-80+F5*Math.cos(th5*Math.PI/180),cy-F5*Math.sin(th5*Math.PI/180),'#60a5fa','F');
    M2_drawAngleArc(cx-80,cy,40,0,th5*Math.PI/180,'#fbbf24',th5.toFixed(0)+'°');
    M2_drawFormulaBox(20,20,340,['W = F·s = Fs cosθ','At θ='+th5.toFixed(0)+'°: W = F×s×'+Math.cos(th5*Math.PI/180).toFixed(2),'Sideways force does less work!'],'#000000','#fbbf24');

  } else if (sub === 'dot_product_only_magnitude_s6') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(cx-200,cy-60,400,120,8);
    M2_fill('#34d399',1.0); noStroke(); textSize(18); textAlign(CENTER,CENTER);
    text('A·B = |A| × aligned part of B',cx,cy-20);
    M2_fill('#FFFFFF',0.8); textSize(12); text('= |A| × |B| cosθ',cx,cy+10);
    text('Angle is ESSENTIAL — not decoration',cx,cy+35);
    M2_textBox(20,height-30,'cosθ = 1 at 0° (full alignment), 0 at 90° (none), -1 at 180° (oppose)','#fbbf24',11);

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_distanceVsDisplacement(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','curved_path_shown','distance_along_path','displacement_straight_arrow','direction_difference','round_trip_case','magnitude_inequality']; sub = fm[idx] || 'curved_path_shown'; } background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (sub === 'curved_path_shown') {
    var nlY = cy; var nl = M2_drawNumberLine(nlY, 0, 100, '#AAAAAA', 10);
    var progress = constrain(t * 0.4, 0, 2); var pos;
    if (progress < 1) pos = 60 * progress; else pos = 60 - 40 * (progress - 1);
    var px = nl.x1 + (pos / 100) * (nl.x2 - nl.x1);
    if (progress < 1) { M2_stroke('#60a5fa', 0.5); strokeWeight(3); line(nl.x1, nlY - 8, px, nlY - 8); }
    else { M2_stroke('#60a5fa', 0.5); strokeWeight(3); var x60 = nl.x1 + 0.6 * (nl.x2 - nl.x1); line(nl.x1, nlY - 8, x60, nlY - 8); M2_stroke('#ef4444', 0.5); line(x60, nlY - 12, px, nlY - 12); }
    M2_drawParticle(px, nlY, 8, '#fbbf24', '');
    M2_drawFormulaBox(20, 30, 300, ['Distance = 60+40 = 100m (total path)', 'Displacement = 20m (net position)'], '#000000', '#FFFFFF');
    M2_textBox(20, height - 30, 'Distance \u2265 |Displacement| always', '#fbbf24', 12);
  } else if (sub === 'distance_along_path') {
    var r = 90, scx = cx, scy = cy + 20;
    noFill(); M2_stroke('#60a5fa', 0.8); strokeWeight(2); arc(scx, scy, r * 2, r * 2, Math.PI, 2 * Math.PI);
    M2_drawParticle(scx - r, scy, 6, '#34d399', 'A'); M2_drawParticle(scx + r, scy, 6, '#ef4444', 'B');
    M2_newArrow(scx - r, scy + 15, scx + r, scy + 15, '#fbbf24', 'Displacement=2r=28m');
    M2_fill('#60a5fa', 0.8); noStroke(); textSize(11); textAlign(CENTER, BOTTOM); text('Path=\u03C0r\u224844m', scx, scy - r - 5);
    M2_drawFormulaBox(20, 20, 320, ['r=14m', 'Distance=\u03C0r\u224844m', 'Displacement=2r=28m'], '#000000', '#FFFFFF');
  } else if (sub === 'displacement_straight_arrow') {
    var nlY3 = height * 0.35; var nl3 = M2_drawNumberLine(nlY3, -20, 80, '#AAAAAA', 5);
    var gox = 60, goy = height - 40, gw = width - 120, gh = 120;
    M2_drawAxes(gox, goy, gw, gh, 't(s)', 'v(m/s)', '#555566');
    var tMax3 = 5; var simT3 = (t * 0.6) % tMax3; var v3 = 20 - 8 * simT3; var pos3 = 20 * simT3 - 4 * simT3 * simT3;
    M2_stroke('#34d399', 0.8); strokeWeight(2); line(gox, goy - (20 / 30) * gh, gox + gw, goy - ((20 - 8 * tMax3) / 30) * gh);
    var crossT = 2.5; var crossX = gox + (crossT / tMax3) * gw;
    M2_fill('#ef4444', 0.9); noStroke(); ellipse(crossX, goy, 8, 8);
    M2_textBox(crossX - 60, goy + 5, 'DIRECTION REVERSAL', '#ef4444', 10);
    var curX3 = gox + (simT3 / tMax3) * gw;
    stroke(255, 255, 255, 150); strokeWeight(1); line(curX3, goy, curX3, goy - gh);
    M2_fill('#fbbf24', 1.0); noStroke(); ellipse(curX3, goy - (v3 / 30) * gh, 7, 7);
    var px3 = nl3.x1 + ((pos3 + 20) / 100) * (nl3.x2 - nl3.x1);
    M2_drawParticle(constrain(px3, nl3.x1, nl3.x2), nlY3, 8, '#fbbf24', '');
  } else if (sub === 'direction_difference') {
    var nlY4 = cy; var nl4 = M2_drawNumberLine(nlY4, 0, 100, '#AAAAAA', 5);
    var simT4 = (t * 0.3) % 2;
    var p1x = simT4 < 1 ? simT4 * 80 : 80;
    var p2x; if (simT4 < 0.5) p2x = simT4 * 200; else if (simT4 < 1) p2x = 100 - (simT4 - 0.5) * 40; else p2x = 80;
    M2_drawParticle(nl4.x1 + (p1x / 100) * (nl4.x2 - nl4.x1), nlY4 - 15, 6, '#60a5fa', 'P1');
    M2_drawParticle(nl4.x1 + (p2x / 100) * (nl4.x2 - nl4.x1), nlY4 + 15, 6, '#ef4444', 'P2');
    M2_drawFormulaBox(20, 30, 340, ['P1: direct \u2192 avg speed = avg velocity', 'P2: detour \u2192 avg speed > avg velocity', 'Same displacement, different distances!'], '#000000', '#FFFFFF');
  } else if (sub === 'round_trip_case') {
    var v1 = M2_getCanvasSliderVal('hv1', 10, 100, 40, height - 70, 'v\u2081 (km/h)');
    var v2 = M2_getCanvasSliderVal('hv2', 10, 100, 60, height - 40, 'v\u2082 (km/h)');
    var harmonic = 2 * v1 * v2 / (v1 + v2); var arithmetic = (v1 + v2) / 2;
    var barW2 = 30, maxV = 100; var bx1 = cx - 60, bx2 = cx + 20, by2 = 80, bh2 = 250;
    M2_fill('#000000', 0.3); noStroke(); rect(bx1 - 10, by2, barW2 + 20, bh2 + 30, 4); rect(bx2 - 10, by2, barW2 + 20, bh2 + 30, 4);
    M2_fill('#fbbf24', 0.8); rect(bx1, by2 + bh2 - harmonic / maxV * bh2, barW2, harmonic / maxV * bh2, 3);
    M2_fill('#C896FF', 0.8); rect(bx2, by2 + bh2 - arithmetic / maxV * bh2, barW2, arithmetic / maxV * bh2, 3);
    fill(200); textSize(10); textAlign(CENTER, TOP); noStroke();
    text('Harmonic', bx1 + barW2 / 2, by2 + bh2 + 5); text(harmonic.toFixed(1), bx1 + barW2 / 2, by2 + bh2 + 17);
    text('Arithmetic', bx2 + barW2 / 2, by2 + bh2 + 5); text(arithmetic.toFixed(1), bx2 + barW2 / 2, by2 + bh2 + 17);
    M2_drawFormulaBox(20, 20, 360, ['1st half at v\u2081=' + v1.toFixed(0) + ', 2nd half at v\u2082=' + v2.toFixed(0), 'Avg speed = 2v\u2081v\u2082/(v\u2081+v\u2082) = ' + harmonic.toFixed(1), 'Harmonic \u2264 Arithmetic (always)'], '#000000', '#FFFFFF');
  } else if (sub === 'magnitude_inequality') {
    var nlY6 = cy; var nl6 = M2_drawNumberLine(nlY6, 0, 100, '#AAAAAA', 10);
    var simT6 = (t * 0.3) % 3; var waypoints = [0, 40, 70, 30, 80];
    var totalSeg = waypoints.length - 1; var seg = constrain(Math.floor(simT6 / 3 * totalSeg), 0, totalSeg - 1);
    var segFrac = constrain((simT6 / 3 * totalSeg) - seg, 0, 1);
    var pos6 = waypoints[seg] + (waypoints[seg + 1] - waypoints[seg]) * segFrac;
    M2_drawParticle(nl6.x1 + (pos6 / 100) * (nl6.x2 - nl6.x1), nlY6, 8, '#fbbf24', '');
    var dist6 = 0; for (var di = 0; di < seg; di++) dist6 += Math.abs(waypoints[di + 1] - waypoints[di]);
    dist6 += Math.abs((waypoints[seg + 1] - waypoints[seg]) * segFrac);
    M2_drawFormulaBox(20, 30, 300, ['Distance = ' + dist6.toFixed(1) + 'm', 'Displacement = ' + (pos6 - waypoints[0]).toFixed(1) + 'm'], '#000000', '#FFFFFF');
  // --- EPIC-C: distance_equals_displacement_always branch ---
  } else if (sub === 'dvd_wrong_equal') {
    // STATE_1 WRONG BELIEF: path length = displacement
    noFill(); M2_stroke('#60a5fa', 0.8); strokeWeight(3);
    beginShape(); var ox = 80, oy = cy + 40;
    for (var ci = 0; ci <= 30; ci++) { var frac = ci / 30; vertex(ox + frac * 300, oy - 80 * Math.sin(frac * Math.PI)); } endShape();
    M2_drawParticle(ox, oy, 7, '#34d399', 'A'); M2_drawParticle(ox + 300, oy, 7, '#ef4444', 'B');
    M2_fill('#ef4444', 0.9); noStroke(); textSize(16); textAlign(CENTER, CENTER);
    text('Path = 50m', cx, oy - 100);
    text('"displacement = 50m"', cx, oy + 40);
    M2_projWatermark('Belief: path length = displacement', '#ef4444');
    M2_textBox(cx - 80, oy + 65, 'WRONG! Path \u2260 displacement', '#ef4444', 12);
  } else if (sub === 'dvd_path_vs_straight') {
    // STATE_2: same path, arrow A→B = displacement, curve = distance
    noFill(); M2_stroke('#60a5fa', 0.8); strokeWeight(3);
    var ox = 80, oy = cy + 20;
    beginShape(); for (var ci2 = 0; ci2 <= 30; ci2++) { var f2 = ci2 / 30; vertex(ox + f2 * 300, oy - 80 * Math.sin(f2 * Math.PI)); } endShape();
    M2_drawParticle(ox, oy, 7, '#34d399', 'A'); M2_drawParticle(ox + 300, oy, 7, '#ef4444', 'B');
    M2_newArrow(ox, oy + 25, ox + 300, oy + 25, '#fbbf24', 'displacement = 30m');
    M2_textBox(cx - 40, oy - 100, 'distance = 50m', '#60a5fa', 13);
    M2_drawFormulaBox(20, 20, 320, ['Distance: along curved path = 50m', 'Displacement: straight A\u2192B = 30m', 'distance > displacement here!'], '#000000', '#fbbf24');
  } else if (sub === 'dvd_round_trip_proof') {
    // STATE_3: full circle → distance = circumference, displacement = 0
    var r = 80, scx = cx, scy = cy;
    noFill(); M2_stroke('#60a5fa', 0.8); strokeWeight(3);
    var progress3 = constrain(t * 0.3, 0, 1);
    arc(scx, scy, r * 2, r * 2, 0, progress3 * 2 * Math.PI);
    var px = scx + r * Math.cos(progress3 * 2 * Math.PI), py = scy + r * Math.sin(progress3 * 2 * Math.PI);
    M2_drawParticle(px, py, 7, '#fbbf24', '');
    M2_drawParticle(scx + r, scy, 7, '#34d399', 'Start');
    if (progress3 > 0.95) { M2_fill('#ef4444', 0.9); noStroke(); textSize(18); textAlign(CENTER, CENTER); text('Displacement = 0', cx, scy + r + 40); }
    M2_drawFormulaBox(20, 20, 300, ['Full circle: distance = 2\u03C0r', 'But displacement = 0!', '"Start = End \u2192 displacement=0"'], '#000000', '#fbbf24');
  } else if (sub === 'dvd_aha_direction_matters') {
    // STATE_4: number line, go right 8m, come back 3m
    var nlY = cy; var nl = M2_drawNumberLine(nlY, 0, 12, '#AAAAAA', 12);
    var simT4 = constrain(t * 0.4, 0, 2);
    var pos4 = simT4 < 1 ? 8 * simT4 : 8 - 3 * (simT4 - 1);
    var px4 = nl.x1 + (pos4 / 12) * (nl.x2 - nl.x1);
    M2_drawParticle(px4, nlY, 8, '#fbbf24', '');
    if (simT4 < 1) { M2_stroke('#60a5fa', 0.4); strokeWeight(3); line(nl.x1, nlY - 8, px4, nlY - 8); }
    else { M2_stroke('#60a5fa', 0.4); strokeWeight(3); var x8 = nl.x1 + (8 / 12) * (nl.x2 - nl.x1); line(nl.x1, nlY - 8, x8, nlY - 8); M2_stroke('#ef4444', 0.4); line(x8, nlY - 12, px4, nlY - 12); }
    M2_drawFormulaBox(20, 30, 320, ['Go right 8m, come back 3m', 'Distance = 8+3 = 11m', 'Displacement = 8\u22123 = 5m (right)'], '#000000', '#fbbf24');
  } else if (sub === 'distance_equals_displacement_always_s5') {
    // STATE_5: formula comparison frozen
    M2_drawFormulaBox(cx - 180, 40, 360, ['distance \u2265 |displacement|   ALWAYS', '', 'Example 1: straight line \u2192 equal', 'Example 2: curved path \u2192 distance > disp', 'Example 3: round trip \u2192 disp = 0'], '#000000', '#fbbf24');
    M2_fill('#34d399', 1.0); noStroke(); textSize(16); textAlign(CENTER, CENTER);
    text('\u2713  distance \u2265 |displacement|', cx, height - 60);
  } else if (sub === 'distance_equals_displacement_always_s6') {
    // STATE_6 aha: equal ONLY when straight + no reversal
    M2_drawFormulaBox(cx - 190, cy - 80, 380, ['Equal ONLY when:', '  \u2022 Path is perfectly straight', '  \u2022 No direction reversal', '', 'All other cases: distance > |displacement|'], '#000000', '#34d399');
    M2_fill('#34d399', 1.0); noStroke(); textSize(24); textAlign(CENTER, CENTER); text('\u2713', cx + 150, cy - 50);
  // --- EPIC-C: displacement_cannot_be_negative branch ---
  } else if (sub === 'dvd_wrong_always_positive') {
    // STATE_1 WRONG BELIEF: displacement always positive
    var nlY = cy; var nl = M2_drawNumberLine(nlY, 0, 10, '#AAAAAA', 10);
    var x5pos = nl.x1 + 0.5 * (nl.x2 - nl.x1), x2pos = nl.x1 + 0.2 * (nl.x2 - nl.x1);
    M2_drawParticle(x5pos, nlY - 20, 7, '#60a5fa', 'x=5');
    M2_drawParticle(x2pos, nlY - 20, 7, '#ef4444', 'x=2');
    M2_newArrow(x5pos, nlY + 20, x2pos, nlY + 20, '#888888', '');
    M2_fill('#ef4444', 0.9); noStroke(); textSize(18); textAlign(CENTER, CENTER);
    text('"displacement = 3m"', cx, nlY + 60);
    M2_projWatermark('Belief: displacement always positive', '#ef4444');
    M2_textBox(cx - 80, nlY + 85, 'Magnitude only? WRONG!', '#ef4444', 12);
  } else if (sub === 'dvd_direction_gives_sign') {
    // STATE_2: arrow LEFT → Δx = 2−5 = −3m
    var nlY = cy; var nl = M2_drawNumberLine(nlY, 0, 10, '#AAAAAA', 10);
    var x5pos = nl.x1 + 0.5 * (nl.x2 - nl.x1), x2pos = nl.x1 + 0.2 * (nl.x2 - nl.x1);
    M2_drawParticle(x5pos, nlY - 20, 7, '#60a5fa', 'start=5');
    M2_drawParticle(x2pos, nlY - 20, 7, '#34d399', 'end=2');
    M2_newArrow(x5pos, nlY + 25, x2pos, nlY + 25, '#fbbf24', '\u0394x = 2\u22125 = \u22123m');
    M2_drawFormulaBox(20, 30, 340, ['\u0394x = x_final \u2212 x_initial = 2\u22125 = \u22123m', 'Negative sign = moved LEFT', 'Sign encodes direction!'], '#000000', '#fbbf24');
  } else if (sub === 'dvd_aha_can_be_zero') {
    // STATE_3: convention — rightward positive, leftward negative
    var nlY = cy - 40; var nl = M2_drawNumberLine(nlY, -5, 5, '#AAAAAA', 10);
    var midX = nl.x1 + 0.5 * (nl.x2 - nl.x1);
    M2_newArrow(midX, nlY + 30, midX + 80, nlY + 30, '#34d399', '+ve (right)');
    M2_newArrow(midX, nlY + 55, midX - 80, nlY + 55, '#ef4444', '\u2212ve (left)');
    M2_drawFormulaBox(20, 20, 340, ['Convention: rightward = positive', '  Move right 3m \u2192 \u0394x = +3m', '  Move left 4m \u2192 \u0394x = \u22124m'], '#000000', '#fbbf24');
  } else if (sub === 'displacement_cannot_be_negative_s4') {
    // STATE_4 aha: displacement is a vector, sign = direction
    M2_drawFormulaBox(cx - 190, cy - 60, 380, ['Displacement is a VECTOR', 'Sign carries direction information', '', 'Distance = 3m (always positive)', 'Displacement = \u22123m (negative = left)'], '#000000', '#34d399');
    M2_fill('#34d399', 1.0); noStroke(); textSize(24); textAlign(CENTER, CENTER); text('\u2713', cx + 150, cy - 30);
  } else if (sub === 'average_speed_equals_magnitude_average_velocity_s1') {
    var cx=width/2, cy=height/2;
    var r=90, scx=cx, scy=cy+10;
    noFill(); M2_stroke('#60a5fa',0.8); strokeWeight(2); arc(scx,scy,r*2,r*2,Math.PI,2*Math.PI);
    M2_drawParticle(scx-r,scy,6,'#34d399','A'); M2_drawParticle(scx+r,scy,6,'#ef4444','B');
    M2_drawFormulaBox(20,20,width-40,['Distance = πr (semicircle path)','|Displacement| = 2r (straight A→B)','Avg speed = πr/t   |Avg velocity| = 2r/t','π/2 ≈ 1.57 — they are DIFFERENT!'],'#000000','#fbbf24');
    M2_projWatermark('Belief: always equal','#ef4444');

  } else if (sub === 'average_speed_equals_magnitude_average_velocity_s2') {
    var cx=width/2, cy=height/2;
    var r2=70, scx2=cx-60, scy2=cy;
    noFill(); M2_stroke('#60a5fa',0.6); strokeWeight(2); arc(scx2,scy2,r2*2,r2*2,Math.PI,2*Math.PI);
    M2_newArrow(scx2-r2,scy2+20,scx2+r2,scy2+20,'#fbbf24','Displacement=2r');
    M2_fill('#60a5fa',0.8); noStroke(); textSize(10); textAlign(CENTER,BOTTOM);
    text('Path=πr≈'+( Math.PI*r2).toFixed(0)+'px',scx2,scy2-r2-5);
    M2_drawFormulaBox(cx+20,40,width/2-30,['Avg speed = πr/t = '+Math.PI.toFixed(2)+'r/t','|Avg velocity| = 2r/t','Ratio = π/2 ≈ 1.57','Not equal!'],'#000000','#FFFFFF');

  } else if (sub === 'average_speed_equals_magnitude_average_velocity_s3') {
    var cx=width/2, cy=height/2;
    var r3=70, scx3=cx, scy3=cy;
    noFill(); M2_stroke('#60a5fa',0.7); strokeWeight(3); ellipse(scx3,scy3,r3*2,r3*2);
    M2_drawParticle(scx3+r3,scy3,6,'#34d399','Start/End');
    M2_fill('#ef4444',0.9); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text('Displacement = 0!',cx,scy3+r3+30);
    M2_fill('#34d399',0.9); textSize(14); text('But distance = 2πr > 0',cx,scy3+r3+55);
    M2_textBox(20,height-30,'Full circle: avg speed ≠ 0, avg velocity = 0/T = 0','#fbbf24',12);

  } else if (sub === 'average_speed_equals_magnitude_average_velocity_s4') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Equal ONLY when: straight line AND no reversal','','Case 1 (straight, no reversal): speed = |velocity| ✓','Case 2 (curved path): speed > |velocity| ✗','Case 3 (reversal): speed > |velocity| ✗','Case 4 (full circle): speed > 0, |velocity| = 0 ✗'],'#000000','#fbbf24');

  } else if (sub === 'average_speed_equals_magnitude_average_velocity_s5') {
    var cx=width/2, cy=height/2;
    var items5=[
      {q:'Avg speed can be zero while moving?',ans:'FALSE',why:'Speed=distance/t > 0 if particle moved',col:'#ef4444',y:50},
      {q:'Avg velocity can be zero while moving?',ans:'TRUE',why:'Full circle example: net displacement=0',col:'#34d399',y:140},
      {q:'Avg speed ≥ |avg velocity|?',ans:'ALWAYS TRUE',why:'distance ≥ |displacement|',col:'#34d399',y:230}
    ];
    for(var ii5=0;ii5<3;ii5++){
      var it5=items5[ii5];
      M2_fill('#000000',0.4); noStroke(); rect(20,it5.y,width-40,70,4);
      fill(200); textSize(11); textAlign(LEFT,TOP); text(it5.q,30,it5.y+6);
      fill(M2_rgb(it5.col)[0],M2_rgb(it5.col)[1],M2_rgb(it5.col)[2]);
      textSize(13); textAlign(RIGHT,TOP); text(it5.ans,width-30,it5.y+6);
      fill(160); textSize(10); textAlign(LEFT,TOP); text(it5.why,30,it5.y+30);
    }

  } else if (sub === 's_in_equations_is_distance_s1') {
    var cx=width/2, cy=height/2;
    var u1=40, a1=-10, t1=6;
    var s1=u1*t1+0.5*a1*t1*t1;
    M2_fill('#ef4444',0.9); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('Using s=ut+½at²:',cx,cy-60);
    text('s = 40(6) - 5(36) = 240-180 = 60m',cx,cy-35);
    text('"Distance = 60m"???',cx,cy-10);
    M2_projWatermark('Belief: s formula gives distance','#ef4444');
    M2_drawFormulaBox(20,height-60,width-40,['But ball went UP 80m then DOWN 20m','Distance = 80+20 = 100m ≠ 60m!','s=60m is the DISPLACEMENT, not distance'],'#000000','#ef4444');

  } else if (sub === 's_in_equations_is_distance_s2') {
    var cx=width/2, cy=height/2;
    var u2=40, g2=10, tMax2=8;
    var gox=80, goy=height-50, gw=width-160, gh=200;
    M2_drawAxes(gox,goy,gw,gh,'t(s)','','#555566');
    M2_stroke('#60a5fa',0.9); strokeWeight(2); noFill(); beginShape();
    for(var i2=0;i2<=40;i2++){ var ti2=i2/40*tMax2; vertex(gox+(ti2/tMax2)*gw,goy-(u2*ti2-5*ti2*ti2)/200*gh);}
    endShape();
    var t0=u2/g2;
    var x0=gox+(t0/tMax2)*gw;
    stroke(255,255,255,100); strokeWeight(1); line(x0,goy,x0,goy-gh);
    M2_fill('#fbbf24',1.0); noStroke(); textSize(10); textAlign(CENTER,BOTTOM);
    text('t₀=4s (turning point)',x0,goy-gh+5);
    M2_drawFormulaBox(20,20,width-40,['Ball at t=6s: s=60m (displacement above start)','But distance: 80m up + 20m down = 100m','Before t₀=4s: distance=displacement. After: they differ.'],'#000000','#fbbf24');

  } else if (sub === 's_in_equations_is_distance_s3') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Step 1: Check if u and a are in SAME direction or OPPOSITE','','Same direction → s = d (use formula for both)','Opposite direction → find turning point first!','','t₀ = |u/a| = turning point time','Before t₀: s = d     After t₀: s ≠ d'],'#000000','#fbbf24');
    M2_fill('#fbbf24',0.9); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('t₀ = |u/a| is the critical step',cx,height-50);

  } else if (sub === 's_in_equations_is_distance_s4') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Distance when reversal occurs:','d = (u²/2|a|) + ½|a|(t-t₀)²  for t > t₀','','Example: u=40, a=-10, t=6','t₀ = 40/10 = 4s (turning point)','d₁ = 40²/(2×10) = 80m (to turning point)','d₂ = ½×10×(6-4)² = 20m (back from turning point)','Total distance = 80+20 = 100m','But s = 60m (displacement)'],'#000000','#FFFFFF');

  } else if (sub === 's_in_equations_is_distance_s5') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.4); noStroke(); rect(20,50,width-40,80,4); rect(20,160,width-40,80,4); rect(20,270,width-40,80,4);
    fill(200); textSize(11); textAlign(LEFT,TOP);
    text('u and a: SAME direction → no reversal → s = d (use formula for both)',30,57);
    text('u and a: OPPOSITE, t ≤ t₀ → not yet reversed → s = d',30,167);
    text('u and a: OPPOSITE, t > t₀ → reversed! → s ≠ d (calculate separately)',30,277);
    M2_fill('#34d399',0.9); noStroke(); textSize(10); textAlign(RIGHT,TOP);
    text('Safe',width-30,57); text('Safe',width-30,167);
    M2_fill('#ef4444',0.9); text('Danger zone!',width-30,277);

  } else if (sub === 's_in_equations_is_distance_s6') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,20,width-80,['DC Pandey Example 6.15','u=40m/s upward, g=10m/s², t₀=4s','','(a) t=2s < t₀: s=d=40(2)-5(4)=60m','(b) t=4s = t₀: s=d=40(4)-5(16)=80m (maximum!)','(c) t=6s > t₀: s=40(6)-5(36)=60m (displacement)','             d=80+20=100m (distance)'],'#000000','#fbbf24');

  } else if (sub === 's_in_equations_is_distance_s7') {
    var cx=width/2, cy=height/2;
    var u7=10, a7=-2, t7=8, t07=5;
    M2_drawFormulaBox(40,30,width-80,['u=10, a=-2, t=8: find distance','Step 1: t₀=|u/a|=10/2=5s (turning point)','Step 2: d₁=u²/2|a|=100/4=25m','Step 3: d₂=½|a|(t-t₀)²=½×2×9=9m','Step 4: d=25+9=34m','','Displacement: s=10(8)-½×2×64=80-64=16m','d=34m ≠ s=16m  ← the difference matters!'],'#000000','#FFFFFF');

  } else if (sub === 'instantaneous_vs_average_confusion_s1') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: v = x(t)/t','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['x(t) = 2t²+4t','Student: v at t=2 = x(2)/2 = 24/2 = 12 m/s?','But wait — x(2) = 8+8 = 16, not 24','Correct instantaneous v at t=2: use dx/dt = 4t+4 = 12','Avg velocity 0→2: (16-0)/2 = 8 m/s — different!'],'#000000','#ef4444');

  } else if (sub === 'instantaneous_vs_average_confusion_s2') {
    var cx=width/2, cy=height/2;
    var gox=80, goy=height-60, gw=width-160, gh=240;
    M2_drawAxes(gox,goy,gw,gh,'t','x','#555566');
    M2_stroke('#60a5fa',0.9); strokeWeight(2); noFill(); beginShape();
    for(var i2=0;i2<=30;i2++){ var ti2=i2/30*4; vertex(gox+(ti2/4)*gw,goy-((2*ti2*ti2+4*ti2)/40)*gh);}
    endShape();
    var t1=1, t2=3, x1=2+4, x2=18+12;
    var c1x=gox+(t1/4)*gw, c2x=gox+(t2/4)*gw;
    var c1y=goy-(x1/40)*gh, c2y=goy-(x2/40)*gh;
    M2_stroke('#ef4444',0.8); strokeWeight(2); line(c1x,c1y,c2x,c2y);
    M2_fill('#ef4444',0.8); noStroke(); textSize(10); textAlign(CENTER,BOTTOM);
    text('Secant = avg velocity',( c1x+c2x)/2,(c1y+c2y)/2-5);
    M2_stroke('#fbbf24',0.8); strokeWeight(2); var tang=4*(t1+t2)/2+4;
    line(c1x-30,c1y-tang*0.5,c1x+50,c1y+tang*0.5);
    M2_textBox(20,20,'Secant slope = average velocity. Tangent slope = instantaneous velocity.','#fbbf24',11);

  } else if (sub === 'instantaneous_vs_average_confusion_s3') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['x(t) = 2t²+4t','v(t) = dx/dt = 4t+4','At t=2: v = 4(2)+4 = 12 m/s  (instantaneous)','','Average velocity from t=0 to t=2:','  Δx/Δt = (16-0)/2 = 8 m/s','','12 m/s ≠ 8 m/s — they are different quantities!'],'#000000','#fbbf24');

  } else if (sub === 'instantaneous_vs_average_confusion_s4') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.4); noStroke(); rect(20,cy-80,width-40,160,6);
    fill(200); textSize(12); textAlign(CENTER,TOP);
    text('Limit process: Δt → 0',cx,cy-75);
    var dts=[0.5,0.1,0.01];
    for(var di4=0;di4<3;di4++){
      var dt=dts[di4], t4=2;
      var vavg=((2*(t4+dt)*(t4+dt)+4*(t4+dt))-(2*t4*t4+4*t4))/dt;
      M2_fill('#000000',0.3); noStroke(); rect(30,cy-50+di4*40,width-60,32,3);
      fill(200); textSize(11); textAlign(LEFT,CENTER); text('Δt='+dt+': Δx/Δt = '+vavg.toFixed(2)+' m/s',40,cy-34+di4*40);
    }
    M2_fill('#fbbf24',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('Converges to 12 m/s as Δt→0',cx,cy+80);

  } else if (sub === 'instantaneous_vs_average_confusion_s5') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Rule for JEE:','','Given x(t) → DIFFERENTIATE → v(t) = dx/dt','Then substitute t for instantaneous velocity','','Given velocity over interval → Δx/Δt for average','','Example: x=t³-6t','v=dx/dt=3t²-6, at t=2: v=12-6=6 m/s (not x(2)/2!)'],'#000000','#34d399');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_uniformAcceleration(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','constant_a_animation','v_u_at_equation','s_ut_half_at2_area','v2_u2_2as_equation','sign_convention_setup','three_equations_guide']; sub = fm[idx] || 'constant_a_animation'; } background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (sub === 'constant_a_animation') {
    var gox = 80, goy = height - 80, gw = width - 160, gh = 250;
    M2_drawAxes(gox, goy, gw, gh, 't', 'v', '#555566');
    var u = 5, a = 3, tMax = 4; var v_final = u + a * tMax; var vScale = gh / (v_final * 1.2);
    M2_stroke('#60a5fa', 0.9); strokeWeight(2.5); line(gox, goy - u * vScale, gox + gw, goy - v_final * vScale);
    var fillT = constrain(t * 0.5, 0, 1); var fillX = gox + fillT * gw;
    M2_fill('#60a5fa', 0.15); noStroke(); beginShape();
    vertex(gox, goy); vertex(gox, goy - u * vScale); vertex(fillX, goy - (u + a * fillT * tMax) * vScale); vertex(fillX, goy); endShape(CLOSE);
    fill(200); textSize(11); textAlign(RIGHT, CENTER); noStroke();
    text('u=' + u, gox - 5, goy - u * vScale); text('v=' + v_final.toFixed(0), gox - 5, goy - v_final * vScale);
    M2_drawFormulaBox(20, 20, 330, ['s = area of trapezoid = (u+v)t/2', 's = (' + u + '+' + v_final.toFixed(0) + ')\u00D7' + tMax + '/2 = ' + ((u + v_final) * tMax / 2).toFixed(0) + 'm', 'v = u+at = ' + v_final.toFixed(0) + ' m/s'], '#000000', '#fbbf24');
  } else if (sub === 'v_u_at_equation') {
    var pw = (width - 40) / 3, ph = height - 80;
    var eqns = ['v = u + at', 's = ut + \u00BDat\u00B2', 'v\u00B2 = u\u00B2 + 2as'];
    for (var ei = 0; ei < 3; ei++) {
      var ex = 20 + ei * (pw + 5), ey = 50;
      M2_fill('#000000', 0.3); noStroke(); rect(ex, ey, pw - 5, ph, 4);
      fill(200); textSize(12); textAlign(CENTER, TOP); text(eqns[ei], ex + pw / 2, ey + 5);
      var gx = ex + 20, gy = ey + ph - 20, gw2 = pw - 50, gh2 = ph - 60;
      M2_drawAxes(gx, gy, gw2, gh2, '', '', '#444455');
      M2_stroke(ei === 0 ? '#60a5fa' : ei === 1 ? '#34d399' : '#fbbf24', 0.9); strokeWeight(2); noFill();
      beginShape(); for (var pi = 0; pi <= 30; pi++) { var tf = pi / 30; var yv; if (ei === 0) yv = tf; else if (ei === 1) yv = tf * tf; else yv = Math.sqrt(tf); vertex(gx + tf * gw2, gy - yv * gh2 * 0.8); } endShape();
    }
  } else if (sub === 's_ut_half_at2_area') {
    var trackY = cy - 20; stroke(100); strokeWeight(2); line(30, trackY, width - 30, trackY);
    var a3 = 2; var cols3 = ['#60a5fa', '#34d399', '#fbbf24', '#C896FF', '#ef4444'];
    for (var ni = 0; ni < 5; ni++) {
      var sn = 0.5 * a3 * (ni + 1) * (ni + 1); var sn_prev = ni === 0 ? 0 : 0.5 * a3 * ni * ni; var segDist = sn - sn_prev;
      var px1 = 50 + sn_prev * 8, px2 = 50 + sn * 8;
      M2_fill(cols3[ni % 5], 0.3); noStroke(); rect(px1, trackY - 20, px2 - px1, 40, 2);
      M2_fill(cols3[ni % 5], 0.9); textSize(10); textAlign(CENTER, CENTER); text(segDist.toFixed(0) + 'm', (px1 + px2) / 2, trackY);
    }
    M2_drawFormulaBox(20, 20, 360, ['From rest: sn = \u00BDa(2n-1)', 'Ratio 1:3:5:7:9 (odd numbers!)'], '#000000', '#fbbf24');
  } else if (sub === 'v2_u2_2as_equation') {
    var H = 40, u4 = 10, g = 9.8; var tTotal = (u4 + Math.sqrt(u4 * u4 + 2 * g * H)) / g;
    var simT4 = (t * 0.3) % (tTotal + 0.5); var y4 = H + u4 * simT4 - 0.5 * g * simT4 * simT4; if (y4 < 0) y4 = 0;
    var towerX = cx - 80, groundY = height - 50, towerTop = groundY - H * 3;
    M2_fill('#555555', 0.8); noStroke(); rect(towerX - 15, towerTop, 30, H * 3, 2);
    stroke(150); strokeWeight(1); line(20, groundY, width - 20, groundY);
    M2_drawParticle(towerX, constrain(groundY - y4 * 3, 30, groundY), 8, '#fbbf24', '');
    M2_drawFormulaBox(cx, 20, 320, ['H=40m, u=+10m/s, g=-9.8m/s\u00B2', 's=-40m (down)', '-40 = 10t - 4.9t\u00B2', 't \u2248 ' + tTotal.toFixed(2) + 's (one equation!)'], '#000000', '#FFFFFF');
  } else if (sub === 'sign_convention_setup') {
    var gox5 = 80, goy5 = height - 60, gw5 = width - 160, gh5 = 300;
    M2_drawAxes(gox5, goy5, gw5, gh5, 't(s)', 'v(m/s)', '#555566');
    var u5 = 10, a5 = 4, tMax5 = 5; var vScale5 = gh5 / 35;
    M2_stroke('#60a5fa', 0.9); strokeWeight(2.5);
    line(gox5, goy5 - u5 * vScale5, gox5 + gw5, goy5 - (u5 + a5 * tMax5) * vScale5);
    var curT5 = M2_getCanvasSliderVal('vtCur', 0, 5, 2, height - 30, 'Cursor t(s)');
    var curX5 = gox5 + (curT5 / tMax5) * gw5; var curV5 = u5 + a5 * curT5;
    stroke(255, 255, 255, 150); strokeWeight(1); line(curX5, goy5, curX5, goy5 - gh5);
    M2_fill('#fbbf24', 1.0); noStroke(); ellipse(curX5, goy5 - curV5 * vScale5, 8, 8);
    M2_drawFormulaBox(20, 20, 320, ['u=' + u5 + ' m/s, a=' + a5 + ' m/s\u00B2', 'At t=' + curT5.toFixed(1) + ': v=' + curV5.toFixed(1), 's = ' + (u5 * curT5 + 0.5 * a5 * curT5 * curT5).toFixed(1) + 'm'], '#000000', '#FFFFFF');
  } else if (sub === 'three_equations_guide') {
    M2_drawFormulaBox(20, 20, 360, ['From rest with uniform a:', 'Distance in nth second: sn = \u00BDa(2n-1)', 'Ratio: 1:3:5:7 (odd numbers)', '', 'Distance in first n seconds: Sn = \u00BDan\u00B2', 'Ratio: 1:4:9:16 (perfect squares)'], '#000000', '#FFFFFF');
    var bx6 = 50, by6 = height - 150, bw6 = 40;
    var odds = [1, 3, 5, 7]; var squares = [1, 4, 9, 16];
    for (var ri = 0; ri < 4; ri++) {
      M2_fill('#60a5fa', 0.7); noStroke(); rect(bx6 + ri * 50, by6 - odds[ri] * 12, bw6, odds[ri] * 12, 2);
      fill(200); textSize(9); textAlign(CENTER, TOP); text(odds[ri], bx6 + ri * 50 + bw6 / 2, by6 + 3);
      M2_fill('#fbbf24', 0.7); rect(bx6 + 250 + ri * 50, by6 - squares[ri] * 5, bw6, squares[ri] * 5, 2);
      fill(200); text(squares[ri], bx6 + 250 + ri * 50 + bw6 / 2, by6 + 3);
    }
  // --- EPIC-C: retardation_means_negative_acceleration branch ---
  } else if (sub === 'ua_wrong_deceleration_different') {
    // STATE_1 WRONG BELIEF: retardation is a separate quantity
    var trackY = cy + 30; stroke(100); strokeWeight(2); line(30, trackY, width - 30, trackY);
    var carX = constrain(width - 80 - t * 15, 80, width - 80);
    M2_fill('#60a5fa', 0.9); noStroke(); rect(carX - 20, trackY - 15, 40, 12, 3);
    M2_newArrow(carX + 25, trackY - 10, carX + 55, trackY - 10, '#34d399', 'v \u2192');
    M2_fill('#ef4444', 0.9); noStroke(); textSize(14); textAlign(CENTER, CENTER);
    text('"retardation = +5"', carX, trackY - 45);
    M2_textBox(carX - 60, trackY - 70, '(treated as separate quantity)', '#888888', 10);
    M2_projWatermark('Belief: retardation \u2260 acceleration', '#ef4444');
  } else if (sub === 'ua_sign_is_direction') {
    // STATE_2: velocity arrow shrinking, acceleration arrow LEFT
    var trackY = cy + 30; stroke(100); strokeWeight(2); line(30, trackY, width - 30, trackY);
    var simT = constrain(t * 0.3, 0, 3); var v = 30 - 5 * simT; var carX2 = 80 + (30 * simT - 2.5 * simT * simT) * 4;
    M2_fill('#60a5fa', 0.9); noStroke(); rect(carX2 - 20, trackY - 15, 40, 12, 3);
    if (v > 0) M2_newArrow(carX2 + 25, trackY - 8, carX2 + 25 + v * 1.5, trackY - 8, '#34d399', 'v=' + v.toFixed(0));
    M2_newArrow(carX2 - 25, trackY - 8, carX2 - 65, trackY - 8, '#ef4444', 'a=\u22125');
    M2_drawFormulaBox(20, 20, 340, ['v shrinks \u2192 a opposes motion', 'a = \u22125 m/s\u00B2 (negative = leftward)', '"Retardation" = negative acceleration'], '#000000', '#fbbf24');
  } else if (sub === 'ua_aha_sign_convention') {
    // STATE_3: two cases — speeding up vs slowing down
    M2_fill('#000000', 0.3); noStroke(); rect(15, 50, width / 2 - 25, height - 100, 4);
    M2_fill('#000000', 0.3); rect(width / 2 + 10, 50, width / 2 - 25, height - 100, 4);
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke();
    text('Speeding up', width / 4, 55); text('Slowing down', width * 3 / 4, 55);
    M2_newArrow(50, cy, 130, cy, '#34d399', 'v \u2192'); M2_newArrow(50, cy + 30, 130, cy + 30, '#34d399', 'a \u2192');
    M2_textBox(40, cy + 55, 'Same direction \u2192 a > 0', '#34d399', 10);
    var ox2 = width / 2 + 30;
    M2_newArrow(ox2, cy, ox2 + 80, cy, '#34d399', 'v \u2192'); M2_newArrow(ox2 + 80, cy + 30, ox2, cy + 30, '#ef4444', 'a \u2190');
    M2_textBox(ox2 - 10, cy + 55, 'Opposite direction \u2192 a < 0', '#ef4444', 10);
  } else if (sub === 'retardation_means_negative_acceleration_s4') {
    // STATE_4 aha: retardation IS acceleration, just negative
    M2_drawFormulaBox(cx - 190, cy - 60, 380, ['Retardation IS acceleration', 'just negative when opposing motion', '', 'a = \u22125 m/s\u00B2 = retardation of 5 m/s\u00B2', 'Same physical quantity, sign = direction'], '#000000', '#34d399');
    M2_fill('#34d399', 1.0); noStroke(); textSize(24); textAlign(CENTER, CENTER); text('\u2713', cx + 150, cy - 30);
  // --- EPIC-C: split_journey_into_two_parts branch ---
  } else if (sub === 'split_journey_into_two_parts_s1') {
    // STATE_1 WRONG BELIEF: different equations for up and down
    var ballY = cy - 60; var colUp = '#60a5fa', colDown = '#ef4444';
    M2_newArrow(cx - 100, ballY + 60, cx - 100, ballY - 40, colUp, 'UP');
    M2_newArrow(cx + 100, ballY - 40, cx + 100, ballY + 60, colDown, 'DOWN');
    M2_drawFormulaBox(cx - 200, 30, 180, ['Going UP:', 'v = u \u2212 at', '("deceleration")'], '#000000', colUp);
    M2_drawFormulaBox(cx + 20, 30, 180, ['Coming DOWN:', 'v = u + at', '("acceleration")'], '#000000', colDown);
    M2_projWatermark('Belief: need 2 equations', '#ef4444');
    M2_textBox(cx - 100, height - 50, 'TWO separate equations? WRONG!', '#ef4444', 12);
  } else if (sub === 'split_journey_into_two_parts_s2') {
    // STATE_2: fix — define UP as positive ONCE, a = −10 throughout
    M2_newArrow(cx, cy + 60, cx, cy - 80, '#34d399', 'UP = +ve');
    M2_drawFormulaBox(20, 20, 380, ['Define: UP = positive (once!)', 'Then a = \u221210 m/s\u00B2 throughout', '', 'ONE equation: v = u + at', 'Works for ENTIRE journey'], '#000000', '#34d399');
    M2_fill('#fbbf24', 0.9); noStroke(); textSize(14); textAlign(CENTER, CENTER);
    text('v = u + (\u221210)t = u \u2212 10t', cx, height - 50);
    text('Same equation, always!', cx, height - 30);
  } else if (sub === 'split_journey_into_two_parts_s3') {
    // STATE_3: numerical example through entire journey
    var gox = 80, goy = height - 60, gw = width - 160, gh = 200;
    M2_drawAxes(gox, goy, gw, gh, 't(s)', 'v(m/s)', '#555566');
    var u = 20, a = -10, tMax = 4; var vScale = gh / 30;
    M2_stroke('#60a5fa', 0.9); strokeWeight(2);
    line(gox, goy - u * vScale, gox + gw, goy - (u + a * tMax) * vScale);
    stroke(255, 255, 255, 80); strokeWeight(1); line(gox, goy, gox + gw, goy);
    var pts = [{t: 1, v: 10}, {t: 2, v: 0}, {t: 3, v: -10}];
    for (var pi = 0; pi < 3; pi++) {
      var px = gox + (pts[pi].t / tMax) * gw, py = goy - pts[pi].v * vScale;
      M2_fill('#fbbf24', 1.0); noStroke(); ellipse(px, py, 8, 8);
      M2_textBox(px - 25, py - 20, 't=' + pts[pi].t + ': v=' + pts[pi].v, '#fbbf24', 9);
    }
    M2_drawFormulaBox(20, 20, 360, ['u=20 m/s, a=\u221210 m/s\u00B2', 'v = 20 + (\u221210)t = 20\u221210t', 'One equation, entire journey!'], '#000000', '#34d399');
  } else if (sub === 'split_journey_into_two_parts_s4') {
    var cx=width/2, cy=height/2;
    M2_fill('#555555',0.5); noStroke(); rect(cx-60,cy-80,120,height*0.3,3);
    M2_fill('#60a5fa',0.9); noStroke(); ellipse(cx,cy-80,14,14);
    M2_newArrow(cx+20,cy-70,cx+20,cy-100,'#34d399','u=+10');
    M2_drawFormulaBox(20,20,width-40,['DC Pandey Example 6.13: ball from 40m tower','u=+10, a=-10, s=-40','s=ut+½at²: -40=10t-5t²','5t²-10t-40=0 → t=4s (reject t=-2)','ONE equation — no splitting needed!'],'#000000','#34d399');
    M2_textBox(20,height-30,'s=-40m because ground is 40m BELOW start','#fbbf24',11);

  } else if (sub === 'split_journey_into_two_parts_s5') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['When DOES splitting help?','','Only if question asks about PHASE 1 ONLY','  (e.g., "find maximum height" — Phase 1 only)','For max height: set v=0, use v²=u²+2as (one equation!)','','Splitting is NEVER required. Default: one equation.','Split only as convenience, never as necessity.'],'#000000','#fbbf24');

  } else if (sub === 'split_journey_into_two_parts_s6') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Practice: ball dropped from 80m (u=0, a=-10)','Find velocity on impact','','Split method: v=√(2gh)=√1600=40 m/s','One-equation: v²=u²+2as: v²=0+2(-10)(-80)=1600 → v=-40 m/s','','Same answer. One-equation is 1 step. Split is 2 steps.','','Default to one equation with signs. Always.'],'#000000','#34d399');

  } else if (sub === 'ua_wrong_s_is_distance') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: s = distance','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['s = ut + ½at²','What does "s" represent?','Student belief: s = total distance traveled','Correct: s = DISPLACEMENT from starting point','These are different when reversal occurs!'],'#000000','#ef4444');

  } else if (sub === 'ua_s_is_displacement') {
    var cx=width/2, cy=height/2;
    var nlY=cy; var nl=M2_drawNumberLine(nlY,0,100,'#AAAAAA',10);
    var t1=1.5, u1=40, a1=-10;
    var pos1=u1*t1+0.5*a1*t1*t1;
    M2_drawParticle(nl.x1+(pos1/100)*(nl.x2-nl.x1),nlY,8,'#fbbf24','s='+pos1.toFixed(0)+'m');
    M2_fill('#60a5fa',0.8); noStroke(); ellipse(nl.x1,nlY-20,8,8);
    M2_textBox(nl.x1-5,nlY+10,'Start=0',  '#60a5fa',9);
    M2_drawFormulaBox(20,30,width-40,['s = signed change in position from START','s can be positive, zero, or negative','At t='+t1.toFixed(1)+'s: s='+pos1.toFixed(0)+'m (still above start)'],'#000000','#fbbf24');

  } else if (sub === 'ua_direction_reversal_case') {
    var cx=width/2, cy=height/2;
    var gox=80, goy=height-50, gw=width-160, gh=200, u2=30, g2=10, tMax2=7;
    M2_drawAxes(gox,goy,gw,gh,'t(s)','s(m)','#555566');
    M2_stroke('#60a5fa',0.9); strokeWeight(2); noFill(); beginShape();
    for(var i2=0;i2<=40;i2++){var ti2=i2/40*tMax2; var si2=u2*ti2-0.5*g2*ti2*ti2; if(si2<-60)si2=-60; vertex(gox+(ti2/tMax2)*gw,goy-(si2/60)*gh*0.7);}
    endShape();
    var t02=3, x02=gox+(t02/tMax2)*gw;
    stroke(255,220,0,180); strokeWeight(1); line(x02,goy,x02,goy-gh);
    M2_fill('#fbbf24',0.9); noStroke(); textSize(10); textAlign(CENTER,BOTTOM);
    text('t₀='+t02+'s max',x02,goy-gh+5);
    M2_textBox(20,20,'x-t curve: rises then falls — turning point at t₀','#fbbf24',11);

  } else if (sub === 'ua_aha_split_intervals') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['The turning point t₀ = |u/a| separates two regimes:','','t < t₀: s = d (no reversal yet — safe to equate)','t = t₀: maximum displacement (velocity = 0)','t > t₀: s < d (reversal has occurred — they differ)','','Distance formula for t > t₀:','d = u²/(2|a|) + ½|a|(t-t₀)²'],'#000000','#fbbf24');

  } else if (sub === 'sign_convention_inconsistency_s5') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['JEE-ready format:','','Before any equation, write:','"Taking upward as positive:"','Then: u=+v₀, a=-g=-10 m/s²','','This forces commitment — no mid-problem switching','DC Pandey does this in EVERY worked example','','Writing convention explicitly = fewer errors'],'#000000','#34d399');

  } else if (sub === 'which_equation_confusion_s1') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: always start with v=u+at','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['Problem: find max height (v=0 at top)','Student: v=u+at → 0=u-10t → t=u/10','Then: s=ut+½at² → substitutes t','2 steps, 2 equations','','Direct: v²=u²+2as → 0=u²-2(10)H → H=u²/20','1 step! Time never appears.'],'#000000','#ef4444');

  } else if (sub === 'which_equation_confusion_s2') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Missing variable method:','','v=u+at        — missing: s (no displacement)','v²=u²+2as    — missing: t (no time)','s=ut+½at²   — missing: v (no final velocity)','','Identify which variable you DON\\u0027T need','Select the equation that DOESN\\u0027T have it','1 equation, 1 unknown — done!'],'#000000','#fbbf24');

  } else if (sub === 'which_equation_confusion_s3') {
    var cx=width/2, cy=height/2;
    var types3=[
      {q:'Find max height',ans:'v²=u²+2as  (v=0 at top, no time needed)',y:50},
      {q:'Find time to hit ground',ans:'s=ut+½at²  (no final velocity needed)',y:140},
      {q:'Find velocity at height h',ans:'v²=u²+2as  (no time needed)',y:230}
    ];
    for(var ti3=0;ti3<3;ti3++){
      var tp=types3[ti3];
      M2_fill('#000000',0.4); noStroke(); rect(20,tp.y,width-40,70,4);
      fill(200); textSize(11); textAlign(LEFT,TOP); text(tp.q,30,tp.y+6);
      M2_fill('#34d399',0.8); noStroke(); textSize(10); textAlign(LEFT,TOP); text('→ '+tp.ans,30,tp.y+30);
    }

  } else if (sub === 'which_equation_confusion_s4') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['When TWO equations ARE needed:','','Case 1: Two unknowns (e.g., find both t and H)','Case 2: Ball at same height TWICE (quadratic)','  → Both roots t₁, t₂ are valid times','  → Use Vieta\\u0027s: t₁+t₂=2u/g, t₁t₂=2h/g','  → DC Pandey Example 6.14'],'#000000','#FFFFFF');

  } else if (sub === 'which_equation_confusion_s5') {
    var cx=width/2, cy=height/2;
    var probs5=[
      {given:'u=0, a=10, t=4',find:'s',eq:'s=ut+½at²',ans:'s=80m'},
      {given:'u=20, a=-5, v=0',find:'s',eq:'v²=u²+2as',ans:'s=40m'},
      {given:'u=15, a=-3, s=30',find:'t',eq:'s=ut+½at²',ans:'quadratic'},
      {given:'u=0, g=10, h=45',find:'v',eq:'v²=u²+2as',ans:'v=30m/s'}
    ];
    for(var pi5=0;pi5<4;pi5++){
      var p5=probs5[pi5];
      M2_fill('#000000',0.3); noStroke(); rect(20,30+pi5*65,width-40,58,3);
      fill(200); textSize(10); textAlign(LEFT,TOP);
      text('Given: '+p5.given,30,36+pi5*65);
      text('Find: '+p5.find,30,50+pi5*65);
      M2_fill('#fbbf24',0.8); noStroke(); textSize(10); textAlign(LEFT,TOP);
      text('→ '+p5.eq,30,64+pi5*65);
      M2_fill('#34d399',0.8); textAlign(RIGHT,TOP);
      text(p5.ans,width-30,64+pi5*65);
    }

  } else if (sub === 'sth_formula_wrong_use_s1') {
    var cx=width/2, cy=height/2;
    var u1=10, a1=2, t1=3;
    var sth=u1+a1*(t1-0.5);
    var stotal=u1*t1+0.5*a1*t1*t1;
    M2_projWatermark('Belief: sth = displacement at t','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['sth = u + a(t-½) with t=3: sth='+sth.toFixed(0)+'m','Student calls this "displacement at t=3"','Actual displacement at t=3: s=ut+½at²='+stotal.toFixed(0)+'m',''+sth.toFixed(0)+'≠'+stotal.toFixed(0)+'!  sth is displacement IN 3rd second only!'],'#000000','#ef4444');

  } else if (sub === 'sth_formula_wrong_use_s2') {
    var cx=width/2, cy=height/2;
    var u2=10, a2=2, tArr=[1,2,3];
    var sx2=[]; for(var ti=0;ti<=3;ti++) sx2.push(u2*ti+0.5*a2*ti*ti);
    var gox=80, goy=height-50, gw=width-160, gh=150;
    M2_drawAxes(gox,goy,gw,gh,'t(s)','s(m)','#555566');
    for(var ti2=0;ti2<4;ti2++){
      var px2=gox+(ti2/3)*gw, py2=goy-(sx2[ti2]/sx2[3])*gh*0.9;
      M2_fill('#60a5fa',0.8); noStroke(); ellipse(px2,py2,8,8);
      M2_textBox(px2-5,py2-18,sx2[ti2].toFixed(0),  '#60a5fa',9);
      if(ti2>0){ M2_stroke('#fbbf24',0.5); strokeWeight(3); var prevX=gox+((ti2-1)/3)*gw, prevY=goy-(sx2[ti2-1]/sx2[3])*gh*0.9; line(prevX,prevY,px2,prevY); line(px2,prevY,px2,py2); fill(255,200,40); textSize(9); textAlign(CENTER,BOTTOM); text('s'+ti2+'='+(sx2[ti2]-sx2[ti2-1]).toFixed(0),( prevX+px2)/2,prevY-3);}
    }
    M2_textBox(20,20,'sth = displacement IN the tth second = gap between positions','#fbbf24',11);

  } else if (sub === 'sth_formula_wrong_use_s3') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['When to use sth:','  → Question says "displacement IN the Nth second"','  → Question says "during the 3rd second"','','When NOT to use sth:','  → "displacement AFTER 3 seconds" → use s=ut+½at²','  → "where is particle at t=3s" → use s=ut+½at²','','The word "IN" or "during" → sth. "after" → suvat.'],'#000000','#fbbf24');

  } else if (sub === 'sth_formula_wrong_use_s4') {
    var cx=width/2, cy=height/2;
    var a4=10, ns=[1,2,3,4,5];
    var bars4=[1,3,5,7,9];
    var maxB=9, barW4=50, barH4=160, bx4=50;
    for(var bi4=0;bi4<5;bi4++){
      var bf4=bars4[bi4]/maxB*barH4;
      M2_fill('#60a5fa',0.7); noStroke(); rect(bx4+bi4*70,height-50-bf4,barW4,bf4,2);
      fill(200); textSize(10); textAlign(CENTER,TOP); text('s'+ns[bi4]+'='+bars4[bi4],bx4+bi4*70+barW4/2,height-48);
    }
    M2_textBox(cx-100,20,'From rest: distances in successive seconds = 1:3:5:7:9','#fbbf24',12);
    M2_drawFormulaBox(20,height-80,width-40,['sth = u + a(t-½). For u=0: sth = a(2t-1)/2','Ratio: 1:3:5:...(2n-1) — consecutive ODD numbers'],'#000000','#FFFFFF');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_nonUniformAcceleration(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','varying_a_animation','v_function_of_t','a_function_of_x','a_function_of_v','integration_for_s','method_decision_tree']; sub = fm[idx] || 'varying_a_animation'; } background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (sub === 'varying_a_animation') {
    var gox = 80, goy = height - 80, gw = width - 160, gh = 250;
    M2_drawAxes(gox, goy, gw, gh, 't(s)', 'v(m/s)', '#555566'); var tMax = 4;
    M2_stroke('#60a5fa', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var i = 0; i <= 30; i++) { var ti = i / 30 * tMax; vertex(gox + (ti / tMax) * gw, goy - (2 * ti / 12) * gh); } endShape();
    M2_stroke('#ef4444', 0.9); strokeWeight(2); beginShape();
    for (var j = 0; j <= 30; j++) { var tj = j / 30 * tMax; vertex(gox + (tj / tMax) * gw, goy - (tj * tj / 20) * gh); } endShape();
    var t3x = gox + (3 / tMax) * gw;
    stroke(255, 255, 255, 100); strokeWeight(1); line(t3x, goy, t3x, goy - gh);
    fill(200); textSize(10); textAlign(CENTER, BOTTOM); noStroke(); text('t=3', t3x, goy + 15);
    M2_drawFormulaBox(20, 20, 380, ['A(a=2): v=2t, at t=3: v=6  \u2714', 'B(a=2t): v=t\u00B2, at t=3: v=9', 'suvat gives v=0+2\u00D73=6 \u2718 WRONG for B!'], '#000000', '#FFFFFF');
    M2_fill('#60a5fa', 0.8); noStroke(); textSize(10); text('A(const a)', gox + gw + 5, goy - (2 * tMax / 12) * gh);
    M2_fill('#ef4444', 0.8); text('B(a=2t)', gox + gw + 5, goy - (tMax * tMax / 20) * gh);
  } else if (sub === 'v_function_of_t') {
    var steps = ['Given: dv/dt = 2t', '\u222Bdv = \u222B2t dt', 'v = t\u00B2 + C', 'At t=0, v=0 \u2192 C=0', 'v = t\u00B2', 'dx/dt = t\u00B2 \u2192 x = t\u00B3/3'];
    var showN = constrain(Math.floor(t * 0.8), 0, steps.length);
    for (var si = 0; si < showN; si++) {
      var ypos = 40 + si * 40; var col = si === showN - 1 ? '#fbbf24' : '#AAAAAA';
      M2_textBox(40, ypos, steps[si], col, 14);
      if (si < showN - 1) { M2_stroke('#555555', 0.5); strokeWeight(1); line(55, ypos + 22, 55, ypos + 38); M2_fill('#555555', 0.5); noStroke(); triangle(55, ypos + 40, 52, ypos + 36, 58, ypos + 36); }
    }
  } else if (sub === 'a_function_of_x') {
    M2_drawFormulaBox(30, 30, 400, ['Problem: a = kx', '', 'Cannot integrate a=dv/dt directly!', 'Chain rule: a = v(dv/dx)', '', 'v dv = kx dx', '\u222Bv dv = \u222Bkx dx', 'v\u00B2/2 = kx\u00B2/2 + C'], '#000000', '#FFFFFF');
    var stuckPhase = (t * 2) % 4;
    if (stuckPhase < 2) { M2_fill('#ef4444', 0.6 + 0.3 * Math.sin(t * 4)); noStroke(); textSize(14); textAlign(CENTER, CENTER); text('\u274C \u222Ba(x)dt = ??? (stuck!)', cx + 50, height - 60); }
    else { M2_fill('#34d399', 0.8); noStroke(); textSize(14); textAlign(CENTER, CENTER); text('\u2714 v dv = a(x) dx (unlocked!)', cx + 50, height - 60); }
  } else if (sub === 'a_function_of_v') {
    var g4 = 10, k4 = 2; var vTerm = g4 / k4;
    var gox4 = 80, goy4 = height - 60, gw4 = width - 160, gh4 = 300;
    M2_drawAxes(gox4, goy4, gw4, gh4, 't(s)', 'v(m/s)', '#555566');
    M2_stroke('#60a5fa', 0.9); strokeWeight(2.5); noFill(); beginShape();
    for (var vi = 0; vi <= 40; vi++) { var tv = vi / 40 * 5; var vv = vTerm * (1 - Math.exp(-k4 * tv)); vertex(gox4 + (tv / 5) * gw4, goy4 - (vv / (vTerm * 1.3)) * gh4); } endShape();
    var termY = goy4 - (vTerm / (vTerm * 1.3)) * gh4;
    M2_drawDashedLine(gox4, termY, gox4 + gw4, termY, '#fbbf24', 8, 5);
    fill(250, 190, 40); textSize(11); textAlign(LEFT, BOTTOM); noStroke(); text('v_terminal = ' + vTerm + ' m/s', gox4 + gw4 / 2, termY - 5);
    M2_drawFormulaBox(20, 20, 320, ['a = g\u2212kv (skydiver)', 'Terminal: a=0 \u2192 v_t = g/k = ' + vTerm, 'Exponential approach to v_t'], '#000000', '#FFFFFF');
  } else if (sub === 'integration_for_s') {
    M2_textBox(cx - 60, 20, 'Given: a = ?', '#FFFFFF', 16);
    var branches = [{ x: cx - 220, label: 'a = f(t)', method: 'dv = a(t)dt\\n\u222Bdv=\u222Ba(t)dt', col: '#60a5fa' }, { x: cx - 20, label: 'a = f(x)', method: 'v dv = a(x)dx\\n\u222Bv dv=\u222Ba(x)dx', col: '#34d399' }, { x: cx + 180, label: 'a = f(v)', method: 'dv/a(v)=dt\\nor v dv/a(v)=dx', col: '#fbbf24' }];
    for (var bi = 0; bi < 3; bi++) {
      var b = branches[bi]; M2_stroke('#888888', 0.6); strokeWeight(1.5); line(cx, 45, b.x + 80, 90);
      M2_fill('#000000', 0.5); noStroke(); rect(b.x, 90, 160, 40, 4);
      fill(M2_rgb(b.col)[0], M2_rgb(b.col)[1], M2_rgb(b.col)[2]); textSize(13); textAlign(CENTER, CENTER); text(b.label, b.x + 80, 110);
      M2_fill('#000000', 0.4); noStroke(); rect(b.x, 145, 160, 55, 4);
      fill(200); textSize(10); textAlign(CENTER, TOP); var mLines = b.method.split('\\n');
      for (var ml = 0; ml < mLines.length; ml++) text(mLines[ml], b.x + 80, 150 + ml * 16);
    }
  } else if (sub === 'method_decision_tree') {
    M2_drawFormulaBox(30, 20, 420, ['a = 4\u22122v, start from rest', '', '(i) v_terminal: 4\u22122v=0 \u2192 v=2 m/s', '', '(ii) v(t): dv/(4\u22122v) = dt', '    \u2212\u00BDln(4\u22122v) = t + C', '    v = 2(1\u2212e\u207B\u00B2\u1D57)'], '#000000', '#FFFFFF');
    var grx6 = width - 220, gry6 = height - 40;
    M2_drawAxes(grx6, gry6, 180, 150, 't', 'v', '#444455');
    M2_stroke('#fbbf24', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var qi = 0; qi <= 30; qi++) { var tq = qi / 30 * 4; vertex(grx6 + (tq / 4) * 180, gry6 - (2 * (1 - Math.exp(-2 * tq)) / 2.5) * 150); } endShape();
    M2_drawDashedLine(grx6, gry6 - (2 / 2.5) * 150, grx6 + 180, gry6 - (2 / 2.5) * 150, '#fbbf24', 6, 4);
  } else if (sub === 'nua_wrong_suvat_applied') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: suvat always works','#ef4444');
    var u1=0, a1=2, t1=3;
    var wrongV=u1+a1*t1;
    var correctV=t1*t1;
    M2_drawFormulaBox(20,20,width-40,['Problem: a=2t (not constant!)','suvat: v=u+at=0+2×3=6 m/s','Correct: ∫2t dt = t²+C; at t=0 v=0→C=0; v=t²=9 m/s','6 m/s ≠ 9 m/s — suvat gives WRONG answer'],'#000000','#ef4444');
    M2_fill('#ef4444',0.9); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text('suvat gave 6. Reality is 9.',cx,cy+60);

  } else if (sub === 'nua_constant_a_required') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.3); noStroke(); rect(15,cy-90,cx-25,180,4); rect(cx+10,cy-90,cx-25,180,4);
    fill(200); textSize(11); textAlign(CENTER,TOP); noStroke();
    text('Uniform a=constant',width/4,cy-87); text('Non-uniform a=f(t)',width*3/4,cy-87);
    M2_drawFormulaBox(25,cy-65,cx-35,['∫a dt = at','v = u + at ✓','SUVAT works'],'#000000','#34d399');
    M2_drawFormulaBox(cx+15,cy-65,cx-35,['∫f(t) dt ≠ at','v = ∫f(t)dt + C','Calculus required'],'#000000','#ef4444');
    M2_textBox(cx-80,height-30,'suvat hidden assumption: a is constant throughout','#fbbf24',11);

  } else if (sub === 'nua_aha_check_a_first') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.5); noStroke(); rect(cx-200,cy-60,400,120,8);
    M2_fill('#fbbf24',1.0); noStroke(); textSize(18); textAlign(CENTER,CENTER);
    text('CHECK FIRST: Is a constant?',cx,cy-25);
    M2_fill('#34d399',0.9); textSize(14); text('YES → suvat (v=u+at etc.)',cx,cy+5);
    M2_fill('#60a5fa',0.9); text('NO → integration (3 cases)',cx,cy+30);
    M2_textBox(20,height-30,'This 2-second check prevents the entire class of suvat errors','#fbbf24',12);

  } else if (sub === 'forgot_constant_of_integration_s1') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('Forgot +C','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['a=4t. Student integrates: v=2t² (no C!)','At t=2, v=2(4)=8 m/s','But: initial condition says v₀=6 at t=0','Correct: v=2t²+C; at t=0,v=6→C=6; v=2t²+6','At t=2: v=8+6=14 m/s'],'#000000','#ef4444');
    M2_fill('#ef4444',0.9); noStroke(); textSize(18); textAlign(CENTER,CENTER);
    text('Missing C → off by 6 m/s!',cx,cy+60);

  } else if (sub === 'forgot_constant_of_integration_s2') {
    var cx=width/2, cy=height/2;
    var gox=80, goy=height-60, gw=width-160, gh=200;
    M2_drawAxes(gox,goy,gw,gh,'t','v','#555566');
    var Cs=[0,3,6,9];
    var cols2=['#888888','#60a5fa','#34d399','#fbbf24'];
    for(var ci2=0;ci2<4;ci2++){
      M2_stroke(cols2[ci2],0.7); strokeWeight(ci2===2?3:1.5); noFill(); beginShape();
      for(var i2=0;i2<=20;i2++){ var ti2=i2/20*3; vertex(gox+(ti2/3)*gw,goy-(( 2*ti2*ti2+Cs[ci2])/20)*gh);}
      endShape();
      M2_fill(cols2[ci2],0.7); noStroke(); textSize(9); textAlign(LEFT,CENTER);
      text('C='+Cs[ci2],gox+gw+3,goy-(Cs[ci2]/20)*gh);
    }
    M2_textBox(20,20,'Integration gives a FAMILY of curves. Initial condition picks ONE.','#fbbf24',11);

  } else if (sub === 'wrong_integration_form_s1') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('Trying to ∫a(x)dt','#ef4444');
    M2_drawFormulaBox(20,20,width-40,['a=3x (depends on position)','Student tries: dv/dt = 3x → ∫dv = ∫3x dt','Problem: x also changes with t → CIRCULAR!','Cannot integrate 3x with respect to t without knowing x(t)','Which is exactly what we are trying to find → STUCK!'],'#000000','#ef4444');
    M2_fill('#ef4444',0.9); noStroke(); textSize(20); textAlign(CENTER,CENTER);
    text('Dead end ✗',cx,cy+60);

  } else if (sub === 'wrong_integration_form_s2') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Chain rule rescue:','a = dv/dt = (dv/dx)·(dx/dt) = v·(dv/dx)','','Therefore: v·dv/dx = a = 3x','Rearrange: v dv = 3x dx','Now integrate both sides:','  ∫v dv = ∫3x dx','  v²/2 = 3x²/2 + C','  v² = 3x² + v₀²','','No circular dependency! v as function of x.'],'#000000','#34d399');

  } else if (sub === 'wrong_integration_form_s3') {
    var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['Complete solution: a=3x, v=5 at x=0','v dv = 3x dx → v²/2 = 3x²/2 + C','At x=0, v=5 → C = 25/2','v² = 3x² + 25','At x=2: v²=12+25=37 → v=√37≈6.1 m/s','','No t appears in final answer (correct for a=f(x) problems)'],'#000000','#34d399');

  } else if (sub === 'terminal_velocity_confusion_s1') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: a→small constant','#ef4444');
    var gox=80, goy=height-60, gw=width-160, gh=200;
    M2_drawAxes(gox,goy,gw,gh,'t','v','#555566');
    M2_stroke('#ef4444',0.8); strokeWeight(2); noFill(); beginShape();
    for(var i1=0;i1<=30;i1++){var ti1=i1/30*5; vertex(gox+(ti1/5)*gw,goy-(ti1/5)*gh*0.9);}
    endShape();
    M2_textBox(20,20,'Student belief: velocity keeps growing slowly','#ef4444',11);
    M2_drawFormulaBox(20,height-60,width-40,['If a never becomes ZERO, v never becomes constant','Terminal velocity REQUIRES a=0 exactly','Not "approaching zero" — actually zero!'],'#000000','#ef4444');

  } else if (sub === 'terminal_velocity_confusion_s2') {
    var cx=width/2, cy=height/2;
    var k=2, g=10, vTerm=g/k;
    var gox=80, goy=height-60, gw=width-160, gh=200;
    M2_drawAxes(gox,goy,gw,gh,'t','v','#555566');
    M2_stroke('#34d399',0.9); strokeWeight(2.5); noFill(); beginShape();
    for(var i2=0;i2<=30;i2++){var ti2=i2/30*5; var vi2=vTerm*(1-Math.exp(-k*ti2)); vertex(gox+(ti2/5)*gw,goy-(vi2/(vTerm*1.2))*gh);}
    endShape();
    var termY=goy-(vTerm/(vTerm*1.2))*gh;
    M2_drawDashedLine(gox,termY,gox+gw,termY,'#fbbf24',8,5);
    fill(255,200,40); textSize(10); textAlign(LEFT,BOTTOM); noStroke(); text('v_terminal = g/k = '+vTerm,gox+gw/2,termY-4);
    M2_drawFormulaBox(20,20,width-40,['a=g-kv. Terminal: a=0 → g-kv=0 → v_t=g/k','SET a=0 to find v_terminal — no integration needed!'],'#000000','#34d399');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_motionGraphs(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','particle_constant_velocity','st_graph_linear','vt_graph_constant','particle_accelerating','st_curve_vt_slope_at_flat','graph_reading_skill']; sub = fm[idx] || 'particle_constant_velocity'; }
  background(15, 15, 26);
  var splitX = width * 0.40; var gLeft = splitX + 15, gRight = width - 15; var gW = gRight - gLeft; var gMidY = height / 2;
  stroke(50, 50, 70); strokeWeight(1); line(splitX, 0, splitX, height); line(gLeft, gMidY, gRight, gMidY);
  fill(120); textSize(9); textAlign(LEFT, TOP); noStroke(); text('PARTICLE', 6, 4); text('x-t', gLeft + 4, 6); text('v-t', gLeft + 4, gMidY + 6);
  var a_mg = 3, u_mg = 0; var animDur = 5;
  var cursorT = (millis() / 1000 * 0.3) % animDur;
  var xMax = 0.5 * a_mg * animDur * animDur * 1.1; var vMax = a_mg * animDur * 1.1;
  var pPos = u_mg * cursorT + 0.5 * a_mg * cursorT * cursorT; var vNow = u_mg + a_mg * cursorT;
  var pPx = constrain(20 + (pPos / xMax) * (splitX - 40), 20, splitX - 20);
  stroke(80); strokeWeight(1); line(15, height / 2, splitX - 15, height / 2);
  M2_drawParticle(pPx, height / 2, 10, '#60a5fa', '');
  if (vNow > 0.5) M2_newArrow(pPx, height / 2 - 20, pPx + constrain(vNow * 3, 5, 80), height / 2 - 20, '#34d399', 'v=' + vNow.toFixed(1));
  var xtOx = gLeft + 25, xtOy = gMidY - 15, xtW = gW - 40, xtH = gMidY - 35;
  M2_drawAxes(xtOx, xtOy, xtW, xtH, 't', 'x', '#444455');
  M2_stroke('#60a5fa', 0.9); strokeWeight(2); noFill(); beginShape();
  for (var xi = 0; xi <= 40; xi++) { var tt = xi / 40 * animDur; vertex(xtOx + (tt / animDur) * xtW, xtOy - ((u_mg * tt + 0.5 * a_mg * tt * tt) / xMax) * xtH); } endShape();
  var xtCurX = xtOx + (cursorT / animDur) * xtW;
  stroke(255, 255, 255, 150); strokeWeight(1); line(xtCurX, xtOy - xtH, xtCurX, xtOy);
  M2_fill('#fbbf24', 1.0); noStroke(); ellipse(xtCurX, xtOy - (pPos / xMax) * xtH, 7, 7);
  var vtOx = gLeft + 25, vtOy = height - 15, vtW = gW - 40, vtH = height / 2 - 35;
  M2_drawAxes(vtOx, vtOy, vtW, vtH, 't', 'v', '#444455');
  M2_stroke('#34d399', 0.9); strokeWeight(2);
  line(vtOx, vtOy - (u_mg / vMax) * vtH, vtOx + vtW, vtOy - ((u_mg + a_mg * animDur) / vMax) * vtH);
  var vtCurX = vtOx + (cursorT / animDur) * vtW;
  stroke(255, 255, 255, 150); strokeWeight(1); line(vtCurX, vtOy - vtH, vtCurX, vtOy);
  M2_fill('#fbbf24', 1.0); noStroke(); ellipse(vtCurX, vtOy - (vNow / vMax) * vtH, 7, 7);
  if (sub === 'st_graph_linear') M2_textBox(gLeft + 5, gMidY - 35, 'Slope of x-t = velocity = ' + vNow.toFixed(1), '#fbbf24', 10);
  else if (sub === 'vt_graph_constant') {
    M2_fill('#34d399', 0.15); noStroke(); beginShape(); vertex(vtOx, vtOy);
    for (var ai = 0; ai <= 30; ai++) { var ta = ai / 30 * cursorT; vertex(vtOx + (ta / animDur) * vtW, vtOy - ((u_mg + a_mg * ta) / vMax) * vtH); }
    vertex(vtOx + (cursorT / animDur) * vtW, vtOy); endShape(CLOSE);
    M2_textBox(gLeft + 5, height - 35, 'Area = displacement = ' + pPos.toFixed(1) + 'm', '#34d399', 10);
  } else if (sub === 'particle_accelerating') M2_textBox(gLeft + 5, gMidY + 20, 'Slope of v-t = a = ' + a_mg + ' m/s\u00B2', '#C896FF', 10);
  else if (sub === 'st_curve_vt_slope_at_flat' || sub === 'graph_reading_skill') M2_textBox(6, height - 35, 'Slope x-t=v | Area v-t=x | Slope v-t=a', '#fbbf24', 10);
  else if (sub === 'mg_wrong_slope_is_displacement') {
    background(15,15,26); var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: slope = displacement','#ef4444');
    var gox=80, goy=height-80, gw=width-160, gh=200;
    M2_drawAxes(gox,goy,gw,gh,'t','x','#555566');
    M2_stroke('#60a5fa',0.9); strokeWeight(3);
    line(gox,goy,gox+gw,goy-gh*0.7);
    M2_fill('#ef4444',0.8); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('"slope=displacement"',cx,cy-60);
    M2_drawFormulaBox(20,20,width-40,['Slope of x-t = Δx/Δt = velocity (not displacement!)','Displacement is the AREA under v-t graph','Confusing slope and area is the most common graph error'],'#000000','#ef4444');

  } else if (sub === 'mg_slope_is_velocity') {
    background(15,15,26); var cx=width/2, cy=height/2;
    var gox=80, goy=height-80, gw=width-160, gh=200;
    M2_drawAxes(gox,goy,gw,gh,'t','x','#555566');
    M2_stroke('#60a5fa',0.9); strokeWeight(2); noFill(); beginShape();
    for(var i1=0;i1<=30;i1++){var ti1=i1/30*5; vertex(gox+(ti1/5)*gw,goy-(ti1*ti1/25)*gh*0.9);}
    endShape();
    var tc=M2_getCanvasSliderVal('mgSlp',0.5,4,2,height-30,'cursor t(s)');
    var tcX=gox+(tc/5)*gw;
    stroke(255,255,255,120); strokeWeight(1); line(tcX,goy,tcX,goy-gh);
    var slope=2*tc/5*gh*0.9/gw*5;
    var tang=slope*0.5;
    M2_stroke('#fbbf24',0.9); strokeWeight(2); line(tcX-40,goy-(tc*tc/25)*gh*0.9+tang*40,tcX+40,goy-(tc*tc/25)*gh*0.9-tang*40);
    M2_textBox(20,20,'Slope of tangent at t='+tc.toFixed(1)+'s = instantaneous velocity','#fbbf24',11);

  } else if (sub === 'mg_aha_slope_gives_rate') {
    background(15,15,26); var cx=width/2, cy=height/2;
    M2_drawFormulaBox(40,30,width-80,['MASTER RULE — SLOPE:','','Slope of x-t = Δx/Δt = VELOCITY','Slope of v-t = Δv/Δt = ACCELERATION','','Mnemonic: each graph\\u0027s slope = the NEXT graph\\u0027s y-value','x-t → slope → v','v-t → slope → a'],'#000000','#fbbf24');
    M2_fill('#34d399',1.0); noStroke(); textSize(24); textAlign(CENTER,CENTER);
    text('Slope = derivative = next quantity',cx,height-50);

  } else if (sub === 'mg_wrong_area_is_velocity') {
    background(15,15,26); var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: area = velocity','#ef4444');
    var gox=80, goy=cy+50, gw=width-160, gh=120;
    M2_drawAxes(gox,goy,gw,gh,'t','v','#555566');
    stroke(100); strokeWeight(1); line(gox,goy-(10/15)*gh,gox+gw,goy-(10/15)*gh);
    M2_fill('#60a5fa',0.15); noStroke(); rect(gox,goy-( 10/15)*gh,gw,(10/15)*gh);
    M2_fill('#ef4444',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('"Area = velocity = 50 m/s?"',cx,cy-50);
    M2_drawFormulaBox(20,20,width-40,['Velocity is directly readable on the y-axis = 10 m/s','Area = (m/s) × s = m = DISPLACEMENT','Area = 10×5 = 50 METRES, not m/s!'],'#000000','#ef4444');

  } else if (sub === 'mg_aha_area_accumulates') {
    background(15,15,26); var cx=width/2, cy=height/2;
    var gox=80, goy=cy+60, gw=width-160, gh=120;
    M2_drawAxes(gox,goy,gw,gh,'t','v','#555566');
    stroke(100); strokeWeight(1); line(gox,goy-(10/15)*gh,gox+gw,goy-(10/15)*gh);
    M2_fill('#34d399',0.25); noStroke(); rect(gox,goy-(10/15)*gh,gw,(10/15)*gh);
    M2_textBox(gox+gw/2-50,goy-(10/15)*gh/2,'Displacement = 50m',  '#34d399',12);
    M2_drawFormulaBox(20,20,width-40,['Unit check: y-axis [m/s] × x-axis [s] = [m]','Area under v-t = displacement (in metres)','Height of y-axis = velocity (in m/s)'],'#000000','#34d399');

  } else if (sub === 'ignoring_sign_in_area_s1') {
    background(15,15,26); var cx=width/2, cy=height/2;
    M2_projWatermark('Added all areas as positive','#ef4444');
    var gox=80, goy=cy+30, gw=width-160, gh=100;
    M2_drawAxes(gox,goy,gw,gh,'t','v','#555566');
    var t1=gox+(0.4)*gw, t2=gox+(0.9)*gw;
    M2_fill('#34d399',0.25); noStroke(); beginShape(); vertex(gox,goy); vertex(t1,goy-gh*0.8); vertex(t1,goy); endShape(CLOSE);
    M2_fill('#ef4444',0.25); noStroke(); beginShape(); vertex(t1,goy); vertex(t2,goy+(gh*0.5)); vertex(t2,goy); endShape(CLOSE);
    M2_textBox(gox+gw*0.2,goy-gh*0.4-10,'+20m','#34d399',11);
    M2_textBox(gox+gw*0.65,goy+10,'-12m','#ef4444',11);
    M2_fill('#ef4444',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('"Total = 20+12 = 32m"',cx,goy+gh*0.5+20);
    M2_drawFormulaBox(20,20,width-40,['Displacement = +20 + (-12) = 8m','Distance = 20 + 12 = 32m','Adding areas without sign gives DISTANCE not displacement!'],'#000000','#ef4444');

  } else if (sub === 'ignoring_sign_in_area_s2') {
    background(15,15,26); var cx=width/2, cy=height/2;
    var gox=80, goy=cy+30, gw=width-160, gh=100;
    M2_drawAxes(gox,goy,gw,gh,'t','v','#555566');
    var t1=gox+(0.4)*gw, t2=gox+(0.9)*gw;
    M2_fill('#34d399',0.3); noStroke(); beginShape(); vertex(gox,goy); vertex(t1,goy-gh*0.8); vertex(t1,goy); endShape(CLOSE);
    M2_fill('#ef4444',0.3); noStroke(); beginShape(); vertex(t1,goy); vertex(t2,goy+(gh*0.5)); vertex(t2,goy); endShape(CLOSE);
    M2_textBox(gox+gw*0.2,goy-gh*0.3,'+20m','#34d399',11);
    M2_textBox(gox+gw*0.65,goy+10,'-12m','#ef4444',11);
    M2_fill('#34d399',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('Displacement: 20-12 = +8m',cx,goy+gh*0.5+15);
    M2_fill('#fbbf24',0.9); textSize(12); text('Distance: 20+12 = 32m',cx,goy+gh*0.5+35);
    M2_textBox(20,20,'"Displacement" → signed sum. "Distance" → unsigned sum.','#fbbf24',11);

  } else if (sub === 'concavity_confusion_s1') {
    background(15,15,26); var cx=width/2, cy=height/2;
    M2_projWatermark('Concave up = moving up?','#ef4444');
    var gox=80, goy=height-80, gw=width-160, gh=200;
    M2_drawAxes(gox,goy,gw,gh,'t(time)','x(position)','#555566');
    M2_stroke('#60a5fa',0.9); strokeWeight(2); noFill(); beginShape();
    for(var i1=0;i1<=30;i1++){var ti1=i1/30*4; vertex(gox+(ti1/4)*gw,goy-(ti1*ti1/16)*gh*0.8);}
    endShape();
    M2_fill('#ef4444',0.8); noStroke(); textSize(12); textAlign(CENTER,CENTER);
    text('"Concave up = particle moving UPWARD"',cx,cy-40);
    M2_drawFormulaBox(20,20,width-40,['x-axis is TIME (not vertical position!)', 'x-t is a graph — not the physical path','Concave up → d²x/dt² > 0 → positive acceleration','Physical direction depends on sign of slope, not curve shape'],'#000000','#ef4444');

  } else if (sub === 'concavity_confusion_s2') {
    background(15,15,26); var cx=width/2, cy=height/2;
    M2_fill('#000000',0.3); noStroke(); rect(15,40,cx-25,height-80,4); rect(cx+10,40,cx-25,height-80,4);
    fill(200); textSize(11); textAlign(CENTER,TOP); noStroke();
    text('Concave UP',width/4,45); text('Concave DOWN',width*3/4,45);
    var gox1=25, goy1=height-60, gw1=cx-45, gh1=160;
    M2_drawAxes(gox1,goy1,gw1,gh1,'t','x','#555566');
    M2_stroke('#34d399',0.9); strokeWeight(2); noFill(); beginShape();
    for(var i1=0;i1<=20;i1++){var ti=i1/20*3; vertex(gox1+(ti/3)*gw1,goy1-(ti*ti/9)*gh1*0.8);}
    endShape();
    M2_fill('#34d399',0.8); textSize(10); textAlign(CENTER,TOP); text('a>0 (accelerating)',gox1+gw1/2,goy1+5);
    var gox2=cx+20, goy2=height-60, gw2=cx-45, gh2=160;
    M2_drawAxes(gox2,goy2,gw2,gh2,'t','x','#555566');
    M2_stroke('#ef4444',0.9); strokeWeight(2); noFill(); beginShape();
    for(var i2=0;i2<=20;i2++){var ti=i2/20*3; vertex(gox2+(ti/3)*gw2,goy2-(( 3*ti-ti*ti/2)/4)*gh2*0.8);}
    endShape();
    M2_fill('#ef4444',0.8); textSize(10); textAlign(CENTER,TOP); text('a<0 (decelerating)',gox2+gw2/2,goy2+5);

  } else if (sub === 'at_area_gives_position_s1') {
    background(15,15,26); var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: a-t area = displacement','#ef4444');
    var gox=80, goy=height-80, gw=width-160, gh=160;
    M2_drawAxes(gox,goy,gw,gh,'t','a','#555566');
    stroke(100); strokeWeight(1); line(gox,goy-(5/8)*gh,gox+gw,goy-(5/8)*gh);
    M2_fill('#60a5fa',0.2); noStroke(); rect(gox,goy-(5/8)*gh,gw,(5/8)*gh);
    M2_fill('#ef4444',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('"Area = displacement = 15m?"',cx,cy-50);
    M2_drawFormulaBox(20,20,width-40,['Unit check: (m/s²) × s = m/s = VELOCITY CHANGE','Area under a-t = Δv (not displacement!)','If v starts at 0: v_final = 0 + 15 = 15 m/s — not 15 METRES'],'#000000','#ef4444');

  } else if (sub === 'at_area_gives_position_s2') {
    background(15,15,26); var cx=width/2, cy=height/2;
    var rows=[
      {graph:'x-t area',unit:'m × s = m²s',meaning:'Meaningless physically'},
      {graph:'v-t area',unit:'(m/s) × s = m',meaning:'DISPLACEMENT'},
      {graph:'a-t area',unit:'(m/s²) × s = m/s',meaning:'Δ VELOCITY (not position!)'}
    ];
    for(var ri=0;ri<3;ri++){
      M2_fill('#000000',0.4); noStroke(); rect(20,50+ri*90,width-40,75,4);
      fill(200); textSize(12); textAlign(LEFT,TOP); text(rows[ri].graph+' area:',30,56+ri*90);
      fill(180); textSize(11); text('Units: '+rows[ri].unit,30,74+ri*90);
      var col=ri===1?'#34d399':(ri===2?'#fbbf24':'#888888');
      fill(M2_rgb(col)[0],M2_rgb(col)[1],M2_rgb(col)[2]); textSize(12); textAlign(RIGHT,TOP);
      text(rows[ri].meaning,width-30,56+ri*90);
    }
    M2_textBox(cx-120,20,'Only v-t area = displacement. a-t area = Δv.','#fbbf24',12);

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_relativeMotion(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','two_observers_setup','velocity_subtraction_formula','same_direction_case','opposite_direction_case','relative_acceleration','frame_of_reference_concept']; sub = fm[idx] || 'two_observers_setup'; } background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (sub === 'two_observers_setup') {
    var frameToggle = M2_getCanvasSliderVal('frame', 0, 1, 0, height - 50, 'Frame: 0=Ground 1=B');
    var isGround = frameToggle < 0.5;
    stroke(80); strokeWeight(3); line(20, cy + 30, width - 20, cy + 30);
    var vA = 80, vB = 60; var simT = (t * 0.15) % 5; var posA, posB;
    if (isGround) { posA = 60 + vA * simT * 0.8; posB = 40 + vB * simT * 0.8; }
    else { posA = 60 + (vA - vB) * simT * 0.8; posB = 40; }
    posA = posA % (width - 40); posB = posB % (width - 40);
    M2_fill('#60a5fa', 0.9); noStroke(); rect(posA, cy + 5, 40, 18, 3);
    M2_fill('#FFA050', 0.9); rect(posB, cy + 35, 40, 18, 3);
    fill(255); textSize(9); textAlign(CENTER, CENTER); text('A', posA + 20, cy + 14); text('B', posB + 20, cy + 44);
    M2_drawFormulaBox(20, 20, 350, [isGround ? 'Ground: A=80, B=60 km/h' : "B's frame: B=0, A=20 km/h", 'v_AB = v_A\u2212v_B = 20 km/h'], '#000000', '#FFFFFF');
  } else if (sub === 'velocity_subtraction_formula') {
    var vA2 = M2_getCanvasSliderVal('rmVA', 10, 100, 80, height - 70, 'v_A');
    var vB2 = M2_getCanvasSliderVal('rmVB', 10, 100, 60, height - 40, 'v_B');
    var sc = 1.2;
    M2_newArrow(60, cy - 30, 60 + vA2 * sc, cy - 30, '#60a5fa', 'v_A=' + vA2.toFixed(0));
    M2_newArrow(60, cy + 10, 60 + vB2 * sc, cy + 10, '#FFA050', 'v_B=' + vB2.toFixed(0));
    M2_newArrow(60, cy + 50, 60 - vB2 * sc, cy + 50, '#ef4444', '\u2212v_B');
    var vAB = vA2 - vB2;
    M2_newArrow(60, cy + 90, 60 + Math.abs(vAB) * sc, cy + 90, vAB >= 0 ? '#34d399' : '#C896FF', 'v_AB=' + vAB.toFixed(0));
    M2_textBox(20, 20, 'v_AB = v_A \u2212 v_B', '#fbbf24', 13);
  } else if (sub === 'same_direction_case') {
    M2_fill('#000000', 0.3); noStroke(); rect(20, 40, width / 2 - 30, height / 2 - 50, 4);
    fill(200); textSize(11); textAlign(CENTER, TOP); text('Same direction', width / 4, 45);
    M2_newArrow(40, 100, 120, 100, '#60a5fa', 'A=80'); M2_newArrow(40, 130, 100, 130, '#FFA050', 'B=60');
    M2_textBox(40, 155, 'v_AB = 80\u221260 = 20', '#fbbf24', 10);
    M2_fill('#000000', 0.3); noStroke(); rect(width / 2 + 10, 40, width / 2 - 30, height / 2 - 50, 4);
    fill(200); textSize(11); textAlign(CENTER, TOP); text('Opposite direction', width * 3 / 4, 45);
    M2_newArrow(width / 2 + 30, 100, width / 2 + 110, 100, '#60a5fa', 'A=80');
    M2_newArrow(width - 40, 130, width - 120, 130, '#FFA050', 'B=60');
    M2_textBox(width / 2 + 30, 155, 'Closing = 80+60 = 140', '#fbbf24', 10);
    M2_drawFormulaBox(20, height / 2, width - 40, ['Same dir: v_rel = v_A\u2212v_B', 'Opposite: closing = v_A+v_B'], '#000000', '#FFFFFF');
  } else if (sub === 'opposite_direction_case') {
    var ox4 = cx - 60, oy4 = cy + 60; M2_drawAxes(ox4, oy4, 200, 180, 'E', 'N', '#555566'); var sc4 = 4;
    M2_newArrow(ox4, oy4, ox4 + 20 * sc4, oy4, '#60a5fa', 'v_A=20E');
    M2_newArrow(ox4, oy4, ox4, oy4 - 15 * sc4, '#FFA050', 'v_B=15N');
    M2_newArrow(ox4, oy4, ox4 + 20 * sc4, oy4 + 15 * sc4, '#34d399', 'v_AB');
    M2_drawDashedLine(ox4 + 20 * sc4, oy4, ox4 + 20 * sc4, oy4 + 15 * sc4, '#888888', 4, 3);
    M2_drawFormulaBox(20, 20, 380, ['v_AB = (20,0)\u2212(0,15) = (20,\u221215)', '|v_AB| = \u221A625 = 25 km/h', '37\u00B0 south of east'], '#000000', '#FFFFFF');
  } else if (sub === 'relative_acceleration') {
    var simT5 = (t * 0.3) % 3;
    var y1 = 40 * simT5 - 5 * simT5 * simT5, x1 = 20 * simT5;
    var y2 = 30 * simT5 - 5 * simT5 * simT5, x2 = 30 * simT5;
    if (y1 < 0) y1 = 0; if (y2 < 0) y2 = 0;
    M2_fill('#000000', 0.3); noStroke(); rect(10, 40, width / 2 - 20, height - 80, 4);
    fill(200); textSize(11); textAlign(CENTER, TOP); text('Ground Frame', width / 4, 45);
    stroke(80); strokeWeight(1); line(20, height - 60, width / 2 - 10, height - 60);
    M2_drawParticle(40 + x1 * 3, height - 60 - y1 * 4, 6, '#60a5fa', '1');
    M2_drawParticle(40 + x2 * 3, height - 60 - y2 * 4, 6, '#FFA050', '2');
    M2_fill('#000000', 0.3); noStroke(); rect(width / 2 + 10, 40, width / 2 - 20, height - 80, 4);
    fill(200); textSize(11); textAlign(CENTER, TOP); text("Ball 1's Frame", width * 3 / 4, 45);
    var relX = (x2 - x1) * 3, relY = (y2 - y1) * 4;
    M2_drawParticle(width / 2 + width / 4, height / 2, 6, '#60a5fa', '1(fixed)');
    M2_drawParticle(width / 2 + width / 4 + relX, height / 2 - relY, 6, '#FFA050', '2');
    M2_drawDashedLine(width / 2 + width / 4, height / 2, width / 2 + width / 4 + relX, height / 2 - relY, '#fbbf24', 4, 3);
    M2_textBox(width / 2 + 20, height - 50, 'Relative a=0 \u2192 straight line!', '#fbbf24', 11);
  } else if (sub === 'frame_of_reference_concept') {
    M2_drawFormulaBox(30, 20, 420, ['v_A=20E, v_B=15N', 'v_AB = (20,0)\u2212(0,15) = (20,\u221215)', '|v_AB| = \u221A625 = 25 km/h', 'tan\u03B1 = 15/20 \u2192 \u03B1 = 36.87\u00B0 south of east'], '#000000', '#FFFFFF');
    var ox6 = width - 200, oy6 = height - 60; M2_drawAxes(ox6, oy6, 150, 150, 'E', 'N', '#444455');
    M2_newArrow(ox6, oy6, ox6 + 80, oy6, '#60a5fa', '20E');
    M2_newArrow(ox6, oy6, ox6, oy6 + 60, '#ef4444', '\u221215N');
    M2_newArrow(ox6, oy6, ox6 + 80, oy6 + 60, '#34d399', 'v_AB=25');
  // --- EPIC-C: reversed_subtraction branch ---
  } else if (sub === 'rm_wrong_sum') {
    // STATE_1 WRONG BELIEF: v_AB = v_B − v_A (wrong order)
    var trackY = cy + 20; stroke(100); strokeWeight(2); line(20, trackY, width - 20, trackY);
    var simT = (t * 0.15) % 4;
    var posA = 60 + 60 * simT * 0.8, posB = 40 + 40 * simT * 0.8;
    posA = posA % (width - 60); posB = posB % (width - 60);
    M2_fill('#60a5fa', 0.9); noStroke(); rect(posA, trackY - 12, 35, 14, 3);
    M2_fill('#FFA050', 0.9); rect(posB, trackY + 5, 35, 14, 3);
    fill(255); textSize(9); textAlign(CENTER, CENTER); text('A(60)', posA + 17, trackY - 5); text('B(40)', posB + 17, trackY + 12);
    M2_fill('#ef4444', 0.9); noStroke(); textSize(16); textAlign(CENTER, CENTER);
    text('v_AB = v_B \u2212 v_A = 40\u221260 = \u221220', cx, 60);
    M2_textBox(cx - 60, 85, 'Gets sign wrong!', '#ef4444', 11);
    M2_projWatermark('Belief: v_AB = v_B \u2212 v_A', '#ef4444');
  } else if (sub === 'rm_aha_reference_frame') {
    // STATE_2 aha: correct formula v_AB = v_A − v_B
    var trackY = cy + 20; stroke(100); strokeWeight(2); line(20, trackY, width - 20, trackY);
    var simT2 = (t * 0.15) % 4;
    var posA2 = 60 + 60 * simT2 * 0.8, posB2 = 40 + 40 * simT2 * 0.8;
    posA2 = posA2 % (width - 60); posB2 = posB2 % (width - 60);
    M2_fill('#60a5fa', 0.9); noStroke(); rect(posA2, trackY - 12, 35, 14, 3);
    M2_fill('#FFA050', 0.9); rect(posB2, trackY + 5, 35, 14, 3);
    fill(255); textSize(9); textAlign(CENTER, CENTER); text('A(60)', posA2 + 17, trackY - 5); text('B(40)', posB2 + 17, trackY + 12);
    M2_drawFormulaBox(20, 20, 400, ['v_AB = v_A \u2212 v_B = 60\u221240 = +20 m/s', 'A moves at 20 m/s relative to B', '', 'Mnemonic: "describing A" comes first', 'v_AB = v_A \u2212 v_B  \u2713'], '#000000', '#34d399');

  } else if (sub === 'opposite_direction_subtraction_error_s1') {
    var cx=width/2, cy=height/2;
    var trackY=cy+20; stroke(100); strokeWeight(2); line(20,trackY,width-20,trackY);
    M2_fill('#60a5fa',0.9); noStroke(); rect(80,trackY-12,40,14,3);
    M2_fill('#FFA050',0.9); noStroke(); rect(width-160,trackY+5,40,14,3);
    fill(255); textSize(9); textAlign(CENTER,CENTER); text('A(10→)',100,trackY-5); text('B(6←)',width-140,trackY+12);
    M2_fill('#ef4444',0.8); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('"v_AB = 10-6 = 4 m/s"',cx,cy-30);
    M2_projWatermark('Subtracted magnitudes','#ef4444');
    var correctV=10+6;
    M2_drawFormulaBox(20,20,width-40,['Assign signs: rightward=+, leftward=-','V_A=+10, V_B=-6','V_AB = 10-(-6) = 10+6 = 16 m/s → NOT 4!','Opposite direction: closing speed = SUM of speeds'],'#000000','#ef4444');

  } else if (sub === 'opposite_direction_subtraction_error_s2') {
    var cx=width/2, cy=height/2;
    var cases2=[{vA:10,vB:6,dir:'same',lbl:'Same dir'},{vA:10,vB:-6,dir:'opp',lbl:'Opp dir'},{vA:10,vB:0,dir:'stat',lbl:'B stationary'}];
    var ph=(width-40)/3;
    for(var ci=0;ci<3;ci++){
      var bx=20+ci*ph; M2_fill('#000000',0.3); noStroke(); rect(bx,cy-60,ph-8,120,4);
      fill(200); textSize(10); textAlign(CENTER,TOP); text(cases2[ci].lbl,bx+ph/2-4,cy-57);
      M2_fill('#60a5fa',0.8); noStroke(); textSize(11); textAlign(CENTER,CENTER);
      text('V_A='+cases2[ci].vA,bx+ph/2-4,cy-30);
      M2_fill('#FFA050',0.8); text('V_B='+cases2[ci].vB,bx+ph/2-4,cy-12);
      var vAB=cases2[ci].vA-cases2[ci].vB;
      M2_fill('#34d399',0.9); textSize(13); text('V_AB='+vAB,bx+ph/2-4,cy+15);
    }
    M2_textBox(cx-140,20,'One formula V_AB=V_A-V_B handles all cases — signs do the work','#fbbf24',11);

  } else if (sub === 'relative_velocity_2d_magnitude_only_s1') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('|V_A|-|V_B| = |V_AB|?','#ef4444');
    M2_newArrow(cx-80,cy,cx+80,cy,'#60a5fa','V_A=20 East');
    M2_newArrow(cx-80,cy+50,cx-80,cy+50-80,'#FFA050','V_B=15 North');
    M2_fill('#ef4444',0.9); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('"V_AB = 20-15 = 5 m/s"',cx,cy+80);
    M2_drawFormulaBox(20,20,width-40,['Actual: V_AB=(20,0)-(0,15)=(20,-15)','|V_AB|=√(400+225)=√625=25 m/s','Student got 5, correct is 25 — 5x error!','Cannot subtract magnitudes when directions differ'],'#000000','#ef4444');

  } else if (sub === 'relative_velocity_2d_magnitude_only_s2') {
    var cx=width/2, cy=height/2, sc=3;
    M2_drawAxes(cx-80,cy+60,200,180,'E','N','#555566');
    M2_newArrow(cx-80,cy+50,cx-80+20*sc,cy+50,'#60a5fa','V_A=20E');
    M2_newArrow(cx-80,cy+50,cx-80,cy+50-15*sc,'#FFA050','V_B=15N');
    M2_newArrow(cx-80,cy+50,cx-80+20*sc,cy+50+15*sc,'#34d399','V_AB=25');
    M2_drawDashedLine(cx-80+20*sc,cy+50,cx-80+20*sc,cy+50+15*sc,'#888888',4,3);
    M2_drawFormulaBox(20,20,360,['Step 1: V_A=(20,0), V_B=(0,15)','Step 2: V_AB=(20-0, 0-15)=(20,-15)','Step 3: |V_AB|=√(400+225)=25 m/s','Step 4: dir=tan⁻¹(15/20)=37° S of E'],'#000000','#34d399');

  } else if (sub === 'relative_acceleration_in_freefall_s1') {
    var cx=width/2, cy=height/2;
    M2_projWatermark('Belief: relative path is parabolic','#ef4444');
    M2_fill('#000000',0.3); noStroke(); rect(15,40,cx-25,height-80,4); rect(cx+10,40,cx-25,height-80,4);
    fill(200); textSize(11); textAlign(CENTER,TOP); noStroke();
    text('Lab frame (correct)',width/4,45); text('Ball 2 frame (your belief)',width*3/4,45);
    var gY=height-50;
    stroke(100); strokeWeight(1); line(25,gY,cx-25,gY); line(cx+25,gY,width-25,gY);
    M2_stroke('#60a5fa',0.4); strokeWeight(1); noFill(); beginShape();
    for(var i1=0;i1<=20;i1++){var ti=i1/20*2; vertex(30+ti*30,gY-(30*ti-5*ti*ti)*4);}
    endShape();
    M2_stroke('#FFA050',0.4); strokeWeight(1); noFill(); beginShape();
    for(var i2=0;i2<=20;i2++){var ti=i2/20*2; vertex(80+ti*15,gY-(20*ti-5*ti*ti)*4);}
    endShape();
    M2_stroke('#ef4444',0.7); strokeWeight(2); noFill(); beginShape();
    for(var i3=0;i3<=15;i3++){var ti=i3/15; vertex(cx+60+ti*60,gY-80+ti*ti*40-30*ti);}
    endShape();
    M2_textBox(cx+20,height-30,'"Sees parabola" — WRONG','#ef4444',10);

  } else if (sub === 'relative_acceleration_in_freefall_s2') {
    var cx=width/2, cy=height/2;
    M2_fill('#000000',0.3); noStroke(); rect(15,40,cx-25,height-80,4); rect(cx+10,40,cx-25,height-80,4);
    fill(200); textSize(11); textAlign(CENTER,TOP); noStroke();
    text('Lab frame',width/4,45); text('Ball 2 frame (CORRECT)',width*3/4,45);
    var gY=height-50;
    stroke(100); strokeWeight(1); line(25,gY,cx-25,gY); line(cx+25,gY,width-25,gY);
    M2_stroke('#60a5fa',0.4); strokeWeight(1); noFill(); beginShape();
    for(var i1=0;i1<=20;i1++){var ti=i1/20*2; vertex(30+ti*30,gY-(30*ti-5*ti*ti)*4);}
    endShape();
    M2_stroke('#FFA050',0.4); strokeWeight(1); beginShape();
    for(var i2=0;i2<=20;i2++){var ti=i2/20*2; vertex(80+ti*15,gY-(20*ti-5*ti*ti)*4);}
    endShape();
    M2_drawDashedLine(cx+60,gY-20,cx+150,gY-80,'#34d399',4,3);
    M2_fill('#34d399',0.9); noStroke(); textSize(10); textAlign(CENTER,BOTTOM);
    text('STRAIGHT LINE! (a₁₂=0)',cx+105,gY-80);
    M2_drawFormulaBox(20,20,width-40,['a₁₂=a₁-a₂=g-g=0','Zero relative accel → uniform relative motion → straight line!'],'#000000','#34d399');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_riverBoat(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','river_setup_scene','velocity_triangle_river','minimum_time_case','minimum_drift_case','drift_calculation','general_angle_case']; sub = fm[idx] || 'river_setup_scene'; }
  var d = M2_paramSlot(cfg, 'd', 30), v_br = M2_paramSlot(cfg, 'v_br', 5), v_r = M2_paramSlot(cfg, 'v_r', 4);
  M2_drawRiverEnv(t, d);
  var riverTop = height * 0.35, riverBot = height * 0.65, riverW = riverBot - riverTop, cx = width / 2;
  if (sub === 'river_setup_scene') {
    var crossTime = d / v_br, drift = v_r * crossTime;
    var simT = (t * 0.2) % (crossTime + 0.5); var frac = constrain(simT / crossTime, 0, 1);
    var bx = cx + frac * drift * 2, by = riverTop + frac * riverW;
    M2_fill('#C896FF', 1.0); noStroke(); ellipse(bx, by, 18, 10);
    M2_newArrow(bx, by, bx, by + 20, '#C896FF', ''); M2_newArrow(bx, by, bx + 20, by, '#FFA050', 'v_r');
    M2_fill('#FF5050', 0.8); noStroke(); ellipse(cx, riverBot + 5, 10, 10);
    fill(255); textSize(9); textAlign(CENTER, BOTTOM); text('B', cx, riverBot);
    M2_drawFormulaBox(10, height * 0.72, 300, ['Boat aims perpendicular but DRIFTS!', 'Drift = v_r\u00D7d/v_br = ' + drift.toFixed(1) + 'm'], '#000000', '#fbbf24');
  } else if (sub === 'velocity_triangle_river') {
    var steerDeg = M2_getCanvasSliderVal('steer', -60, 60, 0, height - 50, 'Steer angle (\u00B0)');
    var steerRad = steerDeg * Math.PI / 180;
    var drift2 = (v_r - v_br * Math.sin(steerRad)) * d / (v_br * Math.cos(steerRad + 0.001));
    var simT2 = (t * 0.2) % 4; var frac2 = constrain(simT2 / 3, 0, 1);
    var bx2 = cx + drift2 * frac2 * 0.5, by2 = riverTop + frac2 * riverW;
    M2_fill('#C896FF', 1.0); noStroke(); ellipse(bx2, by2, 18, 10);
    var vtx = 30, vty = height * 0.12, sc = 8;
    M2_newArrow(vtx, vty, vtx + v_br * sc * Math.sin(steerRad), vty + v_br * sc * Math.cos(steerRad), '#C896FF', 'v_br');
    M2_textBox(10, height * 0.72, 'Drift=' + drift2.toFixed(1) + 'm', '#fbbf24', 12);
  } else if (sub === 'minimum_time_case') {
    var tMin = d / v_br, driftMin = v_r * tMin;
    var simT3 = (t * 0.2) % (tMin + 0.5); var frac3 = constrain(simT3 / tMin, 0, 1);
    M2_fill('#C896FF', 1.0); noStroke(); ellipse(cx + frac3 * driftMin * 2, riverTop + frac3 * riverW, 18, 10);
    M2_fill('#34d399', 0.9); noStroke(); textSize(14); textAlign(CENTER, CENTER); text('MINIMUM TIME', cx, height * 0.12);
    M2_drawFormulaBox(10, height * 0.72, 320, ['t_min = d/v_br = ' + tMin.toFixed(1) + 's', 'Drift = ' + driftMin.toFixed(1) + 'm'], '#000000', '#fbbf24');
  } else if (sub === 'minimum_drift_case') {
    var canZero = v_br > v_r;
    if (canZero) {
      var theta4 = Math.asin(v_r / v_br); var tCross4 = d / Math.sqrt(v_br * v_br - v_r * v_r);
      var simT4 = (t * 0.15) % (tCross4 + 0.5); var frac4 = constrain(simT4 / tCross4, 0, 1);
      M2_fill('#C896FF', 1.0); noStroke(); ellipse(cx, riverTop + frac4 * riverW, 18, 10);
      M2_fill('#34d399', 0.9); textSize(14); textAlign(CENTER, CENTER); text('ZERO DRIFT', cx, height * 0.12);
      M2_drawFormulaBox(10, height * 0.72, 340, ['sin\u03B8 = v_r/v_br = ' + (v_r / v_br).toFixed(2), '\u03B8 = ' + (theta4 * 180 / Math.PI).toFixed(1) + '\u00B0 upstream', 't = ' + tCross4.toFixed(1) + 's'], '#000000', '#34d399');
    } else {
      M2_fill('#ef4444', 0.9); noStroke(); textSize(16); textAlign(CENTER, CENTER);
      text('IMPOSSIBLE \u2014 river too strong!', cx, height * 0.12);
    }
  } else if (sub === 'drift_calculation') {
    var v_br5 = 3, v_r5 = 5; var minAlpha = Math.asin(v_br5 / v_r5);
    M2_fill('#ef4444', 0.8); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('v_r > v_br: drift CANNOT be zero', cx, height * 0.12);
    M2_drawFormulaBox(10, height * 0.72, 360, ['v_br=' + v_br5 + ', v_r=' + v_r5, 'Min drift: sin\u03B1=v_br/v_r=' + (v_br5 / v_r5).toFixed(2), '\u03B1 = ' + (minAlpha * 180 / Math.PI).toFixed(1) + '\u00B0'], '#000000', '#FFFFFF');
  } else if (sub === 'general_angle_case') {
    var d6 = 30, vr6 = 4, vbr6 = 5; var tMin6 = d6 / vbr6, drift6 = vr6 * tMin6;
    var theta6 = Math.asin(vr6 / vbr6), tZero6 = d6 / Math.sqrt(vbr6 * vbr6 - vr6 * vr6);
    M2_drawFormulaBox(20, height * 0.72, 360, ['d=' + d6 + ', v_r=' + vr6 + ', v_br=' + vbr6, '(a) Min t=' + tMin6.toFixed(0) + 's, drift=' + drift6.toFixed(0) + 'm', '(b) Zero drift: \u03B8=' + (theta6 * 180 / Math.PI).toFixed(0) + '\u00B0, t=' + tZero6.toFixed(0) + 's'], '#000000', '#fbbf24');
    var simT6 = (t * 0.15) % (tZero6 + 0.5);
    var frac6a = constrain(simT6 / tMin6, 0, 1);
    M2_fill('#60a5fa', 1.0); noStroke(); ellipse(cx - 80 + frac6a * drift6 * 1.5, riverTop + frac6a * riverW, 14, 8);
    var frac6b = constrain(simT6 / tZero6, 0, 1);
    M2_fill('#34d399', 1.0); noStroke(); ellipse(cx + 80, riverTop + frac6b * riverW, 14, 8);
  // --- EPIC-C: adding_speeds_not_vectors branch ---
  } else if (sub === 'rb_wrong_boat_speed_direct') {
    // STATE_1 WRONG BELIEF: ground speed = boat + river (arithmetic)
    var riverTop = height * 0.35, riverBot = height * 0.65, riverW = riverBot - riverTop;
    var simT = (t * 0.2) % 3; var frac = constrain(simT / 2, 0, 1);
    var bx = cx + frac * v_r * 8, by = riverTop + frac * riverW;
    M2_fill('#C896FF', 1.0); noStroke(); ellipse(bx, by, 18, 10);
    M2_newArrow(bx, by - 15, bx, by - 35, '#C896FF', 'v_br=5');
    M2_newArrow(bx + 15, by, bx + 35, by, '#FFA050', 'v_r=3');
    M2_fill('#ef4444', 0.9); noStroke(); textSize(16); textAlign(CENTER, CENTER);
    text('"ground speed = 5+3 = 8 m/s"', cx, height * 0.18);
    M2_textBox(cx - 40, height * 0.22, 'WRONG!', '#ef4444', 12);
    M2_projWatermark('Belief: speeds simply add', '#ef4444');
  } else if (sub === 'rb_aha_two_velocities') {
    // STATE_2 aha: vector triangle → √(5²+3²) = 5.83 m/s
    var riverTop = height * 0.35, riverBot = height * 0.65, riverW = riverBot - riverTop;
    var simT2 = (t * 0.2) % 3; var frac2 = constrain(simT2 / 2, 0, 1);
    var actualSpeed = Math.sqrt(v_br * v_br + v_r * v_r);
    var drift2 = v_r * (d / v_br);
    var bx2 = cx + frac2 * drift2 * 0.5, by2 = riverTop + frac2 * riverW;
    M2_fill('#C896FF', 1.0); noStroke(); ellipse(bx2, by2, 18, 10);
    // velocity triangle inset
    var vtx = 30, vty = height * 0.1, sc = 10;
    M2_drawVelocityTriangle(vtx + 50, vty + 50, 0, v_br * sc, '#C896FF', 'v_br=5', v_r * sc, 0, '#FFA050', 'v_r=3', '#34d399', 'v=' + actualSpeed.toFixed(1));
    M2_drawFormulaBox(20, height * 0.75, 380, ['v_ground = \u221A(v_br\u00B2 + v_r\u00B2) = \u221A(25+9) = 5.83', 'NOT 5+3=8! Vectors add by triangle law.'], '#000000', '#34d399');

  } else if (sub === 'rows_perpendicular_for_zero_drift_s1') {
    var d=30, v_br=5, v_r=4;
    M2_drawRiverEnv(M2_simT,d);
    var riverTop=height*0.35, riverW=height*0.30, cx=width/2;
    var crossTime=d/v_br, drift=v_r*crossTime;
    var simT=M2_simT%(crossTime+0.5);
    var frac=constrain(simT/crossTime,0,1);
    M2_fill('#C896FF',1.0); noStroke(); ellipse(cx+frac*drift*2,riverTop+frac*riverW,18,10);
    M2_projWatermark('Rows straight across — no drift?','#ef4444');
    M2_drawFormulaBox(10,height*0.72,340,['Rowing ⊥ gives MINIMUM TIME — not zero drift!','Drift=v_r×t_min='+drift.toFixed(0)+'m (unavoidable)','To get zero drift: must angle UPSTREAM'],'#000000','#ef4444');

  } else if (sub === 'rows_perpendicular_for_zero_drift_s2') {
    var d=30, v_br=5, v_r=4;
    M2_drawRiverEnv(M2_simT,d);
    var riverTop=height*0.35, riverW=height*0.30, cx=width/2;
    var theta=Math.asin(v_r/v_br), tCross=d/Math.sqrt(v_br*v_br-v_r*v_r);
    var simT=M2_simT%(tCross+0.5), frac=constrain(simT/tCross,0,1);
    M2_fill('#34d399',1.0); noStroke(); ellipse(cx,riverTop+frac*riverW,18,10);
    M2_newArrow(cx,riverTop+frac*riverW,cx-20*Math.sin(theta),riverTop+frac*riverW-20*Math.cos(theta),'#34d399','v_br (angled upstream)');
    M2_drawFormulaBox(10,height*0.72,360,['Zero drift: sin θ=v_r/v_br='+( v_r/v_br).toFixed(2)+' → θ='+( theta*180/Math.PI).toFixed(0)+'° upstream','Takes longer ('+tCross.toFixed(1)+'s vs '+( d/v_br).toFixed(0)+'s) — tradeoff!'],'#000000','#34d399');

  } else if (sub === 'wrong_time_formula_s1') {
    var d=30, v_br=5, v_r=4;
    M2_drawRiverEnv(M2_simT,d);
    var riverTop=height*0.35, riverW=height*0.30, cx=width/2;
    var wrongSpeed=Math.sqrt(v_br*v_br+v_r*v_r), wrongT=d/wrongSpeed;
    M2_fill('#ef4444',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER);
    text('"t=d/|v_b|='+d+'/'+wrongSpeed.toFixed(1)+'='+wrongT.toFixed(1)+'s"',cx,height*0.18);
    M2_projWatermark('t=d/|v_b| (wrong)','#ef4444');
    M2_drawFormulaBox(10,height*0.72,360,['|v_b|=√('+v_br+'²+'+v_r+'²)='+wrongSpeed.toFixed(1)+'m/s covers a DIAGONAL path','But river width is PERPENDICULAR — only v_by covers it!','Correct: t=d/v_by='+d+'/'+v_br+'='+( d/v_br)+'s'],'#000000','#ef4444');

  } else if (sub === 'wrong_time_formula_s2') {
    var d=30, v_br=5, v_r=4;
    M2_drawRiverEnv(M2_simT,d);
    var riverTop=height*0.35, riverW=height*0.30, cx=width/2;
    M2_drawFormulaBox(10,height*0.72,360,['River width = PERPENDICULAR to current','Only the PERPENDICULAR component of v covers the width','v_by = v_br sinα (where α=angle from bank)','t = d/v_by = d/(v_br sinα)','At α=90° (perpendicular): t=d/v_br='+d+'/'+v_br+'='+( d/v_br)+'s ✓'],'#000000','#34d399');

  } else if (sub === 'zero_drift_always_possible_s1') {
    var d=30, v_br=4, v_r=6;
    M2_drawRiverEnv(M2_simT,d);
    var riverTop=height*0.35, riverW=height*0.30, cx=width/2;
    M2_fill('#ef4444',0.9); noStroke(); textSize(16); textAlign(CENTER,CENTER);
    text('IMPOSSIBLE! v_r=6 > v_br=4',cx,height*0.15);
    text('sinθ=v_r/v_br=1.5 > 1 — no solution!',cx,height*0.22);
    M2_projWatermark('v_r > v_br — impossible','#ef4444');
    M2_drawFormulaBox(10,height*0.72,360,['Zero drift formula: sinθ=v_r/v_br=6/4=1.5','sinθ cannot exceed 1 — no angle exists!','River is too strong — zero drift is IMPOSSIBLE'],'#000000','#ef4444');

  } else if (sub === 'zero_drift_always_possible_s2') {
    M2_drawRiverEnv(M2_simT,30);
    var riverTop=height*0.35, riverW=height*0.30, cx=width/2;
    M2_fill('#000000',0.5); noStroke(); rect(10,height*0.72,width-20,60,4);
    M2_drawFormulaBox(15,height*0.73,width-30,['Three-second check at start of EVERY problem:','v_br > v_r? → zero drift POSSIBLE (sinθ=v_r/v_br)','v_br ≤ v_r? → zero drift IMPOSSIBLE'],'#000000','#fbbf24');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_rainUmbrella(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','rain_vertical_stationary','person_moving_rain_appears_angled','relative_rain_velocity','umbrella_tilt_angle','tilt_forward_rule','speed_affects_tilt']; sub = fm[idx] || 'rain_vertical_stationary'; } var vRain = 8; var cx = width / 2;
  if (sub === 'rain_vertical_stationary') {
    var vMan = M2_getCanvasSliderVal('rvm', 0, 10, 0, height - 50, 'Walking speed (m/s)');
    var rainAng = Math.atan2(vMan, vRain) * 180 / Math.PI;
    M2_drawRainEnv(t, rainAng, vMan, vRain);
    M2_drawStickFigure(cx, height - 90, vMan > 0.5, rainAng);
    M2_drawFormulaBox(10, 10, 320, ['v_man=' + vMan.toFixed(1) + ', v_rain=' + vRain, 'Tilt ' + rainAng.toFixed(1) + '\u00B0 forward', vMan < 0.5 ? 'Standing: rain vertical' : 'Walking: rain tilts!'], '#000000', '#FFFFFF');
  } else if (sub === 'person_moving_rain_appears_angled') {
    var vMan2 = 4; var rainAng2 = Math.atan2(vMan2, vRain) * 180 / Math.PI;
    M2_drawRainEnv(t, rainAng2, vMan2, vRain);
    var vdx = width - 200, vdy = 60, sc2 = 8;
    M2_fill('#000000', 0.6); noStroke(); rect(vdx - 10, vdy - 10, 190, 140, 6);
    M2_newArrow(vdx + 20, vdy + 10, vdx + 20, vdy + 10 + vRain * sc2, '#AABBDD', 'v_rain=' + vRain);
    M2_newArrow(vdx + 20, vdy + 10 + vRain * sc2, vdx + 20 + vMan2 * sc2, vdy + 10 + vRain * sc2, '#FFA050', 'v_man=' + vMan2);
    var vrmMag = Math.sqrt(vRain * vRain + vMan2 * vMan2);
    M2_newArrow(vdx + 20, vdy + 10, vdx + 20 + vMan2 * sc2, vdy + 10 + vRain * sc2, '#34d399', 'v_rm=' + vrmMag.toFixed(1));
    M2_drawStickFigure(width / 3, height - 90, true, rainAng2);
  } else if (sub === 'relative_rain_velocity') {
    var vm3 = 3, vr3 = 4, vrm3 = 5; var ang3 = Math.atan2(vm3, vr3) * 180 / Math.PI;
    M2_drawRainEnv(t, ang3, vm3, vr3);
    M2_drawStickFigure(width / 3, height - 90, true, ang3);
    M2_drawFormulaBox(10, 10, 340, ['v_man=3 East, v_rain=4 Down', 'v_rm = \u221A(9+16) = 5 (3-4-5!)', 'Umbrella ' + ang3.toFixed(1) + '\u00B0 east of vertical'], '#000000', '#fbbf24');
  } else if (sub === 'umbrella_tilt_angle') {
    M2_drawRainEnv(t, 30, 5, 8);
    M2_drawFormulaBox(10, 10, 400, ['Obs 1: v_man=3 \u2192 rain vertical \u2192 v_rx=3', 'Obs 2: v_man=6 \u2192 rain at 45\u00B0 \u2192 v_ry=3', 'v_rain = \u221A(9+9) = 3\u221A2 \u2248 4.24 km/h'], '#000000', '#FFFFFF');
  } else if (sub === 'tilt_forward_rule') {
    M2_drawRainEnv(t, 20, 3, 8);
    var dirs = ['Walk East', 'Walk West', 'Walk North'];
    for (var di = 0; di < 3; di++) {
      var bx = 50 + di * 250, by = height * 0.4;
      M2_fill('#000000', 0.5); noStroke(); rect(bx - 5, by - 10, 180, 50, 4);
      fill(200); textSize(11); textAlign(CENTER, CENTER); text(dirs[di], bx + 85, by + 5);
      text('Umbrella tilts ' + dirs[di].split(' ')[1], bx + 85, by + 25);
    }
    M2_textBox(cx - 150, height - 80, 'Umbrella ALWAYS tilts in walking direction', '#fbbf24', 13);
  } else if (sub === 'speed_affects_tilt') {
    var vm6 = 5, vr6 = 12; var vrm6 = Math.sqrt(vm6 * vm6 + vr6 * vr6);
    var ang6 = Math.atan2(vm6, vr6) * 180 / Math.PI;
    M2_drawRainEnv(t, ang6, vm6, vr6);
    M2_drawStickFigure(width / 3, height - 90, true, ang6);
    M2_drawFormulaBox(10, 10, 360, ['v_man=5E, v_rain=12 Down', '\u03B8 = tan\u207B\u00B9(5/12) = ' + ang6.toFixed(1) + '\u00B0', '|v_rm| = \u221A169 = 13 (5-12-13!)'], '#000000', '#fbbf24');

  } else if (sub === 'umbrella_direction_backward_s1') {
    var vRain=8, vMan=5, rainAng=Math.atan2(vMan,vRain)*180/Math.PI;
    M2_drawRainEnv(M2_simT,180,vMan,vRain);
    M2_drawStickFigure(width/3,height-90,true,-rainAng);
    M2_projWatermark('Tilt BACKWARD?','#ef4444');
    M2_drawFormulaBox(10,10,340,['Student tilts umbrella BACKWARD','Rain hits face from the FRONT — gets wet!','v_rm=(−v_m, −v_r) → rain comes from AHEAD'],'#000000','#ef4444');

  } else if (sub === 'umbrella_direction_backward_s2') {
    var vRain=8, vMan=5, rainAng=Math.atan2(vMan,vRain)*180/Math.PI;
    M2_drawRainEnv(M2_simT,rainAng,vMan,vRain);
    M2_drawStickFigure(width/3,height-90,true,rainAng);
    M2_drawFormulaBox(10,10,360,['CORRECT: tilt FORWARD in direction of walking','Rain appears to come from the front (you run INTO it)','v_rm=(−v_m, −v_r): horizontal component = −v_m (from front)','Umbrella always tilts FORWARD — no exceptions'],'#000000','#34d399');

  } else if (sub === 'ru_wrong_rain_speed_only') {
    var vRain=8, vMan=4;
    M2_drawRainEnv(M2_simT,0,vMan,vRain);
    M2_drawStickFigure(width/3,height-90,true,0);
    M2_projWatermark('Using v_r direction for umbrella','#ef4444');
    M2_drawFormulaBox(10,10,360,['Student holds umbrella vertical (v_r direction)','Rain is vertical → umbrella vertical seems right','But MOVING man: rain appears tilted FORWARD','Vertical umbrella leaves face exposed!'],'#000000','#ef4444');

  } else if (sub === 'ru_aha_person_creates_wind') {
    var vRain=8, vMan=4, rainAng=Math.atan2(vMan,vRain)*180/Math.PI;
    M2_drawRainEnv(M2_simT,rainAng,vMan,vRain);
    M2_drawStickFigure(width/3,height-90,true,rainAng);
    M2_drawFormulaBox(10,10,360,['In man\\u0027s frame: v_rm=v_r-v_m=(−v_m,−v_r)','Rain appears to come from DIAGONALLY AHEAD','Umbrella faces v_rm direction — NOT v_r direction','Running "into" rain makes it appear to come from front'],'#000000','#34d399');

  } else if (sub === 'reversed_formula_v_m_minus_v_r_s1') {
    var vRain=4, vMan=3;
    M2_drawRainEnv(M2_simT,0,vMan,vRain);
    M2_drawStickFigure(width/3,height-90,true,-45);
    M2_projWatermark('v_rm = v_m - v_r','#ef4444');
    M2_drawFormulaBox(10,10,360,['v_rm=v_m-v_r=(3,0)-(0,-4)=(3,+4)','This points UP and FORWARD — clearly wrong!','Rain cannot be coming from below!'],'#000000','#ef4444');

  } else if (sub === 'reversed_formula_v_m_minus_v_r_s2') {
    var vRain=4, vMan=3, rainAng=Math.atan2(vMan,vRain)*180/Math.PI;
    M2_drawRainEnv(M2_simT,rainAng,vMan,vRain);
    M2_drawStickFigure(width/3,height-90,true,rainAng);
    M2_drawFormulaBox(10,10,360,['CORRECT: v_rm = v_r - v_m','Rain is OBJECT (comes first in subscript)','Man is OBSERVER (gets subtracted)','v_rm=(0,-4)-(3,0)=(-3,-4) → 37° forward ✓'],'#000000','#34d399');

  } else if (sub === 'find_rain_speed_confusion_s1') {
    var vRain=4, vMan=3;
    M2_drawRainEnv(M2_simT,0,vMan,vRain);
    M2_projWatermark('"Rain appears vertical → rain IS vertical"','#ef4444');
    M2_drawFormulaBox(10,10,380,['Man at 3 km/h sees rain vertical','Student: "rain must be purely vertical (v_rx=0)"','WRONG! v_rm_x=v_rx-v_man=0 → v_rx=v_man=3 km/h','Rain HAS horizontal component = man\\u0027s speed!'],'#000000','#ef4444');

  } else if (sub === 'find_rain_speed_confusion_s2') {
    var vRain=4, vMan=6, rainAng=Math.atan2(3,3)*180/Math.PI;
    M2_drawRainEnv(M2_simT,rainAng,vMan,vRain);
    M2_drawFormulaBox(10,10,420,['v_r=(a,-b). Two observations:','Obs 1 (v_m=3, vertical): v_rx-3=0 → a=3','Obs 2 (v_m=6, 45°): |(a-6)/b|=1 → |3-6|/b=1 → b=3','Speed=√(9+9)=3√2≈4.24 km/h','Umbrella always tilts forward — but ANGLE reveals v_rx!'],'#000000','#34d399');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

function M2_aircraftWind(cfg, stateData, t) {
  var pl = stateData.physics_layer || {}; var sub = pl.scenario || '';
  if (!sub) { var idx = M2_stateIdx(); var fm = ['','aircraft_wind_setup','velocity_triangle_aircraft','heading_vs_track','crosswind_correction_angle','ground_speed_calculation','time_from_ground_speed']; sub = fm[idx] || 'aircraft_wind_setup'; }
  var ptAx = width * 0.2, ptAy = height * 0.75, ptBx = width * 0.75, ptBy = height * 0.25;
  M2_drawAircraftMapEnv(ptAx, ptAy, ptBx, ptBy);
  var cx = width / 2;
  if (sub === 'aircraft_wind_setup') {
    var simT = (t * 0.2) % 4; var frac = constrain(simT / 3, 0, 1);
    var aimDx = ptBx - ptAx, aimDy = ptBy - ptAy; var windPush = frac * 40;
    var planeX = ptAx + aimDx * frac + windPush * 0.3, planeY = ptAy + aimDy * frac - windPush;
    M2_fill('#FF5050', 1.0); noStroke(); ellipse(planeX, planeY, 16, 10);
    for (var wi = 0; wi < 3; wi++) { var wax = 80 + wi * 200; M2_newArrow(wax, height * 0.5, wax, height * 0.5 - 25, '#64B4FF', ''); }
    if (frac >= 0.95) { M2_fill('#ef4444', 0.9); noStroke(); textSize(14); textAlign(CENTER, CENTER); text('MISSED B!', ptBx + 50, ptBy - 20); }
    M2_fill('#000000', 0.5); noStroke(); rect(10, 10, width - 20, 30, 4);
    fill(255); textSize(12); textAlign(LEFT, CENTER); text('Pilot aims at B \u2014 wind pushes off course!', 18, 25);
  } else if (sub === 'velocity_triangle_aircraft') {
    var vdx = 50, vdy = height * 0.5, sc2 = 0.4; var vaw = 400, vw = 200;
    M2_fill('#000000', 0.5); noStroke(); rect(10, height - 130, 300, 110, 6);
    M2_newArrow(vdx, vdy, vdx, vdy - vaw * sc2, '#FF5050', 'v_aw');
    M2_newArrow(vdx, vdy - vaw * sc2, vdx + vw * sc2, vdy - vaw * sc2, '#64B4FF', 'v_w');
    M2_newArrow(vdx, vdy, vdx + vw * sc2, vdy - vaw * sc2, '#34d399', 'v_a');
    M2_drawFormulaBox(10, height - 125, 290, ['v_a = v_aw + v_w', 'Solve for heading angle'], '#000000', '#fbbf24');
  } else if (sub === 'heading_vs_track') {
    var vaw3 = 400, vw3 = 200, beta3 = 45;
    var sinAlpha = vw3 * Math.sin(beta3 * Math.PI / 180) / vaw3;
    var alpha3 = Math.asin(Math.min(sinAlpha, 1)) * 180 / Math.PI;
    M2_drawFormulaBox(10, 10, 420, ['sin\u03B1/|v_w| = sin\u03B2/|v_aw|', 'sin\u03B1 = ' + sinAlpha.toFixed(3), '\u03B1 = ' + alpha3.toFixed(1) + '\u00B0 into wind'], '#000000', '#FFFFFF');
    var simT3 = (t * 0.15) % 4; var frac3 = constrain(simT3 / 3, 0, 1);
    M2_fill('#34d399', 1.0); noStroke();
    ellipse(ptAx + (ptBx - ptAx) * frac3, ptAy + (ptBy - ptAy) * frac3, 16, 10);
    if (frac3 >= 0.95) { M2_fill('#34d399', 0.9); textSize(14); textAlign(CENTER, CENTER); text('\u2714 Reached B!', ptBx + 40, ptBy + 20); }
  } else if (sub === 'crosswind_correction_angle') {
    var vaw4 = 400, alpha4 = 30, beta4 = 45, gamma4 = 180 - alpha4 - beta4;
    var va4 = vaw4 * Math.sin(gamma4 * Math.PI / 180) / Math.sin(beta4 * Math.PI / 180);
    var dist4 = 1000, time4 = dist4 / va4;
    M2_drawFormulaBox(10, 10, 420, ['|v_a| = |v_aw|\u00D7sin' + gamma4 + '\u00B0/sin' + beta4 + '\u00B0', '|v_a| \u2248 ' + va4.toFixed(1) + ' km/h', 'Time = ' + dist4 + '/' + va4.toFixed(1) + ' \u2248 ' + time4.toFixed(2) + 'h', 'Wrong: ' + dist4 + '/' + vaw4 + ' = ' + (dist4 / vaw4).toFixed(2) + 'h (misses B!)'], '#000000', '#FFFFFF');
  } else if (sub === 'ground_speed_calculation') {
    var cases5 = [{ label: 'Headwind', effect: 'v_a=v_aw\u2212v_w, LONGER', col: '#ef4444', y: 60 }, { label: 'Tailwind', effect: 'v_a=v_aw+v_w, SHORTER', col: '#34d399', y: 150 }, { label: 'Crosswind', effect: 'Must crab, v_a<v_aw', col: '#fbbf24', y: 240 }];
    for (var ci5 = 0; ci5 < 3; ci5++) {
      var c5 = cases5[ci5]; M2_fill('#000000', 0.4); noStroke(); rect(20, c5.y, width - 40, 70, 6);
      fill(M2_rgb(c5.col)[0], M2_rgb(c5.col)[1], M2_rgb(c5.col)[2]); textSize(14); textAlign(LEFT, TOP); text(c5.label, 35, c5.y + 8);
      fill(200); textSize(12); text(c5.effect, 35, c5.y + 30);
    }
  } else if (sub === 'time_from_ground_speed') {
    M2_drawFormulaBox(10, 10, 440, ['DC Pandey 6.33:', 'v_aw=400, v_w=200N, AB=1000km', 'sin\u03B1 = 200\u00D7sin45\u00B0/400 = 0.354', '\u03B1 = 20.7\u00B0, steer N69.3\u00B0E', '|v_a| \u2248 515 km/h', 't \u2248 1.94 hours'], '#000000', '#FFFFFF');
    var simT6 = (t * 0.15) % 4; var frac6 = constrain(simT6 / 3, 0, 1);
    M2_fill('#34d399', 1.0); noStroke();
    ellipse(ptAx + (ptBx - ptAx) * frac6, ptAy + (ptBy - ptAy) * frac6, 14, 10);

  } else if (sub === 'aw_wrong_heading_is_track') {
    var ptAx=width*0.2, ptAy=height*0.75, ptBx=width*0.75, ptBy=height*0.25;
    M2_drawAircraftMapEnv(ptAx,ptAy,ptBx,ptBy);
    var cx=width/2;
    var simT=M2_simT%4, frac=constrain(simT/3,0,1);
    var aimDx=ptBx-ptAx, aimDy=ptBy-ptAy;
    var planeX=ptAx+aimDx*frac+frac*50*0.5, planeY=ptAy+aimDy*frac-frac*50;
    M2_fill('#FF5050',1.0); noStroke(); ellipse(planeX,planeY,16,10);
    for(var wi=0;wi<3;wi++){ var wax=80+wi*200; M2_newArrow(wax,height*0.5,wax,height*0.5-25,'#64B4FF',''); }
    if(frac>=0.9){M2_fill('#ef4444',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER); text('MISSED B!',ptBx+50,ptBy-20);}
    M2_projWatermark('Aim at B directly','#ef4444');
    M2_drawFormulaBox(10,10,360,['Pilot aims straight at B','Wind pushes aircraft sideways','v_b = v_aw + v_w → actual path is NOT toward B','Must steer into crosswind to compensate!'],'#000000','#ef4444');

  } else if (sub === 'aw_aha_aim_to_compensate') {
    var ptAx=width*0.2, ptAy=height*0.75, ptBx=width*0.75, ptBy=height*0.25;
    M2_drawAircraftMapEnv(ptAx,ptAy,ptBx,ptBy);
    var simT=M2_simT%4, frac=constrain(simT/3,0,1);
    M2_fill('#34d399',1.0); noStroke();
    ellipse(ptAx+(ptBx-ptAx)*frac,ptAy+(ptBy-ptAy)*frac,16,10);
    M2_drawFormulaBox(10,10,360,['CORRECT: pilot steers UPSTREAM of destination','Wind drift + upstream steer = straight path to B','v_a = v_aw + v_w must point along AB','Solve sine rule triangle to find steering angle'],'#000000','#34d399');
    if(frac>=0.9){M2_fill('#34d399',0.9); noStroke(); textSize(14); textAlign(CENTER,CENTER); text('Reached B! ✓',ptBx+40,ptBy+20);}

  } else if (sub === 'uses_v_aw_for_time_s1') {
    var ptAx=width*0.2, ptAy=height*0.75, ptBx=width*0.75, ptBy=height*0.25;
    M2_drawAircraftMapEnv(ptAx,ptAy,ptBx,ptBy);
    M2_projWatermark('t=AB/|v_aw|','#ef4444');
    M2_drawFormulaBox(10,10,380,['Student: t=1000/400=2.5h (using v_aw)','Correct: |v_a|≈546km/h (from sine rule)','t=1000/546≈1.83h — 37% difference!','v_aw is speed through AIR — not over GROUND'],'#000000','#ef4444');

  } else if (sub === 'uses_v_aw_for_time_s2') {
    var ptAx=width*0.2, ptAy=height*0.75, ptBx=width*0.75, ptBy=height*0.25;
    M2_drawAircraftMapEnv(ptAx,ptAy,ptBx,ptBy);
    var cx=width/2;
    M2_drawFormulaBox(10,10,380,['ALWAYS use |v_a| (ground speed) for time','Headwind: |v_a|<|v_aw| → longer time','Tailwind: |v_a|>|v_aw| → shorter time','Crosswind: |v_a| from sine rule','t = AB / |v_a|  (always — no exceptions)'],'#000000','#34d399');

  } else if (sub === 'wrong_triangle_construction_s1') {
    var ptAx=width*0.2, ptAy=height*0.75, ptBx=width*0.75, ptBy=height*0.25;
    M2_drawAircraftMapEnv(ptAx,ptAy,ptBx,ptBy);
    var cx=width/2;
    M2_projWatermark('v_aw drawn along AB','#ef4444');
    var vdx=200, vdy=70, sc=0.35;
    M2_newArrow(vdx,height*0.5,vdx+80,height*0.5-60,'#ef4444','v_aw (WRONG — along AB)');
    M2_newArrow(vdx,height*0.5,vdx,height*0.5-40,'#64B4FF','v_w');
    M2_drawFormulaBox(10,10,360,['Student draws v_aw toward B (assuming the answer!)','v_aw direction is UNKNOWN — that is what we solve for','Drawing v_aw toward B assumes the answer before solving'],'#000000','#ef4444');

  } else if (sub === 'wrong_triangle_construction_s2') {
    var ptAx=width*0.2, ptAy=height*0.75, ptBx=width*0.75, ptBy=height*0.25;
    M2_drawAircraftMapEnv(ptAx,ptAy,ptBx,ptBy);
    var vdx=200, vdy=height*0.5, sc=0.5;
    M2_newArrow(vdx,vdy,vdx,vdy-80,'#64B4FF','v_w (given)');
    M2_newArrow(vdx,vdy,vdx+100,vdy-70,'#34d399','v_a (along AB, given dir)');
    M2_newArrow(vdx,vdy-80,vdx+100,vdy-70,'#FF5050','v_aw (closing side!)');
    M2_drawFormulaBox(10,10,360,['Step 1: draw v_w from A (given)','Step 2: draw v_a from A along AB (direction known)','Step 3: v_aw = closing side (from tip of v_w to tip of v_a)','THIS is the side we needed — angle α from sine rule'],'#000000','#34d399');

  } else if (sub === 'confuses_alpha_with_steering_direction_s1') {
    var ptAx=width*0.2, ptAy=height*0.75, ptBx=width*0.75, ptBy=height*0.25;
    M2_drawAircraftMapEnv(ptAx,ptAy,ptBx,ptBy);
    M2_projWatermark('α = steering bearing?','#ef4444');
    M2_drawFormulaBox(10,10,380,['Sine rule gives α=30° (angle between v_aw and v_a)','v_a direction (along AB) is 45° from east (NE)','Steering bearing = 45° + 30° = 75° from east = N75°E','α=30° is from AB, not from North!'],'#000000','#ef4444');

  } else if (sub === 'confuses_alpha_with_steering_direction_s2') {
    var ptAx=width*0.2, ptAy=height*0.75, ptBx=width*0.75, ptBy=height*0.25;
    M2_drawAircraftMapEnv(ptAx,ptAy,ptBx,ptBy);
    var vdx=150, vdy=height*0.5;
    var NEdeg=45, alphaDeg=30, steerDeg=NEdeg+alphaDeg;
    M2_drawAngleArc(vdx,vdy,40,0,NEdeg*Math.PI/180,'#34d399','AB=45°');
    M2_drawAngleArc(vdx,vdy,60,0,steerDeg*Math.PI/180,'#fbbf24','Steer=75°');
    M2_newArrow(vdx,vdy,vdx+80*Math.cos(NEdeg*Math.PI/180),vdy-80*Math.sin(NEdeg*Math.PI/180),'#34d399','AB (NE)');
    M2_newArrow(vdx,vdy,vdx+70*Math.cos(steerDeg*Math.PI/180),vdy-70*Math.sin(steerDeg*Math.PI/180),'#fbbf24','v_aw (N75°E)');
    M2_drawFormulaBox(10,10,380,['Two-step process:','1. α=30° from sine rule (angle from AB direction)','2. Steer = AB bearing + α = 45° + 30° = 75° from east','Convert: 90°-75° = 15° from north = N75°E'],'#000000','#fbbf24');

  } else {
    background(15, 15, 26); var cx = width / 2, cy = height / 2;
    M2_fill('#1a1a2e', 1.0); noStroke(); rect(20, cy - 40, width - 40, 80, 8);
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Scenario: ' + sub, cx, cy - 10);
    M2_fill('#888888', 1.0); textSize(11);
    text('Visual implementation pending', cx, cy + 15);
  }
}

// ── Projectile Helpers ──────────────────────────────────────

function M2_projGY() { return height - 50; }

function M2_projDrawGround(gy) {
  M2_stroke('#555566', 0.5); strokeWeight(1); line(0, gy, width, gy);
}

function M2_projScale(ux, uy, g, ox, gy) {
  var T = 2 * uy / g; var R = ux * T; var H = uy * uy / (2 * g);
  var scX = (width - ox - 40) / Math.max(R, 0.01);
  var scY = (gy - 60) / Math.max(H, 0.01);
  return Math.min(scX, scY, 12);
}

function M2_projArc(ox, oy, u, thRad, g, sc, col, nPts) {
  var ux = u * Math.cos(thRad); var uy = u * Math.sin(thRad);
  var T = 2 * uy / g; if (T <= 0) return 0;
  M2_stroke(col, 0.9); strokeWeight(2); noFill(); beginShape();
  for (var i = 0; i <= (nPts || 60); i++) {
    var ti = i / (nPts || 60) * T;
    vertex(ox + ux * ti * sc, oy - (uy * ti - 0.5 * g * ti * ti) * sc);
  }
  endShape(); return T;
}

function M2_projPosAt(ox, oy, ux, uy, g, sc, ti) {
  return { x: ox + ux * ti * sc, y: oy - (uy * ti - 0.5 * g * ti * ti) * sc };
}

function M2_projVyAt(uy, g, ti) { return uy - g * ti; }

function M2_projWatermark(txt, col) {
  M2_fill(col || '#E74C3C', 0.18); noStroke(); textSize(48); textAlign(RIGHT, TOP);
  text(txt, width - 20, 10);
}

// ── GROUP 1: Projectile Motion ──────────────────────────────

function M2_projectileMotion(cfg, stateData, t) {
  var pl = stateData.physics_layer || {};
  var vals = pl.values || {};
  var sub = pl.scenario || '';
  background(15, 15, 26);
  var GY = M2_projGY();
  var g = vals.g || 10;
  var u = vals.u || 20;
  var thDeg = vals.theta_deg || 45;
  var thRad = thDeg * Math.PI / 180;
  var ux = vals.ux !== undefined ? vals.ux : u * Math.cos(thRad);
  var uy = vals.uy !== undefined ? vals.uy : u * Math.sin(thRad);
  var ox = 60, oy = GY;

  // fallback: map idx to sub-scenario for EPIC-L path
  if (!sub) {
    var idx = M2_stateIdx();
    var fm = ['','projectile_launch','projectile_horizontal_only','projectile_vertical_only','projectile_full_parabola','projectile_apex','projectile_angle_sweep'];
    sub = fm[idx] || 'projectile_launch';
  }

  M2_projDrawGround(GY);
  var sc = M2_projScale(ux, uy, g, ox, GY);
  var T = 2 * uy / g;
  var R = ux * T;
  var H = uy * uy / (2 * g);

  // ─── projectile_launch ───
  if (sub === 'projectile_launch') {
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(ox, oy, 16, 16);
    var uL = 120;
    M2_newArrow(ox, oy, ox + uL * Math.cos(thRad), oy - uL * Math.sin(thRad), '#FFFFFF', 'u = ' + u + ' m/s');
    var uxL = uL * Math.cos(thRad); var uyL = uL * Math.sin(thRad);
    M2_newArrow(ox, oy, ox + uxL, oy, '#3498DB', 'ux = u cos\u03b8 = ' + ux.toFixed(1));
    M2_newArrow(ox, oy, ox, oy - uyL, '#E67E22', 'uy = u sin\u03b8 = ' + uy.toFixed(1));
    M2_drawAngleArc(ox, oy, 40, 0, thRad, '#fbbf24', '\u03b8=' + thDeg + '\u00b0');
    M2_drawDashedLine(ox + uxL, oy, ox + uxL, oy - uyL, '#555555', 4, 3);
    M2_drawDashedLine(ox, oy - uyL, ox + uxL, oy - uyL, '#555555', 4, 3);
  }

  // ─── projectile_horizontal_only ───
  else if (sub === 'projectile_horizontal_only') {
    var simT = (t * 0.4) % (T + 0.5); if (simT > T) simT = T;
    var nDots = 8;
    for (var di = 0; di <= nDots; di++) {
      var dx = ox + ux * (di * T / nDots) * sc;
      M2_fill('#3498DB', 0.4); noStroke(); ellipse(dx, oy - 15, 8, 8);
    }
    var bx = ox + ux * simT * sc;
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(bx, oy, 16, 16);
    M2_newArrow(bx, oy - 20, bx + 60, oy - 20, '#3498DB', 'ux = ' + ux.toFixed(1));
    M2_textBox(width / 2 - 30, 40, 'ax = 0', '#3498DB', 18);
    M2_textBox(20, height - 30, 'Horizontal: no gravity effect \u2014 ax = 0', '#AAAAAA', 12);
  }

  // ─── projectile_vertical_only ───
  else if (sub === 'projectile_vertical_only') {
    var cx = width / 2;
    var Tup = uy / g; var Hv = uy * uy / (2 * g);
    var scV = (GY - 80) / Math.max(Hv, 0.01);
    var period = 2 * Tup + 0.5;
    var simT = (t * 0.4) % period; if (simT > 2 * Tup) simT = 2 * Tup;
    var yPhys = uy * simT - 0.5 * g * simT * simT; if (yPhys < 0) yPhys = 0;
    var vy = uy - g * simT;
    var by = GY - yPhys * scV;
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(cx, by, 16, 16);
    var vyLen = vy * 4;
    if (Math.abs(vyLen) > 3) {
      M2_newArrow(cx + 20, by, cx + 20, by - vyLen, '#E67E22', 'vy=' + vy.toFixed(1));
    } else {
      M2_textBox(cx + 25, by - 5, 'vy=0', '#E67E22', 11);
    }
    M2_textBox(width - 120, 40, 'ay = -g = -' + g, '#E67E22', 14);
    M2_textBox(20, height - 30, 'Vertical: just like a ball thrown upward', '#AAAAAA', 12);
  }

  // ─── projectile_full_parabola ───
  else if (sub === 'projectile_full_parabola') {
    var simT = (t * 0.3) % (T + 0.5); if (simT > T) simT = T;
    M2_projArc(ox, oy, u, thRad, g, sc, 'rgba(231,76,60,0.3)', 60);
    var bp = M2_projPosAt(ox, oy, ux, uy, g, sc, simT);
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(bp.x, bp.y, 14, 14);
    for (var qi = 0; qi < 5; qi++) {
      var ti = (qi + 0.5) * T / 5;
      var pp = M2_projPosAt(ox, oy, ux, uy, g, sc, ti);
      var vyI = M2_projVyAt(uy, g, ti);
      M2_newArrow(pp.x, pp.y, pp.x + ux * 3, pp.y, '#3498DB', qi === 2 ? 'ux=const' : '');
      M2_newArrow(pp.x, pp.y, pp.x, pp.y - vyI * 3, '#E67E22', qi === 2 ? 'vy' : '');
    }
    M2_textBox(20, 20, 'ux = const, vy changes', '#fbbf24', 13);
  }

  // ─── projectile_apex ───
  else if (sub === 'projectile_apex') {
    M2_projArc(ox, oy, u, thRad, g, sc, 'rgba(231,76,60,0.2)', 60);
    var tApex = uy / g;
    var ap = M2_projPosAt(ox, oy, ux, uy, g, sc, tApex);
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(ap.x, ap.y, 16, 16);
    M2_newArrow(ap.x, ap.y, ap.x + ux * 4, ap.y, '#3498DB', 'vx = ' + ux.toFixed(1) + ' m/s');
    M2_textBox(ap.x + 10, ap.y + 20, 'vy = 0', '#E67E22', 13);
    M2_drawDashedLine(ap.x - 20, oy, ap.x - 20, ap.y, '#fbbf24', 4, 3);
    M2_fill('#fbbf24', 0.9); noStroke(); textSize(12); textAlign(RIGHT, CENTER);
    text('H = ' + H.toFixed(1) + ' m', ap.x - 25, (oy + ap.y) / 2);
    M2_textBox(20, height - 30, 'Speed at top = ux = u cos\u03b8 (NOT zero)', '#27AE60', 13);
  }

  // ─── projectile_angle_sweep ───
  else if (sub === 'projectile_angle_sweep') {
    var angles = vals.angles_deg || [30, 45, 60, 75];
    var cols = ['#3498DB', '#27AE60', '#E67E22', '#C896FF'];
    var maxR = 0;
    for (var ai = 0; ai < angles.length; ai++) {
      var aRad = angles[ai] * Math.PI / 180;
      var aR = u * u * Math.sin(2 * aRad) / g;
      if (aR > maxR) maxR = aR;
    }
    var aSc = (width - ox - 40) / Math.max(maxR, 0.01);
    aSc = Math.min(aSc, (GY - 60) / (u * u / (2 * g)));
    for (var ai2 = 0; ai2 < angles.length; ai2++) {
      var aRad2 = angles[ai2] * Math.PI / 180;
      var col2 = angles[ai2] === 45 ? '#27AE60' : cols[ai2 % 4];
      var sw = angles[ai2] === 45 ? 3 : 2;
      M2_stroke(col2, 0.9); strokeWeight(sw); noFill(); beginShape();
      var aT = 2 * u * Math.sin(aRad2) / g;
      for (var j = 0; j <= 50; j++) {
        var tj = j / 50 * aT;
        vertex(ox + u * Math.cos(aRad2) * tj * aSc, oy - (u * Math.sin(aRad2) * tj - 0.5 * g * tj * tj) * aSc);
      }
      endShape();
      var Ri = u * u * Math.sin(2 * aRad2) / g;
      var lx = ox + Ri * aSc;
      M2_fill(col2, 0.9); noStroke(); textSize(10); textAlign(CENTER, TOP);
      text(angles[ai2] + '\u00b0: R=' + Ri.toFixed(1), lx, oy + 5);
    }
    M2_textBox(20, 20, 'R is maximum at \u03b8 = 45\u00b0. R(30\u00b0) = R(60\u00b0)', '#fbbf24', 13);
  }

  // ─── projectile_component_tracking ───
  else if (sub === 'projectile_component_tracking') {
    var midY = height / 2;
    M2_stroke('#555555', 0.5); strokeWeight(1); line(0, midY, width, midY);
    var simT = (t * 0.3) % (T + 0.3); if (simT > T) simT = T;
    var frac = simT / T;
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke(); text('HORIZONTAL (ux)', width / 2, 10);
    var topCy = midY / 2;
    M2_newArrow(width * 0.2, topCy, width * 0.2 + ux * 4, topCy, '#3498DB', 'ux = ' + ux.toFixed(1) + ' (constant)');
    var tmX = width * 0.2 + frac * (width * 0.6);
    M2_fill('#FFFFFF', 0.5); noStroke(); ellipse(tmX, topCy + 30, 6, 6);
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke(); text('VERTICAL (vy)', width / 2, midY + 10);
    var botCy = midY + (height - midY) / 2;
    var vyNow = M2_projVyAt(uy, g, simT);
    var vyLen = vyNow * 4;
    if (Math.abs(vyLen) > 2) {
      M2_newArrow(width / 2, botCy, width / 2, botCy - vyLen, '#E67E22', 'vy = ' + vyNow.toFixed(1));
    } else {
      M2_textBox(width / 2 + 10, botCy - 5, 'vy = 0 (apex!)', '#E67E22', 12);
    }
    M2_textBox(20, height - 30, 'ux: never changes. vy: gravity changes this.', '#AAAAAA', 12);
  }

  // ─── projectile_complementary_arcs ───
  else if (sub === 'projectile_complementary_arcs') {
    var th30 = 30 * Math.PI / 180; var th60 = 60 * Math.PI / 180;
    var R30 = u * u * Math.sin(2 * th30) / g;
    var H60 = u * u * Math.sin(th60) * Math.sin(th60) / (2 * g);
    var cSc = Math.min((width - ox - 40) / Math.max(R30, 0.01), (GY - 60) / Math.max(H60, 0.01));
    M2_projArc(ox, oy, u, th30, g, cSc, '#3498DB', 60);
    M2_projArc(ox, oy, u, th60, g, cSc, '#E67E22', 60);
    var landX = ox + R30 * cSc;
    M2_drawDashedLine(landX, oy, landX, oy - H60 * cSc - 20, '#fbbf24', 4, 3);
    M2_fill('#3498DB', 0.9); noStroke(); textSize(11); textAlign(CENTER, TOP);
    text('30\u00b0: R=' + R30.toFixed(1), landX - 30, oy + 5);
    M2_fill('#E67E22', 0.9); text('60\u00b0: R=' + R30.toFixed(1), landX + 30, oy + 18);
    M2_textBox(20, 20, 'R(30\u00b0) = R(60\u00b0) \u2014 same range, different shapes', '#fbbf24', 13);
  }

  // ─── projectile_wrong_horizontal (EPIC-C) ───
  else if (sub === 'projectile_wrong_horizontal') {
    M2_projArc(ox, oy, u, thRad, g, sc, 'rgba(231,76,60,0.3)', 60);
    for (var wi = 0; wi < 5; wi++) {
      var wt = (wi + 0.5) * T / 5;
      var wp = M2_projPosAt(ox, oy, ux, uy, g, sc, wt);
      var shrink = 1.0 - wi * 0.18;
      M2_newArrow(wp.x, wp.y, wp.x + ux * 3 * shrink, wp.y, '#3498DB', wi === 0 ? 'ux (shrinking!)' : '');
    }
    M2_projWatermark('INCORRECT', '#E74C3C');
    M2_textBox(20, height - 30, 'Wrong belief: horizontal velocity decreases', '#E74C3C', 12);
  }

  // ─── projectile_wrong_apex (EPIC-C) ───
  else if (sub === 'projectile_wrong_apex') {
    M2_projArc(ox, oy, u, thRad, g, sc, 'rgba(231,76,60,0.2)', 60);
    var tApex = uy / g;
    var ap = M2_projPosAt(ox, oy, ux, uy, g, sc, tApex);
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(ap.x, ap.y, 16, 16);
    M2_fill('#FFFFFF', 0.9); noStroke(); textSize(16); textAlign(CENTER, CENTER);
    text('v = 0', ap.x, ap.y - 25);
    M2_projWatermark('INCORRECT', '#E74C3C');
    M2_textBox(20, height - 30, 'Wrong belief: ball completely stops at the top', '#E74C3C', 12);
  }

  // ─── projectile_apex_correct ───
  else if (sub === 'projectile_apex_correct') {
    M2_projArc(ox, oy, u, thRad, g, sc, 'rgba(231,76,60,0.2)', 60);
    var tApex = uy / g;
    var ap = M2_projPosAt(ox, oy, ux, uy, g, sc, tApex);
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(ap.x, ap.y, 16, 16);
    M2_newArrow(ap.x, ap.y, ap.x + ux * 4, ap.y, '#3498DB', 'vx = ux = ' + ux.toFixed(1) + ' m/s');
    M2_textBox(ap.x + 10, ap.y + 15, 'vy = 0', '#E67E22', 12);
    M2_fill('#27AE60', 0.25); noStroke(); textSize(48); textAlign(RIGHT, TOP);
    text('\u2714', width - 20, 10);
    M2_textBox(20, height - 30, 'Speed at top = ux = u cos\u03b8 \u2260 0', '#27AE60', 13);
  }

  // ─── projectile_dual_comparison ───
  else if (sub === 'projectile_dual_comparison') {
    var midY = height / 2;
    M2_stroke('#555555', 0.3); strokeWeight(1); line(0, midY, width, midY);
    var halfH = midY - 20;
    var dSc = Math.min((width - ox - 40) / Math.max(R, 0.01), (halfH - 30) / Math.max(H, 0.01), 8);
    fill(200, 200, 200, 150); textSize(11); textAlign(LEFT, TOP); noStroke(); text('Your belief', 10, 5);
    var oyTop = midY - 15;
    M2_stroke('#555566', 0.3); strokeWeight(1); line(0, oyTop, width, oyTop);
    M2_projArc(ox, oyTop, u, thRad, g, dSc, 'rgba(231,76,60,0.3)', 40);
    for (var wi2 = 0; wi2 < 4; wi2++) {
      var wt2 = (wi2 + 0.5) * T / 4;
      var wp2 = M2_projPosAt(ox, oyTop, ux, uy, g, dSc, wt2);
      M2_newArrow(wp2.x, wp2.y, wp2.x + ux * 2 * (1.0 - wi2 * 0.25), wp2.y, '#E74C3C', '');
    }
    var wrongR = R * 0.65;
    M2_fill('#E74C3C', 0.7); noStroke(); ellipse(ox + wrongR * dSc, oyTop, 8, 8);
    fill(200, 200, 200, 150); textSize(11); textAlign(LEFT, TOP); noStroke(); text('Reality', 10, midY + 5);
    var oyBot = height - 15;
    M2_stroke('#555566', 0.3); strokeWeight(1); line(0, oyBot, width, oyBot);
    M2_projArc(ox, oyBot, u, thRad, g, dSc, 'rgba(39,174,96,0.3)', 40);
    for (var wi3 = 0; wi3 < 4; wi3++) {
      var wt3 = (wi3 + 0.5) * T / 4;
      var wp3 = M2_projPosAt(ox, oyBot, ux, uy, g, dSc, wt3);
      M2_newArrow(wp3.x, wp3.y, wp3.x + ux * 2, wp3.y, '#27AE60', '');
    }
    M2_fill('#27AE60', 0.7); noStroke(); ellipse(ox + R * dSc, oyBot, 8, 8);
  }

  // ─── force_decomposition ───
  else if (sub === 'force_decomposition') {
    var cx = width / 2, cy = height / 2 - 30;
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(cx, cy, 16, 16);
    M2_newArrow(cx, cy, cx, cy + 120, '#FFFFFF', 'g = ' + g + ' m/s\u00b2');
    M2_stroke('#3498DB', 0.5); strokeWeight(2);
    line(cx - 40, cy + 60, cx + 40, cy + 60);
    M2_fill('#3498DB', 0.8); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('Horizontal = 0', cx, cy + 80);
    M2_newArrow(cx + 60, cy, cx + 60, cy + 120, '#E67E22', 'Vertical = g');
    M2_textBox(20, height - 30, 'Gravity is purely vertical \u2014 horizontal component = 0', '#fbbf24', 13);
  }

  // ─── projectile_horizontal_constant (EPIC-C correct view) ───
  else if (sub === 'projectile_horizontal_constant') {
    M2_projArc(ox, oy, u, thRad, g, sc, 'rgba(39,174,96,0.3)', 60);
    for (var ci = 0; ci < 5; ci++) {
      var ct = (ci + 0.5) * T / 5;
      var cp = M2_projPosAt(ox, oy, ux, uy, g, sc, ct);
      M2_newArrow(cp.x, cp.y, cp.x + ux * 3, cp.y, '#3498DB', ci === 2 ? 'ux = ' + ux.toFixed(1) : '');
    }
    for (var di2 = 0; di2 <= 6; di2++) {
      var dxt = di2 * T / 6;
      M2_fill('#3498DB', 0.4); noStroke(); ellipse(ox + ux * dxt * sc, oy + 15, 6, 6);
    }
    M2_textBox(width / 2 - 20, 40, 'ax = 0', '#3498DB', 16);
    M2_textBox(20, height - 30, 'Equal spacing = constant speed. Frictionless horizontal.', '#27AE60', 12);
  }

  // ─── projectile_full_with_apex_highlight ───
  else if (sub === 'projectile_full_with_apex_highlight') {
    var simT = (t * 0.3) % (T + 0.5); if (simT > T) simT = T;
    M2_projArc(ox, oy, u, thRad, g, sc, 'rgba(231,76,60,0.3)', 60);
    var bp = M2_projPosAt(ox, oy, ux, uy, g, sc, simT);
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(bp.x, bp.y, 14, 14);
    M2_newArrow(bp.x, bp.y, bp.x + ux * 3, bp.y, '#3498DB', 'ux');
    var vyNow = M2_projVyAt(uy, g, simT);
    if (Math.abs(vyNow) > 0.3) {
      M2_newArrow(bp.x, bp.y, bp.x, bp.y - vyNow * 3, '#E67E22', 'vy');
    }
    var tApex = uy / g;
    var apP = M2_projPosAt(ox, oy, ux, uy, g, sc, tApex);
    M2_stroke('#fbbf24', 0.6); strokeWeight(1.5); noFill();
    ellipse(apP.x, apP.y, 30, 30);
    M2_fill('#fbbf24', 0.7); noStroke(); textSize(10); textAlign(CENTER, BOTTOM);
    text('APEX: vy=0', apP.x, apP.y - 18);
    M2_textBox(20, height - 30, 'vy = 0 at top is momentary. Horizontal never pauses.', '#fbbf24', 12);
  }

  // ─── projectile_wrong_range (EPIC-C complementary) ───
  else if (sub === 'projectile_wrong_range') {
    var th30 = 30 * Math.PI / 180; var th60 = 60 * Math.PI / 180;
    var R30 = u * u * Math.sin(2 * th30) / g;
    var H60 = u * u * Math.sin(th60) * Math.sin(th60) / (2 * g);
    var wSc = Math.min((width - ox - 40) / Math.max(R30 * 1.3, 0.01), (GY - 60) / Math.max(H60, 0.01));
    M2_projArc(ox, oy, u, th30, g, wSc, '#3498DB', 60);
    M2_projArc(ox, oy, u, th60, g, wSc, '#E67E22', 60);
    var land30 = ox + R30 * wSc;
    M2_fill('#3498DB', 0.9); noStroke(); textSize(11); textAlign(CENTER, TOP);
    text('30\u00b0: R=' + R30.toFixed(1), land30, oy + 5);
    M2_fill('#E67E22', 0.9); text('60\u00b0', land30 + 20, oy + 18);
    M2_fill('#E74C3C', 0.8); textSize(14); textAlign(CENTER, CENTER);
    text('60\u00b0 goes farther? \u2192', width - 140, oy - 30);
    M2_projWatermark('WRONG', '#E74C3C');
  }

  // ─── range_formula_display ───
  else if (sub === 'range_formula_display') {
    var sin60 = Math.sin(60 * Math.PI / 180);
    var sin120 = Math.sin(120 * Math.PI / 180);
    M2_drawFormulaBox(40, 40, width - 80, [
      'R = u\u00b2 sin2\u03b8 / g',
      '',
      'For \u03b8 = 30\u00b0:  2\u03b8 = 60\u00b0   sin60\u00b0 = ' + sin60.toFixed(3),
      'For \u03b8 = 60\u00b0:  2\u03b8 = 120\u00b0  sin120\u00b0 = ' + sin120.toFixed(3),
      '',
      'sin60\u00b0 = sin120\u00b0 = ' + sin60.toFixed(3),
      '',
      '\u2234 R(30\u00b0) = R(60\u00b0)  \u2714'
    ], '#000000', '#fbbf24');
  }

  // ─── fallback ───
  else {
    M2_unknownBanner('projectile_motion/' + sub);
  }
}

// ── Inclined Plane Helpers ──────────────────────────────────

function M2_incDrawPlane(alpha, col) {
  // Draw incline from bottom-left rising to the right at angle alpha
  var x0 = 40, y0 = height - 50;
  var planeLen = width - 80;
  var x1 = x0 + planeLen * Math.cos(alpha);
  var y1 = y0 - planeLen * Math.sin(alpha);
  M2_stroke(col || '#777777', 0.8); strokeWeight(3);
  line(x0, y0, x1, y1);
  // ground line below
  M2_stroke('#555566', 0.5); strokeWeight(1);
  line(0, y0, width, y0);
  return { x0: x0, y0: y0, x1: x1, y1: y1, len: planeLen };
}

function M2_incArcOnSlope(ox, oy, u, thFromHoriz, alpha, g, sc, col, nPts) {
  // Projectile on incline: tilted frame
  var uxT = u * Math.cos(thFromHoriz - alpha);
  var uyT = u * Math.sin(thFromHoriz - alpha);
  var axT = -g * Math.sin(alpha);
  var ayT = -g * Math.cos(alpha);
  var T = -2 * uyT / ayT; if (T <= 0) return 0;
  M2_stroke(col, 0.9); strokeWeight(2); noFill(); beginShape();
  for (var i = 0; i <= (nPts || 60); i++) {
    var ti = i / (nPts || 60) * T;
    var xT = uxT * ti + 0.5 * axT * ti * ti; // along slope
    var yT = uyT * ti + 0.5 * ayT * ti * ti; // perp to slope
    // rotate from tilted to canvas coords
    var cx = ox + xT * sc * Math.cos(alpha) - yT * sc * Math.sin(alpha);
    var cy = oy - xT * sc * Math.sin(alpha) - yT * sc * Math.cos(alpha);
    vertex(cx, cy);
  }
  endShape();
  // return range along slope
  var Rslope = uxT * T + 0.5 * axT * T * T;
  return { T: T, R: Rslope, uxT: uxT, uyT: uyT };
}

// ── GROUP 2: Projectile on Inclined Plane ───────────────────

function M2_projectileInclined(cfg, stateData, t) {
  var pl = stateData.physics_layer || {};
  var vals = pl.values || {};
  var sub = pl.scenario || '';
  background(15, 15, 26);
  var g = vals.g || 10;
  var u = vals.u || 20;
  var alphaDeg = vals.alpha_deg || 30;
  var thetaDeg = vals.theta_deg || 60;
  var alphaRad = alphaDeg * Math.PI / 180;
  var thetaRad = thetaDeg * Math.PI / 180;

  if (!sub) {
    var idx = M2_stateIdx();
    var fm = ['','inclined_projectile_setup','inclined_velocity_decomposition','inclined_projectile_arc','inclined_range_vs_angle','inclined_up_vs_down','inclined_formula_comparison'];
    sub = fm[idx] || 'inclined_projectile_setup';
  }

  var plane = M2_incDrawPlane(alphaRad, '#777777');
  var ox = plane.x0, oy = plane.y0;
  var sc = Math.min(6, (width - 100) / 60);

  // ─── inclined_projectile_setup ───
  if (sub === 'inclined_projectile_setup') {
    // x-axis along slope
    var axLen = 160;
    var axEx = ox + axLen * Math.cos(alphaRad);
    var axEy = oy - axLen * Math.sin(alphaRad);
    M2_newArrow(ox, oy, axEx, axEy, '#34d399', 'x (along slope)');
    // y-axis perpendicular to slope
    var ayEx = ox - axLen * 0.5 * Math.sin(alphaRad);
    var ayEy = oy - axLen * 0.5 * Math.cos(alphaRad);
    M2_newArrow(ox, oy, ayEx, ayEy, '#60a5fa', 'y (\u22a5 slope)');
    // g vector down
    M2_newArrow(ox + 80, oy - 80, ox + 80, oy + 20, '#FFFFFF', 'g');
    // g sin alpha along slope (down)
    var gSinLen = 80 * Math.sin(alphaRad);
    M2_newArrow(ox + 150, oy - 60, ox + 150 + gSinLen * Math.cos(alphaRad + Math.PI), oy - 60 + gSinLen * Math.sin(alphaRad + Math.PI), '#E74C3C', 'g sin\u03b1');
    // g cos alpha into slope
    var gCosLen = 80 * Math.cos(alphaRad);
    M2_newArrow(ox + 150, oy - 60, ox + 150 + gCosLen * Math.sin(alphaRad), oy - 60 + gCosLen * Math.cos(alphaRad), '#E67E22', 'g cos\u03b1');
    // angle label
    M2_drawAngleArc(ox, oy, 50, 0, alphaRad, '#fbbf24', '\u03b1=' + alphaDeg + '\u00b0');
    // ball
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(ox, oy, 14, 14);
  }

  // ─── inclined_velocity_decomposition ───
  else if (sub === 'inclined_velocity_decomposition') {
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(ox, oy, 14, 14);
    // u vector at theta from horizontal
    var uLen = 120;
    M2_newArrow(ox, oy, ox + uLen * Math.cos(thetaRad), oy - uLen * Math.sin(thetaRad), '#FFFFFF', 'u = ' + u);
    // ux along slope = u cos(theta - alpha)
    var effAngle = thetaRad - alphaRad;
    var uxT = u * Math.cos(effAngle);
    var uyT = u * Math.sin(effAngle);
    var uxLen = 90;
    M2_newArrow(ox, oy, ox + uxLen * Math.cos(alphaRad), oy - uxLen * Math.sin(alphaRad), '#3498DB', 'ux = u cos(\u03b8-\u03b1) = ' + uxT.toFixed(1));
    // uy perp to slope
    var uyLen = 70;
    M2_newArrow(ox, oy, ox - uyLen * Math.sin(alphaRad), oy - uyLen * Math.cos(alphaRad), '#E67E22', 'uy = u sin(\u03b8-\u03b1) = ' + uyT.toFixed(1));
    M2_drawAngleArc(ox, oy, 35, 0, thetaRad, '#fbbf24', '\u03b8=' + thetaDeg + '\u00b0');
  }

  // ─── inclined_projectile_arc ───
  else if (sub === 'inclined_projectile_arc') {
    var result = M2_incArcOnSlope(ox, oy, u, thetaRad, alphaRad, g, sc, '#E74C3C', 60);
    if (result && result.R) {
      // R label along slope
      var Rx = ox + result.R * sc * Math.cos(alphaRad);
      var Ry = oy - result.R * sc * Math.sin(alphaRad);
      M2_fill('#fbbf24', 0.9); noStroke(); textSize(12); textAlign(CENTER, CENTER);
      text('R = ' + result.R.toFixed(1) + ' m', (ox + Rx) / 2, (oy + Ry) / 2 - 15);
      // landing point
      M2_fill('#27AE60', 1.0); noStroke(); ellipse(Rx, Ry, 10, 10);
      M2_fill('#FFFFFF', 0.7); textSize(10); textAlign(LEFT, CENTER); text('B', Rx + 8, Ry);
    }
    // acceleration labels
    M2_textBox(20, 20, 'ax = -g sin\u03b1 = ' + (-g * Math.sin(alphaRad)).toFixed(1), '#E74C3C', 12);
    M2_textBox(20, 40, 'ay = -g cos\u03b1 = ' + (-g * Math.cos(alphaRad)).toFixed(1), '#E67E22', 12);
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(ox, oy, 12, 12);
    M2_fill('#FFFFFF', 0.7); textSize(10); textAlign(RIGHT, CENTER); text('O', ox - 8, oy);
  }

  // ─── inclined_range_vs_angle ───
  else if (sub === 'inclined_range_vs_angle') {
    // R vs theta curve
    var gox = 80, goy = height - 80, gw = width - 160, gh = 280;
    M2_drawAxes(gox, goy, gw, gh, '\u03b8 (deg)', 'R (m)', '#555566');
    var thetaMax = 45 + alphaDeg / 2;
    var maxRval = 0;
    // compute max for scaling
    for (var si = 0; si <= 90; si++) {
      var sRad = si * Math.PI / 180;
      var sR = 2 * u * u * Math.sin(sRad - alphaRad) * Math.cos(sRad) / (g * Math.cos(alphaRad) * Math.cos(alphaRad));
      if (sR > maxRval) maxRval = sR;
    }
    // draw curve
    M2_stroke('#60a5fa', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var si2 = Math.ceil(alphaDeg); si2 <= 90; si2++) {
      var sRad2 = si2 * Math.PI / 180;
      var sR2 = 2 * u * u * Math.sin(sRad2 - alphaRad) * Math.cos(sRad2) / (g * Math.cos(alphaRad) * Math.cos(alphaRad));
      if (sR2 < 0) sR2 = 0;
      vertex(gox + (si2 / 90) * gw, goy - (sR2 / Math.max(maxRval, 0.01)) * gh * 0.9);
    }
    endShape();
    // mark maximum
    var tmRad = thetaMax * Math.PI / 180;
    var tmR = 2 * u * u * Math.sin(tmRad - alphaRad) * Math.cos(tmRad) / (g * Math.cos(alphaRad) * Math.cos(alphaRad));
    var tmX = gox + (thetaMax / 90) * gw;
    var tmY = goy - (tmR / Math.max(maxRval, 0.01)) * gh * 0.9;
    M2_fill('#27AE60', 1.0); noStroke(); ellipse(tmX, tmY, 10, 10);
    M2_textBox(tmX + 5, tmY - 15, '\u03b8max = ' + thetaMax.toFixed(0) + '\u00b0', '#27AE60', 11);
    // flat ground comparison
    M2_drawDashedLine(gox + (45 / 90) * gw, goy, gox + (45 / 90) * gw, goy - gh * 0.3, '#888888', 3, 3);
    M2_fill('#888888', 0.6); noStroke(); textSize(9); textAlign(CENTER, TOP);
    text('Flat: 45\u00b0', gox + (45 / 90) * gw, goy + 5);
  }

  // ─── inclined_up_vs_down ───
  else if (sub === 'inclined_up_vs_down') {
    // up the slope arc
    M2_incArcOnSlope(ox, oy, u, thetaRad, alphaRad, g, sc * 0.7, '#3498DB', 60);
    // down the slope arc (replace alpha with -alpha)
    M2_incArcOnSlope(ox, oy, u, thetaRad, -alphaRad, g, sc * 0.7, '#E67E22', 60);
    M2_fill('#3498DB', 0.9); noStroke(); textSize(12); textAlign(LEFT, TOP);
    text('Up slope (R_up)', 20, 20);
    M2_fill('#E67E22', 0.9); text('Down slope (R_down)', 20, 38);
    M2_textBox(20, height - 30, 'R_down > R_up always \u2014 gravity helps downhill', '#fbbf24', 12);
  }

  // ─── inclined_formula_comparison ───
  else if (sub === 'inclined_formula_comparison') {
    // wrong: flat formula
    var wrongR = u * u * Math.sin(2 * thetaRad) / g;
    // correct: inclined formula
    var uxT = u * Math.cos(thetaRad - alphaRad);
    var uyT = u * Math.sin(thetaRad - alphaRad);
    var ayT = -g * Math.cos(alphaRad);
    var Tinc = -2 * uyT / ayT;
    var axT = -g * Math.sin(alphaRad);
    var correctR = uxT * Tinc + 0.5 * axT * Tinc * Tinc;
    M2_drawFormulaBox(20, 20, width - 40, [
      'WRONG (flat formula): R = u\u00b2sin2\u03b8/g = ' + wrongR.toFixed(1) + ' m  \u2718',
      '',
      'CORRECT (tilted frame): R = ' + correctR.toFixed(1) + ' m  \u2714',
      '',
      'Flat formula ignores the slope entirely!'
    ], '#000000', '#fbbf24');
    // visual markers on slope
    var wrongLx = ox + wrongR * sc * 0.3 * Math.cos(alphaRad);
    var wrongLy = oy - wrongR * sc * 0.3 * Math.sin(alphaRad);
    M2_fill('#E74C3C', 0.8); noStroke(); ellipse(wrongLx, wrongLy + 30, 10, 10);
    M2_fill('#E74C3C', 0.8); textSize(10); textAlign(CENTER, TOP); text('Flat prediction', wrongLx, wrongLy + 42);
    var corrLx = ox + correctR * sc * 0.3 * Math.cos(alphaRad);
    var corrLy = oy - correctR * sc * 0.3 * Math.sin(alphaRad);
    M2_fill('#27AE60', 0.8); noStroke(); ellipse(corrLx, corrLy, 10, 10);
    M2_fill('#27AE60', 0.8); textSize(10); textAlign(CENTER, BOTTOM); text('Correct landing', corrLx, corrLy - 5);
  }

  // ─── inclined_wrong_formula (EPIC-C) ───
  else if (sub === 'inclined_wrong_formula') {
    var wrongR = u * u * Math.sin(2 * thetaRad) / g;
    // flat formula prediction — not on slope
    var wrongX = ox + wrongR * 0.15;
    var wrongY = oy; // on ground level, not on slope
    // where slope actually is at that x
    var slopeYatX = oy - (wrongX - ox) * Math.tan(alphaRad);
    M2_fill('#E74C3C', 0.9); noStroke(); ellipse(wrongX, wrongY, 12, 12);
    M2_textBox(wrongX + 10, wrongY + 5, 'Flat formula says: here', '#E74C3C', 11);
    // show it's below the slope
    M2_drawDashedLine(wrongX, slopeYatX, wrongX, wrongY, '#E74C3C', 3, 3);
    M2_projWatermark('WRONG', '#E74C3C');
    M2_textBox(20, height - 30, 'Flat formula predicts: here (WRONG \u2014 not on slope)', '#E74C3C', 12);
  }

  // ─── inclined_axis_mismatch (EPIC-C) ───
  else if (sub === 'inclined_axis_mismatch') {
    var midX = width / 2;
    M2_stroke('#555555', 0.5); strokeWeight(1); line(midX, 0, midX, height);
    // Left: flat ground
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke(); text('Flat Ground', midX / 2, 10);
    M2_textBox(30, 40, 'ax = 0  \u2714', '#27AE60', 12);
    M2_textBox(30, 60, 'ay = -g  \u2714', '#27AE60', 12);
    M2_newArrow(midX / 2 - 40, height / 2, midX / 2 + 40, height / 2, '#3498DB', 'x');
    M2_newArrow(midX / 2, height / 2 + 40, midX / 2, height / 2 - 40, '#E67E22', 'y');
    // Right: incline
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke(); text('Inclined Plane', midX + midX / 2, 10);
    M2_textBox(midX + 30, 40, 'ax = -g sin\u03b1 \u2260 0  \u2718', '#E74C3C', 12);
    M2_textBox(midX + 30, 60, 'ay = -g cos\u03b1 \u2260 g  \u2718', '#E74C3C', 12);
    // tilted axes on right
    var rcx = midX + midX / 2, rcy = height / 2 + 20;
    M2_newArrow(rcx, rcy, rcx + 60 * Math.cos(alphaRad), rcy - 60 * Math.sin(alphaRad), '#3498DB', "x'");
    M2_newArrow(rcx, rcy, rcx - 60 * Math.sin(alphaRad), rcy - 60 * Math.cos(alphaRad), '#E67E22', "y'");
    M2_textBox(20, height - 30, 'Flat formula assumes ax=0. On incline, ax \u2260 0.', '#fbbf24', 12);
  }

  // ─── inclined_correct_setup (EPIC-C) ───
  else if (sub === 'inclined_correct_setup') {
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(ox, oy, 14, 14);
    var effAngle = thetaRad - alphaRad;
    var uxT = u * Math.cos(effAngle);
    var uyT = u * Math.sin(effAngle);
    // tilted axes
    var axLen = 140;
    M2_newArrow(ox, oy, ox + axLen * Math.cos(alphaRad), oy - axLen * Math.sin(alphaRad), '#34d399', 'x (along slope)');
    M2_newArrow(ox, oy, ox - axLen * 0.6 * Math.sin(alphaRad), oy - axLen * 0.6 * Math.cos(alphaRad), '#60a5fa', 'y (\u22a5 slope)');
    // velocity components in tilted frame
    M2_textBox(20, 20, 'ux = u cos(\u03b8-\u03b1) = ' + uxT.toFixed(1), '#3498DB', 13);
    M2_textBox(20, 42, 'uy = u sin(\u03b8-\u03b1) = ' + uyT.toFixed(1), '#E67E22', 13);
    M2_textBox(20, 64, 'ax = -g sin\u03b1 = ' + (-g * Math.sin(alphaRad)).toFixed(1), '#E74C3C', 13);
    M2_textBox(20, 86, 'ay = -g cos\u03b1 = ' + (-g * Math.cos(alphaRad)).toFixed(1), '#E74C3C', 13);
  }

  // ─── inclined_correct_vs_wrong ───
  else if (sub === 'inclined_correct_vs_wrong') {
    var wrongR = u * u * Math.sin(2 * thetaRad) / g;
    var result = M2_incArcOnSlope(ox, oy, u, thetaRad, alphaRad, g, sc * 0.6, '#27AE60', 60);
    var correctR = (result && result.R) ? result.R : 10;
    // wrong landing (off slope)
    var wrongLx = ox + wrongR * sc * 0.2;
    M2_fill('#E74C3C', 0.8); noStroke(); ellipse(wrongLx, oy, 10, 10);
    M2_fill('#E74C3C', 0.8); textSize(10); textAlign(CENTER, TOP); text('Flat formula (WRONG)', wrongLx, oy + 8);
    // correct landing (on slope)
    var corrLx = ox + correctR * sc * 0.6 * Math.cos(alphaRad);
    var corrLy = oy - correctR * sc * 0.6 * Math.sin(alphaRad);
    M2_fill('#27AE60', 0.8); noStroke(); ellipse(corrLx, corrLy, 10, 10);
    M2_fill('#27AE60', 0.8); textSize(10); textAlign(CENTER, BOTTOM); text('Tilted formula (CORRECT)', corrLx, corrLy - 5);
    M2_textBox(20, height - 30, 'Tilted formula lands exactly on slope. Flat formula misses.', '#fbbf24', 12);
  }

  // ─── inclined_wrong_angle (EPIC-C) ───
  else if (sub === 'inclined_wrong_angle') {
    var thetaMaxDeg = 45 + alphaDeg / 2;
    // 45° arc (student thinks this is max)
    var th45 = 45 * Math.PI / 180;
    M2_incArcOnSlope(ox, oy, u, th45, alphaRad, g, sc * 0.6, '#E74C3C', 60);
    // correct max angle arc
    var thMax = thetaMaxDeg * Math.PI / 180;
    M2_incArcOnSlope(ox, oy, u, thMax, alphaRad, g, sc * 0.6, '#27AE60', 60);
    M2_fill('#E74C3C', 0.9); noStroke(); textSize(11); textAlign(LEFT, TOP);
    text('45\u00b0 arc \u2014 NOT maximum range on this slope', 20, 20);
    M2_fill('#27AE60', 0.9); text(thetaMaxDeg.toFixed(0) + '\u00b0 arc \u2014 ACTUAL maximum range', 20, 38);
    M2_textBox(20, height - 30, '45\u00b0 is NOT optimal on a slope. \u03b8max = 45\u00b0 + \u03b1/2', '#fbbf24', 12);
  }

  // ─── inclined_angle_sweep (EPIC-C) ───
  else if (sub === 'inclined_angle_sweep') {
    var sweepAngles = [45, 55, 45 + alphaDeg / 2, 70];
    var sweepCols = ['#E74C3C', '#E67E22', '#27AE60', '#C896FF'];
    for (var si = 0; si < sweepAngles.length; si++) {
      var sRad = sweepAngles[si] * Math.PI / 180;
      M2_incArcOnSlope(ox, oy, u, sRad, alphaRad, g, sc * 0.5, sweepCols[si], 50);
      M2_fill(sweepCols[si], 0.9); noStroke(); textSize(10); textAlign(LEFT, TOP);
      text(sweepAngles[si].toFixed(0) + '\u00b0', 20, 20 + si * 16);
    }
    M2_textBox(20, height - 30, (45 + alphaDeg / 2).toFixed(0) + '\u00b0 (green) travels farthest up the slope', '#27AE60', 12);
  }

  // ─── inclined_max_angle_display ───
  else if (sub === 'inclined_max_angle_display') {
    var thetaMaxDeg = 45 + alphaDeg / 2;
    M2_drawFormulaBox(40, 30, width - 80, [
      '\u03b8_max = 45\u00b0 + \u03b1/2',
      '',
      'For \u03b1 = ' + alphaDeg + '\u00b0:',
      '\u03b8_max = 45\u00b0 + ' + (alphaDeg / 2).toFixed(0) + '\u00b0 = ' + thetaMaxDeg.toFixed(0) + '\u00b0',
      '',
      'Special case: \u03b1 = 0 \u2192 \u03b8_max = 45\u00b0 (flat ground)',
      '',
      'Rmax = u\u00b2 / [g(1 + sin\u03b1)] = ' + (u * u / (g * (1 + Math.sin(alphaRad)))).toFixed(1) + ' m'
    ], '#000000', '#fbbf24');
    // small R vs theta curve
    var gox = width / 2 - 100, goy = height - 60, gw = 200, gh = 100;
    M2_drawAxes(gox, goy, gw, gh, '\u03b8', 'R', '#555566');
    M2_stroke('#60a5fa', 0.9); strokeWeight(2); noFill(); beginShape();
    var rMax2 = 0;
    for (var si2 = Math.ceil(alphaDeg); si2 <= 90; si2++) {
      var sRad2 = si2 * Math.PI / 180;
      var sR2 = 2 * u * u * Math.sin(sRad2 - alphaRad) * Math.cos(sRad2) / (g * Math.cos(alphaRad) * Math.cos(alphaRad));
      if (sR2 > rMax2) rMax2 = sR2;
    }
    for (var si3 = Math.ceil(alphaDeg); si3 <= 90; si3++) {
      var sRad3 = si3 * Math.PI / 180;
      var sR3 = 2 * u * u * Math.sin(sRad3 - alphaRad) * Math.cos(sRad3) / (g * Math.cos(alphaRad) * Math.cos(alphaRad));
      if (sR3 < 0) sR3 = 0;
      vertex(gox + ((si3 - alphaDeg) / (90 - alphaDeg)) * gw, goy - (sR3 / Math.max(rMax2, 0.01)) * gh * 0.9);
    }
    endShape();
    // mark max
    var tmX = gox + ((thetaMaxDeg - alphaDeg) / (90 - alphaDeg)) * gw;
    M2_fill('#27AE60', 1.0); noStroke(); ellipse(tmX, goy - gh * 0.9, 8, 8);
  }

  // ─── fallback ───
  else {
    M2_unknownBanner('projectile_inclined/' + sub);
  }
}

// ── GROUP 3: Relative Motion Between Projectiles ────────────

function M2_twoProjectiles(cfg, stateData, t) {
  var pl = stateData.physics_layer || {};
  var vals = pl.values || {};
  var sub = pl.scenario || '';
  background(15, 15, 26);
  var g = vals.g || 10;
  var u1 = vals.u1 || 60; var th1Deg = vals.theta1_deg || 30;
  var u2 = vals.u2 || 50; var th2Deg = vals.theta2_deg || 53;
  var sep = vals.separation || 100;
  var th1Rad = th1Deg * Math.PI / 180;
  var th2Rad = th2Deg * Math.PI / 180;
  var GY = M2_projGY();

  if (!sub) {
    var idx = M2_stateIdx();
    var fm = ['','two_projectiles_launched','relative_acceleration_zero','relative_frame_straight_line','collision_condition','relative_motion_special_cases','concept_connection'];
    sub = fm[idx] || 'two_projectiles_launched';
  }

  M2_projDrawGround(GY);
  // positions of A and B
  var Ax = 60, Ay = GY;
  var Bx = width - 60, By = GY;
  // components
  var ux1 = u1 * Math.cos(th1Rad), uy1 = u1 * Math.sin(th1Rad);
  var ux2 = -u2 * Math.cos(th2Rad), uy2 = u2 * Math.sin(th2Rad); // B goes left
  // scale to fit both arcs
  var T1 = 2 * uy1 / g; var T2 = 2 * uy2 / g;
  var maxT = Math.max(T1, T2);
  var H1 = uy1 * uy1 / (2 * g); var H2 = uy2 * uy2 / (2 * g);
  var sc = (GY - 60) / Math.max(H1, H2, 0.01);
  sc = Math.min(sc, 5);

  // ─── two_projectiles_launched ───
  if (sub === 'two_projectiles_launched') {
    var simT = (t * 0.3) % (maxT + 0.5); if (simT > maxT) simT = maxT;
    // Ball 1 arc
    if (simT <= T1) {
      var p1 = M2_projPosAt(Ax, Ay, ux1, uy1, g, sc, simT);
      M2_fill('#E74C3C', 1.0); noStroke(); ellipse(p1.x, p1.y, 14, 14);
    }
    M2_projArc(Ax, Ay, u1, th1Rad, g, sc, 'rgba(231,76,60,0.3)', 40);
    // Ball 2 arc (going left from B)
    if (simT <= T2) {
      var p2x = Bx + ux2 * simT * sc;
      var p2y = Ay - (uy2 * simT - 0.5 * g * simT * simT) * sc;
      M2_fill('#3498DB', 1.0); noStroke(); ellipse(p2x, p2y, 14, 14);
    }
    // draw arc for ball 2
    M2_stroke('rgba(52,152,219,0.3)', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var i = 0; i <= 40; i++) {
      var ti = i / 40 * T2;
      vertex(Bx + ux2 * ti * sc, Ay - (uy2 * ti - 0.5 * g * ti * ti) * sc);
    }
    endShape();
    // g arrows
    M2_newArrow(Ax + 30, Ay - 30, Ax + 30, Ay + 20, '#FFFFFF', 'g');
    M2_newArrow(Bx - 30, Ay - 30, Bx - 30, Ay + 20, '#FFFFFF', 'g');
    M2_fill('#E74C3C', 0.8); noStroke(); textSize(10); textAlign(CENTER, TOP); text('A: u\u2081=' + u1 + ', \u03b8\u2081=' + th1Deg + '\u00b0', Ax, Ay + 8);
    M2_fill('#3498DB', 0.8); text('B: u\u2082=' + u2 + ', \u03b8\u2082=' + th2Deg + '\u00b0', Bx, Ay + 8);
  }

  // ─── relative_acceleration_zero ───
  else if (sub === 'relative_acceleration_zero') {
    var cx = width / 2, cy = height / 2 - 20;
    // a1 = g down
    M2_newArrow(cx - 150, cy - 40, cx - 150, cy + 40, '#E74C3C', 'a\u2081 = g');
    M2_fill('#E74C3C', 0.8); noStroke(); textSize(12); textAlign(CENTER, TOP);
    text(g + ' m/s\u00b2 \u2193', cx - 150, cy + 48);
    // a2 = g down
    M2_newArrow(cx + 150, cy - 40, cx + 150, cy + 40, '#3498DB', 'a\u2082 = g');
    M2_fill('#3498DB', 0.8); text(g + ' m/s\u00b2 \u2193', cx + 150, cy + 48);
    // a12 = 0
    M2_fill('#000000', 0.5); noStroke(); rect(cx - 100, cy - 30, 200, 60, 8);
    M2_fill('#27AE60', 1.0); noStroke(); textSize(36); textAlign(CENTER, CENTER);
    text('a\u2081\u2082 = 0', cx, cy);
    M2_fill('#FFFFFF', 0.8); textSize(12); textAlign(CENTER, TOP);
    text('a\u2081 - a\u2082 = g - g = 0', cx, cy + 35);
    M2_textBox(20, height - 30, 'Zero relative acceleration \u2192 uniform relative motion \u2192 STRAIGHT LINE', '#fbbf24', 12);
  }

  // ─── relative_frame_straight_line ───
  else if (sub === 'relative_frame_straight_line') {
    var midX = width / 2;
    M2_stroke('#555555', 0.5); strokeWeight(1); line(midX, 0, midX, height);
    var simT = (t * 0.25) % (maxT + 0.5); if (simT > maxT) simT = maxT;
    // LEFT: lab frame
    fill(200); textSize(11); textAlign(CENTER, TOP); noStroke(); text('Lab frame: parabolas', midX / 2, 8);
    var lSc = (midX - 40) / (sep * 0.5); lSc = Math.min(lSc, (GY - 60) / Math.max(H1, H2, 0.01));
    var lAx = 30, lBx = midX - 30;
    // arcs
    M2_projArc(lAx, GY, u1, th1Rad, g, lSc * 0.6, 'rgba(231,76,60,0.3)', 30);
    M2_stroke('rgba(52,152,219,0.3)', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var li = 0; li <= 30; li++) {
      var lti = li / 30 * T2;
      vertex(lBx + ux2 * lti * lSc * 0.6, GY - (uy2 * lti - 0.5 * g * lti * lti) * lSc * 0.6);
    }
    endShape();
    // balls
    if (simT <= T1) {
      var lp1 = M2_projPosAt(lAx, GY, ux1, uy1, g, lSc * 0.6, simT);
      M2_fill('#E74C3C', 1.0); noStroke(); ellipse(lp1.x, lp1.y, 10, 10);
    }
    if (simT <= T2) {
      M2_fill('#3498DB', 1.0); noStroke();
      ellipse(lBx + ux2 * simT * lSc * 0.6, GY - (uy2 * simT - 0.5 * g * simT * simT) * lSc * 0.6, 10, 10);
    }
    // RIGHT: relative frame
    fill(200); textSize(11); textAlign(CENTER, TOP); noStroke(); text('Frame of P2: straight line', midX + midX / 2, 8);
    var rcx = midX + midX / 2, rcy = height / 2;
    // relative velocity
    var relUx = ux1 - ux2; var relUy = uy1 - uy2;
    var relLen = Math.sqrt(relUx * relUx + relUy * relUy);
    var relSc = Math.min((midX - 60) / Math.max(relLen * maxT * 0.3, 0.01), 1.5);
    // P2 fixed
    M2_fill('#3498DB', 0.6); noStroke(); ellipse(rcx - 60, rcy, 8, 8);
    M2_fill('#3498DB', 0.6); textSize(9); textAlign(CENTER, TOP); text('P2 (fixed)', rcx - 60, rcy + 6);
    // P1 moves in straight line
    var relX = relUx * simT * relSc;
    var relY = relUy * simT * relSc;
    // dotted path
    M2_drawDashedLine(rcx - 60, rcy, rcx - 60 + relUx * maxT * relSc, rcy - relUy * maxT * relSc, '#fbbf24', 4, 3);
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(rcx - 60 + relX, rcy - relY, 10, 10);
    M2_textBox(midX + 10, height - 30, 'Relative path = straight line', '#fbbf24', 12);
  }

  // ─── relative_wrong_parabola (EPIC-C) ───
  else if (sub === 'relative_wrong_parabola') {
    var cx = width / 2, cy = height / 2;
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke(); text('Frame of Particle 2', cx, 10);
    M2_fill('#3498DB', 0.6); noStroke(); ellipse(cx - 100, cy + 50, 10, 10);
    M2_fill('#3498DB', 0.6); textSize(9); textAlign(CENTER, TOP); text('P2 (fixed)', cx - 100, cy + 58);
    // wrong: draw parabola for P1
    M2_stroke('#E74C3C', 0.7); strokeWeight(2); noFill(); beginShape();
    for (var wi = 0; wi <= 40; wi++) {
      var wf = wi / 40;
      var wx = cx - 80 + wf * 200;
      var wy = cy - wf * 80 + wf * wf * 120;
      vertex(wx, wy);
    }
    endShape();
    M2_projWatermark('INCORRECT', '#E74C3C');
    M2_textBox(20, height - 30, 'Your belief: relative path is curved \u2014 INCORRECT', '#E74C3C', 12);
  }

  // ─── relative_straight_line_animation ───
  else if (sub === 'relative_straight_line_animation') {
    var cx = width / 2, cy = height / 2;
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke(); text('Frame of Particle 2', cx, 10);
    M2_fill('#3498DB', 0.6); noStroke(); ellipse(cx - 100, cy + 30, 10, 10);
    M2_fill('#3498DB', 0.6); textSize(9); textAlign(CENTER, TOP); text('P2 (fixed)', cx - 100, cy + 38);
    // relative velocity
    var relUx = ux1 - ux2; var relUy = uy1 - uy2;
    var relMag = Math.sqrt(relUx * relUx + relUy * relUy);
    var simT = (t * 0.3) % 4;
    var relSc = 1.2;
    var startX = cx - 80, startY = cy + 20;
    var endX = startX + relUx * 3 * relSc;
    var endY = startY - relUy * 3 * relSc;
    // dotted path
    M2_drawDashedLine(startX, startY, endX, endY, '#fbbf24', 4, 3);
    // P1 moving along straight line
    var frac = constrain(simT / 3, 0, 1);
    var p1x = startX + (endX - startX) * frac;
    var p1y = startY + (endY - startY) * frac;
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(p1x, p1y, 12, 12);
    // u12 arrow
    var arrLen = 50;
    var arrDx = relUx / relMag * arrLen; var arrDy = -relUy / relMag * arrLen;
    M2_newArrow(p1x, p1y, p1x + arrDx, p1y + arrDy, '#fbbf24', 'u\u2081\u2082 = const');
    M2_textBox(20, height - 30, 'Reality: straight line \u2014 constant relative velocity', '#27AE60', 12);
  }

  // ─── collision_condition ───
  else if (sub === 'collision_condition') {
    var cx = width / 2;
    // Case toggle via time
    var casePhase = Math.floor((t * 0.2) % 2);
    // Points A and B
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(Ax, Ay - 60, 12, 12);
    M2_fill('#FFFFFF', 0.7); textSize(10); textAlign(CENTER, TOP); text('A', Ax, Ay - 48);
    M2_fill('#3498DB', 1.0); noStroke(); ellipse(Bx, By - 60, 12, 12);
    M2_fill('#FFFFFF', 0.7); textSize(10); textAlign(CENTER, TOP); text('B', Bx, By - 48);
    // line AB
    M2_drawDashedLine(Ax, Ay - 60, Bx, By - 60, '#888888', 5, 3);
    if (casePhase === 0) {
      // u12 along AB → collision
      M2_newArrow(Ax + 10, Ay - 80, Ax + 100, Ay - 80, '#27AE60', 'u\u2081\u2082 along AB');
      M2_fill('#27AE60', 0.9); noStroke(); textSize(16); textAlign(CENTER, CENTER);
      text('COLLISION \u2714', cx, Ay - 120);
    } else {
      // u12 NOT along AB → miss
      M2_newArrow(Ax + 10, Ay - 80, Ax + 80, Ay - 140, '#E74C3C', 'u\u2081\u2082 not along AB');
      M2_fill('#E74C3C', 0.9); noStroke(); textSize(16); textAlign(CENTER, CENTER);
      text('MISS \u2718', cx, Ay - 120);
    }
    M2_textBox(20, height - 30, 'Collision only if u\u2081\u2082 points along line AB', '#fbbf24', 12);
  }

  // ─── collision_example ───
  else if (sub === 'collision_example') {
    var tColl = vals.t_collision || 1;
    var simT = (t * 0.3) % (tColl + 1); if (simT > tColl) simT = tColl;
    // Ball 1 from A
    var p1x = Ax + ux1 * simT * sc * 0.5;
    var p1y = Ay - (uy1 * simT - 0.5 * g * simT * simT) * sc * 0.5;
    // Ball 2 from B
    var p2x = Bx + ux2 * simT * sc * 0.5;
    var p2y = Ay - (uy2 * simT - 0.5 * g * simT * simT) * sc * 0.5;
    // arcs
    M2_stroke('rgba(231,76,60,0.3)', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var ai = 0; ai <= 30; ai++) {
      var ati = ai / 30 * tColl;
      vertex(Ax + ux1 * ati * sc * 0.5, Ay - (uy1 * ati - 0.5 * g * ati * ati) * sc * 0.5);
    }
    endShape();
    M2_stroke('rgba(52,152,219,0.3)', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var bi = 0; bi <= 30; bi++) {
      var bti = bi / 30 * tColl;
      vertex(Bx + ux2 * bti * sc * 0.5, Ay - (uy2 * bti - 0.5 * g * bti * bti) * sc * 0.5);
    }
    endShape();
    // balls
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(p1x, p1y, 12, 12);
    M2_fill('#3498DB', 1.0); noStroke(); ellipse(p2x, p2y, 12, 12);
    // collision point
    if (simT >= tColl * 0.95) {
      var cpx = (p1x + p2x) / 2, cpy = (p1y + p2y) / 2;
      M2_fill('#fbbf24', 1.0); noStroke(); textSize(20); textAlign(CENTER, CENTER);
      text('\u2605', cpx, cpy - 15);
      M2_textBox(cpx - 20, cpy + 10, 'P (t=' + tColl + 's)', '#fbbf24', 11);
    }
    M2_fill('#E74C3C', 0.7); noStroke(); textSize(9); textAlign(CENTER, TOP);
    text('A: u\u2081=' + u1 + ' m/s, ' + th1Deg + '\u00b0', Ax, Ay + 5);
    M2_fill('#3498DB', 0.7); text('B: u\u2082=' + u2 + ' m/s, ' + th2Deg + '\u00b0', Bx, Ay + 5);
  }

  // ─── relative_motion_special_cases ───
  else if (sub === 'relative_motion_special_cases') {
    var cx = width / 2;
    M2_stroke('#555555', 0.5); strokeWeight(1); line(cx, 0, cx, height);
    // CASE A: equal horizontal components
    fill(200); textSize(11); textAlign(CENTER, TOP); noStroke();
    text('u\u2081cos\u03b8\u2081 = u\u2082cos\u03b8\u2082', cx / 2, 10);
    text('Relative motion is VERTICAL', cx / 2, 26);
    M2_newArrow(cx / 2, height / 2, cx / 2, height / 2 - 80, '#E67E22', 'u\u2081\u2082 (vertical)');
    // CASE B: equal vertical components
    fill(200); textSize(11); textAlign(CENTER, TOP); noStroke();
    text('u\u2081sin\u03b8\u2081 = u\u2082sin\u03b8\u2082', cx + cx / 2, 10);
    text('Relative motion is HORIZONTAL', cx + cx / 2, 26);
    M2_newArrow(cx + cx / 2 - 40, height / 2, cx + cx / 2 + 40, height / 2, '#3498DB', 'u\u2081\u2082 (horizontal)');
  }

  // ─── concept_connection ───
  else if (sub === 'concept_connection') {
    var cx = width / 2;
    M2_stroke('#555555', 0.5); strokeWeight(1); line(cx, 0, cx, height);
    // Left: Ch.6 rain-umbrella (1D)
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke();
    text('Ch.6: Rain-Umbrella (1D)', cx / 2, 10);
    M2_newArrow(cx / 2 - 30, height / 2, cx / 2 - 30, height / 2 + 60, '#60a5fa', 'v_rain');
    M2_newArrow(cx / 2 + 30, height / 2, cx / 2 + 80, height / 2, '#E67E22', 'v_man');
    M2_newArrow(cx / 2 - 30, height / 2, cx / 2 + 50, height / 2 + 60, '#fbbf24', 'v_rel');
    M2_textBox(20, height / 2 + 80, 'Subtract velocities \u2192 straight line', '#AAAAAA', 11);
    // Right: Ch.7 two projectiles (2D)
    fill(200); textSize(12); textAlign(CENTER, TOP); noStroke();
    text('Ch.7: Two Projectiles (2D)', cx + cx / 2, 10);
    M2_newArrow(cx + 40, height / 2 + 20, cx + 100, height / 2 - 40, '#E74C3C', 'u\u2081');
    M2_newArrow(cx + width / 2 - 40, height / 2 + 20, cx + width / 2 - 100, height / 2 - 40, '#3498DB', 'u\u2082');
    M2_drawDashedLine(cx + 80, height / 2 - 20, cx + width / 2 - 80, height / 2 - 20, '#fbbf24', 4, 3);
    M2_fill('#fbbf24', 0.8); noStroke(); textSize(10); textAlign(CENTER, CENTER);
    text('Also straight line! (a\u2081\u2082=0)', cx + cx / 2, height / 2);
    M2_textBox(20, height - 30, 'Same principle, same geometry \u2014 just 2D now', '#fbbf24', 12);
  }

  // ─── acceleration_cancellation (EPIC-C) ───
  else if (sub === 'acceleration_cancellation') {
    var cx = width / 2, cy = height / 2;
    M2_newArrow(cx - 120, cy - 30, cx - 120, cy + 50, '#E74C3C', 'a\u2081 = ' + g + ' m/s\u00b2');
    M2_newArrow(cx + 120, cy - 30, cx + 120, cy + 50, '#3498DB', 'a\u2082 = ' + g + ' m/s\u00b2');
    M2_fill('#FFFFFF', 0.9); noStroke(); textSize(14); textAlign(CENTER, CENTER);
    text('a\u2081 - a\u2082 = ' + g + ' - ' + g + ' = ', cx, cy - 50);
    // Big ZERO
    M2_fill('#000000', 0.6); noStroke(); rect(cx - 60, cy - 35, 120, 70, 8);
    M2_fill('#27AE60', 1.0); textSize(48); textAlign(CENTER, CENTER); text('0', cx, cy);
    M2_textBox(20, height - 30, 'Equal g cancels. Relative world: no acceleration.', '#fbbf24', 12);
  }

  // ─── projectile_wrong_no_collision (EPIC-C) ───
  else if (sub === 'projectile_wrong_no_collision') {
    // two projectiles at different angles, student assumes they miss
    M2_projArc(Ax, Ay, u1, th1Rad, g, sc * 0.4, '#E74C3C', 40);
    M2_stroke('rgba(52,152,219,0.5)', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var wi2 = 0; wi2 <= 40; wi2++) {
      var wti = wi2 / 40 * T2;
      vertex(Bx + ux2 * wti * sc * 0.4, Ay - (uy2 * wti - 0.5 * g * wti * wti) * sc * 0.4);
    }
    endShape();
    M2_fill('#E74C3C', 0.8); noStroke(); textSize(10); textAlign(CENTER, TOP);
    text('\u03b8\u2081=' + th1Deg + '\u00b0', Ax, Ay + 5);
    M2_fill('#3498DB', 0.8); text('\u03b8\u2082=' + th2Deg + '\u00b0', Bx, Ay + 5);
    M2_fill('#FFFFFF', 0.7); textSize(14); textAlign(CENTER, CENTER);
    text('Different angles \u2192 different paths \u2192 no collision?', width / 2, 40);
    M2_projWatermark('WRONG', '#E74C3C');
  }

  // ─── collision_relative_velocity_test (EPIC-C) ───
  else if (sub === 'collision_relative_velocity_test') {
    // draw A and B
    M2_fill('#E74C3C', 1.0); noStroke(); ellipse(Ax + 20, Ay - 80, 12, 12);
    M2_fill('#FFFFFF', 0.7); textSize(10); textAlign(CENTER, TOP); text('A', Ax + 20, Ay - 68);
    M2_fill('#3498DB', 1.0); noStroke(); ellipse(Bx - 20, By - 80, 12, 12);
    M2_fill('#FFFFFF', 0.7); text('B', Bx - 20, By - 68);
    // u1 and u2 arrows
    M2_newArrow(Ax + 20, Ay - 90, Ax + 20 + ux1 * 0.8, Ay - 90 - uy1 * 0.8, '#E74C3C', 'u\u2081');
    M2_newArrow(Bx - 20, By - 90, Bx - 20 + ux2 * 0.8, By - 90 - uy2 * 0.8, '#3498DB', 'u\u2082');
    // u12 = u1 - u2
    var relUx = ux1 - ux2; var relUy = uy1 - uy2;
    M2_newArrow(Ax + 20, Ay - 140, Ax + 20 + relUx * 0.5, Ay - 140 - relUy * 0.5, '#fbbf24', 'u\u2081\u2082 = u\u2081 - u\u2082');
    // line AB
    M2_drawDashedLine(Ax + 20, Ay - 80, Bx - 20, By - 80, '#888888', 5, 3);
    // check direction
    var abAngle = Math.atan2(-(By - 80 - (Ay - 80)), Bx - 20 - (Ax + 20));
    var relAngle = Math.atan2(relUy, relUx);
    var angleDiff = Math.abs(abAngle - relAngle) * 180 / Math.PI;
    if (angleDiff < 15 || angleDiff > 345) {
      M2_textBox(width / 2 - 60, 30, 'u\u2081\u2082 points along AB \u2192 COLLISION', '#27AE60', 13);
    } else {
      M2_textBox(width / 2 - 60, 30, 'Check: does u\u2081\u2082 point along AB?', '#fbbf24', 13);
    }
  }

  // ─── fallback ───
  else {
    M2_unknownBanner('two_projectiles/' + sub);
  }
}

`;
