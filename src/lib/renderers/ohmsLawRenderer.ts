// =============================================================================
// ohmsLawRenderer.ts
// Config schema (OhmsLawConfig) + assembler (assembleOhmsLawHTML).
// The renderer code is embedded as a string constant — same pattern as
// particle_field_renderer.ts and graph_interactive_renderer.ts.
//
// Usage in pipeline:
//   1. Sonnet writes an OhmsLawConfig JSON (values only, no rendering code)
//   2. assembleOhmsLawHTML(config) injects it and returns complete HTML
//   3. Zero AI writes any rendering logic
// =============================================================================

// =============================================================================
// CONFIG SCHEMA
// =============================================================================

export interface OhmsLawConfig {
    /** Wire length — display units 0.5–5 (maps to visual width 80–360 px) */
    conductor_length: number;
    /** Cross-section area — display units 0.5–5 (maps to visual height 10–38 px) */
    conductor_area: number;
    /** Applied voltage in volts (1–12 V) */
    voltage: number;
    /** Display resistivity constant — R = resistivity * L / A  (default 2.0) */
    resistivity: number;
    /** STATE_3: show a second conductor below for resistance comparison */
    show_comparison: boolean;
    /** Comparison wire length (if show_comparison = true) */
    comparison_length?: number;
    /** Comparison wire area (if show_comparison = true) */
    comparison_area?: number;
    states: {
        STATE_1: { label: string };
        STATE_2: { label: string; point_voltage: number; point_current: number };
        STATE_3: { label: string };
        STATE_4: { label: string };
    };
    pvl_colors: {
        background: string;   // canvas bg
        conductor:  string;   // wire rod colour
        arrow:      string;   // current arrow colour
        ammeter:    string;   // ammeter ring colour
    };
}

// Sonnet-facing schema description (injected into Stage 2 prompt)
export const OHMS_LAW_CONFIG_SCHEMA = `
OhmsLawConfig {
  conductor_length: number   // 0.5–5 (display units; 2.0 = medium wire)
  conductor_area:   number   // 0.5–5 (display units; 2.0 = medium thickness)
  voltage:          number   // 1–12  (volts)
  resistivity:      number   // MUST be 2.0 (fixed educational constant)
  show_comparison:  boolean  // true  (STATE_3 shows second conductor)
  comparison_length: number  // > conductor_length to show higher R
  comparison_area:   number  // same as conductor_area for fair L comparison
  states: {
    STATE_1: { label: "one sentence — static view, no current" }
    STATE_2: { label: "one sentence — current flows, ammeter reads I",
               point_voltage: <same as voltage>,
               point_current: <voltage / (2.0 * conductor_length / conductor_area)> }
    STATE_3: { label: "one sentence — compare two wires, different R" }
    STATE_4: { label: "one sentence — student drags sliders" }
  }
  pvl_colors: {
    background: "#0A0A1A"
    conductor:  "#B87333"
    arrow:      "#FF9800"
    ammeter:    "#42A5F5"
  }
}
`.trim();

// Hardcoded fallback used if Sonnet fails twice
export const OHMS_LAW_CONFIG_FALLBACK: OhmsLawConfig = {
    conductor_length: 2.0,
    conductor_area:   2.0,
    voltage:          6.0,
    resistivity:      2.0,
    show_comparison:  true,
    comparison_length: 4.0,
    comparison_area:   2.0,
    states: {
        STATE_1: {
            label: "A copper wire sits in the circuit — no voltage applied yet, no current flows.",
        },
        STATE_2: {
            label: "6 V applied — current arrows flow through the 2 m wire. Ammeter reads I = V/R.",
            point_voltage: 6,
            point_current: 3,
        },
        STATE_3: {
            label: "Same 6 V, but the longer wire has more resistance — the ammeter reads less current.",
        },
        STATE_4: {
            label: "Drag the sliders — change length, area, or voltage and watch R and I update live.",
        },
    },
    pvl_colors: {
        background: "#0A0A1A",
        conductor:  "#B87333",
        arrow:      "#FF9800",
        ammeter:    "#42A5F5",
    },
};

// =============================================================================
// RENDERER CODE STRING
// Copy of /public/renderers/ohms_law_renderer.js — kept in sync manually.
// The server embeds this string into the iframe HTML at request time.
// Never auto-generated. Edit both files together when changing renderer logic.
// =============================================================================

export const OHMS_LAW_RENDERER_CODE = `
(function () {
  var cfg = window.SIM_CONFIG || {};
  var pvl = cfg.pvl_colors || {};

  var BG       = pvl.background || '#0A0A1A';
  var COPPER   = pvl.conductor  || '#B87333';
  var ARROW_C  = pvl.arrow      || '#FF9800';
  var AMM_C    = pvl.ammeter    || '#42A5F5';
  var TEXT_C   = '#D4D4D8';
  var WHITE_C  = '#FFFFFF';

  var simL   = cfg.conductor_length || 2.0;
  var simA   = cfg.conductor_area   || 2.0;
  var simV   = cfg.voltage          || 6.0;
  var simRho = cfg.resistivity      || 2.0;

  var showArrows     = false;
  var showComparison = false;
  var showSliders    = false;
  var arrowPhase     = 0;
  var currentState   = 'STATE_1';

  function calcR(L, A) { return simRho * L / Math.max(A, 0.01); }
  function calcI(V, R) { return R > 0 ? V / R : 0; }
  function visW(L) { return 80 + ((L - 0.5) / 4.5) * 280; }
  function visH(A) { return 10 + ((A - 0.5) / 4.5) * 28; }

  new p5(function (p) {

    p.setup = function () {
      var cnv = p.createCanvas(800, 420);
      cnv.parent('sketch-container');
      p.frameRate(60);
      p.textFont('monospace');
      buildSliders();
      parent.postMessage(
        { type: 'SIM_READY', states: ['STATE_1', 'STATE_2', 'STATE_3', 'STATE_4'] },
        '*'
      );
      console.log('PM:SIM_READY');
    };

    p.draw = function () {
      p.background(BG);

      if (showArrows) {
        var R0  = calcR(simL, simA);
        var I0  = calcI(simV, R0);
        var spd = Math.max(0.2, Math.min(2.5, (I0 / 15) * 2.5));
        arrowPhase = (arrowPhase + spd) % 60;
      }

      if (showComparison && cfg.show_comparison !== false) {
        drawCircuit(p, simL, simA, simV, 115, true, 0);
        var L2 = cfg.comparison_length || simL * 2.0;
        var A2 = cfg.comparison_area   || simA;
        drawCircuit(p, L2, A2, simV, 295, true, 28);
        drawComparisonLabel(p);
      } else {
        drawCircuit(p, simL, simA, simV, 190, showArrows, 0);
      }

      var stateData = ((cfg.states || {})[currentState]) || {};
      p.noStroke();
      p.fill(TEXT_C);
      p.textSize(12);
      p.textAlign(p.CENTER);
      p.text(stateData.label || '', 400, 412);

      var ctrl = document.getElementById('controls');
      if (ctrl) ctrl.style.display = showSliders ? 'flex' : 'none';
    };

    function drawCircuit(p, L, A, V, cy, animated, phaseOff) {
      var R   = calcR(L, A);
      var I   = calcI(V, R);
      var cW  = visW(L);
      var cH  = visH(A);

      var battCX  = 55;
      var condX   = 100;
      var condEnd = condX + cW;
      var ammCX   = condEnd + 50;
      var retY    = cy + 58;

      p.stroke(TEXT_C);
      p.strokeWeight(2);
      p.line(battCX + 20, cy, condX, cy);
      p.line(condEnd, cy, ammCX - 22, cy);
      p.line(ammCX + 22, cy, ammCX + 22, retY);
      p.line(battCX - 20, retY, ammCX + 22, retY);
      p.line(battCX - 20, cy, battCX - 20, retY);

      drawBattery(p, battCX, cy, V);
      drawConductor(p, condX, cy, cW, cH, L, A, R);
      if (animated) drawArrows(p, condX, cy, cW, cH, phaseOff);
      drawAmmeter(p, ammCX, cy, I);
    }

    function drawConductor(p, x, cy, cW, cH, L, A, R) {
      var top = cy - cH / 2;

      p.noStroke();
      p.fill(0, 0, 0, 55);
      p.rect(x + 3, top + 3, cW, cH, 4);

      p.fill(COPPER);
      p.rect(x, top, cW, cH, 4);

      p.fill(255, 255, 255, 45);
      p.rect(x + 3, top + 2, cW - 6, cH * 0.32, 3, 3, 0, 0);

      p.fill(80, 45, 10);
      p.ellipse(x, cy, Math.max(4, cH * 0.45), cH);

      p.fill(COPPER);
      p.ellipse(x + cW, cy, Math.max(4, cH * 0.45), cH);

      p.noStroke();
      p.fill(ARROW_C);
      p.textSize(13);
      p.textAlign(p.CENTER);
      p.text('R = ' + R.toFixed(2) + ' \\u03A9', x + cW / 2, top - 10);

      p.fill(TEXT_C);
      p.textSize(11);
      p.textAlign(p.CENTER);
      p.text('L = ' + L.toFixed(1) + ' m', x + cW / 2, cy + cH / 2 + 17);

      p.stroke(TEXT_C);
      p.strokeWeight(1);
      var arrowY = cy + cH / 2 + 28;
      p.line(x, arrowY, x + cW, arrowY);
      p.line(x, arrowY - 4, x, arrowY + 4);
      p.line(x + cW, arrowY - 4, x + cW, arrowY + 4);

      p.noStroke();
      p.fill(TEXT_C);
      p.textSize(11);
      p.push();
      p.translate(x - 22, cy);
      p.rotate(-p.HALF_PI);
      p.textAlign(p.CENTER);
      p.text('A = ' + A.toFixed(1) + ' m\\u00B2', 0, 0);
      p.pop();
    }

    function drawArrows(p, condX, cy, cW, cH, phaseOff) {
      var spacing = 50;
      var phase   = (arrowPhase + phaseOff) % spacing;
      var aSize   = Math.max(4, Math.min(cH * 0.38, 8));

      p.fill(ARROW_C);
      p.stroke(ARROW_C);
      p.strokeWeight(1.5);

      for (var ax = condX + phase + 6; ax < condX + cW - 14; ax += spacing) {
        p.push();
        p.translate(ax, cy);
        p.noStroke();
        p.triangle(
          aSize, 0,
          -aSize * 0.65, -aSize * 0.65,
          -aSize * 0.65,  aSize * 0.65
        );
        p.stroke(ARROW_C);
        p.line(-aSize * 0.65, 0, -aSize * 1.6, 0);
        p.pop();
      }
    }

    function drawBattery(p, cx, cy, V) {
      var offsets = [
        { x: -18, h: 14 },
        { x: -10, h: 9  },
        { x:  -2, h: 14 },
        { x:   6, h: 9  },
      ];
      p.strokeWeight(2);
      offsets.forEach(function (o) {
        p.stroke(TEXT_C);
        p.line(cx + o.x, cy - o.h, cx + o.x, cy + o.h);
      });
      p.stroke(TEXT_C);
      p.line(cx + 6, cy, cx + 20, cy);
      p.noStroke();
      p.fill(AMM_C);
      p.textSize(13);
      p.textAlign(p.CENTER);
      p.text(V.toFixed(0) + ' V', cx - 6, cy - 22);
      p.fill('#66BB6A');
      p.textSize(11);
      p.textAlign(p.CENTER);
      p.text('+', cx - 18, cy - 18);
      p.fill('#EF5350');
      p.text('\\u2212', cx + 6, cy - 18);
    }

    function drawAmmeter(p, cx, cy, I) {
      var r = 22;
      p.stroke(AMM_C);
      p.strokeWeight(2);
      p.noFill();
      p.ellipse(cx, cy, r * 2, r * 2);
      p.noStroke();
      p.fill(AMM_C);
      p.textSize(11);
      p.textAlign(p.CENTER);
      p.text('A', cx, cy - 4);
      p.fill(WHITE_C);
      p.textSize(11);
      p.text(I.toFixed(2) + ' A', cx, cy + 12);
    }

    function drawComparisonLabel(p) {
      p.noStroke();
      p.fill(TEXT_C);
      p.textSize(12);
      p.textAlign(p.CENTER);
      p.text('Same voltage V \\u2014 different wire \\u2192 different R \\u2192 different I', 400, 210);
    }

    function buildSliders() {
      var ctrl = document.getElementById('controls');
      if (!ctrl) return;
      ctrl.innerHTML = '';

      function makeRow(labelTxt, min, max, step, initVal, onUpdate) {
        var row = document.createElement('div');
        row.className = 'slider-row';
        var lbl = document.createElement('label');
        lbl.textContent = labelTxt + ': ' + initVal.toFixed(2);
        var inp = document.createElement('input');
        inp.type = 'range';
        inp.min = String(min);
        inp.max = String(max);
        inp.step = String(step);
        inp.value = String(initVal);
        inp.oninput = function () {
          var v = parseFloat(this.value);
          lbl.textContent = labelTxt + ': ' + v.toFixed(2);
          onUpdate(v);
        };
        row.appendChild(lbl);
        row.appendChild(inp);
        ctrl.appendChild(row);
      }

      makeRow('Voltage (V)', 1, 12, 0.5, simV, function (v) { simV = v; });
      makeRow('Length L (m)', 0.5, 5, 0.1, simL, function (v) { simL = v; });
      makeRow('Area A (m\\u00B2)', 0.5, 5, 0.1, simA, function (v) { simA = v; });
    }

  }); // end new p5

  window.applySimState = function (s) {
    currentState = s;
    if (s === 'STATE_1') {
      showArrows = false; showComparison = false; showSliders = false;
    } else if (s === 'STATE_2') {
      showArrows = true;  showComparison = false; showSliders = false;
    } else if (s === 'STATE_3') {
      showArrows = true;  showComparison = true;  showSliders = false;
    } else if (s === 'STATE_4') {
      showArrows = true;  showComparison = false; showSliders = true;
    }
  };

  function _applyState(s) {
    window.applySimState(s);
    parent.postMessage({ type: 'STATE_REACHED', state: s }, '*');
  }

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'SET_STATE') _applyState(e.data.state);
  });

  window.applySimState('STATE_1');

})();
`;

// =============================================================================
// ASSEMBLER
// =============================================================================

/**
 * Assembles a complete iframe HTML document for the Ohm's Law primary panel.
 * Injects the config as window.SIM_CONFIG then runs the pre-built renderer.
 * No AI generates any part of this output.
 */
export function assembleOhmsLawHTML(config: OhmsLawConfig): string {
    const bg = config.pvl_colors?.background ?? "#0A0A1A";
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
html, body {
  margin: 0; padding: 0; overflow: hidden;
  background: ${bg};
  font-family: monospace;
  display: flex; flex-direction: column;
}
#sketch-container { flex: 0 0 auto; }
#controls {
  display: none;
  flex-direction: column;
  gap: 6px;
  padding: 8px 20px;
  background: #0F0F1F;
  border-top: 1px solid #1E1E2E;
}
.slider-row {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: #D4D4D8;
}
.slider-row label { min-width: 180px; }
.slider-row input[type=range] { flex: 1; accent-color: #FF9800; cursor: pointer; }
</style>
</head><body>
<div id="sketch-container"></div>
<div id="controls"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
<\/script>
<script>
${OHMS_LAW_RENDERER_CODE}
<\/script>
</body></html>`;
}
