// =============================================================================
// ohms_law_renderer.js — PhysicsMind Ohm's Law Primary Panel Renderer
// Engineer-written. NOT AI-generated.
// Reads window.SIM_CONFIG and renders a macroscopic Ohm's law simulation.
//
// Physics: R = ρL/A   I = V/R
// Visual: conductor rod whose length and area change visually
// States:
//   STATE_1 — conductor visible, no current, no field
//   STATE_2 — current arrows animate, ammeter shows I
//   STATE_3 — second conductor for R comparison (different L or A)
//   STATE_4 — sliders visible, student adjusts L, A, V live
//
// postMessage API:
//   receives: { type: 'SET_STATE', state: 'STATE_N' }
//   sends:    { type: 'SIM_READY', states: [...] }
//             { type: 'STATE_REACHED', state: 'STATE_N' }
// =============================================================================

(function () {
  // ── Config ──────────────────────────────────────────────────────────────────
  var cfg = window.SIM_CONFIG || {};
  var pvl = cfg.pvl_colors || {};

  var BG       = pvl.background || '#0A0A1A';
  var COPPER   = pvl.conductor  || '#B87333';
  var ARROW_C  = pvl.arrow      || '#FF9800';
  var AMM_C    = pvl.ammeter    || '#42A5F5';
  var TEXT_C   = '#D4D4D8';
  var WHITE_C  = '#FFFFFF';

  // ── Mutable sim state (sliders update these directly) ───────────────────────
  var simL   = cfg.conductor_length || 2.0;   // metres (display units 0.5–5)
  var simA   = cfg.conductor_area   || 2.0;   // m² (display units 0.5–5)
  var simV   = cfg.voltage          || 6.0;   // volts
  var simRho = cfg.resistivity      || 2.0;   // ρ (display constant)

  // ── Visual state (driven by STATE) ──────────────────────────────────────────
  var showArrows     = false;
  var showComparison = false;
  var showSliders    = false;
  var arrowPhase     = 0;
  var currentState   = 'STATE_1';

  // ── Physics helpers ─────────────────────────────────────────────────────────
  function calcR(L, A) { return simRho * L / Math.max(A, 0.01); }
  function calcI(V, R) { return R > 0 ? V / R : 0; }

  // ── Visual size mapping ─────────────────────────────────────────────────────
  // conductor_length 0.5–5 → visual width 80–360 px
  function visW(L) { return 80 + ((L - 0.5) / 4.5) * 280; }
  // conductor_area 0.5–5 → visual height 10–38 px
  function visH(A) { return 10 + ((A - 0.5) / 4.5) * 28; }

  // ── p5 sketch ───────────────────────────────────────────────────────────────
  new p5(function (p) {

    p.setup = function () {
      var cnv = p.createCanvas(800, 420);
      cnv.parent('sketch-container');
      p.frameRate(60);
      p.textFont('monospace');
      buildSliders(p);
      parent.postMessage(
        { type: 'SIM_READY', states: ['STATE_1', 'STATE_2', 'STATE_3', 'STATE_4'] },
        '*'
      );
      console.log('PM:SIM_READY');
    };

    p.draw = function () {
      p.background(BG);

      // Advance arrow animation
      if (showArrows) {
        var R0   = calcR(simL, simA);
        var I0   = calcI(simV, R0);
        var spd  = Math.max(0.2, Math.min(2.5, (I0 / 15) * 2.5));
        arrowPhase = (arrowPhase + spd) % 60;
      }

      if (showComparison && cfg.show_comparison !== false) {
        // STATE_3: two separate circuits — same V, different dimensions
        drawCircuit(p, simL, simA, simV, 115, true, 0);
        var L2 = cfg.comparison_length || simL * 2.0;
        var A2 = cfg.comparison_area   || simA;
        drawCircuit(p, L2, A2, simV, 295, true, 28);
        drawComparisonLabel(p);
      } else {
        // STATE_1 / STATE_2 / STATE_4: single conductor centred
        drawCircuit(p, simL, simA, simV, 190, showArrows, 0);
      }

      // State label at very bottom
      var stateData = ((cfg.states || {})[currentState]) || {};
      p.noStroke();
      p.fill(TEXT_C);
      p.textSize(12);
      p.textAlign(p.CENTER);
      p.text(stateData.label || '', 400, 412);

      // Sliders panel visibility
      var ctrl = document.getElementById('controls');
      if (ctrl) ctrl.style.display = showSliders ? 'flex' : 'none';
    };

    // ── Full circuit (battery → conductor → ammeter + return wire) ────────────
    function drawCircuit(p, L, A, V, cy, animated, phaseOff) {
      var R   = calcR(L, A);
      var I   = calcI(V, R);
      var cW  = visW(L);
      var cH  = visH(A);

      // Fixed x positions regardless of conductor size
      var battCX  = 55;    // battery centre-x
      var condX   = 100;   // conductor left edge
      var condEnd = condX + cW;
      var ammCX   = condEnd + 50;  // ammeter centre-x
      var retY    = cy + 58;       // return wire y

      // ── Wires ──────────────────────────────────────────────────────────────
      p.stroke(TEXT_C);
      p.strokeWeight(2);
      // top: battery → conductor
      p.line(battCX + 20, cy, condX, cy);
      // top: conductor → ammeter
      p.line(condEnd, cy, ammCX - 22, cy);
      // right down to return wire
      p.line(ammCX + 22, cy, ammCX + 22, retY);
      // return (bottom)
      p.line(battCX - 20, retY, ammCX + 22, retY);
      // left up to battery
      p.line(battCX - 20, cy, battCX - 20, retY);

      // ── Elements ───────────────────────────────────────────────────────────
      drawBattery(p, battCX, cy, V);
      drawConductor(p, condX, cy, cW, cH, L, A, R);
      if (animated) drawArrows(p, condX, cy, cW, cH, phaseOff);
      drawAmmeter(p, ammCX, cy, I);
    }

    // ── Conductor rod ─────────────────────────────────────────────────────────
    function drawConductor(p, x, cy, cW, cH, L, A, R) {
      var top = cy - cH / 2;

      // Drop shadow
      p.noStroke();
      p.fill(0, 0, 0, 55);
      p.rect(x + 3, top + 3, cW, cH, 4);

      // Main body (copper)
      p.fill(COPPER);
      p.rect(x, top, cW, cH, 4);

      // Top glint
      p.fill(255, 255, 255, 45);
      p.rect(x + 3, top + 2, cW - 6, cH * 0.32, 3, 3, 0, 0);

      // Left end cap (dark ellipse — gives cylinder depth)
      p.fill(80, 45, 10);
      p.ellipse(x, cy, Math.max(4, cH * 0.45), cH);

      // Right end cap (lighter)
      p.fill(COPPER);
      p.ellipse(x + cW, cy, Math.max(4, cH * 0.45), cH);

      // ── R label above ──────────────────────────────────────────────────────
      p.noStroke();
      p.fill(ARROW_C);
      p.textSize(13);
      p.textAlign(p.CENTER);
      p.text('R = ' + R.toFixed(2) + ' \u03A9', x + cW / 2, top - 10);

      // ── L label below (with dimension arrow) ──────────────────────────────
      p.fill(TEXT_C);
      p.textSize(11);
      p.textAlign(p.CENTER);
      p.text('L = ' + L.toFixed(1) + ' m', x + cW / 2, cy + cH / 2 + 17);

      // dimension ticks
      p.stroke(TEXT_C);
      p.strokeWeight(1);
      var arrowY = cy + cH / 2 + 28;
      p.line(x, arrowY, x + cW, arrowY);
      p.line(x, arrowY - 4, x, arrowY + 4);
      p.line(x + cW, arrowY - 4, x + cW, arrowY + 4);

      // ── A label left (rotated) ─────────────────────────────────────────────
      p.noStroke();
      p.fill(TEXT_C);
      p.textSize(11);
      p.push();
      p.translate(x - 22, cy);
      p.rotate(-p.HALF_PI);
      p.textAlign(p.CENTER);
      p.text('A = ' + A.toFixed(1) + ' m\u00B2', 0, 0);
      p.pop();
    }

    // ── Current arrows (moving right = conventional current direction) ─────────
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
        // Arrowhead pointing right
        p.noStroke();
        p.triangle(
          aSize, 0,
          -aSize * 0.65, -aSize * 0.65,
          -aSize * 0.65,  aSize * 0.65
        );
        // Shaft
        p.stroke(ARROW_C);
        p.line(-aSize * 0.65, 0, -aSize * 1.6, 0);
        p.pop();
      }
    }

    // ── Battery symbol ────────────────────────────────────────────────────────
    function drawBattery(p, cx, cy, V) {
      // Four vertical lines: long, short, long, short (standard battery symbol)
      var offsets = [
        { x: -18, h: 14 },  // long  (+)
        { x: -10, h: 9  },  // short (-)
        { x:  -2, h: 14 },  // long
        { x:   6, h: 9  },  // short
      ];
      p.strokeWeight(2);
      offsets.forEach(function (o) {
        p.stroke(TEXT_C);
        p.line(cx + o.x, cy - o.h, cx + o.x, cy + o.h);
      });

      // Connecting wire (right terminal to circuit)
      p.stroke(TEXT_C);
      p.line(cx + 6, cy, cx + 20, cy);

      // Voltage label above
      p.noStroke();
      p.fill(AMM_C);
      p.textSize(13);
      p.textAlign(p.CENTER);
      p.text(V.toFixed(0) + ' V', cx - 6, cy - 22);

      // + / - labels
      p.fill('#66BB6A');
      p.textSize(11);
      p.textAlign(p.CENTER);
      p.text('+', cx - 18, cy - 18);
      p.fill('#EF5350');
      p.text('\u2212', cx + 6, cy - 18);
    }

    // ── Ammeter ───────────────────────────────────────────────────────────────
    function drawAmmeter(p, cx, cy, I) {
      var r = 22;
      // Ring
      p.stroke(AMM_C);
      p.strokeWeight(2);
      p.noFill();
      p.ellipse(cx, cy, r * 2, r * 2);
      // Label
      p.noStroke();
      p.fill(AMM_C);
      p.textSize(11);
      p.textAlign(p.CENTER);
      p.text('A', cx, cy - 4);
      // Current reading
      p.fill(WHITE_C);
      p.textSize(11);
      p.text(I.toFixed(2) + ' A', cx, cy + 12);
    }

    // ── Comparison label (STATE_3) ─────────────────────────────────────────────
    function drawComparisonLabel(p) {
      p.noStroke();
      p.fill(TEXT_C);
      p.textSize(12);
      p.textAlign(p.CENTER);
      p.text('Same voltage V \u2014 different wire \u2192 different R \u2192 different I', 400, 210);
    }

    // ── Build DOM sliders (STATE_4) ───────────────────────────────────────────
    function buildSliders(p) {
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
      makeRow('Area A (m\u00B2)', 0.5, 5, 0.1, simA, function (v) { simA = v; });
    }

  }); // end new p5

  // ── State machine (global — called by postMessage handler) ─────────────────
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

  // Apply initial state
  window.applySimState('STATE_1');

})();
