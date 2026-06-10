/**
 * Visual Validator — vision-model prompt templates (Engine E29, Day 2).
 *
 * Encodes the 36 vision-validated checks from spec.ts into 7 category prompts.
 * F1 and F4 are DOM-validated (Playwright postMessage timing) and have no prompt here.
 *
 * Architecture:
 *   - Each category has a large, stable SYSTEM prompt (cacheable via cache_control:
 *     ephemeral on the first content block in visionGate.ts).
 *   - User prompts are small, varying — per-state context + image references.
 *   - Vision returns strict JSON matching the per-category Zod schema.
 *   - parseCategoryResponse maps validated JSON → CheckResult[].
 *
 * Design decisions (locked Day 1):
 *   - E1 returns 3-point (yes / partially / no); only "no" fails. Avoids noisy
 *     retries on borderline subjective calls.
 *   - F1 and F4 are NOT in this file — they're DOM checks in screenshotter.ts.
 *   - Every failure must include pixel-coordinate or value-level evidence so
 *     retries get actionable feedback.
 */

import { z } from 'zod';
import type {
    BugClass,
    CheckResult,
    VisualCategory,
    VisualCheckId,
} from './spec';
import { VISUAL_CHECKS } from './spec';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ScreenshotRef {
    /** Human label shown to the model, e.g., "STATE_1" or "panel_b at t=2.5s" */
    label: string;
    /** Base64-encoded PNG (no data: prefix) */
    pngB64: string;
}

export interface PromptInput {
    category: VisualCategory;
    conceptId: string;
    /**
     * Scope identifier — what the result rows pin to:
     *   - 'STATE_N'      for A, B, G, F-vision (per-state)
     *   - 'PAIR_N→N+1'   for C (per consecutive pair)
     *   - 'TIMESERIES'   for D (single time-series slice)
     *   - 'STORYBOARD'   for E (full sim)
     */
    scope: string;
    /** Ordered screenshots — referenced by label inside the user prompt */
    screenshots: ScreenshotRef[];
    /** Category-specific context shown to the model (physics config, scripts, etc.) */
    context?: Record<string, unknown>;
    /** When false, E4 is omitted from the prompt and from the expected schema */
    hasEpicC?: boolean;
    /** When false, D3 is omitted from the prompt and from the expected schema */
    hasTimingMetadata?: boolean;
}

export interface PromptOutput {
    /** Stable system prompt — cache this with cache_control: ephemeral. */
    systemPrompt: string;
    /** Per-call user text. Image content blocks are appended in visionGate.ts. */
    userText: string;
    /** Ordered image base64 strings — visionGate.ts wraps each as an image block. */
    images: string[];
    /** The check IDs this prompt is responsible for resolving. */
    expectedChecks: VisualCheckId[];
}

// ─── Shared instructions reused across category prompts ───────────────────────

const SHARED_OUTPUT_RULES = `
OUTPUT RULES (apply to every response):
1. Return ONLY a single JSON object. No prose, no markdown fences, no preamble.
2. For every check, include "passed" (boolean) and "evidence" (string).
3. On failure (passed=false), evidence MUST cite specific visual details:
   - For layout/physics: pixel coordinates or bounding-box ranges, e.g., "label F=10N at (340-380, 180-210) intersects mg at (345-375, 180-210)".
   - For timing/animation: actual seconds observed vs declared.
   - For pedagogy: what concept was unclear and why a Class 11 student would miss it.
4. Vague failure evidence ("looks bad", "seems off", "not great") is forbidden — return passed=true if you cannot cite specifics.
5. If the screenshot is unreadable or missing, return passed=true with evidence="screenshot unavailable" — do NOT guess failures.
6. The response MUST start with "{" and end with "}". Output nothing after the closing brace — no notes, no summary.
7. evidence is a JSON string: escape every backslash as \\\\ and every inner double-quote as \\". Prefer plain text — write formulas WITHOUT LaTeX (e.g. "F = qvB sin(theta)", not "F = qvB \\sin\\theta") to avoid escape errors.
`.trim();

const PASS_ON_DOUBT = `When evidence is borderline or unclear, return passed=true. The validator's bias is "ship if not clearly broken" — not "ship only if clearly perfect".`;

function checkLine(id: VisualCheckId): string {
    const c = VISUAL_CHECKS[id];
    return `- ${id} (${c.name}): ${c.passCriterion}`;
}

// ─── Category A — Layout integrity ────────────────────────────────────────────

const SYSTEM_A = `You are a careful UX layout reviewer for physics teaching simulations.
Your job: inspect ONE screenshot of a physics simulation state and check 6 layout rules.

THE CHECKS:
${checkLine('A1')}
${checkLine('A2')}
${checkLine('A3')}
${checkLine('A4')}
${checkLine('A5')}
${checkLine('A6')}

${SHARED_OUTPUT_RULES}

JSON SCHEMA:
{
  "A1": { "passed": boolean, "evidence": string },
  "A2": { "passed": boolean, "evidence": string },
  "A3": { "passed": boolean, "evidence": string },
  "A4": { "passed": boolean, "evidence": string },
  "A5": { "passed": boolean, "evidence": string },
  "A6": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

function buildLayoutPrompt(input: PromptInput): PromptOutput {
    const userText = `Concept: ${input.conceptId}
Scope: ${input.scope}

The image below is the rendered simulation for ${input.scope}. Check all 6 layout rules and return JSON.`;
    return {
        systemPrompt: SYSTEM_A,
        userText,
        images: input.screenshots.map(s => s.pngB64),
        expectedChecks: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    };
}

// ─── Category B — Physics correctness ─────────────────────────────────────────

const SYSTEM_B = `You are a physics teacher (JEE/NEET caliber) inspecting whether a rendered simulation matches its declared physics.
Your job: cross-reference the physics_engine_config (provided as JSON in the user message) against what the screenshot actually shows.

THE CHECKS:
${checkLine('B1')}
${checkLine('B2')}
${checkLine('B3')}
${checkLine('B4')}
${checkLine('B5')}
${checkLine('B6')}
${checkLine('B7')}

ANGLE CONVENTION: 0°=right, 90°=up, 180°=left, 270°=down (screen coordinates, y-flipped).

${SHARED_OUTPUT_RULES}

JSON SCHEMA:
{
  "B1": { "passed": boolean, "evidence": string },
  "B2": { "passed": boolean, "evidence": string },
  "B3": { "passed": boolean, "evidence": string },
  "B4": { "passed": boolean, "evidence": string },
  "B5": { "passed": boolean, "evidence": string },
  "B6": { "passed": boolean, "evidence": string },
  "B7": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

function buildPhysicsPrompt(input: PromptInput): PromptOutput {
    const physicsJson = JSON.stringify(input.context?.physics_engine_config ?? {}, null, 2);
    const userText = `Concept: ${input.conceptId}
Scope: ${input.scope}

physics_engine_config (declared physics):
\`\`\`json
${physicsJson}
\`\`\`

The image below is the rendered simulation for ${input.scope}. Compare every force_arrow against the declared forces[] entries and return JSON.`;
    return {
        systemPrompt: SYSTEM_B,
        userText,
        images: input.screenshots.map(s => s.pngB64),
        expectedChecks: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'],
    };
}

// ─── Category C — Choreography correctness ────────────────────────────────────

const SYSTEM_C = `You are a continuity reviewer for physics teaching animations.
Your job: compare TWO consecutive state screenshots and check that bodies, scale, camera, focal element, and annotations evolve coherently.

THE CHECKS:
${checkLine('C1')}
${checkLine('C2')}
${checkLine('C3')}
${checkLine('C4')}
${checkLine('C5')}

${SHARED_OUTPUT_RULES}

JSON SCHEMA:
{
  "C1": { "passed": boolean, "evidence": string },
  "C2": { "passed": boolean, "evidence": string },
  "C3": { "passed": boolean, "evidence": string },
  "C4": { "passed": boolean, "evidence": string },
  "C5": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

function buildChoreographyPrompt(input: PromptInput): PromptOutput {
    const motionPaths = JSON.stringify(input.context?.motion_paths ?? [], null, 2);
    const focalIds = JSON.stringify(input.context?.focal_primitive_ids ?? {}, null, 2);
    const userText = `Concept: ${input.conceptId}
Scope: ${input.scope} (image 1 = earlier state, image 2 = later state)

Declared motion_paths between these states:
\`\`\`json
${motionPaths}
\`\`\`

Declared focal_primitive_id per state:
\`\`\`json
${focalIds}
\`\`\`

Compare the two images and return JSON.`;
    return {
        systemPrompt: SYSTEM_C,
        userText,
        images: input.screenshots.map(s => s.pngB64),
        expectedChecks: ['C1', 'C2', 'C3', 'C4', 'C5'],
    };
}

// ─── Category D — Animation correctness ───────────────────────────────────────

const SYSTEM_D_BASE = `You are an animation playback reviewer for physics teaching simulations.
Your job: inspect 5 keyframes captured at t=0s, 2.5s, 5s, 7.5s, 10s and verify the simulation actually animates without jitter or stuck frames.

THE CHECKS:
${checkLine('D1')}
${checkLine('D2')}`;

const SYSTEM_D_WITH_TIMING = `${SYSTEM_D_BASE}
${checkLine('D3')}
${checkLine('D4')}

${SHARED_OUTPUT_RULES}

JSON SCHEMA:
{
  "D1": { "passed": boolean, "evidence": string },
  "D2": { "passed": boolean, "evidence": string },
  "D3": { "passed": boolean, "evidence": string },
  "D4": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

const SYSTEM_D_WITHOUT_TIMING = `${SYSTEM_D_BASE}
${checkLine('D4')}

${SHARED_OUTPUT_RULES}

JSON SCHEMA (D3 is intentionally omitted because timing metadata was not authored):
{
  "D1": { "passed": boolean, "evidence": string },
  "D2": { "passed": boolean, "evidence": string },
  "D4": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

function buildAnimationPrompt(input: PromptInput): PromptOutput {
    const includeTiming = input.hasTimingMetadata === true;
    const teacherScript = JSON.stringify(input.context?.teacher_script ?? {}, null, 2);
    const userText = includeTiming
        ? `Concept: ${input.conceptId}
Scope: ${input.scope}

Teacher script (declares per-state narration duration_ms):
\`\`\`json
${teacherScript}
\`\`\`

The 5 images below are keyframes at t=0s, 2.5s, 5s, 7.5s, 10s in order. Check D1, D2, D3, D4.`
        : `Concept: ${input.conceptId}
Scope: ${input.scope}

The 5 images below are keyframes at t=0s, 2.5s, 5s, 7.5s, 10s in order. Check D1, D2, D4. (D3 is skipped — no timing metadata authored.)`;
    return {
        systemPrompt: includeTiming ? SYSTEM_D_WITH_TIMING : SYSTEM_D_WITHOUT_TIMING,
        userText,
        images: input.screenshots.map(s => s.pngB64),
        expectedChecks: includeTiming ? ['D1', 'D2', 'D3', 'D4'] : ['D1', 'D2', 'D4'],
    };
}

// ─── Category E — Pedagogical quality ─────────────────────────────────────────

const SYSTEM_E_BASE = `You are an experienced Class 11 physics teacher in India (CBSE/JEE/NEET context).
Your job: inspect the FULL storyboard (all states + teacher script) and judge whether a Class 11 student watching only this simulation, with no other resource, would actually learn the concept correctly.

THE CHECKS:
${checkLine('E1')}
${checkLine('E2')}
${checkLine('E3')}`;

const SYSTEM_E_BODY = `
${checkLine('E5')}
${checkLine('E6')}

E1 IS GRADED: return one of "yes" / "partially" / "no". Only "no" counts as failure (yes and partially both pass).

DELIVERY MODEL (read before judging E3 and E5) — this simulation is narrated. The default student experience has TTS sound ON. Content delivered through narration + its synced overlays IS delivered to the student, even though the silent static screenshots do not show it:
- E3 (Indian anchor): PASS when a substantive Indian-context anchor is DECLARED in the JSON metadata above (it is woven into the narration the student hears). Do NOT fail E3 merely because the anchor is not drawn as a sketch/label on the 3D canvas. Fail E3 ONLY if NO anchor is declared, or the declared anchor is generic/Western.
- E5 (formula on screen): a formula listed in "Formulas delivered via TTS-synced equation panel (math_show)" above renders in the equation panel while its sentence is spoken (Category I2 confirms this directly). Treat such a formula as PRESENT at the state where it is referenced. Do NOT fail E5 for a formula that is declared as math_show for that state. Fail E5 ONLY if a verbally-referenced formula is neither shown on canvas NOR declared as a math_show for any state.

${SHARED_OUTPUT_RULES}

INDIAN CONTEXT NOTE: real-world anchors are things like Mumbai local trains, Manali highway turns, Diwali fireworks, IIT-JEE exam scenarios, ISRO/BARC/cyclotron references. Generic Western examples (Boston subway, German autobahn) do NOT count as anchors.`;

const SYSTEM_E_WITH_EPICC = `${SYSTEM_E_BASE}
${checkLine('E4')}${SYSTEM_E_BODY}

JSON SCHEMA:
{
  "E1": { "answer": "yes" | "partially" | "no", "evidence": string },
  "E2": { "passed": boolean, "evidence": string },
  "E3": { "passed": boolean, "evidence": string },
  "E4": { "passed": boolean, "evidence": string },
  "E5": { "passed": boolean, "evidence": string },
  "E6": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

const SYSTEM_E_WITHOUT_EPICC = `${SYSTEM_E_BASE}${SYSTEM_E_BODY}

JSON SCHEMA (E4 is intentionally omitted because epic_c_branches was not authored):
{
  "E1": { "answer": "yes" | "partially" | "no", "evidence": string },
  "E2": { "passed": boolean, "evidence": string },
  "E3": { "passed": boolean, "evidence": string },
  "E5": { "passed": boolean, "evidence": string },
  "E6": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

/** Per-state list of declared math_show formulas, for the storyboard E5 carve-out. */
function summarizeTtsMathShown(bindings: unknown): string {
    if (!bindings || typeof bindings !== 'object') return '  (none declared)';
    const lines: string[] = [];
    for (const [stateId, ctx] of Object.entries(bindings as Record<string, unknown>)) {
        const list = (ctx as { bindings?: Array<{ math_show?: string }> })?.bindings ?? [];
        const formulas = list.map(b => b.math_show).filter((m): m is string => typeof m === 'string' && m.length > 0);
        if (formulas.length > 0) lines.push(`  ${stateId}: ${formulas.join('  |  ')}`);
    }
    return lines.length > 0 ? lines.join('\n') : '  (none declared)';
}

function buildPedagogyPrompt(input: PromptInput): PromptOutput {
    const includeEpicC = input.hasEpicC === true;
    const teacherScript = JSON.stringify(input.context?.teacher_script ?? {}, null, 2);
    const anchor = JSON.stringify(input.context?.real_world_anchor ?? null);
    const focalIds = JSON.stringify(input.context?.focal_primitive_ids ?? {}, null, 2);
    const ttsMathShown = summarizeTtsMathShown(input.context?.tts_visual_bindings);
    const screenshotList = input.screenshots.map((s, i) => `Image ${i + 1}: ${s.label}`).join('\n');
    const userText = `Concept: ${input.conceptId}
Scope: ${input.scope} (full storyboard)

Real-world anchor declared in JSON metadata: ${anchor}
focal_primitive_id per state: ${focalIds}

Formulas delivered via TTS-synced equation panel (math_show) per state — these
render in the equation panel WHILE the narration speaks them (default sound-on
experience; separately confirmed present by Category I2):
${ttsMathShown}

Teacher script across all states:
\`\`\`json
${teacherScript}
\`\`\`

Screenshots in order:
${screenshotList}

Inspect the storyboard end-to-end. Act as a Class 11 physics teacher. Return JSON.`;
    const expectedChecks: VisualCheckId[] = includeEpicC
        ? ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']
        : ['E1', 'E2', 'E3', 'E5', 'E6'];
    return {
        systemPrompt: includeEpicC ? SYSTEM_E_WITH_EPICC : SYSTEM_E_WITHOUT_EPICC,
        userText,
        images: input.screenshots.map(s => s.pngB64),
        expectedChecks,
    };
}

// ─── Category F — Panel A/B vision parts (F2, F3) ─────────────────────────────
// F1 and F4 are DOM-validated and not handled here.

const SYSTEM_F = `You are a physics simulation reviewer specializing in dual-panel pedagogical layouts.
Your job: inspect a side-by-side capture of Panel A (the visual simulation) and Panel B (the parametric graph) and verify they cohere mathematically and visually.

THE CHECKS:
${checkLine('F2')}
${checkLine('F3')}

F1 (state desync) and F4 (PARAM_UPDATE relay) are checked separately by DOM inspection — do NOT report on them here.

${SHARED_OUTPUT_RULES}

JSON SCHEMA:
{
  "F2": { "passed": boolean, "evidence": string },
  "F3": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

function buildPanelSyncPrompt(input: PromptInput): PromptOutput {
    const panelAPhysics = JSON.stringify(input.context?.panel_a_physics ?? {}, null, 2);
    const panelBTraces = JSON.stringify(input.context?.panel_b_traces ?? [], null, 2);
    const liveDot = JSON.stringify(input.context?.live_dot ?? {}, null, 2);
    const userText = `Concept: ${input.conceptId}
Scope: ${input.scope}

Panel A physics_engine_config:
\`\`\`json
${panelAPhysics}
\`\`\`

Panel B traces[]:
\`\`\`json
${panelBTraces}
\`\`\`

Panel B live_dot config:
\`\`\`json
${liveDot}
\`\`\`

The image below shows Panel A (left) and Panel B (right) side by side. Check F2 and F3.`;
    return {
        systemPrompt: SYSTEM_F,
        userText,
        images: input.screenshots.map(s => s.pngB64),
        expectedChecks: ['F2', 'F3'],
    };
}

// ─── Category G — Panel B practical understanding ─────────────────────────────

const SYSTEM_G = `You are a graph-readability reviewer for physics teaching simulations.
Your job: inspect a Panel B graph (Plotly-rendered) for a Class 11 student and verify it is actually readable.

THE CHECKS:
${checkLine('G1')}
${checkLine('G2')}
${checkLine('G3')}
${checkLine('G4')}
${checkLine('G5')}
${checkLine('G6')}

${SHARED_OUTPUT_RULES}

JSON SCHEMA:
{
  "G1": { "passed": boolean, "evidence": string },
  "G2": { "passed": boolean, "evidence": string },
  "G3": { "passed": boolean, "evidence": string },
  "G4": { "passed": boolean, "evidence": string },
  "G5": { "passed": boolean, "evidence": string },
  "G6": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

function buildPanelBGraphPrompt(input: PromptInput): PromptOutput {
    const panelBConfig = JSON.stringify(input.context?.panel_b_config ?? {}, null, 2);
    const userText = `Concept: ${input.conceptId}
Scope: ${input.scope}

Panel B config (axes, traces, live_dot):
\`\`\`json
${panelBConfig}
\`\`\`

The image below is Panel B alone. Check G1-G6 and return JSON.`;
    return {
        systemPrompt: SYSTEM_G,
        userText,
        images: input.screenshots.map(s => s.pngB64),
        expectedChecks: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'],
    };
}

// ─── Category I — TTS–visual semantic sync ────────────────────────────────────

const SYSTEM_I = `You are a narration-visual coherence reviewer for physics teaching simulations.
Each teaching state has spoken TTS sentences. Some sentences declare a "glow" target — the id of a scene element the renderer pulse-highlights while the sentence speaks. Some declare "math_show" — a formula the equation panel must display.
Your job: inspect the screenshot(s) of a state and verify the narration's visual promises are kept.

You may be given MORE THAN ONE image. A "FRAME MANIFEST" in the user message lists each image in order with its label:
- Image 1 is always the BASE SCENE (no equation panel forced) — judge I1 from this image.
- Any IMAGES AFTER the first are EQUATION-PANEL FRAMES: the harness drove the renderer to display ONE declared math_show formula per frame (because the headless capture does not play TTS, the equation panel is otherwise blank). Each such frame's label names the exact formula it should show. Judge I2 from these per-formula frames.
- If only ONE image is given, judge BOTH I1 and I2 from it (legacy single-frame mode).

THE CHECKS:
${checkLine('I1')}
${checkLine('I2')}

CRITICAL JUDGING RULES:
- I1 judges PRESENCE ONLY: is the element each glow target names visible and identifiable in the BASE SCENE image? You are given a primitive legend mapping target ids to what they look like (e.g., "v" = the orange velocity arrow, "b" = the blue field grid, "hand" = the 3D right-hand mesh).
- NEVER judge glow brightness, pulsing, or highlight intensity — the glow pulses on a 1.8-second cycle, so the captured instant can be anywhere in the pulse. An un-glowed but PRESENT element passes.
- I2: every declared math_show formula must be visibly rendered (typeset in the equation panel/overlay, or as readable text). When per-formula equation-panel frames are provided, check each formula in ITS OWN labelled frame — the formula is rendered there if the equation panel shows that expression (KaTeX-typeset OR plain-text are both acceptable; you are confirming it RENDERS, not its typography). When NO sentence in this state declares math_show, return passed=true with evidence "no math_show declared".
- Do NOT fail I2 merely because a formula is absent from the BASE SCENE image — TTS-synced formulas only appear in their dedicated equation-panel frames.

${SHARED_OUTPUT_RULES}

JSON SCHEMA:
{
  "I1": { "passed": boolean, "evidence": string },
  "I2": { "passed": boolean, "evidence": string }
}

${PASS_ON_DOUBT}`;

function buildTtsSyncPrompt(input: PromptInput): PromptOutput {
    const bindings = JSON.stringify(input.context?.tts_bindings ?? [], null, 2);
    const legend = JSON.stringify(input.context?.primitive_legend ?? [], null, 2);
    const hasFormulaFrames = input.context?.has_formula_frames === true;
    const manifest = input.screenshots
        .map((s, i) => `  Image ${i + 1}: ${s.label}`)
        .join('\n');
    const i2Guidance = hasFormulaFrames
        ? `I2: check each declared math_show in its OWN equation-panel frame (Images 2+, labelled with the expected formula). The base scene (Image 1) intentionally has no equation panel.`
        : `I2: check each declared math_show is visibly rendered in the image.`;
    const userText = `Concept: ${input.conceptId}
Scope: ${input.scope}

FRAME MANIFEST (images are provided in this order):
${manifest}

TTS sentences for this state (text + glow target(s) + optional math_show):
\`\`\`json
${bindings}
\`\`\`

Primitive legend (what each glow target id looks like on screen):
\`\`\`json
${legend}
\`\`\`

I1: from the BASE SCENE (Image 1), is each glow target present and identifiable?
${i2Guidance}
Return JSON.`;
    return {
        systemPrompt: SYSTEM_I,
        userText,
        images: input.screenshots.map(s => s.pngB64),
        expectedChecks: ['I1', 'I2'],
    };
}

// ─── Public router ────────────────────────────────────────────────────────────

export function buildCategoryPrompt(input: PromptInput): PromptOutput {
    switch (input.category) {
        case 'A': return buildLayoutPrompt(input);
        case 'B': return buildPhysicsPrompt(input);
        case 'C': return buildChoreographyPrompt(input);
        case 'D': return buildAnimationPrompt(input);
        case 'E': return buildPedagogyPrompt(input);
        case 'F': return buildPanelSyncPrompt(input);
        case 'G': return buildPanelBGraphPrompt(input);
        case 'H': throw new Error('Category H is deterministic (pixelGate.ts) — must not be dispatched to vision.');
        case 'I': return buildTtsSyncPrompt(input);
    }
}

// ─── Response schemas (per category, Zod-validated) ───────────────────────────

const baseCheck = z.object({
    passed: z.boolean(),
    evidence: z.string(),
});

const e1Check = z.object({
    answer: z.enum(['yes', 'partially', 'no']),
    evidence: z.string(),
});

const layoutResponseSchema = z.object({
    A1: baseCheck, A2: baseCheck, A3: baseCheck,
    A4: baseCheck, A5: baseCheck, A6: baseCheck,
});

const physicsResponseSchema = z.object({
    B1: baseCheck, B2: baseCheck, B3: baseCheck, B4: baseCheck,
    B5: baseCheck, B6: baseCheck, B7: baseCheck,
});

const choreographyResponseSchema = z.object({
    C1: baseCheck, C2: baseCheck, C3: baseCheck, C4: baseCheck, C5: baseCheck,
});

const animationResponseWithTiming = z.object({
    D1: baseCheck, D2: baseCheck, D3: baseCheck, D4: baseCheck,
});
const animationResponseWithoutTiming = z.object({
    D1: baseCheck, D2: baseCheck, D4: baseCheck,
});

const pedagogyResponseWithEpicC = z.object({
    E1: e1Check,
    E2: baseCheck, E3: baseCheck, E4: baseCheck, E5: baseCheck, E6: baseCheck,
});
const pedagogyResponseWithoutEpicC = z.object({
    E1: e1Check,
    E2: baseCheck, E3: baseCheck, E5: baseCheck, E6: baseCheck,
});

const panelSyncResponseSchema = z.object({
    F2: baseCheck, F3: baseCheck,
});

const panelGraphResponseSchema = z.object({
    G1: baseCheck, G2: baseCheck, G3: baseCheck,
    G4: baseCheck, G5: baseCheck, G6: baseCheck,
});

const ttsSyncResponseSchema = z.object({
    I1: baseCheck, I2: baseCheck,
});

// ─── Response parser ──────────────────────────────────────────────────────────

export interface ParseInput {
    category: VisualCategory;
    scope: string;
    rawText: string;
    hasEpicC?: boolean;
    hasTimingMetadata?: boolean;
}

/**
 * Strip common JSON fence patterns so JSON.parse succeeds when the model
 * returns ```json ... ``` despite our instructions.
 */
function stripJsonFences(raw: string): string {
    return raw
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim();
}

/**
 * Extract the first balanced top-level JSON object from a model response,
 * tolerating leading or trailing prose (e.g. "Here is my analysis: {…}. Note…").
 * Scans with string-literal awareness so braces inside evidence strings — and
 * backslash escapes, even invalid ones — don't end the object early. Returns the
 * input unchanged when no opening brace is found (lets JSON.parse report cleanly).
 */
function extractJsonObject(raw: string): string {
    const start = raw.indexOf('{');
    if (start < 0) return raw;
    let depth = 0;
    let inString = false;
    for (let i = start; i < raw.length; i++) {
        const ch = raw[i];
        if (inString) {
            if (ch === '\\') { i++; continue; } // skip the escaped char (valid or not)
            if (ch === '"') inString = false;
            continue;
        }
        if (ch === '"') inString = true;
        else if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) return raw.slice(start, i + 1);
        }
    }
    return raw.slice(start); // unbalanced — hand the remainder to JSON.parse
}

/**
 * Replace backslash escapes that JSON forbids (e.g. LaTeX \sin, \,, \vec that
 * the model echoes into evidence strings) with a doubled backslash, so they
 * survive JSON.parse as literal text. Only the eight valid JSON escapes
 * (\" \\ \/ \b \f \n \r \t and \uXXXX) are left untouched. Applied ONLY as a
 * fallback after a strict parse fails, so well-formed responses are unaffected.
 */
function sanitizeJsonEscapes(json: string): string {
    return json.replace(/\\(?![\\"/bfnrtu])/g, '\\\\');
}

function makeResult(
    checkId: VisualCheckId,
    scope: string,
    passed: boolean,
    evidence: string,
): CheckResult {
    const spec = VISUAL_CHECKS[checkId];
    return {
        check_id: checkId,
        category: spec.category,
        state_id: scope,
        passed,
        evidence: evidence || (passed ? 'OK' : 'no evidence provided'),
        bug_class: spec.bugClass as BugClass,
    };
}

/**
 * Parse a vision-model JSON response into CheckResult[].
 *
 * Robust failure mode: when JSON.parse or schema validation fails, every
 * expected check is emitted as passed=false with evidence pointing to the
 * parse error. This avoids silently dropping a category when the model
 * returns malformed JSON.
 */
export function parseCategoryResponse(input: ParseInput): CheckResult[] {
    const cleaned = extractJsonObject(stripJsonFences(input.rawText));
    const expectedChecks = expectedChecksFor(input.category, input.hasEpicC, input.hasTimingMetadata);

    let parsedJson: unknown;
    try {
        parsedJson = JSON.parse(cleaned);
    } catch {
        // Fallback: the model likely echoed LaTeX (\sin, \,, \vec) into an
        // evidence string, producing invalid JSON escapes. Sanitize and retry
        // once before giving up.
        try {
            parsedJson = JSON.parse(sanitizeJsonEscapes(cleaned));
        } catch (err2) {
            const message = err2 instanceof Error ? err2.message : 'unknown parse error';
            return expectedChecks.map(id =>
                makeResult(id, input.scope, false, `Vision response was not valid JSON: ${message}`),
            );
        }
    }

    const schema = schemaFor(input.category, input.hasEpicC, input.hasTimingMetadata);
    const validation = schema.safeParse(parsedJson);
    if (!validation.success) {
        const issue = validation.error.issues[0];
        const where = issue?.path?.join('.') ?? '<root>';
        const what = issue?.message ?? 'schema mismatch';
        return expectedChecks.map(id =>
            makeResult(id, input.scope, false, `Vision response failed schema at ${where}: ${what}`),
        );
    }

    const obj = validation.data as Record<string, unknown>;
    return expectedChecks.map(id => {
        const entry = obj[id] as Record<string, unknown> | undefined;
        if (!entry) {
            return makeResult(id, input.scope, false, `Vision omitted ${id} from response`);
        }
        if (id === 'E1') {
            const answer = String(entry.answer);
            const passed = answer !== 'no';
            const evidence = `[${answer}] ${String(entry.evidence ?? '')}`.trim();
            return makeResult(id, input.scope, passed, evidence);
        }
        const passed = entry.passed === true;
        const evidence = String(entry.evidence ?? '');
        return makeResult(id, input.scope, passed, evidence);
    });
}

function expectedChecksFor(
    category: VisualCategory,
    hasEpicC?: boolean,
    hasTimingMetadata?: boolean,
): VisualCheckId[] {
    switch (category) {
        case 'A': return ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
        case 'B': return ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'];
        case 'C': return ['C1', 'C2', 'C3', 'C4', 'C5'];
        case 'D': return hasTimingMetadata ? ['D1', 'D2', 'D3', 'D4'] : ['D1', 'D2', 'D4'];
        case 'E': return hasEpicC
            ? ['E1', 'E2', 'E3', 'E4', 'E5', 'E6']
            : ['E1', 'E2', 'E3', 'E5', 'E6'];
        case 'F': return ['F2', 'F3'];
        case 'G': return ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
        case 'H': throw new Error('Category H is deterministic (pixelGate.ts) — never dispatched here.');
        case 'I': return ['I1', 'I2'];
    }
}

function schemaFor(
    category: VisualCategory,
    hasEpicC?: boolean,
    hasTimingMetadata?: boolean,
): z.ZodTypeAny {
    switch (category) {
        case 'A': return layoutResponseSchema;
        case 'B': return physicsResponseSchema;
        case 'C': return choreographyResponseSchema;
        case 'D': return hasTimingMetadata ? animationResponseWithTiming : animationResponseWithoutTiming;
        case 'E': return hasEpicC ? pedagogyResponseWithEpicC : pedagogyResponseWithoutEpicC;
        case 'F': return panelSyncResponseSchema;
        case 'G': return panelGraphResponseSchema;
        case 'H': throw new Error('Category H is deterministic (pixelGate.ts) — never dispatched here.');
        case 'I': return ttsSyncResponseSchema;
    }
}
