/**
 * Voice Professor — verified operation vocabulary (Session-72).
 *
 * Single source of truth for BOTH the brain route (which VALIDATES the model's
 * proposed operations) and the client (which DISPATCHES them as postMessages).
 *
 * The field_3d iframe trusts every postMessage it receives — it does not
 * validate glow targets, math, or hand phases, and only silently ignores an
 * unknown SET_STATE. So THIS whitelist, enforced server-side in validateBeats()
 * and again client-side via operationToSimMessage(), is the safety boundary on
 * what a generative model (Sonnet) can do to the simulation. (CLAUDE.md Rule 18
 * + the Session-72 "verified operation vocabulary, not free control" doctrine.)
 */

// Glow tokens and knob (param) names are CONCEPT-DEFINED, not a fixed list — each
// concept declares its own object set + knobs in its ControlSurface (built from the
// concept JSON + voice bundle by professorBrain.buildGrounding). They are therefore
// plain strings here; the per-concept ControlSurface is the runtime whitelist that
// validateOp/validateBeats enforce. (Session-76: data-driven control surface.)
export type GlowTarget = string;
export type ParamName = string;

// The DEFAULT (magnetic_force_moving_charge) glow tokens — used as the fallback
// when a concept neither declares nor auto-derives its own object set.
export const GLOW_TARGETS = [
    "v",
    "f",
    "b",
    "v_parallel",
    "v_perp",
    "trail",
    "hand",
    "fleming",
    "fleming_index",
    "fleming_middle",
    "fleming_thumb",
    "sliders",
] as const;

export const HAND_PHASES = ["v", "b", "f"] as const;
export type HandPhase = (typeof HAND_PHASES)[number];

// Bounds for ONE knob. `snapSign` marks a sign-only knob (e.g. q_sign) that snaps
// to ±1 instead of clamping to a continuous range.
export interface ParamSpec {
    min: number;
    max: number;
    snapSign?: boolean;
}

// Default (magnetic) knob names + bounds (SI). A concept normally auto-derives
// these from its physics_engine_config.variables; this is only the fallback.
export const PARAM_NAMES = ["theta_deg", "v", "B", "q_sign"] as const;
export const PARAM_BOUNDS: Record<string, ParamSpec> = {
    theta_deg: { min: 0, max: 90 },
    v: { min: 5e4, max: 5e5 },
    B: { min: 1e-3, max: 1e-1 },
    q_sign: { min: -1, max: 1, snapSign: true },
};

// Named camera viewpoints the AI may request (Session-72 camera vocabulary). A
// small SAFE set of verified angles — not free camera control — so the professor
// can frame the picture (e.g. circle face-on, helix edge-on) without ever ending
// up in a disorienting pose. These are GENERIC (geometric directions), the same
// for every concept, so they stay a fixed union.
export const CAMERA_VIEWS = ["default", "face_on", "edge_on", "top", "closer", "wider"] as const;
export type CameraView = (typeof CAMERA_VIEWS)[number];

/**
 * The per-concept control surface — the runtime whitelist of what the generative
 * professor may drive on THIS concept. Built once per concept (professorBrain
 * .buildGrounding) from the concept JSON + voice bundle, then threaded through
 * validateOp / validateBeats / buildBeatsSchema. Making this data-driven is what
 * lets a NEW field_3d simulation become professor-drivable with zero engine edits
 * (CLAUDE.md Rule 28 — "Professor Pack as data, not code").
 */
export interface ControlSurface {
    glow: Set<string>;                    // object tokens that may be glowed / framed / pointed at
    params: Record<string, ParamSpec>;    // turnable knobs + bounds (set_param / sweep_param)
    readouts: Set<string>;                // computed outputs available to announce
    freeze: boolean;                      // does this concept support set_freeze_proton?
    resetTrajectory: boolean;             // does this concept support reset_trajectory?
}

/** The magnetic_force_moving_charge defaults, used when no surface is supplied. */
export const DEFAULT_SURFACE: ControlSurface = {
    glow: new Set(GLOW_TARGETS),
    params: PARAM_BOUNDS,
    readouts: new Set(),
    freeze: true,
    resetTrajectory: true,
};

export type Operation =
    | { op: "set_state"; state: string }
    | { op: "set_glow"; target: GlowTarget | GlowTarget[] | null }
    | { op: "set_math"; expression: string; persist?: boolean }
    | { op: "set_hand_phase"; phase: HandPhase | null }
    | { op: "set_freeze_proton"; frozen: boolean }
    | { op: "set_param"; param: ParamName; value: number }
    // Smoothly animate ONE knob from its current value to `to` over duration_ms
    // (the renderer tweens + recomputes the verified physics each frame). `from`
    // is optional — the renderer resolves the current effective value if omitted.
    | { op: "sweep_param"; param: ParamName; to: number; from?: number; duration_ms: number }
    // Emphasis: keep `targets` bright and DIM every other element. Empty array clears.
    | { op: "dim_except"; targets: GlowTarget[] }
    // Sugar for dim_except with a single target (point the eye at one thing).
    | { op: "point_at"; target: GlowTarget }
    // Surface a verified engine-computed value (F / r / T / ω) on screen. The
    // readout must be one of the concept's physics_engine_config.computed_outputs.
    | { op: "announce"; readout: string }
    | { op: "set_speed"; rate: number }
    | { op: "set_camera"; view: CameraView }
    // Continuously glide the camera to the EXACT angle that best shows `object` —
    // the renderer computes it from the object's live 3D direction (no preset, any
    // concept). The AI names the object; the verified engine computes the angle.
    | { op: "frame_object"; object: GlowTarget }
    // Draw a yellow arc + angle label between two arrows — visible even when they
    // are collinear (theta 0/180), where no camera angle can separate them.
    | { op: "show_angle_between"; a: GlowTarget; b: GlowTarget; label?: string }
    | { op: "pause" }
    | { op: "resume" }
    | { op: "reset_trajectory" };

export interface Beat {
    say: string;
    ops: Operation[];
    // Server-populated (NOT model-authored): the verified engine value for an
    // `announce` op in this beat, so the client can speak the exact number
    // without the model ever fabricating it. See professorBrain announce-compute.
    readout_value?: { readout: string; formatted: string };
}

/** Clamp a raw knob value to a knob's verified bounds (a sign-only knob snaps to
 *  ±1). Shared by set_param and sweep_param so both honour the same bounds. A
 *  missing spec (unknown knob) returns the value unchanged — the caller has
 *  already rejected unknown knobs, so this is only defensive. */
export function clampParam(spec: ParamSpec | undefined, value: number): number {
    if (!spec) return value;
    if (spec.snapSign) return value < 0 ? -1 : 1;
    return Math.max(spec.min, Math.min(spec.max, value));
}

export interface ValidatedBeats {
    beats: Beat[];
    droppedOps: number;
}

// ── Bounds (defensive; keep a runaway turn from flooding TTS/the sim) ────────
const MAX_BEATS = 12;
const MAX_SAY_CHARS = 300;
const MAX_MATH_CHARS = 200;
const MAX_OPS_PER_BEAT = 6;
const STATE_RE = /^STATE_\d+$/;
// Glow tokens + knobs are per-concept (the ControlSurface); only the truly generic
// vocabularies (hand phases, camera views) stay module-level fixed sets.
const HAND_SET: Set<string> = new Set(HAND_PHASES);
const CAMERA_SET: Set<string> = new Set(CAMERA_VIEWS);

function asRecord(v: unknown): Record<string, unknown> | null {
    return v !== null && typeof v === "object" && !Array.isArray(v)
        ? (v as Record<string, unknown>)
        : null;
}

function validateGlowTarget(
    raw: unknown,
    glow: Set<string>,
): { value: GlowTarget | GlowTarget[] | null; dropped: number } {
    if (raw === null || raw === undefined) return { value: null, dropped: 0 };
    if (typeof raw === "string") {
        return glow.has(raw) ? { value: raw, dropped: 0 } : { value: null, dropped: 1 };
    }
    if (Array.isArray(raw)) {
        const kept = raw.filter((t): t is GlowTarget => typeof t === "string" && glow.has(t));
        const dropped = raw.length - kept.length;
        if (kept.length === 0) return { value: null, dropped };
        return { value: kept, dropped };
    }
    return { value: null, dropped: 1 };
}

export function validateOp(
    raw: unknown,
    validStateIds: Set<string>,
    surface: ControlSurface = DEFAULT_SURFACE,
): { op: Operation | null; dropped: number } {
    const r = asRecord(raw);
    if (!r) return { op: null, dropped: 1 };
    const kind = typeof r.op === "string" ? r.op : "";
    switch (kind) {
        case "set_state": {
            const state = typeof r.state === "string" ? r.state : "";
            // Drop a bad jump — never clamp to a neighbour; a wrong state teaches wrong physics.
            if (!STATE_RE.test(state) || !validStateIds.has(state)) return { op: null, dropped: 1 };
            return { op: { op: "set_state", state }, dropped: 0 };
        }
        case "set_glow": {
            const { value, dropped } = validateGlowTarget(r.target, surface.glow);
            return { op: { op: "set_glow", target: value }, dropped };
        }
        case "set_math": {
            if (typeof r.expression !== "string") return { op: null, dropped: 1 };
            return {
                op: { op: "set_math", expression: r.expression.slice(0, MAX_MATH_CHARS), persist: r.persist === true },
                dropped: 0,
            };
        }
        case "set_hand_phase": {
            const phase = r.phase;
            if (phase === null) return { op: { op: "set_hand_phase", phase: null }, dropped: 0 };
            if (typeof phase === "string" && HAND_SET.has(phase)) {
                return { op: { op: "set_hand_phase", phase: phase as HandPhase }, dropped: 0 };
            }
            return { op: null, dropped: 1 };
        }
        case "set_freeze_proton":
            // Only available on concepts that support it (a freezable moving object).
            if (!surface.freeze) return { op: null, dropped: 1 };
            return { op: { op: "set_freeze_proton", frozen: r.frozen === true }, dropped: 0 };
        case "set_param": {
            const param = typeof r.param === "string" ? r.param : "";
            const spec = surface.params[param];
            if (!spec) return { op: null, dropped: 1 };
            if (typeof r.value !== "number" || !Number.isFinite(r.value)) return { op: null, dropped: 1 };
            // CLAMP, don't drop: a clamped knob still teaches correct physics,
            // whereas dropping it mid-narration leaves "watch B climb" with no
            // visual. (set_state stays drop-only — a wrong STATE teaches wrong
            // physics; a clamped knob does not.) A sign-only knob snaps to ±1.
            return { op: { op: "set_param", param, value: clampParam(spec, r.value) }, dropped: 0 };
        }
        case "sweep_param": {
            const param = typeof r.param === "string" ? r.param : "";
            const spec = surface.params[param];
            if (!spec) return { op: null, dropped: 1 };
            if (typeof r.to !== "number" || !Number.isFinite(r.to)) return { op: null, dropped: 1 };
            // Same clamp-not-drop rationale as set_param. duration clamps to a
            // sane teaching range; a stray `from` is clamped, an absent one is
            // resolved by the renderer to the current value.
            const dur = typeof r.duration_ms === "number" && Number.isFinite(r.duration_ms)
                ? Math.max(300, Math.min(8000, r.duration_ms))
                : 2000;
            const op: Operation = { op: "sweep_param", param, to: clampParam(spec, r.to), duration_ms: dur };
            if (typeof r.from === "number" && Number.isFinite(r.from)) op.from = clampParam(spec, r.from);
            return { op, dropped: 0 };
        }
        case "dim_except": {
            const raw2 = Array.isArray(r.targets) ? r.targets : [];
            const targets = raw2.filter((t): t is GlowTarget => typeof t === "string" && surface.glow.has(t));
            const dropped = raw2.length - targets.length;
            // Empty `targets` is valid — it CLEARS emphasis (everything bright again).
            return { op: { op: "dim_except", targets }, dropped };
        }
        case "point_at": {
            const target = typeof r.target === "string" ? r.target : "";
            if (!surface.glow.has(target)) return { op: null, dropped: 1 };
            return { op: { op: "point_at", target }, dropped: 0 };
        }
        case "announce": {
            const readout = typeof r.readout === "string" ? r.readout : "";
            // Drop-only: an unknown readout would surface nothing / a wrong value.
            if (!surface.readouts.has(readout)) return { op: null, dropped: 1 };
            return { op: { op: "announce", readout }, dropped: 0 };
        }
        case "set_speed": {
            if (typeof r.rate !== "number" || !Number.isFinite(r.rate)) return { op: null, dropped: 1 };
            // Clamp; slow-motion lives in (0,1]. Same clamp-not-drop rationale as set_param.
            return { op: { op: "set_speed", rate: Math.max(0.1, Math.min(2.0, r.rate)) }, dropped: 0 };
        }
        case "set_camera": {
            const view = typeof r.view === "string" ? r.view : "";
            if (!CAMERA_SET.has(view)) return { op: null, dropped: 1 };
            return { op: { op: "set_camera", view: view as CameraView }, dropped: 0 };
        }
        case "frame_object": {
            const object = typeof r.object === "string" ? r.object : "";
            if (!surface.glow.has(object)) return { op: null, dropped: 1 };
            return { op: { op: "frame_object", object }, dropped: 0 };
        }
        case "show_angle_between": {
            const a = typeof r.a === "string" && surface.glow.has(r.a) ? r.a : "";
            const b = typeof r.b === "string" && surface.glow.has(r.b) ? r.b : "";
            if (!a || !b) return { op: null, dropped: 1 };
            const label = typeof r.label === "string" ? r.label : undefined;
            return { op: { op: "show_angle_between", a, b, label }, dropped: 0 };
        }
        case "pause":
            return { op: { op: "pause" }, dropped: 0 };
        case "resume":
            return { op: { op: "resume" }, dropped: 0 };
        case "reset_trajectory":
            // Only available on concepts that draw a trajectory to reset.
            if (!surface.resetTrajectory) return { op: null, dropped: 1 };
            return { op: { op: "reset_trajectory" }, dropped: 0 };
        default:
            return { op: null, dropped: 1 };
    }
}

/**
 * Validate the model's proposed beats against the operation whitelist. Never
 * throws: a malformed op is dropped and counted (meta.dropped_ops) rather than
 * killing the turn. Accepts either `{ beats: [...] }` or a bare `[...]`.
 */
export function validateBeats(
    raw: unknown,
    validStateIds: Set<string>,
    surface: ControlSurface = DEFAULT_SURFACE,
): ValidatedBeats {
    let droppedOps = 0;
    const wrapped = asRecord(raw);
    const beatsRaw: unknown = wrapped && "beats" in wrapped ? wrapped.beats : raw;
    if (!Array.isArray(beatsRaw)) return { beats: [], droppedOps };

    const beats: Beat[] = [];
    for (const b of beatsRaw.slice(0, MAX_BEATS)) {
        const r = asRecord(b);
        if (!r) continue;
        const say = typeof r.say === "string" ? r.say.trim().slice(0, MAX_SAY_CHARS) : "";
        const opsRaw = Array.isArray(r.ops) ? r.ops.slice(0, MAX_OPS_PER_BEAT) : [];
        const ops: Operation[] = [];
        for (const o of opsRaw) {
            const { op, dropped } = validateOp(o, validStateIds, surface);
            droppedOps += dropped;
            if (op) ops.push(op);
        }
        if (!say && ops.length === 0) continue; // skip empty beats
        beats.push({ say, ops });
    }
    return { beats, droppedOps };
}

// ── Client-side: translate a validated Operation into the iframe postMessage ──
export interface SimMessage {
    type: string;
    [key: string]: unknown;
}

export function operationToSimMessage(op: Operation): SimMessage {
    switch (op.op) {
        case "set_state":
            return { type: "SET_STATE", state: op.state };
        case "set_glow":
            return { type: "SET_GLOW", target: op.target };
        case "set_math":
            return { type: "SET_MATH", expression: op.expression, persist: op.persist === true };
        case "set_hand_phase":
            return { type: "SET_HAND_PHASE", phase: op.phase };
        case "set_freeze_proton":
            return { type: "SET_FREEZE_PROTON", frozen: op.frozen };
        case "set_param":
            return { type: "SET_PARAM", param: op.param, value: op.value };
        case "sweep_param":
            return { type: "SWEEP_PARAM", param: op.param, to: op.to, from: op.from, duration_ms: op.duration_ms };
        case "dim_except":
            return { type: "SET_EMPHASIS", targets: op.targets, enabled: op.targets.length > 0 };
        case "point_at":
            return { type: "SET_EMPHASIS", targets: [op.target], enabled: true };
        case "announce":
            return { type: "SET_READOUT", readout: op.readout };
        case "set_speed":
            return { type: "SET_SPEED", rate: op.rate };
        case "set_camera":
            return { type: "SET_CAMERA", view: op.view };
        case "frame_object":
            return { type: "FRAME_OBJECT", object: op.object };
        case "show_angle_between":
            return { type: "SHOW_ANGLE_BETWEEN", a: op.a, b: op.b, label: op.label };
        case "pause":
            return { type: "PAUSE" };
        case "resume":
            return { type: "RESUME" };
        case "reset_trajectory":
            return { type: "RESET_TRAJECTORY" };
    }
}

/**
 * JSON Schema for the beats plan, for Anthropic structured outputs
 * (output_config.format). State enum is concept-specific so the model can only
 * emit states that exist. Structured-output limits respected: every object has
 * additionalProperties:false + required; no string length / numeric constraints
 * (those are enforced in validateBeats instead).
 */
export function buildBeatsSchema(
    stateIds: string[],
    surface: ControlSurface = DEFAULT_SURFACE,
): Record<string, unknown> {
    const glowEnum = [...surface.glow];
    const paramEnum = Object.keys(surface.params);
    const readoutNames = [...surface.readouts];
    const anyOf: Record<string, unknown>[] = [
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "state"],
                properties: { op: { const: "set_state" }, state: { enum: stateIds } },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "target"],
                properties: {
                    op: { const: "set_glow" },
                    target: {
                        anyOf: [{ enum: glowEnum }, { type: "array", items: { enum: glowEnum } }, { type: "null" }],
                    },
                },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "expression", "persist"],
                properties: {
                    op: { const: "set_math" },
                    expression: { type: "string" },
                    persist: { type: "boolean" },
                },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "phase"],
                properties: {
                    op: { const: "set_hand_phase" },
                    phase: { anyOf: [{ enum: ["v", "b", "f"] }, { type: "null" }] },
                },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "rate"],
                properties: { op: { const: "set_speed" }, rate: { type: "number" } },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "view"],
                properties: { op: { const: "set_camera" }, view: { enum: [...CAMERA_VIEWS] } },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op"],
                properties: { op: { const: "pause" } },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op"],
                properties: { op: { const: "resume" } },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "targets"],
                properties: {
                    op: { const: "dim_except" },
                    targets: { type: "array", items: { enum: glowEnum } },
                },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "target"],
                properties: { op: { const: "point_at" }, target: { enum: glowEnum } },
            },
            {
                type: "object",
                additionalProperties: false,
                required: ["op", "a", "b"],
                properties: {
                    op: { const: "show_angle_between" },
                    a: { enum: glowEnum },
                    b: { enum: glowEnum },
                    label: { type: "string" },
                },
            },
        ];
        // ── Concept-conditional ops (only offered when the surface supports them,
        //    which also avoids an invalid empty enum). ──
        if (surface.freeze) {
            anyOf.push({
                type: "object",
                additionalProperties: false,
                required: ["op", "frozen"],
                properties: { op: { const: "set_freeze_proton" }, frozen: { type: "boolean" } },
            });
        }
        if (surface.resetTrajectory) {
            anyOf.push({
                type: "object",
                additionalProperties: false,
                required: ["op"],
                properties: { op: { const: "reset_trajectory" } },
            });
        }
        if (paramEnum.length > 0) {
            anyOf.push({
                type: "object",
                additionalProperties: false,
                required: ["op", "param", "value"],
                properties: {
                    op: { const: "set_param" },
                    param: { enum: paramEnum },
                    value: { type: "number" },
                },
            });
            anyOf.push({
                type: "object",
                additionalProperties: false,
                // `from` is intentionally omitted (structured-output requires every
                // listed property; the renderer resolves the current value when
                // absent). The NDJSON streaming path may still supply `from`.
                required: ["op", "param", "to", "duration_ms"],
                properties: {
                    op: { const: "sweep_param" },
                    param: { enum: paramEnum },
                    to: { type: "number" },
                    duration_ms: { type: "number" },
                },
            });
        }
        // `announce` only when the concept declares computed outputs (avoid an empty enum).
        if (readoutNames.length > 0) {
            anyOf.push({
                type: "object",
                additionalProperties: false,
                required: ["op", "readout"],
                properties: { op: { const: "announce" }, readout: { enum: readoutNames } },
            });
        }
    const operationSchema = { anyOf };
    return {
        type: "object",
        additionalProperties: false,
        required: ["beats"],
        properties: {
            beats: {
                type: "array",
                items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["say", "ops"],
                    properties: {
                        say: { type: "string" },
                        ops: { type: "array", items: operationSchema },
                    },
                },
            },
        },
    };
}
