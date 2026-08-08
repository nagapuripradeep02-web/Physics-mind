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

// The COMPLETE set of per-state fields the renderer body reads off
// PM_config.states[...] (bindings named stateData at :837/:2402/:3532 AND
// `state` inside PM_resolveStateVars — a scan for one binding name misses the
// other, which is how variable_overrides stayed droppable after the
// variable_choreography fix). Every config assembler must carry all of these;
// the parity test asserts this list against the renderer source, and the
// _assertOracleComplete check below makes adding a field here without
// extending PARAMETRIC_STATE_FIELDS a compile error.
export interface ParametricStateKnownFields {
    scene_composition?: unknown[];
    focal_primitive_id?: string;
    focal_sequence?: Array<{ highlight_primitive_id: string; duration_ms: number }>;
    variable_choreography?: unknown[];
    variable_overrides?: Record<string, number>;
}

// Open shape: authored extras (title, advance_mode, teacher_script, depth_ring,
// …) pass through untouched, so a passthrough assembler is type-safe without an
// `as` cast — and a hand-picked projection is visibly lossy instead of being
// rewarded by the checker.
export interface ParametricStateConfig extends ParametricStateKnownFields {
    [key: string]: unknown;
}

export const PARAMETRIC_STATE_FIELDS = [
    'scene_composition',
    'focal_primitive_id',
    'focal_sequence',
    'variable_choreography',
    'variable_overrides',
] as const satisfies readonly (keyof ParametricStateKnownFields)[];

type _MissingFromOracle = Exclude<keyof ParametricStateKnownFields, (typeof PARAMETRIC_STATE_FIELDS)[number]>;
const _assertOracleComplete: _MissingFromOracle extends never ? true : never = true;
void _assertOracleComplete;

export interface ParametricConfig {
    concept_id: string;
    scene_composition: unknown[];
    states?: Record<string, ParametricStateConfig>;
    default_variables: Record<string, number>;
    current_state?: string;
    // Assembly-time only: assembleParametricHtml() recomputes and embeds
    // PM_PRECOMPUTED_PHYSICS itself; nothing reads this field off the config.
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

function computePhysics_resultant_direction(vars) {
  var a = (vars && vars.a != null) ? vars.a : 3;
  var b = (vars && vars.b != null) ? vars.b : 4;
  var theta = (vars && vars.theta != null) ? vars.theta : 60;
  var probe_heading_deg = (vars && vars.probe_heading_deg != null) ? vars.probe_heading_deg : 0;
  var tracer_t = (vars && vars.tracer_t != null) ? vars.tracer_t : 0;
  var theta_rad = theta * Math.PI / 180;
  var shadow = b * Math.cos(theta_rad);
  var riser = b * Math.sin(theta_rad);
  var base = a + shadow;
  var R_mag = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(theta_rad));
  var alpha_deg = Math.atan2(riser, base) * 180 / Math.PI;   // quadrant-safe, never atan(riser/base)
  var tan_alpha = riser / base;
  return {
    concept_id: 'resultant_direction',
    variables: { a: a, b: b, theta: theta, probe_heading_deg: probe_heading_deg, tracer_t: tracer_t },
    derived: {
      shadow: shadow,
      riser: riser,
      base: base,
      R_mag: R_mag,
      alpha_deg: alpha_deg,
      tan_alpha: tan_alpha,
      P1_x: a,
      P1_y: 0,
      P2_x: a + shadow,
      P2_y: riser
    },
    forces: []
  };
}

// ── Chemistry namespace ───────────────────────────────────────────────────
// Bohr hydrogen energy levels: E_n = -13.6/n^2 eV, photon lambda = hc/dE.
// Concept-gated in the dispatcher below — never runs for a physics concept.
function computePhysics_bohr_model_energy_levels(vars) {
  var n_start = (vars && vars.n_start != null) ? vars.n_start : 3;
  var n_end = (vars && vars.n_end != null) ? vars.n_end : 2;
  var n_hi = Math.max(n_start, n_end);
  var n_lo = Math.min(n_start, n_end);
  var E_hi = -13.6 / (n_hi * n_hi);
  var E_lo = -13.6 / (n_lo * n_lo);
  // Precise (unrounded) delta drives lambda -- rounding delta_E_ev to 2dp
  // BEFORE dividing drifts lambda by up to 1 nm off the verified ledger
  // (e.g. 6 to 2 gives 411 nm instead of the verified 410 nm). Round only
  // for the DISPLAYED delta_E_ev, never for the lambda division itself.
  var deltaEPrecise = Math.abs(E_hi - E_lo);
  var delta_E_ev = Math.round(deltaEPrecise * 100) / 100;
  var direction = (n_end > n_start) ? 'absorb' : ((n_end < n_start) ? 'emit' : 'none');
  var lambda_nm = (deltaEPrecise > 0) ? Math.round(1240 / deltaEPrecise) : null;
  var spectral_region = (lambda_nm == null) ? 'none' : ((lambda_nm < 400) ? 'UV' : ((lambda_nm <= 700) ? 'VISIBLE' : 'IR'));
  return {
    concept_id: 'bohr_model_energy_levels',
    variables: { n_start: n_start, n_end: n_end },
    derived: {
      delta_E_ev: delta_E_ev,
      lambda_nm: lambda_nm,
      direction: direction,
      spectral_region: spectral_region,
      n_hi: n_hi,
      n_lo: n_lo
    },
    forces: []
  };
}

// law_of_conservation_of_mass: closed-system mass ledger for C(s) + O2(g) -> CO2(g),
// plus the STATE_5 rusting twin-misconception constants. tare/M_x are the
// declared physics_engine_config constants (see the JSON's variables block);
// re-declared here as literals since computePhysics_<id> never reads
// physics_engine_config directly (Bohr precedent). Concept-gated — never runs
// for a physics concept.
function computePhysics_law_of_conservation_of_mass(vars) {
  var m_C = (vars && vars.m_C != null) ? vars.m_C : 12;
  var vessel_sealed = (vars && vars.vessel_sealed != null) ? vars.vessel_sealed : 1;
  var tare = 38.0;
  var m_O2 = m_C * 32 / 12;
  var m_CO2 = m_C * 44 / 12;
  var n_C = m_C / 12;
  var m_reactants = m_C + m_O2;
  var m_products = m_CO2;
  var reading_initial = tare + m_C + (vessel_sealed ? m_O2 : 0);
  var reading_final = tare + (vessel_sealed ? (m_C + m_O2) : 0);
  var delta_reading = reading_final - reading_initial;
  // STATE_5 rusting ledger — fixed staged constants (chemistry block §1/§2),
  // independent of the m_C/vessel_sealed sliders.
  var m_Fe_before_S5 = 10.0;
  var m_gas_before_S5 = 5.0;
  var m_O2_reacted_S5 = 0.6;
  var m_solid_after_S5 = m_Fe_before_S5 + m_O2_reacted_S5;
  var m_gas_after_S5 = m_gas_before_S5 - m_O2_reacted_S5;
  var m_total_S5 = m_Fe_before_S5 + m_gas_before_S5;
  var atoms_scale_label = '≈ ' + n_C.toFixed(2) + ' × 6.022×10²³ atoms';
  return {
    concept_id: 'law_of_conservation_of_mass',
    variables: { m_C: m_C, vessel_sealed: vessel_sealed },
    derived: {
      m_O2: m_O2,
      m_CO2: m_CO2,
      n_C: n_C,
      m_reactants: m_reactants,
      m_products: m_products,
      reading_initial: reading_initial,
      reading_final: reading_final,
      delta_reading: delta_reading,
      m_solid_after_S5: m_solid_after_S5,
      m_gas_after_S5: m_gas_after_S5,
      m_total_S5: m_total_S5,
      atoms_scale_label: atoms_scale_label
    },
    forces: []
  };
}

// unit_circle_to_sine_wave — MATHEMATICS namespace (src/data/concepts/mathematics/),
// the first mathematics concept. Iframe-side twin of the TS engine
// (unitCircleToSineWaveEngine in physicsEngine/concepts/) — both implement the
// SAME formula contract, per the scar
// parametric_computephysics_missing_silent_template_leak: standing up a new
// parametric-family concept is never data-only, and without a non-null return
// here PM_physics stays null, PM_liveExprVars()/PM_liveVarsWithDerived() fall
// back to the STATIC default_variables, and every body, vector, arc and label
// freezes at its authoring default while the {interpolations} leak as literal
// braces.
//
// UNITS: theta/phi/phi_r are DEGREES (the fleet convention for angle-driven PCPL
// concepts — cf. computePhysics_newton_second_law_direction's theta_F, and
// resultant_direction's theta). Degrees are what drawCanvasSlider's caption
// formatter prints verbatim (it has no unit-conversion field, so a radian value
// would drag-caption as "3.9" instead of "210°") and what drawAngleArc consumes
// natively. Every trig call converts inline.
//
// phi / phi_r are choreography-only sweep parameters and MUST NEVER be authored
// as sliders: PM_choreoVarsAtTime merges a live slider value into every
// historical sample of a locus_trace, so a trace parameterised on a slider
// variable collapses to a point on first drag (engine_bug_queue:
// pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve).
function computePhysics_unit_circle_to_sine_wave(vars) {
  var theta = (vars && typeof vars.theta === 'number' && isFinite(vars.theta)) ? vars.theta : 0;
  var phi   = (vars && typeof vars.phi   === 'number' && isFinite(vars.phi))   ? vars.phi   : 0;
  var phi_r = (vars && typeof vars.phi_r === 'number' && isFinite(vars.phi_r)) ? vars.phi_r : 0;

  var theta_rad = theta * Math.PI / 180;
  var sin_theta = Math.sin(theta_rad);
  var cos_theta = Math.cos(theta_rad);
  // s does DOUBLE DUTY: the radian measure of theta AND the arc length in
  // radius-lengths. r === 1 always in this concept (nothing in PCPL draws a
  // circle at a live radius — body size is number-only), so arc length
  // = theta_rad * r = theta_rad exactly. That identity is what STATE_2 teaches,
  // and it is why the dual-unit HUD reads "theta = {s} rad ({theta} deg)":
  // the radian slot is s, never the raw theta variable.
  var s = theta_rad;

  return {
    concept_id: 'unit_circle_to_sine_wave',
    variables: { theta: theta, phi: phi, phi_r: phi_r },
    derived: { sin_theta: sin_theta, cos_theta: cos_theta, s: s },
    forces: []
  };
}

// graph_transformations — MATHEMATICS namespace (src/data/concepts/mathematics/),
// the SECOND mathematics concept and the FIRST consumer of the cartesian_plane /
// function_plot / plot_point primitive family (Phase 0, PRs #36-#40). Iframe-side
// twin of the TS engine (graphTransformationsEngine in physicsEngine/concepts/) —
// both implement the SAME formula contract, per the scar
// parametric_computephysics_missing_silent_template_leak, here BINDING (P2-8):
// without a non-null return here draw() returns before any primitive paints
// (@5105, the "Unknown concept" blank-canvas branch) with zero console/page
// errors — THE EYE would photograph the blank frame and report a clean run.
//
// UNITLESS: a, b, h, k are the taught parameters (vertical stretch, horizontal
// stretch/compress, horizontal shift, vertical shift). xdraw/hg are
// choreography-only sweep drivers (S1's draw-in edge, S3's wrong-guess offset)
// and are NEVER authored as sliders anywhere in this concept.
//
// This function computes nothing the geometry doesn't — every scene_composition
// primitive (function_plot, plot_point, the S5 bracket) evaluates its own
// x_expr/y_expr/from_expr/to_expr directly against a/b/h/k. It exists to make
// PM_physics non-null, carry the echo net (WP-F2, below), and discharge the
// no-literal-'{' duty (Rule 24) — the derived trio (p_prime_x/p_prime_y/
// bracket_width) is published for completeness/documentation parity with the
// JSON's own physics_engine_config.computed_outputs, even though every
// consuming primitive re-derives the same values inline via its own *_expr.
function computePhysics_graph_transformations(vars) {
  var a = (vars && typeof vars.a === 'number' && isFinite(vars.a)) ? vars.a : 1;
  var b = (vars && typeof vars.b === 'number' && isFinite(vars.b) && vars.b !== 0) ? vars.b : 1;
  var h = (vars && typeof vars.h === 'number' && isFinite(vars.h)) ? vars.h : 0;
  var k = (vars && typeof vars.k === 'number' && isFinite(vars.k)) ? vars.k : 0;
  var xdraw = (vars && typeof vars.xdraw === 'number' && isFinite(vars.xdraw)) ? vars.xdraw : -6.5;
  var hg = (vars && typeof vars.hg === 'number' && isFinite(vars.hg)) ? vars.hg : 0;

  var p_prime_x = Math.PI / 2 / b + h;
  var p_prime_y = a * Math.sin(Math.PI / 2) + k;
  var bracket_width = 2 * Math.PI / b;

  return {
    concept_id: 'graph_transformations',
    variables: { a: a, b: b, h: h, k: k, xdraw: xdraw, hg: hg },
    derived: { p_prime_x: p_prime_x, p_prime_y: p_prime_y, bracket_width: bracket_width },
    forces: []
  };
}

// derivative_as_secant_limit — MATHEMATICS namespace (src/data/concepts/mathematics/),
// the SECOND mathematics concept and the first to ride the cartesian_plane /
// secant_line / tangent_line family (CP-A...CP-D). Iframe-side twin of the TS
// engine (derivativeAsSecantLimitEngine in physicsEngine/concepts/) — both
// implement the SAME (trivial) contract, per the scar
// parametric_computephysics_missing_silent_template_leak (same reasoning as
// unit_circle_to_sine_wave above): without a non-null return here PM_physics
// stays null and every plot_point/secant_line/tangent_line/label on this
// concept freezes at its authoring default or leaks a literal {x0} brace.
//
// DELIBERATE PASSTHROUGH — derived: {} is not an oversight. Per the
// mathematics_author's binding constraint (derivative_as_secant_limit_
// mathematics_block.md, engine_config.constraints #2/#3): the chord slope
// (x0 + h/2) and the tangent slope (x0) are each computed EXACTLY ONCE,
// inside PM_secantLineCompute / PM_tangentLineCompute (the two line
// primitives' own draw-time math) — never a second time here. A derived
// chord_slope/tangent_slope key on this function would be a second live
// implementation of the same number, which is exactly the sigma/pi defect
// class (a slider reading one value beside a HUD reading a stale one) the
// "one quantity, one readout" doctrine exists to prevent. Every label that
// needs x0/xq/hlog/hz/u/xdraw reads them straight out of 'variables' below;
// no label anywhere renders the CHORD slope (the narrowed h=0 safety
// constraint, P1-2).
function computePhysics_derivative_as_secant_limit(vars) {
  var x0    = (vars && typeof vars.x0    === 'number' && isFinite(vars.x0))    ? vars.x0    : 1;
  var xq    = (vars && typeof vars.xq    === 'number' && isFinite(vars.xq))    ? vars.xq    : 1.9;
  var hlog  = (vars && typeof vars.hlog  === 'number' && isFinite(vars.hlog))  ? vars.hlog  : 0;
  var hz    = (vars && typeof vars.hz    === 'number' && isFinite(vars.hz))    ? vars.hz    : 1;
  var u     = (vars && typeof vars.u     === 'number' && isFinite(vars.u))     ? vars.u     : -1.6;
  var xdraw = (vars && typeof vars.xdraw === 'number' && isFinite(vars.xdraw)) ? vars.xdraw : -2.1;
  return {
    concept_id: 'derivative_as_secant_limit',
    variables: { x0: x0, xq: xq, hlog: hlog, hz: hz, u: u, xdraw: xdraw },
    derived: {},
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
  else if (conceptId === 'resultant_direction') result = computePhysics_resultant_direction(vars);
  // Chemistry namespace (src/data/concepts/chemistry/) — concept-gated, fires
  // only for this id; the physics dispatch above is byte-unchanged.
  else if (conceptId === 'bohr_model_energy_levels') result = computePhysics_bohr_model_energy_levels(vars);
  else if (conceptId === 'law_of_conservation_of_mass') result = computePhysics_law_of_conservation_of_mass(vars);
  // Mathematics namespace (src/data/concepts/mathematics/) — same concept-gated
  // pattern as the chemistry pair above; fires only for this id, so the physics
  // dispatch remains byte-unchanged.
  else if (conceptId === 'unit_circle_to_sine_wave') result = computePhysics_unit_circle_to_sine_wave(vars);
  else if (conceptId === 'graph_transformations') result = computePhysics_graph_transformations(vars);
  else if (conceptId === 'derivative_as_secant_limit') result = computePhysics_derivative_as_secant_limit(vars);

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
//
// D11 (AMENDMENT 2 / F6 supersession, CP-C2) — ALSO merges PM_riemannPublish,
// deliberately kept in lockstep with PM_liveExprVars' own merge (same map,
// same last-wins order, same hasOwnProperty guard). This function and
// PM_liveExprVars are otherwise byte-for-byte identical, and PM_liveExprVars'
// own header (immediately below) states why that duplication is dangerous
// rather than incidental: "TEXT bindings and POSITION bindings read one
// scope instead of two copies that merely happen to agree — a state can't
// render a number and place its glyph from different values." A
// vector/force_arrow/angle_arc positioned by magnitude_expr off a published
// sum_var must resolve the SAME value a label's text_expr prints — letting
// this function's copy of the merge drop out of sync would be exactly the
// failure that comment already exists to prevent, recreated one call away.
function PM_liveVarsWithDerived() {
  var baseVars = (PM_physics && PM_physics.variables)
    || (PM_config && PM_config.default_variables)
    || {};
  var derivedVars = (PM_physics && PM_physics.derived) || {};
  var vars = {};
  for (var bk in baseVars) if (Object.prototype.hasOwnProperty.call(baseVars, bk)) vars[bk] = baseVars[bk];
  for (var dk in derivedVars) if (Object.prototype.hasOwnProperty.call(derivedVars, dk)) vars[dk] = derivedVars[dk];
  for (var pk in PM_riemannPublish) if (Object.prototype.hasOwnProperty.call(PM_riemannPublish, pk)) vars[pk] = PM_riemannPublish[pk];
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
  // D11 (AMENDMENT 2 / F6 supersession, CP-C2) — merge the frame-scoped
  // riemann_bars publish map LAST (see PM_riemannPublish's own declaration).
  // It lives outside PM_physics specifically so a mid-frame PM_physics
  // reassignment (drawPlotPoint's drag branch, PM_applyChoreography) can
  // never erase a value riemann_bars already published this frame.
  for (var pk in PM_riemannPublish) if (Object.prototype.hasOwnProperty.call(PM_riemannPublish, pk)) vars[pk] = PM_riemannPublish[pk];
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

  // CP-A (F7) — plane_id: when present (and not overridden by a surface
  // attach or the Engine 20 motion integrator — same "physics overrides win"
  // precedence as position_expr above), pos (whether it came from the literal
  // spec.position or the position_expr resolution above) is DATA and is
  // transformed through the plane's registered transform. Inert when
  // plane_id is absent/unregistered (PM_planeResolve returns null) — the
  // fleet-safety guarantee (gate §11).
  if (!attachedPos && !(spec.id && PM_motionState[spec.id]) && spec.plane_id) {
    var bodyPx = PM_planeResolve(spec, pos.x, pos.y);
    if (bodyPx) pos = bodyPx;
  }

  // size_expr — live variable-driven size, the size sibling of position_expr
  // above. Until now only POSITION could react to a slider: a circle's own
  // radius stayed frozen at its authored literal even while it rode to a
  // live coordinate, so a "radius tracks the slider" state had no honest
  // rendering path (a locus_trace under a ramping radius draws a spiral, not
  // a circle; scaling only a to_expr vector leaves a shrinking arrow inside a
  // fixed outline). This binds the body's own SIZE to the same variables so
  // the shape itself grows/shrinks with the number — e.g. the unit circle's
  // radius riding a slider, or a conic's semi-axes morphing continuously.
  //
  // Reads PM_liveExprVars() — the SAME merged variables+derived scope
  // PM_interpolate/position_expr use — so a size binding and a text/position
  // binding in one state can never disagree about the value they show.
  //
  // spec.size is authored as either a bare number (circle/stickman/pulley)
  // or a {w, h} object (rect/tree/door); size_expr mirrors whichever shape
  // spec.size already has — a single expression string for the scalar
  // shapes, a {w, h} object of expression strings for the boxed ones.
  // Resolved ONCE here, before the bw/bh derivation below, so every shape
  // inherits it without re-deriving the expression at each draw call site.
  //
  // Opt-in and last-resort by construction: a non-finite eval (malformed
  // expression, or a size_expr shape that doesn't match spec.size's own
  // shape) keeps the static authored spec.size, so a broken expression
  // degrades to today's layout rather than vanishing.
  var resolvedSize = spec.size;
  if (spec.size_expr != null) {
    var seVars = PM_liveExprVars();
    if (typeof spec.size_expr === 'string' && typeof spec.size === 'number') {
      var seVal = PM_safeEval(spec.size_expr, seVars);
      if (isFinite(seVal)) resolvedSize = seVal;
    } else if (typeof spec.size_expr === 'object' && spec.size && typeof spec.size === 'object') {
      var seW = (spec.size_expr.w != null) ? PM_safeEval(String(spec.size_expr.w), seVars) : spec.size.w;
      var seH = (spec.size_expr.h != null) ? PM_safeEval(String(spec.size_expr.h), seVars) : spec.size.h;
      if (isFinite(seW) && isFinite(seH)) resolvedSize = { w: seW, h: seH };
    }
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
  if (isRect) { bw = resolvedSize.w; bh = resolvedSize.h; }
  else if (isCircle) { bw = resolvedSize; bh = resolvedSize; }
  else if (isStickman) { bw = resolvedSize * 0.5; bh = resolvedSize; }
  else if (isTree) { bw = resolvedSize.w; bh = resolvedSize.h; }
  else if (isPulley) { bw = resolvedSize; bh = resolvedSize; }
  else if (isDoor) { bw = resolvedSize.w; bh = resolvedSize.h; }

  // Resolve label once: prefer label_expr (interactive scenes like
  // field_forces STATE_5 use "m = {m} kg"), fall back to static label.
  var labelText = spec.label_expr
    ? PM_interpolate(String(spec.label_expr))
    : (spec.label != null ? PM_interpolate(String(spec.label)) : '');

  // peter_parker:renderer_primitives, 2026-07-24 —
  // pcpl_angle_arc_no_focal_glow_channel: fetch AFTER labelText resolves,
  // right before the single push()/pop() that wraps every shape branch below,
  // so the emph.glowPx set/reset brackets the whole body (shape + label) —
  // mirrors drawLabel/drawAnnotation/drawForceArrow/drawFormulaBox exactly.
  var emph = PM_focalEmphasis(spec);

  push();
  var effectiveOpacity = (spec.opacity != null ? spec.opacity : 1) * animOpacityMultiplier * emph.alphaMul;
  fill(rgb[0], rgb[1], rgb[2], effectiveOpacity * 255);
  if (spec.border_color) {
    var brgb = PM_hexToRgb(spec.border_color);
    stroke(brgb[0], brgb[1], brgb[2]);
    strokeWeight(spec.border_width || 1);
  } else {
    noStroke();
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.fill_color || spec.border_color || '#6B7280';
    drawingContext.shadowBlur = emph.glowPx;
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
      circle(0, -bw / 2, bw);
      if (labelText) {
        fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(12);
        text(labelText, 0, -bw / 2);
      }
    } else if (isStickman) {
      drawStickman(0, 0, bh, rgb);
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
    else if (isCircle) circle(0, 0, bw);
    else if (isStickman) drawStickman(0, bh / 2, bh, rgb);
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
    else if (isCircle) circle(safeX, safeY, bw);
    else if (isStickman) drawStickman(safeX, safeY, bh, rgb);
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
      var r = bw / 2;
      fill(rgb[0], rgb[1], rgb[2]);
      stroke(30, 41, 59);
      strokeWeight(2);
      circle(safeX, safeY, bw);
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
      else if (isPulley) labelY = safeY + bw / 2 + 14;
      else if (spec.label_below && isCircle) labelY = safeY + bw / 2 + 12;
      else if (spec.label_below && (isRect || isBoxed)) labelY = safeY + bh + 12;
      else if (spec.label_above && (isRect || isBoxed)) labelY = safeY - 10;
      else labelY = cy;
      text(labelText, cx, labelY);
    }
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
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

  // position_expr — live variable-driven position, the label's own version of
  // drawBody's position_expr (see the block above drawBody's pos resolution).
  // Until now only a label's TEXT could react to a slider ("theta = {theta}
  // deg"), while the symbol naming a moving object sat frozen at its authored
  // coordinate — a unit-circle angle glyph beside a point riding the rim had
  // no way to ride along with it, so authors were forced to fake the anchor
  // via the owning primitive's own label field instead of a real label.
  //
  // Reads PM_liveExprVars() — the SAME merged variables+derived scope
  // PM_interpolate and drawBody's position_expr use — so a label's text and
  // its own position can never disagree about the value they describe.
  //
  // Precedence (documented here because it is not obvious): an authored
  // position_expr WINS over _solverPosition. The de-overlap solver resolves
  // positions from the state's static layout and cannot see expression-driven
  // geometry (open scar:
  // pcpl_solver_cannot_register_expression_driven_vector_primitives_as_obstacles)
  // — its slot for this label is therefore stale the instant the driving
  // variable moves, so a label that explicitly asks to track a live value
  // must beat it. spec.position remains the last-resort fallback exactly like
  // drawBody: a non-finite eval (malformed expression, or missing vars) keeps
  // today's static authored position rather than vanishing the label.
  if (spec.position_expr) {
    var lblVars = PM_liveExprVars();
    var lblX = (spec.position_expr.x != null) ? PM_safeEval(String(spec.position_expr.x), lblVars) : pos.x;
    var lblY = (spec.position_expr.y != null) ? PM_safeEval(String(spec.position_expr.y), lblVars) : pos.y;
    if (isFinite(lblX) && isFinite(lblY)) pos = { x: lblX, y: lblY };
  }

  // CP-A (F7/F11) — plane_id: pos (the literal spec.position OR the
  // position_expr result above) is DATA and is transformed through the
  // plane. This is the tracking-label contract: a label that carries BOTH
  // plane_id and position_expr evaluates position_expr in DATA coordinates,
  // never pixels — a pixel-space reading would force hand-carried scale
  // factors back into authored expressions, exactly what F1 exists to
  // remove. Runs AFTER position_expr so a live-tracking label (e.g. a curve
  // label riding a domain-driven x) resolves in one step. Inert when
  // plane_id is absent/unregistered (gate §11).
  if (spec.plane_id) {
    var lblPx = PM_planeResolve(spec, pos.x, pos.y);
    if (lblPx) pos = lblPx;
  }

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

// ── cartesian_plane (CP-A, F1-F7) ─────────────────────────────────────────
// bug_class: pcpl_has_no_coordinate_frame_so_every_graph_expression_carries_its_own_scale.
// Registers a data<->pixel transform other primitives resolve through
// (PM_planeResolve below) — the SAME registry pattern drawSurface uses for
// PM_surfaceRegistry/attach_to_surface, instanced for a coordinate frame
// instead of a line segment (D1). Nothing here is a new mechanism.
//
// D5 — clamp a value into [lo, hi]. Used for F2's origin resolution: clamping
// 0 into the axis range gives the origin INSIDE the frame when the range
// straddles 0, and the nearer EDGE when it does not (a range entirely > 0
// clamps to its own min; entirely < 0 clamps to its own max).
function PM_clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi);
}

function PM_gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { var t = b; b = a % b; a = t; }
  return a || 1;
}

// F3/D5 — tick label formatter. Ticks are AUTHORED (x_tick/y_tick, a data
// step) and this ONLY formats the value at each authored tick — it never
// invents a step ("auto-nice"), so a gate can check it without re-implementing
// a nicing algorithm. mode is a closed enum: 'number' | 'pi' | 'none'.
// 'pi' expresses value as a REDUCED fraction of PI: the smallest denominator
// D in 1..12 such that (value/PI)*D rounds to an integer within 1e-6 — exact
// for every authored case (PI/2, PI/3, PI/4, PI, ...; every x_tick a math
// concept would author is a rational multiple of PI). 'number' is a fixed
// tick_decimals toFixed — deliberately NOT the slider's own
// toFixed(step<1?1:0) formatter (D8: a coordinate readout owns its own
// precision, not the slider caption's).
function PM_formatTickLabel(value, mode, decimals) {
  if (mode === 'none') return '';
  if (mode === 'pi') {
    if (Math.abs(value) < 1e-9) return '0';
    var ratio = value / Math.PI;
    var bestN = null, bestD = 1;
    for (var D = 1; D <= 12; D++) {
      var n = Math.round(ratio * D);
      if (Math.abs(ratio * D - n) < 1e-6) { bestN = n; bestD = D; break; }
    }
    // PM_fmtNum (Rule 34c, engine-round extension of bug_class
    // ascii_minus_in_oncanvas_math_from_tofixed — founder_proxy P3-2 named
    // THIS formatter by name as a contributing site) — not a clean rational
    // multiple — approximate, never silently wrong, but the glyph must still
    // be the same Unicode minus every other surface on this plane uses.
    if (bestN === null) return PM_fmtNum(ratio, 2) + 'π';
    var g = PM_gcd(bestN, bestD);
    var num = bestN / g, den = bestD / g;
    var sign = num < 0 ? '−' : '';
    var absNum = Math.abs(num);
    var body = (absNum === 1) ? 'π' : (absNum + 'π');
    return (den === 1) ? (sign + body) : (sign + body + '/' + den);
  }
  // bug_class cartesian_plane_tick_values_enumerate_from_range_min_so_every_
  // axis_label_misreports_its_own_gridline — the pi branch above already
  // clamped near-zero to a clean '0'; the numeric branch never did, so a mark
  // that is mathematically zero (or landed a float epsilon off zero) could
  // round to the sign-preserving '-0' (e.g. (-0.4).toFixed(0) === '-0' in
  // JS). PM_fmtNum's own EPS clamp (identical threshold) now does this same
  // job AND emits the real Unicode minus for every genuine negative tick —
  // one funnel, not two independently-maintained near-zero guards.
  return PM_fmtNum(value, (typeof decimals === 'number') ? decimals : 0);
}

// D5 — pure enumeration of tick DATA values from rangeMin to rangeMax
// stepping by tick (tick <= 0 → no ticks). Shared by the gridline / tick-mark
// / tick-label passes below AND independently testable (check:cartesian-plane
// §3) with no p5 dependency.
//
// bug_class cartesian_plane_tick_values_enumerate_from_range_min_so_every_
// axis_label_misreports_its_own_gridline — the previous body walked
// rangeMin, rangeMin+tick, rangeMin+2*tick, ..., i.e. offsets from
// wherever the AUTHOR happened to set rangeMin, not from a round data-space
// coordinate. A gridline drawn at that value but LABELLED by
// PM_formatTickLabel's toFixed() rounding is a label that names a number
// its own mark is not at (off by up to a full step; the origin could be
// skipped or double-counted entirely). A tick label is a CLAIM about where
// the gridline sits, so the values must be pre-snapped to exact multiples
// of the tick step (measured from 0 — the number line's own origin, not the
// authored viewport) before either the mark or the label is built from them.
//
// Enumerated by INDEX (i * tick), not by repeated t += tick accumulation,
// so float drift never creeps in over a long range, and i=0 always yields
// an exact 0 (multiplying by zero is exact in IEEE754 — no epsilon needed
// to land the origin tick cleanly).
//
// Ruling on the old Math.min(t, rangeMax) boundary clamp: DROPPED, not
// kept. That clamp forced a final tick onto rangeMax even when rangeMax is
// not itself a multiple of the step — an unsnapped mark wearing a rounded
// label, the exact same defect in miniature. The correct behaviour (matches
// every graphing tool a student has seen) is: a boundary tick is drawn only
// when the range genuinely lands on one; otherwise the axis simply stops
// short of the edge with no tick there.
function PM_planeTickValues(rangeMin, rangeMax, tick) {
  var out = [];
  if (!(tick > 0)) return out;
  var EPS = 1e-9;
  var startIndex = Math.ceil((rangeMin / tick) - EPS);
  for (var i = startIndex; i * tick <= rangeMax + EPS; i++) {
    out.push(i * tick);
  }
  return out;
}

// D1 — the transform, built ONCE per plane per frame. PURE (no p5, no global
// registry write) so it is independently testable; drawCartesianPlane below
// is the only caller that stores the result into PM_planeRegistry.
// D2 — equal_scale SHRINKS the longer axis's pixel extent to match the
// shorter one (k = min(w/dx, h/dy)) and CENTRES the smaller effective rect
// inside the authored viewport; it never grows past the authored rect
// (growing would silently invade the slider band / caption zone, Rule 34d).
function PM_planeBuildTransform(spec) {
  var viewport = (spec && spec.viewport) || { x: 70, y: 78, w: 660, h: 372 };
  var xRange = (spec && spec.x_range) || { min: -6.5, max: 6.5 };
  var yRange = (spec && spec.y_range) || { min: -4, max: 4 };
  var dx = xRange.max - xRange.min;
  var dy = yRange.max - yRange.min;
  if (!(dx > 0) || !(dy > 0)) return null; // degenerate range — nothing to register or draw

  var equalScale = !!(spec && spec.equal_scale);
  var scaleX, scaleY, originPxX, originPxY, effViewport;
  if (equalScale) {
    var k = Math.min(viewport.w / dx, viewport.h / dy);
    var effW = dx * k, effH = dy * k;
    scaleX = k; scaleY = k;
    originPxX = viewport.x + (viewport.w - effW) / 2;
    originPxY = viewport.y + (viewport.h - effH) / 2;
    effViewport = { x: originPxX, y: originPxY, w: effW, h: effH };
  } else {
    scaleX = viewport.w / dx;
    scaleY = viewport.h / dy;
    originPxX = viewport.x;
    originPxY = viewport.y;
    effViewport = { x: viewport.x, y: viewport.y, w: viewport.w, h: viewport.h };
  }

  function toPx(x, y) {
    return {
      x: originPxX + (x - xRange.min) * scaleX,
      // canvas y grows DOWN, data y grows UP — this flip is the ONE place it
      // lives (D1); no authored expression ever carries it (§10c of the spec
      // driver).
      y: originPxY + (yRange.max - y) * scaleY
    };
  }
  function toData(px, py) {
    return {
      x: xRange.min + (px - originPxX) / scaleX,
      y: yRange.max - (py - originPxY) / scaleY
    };
  }

  return {
    toPx: toPx, toData: toData,
    viewport: effViewport, xRange: xRange, yRange: yRange,
    scaleX: scaleX, scaleY: scaleY
  };
}

// F7 — the single resolution funnel every plane_id-carrying primitive uses.
// spec.plane_id must name a plane registered THIS FRAME by drawCartesianPlane
// (Pass 0.25 runs before every consumer pass: bodies Pass 1, vectors/labels/
// locus_trace Pass 3). Returns the pixel-space {x,y} for the DATA-space
// (dataX, dataY) pair, or null when spec carries no plane_id, the named plane
// was not drawn this frame/state, or the inputs are non-finite — inert by
// construction when plane_id is absent (the fleet-safety guarantee, gate §11):
// every existing call site that gates a plane transform behind spec.plane_id
// truthiness runs zero new code for the 7 baseline-locked parametric concepts,
// none of which authors plane_id.
function PM_planeResolve(spec, dataX, dataY) {
  if (!spec || !spec.plane_id) return null;
  var plane = PM_planeRegistry[spec.plane_id];
  if (!plane) return null;
  if (!isFinite(dataX) || !isFinite(dataY)) return null;
  return plane.toPx(dataX, dataY);
}

// CP-B (F8-F10) — read-only metadata accessor for a registered plane's own
// ranges. NOT a transform: it performs no coordinate math and calls neither
// toPx nor toData — it only reports the xRange/yRange PM_planeBuildTransform
// already computed and drawCartesianPlane already stored (D1: the transform
// lives in ONE place). function_plot needs this for two things the point-only
// PM_planeResolve funnel cannot supply: defaulting x_domain to the plane's
// own x_range, and D4's break-on-range-exit check against y_range.
function PM_planeRangesOf(planeId) {
  var plane = PM_planeRegistry[planeId];
  return plane ? { xRange: plane.xRange, yRange: plane.yRange } : null;
}

// CP-B (F12) — the INVERSE of PM_planeResolve: pixel -> DATA. Needed by
// plot_point's drag path (a mouse position must become a data-space value to
// drive drag.bind_variable). Same registry, same inert-when-missing contract
// as PM_planeResolve, calling the SAME plane.toData PM_planeBuildTransform
// already built (D1) — this is that transform's existing mirror, not a new one.
function PM_planeResolveInverse(spec, px, py) {
  if (!spec || !spec.plane_id) return null;
  var plane = PM_planeRegistry[spec.plane_id];
  if (!plane) return null;
  if (!isFinite(px) || !isFinite(py)) return null;
  return plane.toData(px, py);
}

function drawCartesianPlane(spec) {
  if (!spec || !spec.id) return;
  // D6 — both standard brackets, before any drawing. Third recurrence of the
  // omission class on this renderer (drawAngleArc/drawLocusTrace missed the
  // focal channel; drawVector missed both) — see drawVector's header comment.
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);

  var plane = PM_planeBuildTransform(spec);
  if (!plane) return;
  PM_planeRegistry[spec.id] = plane;

  var xRange = plane.xRange, yRange = plane.yRange, effViewport = plane.viewport;
  var toPx = plane.toPx;

  // F2 — origin: inside the frame when the range straddles 0, clamped to the
  // nearer edge when it does not.
  var originDataX = PM_clamp(0, xRange.min, xRange.max);
  var originDataY = PM_clamp(0, yRange.min, yRange.max);

  var lineColor = PM_hexToRgb(spec.color || '#94A3B8');
  var gridColor = PM_hexToRgb(spec.grid_color || '#1E293B');
  var alpha255 = 255 * gate.alpha * emph.alphaMul;

  push();
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.color || '#94A3B8';
    drawingContext.shadowBlur = emph.glowPx;
  }

  var xTick = (typeof spec.x_tick === 'number') ? spec.x_tick : 0;
  var yTick = (typeof spec.y_tick === 'number') ? spec.y_tick : 0;
  var EPS = 1e-9;

  // F4 — gridlines, opt-in, dim, drawn BEHIND everything else: this whole
  // primitive runs in Pass 0.25, before bodies/vectors/labels (Pass 1/3), so
  // "behind everything" holds by pass order alone.
  if (spec.gridlines) {
    stroke(gridColor[0], gridColor[1], gridColor[2], alpha255 * 0.6);
    strokeWeight(1);
    // Gridline-ink obstacle registration — SOFT tier (bug_class
    // readout_resolver_predicate_saturated_by_gridline_ink_so_it_always_
    // returns_true, CRITICAL, engine round 2026-08-07/08). Registered into
    // PM_planeGridInkZones, NOT the hard PM_planeInkZones a curve/axis/
    // sibling-readout collision uses.
    //
    // Why gridlines cannot be a HARD obstacle, geometrically (not a tuning
    // call): a vertical gridline's registered band is, by construction,
    // narrow in x but spans the plane's FULL height in y (same for a
    // horizontal gridline in x) — an accurate record of where the drawn
    // pixel really is, unlike a diagonal curve/chord's own bbox (which
    // PM_registerLineInk subdivides because a SINGLE box around a long
    // diagonal blankets empty corners the line never touches). Subdividing a
    // straight axis-aligned gridline along its OWN length does not change
    // this: each sub-segment still spans padding-to-padding in the
    // perpendicular axis, and the union of the pieces still covers the same
    // full-length band. The actual saturation is arithmetic: on a plane with
    // x_tick pitch P (measured ~51px on graph_transformations' authored
    // 660px/13-unit plane) and a readout box of width W (~87px for a
    // 2-decimal coordinate pair at textSize 12), whenever W > P - 2*pad the
    // box CANNOT be positioned anywhere without straddling at least one
    // gridline column, by the pigeonhole principle — true at every padding
    // width, including a padding of zero. Folding that into the SAME boolean
    // OR as "crosses the bold x-axis" or "sits on a curve" made
    // PM_readoutCollides return true for every candidate on any plane whose
    // gridlines are enabled and whose tick pitch is smaller than a readout's
    // own width — a predicate true for every input is not a predicate (it
    // cannot filter a search, so PM_readoutResolveOffset's flip fired
    // unconditionally even when the FIRST, authored candidate had no real
    // collision at all — the "9 of 9 authored offsets inverted" defect).
    // Demoting gridlines to the least-overlap-area TIE-BREAK (see
    // PM_readoutResolveOffset below) keeps the predicate meaningful — an
    // authored offset that only grazes a dim, 60%-alpha decorative gridline
    // is accepted outright; one that lands on the bold axis line, a curve
    // stroke, or another readout's own box is still rejected exactly as
    // before, since none of THOSE moved tier.
    var GRID_INK_HALF = 4;
    var gxTicks = PM_planeTickValues(xRange.min, xRange.max, xTick);
    for (var gi = 0; gi < gxTicks.length; gi++) {
      var gTop = toPx(gxTicks[gi], yRange.max), gBot = toPx(gxTicks[gi], yRange.min);
      line(gTop.x, gTop.y, gBot.x, gBot.y);
      PM_registerGridInkZone(spec.id, {
        x0: gTop.x - GRID_INK_HALF, y0: Math.min(gTop.y, gBot.y),
        x1: gTop.x + GRID_INK_HALF, y1: Math.max(gTop.y, gBot.y)
      });
    }
    var gyTicks = PM_planeTickValues(yRange.min, yRange.max, yTick);
    for (var gj = 0; gj < gyTicks.length; gj++) {
      var gL = toPx(xRange.min, gyTicks[gj]), gR = toPx(xRange.max, gyTicks[gj]);
      line(gL.x, gL.y, gR.x, gR.y);
      PM_registerGridInkZone(spec.id, {
        x0: Math.min(gL.x, gR.x), y0: gL.y - GRID_INK_HALF,
        x1: Math.max(gL.x, gR.x), y1: gL.y + GRID_INK_HALF
      });
    }
  }

  // F2 — axis lines.
  stroke(lineColor[0], lineColor[1], lineColor[2], alpha255);
  strokeWeight(1.5);
  var yAxisTop = toPx(originDataX, yRange.max), yAxisBot = toPx(originDataX, yRange.min);
  line(yAxisTop.x, yAxisTop.y, yAxisBot.x, yAxisBot.y);
  var xAxisL = toPx(xRange.min, originDataY), xAxisR = toPx(xRange.max, originDataY);
  line(xAxisL.x, xAxisL.y, xAxisR.x, xAxisR.y);

  // F3 — ticks + tick labels. D5: ticks are AUTHORED (x_tick/y_tick is a
  // data-space step); x_tick_labels/y_tick_labels select the FORMATTER only.
  var tickDecimals = (typeof spec.tick_decimals === 'number') ? spec.tick_decimals : 0;
  var xLabelMode = spec.x_tick_labels || 'number';
  var yLabelMode = spec.y_tick_labels || 'number';
  var tickPx = 5;
  textSize(10);
  var xTicks = PM_planeTickValues(xRange.min, xRange.max, xTick);
  for (var xi = 0; xi < xTicks.length; xi++) {
    var txv = xTicks[xi];
    if (Math.abs(txv - originDataX) < EPS) continue; // the origin itself carries no separate tick
    stroke(lineColor[0], lineColor[1], lineColor[2], alpha255);
    strokeWeight(1);
    var tpX = toPx(txv, originDataY);
    line(tpX.x, tpX.y - tickPx, tpX.x, tpX.y + tickPx);
    if (xLabelMode !== 'none') {
      noStroke();
      fill(lineColor[0], lineColor[1], lineColor[2], alpha255);
      textAlign(CENTER, TOP);
      text(PM_formatTickLabel(txv, xLabelMode, tickDecimals), tpX.x, tpX.y + tickPx + 2);
    }
  }
  var yTicks = PM_planeTickValues(yRange.min, yRange.max, yTick);
  for (var yi = 0; yi < yTicks.length; yi++) {
    var tyv = yTicks[yi];
    if (Math.abs(tyv - originDataY) < EPS) continue;
    stroke(lineColor[0], lineColor[1], lineColor[2], alpha255);
    strokeWeight(1);
    var tpY = toPx(originDataX, tyv);
    line(tpY.x - tickPx, tpY.y, tpY.x + tickPx, tpY.y);
    if (yLabelMode !== 'none') {
      noStroke();
      fill(lineColor[0], lineColor[1], lineColor[2], alpha255);
      textAlign(RIGHT, CENTER);
      text(PM_formatTickLabel(tyv, yLabelMode, tickDecimals), tpY.x - tickPx - 3, tpY.y);
    }
  }

  // F6 — axis titles, quadrant-safe: the x-title never lands in the slider
  // band (PM_ZONES.CONTROL_ZONE.y = 460), the y-title never rises above the
  // (possibly equal_scale-shrunk) effective viewport's own top edge.
  noStroke();
  fill(lineColor[0], lineColor[1], lineColor[2], alpha255);
  textSize(12);
  if (spec.x_label) {
    var xtEnd = toPx(xRange.max, originDataY);
    var xLabelY = Math.min(xtEnd.y + 16, PM_ZONES.CONTROL_ZONE.y - 8);
    textAlign(RIGHT, TOP);
    text(String(spec.x_label), xtEnd.x, xLabelY);
  }
  if (spec.y_label) {
    var ytEnd = toPx(originDataX, yRange.max);
    textAlign(LEFT, BOTTOM);
    text(String(spec.y_label), ytEnd.x + 6, Math.max(ytEnd.y - 4, effViewport.y - 2));
  }

  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
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
  // peter_parker:renderer_primitives, 2026-08-05 — drawVector was the last
  // visible-mark primitive with NEITHER standard bracket. Every sibling
  // (drawBody :1217, drawLabel :1678, drawAnnotation :1718, drawSurface :1783,
  // drawForceArrow :1882, drawLocusTrace :2409, drawFormulaBox :2774) gates on
  // PM_animationGate and consumes PM_focalEmphasis; this one did neither, so
  // appear_at_ms/animate_in_ms authored on a vector were SILENTLY INERT and a
  // vector could be neither brightened as the state's focal nor dimmed as a
  // peer. Both halves fixed together — same omission, same file.
  // Scars: pcpl_vector_and_angle_arc_ignore_appear_at_ms_so_authored_reveal_chains_no_op,
  //        pcpl_drawvector_has_no_focal_glow_channel.
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);
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
  // CP-A (F7) — an anchor-resolved endpoint ("block.top") is ALREADY absolute
  // pixel space (read from PM_bodyRegistry/PM_surfaceRegistry, themselves
  // screen positions) and must never be run through the plane transform a
  // second time; a magnitude/direction-synthesized endpoint is a pixel delta
  // off an already-resolved 'from' for the same reason. Only a literal {x,y}
  // or an *_expr point is authored DATA under plane_id. Tracked per endpoint
  // so drawVector's existing three-path precedence is untouched.
  var fromIsPixelResolved = false;
  if (typeof from === 'string') {
    from = PM_resolveAnchor(from, PM_bodyRegistry, PM_surfaceRegistry);
    fromIsPixelResolved = true;
  } else if ((from == null || typeof from.x !== 'number') && typeof spec.from_expr === 'string') {
    vLive = vLive || PM_liveVarsWithDerived();
    from = PM_safeEvalPoint(spec.from_expr, vLive);
  }
  if (!from || typeof from.x !== 'number') from = { x: 0, y: 0 };
  if (spec.plane_id && !fromIsPixelResolved) {
    var fromPx = PM_planeResolve(spec, from.x, from.y);
    if (fromPx) from = fromPx;
  }
  var to;
  var toIsPixelResolved = false;
  if (spec.to != null) {
    to = spec.to;
    if (typeof to === 'string') { to = PM_resolveAnchor(to, PM_bodyRegistry, PM_surfaceRegistry); toIsPixelResolved = true; }
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
    // Deliberately a PIXEL delta off 'from' (which is already plane-resolved
    // above when plane_id is set) — magnitude_expr/direction_deg are not
    // plane-scaled by this dispatch (open boundary, see CP-A report).
    to = { x: from.x + magV * Math.cos(radV), y: from.y - magV * Math.sin(radV) };
    toIsPixelResolved = true;
  } else {
    to = { x: 0, y: 0 };
  }
  if (spec.plane_id && !toIsPixelResolved) {
    var toPx = PM_planeResolve(spec, to.x, to.y);
    if (toPx) to = toPx;
  }
  var fx = from.x + ox, fy = from.y + oy;
  var tx = to.x + ox, ty = to.y + oy;

  push();
  var vAlpha = 255 * gate.alpha * emph.alphaMul;
  stroke(rgb[0], rgb[1], rgb[2], vAlpha);
  strokeWeight(2);
  fill(rgb[0], rgb[1], rgb[2], vAlpha);
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.color || '#8B5CF6';
    drawingContext.shadowBlur = emph.glowPx;
  }

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
    // peter_parker:renderer_primitives, 2026-08-05 —
    // pcpl_vector_label_at_segment_midpoint_is_bisected_by_a_vertical_segment.
    // The label sat at the exact midpoint, 4px up. That clears a HORIZONTAL
    // segment (which is why it survived so long — nearly every labelled vector
    // in the fleet is horizontal or diagonal) but on a VERTICAL segment the
    // stroke runs straight through the glyph: the "y" on a height segment read
    // as a downward chevron, i.e. as a stray arrowhead, at 100% zoom.
    // Near-vertical segments now offset ACROSS the segment instead. Deliberately
    // scoped to the near-vertical case so every existing horizontal/diagonal
    // label keeps its authored position and the fleet re-baseline stays small.
    var lmx = (fx + tx) / 2, lmy = (fy + ty) / 2;
    if (Math.abs(ty - fy) > Math.abs(tx - fx)) {
      textAlign(LEFT, CENTER);
      text(spec.label, lmx + 7, lmy);
    } else {
      textAlign(CENTER, BOTTOM);
      text(spec.label, lmx, lmy - 4);
    }
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
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
  // CP-B (F5/F12) — "slider" here means "live-control": either a
  // type:'slider' primitive or a type:'plot_point' with a drag.bind_variable.
  // See PM_stateLiveControlVars's own header for why this must be ONE
  // function shared by every consumer instead of four separate scans.
  var stateSliderVars = PM_stateLiveControlVars(scene);
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
  // peter_parker:renderer_primitives, 2026-07-24 —
  // pcpl_angle_arc_no_focal_glow_channel companion fix (same missing-channel
  // class; drawLocusTrace never asked either).
  var emph = PM_focalEmphasis(spec);

  push();
  noFill();
  strokeWeight(sw);
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.color || '#8B5CF6';
    drawingContext.shadowBlur = emph.glowPx;
  }
  var prevPt = null;
  for (var i = 0; i < sampleCount; i++) {
    var tSample = startMs + i * step;
    var sampleVars = PM_choreoVarsAtTime(tSample);
    var x = PM_safeEval(spec.x_expr, sampleVars);
    var y = PM_safeEval(spec.y_expr, sampleVars);
    if (!isFinite(x) || !isFinite(y)) { prevPt = null; continue; }
    // CP-A (F7) — x_expr/y_expr evaluate to a raw (x, y) pair; under
    // plane_id that pair is DATA and is transformed through the plane before
    // it becomes a screen point. Inert when plane_id is absent/unregistered
    // (gate §11) — every existing locus_trace concept authors pixel-space
    // expressions with no plane_id and is untouched.
    if (spec.plane_id) {
      var ltPx = PM_planeResolve(spec, x, y);
      if (ltPx) { x = ltPx.x; y = ltPx.y; }
    }
    if (prevPt) {
      var alphaMul = 1;
      if (fadeTail && sampleCount > 1) alphaMul = 0.25 + 0.75 * (i / (sampleCount - 1));
      stroke(rgb[0], rgb[1], rgb[2], 255 * gate.alpha * alphaMul * emph.alphaMul);
      line(prevPt.x, prevPt.y, x, y);
    }
    prevPt = { x: x, y: y };
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// ── State live-control variables (CP-B, F5/F12) ────────────────────────────
// A "live-control" variable is one THIS STATE lets a teacher drive directly,
// right now: a type:'slider' primitive's own 'variable', or a
// type:'plot_point' primitive's 'drag.bind_variable'. Both write through the
// SAME PM_sliderValues store and both seize through the SAME PM_userTouched
// flag (the F5 clause — a plot_point drag must behave EXACTLY like a slider
// drag: PM_userTouched[bind_variable] = true on a genuine drag, cleared only
// on a true SET_STATE, same as drawCanvasSlider's own genuine-drag branch
// below). PM_choreoVarsAtTime, PM_applyChoreography, the SET_STATE handler
// and the PARAM_UPDATE handler each used to answer "is v a live control of
// this state" independently and identically (four copies of the same
// type:'slider' scan) — every one of them needed the SAME widening, because
// a plot_point drag is a second seizure door none of them could see.
// Centralised here once so a future live-control primitive (e.g. a CP-D
// draggable secant endpoint) only widens this ONE function, not four call
// sites again.
function PM_stateLiveControlVars(scene) {
  var out = {};
  if (!Array.isArray(scene)) return out;
  for (var i = 0; i < scene.length; i++) {
    var p = scene[i];
    if (!p) continue;
    if (p.type === 'slider' && p.variable) out[p.variable] = true;
    else if (p.type === 'plot_point' && p.drag && typeof p.drag.bind_variable === 'string') {
      out[p.drag.bind_variable] = true;
    }
  }
  return out;
}

// ── function_plot (CP-B, F8-F10) ───────────────────────────────────────────
// bug_class: pcpl_cannot_plot_y_equals_f_of_x_across_a_domain.
//
// D3 — NOT drawLocusTrace, deliberately. drawLocusTrace (above) samples over
// TIME via PM_choreoVarsAtTime, which merges the LIVE slider value into every
// historical sample — the recorded CRITICAL scar
// (pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve):
// a trace parameterised on a slider variable collapses to a point on the
// first drag. The mathematics graph-transformation family's a/b/h/k ARE
// sliders, so a curve of x must never go anywhere near that code path.
// function_plot instead samples the x-DOMAIN, every frame, against
// PM_liveExprVars() — the SAME live scope every other *_expr field reads
// (D8) — with x bound by THIS sampler loop and NEVER read from the variable
// scope. Time-swept accumulation (F17) stays locus_trace's job; the two
// primitives answer different questions and must not be merged.
//
// Pure sampler (no p5, no drawing) — independently testable
// (check:cartesian-plane sections 5/6/16). samples is clamped to the
// authored contract's closed range [40, 480] (MATHEMATICS_PHASE0_
// CARTESIAN_PLANE.md's function_plot contract), default 240.
//
// D4 — a sample that is non-finite, or (when yRange is supplied) whose y
// leaves yRange, ENDS the current polyline and starts a new one at the next
// in-range sample: never drawn, never clamped. tan(x) must not sprout a
// vertical line at pi/2; 1/x must not flatten onto the frame edge. Returns
// an array of POLYLINES, each an array of {x,y} DATA points (both endpoints
// included by construction: i/(n-1) reaches exactly 0 and exactly 1, so the
// first and last samples land exactly on domainMin/domainMax).
function PM_functionPlotSample(yExpr, domainMin, domainMax, samplesRaw, vars, yRange) {
  var out = [];
  if (!isFinite(domainMin) || !isFinite(domainMax) || !(domainMax > domainMin)) return out;
  var n = PM_clamp(Math.round((typeof samplesRaw === 'number') ? samplesRaw : 240), 40, 480);
  var scopeVars = {};
  for (var k in vars) if (Object.prototype.hasOwnProperty.call(vars, k)) scopeVars[k] = vars[k];
  var cur = [];
  var yEps = 1e-9;
  for (var i = 0; i < n; i++) {
    var x = domainMin + (domainMax - domainMin) * (i / (n - 1));
    scopeVars.x = x; // bound by the sampler — never read from vars (D3)
    var y = PM_safeEval(yExpr, scopeVars);
    var inRange = isFinite(y) && (!yRange || (y >= yRange.min - yEps && y <= yRange.max + yEps));
    if (!inRange) {
      if (cur.length > 1) out.push(cur);
      cur = [];
      continue;
    }
    cur.push({ x: x, y: y });
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

function drawFunctionPlot(spec) {
  if (!spec || typeof spec.y_expr !== 'string' || !spec.plane_id) return;
  // D6 — both standard brackets, before any drawing.
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);

  // Track this plane's LIVE curve formula for drawPlotPoint's default-offset
  // direction below (bug_class plot_point_default_offset_is_a_screen_axis_
  // constant_not_the_curves_own_tangent, MAJOR, engine round 2026-08-07/08).
  // A ghost/parent copy (style:'ghost' — graph_transformations authors a
  // faded parent curve alongside every transformed one) never overrides an
  // ALREADY-registered live curve, so a plot_point always rides the
  // TRANSFORMED curve's tangent, never the parent's — regardless of which
  // one this state happens to author first in scene_composition.
  if (spec.style !== 'ghost' || !PM_planeCurveExpr[spec.plane_id]) {
    PM_planeCurveExpr[spec.plane_id] = spec.y_expr;
  }

  // F7 — inert when the named plane isn't registered this frame. Ranges are
  // metadata only (PM_planeRangesOf performs no coordinate math); the actual
  // pixel conversion below goes exclusively through PM_planeResolve.
  var ranges = PM_planeRangesOf(spec.plane_id);
  if (!ranges) return;

  var domainSpec = spec.x_domain || {};
  var vars = PM_liveExprVars();
  var domainMin = (typeof domainSpec.min === 'number') ? domainSpec.min
    : (typeof domainSpec.min_expr === 'string') ? PM_safeEval(domainSpec.min_expr, vars)
    : ranges.xRange.min;
  var domainMax = (typeof domainSpec.max === 'number') ? domainSpec.max
    : (typeof domainSpec.max_expr === 'string') ? PM_safeEval(domainSpec.max_expr, vars)
    : ranges.xRange.max;

  var polylines = PM_functionPlotSample(spec.y_expr, domainMin, domainMax, spec.samples, vars, ranges.yRange);
  if (polylines.length === 0) return;

  var rgb = PM_hexToRgb(spec.color || '#38BDF8');
  var sw = (typeof spec.stroke_weight === 'number') ? spec.stroke_weight : 3;
  var style = spec.style || 'solid'; // 'solid' | 'dashed' | 'ghost'
  var styleAlphaMul = (style === 'ghost') ? 0.35 : 1;
  var alpha255 = 255 * gate.alpha * emph.alphaMul * styleAlphaMul;

  push();
  noFill();
  strokeWeight(sw);
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.color || '#38BDF8';
    drawingContext.shadowBlur = emph.glowPx;
  }
  if (style === 'dashed' && drawingContext.setLineDash) {
    drawingContext.setLineDash([sw * 2.5, sw * 2]);
  }
  stroke(rgb[0], rgb[1], rgb[2], alpha255);
  // Curve-ink obstacle registration (bug_class
  // parametric_readout_and_label_collision_awareness_does_not_cover_a_
  // sibling_primitives_curve_or_line_ink) — a small padded rect per ALREADY-
  // short sample-to-sample segment (never one bbox for the whole polyline,
  // which for a curve spanning most of the domain would blanket the plane).
  // function_plot draws BEFORE secant_line/tangent_line/plot_point in every
  // frame (Pass 0.3's fixed order, CP-C2/D12) so their readouts always see
  // this curve's ink already registered.
  var inkPad = Math.max(sw, 1) + 3;
  for (var pi = 0; pi < polylines.length; pi++) {
    var poly = polylines[pi];
    var prevPx = null;
    for (var qi = 0; qi < poly.length; qi++) {
      // F7 — the ONE funnel; no second transform path.
      var pxPt = PM_planeResolve(spec, poly[qi].x, poly[qi].y);
      if (!pxPt) { prevPx = null; continue; }
      if (prevPx) {
        line(prevPx.x, prevPx.y, pxPt.x, pxPt.y);
        PM_registerInkZone(spec.plane_id, {
          x0: Math.min(prevPx.x, pxPt.x) - inkPad, y0: Math.min(prevPx.y, pxPt.y) - inkPad,
          x1: Math.max(prevPx.x, pxPt.x) + inkPad, y1: Math.max(prevPx.y, pxPt.y) + inkPad
        });
      }
      prevPx = pxPt;
    }
  }
  if (style === 'dashed' && drawingContext.setLineDash) {
    drawingContext.setLineDash([]);
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// ── shared readout placement (bug_class parametric_canvas_drawn_readout_
// overprints_its_own_line_and_is_invisible_to_the_layout_checker, MAJOR/
// OPEN in engine_bug_queue) ─────────────────────────────────────────────────
// Every primitive that draws its OWN canvas text readout (plot_point,
// secant_line, tangent_line) shares ONE offset-resolution idiom, so
// plot_point's pre-existing readout.offset field and secant/tangent's
// newly-added one behave IDENTICALLY — one funnel, not three independently
// invented ones (mirrors F7's "one funnel" discipline for plane_id).

// Authored offset, with the SAME non-finite/type-fallback discipline every
// other *_expr/offset field on this engine uses: a present-but-malformed
// offset (not an object, x/y not a finite number) is treated as ABSENT,
// never as a crash and never as a silent NaN draw. Returns null when
// nothing usable was authored, so a caller falls through to ITS OWN
// computed default (plot_point: {10,-12}; secant/tangent: the
// perpendicular default below) — exactly mirroring how every *_expr caller
// already falls back to a literal when the expression is unusable.
function PM_readoutAuthoredOffset(spec) {
  var off = (spec && spec.readout && spec.readout.offset && typeof spec.readout.offset === 'object') ? spec.readout.offset : null;
  if (!off) return null;
  var ox = off.x, oy = off.y;
  if (typeof ox !== 'number' || !isFinite(ox) || typeof oy !== 'number' || !isFinite(oy)) return null;
  return { x: ox, y: oy };
}

// ── shared numeric formatter — real Unicode minus, never ASCII hyphen
// (bug_class ascii_minus_in_oncanvas_math_from_tofixed, MODERATE/FIXED —
// alex:json_author, shipped 3x; this is the missing engine hook the row's
// own prevention_rule names: "readout.format has no transform hook") ──────
// Number.prototype.toFixed() always emits ASCII U+002D regardless of sign,
// locale, or the font it is later drawn in — so any readout that
// interpolates toFixed() directly leaks an ASCII hyphen beside an authored
// Unicode U+2212 elsewhere on the SAME frame (Rule 34c). ONE funnel for
// every numeric-to-string conversion this readout family owns: round first
// (toFixed, so precision stays IEEE754-exact and unaffected by the
// substitution), THEN substitute the sign glyph on the rendered string —
// never the other way around.
//
// Near-zero clamp (engine round, bug_class ascii_minus_in_oncanvas_math_
// from_tofixed's sibling: "shipped twice, third occurrence via a magnitude
// instead of a glyph"). The clamp threshold MUST scale with decimals —
// a fixed 1e-9 (this function's own pre-round-2 value) sits three orders of
// magnitude below what ANY authored decimals setting can even display, so it
// never fires for the case that actually reaches the screen: a value that
// rounds to the printed "-0" at THIS precision but is not exactly zero
// (float noise, e.g. -0.003 at decimals:2, or -0.4 at decimals:0 — verified
// (-0.4).toFixed(0) is the literal string "-0" in JS). The correct clamp is
// "half of the smallest printable increment at this precision" —
// 0.5 * 10^-decimals — so a value that would ROUND to a false "-0" at the
// requested precision is caught, while a real negative that merely rounds
// SMALL (e.g. slope -0.006 at 2dp, which prints "-0.01", a genuine nonzero
// reading) is left alone: |-0.006| = 0.006 > 0.005 = 0.5*10^-2, untouched.
function PM_fmtNum(value, decimals) {
  var d = (typeof decimals === 'number' && isFinite(decimals)) ? decimals : 2;
  var eps = 0.5 * Math.pow(10, -d);
  var v = (Math.abs(value) < eps) ? 0 : value;
  return v.toFixed(d).replace('-', '−');
}

// Unit normal to the pixel-space segment p0->p1, biased to the "upward"
// screen normal (ny <= 0) so a line whose readout has no authored offset
// defaults to sitting ABOVE its own stroke — the same SIDE the old
// hardcoded -12 y always chose, but derived from the line's OWN direction
// rather than a fixed screen axis. Degenerates safely to straight up for a
// zero-length segment — never divides by zero, never returns NaN.
function PM_upwardNormal(p0, p1) {
  var dx = p1.x - p0.x, dy = p1.y - p0.y;
  var len = Math.sqrt(dx * dx + dy * dy);
  if (!(len > 1e-9)) return { x: 0, y: -1 };
  var nx = -dy / len, ny = dx / len;
  if (ny > 0) { nx = -nx; ny = -ny; }
  return { x: nx, y: ny };
}

// The offset that places a horizontal text box of (textW x textH) fully
// CLEAR of the line it annotates, given that the draw anchor lies ON that
// line (the chord midpoint for a secant, the tangency point for a tangent).
//
// Why a fixed perpendicular distance is NOT enough (the second half of
// bug_class parametric_canvas_drawn_readout_overprints_its_own_line...): a
// constant 13px displacement moves the box's CENTRE off the stroke, but a
// ~79px-wide horizontal label straddling a STEEP line still has its far end
// swinging straight back across it. Measured on the shipped content, all
// six secant-readout states of derivative_as_secant_limit were struck by
// ~17-18px under the constant-13px default — the label was moved, not
// freed.
//
// The closed-form remedy is the box's SUPPORT along the line normal: for an
// axis-aligned box with half-extents (hw, hh), its extent along a unit
// direction n is |hw*nx| + |hh*ny| (the standard separating-axis support
// function). Displacing the box centre along n by that support + a margin
// makes non-intersection a GEOMETRIC GUARANTEE at every slope, not a tuned
// constant that happens to work at some angles: for a vertical line it
// reduces to "half the text width + margin" (a pure sideways shove), for a
// horizontal line to "half the text height + margin" (the old behaviour),
// and interpolates exactly between them. One evaluation, no iteration, no
// search, no wall-clock, no random — Rule 36 safe and byte-stable under
// THE EYE's frozen clock.
//
// Returned in the draw call's own frame: text() is issued with
// textAlign(LEFT, CENTER), so the box spans [anchor+off.x, +textW]
// horizontally and is CENTRED on anchor+off.y vertically — hence the
// -hw term on x (turning a centre displacement into a left-edge offset)
// and none on y.
function PM_labelClearOffset(p0, p1, textW, textH, margin) {
  var n = PM_upwardNormal(p0, p1);
  var hw = (typeof textW === 'number' && isFinite(textW) ? textW : 0) / 2;
  var hh = (typeof textH === 'number' && isFinite(textH) ? textH : 0) / 2;
  var m = (typeof margin === 'number' && isFinite(margin)) ? margin : 6;
  var d = Math.abs(hw * n.x) + Math.abs(hh * n.y) + m;
  return { x: d * n.x - hw, y: d * n.y };
}

// ── plot_point collision-aware side selection ───────────────────────────
// A CONSTANT offset cannot serve a MOVING anchor (a drag-bound or slider-
// driven plot_point sweeps a whole range of positions) — no single {x,y}
// clears the axis lines, their tick-label bands, AND the canvas edge at
// every position the point can reach. Cheap, DETERMINISTIC side-test-and-
// flip: given the candidate placement's (measured) text box, if it
// collides with a known ink/label zone, mirror the offset to the anchor's
// OTHER side once. No solver, no iteration, no per-frame search — a pure
// function of (anchorPx, offset, textW, textH, the registered plane's OWN
// static geometry), so the SAME inputs always give the SAME output
// (required for THE EYE's frozen baselines to stay byte-identical under a
// fixed clock, Rule 36 — this reads no wall time, no random seed).
function PM_rectsOverlap(a, b) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}
function PM_readoutBBox(anchorPx, offset, textW, textH) {
  var x0 = anchorPx.x + offset.x;
  var y0 = anchorPx.y + offset.y - textH / 2;
  return { x0: x0, y0: y0, x1: x0 + textW, y1: y0 + textH };
}
// ── widened obstacle set (bug_class
// parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_
// primitives_curve_or_line_ink, MODERATE/OPEN — scoped fix for the READOUT
// side only; label/annotation-vs-ink collision stays a separate, larger
// mechanism and stays OPEN) ────────────────────────────────────────────────
// PM_readoutDangerZones used to know only the plane's OWN two axis/tick
// bands. Every OTHER thing a readout can land on top of — a gridline, a
// sibling curve's stroke, another readout's own box — was invisible to it.
// PM_planeInkZones is the per-frame, per-plane obstacle list every ink-
// producing primitive registers into AS IT DRAWS (drawCartesianPlane's
// gridlines, drawFunctionPlot's sampled polyline, drawSecantLine/
// drawTangentLine's own chord, and every readout's own FINAL resolved box —
// see PM_debugRecordReadout below). Declared + reset once per frame
// (draw(), immediately before Pass 0.25) alongside PM_planeRegistry.
//
// Order-dependent by construction, matching this resolver's existing "no
// search, no iteration" doctrine (Rule 36): a primitive drawn AFTER
// another's ink is the one that must dodge it, never the reverse — draw
// order in this renderer is FIXED per pass (region_fill, riemann_bars,
// function_plot, secant_line, tangent_line, plot_point; CP-C2/D12), not
// author order, so "what's registered so far" is deterministic and
// THE-EYE-stable, never a function of scene_composition array order.
function PM_readoutDangerZones(plane, planeId) {
  var vp = plane.viewport, xRange = plane.xRange, yRange = plane.yRange;
  var originDataX = PM_clamp(0, xRange.min, xRange.max);
  var originDataY = PM_clamp(0, yRange.min, yRange.max);
  var axisPxX = plane.toPx(originDataX, yRange.min).x;
  var axisPxY = plane.toPx(xRange.min, originDataY).y;
  var Y_LABEL_BAND = 30, X_LABEL_BAND = 20, AXIS_HALF = 3;
  var zones = [
    { x0: axisPxX - Y_LABEL_BAND, y0: vp.y, x1: axisPxX + AXIS_HALF, y1: vp.y + vp.h },
    { x0: vp.x, y0: axisPxY - AXIS_HALF, x1: vp.x + vp.w, y1: axisPxY + X_LABEL_BAND }
  ];
  var ink = planeId ? PM_planeInkZones[planeId] : null;
  if (ink) for (var ii = 0; ii < ink.length; ii++) zones.push(ink[ii]);
  return zones;
}

// Registers one axis-aligned obstacle rect for a plane, consumed by
// PM_readoutDangerZones above for the REST of this frame. Silently inert
// when planeId/rect are missing — every call site already gates on a
// resolved plane, so this never needs its own defensive early-return story.
function PM_registerInkZone(planeId, rect) {
  if (!planeId || !rect) return;
  if (!PM_planeInkZones[planeId]) PM_planeInkZones[planeId] = [];
  PM_planeInkZones[planeId].push(rect);
}

// SOFT-tier obstacle registry (see drawCartesianPlane's gridline header
// comment above for why gridline ink cannot share the HARD registry above).
// Read only by PM_readoutGridOverlapArea below — never by PM_readoutCollides
// / PM_readoutDangerZones, so a gridline can never by itself force the
// unconditional-flip path; it only tie-breaks among candidates that are
// ALREADY clear of every hard obstacle.
function PM_registerGridInkZone(planeId, rect) {
  if (!planeId || !rect) return;
  if (!PM_planeGridInkZones[planeId]) PM_planeGridInkZones[planeId] = [];
  PM_planeGridInkZones[planeId].push(rect);
}

// Registers a straight PIXEL-space segment's ink as a chain of small AABBs
// rather than one bbox spanning its full extent. A single bounding box
// around a long diagonal (a secant/tangent authored extend:'frame' can span
// most of the plane) would blanket almost the entire viewport as "danger" —
// a false-positive machine, not a fix. PM_INK_SEGMENT_SUBDIVISIONS is a
// FIXED constant (Rule 36: no adaptive/iterative subdivision), tight enough
// that even a corner-to-corner line registers a band that hugs its own
// pixels.
var PM_INK_SEGMENT_SUBDIVISIONS = 24;
function PM_registerLineInk(planeId, p0, p1, halfPad) {
  if (!planeId || !p0 || !p1) return;
  var n = PM_INK_SEGMENT_SUBDIVISIONS;
  var pad = (typeof halfPad === 'number' && isFinite(halfPad)) ? halfPad : 5;
  var prevX = p0.x, prevY = p0.y;
  for (var i = 1; i <= n; i++) {
    var t = i / n;
    var curX = p0.x + (p1.x - p0.x) * t;
    var curY = p0.y + (p1.y - p0.y) * t;
    PM_registerInkZone(planeId, {
      x0: Math.min(prevX, curX) - pad, y0: Math.min(prevY, curY) - pad,
      x1: Math.max(prevX, curX) + pad, y1: Math.max(prevY, curY) + pad
    });
    prevX = curX; prevY = curY;
  }
}

// ── __pmDebug — the resolved placement, exposed for reading rather than
// asserting (bug_class
// readout_collision_flip_is_wired_at_one_call_site_of_three_so_an_authored_
// offset_means_different_things_per_primitive, MODERATE/OPEN). Every
// authoring design note that reasoned about a readout's offset in prose
// rather than in the rendered frame is the direct product of this NOT
// existing before now. window.__pmDebug.readouts[primitive_id] = the FINAL
// (post-flip, post-clamp) anchor/offset/bbox actually drawn this frame —
// reset every frame (alongside PM_planeInkZones) so a stale id from a
// PRIOR state never survives a SET_STATE.
function PM_debugRecordReadout(id, anchorPx, offset, textW, textH) {
  if (!id || typeof window === 'undefined') return;
  if (!window.__pmDebug) window.__pmDebug = {};
  if (!window.__pmDebug.readouts) window.__pmDebug.readouts = {};
  window.__pmDebug.readouts[id] = {
    anchor: { x: anchorPx.x, y: anchorPx.y },
    offset: { x: offset.x, y: offset.y },
    bbox: PM_readoutBBox(anchorPx, offset, textW, textH)
  };
}
// Off-CANVAS (the 760x500 design space every state renders into —
// createCanvas(760,500) below), not merely off the plane's own inner
// viewport: a readout is routinely (and correctly) placed just outside a
// plane's own rectangle — that is normal layout, not a defect. Only
// actually leaving the visible canvas is a placement failure.
var PM_CANVAS_W = 760, PM_CANVAS_H = 500;
function PM_readoutOffCanvas(bbox) {
  return bbox.x0 < 0 || bbox.x1 > PM_CANVAS_W || bbox.y0 < 0 || bbox.y1 > PM_CANVAS_H;
}
// Pulls a text box back inside the 760x500 canvas by TRANSLATION, never by
// a side flip. These are different failure modes with different remedies
// and must not share one: a flip changes WHICH SIDE of the anchor the label
// sits on, which cannot fix a horizontal overrun — mirroring an offset of
// +12 to -12 moves a ~100px-wide box by 24px while its overhang past the
// edge may be far larger, so the flipped placement runs off too. Only a
// clamp is a fix. Runs LAST, after any authored offset / computed default /
// collision flip, so it is the final word on containment.
//
// Right/bottom are clamped BEFORE left/top so that a box wider or taller
// than the canvas keeps its START visible (a truncated tail is readable; a
// truncated head is not). A box already fully inside is returned byte-
// identical — the early-out makes that explicit, so this can never perturb
// a placement it was not needed for (and THE EYE's baselines stay stable
// wherever it does not fire).
function PM_clampOffsetToCanvas(anchorPx, offset, textW, textH) {
  var box = PM_readoutBBox(anchorPx, offset, textW, textH);
  if (!PM_readoutOffCanvas(box)) return offset;
  var ox = offset.x, oy = offset.y;
  if (anchorPx.x + ox + textW > PM_CANVAS_W) ox = PM_CANVAS_W - textW - anchorPx.x;
  if (anchorPx.x + ox < 0) ox = -anchorPx.x;
  if (anchorPx.y + oy + textH / 2 > PM_CANVAS_H) oy = PM_CANVAS_H - textH / 2 - anchorPx.y;
  if (anchorPx.y + oy - textH / 2 < 0) oy = textH / 2 - anchorPx.y;
  return { x: ox, y: oy };
}
// Ink/label-ZONE collision only — canvas containment is deliberately NOT
// tested here, because the two have different remedies (see
// PM_clampOffsetToCanvas above) and folding them together makes the wrong
// one fire: an off-canvas box would take a useless flip and still need the
// clamp afterwards, churning the placement for nothing. This predicate now
// answers exactly one question — "does the box land on the plane's own axis
// ink, a curve/chord's own stroke, or another readout's already-placed
// box?" (the HARD obstacle set, PM_readoutDangerZones) — deliberately NOT
// gridline ink (PM_planeGridInkZones, the SOFT tier — see
// drawCartesianPlane's gridline header comment for why). A true answer here
// is what the ordered-candidate search below treats as disqualifying.
function PM_readoutCollides(anchorPx, offset, textW, textH, plane, planeId) {
  var box = PM_readoutBBox(anchorPx, offset, textW, textH);
  var zones = PM_readoutDangerZones(plane, planeId);
  for (var i = 0; i < zones.length; i++) if (PM_rectsOverlap(box, zones[i])) return true;
  return false;
}
// Area of the AABB intersection of a and b, or 0 when disjoint (never
// negative — a degenerate/negative width or height clamps to 0 rather than
// contributing a spurious negative "overlap"). Pure, symmetric, O(1).
function PM_rectOverlapArea(a, b) {
  var ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
  var oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
  if (!(ox > 0) || !(oy > 0)) return 0;
  return ox * oy;
}
// Total HARD-obstacle overlap area for a candidate placement — the same
// zone set PM_readoutCollides tests, summed rather than OR'd, so two
// candidates that both collide can still be RANKED (a graze scores far
// lower than a placement centred on the axis line).
function PM_readoutHardOverlapArea(anchorPx, offset, textW, textH, plane, planeId) {
  var box = PM_readoutBBox(anchorPx, offset, textW, textH);
  var zones = PM_readoutDangerZones(plane, planeId);
  var total = 0;
  for (var i = 0; i < zones.length; i++) total += PM_rectOverlapArea(box, zones[i]);
  return total;
}
// Total SOFT-obstacle (gridline) overlap area — never contributes to
// PM_readoutCollides' boolean, only to the tie-break score below.
function PM_readoutGridOverlapArea(anchorPx, offset, textW, textH, planeId) {
  var box = PM_readoutBBox(anchorPx, offset, textW, textH);
  var zones = (planeId && PM_planeGridInkZones[planeId]) ? PM_planeGridInkZones[planeId] : [];
  var total = 0;
  for (var i = 0; i < zones.length; i++) total += PM_rectOverlapArea(box, zones[i]);
  return total;
}
// Combined score used ONLY to rank candidates once none is hard-collision-
// free (see PM_readoutResolveOffset below) — hard overlap dominates
// (weight 1), grid overlap is a light tie-break (weight 0.25) so it can
// never outrank a genuinely smaller hard collision, only choose between
// two hard-equal candidates.
var PM_GRID_OVERLAP_TIEBREAK_WEIGHT = 0.25;
function PM_readoutOverlapArea(anchorPx, offset, textW, textH, plane, planeId) {
  return PM_readoutHardOverlapArea(anchorPx, offset, textW, textH, plane, planeId)
    + PM_GRID_OVERLAP_TIEBREAK_WEIGHT * PM_readoutGridOverlapArea(anchorPx, offset, textW, textH, planeId);
}

// Resolves the FINAL {x,y} pixel offset to draw a readout at, from a FIXED,
// ORDERED candidate set — never a single blind flip (bug_class
// readout_resolver_flips_blind_without_testing_the_mirrored_candidate,
// CRITICAL, engine round 2026-08-07/08; the pre-round behaviour negated
// BOTH offset components unconditionally the instant ANY collision fired,
// including collisions the flip itself did not clear — measured on
// graph_transformations: 9 of 9 authored offsets inverted, the curve
// running through the P' readout in 7 of 8 states).
//
// Candidate order (every one ACTUALLY TESTED — Rule "never return a
// candidate you have not tested"):
//   1. the authored/computed candidate, unchanged
//   2. x-mirror   {-x, y}
//   3. y-mirror   {x, -y}
//   4. full mirror {-x, -y}
//   5/6. (only when localInk is supplied) +/- the unit normal to localInk's
//        own pixel-space segment, scaled to the candidate's own magnitude —
//        the same direction a plot_point riding a curve or a secant/tangent
//        readout's OWN chord would prefer, tried as an explicit alternative
//        rather than assumed as the default.
// The FIRST candidate clear of every HARD obstacle (axis lines, curve/
// chord ink, another readout's own box — PM_readoutCollides) is returned
// immediately, so a placement that was never broken is never touched (only
// gridline-grazing, the SOFT tier, cannot force this branch to keep
// searching). If NONE of the fixed candidates is hard-collision-free, the
// one with the LEAST total overlap area (hard-weighted, grid tie-broken —
// PM_readoutOverlapArea) is returned — still a candidate that was tested,
// never a guess.
//
// O(1): at most 6 candidates, each one rect-overlap test against a fixed
// zone list — no iteration to convergence, no wall-clock, no randomness,
// so THE EYE's frozen baselines stay byte-identical by construction
// (Rule 36).
//
// planeId/localInk are OPTIONAL and additive: every existing call site
// already passes plane_id, and a caller that omits planeId simply sees zero
// ink/grid zones (the original two-zone axis-band behaviour); a caller that
// omits localInk simply gets the 4 mirror candidates without the 2 normal
// ones — never a crash either way.
function PM_readoutResolveOffset(anchorPx, candidateOffset, textW, textH, plane, planeId, localInk) {
  if (!plane) return candidateOffset;
  var candidates = [
    candidateOffset,
    { x: -candidateOffset.x, y: candidateOffset.y },
    { x: candidateOffset.x, y: -candidateOffset.y },
    { x: -candidateOffset.x, y: -candidateOffset.y }
  ];
  if (localInk && localInk.p0 && localInk.p1) {
    var n = PM_upwardNormal(localInk.p0, localInk.p1);
    var mag = Math.sqrt(candidateOffset.x * candidateOffset.x + candidateOffset.y * candidateOffset.y);
    if (!(mag > 1e-6)) mag = Math.max(textW, textH) / 2 + 10;
    candidates.push({ x: mag * n.x, y: mag * n.y });
    candidates.push({ x: -mag * n.x, y: -mag * n.y });
  }
  var bestOff = candidates[0], bestScore = Infinity;
  for (var i = 0; i < candidates.length; i++) {
    var c = candidates[i];
    if (!PM_readoutCollides(anchorPx, c, textW, textH, plane, planeId)) return c;
    var score = PM_readoutOverlapArea(anchorPx, c, textW, textH, plane, planeId);
    if (score < bestScore) { bestScore = score; bestOff = c; }
  }
  return bestOff;
}

// ── plot_point (CP-B, F11-F12) ──────────────────────────────────────────────
// D8 — the readout and the picture must read the SAME scope in the same
// frame. Pure (no p5) so the gate can assert one-evaluation discipline
// directly (check:cartesian-plane section 7): computes x, y AND the
// formatted readout string from ONE vars snapshot — never two separately
// evaluated scopes that merely happen to agree. readout.decimals is this
// primitive's OWN precision (never the slider caption's hardcoded
// toFixed(step<1?1:0) — labelText, D8's other half).
function PM_plotPointResolve(spec, vars) {
  var x = PM_safeEval(spec.x_expr, vars);
  var y = PM_safeEval(spec.y_expr, vars);
  var readoutText = '';
  if (spec.readout && isFinite(x) && isFinite(y)) {
    var decimals = (typeof spec.readout.decimals === 'number') ? spec.readout.decimals : 2;
    var fmt = (typeof spec.readout.format === 'string') ? spec.readout.format : '({x}, {y})';
    // PM_fmtNum (Rule 34c) — real Unicode minus, never toFixed()'s ASCII hyphen.
    readoutText = fmt.split('{x}').join(PM_fmtNum(x, decimals)).split('{y}').join(PM_fmtNum(y, decimals));
  }
  return { x: x, y: y, readoutText: readoutText };
}

// Local pixel-space tangent of the CURVE a plot_point rides, at that point's
// own (already-resolved) data position — numeric differentiation of the
// REGISTERED function_plot's y_expr (PM_planeCurveExpr, set by
// drawFunctionPlot above), never of the point's OWN x_expr/y_expr. This
// matters because a point like Q (x_expr:"x0+1") is a REPARAMETERISATION of
// the same curve, not an independent one — probing dy/dx0 there would give
// the wrong tangent whenever the reparameterisation itself isn't 1:1
// (e.g. "x0+pow(10,hlog)" as hlog, not x0, sweeps). Evaluating the curve's
// own y_expr as a bare function of x sidesteps that entirely: whatever
// parameter actually moved the point, the curve's shape at this x is fixed.
//
// Returns a tiny pixel-space {p0,p1} segment along the tangent direction
// (feedable straight into PM_labelClearOffset/PM_upwardNormal, the same
// idiom secant_line/tangent_line already use for their own chord), or null
// when no curve is registered for this plane this frame, the probe's
// dx/dy comes out degenerate (zero-length — e.g. a vertical tangent at the
// probe's floating-point resolution), or any evaluation is non-finite.
// Callers fall back to a constant default in every null case — never a
// crash, never a NaN pixel.
var PM_TANGENT_PROBE_EPS = 1e-4;
function PM_plotPointCurveTangentPx(spec, vars, plane, x, y) {
  var curveExpr = (spec && spec.plane_id) ? PM_planeCurveExpr[spec.plane_id] : null;
  if (typeof curveExpr !== 'string' || !plane || !isFinite(x) || !isFinite(y)) return null;
  var probeScope = {};
  for (var k in vars) if (Object.prototype.hasOwnProperty.call(vars, k)) probeScope[k] = vars[k];
  probeScope.x = x + PM_TANGENT_PROBE_EPS;
  var yPlus = PM_safeEval(curveExpr, probeScope);
  if (!isFinite(yPlus)) return null;
  var p0 = plane.toPx(x, y);
  var p1 = plane.toPx(x + PM_TANGENT_PROBE_EPS, yPlus);
  if (!p0 || !p1 || !isFinite(p0.x) || !isFinite(p0.y) || !isFinite(p1.x) || !isFinite(p1.y)) return null;
  if (Math.abs(p1.x - p0.x) < 1e-9 && Math.abs(p1.y - p0.y) < 1e-9) return null;
  return { p0: p0, p1: p1 };
}

function drawPlotPoint(spec) {
  if (!spec || !spec.id || typeof spec.x_expr !== 'string' || typeof spec.y_expr !== 'string' || !spec.plane_id) return;
  // D6 — both standard brackets, before any drawing.
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);

  var vars = PM_liveExprVars();
  var resolved = PM_plotPointResolve(spec, vars);
  // F7 — the ONE funnel; also inert when x/y are non-finite (unresolvable
  // expression) or the named plane isn't registered this frame.
  var px = PM_planeResolve(spec, resolved.x, resolved.y);
  if (!px) return;

  // F12 (the F5 clause) — a genuine drag seizes drag.bind_variable EXACTLY
  // as drawCanvasSlider's genuine-drag branch seizes a slider variable
  // (below, ~PM_userTouched[spec.variable] = true): set PM_userTouched (so
  // choreography stands down — read via PM_stateLiveControlVars above by
  // every consumer), write through PM_sliderValues (the SAME store a
  // slider writes), recompute PM_physics and echo PARAM_UPDATE upward.
  // Hit-tested against THIS frame's already-resolved pixel position, mirror-
  // ing drawCanvasSlider's own knob hit-test, and sharing the SAME
  // PM_activeSliderId single-touch claim so a point-drag and a slider-drag
  // can never both fire from one mouse press.
  if (spec.drag && typeof spec.drag.bind_variable === 'string') {
    var hitR = ((typeof spec.size === 'number') ? spec.size : 12) + 8;
    var hit = mouseIsPressed && Math.hypot(mouseX - px.x, mouseY - px.y) < hitR;
    if (hit && PM_activeSliderId == null) PM_activeSliderId = spec.id;
    if (!mouseIsPressed) PM_activeSliderId = null;
    var isActive = PM_activeSliderId === spec.id;
    if (hit && isActive) {
      PM_userTouched[spec.drag.bind_variable] = true;
      var dataAtMouse = PM_planeResolveInverse(spec, mouseX, mouseY);
      if (dataAtMouse) {
        var dragMin = (typeof spec.drag.min === 'number') ? spec.drag.min : -Infinity;
        var dragMax = (typeof spec.drag.max === 'number') ? spec.drag.max : Infinity;
        var rawDrag = (spec.drag.axis === 'y') ? dataAtMouse.y : dataAtMouse.x;
        var snappedDrag = PM_clamp(rawDrag, dragMin, dragMax);
        if (PM_sliderValues[spec.drag.bind_variable] !== snappedDrag) {
          PM_sliderValues[spec.drag.bind_variable] = snappedDrag;
          var currentVars = PM_resolveStateVars(PM_currentState) || {};
          for (var sk in PM_sliderValues) {
            if (Object.prototype.hasOwnProperty.call(PM_sliderValues, sk)) currentVars[sk] = PM_sliderValues[sk];
          }
          try { PM_physics = computePhysics(PM_config.concept_id, currentVars); } catch (err) { /* keep last good PM_physics */ }
          if (PM_sliderLastEmitted[spec.drag.bind_variable] !== snappedDrag) {
            PM_sliderLastEmitted[spec.drag.bind_variable] = snappedDrag;
            try { window.parent.postMessage({ type: 'PARAM_UPDATE', key: spec.drag.bind_variable, value: snappedDrag }, '*'); } catch (e) {}
          }
        }
        // Re-resolve THIS frame against the just-updated scope so the point
        // visibly tracks the mouse in the same frame it is grabbed (D8: one
        // scope, not a frame behind).
        vars = PM_liveExprVars();
        resolved = PM_plotPointResolve(spec, vars);
        var pxNow = PM_planeResolve(spec, resolved.x, resolved.y);
        if (pxNow) px = pxNow;
      }
    }
  }

  var rgb = PM_hexToRgb(spec.color || '#FBBF24');
  var size = (typeof spec.size === 'number') ? spec.size : 12;
  var alpha255 = 255 * gate.alpha * emph.alphaMul;
  push();
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.color || '#FBBF24';
    drawingContext.shadowBlur = emph.glowPx;
  }
  noStroke();
  fill(rgb[0], rgb[1], rgb[2], alpha255);
  ellipse(px.x, px.y, size, size);
  if (resolved.readoutText) {
    fill(rgb[0], rgb[1], rgb[2], alpha255);
    noStroke();
    textSize(12);
    textAlign(LEFT, CENTER);
    // F-readout — candidate is the authored offset if usable, else a
    // DEFAULT DIRECTION derived from the curve this point actually rides
    // (bug_class plot_point_default_offset_is_a_screen_axis_constant_not_
    // the_curves_own_tangent): the outward normal to the local curve
    // tangent at this point's own data position, via the SAME width-aware
    // support-function displacement (PM_labelClearOffset) secant_line/
    // tangent_line already use for their own chord/tangent — so the label
    // clears the curve at every slope, not just the ones the old fixed
    // {10,-12} happened to clear. Falls back to that same {10,-12} only
    // when no curve is registered on this plane this frame (a plot_point
    // authored with no accompanying function_plot) or the tangent probe is
    // degenerate. Real measured text width (textWidth(), not an estimate)
    // feeds BOTH the default's own clearance math and the collision test
    // below — accurate for whatever string this frame's live variables
    // produced, and must be measured before the default can be computed.
    var readoutTW = textWidth(resolved.readoutText);
    var tangentPx = PM_plotPointCurveTangentPx(spec, vars, PM_planeRegistry[spec.plane_id], resolved.x, resolved.y);
    var defaultOff = tangentPx
      ? PM_labelClearOffset(tangentPx.p0, tangentPx.p1, readoutTW, 14, size / 2 + 8)
      : { x: 10, y: -12 };
    var candidateOff = PM_readoutAuthoredOffset(spec) || defaultOff;
    // Then collision-tested (ordered candidate set, see PM_readoutResolveOffset's
    // own header) against this frame's ACTUAL registered plane — a moving/
    // dragged point needs a live re-test every frame, not a one-time
    // authoring-side guess. localInk (tangentPx) feeds the resolver's own
    // +/- normal candidates when a curve tangent was resolvable, so the
    // TESTED alternative and the DEFAULT direction share one geometric idea
    // instead of two unrelated ones.
    var finalOff = PM_readoutResolveOffset(px, candidateOff, readoutTW, 14, PM_planeRegistry[spec.plane_id], spec.plane_id, tangentPx);
    // Containment runs LAST — after the authored/default offset and after
    // any axis-zone flip — so nothing downstream can push the box back out.
    finalOff = PM_clampOffsetToCanvas(px, finalOff, readoutTW, 14);
    text(resolved.readoutText, px.x + finalOff.x, px.y + finalOff.y);
    // __pmDebug — the RESOLVED placement, for reading rather than asserting.
    PM_debugRecordReadout(spec.id, px, finalOff, readoutTW, 14);
    // Register this readout's own final box as an obstacle for whatever
    // draws on this plane NEXT this frame (another plot_point later in the
    // same loop — e.g. Q reading P's already-placed box; fixes bug_class
    // readout_collision_flip_is_wired_at_one_call_site_of_three's G-1
    // recurrence: two point readouts overprinting each other).
    PM_registerInkZone(spec.plane_id, PM_readoutBBox(px, finalOff, readoutTW, 14));
  }
  // The marker DOT itself is an obstacle too ("check the offset against
  // every other point's marker AND readout box, not just against the
  // lines" — the prevention_rule this bug_class was filed under).
  // Registered AFTER this point's own readout is placed, so a point's
  // candidate offset is never tested against its OWN dot (every authored/
  // default offset already clears its own anchor by construction); a
  // LATER-drawn point in this same loop still sees it.
  PM_registerInkZone(spec.plane_id, { x0: px.x - size / 2 - 3, y0: px.y - size / 2 - 3, x1: px.x + size / 2 + 3, y1: px.y + size / 2 + 3 });
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// ── region_fill (CP-C1, F15 — bug_class:
// pcpl_cannot_shade_or_partition_the_region_under_a_curve) ─────────────────
// D7 — re-integrates from scratch every frame; nothing is cached between
// frames (no accumulated array, no memo across draw() calls). Pure sampler
// + piecewise trapezoidal integration (no p5, no PM_physics write — unlike
// riemann_bars below, region_fill publishes nothing; only its DRAWN pixels
// exist), so the gate can assert the computed AREA independently of any
// canvas call, and so the drawn polygon and the asserted area are the SAME
// evaluation (D8's "picture and readout read the same scope", applied here
// to "picture and gate assertion").
//
// signed:true splits [from,to] at every zero-crossing of (y - baseline),
// each crossing found by LINEAR INTERPOLATION between the two straddling
// samples (never "whichever grid sample happens to be nearer"), so both
// bands' areas stay accurate independent of whether a crossing lands
// exactly on a sample point. signed:false (or omitted) returns ONE segment
// spanning the whole domain. Either way 'totalSignedArea' is the plain
// signed integral of (y - baseline) — signed:true only additionally
// DECOMPOSES it into same-sign bands; it never changes the total (asserted
// in gate section 8, whose negative control is an UNSIGNED/absolute-value
// integral, a genuinely different — and wrong — quantity for this family).
//
// Colour (color_positive/color_negative), opacity and the declared
// composition order against riemann_bars are CP-C2 (below); this function
// still makes no colour decision — it returns per-segment SIGN and the
// drawing wrapper below reads it to pick color_positive/color_negative.
//
// CP-C2 reconciliation (a) — NON-FINITE SAMPLE RULE, unified with
// riemann_bars. CP-C1 had this function clamp a non-finite sample to
// 'base' (silently fabricating a y=0 point the function never produced
// there) while riemann_bars dropped a non-finite bar entirely — two
// primitives in the SAME family answering "what do we do with a
// singularity" two different ways. Resolved toward function_plot's OWN D4
// rule (PM_functionPlotSample: "ends the current polyline and starts a new
// one... never drawn, never clamped") rather than riemann_bars', because D4
// is the family's pre-existing, doc-cited mathematics-correctness
// requirement — clamping to baseline is exactly the fabrication D4 forbids,
// so region_fill's old behaviour was the outlier, not riemann_bars'. A
// non-finite sample now BREAKS the current run (never joined across it,
// never assigned a fake y) and integration/sign-splitting resumes fresh at
// the next finite sample — riemann_bars is unchanged (it already dropped
// the bar outright, draws and sums nothing for it).
function PM_regionFillCompute(yExpr, domainMin, domainMax, baseline, vars, signed) {
  var out = { segments: [], totalSignedArea: 0, positiveArea: 0, negativeArea: 0 };
  if (!isFinite(domainMin) || !isFinite(domainMax) || !(domainMax > domainMin)) return out;
  var base = (typeof baseline === 'number') ? baseline : 0;
  var n = 480; // matches function_plot's own sample cap (D3's contract, [40,480])
  var scopeVars = {};
  for (var k in vars) if (Object.prototype.hasOwnProperty.call(vars, k)) scopeVars[k] = vars[k];

  // D4 parity — build RUNS of consecutive finite samples; a non-finite
  // sample ends the current run (if it has >1 point) and starts a new one.
  var runs = [];
  var curRun = [];
  for (var i = 0; i <= n; i++) {
    var x = domainMin + (domainMax - domainMin) * (i / n);
    scopeVars.x = x;
    var y = PM_safeEval(yExpr, scopeVars);
    if (!isFinite(y)) {
      if (curRun.length > 1) runs.push(curRun);
      curRun = [];
      continue;
    }
    curRun.push({ x: x, y: y });
  }
  if (curRun.length > 1) runs.push(curRun);

  function trapArea(seg) {
    var a = 0;
    for (var j = 1; j < seg.length; j++) {
      a += ((seg[j - 1].y - base) + (seg[j].y - base)) / 2 * (seg[j].x - seg[j - 1].x);
    }
    return a;
  }

  for (var ri = 0; ri < runs.length; ri++) {
    var pts = runs[ri];
    if (!signed) {
      var wholeArea = trapArea(pts);
      out.segments.push({ points: pts, sign: 0, area: wholeArea });
      out.totalSignedArea += wholeArea;
      continue;
    }
    var cur = [pts[0]];
    var curSign = (pts[0].y >= base) ? 1 : -1;
    for (var qi = 1; qi < pts.length; qi++) {
      var prev = pts[qi - 1], next = pts[qi];
      var nextSign = (next.y >= base) ? 1 : -1;
      if (nextSign !== curSign) {
        var t = (base - prev.y) / (next.y - prev.y);
        var xCross = prev.x + t * (next.x - prev.x);
        var crossPt = { x: xCross, y: base };
        cur.push(crossPt);
        var segA = trapArea(cur);
        out.segments.push({ points: cur, sign: curSign, area: segA });
        if (curSign > 0) out.positiveArea += segA; else out.negativeArea += segA;
        cur = [crossPt];
        curSign = nextSign;
      }
      cur.push(next);
    }
    var lastA = trapArea(cur);
    out.segments.push({ points: cur, sign: curSign, area: lastA });
    if (curSign > 0) out.positiveArea += lastA; else out.negativeArea += lastA;
  }
  // Only the SIGNED path accumulates via positiveArea/negativeArea; the
  // unsigned path already summed totalSignedArea inline above and must not
  // be overwritten by two variables it never touched.
  if (signed) out.totalSignedArea = out.positiveArea + out.negativeArea;
  return out;
}

function drawRegionFill(spec) {
  if (!spec || typeof spec.y_expr !== 'string' || typeof spec.from_expr !== 'string'
      || typeof spec.to_expr !== 'string' || !spec.plane_id) return;
  // D6 — both standard brackets, before any drawing.
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);

  // F7 — inert when the named plane isn't registered this frame.
  var ranges = PM_planeRangesOf(spec.plane_id);
  if (!ranges) return;

  var vars = PM_liveExprVars();
  var domainFrom = PM_safeEval(spec.from_expr, vars);
  var domainTo = PM_safeEval(spec.to_expr, vars);
  var baseline = (typeof spec.baseline === 'number') ? spec.baseline : 0;
  var signed = !!spec.signed;
  var computed = PM_regionFillCompute(spec.y_expr, domainFrom, domainTo, baseline, vars, signed);
  if (computed.segments.length === 0) return;

  // CP-C2 — real colour + opacity semantics, replacing CP-C1's provisional
  // one-colour / hardcoded-0.28-alpha stub (its contract carried no plain
  // 'color' field at all for the unsigned case). 'color' is the UNSIGNED
  // colour (also the fallback if signed but color_positive/negative are
  // omitted); color_positive/color_negative — field NAMES copied VERBATIM
  // from the doc's own contract (Delta 8's "one concept, one name" point) —
  // colour each SIGNED segment by its own computed .sign. opacity defaults
  // to 0.28 (unchanged visual default from CP-C1's hardcoded constant).
  var baseColor = spec.color || '#22D3EE';
  var posColor = spec.color_positive || baseColor;
  var negColor = spec.color_negative || '#F87171';
  var opacity = (typeof spec.opacity === 'number') ? spec.opacity : 0.28;
  push();
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = baseColor;
    drawingContext.shadowBlur = emph.glowPx;
  }
  for (var si = 0; si < computed.segments.length; si++) {
    var seg = computed.segments[si];
    var poly = seg.points;
    if (poly.length < 2) continue;
    var rgb = PM_hexToRgb(signed ? (seg.sign < 0 ? negColor : posColor) : baseColor);
    var alpha255 = 255 * gate.alpha * emph.alphaMul * opacity;
    noStroke();
    fill(rgb[0], rgb[1], rgb[2], alpha255);
    var pxStart = PM_planeResolve(spec, poly[0].x, baseline);
    var pxEnd = PM_planeResolve(spec, poly[poly.length - 1].x, baseline);
    beginShape();
    for (var pj = 0; pj < poly.length; pj++) {
      var pxPt = PM_planeResolve(spec, poly[pj].x, poly[pj].y);
      if (pxPt) vertex(pxPt.x, pxPt.y);
    }
    if (pxEnd) vertex(pxEnd.x, pxEnd.y);
    if (pxStart) vertex(pxStart.x, pxStart.y);
    endShape(CLOSE);
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// ── riemann_bars (CP-C1 geometry + CP-C2 composition — bug_class:
// pcpl_cannot_shade_or_partition_the_region_under_a_curve /
// pcpl_riemann_bars_composition_and_draw_order_undeclared) ─────────────────
// mode is a CLOSED four-value enum: 'left' | 'right' | 'midpoint' |
// 'trapezoid'. AMENDMENT 1 to MATHEMATICS_PHASE0_CARTESIAN_PLANE.md keeps
// 'trapezoid' (0b proposed dropping it; the gate table asserts
// trap(4)=0.34375 on x^2/[0,1] and three claimed boards examine the
// trapezium rule by name) — dropping the token would ship a gate asserting
// a mode that does not exist.
//
// D7 — n derives from n_expr EVERY FRAME (never a frame counter, never
// cached). max_bars_drawn caps only which rectangles are PLACED on screen;
// the SUM always accumulates over the TRUE n — this is the whole point of
// the cap (S4's convergence beat: above the cap the picture stops changing
// while the number keeps moving) and is why the loop below always runs the
// full n iterations regardless of max_bars_drawn.
//
// D11 — the primitive computes the sum ONCE, inside THIS loop, and
// PUBLISHES it (drawRiemannBars below writes sum_var/bars_drawn_var into
// PM_riemannPublish, AMENDMENT 2 / F6 supersession — see that map's own
// declaration for why the target moved off PM_physics.derived); it draws no
// text itself. See the pass-order note on drawRiemannBars.
//
// CP-C2 reads (but this function still makes no colour/render decision —
// see drawRiemannBars): colour incl. signed colour, render
// ('filled'|'outline'), opacity, the declared draw order against
// region_fill, show_partition, reveal_stagger_ms. Every bar carries its own
// TRUE original index 'i' (added for CP-C2) so reveal_stagger_ms — and
// show_partition's line-per-bar gating — stay correct even if an earlier
// bar was dropped for being non-finite (the array position among SURVIVING
// bars is not always the same as the bar's true index among all n).
function PM_riemannBarsCompute(yExpr, domainFrom, domainTo, nRaw, mode, maxBarsDrawn, vars) {
  var out = { bars: [], sum: 0, n: 0, barsDrawn: 0 };
  if (!isFinite(domainFrom) || !isFinite(domainTo) || !(domainTo > domainFrom)) return out;
  var n = Math.round(nRaw);
  if (!(n >= 1)) return out;
  var m = (mode === 'right' || mode === 'midpoint' || mode === 'trapezoid') ? mode : 'left';
  var barsDrawnCount = (typeof maxBarsDrawn === 'number' && isFinite(maxBarsDrawn))
    ? PM_clamp(Math.round(maxBarsDrawn), 0, n) : n;
  var h = (domainTo - domainFrom) / n;
  var scopeVars = {};
  for (var k in vars) if (Object.prototype.hasOwnProperty.call(vars, k)) scopeVars[k] = vars[k];

  var sum = 0;
  for (var i = 0; i < n; i++) {
    var xL = domainFrom + i * h;
    var xR = xL + h;
    scopeVars.x = xL;
    var fL = PM_safeEval(yExpr, scopeVars);
    scopeVars.x = xR;
    var fR = PM_safeEval(yExpr, scopeVars);
    var yTopLeft, yTopRight, area;
    if (m === 'right') {
      yTopLeft = fR; yTopRight = fR; area = fR * h;
    } else if (m === 'midpoint') {
      scopeVars.x = xL + h / 2;
      var fM = PM_safeEval(yExpr, scopeVars);
      yTopLeft = fM; yTopRight = fM; area = fM * h;
    } else if (m === 'trapezoid') {
      yTopLeft = fL; yTopRight = fR; area = (fL + fR) / 2 * h;
    } else { // 'left' — default
      yTopLeft = fL; yTopRight = fL; area = fL * h;
    }
    // A non-finite sample (e.g. a singularity inside this bar) contributes
    // NOTHING to the sum and draws NOTHING for this one bar, rather than
    // poisoning the whole published sum with a NaN. CP-C2 reconciliation
    // (b) — this is the rule region_fill was made to MATCH (see
    // PM_regionFillCompute's own header); unchanged here.
    var ok = isFinite(area) && isFinite(yTopLeft) && isFinite(yTopRight);
    if (ok) sum += area;
    if (ok && i < barsDrawnCount) {
      out.bars.push({ i: i, xL: xL, xR: xR, yTopLeft: yTopLeft, yTopRight: yTopRight, area: area });
    }
  }
  out.sum = sum;
  out.n = n;
  out.barsDrawn = barsDrawnCount;
  return out;
}

// D7 — PURE function of the clock: bar index barIndex's own reveal gate opens
// at appearAtMs + barIndex*staggerMs (never a frame counter, never
// accumulated across draw() calls), so a SET_TIME_FREEZE re-pin to the SAME
// nowMs reproduces byte-identical bar visibility every time (H2 baselines).
// animateInMs (when authored) ramps that ONE bar's alpha 0->1 over the same
// window PM_animationGate uses for a whole primitive; omitted (falsy) means
// each bar snaps straight to fully visible the instant its own gate opens.
function PM_riemannBarReveal(barIndex, appearAtMs, staggerMs, animateInMs, nowMs) {
  var appear = (typeof appearAtMs === 'number' ? appearAtMs : 0)
    + barIndex * (typeof staggerMs === 'number' ? staggerMs : 0);
  if (nowMs < appear) return { visible: false, alpha: 0 };
  var animMs = (typeof animateInMs === 'number') ? animateInMs : 0;
  if (animMs <= 0) return { visible: true, alpha: 1 };
  var progress = (nowMs - appear) / animMs;
  if (progress < 0) progress = 0;
  if (progress > 1) progress = 1;
  return { visible: true, alpha: progress };
}

function drawRiemannBars(spec) {
  if (!spec || !spec.id || typeof spec.y_expr !== 'string' || typeof spec.from_expr !== 'string'
      || typeof spec.to_expr !== 'string' || typeof spec.n_expr !== 'string' || !spec.plane_id) return;
  // D6 — both standard brackets, before any drawing.
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);

  // F7 — inert when the named plane isn't registered this frame.
  var ranges = PM_planeRangesOf(spec.plane_id);
  if (!ranges) return;

  var vars = PM_liveExprVars();
  var domainFrom = PM_safeEval(spec.from_expr, vars);
  var domainTo = PM_safeEval(spec.to_expr, vars);
  var nRaw = PM_safeEval(spec.n_expr, vars);
  var computed = PM_riemannBarsCompute(spec.y_expr, domainFrom, domainTo, nRaw, spec.mode, spec.max_bars_drawn, vars);

  // D11 (AMENDMENT 2 / F6 supersession, CP-C2) — PUBLISH into
  // PM_riemannPublish, a frame-scoped map OUTSIDE PM_physics that survives
  // ANY mid-frame PM_physics reassignment (see that map's own declaration).
  // Runs UNCONDITIONALLY, even when there is nothing to draw this frame, so
  // a label's {sum_var} is never one frame stale relative to the geometry.
  // PASS-ORDER GUARANTEE (asserted in the dispatch report): this function
  // runs inside Pass 0.3, which completes in full before Pass 3 (labels)
  // starts — publisher-before-consumer holds by pass order, every frame,
  // REGARDLESS of where plot_point sits in Pass 0.3 (D12's restored order
  // runs riemann_bars BEFORE plot_point; the publish target no longer cares
  // either way — see the Pass 0.3 header comment in draw()).
  if (typeof spec.sum_var === 'string') PM_riemannPublish[spec.sum_var] = computed.sum;
  if (typeof spec.bars_drawn_var === 'string') PM_riemannPublish[spec.bars_drawn_var] = computed.barsDrawn;

  if (computed.bars.length === 0) return;

  // CP-C2 — colour (incl. signed), render mode, opacity, reveal_stagger_ms,
  // show_partition. 'color' is the UNSIGNED colour (also the signed
  // fallback if color_positive/negative are omitted); color_positive/
  // color_negative — field NAMES copied VERBATIM from region_fill (Delta
  // 8) — colour each rectangle by the SIGN of its own computed .area (which
  // equals sign(yTopLeft)=sign(yTopRight) for left/right/midpoint, and
  // gives a single well-defined colour for a 'trapezoid' bar whose two
  // edge-heights straddle the baseline — a judgment call, see dispatch
  // report). riemann_bars has NO authored 'baseline' (unchanged, F16) —
  // the sign test is against the SAME fixed data y=0 the rectangles already
  // sit on. opacity defaults to 1.0 (D12/D9's "opaque over region_fill" by
  // construction — see the Pass 0.3 draw-order restoration in draw()).
  var baseColor = spec.color || '#22D3EE';
  var posColor = spec.color_positive || baseColor;
  var negColor = spec.color_negative || '#F87171';
  var signed = !!spec.signed;
  var renderMode = (spec.render === 'outline') ? 'outline' : 'filled';
  var opacity = (typeof spec.opacity === 'number') ? spec.opacity : 1.0;
  var appearAtMs = (typeof spec.appear_at_ms === 'number') ? spec.appear_at_ms : 0;
  var staggerMs = (typeof spec.reveal_stagger_ms === 'number') ? spec.reveal_stagger_ms : 0;
  var animateInMs = (typeof spec.animate_in_ms === 'number') ? spec.animate_in_ms : 0;
  var nowMs = PM_simClockMs;

  push();
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = baseColor;
    drawingContext.shadowBlur = emph.glowPx;
  }
  for (var i = 0; i < computed.bars.length; i++) {
    var bar = computed.bars[i];
    // reveal_stagger_ms — bar bar.i's (its TRUE original index, not its
    // position among surviving bars) own gate; D7-pure, driven only by the
    // clock (PM_simClockMs), never a frame counter.
    var reveal = PM_riemannBarReveal(bar.i, appearAtMs, staggerMs, animateInMs, nowMs);
    if (!reveal.visible) continue;

    // riemann_bars has no authored 'baseline' — rectangles always sit on
    // data y=0 (the contract's F16 field list carries no baseline key).
    var p1 = PM_planeResolve(spec, bar.xL, 0);
    var p2 = PM_planeResolve(spec, bar.xL, bar.yTopLeft);
    var p3 = PM_planeResolve(spec, bar.xR, bar.yTopRight);
    var p4 = PM_planeResolve(spec, bar.xR, 0);
    if (!p1 || !p2 || !p3 || !p4) continue;

    var rgb = PM_hexToRgb(signed ? (bar.area < 0 ? negColor : posColor) : baseColor);
    var barAlpha255 = 255 * gate.alpha * emph.alphaMul * opacity * reveal.alpha;
    if (renderMode === 'outline') {
      noFill();
      stroke(rgb[0], rgb[1], rgb[2], barAlpha255);
      strokeWeight(1.5);
    } else {
      noStroke();
      fill(rgb[0], rgb[1], rgb[2], barAlpha255);
    }
    beginShape();
    vertex(p1.x, p1.y); vertex(p2.x, p2.y); vertex(p3.x, p3.y); vertex(p4.x, p4.y);
    endShape(CLOSE);

    // show_partition (A4) — the interior division line at bar i's LEFT
    // edge (== the PREVIOUS drawn bar's right edge), gated by THIS bar's
    // own reveal so the line arrives together with the rectangle it
    // bounds. i=0's left edge is the domain start, not an interior
    // boundary — skipped. Spans the plane's FULL y_range (a ruled line,
    // not the rectangle's own height) specifically so it stays visible
    // when the ADJACENT rectangle has zero height (the left-rule-on-x^2-
    // at-n=4 case the field exists for) — a height-dependent tick would be
    // invisible in exactly the case show_partition exists to fix.
    if (spec.show_partition && i > 0) {
      var pTop = PM_planeResolve(spec, bar.xL, ranges.yRange.max);
      var pBot = PM_planeResolve(spec, bar.xL, ranges.yRange.min);
      if (pTop && pBot) {
        noFill();
        stroke(148, 163, 184, 90 * reveal.alpha * gate.alpha * emph.alphaMul);
        strokeWeight(1);
        line(pTop.x, pTop.y, pBot.x, pBot.y);
      }
    }
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

// ── secant_line / tangent_line (CP-D, F13-F14 — bug_class:
// pcpl_cannot_draw_a_secant_or_tangent_with_a_live_slope) ─────────────────
// THE TRAP, stated once, because it is what makes this family dangerous: a
// plane's x and y pixel scales differ (the spec driver's own main plane —
// definite_integral_as_accumulated_area_skeleton.md's viewport {w:660,h:372}
// over x_range width 3.0 / y_range width 6.0 — is 220 px per x-unit against
// 62 px per y-unit; gate section 10 uses this exact plane), so a slope
// computed from PIXEL deltas is wrong by the aspect ratio AND looks
// plausible on screen — nothing about a wrong pixel-derived line looks
// broken until it is checked against the real number. The slope is
// therefore computed ONLY from the RESOLVED DATA-space endpoints, in
// PM_secantLineCompute / PM_tangentLineCompute below, and NEVER from
// anything PM_planeResolve returns. extend:'frame' is a SEPARATE, LATER
// step applied to the already-final data-space slope: PM_lineClipToRect
// clips the (already-correct) data-space line against the plane's
// data-space rectangle — a pixel-space CONCERN (what shows on screen) but
// still a purely data-space OPERATION (no pixel value is read). Only
// drawSecantLine/drawTangentLine below ever call PM_planeResolve, and only
// on the two already-resolved endpoints (drawFrom/drawTo) — one funnel,
// one direction, exactly like every other primitive in this family (D1/F7).

// Liang-Barsky line-rectangle clip, DATA-space in, DATA-space out. Pure, so
// the gate can assert it directly with no p5 dependency. Clips the infinite
// line PASSING THROUGH (x0,y0)-(x1,y1) — callers pass two points already far
// enough apart (PM_extendLineToFrame below sizes that distance off the
// rectangle's own diagonal, never a fixed magic number) that the [0,1]
// parametric segment already spans well past the rectangle in every
// direction the line can leave it. Returns the clipped {x0,y0,x1,y1}, or
// null if the line misses the rectangle entirely (should not occur for an
// in-range origin point, but never assumed away).
function PM_lineClipToRect(x0, y0, x1, y1, xMin, xMax, yMin, yMax) {
  var dx = x1 - x0, dy = y1 - y0;
  var t0 = 0, t1 = 1;
  var p = [-dx, dx, -dy, dy];
  var q = [x0 - xMin, xMax - x0, y0 - yMin, yMax - y0];
  for (var i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null; // parallel to this edge and entirely outside it
    } else {
      var r = q[i] / p[i];
      if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
      else { if (r < t0) return null; if (r < t1) t1 = r; }
    }
  }
  return { x0: x0 + t0 * dx, y0: y0 + t0 * dy, x1: x0 + t1 * dx, y1: y0 + t1 * dy };
}

// Extends (originX, originY) along dataSlope far enough past the plane's
// data-space rectangle in BOTH directions (sized off the rectangle's own
// diagonal, so it is correct at any authored x_range/y_range, never a fixed
// magic number) and clips to it via PM_lineClipToRect. Shared by
// secant_line (extend:'frame', using the chord's own computed slope) and
// tangent_line (extend:'frame', using slope_expr) — one clip implementation,
// two callers.
function PM_extendLineToFrame(originX, originY, dataSlope, xRange, yRange) {
  var norm = Math.sqrt(1 + dataSlope * dataSlope);
  var diag = Math.sqrt(Math.pow(xRange.max - xRange.min, 2) + Math.pow(yRange.max - yRange.min, 2));
  var big = (diag * 10) / norm;
  return PM_lineClipToRect(
    originX - big, originY - big * dataSlope,
    originX + big, originY + big * dataSlope,
    xRange.min, xRange.max, yRange.min, yRange.max
  );
}

// D8 — the readout and the picture derive from the SAME evaluation (mirrors
// PM_plotPointResolve's own header above). '{m}' is the one substitution
// token; decimals is this primitive's OWN precision, never the slider
// caption's hardcoded toFixed(step<1?1:0).
function PM_secantTangentReadout(spec, slope) {
  if (!spec.readout || !isFinite(slope)) return '';
  var decimals = (typeof spec.readout.decimals === 'number') ? spec.readout.decimals : 3;
  var fmt = (typeof spec.readout.format === 'string') ? spec.readout.format : 'slope = {m}';
  // PM_fmtNum (Rule 34c) — real Unicode minus, never toFixed()'s ASCII hyphen.
  return fmt.split('{m}').join(PM_fmtNum(slope, decimals));
}

// F13 — from_expr/to_expr are OBJECTS ({x: exprString, y: exprString}), one
// expression per coordinate — deliberately NOT PM_safeEvalPoint's single-
// expression-returning-an-object shape (that shape belongs to
// drawVector/drawForceArrow's from_expr/to_expr; this family's contract, per
// docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md's own example, authors x and y
// as two separate expressions, e.g. from_expr: {x:"x0", y:"f0"}).
function PM_secantLineCompute(spec, vars, ranges) {
  var out = { valid: false, from: null, to: null, slope: NaN, drawFrom: null, drawTo: null, readoutText: '' };
  if (!spec || !spec.from_expr || !spec.to_expr
      || typeof spec.from_expr.x !== 'string' || typeof spec.from_expr.y !== 'string'
      || typeof spec.to_expr.x !== 'string' || typeof spec.to_expr.y !== 'string') return out;
  var fx = PM_safeEval(spec.from_expr.x, vars), fy = PM_safeEval(spec.from_expr.y, vars);
  var tx = PM_safeEval(spec.to_expr.x, vars), ty = PM_safeEval(spec.to_expr.y, vars);
  if (!isFinite(fx) || !isFinite(fy) || !isFinite(tx) || !isFinite(ty)) return out;
  if (Math.abs(tx - fx) < 1e-12) return out; // vertical chord: undefined slope as dy/dx, nothing to draw

  // THE ONE PLACE the slope is computed — DATA coordinates only, never a
  // pixel value (see the family header comment above).
  var slope = (ty - fy) / (tx - fx);

  out.valid = true;
  out.from = { x: fx, y: fy };
  out.to = { x: tx, y: ty };
  out.slope = slope;

  var extend = spec.extend || 'segment';
  if (extend === 'frame' && ranges) {
    var clipped = PM_extendLineToFrame(fx, fy, slope, ranges.xRange, ranges.yRange);
    out.drawFrom = clipped ? { x: clipped.x0, y: clipped.y0 } : out.from;
    out.drawTo = clipped ? { x: clipped.x1, y: clipped.y1 } : out.to;
  } else {
    out.drawFrom = out.from;
    out.drawTo = out.to;
  }

  out.readoutText = PM_secantTangentReadout(spec, slope);
  return out;
}

// F14 — at_expr is the same {x: exprString, y: exprString} object shape as
// secant_line's from_expr/to_expr (F13's comment above). slope_expr is
// AUTHORED, never numerically differentiated — the engine is deliberately
// not a CAS (ledger item 5: "#2 authors slope_expr explicitly (cos(x0) for
// sin), which keeps the mathematics in the concept JSON where
// mathematics_author can put a domain ledger on it").
//
// extend:'segment' has no natural from/to for a POINT + slope (unlike
// secant_line, which always has two authored points), so a fixed data-space
// half-width, symmetric around at.x along the tangent's own slope, stands
// in — sized as a FRACTION of the plane's OWN x_range span so it scales
// with whatever window a state authors, never a fixed px/data magic number.
// Flagged as a judgment call in the dispatch report: the doc's contract
// does not specify a segment length for a point-defined line.
var PM_TANGENT_SEGMENT_HALF_WIDTH_FRAC = 0.12;

function PM_tangentLineCompute(spec, vars, ranges) {
  var out = { valid: false, at: null, slope: NaN, drawFrom: null, drawTo: null, readoutText: '' };
  if (!spec || !spec.at_expr || typeof spec.at_expr.x !== 'string' || typeof spec.at_expr.y !== 'string'
      || typeof spec.slope_expr !== 'string') return out;
  var ax = PM_safeEval(spec.at_expr.x, vars), ay = PM_safeEval(spec.at_expr.y, vars);
  var slope = PM_safeEval(spec.slope_expr, vars);
  if (!isFinite(ax) || !isFinite(ay) || !isFinite(slope)) return out;

  out.valid = true;
  out.at = { x: ax, y: ay };
  out.slope = slope;

  var extend = spec.extend || 'segment';
  if (extend === 'frame' && ranges) {
    var clipped = PM_extendLineToFrame(ax, ay, slope, ranges.xRange, ranges.yRange);
    out.drawFrom = clipped ? { x: clipped.x0, y: clipped.y0 } : out.at;
    out.drawTo = clipped ? { x: clipped.x1, y: clipped.y1 } : out.at;
  } else {
    var xSpan = (ranges && ranges.xRange) ? (ranges.xRange.max - ranges.xRange.min) : 1;
    var halfW = xSpan * PM_TANGENT_SEGMENT_HALF_WIDTH_FRAC;
    out.drawFrom = { x: ax - halfW, y: ay - halfW * slope };
    out.drawTo = { x: ax + halfW, y: ay + halfW * slope };
  }

  out.readoutText = PM_secantTangentReadout(spec, slope);
  return out;
}

function drawSecantLine(spec) {
  if (!spec || !spec.id || !spec.plane_id) return;
  // D6 — both standard brackets, before any drawing.
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);

  // F7 — inert when the named plane isn't registered this frame.
  var ranges = PM_planeRangesOf(spec.plane_id);
  if (!ranges) return;

  var vars = PM_liveExprVars();
  var computed = PM_secantLineCompute(spec, vars, ranges);
  if (!computed.valid) return;

  // F7 — the ONE resolution funnel, called ONLY on the already-final
  // data-space endpoints (drawFrom/drawTo). No pixel value ever feeds back
  // into the slope computed above (the family header comment states why).
  var p0 = PM_planeResolve(spec, computed.drawFrom.x, computed.drawFrom.y);
  var p1 = PM_planeResolve(spec, computed.drawTo.x, computed.drawTo.y);
  if (!p0 || !p1) return;

  var rgb = PM_hexToRgb(spec.color || '#F472B6');
  var alpha255 = 255 * gate.alpha * emph.alphaMul;
  push();
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.color || '#F472B6';
    drawingContext.shadowBlur = emph.glowPx;
  }
  stroke(rgb[0], rgb[1], rgb[2], alpha255);
  strokeWeight(2);
  line(p0.x, p0.y, p1.x, p1.y);
  // Register the chord's OWN ink as an obstacle for whatever draws on this
  // plane next this frame (tangent_line, plot_point — Pass 0.3's fixed
  // order). Subdivided (PM_registerLineInk), never one bbox spanning the
  // full extend:'frame' span.
  PM_registerLineInk(spec.plane_id, p0, p1, 5);
  if (computed.readoutText) {
    // Readout sits near the CHORD's own midpoint (the authored from/to),
    // never the frame-extended endpoints — the number labels the two
    // authored points, not wherever the clip happened to land.
    var rFrom = PM_planeResolve(spec, computed.from.x, computed.from.y);
    var rTo = PM_planeResolve(spec, computed.to.x, computed.to.y);
    if (rFrom && rTo) {
      noStroke();
      fill(rgb[0], rgb[1], rgb[2], alpha255);
      textSize(12);
      textAlign(LEFT, CENTER);
      // F-readout — an authored offset always wins (parity with
      // plot_point.readout.offset); with none authored, clear the stroke by
      // the MEASURED width of this frame's own string against the drawn
      // segment's OWN pixel direction (p0->p1, just stroked above). A fixed
      // screen-axis offset — and equally a fixed PERPENDICULAR one — is
      // what a sloped chord is guaranteed to intersect once the label is
      // wider than the displacement (this primitive's whole bug_class).
      var secAnchor = { x: (rFrom.x + rTo.x) / 2, y: (rFrom.y + rTo.y) / 2 };
      var secTW = textWidth(computed.readoutText);
      var secOff = PM_readoutAuthoredOffset(spec) || PM_labelClearOffset(p0, p1, secTW, 14, 6);
      // Route through the SAME collision-aware resolver plot_point uses
      // (bug_class readout_collision_flip_is_wired_at_one_call_site_of_
      // three) — secant/tangent readouts used to get PM_clampOffsetToCanvas
      // ONLY, so an authored offset could never escape the axis/tick band,
      // let alone a sibling's curve ink or another readout's box. This
      // chord's own {p0,p1} doubles as the resolver's localInk, so the
      // ordered candidate set's +/- normal alternatives are the SAME
      // direction PM_labelClearOffset's own default already prefers, tried
      // as an explicit TESTED candidate rather than assumed.
      secOff = PM_readoutResolveOffset(secAnchor, secOff, secTW, 14, PM_planeRegistry[spec.plane_id], spec.plane_id, { p0: p0, p1: p1 });
      secOff = PM_clampOffsetToCanvas(secAnchor, secOff, secTW, 14);
      text(computed.readoutText, secAnchor.x + secOff.x, secAnchor.y + secOff.y);
      PM_debugRecordReadout(spec.id, secAnchor, secOff, secTW, 14);
      PM_registerInkZone(spec.plane_id, PM_readoutBBox(secAnchor, secOff, secTW, 14));
    }
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
  }
  pop();
}

function drawTangentLine(spec) {
  if (!spec || !spec.id || !spec.plane_id) return;
  // D6 — both standard brackets, before any drawing.
  var gate = PM_animationGate(spec);
  if (!gate.visible) return;
  var emph = PM_focalEmphasis(spec);

  // F7 — inert when the named plane isn't registered this frame.
  var ranges = PM_planeRangesOf(spec.plane_id);
  if (!ranges) return;

  var vars = PM_liveExprVars();
  var computed = PM_tangentLineCompute(spec, vars, ranges);
  if (!computed.valid) return;

  // F7 — the ONE resolution funnel, called ONLY on the already-final
  // data-space endpoints.
  var p0 = PM_planeResolve(spec, computed.drawFrom.x, computed.drawFrom.y);
  var p1 = PM_planeResolve(spec, computed.drawTo.x, computed.drawTo.y);
  if (!p0 || !p1) return;

  var rgb = PM_hexToRgb(spec.color || '#A78BFA');
  var alpha255 = 255 * gate.alpha * emph.alphaMul;
  push();
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.color || '#A78BFA';
    drawingContext.shadowBlur = emph.glowPx;
  }
  stroke(rgb[0], rgb[1], rgb[2], alpha255);
  strokeWeight(2);
  line(p0.x, p0.y, p1.x, p1.y);
  // Register the tangent's OWN ink as an obstacle for whatever draws on
  // this plane next this frame (plot_point — Pass 0.3's fixed order).
  PM_registerLineInk(spec.plane_id, p0, p1, 5);
  if (computed.readoutText) {
    // Readout sits near the authored tangency point 'at', never the
    // frame-extended endpoints.
    var rAt = PM_planeResolve(spec, computed.at.x, computed.at.y);
    if (rAt) {
      noStroke();
      fill(rgb[0], rgb[1], rgb[2], alpha255);
      textSize(12);
      textAlign(LEFT, CENTER);
      // F-readout — same offset contract as drawSecantLine above: authored
      // offset wins; default clears the drawn tangent's own pixel-space
      // direction (p0->p1) by this frame's MEASURED text width.
      var tanTW = textWidth(computed.readoutText);
      var tanOff = PM_readoutAuthoredOffset(spec) || PM_labelClearOffset(p0, p1, tanTW, 14, 6);
      // Route through the SAME collision-aware resolver plot_point uses —
      // see the parallel comment in drawSecantLine above (localInk = this
      // tangent's own {p0,p1}).
      tanOff = PM_readoutResolveOffset(rAt, tanOff, tanTW, 14, PM_planeRegistry[spec.plane_id], spec.plane_id, { p0: p0, p1: p1 });
      tanOff = PM_clampOffsetToCanvas(rAt, tanOff, tanTW, 14);
      text(computed.readoutText, rAt.x + tanOff.x, rAt.y + tanOff.y);
      PM_debugRecordReadout(spec.id, rAt, tanOff, tanTW, 14);
      PM_registerInkZone(spec.plane_id, PM_readoutBBox(rAt, tanOff, tanTW, 14));
    }
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
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
  // peter_parker:renderer_primitives, 2026-08-05 — same missing bracket as
  // drawVector: drawAngleArc consumed PM_focalEmphasis but never
  // PM_animationGate, so appear_at_ms on an arc was silently inert and a timed
  // reveal that gated its body correctly still drew its arc from frame 0
  // (pcpl_vector_and_angle_arc_ignore_appear_at_ms_so_authored_reveal_chains_no_op).
  var arcGate = PM_animationGate(spec);
  if (!arcGate.visible) return;
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
  // radius_expr — live variable-driven radius, the drawAngleArc sibling of
  // drawBody's size_expr above (same PM_liveExprVars() scope, same opt-in
  // non-finite-eval fallback to the authored literal/default). Without this
  // an arc's sweep could track a slider (to_deg_expr / angle_value_expr) but
  // its RADIUS stayed frozen — a morphing-radius family (e.g. a conic's
  // arc growing with its own semi-axis) had no honest rendering path.
  if (typeof spec.radius_expr === 'string') {
    var radVars = PM_liveExprVars();
    var radVal = PM_safeEval(spec.radius_expr, radVars);
    if (isFinite(radVal)) radius = radVal;
  }
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
  // Placed AFTER the degenerate-return so a visible arc always reaches this
  // fetch (peter_parker:renderer_primitives, 2026-07-24 —
  // pcpl_angle_arc_no_focal_glow_channel; mirrors drawLabel/drawAnnotation/
  // drawForceArrow/drawFormulaBox's PM_focalEmphasis consumption).
  var emph = PM_focalEmphasis(spec);
  var rgb = PM_hexToRgb(spec.color || '#F59E0B');

  // Math CCW → canvas CW: p5 arc takes angles in canvas (CW positive).
  // Math angle a maps to canvas angle -a.
  var startRad = -toDeg * Math.PI / 180;
  var endRad = -fromDeg * Math.PI / 180;

  push();
  noFill();
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = spec.color || '#F59E0B';
    drawingContext.shadowBlur = emph.glowPx;
  }
  stroke(rgb[0], rgb[1], rgb[2], 220 * emph.alphaMul);
  strokeWeight(1.5);
  arc(center.x, center.y, radius * 2, radius * 2, startRad, endRad);

  if (spec.label) {
    var midMathDeg = (fromDeg + toDeg) / 2;
    var midCanvasRad = -midMathDeg * Math.PI / 180;
    var labelR = radius + 14;
    var lx = center.x + labelR * Math.cos(midCanvasRad);
    var ly = center.y + labelR * Math.sin(midCanvasRad);
    noStroke();
    fill(rgb[0], rgb[1], rgb[2], 255 * emph.alphaMul);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(PM_interpolate(String(spec.label)), lx, ly);
  }
  if (emph.glowPx > 0) {
    drawingContext.shadowColor = 'transparent';
    drawingContext.shadowBlur = 0;
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
  // peter_parker:renderer_primitives, 2026-08-05 —
  // pcpl_slider_label_stale_under_choreography. The knob and caption read
  // PM_sliderValues only, which PM_applyChoreography never writes (it writes
  // PM_choreoValues, :3485). So on any state whose variable_choreography drives
  // a slider-bound variable, the caption printed the untouched seed while the
  // HUD beside it tracked the live angle — two on-canvas readouts of the SAME
  // quantity, disagreeing, in one frame. DISPLAY-ONLY fix: before a real drag
  // seizes the variable the choreography owns it, so show the choreographed
  // value; once seized, PM_sliderValues is authoritative again. The physics
  // already read the choreographed value, so nothing about behaviour changes.
  // Mirrors the pf_slider_label_ignores_oneshot_lerp precedent on particle_field.
  var val = (!PM_userTouched[spec.variable]
             && typeof PM_choreoValues[spec.variable] === 'number')
    ? PM_choreoValues[spec.variable]
    : PM_sliderValues[spec.variable];
  var frac = (val - minV) / (maxV - minV);
  if (!isFinite(frac)) frac = 0;
  frac = Math.max(0, Math.min(1, frac));
  var knobX = slot.x + frac * slot.w;

  // Read-only probe registry (THE CALCULATOR's N3 gate). Canvas sliders have no
  // DOM handle, so a harness scanning input[type=range] finds ZERO sliders on
  // every parametric sim and its slider-response gate silently no-ops. Geometry
  // is DESIGN-SPACE (760x500) — a prober maps to page coords via the canvas
  // bounding box. Stamped with frameCount so stale entries from a previous
  // state are distinguishable (only sliders drawn this frame re-stamp).
  window.__PM_sliderGeom = window.__PM_sliderGeom || {};
  window.__PM_sliderGeom[spec.variable] = {
    id: spec.id || spec.variable, x: slot.x, y: slot.y, w: slot.w,
    min: minV, max: maxV, value: val, f: frameCount
  };

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
// CP-A (F1/D1) — { [plane_id]: { toPx(x,y), toData(px,py), viewport, xRange,
// yRange } }, populated by drawCartesianPlane in Pass 0.25 (after surfaces,
// before bodies) — the SAME registry pattern PM_surfaceRegistry uses for
// attach_to_surface, instanced for a coordinate frame instead of a line
// segment. Every plane_id-carrying primitive resolves through PM_planeResolve
// against THIS object, never re-deriving its own transform.
var PM_planeRegistry = {};
// Engine round (bug_class
// parametric_readout_and_label_collision_awareness_does_not_cover_a_sibling_
// primitives_curve_or_line_ink) — { [plane_id]: Array<{x0,y0,x1,y1}> }, the
// HARD per-frame obstacle registry PM_readoutDangerZones folds into the axis
// bands it has always returned — a candidate that overlaps ANY zone here is
// rejected outright by PM_readoutCollides. Populated by drawFunctionPlot/
// drawSecantLine/drawTangentLine (their own curve/chord/tangent ink, Pass
// 0.3) and every readout primitive's OWN final resolved box + marker dot
// (PM_debugRecordReadout's sibling registration calls) — reset once per
// frame, BEFORE Pass 0.25 (see draw()). Gridlines are deliberately NOT
// registered here as of the 2026-08-08 engine round — see
// PM_planeGridInkZones immediately below and drawCartesianPlane's gridline
// header comment for the full geometric argument.
var PM_planeInkZones = {};
// SOFT per-frame obstacle registry, same shape as PM_planeInkZones — holds
// ONLY gridline ink (drawCartesianPlane, Pass 0.25). Read exclusively by
// PM_readoutGridOverlapArea (the least-overlap-area tie-break inside
// PM_readoutResolveOffset), never by the hard PM_readoutCollides predicate —
// so a readout that merely grazes a dim decorative gridline is never
// rejected outright, only nudged toward whichever tested candidate crosses
// less of it. Reset in lockstep with PM_planeInkZones (see draw()).
var PM_planeGridInkZones = {};
// Per-frame, per-plane: the LIVE (non-ghost) function_plot's y_expr on this
// plane, as authored — e.g. "x*x/2". Set by drawFunctionPlot as it draws
// (Pass 0.3, the SAME fixed-order guarantee PM_planeInkZones relies on:
// function_plot always runs before plot_point) and consumed by
// drawPlotPoint's default-offset direction (PM_plotPointCurveTangentPx)
// below. A state that draws a parent "ghost" copy alongside the live curve
// (graph_transformations' style:'ghost' pattern) never lets the ghost
// overwrite an already-registered live curve — see drawFunctionPlot's own
// registration guard. Reset in lockstep with PM_planeInkZones (see draw()).
var PM_planeCurveExpr = {};
// D11 (AMENDMENT 2 / F6 supersession, CP-C2, bug_class
// pcpl_riemann_bars_composition_and_draw_order_undeclared) — { [var_name]:
// number }, riemann_bars' publish target. Deliberately OUTSIDE PM_physics:
// drawPlotPoint's genuine-drag branch (and PM_applyChoreography, WP-R5)
// reassign PM_physics = computePhysics(...) WHOLESALE mid-frame, and D12's
// declared draw order runs plot_point AFTER riemann_bars — so a value
// published into PM_physics.derived (CP-C1's original target, per the F6
// scope map) would be WIPED before Pass 3 (labels) reads it whenever a drag
// fires the SAME frame riemann_bars published. Cleared at the START of
// every Pass 0.3 (see draw()) and merged by PM_liveExprVars() below, so
// PM_interpolate resolves {sum_var}/{bars_drawn_var} exactly as it did under
// the old target, but survives ANY PM_physics reassignment for the rest of
// the frame. See the Pass 0.3 header comment for the full argument.
var PM_riemannPublish = {};
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
  // CP-B (F5/F12) — "slider" here means "live-control": either a
  // type:'slider' primitive or a type:'plot_point' with a drag.bind_variable.
  // See PM_stateLiveControlVars's own header for why this must be ONE
  // function shared by every consumer instead of four separate scans.
  var stateSliderVars = PM_stateLiveControlVars(scene);
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

  // Reset the per-frame readout obstacle registries + debug snapshot BEFORE
  // Pass 0.25 — drawCartesianPlane's gridlines (Pass 0.25) register into
  // PM_planeGridInkZones, and every readout drawn later this same frame
  // (Pass 0.3) must see them (plus whatever function_plot registers into
  // PM_planeInkZones/PM_planeCurveExpr); resetting any later would wipe what
  // Pass 0.25 just wrote. A stale zone/curve/debug entry from a PRIOR
  // frame's dragged offset or a PRIOR state's plane must never leak into
  // this frame's placement.
  PM_planeInkZones = {};
  PM_planeGridInkZones = {};
  PM_planeCurveExpr = {};
  if (typeof window !== 'undefined') {
    window.__pmDebug = window.__pmDebug || {};
    window.__pmDebug.readouts = {};
  }

  // Pass 0.25 (CP-A, D1) — draw cartesian_plane frames (populates
  // PM_planeRegistry). Runs after surfaces (Pass 0) and before bodies
  // (Pass 1) so every plane_id-carrying primitive resolves through a
  // transform that is current THIS frame. A state may declare more than one
  // plane (F1 multi-plane, e.g. an inset) — every one of them registers.
  for (var pl = 0; pl < scene.length; pl++) {
    var plPrim = scene[pl];
    if (plPrim && plPrim.type === 'cartesian_plane') drawCartesianPlane(plPrim);
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

  // D11 (AMENDMENT 2 / F6 supersession, CP-C2) — clear the frame-scoped
  // riemann_bars publish map at the START of Pass 0.3, before either
  // publisher below runs. A key from a PRIOR frame (or a state that no
  // longer authors the publishing primitive) must never survive into THIS
  // frame's PM_liveExprVars() merge — see PM_riemannPublish's declaration.
  PM_riemannPublish = {};

  // Pass 0.3 (CP-B, F8-F12; CP-C1, F15-F16 geometry; CP-C2, D12 draw order
  // RESTORED; CP-D, F13-F14 slotted into the already-declared position) —
  // region_fill, then riemann_bars, then function_plot, then secant_line /
  // tangent_line, then plot_point, then Pass 3 labels. Runs AFTER
  // PM_applyChoreography() (immediately above) so a choreographed x_domain
  // bound (e.g. xdraw/beta/b) is reflected the same frame it steps (D3 — every
  // primitive below reads PM_liveExprVars(), which PM_applyChoreography()
  // is what refreshes).
  //
  // D12's LITERAL ORDER, RESTORED (bug_class
  // pcpl_riemann_bars_composition_and_draw_order_undeclared; supersedes
  // CP-C1's inversion). CP-C1 ran region_fill/riemann_bars LAST, AFTER
  // plot_point, to dodge a publication clobber: drawPlotPoint's
  // genuine-drag branch (below) reassigns PM_physics wholesale mid-pass,
  // and CP-C1's D11 publish target was PM_physics.derived — so if
  // riemann_bars had already published this frame and the drag-reassign ran
  // afterward, the publish would be WIPED before Pass 3 (labels) read it.
  // But that inversion made rectangles/fill paint OVER the curve and point
  // marker (drawn LAST), the opposite of D12, and — decisively for CP-C2's
  // own delta 9 — an opaque (opacity:1.0) rectangle drawn last fully
  // occludes the curve it is meant to sit beneath, destroying the "missed
  // sliver above each rectangle" reading a first-partition state depends
  // on. The ROOT CAUSE was never the draw order — it was that a
  // RENDER-PASS OUTPUT (the published sum) lived inside PM_physics, an
  // object a DIFFERENT concern (drag input handling) reassigns wholesale.
  // CP-C2 fixed that directly: the publish target moved to
  // PM_riemannPublish (declared above global scope), a map no PM_physics
  // reassignment can touch, at any pass position, ever. D12's order is
  // restored with NO publication hazard.
  //
  // SAME-FRAME CONSEQUENCE, measured (not assumed) — see the CP-C2 dispatch
  // report for the full argument: because region_fill/riemann_bars/
  // function_plot ALL read PM_liveExprVars() and now all run BEFORE
  // plot_point in this pass, during a drag frame they draw with the
  // PRE-drag scope (this frame's value as of the end of the PREVIOUS
  // frame), while plot_point (below) recomputes AND re-renders itself with
  // the POST-drag value in the SAME frame it is grabbed (its own D8
  // same-frame self-correction, unchanged by this dispatch). The dragged
  // point therefore leads the curve/fill/bars by one frame (~16 ms at 60
  // Hz) during an active drag — imperceptible, and NOT a new class of lag:
  // drawCanvasSlider's own knob is drawn with the PRE-drag value on every
  // drag frame too (it updates PM_sliderValues/PM_physics only AFTER
  // painting itself), so "everything except the actively-dragged element
  // reads last frame's value" is this renderer's existing, shipped
  // convention, not a new one. What this restoration actually FIXES: under
  // CP-C1's inverted order, region_fill/riemann_bars ran AFTER plot_point
  // and so were AHEAD of function_plot (which ran BEFORE plot_point) on
  // every drag frame — curve and fill/bars read two DIFFERENT b values in
  // the SAME frame, a same-frame mismatch between the shaded region and the
  // curve it is shaded under. Restoring D12's order makes region_fill,
  // riemann_bars AND function_plot all read the SAME (pre-drag) scope every
  // frame — internally consistent with each other by construction, with
  // only the dragged point ever ahead.
  for (var rf = 0; rf < scene.length; rf++) {
    var rfPrim = scene[rf];
    if (rfPrim && rfPrim.type === 'region_fill') drawRegionFill(rfPrim);
  }
  for (var rb = 0; rb < scene.length; rb++) {
    var rbPrim = scene[rb];
    if (rbPrim && rbPrim.type === 'riemann_bars') drawRiemannBars(rbPrim);
  }
  for (var fp = 0; fp < scene.length; fp++) {
    var fpPrim = scene[fp];
    if (fpPrim && fpPrim.type === 'function_plot') drawFunctionPlot(fpPrim);
  }
  // CP-D (F13-F14) — secant_line / tangent_line slot into D12's ALREADY
  // DECLARED position, between function_plot and plot_point (the doc's own
  // draw-order line and this pass's own header comment both reserved this
  // slot before CP-D existed) — restored order is NOT changed by this
  // dispatch, only filled in.
  for (var sl = 0; sl < scene.length; sl++) {
    var slPrim = scene[sl];
    if (slPrim && slPrim.type === 'secant_line') drawSecantLine(slPrim);
  }
  for (var tl = 0; tl < scene.length; tl++) {
    var tlPrim = scene[tl];
    if (tlPrim && tlPrim.type === 'tangent_line') drawTangentLine(tlPrim);
  }
  for (var pp = 0; pp < scene.length; pp++) {
    var ppPrim = scene[pp];
    if (ppPrim && ppPrim.type === 'plot_point') drawPlotPoint(ppPrim);
  }

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
      PM_planeRegistry = {};  // CP-A — stale plane transforms don't survive a real state switch
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
    // CP-B (F5/F12) — "slider" here means "live-control" (type:'slider' OR a
    // type:'plot_point' drag.bind_variable); see PM_stateLiveControlVars.
    var stateSliderVars = PM_stateLiveControlVars(newScene);
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
    // CP-B (F5/F12) — "slider" here means "live-control" (type:'slider' OR a
    // type:'plot_point' drag.bind_variable); see PM_stateLiveControlVars.
    var curSliderVars = PM_stateLiveControlVars(curScene);
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
<script>
// First script on purpose: relays every iframe error (incl. CDN load failures and
// renderer init crashes) to the parent player, which logs it to telemetry. Without
// it a p5 crash in this engine was completely silent — only the parent's 15s
// ready-timeout noticed, and only for a total failure.
(function () {
  var sent = 0;
  function relay(msg, src, line) {
    if (sent >= 10) return;
    sent++;
    try { parent.postMessage({ type: 'SIM_ERROR', message: String(msg || '').slice(0, 300), source: String(src || '').slice(0, 200), lineno: line || 0 }, '*'); } catch (e) {}
  }
  window.addEventListener('error', function (e) {
    if (e && e.target && e.target !== window && (e.target.src || e.target.href)) { relay('resource_failed: ' + (e.target.src || e.target.href), '', 0); return; }
    relay(e && e.message, e && e.filename, e && e.lineno);
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    relay('unhandledrejection: ' + ((r && r.message) ? r.message : String(r)), '', 0);
  });
})();
<\/script>
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
