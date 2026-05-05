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

${SHARED_OUTPUT_RULES}

INDIAN CONTEXT NOTE: real-world anchors are things like Mumbai local trains, Manali highway turns, Diwali fireworks, IIT-JEE exam scenarios. Generic Western examples (Boston subway, German autobahn) do NOT count as anchors.`;

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

function buildPedagogyPrompt(input: PromptInput): PromptOutput {
    const includeEpicC = input.hasEpicC === true;
    const teacherScript = JSON.stringify(input.context?.teacher_script ?? {}, null, 2);
    const anchor = JSON.stringify(input.context?.real_world_anchor ?? null);
    const focalIds = JSON.stringify(input.context?.focal_primitive_ids ?? {}, null, 2);
    const screenshotList = input.screenshots.map((s, i) => `Image ${i + 1}: ${s.label}`).join('\n');
    const userText = `Concept: ${input.conceptId}
Scope: ${input.scope} (full storyboard)

Real-world anchor declared in JSON metadata: ${anchor}
focal_primitive_id per state: ${focalIds}

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
    const cleaned = stripJsonFences(input.rawText);
    const expectedChecks = expectedChecksFor(input.category, input.hasEpicC, input.hasTimingMetadata);

    let parsedJson: unknown;
    try {
        parsedJson = JSON.parse(cleaned);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown parse error';
        return expectedChecks.map(id =>
            makeResult(id, input.scope, false, `Vision response was not valid JSON: ${message}`),
        );
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
    }
}
