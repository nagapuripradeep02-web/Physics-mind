// =============================================================================
// circuit_live_renderer.js — PhysicsMind Flexible Circuit Renderer
// Reads window.SIM_CONFIG and draws any circuit described in the config.
// Uses raw HTML5 Canvas 2D API — no p5.js dependency.
//
// postMessage API:
//   receives: { type: 'SET_STATE', state: 'STATE_N' }
//             { type: 'PING' }
//   sends:    { type: 'SIM_READY', states: ['STATE_1','STATE_2','STATE_3','STATE_4'] }
//             { type: 'STATE_REACHED', state: 'STATE_N' }
//             { type: 'PONG' }
// =============================================================================

(function () {
  'use strict';

  // ── PVL Color Palette (non-negotiable) ──────────────────────────────────────
  var C = {
    bg:           '#0A0A1A',
    wire:         '#546E7A',
    arrow:        '#42A5F5',
    resistor:     '#90A4AE',
    spot:         '#FFFFFF',
    voltage:      '#FF9800',
    current:      '#66BB6A',
    text:         '#D4D4D8',
    battery:      '#FFB300',
    capacitor:    '#80CBC4',
    meter_a:      '#66BB6A',
    meter_v:      '#FF9800',
    meter_g:      '#CE93D8',
    switch_open:  '#EF9A9A',
    switch_closed:'#66BB6A',
    bulb_off:     '#90A4AE',
    bulb_on:      '#FFE082',
    junction:     '#60A5FA',
    DIM:          0.18,
  };

  // ── Config ──────────────────────────────────────────────────────────────────
  var cfg     = window.SIM_CONFIG || {};
  var circuit = cfg.circuit || { topology: 'series', nodes: [], components: [] };

  // ── Canvas setup ────────────────────────────────────────────────────────────
  var CW = 800, CH = 500;
  var canvas = document.createElement('canvas');
  canvas.width  = CW;
  canvas.height = CH;
  canvas.style.display = 'block';
  var container = document.getElementById('sketch-container') || document.body;
  container.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  // ── Layout state ────────────────────────────────────────────────────────────
  var nodePositions  = {};   // nodeId → {x, y}
  var parallelOffsets = {};  // compId → number (pixels, perpendicular)

  // ── Current arrow particles ──────────────────────────────────────────────────
  var arrowParticles = [];

  // ── Slider DOM ──────────────────────────────────────────────────────────────
  var sliderEl    = null;
  var sliderValEl = null;
  var sliderState = null;

  // ── State engine ────────────────────────────────────────────────────────────
  var PM_currentState = 'STATE_1';
  var stateVars = {
    currentFlowing:  false,
    caption:         '',
    visibleComponents: null,
    spotlight:       null,
    showValues:      false,
    showVoltageDrop: false,
    sliderActive:    false,
    currentValues:   {},
    voltageDrops:    {},
    formulaHighlights: [],
  };

  // ── Wire topology animated state ─────────────────────────────────────────────
  var wireTopologyState = {
    jockeyX:        400,  // current pixel position (animated) — start at centre
    jockeyXTarget:  400,  // destination pixel position
    animFrom:       400,  // pixel position when animation started
    animStart:       0,   // performance.now() timestamp, 0 = idle
    animDuration:  600,   // ms
    driverEmf:       6,   // driver cell EMF (V)
    testEmf:         3,   // test cell EMF (V)
    galvDeflection:  0,   // -1 (left) … 0 (balanced) … +1 (right)
  };
  var wireCurrentT = 0;   // px offset around the driver loop (for current arrows)

  // ============================================================================
  // SYSTEM 2 — LAYOUT ENGINE
  // ============================================================================

  function buildCompMap() {
    var m = {};
    (circuit.components || []).forEach(function (c) { m[c.id] = c; });
    return m;
  }

  function computeLayout() {
    var topology = (circuit.topology || 'series').toLowerCase();
    var nodes    = circuit.nodes || [];
    var pos      = {};

    if (topology === 'custom') {
      var np = cfg.node_positions || {};
      nodes.forEach(function (nid) {
        pos[nid] = { x: (np[nid] || {}).x || 400, y: (np[nid] || {}).y || 240 };
      });
      return pos;
    }

    if (topology === 'bridge') {
      // Wheatstone diamond
      var bNodes = nodes.length >= 4 ? nodes : ['A','B','C','D'];
      pos[bNodes[0]] = { x: 140, y: 235 };  // left
      pos[bNodes[1]] = { x: 400, y: 95  };  // top
      pos[bNodes[2]] = { x: 660, y: 235 };  // right
      pos[bNodes[3]] = { x: 400, y: 375 };  // bottom
      return pos;
    }

    if (topology === 'parallel') {
      // Two terminal nodes for parallel circuits
      var pNodes = nodes.length >= 2 ? nodes : ['A','B'];
      pos[pNodes[0]] = { x: 140, y: 235 };
      pos[pNodes[1]] = { x: 660, y: 235 };
      // Extra nodes (branch junctions) get vertical spacing
      for (var pi = 2; pi < pNodes.length; pi++) {
        pos[pNodes[pi]] = { x: 400, y: 100 + (pi - 2) * 100 };
      }
      return pos;
    }

    if (topology === 'ladder') {
      var lNodes = nodes.length > 0 ? nodes : ['A','B'];
      var topY    = 150;
      var botY    = 370;
      var xStart  = 130;
      var xEnd    = 670;
      var count   = lNodes.length;
      lNodes.forEach(function (nid, i) {
        var xFrac = count > 1 ? i / (count - 1) : 0.5;
        var x     = xStart + xFrac * (xEnd - xStart);
        var y     = (i % 2 === 0) ? topY : botY;
        pos[nid]  = { x: x, y: y };
      });
      return pos;
    }

    if (topology === 'wire') {
      // A and C match the fixed layout constants in drawWireTopology()
      var wNodes = nodes.length >= 2 ? nodes : ['A', 'C'];
      pos[wNodes[0]] = { x: 90,  y: 145 };
      pos[wNodes[1]] = { x: 710, y: 145 };
      return pos;
    }

    // Default: series — distribute nodes clockwise around a rectangle
    // Rectangle corners: (130,100), (680,100), (680,370), (130,370)
    var sNodes = nodes.length > 0 ? nodes : ['A'];
    var N      = sNodes.length;

    if (N === 1) {
      pos[sNodes[0]] = { x: 400, y: 235 };
      return pos;
    }
    if (N === 2) {
      pos[sNodes[0]] = { x: 130, y: 235 };
      pos[sNodes[1]] = { x: 680, y: 235 };
      return pos;
    }
    if (N === 3) {
      pos[sNodes[0]] = { x: 130, y: 320 };
      pos[sNodes[1]] = { x: 405, y: 90  };
      pos[sNodes[2]] = { x: 680, y: 320 };
      return pos;
    }
    if (N === 4) {
      pos[sNodes[0]] = { x: 130, y: 100 };
      pos[sNodes[1]] = { x: 680, y: 100 };
      pos[sNodes[2]] = { x: 680, y: 370 };
      pos[sNodes[3]] = { x: 130, y: 370 };
      return pos;
    }
    if (N === 5) {
      pos[sNodes[0]] = { x: 130, y: 100 };
      pos[sNodes[1]] = { x: 405, y: 100 };
      pos[sNodes[2]] = { x: 680, y: 100 };
      pos[sNodes[3]] = { x: 680, y: 370 };
      pos[sNodes[4]] = { x: 130, y: 370 };
      return pos;
    }
    if (N === 6) {
      pos[sNodes[0]] = { x: 130, y: 100 };
      pos[sNodes[1]] = { x: 405, y: 100 };
      pos[sNodes[2]] = { x: 680, y: 100 };
      pos[sNodes[3]] = { x: 680, y: 370 };
      pos[sNodes[4]] = { x: 405, y: 370 };
      pos[sNodes[5]] = { x: 130, y: 370 };
      return pos;
    }
    // N > 6: distribute around perimeter
    // Perimeter segments: top, right, bottom (reverse), left (reverse)
    var perimPts = [];
    var steps    = 20;
    // Top: (130,100)→(680,100)
    for (var si = 0; si <= steps; si++) perimPts.push({ x: 130 + si/steps*550, y: 100  });
    // Right: (680,100)→(680,370)
    for (var si = 1; si <= steps; si++) perimPts.push({ x: 680, y: 100 + si/steps*270 });
    // Bottom reverse: (680,370)→(130,370)
    for (var si = 1; si <= steps; si++) perimPts.push({ x: 680 - si/steps*550, y: 370  });
    // Left reverse: (130,370)→(130,100)
    for (var si = 1; si <  steps; si++) perimPts.push({ x: 130, y: 370 - si/steps*270 });
    sNodes.forEach(function (nid, i) {
      var idx = Math.round(i / (N - 1) * (perimPts.length - 1));
      pos[nid] = perimPts[Math.min(idx, perimPts.length - 1)];
    });
    return pos;
  }

  function computeParallelOffsets() {
    var offsets  = {};
    var comps    = circuit.components || [];
    // Group by normalized edge key
    var groups   = {};
    comps.forEach(function (comp) {
      var key = [comp.from, comp.to].sort().join('--');
      if (!groups[key]) groups[key] = [];
      groups[key].push(comp.id);
    });
    Object.keys(groups).forEach(function (key) {
      var ids = groups[key];
      if (ids.length < 2) return;
      var N       = ids.length;
      var spacing = 75;
      ids.forEach(function (id, i) {
        offsets[id] = -spacing * (N - 1) / 2 + i * spacing;
      });
    });
    return offsets;
  }

  // ============================================================================
  // SYSTEM 1 — GEOMETRY HELPER
  // ============================================================================

  function getCompGeom(comp, offset) {
    offset = offset || 0;
    var p1  = nodePositions[comp.from] || { x: 200, y: 250 };
    var p2  = nodePositions[comp.to]   || { x: 600, y: 250 };

    // For bridge topology, route battery around the bottom if it crosses left↔right
    var isBridgeBat = (circuit.topology === 'bridge') && (comp.type === 'battery');
    var isCrosswise = isBridgeBat && (
      (p1.x < 300 && p2.x > 500) || (p2.x < 300 && p1.x > 500)
    );

    if (isCrosswise) {
      // Return a special geom that signals bottom-arc routing; handled in drawBattery
      var cx = (p1.x + p2.x) / 2;
      var routeY = CH - 32;
      return {
        x1: p1.x, y1: p1.y,
        x2: p2.x, y2: p2.y,
        cx: cx,   cy: routeY,
        angle: 0, len: Math.abs(p2.x - p1.x),
        bottomArc: true,
        arcY: routeY,
      };
    }

    var dx  = p2.x - p1.x;
    var dy  = p2.y - p1.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.001) len = 0.001;

    // Perpendicular unit vector
    var perpX = -dy / len;
    var perpY =  dx / len;

    // Shift both endpoints by perpendicular offset
    var ox = perpX * offset;
    var oy = perpY * offset;

    var x1 = p1.x + ox;
    var y1 = p1.y + oy;
    var x2 = p2.x + ox;
    var y2 = p2.y + oy;

    return {
      x1: x1, y1: y1,
      x2: x2, y2: y2,
      cx: (x1 + x2) / 2,
      cy: (y1 + y2) / 2,
      angle: Math.atan2(y2 - y1, x2 - x1),
      len:   len,
    };
  }

  // Body fraction: 42% of total length, centered
  var BODY_FRAC = 0.42;

  // ============================================================================
  // COMPONENT DRAWING FUNCTIONS
  // ============================================================================

  function drawWire(x1, y1, x2, y2, alpha) {
    ctx.save();
    ctx.globalAlpha  = (alpha !== undefined) ? alpha : 1;
    ctx.strokeStyle  = C.wire;
    ctx.lineWidth    = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function drawJunction(x, y) {
    ctx.save();
    ctx.fillStyle = C.junction;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw label text in current transform — always un-rotated
  function drawLabel(text, cx, cy, offsetY, color, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-angle);
    ctx.fillStyle   = color || C.text;
    ctx.font        = '11px sans-serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, offsetY || -18);
    ctx.restore();
  }

  function drawResistor(geom, label, opts) {
    opts = opts || {};
    var g = geom;
    ctx.save();
    if (opts.dimmed) ctx.globalAlpha = C.DIM;

    var bodyLen    = g.len * BODY_FRAC;
    var bodyH      = 20;
    var leadLen    = (g.len - bodyLen) / 2;

    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.angle);

    // Lead left
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(-g.len / 2, 0);
    ctx.lineTo(-bodyLen / 2, 0);
    ctx.stroke();

    // Lead right
    ctx.beginPath();
    ctx.moveTo(bodyLen / 2, 0);
    ctx.lineTo(g.len / 2, 0);
    ctx.stroke();

    // Resistor body (rectangle)
    if (opts.spotlight) {
      ctx.shadowColor = C.spot;
      ctx.shadowBlur  = 16;
      ctx.strokeStyle = C.spot;
      ctx.fillStyle   = 'rgba(144,164,174,0.25)';
    } else {
      ctx.strokeStyle = C.resistor;
      ctx.fillStyle   = 'rgba(144,164,174,0.18)';
    }
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-bodyLen / 2, -bodyH / 2, bodyLen, bodyH);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label above body (un-rotated)
    ctx.rotate(-g.angle);
    var labelColor = opts.spotlight ? C.spot : C.text;
    ctx.fillStyle    = labelColor;
    ctx.font         = '11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (label) ctx.fillText(label, 0, -bodyH / 2 - 8);

    // Show current below
    if (opts.showCurrent && opts.currentVal !== undefined) {
      ctx.fillStyle = C.current;
      ctx.font      = '10px sans-serif';
      ctx.fillText(opts.currentVal.toFixed(2) + ' A', 0, bodyH / 2 + 12);
    }

    // Show voltage drop below
    if (opts.showVoltage && opts.voltageVal !== undefined) {
      ctx.fillStyle = C.voltage;
      ctx.font      = '10px sans-serif';
      ctx.fillText(opts.voltageVal.toFixed(1) + ' V', 0, bodyH / 2 + 12);
    }

    ctx.restore();
  }

  function drawBattery(geom, label, opts) {
    opts = opts || {};
    ctx.save();
    if (opts.dimmed) ctx.globalAlpha = C.DIM;

    // Handle bridge bottom-arc routing
    if (geom.bottomArc) {
      var arcY  = geom.arcY;
      var x1    = geom.x1, y1 = geom.y1;
      var x2    = geom.x2, y2 = geom.y2;
      var cx    = geom.cx;

      ctx.strokeStyle = C.wire;
      ctx.lineWidth   = 2;
      // Left wire: node down to arcY
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, arcY); ctx.stroke();
      // Bottom wire across
      ctx.beginPath(); ctx.moveTo(x1, arcY); ctx.lineTo(x2, arcY); ctx.stroke();
      // Right wire: arcY up to node
      ctx.beginPath(); ctx.moveTo(x2, arcY); ctx.lineTo(x2, y2); ctx.stroke();

      // Draw battery symbol at bottom centre
      _drawBatteryLines(ctx, cx, arcY + 10, true, label, opts);
      ctx.restore();
      return;
    }

    var g       = geom;
    var bodyLen = g.len * 0.30;  // 30% for battery plates
    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.angle);

    // Leads
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(-g.len / 2, 0);
    ctx.lineTo(-bodyLen / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bodyLen / 2, 0);
    ctx.lineTo(g.len / 2, 0);
    ctx.stroke();

    // Battery plates (4 lines: long-short-long-short)
    var lines = [
      { ox: -bodyLen * 0.45, h: 16 },
      { ox: -bodyLen * 0.15, h: 10 },
      { ox:  bodyLen * 0.15, h: 16 },
      { ox:  bodyLen * 0.45, h: 10 },
    ];
    lines.forEach(function (l) {
      ctx.strokeStyle = C.battery;
      ctx.lineWidth   = 2.5;
      ctx.beginPath();
      ctx.moveTo(l.ox, -l.h);
      ctx.lineTo(l.ox,  l.h);
      ctx.stroke();
    });

    // Un-rotate for labels
    ctx.rotate(-g.angle);
    ctx.fillStyle    = C.battery;
    ctx.font         = 'bold 11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (label) ctx.fillText(label, 0, -22);

    // + / - signs
    // RULE: current exits the positive terminal.
    // The battery component is drawn from→to (left→right when angle=0).
    // Therefore: + label on the LEFT (from-node / negative-bodyLen side) — current exits here.
    //            − label on the RIGHT (to-node / positive-bodyLen side) — current enters here.
    ctx.font      = 'bold 13px sans-serif';
    ctx.fillStyle = '#66BB6A';
    ctx.fillText('+', -bodyLen * 0.55, -18);  // from-side = positive terminal ✓
    ctx.fillStyle = '#EF5350';
    ctx.fillText('−', bodyLen * 0.55, -18);   // to-side   = negative terminal ✓

    ctx.restore();
  }

  function _drawBatteryLines(ctx2, bx, by, horizontal, label, opts) {
    // Used for arc-routed battery in bridge topology
    var lines = [
      { ox: -18, h: 16 },
      { ox:  -6, h: 10 },
      { ox:   6, h: 16 },
      { ox:  18, h: 10 },
    ];
    lines.forEach(function (l) {
      ctx2.strokeStyle = C.battery;
      ctx2.lineWidth   = 2.5;
      ctx2.beginPath();
      ctx2.moveTo(bx + l.ox, by - l.h);
      ctx2.lineTo(bx + l.ox, by + l.h);
      ctx2.stroke();
    });
    // Label
    ctx2.fillStyle    = C.battery;
    ctx2.font         = 'bold 11px sans-serif';
    ctx2.textAlign    = 'center';
    ctx2.textBaseline = 'middle';
    if (label) ctx2.fillText(label, bx, by - 28);
    // + / - labels — same convention: left (lower ox) = positive terminal, current exits here.
    ctx2.fillStyle = '#66BB6A';
    ctx2.font      = 'bold 13px sans-serif';
    ctx2.fillText('+', bx - 22, by - 22);  // left = positive terminal ✓
    ctx2.fillStyle = '#EF5350';
    ctx2.fillText('−', bx + 22, by - 22);  // right = negative terminal ✓
  }

  function drawCapacitor(geom, label, opts) {
    opts = opts || {};
    ctx.save();
    if (opts.dimmed) ctx.globalAlpha = C.DIM;

    var g       = geom;
    var gap     = 8;
    var plateH  = 20;

    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.angle);

    // Leads
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(-g.len / 2, 0); ctx.lineTo(-gap / 2 - 1, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( gap / 2 + 1, 0); ctx.lineTo( g.len / 2, 0); ctx.stroke();

    // Plates
    if (opts.spotlight) { ctx.shadowColor = C.spot; ctx.shadowBlur = 14; }
    ctx.strokeStyle = C.capacitor;
    ctx.lineWidth   = 3;
    ctx.beginPath(); ctx.moveTo(-gap / 2, -plateH / 2); ctx.lineTo(-gap / 2, plateH / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( gap / 2, -plateH / 2); ctx.lineTo( gap / 2, plateH / 2); ctx.stroke();
    ctx.shadowBlur  = 0;

    // Label
    ctx.rotate(-g.angle);
    ctx.fillStyle    = opts.spotlight ? C.spot : C.text;
    ctx.font         = '11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (label) ctx.fillText(label, 0, -18);

    ctx.restore();
  }

  function _drawMeterCircle(geom, letter, color, label, value, unit, opts) {
    opts = opts || {};
    ctx.save();
    if (opts.dimmed) ctx.globalAlpha = C.DIM;

    var g   = geom;
    var r   = 18;
    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.angle);

    // Leads
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(-g.len / 2, 0); ctx.lineTo(-r, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r, 0);           ctx.lineTo( g.len / 2, 0); ctx.stroke();

    // Circle
    if (opts.spotlight) { ctx.shadowColor = C.spot; ctx.shadowBlur = 14; }
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.fillStyle   = 'rgba(8,8,22,0.75)';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Letter
    ctx.fillStyle    = color;
    ctx.font         = 'bold 13px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 0, 0);

    // Un-rotate for labels
    ctx.rotate(-g.angle);

    // Label above
    if (label) {
      ctx.fillStyle    = opts.spotlight ? C.spot : C.text;
      ctx.font         = '10px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, -r - 8);
    }

    // Value below
    if (opts.showValue && value !== undefined) {
      ctx.fillStyle = color;
      ctx.font      = '10px sans-serif';
      ctx.fillText(value.toFixed(value === 0 ? 0 : 2) + (unit || ''), 0, r + 10);
    }

    ctx.restore();
  }

  function drawAmmeter(geom, label, value, opts) {
    _drawMeterCircle(geom, 'A', C.meter_a, label, value, ' A', opts);
  }

  function drawVoltmeter(geom, label, value, opts) {
    _drawMeterCircle(geom, 'V', C.meter_v, label, value, ' V', opts);
  }

  function drawGalvanometer(geom, label, value, opts) {
    opts = opts || {};
    _drawMeterCircle(geom, 'G', C.meter_g, label, value, ' A', opts);
    // Near-zero indication
    if (opts.showValue && value !== undefined && Math.abs(value) < 0.001) {
      ctx.save();
      ctx.translate(geom.cx, geom.cy);
      ctx.rotate(geom.angle);
      ctx.rotate(-geom.angle);
      ctx.fillStyle    = C.meter_g;
      ctx.font         = 'bold 9px sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('0', 0, 28);
      ctx.restore();
    }
  }

  function drawSwitch(geom, is_open, opts) {
    opts = opts || {};
    ctx.save();
    if (opts.dimmed) ctx.globalAlpha = C.DIM;

    var g      = geom;
    var dotR   = 5;
    var bladeL = g.len * BODY_FRAC;

    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.angle);

    // Leads
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(-g.len / 2, 0); ctx.lineTo(-bladeL / 2, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( bladeL / 2, 0); ctx.lineTo( g.len / 2, 0); ctx.stroke();

    // Hinge dot (left)
    ctx.fillStyle = C.wire;
    ctx.beginPath(); ctx.arc(-bladeL / 2, 0, dotR, 0, Math.PI * 2); ctx.fill();

    var bladeColor = is_open ? C.switch_open : C.switch_closed;

    if (is_open) {
      // Blade tilted ~35°
      ctx.strokeStyle = bladeColor;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(-bladeL / 2, 0);
      ctx.lineTo( bladeL / 2 - dotR * 1.5, -bladeL * 0.36);
      ctx.stroke();
    } else {
      // Blade closed (horizontal)
      ctx.strokeStyle = bladeColor;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(-bladeL / 2, 0);
      ctx.lineTo( bladeL / 2, 0);
      ctx.stroke();
      // Contact dot (right)
      ctx.fillStyle = bladeColor;
      ctx.beginPath(); ctx.arc(bladeL / 2, 0, dotR, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  function drawBulb(geom, label, brightness, opts) {
    opts       = opts || {};
    brightness = (brightness === undefined) ? 0 : Math.min(1, Math.max(0, brightness));
    ctx.save();
    if (opts.dimmed) ctx.globalAlpha = C.DIM;

    var g = geom;
    var r = 16;

    ctx.translate(g.cx, g.cy);
    ctx.rotate(g.angle);

    // Leads
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(-g.len / 2, 0); ctx.lineTo(-r, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( r, 0);          ctx.lineTo( g.len / 2, 0); ctx.stroke();

    // Glow
    if (brightness > 0.2) {
      var glowR  = r + 12 * brightness;
      var grad   = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, glowR);
      grad.addColorStop(0, 'rgba(255,224,130,' + (0.6 * brightness).toFixed(2) + ')');
      grad.addColorStop(1, 'rgba(255,224,130,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(0, 0, glowR, 0, Math.PI * 2); ctx.fill();
    }

    // Circle
    var bulbColor = brightness > 0.2 ? C.bulb_on : C.bulb_off;
    if (opts.spotlight) { ctx.shadowColor = C.spot; ctx.shadowBlur = 14; }
    ctx.strokeStyle = bulbColor;
    ctx.lineWidth   = 2;
    ctx.fillStyle   = brightness > 0.2
      ? 'rgba(255,224,130,' + (0.25 + 0.4 * brightness).toFixed(2) + ')'
      : 'rgba(8,8,22,0.6)';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.shadowBlur  = 0;

    // X filament
    ctx.strokeStyle = bulbColor;
    ctx.lineWidth   = 1.5;
    var fr = r * 0.55;
    ctx.beginPath(); ctx.moveTo(-fr, -fr); ctx.lineTo(fr, fr); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( fr, -fr); ctx.lineTo(-fr, fr); ctx.stroke();

    // Label (un-rotated)
    ctx.rotate(-g.angle);
    ctx.fillStyle    = opts.spotlight ? C.spot : C.text;
    ctx.font         = '10px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (label) ctx.fillText(label, 0, -r - 8);

    ctx.restore();
  }

  // ============================================================================
  // SYSTEM 3 — CURRENT FLOW ARROWS
  // ============================================================================

  function initArrows() {
    arrowParticles = [];
    (circuit.components || []).forEach(function (comp) {
      if (comp.type === 'battery') return;
      for (var i = 0; i < 2; i++) {
        arrowParticles.push({
          compId:   comp.id,
          t:        i * 0.5,
          speed:    0.007,
          reversed: false,
        });
      }
    });
  }

  function updateArrowSpeed(compId, currentAbs) {
    var speed = Math.min(0.03, Math.max(0.003, Math.abs(currentAbs) * 0.012));
    arrowParticles.forEach(function (p) {
      if (p.compId === compId) p.speed = speed;
    });
  }

  function updateAndDrawArrows() {
    var compMap = buildCompMap();
    arrowParticles.forEach(function (p) {
      var comp = compMap[p.compId];
      if (!comp) return;

      // Visibility check
      if (stateVars.visibleComponents !== null &&
          stateVars.visibleComponents.indexOf(p.compId) < 0) return;

      var offset = parallelOffsets[p.compId] || 0;
      var g      = getCompGeom(comp, offset);

      // Advance t
      p.t = p.t + (p.reversed ? -p.speed : p.speed);
      if (p.t > 1) p.t -= 1;
      if (p.t < 0) p.t += 1;

      var t   = p.t;
      var px  = g.x1 + (g.x2 - g.x1) * t;
      var py  = g.y1 + (g.y2 - g.y1) * t;
      var ang = p.reversed
        ? Math.atan2(g.y1 - g.y2, g.x1 - g.x2)
        : Math.atan2(g.y2 - g.y1, g.x2 - g.x1);

      // Skip if bottomArc battery geometry (no sensible lerp)
      if (g.bottomArc) return;

      // Fade near ends
      var alpha = Math.sin(t * Math.PI) * 0.85;
      if (alpha < 0.05) return;

      // Draw chevron
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = C.arrow;
      ctx.translate(px, py);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo( 7, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4,  4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  // ============================================================================
  // PARALLEL FEEDER WIRES (bus bars)
  // ============================================================================

  function drawParallelFeeders() {
    if (!parallelOffsets || Object.keys(parallelOffsets).length === 0) return;
    var compMap      = buildCompMap();
    var nodeOffsetMap = {};

    Object.keys(parallelOffsets).forEach(function (compId) {
      var comp   = compMap[compId];
      if (!comp) return;
      var offset = parallelOffsets[compId];
      var p1     = nodePositions[comp.from];
      var p2     = nodePositions[comp.to];
      if (!p1 || !p2) return;
      var dx     = p2.x - p1.x;
      var dy     = p2.y - p1.y;
      var len    = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.001) return;
      var perpX  = -dy / len;
      var perpY  =  dx / len;

      [comp.from, comp.to].forEach(function (nodeId) {
        if (!nodeOffsetMap[nodeId]) nodeOffsetMap[nodeId] = [];
        nodeOffsetMap[nodeId].push({ ox: perpX * offset, oy: perpY * offset });
      });
    });

    Object.keys(nodeOffsetMap).forEach(function (nodeId) {
      var base = nodePositions[nodeId];
      if (!base) return;
      var pts = nodeOffsetMap[nodeId].map(function (o) {
        return { x: base.x + o.ox, y: base.y + o.oy };
      });
      // Include the base node itself
      pts.push({ x: base.x, y: base.y });
      // Sort by Y then X
      pts.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
      // Deduplicate closely spaced points
      var deduped = [pts[0]];
      for (var i = 1; i < pts.length; i++) {
        var prev = deduped[deduped.length - 1];
        if (Math.abs(pts[i].x - prev.x) > 2 || Math.abs(pts[i].y - prev.y) > 2) {
          deduped.push(pts[i]);
        }
      }
      if (deduped.length < 2) return;
      ctx.save();
      ctx.strokeStyle = C.wire;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(deduped[0].x, deduped[0].y);
      for (var i = 1; i < deduped.length; i++) ctx.lineTo(deduped[i].x, deduped[i].y);
      ctx.stroke();
      ctx.restore();
    });
  }

  // ============================================================================
  // DRAW ALL COMPONENTS
  // ============================================================================

  function drawAllComponents() {
    var comps    = circuit.components || [];
    var compMap  = buildCompMap();

    comps.forEach(function (comp) {
      // Visibility
      var visible = (stateVars.visibleComponents === null) ||
                    (stateVars.visibleComponents.indexOf(comp.id) >= 0);
      if (!visible) return;

      var offset    = parallelOffsets[comp.id] || 0;
      var g         = getCompGeom(comp, offset);
      var isSpot    = stateVars.spotlight === comp.id;
      var isDimmed  = (stateVars.spotlight !== null) && !isSpot;
      var curVal    = stateVars.currentValues[comp.id];
      var voltVal   = stateVars.voltageDrops[comp.id];

      var opts = {
        spotlight:    isSpot,
        dimmed:       isDimmed,
        showValues:   stateVars.showValues,
        showCurrent:  stateVars.showValues && curVal  !== undefined,
        showVoltage:  stateVars.showVoltageDrop && voltVal !== undefined,
        currentVal:   curVal,
        voltageVal:   voltVal,
      };

      var label = comp.label || comp.id;
      var type  = (comp.type || 'wire').toLowerCase();

      if (type === 'wire') {
        if (g.bottomArc) {
          // Routed wire
          ctx.save();
          if (isDimmed) ctx.globalAlpha = C.DIM;
          ctx.strokeStyle = C.wire;
          ctx.lineWidth   = 2;
          ctx.beginPath();
          ctx.moveTo(g.x1, g.y1);
          ctx.lineTo(g.x1, g.arcY);
          ctx.lineTo(g.x2, g.arcY);
          ctx.lineTo(g.x2, g.y2);
          ctx.stroke();
          ctx.restore();
        } else {
          drawWire(g.x1, g.y1, g.x2, g.y2, isDimmed ? C.DIM : 1);
        }
      } else if (type === 'resistor') {
        drawResistor(g, label, opts);
      } else if (type === 'battery') {
        drawBattery(g, label, opts);
      } else if (type === 'capacitor') {
        drawCapacitor(g, label, opts);
      } else if (type === 'ammeter') {
        drawAmmeter(g, label, curVal, Object.assign({}, opts, {
          showValue: stateVars.showValues && curVal !== undefined,
        }));
      } else if (type === 'voltmeter') {
        drawVoltmeter(g, label, voltVal, Object.assign({}, opts, {
          showValue: stateVars.showVoltageDrop && voltVal !== undefined,
        }));
      } else if (type === 'galvanometer') {
        drawGalvanometer(g, label, curVal, Object.assign({}, opts, {
          showValue: stateVars.showValues && curVal !== undefined,
        }));
      } else if (type === 'switch') {
        drawSwitch(g, comp.is_open !== false, opts);
      } else if (type === 'bulb') {
        var brightness = curVal !== undefined ? Math.min(1, curVal / 2) : 0;
        drawBulb(g, label, stateVars.currentFlowing ? brightness : 0, opts);
      } else {
        // Fallback: draw as wire
        drawWire(g.x1, g.y1, g.x2, g.y2, isDimmed ? C.DIM : 1);
      }
    });

    // Draw junction dots at nodes with 3+ connections
    drawJunctions();
  }

  function drawJunctions() {
    var comps   = circuit.components || [];
    var connCount = {};
    comps.forEach(function (comp) {
      connCount[comp.from] = (connCount[comp.from] || 0) + 1;
      connCount[comp.to]   = (connCount[comp.to]   || 0) + 1;
    });
    Object.keys(connCount).forEach(function (nid) {
      if (connCount[nid] >= 3) {
        var p = nodePositions[nid];
        if (p) drawJunction(p.x, p.y);
      }
    });
  }

  // ============================================================================
  // RULE 1 — NODE LABELS
  // Every named node in nodePositions gets its label drawn directly on canvas.
  // ============================================================================

  function drawNodeLabels() {
    var ids = Object.keys(nodePositions);
    if (ids.length === 0) return;
    ctx.save();
    ctx.font         = '11px sans-serif';
    ctx.fillStyle    = '#FFFFFF';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ids.forEach(function (nid) {
      var p = nodePositions[nid];
      if (!p) return;
      ctx.fillText(nid, p.x, p.y - 7);
    });
    ctx.restore();
  }

  // ============================================================================
  // RULE 2 — SYMBOL LEGEND
  // Rendered as an HTML div BELOW the canvas — never overlaps circuit drawing.
  // Called once at init. Absent legend → no-op (no crash).
  // ============================================================================

  function initLegendDiv() {
    var legend = cfg.legend;
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

    // Insert immediately after the canvas element
    if (canvas.parentNode) {
      canvas.parentNode.style.paddingBottom = '8px';
      canvas.parentNode.insertBefore(div, canvas.nextSibling);
    } else {
      document.body.appendChild(div);
    }
  }

  // ============================================================================
  // CAPTION
  // ============================================================================

  function drawCaption() {
    if (!stateVars.caption) return;
    ctx.save();
    ctx.fillStyle    = C.text;
    ctx.font         = '13px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(stateVars.caption, CW / 2, 8);
    ctx.restore();
  }

  // ============================================================================
  // FORMULA ANCHOR
  // ============================================================================

  function drawFormulaAnchor() {
    var fa = cfg.formula_anchor;
    if (!fa) return;
    var y0 = CH - 68;

    // Background strip
    ctx.fillStyle = 'rgba(8,8,22,0.92)';
    ctx.fillRect(0, y0, CW, 68);
    ctx.strokeStyle = 'rgba(60,80,130,0.5)';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(CW, y0); ctx.stroke();

    // Render formula with colored variable tokens
    var formula    = fa.formula_string || '';
    var vars       = fa.variables || {};
    var highlights = stateVars.formulaHighlights;

    ctx.save();
    ctx.textBaseline = 'middle';
    var y = y0 + 34;

    // Tokenize on variable names (single letters) and operators
    var tokens = [];
    var remaining = formula;
    var varKeys   = Object.keys(vars);
    while (remaining.length > 0) {
      var matched = false;
      // Try matching a known variable first
      for (var vi = 0; vi < varKeys.length; vi++) {
        var vk = varKeys[vi];
        if (remaining.indexOf(vk) === 0) {
          tokens.push(vk);
          remaining = remaining.slice(vk.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        // Collect non-variable characters
        var chunk = '';
        while (remaining.length > 0) {
          var isVar = false;
          for (var vi2 = 0; vi2 < varKeys.length; vi2++) {
            if (remaining.indexOf(varKeys[vi2]) === 0) { isVar = true; break; }
          }
          if (isVar) break;
          chunk     += remaining[0];
          remaining  = remaining.slice(1);
        }
        if (chunk) tokens.push(chunk);
      }
    }

    var x = 40;
    tokens.forEach(function (tok) {
      var isVar         = !!vars[tok];
      var isHighlighted = isVar && highlights.indexOf(tok) >= 0;
      ctx.shadowBlur  = isHighlighted ? 10 : 0;
      ctx.shadowColor = isHighlighted ? vars[tok].color : 'transparent';
      ctx.fillStyle   = isHighlighted ? vars[tok].color
                       : isVar       ? 'rgba(212,212,216,0.4)'
                       : 'rgba(212,212,216,0.65)';
      ctx.font        = isHighlighted ? 'bold 20px monospace' : '20px monospace';
      ctx.fillText(tok, x, y);
      x += ctx.measureText(tok).width;
    });
    ctx.shadowBlur = 0;

    // Variable legend on right side
    var lx = CW / 2 + 20;
    varKeys.forEach(function (key, i) {
      var v   = vars[key];
      var isH = highlights.indexOf(key) >= 0;
      ctx.font        = isH ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.fillStyle   = isH ? v.color : 'rgba(212,212,216,0.35)';
      ctx.shadowBlur  = isH ? 6 : 0;
      ctx.shadowColor = isH ? v.color : 'transparent';
      ctx.textAlign   = 'left';
      ctx.fillText(key + ' = ' + v.label, lx + i * 140, y);
    });
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ============================================================================
  // SLIDER DOM
  // ============================================================================

  function showSlider(s) {
    if (!sliderEl) {
      var div   = document.createElement('div');
      div.id    = 'cl-slider-wrap';
      div.style.cssText =
        'position:absolute;bottom:72px;left:50%;transform:translateX(-50%);' +
        'background:rgba(12,12,30,0.92);border:1px solid rgba(66,165,245,0.35);' +
        'border-radius:10px;padding:10px 22px;display:flex;align-items:center;' +
        'gap:14px;font-size:13px;color:#D4D4D8;z-index:10;';
      var lbl = document.createElement('span');
      lbl.id  = 'cl-slider-lbl';
      var inp = document.createElement('input');
      inp.type = 'range';
      inp.id   = 'cl-slider-inp';
      inp.style.cssText = 'width:170px;accent-color:#42A5F5;';
      var val = document.createElement('span');
      val.id   = 'cl-slider-val';
      val.style.cssText = 'min-width:44px;color:#FF9800;font-weight:bold;';
      inp.addEventListener('input', function () {
        val.textContent = parseFloat(inp.value).toFixed(1);
        onSliderChange(parseFloat(inp.value));
      });
      div.appendChild(lbl);
      div.appendChild(inp);
      div.appendChild(val);
      // Attach to canvas parent for positioning context
      var parent = canvas.parentElement || document.body;
      parent.style.position = 'relative';
      parent.appendChild(div);
      sliderEl    = div;
      sliderValEl = val;
    }

    sliderState = s;
    document.getElementById('cl-slider-lbl').textContent = (s.slider_variable || 'V') + ':';
    var inp  = document.getElementById('cl-slider-inp');
    inp.min  = s.slider_min  !== undefined ? s.slider_min  : 0;
    inp.max  = s.slider_max  !== undefined ? s.slider_max  : 12;
    inp.step = ((s.slider_max || 12) - (s.slider_min || 0)) / 100;
    var dflt = s.slider_default !== undefined
      ? s.slider_default
      : ((s.slider_min || 0) + (s.slider_max || 12)) / 2;
    inp.value           = dflt;
    sliderValEl.textContent = dflt.toFixed(1);
    sliderEl.style.display  = 'flex';
    onSliderChange(dflt);
  }

  function hideSlider() {
    if (sliderEl) sliderEl.style.display = 'none';
  }

  function onSliderChange(val) {
    if (!sliderState) return;
    var varKey   = sliderState.slider_variable || 'V';
    var targetId = sliderState.slider_target_component;
    var comps    = circuit.components || [];

    // Wire topology: slider adjusts driver EMF → jockey animates to new balance point
    if (circuit.topology === 'wire') {
      var wts       = wireTopologyState;
      wts.driverEmf = val;
      var newTarget = 90 + (wts.testEmf / Math.max(val, 0.01)) * (710 - 90);
      newTarget = Math.max(95, Math.min(705, newTarget));
      wts.animFrom      = wts.jockeyX;
      wts.animStart     = performance.now();
      wts.jockeyXTarget = newTarget;
      return;
    }

    if (varKey === 'V') {
      var dflt  = sliderState.slider_default || 6;
      var scale = val / Math.max(dflt, 0.01);
      var baseVals = sliderState.current_values || {};
      comps.forEach(function (c) {
        if (c.type !== 'battery') {
          var base = baseVals[c.id] !== undefined ? baseVals[c.id] : 0.5;
          var newI = base * scale;
          stateVars.currentValues[c.id] = parseFloat(newI.toFixed(3));
          updateArrowSpeed(c.id, newI);
        }
      });
    } else if (varKey === 'R') {
      comps.forEach(function (c) {
        if (c.id === targetId) {
          c.value = parseFloat(val.toFixed(1));
          // Find battery voltage
          var batComp = null;
          for (var i = 0; i < comps.length; i++) {
            if (comps[i].type === 'battery') { batComp = comps[i]; break; }
          }
          var V    = batComp ? (batComp.value || 6) : 6;
          var newI = V / Math.max(val, 0.01);
          stateVars.currentValues[c.id] = parseFloat(newI.toFixed(3));
          updateArrowSpeed(c.id, newI);
        }
      });
    }
  }

  // ============================================================================
  // SYSTEM 4 — STATE ENGINE
  // ============================================================================

  function applyState(stateName) {
    var s = (cfg.states || {})[stateName];
    if (!s) return;
    PM_currentState = stateName;

    stateVars.currentFlowing    = !!s.current_flowing;
    stateVars.caption           = s.caption || '';
    stateVars.visibleComponents = s.visible_components || null;
    stateVars.spotlight         = s.spotlight || null;
    stateVars.showValues        = !!s.show_values;
    stateVars.showVoltageDrop   = !!s.show_voltage_drops;
    stateVars.sliderActive      = !!s.slider_active;

    if (s.current_values) {
      stateVars.currentValues = Object.assign({}, s.current_values);
      Object.keys(s.current_values).forEach(function (id) {
        updateArrowSpeed(id, s.current_values[id]);
      });
    } else {
      stateVars.currentValues = {};
    }

    stateVars.voltageDrops = s.voltage_drops
      ? Object.assign({}, s.voltage_drops)
      : {};

    // Formula highlights
    var fa = cfg.formula_anchor;
    stateVars.formulaHighlights =
      (fa && fa.state_highlights && fa.state_highlights[stateName]) || [];

    // Wire topology: animate jockey to this state's specified position
    if (circuit.topology === 'wire' && s.jockey_position !== undefined) {
      var fraction = s.jockey_position;   // 0.0 (A) … 1.0 (C)
      var tX = 90 + fraction * (710 - 90);
      tX = Math.max(95, Math.min(705, tX));
      wireTopologyState.animFrom      = wireTopologyState.jockeyX;
      wireTopologyState.animStart     = performance.now();
      wireTopologyState.jockeyXTarget = tX;
    }

    // Slider
    if (s.slider_active) showSlider(s);
    else hideSlider();
  }

  // ============================================================================
  // WIRE TOPOLOGY — NCERT potentiometer layout (Change 1 + Change 2)
  // Self-contained: reads wireTopologyState, draws directly to ctx.
  // ============================================================================

  function initWireTopology() {
    var wts    = wireTopologyState;
    var comps  = circuit.components || [];
    var bats   = comps.filter(function (c) { return c.type === 'battery'; });
    var wp     = cfg.wire_params || {};
    wts.driverEmf = wp.driver_emf != null ? wp.driver_emf
                  : (bats[0] ? (bats[0].value || 6) : 6);
    wts.testEmf   = wp.test_emf   != null ? wp.test_emf
                  : (bats[1] ? (bats[1].value || 3) : wts.driverEmf * 0.5);
    // Start jockey at centre of wire — avoids overlap with driver circuit elements
    wts.jockeyX = wts.jockeyXTarget = wts.animFrom = 400;
    wts.animStart = 0;
  }

  // Called every frame from render() when topology === 'wire'.
  // Advances the smooth jockey animation and recomputes galvDeflection.
  function animateJockey() {
    var wts = wireTopologyState;
    var wx1 = 90, wx2 = 710;

    if (wts.animStart > 0) {
      var elapsed = performance.now() - wts.animStart;
      if (elapsed >= wts.animDuration) {
        wts.jockeyX   = wts.jockeyXTarget;
        wts.animStart = 0;
      } else {
        var t     = elapsed / wts.animDuration;
        var eased = 1 - Math.pow(1 - t, 3);          // ease-out cubic
        wts.jockeyX = wts.animFrom + (wts.jockeyXTarget - wts.animFrom) * eased;
      }
    }

    // Recompute galvanometer deflection relative to balance point
    var balX = wx1 + (wts.testEmf / Math.max(wts.driverEmf, 0.01)) * (wx2 - wx1);
    balX = Math.max(wx1, Math.min(wx2, balX));
    wts.galvDeflection = (wts.jockeyX - balX) / ((wx2 - wx1) * 0.5);
    wts.galvDeflection = Math.max(-1, Math.min(1, wts.galvDeflection));

    // Advance current-arrow animation (≈1.2 px/frame around the 1724 px loop)
    wireCurrentT = (wireCurrentT + 1.2) % 1724;
  }

  // Maps a distance t (px, 0–1724) along the driver loop to a canvas point + heading.
  // Loop order: up left-above-bat → right wire A→C → down right leg → left bottom → up left-below-bat
  function wirePathPoint(t) {
    // [x1, y1, x2, y2, segLen]
    var segs = [
      [90, 255, 90,  145, 110],   // up — left leg above battery  (255→145)
      [90, 145, 710, 145, 620],   // right — potentiometer wire A→C
      [710,145, 710, 405, 260],   // down — right leg
      [710,405, 90,  405, 620],   // left — bottom wire
      [90, 405, 90,  291, 114],   // up — left leg below battery  (405→291)
    ];
    t = ((t % 1724) + 1724) % 1724;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i], len = s[4];
      if (t < len) {
        var f = t / len;
        return {
          x:     s[0] + (s[2] - s[0]) * f,
          y:     s[1] + (s[3] - s[1]) * f,
          angle: Math.atan2(s[3] - s[1], s[2] - s[0]),
        };
      }
      t -= len;
    }
    return { x: 90, y: 255, angle: -Math.PI / 2 };
  }

  // Draws the full potentiometer circuit per NCERT Fig. 3.28 style.
  // All wires are strictly horizontal or vertical. No diagonal lines.
  function drawWireTopology() {
    var wts  = wireTopologyState;
    var jX   = wts.jockeyX;

    // ── Fixed layout (px) ───────────────────────────────────────────────────
    var wY    = 145;   // potentiometer wire AC
    var wX1   = 90;    // A (left end of wire)
    var wX2   = 710;   // C (right end of wire)
    var loopY = 405;   // bottom of driver circuit rectangle
    var dBatT = 255;   // driver battery + plate y (on left leg x=90)
    var dBatB = 291;   // driver battery − plate y
    var jTipY = wY + 13;   // jockey triangle tip y
    var galvY = 250;   // galvanometer circle centre y
    var galvR = 20;    // galvanometer circle radius
    var tBatT = 315;   // test battery + plate y
    var tBatB = 347;   // test battery − plate y
    var connY = 382;   // y where test branch wire rejoins driver left leg

    ctx.save();
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';

    // ── 1. Driver cell outer circuit ──────────────────────────────────────────
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;

    // Left leg — above battery gap
    ctx.beginPath(); ctx.moveTo(wX1, wY); ctx.lineTo(wX1, dBatT - 5); ctx.stroke();
    // Left leg — below battery gap
    ctx.beginPath(); ctx.moveTo(wX1, dBatB + 5); ctx.lineTo(wX1, loopY); ctx.stroke();
    // Bottom wire
    ctx.beginPath(); ctx.moveTo(wX1, loopY); ctx.lineTo(wX2, loopY); ctx.stroke();
    // Right leg
    ctx.beginPath(); ctx.moveTo(wX2, wY); ctx.lineTo(wX2, loopY); ctx.stroke();

    // Driver battery symbol (vertical battery on left leg)
    // Positive plate — long thin line
    ctx.strokeStyle = C.battery;
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.moveTo(wX1 - 14, dBatT); ctx.lineTo(wX1 + 14, dBatT); ctx.stroke();
    // Negative plate — short thick line
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(wX1 - 8, dBatB); ctx.lineTo(wX1 + 8, dBatB); ctx.stroke();

    // Driver battery labels
    ctx.fillStyle = C.battery;
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillText('+', wX1 - 18, dBatT);
    ctx.fillText('\u2212', wX1 - 18, dBatB);

    var dBatMidY = (dBatT + dBatB) / 2;
    ctx.fillStyle = C.text;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('E\u2080', wX1 + 18, dBatMidY - 8);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = C.voltage;
    ctx.fillText(wts.driverEmf.toFixed(1) + '\u202fV', wX1 + 18, dBatMidY + 7);

    // ── 2. Potentiometer wire A→C ─────────────────────────────────────────────
    ctx.strokeStyle = '#B0BEC5';
    ctx.lineWidth   = 3;
    ctx.beginPath(); ctx.moveTo(wX1, wY); ctx.lineTo(wX2, wY); ctx.stroke();

    // Node labels A and C
    ctx.fillStyle    = '#FFFFFF';
    ctx.font         = 'bold 13px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('A', wX1, wY - 6);
    ctx.fillText('C', wX2, wY - 6);

    // ── 3. Jockey J ──────────────────────────────────────────────────────────
    // Downward-pointing filled triangle: base on wire, tip below
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(jX - 7, wY);
    ctx.lineTo(jX + 7, wY);
    ctx.lineTo(jX, jTipY);
    ctx.closePath();
    ctx.fill();

    // J label — drawn BELOW the jockey tip to avoid overlapping A/C wire labels
    ctx.fillStyle    = '#FFFFFF';
    ctx.font         = '11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('J', jX, jTipY + 3);

    // ── 4. Test cell branch  J → G → ε → back to left leg ───────────────────
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;

    // Wire: jockey tip → galvanometer top
    ctx.beginPath(); ctx.moveTo(jX, jTipY); ctx.lineTo(jX, galvY - galvR); ctx.stroke();

    // Galvanometer circle
    ctx.strokeStyle = C.meter_g;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.arc(jX, galvY, galvR, 0, Math.PI * 2); ctx.stroke();

    // "G" label
    ctx.fillStyle    = C.meter_g;
    ctx.font         = 'bold 11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', jX, galvY);

    // Galvanometer needle — swings ±72° from 12 o'clock
    var defl      = wts.galvDeflection;
    var needleAng = -Math.PI / 2 + defl * Math.PI * 0.40;
    var needleLen = galvR - 5;
    ctx.strokeStyle = Math.abs(defl) < 0.05 ? '#66BB6A' : '#FF9800';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(jX, galvY);
    ctx.lineTo(jX + Math.cos(needleAng) * needleLen,
               galvY + Math.sin(needleAng) * needleLen);
    ctx.stroke();

    // Needle pivot dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(jX, galvY, 3, 0, Math.PI * 2); ctx.fill();

    // Wire: galvanometer bottom → test battery top
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(jX, galvY + galvR); ctx.lineTo(jX, tBatT - 5); ctx.stroke();

    // Test cell battery symbol (vertical, positive plate on top)
    ctx.strokeStyle = C.battery;
    ctx.lineWidth   = 1.5;
    ctx.beginPath(); ctx.moveTo(jX - 14, tBatT); ctx.lineTo(jX + 14, tBatT); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(jX - 8, tBatB); ctx.lineTo(jX + 8, tBatB); ctx.stroke();

    // Test battery labels
    ctx.fillStyle = C.battery;
    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('+', jX + 18, tBatT);
    ctx.fillText('\u2212', jX + 18, tBatB);

    var tBatMidY = (tBatT + tBatB) / 2;
    ctx.fillStyle = C.text;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('\u03b5', jX - 18, tBatMidY - 8);         // ε
    ctx.font = '10px sans-serif';
    ctx.fillStyle = C.voltage;
    ctx.fillText(wts.testEmf.toFixed(1) + '\u202fV', jX - 18, tBatMidY + 7);

    // Wire: test battery bottom → connY (vertical)
    ctx.strokeStyle = C.wire;
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(jX, tBatB + 5); ctx.lineTo(jX, connY); ctx.stroke();

    // Horizontal return wire → driver left leg (strictly horizontal)
    ctx.beginPath(); ctx.moveTo(jX, connY); ctx.lineTo(wX1, connY); ctx.stroke();

    // ── 5. Balance point marker (dashed tick on wire) ─────────────────────────
    var balX = wX1 + (wts.testEmf / Math.max(wts.driverEmf, 0.01)) * (wX2 - wX1);
    balX = Math.max(wX1 + 4, Math.min(wX2 - 4, balX));
    ctx.strokeStyle = 'rgba(102,187,106,0.35)';
    ctx.lineWidth   = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(balX, wY - 12); ctx.lineTo(balX, wY + 12); ctx.stroke();
    ctx.setLineDash([]);

    // ── 6. Galvanometer status text ───────────────────────────────────────────
    var statusText, statusColor;
    if (Math.abs(defl) < 0.05) {
      statusText  = 'G\u202f=\u202f0\u2003\u2714 Balance point';
      statusColor = '#66BB6A';
    } else if (defl < 0) {
      statusText  = 'G deflects \u2190\u2003(V\u2c7c < \u03b5)';
      statusColor = '#FF9800';
    } else {
      statusText  = 'G deflects \u2192\u2003(V\u2c7c > \u03b5)';
      statusColor = '#FF9800';
    }
    ctx.fillStyle    = statusColor;
    ctx.font         = '11px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(statusText, (wX1 + wX2) / 2, wY + 18);

    // Potential gradient reminder
    ctx.fillStyle = 'rgba(212,212,216,0.45)';
    ctx.font      = '10px sans-serif';
    ctx.fillText('\u03c6 = E\u2080 / L  (uniform potential gradient)',
                 (wX1 + wX2) / 2, wY + 33);

    // ── 7. Current flow arrows (only when state has current_flowing: true) ────
    if (stateVars.currentFlowing) {
      var N_ARROWS = 5, LOOP_LEN = 1724;
      for (var ni = 0; ni < N_ARROWS; ni++) {
        var pt = wirePathPoint(wireCurrentT + ni * LOOP_LEN / N_ARROWS);
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle   = C.arrow;
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle);
        ctx.beginPath();
        ctx.moveTo( 7,  0);
        ctx.lineTo(-4, -3.5);
        ctx.lineTo(-4,  3.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // ============================================================================
  // RENDER LOOP
  // ============================================================================

  function render() {
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, CW, CH);

    // Wire topology has its own fully custom drawing pipeline
    if (circuit.topology === 'wire') {
      animateJockey();
      drawWireTopology();
      drawCaption();
      drawFormulaAnchor();
      requestAnimationFrame(render);
      return;
    }

    // Caption
    drawCaption();

    // Parallel bus bars
    drawParallelFeeders();

    // All components
    drawAllComponents();

    // Current arrows
    if (stateVars.currentFlowing) updateAndDrawArrows();

    // Rule 1 — node labels (drawn after components so they sit on top)
    drawNodeLabels();

    // Formula anchor
    drawFormulaAnchor();

    requestAnimationFrame(render);
  }

  // ============================================================================
  // POSTMESSAGE BRIDGE
  // ============================================================================

  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'SET_STATE') {
      applyState(e.data.state);
      parent.postMessage({ type: 'STATE_REACHED', state: e.data.state }, '*');
    }
    if (e.data.type === 'PING') {
      parent.postMessage({ type: 'PONG' }, '*');
    }
  });

  // ============================================================================
  // INIT
  // ============================================================================

  nodePositions  = computeLayout();
  parallelOffsets = computeParallelOffsets();
  initArrows();
  if (circuit.topology === 'wire') initWireTopology();
  initLegendDiv();
  applyState('STATE_1');
  render();

  // Signal ready — expose state names from config or default 4
  var stateNames = Object.keys(cfg.states || {});
  if (stateNames.length === 0) stateNames = ['STATE_1','STATE_2','STATE_3','STATE_4'];
  parent.postMessage({ type: 'SIM_READY', states: stateNames }, '*');

})();
