// =============================================================================
// particle_field_renderer.js  —  PhysicsMind particle-field renderer
// Engineer-written, NOT AI-generated. Loaded by particle_field.html.
//
// postMessage protocol
//   PARENT → IFRAME  { type: "INIT_CONFIG", config: SimulationConfig }
//                    { type: "SET_STATE",   state: "STATE_N" }
//                    { type: "PING" }
//   IFRAME → PARENT  { type: "SIM_READY" }
//                    { type: "STATE_REACHED", state: "STATE_N" }
//                    { type: "PONG" }
// =============================================================================

// ─── 1. CONFIG ───────────────────────────────────────────────────────────────
let config = null;
let currentState = "STATE_1";

// ─── 2. CONSTANTS (PVL) ──────────────────────────────────────────────────────
const PVL = {
  electron:     "#42A5F5",
  positive_ion: "#90A4AE",
  field_arrow:  "#FF9800",
  spotlight:    "#FFFFFF",
  drift:        "#66BB6A",
  background:   "#0A0A1A",
  labels:       "#D4D4D8",
};

// ─── 3. PARTICLE SYSTEM ──────────────────────────────────────────────────────
let electrons = [];
let ions = [];

// ─── 4. ANIMATION STATE ──────────────────────────────────────────────────────
let fieldActive      = false;
let fieldPulseTimer  = 0;         // accumulates in seconds, drives sin() pulse
let spotlightIndex   = 0;
let borderFlashTimer = 0;         // frames remaining for the border flash
let driftMultiplier  = 1.0;       // scaled by STATE_4 slider (1–4)

// Canvas dimensions — resolved once in setup, used throughout
let CW = 800;
let CH = 500;

// Drift velocity components in px/frame (set in applyState)
let driftX = 0;
let driftY = 0;

// Per-state trail config
let maxTrailLength = 5;

// ─── 5. p5 SKETCH ────────────────────────────────────────────────────────────
const sketch = (p) => {

  // ── setup ──────────────────────────────────────────────────────────────────
  p.setup = () => {
    CW = config?.design?.canvas_width  ?? 800;
    CH = config?.design?.canvas_height ?? 500;
    const cnv = p.createCanvas(CW, CH);
    cnv.parent(document.body);
    p.frameRate(60);
    initElectrons(p);
    initIons(p);
    initLegendDiv();
    sendToParent("SIM_READY");
  };

  // ── draw loop (60 fps) ─────────────────────────────────────────────────────
  p.draw = () => {
    // Merge any pvl_colors overrides from config
    const colors = Object.assign({}, PVL, config?.pvl_colors ?? {});

    // Background clear
    p.background(config?.design?.background ?? colors.background);

    // Advance fieldPulseTimer (used to drive arrow opacity sine wave)
    fieldPulseTimer += 1 / 60;

    // Border flash countdown
    if (borderFlashTimer > 0) {
      borderFlashTimer--;
    }

    // Static lattice ions (drawn first so electrons appear above)
    drawIons(p, colors);

    // Electrons (thermal + drift)
    drawElectrons(p, colors);

    // Electric field arrows (only when field is active)
    if (fieldActive) {
      drawFieldArrows(p, colors);
    }

    // STATE_4 live slider display
    if (currentState === "STATE_4") {
      updateSliderDisplay();
    }
  };
};

new p5(sketch);

// ─── 6. STATE MACHINE ────────────────────────────────────────────────────────
/**
 * Transition to a named simulation state.
 * Enforces the 4-state lesson arc:
 *   STATE_1 — no field, thermal only, all electrons visible
 *   STATE_2 — field on, all electrons drift, full opacity
 *   STATE_3 — spotlight one electron, dim all others
 *   STATE_4 — interactive, slider controls drift multiplier
 */
function applyState(stateName) {
  if (!config) return;
  const stateCfg = config.states?.[stateName];
  if (!stateCfg) {
    console.warn("[ParticleRenderer] Unknown state:", stateName);
    return;
  }

  currentState = stateName;

  // ── Border flash ────────────────────────────────────────────────────────
  const flashEl = document.getElementById("border-flash");
  if (flashEl) {
    flashEl.classList.add("active");
    setTimeout(() => flashEl.classList.remove("active"), 80);
  }
  borderFlashTimer = 5; // 5 frames ≈ 80 ms at 60 fps

  // ── Slider container ─────────────────────────────────────────────────────
  const sliderContainer = document.getElementById("slider-container");

  // ── Per-state setup ──────────────────────────────────────────────────────
  if (stateName === "STATE_1") {
    // No field — electrons wander randomly, no drift.
    fieldActive    = false;
    driftX         = 0;
    driftY         = 0;
    driftMultiplier = 1.0;
    maxTrailLength  = 5;
    // All electrons: full opacity, normal size
    electrons.forEach(e => { e.opacity = 255; e.size = config?.particles?.size ?? 6; });
    if (sliderContainer) sliderContainer.classList.remove("active");

  } else if (stateName === "STATE_2") {
    // Field on — all electrons drift together.
    fieldActive       = true;
    fieldPulseTimer   = 0; // restart pulse
    const speed       = stateCfg.drift_speed ?? 0.8;
    resolveDrift(speed);
    driftMultiplier   = 1.0;
    maxTrailLength    = 12;
    electrons.forEach(e => { e.opacity = 255; e.size = config?.particles?.size ?? 6; });
    if (sliderContainer) sliderContainer.classList.remove("active");

  } else if (stateName === "STATE_3") {
    // Spotlight: one electron glowing white, all others dim.
    fieldActive     = true;
    const speed     = stateCfg.drift_speed ?? (config.states.STATE_2?.drift_speed ?? 0.8);
    resolveDrift(speed);
    driftMultiplier = 1.0;
    spotlightIndex  = stateCfg.highlight_index ?? 0;
    maxTrailLength  = 80; // long glowing trail for the spotlight electron
    electrons.forEach((e, i) => {
      if (i === spotlightIndex) {
        e.opacity = 255;
        e.size    = 14;
      } else {
        e.opacity = 30;   // ~12 % of 255
        e.size    = 6;
      }
    });
    if (sliderContainer) sliderContainer.classList.remove("active");

  } else if (stateName === "STATE_4") {
    // Interactive: slider drives driftMultiplier.
    fieldActive       = true;
    const speed       = stateCfg.drift_speed ?? (config.states.STATE_2?.drift_speed ?? 0.8);
    resolveDrift(speed);
    // driftMultiplier already set by slider or reset to 1.0
    maxTrailLength    = 12;
    electrons.forEach(e => { e.opacity = 255; e.size = config?.particles?.size ?? 6; });
    if (sliderContainer) sliderContainer.classList.add("active");
  }

  // ── Formula anchor highlights ────────────────────────────────────────────
  updateFormulaAnchor(stateName);

  // ── Acknowledge state to parent ──────────────────────────────────────────
  sendToParent("STATE_REACHED", { state: stateName });

  console.log("[ParticleRenderer] State applied:", stateName);
}

// ─── 7. POSTMESSAGE BRIDGE ───────────────────────────────────────────────────
let _pendingState = null; // queued state received before config was ready

window.addEventListener("message", (event) => {
  const msg = event.data ?? {};

  if (msg.type === "INIT_CONFIG") {
    config = msg.config;
    // Merge pvl_colors overrides
    if (config?.pvl_colors) Object.assign(PVL, config.pvl_colors);
    // Re-initialise particle arrays with new config values
    // (p5 sketch may not have run setup yet — guard with a try/catch)
    try { initElectrons(); } catch (_) { /* setup hasn't run yet — setup() will call it */ }
    try { initIons(); }      catch (_) { /* same */ }
    console.log("[ParticleRenderer] Config received:", config?.renderer);
    // Flush any queued state
    if (_pendingState) {
      applyState(_pendingState);
      _pendingState = null;
    } else {
      applyState("STATE_1");
    }
    return;
  }

  if (msg.type === "SET_STATE") {
    if (!config) {
      _pendingState = msg.state;
      console.warn("[ParticleRenderer] Config not ready, queued:", msg.state);
      return;
    }
    applyState(msg.state);
    return;
  }

  if (msg.type === "PING") {
    sendToParent("PONG");
    return;
  }
});

/**
 * Send a typed message to the parent frame.
 * @param {string} type    Message type string
 * @param {object} payload Additional key/value pairs
 */
function sendToParent(type, payload = {}) {
  window.parent.postMessage({ type, ...payload }, "*");
}

// ─── 8. HELPERS ──────────────────────────────────────────────────────────────

/**
 * Populate the electrons array with random starting positions and velocities.
 * Safe to call with or without a p5 instance available.
 */
function initElectrons() {
  electrons = [];
  const count        = config?.particles?.count        ?? 40;
  const thermalSpeed = config?.particles?.thermal_speed ?? 3.0;
  const size         = config?.particles?.size          ?? 6;

  for (let i = 0; i < count; i++) {
    electrons.push({
      x:       Math.random() * CW,
      y:       Math.random() * CH,
      vx:      (Math.random() * 2 - 1) * thermalSpeed,
      vy:      (Math.random() * 2 - 1) * thermalSpeed,
      trail:   [],        // array of { x, y } — capped at maxTrailLength
      opacity: 255,
      size:    size,
    });
  }
}

/**
 * Populate the ions array in a regular grid.
 * If config.lattice is absent, leaves ions as an empty array (no lattice drawn).
 */
function initIons() {
  ions = [];
  if (!config?.lattice) return;
  const { rows, cols } = config.lattice;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ions.push({
        x: (c + 1) * CW / (cols + 1),
        y: (r + 1) * CH / (rows + 1),
      });
    }
  }
}

/**
 * Decompose the config drift_direction into per-frame (driftX, driftY) offsets.
 * Called whenever a state that has drift becomes active.
 * @param {number} speed  px/frame drift magnitude
 */
function resolveDrift(speed) {
  const dir = config?.electron_drift_direction ?? "left";
  driftX = dir === "right" ? speed : dir === "left" ? -speed : 0;
  driftY = dir === "down"  ? speed : dir === "up"   ? -speed : 0;
}

/**
 * Draw all lattice ions as static circles.
 * @param {object} p      p5 instance
 * @param {object} colors Resolved PVL palette
 */
function drawIons(p, colors) {
  if (!config?.lattice) return;
  const ionColor = config.lattice.ion_color ?? colors.positive_ion;
  const ionSize  = config.lattice.ion_size  ?? 8;
  p.noStroke();
  p.fill(ionColor);
  for (const ion of ions) {
    p.ellipse(ion.x, ion.y, ionSize, ionSize);
  }
}

/**
 * Update and draw every electron.
 * Thermal motion continues in ALL states.
 * Drift is an additional slow offset when fieldActive.
 * @param {object} p      p5 instance
 * @param {object} colors Resolved PVL palette
 */
function drawElectrons(p, colors) {
  const isSpotlight = (currentState === "STATE_3");
  const thermalSpeed = config?.particles?.thermal_speed ?? 3.0;

  for (let i = 0; i < electrons.length; i++) {
    const e = electrons[i];

    // ── Thermal kick — re-randomise each frame for true random-walk feel ──
    e.vx = (Math.random() * 2 - 1) * thermalSpeed;
    e.vy = (Math.random() * 2 - 1) * thermalSpeed;

    // ── Save position to trail before moving ──
    e.trail.unshift({ x: e.x, y: e.y });
    const trailCap = isSpotlight && i === spotlightIndex ? 80 : maxTrailLength;
    if (e.trail.length > trailCap) e.trail.length = trailCap;

    // ── Move: thermal + drift (drift scaled by multiplier when active) ──
    e.x += e.vx + (fieldActive ? driftX * driftMultiplier : 0);
    e.y += e.vy + (fieldActive ? driftY * driftMultiplier : 0);

    // ── Wrap at canvas edges (toroidal — canvas never empties) ──
    e.x = ((e.x % CW) + CW) % CW;
    e.y = ((e.y % CH) + CH) % CH;

    // ── Resolve colour and size for this electron ──
    const isLit = isSpotlight && i === spotlightIndex;
    const col   = isLit ? colors.spotlight : colors.electron;
    const sz    = e.size;          // already set by applyState
    const alpha = e.opacity;       // already set by applyState

    // ── Draw trail ──
    if (e.trail.length > 1) {
      const trailLen        = e.trail.length;
      const trailBaseAlpha  = isLit ? 180 : Math.min(alpha, 80);
      for (let t = 0; t < trailLen - 1; t++) {
        const a = trailBaseAlpha * (1 - t / trailLen);
        if (a < 2) break;
        const tc = p.color(col);
        p.stroke(p.red(tc), p.green(tc), p.blue(tc), a);
        p.strokeWeight(isLit ? 2.5 : 1.2);
        p.line(e.trail[t].x, e.trail[t].y, e.trail[t + 1].x, e.trail[t + 1].y);
      }
      p.noStroke();
    }

    // ── Glow halo for spotlight electron ──
    if (isLit) {
      p.noStroke();
      p.fill(255, 255, 255, 35);
      p.ellipse(e.x, e.y, sz * 3.0, sz * 3.0);
      p.fill(255, 255, 255, 18);
      p.ellipse(e.x, e.y, sz * 5.0, sz * 5.0);
    }

    // ── Draw electron body ──
    p.noStroke();
    const ec = p.color(col);
    p.fill(p.red(ec), p.green(ec), p.blue(ec), alpha);
    p.ellipse(e.x, e.y, sz, sz);
  }
}

/**
 * Draw evenly-spaced electric field arrows across the canvas.
 * Direction: config.field_arrow_direction.
 * Opacity: oscillates between 60 % and 100 % via sin() — never fully off.
 * @param {object} p      p5 instance
 * @param {object} colors Resolved PVL palette
 */
function drawFieldArrows(p, colors) {
  const dir       = config?.field_arrow_direction ?? "right";
  const arrowColor = colors.field_arrow;
  // sin() maps to [-1, 1] → we want [0.6, 1.0] opacity
  const opacityFraction = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(fieldPulseTimer * Math.PI * 2));
  const alpha = Math.round(opacityFraction * 255);

  const ac = p.color(arrowColor);
  p.stroke(p.red(ac), p.green(ac), p.blue(ac), alpha);
  p.strokeWeight(2.2);
  p.fill(p.red(ac), p.green(ac), p.blue(ac), alpha);

  const arrowLen  = 34;
  const tipSize   = 8;        // arrowhead arm length
  const isHoriz   = dir === "left" || dir === "right";
  const sign      = (dir === "right" || dir === "down") ? 1 : -1;

  if (isHoriz) {
    // 5 arrows evenly spaced vertically
    const rows  = 5;
    const yStep = CH / (rows + 1);
    const xMid  = CW / 2;
    const half  = arrowLen / 2;
    for (let r = 1; r <= rows; r++) {
      const y  = yStep * r;
      const x1 = xMid - sign * half;
      const x2 = xMid + sign * half;
      // Shaft
      p.line(x1, y, x2, y);
      // Arrowhead triangle (filled)
      p.noStroke();
      p.triangle(
        x2,                    y,
        x2 - sign * tipSize,   y - tipSize * 0.55,
        x2 - sign * tipSize,   y + tipSize * 0.55,
      );
      // Restore stroke for next arrow shaft
      p.stroke(p.red(ac), p.green(ac), p.blue(ac), alpha);
    }
  } else {
    // up / down — 5 arrows evenly spaced horizontally
    const cols  = 5;
    const xStep = CW / (cols + 1);
    const yMid  = CH / 2;
    const half  = arrowLen / 2;
    for (let c = 1; c <= cols; c++) {
      const x  = xStep * c;
      const y1 = yMid - sign * half;
      const y2 = yMid + sign * half;
      p.line(x, y1, x, y2);
      p.noStroke();
      p.triangle(
        x,                    y2,
        x - tipSize * 0.55,   y2 - sign * tipSize,
        x + tipSize * 0.55,   y2 - sign * tipSize,
      );
      p.stroke(p.red(ac), p.green(ac), p.blue(ac), alpha);
    }
  }
  p.noStroke();
}

/**
 * Rebuild the #formula-anchor overlay HTML for the current state.
 * Highlights active variables in their config colour; dims inactive ones.
 * Hides the div entirely when no formula_anchor is configured.
 * @param {string} stateName  e.g. "STATE_2"
 */
function updateFormulaAnchor(stateName) {
  const el = document.getElementById("formula-anchor");
  if (!el) return;

  const fa = config?.formula_anchor;
  if (!fa) {
    el.style.display = "none";
    return;
  }

  const activeVars = fa.state_highlights?.[stateName] ?? [];
  const varDefs    = fa.variables ?? {};
  let   formula    = fa.formula_string ?? "";

  // Build the highlighted HTML formula.
  // Replace each known variable token with a coloured span.
  // Tokens NOT in activeVars get a dim grey colour.
  // Process longer tokens first to avoid partial-match conflicts.
  const allTokens = Object.keys(varDefs).sort((a, b) => b.length - a.length);
  for (const token of allTokens) {
    const def     = varDefs[token];
    const isActive = activeVars.includes(token);
    const color   = isActive ? (def?.color ?? PVL.labels) : "#555555";
    const weight  = isActive ? "bold" : "normal";
    // Escape the token for use in a regex
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    formula = formula.replace(
      new RegExp(escaped, "g"),
      `<span style="color:${color};font-weight:${weight};display:inline-block;max-width:120px;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom">${token}</span>`,
    );
  }

  // If formula contains more than 3 variable spans, split into two rows
  // by inserting a line-break after the 3rd closing </span>.
  const spanMatches = formula.match(/<\/span>/g);
  if (spanMatches && spanMatches.length > 3) {
    let count = 0;
    formula = formula.replace(/<\/span>/g, (match) => {
      count++;
      if (count === 3) {
        return `</span><br style="display:block;line-height:4px">`;
      }
      return match;
    });
  }

  el.style.whiteSpace  = "normal";   // allow the <br> to wrap
  el.style.overflow    = "hidden";
  el.innerHTML     = formula;
  el.style.display = "block";
}

/**
 * Update the #vd-display readout in STATE_4.
 * If config.formula_anchor.live_calculation exists, evaluates the formula
 * using the current slider value. Otherwise shows a simple mm/s estimate.
 */
function updateSliderDisplay() {
  const slider   = document.getElementById("field-slider");
  const vdEl    = document.getElementById("vd-display");
  if (!slider || !vdEl) return;

  const rawValue = parseFloat(slider.value); // 1–20

  const lc = config?.formula_anchor?.live_calculation;
  if (lc?.formula) {
    // Safe evaluation: build a context with slider-accessible variables.
    try {
      // Expose fieldStrength as the slider value (normalised 0.2–4.0)
      const E   = rawValue * 0.2;
      const tau = 2.5e-14;          // typical relaxation time (s)
      const e   = 1.6e-19;
      const m   = 9.1e-31;
      // eslint-disable-next-line no-new-func
      const result = new Function("E", "tau", "e", "m",
        `return (${lc.formula});`
      )(E, tau, e, m);
      vdEl.textContent = `vd = ${Number(result).toExponential(2)} ${lc.display_unit ?? "m/s"}`;
    } catch (_) {
      const estimate = (rawValue * 0.08).toFixed(2);
      vdEl.textContent = `vd = ${estimate} mm/s`;
    }
  } else {
    const estimate = (rawValue * 0.08).toFixed(2);
    vdEl.textContent = `vd = ${estimate} mm/s`;
  }
}

// ─── 9. LEGEND (Rule 2) ──────────────────────────────────────────────────────
/**
 * Insert the symbol legend as an HTML div BELOW the p5 canvas.
 * Called once after p5 setup() creates the canvas. No-op if config.legend absent.
 * Never overlaps the simulation visual.
 */
function initLegendDiv() {
  var legend = config && config.legend;
  if (!legend || legend.length === 0) return;

  var div = document.createElement('div');
  div.style.cssText = [
    'display:grid',
    'grid-template-columns:auto 1fr',
    'column-gap:8px',
    'row-gap:3px',
    'background:rgba(0,0,0,0.6)',
    'padding:6px 10px',
    'margin-top:4px',
    'font-size:10px',
    'font-family:sans-serif',
    'line-height:1.5',
    'border-radius:3px',
    'width:fit-content',
    'overflow-y:auto',
    'max-height:120px',
  ].join(';');

  legend.forEach(function (entry) {
    var sym = document.createElement('span');
    sym.textContent = entry.symbol;
    sym.style.cssText = 'color:#60A5FA;font-weight:bold;white-space:nowrap';

    var meaning = document.createElement('span');
    meaning.textContent = '\u2014 ' + entry.meaning;
    meaning.style.cssText = 'color:#D4D4D8;white-space:nowrap';

    div.appendChild(sym);
    div.appendChild(meaning);
  });

  // p5 appends the canvas to document.body — insert the div right after it
  var cnv = document.querySelector('canvas');
  if (cnv && cnv.parentNode) {
    cnv.parentNode.style.paddingBottom = '8px';
    cnv.parentNode.insertBefore(div, cnv.nextSibling);
  } else {
    document.body.appendChild(div);
  }
}

// ─── 10. SLIDER WIRING ───────────────────────────────────────────────────────
// The field-strength slider in STATE_4 scales driftMultiplier (1–4×).
const fieldSlider = document.getElementById("field-slider");
if (fieldSlider) {
  fieldSlider.addEventListener("input", () => {
    const raw      = parseFloat(fieldSlider.value); // range: 1–20
    driftMultiplier = lerp(1.0, 4.0, (raw - 1) / 19); // map [1,20] → [1,4]
    updateSliderDisplay();
  });
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
/**
 * Linear interpolation clamped to [0, 1].
 * @param {number} a  Start
 * @param {number} b  End
 * @param {number} t  Factor [0, 1]
 */
function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
