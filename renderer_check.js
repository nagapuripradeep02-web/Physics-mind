// ============================================================
// Mechanics 2D Renderer — p5.js global mode
// Reads window.SIM_CONFIG (Mechanics2DConfig)
// ============================================================

var M2_cfg;
var M2_state  = 'STATE_1';
var M2_simT   = 0;      // current simulation time (seconds)
var M2_path   = [];     // [{x,y}] accumulated trajectory
var M2_flash  = 0;      // border-flash alpha (fades after state change)
var M2_prevSt = 'STATE_1';
var M2_G      = 9.8;    // m/s²

// ── New-format (EpicConfig) globals ─────────────────────────
var M2_isNewFormat  = false;
var M2_newStates    = {};
var M2_newStateKey  = 'STATE_1';
var M2_animPhase    = 0;        // continuous phase for ambient animations
var M2_sliderValues = {};       // { id: value } for canvas sliders

// ── colour helpers ──────────────────────────────────────────
function M2_rgb(h) {
  if (!h || h.length < 7) return [200,200,200];
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
function M2_fill(h, a) {
  var c = M2_rgb(h);
  fill(c[0], c[1], c[2], (a===undefined?1:a)*255);
}
function M2_stroke(h, a) {
  var c = M2_rgb(h);
  stroke(c[0], c[1], c[2], (a===undefined?1:a)*255);
}

// ── SETUP ───────────────────────────────────────────────────
function setup() {
  M2_cfg = window.SIM_CONFIG;
  if (!M2_cfg) { console.error('[Mechanics2D] No SIM_CONFIG'); return; }
  M2_isNewFormat = (M2_cfg.epic_l_path !== undefined);
  if (M2_isNewFormat) {
    M2_newStates   = (M2_cfg.epic_l_path && M2_cfg.epic_l_path.states) || {};
    M2_newStateKey = 'STATE_1';
  }
  createCanvas(M2_cfg.canvas_width || 800, M2_cfg.canvas_height || 500);
  frameRate(60);
  parent.postMessage({ type: 'SIM_READY' }, '*');
}

// ── MAIN DRAW ───────────────────────────────────────────────
function draw() {
  if (!M2_cfg) return;
  // ── New-format early return ─────────────────────────────
  if (M2_isNewFormat) {
    M2_animPhase += 0.016;
    M2_drawNewScenario();
    return;
  }
  var cfg = M2_cfg;
  var st  = cfg.states && cfg.states[M2_state];
  if (!st) return;

  var bg = (cfg.pvl_colors && cfg.pvl_colors.background) || '#0A0A1A';
  background(bg);

  var dt   = 1 / 60;
  var scen = (cfg.scenario || 'projectile').toLowerCase();

  // ── Projectile: state-driven time control ──────────────────
  if (scen === 'projectile') {
    var ic_p  = cfg.initial_conditions || {};
    var v0_p  = ic_p.v0 || 20;
    var th_p  = ((ic_p.angle_deg || 45) * Math.PI) / 180;
    var vy0_p = v0_p * Math.sin(th_p);
    var tFlight_p = (2 * vy0_p) / M2_G;
    if (tFlight_p <= 0) tFlight_p = 3;

    var freezeT_p = (typeof st.freeze_at_t === 'number') ? st.freeze_at_t : -1;

    if (freezeT_p >= 0) {
      // Frozen at a specific moment
      if (M2_simT < freezeT_p) {
        M2_simT += dt;
        if (M2_simT > freezeT_p) M2_simT = freezeT_p;
      }
    } else {
      // Free-running animation — loop on full flight
      M2_simT += dt;
      if (M2_simT > tFlight_p + 0.3) {
        M2_simT = 0;
        M2_path = [];
      }
    }

  } else {
    // ── Non-projectile: freeze_at_t takes priority over loop ──
    var tgt = (typeof st.time_step === 'number' && st.time_step > 0) ? st.time_step : 5;
    var freezeT = (typeof st.freeze_at_t === 'number') ? st.freeze_at_t : -1;

    if (freezeT >= 0) {
      // Frozen state — advance toward freeze_at_t then hold
      if (M2_simT < freezeT) {
        M2_simT += dt;
        if (M2_simT > freezeT) M2_simT = freezeT;
      }
      // Once reached, hold forever — no reset
    } else {
      // Looping state — animate and reset at time_step
      M2_simT += dt;
      if (M2_simT > tgt) {
        M2_simT = 0;
        M2_path = [];
      }
    }
  }

  // ── Build path trail every frame (only while animating) ────
  var shouldTrail = cfg.show_path && st.show_path !== false;
  // For projectile STATE_1, skip trail; STATE_4 accumulates then holds
  if (shouldTrail && scen === 'projectile' && M2_state === 'STATE_1') {
    shouldTrail = false;
  }
  if (shouldTrail) {
    var pp = M2_getPos((cfg.objects && cfg.objects[0]), M2_simT);
    if (pp) M2_path.push({ x: pp.x, y: pp.y });
    if (M2_path.length > 600) M2_path.shift();
  }

  // ── Compute positions for all objects ─────────────────────
  var positions = {};
  if (cfg.objects) {
    for (var i = 0; i < cfg.objects.length; i++) {
      var obj = cfg.objects[i];
      positions[obj.id] = M2_getPos(obj, M2_simT);
    }
  }

  // ── Draw layers (back → front) ─────────────────────────────
  M2_drawSurface(cfg);
  
  if (scen === 'projectile') {
    var pX  = width * 0.10;
    var dW  = width - 2 * pX;
    var gY  = height * 0.85;
    
    push();
    strokeWeight(2);
    M2_stroke('#4FC3F7', 0.8);
    line(pX - 5, gY - 5, pX + 5, gY + 5);
    line(pX - 5, gY + 5, pX + 5, gY - 5);
    
    M2_stroke('#FF8A65', 0.8);
    line(pX + dW - 5, gY - 5, pX + dW + 5, gY + 5);
    line(pX + dW - 5, gY + 5, pX + dW + 5, gY - 5);
    pop();
  }
  M2_drawPulleyAndRope(cfg, positions);
  M2_drawSpring(cfg, positions);
  if (cfg.show_path && st.show_path !== false) M2_drawPath(cfg);
  M2_drawForces(cfg, st, positions);
  if (scen === 'non_inertial_frame') {
    M2_drawFrameBackground(cfg, M2_state);
  }
  M2_drawObjects(cfg, positions);
  M2_drawPendulumPeriodLabels(cfg, positions);   // ← ADD THIS LINE
  M2_drawVelocityArrows(cfg, st, positions);
  if (cfg.show_energy_bar) M2_drawEnergyBars(cfg, M2_simT);
  M2_drawAngleArcs(cfg, st, positions);

  // ── Projectile STATE_3: draw "vy = 0" annotation at apex ──
  if (scen === 'projectile' && M2_state === 'STATE_3') {
    var apexObj = cfg.objects && cfg.objects[0];
    if (apexObj) {
      var apexPos = positions[apexObj.id];
      if (apexPos) {
        noStroke();
        fill(255, 200, 0, 220);
        textSize(12);
        textAlign(CENTER, BOTTOM);
        text('v\\u1D67 = 0  (apex)', apexPos.x, apexPos.y - 22);
      }
    }
  }

  M2_drawLabel(st);
  M2_drawBorderFlash();

  // ── Unknown scenario warning ────────────────────────────────
  if (window._M2_unknownScenario) {
    push();
    noStroke();
    fill(220, 80, 40, 220);
    rect(10, 10, width - 20, 48, 6);
    fill(255, 255, 255, 240);
    textSize(12);
    textAlign(LEFT, CENTER);
    text('[mechanics_2d] Unknown scenario: "' + window._M2_unknownScenario + '"', 20, 24);
    textSize(11);
    fill(255, 200, 180, 200);
    text('Add this branch to M2_getPos() in mechanics_2d_renderer.ts', 20, 44);
    pop();
    console.error('[Mechanics2D] Unknown scenario:', window._M2_unknownScenario);
  }
}

// ── DRAW: accelerating frame background (for non_inertial_frame) ─
function M2_drawFrameBackground(cfg, state) {
  var fOff = (typeof window._M2_frameOffset === 'number') ? window._M2_frameOffset : 0;
  var ic  = cfg.initial_conditions || {};
  var acc = ic.frame_acceleration_ms2 || 5;
  // Box stays fixed in STATE_3/STATE_4 to show resolution
  var boxOff = (state === 'STATE_3' || state === 'STATE_4') ? 0 : fOff * 0.3;

  push();
  noFill();
  stroke(180, 130, 50, 200);
  strokeWeight(2);
  rect(width * 0.15 + boxOff, height * 0.2, width * 0.65, height * 0.55, 12);

  // 'Accelerating Bus' label inside box
  fill(180, 130, 50, 160);
  noStroke();
  textSize(11);
  textAlign(CENTER, CENTER);
  text('Accelerating Bus', width * 0.15 + boxOff + width * 0.325, height * 0.78);

  // Ground arrow below box (stays fixed — ground is reference)
  stroke(255, 165, 50, 200);
  strokeWeight(2.5);
  var arrowY = height * 0.88;
  line(width * 0.15, arrowY, width * 0.75, arrowY);
  fill(255, 165, 50, 200);
  noStroke();
  triangle(width*0.77, arrowY, width*0.73, arrowY-8, width*0.73, arrowY+8);

  fill(255, 165, 50, 180);
  textSize(11);
  textAlign(CENTER, CENTER);
  text('Frame accelerating at ' + acc + ' m/s\u00b2  \u2192', width * 0.5, arrowY + 18);
  pop();
}

// ── PHYSICS: Full flight canvas mapping (projectile only) ──
function M2_projCanvasMap(realX, realY) {
  var ic = M2_cfg.initial_conditions || {};
  var v0   = ic.v0 || 20;
  var ang  = ((ic.angle_deg || 45) * Math.PI) / 180;
  var vx0  = v0 * Math.cos(ang);
  var vy0  = v0 * Math.sin(ang);
  var g    = M2_G;
  
  var tFlight  = (2 * vy0) / g;
  if (tFlight <= 0) tFlight = 1;
  var maxRange = vx0 * tFlight;
  var maxH     = (vy0 * vy0) / (2 * g);
  
  var padX  = width * 0.10;
  var padY  = height * 0.10;
  var drawW = width - 2 * padX;
  var drawH = height * 0.65;
  var groundY = height * 0.85;
  
  var canvasX = padX + (maxRange === 0 ? 0 : (realX / maxRange) * drawW);
  var canvasY = groundY - (maxH === 0 ? 0 : (realY / (maxH * 1.3)) * drawH);
  
  return { x: canvasX, y: canvasY };
}

// ── PHYSICS: compute object position at time t ──────────────
function M2_getPos(obj, t) {
  if (!obj || !M2_cfg) return { x: 0, y: 0, vx: 0, vy: 0 };
  var cfg  = M2_cfg;
  var ic   = cfg.initial_conditions || {};
  var sc   = cfg.canvas_scale || 50;
  var scen = (cfg.scenario || 'projectile').toLowerCase();

  var x = obj.initial_x, y = obj.initial_y, vx = 0, vy = 0;

  // ── projectile ──────────────────────────────────────────
  if (scen === 'projectile') {
    var v0  = ic.v0 || 20;
    var th  = ((ic.angle_deg || 45) * Math.PI) / 180;
    var vx0 = v0 * Math.cos(th);
    var vy0 = v0 * Math.sin(th);          // physics: +y = up

    var realX = vx0 * t;
    var realY = vy0 * t - 0.5 * M2_G * t * t;
    if (realY < 0 && t > 0) realY = 0; // clamp to ground
    
    var pos = M2_projCanvasMap(realX, realY);
    x  = pos.x;
    y  = pos.y;
    
    // Scale velocities just for arrow rendering sizes (px/s equivalent)
    vx = vx0 * sc;
    vy = (-vy0 + M2_G * t) * sc;         // screen: +y = down

  // ── pendulum ────────────────────────────────────────────
  } else if (scen === 'pendulum') {
    if (obj.shape === 'pendulum_bob' || obj.id.indexOf('bob') !== -1) {
      // Per-object fields take priority — allows dual/triple pendulum configs
      var L   = (typeof obj.pendulum_length_m  === 'number') ? obj.pendulum_length_m  : (ic.length_m  || 1.0);
      var th0_deg = (typeof obj.pendulum_angle_deg === 'number') ? obj.pendulum_angle_deg : (ic.angle_deg || 30);
      var th0 = (th0_deg * Math.PI) / 180;
      var om  = Math.sqrt(M2_G / L);
      var tht = th0 * Math.cos(om * t);

      // Per-object pivot overrides cfg.pulley (which is the shared global pivot)
      var px, py;
      if (typeof obj.pendulum_pivot_x === 'number' && typeof obj.pendulum_pivot_y === 'number') {
        px = obj.pendulum_pivot_x;
        py = obj.pendulum_pivot_y;
      } else if (cfg.pulley) {
        px = cfg.pulley.x;
        py = cfg.pulley.y;
      } else {
        px = width / 2;
        py = height * 0.15;
      }

      x  = px + L * sc * Math.sin(tht);
      y  = py + L * sc * Math.cos(tht);
      var dth = -om * th0 * Math.sin(om * t);
      vx = L * sc * Math.cos(tht) * dth;
      vy = -L * sc * Math.sin(tht) * dth;
    }

  // ── circular ────────────────────────────────────────────
  } else if (scen === 'circular') {
    var r_c  = (ic.radius_m || 2) * sc;
    var v_c  = ic.speed_ms || 10;
    var om_c = v_c / (ic.radius_m || 2);         // rad/s
    var cx   = ic.center_x != null ? ic.center_x : width  / 2;
    var cy   = ic.center_y != null ? ic.center_y : height / 2;
    var ph0  = ((ic.start_angle_deg || 0) * Math.PI) / 180;
    var phi  = ph0 + om_c * t;
    x  = cx + r_c * Math.cos(phi);
    y  = cy - r_c * Math.sin(phi);               // flip y: CCW = up
    vx = -v_c * sc * Math.sin(phi) / sc;         // keep in px/frame-like units
    vy =  v_c * sc * Math.cos(phi) / sc;
    vx = vx * sc; vy = vy * sc;                  // scale for arrow drawing

  // ── friction (block on surface) ─────────────────────────
  } else if (scen === 'friction') {
    var slope_r = ((cfg.surface && cfg.surface.slope_degrees) || 0) * Math.PI / 180;
    var m_f     = obj.mass || 1;
    var mu_k    = ic.mu_k || 0.3;
    var mu_s    = ic.mu_s || 0.5;
    var F_app   = ic.f_applied || 0;
    var N       = m_f * M2_G * Math.cos(slope_r);
    var grav_along = m_f * M2_G * Math.sin(slope_r);
    var f_k     = mu_k * N;
    var F_net   = F_app + grav_along - f_k;       // net force along slope downward
    // Check static: if F_app < mu_s * N, block is static
    var f_s_max = mu_s * N;
    var sliding = (F_app > f_s_max) || (grav_along > f_s_max);
    var s = sliding ? (0.5 * (F_net / m_f) * t * t) : 0;
    x  = obj.initial_x + s * sc * Math.cos(slope_r);
    y  = obj.initial_y + s * sc * Math.sin(slope_r);
    vx = 0; vy = 0;

  // ── spring-mass ─────────────────────────────────────────
  } else if (scen === 'spring_mass') {
    var k_s  = ic.spring_k || 10;
    var m_s  = obj.mass || 1;
    var A_s  = ic.amplitude_m || 0.5;
    var om_s = Math.sqrt(k_s / m_s);
    var ph_s = ((ic.phase_deg || 0) * Math.PI) / 180;
    x  = obj.initial_x + A_s * sc * Math.cos(om_s * t + ph_s);
    y  = obj.initial_y;
    vx = -A_s * sc * om_s * Math.sin(om_s * t + ph_s);
    vy = 0;

  // ── Atwood machine ──────────────────────────────────────
  } else if (scen === 'atwood') {
    var m1_a = ic.mass1_kg || 2;
    var m2_a = ic.mass2_kg || 1;
    var a_at = (m1_a - m2_a) / (m1_a + m2_a) * M2_G;
    // First object in array = heavier (goes down = +y in screen)
    var isFirst = (!M2_cfg.objects || obj === M2_cfg.objects[0]);
    var sign_a  = isFirst ? 1 : -1;
    var disp    = 0.5 * a_at * t * t;
    x  = obj.initial_x;
    y  = obj.initial_y + sign_a * disp * sc;
    vx = 0;
    vy = sign_a * a_at * t * sc;

  // ── work-energy ─────────────────────────────────────────
  } else if (scen === 'work_energy') {
    var F_we = ic.force_n || 10;
    var m_we = obj.mass  || 1;
    var a_we = F_we / m_we;
    x  = obj.initial_x + 0.5 * a_we * sc * t * t;
    y  = obj.initial_y;
    vx = a_we * sc * t;
    vy = 0;

  // ── conservation of momentum ─────────────────────────────
  } else if (scen === 'momentum') {
    var tc    = ic.collision_time || 1;
    var objs  = M2_cfg.objects || [];
    var isObj0 = (objs.length > 0 && obj === objs[0]);
    var m1_p = (objs[0] ? objs[0].mass : 1) || 1;
    var m2_p = (objs[1] ? objs[1].mass : 1) || 1;
    var v1i  = ic.v1_initial || 5;
    var v2i  = ic.v2_initial || 0;
    // Elastic collision velocities:
    var v1f = ((m1_p - m2_p) * v1i + 2 * m2_p * v2i) / (m1_p + m2_p);
    var v2f = ((m2_p - m1_p) * v2i + 2 * m1_p * v1i) / (m1_p + m2_p);
    if (isObj0) {
      var vi = t < tc ? v1i : v1f;
      var xc = obj.initial_x + v1i * sc * tc;
      x  = t < tc ? (obj.initial_x + v1i * sc * t) : (xc + v1f * sc * (t - tc));
      vx = vi * sc;
    } else {
      var vi2 = t < tc ? v2i : v2f;
      var xc2 = obj.initial_x + v2i * sc * tc;
      x  = t < tc ? (obj.initial_x + v2i * sc * t) : (xc2 + v2f * sc * (t - tc));
      vx = vi2 * sc;
    }
    y = obj.initial_y; vy = 0;

  // ── torque/rotation ─────────────────────────────────────
  } else if (scen === 'torque') {
    var I_t   = ic.moment_of_inertia || 1;
    var tau_t = ic.torque_nm || 5;
    var alph  = tau_t / I_t;
    var r_t   = (ic.radius_m || 1) * sc;
    var ang_t = 0.5 * alph * t * t;
    x  = obj.initial_x + r_t * Math.cos(ang_t - Math.PI / 2);
    y  = obj.initial_y + r_t * Math.sin(ang_t - Math.PI / 2);
    vx = 0; vy = 0;

  // ── banked road ─────────────────────────────────────────
  } else if (scen === 'banking') {
    x = obj.initial_x; y = obj.initial_y;
    vx = (ic.speed_ms || 20) * sc * 0.03; vy = 0;

  // ── non_inertial_frame (pseudo-forces / accelerating frame) ──
  } else if (scen === 'non_inertial_frame') {
    var a_frame = ic.frame_acceleration_ms2 || 5;
    // Object stays fixed; frame box animates rightward
    x = obj.initial_x;
    y = obj.initial_y;
    vx = 0; vy = 0;
    // Animate frame offset for the box overlay
    window._M2_frameOffset = (window._M2_frameOffset || 0);
    if (M2_state === 'STATE_1' || M2_state === 'STATE_2') {
      window._M2_frameOffset += a_frame * (1/60) * 4.0;
      if (window._M2_frameOffset > 120) window._M2_frameOffset = 0;
    } else if (M2_state === 'STATE_3' || M2_state === 'STATE_4') {
      window._M2_frameOffset = 0;
    }

  // ── free_body_diagram (fluids, equilibrium, generic) ─────────
  } else if (scen === 'free_body_diagram') {
    // Static object, no motion, only forces shown
    x = obj.initial_x;
    y = obj.initial_y;
    vx = 0; vy = 0;
  } else {
    // ── UNKNOWN SCENARIO — flag it ────────────────────────────
    window._M2_unknownScenario = cfg.scenario || 'undefined';
    x = obj.initial_x;
    y = obj.initial_y;
    vx = 0; vy = 0;
  }

  return { x: x, y: y, vx: vx, vy: vy };
}

// ── DRAW: ground / inclined surface ─────────────────────────
function M2_drawSurface(cfg) {
  if (!cfg.surface || !cfg.surface.exists) return;
  var scen = (cfg.scenario || 'projectile').toLowerCase();
  var sColor    = cfg.surface.color || '#555555';

  if (scen === 'projectile') {
    var padX  = width * 0.10;
    var drawW = width - 2 * padX;
    var groundY = height * 0.85;

    push();
    M2_stroke(sColor, 0.9);
    strokeWeight(2);
    line(0, groundY, width, groundY);

    M2_fill(sColor, 0.15);
    noStroke();
    rect(0, groundY, width, height - groundY);

    M2_stroke(sColor, 0.4);
    strokeWeight(1);
    for (var hx = 20; hx < width; hx += 20) {
      line(hx, groundY, hx - 10, groundY + 10);
    }
    pop();
    return;
  }

  var slope_deg = cfg.surface.slope_degrees || 0;
  var slope_r   = slope_deg * Math.PI / 180;

  push();
  translate(0, height);
  rotate(-slope_r);

  // Surface line
  M2_stroke(sColor, 0.9);
  strokeWeight(2);
  line(0, 0, width * 1.5, 0);

  // Ground fill
  M2_fill(sColor, 0.15);
  noStroke();
  beginShape();
  vertex(0, 0);
  vertex(width * 1.5, 0);
  vertex(width * 1.5, height * 0.5);
  vertex(0, height * 0.5);
  endShape(CLOSE);

  // Hatch marks
  M2_stroke(sColor, 0.4);
  strokeWeight(1);
  for (var hx = 0; hx < width * 1.5; hx += 20) {
    line(hx, 0, hx - 12, 12);
  }
  pop();
}

// ── DRAW: pulley + rope ─────────────────────────────────────
function M2_drawPulleyAndRope(cfg, positions) {
  var scen = (cfg.scenario || '').toLowerCase();

  if (scen === 'pendulum') {
    // Each pendulum-bob may have its own pivot — draw pivot dot + rope for each
    var objs = cfg.objects || [];
    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];
      if (obj.shape !== 'pendulum_bob' && obj.id.indexOf('bob') === -1) continue;
      var op = positions[obj.id];
      if (!op) continue;

      // Determine this bob's pivot
      var pivX, pivY;
      if (typeof obj.pendulum_pivot_x === 'number' && typeof obj.pendulum_pivot_y === 'number') {
        pivX = obj.pendulum_pivot_x;
        pivY = obj.pendulum_pivot_y;
      } else if (cfg.pulley) {
        pivX = cfg.pulley.x;
        pivY = cfg.pulley.y;
      } else {
        pivX = width / 2;
        pivY = height * 0.15;
      }

      // Draw pivot point
      noFill();
      M2_stroke('#AAAAAA', 0.9);
      strokeWeight(2);
      ellipse(pivX, pivY, 16, 16);
      M2_fill('#CCCCCC', 0.9);
      noStroke();
      ellipse(pivX, pivY, 6, 6);

      // Draw rope from pivot to bob
      M2_stroke('#DDDDDD', 0.7);
      strokeWeight(2);
      noFill();
      line(pivX, pivY + 8, op.x, op.y);
    }
    return;
  }

  // Non-pendulum: original pulley drawing
  if (!cfg.pulley) return;
  var px = cfg.pulley.x, py = cfg.pulley.y, pr = cfg.pulley.radius || 20;
  noFill();
  M2_stroke('#AAAAAA', 0.9);
  strokeWeight(2);
  ellipse(px, py, pr * 2);
  M2_stroke('#888888', 0.6);
  strokeWeight(4);
  ellipse(px, py, pr * 2 - 4);
  noStroke();
  M2_fill('#CCCCCC', 0.9);
  ellipse(px, py, 6);

  // Atwood ropes
  if ((cfg.scenario || '').toLowerCase() === 'atwood') {
    M2_stroke('#DDDDDD', 0.7);
    strokeWeight(2);
    noFill();
    var objs = cfg.objects || [];
    for (var j = 0; j < objs.length; j++) {
      var op2 = positions[objs[j].id];
      if (!op2) continue;
      var side = (j === 0) ? -1 : 1;
      line(px + side * pr, py, op2.x, op2.y);
    }
  }
}

// ── DRAW: zigzag spring ─────────────────────────────────────
function M2_drawSpring(cfg, positions) {
  if (!cfg.spring) return;
  var ax = cfg.spring.anchor_x, ay = cfg.spring.anchor_y;
  var sc = cfg.canvas_scale || 50;
  var objs = cfg.objects || [];
  // Connect to first object
  var op = objs.length > 0 ? positions[objs[0].id] : null;
  var bx = op ? op.x : ax, by = op ? op.y : ay + 100;

  var segs = 12, amp = 10;
  var dx = (bx - ax) / (segs + 1), dy = (by - ay) / (segs + 1);
  var len = Math.sqrt(dx*dx + dy*dy);
  // Perpendicular direction
  var nx = -dy / len, ny = dx / len;

  M2_stroke('#00BCD4', 0.8);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(ax, ay);
  // First straight segment (1/2)
  vertex(ax + dx * 0.5, ay + dy * 0.5);
  for (var j = 0; j < segs; j++) {
    var cx = ax + dx * (0.5 + j + 0.5);
    var cy = ay + dy * (0.5 + j + 0.5);
    var side = (j % 2 === 0) ? 1 : -1;
    vertex(cx + nx * amp * side, cy + ny * amp * side);
  }
  // Last straight segment
  vertex(ax + dx * (segs + 0.5), ay + dy * (segs + 0.5));
  vertex(bx, by);
  endShape();

  // Anchor dot
  noStroke();
  M2_fill('#888888', 0.9);
  ellipse(ax, ay, 10);
}

// ── DRAW: trajectory path ───────────────────────────────────
function M2_drawPath(cfg) {
  if (M2_path.length < 2) return;
  noFill();
  for (var i = 1; i < M2_path.length; i++) {
    var alpha = (i / M2_path.length) * 0.6;
    M2_stroke('#FFFFFF', alpha);
    strokeWeight(1);
    // Dotted effect: draw every other segment
    if (i % 3 !== 0) {
      line(M2_path[i-1].x, M2_path[i-1].y, M2_path[i].x, M2_path[i].y);
    }
  }
  noStroke();
}

// ── DRAW: force arrows ───────────────────────────────────────
function M2_drawForces(cfg, st, positions) {
  if (!cfg.forces || cfg.forces.length === 0) return;

  // Compute max magnitude for proportional scaling
  var maxMag = 0;
  for (var i = 0; i < cfg.forces.length; i++) {
    if (cfg.forces[i].magnitude > maxMag) maxMag = cfg.forces[i].magnitude;
  }
  if (maxMag === 0) maxMag = 1;
  var arrowScale = 80;   // pixels for max-magnitude force
  var arrowMin   = 24;   // minimum arrow length — no force ever renders below this

  var hlForces = (st.highlight_forces) || [];

  for (var fi = 0; fi < cfg.forces.length; fi++) {
    var fv = cfg.forces[fi];
    // Visibility: check show_in_states
    if (fv.show_in_states && fv.show_in_states.length > 0) {
      var visible = false;
      for (var si = 0; si < fv.show_in_states.length; si++) {
        if (fv.show_in_states[si] === M2_state) { visible = true; break; }
      }
      if (!visible) continue;
    }

    // Find attached object position
    var op = positions[fv.on_object];
    if (!op) {
      // Try first object as fallback
      var firstObj = cfg.objects && cfg.objects[0];
      op = firstObj ? positions[firstObj.id] : { x: width/2, y: height/2 };
    }

    // Arrow geometry
    var dir_rad = fv.direction_degrees * Math.PI / 180;
    var len = Math.max(arrowMin, (fv.magnitude / maxMag) * arrowScale);
    var dx  =  Math.cos(dir_rad) * len;
    var dy  = -Math.sin(dir_rad) * len; // screen y flipped

    var isHL = hlForces.indexOf(fv.name) !== -1;
    var alpha = isHL ? 1.0 : 0.75;
    M2_drawArrow(op.x, op.y, op.x + dx, op.y + dy, fv.color, fv.name, alpha, cfg.show_labels);
  }
}

// ── UTILITY: draw arrow with label ───────────────────────────
function M2_drawArrow(x1, y1, x2, y2, col, label, alpha, showLabel) {
  var dx = x2 - x1, dy = y2 - y1;
  var len = Math.sqrt(dx*dx + dy*dy);
  if (len < 2) return;

  M2_stroke(col, alpha);
  strokeWeight(2.5);
  line(x1, y1, x2, y2);

  // Arrowhead
  var hSize = 10;
  var ang   = Math.atan2(dy, dx);
  fill(M2_rgb(col)[0], M2_rgb(col)[1], M2_rgb(col)[2], alpha * 255);
  noStroke();
  push();
  translate(x2, y2);
  rotate(ang);
  triangle(0, 0, -hSize, -hSize * 0.4, -hSize, hSize * 0.4);
  pop();

  // Label — zone-based to avoid overlap
  if (showLabel && label) {
    var angle = Math.atan2(dy, dx); // -PI to PI
    var lx, ly;

    // RIGHT force (angle near 0): label in right zone
    if (angle > -0.8 && angle < 0.8) {
      lx = Math.max(x1, x2) + 28;
      ly = (y1 + y2) / 2;
    }
    // LEFT force (angle near PI or -PI): label in left zone
    else if (angle > 2.3 || angle < -2.3) {
      lx = Math.min(x1, x2) - 28;
      ly = (y1 + y2) / 2;
    }
    // UP force (angle near -PI/2): label above and to the right
    else if (angle < -0.8 && angle > -2.3) {
      lx = (x1 + x2) / 2 + 36;
      ly = Math.min(y1, y2) - 8;
    }
    // DOWN force (angle near PI/2): label below and to the right
    else {
      lx = (x1 + x2) / 2 + 36;
      ly = Math.max(y1, y2) + 16;
    }

    // Dark pill background
    textSize(11);
    var tw = textWidth(label);
    noStroke();
    fill(0, 0, 0, 200);
    rect(lx - tw/2 - 4, ly - 9, tw + 8, 18, 4);

    // Label text
    fill(M2_rgb(col)[0], M2_rgb(col)[1], M2_rgb(col)[2], alpha * 230);
    textAlign(CENTER, CENTER);
    text(label, lx, ly);
  }
}

// ── DRAW: velocity arrows (with optional components) ─────────
function M2_drawVelocityArrows(cfg, st, positions) {
  if (!cfg.objects) return;
  var scen = (cfg.scenario || '').toLowerCase();
  // Don't draw velocity arrows for static/banking displays
  if (scen === 'banking' || scen === 'friction') return;

  for (var i = 0; i < cfg.objects.length; i++) {
    var obj = cfg.objects[i];
    var op  = positions[obj.id];
    if (!op) continue;
    var vx = op.vx || 0, vy = op.vy || 0;
    var speed = Math.sqrt(vx*vx + vy*vy);
    if (speed < 0.5) continue;

    // Scale to readable length (max 60px)
    var maxV = 80;
    var scale = Math.min(60, Math.sqrt(speed)) / Math.sqrt(maxV);
    var dvx = vx * scale, dvy = vy * scale;

    M2_drawArrow(op.x, op.y, op.x + dvx, op.y + dvy, '#FFEB3B', 'v', 0.85, cfg.show_labels);

    // Component decomposition
    if (cfg.show_components) {
      if (Math.abs(dvx) > 2) M2_drawArrow(op.x, op.y, op.x + dvx, op.y, '#4FC3F7', 'v\\u2093', 0.7, cfg.show_labels);
      if (Math.abs(dvy) > 2) M2_drawArrow(op.x, op.y, op.x, op.y + dvy, '#EF9A9A', 'v\\u1D67', 0.7, cfg.show_labels);
    }

    // Centripetal acceleration arrow (circular only)
    if (scen === 'circular' && cfg.initial_conditions) {
      var ic  = cfg.initial_conditions;
      var cx  = ic.center_x != null ? ic.center_x : width  / 2;
      var cy2 = ic.center_y != null ? ic.center_y : height / 2;
      var ax  = cx - op.x, ay  = cy2 - op.y;
      var aLen = Math.sqrt(ax*ax + ay*ay);
      if (aLen > 2) {
        var aScale = 45 / aLen;
        M2_drawArrow(op.x, op.y, op.x + ax*aScale, op.y + ay*aScale, '#F48FB1', 'a\\u2063', 0.75, cfg.show_labels);
      }
    }
  }
}

// ── DRAW: pendulum period labels ─────────────────────────────
function M2_drawPendulumPeriodLabels(cfg, positions) {
  var scen = (cfg.scenario || '').toLowerCase();
  if (scen !== 'pendulum') return;
  var objs = cfg.objects || [];
  var sc   = cfg.canvas_scale || 50;
  
  // Only draw period labels when there are 2+ pendulum bobs
  var bobs = objs.filter(function(o) { 
    return o.shape === 'pendulum_bob' || o.id.indexOf('bob') !== -1; 
  });
  if (bobs.length < 2) return;

  for (var i = 0; i < bobs.length; i++) {
    var obj = bobs[i];
    var L = (typeof obj.pendulum_length_m === 'number') ? obj.pendulum_length_m : (cfg.initial_conditions.length_m || 1.0);
    var T = 2 * Math.PI * Math.sqrt(L / M2_G);

    var pivX = (typeof obj.pendulum_pivot_x === 'number') ? obj.pendulum_pivot_x : width / 2;
    var pivY = (typeof obj.pendulum_pivot_y === 'number') ? obj.pendulum_pivot_y : height * 0.15;

    // Draw T label above pivot
    textSize(12);
    textAlign(CENTER, BOTTOM);
    noStroke();
    
    // Background pill
    var lbl = 'T = ' + T.toFixed(2) + 's';
    var tw = textWidth(lbl);
    fill(0, 0, 0, 160);
    rect(pivX - tw/2 - 6, pivY - 34, tw + 12, 20, 4);
    
    // Text in object's color
    var col = obj.color || '#FFFFFF';
    fill(M2_rgb(col)[0], M2_rgb(col)[1], M2_rgb(col)[2], 230);
    text(lbl, pivX, pivY - 16);
  }

  // If all T values are equal (within 0.01s), add a banner: "T₁ = T₂ — mass doesn't matter"
  if (bobs.length >= 2) {
    var L0 = (typeof bobs[0].pendulum_length_m === 'number') ? bobs[0].pendulum_length_m : (cfg.initial_conditions.length_m || 1.0);
    var T0 = 2 * Math.PI * Math.sqrt(L0 / M2_G);
    var allSame = true;
    for (var j = 1; j < bobs.length; j++) {
      var Lj = (typeof bobs[j].pendulum_length_m === 'number') ? bobs[j].pendulum_length_m : (cfg.initial_conditions.length_m || 1.0);
      var Tj = 2 * Math.PI * Math.sqrt(Lj / M2_G);
      if (Math.abs(Tj - T0) > 0.01) { allSame = false; break; }
    }
    if (allSame) {
      // Green confirmation banner at bottom
      noStroke();
      fill(30, 158, 117, 200);
      rect(width/2 - 170, height - 46, 340, 28, 6);
      fill(255, 255, 255, 240);
      textSize(12);
      textAlign(CENTER, CENTER);
      text('T\\u2081 = T\\u2082  \\u2014  period is independent of mass', width/2, height - 32);
    }
  }
}

// ── DRAW: energy bars (KE / PE / Total) ─────────────────────
function M2_drawEnergyBars(cfg, t) {
  var ic    = cfg.initial_conditions || {};
  var scen  = (cfg.scenario || '').toLowerCase();
  var objs  = cfg.objects || [];
  var m     = (objs[0] ? objs[0].mass : 1) || 1;
  var sc    = cfg.canvas_scale || 50;
  var KE = 0, PE = 0, Total = 0;

  if (scen === 'projectile') {
    var v0_e  = ic.v0 || 20;
    var th_e  = ((ic.angle_deg || 45) * Math.PI) / 180;
    var vy0_e = v0_e * Math.sin(th_e);
    // Height at time t (physics y, positive up)
    var h_e   = vy0_e * t - 0.5 * M2_G * t * t;
    Total = 0.5 * m * v0_e * v0_e;
    PE    = m * M2_G * Math.max(h_e, 0);
    KE    = Math.max(Total - PE, 0);

  } else if (scen === 'pendulum') {
    var L_e   = ic.length_m || 1.0;
    var th0_e = ((ic.angle_deg || 30) * Math.PI) / 180;
    var om_e  = Math.sqrt(M2_G / L_e);
    var tht_e = th0_e * Math.cos(om_e * t);
    Total = m * M2_G * L_e * (1 - Math.cos(th0_e));
    PE    = m * M2_G * L_e * (1 - Math.cos(tht_e));
    KE    = Math.max(Total - PE, 0);

  } else if (scen === 'spring_mass') {
    var k_e  = ic.spring_k || 10;
    var A_e  = ic.amplitude_m || 0.5;
    var om_e2 = Math.sqrt(k_e / m);
    var ph_e = ((ic.phase_deg || 0) * Math.PI) / 180;
    var x_disp = A_e * Math.cos(om_e2 * t + ph_e);
    Total = 0.5 * k_e * A_e * A_e;
    PE    = 0.5 * k_e * x_disp * x_disp;
    KE    = Math.max(Total - PE, 0);

  } else if (scen === 'work_energy') {
    var F_e = ic.force_n || 10;
    var a_e = F_e / m;
    var v_e = a_e * t;
    KE    = 0.5 * m * v_e * v_e;
    PE    = 0;
    Total = KE;

  } else if (scen === 'atwood') {
    var m1_e = ic.mass1_kg || 2;
    var m2_e = ic.mass2_kg || 1;
    var a_e2 = (m1_e - m2_e) / (m1_e + m2_e) * M2_G;
    var v_e2 = a_e2 * t;
    KE    = 0.5 * (m1_e + m2_e) * v_e2 * v_e2;
    var h_e2 = 0.5 * a_e2 * t * t;
    PE    = Math.abs((m1_e - m2_e)) * M2_G * h_e2;
    Total = KE + PE;

  } else {
    // Generic: show KE only
    var firstPos = objs.length > 0 ? M2_getPos(objs[0], t) : null;
    if (firstPos) {
      var spd = Math.sqrt(firstPos.vx*firstPos.vx + firstPos.vy*firstPos.vy) / (cfg.canvas_scale||50);
      KE = 0.5 * m * spd * spd;
    }
    Total = KE;
    PE    = 0;
  }

  // Render bars
  var barW = 28, barH = 120, bx = width - 120, by = 20;
  var maxE = Math.max(Total, 1);

  var bars = [
    { label: 'KE', val: KE,    color: '#FF9800' },
    { label: 'PE', val: PE,    color: '#42A5F5' },
    { label: 'E',  val: Total, color: '#66BB6A' },
  ];

  // Panel background
  noStroke();
  fill(0, 0, 0, 160);
  rect(bx - 10, by - 10, 110, barH + 50, 6);

  for (var bi = 0; bi < bars.length; bi++) {
    var bar  = bars[bi];
    var bxb  = bx + bi * 36;
    var barFill = constrain(bar.val / maxE, 0, 1) * barH;

    // Trough
    M2_stroke('#333333', 0.8);
    strokeWeight(1);
    noFill();
    rect(bxb, by, barW, barH, 3);

    // Fill
    noStroke();
    M2_fill(bar.color, 0.85);
    rect(bxb, by + barH - barFill, barW, barFill, 3);

    // Label below
    M2_fill(bar.color, 0.9);
    textSize(10);
    textAlign(CENTER, TOP);
    noStroke();
    text(bar.label, bxb + barW/2, by + barH + 6);

    // Value
    fill(200, 200, 200, 180);
    textSize(9);
    text(bar.val.toFixed(1), bxb + barW/2, by + barH + 18);
  }
  textAlign(LEFT, BASELINE);
}

// ── DRAW: angle arcs ─────────────────────────────────────────
function M2_drawAngleArcs(cfg, st, positions) {
  var scen = (cfg.scenario || '').toLowerCase();
  var ic   = cfg.initial_conditions || {};
  var sc   = cfg.canvas_scale || 50;

  if (scen === 'projectile') {
    // Launch angle arc from start position
    var obj0 = cfg.objects && cfg.objects[0];
    if (!obj0) return;
    var bx  = obj0.initial_x, by = obj0.initial_y;
    var ang = (ic.angle_deg || 45) * Math.PI / 180;
    var arcR = 40;
    noFill();
    M2_stroke('#FFD54F', 0.7);
    strokeWeight(1.5);
    arc(bx, by, arcR*2, arcR*2, -ang, 0);
    // Label
    M2_fill('#FFD54F', 0.8);
    noStroke();
    textSize(12);
    textAlign(LEFT, CENTER);
    text(Math.round(ic.angle_deg || 45) + '\\u00B0', bx + arcR + 6, by - arcR * 0.3);

  } else if (scen === 'pendulum') {
    // Equilibrium line
    var ppu = cfg.pulley;
    if (!ppu) return;
    M2_stroke('#555555', 0.5);
    strokeWeight(1);
    line(ppu.x, ppu.y, ppu.x, ppu.y + (ic.length_m||1)*sc);
    // Current angle arc
    var L_a  = ic.length_m || 1;
    var th0_a = (ic.angle_deg || 30) * Math.PI / 180;
    var om_a  = Math.sqrt(M2_G / L_a);
    var tht_a = th0_a * Math.cos(om_a * M2_simT);
    noFill();
    M2_stroke('#FFD54F', 0.6);
    strokeWeight(1.5);
    arc(ppu.x, ppu.y, 60, 60, Math.PI/2 - tht_a, Math.PI/2);

  } else if (scen === 'banking') {
    // Banking angle arc on the road
    var slope_b = ((cfg.surface && cfg.surface.slope_degrees) || 15) * Math.PI / 180;
    noFill();
    M2_stroke('#FFD54F', 0.7);
    strokeWeight(1.5);
    var bxb = width/2 - 40;
    arc(bxb, height - 20, 50, 50, -slope_b - Math.PI/2, -Math.PI/2);
    M2_fill('#FFD54F', 0.8);
    noStroke();
    textSize(11);
    textAlign(CENTER, CENTER);
    text(Math.round((cfg.surface&&cfg.surface.slope_degrees)||15) + '\\u00B0', bxb + 35, height - 35);
  }
}

// ── DRAW: objects ────────────────────────────────────────────
function M2_drawObjects(cfg, positions) {
  if (!cfg.objects) return;
  for (var i = 0; i < cfg.objects.length; i++) {
    var obj = cfg.objects[i];
    var op  = positions[obj.id];
    if (!op) continue;
    M2_drawOneObject(obj, op.x, op.y, cfg);
  }
}

function M2_drawOneObject(obj, ox, oy, cfg) {
  var col    = obj.color || '#FFFFFF';
  var sc     = cfg.canvas_scale || 50;
  var scen   = (cfg.scenario || '').toLowerCase();

  noStroke();
  M2_fill(col, 0.9);

  if (obj.shape === 'circle' || obj.shape === 'pendulum_bob') {
    var r = (obj.radius || 0.2) * sc;
    r = constrain(r, 8, 50);
    // Glow
    M2_fill(col, 0.12);
    ellipse(ox, oy, r * 3.2);
    M2_fill(col, 0.25);
    ellipse(ox, oy, r * 2.0);
    M2_fill(col, 0.9);
    ellipse(ox, oy, r);
    // Highlight
    fill(255, 255, 255, 60);
    ellipse(ox - r*0.22, oy - r*0.22, r * 0.45);

  } else if (obj.shape === 'rect') {
    var bw = (obj.width  || 0.8) * sc;
    var bh = (obj.height || 0.4) * sc;
    bw = constrain(bw, 20, 120);
    bh = constrain(bh, 12,  60);

    // Rotate if on inclined surface
    if (cfg.surface && cfg.surface.slope_degrees && cfg.surface.slope_degrees !== 0) {
      var slope_r = cfg.surface.slope_degrees * Math.PI / 180;
      push();
      translate(ox, oy);
      rotate(-slope_r);
      M2_fill(col, 0.85);
      rect(-bw/2, -bh/2, bw, bh, 3);
      // Shine
      fill(255, 255, 255, 25);
      rect(-bw/2, -bh/2, bw, bh/3, 3);
      pop();
    } else {
      M2_fill(col, 0.85);
      rect(ox - bw/2, oy - bh/2, bw, bh, 3);
      fill(255, 255, 255, 25);
      rect(ox - bw/2, oy - bh/2, bw, bh/3, 3);
    }
  }

  // Label — top-right corner of object, never at center
  if (cfg.show_labels && obj.label) {
    textSize(10);
    textAlign(LEFT, BOTTOM);
    var labelX = ox + (obj.shape === 'rect'
      ? (obj.width  || 0.8) * (cfg.canvas_scale || 50) * 0.5 + 4
      : (obj.radius || 0.2) * (cfg.canvas_scale || 50) + 4);
    var labelY = oy - (obj.shape === 'rect'
      ? (obj.height || 0.4) * (cfg.canvas_scale || 50) * 0.5
      : (obj.radius || 0.2) * (cfg.canvas_scale || 50));
    var lw = textWidth(obj.label);
    noStroke();
    fill(0, 0, 0, 160);
    rect(labelX - 2, labelY - 12, lw + 6, 14, 3);
    fill(200, 200, 200, 220);
    text(obj.label, labelX, labelY);
  }
}

// ── DRAW: state label ────────────────────────────────────────
function M2_drawLabel(st) {
  var lbl = st.label || M2_state;
  textSize(12);
  var tw = textWidth(lbl);
  noStroke();
  fill(0, 0, 0, 140);
  rect(8, height - 32, tw + 20, 24, 6);
  fill(200, 200, 210, 220);
  textAlign(LEFT, CENTER);
  text(lbl, 18, height - 20);
}

// ── DRAW: border flash on state change ───────────────────────
function M2_drawBorderFlash() {
  var curSt = M2_isNewFormat ? M2_newStateKey : M2_state;
  if (curSt !== M2_prevSt) {
    M2_flash  = 1.0;
    M2_prevSt = curSt;
  }
  if (M2_flash > 0) {
    noFill();
    stroke(59, 130, 246, M2_flash * 0.6 * 255);
    strokeWeight(3);
    rect(1, 1, width - 2, height - 2, 4);
    noStroke();
    M2_flash -= 0.025;
  }
}

// ── postMessage bridge ───────────────────────────────────────
window.addEventListener('message', function(e) {
  if (!e.data || !e.data.type) return;
  if (e.data.type === 'SET_STATE') {
    var ns = e.data.state;
    if (M2_isNewFormat) {
      if (M2_newStates[ns]) {
        M2_newStateKey  = ns;
        M2_simT         = 0;
        M2_animPhase    = 0;
        M2_path         = [];
        M2_sliderValues = {};
        parent.postMessage({ type: 'STATE_REACHED', state: ns }, '*');
      }
    } else {
      if (M2_cfg && M2_cfg.states && M2_cfg.states[ns]) {
        M2_simT  = 0;
        M2_path  = [];
        M2_state = ns;
        parent.postMessage({ type: 'STATE_REACHED', state: ns }, '*');
      }
    }
  }
});

// ── New-format helpers ────────────────────────────────────────

function M2_stateIdx() {
  var s = M2_newStateKey || 'STATE_1';
  var n = parseInt(s.replace('STATE_', ''), 10);
  return isNaN(n) ? 1 : n;
}

function M2_unknownBanner(name) {
  fill(40, 40, 40); noStroke(); rect(0, 0, width, height);
  fill(255, 220, 80); textAlign(CENTER, CENTER); textSize(16);
  text('Unknown scenario: ' + name, width/2, height/2);
}

function M2_drawNewStateBanner(stateData) {
  if (!stateData) return;
  var lbl = stateData.label || M2_newStateKey;
  M2_fill('#000000', 0.55);
  noStroke();
  rect(10, height - 38, 220, 28, 6);
  fill(255); textSize(12); textAlign(LEFT, CENTER);
  text(lbl, 18, height - 24);
}

function M2_newArrow(x1, y1, x2, y2, hexCol, lbl) {
  M2_drawArrow(x1, y1, x2, y2, hexCol, lbl, 1.0, lbl !== '');
}

function M2_textBox(x, y, txt, hexCol, sz) {
  var tw = textWidth(txt);
  M2_fill('#000000', 0.6);
  noStroke();
  rect(x - 6, y - (sz || 14) * 0.75, tw + 12, (sz || 14) * 1.4, 4);
  fill(hexCol || '#FFFFFF');
  textSize(sz || 14);
  textAlign(LEFT, BASELINE);
  text(txt, x, y);
}

function M2_getCanvasSliderVal(id, minV, maxV, defV, slotY, label) {
  if (M2_sliderValues[id] === undefined) M2_sliderValues[id] = defV;
  var slotX = 60, slotW = width - 120;
  var frac = (M2_sliderValues[id] - minV) / (maxV - minV);
  var knobX = slotX + frac * slotW;
  stroke('#555555'); strokeWeight(3); line(slotX, slotY, slotX + slotW, slotY);
  M2_fill('#FFDC64', 1.0); stroke('#888888'); strokeWeight(1);
  ellipse(knobX, slotY, 16, 16);
  fill('#CCCCCC'); noStroke(); textSize(11); textAlign(LEFT, CENTER);
  text(label + ': ' + M2_sliderValues[id].toFixed(1), slotX, slotY - 14);
  if (mouseIsPressed && abs(mouseY - slotY) < 18 && mouseX > slotX && mouseX < slotX + slotW) {
    var newFrac = constrain((mouseX - slotX) / slotW, 0, 1);
    M2_sliderValues[id] = parseFloat((minV + newFrac * (maxV - minV)).toFixed(1));
  }
  return M2_sliderValues[id];
}


// ── Shared Utility Functions ─────────────────────────────────────

function M2_drawAxes(ox, oy, xLen, yLen, xLabel, yLabel, col) {
  M2_stroke(col || '#555566', 0.8);
  strokeWeight(1);
  line(ox, oy, ox + xLen, oy);
  line(ox, oy, ox, oy - yLen);
  M2_fill(col || '#555566', 0.8);
  noStroke();
  triangle(ox + xLen, oy, ox + xLen - 6, oy - 3, ox + xLen - 6, oy + 3);
  triangle(ox, oy - yLen, ox - 3, oy - yLen + 6, ox + 3, oy - yLen + 6);
  fill(150); textSize(10);
  textAlign(CENTER, TOP); text(xLabel || 'x', ox + xLen - 10, oy + 4);
  textAlign(RIGHT, CENTER); text(yLabel || 'y', ox - 6, oy - yLen + 10);
}

function M2_drawAngleArc(cx, cy, r, startRad, endRad, col, label) {
  noFill();
  M2_stroke(col || '#FFD54F', 0.7);
  strokeWeight(1.5);
  arc(cx, cy, r * 2, r * 2, -endRad, -startRad);
  if (label) {
    var midA = (startRad + endRad) / 2;
    M2_fill(col || '#FFD54F', 0.8);
    noStroke(); textSize(11); textAlign(CENTER, CENTER);
    text(label, cx + (r + 14) * Math.cos(midA), cy - (r + 14) * Math.sin(midA));
  }
}

function M2_drawDashedLine(x1, y1, x2, y2, col, dashLen, gapLen) {
  M2_stroke(col || '#888888', 0.7);
  strokeWeight(1.5);
  drawingContext.setLineDash([dashLen || 6, gapLen || 4]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);
}

function M2_drawFormulaBox(x, y, w, lines, bgCol, txtCol) {
  var h = lines.length * 22 + 16;
  M2_fill(bgCol || '#000000', 0.65);
  noStroke();
  rect(x, y, w, h, 6);
  var c = txtCol ? M2_rgb(txtCol) : [220, 220, 230];
  for (var i = 0; i < lines.length; i++) {
    fill(c[0], c[1], c[2], 230);
    textSize(12); textAlign(LEFT, TOP);
    text(lines[i], x + 10, y + 8 + i * 22);
  }
}

function M2_drawParallelogram(ox, oy, ax, ay, bx, by, shade, outline) {
  M2_fill(shade || '#FFFFFF', 0.08);
  M2_stroke(outline || '#888888', 0.4);
  strokeWeight(1);
  beginShape();
  vertex(ox, oy); vertex(ox + ax, oy + ay);
  vertex(ox + ax + bx, oy + ay + by); vertex(ox + bx, oy + by);
  endShape(CLOSE);
}

function M2_drawVelocityTriangle(cx, cy, v1x, v1y, v1Col, v1Lbl, v2x, v2y, v2Col, v2Lbl, rCol, rLbl) {
  M2_newArrow(cx, cy, cx + v1x, cy + v1y, v1Col, v1Lbl);
  M2_newArrow(cx + v1x, cy + v1y, cx + v1x + v2x, cy + v1y + v2y, v2Col, v2Lbl);
  M2_newArrow(cx, cy, cx + v1x + v2x, cy + v1y + v2y, rCol, rLbl);
}

function M2_drawNumberLine(y, minVal, maxVal, col, nTicks) {
  var px1 = 50, px2 = width - 50;
  M2_stroke(col || '#AAAAAA', 0.8); strokeWeight(2);
  line(px1, y, px2, y);
  var n = nTicks || 5;
  for (var i = 0; i <= n; i++) {
    var tx = px1 + (px2 - px1) * i / n;
    var val = minVal + (maxVal - minVal) * i / n;
    strokeWeight(1); line(tx, y - 5, tx, y + 5);
    noStroke(); M2_fill(col || '#AAAAAA', 0.7);
    textSize(9); textAlign(CENTER, TOP);
    text(val.toFixed(0), tx, y + 7);
  }
  return { x1: px1, x2: px2 };
}

function M2_drawParticle(px, py, r, col, lbl) {
  noStroke();
  M2_fill(col || '#60a5fa', 0.15); ellipse(px, py, r * 3);
  M2_fill(col || '#60a5fa', 0.3); ellipse(px, py, r * 2);
  M2_fill(col || '#60a5fa', 0.9); ellipse(px, py, r);
  fill(255, 255, 255, 60); ellipse(px - r * 0.2, py - r * 0.2, r * 0.4);
  if (lbl) { M2_fill(col || '#60a5fa', 0.9); textSize(10); textAlign(CENTER, BOTTOM); noStroke(); text(lbl, px, py - r - 2); }
}

function M2_drawGraphCurve(ox, oy, w, h, points, col, cursorT, tMax) {
  M2_stroke(col || '#60a5fa', 0.9); strokeWeight(2); noFill();
  beginShape();
  for (var i = 0; i < points.length; i++) { vertex(ox + points[i].x * w, oy - points[i].y * h); }
  endShape();
  if (cursorT !== undefined && tMax > 0) {
    var cx2 = ox + (cursorT / tMax) * w;
    stroke(255, 255, 255, 150); strokeWeight(1);
    line(cx2, oy - h, cx2, oy);
    var frac = constrain(cursorT / tMax, 0, 1);
    var idx2 = Math.floor(frac * (points.length - 1));
    idx2 = constrain(idx2, 0, points.length - 2);
    var localF = frac * (points.length - 1) - idx2;
    var py2 = points[idx2].y + (points[idx2 + 1].y - points[idx2].y) * localF;
    M2_fill('#fbbf24', 1.0); noStroke(); ellipse(cx2, oy - py2 * h, 7, 7);
  }
}

function M2_easeInOut(val) { return val < 0.5 ? 2 * val * val : 1 - Math.pow(-2 * val + 2, 2) / 2; }

function M2_drawRightAngle(x, y, sz, rot) {
  push(); translate(x, y); rotate(rot || 0);
  noFill(); stroke(200, 200, 200, 150); strokeWeight(1);
  line(0, 0, sz, 0); line(sz, 0, sz, -sz);
  pop();
}

function M2_drawStickFigure(px, py, walking, umbAngleDeg) {
  var tm = millis();
  var legSw = walking ? ((tm % 1000 < 500) ? -1 : 1) : 0;
  stroke(220, 220, 220); strokeWeight(2); noFill();
  ellipse(px, py, 16, 16);
  line(px, py + 8, px, py + 38);
  line(px - 12, py + 20, px + 12, py + 20);
  line(px, py + 38, px + legSw * 10, py + 55);
  line(px, py + 38, px - legSw * 10, py + 55);
  if (umbAngleDeg !== undefined) {
    var ua = umbAngleDeg * Math.PI / 180;
    var ux = px + 45 * Math.sin(ua);
    var uy = py - 45 * Math.cos(ua);
    stroke(180, 120, 220); strokeWeight(2);
    line(px, py, ux, uy);
    noFill(); strokeWeight(2.5);
    arc(ux, uy, 70, 40, ua - Math.PI / 2 - Math.PI / 3, ua - Math.PI / 2 + Math.PI / 3);
  }
}

function M2_valFromFacts(cfg, key, fallback) {
  if (cfg.locked_facts && cfg.locked_facts[key] !== undefined) return cfg.locked_facts[key];
  if (cfg.variables && cfg.variables[key] !== undefined) return cfg.variables[key];
  return fallback;
}

function M2_paramSlot(cfg, key, fallback) {
  if (cfg.parameter_slots && cfg.parameter_slots[key] && cfg.parameter_slots[key]['default'] !== undefined) return cfg.parameter_slots[key]['default'];
  return fallback;
}

// ── Scenario Router (updated) ────────────────────────────────────

function M2_drawNewScenario() {
  var cfg = M2_cfg;
  var stateData = M2_newStates[M2_newStateKey] || {};
  var pl = stateData.physics_layer || {};
  var freeze = pl.freeze_at_t;
  if (freeze !== undefined && M2_simT >= freeze) {
    M2_simT = freeze;
  } else {
    M2_simT += 0.016;
  }
  var t = M2_simT;
  var scenario = (cfg.renderer_hint && cfg.renderer_hint.scenario_type) || 'vector_addition';
  if      (scenario === 'scalar_vs_vector')          M2_scalarVsVector(cfg, stateData, t);
  else if (scenario === 'vector_basics')             M2_vectorBasics(cfg, stateData, t);
  else if (scenario === 'vector_addition')           M2_vectorAddition(cfg, stateData, t);
  else if (scenario === 'vector_components')         M2_vectorComponents(cfg, stateData, t);
  else if (scenario === 'dot_product')               M2_dotProduct(cfg, stateData, t);
  else if (scenario === 'distance_vs_displacement')  M2_distanceVsDisplacement(cfg, stateData, t);
  else if (scenario === 'uniform_acceleration')      M2_uniformAcceleration(cfg, stateData, t);
  else if (scenario === 'non_uniform_acceleration')  M2_nonUniformAcceleration(cfg, stateData, t);
  else if (scenario === 'motion_graphs')             M2_motionGraphs(cfg, stateData, t);
  else if (scenario === 'relative_motion' || scenario === 'relative_velocity') M2_relativeMotion(cfg, stateData, t);
  else if (scenario === 'river_boat')                M2_riverBoat(cfg, stateData, t);
  else if (scenario === 'rain_umbrella')             M2_rainUmbrella(cfg, stateData, t);
  else if (scenario === 'aircraft_wind')             M2_aircraftWind(cfg, stateData, t);
  else                                               M2_unknownBanner(scenario);
  M2_drawNewStateBanner(stateData);
  M2_drawBorderFlash();
}

// ── Environment Painters (enhanced) ──────────────────────────────

function M2_drawRiverEnv(t, d_m) {
  for (var sy = 0; sy < height * 0.30; sy++) {
    var sf = sy / (height * 0.30);
    stroke(140 + sf * 40, 190 + sf * 20, 220 + sf * 20); strokeWeight(1);
    line(0, sy, width, sy);
  }
  M2_fill('#7B5B3A', 1.0); noStroke();
  rect(0, height * 0.30, width, height * 0.05);
  M2_fill('#5C8A3C', 1.0);
  rect(0, 0, width, height * 0.30);
  for (var ry = 0; ry < height * 0.30; ry++) {
    var rf = ry / (height * 0.30);
    stroke(30 + rf * 20, 80 + rf * 20, 160 + rf * 30); strokeWeight(1);
    line(0, height * 0.35 + ry, width, height * 0.35 + ry);
  }
  for (var wp = 0; wp < 50; wp++) {
    var wx = ((wp * 47 + t * 50) % (width + 80)) - 40;
    var wy = height * 0.35 + (wp * 31 % (height * 0.30));
    M2_fill('#88BBFF', 0.4); noStroke();
    ellipse(wx, wy, 4, 2);
  }
  for (var ca = 0; ca < 5; ca++) {
    var cax = ((ca * 160 + t * 60) % (width + 100)) - 50;
    var cay = height * 0.40 + ca * height * 0.05;
    M2_stroke('#64B4FF', 0.5); strokeWeight(1.5);
    drawingContext.setLineDash([8, 5]);
    line(cax, cay, cax + 40, cay);
    drawingContext.setLineDash([]);
    M2_fill('#64B4FF', 0.5); noStroke();
    triangle(cax + 42, cay, cax + 36, cay - 3, cax + 36, cay + 3);
  }
  M2_fill('#7B5B3A', 1.0); noStroke();
  rect(0, height * 0.65, width, height * 0.05);
  M2_fill('#5C8A3C', 1.0);
  rect(0, height * 0.70, width, height * 0.30);
  fill(255, 255, 255, 200); textSize(11); textAlign(LEFT, CENTER);
  text('BANK A', 10, height * 0.15);
  text('BANK B', 10, height * 0.82);
  M2_stroke('#FF5050', 0.9); strokeWeight(2);
  line(width / 2, height * 0.30 - 4, width / 2, height * 0.30 - 24);
  M2_fill('#FF5050', 0.9); noStroke();
  triangle(width / 2, height * 0.30 - 24, width / 2, height * 0.30 - 14, width / 2 + 12, height * 0.30 - 19);
  var dVal = d_m || 30;
  M2_stroke('#FFFFFF', 0.5); strokeWeight(1);
  drawingContext.setLineDash([4, 3]);
  line(width - 40, height * 0.35, width - 40, height * 0.65);
  drawingContext.setLineDash([]);
  fill(255, 255, 255, 180); textSize(10); textAlign(CENTER, CENTER); noStroke();
  text('d = ' + dVal + ' m', width - 40, height * 0.50);
}

function M2_drawRainEnv(t, rainAngleDeg, vMan, vRain) {
  for (var sy2 = 0; sy2 < height - 40; sy2++) {
    var sf2 = sy2 / (height - 40);
    stroke(70 + sf2 * 30, 80 + sf2 * 20, 100 + sf2 * 20); strokeWeight(1);
    line(0, sy2, width, sy2);
  }
  M2_fill('#3A3A3A', 1.0); noStroke();
  rect(0, height - 40, width, 40);
  M2_fill('#556688', 0.3); noStroke();
  ellipse(100, height - 20, 60, 8);
  ellipse(400, height - 25, 80, 10);
  ellipse(650, height - 18, 50, 6);
  var rAngle = (rainAngleDeg || 0) * Math.PI / 180;
  stroke(170, 190, 220, 120); strokeWeight(1);
  for (var ri = 0; ri < 50; ri++) {
    var rx = ((ri * 43 + t * 140 * Math.sin(rAngle + 0.01)) % (width + 100)) - 50;
    var ry2 = ((ri * 67 + t * 140) % (height - 40));
    var rLen = 20;
    line(rx, ry2, rx + rLen * Math.sin(rAngle), ry2 + rLen * Math.cos(rAngle));
  }
}

function M2_drawAircraftMapEnv(ax_a, ay_a, bx_a, by_a) {
  for (var my = 0; my < height; my++) {
    var mf = my / height;
    stroke(180 + mf * 20, 210 - mf * 10, 160 + mf * 20); strokeWeight(1);
    line(0, my, width, my);
  }
  stroke(160, 190, 140, 80); strokeWeight(1);
  for (var gx2 = 0; gx2 < width; gx2 += 50) line(gx2, 0, gx2, height);
  for (var gy2 = 0; gy2 < height; gy2 += 50) line(0, gy2, width, gy2);
  var crx = width - 40, cry = 40;
  stroke(80); strokeWeight(1.5);
  line(crx, cry - 20, crx, cry + 20);
  line(crx - 20, cry, crx + 20, cry);
  fill(60); noStroke(); textSize(10); textAlign(CENTER, CENTER);
  text('N', crx, cry - 26); text('S', crx, cry + 26);
  text('E', crx + 26, cry); text('W', crx - 26, cry);
  var ptAx = ax_a || width * 0.2, ptAy = ay_a || height * 0.75;
  var ptBx = bx_a || width * 0.8, ptBy = by_a || height * 0.25;
  M2_fill('#FF5050', 0.9); noStroke();
  ellipse(ptAx, ptAy, 12, 12);
  fill(60); textSize(11); textAlign(CENTER, TOP);
  text('A', ptAx, ptAy + 8);
  M2_fill('#50FF50', 0.9); noStroke();
  ellipse(ptBx, ptBy, 12, 12);
  fill(60); textSize(11); textAlign(CENTER, TOP);
  text('B', ptBx, ptBy + 8);
}

// ── Scenario Renderers (rebuilt) ─────────────────────────────────

function M2_scalarVsVector(cfg, stateData, t) {
  var idx = M2_stateIdx();
  background(15, 15, 26);
  var cx = width / 2, cy = height / 2;
  if (idx === 1) {
    var angleDeg = M2_getCanvasSliderVal('jAngle', 0, 180, 60, height - 50, 'Angle between wires (\u00B0)');
    var angRad = angleDeg * Math.PI / 180;
    var jx = cx, jy = cy - 20;
    M2_fill('#FFFFFF', 0.9); noStroke(); ellipse(jx, jy, 10, 10);
    var w1x = jx - 100 * Math.cos(angRad / 2), w1y = jy - 100 * Math.sin(angRad / 2);
    M2_newArrow(w1x, w1y, jx, jy, '#60a5fa', 'i\u2081 = 3A');
    var w2x = jx + 100 * Math.cos(angRad / 2), w2y = jy - 100 * Math.sin(angRad / 2);
    M2_newArrow(w2x, w2y, jx, jy, '#60a5fa', 'i\u2082 = 4A');
    M2_newArrow(jx, jy, jx, jy + 100, '#ef4444', 'i = 7A');
    M2_fill('#fbbf24', 1.0); noStroke(); textSize(16); textAlign(CENTER, CENTER);
    text('TOTAL: 7A (always!)', cx, jy + 130);
    var vecResult = Math.sqrt(9 + 16 + 24 * Math.cos(angRad));
    M2_drawFormulaBox(20, 20, 320, ['Scalar sum: i\u2081+i\u2082 = 7A  \u2714', 'If vector: \u221A(9+16+24cos' + angleDeg.toFixed(0) + '\u00B0) = ' + vecResult.toFixed(1) + 'A  \u2718'], '#000000', '#FFFFFF');
    M2_textBox(20, height - 80, 'Current at junction = 7A regardless of angle \u2192 SCALAR', '#fbbf24', 12);
  } else if (idx === 2) {
    var midX = width / 2;
    stroke(80); strokeWeight(1); line(midX, 0, midX, height);
    fill(200); textSize(11); textAlign(CENTER, TOP);
    text('DISPLACEMENT (vector)', midX / 2, 8); text('CURRENT (scalar)', midX + midX / 2, 8);
    var angDeg2 = M2_getCanvasSliderVal('vAng', 0, 180, 60, height - 50, '\u03B8 (\u00B0)');
    var angR2 = angDeg2 * Math.PI / 180;
    var A2 = 60, B2 = 45;
    var lox = midX * 0.2, loy = cy + 20;
    M2_newArrow(lox, loy, lox + A2, loy, '#60a5fa', 'A=5');
    M2_newArrow(lox, loy, lox + B2 * Math.cos(angR2), loy - B2 * Math.sin(angR2), '#34d399', 'B=3');
    var Rx = A2 + B2 * Math.cos(angR2), Ry = -B2 * Math.sin(angR2);
    var Rmag = Math.sqrt(Rx * Rx + Ry * Ry);
    M2_drawParallelogram(lox, loy, A2, 0, B2 * Math.cos(angR2), -B2 * Math.sin(angR2), '#fbbf24', '#fbbf24');
    M2_newArrow(lox, loy, lox + Rx, loy + Ry, '#fbbf24', 'R=' + (Rmag / 12).toFixed(1));
    M2_textBox(10, cy + 50, 'R changes with \u03B8', '#fbbf24', 11);
    var rox = midX + 60, roy = cy;
    M2_fill('#FFFFFF', 0.8); noStroke(); ellipse(rox + 80, roy, 8, 8);
    M2_newArrow(rox, roy - 30, rox + 80, roy, '#60a5fa', '3A');
    M2_newArrow(rox + 160, roy - 30, rox + 80, roy, '#60a5fa', '4A');
    M2_newArrow(rox + 80, roy, rox + 80, roy + 70, '#ef4444', '7A');
    M2_fill('#34d399', 1.0); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('\u2714 Always 7A', rox + 80, roy + 100);
  } else if (idx === 3) {
    if (typeof M2_sortState === 'undefined' || M2_sortState === null || M2_sortState.length === 0) {
      M2_sortState = [
        { name: 'Current', isVector: false, placed: 0 },
        { name: 'Pressure', isVector: false, placed: 0 },
        { name: 'Force', isVector: true, placed: 0 },
        { name: 'Velocity', isVector: true, placed: 0 },
        { name: 'Temperature', isVector: false, placed: 0 },
        { name: 'Torque', isVector: true, placed: 0 },
        { name: 'Surface Tension', isVector: false, placed: 0 }
      ];
    }
    M2_fill('#fbbf24', 0.9); noStroke(); textSize(15); textAlign(CENTER, TOP);
    text('SCALAR', width * 0.25, 15);
    M2_fill('#34d399', 0.9); text('VECTOR', width * 0.75, 15);
    stroke(100); strokeWeight(1); line(width / 2, 35, width / 2, height - 20);
    for (var si = 0; si < M2_sortState.length; si++) {
      var item = M2_sortState[si];
      var cardW = 130, cardH = 28, cardX, cardY;
      if (item.placed === 0) { cardX = width / 2 - cardW / 2; cardY = 50 + si * 34; }
      else if (item.placed === 1) { cardX = width * 0.25 - cardW / 2; cardY = 45 + si * 34; }
      else { cardX = width * 0.75 - cardW / 2; cardY = 45 + si * 34; }
      var isCorrect = (item.placed === 1 && !item.isVector) || (item.placed === 2 && item.isVector);
      var isWrong = (item.placed === 1 && item.isVector) || (item.placed === 2 && !item.isVector);
      var bgCol = item.placed === 0 ? '#333344' : (isCorrect ? '#1a4a2a' : (isWrong ? '#4a1a1a' : '#333344'));
      M2_fill(bgCol, 0.9); M2_stroke('#666688', 0.6); strokeWeight(1);
      rect(cardX, cardY, cardW, cardH, 4);
      fill(220); noStroke(); textSize(12); textAlign(CENTER, CENTER);
      text(item.name, cardX + cardW / 2, cardY + cardH / 2);
      if (isCorrect) { fill(100, 255, 100); text(' \u2714', cardX + cardW - 16, cardY + cardH / 2); }
      if (isWrong) { fill(255, 100, 100); text(' \u2718', cardX + cardW - 16, cardY + cardH / 2); }
      if (mouseIsPressed && mouseX > cardX && mouseX < cardX + cardW && mouseY > cardY && mouseY < cardY + cardH) {
        if (!M2_sortState._clickLock) { M2_sortState._clickLock = true; item.placed = (item.placed + 1) % 3; }
      }
    }
    if (!mouseIsPressed) M2_sortState._clickLock = false;
    M2_textBox(10, height - 30, 'Click items to cycle: Center \u2192 Scalar \u2192 Vector', '#FFFFFF', 11);
  } else {
    M2_textBox(cx - 180, 15, 'Finite rotation: order matters \u2192 NOT a vector', '#ef4444', 14);
    var panW = width / 2 - 20;
    M2_fill('#000000', 0.3); noStroke();
    rect(10, 50, panW, height - 70, 6); rect(width / 2 + 10, 50, panW, height - 70, 6);
    fill(200); textSize(12); textAlign(CENTER, TOP);
    text('90\u00B0 about X, then 90\u00B0 about Y', panW / 2 + 10, 55);
    text('90\u00B0 about Y, then 90\u00B0 about X', width / 2 + panW / 2 + 10, 55);
    var bkW = 60, bkH = 80;
    var bk1x = panW / 2 + 10 - bkW / 2, bk1y = cy - 10;
    M2_fill('#60a5fa', 0.7); noStroke(); rect(bk1x, bk1y, bkW, bkH / 2, 2);
    M2_fill('#34d399', 0.5); beginShape();
    vertex(bk1x + bkW, bk1y); vertex(bk1x + bkW + 25, bk1y - 15);
    vertex(bk1x + bkW + 25, bk1y + bkH / 2 - 15); vertex(bk1x + bkW, bk1y + bkH / 2);
    endShape(CLOSE);
    fill(255); textSize(10); textAlign(CENTER, CENTER);
    text('Front', bk1x + bkW / 2, bk1y + bkH / 4); text('P1', bk1x + bkW / 2, bk1y + bkH / 2 + 20);
    var bk2x = width / 2 + panW / 2 + 10 - bkW / 2, bk2y = cy - 10;
    M2_fill('#34d399', 0.7); noStroke(); rect(bk2x, bk2y, bkW, bkH / 2, 2);
    M2_fill('#60a5fa', 0.5); beginShape();
    vertex(bk2x + bkW, bk2y); vertex(bk2x + bkW + 25, bk2y - 15);
    vertex(bk2x + bkW + 25, bk2y + bkH / 2 - 15); vertex(bk2x + bkW, bk2y + bkH / 2);
    endShape(CLOSE);
    fill(255); textSize(10); textAlign(CENTER, CENTER);
    text('Side', bk2x + bkW / 2, bk2y + bkH / 4); text('P2', bk2x + bkW / 2, bk2y + bkH / 2 + 20);
    M2_fill('#ef4444', 1.0); noStroke(); textSize(18); textAlign(CENTER, CENTER);
    text('P1 \u2260 P2', cx, height - 40);
  }
}

function M2_vectorBasics(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (idx === 1) {
    var m = M2_getCanvasSliderVal('scalarM', -3, 3, 1.5, height - 50, 'Scalar m');
    var baseLen = 80, len = Math.abs(m) * baseLen, ang = -Math.PI / 4;
    var col = m >= 0 ? '#60a5fa' : '#ef4444', dir = m >= 0 ? 1 : -1;
    M2_drawDashedLine(cx, cy, cx + baseLen * Math.cos(ang), cy + baseLen * Math.sin(ang), '#FFFFFF', 4, 4);
    M2_textBox(cx + baseLen * Math.cos(ang) + 5, cy + baseLen * Math.sin(ang), 'A', '#AAAAAA', 11);
    if (Math.abs(m) > 0.05) M2_newArrow(cx, cy, cx + dir * len * Math.cos(ang), cy + dir * len * Math.sin(ang), col, 'mA');
    M2_drawFormulaBox(20, 20, 280, ['|mA| = |m| \u00D7 |A| = ' + Math.abs(m).toFixed(1) + ' \u00D7 |A|', m >= 0 ? 'm > 0: same direction' : 'm < 0: opposite direction'], '#000000', '#FFFFFF');
  } else if (idx === 2) {
    var phase = (t * 0.8) % 3, origLen = 120;
    var shrinkLen = phase < 1.5 ? origLen * (1 - M2_easeInOut(Math.min(phase / 1.5, 1)) * (1 - 40 / origLen)) : 40;
    var ang2 = -Math.PI / 6;
    M2_newArrow(cx - 100, cy, cx - 100 + shrinkLen * Math.cos(ang2), cy + shrinkLen * Math.sin(ang2), '#60a5fa', phase < 1.5 ? 'A' : '\u00C2');
    if (phase >= 1.5) M2_textBox(cx - 100, cy + 40, '|\u00C2| = 1 (always!)', '#34d399', 13);
    var axOx = cx + 80, axOy = cy + 40;
    M2_drawAxes(axOx, axOy, 80, 80, '', '', '#555566');
    M2_newArrow(axOx, axOy, axOx + 40, axOy, '#fbbf24', '\u00EE');
    M2_newArrow(axOx, axOy, axOx, axOy - 40, '#34d399', '\u0135');
    M2_drawFormulaBox(20, 20, 250, ['\u00C2 = A / |A|', '|\u00C2| = 1 always', 'Any A = |A| \u00D7 \u00C2'], '#000000', '#FFFFFF');
  } else if (idx === 3) {
    var cases = [{ label: 'Parallel (0\u00B0)', ang: 0, x: width * 0.25, y: height * 0.3 }, { label: 'Antiparallel (180\u00B0)', ang: Math.PI, x: width * 0.75, y: height * 0.3 }, { label: 'Perpendicular (90\u00B0)', ang: Math.PI / 2, x: width * 0.25, y: height * 0.72 }, { label: 'Arbitrary', ang: -1, x: width * 0.75, y: height * 0.72 }];
    var arbAng = M2_getCanvasSliderVal('arbAng', 0, 180, 120, height - 50, '\u03B8 for arbitrary (\u00B0)');
    for (var ci = 0; ci < cases.length; ci++) {
      var cs = cases[ci], a = cs.ang === -1 ? arbAng * Math.PI / 180 : cs.ang;
      M2_fill('#000000', 0.3); noStroke(); rect(cs.x - 85, cs.y - 50, 170, 80, 4);
      fill(180); textSize(10); textAlign(CENTER, TOP); text(cs.label, cs.x, cs.y - 48);
      M2_newArrow(cs.x - 30, cs.y, cs.x + 40, cs.y, '#60a5fa', 'A');
      M2_newArrow(cs.x - 30, cs.y, cs.x - 30 + 50 * Math.cos(a), cs.y - 50 * Math.sin(a), '#34d399', 'B');
      M2_drawAngleArc(cs.x - 30, cs.y, 18, 0, a, '#fbbf24', cs.ang === -1 ? arbAng.toFixed(0) + '\u00B0' : '');
    }
    M2_textBox(cx - 120, 10, 'ALWAYS measure from same starting point', '#fbbf24', 12);
  } else {
    var types = [{ name: 'Concurrent', desc: 'Same starting point', x: width * 0.2, y: cy - 30 }, { name: 'Coplanar', desc: 'Same plane', x: width * 0.5, y: cy - 30 }, { name: 'Equal', desc: 'Same mag + dir', x: width * 0.8, y: cy - 30 }, { name: 'Parallel', desc: 'Same dir, diff mag', x: width * 0.35, y: cy + 80 }];
    for (var ti = 0; ti < types.length; ti++) {
      var tp = types[ti];
      M2_fill('#000000', 0.35); noStroke(); rect(tp.x - 70, tp.y - 40, 140, 75, 4);
      fill(200); textSize(11); textAlign(CENTER, TOP); text(tp.name, tp.x, tp.y - 38);
      fill(150); textSize(9); text(tp.desc, tp.x, tp.y - 25);
      if (ti === 0) { M2_newArrow(tp.x - 10, tp.y + 10, tp.x + 40, tp.y - 10, '#60a5fa', ''); M2_newArrow(tp.x - 10, tp.y + 10, tp.x + 30, tp.y + 30, '#34d399', ''); }
      else if (ti === 1) { M2_fill('#60a5fa', 0.08); noStroke(); rect(tp.x - 50, tp.y, 100, 30, 2); M2_newArrow(tp.x - 40, tp.y + 15, tp.x, tp.y + 5, '#60a5fa', ''); M2_newArrow(tp.x - 20, tp.y + 25, tp.x + 40, tp.y + 10, '#34d399', ''); }
      else if (ti === 2) { M2_newArrow(tp.x - 40, tp.y + 5, tp.x, tp.y - 10, '#60a5fa', ''); M2_newArrow(tp.x, tp.y + 25, tp.x + 40, tp.y + 10, '#60a5fa', ''); }
      else { M2_newArrow(tp.x - 40, tp.y + 5, tp.x + 30, tp.y + 5, '#60a5fa', ''); M2_newArrow(tp.x - 40, tp.y + 20, tp.x, tp.y + 20, '#34d399', ''); }
    }
  }
}

function M2_vectorAddition(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26); var cx = width / 2, cy = height / 2; var A = 100, B = 75;
  if (idx === 1) {
    var theta = M2_getCanvasSliderVal('theta', 0, 180, 60, height - 50, '\u03B8 (\u00B0)');
    var rad = theta * Math.PI / 180; var ox = cx - 80, oy = cy + 40;
    M2_newArrow(ox, oy, ox + A, oy, '#60a5fa', 'A=5');
    M2_newArrow(ox, oy, ox + B * Math.cos(rad), oy - B * Math.sin(rad), '#34d399', 'B=3');
    M2_drawParallelogram(ox, oy, A, 0, B * Math.cos(rad), -B * Math.sin(rad), '#fbbf24', '#fbbf24');
    var Rx = A + B * Math.cos(rad), Ry = -B * Math.sin(rad); var Rmag = Math.sqrt(Rx * Rx + Ry * Ry);
    M2_newArrow(ox, oy, ox + Rx, oy + Ry, '#fbbf24', 'R=' + (Rmag * 5 / A).toFixed(1));
    M2_drawAngleArc(ox, oy, 25, 0, rad, '#FFD54F', theta.toFixed(0) + '\u00B0');
    var barX = width - 60, barY = 40, barH = height - 120;
    M2_fill('#000000', 0.4); noStroke(); rect(barX - 15, barY, 30, barH, 4);
    var maxR = (5 + 3) * A / 5; var barFill = constrain(Rmag / maxR, 0, 1) * barH;
    M2_fill('#fbbf24', 0.8); rect(barX - 10, barY + barH - barFill, 20, barFill, 3);
    fill(200); textSize(9); textAlign(CENTER, BOTTOM); noStroke(); text('|R|', barX, barY - 2);
    M2_drawFormulaBox(20, 20, 340, ['R = \u221A(A\u00B2+B\u00B2+2ABcos\u03B8)', 'R = \u221A(25+9+30cos' + theta.toFixed(0) + '\u00B0) = ' + (Rmag * 5 / A).toFixed(2)], '#000000', '#fbbf24');
  } else if (idx === 2) {
    var phase = constrain(t * 0.5, 0, 2); var ox2 = 100, oy2 = cy + 60; var angB = -Math.PI / 4;
    M2_newArrow(ox2, oy2, ox2 + A, oy2, '#60a5fa', 'A');
    if (phase > 0.5) { var bFrac = constrain((phase - 0.5) / 0.8, 0, 1); M2_newArrow(ox2 + A, oy2, ox2 + A + B * Math.cos(angB) * bFrac, oy2 + B * Math.sin(angB) * bFrac, '#34d399', 'B'); }
    if (phase > 1.3) { var fullRx = A + B * Math.cos(angB), fullRy = B * Math.sin(angB); var rFrac = constrain((phase - 1.3) / 0.7, 0, 1); M2_newArrow(ox2, oy2, ox2 + fullRx * rFrac, oy2 + fullRy * rFrac, '#fbbf24', 'R=A+B'); }
    M2_textBox(20, 20, 'Triangle Law: place B at tip of A', '#fbbf24', 14);
  } else if (idx === 3) {
    var ox3 = cx - 100, oy3 = cy + 40; var angB3 = Math.PI / 4;
    M2_newArrow(ox3, oy3, ox3 + A, oy3, '#60a5fa', 'A');
    M2_newArrow(ox3, oy3, ox3 + B * Math.cos(angB3), oy3 - B * Math.sin(angB3), '#34d399', 'B');
    M2_drawDashedLine(ox3 + A, oy3, ox3 + A + B * Math.cos(angB3), oy3 - B * Math.sin(angB3), '#888888', 5, 4);
    M2_drawDashedLine(ox3 + B * Math.cos(angB3), oy3 - B * Math.sin(angB3), ox3 + A + B * Math.cos(angB3), oy3 - B * Math.sin(angB3), '#888888', 5, 4);
    var Rx3 = A + B * Math.cos(angB3), Ry3 = -B * Math.sin(angB3);
    M2_newArrow(ox3, oy3, ox3 + Rx3, oy3 + Ry3, '#fbbf24', 'R (diagonal)');
    M2_drawParallelogram(ox3, oy3, A, 0, B * Math.cos(angB3), -B * Math.sin(angB3), '#fbbf24', '#fbbf24');
    M2_textBox(20, 20, 'Parallelogram Law: both from same origin', '#fbbf24', 14);
  } else if (idx === 4) {
    var cases4 = [{ th: 0, label: '\u03B8=0\u00B0: R=A+B=8 (max)', col: '#34d399' }, { th: 90, label: '\u03B8=90\u00B0: R=\u221A(A\u00B2+B\u00B2)', col: '#60a5fa' }, { th: 120, label: '\u03B8=120\u00B0,A=B: R=A', col: '#fbbf24' }, { th: 180, label: '\u03B8=180\u00B0: R=|A-B| (min)', col: '#ef4444' }];
    for (var ci4 = 0; ci4 < 4; ci4++) {
      var cs4 = cases4[ci4]; var bx4 = 40 + (ci4 % 2) * (width / 2); var by4 = ci4 < 2 ? 80 : cy + 50;
      var r4 = cs4.th * Math.PI / 180; var a4 = 60, b4 = ci4 === 2 ? 60 : 36;
      M2_newArrow(bx4, by4 + 40, bx4 + a4, by4 + 40, '#60a5fa', '');
      if (cs4.th === 0) M2_newArrow(bx4 + a4, by4 + 40, bx4 + a4 + b4, by4 + 40, '#34d399', '');
      else if (cs4.th === 180) M2_newArrow(bx4, by4 + 40, bx4 - b4, by4 + 40, '#34d399', '');
      else M2_newArrow(bx4, by4 + 40, bx4 + b4 * Math.cos(r4), by4 + 40 - b4 * Math.sin(r4), '#34d399', '');
      var rx4 = a4 + b4 * Math.cos(r4), ry4 = -b4 * Math.sin(r4);
      M2_newArrow(bx4, by4 + 40, bx4 + rx4, by4 + 40 + ry4, cs4.col, '');
      M2_textBox(bx4 - 10, by4 - 5, cs4.label, cs4.col, 11);
    }
  } else if (idx === 5) {
    var theta5 = M2_getCanvasSliderVal('th5', 0, 180, 60, height - 70, '\u03B8 (\u00B0)');
    var A5 = M2_getCanvasSliderVal('A5', 1, 10, 5, height - 40, 'A');
    var B5 = 3, rad5 = theta5 * Math.PI / 180, ox5 = cx - 60, oy5 = cy + 40, sc5 = 15;
    M2_newArrow(ox5, oy5, ox5 + A5 * sc5, oy5, '#60a5fa', 'A=' + A5.toFixed(0));
    M2_newArrow(ox5, oy5, ox5 + B5 * sc5 * Math.cos(rad5), oy5 - B5 * sc5 * Math.sin(rad5), '#34d399', 'B=' + B5);
    var Rx5 = A5 * sc5 + B5 * sc5 * Math.cos(rad5), Ry5 = -B5 * sc5 * Math.sin(rad5);
    M2_newArrow(ox5, oy5, ox5 + Rx5, oy5 + Ry5, '#fbbf24', 'R');
    var beta5 = Math.atan2(B5 * Math.sin(rad5), A5 + B5 * Math.cos(rad5));
    M2_drawAngleArc(ox5, oy5, 35, 0, beta5, '#C896FF', '\u03B2=' + (beta5 * 180 / Math.PI).toFixed(1) + '\u00B0');
    M2_drawFormulaBox(20, 20, 360, ['\u03B2 = tan\u207B\u00B9(Bsin\u03B8/(A+Bcos\u03B8))', '\u03B2 = ' + (beta5 * 180 / Math.PI).toFixed(1) + '\u00B0'], '#000000', '#C896FF');
  } else {
    var A6 = M2_getCanvasSliderVal('A6', 1, 10, 5, height - 90, 'A');
    var B6 = M2_getCanvasSliderVal('B6', 1, 10, 3, height - 60, 'B');
    var th6 = M2_getCanvasSliderVal('th6', 0, 180, 60, height - 30, '\u03B8 (\u00B0)');
    var rad6 = th6 * Math.PI / 180, sc6 = 12, ox6 = cx - 80, oy6 = cy + 20;
    M2_newArrow(ox6, oy6, ox6 + A6 * sc6, oy6, '#60a5fa', 'A=' + A6.toFixed(1));
    M2_newArrow(ox6, oy6, ox6 + B6 * sc6 * Math.cos(rad6), oy6 - B6 * sc6 * Math.sin(rad6), '#34d399', 'B=' + B6.toFixed(1));
    M2_drawParallelogram(ox6, oy6, A6 * sc6, 0, B6 * sc6 * Math.cos(rad6), -B6 * sc6 * Math.sin(rad6), '#fbbf24', '#fbbf24');
    var Rx6 = A6 + B6 * Math.cos(rad6), Ry6 = B6 * Math.sin(rad6);
    var Rmag6 = Math.sqrt(Rx6 * Rx6 + Ry6 * Ry6);
    var beta6 = Math.atan2(B6 * Math.sin(rad6), A6 + B6 * Math.cos(rad6)) * 180 / Math.PI;
    M2_newArrow(ox6, oy6, ox6 + Rx6 * sc6, oy6 - Ry6 * sc6, '#fbbf24', 'R=' + Rmag6.toFixed(2));
    M2_drawFormulaBox(20, 20, 340, ['R = ' + Rmag6.toFixed(2), '\u03B2 = ' + beta6.toFixed(1) + '\u00B0'], '#000000', '#fbbf24');
  }
}

function M2_vectorComponents(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (idx === 1) {
    var ang = Math.PI / 5, A = 140, ox = cx - 60, oy = cy + 60;
    M2_drawAxes(ox, oy, 200, 180, 'x', 'y', '#555566');
    var ax = A * Math.cos(ang), ay = A * Math.sin(ang);
    M2_drawDashedLine(ox + ax, oy, ox + ax, oy - ay, '#60a5fa', 5, 3);
    M2_drawDashedLine(ox, oy - ay, ox + ax, oy - ay, '#34d399', 5, 3);
    var pulse = 0.7 + 0.3 * Math.sin(t * 3);
    M2_drawArrow(ox, oy, ox + ax, oy, '#60a5fa', 'Ax=Acos\u03B8', pulse, true);
    M2_drawArrow(ox, oy, ox, oy - ay, '#34d399', 'Ay=Asin\u03B8', pulse, true);
    M2_newArrow(ox, oy, ox + ax, oy - ay, '#fbbf24', 'A');
    M2_drawAngleArc(ox, oy, 30, 0, ang, '#FFD54F', '\u03B8');
    M2_drawRightAngle(ox + ax, oy, 10, 0);
  } else if (idx === 2) {
    var th2 = M2_getCanvasSliderVal('cTh', 0, 90, 45, height - 70, '\u03B8 (\u00B0)');
    var A2 = M2_getCanvasSliderVal('cA', 1, 10, 6, height - 40, '|A|');
    var rad2 = th2 * Math.PI / 180, sc2 = 18, ox2 = cx - 60, oy2 = cy + 60;
    M2_drawAxes(ox2, oy2, 220, 200, 'x', 'y', '#555566');
    var axv = A2 * sc2 * Math.cos(rad2), ayv = A2 * sc2 * Math.sin(rad2);
    M2_newArrow(ox2, oy2, ox2 + axv, oy2 - ayv, '#fbbf24', 'A=' + A2.toFixed(1));
    M2_newArrow(ox2, oy2, ox2 + axv, oy2, '#60a5fa', 'Ax=' + (A2 * Math.cos(rad2)).toFixed(2));
    M2_newArrow(ox2 + axv, oy2, ox2 + axv, oy2 - ayv, '#34d399', 'Ay=' + (A2 * Math.sin(rad2)).toFixed(2));
    M2_drawAngleArc(ox2, oy2, 30, 0, rad2, '#FFD54F', th2.toFixed(0) + '\u00B0');
  } else if (idx === 3) {
    var phase3 = constrain(t * 0.4, 0, 2); var ox3 = cx - 80, oy3 = cy + 60; var Ax3 = 80, Ay3 = 60;
    M2_drawAxes(ox3, oy3, 200, 180, 'x', 'y', '#555566');
    M2_newArrow(ox3, oy3, ox3 + Ax3, oy3, '#60a5fa', 'Ax');
    if (phase3 > 0.5) { var ayFrac = constrain((phase3 - 0.5) / 0.7, 0, 1); M2_newArrow(ox3 + Ax3, oy3, ox3 + Ax3, oy3 - Ay3 * ayFrac, '#34d399', 'Ay'); }
    if (phase3 > 1.2) M2_newArrow(ox3, oy3, ox3 + Ax3, oy3 - Ay3, '#fbbf24', 'A');
    M2_drawFormulaBox(20, 20, 300, ['A = \u221A(Ax\u00B2+Ay\u00B2) = ' + Math.sqrt(Ax3 * Ax3 + Ay3 * Ay3).toFixed(1), '\u03B8 = tan\u207B\u00B9(Ay/Ax) = ' + (Math.atan2(Ay3, Ax3) * 180 / Math.PI).toFixed(1) + '\u00B0'], '#000000', '#fbbf24');
  } else if (idx === 4) {
    var vecs = [{ A: 5, ang: 30, col: '#60a5fa', name: 'A' }, { A: 4, ang: 120, col: '#34d399', name: 'B' }, { A: 3, ang: 210, col: '#C896FF', name: 'C' }];
    var ox4 = cx - 40, oy4 = cy + 80, sc4 = 14; M2_drawAxes(ox4, oy4, 250, 220, 'x', 'y', '#555566');
    var Rx4 = 0, Ry4 = 0;
    for (var vi = 0; vi < vecs.length; vi++) { var v = vecs[vi]; var vrad = v.ang * Math.PI / 180; M2_newArrow(ox4, oy4, ox4 + v.A * sc4 * Math.cos(vrad), oy4 - v.A * sc4 * Math.sin(vrad), v.col, v.name); Rx4 += v.A * Math.cos(vrad); Ry4 += v.A * Math.sin(vrad); }
    M2_newArrow(ox4, oy4, ox4 + Rx4 * sc4, oy4 - Ry4 * sc4, '#fbbf24', 'R');
    M2_drawFormulaBox(20, 20, 300, ['Rx = ' + Rx4.toFixed(2), 'Ry = ' + Ry4.toFixed(2), 'R = ' + Math.sqrt(Rx4 * Rx4 + Ry4 * Ry4).toFixed(2)], '#000000', '#fbbf24');
  } else if (idx === 5) {
    var ox5 = cx - 40, oy5 = cy + 60; M2_drawAxes(ox5, oy5, 200, 180, 'x', 'y', '#555566');
    var A5 = 120, ang5 = Math.PI / 5; var phase5 = constrain(t * 0.5, 0, 3);
    if (phase5 < 1.5) M2_newArrow(ox5, oy5, ox5 + A5 * Math.cos(ang5), oy5 - A5 * Math.sin(ang5), '#60a5fa', 'A');
    if (phase5 >= 1.5) { M2_newArrow(ox5, oy5, ox5 + 40 * Math.cos(ang5), oy5 - 40 * Math.sin(ang5), '#fbbf24', '\u00C2'); noFill(); M2_stroke('#fbbf24', 0.3); strokeWeight(1); arc(ox5, oy5, 80, 80, -Math.PI / 2, Math.PI / 2); }
    M2_drawFormulaBox(20, 20, 320, ['\u00C2 = (Ax/|A|)\u00EE + (Ay/|A|)\u0135', '|\u00C2| = 1 (unit circle)'], '#000000', '#fbbf24');
  } else {
    var ox6 = cx - 60, oy6 = cy + 60, sc6 = 12, ang6 = 30 * Math.PI / 180;
    M2_drawAxes(ox6, oy6, 200, 180, 'x', 'y', '#555566');
    M2_newArrow(ox6, oy6, ox6 + 10 * sc6 * Math.cos(ang6), oy6 - 10 * sc6 * Math.sin(ang6), '#fbbf24', 'A=10');
    M2_newArrow(ox6, oy6, ox6 + 10 * sc6 * Math.cos(ang6), oy6, '#60a5fa', 'Ax=8.66');
    M2_newArrow(ox6 + 10 * sc6 * Math.cos(ang6), oy6, ox6 + 10 * sc6 * Math.cos(ang6), oy6 - 10 * sc6 * Math.sin(ang6), '#34d399', 'Ay=5');
    M2_drawAngleArc(ox6, oy6, 35, 0, ang6, '#FFD54F', '30\u00B0');
    M2_drawFormulaBox(20, 20, 320, ['A=10 at 30\u00B0', 'Ax = 10cos30\u00B0 = 5\u221A3 \u2248 8.66', 'Ay = 10sin30\u00B0 = 5'], '#000000', '#FFFFFF');
  }
}

function M2_dotProduct(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (idx === 1) {
    var th1 = M2_getCanvasSliderVal('dpTh', 0, 180, 60, height - 50, '\u03B8 (\u00B0)');
    var rad1 = th1 * Math.PI / 180; var F = 80, s = 120, ox1 = cx - 100, oy1 = cy;
    M2_newArrow(ox1, oy1, ox1 + s, oy1, '#60a5fa', 's');
    M2_newArrow(ox1 + s / 2, oy1, ox1 + s / 2 + F * Math.cos(rad1), oy1 - F * Math.sin(rad1), '#34d399', 'F');
    M2_drawAngleArc(ox1 + s / 2, oy1, 25, 0, rad1, '#FFD54F', th1.toFixed(0) + '\u00B0');
    var W = Math.cos(rad1);
    var barX = width - 80, barY = 60, barH = 200;
    M2_fill('#000000', 0.4); noStroke(); rect(barX - 20, barY, 40, barH, 4);
    var midBar = barY + barH / 2; var fillH = W * barH / 2;
    if (W >= 0) { M2_fill('#34d399', 0.8); rect(barX - 15, midBar - fillH, 30, fillH, 2); }
    else { M2_fill('#ef4444', 0.8); rect(barX - 15, midBar, 30, -fillH, 2); }
    stroke(200, 200, 200, 100); strokeWeight(1); line(barX - 20, midBar, barX + 20, midBar);
    if (Math.abs(th1 - 90) < 3) { M2_fill('#ef4444', 1.0); noStroke(); textSize(16); textAlign(CENTER, CENTER); text('ZERO WORK!', cx, oy1 + 60); }
    M2_drawFormulaBox(20, 20, 300, ['W = F\u00B7s = |F||s|cos\u03B8', 'W = Fs cos' + th1.toFixed(0) + '\u00B0 = ' + W.toFixed(3) + ' Fs'], '#000000', '#fbbf24');
  } else if (idx === 2) {
    var animAng = M2_animPhase * 0.4; var ox2 = cx - 100, oy2 = cy + 40;
    var A2 = 150, B2 = 100, angB = animAng % (Math.PI * 0.8);
    M2_newArrow(ox2, oy2, ox2 + A2, oy2, '#60a5fa', 'A');
    var bx = B2 * Math.cos(angB), by = -B2 * Math.sin(angB);
    M2_newArrow(ox2, oy2, ox2 + bx, oy2 + by, '#34d399', 'B');
    var projLen = B2 * Math.cos(angB);
    M2_drawDashedLine(ox2 + bx, oy2 + by, ox2 + projLen, oy2, '#888888', 4, 3);
    if (projLen > 0) { M2_stroke('#fbbf24', 0.6); strokeWeight(4); line(ox2, oy2, ox2 + projLen, oy2); }
    noStroke(); M2_textBox(ox2 + projLen / 2 - 30, oy2 + 8, 'Bcos\u03B8 = ' + Math.cos(angB).toFixed(2) + 'B', '#fbbf24', 11);
    M2_textBox(20, 20, 'A\u00B7B = |A| \u00D7 (projection of B on A)', '#fbbf24', 13);
  } else if (idx === 3) {
    var ox3 = cx - 80, oy3 = cy + 60, sc3 = 25;
    M2_drawAxes(ox3, oy3, 200, 180, 'x', 'y', '#555566');
    M2_newArrow(ox3, oy3, ox3 + 3 * sc3, oy3 - 4 * sc3, '#60a5fa', 'A=(3,4)');
    M2_newArrow(ox3, oy3, ox3 + 2 * sc3, oy3 - 1 * sc3, '#34d399', 'B=(2,1)');
    M2_drawFormulaBox(20, 20, 350, ['A\u00B7B = 3\u00D72 + 4\u00D71 = 10', '|A|=5, |B|=\u221A5', 'cos\u03B8 = 10/(5\u221A5) \u2248 0.894 \u2192 \u03B8 \u2248 26.6\u00B0'], '#000000', '#FFFFFF');
  } else if (idx === 4) {
    var bAng = M2_getCanvasSliderVal('dpB', 0, 360, 120, height - 50, 'B direction (\u00B0)');
    var radB = bAng * Math.PI / 180, ox4 = cx - 40, oy4 = cy + 20;
    M2_drawAxes(ox4, oy4, 180, 160, 'x', 'y', '#555566');
    M2_newArrow(ox4, oy4, ox4 + 100, oy4, '#60a5fa', 'A');
    M2_newArrow(ox4, oy4, ox4 + 80 * Math.cos(radB), oy4 - 80 * Math.sin(radB), '#34d399', 'B');
    var dot4 = 100 * 80 * Math.cos(radB);
    M2_textBox(20, 20, 'A\u00B7B = ' + dot4.toFixed(0), Math.abs(dot4) < 500 ? '#34d399' : '#FFFFFF', 14);
    if (Math.abs(dot4) < 300) { M2_fill('#34d399', 0.8 + 0.2 * Math.sin(t * 6)); noStroke(); textSize(20); textAlign(CENTER, CENTER); text('PERPENDICULAR!', cx, 60); }
  } else if (idx === 5) {
    var props = [{ title: 'Commutative', desc: 'A\u00B7B = B\u00B7A', y: 60 }, { title: 'Distributive', desc: 'A\u00B7(B+C) = A\u00B7B + A\u00B7C', y: 160 }, { title: 'NOT Associative', desc: '(A\u00B7B)\u00B7C = scalar\u00B7vector \u2260 defined', y: 260 }];
    for (var pi = 0; pi < props.length; pi++) {
      var p = props[pi]; M2_fill('#000000', 0.35); noStroke(); rect(30, p.y, width - 60, 70, 6);
      fill(pi === 2 ? 239 : 200, pi === 2 ? 68 : 200, pi === 2 ? 68 : 200); textSize(14); textAlign(LEFT, TOP); text(p.title, 45, p.y + 8);
      fill(180); textSize(12); text(p.desc, 45, p.y + 30);
      if (pi === 2) { fill(239, 68, 68); textSize(11); text('Error: scalar \u00D7 vector is not a dot product', 45, p.y + 50); }
    }
  } else {
    var ox6 = cx - 60, oy6 = cy + 60, sc6 = 20;
    M2_drawAxes(ox6, oy6, 200, 180, 'x', 'y', '#555566');
    M2_newArrow(ox6, oy6, ox6 + 2 * sc6, oy6 - 3 * sc6, '#60a5fa', 'A=(2,3)');
    M2_newArrow(ox6, oy6, ox6 + 4 * sc6, oy6 + 2 * sc6, '#34d399', 'B=(4,-2)');
    M2_drawFormulaBox(20, 20, 380, ['A=2\u00EE+3\u0135, B=4\u00EE\u22122\u0135', 'A\u00B7B = 8\u22126 = 2', '|A|=\u221A13, |B|=\u221A20', 'cos\u03B8 = 2/(\u221A13\u00D7\u221A20) \u2192 \u03B8\u224882.9\u00B0'], '#000000', '#FFFFFF');
  }
}

function M2_distanceVsDisplacement(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (idx === 1) {
    var nlY = cy; var nl = M2_drawNumberLine(nlY, 0, 100, '#AAAAAA', 10);
    var progress = constrain(t * 0.4, 0, 2); var pos;
    if (progress < 1) pos = 60 * progress; else pos = 60 - 40 * (progress - 1);
    var px = nl.x1 + (pos / 100) * (nl.x2 - nl.x1);
    if (progress < 1) { M2_stroke('#60a5fa', 0.5); strokeWeight(3); line(nl.x1, nlY - 8, px, nlY - 8); }
    else { M2_stroke('#60a5fa', 0.5); strokeWeight(3); var x60 = nl.x1 + 0.6 * (nl.x2 - nl.x1); line(nl.x1, nlY - 8, x60, nlY - 8); M2_stroke('#ef4444', 0.5); line(x60, nlY - 12, px, nlY - 12); }
    M2_drawParticle(px, nlY, 8, '#fbbf24', '');
    M2_drawFormulaBox(20, 30, 300, ['Distance = 60+40 = 100m (total path)', 'Displacement = 20m (net position)'], '#000000', '#FFFFFF');
    M2_textBox(20, height - 30, 'Distance \u2265 |Displacement| always', '#fbbf24', 12);
  } else if (idx === 2) {
    var r = 90, scx = cx, scy = cy + 20;
    noFill(); M2_stroke('#60a5fa', 0.8); strokeWeight(2); arc(scx, scy, r * 2, r * 2, Math.PI, 2 * Math.PI);
    M2_drawParticle(scx - r, scy, 6, '#34d399', 'A'); M2_drawParticle(scx + r, scy, 6, '#ef4444', 'B');
    M2_newArrow(scx - r, scy + 15, scx + r, scy + 15, '#fbbf24', 'Displacement=2r=28m');
    M2_fill('#60a5fa', 0.8); noStroke(); textSize(11); textAlign(CENTER, BOTTOM); text('Path=\u03C0r\u224844m', scx, scy - r - 5);
    M2_drawFormulaBox(20, 20, 320, ['r=14m', 'Distance=\u03C0r\u224844m', 'Displacement=2r=28m'], '#000000', '#FFFFFF');
  } else if (idx === 3) {
    var nlY3 = height * 0.35; var nl3 = M2_drawNumberLine(nlY3, -20, 80, '#AAAAAA', 5);
    var gox = 60, goy = height - 40, gw = width - 120, gh = 120;
    M2_drawAxes(gox, goy, gw, gh, 't(s)', 'v(m/s)', '#555566');
    var tMax3 = 5; var simT3 = (t * 0.6) % tMax3; var v3 = 20 - 8 * simT3; var pos3 = 20 * simT3 - 4 * simT3 * simT3;
    M2_stroke('#34d399', 0.8); strokeWeight(2); line(gox, goy - (20 / 30) * gh, gox + gw, goy - ((20 - 8 * tMax3) / 30) * gh);
    var crossT = 2.5; var crossX = gox + (crossT / tMax3) * gw;
    M2_fill('#ef4444', 0.9); noStroke(); ellipse(crossX, goy, 8, 8);
    M2_textBox(crossX - 60, goy + 5, 'DIRECTION REVERSAL', '#ef4444', 10);
    var curX3 = gox + (simT3 / tMax3) * gw;
    stroke(255, 255, 255, 150); strokeWeight(1); line(curX3, goy, curX3, goy - gh);
    M2_fill('#fbbf24', 1.0); noStroke(); ellipse(curX3, goy - (v3 / 30) * gh, 7, 7);
    var px3 = nl3.x1 + ((pos3 + 20) / 100) * (nl3.x2 - nl3.x1);
    M2_drawParticle(constrain(px3, nl3.x1, nl3.x2), nlY3, 8, '#fbbf24', '');
  } else if (idx === 4) {
    var nlY4 = cy; var nl4 = M2_drawNumberLine(nlY4, 0, 100, '#AAAAAA', 5);
    var simT4 = (t * 0.3) % 2;
    var p1x = simT4 < 1 ? simT4 * 80 : 80;
    var p2x; if (simT4 < 0.5) p2x = simT4 * 200; else if (simT4 < 1) p2x = 100 - (simT4 - 0.5) * 40; else p2x = 80;
    M2_drawParticle(nl4.x1 + (p1x / 100) * (nl4.x2 - nl4.x1), nlY4 - 15, 6, '#60a5fa', 'P1');
    M2_drawParticle(nl4.x1 + (p2x / 100) * (nl4.x2 - nl4.x1), nlY4 + 15, 6, '#ef4444', 'P2');
    M2_drawFormulaBox(20, 30, 340, ['P1: direct \u2192 avg speed = avg velocity', 'P2: detour \u2192 avg speed > avg velocity', 'Same displacement, different distances!'], '#000000', '#FFFFFF');
  } else if (idx === 5) {
    var v1 = M2_getCanvasSliderVal('hv1', 10, 100, 40, height - 70, 'v\u2081 (km/h)');
    var v2 = M2_getCanvasSliderVal('hv2', 10, 100, 60, height - 40, 'v\u2082 (km/h)');
    var harmonic = 2 * v1 * v2 / (v1 + v2); var arithmetic = (v1 + v2) / 2;
    var barW2 = 30, maxV = 100; var bx1 = cx - 60, bx2 = cx + 20, by2 = 80, bh2 = 250;
    M2_fill('#000000', 0.3); noStroke(); rect(bx1 - 10, by2, barW2 + 20, bh2 + 30, 4); rect(bx2 - 10, by2, barW2 + 20, bh2 + 30, 4);
    M2_fill('#fbbf24', 0.8); rect(bx1, by2 + bh2 - harmonic / maxV * bh2, barW2, harmonic / maxV * bh2, 3);
    M2_fill('#C896FF', 0.8); rect(bx2, by2 + bh2 - arithmetic / maxV * bh2, barW2, arithmetic / maxV * bh2, 3);
    fill(200); textSize(10); textAlign(CENTER, TOP); noStroke();
    text('Harmonic', bx1 + barW2 / 2, by2 + bh2 + 5); text(harmonic.toFixed(1), bx1 + barW2 / 2, by2 + bh2 + 17);
    text('Arithmetic', bx2 + barW2 / 2, by2 + bh2 + 5); text(arithmetic.toFixed(1), bx2 + barW2 / 2, by2 + bh2 + 17);
    M2_drawFormulaBox(20, 20, 360, ['1st half at v\u2081=' + v1.toFixed(0) + ', 2nd half at v\u2082=' + v2.toFixed(0), 'Avg speed = 2v\u2081v\u2082/(v\u2081+v\u2082) = ' + harmonic.toFixed(1), 'Harmonic \u2264 Arithmetic (always)'], '#000000', '#FFFFFF');
  } else {
    var nlY6 = cy; var nl6 = M2_drawNumberLine(nlY6, 0, 100, '#AAAAAA', 10);
    var simT6 = (t * 0.3) % 3; var waypoints = [0, 40, 70, 30, 80];
    var totalSeg = waypoints.length - 1; var seg = constrain(Math.floor(simT6 / 3 * totalSeg), 0, totalSeg - 1);
    var segFrac = constrain((simT6 / 3 * totalSeg) - seg, 0, 1);
    var pos6 = waypoints[seg] + (waypoints[seg + 1] - waypoints[seg]) * segFrac;
    M2_drawParticle(nl6.x1 + (pos6 / 100) * (nl6.x2 - nl6.x1), nlY6, 8, '#fbbf24', '');
    var dist6 = 0; for (var di = 0; di < seg; di++) dist6 += Math.abs(waypoints[di + 1] - waypoints[di]);
    dist6 += Math.abs((waypoints[seg + 1] - waypoints[seg]) * segFrac);
    M2_drawFormulaBox(20, 30, 300, ['Distance = ' + dist6.toFixed(1) + 'm', 'Displacement = ' + (pos6 - waypoints[0]).toFixed(1) + 'm'], '#000000', '#FFFFFF');
  }
}

function M2_uniformAcceleration(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (idx === 1) {
    var gox = 80, goy = height - 80, gw = width - 160, gh = 250;
    M2_drawAxes(gox, goy, gw, gh, 't', 'v', '#555566');
    var u = 5, a = 3, tMax = 4; var v_final = u + a * tMax; var vScale = gh / (v_final * 1.2);
    M2_stroke('#60a5fa', 0.9); strokeWeight(2.5); line(gox, goy - u * vScale, gox + gw, goy - v_final * vScale);
    var fillT = constrain(t * 0.5, 0, 1); var fillX = gox + fillT * gw;
    M2_fill('#60a5fa', 0.15); noStroke(); beginShape();
    vertex(gox, goy); vertex(gox, goy - u * vScale); vertex(fillX, goy - (u + a * fillT * tMax) * vScale); vertex(fillX, goy); endShape(CLOSE);
    fill(200); textSize(11); textAlign(RIGHT, CENTER); noStroke();
    text('u=' + u, gox - 5, goy - u * vScale); text('v=' + v_final.toFixed(0), gox - 5, goy - v_final * vScale);
    M2_drawFormulaBox(20, 20, 330, ['s = area of trapezoid = (u+v)t/2', 's = (' + u + '+' + v_final.toFixed(0) + ')\u00D7' + tMax + '/2 = ' + ((u + v_final) * tMax / 2).toFixed(0) + 'm', 'v = u+at = ' + v_final.toFixed(0) + ' m/s'], '#000000', '#fbbf24');
  } else if (idx === 2) {
    var pw = (width - 40) / 3, ph = height - 80;
    var eqns = ['v = u + at', 's = ut + \u00BDat\u00B2', 'v\u00B2 = u\u00B2 + 2as'];
    for (var ei = 0; ei < 3; ei++) {
      var ex = 20 + ei * (pw + 5), ey = 50;
      M2_fill('#000000', 0.3); noStroke(); rect(ex, ey, pw - 5, ph, 4);
      fill(200); textSize(12); textAlign(CENTER, TOP); text(eqns[ei], ex + pw / 2, ey + 5);
      var gx = ex + 20, gy = ey + ph - 20, gw2 = pw - 50, gh2 = ph - 60;
      M2_drawAxes(gx, gy, gw2, gh2, '', '', '#444455');
      M2_stroke(ei === 0 ? '#60a5fa' : ei === 1 ? '#34d399' : '#fbbf24', 0.9); strokeWeight(2); noFill();
      beginShape(); for (var pi = 0; pi <= 30; pi++) { var tf = pi / 30; var yv; if (ei === 0) yv = tf; else if (ei === 1) yv = tf * tf; else yv = Math.sqrt(tf); vertex(gx + tf * gw2, gy - yv * gh2 * 0.8); } endShape();
    }
  } else if (idx === 3) {
    var trackY = cy - 20; stroke(100); strokeWeight(2); line(30, trackY, width - 30, trackY);
    var a3 = 2; var cols3 = ['#60a5fa', '#34d399', '#fbbf24', '#C896FF', '#ef4444'];
    for (var ni = 0; ni < 5; ni++) {
      var sn = 0.5 * a3 * (ni + 1) * (ni + 1); var sn_prev = ni === 0 ? 0 : 0.5 * a3 * ni * ni; var segDist = sn - sn_prev;
      var px1 = 50 + sn_prev * 8, px2 = 50 + sn * 8;
      M2_fill(cols3[ni % 5], 0.3); noStroke(); rect(px1, trackY - 20, px2 - px1, 40, 2);
      M2_fill(cols3[ni % 5], 0.9); textSize(10); textAlign(CENTER, CENTER); text(segDist.toFixed(0) + 'm', (px1 + px2) / 2, trackY);
    }
    M2_drawFormulaBox(20, 20, 360, ['From rest: sn = \u00BDa(2n-1)', 'Ratio 1:3:5:7:9 (odd numbers!)'], '#000000', '#fbbf24');
  } else if (idx === 4) {
    var H = 40, u4 = 10, g = 9.8; var tTotal = (u4 + Math.sqrt(u4 * u4 + 2 * g * H)) / g;
    var simT4 = (t * 0.3) % (tTotal + 0.5); var y4 = H + u4 * simT4 - 0.5 * g * simT4 * simT4; if (y4 < 0) y4 = 0;
    var towerX = cx - 80, groundY = height - 50, towerTop = groundY - H * 3;
    M2_fill('#555555', 0.8); noStroke(); rect(towerX - 15, towerTop, 30, H * 3, 2);
    stroke(150); strokeWeight(1); line(20, groundY, width - 20, groundY);
    M2_drawParticle(towerX, constrain(groundY - y4 * 3, 30, groundY), 8, '#fbbf24', '');
    M2_drawFormulaBox(cx, 20, 320, ['H=40m, u=+10m/s, g=-9.8m/s\u00B2', 's=-40m (down)', '-40 = 10t - 4.9t\u00B2', 't \u2248 ' + tTotal.toFixed(2) + 's (one equation!)'], '#000000', '#FFFFFF');
  } else if (idx === 5) {
    var gox5 = 80, goy5 = height - 60, gw5 = width - 160, gh5 = 300;
    M2_drawAxes(gox5, goy5, gw5, gh5, 't(s)', 'v(m/s)', '#555566');
    var u5 = 10, a5 = 4, tMax5 = 5; var vScale5 = gh5 / 35;
    M2_stroke('#60a5fa', 0.9); strokeWeight(2.5);
    line(gox5, goy5 - u5 * vScale5, gox5 + gw5, goy5 - (u5 + a5 * tMax5) * vScale5);
    var curT5 = M2_getCanvasSliderVal('vtCur', 0, 5, 2, height - 30, 'Cursor t(s)');
    var curX5 = gox5 + (curT5 / tMax5) * gw5; var curV5 = u5 + a5 * curT5;
    stroke(255, 255, 255, 150); strokeWeight(1); line(curX5, goy5, curX5, goy5 - gh5);
    M2_fill('#fbbf24', 1.0); noStroke(); ellipse(curX5, goy5 - curV5 * vScale5, 8, 8);
    M2_drawFormulaBox(20, 20, 320, ['u=' + u5 + ' m/s, a=' + a5 + ' m/s\u00B2', 'At t=' + curT5.toFixed(1) + ': v=' + curV5.toFixed(1), 's = ' + (u5 * curT5 + 0.5 * a5 * curT5 * curT5).toFixed(1) + 'm'], '#000000', '#FFFFFF');
  } else {
    M2_drawFormulaBox(20, 20, 360, ['From rest with uniform a:', 'Distance in nth second: sn = \u00BDa(2n-1)', 'Ratio: 1:3:5:7 (odd numbers)', '', 'Distance in first n seconds: Sn = \u00BDan\u00B2', 'Ratio: 1:4:9:16 (perfect squares)'], '#000000', '#FFFFFF');
    var bx6 = 50, by6 = height - 150, bw6 = 40;
    var odds = [1, 3, 5, 7]; var squares = [1, 4, 9, 16];
    for (var ri = 0; ri < 4; ri++) {
      M2_fill('#60a5fa', 0.7); noStroke(); rect(bx6 + ri * 50, by6 - odds[ri] * 12, bw6, odds[ri] * 12, 2);
      fill(200); textSize(9); textAlign(CENTER, TOP); text(odds[ri], bx6 + ri * 50 + bw6 / 2, by6 + 3);
      M2_fill('#fbbf24', 0.7); rect(bx6 + 250 + ri * 50, by6 - squares[ri] * 5, bw6, squares[ri] * 5, 2);
      fill(200); text(squares[ri], bx6 + 250 + ri * 50 + bw6 / 2, by6 + 3);
    }
  }
}

function M2_nonUniformAcceleration(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (idx === 1) {
    var gox = 80, goy = height - 80, gw = width - 160, gh = 250;
    M2_drawAxes(gox, goy, gw, gh, 't(s)', 'v(m/s)', '#555566'); var tMax = 4;
    M2_stroke('#60a5fa', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var i = 0; i <= 30; i++) { var ti = i / 30 * tMax; vertex(gox + (ti / tMax) * gw, goy - (2 * ti / 12) * gh); } endShape();
    M2_stroke('#ef4444', 0.9); strokeWeight(2); beginShape();
    for (var j = 0; j <= 30; j++) { var tj = j / 30 * tMax; vertex(gox + (tj / tMax) * gw, goy - (tj * tj / 20) * gh); } endShape();
    var t3x = gox + (3 / tMax) * gw;
    stroke(255, 255, 255, 100); strokeWeight(1); line(t3x, goy, t3x, goy - gh);
    fill(200); textSize(10); textAlign(CENTER, BOTTOM); noStroke(); text('t=3', t3x, goy + 15);
    M2_drawFormulaBox(20, 20, 380, ['A(a=2): v=2t, at t=3: v=6  \u2714', 'B(a=2t): v=t\u00B2, at t=3: v=9', 'suvat gives v=0+2\u00D73=6 \u2718 WRONG for B!'], '#000000', '#FFFFFF');
    M2_fill('#60a5fa', 0.8); noStroke(); textSize(10); text('A(const a)', gox + gw + 5, goy - (2 * tMax / 12) * gh);
    M2_fill('#ef4444', 0.8); text('B(a=2t)', gox + gw + 5, goy - (tMax * tMax / 20) * gh);
  } else if (idx === 2) {
    var steps = ['Given: dv/dt = 2t', '\u222Bdv = \u222B2t dt', 'v = t\u00B2 + C', 'At t=0, v=0 \u2192 C=0', 'v = t\u00B2', 'dx/dt = t\u00B2 \u2192 x = t\u00B3/3'];
    var showN = constrain(Math.floor(t * 0.8), 0, steps.length);
    for (var si = 0; si < showN; si++) {
      var ypos = 40 + si * 40; var col = si === showN - 1 ? '#fbbf24' : '#AAAAAA';
      M2_textBox(40, ypos, steps[si], col, 14);
      if (si < showN - 1) { M2_stroke('#555555', 0.5); strokeWeight(1); line(55, ypos + 22, 55, ypos + 38); M2_fill('#555555', 0.5); noStroke(); triangle(55, ypos + 40, 52, ypos + 36, 58, ypos + 36); }
    }
  } else if (idx === 3) {
    M2_drawFormulaBox(30, 30, 400, ['Problem: a = kx', '', 'Cannot integrate a=dv/dt directly!', 'Chain rule: a = v(dv/dx)', '', 'v dv = kx dx', '\u222Bv dv = \u222Bkx dx', 'v\u00B2/2 = kx\u00B2/2 + C'], '#000000', '#FFFFFF');
    var stuckPhase = (t * 2) % 4;
    if (stuckPhase < 2) { M2_fill('#ef4444', 0.6 + 0.3 * Math.sin(t * 4)); noStroke(); textSize(14); textAlign(CENTER, CENTER); text('\u274C \u222Ba(x)dt = ??? (stuck!)', cx + 50, height - 60); }
    else { M2_fill('#34d399', 0.8); noStroke(); textSize(14); textAlign(CENTER, CENTER); text('\u2714 v dv = a(x) dx (unlocked!)', cx + 50, height - 60); }
  } else if (idx === 4) {
    var g4 = 10, k4 = 2; var vTerm = g4 / k4;
    var gox4 = 80, goy4 = height - 60, gw4 = width - 160, gh4 = 300;
    M2_drawAxes(gox4, goy4, gw4, gh4, 't(s)', 'v(m/s)', '#555566');
    M2_stroke('#60a5fa', 0.9); strokeWeight(2.5); noFill(); beginShape();
    for (var vi = 0; vi <= 40; vi++) { var tv = vi / 40 * 5; var vv = vTerm * (1 - Math.exp(-k4 * tv)); vertex(gox4 + (tv / 5) * gw4, goy4 - (vv / (vTerm * 1.3)) * gh4); } endShape();
    var termY = goy4 - (vTerm / (vTerm * 1.3)) * gh4;
    M2_drawDashedLine(gox4, termY, gox4 + gw4, termY, '#fbbf24', 8, 5);
    fill(250, 190, 40); textSize(11); textAlign(LEFT, BOTTOM); noStroke(); text('v_terminal = ' + vTerm + ' m/s', gox4 + gw4 / 2, termY - 5);
    M2_drawFormulaBox(20, 20, 320, ['a = g\u2212kv (skydiver)', 'Terminal: a=0 \u2192 v_t = g/k = ' + vTerm, 'Exponential approach to v_t'], '#000000', '#FFFFFF');
  } else if (idx === 5) {
    M2_textBox(cx - 60, 20, 'Given: a = ?', '#FFFFFF', 16);
    var branches = [{ x: cx - 220, label: 'a = f(t)', method: 'dv = a(t)dt\n\u222Bdv=\u222Ba(t)dt', col: '#60a5fa' }, { x: cx - 20, label: 'a = f(x)', method: 'v dv = a(x)dx\n\u222Bv dv=\u222Ba(x)dx', col: '#34d399' }, { x: cx + 180, label: 'a = f(v)', method: 'dv/a(v)=dt\nor v dv/a(v)=dx', col: '#fbbf24' }];
    for (var bi = 0; bi < 3; bi++) {
      var b = branches[bi]; M2_stroke('#888888', 0.6); strokeWeight(1.5); line(cx, 45, b.x + 80, 90);
      M2_fill('#000000', 0.5); noStroke(); rect(b.x, 90, 160, 40, 4);
      fill(M2_rgb(b.col)[0], M2_rgb(b.col)[1], M2_rgb(b.col)[2]); textSize(13); textAlign(CENTER, CENTER); text(b.label, b.x + 80, 110);
      M2_fill('#000000', 0.4); noStroke(); rect(b.x, 145, 160, 55, 4);
      fill(200); textSize(10); textAlign(CENTER, TOP); var mLines = b.method.split('\n');
      for (var ml = 0; ml < mLines.length; ml++) text(mLines[ml], b.x + 80, 150 + ml * 16);
    }
  } else {
    M2_drawFormulaBox(30, 20, 420, ['a = 4\u22122v, start from rest', '', '(i) v_terminal: 4\u22122v=0 \u2192 v=2 m/s', '', '(ii) v(t): dv/(4\u22122v) = dt', '    \u2212\u00BDln(4\u22122v) = t + C', '    v = 2(1\u2212e\u207B\u00B2\u1D57)'], '#000000', '#FFFFFF');
    var grx6 = width - 220, gry6 = height - 40;
    M2_drawAxes(grx6, gry6, 180, 150, 't', 'v', '#444455');
    M2_stroke('#fbbf24', 0.9); strokeWeight(2); noFill(); beginShape();
    for (var qi = 0; qi <= 30; qi++) { var tq = qi / 30 * 4; vertex(grx6 + (tq / 4) * 180, gry6 - (2 * (1 - Math.exp(-2 * tq)) / 2.5) * 150); } endShape();
    M2_drawDashedLine(grx6, gry6 - (2 / 2.5) * 150, grx6 + 180, gry6 - (2 / 2.5) * 150, '#fbbf24', 6, 4);
  }
}

function M2_motionGraphs(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26);
  var splitX = width * 0.40; var gLeft = splitX + 15, gRight = width - 15; var gW = gRight - gLeft; var gMidY = height / 2;
  stroke(50, 50, 70); strokeWeight(1); line(splitX, 0, splitX, height); line(gLeft, gMidY, gRight, gMidY);
  fill(120); textSize(9); textAlign(LEFT, TOP); noStroke(); text('PARTICLE', 6, 4); text('x-t', gLeft + 4, 6); text('v-t', gLeft + 4, gMidY + 6);
  var a_mg = 3, u_mg = 0; var animDur = 5;
  var cursorT = (millis() / 1000 * 0.3) % animDur;
  var xMax = 0.5 * a_mg * animDur * animDur * 1.1; var vMax = a_mg * animDur * 1.1;
  var pPos = u_mg * cursorT + 0.5 * a_mg * cursorT * cursorT; var vNow = u_mg + a_mg * cursorT;
  var pPx = constrain(20 + (pPos / xMax) * (splitX - 40), 20, splitX - 20);
  stroke(80); strokeWeight(1); line(15, height / 2, splitX - 15, height / 2);
  M2_drawParticle(pPx, height / 2, 10, '#60a5fa', '');
  if (vNow > 0.5) M2_newArrow(pPx, height / 2 - 20, pPx + constrain(vNow * 3, 5, 80), height / 2 - 20, '#34d399', 'v=' + vNow.toFixed(1));
  var xtOx = gLeft + 25, xtOy = gMidY - 15, xtW = gW - 40, xtH = gMidY - 35;
  M2_drawAxes(xtOx, xtOy, xtW, xtH, 't', 'x', '#444455');
  M2_stroke('#60a5fa', 0.9); strokeWeight(2); noFill(); beginShape();
  for (var xi = 0; xi <= 40; xi++) { var tt = xi / 40 * animDur; vertex(xtOx + (tt / animDur) * xtW, xtOy - ((u_mg * tt + 0.5 * a_mg * tt * tt) / xMax) * xtH); } endShape();
  var xtCurX = xtOx + (cursorT / animDur) * xtW;
  stroke(255, 255, 255, 150); strokeWeight(1); line(xtCurX, xtOy - xtH, xtCurX, xtOy);
  M2_fill('#fbbf24', 1.0); noStroke(); ellipse(xtCurX, xtOy - (pPos / xMax) * xtH, 7, 7);
  var vtOx = gLeft + 25, vtOy = height - 15, vtW = gW - 40, vtH = height / 2 - 35;
  M2_drawAxes(vtOx, vtOy, vtW, vtH, 't', 'v', '#444455');
  M2_stroke('#34d399', 0.9); strokeWeight(2);
  line(vtOx, vtOy - (u_mg / vMax) * vtH, vtOx + vtW, vtOy - ((u_mg + a_mg * animDur) / vMax) * vtH);
  var vtCurX = vtOx + (cursorT / animDur) * vtW;
  stroke(255, 255, 255, 150); strokeWeight(1); line(vtCurX, vtOy - vtH, vtCurX, vtOy);
  M2_fill('#fbbf24', 1.0); noStroke(); ellipse(vtCurX, vtOy - (vNow / vMax) * vtH, 7, 7);
  if (idx === 2) M2_textBox(gLeft + 5, gMidY - 35, 'Slope of x-t = velocity = ' + vNow.toFixed(1), '#fbbf24', 10);
  else if (idx === 3) {
    M2_fill('#34d399', 0.15); noStroke(); beginShape(); vertex(vtOx, vtOy);
    for (var ai = 0; ai <= 30; ai++) { var ta = ai / 30 * cursorT; vertex(vtOx + (ta / animDur) * vtW, vtOy - ((u_mg + a_mg * ta) / vMax) * vtH); }
    vertex(vtOx + (cursorT / animDur) * vtW, vtOy); endShape(CLOSE);
    M2_textBox(gLeft + 5, height - 35, 'Area = displacement = ' + pPos.toFixed(1) + 'm', '#34d399', 10);
  } else if (idx === 4) M2_textBox(gLeft + 5, gMidY + 20, 'Slope of v-t = a = ' + a_mg + ' m/s\u00B2', '#C896FF', 10);
  else if (idx >= 5) M2_textBox(6, height - 35, 'Slope x-t=v | Area v-t=x | Slope v-t=a', '#fbbf24', 10);
}

function M2_relativeMotion(cfg, stateData, t) {
  var idx = M2_stateIdx(); background(15, 15, 26); var cx = width / 2, cy = height / 2;
  if (idx === 1) {
    var frameToggle = M2_getCanvasSliderVal('frame', 0, 1, 0, height - 50, 'Frame: 0=Ground 1=B');
    var isGround = frameToggle < 0.5;
    stroke(80); strokeWeight(3); line(20, cy + 30, width - 20, cy + 30);
    var vA = 80, vB = 60; var simT = (t * 0.15) % 5; var posA, posB;
    if (isGround) { posA = 60 + vA * simT * 0.8; posB = 40 + vB * simT * 0.8; }
    else { posA = 60 + (vA - vB) * simT * 0.8; posB = 40; }
    posA = posA % (width - 40); posB = posB % (width - 40);
    M2_fill('#60a5fa', 0.9); noStroke(); rect(posA, cy + 5, 40, 18, 3);
    M2_fill('#FFA050', 0.9); rect(posB, cy + 35, 40, 18, 3);
    fill(255); textSize(9); textAlign(CENTER, CENTER); text('A', posA + 20, cy + 14); text('B', posB + 20, cy + 44);
    M2_drawFormulaBox(20, 20, 350, [isGround ? 'Ground: A=80, B=60 km/h' : "B's frame: B=0, A=20 km/h", 'v_AB = v_A\u2212v_B = 20 km/h'], '#000000', '#FFFFFF');
  } else if (idx === 2) {
    var vA2 = M2_getCanvasSliderVal('rmVA', 10, 100, 80, height - 70, 'v_A');
    var vB2 = M2_getCanvasSliderVal('rmVB', 10, 100, 60, height - 40, 'v_B');
    var sc = 1.2;
    M2_newArrow(60, cy - 30, 60 + vA2 * sc, cy - 30, '#60a5fa', 'v_A=' + vA2.toFixed(0));
    M2_newArrow(60, cy + 10, 60 + vB2 * sc, cy + 10, '#FFA050', 'v_B=' + vB2.toFixed(0));
    M2_newArrow(60, cy + 50, 60 - vB2 * sc, cy + 50, '#ef4444', '\u2212v_B');
    var vAB = vA2 - vB2;
    M2_newArrow(60, cy + 90, 60 + Math.abs(vAB) * sc, cy + 90, vAB >= 0 ? '#34d399' : '#C896FF', 'v_AB=' + vAB.toFixed(0));
    M2_textBox(20, 20, 'v_AB = v_A \u2212 v_B', '#fbbf24', 13);
  } else if (idx === 3) {
    M2_fill('#000000', 0.3); noStroke(); rect(20, 40, width / 2 - 30, height / 2 - 50, 4);
    fill(200); textSize(11); textAlign(CENTER, TOP); text('Same direction', width / 4, 45);
    M2_newArrow(40, 100, 120, 100, '#60a5fa', 'A=80'); M2_newArrow(40, 130, 100, 130, '#FFA050', 'B=60');
    M2_textBox(40, 155, 'v_AB = 80\u221260 = 20', '#fbbf24', 10);
    M2_fill('#000000', 0.3); noStroke(); rect(width / 2 + 10, 40, width / 2 - 30, height / 2 - 50, 4);
    fill(200); textSize(11); textAlign(CENTER, TOP); text('Opposite direction', width * 3 / 4, 45);
    M2_newArrow(width / 2 + 30, 100, width / 2 + 110, 100, '#60a5fa', 'A=80');
    M2_newArrow(width - 40, 130, width - 120, 130, '#FFA050', 'B=60');
    M2_textBox(width / 2 + 30, 155, 'Closing = 80+60 = 140', '#fbbf24', 10);
    M2_drawFormulaBox(20, height / 2, width - 40, ['Same dir: v_rel = v_A\u2212v_B', 'Opposite: closing = v_A+v_B'], '#000000', '#FFFFFF');
  } else if (idx === 4) {
    var ox4 = cx - 60, oy4 = cy + 60; M2_drawAxes(ox4, oy4, 200, 180, 'E', 'N', '#555566'); var sc4 = 4;
    M2_newArrow(ox4, oy4, ox4 + 20 * sc4, oy4, '#60a5fa', 'v_A=20E');
    M2_newArrow(ox4, oy4, ox4, oy4 - 15 * sc4, '#FFA050', 'v_B=15N');
    M2_newArrow(ox4, oy4, ox4 + 20 * sc4, oy4 + 15 * sc4, '#34d399', 'v_AB');
    M2_drawDashedLine(ox4 + 20 * sc4, oy4, ox4 + 20 * sc4, oy4 + 15 * sc4, '#888888', 4, 3);
    M2_drawFormulaBox(20, 20, 380, ['v_AB = (20,0)\u2212(0,15) = (20,\u221215)', '|v_AB| = \u221A625 = 25 km/h', '37\u00B0 south of east'], '#000000', '#FFFFFF');
  } else if (idx === 5) {
    var simT5 = (t * 0.3) % 3;
    var y1 = 40 * simT5 - 5 * simT5 * simT5, x1 = 20 * simT5;
    var y2 = 30 * simT5 - 5 * simT5 * simT5, x2 = 30 * simT5;
    if (y1 < 0) y1 = 0; if (y2 < 0) y2 = 0;
    M2_fill('#000000', 0.3); noStroke(); rect(10, 40, width / 2 - 20, height - 80, 4);
    fill(200); textSize(11); textAlign(CENTER, TOP); text('Ground Frame', width / 4, 45);
    stroke(80); strokeWeight(1); line(20, height - 60, width / 2 - 10, height - 60);
    M2_drawParticle(40 + x1 * 3, height - 60 - y1 * 4, 6, '#60a5fa', '1');
    M2_drawParticle(40 + x2 * 3, height - 60 - y2 * 4, 6, '#FFA050', '2');
    M2_fill('#000000', 0.3); noStroke(); rect(width / 2 + 10, 40, width / 2 - 20, height - 80, 4);
    fill(200); textSize(11); textAlign(CENTER, TOP); text("Ball 1's Frame", width * 3 / 4, 45);
    var relX = (x2 - x1) * 3, relY = (y2 - y1) * 4;
    M2_drawParticle(width / 2 + width / 4, height / 2, 6, '#60a5fa', '1(fixed)');
    M2_drawParticle(width / 2 + width / 4 + relX, height / 2 - relY, 6, '#FFA050', '2');
    M2_drawDashedLine(width / 2 + width / 4, height / 2, width / 2 + width / 4 + relX, height / 2 - relY, '#fbbf24', 4, 3);
    M2_textBox(width / 2 + 20, height - 50, 'Relative a=0 \u2192 straight line!', '#fbbf24', 11);
  } else {
    M2_drawFormulaBox(30, 20, 420, ['v_A=20E, v_B=15N', 'v_AB = (20,0)\u2212(0,15) = (20,\u221215)', '|v_AB| = \u221A625 = 25 km/h', 'tan\u03B1 = 15/20 \u2192 \u03B1 = 36.87\u00B0 south of east'], '#000000', '#FFFFFF');
    var ox6 = width - 200, oy6 = height - 60; M2_drawAxes(ox6, oy6, 150, 150, 'E', 'N', '#444455');
    M2_newArrow(ox6, oy6, ox6 + 80, oy6, '#60a5fa', '20E');
    M2_newArrow(ox6, oy6, ox6, oy6 + 60, '#ef4444', '\u221215N');
    M2_newArrow(ox6, oy6, ox6 + 80, oy6 + 60, '#34d399', 'v_AB=25');
  }
}

function M2_riverBoat(cfg, stateData, t) {
  var idx = M2_stateIdx();
  var d = M2_paramSlot(cfg, 'd', 30), v_br = M2_paramSlot(cfg, 'v_br', 5), v_r = M2_paramSlot(cfg, 'v_r', 4);
  M2_drawRiverEnv(t, d);
  var riverTop = height * 0.35, riverBot = height * 0.65, riverW = riverBot - riverTop, cx = width / 2;
  if (idx === 1) {
    var crossTime = d / v_br, drift = v_r * crossTime;
    var simT = (t * 0.2) % (crossTime + 0.5); var frac = constrain(simT / crossTime, 0, 1);
    var bx = cx + frac * drift * 2, by = riverTop + frac * riverW;
    M2_fill('#C896FF', 1.0); noStroke(); ellipse(bx, by, 18, 10);
    M2_newArrow(bx, by, bx, by + 20, '#C896FF', ''); M2_newArrow(bx, by, bx + 20, by, '#FFA050', 'v_r');
    M2_fill('#FF5050', 0.8); noStroke(); ellipse(cx, riverBot + 5, 10, 10);
    fill(255); textSize(9); textAlign(CENTER, BOTTOM); text('B', cx, riverBot);
    M2_drawFormulaBox(10, height * 0.72, 300, ['Boat aims perpendicular but DRIFTS!', 'Drift = v_r\u00D7d/v_br = ' + drift.toFixed(1) + 'm'], '#000000', '#fbbf24');
  } else if (idx === 2) {
    var steerDeg = M2_getCanvasSliderVal('steer', -60, 60, 0, height - 50, 'Steer angle (\u00B0)');
    var steerRad = steerDeg * Math.PI / 180;
    var drift2 = (v_r - v_br * Math.sin(steerRad)) * d / (v_br * Math.cos(steerRad + 0.001));
    var simT2 = (t * 0.2) % 4; var frac2 = constrain(simT2 / 3, 0, 1);
    var bx2 = cx + drift2 * frac2 * 0.5, by2 = riverTop + frac2 * riverW;
    M2_fill('#C896FF', 1.0); noStroke(); ellipse(bx2, by2, 18, 10);
    var vtx = 30, vty = height * 0.12, sc = 8;
    M2_newArrow(vtx, vty, vtx + v_br * sc * Math.sin(steerRad), vty + v_br * sc * Math.cos(steerRad), '#C896FF', 'v_br');
    M2_textBox(10, height * 0.72, 'Drift=' + drift2.toFixed(1) + 'm', '#fbbf24', 12);
  } else if (idx === 3) {
    var tMin = d / v_br, driftMin = v_r * tMin;
    var simT3 = (t * 0.2) % (tMin + 0.5); var frac3 = constrain(simT3 / tMin, 0, 1);
    M2_fill('#C896FF', 1.0); noStroke(); ellipse(cx + frac3 * driftMin * 2, riverTop + frac3 * riverW, 18, 10);
    M2_fill('#34d399', 0.9); noStroke(); textSize(14); textAlign(CENTER, CENTER); text('MINIMUM TIME', cx, height * 0.12);
    M2_drawFormulaBox(10, height * 0.72, 320, ['t_min = d/v_br = ' + tMin.toFixed(1) + 's', 'Drift = ' + driftMin.toFixed(1) + 'm'], '#000000', '#fbbf24');
  } else if (idx === 4) {
    var canZero = v_br > v_r;
    if (canZero) {
      var theta4 = Math.asin(v_r / v_br); var tCross4 = d / Math.sqrt(v_br * v_br - v_r * v_r);
      var simT4 = (t * 0.15) % (tCross4 + 0.5); var frac4 = constrain(simT4 / tCross4, 0, 1);
      M2_fill('#C896FF', 1.0); noStroke(); ellipse(cx, riverTop + frac4 * riverW, 18, 10);
      M2_fill('#34d399', 0.9); textSize(14); textAlign(CENTER, CENTER); text('ZERO DRIFT', cx, height * 0.12);
      M2_drawFormulaBox(10, height * 0.72, 340, ['sin\u03B8 = v_r/v_br = ' + (v_r / v_br).toFixed(2), '\u03B8 = ' + (theta4 * 180 / Math.PI).toFixed(1) + '\u00B0 upstream', 't = ' + tCross4.toFixed(1) + 's'], '#000000', '#34d399');
    } else {
      M2_fill('#ef4444', 0.9); noStroke(); textSize(16); textAlign(CENTER, CENTER);
      text('IMPOSSIBLE \u2014 river too strong!', cx, height * 0.12);
    }
  } else if (idx === 5) {
    var v_br5 = 3, v_r5 = 5; var minAlpha = Math.asin(v_br5 / v_r5);
    M2_fill('#ef4444', 0.8); noStroke(); textSize(13); textAlign(CENTER, CENTER);
    text('v_r > v_br: drift CANNOT be zero', cx, height * 0.12);
    M2_drawFormulaBox(10, height * 0.72, 360, ['v_br=' + v_br5 + ', v_r=' + v_r5, 'Min drift: sin\u03B1=v_br/v_r=' + (v_br5 / v_r5).toFixed(2), '\u03B1 = ' + (minAlpha * 180 / Math.PI).toFixed(1) + '\u00B0'], '#000000', '#FFFFFF');
  } else {
    var d6 = 30, vr6 = 4, vbr6 = 5; var tMin6 = d6 / vbr6, drift6 = vr6 * tMin6;
    var theta6 = Math.asin(vr6 / vbr6), tZero6 = d6 / Math.sqrt(vbr6 * vbr6 - vr6 * vr6);
    M2_drawFormulaBox(20, height * 0.72, 360, ['d=' + d6 + ', v_r=' + vr6 + ', v_br=' + vbr6, '(a) Min t=' + tMin6.toFixed(0) + 's, drift=' + drift6.toFixed(0) + 'm', '(b) Zero drift: \u03B8=' + (theta6 * 180 / Math.PI).toFixed(0) + '\u00B0, t=' + tZero6.toFixed(0) + 's'], '#000000', '#fbbf24');
    var simT6 = (t * 0.15) % (tZero6 + 0.5);
    var frac6a = constrain(simT6 / tMin6, 0, 1);
    M2_fill('#60a5fa', 1.0); noStroke(); ellipse(cx - 80 + frac6a * drift6 * 1.5, riverTop + frac6a * riverW, 14, 8);
    var frac6b = constrain(simT6 / tZero6, 0, 1);
    M2_fill('#34d399', 1.0); noStroke(); ellipse(cx + 80, riverTop + frac6b * riverW, 14, 8);
  }
}

function M2_rainUmbrella(cfg, stateData, t) {
  var idx = M2_stateIdx(); var vRain = 8; var cx = width / 2;
  if (idx === 1) {
    var vMan = M2_getCanvasSliderVal('rvm', 0, 10, 0, height - 50, 'Walking speed (m/s)');
    var rainAng = Math.atan2(vMan, vRain) * 180 / Math.PI;
    M2_drawRainEnv(t, rainAng, vMan, vRain);
    M2_drawStickFigure(cx, height - 90, vMan > 0.5, rainAng);
    M2_drawFormulaBox(10, 10, 320, ['v_man=' + vMan.toFixed(1) + ', v_rain=' + vRain, 'Tilt ' + rainAng.toFixed(1) + '\u00B0 forward', vMan < 0.5 ? 'Standing: rain vertical' : 'Walking: rain tilts!'], '#000000', '#FFFFFF');
  } else if (idx === 2) {
    var vMan2 = 4; var rainAng2 = Math.atan2(vMan2, vRain) * 180 / Math.PI;
    M2_drawRainEnv(t, rainAng2, vMan2, vRain);
    var vdx = width - 200, vdy = 60, sc2 = 8;
    M2_fill('#000000', 0.6); noStroke(); rect(vdx - 10, vdy - 10, 190, 140, 6);
    M2_newArrow(vdx + 20, vdy + 10, vdx + 20, vdy + 10 + vRain * sc2, '#AABBDD', 'v_rain=' + vRain);
    M2_newArrow(vdx + 20, vdy + 10 + vRain * sc2, vdx + 20 + vMan2 * sc2, vdy + 10 + vRain * sc2, '#FFA050', 'v_man=' + vMan2);
    var vrmMag = Math.sqrt(vRain * vRain + vMan2 * vMan2);
    M2_newArrow(vdx + 20, vdy + 10, vdx + 20 + vMan2 * sc2, vdy + 10 + vRain * sc2, '#34d399', 'v_rm=' + vrmMag.toFixed(1));
    M2_drawStickFigure(width / 3, height - 90, true, rainAng2);
  } else if (idx === 3) {
    var vm3 = 3, vr3 = 4, vrm3 = 5; var ang3 = Math.atan2(vm3, vr3) * 180 / Math.PI;
    M2_drawRainEnv(t, ang3, vm3, vr3);
    M2_drawStickFigure(width / 3, height - 90, true, ang3);
    M2_drawFormulaBox(10, 10, 340, ['v_man=3 East, v_rain=4 Down', 'v_rm = \u221A(9+16) = 5 (3-4-5!)', 'Umbrella ' + ang3.toFixed(1) + '\u00B0 east of vertical'], '#000000', '#fbbf24');
  } else if (idx === 4) {
    M2_drawRainEnv(t, 30, 5, 8);
    M2_drawFormulaBox(10, 10, 400, ['Obs 1: v_man=3 \u2192 rain vertical \u2192 v_rx=3', 'Obs 2: v_man=6 \u2192 rain at 45\u00B0 \u2192 v_ry=3', 'v_rain = \u221A(9+9) = 3\u221A2 \u2248 4.24 km/h'], '#000000', '#FFFFFF');
  } else if (idx === 5) {
    M2_drawRainEnv(t, 20, 3, 8);
    var dirs = ['Walk East', 'Walk West', 'Walk North'];
    for (var di = 0; di < 3; di++) {
      var bx = 50 + di * 250, by = height * 0.4;
      M2_fill('#000000', 0.5); noStroke(); rect(bx - 5, by - 10, 180, 50, 4);
      fill(200); textSize(11); textAlign(CENTER, CENTER); text(dirs[di], bx + 85, by + 5);
      text('Umbrella tilts ' + dirs[di].split(' ')[1], bx + 85, by + 25);
    }
    M2_textBox(cx - 150, height - 80, 'Umbrella ALWAYS tilts in walking direction', '#fbbf24', 13);
  } else {
    var vm6 = 5, vr6 = 12; var vrm6 = Math.sqrt(vm6 * vm6 + vr6 * vr6);
    var ang6 = Math.atan2(vm6, vr6) * 180 / Math.PI;
    M2_drawRainEnv(t, ang6, vm6, vr6);
    M2_drawStickFigure(width / 3, height - 90, true, ang6);
    M2_drawFormulaBox(10, 10, 360, ['v_man=5E, v_rain=12 Down', '\u03B8 = tan\u207B\u00B9(5/12) = ' + ang6.toFixed(1) + '\u00B0', '|v_rm| = \u221A169 = 13 (5-12-13!)'], '#000000', '#fbbf24');
  }
}

function M2_aircraftWind(cfg, stateData, t) {
  var idx = M2_stateIdx();
  var ptAx = width * 0.2, ptAy = height * 0.75, ptBx = width * 0.75, ptBy = height * 0.25;
  M2_drawAircraftMapEnv(ptAx, ptAy, ptBx, ptBy);
  var cx = width / 2;
  if (idx === 1) {
    var simT = (t * 0.2) % 4; var frac = constrain(simT / 3, 0, 1);
    var aimDx = ptBx - ptAx, aimDy = ptBy - ptAy; var windPush = frac * 40;
    var planeX = ptAx + aimDx * frac + windPush * 0.3, planeY = ptAy + aimDy * frac - windPush;
    M2_fill('#FF5050', 1.0); noStroke(); ellipse(planeX, planeY, 16, 10);
    for (var wi = 0; wi < 3; wi++) { var wax = 80 + wi * 200; M2_newArrow(wax, height * 0.5, wax, height * 0.5 - 25, '#64B4FF', ''); }
    if (frac >= 0.95) { M2_fill('#ef4444', 0.9); noStroke(); textSize(14); textAlign(CENTER, CENTER); text('MISSED B!', ptBx + 50, ptBy - 20); }
    M2_fill('#000000', 0.5); noStroke(); rect(10, 10, width - 20, 30, 4);
    fill(255); textSize(12); textAlign(LEFT, CENTER); text('Pilot aims at B \u2014 wind pushes off course!', 18, 25);
  } else if (idx === 2) {
    var vdx = 50, vdy = height * 0.5, sc2 = 0.4; var vaw = 400, vw = 200;
    M2_fill('#000000', 0.5); noStroke(); rect(10, height - 130, 300, 110, 6);
    M2_newArrow(vdx, vdy, vdx, vdy - vaw * sc2, '#FF5050', 'v_aw');
    M2_newArrow(vdx, vdy - vaw * sc2, vdx + vw * sc2, vdy - vaw * sc2, '#64B4FF', 'v_w');
    M2_newArrow(vdx, vdy, vdx + vw * sc2, vdy - vaw * sc2, '#34d399', 'v_a');
    M2_drawFormulaBox(10, height - 125, 290, ['v_a = v_aw + v_w', 'Solve for heading angle'], '#000000', '#fbbf24');
  } else if (idx === 3) {
    var vaw3 = 400, vw3 = 200, beta3 = 45;
    var sinAlpha = vw3 * Math.sin(beta3 * Math.PI / 180) / vaw3;
    var alpha3 = Math.asin(Math.min(sinAlpha, 1)) * 180 / Math.PI;
    M2_drawFormulaBox(10, 10, 420, ['sin\u03B1/|v_w| = sin\u03B2/|v_aw|', 'sin\u03B1 = ' + sinAlpha.toFixed(3), '\u03B1 = ' + alpha3.toFixed(1) + '\u00B0 into wind'], '#000000', '#FFFFFF');
    var simT3 = (t * 0.15) % 4; var frac3 = constrain(simT3 / 3, 0, 1);
    M2_fill('#34d399', 1.0); noStroke();
    ellipse(ptAx + (ptBx - ptAx) * frac3, ptAy + (ptBy - ptAy) * frac3, 16, 10);
    if (frac3 >= 0.95) { M2_fill('#34d399', 0.9); textSize(14); textAlign(CENTER, CENTER); text('\u2714 Reached B!', ptBx + 40, ptBy + 20); }
  } else if (idx === 4) {
    var vaw4 = 400, alpha4 = 30, beta4 = 45, gamma4 = 180 - alpha4 - beta4;
    var va4 = vaw4 * Math.sin(gamma4 * Math.PI / 180) / Math.sin(beta4 * Math.PI / 180);
    var dist4 = 1000, time4 = dist4 / va4;
    M2_drawFormulaBox(10, 10, 420, ['|v_a| = |v_aw|\u00D7sin' + gamma4 + '\u00B0/sin' + beta4 + '\u00B0', '|v_a| \u2248 ' + va4.toFixed(1) + ' km/h', 'Time = ' + dist4 + '/' + va4.toFixed(1) + ' \u2248 ' + time4.toFixed(2) + 'h', 'Wrong: ' + dist4 + '/' + vaw4 + ' = ' + (dist4 / vaw4).toFixed(2) + 'h (misses B!)'], '#000000', '#FFFFFF');
  } else if (idx === 5) {
    var cases5 = [{ label: 'Headwind', effect: 'v_a=v_aw\u2212v_w, LONGER', col: '#ef4444', y: 60 }, { label: 'Tailwind', effect: 'v_a=v_aw+v_w, SHORTER', col: '#34d399', y: 150 }, { label: 'Crosswind', effect: 'Must crab, v_a<v_aw', col: '#fbbf24', y: 240 }];
    for (var ci5 = 0; ci5 < 3; ci5++) {
      var c5 = cases5[ci5]; M2_fill('#000000', 0.4); noStroke(); rect(20, c5.y, width - 40, 70, 6);
      fill(M2_rgb(c5.col)[0], M2_rgb(c5.col)[1], M2_rgb(c5.col)[2]); textSize(14); textAlign(LEFT, TOP); text(c5.label, 35, c5.y + 8);
      fill(200); textSize(12); text(c5.effect, 35, c5.y + 30);
    }
  } else {
    M2_drawFormulaBox(10, 10, 440, ['DC Pandey 6.33:', 'v_aw=400, v_w=200N, AB=1000km', 'sin\u03B1 = 200\u00D7sin45\u00B0/400 = 0.354', '\u03B1 = 20.7\u00B0, steer N69.3\u00B0E', '|v_a| \u2248 515 km/h', 't \u2248 1.94 hours'], '#000000', '#FFFFFF');
    var simT6 = (t * 0.15) % 4; var frac6 = constrain(simT6 / 3, 0, 1);
    M2_fill('#34d399', 1.0); noStroke();
    ellipse(ptAx + (ptBx - ptAx) * frac6, ptAy + (ptBy - ptAy) * frac6, 14, 10);
  }
}
