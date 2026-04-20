// ============================================================
// Optics Ray Renderer — p5.js global mode
// Reads window.SIM_CONFIG (OpticsRayConfig)
// ============================================================

var OR_cfg;
var OR_state = 'STATE_1';
var OR_prevSt = 'STATE_1';
var OR_time = 0;
var OR_flash = 0;
var OR_CW = 800;
var OR_CH = 500;
var OR_sliderEl = null;
var OR_sliderValEl = null;
var OR_objDist = 0;

// ── colour helpers ──────────────────────────────────────────
function OR_rgb(h) {
  if (!h || h.length < 7) return [200, 200, 200];
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}
function OR_fill(h, a) {
  var c = OR_rgb(h);
  fill(c[0], c[1], c[2], (a === undefined ? 1 : a) * 255);
}
function OR_stroke(h, a) {
  var c = OR_rgb(h);
  stroke(c[0], c[1], c[2], (a === undefined ? 1 : a) * 255);
}

// ══════════════════════════════════════════════════════════════
// PHYSICS COMPUTATIONS (NCERT-accurate, new Cartesian convention)
// ══════════════════════════════════════════════════════════════

function OR_lensImage(u, f) {
  if (Math.abs(u + f) < 0.001) return { v: 99999, m: -99999 };
  var v = (u * f) / (u + f);
  var m = v / u;
  return { v: v, m: m };
}

function OR_mirrorImage(u, f) {
  if (Math.abs(u - f) < 0.001) return { v: 99999, m: 99999 };
  var v = (u * f) / (u - f);
  var m = -v / u;
  return { v: v, m: m };
}

function OR_snellRefraction(theta_i, n1, n2) {
  var sinR = (n1 * Math.sin(theta_i)) / n2;
  if (Math.abs(sinR) > 1) return null;
  return Math.asin(sinR);
}

function OR_criticalAngle(n1, n2) {
  if (n1 <= n2) return null;
  return Math.asin(n2 / n1);
}

function OR_prismDeviation(n, A_rad) {
  var i1 = Math.asin(n * Math.sin(A_rad / 2));
  return 2 * i1 - A_rad;
}

// ── SETUP ───────────────────────────────────────────────────
function setup() {
  OR_cfg = window.SIM_CONFIG;
  if (!OR_cfg) { console.error('[OpticsRay] No SIM_CONFIG'); return; }
  OR_CW = 800;
  OR_CH = 500;
  createCanvas(OR_CW, OR_CH);
  frameRate(60);
  if (OR_cfg.object && OR_cfg.object.position_x) {
    OR_objDist = OR_cfg.object.position_x;
  }
  parent.postMessage({ type: 'SIM_READY' }, '*');
}

// ── MAIN DRAW ───────────────────────────────────────────────
function draw() {
  if (!OR_cfg) return;
  var cfg = OR_cfg;
  var st = cfg.states && cfg.states[OR_state];
  if (!st) return;

  var bg = (cfg.pvl_colors && cfg.pvl_colors.background) || '#0A0A1A';
  background(bg);

  OR_time += 1 / 60;

  var scenario = (cfg.scenario_type || 'convex_lens').toLowerCase();

  if (scenario === 'convex_lens')               OR_drawLensScenario(cfg, st, true);
  else if (scenario === 'concave_lens')          OR_drawLensScenario(cfg, st, false);
  else if (scenario === 'concave_mirror')        OR_drawMirrorScenario(cfg, st, true);
  else if (scenario === 'convex_mirror')         OR_drawMirrorScenario(cfg, st, false);
  else if (scenario === 'refraction_flat')       OR_drawRefractionFlat(cfg, st);
  else if (scenario === 'total_internal_reflection') OR_drawTIR(cfg, st);
  else if (scenario === 'prism_dispersion')      OR_drawPrismDispersion(cfg, st);
  else OR_drawLensScenario(cfg, st, true);

  OR_drawCaption(st);
  OR_drawBorderFlash();
  OR_updateLegend(cfg, st);
}

// ══════════════════════════════════════════════════════════════
// DRAWING: Optical Elements
// ══════════════════════════════════════════════════════════════

function OR_drawConvexLens(cx, cy, h, f) {
  var col = (OR_cfg.pvl_colors && OR_cfg.pvl_colors.element) || '#90CAF9';
  OR_stroke(col, 0.9);
  strokeWeight(2.5);
  noFill();
  var bulge = Math.min(Math.abs(f) * 0.15, 20);
  bezier(cx, cy - h/2, cx - bulge, cy - h/4, cx - bulge, cy + h/4, cx, cy + h/2);
  bezier(cx, cy - h/2, cx + bulge, cy - h/4, cx + bulge, cy + h/4, cx, cy + h/2);
  OR_stroke(col, 0.7);
  strokeWeight(1.5);
  line(cx - 6, cy - h/2 + 6, cx, cy - h/2);
  line(cx + 6, cy - h/2 + 6, cx, cy - h/2);
  line(cx - 6, cy + h/2 - 6, cx, cy + h/2);
  line(cx + 6, cy + h/2 - 6, cx, cy + h/2);
}

function OR_drawConcaveLens(cx, cy, h, f) {
  var col = (OR_cfg.pvl_colors && OR_cfg.pvl_colors.element) || '#90CAF9';
  OR_stroke(col, 0.9);
  strokeWeight(2.5);
  noFill();
  var bulge = Math.min(Math.abs(f) * 0.15, 20);
  bezier(cx, cy - h/2, cx + bulge, cy - h/4, cx + bulge, cy + h/4, cx, cy + h/2);
  bezier(cx, cy - h/2, cx - bulge, cy - h/4, cx - bulge, cy + h/4, cx, cy + h/2);
  line(cx - bulge * 0.6, cy - h/2, cx + bulge * 0.6, cy - h/2);
  line(cx - bulge * 0.6, cy + h/2, cx + bulge * 0.6, cy + h/2);
}

function OR_drawConcaveMirror(cx, cy, h, R) {
  var col = (OR_cfg.pvl_colors && OR_cfg.pvl_colors.element) || '#B0BEC5';
  OR_stroke(col, 0.9);
  strokeWeight(3);
  noFill();
  var curv = Math.min(Math.abs(R) * 0.08, 30);
  bezier(cx + curv, cy - h/2, cx, cy - h/4, cx, cy + h/4, cx + curv, cy + h/2);
  OR_stroke(col, 0.3);
  strokeWeight(1);
  for (var i = 0; i < 8; i++) {
    var yy = cy - h/2 + (h / 8) * (i + 0.5);
    var xOff = curv * (1 - Math.pow((yy - cy) / (h/2), 2));
    line(cx + xOff, yy, cx + xOff + 8, yy - 5);
  }
}

function OR_drawConvexMirror(cx, cy, h, R) {
  var col = (OR_cfg.pvl_colors && OR_cfg.pvl_colors.element) || '#B0BEC5';
  OR_stroke(col, 0.9);
  strokeWeight(3);
  noFill();
  var curv = Math.min(Math.abs(R) * 0.08, 30);
  bezier(cx - curv, cy - h/2, cx, cy - h/4, cx, cy + h/4, cx - curv, cy + h/2);
  OR_stroke(col, 0.3);
  strokeWeight(1);
  for (var i = 0; i < 8; i++) {
    var yy = cy - h/2 + (h / 8) * (i + 0.5);
    var xOff = -curv * (1 - Math.pow((yy - cy) / (h/2), 2));
    line(cx + xOff, yy, cx + xOff - 8, yy - 5);
  }
}

function OR_drawPrincipalAxis(cy) {
  OR_stroke('#444444', 0.6);
  strokeWeight(1);
  line(20, cy, OR_CW - 20, cy);
}

function OR_drawFocalPoints(cx, cy, f, isLens) {
  var fAbs = Math.abs(f);
  OR_fill('#FF9800', 0.9);
  noStroke();
  ellipse(cx - fAbs, cy, 6, 6);
  ellipse(cx + fAbs, cy, 6, 6);
  OR_fill('#D4D4D8', 0.7);
  textSize(11);
  textAlign(CENTER, TOP);
  text('F', cx - fAbs, cy + 8);
  text("F'", cx + fAbs, cy + 8);
  if (!isLens) {
    OR_fill('#FF9800', 0.6);
    ellipse(cx - 2 * fAbs, cy, 5, 5);
    OR_fill('#D4D4D8', 0.7);
    text('C', cx - 2 * fAbs, cy + 8);
    text('P', cx + 4, cy + 8);
  } else {
    OR_fill('#FF9800', 0.6);
    ellipse(cx - 2 * fAbs, cy, 5, 5);
    ellipse(cx + 2 * fAbs, cy, 5, 5);
    OR_fill('#D4D4D8', 0.7);
    text('2F', cx - 2 * fAbs, cy + 8);
    text("2F'", cx + 2 * fAbs, cy + 8);
    text('O', cx + 4, cy + 8);
  }
}

function OR_drawRay(x1, y1, x2, y2, col, dotted) {
  OR_stroke(col, dotted ? 0.5 : 0.9);
  strokeWeight(dotted ? 1.5 : 2);
  if (dotted) {
    drawingContext.setLineDash([6, 4]);
  } else {
    drawingContext.setLineDash([]);
  }
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);
  if (!dotted) {
    var mx = (x1 + x2) / 2;
    var my = (y1 + y2) / 2;
    var ang = Math.atan2(y2 - y1, x2 - x1);
    OR_fill(col, 0.9);
    noStroke();
    push();
    translate(mx, my);
    rotate(ang);
    triangle(0, 0, -8, -3.5, -8, 3.5);
    pop();
  }
}

function OR_drawObject(x, y, h, lbl) {
  var col = '#4FC3F7';
  OR_stroke(col, 0.9);
  strokeWeight(2.5);
  line(x, y, x, y - h);
  OR_fill(col, 0.9);
  noStroke();
  triangle(x, y - h, x - 5, y - h + 10, x + 5, y - h + 10);
  OR_fill('#D4D4D8', 0.9);
  textSize(12);
  textAlign(CENTER, TOP);
  text(lbl || 'Object', x, y + 4);
}

function OR_drawImage(x, y, h, isReal) {
  var col = isReal ? '#66BB6A' : '#CE93D8';
  OR_stroke(col, isReal ? 0.9 : 0.7);
  strokeWeight(2.5);
  if (!isReal) {
    drawingContext.setLineDash([6, 4]);
  }
  line(x, y, x, y - h);
  drawingContext.setLineDash([]);
  OR_fill(col, isReal ? 0.9 : 0.7);
  noStroke();
  if (h > 0) {
    triangle(x, y - h, x - 5, y - h + 10, x + 5, y - h + 10);
  } else {
    triangle(x, y - h, x - 5, y - h - 10, x + 5, y - h - 10);
  }
  OR_fill('#D4D4D8', 0.8);
  textSize(11);
  textAlign(CENTER, TOP);
  text(isReal ? 'Image (real)' : 'Image (virtual)', x, y + 4);
}

function OR_drawAngleArc(cx, cy, startAngle, endAngle, r, lbl) {
  noFill();
  OR_stroke('#FF9800', 0.7);
  strokeWeight(1.5);
  arc(cx, cy, r * 2, r * 2, startAngle, endAngle);
  var midAngle = (startAngle + endAngle) / 2;
  var lx = cx + (r + 12) * Math.cos(midAngle);
  var ly = cy + (r + 12) * Math.sin(midAngle);
  OR_fill('#FF9800', 0.8);
  textSize(11);
  textAlign(CENTER, CENTER);
  text(lbl, lx, ly);
}

function OR_drawNormal(x, y, len) {
  OR_stroke('#666666', 0.6);
  strokeWeight(1);
  drawingContext.setLineDash([4, 3]);
  line(x, y - len/2, x, y + len/2);
  drawingContext.setLineDash([]);
  OR_fill('#888888', 0.6);
  textSize(9);
  textAlign(LEFT, CENTER);
  text('N', x + 4, y - len/2 + 8);
}

function OR_drawPrism(cx, cy, size, angle_deg) {
  var col = (OR_cfg.pvl_colors && OR_cfg.pvl_colors.element) || '#80CBC4';
  OR_stroke(col, 0.8);
  strokeWeight(2);
  var c = OR_rgb(col);
  fill(c[0], c[1], c[2], 40);
  var halfA = (angle_deg || 60) * Math.PI / 360;
  var h = size;
  var halfBase = h * Math.tan(halfA);
  triangle(cx, cy - h * 0.6, cx - halfBase, cy + h * 0.4, cx + halfBase, cy + h * 0.4);
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: Lens (convex / concave)
// ══════════════════════════════════════════════════════════════
function OR_drawLensScenario(cfg, st, isConvex) {
  var elem = cfg.optical_element || {};
  var cx = elem.position_x || OR_CW / 2;
  var cy = elem.position_y || OR_CH / 2;
  var f = elem.focal_length || (isConvex ? 100 : -100);
  var fAbs = Math.abs(f);
  var lensH = 220;

  var objDist = OR_objDist;
  if (st.object_distance !== undefined) {
    objDist = st.object_distance;
  }
  if (objDist === 0 && cfg.object) {
    objDist = cfg.object.position_x || -200;
  }

  var objH = (cfg.object && cfg.object.height) || 60;
  var objLabel = (cfg.object && cfg.object.label) || 'Object';
  var objX = cx + objDist;
  var objY = cy;

  var u = objDist;
  var fSigned = isConvex ? fAbs : -fAbs;
  var img = OR_lensImage(u, fSigned);
  var imgX = cx + img.v;
  var imgH = img.m * objH;
  var isReal = img.v > 0;
  if (!isConvex) isReal = false;

  OR_drawPrincipalAxis(cy);
  if (cfg.show_focal_points) OR_drawFocalPoints(cx, cy, fAbs, true);
  if (isConvex) OR_drawConvexLens(cx, cy, lensH, f);
  else OR_drawConcaveLens(cx, cy, lensH, f);

  if (st.show_object) OR_drawObject(objX, objY, objH, objLabel);

  var visibleRays = st.visible_rays || [];
  var rayCol = (cfg.pvl_colors && cfg.pvl_colors.ray) || '#FFF176';
  var virtCol = (cfg.pvl_colors && cfg.pvl_colors.virtual_ray) || '#CE93D8';
  var objTopX = objX;
  var objTopY = objY - objH;

  for (var ri = 0; ri < visibleRays.length; ri++) {
    var rayId = visibleRays[ri];
    var rayDef = null;
    for (var rj = 0; rj < (cfg.rays || []).length; rj++) {
      if (cfg.rays[rj].id === rayId) { rayDef = cfg.rays[rj]; break; }
    }
    var rCol = (rayDef && rayDef.color) || rayCol;
    var rType = (rayDef && rayDef.type) || 'parallel';

    if (isConvex) {
      OR_drawConvexLensRay(rType, objTopX, objTopY, cx, cy, fAbs, rCol, virtCol, imgX, cy - imgH);
    } else {
      OR_drawConcaveLensRay(rType, objTopX, objTopY, cx, cy, fAbs, rCol, virtCol, imgX, cy - imgH);
    }
  }

  if (st.show_image && Math.abs(img.v) < 5000) {
    OR_drawImage(imgX, cy, imgH, isReal);
  }

  if (cfg.show_measurements && st.show_image) {
    OR_drawMeasurements(cx, cy, objDist, img.v, img.m, 'lens');
  }

  OR_drawSlider(cfg, st, cx, cy, fAbs, 'lens');
}

function OR_drawConvexLensRay(rType, ox, oy, cx, cy, fAbs, col, virtCol, imgX, imgY) {
  if (rType === 'parallel') {
    OR_drawRay(ox, oy, cx, oy, col, false);
    var slope = (cy - oy) / fAbs;
    var endX = cx + fAbs * 2.5;
    var endY = oy + slope * (endX - cx);
    OR_drawRay(cx, oy, endX, endY, col, false);
  } else if (rType === 'through_focus') {
    var fX = cx - fAbs;
    var slopeToF = (cy - oy) / (fX - ox);
    var yAtLens = oy + slopeToF * (cx - ox);
    OR_drawRay(ox, oy, cx, yAtLens, col, false);
    OR_drawRay(cx, yAtLens, cx + fAbs * 2.5, yAtLens, col, false);
  } else if (rType === 'through_center') {
    var slope2 = (cy - oy) / (cx - ox);
    var endX2 = cx + fAbs * 2.5;
    var endY2 = cy + slope2 * (endX2 - cx);
    OR_drawRay(ox, oy, endX2, endY2, col, false);
  }
}

function OR_drawConcaveLensRay(rType, ox, oy, cx, cy, fAbs, col, virtCol, imgX, imgY) {
  if (rType === 'parallel') {
    OR_drawRay(ox, oy, cx, oy, col, false);
    var fX = cx - fAbs;
    var slope = (oy - cy) / (cx - fX);
    var endX = cx + fAbs * 2;
    var endY = oy + slope * (endX - cx);
    OR_drawRay(cx, oy, endX, endY, col, false);
    OR_drawRay(fX, cy, cx, oy, virtCol, true);
  } else if (rType === 'through_focus') {
    var fPrimeX = cx + fAbs;
    var slopeToFP = (cy - oy) / (fPrimeX - ox);
    var yAtLens = oy + slopeToFP * (cx - ox);
    OR_drawRay(ox, oy, cx, yAtLens, col, false);
    OR_drawRay(cx, yAtLens, cx + fAbs * 2, yAtLens, col, false);
  } else if (rType === 'through_center') {
    var slope2 = (cy - oy) / (cx - ox);
    var endX2 = cx + fAbs * 2;
    var endY2 = cy + slope2 * (endX2 - cx);
    OR_drawRay(ox, oy, endX2, endY2, col, false);
  }
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: Mirror (concave / convex)
// ══════════════════════════════════════════════════════════════
function OR_drawMirrorScenario(cfg, st, isConcave) {
  var elem = cfg.optical_element || {};
  var cx = elem.position_x || OR_CW * 0.7;
  var cy = elem.position_y || OR_CH / 2;
  var f = elem.focal_length || (isConcave ? -100 : 100);
  var fAbs = Math.abs(f);
  var mirrorH = 220;
  var R = 2 * fAbs;

  var objDist = OR_objDist;
  if (st.object_distance !== undefined) {
    objDist = st.object_distance;
  }
  if (objDist === 0 && cfg.object) {
    objDist = cfg.object.position_x || -200;
  }

  var objH = (cfg.object && cfg.object.height) || 60;
  var objLabel = (cfg.object && cfg.object.label) || 'Object';
  var objX = cx + objDist;
  var objY = cy;

  var u = objDist;
  var fSigned = isConcave ? -fAbs : fAbs;
  var img = OR_mirrorImage(u, fSigned);
  var imgX = cx + img.v;
  var imgH = img.m * objH;
  var isReal = isConcave ? (img.v < 0) : false;

  OR_drawPrincipalAxis(cy);
  if (cfg.show_focal_points) OR_drawFocalPoints(cx, cy, fAbs, false);
  if (isConcave) OR_drawConcaveMirror(cx, cy, mirrorH, R);
  else OR_drawConvexMirror(cx, cy, mirrorH, R);

  if (st.show_object) OR_drawObject(objX, objY, objH, objLabel);

  var visibleRays = st.visible_rays || [];
  var rayCol = (cfg.pvl_colors && cfg.pvl_colors.ray) || '#FFF176';
  var virtCol = (cfg.pvl_colors && cfg.pvl_colors.virtual_ray) || '#CE93D8';
  var objTopX = objX;
  var objTopY = objY - objH;

  for (var ri = 0; ri < visibleRays.length; ri++) {
    var rayId = visibleRays[ri];
    var rayDef = null;
    for (var rj = 0; rj < (cfg.rays || []).length; rj++) {
      if (cfg.rays[rj].id === rayId) { rayDef = cfg.rays[rj]; break; }
    }
    var rCol = (rayDef && rayDef.color) || rayCol;
    var rType = (rayDef && rayDef.type) || 'parallel';

    if (isConcave) {
      OR_drawConcaveMirrorRay(rType, objTopX, objTopY, cx, cy, fAbs, rCol, virtCol);
    } else {
      OR_drawConvexMirrorRay(rType, objTopX, objTopY, cx, cy, fAbs, rCol, virtCol);
    }
  }

  if (st.show_image && Math.abs(img.v) < 5000) {
    OR_drawImage(imgX, cy, imgH, isReal);
  }

  if (cfg.show_measurements && st.show_image) {
    OR_drawMeasurements(cx, cy, objDist, img.v, img.m, 'mirror');
  }

  OR_drawSlider(cfg, st, cx, cy, fAbs, 'mirror');
}

function OR_drawConcaveMirrorRay(rType, ox, oy, cx, cy, fAbs, col, virtCol) {
  var fX = cx - fAbs;
  var cX = cx - 2 * fAbs;

  if (rType === 'parallel') {
    OR_drawRay(ox, oy, cx, oy, col, false);
    var slope = (cy - oy) / (fX - cx);
    var endX = fX - fAbs;
    var endY = oy + slope * (endX - cx);
    OR_drawRay(cx, oy, endX, endY, col, false);
  } else if (rType === 'through_focus') {
    var slopeToF = (cy - oy) / (fX - ox);
    var yAtMirror = oy + slopeToF * (cx - ox);
    OR_drawRay(ox, oy, cx, yAtMirror, col, false);
    OR_drawRay(cx, yAtMirror, ox - fAbs, yAtMirror, col, false);
  } else if (rType === 'through_center') {
    var slopeToC = (cy - oy) / (cX - ox);
    var yAtMirror = oy + slopeToC * (cx - ox);
    OR_drawRay(ox, oy, cx, yAtMirror, col, false);
    var endX = ox - fAbs;
    var endY = yAtMirror + (yAtMirror - oy) / (cx - ox) * (endX - cx);
    OR_drawRay(cx, yAtMirror, endX, endY, col, false);
  }
}

function OR_drawConvexMirrorRay(rType, ox, oy, cx, cy, fAbs, col, virtCol) {
  var fX = cx + fAbs;
  var cX = cx + 2 * fAbs;

  if (rType === 'parallel') {
    OR_drawRay(ox, oy, cx, oy, col, false);
    var slope = (oy - cy) / (cx - fX);
    var endX = ox - fAbs;
    var endY = oy + slope * (endX - cx);
    OR_drawRay(cx, oy, endX, endY, col, false);
    OR_drawRay(cx, oy, fX, cy, virtCol, true);
  } else if (rType === 'through_focus') {
    var slopeToF = (cy - oy) / (fX - ox);
    var yAtMirror = oy + slopeToF * (cx - ox);
    OR_drawRay(ox, oy, cx, yAtMirror, col, false);
    OR_drawRay(cx, yAtMirror, ox - fAbs, yAtMirror, col, false);
    OR_drawRay(cx, yAtMirror, fX, cy, virtCol, true);
  } else if (rType === 'through_center') {
    var slopeToC = (cy - oy) / (cX - ox);
    var yAtMirror = oy + slopeToC * (cx - ox);
    OR_drawRay(ox, oy, cx, yAtMirror, col, false);
    var slope2 = (yAtMirror - cy) / (cx - cX);
    var endX = ox - fAbs;
    var endY = yAtMirror + slope2 * (endX - cx);
    OR_drawRay(cx, yAtMirror, endX, endY, col, false);
    OR_drawRay(cx, yAtMirror, cX, cy, virtCol, true);
  }
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: Refraction at flat surface (Snell's law)
// ══════════════════════════════════════════════════════════════
function OR_drawRefractionFlat(cfg, st) {
  var elem = cfg.optical_element || {};
  var ix = elem.position_x || OR_CW / 2;
  var iy = elem.position_y || OR_CH / 2;
  var n1 = elem.refractive_index_1 || 1.0;
  var n2 = elem.refractive_index_2 || 1.5;

  var rayCol = (cfg.pvl_colors && cfg.pvl_colors.ray) || '#FFF176';
  var visibleRays = st.visible_rays || [];

  noStroke();
  fill(135, 206, 250, 30);
  rect(0, 0, OR_CW, iy);
  fill(100, 149, 237, 50);
  rect(0, iy, OR_CW, OR_CH - iy);

  OR_stroke('#B0BEC5', 0.6);
  strokeWeight(2);
  line(0, iy, OR_CW, iy);

  OR_fill('#D4D4D8', 0.8);
  textSize(14);
  textAlign(LEFT, TOP);
  text('Medium 1 (n\u2081 = ' + n1.toFixed(2) + ')', 20, 20);
  text('Medium 2 (n\u2082 = ' + n2.toFixed(2) + ')', 20, iy + 20);

  OR_drawNormal(ix, iy, 250);

  var theta_i = 0.6;
  if (st.object_distance !== undefined) {
    theta_i = Math.abs(st.object_distance) * Math.PI / 180;
    if (theta_i > Math.PI / 2 - 0.01) theta_i = Math.PI / 2 - 0.01;
  }

  if (visibleRays.length === 0) visibleRays = ['incident'];

  for (var ri = 0; ri < visibleRays.length; ri++) {
    var incLen = 180;
    var incX = ix - incLen * Math.sin(theta_i);
    var incY = iy - incLen * Math.cos(theta_i);
    OR_drawRay(incX, incY, ix, iy, rayCol, false);

    var theta_r = OR_snellRefraction(theta_i, n1, n2);
    if (theta_r !== null) {
      var refLen = 180;
      var refX = ix + refLen * Math.sin(theta_r);
      var refY = iy + refLen * Math.cos(theta_r);
      OR_drawRay(ix, iy, refX, refY, '#66BB6A', false);

      OR_drawAngleArc(ix, iy, -Math.PI/2 - theta_i, -Math.PI/2, 40,
        '\u03B8\u2081=' + (theta_i * 180 / Math.PI).toFixed(1) + '\u00B0');
      OR_drawAngleArc(ix, iy, Math.PI/2, Math.PI/2 + theta_r, 40,
        '\u03B8\u2082=' + (theta_r * 180 / Math.PI).toFixed(1) + '\u00B0');
    }

    var rx2 = ix + 80 * Math.sin(theta_i);
    var ry2 = iy - 80 * Math.cos(theta_i);
    OR_stroke('#999999', 0.3);
    strokeWeight(1);
    line(ix, iy, rx2, ry2);
  }

  OR_fill('#FF9800', 0.9);
  textSize(14);
  textAlign(CENTER, BOTTOM);
  text('n\u2081 sin\u03B8\u2081 = n\u2082 sin\u03B8\u2082', OR_CW / 2, OR_CH - 20);

  if (n1 < n2) {
    OR_fill('#D4D4D8', 0.7);
    textSize(12);
    text('Ray bends TOWARD normal (entering denser medium)', OR_CW / 2, OR_CH - 40);
  } else {
    OR_fill('#D4D4D8', 0.7);
    textSize(12);
    text('Ray bends AWAY from normal (entering rarer medium)', OR_CW / 2, OR_CH - 40);
  }
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: Total Internal Reflection
// ══════════════════════════════════════════════════════════════
function OR_drawTIR(cfg, st) {
  var elem = cfg.optical_element || {};
  var ix = elem.position_x || OR_CW / 2;
  var iy = elem.position_y || OR_CH / 2;
  var n1 = elem.refractive_index_1 || 1.5;
  var n2 = elem.refractive_index_2 || 1.0;

  var rayCol = (cfg.pvl_colors && cfg.pvl_colors.ray) || '#FFF176';

  noStroke();
  fill(100, 149, 237, 50);
  rect(0, iy, OR_CW, OR_CH - iy);
  fill(135, 206, 250, 25);
  rect(0, 0, OR_CW, iy);

  OR_stroke('#B0BEC5', 0.6);
  strokeWeight(2);
  line(0, iy, OR_CW, iy);

  OR_fill('#D4D4D8', 0.8);
  textSize(14);
  textAlign(LEFT, BOTTOM);
  text('Rarer (n\u2082 = ' + n2.toFixed(2) + ')', 20, iy - 10);
  textAlign(LEFT, TOP);
  text('Denser (n\u2081 = ' + n1.toFixed(2) + ')', 20, iy + 10);

  OR_drawNormal(ix, iy, 250);

  var thetaC = OR_criticalAngle(n1, n2);
  var thetaCDeg = thetaC ? (thetaC * 180 / Math.PI) : 42;

  var theta_i = 0.5;
  var visibleRays = st.visible_rays || ['below_critical'];

  for (var ri = 0; ri < visibleRays.length; ri++) {
    var rType = visibleRays[ri];

    if (rType === 'below_critical' || rType === 'incident') {
      theta_i = thetaC ? thetaC * 0.6 : 0.4;
    } else if (rType === 'at_critical') {
      theta_i = thetaC || 0.73;
    } else if (rType === 'above_critical') {
      theta_i = thetaC ? thetaC + 0.25 : 0.98;
    } else if (rType === 'slider') {
      theta_i = (st.object_distance || 30) * Math.PI / 180;
    }

    var incLen = 180;
    var incX = ix - incLen * Math.sin(theta_i);
    var incY = iy + incLen * Math.cos(theta_i);
    OR_drawRay(incX, incY, ix, iy, rayCol, false);

    OR_drawAngleArc(ix, iy, Math.PI/2, Math.PI/2 + theta_i, 40,
      '\u03B8\u1D62=' + (theta_i * 180 / Math.PI).toFixed(1) + '\u00B0');

    var theta_r = OR_snellRefraction(theta_i, n1, n2);

    if (theta_r !== null && theta_i < (thetaC || 99)) {
      var refLen = 150;
      var refX = ix + refLen * Math.sin(theta_r);
      var refY = iy - refLen * Math.cos(theta_r);
      OR_drawRay(ix, iy, refX, refY, '#66BB6A', false);
      var reflX = ix + 80 * Math.sin(theta_i);
      var reflY = iy + 80 * Math.cos(theta_i);
      OR_stroke('#999999', 0.3);
      strokeWeight(1);
      line(ix, iy, reflX, reflY);

      OR_drawAngleArc(ix, iy, -Math.PI/2 - theta_r, -Math.PI/2, 40,
        '\u03B8\u1D63=' + (theta_r * 180 / Math.PI).toFixed(1) + '\u00B0');
    } else {
      var reflLen = 180;
      var reflX2 = ix + reflLen * Math.sin(theta_i);
      var reflY2 = iy + reflLen * Math.cos(theta_i);
      OR_drawRay(ix, iy, reflX2, reflY2, '#EF5350', false);

      OR_fill('#EF5350', 0.9);
      textSize(13);
      textAlign(CENTER, CENTER);
      text('TOTAL INTERNAL REFLECTION', OR_CW / 2, 40);
    }
  }

  OR_fill('#FF9800', 0.8);
  textSize(13);
  textAlign(CENTER, BOTTOM);
  if (thetaC) {
    text('Critical angle \u03B8c = sin\u207B\u00B9(n\u2082/n\u2081) = ' + thetaCDeg.toFixed(1) + '\u00B0',
      OR_CW / 2, OR_CH - 15);
  }
  OR_fill('#D4D4D8', 0.6);
  textSize(11);
  text('TIR only when: denser \u2192 rarer AND \u03B8 > \u03B8c', OR_CW / 2, OR_CH - 35);
}

// ══════════════════════════════════════════════════════════════
// SCENARIO: Prism Dispersion
// ══════════════════════════════════════════════════════════════
function OR_drawPrismDispersion(cfg, st) {
  var elem = cfg.optical_element || {};
  var cx = elem.position_x || OR_CW / 2;
  var cy = elem.position_y || OR_CH / 2;
  var prismAngle = elem.prism_angle || 60;
  var prismA_rad = prismAngle * Math.PI / 180;

  OR_drawPrism(cx, cy, 160, prismAngle);

  var visibleRays = st.visible_rays || ['white_light'];

  var spectrum = [
    { name: 'Violet', color: '#8B00FF', n: 1.532 },
    { name: 'Indigo', color: '#4B0082', n: 1.528 },
    { name: 'Blue',   color: '#0000FF', n: 1.524 },
    { name: 'Green',  color: '#00FF00', n: 1.519 },
    { name: 'Yellow', color: '#FFFF00', n: 1.517 },
    { name: 'Orange', color: '#FF8C00', n: 1.514 },
    { name: 'Red',    color: '#FF0000', n: 1.512 }
  ];

  var halfBase = 160 * Math.tan(prismA_rad / 2);
  var prismLeft = cx - halfBase;
  var prismRight = cx + halfBase;
  var prismTop = cy - 160 * 0.6;
  var prismBottom = cy + 160 * 0.4;

  var entryX = prismLeft + (cx - prismLeft) * 0.3;
  var entryY = prismBottom - (prismBottom - prismTop) * 0.45;

  for (var vi = 0; vi < visibleRays.length; vi++) {
    var rType = visibleRays[vi];

    if (rType === 'white_light' || rType === 'incident') {
      var incStartX = entryX - 200;
      var incStartY = entryY - 30;
      OR_stroke('#FFFFFF', 0.9);
      strokeWeight(3);
      line(incStartX, incStartY, entryX, entryY);
      OR_fill('#FFFFFF', 0.9);
      noStroke();
      var whiteAng = Math.atan2(entryY - incStartY, entryX - incStartX);
      push();
      translate(entryX - 30, entryY - 10);
      rotate(whiteAng);
      triangle(0, 0, -10, -4, -10, 4);
      pop();

      OR_fill('#FFFFFF', 0.8);
      textSize(12);
      textAlign(RIGHT, BOTTOM);
      text('White light', entryX - 50, entryY - 15);
    }

    if (rType === 'spectrum' || rType === 'dispersed') {
      var exitX = prismRight - (cx - prismLeft) * 0.3;
      var exitY = entryY + 10;

      for (var si = 0; si < spectrum.length; si++) {
        var sp = spectrum[si];
        var dev = OR_prismDeviation(sp.n, prismA_rad);
        var baseAngle = 0.3;
        var angle = baseAngle + dev * 0.8 + si * 0.035;

        var rayLen = 200;
        var endX = exitX + rayLen * Math.cos(angle);
        var endY = exitY + rayLen * Math.sin(angle);

        OR_stroke(sp.color, 0.85);
        strokeWeight(2);
        line(exitX, exitY, endX, endY);

        OR_fill(sp.color, 0.9);
        textSize(10);
        textAlign(LEFT, CENTER);
        text(sp.name, endX + 5, endY);
      }

      OR_stroke('#FFFFFF', 0.15);
      strokeWeight(1);
      line(entryX, entryY, exitX, exitY);
    }

    if (rType === 'single_color') {
      var exitX2 = prismRight - (cx - prismLeft) * 0.3;
      var exitY2 = entryY + 10;
      var n_single = elem.refractive_index_1 || 1.52;
      var dev2 = OR_prismDeviation(n_single, prismA_rad);
      var endX2 = exitX2 + 200 * Math.cos(0.3 + dev2 * 0.8);
      var endY2 = exitY2 + 200 * Math.sin(0.3 + dev2 * 0.8);
      var singleCol = (cfg.pvl_colors && cfg.pvl_colors.ray) || '#FFF176';
      OR_drawRay(exitX2, exitY2, endX2, endY2, singleCol, false);
    }
  }

  OR_fill('#FF9800', 0.9);
  textSize(13);
  textAlign(CENTER, BOTTOM);
  text('\u03B4 = (n - 1)A  (thin prism)', OR_CW / 2, OR_CH - 15);
  OR_fill('#D4D4D8', 0.6);
  textSize(11);
  text('n(violet) > n(red) \u2192 violet deviates most', OR_CW / 2, OR_CH - 35);
}

// ══════════════════════════════════════════════════════════════
// COMMON UTILITIES
// ══════════════════════════════════════════════════════════════

function OR_drawMeasurements(cx, cy, u, v, m, type) {
  OR_fill('#D4D4D8', 0.7);
  textSize(11);
  textAlign(LEFT, TOP);
  var y0 = 15;
  text('u = ' + u.toFixed(1) + ' px', 15, y0);
  text('v = ' + v.toFixed(1) + ' px', 15, y0 + 16);
  text('m = ' + m.toFixed(2), 15, y0 + 32);
  if (type === 'lens') {
    text('1/v - 1/u = 1/f', 15, y0 + 48);
  } else {
    text('1/v + 1/u = 1/f', 15, y0 + 48);
  }
}

function OR_drawSlider(cfg, st, cx, cy, fAbs, type) {
  if (OR_state !== 'STATE_4') {
    if (OR_sliderEl) { OR_sliderEl.style.display = 'none'; }
    if (OR_sliderValEl) { OR_sliderValEl.style.display = 'none'; }
    return;
  }
  if (!st.object_distance && st.object_distance !== 0) return;

  if (!OR_sliderEl) {
    OR_sliderEl = document.createElement('input');
    OR_sliderEl.type = 'range';
    OR_sliderEl.min = '-400';
    OR_sliderEl.max = '-30';
    OR_sliderEl.value = String(OR_objDist || -200);
    OR_sliderEl.style.cssText = 'position:fixed;bottom:50px;left:50%;transform:translateX(-50%);width:300px;accent-color:#42A5F5;z-index:20;';
    document.body.appendChild(OR_sliderEl);

    OR_sliderValEl = document.createElement('div');
    OR_sliderValEl.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);color:#FF9800;font:13px monospace;z-index:20;';
    document.body.appendChild(OR_sliderValEl);

    OR_sliderEl.addEventListener('input', function() {
      OR_objDist = parseFloat(OR_sliderEl.value);
    });
  }

  OR_sliderEl.style.display = 'block';
  OR_sliderValEl.style.display = 'block';
  OR_sliderValEl.textContent = 'Object distance: ' + Math.abs(OR_objDist).toFixed(0) + ' px';
}

function OR_drawCaption(st) {
  if (!st || !st.caption) return;
  OR_fill('#D4D4D8', 0.85);
  textSize(13);
  textAlign(CENTER, TOP);
  text(st.caption, OR_CW / 2, 10);
}

function OR_drawBorderFlash() {
  if (OR_state !== OR_prevSt) {
    OR_flash = 1;
    OR_prevSt = OR_state;
  }
  if (OR_flash > 0) {
    noFill();
    stroke(59, 130, 246, OR_flash * 0.6 * 255);
    strokeWeight(3);
    rect(1, 1, width - 2, height - 2, 4);
    noStroke();
    OR_flash -= 0.025;
  }
}

function OR_updateLegend(cfg, st) {
  var el = document.getElementById('legend');
  if (!el) return;

  var scenario = (cfg.scenario_type || '').toLowerCase();
  var lines = [];

  lines.push('<b>' + (st.label || OR_state) + '</b>');

  if (scenario === 'convex_lens') {
    lines.push('Convex lens: f > 0 (converging)');
    lines.push('1/v - 1/u = 1/f');
    lines.push('<span style="color:#4FC3F7">\u25CF</span> Object  <span style="color:#66BB6A">\u25CF</span> Real image  <span style="color:#CE93D8">\u25CF</span> Virtual image');
  } else if (scenario === 'concave_lens') {
    lines.push('Concave lens: f < 0 (diverging)');
    lines.push('Image: always virtual, erect, diminished');
    lines.push('<span style="color:#4FC3F7">\u25CF</span> Object  <span style="color:#CE93D8">\u25CF</span> Virtual image');
  } else if (scenario === 'concave_mirror') {
    lines.push('Concave mirror: f = R/2');
    lines.push('1/v + 1/u = 1/f');
    lines.push('<span style="color:#4FC3F7">\u25CF</span> Object  <span style="color:#66BB6A">\u25CF</span> Real  <span style="color:#CE93D8">\u25CF</span> Virtual');
  } else if (scenario === 'convex_mirror') {
    lines.push('Convex mirror: always virtual, erect');
    lines.push('Image between P and F');
    lines.push('<span style="color:#4FC3F7">\u25CF</span> Object  <span style="color:#CE93D8">\u25CF</span> Virtual image');
  } else if (scenario === 'refraction_flat') {
    lines.push('Snell\u2019s Law: n\u2081 sin\u03B8\u2081 = n\u2082 sin\u03B8\u2082');
    lines.push('Angles measured from NORMAL');
  } else if (scenario === 'total_internal_reflection') {
    lines.push('TIR: denser \u2192 rarer only');
    lines.push('\u03B8c = sin\u207B\u00B9(n\u2082/n\u2081)');
    lines.push('\u03B8 > \u03B8c \u2192 total reflection');
  } else if (scenario === 'prism_dispersion') {
    lines.push('\u03B4 = (n-1)A');
    lines.push('n(V) > n(R): violet deviates most');
    lines.push('VIBGYOR spectrum');
  }

  el.innerHTML = lines.join('<br>');
}

// ── postMessage bridge ───────────────────────────────────────
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.type) return;

  if (e.data.type === 'INIT_CONFIG') {
    window.SIM_CONFIG = e.data.config;
    OR_cfg = e.data.config;
    OR_state = 'STATE_1';
    OR_time = 0;
    OR_objDist = (OR_cfg.object && OR_cfg.object.position_x) || -200;
    console.log('[OpticsRay] INIT_CONFIG received');
    parent.postMessage({ type: 'SIM_READY' }, '*');
  }

  if (e.data.type === 'SET_STATE') {
    var ns = e.data.state;
    if (OR_cfg && OR_cfg.states && OR_cfg.states[ns]) {
      OR_state = ns;
      if (OR_cfg.states[ns].object_distance !== undefined) {
        OR_objDist = OR_cfg.states[ns].object_distance;
      }
      console.log('[OpticsRay] SET_STATE \u2192', ns);
      parent.postMessage({ type: 'STATE_REACHED', state: ns }, '*');
    }
  }

  if (e.data.type === 'PING') {
    parent.postMessage({ type: 'PONG' }, '*');
  }
});
