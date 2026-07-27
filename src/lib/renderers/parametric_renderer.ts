// ============================================================================
// Parametric Renderer (PCPL — Ch.8 only)
// String template following the same pattern as MECHANICS_2D_RENDERER_CODE.
// Independent of mechanics_2d_renderer.ts. Do not import from it.
//
// MESSAGE CONTRACT (WP-R1, Rule 36 fixed-step sim clock — 2026-07-23):
//   IN:  SET_STATE {state}          → applies the state; releases any freeze pin
//        SET_TIME_FREEZE {at_ms}    → deterministic re-sim from state entry, hold
//        SET_TIME_FREEZE {frozen:false} → release the pin, clock resumes
//        SET_CUE_TIME {cue, at_ms} → re-time a sound_cue to the narrated beat
//        PAUSE / RESUME            → clock + Engine 20 motion freeze/resume (26b)
//        MUTE {muted}              → gates sound_cue playback only (26a)
//        PARAM_UPDATE {key, value} → live slider/physics recompute
//   OUT: SIM_READY (on load), STATE_REACHED (on state apply)
//   window.PM_simTimeMs             → state-local sim clock, read by the player
//                                      and THE EYE's dense/frozen capture paths
//   window.__PM_supportsTimePin     → true (declares SET_TIME_FREEZE support)
// ============================================================================

import { computePhysics } from '@/lib/physicsEngine';
import { solveSubSimLayout } from '@/lib/subSimSolverHost';
import { PREMIUM_PRIMITIVES_CODE } from '@/lib/renderers/premium_primitives';

export interface ParametricConfig {
    concept_id: string;
    scene_composition: unknown[];
    states?: Record<string, {
        scene_composition?: unknown[];
        focal_primitive_id?: string;
        focal_sequence?: Array<{ highlight_primitive_id: string; duration_ms: number }>;
    }>;
    default_variables: Record<string, number>;
    current_state?: string;
    precomputed_physics?: unknown;
    // Board-mode styling. When 'answer_sheet', the canvas background switches
    // to off-white with faint horizontal rules and a red left margin, and
    // derivation_step / mark_badge primitives render as handwriting + badges.
    // Populated by applyBoardMode() in aiSimulationGenerator.ts when
    // examMode === 'board'.
    canvas_style?: 'default' | 'answer_sheet';
}

// Rotate a math-frame force vector (fx, fy) into axes aligned at axisDeg.
// parallel     = component along +axis1  (axis1 = +x rotated by axisDeg CCW, "up-slope" for a surface)
// perpendicular = component along +axis2 (axis2 = axis1 rotated +90°,      "outward from surface")
// For axisDeg = 0 this degenerates to world x/y: parallel = fx, perpendicular = fy.
// The same formula is inlined inside PARAMETRIC_RENDERER_CODE below (iframe runtime).
// Keep the two in sync.
export function decomposeForceVector(
    fx: number,
    fy: number,
    axisDeg: number,
): { parallel: number; perpendicular: number } {
    const theta = (axisDeg * Math.PI) / 180;
    return {
        parallel: fx * Math.cos(theta) + fy * Math.sin(theta),
        perpendicular: -fx * Math.sin(theta) + fy * Math.cos(theta),
    };
}

export const PARAMETRIC_RENDERER_CODE = `
// ─── Section 1: Physics Engine (field_forces only — expand later) ───────────
var PM_G = 9.8;

function computePhysics_field_forces(vars) {
  var m = (vars && vars.m != null) ? vars.m : 1;
  var w = m * PM_G;
  return {
    concept_id: 'field_forces',
    variables: { m: m },
    derived: { w: w, g: PM_G },
    forces: [{
      id: 'weight',
      label: 'mg = ' + w.toFixed(1) + ' N',
      vector: { x: 0, y: -w, magnitude: w, angle_deg: -90 },
      color: '#EF4444',
      draw_from: 'body_center',
      show: true
    }]
  };
}

function computePhysics_contact_forces(vars) {
  var N = (vars && vars.N != null) ? vars.N : 20;
  var f = (vars && vars.f != null) ? vars.f : 15;
  var F = Math.sqrt(N * N + f * f);
  var theta = Math.atan2(f, N) * 180 / Math.PI;
  var nForce = { id: 'N_arrow', label: 'N = ' + N.toFixed(1) + ' N',
    vector: { x: 0, y: N, magnitude: N, angle_deg: 90 },
    color: '#10B981', draw_from: 'body_center', show: true };
  var fForce = { id: 'f_arrow', label: 'f = ' + f.toFixed(1) + ' N',
    vector: { x: -f, y: 0, magnitude: f, angle_deg: 180 },
    color: '#F59E0B', draw_from: 'body_center', show: true };
  var fRes = { id: 'F_arrow', label: 'F = ' + F.toFixed(1) + ' N',
    vector: { x: -f, y: N, magnitude: F, angle_deg: 90 + theta },
    color: '#EF4444', draw_from: 'body_center', show: true };
  return {
    concept_id: 'contact_forces',
    variables: { N: N, f: f },
    derived: { F: F, theta: theta },
    forces: [
      nForce,
      { id: 'N_component', label: nForce.label, vector: nForce.vector, color: nForce.color, draw_from: 'body_center', show: true },
      { id: 'normal_arrow', label: nForce.label, vector: nForce.vector, color: nForce.color, draw_from: 'body_center', show: true },
      fForce,
      { id: 'f_component', label: fForce.label, vector: fForce.vector, color: fForce.color, draw_from: 'body_center', show: true },
      { id: 'friction_arrow', label: fForce.label, vector: fForce.vector, color: fForce.color, draw_from: 'body_center', show: true },
      fRes,
      { id: 'F_resultant', label: fRes.label, vector: fRes.vector, color: fRes.color, draw_from: 'body_center', show: true }
    ]
  };
}

function computePhysics_normal_reaction(vars) {
  var m = (vars && vars.m != null) ? vars.m : 2;
  var theta = (vars && vars.theta != null) ? vars.theta : 30;
  // WP-F2: declared (elevator "frame_acceleration", default 0) but never
  // echoed -- currently dead in every authored state (the epic_c elevator
  // branch is fully hardcoded, no {a}/_expr reads it yet), so this is a
  // preventive fix, not an active-bug fix like psi_pointer above. Read-only
  // echo; does NOT add the elevator N=m(g+a) computation (out of this
  // task's scope -- that would be new physics, not an echo completion).
  var a = (vars && vars.a != null) ? vars.a : 0;
  var rad = theta * Math.PI / 180;
  var W = m * PM_G;
  var N = m * PM_G * Math.cos(rad);
  // Perpendicular-to-incline direction (outward); for theta=0 collapses to straight up.
  var nVec = { x: -N * Math.sin(rad), y: N * Math.cos(rad), magnitude: N, angle_deg: 90 - theta };
  var wVec = { x: 0, y: -W, magnitude: W, angle_deg: -90 };
  // Ladder scenario (STATE_4): two contact surfaces, two independent normals.
  // N1 is purely vertical (floor normal), N2 is purely horizontal (wall normal).
  // Magnitudes use mg as a stand-in for ladder statics (exact static-equilibrium solve is out of scope).
  var N1Vec = { x: 0, y: W, magnitude: W, angle_deg: 90 };
  var N2Vec = { x: -W, y: 0, magnitude: W, angle_deg: 180 };
  var nForce = { id: 'N_arrow', label: 'N = ' + N.toFixed(1) + ' N',
    vector: nVec, color: '#10B981', draw_from: 'body_center', show: true };
  var wForce = { id: 'weight', label: 'mg = ' + W.toFixed(1) + ' N',
    vector: wVec, color: '#EF4444', draw_from: 'body_center', show: true };
  return {
    concept_id: 'normal_reaction',
    variables: { m: m, theta: theta, a: a },
    // derived now also EXPORTS the concept's declared computed_outputs names
    // (N_value/mg_parallel/mg_perpendicular/apparent_weight) so a label/formula/
    // graph *_expr referencing them resolves instead of NaN-ing to 0 — the
    // STATE_5 computed_outputs name mismatch (PM_G=9.8 matches the JSON formulas).
    derived: {
      N: N, W: W, g: PM_G,
      N_value: N,
      mg_perpendicular: N,
      mg_parallel: m * PM_G * Math.sin(rad),
      apparent_weight: m * (PM_G + a)
    },
    forces: [
      nForce,
      { id: 'N1', label: 'N\\u2081 = ' + W.toFixed(1) + ' N',
        vector: N1Vec, color: '#10B981', draw_from: 'body_bottom', show: true },
      { id: 'N2', label: 'N\\u2082 = ' + W.toFixed(1) + ' N',
        vector: N2Vec, color: '#3B82F6', draw_from: 'body_top', show: true },
      { id: 'N_on_incline', label: nForce.label, vector: nVec, color: nForce.color, draw_from: 'body_center', show: true },
      wForce,
      { id: 'weight_on_incline', label: wForce.label, vector: wVec, color: wForce.color, draw_from: 'body_center', show: true }
    ]
  };
}

function computePhysics_tension_in_string(vars) {
  var m1 = (vars && vars.m1 != null) ? vars.m1 : 2;
  var m2 = (vars && vars.m2 != null) ? vars.m2 : 1;
  var T = (2 * m1 * m2 * PM_G) / (m1 + m2);
  var a = ((m1 - m2) * PM_G) / (m1 + m2);
  var w1 = m1 * PM_G;
  var w2 = m2 * PM_G;
  var tVec = { x: 0, y: T, magnitude: T, angle_deg: 90 };
  var wVec = { x: 0, y: -w1, magnitude: w1, angle_deg: -90 };
  return {
    concept_id: 'tension_in_string',
    variables: { m1: m1, m2: m2 },
    derived: { T: T, a: a, w1: w1, w2: w2, g: PM_G },
    forces: [
      { id: 'tension', label: 'T = ' + T.toFixed(1) + ' N',
        vector: tVec, color: '#3B82F6', draw_from: 'body_center', show: true },
      { id: 'weight', label: 'mg = ' + w1.toFixed(1) + ' N',
        vector: wVec, color: '#EF4444', draw_from: 'body_center', show: true },
      { id: 'a_m', label: 'a = ' + a.toFixed(2) + ' m/s\\u00b2',
        vector: { x: 0, y: a * 10, magnitude: Math.abs(a), angle_deg: a >= 0 ? 90 : -90 },
        color: '#A855F7', draw_from: 'body_center', show: true },
      { id: 'a_M', label: 'a = ' + a.toFixed(2) + ' m/s\\u00b2',
        vector: { x: 0, y: -a * 10, magnitude: Math.abs(a), angle_deg: a >= 0 ? -90 : 90 },
        color: '#A855F7', draw_from: 'body_center', show: true }
    ]
  };
}

function computePhysics_vector_resolution(vars) {
  var F = (vars && vars.F != null) ? vars.F : 10;
  var alpha = (vars && vars.alpha != null) ? vars.alpha : 50;
  var rad = alpha * Math.PI / 180;
  var Fx = F * Math.cos(rad);
  var Fy = F * Math.sin(rad);
  var m = 2; // demo block mass for STATE_4
  var mg = m * PM_G;
  return {
    concept_id: 'vector_resolution',
    variables: { F: F, alpha: alpha },
    derived: { F: F, alpha: alpha, Fx: Fx, Fy: Fy, Fcos: Fx, Fsin: Fy, mg: mg },
    forces: [
      { id: 'main_vector', label: 'F = ' + F.toFixed(1) + ' N',
        vector: { x: Fx, y: Fy, magnitude: F, angle_deg: alpha },
        color: '#3B82F6', draw_from: 'body_center', show: true },
      { id: 'weight', label: 'mg = ' + mg.toFixed(1) + ' N',
        vector: { x: 0, y: -mg, magnitude: mg, angle_deg: -90 },
        color: '#EF4444', draw_from: 'body_bottom', show: true }
    ]
  };
}

function computePhysics_hinge_force(vars) {
  var W = (vars && vars.W != null) ? vars.W : 40;
  var F_ext = (vars && vars.F_ext != null) ? vars.F_ext : 30;
  var H = F_ext;
  var V = W;
  var F_hinge = Math.sqrt(H * H + V * V);
  var theta_deg = Math.atan2(V, H) * 180 / Math.PI;
  return {
    concept_id: 'hinge_force',
    variables: { W: W, F_ext: F_ext },
    derived: { H: H, V: V, F_hinge: F_hinge, theta_deg: theta_deg },
    forces: [
      { id: 'hinge_H', label: 'H = ' + H.toFixed(1) + ' N',
        vector: { x: H, y: 0, magnitude: H, angle_deg: 0 },
        color: '#3B82F6', draw_from: 'body_left', show: true },
      { id: 'hinge_V', label: 'V = ' + V.toFixed(1) + ' N',
        vector: { x: 0, y: V, magnitude: V, angle_deg: 90 },
        color: '#10B981', draw_from: 'body_left', show: true },
      { id: 'hinge_total', label: 'F = ' + F_hinge.toFixed(1) + ' N',
        vector: { x: H, y: V, magnitude: F_hinge, angle_deg: theta_deg },
        color: '#8B5CF6', draw_from: 'body_left', show: true },
      { id: 'weight', label: 'W = ' + W.toFixed(1) + ' N',
        vector: { x: 0, y: -W, magnitude: W, angle_deg: -90 },
        color: '#EF4444', draw_from: 'body_center', show: true },
      { id: 'ext_load', label: 'F_ext = ' + F_ext.toFixed(1) + ' N',
        vector: { x: 0, y: -F_ext, magnitude: F_ext, angle_deg: -90 },
        color: '#EF4444', draw_from: 'body_right', show: true }
    ]
  };
}

function computePhysics_free_body_diagram(vars) {
  var m = (vars && vars.m != null) ? vars.m : 2;
  var theta = (vars && vars.theta != null) ? vars.theta : 0;
  var scenarioType = (vars && vars.scenario_type != null) ? vars.scenario_type : 0;
  var mg = m * PM_G;
  var thetaRad = theta * Math.PI / 180;
  var N = mg * Math.cos(thetaRad);
  var f = mg * Math.sin(thetaRad);
  var forces = [
    { id: 'weight', label: 'mg = ' + mg.toFixed(1) + ' N',
      vector: { x: 0, y: -mg, magnitude: mg, angle_deg: -90 },
      color: '#EF4444', draw_from: 'body_center', show: true }
  ];
  if (scenarioType === 0) {
    forces.push({ id: 'normal', label: 'N = ' + mg.toFixed(1) + ' N',
      vector: { x: 0, y: mg, magnitude: mg, angle_deg: 90 },
      color: '#10B981', draw_from: 'body_bottom', show: true });
  } else {
    forces.push({ id: 'normal', label: 'N = ' + N.toFixed(1) + ' N',
      vector: { x: -Math.sin(thetaRad) * N, y: Math.cos(thetaRad) * N,
        magnitude: N, angle_deg: 90 - theta },
      color: '#10B981', draw_from: 'body_bottom', show: true });
    if (theta > 0) {
      forces.push({ id: 'friction', label: 'f = ' + f.toFixed(1) + ' N',
        vector: { x: Math.cos(thetaRad) * f, y: Math.sin(thetaRad) * f,
          magnitude: f, angle_deg: theta },
        color: '#F59E0B', draw_from: 'body_bottom', show: true });
    }
  }
  return {
    concept_id: 'free_body_diagram',
    variables: { m: m, theta: theta, scenario_type: scenarioType },
    derived: { mg: mg, N: N, f: f },
    forces: forces
  };
}

function computePhysics_friction_static_kinetic(vars) {
  var m = (vars && vars.m != null) ? vars.m : 5;
  var mu_s = (vars && vars.mu_s != null) ? vars.mu_s : 0.5;
  var mu_k = (vars && vars.mu_k != null) ? vars.mu_k : 0.3;
  var F = (vars && vars.F != null) ? vars.F : 15;
  // WP-F2: declared ("constant": 9.8, same shape as pressure_scalar's own g)
  // but never echoed -- previously read off the bare PM_G global instead of
  // vars, so it was invisible to any future {g}/_expr reference. Same
  // numeric value (9.8) either way -- behaviorally inert today, closes the
  // landmine for tomorrow.
  var g = (vars && vars.g != null) ? vars.g : 9.8;
  var mg = m * g;
  var N = mg;
  var fs_max = mu_s * N;
  var fk = mu_k * N;
  var is_slipping = F > fs_max;
  var fs_actual = is_slipping ? fk : Math.min(F, fs_max);
  var net_force = is_slipping ? (F - fk) : 0;
  var acceleration = is_slipping ? (net_force / m) : 0;
  return {
    concept_id: 'friction_static_kinetic',
    variables: { m: m, mu_s: mu_s, mu_k: mu_k, F: F },
    derived: {
      mg: mg, N: N, fs_max: fs_max, fk: fk, fs_actual: fs_actual,
      net_force: net_force, acceleration: acceleration,
      is_slipping: is_slipping ? 1 : 0, g: g
    },
    forces: [
      { id: 'weight', label: 'mg = ' + mg.toFixed(1) + ' N',
        vector: { x: 0, y: -mg, magnitude: mg, angle_deg: -90 },
        color: '#EF4444', draw_from: 'body_center', show: true },
      { id: 'normal', label: 'N = ' + N.toFixed(1) + ' N',
        vector: { x: 0, y: N, magnitude: N, angle_deg: 90 },
        color: '#10B981', draw_from: 'body_bottom', show: true },
      { id: 'applied', label: 'F = ' + F.toFixed(1) + ' N',
        vector: { x: F, y: 0, magnitude: F, angle_deg: 0 },
        color: '#2563EB', draw_from: 'body_right', show: true },
      { id: 'friction',
        label: is_slipping ? ('fk = ' + fk.toFixed(1) + ' N') : ('fs = ' + fs_actual.toFixed(1) + ' N'),
        vector: { x: -fs_actual, y: 0, magnitude: fs_actual, angle_deg: 180 },
        color: is_slipping ? '#F59E0B' : '#10B981',
        draw_from: 'body_left', show: true }
    ]
  };
}

function computePhysics_current_not_vector(vars) {
  var i1 = (vars && vars.i1 != null) ? vars.i1 : 3;
  var i2 = (vars && vars.i2 != null) ? vars.i2 : 4;
  var theta_deg = (vars && vars.theta_deg != null) ? vars.theta_deg : 60;
  var theta_rad = theta_deg * Math.PI / 180;
  var i_actual = i1 + i2;
  var i_vector_pred = Math.sqrt(i1 * i1 + i2 * i2 + 2 * i1 * i2 * Math.cos(theta_rad));
  var gap_amperes = Math.abs(i_actual - i_vector_pred);
  return {
    concept_id: 'current_not_vector',
    variables: { i1: i1, i2: i2, theta_deg: theta_deg },
    derived: {
      i1: i1, i2: i2, theta_deg: theta_deg,
      i_actual: i_actual,
      i_vector_pred: i_vector_pred,
      gap_amperes: gap_amperes
    },
    forces: []
  };
}

function computePhysics_pressure_scalar(vars) {
  var rho = (vars && vars.rho != null) ? vars.rho : 1000;
  var g = (vars && vars.g != null) ? vars.g : 9.8;
  var depth = (vars && vars.depth != null) ? vars.depth : 5;
  var face_area = (vars && vars.face_area != null) ? vars.face_area : 0.1;
  var face_angle_deg = (vars && vars.face_angle_deg != null) ? vars.face_angle_deg : 0;
  var face_angle_rad = face_angle_deg * Math.PI / 180;
  var pressure = rho * g * depth;
  var force_magnitude = pressure * face_area;
  var fx = force_magnitude * Math.cos(face_angle_rad);
  var fy = force_magnitude * Math.sin(face_angle_rad);
  return {
    concept_id: 'pressure_scalar',
    variables: { rho: rho, g: g, depth: depth, face_area: face_area, face_angle_deg: face_angle_deg },
    derived: {
      rho: rho, g: g, depth: depth, face_area: face_area, face_angle_deg: face_angle_deg,
      pressure: pressure,
      force_magnitude: force_magnitude,
      fx: fx, fy: fy
    },
    forces: []
  };
}

function computePhysics_scalar_vs_vector(vars) {
  var a = (vars && vars.a != null) ? vars.a : 3;
  var b = (vars && vars.b != null) ? vars.b : 4;
  var theta = (vars && vars.theta != null) ? vars.theta : 90;
  var d_hook = (vars && vars.d_hook != null) ? vars.d_hook : 5;
  var phi_hook = (vars && vars.phi_hook != null) ? vars.phi_hook : 0;
  var m1 = (vars && vars.m1 != null) ? vars.m1 : 3;
  var m2 = (vars && vars.m2 != null) ? vars.m2 : 4;
  // WP-F2: declared in physics_engine_config.variables but previously never
  // read/echoed here -- direction_deg_expr: "psi_pointer" (STATE_2) resolved
  // to NaN (PM_safeEval ReferenceError -> caught -> 0), freezing the
  // spinning-pointer choreography at due-east forever (THE EYE D5 STATE_2).
  var m_pack = (vars && vars.m_pack != null) ? vars.m_pack : 8;
  var psi_pointer = (vars && vars.psi_pointer != null) ? vars.psi_pointer : 0;
  var theta_rad = theta * Math.PI / 180;
  var phi_hook_rad = phi_hook * Math.PI / 180;
  var R_mag = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(theta_rad));
  var R_dir_deg = Math.atan2(b * Math.sin(theta_rad), a + b * Math.cos(theta_rad)) * 180 / Math.PI;
  return {
    concept_id: 'scalar_vs_vector',
    variables: { a: a, b: b, theta: theta, d_hook: d_hook, phi_hook: phi_hook, m1: m1, m2: m2, m_pack: m_pack, psi_pointer: psi_pointer },
    derived: {
      R_mag: R_mag,
      R_dir_deg: R_dir_deg,
      sum_scalar: a + b,
      mass_sum: m1 + m2,
      P1_x: a,
      P1_y: 0,
      P2_x: a + b * Math.cos(theta_rad),
      P2_y: b * Math.sin(theta_rad),
      hook_x: d_hook * Math.cos(phi_hook_rad),
      hook_y: d_hook * Math.sin(phi_hook_rad)
    },
    forces: []
  };
}

// resultant_formula (Ch.5 Vectors) — the parallelogram-law MAGNITUDE:
// R = sqrt(A^2 + B^2 + 2AB cos theta). Registered in PCPL_CONCEPTS but had no
// computePhysics entry, so the dispatcher returned null and the whole sim drew
// "Unknown concept" (fixed 2026-07-23, PCPL parity). Labels are authored static;
// derived values feed any *_expr, the value-only HUD, and the explore-state sliders.
function computePhysics_resultant_formula(vars) {
  var A = (vars && vars.A != null) ? vars.A : 4;
  var B = (vars && vars.B != null) ? vars.B : 3;
  var theta_deg = (vars && vars.theta_deg != null) ? vars.theta_deg : 60;
  var theta_rad = theta_deg * Math.PI / 180;
  var R_mag = Math.sqrt(A * A + B * B + 2 * A * B * Math.cos(theta_rad));
  var alpha_deg = Math.atan2(B * Math.sin(theta_rad), A + B * Math.cos(theta_rad)) * 180 / Math.PI;
  return {
    concept_id: 'resultant_formula',
    variables: { A: A, B: B, theta_deg: theta_deg },
    derived: {
      A: A, B: B, theta_deg: theta_deg,
      R_mag: R_mag, R: R_mag, alpha_deg: alpha_deg,
      Rx: A + B * Math.cos(theta_rad),
      Ry: B * Math.sin(theta_rad)
    },
    forces: []
  };
}

// direction_of_resultant (Ch.5 Vectors) — the parallelogram-law DIRECTION:
// alpha = atan2(B sin theta, A + B cos theta), the angle of R measured from A.
// Same missing-computePhysics "Unknown concept" bug as resultant_formula (fixed
// 2026-07-23). Also carries R_mag so a shared HUD/formula reads consistently.
function computePhysics_direction_of_resultant(vars) {
  var A = (vars && vars.A != null) ? vars.A : 4;
  var B = (vars && vars.B != null) ? vars.B : 3;
  var theta_deg = (vars && vars.theta_deg != null) ? vars.theta_deg : 60;
  var theta_rad = theta_deg * Math.PI / 180;
  var Rx = A + B * Math.cos(theta_rad);
  var Ry = B * Math.sin(theta_rad);
  var alpha_deg = Math.atan2(Ry, Rx) * 180 / Math.PI;
  var R_mag = Math.sqrt(A * A + B * B + 2 * A * B * Math.cos(theta_rad));
  return {
    concept_id: 'direction_of_resultant',
    variables: { A: A, B: B, theta_deg: theta_deg },
    derived: {
      A: A, B: B, theta_deg: theta_deg,
      alpha_deg: alpha_deg, alpha: alpha_deg,
      R_mag: R_mag, R: R_mag, Rx: Rx, Ry: Ry
    },
    forces: []
  };
}

function computePhysics_vector_addition_law(vars) {
  var a = (vars && vars.a != null) ? vars.a : 3;
  var b = (vars && vars.b != null) ? vars.b : 4;
  var theta = (vars && vars.theta != null) ? vars.theta : 90;
  var walk_phase = (vars && vars.walk_phase != null) ? vars.walk_phase : 0;
  var theta_rad = theta * Math.PI / 180;
  var R_mag = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(theta_rad));
  var R_dir_deg = Math.atan2(b * Math.sin(theta_rad), a + b * Math.cos(theta_rad)) * 180 / Math.PI;
  var wp1 = Math.min(walk_phase, 1);
  var wp2 = Math.max(walk_phase - 1, 0);
  return {
    concept_id: 'vector_addition_law',
    variables: { a: a, b: b, theta: theta, walk_phase: walk_phase },
    derived: {
      R_mag: R_mag,
      R_dir_deg: R_dir_deg,
      sum_scalar: a + b,
      P1_x: a,
      P1_y: 0,
      P2_x: a + b * Math.cos(theta_rad),
      P2_y: b * Math.sin(theta_rad),
      trip_meter: a * wp1 + b * wp2,
      walk_x: wp1 * a + wp2 * b * Math.cos(theta_rad),
      walk_y: wp2 * b * Math.sin(theta_rad)
    },
    forces: []
  };
}

function computePhysics(conceptId, vars) {
  var result = null;
  if (conceptId === 'field_forces') result = computePhysics_field_forces(vars);
  else if (conceptId === 'contact_forces') result = computePhysics_contact_forces(vars);
  else if (conceptId === 'normal_reaction') result = computePhysics_normal_reaction(vars);
  else if (conceptId === 'tension_in_string') result = computePhysics_tension_in_string(vars);
  else if (conceptId === 'vector_resolution') result = computePhysics_vector_resolution(vars);
  else if (conceptId === 'resultant_formula') result = computePhysics_resultant_formula(vars);
  else if (conceptId === 'direction_of_resultant') result = computePhysics_direction_of_resultant(vars);
  else if (conceptId === 'hinge_force') result = computePhysics_hinge_force(vars);
  else if (conceptId === 'free_body_diagram') result = computePhysics_free_body_diagram(vars);
  else if (conceptId === 'friction_static_kinetic') result = computePhysics_friction_static_kinetic(vars);
  else if (conceptId === 'current_not_vector') result = computePhysics_current_not_vector(vars);
  else if (conceptId === 'pressure_scalar') result = computePhysics_pressure_scalar(vars);
  else if (conceptId === 'vector_head_to_tail') result = computePhysics_vector_head_to_tail(vars);
  else if (conceptId === 'newton_second_law_direction') result = computePhysics_newton_second_law_direction(vars);
  else if (conceptId === 'scalar_vs_vector') result = computePhysics_scalar_vs_vector(vars);
  else if (conceptId === 'vector_addition_law') result = computePhysics_vector_addition_law(vars);

  // WP-F2 echo safety net — structural complement to the hand-listed reads
  // above (hand-listing itself must stay: no concept JSON here authors a
  // top-level default_variables block, so a per-variable default has no
  // source of truth except each function's own literal fallback; a fully
  // generic 'spread vars' replacement would lose those defaults whenever a
  // key is absent from vars). This net only ADDS keys the caller already
  // supplied in vars that the concept-specific fn's own 'variables' object
  // doesn't already contain — it never overwrites a key the function
  // computed, and 'derived' always wins downstream anyway
  // (PM_liveVarsWithDerived / PM_interpolate apply derived last), so a
  // deliberately-recomputed value can never be masked by this merge.
  // This is exactly what would have auto-caught the scalar_vs_vector
  // psi_pointer bug: PM_applyChoreography() merges the freshly-stepped
  // choreography value into vars every frame regardless of whether the
  // per-concept function reads it, so any future variable a concept's
  // author wires into a slider/variable_choreography but forgets to echo
  // is still surfaced to PM_safeEval/PM_interpolate.
  if (result && vars) {
    if (!result.variables) result.variables = {};
    for (var k in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, k) &&
          !Object.prototype.hasOwnProperty.call(result.variables, k)) {
        result.variables[k] = vars[k];
      }
    }
  }
  return result;
}

// vector_head_to_tail — Phase 0 validation demo Sim 1 (session 56). Iframe-side
// fallback in case PM_PRECOMPUTED_PHYSICS isn't injected. Returns the same
// shape as the TS engine (vectorHeadToTailEngine in physicsEngine/concepts/).
// Pure DC Pandey Ch.5.4 displacement framing: walk d_east m east, then
// d_north m north → resultant = sqrt(d_east² + d_north²).
function computePhysics_vector_head_to_tail(vars) {
  var d_east = (vars && vars.d_east != null) ? vars.d_east : 3;
  var d_north = (vars && vars.d_north != null) ? vars.d_north : 4;
  var d_resultant_mag = Math.sqrt(d_east * d_east + d_north * d_north);
  var theta_resultant_deg = Math.atan2(d_north, d_east) * 180 / Math.PI;
  return {
    concept_id: 'vector_head_to_tail',
    variables: { d_east: d_east, d_north: d_north },
    derived: { d_resultant_mag: d_resultant_mag, theta_resultant_deg: theta_resultant_deg },
    forces: []
  };
}

// newton_second_law_direction — Phase 0 validation demo Sim 2 (session 59).
// Iframe-side fallback in case PM_PRECOMPUTED_PHYSICS isn't injected. Mirrors
// the TS engine (newtonSecondLawDirectionEngine in physicsEngine/concepts/).
// F = m·a as a vector equation: a points along F, v(t) = a·t from rest.
function computePhysics_newton_second_law_direction(vars) {
  var F = (vars && vars.F != null) ? vars.F : 10;
  var m = (vars && vars.m != null) ? vars.m : 2;
  var theta_F = (vars && vars.theta_F != null) ? vars.theta_F : 0;
  var t = (vars && vars.t != null) ? vars.t : 1;
  var theta_rad = theta_F * Math.PI / 180;
  var a_mag = F / m;
  var a_x = a_mag * Math.cos(theta_rad);
  var a_y = a_mag * Math.sin(theta_rad);
  var v_x_at_t = a_x * t;
  var v_y_at_t = a_y * t;
  var v_mag_at_t = Math.sqrt(v_x_at_t * v_x_at_t + v_y_at_t * v_y_at_t);
  return {
    concept_id: 'newton_second_law_direction',
    variables: { F: F, m: m, theta_F: theta_F, t: t },
    derived: {
      a_mag: a_mag,
      a_x: a_x,
      a_y: a_y,
      v_x_at_t: v_x_at_t,
      v_y_at_t: v_y_at_t,
      v_mag_at_t: v_mag_at_t
    },
    forces: []
  };
}

// ─── Section 2: Primitive drawers + helpers ─────────────────────────────────
function PM_hexToRgb(hex) {
  if (!hex || typeof hex !== 'string' || hex.charAt(0) !== '#') return [107, 114, 128];
  return [parseInt(hex.slice(1,3), 16), parseInt(hex.slice(3,5), 16), parseInt(hex.slice(5,7), 16)];
}

// ── Animation gate ────────────────────────────────────────────────────────
// Deep-dive sub-states carry per-primitive timing:
//   spec.appear_at_ms  — delay after state entry before the primitive is visible
//   spec.animate_in_ms — duration over which it reveals (alpha 0→1) after appear_at_ms
// Returns { visible: boolean, alpha: 0..1 } for the current frame. Primitives
// without either field always render at full opacity (backward-compat).
function PM_animationGate(spec) {
  if (!spec) return { visible: true, alpha: 1 };
  var appearAt = (typeof spec.appear_at_ms === 'number') ? spec.appear_at_ms : 0;
  // Narration-bound reveal (R-E): a primitive may bind its appear time to a
  // scenario_cue via spec.reveal_cue. When the player posts that cue's start
  // (SET_CUE_TIME), the visual one-shot re-times to the ACTUAL narration beat
  // (matching field_3d's cueTriggerMs) instead of a fixed appear_at_ms that
  // desyncs after pacing trims. appear_at_ms stays the fallback — THE EYE never
  // posts SET_CUE_TIME, so PM_cueOverrides is empty and frozen frames stay
  // deterministic on the authored time.
  if (typeof spec.reveal_cue === 'string' && typeof PM_cueOverrides[spec.reveal_cue] === 'number') {
    appearAt = PM_cueOverrides[spec.reveal_cue];
  }
  var animMs = (typeof spec.animate_in_ms === 'number') ? spec.animate_in_ms : 0;
  var disappearAt = (typeof spec.disappear_at_ms === 'number') ? spec.disappear_at_ms : Infinity;
  var fadeOutMs = (typeof spec.fade_out_ms === 'number') ? spec.fade_out_ms : 0;
  if (appearAt <= 0 && animMs <= 0 && disappearAt === Infinity) return { visible: true, alpha: 1 };
  var elapsed = PM_simClockMs;
  if (elapsed < appearAt) return { visible: false, alpha: 0 };
  // Fade-out phase (after disappear_at_ms): alpha lerps 1 → 0 over fade_out_ms,
  // then visible=false. Lets STATE_6 fade out the trajectory + ghost balls + cannon
  // mid-state so the camera zoom can isolate the live ball cleanly.
  if (elapsed >= disappearAt) {
    if (fadeOutMs <= 0) return { visible: false, alpha: 0 };
    var fadeProgress = Math.min(1, Math.max(0, (elapsed - disappearAt) / fadeOutMs));
    if (fadeProgress >= 1) return { visible: false, alpha: 0 };
    return { visible: true, alpha: 1 - fadeProgress };
  }
  if (animMs <= 0) return { visible: true, alpha: 1 };
  var progress = Math.min(1, Math.max(0, (elapsed - appearAt) / animMs));
  return { visible: true, alpha: progress };
}

// ── Focal-primitive emphasis (Rule 29: brightness, NEVER size) ────────────
// When the current state's focal primitive matches spec.id, emphasize it via
// alpha + glow (drawingContext.shadowBlur/shadowColor) — never by scaling
// geometry. Non-focal peers dim slightly so the eye is drawn to the focal
// element; if the state declares no focal at all, nobody dims.
// Focal source priority (unchanged from the old pulse mechanism):
//   1. focal_sequence[] — timed per-sentence switching (highlight_primitive_id + duration_ms)
//   2. focal_primitive_id — static fallback for the whole state
// Returns { isFocal, alphaMul, glowPx }. Callers multiply alphaMul into their
// existing alpha channel and, when glowPx > 0, set+reset drawingContext's
// shadowBlur/shadowColor around their draw calls (must reset — a leaked
// shadow bleeds into every primitive drawn after it).
function PM_focalEmphasis(spec) {
  var NONE = { isFocal: false, alphaMul: 1, glowPx: 0 };
  if (!spec || !spec.id) return NONE;
  var stateData = PM_config && PM_config.states && PM_config.states[PM_currentState];
  if (!stateData) return NONE;
  var elapsed = PM_simClockMs;

  // Priority 0: SET_GLOW narration-beat override (per-sentence). Wins over the
  // authored focal so the spotlight can re-target on each narrated sentence
  // (field_3d parity). null = fall through to the authored focal below. THE EYE
  // never posts SET_GLOW, so frozen baselines always use the authored focal (no churn).
  if (PM_glowOverride != null) {
    var isGlowFocal = (typeof PM_glowOverride === 'string')
      ? (PM_glowOverride === spec.id)
      : (Array.isArray(PM_glowOverride) && PM_glowOverride.indexOf(spec.id) !== -1);
    return isGlowFocal
      ? { isFocal: true, alphaMul: 1, glowPx: 12 }
      : { isFocal: false, alphaMul: 0.6, glowPx: 0 };
  }

  // Priority 1: focal_sequence — cycle through highlight_primitive_id by time
  var seq = stateData.focal_sequence;
  var focalId = null;
  if (seq && seq.length > 0) {
    var cum = 0;
    for (var i = 0; i < seq.length; i++) {
      cum += (seq[i].duration_ms || 3000);
      if (elapsed < cum) { focalId = seq[i].highlight_primitive_id; break; }
    }
    // After all segments, keep last
    if (focalId === null) focalId = seq[seq.length - 1].highlight_primitive_id;
  }

  // Priority 2: static focal_primitive_id
  if (!focalId) focalId = stateData.focal_primitive_id;

  // No focal declared for this state → nobody dims, nobody glows.
  if (!focalId) return NONE;

  if (focalId === spec.id) return { isFocal: true, alphaMul: 1, glowPx: 12 };
  return { isFocal: false, alphaMul: 0.6, glowPx: 0 };
}

// ── rotate_continuous (WP-R5, D5) ─────────────────────────────────────────
// Decorative continuous spin for a body NOT tied to a physics variable (e.g.
// a compass-style pointer). Pure function of PM_simClockMs — same
// freeze-determinism guarantee as every other timer in this renderer (Rule
// 36). animSpec is spec.animation: { period_ms, from_deg?, direction? }.
function PM_rotateContinuousDeg(animSpec) {
  var period = (typeof animSpec.period_ms === 'number' && animSpec.period_ms > 0)
    ? animSpec.period_ms : 2000;
  var fromDeg = (typeof animSpec.from_deg === 'number') ? animSpec.from_deg : 0;
  var dir = (animSpec.direction === 'ccw') ? -1 : 1;
  var frac = (PM_simClockMs % period) / period;
  return fromDeg + dir * frac * 360;
}

// ── Annotation overlap resolver ───────────────────────────────────────────
// Sonnet emits absolute positions. When two annotations land on the same
// canvas side and their bounding boxes intersect, nudge the later one down.
// Returns a shallow-cloned primitives array with adjusted annotation y values.
// Mutates neither the input array nor the original primitives.
function PM_resolveAnnotationOverlap(scene) {
  if (!Array.isArray(scene)) return scene;
  var out = scene.slice();
  var annotationsLeft = [];
  var annotationsRight = [];
  var CANVAS_MID_X = 380;
  for (var i = 0; i < out.length; i++) {
    var p = out[i];
    if (!p || p.type !== 'annotation' || !p.position) continue;
    // Estimate bounding box — annotation width scales with longest line length.
    var txt = p.text || '';
    var lines = String(txt).split('\\n');
    var maxLen = 0;
    for (var li = 0; li < lines.length; li++) {
      if (lines[li].length > maxLen) maxLen = lines[li].length;
    }
    // Rough px: 12px font, ~7px per char, + 16px horizontal padding.
    var boxW = Math.max(60, maxLen * 7 + 16);
    var boxH = lines.length * 17 + 12; // 12px font + 1.35 line height + 12px vpad
    var rec = {
      idx: i, x: p.position.x, y: p.position.y, w: boxW, h: boxH
    };
    if (p.position.x < CANVAS_MID_X) annotationsLeft.push(rec);
    else annotationsRight.push(rec);
  }
  function resolveBucket(bucket) {
    // Sort top→bottom by y, then push each subsequent one down if it overlaps.
    bucket.sort(function(a, b) { return a.y - b.y; });
    for (var k = 1; k < bucket.length; k++) {
      var prev = bucket[k - 1];
      var cur = bucket[k];
      // Overlap in y: cur.y < prev.y + prev.h + 12 (gap of 12 px)
      var threshold = prev.y + prev.h + 12;
      if (cur.y < threshold) {
        var delta = threshold - cur.y;
        cur.y += delta;
        // Clamp to canvas bottom (annotations shouldn't go off 480).
        if (cur.y + cur.h > 480) cur.y = Math.max(20, 480 - cur.h);
        // Write adjusted y back onto the cloned primitive.
        var orig = out[cur.idx];
        out[cur.idx] = Object.assign({}, orig, {
          position: { x: orig.position.x, y: cur.y }
        });
      }
    }
  }
  resolveBucket(annotationsLeft);
  resolveBucket(annotationsRight);
  return out;
}

// Build a scope that merges the caller's vars with common Math functions so
// JSON expressions can write bare sqrt(), atan2(), PI etc. without the Math. prefix.
function PM_buildEvalScope(vars) {
  var keys = [];
  var vals = [];
  var seen = {};
  var srcKeys = Object.keys(vars || {});
  for (var i = 0; i < srcKeys.length; i++) {
    keys.push(srcKeys[i]);
    vals.push(vars[srcKeys[i]]);
    seen[srcKeys[i]] = true;
  }
  var mathKeys = ['sqrt','atan2','atan','asin','acos','sin','cos','tan',
    'abs','min','max','pow','log','exp','PI','E','round','floor','ceil','sign'];
  for (var mi = 0; mi < mathKeys.length; mi++) {
    if (!seen[mathKeys[mi]]) {
      keys.push(mathKeys[mi]);
      vals.push(Math[mathKeys[mi]]);
    }
  }
  return { keys: keys, vals: vals };
}

// Safe-eval a JS expression with current vars in scope. Returns NaN on failure.
// Used by animations that need dynamic accel/sign expressions (e.g. atwood).
function PM_safeEval(expr, vars) {
  try {
    var scope = PM_buildEvalScope(vars);
    var fn = new Function(scope.keys.join(','), 'return (' + expr + ');');
    var result = fn.apply(null, scope.vals);
    return (typeof result === 'number') ? result : NaN;
  } catch (e) {
    return NaN;
  }
}

// Point-returning sibling of PM_safeEval: evaluates a *_expr that yields a POINT
// object, e.g. from_expr/to_expr = "{x: 310, y: 370 - N * 4}". PM_safeEval coerces
// its result to a number (→NaN for objects), so geometric endpoints need this.
function PM_safeEvalPoint(expr, vars) {
  try {
    var scope = PM_buildEvalScope(vars);
    var fn = new Function(scope.keys.join(','), 'return (' + expr + ');');
    var r = fn.apply(null, scope.vals);
    if (r && typeof r.x === 'number' && typeof r.y === 'number' && isFinite(r.x) && isFinite(r.y)) {
      return { x: r.x, y: r.y };
    }
  } catch (e) { /* fall through */ }
  return null;
}

// Resolve a force_arrow / vector endpoint from a literal {x,y} or a point-expr string.
function PM_resolveArrowPoint(literal, exprStr, vars) {
  if (literal && typeof literal.x === 'number' && typeof literal.y === 'number') {
    return { x: literal.x, y: literal.y };
  }
  if (typeof exprStr === 'string') return PM_safeEvalPoint(exprStr, vars);
  return null;
}

// Live eval scope for *_expr fields (magnitude_expr, direction_deg_expr, accel_expr,
// sign_expr, to_deg_expr, angle_value_expr, ...) evaluated via PM_safeEval outside of
// PM_interpolate (drawForceArrow, drawVector, drawAngleArc, drawBody animations).
// Merges PM_physics.derived (computed_outputs like R_mag, force_magnitude, pressure)
// on top of PM_physics.variables / PM_config.default_variables — same idiom as
// PM_interpolate's baseVars/derivedVars merge below — so an expression can reference
// a derived field directly instead of only raw slider variables. Without this merge,
// PM_safeEval silently returns NaN for any expr naming a derived-only field and the
// caller's isFinite() guard falls back to 0 (an invisible zero-length arrow).
function PM_liveVarsWithDerived() {
  var baseVars = (PM_physics && PM_physics.variables)
    || (PM_config && PM_config.default_variables)
    || {};
  var derivedVars = (PM_physics && PM_physics.derived) || {};
  var vars = {};
  for (var bk in baseVars) if (Object.prototype.hasOwnProperty.call(baseVars, bk)) vars[bk] = baseVars[bk];
  for (var dk in derivedVars) if (Object.prototype.hasOwnProperty.call(derivedVars, dk)) vars[dk] = derivedVars[dk];
  return vars;
}

// The live expression scope, shared by every binding that reads authored
// variables. Prefers live vars from PM_physics (updated every SLIDER_CHANGE) so
// labels like "theta = {theta} deg" track the current value, not the static
// authoring default. Merges derived fields (force_magnitude, pressure,
// i_actual, ...) on top of variables so JSON expressions can reference computed
// outputs directly without re-deriving them.
//
// Extracted so TEXT bindings (PM_interpolate) and POSITION bindings
// (position_expr in drawBody) read one scope instead of two copies that merely
// happen to agree — a state can't render a number and place its glyph from
// different values.
function PM_liveExprVars() {
  var baseVars = (PM_physics && PM_physics.variables)
    || (PM_config && PM_config.default_variables)
    || {};
  var derivedVars = (PM_physics && PM_physics.derived) || {};
  var vars = {};
  for (var bk in baseVars) if (Object.prototype.hasOwnProperty.call(baseVars, bk)) vars[bk] = baseVars[bk];
  for (var dk in derivedVars) if (Object.prototype.hasOwnProperty.call(derivedVars, dk)) vars[dk] = derivedVars[dk];
  return vars;
}

function PM_interpolate(text) {
  if (typeof text !== 'string') return text;
  var vars = PM_liveExprVars();
  return text.replace(/\\{([^{}]+)\\}/g, function(_m, body) {
    // Simple identifier — fast path for {theta} / {m1} etc.
    if (/^\\w+$/.test(body)) {
      return (vars[body] != null) ? String(vars[body]) : ('{' + body + '}');
    }
    // Complex JS expression — safely evaluate with current vars in scope.
    // Supports {((2*m1*m2*9.8)/(m1+m2)).toFixed(2)} and similar.
    // Bare sqrt(), atan2(), PI, etc. are auto-injected via PM_buildEvalScope.
    try {
      var scope = PM_buildEvalScope(vars);
      var fn = new Function(scope.keys.join(','), 'return (' + body + ');');
      var result = fn.apply(null, scope.vals);
      if (result == null) return '{' + body + '}';
      if (typeof result === 'number' && !isFinite(result)) return '{' + body + '}';
      return String(result);
    } catch (e) {
      return '{' + body + '}';
    }
  });
}

// Scan a state's scene_composition for the first surface primitive and derive
// theta from its orientation/angle. Horizontal → 0, vertical → 90, inclined → spec.angle.
// Returns vars merged over PM_config.default_variables (base vars win only where
// the state doesn't specify a surface).
function PM_resolveStateVars(stateKey) {
  var base = (PM_config && PM_config.default_variables) || {};
  var merged = {};
  for (var bk in base) if (Object.prototype.hasOwnProperty.call(base, bk)) merged[bk] = base[bk];
  var state = PM_config && PM_config.states && PM_config.states[stateKey];
  var scene = (state && state.scene_composition) || [];
  for (var i = 0; i < scene.length; i++) {
    var p = scene[i];
    if (!p || p.type !== 'surface') continue;
    if (p.orientation === 'horizontal') { merged.theta = 0; break; }
    if (p.orientation === 'vertical')   { merged.theta = 90; break; }
    if (p.orientation === 'inclined') {
      if (typeof p.angle === 'number') { merged.theta = p.angle; break; }
      if (typeof p.angle_expr === 'string' && typeof base[p.angle_expr] === 'number') {
        merged.theta = base[p.angle_expr]; break;
      }
      merged.theta = 30; break;
    }
  }
  // Per-state variable overrides win last. Lets STATE_4 of hinge_force say
  // F_ext=0 so the engine matches the "no external load" narrative.
  if (state && state.variable_overrides && typeof state.variable_overrides === 'object') {
    var ov = state.variable_overrides;
    for (var ok in ov) {
      if (Object.prototype.hasOwnProperty.call(ov, ok) && typeof ov[ok] === 'number') {
        merged[ok] = ov[ok];
      }
    }
  }
  return merged;
}

// ── Variable Choreography evaluator (WP-R5, D5) ───────────────────────────
// Pure functions of a supplied tMs (always PM_simClockMs — the state-local
// sim clock — or, for locus_trace's historical resampling, a past tMs on
// the SAME clock). No wall-clock reads, no accumulated/mutated state: given
// the same spec and the same tMs this always returns the same value, which
// is what makes SET_TIME_FREEZE reproduce byte-identical frames (Rule 36).
//
// PM_choreoBuildSegments turns a one-directional sweep (from -> to over
// duration_ms) plus a list of {at_value, hold_ms} holds into a piecewise
// timeline: ramp, hold, ramp, hold, ..., ramp. Holds are located by WHERE
// their at_value falls along the from->to span (as a 0..1 fraction of
// duration_ms), not by any separate time field — so "hold at 90 degrees"
// means exactly that, regardless of how fast the sweep runs.
function PM_choreoBuildSegments(from, to, durationMs, holds) {
  var span = to - from;
  var checkpoints = [];
  var holdList = holds || [];
  for (var hi = 0; hi < holdList.length; hi++) {
    var hold = holdList[hi];
    if (!hold || typeof hold.at_value !== 'number') continue;
    var frac = (span !== 0) ? (hold.at_value - from) / span : 0;
    if (frac < 0 || frac > 1) continue; // outside this sweep's own direction/range
    checkpoints.push({ frac: frac, hold_ms: hold.hold_ms || 0, value: hold.at_value });
  }
  checkpoints.sort(function(a, b) { return a.frac - b.frac; });

  var segments = [];
  var prevFrac = 0;
  var prevValue = from;
  for (var ci = 0; ci < checkpoints.length; ci++) {
    var cp = checkpoints[ci];
    var rampDur = (cp.frac - prevFrac) * durationMs;
    if (rampDur > 0) segments.push({ kind: 'ramp', fromV: prevValue, toV: cp.value, dur: rampDur });
    if (cp.hold_ms > 0) segments.push({ kind: 'hold', value: cp.value, dur: cp.hold_ms });
    prevFrac = cp.frac;
    prevValue = cp.value;
  }
  var tailDur = (1 - prevFrac) * durationMs;
  if (tailDur > 0 || segments.length === 0) {
    segments.push({ kind: 'ramp', fromV: prevValue, toV: to, dur: Math.max(0, tailDur) });
  }
  return segments;
}

function PM_choreoSampleSegments(segments, t) {
  var acc = 0;
  for (var i = 0; i < segments.length; i++) {
    var seg = segments[i];
    var isLast = (i === segments.length - 1);
    if (t <= acc + seg.dur || isLast) {
      if (seg.kind === 'hold') return seg.value;
      var segT = seg.dur > 0 ? Math.min(1, Math.max(0, (t - acc) / seg.dur)) : 1;
      return seg.fromV + (seg.toV - seg.fromV) * segT;
    }
    acc += seg.dur;
  }
  return 0; // unreachable — PM_choreoBuildSegments always emits >= 1 segment
}

// spec: { variable, mode: 'once'|'loop'|'ping_pong', from, to, start_ms,
//         duration_ms, holds?: [{at_value, hold_ms}] }. Before start_ms the
// value is simply 'from' (nothing has begun sweeping yet).
function PM_choreoValue(spec, tMs) {
  var from = spec.from;
  var to = spec.to;
  var startMs = (typeof spec.start_ms === 'number') ? spec.start_ms : 0;
  var durationMs = (typeof spec.duration_ms === 'number' && spec.duration_ms > 0) ? spec.duration_ms : 1000;
  var holds = spec.holds || [];
  var mode = spec.mode || 'once';

  if (tMs < startMs) return from;
  var localT = tMs - startMs;

  var forward = PM_choreoBuildSegments(from, to, durationMs, holds);
  var forwardDur = 0;
  for (var fi = 0; fi < forward.length; fi++) forwardDur += forward[fi].dur;

  if (mode === 'once') {
    return PM_choreoSampleSegments(forward, Math.min(localT, forwardDur));
  }
  if (mode === 'loop') {
    var cyc = forwardDur > 0 ? (localT % forwardDur) : 0;
    return PM_choreoSampleSegments(forward, cyc);
  }
  // ping_pong — build the return leg (to -> from) with the SAME holds (they
  // re-locate automatically since PM_choreoBuildSegments re-derives each
  // checkpoint's fraction from the new from/to span) so the pause happens at
  // the same physical value on the way back too.
  var backward = PM_choreoBuildSegments(to, from, durationMs, holds);
  var backwardDur = 0;
  for (var bi = 0; bi < backward.length; bi++) backwardDur += backward[bi].dur;
  var fullPeriod = forwardDur + backwardDur;
  if (fullPeriod <= 0) return from;
  var cycT = localT % fullPeriod;
  if (cycT < forwardDur) return PM_choreoSampleSegments(forward, cycT);
  return PM_choreoSampleSegments(backward, cycT - forwardDur);
}

// Draws a stick-figure human with feet at (x, y) when rotation is 0.
// Called inside a push() scope; the caller owns transforms.
function drawStickman(x, y, size, rgb) {
  var headR = size * 0.14;
  var headCY = y - size + headR;
  var shoulderY = y - size + headR * 2;
  var hipY = y - size * 0.45;
  var armSpread = size * 0.32;
  var legSpread = size * 0.22;

  push();
  stroke(rgb[0], rgb[1], rgb[2]);
  strokeWeight(3);
  noFill();
  circle(x, headCY, headR * 2);
  line(x, shoulderY, x, hipY);
  line(x, shoulderY + headR * 0.3, x - armSpread, shoulderY + headR * 1.4);
  line(x, shoulderY + headR * 0.3, x + armSpread, shoulderY + headR * 1.4);
  line(x, hipY, x - legSpread, y);
  line(x, hipY, x + legSpread, y);
  pop();
}

function drawBody(spec) {
  // appear_at_ms / disappear_at_ms gating — bodies (blocks, balls, cannons, ghosts)
  // can fade in / fade out per-state for cinematic choreography. STATE_6 of
  // newton_second_law_direction uses disappear_at_ms to clear cannon + ground +
  // ghost balls when the camera zooms in on the live ball.
  var bodyGate = PM_animationGate(spec);
  if (!bodyGate.visible) return;
  // P6 — attach_to_surface: if present and surface exists, compute the attach
  // point from the surface registry. Body's BASE sits at the attach point and
  // the body rotates to lie along the surface (unless an explicit rotation_deg
  // is given, which always wins — e.g. the STATE_4 ladder leans by its own 25°).
  var surfAttach = spec.attach_to_surface;
  var attachedPos = null;
  var surfaceAngleDeg = 0;

  if (surfAttach && surfAttach.surface_id && PM_surfaceRegistry[surfAttach.surface_id]) {
    var surf = PM_surfaceRegistry[surfAttach.surface_id];
    var frac = (typeof surfAttach.position_fraction === 'number') ? surfAttach.position_fraction : 0.5;
    if (surf.orientation === 'vertical') {
      attachedPos = { x: surf.x0, y: surf.y0 - surf.length * frac };
      surfaceAngleDeg = 90;
    } else {
      var rad = (surf.angle_deg || 0) * Math.PI / 180;
      attachedPos = {
        x: surf.x0 + Math.cos(rad) * surf.length * frac,
        y: surf.y0 - Math.sin(rad) * surf.length * frac,
      };
      surfaceAngleDeg = surf.angle_deg || 0;
    }
  }

  // Engine 20 position override: motion integrator advances the block's
  // position along the incline. Rotation still follows surfaceAngleDeg so
  // the body stays visually aligned with the surface as it slides.
  if (spec.id && PM_motionState[spec.id]) {
    attachedPos = { x: PM_motionState[spec.id].x, y: PM_motionState[spec.id].y };
  }

  var pos = attachedPos || spec._resolvedPosition || spec.position || { x: 200, y: 200 };

  // position_expr — live variable-driven position, the positional sibling of
  // label_expr/text_expr. Until now only TEXT could react to a slider: a state
  // could show "λ = 486 nm" updating live while the glyph the number describes
  // sat frozen at its authored coordinate. This binds the body's own position to
  // the same variables, so the picture moves with the number (e.g. an electron
  // riding to whichever energy rung n_end selects).
  //
  // Reads PM_liveExprVars() — the SAME merged variables+derived scope
  // PM_interpolate uses — so a position binding and a text binding in one state
  // can never disagree about the value they are showing.
  //
  // Opt-in and last-resort by construction: physics overrides win (a surface
  // attachment or the Engine 20 motion integrator IS the position), and a
  // non-finite eval keeps the static authored pos, so a malformed expression
  // degrades to the authored layout rather than blanking the body. Resolved
  // before the animation delta below, and registered into PM_bodyRegistry
  // downstream, so glow_focus and force-arrow anchoring track it for free.
  if (!attachedPos && !(spec.id && PM_motionState[spec.id]) && spec.position_expr) {
    var peVars = PM_liveExprVars();
    var peX = (spec.position_expr.x != null) ? PM_safeEval(String(spec.position_expr.x), peVars) : pos.x;
    var peY = (spec.position_expr.y != null) ? PM_safeEval(String(spec.position_expr.y), peVars) : pos.y;
    if (isFinite(peX) && isFinite(peY)) pos = { x: peX, y: peY };
  }

  // Physics-driven animation delta. Engines learn nothing — JSONs declare the
  // animation shape and the renderer applies the equation.
  //   free_fall: y grows as 0.5·g·t²·PPM (true acceleration under gravity).
  //   pendulum: (dx, dy) = L·(sin θ, 1−cos θ) with θ = A·cos(2π·t/T) — fruit swaying on a thread.
  //   atwood:   dy = sign·½·a·t² (clamped) — connected blocks accelerating in opposite directions.
  // Only applies when the body is NOT attached to a surface; attached bodies are anchored by the surface registry.
  var animDx = 0;
  var animDy = 0;
  var animRotDeg = 0;
  var animOpacityMultiplier = 1;
  if (spec.animation && spec.animation.type === 'fade_in') {
    var faDelay = spec.animation.delay_sec || 0;
    var faDur = spec.animation.duration_sec || 0.8;
    var faT = (PM_simClockMs) / 1000;
    var faP = Math.max(0, Math.min(1, (faT - faDelay) / faDur));
    animOpacityMultiplier = faP;
  }
  // Horizontal slide animations work for BOTH attached and unattached bodies
  // (the body moves along its surface or freely on the canvas). Applied below
  // before the attachment-restricted animation block so attach_to_surface +
  // slide compose correctly.
  if (spec.animation && (spec.animation.type === 'slide_horizontal'
       || spec.animation.type === 'slide_when_kinetic')) {
    var slideTSec = (PM_simClockMs) / 1000;
    var slideAcc = 0;
    // Track whether accel came from an expression in m/s² (so we can do
    // directional decomposition correctly using the same px/m scale).
    var slideUsedExpr = false;
    var slidePxPerMeter = (typeof spec.animation.px_per_meter === 'number')
      ? spec.animation.px_per_meter : 60;
    if (spec.animation.type === 'slide_horizontal') {
      // Default branch: fixed pixels-per-second² (legacy). Authors who want
      // the block to track live slider variables (Sim 2 STATE_7 try-it) can
      // pass accel_expr like "F / m" -- evaluated each frame against the
      // latest variables, then scaled by px_per_meter.
      if (typeof spec.animation.accel_expr === 'string') {
        var liveVarsSlide = PM_liveVarsWithDerived();
        var aSlideMs2 = PM_safeEval(spec.animation.accel_expr, liveVarsSlide);
        if (isFinite(aSlideMs2) && aSlideMs2 >= 0) {
          slideAcc = aSlideMs2 * slidePxPerMeter;
          slideUsedExpr = true;
        } else {
          slideAcc = 0;
        }
      } else {
        slideAcc = (typeof spec.animation.accel_px_per_sec2 === 'number')
          ? spec.animation.accel_px_per_sec2 : 150;
      }
    } else {
      // slide_when_kinetic: accel = (F - mu_k * m * g) / m, only when F > mu_s * m * g
      var liveVarsK = PM_liveVarsWithDerived();
      var Fv = liveVarsK.F || 0;
      var muS = liveVarsK.mu_s || 0;
      var muK = liveVarsK.mu_k || 0;
      var mv = liveVarsK.m || 1;
      var gv = 9.8;
      var slipping = Fv > muS * mv * gv;
      if (slipping) {
        var aMs2 = (Fv - muK * mv * gv) / mv;
        if (typeof spec.animation.accel_expr === 'string') {
          var aE = PM_safeEval(spec.animation.accel_expr, liveVarsK);
          if (isFinite(aE)) aMs2 = aE;
        }
        var ppmK = spec.animation.px_per_meter || 60;
        slideAcc = Math.max(0, aMs2 * ppmK);
      } else {
        slideAcc = 0;
      }
    }
    var loopT = (typeof spec.animation.loop_period_sec === 'number')
      ? spec.animation.loop_period_sec : 0;
    var slideMaxDx = (typeof spec.animation.max_dx === 'number') ? spec.animation.max_dx : 100;
    var slidePhaseT = loopT > 0 ? (slideTSec % loopT) : slideTSec;
    var slideRaw = 0.5 * slideAcc * slidePhaseT * slidePhaseT;
    var slideDist = Math.min(slideRaw, slideMaxDx);
    // Optional direction expression (degrees, math-convention: 0° = +x, 90° = +y in physics).
    // When present, decompose the kinematic distance into x/y components so the block
    // slides at angle θ from horizontal — needed for STATE_7's theta_F slider.
    if (typeof spec.animation.direction_deg_expr === 'string') {
      var liveVarsDir = PM_liveVarsWithDerived();
      var thetaDirDeg = PM_safeEval(spec.animation.direction_deg_expr, liveVarsDir);
      if (isFinite(thetaDirDeg)) {
        var thetaDirRad = thetaDirDeg * Math.PI / 180;
        animDx = slideDist * Math.cos(thetaDirRad);
        // p5's y-axis points DOWN, but physics positive theta means UP — negate.
        animDy = -slideDist * Math.sin(thetaDirRad);
      } else {
        animDx = slideDist;
      }
    } else {
      animDx = slideDist;
    }
    // Suppress lint about unused tracking flag — it documents the branch taken.
    void slideUsedExpr;
  }

  if (!attachedPos && spec.animation && spec.animation.type) {
    var tSec = (PM_simClockMs) / 1000;
    if (spec.animation.type === 'free_fall') {
      var durS = (spec.animation.duration_ms || 2500) / 1000;
      var tEff = Math.min(tSec, durS);
      var gAcc = spec.animation.g || 9.8;
      var ppm = spec.animation.pixels_per_meter || 60;
      animDy = 0.5 * gAcc * tEff * tEff * ppm;
      if (spec.animation.max_fall_px != null) animDy = Math.min(animDy, spec.animation.max_fall_px);
      if (spec.animation.max_dy != null) animDy = Math.min(animDy, spec.animation.max_dy);
    } else if (spec.animation.type === 'pendulum') {
      var period = spec.animation.period_sec || 2.4;
      var ampRad = (spec.animation.amplitude_deg || 8) * Math.PI / 180;
      var L = spec.animation.length_px || 120;
      var thetaNow = ampRad * Math.cos(2 * Math.PI * tSec / period);
      // Pivot at (x, y - L) relative to the authored rest position. Bob swings
      // sideways by L·sin θ and rises by L·(1 − cos θ) (negative dy in p5's y-down system).
      animDx = L * Math.sin(thetaNow);
      animDy = -L * (1 - Math.cos(thetaNow));
    } else if (spec.animation.type === 'atwood') {
      var liveVars = PM_liveVarsWithDerived();
      var aPx = spec.animation.accel_px_per_sec2 || 60;
      if (typeof spec.animation.accel_expr === 'string') {
        var evalA = PM_safeEval(spec.animation.accel_expr, liveVars);
        if (isFinite(evalA)) aPx = Math.abs(evalA);
      }
      var sign = (spec.animation.sign != null) ? spec.animation.sign : 1;
      if (typeof spec.animation.sign_expr === 'string') {
        var evalSign = PM_safeEval(spec.animation.sign_expr, liveVars);
        if (isFinite(evalSign)) sign = (evalSign === 0) ? 0 : (evalSign > 0 ? 1 : -1);
      }
      var off = 0.5 * aPx * tSec * tSec;
      var maxOff = spec.animation.max_offset_px;
      if (maxOff != null) off = Math.min(off, maxOff);
      animDy = sign * off;
    } else if (spec.animation.type === 'door_swing') {
      // Oscillates between 0 and peak_deg with a smooth (1-cos)/2 shape so the
      // door starts at rest, opens to peak, closes back, and repeats.
      var doorPeriod = spec.animation.period_sec || 4.0;
      var doorPeak = (typeof spec.animation.peak_deg === 'number') ? spec.animation.peak_deg : 35;
      var doorPhase = (1 - Math.cos(2 * Math.PI * tSec / doorPeriod)) / 2;
      animRotDeg = doorPhase * doorPeak;
    } else if (spec.animation.type === 'translate') {
      // Smooth one-shot slide from authored position by (dx_px, dy_px) over
      // duration_sec with optional delay_sec. Clamped at the end so the body
      // settles at the target. Good for FBD isolation (A slides up, C slides down).
      var trDelay = spec.animation.delay_sec || 0;
      var trDur = spec.animation.duration_sec || 1.2;
      var trT = Math.max(0, Math.min(1, (tSec - trDelay) / trDur));
      // ease-out cubic for a natural settle
      var trEase = 1 - Math.pow(1 - trT, 3);
      animDx = (spec.animation.dx_px || 0) * trEase;
      animDy = (spec.animation.dy_px || 0) * trEase;
    } else if (spec.animation.type === 'projectile') {
      // Physics-correct parabolic motion: x = vx·t (linear),
      // y = -vy0·t + 0.5·ay·t² (quadratic, canvas y-down convention).
      // - vx_px_per_sec:           horizontal velocity (px/s, positive = rightward)
      // - vy_initial_px_per_sec:   initial vertical velocity (px/s, positive = UPWARD; canvas
      //                            y-down convention applies a negative sign so the ball goes UP first
      //                            then back DOWN under gravity, like a real thrown ball)
      // - ay_px_per_sec2:          vertical acceleration (px/s², positive = downward / gravity)
      // - loop_period_sec:         optional loop period; without it, settles at the end of the arc
      // - max_dx / max_dy:         positive clamps for the descent / horizontal range
      // - min_dy:                  most-negative dy clamp (limits how high the ball rises)
      var pjVx = spec.animation.vx_px_per_sec || 80;
      var pjVy0 = spec.animation.vy_initial_px_per_sec || 0;   // 0 = pure horizontal-launch projectile (perpendicular F)
      var pjAy = spec.animation.ay_px_per_sec2 || 200;
      var pjLoop = spec.animation.loop_period_sec || 0;
      var pjMaxDx = spec.animation.max_dx;
      var pjMaxDy = spec.animation.max_dy;
      var pjMinDy = spec.animation.min_dy;
      var pjPhaseT = pjLoop > 0 ? (tSec % pjLoop) : tSec;
      var pjDx = pjVx * pjPhaseT;
      // Canvas y increases downward — initial UPWARD velocity reduces dy (negative contribution),
      // gravity adds positive (downward) contribution that grows as t².
      var pjDy = -pjVy0 * pjPhaseT + 0.5 * pjAy * pjPhaseT * pjPhaseT;
      if (typeof pjMaxDx === 'number') pjDx = Math.min(pjDx, pjMaxDx);
      if (typeof pjMaxDy === 'number') pjDy = Math.min(pjDy, pjMaxDy);
      if (typeof pjMinDy === 'number') pjDy = Math.max(pjDy, pjMinDy);
      animDx = pjDx;
      animDy = pjDy;
    }
  }
  // Apply animation deltas to pos (works for both attached and unattached bodies
  // — slide_horizontal / slide_when_kinetic compose with attach_to_surface so
  // a sliding block stays on the floor while moving along it).
  if (animDx !== 0 || animDy !== 0) {
    pos = { x: pos.x + animDx, y: pos.y + animDy };
  }

  var safeX = Math.min(Math.max(pos.x, 40), 720);
  var safeY = Math.min(Math.max(pos.y, 40), 460);
  var rgb = PM_hexToRgb(spec.fill_color || '#6B7280');

  // Rotation resolution: explicit JSON rotation wins; otherwise inherit surface tilt
  // (surface angle is math-CCW, p5 rotate is canvas-CW → negate when inheriting).
  var rotDeg;
  if (typeof spec.rotation_deg === 'number') rotDeg = spec.rotation_deg;
  else if (attachedPos) rotDeg = -surfaceAngleDeg;
  else if (spec.animation && spec.animation.type === 'rotate_continuous') {
    rotDeg = PM_rotateContinuousDeg(spec.animation);
  } else rotDeg = 0;
  var rotRad = rotDeg * Math.PI / 180;

  var bw = 60, bh = 60;
  var isRect = (spec.shape === 'rect' && spec.size && typeof spec.size === 'object');
  var isCircle = (spec.shape === 'circle' && typeof spec.size === 'number');
  var isStickman = (spec.shape === 'stickman' && typeof spec.size === 'number');
  var isTree = (spec.shape === 'tree' && spec.size && typeof spec.size === 'object');
  var isPulley = (spec.shape === 'pulley' && typeof spec.size === 'number');
  var isDoor = (spec.shape === 'door' && spec.size && typeof spec.size === 'object');
  if (isRect) { bw = spec.size.w; bh = spec.size.h; }
  else if (isCircle) { bw = spec.size; bh = spec.size; }
  else if (isStickman) { bw = spec.size * 0.5; bh = spec.size; }
  else if (isTree) { bw = spec.size.w; bh = spec.size.h; }
  else if (isPulley) { bw = spec.size; bh = spec.size; }
  else if (isDoor) { bw = spec.size.w; bh = spec.size.h; }

  // Resolve label once: prefer label_expr (interactive scenes like
  // field_forces STATE_5 use "m = {m} kg"), fall back to static label.
  var labelText = spec.label_expr
    ? PM_interpolate(String(spec.label_expr))
    : (spec.label != null ? PM_interpolate(String(spec.label)) : '');

  push();
  var effectiveOpacity = (spec.opacity != null ? spec.opacity : 1) * animOpacityMultiplier;
  fill(rgb[0], rgb[1], rgb[2], effectiveOpacity * 255);
  if (spec.border_color) {
    var brgb = PM_hexToRgb(spec.border_color);
    stroke(brgb[0], brgb[1], brgb[2]);
    strokeWeight(spec.border_width || 1);
  } else {
    noStroke();
  }

  var cx, cy;
  if (attachedPos) {
    // Base-anchored path: (safeX, safeY) is on the surface. Rotate around it.
    translate(safeX, safeY);
    rotate(rotRad);
    if (isRect) {
      rect(-bw / 2, -bh, bw, bh, 4);
      if (labelText) {
        fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(12);
        text(labelText, 0, -bh / 2);
      }
    } else if (isCircle) {
      circle(0, -bw / 2, spec.size);
      if (labelText) {
        fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(12);
        text(labelText, 0, -bw / 2);
      }
    } else if (isStickman) {
      drawStickman(0, 0, spec.size, rgb);
      if (labelText) {
        fill(220); noStroke(); textAlign(CENTER, TOP); textSize(11);
        text(labelText, 0, 6);
      }
    }
    // Transform local (0, -bh/2) to world for registry center
    var offY = isRect ? (-bh / 2) : (isCircle ? -bw / 2 : -bh / 2);
    cx = safeX + (0 * Math.cos(rotRad) - offY * Math.sin(rotRad));
    cy = safeY + (0 * Math.sin(rotRad) + offY * Math.cos(rotRad));
  } else if (rotDeg !== 0) {
    cx = isRect ? (safeX + bw / 2) : safeX;
    cy = isRect ? (safeY + bh / 2) : safeY;
    translate(cx, cy);
    rotate(rotRad);
    if (isRect) rect(-bw / 2, -bh / 2, bw, bh, 4);
    else if (isCircle) circle(0, 0, spec.size);
    else if (isStickman) drawStickman(0, bh / 2, spec.size, rgb);
    if (labelText) {
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(12);
      text(labelText, 0, 0);
    }
  } else {
    // Center point — box-shaped primitives (rect/tree/door) anchor at
    // (safeX, safeY) as top-left; circle/stickman/pulley anchor at center.
    var isBoxed = isRect || isTree || isDoor;
    cx = isBoxed ? (safeX + bw / 2) : safeX;
    cy = isBoxed ? (safeY + bh / 2) : safeY;
    if (isRect) rect(safeX, safeY, bw, bh, 4);
    else if (isCircle) circle(safeX, safeY, spec.size);
    else if (isStickman) drawStickman(safeX, safeY, spec.size, rgb);
    else if (isTree) {
      // Trunk: centered brown rect, bottom 30% of bh, width ~25% of bw.
      var trunkW = Math.max(12, bw * 0.22);
      var trunkH = bh * 0.32;
      var trunkX = safeX + (bw - trunkW) / 2;
      var trunkY = safeY + bh - trunkH;
      noStroke();
      fill(146, 64, 14); // #92400E
      rect(trunkX, trunkY, trunkW, trunkH, 2);
      // Canopy: 3 overlapping ellipses in the top 70% of bh — dark base, mid, highlight.
      var canopyCY = safeY + bh * 0.30;
      var canopyW = bw;
      var canopyH = bh * 0.55;
      noStroke();
      fill(22, 163, 74); // #16A34A dark base
      ellipse(safeX + bw / 2, canopyCY + canopyH * 0.18, canopyW, canopyH);
      fill(34, 197, 94); // #22C55E mid
      ellipse(safeX + bw * 0.32, canopyCY, canopyW * 0.75, canopyH * 0.85);
      ellipse(safeX + bw * 0.68, canopyCY, canopyW * 0.75, canopyH * 0.85);
      fill(134, 239, 172, 180); // #86EFAC highlight
      ellipse(safeX + bw * 0.5, canopyCY - canopyH * 0.15, canopyW * 0.55, canopyH * 0.5);
      // Optional fruit dots.
      if (spec.fruit_color) {
        var frgb = PM_hexToRgb(spec.fruit_color);
        fill(frgb[0], frgb[1], frgb[2]);
        var fruitR = Math.max(4, bw * 0.05);
        circle(safeX + bw * 0.30, canopyCY + canopyH * 0.15, fruitR * 2);
        circle(safeX + bw * 0.70, canopyCY + canopyH * 0.20, fruitR * 2);
        circle(safeX + bw * 0.50, canopyCY + canopyH * 0.05, fruitR * 2);
      }
    }
    else if (isPulley) {
      // Wheel: outer circle filled, hub ring, axle dot.
      var r = spec.size / 2;
      fill(rgb[0], rgb[1], rgb[2]);
      stroke(30, 41, 59);
      strokeWeight(2);
      circle(safeX, safeY, spec.size);
      noFill();
      stroke(30, 41, 59);
      strokeWeight(1.5);
      circle(safeX, safeY, r); // hub ring
      noStroke();
      fill(15, 23, 42);
      circle(safeX, safeY, Math.max(4, r * 0.25)); // axle
    }
    else if (isDoor) {
      // If an animation rotation is active (door_swing), pivot around the
      // hinge edge so the door opens/closes naturally rather than spinning in place.
      var hingeOnLeft = (spec.hinge_side !== 'right');
      var doorSwinging = (animRotDeg !== 0);
      if (doorSwinging) {
        var pivotX = hingeOnLeft ? safeX : (safeX + bw);
        var pivotY = safeY + bh / 2;
        push();
        translate(pivotX, pivotY);
        rotate(animRotDeg * Math.PI / 180);
        translate(-pivotX, -pivotY);
      }
      // Door panel + vertical seam, handle circle, hinge pin dot.
      fill(rgb[0], rgb[1], rgb[2]);
      noStroke();
      rect(safeX, safeY, bw, bh, 3);
      // Decorative inner panel seam (2 recessed rectangles).
      noFill();
      stroke(0, 0, 0, 60);
      strokeWeight(1);
      rect(safeX + bw * 0.15, safeY + bh * 0.1, bw * 0.7, bh * 0.35, 2);
      rect(safeX + bw * 0.15, safeY + bh * 0.55, bw * 0.7, bh * 0.35, 2);
      // Handle near the right edge (assumes hinge on the left).
      var handleX = hingeOnLeft ? (safeX + bw - 10) : (safeX + 10);
      var handleY = safeY + bh * 0.5;
      noStroke();
      fill(234, 179, 8); // amber-500 brass handle
      circle(handleX, handleY, 8);
      // Hinge pin(s) on the opposite edge.
      var pinX = hingeOnLeft ? (safeX + 2) : (safeX + bw - 2);
      fill(55, 65, 81);
      circle(pinX, safeY + bh * 0.2, 5);
      circle(pinX, safeY + bh * 0.8, 5);
      if (doorSwinging) pop();
    }
    if (labelText) {
      fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(12);
      var labelY;
      if (isStickman) labelY = safeY + 14;
      else if (isTree) labelY = safeY + bh + 10;
      else if (isPulley) labelY = safeY + spec.size / 2 + 14;
      else if (spec.label_below && isCircle) labelY = safeY + spec.size / 2 + 12;
      else if (spec.label_below && (isRect || isBoxed)) labelY = safeY + bh + 12;
      else if (spec.label_above && (isRect || isBoxed)) labelY = safeY - 10;
      else labelY = cy;
      text(labelText, cx, labelY);
    }
  }
  pop();

  if (spec.id) {
    PM_bodyRegistry[spec.id] = {
      x: safeX, y: safeY, w: bw, h: bh, shape: spec.shape,
      cx: cx, cy: cy, rotation_deg: rotDeg
    };
  }
}

function drawLabel(spec) {
  if (!spec || !(spec._solverPosition || spec.position)) return;
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  // Support both spec.text (literal) and spec.text_expr (template with {var}
  // interpolation for live values like regime indicators).
  var resolved = PM_interpolate(spec.text_expr || spec.text || '');
  if (!resolved) return;
  // Phase 2 solver: prefer solver-resolved position when host wrote one.
  var pos = spec._solverPosition || spec.position;
  var size = spec.font_size || 14;
  var color = spec.color || '#D4D4D8';
  var rgb = PM_hexToRgb(color);
  var emph = PM_focalEmphasis(spec);

  push();
  noStroke();
  fill(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * emph.alphaMul);
  textSize(size);
  textAlign(CENTER, CENTER);
  if (spec.bold) textStyle(BOLD); else textStyle(NORMAL);
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = color;
    drawingContext.shadowBlur = emph.glowPx;
  }

  var lines = String(resolved).split('\\n');
  var lineH = size * 1.25;
  var startY = pos.y - ((lines.length - 1) * lineH) / 2;
  for (var i = 0; i < lines.length; i++) {
    text(lines[i], pos.x, startY + i * lineH);
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  textStyle(NORMAL);
  pop();
}

function drawAnnotation(spec) {
  if (!spec || !(spec._solverPosition || spec.position)) return;
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var resolved = PM_interpolate(spec.text || '');
  if (!resolved) return;
  var pos = spec._solverPosition || spec.position;
  var size = 12;
  var emph = PM_focalEmphasis(spec);
  var color = spec.color || '#94A3B8';
  var rgb = PM_hexToRgb(color);
  var lines = String(resolved).split('\\n');
  var lineH = size * 1.35;

  push();
  textSize(size);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);

  // Measure widest line for callout bubble width
  var maxW = 0;
  for (var i = 0; i < lines.length; i++) {
    var w = textWidth(lines[i]);
    if (w > maxW) maxW = w;
  }
  var padX = 8, padY = 6;
  var boxW = maxW + padX * 2;
  var boxH = lines.length * lineH + padY * 2;

  // Right-edge clamp — canvas is 760 wide. Shift left so the callout never
  // overflows the panel. Also clamp the top edge to at least y = padY.
  var CANVAS_RIGHT_A = 760;
  var annX = pos.x;
  if (annX + maxW + padX + 4 > CANVAS_RIGHT_A) {
    annX = Math.max(padX + 4, CANVAS_RIGHT_A - maxW - padX - 4);
  }
  var annY = pos.y;

  if (emph.glowPx > 0) {
    drawingContext.shadowColor = color;
    drawingContext.shadowBlur = emph.glowPx;
  }

  if (spec.style === 'callout') {
    noStroke();
    fill(20, 25, 40, 210 * gate.alpha * emph.alphaMul);
    rect(annX - padX, annY - padY, boxW, boxH, 6);
    stroke(rgb[0], rgb[1], rgb[2], 180 * gate.alpha * emph.alphaMul); strokeWeight(1);
    noFill();
    rect(annX - padX, annY - padY, boxW, boxH, 6);
  }

  noStroke();
  fill(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * emph.alphaMul);
  for (var j = 0; j < lines.length; j++) {
    text(lines[j], annX, annY + j * lineH);
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

function drawSurface(spec) {
  // appear_at_ms / disappear_at_ms gating — surfaces (floors, ground references)
  // can fade in / out per-state for cinematic choreography.
  var surfGate = PM_animationGate(spec);
  if (!surfGate.visible) return;
  var pos = spec.position || { x: 100, y: 400 };
  var length = spec.length || 200;
  var orientation = spec.orientation || 'horizontal';
  var texture = spec.texture || 'smooth';

  // Resolve angle: numeric angle wins, otherwise angle_expr looks up current vars
  // (PM_physics.variables tracks the slider; default_variables is the fallback).
  var angle = 0;
  if (typeof spec.angle === 'number') angle = spec.angle;
  else if (typeof spec.angle_expr === 'string') {
    var vars = PM_liveVarsWithDerived();
    angle = (typeof vars[spec.angle_expr] === 'number') ? vars[spec.angle_expr] : 30;
  }

  var x1 = pos.x, y1 = pos.y, x2 = x1, y2 = y1;
  if (orientation === 'horizontal') { x2 = x1 + length; y2 = y1; }
  else if (orientation === 'vertical') { x2 = x1; y2 = y1 - length; }
  else if (orientation === 'inclined') {
    var rad = angle * Math.PI / 180;
    x2 = x1 + length * Math.cos(rad);
    y2 = y1 - length * Math.sin(rad);  // canvas y-down → negative goes up
  }

  push();
  stroke(148, 163, 184); strokeWeight(3);
  line(x1, y1, x2, y2);

  if (texture === 'rough') {
    stroke(100, 116, 139); strokeWeight(1);
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      var ux = dx / len, uy = dy / len;       // unit along surface
      var px = uy, py = -ux;
      if (orientation === 'vertical') { px = -1; py = 0; }
      var step = 15, hatch = 8;
      for (var d = 0; d <= len; d += step) {
        var sx = x1 + ux * d, sy = y1 + uy * d;
        var ex = sx + px * hatch + ux * hatch * 0.5;
        var ey = sy + py * hatch + uy * hatch * 0.5;
        line(sx, sy, ex, ey);
      }
    }
  }

  // Unified label interpolation — applies to both label and label_expr fields.
  var rawLabel = (spec.label_expr != null) ? spec.label_expr : spec.label;
  if (rawLabel) {
    var labelText = PM_interpolate(String(rawLabel));
    noStroke(); fill(148, 163, 184); textSize(11); textAlign(LEFT, TOP);
    text(labelText, x1 + 4, y1 + 6);
  }
  pop();

  // Register surface geometry for attach_to_surface lookups (P6) + x1/y1 so
  // PM_resolveAnchor can answer "surface_id.start|mid|end" for vectors.
  if (spec.id) {
    PM_surfaceRegistry[spec.id] = {
      x0: pos.x, y0: pos.y,
      x1: x2, y1: y2,
      length: length,
      orientation: orientation,
      angle_deg: angle,
      // Engine 20: friction coefficients propagate to registry so the
      // motion integrator can read without re-scanning scene_composition.
      friction: spec.friction || { mu_s: 0, mu_k: 0 }
    };
  }
}

function drawForceArrow(spec, physics, origin) {
  // Three draw paths in priority order:
  //   1. spec.force_id or spec.id matches a physics force → use that force's
  //      vector and label (engine-driven, e.g. hinge_H in interactive STATE_5).
  //   2. spec has magnitude / magnitude_expr / direction_deg → synthesize a
  //      force from the spec itself (authored arrows that don't depend on the
  //      engine, e.g. "external load F_ext = 30 N" prop in STATE_3).
  //   3. Fall back to the first physics force (legacy compat — avoid relying
  //      on this; prefer 1 or 2).
  //   0. (checked FIRST) explicit geometry — from/from_expr → to/to_expr — a
  //      literal segment between two resolved points. See the block below.

  // Path 0 — explicit geometry (highest priority). An arrow authored with an
  // endpoint pair (from/from_expr → to/to_expr) is a LITERAL segment between two
  // resolved points: contact_forces STATE_4's FBD components (N/f/F, each a
  // distinct from→to), and normal_reaction's "{x: 310, y: 370 - N*4}" stacked
  // reactions. These carry no force_id match and no magnitude, so the physics
  // paths below would collapse ALL of them onto physics.forces[0] (the bug). Draw
  // the segment directly and return. Only force_arrows that authored to/to_expr
  // enter here, so magnitude-driven arrows are unaffected.
  var _hasGeomTo = (spec.to && typeof spec.to.x === 'number' && typeof spec.to.y === 'number')
    || (typeof spec.to_expr === 'string');
  if (_hasGeomTo) {
    var gLive = PM_liveVarsWithDerived();
    var gFrom = PM_resolveArrowPoint(spec.from, spec.from_expr, gLive) || { x: origin.x, y: origin.y };
    var gTo = PM_resolveArrowPoint(spec.to, spec.to_expr, gLive);
    if (!gTo) return;                              // unresolvable endpoint → draw nothing, not a wrong arrow
    var gGate = PM_animationGate(spec);
    if (!gGate.visible) return;
    var gEmph = PM_focalEmphasis(spec);
    var gColor = spec.color || '#EF4444';
    var gRgb = PM_hexToRgb(gColor);
    var gx1 = gFrom.x, gy1 = gFrom.y;              // grow from origin toward the endpoint as the reveal gate opens
    var gx2 = gFrom.x + (gTo.x - gFrom.x) * gGate.alpha;
    var gy2 = gFrom.y + (gTo.y - gFrom.y) * gGate.alpha;
    if (spec.id) PM_endpointRegistry[spec.id] = { origin: { x: gx1, y: gy1 }, tip: { x: gx2, y: gy2 } };
    var gA = 255 * gGate.alpha * gEmph.alphaMul;
    push();
    if (gEmph.glowPx > 0) { drawingContext.shadowColor = gColor; drawingContext.shadowBlur = gEmph.glowPx; }
    stroke(gRgb[0], gRgb[1], gRgb[2], gA); strokeWeight(2);
    fill(gRgb[0], gRgb[1], gRgb[2], gA);
    var gAng = Math.atan2(gy2 - gy1, gx2 - gx1);
    var gHead = 12;
    line(gx1, gy1, gx2, gy2);
    noStroke();
    triangle(gx2, gy2,
      gx2 - gHead * Math.cos(gAng - Math.PI / 6), gy2 - gHead * Math.sin(gAng - Math.PI / 6),
      gx2 - gHead * Math.cos(gAng + Math.PI / 6), gy2 - gHead * Math.sin(gAng + Math.PI / 6));
    fill(gRgb[0], gRgb[1], gRgb[2], gA); noStroke(); textSize(12);
    var gLabel = spec.label_override ? PM_interpolate(spec.label_override)
      : (typeof spec.label === 'string' && spec.label.length > 0) ? spec.label
      : (spec.label_expr ? PM_interpolate(String(spec.label_expr)) : '');
    var glx, gly;
    if (spec.label_position === 'perpendicular') {
      var gmx = (gx1 + gx2) / 2, gmy = (gy1 + gy2) / 2;
      var gperp = (typeof spec.label_perp_offset === 'number') ? spec.label_perp_offset : 14;
      glx = gmx + -Math.sin(gAng) * gperp; gly = gmy + Math.cos(gAng) * gperp;
      textAlign(CENTER, CENTER);
    } else { glx = gx2 + 6; gly = gy2; textAlign(LEFT, CENTER); }
    if (spec.label_offset && typeof spec.label_offset === 'object') {
      if (typeof spec.label_offset.dx === 'number') glx += spec.label_offset.dx;
      if (typeof spec.label_offset.dy === 'number') gly += spec.label_offset.dy;
    }
    text(gLabel, glx, gly);
    if (gEmph.glowPx > 0) { drawingContext.shadowColor = 'transparent'; drawingContext.shadowBlur = 0; }
    pop();
    return;
  }

  var force = null;
  for (var i = 0; i < physics.forces.length; i++) {
    if (physics.forces[i].id === spec.force_id || physics.forces[i].id === spec.id) { force = physics.forces[i]; break; }
  }
  var specHasMagnitude = (typeof spec.magnitude === 'number')
    || (typeof spec.magnitude_expr === 'string');
  if (!force && specHasMagnitude) {
    // Build a self-contained force from spec.magnitude + spec.direction_deg.
    var liveVars = PM_liveVarsWithDerived();
    var mag;
    if (typeof spec.magnitude_expr === 'string') {
      var mEval = PM_safeEval(spec.magnitude_expr, liveVars);
      mag = isFinite(mEval) ? mEval : 0;
    } else {
      mag = spec.magnitude;
    }
    var dirDeg;
    if (typeof spec.direction_deg_expr === 'string') {
      var dEval = PM_safeEval(spec.direction_deg_expr, liveVars);
      dirDeg = isFinite(dEval) ? dEval : 0;
    } else {
      dirDeg = (typeof spec.direction_deg === 'number') ? spec.direction_deg : 0;
    }
    // direction_deg is physics-y-up convention (0 = +x, 90 = +y / up on screen).
    var rad = dirDeg * Math.PI / 180;
    var labelText = spec.label_expr ? PM_interpolate(String(spec.label_expr))
      : (spec.label || '');
    force = {
      id: spec.id || '_synth',
      label: labelText,
      vector: { x: mag * Math.cos(rad), y: mag * Math.sin(rad), magnitude: mag, angle_deg: dirDeg },
      color: spec.color || '#EF4444',
      show: true
    };
  }
  if (!force && physics.forces.length > 0) force = physics.forces[0];
  if (!force || !force.show) return;

  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);

  // spec.animation.type === 'translate' (peter_parker:renderer_primitives,
  // 2026-07-24 — "carry a vector parallel to itself" beat, e.g.
  // vector_addition_law STATE_2's tail-on-head B carry). Offsets the
  // ALREADY-RESOLVED origin only — magnitude/direction below are computed
  // purely from force.vector and never touched, so the arrow's length and
  // heading stay visibly frozen while it rigidly slides. Mirrors drawBody's
  // 'translate' branch's easing/delay/duration/clamp conventions exactly
  // (one timing vocabulary across primitive types) and is a pure function
  // of PM_simClockMs (Rule 36) so SET_TIME_FREEZE frozen captures stay
  // deterministic by construction. Composes with every origin-resolution
  // path (from literal / origin_body_id / anchor_to / *_expr) because it
  // offsets the caller-resolved 'origin' param, not any one resolution path.
  var arrowAnimDx = 0, arrowAnimDy = 0;
  if (spec.animation && spec.animation.type === 'translate') {
    var faTSec = PM_simClockMs / 1000;
    var faTrDelay = spec.animation.delay_sec || 0;
    var faTrDur = spec.animation.duration_sec || 1.2;
    var faTrT = Math.max(0, Math.min(1, (faTSec - faTrDelay) / faTrDur));
    var faTrEase = 1 - Math.pow(1 - faTrT, 3); // ease-out cubic — same as drawBody
    arrowAnimDx = (spec.animation.dx_px || 0) * faTrEase;
    arrowAnimDy = (spec.animation.dy_px || 0) * faTrEase;
  }

  var scale = spec.scale_pixels_per_unit || 5;
  var color = spec.color || force.color || '#EF4444';
  var rgb = PM_hexToRgb(color);

  // Physics y-up → canvas y-down: flip y. Multiply by gate.alpha so the arrow
  // grows from its origin to its tip as it reveals.
  var dx = force.vector.x * scale * gate.alpha;
  var dy = -force.vector.y * scale * gate.alpha;
  var x1 = origin.x + arrowAnimDx, y1 = origin.y + arrowAnimDy;
  var x2 = x1 + dx, y2 = y1 + dy;

  // WP-R5 (D5 anchor_to) — register this arrow's live endpoints so a LATER
  // primitive in the same state's scene_composition can chain off them (a
  // second leg vector's origin = this arrow's tip). Registered post-resolve
  // so a synthesized spec.magnitude/spec.direction_deg arrow exposes the
  // point it actually draws to, not a re-derivation of it.
  if (spec.id) {
    PM_endpointRegistry[spec.id] = { origin: { x: x1, y: y1 }, tip: { x: x2, y: y2 } };
  }

  push();
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = color;
    drawingContext.shadowBlur = emph.glowPx;
  }
  stroke(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * emph.alphaMul); strokeWeight(2);
  fill(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * emph.alphaMul);

  var angle = Math.atan2(dy, dx);
  var headLen = 12;
  var hx1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
  var hy1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
  var hx2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
  var hy2 = y2 - headLen * Math.sin(angle + Math.PI / 6);
  line(x1, y1, x2, y2);
  noStroke();
  triangle(x2, y2, hx1, hy1, hx2, hy2);

  // Label near arrow tip. Default is "right of tip, same y".
  // spec.label_offset: { dx, dy } overrides defaults (per-arrow nudge in JSON).
  // spec.label_position: 'perpendicular' places label at arrow midpoint
  //   offset perpendicular to the arrow direction — use for cramped FBDs where
  //   multiple arrows share an origin.
  fill(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * emph.alphaMul); noStroke(); textSize(12);
  // Label priority (tightest wins):
  //   1. spec.label_override — interpolated template, dynamic per state
  //   2. spec.label          — author's literal label from the concept JSON
  //                            (e.g. "mg = 588 N" for the 60 kg stickman state)
  //   3. force.label         — engine-computed fallback when neither is set
  // Older code only fell through to 1 and 3, so authored literal labels were
  // silently overridden by engine defaults — the "588 vs 19.6 N" mismatch.
  var arrowLabel = spec.label_override ? PM_interpolate(spec.label_override)
    : (typeof spec.label === 'string' && spec.label.length > 0) ? spec.label
    : (force.label || '');
  var lx, ly;
  if (spec.label_position === 'perpendicular') {
    var midX = (x1 + x2) / 2;
    var midY = (y1 + y2) / 2;
    var perpOff = (typeof spec.label_perp_offset === 'number') ? spec.label_perp_offset : 14;
    lx = midX + -Math.sin(angle) * perpOff;
    ly = midY + Math.cos(angle) * perpOff;
    textAlign(CENTER, CENTER);
  } else {
    lx = x2 + 6;
    ly = y2;
    textAlign(LEFT, CENTER);
  }
  if (spec.label_offset && typeof spec.label_offset === 'object') {
    if (typeof spec.label_offset.dx === 'number') lx += spec.label_offset.dx;
    if (typeof spec.label_offset.dy === 'number') ly += spec.label_offset.dy;
  }
  text(arrowLabel, lx, ly);
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// Dashed line helper — used by drawForceComponents to distinguish components from the primary force vector.
function PM_dashedLine(x1, y1, x2, y2, dashLen) {
  var dx = x2 - x1, dy = y2 - y1;
  var len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) return;
  var ux = dx / len, uy = dy / len;
  var on = true;
  for (var d = 0; d < len; d += dashLen) {
    var nd = Math.min(d + dashLen, len);
    if (on) line(x1 + ux * d, y1 + uy * d, x1 + ux * nd, y1 + uy * nd);
    on = !on;
  }
}

// Decompose a force vector into two dashed component arrows, animated in from 0 to full length
// over spec.animate_in_ms (default 600ms) on state entry. Labels show the live magnitude so
// dragging a slider causes the component values to update smoothly.
//
// spec.decompose_axis (optional):
//   "world_xy"                    — default, parallel=world x, perpendicular=world y
//   "along_surface:{surface_id}"  — parallel=along surface, perpendicular=outward from surface.
//                                   Reads angle from PM_surfaceRegistry[id].angle_deg.
//   "angle_deg:N"                 — axis1 at N degrees from world +x (CCW), axis2 = axis1+90°
//
// Label placeholders (all four are substituted in both label_x and label_y):
//   {horiz}   → |fx|    {vert}          → |fy|
//   {parallel}→ |p|     {perpendicular} → |q|
function drawForceComponents(spec, physics) {
  if (!physics || !physics.forces) return;

  var force = null;
  for (var i = 0; i < physics.forces.length; i++) {
    if (physics.forces[i].id === spec.force_id) { force = physics.forces[i]; break; }
  }
  if (!force) return;

  var scale = spec.scale_pixels_per_unit || 5;
  var origin = PM_resolveForceOrigin(
    {
      draw_from: spec.origin_anchor || force.draw_from || 'body_bottom',
      body_id: spec.origin_body_id,
      // WP-R4 (D4): thread the literal from through so force_components
      // built around a literal {x,y} origin aren't silently dropped the
      // same way bare force_arrow primitives were.
      from: spec.from
    },
    force,
    { x: 380, y: 350 }
  );

  // Resolve axis rotation from spec.decompose_axis (math-frame degrees, CCW from +x).
  // Default 0 → world x/y decomposition (backward compatible).
  var axisDeg = 0;
  var axisMode = 'world'; // 'world' | 'surface' | 'custom'
  var axisSpec = spec.decompose_axis;
  if (typeof axisSpec === 'string') {
    if (axisSpec.indexOf('along_surface:') === 0) {
      var surfId = axisSpec.substring('along_surface:'.length);
      var surf = PM_surfaceRegistry[surfId];
      if (surf && typeof surf.angle_deg === 'number') axisDeg = surf.angle_deg;
      axisMode = 'surface';
    } else if (axisSpec.indexOf('angle_deg:') === 0) {
      var n = parseFloat(axisSpec.substring('angle_deg:'.length));
      if (!isNaN(n)) axisDeg = n;
      axisMode = 'custom';
    }
    // else "world_xy" or unknown → default axisDeg=0, axisMode='world'
  }

  // Math-frame decomposition. Kept in sync with decomposeForceVector() exported above.
  var theta = axisDeg * Math.PI / 180;
  var fx = force.vector.x, fy = force.vector.y;
  var p =  fx * Math.cos(theta) + fy * Math.sin(theta); // along axis1 (parallel/up-slope)
  var q = -fx * Math.sin(theta) + fy * Math.cos(theta); // along axis2 (perpendicular/outward)

  // Canvas-space unit vectors for each axis (math y-up → canvas y-down flips sin):
  //   ax1 (parallel/up-slope):     ( cos θ, -sin θ )
  //   ax2 (perpendicular/outward): (-sin θ, -cos θ )
  var ax1x = Math.cos(theta), ax1y = -Math.sin(theta);
  var ax2x = -Math.sin(theta), ax2y = -Math.cos(theta);

  // Entry animation
  var animMs = (typeof spec.animate_in_ms === 'number') ? spec.animate_in_ms : 600;
  var elapsed = PM_simClockMs;
  var progress = animMs > 0 ? Math.min(1, Math.max(0, elapsed / animMs)) : 1;

  var pDelta = p * scale * progress;
  var qDelta = q * scale * progress;

  var color = spec.color || force.color || '#10B981';
  var rgb = PM_hexToRgb(color);

  var ox = origin.x, oy = origin.y;
  // Parallel leg tip (along ax1)
  var px = ox + pDelta * ax1x;
  var py = oy + pDelta * ax1y;
  // Perpendicular leg tip (along ax2)
  var qx = ox + qDelta * ax2x;
  var qy = oy + qDelta * ax2y;
  // Full force tip — parallelogram diagonal corner
  var tx = ox + pDelta * ax1x + qDelta * ax2x;
  var ty = oy + pDelta * ax1y + qDelta * ax2y;

  push();
  stroke(rgb[0], rgb[1], rgb[2], 220);
  strokeWeight(1.5);
  noFill();
  PM_dashedLine(ox, oy, px, py, 6);
  PM_dashedLine(ox, oy, qx, qy, 6);
  // Complete the parallelogram so both components + resultant are visible
  PM_dashedLine(px, py, tx, ty, 4);
  PM_dashedLine(qx, qy, tx, ty, 4);

  function head(tipX, tipY, baseX, baseY) {
    var ang = Math.atan2(tipY - baseY, tipX - baseX);
    var sz = 6;
    push();
    noStroke();
    fill(rgb[0], rgb[1], rgb[2], 220);
    translate(tipX, tipY);
    rotate(ang);
    triangle(0, 0, -sz, -sz / 2, -sz, sz / 2);
    pop();
  }
  if (Math.abs(pDelta) > 2) head(px, py, ox, oy);
  if (Math.abs(qDelta) > 2) head(qx, qy, ox, oy);

  // Labels — live magnitudes, fade in with the animation
  if (progress > 0.35) {
    noStroke();
    textSize(11);
    var alpha = Math.min(1, (progress - 0.35) / 0.4);
    fill(rgb[0], rgb[1], rgb[2], 255 * alpha);

    var magH = Math.abs(fx), magV = Math.abs(fy);
    var magP = Math.abs(p),  magQ = Math.abs(q);

    var defaultP = (axisMode === 'world') ? ('Fx = ' + magP.toFixed(2) + ' N') : ('F∥ = ' + magP.toFixed(2) + ' N');
    var defaultQ = (axisMode === 'world') ? ('Fy = ' + magQ.toFixed(2) + ' N') : ('F⊥ = ' + magQ.toFixed(2) + ' N');
    var labelP = spec.label_x ? PM_interpolate(spec.label_x) : defaultP;
    var labelQ = spec.label_y ? PM_interpolate(spec.label_y) : defaultQ;
    function subst(s) {
      return s
        .replace('{horiz}', magH.toFixed(2))
        .replace('{vert}', magV.toFixed(2))
        .replace('{parallel}', magP.toFixed(2))
        .replace('{perpendicular}', magQ.toFixed(2));
    }
    labelP = subst(labelP);
    labelQ = subst(labelQ);

    // Offset each label away from the parallelogram (opposite side of the rectangle corner).
    // qSign/pSign tell which side the rectangle is on.
    function sgn(v) { return v > 0 ? 1 : (v < 0 ? -1 : 1); }
    var offPx = -sgn(qDelta) * ax2x * 12, offPy = -sgn(qDelta) * ax2y * 12;
    var offQx = -sgn(pDelta) * ax1x * 12, offQy = -sgn(pDelta) * ax1y * 12;

    textAlign(CENTER, CENTER);
    text(labelP, (ox + px) / 2 + offPx, (oy + py) / 2 + offPy);
    text(labelQ, (ox + qx) / 2 + offQx, (oy + qy) / 2 + offQy);
  }
  pop();
}

// drawVector — overlay primitive, not registered. Ported from
// pcplRenderer/primitives/vector.ts. Accepts optional (ox, oy) offset for
// comparison_panel nested dispatch.
function drawVector(spec, ox, oy) {
  ox = ox || 0; oy = oy || 0;
  var rgb = PM_hexToRgb(spec.color || '#8B5CF6');
  // Endpoints: either a literal {x,y} OR a string anchor like "mass_1.top" /
  // "pulley.bottom" that resolves against the (animated) body registry so
  // ropes track bodies in motion. When spec.to is absent but spec.magnitude and
  // spec.direction_deg are provided, synthesize to = from + (cos, -sin) * mag
  // using the same physics-y-up convention as drawForceArrow
  // (0 deg = +x, 90 deg = visually up on canvas).
  // from/to may also be a point-EXPR string, e.g. from_expr:"{x: 310, y: 370 - N*4}"
  // (contact_forces' N-stacked reaction). Previously unread → the vector collapsed
  // to (0,0). Resolve it via PM_safeEvalPoint (literal/anchor paths unchanged).
  var vLive = null;
  var from = spec.from;
  if (typeof from === 'string') {
    from = PM_resolveAnchor(from, PM_bodyRegistry, PM_surfaceRegistry);
  } else if ((from == null || typeof from.x !== 'number') && typeof spec.from_expr === 'string') {
    vLive = vLive || PM_liveVarsWithDerived();
    from = PM_safeEvalPoint(spec.from_expr, vLive);
  }
  if (!from || typeof from.x !== 'number') from = { x: 0, y: 0 };
  var to;
  if (spec.to != null) {
    to = spec.to;
    if (typeof to === 'string') to = PM_resolveAnchor(to, PM_bodyRegistry, PM_surfaceRegistry);
  } else if (typeof spec.to_expr === 'string') {
    vLive = vLive || PM_liveVarsWithDerived();
    to = PM_safeEvalPoint(spec.to_expr, vLive) || { x: from.x, y: from.y };
  } else if (typeof spec.magnitude === 'number' || typeof spec.magnitude_expr === 'string') {
    var liveVarsV = PM_liveVarsWithDerived();
    var magV = (typeof spec.magnitude_expr === 'string')
      ? PM_safeEval(spec.magnitude_expr, liveVarsV)
      : spec.magnitude;
    if (!isFinite(magV)) magV = 0;
    var dirDegV = (typeof spec.direction_deg_expr === 'string')
      ? PM_safeEval(spec.direction_deg_expr, liveVarsV)
      : (typeof spec.direction_deg === 'number' ? spec.direction_deg : 0);
    if (!isFinite(dirDegV)) dirDegV = 0;
    var radV = dirDegV * Math.PI / 180;
    // Physics y-up → canvas y-down: flip y (matches drawForceArrow line 1007).
    to = { x: from.x + magV * Math.cos(radV), y: from.y - magV * Math.sin(radV) };
  } else {
    to = { x: 0, y: 0 };
  }
  var fx = from.x + ox, fy = from.y + oy;
  var tx = to.x + ox, ty = to.y + oy;

  push();
  stroke(rgb[0], rgb[1], rgb[2]);
  strokeWeight(2);
  fill(rgb[0], rgb[1], rgb[2]);

  // style: 'dashed' = dashed line, no arrowhead.
  // style: 'line' OR hide_arrowhead: true = plain line (for ropes, strings).
  // default = solid line with arrowhead at spec.to (for vectors).
  if (spec.style === 'dashed') {
    PM_dashedLine(fx, fy, tx, ty, 8);
  } else if (spec.style === 'line' || spec.hide_arrowhead) {
    line(fx, fy, tx, ty);
  } else {
    line(fx, fy, tx, ty);
    var angle = Math.atan2(ty - fy, tx - fx);
    var headLen = 10;
    push();
    translate(tx, ty);
    rotate(angle);
    triangle(0, 0, -headLen, 4, -headLen, -4);
    pop();
  }

  if (spec.label) {
    noStroke();
    textSize(11);
    textAlign(CENTER, BOTTOM);
    text(spec.label, (fx + tx) / 2, (fy + ty) / 2 - 4);
  }
  pop();
}

// drawMotionPath — linear path with optional dashed style. Ported from
// pcplRenderer/primitives/motion_path.ts. Ships without animation; style:
// 'animated' is treated as 'solid'. path: 'parabolic' | 'circular' is
// silently ignored (JSONs currently only use 'linear').
// TODO: wire per-frame position interpolation via PM_simClockMs.
function drawMotionPath(spec, ox, oy) {
  ox = ox || 0; oy = oy || 0;
  var start = spec.start || { x: 0, y: 0 };
  var end = spec.end || { x: 0, y: 0 };
  var sx = start.x + ox, sy = start.y + oy;
  var ex = end.x + ox, ey = end.y + oy;

  push();
  stroke(150, 150, 150);
  strokeWeight(1.5);
  noFill();

  if (spec.style === 'dashed') {
    var dist = Math.sqrt((ex - sx) * (ex - sx) + (ey - sy) * (ey - sy));
    var steps = Math.max(1, Math.floor(dist / 16));
    var dxm = (ex - sx) / (steps * 2);
    var dym = (ey - sy) / (steps * 2);
    for (var mi = 0; mi < steps; mi++) {
      var mxs = sx + mi * 2 * dxm;
      var mys = sy + mi * 2 * dym;
      line(mxs, mys, mxs + dxm, mys + dym);
    }
  } else {
    line(sx, sy, ex, ey);
  }

  var mangle = Math.atan2(ey - sy, ex - sx);
  fill(150);
  push();
  translate(ex, ey);
  rotate(mangle);
  triangle(0, 0, -10, 4, -10, -4);
  pop();
  pop();
}

// Recomputes the full physics vars+derived scope AS THEY WOULD BE at a given
// virtual sim-clock time tMs — i.e. runs every declared variable_choreography
// entry through PM_choreoValue(spec, tMs) instead of reading the live
// PM_choreoValues cache (which only ever reflects "now"). Used by
// drawLocusTrace to recompute its whole historical path from scratch every
// frame — no accumulated trail state to desync under SET_TIME_FREEZE
// (WP-R5, D5: "recompute-from-zero is what makes it freeze-deterministic").
function PM_choreoVarsAtTime(tMs) {
  var stateData = PM_config && PM_config.states && PM_config.states[PM_currentState];
  var choreo = (stateData && stateData.variable_choreography) || [];
  var scene = (stateData && stateData.scene_composition) || [];
  var stateSliderVars = {};
  for (var si = 0; si < scene.length; si++) {
    var sp = scene[si];
    if (sp && sp.type === 'slider' && sp.variable) stateSliderVars[sp.variable] = true;
  }
  var vars = PM_resolveStateVars(PM_currentState) || {};
  for (var sk in PM_sliderValues) {
    if (Object.prototype.hasOwnProperty.call(PM_sliderValues, sk) && stateSliderVars[sk]) {
      vars[sk] = PM_sliderValues[sk];
    }
  }
  for (var ci = 0; ci < choreo.length; ci++) {
    var cspec = choreo[ci];
    if (!cspec || typeof cspec.variable !== 'string') continue;
    if (PM_userTouched[cspec.variable]) continue; // seized — the slider value above already wins
    vars[cspec.variable] = PM_choreoValue(cspec, tMs);
  }
  var derived = {};
  try {
    var ph = computePhysics(PM_config.concept_id, vars);
    derived = (ph && ph.derived) || {};
  } catch (err) {
    derived = {};
  }
  var out = {};
  for (var vk in vars) if (Object.prototype.hasOwnProperty.call(vars, vk)) out[vk] = vars[vk];
  for (var dk in derived) if (Object.prototype.hasOwnProperty.call(derived, dk)) out[dk] = derived[dk];
  return out;
}

// drawLocusTrace (WP-R5, D5) — progressive trail of a moving point, e.g. the
// 5 km circle a continuously-sweeping heading traces out. Recomputed FROM
// SCRATCH every frame by resampling x_expr/y_expr at 'sample_ms' steps from
// start_ms to min(now, end_ms), capped at MAX_SAMPLES — never an
// accumulated array, so a SET_TIME_FREEZE re-pin to the same at_ms always
// redraws byte-identical pixels. Each sample evaluates against
// PM_choreoVarsAtTime(tSample), so the trace reflects what
// variable_choreography would have driven at that historical instant, not
// just the current live value.
var PM_LOCUS_TRACE_MAX_SAMPLES = 240;

function drawLocusTrace(spec) {
  if (!spec || typeof spec.x_expr !== 'string' || typeof spec.y_expr !== 'string') return;
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;

  var startMs = (typeof spec.start_ms === 'number') ? spec.start_ms : 0;
  var endMs = (typeof spec.end_ms === 'number') ? spec.end_ms : (startMs + 2000);
  var sampleMs = (typeof spec.sample_ms === 'number' && spec.sample_ms > 0) ? spec.sample_ms : 50;
  var nowMs = Math.min(PM_simClockMs, endMs);
  if (nowMs <= startMs) return; // nothing traced yet

  var span = nowMs - startMs;
  var sampleCount = Math.floor(span / sampleMs) + 1;
  if (sampleCount > PM_LOCUS_TRACE_MAX_SAMPLES) sampleCount = PM_LOCUS_TRACE_MAX_SAMPLES;
  if (sampleCount < 2) return;
  var step = span / (sampleCount - 1);

  var rgb = PM_hexToRgb(spec.color || '#8B5CF6');
  var sw = (typeof spec.stroke_weight === 'number') ? spec.stroke_weight : 2;
  var fadeTail = !!spec.fade_tail;

  push();
  noFill();
  strokeWeight(sw);
  var prevPt = null;
  for (var i = 0; i < sampleCount; i++) {
    var tSample = startMs + i * step;
    var sampleVars = PM_choreoVarsAtTime(tSample);
    var x = PM_safeEval(spec.x_expr, sampleVars);
    var y = PM_safeEval(spec.y_expr, sampleVars);
    if (!isFinite(x) || !isFinite(y)) { prevPt = null; continue; }
    if (prevPt) {
      var alphaMul = 1;
      if (fadeTail && sampleCount > 1) alphaMul = 0.25 + 0.75 * (i / (sampleCount - 1));
      stroke(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * alphaMul);
      line(prevPt.x, prevPt.y, x, y);
    }
    prevPt = { x: x, y: y };
  }
  pop();
}

// drawComparisonPanel — two side-by-side 330x280 panels at (30,80) and (390,80).
// Ported from pcplRenderer/primitives/comparison_panel.ts with inline sub-scene
// dispatch via PM_drawSubScene (nested primitives render cosmetically; they do
// not populate PM_bodyRegistry or PM_surfaceRegistry). Nested force_arrow uses
// spec.magnitude + spec.direction_deg directly — no PM_physics.forces lookup.
// Multi-cell layouts ('2x2_grid', '3_column') fall back to a single placeholder.
function drawComparisonPanel(spec) {
  var panelW = 330;
  var panelH = 280;
  var leftX = 30;
  var rightX = 390;
  var topY = 80;

  push();
  noFill();
  stroke(200);
  strokeWeight(1);

  if (spec.layout === '2x2_grid' || spec.layout === '3_column') {
    rect(leftX, topY, panelW * 2 + (rightX - leftX - panelW), panelH, 6);
    fill(120); noStroke(); textSize(12); textAlign(CENTER, CENTER);
    text('[comparison layout "' + spec.layout + '" pending]',
      leftX + (panelW * 2 + (rightX - leftX - panelW)) / 2, topY + panelH / 2);
    pop();
    return;
  }

  rect(leftX, topY, panelW, panelH, 6);
  rect(rightX, topY, panelW, panelH, 6);

  fill(80);
  noStroke();
  textSize(13);
  textAlign(CENTER, BOTTOM);
  if (spec.left_label) text(spec.left_label, leftX + panelW / 2, topY - 4);
  if (spec.right_label) text(spec.right_label, rightX + panelW / 2, topY - 4);
  pop();

  if (spec.left_scene) PM_drawSubScene(spec.left_scene, leftX + 20, topY + 20);
  if (spec.right_scene) PM_drawSubScene(spec.right_scene, rightX + 20, topY + 20);
}

// PM_drawSubScene — dispatches an array of nested primitives inside a
// comparison_panel. Uses the same flat if/else as the main Pass 3 loop.
// Force arrows inside a subscene read spec.magnitude/spec.direction_deg
// directly rather than looking up PM_physics.forces.
function PM_drawSubScene(prims, ox, oy) {
  for (var si = 0; si < prims.length; si++) {
    var sp = prims[si];
    if (!sp) continue;
    if (sp.type === 'body') {
      var bclone = Object.assign({}, sp);
      if (sp.position) {
        bclone._resolvedPosition = { x: sp.position.x + ox, y: sp.position.y + oy };
      } else {
        bclone._resolvedPosition = { x: ox + 150, y: oy + 120 };
      }
      drawBody(bclone);
      continue;
    }
    if (sp.type === 'force_arrow') {
      var mag = (typeof sp.magnitude === 'number') ? sp.magnitude : 20;
      var dirDeg = (typeof sp.direction_deg === 'number') ? sp.direction_deg : 90;
      var rad = dirDeg * Math.PI / 180;
      var scale = (typeof sp.scale_pixels_per_unit === 'number') ? sp.scale_pixels_per_unit : 5;
      var len = mag * scale;
      // Origin resolution priority:
      //   1. spec.from as string like "block.center" → PM_resolveAnchor against body registry
      //      (block must have been drawn earlier in this sub-scene so it's registered).
      //   2. spec.from compound string like "block_top_center" → suffix parser.
      //   3. spec.position (local to sub-scene) + sub-scene offset.
      //   4. Panel default fallback.
      var fox, foy;
      if (typeof sp.from === 'string' && sp.from.indexOf('.') > -1) {
        var anchored = PM_resolveAnchor(sp.from, PM_bodyRegistry, PM_surfaceRegistry);
        fox = anchored.x; foy = anchored.y;
      } else if (typeof sp.from === 'string') {
        // Compound "bodyId_top_center" style — delegate to PM_resolveForceOrigin.
        var parsed = PM_resolveForceOrigin(Object.assign({}, sp), null, { x: ox + 150, y: oy + 120 });
        fox = parsed.x; foy = parsed.y;
      } else if (sp.position) {
        fox = sp.position.x + ox;
        foy = sp.position.y + oy;
      } else {
        fox = ox + 150;
        foy = oy + 120;
      }
      var tipX = fox + Math.cos(rad) * len;
      var tipY = foy - Math.sin(rad) * len;
      var rgb = PM_hexToRgb(sp.color || '#10B981');
      push();
      stroke(rgb[0], rgb[1], rgb[2]);
      strokeWeight(2);
      fill(rgb[0], rgb[1], rgb[2]);
      line(fox, foy, tipX, tipY);
      var ang = Math.atan2(tipY - foy, tipX - fox);
      push();
      translate(tipX, tipY);
      rotate(ang);
      triangle(0, 0, -10, 4, -10, -4);
      pop();
      if (sp.label) {
        noStroke();
        textSize(11);
        // Default: label at tip, nudged right. Vertical arrows get a tiny
        // horizontal nudge so the label doesn't sit on the arrowhead triangle.
        var labelX = tipX + 6;
        var labelY = tipY;
        if (sp.label_offset && typeof sp.label_offset === 'object') {
          if (typeof sp.label_offset.dx === 'number') labelX += sp.label_offset.dx;
          if (typeof sp.label_offset.dy === 'number') labelY += sp.label_offset.dy;
        }
        textAlign(LEFT, CENTER);
        text(sp.label, labelX, labelY);
      }
      pop();
      continue;
    }
    if (sp.type === 'label' || sp.type === 'annotation') {
      if (!sp.position) continue;
      var lclone = Object.assign({}, sp, {
        position: { x: sp.position.x + ox, y: sp.position.y + oy }
      });
      if (sp.type === 'label') drawLabel(lclone);
      else drawAnnotation(lclone);
      continue;
    }
    if (sp.type === 'vector') { drawVector(sp, ox, oy); continue; }
    if (sp.type === 'surface') {
      if (!sp.position) continue;
      var sclone = Object.assign({}, sp, {
        position: { x: sp.position.x + ox, y: sp.position.y + oy }
      });
      drawSurface(sclone);
      continue;
    }
    if (sp.type === 'formula_box') {
      if (!sp.position) continue;
      var fclone = Object.assign({}, sp, {
        position: { x: sp.position.x + ox, y: sp.position.y + oy }
      });
      drawFormulaBox(fclone);
      continue;
    }
  }
}

// Draws an angle arc from from_deg to to_deg (math-frame, CCW from +x). Supports
// to_deg_expr for dynamic angles that track a slider variable. Used by
// vector_resolution to visualize α and by normal_reaction for θ indicators.
function drawAngleArc(spec) {
  // Vertex resolution priority:
  //   0. spec.anchor_to (WP-R5, D5) → PM_endpointRegistry lookup. Wins over
  //      everything below when the target primitive has already been
  //      registered THIS frame — chains this arc's vertex onto a
  //      force_arrow/angle_arc drawn earlier in the same state's
  //      scene_composition (e.g. an angle arc pinned to a leg vector's tip).
  //   1. spec.center (explicit {x, y} literal) — author-placed.
  //   2. spec.surface_id  → resolve to the surface's (x0, y0) from PM_surfaceRegistry.
  //   3. spec.vertex_anchor (string like "floor.start" or "block.bottom") →
  //      PM_resolveAnchor.
  //   4. Legacy fallback (250, 300) — only hits when none of the above resolved.
  var center = null;
  if (spec.anchor_to && typeof spec.anchor_to === 'object' && typeof spec.anchor_to.primitive_id === 'string') {
    center = PM_resolveAnchorTo(spec.anchor_to);
  }
  if (!center && spec.center && typeof spec.center === 'object'
      && typeof spec.center.x === 'number' && typeof spec.center.y === 'number') {
    center = spec.center;
  }
  if (!center && spec.surface_id && PM_surfaceRegistry && PM_surfaceRegistry[spec.surface_id]) {
    var surfA = PM_surfaceRegistry[spec.surface_id];
    center = { x: surfA.x0, y: surfA.y0 };
  }
  if (!center && typeof spec.vertex_anchor === 'string') {
    center = PM_resolveAnchor(spec.vertex_anchor, PM_bodyRegistry, PM_surfaceRegistry);
  }
  if (!center) center = { x: 250, y: 300 };
  var radius = (typeof spec.radius === 'number') ? spec.radius : 40;
  var fromDeg = (typeof spec.from_deg === 'number') ? spec.from_deg : 0;
  var toDeg;
  if (typeof spec.to_deg_expr === 'string') {
    var vars = PM_liveVarsWithDerived();
    toDeg = (typeof vars[spec.to_deg_expr] === 'number') ? vars[spec.to_deg_expr] : 45;
  } else if (typeof spec.to_deg === 'number') {
    toDeg = spec.to_deg;
  } else if (typeof spec.angle_value === 'number') {
    // v2 prompt convention: spec.angle_value is the target angle in degrees.
    // Drives to_deg so an inclined surface with angle=30 shows a 0 to 30 arc.
    toDeg = spec.angle_value;
  } else if (typeof spec.angle_value_expr === 'string') {
    var varsA = PM_liveVarsWithDerived();
    var av = PM_safeEval(spec.angle_value_expr, varsA);
    toDeg = isFinite(av) ? av : 45;
  } else {
    toDeg = 45;
  }

  // WP-R5 (D5 anchor_to) — register this arc's vertex + its to_deg endpoint
  // point so a LATER primitive can chain off it, even on a degenerate arc
  // that returns early below without drawing anything.
  if (spec.id) {
    var arcTipRad = -toDeg * Math.PI / 180; // canvas CW convention (matches the arc() call below)
    PM_endpointRegistry[spec.id] = {
      origin: { x: center.x, y: center.y },
      tip: { x: center.x + radius * Math.cos(arcTipRad), y: center.y + radius * Math.sin(arcTipRad) }
    };
  }

  // Degenerate arc (e.g. a horizontal surface labelled angle=0°): skip drawing
  // the arc itself but still render the label so the student sees "θ = 0°"
  // without a zero-width arc artifact.
  if (Math.abs(toDeg - fromDeg) < 0.5 && !spec.label) return;
  var rgb = PM_hexToRgb(spec.color || '#F59E0B');

  // Math CCW → canvas CW: p5 arc takes angles in canvas (CW positive).
  // Math angle a maps to canvas angle -a.
  var startRad = -toDeg * Math.PI / 180;
  var endRad = -fromDeg * Math.PI / 180;

  push();
  noFill();
  stroke(rgb[0], rgb[1], rgb[2], 220);
  strokeWeight(1.5);
  arc(center.x, center.y, radius * 2, radius * 2, startRad, endRad);

  if (spec.label) {
    var midMathDeg = (fromDeg + toDeg) / 2;
    var midCanvasRad = -midMathDeg * Math.PI / 180;
    var labelR = radius + 14;
    var lx = center.x + labelR * Math.cos(midCanvasRad);
    var ly = center.y + labelR * Math.sin(midCanvasRad);
    noStroke();
    fill(rgb[0], rgb[1], rgb[2]);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(PM_interpolate(String(spec.label)), lx, ly);
  }
  pop();
}

// Draws a 2D reference frame (two perpendicular labeled arrows) at a fixed position.
// angle_deg = 0 renders the world frame (horizontal + vertical). Non-zero angles
// render a rotated frame (e.g. incline-aligned axes). The student SEES which axes
// they're resolving along, instead of having to imagine them.
function drawAxes(spec) {
  var pos = spec.position || { x: 100, y: 370 };
  var length = (typeof spec.length === 'number') ? spec.length : 120;
  var angleDeg = (typeof spec.angle_deg === 'number') ? spec.angle_deg : 0;
  var color = spec.color || '#9CA3AF';
  var rgb = PM_hexToRgb(color);
  var theta = angleDeg * Math.PI / 180;
  // math CCW → canvas CW for y
  var ax1x = Math.cos(theta), ax1y = -Math.sin(theta);
  var ax2x = -Math.sin(theta), ax2y = -Math.cos(theta);

  var x1e = pos.x + ax1x * length, y1e = pos.y + ax1y * length;
  var x2e = pos.x + ax2x * length, y2e = pos.y + ax2y * length;

  push();
  stroke(rgb[0], rgb[1], rgb[2], 220);
  strokeWeight(1.5);
  line(pos.x, pos.y, x1e, y1e);
  line(pos.x, pos.y, x2e, y2e);

  function axisHead(tipX, tipY, ux, uy) {
    var sz = 8;
    var ang = Math.atan2(uy, ux);
    push();
    noStroke();
    fill(rgb[0], rgb[1], rgb[2], 220);
    translate(tipX, tipY);
    rotate(ang);
    triangle(0, 0, -sz, -sz / 2, -sz, sz / 2);
    pop();
  }
  axisHead(x1e, y1e, ax1x, ax1y);
  axisHead(x2e, y2e, ax2x, ax2y);

  noStroke();
  fill(rgb[0], rgb[1], rgb[2]);
  textSize(12);
  var xLabel = spec.x_label || 'x';
  var yLabel = spec.y_label || 'y';
  // Place labels slightly past the arrow tips, offset perpendicular to each axis
  textAlign(LEFT, CENTER);
  text(xLabel, x1e + ax1x * 6 + 4, y1e + ax1y * 6);
  textAlign(CENTER, CENTER);
  text(yLabel, x2e + ax2x * 6, y2e + ax2y * 6 - 6);
  pop();
}

// Draws a styled formula/equation box at a fixed position. Accepts multi-line
// formulas via \\n separator. Used across concepts that need to surface the
// governing equation alongside the scene.
function drawFormulaBox(spec) {
  // Accept four field names in priority order. v2 JSONs use equation_expr /
  // equation; legacy JSONs used formula / formula_expr. All four are equivalent.
  var src = spec.equation_expr || spec.equation || spec.formula_expr || spec.formula;
  if (!src) return;
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var pos = spec._solverPosition || spec.position || { x: 500, y: 300 };
  var textStr = PM_interpolate(String(src));
  var lines = textStr.split('\\n');
  var emph = PM_focalEmphasis(spec);
  var lineHeight = 18;
  var padding = 10;

  push();
  // Rule 34b — the ONE formula surface is math-serif Unicode (Φ ω ε ε₀ θ …), not
  // the p5 default sans. CSS font stack falls back gracefully if 'Cambria Math' is
  // absent. Set before textWidth() so box sizing measures the actual glyphs.
  textFont("'Cambria Math','STIX Two Math','Times New Roman',serif");
  textSize(14);
  textStyle(BOLD);
  var maxW = 0;
  for (var i = 0; i < lines.length; i++) {
    var w = textWidth(lines[i]);
    if (w > maxW) maxW = w;
  }
  var boxW = maxW + padding * 2;
  var boxH = lines.length * lineHeight + padding * 2;
  var rgb = PM_hexToRgb(spec.border_color || '#3B82F6');

  // Right-edge clamp: canvas is 760px wide. If the computed box would overflow
  // past 760-10 (10px margin), shift the whole box left so the equation is
  // never visually truncated. Left edge also clamped to >= 10.
  var CANVAS_RIGHT = 760;
  if (pos.x + boxW + 10 > CANVAS_RIGHT) {
    var newX = Math.max(10, CANVAS_RIGHT - boxW - 10);
    pos = { x: newX, y: pos.y };
  }

  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.border_color || '#3B82F6';
    drawingContext.shadowBlur = emph.glowPx;
  }

  // Dark background for contrast
  fill(15, 23, 42, 230 * gate.alpha * emph.alphaMul);
  stroke(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * emph.alphaMul);
  strokeWeight(1.5);
  rect(pos.x, pos.y, boxW, boxH, 4);

  noStroke();
  fill(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * emph.alphaMul);
  textAlign(LEFT, TOP);
  for (var j = 0; j < lines.length; j++) {
    text(lines[j], pos.x + padding, pos.y + padding + j * lineHeight);
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// ─── Engine 19 primitives: derivation_step + mark_badge (board mode) ───────
// Handwriting animation uses PM_simClockMs so the reveal restarts on
// every state transition (Rule 36). Hex-colour parsing uses p5's color()/red()/...
function drawDerivationStep(spec) {
  if (!spec.position) return;
  var col = color(spec.color || '#1F2937');
  var r = red(col), g = green(col), b = blue(col);
  var size = spec.font_size || 15;

  var displayText = spec.text || '';
  var alpha = 255;
  var animate = spec.animate_in || 'none';
  if (animate !== 'none') {
    var elapsed = PM_simClockMs;
    if (animate === 'handwriting') {
      var charsPerSec = 28;
      var charsToShow = Math.min(displayText.length, Math.floor((elapsed / 1000) * charsPerSec));
      displayText = displayText.slice(0, charsToShow);
    } else if (animate === 'fade_in') {
      alpha = Math.min(255, Math.max(0, (elapsed / 400) * 255));
    }
  }

  push();
  noStroke();
  fill(r, g, b, alpha);
  textSize(size);
  // Handwriting font — only loaded in answer-sheet iframes; falls back to cursive
  // generic family until the Google Fonts <link> finishes fetching Kalam.
  textFont("'Kalam', cursive");
  textAlign(LEFT, TOP);
  text(displayText, spec.position.x, spec.position.y);
  pop();
}

function drawMarkBadge(spec) {
  if (!spec.position) return;
  var col = color(spec.color || '#F59E0B');
  var r = red(col), g = green(col), b = blue(col);
  var BADGE_W = 110, BADGE_H = 32, CORNER = 6;
  var plural = spec.mark_value === 1 ? '' : 's';
  var displayText = spec.text || ('+' + spec.mark_value + ' mark' + plural);

  push();
  drawingContext.shadowColor = 'rgba(25, 25, 25, 0.28)';
  drawingContext.shadowBlur = 6;
  drawingContext.shadowOffsetY = 2;
  fill(r, g, b, 232);
  stroke(r, g, b);
  strokeWeight(1.5);
  rect(spec.position.x, spec.position.y, BADGE_W, BADGE_H, CORNER);
  drawingContext.shadowColor = 'transparent';
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetY = 0;

  noStroke();
  fill(30, 30, 30);
  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(displayText, spec.position.x + BADGE_W / 2, spec.position.y + BADGE_H / 2);
  pop();
}

// ─── Engine 20 — Motion Integrator (slides_on_surface, Phase 1) ────────────
// Reads body.physics_behavior + surface.friction (via PM_surfaceRegistry).
// Seeds PM_motionState with initial resolved body position and integrates
// velocity/position each frame until the block either (a) stays below
// static-friction threshold (doesn't move), or (b) leaves the surface.
function initMotionState() {
  PM_motionState = {};
  PM_motionConfig = {};
  if (!PM_config || !PM_config.states) return;
  var stateData = PM_config.states[PM_currentState];
  if (!stateData) return;
  var scene = stateData.scene_composition || [];
  for (var i = 0; i < scene.length; i++) {
    var prim = scene[i];
    if (!prim || prim.type !== 'body') continue;
    if (prim.physics_behavior !== 'slides_on_surface') continue;
    if (!prim.id) continue;
    var surfaceId = prim.attach_to_surface && prim.attach_to_surface.surface_id;
    if (!surfaceId) continue;
    // Resolve the body's initial anchor point on the surface. drawBody
    // usually handles this via _resolvedPosition — but initMotionState
    // can run BEFORE the first draw, so recompute here from registry.
    var surf = PM_surfaceRegistry[surfaceId];
    // If registry not yet populated (first frame of a new state), defer:
    // stepMotionIntegratorTick will skip bodies with no state entry and we'll
    // retry on next init trigger (PARAM_UPDATE always runs after registry).
    var initialX, initialY;
    if (surf) {
      var f = (prim.attach_to_surface && typeof prim.attach_to_surface.position_fraction === 'number')
        ? prim.attach_to_surface.position_fraction : 0.5;
      var L = surf.length;
      var rad = (surf.angle_deg || 0) * Math.PI / 180;
      // Contact point on the surface — matches drawBody's attachedPos math
      // exactly so the motion override slots into the same coordinate frame.
      initialX = surf.x0 + f * L * Math.cos(rad);
      initialY = surf.y0 - f * L * Math.sin(rad);
    } else if (prim.position) {
      initialX = prim.position.x;
      initialY = prim.position.y;
    } else {
      continue;
    }
    PM_motionState[prim.id] = {
      x: initialX, y: initialY,
      vx: 0, vy: 0,
      initialX: initialX, initialY: initialY,
      stopped: false
    };
    PM_motionConfig[prim.id] = {
      behavior: 'slides_on_surface',
      surface_id: surfaceId
    };
  }
}

function stepMotionIntegratorTick() {
  // Fixed dt = 1/60s (Rule 36) — called once per PM_simClockMs tick, 0-3 times
  // per real frame in normal play, or in a tight loop during a SET_TIME_FREEZE
  // deterministic catch-up. Replaces the old millis()-based variable-dt
  // integration so N ticks x dt is always the same total displacement
  // regardless of real frame timing (60 Hz vs 120 Hz+, or a throttled tab).
  var dt = 1 / 60;

  for (var bodyId in PM_motionConfig) {
    if (!Object.prototype.hasOwnProperty.call(PM_motionConfig, bodyId)) continue;
    var cfg = PM_motionConfig[bodyId];
    var ms = PM_motionState[bodyId];
    if (!cfg || !ms || ms.stopped) continue;

    if (cfg.behavior === 'slides_on_surface') {
      var surf = PM_surfaceRegistry[cfg.surface_id];
      if (!surf) continue;
      var angleDeg = surf.angle_deg || 0;
      var thetaRad = angleDeg * Math.PI / 180;
      var sinT = Math.sin(thetaRad);
      var cosT = Math.cos(thetaRad);
      var fric = surf.friction || { mu_s: 0, mu_k: 0 };

      // Static-friction check: only applies when body is at rest. Once moving
      // we use kinetic friction unconditionally (standard textbook model).
      var atRest = Math.abs(ms.vx) < 0.5 && Math.abs(ms.vy) < 0.5;
      if (atRest) {
        // Static: tan(theta) must exceed mu_s for motion to start.
        if (sinT <= fric.mu_s * cosT) {
          // Hold position — static friction balances gravity component.
          ms.vx = 0; ms.vy = 0;
          continue;
        }
      }

      // Kinetic: a_parallel = g * (sin(theta) - mu_k * cos(theta))
      // Friction opposes motion (down-slope → friction acts up-slope).
      var aAlong = PM_INTEGRATOR_G * (sinT - fric.mu_k * cosT);
      if (aAlong < 0) aAlong = 0; // clamp: friction never accelerates backwards
      // Surface geometry: drawSurface lays the incline from (x0, y0) at the
      // LOW end to (x0 + L·cos, y0 − L·sin) at the HIGH end. A block sliding
      // DOWN moves from high toward low: decreasing x, increasing y.
      // Down-slope unit vector in canvas coords: (-cos(theta), +sin(theta)).
      var uxDown = -cosT;
      var uyDown = sinT;
      var axPx = aAlong * PM_PX_PER_M_S2 * uxDown;
      var ayPx = aAlong * PM_PX_PER_M_S2 * uyDown;
      ms.vx += axPx * dt;
      ms.vy += ayPx * dt;
      ms.x += ms.vx * dt;
      ms.y += ms.vy * dt;

      // Stop condition: body has slid past the low end of the surface, or
      // fallen off the canvas bottom. The low end is (surf.x0, surf.y0).
      // Body shape fills a rect — use its rendered top-left ms.{x,y} plus
      // a small tolerance so the block doesn't snap invisible before the
      // last pixel of slide.
      if (ms.x < surf.x0 - 20 || ms.y > surf.y0 + 20 || ms.y > 480) {
        ms.stopped = true;
      }
    }
  }
}

// ─── PCPL slider primitive (ported from mechanics_2d_renderer:M2_getCanvasSliderVal) ───
// Canvas-drawn horizontal slider. On drag:
//   1. Writes to PM_sliderValues[spec.variable]
//   2. Recomputes PM_physics with the new variable merged over PM_resolveStateVars
//   3. Posts { type:'PARAM_UPDATE', key, value } upward — DualPanelSimulation relays to Panel B
// Position resolution: SliderSpec.position is 'bottom' | 'bottom_left' | 'bottom_right'.
// CONTROL_ZONE = { x:30, y:460, w:700, h:40 } (from PM_ZONES).
// Rule 31 muscle-memory: a slider shared across states must keep the SAME screen
// position. Per-state idx/total (below) would move a variable that's alone in one
// state but 2nd-of-3 in another. So assign each 'bottom' slider variable a STABLE
// slot from a single scan of all states (first-appearance order; total = the count
// of distinct 'bottom' sliders = what the explore state shows), cached once — the
// panel is effectively "built once, rows shown/hidden per state" (Rule 31c).
var PM_sliderSlotMap = null;
function PM_ensureSliderSlotMap() {
  if (PM_sliderSlotMap) return PM_sliderSlotMap;
  var states = (PM_config && PM_config.states) || {};
  var collect = function(sk) {
    var out = [];
    var scene = (states[sk] && states[sk].scene_composition) || [];
    for (var i = 0; i < scene.length; i++) {
      var p = scene[i];
      if (p && p.type === 'slider' && p.variable && (p.position || 'bottom') === 'bottom') out.push(p.variable);
    }
    return out;
  };
  // Canonical order = the state with the MOST 'bottom' sliders (the explore
  // sandbox, where the teacher lives), so its layout reads exactly as authored;
  // every subset state then places its sliders at those same slots (no jump).
  var bestList = [];
  for (var sk in states) {
    if (!Object.prototype.hasOwnProperty.call(states, sk)) continue;
    var lst = collect(sk);
    if (lst.length > bestList.length) bestList = lst;
  }
  var order = [], seen = {};
  for (var b = 0; b < bestList.length; b++) if (!seen[bestList[b]]) { seen[bestList[b]] = true; order.push(bestList[b]); }
  // append any variable that appears ONLY in other (non-max) states
  for (var sk2 in states) {
    if (!Object.prototype.hasOwnProperty.call(states, sk2)) continue;
    var lst2 = collect(sk2);
    for (var k = 0; k < lst2.length; k++) if (!seen[lst2[k]]) { seen[lst2[k]] = true; order.push(lst2[k]); }
  }
  var map = {};
  for (var j = 0; j < order.length; j++) map[order[j]] = { index: j, total: order.length };
  PM_sliderSlotMap = map;
  return map;
}

function PM_resolveSliderSlot(pos, idx, total) {
  var zone = PM_ZONES.CONTROL_ZONE;
  if (pos === 'bottom_left') return { x: zone.x + 30, y: zone.y + 20, w: 220 };
  if (pos === 'bottom_right') return { x: zone.x + zone.w - 220 - 30, y: zone.y + 20, w: 220 };
  // 'bottom' or unknown → distribute N sliders edge-to-edge with gaps, capping
  // per-slot width so the third slider doesn't overflow off-canvas (bug #6).
  var t = Math.max(1, total || 1);
  var available = zone.w - 60;
  var gap = t > 1 ? 20 : 0;
  var slotW = Math.min(220, (available - gap * (t - 1)) / t);
  return { x: zone.x + 30 + (idx || 0) * (slotW + gap), y: zone.y + 20, w: slotW };
}

function drawCanvasSlider(spec, idx, total) {
  if (!spec || !spec.variable) return;
  // 'bottom' sliders use the STABLE per-variable slot (so a shared slider keeps its
  // screen position across states); explicit bottom_left/bottom_right and any
  // variable not in the map fall back to the per-state idx/total distribution.
  var sPos = spec.position || 'bottom';
  var slot;
  if (sPos === 'bottom') {
    var sm = PM_ensureSliderSlotMap()[spec.variable];
    slot = sm ? PM_resolveSliderSlot('bottom', sm.index, sm.total)
              : PM_resolveSliderSlot('bottom', idx || 0, total || 1);
  } else {
    slot = PM_resolveSliderSlot(sPos, idx || 0, total || 1);
  }
  var minV = (typeof spec.min === 'number') ? spec.min : 0;
  var maxV = (typeof spec.max === 'number') ? spec.max : 10;
  var defV = (typeof spec.default === 'number') ? spec.default : minV;

  // Seed from PM_sliderValues (set by PARAM_UPDATE listener or previous drag),
  // falling back to JSON default.
  if (PM_sliderValues[spec.variable] === undefined) {
    PM_sliderValues[spec.variable] = defV;
  }
  var val = PM_sliderValues[spec.variable];
  var frac = (val - minV) / (maxV - minV);
  if (!isFinite(frac)) frac = 0;
  frac = Math.max(0, Math.min(1, frac));
  var knobX = slot.x + frac * slot.w;

  // Draw slot
  push();
  stroke(120, 125, 150);
  strokeWeight(3);
  line(slot.x, slot.y, slot.x + slot.w, slot.y);

  // Draw label above knob
  noStroke();
  fill(210, 215, 228);
  textSize(11);
  textAlign(LEFT, CENTER);
  // Rule 34c — real Unicode, not ASCII. 'deg' joins tight (90°, no space);
  // every other unit keeps the existing ' <unit>' join (survey found no other
  // ASCII-math unit on an authored type:'slider' primitive — see WP-R2 report).
  var pmUnitSuffix = (spec.unit === 'deg') ? '°' : (spec.unit ? (' ' + spec.unit) : '');
  var labelText = (spec.label || spec.variable) + ': ' + Number(val).toFixed(spec.step && spec.step < 1 ? 1 : 0) + pmUnitSuffix;
  text(labelText, slot.x, slot.y - 14);

  // Draw knob
  fill(255, 220, 100);
  stroke(140, 100, 20);
  strokeWeight(1);
  ellipse(knobX, slot.y, 16, 16);
  pop();

  // Drag handling — single-slider-at-a-time to avoid cross-interference.
  var hit = mouseIsPressed
    && Math.abs(mouseY - slot.y) < 18
    && mouseX > slot.x - 8
    && mouseX < slot.x + slot.w + 8;

  // Claim active slider on press (prevents two sliders claiming the same drag).
  if (hit && PM_activeSliderId == null) {
    PM_activeSliderId = spec.id || spec.variable;
  }
  if (!mouseIsPressed) {
    PM_activeSliderId = null;
  }
  var isActive = PM_activeSliderId === (spec.id || spec.variable);

  if (hit && isActive) {
    // WP-R5 (D5 seizure) — a REAL drag (genuine mouseIsPressed, this exact
    // branch) permanently hands this variable's variable_choreography (if
    // any) over to the teacher for the rest of this state. Synthetic
    // postMessage traffic (THE EYE, PARAM_UPDATE) never reaches this branch
    // because it can't move p5's own mouseX/mouseY — that's deliberate;
    // see PM_userTouched's declaration.
    PM_userTouched[spec.variable] = true;
    var newFrac = Math.max(0, Math.min(1, (mouseX - slot.x) / slot.w));
    var rawVal = minV + newFrac * (maxV - minV);
    var step = (typeof spec.step === 'number' && spec.step > 0) ? spec.step : (maxV - minV) / 100;
    var snapped = Math.round(rawVal / step) * step;
    snapped = parseFloat(snapped.toFixed(step < 1 ? 2 : 1));
    snapped = Math.max(minV, Math.min(maxV, snapped));

    // Value changed? Update local physics + emit PARAM_UPDATE upward.
    if (PM_sliderValues[spec.variable] !== snapped) {
      PM_sliderValues[spec.variable] = snapped;
      var currentVars = PM_resolveStateVars(PM_currentState) || {};
      for (var sk in PM_sliderValues) {
        if (Object.prototype.hasOwnProperty.call(PM_sliderValues, sk)) {
          currentVars[sk] = PM_sliderValues[sk];
        }
      }
      try {
        PM_physics = computePhysics(PM_config.concept_id, currentVars);
      } catch (err) {
        // Keep last good PM_physics — don't crash the sketch on bad inputs.
      }

      // Engine 20 reset — mirror the PARAM_UPDATE listener behaviour so that
      // dragging the Panel-A canvas slider snaps the block back to its
      // initial position on the NEW incline geometry. Without this, the
      // motion state retains a position computed for the old angle while
      // the surface re-orients, producing the "block floats off the plane"
      // visual regression observed during drag.
      PM_motionState = {};
      PM_motionConfig = {};
      PM_motionNeedsInit = true;

      if (PM_sliderLastEmitted[spec.variable] !== snapped) {
        PM_sliderLastEmitted[spec.variable] = snapped;
        try {
          window.parent.postMessage({ type: 'PARAM_UPDATE', key: spec.variable, value: snapped }, '*');
        } catch (e) {}
      }
    }
  }
}

// ─── Section 3: p5 sketch dispatcher ────────────────────────────────────────
var PM_config = null;
var PM_physics = null;
var PM_currentState = 'STATE_1';
var PM_bodyRegistry = {};
var PM_surfaceRegistry = {};
// WP-R5 (D5 anchor_to) — { [primitive_id]: { origin: {x,y}, tip: {x,y} } },
// refilled every draw() frame by drawForceArrow/drawAngleArc (array order =
// PM_resolveAnchorTo's "must precede" contract). Cleared on true SET_STATE.
var PM_endpointRegistry = {};
var PM_sliderValues = {}; // { [variable]: number } — canvas-slider live values, seeded from default_variables
var PM_sliderLastEmitted = {}; // { [variable]: number } — debounce PARAM_UPDATE to value changes only
var PM_activeSliderId = null; // id of slider currently being dragged (single-touch)
// WP-R5 (D5 variable_choreography) — { [variable]: number }, the last
// choreography-stepped value applied to PM_physics (epsilon-diffed each
// frame so recompute only fires on real movement). Cleared alongside the
// sim clock (PM_resetSimClock) so a state re-entry / freeze re-pin always
// re-derives from t=0 instead of comparing against a stale prior value.
var PM_choreoValues = {};
// WP-R5 (D5 seizure) — { [variable]: true }, set ONLY inside
// drawCanvasSlider's genuine-drag branch (real mouseIsPressed). A seized
// variable's variable_choreography stops advancing for the rest of this
// state. Synthetic postMessage traffic cannot move the p5 mouse, so THE EYE
// structurally cannot trigger this — captures stay deterministic. Cleared
// only on a true SET_STATE (NOT on SET_TIME_FREEZE re-pins).
var PM_userTouched = {};

// ── WP-R2 (D1) — canvas scale-to-fit ──────────────────────────────────────
// last pixelDensity() applied by PM_fitCanvas's optional crispness rider.
var PM_lastCanvasDensity = 1;

// ── Rule 36 — fixed-step sim clock ────────────────────────────────────────
// PM_simClockMs is the ONLY elapsed-time source in this renderer — every
// animation that used to read 'millis() - PM_stateEnterTime' now reads this
// instead. It advances in fixed 1000/60ms ticks (0-3 per real frame,
// accumulated from p5's deltaTime in draw()), so N ticks always cover the
// same simulated time regardless of real frame-rate (60 Hz vs 120 Hz+), and a
// SET_TIME_FREEZE deterministic catch-up (see draw()) reproduces byte-identical
// frames no matter how long the real wall-clock took to reach it.
var PM_simClockMs = 0;
var PM_clockAccumMs = 0;          // real-ms accumulator feeding the fixed tick loop
var PM_paused = false;            // PAUSE/RESUME — clock + Engine 20 motion freeze together (Rule 26b)
var PM_frozen = false;            // SET_TIME_FREEZE pin — draw() stops stepping; catch-up lands the clock
var PM_pinTargetMs = 0;           // SET_TIME_FREEZE {at_ms} target for the catch-up below
var PM_pinCatchupPending = false; // true for exactly one draw() frame after a fresh pin request
var PM_muted = false;             // MUTE — gates sound_cue playback only, never the clock (Rule 26a)
var PM_cueOverrides = {};         // sound_cue id -> at_ms override from SET_CUE_TIME; cleared on state switch
var PM_cleanMode = false;         // SET_CLEAN_MODE — teacher Clean/full-screen: strip on-canvas chrome (formula/sliders/callouts/HUD), keep the physical picture
var PM_glowOverride = null;       // SET_GLOW — narration-beat focal-id override (primitive id) feeding PM_focalEmphasis; null = use the state's authored focal
var PM_simReadyFired = false;     // guards the CDN-failure watchdog at the bottom of this file

// ── Engine 20 — Motion Integrator state ───────────────────────────────────
// Per-body dynamic state: { x, y, vx, vy, initialX, initialY, stopped }.
// Only bodies with physics_behavior !== 'static' (and that survived init)
// appear here. Seeded by initMotionState() on state entry + slider drag.
var PM_motionState = {};
// Per-body integrator config: { behavior, surface_id, body_w, body_h, initialAnchor }
var PM_motionConfig = {};
// Signal that motion state must be re-initialized at the NEXT draw() frame
// (after Pass 0 has populated PM_surfaceRegistry with up-to-date geometry).
// Deferring init to draw() guarantees the surface registry is current —
// SET_STATE and PARAM_UPDATE handlers fire BEFORE the next Pass 0.
var PM_motionNeedsInit = false;
// Gravity in m/s² (canvas-render scale handled by PX_PER_M_S2 in integrator).
var PM_INTEGRATOR_G = 9.8;
// Visual tuning: pixels per (m/s²) for canvas rendering. 60 means an
// acceleration of 3 m/s² moves ~180 px in the first second. Adjustable.
var PM_PX_PER_M_S2 = 60;

var PM_ZONES = {
  MAIN_ZONE:      { x:30,  y:80,  w:430, h:380 },
  CALLOUT_ZONE_R: { x:475, y:80,  w:255, h:200 },
  FORMULA_ZONE:   { x:475, y:290, w:255, h:170 },
  CONTROL_ZONE:   { x:30,  y:460, w:700, h:40  },
  TITLE_ZONE:     { x:30,  y:10,  w:700, h:60  }
};

function PM_resolveAnchor(anchor, bodyRegistry, surfaceRegistry) {
  if (!anchor) return { x: 245, y: 270 };

  // Zone anchor: "MAIN_ZONE.center"
  var dotIdx = anchor.indexOf('.');
  if (dotIdx > -1) {
    var zoneName = anchor.substring(0, dotIdx);
    var subAnchor = anchor.substring(dotIdx + 1);
    var zone = PM_ZONES[zoneName];
    if (zone) {
      if (subAnchor === 'center') return { x: zone.x + zone.w/2, y: zone.y + zone.h/2 };
      if (subAnchor === 'bottom_center') return { x: zone.x + zone.w/2, y: zone.y + zone.h };
      if (subAnchor === 'top_center') return { x: zone.x + zone.w/2, y: zone.y };
      if (subAnchor === 'slot_1') return { x: zone.x + 10, y: zone.y + 10 };
      if (subAnchor === 'slot_2') return { x: zone.x + 10, y: zone.y + 77 };
      if (subAnchor === 'slot_3') return { x: zone.x + 10, y: zone.y + 144 };
    }
    // Body anchor: "block.bottom" — apply body.rotation_deg (stored at line 786)
    // when resolving edge anchors so arrows / labels attached to a tilted block
    // on an inclined surface land on the rotated edge, not the axis-aligned one.
    var body = bodyRegistry && bodyRegistry[zoneName];
    if (body) {
      if (subAnchor === 'center' || subAnchor === 'top_center' || subAnchor === 'bottom_center') {
        // Centers of top/bottom edges: handled below with dy = ±h/2.
      }
      if (subAnchor === 'center') return { x: body.cx, y: body.cy };
      var dx = 0, dy = 0;
      if (subAnchor === 'bottom' || subAnchor === 'bottom_center') { dx = 0; dy = body.h/2; }
      else if (subAnchor === 'top' || subAnchor === 'top_center') { dx = 0; dy = -body.h/2; }
      else if (subAnchor === 'left')   { dx = -body.w/2; dy = 0; }
      else if (subAnchor === 'right')  { dx =  body.w/2; dy = 0; }
      else { dx = NaN; dy = NaN; }
      if (!isNaN(dx)) {
        var rotDegBody = (typeof body.rotation_deg === 'number') ? body.rotation_deg : 0;
        if (!rotDegBody) return { x: body.cx + dx, y: body.cy + dy };
        var radBody = rotDegBody * Math.PI / 180;
        var cosBody = Math.cos(radBody), sinBody = Math.sin(radBody);
        return {
          x: body.cx + dx * cosBody - dy * sinBody,
          y: body.cy + dx * sinBody + dy * cosBody
        };
      }
    }
    // Surface anchor: "floor.mid"
    var surf = surfaceRegistry && surfaceRegistry[zoneName];
    if (surf) {
      if (subAnchor === 'start') return { x: surf.x0, y: surf.y0 };
      if (subAnchor === 'mid')   return { x: surf.x0 + (surf.x1-surf.x0)/2, y: surf.y0 + (surf.y1-surf.y0)/2 };
      if (subAnchor === 'end')   return { x: surf.x1, y: surf.y1 };
    }
  }
  // Fallback
  console.warn('[PhysicsMind] Unknown anchor: ' + anchor + ' — using MAIN_ZONE center');
  return { x: 245, y: 270 };
}

// In drawPrimitive(), before using spec.position, add:
// if (spec.zone || spec.anchor) {
//   var resolved = PM_resolveAnchor(
//     spec.anchor || (spec.zone + '.center'),
//     PM_bodyRegistry, PM_surfaceRegistry
//   );
//   spec._resolvedPosition = resolved;
// }

// WP-R5 (D5 anchor_to) — resolves { primitive_id, point: 'tip'|'origin' }
// against PM_endpointRegistry. Returns null (never throws, never fabricates
// a fallback point) when the target hasn't been registered this frame —
// callers fall through to their own normal resolution chain in that case.
// point defaults to 'tip' for any value other than the literal 'origin'.
function PM_resolveAnchorTo(anchorTo) {
  var entry = PM_endpointRegistry[anchorTo.primitive_id];
  if (!entry) return null;
  var point = (anchorTo.point === 'origin') ? entry.origin : entry.tip;
  if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return null;
  return { x: point.x, y: point.y };
}

// Resolve a force-arrow origin from draw_from keyword against a registered body.
// Handles rotation by rotating the local offset around the body center.
function PM_resolveForceOrigin(spec, force, fallback) {
  // anchor_to (WP-R5, D5) — highest priority: an author who wrote this
  // explicitly wants the arrow's origin to CHASE another primitive's live
  // endpoint, so it wins over origin_body_id / literal from / everything
  // below. Falls through to the rest of this function when the target
  // hasn't been registered yet (validate-concepts.ts's Gate 9 catches the
  // authoring mistake that would cause this at author time).
  if (spec.anchor_to && typeof spec.anchor_to === 'object' && typeof spec.anchor_to.primitive_id === 'string') {
    var anchoredOrigin = PM_resolveAnchorTo(spec.anchor_to);
    if (anchoredOrigin) return anchoredOrigin;
  }

  // Support compound spec.from strings like mango_center, block_top_center,
  // earth_top. Split into body_id + draw_from anchor when the explicit
  // body_id / draw_from fields are absent. Longest matching suffix wins so
  // block_bottom_center parses before block_bottom.
  if (typeof spec.from === 'string' && !spec.draw_from && !spec.body_id) {
    var fromStr = spec.from;
    var suffixMap = {
      '_bottom_center': 'body_bottom',
      '_top_center': 'body_top',
      '_bottom': 'body_bottom',
      '_top': 'body_top',
      '_left': 'body_left',
      '_right': 'body_right',
      '_center': 'body_center'
    };
    var suffixes = ['_bottom_center', '_top_center', '_bottom', '_top', '_left', '_right', '_center'];
    for (var si = 0; si < suffixes.length; si++) {
      var suf = suffixes[si];
      if (fromStr.length > suf.length && fromStr.slice(-suf.length) === suf) {
        spec = Object.assign({}, spec, {
          body_id: fromStr.slice(0, -suf.length),
          draw_from: suffixMap[suf]
        });
        break;
      }
    }
  }

  var drawFrom = spec.origin_anchor || spec.draw_from || (force && force.draw_from) || 'body_center';
  // Accept both body_id (legacy) and origin_body_id (current JSON convention).
  // Without this, JSON force_arrows with origin_body_id silently fall back to
  // the first registered body — pile-up bug visible on STATE_5 of friction
  // (kinetic arrows landed on the static block).
  var bodyId = spec.body_id || spec.origin_body_id
    || (typeof drawFrom === 'string' && drawFrom.indexOf('body_') !== 0 ? drawFrom : null);
  var b = null;
  if (bodyId && PM_bodyRegistry[bodyId]) b = PM_bodyRegistry[bodyId];
  // Literal {x,y} origin (WP-R4, D4 — 2026-07-23). Only reached when no
  // body_id / origin_body_id resolved a registered body above, so arrows
  // that already work via origin_body_id are untouched — this ONLY rescues
  // arrows that were previously falling through to the first-registered-body
  // / hardcoded-{380,350} fallbacks below. Audit (55 arrows / 7 PCPL
  // concepts: contact_forces, current_not_vector, direction_of_resultant,
  // hinge_force, pressure_scalar, resultant_formula, tension_in_string)
  // confirmed every one of those arrows was already rendering at the wrong
  // (stacked) point pre-fix.
  if (!b && spec.from && typeof spec.from === 'object' && !Array.isArray(spec.from)
      && typeof spec.from.x === 'number' && isFinite(spec.from.x)
      && typeof spec.from.y === 'number' && isFinite(spec.from.y)) {
    return { x: spec.from.x, y: spec.from.y };
  }
  if (!b) {
    var keys = Object.keys(PM_bodyRegistry);
    if (keys.length > 0) b = PM_bodyRegistry[keys[0]];
  }
  if (!b) return fallback;

  var dx = 0, dy = 0;
  if (drawFrom === 'body_bottom') { dx = 0; dy = b.h / 2; }
  else if (drawFrom === 'body_top') { dx = 0; dy = -b.h / 2; }
  else if (drawFrom === 'body_left') { dx = -b.w / 2; dy = 0; }
  else if (drawFrom === 'body_right') { dx = b.w / 2; dy = 0; }
  // else body_center (or unrecognized) → (0, 0)

  if (b.rotation_deg) {
    var r = b.rotation_deg * Math.PI / 180;
    var rx = dx * Math.cos(r) - dy * Math.sin(r);
    var ry = dx * Math.sin(r) + dy * Math.cos(r);
    dx = rx; dy = ry;
  }
  return { x: b.cx + dx, y: b.cy + dy };
}

// Rule 36 — resets the state-local sim clock (+ tick accumulator) together
// with Engine 20's motion integrator and premium_primitives.ts's per-state
// caches (particle systems, sound-cue fired flags, camera lerp — all keyed off
// PM_lastSeenStateForPremium). Every timer in this renderer reads PM_simClockMs,
// so zeroing it here reproduces the old "PM_stateEnterTime = millis()" rewind
// idiom — but frame-rate independent and deterministic under SET_TIME_FREEZE
// re-sim (repeated same-target pins always replay the identical tick sequence).
function PM_resetSimClock() {
  PM_simClockMs = 0;
  PM_clockAccumMs = 0;
  window.PM_simTimeMs = 0;
  PM_motionState = {};
  PM_motionConfig = {};
  PM_motionNeedsInit = true;
  PM_lastSeenStateForPremium = null;
  // WP-R5 — invalidate the choreography cache so the next PM_applyChoreography()
  // call always recomputes at the (possibly jumped) new t=0 instead of
  // epsilon-comparing against a value from before the reset. Deliberately
  // does NOT touch PM_userTouched — seizure survives a SET_TIME_FREEZE
  // re-pin within the same state; it's cleared only on a true SET_STATE.
  PM_choreoValues = {};
}

// WP-R5 (D5) — steps every declared variable_choreography entry for the
// current state and, if any non-seized value actually moved (beyond a small
// epsilon — avoids recomputing computePhysics() every single frame for
// nothing), recomputes PM_physics with the new values merged in. Mirrors the
// exact vars-merge idiom used by the SET_STATE / PARAM_UPDATE handlers and
// drawCanvasSlider: state defaults+overrides, then any live slider value for
// a variable this state actually authors as a slider (so an unrelated
// slider's drag survives), then the freshly-stepped choreography value for
// every variable that is NOT currently seized (a seized variable keeps
// whatever the slider merge above just gave it).
function PM_applyChoreography() {
  var stateData = PM_config && PM_config.states && PM_config.states[PM_currentState];
  var choreo = stateData && stateData.variable_choreography;
  if (!Array.isArray(choreo) || choreo.length === 0) return;

  var nowMs = PM_simClockMs;
  var changed = false;
  for (var i = 0; i < choreo.length; i++) {
    var spec = choreo[i];
    if (!spec || typeof spec.variable !== 'string') continue;
    if (PM_userTouched[spec.variable]) continue; // seized by a real drag — choreography stands down
    var val = PM_choreoValue(spec, nowMs);
    var prev = PM_choreoValues[spec.variable];
    if (prev === undefined || Math.abs(val - prev) > 1e-4) {
      PM_choreoValues[spec.variable] = val;
      changed = true;
    }
  }
  if (!changed) return;

  var scene = (stateData && stateData.scene_composition) || [];
  var stateSliderVars = {};
  for (var si = 0; si < scene.length; si++) {
    var sp = scene[si];
    if (sp && sp.type === 'slider' && sp.variable) stateSliderVars[sp.variable] = true;
  }
  var vars = PM_resolveStateVars(PM_currentState) || {};
  for (var sk in PM_sliderValues) {
    if (Object.prototype.hasOwnProperty.call(PM_sliderValues, sk) && stateSliderVars[sk]) {
      vars[sk] = PM_sliderValues[sk];
    }
  }
  for (var ck in PM_choreoValues) {
    if (Object.prototype.hasOwnProperty.call(PM_choreoValues, ck) && !PM_userTouched[ck]) {
      vars[ck] = PM_choreoValues[ck];
    }
  }
  try {
    PM_physics = computePhysics(PM_config.concept_id, vars);
  } catch (err) {
    // Keep last good PM_physics — a transient bad choreo value must not crash the sketch.
  }
}

// ── WP-R2 (D1) — canvas scale-to-fit + centering ──────────────────────────
// The 760x500 LOGICAL coordinate space passed to createCanvas() below is
// fixed — every authored concept JSON positions primitives in it (CLAUDE.md
// Sec.6). This function only rescales the canvas ELEMENT's CSS box to
// fill/center whatever iframe viewport the review player gives it; it never
// touches createCanvas()'s width/height and never uses CSS transform (which
// would desync p5 1.9.4's scrollWidth-based mouse compensation — see
// getMousePos in the vendored p5 source, ~line 90670 — and silently break
// every drawCanvasSlider drag). Style-only resize keeps mouseX/mouseY in
// 760x500 logical space with ZERO mouse-mapping code anywhere else.
function PM_fitCanvas() {
  var cv = document.querySelector('canvas');
  if (!cv) return;
  var s = Math.min(window.innerWidth / 760, window.innerHeight / 500);
  if (!isFinite(s) || s <= 0) s = 1;
  cv.style.width = (760 * s) + 'px';
  cv.style.height = (500 * s) + 'px';

  // Crispness rider (optional, Rule 34-adjacent): raise the render backing
  // resolution on a scaled-UP canvas so text/lines don't blur. Skipped
  // entirely at native size (s within 1% of 1.0) so the baseline-safety
  // guarantee — byte-identical output at 760x500 — holds regardless of the
  // host browser's devicePixelRatio; pixelDensity() is never called there,
  // so behaviour at native size is unchanged from before this function
  // existed. Re-applied only on a >2% density change (pixelDensity() is a
  // real GPU backing-buffer resize, not cheap on every resize tick) and the
  // style write above must be redone right after — pixelDensity() resets it.
  if (Math.abs(s - 1) > 0.01) {
    var targetDensity = Math.min(3, s * (window.devicePixelRatio || 1));
    if (Math.abs(targetDensity - PM_lastCanvasDensity) / PM_lastCanvasDensity > 0.02) {
      pixelDensity(targetDensity);
      PM_lastCanvasDensity = targetDensity;
      cv.style.width = (760 * s) + 'px';
      cv.style.height = (500 * s) + 'px';
    }
  }
}

function windowResized() {
  PM_fitCanvas();
}

function setup() {
  createCanvas(760, 500);
  PM_fitCanvas();
  PM_config = window.SIM_CONFIG || {};
  PM_currentState = PM_config.current_state || 'STATE_1';
  window.PM_currentState = PM_currentState;   // mirror to window (field_3d/particle_field parity)
  PM_physics = window.PM_PRECOMPUTED_PHYSICS || computePhysics(PM_config.concept_id, PM_resolveStateVars(PM_currentState));
  PM_resetSimClock();
  PM_simReadyFired = true;
  // Declares the deterministic SET_TIME_FREEZE re-sim capability (WP-R1) so THE
  // EYE's dense/frozen capture harness takes the sim-time-pinned path instead
  // of the legacy wall-clock free-run fallback (screenshotter.ts's pinnable
  // probe reads this flag). Set LAST, only once the freeze handler is proven —
  // see parametric_renderer.ts's WP-R1 header comment for the full contract.
  window.__PM_supportsTimePin = true;
  try { window.parent.postMessage({ type: 'SIM_READY' }, '*'); } catch (e) {}
}

function draw() {
  // Rule 36 — fixed-step sim clock. Accumulate real elapsed ms (p5's deltaTime)
  // and run 0-3 fixed 1000/60ms ticks per frame; Engine 20's motion integrator
  // advances exactly once per tick (never once per variable-length draw() call),
  // so it's numerically identical at 60 Hz and rate-correct on 120 Hz+ hardware.
  // Frozen (SET_TIME_FREEZE) or paused (Rule 26b) frames render but don't step —
  // the deterministic catch-up for a fresh pin runs later in this function,
  // after Pass 0 has registered the state's surfaces (Engine 20 needs current
  // surface geometry to integrate correctly).
  if (!PM_frozen && !PM_paused) {
    PM_clockAccumMs += Math.min(50, deltaTime); // clamp tab-background gaps to 3 catch-up ticks
    var pmTicks = 0;
    while (PM_clockAccumMs >= 1000 / 60 && pmTicks < 3) {
      PM_simClockMs += 1000 / 60;
      stepMotionIntegratorTick();
      PM_clockAccumMs -= 1000 / 60;
      pmTicks++;
    }
  }
  // Visual-validator capture hook: expose the state-local sim clock so the
  // headless screenshotter can poll for reveals to fire (also read by the
  // review player). Kept current every frame, even while frozen/paused.
  window.PM_simTimeMs = PM_simClockMs;
  var isAnswerSheet = PM_config && PM_config.canvas_style === 'answer_sheet';
  if (isAnswerSheet) {
    background(253, 251, 244); // off-white paper
    // Faint horizontal rules — start AFTER the red margin so the gutter stays clean.
    stroke(215, 220, 235, 200);
    strokeWeight(0.6);
    for (var ry = 40; ry < 500; ry += 30) {
      line(86, ry, 730, ry);
    }
    // Red left-margin line — widened to ~78px to match CBSE/ICSE answer sheets.
    stroke(220, 90, 90, 190);
    strokeWeight(1.1);
    line(78, 10, 78, 500);
  } else {
    background(15, 15, 26);
  }
  var stateData = PM_config && PM_config.states && PM_config.states[PM_currentState];
  var rawScene = (stateData && stateData.scene_composition) || (PM_config && PM_config.scene_composition) || [];
  // De-overlap annotations BEFORE primitives read positions. Resolver returns a
  // shallow-cloned array; originals untouched so subsequent states still use
  // the Sonnet-authored coords.
  var scene = PM_resolveAnnotationOverlap(rawScene);
  // Expose current scene to premium primitives so PM_resolvePrimitiveCenter can
  // scan for animated_path / annotation / vector targets by id.
  PM_currentScene = scene;
  var origin = { x: 380, y: 350 };

  if (!PM_physics) {
    fill(239, 68, 68); noStroke(); textSize(14); textAlign(CENTER, CENTER);
    text('Unknown concept: ' + (PM_config && PM_config.concept_id), 380, 250);
    return;
  }

  // smooth_camera open — wraps the rest of draw() in a push()/translate/scale.
  // Placed AFTER the !PM_physics early-return so a leaked push() can't escape.
  // Matched by PM_endSmoothCameraIfActive() at the end of draw().
  PM_beginSmoothCameraIfActive(scene);

  // Pass 0 — draw surfaces (populates PM_surfaceRegistry)
  for (var s = 0; s < scene.length; s++) {
    var sPrim = scene[s];
    if (sPrim && sPrim.type === 'surface') drawSurface(sPrim);
  }

  // Engine 20 init hook — runs after Pass 0 so PM_surfaceRegistry is current.
  // Triggered by state switch or slider drag; seeds PM_motionState with the
  // correct initial position derived from the (possibly re-oriented) surface.
  if (PM_motionNeedsInit) {
    initMotionState();
    PM_motionNeedsInit = false;
  }

  // SET_TIME_FREEZE deterministic catch-up (Rule 36): the message handler
  // already zeroed the clock via PM_resetSimClock() and armed a fresh motion
  // init above; step forward exactly enough fixed 1000/60ms ticks to land
  // >= the requested pin, all inside this one frame — repeated pins to the
  // same at_ms always reproduce the identical frame (THE EYE baselines),
  // independent of how long the real wall-clock took to deliver the message.
  if (PM_pinCatchupPending) {
    var pmPinSteps = Math.ceil((PM_pinTargetMs - PM_simClockMs) / (1000 / 60));
    for (var pmPinI = 0; pmPinI < pmPinSteps; pmPinI++) {
      PM_simClockMs += 1000 / 60;
      stepMotionIntegratorTick();
    }
    // Precision snap: repeated 1000/60 addition is not exact in binary
    // floating point, so after pmPinSteps ticks PM_simClockMs can land a
    // hair (~1e-12ms) BELOW PM_pinTargetMs even though pmPinSteps was chosen
    // via Math.ceil specifically to guarantee landing at-or-past it (e.g.
    // target=1000 -> 999.9999999999991). Math.max never moves the clock
    // BACKWARD — it only corrects that rare sub-tick undershoot; the normal
    // (correctly overshooting) value from the loop above is left untouched.
    // The integrator already ran exactly pmPinSteps ticks above; this line
    // only corrects the REPORTED clock value, so it adds or skips no tick —
    // two page loads pinned to the same at_ms still run the identical tick
    // count and stay byte-identical.
    PM_simClockMs = Math.max(PM_simClockMs, PM_pinTargetMs);
    window.PM_simTimeMs = PM_simClockMs;
    PM_pinCatchupPending = false;
  }

  // WP-R5 (D5) — step variable_choreography for the now-current PM_simClockMs
  // (whether it just advanced normally or landed via the freeze catch-up
  // above) BEFORE any pass that reads PM_physics (bodies/force arrows/labels).
  // Deliberately after Pass 0 (surfaces already drew this frame with
  // whatever angle they had) — same one-frame-lag tradeoff Engine 20 already
  // accepts elsewhere in this function; no authored surface uses a
  // choreographed angle_expr today.
  PM_applyChoreography();

  // Pass 0.5 — resolve attach_to_surface for bodies (non-mutating: store on a clone).
  // Must run after surfaces registered but before bodies drawn.
  //
  // Engine 20 note: motion override is applied INSIDE drawBody (where it
  // replaces attachedPos) rather than here, because attach_to_surface bodies
  // still need drawBody's rotation inheritance to stay visually aligned with
  // the incline while sliding.
  var bodyPrims = [];
  for (var bi = 0; bi < scene.length; bi++) {
    var b = scene[bi];
    if (!b || b.type !== 'body') continue;
    if (b.attach_to_surface && b.attach_to_surface.surface_id) {
      var surf = PM_surfaceRegistry[b.attach_to_surface.surface_id];
      if (surf) {
        var f = (typeof b.attach_to_surface.position_fraction === 'number')
          ? b.attach_to_surface.position_fraction : 0.5;
        var L = surf.length;
        var px, py;
        if (surf.orientation === 'horizontal') { px = surf.x0 + f * L; py = surf.y0; }
        else if (surf.orientation === 'vertical') { px = surf.x0; py = surf.y0 - f * L; }
        else {
          var r = surf.angle_deg * Math.PI / 180;
          px = surf.x0 + f * L * Math.cos(r);
          py = surf.y0 - f * L * Math.sin(r);
        }
        var bw = (b.shape === 'rect' && b.size && typeof b.size === 'object') ? b.size.w : (typeof b.size === 'number' ? b.size : 60);
        var bh = (b.shape === 'rect' && b.size && typeof b.size === 'object') ? b.size.h : (typeof b.size === 'number' ? b.size : 60);
        var resolvedPos = (b.shape === 'rect')
          ? { x: px - bw / 2, y: py - bh }
          : { x: px, y: py - bh / 2 };
        var clone = Object.assign({}, b);
        clone._resolvedPosition = resolvedPos;
        bodyPrims.push(clone);
        continue;
      }
    }
    bodyPrims.push(b);
  }

  // Pass 1 — draw bodies (populates PM_bodyRegistry)
  for (var i = 0; i < bodyPrims.length; i++) drawBody(bodyPrims[i]);

  // Pass 2 — draw force arrows resolving origin via PM_resolveForceOrigin
  for (var j = 0; j < scene.length; j++) {
    var prim2 = scene[j];
    if (!prim2 || prim2.type !== 'force_arrow') continue;

    var force2 = null;
    for (var fk = 0; fk < PM_physics.forces.length; fk++) {
      if (PM_physics.forces[fk].id === prim2.force_id || PM_physics.forces[fk].id === prim2.id) {
        force2 = PM_physics.forces[fk]; break;
      }
    }
    if (!force2 && PM_physics.forces.length > 0) force2 = PM_physics.forces[0];

    var drawOrigin = PM_resolveForceOrigin(prim2, force2, origin);
    drawForceArrow(prim2, PM_physics, drawOrigin);
  }

  // Pass 2.5 — force decomposition components (drawn after main arrows, before labels)
  for (var fc = 0; fc < scene.length; fc++) {
    var fcPrim = scene[fc];
    if (!fcPrim || fcPrim.type !== 'force_components') continue;
    drawForceComponents(fcPrim, PM_physics);
  }

  // Pass 3 — draw labels, annotations, angle arcs, formula boxes, axes, and the
  // new overlay primitives (vector, motion_path, comparison_panel) on top of
  // everything else.
  //
  // Count sliders once so drawCanvasSlider can auto-distribute 'bottom' slots.
  var sliderTotal = 0, sliderSeen = 0;
  for (var sc = 0; sc < scene.length; sc++) {
    if (scene[sc] && scene[sc].type === 'slider') sliderTotal++;
  }
  for (var l = 0; l < scene.length; l++) {
    var lPrim = scene[l];
    if (!lPrim) continue;
    // Clean mode (SET_CLEAN_MODE) — strip on-canvas TEXT CHROME (formula surface,
    // sliders, callout captions, board marks) for a bare full-screen picture;
    // keep the physical scene + object labels + geometry (angle_arc/axes/vector).
    if (PM_cleanMode && (lPrim.type === 'formula_box' || lPrim.type === 'slider'
        || lPrim.type === 'annotation' || lPrim.type === 'derivation_step'
        || lPrim.type === 'mark_badge')) continue;
    if (lPrim.type === 'label') drawLabel(lPrim);
    else if (lPrim.type === 'annotation') drawAnnotation(lPrim);
    else if (lPrim.type === 'angle_arc') drawAngleArc(lPrim);
    else if (lPrim.type === 'formula_box') drawFormulaBox(lPrim);
    else if (lPrim.type === 'axes') drawAxes(lPrim);
    else if (lPrim.type === 'vector') drawVector(lPrim);
    else if (lPrim.type === 'motion_path') drawMotionPath(lPrim);
    else if (lPrim.type === 'locus_trace') drawLocusTrace(lPrim);
    else if (lPrim.type === 'comparison_panel') drawComparisonPanel(lPrim);
    else if (lPrim.type === 'derivation_step') drawDerivationStep(lPrim);
    else if (lPrim.type === 'mark_badge') drawMarkBadge(lPrim);
    else if (lPrim.type === 'slider') { drawCanvasSlider(lPrim, sliderSeen, sliderTotal); sliderSeen++; }
    // ── Premium primitives (Phase 0 validation demo, sessions 56+) ──
    else if (lPrim.type === 'glow_focus')     drawGlowFocus(lPrim);
    else if (lPrim.type === 'animated_path')  drawAnimatedPath(lPrim);
    else if (lPrim.type === 'sound_cue')      drawSoundCue(lPrim);
    else if (lPrim.type === 'particle_field') drawParticleField(lPrim);
    else if (lPrim.type === 'smooth_camera')  drawSmoothCamera(lPrim);
    else if (lPrim.type === 'umbrella_scene') drawUmbrellaScene(lPrim);
  }
  // smooth_camera close — matches PM_beginSmoothCameraIfActive(scene) at the top of draw().
  PM_endSmoothCameraIfActive();

  // Diagnostic text top-right — opt-in via PM_config.show_diagnostic. Off by
  // default so STATE_1 doesn't pre-answer the pedagogical question with a
  // "w = 19.60" readout before weight has been introduced.
  if (PM_config && PM_config.show_diagnostic && !PM_cleanMode) {
    fill(200); noStroke(); textSize(11); textAlign(RIGHT, TOP);
    var d = PM_physics.derived || {};
    var diagY = 10;
    for (var k in d) {
      if (!Object.prototype.hasOwnProperty.call(d, k)) continue;
      var v = d[k];
      text(k + ' = ' + (typeof v === 'number' ? v.toFixed(2) : String(v)), 750, diagY);
      diagY += 14;
    }
  }
  // (Concept debug badge removed — was leaking as "[pcpl] …" into the student UI.)
}

window.addEventListener('message', function(e) {
  if (!e.data) return;
  // Audio gesture-unlock — parent (TeacherPlayer) sends USER_GESTURE on first
  // click/tap; iframe needs the signal to legally resume AudioContext under
  // browser autoplay policy. sound_cue is silent until this fires.
  if (e.data.type === 'USER_GESTURE') {
    PM_audioUnlocked = true;
    var ctxResumeTarget = PM_ensureAudioCtx();
    if (ctxResumeTarget && ctxResumeTarget.state === 'suspended') {
      try { ctxResumeTarget.resume(); } catch (err) {}
    }
    return;
  }
  if (e.data.type === 'SET_STATE') {
    var newState = e.data.state;
    var isNewState = newState !== PM_currentState;
    PM_currentState = newState;
    window.PM_currentState = PM_currentState;   // mirror to window (field_3d/particle_field parity)
    // Rule 36 / 26b: any fresh SET_STATE releases an existing freeze pin — the
    // player re-pins with its own SET_TIME_FREEZE if it wants one.
    PM_frozen = false;
    PM_pinCatchupPending = false;
    // Only reset registries + re-trigger entry animations when truly switching state.
    // Same-state SET_STATE (from a slider drag carrying updated variables) must NOT
    // re-animate force_components — it should just flow smoothly with new magnitudes.
    if (isNewState) {
      PM_bodyRegistry = {};
      PM_surfaceRegistry = {};
      PM_endpointRegistry = {}; // WP-R5 — stale anchor_to targets don't survive a real state switch
      PM_cueOverrides = {};   // player re-sends SET_CUE_TIME after SET_STATE
      PM_glowOverride = null; // SET_GLOW is per-sentence; a fresh state starts on its authored focal
      PM_resetSimClock();     // clock 0 + accum 0 + Engine 20 motion wipe (Rule 36) + choreo cache wipe
      PM_userTouched = {};    // WP-R5 — seizure is per-state only; a fresh state starts un-seized
    }
    // Deep-dive sub-state hook: if the host passes an inline scene in the
    // SET_STATE message, shadow the corresponding entry in PM_config.states
    // so the draw() loop's scene lookup finds it. Sub-state ids are unique
    // (e.g., STATE_3_DEEPDIVE_1) — never overwrite the parent's own entry,
    // so exiting deep-dive SET_STATE-ing back to 'STATE_3' still works.
    if (Array.isArray(e.data.inline_scene_composition)) {
      if (!PM_config.states) PM_config.states = {};
      PM_config.states[newState] = {
        scene_composition: e.data.inline_scene_composition,
        choreography_sequence: e.data.inline_choreography || undefined
      };
    }
    var vars = (e.data.variables && typeof e.data.variables === 'object')
      ? e.data.variables
      : PM_resolveStateVars(PM_currentState);
    // Merge inline variables if provided (deep-dive sub-state can override
    // defaults, e.g., force theta=45 for a worked-example sub-step).
    if (e.data.inline_variables && typeof e.data.inline_variables === 'object') {
      for (var ivk in e.data.inline_variables) {
        if (Object.prototype.hasOwnProperty.call(e.data.inline_variables, ivk)) {
          vars[ivk] = e.data.inline_variables[ivk];
        }
      }
    }
    // Overlay slider values ONLY for variables the new state actually authors
    // as a slider primitive. Blanket overlay breaks STATE_2 (horizontal desk,
    // theta should be 0) when the user has dragged a slider in STATE_5 to e.g.
    // 32° — the old theta value would bleed back and tilt the N arrow.
    var newStateData = PM_config && PM_config.states && PM_config.states[PM_currentState];
    var newScene = (newStateData && newStateData.scene_composition) || [];
    var stateSliderVars = {};
    for (var nsi = 0; nsi < newScene.length; nsi++) {
      var nsp = newScene[nsi];
      if (nsp && nsp.type === 'slider' && nsp.variable) {
        stateSliderVars[nsp.variable] = true;
      }
    }
    for (var svk in PM_sliderValues) {
      if (Object.prototype.hasOwnProperty.call(PM_sliderValues, svk) && stateSliderVars[svk]) {
        vars[svk] = PM_sliderValues[svk];
      }
    }
    PM_physics = computePhysics(PM_config.concept_id, vars);
    // Same-state SET_STATE carrying new variables (slider drag) — rewind the
    // sim clock so time-driven motions (atwood, free_fall, pendulum) re-run
    // with the new values, and re-seed Engine 20's motion state so a sliding
    // body restarts from its home pose under the new variables. Skips
    // re-entry registries so force labels transition smoothly. (The
    // isNewState case already reset the clock + motion above via
    // PM_resetSimClock().)
    if (!isNewState && e.data.variables) {
      PM_resetSimClock();
    }
    try { window.parent.postMessage({ type: 'STATE_REACHED', state: newState }, '*'); } catch (err) {}
  }

  // Bilateral PARAM_UPDATE listener: Panel B (or the relay) tells us a
  // physics variable changed. Merge into PM_sliderValues, recompute physics,
  // the draw() loop picks up the new PM_physics on the next frame.
  // Echo guard: ignore messages that match our last-emitted value.
  if (e.data.type === 'PARAM_UPDATE') {
    var pKey = e.data.key;
    var pVal = parseFloat(e.data.value);
    if (!pKey || !isFinite(pVal)) return;
    if (PM_sliderLastEmitted[pKey] === pVal) return;
    PM_sliderValues[pKey] = pVal;
    PM_sliderLastEmitted[pKey] = pVal; // suppress round-trip echo back out

    // Only re-apply slider vars that the current state actually authors as
    // sliders. Prevents a Panel-B slider drag from tilting N on a state whose
    // surface is horizontal (STATE_2) or at a fixed authored angle (STATE_3/4).
    var curStateData = PM_config && PM_config.states && PM_config.states[PM_currentState];
    var curScene = (curStateData && curStateData.scene_composition) || [];
    var curSliderVars = {};
    for (var csi = 0; csi < curScene.length; csi++) {
      var csp = curScene[csi];
      if (csp && csp.type === 'slider' && csp.variable) {
        curSliderVars[csp.variable] = true;
      }
    }
    var updatedVars = PM_resolveStateVars(PM_currentState) || {};
    for (var usk in PM_sliderValues) {
      if (Object.prototype.hasOwnProperty.call(PM_sliderValues, usk) && curSliderVars[usk]) {
        updatedVars[usk] = PM_sliderValues[usk];
      }
    }
    try {
      PM_physics = computePhysics(PM_config.concept_id, updatedVars);
    } catch (err) {}

    // Engine 20: slider drag resets the motion integrator — block snaps back
    // to its initial position and a new integration begins with the updated
    // variables. Re-init is deferred to next draw() so the updated surface
    // angle (re-registered by Pass 0) flows into the initial position math.
    PM_motionState = {};
    PM_motionConfig = {};
    PM_motionNeedsInit = true;
  }

  if (e.data.type === 'SET_TIME_FREEZE') {
    // Rule 36 determinism: a pin request resets the clock + Engine 20 motion
    // to a clean t=0 and arms the deterministic catch-up that runs inside
    // draw() (after Pass 0 re-registers this state's surfaces) — see
    // PM_pinCatchupPending above. Nothing here depends on wall-clock time, so
    // repeated requests for the SAME at_ms always reproduce the SAME frame.
    if (e.data.frozen === false) {
      PM_frozen = false;
    } else if (typeof e.data.at_ms === 'number') {
      PM_pinTargetMs = Math.max(0, e.data.at_ms);
      PM_resetSimClock();
      PM_frozen = true;
      PM_pinCatchupPending = true;
    }
  }

  // ▶ Play / Replay (root CLAUDE.md §6). The review player's rollTimeline()
  // fires RESET_TRAJECTORY then REPLAY_ANIMATIONS then an explicit unpin, so
  // both mean the same thing here: rewind THIS state's choreography to t=0 and
  // let it run. Without these the family had no Play path at all — selecting a
  // state ran its choreography once and ▶ Play did nothing, because the only
  // clock writes the renderer honoured were SET_TIME_FREEZE's.
  //
  // Releasing the pin is defensive, not redundant: onTimelineEnd() pins the
  // clock to hold a clean final frame, so a reset that left PM_frozen set would
  // rewind to 0 and stay stopped there. The player does send its own unpin
  // immediately after (idempotent), but a host that sends only RESET_TRAJECTORY
  // must still get motion.
  //
  // Deliberately does NOT touch PM_paused: PAUSE/RESUME is a separate host-level
  // control that moves clock and audio together (Rule 26b), and a teacher who
  // paused should stay paused until they resume. THE EYE never sends either
  // message, so frozen baselines are unaffected.
  if (e.data.type === 'RESET_TRAJECTORY' || e.data.type === 'REPLAY_ANIMATIONS') {
    PM_frozen = false;
    PM_pinCatchupPending = false;
    PM_resetSimClock();
  }

  if (e.data.type === 'SET_CUE_TIME') {
    if (e.data.cue) PM_cueOverrides[e.data.cue] = e.data.at_ms;
  }

  if (e.data.type === 'PAUSE') {
    PM_paused = true;   // clock + Engine 20 motion freeze together (Rule 26b)
  }

  if (e.data.type === 'RESUME') {
    PM_paused = false;
  }

  if (e.data.type === 'MUTE') {
    PM_muted = !!e.data.muted;   // Rule 26a — gates sound_cue playback only, never the clock
  }

  if (e.data.type === 'SET_CLEAN_MODE') {
    // Teacher Clean / full-screen (build_review_site.ts fsCleanBtn → sendCleanMode).
    // field_3d strips its DOM caption/formula/HUD/sliders via body.pm-clean CSS;
    // parametric's overlays are canvas-drawn, so draw() skips the chrome primitives
    // (formula_box / slider / annotation callouts / diagnostic / board marks) when
    // PM_cleanMode is on, leaving the bare physical picture (bodies/arrows/vectors/
    // arcs/axes/object labels). The player already hides its own #capStrip subtitle.
    PM_cleanMode = !!e.data.on;
  }

  if (e.data.type === 'SET_GLOW') {
    // Per-sentence narration-beat glow (build_review_site.ts sendGlow → s.glow).
    // target is a primitive id, an array of ids, or null to clear. Feeds
    // PM_focalEmphasis so the focal element can re-target on every narrated
    // sentence (field_3d parity); null falls back to the state's authored focal.
    var gt = e.data.target;
    PM_glowOverride = (gt == null) ? null : gt;
  }
});

// ─── SIM_READY fallback (p5 CDN failure watchdog) ───────────────────────────
// Mirrors particle_field_renderer.ts: if the p5 CDN script tag fails to load
// (offline classroom wifi, ad-blocker, etc.) setup() never runs and the parent
// player waits forever for SIM_READY. Fire a fallback after 3s so the player
// at least unblocks (with a broken sim) instead of hanging silently.
window.addEventListener('load', function() {
  setTimeout(function() {
    if (!PM_simReadyFired) {
      PM_simReadyFired = true;
      window.parent.postMessage({ type: 'SIM_READY' }, '*');
      console.error('[Renderer] p5 setup never ran (CDN failure?) — fallback SIM_READY fired');
    }
  }, 3000);
});
`;

export function assembleParametricHtml(config: ParametricConfig): string {
    // Compute physics in TypeScript and inject as precomputed data.
    // Renderer reads PM_PRECOMPUTED_PHYSICS if present, falls back to inline JS.
    const precomputed = computePhysics(config.concept_id, config.default_variables);
    const precomputedJson = precomputed ? JSON.stringify(precomputed) : 'null';
    const isAnswerSheet = config.canvas_style === 'answer_sheet';

    // Phase 2 — constraint solver host. Off by default; opt-in via
    // SUB_SIM_SOLVER_ENABLED env flag. When enabled, walks every state's
    // scene_composition and stamps `_solverPosition` onto layout-relationship
    // primitives. Draw functions inside PARAMETRIC_RENDERER_CODE prefer this
    // field over `spec.position`. When the flag is off, this is a no-op.
    solveSubSimLayout(config);

    const bodyStyle = isAnswerSheet
        ? "background-color: #FDFBF4; background-image: linear-gradient(180deg, rgba(250,240,220,0.45), rgba(253,251,244,0) 240px);"
        : "background: #0A0A1A;";

    const fontLink = isAnswerSheet
        ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Caveat:wght@500;700&display=swap" rel="stylesheet">`
        : "";

    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
${fontLink}
<style>
html, body { margin: 0; padding: 0; overflow: hidden; ${bodyStyle} }
body { display: flex; align-items: center; justify-content: center; height: 100vh; }
canvas { display: block; }
</style>
</head><body>
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"></script>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
window.PM_PRECOMPUTED_PHYSICS = ${precomputedJson};
</script>
<script>
${PREMIUM_PRIMITIVES_CODE}
${PARAMETRIC_RENDERER_CODE}
</script>
</body></html>`;
}
