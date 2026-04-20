// =============================================================================
// wave_canvas_renderer.ts
// Pre-built p5.js renderer for wave / oscillation simulations.
// Engineer-written — NOT AI-generated.
//
// Architecture: reads window.SIM_CONFIG (WaveCanvasConfig), draws any
// wave scenario from that config. Zero hardcoded physics — everything
// is driven by the JSON.
//
// Scenarios supported (via config.scenario_type):
//   transverse_wave   — sine wave on a string, particle tracks up/down
//   longitudinal_wave — compressions/rarefactions, particles oscillate in-line
//   standing_wave     — two counter-propagating waves, nodes + antinodes
//   superposition     — two waves overlap, algebraic sum resultant
//   beats             — two close frequencies, amplitude envelope
//   doppler_moving    — moving source, wavefront compression
//   shm_particle      — single particle SHM (reserved)
//   em_wave           — electromagnetic wave (reserved)
//
// postMessage bridge:
//   IN:  { type: 'SET_STATE', state: 'STATE_N' }
//        { type: 'INIT_CONFIG', config: WaveCanvasConfig }
//        { type: 'PING' }
//   OUT: { type: 'SIM_READY' }          — on load
//        { type: 'STATE_REACHED', state: 'STATE_N' }  — on state apply
//        { type: 'PONG' }
// =============================================================================

// ── TypeScript interfaces (exported for config generation) ───────────────────

export interface WaveCanvasConfig {
    scenario_type:
        | 'transverse_wave'
        | 'longitudinal_wave'
        | 'standing_wave'
        | 'shm_particle'
        | 'doppler_moving'
        | 'beats'
        | 'superposition'
        | 'em_wave';
    waves: Array<{
        id: string;
        amplitude: number;
        wavelength: number;
        frequency: number;
        phase: number;
        direction: 'left' | 'right' | 'stationary';
        color: string;
        label: string;
    }>;
    medium: {
        type: 'string' | 'air' | 'vacuum';
        particle_count: number;
        damping: number;
    };
    show_wavelength_markers: boolean;
    show_node_antinode: boolean;
    show_displacement_graph: boolean;
    states: Record<
        string,
        {
            label: string;
            active_waves: string[];
            show_resultant: boolean;
            show_node_antinode?: boolean;   // per-state override (standing_wave)
            slider_active: boolean;
            caption: string;
        }
    >;
    pvl_colors?: {
        background: string;
        text: string;
        wave_1: string;
        wave_2: string;
        resultant: string;
    };
}

// ── HTML assembler ───────────────────────────────────────────────────────────

export function assembleWaveCanvasHtml(config: WaveCanvasConfig): string {
    const bg = config.pvl_colors?.background ?? '#0A0A1A';
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
html, body { margin: 0; padding: 0; overflow: hidden; background: ${bg}; }
canvas { display: block; }
#legend { position: fixed; bottom: 8px; left: 8px; background: rgba(0,0,0,0.8); color: #e0e0e0; padding: 8px 12px; border-radius: 6px; font: 12px monospace; z-index: 10; }
</style>
</head><body>
<div id="legend"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js" crossorigin="anonymous"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
<\/script>
<script>
${WAVE_CANVAS_RENDERER_CODE}
<\/script>
</body></html>`;
}

// ── Renderer code (p5.js, embedded as string) ────────────────────────────────

export const WAVE_CANVAS_RENDERER_CODE = `
// ============================================================
// Wave Canvas Renderer — p5.js global mode
// Reads window.SIM_CONFIG (WaveCanvasConfig)
// ============================================================

var WC_cfg;
var WC_state = 'STATE_1';
var WC_prevSt = 'STATE_1';
var WC_time = 0;
var WC_flash = 0;
var WC_trackedParticle = -1;
var WC_trackedY = 0;
var WC_CW = 800;
var WC_CH = 500;
var WC_sliderEl = null;
var WC_sliderValEl = null;
var WC_sliderActive = false;

// ── colour helpers ──────────────────────────────────────────
function WC_rgb(h) {
  if (!h || h.length < 7) return [200, 200, 200];
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function WC_fill(h, a) {
  var c = WC_rgb(h);
  fill(c[0], c[1], c[2], (a === undefined ? 1 : a) * 255);
}
function WC_stroke(h, a) {
  var c = WC_rgb(h);
  stroke(c[0], c[1], c[2], (a === undefined ? 1 : a) * 255);
}

// ── SETUP ───────────────────────────────────────────────────
function setup() {
  WC_cfg = window.SIM_CONFIG;
  if (!WC_cfg) { console.error('[WaveCanvas] No SIM_CONFIG'); return; }
  WC_CW = 800;
  WC_CH = 500;
  createCanvas(WC_CW, WC_CH);
  frameRate(60);

  // Pick tracked particle for transverse_wave
  if (WC_cfg.scenario_type === 'transverse_wave') {
    var pCount = (WC_cfg.medium && WC_cfg.medium.particle_count) || 30;
    WC_trackedParticle = Math.floor(pCount * 0.35);
  }

  parent.postMessage({ type: 'SIM_READY' }, '*');
}

// ── MAIN DRAW ───────────────────────────────────────────────
function draw() {
  if (!WC_cfg) return;
  var cfg = WC_cfg;
  var st = cfg.states && cfg.states[WC_state];
  if (!st) return;

  var bg = (cfg.pvl_colors && cfg.pvl_colors.background) || '#0A0A1A';
  background(bg);

  WC_time += 1 / 60;

  var scenario = (cfg.scenario_type || 'transverse_wave').toLowerCase();

  if (scenario === 'transverse_wave') WC_drawTransverseWave(cfg, st);
  else if (scenario === 'longitudinal_wave') WC_drawLongitudinalWave(cfg, st);
  else if (scenario === 'standing_wave') WC_drawStandingWave(cfg, st);
  else if (scenario === 'superposition') WC_drawSuperposition(cfg, st);
  else if (scenario === 'beats') WC_drawBeats(cfg, st);
  else if (scenario === 'doppler_moving') WC_drawDopplerEffect(cfg, st);
  else WC_drawTransverseWave(cfg, st); // fallback

  WC_drawCaption(st);
  WC_drawBorderFlash();
  WC_updateLegend(cfg, st);
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: transverse_wave
// ══════════════════════════════════════════════════════════════
function WC_drawTransverseWave(cfg, st) {
  var waves = WC_getActiveWaves(cfg, st);
  var yCenter = WC_CH / 2;
  var w = WC_CW;
  var colors = cfg.pvl_colors || {};

  // Draw equilibrium line
  WC_stroke('#444444', 0.5);
  strokeWeight(1);
  line(40, yCenter, w - 40, yCenter);

  // Draw each active wave
  for (var wi = 0; wi < waves.length; wi++) {
    var wave = waves[wi];
    var col = wave.color || (wi === 0 ? (colors.wave_1 || '#42A5F5') : (colors.wave_2 || '#FF9800'));
    var amp = wave.amplitude * 60;
    var wl = wave.wavelength * 80;
    var freq = wave.frequency;
    var ph = wave.phase || 0;
    var dir = wave.direction === 'left' ? 1 : -1;

    WC_drawSineWave(40, yCenter, amp, wl, ph + dir * WC_time * freq * TWO_PI, col, wave.label);
  }

  // Resultant
  if (st.show_resultant && waves.length >= 2) {
    var resCol = (colors.resultant || '#66BB6A');
    WC_drawResultantWave(cfg, st, 40, yCenter, resCol);
  }

  // Wavelength markers
  if (cfg.show_wavelength_markers && waves.length > 0) {
    var w0 = waves[0];
    var wl0 = w0.wavelength * 80;
    WC_drawWavelengthMarkers(40, yCenter, wl0);
  }

  // Tracked particle (shows perpendicular motion)
  if (WC_trackedParticle >= 0 && waves.length > 0) {
    var pCount = (cfg.medium && cfg.medium.particle_count) || 30;
    var spacing = (w - 80) / pCount;
    var px = 40 + WC_trackedParticle * spacing;
    var wave0 = waves[0];
    var amp0 = wave0.amplitude * 60;
    var wl0r = wave0.wavelength * 80;
    var freq0 = wave0.frequency;
    var ph0 = wave0.phase || 0;
    var dir0 = wave0.direction === 'left' ? 1 : -1;
    var dy = amp0 * sin((TWO_PI / wl0r) * (px - 40) - (ph0 + dir0 * WC_time * freq0 * TWO_PI));
    var py = yCenter + dy;
    WC_trackedY = py;

    // Tracked particle highlight
    noStroke();
    fill(255, 87, 34, 60);
    ellipse(px, py, 28);
    fill(255, 87, 34, 200);
    ellipse(px, py, 10);

    // Arrow showing perpendicular displacement
    if (WC_state === 'STATE_3' || WC_state === 'STATE_4') {
      WC_stroke('#FF5722', 0.8);
      strokeWeight(2);
      line(px, yCenter, px, py);
      // Arrowhead
      var aDir = py > yCenter ? 1 : -1;
      line(px, py, px - 4, py - aDir * 8);
      line(px, py, px + 4, py - aDir * 8);

      // Wave direction arrow (horizontal)
      var wDir = wave0.direction === 'right' ? 1 : -1;
      WC_stroke('#42A5F5', 0.8);
      strokeWeight(2);
      var arrowY = yCenter + 60;
      line(px - 30, arrowY, px + 30 * wDir, arrowY);
      line(px + 30 * wDir, arrowY, px + 30 * wDir - wDir * 8, arrowY - 4);
      line(px + 30 * wDir, arrowY, px + 30 * wDir - wDir * 8, arrowY + 4);

      // Labels
      noStroke();
      fill(255, 87, 34, 200);
      textSize(11);
      textAlign(CENTER, CENTER);
      text('particle', px + 18, (yCenter + py) / 2);
      fill(66, 165, 245, 200);
      text('wave', px, arrowY + 14);
    }
  }
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: longitudinal_wave
// ══════════════════════════════════════════════════════════════
function WC_drawLongitudinalWave(cfg, st) {
  var waves = WC_getActiveWaves(cfg, st);
  var yCenter = WC_CH / 2;
  var w = WC_CW;
  var pCount = (cfg.medium && cfg.medium.particle_count) || 40;
  var colors = cfg.pvl_colors || {};

  // Draw compression bands as background
  if (waves.length > 0) {
    var wave0 = waves[0];
    var wl = wave0.wavelength * 80;
    var freq = wave0.frequency;
    var ph = wave0.phase || 0;
    var dir = wave0.direction === 'left' ? 1 : -1;
    WC_drawCompressionBands(wl, ph + dir * WC_time * freq * TWO_PI, w, WC_CH);
  }

  // Draw particles
  if (waves.length > 0) {
    var wave0l = waves[0];
    var ampL = wave0l.amplitude * 20;
    var wlL = wave0l.wavelength * 80;
    var freqL = wave0l.frequency;
    var phL = wave0l.phase || 0;
    var dirL = wave0l.direction === 'left' ? 1 : -1;
    var col = wave0l.color || colors.wave_1 || '#42A5F5';

    var spacing = (w - 80) / pCount;

    // Track one particle to show it returns to start
    var trackedIdx = Math.floor(pCount * 0.4);

    for (var i = 0; i < pCount; i++) {
      var baseX = 40 + i * spacing;
      var displacement = ampL * sin((TWO_PI / wlL) * baseX - (phL + dirL * WC_time * freqL * TWO_PI));
      var px = baseX + displacement;
      var py = yCenter;

      // Size based on local density (compression = larger)
      var density = 1 - 0.3 * cos((TWO_PI / wlL) * baseX - (phL + dirL * WC_time * freqL * TWO_PI));
      var sz = 6 * density;

      var isTracked = (i === trackedIdx);
      if (isTracked && (WC_state === 'STATE_3' || WC_state === 'STATE_4')) {
        // Tracked particle — show it vibrates in place
        noStroke();
        fill(255, 87, 34, 60);
        ellipse(px, py, 30);
        fill(255, 87, 34, 220);
        ellipse(px, py, 10);

        // Mean position marker
        WC_stroke('#FF5722', 0.4);
        strokeWeight(1);
        line(baseX, py - 15, baseX, py + 15);
        noStroke();

        // Label
        fill(255, 87, 34, 200);
        textSize(10);
        textAlign(CENTER, TOP);
        text('vibrates here', px, py + 18);
      } else {
        noStroke();
        WC_fill(col, 0.8);
        ellipse(px, py, sz);
      }
    }

    // Compression / rarefaction labels
    noStroke();
    fill(200, 200, 200, 160);
    textSize(10);
    textAlign(CENTER, TOP);
    var labelY = yCenter + 40;
    for (var cx = 80; cx < w - 80; cx += wlL) {
      var cPhase = (TWO_PI / wlL) * cx - (phL + dirL * WC_time * freqL * TWO_PI);
      var localD = cos(cPhase);
      if (localD > 0.7) {
        text('C', cx, labelY);
      } else if (localD < -0.7) {
        text('R', cx, labelY);
      }
    }

    // Wave propagation arrow
    if (WC_state === 'STATE_3' || WC_state === 'STATE_4') {
      WC_stroke('#42A5F5', 0.7);
      strokeWeight(2);
      var arrY = yCenter - 50;
      var arrDir = wave0l.direction === 'right' ? 1 : -1;
      line(w / 2 - 60, arrY, w / 2 + 60 * arrDir, arrY);
      line(w / 2 + 60 * arrDir, arrY, w / 2 + 60 * arrDir - arrDir * 8, arrY - 5);
      line(w / 2 + 60 * arrDir, arrY, w / 2 + 60 * arrDir - arrDir * 8, arrY + 5);
      noStroke();
      fill(66, 165, 245, 180);
      textSize(11);
      textAlign(CENTER, CENTER);
      text('wave propagation', w / 2, arrY - 14);
    }
  }
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: standing_wave
// ══════════════════════════════════════════════════════════════
function WC_drawStandingWave(cfg, st) {
  var waves = WC_getActiveWaves(cfg, st);
  var yCenter = WC_CH / 2;
  var w = WC_CW;
  var colors = cfg.pvl_colors || {};

  // Equilibrium line
  WC_stroke('#444444', 0.5);
  strokeWeight(1);
  line(40, yCenter, w - 40, yCenter);

  // Always need at least one wave to drive the display
  if (waves.length === 0) return;

  var baseWave = waves[0];
  var swAmp  = Math.max(baseWave.amplitude  * 60, 20);   // min 20px visible
  var swWl   = Math.max(baseWave.wavelength * 80, 40);   // min 40px so k is finite
  var swFreq = Math.max(baseWave.frequency,         0.2);

  // ── Read state flags ──────────────────────────────────────
  // show_resultant: true from STATE_2 onwards (set in config states)
  // show_node_antinode: true from STATE_3 onwards
  var showResultant   = !!(st.show_resultant);
  var showNodeMarkers = !!(st.show_node_antinode);

  // In STATE_4 the component waves fade out to emphasise the resultant
  var isState4        = (WC_state === 'STATE_4');
  var travelAlpha     = isState4 ? 0.12 : 0.45;

  // ── Wave 2 params (counter-propagating, same amplitude) ───
  var wave2  = waves.length >= 2 ? waves[1] : baseWave;
  var col2   = wave2.color || colors.wave_2 || '#42A5F5';
  var swAmp2 = Math.max(wave2.amplitude  * 60, 20);
  var swWl2  = Math.max(wave2.wavelength * 80, 40);
  var swFreq2= Math.max(wave2.frequency,        0.2);

  // ── Wave 1: travelling right (orange) ─────────────────────
  var col1 = baseWave.color || colors.wave_1 || '#FF9800';
  WC_stroke(col1, travelAlpha);
  strokeWeight(2);
  noFill();
  beginShape();
  for (var x1 = 40; x1 <= w - 40; x1 += 2) {
    var y1 = yCenter + swAmp * sin((TWO_PI / swWl) * (x1 - 40) - WC_time * swFreq * TWO_PI);
    vertex(x1, y1);
  }
  endShape();

  // ── Wave 2: travelling left (blue) ────────────────────────
  WC_stroke(col2, travelAlpha);
  strokeWeight(2);
  noFill();
  beginShape();
  for (var x2 = 40; x2 <= w - 40; x2 += 2) {
    var y2 = yCenter + swAmp2 * sin((TWO_PI / swWl2) * (x2 - 40) + WC_time * swFreq2 * TWO_PI);
    vertex(x2, y2);
  }
  endShape();

  // ── Resultant + envelope (STATE_2+) ────────────────────────
  if (showResultant) {
    // Ghost envelope ±A|sin(kx)|
    WC_stroke('#FFFFFF', 0.12);
    strokeWeight(1);
    noFill();
    beginShape();
    for (var ex = 40; ex <= w - 40; ex += 2) {
      vertex(ex, yCenter - swAmp * abs(sin((TWO_PI / swWl) * (ex - 40))));
    }
    endShape();
    beginShape();
    for (var ex2 = 40; ex2 <= w - 40; ex2 += 2) {
      vertex(ex2, yCenter + swAmp * abs(sin((TWO_PI / swWl) * (ex2 - 40))));
    }
    endShape();

    // Standing wave resultant: 2A sin(kx) cos(ωt)
    var temporalPart = cos(WC_time * swFreq * TWO_PI);
    var resAlpha = isState4 ? 0.98 : 0.90;
    var resCol = colors.resultant || '#66BB6A';
    WC_stroke(resCol, resAlpha);
    strokeWeight(isState4 ? 3 : 2.5);
    noFill();
    beginShape();
    for (var sx = 40; sx <= w - 40; sx += 2) {
      var spatialPart = sin((TWO_PI / swWl) * (sx - 40));
      vertex(sx, yCenter + swAmp * spatialPart * temporalPart);
    }
    endShape();

    // ── Node markers (STATE_3+) ────────────────────────────
    if (showNodeMarkers) {
      noStroke();
      for (var nx = 40; nx <= w - 40; nx += swWl / 2) {
        fill(239, 83, 80, 220);
        ellipse(nx, yCenter, 9);
        fill(239, 83, 80, 160);
        textSize(9);
        textAlign(CENTER, TOP);
        text('N', nx, yCenter + 8);
      }

      // Antinode markers (oscillate with cos(ωt))
      var antinodeY = swAmp * abs(temporalPart);
      for (var ax = 40 + swWl / 4; ax <= w - 40; ax += swWl / 2) {
        var aSign = sin((TWO_PI / swWl) * (ax - 40)) > 0 ? -1 : 1;
        fill(255, 215, 0, 200);
        ellipse(ax, yCenter + aSign * antinodeY, 9);
        fill(255, 215, 0, 160);
        textSize(9);
        textAlign(CENTER, TOP);
        text('A', ax, yCenter + antinodeY + 8);
      }
    }
  }
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: superposition
// ══════════════════════════════════════════════════════════════
function WC_drawSuperposition(cfg, st) {
  var waves = WC_getActiveWaves(cfg, st);
  var yCenter = WC_CH * 0.35;
  var yResult = WC_CH * 0.72;
  var w = WC_CW;
  var colors = cfg.pvl_colors || {};

  // Equilibrium lines
  WC_stroke('#444444', 0.4);
  strokeWeight(1);
  line(40, yCenter, w - 40, yCenter);
  if (st.show_resultant) {
    line(40, yResult, w - 40, yResult);
  }

  // Draw individual waves
  for (var wi = 0; wi < waves.length; wi++) {
    var wave = waves[wi];
    var col = wave.color || (wi === 0 ? (colors.wave_1 || '#42A5F5') : (colors.wave_2 || '#FF9800'));
    var amp = wave.amplitude * 50;
    var wl = wave.wavelength * 80;
    var freq = wave.frequency;
    var ph = wave.phase || 0;
    var dir = wave.direction === 'left' ? 1 : -1;
    WC_drawSineWave(40, yCenter, amp, wl, ph + dir * WC_time * freq * TWO_PI, col, wave.label);
  }

  // Resultant wave below
  if (st.show_resultant && waves.length >= 2) {
    var resCol = colors.resultant || '#66BB6A';
    noStroke();
    fill(200, 200, 200, 140);
    textSize(11);
    textAlign(LEFT, CENTER);
    text('Resultant (y\\u2081 + y\\u2082)', 44, yResult - 40);

    WC_stroke(resCol, 0.9);
    strokeWeight(2.5);
    noFill();
    beginShape();
    for (var rx = 40; rx <= w - 40; rx += 2) {
      var ySum = 0;
      for (var ri = 0; ri < waves.length; ri++) {
        var rw = waves[ri];
        var rAmp = rw.amplitude * 50;
        var rWl = rw.wavelength * 80;
        var rFreq = rw.frequency;
        var rPh = rw.phase || 0;
        var rDir = rw.direction === 'left' ? 1 : -1;
        ySum += rAmp * sin((TWO_PI / rWl) * (rx - 40) - (rPh + rDir * WC_time * rFreq * TWO_PI));
      }
      vertex(rx, yResult + ySum);
    }
    endShape();
  }

  // Section labels
  noStroke();
  fill(200, 200, 200, 160);
  textSize(11);
  textAlign(LEFT, TOP);
  text('Individual waves', 44, 14);
  if (st.show_resultant) {
    text('Superposition result', 44, yResult - 56);
  }
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: beats
// ══════════════════════════════════════════════════════════════
function WC_drawBeats(cfg, st) {
  var waves = WC_getActiveWaves(cfg, st);
  var yTop = WC_CH * 0.22;
  var yBottom = WC_CH * 0.65;
  var w = WC_CW;
  var colors = cfg.pvl_colors || {};

  // Draw individual waves in top section
  WC_stroke('#444444', 0.4);
  strokeWeight(1);
  line(40, yTop, w - 40, yTop);

  for (var wi = 0; wi < waves.length; wi++) {
    var wave = waves[wi];
    var col = wave.color || (wi === 0 ? (colors.wave_1 || '#42A5F5') : (colors.wave_2 || '#FF9800'));
    var amp = wave.amplitude * 40;
    var freq = wave.frequency;
    var ph = wave.phase || 0;

    WC_stroke(col, 0.6);
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (var bx = 40; bx <= w - 40; bx += 2) {
      var t = (bx - 40) / 120;
      var by = yTop + amp * sin(TWO_PI * freq * (t - WC_time) + ph);
      vertex(bx, by);
    }
    endShape();
  }

  // Beat envelope + resultant
  if (waves.length >= 2) {
    var f1 = waves[0].frequency;
    var f2 = waves[1].frequency;
    var a1 = waves[0].amplitude * 40;
    var a2 = waves[1].amplitude * 40;
    var resCol = colors.resultant || '#66BB6A';

    // Equilibrium
    WC_stroke('#444444', 0.4);
    strokeWeight(1);
    line(40, yBottom, w - 40, yBottom);

    // Resultant
    WC_stroke(resCol, 0.9);
    strokeWeight(2);
    noFill();
    beginShape();
    for (var rx = 40; rx <= w - 40; rx += 2) {
      var t2 = (rx - 40) / 120;
      var y1 = a1 * sin(TWO_PI * f1 * (t2 - WC_time));
      var y2 = a2 * sin(TWO_PI * f2 * (t2 - WC_time));
      vertex(rx, yBottom + y1 + y2);
    }
    endShape();

    // Beat envelope
    if (st.show_resultant) {
      WC_drawBeatEnvelope(f1, f2, WC_time, w, Math.max(a1, a2), yBottom);
    }

    // Beat frequency label
    noStroke();
    fill(200, 200, 200, 200);
    textSize(12);
    textAlign(CENTER, TOP);
    var beatF = abs(f1 - f2);
    text('Beat freq = |f\\u2081 - f\\u2082| = ' + beatF.toFixed(1) + ' Hz', w / 2, yBottom + 70);
    textSize(10);
    fill(200, 200, 200, 140);
    text('f\\u2081 = ' + f1.toFixed(1) + ' Hz,  f\\u2082 = ' + f2.toFixed(1) + ' Hz', w / 2, yBottom + 86);
  }

  // Labels
  noStroke();
  fill(200, 200, 200, 160);
  textSize(11);
  textAlign(LEFT, TOP);
  text('Individual waves', 44, 14);
  text('Resultant (beats)', 44, yBottom - 48);
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: doppler_moving
// ══════════════════════════════════════════════════════════════
function WC_drawDopplerEffect(cfg, st) {
  var colors = cfg.pvl_colors || {};
  var waves = WC_getActiveWaves(cfg, st);
  var waveV = 343; // speed of sound in air (for display)
  var srcV = 100;  // source speed (pixels/sec visual)
  if (waves.length > 0) {
    waveV = waves[0].frequency * waves[0].wavelength; // display speed
  }

  // Source position — moves rightward
  var srcX = WC_CW * 0.3 + (WC_time * srcV * 0.5) % (WC_CW * 0.4);
  var srcY = WC_CH / 2;

  // Draw wavefronts (concentric circles from past positions)
  var numFronts = 12;
  var frontInterval = 0.3; // seconds between fronts
  for (var i = 0; i < numFronts; i++) {
    var age = i * frontInterval;
    var pastSrcX = srcX - srcV * 0.5 * age;
    var radius = age * 150; // visual expansion speed
    if (radius < 5) continue;

    var alpha = map(i, 0, numFronts, 0.5, 0.08);
    WC_stroke(colors.wave_1 || '#42A5F5', alpha);
    strokeWeight(1.5);
    noFill();
    ellipse(pastSrcX, srcY, radius * 2);
  }

  // Source dot
  noStroke();
  fill(255, 87, 34, 200);
  ellipse(srcX, srcY, 16);
  fill(255, 87, 34, 80);
  ellipse(srcX, srcY, 30);

  // Source velocity arrow
  WC_stroke('#FF5722', 0.8);
  strokeWeight(2);
  line(srcX + 20, srcY, srcX + 50, srcY);
  line(srcX + 50, srcY, srcX + 42, srcY - 5);
  line(srcX + 50, srcY, srcX + 42, srcY + 5);
  noStroke();
  fill(255, 87, 34, 200);
  textSize(11);
  textAlign(LEFT, CENTER);
  text('v\\u209b', srcX + 54, srcY);

  // Observer positions
  var obsAheadX = WC_CW * 0.85;
  var obsBehindX = WC_CW * 0.08;

  // Observer ahead
  noStroke();
  fill(102, 187, 106, 200);
  ellipse(obsAheadX, srcY, 14);
  fill(102, 187, 106, 160);
  textSize(10);
  textAlign(CENTER, TOP);
  text('Observer A', obsAheadX, srcY + 14);
  text('(compressed \\u2192 higher f)', obsAheadX, srcY + 26);

  // Observer behind
  fill(255, 152, 0, 200);
  ellipse(obsBehindX, srcY, 14);
  fill(255, 152, 0, 160);
  textSize(10);
  textAlign(CENTER, TOP);
  text('Observer B', obsBehindX, srcY + 14);
  text('(stretched \\u2192 lower f)', obsBehindX, srcY + 26);

  // Wave speed arrows (ALL same length — key insight for STATE_3)
  if (WC_state === 'STATE_3' || WC_state === 'STATE_4') {
    var arrowLen = 50;
    var arrowY = srcY - 80;

    // Right arrow
    WC_stroke('#FFFFFF', 0.7);
    strokeWeight(2);
    line(WC_CW / 2 - arrowLen, arrowY, WC_CW / 2 + arrowLen, arrowY);
    line(WC_CW / 2 + arrowLen, arrowY, WC_CW / 2 + arrowLen - 8, arrowY - 5);
    line(WC_CW / 2 + arrowLen, arrowY, WC_CW / 2 + arrowLen - 8, arrowY + 5);
    // Left arrow
    line(WC_CW / 2 + arrowLen, arrowY - 25, WC_CW / 2 - arrowLen, arrowY - 25);
    line(WC_CW / 2 - arrowLen, arrowY - 25, WC_CW / 2 - arrowLen + 8, arrowY - 30);
    line(WC_CW / 2 - arrowLen, arrowY - 25, WC_CW / 2 - arrowLen + 8, arrowY - 20);
    noStroke();
    fill(255, 255, 255, 200);
    textSize(11);
    textAlign(CENTER, CENTER);
    text('v\\u2098 (wave speed) = same in both directions!', WC_CW / 2, arrowY - 45);

    // Spacing difference labels
    fill(102, 187, 106, 200);
    textSize(10);
    textAlign(CENTER, TOP);
    text('\\u03BB compressed', WC_CW * 0.7, srcY + 60);
    fill(255, 152, 0, 200);
    text('\\u03BB stretched', WC_CW * 0.22, srcY + 60);
  }

  // Formula
  noStroke();
  fill(200, 200, 200, 180);
  textSize(12);
  textAlign(CENTER, BOTTOM);
  text("f' = f\\u2080(v \\u00B1 v\\u2092) / (v \\u2213 v\\u209b)", WC_CW / 2, WC_CH - 20);
}

// ══════════════════════════════════════════════════════════════
// COMPONENT DRAWING FUNCTIONS
// ══════════════════════════════════════════════════════════════

function WC_drawSineWave(x0, yCenter, amp, wl, phase, col, label, alphaOverride) {
  var alpha = alphaOverride !== undefined ? alphaOverride : 0.85;
  WC_stroke(col, alpha);
  strokeWeight(2);
  noFill();
  beginShape();
  for (var x = x0; x <= WC_CW - 40; x += 2) {
    var y = yCenter + amp * sin((TWO_PI / wl) * (x - x0) - phase);
    vertex(x, y);
  }
  endShape();

  // Label
  if (label) {
    noStroke();
    var rgb = WC_rgb(col);
    fill(rgb[0], rgb[1], rgb[2], alpha * 220);
    textSize(11);
    textAlign(LEFT, CENTER);
    text(label, WC_CW - 36, yCenter - amp - 8);
  }
}

function WC_drawCompressionBands(wl, phase, w, h) {
  var yCenter = h / 2;
  var bandH = 60;
  noStroke();
  for (var bx = 40; bx < w - 40; bx += 4) {
    var density = 0.5 + 0.5 * cos((TWO_PI / wl) * bx - phase);
    var alpha = density * 0.15;
    fill(100, 150, 255, alpha * 255);
    rect(bx, yCenter - bandH, 4, bandH * 2);
  }
}

function WC_drawNodeAntinodeMarkers(wl, w, h, yCenter, amp) {
  // Nodes at multiples of lambda/2
  var halfWl = wl / 2;
  for (var nx = 40; nx <= w - 40; nx += halfWl) {
    var isNode = (Math.round((nx - 40) / halfWl) % 2 === 0);
    if (isNode) {
      // Node — red dot with ZERO label
      noStroke();
      fill(239, 83, 80, 200);
      ellipse(nx, yCenter, 10);
      fill(239, 83, 80, 180);
      textSize(9);
      textAlign(CENTER, TOP);
      text('N (zero)', nx, yCenter + 10);
    } else {
      // Antinode — green dot
      noStroke();
      fill(102, 187, 106, 200);
      ellipse(nx, yCenter, 10);
      fill(102, 187, 106, 180);
      textSize(9);
      textAlign(CENTER, TOP);
      text('A (max)', nx, yCenter + 10);
    }
  }

  // Lambda/2 distance marker between first two nodes
  if (halfWl > 30) {
    WC_stroke('#FFD54F', 0.6);
    strokeWeight(1);
    var y1m = yCenter - amp - 20;
    line(40, y1m, 40 + halfWl, y1m);
    // End ticks
    line(40, y1m - 5, 40, y1m + 5);
    line(40 + halfWl, y1m - 5, 40 + halfWl, y1m + 5);
    noStroke();
    fill(255, 213, 79, 180);
    textSize(10);
    textAlign(CENTER, BOTTOM);
    text('\\u03BB/2', 40 + halfWl / 2, y1m - 4);
  }
}

function WC_drawBeatEnvelope(f1, f2, t, w, amp, yCenter) {
  var fBeat = abs(f1 - f2);
  if (fBeat < 0.01) return;

  WC_stroke('#FFD54F', 0.5);
  strokeWeight(1);
  noFill();

  // Upper envelope
  beginShape();
  for (var ex = 40; ex <= w - 40; ex += 3) {
    var te = (ex - 40) / 120;
    var env = 2 * amp * abs(cos(PI * fBeat * (te - t)));
    vertex(ex, yCenter - env);
  }
  endShape();

  // Lower envelope
  beginShape();
  for (var ex2 = 40; ex2 <= w - 40; ex2 += 3) {
    var te2 = (ex2 - 40) / 120;
    var env2 = 2 * amp * abs(cos(PI * fBeat * (te2 - t)));
    vertex(ex2, yCenter + env2);
  }
  endShape();
}

function WC_drawWavelengthMarkers(x0, yCenter, wl) {
  if (wl < 30) return;
  var y1 = yCenter - 80;
  WC_stroke('#FFD54F', 0.6);
  strokeWeight(1);
  line(x0, y1, x0 + wl, y1);
  // End ticks
  line(x0, y1 - 5, x0, y1 + 5);
  line(x0 + wl, y1 - 5, x0 + wl, y1 + 5);
  noStroke();
  fill(255, 213, 79, 180);
  textSize(11);
  textAlign(CENTER, BOTTOM);
  text('\\u03BB', x0 + wl / 2, y1 - 4);
}

function WC_drawResultantWave(cfg, st, x0, yCenter, col) {
  var waves = WC_getActiveWaves(cfg, st);
  WC_stroke(col, 0.9);
  strokeWeight(2.5);
  noFill();
  beginShape();
  for (var rx = x0; rx <= WC_CW - 40; rx += 2) {
    var ySum = 0;
    for (var ri = 0; ri < waves.length; ri++) {
      var rw = waves[ri];
      var rAmp = rw.amplitude * 60;
      var rWl = rw.wavelength * 80;
      var rFreq = rw.frequency;
      var rPh = rw.phase || 0;
      var rDir = rw.direction === 'left' ? 1 : -1;
      ySum += rAmp * sin((TWO_PI / rWl) * (rx - x0) - (rPh + rDir * WC_time * rFreq * TWO_PI));
    }
    vertex(rx, yCenter + ySum);
  }
  endShape();
}

// ══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════════

function WC_getActiveWaves(cfg, st) {
  if (!cfg.waves || !st.active_waves) return cfg.waves || [];
  var active = [];
  for (var i = 0; i < cfg.waves.length; i++) {
    if (st.active_waves.indexOf(cfg.waves[i].id) !== -1) {
      active.push(cfg.waves[i]);
    }
  }
  return active;
}

function WC_drawCaption(st) {
  var cap = st.caption || st.label || WC_state;
  textSize(12);
  var tw = textWidth(cap);
  noStroke();
  fill(0, 0, 0, 160);
  rect(8, WC_CH - 32, tw + 20, 24, 6);
  fill(200, 200, 210, 220);
  textAlign(LEFT, CENTER);
  text(cap, 18, WC_CH - 20);
}

function WC_drawBorderFlash() {
  if (WC_state !== WC_prevSt) {
    WC_flash = 1.0;
    WC_prevSt = WC_state;
  }
  if (WC_flash > 0) {
    noFill();
    stroke(59, 130, 246, WC_flash * 0.6 * 255);
    strokeWeight(3);
    rect(1, 1, width - 2, height - 2, 4);
    noStroke();
    WC_flash -= 0.025;
  }
}

function WC_updateLegend(cfg, st) {
  var el = document.getElementById('legend');
  if (!el) return;

  var scenario = (cfg.scenario_type || '').toLowerCase();
  var lines = [];

  lines.push('<b>' + (st.label || WC_state) + '</b>');

  if (scenario === 'transverse_wave') {
    lines.push('Particle motion: \\u2195 (perpendicular)');
    lines.push('Wave propagation: \\u2192');
  } else if (scenario === 'longitudinal_wave') {
    lines.push('C = compression, R = rarefaction');
    lines.push('Particles vibrate \\u2194 along wave direction');
  } else if (scenario === 'standing_wave') {
    lines.push('<span style="color:#EF5350">\\u25CF</span> N = node (zero displacement)');
    lines.push('<span style="color:#66BB6A">\\u25CF</span> A = antinode (max displacement)');
  } else if (scenario === 'superposition') {
    lines.push('y = y\\u2081 + y\\u2082 (algebraic sum)');
  } else if (scenario === 'beats') {
    var wvs = cfg.waves || [];
    if (wvs.length >= 2) {
      lines.push('f\\u2081 = ' + wvs[0].frequency.toFixed(1) + ' Hz');
      lines.push('f\\u2082 = ' + wvs[1].frequency.toFixed(1) + ' Hz');
      lines.push('Beat freq = ' + abs(wvs[0].frequency - wvs[1].frequency).toFixed(1) + ' Hz');
    }
  } else if (scenario === 'doppler_moving') {
    lines.push('Wave speed v = constant');
    lines.push('Only \\u03BB and f\\u2032 change');
  }

  el.innerHTML = lines.join('<br>');
}

// ── postMessage bridge ───────────────────────────────────────
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.type) return;

  if (e.data.type === 'INIT_CONFIG') {
    window.SIM_CONFIG = e.data.config;
    WC_cfg = e.data.config;
    WC_state = 'STATE_1';
    WC_time = 0;
    console.log('[WaveCanvas] INIT_CONFIG received');
    parent.postMessage({ type: 'SIM_READY' }, '*');
  }

  if (e.data.type === 'SET_STATE') {
    var ns = e.data.state;
    if (WC_cfg && WC_cfg.states && WC_cfg.states[ns]) {
      WC_state = ns;
      console.log('[WaveCanvas] SET_STATE \\u2192', ns);
      parent.postMessage({ type: 'STATE_REACHED', state: ns }, '*');
    }
  }

  if (e.data.type === 'PING') {
    parent.postMessage({ type: 'PONG' }, '*');
  }
});
`;
