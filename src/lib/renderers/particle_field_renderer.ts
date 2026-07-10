// =============================================================================
// particle_field_renderer.ts
// Pre-built p5.js renderer code exported as a string constant.
// This code is engineer-written, NOT AI-generated.
// It reads window.SIM_CONFIG and renders particles, lattice, field arrows.
//
// MODERN PLAYER CONTRACT (2026-07-08 — first 2D renderer through build:review):
//   IN:  SET_STATE {state}            → applyState() → home pose + STATE_REACHED
//        SET_TIME_FREEZE {at_ms}      → deterministic re-sim from state entry, hold
//        SET_TIME_FREEZE {frozen:false} → release the pin, clock resumes
//        SET_CUE_TIME {cue, at_ms}    → re-time a one-shot to the narrated beat
//        SET_GLOW {target}            → brightness focal (null = state default)
//        PAUSE / RESUME               → clock+physics freeze/resume (Rule 26b)
//        MUTE                         → no-op (audio lives in the player shell)
//   OUT: SIM_READY (on load), STATE_REACHED (on state apply)
//   window.PM_simTimeMs               → state-local clock, read by the player
//
// DETERMINISM: all physics randomness flows through a seeded mulberry32 PRNG,
// reseeded to the SAME seed on every state entry (home pose, Rule 32d) so
// SET_TIME_FREEZE re-simulation reproduces frames exactly (THE EYE baselines).
// Render-only jitter (lattice heat vibration) is suppressed while frozen.
//
// LEGACY (chat path via aiSimulationGenerator.assembleRendererHTML) still works:
// every modern feature is opt-in via new config fields (slider_controls,
// states.*.caption / visible_controls / glow_focal / cue / formula_overlay ...).
// Legacy animation_constraints (collision_glow, glow_scales_as_i_squared,
// show_power_meter, show_heat_counter) are preserved unchanged.
// =============================================================================

export const PARTICLE_FIELD_RENDERER_CODE = `
// ─── Globals ────────────────────────────────────────────────────────────────
var config;
var particles = [];
var latticeIons = [];
var fieldArrows = [];
var collisionFlashes = []; // { x, y, alpha, radius, age }
var PM_currentState = 'STATE_1';
var PM_simTimeMs = 0;        // state-local clock (exposed on window each step)
var COLLISION_INTERVAL = 10; // base frames between random direction changes
var heatAccumulator = 0;
var simTimeSeconds = 0;
var frozen = false;          // SET_TIME_FREEZE pin
var paused = false;          // PAUSE/RESUME (Rule 26b)
var simReadyFired = false;
var borderFlashAlpha = 0;
var cueOverrides = {};       // cue id → at_ms (SET_CUE_TIME; cleared on SET_STATE)
var cueFiredAt = {};         // cue id → PM_simTimeMs when it fired
var glowOverride = null;     // SET_GLOW override (null = use state.glow_focal)
var userParams = {};         // slider id → live value
var userTouched = {};        // slider id → true once the teacher drags it (ohms_law: V seizes the auto-sweep)
var sliderRows = {};         // slider id → row DOM element
var uiBuilt = false;
var curDriftFactor = 1;      // cue-gated drift ramp 0..1 (persists while frozen)
var curFieldAlpha = 1;       // cue-gated field-arrow fade 0..1
var curEffDrift = 0;         // effective drift px/frame after sliders+cues
var circuitBeadPhase = [];   // combination_of_resistors: fixed per-bead phase (deterministic)
var CIRCUIT_BEAD_RATE = 0.05; // loop-fractions per second at reference current

// ─── Deterministic PRNG (physics only — never p5 random()) ─────────────────
var PHYS_SEED = 987654321;
var physRand = null;
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function pr() { return physRand(); }
function prRange(a, b) { return a + (b - a) * physRand(); }

// ─── Color helpers ──────────────────────────────────────────────────────────
function hexToRGB(hex) {
  var r = parseInt(hex.slice(1,3), 16);
  var g = parseInt(hex.slice(3,5), 16);
  var b = parseInt(hex.slice(5,7), 16);
  return [r, g, b];
}
function fillHex(hex, a) {
  var c = hexToRGB(hex);
  fill(c[0], c[1], c[2], (a !== undefined ? a : 1.0) * 255);
}
function strokeHex(hex, a) {
  var c = hexToRGB(hex);
  stroke(c[0], c[1], c[2], (a !== undefined ? a : 1.0) * 255);
}

// ─── Feature flags (legacy animation_constraints) ───────────────────────────
function hasCollisionGlow() {
  return !!(config && config.animation_constraints && config.animation_constraints.collision_glow);
}
function hasGlowScaling() {
  return !!(config && config.animation_constraints && config.animation_constraints.glow_scales_as_i_squared);
}
function hasPowerMeter() {
  return !!(config && config.animation_constraints && config.animation_constraints.show_power_meter);
}
function hasHeatCounter() {
  return !!(config && config.animation_constraints && config.animation_constraints.show_heat_counter);
}

// ─── Config accessors ───────────────────────────────────────────────────────
function curState() {
  return (config && config.states) ? config.states[PM_currentState] : null;
}
function sliderDefs() {
  return (config && config.slider_controls) ? config.slider_controls : null;
}
function sliderVal(id) {
  var defs = sliderDefs();
  if (userParams[id] !== undefined) return userParams[id];
  if (defs && defs[id] && defs[id].default !== undefined) return defs[id].default;
  return 1;
}
function sliderDefault(id) {
  var defs = sliderDefs();
  return (defs && defs[id] && defs[id].default !== undefined) ? defs[id].default : 1;
}
function fillViewport() {
  return !!(config && config.design && config.design.fill_viewport);
}
function dimLevel() {
  return (config && config.design && config.design.dim_level !== undefined) ? config.design.dim_level : 0.35;
}

// ─── Macro-view split canvas (Rule 33: macro cause + micro mechanism) ────────
// When a concept authors macro_view:true, the top band shows the physical rod
// (length←L, thickness←A, tint←material, shimmer←T) and the bottom band is the
// existing micro scene (lattice+electrons) built into microH() and drawn under a
// single translate(0, microTop()). Flag absent → macroBandH()=0 → the micro scene
// fills the whole canvas exactly as before (drift_velocity / ohms_law unchanged).
function mvOn() { return !!(config && config.macro_view); }
function macroBandH() { return mvOn() ? floor(height * 0.38) : 0; }
function microTop() { return macroBandH(); }
function microH() { return height - macroBandH(); }

// ─── Physics constants for live readouts (formula_anchor.constants override) ─
function physConst(name, fallback) {
  var fa = config && config.formula_anchor;
  if (fa && fa.constants && fa.constants[name] !== undefined) return fa.constants[name];
  return fallback;
}
// Real-unit values from sliders: E in V/m, tau in fs (×1e-15 s), A in mm² (×1e-6 m²)
//
// ── ohms_law adapter (Ch.3 #2) ──────────────────────────────────────────────
// When a concept authors V (volts) and/or R (ohms) sliders INSTEAD of E/tau,
// the SAME i = neAv_d chain is reused with E = V/L and tau = mL/(n e^2 A R),
// which makes i = V/R identically. The drift concept (E/tau/A sliders, no V/R)
// takes every legacy branch unchanged — verify: effEField→sliderVal('E'),
// effTauSeconds→sliderVal('tau')*1e-15, condAreaM2→sliderVal('A')*1e-6.
function hasSlider(id) { var d = sliderDefs(); return !!(d && d[id] !== undefined); }
function condLength() { return hasSlider('L') ? curL() : physConst('L', 1); }   // conductor length (m)
function condAreaM2() {
  return curA() * 1e-6;
}
function tauFromR(R) {                                        // seconds
  var e = physConst('e', 1.6e-19), n = physConst('n', 8.5e28), m = physConst('m_e', 9.11e-31);
  return (m * condLength()) / (n * e * e * condAreaM2() * max(R, 1e-9));
}

// ── resistivity adapter (Ch.3 #3) ───────────────────────────────────────────
// L/A/material/T sliders drive R = rho(T)*L/A via tau = m/(n e^2 rho), which is
// algebraically self-consistent with i = neAv_d regardless of the n/e/m values
// chosen — n, e, m all cancel, leaving i = V_supply * A / (rho * L) exactly.
// So the ONLY calibration lever is V_supply (physConst, hidden — not a slider);
// R and rho ratios on screen are true-valued independent of that choice.
function T0Ref() { return physConst('T0_ref', 20); }
function materialList() {
  return (config && config.materials) ? config.materials : [
    { id: 'copper',   label: 'Copper',   rho0: 1.7e-8,  alpha: 3.9e-3,  tint: '#CE7B4B' },
    { id: 'nichrome', label: 'Nichrome', rho0: 1.1e-6,  alpha: 1.7e-4,  tint: '#B0BEC5' },
    { id: 'manganin', label: 'Manganin', rho0: 4.4e-7,  alpha: 1.0e-5,  tint: '#C9A66B' }
  ];
}
function materialAt(idx) {
  var m = materialList();
  return m[constrain(round(idx), 0, m.length - 1)];
}
function defaultMaterial() { return materialAt(sliderDefault('material')); }
function rhoOf(mat, T) { return mat.rho0 * (1 + mat.alpha * (T - T0Ref())); }
function tauFromRho(rho) {
  var e = physConst('e', 1.6e-19), n = physConst('n', 8.5e28), m = physConst('m_e', 9.11e-31);
  return m / (n * e * e * max(rho, 1e-15));
}
// S1/S2 single-direction geometry sweeps (mirrors autoSweepR's default*factor-
// capped-by-max pattern — NOT literally "sweep to slider max", which for A
// (max 5x default, authored for S7's explore range) overshot the S2 narration's
// "doubles" claim to a 5x jump; L's max happens to equal 2x default so it read
// correctly by coincidence — both now explicit about the intended 2x target).
function autoSweepLSimple() {
  var lStart = sliderDefault('L');
  var lMax = (sliderDefs().L && sliderDefs().L.max) ? sliderDefs().L.max : lStart * 2;
  var lEnd = min(lStart * 2, lMax);
  var start = 500, dur = 2600;
  return lStart + (lEnd - lStart) * constrain((PM_simTimeMs - start) / dur, 0, 1);
}
function autoSweepASimple() {
  var aStart = sliderDefault('A');
  var aMax = (sliderDefs().A && sliderDefs().A.max) ? sliderDefs().A.max : aStart * 2;
  var aEnd = min(aStart * 2, aMax);
  var start = 500, dur = 2600;
  return aStart + (aEnd - aStart) * constrain((PM_simTimeMs - start) / dur, 0, 1);
}
// S3 three-phase cycle: (1) L sweeps, (2) A sweeps, (3) constant-volume coupled
// stretch (L up, A down inversely) — a pure function of the state clock so it
// re-simulates identically under SET_TIME_FREEZE.
function geometryPhaseLA() {
  var Ldef = sliderDefault('L'), Adef = sliderDefault('A');
  var Lmax = (sliderDefs().L && sliderDefs().L.max) ? sliderDefs().L.max : Ldef * 2;
  var Amax = (sliderDefs().A && sliderDefs().A.max) ? sliderDefs().A.max : Adef * 2;
  var t = PM_simTimeMs % 12000;
  var L = Ldef, A = Adef;
  if (t < 4000) {
    L = Ldef + (Lmax - Ldef) * sin((t / 4000) * PI);
  } else if (t < 8000) {
    A = Adef + (Amax - Adef) * sin(((t - 4000) / 4000) * PI);
  } else {
    var u3 = sin(((t - 8000) / 4000) * PI);
    L = Ldef + (Lmax - Ldef) * u3;
    A = Adef / (1 + (Lmax / Ldef - 1) * u3);   // volume held ~constant
  }
  return { L: L, A: A };
}
function curL() {
  if (!hasSlider('L')) return physConst('L', 1);
  if (userTouched['L']) return sliderVal('L');
  var st = curState();
  if (st && st.geometry_cycle) return geometryPhaseLA().L;
  if (st && st.length_autosweep) return autoSweepLSimple();
  return sliderVal('L');
}
function curA() {
  if (!hasSlider('A')) return physConst('A_mm2', 1);
  if (userTouched['A']) return sliderVal('A');
  var st = curState();
  if (st && st.geometry_cycle) return geometryPhaseLA().A;
  if (st && st.area_autosweep) return autoSweepASimple();
  return sliderVal('A');
}
// S4 material cycle (copper <-> nichrome, ~6s loop) / S6 one-shot cued switch.
function autoMaterialIndex() {
  var t = PM_simTimeMs % 6000;
  return (t < 3000) ? 0 : 1;
}
function curMaterialIndex() {
  if (!hasSlider('material')) return 0;
  if (userTouched['material']) return round(sliderVal('material'));
  var st = curState();
  if (st && st.material_cycle) return autoMaterialIndex();
  if (st && st.material_switch) {
    var sw = st.material_switch;
    return (cueFiredAt[sw.cue] !== undefined) ? sw.to : sw.from;
  }
  return round(sliderVal('material'));
}
function currentMaterial() { return materialAt(curMaterialIndex()); }
// S5/S6 temperature auto-sweep (mirrors autoSweepV).
function autoSweepT() {
  var tStart = sliderDefault('T');
  var tMax = (sliderDefs().T && sliderDefs().T.max) ? sliderDefs().T.max : tStart + 200;
  var start = 500, dur = 2800;
  return tStart + (tMax - tStart) * constrain((PM_simTimeMs - start) / dur, 0, 1);
}
function curTemperature() {
  if (!hasSlider('T')) return T0Ref();
  if (userTouched['T']) return sliderVal('T');
  var st = curState();
  if (st && st.temperature_autosweep) return autoSweepT();
  return sliderVal('T');
}
function curRho() { return rhoOf(currentMaterial(), curTemperature()); }
// ── per-state micro storytelling (Rule 33c) ─────────────────────────────────
// micro_focus picks the interior story so no two states show the same generic
// scene: 'trace_one' follows a single electron (its collision tally climbs — the
// journey/scatter story); 'count_carriers' scales the number of DRIFTING carriers
// with cross-section area (the more-lanes story).
function microFocus() { var st = curState(); return (st && st.micro_focus) ? st.micro_focus : null; }
function isFeaturedIdx(i) {
  if (i !== 0) return false;
  var st = curState();
  return !!(st && (st.highlight_particle || st.micro_focus === 'trace_one'));
}
function carriersForArea() {
  var n = config.particles.count;
  if (!hasSlider('A')) return n;
  var amax = (sliderDefs().A && sliderDefs().A.max) ? sliderDefs().A.max : 5;
  return constrain(round(n * curA() / amax), 4, n);
}
// Non-ohmic (filament, Rule 16b): effective R rises with the drive, so higher V
// yields sub-linear i and the V-I trace curves. Ohmic states return 1.
function ohmicFactor() {
  var st = curState();
  if (!st || st.ohmic !== false) return 1;
  var vmax = (sliderDefs() && sliderDefs().V && sliderDefs().V.max) ? sliderDefs().V.max : 1;
  var k = physConst('filament_k', 1.4);
  return 1 + k * (plotV() / max(vmax, 1e-9));
}
// plotV: the voltage the graph + physics use. Auto-sweeps from the clock during
// a guided beat (vi_autosweep) until the teacher drags the V slider; then live.
function autoSweepV() {
  var vTarget = sliderDefault('V');
  var start = 400, dur = 2400;   // cause-first: brief hold, then ramp to default
  return vTarget * constrain((PM_simTimeMs - start) / dur, 0, 1);
}
function plotV() {
  if (!hasSlider('V')) return 0;
  if (userTouched['V']) return sliderVal('V');
  var st = curState();
  if (st && st.vi_autosweep) return autoSweepV();
  return sliderVal('V');
}
function effEField() {
  if (hasSlider('E')) return sliderVal('E');                 // drift concept
  if (hasSlider('V')) return plotV() / condLength();         // ohms_law
  if (hasSlider('L')) return physConst('V_supply', 0.02) / condLength();  // resistivity (fixed hidden supply)
  return 0;
}
// plotR mirrors plotV: a guided state may auto-ramp R (r_autosweep) so the
// line visibly re-tilts on its own, until the teacher grabs the R slider.
function autoSweepR() {
  var rStart = sliderDefault('R');
  var rMax = (sliderDefs().R && sliderDefs().R.max) ? sliderDefs().R.max : rStart * 2.6;
  var rEnd = min(rStart * 2.6, rMax);
  var start = 500, dur = 2600;   // cause-first: brief hold, then ramp R up
  return rStart + (rEnd - rStart) * constrain((PM_simTimeMs - start) / dur, 0, 1);
}
function plotR() {
  if (!hasSlider('R')) return 1;
  if (userTouched['R']) return sliderVal('R');
  var st = curState();
  if (st && st.r_autosweep) return autoSweepR();
  return sliderVal('R');
}
function effTauSeconds() {
  if (hasSlider('R')) return tauFromR(plotR() * ohmicFactor());        // ohms_law
  if (hasSlider('material')) return tauFromRho(curRho());              // resistivity
  if (hasSlider('tau')) return sliderVal('tau') * 1e-15;               // drift concept
  return physConst('tau_default_fs', 25) * 1e-15;
}
function realDriftVelocity() {
  var e = physConst('e', 1.6e-19), m = physConst('m_e', 9.11e-31);
  return e * effEField() * effTauSeconds() / m;   // m/s
}
function realCurrent() {
  var e = physConst('e', 1.6e-19), n = physConst('n', 8.5e28);
  return n * e * condAreaM2() * realDriftVelocity();  // A
}
function realVoltage() {                                      // V
  return hasSlider('V') ? plotV() : effEField() * condLength();
}
function realResistance() {                                   // ohms (V / i)
  var i = realCurrent();
  return i > 1e-30 ? realVoltage() / i : 0;
}
// v_d at the default operating point (ohmic), so the visual drift can scale by
// the real v_d ratio regardless of which sliders a concept authors.
function driftVelocityAtDefaults() {
  var e = physConst('e', 1.6e-19), m = physConst('m_e', 9.11e-31);
  var Edef = hasSlider('E') ? sliderDefault('E')
           : hasSlider('V') ? sliderDefault('V') / condLength()
           : hasSlider('L') ? physConst('V_supply', 0.02) / sliderDefault('L') : 0;
  var tauDef = hasSlider('R') ? tauFromR(sliderDefault('R'))
             : hasSlider('material') ? tauFromRho(rhoOf(defaultMaterial(), (sliderDefs().T && sliderDefs().T.default !== undefined) ? sliderDefs().T.default : T0Ref()))
             : hasSlider('tau') ? sliderDefault('tau') * 1e-15
             : physConst('tau_default_fs', 25) * 1e-15;
  return e * Edef * tauDef / m;
}

// ─── Cue gates (shared by stepPhysics AND resetToHomePose — the gate must be
//     derivable at ANY pinned sim-time including t=0, never hardcoded post-cue;
//     scar: particle_field_cue_gate_skipped_on_zero_step_freeze) ──────────────
function updateCueGates(state) {
  if (!state) { curFieldAlpha = 1; curDriftFactor = 1; curEffDrift = 0; return; }
  if (hasCue(state, 'field_on')) {
    var f = cueFiredAt['field_on'];
    if (f === undefined) {
      curFieldAlpha = 0;
      curDriftFactor = 0;
    } else {
      curFieldAlpha = constrain((PM_simTimeMs - f) / FIELD_FADE_MS, 0, 1);
      curDriftFactor = constrain((PM_simTimeMs - f - CAUSE_BEAT_MS) / DRIFT_RAMP_MS, 0, 1);
    }
  } else {
    curFieldAlpha = 1;
    curDriftFactor = 1;
  }
  curEffDrift = effDriftPx(state) * curDriftFactor;
}

// ─── Cue system ─────────────────────────────────────────────────────────────
function getCues(state) {
  if (!state) return [];
  if (state.cue) return [state.cue];
  if (state.cues && state.cues.length) return state.cues;
  return [];
}
function cueTriggerMs(c) {
  if (cueOverrides[c.id] !== undefined && cueOverrides[c.id] !== null) return cueOverrides[c.id];
  return (c.at_ms !== undefined) ? c.at_ms : 0;
}
function hasCue(state, id) {
  var cs = getCues(state);
  for (var i = 0; i < cs.length; i++) if (cs[i].id === id) return true;
  return false;
}
// Cause-first beat (Rule 32a): the field arrows appear FIRST, the drift
// responds only after a readable delay.
var FIELD_FADE_MS = 600;
var CAUSE_BEAT_MS = 900;
var DRIFT_RAMP_MS = 800;

// ─── Glow focal (Rules 29 / 32e — brightness only, one focal) ──────────────
function focalSet() {
  var g = (glowOverride !== null && glowOverride !== undefined) ? glowOverride
        : (curState() && curState().glow_focal) ? curState().glow_focal : null;
  if (!g) return null;
  var arr = (Object.prototype.toString.call(g) === '[object Array]') ? g : [g];
  var s = {};
  for (var i = 0; i < arr.length; i++) s[arr[i]] = true;
  return s;
}
function dimFor(name) {
  var s = focalSet();
  if (!s) return 1;
  return s[name] ? 1 : dimLevel();
}

// ─── Setup ──────────────────────────────────────────────────────────────────
function setup() {
  config = window.SIM_CONFIG;
  if (!config) { console.error('[Renderer] No SIM_CONFIG found'); return; }
  if (config.design && config.design.phys_seed) PHYS_SEED = config.design.phys_seed;

  var canvasW, canvasH;
  if (fillViewport()) {
    canvasW = max(320, windowWidth);
    canvasH = max(240, windowHeight);
  } else {
    canvasW = (config.canvas && config.canvas.width) ? config.canvas.width : (config.design && config.design.canvas_width) ? config.design.canvas_width : 800;
    canvasH = (config.canvas && config.canvas.height) ? config.canvas.height : (config.design && config.design.canvas_height) ? config.design.canvas_height : 400;
  }
  createCanvas(canvasW, canvasH);
  frameRate(60);

  rebuildScene();
  buildOverlayUI();
  applyStateVisuals();

  window.PM_simTimeMs = 0;
  window.PM_currentState = PM_currentState;
  // Declares the deterministic SET_TIME_FREEZE re-sim capability so the dense
  // capture harness takes the sim-time-pinned path (not legacy free-run).
  window.__PM_supportsTimePin = true;
  updateCueGates(curState());

  if (!simReadyFired) {
    simReadyFired = true;
    window.parent.postMessage({ type: 'SIM_READY' }, '*');
  }
}

function windowResized() {
  if (!config || !fillViewport()) return;
  resizeCanvas(max(320, windowWidth), max(240, windowHeight));
  rebuildLattice();
  rebuildFieldArrows();
}

// ─── Scene construction (deterministic) ─────────────────────────────────────
function rebuildScene() {
  physRand = mulberry32(PHYS_SEED);
  if (isCircuitFamily()) { circuitInitBeads(); collisionFlashes = []; powerEnergyReset(); return; }  // circuit path builds beads, not a free-drift gas
  particles = [];
  for (var i = 0; i < config.particles.count; i++) {
    var angle = pr() * TWO_PI;
    particles.push({
      x: prRange(20, width - 20),
      y: prRange(20, microH() - 20),   // built into the micro band (macroBandH()=0 when off)
      vx: cos(angle) * config.particles.thermal_speed,
      vy: sin(angle) * config.particles.thermal_speed,
      trail: [],
      collisions: 0,
      collisionTimer: floor(pr() * COLLISION_INTERVAL)
    });
  }
  rebuildLattice();
  rebuildFieldArrows();
  collisionFlashes = [];
}

function rebuildLattice() {
  var lr = mulberry32(PHYS_SEED + 1);   // own stream → identical layout on resize
  latticeIons = [];
  var mh = microH();
  var cols = ceil(sqrt(config.lattice.count * width / mh));
  var rows = ceil(config.lattice.count / cols);
  var spacingX = width / (cols + 1);
  var spacingY = mh / (rows + 1);
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      if (latticeIons.length >= config.lattice.count) break;
      latticeIons.push({
        x: spacingX * (c + 1) + (lr() * 8 - 4),
        y: spacingY * (r + 1) + (lr() * 8 - 4),
        vibration: 0
      });
    }
  }
}

function rebuildFieldArrows() {
  var fr = mulberry32(PHYS_SEED + 2);
  fieldArrows = [];
  for (var i = 0; i < config.field_arrows.count; i++) {
    fieldArrows.push({
      x: (i + 0.5) * (width / config.field_arrows.count),
      y: microH() * 0.5 + (fr() * 40 - 20)
    });
  }
}

// ─── Home pose + state entry (Rule 32d: same seed every state) ──────────────
function resetToHomePose() {
  rebuildScene();
  PM_simTimeMs = 0;
  window.PM_simTimeMs = 0;
  cueFiredAt = {};
  userTouched = {};             // each state re-runs its deterministic auto-sweep (THE EYE reproducibility)
  heatAccumulator = 0;
  simTimeSeconds = 0;
  updateCueGates(curState());   // gates valid at t=0 (a pinned opening frame must NOT show post-cue visuals)
}

function applyState(stateId) {
  if (!config || !config.states || !config.states[stateId]) return false;
  PM_currentState = stateId;
  window.PM_currentState = stateId;
  cueOverrides = {};   // player re-sends SET_CUE_TIME after SET_STATE
  glowOverride = null;
  frozen = false;      // SET_STATE releases any pin (player re-pins if it wants)
  resetToHomePose();
  applyStateVisuals();
  borderFlashAlpha = 1.0;
  return true;
}

// Per-state DOM visuals: caption, formula overlay, slider row visibility.
function applyStateVisuals() {
  var state = curState();
  if (!uiBuilt || !state) return;

  var cap = document.getElementById('pm-caption');
  if (cap) {
    cap.textContent = state.caption || '';
    cap.style.display = state.caption ? 'block' : 'none';
  }

  var frm = document.getElementById('pm-formula');
  if (frm) {
    frm.textContent = state.formula_overlay || '';
    frm.style.display = state.formula_overlay ? 'block' : 'none';
  }

  // Rule 31: rows shown/hidden per state; the panel (and each row) keeps its
  // screen position. visible_controls: [] subset; show_sliders: true = all.
  var panel = document.getElementById('pm-sliders');
  if (panel) {
    var vis = state.visible_controls || null;
    var showAll = !!state.show_sliders && !vis;
    var anyVisible = false;
    for (var id in sliderRows) {
      var show = showAll || (vis && vis.indexOf(id) >= 0);
      sliderRows[id].style.display = show ? 'flex' : 'none';
      if (show) anyVisible = true;
    }
    panel.style.display = anyVisible ? 'block' : 'none';
    updateReadouts();
  }
}

// ─── Overlay DOM (sliders / caption / formula) ──────────────────────────────
function buildOverlayUI() {
  if (uiBuilt) return;
  uiBuilt = true;

  var cap = document.createElement('div');
  cap.id = 'pm-caption';
  cap.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);' +
    'max-width:68%;background:rgba(8,10,26,0.72);color:#E8EAF6;padding:6px 16px;' +
    'border-radius:8px;font:600 14px system-ui,sans-serif;text-align:center;' +
    'z-index:20;display:none;pointer-events:none;border:1px solid rgba(255,255,255,0.08);';
  document.body.appendChild(cap);

  var frm = document.createElement('div');
  frm.id = 'pm-formula';
  frm.style.cssText = 'position:fixed;right:12px;bottom:12px;background:rgba(0,0,0,0.6);' +
    'color:#FFEB3B;padding:8px 12px;border-radius:8px;white-space:pre;' +
    'font:12px/1.5 ui-monospace,Consolas,monospace;z-index:20;display:none;pointer-events:none;';
  document.body.appendChild(frm);

  var defs = sliderDefs();
  if (!defs) return;

  var panel = document.createElement('div');
  panel.id = 'pm-sliders';
  panel.style.cssText = 'position:fixed;top:10px;right:10px;width:238px;' +
    'background:rgba(8,10,26,0.82);border:1px solid rgba(255,255,255,0.1);' +
    'border-radius:10px;padding:10px 12px;z-index:30;display:none;' +
    'font:12px system-ui,sans-serif;color:#CFD8DC;';
  document.body.appendChild(panel);

  for (var id in defs) {
    (function(sid) {
      var d = defs[sid];
      var row = document.createElement('div');
      row.style.cssText = 'display:none;flex-direction:column;margin-bottom:8px;';

      var top = document.createElement('div');
      top.style.cssText = 'display:flex;justify-content:space-between;margin-bottom:2px;';
      var lab = document.createElement('span');
      lab.textContent = d.label || sid;
      lab.style.cssText = 'color:#FFD54F;font-weight:600;';
      var val = document.createElement('span');
      val.id = 'pm-sv-' + sid;
      top.appendChild(lab);
      top.appendChild(val);
      row.appendChild(top);

      var inp = document.createElement('input');
      inp.type = 'range';
      inp.min = d.min; inp.max = d.max; inp.step = d.step || 1;
      inp.value = (d.default !== undefined) ? d.default : d.min;
      inp.style.cssText = 'width:100%;accent-color:#FFD54F;';
      inp.addEventListener('input', function() {
        userParams[sid] = parseFloat(inp.value);
        userTouched[sid] = true;   // seizes any clock auto-sweep for this control
        updateReadouts();
      });
      row.appendChild(inp);

      panel.appendChild(row);
      sliderRows[sid] = row;
      userParams[sid] = parseFloat(inp.value);
    })(id);
  }

  var readout = document.createElement('div');
  readout.id = 'pm-readout';
  readout.style.cssText = 'margin-top:4px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.12);' +
    'font:600 12px ui-monospace,Consolas,monospace;color:#80DEEA;white-space:pre;';
  panel.appendChild(readout);
  updateReadouts();
}

function fmtSliderValue(id) {
  if (id === 'material') return materialAt(sliderVal('material')).label;
  if (id === 'topology') return sliderVal('topology') >= 0.5 ? 'Parallel' : 'Series';
  if (id === 'switch') return sliderVal('switch') < 0.5 ? 'Open' : 'Closed';
  var defs = sliderDefs();
  var d = (defs && defs[id]) ? defs[id] : {};
  var v = sliderVal(id);
  var u = d.unit ? (' ' + d.unit) : '';
  return (Math.round(v * 100) / 100) + u;
}

function updateReadouts() {
  var defs = sliderDefs();
  if (!defs) return;
  for (var id in defs) {
    var el = document.getElementById('pm-sv-' + id);
    if (el) el.textContent = fmtSliderValue(id);
  }
  // ohms_law: the V thumb sits at default while the graph auto-sweeps — show the
  // live swept voltage on the V row so the number matches the moving point.
  if (hasSlider('V') && !userTouched['V']) {
    var vEl = document.getElementById('pm-sv-V');
    if (vEl) { var vd2 = defs.V || {}; vEl.textContent = (Math.round(plotV() * 100) / 100) + (vd2.unit ? (' ' + vd2.unit) : ''); }
  }
  if (emfMode() && hasSlider('emf') && !userTouched['emf'] && curState() && curState().emf_autosweep) {
    var eSwEl = document.getElementById('pm-sv-emf');        // emf row tracks the S4 auto-glide (thumb stays at default)
    if (eSwEl) { var ed = defs.emf || {}; eSwEl.textContent = (Math.round(cEmf() * 100) / 100) + (ed.unit ? (' ' + ed.unit) : ''); }
  }
  if (hasSlider('R') && !userTouched['R'] && !emfMode() && !irMode()) {   // R thumb tracks the r_autosweep (ohms_law only)
    var rEl = document.getElementById('pm-sv-R');
    if (rEl) { var rd2 = defs.R || {}; rEl.textContent = (Math.round(plotR() * 100) / 100) + (rd2.unit ? (' ' + rd2.unit) : ''); }
  }
  if (irMode() && hasSlider('R') && !userTouched['R'] && curState() && curState().R_autosweep_down) {
    var rIrEl = document.getElementById('pm-sv-R');            // R row tracks the S3/S4 auto-sweep
    if (rIrEl) { var rdd = defs.R || {}; rIrEl.textContent = (Math.round(cIrLoadR() * 100) / 100) + (rdd.unit ? (' ' + rdd.unit) : ''); }
  }
  if (irMode() && hasSlider('switch') && !userTouched['switch'] && curState() && (curState().droop_intro || curState().two_reading)) {
    var swIrEl = document.getElementById('pm-sv-switch');      // switch row tracks the cued close
    if (swIrEl) swIrEl.textContent = irSwitchOpen() ? 'Open' : 'Closed';
  }
  // resistivity: L/A/material/T rows track their own auto-sweeps until grabbed.
  if (hasSlider('L') && !userTouched['L']) {
    var lEl = document.getElementById('pm-sv-L');
    if (lEl) { var ld2 = defs.L || {}; lEl.textContent = (Math.round(curL() * 100) / 100) + (ld2.unit ? (' ' + ld2.unit) : ''); }
  }
  if (hasSlider('A') && !userTouched['A'] && curState() && (curState().geometry_cycle || curState().area_autosweep)) {
    var aEl = document.getElementById('pm-sv-A');
    if (aEl) { var ad2 = defs.A || {}; aEl.textContent = (Math.round(curA() * 100) / 100) + (ad2.unit ? (' ' + ad2.unit) : ''); }
  }
  if (hasSlider('material') && !userTouched['material']) {
    var mEl = document.getElementById('pm-sv-material');
    if (mEl) mEl.textContent = currentMaterial().label;
  }
  if (hasSlider('T') && !userTouched['T']) {
    var tEl = document.getElementById('pm-sv-T');
    if (tEl) { var td2 = defs.T || {}; tEl.textContent = (Math.round(curTemperature() * 100) / 100) + (td2.unit ? (' ' + td2.unit) : ''); }
  }
  if (circuitMode() && hasSlider('R2') && !userTouched['R2'] && curState() && curState().r2_autosweep) {
    var r2El = document.getElementById('pm-sv-R2');           // R2 label tracks the S6 auto-sweep
    if (r2El) { var r2d = defs.R2 || {}; r2El.textContent = fmtNum(cR2()) + (r2d.unit ? (' ' + r2d.unit) : ''); }
  }
  if (circuitMode() && hasSlider('switch') && curState() && curState().switch_cycle) {
    var swEl = document.getElementById('pm-sv-switch');       // switch label tracks the S8 auto open/close
    if (swEl) swEl.textContent = cSwitchOpen() ? 'Open' : 'Closed';
  }
  var ro = document.getElementById('pm-readout');
  if (ro) {
    if (irMode()) {                                           // internal_resistance: eps, r, V, i (real cell)
      var ic2 = irCurrents();
      ro.textContent = '\\u03B5 = ' + ic2.eps.toFixed(1) + ' V\\n' +
                       'r = ' + ic2.r.toFixed(1) + ' \\u03A9\\n' +
                       'V = ' + ic2.Vterm.toFixed(2) + ' V\\n' +
                       'i = ' + ic2.i.toFixed(2) + ' A';
    } else if (emfMode()) {                                   // emf_definition: eps, terminal V, i (ideal cell -> V = eps)
      var ec = emfCurrents();
      ro.textContent = '\\u03B5 = ' + ec.eps.toFixed(1) + ' V\\n' +
                       'V = ' + ec.Vterm.toFixed(2) + ' V\\n' +
                       'i = ' + ec.i.toFixed(2) + ' A';
    } else if (powerMode()) {                                 // electric_power: P per bulb + total
      var pwr = cBulbPowers();
      var stPw = curState();
      if (pwr.single && stPw && stPw.three_faces) {           // S2: the three faces, all computing the SAME live watt
        var ccF = cCurrents();
        ro.textContent = 'VI = ' + (ccF.V * ccF.itot).toFixed(2) + ' W\\n' +
                         'I\\u00B2R = ' + (ccF.itot * ccF.itot * ccF.R1).toFixed(2) + ' W\\n' +
                         'V\\u00B2/R = ' + ((ccF.V * ccF.V) / ccF.R1).toFixed(2) + ' W';
      } else if (pwr.single) {
        ro.textContent = 'P = ' + pwr.P1.toFixed(2) + ' W';
      } else {
        ro.textContent = 'P\\u2081 = ' + pwr.P1.toFixed(2) + ' W\\n' +
                         'P\\u2082 = ' + pwr.P2.toFixed(2) + ' W\\n' +
                         'total = ' + pwr.Ptot.toFixed(2) + ' W';
      }
    } else if (circuitMode()) {                               // combination_of_resistors: R_eq + total current
      var cc = cCurrents();
      ro.textContent = (cc.topo === 'series' ? 'Series' : 'Parallel') + '\\n' +
                       'R_eq = ' + fmtNum(cc.Req) + ' \\u03A9\\n' +
                       'i = ' + cc.itot.toFixed(2) + ' A';
    } else if (hasSlider('material')) {                       // resistivity: R, rho, i (independently glowable)
      var iAm = realCurrent();
      var Rval = realResistance();
      ro.innerHTML =
        '<span id="pm-ro-r">R = ' + (Rval > 1e-9 ? Rval.toFixed(3) + ' \\u03A9' : '\\u2013') + '</span>\\n' +
        '<span id="pm-ro-rho">\\u03C1 = ' + curRho().toExponential(2) + ' \\u03A9\\u00B7m</span>\\n' +
        '<span id="pm-ro-i">i = ' + iAm.toFixed(2) + ' A</span>';
    } else if (hasSlider('V') || hasSlider('R')) {   // ohms_law: V, i, R = V/i
      var iA = realCurrent();
      ro.textContent = 'V = ' + realVoltage().toFixed(2) + ' V\\n' +
                       'i = ' + iA.toFixed(2) + ' A\\n' +
                       'R = ' + (iA > 1e-6 ? realResistance().toFixed(2) + ' \\u03A9' : '\\u2013');
    } else {                                  // drift concept: v_d, i
      var vd = realDriftVelocity();
      var vdmm = vd * 1000;
      var lines = 'v_d = ' + (vdmm >= 0.01 ? vdmm.toFixed(2) + ' mm/s' : vd.toExponential(2) + ' m/s');
      if (defs.A !== undefined) lines += '\\ni = ' + realCurrent().toFixed(2) + ' A';
      ro.textContent = lines;
    }
  }
}

// ─── Effective physics parameters (sliders × cue gates) ─────────────────────
function effDriftPx(state) {
  var base = state.drift_speed || 0;
  if (base <= 0) return 0;
  var scale = 1;
  var defs = sliderDefs();
  if (defs && defs.E) scale *= sliderVal('E') / max(sliderDefault('E'), 0.0001);
  if (defs && defs.tau) scale *= sliderVal('tau') / max(sliderDefault('tau'), 0.0001);
  // ohms_law: no E/tau sliders — scale the visible drift by the real v_d ratio
  // (v_d ∝ V ∝ 1/R), so electrons visibly speed up with V and slow with R.
  if (defs && (defs.V || defs.R || defs.material)) {
    var vdDef = driftVelocityAtDefaults();
    if (vdDef > 0) scale *= realDriftVelocity() / vdDef;
  }
  return constrain(base * scale, 0, 3.2);
}
function collisionFrames() {
  var defs = sliderDefs();
  var f = COLLISION_INTERVAL;
  if (defs && defs.tau) f = COLLISION_INTERVAL * (sliderVal('tau') / max(sliderDefault('tau'), 0.0001));
  if (defs && defs.material) {
    var tauDef = tauFromRho(rhoOf(defaultMaterial(), T0Ref()));
    f = COLLISION_INTERVAL * (effTauSeconds() / max(tauDef, 1e-30));
  }
  return constrain(f, 3, 40);
}

// ─── Physics step (one 1/60 s tick — ALL sim-state mutation lives here) ─────
function stepPhysics(state) {
  PM_simTimeMs += 1000 / 60;
  window.PM_simTimeMs = PM_simTimeMs;

  // Fire cues whose trigger time has arrived
  var cues = getCues(state);
  for (var ci = 0; ci < cues.length; ci++) {
    var c = cues[ci];
    if (cueFiredAt[c.id] === undefined && PM_simTimeMs >= cueTriggerMs(c)) {
      cueFiredAt[c.id] = PM_simTimeMs;
    }
  }

  // Cue gates: field_on = arrows fade in FIRST, drift ramps after a beat (32a)
  updateCueGates(state);
  var intensity = getCurrentIntensity();
  var colFrames = collisionFrames();

  if (intensity > 0) {
    simTimeSeconds += 1.0 / 60.0;
    heatAccumulator += intensity * 10 * (1.0 / 60.0);
  }

  // Advance collision flashes (age is sim state, not render state)
  for (var fi = collisionFlashes.length - 1; fi >= 0; fi--) {
    collisionFlashes[fi].age++;
    if (collisionFlashes[fi].age >= 20) collisionFlashes.splice(fi, 1);
  }

  // Particles
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    p.collisionTimer--;
    var justCollided = false;
    if (p.collisionTimer <= 0) {
      p.collisionTimer = colFrames + floor(prRange(-2, 3));
      var angle = pr() * TWO_PI;
      p.vx = cos(angle) * config.particles.thermal_speed;
      p.vy = sin(angle) * config.particles.thermal_speed;
      justCollided = true;
      p.collisions++;   // the tallied scatter events (Rule 33c: a real number)
    }

    if (justCollided && (hasCollisionGlow() || isFeaturedIdx(i)) && intensity > 0) {
      var nearestDist = Infinity;
      var nearestIon = null;
      for (var li = 0; li < latticeIons.length; li++) {
        var dx = p.x - latticeIons[li].x;
        var dy = p.y - latticeIons[li].y;
        var d = dx * dx + dy * dy;
        if (d < nearestDist) { nearestDist = d; nearestIon = latticeIons[li]; }
      }
      if (nearestIon && nearestDist < 80 * 80) {
        spawnCollisionFlash(nearestIon.x, nearestIon.y, intensity);
      }
    }

    var currentVx = p.vx;
    var currentVy = p.vy;
    // All carriers keep drifting (motion never dies); count_carriers tells its
    // story via BRIGHTNESS in drawParticles — more area lights up more carriers.
    if (curEffDrift > 0 && state.drift_direction && state.drift_direction !== 'none') {
      var driftSign = state.drift_direction === 'left' ? -1 : 1;
      currentVx += driftSign * curEffDrift;
    }

    p.x += currentVx;
    p.y += currentVy;
    var wrapped = false;
    if (p.x < -5) { p.x = width + 5; wrapped = true; }
    if (p.x > width + 5) { p.x = -5; wrapped = true; }
    if (p.y < -5) { p.y = microH() + 5; wrapped = true; }
    if (p.y > microH() + 5) { p.y = -5; wrapped = true; }
    if (wrapped) p.trail.length = 0;   // no full-canvas streak on wrap

    p.trail.push({ x: p.x, y: p.y });
    var maxTrail = isFeaturedIdx(i)
      ? config.particles.trail_length * 2.5
      : config.particles.trail_length;
    while (p.trail.length > maxTrail) p.trail.shift();
  }
}

// ─── Current intensity (heat/glow scaling) ──────────────────────────────────
function getCurrentIntensity() {
  if (curEffDrift <= 0) return 0;
  var normalized = constrain(curEffDrift / 1.5, 0, 1);
  if (hasGlowScaling()) return normalized * normalized;
  return normalized;
}

// ═══════════════════════════════════════════════════════════════════════════
// CIRCUIT SCENARIO — combination_of_resistors (series / parallel resistors)
// A distinct render path: electron beads follow wire+resistor LOOPS and split at
// a parallel junction by branch conductance. Everything is a pure function of
// PM_simTimeMs so SET_TIME_FREEZE re-sim reproduces frames. The free-drift
// scenarios (drift/ohms/resistivity) never enter this path (circuitMode() false).
// ═══════════════════════════════════════════════════════════════════════════
function circuitMode() { return !!(config && config.scenario_type === 'combination_of_resistors'); }
function emfMode() { return !!(config && config.scenario_type === 'emf_definition'); }
function irMode() { return !!(config && config.scenario_type === 'internal_resistance'); }
function powerMode() { return !!(config && config.scenario_type === 'electric_power'); }
function isCircuitFamily() { return circuitMode() || emfMode() || irMode() || powerMode(); }
function circuitBeadCount() { return (config && config.particles && config.particles.count) ? config.particles.count : 40; }

// ── emf physics (emf_definition) — IDEAL cell, r = 0: terminal V = eps always ──
// The droop V = eps - I*r is the NEXT diamond (internal_resistance); this scenario
// claims nothing about it. i = eps / R_load (open circuit -> i = 0).
// Per-state numeric locks (st.emf / st.R / st.switch) win over the live slider so a
// guided state renders at its authored value even after a teacher dragged a slider and
// jumped states on the reorderable rail (Rule 25d). Live states (S4 emf, S6 all) omit
// the lock, so the slider drives.
function cEmf()   {
  var st = curState();
  if (st && st.emf_autosweep && !userTouched['emf']) {   // S4: ε glides up so "taller lift" self-demonstrates (teacher-seizable)
    var a = 1.5, b = (st.emf_autosweep_to !== undefined) ? st.emf_autosweep_to : 12;
    return a + (b - a) * constrain((PM_simTimeMs - 700) / 3200, 0, 1);
  }
  if (st && typeof st.emf === 'number') return st.emf;
  return hasSlider('emf') ? sliderVal('emf') : physConst('emf', 1.5);
}
function cLoadR() { var st = curState(); if (st && typeof st.R === 'number') return st.R; return hasSlider('R') ? sliderVal('R') : physConst('R_load', 1.5); }
function emfSwitchOpen() {
  var st = curState();
  if (st && st.open_circuit) return true;              // S5: loop opened to measure emf
  if (st && typeof st.switch === 'number') return st.switch < 0.5;   // per-state lock (0=open, 1=closed)
  if (hasSlider('switch')) return sliderVal('switch') < 0.5;
  return false;
}
function emfCurrents() {
  var eps = cEmf(), R = max(cLoadR(), 1e-6);
  var swOpen = emfSwitchOpen();
  var i = swOpen ? 0 : eps / R;
  return { eps: eps, R: R, i: i, swOpen: swOpen, Vterm: eps };
}

// ── internal_resistance physics — the REAL cell: i = eps/(R+r), V = eps - i*r ──
// (charging: an ideal 3.0 V charger drives i backwards -> V = eps + i*r).
// Per-state numeric locks (st.emf / st.r / st.R / st.switch) win over sliders so a
// guided state renders at its authored value on the reorderable rail (Rule 25d).
function cIntR() {
  var st = curState();
  if (st && typeof st.r === 'number') return st.r;
  return hasSlider('r') ? sliderVal('r') : physConst('r_internal', 0.5);
}
function cIrLoadR() {
  var st = curState();
  if (st && st.R_autosweep_down && !userTouched['R']) {   // S3 droop-grow / S4 short-circuit sweep (teacher-seizable)
    var a = (st && typeof st.R === 'number') ? st.R : (hasSlider('R') ? sliderDefault('R') : 1.0);
    var b = (st.R_autosweep_to !== undefined) ? st.R_autosweep_to : 0.25;
    return a + (b - a) * constrain((PM_simTimeMs - 700) / 3200, 0, 1);
  }
  return cLoadR();
}
function irSwitchOpen() {
  var st = curState();
  if (st && st.droop_intro && !userTouched['switch']) return PM_simTimeMs < 1500;   // S1: cued close
  if (st && st.two_reading && !userTouched['switch']) return PM_simTimeMs < 2500;   // S5: open-hold, then close
  if (st && st.open_circuit) return true;
  if (st && typeof st.switch === 'number') return st.switch < 0.5;
  if (hasSlider('switch')) return sliderVal('switch') < 0.5;
  return false;
}
function irRampK() {   // deterministic 800ms current ease after a cued switch-close
  var st = curState();
  if (userTouched['switch']) return 1;
  var t0 = (st && st.droop_intro) ? 1500 : ((st && st.two_reading) ? 2500 : 0);
  if (!t0) return 1;
  return constrain((PM_simTimeMs - t0) / 800, 0, 1);
}
function irCurrents() {
  var eps = cEmf(), r = max(cIntR(), 1e-6);
  var st = curState();
  if (st && st.charging) {
    var epsCh = (typeof st.charger_emf === 'number') ? st.charger_emf : 3.0;
    var Rs = cIrLoadR();
    var iC = max(epsCh - eps, 0) / (Rs + r);
    return { eps: eps, r: r, R: Rs, i: iC, swOpen: false, Vterm: eps + iC * r, mode: 'charging', epsCh: epsCh };
  }
  var R = cIrLoadR();   // R_autosweep_to: 0 is legal — the denominator is R + r >= r > 0
  var swOpen = irSwitchOpen();
  var i = swOpen ? 0 : (eps / (R + r)) * irRampK();
  return { eps: eps, r: r, R: R, i: i, swOpen: swOpen, Vterm: eps - i * r, mode: swOpen ? 'open' : 'discharge' };
}
function fmtNum(x) { return (abs(x - round(x)) < 0.05) ? String(round(x)) : x.toFixed(1); }

// ── circuit physics (pure functions of V, R1, R2, topology, switch) ─────────
// electric_power per-state numeric locks (powerMode-gated → siblings untouched):
// a guided state may pin V/R1/R2 so a value dragged in an earlier interactive
// state (e.g. V in S2) never corrupts a later state's taught numbers (S3's 6 J/s).
// The live control of each state is left UNPINNED so its slider still drives.
function cVolt() { var st = curState(); if (powerMode() && st && typeof st.V === 'number') return st.V; return hasSlider('V') ? sliderVal('V') : physConst('V_circuit', 6); }
function cR1() { var st = curState(); if (powerMode() && st && typeof st.R1 === 'number') return st.R1; return hasSlider('R1') ? sliderVal('R1') : physConst('R1', 6); }
function cR2raw() { var st = curState(); if (powerMode() && st && typeof st.R2 === 'number') return st.R2; return hasSlider('R2') ? sliderVal('R2') : physConst('R2', 6); }
function cR2() {
  var st = curState();
  if (st && st.r2_autosweep && !userTouched['R2']) {   // S6: R2 grows 6->12 to open the split
    var start = 700, dur = 3200;
    var r2a = hasSlider('R2') ? sliderDefault('R2') : 6;
    var r2b = (st.r2_autosweep_to !== undefined) ? st.r2_autosweep_to : 12;
    return r2a + (r2b - r2a) * constrain((PM_simTimeMs - start) / dur, 0, 1);
  }
  return cR2raw();
}
function cTopology() {
  var st = curState();
  if (st && st.topology) return st.topology;
  if (hasSlider('topology')) return sliderVal('topology') >= 0.5 ? 'parallel' : 'series';
  return 'series';
}
function cSwitchOpen() {
  var st = curState();
  if (st && st.switch_cycle) { var per = 4200; return (PM_simTimeMs % per) > (per * 0.52); }  // S8: auto open/close
  if (hasSlider('switch')) return sliderVal('switch') < 0.5;   // 0 = open, 1 = closed
  return false;
}
function cCurrents() {
  var V = cVolt(), R1 = max(cR1(), 1e-6), R2 = max(cR2(), 1e-6);
  var swOpen = cSwitchOpen();
  var st0 = curState();
  if (st0 && st0.single_resistor) {                    // S1 baseline: one loop, one resistor
    var iB = swOpen ? 0 : V / R1;
    return { topo: 'series', single: true, i1: iB, i2: iB, itot: iB, Req: R1, V: V, R1: R1, R2: R2 };
  }
  if (cTopology() === 'series') {
    var iS = swOpen ? 0 : V / (R1 + R2);
    return { topo: 'series', i1: iS, i2: iS, itot: iS, Req: R1 + R2, V: V, R1: R1, R2: R2 };
  }
  var i1 = V / R1;
  var i2 = swOpen ? 0 : V / R2;
  return { topo: 'parallel', i1: i1, i2: i2, itot: i1 + i2,
           Req: swOpen ? R1 : (R1 * R2) / (R1 + R2), V: V, R1: R1, R2: R2 };
}

// ── electric_power: per-bulb dissipation + Joule-heating energy accumulator ──
// Series: same current itot through both -> P = i^2 R. Parallel: same V across
// each -> P = V^2 / R. POWER_PMAX is a FIXED brightness normalizer (never
// per-state auto-scale) so the series-vs-parallel magnitude flip stays honest.
var POWER_PMAX = 6;
var powerEnergyJ = 0;                 // S3 accumulator (state-local; reset on entry)
function powerEnergyReset() { powerEnergyJ = 0; }
function cBulbPowers() {
  var c = cCurrents();
  if (c.single) {
    var Ps = c.itot * c.V;
    return { topo: 'single', single: true, P1: Ps, P2: 0, Ptot: Ps, Pmax: POWER_PMAX };
  }
  if (c.topo === 'series') {
    var Pa = c.itot * c.itot * c.R1, Pb = c.itot * c.itot * c.R2;
    return { topo: 'series', single: false, P1: Pa, P2: Pb, Ptot: Pa + Pb, Pmax: POWER_PMAX };
  }
  var Pp1 = (c.V * c.V) / c.R1;
  var Pp2 = (c.i2 <= 1e-9) ? 0 : (c.V * c.V) / c.R2;
  return { topo: 'parallel', single: false, P1: Pp1, P2: Pp2, Ptot: Pp1 + Pp2, Pmax: POWER_PMAX };
}

// ── geometry + polyline sampling ────────────────────────────────────────────
function circuitGeom() {
  var leftX = width * 0.15, rightX = width * 0.70;
  var topY = height * 0.31, botY = height * 0.73;
  var midY = (topY + botY) / 2;
  var span = rightX - leftX;
  return { leftX: leftX, rightX: rightX, topY: topY, botY: botY, midY: midY,
           jLx: leftX + span * 0.26, jRx: leftX + span * 0.74, gap: height * 0.115,
           sR1: { x: leftX + span * 0.34, y: topY }, sR2: { x: leftX + span * 0.64, y: topY },
           pRx: leftX + span * 0.50, amMain: { x: (leftX + rightX) / 2, y: botY } };
}
function polyLen(pts) { var L = 0; for (var i = 1; i < pts.length; i++) L += dist(pts[i-1].x, pts[i-1].y, pts[i].x, pts[i].y); return L; }
function polyAt(pts, total, s) {
  var target = ((s % 1) + 1) % 1 * total, acc = 0;
  for (var i = 1; i < pts.length; i++) {
    var seg = dist(pts[i-1].x, pts[i-1].y, pts[i].x, pts[i].y);
    if (acc + seg >= target) { var f = (target - acc) / max(seg, 1e-6); return { x: lerp(pts[i-1].x, pts[i].x, f), y: lerp(pts[i-1].y, pts[i].y, f) }; }
    acc += seg;
  }
  return pts[pts.length - 1];
}
function circuitLoops() {
  var g = circuitGeom();
  var batt = { x: g.leftX, y: g.midY };
  var inSeg = [batt, { x: g.leftX, y: g.topY }, { x: g.jLx, y: g.topY }];
  var outSeg = [{ x: g.jRx, y: g.topY }, { x: g.rightX, y: g.topY }, { x: g.rightX, y: g.botY }, { x: g.leftX, y: g.botY }, batt];
  var b1 = [{ x: g.jLx, y: g.topY - g.gap }, { x: g.jRx, y: g.topY - g.gap }];
  var b2 = [{ x: g.jLx, y: g.topY + g.gap }, { x: g.jRx, y: g.topY + g.gap }];
  return { g: g,
    series: [batt, { x: g.leftX, y: g.topY }, { x: g.rightX, y: g.topY }, { x: g.rightX, y: g.botY }, { x: g.leftX, y: g.botY }, batt],
    loop1: inSeg.concat(b1, outSeg), loop2: inSeg.concat(b2, outSeg) };
}

// ── beads (fixed phase spread; branch chosen by live current fraction) ──────
function circuitInitBeads() {
  var r = mulberry32(PHYS_SEED + 7); circuitBeadPhase = [];
  for (var i = 0; i < circuitBeadCount(); i++) circuitBeadPhase.push(r());
}
function circuitBeadLoop(i, c) {
  if (c.topo === 'series' || c.itot <= 1e-9) return 'series';
  var lane = (i + 0.5) / circuitBeadCount();
  return (lane < c.i1 / c.itot) ? 'loop1' : 'loop2';   // fraction on branch1 = i1/itot
}
function circuitBeadS(i, c) {
  var spd = (c.itot < 0.02) ? 0 : constrain(c.itot / 1.0, 0.28, 3.0);   // more total current -> faster; dead loop halts
  var dir = (c && c.dir === -1) ? -1 : 1;   // internal_resistance charging: beads reverse (polyAt normalizes negatives)
  return (circuitBeadPhase[i] + dir * CIRCUIT_BEAD_RATE * (PM_simTimeMs / 1000) * spd) % 1;
}

// ── primitives ──────────────────────────────────────────────────────────────
function drawWireC(pts, hex, a, w) {
  strokeHex(hex, a); strokeWeight(w); noFill();
  beginShape(); for (var i = 0; i < pts.length; i++) vertex(pts[i].x, pts[i].y); endShape();
  noStroke();
}
function drawResistorBoxC(cx, cy, label, dim) {
  rectMode(CENTER);
  fill(18, 22, 38, 235 * dim); noStroke(); rect(cx, cy, 66, 26, 4);
  strokeHex('#FFB74D', 0.95 * dim); strokeWeight(2); noFill(); rect(cx, cy, 66, 26, 4);
  strokeWeight(2); noFill();   // zigzag element
  beginShape();
  var x0 = cx - 22;
  for (var k = 0; k <= 6; k++) vertex(x0 + k * (44 / 6), cy + (k === 0 || k === 6 ? 0 : (k % 2 ? -6 : 6)));
  endShape();
  rectMode(CORNER); noStroke();
  fillHex('#FFFFFF', 0.95 * dim); textSize(12); textStyle(BOLD); textAlign(CENTER, TOP);
  text(label, cx, cy + 16); textStyle(NORMAL);
}
// A bulb = a resistor that shows its dissipation as LIGHT. Brightness (not size —
// Rule 29) tracks power via a sqrt map so low-power series bulbs still read as lit
// and their 2:1 ratio stays visible, while the parallel bulbs go full-bright.
// Pmax is a FIXED normalizer (never per-state auto-scale) so the series-vs-parallel
// magnitude flip is honest. rating e.g. '6 W'; P in watts; dim = glow-focal mult.
function drawBulbC(cx, cy, rating, R, P, Pmax, dim) {
  var b = constrain(sqrt(max(P, 0) / max(Pmax, 1e-6)), 0.12, 1);   // brightness 0.12..1
  var flick = 0.96 + 0.04 * sin(PM_simTimeMs / 140);               // faint filament shimmer
  var glow = b * flick;
  // heat/light halo (extends the i^2 r halo idiom from drawEmfCell)
  noStroke(); fillHex('#FFB300', 0.16 * glow * dim); ellipse(cx, cy, 46 + 26 * glow);
  fillHex('#FFCA28', 0.22 * glow * dim); ellipse(cx, cy, 30 + 12 * glow);
  // glass envelope (constant geometry — never scales)
  strokeHex('#B0BEC5', 0.85 * dim); strokeWeight(2); noFill(); ellipse(cx, cy, 26, 26);
  strokeWeight(2); line(cx - 6, cy + 12, cx + 6, cy + 12);         // base contact
  // filament: bright core whose alpha = brightness
  noStroke(); fillHex('#FFF3E0', (0.25 + 0.75 * glow) * dim); ellipse(cx, cy, 12);
  strokeHex('#FFD54F', (0.4 + 0.6 * glow) * dim); strokeWeight(1.5); noFill();
  beginShape();
  for (var k = 0; k <= 4; k++) vertex(cx - 6 + k * 3, cy + (k % 2 ? -4 : 4));
  endShape(); noStroke();
  // nameplate rating + resistance (above) + live power (below) — R is the cause
  // variable P = I²R / V²/R turns on, so it must be visible (reads sound-off).
  fillHex('#FFE082', 0.95 * dim); textSize(11); textStyle(BOLD); textAlign(CENTER, BOTTOM);
  text(rating + ' \\u00B7 ' + fmtNum(R) + ' \\u03A9', cx, cy - 18);
  fillHex('#FFFFFF', 0.98 * dim); textSize(12); textAlign(CENTER, TOP);
  text('P = ' + P.toFixed(2) + ' W', cx, cy + 18); textStyle(NORMAL);
}
function drawBatteryC(g, V, dim) {
  var bx = g.leftX, by = g.midY;
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(bx, by - 15, bx, by + 15);
  strokeWeight(6); line(bx - 9, by - 8, bx - 9, by + 8);
  noStroke(); fillHex('#FFD54F', 0.95 * dim);
  textSize(12); textStyle(BOLD); textAlign(RIGHT, CENTER);
  text('V = ' + V.toFixed(1) + ' V', bx - 18, by); textStyle(NORMAL);
}
// The cell as a CHARGE PUMP: charges rise inside it from - to + (the chemistry
// does work on each one). The upward arrow = "work done on each charge". Named
// meshes stay full-bright; the pump animates only when pumpActive.
// Optional 5th arg rr = { r, i, reveal 0..1, heat 0..1 } (internal_resistance):
// draws the opened casing + the hidden r zigzag + i*r drop label + i^2 r heat
// halo. rr absent -> pixel-identical emf_definition rendering (locked baselines).
function drawEmfCell(g, eps, dim, pumpActive, rr) {
  var bx = g.leftX, by = g.midY;
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(bx, by - 16, bx, by + 16);   // + plate (long)
  strokeWeight(6); line(bx - 9, by - 8, bx - 9, by + 8);                                 // - plate (short/thick)
  if (pumpActive) {
    var pDim = dimFor('pump'), n = 4;
    for (var k = 0; k < n; k++) {
      var ph = (PM_simTimeMs / 900 + k / n) % 1;                 // 0 = bottom (-), 1 = top (+)
      var py = lerp(by + 13, by - 13, ph);
      fillHex('#42A5F5', (0.2 + 0.7 * sin(ph * PI)) * pDim); noStroke(); ellipse(bx - 3, py, 6);
    }
    strokeHex('#FFD54F', 0.9 * pDim); strokeWeight(2);           // work-on-each-charge arrow (upward)
    line(bx - 3, by + 11, bx - 3, by - 11);
    line(bx - 3, by - 11, bx - 7, by - 5); line(bx - 3, by - 11, bx + 1, by - 5);
    noStroke();
  }
  if (rr && rr.reveal > 0) {
    var rDim = dimFor('r_internal') * rr.reveal;
    var byT = by - 34;                                           // r sits between the + plate and the wire exit
    if (rr.heat > 0.05) {                                        // i^2 r heat halo (short circuit cooks the cell)
      var hp = 0.5 + 0.5 * sin(PM_simTimeMs / 260);
      noStroke(); fillHex('#FF7043', (0.10 + 0.25 * rr.heat * hp) * rDim);
      ellipse(bx - 2, by - 12, 54 + 26 * rr.heat);
    }
    strokeHex('#B0BEC5', 0.55 * rDim); strokeWeight(1); noFill();
    rectMode(CENTER); rect(bx - 2, by - 6, 34, 62, 5); rectMode(CORNER);   // the opened casing
    strokeHex('#FF8A65', 0.95 * rDim); strokeWeight(2); noFill();          // the hidden r (vertical zigzag)
    beginShape();
    for (var zk = 0; zk <= 6; zk++) vertex(bx + (zk === 0 || zk === 6 ? 0 : (zk % 2 ? -5 : 5)), byT + zk * (16 / 6));
    endShape();
    noStroke(); fillHex('#FF8A65', 0.95 * rDim); textSize(10); textStyle(BOLD); textAlign(RIGHT, CENTER);
    text('r = ' + rr.r.toFixed(1) + ' \\u03A9', bx - 20, byT + 2);   // left of the cell (right of it sits the voltmeter)
    if (rr.i > 0.02) {
      fillHex('#FFAB91', 0.9 * rDim); textSize(10); textAlign(RIGHT, CENTER);
      text('i\\u00B7r = ' + (rr.i * rr.r).toFixed(2) + ' V', bx - 20, byT - 12);
    }
    textStyle(NORMAL);
  }
  textSize(12); textStyle(BOLD); textAlign(RIGHT, CENTER);
  var elbl = '\\u03B5 = ' + eps.toFixed(1) + ' V', elw = textWidth(elbl);
  rectMode(CENTER); fill(10, 12, 28, 225 * dim); noStroke();   // chip keeps the label legible over frozen beads (S5 scar)
  rect(bx - 20 - elw / 2, by, elw + 10, 18, 4); rectMode(CORNER);
  fillHex('#FFD54F', 0.98 * dim); text(elbl, bx - 20, by); textStyle(NORMAL);
}
function drawAmmeterAtC(cx, cy, iVal, label, dim, amR) {
  var boxW = amR * 2 + 26, boxH = amR + 42;
  rectMode(CENTER); fill(0, 0, 0, 150 * dim); noStroke(); rect(cx, cy + 4, boxW, boxH, 8); rectMode(CORNER);
  var aLo = -PI * 3 / 4, aHi = -PI / 4;
  strokeHex('#78909C', 0.7 * dim); strokeWeight(2); noFill(); arc(cx, cy, amR * 2, amR * 2, aLo - 0.08, aHi + 0.08);
  for (var tk = 0; tk <= 4; tk++) { var ta = lerp(aLo, aHi, tk / 4); strokeHex('#B0BEC5', 0.6 * dim); strokeWeight(1.5); line(cx + cos(ta) * amR * 0.84, cy + sin(ta) * amR * 0.84, cx + cos(ta) * amR, cy + sin(ta) * amR); }
  noStroke();
  var na = lerp(aLo, aHi, constrain(iVal / 2.6, 0, 1));
  strokeHex('#FF5252', 0.98 * dim); strokeWeight(amR > 20 ? 3 : 2); line(cx, cy, cx + cos(na) * amR * 0.9, cy + sin(na) * amR * 0.9);
  noStroke(); fillHex('#FF5252', 0.98 * dim); ellipse(cx, cy, 5);
  fillHex('#80DEEA', 0.9 * dim); textSize(amR > 20 ? 10 : 9); textStyle(NORMAL); textAlign(CENTER, BOTTOM); text(label, cx, cy - amR - 3);
  fillHex('#FFFFFF', 0.98 * dim); textSize(amR > 20 ? 15 : 12); textStyle(BOLD); textAlign(CENTER, TOP); text('I = ' + iVal.toFixed(2) + ' A', cx, cy + amR * 0.5 + 3);
  textStyle(NORMAL);
}
// Voltmeter across the cell terminals — purple needle (distinct from the red
// ammeter). Reads terminal voltage V; in this ideal-cell scenario V = eps.
function drawVoltmeterC(cx, cy, vVal, eps, dim) {
  var amR = 24, boxW = amR * 2 + 30, boxH = amR + 42;
  rectMode(CENTER); fill(0, 0, 0, 150 * dim); noStroke(); rect(cx, cy + 4, boxW, boxH, 8); rectMode(CORNER);
  var aLo = -PI * 3 / 4, aHi = -PI / 4;
  strokeHex('#78909C', 0.7 * dim); strokeWeight(2); noFill(); arc(cx, cy, amR * 2, amR * 2, aLo - 0.08, aHi + 0.08);
  var na = lerp(aLo, aHi, constrain(vVal / max(eps * 1.15, 1e-6), 0, 1));
  strokeHex('#B39DDB', 0.98 * dim); strokeWeight(3); line(cx, cy, cx + cos(na) * amR * 0.9, cy + sin(na) * amR * 0.9);
  noStroke(); fillHex('#B39DDB', 0.98 * dim); ellipse(cx, cy, 5);
  fillHex('#CE93D8', 0.9 * dim); textSize(10); textAlign(CENTER, BOTTOM); text('VOLTMETER', cx, cy - amR - 3);
  fillHex('#FFFFFF', 0.98 * dim); textSize(15); textStyle(BOLD); textAlign(CENTER, TOP); text('V = ' + vVal.toFixed(2) + ' V', cx, cy + amR * 0.5 + 3);
  textStyle(NORMAL);
}
function drawSwitchC(g, open, topo, dim) {
  var sx = (topo === 'parallel') ? (g.jLx + 30) : ((g.leftX + g.rightX) * 0.5);
  var sy = (topo === 'parallel') ? (g.topY + g.gap) : g.botY;
  var col = open ? '#EF5350' : '#66BB6A';
  fillHex('#ECEFF1', 0.9 * dim); noStroke(); ellipse(sx - 11, sy, 5); ellipse(sx + 11, sy, 5);
  strokeHex(col, 0.98 * dim); strokeWeight(3);
  if (open) line(sx - 11, sy, sx + 7, sy - 15); else line(sx - 11, sy, sx + 11, sy);
  noStroke();
}
function drawCircuitBeads(loops, c) {
  var N = circuitBeadCount(), eDim = dimFor('electrons');
  var col = (config.particles && config.particles.color) ? config.particles.color : '#42A5F5';
  var sz = (config.particles && config.particles.size) ? config.particles.size : 7;
  var Ls = polyLen(loops.series), L1 = polyLen(loops.loop1), L2 = polyLen(loops.loop2);
  noStroke();
  for (var i = 0; i < N; i++) {
    var lp = circuitBeadLoop(i, c);
    var pts = (lp === 'series') ? loops.series : (lp === 'loop1' ? loops.loop1 : loops.loop2);
    var tot = (lp === 'series') ? Ls : (lp === 'loop1' ? L1 : L2);
    var p = polyAt(pts, tot, circuitBeadS(i, c));
    fillHex(col, 0.28 * eDim); ellipse(p.x, p.y, sz * 2.1);
    fillHex(col, 0.95 * eDim); ellipse(p.x, p.y, sz);
  }
}
function drawCircuit() {
  var c = cCurrents(), loops = circuitLoops(), g = loops.g;
  var st = curState();
  var wcol = '#546E7A';
  if (c.topo === 'series') { drawWireC(loops.series, wcol, 0.85, 3); }
  else {
    drawWireC(loops.loop1, wcol, 0.85, 3); drawWireC(loops.loop2, wcol, 0.85, 3);
    var jDim = dimFor('junction');
    fillHex('#4DD0E1', 0.95 * jDim); noStroke(); ellipse(g.jLx, g.topY, 11); ellipse(g.jRx, g.topY, 11);
  }
  drawCircuitBeads(loops, c);
  var rDim = dimFor('resistors');
  if (c.single) {
    drawResistorBoxC((g.leftX + g.rightX) / 2, g.topY, 'R1 = ' + fmtNum(c.R1) + ' \\u03A9', rDim);
  } else if (c.topo === 'series') {
    drawResistorBoxC(g.sR1.x, g.sR1.y, 'R1 = ' + fmtNum(c.R1) + ' \\u03A9', rDim);
    drawResistorBoxC(g.sR2.x, g.sR2.y, 'R2 = ' + fmtNum(c.R2) + ' \\u03A9', rDim);
    if (st && st.show_voltages) {   // S4: V across each = i*R (series → they add to V)
      var vDim = dimFor('volt_probe');
      fillHex('#B39DDB', 0.95 * vDim); textSize(12); textStyle(BOLD); textAlign(CENTER, BOTTOM);
      text('V1 = ' + (c.itot * c.R1).toFixed(1) + ' V', g.sR1.x, g.sR1.y - 20);
      text('V2 = ' + (c.itot * c.R2).toFixed(1) + ' V', g.sR2.x, g.sR2.y - 20);
      textStyle(NORMAL);
    }
  } else {
    drawResistorBoxC(g.pRx, g.topY - g.gap, 'R1 = ' + fmtNum(c.R1) + ' \\u03A9', rDim);
    drawResistorBoxC(g.pRx, g.topY + g.gap, 'R2 = ' + fmtNum(c.R2) + ' \\u03A9', rDim);
  }
  drawBatteryC(g, c.V, 1);
  if (st && (st.switch_cycle || hasSlider('switch'))) drawSwitchC(g, cSwitchOpen(), c.topo, dimFor('switch'));
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.itot, 'AMMETER', dimFor('ammeter_total'), 26);
  if (st && st.show_branch_meters && c.topo === 'parallel') {
    var bDim = dimFor('ammeter_branches');
    drawAmmeterAtC(g.jRx + 46, g.topY - g.gap, c.i1, 'A1', bDim, 17);
    drawAmmeterAtC(g.jRx + 46, g.topY + g.gap, c.i2, 'A2', bDim, 17);
  }
  if (st && st.in_line_meters && c.topo === 'series') {
    var iDim = dimFor('ammeter_branches');
    drawAmmeterAtC(g.leftX + (g.rightX - g.leftX) * 0.18, g.topY - 38, c.itot, 'A1', iDim, 14);
    drawAmmeterAtC(g.leftX + (g.rightX - g.leftX) * 0.49, g.topY - 38, c.itot, 'A2', iDim, 14);
    drawAmmeterAtC(g.leftX + (g.rightX - g.leftX) * 0.80, g.topY - 38, c.itot, 'A3', iDim, 14);
  }
  if (st && st.show_req_box) {
    var qDim = dimFor('req_box'), qx = g.pRx, qy = (c.topo === 'parallel') ? g.topY : g.topY - 44;
    rectMode(CENTER); fillHex('#0A0A1A', 0.88 * qDim); noStroke(); rect(qx, qy, 132, 34, 6);
    strokeHex('#66BB6A', 0.95 * qDim); strokeWeight(2); noFill(); rect(qx, qy, 132, 34, 6); rectMode(CORNER); noStroke();
    fillHex('#66BB6A', 0.98 * qDim); textSize(14); textStyle(BOLD); textAlign(CENTER, CENTER);
    text('R_eq = ' + fmtNum(c.Req) + ' \\u03A9', qx, qy); textStyle(NORMAL);
  }
}
// ═══ emf_definition scenario — charge-pump cell + potential ladder + voltmeter ══
// A single IDEAL-cell loop reusing the combination bead engine. Primitives are
// added incrementally: drawEmfCell (Task 3), drawPotentialLadder (Task 4),
// drawVoltmeterC (Task 5). Beads flow at speed ~ i (0 when the loop is open).
function drawEmfScenario() {
  var c = emfCurrents(), loops = circuitLoops(), g = loops.g, st = curState();
  drawWireC(loops.series, '#546E7A', 0.85, 3);
  drawCircuitBeads(loops, { topo: 'series', single: true, i1: c.i, i2: c.i, itot: c.i, Req: c.R, V: c.eps, R1: c.R, R2: c.R });
  drawResistorBoxC((g.leftX + g.rightX) / 2, g.topY, 'R = ' + fmtNum(c.R) + ' \\u03A9', dimFor('load'));
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.i, 'AMMETER', dimFor('electrons'), 26);
  drawEmfCell(g, c.eps, 1, !!(st && st.pump_focus) || !c.swOpen);   // pump animates while current flows / when focal
  var traceS = null, prof = null;
  if (st && st.trace_charge && !c.swOpen) {              // S2: the followed charge (loop side)
    prof = emfLoopProfile(loops);
    traceS = emfTraceS(c);
    var tp = polyAt(loops.series, prof.L, traceS);
    noStroke(); fillHex('#FFE082', 0.30); ellipse(tp.x, tp.y, 22);   // halo emphasis (Rule 29)
    fillHex('#FFE082', 0.98); ellipse(tp.x, tp.y, 9);
  }
  var holdPulse = 0;
  if (st && st.charge_double) {                          // S3: pulse "still eps" on each q flip (flips every 2s)
    holdPulse = max(0, 1 - ((PM_simTimeMs % 2000) / 800));
  }
  if (st && st.show_ladder) {
    if (traceS !== null && !prof) prof = emfLoopProfile(loops);
    drawPotentialLadder(c.eps, c.i, c.R, c.swOpen, 1, traceS, holdPulse, prof || emfLoopProfile(loops));
  }
  if (st && st.show_voltmeter) {
    var vmDim = dimFor('voltmeter'), vx = g.leftX + 82, vy = g.midY;
    strokeHex('#B39DDB', 0.7 * vmDim); strokeWeight(1.5);            // leads tapping the two terminals
    line(g.leftX, g.midY - 16, vx, vy - 14); line(g.leftX, g.midY + 16, vx, vy + 14);
    noStroke();
    drawVoltmeterC(vx, vy, c.Vterm, c.eps, vmDim);
  }
  // S3 intensive-invariance beat: 1 charge, then 2 — total work W = n*eps doubles,
  // but the per-charge lift W/q = eps is UNCHANGED (emf is energy per charge, not a force).
  if (st && st.charge_double) {
    var nq = ((PM_simTimeMs / 1000) % 4 < 2) ? 1 : 2;
    for (var qi = 0; qi < nq; qi++) {
      var qy = lerp(g.midY + 14, g.midY - 14, (PM_simTimeMs / 1100) % 1);
      fillHex('#FFE082', 0.95); noStroke(); ellipse(g.leftX + 16 + qi * 12, qy, 9);
    }
    var bx = width * 0.28, by = height * 0.82;
    fillHex('#CFD8DC', 0.95); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER);
    text('charges q = ' + nq + '    \\u2192    work W = ' + (nq * c.eps).toFixed(1) + ' J', bx, by);
    fillHex('#4DD0E1', 0.98);
    text('W / q = \\u03B5 = ' + c.eps.toFixed(1) + ' V   (per charge \\u2014 unchanged)', bx, by + 20);
    textStyle(NORMAL);
  }
}

// ═══ internal_resistance scenario — the emf loop with the hidden r revealed ═══
// Diamond 2: same cell/ladder/voltmeter as emf_definition, plus the internal r.
// The switch is drawn at 0.78 of the bottom edge (drawSwitchC's series position
// collides with the main ammeter at the bottom midpoint).
function drawIrSwitch(g, open, dim) {
  var sx = g.leftX + (g.rightX - g.leftX) * 0.78, sy = g.botY;
  var col = open ? '#EF5350' : '#66BB6A';
  fillHex('#ECEFF1', 0.9 * dim); noStroke(); ellipse(sx - 11, sy, 5); ellipse(sx + 11, sy, 5);
  strokeHex(col, 0.98 * dim); strokeWeight(3);
  if (open) line(sx - 11, sy, sx + 7, sy - 15); else line(sx - 11, sy, sx + 11, sy);
  noStroke();
}
// The external charger — an ideal second source on the RIGHT edge of the loop,
// strong enough (3.0 V > eps) to force current BACKWARDS through the cell (S6).
function drawChargerC(g, epsCh, dim) {
  var cx = g.rightX, cy = g.midY;
  fill(10, 12, 28, 235); noStroke(); rectMode(CENTER); rect(cx, cy, 26, 44, 4); rectMode(CORNER);
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(cx, cy - 16, cx, cy + 16);   // long (+) plate
  strokeWeight(6); line(cx + 9, cy - 8, cx + 9, cy + 8);                                // short (-) plate
  noStroke(); fillHex('#66BB6A', 0.95 * dim); textSize(11); textStyle(BOLD); textAlign(RIGHT, CENTER);
  text('charger ' + epsCh.toFixed(1) + ' V', cx - 16, cy); textStyle(NORMAL);
}
function drawIrScenario() {
  var c = irCurrents(), loops = circuitLoops(), g = loops.g, st = curState();
  drawWireC(loops.series, '#546E7A', 0.85, 3);
  drawCircuitBeads(loops, { topo: 'series', single: true, i1: c.i, i2: c.i, itot: c.i,
                            Req: c.R, V: c.eps, R1: c.R, R2: c.R,
                            dir: (c.mode === 'charging') ? -1 : 1 });
  // R label matches the slider row's 2-decimal precision (never a coarser toFixed(1) —
  // at the S3 sweep end the loop must read the same 0.25 the panel shows).
  var rl = (abs(c.R - round(c.R)) < 0.005) ? String(round(c.R)) : String(round(c.R * 100) / 100);
  drawResistorBoxC((g.leftX + g.rightX) / 2, g.topY, 'R = ' + rl + ' \\u03A9', dimFor('load'));
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.i, 'AMMETER', dimFor('electrons'), 26);
  var rr = null;
  if (st && (st.show_r || st.r_reveal)) {
    var rev = (st && st.r_reveal) ? constrain((PM_simTimeMs - 700) / 900, 0, 1) : 1;
    rr = { r: c.r, i: c.i, reveal: rev, heat: constrain((c.i * c.i * c.r) / 4.5, 0, 1) };
  }
  drawEmfCell(g, c.eps, 1, !c.swOpen, rr);
  if (st && st.charging) drawChargerC(g, c.epsCh, dimFor('charger'));
  else drawIrSwitch(g, c.swOpen, dimFor('switch'));
  if (st && st.show_voltmeter) {
    var vmDim = dimFor('voltmeter'), vx = g.leftX + 82, vy = g.midY;
    strokeHex('#B39DDB', 0.7 * vmDim); strokeWeight(1.5);            // leads tapping the two terminals
    line(g.leftX, g.midY - 16, vx, vy - 14); line(g.leftX, g.midY + 16, vx, vy + 14);
    noStroke();
    drawVoltmeterC(vx, vy, c.Vterm, max(c.eps * 1.5, c.Vterm), vmDim);   // 1.5x headroom: charging V > eps must not peg
  }
  if (st && st.show_ladder) {
    drawPotentialLadder(c.eps, c.i, c.R, c.swOpen, 1, null, 0, null,
      { mode: c.mode, r: c.r, epsCh: c.epsCh || 0, V: c.Vterm,
        mystery: !(st.show_r || st.r_reveal) });   // S1: gap shown, not explained
  }
  // S5 two-reading measurement — ONE-shot sequence (open-hold -> cued close -> the
  // computed r line), never a cycle. Reading 1 shows eps because irSwitchOpen()
  // holds the loop open until 2500ms in this state.
  if (st && st.two_reading) {
    var bx3 = width * 0.28, by3 = height * 0.84;
    fillHex('#CFD8DC', 0.95); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER);
    if (PM_simTimeMs < 2500 && !userTouched['switch']) {
      text('reading 1 \\u2014 open:   V = \\u03B5 = ' + c.eps.toFixed(2) + ' V', bx3, by3);
    } else {
      text('reading 2 \\u2014 closed:   V = ' + c.Vterm.toFixed(2) + ' V   at   i = ' + c.i.toFixed(2) + ' A', bx3, by3);
      if (PM_simTimeMs >= 3600 && c.i > 0.02) {
        fillHex('#FF8A65', 0.98);
        text('r = (\\u03B5 \\u2212 V) / i = (' + c.eps.toFixed(2) + ' \\u2212 ' + c.Vterm.toFixed(2) + ') / ' + c.i.toFixed(2) + ' = ' + ((c.eps - c.Vterm) / max(c.i, 1e-6)).toFixed(1) + ' \\u03A9', bx3, by3 + 22);
      }
    }
    textStyle(NORMAL);
  }
}

// ═══ electric_power scenario — bulbs (brightness = power) on the circuit loop ═══
// M1 (single_bulb/three_faces/energy_accumulate): ONE 6 W bulb on the series loop.
// M2 series_pair: two rated bulbs at g.sR1/g.sR2 in series (same current).
// M2 parallel_flip: same two bulbs on the parallel branches (same voltage).
function drawPowerScenario() {
  var c = cCurrents(), pw = cBulbPowers(), loops = circuitLoops(), g = loops.g, st = curState();
  var wcol = '#546E7A';
  if (pw.topo === 'parallel') {
    drawWireC(loops.loop1, wcol, 0.85, 3); drawWireC(loops.loop2, wcol, 0.85, 3);
  } else {
    drawWireC(loops.series, wcol, 0.85, 3);
  }
  drawCircuitBeads(loops, c);
  drawBatteryC(g, c.V, 1);
  var d1 = dimFor('bulb1'), d2 = dimFor('bulb2');   // glow focal = the brighter bulb (single-focal, Rule 32e)
  if (pw.single) {
    drawBulbC((g.leftX + g.rightX) / 2, g.topY, '6 W', c.R1, pw.P1, pw.Pmax, d1);
  } else if (pw.topo === 'series') {
    drawBulbC(g.sR1.x, g.sR1.y, '6 W', c.R1, pw.P1, pw.Pmax, d1);
    drawBulbC(g.sR2.x, g.sR2.y, '3 W', c.R2, pw.P2, pw.Pmax, d2);
  } else {
    drawBulbC(g.pRx, g.topY - g.gap, '6 W', c.R1, pw.P1, pw.Pmax, d1);
    drawBulbC(g.pRx, g.topY + g.gap, '3 W', c.R2, pw.P2, pw.Pmax, d2);
  }
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.itot, 'AMMETER', dimFor('electrons'), 26);
  if (st && st.energy_accumulate) {                 // S3: power is a RATE; energy piles up
    fillHex('#FF8A65', 0.98); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER);
    text('energy = P \\u00B7 t = ' + powerEnergyJ.toFixed(0) + ' J', width * 0.28, height * 0.84);
    textStyle(NORMAL);
  }
}

function stepCircuit(state) {
  PM_simTimeMs += 1000 / 60; window.PM_simTimeMs = PM_simTimeMs;
  if (state && state.energy_accumulate) {                 // electric_power S3: P*dt piles up
    powerEnergyJ += cBulbPowers().Ptot * (1000 / 60) / 1000;
  }
  var cues = getCues(state);
  for (var ci = 0; ci < cues.length; ci++) {
    var cc = cues[ci];
    if (cueFiredAt[cc.id] === undefined && PM_simTimeMs >= cueTriggerMs(cc)) cueFiredAt[cc.id] = PM_simTimeMs;
  }
}

// ─── Draw loop (render only — physics advanced separately) ──────────────────
function draw() {
  if (!config) return;
  var state = curState();
  if (!state) return;

  if (isCircuitFamily()) {
    if (!frozen && !paused) stepCircuit(state);
    var cbg = (config.canvas && config.canvas.bg_color) ? config.canvas.bg_color
      : (config.design && config.design.background) ? config.design.background : '#0A0A1A';
    background(cbg);
    if (emfMode()) drawEmfScenario(); else if (irMode()) drawIrScenario(); else if (powerMode()) drawPowerScenario(); else drawCircuit();
    if (isCircuitFamily()) updateReadouts();      // live derived readout (combination R_eq/i ; emf eps/V/i)
    // (no drawLabel here — the state label duplicated the bottom-right formula_overlay)
    var frmC = document.getElementById('pm-formula');
    if (frmC) frmC.style.opacity = max(dimFor('formula'), 0.6);   // keep the equation readable even when not the focal
    return;
  }

  if (!frozen && !paused) stepPhysics(state);

  var intensity = getCurrentIntensity();

  var bgColor = (config.canvas && config.canvas.bg_color) ? config.canvas.bg_color
    : (config.design && config.design.background) ? config.design.background
    : (config.pvl_colors && config.pvl_colors.background) ? config.pvl_colors.background
    : '#0A0A1A';
  background(bgColor);

  if (intensity > 0) {
    noStroke();
    var heatR = floor(lerp(60, 255, intensity));
    var heatG = floor(lerp(20, 140, intensity));
    var heatB = floor(lerp(0, 40, intensity));
    fill(heatR, heatG, heatB, lerp(0, 0.12, intensity) * 255);
    rect(0, 0, width, height);
  }

  // Micro band: built into microH(), drawn under one translate (offset=0 when macro_view off)
  push();
  translate(0, microTop());
  drawLattice(intensity);
  if (state.field_visible && curFieldAlpha > 0) drawFieldArrows();
  if (hasCollisionGlow() || microFocus() === 'trace_one') drawCollisionFlashes();
  drawParticles(state);
  if (mvOn()) drawMicroHUD(state);
  pop();
  // Macro band (top): the physical rod whose length/thickness/tint/heat IS the taught cause
  if (mvOn()) drawMacroBand(state, intensity);
  if (state.show_drift_arrow && curEffDrift > 0) drawDriftArrow(state);   // global-bottom, inside micro band
  if (state.show_current_meter && !mvOn()) drawCurrentMeter();  // macro_view: the macro-band ammeter is the single current instrument
  if (state.show_flux_conservation) drawFluxConservation(state);
  if (state.show_vi_graph) { drawVIGraph(state); updateReadouts(); }  // readout tracks the live sweep
  if (state.show_thermometer && hasSlider('T')) drawThermometer();
  if (hasSlider('L') || hasSlider('material')) updateReadouts();     // resistivity: readout tracks live L/A/material/T
  if (hasPowerMeter() && intensity > 0) drawPowerMeter(intensity);
  if (hasHeatCounter() && heatAccumulator > 0) drawHeatCounter();
  drawLabel(state);

  // Formula overlay + R/rho readout brightness follow the glow focal
  var frm = document.getElementById('pm-formula');
  if (frm) frm.style.opacity = dimFor('formula');
  var roR = document.getElementById('pm-ro-r');
  if (roR) roR.style.opacity = dimFor('r_readout');
  var roRho = document.getElementById('pm-ro-rho');
  if (roRho) roRho.style.opacity = dimFor('rho_readout');

  if (borderFlashAlpha > 0) {
    noFill();
    strokeHex('#3B82F6', borderFlashAlpha * 0.6);
    strokeWeight(3);
    rect(1, 1, width - 2, height - 2, 4);
    noStroke();
    borderFlashAlpha -= 0.025;
  }
}

// ─── Clock-derived pulse (deterministic while frozen) ───────────────────────
function clockPulse(speed, lo, hi) {
  var s = sin(PM_simTimeMs * 0.001 * speed * TWO_PI);
  return lo + (hi - lo) * (s * 0.5 + 0.5);
}

// ─── Lattice rendering ──────────────────────────────────────────────────────
function latticeColor() {
  return hasSlider('material') ? currentMaterial().tint : config.lattice.color;
}
function drawLattice(intensity) {
  var dimMul = dimFor('lattice');
  var latColor = latticeColor();
  // resistivity: the lattice shivers with TEMPERATURE, not just current (32b —
  // the taught variable's own motion; distinct from the current-driven glow).
  var thermJitter = hasSlider('T') ? constrain(map(curTemperature(), T0Ref(), 220, 0, 3.0), 0, 3.0) : 0;
  noStroke();
  for (var i = 0; i < latticeIons.length; i++) {
    var ion = latticeIons[i];
    var vibAmp = (frozen || paused) ? 0 : (intensity * 2.5 + thermJitter);
    var vibX = ion.x + (vibAmp > 0 ? random(-vibAmp, vibAmp) : 0);
    var vibY = ion.y + (vibAmp > 0 ? random(-vibAmp, vibAmp) : 0);

    if (config.lattice.glow || intensity > 0.1) {
      var glowStrength = max(intensity, config.lattice.glow ? 0.3 : 0);
      if (intensity > 0.1) {
        fill(255, 140, 0, glowStrength * 0.08 * 255 * dimMul);
        ellipse(vibX, vibY, config.lattice.size * 4.0);
      }
      fillHex(latColor, 0.06 * (1 + glowStrength) * dimMul);
      ellipse(vibX, vibY, config.lattice.size * 3.5);
      fillHex(latColor, 0.12 * (1 + glowStrength) * dimMul);
      ellipse(vibX, vibY, config.lattice.size * 2.2);
    }

    if (intensity > 0.3) {
      var ionR = floor(lerp(144, 255, intensity));
      var ionG = floor(lerp(164, 180, intensity));
      var ionB = floor(lerp(174, 100, intensity));
      fill(ionR, ionG, ionB, 0.6 * 255 * dimMul);
    } else {
      fillHex(latColor, 0.5 * dimMul);
    }
    ellipse(vibX, vibY, config.lattice.size);

    strokeHex(latColor, 0.7 * dimMul);
    strokeWeight(1);
    var s = config.lattice.size * 0.25;
    line(vibX - s, vibY, vibX + s, vibY);
    line(vibX, vibY - s, vibX, vibY + s);
    noStroke();
  }
}

// ─── Macro band (Rule 33 — the physical rod: length=L, thickness=A, tint=material, heat=T) ──
function drawDashedLine(x1, y1, x2, y2, hex, a) {
  var d = dist(x1, y1, x2, y2);
  var steps = max(2, floor(d / 10));
  strokeHex(hex, a); strokeWeight(1.5);
  for (var i = 0; i < steps; i += 2) {
    var t1 = i / steps, t2 = min((i + 1) / steps, 1);
    line(lerp(x1, x2, t1), lerp(y1, y2, t1), lerp(x1, x2, t2), lerp(y1, y2, t2));
  }
  noStroke();
}
function drawMacroBand(state, intensity) {
  var bandH = macroBandH();
  var cy = bandH * 0.52;
  var rodDim = dimFor('macro_rod');
  var amDim = dimFor('ammeter');

  var Ldefs = (sliderDefs() && sliderDefs().L) ? sliderDefs().L : { min: 0.5, max: 2 };
  var Adefs = (sliderDefs() && sliderDefs().A) ? sliderDefs().A : { min: 0.5, max: 5 };
  var Lnow = curL(), Anow = curA();

  // Reserve the top-right slider-panel footprint so the ammeter clears it on tall
  // multi-slider states. pm-panel is width:238 + padding:12 + border:1 each side +
  // right:10 = its LEFT edge sits ~274px from the right; the ammeter box (half-width
  // ~45) + a margin must all stay left of that (scar:
  // macro_panel_overlaps_ammeter_on_multi_slider_states — reopened: 238 underestimated
  // the padded width; the panel also spans the FULL band height, so X-clearance is the
  // only fix).
  var panelReserve = 300;
  var battX = 54, amX = width - panelReserve - 40;
  var railL = battX + 26, railR = amX - 34;
  var maxRod = railR - railL;
  var rodLen = constrain(map(Lnow, Ldefs.min, Ldefs.max, maxRod * 0.42, maxRod), 24, maxRod);
  // Thickness proportional to A (relative to default) so a 2x area reads as a
  // visible 2x thickness (scar: macro_rod_thickness_not_legible_in_narrow_range).
  var Adef = sliderDefault('A');
  var rodTh = constrain(14 * (Anow / max(Adef, 1e-6)), 7, bandH * 0.5);
  var rodL = railL, rodR = railL + rodLen;

  var tint = hasSlider('material') ? currentMaterial().tint : '#CE7B4B';
  var Tmax = (sliderDefs() && sliderDefs().T && sliderDefs().T.max) ? sliderDefs().T.max : 220;
  var Tfrac = hasSlider('T') ? constrain((curTemperature() - T0Ref()) / max(Tmax - T0Ref(), 1e-6), 0, 1) : 0;
  var heatWob = (frozen || paused) ? 0 : Tfrac * 0.8 * sin(PM_simTimeMs * 0.02);

  // wires
  strokeHex('#B0BEC5', 0.75 * rodDim); strokeWeight(3);
  line(battX + 12, cy, rodL, cy);
  line(rodR, cy, amX - 16, cy);
  noStroke();

  // heat halo behind the rod
  if (Tfrac > 0.02) {
    fill(255, floor(lerp(150, 60, Tfrac)), 40, Tfrac * 0.28 * 255 * rodDim);
    rect(rodL - 4, cy - rodTh / 2 - 6 + heatWob, rodLen + 8, rodTh + 12, rodTh);
  }
  // rod body (length=L, thickness=A, fill=material tint)
  fillHex(tint, 0.92 * rodDim);
  rect(rodL, cy - rodTh / 2 + heatWob, rodLen, rodTh, rodTh / 2);
  fillHex('#FFFFFF', 0.10 * rodDim);   // cylinder top highlight
  rect(rodL, cy - rodTh / 2 + heatWob, rodLen, rodTh * 0.34, rodTh / 2);

  // battery (left): long +, short -
  strokeHex('#ECEFF1', 0.85 * rodDim); strokeWeight(2);
  line(battX, cy - 12, battX, cy + 12);
  strokeWeight(4);
  line(battX + 12, cy - 7, battX + 12, cy + 7);
  noStroke();

  // ammeter (series, right terminal) — a teacher-visible gauge with tick marks,
  // a needle that tracks the live current, AND the numeric reading (Rule 33d).
  var amR = min(bandH * 0.42, 30);
  var amPY = cy + amR * 0.45;                 // needle pivot (dial fills the upper half)
  var boxW = amR * 2 + 30, boxH = amR + 46;
  var boxX = amX - boxW / 2, boxY = amPY - amR - 14;
  fill(0, 0, 0, 150 * amDim);
  rect(boxX, boxY, boxW, boxH, 8);
  var aLo = -PI * 3 / 4, aHi = -PI / 4;        // sweep: up-left (0 A) → up-right (max)
  strokeHex('#78909C', 0.7 * amDim); strokeWeight(2); noFill();
  arc(amX, amPY, amR * 2, amR * 2, aLo - 0.08, aHi + 0.08);
  for (var tk = 0; tk <= 4; tk++) {            // tick marks
    var ta = lerp(aLo, aHi, tk / 4);
    strokeHex('#B0BEC5', 0.6 * amDim); strokeWeight(1.5);
    line(amX + cos(ta) * amR * 0.84, amPY + sin(ta) * amR * 0.84,
         amX + cos(ta) * amR, amPY + sin(ta) * amR);
  }
  noStroke();
  var iNow = realCurrent() * curDriftFactor, iMax = 2.6;
  var needleA = lerp(aLo, aHi, constrain(iNow / iMax, 0, 1));
  strokeHex('#FF5252', 0.98 * amDim); strokeWeight(3);
  line(amX, amPY, amX + cos(needleA) * amR * 0.9, amPY + sin(needleA) * amR * 0.9);
  noStroke();
  fillHex('#FF5252', 0.98 * amDim); ellipse(amX, amPY, 6);
  fillHex('#80DEEA', 0.9 * amDim);             // instrument label
  textSize(10); textStyle(NORMAL); textAlign(CENTER, TOP);
  text('AMMETER', amX, boxY + 4);
  fillHex('#FFFFFF', 0.98 * amDim);            // the live numeric reading
  textSize(17); textStyle(BOLD); textAlign(CENTER, TOP);
  text('I = ' + (iNow >= 0.01 ? iNow.toFixed(2) : iNow.toExponential(1)) + ' A', amX, amPY + 5);
  textStyle(NORMAL);

  // zoom-lens link: circle on the rod, dashed guides down to the micro band
  var lensX = rodL + rodLen * 0.5, lensR = min(rodTh * 0.9, 12);
  strokeHex('#4DD0E1', 0.55 * rodDim); strokeWeight(1.5); noFill();
  ellipse(lensX, cy, lensR * 2);
  var mtop = microTop();
  drawDashedLine(lensX - lensR, cy + lensR, 40, mtop, '#4DD0E1', 0.30 * rodDim);
  drawDashedLine(lensX + lensR, cy + lensR, width - 40, mtop, '#4DD0E1', 0.30 * rodDim);

  // length callout (label only — Rule 24)
  fillHex('#B0BEC5', 0.85 * rodDim);
  textSize(11); textStyle(BOLD); textAlign(CENTER, BOTTOM);
  text('L = ' + Lnow.toFixed(2) + ' m', lensX, cy - rodTh / 2 - 8 + heatWob);
  textStyle(NORMAL);

  // material name on-canvas (top-left of band) — every material state names its
  // metal even when set at entry, e.g. S6 manganin (scar:
  // macro_material_name_unlabelled_on_screen).
  if (hasSlider('material')) {
    fillHex(tint, 0.95 * rodDim);
    textSize(13); textStyle(BOLD); textAlign(LEFT, TOP);
    text(currentMaterial().label, battX - 4, 10);
    textStyle(NORMAL);
  }
}

// ─── Thermometer readout (resistivity S5/S6 — the T cue made visible) ──────
function drawThermometer() {
  var dimMul = dimFor('thermometer');
  // Bottom-LEFT, clear of the bottom-right formula_overlay DOM caption
  // (scar: thermometer_label_overlaps_formula_overlay_caption).
  var tx = 50, ty = height - 150, tw = 14, th = 110;
  var T = curTemperature();
  var Tmin = T0Ref();
  var Tmax = (sliderDefs().T && sliderDefs().T.max) ? sliderDefs().T.max : 220;
  var frac = constrain((T - Tmin) / max(Tmax - Tmin, 1e-6), 0, 1);

  noStroke();
  fill(0, 0, 0, 180 * dimMul);
  rect(tx - 10, ty - 8, tw + 20, th + 36, 6);

  strokeHex('#CFD8DC', 0.8 * dimMul); strokeWeight(1.5); noFill();
  rect(tx, ty, tw, th, tw / 2);
  noStroke();
  var fillH = th * frac;
  var r = floor(lerp(90, 255, frac)), g = floor(lerp(160, 60, frac)), b = floor(lerp(255, 40, frac));
  fill(r, g, b, 0.9 * 255 * dimMul);
  rect(tx, ty + th - fillH, tw, fillH, tw / 2);

  fillHex('#FFFFFF', 0.9 * dimMul);
  textSize(11); textStyle(BOLD); textAlign(CENTER, TOP);
  text(round(T) + '\\u00B0C', tx + tw / 2, ty + th + 6);
  textStyle(NORMAL);
}

// ─── Collision flash system ─────────────────────────────────────────────────
function spawnCollisionFlash(x, y, intensity) {
  collisionFlashes.push({
    x: x, y: y,
    alpha: 0.6 + intensity * 0.4,
    radius: 8 + intensity * 16,
    age: 0
  });
}

function drawCollisionFlashes() {
  noStroke();
  for (var i = 0; i < collisionFlashes.length; i++) {
    var f = collisionFlashes[i];
    var fadeProgress = f.age / 20;
    if (fadeProgress >= 1) continue;
    var currentAlpha = f.alpha * (1 - fadeProgress);
    var currentRadius = f.radius * (0.5 + fadeProgress * 0.5);

    fill(255, 200, 0, currentAlpha * 0.15 * 255);
    ellipse(f.x, f.y, currentRadius * 3);
    fill(255, 165, 0, currentAlpha * 0.35 * 255);
    ellipse(f.x, f.y, currentRadius * 1.8);
    fill(255, 255, 200, currentAlpha * 0.7 * 255);
    ellipse(f.x, f.y, currentRadius * 0.6);

    strokeWeight(1.5);
    stroke(255, 220, 50, currentAlpha * 0.5 * 255);
    var rayLen = currentRadius * 1.2;
    for (var r = 0; r < 4; r++) {
      var angle = r * PI / 4 + PI / 8;
      line(f.x, f.y, f.x + cos(angle) * rayLen, f.y + sin(angle) * rayLen);
    }
    noStroke();
  }
}

// ─── Field arrows rendering ─────────────────────────────────────────────────
function drawFieldArrows() {
  var pulse = clockPulse(0.95, 0.4, 0.9);
  var dimMul = dimFor('field') * curFieldAlpha;
  var dir = config.field_arrows.direction === 'left_to_right' ? 1 : -1;
  var arrowLen = 50;
  var headSize = 9;

  strokeHex(config.field_arrows.color, 0.6 * pulse * dimMul);
  strokeWeight(2.5);
  noFill();

  for (var i = 0; i < fieldArrows.length; i++) {
    var a = fieldArrows[i];
    var sx = a.x - dir * arrowLen * 0.5;
    var ex = a.x + dir * arrowLen * 0.5;
    line(sx, a.y, ex, a.y);
    line(ex, a.y, ex - dir * headSize, a.y - headSize * 0.5);
    line(ex, a.y, ex - dir * headSize, a.y + headSize * 0.5);
  }

  // E label rides the middle arrow (top-right corner is the slider panel's)
  var mid = fieldArrows[floor(fieldArrows.length / 2)];
  if (mid) {
    noStroke();
    fillHex(config.field_arrows.color, 0.85 * pulse * dimMul);
    textSize(13);
    textStyle(BOLD);
    textAlign(CENTER, BOTTOM);
    text('E \\u2192', mid.x, mid.y - 10);
    textStyle(NORMAL);
  }
}

// ─── Particle rendering ─────────────────────────────────────────────────────
function drawParticles(state) {
  var dimMul = dimFor('electrons');
  var focus = microFocus();
  var activeK = (focus === 'count_carriers') ? carriersForArea() : particles.length;
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    var isHighlighted = isFeaturedIdx(i);
    // trace_one fades every non-traced electron hard so the one story-carrier reads.
    // count_carriers: the active (i<activeK) carriers are BRIGHT (the counted flow),
    // the rest stay a dim BUT STILL-DRIFTING sea — more area lights up more of them.
    var traceFade = focus === 'trace_one' && !isHighlighted;
    // count_carriers: every carrier stays at normal brightness (motion never dies);
    // the ACTIVE subset (grows with area) is boosted bright + larger — "more lanes lit".
    var carrierActive = focus === 'count_carriers' && i < activeK;

    var opacity = dimMul;
    if (isHighlighted) opacity = 1;   // traced electron = persistent bright anchor (Rule 29 brightenOnly, like the 3D hand)
    else if (carrierActive) opacity = 1;
    else if (traceFade) opacity = 0.12 * dimMul;
    else if (state.dim_others) opacity = (state.dim_opacity !== undefined ? state.dim_opacity : 0.25) * dimMul;

    var trailColor = isHighlighted ? '#FFFFFF' : config.particles.color;
    noFill();
    for (var j = 1; j < p.trail.length; j++) {
      var alpha = (j / p.trail.length) * opacity * 0.35;
      strokeHex(trailColor, alpha);
      strokeWeight(isHighlighted ? 2 : 1);
      line(p.trail[j-1].x, p.trail[j-1].y, p.trail[j].x, p.trail[j].y);
    }
    noStroke();

    var pColor = isHighlighted ? '#FFFFFF' : config.particles.color;
    var pSize = isHighlighted ? config.particles.size * 1.8
      : (carrierActive ? config.particles.size * 1.35 : config.particles.size);

    if (carrierActive) {   // a soft ring marks each active (counted, flowing) carrier
      fillHex(config.particles.color, 0.18);
      ellipse(p.x, p.y, pSize * 2.2);
    }
    if (isHighlighted) {
      fillHex(pColor, 0.08);
      ellipse(p.x, p.y, pSize * 4);
      fillHex(pColor, 0.15);
      ellipse(p.x, p.y, pSize * 2.8);
      fillHex(pColor, 0.3);
      ellipse(p.x, p.y, pSize * 1.8);
    }

    fillHex(pColor, opacity);
    ellipse(p.x, p.y, pSize);
  }
}

// ─── Micro-band HUD (Rule 33c — the interior story as a real number) ────────
function drawMicroHUD(state) {
  var focus = microFocus();
  if (!focus) return;
  var hx = 12, hy = 12, hw = 184, hh = 46;
  noStroke(); fill(0, 0, 0, 168);
  rect(hx, hy, hw, hh, 6);
  textAlign(LEFT, TOP);
  if (focus === 'trace_one') {
    var c = (particles[0] && particles[0].collisions) ? particles[0].collisions : 0;
    fillHex('#FFFFFF', 0.9); textSize(11); textStyle(NORMAL);
    text('One electron traced \\u2192', hx + 8, hy + 6);
    fillHex('#FFD54F', 0.95); textSize(15); textStyle(BOLD);
    text('collisions: ' + c, hx + 8, hy + 22);
  } else if (focus === 'count_carriers') {
    fillHex('#FFFFFF', 0.9); textSize(11); textStyle(NORMAL);
    text('More area \\u2192 more lanes', hx + 8, hy + 6);
    fillHex('#FFD54F', 0.95); textSize(15); textStyle(BOLD);
    text('carriers flowing: ' + carriersForArea(), hx + 8, hy + 22);
  }
  textStyle(NORMAL);
}

// ─── Drift arrow overlay (v_d — the tiny net motion made visible) ───────────
function drawDriftArrow(state) {
  var dimMul = dimFor('drift_arrow');
  var dir = state.drift_direction === 'left' ? -1 : 1;
  var cx = width * 0.5;
  var cy = height - 64;
  var len = 70 + curEffDrift * 30;
  var sx = cx - dir * len * 0.5;
  var ex = cx + dir * len * 0.5;

  strokeHex('#4DD0E1', 0.9 * dimMul);
  strokeWeight(3.5);
  line(sx, cy, ex, cy);
  line(ex, cy, ex - dir * 11, cy - 6);
  line(ex, cy, ex - dir * 11, cy + 6);
  noStroke();
  fillHex('#4DD0E1', 0.9 * dimMul);
  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text('v_d (drift)', cx, cy + 8);
  textStyle(NORMAL);
}

// ─── Current meter (i = neAv_d) ─────────────────────────────────────────────
function drawCurrentMeter() {
  var dimMul = dimFor('current_meter');
  var mx = 10, my = 10, mw = 158, mh = 52;

  noStroke();
  fill(0, 0, 0, 180 * dimMul);
  rect(mx, my, mw, mh, 6);

  fillHex('#80DEEA', dimMul);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(hasSlider('V') ? 'i = V/R' : 'i = n e A v_d', mx + 8, my + 6);

  fill(255, 255, 255, 230 * dimMul);
  textSize(16);
  // climbs with the drift ramp during a field_on cue (0 → settled); = realCurrent
  // in steady states (curDriftFactor is 1 when no cue gates the drift).
  var iVal = realCurrent() * curDriftFactor;
  text((iVal >= 0.01 ? iVal.toFixed(2) : iVal.toExponential(1)) + ' A', mx + 8, my + 26);
  textStyle(NORMAL);
}

// ─── V–I graph panel (ohms_law — the LAW made visible) ──────────────────────
// i as a function of a sample voltage, consistent with realCurrent() at v=plotV.
function ohmicCurrentAt(v, R) {
  var e = physConst('e', 1.6e-19), n = physConst('n', 8.5e28), m = physConst('m_e', 9.11e-31);
  return n * e * condAreaM2() * (e * (v / condLength()) * tauFromR(max(R, 1e-9)) / m);
}
function currentAtV(v) {
  var R = plotR();
  var st = curState();
  if (st && st.ohmic === false) {
    var vmax = (sliderDefs().V && sliderDefs().V.max) ? sliderDefs().V.max : 1;
    R = R * (1 + physConst('filament_k', 1.4) * (v / max(vmax, 1e-9)));
  }
  return ohmicCurrentAt(v, R);
}
// ── S2 trace-sync: one followed charge on the loop + a coordinated energy-dot on
// the ladder. Both are driven by the SAME loop-fraction s (pure fn of PM_simTimeMs),
// so they cannot desync. The potential profile v(s) mirrors the drawn staircase:
// rise inside the cell, flat at eps along the wire, linear drop across the load,
// flat at 0 on the return. Rule 29: the tracer is a colour+halo emphasis, same size.
var EMF_TRACE_PHASE = 0.93;   // starts just BEFORE the cell so the step-up lands early
function emfLoopProfile(loops) {
  var g = loops.g, L = polyLen(loops.series);
  var up = g.midY - g.topY;                                  // battery → top-left corner
  var resC = up + (g.rightX - g.leftX) / 2;                  // arc length to resistor centre
  return { L: L, sc: 30 / L, s1: (resC - 33) / L, s2: (resC + 33) / L };
}
function emfTraceS(c) {
  var spd = (c.i < 0.02) ? 0 : constrain(c.i / 1.0, 0.28, 3.0);
  return (EMF_TRACE_PHASE + CIRCUIT_BEAD_RATE * (PM_simTimeMs / 1000) * spd) % 1;
}
function emfTraceV(s, p, eps) {                              // potential of the followed charge
  if (s < p.sc) return eps * (s / p.sc);                     // climbing inside the cell
  if (s < p.s1) return eps;                                  // wire: holds the full lift
  if (s < p.s2) return eps * (1 - (s - p.s1) / (p.s2 - p.s1)); // spending it across the load
  return 0;                                                  // return path back to the - terminal
}

// POTENTIAL LADDER — the money primitive for emf. Right-side inset: potential vs
// position around the loop. Step UP by eps at the cell (the lift), flat along the
// wire, step DOWN by eps across the load. When the loop is open (no current) the
// potential stays flat at eps the whole way — the voltmeter reads the full emf.
// traceS (nullable): the followed charge's loop fraction — draws the synced energy
// dot. holdPulse (0..1): S3's "still 1.5 J/C" step-label emphasis on each q flip.
// Optional 9th arg ir = { mode, r, epsCh, V } (internal_resistance): discharge mode
// draws the INTERNAL i*r step inside the cell band (terminal height = V = eps - i*r);
// charging mode draws charger-riser -> i*R drop -> cell band (eps stored + i*r heat),
// terminal-to-terminal = V = eps + i*r. ir absent -> pixel-identical emf_definition
// profile (locked baselines).
function drawPotentialLadder(eps, i, R, swOpen, dim, traceS, holdPulse, prof, ir) {
  var x0 = width * 0.74, y0 = (ir ? height * 0.39 : height * 0.30), w = width * 0.225, h = height * 0.42;   // ir: clear the 4-row slider panel + readout (Rule 34d)
  rectMode(CORNER); fill(10, 12, 28, 210 * dim); noStroke(); rect(x0, y0, w, h, 6);
  strokeHex('#37474F', 0.8 * dim); strokeWeight(1); noFill(); rect(x0, y0, w, h, 6);
  var padL = 30, padB = 20, gx = x0 + padL, gy = y0 + h - padB, gw = w - padL - 12, gh = h - padB - 20;
  var vmax = (ir && ir.mode === 'charging') ? ir.epsCh * 1.15 : eps * 1.2;
  function py(v) { return gy - gh * constrain(v / vmax, 0, 1); }
  strokeHex('#78909C', 0.7 * dim); strokeWeight(1.5); line(gx, gy, gx, gy - gh); line(gx, gy, gx + gw, gy);
  strokeHex('#66BB6A', 0.35 * dim); strokeWeight(1); line(gx, py(eps), gx + gw, py(eps));   // eps reference
  var xa = gx, xc = gx + gw * 0.50, xd = gx + gw * 0.70, xe = gx + gw;
  var lDim = dimFor('ladder'), lo = swOpen ? eps : 0;
  if (ir && ir.mode === 'charging') {
    // charger lifts to epsCh -> down i*R across the series R -> cell band: down eps
    // (stored as chemistry) + down i*r (heat). Terminals across the cell hold V = eps + i*r.
    var rD3 = dimFor('r_internal');
    var x1 = gx + gw * 0.36, x2 = gx + gw * 0.52, x3 = gx + gw * 0.66, x35 = gx + gw * 0.80, x4 = gx + gw * 0.90;
    var vTop = ir.epsCh, vMid = ir.epsCh - i * R;                    // vMid = V across the cell = eps + i*r
    noStroke(); fill(66, 44, 34, 70 * dim); rect(x3, gy - gh, gw * 0.24, gh);   // 'inside the cell' band
    strokeHex('#4DD0E1', 0.98 * lDim); strokeWeight(2.5); noFill();
    beginShape();
    vertex(xa, py(0)); vertex(xa, py(vTop));      // charger riser
    vertex(x1, py(vTop));                         // flat
    vertex(x2, py(vMid)); vertex(x3, py(vMid));   // down i*R across the series R, flat to the cell
    vertex(x35, py(i * ir.r));                    // down eps INSIDE the cell (stored)
    endShape();
    strokeHex('#FF8A65', 0.98 * rD3); strokeWeight(2.5); noFill();
    beginShape(); vertex(x35, py(i * ir.r)); vertex(x4, py(0)); endShape();   // down i*r (heat) — highlighted
    strokeHex('#4DD0E1', 0.98 * lDim); strokeWeight(2.5); noFill();
    beginShape(); vertex(x4, py(0)); vertex(xe, py(0)); endShape();
    noStroke(); fillHex('#66BB6A', 0.95 * dim); textSize(10); textStyle(BOLD); textAlign(LEFT, BOTTOM);
    text('charger ' + vTop.toFixed(1) + ' V', xa + 4, py(vTop) - 3);
    fillHex('#B39DDB', 0.95 * dim); textAlign(LEFT, BOTTOM);
    text('V = ' + ir.V.toFixed(2) + ' V', x3 + 2, py(vMid) - 3);
    fillHex('#FF8A65', 0.9 * rD3); textAlign(LEFT, TOP); text('i\\u00B7r', x35 + 4, py(i * ir.r) + 2);
    fillHex('#66BB6A', 0.8 * dim); textSize(9); textAlign(RIGHT, BOTTOM);
    text('\\u03B5 = ' + eps.toFixed(1) + ' V', xe - 2, py(eps) - 2);   // the emf line V sits ABOVE
  } else if (ir) {
    // REAL cell discharging: up eps, down i*r STILL INSIDE the cell band, flat at V
    // along the wire, down V across the load. i = 0 degenerates to flat-at-eps (open).
    // ir.mystery (S1, before the r reveal): the internal drop is drawn in the SAME
    // cyan with NO i*r label and NO cell-band shading — the 0.50 V gap is SHOWN,
    // not explained (do-not-prespoil; S2 colors it orange, labels it, opens the casing).
    var rD2 = dimFor('r_internal');
    var xb = gx + gw * 0.13;
    var vT = eps - i * ir.r;                                         // terminal voltage
    if (!ir.mystery) { noStroke(); fill(66, 44, 34, 70 * dim); rect(xa, gy - gh, gw * 0.13, gh); }   // 'inside the cell' band
    strokeHex('#4DD0E1', 0.98 * lDim); strokeWeight(2.5); noFill();
    beginShape(); vertex(xa, py(0)); vertex(xa, py(eps)); endShape();           // the eps riser (the lift)
    if (ir.mystery) { strokeHex('#4DD0E1', 0.98 * lDim); } else { strokeHex('#FF8A65', 0.98 * rD2); }
    strokeWeight(2.5); noFill();
    beginShape(); vertex(xa, py(eps)); vertex(xb, py(vT)); endShape();          // the INTERNAL step (highlighted unless mystery)
    strokeHex('#4DD0E1', 0.98 * lDim); strokeWeight(2.5); noFill();
    beginShape();
    vertex(xb, py(vT)); vertex(xc, py(vT));                                     // flat at V along the wire
    vertex(xd, py(0)); vertex(xe, py(0));                                       // down V across the load
    endShape();
    noStroke(); fillHex('#4DD0E1', 0.98 * lDim); textSize(11); textStyle(BOLD); textAlign(LEFT, BOTTOM);
    text('\\u03B5 = ' + eps.toFixed(1) + ' V', xa + 4, py(eps) - 4);
    if (i > 0.02) {
      if (!ir.mystery) {
        fillHex('#FF8A65', 0.95 * rD2); textSize(10); textAlign(LEFT, TOP);
        text('i\\u00B7r', xb + 3, py((eps + vT) / 2) - 4);
      }
      fillHex('#B39DDB', 0.95 * dim); textSize(10); textAlign(RIGHT, BOTTOM);
      text('V = ' + vT.toFixed(2) + ' V', xc, py(vT) - 3);
    }
  } else {
  strokeHex('#4DD0E1', 0.98 * lDim); strokeWeight(2.5); noFill();
  beginShape();
  vertex(xa, py(0)); vertex(xa, py(eps));       // STEP UP by eps at the cell (the lift)
  vertex(xc, py(eps));                          // flat along the wire
  vertex(xd, py(lo)); vertex(xe, py(lo));       // STEP DOWN across the load (to 0 when current flows)
  endShape();
  noStroke(); fillHex('#4DD0E1', 0.98 * lDim); textSize(11); textStyle(BOLD); textAlign(LEFT, BOTTOM);
  text('\\u03B5 = ' + eps.toFixed(1) + ' V', xa + 4, py(eps) - 4);
  }
  if (holdPulse && holdPulse > 0) {                      // S3: the step "still eps" emphasis on each q flip
    fillHex('#FFFFFF', 0.9 * holdPulse * lDim); textSize(10); textAlign(LEFT, TOP);
    text('still ' + eps.toFixed(1) + ' J/C', xa + 4, py(eps) + 4);
    strokeHex('#FFFFFF', 0.85 * holdPulse * lDim); strokeWeight(2); noFill();
    line(xa, py(0), xa, py(eps));                        // re-stroke the riser: the height that did NOT change
    noStroke();
  }
  if (traceS !== null && traceS !== undefined && !swOpen) {   // the followed charge's energy dot
    var p2 = prof, s = traceS;
    var tx, tv = emfTraceV(s, p2, eps);
    if (s < p2.sc) tx = xa;                                              // riding UP the riser
    else if (s < p2.s1) tx = xa + (xc - xa) * ((s - p2.sc) / max(p2.s1 - p2.sc, 1e-6));
    else if (s < p2.s2) tx = xc + (xd - xc) * ((s - p2.s1) / max(p2.s2 - p2.s1, 1e-6));
    else tx = xd + (xe - xd) * ((s - p2.s2) / max(1 - p2.s2, 1e-6));
    var ty = py(tv);
    noStroke(); fillHex('#FFE082', 0.30 * lDim); ellipse(tx, ty, 14);    // halo (brightness, not size — Rule 29)
    fillHex('#FFE082', 0.98 * lDim); ellipse(tx, ty, 7);
  }
  fillHex('#B0BEC5', 0.85 * dim); textSize(9); textStyle(NORMAL); textAlign(LEFT, TOP);
  text('potential around loop (J/C)', gx, y0 + 4);
  textAlign(CENTER, TOP);
  if (ir && ir.mode === 'charging') {
    text('charger', xa + gw * 0.18, gy + 3); text('R', xa + gw * 0.51, gy + 3); text('cell', xa + gw * 0.78, gy + 3);
  } else if (ir) {
    text('cell', xa + gw * 0.065, gy + 3); text('load', (xc + xd) / 2, gy + 3);
  } else {
    text('cell', xa + gw * 0.25, gy + 3); text('load', (xc + xd) / 2, gy + 3);
  }
  textStyle(NORMAL);
}
function drawVIGraph(state) {
  var dimMul = dimFor('vi_graph');
  var gw = 244, gh = 178, gx = 16, gy = height - gh - 16;
  noStroke();
  fill(8, 10, 26, 214 * dimMul);
  rect(gx, gy, gw, gh, 8);

  var padL = 40, padB = 28, padT = 22, padR = 16;
  var x0 = gx + padL, y0 = gy + gh - padB;   // origin (bottom-left)
  var x1 = gx + gw - padR, y1 = gy + padT;
  var pw = x1 - x0, ph = y0 - y1;

  // Axes: I on x, V on y — so the geometric slope ΔV/ΔI = R and "slope = R" is
  // literal (NCERT V-I convention); a bigger R tilts the line steeper.
  strokeHex('#9FB3C8', 0.8 * dimMul); strokeWeight(1.5);
  line(x0, y0, x1, y0);   // I axis
  line(x0, y0, x0, y1);   // V axis
  noStroke();
  fillHex('#CFD8DC', 0.9 * dimMul); textSize(11); textStyle(BOLD);
  textAlign(CENTER, TOP); text('I (A)', (x0 + x1) / 2, y0 + 9);
  push(); translate(gx + 11, (y0 + y1) / 2); rotate(-HALF_PI);
  textAlign(CENTER, BOTTOM); text('V (volts)', 0, 0); pop();
  textStyle(NORMAL);

  var vmaxY = (sliderDefs().V && sliderDefs().V.max) ? sliderDefs().V.max : max(plotV(), 1);
  // Fixed current axis, scaled to the DEFAULT R so the default line reads as a
  // clean diagonal; raising R (S3's lesson) steepens it, staying in-bounds
  // (lowering R past default clips harmlessly at the right wall via constrain).
  var Rax = hasSlider('R') ? sliderDefault('R') : 1;
  var imaxX = ohmicCurrentAt(vmaxY, Rax) * 1.15;
  if (imaxX <= 0) imaxX = 1;
  var toX = function(i) { return x0 + constrain(i / imaxX, 0, 1.02) * pw; };
  var toY = function(v) { return y0 - constrain(v / vmaxY, 0, 1.02) * ph; };

  // faint ohmic reference at the live R — straight through the origin (the "law")
  var Rref = plotR();
  strokeHex('#546E7A', 0.55 * dimMul); strokeWeight(1);
  line(toX(0), toY(0), toX(ohmicCurrentAt(vmaxY, Rref)), toY(vmaxY));

  var pv = plotV(), N = 48;
  // swept portion (bright): the curve traced so far, parametrized by V 0..pv
  strokeHex('#4DD0E1', 0.95 * dimMul); strokeWeight(2.5); noFill();
  beginShape();
  for (var s = 0; s <= N; s++) { var v = vmaxY * s / N; if (v > pv + 1e-9) break; vertex(toX(currentAtV(v)), toY(v)); }
  vertex(toX(currentAtV(pv)), toY(pv));
  endShape();
  // faint continuation to vmax
  strokeHex('#4DD0E1', 0.26 * dimMul); strokeWeight(1.5);
  beginShape();
  for (var s2 = 0; s2 <= N; s2++) { var v2 = vmaxY * s2 / N; if (v2 < pv) continue; vertex(toX(currentAtV(v2)), toY(v2)); }
  endShape();

  // operating point
  var opx = toX(currentAtV(pv)), opy = toY(pv);
  noStroke();
  fillHex('#4DD0E1', 0.18 * dimMul); ellipse(opx, opy, 18);
  fillHex('#FFFFFF', 0.95 * dimMul); ellipse(opx, opy, 7);

  // slope readout — now the literal geometric slope of the plotted line
  fillHex('#80DEEA', 0.95 * dimMul); textSize(11); textStyle(BOLD);
  textAlign(LEFT, TOP);
  var iNow = realCurrent();
  var slopeTxt = (state.ohmic === false)
    ? 'R rises \\u2192 line steepens'
    : ('slope R = ' + (iNow > 1e-6 ? realResistance().toFixed(1) : '\\u2013') + ' \\u03A9');
  text(slopeTxt, x0 + 6, y1 - 2);
  textStyle(NORMAL);
}

// ─── Conserved-current viz (S4 — count-in = count-out across the resistor) ──
function drawDashedV(x, ya, yb) {
  var seg = 6, gap = 5;
  strokeWeight(1.5);
  for (var y = ya; y < yb; y += seg + gap) line(x, y, x, min(y + seg, yb));
}
function drawFluxConservation(state) {
  var dimMul = dimFor('flux');
  var bandX = width * 0.40, bandW = width * 0.20;
  var by = height * 0.18, bh = height * 0.64;

  // voltage gradient across the band: bright (high V) left → dim (low V) right = the DROP
  noStroke();
  for (var g = 0; g < bandW; g += 4) {
    var f = g / bandW;
    fill(255, lerp(180, 80, f), 40, 0.16 * 255 * dimMul);
    rect(bandX + g, by, 4.5, bh);
  }
  strokeHex('#FF9800', 0.5 * dimMul); strokeWeight(1.2); noFill();
  rect(bandX, by, bandW, bh, 4);
  noStroke(); fillHex('#FFB74D', 0.9 * dimMul); textSize(12); textStyle(BOLD);
  textAlign(CENTER, BOTTOM); text('R', bandX + bandW / 2, by - 6);

  // counting planes just before / after the resistor
  var pIn = bandX - 12, pOut = bandX + bandW + 12;
  strokeHex('#66BB6A', 0.85 * dimMul);
  drawDashedV(pIn, by, by + bh); drawDashedV(pOut, by, by + bh);

  // equal tallies — crossings per second are identical on both planes (i conserved)
  var perSec = max(1, round(realCurrent() * 8));   // display-only, proportional to i
  noStroke(); fillHex('#A5D6A7', 0.95 * dimMul); textSize(11); textStyle(BOLD);
  textAlign(CENTER, TOP);
  text(perSec + '/s in', pIn, by + bh + 6);
  text(perSec + '/s out', pOut, by + bh + 6);
  fillHex('#FFFFFF', 0.92 * dimMul); textSize(16);
  textAlign(CENTER, TOP); text('=', (pIn + pOut) / 2, by + bh + 4);
  fillHex('#FFB74D', 0.9 * dimMul); textSize(11); textStyle(BOLD);
  textAlign(CENTER, TOP); text('V drops across R', bandX + bandW / 2, by + bh + 24);
  textStyle(NORMAL);
}

// ─── Legacy power meter ─────────────────────────────────────────────────────
function drawPowerMeter(intensity) {
  var meterX = width - 160;
  var meterY = 10;
  var meterW = 150;
  var meterH = 50;

  noStroke();
  fill(0, 0, 0, 180);
  rect(meterX, meterY, meterW, meterH, 6);

  var I = curEffDrift;
  var P = I * I * 10;

  fill(255, 152, 0, 255);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('P = I\\u00B2R', meterX + 8, meterY + 6);

  fill(255, 255, 255, 230);
  textSize(16);
  text(P.toFixed(1) + ' W', meterX + 8, meterY + 24);

  var barWidth = constrain(map(intensity, 0, 1, 0, meterW - 16), 0, meterW - 16);
  var barR = floor(lerp(100, 255, intensity));
  var barG = floor(lerp(200, 80, intensity));
  fill(barR, barG, 0, 200);
  rect(meterX + 8, meterY + meterH - 8, barWidth, 4, 2);
  textStyle(NORMAL);
}

// ─── Legacy heat counter ────────────────────────────────────────────────────
function drawHeatCounter() {
  var counterX = width - 160;
  var counterY = 66;

  noStroke();
  fill(0, 0, 0, 180);
  rect(counterX, counterY, 150, 34, 6);

  fill(239, 83, 80, 255);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('H = I\\u00B2Rt', counterX + 8, counterY + 4);

  fill(255, 255, 255, 230);
  textSize(13);
  var displayH = heatAccumulator < 100 ? heatAccumulator.toFixed(1) : floor(heatAccumulator).toString();
  text(displayH + ' J', counterX + 8, counterY + 18);
  textStyle(NORMAL);
}

// ─── State label ────────────────────────────────────────────────────────────
function drawLabel(state) {
  noStroke();
  var labelText = state.label || PM_currentState;
  textSize(12);
  var tw = textWidth(labelText);
  fillHex('#000000', 0.5);
  rect(8, height - 32, tw + 20, 24, 6);
  fillHex('#D4D4D8', 0.9);
  textAlign(LEFT, CENTER);
  text(labelText, 18, height - 20);
}

// ─── postMessage bridge ─────────────────────────────────────────────────────
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.type) return;
  var t = e.data.type;

  if (t === 'SET_STATE') {
    if (applyState(e.data.state)) {
      console.log('[Renderer] SET_STATE \\u2192', e.data.state);
      window.parent.postMessage({ type: 'STATE_REACHED', state: e.data.state }, '*');
    }
  } else if (t === 'SET_TIME_FREEZE') {
    if (e.data.frozen === false) {
      frozen = false;
    } else if (e.data.at_ms !== undefined) {
      // Deterministic re-sim: home pose → step to at_ms → hold. Same PRNG seed
      // + same step order = identical frames every time (THE EYE baselines).
      var target = max(0, e.data.at_ms);
      var st = curState();
      if (st) {
        resetToHomePose();
        // ceil, not floor: PM_simTimeMs must land >= at_ms or the harness's
        // pollSimTimeReached burns a full poll cap on every dense frame.
        var steps = ceil(target / (1000 / 60));
        for (var k = 0; k < steps; k++) { if (isCircuitFamily()) stepCircuit(st); else stepPhysics(st); }
      }
      frozen = true;
    }
  } else if (t === 'SET_CUE_TIME') {
    if (e.data.cue) cueOverrides[e.data.cue] = e.data.at_ms;
  } else if (t === 'SET_GLOW') {
    glowOverride = (e.data.target === undefined) ? null : e.data.target;
  } else if (t === 'RESET_TRAJECTORY') {
    // Harness contract: clean state-local t=0 + empty trails before/after a
    // pinned dense series (scar: particle_field_dense_capture_inherits_reveal_pin_clock).
    resetToHomePose();
  } else if (t === 'PAUSE') {
    paused = true;             // clock + physics freeze together (Rule 26b)
  } else if (t === 'RESUME') {
    paused = false;
  } else if (t === 'MUTE') {
    // audio lives in the player shell — nothing to do (Rule 26a)
  }
  // Tolerant no-ops for field_3d-only messages:
  // SET_MATH / SET_HAND_PHASE / SET_FREEZE_PROTON / REPLAY_ANIMATIONS / PING
  // — ignored by design.
});

// ─── SIM_READY fallback (p5 CDN failure watchdog) ───────────────────────────
window.addEventListener('load', function() {
  setTimeout(function() {
    if (!simReadyFired) {
      simReadyFired = true;
      window.parent.postMessage({ type: 'SIM_READY' }, '*');
      console.error('[Renderer] p5 setup never ran (CDN failure?) — fallback SIM_READY fired');
    }
  }, 3000);
});
`;

// =============================================================================
// assembleParticleFieldHtml — self-contained HTML for an AUTHORED (deterministic)
// particle_field concept. This is the build:review / THE EYE entry point for
// 2D particle diamonds, the counterpart of assembleField3DHtml. The legacy chat
// path keeps using aiSimulationGenerator's private assembleRendererHTML.
// =============================================================================

export interface ParticleFieldSliderDef {
    min: number;
    max: number;
    step?: number;
    default?: number;
    label?: string;
    unit?: string;
}

/** Per-state block — mirrors field_3d_config.states.STATE_N conventions. */
export interface ParticleFieldStateConfig {
    label?: string;
    caption?: string;
    formula_overlay?: string;
    show_sliders?: boolean;
    visible_controls?: string[];
    field_visible?: boolean;
    drift_speed?: number;
    drift_direction?: 'left' | 'right' | 'none';
    highlight_particle?: boolean;
    dim_others?: boolean;
    dim_opacity?: number;
    glow_focal?: string | string[];
    cue?: { id: string; at_ms: number };
    cues?: Array<{ id: string; at_ms: number }>;
    show_current_meter?: boolean;
    show_drift_arrow?: boolean;
    // ohms_law (Ch.3 #2)
    show_vi_graph?: boolean;        // draw the V–I graph panel (the LAW)
    vi_autosweep?: boolean;         // clock-drives V 0→default until the teacher grabs the V slider
    r_autosweep?: boolean;          // clock-ramps R up (line re-tilts) until the teacher grabs the R slider
    ohmic?: boolean;                // default true; false = filament (R rises with V, curve bends)
    show_flux_conservation?: boolean; // S4 count-in = count-out across the resistor band
    // resistivity (Ch.3 #3)
    length_autosweep?: boolean;     // clock-drives L from default toward max (S1)
    area_autosweep?: boolean;       // clock-drives A from default toward max (S2)
    geometry_cycle?: boolean;       // S3 three-phase cycle: L sweep, A sweep, constant-volume coupled stretch
    material_cycle?: boolean;       // S4: material toggles copper<->nichrome on a ~6s loop
    material_switch?: { cue: string; from: number; to: number };  // S6: one-shot cued material switch
    temperature_autosweep?: boolean; // clock-drives T from default toward max (S5/S6)
    show_thermometer?: boolean;      // draw the T gauge (S5/S6)
    micro_focus?: 'trace_one' | 'count_carriers';  // Rule 33c per-state interior story
    // combination_of_resistors (Ch.3 #4 — circuit scenario)
    single_resistor?: boolean;       // S1 baseline: one loop, one resistor (i = V/R1)
    topology?: 'series' | 'parallel'; // per-state circuit topology (else the topology slider)
    r2_autosweep?: boolean;          // S6: R2 grows from default toward r2_autosweep_to
    r2_autosweep_to?: number;        // target R2 for the S6 sweep (default 12)
    show_branch_meters?: boolean;    // parallel: draw per-branch ammeters (i1, i2)
    in_line_meters?: boolean;        // series: draw 3 in-line ammeters (all read i)
    show_req_box?: boolean;          // draw the equivalent-resistance badge (S7)
    show_voltages?: boolean;         // S4: per-resistor voltage-drop labels (series → they add)
    switch_cycle?: boolean;          // S8: a branch switch auto-opens/closes on a loop
    [key: string]: unknown;
}

/** A resistivity material preset — id/label/rho0 (Ω·m at T0)/alpha (per °C)/tint. */
export interface ParticleFieldMaterialDef {
    id: string;
    label: string;
    rho0: number;
    alpha: number;
    tint: string;
}

export interface ParticleFieldAuthoredConfig {
    scenario_type?: string;
    design?: {
        background?: string;
        fill_viewport?: boolean;
        dim_level?: number;
        phys_seed?: number;
        [key: string]: unknown;
    };
    particles?: { count?: number; thermal_speed?: number; color?: string; size?: number; trail_length?: number };
    lattice?: { count?: number; color?: string; size?: number; glow?: boolean };
    field_arrows?: { count?: number; direction?: 'left_to_right' | 'right_to_left'; color?: string };
    slider_controls?: Record<string, ParticleFieldSliderDef>;
    materials?: ParticleFieldMaterialDef[];  // resistivity material presets (copper/nichrome/manganin)
    macro_view?: boolean;  // Rule 33: split canvas — macro rod (top) + micro lattice/electrons (bottom)
    formula_anchor?: { constants?: Record<string, number>; [key: string]: unknown };
    pvl_colors?: Record<string, string>;
    animation_constraints?: Record<string, string | number | boolean>;
    states: Record<string, ParticleFieldStateConfig>;
    [key: string]: unknown;
}

export function assembleParticleFieldHtml(cfgIn: ParticleFieldAuthoredConfig): string {
    const cfg = {
        ...cfgIn,
        design: {
            background: '#0A0A1A',
            fill_viewport: true,
            ...(cfgIn.design ?? {}),
        },
        particles: {
            count: 40,
            thermal_speed: 2.2,
            color: '#42A5F5',
            size: 7,
            trail_length: 12,
            ...(cfgIn.particles ?? {}),
        },
        lattice: {
            count: 24,
            color: '#90A4AE',
            size: 12,
            glow: false,
            ...(cfgIn.lattice ?? {}),
        },
        field_arrows: {
            count: 5,
            direction: 'left_to_right',
            color: '#FF9800',
            ...(cfgIn.field_arrows ?? {}),
        },
    };
    const bgColor = cfg.design.background ?? '#0A0A1A';
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
html, body { margin: 0; padding: 0; overflow: hidden; background: ${bgColor}; width: 100%; height: 100%; }
canvas { display: block; }
</style>
</head><body>
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(cfg)};
<\/script>
<script>
${PARTICLE_FIELD_RENDERER_CODE}
<\/script>
</body></html>`;
}
