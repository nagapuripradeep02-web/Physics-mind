/**
 * Voice Professor — generative brain (Option B).
 *
 * Sonnet reasons and explains the concept live AND decides the simulation
 * operations itself, returning a structured "beats" plan (one spoken line +
 * the sim ops that fire as it is spoken). Rule 18 / Session-72 guardrail: the
 * model is heavily GROUNDED in the concept's authored physics, and every
 * operation it proposes is validated against the whitelist (operations.ts)
 * before it can reach the sim. Teacher-facing generative demo — not yet
 * student-facing.
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { evaluate } from "mathjs";
import { logUsage } from "@/lib/usageLogger";
import {
    buildBeatsSchema,
    validateBeats,
    validateOp,
    PARAM_NAMES,
    type Beat,
    type Operation,
    type ParamName,
} from "./operations";
import { classifyConfusion, type ClusterRow } from "@/lib/confusionClassifier";
import { describeViewAxis } from "./framing";

const SONNET_MODEL = "claude-sonnet-4-6";
// Sonnet 4.6 pricing (per 1M tokens): input $3, output $15, cache-read ~0.1x, cache-write ~1.25x.
const IN_USD_PER_MTOK = 3.0;
const OUT_USD_PER_MTOK = 15.0;
const CACHE_READ_USD_PER_MTOK = 0.3;
const CACHE_WRITE_USD_PER_MTOK = 3.75;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ProfessorIntent = "doubt" | "start_lesson" | "explain_whole";

export interface ProfessorHistoryTurn {
    role: "student" | "professor";
    text: string;
}

export interface ProfessorInput {
    conceptId: string;
    intent: ProfessorIntent;
    transcript?: string;
    currentState?: string;
    /** The viewpoint the student is ACTUALLY looking from — unit view axis (camera →
     *  origin), reported by the renderer (manual orbit or a named view). Lets the
     *  professor judge whether the object it is about to explain is visible and
     *  reframe if not. Null/absent → framing pre-step is skipped. */
    currentViewAxis?: [number, number, number] | null;
    /** Live world-space unit directions of the on-screen objects, keyed by glow token
     *  (v / f / b / v_parallel / v_perp), reported by the renderer (OBJECT_DIRS). The
     *  framing decision reads these — array of real directions, not per-concept code. */
    objectDirections?: Record<string, [number, number, number]> | null;
    history?: ProfessorHistoryTurn[];
    sessionId?: string;
    /** Cost-tracking tag — separates founder testing from real student usage.
     *  Defaults to founder_test in logUsage when omitted. */
    actor?: "founder_test" | "student" | "reviewer";
}

export interface ProfessorResult {
    beats: Beat[];
    stateIds: string[];
    droppedOps: number;
    fallbackUsed: boolean;
}

export class ConceptNotFoundError extends Error {}

// ── Per-state glowable elements + manipulable knobs are AUTO-DERIVED from the
//    concept JSON (no per-concept hardcoding), so any field_3d concept with a
//    teacher_script + physics_engine_config works. ──

/** Flatten a tts_sentence `glow` field (string | string[] | other) to tokens. */
function flattenGlow(glow: unknown): string[] {
    if (typeof glow === "string") return [glow];
    if (Array.isArray(glow)) return glow.filter((g): g is string => typeof g === "string");
    return [];
}

/** Per-state glowable element tokens = the union of every tts_sentence's `glow`
 *  in that state (verified to reproduce the old hardcoded STATE_ELEMENTS map). */
function deriveStateElements(state: StateJson): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of state.teacher_script?.tts_sentences ?? []) {
        for (const tok of flattenGlow(s.glow)) {
            if (!seen.has(tok)) { seen.add(tok); out.push(tok); }
        }
    }
    return out;
}

/** Pull the first { belief, fix } from a misconception_watch authored as either
 *  an array (v2) or a bare object (legacy). */
function firstMisconception(mw: unknown): { belief: string; fix: string } | null {
    const rec = Array.isArray(mw) ? mw[0] : mw;
    if (!rec || typeof rec !== "object") return null;
    const r = rec as Record<string, unknown>;
    const belief = typeof r.belief === "string" ? r.belief : "";
    if (!belief) return null;
    const fix = typeof r.one_line_fix === "string" ? r.one_line_fix
        : typeof r.fix === "string" ? r.fix : "";
    return { belief, fix };
}

interface TtsSentenceJson {
    text_en?: string;
    glow?: unknown;   // string | string[] — the on-screen element(s) this line references
}
interface StateJson {
    title?: string;
    teacher_script?: { tts_sentences?: TtsSentenceJson[] };
    // Authored as an array of { belief, one_line_fix } in v2 concepts, but older
    // files used a bare object — parsed defensively (firstMisconception).
    misconception_watch?: unknown;
}
interface ConceptJson {
    concept_name?: string;
    real_world_anchor?: Record<string, string>;
    physics_engine_config?: {
        variables?: Record<string, { default?: number; unit?: string }>;
        computed_outputs?: Record<string, { formula?: string }>;
    };
    aha_moment?: { statement?: string; visual_confirmation?: string };
    epic_l_path?: { states?: Record<string, StateJson> };
    // Per-state authored camera_position [x,y,z] — the view a state lands on. Used to
    // judge framing from the state the doubt jumps to (not the pre-jump view).
    field_3d_config?: { states?: Record<string, { camera_position?: number[] }> };
}
interface BundleCluster {
    cluster_id?: string;
    label?: string;
    description?: string;
    trigger_examples?: string[];
    answer_text?: string;
    jump_to_state?: string;
    glow?: unknown;
    math_show?: string | null;
}
// A reviewed, founder-authored named gesture: an ordered op-sequence served
// verbatim (zero model call) when a student asks for it by name.
interface BundleMove {
    move_id?: string;
    label?: string;
    description?: string;
    trigger_examples?: string[];
    sequence?: Array<{ say?: string; ops?: unknown[] }>;
}
interface BundleJson {
    fallback?: { answer_text?: string; default_jump_to_state?: string };
    clusters?: BundleCluster[];
    moves?: BundleMove[];
    // Founder-authored "aside" states the generative model may jump to ONLY when the
    // student explicitly asks for them (release_when keyword or "state N" by name) —
    // e.g. the Fleming LEFT-hand reconciliation, which must never fire on a right-hand
    // question. Enforced per-turn by shrinking the allowed-state set (operations.ts drop).
    gated_states?: Array<{ state: string; release_when?: string; note?: string }>;
    // Optional rich per-state knob guidance. When present, ONLY the listed states
    // get a "knobs" line (mirrors the old hardcoded map, incl. omitting Fleming);
    // when absent, every state gets an auto-generated knob line from the variables.
    state_hints?: Record<string, string>;
}

// A move whose ops have already been validated at load time → ready to stream.
interface ValidatedMove {
    moveId: string;
    label: string;
    triggerExamples: string[];
    beats: Beat[];
}

interface ConceptGrounding {
    stableSystem: string;
    stateIds: string[];
    fallbackAnswer: string;
    fallbackState: string;
    clusters: BundleCluster[];
    moves: ValidatedMove[];
    readoutNames: string[];                       // computed_outputs keys (announce allow-set)
    readoutFormulas: Record<string, string>;      // readout -> formula string
    variableDefaults: Record<string, number>;     // knob -> default (announce-compute baseline)
    stateCameras: Record<string, [number, number, number]>;  // per-state authored camera_position (framing)
    gatedStates: Array<{ state: string; releaseRe: RegExp | null; note: string }>;  // aside states gated from generative jumps
}

const groundingCache = new Map<string, ConceptGrounding | null>();

function readJson<T>(...segments: string[]): T | null {
    try {
        return JSON.parse(fs.readFileSync(path.join(process.cwd(), ...segments), "utf-8")) as T;
    } catch {
        return null;
    }
}

function stateNumber(id: string): number {
    const m = /STATE_(\d+)/.exec(id);
    return m ? parseInt(m[1], 10) : 9999;
}

/** Compile a gated state's release_when pattern (case-insensitive); null if absent/invalid. */
function compileReleaseRe(src?: string): RegExp | null {
    if (!src) return null;
    try { return new RegExp(src, "i"); } catch { return null; }
}

// The field_3d renderer's FIXED arrow palette (mirror of field_3d_renderer.ts:
// vArrow #FFAB40, ambient field #42A5F5, fArrow #66BB6A). The Voice Professor only
// drives field_3d concepts, so one legend grounds every concept's narration in the
// colours actually on screen — the model otherwise defaults to the textbook convention
// (v=blue, B=red) and mis-names them. Branch by renderer if a non-field_3d concept is wired.
const FIELD3D_COLOR_LEGEND: Array<[string, string]> = [
    ["velocity v", "orange"],
    ["magnetic field B", "blue"],
    ["force F", "green"],
    ["the v components (v∥, v⊥)", "orange"],
    ["the path / trail", "pale peach"],
];

function buildGrounding(conceptId: string): ConceptGrounding | null {
    if (groundingCache.has(conceptId)) return groundingCache.get(conceptId) ?? null;

    const concept = readJson<ConceptJson>("src", "data", "concepts", `${conceptId}.json`);
    if (!concept?.epic_l_path?.states) {
        groundingCache.set(conceptId, null);
        return null;
    }
    const bundle = readJson<BundleJson>("src", "data", "voice_professor", `${conceptId}.json`);

    const states = concept.epic_l_path.states;
    const stateIds = Object.keys(states).sort((a, b) => stateNumber(a) - stateNumber(b));

    // ── Auto-derived manifest from the concept JSON (no per-concept hardcoding) ──
    const variables = concept.physics_engine_config?.variables ?? {};
    const knobNames = Object.keys(variables);
    const computed = concept.physics_engine_config?.computed_outputs ?? {};
    const readoutNames = Object.keys(computed);
    const readoutFormulas: Record<string, string> = {};
    for (const k of readoutNames) readoutFormulas[k] = computed[k]?.formula ?? "";
    const variableDefaults: Record<string, number> = {};
    for (const k of knobNames) {
        const d = variables[k]?.default;
        variableDefaults[k] = typeof d === "number" ? d : 0;
    }

    // Knobs line: hint-driven concepts (state_hints present) only annotate the
    // listed states (mirrors the old hardcoded map incl. omitting Fleming); a
    // concept with no hints gets an auto knob line on every state.
    const hints = bundle?.state_hints;
    const knobLineFor = (id: string): string | null => {
        if (hints) return hints[id] ?? null;
        if (knobNames.length === 0) return null;
        return `${knobNames.join(", ")} — turn any of these; the verified engine recomputes the motion`;
    };

    // Gated "aside" states (founder-authored): the generative model may only jump to one
    // when the student EXPLICITLY asks for it. Parsed here so stateLines can tag them and
    // the per-turn leash can shrink the allowed-state set.
    const gatedStates = (bundle?.gated_states ?? [])
        .filter((g): g is { state: string; release_when?: string; note?: string } => !!g && typeof g.state === "string")
        .map((g) => ({ state: g.state, releaseRe: compileReleaseRe(g.release_when), note: typeof g.note === "string" ? g.note : "" }));

    // Per-state grounding table (glowable elements come from the tts_sentence glow tokens).
    const stateLines = stateIds.map((id) => {
        const s = states[id];
        const tokens = deriveStateElements(s);
        const els = tokens.length ? tokens.join(", ") : "(no glowable elements here — do not glow)";
        const knobs = knobLineFor(id);
        const knobLine = knobs ? `\n    knobs (set_param/sweep_param): ${knobs}` : "";
        const mw = firstMisconception(s.misconception_watch);
        const misc = mw ? ` | misconception to confront: "${mw.belief}" → ${mw.fix}` : "";
        const gated = gatedStates.find((x) => x.state === id);
        const aside = gated ? `\n    [ASIDE — do NOT jump here unless the student EXPLICITLY asks about it: ${gated.note}]` : "";
        return `- ${id} — ${s.title ?? id}\n    on-screen (glowable): ${els}${knobLine}${misc}${aside}`;
    });

    // Reviewed exemplars from the founder-approved bundle (style/accuracy anchor).
    const exemplarLines = (bundle?.clusters ?? []).map((c) => {
        const glow = c.glow == null ? "none" : JSON.stringify(c.glow);
        const math = c.math_show ? ` | math: ${c.math_show}` : "";
        return `- "${c.label ?? ""}" → ${c.jump_to_state ?? "?"} | glow: ${glow}${math}\n    answer: ${c.answer_text ?? ""}`;
    });

    const anchors = concept.real_world_anchor
        ? Object.values(concept.real_world_anchor).join("\n  ")
        : "";

    const stableSystem = [
        `You are an expert physics professor in a TEACHER-FACING, generative live demo. You teach "${concept.concept_name ?? conceptId}" by NARRATING and CONTROLLING a 3D simulation in real time. You reason and explain on the fly and may answer ANY question — but every physics claim must stay consistent with the DECLARED PHYSICS below, and you may drive the simulation ONLY through the listed operations.`,
        ``,
        `# Declared physics (the truth — never contradict this)`,
        "```json",
        JSON.stringify(concept.physics_engine_config ?? {}, null, 1),
        "```",
        concept.aha_moment?.statement
            ? `Aha moment: ${concept.aha_moment.statement} ${concept.aha_moment.visual_confirmation ?? ""}`
            : "",
        ``,
        `# Indian-context real-world anchors (use these, plain English, never Hinglish)`,
        `  ${anchors}`,
        ``,
        `# Simulation states you can show (jump with set_state BEFORE glowing that state's elements)`,
        `A state tagged [ASIDE …] is an off-topic detour — never set_state to it unless the student's question is explicitly about that aside; use the main states for everything else.`,
        stateLines.join("\n"),
        ``,
        `# Operation vocabulary (the ONLY ways you may drive the simulation)`,
        `- set_state {state}: jump to a state above (one of ${stateIds.join(", ")}).`,
        `- set_glow {target}: highlight a scene element. target is a single glow token, an array of tokens, or null to clear. Only glow tokens listed as "on-screen" for the state you are currently showing.`,
        `- set_math {expression, persist}: show a LaTeX equation in the side panel (persist:true stacks it, false replaces). Use "" to clear.`,
        `- set_hand_phase {phase}: lock the 3D right-hand at "v" (fingers along v), "b" (curl toward B), or "f" (thumb gives F); null resumes. Only meaningful where a hand is on screen.`,
        `- set_freeze_proton {frozen}: pause/unpause the moving particle.`,
        `- set_param {param, value}: turn ONE physics knob — the verified engine recomputes the motion, so you NEVER state the resulting numbers yourself. param is one of: theta_deg (0-90, the angle between v and B), v (50000-500000 m/s, the speed), B (0.001-0.1 T, the field strength), q_sign (+1 or -1, the charge sign). Out-of-range values are clamped. Emit set_state FIRST, then set_param, and only turn knobs listed for the state you are showing. Reach for this whenever the student asks to change / control / vary / increase / decrease a parameter, OR when turning a knob shows the idea better than words (e.g. lower theta_deg to open the circle into a helix).`,
        `- sweep_param {param, to, duration_ms}: SMOOTHLY animate one knob to a target value over duration_ms (300-8000). Prefer this over set_param when the student should WATCH the change happen — e.g. {"op":"sweep_param","param":"theta_deg","to":0,"duration_ms":2500} opens the circle into a helix before their eyes. Same knobs and bounds as set_param; narrate the motion while it animates.`,
        `- dim_except {targets} / point_at {target}: keep the listed element(s) bright and DIM everything else, to focus the eye (e.g. dim_except {"targets":["f"]} = "look only at the force"). targets/target are glow tokens valid for the current state; dim_except with [] clears the dimming. Clears automatically on the next set_state.`,
        readoutNames.length ? `- announce {readout}: surface a verified engine-computed value on screen. It is ALSO spoken aloud for you automatically, so do NOT say the number yourself — just narrate around it ("watch how strong the force gets"). readout is one of: ${readoutNames.join(", ")}.` : ``,
        `- pause / resume: pause FREEZES the moving picture so you can explain a held moment; resume plays it on. Your spoken narration keeps going while paused — describe the frozen frame, then resume. This is how you "pause, explain, play": pause, say the key point, resume.`,
        `- set_speed {rate}: playback speed. 1 = normal, 0.5 = half, 0.3 = clear slow-motion. Drop to 0.3-0.5 for anything subtle (the curve of the path, the direction of F) so the student can actually follow the motion.`,
        `- set_camera {view}: glide the 3D camera to a verified viewpoint to FRAME what you are explaining (the move is animated; you often PAUSE there next). view is one of: "face_on" (look straight down the field axis B — circular motion reads as a true circle), "edge_on" (from the side — a helix shows its forward stretch and a circle reads as a flat line), "top" (bird's-eye), "closer" / "wider" (zoom in / out), "default" (the standard 3/4 angle). Use it to make the SHAPE obvious — e.g. set_camera face_on to prove the path really is a circle, or set_camera edge_on then pause to show a helix climbing along B.`,
        `- frame_object {object}: glide the camera to the EXACT angle that best shows one object, computed from its live 3D direction — use this when what you are about to explain would be hard to see from where the student is looking (e.g. a vector pointing toward the camera reads as a dot). object is a glow token (v, f, b, v_parallel, v_perp). Prefer this over set_camera when you want to make ONE specific arrow clearly visible; say something like "let me turn this so you can see the velocity" as you do it.`,
        `- show_angle_between {a, b, label?}: draw a yellow arc and angle label between two arrows, visible even when they are COLLINEAR (overlap as a single arrow from every camera angle). Use this whenever theta is near 0° or 180° — no camera move can separate v and B when they point the same way, so frame_object/set_camera will NOT help; this is the only tool that makes the angle readable. a and b are glow tokens. Example: {"op":"show_angle_between","a":"v","b":"b"} at theta=0 shows a "0°" label beside the overlapping arrows. The arc auto-clears on the next set_state. The optional label overrides the computed angle text.`,
        `- reset_trajectory: restart the particle path.`,
        `Never invent operations or glow tokens outside this list — anything else is dropped.`,
        ``,
        `# How to teach with the picture — the 80/20 rule (THIS IS THE CRAFT)`,
        `The screen is the teacher; your voice is the pointer. Aim for ~80% of the teaching to be VISIBLE ACTION on the simulation and ~20% spoken. Use at MOST ONE real-world analogy in the whole answer (the train, the spinning stone) — then spend the rest of your words narrating what is visibly happening on screen RIGHT NOW, not describing things in the abstract.`,
        `STAGE EVERY CLAIM. The instant you are about to assert a spatial relationship — "parallel", "perpendicular", "points to the centre", "same direction", "stronger", "ninety degrees" — the ops in THAT SAME beat must make the screen show it. Never speak a relationship the picture is not currently demonstrating; if you cannot show it, do not claim it.`,
        `THE COMPARISON MOVE (reach for it constantly): to make how two elements relate undeniable — (1) set_state to where both are on screen, (2) dim_except them so nothing else competes for the eye, (3) frame_object / set_camera so the relationship is actually VISIBLE from where the student is looking (two arrows pointing along the line of sight collapse to dots — turn until the angle between them is open and readable), (4) pause to hold that frame, (5) THEN say the one-line conclusion, then resume. Show first, conclude second.`,
        `COLLINEAR EXCEPTION (theta=0 or theta=180): when two arrows genuinely point along the same line, no camera move can open the angle between them — frame_object and set_camera will NOT help (they stay stacked as one arrow from every viewpoint). Do NOT struggle with camera ops here. Instead show_angle_between the two tokens immediately so the "0°" / "180°" label appears beside the overlapping arrows, then narrate "both point along the same line, theta is zero, sine of zero is zero — so no force." Do this BEFORE any other explanation of the case.`,
        `Slow the subtle moments down (set_speed 0.3-0.5 for the bend of a path or the direction of a force), and whenever turning a knob shows the idea better than words can, sweep_param it and narrate the motion rather than describing the result.`,
        ``,
        `# Reviewed answers (match this accuracy, register, and Indian-context style; you are NOT limited to these — answer anything, but never contradict the declared physics)`,
        exemplarLines.join("\n"),
        ``,
        `# On-screen colours (the renderer's ACTUAL colours — never guess a colour)`,
        FIELD3D_COLOR_LEGEND.map(([what, colour]) => `- ${what} → ${colour}`).join("\n"),
        `When you point at an arrow, prefer its LETTER label (v, B, F) over its colour. If you DO name a colour it MUST match the list above — never call v "blue" or B "red".`,
        ``,
        `# Style`,
        `- Plain English, short spoken sentences (each "say" is one breath, ~1-2 sentences). No Hinglish. No fabricated numbers beyond the declared formulas/ranges.`,
        `- If asked something outside what this simulation models (e.g. the field the charge itself produces, relativistic speeds, or an unrelated topic), say so briefly and warmly, then bring up the nearest relevant state — never invent physics that isn't in the declared block above.`,
        // NOTE: the "# Output" section is intentionally NOT baked into this cached
        // body — it is appended per-call via buildOutputSection() so the streaming
        // path can request NDJSON while the legacy path keeps the single JSON
        // object, without maintaining two different cached prompts.
    ]
        .filter((line) => line !== "")
        .join("\n");

    // Validate each reviewed move's ops once, at load (bad ops dropped; empty moves skipped).
    const validStateIds = new Set(stateIds);
    const readoutSet = new Set(readoutNames);
    const moves: ValidatedMove[] = [];
    for (const m of bundle?.moves ?? []) {
        if (!m.move_id || !Array.isArray(m.sequence)) continue;
        const { beats } = validateBeats({ beats: m.sequence }, validStateIds, readoutSet);
        if (beats.length === 0) continue;
        moves.push({
            moveId: m.move_id,
            label: m.label ?? m.move_id,
            triggerExamples: m.trigger_examples ?? [],
            beats,
        });
    }

    // Per-state authored camera (for framing — judge visibility from the view a
    // doubt's state-jump lands on).
    const stateCameras: Record<string, [number, number, number]> = {};
    const f3dStates = concept.field_3d_config?.states ?? {};
    for (const id of stateIds) {
        const cp = f3dStates[id]?.camera_position;
        if (Array.isArray(cp) && cp.length === 3 && cp.every((n) => typeof n === "number")) {
            stateCameras[id] = [cp[0], cp[1], cp[2]];
        }
    }

    const grounding: ConceptGrounding = {
        stableSystem,
        stateIds,
        fallbackAnswer:
            bundle?.fallback?.answer_text ??
            "That's a good question — let me bring up the key picture so we can look at it together.",
        fallbackState: bundle?.fallback?.default_jump_to_state ?? stateIds[0] ?? "STATE_1",
        clusters: bundle?.clusters ?? [],
        moves,
        readoutNames,
        readoutFormulas,
        variableDefaults,
        stateCameras,
        gatedStates,
    };
    groundingCache.set(conceptId, grounding);
    return grounding;
}

/** The "# Output" instruction, appended per-call (NOT part of the cached body) so
 *  the streaming path can ask for NDJSON (one beat per line) while the legacy path
 *  keeps the single JSON object — without two divergent cached prompts. */
function buildOutputSection(mode: "json" | "ndjson"): string {
    if (mode === "ndjson") {
        return [
            `# Output`,
            `Emit your answer as NDJSON: each beat on its OWN line as a compact JSON object {"say": string, "ops": [op, ...]}. One beat per line. Do NOT wrap the beats in an array, no markdown or code fences, and NEVER put a raw newline inside a beat (the whole object stays on a single line).`,
            `Each op is a JSON object in EXACTLY this shape — copy these forms precisely: {"op":"set_state","state":"STATE_2"}, {"op":"set_param","param":"theta_deg","value":45}, {"op":"sweep_param","param":"theta_deg","to":0,"duration_ms":2500}, {"op":"set_glow","target":"f"}, {"op":"dim_except","targets":["f"]}, {"op":"announce","readout":"F_magnitude"}, {"op":"set_camera","view":"face_on"}, {"op":"pause"}, {"op":"resume"}, {"op":"set_speed","rate":0.4}.`,
            `CRUCIAL: always include the ops that make what you SAY actually happen on screen. If a beat says "I tilt the angle to 45", that beat's ops MUST contain {"op":"set_param","param":"theta_deg","value":45}. Put set_state first when you change state, then the set_param / glow / camera ops. A beat that narrates a change but has empty ops is wrong.`,
            `Example beat: {"say":"Watch the circle open into a helix as I lower the angle.","ops":[{"op":"set_state","state":"STATE_2"},{"op":"set_param","param":"theta_deg","value":30}]}`,
            `Make the FIRST beat a short opening line so it speaks fast. A doubt is a thorough mini-lesson — usually 5-8 beats, each adding one step (never a single terse beat); a "show me / explain this state" or manipulation request is 4-8 beats.`,
        ].join("\n");
    }
    return [
        `# Output`,
        `Respond ONLY as JSON: {"beats":[{"say": string, "ops":[operation,...]}, ...]}. Each beat = one short spoken line plus the operations that should fire AS it begins (put set_state first when changing state). A doubt is a thorough step-by-step mini-lesson — usually 5-8 beats, each adding one step (never a single terse beat); a full walkthrough is 1-2 beats per state.`,
    ].join("\n");
}

/** True if the concept has a loadable grounding — used by the route for a clean 404. */
export function conceptExists(conceptId: string): boolean {
    return buildGrounding(conceptId) !== null;
}

/** Validated reviewed moves for the client (offline F2 demo + the moves menu).
 *  Same validation the voice path uses — single source of truth. */
export function getConceptMoves(conceptId: string): Array<{ move_id: string; label: string; beats: Beat[] }> {
    const g = buildGrounding(conceptId);
    if (!g) return [];
    return g.moves.map((m) => ({ move_id: m.moveId, label: m.label, beats: m.beats }));
}

/** Pull a JSON object out of the model's text (handles fences/prose wrappers). */
function extractJsonObject(text: string): unknown | null {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) return null;
    try {
        return JSON.parse(text.slice(first, last + 1));
    } catch {
        return null;
    }
}

// ── Stage 1: resolve a doubt to a target (state / params / reviewed cluster) ──
// Cheap and Rule-18-safe: it only SELECTS among authored states/clusters/knobs,
// never authors physics. Steps 1-2 are pure regex (0 ms); step 3 is one Haiku
// call against the LOCAL bundle (no DB, and NO sessionId → it can never write
// the sacred student_confusion_log).
export interface ResolvedTurn {
    targetState: string | null;
    explicitState: boolean;   // student NAMED a state ("state 8") — a HARD signal; never override it with the canned fast-path
    wantsManipulation: boolean;
    params: ParamName[];
    cluster: BundleCluster | null;
    move: ValidatedMove | null;   // matched a reviewed named gesture → serve it verbatim
    slowMode: boolean;   // student asked to slow down / signalled confusion
    escalate: boolean;   // student has effectively asked this BEFORE → teach the slowest, most careful way
}

// The standardized "Explain full concept" walkthrough — a founder-reviewed move in the
// concept's voice_professor bundle. intent=explain_whole performs it VERBATIM (deterministic,
// $0, identical for every student) instead of generating the lesson live. Missing move → null
// (the caller falls through to the generative path as a graceful fallback).
const LESSON_MOVE_ID = "full_lesson_walkthrough";

function resolveLesson(grounding: ConceptGrounding): ResolvedTurn | null {
    const lesson = grounding.moves.find((m) => m.moveId === LESSON_MOVE_ID);
    if (!lesson) return null;
    return { targetState: null, explicitState: false, wantsManipulation: false, params: [], cluster: null, move: lesson, slowMode: false, escalate: false };
}

const WORD_NUM: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};
const MANIP_VERB_RE = /\b(change|control|adjust|turn|increase|decrease|raise|lower|crank|vary|tweak|set|modify|drag|slide|move|flip|reverse|play with|mess with|make it)\b/i;
const KNOB_RE: Array<{ re: RegExp; param: ParamName }> = [
    { re: /\b(angle|theta|θ|tilt|degrees?)\b/i, param: "theta_deg" },
    { re: /\b(speed|velocity|faster|slower|slow it|fast)\b/i, param: "v" },
    { re: /\b(field|tesla|\bb\b)\b/i, param: "B" },
    { re: /\b(charge|sign|positive|negative|proton|electron|polarity)\b/i, param: "q_sign" },
];
// A drag/play request with no SPECIFIC knob (e.g. "drag the fields / sliders",
// "play with the controls", "the interactive playground") still wants
// manipulation → default to all knobs. "fields" (plural) lands here, not on B.
const GENERIC_PARAM_RE = /\b(parameters?|knobs?|sliders?|values?|settings?|controls?|fields?|interactive|playground|everything)\b/i;
// "Slow down / I don't follow" — triggers deliberate paused slow-motion teaching.
const SLOW_RE = /\b(slow(er| down| it down)?|too fast|step.?by.?step|don'?t (get|understand|follow)|did ?n'?t (get|understand|follow)|not (getting|understanding|following)|confus(ed|ing)?|i'?m lost|unclear|not clear|simpler|more slowly|explain (it )?(again|more|slowly)|once more|one more time|come again)\b/i;
// Explicit "asked before / still don't get it" markers → escalation.
const AGAIN_RE = /\b(again|still|already (asked|said|told)|same (question|thing|doubt)|repeat|one more time|second time|like i said)\b/i;
// "show me / walk me through / play the … demo" → a reviewed MOVE request.
const MOVE_RE = /\b(show me|walk me through|demo|demonstrate|play|run|take me through)\b/i;
const STOPWORDS = new Set([
    "what", "why", "how", "does", "the", "this", "that", "with", "when", "your", "you", "is", "are",
    "it", "an", "of", "to", "in", "on", "do", "me", "my", "we", "and", "or", "so", "for", "can",
    "could", "would", "please", "explain", "tell", "show", "again", "about", "here", "there", "they",
]);
function sigWords(s: string): string[] {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

function resolveStateReference(text: string, validStateIds: Set<string>): string | null {
    const m = /\bstate\s*(?:#|number\s*|no\.?\s*)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/i.exec(text);
    if (!m) return null;
    const tok = m[1].toLowerCase();
    const n = /^\d+$/.test(tok) ? parseInt(tok, 10) : WORD_NUM[tok];
    if (!n) return null;
    const id = `STATE_${n}`;
    return validStateIds.has(id) ? id : null;
}

async function resolveTurn(
    input: ProfessorInput,
    grounding: ConceptGrounding,
    validStateIds: Set<string>,
): Promise<ResolvedTurn> {
    const text = (input.transcript ?? "").trim();
    const resolved: ResolvedTurn = { targetState: null, explicitState: false, wantsManipulation: false, params: [], cluster: null, move: null, slowMode: false, escalate: false };
    if (!text) return resolved;

    // 0. Reviewed MOVE match — a named gesture ("show me the helix demo"). Matched
    //    by trigger substring, or keyword overlap when phrased as a demo request.
    //    Served verbatim (no model call) — takes priority over the generative path.
    if (grounding.moves.length) {
        const norm = text.toLowerCase();
        let best: ValidatedMove | null =
            grounding.moves.find((mv) => mv.triggerExamples.some((t) => t && norm.includes(t.toLowerCase()))) ?? null;
        if (!best && MOVE_RE.test(text)) {
            const cur = new Set(sigWords(text));
            let bestScore = 0;
            for (const mv of grounding.moves) {
                const score = sigWords([mv.label, ...mv.triggerExamples].join(" ")).filter((w) => cur.has(w)).length;
                if (score > bestScore) { bestScore = score; best = mv; }
            }
            if (bestScore < 1) best = null;
        }
        resolved.move = best;
    }

    // 1. Explicit state reference ("state seven" / "state 7") — a hard signal.
    resolved.targetState = resolveStateReference(text, validStateIds);
    resolved.explicitState = resolved.targetState !== null;

    // 2. Manipulation intent + which knobs.
    if (MANIP_VERB_RE.test(text)) {
        const params: ParamName[] = [];
        for (const { re, param } of KNOB_RE) {
            if (re.test(text) && params.indexOf(param) < 0) params.push(param);
        }
        if (params.length === 0 && GENERIC_PARAM_RE.test(text)) {
            for (const p of PARAM_NAMES) params.push(p);
        }
        if (params.length > 0) {
            resolved.wantsManipulation = true;
            resolved.params = params;
        }
    }

    // 3. Semantic cluster match against the LOCAL bundle (no DB, no sessionId).
    //    Skip the Haiku call when we already have an explicit target AND a
    //    manipulation intent — that always goes generative, so a cluster match
    //    would be unused (saves a round-trip on the live hero question).
    if (grounding.clusters.length > 0 && !resolved.explicitState && !(resolved.targetState && resolved.wantsManipulation)) {
        const rows: ClusterRow[] = grounding.clusters
            .filter((c) => c.cluster_id)
            .map((c) => ({
                cluster_id: c.cluster_id as string,
                label: c.label ?? "",
                description: c.description ?? null,
                trigger_examples: c.trigger_examples ?? null,
            }));
        try {
            const res = await classifyConfusion({
                confusionText: text,
                conceptId: input.conceptId,
                clusters: rows,
                actor: input.actor,
            });
            if (res.clusterId) {
                resolved.cluster = grounding.clusters.find((c) => c.cluster_id === res.clusterId) ?? null;
                if (resolved.cluster?.jump_to_state && !resolved.targetState) {
                    resolved.targetState = resolved.cluster.jump_to_state;
                }
            }
        } catch (err) {
            console.error("[voice_professor] resolve cluster match failed (non-fatal):", err);
        }
    }

    // 4. Pacing: explicit "slow down / I don't follow" intent.
    resolved.slowMode = SLOW_RE.test(text);

    // 5. Escalation — has the student effectively asked this BEFORE? Either explicit
    //    "again / still don't get it" phrasing, OR a prior STUDENT turn shares the
    //    topic (≥2 significant words with this question or with the matched cluster).
    //    A repeat is the serious case: force the slowest, most deliberate teaching.
    const priorStudent = (input.history ?? []).filter((h) => h.role === "student").map((h) => h.text);
    let repeat = AGAIN_RE.test(text) && priorStudent.length > 0;
    if (!repeat && priorStudent.length > 0) {
        const cur = new Set(sigWords(text));
        const clusterSet = new Set(
            resolved.cluster ? sigWords([resolved.cluster.label ?? "", ...(resolved.cluster.trigger_examples ?? [])].join(" ")) : [],
        );
        for (const pt of priorStudent) {
            const pw = sigWords(pt);
            const sharedCur = pw.filter((w) => cur.has(w)).length;
            const sharedCluster = pw.filter((w) => clusterSet.has(w)).length;
            if (sharedCur >= 2 || sharedCluster >= 2) { repeat = true; break; }
        }
    }
    resolved.escalate = repeat;
    if (repeat) resolved.slowMode = true;

    return resolved;
}

function buildUserTurn(input: ProfessorInput, resolved?: ResolvedTurn): string {
    if (input.intent === "doubt") {
        const q = (input.transcript ?? "").trim();
        const parts: string[] = [];
        // EVERY fresh doubt is taught as a careful mini-lesson FROM THE FIRST ASK — not a
        // quick one-liner, and not only when the student asks twice or says "slow down".
        parts.push("Teach this as a THOROUGH, step-by-step mini-lesson, starting right now on the very first ask — never a one-line answer. Assume it is the student's FIRST time hearing it: do not just state the conclusion — build the idea up from what they can see, one piece at a time, and explain the WHY. Go to the most relevant state, PAUSE the motion to hold the key moment, highlight the relevant element(s) with set_glow (the camera frames them on screen for you automatically), and SHOW it rather than only saying it — turn a knob with set_param or sweep_param when watching it move makes the idea click. Use MANY short, measured beats (aim for five to eight, each adding one step) at an unhurried pace; resume the motion at the end. Be concrete and complete — err on the side of explaining too much, not too little. Apply the 80/20 rule and THE COMPARISON MOVE from the system prompt: for every spatial relationship you mention (parallel, perpendicular, points to the centre, stronger), dim_except the two elements you are relating, frame them so the relationship is actually visible, pause, and only THEN state the conclusion — make the SCREEN prove each point, not just your words. Keep spoken analogies to at most one for the whole answer; let the picture carry the rest.");
        if (resolved) {
            if (resolved.targetState) parts.push(`This question is about ${resolved.targetState} — go there with set_state first.`);
            if (resolved.wantsManipulation) {
                const knobs = resolved.params.length ? resolved.params.join(", ") : "the relevant knobs";
                parts.push(`The student wants to CHANGE parameters (${knobs}). After set_state, turn them with set_param/sweep_param while you narrate what visibly changes — let the simulation show the result, do not recite numbers.`);
            }
            if (resolved.escalate) {
                parts.push("CRITICAL — the student has effectively asked this before and STILL does not understand. Put in MAXIMUM effort: do not just repeat the earlier explanation — re-teach from a DIFFERENT angle, in the simplest everyday words, with a concrete real-world analogy. Go slower still (set_speed 0.3-0.4), pause at the single key instant, and break it into even more, smaller steps until it lands.");
            } else if (resolved.slowMode) {
                parts.push("The student wants this slower. Slow right down: set_speed 0.4-0.6, pause at the important instant to explain it, and use shorter, simpler beats.");
            }
            // When a verified answer to this exact doubt exists, keep the physics faithful
            // to it — but TEACH it (with the manipulation above), don't just read it out.
            if (resolved.cluster?.answer_text) {
                parts.push(`A founder-verified answer to this exact doubt exists — keep your physics faithful to it while you teach it your careful way: "${resolved.cluster.answer_text}"`);
            }
        }
        const hint = parts.length ? " " + parts.join(" ") : "";
        return `The student asks: "${q}". Answer this doubt as the professor — teach it, and drive the simulation to the most relevant state(s) with the operations.${hint}`;
    }
    return `Teach the whole concept now as a guided walkthrough: go through the states in order (foundation first), one or two beats per state, jumping with set_state and glowing/annotating the relevant elements as you explain each. Begin.`;
}

// ── Announce: compute a verified readout value so the client can SPEAK the exact
//    number (the renderer shows it too — both read the same computed_outputs
//    formula, so they agree). The model never fabricates the digits. ──
const READOUT_UNIT: Record<string, string> = {
    F_magnitude: "newtons",
    r_cyclotron: "metres",
    T_cyclotron: "seconds",
    omega_cyclotron: "radians per second",
};
const SI_PREFIXES: Array<[number, string]> = [
    [9, "giga"], [6, "mega"], [3, "kilo"], [0, ""], [-3, "milli"],
    [-6, "micro"], [-9, "nano"], [-12, "pico"], [-15, "femto"], [-18, "atto"],
];

/** Format an SI value for speech, e.g. 7.2e-22 N → "about 0.7 femtonewtons". */
function formatReadout(readout: string, value: number): string {
    if (!Number.isFinite(value)) return "";
    const unit = READOUT_UNIT[readout] ?? "";
    const abs = Math.abs(value);
    let chosen = SI_PREFIXES[SI_PREFIXES.length - 1];
    for (const p of SI_PREFIXES) { if (abs >= Math.pow(10, p[0])) { chosen = p; break; } }
    const mant = Math.round((value / Math.pow(10, chosen[0])) * 10) / 10;
    const prefixUnit = chosen[1]
        ? (unit.includes(" ") ? `${chosen[1]} ${unit}` : `${chosen[1]}${unit}`)
        : unit;
    return `About ${mant} ${prefixUnit}`.trim() + ".";
}

/** Evaluate a computed_outputs formula with the current knob values (PI injected). */
function computeReadoutValue(
    grounding: ConceptGrounding,
    readout: string,
    params: Record<string, number>,
): number | null {
    const formula = grounding.readoutFormulas[readout];
    if (!formula) return null;
    try {
        const r = evaluate(formula, { ...params, PI: Math.PI });
        return typeof r === "number" && Number.isFinite(r) ? r : null;
    } catch {
        return null;
    }
}

/** Thread the running knob state through a beat's ops (set_param / sweep_param). */
function applyOpsToParams(params: Record<string, number>, ops: Operation[]): void {
    for (const op of ops) {
        if (op.op === "set_param") params[op.param] = op.value;
        else if (op.op === "sweep_param") params[op.param] = op.to;
    }
}

/** If a beat carries an `announce` op, attach the verified value for the client
 *  to speak. Mutates `params` (so later beats see the knobs this beat turned). */
function attachReadout(beat: Beat, grounding: ConceptGrounding, params: Record<string, number>): Beat {
    applyOpsToParams(params, beat.ops);
    const ann = beat.ops.find((o) => o.op === "announce") as Extract<Operation, { op: "announce" }> | undefined;
    if (!ann) return beat;
    const val = computeReadoutValue(grounding, ann.readout, params);
    if (val === null) return beat;
    return { ...beat, readout_value: { readout: ann.readout, formatted: formatReadout(ann.readout, val) } };
}

// Camera framing on doubts is now handled by the renderer's auto-frame-on-glow
// (autoFrameEmphasis): when richClusterBeats / the generative path glow the focal
// object, the engine turns to show it. No separate framing pre-step is needed.

/**
 * Careful, taught delivery of a verified cluster answer — EVERY fresh doubt gets the
 * teaching treatment from the FIRST ask (not a terse one-liner). Jump to the relevant
 * state, highlight the focal element with set_glow (the renderer auto-frames the camera
 * onto it), PAUSE the motion to hold the key moment while explaining, then resume. The
 * spoken words are the founder-reviewed answer, paced across measured beats. $0,
 * deterministic, guaranteed-correct — just delivered as a mini-lesson.
 */
function richClusterBeats(c: BundleCluster, validStateIds: Set<string>): Beat[] {
    const focalRaw: unknown[] = [];
    if (c.jump_to_state) focalRaw.push({ op: "set_state", state: c.jump_to_state });
    if (c.glow != null) focalRaw.push({ op: "set_glow", target: c.glow });
    if (c.math_show) focalRaw.push({ op: "set_math", expression: c.math_show, persist: false });
    const focalOps: Operation[] = [];
    for (const o of focalRaw) { const { op } = validateOp(o, validStateIds); if (op) focalOps.push(op); }

    const answer = (c.answer_text ?? "").trim();
    const sentences = answer.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

    // A quick one-liner: a single beat — highlight + auto-frame, no need to freeze.
    if (sentences.length <= 1) {
        return [{ say: answer || "Good question — let me show you.", ops: focalOps }];
    }
    // A real explanation: freeze the picture (pause), explain the first point while it
    // holds, then resume with the rest — the "pause, explain, play" a student gets every
    // time, from the first ask.
    const pauseOp = validateOp({ op: "pause" }, validStateIds).op;
    const resumeOp = validateOp({ op: "resume" }, validStateIds).op;
    const firstOps = pauseOp ? focalOps.concat([pauseOp]) : focalOps;
    return [
        { say: sentences[0], ops: firstOps },
        { say: sentences.slice(1).join(" "), ops: resumeOp ? [resumeOp] : [] },
    ];
}

/** Per-turn allowed-state filter: a gated "aside" state (e.g. Fleming LEFT-hand) is
 *  blocked from generative set_state UNLESS the student explicitly asked for it — by
 *  naming it ("state four") or hitting its release_when keyword ("left hand" / "fleming").
 *  Shrinking the valid-state set makes operations.ts DROP a stray jump (and the
 *  structured-output enum exclude it), so the model cannot contradict a right-hand
 *  answer with the left-hand visual. */
function blockedGatedStates(g: ConceptGrounding, r: ResolvedTurn | null, transcript: string): Set<string> {
    const blocked = new Set<string>();
    for (const gs of g.gatedStates) {
        const named = !!r?.explicitState && r?.targetState === gs.state;
        const keyword = gs.releaseRe ? gs.releaseRe.test(transcript) : false;
        if (!named && !keyword) blocked.add(gs.state);
    }
    return blocked;
}

export async function runProfessorTurn(input: ProfessorInput): Promise<ProfessorResult> {
    const startTime = Date.now();
    const grounding = buildGrounding(input.conceptId);
    if (!grounding) throw new ConceptNotFoundError(input.conceptId);

    const validStateIds = new Set(grounding.stateIds);

    // Stage 1 — resolve the doubt to a target state / knobs / reviewed cluster / move.
    // explain_whole resolves to the reviewed full-lesson move so the move fast-path
    // serves it verbatim (deterministic) instead of generating the lesson live.
    const resolved = input.intent === "doubt"
        ? await resolveTurn(input, grounding, validStateIds)
        : input.intent === "explain_whole"
            ? resolveLesson(grounding)
            : null;

    // Move fast-path — a reviewed named gesture, served verbatim (zero model call).
    if (resolved?.move) {
        const params = { ...grounding.variableDefaults };
        const beats = resolved.move.beats.map((b) => attachReadout(b, grounding, params));
        logUsage({
            sessionId: input.sessionId,
            taskType: "voice_professor_move",
            provider: "none",
            model: "reviewed_move",
            inputChars: (input.transcript ?? "").length,
            outputChars: beats.reduce((n, b) => n + b.say.length, 0),
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: 0,
            wasCacheHit: true,
            actor: input.actor,
            metadata: { conceptId: input.conceptId, moveId: resolved.move.moveId, intent: input.intent },
        });
        return { beats, stateIds: grounding.stateIds, droppedOps: 0, fallbackUsed: false };
    }

    // NOTE: doubts are TAUGHT generatively (deep, multi-beat, manipulative), grounded in the
    // verified cluster answer when one matched (passed into buildUserTurn). The verified
    // answer is NOT served verbatim — it is intentionally brief and too thin for a real
    // first-time explanation; it anchors the physics and is the graceful fallback below.

    const viewHint = describeViewAxis(input.currentViewAxis ?? null);
    const volatile = `Current state on screen: ${input.currentState && validStateIds.has(input.currentState) ? input.currentState : grounding.stateIds[0]}.${viewHint ? ` The student is currently viewing it ${viewHint}. If what you are about to explain would be hard to see from there, set_camera to a clearer view first.` : ""}`;

    // Per-turn gating: block aside states the student did not explicitly ask for, so a
    // stray generative jump (e.g. to the Fleming LEFT-hand state on a right-hand question)
    // is dropped and the schema enum excludes it. Full validStateIds stays in force for the
    // current-state hint, the fallback, and load-time move validation.
    const blocked = blockedGatedStates(grounding, resolved ?? null, input.transcript ?? "");
    const turnStateIds = grounding.stateIds.filter((id) => !blocked.has(id));
    const turnValidStateIds = new Set(turnStateIds);
    if (resolved && resolved.targetState && blocked.has(resolved.targetState)) resolved.targetState = null;

    const system: Anthropic.TextBlockParam[] = [
        { type: "text", text: grounding.stableSystem, cache_control: { type: "ephemeral" } },
        { type: "text", text: volatile },
        { type: "text", text: buildOutputSection("json") },
    ];

    // Build alternating message history; ensure it starts with a user turn.
    const messages: Anthropic.MessageParam[] = [];
    for (const turn of (input.history ?? []).slice(-8)) {
        const text = turn.text?.trim();
        if (!text) continue;
        messages.push({ role: turn.role === "professor" ? "assistant" : "user", content: text });
    }
    while (messages.length && messages[0].role === "assistant") messages.shift();
    messages.push({ role: "user", content: buildUserTurn(input, resolved ?? undefined) });

    const schema = buildBeatsSchema(turnStateIds, grounding.readoutNames);

    let rawText = "";
    let usage: Anthropic.Usage | undefined;
    try {
        const message = await anthropic.messages.create({
            model: SONNET_MODEL,
            // Walkthroughs are long (≈1-2 beats × 8 states); doubts are short.
            // Thinking is omitted (latency-first) — the task is structured generation
            // grounded in provided facts; re-add thinking if physics quality dips.
            max_tokens: input.intent === "doubt"
                ? (resolved?.escalate ? 3500 : 2800)
                : 4000,
            // EVERY doubt gets full teaching effort from the first ask (careful, multi-beat,
            // manipulative) — not just repeats. An escalation gets the largest budget for an
            // even more deliberate re-teach. The walkthrough stays latency-first.
            output_config: {
                effort: input.intent === "doubt" ? "high" : "low",
                format: { type: "json_schema", schema },
            },
            system,
            messages,
        });
        usage = message.usage;
        for (const block of message.content) {
            if (block.type === "text") {
                rawText = block.text;
                break;
            }
        }
    } catch (err) {
        console.error("[voice_professor] Sonnet call failed:", err);
        rawText = "";
    }

    // Parse (structured output gives clean JSON; extractJsonObject is the safety net).
    let parsed: unknown = null;
    if (rawText) {
        try {
            parsed = JSON.parse(rawText);
        } catch {
            parsed = extractJsonObject(rawText);
        }
    }

    const { beats, droppedOps } = validateBeats(parsed, turnValidStateIds, new Set(grounding.readoutNames));
    const params = { ...grounding.variableDefaults };
    const beatsWithReadouts = beats.map((b) => attachReadout(b, grounding, params));

    let finalBeats = beatsWithReadouts;
    let fallbackUsed = false;
    if (finalBeats.length === 0) {
        // Never fabricate physics. Prefer the verified cluster answer (taught carefully) if
        // this doubt matched one; otherwise the generic graceful fallback.
        fallbackUsed = true;
        if (resolved?.cluster?.answer_text) {
            finalBeats = richClusterBeats(resolved.cluster, validStateIds);
        } else {
            const jump =
                input.currentState && validStateIds.has(input.currentState)
                    ? input.currentState
                    : grounding.fallbackState;
            finalBeats = [{ say: grounding.fallbackAnswer, ops: [{ op: "set_state", state: jump }] }];
        }
    }

    // Usage logging (cost from token usage). No sessionId is forwarded into any
    // path that writes the sacred student_confusion_log — this is a synthetic demo.
    const inTok = usage?.input_tokens ?? 0;
    const outTok = usage?.output_tokens ?? 0;
    const cacheRead = usage?.cache_read_input_tokens ?? 0;
    const cacheWrite = usage?.cache_creation_input_tokens ?? 0;
    const estimatedCostUsd =
        (inTok / 1e6) * IN_USD_PER_MTOK +
        (outTok / 1e6) * OUT_USD_PER_MTOK +
        (cacheRead / 1e6) * CACHE_READ_USD_PER_MTOK +
        (cacheWrite / 1e6) * CACHE_WRITE_USD_PER_MTOK;

    logUsage({
        sessionId: input.sessionId,
        taskType: "voice_professor_generative",
        provider: "anthropic",
        model: SONNET_MODEL,
        inputChars: grounding.stableSystem.length + volatile.length,
        outputChars: rawText.length,
        latencyMs: Date.now() - startTime,
        estimatedCostUsd,
        wasCacheHit: cacheRead > 0,
        actor: input.actor,
        metadata: {
            conceptId: input.conceptId,
            intent: input.intent,
            beatCount: finalBeats.length,
            droppedOps,
            fallbackUsed,
            currentState: input.currentState ?? null,
        },
    });

    return { beats: finalBeats, stateIds: grounding.stateIds, droppedOps, fallbackUsed };
}

/**
 * Streaming variant: emits each beat via `onBeat` the instant it is parsed from
 * the model's NDJSON output, so the client can speak beat 1 while beats 2..N are
 * still being generated. Same resolve + fast-path + grounding as runProfessorTurn;
 * only the delivery (incremental) and the output format (NDJSON, not one JSON
 * object) differ. Returns the tail metadata the route needs for its `done` event.
 */
export async function runProfessorTurnStream(
    input: ProfessorInput,
    onBeat: (beat: Beat) => void,
): Promise<{ stateIds: string[]; droppedOps: number; fallbackUsed: boolean }> {
    const startTime = Date.now();
    const grounding = buildGrounding(input.conceptId);
    if (!grounding) throw new ConceptNotFoundError(input.conceptId);

    const validStateIds = new Set(grounding.stateIds);
    // explain_whole resolves to the reviewed full-lesson move so the move fast-path
    // streams it verbatim (deterministic) instead of generating the lesson live.
    const resolved = input.intent === "doubt"
        ? await resolveTurn(input, grounding, validStateIds)
        : input.intent === "explain_whole"
            ? resolveLesson(grounding)
            : null;

    // Move fast-path — a reviewed named gesture, streamed verbatim (zero model call).
    if (resolved?.move) {
        const mParams = { ...grounding.variableDefaults };
        for (const b of resolved.move.beats) {
            try { onBeat(attachReadout(b, grounding, mParams)); } catch { /* client gone */ }
        }
        logUsage({
            sessionId: input.sessionId,
            taskType: "voice_professor_move",
            provider: "none",
            model: "reviewed_move",
            inputChars: (input.transcript ?? "").length,
            outputChars: resolved.move.beats.reduce((n, b) => n + b.say.length, 0),
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: 0,
            wasCacheHit: true,
            actor: input.actor,
            metadata: { conceptId: input.conceptId, moveId: resolved.move.moveId, intent: input.intent, streamed: true },
        });
        return { stateIds: grounding.stateIds, droppedOps: 0, fallbackUsed: false };
    }

    // NOTE: doubts are TAUGHT generatively (deep, multi-beat, manipulative), grounded in
    // the verified cluster answer when one matched (passed into buildUserTurn). The verified
    // answer is NOT served verbatim — it is intentionally brief (one-liner correctness) and
    // too thin for a real first-time explanation. It anchors the physics and is the graceful
    // fallback if generation yields nothing (below).

    const viewHint = describeViewAxis(input.currentViewAxis ?? null);
    const volatile = `Current state on screen: ${input.currentState && validStateIds.has(input.currentState) ? input.currentState : grounding.stateIds[0]}.${viewHint ? ` The student is currently viewing it ${viewHint}. If what you are about to explain would be hard to see from there, set_camera to a clearer view first.` : ""}`;
    // Per-turn gating (see runProfessorTurn): block aside states not explicitly asked for,
    // so a stray generative jump (e.g. the Fleming LEFT-hand state on a right-hand question)
    // is dropped by validateBeats below. Full validStateIds stays in force for the
    // current-state hint and the fallback.
    const blocked = blockedGatedStates(grounding, resolved ?? null, input.transcript ?? "");
    const turnValidStateIds = new Set(grounding.stateIds.filter((id) => !blocked.has(id)));
    if (resolved && resolved.targetState && blocked.has(resolved.targetState)) resolved.targetState = null;
    const system: Anthropic.TextBlockParam[] = [
        { type: "text", text: grounding.stableSystem, cache_control: { type: "ephemeral" } },
        { type: "text", text: volatile },
        { type: "text", text: buildOutputSection("ndjson") },
    ];

    const messages: Anthropic.MessageParam[] = [];
    for (const turn of (input.history ?? []).slice(-8)) {
        const text = turn.text?.trim();
        if (!text) continue;
        messages.push({ role: turn.role === "professor" ? "assistant" : "user", content: text });
    }
    while (messages.length && messages[0].role === "assistant") messages.shift();
    messages.push({ role: "user", content: buildUserTurn(input, resolved ?? undefined) });

    // EVERY doubt gets full teaching effort from the first ask (careful, multi-beat,
    // manipulative); an escalation gets the largest budget for an even deeper re-teach.
    const maxTokens = input.intent === "doubt"
        ? (resolved?.escalate ? 3500 : 2800)
        : 4000;
    const effort: "low" | "medium" | "high" =
        input.intent === "doubt" ? "high" : "low";

    // ── Incremental NDJSON parse: emit a beat the moment its line completes. ──
    let buffer = "";
    let droppedOps = 0;
    let emitted = 0;
    let outputChars = 0;
    const readoutSet = new Set(grounding.readoutNames);
    const streamParams = { ...grounding.variableDefaults };   // running knob state for announce-compute

    const consumeLine = (line: string): void => {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "```" || /^```(?:json)?$/i.test(trimmed)) return;
        const cleaned = trimmed.replace(/^[-*]\s+/, "");
        let parsed: unknown;
        try { parsed = JSON.parse(cleaned); } catch { return; }   // incomplete / not-JSON line → skip
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
        if (typeof (parsed as { say?: unknown }).say !== "string") return;
        const { beats, droppedOps: d } = validateBeats({ beats: [parsed] }, turnValidStateIds, readoutSet);
        droppedOps += d;
        if (beats.length === 0) return;
        emitted += 1;
        try { onBeat(attachReadout(beats[0], grounding, streamParams)); } catch { /* client gone — keep draining the model */ }
    };

    let usage: Anthropic.Usage | undefined;
    const runStream = async (withEffort: boolean): Promise<void> => {
        buffer = "";
        const base = { model: SONNET_MODEL, max_tokens: maxTokens, system, messages };
        const stream = withEffort
            ? anthropic.messages.stream({ ...base, output_config: { effort } })
            : anthropic.messages.stream(base);
        stream.on("text", (delta: string) => {
            outputChars += delta.length;
            buffer += delta;
            let nl: number;
            while ((nl = buffer.indexOf("\n")) >= 0) {
                const lineStr = buffer.slice(0, nl);
                buffer = buffer.slice(nl + 1);
                consumeLine(lineStr);
            }
        });
        const finalMsg = await stream.finalMessage();
        usage = finalMsg.usage;
        if (buffer.trim()) consumeLine(buffer);   // flush the final (newline-less) beat
        buffer = "";
    };

    try {
        await runStream(true);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // If the API rejects `effort` on a streaming call AND nothing streamed yet,
        // retry once without output_config (max_tokens + the NDJSON prompt still work).
        if (emitted === 0 && /output_config|effort/i.test(msg)) {
            console.warn("[voice_professor] stream effort rejected, retrying without output_config:", msg);
            try { await runStream(false); } catch (err2) {
                console.error("[voice_professor] stream retry failed:", err2);
            }
        } else {
            console.error("[voice_professor] stream failed:", err);
        }
    }

    let fallbackUsed = false;
    if (emitted === 0) {
        fallbackUsed = true;
        // Prefer the verified cluster answer (taught carefully) if this doubt matched one;
        // otherwise the generic graceful fallback. Never fabricate physics.
        if (resolved?.cluster?.answer_text) {
            try { for (const b of richClusterBeats(resolved.cluster, validStateIds)) onBeat(b); } catch { /* client gone */ }
        } else {
            const jump =
                input.currentState && validStateIds.has(input.currentState)
                    ? input.currentState
                    : grounding.fallbackState;
            try { onBeat({ say: grounding.fallbackAnswer, ops: [{ op: "set_state", state: jump }] }); } catch { /* client gone */ }
        }
    }

    const inTok = usage?.input_tokens ?? 0;
    const outTok = usage?.output_tokens ?? 0;
    const cacheRead = usage?.cache_read_input_tokens ?? 0;
    const cacheWrite = usage?.cache_creation_input_tokens ?? 0;
    const estimatedCostUsd =
        (inTok / 1e6) * IN_USD_PER_MTOK +
        (outTok / 1e6) * OUT_USD_PER_MTOK +
        (cacheRead / 1e6) * CACHE_READ_USD_PER_MTOK +
        (cacheWrite / 1e6) * CACHE_WRITE_USD_PER_MTOK;

    logUsage({
        sessionId: input.sessionId,
        taskType: "voice_professor_generative",
        provider: "anthropic",
        model: SONNET_MODEL,
        inputChars: grounding.stableSystem.length + volatile.length,
        outputChars,
        latencyMs: Date.now() - startTime,
        estimatedCostUsd,
        wasCacheHit: cacheRead > 0,
        actor: input.actor,
        metadata: {
            conceptId: input.conceptId,
            intent: input.intent,
            beatCount: emitted || 1,
            droppedOps,
            fallbackUsed,
            currentState: input.currentState ?? null,
            streamed: true,
        },
    });

    return { stateIds: grounding.stateIds, droppedOps, fallbackUsed };
}
