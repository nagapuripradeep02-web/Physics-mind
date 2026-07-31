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
//   OUT: SIM_READY {widgets?} (on load; widgets = ⚙ toggle declaration),
//        STATE_REACHED (on state apply),
//        WIDGET_VIS_STATE {vis} (effective widget visibility — ⚙ switches)
//   IN (⚙/chrome extras): SET_WIDGET_VIS {overrides:{key:'show'|'hide'}},
//        WIDGET_PING {widget}, SET_CLEAN_MODE {on}
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
    var pfReady = { type: 'SIM_READY' };
    pfDeclaredWidgets = pfWidgetList();
    if (pfDeclaredWidgets && pfDeclaredWidgets.length) pfReady.widgets = pfDeclaredWidgets;
    window.parent.postMessage(pfReady, '*');
    pfPostWidgetVis();
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
  if (gasMode()) { gasInit(); collisionFlashes = []; return; }                                        // gas_box builds hard discs in a bounded box
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

// ─── Per-widget teacher toggles (⚙ panel — chrome contract shared with field_3d) ──
// The teacher can pin any widget 'show'/'hide' from the review chrome's ⚙
// panel; unset = follow the state's authored Rule-31 default. DOM widgets
// (caption / formula / slider rows / readout) are applied in
// applyStateVisuals; canvas-drawn HUDs (meters / graphs / sum chips) are
// gated at their draw call via pfWgVis(key, stateWants). THE EYE never sends
// SET_WIDGET_VIS, so captures always see authored defaults — baselines
// unaffected.
var pfWidgetVis = {};          // { key: 'show'|'hide' } — teacher overrides
var pfDeclaredWidgets = null;  // [{key,label}] declared in SIM_READY
// Canvas-drawn HUD registry: widget key → the per-state flag that draws it.
// def:true = drawn unless the state sets the flag explicitly false (the
// show_galvanometer pattern); those declare only when a galvo-bearing
// topology (bridge / wire / meter_bridge) exists in this concept.
var PF_WG_FLAGS = [
  { key: 'current_meter', flag: 'show_current_meter', label: 'Ammeter' },
  { key: 'vi_graph', flag: 'show_vi_graph', label: 'V\\u2013I graph' },
  { key: 'drift_arrow', flag: 'show_drift_arrow', label: 'Drift arrow' },
  { key: 'thermometer', flag: 'show_thermometer', label: 'Thermometer' },
  { key: 'flux_panel', flag: 'show_flux_conservation', label: 'Count in = out panel' },
  { key: 'req_box', flag: 'show_req_box', label: 'R_eq badge' },
  { key: 'kcl_sum', flag: 'kcl_sum_readout', label: 'KCL sum HUD' },
  { key: 'kvl_sum', flag: 'kvl_sum_readout', label: 'KVL sum HUD' },
  { key: 'galvanometer', flag: 'show_galvanometer', label: 'Galvanometer', def: true },
  { key: 'node_readouts', flag: 'show_node_readouts', label: 'Node voltages' },
  { key: 'ratio_hud', flag: 'show_ratio_hud', label: 'Ratio HUD' },
  { key: 'balance_readout', flag: 'show_balance_readout', label: 'Balance readout' },
  { key: 'voltmeter', flag: 'show_voltmeter_compare', label: 'Voltmeter' },
  // gas_box HUDs (2026-07-27). Rule 39f: a canvas-drawn HUD has no DOM handle,
  // so it declares here and gates at its draw call through pfWgVis().
  { key: 'gas_pressure', flag: 'show_pressure', label: 'Pressure gauge' },
  { key: 'gas_thermo', flag: 'show_gas_thermometer', label: 'Gas thermometer' },
  { key: 'gas_histogram', flag: 'show_speed_histogram', label: 'Speed distribution' },
  { key: 'gas_counters', flag: 'show_collision_counter', label: 'Collision counter' },
  { key: 'gas_law', flag: 'show_gas_law', label: 'P\\u00B7A = N\\u00B7k\\u00B7T check' },
  { key: 'gas_trails', flag: 'show_trails', label: 'Particle trails' },
  // reaction layer (2026-07-28)
  { key: 'gas_reaction', flag: 'show_reaction_readout', label: 'Reaction rates' },
  { key: 'gas_conc_graph', flag: 'show_concentration_graph', label: 'Concentration graph' },
  { key: 'gas_ledger', flag: 'show_energy_ledger', label: 'Energy ledger (check)' },
  { key: 'gas_k_ratio', flag: 'show_k_ratio', label: 'Equilibrium constant K' },
  // collision-theory layer (2026-07-29)
  { key: 'gas_arrhenius', flag: 'show_arrhenius_plot', label: 'Arrhenius plot' },
  { key: 'gas_profile', flag: 'show_reaction_profile', label: 'Energy hill' }
];
function pfWgVis(key, stateWants) {
  var o = pfWidgetVis[key];
  if (o === 'show') return true;
  if (o === 'hide') return false;
  return !!stateWants;
}
function pfWgFlagWants(f, state) {
  if (!state) return false;
  return f.def ? state[f.flag] !== false : !!state[f.flag];
}
function pfWidgetList() {
  if (!config || !config.states) return null;
  var out = [], sid, st, i;
  var defs = sliderDefs() || {};
  for (var id in defs) out.push({ key: 'slider_' + id, label: (defs[id].label || id) + ' slider' });
  var anyCaption = false, anyFormula = false, anyGalvoTopo = false;
  for (sid in config.states) {
    st = config.states[sid];
    if (!st) continue;
    if (st.caption) anyCaption = true;
    if (st.formula_overlay) anyFormula = true;
    if (st.topology === 'bridge' || st.topology === 'wire' || st.topology === 'meter_bridge') anyGalvoTopo = true;
  }
  if (anyCaption) out.push({ key: 'caption', label: 'Caption' });
  if (anyFormula) out.push({ key: 'formula', label: 'Formula' });
  out.push({ key: 'readout', label: 'Live numbers' });
  for (i = 0; i < PF_WG_FLAGS.length; i++) {
    var f = PF_WG_FLAGS[i], used = false;
    if (f.def) {
      used = anyGalvoTopo;
    } else {
      for (sid in config.states) { if (pfWgFlagWants(f, config.states[sid])) { used = true; break; } }
    }
    if (used) out.push({ key: f.key, label: f.label });
  }
  if (hasPowerMeter()) out.push({ key: 'power_meter', label: 'Power meter' });
  if (hasHeatCounter()) out.push({ key: 'heat_counter', label: 'Heat counter' });
  return out;
}
function pfWidgetEffVis() {
  var vis = {}, i, j, k;
  if (!pfDeclaredWidgets) return vis;
  var state = curState() || {};
  var panelEl = document.getElementById('pm-sliders');
  var panelOn = !!(panelEl && panelEl.style.display !== 'none');
  for (i = 0; i < pfDeclaredWidgets.length; i++) {
    k = pfDeclaredWidgets[i].key;
    if (k.indexOf('slider_') === 0) {
      var row = sliderRows[k.slice(7)];
      vis[k] = !!(row && row.style.display !== 'none' && panelOn);
    } else if (k === 'caption') {
      var ce = document.getElementById('pm-caption'); vis[k] = !!(ce && ce.style.display !== 'none');
    } else if (k === 'formula') {
      var fe = document.getElementById('pm-formula'); vis[k] = !!(fe && fe.style.display !== 'none');
    } else if (k === 'readout') {
      var re = document.getElementById('pm-readout'); vis[k] = !!(re && re.style.display !== 'none' && panelOn);
    } else if (k === 'power_meter') {
      vis[k] = pfWgVis(k, hasPowerMeter());
    } else if (k === 'heat_counter') {
      vis[k] = pfWgVis(k, hasHeatCounter());
    } else {
      for (j = 0; j < PF_WG_FLAGS.length; j++) {
        if (PF_WG_FLAGS[j].key === k) { vis[k] = pfWgVis(k, pfWgFlagWants(PF_WG_FLAGS[j], state)); break; }
      }
    }
  }
  return vis;
}
function pfPostWidgetVis() {
  if (!pfDeclaredWidgets) return;
  try { window.parent.postMessage({ type: 'WIDGET_VIS_STATE', vis: pfWidgetEffVis() }, '*'); } catch (err) {}
}

// Per-state DOM visuals: caption, formula overlay, slider row visibility.
// Every display decision routes through pfWgVis so the teacher's ⚙ overrides
// hold across state changes (this function is also the SET_WIDGET_VIS
// re-apply path — it never resets the sim clock or the drag-seize flags).
function applyStateVisuals() {
  var state = curState();
  if (!uiBuilt || !state) return;

  var cap = document.getElementById('pm-caption');
  if (cap) {
    cap.textContent = state.caption || '';
    cap.style.display = (state.caption && pfWgVis('caption', true)) ? 'block' : 'none';
  }

  var frm = document.getElementById('pm-formula');
  if (frm) {
    frm.textContent = state.formula_overlay || '';
    frm.style.display = (state.formula_overlay && pfWgVis('formula', true)) ? 'block' : 'none';
  }

  // Rule 31: rows shown/hidden per state; the panel (and each row) keeps its
  // screen position. visible_controls: [] subset; show_sliders: true = all.
  var panel = document.getElementById('pm-sliders');
  if (panel) {
    var vis = state.visible_controls || null;
    var showAll = !!state.show_sliders && !vis;
    var anyVisible = false;
    for (var id in sliderRows) {
      var show = pfWgVis('slider_' + id, showAll || (vis && vis.indexOf(id) >= 0));
      sliderRows[id].style.display = show ? 'flex' : 'none';
      if (show) anyVisible = true;
    }
    // The slider THUMB and its value label must show the value this state
    // actually authored, not the control's build-time default. STATE_4 authors
    // piston_frac 0.5 and the canvas honoured it, while the panel read
    // "Volume 1" — the teacher's only numeric handle on the variable disagreed
    // with the picture. Only while unseized: once dragged, the teacher owns it.
    if (gasMode()) {
      var gasNow = { T: gasTargetT(), V: gasTargetPistonF(), N: gasCount() };
      for (var gid in gasNow) {
        if (userTouched[gid] || !sliderRows[gid]) continue;
        var gInp = sliderRows[gid].querySelector('input');
        if (gInp) { gInp.value = gasNow[gid]; userParams[gid] = gasNow[gid]; }
      }
    }

    var ro = document.getElementById('pm-readout');
    var roOn = pfWgVis('readout', true);
    if (ro) ro.style.display = roOn ? 'block' : 'none';
    // The panel shell follows its content: any visible row, or a force-shown
    // readout ('show' pin) when every row is hidden.
    panel.style.display = (anyVisible || (roOn && pfWidgetVis['readout'] === 'show')) ? 'block' : 'none';
    updateReadouts();
  }

  pfPostWidgetVis();
}

// ─── Review-chrome detection (Rule 34d, deliberately CONDITIONAL) ───────────
// The sim always runs inside an iframe. In the REVIEW TOOL (build_review_site.ts)
// the PARENT document carries the top-right glass cluster #fsTopControls
// (#fsBtn 'Full screen' + #wgBtn 'Widgets', anchored top:10px;right:10px, ~30px
// tall), so a fixed overlay pinned at top:10px on the right edge hides its first
// row behind them. THE EYE renders the very same sim.html inside a BARE wrapper
// iframe whose parent has NO chrome — so we must NOT hardcode the downward shift
// the way field_3d_renderer.ts does (a literal top:52px would move every locked
// raw-capture baseline for all particle_field concepts and trip the regression
// gate; this trial cannot re-lock baselines). Instead detect the chrome at
// runtime and shift ONLY when it is present. Same-origin parent access is
// guaranteed in the review tool (sim.html is served from the parent's own
// origin); THE EYE's wrapper parent either lacks #fsTopControls (-> false) or is
// walled off cross-origin (-> false), so the raw-capture path stays
// byte-identical by construction. DO NOT 'simplify' this back to a literal.
// engine_bug_queue candidate: particle_field_sliders_panel_top10_vs_reviewchrome.
function pfInReviewChrome() {
  try {
    if (window.parent === window) return false;
    var pdoc = window.parent.document;
    return !!(pdoc && (pdoc.getElementById('fsTopControls') || pdoc.getElementById('fsBtn')));
  } catch (e) {
    return false;
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
  // Rule 34b wants the ONE formula surface in a math serif, and Rule 34d wants it
  // to own its zone — at 60% opacity over a moving box a particle sat on the "="
  // of the equation and the box frame cut through the second line. Fixed for the
  // gas family ONLY: thirteen baseline-locked circuit concepts share this element,
  // so restyling it fleet-wide would fail their H2 baselines by design (Rule 34e)
  // and force thirteen re-approvals — a founder call, not a chapter fix.
  if (gasMode()) {
    frm.style.background = 'rgba(8,10,22,0.96)';
    frm.style.border = '1px solid rgba(148,163,184,0.35)';
    frm.style.font = '13px/1.6 "Cambria Math", "STIX Two Math", Georgia, serif';
  }
  document.body.appendChild(frm);

  var defs = sliderDefs();
  if (!defs) return;

  var panel = document.createElement('div');
  panel.id = 'pm-sliders';
  // Clear the review chrome's top-right glass cluster (#fsBtn/#wgBtn, top:10px)
  // ONLY when that chrome is actually present — top:52px in the review tool,
  // unchanged top:10px in THE EYE's raw capture so every locked baseline stays
  // byte-identical (Rule 34d; see pfInReviewChrome above; conditional on purpose,
  // NOT the hardcoded top:52px field_3d uses).
  var pmSlidersTop = pfInReviewChrome() ? '52px' : '10px';
  panel.style.cssText = 'position:fixed;top:' + pmSlidersTop + ';right:10px;width:238px;' +
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
  // combination_of_cells: NEW enum sliders — always rendered as words (physics_
  // author's constraint block: cell_topology/switch as text, flip_cell2 never a
  // raw number).
  if (id === 'cell_topology') { var ctv0 = ccTopologyFromNum(sliderVal('cell_topology')); return ctv0.charAt(0).toUpperCase() + ctv0.slice(1); }
  if (id === 'flip_cell2') return sliderVal('flip_cell2') < 0.5 ? 'Normal' : 'Reversed';
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
  // wheatstone_bridge: the R / emf rows track their clock sweep until grabbed, and
  // the readout box shows the bridge story (V_B, V_D, null). Early-out so the
  // ohms_law/circuit branches below (which assume series/parallel) never misfire.
  if (circuitMode() && cTopology() === 'bridge') {
    if (hasSlider('R') && !userTouched['R']) {
      var brR = document.getElementById('pm-sv-R');
      if (brR) { var brRd = defs.R || {}; brR.textContent = fmtNum(cBridgeR()) + (brRd.unit ? (' ' + brRd.unit) : ''); }
    }
    if (hasSlider('emf') && !userTouched['emf']) {
      var brE = document.getElementById('pm-sv-emf');
      if (brE) { var brEd = defs.emf || {}; brE.textContent = (Math.round(cBridgeEmf() * 100) / 100) + (brEd.unit ? (' ' + brEd.unit) : ''); }
    }
    var brRo = document.getElementById('pm-readout');
    if (brRo) {
      var bpr = bridgePhysics();
      brRo.textContent = 'V_B = ' + bpr.VB.toFixed(1) + ' V\\n' +
                         'V_D = ' + bpr.VD.toFixed(1) + ' V\\n' +
                         (bpr.balanced ? 'i_g = 0' : ('\\u0394V = ' + (bpr.VB - bpr.VD).toFixed(1) + ' V'));
    }
    return;
  }
  // meter_bridge: the l (jockey) + R (S5 cycle) rows track their choreography until
  // grabbed, and the readout box shows the null-detector story (V_B, V_J, i_g). Early-out
  // so the ohms_law/circuit branches below (series/parallel R_eq) never misfire — the
  // generic "Parallel / R_eq" HUD is meaningless for a slide-wire bridge. Mirrors the
  // wheatstone_bridge block above.
  if (circuitMode() && cTopology() === 'meter_bridge') {
    if (hasSlider('l') && !userTouched['l']) {
      var mbLEl = document.getElementById('pm-sv-l');
      if (mbLEl) { var mbLd = defs.l || {}; mbLEl.textContent = Math.round(cMbJockeyF() * 100) + (mbLd.unit ? (' ' + mbLd.unit) : ''); }
    }
    if (hasSlider('R') && !userTouched['R'] && curState() && curState().cycle_compare) {
      var mbREl = document.getElementById('pm-sv-R');
      if (mbREl) { var mbRd = defs.R || {}; mbREl.textContent = fmtNum(cMbR()) + (mbRd.unit ? (' ' + mbRd.unit) : ''); }
    }
    var mbRoEl = document.getElementById('pm-readout');
    if (mbRoEl) {
      var mbpr = mbPhysics();
      mbRoEl.textContent = 'V_B = ' + mbpr.VB.toFixed(2) + ' V\\n' +
                           'V_J = ' + mbpr.VJ.toFixed(2) + ' V\\n' +
                           (mbpr.balanced ? 'i_g = 0' : ('\\u0394V = ' + mbpr.gap.toFixed(2) + ' V'));
    }
    return;
  }
  // potentiometer: the l/E/eps_d rows track their per-state lock (l also its sweep)
  // until grabbed, and the readout box shows the gradient/tap/balance story. Early-out
  // so the ohms_law/circuit branches below (series/parallel assumptions) never misfire.
  if (circuitMode() && cTopology() === 'wire') {
    var wp = potPhysics();
    if (hasSlider('l') && !userTouched['l']) {
      var wpl = document.getElementById('pm-sv-l');
      if (wpl) { var wpld = defs.l || {}; wpl.textContent = (Math.round(wp.l * 100) / 100) + (wpld.unit ? (' ' + wpld.unit) : ''); }
    }
    if (hasSlider('E') && !userTouched['E']) {
      var wpE = document.getElementById('pm-sv-E');
      if (wpE) { var wpEd = defs.E || {}; wpE.textContent = (Math.round(wp.E * 100) / 100) + (wpEd.unit ? (' ' + wpEd.unit) : ''); }
    }
    if (hasSlider('eps_d') && !userTouched['eps_d']) {
      var wpEps = document.getElementById('pm-sv-eps_d');
      if (wpEps) { var wpEpsd = defs.eps_d || {}; wpEps.textContent = (Math.round(wp.epsD * 100) / 100) + (wpEpsd.unit ? (' ' + wpEpsd.unit) : ''); }
    }
    var wpRo = document.getElementById('pm-readout');
    if (wpRo) {
      wpRo.textContent = 'k = ' + wp.k.toFixed(2) + ' V/m\\n' +
                         'k\\u00B7l = ' + wp.kl.toFixed(2) + ' V\\n' +
                         'E = ' + wp.E.toFixed(2) + ' V\\n' +
                         (wp.balanced ? 'i = 0' : ('\\u0394 = ' + (wp.kl - wp.E).toFixed(2) + ' V'));
    }
    return;
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
  // combination_of_cells S7: the cell_topology row tracks the 3-phase cycle_compare
  // clock (parallel -> series -> parallel) until grabbed — every other guided state
  // hides this row (visible_controls), so no other override is needed.
  if (ccMode() && hasSlider('cell_topology') && !userTouched['cell_topology'] && curState() && curState().cycle_compare) {
    var ctEl = document.getElementById('pm-sv-cell_topology');
    if (ctEl) { var ctT = ccCombo().phys._ladderTopology; ctEl.textContent = ctT.charAt(0).toUpperCase() + ctT.slice(1); }
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
  // KCL per-state R locks: the slider row shows the pinned state-entry value until grabbed (snap, not glide).
  if (circuitMode() && hasSlider('R1') && !userTouched['R1'] && curState() && typeof curState().R1 === 'number') {
    var r1LEl = document.getElementById('pm-sv-R1');
    if (r1LEl) { var r1Ld = defs.R1 || {}; r1LEl.textContent = fmtNum(cR1()) + (r1Ld.unit ? (' ' + r1Ld.unit) : ''); }
  }
  if (circuitMode() && hasSlider('R2') && !userTouched['R2'] && curState() && typeof curState().R2 === 'number') {
    var r2LEl = document.getElementById('pm-sv-R2');
    if (r2LEl) { var r2Ld = defs.R2 || {}; r2LEl.textContent = fmtNum(cR2()) + (r2Ld.unit ? (' ' + r2Ld.unit) : ''); }
  }
  if (circuitMode() && hasSlider('R3') && !userTouched['R3'] && curState() && typeof curState().R3 === 'number') {
    var r3LEl = document.getElementById('pm-sv-R3');
    if (r3LEl) { var r3Ld = defs.R3 || {}; r3LEl.textContent = fmtNum(cR3()) + (r3Ld.unit ? (' ' + r3Ld.unit) : ''); }
  }
  // KVL (emf-family) slider rows: R2 tracks the S3 autosweep 1->4, R1/R2/R3 show
  // their pinned per-state value until grabbed. emfMode-gated + hasSlider('R1'..)
  // is false for emf_definition (it has only emf/R/switch), so this is inert there.
  if (emfMode() && hasSlider('R2') && !userTouched['R2'] && curState() && curState().r2_autosweep) {
    var r2SwEl = document.getElementById('pm-sv-R2');
    if (r2SwEl) { var r2Sd = defs.R2 || {}; r2SwEl.textContent = fmtNum(cKvlR2()) + (r2Sd.unit ? (' ' + r2Sd.unit) : ''); }
  }
  if (emfMode() && hasSlider('R1') && !userTouched['R1'] && curState() && typeof curState().R1 === 'number') {
    var r1KEl = document.getElementById('pm-sv-R1');
    if (r1KEl) { var r1Kd = defs.R1 || {}; r1KEl.textContent = fmtNum(cKvlR1()) + (r1Kd.unit ? (' ' + r1Kd.unit) : ''); }
  }
  if (emfMode() && hasSlider('R2') && !userTouched['R2'] && curState() && typeof curState().R2 === 'number' && !curState().r2_autosweep) {
    var r2KEl = document.getElementById('pm-sv-R2');
    if (r2KEl) { var r2Kd = defs.R2 || {}; r2KEl.textContent = fmtNum(cKvlR2()) + (r2Kd.unit ? (' ' + r2Kd.unit) : ''); }
  }
  if (emfMode() && hasSlider('R3') && !userTouched['R3'] && curState() && typeof curState().R3 === 'number') {
    var r3KEl = document.getElementById('pm-sv-R3');
    if (r3KEl) { var r3Kd = defs.R3 || {}; r3KEl.textContent = fmtNum(cKvlR3()) + (r3Kd.unit ? (' ' + r3Kd.unit) : ''); }
  }
  if (circuitMode() && hasSlider('switch') && curState() && curState().switch_cycle) {
    var swEl = document.getElementById('pm-sv-switch');       // switch label tracks the S8 auto open/close
    if (swEl) swEl.textContent = cSwitchOpen() ? 'Open' : 'Closed';
  }
  var ro = document.getElementById('pm-readout');
  if (ro) {
    if (ccMode()) {                                           // combination_of_cells: eps_eq, r_eq, V, i (grouped cells)
      var ccRo = ccCombo().phys;
      ro.textContent = '\\u03B5_eq = ' + ccRo.epsEq.toFixed(2) + ' V\\n' +
                       'r_eq = ' + ccRo.rEq.toFixed(2) + ' \\u03A9\\n' +
                       'V = ' + ccRo.V.toFixed(2) + ' V\\n' +
                       'i = ' + ccRo.i.toFixed(2) + ' A';
    } else if (irMode()) {                                    // internal_resistance: eps, r, V, i (real cell)
      var ic2 = irCurrents();
      ro.textContent = '\\u03B5 = ' + ic2.eps.toFixed(1) + ' V\\n' +
                       'r = ' + ic2.r.toFixed(1) + ' \\u03A9\\n' +
                       'V = ' + ic2.Vterm.toFixed(2) + ' V\\n' +
                       'i = ' + ic2.i.toFixed(2) + ' A';
    } else if (emfMode()) {
      var stEr = curState();
      if (stEr && stEr.kvl_multi_ladder) {                    // KVL: eps, the single loop current, and the SIGNED loop sum (= 0)
        var kc = cKvlCurrents();
        ro.textContent = '\\u03B5 = ' + kc.eps.toFixed(1) + ' V\\n' +
                         'i = ' + kc.i.toFixed(2) + ' A\\n' +
                         '\\u03A3V = ' + kc.kvl_sum.toFixed(1) + ' V';
      } else {                                                 // emf_definition: eps, terminal V, i (ideal cell -> V = eps)
        var ec = emfCurrents();
        ro.textContent = '\\u03B5 = ' + ec.eps.toFixed(1) + ' V\\n' +
                         'V = ' + ec.Vterm.toFixed(2) + ' V\\n' +
                         'i = ' + ec.i.toFixed(2) + ' A';
      }
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
      var stC = curState();
      if (stC && pfWgVis('kcl_sum', stC.kcl_sum_readout)) {                       // KCL: A_in = A_out is the instrument story (R_eq off-canvas by design)
        ro.textContent = 'A_in = ' + cc.itot.toFixed(1) + ' A\\n' +
                         'A_out = ' + cc.itot.toFixed(1) + ' A';
      } else {
        ro.textContent = (cc.topo === 'series' ? 'Series' : 'Parallel') + '\\n' +
                         'R_eq = ' + fmtNum(cc.Req) + ' \\u03A9\\n' +
                         'i = ' + cc.itot.toFixed(2) + ' A';
      }
    } else if (hasSlider('material')) {                       // resistivity: R, rho, i (independently glowable)
      var iAm = realCurrent();
      var Rval = realResistance();
      ro.innerHTML =
        '<span id="pm-ro-r">R = ' + (Rval > 1e-9 ? Rval.toFixed(3) + ' \\u03A9' : '\\u2013') + '</span>\\n' +
        '<span id="pm-ro-rho">\\u03C1 = ' + curRho().toExponential(2) + ' \\u03A9\\u00B7m</span>\\n' +
        '<span id="pm-ro-i">i = ' + iAm.toFixed(2) + ' A</span>';
    } else if (gasMode()) {
      // gas_box owns its instruments on the canvas (pressure / thermometer /
      // gas-law chips, Rule 33d), so the DOM readout has nothing to add.
      // It must early-out ABOVE the Ohm's-law branch below: that branch keys off
      // a slider literally named 'V' or 'R', and this concept's Volume slider is
      // 'V' — which printed "V = 1.00 V / i = 59.71 A / R = 0.02 Ohm" onto a
      // kinetic-theory gas box, in the live product, not just in captures.
      ro.textContent = '';
      ro.style.display = 'none';
      return;
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

// ── kirchhoff_loop_rule_KVL physics (emf-family) — one IDEAL cell driving 2-3
// SERIES resistors around a single loop. i = eps / SumR (one value everywhere —
// series, no split); each drop Vk = i*Rk; the SIGNED loop sum eps - SumVk === 0
// by construction (this IS the taught rule, not a coincidence). Gated entirely
// behind st.kvl_multi_ladder so emf_definition renders byte-identical (it never
// sets R1/R2/R3 nor the KVL flags). Per-state R locks (st.R1/R2/R3) snap on entry
// and stay teacher-seizable (userTouched); S3's r2_autosweep glides R2 1->4 (the
// CAUSE, Rule 32a); S4's r3_draw_in adds R3 to the loop mid-state.
function cKvlR1() {
  var st = curState();
  if (st && typeof st.R1 === 'number' && !userTouched['R1']) return st.R1;
  return hasSlider('R1') ? sliderVal('R1') : physConst('R1', 2);
}
function cKvlR2() {
  var st = curState();
  if (st && st.r2_autosweep && !userTouched['R2']) {          // S3: R2 grows 1->4 ohm (the cause)
    var start = 1000, dur = 3100;
    var r2a = (typeof st.R2 === 'number') ? st.R2 : (hasSlider('R2') ? sliderDefault('R2') : 1);
    var r2b = (st.r2_autosweep_to !== undefined) ? st.r2_autosweep_to : 4;
    return r2a + (r2b - r2a) * constrain((PM_simTimeMs - start) / dur, 0, 1);
  }
  if (st && typeof st.R2 === 'number' && !userTouched['R2']) return st.R2;
  return hasSlider('R2') ? sliderVal('R2') : physConst('R2', 1);
}
function cKvlR3() {
  var st = curState();
  if (st && typeof st.R3 === 'number' && !userTouched['R3']) return st.R3;
  return hasSlider('R3') ? sliderVal('R3') : physConst('R3', 3);
}
// Is R3 part of the loop right now? S4 flips it in at the r3_draw_in cue (~900ms);
// S5 authors three_resistor:true directly; S1-S3 leave it false (R3 undrawn).
function cKvlThree() {
  var st = curState();
  if (!st) return false;
  if (st.r3_draw_in) return !!userTouched['R3'] || PM_simTimeMs >= 900;
  return !!st.three_resistor;
}
// R3's draw-in animation factor 0..1 (S4 reveal); 1 whenever R3 is simply present.
function cKvlR3Reveal() {
  var st = curState();
  if (st && st.r3_draw_in && !userTouched['R3']) return constrain((PM_simTimeMs - 900) / 700, 0, 1);
  return cKvlThree() ? 1 : 0;
}
function cKvlCurrents() {
  var eps = cEmf();
  var R1 = max(cKvlR1(), 1e-6), R2 = max(cKvlR2(), 1e-6);
  var three = cKvlThree();
  var R3 = three ? max(cKvlR3(), 1e-6) : 0;
  var swOpen = emfSwitchOpen();
  var Rtot = R1 + R2 + (three ? R3 : 0);
  var i = swOpen ? 0 : eps / max(Rtot, 1e-6);
  var V1 = i * R1, V2 = i * R2, V3 = three ? i * R3 : 0;
  return { eps: eps, R1: R1, R2: R2, R3: R3, three: three, i: i, swOpen: swOpen,
           V1: V1, V2: V2, V3: V3, kvl_sum: eps - V1 - V2 - V3, Rtot: Rtot };
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
function cR1() { var st = curState(); if (powerMode() && st && typeof st.R1 === 'number') return st.R1; if (circuitMode() && st && typeof st.R1 === 'number' && !userTouched['R1']) return st.R1; return hasSlider('R1') ? sliderVal('R1') : physConst('R1', 6); }
function cR2raw() { var st = curState(); if (powerMode() && st && typeof st.R2 === 'number') return st.R2; if (circuitMode() && st && typeof st.R2 === 'number' && !userTouched['R2']) return st.R2; return hasSlider('R2') ? sliderVal('R2') : physConst('R2', 6); }
// KCL third branch (kirchhoff_junction_rule_KCL S4). Per-state numeric lock in
// circuit mode, teacher-seizable (mirrors cR1/cR2raw); slider R3 or physConst
// fallback otherwise. Only ever read when a state sets st.three_branch.
function cR3() { var st = curState(); if (circuitMode() && st && typeof st.R3 === 'number' && !userTouched['R3']) return st.R3; return hasSlider('R3') ? sliderVal('R3') : physConst('R3', 15); }
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
  if (st0 && st0.three_branch) {                       // KCL S4: a THIRD parallel branch feeds node N
    var R3 = max(cR3(), 1e-6);
    var t1 = V / R1, t2 = swOpen ? 0 : V / R2, t3 = swOpen ? 0 : V / R3;
    return { topo: 'parallel', three: true, i1: t1, i2: t2, i3: t3, itot: t1 + t2 + t3,
             Req: swOpen ? R1 : 1 / (1 / R1 + 1 / R2 + 1 / R3), V: V, R1: R1, R2: R2, R3: R3 };
  }
  var i1 = V / R1;
  var i2 = swOpen ? 0 : V / R2;
  return { topo: 'parallel', i1: i1, i2: i2, itot: i1 + i2,
           Req: swOpen ? R1 : (R1 * R2) / (R1 + R2), V: V, R1: R1, R2: R2 };
}

// ═══ wheatstone_bridge — 'bridge' topology (gated behind cTopology()==='bridge') ══
// A DIAMOND: node A(left) B(top) C(right) D(bottom); arm resistors P(A-B) Q(B-C)
// R(A-D) S(D-C); the cell across the A-C diagonal is routed as an EXTERNAL loop
// below D (never crosses the B-D chord); a centre-zero galvanometer sits on the
// B-D chord. Every value is a PURE function of the live P/Q/R/S/emf, and every
// field is opt-in — a state WITHOUT topology:'bridge' never touches any of this,
// so series/parallel/KCL render byte-identical. Per-state override -> slider ->
// default (teacher-seizable via userTouched, reset per state on entry) mirrors the
// KCL cR1/cR2 per-state lock. Two clock-driven sweeps mirror r2_autosweep. All
// numeric comparisons use the ratio TOLERANCE (bridge_calibration.ratio_tolerance),
// never strict equality (the S5 explore sandbox may sit slightly off the null).
function bpvl(key, fb) { return (config && config.pvl_colors && config.pvl_colors[key]) ? config.pvl_colors[key] : fb; }
function bcal(key, fb) { return (config && config.bridge_calibration && typeof config.bridge_calibration[key] === 'number') ? config.bridge_calibration[key] : fb; }
function bridgeTol() { return bcal('ratio_tolerance', 0.01); }
function cBridgeP() { var st = curState(); if (st && typeof st.P === 'number' && !userTouched['P']) return st.P; return hasSlider('P') ? sliderVal('P') : 10; }
function cBridgeQ() { var st = curState(); if (st && typeof st.Q === 'number' && !userTouched['Q']) return st.Q; return hasSlider('Q') ? sliderVal('Q') : 20; }
function cBridgeS() { var st = curState(); if (st && typeof st.S === 'number' && !userTouched['S']) return st.S; return hasSlider('S') ? sliderVal('S') : 6; }
// R: state entry value -> optional clock sweep -> slider. The sweep is a pure fn of
// PM_simTimeMs so home-pose reset (t=0) reads the ENTRY value with no special case
// (never a hardcoded post-sweep constant), and SET_TIME_FREEZE re-sims identically.
function cBridgeR() {
  var st = curState();
  if (st && st.bridge_r_sweep && !userTouched['R']) {
    var start = (typeof st.bridge_r_sweep_start_ms === 'number') ? st.bridge_r_sweep_start_ms : 900;
    var dur = (typeof st.bridge_r_sweep_duration_ms === 'number') ? st.bridge_r_sweep_duration_ms : 800;
    var a = (typeof st.R === 'number') ? st.R : (hasSlider('R') ? sliderDefault('R') : 3);
    var b = (typeof st.bridge_r_sweep_to === 'number') ? st.bridge_r_sweep_to : a;
    return a + (b - a) * constrain((PM_simTimeMs - start) / max(dur, 1), 0, 1);
  }
  if (st && typeof st.R === 'number' && !userTouched['R']) return st.R;
  return hasSlider('R') ? sliderVal('R') : 3;
}
function cBridgeEmf() {
  var st = curState();
  if (st && st.bridge_emf_sweep && !userTouched['emf']) {
    var start = (typeof st.bridge_emf_sweep_start_ms === 'number') ? st.bridge_emf_sweep_start_ms : 900;
    var dur = (typeof st.bridge_emf_sweep_duration_ms === 'number') ? st.bridge_emf_sweep_duration_ms : 1400;
    var a = (typeof st.emf === 'number') ? st.emf : (hasSlider('emf') ? sliderDefault('emf') : 6);
    var b = (typeof st.bridge_emf_sweep_to === 'number') ? st.bridge_emf_sweep_to : a;
    return a + (b - a) * constrain((PM_simTimeMs - start) / max(dur, 1), 0, 1);
  }
  if (st && typeof st.emf === 'number' && !userTouched['emf']) return st.emf;
  return hasSlider('emf') ? sliderVal('emf') : 6;
}
// Divider-idealization physics: away from balance the galvanometer is treated as
// high-R, so i1/i2 use the simple open-circuit divider currents; AT balance i_g = 0
// is EXACT for any galvanometer resistance (V_B = V_D => zero PD across the branch).
function bridgePhysics() {
  var P = max(cBridgeP(), 1e-6), Q = max(cBridgeQ(), 1e-6);
  var R = max(cBridgeR(), 1e-6), S = max(cBridgeS(), 1e-6);
  var emf = cBridgeEmf();
  var VB = emf * Q / (P + Q);          // top midpoint (upper divider)
  var VD = emf * S / (R + S);          // bottom midpoint (lower divider)
  var i1 = emf / (P + Q);              // upper path A->P->B->Q->C
  var i2 = emf / (R + S);              // lower path A->R->D->S->C
  var gap = (P / Q) - (R / S);         // ratio mismatch (0 <=> balanced)
  return { P: P, Q: Q, R: R, S: S, emf: emf, VB: VB, VD: VD, i1: i1, i2: i2,
           gap: gap, balanced: abs(gap) < bridgeTol() };
}
function bridgeNeedleDeg(bp) {
  var k = bcal('needle_deg_per_volt', 25), mx = bcal('needle_max_deg', 60);
  return constrain(k * (bp.VD - bp.VB), -mx, mx);   // centre-zero, deg from straight-up
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
  var g = { leftX: leftX, rightX: rightX, topY: topY, botY: botY, midY: midY,
           jLx: leftX + span * 0.26, jRx: leftX + span * 0.74, gap: height * 0.115,
           sR1: { x: leftX + span * 0.34, y: topY }, sR2: { x: leftX + span * 0.64, y: topY },
           pRx: leftX + span * 0.50, amMain: { x: (leftX + rightX) / 2, y: botY } };
  var st = curState();
  if (st && st.three_branch) {                         // KCL S4: three legible parallel lanes
    g.three = true;
    g.laneY = [topY - g.gap, topY, topY + g.gap];       // R1 top / R2 spine / R3 bottom
  }
  if (st && st.kvl_multi_ladder) {                     // KVL: 2-3 SERIES resistors at FIXED home slots (Rule 32d — S4 only ADDS R3, no teleport)
    g.kvlLoop = true;
    g.sR1 = { x: leftX + span * 0.28, y: topY };
    g.sR2 = { x: leftX + span * 0.50, y: topY };
    g.sR3 = { x: leftX + span * 0.72, y: topY };
  }
  return g;
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
  var out = { g: g,
    series: [batt, { x: g.leftX, y: g.topY }, { x: g.rightX, y: g.topY }, { x: g.rightX, y: g.botY }, { x: g.leftX, y: g.botY }, batt],
    loop1: inSeg.concat(b1, outSeg), loop2: inSeg.concat(b2, outSeg) };
  if (g.three) {                                        // KCL S4: middle lane rides the spine (topY), bottom lane stays topY + gap
    var bMid = [{ x: g.jLx, y: g.topY }, { x: g.jRx, y: g.topY }];
    out.loop2 = inSeg.concat(bMid, outSeg);
    out.loop3 = inSeg.concat(b2, outSeg);
  }
  return out;
}

// ── beads (fixed phase spread; branch chosen by live current fraction) ──────
function circuitInitBeads() {
  var r = mulberry32(PHYS_SEED + 7); circuitBeadPhase = [];
  for (var i = 0; i < circuitBeadCount(); i++) circuitBeadPhase.push(r());
}
function circuitBeadLoop(i, c) {
  if (c.topo === 'series' || c.itot <= 1e-9) return 'series';
  var lane = (i + 0.5) / circuitBeadCount();
  if (c.three) {                                       // KCL S4: split by cumulative current fraction (conductance)
    var f1 = c.i1 / c.itot, f2 = (c.i1 + c.i2) / c.itot;
    return (lane < f1) ? 'loop1' : (lane < f2 ? 'loop2' : 'loop3');
  }
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
    // Casing outline is a CENTER-mode rect(bx-2, by-6, 34, 62) -> its left edge sits
    // at bx-19; the stock label (right-aligned at bx-20) cleared it by just 1px,
    // messy but tolerable for internal_resistance's single-cell layout. combination_
    // of_cells' multi-cell composites (a 2nd/3rd cell icon drawn close by) made that
    // 1px margin read as clipped in every multi-cell state (eye-walker: combo_cells_
    // r_label_clips_casing_outline). rr.multiCellClear (set only by ccDrawCells, for
    // n>1 cells) nudges it 8px further left; every other caller (unset) is unchanged.
    var rLabelX = bx - 20 - (rr.multiCellClear ? 8 : 0);
    noStroke(); fillHex('#FF8A65', 0.95 * rDim); textSize(10); textStyle(BOLD); textAlign(RIGHT, CENTER);
    text('r = ' + rr.r.toFixed(1) + ' \\u03A9', rLabelX, byT + 2);   // left of the cell (right of it sits the voltmeter)
    if (rr.i > 0.02) {
      fillHex('#FFAB91', 0.9 * rDim); textSize(10); textAlign(RIGHT, CENTER);
      text('i\\u00B7r = ' + (rr.i * rr.r).toFixed(2) + ' V', rLabelX, byT - 12);
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
  var L3 = loops.loop3 ? polyLen(loops.loop3) : L2;
  noStroke();
  for (var i = 0; i < N; i++) {
    var lp = circuitBeadLoop(i, c);
    var pts = (lp === 'series') ? loops.series : (lp === 'loop1' ? loops.loop1 : (lp === 'loop3' ? loops.loop3 : loops.loop2));
    var tot = (lp === 'series') ? Ls : (lp === 'loop1' ? L1 : (lp === 'loop3' ? L3 : L2));
    var p = polyAt(pts, tot, circuitBeadS(i, c));
    fillHex(col, 0.28 * eDim); ellipse(p.x, p.y, sz * 2.1);
    fillHex(col, 0.95 * eDim); ellipse(p.x, p.y, sz);
  }
}
// KCL struck-through ghost: a FIXED authored string (never computed) drawn with a
// red line through it — the naive expectation ('1.0 + 1.0') the state refutes.
function drawStruckTextC(cx, cy, str, dim) {
  textSize(15); textStyle(BOLD); textAlign(CENTER, CENTER);
  fillHex('#90A4AE', 0.85 * dim); text(str, cx, cy);
  var w = textWidth(str);
  strokeHex('#EF5350', 0.95 * dim); strokeWeight(2); line(cx - w / 2 - 4, cy, cx + w / 2 + 4, cy);
  noStroke(); textStyle(NORMAL);
}
function drawCircuit() {
  if (cTopology() === 'wire') { drawWireScenario(); return; }       // potentiometer — bypasses series/parallel geometry
  if (cTopology() === 'bridge') { drawBridgeScenario(); return; }   // wheatstone_bridge — bypasses series/parallel geometry
  if (cTopology() === 'meter_bridge') { drawMeterBridgeScenario(); return; }  // meter_bridge — slide-wire Wheatstone hybrid
  var c = cCurrents(), loops = circuitLoops(), g = loops.g;
  var st = curState();
  var wcol = '#546E7A';
  if (c.topo === 'series') { drawWireC(loops.series, wcol, 0.85, 3); }
  else {
    drawWireC(loops.loop1, wcol, 0.85, 3); drawWireC(loops.loop2, wcol, 0.85, 3);
    if (loops.loop3) drawWireC(loops.loop3, wcol, 0.85, 3);   // KCL S4: third branch wire
    var jDim = dimFor('junction');
    fillHex('#4DD0E1', 0.95 * jDim); noStroke(); ellipse(g.jLx, g.topY, 11); ellipse(g.jRx, g.topY, 11);
    if (st && typeof st.node_label === 'string') {            // KCL: label the junction node (reuses junction glow key)
      fillHex('#4DD0E1', 0.98 * jDim); textSize(14); textStyle(BOLD); textAlign(CENTER, BOTTOM);
      text(st.node_label, g.jLx, g.topY - 16); textStyle(NORMAL);
    }
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
  } else if (c.three) {   // KCL S4: three parallel resistor boxes (R1 top / R2 spine / R3 bottom)
    drawResistorBoxC(g.pRx, g.topY - g.gap, 'R1 = ' + fmtNum(c.R1) + ' \\u03A9', rDim);
    drawResistorBoxC(g.pRx, g.topY,         'R2 = ' + fmtNum(c.R2) + ' \\u03A9', rDim);
    drawResistorBoxC(g.pRx, g.topY + g.gap, 'R3 = ' + fmtNum(c.R3) + ' \\u03A9', rDim);
  } else {
    drawResistorBoxC(g.pRx, g.topY - g.gap, 'R1 = ' + fmtNum(c.R1) + ' \\u03A9', rDim);
    drawResistorBoxC(g.pRx, g.topY + g.gap, 'R2 = ' + fmtNum(c.R2) + ' \\u03A9', rDim);
  }
  drawBatteryC(g, c.V, 1);
  if (st && (st.switch_cycle || hasSlider('switch'))) drawSwitchC(g, cSwitchOpen(), c.topo, dimFor('switch'));
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.itot, (st && st.main_meter_label) ? st.main_meter_label : 'AMMETER', dimFor('ammeter_total'), 26);
  if (st && st.show_in_meter) {   // KCL: A_in on the in-segment before the fork — reads the SAME itot as A_out (taught invariant)
    drawAmmeterAtC((g.leftX + g.jLx) / 2, g.topY - 30, c.itot, (st.in_meter_label || 'A_in'), dimFor('ammeter_total'), 16);
  }
  if (st && st.show_branch_meters && c.topo === 'parallel') {
    var bDim = dimFor('ammeter_branches');
    var bl = (st.branch_labels && st.branch_labels.length) ? st.branch_labels : null;
    if (c.three) {   // KCL S4: three branch ammeters (top / spine / bottom)
      drawAmmeterAtC(g.jRx + 46, g.topY - g.gap, c.i1, bl ? bl[0] : 'A1', bDim, 17);
      drawAmmeterAtC(g.jRx + 46, g.topY,         c.i2, bl ? bl[1] : 'A2', bDim, 17);
      drawAmmeterAtC(g.jRx + 46, g.topY + g.gap, c.i3, bl ? bl[2] : 'A3', bDim, 17);
    } else {
      drawAmmeterAtC(g.jRx + 46, g.topY - g.gap, c.i1, bl ? bl[0] : 'A1', bDim, 17);
      drawAmmeterAtC(g.jRx + 46, g.topY + g.gap, c.i2, bl ? bl[1] : 'A2', bDim, 17);
    }
  }
  if (st && st.in_line_meters && c.topo === 'series') {
    var iDim = dimFor('ammeter_branches');
    drawAmmeterAtC(g.leftX + (g.rightX - g.leftX) * 0.18, g.topY - 38, c.itot, 'A1', iDim, 14);
    drawAmmeterAtC(g.leftX + (g.rightX - g.leftX) * 0.49, g.topY - 38, c.itot, 'A2', iDim, 14);
    drawAmmeterAtC(g.leftX + (g.rightX - g.leftX) * 0.80, g.topY - 38, c.itot, 'A3', iDim, 14);
  }
  if (st && pfWgVis('req_box', st.show_req_box)) {
    var qDim = dimFor('req_box'), qx = g.pRx, qy = (c.topo === 'parallel') ? g.topY : g.topY - 44;
    rectMode(CENTER); fillHex('#0A0A1A', 0.88 * qDim); noStroke(); rect(qx, qy, 132, 34, 6);
    strokeHex('#66BB6A', 0.95 * qDim); strokeWeight(2); noFill(); rect(qx, qy, 132, 34, 6); rectMode(CORNER); noStroke();
    fillHex('#66BB6A', 0.98 * qDim); textSize(14); textStyle(BOLD); textAlign(CENTER, CENTER);
    text('R_eq = ' + fmtNum(c.Req) + ' \\u03A9', qx, qy); textStyle(NORMAL);
  }
  // KCL live sum readout (value-only HUD, Rule 34b) — the branch currents adding
  // back to itot. Auto-formats for 2 or 3 branches. Numbers only; the symbolic
  // Sigma-i_in = Sigma-i_out lives in the DOM formula surface.
  if (st && pfWgVis('kcl_sum', st.kcl_sum_readout)) {
    var kDim = dimFor('formula');
    var nums = c.three
      ? (c.i1.toFixed(1) + ' + ' + c.i2.toFixed(1) + ' + ' + c.i3.toFixed(1))
      : (c.i1.toFixed(1) + ' + ' + c.i2.toFixed(1));
    var kstr = nums + ' = ' + c.itot.toFixed(1) + ' A';
    var kx = width * 0.30, ky = height * 0.87, kw = 224, kh = 34;
    rectMode(CENTER); fillHex('#0A0A1A', 0.88 * kDim); noStroke(); rect(kx, ky, kw, kh, 6);
    strokeHex('#4DD0E1', 0.95 * kDim); strokeWeight(2); noFill(); rect(kx, ky, kw, kh, 6); rectMode(CORNER); noStroke();
    fillHex('#FFFFFF', 0.98 * kDim); textSize(15); textStyle(BOLD); textAlign(CENTER, CENTER);
    text(kstr, kx, ky); textStyle(NORMAL);
  }
  // KCL naive-expectation ghost (S3) — fixed string, struck through, placed beside
  // the live sum. Position config-driven (normalized 0..1); defaults above the sum box.
  if (st && typeof st.ghost_text === 'string') {
    var gx = (st.ghost_pos && typeof st.ghost_pos.x === 'number') ? st.ghost_pos.x * width : width * 0.30;
    var gy = (st.ghost_pos && typeof st.ghost_pos.y === 'number') ? st.ghost_pos.y * height : height * 0.80;
    drawStruckTextC(gx, gy, st.ghost_text, dimFor('formula'));
  }
}
// ═══ wheatstone_bridge — the diamond bridge render path (topology:'bridge') ══════
// Self-contained: bypasses the series/parallel geometry entirely (invoked from the
// top of drawCircuit). Node layout (fractions of the fill-viewport canvas W x H):
//   A(left)  0.28W,0.46H   B(top)   0.48W,0.20H
//   C(right) 0.68W,0.46H   D(bottom)0.48W,0.72H
// The galvanometer sits at the B-D midpoint (0.48W,0.46H = diamond centre); the
// cell rides an EXTERNAL loop along y=0.88H (below D) so it never crosses B-D.
function bridgeNodes() {
  var W = width, H = height;
  var nd = {
    A: { x: W * 0.28, y: H * 0.46 }, B: { x: W * 0.48, y: H * 0.20 },
    C: { x: W * 0.68, y: H * 0.46 }, D: { x: W * 0.48, y: H * 0.72 },
    extRx: W * 0.82, extLx: W * 0.14, extY: H * 0.88, battX: W * 0.48
  };
  // external return polyline: C -> right -> down -> battery -> left -> up -> A
  nd.extBack = [
    { x: nd.extRx, y: nd.C.y }, { x: nd.extRx, y: nd.extY },
    { x: nd.battX, y: nd.extY }, { x: nd.extLx, y: nd.extY },
    { x: nd.extLx, y: nd.A.y }, nd.A
  ];
  return nd;
}
// Two divider loops (A->B->C->ext->A and A->D->C->ext->A) share the external return,
// so the return segment naturally carries i1+i2 while each arm carries its own i.
// Bead COUNT per loop is proportional to that loop's current fraction (density ∝ i)
// and SPEED is proportional to that loop's current — both pure fns of PM_simTimeMs.
function drawBridgeBeads(nd, bp) {
  var N = circuitBeadCount(), eDim = dimFor('electrons');
  var col = (config.particles && config.particles.color) ? config.particles.color : '#42A5F5';
  var sz = (config.particles && config.particles.size) ? config.particles.size : 7;
  var loopU = [nd.A, nd.B, nd.C].concat(nd.extBack);
  var loopL = [nd.A, nd.D, nd.C].concat(nd.extBack);
  var LU = polyLen(loopU), LL = polyLen(loopL);
  var i1 = bp.i1, i2 = bp.i2, itot = i1 + i2;
  var fU = (itot > 1e-9) ? i1 / itot : 0.5;                       // fraction of beads on the upper loop
  var spU = constrain(i1 / 0.4, 0.3, 3.0), spL = constrain(i2 / 0.4, 0.3, 3.0);
  noStroke();
  for (var k = 0; k < N; k++) {
    var lane = (k + 0.5) / N, onU = lane < fU;
    var pts = onU ? loopU : loopL, tot = onU ? LU : LL, sp = onU ? spU : spL;
    var s = (circuitBeadPhase[k] + CIRCUIT_BEAD_RATE * (PM_simTimeMs / 1000) * sp) % 1;
    var p = polyAt(pts, tot, s);
    fillHex(col, 0.26 * eDim); ellipse(p.x, p.y, sz * 2.1);
    fillHex(col, 0.95 * eDim); ellipse(p.x, p.y, sz);
  }
}
// Bridge-wire (galvanometer branch) beads on B-D. Direction = sign(V_B - V_D)
// (current leaves the HIGHER-potential midpoint); count (density) and speed ∝
// |V_D - V_B|; EXACTLY zero at balance (V_B = V_D). Pure fn of PM_simTimeMs. The
// galvanometer disc is drawn AFTER these, hiding the mid-chord beads behind it.
function drawBridgeWireBeads(nd, bp) {
  var dv = bp.VB - bp.VD, mag = abs(dv);
  if (mag < 1e-4) return;                                         // balance -> the meter branch is empty
  var eDim = dimFor('electrons');
  var col = (config.particles && config.particles.color) ? config.particles.color : '#42A5F5';
  var sz = (config.particles && config.particles.size) ? config.particles.size : 7;
  var path = (dv >= 0) ? [nd.B, nd.D] : [nd.D, nd.B];            // from higher midpoint to lower
  var L = polyLen(path), nBW = ceil(constrain(mag / 1.0, 0, 1) * 6);
  if (nBW < 1) nBW = 1;
  var sp = constrain(mag / 0.5, 0.4, 2.5);
  noStroke();
  for (var b = 0; b < nBW; b++) {
    var s = (b / nBW + CIRCUIT_BEAD_RATE * 2 * (PM_simTimeMs / 1000) * sp) % 1;
    var p = polyAt(path, L, s);
    fillHex(col, 0.30 * eDim); ellipse(p.x, p.y, sz * 1.8);
    fillHex(col, 0.95 * eDim); ellipse(p.x, p.y, sz * 0.95);
  }
}
// Centre-zero galvanometer dial — a NEW primitive. Needle angle measured from
// straight-up dead-centre (0 = null); positive tilts right. Honors the 'galvanometer'
// glow key via the dim mult passed in.
function drawGalvanometerC(gx, gy, gR, needleDeg, label, dim) {
  var bodyCol = bpvl('galvanometer', '#FF8A65'), nCol = bpvl('galvanometer_needle', '#FF5252');
  noStroke(); fill(10, 12, 28, 232 * dim); ellipse(gx, gy, gR * 2.2, gR * 2.2);
  strokeHex(bodyCol, 0.9 * dim); strokeWeight(2); noFill(); ellipse(gx, gy, gR * 2.2, gR * 2.2);
  for (var d = -60; d <= 60; d += 30) {                          // centre-zero tick scale
    var th = radians(d);
    var x1 = gx + sin(th) * gR * 0.70, y1 = gy - cos(th) * gR * 0.70;
    var x2 = gx + sin(th) * gR * 0.92, y2 = gy - cos(th) * gR * 0.92;
    strokeHex('#B0BEC5', (d === 0 ? 0.95 : 0.55) * dim); strokeWeight(d === 0 ? 2 : 1.5); line(x1, y1, x2, y2);
  }
  noStroke();
  var nt = radians(needleDeg);                                   // 0 = straight up
  strokeHex(nCol, 0.98 * dim); strokeWeight(3);
  line(gx, gy, gx + sin(nt) * gR * 0.84, gy - cos(nt) * gR * 0.84);
  noStroke(); fillHex(nCol, 0.98 * dim); ellipse(gx, gy, 6);
  fillHex('#B0BEC5', 0.7 * dim); textSize(9); textStyle(NORMAL); textAlign(CENTER, BOTTOM);
  text('0', gx, gy - gR * 0.96);
  fillHex('#80DEEA', 0.92 * dim); textSize(11); textStyle(BOLD); textAlign(CENTER, TOP);
  text(label || 'G', gx, gy + gR * 0.55); textStyle(NORMAL);
}
function drawBridgeBattery(nd, emf, dim) {
  var bx = nd.battX, by = nd.extY, col = bpvl('battery', '#FFD54F');
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(bx - 6, by - 15, bx - 6, by + 15);  // + plate (long) toward A
  strokeWeight(6); line(bx + 8, by - 8, bx + 8, by + 8);                                       // - plate (short) toward C
  noStroke(); fillHex(col, 0.98 * dim); textSize(12); textStyle(BOLD); textAlign(CENTER, TOP);
  text('\\u03B5 = ' + emf.toFixed(1) + ' V', bx, by + 12); textStyle(NORMAL);
}
function drawBridgeNodes(nd, st) {
  var col = bpvl('node_dot', '#80CBC4'), jDim = dimFor('junction');
  var fs = focalSet(), junctionFocal = !!(fs && fs['junction']);   // S1: node A is the current-split focal
  var labs = (st && st.node_dot_labels && st.node_dot_labels.length >= 4) ? st.node_dot_labels : ['A', 'B', 'C', 'D'];
  var pts = [nd.A, nd.B, nd.C, nd.D];
  var lx = [-14, 0, 14, 0], ly = [0, -15, 0, 15];
  var ax = [RIGHT, CENTER, LEFT, CENTER], ay = [CENTER, BOTTOM, CENTER, TOP];
  if (junctionFocal) {                                             // Rule 29: emphasize A by brightness (glow halo), not size
    fillHex(col, 0.15); noStroke(); ellipse(pts[0].x, pts[0].y, 34);
    fillHex(col, 0.28); noStroke(); ellipse(pts[0].x, pts[0].y, 22);
  }
  for (var i = 0; i < 4; i++) {
    var nodeDim = (junctionFocal && i !== 0) ? dimLevel() : jDim;  // focal A bright, peer nodes dim (Rule 29)
    fillHex(col, 0.95 * nodeDim); noStroke(); ellipse(pts[i].x, pts[i].y, 11);
    fillHex(col, 0.98 * nodeDim); textSize(13); textStyle(BOLD); textAlign(ax[i], ay[i]);
    text(labs[i], pts[i].x + lx[i], pts[i].y + ly[i]); textStyle(NORMAL);
  }
}
// value-only chip (Rule 34b/d) — always legible (not tied to a glow focal).
function drawBridgeChip(cx, cy, str, col, ts) {
  textSize(ts); textStyle(BOLD); textAlign(CENTER, CENTER);
  var w = textWidth(str) + 16;
  rectMode(CENTER); fill(10, 12, 28, 220); noStroke(); rect(cx, cy, w, ts + 10, 5);
  strokeHex(col, 0.6); strokeWeight(1); noFill(); rect(cx, cy, w, ts + 10, 5); rectMode(CORNER); noStroke();
  fillHex(col, 0.98); text(str, cx, cy); textStyle(NORMAL);
}
function drawBridgeScenario() {
  var bp = bridgePhysics(), st = curState(), nd = bridgeNodes();
  var wireCol = bpvl('wire', '#546E7A'), wA = 0.85 * dimFor('wires');
  drawWireC([nd.A, nd.B], wireCol, wA, 3); drawWireC([nd.B, nd.C], wireCol, wA, 3);
  drawWireC([nd.A, nd.D], wireCol, wA, 3); drawWireC([nd.D, nd.C], wireCol, wA, 3);
  drawWireC([nd.C].concat(nd.extBack), wireCol, wA, 3);          // external battery loop
  drawWireC([nd.B, nd.D], wireCol, wA, 3);                       // galvanometer chord (behind the dial)
  drawBridgeBeads(nd, bp);
  if (st && st.show_bridge_wire_beads) drawBridgeWireBeads(nd, bp);
  var rDim = dimFor('resistors');
  drawResistorBoxC((nd.A.x + nd.B.x) / 2, (nd.A.y + nd.B.y) / 2, 'P = ' + fmtNum(bp.P) + ' \\u03A9', rDim);
  drawResistorBoxC((nd.B.x + nd.C.x) / 2, (nd.B.y + nd.C.y) / 2, 'Q = ' + fmtNum(bp.Q) + ' \\u03A9', rDim);
  drawResistorBoxC((nd.A.x + nd.D.x) / 2, (nd.A.y + nd.D.y) / 2, 'R = ' + fmtNum(bp.R) + ' \\u03A9', rDim);
  drawResistorBoxC((nd.D.x + nd.C.x) / 2, (nd.D.y + nd.C.y) / 2, 'S = ' + fmtNum(bp.S) + ' \\u03A9', rDim);
  drawBridgeBattery(nd, bp.emf, dimFor('battery'));
  drawBridgeNodes(nd, st);
  var gcy = (nd.B.y + nd.D.y) / 2, gR = height * 0.075;
  if (pfWgVis('galvanometer', !st || st.show_galvanometer !== false)) {
    drawGalvanometerC(nd.B.x, gcy, gR, bridgeNeedleDeg(bp), (st && st.galvanometer_label) ? st.galvanometer_label : 'G', dimFor('galvanometer'));
    if (st && st.show_ig_zero_label && bp.balanced) {           // literal i_g = 0 — ONLY when live-balanced
      fillHex(bpvl('ratio_hud_ok', '#66BB6A'), 0.98); textSize(14); textStyle(BOLD); textAlign(CENTER, TOP);
      text('i_g = 0', nd.B.x, gcy + gR + 10); textStyle(NORMAL);
    }
  }
  if (st && pfWgVis('node_readouts', st.show_node_readouts)) {
    var nl = (st.node_readout_labels && st.node_readout_labels.length >= 2) ? st.node_readout_labels : ['V_B', 'V_D'];
    var nrCol = bpvl('node_readout', '#B39DDB');
    drawBridgeChip(nd.B.x + width * 0.085, nd.B.y - height * 0.02, nl[0] + ' = ' + bp.VB.toFixed(1) + ' V', nrCol, 12);
    drawBridgeChip(nd.D.x + width * 0.085, nd.D.y + height * 0.02, nl[1] + ' = ' + bp.VD.toFixed(1) + ' V', nrCol, 12);
  }
  if (st && pfWgVis('ratio_hud', st.show_ratio_hud)) {
    var okC = bpvl('ratio_hud_ok', '#66BB6A'), badC = bpvl('ratio_hud_bad', '#EF5350');
    var mark = bp.balanced ? ' \\u2713' : ' \\u2717';           // check / cross
    var rstr = 'P/Q = ' + (bp.P / bp.Q).toFixed(2) + '   vs   R/S = ' + (bp.R / bp.S).toFixed(2) + mark;
    var rc = bp.balanced ? okC : badC;
    textSize(14); textStyle(BOLD); textAlign(LEFT, CENTER);
    var rw = textWidth(rstr) + 16, rx = width * 0.04, ry = height * 0.10;
    rectMode(CORNER); fill(10, 12, 28, 212); noStroke(); rect(rx - 8, ry - 14, rw, 28, 6);
    strokeHex(rc, 0.7); strokeWeight(1.5); noFill(); rect(rx - 8, ry - 14, rw, 28, 6); noStroke();
    fillHex(rc, 0.98); text(rstr, rx, ry); textStyle(NORMAL);
  }
  if (st && st.show_s_readout) {                                 // S = R·(Q/P) — the measured unknown (no emf term)
    var Smeas = bp.R * (bp.Q / bp.P);
    drawBridgeChip(width * 0.48, height * 0.80, 'S = ' + Smeas.toFixed(1) + ' \\u03A9', bpvl('node_readout', '#B39DDB'), 15);
  }
}
// ═══ potentiometer — 'wire' topology (gated behind cTopology()==='wire') ═══════
// A HORIZONTAL potentiometer wire A(left) -> C(right). A driver cell rides an outer
// TOP loop and puts the FULL driver EMF across the wire (idealization: k = eps_d/L
// exactly), so the potential drops LINEARLY along it — a gradient ramp is drawn
// above the wire. A sliding jockey J taps the drop V_AJ = k*l at x = lerp(A,C,l/L);
// a tap branch runs from A down through the tested cell E and the REUSED centre-zero
// galvanometer G up to J. At balance (k*l = E) the tap PD is zero, so tap current is
// EXACTLY zero for any galvanometer resistance and the needle sits dead-centre. Every
// value is a PURE fn of live E/eps_d/l and every field is opt-in — a state WITHOUT
// topology:'wire' never touches any of this, so series/parallel/bridge/KCL/KVL render
// byte-identical. Per-state override -> slider -> default (teacher-seizable via
// userTouched, reset per state) mirrors the bridge cBridge* / KCL cR1 locks. The l
// clock sweep (jockey_sweep) mirrors bridge_r_sweep; L/R_wire/r/Rv are constants read
// from formula_anchor (fallbacks = the concept's declared constants).
function pcal(key, fb) { return (config && config.potentiometer_calibration && typeof config.potentiometer_calibration[key] === 'number') ? config.potentiometer_calibration[key] : fb; }
function cPotE() {
  var st = curState();
  if (st && typeof st.E === 'number' && !userTouched['E']) return st.E;
  return hasSlider('E') ? sliderVal('E') : 1.5;
}
function cPotEpsD() {
  var st = curState();
  if (st && typeof st.eps_d === 'number' && !userTouched['eps_d']) return st.eps_d;
  return hasSlider('eps_d') ? sliderVal('eps_d') : 3;
}
// l: state-entry value -> optional clock sweep -> slider. The sweep is a pure fn of
// PM_simTimeMs so home-pose reset (t=0) reads the ENTRY value with no special case
// (never a hardcoded post-sweep constant), and SET_TIME_FREEZE re-sims identically.
function cPotL() {
  var st = curState();
  if (st && st.jockey_sweep && !userTouched['l']) {
    var start = (typeof st.jockey_sweep_start_ms === 'number') ? st.jockey_sweep_start_ms : 800;
    var dur = (typeof st.jockey_sweep_duration_ms === 'number') ? st.jockey_sweep_duration_ms : 800;
    var a = (typeof st.l === 'number') ? st.l : (hasSlider('l') ? sliderDefault('l') : 0.5);
    var b = (typeof st.jockey_sweep_to === 'number') ? st.jockey_sweep_to : a;
    return a + (b - a) * constrain((PM_simTimeMs - start) / max(dur, 1), 0, 1);
  }
  if (st && typeof st.l === 'number' && !userTouched['l']) return st.l;
  return hasSlider('l') ? sliderVal('l') : 0.5;
}
// Balance tolerance in volts — a grid-exact null (eps_d*l = E on the slider steps)
// falls well inside it; used for the 'exactly zero at balance' tap-current + i=0 gate.
function potTol() { return 0.02; }
function potPhysics() {
  var L = max(physConst('L', 1), 1e-6);
  var Rw = max(physConst('R_wire', 3), 1e-6);
  var E = cPotE(), epsD = cPotEpsD(), l = constrain(cPotL(), 0, L);
  var k = epsD / L, kl = k * l, gap = kl - E;          // gap = tap_gap = k*l - E
  var iWire = epsD / Rw;                                // driver-loop current (flows in EVERY state)
  var kdeg = pcal('needle_deg_per_volt', 60), mxdeg = pcal('needle_max_deg', 60);
  var needle = constrain(kdeg * gap, -mxdeg, mxdeg);   // centre-zero, deg from straight-up
  var r = max(physConst('r', 1), 1e-6), Rv = max(physConst('Rv', 9), 1e-6);
  var Imeter = E / (r + Rv), Vmeter = E - Imeter * r;  // S4 voltmeter contrast
  return { L: L, Rw: Rw, E: E, epsD: epsD, l: l, k: k, kl: kl, gap: gap, iWire: iWire,
           needle: needle, r: r, Rv: Rv, Imeter: Imeter, Vmeter: Vmeter,
           balanced: abs(gap) < potTol() };
}
// Apparatus legibility floor (Rule 32d — the same machine persists, recognizable in
// every state): non-focal structural parts sit at 0.55, the ONE glow focal at 1.0.
function wdim(name) { return max(dimFor(name), 0.55); }
function wireGeom() {
  var W = width, H = height;
  var Ax = W * 0.20, Cx = W * 0.85, wireY = H * 0.50;
  var topY = H * 0.15, lowerY = H * 0.80, span = Cx - Ax;
  var g = potPhysics();
  var Jx = Ax + span * constrain(g.l / g.L, 0, 1);
  var Ey = lerp(wireY, lowerY, 0.30), Gy = lerp(wireY, lowerY, 0.74);
  var gR = H * 0.055, rampMaxPx = H * 0.24;
  var epsMax = (sliderDefs() && sliderDefs().eps_d && sliderDefs().eps_d.max) ? sliderDefs().eps_d.max : 5;
  return { W: W, H: H, Ax: Ax, Cx: Cx, wireY: wireY, topY: topY, lowerY: lowerY, span: span,
           Jx: Jx, Ey: Ey, Gy: Gy, gR: gR, rampMaxPx: rampMaxPx, pxPerVolt: rampMaxPx / max(epsMax, 1e-6), phys: g };
}
// The linear potential-gradient ramp above the wire: height ∝ potential (eps_d at A,
// 0 at C). The A->J sub-region (the tapped drop k*l) is shaded brighter with a jockey
// tick, so the moving jockey visibly grows/shrinks the tapped drop.
function drawGradientRamp(geo) {
  var g = geo.phys, dim = wdim('gradient'), col = bpvl('gradient_ramp', '#4DD0E1');
  var hA = g.epsD * geo.pxPerVolt, hJ = (g.epsD - g.kl) * geo.pxPerVolt;
  noStroke(); fillHex(col, 0.13 * dim);
  triangle(geo.Ax, geo.wireY - hA, geo.Cx, geo.wireY, geo.Ax, geo.wireY);
  fillHex(col, 0.30 * dim);                                       // brighter A->J = the tapped drop
  beginShape();
  vertex(geo.Ax, geo.wireY - hA); vertex(geo.Jx, geo.wireY - hJ);
  vertex(geo.Jx, geo.wireY); vertex(geo.Ax, geo.wireY);
  endShape(CLOSE);
  strokeHex(col, 0.85 * dim); strokeWeight(2); noFill();
  line(geo.Ax, geo.wireY - hA, geo.Cx, geo.wireY);               // ramp top edge
  strokeHex(bpvl('jockey', '#FF7043'), 0.9 * dim); strokeWeight(1.5);
  line(geo.Jx, geo.wireY, geo.Jx, geo.wireY - hJ);               // jockey tick up to the ramp
  noStroke();
}
// Driver stream: beads circulate the full driver loop (across the wire A->C, up and
// back over the top rail). Count (density) + speed ∝ i_wire — flows in EVERY state.
function drawWireDriverBeads(geo) {
  var g = geo.phys, eDim = wdim('electrons');
  var col = (config.particles && config.particles.color) ? config.particles.color : '#42A5F5';
  var sz = (config.particles && config.particles.size) ? config.particles.size : 7;
  var loop = [ { x: geo.Ax, y: geo.wireY }, { x: geo.Cx, y: geo.wireY },
               { x: geo.Cx, y: geo.topY }, { x: geo.Ax, y: geo.topY }, { x: geo.Ax, y: geo.wireY } ];
  var L = polyLen(loop), N = min(circuitBeadCount(), round(constrain(g.iWire, 0.3, 2.0) * 18));
  var sp = constrain(g.iWire, 0.3, 2.5);
  noStroke();
  for (var i = 0; i < N; i++) {
    var s = (circuitBeadPhase[i] + CIRCUIT_BEAD_RATE * (PM_simTimeMs / 1000) * sp) % 1;
    var p = polyAt(loop, L, s);
    fillHex(col, 0.26 * eDim); ellipse(p.x, p.y, sz * 2.1);
    fillHex(col, 0.95 * eDim); ellipse(p.x, p.y, sz);
  }
}
// Tap-branch stream on A -> (E,G) -> J. Direction = sign(gap), density + speed ∝ |gap|,
// EXACTLY zero at balance (never a fabricated off-balance current). The galvanometer
// disc is drawn AFTER, hiding the beads passing behind it.
function drawWireTapBeads(geo) {
  var g = geo.phys, mag = abs(g.gap);
  if (mag < potTol()) return;                                    // balance -> the tap branch is empty
  var eDim = wdim('electrons');
  var col = (config.particles && config.particles.color) ? config.particles.color : '#42A5F5';
  var sz = (config.particles && config.particles.size) ? config.particles.size : 7;
  var path = [ { x: geo.Ax, y: geo.wireY }, { x: geo.Ax, y: geo.lowerY },
               { x: geo.Jx, y: geo.lowerY }, { x: geo.Jx, y: geo.wireY } ];
  var L = polyLen(path), dir = (g.gap >= 0) ? 1 : -1;
  var n = ceil(constrain(mag / 1.0, 0, 1) * 6); if (n < 1) n = 1;
  var sp = constrain(mag / 0.5, 0.4, 2.5);
  noStroke();
  for (var b = 0; b < n; b++) {
    var s = (b / n + dir * CIRCUIT_BEAD_RATE * 2 * (PM_simTimeMs / 1000) * sp) % 1;
    var p = polyAt(path, L, s);
    fillHex(col, 0.30 * eDim); ellipse(p.x, p.y, sz * 1.8);
    fillHex(col, 0.95 * eDim); ellipse(p.x, p.y, sz * 0.95);
  }
}
// S4 voltmeter loop stream: a small loop E <-> voltmeter, density + speed ∝ I_meter.
function drawWireVoltmeterBeads(geo) {
  var g = geo.phys;
  if (g.Imeter < 1e-4) return;
  var eDim = wdim('electrons');
  var col = (config.particles && config.particles.color) ? config.particles.color : '#42A5F5';
  var sz = (config.particles && config.particles.size) ? config.particles.size : 7;
  var vmx = geo.Ax - width * 0.10, vmy = geo.Ey;
  var loop = [ { x: geo.Ax, y: geo.Ey - 10 }, { x: vmx, y: vmy - 12 },
               { x: vmx, y: vmy + 12 }, { x: geo.Ax, y: geo.Ey + 10 } ];
  var L = polyLen(loop), n = ceil(constrain(g.Imeter / 0.3, 0, 1) * 5); if (n < 1) n = 1;
  var sp = constrain(g.Imeter / 0.15, 0.4, 2.0);
  noStroke();
  for (var b = 0; b < n; b++) {
    var s = (b / n + CIRCUIT_BEAD_RATE * 2 * (PM_simTimeMs / 1000) * sp) % 1;
    var p = polyAt(loop, L, s);
    fillHex(col, 0.30 * eDim); ellipse(p.x, p.y, sz * 1.7);
    fillHex(col, 0.95 * eDim); ellipse(p.x, p.y, sz * 0.9);
  }
}
// Driver cell on the top rail (delivers the full eps_d across the wire).
function drawWireDriverCell(geo) {
  var g = geo.phys, dim = wdim('driver_cell'), bx = (geo.Ax + geo.Cx) / 2, by = geo.topY;
  var col = bpvl('driver_cell', '#FFD54F');
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(bx - 8, by - 14, bx - 8, by + 14);   // + plate (long)
  strokeWeight(6); line(bx + 8, by - 8, bx + 8, by + 8);                                         // - plate (short)
  noStroke(); fillHex(col, 0.98 * dim); textSize(12); textStyle(BOLD); textAlign(CENTER, BOTTOM);
  text('\\u03B5_d = ' + g.epsD.toFixed(1) + ' V', bx, by - 12); textStyle(NORMAL);
}
// Tested cell E on the left riser (horizontal plates on a vertical wire).
function drawWireTestedCell(geo) {
  var dim = wdim('tested_cell'), bx = geo.Ax, by = geo.Ey, col = bpvl('tested_cell', '#FFB74D');
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(bx - 14, by - 6, bx + 14, by - 6);    // + plate (long)
  strokeWeight(6); line(bx - 8, by + 6, bx + 8, by + 6);                                          // - plate (short)
  noStroke(); fillHex(col, 0.98 * dim); textSize(11); textStyle(BOLD); textAlign(LEFT, CENTER);
  text('E', bx + 16, by); textStyle(NORMAL);
}
// Sliding jockey contact — a triangle sitting on the wire at x = lerp(A,C,l/L).
function drawJockey(geo) {
  var dim = wdim('jockey'), col = bpvl('jockey', '#FF7043'), jx = geo.Jx, jy = geo.wireY;
  fillHex(col, 0.95 * dim); noStroke();
  triangle(jx, jy, jx - 7, jy - 16, jx + 7, jy - 16);
  fillHex(col, 0.98 * dim); textSize(11); textStyle(BOLD); textAlign(CENTER, BOTTOM);
  text('J', jx, jy - 18); textStyle(NORMAL);
}
function drawWireNodeLabels(geo) {
  var dim = wdim('wires'), lc = bpvl('labels', '#D4D4D8');
  fillHex(bpvl('node_dot', '#80CBC4'), 0.9 * dim); noStroke();
  ellipse(geo.Ax, geo.wireY, 9); ellipse(geo.Cx, geo.wireY, 9);
  fillHex(lc, 0.95 * dim); textSize(13); textStyle(BOLD);
  textAlign(RIGHT, CENTER); text('A', geo.Ax - 8, geo.wireY - 12);
  textAlign(LEFT, CENTER); text('C', geo.Cx + 8, geo.wireY - 12);
  textStyle(NORMAL);
}
// S4 voltmeter across the tested cell — REUSES drawVoltmeterC (reads V_meter = E - I*r).
function drawWireVoltmeter(geo) {
  var g = geo.phys, dim = wdim('voltmeter'), vmx = geo.Ax - width * 0.10, vmy = geo.Ey;
  strokeHex('#B39DDB', 0.7 * dim); strokeWeight(1.5);
  line(geo.Ax, geo.Ey - 8, vmx, vmy - 14); line(geo.Ax, geo.Ey + 8, vmx, vmy + 14);
  noStroke();
  drawVoltmeterC(vmx, vmy, g.Vmeter, g.E, dim);
}
function drawWireScenario() {
  var geo = wireGeom(), g = geo.phys, st = curState();
  var wireCol = bpvl('wire', '#546E7A'), wA = 0.85 * wdim('wires');
  if (st && st.show_gradient_ramp) drawGradientRamp(geo);
  drawWireC([ { x: geo.Ax, y: geo.wireY }, { x: geo.Cx, y: geo.wireY } ], wireCol, wA, 3);                       // the potentiometer wire A->C
  drawWireC([ { x: geo.Ax, y: geo.wireY }, { x: geo.Ax, y: geo.topY }, { x: geo.Cx, y: geo.topY }, { x: geo.Cx, y: geo.wireY } ], wireCol, wA, 3);  // driver outer loop
  drawWireC([ { x: geo.Ax, y: geo.wireY }, { x: geo.Ax, y: geo.lowerY }, { x: geo.Jx, y: geo.lowerY }, { x: geo.Jx, y: geo.wireY } ], wireCol, wA, 3);  // tap branch A -> (E,G) -> J
  drawWireDriverBeads(geo);
  if (st && st.show_tap_branch_beads) drawWireTapBeads(geo);
  if (st && pfWgVis('voltmeter', st.show_voltmeter_compare)) drawWireVoltmeterBeads(geo);
  drawWireDriverCell(geo);
  drawWireTestedCell(geo);
  if (pfWgVis('galvanometer', !st || st.show_galvanometer !== false)) {
    drawGalvanometerC(geo.Ax, geo.Gy, geo.gR, g.needle, (st && st.galvanometer_label) ? st.galvanometer_label : 'G', wdim('galvanometer'));
  }
  drawJockey(geo);
  drawWireNodeLabels(geo);
  if (st && pfWgVis('voltmeter', st.show_voltmeter_compare)) drawWireVoltmeter(geo);
  // value-only HUD chips (Rule 34b/d — distinct zones, always legible) ────────────
  if (st && st.show_gradient_ramp) {
    drawBridgeChip(width * 0.32, height * 0.11, 'k = ' + g.k.toFixed(2) + ' V/m', bpvl('gradient_ramp', '#4DD0E1'), 14);
  }
  if (st && pfWgVis('balance_readout', st.show_balance_readout)) {
    var rc = bpvl('balance_readout', '#B39DDB');
    drawBridgeChip(width * 0.28, height * 0.90, 'l = ' + g.l.toFixed(2) + ' m', rc, 14);
    drawBridgeChip(width * 0.46, height * 0.90, 'k\\u00B7l = ' + g.kl.toFixed(2) + ' V', rc, 14);
    drawBridgeChip(width * 0.63, height * 0.90, 'E = ' + g.E.toFixed(2) + ' V', bpvl('tested_cell', '#FFB74D'), 14);
  }
  if (st && st.show_izero_label && g.balanced) {                  // literal i = 0 — ONLY when live-balanced
    fillHex(bpvl('compare_ok', '#66BB6A'), 0.98); textSize(14); textStyle(BOLD); textAlign(LEFT, CENTER);
    text('i = 0', geo.Ax + width * 0.085, geo.Gy); textStyle(NORMAL);
  }
  if (st && pfWgVis('voltmeter', st.show_voltmeter_compare)) {                          // V_meter vs true E (voltmeter reads LESS)
    drawBridgeChip(width * 0.66, height * 0.32,                    // upper-right clear zone — clears the ε_d driver-cell label + k-chip (Rule 34d)
      'V_meter = ' + g.Vmeter.toFixed(2) + ' V  vs  E = ' + g.E.toFixed(2) + ' V', bpvl('compare_bad', '#EF5350'), 14);
  }
}

// ═══ meter_bridge — 'meter_bridge' topology (gated behind cTopology()==='meter_bridge') ══
// A HYBRID of the wheatstone diamond + the potentiometer slide wire. A uniform 1 m
// slide wire A(left)->C(right) runs along the lower-middle; a top R-X path (known R in
// the LEFT gap, unknown X in the RIGHT gap) meets at the top junction B; the cell drives
// BOTH paths in parallel across A-C via an external loop below the wire. A centre-zero
// galvanometer G sits on the B->J chord (J = the sliding jockey). At the null (V_B = V_J)
// the meter-branch current is EXACTLY zero for any G, and X reads off the two lengths:
// X = R*(100-l1)/l1. Every value is a PURE fn of live R/X/eps + the jockey fraction f;
// every field is opt-in behind topology:'meter_bridge', so series/parallel/bridge/wire/
// KCL/KVL render byte-identical. l (cm) is the human-facing HUD variable (= f*100);
// jockey_pos/jockey_sweep_to stay 0..1 fractions so the sweep math mirrors the pot jockey.
// Clock sweeps + the S5 jitter are pure fns of PM_simTimeMs so home-pose (t=0) and
// SET_TIME_FREEZE re-sim reproduce frames exactly (THE EYE baselines).
function mbcal(key, fb) { return (config && config.meter_bridge_calibration && typeof config.meter_bridge_calibration[key] === 'number') ? config.meter_bridge_calibration[key] : fb; }
function cMbX() { var st = curState(); if (st && typeof st.X === 'number' && !userTouched['X']) return st.X; return hasSlider('X') ? sliderVal('X') : 6; }
function cMbEps() { var st = curState(); if (st && typeof st.eps === 'number' && !userTouched['eps']) return st.eps; return hasSlider('eps') ? sliderVal('eps') : 2; }
// R: per-state lock -> optional S5 cycle_compare sweep (R rises so the null walks to
// mid-wire) -> slider. Pure fn of PM_simTimeMs.
function cMbR() {
  var st = curState();
  if (st && st.cycle_compare && !userTouched['R']) {
    var p2s = (typeof st.cycle_phase2_start_ms === 'number') ? st.cycle_phase2_start_ms : 2500;
    var p2d = (typeof st.cycle_phase2_duration_ms === 'number') ? st.cycle_phase2_duration_ms : 900;
    var r1 = (typeof st.R === 'number') ? st.R : 1;
    var r2 = (typeof st.cycle_phase2_target_R === 'number') ? st.cycle_phase2_target_R : 6;
    return r1 + (r2 - r1) * constrain((PM_simTimeMs - p2s) / max(p2d, 1), 0, 1);
  }
  if (st && typeof st.R === 'number' && !userTouched['R']) return st.R;
  return hasSlider('R') ? sliderVal('R') : 4;
}
function mbBalanceFrac() { var R = cMbR(), X = cMbX(); return R / max(R + X, 1e-6); }
// Jockey fraction f (0..1 along A->C). Priority: S5 jitter around the LIVE balance point
// -> clock sweep (jockey_pos -> jockey_sweep_to) -> per-state jockey_pos -> l slider
// (cm/100). userTouched['l'] hands control to the teacher.
function cMbJockeyF() {
  var st = curState();
  if (st && st.jockey_jitter && !userTouched['l']) {
    var amp = mbcal('delta_l_wobble_cm', 2) / 100;
    return constrain(mbBalanceFrac() + amp * sin(TWO_PI * (PM_simTimeMs / 1000)), 0.02, 0.98);
  }
  if (st && st.jockey_sweep && !userTouched['l']) {
    var start = (typeof st.jockey_sweep_start_ms === 'number') ? st.jockey_sweep_start_ms : 800;
    var dur = (typeof st.jockey_sweep_duration_ms === 'number') ? st.jockey_sweep_duration_ms : 800;
    var a = (typeof st.jockey_pos === 'number') ? st.jockey_pos : 0.5;
    var b = (typeof st.jockey_sweep_to === 'number') ? st.jockey_sweep_to : a;
    return a + (b - a) * constrain((PM_simTimeMs - start) / max(dur, 1), 0, 1);
  }
  if (st && typeof st.jockey_pos === 'number' && !userTouched['l']) return st.jockey_pos;
  return hasSlider('l') ? constrain(sliderVal('l') / 100, 0, 1) : 0.5;
}
function mbPhysics() {
  var R = cMbR(), X = cMbX(), eps = cMbEps(), f = constrain(cMbJockeyF(), 0.01, 0.99);
  var VB = eps * X / max(R + X, 1e-6);          // R-X divider: V at junction B
  var VJ = eps * (1 - f);                        // uniform-wire tap at the jockey
  var gap = VB - VJ;                             // 0 at balance (eps cancels)
  var bf = R / max(R + X, 1e-6);                 // balance fraction = R/(R+X)
  var K = mbcal('needle_deg_per_volt', 50), MX = mbcal('needle_max_deg', 60);
  var needle = constrain(K * gap, -MX, MX);      // centre-zero, deg from straight-up
  var tol = mbcal('ratio_tolerance', 0.02);
  var balanced = abs(f - bf) < max(tol, 0.012);
  var lcm = f * 100, l1cm = constrain(bf * 100, 1, 99);
  var Xmeas = R * (100 - lcm) / max(lcm, 1e-6);   // live from the jockey; = X at balance
  var dl = mbcal('delta_l_wobble_cm', 2);
  var bandDX = X * 100 * dl / max(l1cm * (100 - l1cm), 1e-6);   // sensitivity envelope at the null
  return { R: R, X: X, eps: eps, f: f, VB: VB, VJ: VJ, gap: gap, bf: bf, needle: needle,
           balanced: balanced, lcm: lcm, l1cm: l1cm, Xmeas: Xmeas, bandDX: bandDX };
}
function mbGeom() {
  var W = width, H = height;
  var Ax = W * 0.18, Cx = W * 0.82, wireY = H * 0.60;
  var topY = H * 0.26, battY = H * 0.86;
  var Bx = (Ax + Cx) / 2, By = topY, Gy = (By + wireY) / 2;
  var p = mbPhysics();
  var Jx = Ax + (Cx - Ax) * constrain(p.f, 0, 1), Jy = wireY;
  var gR = H * 0.058;
  return { W: W, H: H, Ax: Ax, Cx: Cx, wireY: wireY, topY: topY, battY: battY,
           Bx: Bx, By: By, Gy: Gy, Jx: Jx, Jy: Jy, gR: gR, phys: p };
}
// Two parallel bead loops A->C (top R-X path + bottom slide wire) sharing the battery
// return rail. Density + speed ~ each path's current; both flow in EVERY state.
function drawMbLoopBeads(geo) {
  var g = geo.phys, eDim = wdim('electrons');
  var col = (config.particles && config.particles.color) ? config.particles.color : '#42A5F5';
  var sz = (config.particles && config.particles.size) ? config.particles.size : 7;
  var Rw = 2;                                            // nominal wire resistance (visual only)
  var iTop = g.eps / max(g.R + g.X, 1e-6), iBot = g.eps / Rw;
  var topLoop = [ { x: geo.Ax, y: geo.wireY }, { x: geo.Ax, y: geo.topY }, { x: geo.Cx, y: geo.topY },
                  { x: geo.Cx, y: geo.wireY }, { x: geo.Cx, y: geo.battY }, { x: geo.Ax, y: geo.battY }, { x: geo.Ax, y: geo.wireY } ];
  var botLoop = [ { x: geo.Ax, y: geo.wireY }, { x: geo.Cx, y: geo.wireY }, { x: geo.Cx, y: geo.battY },
                  { x: geo.Ax, y: geo.battY }, { x: geo.Ax, y: geo.wireY } ];
  var LT = polyLen(topLoop), LB = polyLen(botLoop);
  var NT = max(6, round(constrain(iTop / 0.4, 0.3, 2.0) * 10)), NB = max(8, round(constrain(iBot / 0.6, 0.3, 2.5) * 12));
  var spT = constrain(iTop / 0.4, 0.3, 2.2), spB = constrain(iBot / 0.6, 0.4, 2.8);
  var PH = circuitBeadPhase.length;
  noStroke();
  for (var i = 0; i < NT; i++) {
    var sT = (circuitBeadPhase[i % PH] + CIRCUIT_BEAD_RATE * (PM_simTimeMs / 1000) * spT) % 1;
    var pT = polyAt(topLoop, LT, sT);
    fillHex(col, 0.24 * eDim); ellipse(pT.x, pT.y, sz * 2.0); fillHex(col, 0.92 * eDim); ellipse(pT.x, pT.y, sz);
  }
  for (var j = 0; j < NB; j++) {
    var sB = (circuitBeadPhase[(j + 5) % PH] + CIRCUIT_BEAD_RATE * (PM_simTimeMs / 1000) * spB) % 1;
    var pB = polyAt(botLoop, LB, sB);
    fillHex(col, 0.24 * eDim); ellipse(pB.x, pB.y, sz * 2.0); fillHex(col, 0.92 * eDim); ellipse(pB.x, pB.y, sz);
  }
}
// Galvanometer-branch beads on B->G->J. Dir = sign(gap), density + speed ~ |gap|,
// EXACTLY zero at balance (drains as the jockey reaches the null). Disc drawn AFTER.
function drawMbGalvoBeads(geo) {
  var g = geo.phys, mag = abs(g.gap);
  if (mag < 0.02) return;                                // balance -> the meter branch is empty
  var eDim = wdim('electrons');
  var col = (config.particles && config.particles.color) ? config.particles.color : '#42A5F5';
  var sz = (config.particles && config.particles.size) ? config.particles.size : 7;
  var chord = (g.gap >= 0) ? [ { x: geo.Bx, y: geo.By }, { x: geo.Bx, y: geo.Gy }, { x: geo.Jx, y: geo.Jy } ]
                           : [ { x: geo.Jx, y: geo.Jy }, { x: geo.Bx, y: geo.Gy }, { x: geo.Bx, y: geo.By } ];
  var L = polyLen(chord), n = ceil(constrain(mag / 0.6, 0, 1) * 6); if (n < 1) n = 1;
  var sp = constrain(mag / 0.3, 0.4, 2.5);
  noStroke();
  for (var b = 0; b < n; b++) {
    var s = (b / n + CIRCUIT_BEAD_RATE * 2 * (PM_simTimeMs / 1000) * sp) % 1;
    var pt = polyAt(chord, L, s);
    fillHex(col, 0.30 * eDim); ellipse(pt.x, pt.y, sz * 1.7); fillHex(col, 0.95 * eDim); ellipse(pt.x, pt.y, sz * 0.9);
  }
}
function drawMbBattery(geo, eps) {
  var bx = (geo.Ax + geo.Cx) / 2, by = geo.battY, col = bpvl('battery', '#FFD54F'), dim = wdim('battery');
  strokeHex('#ECEFF1', 0.92 * dim); strokeWeight(2); line(bx - 8, by - 14, bx - 8, by + 14);   // + plate (long)
  strokeWeight(6); line(bx + 8, by - 8, bx + 8, by + 8);                                        // - plate (short)
  noStroke(); fillHex(col, 0.98 * dim); textSize(12); textStyle(BOLD); textAlign(CENTER, TOP);
  text('\\u03B5 = ' + eps.toFixed(1) + ' V', bx, by + 12); textStyle(NORMAL);
}
function drawMbNodes(geo, st) {
  var col = bpvl('node_dot', '#80CBC4'), jDim = dimFor('junction');
  var labs = (st && st.node_dot_labels && st.node_dot_labels.length >= 4) ? st.node_dot_labels : ['A', 'B', 'C', 'J'];
  var junctionFocal = !!(focalSet() && focalSet()['junction']);
  if (junctionFocal) {                                   // Rule 29: brighten junction B by a glow halo, not size
    fillHex(bpvl('junction', '#4DD0E1'), 0.15); noStroke(); ellipse(geo.Bx, geo.By, 34);
    fillHex(bpvl('junction', '#4DD0E1'), 0.28); noStroke(); ellipse(geo.Bx, geo.By, 22);
  }
  var aDim = wdim('wires');
  fillHex(col, 0.95 * aDim); noStroke();
  ellipse(geo.Ax, geo.wireY, 10); ellipse(geo.Cx, geo.wireY, 10);
  fillHex(col, 0.95 * (junctionFocal ? 1 : max(jDim, 0.55))); ellipse(geo.Bx, geo.By, 11);
  var lc = bpvl('labels', '#D4D4D8');
  fillHex(lc, 0.96 * aDim); textSize(13); textStyle(BOLD);
  textAlign(RIGHT, CENTER); text(labs[0], geo.Ax - 9, geo.wireY - 12);
  textAlign(CENTER, BOTTOM); text(labs[1], geo.Bx, geo.By - 12);
  textAlign(LEFT, CENTER); text(labs[2], geo.Cx + 9, geo.wireY - 12);
  textStyle(NORMAL);
  // Sliding jockey J: a triangle sitting ON the wire, apex touching, body above.
  var jcol = bpvl('jockey', '#FF7043'), jd = wdim('jockey');
  fillHex(jcol, 0.96 * jd); noStroke();
  triangle(geo.Jx, geo.Jy, geo.Jx - 7, geo.Jy - 16, geo.Jx + 7, geo.Jy - 16);
  fillHex(jcol, 0.98 * jd); textSize(11); textStyle(BOLD); textAlign(CENTER, BOTTOM);
  text(labs[3], geo.Jx, geo.Jy - 18); textStyle(NORMAL);
}
// S2: the wire is a resistance ruler. A highlight sweeps A->C; the two segments A->J and
// J->C tint to show resistance ~ length; a value chip shows the length ratio.
function drawMbSegments(geo, st) {
  var g = geo.phys, dim = wdim('segments'), col = bpvl('segment_highlight', '#4DD0E1');
  var start = (typeof st.segment_sweep_start_ms === 'number') ? st.segment_sweep_start_ms : 600;
  var dur = (typeof st.segment_sweep_duration_ms === 'number') ? st.segment_sweep_duration_ms : 1600;
  var swept = st.segment_sweep ? constrain((PM_simTimeMs - start) / max(dur, 1), 0, 1) : 1;
  var sx = geo.Ax + (geo.Cx - geo.Ax) * swept;
  strokeHex(col, 0.85 * dim); strokeWeight(6); line(geo.Ax, geo.wireY, min(sx, geo.Jx), geo.wireY);
  if (sx > geo.Jx) { strokeHex(bpvl('x_readout', '#CE93D8'), 0.75 * dim); strokeWeight(6); line(geo.Jx, geo.wireY, sx, geo.wireY); }
  noStroke(); fillHex('#FFFFFF', 0.9 * dim); ellipse(sx, geo.wireY, 10);
  var lcm = round(g.lcm);
  drawBridgeChip((geo.Ax + geo.Cx) / 2, geo.wireY + height * 0.13, 'R_seg \\u221D length     ' + lcm + ' : ' + (100 - lcm), col, 13);
}
// S5 error band: a horizontal envelope under the X readout, half-width ~ the sensitivity
// dX at the null (wide near an end, narrow at mid-wire), plus the current phase labels.
function drawMbErrorBand(geo, st, p) {
  var col = bpvl('error_band', '#FFD54F');
  var cx = width * 0.70, cy = height * 0.815;
  var halfW = constrain(p.bandDX * (width * 0.06), 5, width * 0.16);
  strokeHex(col, 0.95); strokeWeight(3); line(cx - halfW, cy, cx + halfW, cy);
  strokeWeight(2); line(cx - halfW, cy - 6, cx - halfW, cy + 6); line(cx + halfW, cy - 6, cx + halfW, cy + 6);
  var grid = (st && st.error_band_grid && st.error_band_grid.length) ? st.error_band_grid : null;
  if (grid) {
    var cur = grid[0];
    for (var i = 0; i < grid.length; i++) { if (PM_simTimeMs >= (grid[i].reveal_at_ms || 0)) cur = grid[i]; }
    var lab = 'R = ' + cur.R_label + '    l\\u2081 = ' + cur.l1_label + '    \\u0394X = ' + cur.dX_label;
    drawBridgeChip(width * 0.30, height * 0.76, lab, col, 13);
  }
}
function drawMeterBridgeScenario() {
  var geo = mbGeom(), p = geo.phys, st = curState();
  var wireCol = bpvl('wire', '#546E7A'), wA = 0.85 * wdim('wires');
  drawWireC([ { x: geo.Ax, y: geo.wireY }, { x: geo.Ax, y: geo.topY }, { x: geo.Cx, y: geo.topY }, { x: geo.Cx, y: geo.wireY } ], wireCol, wA, 3);   // top R-X path
  drawWireC([ { x: geo.Ax, y: geo.wireY }, { x: geo.Cx, y: geo.wireY } ], wireCol, wA, 3);                                                            // bottom slide wire
  drawWireC([ { x: geo.Ax, y: geo.wireY }, { x: geo.Ax, y: geo.battY }, { x: geo.Cx, y: geo.battY }, { x: geo.Cx, y: geo.wireY } ], wireCol, wA, 3);  // external battery loop
  drawWireC([ { x: geo.Bx, y: geo.By }, { x: geo.Bx, y: geo.Gy }, { x: geo.Jx, y: geo.Jy } ], wireCol, 0.7 * wdim('wires'), 2);                       // galvanometer chord B->G->J
  if (st && st.show_segment_ratio) drawMbSegments(geo, st);
  drawMbLoopBeads(geo);
  if (pfWgVis('galvanometer', !st || st.show_galvanometer !== false)) drawMbGalvoBeads(geo);
  var rDim = wdim('resistors');
  drawResistorBoxC((geo.Ax + geo.Bx) / 2, geo.topY, 'R = ' + fmtNum(p.R) + ' \\u03A9', rDim);
  drawResistorBoxC((geo.Bx + geo.Cx) / 2, geo.topY, 'X = ' + fmtNum(p.X) + ' \\u03A9', rDim);
  drawMbBattery(geo, p.eps);
  drawMbNodes(geo, st);
  if (pfWgVis('galvanometer', !st || st.show_galvanometer !== false)) {
    drawGalvanometerC(geo.Bx, geo.Gy, geo.gR, p.needle, (st && st.galvanometer_label) ? st.galvanometer_label : 'G', dimFor('galvanometer'));
    if (st && st.show_ig_zero_label && p.balanced) {
      fillHex(bpvl('ig_zero_ok', '#66BB6A'), 0.98); textSize(14); textStyle(BOLD); textAlign(LEFT, CENTER);
      text('i_g = 0', geo.Bx + geo.gR + 14, geo.Gy); textStyle(NORMAL);
    }
  }
  // ── value-only HUD (Rule 34b/d — lower band, clears the top 'Full screen' chrome) ──
  if (st && pfWgVis('balance_readout', st.show_balance_readout) && !st.show_error_band) {   // in S5 the error-band phase chip carries l1 instead
    drawBridgeChip(width * 0.26, height * 0.76, 'l = ' + round(p.lcm) + ' cm', bpvl('balance_readout', '#B39DDB'), 14);
  }
  if (st && st.show_x_readout) {
    drawBridgeChip(width * 0.70, height * 0.76, 'X = ' + p.Xmeas.toFixed(1) + ' \\u03A9', bpvl('x_readout', '#CE93D8'), 15);
    if (st && st.show_error_band) drawMbErrorBand(geo, st, p);
  }
}

// ═══ emf_definition scenario — charge-pump cell + potential ladder + voltmeter ══
// A single IDEAL-cell loop reusing the combination bead engine. Primitives are
// added incrementally: drawEmfCell (Task 3), drawPotentialLadder (Task 4),
// drawVoltmeterC (Task 5). Beads flow at speed ~ i (0 when the loop is open).
function drawEmfScenario() {
  var stK = curState();
  if (stK && stK.kvl_multi_ladder) { drawKvlScenario(); return; }   // kirchhoff_loop_rule_KVL — fully gated; emf_definition path below is untouched
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

// FINDING A - shared loop->ladder parameterisation for the S1 followed charge.
// Returns the arc-length fractions along loops.series where the cell riser ends
// (sc) and where each resistor box is entered/exited. The SAME loop-fraction
// (mark) drives BOTH the physical loop marker (polyAt over loops.series) and the
// ladder tracking-dot (mapped through these breakpoints inside drawPotentialLadder),
// so the dot always sits at the potential of the exact loop position the marker
// occupies - no arc-length desync between the two differently-shaped polylines.
function kvlLoopProfile(loops, c) {
  var g = loops.g, L = polyLen(loops.series);
  var up = g.midY - g.topY;                             // batt -> top-left corner (arc before the top edge)
  var res = c.three ? [g.sR1, g.sR2, g.sR3] : [g.sR1, g.sR2];
  var half = 33;                                        // resistor box half-width (drawResistorBoxC draws 66 wide)
  var enter = [], exit = [];
  for (var k = 0; k < res.length; k++) {
    enter.push((up + (res[k].x - half - g.leftX)) / L);
    exit.push((up + (res[k].x + half - g.leftX)) / L);
  }
  return { sc: 30 / L, enter: enter, exit: exit, n: res.length };
}
// ═══ kirchhoff_loop_rule_KVL scenario — ideal cell + 2-3 SERIES resistors ═════
// Reuses scenario_type 'emf_definition' but every piece here is gated behind a
// per-state flag (kvl_multi_ladder / show_element_voltmeters / kvl_sum_readout /
// show_hl_tags / ghost_text / ladder_build_ms) so emf_definition + internal_
// resistance render byte-identical (they never set them). Shares the cell/beads/
// ammeter/ladder/voltmeter primitives; adds the multi-step ladder, per-element
// voltmeters, the SIGNED loop-sum HUD, H/L tags, and the naive add-all ghost.
function drawKvlScenario() {
  var c = cKvlCurrents(), loops = circuitLoops(), g = loops.g, st = curState();
  drawWireC(loops.series, '#546E7A', 0.85, 3);
  drawCircuitBeads(loops, { topo: 'series', single: true, i1: c.i, i2: c.i, itot: c.i,
                            Req: c.Rtot, V: c.eps, R1: c.R1, R2: c.R2 });
  var rDim = dimFor('load'), r3rev = cKvlR3Reveal();
  drawResistorBoxC(g.sR1.x, g.sR1.y, 'R\\u2081 = ' + fmtNum(c.R1) + ' \\u03A9', rDim);
  drawResistorBoxC(g.sR2.x, g.sR2.y, 'R\\u2082 = ' + fmtNum(c.R2) + ' \\u03A9', rDim);
  if (c.three && r3rev > 0.02) {                        // S4: R3 fades/joins in via the reveal factor (Rule 32d — ADD, not rebuild)
    drawResistorBoxC(g.sR3.x, g.sR3.y, 'R\\u2083 = ' + fmtNum(c.R3) + ' \\u03A9', rDim * r3rev);
  }
  drawAmmeterAtC(g.amMain.x, g.amMain.y, c.i, 'AMMETER', dimFor('electrons'), 26);
  drawEmfCell(g, c.eps, 1, !!(st && st.pump_focus) || !c.swOpen);   // pump animates while current flows

  // H/L sign tags (S3+): current enters each resistor's LEFT end (H, higher
  // potential) and leaves the RIGHT end (L, lower) along the current — fixed
  // geometry, only the magnitudes respond to sliders. Beads flow left->right.
  if (st && st.show_hl_tags) {
    var hlDim = dimFor('load');
    textStyle(BOLD); textSize(11); textAlign(CENTER, BOTTOM);
    var tagY = g.topY - 20, tags = c.three ? [g.sR1, g.sR2, g.sR3] : [g.sR1, g.sR2];
    for (var ti = 0; ti < tags.length; ti++) {
      var tr = (ti === 2) ? r3rev : 1;
      fillHex('#EF9A9A', 0.95 * hlDim * tr); text('H', tags[ti].x - 40, tagY);
      fillHex('#90CAF9', 0.95 * hlDim * tr); text('L', tags[ti].x + 40, tagY);
    }
    textStyle(NORMAL);
  }

  // Per-element voltmeters (cell eps + each resistor) — the EXISTING drawVoltmeterC
  // dial, one per element, in the loop interior below its element. Labeled values.
  if (st && st.show_element_voltmeters) {
    var vDim = dimFor('voltmeter'), vy = (g.topY + g.midY) / 2 + 6;
    drawVoltmeterC(g.leftX + 40, vy, c.eps, c.eps, vDim);   // cell voltmeter reads the full ideal-cell eps
    drawVoltmeterC(g.sR1.x, vy, c.V1, c.eps, vDim);
    drawVoltmeterC(g.sR2.x, vy, c.V2, c.eps, vDim);
    if (c.three && r3rev > 0.5) drawVoltmeterC(g.sR3.x, vy, c.V3, c.eps, vDim);
  }

  // The multi-step potential ladder — the money primitive (+eps riser, one -IRk
  // down-step per resistor, closing to exactly 0). S1: a followed charge walks the
  // loop + the ladder in lockstep (trace_charge). S2: staged reveal (ladder_build_ms).
  if (st && st.show_ladder) {
    var mark = (st.trace_charge && !c.swOpen) ? emfTraceS({ i: c.i }) : null;
    var build = (st.ladder_build_ms && st.ladder_build_ms.length) ? st.ladder_build_ms : null;
    var prof = (mark !== null) ? kvlLoopProfile(loops, c) : null;   // FINDING A: one shared loop->ladder mapping for BOTH dots
    var tallPanel = !!(st.show_sliders || (st.visible_controls && st.visible_controls.length >= 3));   // FINDING C: the S5 all-sliders panel is tall enough to overlap the ladder title
    drawPotentialLadder(c.eps, c.i, c.Rtot, c.swOpen, 1, null, 0, null, null,
      { V1: c.V1, V2: c.V2, V3: c.V3, three: c.three, build: build, marker: mark, prof: prof, shiftDown: tallPanel });
    if (mark !== null) {                                 // the followed charge on the PHYSICAL loop; the ladder dot rides the SAME mark+prof (lockstep)
      var lp = polyAt(loops.series, polyLen(loops.series), mark);
      noStroke(); fillHex('#FFE082', 0.30); ellipse(lp.x, lp.y, 22);
      fillHex('#FFE082', 0.98); ellipse(lp.x, lp.y, 9);
    }
  }

  // SIGNED loop-sum HUD (value-only, Rule 34b) — '+6.0 - 4.0 - 2.0 (- 3.0) = 0.0'.
  // Distinct from KCL's UNSIGNED kcl_sum_readout; the symbolic form lives in the DOM.
  if (st && pfWgVis('kvl_sum', st.kvl_sum_readout)) {
    var kDim = dimFor('formula');
    var sstr = '+' + c.eps.toFixed(1) + ' \\u2212 ' + c.V1.toFixed(1) + ' \\u2212 ' + c.V2.toFixed(1)
             + (c.three ? (' \\u2212 ' + c.V3.toFixed(1)) : '') + ' = ' + c.kvl_sum.toFixed(1);
    var kx = width * 0.32, ky = height * 0.90, kw = c.three ? 300 : 244, kh = 34;
    rectMode(CENTER); fillHex('#0A0A1A', 0.88 * kDim); noStroke(); rect(kx, ky, kw, kh, 6);
    strokeHex('#4DD0E1', 0.95 * kDim); strokeWeight(2); noFill(); rect(kx, ky, kw, kh, 6); rectMode(CORNER); noStroke();
    fillHex('#FFFFFF', 0.98 * kDim); textSize(15); textStyle(BOLD); textAlign(CENTER, CENTER);
    text(sstr, kx, ky); textStyle(NORMAL);
  }

  // Naive add-all-positive ghost (S3) — a FIXED authored string, struck through,
  // pinned to the ORIGINAL 4/2 split (never recomputed; reuses drawStruckTextC).
  if (st && typeof st.ghost_text === 'string') {
    var gx = (st.ghost_pos && typeof st.ghost_pos.x === 'number') ? st.ghost_pos.x * width : width * 0.30;
    var gy = (st.ghost_pos && typeof st.ghost_pos.y === 'number') ? st.ghost_pos.y * height : height * 0.80;
    drawStruckTextC(gx, gy, st.ghost_text + ' \\u2717', dimFor('formula'));
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
// ═══ combination_of_cells adapter — EXTENDS internal_resistance (irMode) with
// grouped cells: cell_topology (single|series|parallel) + cell_count (1-3) +
// flip_cell2 (0/1), plus new one-shots (dock_cell, switch_close_cue, flip_cell,
// regroup, cycle_compare) and two new glow keys (cells, ammeter). Gated on
// hasSlider('cell_topology') -> ccMode() is FALSE for internal_resistance.json
// (no such slider), so drawIrScenario()'s original path below is untouched —
// every function here is new code, nothing shared is mutated.
//
// Cause-before-effect (Rule 32a): every one-shot runs a MECHANICAL window
// (ccMechP — POSITIONS/ROTATES the cell icons, the visible cause) followed by an
// EFFECT window that starts only once the mechanical window ends (ccEffP — blends
// the ELECTRICAL numbers, the readable consequence: eps_eq/r_eq/i/V glide, the
// ladder's new/flipped climb grows/inverts). Both are pure functions of
// PM_simTimeMs + the authored *_start_ms/*_duration_ms fields, so SET_TIME_FREEZE
// re-sim at ANY pinned time reproduces the frame exactly (no incremental/
// accumulated state — derivable at t=0, the bring-up contract).
function ccMode() { return irMode() && hasSlider('cell_topology'); }
function ccTopologyFromNum(v) { return v < 0.5 ? 'single' : (v < 1.5 ? 'series' : 'parallel'); }
function ccBaseTopology() {
  var st = curState();
  if (userTouched['cell_topology']) return ccTopologyFromNum(sliderVal('cell_topology'));
  if (st && typeof st.cell_topology === 'string') return st.cell_topology;
  return hasSlider('cell_topology') ? ccTopologyFromNum(sliderVal('cell_topology')) : 'single';
}
function ccBaseCount() {
  var st = curState();
  if (userTouched['cell_count']) return round(sliderVal('cell_count'));
  if (st && typeof st.cell_count === 'number') return st.cell_count;
  return hasSlider('cell_count') ? round(sliderVal('cell_count')) : 1;
}
function ccBaseFlip() {
  var st = curState();
  if (userTouched['flip_cell2']) return sliderVal('flip_cell2') >= 0.5 ? 1 : 0;
  if (st && typeof st.flip_cell2 === 'number') return st.flip_cell2;
  return hasSlider('flip_cell2') ? (sliderVal('flip_cell2') >= 0.5 ? 1 : 0) : 0;
}
function ccBaseSwitchOpen() {
  var st = curState();
  if (userTouched['switch']) return sliderVal('switch') < 0.5;
  if (st && typeof st.switch === 'number') return st.switch < 0.5;
  return hasSlider('switch') ? sliderVal('switch') < 0.5 : false;
}
// The pure formula core (physics_engine_config.formulas, verbatim). n may be a
// NON-integer during a dock_cell growth blend — the extra cell's contribution
// scales continuously 0->1, which is what makes "the ladder grows a second
// climb" and "the voltmeter glides" the SAME animation, not two separate ones.
function ccFormula(topology, n, flipFrac, R, switchOpen, emfV, rV) {
  var nn = max(1e-6, n);
  var epsEq, rEq;
  if (topology === 'series') { epsEq = emfV * (nn - 2 * flipFrac); rEq = nn * rV; }
  else if (topology === 'parallel') { epsEq = emfV; rEq = rV / nn; }
  else { epsEq = emfV; rEq = rV; }
  var i = switchOpen ? 0 : epsEq / max(R + rEq, 1e-6);
  var V = epsEq - i * rEq;
  var iPerCell = (topology === 'parallel') ? i / nn : i;
  var stepPerCell = iPerCell * rV;
  return { topology: topology, cellCount: n, flipFrac: flipFrac, R: R, switchOpen: switchOpen,
           epsEq: epsEq, rEq: rEq, i: i, V: V, iPerCell: iPerCell, stepPerCell: stepPerCell };
}
function ccLerpPhys(a, b, t) {
  return { topology: t >= 1 ? b.topology : a.topology, cellCount: a.cellCount, flipFrac: a.flipFrac,
           R: lerp(a.R, b.R, t), switchOpen: t >= 1 ? b.switchOpen : a.switchOpen,
           epsEq: lerp(a.epsEq, b.epsEq, t), rEq: lerp(a.rEq, b.rEq, t), i: lerp(a.i, b.i, t), V: lerp(a.V, b.V, t),
           iPerCell: lerp(a.iPerCell, b.iPerCell, t), stepPerCell: lerp(a.stepPerCell, b.stepPerCell, t) };
}
// mech: 0->1 across [start, start+dur] — drives the VISIBLE cause (icon slide/flip).
function ccMechP(startMs, durMs) {
  if (typeof startMs !== 'number') return 1;
  return constrain((PM_simTimeMs - startMs) / max(durMs || 1, 1), 0, 1);
}
// eff: HOLDS at 0 through the whole mechanical window, then ramps 0->1 across the
// next effMs — drives the READABLE consequence (numbers/ladder), always AFTER the
// cause has finished moving (Rule 32a's readable gap).
function ccEffP(startMs, durMs, effMs) {
  if (typeof startMs !== 'number') return 1;
  var mechEnd = startMs + (durMs || 0);
  if (PM_simTimeMs < mechEnd) return 0;
  return constrain((PM_simTimeMs - mechEnd) / max(effMs || 1, 1), 0, 1);
}
// S7 cycle_compare — 3 sequential phases chained off the PREVIOUS phase's landed
// state (never off the raw entry pose), each with its own mech/eff split. Returns
// a phys object plus _ladderTopology (the shape to DRAW — snaps once a phase's
// numbers finish gliding) and _iconMechExtra (drives the cell icons' shape blend
// during a topology-changing phase's mechanical window; phase 2 only moves R, so
// the cells don't move and _iconMechExtra stays null there).
function ccCyclePhys(st, topo0, count0, flip0, swOpen0, emfV, rV) {
  var R0 = (typeof st.R === 'number') ? st.R : cLoadR();
  var stage0 = ccFormula(topo0, count0, flip0, R0, swOpen0, emfV, rV);
  var p1s = st.cycle_phase1_start_ms, p1d = (typeof st.cycle_phase1_duration_ms === 'number') ? st.cycle_phase1_duration_ms : 500;
  var p2s = st.cycle_phase2_start_ms, p2d = (typeof st.cycle_phase2_duration_ms === 'number') ? st.cycle_phase2_duration_ms : 600;
  var p3s = st.cycle_phase3_start_ms, p3d = (typeof st.cycle_phase3_duration_ms === 'number') ? st.cycle_phase3_duration_ms : 500;
  var topo1 = (typeof st.cycle_phase1_target_topology === 'string') ? st.cycle_phase1_target_topology : topo0;
  var R2v = (typeof st.cycle_phase2_target_R === 'number') ? st.cycle_phase2_target_R : R0;
  var topo3 = (typeof st.cycle_phase3_target_topology === 'string') ? st.cycle_phase3_target_topology : topo1;
  var stage1 = ccFormula(topo1, count0, flip0, R0, swOpen0, emfV, rV);
  var stage2 = ccFormula(topo1, count0, flip0, R2v, swOpen0, emfV, rV);
  var stage3 = ccFormula(topo3, count0, flip0, R2v, swOpen0, emfV, rV);

  var result, shapeTopo, iconMechExtra = null;
  if (typeof p3s === 'number' && PM_simTimeMs >= p3s) {
    var g3 = ccEffP(p3s, p3d, 300);
    result = ccLerpPhys(stage2, stage3, g3);
    shapeTopo = g3 >= 1 ? topo3 : topo1;
    iconMechExtra = { kind: 'shape', mech: ccMechP(p3s, p3d), fromTopo: topo1, toTopo: topo3 };
  } else if (typeof p2s === 'number' && PM_simTimeMs >= p2s) {
    var g2 = ccEffP(p2s, p2d, 300);
    result = ccLerpPhys(stage1, stage2, g2);
    shapeTopo = topo1;
  } else if (typeof p1s === 'number' && PM_simTimeMs >= p1s) {
    var g1 = ccEffP(p1s, p1d, 300);
    result = ccLerpPhys(stage0, stage1, g1);
    shapeTopo = g1 >= 1 ? topo1 : topo0;
    iconMechExtra = { kind: 'shape', mech: ccMechP(p1s, p1d), fromTopo: topo0, toTopo: topo1 };
  } else {
    result = stage0; shapeTopo = topo0;
  }
  result._ladderTopology = shapeTopo;
  result._growCount = count0;
  result._iconMechExtra = iconMechExtra;
  return result;
}
// Master per-frame resolver — the ONE place every draw call reads from. Exactly
// one of the 5 gated one-shots is ever active per authored state (never combined),
// so the if-chain is a straight dispatch, not a priority stack.
function ccCombo() {
  var st = curState();
  var emfV = cEmf(), rV = max(cIntR(), 1e-6);
  var topo0 = ccBaseTopology(), count0 = ccBaseCount(), flip0 = ccBaseFlip();
  var R0 = cIrLoadR();   // reuses R_autosweep_down verbatim (S6) -- zero new work, constraint #5
  var swOpen0 = ccBaseSwitchOpen();
  var seized = !!(userTouched['cell_topology'] || userTouched['cell_count'] || userTouched['flip_cell2'] || userTouched['switch']);

  var iconTopology = topo0, iconCount = count0, iconFlipFrac = flip0, iconMechExtra = null;
  var phys;

  if (!seized && st && st.dock_cell) {
    var dMech = ccMechP(st.dock_cell_start_ms, st.dock_cell_duration_ms);
    var dEff  = ccEffP(st.dock_cell_start_ms, st.dock_cell_duration_ms, 400);
    var toCount = (typeof st.dock_cell_count_to === 'number') ? st.dock_cell_count_to : count0;
    var toTopo  = (typeof st.dock_cell_topology_to === 'string') ? st.dock_cell_topology_to : topo0;
    var effCount = count0 + (toCount - count0) * dEff;
    iconTopology = toTopo; iconCount = toCount;
    iconMechExtra = { kind: 'dock', mech: dMech, fromCount: count0 };
    phys = ccFormula(toTopo, effCount, flip0, R0, swOpen0, emfV, rV);
    phys._growCount = effCount; phys._ladderTopology = toTopo;
  } else if (!seized && st && st.switch_close_cue) {
    var sMech = ccMechP(st.switch_close_cue_start_ms, st.switch_close_cue_duration_ms);
    var sEff  = ccEffP(st.switch_close_cue_start_ms, st.switch_close_cue_duration_ms, 400);
    var stillOpen = sMech < 1;
    var closedPhys = ccFormula(topo0, count0, flip0, R0, false, emfV, rV);
    var iNow = stillOpen ? 0 : closedPhys.i * sEff;
    phys = { topology: topo0, cellCount: count0, flipFrac: flip0, R: R0, switchOpen: stillOpen,
             epsEq: closedPhys.epsEq, rEq: closedPhys.rEq, i: iNow, V: closedPhys.epsEq - iNow * closedPhys.rEq,
             iPerCell: (topo0 === 'parallel') ? iNow / max(count0, 1) : iNow, stepPerCell: 0 };
    phys.stepPerCell = phys.iPerCell * rV;
    phys._growCount = count0; phys._ladderTopology = topo0;
  } else if (!seized && st && st.flip_cell) {
    var fMech = ccMechP(st.flip_cell_start_ms, st.flip_cell_duration_ms);
    var fEff  = ccEffP(st.flip_cell_start_ms, st.flip_cell_duration_ms, 400);
    var toFlip = (typeof st.flip_cell2_to === 'number') ? st.flip_cell2_to : 1;
    iconFlipFrac = lerp(flip0, toFlip, fMech);
    var flipEff = lerp(flip0, toFlip, fEff);
    phys = ccFormula(topo0, count0, flipEff, R0, swOpen0, emfV, rV);
    phys._growCount = count0; phys._ladderTopology = topo0;
  } else if (!seized && st && st.regroup) {
    var rMech = ccMechP(st.regroup_start_ms, st.regroup_duration_ms);
    var rEff  = ccEffP(st.regroup_start_ms, st.regroup_duration_ms, 300);
    var toTopoR = (typeof st.regroup_topology_to === 'string') ? st.regroup_topology_to : topo0;
    iconTopology = toTopoR;
    iconMechExtra = { kind: 'shape', mech: rMech, fromTopo: topo0, toTopo: toTopoR };
    var beforeR = ccFormula(topo0, count0, flip0, R0, swOpen0, emfV, rV);
    var afterR  = ccFormula(toTopoR, count0, flip0, R0, swOpen0, emfV, rV);
    phys = ccLerpPhys(beforeR, afterR, rEff);
    phys._growCount = count0; phys._ladderTopology = (rEff >= 1) ? toTopoR : topo0;
  } else if (!seized && st && st.cycle_compare) {
    phys = ccCyclePhys(st, topo0, count0, flip0, swOpen0, emfV, rV);
    iconTopology = phys._ladderTopology;
    iconMechExtra = phys._iconMechExtra;
    iconCount = count0;
  } else {
    phys = ccFormula(topo0, count0, flip0, R0, swOpen0, emfV, rV);
    phys._growCount = count0; phys._ladderTopology = topo0;
  }

  return { topo0: topo0, count0: count0, flip0: flip0,
           iconTopology: iconTopology, iconCount: iconCount, iconFlipFrac: iconFlipFrac, iconMechExtra: iconMechExtra,
           phys: phys };
}
// Cell icon HOME positions for a given (topology, count) — founder 2026-07-19
// review (illegible smudges + parallel-looks-like-series + voltmeter pileup):
// k=0 (the REPRESENTATIVE cell, pump + r-reveal) is ALWAYS anchored at (0,0) —
// the bank's fixed point where the external loop wire actually passes —
// regardless of topology/count, so the pump/r-reveal geometry never chases a
// moving anchor and never has to know which topology is active. SERIES cells
// alternate below/above that anchor (down first — the r-reveal sits down-LEFT
// of the anchor, so straight-down growth never crosses it); PARALLEL cells step
// RIGHTWARD into the loop interior at generous pitch, so ccDrawCells can draw
// real rails + rungs (an unmistakable ladder) instead of a same-y row of icons
// that reads as series at a glance.
// Round 2 (founder 2026-07-19): widened 76->170. 76 only ever fit the PLAIN
// "eps = 1.5 V" chip -- restoring the "cell N ..." ordinal prefix in parallel
// too (round-2 fix item 3) needs a materially wider column so two adjacent
// bold-12px chips never collide (the exact failure mode round 1's own comment
// below this constant was written to avoid -- fixed here by giving the ordinal
// room instead of dropping it).
var CC_SERIES_SPACING = 58, CC_PARALLEL_SPACING = 170;
// Half-gap between the parallel ladder's two rails. Must clear the eps chip's
// OWN footprint (chip centre at cellY+30, half-height ~10 -> bottom edge
// ~cellY+40) on the bottom side, not just the plate span -- 26 let the bottom
// rail cut straight through the chip text (eye-walker: combo_cells_parallel_
// rail_clips_eps_chip). 46 clears it with margin; the resulting extra headroom
// on the top side (the plates only need ~9px) is harmless empty space, not a
// collision, so one symmetric constant is kept for both ccDrawCells (draws the
// rails) and ccDrawBranchSplit (positions the per-rung current label below them).
var CC_RAIL_HALF = 46;
function ccShapeOffsets(topology, n) {
  var out = [], k;
  if (topology === 'series') {
    for (k = 0; k < n; k++) {
      if (k === 0) { out.push({ dx: 0, dy: 0 }); continue; }
      var rung = ceil(k / 2), dir = (k % 2 === 1) ? 1 : -1;   // 1st extra cell down, 2nd up, 3rd down again...
      out.push({ dx: 0, dy: dir * rung * CC_SERIES_SPACING });
    }
  } else {
    for (k = 0; k < n; k++) out.push({ dx: k * CC_PARALLEL_SPACING, dy: 0 });
  }
  return out;
}
function ccIconOffsets(cc) {
  var n = max(1, cc.iconCount), mx = cc.iconMechExtra, k;
  if (mx && mx.kind === 'shape') {
    var fromOff = ccShapeOffsets(mx.fromTopo, n), toOff = ccShapeOffsets(mx.toTopo, n), out = [];
    for (k = 0; k < n; k++) out.push({ dx: lerp(fromOff[k].dx, toOff[k].dx, mx.mech), dy: lerp(fromOff[k].dy, toOff[k].dy, mx.mech) });
    return out;
  }
  if (mx && mx.kind === 'dock') {
    // dock_cell (S2): the incoming 2nd cell must be an UNMISSABLE cause-first
    // event (Rule 32a) at the new, bigger cell scale — a long diagonal glide in
    // from clearly off-bank (upper-left), not a short nudge from just above its
    // home slot.
    var full = ccShapeOffsets('series', n), out2 = [];
    for (k = 0; k < n; k++) {
      if (k < mx.fromCount) { out2.push(full[k]); continue; }
      out2.push({ dx: lerp(full[k].dx - 70, full[k].dx, mx.mech), dy: lerp(full[k].dy - 130, full[k].dy, mx.mech) });
    }
    return out2;
  }
  return ccShapeOffsets(cc.iconTopology, n);
}
// ═══ Standard textbook cell symbol (founder 2026-07-19: "cells render as ~28px
// smudges... no +/- marks... show the proper standard symbol, big"). Current
// through this bank runs VERTICALLY (along the loop's left wire, or along a
// parallel rung — both vertical), so the plates are drawn HORIZONTAL, crossing
// the wire — the textbook convention: long-THIN (+) bar, short-THICK (-) bar,
// >=44px plate span so it reads at THE EYE's 640x360 capture, with explicit
// +/- glyphs drawn INSIDE the same flip transform as their own bar (so a
// reversed cell's glyphs travel WITH the plate that actually became + or -,
// never mislabeling mid/post-flip). flipFrac 0->1 plays the same 2D card-flip
// idiom as before (cos ramp +1->0->-1), now about the horizontal axis since
// the bars are horizontal. '+' and '\\u2212' are both 180-degree-symmetric
// glyphs, so they read correctly even mirrored by a negative y-scale.
var CC_PLUS_HALF = 24, CC_MINUS_HALF = 13, CC_PLATE_GAP = 9;
function ccDrawPlates(x, y, dim, flipFrac) {
  push();
  translate(x, y);
  scale(1, cos(PI * constrain(flipFrac || 0, 0, 1)));
  strokeHex('#ECEFF1', 0.95 * dim); strokeWeight(3); line(-CC_PLUS_HALF, -CC_PLATE_GAP, CC_PLUS_HALF, -CC_PLATE_GAP);    // + plate (long, thin)
  strokeWeight(9); line(-CC_MINUS_HALF, CC_PLATE_GAP, CC_MINUS_HALF, CC_PLATE_GAP);                                     // - plate (short, thick)
  noStroke(); textStyle(BOLD); textSize(12); textAlign(LEFT, CENTER);
  fillHex('#66BB6A', 0.95 * dim); text('+', CC_PLUS_HALF + 6, -CC_PLATE_GAP);
  fillHex('#EF5350', 0.95 * dim); text('\\u2212', CC_MINUS_HALF + 6, CC_PLATE_GAP);
  textStyle(NORMAL);
  pop();
}
// eps chip — value-only (Rule 34b), optionally prefixed with an ordinal ("cell
// 2 \\u00B7 \\u03B5 = 1.5 V") so a multi-cell bank stays countable WITHOUT a
// second vertical text row (which would need extra spacing the bank doesn't have).
function ccDrawEpsChip(x, y, eps, dim, labelStr) {
  var elbl = (labelStr ? (labelStr + ' \\u00B7 ') : '') + '\\u03B5 = ' + eps.toFixed(1) + ' V';
  textSize(12); textStyle(BOLD); textAlign(CENTER, CENTER);
  var elw = textWidth(elbl);
  rectMode(CENTER); fill(10, 12, 28, 225 * dim); noStroke();
  rect(x, y, elw + 12, 20, 4); rectMode(CORNER);
  fillHex('#FFD54F', 0.98 * dim); text(elbl, x, y); textStyle(NORMAL);
}
// The 2nd/3rd cell — plates + its own eps chip only (no pump, no r-reveal:
// which cell(s) show the internal r is a display choice, not a taught number —
// physics_author's own note, preserved from the pre-existing drawCellIconC).
function ccDrawStdCell(x, y, eps, dim, flipFrac, labelStr) {
  ccDrawPlates(x, y, dim, flipFrac);
  ccDrawEpsChip(x, y + 30, eps, dim, labelStr);
}
// The REPRESENTATIVE cell (k===0): plates + eps chip + optional pump (charge
// lift, drawEmfCell's idiom) + optional r-reveal (opened casing + zigzag + i.r
// label, same idiom). The r-reveal sits DOWN-LEFT of the plates — a zone
// neither topology's 2nd-cell growth direction ever occupies (series grows
// straight down at dx=0; parallel grows straight right at dy=0), so it can
// never collide with cell 2/3 regardless of topology or count.
function ccDrawRepresentativeCell(x, y, eps, dim, pumpActive, rr, labelStr, chipDx) {
  ccDrawPlates(x, y, dim, 0);
  // Round 3 (founder 2026-07-20, "cell 1's label crosses the main left wire
  // vertical"): cell 1 sits AT the main wire's own x (leftX) by design (it's
  // the component embedded in the wire — Rule 32d home pose) so its eps chip
  // is centered on that same x too. Round 2's PARALLEL ordinal prefix widened
  // that chip enough that the translucent box (its own fill alpha scales with
  // dim, same as everything else) lets the wire's line read through the text.
  // chipDx nudges the CHIP ONLY (never the plates -- the wire must still visibly
  // pass through the physical cell symbol) a few px clear of that line. Callers
  // that don't pass chipDx (every series call) get chipDx=0 -- byte-identical.
  ccDrawEpsChip(x + (chipDx || 0), y + 30, eps, dim, labelStr);
  if (pumpActive) {
    var pDim = dimFor('pump'), nP = 4, px = x - CC_PLUS_HALF - 14;
    for (var kp = 0; kp < nP; kp++) {
      var ph = (PM_simTimeMs / 900 + kp / nP) % 1;                 // 0 = bottom (-), 1 = top (+)
      var ppy = lerp(y + CC_PLATE_GAP, y - CC_PLATE_GAP, ph);
      noStroke(); fillHex('#42A5F5', (0.2 + 0.7 * sin(ph * PI)) * pDim); ellipse(px, ppy, 6);
    }
    strokeHex('#FFD54F', 0.9 * pDim); strokeWeight(2);              // work-on-each-charge arrow (upward)
    line(px, y + CC_PLATE_GAP - 2, px, y - CC_PLATE_GAP + 2);
    line(px, y - CC_PLATE_GAP + 2, px - 4, y - CC_PLATE_GAP + 8); line(px, y - CC_PLATE_GAP + 2, px + 4, y - CC_PLATE_GAP + 8);
    noStroke();
  }
  if (rr && rr.reveal > 0) {
    var rDim = dimFor('r_internal') * rr.reveal;
    var rcx = x - 58, rcy = y + 10;
    if (rr.heat > 0.05) {                                          // i^2 r heat halo (short circuit cooks the cell)
      var hp = 0.5 + 0.5 * sin(PM_simTimeMs / 260);
      noStroke(); fillHex('#FF7043', (0.10 + 0.25 * rr.heat * hp) * rDim);
      ellipse(rcx, rcy, 44 + 22 * rr.heat);
    }
    strokeHex('#B0BEC5', 0.55 * rDim); strokeWeight(1); noFill();
    rectMode(CENTER); rect(rcx, rcy, 24, 46, 5); rectMode(CORNER);   // the opened casing
    strokeHex('#FF8A65', 0.95 * rDim); strokeWeight(2); noFill();    // the hidden r (vertical zigzag)
    beginShape();
    for (var zk = 0; zk <= 6; zk++) vertex(rcx + (zk === 0 || zk === 6 ? 0 : (zk % 2 ? -5 : 5)), rcy - 18 + zk * (36 / 6));
    endShape();
    noStroke(); fillHex('#FF8A65', 0.95 * rDim); textSize(10); textStyle(BOLD); textAlign(CENTER, TOP);
    text('r = ' + rr.r.toFixed(1) + ' \\u03A9', rcx, rcy + 26);
    if (rr.i > 0.02) {
      fillHex('#FFAB91', 0.9 * rDim); textAlign(CENTER, TOP);
      text('i\\u00B7r = ' + (rr.i * rr.r).toFixed(2) + ' V', rcx, rcy + 38);
    }
    textStyle(NORMAL);
  }
}
function ccDrawCells(cc, g, dim) {
  var offsets = ccIconOffsets(cc), n = offsets.length, emfV = cEmf(), st = curState(), k;
  // rr.i drives the "i.r" label on the representative cell -- it must be the
  // current actually flowing through THIS one physical cell (i_through_cell),
  // never the total loop current. SERIES: i_through_cell === i (one path), so
  // this is a no-op there. PARALLEL: i_through_cell = i/cell_count -- the label
  // was reading 1.50V (=total i * r) instead of the correct 0.75V (=branch i *
  // r), directly contradicting the ladder's own half-height step drawn a few
  // pixels away (eye-walker: combo_cells_parallel_ir_label_uses_total_current).
  // heat (the i^2r halo) is fixed the same way -- it's THIS cell's own
  // dissipation, not the loop's.
  var rr = (st && st.show_r) ? { r: cIntR(), i: cc.phys.iPerCell, reveal: 1,
    heat: constrain((cc.phys.iPerCell * cc.phys.iPerCell * cIntR()) / 4.5, 0, 1) } : null;
  var isParallel = (cc.iconTopology === 'parallel');
  // Round 2 (founder 2026-07-19, "parallel ladder still illegible"): the
  // parallel cells' own plate+chip brightness gets a dim FLOOR -- max(dim,
  // 0.6) -- so they never fade sub-perceptual when the bank isn't the
  // state's declared glow_focal. Confirmed correct by the controller as-is;
  // round 3 leaves this one alone.
  var cellDim = isParallel ? max(dim, 0.6) : dim;
  // Round 3 (founder 2026-07-20, "the ladder IS circuit wire, same status as
  // the main loop"): the ladder's OWN floor is raised separately from the
  // cells' -- max(dim, 0.9) puts its effective alpha at ~0.75-0.85 (matching
  // drawWireC's own flat 0.85 main-loop call almost exactly), vs round 2's
  // 0.6 floor which only reached ~0.51. Kept as its own variable (not reused
  // for cellDim) so this bump can't accidentally re-brighten the cell plates/
  // chips the controller already signed off on at the 0.6 level.
  var ladderFloor = isParallel ? max(dim, 0.9) : dim;
  // A countable bank names its members ("cell 1"/"cell 2"/...) IN THE CHIP text
  // (no extra vertical row needed). Round 1 restricted this to series only,
  // because CC_PARALLEL_SPACING was tuned for the PLAIN chip's width and two
  // ordinal-prefixed chips at that pitch collided outright (eye-walker:
  // combo_cells_parallel_ordinal_chips_overlap). Round 2 widens the parallel
  // pitch specifically so the ordinal fits -- parallel cells are now
  // countable BOTH by structure (own rung) AND by label, matching series'
  // own treatment instead of a visually lesser one (Rule 29).
  var showOrdinal = n > 1;
  // PARALLEL = a real ladder, not a same-y row of icons (founder 2026-07-19:
  // "S5 parallel looks the same as S2 series at a glance"): two horizontal
  // rails bracket every cell's plates, a vertical rung drops from rail to rail
  // at each cell beyond the first (the first cell's rung IS the main wire
  // itself, already drawn by drawWireC — no separate segment needed there),
  // and a junction dot marks where the rails branch off the main wire — these
  // two dots ARE the visual claim "same two nodes -> same V", so they're drawn
  // deliberately bright + big, never left to the ladder's own (possibly
  // floored-low) alpha. Uses the drawWireC main-wire idiom (same helper, same
  // #546E7A, same 0.85 base alpha as loops.series) so the ladder reads as
  // "more wire", not a separate decorative rectangle. Drawn BEFORE the cell
  // loop below (main-wire-then-cell-on-top, the same convention the k=0
  // representative cell + drawWireC already use) so every plate renders
  // cleanly on top of its rung, never a rung line cutting across a glyph.
  // Reads during a regroup/cycle_compare morph too, since offsets are already
  // interpolating (the rungs progressively spread as the icons glide apart).
  if (isParallel && n > 1) {
    var railHalf = CC_RAIL_HALF, railTop = g.midY - railHalf, railBot = g.midY + railHalf;
    var xLast = g.leftX + offsets[n - 1].dx, kx;
    var ladderA = 0.85 * ladderFloor;
    drawWireC([{ x: g.leftX, y: railTop }, { x: xLast, y: railTop }], '#546E7A', ladderA, 3);
    drawWireC([{ x: g.leftX, y: railBot }, { x: xLast, y: railBot }], '#546E7A', ladderA, 3);
    for (kx = 1; kx < n; kx++) {
      var rx = g.leftX + offsets[kx].dx;
      drawWireC([{ x: rx, y: railTop }, { x: rx, y: railBot }], '#546E7A', ladderA, 3);
    }
    noStroke(); fillHex('#ECEFF1', 0.95 * ladderFloor);
    ellipse(g.leftX, railTop, 11); ellipse(g.leftX, railBot, 11);
  }
  for (k = 0; k < n; k++) {
    var x = g.leftX + offsets[k].dx, y = g.midY + offsets[k].dy;
    var lbl = showOrdinal ? ('cell ' + (k + 1)) : null;
    if (k === 0) {
      // chipDx: only cell 1's own ordinal-widened chip in PARALLEL needs the
      // nudge (it's the one sitting exactly on the main wire's x -- see the
      // comment on ccDrawRepresentativeCell). Series' plain/ordinal chip at
      // dim=1 or dim=0.35 was never flagged and stays untouched (chipDx=0).
      var chipDx = (isParallel && showOrdinal) ? 40 : 0;
      ccDrawRepresentativeCell(x, y, emfV, cellDim, !cc.phys.switchOpen, rr, lbl, chipDx);
    } else {
      ccDrawStdCell(x, y, emfV, cellDim, (k === 1) ? cc.iconFlipFrac : 0, lbl);
    }
  }
}
function ccDrawChip(str, dim) {
  var cx = width * 0.30, cy = height * 0.87;
  textSize(13); textStyle(BOLD); textAlign(CENTER, CENTER);
  var w = textWidth(str) + 28, h = 28;
  rectMode(CENTER); fillHex('#0A0A1A', 0.88 * dim); noStroke(); rect(cx, cy, w, h, 6);
  strokeHex('#80DEEA', 0.85 * dim); strokeWeight(1.5); noFill(); rect(cx, cy, w, h, 6);
  rectMode(CORNER); noStroke();
  fillHex('#80DEEA', 0.95 * dim); text(str, cx, cy); textStyle(NORMAL);
}
// show_branch_split (S6) -- PRE-AUTHORIZED FALLBACK (physics_author's own note in
// the physics block): per-branch NUMERIC chips beside each cell, alongside the
// ladder's already-half-height toll step (ccFormula's parallel branch), carries
// the pedagogy without a bespoke per-branch bead-stream geometry.
function ccDrawBranchSplit(cc, g, phys) {
  var offsets = ccIconOffsets(cc), dim = dimFor('cells'), railHalf = CC_RAIL_HALF, k;
  for (k = 0; k < offsets.length; k++) {
    var x = g.leftX + offsets[k].dx, y = g.midY + offsets[k].dy;
    // Each rung's own current label sits BELOW that rung's rail (not below the
    // cell's own y — with the ladder's generous pitch (CC_PARALLEL_SPACING)
    // adjacent labels clear horizontally most of the time; the k%2 vertical
    // stagger (kept from the pre-ladder layout) is the safety net for the
    // ~9px width overrun a "i/2 = 1.50 A" label can still have at the tightest
    // authored spacing (eye-walker: combo_cells_branch_split_labels_overlap).
    var yOff = railHalf + 18 + (k % 2) * 16;
    fillHex('#80DEEA', 0.95 * dim); textSize(11); textStyle(BOLD); textAlign(CENTER, TOP);
    text('i/' + phys.cellCount.toFixed(0) + ' = ' + phys.iPerCell.toFixed(2) + ' A', x, y + yOff);
    textStyle(NORMAL);
  }
}
// The r_eq invariant chip (finding 5) -- value-only per Rule 34b, mirrors ccDrawChip's
// box idiom but in the r_internal orange so it visually ties to the opened-casing r
// zigzag it's proving. Rendered whenever the caller's derived condition fires
// (switch_close_cue/flip_cell/R_autosweep_down -- S3/S4/S6 in the current JSON).
function ccDrawREqChip(rEq, dim) {
  var str = 'r_eq = ' + rEq.toFixed(2) + ' \\u03A9';
  var cx = width * 0.30, cy = height * 0.94;
  textSize(13); textStyle(BOLD); textAlign(CENTER, CENTER);
  var w = textWidth(str) + 28, h = 28;
  rectMode(CENTER); fillHex('#0A0A1A', 0.88 * dim); noStroke(); rect(cx, cy, w, h, 6);
  strokeHex('#FF8A65', 0.85 * dim); strokeWeight(1.5); noFill(); rect(cx, cy, w, h, 6);
  rectMode(CORNER); noStroke();
  fillHex('#FF8A65', 0.95 * dim); text(str, cx, cy); textStyle(NORMAL);
}
function ccAsNum0(v) { return (typeof v === 'number') ? v : 0; }
// S7 compare_grid -- authored FIXED strings (never computed), each gated by its
// own reveal_at_ms; once both cells sharing an R_label have landed, the winner
// brightens and the loser dims (Rule 29 brightness, never size).
function ccDrawCompareGrid(grid, dim) {
  var cols = 2, cellW = width * 0.185, cellH = height * 0.085, gapX = 10, gapY = 8;
  var x0g = width * 0.20, y0g = height * 0.05, gi, gj;
  for (gi = 0; gi < grid.length; gi++) {
    var item = grid[gi];
    if (PM_simTimeMs < ccAsNum0(item.reveal_at_ms)) continue;
    var col = gi % cols, row = floor(gi / cols);
    var cx = x0g + col * (cellW + gapX) + cellW / 2, cy = y0g + row * (cellH + gapY) + cellH / 2;
    var pairRevealed = false;
    for (gj = 0; gj < grid.length; gj++) {
      if (gj !== gi && grid[gj].R_label === item.R_label && PM_simTimeMs >= ccAsNum0(grid[gj].reveal_at_ms)) pairRevealed = true;
    }
    var cellDim = (pairRevealed && !item.winner) ? dim * 0.55 : dim;
    rectMode(CENTER); fillHex('#0E1024', 0.9 * cellDim); noStroke(); rect(cx, cy, cellW - 4, cellH - 4, 6);
    strokeHex(item.winner ? '#66BB6A' : '#546E7A', (item.winner ? 0.95 : 0.6) * cellDim); strokeWeight(item.winner ? 2 : 1);
    noFill(); rect(cx, cy, cellW - 4, cellH - 4, 6); rectMode(CORNER); noStroke();
    fillHex('#FFD54F', 0.95 * cellDim); textSize(10); textStyle(BOLD); textAlign(CENTER, TOP);
    text((item.topology === 'parallel' ? 'Parallel' : 'Series') + ' @ ' + item.R_label, cx, cy - cellH / 2 + 6);
    fillHex(item.winner ? '#66BB6A' : '#FFFFFF', 0.98 * cellDim); textSize(14); textAlign(CENTER, BOTTOM);
    text(item.value, cx, cy + cellH / 2 - 6);
    textStyle(NORMAL);
  }
}
// Round 3 (founder 2026-07-20, "bead split through the parallel ladder — the
// real one"): builds the CC-specific path a bead takes when it's assigned to
// cell k's OWN branch (k>=1), reusing circuitBeadLoop/drawCircuitBeads/polyAt
// completely UNCHANGED (they're shared with combination_of_resistors/KCL/
// bridge/potentiometer -- zero risk of touching them). The shape is the SAME
// outer rectangle as loops.series (identical topY/rightX,topY/rightX,botY/
// leftX,botY corners) but with the direct left-edge passage (the one
// loops.series already takes straight through cell 1, at g.leftX) swapped for
// a detour: out along the top rail to cell k's rung, down through cell k's
// own plates, back along the bottom rail -- so a bead on this loop visibly
// rides the ladder instead of overlapping cell 1's wire. loop1 for the k=0
// branch is left as loops.series ITSELF (no rebuild needed -- it already
// passes straight through cell 1, "between the two junction dots", exactly
// as today).
function ccParallelBeadLoop(g, offsets, k) {
  var railTop = g.midY - CC_RAIL_HALF, railBot = g.midY + CC_RAIL_HALF;
  var rx = g.leftX + offsets[k].dx;
  var battK = { x: rx, y: g.midY };
  return [battK, { x: rx, y: railTop }, { x: g.leftX, y: railTop },
          { x: g.leftX, y: g.topY }, { x: g.rightX, y: g.topY }, { x: g.rightX, y: g.botY }, { x: g.leftX, y: g.botY },
          { x: g.leftX, y: railBot }, { x: rx, y: railBot }, battK];
}
function drawCellComboScenario() {
  var cc = ccCombo(), phys = cc.phys, st = curState();
  var loops = circuitLoops(), g = loops.g;
  drawWireC(loops.series, '#546E7A', 0.85, 3);
  // Bead ROUTING keys off the PHYSICS phase (cc.phys.topology), never the icon/
  // shape phase -- S7's cycle_compare snaps both at the exact same moment (see
  // ccCyclePhys), and S5's regroup icon leads phys (icon is 'parallel' from
  // t=0, phys catches up later) so the ladder this reads offsets from is
  // ALWAYS already drawn in its parallel shape by the time phys agrees; S5
  // itself has switch open (i=0) so its beads halt regardless (matches
  // circuitBeadLoop's own itot<=1e-9 -> 'series' fallback). Falls straight
  // through to the EXACT original single-loop call for every non-parallel
  // phase (series states are untouched -- same object shape, same values).
  var beadLoops = loops;
  var beadC = { topo: 'series', single: true, i1: phys.i, i2: phys.i, itot: phys.i,
                Req: phys.R, V: phys.epsEq, R1: phys.R, R2: phys.R, dir: 1 };
  if (phys.topology === 'parallel') {
    var bOffsets = ccIconOffsets(cc), bN = bOffsets.length;
    if (bN >= 2) {
      beadLoops = { series: loops.series, loop1: loops.series, loop2: ccParallelBeadLoop(g, bOffsets, 1) };
      beadC = { topo: 'parallel', i1: phys.iPerCell, i2: phys.iPerCell, itot: phys.i, dir: 1 };
      if (bN >= 3) {                                    // cell_count=3 is EXPLORE-only (S8), never an authored guided state
        beadLoops.loop3 = ccParallelBeadLoop(g, bOffsets, 2);
        beadC.three = true;
      }
    }
  }
  drawCircuitBeads(beadLoops, beadC);
  var rl = (abs(phys.R - round(phys.R)) < 0.005) ? String(round(phys.R)) : String(round(phys.R * 100) / 100);
  drawResistorBoxC((g.leftX + g.rightX) / 2, g.topY, 'R = ' + rl + ' \\u03A9', dimFor('load'));
  drawAmmeterAtC(g.amMain.x, g.amMain.y, phys.i, 'AMMETER', dimFor('ammeter'), 26);

  ccDrawCells(cc, g, dimFor('cells'));
  drawIrSwitch(g, phys.switchOpen, dimFor('switch'));

  if (st && st.show_voltmeter) {
    // Relocated WELL clear of the bank (founder 2026-07-19: the voltmeter used
    // to sit at leftX+82, dead centre of the parallel spread) -- up and into
    // the loop interior, above the plates' own row and above the parallel
    // rails (CC_RAIL_HALF around midY), so it never intersects a cell symbol,
    // its ordinal/eps chip, the ladder rails, or the branch-split labels below
    // them regardless of topology or cell_count.
    var vmDim = dimFor('voltmeter'), vx = g.leftX + 120, vy = g.midY - 90;
    strokeHex('#B39DDB', 0.7 * vmDim); strokeWeight(1.5);
    line(g.leftX - 6, g.midY, vx - 10, vy + 14); line(g.leftX + 6, g.midY, vx + 10, vy + 14);
    noStroke();
    drawVoltmeterC(vx, vy, phys.V, max(phys.epsEq * 1.5, phys.V, 0.01), vmDim);
  }
  if (st && st.show_ladder) {
    drawPotentialLadder(phys.epsEq, phys.i, phys.R, phys.switchOpen, 1, null, 0, null,
      { mode: 'combo', topology: phys._ladderTopology, cellCount: phys._growCount,
        flipFrac: phys.flipFrac, emf: cEmf(), r: cIntR(), i: phys.i, V: phys.V, epsEq: phys.epsEq,
        stepPerCell: phys.stepPerCell, tallPanel: !!(st && st.show_sliders === true) });
  }
  if (st && st.compare_readout && typeof st.compare_chip === 'string') ccDrawChip(st.compare_chip, dimFor('formula'));
  if (st && typeof st.ghost_text === 'string') drawStruckTextC(width * 0.30, height * 0.80, st.ghost_text, dimFor('formula'));
  if (st && st.show_branch_split && phys.topology === 'parallel') ccDrawBranchSplit(cc, g, phys);
  if (st && st.compare_grid && st.compare_grid.length) ccDrawCompareGrid(st.compare_grid, dimFor('formula'));
  // r_eq is the STATE's own taught invariant on S3 (first introduced)/S4 (proven to
  // HOLD across the flip -- the state's own misconception_watch text)/S6 (halves in
  // parallel) but none of the three shows visible_controls containing the readout
  // panel and none carries a compare_chip that names it -- a viewer had no on-screen
  // way to verify the claim (eye-walker: combo_cells_r_eq_chip_narrated_but_not_
  // rendered). Derived from the SAME semantic flags that make each state what it is
  // (never a hardcoded stateId list), so it stays correct if states get reordered.
  // Floor-clamped opacity (matches the DOM formula overlay's own convention) so it
  // stays legible even when a different element is the state's declared focal.
  if (st && (st.switch_close_cue === true || st.flip_cell === true || st.R_autosweep_down === true)) {
    ccDrawREqChip(phys.rEq, max(dimFor('r_internal'), 0.6));
  }
}
function drawIrScenario() {
  // combination_of_cells EXTENDS this scenario_type with grouped-cell sliders —
  // gated on hasSlider('cell_topology') so internal_resistance.json (no such
  // slider) never enters this branch and renders byte-identically below.
  if (ccMode()) { drawCellComboScenario(); return; }
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

// ═══ GAS BOX (scenario_type: 'gas_box') ═════════════════════════════════════
// A closed 2D box of hard-disc particles: the shared substrate for kinetic
// theory, Maxwell-Boltzmann, diffusion, collision theory, rates and
// equilibrium (chemistry P1 cluster + physics T27). Built 2026-07-27.
//
// WHY A THIRD FAMILY, not a widening of stepPhysics: the existing free-drift
// path models a CONDUCTOR's electron gas -- every carrier carries the same
// |v|, direction is randomised on a timer against a fixed lattice, and the
// walls WRAP. None of those three survive contact with kinetic theory. A gas
// needs a real speed DISTRIBUTION (not one speed), momentum-conserving
// particle-particle collisions (not a timer), and BOUNCING walls -- wrapping
// walls carry no wall impulse, so there is no pressure to read. So gas_box
// branches beside isCircuitFamily(); drift_velocity / resistivity / the
// circuit family are byte-untouched.
//
// PHYSICS HONESTY -- READ BEFORE AUTHORING A STATE THAT PRINTS A FORMULA:
// this is a TRUE 2D gas, so its speed distribution is the 2D Maxwell-Boltzmann
// (Rayleigh) form f(v) proportional to v*exp(-mv^2/2kT) -- NOT the 3D
// f(v) proportional to v^2*exp(-mv^2/2kT) printed in NCERT. Every qualitative
// beat a lesson actually needs is identical in 2D and 3D: the peak shifts
// right with T, the peak lowers, the high-speed tail lengthens, the area stays
// 1, and v_mp < v_avg < v_rms. The histogram overlays the 2D theory curve, so
// nothing drawn on screen is wrong. But a state that prints the 3D formula is
// printing a law this box does not obey -- put the 3D algebra on a formula
// surface that does not claim to be measured from this box.
// (A fake third velocity component would make the histogram match the textbook
// while making the collision handler lie. That trade was refused deliberately.)
//
// PRESSURE UNITS: arbitrary but SELF-CONSISTENT -- impulse per unit wall
// length per unit time, in px/tick units. The 'show_gas_law' HUD reads
// P*A / N*T, which sits at 60*speed_scale^2 (0.79 at the 0.115 default) and
// holds across temperature and piston position -- measured, not asserted.
// Two honest limits, because this HUD is the one that claims to prove a law:
//   * these are hard DISCS, not points, so the true 2D equation of state is
//     P*A = N*k*T*(1 + 2*eta + ...) with eta the packing fraction. The flat
//     identity is the DILUTE limit and it drifts UP as the box is packed.
//     Measured on the bring-up config (130 discs, r=5): open box eta=4.5%,
//     readout 0.843; piston at 0.45 eta=10.1%, readout 0.935 -- a +11% rise
//     against the +10% the 2D virial term predicts. So the deviation is real
//     physics, not drift, and it is exactly the ideal-vs-real-gas story.
//     AUTHORING CONSEQUENCE: do not narrate "this number stays constant" over
//     a state that compresses hard. Either keep the compression gentle, or
//     teach the rise as the point (real gases deviate under compression).
//   * wall strikes are Poisson, so the number is an AVERAGE over a 3 s window.
//   * collisions are detected once per 1/60 s tick, not continuously, so a
//     particle moving a large fraction of its own radius per tick has some of
//     its contacts resolved late. Measured cost: the readout sags ~6% from
//     300 K to 800 K at the default speed_scale. Keep per-tick travel well
//     under the disc radius (speed_scale*sqrt(T_max) below about r/2) and it
//     stays inside a few percent.
// Within those limits it is a genuine live self-check on this engine.
//
// DETERMINISM (Rule 36 + THE EYE): every random draw goes through pr() (seeded
// mulberry32, reseeded on each state entry), the pair sweep visits pairs in a
// fixed ascending index order, and nothing here reads p5's random() or
// wall-clock time -- so SET_TIME_FREEZE re-simulation reproduces frames
// exactly. Each step is one fixed 1/60 s tick, linear in dt.
// ─────────────────────────────────────────────────────────────────────────────
var gasSpecies = [];
var gasPistonF = 1;          // live piston fraction of full box width
var gasPistonVx = 0;         // piston speed px/tick (compression does work)
var gasWallImpulse = 0;      // impulse accumulated this tick
var gasPressureWin = [];     // rolling per-tick impulse (pressure window)
var gasPressure = 0;
var gasCollTotal = 0;        // particle-particle collisions since state entry
var gasCollTick = 0;
var gasCollWin = [];
var gasCollRate = 0;         // collisions/s
var gasSuccessTotal = 0;     // collisions at or above activation energy
var gasSuccessTick = 0;
var gasSuccessWin = [];
var gasSuccessRate = 0;
var gasFlashes = [];         // { x, y, age } successful-collision flashes
var gasBarrierOn = false;
var gasTempK = 300;          // thermostatted temperature (K)
// ARRHENIUS ACCUMULATOR (2026-07-29). Windowed samples of the cleared fraction
// against the temperature they were taken at, so a state can DRAW the law the
// box obeys instead of asserting it. Accumulated in the PHYSICS step, never in
// the draw loop, so SET_TIME_FREEZE re-simulation reproduces the plot exactly.
var gasArrPts = [];          // { invT, lnf } — one measured point per window
var gasArrWinC = 0, gasArrWinS = 0, gasArrWinT = 0, gasArrWinN = 0;
var gasArrAxis = null;       // { x0, x1, y0, y1 } solved once at state entry, so points move against a FIXED frame

// ─── REACTION LAYER (A + B \\u21CC AB) — 2026-07-28 ──────────────────────────
// Turns the box into a reacting mixture so equilibrium can be WATCHED rather
// than asserted: two particles that meet hard enough stick together, a dimer
// that is hit hard enough breaks apart, and the two rates settle equal while
// both keep running. That last sentence is the whole of dynamic equilibrium and
// there is no way to draw it on a whiteboard.
//
// THE THREE CONSERVATION LAWS, and how each is kept EXACTLY (not approximately):
//   * MASS      — m_AB is forced to m_A + m_B at init; a mis-authored species
//                 list is corrected, not obeyed. Disc area adds the same way
//                 (r_AB = sqrt(r_A^2 + r_B^2)), so the packing fraction is
//                 unchanged by a reaction and the gas-law readout stays honest.
//   * MOMENTUM  — a merge takes the centre-of-mass velocity; a split places the
//                 fragments symmetrically about the COM with equal and opposite
//                 momenta. Both are exact per event, so the box never acquires
//                 a drift from reacting.
//   * ENERGY    — accounted in an explicit LEDGER, never hand-waved:
//                     E = sum(KE_translational) + sum(KE_rotational of dimers)
//                         + gasHeatQ - N_AB * E_bond
//                 On a merge the relative kinetic energy splits into a REAL
//                 rotation of the new dimer (from the angular momentum the
//                 off-centre impact actually carried) and heat; the bond energy
//                 is added to the heat owed. On a split the bond energy is
//                 debited and the dimer's spin becomes the fragments' flight
//                 apart. gasApplyHeat() then hands that reservoir to the gas as
//                 a velocity rescale. gasEnergyLedger() recomputes E from the
//                 particles every tick and 'show_energy_ledger' prints it: under
//                 adiabatic:true with the piston parked it must not move. That
//                 HUD exists because the last session's lesson was that a green
//                 deterministic gate proves frames are REPRODUCIBLE, not right —
//                 only a measurement catches a lying physics step.
//
// WHY THE REVERSE BARRIER IS DERIVED, NOT AUTHORED: Ea_rev = Ea_fwd + E_bond.
// An author who could set all three independently could describe a reaction
// that releases energy going forward AND going back. Deriving it means heating
// an exothermic box shifts it toward reactants ALL BY ITSELF — Le Chatelier
// emerges from the collision statistics instead of being scripted, which is the
// only reason the sim is worth more than a diagram. Sign convention:
// bond_energy_kT > 0 = exothermic forward (heat out), < 0 = endothermic.
//
// COMPRESSION SHIFTS IT TOO, for free: forward needs an A to FIND a B (rate goes
// as density^2), reverse needs only a hit on an existing AB (density^1). Halve
// the volume and the forward rate gains more — 2 particles becoming 1, the
// textbook pressure prediction, emergent from the same collision sweep.
var gasRxFwdTotal = 0, gasRxFwdTick = 0, gasRxFwdWin = [], gasRxFwdRate = 0;
var gasRxRevTotal = 0, gasRxRevTick = 0, gasRxRevWin = [], gasRxRevRate = 0;
var gasRxQueue = [];         // events staged during the pair sweep, applied after it
var gasRxNew = [];           // particles created this tick
var gasHeatQ = 0;            // energy owed TO the gas (+) or BY it (-), px/tick units
var gasCountsBySp = [];      // live population per species index
var gasConcTrace = [];       // rolling composition history for the concentration graph
var gasRxSpA = -1, gasRxSpB = -1, gasRxSpAB = -1;
var gasNPrev = -1;           // last N target seen (reaction mode: N is a delta control)
var gasInjFired = false;     // authored injection cue: one-shot per state entry
var gasKWin = [];            // rolling window of the instantaneous K ratio
var gasKMean = 0;            // what the K chip actually prints (windowed mean)
var gasRxRateMax = 1;        // per-state high-water rate — the bars' stable full scale

function gasMode() { return !!(config && config.scenario_type === 'gas_box'); }
function gasCfg() { return (config && config.gas) ? config.gas : {}; }
function gasHasGraphPane() { return gasCfg().layout === 'with_graph'; }

// ─── Box geometry (constant across states — Rule 32d home-pose continuity) ──
function gasPad() { var b = gasCfg().box; return (b && typeof b.pad === 'number') ? b.pad : 44; }
function gasBoxL() { return gasPad(); }
// Rule 34d zoning: the instrument row owns a band above the box, and that band
// starts at 56px so it clears the review chrome's "Full screen" button. The box
// top is pushed down to make room — instruments never overlap the gas.
function gasHudTop() { return 56; }
// The band reserved above the apparatus is sized for the TALLEST instrument that
// can appear in it. The reaction readout is 68px where the pressure/thermometer
// chips are 28, and the 32px gap left 35px of the chip hanging inside the box:
// the border line was drawn straight across the fwd row and live particles
// drifted through the totals line (the chip is only 59% opaque). Gated on
// reaction mode, so every existing gas_box concept keeps its exact geometry.
function gasBoxT() { return gasHudTop() + (gasRxOn() ? 76 : 32); }
function gasBoxB() { return microH() - gasPad(); }
// The box always owns the full canvas. It used to shrink to 58% whenever
// layout:'with_graph' was set — unconditionally, in EVERY state — which left
// 42% of the canvas black in five of seven states, from STATE_1, before any
// histogram or piston existed. That read as broken rather than reserved.
// The histogram now draws as an instrument panel OVER the tank instead of
// beside it, so the geometry stays constant across states (Rule 32d) with no
// dead space, and the teacher can dismiss the panel from the widget menu.
function gasBoxRFull() { return width - gasPad(); }
function gasBoxR() { return gasBoxL() + (gasBoxRFull() - gasBoxL()) * gasPistonF; }
function gasBoxMidX() { return (gasBoxL() + gasBoxRFull()) * 0.5; }
function gasBoxArea() { return max(1, (gasBoxR() - gasBoxL()) * (gasBoxB() - gasBoxT())); }

// ─── Authored quantities (slider wins, then state, then config default) ─────
// DRAG-SEIZE (the pattern ohms_law/resistivity already use here): the state's
// AUTHORED value owns the knob until the teacher actually drags that slider,
// and userTouched is cleared on every state entry. Checking hasSlider() first
// was a real bug — a concept that exposes a T slider for its explore state had
// the slider's DEFAULT silently overrule every guided state's authored T, so
// "heat the gas" states rendered at the default temperature.
// RESOLUTION ORDER, and the third rung is the dangerous one:
//   1. the teacher's drag, once they have actually seized the control
//   2. the value THIS state authored
//   3. a STABLE declared default — never the live slider state
// Rung 3 originally read sliderVal(), i.e. userParams[], which is exactly what
// applyStateVisuals writes when it re-syncs an unseized slider thumb to the
// authored value. That closed a loop: STATE_4 authored piston_frac 0.5, the
// re-sync stored 0.5 into userParams.V, and every LATER state that authored no
// piston_frac read it straight back — so the aha state (STATE_5), the gas-law
// state (STATE_6) and the explore state all silently opened in a half-width box
// with a stray piston, and STATE_6 ran at 9.2% packing, outside the dilute
// regime its own readout is only valid in. Order-dependent, so it also broke
// Rule 25d teacher reordering. Resolving to a declared default breaks the loop.
function gasStableDefault(id, fallback) {
  var defs = sliderDefs();
  if (defs && defs[id] && defs[id].default !== undefined) return defs[id].default;
  return fallback;
}
function gasTargetT() {
  var st = curState() || {};
  if (hasSlider('T') && userTouched['T']) return sliderVal('T');
  var g = gasCfg();
  var base = (typeof st.T === 'number')
    ? st.T
    : gasStableDefault('T', (typeof g.temperature_K === 'number') ? g.temperature_K : 300);
  // T_from drives the entry ramp on the TARGET, so the existing thermostat
  // tracks a moving setpoint and the gas heats (or cools) at an authored,
  // watchable pace instead of snapping. Deliberately a timed ramp rather than
  // the thermostat's own 10%/tick ease, which settles in ~0.7 s — too quick to
  // read as the cause beat Rule 32a asks for, and not authorable per state.
  // Deterministic: PM_simTimeMs advances in fixed 1/60 s steps, so THE EYE's
  // pinned re-simulation reproduces the ramp frame for frame.
  if (typeof st.T_from === 'number') {
    var dur = (typeof st.T_ramp_ms === 'number') ? max(1, st.T_ramp_ms) : 2000;
    // T_cue holds the box at T_from until an authored cue fires, then starts the
    // ramp FROM the cue. Without it the ramp begins at state entry, so a state
    // that binds its narration to a cue ("now the thermostat heats it") can have
    // the heating already finishing as the sentence plays — the cue/narration
    // desync scar inverted. Omit T_cue and the behaviour is byte-identical to
    // before, so every shipped T_from state keeps its exact baselines.
    var tStart = 0;
    if (st.T_cue) {
      if (cueFiredAt[st.T_cue] === undefined) return st.T_from;
      tStart = cueFiredAt[st.T_cue];
    }
    var f = constrain((PM_simTimeMs - tStart) / dur, 0, 1);
    return st.T_from + (base - st.T_from) * f;
  }
  return base;
}
function gasTargetPistonF() {
  var st = curState() || {};
  if (hasSlider('V') && userTouched['V']) return constrain(sliderVal('V'), 0.2, 1);
  if (typeof st.piston_frac === 'number') return constrain(st.piston_frac, 0.2, 1);
  return constrain(gasStableDefault('V', 1), 0.2, 1);   // no piston authored = open box
}
function gasCount() {
  var st = curState() || {};
  if (hasSlider('N') && userTouched['N']) return max(2, floor(sliderVal('N')));
  if (typeof st.N === 'number') return max(2, floor(st.N));
  var g = gasCfg();
  return max(2, floor(gasStableDefault('N', (typeof g.count === 'number') ? g.count : 110)));
}
// Activation energy, in the same px/tick energy units the collision test uses.
// Authored per state so a single box can teach "raise T, more collisions clear
// the barrier" without any engine change.
// Activation energy. PREFER the _kT form: raw energy is in px/tick units that
// nobody can reason about (0.09 sounds like a barrier and is in fact ~2% of the
// mean energy — it let 95.6% of collisions through on the first bring-up run).
// activation_energy_kT is a multiple of the mean particle energy at the
// REFERENCE temperature, which is how chemistry actually talks about Ea: ~2-4
// kT is a barrier most collisions fail. It is pinned to ea_ref_T (not to the
// live T) precisely so that raising T raises the success fraction — if Ea
// tracked T, heating the gas would change nothing and the lesson would die.
// One kT at the REFERENCE temperature, in the px/tick energy units the collision
// test uses. Mean kinetic energy per particle in 2D = k_eff*T with k_eff = s^2.
function gasEaKtRef() {
  var g = gasCfg();
  var refT = (typeof g.ea_ref_T === 'number') ? g.ea_ref_T
    : (typeof g.temperature_K === 'number') ? g.temperature_K : 300;
  var s = gasSpeedScale();
  return s * s * refT;
}
function gasActivationE(state) {
  // The teacher's barrier slider, in kT of ea_ref_T — the SAME unit the author
  // writes. It used to read sliderVal('Ea') as a RAW px/tick energy, which is a
  // number nobody can reason about (Rule 33d) and which no shipped concept ever
  // declared, so nothing depended on the old units.
  //
  // The userTouched guard is the load-bearing half. Every other gas slider has
  // one (gasTargetT, gasTargetPistonF, gasCount); this one did not, so merely
  // DECLARING the slider silently replaced every state's authored barrier with
  // the slider default. Measured before the fix: a concept authoring
  // activation_energy_kT 3 (raw 9.9225, 3.16% of collisions clearing) ran at
  // raw 6.6 / 10.01% the moment an Ea slider appeared in slider_controls — on
  // every state, whether or not a teacher had touched anything.
  if (hasSlider('Ea') && userTouched['Ea']) return max(0, sliderVal('Ea') * gasEaKtRef());
  var g = gasCfg();
  var nkT = null;
  // A cue-driven drop in the barrier — "the catalyst goes in NOW" (Rule 32a),
  // so the change is WATCHED arriving instead of being a between-state
  // comparison the narration has to assert. Mirrors reaction_at_cue exactly.
  if (state && state.ea_at_cue && state.ea_at_cue.cue
      && typeof state.ea_at_cue.activation_energy_kT === 'number'
      && cueFiredAt[state.ea_at_cue.cue] !== undefined) {
    var toKT = state.ea_at_cue.activation_energy_kT;
    // ramp_ms makes the barrier SLIDE rather than jump-cut. A state whose whole
    // declared archetype is "the bar comes down" delivered a single-frame step
    // without it — the motion the state exists to show lasting exactly one
    // frame, which no frame-sampled gate would ever catch as missing.
    var eaRamp = (typeof state.ea_at_cue.ramp_ms === 'number') ? state.ea_at_cue.ramp_ms : 0;
    if (eaRamp > 0) {
      var fromKT = (typeof state.activation_energy_kT === 'number') ? state.activation_energy_kT
        : (typeof g.activation_energy_kT === 'number') ? g.activation_energy_kT : toKT;
      var eaF = constrain((PM_simTimeMs - cueFiredAt[state.ea_at_cue.cue]) / eaRamp, 0, 1);
      nkT = fromKT + (toKT - fromKT) * eaF;
    } else nkT = toKT;
  }
  else if (state && typeof state.activation_energy_kT === 'number') nkT = state.activation_energy_kT;
  else if (typeof g.activation_energy_kT === 'number') nkT = g.activation_energy_kT;
  if (nkT !== null) return max(0, nkT * gasEaKtRef());
  if (state && typeof state.activation_energy === 'number') return max(0, state.activation_energy);
  return (typeof g.activation_energy === 'number') ? max(0, g.activation_energy) : 0;
}
function gasSpeciesList() {
  var g = gasCfg();
  if (g.species && g.species.length) return g.species;
  return [{ id: 'A', mass: 1, radius: 5, color: '#60A5FA', label: 'A' }];
}

// ─── Reaction configuration ────────────────────────────────────────────────
function gasRxCfg() { var g = gasCfg(); return g.reaction || null; }
// PER-STATE enable, over the config-level default (2026-07-29). The config
// reaction block is the whole box's chemistry, but a lesson routinely needs
// the SAME apparatus with the reaction switched OFF — collision theory spends
// five states counting collisions against a barrier where nothing may bond, and
// turns bonding on in exactly one state to show that clearing the barrier is
// necessary but not sufficient.
//
// Without this the only way to express that is an enormous fake activation_fwd_kT
// on every other state: a number chosen to make a reaction not happen, sitting
// in the file looking like physics. This says what it means instead, and the
// suppression trick cannot be silently under-tuned into a slow leak of product.
function gasRxOn() {
  var r = gasRxCfg();
  if (!r) return false;
  var st = curState();
  var en = (st && st.reaction && typeof st.reaction.enabled === 'boolean')
    ? st.reaction.enabled
    : (r.enabled !== false);
  return !!(en && gasRxSpAB >= 0 && gasRxSpA >= 0 && gasRxSpB >= 0);
}
function gasSpIdxById(id) {
  for (var i = 0; i < gasSpecies.length; i++) if (gasSpecies[i].id === id) return i;
  return -1;
}
// kT of the REFERENCE temperature -> px/tick energy. Identical conversion to
// gasActivationE's (mean 2D kinetic energy per particle = speed_scale^2 * T),
// pinned to ea_ref_T and never to the live T — a barrier that tracked
// temperature would make heating the gas change nothing, which kills both
// lessons at once.
function gasKtToEnergy(nkT) {
  var g = gasCfg();
  var refT = (typeof g.ea_ref_T === 'number') ? g.ea_ref_T
    : (typeof g.temperature_K === 'number') ? g.temperature_K : 300;
  var s = gasSpeedScale();
  return nkT * s * s * refT;
}
// State override, then config, then default. A state may sharpen the barrier
// (the catalyst beat) without a second species list.
function gasRxNum(state, key, dflt) {
  var r = gasRxCfg() || {};
  // The teacher's Ea slider drives the FORWARD reaction barrier as well as the
  // collision counter's threshold, so the two barriers on screen stay ONE
  // number. Without this, dragging Ea moved "x% clear Ea" while the fwd/rev
  // bars ignored it — two instruments disagreeing about the same quantity in
  // the one state whose whole job is letting a teacher push on the barrier.
  // Ea_rev = Ea_fwd + E_bond still follows by derivation, so a dragged barrier
  // speeds both directions and leaves the equilibrium position alone — the
  // catalyst result stays emergent rather than asserted.
  if (key === 'activation_fwd_kT' && hasSlider('Ea') && userTouched['Ea']) return max(0, sliderVal('Ea'));
  // ea_at_cue drives the REACTION barrier too, not just the counter's threshold.
  // A catalyst that lowered the bar a counter measures against while leaving the
  // reaction's own barrier untouched is not a catalyst, and the energy hill —
  // whose peak is this number and whose product level is the bond energy — would
  // draw a reverse barrier that disagreed with the Ea_rev the engine derives.
  // Routed through gasActivationE so the cue's ramp is honoured once, in one
  // place, and the two barriers cannot drift apart mid-ramp.
  if (key === 'activation_fwd_kT') {
    var stEa = curState();
    if (stEa && stEa.ea_at_cue && stEa.ea_at_cue.cue && cueFiredAt[stEa.ea_at_cue.cue] !== undefined) {
      return max(0, gasActivationE(stEa) / max(gasEaKtRef(), 1e-9));
    }
  }
  // A cue-driven change to a reaction constant — "the catalyst goes in NOW".
  // Deliberately placed at the single read point for EVERY reaction constant
  // rather than special-cased on activation_fwd_kT, so the derived quantities
  // follow for free: gasRxEaRev computes Ea_rev = Ea_fwd + E_bond through this
  // same accessor, so lowering the forward barrier on a cue lowers the reverse
  // barrier by exactly as much. That is what keeps the catalyst's "much faster,
  // but the balance does not move" EMERGENT — the null result falls out of the
  // derivation instead of being asserted twice, which is the whole reason the
  // beat is worth watching rather than being told.
  if (state && state.reaction_at_cue && state.reaction_at_cue.cue
      && typeof state.reaction_at_cue[key] === 'number'
      && cueFiredAt[state.reaction_at_cue.cue] !== undefined) {
    return state.reaction_at_cue[key];
  }
  if (state && state.reaction && typeof state.reaction[key] === 'number') return state.reaction[key];
  if (typeof r[key] === 'number') return r[key];
  return dflt;
}
function gasRxBondE(state) { return gasKtToEnergy(gasRxNum(state, 'bond_energy_kT', 2.0)); }
function gasRxEaFwd(state) { return max(0, gasKtToEnergy(gasRxNum(state, 'activation_fwd_kT', 1.5))); }
// DERIVED — see the header note. Clamped at 0 so a strongly endothermic forward
// (bond_energy_kT < -activation_fwd_kT) degrades to a barrierless reverse
// rather than a negative one.
function gasRxEaRev(state) { return max(0, gasRxEaFwd(state) + gasRxBondE(state)); }
// The canonical bond length. Used for the dimer's moment of inertia at BOTH
// formation and dissociation — computing I from the live contact separation at
// formation and from a fixed length at the split would leak energy every cycle,
// which is the ratchet class of bug all over again.
// VIEWPORT INDEPENDENCE — without this the equilibrium POSITION depends on the
// size of the teacher's browser window, which is not a physical variable anyone
// chose. Forward is bimolecular (rate goes as density^2) and reverse is first
// order, so the balance point carries a factor of box AREA; the renderer fills
// the viewport, so a 1920-wide screen and the 900-wide authoring geometry settle
// at different compositions. Measured on identical authored constants: product
// 31 at the tuning geometry, 17 at 1440x900, 15 at 1920x1080 — so a state seeded
// at its measured plateau drifts on every screen but one, and every absolute
// number an author measures is true only on their own monitor.
//
// The normalisation divides by the FULL box area, never the piston-adjusted one.
// That is the whole trick: window size divides out, while the piston — the
// volume control a teacher actually drives — still moves the equilibrium exactly
// as Le Chatelier says it must.
//
// ref_area_px defaults to the 812x428 authoring geometry (a 900x560 canvas), the
// same geometry check_gas_reaction_physics.ts pins, so measured constants and
// gate numbers keep meaning the same thing.
function gasRxAreaNorm() {
  var g = gasCfg();
  var full = (gasBoxRFull() - gasBoxL()) * (gasBoxB() - gasBoxT());
  var ref = (typeof g.ref_area_px === 'number') ? g.ref_area_px : 347536;
  return (full > 1) ? (ref / full) : 1;
}
function gasRxColor() {
  var sp = (gasRxSpAB >= 0) ? gasSpecies[gasRxSpAB] : null;
  return (sp && sp.color) ? sp.color : '#E2E8F0';
}
function gasRxBondLen() {
  if (gasRxSpA < 0 || gasRxSpB < 0) return 1;
  return max(gasSpecies[gasRxSpA].radius + gasSpecies[gasRxSpB].radius, 0.5);
}
// Resolve species ids and ENFORCE the conservation-consistent dimer. A species
// list is authored by hand; this is the ledger check the chemistry_author role
// writes on paper, applied in code so it cannot be skipped.
function gasRxResolveSpecies() {
  gasRxSpA = -1; gasRxSpB = -1; gasRxSpAB = -1;
  var r = gasRxCfg();
  if (!r || r.enabled === false) return;
  var re = r.reactants || [];
  gasRxSpA = gasSpIdxById(re[0]);
  gasRxSpB = gasSpIdxById(re[1]);
  gasRxSpAB = gasSpIdxById(r.product);
  if (gasRxSpA < 0 || gasRxSpB < 0 || gasRxSpAB < 0) {
    if (window.console) console.warn('[gas_box] reaction species not found in species list', re, r.product);
    gasRxSpA = -1; gasRxSpB = -1; gasRxSpAB = -1;
    return;
  }
  var sA = gasSpecies[gasRxSpA], sB = gasSpecies[gasRxSpB], sAB = gasSpecies[gasRxSpAB];
  var mWant = sA.mass + sB.mass;
  var rWant = Math.sqrt(sA.radius * sA.radius + sB.radius * sB.radius);
  if (Math.abs((sAB.mass || 0) - mWant) > 1e-9 || Math.abs((sAB.radius || 0) - rWant) > 1e-6) {
    // Clone before correcting: gasSpecies aliases the config object, and a
    // silent in-place edit of authored data would survive into every later
    // state and every re-read of the same config.
    gasSpecies = gasSpecies.slice();
    var fixed = {}; for (var k in sAB) fixed[k] = sAB[k];
    fixed.mass = mWant; fixed.radius = rWant;
    gasSpecies[gasRxSpAB] = fixed;
    if (window.console) console.warn('[gas_box] product ' + (sAB.id || '?') + ' corrected to mass ' + mWant.toFixed(3) + ', radius ' + rWant.toFixed(2) + ' (mass + area conservation)');
  }
}
// Per-component velocity sigma: sigma = s*sqrt(T/m), so v_rms(2D) = sigma*sqrt(2)
// scales as sqrt(T/m) -- the real kinetic-theory dependence, in pixel units.
function gasSpeedScale() {
  var g = gasCfg();
  return (typeof g.speed_scale === 'number') ? g.speed_scale : 0.115;
}
function gasSigma(mass, T) {
  return gasSpeedScale() * Math.sqrt(max(T, 1) / max(mass, 0.0001));
}
// Box-Muller on the seeded stream (never p5 random() — determinism contract).
function gasGauss() {
  var u1 = max(pr(), 1e-9), u2 = pr();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(TWO_PI * u2);
}

// ─── Scene build (deterministic; jittered grid so nothing starts overlapped) ─
function gasInit() {
  particles = [];
  gasFlashes = [];
  gasWallImpulse = 0; gasPressureWin = []; gasPressure = 0;
  gasCollTotal = 0; gasCollTick = 0; gasCollWin = []; gasCollRate = 0;
  gasSuccessTotal = 0; gasSuccessTick = 0; gasSuccessWin = []; gasSuccessRate = 0;
  gasRxFwdTotal = 0; gasRxFwdTick = 0; gasRxFwdWin = []; gasRxFwdRate = 0;
  gasRxRevTotal = 0; gasRxRevTick = 0; gasRxRevWin = []; gasRxRevRate = 0;
  gasRxQueue = []; gasRxNew = []; gasHeatQ = 0; gasConcTrace = []; gasCountsBySp = [];
  gasKWin = []; gasKMean = 0;
  gasArrPts = []; gasArrWinC = 0; gasArrWinS = 0; gasArrWinT = 0; gasArrWinN = 0; gasArrAxis = null;
  gasSpecies = gasSpeciesList();
  gasRxResolveSpecies();
  var st = curState() || {};
  // Home pose starts settled (Rule 32d) UNLESS the state authors piston_from,
  // in which case the piston opens there and drives to piston_frac — so a state
  // narrating "push the wall in" actually shows the wall moving, and the cause
  // moves a beat before the pressure answers (Rule 32a). Without it the state
  // opens at the end pose and the ghost outline has to carry the delta alone.
  var stP = curState() || {};
  gasPistonF = (typeof stP.piston_from === 'number')
    ? constrain(stP.piston_from, 0.2, 1)
    : gasTargetPistonF();
  gasPistonVx = 0;
  gasInjFired = false;
  // The same idea as piston_from, for temperature. A state that narrates "heat
  // it" has to SHOW the thermometer climb: without T_from the box is seeded at
  // the target and opens already hot, so the CAUSE is never seen and only the
  // effect (the shift) is left to watch — Rule 32a inverted on what is usually
  // the most important state in an equilibrium lesson.
  // Read from the authored field DIRECTLY, never from gasTargetT(): gasInit
  // runs inside rebuildScene(), which resetToHomePose() calls BEFORE it zeroes
  // PM_simTimeMs, so the clock-ramped branch of gasTargetT() would be sampled
  // at the PREVIOUS state's time here and open the box mid-ramp.
  gasTempK = (typeof stP.T_from === 'number')
    ? constrain(stP.T_from, 1, 20000)
    : gasTargetT();
  gasBarrierOn = !!st.barrier;

  var total = gasCount(), si;
  var specN = [], declared = 0, undecl = 0;
  // Per-state opening composition. Without it every state of a reacting concept
  // opens from the SAME mixture and therefore plays the same movie, differing
  // only in which HUD is lit — and the strongest evidence a reaction concept can
  // show is unreachable: that the SAME equilibrium is reached from pure product
  // as from pure reactants. A state authors, by species id:
  //   "species_counts": { "A": 0, "B": 0, "AB": 45 }
  // Config-level count remains the default for any species the state omits, so
  // a concept that authors none behaves exactly as before — which is why
  // kinetic_particle_theory's seeded stream and frozen baselines cannot move.
  var stCounts = (curState() || {}).species_counts || null;
  for (si = 0; si < gasSpecies.length; si++) {
    var stC = (stCounts && typeof stCounts[gasSpecies[si].id] === 'number') ? stCounts[gasSpecies[si].id] : null;
    if (stC !== null) { specN[si] = max(0, Math.round(stC)); declared += specN[si]; }
    else if (typeof gasSpecies[si].count === 'number') { specN[si] = gasSpecies[si].count; declared += specN[si]; }
    else { specN[si] = -1; undecl++; }
  }
  for (si = 0; si < gasSpecies.length; si++) {
    if (specN[si] < 0) specN[si] = max(0, Math.round((total - declared) / max(undecl, 1)));
  }

  var L = gasBoxL(), R = gasBoxR(), T = gasBoxT(), B = gasBoxB(), mid = gasBoxMidX();
  for (si = 0; si < gasSpecies.length; si++) {
    // With a barrier, species 0 fills the left half and species 1 the right —
    // the diffusion / Graham's-law opening pose.
    var x0 = L, x1 = R, side = -1;
    if (gasBarrierOn && gasSpecies.length > 1) {
      if (si === 0) { x1 = mid; side = 0; } else { x0 = mid; side = 1; }
    }
    gasPlaceSpecies(si, specN[si], x0, x1, T, B, side);
  }
  // Bond axes for any dimers seeded directly by the species list. Drawn HERE
  // and only when a reaction is configured, never inside gasPlaceSpecies: every
  // draw goes through the one seeded stream, so an unconditional draw would
  // shift the stream for kinetic_particle_theory too and silently invalidate
  // every frozen baseline the fleet already approved.
  if (gasRxOn()) gasRxSeedDimers();
  gasZeroDrift();
  gasRescaleToT(gasTempK);

  // Relax the placement grid before anyone sees it. Particles are seeded on a
  // jittered lattice (which guarantees no initial overlap), but the player holds
  // a FROZEN opening frame until Play, so that lattice — visible row and column
  // structure — is the first thing a teacher sees of a lesson whose whole claim
  // is that particles move randomly. These collision-resolving ticks scramble it
  // into a real gas without advancing the clock, firing a cue, or touching the
  // energy: gasIntegrate and gasCollide both conserve it exactly.
  var st0 = curState() || {};
  for (var s = 0; s < 55; s++) {
    gasIntegrate(st0);
    gasCollide(st0);
    // Sample during the settle too, so the rolling pressure/collision windows
    // arrive at t=0 already populated. Without this the HUD spent its first
    // second showing a ONE-SAMPLE estimate of a rate — measured as P=0.292
    // against a settled 0.135 on the compressed state, and P=0.000 with zero
    // collisions on the open one. The instrument was wrong in exactly the frame
    // a teacher opens the state on.
    gasSampleStats();
  }
  // The cumulative tallies are a per-state story and must start at zero; the
  // rolling windows above are a measurement buffer and must NOT be cleared.
  gasCollTotal = 0; gasCollTick = 0; gasSuccessTotal = 0; gasSuccessTick = 0;
  gasFlashes = [];
  // The settle ran gasCollide, so it STAGED reactions — but gasApplyReactions()
  // is not part of the settle, deliberately: a state must open in the
  // composition it authored (Rule 32d home pose), not in one the relaxation
  // pass already shifted. Dropping the queue here is what keeps those two facts
  // compatible; without it every state would fire its whole settle's worth of
  // reactions in a single burst on the first frame after Play.
  gasRxQueue = []; gasRxNew = []; gasHeatQ = 0; gasConcTrace = [];
  gasRxFwdTotal = 0; gasRxFwdTick = 0; gasRxRevTotal = 0; gasRxRevTick = 0;
  gasRxFwdWin = []; gasRxRevWin = []; gasRxFwdRate = 0; gasRxRevRate = 0;
  gasRxRateMax = 1;
  gasNPrev = gasCount();
  for (var pi = 0; pi < particles.length; pi++) particles[pi].rx = 0;
  gasSampleComposition();
}

// A finite random sample carries a small net momentum — left alone the whole
// gas slowly slides, which reads as a draught and adds spurious wall impulse.
function gasZeroDrift() {
  var n = particles.length;
  if (!n) return;
  var i, p, sp, px = 0, py = 0, mt = 0;
  for (i = 0; i < n; i++) {
    p = particles[i]; sp = gasSpecies[p.sp];
    px += sp.mass * p.vx; py += sp.mass * p.vy; mt += sp.mass;
  }
  if (mt <= 0) return;
  var vx = px / mt, vy = py / mt;
  for (i = 0; i < n; i++) { particles[i].vx -= vx; particles[i].vy -= vy; }
}

// Pin the realized kinetic energy to the temperature the state asked for.
// Drawing 2N Gaussians lands sigma a few percent off nominal (about 4% at
// N=130), and that error is VISIBLE: the histogram bars sit beside their own
// theory curve, which is a teaching defect even though the physics is fine.
// One uniform rescale fixes it without touching the distribution's shape.
// 2D: mean KE per particle = m*sigma^2 (two components at 0.5*m*sigma^2 each).
function gasRescaleToT(T) {
  var n = particles.length;
  if (!n) return;
  var i, p, sp, ke = 0, want = 0, s;
  for (i = 0; i < n; i++) {
    p = particles[i]; sp = gasSpecies[p.sp];
    ke += 0.5 * sp.mass * (p.vx * p.vx + p.vy * p.vy);
    s = gasSigma(sp.mass, T);
    want += sp.mass * s * s;
  }
  if (ke <= 1e-12 || want <= 0) return;
  var f = Math.sqrt(want / ke);
  for (i = 0; i < n; i++) { particles[i].vx *= f; particles[i].vy *= f; }
}

function gasPlaceSpecies(spIdx, n, x0, x1, y0, y1, side) {
  if (n <= 0) return;
  var sp = gasSpecies[spIdx];
  var w = max(x1 - x0, 1), h = max(y1 - y0, 1);
  var cols = max(1, Math.ceil(Math.sqrt(n * w / h)));
  var rows = Math.ceil(n / cols);
  var cw = w / cols, ch = h / rows;
  var sg = gasSigma(sp.mass, gasTempK);
  var k = 0;
  for (var r = 0; r < rows && k < n; r++) {
    for (var c = 0; c < cols && k < n; c++) {
      // Jitter near a full half-cell. The grid guarantees no initial overlap,
      // but at +-0.3 the lattice still shows through — and because the player
      // holds a FROZEN opening frame until Play (build_review_site.ts), that
      // arranged look is the first thing a teacher sees of a "random motion"
      // lesson. Cells are ~4x the disc diameter, so this stays overlap-safe.
      var cx = x0 + cw * (c + 0.5) + prRange(-0.44, 0.44) * cw;
      var cy = y0 + ch * (r + 0.5) + prRange(-0.44, 0.44) * ch;
      particles.push({
        x: constrain(cx, x0 + sp.radius, x1 - sp.radius),
        y: constrain(cy, y0 + sp.radius, y1 - sp.radius),
        vx: gasGauss() * sg, vy: gasGauss() * sg,
        sp: spIdx, side: side, collisions: 0, hot: 0, trail: [],
        ang: 0, omega: 0, rx: 0
      });
      k++;
    }
  }
}

// ─── Physics step (one fixed 1/60 s tick) ───────────────────────────────────
function stepGas(state) {
  PM_simTimeMs += 1000 / 60;
  window.PM_simTimeMs = PM_simTimeMs;

  var cues = getCues(state);
  for (var ci = 0; ci < cues.length; ci++) {
    var c = cues[ci];
    if (cueFiredAt[c.id] === undefined && PM_simTimeMs >= cueTriggerMs(c)) cueFiredAt[c.id] = PM_simTimeMs;
  }
  // The barrier lifts on its authored cue — the diffusion beat (Rule 32a: the
  // cause moves first, the mixing answers after).
  if (gasBarrierOn && state.barrier_lift_cue && cueFiredAt[state.barrier_lift_cue] !== undefined) {
    gasBarrierOn = false;
  }
  // An authored disturbance — "pour in more A", "take some A out", "add the
  // inert gas" — fired off the same cue clock as barrier_lift_cue, so the
  // stress is SEEN to arrive mid-state (Rule 32a) instead of the box opening
  // already-disturbed and the shift having to carry the delta alone. This is
  // the concentration counterpart of piston_from and T_from.
  // gasNPrev is deliberately NOT touched: it tracks the N TARGET, which this
  // cue never changes, so gasSyncCount's delta branch stays a no-op and does
  // not try to "correct" the injection back out.
  if (!gasInjFired && state.inject_cue && cueFiredAt[state.inject_cue] !== undefined) {
    gasInjFired = true;
    var dn = (typeof state.inject_n === 'number') ? Math.round(state.inject_n) : 0;
    if (dn > 0) gasAddParticles(particles.length, dn, state.inject_species);
    // Removal goes through gasRxRemove, which takes the authored reagent and
    // never dismantles a bonded pair to hit a number (the atom-inventory scar).
    else if (dn < 0) gasRxRemove(-dn);
  }

  gasSyncCount();
  gasApplyHeat();                // reaction heat into the gas...
  gasThermostat(state);          // ...then the bath takes it back, unless adiabatic
  gasMovePiston();
  gasIntegrate(state);
  gasCollide(state);
  gasRxDecay(state);             // first-order reverse, staged like the merges
  gasApplyReactions(state);      // staged merges/splits applied after the sweep
  gasSampleStats();

  for (var fi = gasFlashes.length - 1; fi >= 0; fi--) {
    gasFlashes[fi].age++;
    if (gasFlashes[fi].age >= 18) gasFlashes.splice(fi, 1);
  }
}

// The gas's ACTUAL temperature, inverted from its kinetic energy. In 2D the
// mean kinetic energy per particle is k_eff*T with k_eff = speed_scale^2,
// independent of mass (equipartition), so a mixture inverts the same way.
function gasMeasuredT() {
  var n = particles.length;
  if (!n) return gasTempK;
  var ke = 0, s = gasSpeedScale();
  for (var i = 0; i < n; i++) {
    var p = particles[i];
    ke += 0.5 * gasSpecies[p.sp].mass * (p.vx * p.vx + p.vy * p.vy);
  }
  return (ke / n) / max(s * s, 1e-12);
}

// Temperature is applied by rescaling every velocity by sqrt(T_new/T_old),
// which preserves the distribution SHAPE exactly (Maxwell-Boltzmann scales
// with sqrt(T)) — the histogram slides and broadens instead of being redrawn.
// Eased so the change is watchable.
//
// It thermostats from the MEASURED temperature, not from a stored setpoint.
// The setpoint version drifted: a piston stroke does real work on the gas, so
// the true temperature left the setpoint while the thermometer kept reporting
// the setpoint — the instrument lied, and every quantity derived from T
// (notably the P*A/N*T readout) was computed against a number the gas no
// longer had. Measuring closes the loop: whatever work the walls do is seen
// and corrected, so a state that declares a temperature really holds it.
//
// DEFAULT IS ISOTHERMAL, deliberately. Compressing at constant temperature is
// the Boyle beat — pressure rises purely because the box got smaller (Rule 32b:
// only the taught variable changes). A state that wants the bicycle-pump story
// instead sets adiabatic:true and the gas is allowed to heat as it is
// squeezed, with the thermometer tracking it honestly.
function gasThermostat(state) {
  var meas = gasMeasuredT();
  if (state && state.adiabatic) { gasTempK = meas; return; }
  var target = gasTargetT();
  var next = meas + (target - meas) * 0.10;
  if (Math.abs(target - next) < 0.5) next = target;
  var ratio = Math.sqrt(max(next, 1) / max(meas, 1));
  if (isFinite(ratio) && ratio > 0) {
    for (var i = 0; i < particles.length; i++) { particles[i].vx *= ratio; particles[i].vy *= ratio; }
  }
  gasTempK = next;
}

// Dragging the N slider must change the gas NOW — without this, particle count
// only took effect on the next state entry, so the teacher's drag looked dead.
// New arrivals enter at the current temperature so N never smuggles in energy.
// Under THE EYE nothing is dragged, so the count never moves and the pinned
// re-sim is unaffected.
function gasSyncCount() {
  var want = gasCount(), have = particles.length;
  // IN A REACTING BOX THE PARTICLE COUNT IS NOT A FREE PARAMETER — it is an
  // OUTPUT of the chemistry, because A + B -> AB turns two particles into one.
  // The count-pinning branch below treats any deviation from N as something to
  // correct, and against a reaction that is catastrophic in both directions:
  // every merge got backfilled with a newly minted atom, and every dissociation
  // pushed the count over N so the fragments were truncated off the end of the
  // array. Measured over 60 s at N=120: A atoms 60 -> 68, B atoms 60 -> 101, and
  // 60% of the box's energy gone with the deleted discs. Neither the validator
  // nor THE EYE can see this; it took an atom count.
  // So in reaction mode N is a DELTA control: it acts only when the target
  // actually moves (a teacher drag, or a state authoring a different N), and
  // reaction-driven drift is left exactly alone.
  if (gasRxOn()) {
    if (gasNPrev < 0) { gasNPrev = want; return; }
    if (want === gasNPrev) return;
    var delta = want - gasNPrev;
    gasNPrev = want;
    if (delta < 0) { gasRxRemove(-delta); return; }
    have = particles.length;
    want = have + delta;
  } else {
    if (want === have) return;
    if (want < have) { particles.length = want; return; }
  }
  gasAddParticles(have, want - have);
}

// Pouring gas IN. Factored out of gasSyncCount so an authored injection cue and
// the N control add particles by the SAME rule — a cue that seeded its own
// arrivals would drift from the slider's chemistry the moment either changed.
// fromIdx preserves gasSyncCount's original index basis exactly (the species
// alternation is keyed off it), so the N path is behaviourally unchanged.
// speciesOverride lets a cue name a species outright — the inert-gas beat adds
// X, which is neither reactant and must never be alternated into A/B.
// NOTE: no backticks anywhere in this region — the whole renderer body is a
// template literal, so a backtick in a comment terminates the string.
function gasAddParticles(fromIdx, count, speciesOverride) {
  if (!(count > 0)) return;
  var L = gasBoxL(), R = gasBoxR(), T = gasBoxT(), B = gasBoxB();
  var override = (typeof speciesOverride === 'string') ? gasSpIdxById(speciesOverride) : -1;
  for (var i = fromIdx; i < fromIdx + count; i++) {
    var spIdx = i % gasSpecies.length, sp = gasSpecies[spIdx];
    // In a reacting box the N slider is a REAGENT tap, so it must never pour in
    // ready-made product — "add more of what is already there" is not a
    // Le Chatelier stress, it is a mystery. Default alternates the two
    // reactants (stoichiometric addition); reaction.inject names one species to
    // add alone, which is the stress the lesson actually wants.
    if (override >= 0) {
      spIdx = override;
      sp = gasSpecies[spIdx];
    } else if (gasRxOn()) {
      var r = gasRxCfg() || {};
      var forced = (typeof r.inject === 'string') ? gasSpIdxById(r.inject) : -1;
      spIdx = (forced >= 0) ? forced : ((i % 2 === 0) ? gasRxSpA : gasRxSpB);
      sp = gasSpecies[spIdx];
    }
    var sg = gasSigma(sp.mass, gasTempK);
    particles.push({
      x: prRange(L + sp.radius, R - sp.radius),
      y: prRange(T + sp.radius, B - sp.radius),
      vx: gasGauss() * sg, vy: gasGauss() * sg,
      sp: spIdx, side: -1, collisions: 0, hot: 0, trail: [],
      ang: 0, omega: 0, rx: 0
    });
  }
}

// Taking gas OUT of a reacting box. Truncating the array (what the non-reaction
// path does, correctly, for a single-species gas) removes whatever species
// happens to sit at the end — which here silently DESTROYS bonded pairs and
// leaves the atom inventory lopsided and unrecoverable: measured 90 A-units /
// 90 B-units going to 55 / 60 on one drag, with no way back. The teacher's
// control has to be the chemical operation it looks like, so removal mirrors
// injection exactly: take away the species the author nominated with
// reaction.inject, or alternate the two reactants, and NEVER break a bond to
// satisfy a count — a dimer that is not there to be removed simply is not
// removed. This is what makes the N slider usable as a Le Chatelier stress
// ("add reactant" / "take some out") rather than a way to corrupt the box.
function gasRxRemove(n) {
  var r = gasRxCfg() || {};
  var forced = (typeof r.inject === 'string') ? gasSpIdxById(r.inject) : -1;
  var order = (forced >= 0) ? [forced] : [gasRxSpA, gasRxSpB];
  var removed = 0, turn = 0, guard = 0;
  while (removed < n && guard++ < 4000) {
    var target = order[turn % order.length];
    turn++;
    var found = -1;
    for (var i = particles.length - 1; i >= 0; i--) {
      if (particles[i].sp === target) { found = i; break; }
    }
    if (found < 0) {
      // none of that species free right now — try the other reactant once, then
      // give up rather than dismantling the product to hit a number.
      var any = -1;
      for (var k = 0; k < order.length; k++) {
        for (var j = particles.length - 1; j >= 0; j--) {
          if (particles[j].sp === order[k]) { any = j; break; }
        }
        if (any >= 0) break;
      }
      if (any < 0) break;
      found = any;
    }
    particles.splice(found, 1);
    removed++;
    if (particles.length <= 2) break;
  }
}

// WALL SPEED IS A PHYSICAL VARIABLE, not a presentation detail. The default
// 0.06/frame ease covers a 1.0 -> 0.55 stroke at roughly 1320 px/s on the
// authoring geometry, against a thermal particle speed of about 109 px/s at
// 300 K — the wall outruns the gas by ~12x, and a wall that outruns its gas
// does enormous work on it. Measured on a state authored at 300 K: peak
// gasMeasuredT() of 8549 K within 100 ms, and the product count crashing from
// 31 to 7 before recovering. For ~4 s the readout then shows the REVERSE rate
// leading and more bonds broken than made — the exact opposite of what a
// compression state narrates — and the concentration graph carries the spike
// for the rest of the state, because the trace window is longer than the state.
//
// piston_ramp_ms drives the stroke on the state clock instead, so an author can
// compress slowly enough that the gas stays near its thermostat setpoint and
// the beat reads as the Boyle/Le Chatelier shift it claims to be. Opt-in and
// absent by default, so every shipped concept keeps its exact stroke and its
// approved baselines. The ramp yields to a teacher's V drag the moment they
// touch it, and falls through to the ease once complete.
function gasMovePiston() {
  var t = gasTargetPistonF(), prev = gasPistonF;
  var st = curState() || {};
  var rampMs = (typeof st.piston_from === 'number' && typeof st.piston_ramp_ms === 'number')
    ? st.piston_ramp_ms : 0;
  // piston_cue is T_cue's twin: hold the wall open until the cue fires, then
  // stroke FROM the cue, so "watch the wall slide in" is spoken as it slides
  // rather than after it has arrived. Omit it and the stroke starts at state
  // entry exactly as before.
  var pStart = 0;
  if (rampMs > 0 && st.piston_cue) {
    if (cueFiredAt[st.piston_cue] === undefined) { gasPistonF = st.piston_from; gasPistonVx = 0; return; }
    pStart = cueFiredAt[st.piston_cue];
  }
  var pEl = PM_simTimeMs - pStart;
  var driving = rampMs > 0 && pEl < rampMs && !(hasSlider('V') && userTouched['V']);
  if (driving) {
    gasPistonF = st.piston_from + (t - st.piston_from) * (pEl / rampMs);
  } else if (Math.abs(t - gasPistonF) > 1e-6) {
    gasPistonF += (t - gasPistonF) * 0.06;
    if (Math.abs(t - gasPistonF) < 0.002) gasPistonF = t;
  }
  gasPistonVx = (gasPistonF - prev) * (gasBoxRFull() - gasBoxL());
}

function gasIntegrate(state) {
  var L = gasBoxL(), R = gasBoxR(), T = gasBoxT(), B = gasBoxB(), mid = gasBoxMidX();
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i], sp = gasSpecies[p.sp], r = sp.radius, m = sp.mass, v;
    p.x += p.vx; p.y += p.vy;

    if (p.x - r < L) { p.x = L + r; v = Math.abs(p.vx); p.vx = v; gasWallImpulse += 2 * m * v; }
    if (p.x + r > R) {
      // Moving-wall reflection, SIGNED. A wall closing (gasPistonVx < 0) adds
      // 2|v_wall| to the rebound; a wall receding (gasPistonVx > 0) removes it.
      // The one-sided max(-gasPistonVx, 0) form heated the gas on compression
      // and never cooled it on expansion, so energy RATCHETED: two piston drags
      // took the measured kinetic energy from 397 to 31476 and drove the
      // P*A/N*T readout from 0.78 to 52.7. Symmetric is both correct and stable.
      v = max(Math.abs(p.vx) - 2 * gasPistonVx, 0.01);
      p.x = R - r; p.vx = -v; gasWallImpulse += 2 * m * v;
    }
    if (p.y - r < T) { p.y = T + r; v = Math.abs(p.vy); p.vy = v; gasWallImpulse += 2 * m * v; }
    if (p.y + r > B) { p.y = B - r; v = Math.abs(p.vy); p.vy = -v; gasWallImpulse += 2 * m * v; }

    if (gasBarrierOn && p.side === 0 && p.x + r > mid) { p.x = mid - r; v = Math.abs(p.vx); p.vx = -v; gasWallImpulse += 2 * m * v; }
    if (gasBarrierOn && p.side === 1 && p.x - r < mid) { p.x = mid + r; v = Math.abs(p.vx); p.vx = v; gasWallImpulse += 2 * m * v; }

    if (p.hot > 0) p.hot--;
    // A dimer turns at the rate its formation impact gave it. This is not
    // decoration: the rotational energy is in the ledger, taken out of the heat
    // released when the bond formed and handed back when it breaks.
    if (p.omega) p.ang = (p.ang || 0) + p.omega;
    // Trails are accumulated unconditionally (30 points, render-only data) so
    // the ⚙ "Particle trails" switch can turn them ON in a state that did not
    // author them — a toggle that reveals an empty buffer is a dead switch.
    p.trail.push({ x: p.x, y: p.y });
    while (p.trail.length > 30) p.trail.shift();
  }
}

// Uniform-grid broad phase: O(N) instead of O(N^2), so a 200-particle box stays
// at 60 fps on classroom hardware (the "dependable" half of the buy-trigger).
// Cells are filled in ascending particle index and pairs resolved with j > i,
// so the visit order is fixed — determinism survives the optimisation.
function gasCollide(state) {
  gasCollTick = 0; gasSuccessTick = 0;
  var n = particles.length;
  if (n < 2) return;
  var i, maxR = 0;
  for (i = 0; i < gasSpecies.length; i++) maxR = max(maxR, gasSpecies[i].radius);
  var cell = max(8, maxR * 2 + 2);
  var L = gasBoxL(), T = gasBoxT();
  var grid = {}, key;
  for (i = 0; i < n; i++) {
    particles[i].rx = 0;                 // one reaction per particle per tick
    key = floor((particles[i].x - L) / cell) + ':' + floor((particles[i].y - T) / cell);
    if (!grid[key]) grid[key] = [];
    grid[key].push(i);
  }
  var ea = gasActivationE(state);
  // Barriers resolved once per tick, not once per pair — they are constant
  // across the sweep and gasKtToEnergy walks the config every call.
  var rx = gasRxOn()
    ? { fwd: gasRxEaFwd(state), rev: gasRxEaRev(state) }
    : null;
  for (i = 0; i < n; i++) {
    var ci = floor((particles[i].x - L) / cell), cj = floor((particles[i].y - T) / cell);
    for (var ox = -1; ox <= 1; ox++) {
      for (var oy = -1; oy <= 1; oy++) {
        var bucket = grid[(ci + ox) + ':' + (cj + oy)];
        if (!bucket) continue;
        for (var bi = 0; bi < bucket.length; bi++) {
          var j = bucket[bi];
          if (j > i) gasResolvePair(i, j, ea, rx);
        }
      }
    }
  }
}

// Elastic hard-disc impulse along the line of centres. Equal or unequal mass;
// momentum and kinetic energy are both conserved exactly (e = 1).
function gasResolvePair(i, j, ea, rx) {
  var a = particles[i], b = particles[j];
  var sa = gasSpecies[a.sp], sb = gasSpecies[b.sp];
  var dx = b.x - a.x, dy = b.y - a.y;
  var rr = sa.radius + sb.radius;
  var d2 = dx * dx + dy * dy;
  if (d2 > rr * rr || d2 < 1e-12) return;
  var d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
  var vn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (vn <= 0) return;                       // already separating — no double hit
  var ma = sa.mass, mb = sb.mass;
  var J = -2 * vn / (1 / ma + 1 / mb);
  a.vx += (J / ma) * nx; a.vy += (J / ma) * ny;
  b.vx -= (J / mb) * nx; b.vy -= (J / mb) * ny;

  var overlap = rr - d;
  if (overlap > 0) {
    var tm = ma + mb;
    a.x -= nx * overlap * (mb / tm); a.y -= ny * overlap * (mb / tm);
    b.x += nx * overlap * (ma / tm); b.y += ny * overlap * (ma / tm);
  }

  a.collisions++; b.collisions++;
  gasCollTotal++; gasCollTick++;

  // Collision theory: what clears an activation barrier is the kinetic energy
  // along the LINE OF CENTRES of the colliding pair (reduced mass mu), not a
  // single particle's speed. That is the criterion used here.
  // NOTE for authors: the histogram's shaded tail marks single-particle speeds
  // above sqrt(2*Ea/m) — the textbook picture. The two numbers answer two
  // different questions and will not be equal; do not narrate them as one.
  if (ea > 0) {
    var mu = (ma * mb) / (ma + mb);
    if (0.5 * mu * vn * vn >= ea) {
      gasSuccessTotal++; gasSuccessTick++;
      a.hot = 16; b.hot = 16;
      gasFlashes.push({ x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5, age: 0 });
    }
  }

  // Reaction test LAST, on the pre-impulse approach speed captured above. The
  // elastic bounce that just ran cannot change the outcome — it conserves both
  // the momentum a merge would take and the relative energy the barrier is
  // tested against — so staging the event after it is equivalent and keeps the
  // existing collision path byte-identical when no reaction is configured.
  if (rx) gasRxTry(i, j, vn, rx);
}

// ─── Reaction events ───────────────────────────────────────────────────────
// Bond axes for dimers the species list seeded directly (reaction mode only —
// see the call site for why the draw cannot live in gasPlaceSpecies).
function gasRxSeedDimers() {
  for (var i = 0; i < particles.length; i++) {
    if (particles[i].sp !== gasRxSpAB) continue;
    particles[i].ang = prRange(0, TWO_PI);
    particles[i].omega = 0;
  }
}

// Called from gasResolvePair with the pair's PRE-impulse normal approach speed —
// the same line-of-centres criterion the activation-energy counter uses, so the
// two numbers on screen mean the same thing.
//
// Events are STAGED, never applied here: the collide sweep is walking a spatial
// grid of array indices, and splicing a particle out mid-sweep would leave every
// later bucket pointing at the wrong disc. They are applied after the sweep, in
// the fixed order they were queued, so determinism survives (Rule 36 / THE EYE).
function gasRxTry(i, j, vn, rx) {
  var a = particles[i], b = particles[j];
  if (a.rx || b.rx) return;                 // at most one reaction per particle per tick
  var sa = gasSpecies[a.sp], sb = gasSpecies[b.sp];
  var mu = (sa.mass * sb.mass) / (sa.mass + sb.mass);
  var eColl = 0.5 * mu * vn * vn;

  var pairIsAB = (a.sp === gasRxSpA && b.sp === gasRxSpB) || (a.sp === gasRxSpB && b.sp === gasRxSpA);
  if (pairIsAB && eColl >= rx.fwd) {
    a.rx = 1; b.rx = 1;
    gasRxQueue.push({ t: 1, i: i, j: j });
    return;
  }
  // Dissociation is NOT handled here — see gasRxDecay(). It was, at first, as a
  // collision test on the dimer, which is visually appealing and quietly wrong:
  // it makes the reverse direction BIMOLECULAR like the forward one, so both
  // rates carry the same density factor, the volume dependence cancels, and
  // squeezing the box shifts nothing. Measured before the fix: compressing to
  // 45% moved the product the WRONG WAY (41 -> 36). Le Chatelier's pressure
  // half is exactly the difference between 2 particles reacting and 1 falling
  // apart, so the reverse has to be first order or the lesson does not exist.
}

// AB -> A + B as a first-order thermal decomposition: each dimer gets an
// Arrhenius chance per tick, k = A*exp(-Ea_rev / kT), evaluated against the
// MEASURED temperature (the thermometer lesson: never a stored setpoint).
//
// Why this and not a collision test — see gasRxTry(). Why it does not decay a
// cold box: the exponential does that by itself. At the reference temperature
// the exponent is the authored barrier in kT; at half that temperature it
// doubles, and the rate falls by an order of magnitude. A fixed timer would
// have been the broken version of this idea; Arrhenius is the textbook one.
//
// reverse_attempt_per_s is the pre-exponential factor A — a real, authorable
// quantity that sets WHERE the equilibrium sits without touching which way it
// moves when the box is stressed.
function gasRxDecay(state) {
  if (!gasRxOn()) return;
  var n = particles.length;
  if (!n) return;
  var eaRev = gasRxEaRev(state);
  var g = gasCfg();
  var s = gasSpeedScale();
  var kT = max(s * s * gasMeasuredT(), 1e-9);
  var attempts = gasRxNum(state, 'reverse_attempt_per_s', 3.5) * gasRxAreaNorm();
  var p = (attempts / 60) * Math.exp(-eaRev / kT);
  if (!(p > 0)) return;
  for (var i = 0; i < n; i++) {
    var q = particles[i];
    if (q.sp !== gasRxSpAB || q.rx) continue;
    if (pr() < p) { q.rx = 1; gasRxQueue.push({ t: 0, i: i }); }
  }
}

function gasApplyReactions(state) {
  if (!gasRxQueue.length) return;
  var bondE = gasRxBondE(state);
  var dead = [], i;
  for (i = 0; i < particles.length; i++) dead[i] = false;
  for (i = 0; i < gasRxQueue.length; i++) {
    var ev = gasRxQueue[i];
    if (ev.t === 1) {
      if (!dead[ev.i] && !dead[ev.j]) gasRxCombine(ev.i, ev.j, bondE, dead);
    } else if (!dead[ev.i]) {
      gasRxSplit(ev.i, bondE, dead);
    }
  }
  var out = [];
  for (i = 0; i < particles.length; i++) if (!dead[i]) out.push(particles[i]);
  for (i = 0; i < gasRxNew.length; i++) out.push(gasRxNew[i]);
  particles = out;
  gasRxQueue = []; gasRxNew = [];
}

// A + B -> AB. Momentum exact (centre-of-mass velocity); the relative motion
// splits into a real rotation carried by the impact's angular momentum, and
// heat. See the ledger note in the section header.
function gasRxCombine(i, j, bondE, dead) {
  var a = particles[i], b = particles[j];
  var sa = gasSpecies[a.sp], sb = gasSpecies[b.sp];
  var M = sa.mass + sb.mass, mu = (sa.mass * sb.mass) / M;

  var vx = (sa.mass * a.vx + sb.mass * b.vx) / M;
  var vy = (sa.mass * a.vy + sb.mass * b.vy) / M;
  var cx = (sa.mass * a.x + sb.mass * b.x) / M;
  var cy = (sa.mass * a.y + sb.mass * b.y) / M;

  var rx0 = a.x - b.x, ry0 = a.y - b.y;
  var uvx = a.vx - b.vx, uvy = a.vy - b.vy;
  var keRel = 0.5 * mu * (uvx * uvx + uvy * uvy);

  // Angular momentum of the relative motion about the COM. An off-centre hit
  // makes a spinning dimer; a dead-centre hit makes a still one. That spin is
  // energy, so it is SUBTRACTED from the heat released rather than conjured.
  var Lz = mu * (rx0 * uvy - ry0 * uvx);
  var Ib = mu * gasRxBondLen() * gasRxBondLen();
  var om = (Ib > 1e-12) ? (Lz / Ib) : 0;
  var keRot = 0.5 * Ib * om * om;
  if (keRot > keRel) { keRot = keRel; om = (Ib > 1e-12) ? Math.sqrt(2 * keRot / Ib) * (om < 0 ? -1 : 1) : 0; }

  gasHeatQ += (keRel - keRot) + bondE;

  var sAB = gasSpecies[gasRxSpAB];
  var L = gasBoxL(), R = gasBoxR(), T = gasBoxT(), B = gasBoxB();
  gasRxNew.push({
    x: constrain(cx, L + sAB.radius, max(R - sAB.radius, L + sAB.radius)),
    y: constrain(cy, T + sAB.radius, max(B - sAB.radius, T + sAB.radius)),
    vx: vx, vy: vy, sp: gasRxSpAB, side: -1, collisions: 0, hot: 20, trail: [],
    ang: Math.atan2(ry0, rx0), omega: om, rx: 1
  });
  dead[i] = true; dead[j] = true;
  gasRxFwdTotal++; gasRxFwdTick++;
  gasFlashes.push({ x: cx, y: cy, age: 0, k: 1 });
}

// AB -> A + B. The dimer's stored spin becomes the fragments' flight apart; the
// bond energy (and any top-up needed to separate them cleanly) is debited from
// the heat reservoir, so the reverse direction cools an exothermic box exactly
// as much as the forward direction warmed it.
function gasRxSplit(i, bondE, dead) {
  var p = particles[i];
  var sA = gasSpecies[gasRxSpA], sB = gasSpecies[gasRxSpB];
  var M = sA.mass + sB.mass, mu = (sA.mass * sB.mass) / M;
  var d = gasRxBondLen();
  var Ib = mu * d * d;
  var om = p.omega || 0;
  var keRot = 0.5 * Ib * om * om;

  // Floor the separation energy so fragments actually leave each other. Without
  // it a dimer formed by a dead-centre hit dissociates with ~zero relative
  // speed and the two halves sit in contact, reading as a bond that never broke.
  var eSep = max(keRot, gasKtToEnergy(0.5));
  gasHeatQ -= (eSep - keRot) + bondE;

  var u = Math.sqrt(2 * max(eSep, 0) / max(mu, 1e-9));
  var ang = (typeof p.ang === 'number') ? p.ang : 0;
  var nx = Math.cos(ang), ny = Math.sin(ang);

  var L = gasBoxL(), R = gasBoxR(), T = gasBoxT(), B = gasBoxB();
  var fA = sB.mass / M, fB = sA.mass / M;    // COM-preserving offsets
  gasRxNew.push({
    x: constrain(p.x + nx * d * fA, L + sA.radius, max(R - sA.radius, L + sA.radius)),
    y: constrain(p.y + ny * d * fA, T + sA.radius, max(B - sA.radius, T + sA.radius)),
    vx: p.vx + nx * u * fA, vy: p.vy + ny * u * fA,
    sp: gasRxSpA, side: -1, collisions: 0, hot: 20, trail: [], ang: 0, omega: 0, rx: 1
  });
  gasRxNew.push({
    x: constrain(p.x - nx * d * fB, L + sB.radius, max(R - sB.radius, L + sB.radius)),
    y: constrain(p.y - ny * d * fB, T + sB.radius, max(B - sB.radius, T + sB.radius)),
    vx: p.vx - nx * u * fB, vy: p.vy - ny * u * fB,
    sp: gasRxSpB, side: -1, collisions: 0, hot: 20, trail: [], ang: 0, omega: 0, rx: 1
  });
  dead[i] = true;
  gasRxRevTotal++; gasRxRevTick++;
  gasFlashes.push({ x: p.x, y: p.y, age: 0, k: 2 });
}

// Hand the reaction reservoir to the gas (or take from it) as a uniform
// velocity rescale — the same mechanism the thermostat uses, so the speed
// distribution keeps its shape. Runs BEFORE the thermostat: an isothermal state
// then has its heat removed (the box is in a bath, which is what isothermal
// means), while an adiabatic:true state keeps it and the thermometer rises on
// its own. That ordering is the entire temperature half of Le Chatelier.
function gasApplyHeat() {
  if (Math.abs(gasHeatQ) < 1e-12) return;
  var i, ke = 0;
  for (i = 0; i < particles.length; i++) {
    var p = particles[i], m = gasSpecies[p.sp].mass;
    ke += 0.5 * m * (p.vx * p.vx + p.vy * p.vy);
  }
  if (ke <= 1e-9) return;
  var target = ke + gasHeatQ;
  if (target < ke * 0.05) target = ke * 0.05;   // a debit may cool the gas, never stop it
  var f = Math.sqrt(target / ke);
  for (i = 0; i < particles.length; i++) { particles[i].vx *= f; particles[i].vy *= f; }
  gasHeatQ -= (target - ke);                     // only what was actually delivered
}

// THE SELF-CHECK. Total energy of the reacting box, recomputed from the
// particles every tick. Under adiabatic:true with the piston parked and the N
// slider untouched this must hold flat — if it drifts, a reaction event is
// leaking or minting energy and every number downstream of temperature is
// lying. 'show_energy_ledger' puts it on screen for exactly that measurement.
function gasEnergyLedger(state) {
  var bondE = gasRxBondE(state), i, ke = 0, rot = 0, nAB = 0;
  var d = gasRxBondLen();
  for (i = 0; i < particles.length; i++) {
    var p = particles[i], sp = gasSpecies[p.sp];
    ke += 0.5 * sp.mass * (p.vx * p.vx + p.vy * p.vy);
    if (p.sp === gasRxSpAB) {
      nAB++;
      var sA = gasSpecies[gasRxSpA], sB = gasSpecies[gasRxSpB];
      var mu = (sA.mass * sB.mass) / (sA.mass + sB.mass);
      var Ib = mu * d * d, om = p.omega || 0;
      rot += 0.5 * Ib * om * om;
    }
  }
  return ke + rot + gasHeatQ - nAB * bondE;
}

// Live composition + the rolling trace the concentration graph draws from.
// Sampled at 10 Hz: a 60 Hz trace buys no readability and costs six times the
// points to walk every frame.
function gasSampleComposition() {
  var i;
  gasCountsBySp = [];
  for (i = 0; i < gasSpecies.length; i++) gasCountsBySp[i] = 0;
  for (i = 0; i < particles.length; i++) {
    var s = particles[i].sp;
    if (gasCountsBySp[s] !== undefined) gasCountsBySp[s]++;
  }
  if (!gasRxOn()) return;
  var frame = Math.round(PM_simTimeMs / (1000 / 60));
  if (frame % 6 !== 0 && gasConcTrace.length) return;
  gasConcTrace.push({
    a: gasCountsBySp[gasRxSpA] || 0,
    b: gasCountsBySp[gasRxSpB] || 0,
    ab: gasCountsBySp[gasRxSpAB] || 0
  });
  while (gasConcTrace.length > 260) gasConcTrace.shift();
}

function gasSampleStats() {
  var i, s = 0;
  gasPressureWin.push(gasWallImpulse);
  gasWallImpulse = 0;
  // 3 s window. Wall strikes are a Poisson process, so a short window makes the
  // gauge jitter tens of percent — measured +-30% at 0.75 s, which is fatal for
  // the P*A/N*T readout whose entire teaching job is to sit still. Long enough
  // to be steady, short enough that a slider drag still visibly moves it.
  while (gasPressureWin.length > 180) gasPressureWin.shift();
  for (i = 0; i < gasPressureWin.length; i++) s += gasPressureWin[i];
  var perim = 2 * ((gasBoxR() - gasBoxL()) + (gasBoxB() - gasBoxT()));
  var secs = gasPressureWin.length / 60;
  gasPressure = (perim > 0 && secs > 0) ? (s / (perim * secs)) : 0;

  gasSampleArrhenius();
  gasCollWin.push(gasCollTick);
  gasSuccessWin.push(gasSuccessTick);
  // The counter's window, 1 s by default. That is fine for the collision rate
  // (hundreds per second) and WRONG for the cleared-Ea rate beside it, which is
  // the same rare-event regime the reaction rates below were given 5 s for, and
  // for the same stated reason: a short window on a rare event reports a number
  // that flickers between 0 and a spike.
  //
  // Measured on collision_theory_activation_energy before this was authorable:
  // at ~6 clearing events per second a 1 s window put the DISPLAYED percentage
  // anywhere from 0.0% to 8.2% on a state whose narration says "about three in a
  // hundred", and 2.2% to 22.5% on the state that claims it "soars past
  // fourteen". A single frame reading 0.0% under a caption about collisions
  // clearing the barrier is the state contradicting itself.
  //
  // Authored per state, defaulting to the old 60 frames, so every shipped
  // concept on this chip keeps its exact baselines.
  var cwSt = curState() || {};
  var cwFrames = (typeof cwSt.counter_window_ms === 'number')
    ? max(6, Math.round(cwSt.counter_window_ms / (1000 / 60)))
    : 60;
  while (gasCollWin.length > cwFrames) gasCollWin.shift();
  while (gasSuccessWin.length > cwFrames) gasSuccessWin.shift();
  s = 0; for (i = 0; i < gasCollWin.length; i++) s += gasCollWin[i];
  gasCollRate = s * 60 / max(gasCollWin.length, 1);
  s = 0; for (i = 0; i < gasSuccessWin.length; i++) s += gasSuccessWin[i];
  gasSuccessRate = s * 60 / max(gasSuccessWin.length, 1);

  // Reaction rates get a 5 s window, not the collisions' 1 s: reaction events
  // are one in hundreds of collisions, so a short window reports a rate that
  // flickers between 0 and a spike. Dynamic equilibrium is READ off these two
  // numbers sitting equal, and two numbers cannot be seen to be equal while
  // they are jittering. Measured at 3 s and ~10 events/s the two bars sat 32%
  // apart at a composition that was DEAD flat (AB 18 -> 18 over 30 s) — the
  // chemistry was at equilibrium and the instrument denied it. Events are
  // Poisson, so the window has to hold enough of them: 5 s at 10/s is ~50
  // events, about 14% noise, and it still re-settles visibly after a stress.
  // The cumulative totals on the same chip are the steady statement; the bars
  // are the "both are still running" one.
  gasRxFwdWin.push(gasRxFwdTick);
  gasRxRevWin.push(gasRxRevTick);
  while (gasRxFwdWin.length > 300) gasRxFwdWin.shift();
  while (gasRxRevWin.length > 300) gasRxRevWin.shift();
  s = 0; for (i = 0; i < gasRxFwdWin.length; i++) s += gasRxFwdWin[i];
  gasRxFwdRate = s * 60 / max(gasRxFwdWin.length, 1);
  s = 0; for (i = 0; i < gasRxRevWin.length; i++) s += gasRxRevWin[i];
  gasRxRevRate = s * 60 / max(gasRxRevWin.length, 1);
  gasRxFwdTick = 0; gasRxRevTick = 0;
  gasRxRateMax = max(gasRxRateMax, gasRxFwdRate, gasRxRevRate);

  gasSampleComposition();

  // K over the SAME 5 s window the rate bars use, and for the same reason. The
  // instantaneous ratio is built from small integer counts (AB runs 14-46 on
  // this concept), so a per-frame read swings about 2x — measured 0.0059 to
  // 0.0141 on a box whose 5 s mean sits at 0.0086 and whose true value never
  // moves. An instrument that jitters 2x cannot carry the one claim its state
  // exists to make ("these amounts changed a lot, this number did not"), and
  // narrating the jitter instead would be teaching around a fixable instrument.
  // This is not smoothing away an inconvenience: every other instrument in this
  // box is already a window (rates 300 ticks, pressure 180) because discrete
  // events are Poisson. Same measurement discipline, stated honestly.
  if (gasRxOn() && gasRxSpA >= 0 && gasRxSpB >= 0 && gasRxSpAB >= 0) {
    var kA = gasCountsBySp[gasRxSpA] || 0;
    var kB = gasCountsBySp[gasRxSpB] || 0;
    var kAB = gasCountsBySp[gasRxSpAB] || 0;
    if (kA > 0 && kB > 0) gasKWin.push(kAB / (kA * kB));
    // 10 s, not the rates' 5 s. Measured swing of the displayed value at the
    // equilibrium concept's own configuration (180 discs, 300 K, 120 s run):
    //   per-frame 86%   5 s 64%   10 s 50%   20 s 35%   60 s 13%
    // The noise is slow (composition fluctuations are autocorrelated over tens
    // of seconds), so averaging buys much less than sqrt(n) and NO practical
    // window makes this chip hold steady digits — 60 s is already twice the
    // state that shows it. 10 s is the knee: half the per-frame swing, still
    // short enough to respond within a state. A state built on this chip must
    // therefore make a COMPARATIVE claim it can keep (amounts move ~50%, this
    // moves a few percent), never "watch this number stay fixed".
    while (gasKWin.length > 600) gasKWin.shift();
    var ks = 0;
    for (var ki = 0; ki < gasKWin.length; ki++) ks += gasKWin[ki];
    gasKMean = gasKWin.length ? (ks / gasKWin.length) : 0;
  }
}

// spIdx null = every particle; otherwise one species (the histogram's markers
// must describe the same population its bars do).
function gasSpeedStats(spIdx) {
  var s = 0, s2 = 0, mx = 0, c = 0;
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    if (spIdx !== null && spIdx !== undefined && p.sp !== spIdx) continue;
    var v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    s += v; s2 += v * v; if (v > mx) mx = v; c++;
  }
  if (!c) return { vavg: 0, vrms: 0, vmax: 1 };
  return { vavg: s / c, vrms: Math.sqrt(s2 / c), vmax: max(mx, 1e-6) };
}

// ─── Rendering ──────────────────────────────────────────────────────────────
function drawGasBox(state) {
  var L = gasBoxL(), R = gasBoxR(), T = gasBoxT(), B = gasBoxB();
  var dimBox = dimFor('box');

  noFill();
  // Ghost of the uncompressed box: without it the swept volume simply vanishes
  // and the state shows a small box rather than a COMPRESSED one — the delta
  // has to stay on screen to be read (Rule 32c).
  if (gasPistonF < 0.999) {
    // Alpha FLOOR, not a plain multiply. At 0.22 * dimFor('box') this compounded
    // to ~7.7% whenever the piston (not the box) was the state's focal — present
    // in the pixels, invisible on screen. A Rule-32c delta marker has to survive
    // focal dimming or it is not a delta marker.
    strokeHex('#64748B', max(0.30 * dimBox, 0.24));
    strokeWeight(1);
    rect(L, T, gasBoxRFull() - L, B - T, 3);
  }
  strokeHex('#94A3B8', 0.55 * dimBox);
  strokeWeight(2);
  rect(L, T, R - L, B - T, 3);

  // Piston: a distinct grabbable-looking face so a compressing wall never
  // reads as "the box got smaller by magic".
  if (gasPistonF < 0.999) {
    strokeHex('#F59E0B', 0.95 * dimBox); strokeWeight(4);
    line(R, T + 2, R, B - 2);
    noStroke(); fillHex('#F59E0B', 0.18 * dimBox);
    rect(R, T + 2, min(14, gasBoxRFull() - R), B - T - 4);
  }
  if (gasBarrierOn) {
    var mid = gasBoxMidX();
    strokeHex('#E2E8F0', 0.85 * dimFor('barrier')); strokeWeight(3);
    line(mid, T + 2, mid, B - 2);
  }

  var dimP = dimFor('particles'), i, p, sp;
  if (pfWgVis('gas_trails', state.show_trails)) {
    strokeWeight(1); noFill();
    for (i = 0; i < particles.length; i++) {
      p = particles[i];
      if (p.trail.length < 2) continue;
      sp = gasSpecies[p.sp];
      strokeHex(sp.color, 0.20 * dimP);
      beginShape();
      for (var t = 0; t < p.trail.length; t++) vertex(p.trail[t].x, p.trail[t].y);
      endShape();
    }
  }

  noStroke();
  for (i = 0; i < particles.length; i++) {
    p = particles[i]; sp = gasSpecies[p.sp];
    if (p.hot > 0) {
      fillHex('#FDE047', (min(p.hot, 16) / 16) * 0.35 * dimP);
      circle(p.x, p.y, sp.radius * 3.0);
    }
    // A product particle is drawn as the two atoms it is MADE of, joined. One
    // new-coloured disc would show a substance appearing from nowhere, when the
    // entire idea is that the same atoms are now stuck together — and a student
    // has to be able to count the atoms and see that nothing was created.
    if (gasRxOn() && p.sp === gasRxSpAB) { drawGasDimer(p, dimP); noStroke(); continue; }
    fillHex(sp.color, 0.92 * dimP);
    circle(p.x, p.y, sp.radius * 2);
  }

  for (i = 0; i < gasFlashes.length; i++) {
    var f = gasFlashes[i], a = 1 - f.age / 18;
    // Bond made vs bond broken read as different EVENTS, not one flicker: with
    // one colour the two directions are indistinguishable on screen, and
    // "both directions are running" is the claim the state exists to make.
    var fc = (f.k === 1) ? '#34D399' : (f.k === 2) ? '#FB923C' : '#FDE047';
    noFill(); strokeHex(fc, a * 0.9); strokeWeight(1.5);
    circle(f.x, f.y, 6 + f.age * 0.9);   // must stay near particle scale — a 42px ring over a 10px disc read as noise
  }
  noStroke();
}

// The dimer's lobes sit at exactly the offsets gasRxSplit() will fly them to,
// so the bond that breaks is the bond that was drawn.
function drawGasDimer(p, dimP) {
  var sA = gasSpecies[gasRxSpA], sB = gasSpecies[gasRxSpB];
  var M = sA.mass + sB.mass, d = gasRxBondLen();
  var ang = p.ang || 0, nx = Math.cos(ang), ny = Math.sin(ang);
  var ax = p.x + nx * d * (sB.mass / M), ay = p.y + ny * d * (sB.mass / M);
  var bx = p.x - nx * d * (sA.mass / M), by = p.y - ny * d * (sA.mass / M);
  // The product's authored colour is the BOND accent, and the same colour keys
  // its readout label and its graph line. It used to be dead data — the dimer,
  // the label and the curve were all hardcoded white — which is a trap: an
  // author sets species.AB.color, nothing on screen changes, and they conclude
  // the field means something else.
  // The rim, not the line, is what makes the accent visible. The bond length
  // equals rA + rB, so the two discs are drawn TANGENT and the center-to-center
  // line is almost entirely painted over by the fills — the authored product
  // colour was live data rendering ~2 px of itself at the waist. The very trap
  // the note above warns about, re-created by draw order. Leaving the stroke
  // active through the fills rims BOTH discs of a pair in the product colour,
  // so a bonded pair pops against singles and colour-keys to its own readout
  // label and graph curve. (Founder-approved 2026-07-29; dynamic_equilibrium's
  // H2 baselines fail by design on next run — re-approve, not fix-cycle.)
  strokeHex(gasRxColor(), 0.9 * dimP); strokeWeight(2);
  line(ax, ay, bx, by);
  fillHex(sA.color, 0.92 * dimP); circle(ax, ay, sA.radius * 2);
  fillHex(sB.color, 0.92 * dimP); circle(bx, by, sB.radius * 2);
  noStroke();
}

function gasChip(x, y, w, h) {
  noStroke(); fill(0, 0, 0, 150);
  rect(x, y, w, h, 6);
}

// Rule 33d: a live NUMBER plus a needle that tracks the physical change.
function drawGasPressure() {
  var x = gasBoxL(), y = gasHudTop(), w = 132, h = 28;
  var dim = dimFor('pressure');
  gasChip(x, y, w, h);
  var g = gasCfg();
  var pMax = (typeof g.pressure_full_scale === 'number') ? g.pressure_full_scale : 0.9;
  var frac = constrain(gasPressure / max(pMax, 1e-6), 0, 1);
  noStroke(); fillHex('#38BDF8', 0.85 * dim);
  rect(x + 8, y + h - 9, (w - 16) * frac, 4, 2);
  fillHex('#E2E8F0', dim);
  textAlign(LEFT, TOP); textSize(12);
  text('P = ' + gasPressure.toFixed(3), x + 8, y + 5);
}

// The instrument row is a LEFT-anchored ACCUMULATION: each chip starts after
// whatever is already lit, which is how drawGasReaction and drawGasKRatio place
// themselves. This one hardcoded gasBoxL() + 142 — the pressure gauge's width
// plus its gap — which is correct only when the pressure gauge is actually on.
// The first state in the fleet to light the thermometer with pressure OFF
// (le_chateliers_principle STATE_4, the heating beat) therefore drew the
// thermometer at +142 while drawGasReaction correctly started the counts at
// +126: a 132 px overlap that struck "T = 500 K" straight through the A and B
// counts, and the mercury bar across the fwd row, for the state's whole
// duration — on the concept's PRIMARY aha. Accumulate like everyone else.
function drawGasThermometer(state) {
  var x = gasBoxL(), y = gasHudTop(), w = 116, h = 28;
  if (pfWgVis('gas_pressure', state && state.show_pressure)) x += 142;
  var dim = dimFor('temperature');
  gasChip(x, y, w, h);
  var g = gasCfg();
  var tMax = (typeof g.temperature_full_scale === 'number') ? g.temperature_full_scale : 900;
  var frac = constrain(gasTempK / max(tMax, 1), 0, 1);
  noStroke(); fillHex('#FB7185', 0.85 * dim);
  rect(x + 8, y + h - 9, (w - 16) * frac, 4, 2);
  fillHex('#E2E8F0', dim);
  textAlign(LEFT, TOP); textSize(12);
  text('T = ' + Math.round(gasTempK) + ' K', x + 8, y + 5);
}

function drawGasCounters(state) {
  var dim = dimFor('counters');
  var ea = gasActivationE(state);
  var w = ea > 0 ? 268 : 150;
  // Right-aligned under the box: drawLabel() owns the bottom-LEFT corner with
  // the state chip, and the two collided on the first bring-up frame (Rule 34d).
  // ...but the bottom-RIGHT corner is the #pm-formula chip's, and a state that
  // lights both put the formula box straight over the percentage — the ONE
  // number on this chip that is safe to narrate (absolute rates swing 5.3x
  // across viewports; the percentage swings 1.05x). Measured on a probe frame:
  // "9/s clear Ea (4" and then the formula box. So step left past the formula
  // whenever there IS one. No shipped state pairs this chip with a formula
  // overlay, so nothing already baseline-locked can move.
  var y = gasBoxB() + 8;
  var frmW = 0;
  var frmEl = document.getElementById('pm-formula');
  if (frmEl && frmEl.style.display !== 'none' && frmEl.offsetWidth) frmW = frmEl.offsetWidth + 14;
  var x = max(gasBoxL(), gasBoxRFull() - w - frmW);
  gasChip(x, y, w, 26);
  fillHex('#E2E8F0', dim);
  textAlign(LEFT, CENTER); textSize(12);
  var msg = Math.round(gasCollRate) + ' collisions/s';
  if (ea > 0) {
    var pct = gasCollRate > 0 ? (100 * gasSuccessRate / gasCollRate) : 0;
    // ONE DECIMAL on the cleared rate, where the collision rate keeps its
    // integer. They are three orders of magnitude apart, and rounding the small
    // one destroyed the only comparison the collision-theory lesson makes: the
    // reaction readout prints "fwd 1.4/s" beside a counter rounding 1.4 clear/s
    // to "1", so a teacher reading the two chips computed 140% of the energetic
    // collisions reacting — on the state whose entire claim is "about a third".
    // A rounded 0 was worse still: "0/s clear Ea" under a caption about
    // collisions clearing it.
    // Safe fleet-wide: this clause only prints when an activation energy is set,
    // and kinetic_particle_theory (the only other shipped concept on this chip)
    // authors none, so its frames cannot move.
    msg += '   \\u2022   ' + gasSuccessRate.toFixed(1) + '/s clear E\\u2090  (' + pct.toFixed(1) + '%)';
  }
  text(msg, x + 8, y + 13);
}

// P*A / (N*T) is constant for a 2D ideal gas. Showing it live turns the engine
// into its own proof — and gives the kinetic-theory lesson its payoff number.
function drawGasLaw() {
  var x = gasBoxL() + 270, y = gasHudTop(), w = 196, dim = dimFor('gas_law');
  gasChip(x, y, w, 28);
  var n = max(particles.length, 1);
  var k = gasPressure * gasBoxArea() / (n * max(gasTempK, 1));
  fillHex('#A7F3D0', dim);
  textAlign(LEFT, TOP); textSize(12);
  text('P\\u00B7A / N\\u00B7T = ' + k.toFixed(3), x + 8, y + 5);
}

// ─── Reaction instruments ──────────────────────────────────────────────────
// Rule 33d: live numbers plus a moving indicator, placed where a teacher reads
// them at a glance. Two rate bars sharing ONE scale — the whole of dynamic
// equilibrium is those two bars ending up the same length while both stay lit.
function drawGasReaction(state) {
  if (!gasRxOn()) return;
  var dim = dimFor('reaction');
  var w = 268, h = 68;
  // LEFT-anchored in the instrument row, after whatever chips are already there —
  // NOT right-aligned. Right-aligned it sat exactly under the review player's
  // DOM slider panel (position:fixed, top 52 / right 10, z-index above the
  // canvas): measured a 230x52 overlap, which buried the reaction readout
  // completely in the explore state — the one state whose entire claim is "the
  // two rates come back together" and whose only instrument this is.
  var y = gasHudTop();
  var x = gasBoxL();
  if (pfWgVis('gas_pressure', state.show_pressure)) x += 142;
  if (pfWgVis('gas_thermo', state.show_gas_thermometer)) x += 126;
  if (pfWgVis('gas_law', state.show_gas_law)) x += 206;
  if (x + w > gasBoxRFull()) x = max(gasBoxL(), gasBoxRFull() - w);   // all four lit: fall back
  gasChip(x, y, w, h);

  var sA = gasSpecies[gasRxSpA], sB = gasSpecies[gasRxSpB];
  var nA = gasCountsBySp[gasRxSpA] || 0, nB = gasCountsBySp[gasRxSpB] || 0;
  var nAB = gasCountsBySp[gasRxSpAB] || 0;

  textAlign(LEFT, TOP); textSize(11); noStroke();
  var cx = x + 8;
  fillHex(sA.color, dim); text((sA.label || sA.id) + ' ' + nA, cx, y + 6); cx += 52;
  fillHex(sB.color, dim); text((sB.label || sB.id) + ' ' + nB, cx, y + 6); cx += 52;
  fillHex(gasRxColor(), dim);
  text((gasSpecies[gasRxSpAB].label || 'AB') + ' ' + nAB, cx, y + 6);

  // ONE shared full-scale for both bars, and it must NOT be the live maximum.
  // It was max(fwd, rev, 1), which renormalises to whichever bar is longest — so
  // the longer bar is pinned at 100% by construction and the pair reports a
  // RATIO, never a magnitude. Measured in S1, where the reverse is switched off:
  // the forward bar sat at full length for all 18 s while its own value fell
  // 8.0/s -> 2.0/s, so the state's declared delta ("the forward rate falls as
  // the reactants run out") was contradicted by the instrument teaching it.
  // A per-state high-water mark keeps both bars on one honest scale: equal rates
  // still read equal, and a rate that falls now visibly falls.
  //
  // Three zones that must not overlap, because at h=52 they did: the label
  // column, the bar, and the right-aligned value all shared rows, and the
  // cumulative-totals line landed on top of the "rev" label — illegible, and
  // that line is the single instrument proving the reaction has not stopped.
  var full = max(gasRxRateMax, 1);
  var bx = x + 44, bw = w - 44 - 56;
  textSize(10);
  fillHex('#34D399', dim); text('fwd', x + 8, y + 24);
  fillHex('#FB923C', dim); text('rev', x + 8, y + 40);
  noStroke();
  fillHex('#34D399', 0.85 * dim); rect(bx, y + 26, bw * constrain(gasRxFwdRate / full, 0, 1), 5, 2);
  fillHex('#FB923C', 0.85 * dim); rect(bx, y + 42, bw * constrain(gasRxRevRate / full, 0, 1), 5, 2);
  fillHex('#CBD5E1', dim);
  textAlign(RIGHT, TOP);
  text(gasRxFwdRate.toFixed(1) + '/s', x + w - 8, y + 23);
  text(gasRxRevRate.toFixed(1) + '/s', x + w - 8, y + 39);
  // Cumulative totals since the state opened. The bars are Poisson-noisy by
  // nature (see gasSampleStats); these two numbers converging is the steady,
  // unarguable form of "the two directions are running at the same rate".
  fillHex('#94A3B8', 0.9 * dim);
  textAlign(LEFT, TOP); textSize(10);
  text(gasRxFwdTotal + ' made \\u00B7 ' + gasRxRevTotal + ' broken', x + 8, y + 55);
  textSize(11);
}

// Composition against time. The line that goes flat WHILE the bars stay lit is
// the picture a whiteboard cannot draw, and it is the only honest way to show
// that "nothing is changing" and "nothing is happening" are different claims.
// The equilibrium constant as a LIVE MEASURED number (Rule 33d), which is what
// turns "adding reactant does not change K" from an assertion into something a
// student watches happen: the counts move a long way, this number does not.
//
// UNITS, and why the raw count ratio is the viewport-independent one. Concen-
// tration is count per unit area, so a naive K = nAB*A/(nA*nB) carries the box
// area and would change with the browser window — the monitor-dependent-number
// scar this engine has already paid for once. It does not apply here, because
// the reverse rate is already normalised to the fixed reference area:
//   forward  events/s  proportional to  nA*nB / A        (a pair must FIND each other)
//   reverse  events/s  proportional to  nAB * ref / A    (gasRxDecay * gasRxAreaNorm)
// Setting them equal, the A cancels on both sides:
//   nAB / (nA*nB)  =  k_fwd / (k_rev * ref)   — a constant of the reaction and
// the temperature, with no box area left in it. So the ratio of RAW COUNTS is
// already portable, and multiplying it by an area would be what breaks it.
// Value-only per Rule 34b — the symbolic K = [AB] / ([A][B]) belongs on the
// state's one formula surface, not duplicated here.
function drawGasKRatio(state) {
  if (!gasRxOn() || gasRxSpA < 0 || gasRxSpB < 0 || gasRxSpAB < 0) return;
  var dim = dimFor('reaction');
  var w = 150, h = 28, y = gasHudTop();
  var x = gasBoxL();
  if (pfWgVis('gas_pressure', state.show_pressure)) x += 142;
  if (pfWgVis('gas_thermo', state.show_gas_thermometer)) x += 126;
  if (pfWgVis('gas_law', state.show_gas_law)) x += 206;
  if (pfWgVis('gas_reaction', state.show_reaction_readout)) x += 276;
  if (x + w > gasBoxRFull()) x = max(gasBoxL(), gasBoxRFull() - w);
  gasChip(x, y, w, h);

  // The WINDOWED mean, not the instantaneous ratio — see gasSampleStats.
  var msg = (gasKMean > 0) ? 'K = ' + gasKMean.toFixed(4) : 'K = \\u2014';
  fillHex('#FDE68A', dim);
  textAlign(LEFT, TOP); textSize(12); noStroke();
  text(msg, x + 8, y + 5);
}

function drawGasConcGraph(state) {
  if (!gasRxOn() || gasConcTrace.length < 2) return;
  var gw = floor((gasBoxRFull() - gasBoxL()) * 0.38), gh = floor((gasBoxB() - gasBoxT()) * 0.34);
  if (gw < 90) return;
  var gx = gasBoxL() + 22, gy = gasBoxB() - gh - 26;
  var dim = dimFor('conc_graph');

  noStroke(); fill(8, 10, 22, 240);
  rect(gx - 10, gy - 14, gw + 20, gh + 40, 6);
  noFill(); strokeHex('#334155', 0.9 * dim); strokeWeight(1);
  rect(gx - 10, gy - 14, gw + 20, gh + 40, 6);

  var i, t, peak = 1;
  for (i = 0; i < gasConcTrace.length; i++) {
    t = gasConcTrace[i];
    peak = max(peak, t.a, t.b, t.ab);
  }
  var sA = gasSpecies[gasRxSpA], sB = gasSpecies[gasRxSpB];
  var series = [
    { key: 'a', c: sA.color }, { key: 'b', c: sB.color }, { key: 'ab', c: gasRxColor() }
  ];
  // The x axis is the TRACE BUFFER, not wall-clock: a fixed 260-sample window so
  // the curve keeps a constant sweep speed instead of compressing as it fills.
  var span = max(gasConcTrace.length - 1, 1);
  for (var s = 0; s < series.length; s++) {
    noFill(); strokeHex(series[s].c, 0.95 * dim); strokeWeight(2);
    // A and B are EQUAL BY CONSTRUCTION in every state that starts them equal,
    // so drawn solid the second curve hides the first completely and a plot
    // promising three series shows two. Dashing the B curve lets the A curve
    // read through it wherever they coincide, without moving either value.
    if (series[s].key === 'b' && drawingContext && drawingContext.setLineDash) drawingContext.setLineDash([6, 4]);
    beginShape();
    for (i = 0; i < gasConcTrace.length; i++) {
      var v = gasConcTrace[i][series[s].key];
      vertex(gx + (i / span) * gw, gy + gh - (v / peak) * gh);
    }
    endShape();
    if (drawingContext && drawingContext.setLineDash) drawingContext.setLineDash([]);
  }
  // A legend and a top-of-scale number: without them a teacher can read the
  // SHAPE but cannot say which curve is which, nor read a level off it.
  noStroke(); textSize(9); textAlign(LEFT, TOP);
  var lx = gx + 2;
  for (s = 0; s < series.length; s++) {
    var lab = (s === 0) ? (sA.label || 'A') : (s === 1) ? (sB.label || 'B') : (gasSpecies[gasRxSpAB].label || 'AB');
    fillHex(series[s].c, 0.95 * dim);
    text(lab, lx, gy + 2);
    lx += 26;
  }
  fillHex('#94A3B8', 0.8 * dim);
  textAlign(RIGHT, TOP);
  text(String(Math.round(peak)), gx + gw - 2, gy + 2);
  textAlign(LEFT, TOP);
  noStroke(); fillHex('#CBD5E1', 0.85 * dim);
  textAlign(LEFT, TOP); textSize(10);
  text('count', gx, gy - 12);
  textAlign(RIGHT, TOP);
  text('time \\u2192', gx + gw, gy + gh + 4);
  textAlign(LEFT, TOP);
}

// The energy self-check (default OFF — a bring-up and regression instrument,
// not a teaching one). Under adiabatic:true with the piston parked this number
// must hold flat: if it drifts, a reaction event is leaking or minting energy.
function drawGasLedger(state) {
  if (!gasRxOn()) return;
  // Centre of the bottom margin: drawLabel()'s state chip owns bottom-left and
  // the collision counter owns bottom-right (Rule 34d — the corners are spoken
  // for, and this chip is the third thing that wanted one).
  var w = 214, x = gasBoxMidX() - w / 2, y = gasBoxB() + 8;
  gasChip(x, y, w, 26);
  noStroke(); fillHex('#A7F3D0', dimFor('ledger'));
  textAlign(LEFT, CENTER); textSize(11);
  text('E_total = ' + gasEnergyLedger(state).toFixed(2) + '  (Q ' + gasHeatQ.toFixed(2) + ')', x + 8, y + 13);
  textAlign(LEFT, TOP);
}

// ─── Arrhenius instrument (2026-07-29) ─────────────────────────────────────
// The collision counter answers "how many clear the barrier RIGHT NOW". This
// answers the question a kinetics chapter actually asks: does that fraction
// follow a LAW as the temperature moves? It takes windowed samples of the
// cleared fraction against the temperature they were measured at and plots
// ln(fraction) against 1/T, then fits a line through the points it has.
//
// WHY IT IS A MEASUREMENT AND NOT A CURVE: nothing here evaluates the Arrhenius
// expression. Every point is a real tally of real collisions over a real window,
// and the slope is a least-squares fit to those tallies. The state's claim is
// that the points fall on a line — so the points must be able to MISS it, or
// the instrument would be a decoration proving itself.
//
// MEASURED BEFORE IT WAS BUILT (docs/skeletons/collision_theory_dq.txt):
// 8 points at a 4 s window over a 250->800 K ramp give R^2 0.9535 and a slope of
// -885 against the ideal -Ea/k = -900, i.e. 1.7% off, and 8 x 4 s fits inside one
// state. An 8 s window reaches R^2 0.9910 but needs 64 s. Tripling the particle
// density does NOT improve it (R^2 0.9508), so unlike the equilibrium-constant
// chip this instrument needs no density exception.
function gasSampleArrhenius() {
  var st = curState();
  if (!st || !st.show_arrhenius_plot) return;
  var winMs = (typeof st.arrhenius_window_ms === 'number') ? st.arrhenius_window_ms : 4000;
  // Accumulate THIS tick's tallies. Called from gasSampleStats, which runs after
  // the pair sweep and before the next tick zeroes the per-tick counters.
  gasArrWinC += gasCollTick;
  gasArrWinS += gasSuccessTick;
  gasArrWinT += gasTempK;
  gasArrWinN++;
  if (gasArrWinN * (1000 / 60) < winMs) return;
  // A window with no clearing collisions at all is a real measurement of "too
  // cold to see", but ln(0) is not a point — it is dropped, and the gap in the
  // plot is the honest record of it.
  if (gasArrWinC > 0 && gasArrWinS > 0) {
    gasArrPts.push({
      invT: 1 / max(gasArrWinT / gasArrWinN, 1),
      lnf: Math.log(gasArrWinS / gasArrWinC)
    });
    while (gasArrPts.length > 40) gasArrPts.shift();
  }
  gasArrWinC = 0; gasArrWinS = 0; gasArrWinT = 0; gasArrWinN = 0;
}
// Axis solved ONCE per state from the authored temperature span and the authored
// barrier, never from the points. A frame that rescaled to its own data would
// hold the cloud of points still while the axis moved underneath — the same
// defect as a rate bar renormalised to its own maximum, which reports a ratio
// and never a magnitude.
function gasArrhAxis(state) {
  if (gasArrAxis) return gasArrAxis;
  var g = gasCfg();
  var tLo = (typeof state.arrhenius_T_min === 'number') ? state.arrhenius_T_min : 250;
  var tHi = (typeof state.arrhenius_T_max === 'number') ? state.arrhenius_T_max : 800;
  var refT = (typeof g.ea_ref_T === 'number') ? g.ea_ref_T
    : (typeof g.temperature_K === 'number') ? g.temperature_K : 300;
  var nkT = gasActivationE(state) / max(gasEaKtRef(), 1e-9);   // the barrier, back in kT
  gasArrAxis = {
    x0: 1 / max(tHi, 1), x1: 1 / max(tLo, 1),
    y0: -nkT * (refT / max(tLo, 1)) - 1.6,     // coldest, with headroom below
    y1: -nkT * (refT / max(tHi, 1)) + 0.6      // hottest, with headroom above
  };
  return gasArrAxis;
}
// Least squares over the points so far. Returns null until there are enough of
// them AND they span enough of the axis to constrain a slope.
//
// The span test is the load-bearing one. With 3 early points crowded into the
// cold end of a ramp, the fit is drawn confidently across the whole plot and is
// simply wrong: measured on a probe frame at t=12 s it printed "slope -410 K"
// beside "-Ea/k = -900 K", so a state whose caption reads "one straight line"
// showed a line disagreeing with the law by a factor of two. That is worse than
// showing nothing, because it is the instrument that carries the state's claim.
// Until the measurement can support a slope, it says so.
// Takes the state and solves the axis ITSELF. The first version read the cached
// gasArrAxis, which is populated by drawGasArrhenius — so headless (and on any
// frame before the first draw) the span guard silently did nothing and the fit
// came back anyway. Caught by the gate assertion written for the guard: 10
// points spanning 300-320 K on a 250-800 K axis still produced a line, at slope
// -119. A guard that depends on the draw path having run is not a guard.
function gasArrhFit(state) {
  var n = gasArrPts.length;
  if (n < 4) return null;
  var ax = gasArrhAxis(state || curState() || {});
  var lo = gasArrPts[0].invT, hi = gasArrPts[0].invT, q;
  for (q = 1; q < n; q++) {
    if (gasArrPts[q].invT < lo) lo = gasArrPts[q].invT;
    if (gasArrPts[q].invT > hi) hi = gasArrPts[q].invT;
  }
  if ((hi - lo) < 0.45 * Math.abs(ax.x1 - ax.x0)) return null;
  var i, mx = 0, my = 0;
  for (i = 0; i < n; i++) { mx += gasArrPts[i].invT; my += gasArrPts[i].lnf; }
  mx /= n; my /= n;
  var sxy = 0, sxx = 0, syy = 0, dx, dy;
  for (i = 0; i < n; i++) {
    dx = gasArrPts[i].invT - mx; dy = gasArrPts[i].lnf - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  if (sxx <= 0 || syy <= 0) return null;
  return { slope: sxy / sxx, intercept: my - (sxy / sxx) * mx, r2: (sxy * sxy) / (sxx * syy), n: n };
}
// A rounded temperature-slope with a REAL Unicode minus (U+2212). Math.round
// and toFixed both emit an ASCII hyphen, which is the recurring
// ascii_minus_in_oncanvas_math scar — already recorded FIXED once and already
// regressed once, both times caught only by reading a rendered frame.
function gasSignedK(n) {
  var r = Math.round(n);
  return (r < 0 ? '\\u2212' : '') + Math.abs(r) + ' K';
}
// ─── Reaction profile: the energy hill (2026-07-29) ────────────────────────
// The picture everyone means by "activation energy" — reactants climb a hump to
// become products — and the one thing this box could not previously show. The
// collision counter reports a THRESHOLD and the histogram draws it on a SPEED
// axis; neither is the hill a student is examined on, so a lesson could teach
// the statistics correctly and never connect them to the diagram.
//
// NOTHING HERE IS DRAWN TO TASTE. The hill's height IS gasActivationE() in kT —
// the same number the collision test compares against — and the product level IS
// the reaction layer's bond energy. So the catalyst beat lowers the hill because
// the barrier genuinely fell, the Ea slider drags the hill because the barrier
// genuinely moved, and the reverse barrier a viewer can measure off the picture
// (peak minus product level) is exactly the Ea_rev = Ea_fwd + E_bond the engine
// derives. A cartoon would have to be kept in sync by hand; this cannot drift.
//
// Sign convention follows the reaction layer: bond_energy_kT > 0 is exothermic
// forward, so products sit BELOW reactants by that amount.
function gasProfileLevels(state) {
  var kt = max(gasEaKtRef(), 1e-9);
  // The hill is a picture of THE REACTION, so its peak is the REACTION's forward
  // barrier, not the collision counter's threshold. Those are separate authored
  // numbers, and a concept may set them differently: drawing the counter's here
  // produced a picture whose measurable reverse barrier (peak minus product
  // level) read 5.0 kT against the 3.2 kT the engine derives — the diagram
  // contradicting the physics it exists to illustrate, caught only by asserting
  // the identity rather than eyeballing the hump.
  // Falls back to the collision threshold when no reaction is configured at all,
  // so the hill still draws for a box that only counts.
  var eaKT = gasRxCfg() ? (gasRxEaFwd(state) / kt) : (gasActivationE(state) / kt);
  var bondKT = gasRxBondE(state) / kt;                   // > 0 = exothermic
  return { ea: eaKT, drop: bondKT, peak: eaKT, prod: -bondKT };
}
function drawGasProfile(state) {
  var gw = floor((gasBoxRFull() - gasBoxL()) * 0.34), gh = floor((gasBoxB() - gasBoxT()) * 0.42);
  if (gw < 90) return;
  // Take the side the histogram is not on, and dodge the review player's fixed
  // slider panel the same way both other insets do.
  var histOn = pfWgVis('gas_histogram', state.show_speed_histogram);
  var arrOn = pfWgVis('gas_arrhenius', state.show_arrhenius_plot);
  var histIsLeft = !!state.show_sliders;
  var onLeft = (histOn || arrOn) ? !histIsLeft : histIsLeft;
  var gx = onLeft ? (gasBoxL() + 22) : (gasBoxRFull() - gw - 22);
  var gy = gasBoxT() + 22;
  // "Opposite the histogram" is not enough on its own. On the explore state the
  // histogram flees LEFT to escape the slider panel, which sends this inset
  // RIGHT — straight into the slot the panel occupies. Measured on the explore
  // frame: the Volume slider row sat on top of the "kT" in this panel's own Ea
  // label, in the ONE state where a teacher drags Ea and watches that value
  // move. So when this inset lands on the right with the panel up, drop below
  // the panel's REAL measured bottom rather than assuming a clearance.
  if (!onLeft && state.show_sliders) {
    var slEl = document.getElementById('pm-sliders');
    if (slEl && slEl.style.display !== 'none' && slEl.offsetHeight) {
      var slBottom = (slEl.offsetTop || 0) + slEl.offsetHeight + 16;
      if (slBottom > gy) gy = slBottom;
    }
    // ...and keep the whole panel, label rows included, inside the box
    gy = min(gy, max(gasBoxT() + 22, gasBoxB() - gh - 56));
  }
  var dim = dimFor('profile');
  var L = gasProfileLevels(state);

  noStroke(); fill(8, 10, 22, 255);
  rect(gx - 10, gy - 10, gw + 20, gh + 44, 6);
  noFill(); strokeHex('#334155', 0.9 * dim); strokeWeight(1);
  rect(gx - 10, gy - 10, gw + 20, gh + 44, 6);

  // Energy axis spans the whole excursion with headroom, so a hill that moves
  // moves AGAINST A FIXED FRAME rather than rescaling the frame under itself.
  var hi = max(L.peak, 0) + 1.2, lo = min(L.prod, 0) - 0.8;
  var py = function (e) { return gy + gh - ((e - lo) / max(hi - lo, 1e-6)) * gh; };
  var y0 = py(0), yPeak = py(L.peak), yProd = py(L.prod);

  // reactant plateau -> smooth hump -> product plateau
  var xA = gx + gw * 0.06, xB = gx + gw * 0.34, xC = gx + gw * 0.50, xD = gx + gw * 0.66, xE = gx + gw * 0.94;
  noFill(); strokeHex('#FBBF24', 0.95 * dim); strokeWeight(2);
  beginShape();
  vertex(gx, y0); vertex(xA, y0);
  var i, t, yv;
  for (i = 0; i <= 40; i++) {                       // rise: reactants -> peak
    t = i / 40;
    yv = y0 + (yPeak - y0) * (0.5 - 0.5 * Math.cos(Math.PI * t));
    vertex(xA + (xC - xA) * t, yv);
  }
  for (i = 0; i <= 40; i++) {                       // fall: peak -> products
    t = i / 40;
    yv = yPeak + (yProd - yPeak) * (0.5 - 0.5 * Math.cos(Math.PI * t));
    vertex(xC + (xE - xC) * t, yv);
  }
  endShape();
  void xB; void xD;

  // the two levels, dashed, so the heights can be READ off the curve
  drawingContext.setLineDash([3, 4]);
  strokeHex('#64748B', 0.8 * dim); strokeWeight(1);
  line(gx, y0, gx + gw, y0);
  line(gx, yProd, gx + gw, yProd);
  drawingContext.setLineDash([]);

  // Ea, measured from the reactant level to the peak — a real arrow with a real
  // number, not a label floating near a hump (Rule 33d).
  // AT THE PEAK, not partway up the rise. Drawn at 62% of the climb the arrow
  // ran from the reactant level to the peak HEIGHT at an x where the curve is
  // only partway up, so it visibly crossed the curve and measured nothing a
  // viewer could point at. At the peak it is exactly the hill, which is what the
  // number claims. Label sits to the LEFT so it never lands on the curve.
  var ax = xC;
  strokeHex('#F87171', 0.95 * dim); strokeWeight(2);
  line(ax, y0, ax, yPeak);
  noStroke(); fillHex('#F87171', 0.95 * dim);
  triangle(ax, yPeak, ax - 4, yPeak + 7, ax + 4, yPeak + 7);
  triangle(ax, y0, ax - 4, y0 - 7, ax + 4, y0 - 7);
  // ABOVE the peak, in the one region of this panel that is always empty. Beside
  // the arrow it landed on the rising limb of the curve at every barrier height.
  textAlign(CENTER, BOTTOM); textSize(12);
  text('E\\u2090 = ' + L.ea.toFixed(1) + ' kT', ax, yPeak - 9);

  // labels
  textSize(11); textAlign(LEFT, TOP);
  fillHex('#93C5FD', 0.95 * dim); text('reactants', gx + 2, y0 + 6);
  fillHex('#C084FC', 0.95 * dim);
  textAlign(RIGHT, TOP); text('products', gx + gw - 2, yProd + 6);
  textAlign(LEFT, TOP); textSize(10);
  fillHex('#CBD5E1', 0.8 * dim);
  text('energy', gx + 2, gy - 4);
  textAlign(RIGHT, TOP);
  text('reaction progress \\u2192', gx + gw, gy + gh + 12);
  textAlign(LEFT, TOP);
}

function drawGasArrhenius(state) {
  // Same inset geometry as the histogram, on the opposite side when both are
  // lit — they are normally mutually exclusive (a state teaches the
  // distribution OR the law it obeys), but an overlap would bury both.
  var gw = floor((gasBoxRFull() - gasBoxL()) * 0.40), gh = floor((gasBoxB() - gasBoxT()) * 0.50);
  if (gw < 90) return;
  // Sit opposite the histogram when both are lit; otherwise take the same side
  // the histogram would, and dodge the slider panel the same way it does.
  var histOn = pfWgVis('gas_histogram', state.show_speed_histogram);
  var histIsLeft = !!state.show_sliders;
  var onLeft = histOn ? !histIsLeft : histIsLeft;
  var gx = onLeft ? (gasBoxL() + 22) : (gasBoxRFull() - gw - 22);
  var gy = gasBoxT() + 22;
  // "Opposite the histogram" is not enough on its own. On the explore state the
  // histogram flees LEFT to escape the slider panel, which sends this inset
  // RIGHT — straight into the slot the panel occupies. Measured on the explore
  // frame: the Volume slider row sat on top of the "kT" in this panel's own
  // Ea label, in the ONE state where a teacher drags Ea and watches that value
  // move. So when this inset ends up on the right with the panel up, drop below
  // the panel's real measured bottom rather than assuming a clearance.
  if (!onLeft && state.show_sliders) {
    var slEl = document.getElementById('pm-sliders');
    if (slEl && slEl.style.display !== 'none' && slEl.offsetHeight) {
      var slBottom = (slEl.offsetTop || 0) + slEl.offsetHeight + 14;
      if (slBottom > gy) gy = slBottom;
    }
    // keep the whole panel, labels included, inside the box
    gy = min(gy, max(gasBoxT() + 22, gasBoxB() - gh - 52));
  }
  var dim = dimFor('arrhenius');
  var ax = gasArrhAxis(state), i;

  // OPAQUE, unlike the histogram's 240-alpha backing. The histogram fills its
  // area with bars so the ~6% of particles bleeding through never register; a
  // scatter plot is mostly empty, and on the probe frames the drifting discs
  // read as dirt inside the one instrument the state is asking a class to read.
  noStroke(); fill(8, 10, 22, 255);
  rect(gx - 10, gy - 10, gw + 20, gh + 46, 6);
  noFill(); strokeHex('#334155', 0.9 * dim); strokeWeight(1);
  rect(gx - 10, gy - 10, gw + 20, gh + 46, 6);

  var px = function (v) { return gx + constrain((v - ax.x0) / max(ax.x1 - ax.x0, 1e-12), 0, 1) * gw; };
  var py = function (v) { return gy + gh - constrain((v - ax.y0) / max(ax.y1 - ax.y0, 1e-12), 0, 1) * gh; };

  // axes
  strokeHex('#475569', 0.9 * dim); strokeWeight(1);
  line(gx, gy, gx, gy + gh); line(gx, gy + gh, gx + gw, gy + gh);

  // the fitted line first, so the measured points sit ON TOP of it and a point
  // that misses is visibly a miss
  var fit = gasArrhFit(state);
  if (fit) {
    strokeHex('#FBBF24', 0.85 * dim); strokeWeight(2);
    var yA = fit.intercept + fit.slope * ax.x0, yB = fit.intercept + fit.slope * ax.x1;
    line(px(ax.x0), py(constrain(yA, ax.y0, ax.y1)), px(ax.x1), py(constrain(yB, ax.y0, ax.y1)));
  }

  noStroke(); fillHex('#7DD3FC', 0.95 * dim);
  for (i = 0; i < gasArrPts.length; i++) circle(px(gasArrPts[i].invT), py(gasArrPts[i].lnf), 5);

  // Rule 33d: the live number, and the number it is being measured against.
  // Ea/k is the slope the law predicts, so the two printed side by side ARE the
  // check — nothing here asserts they agree.
  var g2 = gasCfg();
  var refT2 = (typeof g2.ea_ref_T === 'number') ? g2.ea_ref_T
    : (typeof g2.temperature_K === 'number') ? g2.temperature_K : 300;
  var eaOverK = (gasActivationE(state) / max(gasEaKtRef(), 1e-9)) * refT2;
  textAlign(LEFT, TOP); textSize(10); noStroke();
  fillHex('#CBD5E1', 0.85 * dim);
  text('ln f', gx + 2, gy - 4);
  text('1/T \\u2192', gx + gw - 30, gy + gh + 4);
  // ONE line, and no subscript. Two things a rendered frame showed that no gate
  // could:
  //   * the subscript-a (U+2090) is technically drawn but is illegible at this
  //     size in this dim colour — cropped and enlarged, "-Ea/k" read as "-E /k".
  //     The symbol also already lives on the state's math-serif formula surface,
  //     so printing it here duplicated the one formula surface (Rule 34b). The
  //     reference value is what this instrument needs, not the symbol.
  //   * Math.round() emits an ASCII HYPHEN, which sat directly beside a proper
  //     Unicode minus in the same line — the ascii_minus_in_oncanvas_math scar
  //     regressing for the third time (Rule 34c). Every signed number on this
  //     chip goes through gasSignedK.
  textSize(12);
  fillHex(fit ? '#FBBF24' : '#64748B', 0.95 * dim);
  text(fit ? ('slope ' + gasSignedK(fit.slope) + '   (law: ' + gasSignedK(-eaOverK) + ')') : 'measuring\\u2026',
    gx + 2, gy + gh + 20);
}

// The Maxwell-Boltzmann pane: live histogram + the 2D theory curve + the three
// named speeds. A distribution SHIFTING is the motion here (Rule 31) — nothing
// else on canvas needs to move for this state to teach.
function drawGasHistogram(state) {
  // An instrument panel inset into the tank's right side, not a pane beside it.
  var gw = floor((gasBoxRFull() - gasBoxL()) * 0.40), gh = floor((gasBoxB() - gasBoxT()) * 0.56);
  // The review player's slider panel is a position:fixed DOM overlay at
  // top ~52 / right 10, ABOVE the canvas — so on any state that shows sliders it
  // lands squarely on this inset's top-right corner and clips the Eₐ threshold
  // label and the species tag. Measured on collision_theory's explore state:
  // "Eₐ" was clipped to a bare "E". Move to the LEFT inset when sliders are up.
  //
  // This also fixes kinetic_particle_theory's STATE_7, which has shipped with
  // the same collision since the histogram landed — so approving this moves that
  // concept's frozen baselines (pixels only, no physics). That re-baseline is a
  // founder call, not an automatic one.
  var histLeft = !!(curState() || {}).show_sliders;
  var gx = histLeft ? (gasBoxL() + 22) : (gasBoxRFull() - gw - 22), gy = gasBoxT() + 22;
  if (gw < 90) return;
  var dim = dimFor('histogram');
  var i, p, v;

  var g = gasCfg();
  // ONE species per histogram. A mixture of masses is a mixture of Rayleigh
  // distributions (heavier = slower), so plotting every particle against a
  // single theory curve puts the bars beside the curve and teaches the wrong
  // thing — in exactly the two-gas state where the curve matters most.
  var spIdx = (state && typeof state.hist_species === 'number') ? state.hist_species : 0;
  if (spIdx < 0 || spIdx >= gasSpecies.length) spIdx = 0;
  var hSp = gasSpecies[spIdx];
  var sig0 = gasSigma(hSp.mass, (typeof g.hist_ref_T === 'number') ? g.hist_ref_T : max(gasTargetT(), 1));
  var vMax = max(sig0 * 3.6, 1e-6);          // fixed axis: the curve must MOVE against it
  var BINS = 26, bins = [], n = particles.length;
  for (i = 0; i < BINS; i++) bins[i] = 0;
  for (i = 0; i < n; i++) {
    p = particles[i];
    if (p.sp !== spIdx) continue;
    v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    var b = floor(v / vMax * BINS);
    if (b >= 0 && b < BINS) bins[b]++;
  }
  var peak = 1;
  for (i = 0; i < BINS; i++) peak = max(peak, bins[i]);

  // Near-opaque backing + a border: it now sits ON the gas, so it has to read as
  // an instrument laid over the tank, never as a translucent smear of particles.
  noStroke(); fill(8, 10, 22, 240);
  rect(gx - 10, gy - 10, gw + 20, gh + 50, 6);
  noFill(); strokeHex('#334155', 0.9 * dim); strokeWeight(1);
  rect(gx - 10, gy - 10, gw + 20, gh + 50, 6);
  noStroke();

  // Activation-energy tail, shaded behind the bars (the collision-theory beat)
  var ea = gasActivationE(state);
  if (ea > 0) {
    var vEa = Math.sqrt(2 * ea / max(hSp.mass, 1e-6));
    var xEa = gx + constrain(vEa / vMax, 0, 1) * gw;
    noStroke(); fillHex('#FDE047', 0.13 * dim);
    rect(xEa, gy, max(gx + gw - xEa, 0), gh);
    strokeHex('#FDE047', 0.75 * dim); strokeWeight(1.5);
    line(xEa, gy, xEa, gy + gh);
    noStroke(); fillHex('#FDE047', 0.9 * dim);
    textAlign(LEFT, TOP); textSize(10);
    if (xEa < gx + gw - 22) text('E\\u2090', xEa + 3, gy + 2);
  }

  noStroke(); fillHex(hSp.color, 0.55 * dim);
  var bw = gw / BINS;
  for (i = 0; i < BINS; i++) {
    var bh = (bins[i] / peak) * gh;
    if (bh > 0.5) rect(gx + i * bw + 0.5, gy + gh - bh, bw - 1, bh);
  }

  // 2D Maxwell-Boltzmann: f(v) = (v/sigma^2)*exp(-v^2/2sigma^2), peaking at sigma.
  var sig = gasSigma(hSp.mass, gasTempK);
  noFill(); strokeHex('#FBBF24', 0.95 * dim); strokeWeight(2);
  beginShape();
  for (i = 0; i <= 60; i++) {
    v = vMax * i / 60;
    var f = (v / (sig * sig)) * Math.exp(-(v * v) / (2 * sig * sig));
    var fPeak = (1 / sig) * Math.exp(-0.5);
    vertex(gx + (i / 60) * gw, gy + gh - constrain(f / fPeak, 0, 1) * gh);
  }
  endShape();

  // Name the population when the box holds more than one gas, so nobody reads
  // a single-species curve as the whole mixture.
  if (gasSpecies.length > 1) {
    noStroke(); fillHex(hSp.color, 0.95 * dim);
    textAlign(RIGHT, TOP); textSize(10);
    text(hSp.label || hSp.id || ('species ' + spIdx), gx + gw - 2, gy + 2);
  }

  // v_mp / v_avg / v_rms are the Maxwell-Boltzmann concept's vocabulary. A
  // lesson that shows this histogram for a DIFFERENT reason (a barrier sitting
  // on the distribution, say) puts three untaught terms on screen — Rule 25, no
  // untaught term. Opt OUT per state; the default stays on so every already
  // baseline-locked concept on this histogram keeps its exact frames.
  if (state && state.hist_speed_marks === false) { noStroke(); }
  else {
  var st = gasSpeedStats(spIdx);
  var marks = [
    { v: sig, c: '#FBBF24', t: 'v_mp' },
    { v: st.vavg, c: '#93C5FD', t: 'v_avg' },
    { v: st.vrms, c: '#F0ABFC', t: 'v_rms' }
  ];
  textSize(9); textAlign(CENTER, TOP);
  for (i = 0; i < marks.length; i++) {
    var mx = gx + constrain(marks[i].v / vMax, 0, 1) * gw;
    strokeHex(marks[i].c, 0.85 * dim); strokeWeight(1);
    line(mx, gy + gh, mx, gy + gh + 6);
    noStroke(); fillHex(marks[i].c, 0.95 * dim);
    text(marks[i].t, mx, gy + gh + 8 + i * 11);
  }
  }
  noStroke(); fillHex('#CBD5E1', 0.8 * dim);
  textAlign(RIGHT, TOP); textSize(10);
  text('speed \\u2192', gx + gw, gy + gh + 30);
}

// ─── Draw loop (render only — physics advanced separately) ──────────────────
// Frame-rate-independent stepping (2026-07-11). p5's frameRate(60) is only a
// TARGET — on displays it can't hit exactly (or a 120 Hz device that rounds to
// a multiple), the old one-tick-per-draw ran physics at draw rate while the
// recorded narration played at wall-clock speed. Accumulate real elapsed ms
// (p5's deltaTime) and run 0-3 fixed 1/60 s ticks per draw — numerically
// identical when draw fires at 60 Hz, rate-correct elsewhere. The
// SET_TIME_FREEZE deterministic re-sim path is untouched (draw() never steps
// while frozen/paused), so THE EYE's pinned captures stay byte-identical.
// THE ONE step dispatcher. Both the live draw loop and the SET_TIME_FREEZE
// deterministic re-sim route through here, because they diverged once and it
// was invisible: gas_box got its branch in draw() but the freeze handler still
// read "isCircuitFamily() ? stepCircuit : stepPhysics", so every frozen and
// dense capture stepped the electron-drift lattice physics over gas particles.
// Discs walked straight through the box walls and the wall-impulse/collision
// stats never accumulated — yet THE EYE reported 31/31 twice, because its
// deterministic gates were measuring corrupted frames. A new scenario family
// must be added HERE, once, and both paths inherit it.
function stepFor(state) {
  if (gasMode()) return stepGas(state);
  if (isCircuitFamily()) return stepCircuit(state);
  return stepPhysics(state);
}

var __pmAccumMs = 0;
function pmStepTicks(state, stepFn) {
  __pmAccumMs += min(50, deltaTime); // clamp tab-background gaps to 3 catch-up ticks
  var n = 0;
  while (__pmAccumMs >= 1000 / 60 && n < 3) { stepFn(state); __pmAccumMs -= 1000 / 60; n++; }
}

function draw() {
  if (!config) return;
  var state = curState();
  if (!state) return;

  if (isCircuitFamily()) {
    if (!frozen && !paused) pmStepTicks(state, stepCircuit);
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

  if (gasMode()) {
    if (!frozen && !paused) pmStepTicks(state, stepFor);
    var gbg = (config.canvas && config.canvas.bg_color) ? config.canvas.bg_color
      : (config.design && config.design.background) ? config.design.background : '#0A0A1A';
    background(gbg);
    push();
    translate(0, microTop());
    drawGasBox(state);
    if (pfWgVis('gas_pressure', state.show_pressure)) drawGasPressure();
    if (pfWgVis('gas_thermo', state.show_gas_thermometer)) drawGasThermometer(state);
    if (pfWgVis('gas_counters', state.show_collision_counter)) drawGasCounters(state);
    if (pfWgVis('gas_law', state.show_gas_law)) drawGasLaw();
    if (pfWgVis('gas_histogram', state.show_speed_histogram)) drawGasHistogram(state);
    if (pfWgVis('gas_arrhenius', state.show_arrhenius_plot)) drawGasArrhenius(state);
    if (pfWgVis('gas_profile', state.show_reaction_profile)) drawGasProfile(state);
    if (pfWgVis('gas_reaction', state.show_reaction_readout)) drawGasReaction(state);
    if (pfWgVis('gas_k_ratio', state.show_k_ratio)) drawGasKRatio(state);
    if (pfWgVis('gas_conc_graph', state.show_concentration_graph)) drawGasConcGraph(state);
    if (pfWgVis('gas_ledger', state.show_energy_ledger)) drawGasLedger(state);
    pop();
    drawLabel(state);
    var gFrm = document.getElementById('pm-formula');
    if (gFrm) gFrm.style.opacity = dimFor('formula');
    if (borderFlashAlpha > 0) {
      noFill(); strokeHex('#3B82F6', borderFlashAlpha * 0.6); strokeWeight(3);
      rect(1, 1, width - 2, height - 2, 4); noStroke();
      borderFlashAlpha -= 0.025;
    }
    return;
  }

  if (!frozen && !paused) pmStepTicks(state, stepPhysics);

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
  if (pfWgVis('drift_arrow', state.show_drift_arrow) && curEffDrift > 0) drawDriftArrow(state);   // global-bottom, inside micro band
  if (pfWgVis('current_meter', state.show_current_meter) && !mvOn()) drawCurrentMeter();  // macro_view: the macro-band ammeter is the single current instrument
  if (pfWgVis('flux_panel', state.show_flux_conservation)) drawFluxConservation(state);
  if (pfWgVis('vi_graph', state.show_vi_graph)) { drawVIGraph(state); updateReadouts(); }  // readout tracks the live sweep
  if (pfWgVis('thermometer', state.show_thermometer) && hasSlider('T')) drawThermometer();
  if (hasSlider('L') || hasSlider('material')) updateReadouts();     // resistivity: readout tracks live L/A/material/T
  if (hasPowerMeter() && pfWgVis('power_meter', intensity > 0)) drawPowerMeter(intensity);
  if (hasHeatCounter() && pfWgVis('heat_counter', heatAccumulator > 0)) drawHeatCounter();
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
function drawPotentialLadder(eps, i, R, swOpen, dim, traceS, holdPulse, prof, ir, kvl) {
  var lowPanel = !!ir || !!(kvl && kvl.shiftDown);   // clear the tall 4-row slider panel + readout (Rule 34d): internal_resistance always; KVL only on the S5 all-sliders layout (FINDING C)
  // combination_of_cells STATE_8 (explore): the 7-row panel (emf/r/R/switch +
  // cell_topology/cell_count/flip_cell2, THREE more rows than internal_resistance's
  // stock 4) + the 4-line combo readout runs well past where the standard lowPanel
  // offset (tuned for the 4-row panel) clears — the ladder's title/eps_eq label sat
  // behind the opaque panel (eye-walker finding: combo_cells_explore_sliders_
  // collide_ladder_graph). Push the box further down AND shrink its height so it
  // still fits above the viewport bottom. Scoped to ccMode()'s show_sliders state
  // only — every other ir-mode/KVL state (short or no panel) is unaffected.
  var tallCombo = !!(ir && ir.mode === 'combo' && ir.tallPanel);
  var x0 = width * 0.74, y0 = tallCombo ? height * 0.68 : (lowPanel ? height * 0.39 : height * 0.30);
  // Follow-on to the panel-collision fix above: pushing y0 down to clear the S8
  // slider panel left the box's own bottom edge (where the 'cell'/'load' x-axis
  // labels sit, at gy = y0+h-padB) intruding into the ALWAYS-ON #pm-formula chip's
  // fixed bottom-right corner (right:12/bottom:12, ~34px tall for its single-line
  // formula text -> its top edge sits at height-46). 0.28*height pushed the label
  // row to ~gy+3 = height-49, just inside that chip's zone (eye-walker: the S8
  // ladder-panel/formula-chip corner collision). 0.24*height keeps the same y0
  // (still clears the panel, per the earlier confirmed fix) but ends the box —
  // and its bottom label row — well above the chip's top edge instead of pushing
  // the box further down (which would risk the panel again) or narrower/left
  // (which would collide with the circuit loop's own right wire at rightX=0.70W).
  var w = width * 0.225, h = tallCombo ? height * 0.24 : height * 0.42;
  rectMode(CORNER); fill(10, 12, 28, 210 * dim); noStroke(); rect(x0, y0, w, h, 6);
  strokeHex('#37474F', 0.8 * dim); strokeWeight(1); noFill(); rect(x0, y0, w, h, 6);
  var padL = 30, padB = 20, gx = x0 + padL, gy = y0 + h - padB, gw = w - padL - 12, gh = h - padB - 20;
  // combination_of_cells S4: eps_eq legitimately glides to EXACTLY 0 (the reversed-
  // pair dead circuit) and holds there for the rest of the state — a bare eps*1.2
  // would make vmax 0 and py()'s v/vmax divide-by-zero into NaN for that entire
  // hold. The 0.3 floor is a no-op for every existing sibling (emf sliders never
  // author a 0 default/min anywhere in this file).
  var vmax = (ir && ir.mode === 'charging') ? ir.epsCh * 1.15 : max(eps * 1.2, 0.3);
  function py(v) { return gy - gh * constrain(v / vmax, 0, 1); }
  strokeHex('#78909C', 0.7 * dim); strokeWeight(1.5); line(gx, gy, gx, gy - gh); line(gx, gy, gx + gw, gy);
  strokeHex('#66BB6A', 0.35 * dim); strokeWeight(1); line(gx, py(eps), gx + gw, py(eps));   // eps reference
  var xa = gx, xc = gx + gw * 0.50, xd = gx + gw * 0.70, xe = gx + gw;
  var lDim = dimFor('ladder'), lo = swOpen ? eps : 0;
  if (kvl) {
    // KVL multi-step profile: +eps riser at the cell, then one -IRk diagonal
    // down-step per resistor, closing to exactly 0. Sub-segments across gw =
    // flat,drop,flat,drop,...,drop,flat_return = 2n+1 for n resistors. Each
    // segment's delta is scaled by a staged-reveal factor (S2 ladder_build_ms:
    // index 0 = riser, 1..n = each step) so the ladder builds segment by segment
    // and is derivable at ANY pinned sim-time (t=0 => all factors 0 => flat at 0V baseline).
    var Dk = kvl.three ? [kvl.V1, kvl.V2, kvl.V3] : [kvl.V1, kvl.V2];
    var nk = Dk.length, seg = gw / (2 * nk + 1), lDimK = dimFor('ladder');
    var segRev = function(idx) {
      if (!kvl.build || kvl.build[idx] === undefined) return 1;
      return constrain((PM_simTimeMs - kvl.build[idx]) / 500, 0, 1);
    };
    var pts = [], vx = gx, vv = eps * segRev(0);
    pts.push({ x: gx, y: py(0) });                     // riser bottom (0 V)
    pts.push({ x: gx, y: py(vv) });                    // riser top (+eps)
    vx = gx + seg; pts.push({ x: vx, y: py(vv) });     // top flat
    for (var dk = 0; dk < nk; dk++) {
      vv -= Dk[dk] * segRev(dk + 1);                   // -IR(dk) diagonal drop
      vx += seg; pts.push({ x: vx, y: py(vv) });
      vx += seg; pts.push({ x: vx, y: py(vv) });       // flat to next resistor / return
    }
    pts.push({ x: gx + gw, y: py(vv) });               // extend the closing flat to the wall
    strokeHex('#4DD0E1', 0.98 * lDimK); strokeWeight(2.5); noFill();
    beginShape(); for (var pk = 0; pk < pts.length; pk++) vertex(pts[pk].x, pts[pk].y); endShape();
    // 0 V baseline tick — the ladder ALWAYS lands here (the taught rule)
    strokeHex('#66BB6A', 0.4 * dim); strokeWeight(1); line(gx, py(0), gx + gw, py(0));
    // step labels: +eps at the riser, -Vk at each drop centre
    noStroke(); textStyle(BOLD); textSize(10);
    fillHex('#66BB6A', 0.95 * segRev(0) * dim); textAlign(LEFT, BOTTOM);
    text('+' + eps.toFixed(1), gx + 3, py(eps) - 3);
    var accV = eps;
    for (var lk = 0; lk < nk; lk++) {
      accV -= Dk[lk];
      fillHex('#EF9A9A', 0.95 * segRev(lk + 1) * dim); textAlign(CENTER, TOP);
      text('\\u2212' + Dk[lk].toFixed(1), gx + seg * (1.5 + 2 * lk), py(accV + Dk[lk] * 0.5) + 1);
    }
    fillHex('#66BB6A', 0.9 * dim); textSize(9); textAlign(RIGHT, BOTTOM); text('0', gx - 3, py(0) + 4);
    // the followed charge (S1) rides the ladder in lockstep with the loop marker:
    // BOTH are driven by the SAME loop-fraction (kvl.marker) mapped through the SAME
    // loop profile (kvl.prof) so the dot sits at exactly the potential of the loop
    // position the physical marker occupies (FINDING A) - no arc-length desync.
    if (kvl.marker !== null && kvl.marker !== undefined && !swOpen && kvl.prof) {
      var mkS = ((kvl.marker % 1) + 1) % 1, mkP = kvl.prof, mkX, mkV;
      if (mkS < mkP.sc) {                              // riser at the cell: x fixed, potential climbs 0 -> eps
        mkX = gx; mkV = eps * (mkS / max(mkP.sc, 1e-6));
      } else if (mkS < mkP.enter[0]) {                 // wire cell -> R1: ladder top flat at eps
        mkX = gx + seg * (mkS - mkP.sc) / max(mkP.enter[0] - mkP.sc, 1e-6); mkV = eps;
      } else {
        var mkA = eps, mkPlaced = false;
        for (var rk = 0; rk < nk; rk++) {
          if (mkS < mkP.exit[rk]) {                     // across resistor rk: the -IRk drop
            var mkF = (mkS - mkP.enter[rk]) / max(mkP.exit[rk] - mkP.enter[rk], 1e-6);
            mkX = gx + seg * (1 + 2 * rk) + seg * mkF; mkV = mkA - Dk[rk] * mkF; mkPlaced = true; break;
          }
          mkA -= Dk[rk];                               // past resistor rk (fully dropped)
          if (rk < nk - 1 && mkS < mkP.enter[rk + 1]) { // wire rk -> rk+1: flat at mkA
            var mkFw = (mkS - mkP.exit[rk]) / max(mkP.enter[rk + 1] - mkP.exit[rk], 1e-6);
            mkX = gx + seg * (2 + 2 * rk) + seg * mkFw; mkV = mkA; mkPlaced = true; break;
          }
        }
        if (!mkPlaced) {                               // return wire after the last drop: flat at closing potential (0)
          var mkLast = mkP.exit[nk - 1], mkFr = (mkS - mkLast) / max(1 - mkLast, 1e-6);
          mkX = gx + seg * (2 * nk) + (gw - seg * (2 * nk)) * mkFr; mkV = mkA;
        }
      }
      var mkY = py(mkV);
      noStroke(); fillHex('#FFE082', 0.30 * lDimK); ellipse(mkX, mkY, 14);
      fillHex('#FFE082', 0.98 * lDimK); ellipse(mkX, mkY, 7);
    }
  } else if (ir && ir.mode === 'charging') {
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
  } else if (ir && ir.mode === 'combo') {
    // combination_of_cells: SERIES chains one signed climb + one i.r toll STEP per
    // cell (cell index 1 -- "cell 2" -- is the only one that ever flips, via
    // ir.flipFrac 0..1 continuously inverting its climb into a descent, S4);
    // PARALLEL/SINGLE draws ONE climb + ONE toll step using i_through_cell.r
    // (naturally half-height at m=2 -- no special-casing needed, S6). A dock_cell
    // growth blend (S2) passes a NON-integer ir.cellCount; the still-growing
    // cell's climb+toll are scaled by its fractional weight so "the ladder grows
    // a second climb" is the segment literally growing in, not popping in whole.
    var rD5 = dimFor('r_internal');
    var nRaw = (ir.topology === 'series') ? max(1, ir.cellCount) : 1;
    var nFull = floor(nRaw + 1e-6), nFrac = nRaw - nFull;
    var nSeg = (nFrac > 0.002) ? (nFull + 1) : max(nFull, 1);
    var seg3 = gw / (2 * nSeg + 1), vx3 = gx, vNow3 = 0;
    var pts3 = [{ x: gx, y: py(0) }];
    var flipF = (ir.flipFrac !== undefined) ? ir.flipFrac : 0;
    var kk3;
    for (kk3 = 0; kk3 < nSeg; kk3++) {
      var weight3 = (kk3 < nFull) ? 1 : nFrac;
      var sign3 = (ir.topology === 'series' && kk3 === 1) ? (1 - 2 * flipF) : 1;
      vNow3 += ir.emf * sign3 * weight3;
      vx3 += seg3; pts3.push({ x: vx3, y: py(vNow3) });
      vNow3 -= (ir.stepPerCell || 0) * weight3;
      vx3 += seg3; pts3.push({ x: vx3, y: py(vNow3) });
    }
    pts3.push({ x: gx + gw, y: py(0) });                     // external R drop, closes the loop at 0V
    strokeHex('#4DD0E1', 0.98 * lDim); strokeWeight(2.5); noFill();
    beginShape(); for (var pk3 = 0; pk3 < pts3.length; pk3++) vertex(pts3[pk3].x, pts3[pk3].y); endShape();
    strokeHex('#66BB6A', 0.4 * dim); strokeWeight(1); line(gx, py(0), gx + gw, py(0));
    noStroke(); textStyle(BOLD); textSize(10); textAlign(LEFT, BOTTOM);
    fillHex('#4DD0E1', 0.95 * lDim);
    text('\\u03B5_eq = ' + ir.epsEq.toFixed(2) + ' V', gx + 4, py(max(ir.epsEq, vNow3, 0)) - 4);
    if (ir.i > 0.02 && (ir.stepPerCell || 0) > 0.005) {
      fillHex('#FF8A65', 0.9 * rD5); textAlign(LEFT, TOP);
      text('i\\u00B7r', gx + seg3 * 1.15, py(ir.epsEq) + 2);
    }
    fillHex('#B39DDB', 0.95 * dim); textAlign(RIGHT, BOTTOM);
    text('V = ' + ir.V.toFixed(2) + ' V', gx + gw * 0.85, py(vNow3) - 3);
    textStyle(NORMAL);
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
  if (kvl) {
    var nk2 = kvl.three ? 3 : 2, seg2 = gw / (2 * nk2 + 1);
    text('cell', gx + seg2 * 0.5, gy + 3);
    text('R\\u2081', gx + seg2 * 1.5, gy + 3);
    text('R\\u2082', gx + seg2 * 3.5, gy + 3);
    if (kvl.three) text('R\\u2083', gx + seg2 * 5.5, gy + 3);
  } else if (ir && ir.mode === 'charging') {
    text('charger', xa + gw * 0.18, gy + 3); text('R', xa + gw * 0.51, gy + 3); text('cell', xa + gw * 0.78, gy + 3);
  } else if (ir && ir.mode === 'combo') {
    text('cells', xa + gw * 0.065, gy + 3); text('load', (xc + xd) / 2, gy + 3);
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
  // gas_box parks the chip top-left: at the shared bottom-left position it
  // lands on the review chrome's "Powered by Viditra" watermark (Rule 34d).
  // Scoped to this family on purpose — moving it for everyone would shift
  // pixels on every shipped particle_field concept and invalidate their
  // approved H2 baselines for a cosmetic gain. The collision exists fleet-wide
  // and is filed separately rather than fixed by stealth here.
  var ly = gasMode() ? 8 : (height - 32);
  fillHex('#000000', 0.5);
  rect(8, ly, tw + 20, 24, 6);
  fillHex('#D4D4D8', 0.9);
  textAlign(LEFT, CENTER);
  text(labelText, 18, ly + 12);
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
        for (var k = 0; k < steps; k++) stepFor(st);
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
  } else if (t === 'SET_WIDGET_VIS') {
    // Teacher ⚙ overrides (full map every time — idempotent, replayable).
    // Re-applies ONLY the DOM display pass; canvas HUD gates read
    // pfWidgetVis on their next drawn frame. Never re-runs applyState —
    // that would reset the sim clock mid-state.
    pfWidgetVis = (e.data.overrides && typeof e.data.overrides === 'object') ? e.data.overrides : {};
    applyStateVisuals();
  } else if (t === 'WIDGET_PING') {
    // Chrome ⚙ hover: pulse the widget. DOM widgets pulse in place;
    // canvas-drawn HUDs have no element to pulse (silent no-op).
    var wk = e.data.widget || '', pingEl = null;
    if (wk === 'caption') pingEl = document.getElementById('pm-caption');
    else if (wk === 'formula') pingEl = document.getElementById('pm-formula');
    else if (wk === 'readout') pingEl = document.getElementById('pm-readout');
    else if (wk.indexOf('slider_') === 0) pingEl = sliderRows[wk.slice(7)] || null;
    if (pingEl && pingEl.style.display !== 'none') {
      pingEl.classList.add('wgPing');
      setTimeout(function() { pingEl.classList.remove('wgPing'); }, 1000);
    }
  } else if (t === 'SET_CLEAN_MODE') {
    // Same contract as field_3d: strip every fixed-position overlay to a
    // bare canvas (see the body.pm-clean CSS in the emitted <style>).
    document.body.classList.toggle('pm-clean', !!e.data.on);
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
    topology?: 'series' | 'parallel' | 'bridge' | 'wire'; // per-state circuit topology ('bridge' = wheatstone_bridge diamond; 'wire' = potentiometer; else the topology slider)
    r2_autosweep?: boolean;          // S6: R2 grows from default toward r2_autosweep_to
    r2_autosweep_to?: number;        // target R2 for the S6 sweep (default 12)
    show_branch_meters?: boolean;    // parallel: draw per-branch ammeters (i1, i2)
    in_line_meters?: boolean;        // series: draw 3 in-line ammeters (all read i)
    show_req_box?: boolean;          // draw the equivalent-resistance badge (S7)
    show_voltages?: boolean;         // S4: per-resistor voltage-drop labels (series → they add)
    switch_cycle?: boolean;          // S8: a branch switch auto-opens/closes on a loop
    // kirchhoff_junction_rule_KCL (Ch.3 — KCL; REUSES scenario_type 'combination_of_resistors')
    R1?: number;                     // per-state R1 lock in circuit mode (instantaneous snap on entry; teacher-seizable via the R1 slider)
    R2?: number;                     // per-state R2 lock in circuit mode (snap on entry; teacher-seizable)
    R3?: number;                     // third-branch resistance (only read when three_branch:true; snap; teacher-seizable)
    three_branch?: boolean;          // S4: add a THIRD parallel branch → 3-way split (R1 top / R2 spine / R3 bottom), Req = 1/(1/R1+1/R2+1/R3)
    branch_labels?: string[];        // symbolic labels for the branch ammeters, e.g. ["A₁","A₂","A₃"]; index 0=top,1=mid/bottom
    show_in_meter?: boolean;         // draw the A_in ammeter on the in-segment before the fork (reads the same itot as the main meter)
    in_meter_label?: string;         // label for A_in (default "A_in")
    main_meter_label?: string;       // relabel the main bottom ammeter (default "AMMETER"; KCL → "A_out")
    kcl_sum_readout?: boolean;       // on-canvas value HUD "i1 + i2 (+ i3) = itot A" + #pm-readout A_in=A_out (R_eq suppressed)
    ghost_text?: string;             // fixed authored string drawn struck-through (naive expectation, e.g. "1.0 + 1.0")
    ghost_pos?: { x: number; y: number };  // normalized 0..1 canvas position for the ghost (default 0.30, 0.80 — above the sum box at 0.30, 0.87)
    node_label?: string;             // label the junction node (e.g. "N"); drawn above the left junction dot, uses the junction glow key
    // kirchhoff_loop_rule_KVL (Ch.3 — KVL; REUSES scenario_type 'emf_definition', all flags opt-in → emf_definition/internal_resistance unaffected)
    kvl_multi_ladder?: boolean;      // MASTER gate: render the emf loop as a 2-3 SERIES-resistor KVL scene (multi-step ladder + KVL layout). Absent → emf_definition single-load path
    three_resistor?: boolean;        // include R3 in the loop (S5 authors true directly; S4 flips it in via r3_draw_in). False → R3 undrawn (S1-S3)
    r3_draw_in?: boolean;            // S4 cue: R3 draws in + joins the loop at ~900ms (state entry starts three_resistor:false; reveal ramps 900→1600ms)
    show_ladder?: boolean;           // draw the potential ladder (shared with emf/ir; KVL draws the multi-step profile when kvl_multi_ladder is set)
    trace_charge?: boolean;          // S1: a followed charge walks the loop AND the ladder in lockstep (loop-walk archetype)
    ladder_build_ms?: number[];      // S2 staged reveal: [riser_ms, step1_ms, step2_ms(, step3_ms)] — each ladder segment animates in at its ms (derivable at any pinned t)
    show_element_voltmeters?: boolean; // draw a drawVoltmeterC dial for the cell (ε) + each resistor (V1/V2[/V3]) in the loop interior
    kvl_sum_readout?: boolean;       // SIGNED loop-sum HUD "+6.0 − 4.0 − 2.0 (− 3.0) = 0.0" (distinct from KCL's UNSIGNED kcl_sum_readout)
    show_hl_tags?: boolean;          // fixed H (current-entry/higher) / L (exit/lower) sign tags at each resistor's ends (S3+)
    // (KVL also reuses: r2_autosweep + r2_autosweep_to for S3's R2 1→4 glide; R1/R2/R3 per-state locks; ghost_text/ghost_pos for S3's naive add-all ghost; emf lock/slider for ε)
    // wheatstone_bridge (Ch.3 — 'bridge' topology; REUSES scenario_type 'combination_of_resistors', every flag opt-in behind topology:'bridge' → siblings byte-identical)
    P?: number;                      // per-state arm lock: ratio arm P (A–B); snap on entry, teacher-seizable (R already declared above; Q/S below)
    Q?: number;                      // per-state arm lock: ratio arm Q (B–C)
    S?: number;                      // per-state arm lock: unknown arm S (D–C)
    node_dot_labels?: string[];      // labels for nodes [A, B, C, D]
    node_readout_labels?: string[];  // labels for the two midpoint readouts [V_B, V_D]
    galvanometer_label?: string;     // galvanometer dial label (default 'G')
    show_galvanometer?: boolean;     // draw the centre-zero galvanometer on the B–D chord (needle = clamp(k·(V_D−V_B)))
    show_node_readouts?: boolean;    // value-only chips: V_B / V_D at the midpoints
    show_ratio_hud?: boolean;        // value-only HUD: 'P/Q = … vs R/S = … ✓/✗' (tolerance compare, never strict ===)
    show_bridge_wire_beads?: boolean;// beads on the B–D chord, dir sign(V_B−V_D), density ∝ |V_D−V_B|, exactly 0 at balance
    show_ig_zero_label?: boolean;    // literal 'i_g = 0' — shown ONLY when live-balanced (|gap| < ratio_tolerance)
    show_s_readout?: boolean;        // value-only chip: S = R·(Q/P) (no emf term), separate from the formula surface
    bridge_r_sweep?: boolean;        // clock-driven R sweep (mirrors r2_autosweep): state R → bridge_r_sweep_to
    bridge_r_sweep_to?: number;      // target R for the sweep
    bridge_r_sweep_start_ms?: number;    // sweep window start (default 900)
    bridge_r_sweep_duration_ms?: number; // sweep window duration (default 800)
    bridge_emf_sweep?: boolean;      // clock-driven emf sweep (mirrors r2_autosweep): state emf → bridge_emf_sweep_to
    bridge_emf_sweep_to?: number;    // target emf for the sweep
    bridge_emf_sweep_start_ms?: number;    // sweep window start (default 900)
    bridge_emf_sweep_duration_ms?: number; // sweep window duration (default 1400)
    // potentiometer (Ch.3 — 'wire' topology; REUSES scenario_type 'combination_of_resistors', every flag opt-in behind topology:'wire' → all siblings byte-identical)
    E?: number;                      // per-state tested-cell EMF lock (snap on entry; teacher-seizable via the E slider)
    eps_d?: number;                  // per-state driver-cell EMF lock (sets the gradient k = eps_d/L; teacher-seizable)
    l?: number;                      // per-state jockey position lock in metres (snap on entry; teacher-seizable via the l slider)
    jockey_pos?: number;             // authored jockey fraction 0..1 (documentary; the live jockey tracks l/L, so this is not read by the renderer)
    jockey_sweep?: boolean;          // clock-driven l sweep (mirrors bridge_r_sweep): state l → jockey_sweep_to
    jockey_sweep_to?: number;        // target l for the sweep (metres)
    jockey_sweep_start_ms?: number;      // sweep window start (default 800)
    jockey_sweep_duration_ms?: number;   // sweep window duration (default 800)
    show_gradient_ramp?: boolean;    // draw the linear potential-gradient ramp above the wire + a 'k = … V/m' chip
    show_balance_readout?: boolean;  // value-only chips: 'l = … m', 'k·l = … V', 'E = … V'
    show_tap_branch_beads?: boolean; // beads on the tap branch, dir sign(k·l−E), density ∝ |k·l−E|, exactly 0 at balance
    show_izero_label?: boolean;      // literal 'i = 0' — shown ONLY when live-balanced (|k·l−E| < tol)
    show_voltmeter_compare?: boolean;// S4: a voltmeter across the tested cell (droops to V_meter = E − I·r) + a compare chip
    // meter_bridge (Ch.3 — 'meter_bridge' topology; REUSES scenario_type 'combination_of_resistors', every flag opt-in behind topology:'meter_bridge' → all siblings byte-identical). Reuses R/node_dot_labels/galvanometer_label/show_galvanometer/show_ig_zero_label/show_balance_readout/jockey_pos/jockey_sweep* declared above; new fields below.
    X?: number;                      // per-state unknown-arm lock (right gap); teacher-seizable via the X slider
    eps?: number;                    // per-state battery-EMF lock across A–C; irrelevant to the null (teacher-seizable)
    show_x_readout?: boolean;        // value-only chip: X = R·(100−l₁)/l₁ (live from the jockey; = X at balance), separate from the formula surface
    show_segment_ratio?: boolean;    // S2: tint the two wire segments A→J / J→C + a length-ratio chip (wire = resistance ruler)
    segment_sweep?: boolean;         // S2: a highlight sweeps A→C (resistance ∝ length reveal); pure fn of PM_simTimeMs
    segment_sweep_start_ms?: number; // S2 sweep window start (default 600)
    segment_sweep_duration_ms?: number; // S2 sweep window duration (default 1600)
    jockey_jitter?: boolean;         // S5: continuous ±delta_l_wobble_cm micro-jitter around the LIVE balance point (derived from current R,X)
    cycle_compare?: boolean;         // S5: two-phase R sweep (end-balance → mid-balance) so the sensitivity envelope contrasts
    cycle_compare_settle_ms?: number;    // S5 documentary: total cycle duration (renderer reads the phase windows below)
    cycle_phase2_start_ms?: number;      // S5: phase-2 R-sweep window start (default 2500)
    cycle_phase2_duration_ms?: number;   // S5: phase-2 R-sweep window duration (default 900)
    cycle_phase2_target_R?: number;      // S5: R value at the end of phase 2 (mid-wire balance)
    show_error_band?: boolean;       // S5: draw the sensitivity envelope (half-width ∝ dX at the null) + phase labels
    error_band_grid?: Array<{ phase?: number; R_label?: string; l1_label?: string; dX_label?: string; reveal_at_ms?: number }>; // S5 phase-label schedule
    // gas_box (2026-07-27 — scenario_type 'gas_box'; every field opt-in, so no
    // existing particle_field concept is affected)
    T?: number;                      // temperature (K) for this state; the T slider overrides
    N?: number;                      // particle count for this state; the N slider overrides
    piston_frac?: number;            // 0.2–1.0 of full box width; the V slider overrides. Eased in, and a closing wall really does work on the gas
    piston_from?: number;            // open the state at this fraction and drive to piston_frac, so the wall is SEEN to move (Rule 32a). Omit = start settled
    piston_ramp_ms?: number;         // drive the piston_from stroke over this many ms instead of the default ease. REQUIRED for an isothermal compression beat: the default stroke outruns thermal speed ~12x and spikes measured T past 8000 K
    T_from?: number;                 // open the state at this temperature and ramp to T, so the heating/cooling is SEEN (Rule 32a). Omit = open already at T
    T_ramp_ms?: number;              // duration of the T_from ramp (default 2000). Deterministic — THE EYE reproduces it
    T_cue?: string;                  // hold at T_from until this cue fires, then ramp FROM it. Omit = the ramp starts at state entry, which can finish before the sentence naming it plays
    piston_cue?: string;             // the same, for the piston_from/piston_ramp_ms stroke
    inject_cue?: string;             // cue id that adds/removes reagent MID-state, so the disturbance is seen to arrive (Rule 32a)
    inject_n?: number;               // signed particle delta for inject_cue: >0 pours in, <0 takes out (never breaks a bonded pair)
    inject_species?: string;         // species id for a positive inject_n — names it outright (the inert-gas beat), bypassing reaction.inject alternation
    show_k_ratio?: boolean;          // live equilibrium-constant chip — measured K = [AB]/([A][B]) as raw counts (Rule 33d). NOTE: wanders ~50% even on its 10 s window; narrate comparatively, never "watch this stay fixed"
    reaction_at_cue?: {              // change a reaction constant MID-state on a cue — the catalyst beat (Rule 32a)
        cue: string;                 // cue id from the state's `cues` list
        [key: string]: unknown;      // any reaction constant, e.g. activation_fwd_kT: 0.5. Ea_rev follows by derivation, so the "no shift" result stays emergent
    };
    barrier?: boolean;               // start with a divider: species 0 left, species 1 right (the diffusion pose)
    barrier_lift_cue?: string;       // cue id that removes the divider mid-state
    activation_energy_kT?: number;   // PREFERRED collision-theory threshold, in multiples of mean particle energy at ea_ref_T
    activation_energy?: number;      // raw px/tick threshold (pair KE along the line of centres); prefer the _kT form
    ea_at_cue?: {                    // drop the barrier MID-state on a cue — the catalyst beat (Rule 32a), mirrors reaction_at_cue
        cue: string;                 // cue id from the state's `cues` list
        activation_energy_kT: number;// the barrier from the cue onward. Pair it with reaction_at_cue on the SAME cue when the reaction layer is on, or the counter and the rate bars will disagree
        ramp_ms?: number;            // slide the barrier over this long instead of stepping it. Omit = an instant jump cut, which is one frame of motion for a state whose archetype is "the bar comes down"
    };
    reaction?: {                     // PER-STATE reaction overrides. `enabled` is the switch the config block has no per-state form of
        enabled?: boolean;           // false = the same apparatus with no bonding at all (collision theory counts collisions for five states before letting anything react)
        [key: string]: unknown;      // any reaction constant, overriding the config block for this state
    };
    show_pressure?: boolean;         // pressure gauge — live number + tracking bar (Rule 33d)
    show_gas_thermometer?: boolean;  // temperature gauge — live number + tracking bar
    show_speed_histogram?: boolean;  // live speed distribution + 2D theory curve + v_mp/v_avg/v_rms
    hist_species?: number;           // which species the histogram plots (default 0) — it plots ONE, never a mixture
    hist_speed_marks?: boolean;      // false hides the v_mp/v_avg/v_rms markers (Rule 25: untaught terms on a histogram shown for another reason). Default true — every existing baseline keeps its frames
    show_reaction_profile?: boolean; // the energy hill: reactants -> barrier -> products. Height IS gasActivationE() in kT and the product level IS the reaction's bond energy, so the catalyst beat and the Ea slider move it for real
    show_arrhenius_plot?: boolean;   // MEASURED ln(cleared fraction) vs 1/T, with a least-squares fit and its slope. Nothing evaluates the Arrhenius expression — every point is a real tally, so the points can miss the line
    arrhenius_window_ms?: number;    // sampling window per point (default 4000). Measured: 4 s gives R^2 0.95 with 8 points in 32 s; 8 s gives 0.99 but needs 64 s
    arrhenius_T_min?: number;        // axis span, solved ONCE at state entry so points move against a FIXED frame (default 250)
    arrhenius_T_max?: number;        // default 800
    show_collision_counter?: boolean;// collisions/s, and the fraction clearing Eₐ when one is set
    counter_window_ms?: number;      // averaging window for the counter (default 1000). The cleared-Eₐ rate is a RARE event — at ~6/s a 1 s window swung the displayed percentage 0.0%–8.2%. 5000 matches the reaction-rate window and the reasoning behind it
    show_gas_law?: boolean;          // P·A / N·T readout — constant on screen, the engine's own proof
    show_trails?: boolean;           // per-particle trails (the mean-free-path / random-walk story)
    adiabatic?: boolean;             // let piston work heat/cool the gas and show it (bicycle-pump story). Default false = isothermal, so compression is a pure Boyle beat
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
    // gas_box (2026-07-27) — the kinetic/collision/equilibrium substrate.
    // See the GAS BOX banner in the renderer body before authoring; in
    // particular the 2D-Maxwell-Boltzmann honesty note.
    gas?: {
        count?: number;                  // total particles (a state's N, or the N slider, overrides)
        species?: Array<{ id: string; mass: number; radius: number; color: string; label?: string; count?: number }>;
        box?: { pad?: number };
        layout?: 'full' | 'with_graph';  // 'with_graph' reserves the right pane for the speed histogram
        temperature_K?: number;
        speed_scale?: number;            // px/tick per component at T=1, m=1 (visual pacing)
        activation_energy_kT?: number;   // PREFERRED: Eₐ as a multiple of the mean particle energy at ea_ref_T (~2–4 = a real barrier)
        ea_ref_T?: number;               // reference T for activation_energy_kT (default: temperature_K). Fixed on purpose — Eₐ must NOT track live T
        activation_energy?: number;      // raw px/tick energy escape hatch; prefer the _kT form
        pressure_full_scale?: number;    // gauge bar full-scale (display only)
        temperature_full_scale?: number; // thermometer full-scale in K (display only)
        hist_ref_T?: number;             // pins the histogram's speed axis so the curve MOVES against it
    };
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
/* Clean mode (SET_CLEAN_MODE): every DOM overlay here is a dynamically-created
   inline position:fixed panel — same convention as field_3d, same selector. */
body.pm-clean [style*="position:fixed"],
body.pm-clean [style*="position: fixed"] { display: none !important; }
/* ⚙ per-widget teacher toggles (SET_WIDGET_VIS) + hover-ping (WIDGET_PING) —
   same contract as field_3d_renderer. DOM widgets are pinned with !important
   classes; canvas-drawn HUDs are gated at their draw call via pfWgVis(). */
.pmWgHide { display: none !important; }
.pmWgShow { display: var(--pm-wg-disp, block) !important; }
.pmWgShow:empty { display: none !important; }
.wgPing { animation: wgPingA 0.45s ease-in-out 2; }
@keyframes wgPingA {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 0 3px rgba(255, 202, 40, 0.95); }
}
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
