// =============================================================================
// particle_field_renderer.ts
// Pre-built p5.js renderer code exported as a string constant.
// This code is engineer-written, NOT AI-generated.
// It reads window.SIM_CONFIG and renders particles, lattice, field arrows.
// postMessage bridge: receives SET_STATE → applyState() → fires STATE_REACHED
//
// Supports animation_constraints from physics_constants:
//   collision_glow: true        → yellow starburst when electron hits ion
//   glow_scales_as_i_squared    → glow intensity = drift_speed²
//   show_power_meter: true      → live P=I²R readout below canvas
//   show_heat_counter: true     → live H=I²Rt accumulator
// =============================================================================

export const PARTICLE_FIELD_RENDERER_CODE = `
// ─── Globals ────────────────────────────────────────────────────────────────
var config;
var particles = [];
var latticeIons = [];
var fieldArrows = [];
var collisionFlashes = []; // { x, y, alpha, radius } — active starburst effects
var PM_currentState = 'STATE_1';
var COLLISION_INTERVAL = 10; // frames between random direction changes
var heatAccumulator = 0;    // H = I²Rt running total (arbitrary units for display)
var simTimeSeconds = 0;     // simulation time elapsed while field is active

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

// ─── Feature flags (read from config.animation_constraints) ─────────────────
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

// ─── Setup ──────────────────────────────────────────────────────────────────
function setup() {
  config = window.SIM_CONFIG;
  if (!config) { console.error('[Renderer] No SIM_CONFIG found'); return; }

  var canvasW = (config.canvas && config.canvas.width) ? config.canvas.width : (config.design && config.design.canvas_width) ? config.design.canvas_width : 800;
  var canvasH = (config.canvas && config.canvas.height) ? config.canvas.height : (config.design && config.design.canvas_height) ? config.design.canvas_height : 400;
  createCanvas(canvasW, canvasH);
  frameRate(60);

  // ── Create electrons ────────────────────────────────────────────────────
  for (var i = 0; i < config.particles.count; i++) {
    var angle = random(TWO_PI);
    particles.push({
      x: random(20, width - 20),
      y: random(20, height - 20),
      vx: cos(angle) * config.particles.thermal_speed,
      vy: sin(angle) * config.particles.thermal_speed,
      trail: [],
      collisionTimer: floor(random(COLLISION_INTERVAL)) // offset so they don't all change at once
    });
  }

  // ── Create lattice ions (grid with slight jitter) ───────────────────────
  var cols = ceil(sqrt(config.lattice.count * width / height));
  var rows = ceil(config.lattice.count / cols);
  var spacingX = width / (cols + 1);
  var spacingY = height / (rows + 1);
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      if (latticeIons.length >= config.lattice.count) break;
      latticeIons.push({
        x: spacingX * (c + 1) + random(-4, 4),
        y: spacingY * (r + 1) + random(-4, 4),
        vibration: 0 // current vibration amplitude (for heat visualization)
      });
    }
  }

  // ── Create field arrow positions ────────────────────────────────────────
  for (var i = 0; i < config.field_arrows.count; i++) {
    fieldArrows.push({
      x: (i + 0.5) * (width / config.field_arrows.count),
      y: height * 0.5 + random(-20, 20)
    });
  }

  // Signal ready to parent
  parent.postMessage({ type: 'SIM_READY' }, '*');
}

// ─── Compute current intensity factor ───────────────────────────────────────
// Returns a 0–1 value representing how intense the current is right now.
// Used to scale collision glow, heat colour, power meter.
function getCurrentIntensity(state) {
  if (!state || !state.drift_speed || state.drift_speed <= 0) return 0;
  var speed = state.drift_speed;
  // Normalize: typical drift_speed range is 0–2 px/frame
  var normalized = constrain(speed / 1.5, 0, 1);
  if (hasGlowScaling()) {
    // Quadratic scaling: I² relationship
    return normalized * normalized;
  }
  return normalized;
}

// ─── Draw loop ──────────────────────────────────────────────────────────────
function draw() {
  if (!config) return;

  var state = config.states[PM_currentState];
  if (!state) return;

  var intensity = getCurrentIntensity(state);

  // ── Background with heat colour tint ──────────────────────────────────
  var bgColor = (config.canvas && config.canvas.bg_color) ? config.canvas.bg_color
    : (config.design && config.design.background) ? config.design.background
    : (config.pvl_colors && config.pvl_colors.background) ? config.pvl_colors.background
    : '#0A0A1A';
  background(bgColor);

  // Resistor heat overlay: tints the canvas from transparent → orange → white
  if (intensity > 0) {
    noStroke();
    // Deep orange-red at low intensity, shifting toward bright orange-white at high
    var heatR = floor(lerp(60, 255, intensity));
    var heatG = floor(lerp(20, 140, intensity));
    var heatB = floor(lerp(0, 40, intensity));
    var heatAlpha = lerp(0, 0.12, intensity);
    fill(heatR, heatG, heatB, heatAlpha * 255);
    rect(0, 0, width, height);
  }

  // Accumulate heat when field is active
  if (intensity > 0) {
    simTimeSeconds += 1.0 / 60.0;
    // H = I²Rt — intensity already = I² (when glow_scales_as_i_squared is on)
    var R = 10; // nominal resistance for display
    heatAccumulator += intensity * R * (1.0 / 60.0);
  }

  // 1. Draw lattice ions (background layer)
  drawLattice(intensity);

  // 2. Draw field arrows (mid layer)
  if (state.field_visible) {
    drawFieldArrows();
  }

  // 3. Draw collision flashes (between lattice and particles)
  if (hasCollisionGlow()) {
    drawCollisionFlashes();
  }

  // 4. Update and draw particles (foreground layer)
  updateAndDrawParticles(state, intensity);

  // 5. Draw power meter (UI layer)
  if (hasPowerMeter() && intensity > 0) {
    drawPowerMeter(state, intensity);
  }

  // 6. Draw heat counter (UI layer)
  if (hasHeatCounter() && heatAccumulator > 0) {
    drawHeatCounter();
  }

  // 7. Draw state label (UI layer)
  drawLabel(state);
}

// ─── Lattice rendering ──────────────────────────────────────────────────────
function drawLattice(intensity) {
  noStroke();
  for (var i = 0; i < latticeIons.length; i++) {
    var ion = latticeIons[i];

    // Vibration: ions jitter more as intensity increases (heat = lattice vibration)
    var vibAmp = intensity * 2.5; // max 2.5px displacement at full intensity
    var vibX = ion.x + (vibAmp > 0 ? random(-vibAmp, vibAmp) : 0);
    var vibY = ion.y + (vibAmp > 0 ? random(-vibAmp, vibAmp) : 0);

    // Glow effect — intensity-scaled
    if (config.lattice.glow || intensity > 0.1) {
      var glowStrength = max(intensity, config.lattice.glow ? 0.3 : 0);
      // Outer glow: warm orange when heated
      if (intensity > 0.1) {
        fill(255, 140, 0, glowStrength * 0.08 * 255);
        ellipse(vibX, vibY, config.lattice.size * 4.0);
      }
      fillHex(config.lattice.color, 0.06 * (1 + glowStrength));
      ellipse(vibX, vibY, config.lattice.size * 3.5);
      fillHex(config.lattice.color, 0.12 * (1 + glowStrength));
      ellipse(vibX, vibY, config.lattice.size * 2.2);
    }

    // Ion body — colour shifts toward orange-white as intensity rises
    if (intensity > 0.3) {
      var ionR = floor(lerp(144, 255, intensity));
      var ionG = floor(lerp(164, 180, intensity));
      var ionB = floor(lerp(174, 100, intensity));
      fill(ionR, ionG, ionB, 0.6 * 255);
    } else {
      fillHex(config.lattice.color, 0.5);
    }
    ellipse(vibX, vibY, config.lattice.size);

    // + symbol
    strokeHex(config.lattice.color, 0.7);
    strokeWeight(1);
    var s = config.lattice.size * 0.25;
    line(vibX - s, vibY, vibX + s, vibY);
    line(vibX, vibY - s, vibX, vibY + s);
    noStroke();
  }
}

// ─── Collision flash system ─────────────────────────────────────────────────
function spawnCollisionFlash(x, y, intensity) {
  collisionFlashes.push({
    x: x,
    y: y,
    alpha: 0.6 + intensity * 0.4, // brighter at higher current
    radius: 8 + intensity * 16,    // larger starburst at higher current
    age: 0
  });
}

function drawCollisionFlashes() {
  noStroke();
  for (var i = collisionFlashes.length - 1; i >= 0; i--) {
    var f = collisionFlashes[i];
    f.age++;
    var fadeProgress = f.age / 20; // fade over 20 frames (~333ms)
    if (fadeProgress >= 1) {
      collisionFlashes.splice(i, 1);
      continue;
    }
    var currentAlpha = f.alpha * (1 - fadeProgress);
    var currentRadius = f.radius * (0.5 + fadeProgress * 0.5);

    // Outer yellow-orange glow
    fill(255, 200, 0, currentAlpha * 0.15 * 255);
    ellipse(f.x, f.y, currentRadius * 3);

    // Mid warm glow
    fill(255, 165, 0, currentAlpha * 0.35 * 255);
    ellipse(f.x, f.y, currentRadius * 1.8);

    // Inner white-yellow core
    fill(255, 255, 200, currentAlpha * 0.7 * 255);
    ellipse(f.x, f.y, currentRadius * 0.6);

    // Starburst rays (4 rays at 45° offsets)
    strokeWeight(1.5);
    stroke(255, 220, 50, currentAlpha * 0.5 * 255);
    var rayLen = currentRadius * 1.2;
    for (var r = 0; r < 4; r++) {
      var angle = r * PI / 4 + PI / 8; // offset so rays don't align with axes
      line(f.x, f.y,
           f.x + cos(angle) * rayLen,
           f.y + sin(angle) * rayLen);
    }
    noStroke();
  }
}

// ─── Field arrows rendering ─────────────────────────────────────────────────
function drawFieldArrows() {
  var pulse = sin(frameCount * 0.06) * 0.25 + 0.65; // ~1Hz pulse
  var dir = config.field_arrows.direction === 'left_to_right' ? 1 : -1;
  var arrowLen = 50;
  var headSize = 9;

  strokeHex(config.field_arrows.color, 0.6 * pulse);
  strokeWeight(2.5);
  noFill();

  for (var i = 0; i < fieldArrows.length; i++) {
    var a = fieldArrows[i];
    var sx = a.x - dir * arrowLen * 0.5;
    var ex = a.x + dir * arrowLen * 0.5;
    line(sx, a.y, ex, a.y);
    // Arrowhead
    line(ex, a.y, ex - dir * headSize, a.y - headSize * 0.5);
    line(ex, a.y, ex - dir * headSize, a.y + headSize * 0.5);
  }

  // E label
  noStroke();
  fillHex(config.field_arrows.color, 0.5 * pulse);
  textSize(13);
  textStyle(BOLD);
  textAlign(RIGHT, TOP);
  text('E \\u2192', width - 12, 12);
  textStyle(NORMAL);
}

// ─── Particle update + rendering ────────────────────────────────────────────
function updateAndDrawParticles(state, intensity) {
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    var isHighlighted = state.highlight_particle && i === 0;

    // ── Physics: thermal zigzag ───────────────────────────────────────────
    p.collisionTimer--;
    var justCollided = false;
    if (p.collisionTimer <= 0) {
      p.collisionTimer = COLLISION_INTERVAL + floor(random(-2, 3));
      var angle = random(TWO_PI);
      p.vx = cos(angle) * config.particles.thermal_speed;
      p.vy = sin(angle) * config.particles.thermal_speed;
      justCollided = true;
    }

    // ── Spawn collision flash when electron "hits" an ion ─────────────────
    if (justCollided && hasCollisionGlow() && intensity > 0) {
      // Find nearest lattice ion
      var nearestDist = Infinity;
      var nearestIon = null;
      for (var li = 0; li < latticeIons.length; li++) {
        var dx = p.x - latticeIons[li].x;
        var dy = p.y - latticeIons[li].y;
        var d = dx * dx + dy * dy;
        if (d < nearestDist) {
          nearestDist = d;
          nearestIon = latticeIons[li];
        }
      }
      // Flash at ion location if electron is reasonably close
      if (nearestIon && nearestDist < 80 * 80) {
        spawnCollisionFlash(nearestIon.x, nearestIon.y, intensity);
      }
    }

    // ── Physics: drift bias ───────────────────────────────────────────────
    var currentVx = p.vx;
    var currentVy = p.vy;
    if (state.drift_speed > 0 && state.drift_direction !== 'none') {
      var driftSign = state.drift_direction === 'left' ? -1 : 1;
      currentVx += driftSign * state.drift_speed;
    }

    // ── Move ──────────────────────────────────────────────────────────────
    p.x += currentVx;
    p.y += currentVy;

    // Wrap around edges
    if (p.x < -5) p.x = width + 5;
    if (p.x > width + 5) p.x = -5;
    if (p.y < -5) p.y = height + 5;
    if (p.y > height + 5) p.y = -5;

    // ── Trail ─────────────────────────────────────────────────────────────
    p.trail.push({ x: p.x, y: p.y });
    var maxTrail = isHighlighted
      ? config.particles.trail_length * 2.5
      : config.particles.trail_length;
    while (p.trail.length > maxTrail) p.trail.shift();

    // ── Determine opacity ─────────────────────────────────────────────────
    var opacity = 1.0;
    if (state.dim_others && !isHighlighted) {
      opacity = state.dim_opacity;
    }

    // ── Draw trail ────────────────────────────────────────────────────────
    var trailColor = isHighlighted ? '#FFFFFF' : config.particles.color;
    noFill();
    for (var j = 1; j < p.trail.length; j++) {
      var alpha = (j / p.trail.length) * opacity * 0.35;
      strokeHex(trailColor, alpha);
      strokeWeight(isHighlighted ? 2 : 1);
      line(p.trail[j-1].x, p.trail[j-1].y, p.trail[j].x, p.trail[j].y);
    }
    noStroke();

    // ── Draw particle ─────────────────────────────────────────────────────
    var pColor = isHighlighted ? '#FFFFFF' : config.particles.color;
    var pSize = isHighlighted
      ? config.particles.size * 1.8
      : config.particles.size;

    // Glow for highlighted particle
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

// ─── Power meter display ────────────────────────────────────────────────────
function drawPowerMeter(state, intensity) {
  var meterX = width - 160;
  var meterY = 10;
  var meterW = 150;
  var meterH = 50;

  // Background panel
  noStroke();
  fill(0, 0, 0, 180);
  rect(meterX, meterY, meterW, meterH, 6);

  // Power value: P = I²R (display as relative)
  var I = state.drift_speed || 0;
  var R = 10; // nominal
  var P = I * I * R;

  // "P = I\\u00B2R" label
  fill(255, 152, 0, 255);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('P = I\\u00B2R', meterX + 8, meterY + 6);

  // Numeric value
  fill(255, 255, 255, 230);
  textSize(16);
  text(P.toFixed(1) + ' W', meterX + 8, meterY + 24);

  // Bar indicator
  var barWidth = constrain(map(intensity, 0, 1, 0, meterW - 16), 0, meterW - 16);
  var barR = floor(lerp(100, 255, intensity));
  var barG = floor(lerp(200, 80, intensity));
  fill(barR, barG, 0, 200);
  rect(meterX + 8, meterY + meterH - 8, barWidth, 4, 2);

  textStyle(NORMAL);
}

// ─── Heat counter display ───────────────────────────────────────────────────
function drawHeatCounter() {
  var counterX = width - 160;
  var counterY = 66;
  var counterW = 150;
  var counterH = 34;

  noStroke();
  fill(0, 0, 0, 180);
  rect(counterX, counterY, counterW, counterH, 6);

  // H = I²Rt label
  fill(239, 83, 80, 255);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('H = I\\u00B2Rt', counterX + 8, counterY + 4);

  // Value
  fill(255, 255, 255, 230);
  textSize(13);
  var displayH = heatAccumulator < 100 ? heatAccumulator.toFixed(1) : floor(heatAccumulator).toString();
  text(displayH + ' J', counterX + 8, counterY + 18);

  textStyle(NORMAL);
}

// ─── State label ────────────────────────────────────────────────────────────
function drawLabel(state) {
  noStroke();
  // Background pill
  var labelText = state.label || PM_currentState;
  textSize(12);
  var tw = textWidth(labelText);
  fillHex('#000000', 0.5);
  rect(8, height - 32, tw + 20, 24, 6);
  // Text
  fillHex('#D4D4D8', 0.9);
  textAlign(LEFT, CENTER);
  text(labelText, 18, height - 20);
}

// ─── State transition border flash ──────────────────────────────────────────
var borderFlashAlpha = 0;
var prevDrawState = 'STATE_1';

var originalDraw = draw;
draw = function() {
  originalDraw();

  // Border flash on state change
  if (PM_currentState !== prevDrawState) {
    borderFlashAlpha = 1.0;
    prevDrawState = PM_currentState;
    // Reset heat accumulator on state change to STATE_1
    if (PM_currentState === 'STATE_1') {
      heatAccumulator = 0;
      simTimeSeconds = 0;
    }
  }
  if (borderFlashAlpha > 0) {
    noFill();
    strokeHex('#3B82F6', borderFlashAlpha * 0.6);
    strokeWeight(3);
    rect(1, 1, width - 2, height - 2, 4);
    noStroke();
    borderFlashAlpha -= 0.025; // fade over ~40 frames (~660ms)
  }
};

// ─── postMessage bridge ─────────────────────────────────────────────────────
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.type) return;
  if (e.data.type === 'SET_STATE') {
    var newState = e.data.state;
    if (config && config.states && config.states[newState]) {
      PM_currentState = newState;
      console.log('[Renderer] SET_STATE \\u2192', newState);
      parent.postMessage({ type: 'STATE_REACHED', state: newState }, '*');
    }
  }
});
`;
