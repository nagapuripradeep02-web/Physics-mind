/**
 * Visual Validator — vision gate (Engine E29, Day 4).
 *
 * Orchestrates the vision categories (A–G + I) across all states by:
 *   - Building category-specific prompts (promptTemplates.ts)
 *   - Calling vision models in parallel through a COST LADDER (2026-06-10):
 *       Tier 1 Gemini 2.5 Flash  — cheap first pass per category task
 *       Tier 2 Claude Sonnet 4.6 — AUTHORITATIVE; runs when Gemini errors,
 *                                  fails JSON/schema parse, or reports ANY
 *                                  failed check. Sonnet's verdict replaces
 *                                  Gemini's entirely.
 *       Tier 3 Claude Opus       — flag-gated (VISION_ESCALATION_MAX_TIER=opus);
 *                                  re-judges once when Sonnet still fails.
 *     Clean Gemini passes are accepted (the common case → big cost cut).
 *     Kill-switch: VISION_LADDER=off → legacy direct-Sonnet path. The ladder
 *     also disables itself when a custom Anthropic client is injected (tests)
 *     or no GOOGLE_GENERATIVE_AI_API_KEY is configured.
 *   - Parsing structured JSON responses into CheckResult[]
 *   - Deriving F1 (state desync) and F4 (PARAM_UPDATE relay) from DOM-level timings
 *     captured by screenshotter.ts (no LLM call needed for those two)
 *   - Aggregating + logging per-tier cost telemetry to ai_usage_log
 */

import Anthropic from '@anthropic-ai/sdk';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type {
    BugClass,
    CheckResult,
    VisualCategory,
    VisualCheckId,
    VisualValidationResult,
} from './spec';
import { VISUAL_CHECKS, formatCheckError } from './spec';
import { buildCategoryPrompt, parseCategoryResponse, type PromptOutput, type ScreenshotRef } from './promptTemplates';
import type { CaptureResult } from './screenshotter';
import type { StateTtsContext } from './ttsBindings';
import { logUsage } from '@/lib/usageLogger';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface VisionGateContext {
    /** Stage 2 physics_engine_config (forces[], net_force_zero, motion_direction, etc.) */
    physics_engine_config?: unknown;
    /** Teacher script with per-state narration and optional duration_ms */
    teacher_script?: unknown;
    /** motion_path primitives keyed by transition (e.g., "STATE_1->STATE_2") */
    motion_paths?: unknown;
    /** focal_primitive_id keyed by state_id */
    focal_primitive_ids?: unknown;
    /** Indian context anchor (e.g., {label: "Mumbai local train", coords: ...}) */
    real_world_anchor?: unknown;
    /** For multi-panel: Panel A's physics, Panel B's traces[] / live_dot / config */
    panel_a_physics?: unknown;
    panel_b_traces?: unknown;
    panel_b_config?: unknown;
    live_dot?: unknown;
    /**
     * Category I — per-state TTS visual bindings (extractTtsVisualBindings on
     * the concept JSON). Absent → Category I is dormant (the auto-fire path
     * never passes this, so its behavior is byte-for-byte unchanged).
     */
    tts_visual_bindings?: Record<string, StateTtsContext>;
}

export interface RunVisionGateInput {
    conceptId: string;
    capture: CaptureResult;
    context: VisionGateContext;
    panelCount: number;
    hasEpicC?: boolean;
    hasTimingMetadata?: boolean;
    /** Optional pre-built client (tests inject mocks). Falls back to new Anthropic(). */
    client?: Anthropic;
    /** Cap on parallel API calls. Defaults to 6. */
    concurrency?: number;
    /** Optional sessionId stamped into ai_usage_log entries. */
    sessionId?: string;
}

// ─── Model tiers + pricing (per token) ────────────────────────────────────────

const SONNET_MODEL = 'claude-sonnet-4-6';
const OPUS_MODEL = 'claude-opus-4-8';
const GEMINI_MODEL = 'gemini-2.5-flash';

const SONNET_4_6_PRICING = {
    input:          3.00 / 1_000_000,
    output:         15.00 / 1_000_000,
    cache_creation: 3.75 / 1_000_000,   // 1.25× input
    cache_read:     0.30 / 1_000_000,   // 0.10× input
} as const;

const OPUS_PRICING = {
    input:          15.00 / 1_000_000,
    output:         75.00 / 1_000_000,
    cache_creation: 18.75 / 1_000_000,
    cache_read:     1.50 / 1_000_000,
} as const;

const GEMINI_FLASH_PRICING = {
    input:  0.30 / 1_000_000,
    output: 2.50 / 1_000_000,
} as const;

interface MessageUsage {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number | null;
    cache_read_input_tokens?: number | null;
}

function estimateAnthropicCostUsd(usage: MessageUsage, model: string): number {
    const p = model === OPUS_MODEL ? OPUS_PRICING : SONNET_4_6_PRICING;
    return (
        usage.input_tokens * p.input
        + usage.output_tokens * p.output
        + (usage.cache_creation_input_tokens ?? 0) * p.cache_creation
        + (usage.cache_read_input_tokens ?? 0) * p.cache_read
    );
}

// ─── Task descriptor: one (category, scope) call ──────────────────────────────

interface VisionTask {
    category: VisualCategory;
    scope: string;
    screenshots: ScreenshotRef[];
    context: Record<string, unknown>;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function runVisionGate(input: RunVisionGateInput): Promise<VisualValidationResult> {
    const start = Date.now();
    const isMulti = input.panelCount >= 2;
    const stateCaptures = input.capture.state_captures;
    const concurrency = Math.max(1, input.concurrency ?? 6);
    const client = input.client ?? new Anthropic();

    const tasks = buildVisionTasks({
        stateCaptures,
        animationTimeseries: input.capture.animation_timeseries,
        isMulti,
        context: input.context,
    });

    let totalCost = 0;

    // Ladder availability: explicit kill-switch, no Gemini key, or an injected
    // Anthropic client (tests) all force the legacy direct-Sonnet path.
    const ladderEnabled =
        process.env.VISION_LADDER !== 'off'
        && !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
        && !input.client;
    const opusEnabled = process.env.VISION_ESCALATION_MAX_TIER === 'opus';

    const logTier = (
        task: VisionTask, provider: string, model: string, prompt: PromptOutput,
        outputChars: number, cost: number, taskStart: number, wasCacheHit: boolean, tier: string,
    ): void => {
        void logUsage({
            sessionId: input.sessionId,
            taskType: `visual_validator_cat_${task.category.toLowerCase()}`,
            provider,
            model,
            inputChars: prompt.userText.length + prompt.systemPrompt.length,
            outputChars,
            latencyMs: Date.now() - taskStart,
            estimatedCostUsd: cost,
            fingerprintKey: `${input.conceptId}|${task.category}|${task.scope}`,
            wasCacheHit,
            metadata: {
                concept_id: input.conceptId,
                scope: task.scope,
                panel_count: input.panelCount,
                ladder_tier: tier,
            },
        });
    };

    const callAnthropic = async (prompt: PromptOutput, model: string): Promise<{ text: string; usage: MessageUsage }> => {
        const message = await client.messages.create({
            model,
            max_tokens: 1500,
            system: [{
                type: 'text',
                text: prompt.systemPrompt,
                cache_control: { type: 'ephemeral' },
            }],
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt.userText },
                    ...prompt.images.map(b64 => ({
                        type: 'image' as const,
                        source: {
                            type: 'base64' as const,
                            media_type: 'image/png' as const,
                            data: b64,
                        },
                    })),
                ],
            }],
        });
        const text = message.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text)
            .join('\n');
        return { text, usage: message.usage as MessageUsage };
    };

    const callGemini = async (prompt: PromptOutput): Promise<{ text: string; cost: number }> => {
        const result = await generateText({
            model: google(GEMINI_MODEL),
            system: prompt.systemPrompt,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt.userText },
                    ...prompt.images.map(b64 => ({
                        type: 'image' as const,
                        image: b64,
                        mediaType: 'image/png' as const,
                    })),
                ],
            }],
        });
        const inputTokens = result.usage?.inputTokens ?? 0;
        const outputTokens = result.usage?.outputTokens ?? 0;
        const cost = inputTokens * GEMINI_FLASH_PRICING.input + outputTokens * GEMINI_FLASH_PRICING.output;
        return { text: result.text, cost };
    };

    const parseFor = (task: VisionTask, rawText: string): CheckResult[] =>
        parseCategoryResponse({
            category: task.category,
            scope: task.scope,
            rawText,
            hasEpicC: input.hasEpicC,
            hasTimingMetadata: input.hasTimingMetadata,
        });

    const runOne = async (task: VisionTask): Promise<CheckResult[]> => {
        const taskStart = Date.now();
        const prompt = buildCategoryPrompt({
            category: task.category,
            conceptId: input.conceptId,
            scope: task.scope,
            screenshots: task.screenshots,
            context: task.context,
            hasEpicC: input.hasEpicC,
            hasTimingMetadata: input.hasTimingMetadata,
        });

        // ── Tier 1: Gemini Flash. A clean pass is accepted as-is; anything
        // else (error / parse failure / any failed check) escalates to Sonnet.
        if (ladderEnabled) {
            try {
                const gemini = await callGemini(prompt);
                totalCost += gemini.cost;
                logTier(task, 'google', GEMINI_MODEL, prompt, gemini.text.length, gemini.cost, taskStart, false, 'gemini');
                const geminiResults = parseFor(task, gemini.text);
                if (geminiResults.every(r => r.passed)) return geminiResults;
            } catch {
                // Gemini unavailable — fall through to Sonnet silently.
            }
        }

        // ── Tier 2: Sonnet (authoritative).
        try {
            const sonnetStart = Date.now();
            const sonnet = await callAnthropic(prompt, SONNET_MODEL);
            const sonnetCost = estimateAnthropicCostUsd(sonnet.usage, SONNET_MODEL);
            totalCost += sonnetCost;
            logTier(task, 'anthropic', SONNET_MODEL, prompt, sonnet.text.length, sonnetCost, sonnetStart,
                (sonnet.usage.cache_read_input_tokens ?? 0) > 0, ladderEnabled ? 'sonnet_escalated' : 'sonnet_direct');
            const sonnetResults = parseFor(task, sonnet.text);

            // ── Tier 3 (flag-gated): Opus re-judges once when Sonnet still fails.
            if (opusEnabled && sonnetResults.some(r => !r.passed)) {
                try {
                    const opusStart = Date.now();
                    const opus = await callAnthropic(prompt, OPUS_MODEL);
                    const opusCost = estimateAnthropicCostUsd(opus.usage, OPUS_MODEL);
                    totalCost += opusCost;
                    logTier(task, 'anthropic', OPUS_MODEL, prompt, opus.text.length, opusCost, opusStart,
                        (opus.usage.cache_read_input_tokens ?? 0) > 0, 'opus_escalated');
                    return parseFor(task, opus.text);
                } catch {
                    return sonnetResults; // Opus unavailable — Sonnet verdict stands.
                }
            }
            return sonnetResults;
        } catch (err) {
            // On API failure, emit a synthetic failure for every check this task owned
            // so the retry loop sees actionable feedback rather than silent gaps.
            const message = err instanceof Error ? err.message : String(err);
            return synthesizeApiFailureResults(task, message, input.hasEpicC, input.hasTimingMetadata);
        }
    };

    const llmResults = await runWithConcurrencyLimit(tasks, runOne, concurrency);

    const allResults: CheckResult[] = llmResults.flat();

    // Derive F1 (state desync) from DOM timings
    if (isMulti) {
        for (const t of input.capture.timings) {
            const lag = t.panel_b_lag_ms;
            const passed = !t.timed_out && lag !== undefined && lag <= 200;
            const evidence = t.timed_out
                ? `STATE_REACHED timed out for ${t.state_id} (Panel A: ${t.panel_a_state_reached_ms}ms, Panel B: ${t.panel_b_state_reached_ms ?? 'TIMEOUT'}ms)`
                : `Panel A reached ${t.state_id} at ${t.panel_a_state_reached_ms}ms; Panel B at ${t.panel_b_state_reached_ms}ms; lag ${lag}ms (threshold 200ms).`;
            allResults.push({
                check_id: 'F1',
                category: 'F',
                state_id: t.state_id,
                passed,
                evidence,
                bug_class: 'DUALPANEL_STATE_DESYNC' as BugClass,
            });
        }

        // Derive F4 (PARAM_UPDATE round-trip) from DOM measurement
        const pr = input.capture.param_relay;
        const aToB = pr.a_to_b_ms;
        const bToA = pr.b_to_a_ms;
        const aOk = aToB !== undefined && aToB <= 200;
        const bOk = bToA !== undefined && bToA <= 200;
        const passed = aOk && bOk && !pr.timed_out;
        const evidence = `A->B: ${aToB ?? 'TIMEOUT'}ms; B->A: ${bToA ?? 'TIMEOUT'}ms (threshold 200ms each direction).`;
        allResults.push({
            check_id: 'F4',
            category: 'F',
            state_id: 'PARAM_RELAY',
            passed,
            evidence,
            bug_class: 'DUALPANEL_PARAM_RELAY_BROKEN' as BugClass,
        });
    }

    const failures = allResults.filter(r => !r.passed);
    const errors = failures.map(formatCheckError);

    return {
        valid: failures.length === 0,
        errors,
        check_results: allResults,
        cost_usd: totalCost,
        duration_ms: Date.now() - start,
    };
}

// ─── Task assembly ────────────────────────────────────────────────────────────

interface BuildTasksInput {
    stateCaptures: CaptureResult['state_captures'];
    animationTimeseries: CaptureResult['animation_timeseries'];
    isMulti: boolean;
    context: VisionGateContext;
}

function buildVisionTasks(input: BuildTasksInput): VisionTask[] {
    const { stateCaptures, animationTimeseries, isMulti, context } = input;
    const tasks: VisionTask[] = [];

    // Cat A — layout integrity, per state
    for (const sc of stateCaptures) {
        tasks.push({
            category: 'A',
            scope: sc.state_id,
            screenshots: [{ label: sc.state_id, pngB64: sc.panel_a_png_b64 }],
            context: {},
        });
    }

    // Cat B — physics correctness, per state
    for (const sc of stateCaptures) {
        tasks.push({
            category: 'B',
            scope: sc.state_id,
            screenshots: [{ label: sc.state_id, pngB64: sc.panel_a_png_b64 }],
            context: { physics_engine_config: context.physics_engine_config },
        });
    }

    // Cat C — choreography, per consecutive pair
    for (let i = 0; i < stateCaptures.length - 1; i++) {
        const a = stateCaptures[i];
        const b = stateCaptures[i + 1];
        tasks.push({
            category: 'C',
            scope: `${a.state_id}->${b.state_id}`,
            screenshots: [
                { label: a.state_id, pngB64: a.panel_a_png_b64 },
                { label: b.state_id, pngB64: b.panel_a_png_b64 },
            ],
            context: {
                motion_paths: context.motion_paths,
                focal_primitive_ids: context.focal_primitive_ids,
            },
        });
    }

    // Cat D — animation time-series (single call covering all 5 frames)
    if (animationTimeseries) {
        const ats = animationTimeseries;
        tasks.push({
            category: 'D',
            scope: `TIMESERIES@${ats.state_id}`,
            screenshots: ats.frames_b64.map((b64, i) => ({
                label: `t=${ats.capture_times_ms[i] ?? i * 2500}ms`,
                pngB64: b64,
            })),
            context: { teacher_script: context.teacher_script },
        });
    }

    // Cat E — pedagogy storyboard (single call covering all states)
    tasks.push({
        category: 'E',
        scope: 'STORYBOARD',
        screenshots: stateCaptures.map(sc => ({ label: sc.state_id, pngB64: sc.panel_a_png_b64 })),
        context: {
            teacher_script: context.teacher_script,
            real_world_anchor: context.real_world_anchor,
            focal_primitive_ids: context.focal_primitive_ids,
            // Drives the E5 carve-out: formulas delivered via TTS-synced math_show
            // count as present even though they're absent from the silent frames.
            tts_visual_bindings: context.tts_visual_bindings,
        },
    });

    // Cat I — TTS↔visual semantic sync, per state WITH bindings only.
    // The auto-fire path passes no bindings → no Cat I tasks → unchanged behavior.
    if (context.tts_visual_bindings) {
        for (const sc of stateCaptures) {
            const stateContext = context.tts_visual_bindings[sc.state_id];
            if (!stateContext || stateContext.bindings.length === 0) continue;
            // Frame 0 = the base scene (I1 glow-target presence). Subsequent
            // frames (when the harness replayed SET_MATH) each show one declared
            // formula in the equation panel while its sentence speaks (I2).
            const screenshots = [
                { label: `${sc.state_id} — base scene`, pngB64: sc.panel_a_png_b64 },
            ];
            for (const f of sc.i2_frames ?? []) {
                screenshots.push({
                    label: `${sc.state_id} — equation panel while ${f.sentence_id} speaks (expects: ${f.expression})`,
                    pngB64: f.panel_a_png_b64,
                });
            }
            tasks.push({
                category: 'I',
                scope: sc.state_id,
                screenshots,
                context: {
                    tts_bindings: stateContext.bindings,
                    primitive_legend: stateContext.primitive_legend,
                    has_formula_frames: (sc.i2_frames?.length ?? 0) > 0,
                },
            });
        }
    }

    if (isMulti) {
        // Cat F vision (F2, F3) — per state, side-by-side composite
        for (const sc of stateCaptures) {
            if (!sc.combined_png_b64) continue;
            tasks.push({
                category: 'F',
                scope: sc.state_id,
                screenshots: [{ label: `${sc.state_id} (A|B)`, pngB64: sc.combined_png_b64 }],
                context: {
                    panel_a_physics: context.panel_a_physics,
                    panel_b_traces: context.panel_b_traces,
                    live_dot: context.live_dot,
                },
            });
        }

        // Cat G — Panel B graph readability, per state
        for (const sc of stateCaptures) {
            if (!sc.panel_b_png_b64) continue;
            tasks.push({
                category: 'G',
                scope: sc.state_id,
                screenshots: [{ label: `panel_b ${sc.state_id}`, pngB64: sc.panel_b_png_b64 }],
                context: { panel_b_config: context.panel_b_config },
            });
        }
    }

    return tasks;
}

// ─── Concurrency helper ───────────────────────────────────────────────────────

async function runWithConcurrencyLimit<T, R>(
    items: T[],
    worker: (item: T) => Promise<R>,
    concurrency: number,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let nextIndex = 0;
    const runners: Promise<void>[] = [];
    const workerCount = Math.min(concurrency, items.length);
    for (let i = 0; i < workerCount; i++) {
        runners.push((async () => {
            while (true) {
                const myIndex = nextIndex++;
                if (myIndex >= items.length) return;
                results[myIndex] = await worker(items[myIndex]);
            }
        })());
    }
    await Promise.all(runners);
    return results;
}

// ─── API-failure synthesis ────────────────────────────────────────────────────

function synthesizeApiFailureResults(
    task: VisionTask,
    errMessage: string,
    hasEpicC: boolean | undefined,
    hasTimingMetadata: boolean | undefined,
): CheckResult[] {
    const checks = expectedChecksForCategory(task.category, hasEpicC, hasTimingMetadata);
    return checks.map(id => {
        const spec = VISUAL_CHECKS[id];
        return {
            check_id: id,
            category: spec.category,
            state_id: task.scope,
            passed: false,
            evidence: `Vision API call failed for category ${task.category} (${task.scope}): ${errMessage}`,
            bug_class: spec.bugClass,
        };
    });
}

function expectedChecksForCategory(
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
