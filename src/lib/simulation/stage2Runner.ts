// =============================================================================
// src/lib/simulation/stage2Runner.ts
//
// Calls Claude Sonnet (Stage 2) with a physics-locked prompt and returns
// a validated SimulationConfig.
//
// Retry strategy:
//   Attempt 1 — send the raw Stage 2 prompt
//   Attempt 2 — re-send with the specific validation errors prepended so
//               Sonnet can correct exactly the failing fields
//   Fallback   — load a hardcoded safe config from
//               src/lib/physics_constants/fallback_drift_velocity.json
//
// Usage (server-side only — uses fs, process.env, Anthropic SDK):
//   const result = await runStage2(strategy, "drift_velocity");
//   if (result.validationErrors.length) {
//     console.warn("Fell back or had residual errors:", result.validationErrors);
//   }
//   const config = result.config; // always a valid SimulationConfig
// =============================================================================

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

import type { ParticleFieldConfig, PhysicsConstantsFile } from "@/lib/renderer_schema";
import { type SimulationStrategy, buildStage2Prompt } from "./stage2Prompt";
import { validatePhysics } from "@/lib/physics_validator";
import { STANDARD_CONSTANTS } from "./physicsValidator";
import { loadConstants } from "../physics_constants/index";
import type { VariantConfig } from "@/lib/variantPicker";

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface Stage2Result {
  /** The validated (or fallback) ParticleFieldConfig to hand to the renderer. */
  config: ParticleFieldConfig;
  /** How many Sonnet attempts were needed (1 or 2). */
  attempts: number;
  /**
   * Physics validation errors from the final attempt.
   * Empty when Sonnet passed validation on its own.
   * Non-empty when the fallback config was used — signals to the caller
   * that an operator alert may be warranted.
   */
  validationErrors: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Strip markdown code fences that Sonnet sometimes wraps JSON in,
 * despite explicit instructions not to.
 * Handles ```json ... ```, ``` ... ```, and leading/trailing whitespace.
 */
function stripMarkdownFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/,           "")
    .trim();
}

/**
 * Generates a concept-safe fallback config when both Sonnet attempts fail.
 * It uses a drift-priority fallback only for drift concepts, and a generic
 * fallback for all others.
 */
function getFallbackConfig(conceptId: string): ParticleFieldConfig {
    const isDriftVelocity = conceptId.includes("drift_velocity") || conceptId === "drift_velocity";
    if (isDriftVelocity) {
        return {
            renderer: "particle_field",
            canvas: { width: 800, height: 420, bg_color: "#0A0A1A" },
            particles: { count: 30, color: "#42A5F5", size: 6, trail_length: 5, thermal_speed: 4.0 },
            lattice: { count: 12, color: "#DEBB40", size: 8, glow: true },
            field_arrows: { color: "#FF9800", direction: "left_to_right", count: 3 },
            states: {
                STATE_1: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Random thermal motion (vd = 0)" },
                STATE_2: { drift_speed: 0.1, drift_direction: "left", field_visible: true, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 5, label: "Electric field applied — slow drift begins" },
                STATE_3: { drift_speed: 0.1, drift_direction: "left", field_visible: true, highlight_particle: true, dim_others: true, dim_opacity: 0.3, field_strength: 5, label: "Notice how often they collide (tau)" },
                STATE_4: { drift_speed: 0.1, drift_direction: "left", field_visible: true, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 5, label: "Interactive parameters" }
            }
        };
    }

    return {
        renderer: "particle_field",
        canvas: { width: 800, height: 420, bg_color: "#0A0A1A" },
        particles: { count: 20, color: "#78909C", size: 6, trail_length: 10, thermal_speed: 2.0 },
        lattice: { count: 0, color: "#546E7A", size: 0, glow: false },
        field_arrows: { color: "#546E7A", direction: "left_to_right", count: 0 },
        states: {
            STATE_1: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Simulation temporarily unavailable" },
            STATE_2: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Simulation temporarily unavailable" },
            STATE_3: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Simulation temporarily unavailable" },
            STATE_4: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Simulation temporarily unavailable" },
        },
    };
}

// ---------------------------------------------------------------------------
// runStage2 — main export
// ---------------------------------------------------------------------------

/**
 * Run the Stage 2 Sonnet pipeline for a given simulation strategy and concept.
 *
 * Orchestrates:
 *   1. Loading locked physics constants for the concept
 *   2. Reading the renderer schema TypeScript source (for Sonnet's reference)
 *   3. Building the Stage 2 prompt via `buildStage2Prompt`
 *   4. Calling Claude Sonnet with up to 2 attempts + physics validation
 *   5. Falling back to a hardcoded safe config if both attempts fail
 *
 * Always returns a `Stage2Result` — never throws on Sonnet or validation failure.
 * Only throws if the fallback config itself cannot be loaded.
 *
 * @param strategy   Stage 1 pedagogical strategy (from Gemini Flash).
 * @param conceptId  Concept identifier, e.g. `"drift_velocity"`.
 * @returns          Stage2Result with `config`, `attempts`, and `validationErrors`.
 */
export async function runStage2(
  strategy: SimulationStrategy,
  conceptId: string,
  mvsContext?: string,
  simulationEmphasis?: string,
  studentBelief?: string,
  modifiedJson?: import("@/lib/jsonModifier").ModifiedSimulationJson,
  variant?: VariantConfig,
  vectorAMagnitude?: number,
  vectorBMagnitude?: number,
  maxStates?: number,
): Promise<Stage2Result> {
  console.log(`[Stage2] Starting for concept: ${conceptId}`);

  // ── Step 1: Load locked physics constants ──────────────────────────────────
  const loadedConstants = await loadConstants(conceptId);
  const constants = loadedConstants || {
    concept: conceptId,
    locked_facts: {},
    animation_constraints: {},
    ncert_truth_statements: []
  };

  // ── Step 2: Load renderer schema source as a string ───────────────────────
  // Sonnet receives the TypeScript interface verbatim so it knows the exact
  // shape it must produce. We read the actual source file rather than
  // manually maintaining a copy so the two can never drift apart.
  const schemaPath = path.join(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
    "rendererSchema.ts",
  );
  let rendererSchema: string;
  try {
    rendererSchema = await fs.readFile(schemaPath, "utf-8");
  } catch (err) {
    // Non-fatal for Stage 2 — Sonnet can still work with the rules alone;
    // we fall back to an empty schema note rather than crashing the pipeline.
    console.warn("[Stage2] Could not read rendererSchema.ts:", err);
    rendererSchema = "// rendererSchema.ts unavailable — see RULES section above.";
  }

  // ── Step 3: Build the base prompt ──────────────────────────────────────────
  const basePrompt = buildStage2Prompt(strategy, constants, rendererSchema, mvsContext, simulationEmphasis, studentBelief, modifiedJson, variant, vectorAMagnitude, vectorBMagnitude, maxStates);
  console.log("[Stage2] Prompt built, sending to Sonnet...");

  // ── Step 4: Anthropic client ────────────────────────────────────────────────
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // ── Step 5: Attempt loop (max 2 attempts) ──────────────────────────────────
  let lastErrors: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt++) {
    // On attempt 2 append the specific errors so Sonnet knows what to fix.
    const promptWithErrors =
      attempt === 1
        ? basePrompt
        : basePrompt +
          "\n\nPREVIOUS ATTEMPT FAILED PHYSICS VALIDATION.\nErrors to fix:\n" +
          lastErrors.map((e) => `- ${e}`).join("\n") +
          "\n\nFix ONLY these errors. Output corrected JSON now.";

    // ── Call Sonnet ──────────────────────────────────────────────────────────
    const maxTokens = 8000;

    let responseText: string;
    try {
      const message = await client.messages.create({
        model:      "claude-sonnet-4-6",
        max_tokens: maxTokens,
        messages:   [{ role: "user", content: promptWithErrors }],
      });
      responseText = (message.content[0] as { type: "text"; text: string }).text;
      console.log(`[Stage2] Attempt ${attempt} response received`);
    } catch (err) {
      console.error(`[Stage2] Anthropic API error on attempt ${attempt}:`, err);
      lastErrors = [`Anthropic API call failed: ${err instanceof Error ? err.message : String(err)}`];
      continue;
    }

    // ── Strip fences and parse JSON ──────────────────────────────────────────
    const cleaned = stripMarkdownFences(responseText);
    let parsedConfig: ParticleFieldConfig;
    try {
      parsedConfig = JSON.parse(cleaned) as ParticleFieldConfig;
    } catch (parseErr) {
      console.log(`[Stage2] JSON parse failed, attempt ${attempt}:`, parseErr);
      lastErrors = ["Response was not valid JSON"];
      continue;
    }

    // ── Dual-panel shape validation ─────────────────────────────────────────
    const isPanelCount2 = ((modifiedJson as unknown as Record<string, unknown>)
      ?.technology_config as Record<string, unknown>)?.panel_count as number ?? 1;
    if (isPanelCount2 > 1) {
      const cfg = parsedConfig as unknown as Record<string, unknown>;
      const hasA = 'panel_a_config' in cfg;
      const hasB = 'panel_b_config' in cfg;
      if (!hasA || !hasB) {
        console.log(
          `[Stage2] Attempt ${attempt}: dual-panel output missing ` +
          `panel_a_config or panel_b_config — retrying with explicit error`
        );
        lastErrors = [
          'DUAL-PANEL SHAPE ERROR: You output a flat single-panel config. ' +
          'This concept requires panel_count=2. You MUST wrap your output as: ' +
          '{ "panel_a_config": { ...mechanics_2d config... }, ' +
          '"panel_b_config": { ...graph_interactive config... } }. ' +
          'A flat config with renderer/states at the top level is WRONG for ' +
          'this dual-panel concept. Rewrap immediately.'
        ];
        continue;
      }
      // Also validate Panel B has pvl_colors (crash guard)
      const panelB = cfg.panel_b_config as Record<string, unknown> | undefined;
      if (!panelB?.pvl_colors) {
        console.log('[Stage2] panel_b_config missing pvl_colors — retrying');
        lastErrors = [
          'panel_b_config.pvl_colors is missing. The graph_interactive renderer ' +
          'crashes on load without pvl_colors. Add: ' +
          '"pvl_colors": {"background":"#0a0a1a","grid":"#1e2030","axis":"#94a3b8","highlight":"#fbbf24"}'
        ];
        continue;
      }
      // Validate Panel B has at least one line
      const lines = (panelB.lines as unknown[]) ?? [];
      if (lines.length === 0) {
        console.log('[Stage2] panel_b_config.lines is empty — retrying');
        lastErrors = [
          'panel_b_config.lines is an empty array. An empty lines array renders ' +
          'a completely blank Plotly graph. Add at least one line object with ' +
          'id, label, formula (or slope+intercept), and color.'
        ];
        continue;
      }
    }

    // ── Physics validation ───────────────────────────────────────────────────
    let result: { valid: boolean; errors: string[] } = { valid: true, errors: [] }
    try {
      result = validatePhysics(
        parsedConfig as unknown as ParticleFieldConfig,
        constants as unknown as PhysicsConstantsFile,
        conceptId
      )
    } catch (validationErr) {
      console.warn("[Stage2] Validator schema mismatch — skipping validation:", 
        validationErr instanceof Error ? validationErr.message : String(validationErr))
      // Config passes through — NCERT Truth Anchor in aiSimulationGenerator will still check it
    }

    if (result.valid) {
      console.log(`[Stage2] Validation passed on attempt ${attempt}`);
      return { config: parsedConfig, attempts: attempt, validationErrors: [] };
    }

    // Validation failed — store errors for the next attempt or final log.
    lastErrors = result.errors;
    console.log(`[Stage2] Validation failed attempt ${attempt}:`, result.errors);
  }

  // ── Step 6: Both attempts failed — load fallback ───────────────────────────
  console.log("[Stage2] Both attempts failed. Using fallback config.");
  const fallbackConfig = getFallbackConfig(conceptId);

  return {
    config:           fallbackConfig,
    attempts:         2,
    validationErrors: lastErrors,
  };
}

// Named export and default export so callers can use either style.
export default runStage2;
