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
  if (hasSlider('R') && !userTouched['R']) {   // R thumb tracks the r_autosweep
    var rEl = document.getElementById('pm-sv-R');
    if (rEl) { var rd2 = defs.R || {}; rEl.textContent = (Math.round(plotR() * 100) / 100) + (rd2.unit ? (' ' + rd2.unit) : ''); }
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
  var ro = document.getElementById('pm-readout');
  if (ro) {
    if (hasSlider('material')) {                              // resistivity: R, rho, i (independently glowable)
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

// ─── Draw loop (render only — physics advanced separately) ──────────────────
function draw() {
  if (!config) return;
  var state = curState();
  if (!state) return;

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
        for (var k = 0; k < steps; k++) stepPhysics(st);
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
