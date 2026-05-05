// ============================================================================
// Premium Primitives — sessions 56+ (Phase 0 validation demo)
// ============================================================================
//
// Five reusable primitives shipped as a JS string template, injected into the
// iframe BEFORE PARAMETRIC_RENDERER_CODE so its draw() loop can dispatch to
// these by primitive.type.
//
//   1. glow_focus    — radial halo around a target primitive
//   2. animated_path — line/vector that draws itself tip-first
//   3. sound_cue     — Web Audio synthesized whoosh / click / ding
//   4. particle_field — flowing dot system for field-line visualization
//   5. smooth_camera  — soft canvas-transform wrapper (pre-pass in draw())
//
// Built once, used across the 3 validation-demo simulations:
//   Sim 1 (vector head-to-tail rain-umbrella): glow_focus + animated_path + sound_cue
//   Sim 2 (Newton's 2nd law + board mode):     glow_focus + animated_path + sound_cue + smooth_camera
//   Sim 3 (electrostatic field):                glow_focus + particle_field + sound_cue + smooth_camera
//
// Conventions matched to PARAMETRIC_RENDERER_CODE:
//   - var (not let/const) — older browser-safe baseline
//   - draw* function signature: (spec) => void
//   - reads PM_animationGate / PM_focalPulseScale / PM_resolveAnchor / PM_hexToRgb
//     from PARAMETRIC_RENDERER_CODE (those globals exist by the time these run)
//   - reads PM_bodyRegistry / PM_surfaceRegistry / PM_currentState / PM_stateEnterTime
//   - p5 globals: push/pop/translate/scale/stroke/fill/line/ellipse/etc.
//
// Audio / camera state lives in module-scope vars inside the template (PM_audio*,
// PM_camState, PM_particleSystems, PM_soundCueFired). State persists across
// frames; resets on state switch via the existing window message handler in
// PARAMETRIC_RENDERER_CODE.
// ============================================================================

export const PREMIUM_PRIMITIVES_CODE = `
// ═══════════════════════════════════════════════════════════════════
// Section P0 — Module-scope state
// ═══════════════════════════════════════════════════════════════════

var PM_audioCtx = null;
var PM_audioUnlocked = false;
var PM_soundCueFired = {};       // keyed by spec.id || index — fires once per state-enter
var PM_particleSystems = {};     // keyed by spec.id — { particles: [], lastSpawnMs }
var PM_camState = { active: false, zoom: 1, panX: 0, panY: 0,
                    targetZoom: 1, targetPanX: 0, targetPanY: 0,
                    lerpStartMs: 0, lerpDurMs: 0 };
// Set by PARAMETRIC_RENDERER_CODE's draw() each frame so premium primitives can
// look up sibling primitives by id (e.g., glow_focus on an animated_path).
var PM_currentScene = null;

// Reset premium state when PM_currentState changes. The existing message
// handler in PARAMETRIC_RENDERER_CODE clears PM_bodyRegistry on a true state
// change; we hook the same lifecycle by detecting the registry reset.
var PM_lastSeenStateForPremium = null;
function PM_resetPremiumStateIfNeeded() {
  if (PM_lastSeenStateForPremium !== PM_currentState) {
    PM_soundCueFired = {};
    PM_particleSystems = {};
    PM_camState = { active: false, zoom: 1, panX: 0, panY: 0,
                    targetZoom: 1, targetPanX: 0, targetPanY: 0,
                    lerpStartMs: 0, lerpDurMs: 0 };
    PM_lastSeenStateForPremium = PM_currentState;
  }
}

// Resolve a primitive_id into a {x, y} screen point. Tries body / surface
// registries first (they have already been drawn, so positions are known),
// then falls back to scanning the current scene for animated_path / annotation /
// vector / force_arrow primitives that match by id. Final fallback = scene center.
function PM_resolvePrimitiveCenter(primitiveId) {
  if (!primitiveId) return { x: 380, y: 250 };
  // Body lookup — bodyRegistry stores { x, y, w, h } in screen coords
  if (PM_bodyRegistry[primitiveId]) {
    var b = PM_bodyRegistry[primitiveId];
    return { x: b.x + (b.w || 0) / 2, y: b.y + (b.h || 0) / 2 };
  }
  // Surface lookup — surfaceRegistry stores { x0, y0, length, angle_deg, orientation }
  if (PM_surfaceRegistry[primitiveId]) {
    var s = PM_surfaceRegistry[primitiveId];
    if (s.orientation === 'horizontal') return { x: s.x0 + s.length / 2, y: s.y0 };
    if (s.orientation === 'vertical')   return { x: s.x0, y: s.y0 - s.length / 2 };
    var rad = s.angle_deg * Math.PI / 180;
    return { x: s.x0 + (s.length / 2) * Math.cos(rad), y: s.y0 - (s.length / 2) * Math.sin(rad) };
  }
  // Scene-scan fallback — find any primitive with matching id and infer center
  // from its position fields. Walks PM_currentScene if the renderer set it.
  var scene = (typeof PM_currentScene !== 'undefined' && PM_currentScene) ? PM_currentScene : null;
  if (scene && scene.length) {
    for (var i = 0; i < scene.length; i++) {
      var p = scene[i];
      if (!p || p.id !== primitiveId) continue;
      // animated_path / vector — midpoint of from → to
      if (p.type === 'animated_path' || p.type === 'vector') {
        var fromPt = PM_resolveEndpoint(p.from);
        var toPt = PM_resolveEndpoint(p.to);
        return { x: (fromPt.x + toPt.x) / 2, y: (fromPt.y + toPt.y) / 2 };
      }
      // annotation / label / formula_box — explicit position field
      if (p.position && typeof p.position.x === 'number' && typeof p.position.y === 'number') {
        return { x: p.position.x, y: p.position.y };
      }
      // force_arrow — uses 'from' anchor
      if (p.from && typeof p.from.x === 'number' && typeof p.from.y === 'number') {
        return { x: p.from.x, y: p.from.y };
      }
    }
  }
  return { x: 380, y: 250 };
}

// Resolve from/to spec for animated_path — accepts {x, y} OR {primitive_id} OR string.
function PM_resolveEndpoint(endpoint) {
  if (!endpoint) return { x: 380, y: 250 };
  if (typeof endpoint === 'string') return PM_resolvePrimitiveCenter(endpoint);
  if (typeof endpoint.x === 'number' && typeof endpoint.y === 'number') {
    return { x: endpoint.x, y: endpoint.y };
  }
  if (endpoint.primitive_id) return PM_resolvePrimitiveCenter(endpoint.primitive_id);
  return { x: 380, y: 250 };
}

// Eased interpolation t in [0,1].
function PM_ease(t, mode) {
  if (t < 0) return 0; if (t > 1) return 1;
  if (mode === 'linear')      return t;
  if (mode === 'ease_in')     return t * t;
  if (mode === 'ease_out')    return 1 - (1 - t) * (1 - t);
  if (mode === 'ease_in_out') return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // default ease_in_out
}

// ═══════════════════════════════════════════════════════════════════
// Section P1 — glow_focus
// Radial gradient halo around a target primitive's resolved center.
// spec: { type, primitive_id, halo_radius_px?, color?, intensity?,
//         appear_at_ms?, animate_in_ms? }
// ═══════════════════════════════════════════════════════════════════

function drawGlowFocus(spec) {
  PM_resetPremiumStateIfNeeded();
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var center = PM_resolvePrimitiveCenter(spec.primitive_id);
  var radius = (typeof spec.halo_radius_px === 'number') ? spec.halo_radius_px : 80;
  var color = spec.color || '#FCD34D';      // amber-300 default
  var intensity = (typeof spec.intensity === 'number') ? spec.intensity : 0.55;
  var rgb = PM_hexToRgb(color);
  var pulse = PM_focalPulseScale(spec);
  var effectiveR = radius * pulse;
  var ctx = drawingContext;
  push();
  // Radial gradient via canvas 2D context (drawingContext) — p5 doesn't expose
  // gradients directly. Center fully colored, edges transparent.
  var grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, effectiveR);
  grad.addColorStop(0,   'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (intensity * gate.alpha).toFixed(3) + ')');
  grad.addColorStop(0.6, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (intensity * 0.35 * gate.alpha).toFixed(3) + ')');
  grad.addColorStop(1,   'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(center.x, center.y, effectiveR, 0, Math.PI * 2);
  ctx.fill();
  pop();
}

// ═══════════════════════════════════════════════════════════════════
// Section P2 — animated_path
// Line/vector that draws itself tip-first using PM_animationGate alpha as
// progress. spec: { type, from, to, easing?, duration_ms?, head_first?,
//                   color?, line_weight?, arrow_head?, label?,
//                   appear_at_ms?, animate_in_ms? }
// duration_ms overrides spec.animate_in_ms if both provided.
// ═══════════════════════════════════════════════════════════════════

function drawAnimatedPath(spec) {
  PM_resetPremiumStateIfNeeded();
  // Honor duration_ms by patching the spec's animate_in_ms before the gate.
  var clonedSpec = spec;
  if (typeof spec.duration_ms === 'number' && typeof spec.animate_in_ms !== 'number') {
    clonedSpec = Object.assign({}, spec, { animate_in_ms: spec.duration_ms });
  }
  var gate = PM_animationGate(clonedSpec);
  if (!gate.visible) return;
  var from = PM_resolveEndpoint(spec.from);
  var to   = PM_resolveEndpoint(spec.to);
  var easing = spec.easing || 'ease_in_out';
  var t = PM_ease(gate.alpha, easing);
  var headFirst = (spec.head_first !== false);  // default true
  var color = spec.color || '#60A5FA';          // blue-400 default
  var weight = (typeof spec.line_weight === 'number') ? spec.line_weight : 2.5;
  var rgb = PM_hexToRgb(color);
  var alpha = 255;
  var x1, y1, x2, y2;
  if (headFirst) {
    x1 = from.x; y1 = from.y;
    x2 = from.x + (to.x - from.x) * t;
    y2 = from.y + (to.y - from.y) * t;
  } else {
    var inv = 1 - t;
    x1 = from.x + (to.x - from.x) * inv;
    y1 = from.y + (to.y - from.y) * inv;
    x2 = to.x;   y2 = to.y;
  }
  push();
  stroke(rgb[0], rgb[1], rgb[2], alpha); strokeWeight(weight);
  noFill();
  line(x1, y1, x2, y2);
  // Optional arrow head — drawn only once t reaches 1 to avoid mid-path arrows.
  if (spec.arrow_head !== false && t > 0.98) {
    var dx = to.x - from.x, dy = to.y - from.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0.001) {
      var ang = Math.atan2(dy, dx);
      var hl = 12;
      fill(rgb[0], rgb[1], rgb[2], alpha); noStroke();
      var hx1 = to.x - hl * Math.cos(ang - Math.PI / 6);
      var hy1 = to.y - hl * Math.sin(ang - Math.PI / 6);
      var hx2 = to.x - hl * Math.cos(ang + Math.PI / 6);
      var hy2 = to.y - hl * Math.sin(ang + Math.PI / 6);
      triangle(to.x, to.y, hx1, hy1, hx2, hy2);
    }
  }
  // Optional label near the to-endpoint, fading in with t.
  if (typeof spec.label === 'string' && spec.label.length > 0 && t > 0.5) {
    var labelAlpha = Math.min(1, (t - 0.5) * 2);
    fill(rgb[0], rgb[1], rgb[2], 255 * labelAlpha); noStroke();
    textSize(13); textAlign(LEFT, CENTER);
    text(spec.label, to.x + 8, to.y - 4);
  }
  pop();
}

// ═══════════════════════════════════════════════════════════════════
// Section P3 — sound_cue
// Web Audio API synthesized cues. NOT a visual primitive — fires audio side
// effect once per state-enter. Honors gesture-unlock pattern from session
// 53-54 (TeacherPlayer's TTS unlock): the iframe receives a USER_GESTURE
// message from the parent on first interaction, which sets PM_audioUnlocked.
// Until unlocked, sound_cue is a silent no-op (browser policy; not an error).
// spec: { type, sound: 'whoosh'|'click'|'ding', event?, id?,
//         appear_at_ms?, volume? }
// ═══════════════════════════════════════════════════════════════════

function PM_ensureAudioCtx() {
  if (PM_audioCtx) return PM_audioCtx;
  try {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    PM_audioCtx = new Ctx();
    return PM_audioCtx;
  } catch (e) { return null; }
}

function PM_playWhoosh(volume) {
  var ctx = PM_ensureAudioCtx();
  if (!ctx) return;
  var bufSize = ctx.sampleRate * 0.4;
  var buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) {
    var t = i / bufSize;
    // Filtered noise with envelope: rises 0→1 in first 30%, decays for rest.
    var env = t < 0.3 ? (t / 0.3) : (1 - (t - 0.3) / 0.7);
    data[i] = (Math.random() * 2 - 1) * env * 0.5;
  }
  var src = ctx.createBufferSource();
  src.buffer = buf;
  var filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.4);
  var gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  src.start();
}

function PM_playClick(volume) {
  var ctx = PM_ensureAudioCtx();
  if (!ctx) return;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.1);
}

function PM_playDing(volume) {
  var ctx = PM_ensureAudioCtx();
  if (!ctx) return;
  var freqs = [659.25, 783.99, 987.77];  // E5 G5 B5 — bright triad
  for (var i = 0; i < freqs.length; i++) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freqs[i];
    var startT = ctx.currentTime + i * 0.04;
    gain.gain.setValueAtTime(volume * 0.4, startT);
    gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.6);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(startT); osc.stop(startT + 0.7);
  }
}

function drawSoundCue(spec) {
  PM_resetPremiumStateIfNeeded();
  var key = spec.id || ('cue_' + (spec.sound || 'x') + '_' + (spec.appear_at_ms || 0));
  if (PM_soundCueFired[key]) return;
  // Wait for appear_at_ms before firing.
  var elapsed = millis() - PM_stateEnterTime;
  var trigger = (typeof spec.appear_at_ms === 'number') ? spec.appear_at_ms : 0;
  if (elapsed < trigger) return;
  PM_soundCueFired[key] = true;
  if (!PM_audioUnlocked) return;  // gesture-unlock not yet received
  var volume = (typeof spec.volume === 'number') ? spec.volume : 0.3;
  var sound = spec.sound || 'click';
  if (sound === 'whoosh') PM_playWhoosh(volume);
  else if (sound === 'ding') PM_playDing(volume);
  else PM_playClick(volume);
}

// ═══════════════════════════════════════════════════════════════════
// Section P4 — particle_field
// Persistent particle system for field-line / fluid visualization. Each
// particle has {x, y, vx, vy, age}. Spawns at source, drifts toward sink (or
// radially outward if no sink), respawns on exit.
// spec: { type, id, source, sink?, count?, drift_speed?, color?, particle_size?,
//         appear_at_ms?, animate_in_ms? }
// ═══════════════════════════════════════════════════════════════════

function PM_initParticleSystem(spec) {
  var src = PM_resolveEndpoint(spec.source);
  var count = (typeof spec.count === 'number') ? spec.count : 60;
  var particles = [];
  for (var i = 0; i < count; i++) {
    var ang = (Math.PI * 2) * (i / count);
    particles.push({
      x: src.x + Math.cos(ang) * 4,
      y: src.y + Math.sin(ang) * 4,
      ang: ang,
      age: Math.random() * 1.0,  // staggered birth times for visual richness
      lifetime: 1.0
    });
  }
  PM_particleSystems[spec.id || 'default'] = {
    particles: particles,
    lastFrameMs: millis()
  };
}

function drawParticleField(spec) {
  PM_resetPremiumStateIfNeeded();
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var key = spec.id || 'default';
  if (!PM_particleSystems[key]) PM_initParticleSystem(spec);
  var sys = PM_particleSystems[key];
  var now = millis();
  var dtMs = now - sys.lastFrameMs;
  sys.lastFrameMs = now;
  var dt = Math.min(dtMs / 1000, 0.05);  // clamp for tab-switch jumps
  var src = PM_resolveEndpoint(spec.source);
  var sink = spec.sink ? PM_resolveEndpoint(spec.sink) : null;
  var driftSpeed = (typeof spec.drift_speed === 'number') ? spec.drift_speed : 60;
  var color = spec.color || '#60A5FA';
  var rgb = PM_hexToRgb(color);
  var psize = (typeof spec.particle_size === 'number') ? spec.particle_size : 3;
  push();
  noStroke();
  for (var i = 0; i < sys.particles.length; i++) {
    var p = sys.particles[i];
    p.age += dt;
    var lifeT = (p.age % p.lifetime) / p.lifetime;  // 0..1 cyclic
    var dx, dy;
    if (sink) {
      // Drift from source toward sink along a fan-out path
      var spread = 30;
      var perpX = -Math.sin(p.ang) * spread;
      var perpY = Math.cos(p.ang) * spread;
      var sx = src.x + perpX * (1 - lifeT);
      var sy = src.y + perpY * (1 - lifeT);
      dx = sx + (sink.x - sx) * lifeT - p.x;
      dy = sy + (sink.y - sy) * lifeT - p.y;
    } else {
      // Radial outward — particles drift along their angle
      var dist = lifeT * driftSpeed * 1.6;
      dx = src.x + Math.cos(p.ang) * dist - p.x;
      dy = src.y + Math.sin(p.ang) * dist - p.y;
    }
    var vmag = Math.sqrt(dx * dx + dy * dy);
    if (vmag > 0.01) {
      p.x += (dx / vmag) * driftSpeed * dt;
      p.y += (dy / vmag) * driftSpeed * dt;
    }
    var fadeAlpha = (lifeT < 0.1 ? lifeT / 0.1 : (lifeT > 0.9 ? (1 - lifeT) / 0.1 : 1));
    fill(rgb[0], rgb[1], rgb[2], 255 * fadeAlpha * gate.alpha);
    ellipse(p.x, p.y, psize, psize);
  }
  pop();
}

// ═══════════════════════════════════════════════════════════════════
// Section P5 — smooth_camera
// Soft canvas-transform wrapper. Pre-pass detects this primitive at the top
// of draw() and applies push() / translate / scale; matching pop() runs at
// the end of draw(). At most ONE smooth_camera per scene; extras ignored.
// spec: { type, zoom?, pan_to?, target_primitive?, duration_ms? }
// drawSmoothCamera itself is a no-op as a per-primitive call — the actual
// transform is applied by PM_applySmoothCameraIfActive() called from draw().
// ═══════════════════════════════════════════════════════════════════

function drawSmoothCamera(_spec) {
  // No-op as a primitive draw — transform is applied via the pre-pass below.
}

function PM_collectSmoothCamera(scene) {
  for (var i = 0; i < scene.length; i++) {
    var p = scene[i];
    if (p && p.type === 'smooth_camera') return p;
  }
  return null;
}

function PM_beginSmoothCameraIfActive(scene) {
  var cam = PM_collectSmoothCamera(scene);
  if (!cam) { PM_camState.active = false; return; }
  PM_resetPremiumStateIfNeeded();
  // Latch target on first sight per state.
  var targetZoom = (typeof cam.zoom === 'number') ? cam.zoom : 1;
  var targetX = 380, targetY = 250;
  if (cam.target_primitive) {
    var tc = PM_resolvePrimitiveCenter(cam.target_primitive);
    targetX = tc.x; targetY = tc.y;
  } else if (cam.pan_to && typeof cam.pan_to.x === 'number') {
    targetX = cam.pan_to.x; targetY = cam.pan_to.y;
  }
  // Pan such that targetX, targetY ends up centered when zoomed.
  var canvasCx = 380, canvasCy = 250;
  var desiredPanX = canvasCx - targetX * targetZoom;
  var desiredPanY = canvasCy - targetY * targetZoom;
  if (!PM_camState.active) {
    PM_camState.zoom = 1; PM_camState.panX = 0; PM_camState.panY = 0;
    PM_camState.targetZoom = targetZoom;
    PM_camState.targetPanX = desiredPanX;
    PM_camState.targetPanY = desiredPanY;
    PM_camState.lerpStartMs = millis();
    PM_camState.lerpDurMs = (typeof cam.duration_ms === 'number') ? cam.duration_ms : 800;
    PM_camState.active = true;
  } else {
    // Allow target updates mid-play without restart.
    PM_camState.targetZoom = targetZoom;
    PM_camState.targetPanX = desiredPanX;
    PM_camState.targetPanY = desiredPanY;
  }
  var elapsed = millis() - PM_camState.lerpStartMs;
  var t = PM_camState.lerpDurMs > 0 ? Math.min(elapsed / PM_camState.lerpDurMs, 1) : 1;
  var eased = PM_ease(t, 'ease_in_out');
  var z = 1 + (PM_camState.targetZoom - 1) * eased;
  var px = PM_camState.panX + (PM_camState.targetPanX - PM_camState.panX) * eased;
  var py = PM_camState.panY + (PM_camState.targetPanY - PM_camState.panY) * eased;
  push();
  translate(px, py);
  scale(z);
}

function PM_endSmoothCameraIfActive() {
  if (PM_camState.active) pop();
}

// ═══════════════════════════════════════════════════════════════════
// Section P6 — umbrella_scene (concept-specific primitive for vector_head_to_tail)
// Draws: stickman + tilted umbrella + rain droplets + wet/dry outcome marker.
// spec: { type, position: {x, y_foot}, tilt_deg, outcome: 'dry'|'front_wet'|'back_wet',
//         scale?, label?, label_color? }
// tilt_deg: 0 = straight up, negative = back, positive = forward (toward +x)
// outcome: drives color of person + presence of red splashes / green tick
// Animates rain droplets continuously (no appear_at_ms gating — runs always).
// ═══════════════════════════════════════════════════════════════════

function drawUmbrellaScene(spec) {
  PM_resetPremiumStateIfNeeded();
  var pos = spec.position || { x: 380, y: 360 };
  var tilt = (typeof spec.tilt_deg === 'number') ? spec.tilt_deg : 0;
  var outcome = spec.outcome || 'dry';
  var scale = (typeof spec.scale === 'number') ? spec.scale : 1.0;

  var headR = 10 * scale;
  var bodyH = 35 * scale;
  var legH = 22 * scale;
  var armSpan = 22 * scale;

  // Stickman anchor — feet at (pos.x, pos.y)
  var feetY = pos.y;
  var hipY = feetY - legH;
  var shoulderY = hipY - bodyH;
  var headCenterY = shoulderY - headR - 2;

  // Determine person color based on outcome
  var personColor = (outcome === 'dry') ? [16, 185, 129] : [148, 163, 184];  // green or slate
  var splashColor = [239, 68, 68];  // red for splash marks

  push();
  // ── Person ──
  stroke(personColor[0], personColor[1], personColor[2]);
  strokeWeight(2.4 * scale);
  noFill();
  // Head
  ellipse(pos.x, headCenterY, headR * 2, headR * 2);
  // Body
  line(pos.x, shoulderY, pos.x, hipY);
  // Arms (slight downward angle)
  line(pos.x, shoulderY + 4, pos.x - armSpan, shoulderY + 14);
  line(pos.x, shoulderY + 4, pos.x + armSpan, shoulderY + 14);
  // Legs
  line(pos.x, hipY, pos.x - 12 * scale, feetY);
  line(pos.x, hipY, pos.x + 12 * scale, feetY);

  // ── Umbrella ──
  // Grip = right hand approximate location
  var gripX = pos.x + armSpan * 0.7;
  var gripY = shoulderY + 14;

  // Shaft direction: at 90° from horizontal + tilt (so tilt=0 means vertical)
  var tiltRad = tilt * Math.PI / 180;
  var shaftLen = 70 * scale;
  // Shaft goes from grip UPWARD at angle tilt (0=vertical, +=forward)
  var canopyCenterX = gripX + Math.sin(tiltRad) * shaftLen;
  var canopyCenterY = gripY - Math.cos(tiltRad) * shaftLen;

  // Shaft line (dark gray)
  stroke(75, 85, 110);
  strokeWeight(2.5 * scale);
  line(gripX, gripY, canopyCenterX, canopyCenterY);

  // Canopy: arc/half-ellipse perpendicular to the shaft
  // Use rotation transform to draw a half-circle then flip
  push();
  translate(canopyCenterX, canopyCenterY);
  rotate(tiltRad);
  // Canopy color — dark blue for the umbrella
  noStroke();
  fill(56, 90, 168, 240);
  // Half-ellipse opening downward (in pre-rotation frame)
  arc(0, 0, 90 * scale, 50 * scale, Math.PI, 0, OPEN);
  // Outline
  stroke(20, 35, 80);
  strokeWeight(1.5 * scale);
  noFill();
  arc(0, 0, 90 * scale, 50 * scale, Math.PI, 0, OPEN);
  // Tiny tip
  fill(20, 35, 80);
  noStroke();
  ellipse(0, 0, 4 * scale, 4 * scale);
  pop();

  // ── Rain droplets (continuous animation) ──
  // Use a hash from position + time so each scene has its own animated pattern.
  // 8 droplets falling across a 140px-wide column above the scene.
  var rainColor = [125, 170, 230];
  stroke(rainColor[0], rainColor[1], rainColor[2], 200);
  strokeWeight(1.5 * scale);
  noFill();
  var t = (millis() / 1000);
  var rainSpan = 130 * scale;
  var rainTopY = headCenterY - 100 * scale;
  var rainBottomY = headCenterY - headR - 4;
  var rainHeight = rainBottomY - rainTopY;
  var seed = (pos.x * 13 + pos.y * 7) % 1000;
  for (var i = 0; i < 9; i++) {
    var dropPhase = (t * 1.6 + (i * 0.31) + seed * 0.0017) % 1;
    var dropY = rainTopY + dropPhase * rainHeight;
    var dropX = (pos.x - rainSpan / 2) + ((i * 17 + seed) % 100) / 100 * rainSpan;
    // Skip droplets that would be inside the umbrella canopy (rough check)
    var dxFromCanopy = dropX - canopyCenterX;
    var dyFromCanopy = dropY - canopyCenterY;
    var insideCanopy = Math.abs(dxFromCanopy) < 45 * scale && dyFromCanopy > -8 && dyFromCanopy < 30;
    if (insideCanopy) continue;
    line(dropX, dropY, dropX + 1.5, dropY + 7 * scale);
  }

  // ── Outcome marker (splash on wet side, tick on dry) ──
  if (outcome === 'front_wet') {
    // Red splash marks on the front (right side, in walking direction)
    stroke(splashColor[0], splashColor[1], splashColor[2], 220);
    strokeWeight(2 * scale);
    var fx = pos.x + 6 * scale, fy = shoulderY + 18;
    line(fx - 4, fy - 4, fx + 4, fy + 4);
    line(fx + 4, fy - 4, fx - 4, fy + 4);
    line(fx + 8, fy - 8, fx + 14, fy - 2);
    line(fx + 14, fy - 8, fx + 8, fy - 2);
  } else if (outcome === 'back_wet') {
    // Red splash marks on the back (left side)
    stroke(splashColor[0], splashColor[1], splashColor[2], 220);
    strokeWeight(2 * scale);
    var bx = pos.x - 6 * scale, by = shoulderY + 18;
    line(bx - 4, by - 4, bx + 4, by + 4);
    line(bx + 4, by - 4, bx - 4, by + 4);
    line(bx - 14, by - 8, bx - 8, by - 2);
    line(bx - 8, by - 8, bx - 14, by - 2);
  } else if (outcome === 'dry') {
    // Green check mark beside head
    stroke(16, 185, 129, 230);
    strokeWeight(2.5 * scale);
    noFill();
    var ckX = pos.x + headR + 8 * scale;
    var ckY = headCenterY;
    line(ckX, ckY, ckX + 4, ckY + 4);
    line(ckX + 4, ckY + 4, ckX + 12, ckY - 6);
  }

  // ── Optional caption below scene ──
  if (typeof spec.label === 'string' && spec.label.length > 0) {
    var labelColor = spec.label_color || (outcome === 'dry' ? '#10B981' : '#EF4444');
    var rgb = PM_hexToRgb(labelColor);
    fill(rgb[0], rgb[1], rgb[2], 240);
    noStroke();
    textSize(12 * scale);
    textAlign(CENTER, TOP);
    text(spec.label, pos.x, feetY + 8);
  }

  pop();
}
`;
