// =============================================================================
// src/lib/simulation/circuitSimRunner.ts
//
// Five-step pipeline that produces a validated SimulationConfig for the
// circuit_live_renderer.js renderer.
//
// STEP 1 — Load the Stage-2 system prompt from disk
// STEP 2 — Build the user message from StudentContext + fingerprint
// STEP 3 — Call Claude Sonnet 4.6; parse the JSON response
// STEP 4 — Run validatePhysics(); retry once with errors; fallback to JSON file
// STEP 5 — Cache the validated config in Supabase simulation_cache;
//           return the config to the caller
//
// Usage:
//   import { generateCircuitSimConfig } from "@/lib/simulation/circuitSimRunner";
//   const result = await generateCircuitSimConfig(studentContext, fingerprint);
//   // result.config is a validated CircuitSimulationConfig
// =============================================================================

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logUsage } from "@/lib/usageLogger";
import type { QuestionFingerprint } from "@/lib/intentClassifier";
import type { StudentContext } from "@/lib/aiSimulationGenerator";
import {
  validatePhysics,
  type CircuitSimulationConfig,
  type CircuitValidationResult,
} from "@/lib/physicsValidator";

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface CircuitSimResult {
  /** The validated (or fallback) SimulationConfig for circuit_live_renderer. */
  config: CircuitSimulationConfig;
  /** Whether the config came from the Supabase cache. */
  fromCache: boolean;
  /** How many Sonnet generation attempts were made (0 if cache hit). */
  attempts: number;
  /** Physics validation errors from the final attempt, if any. */
  validationErrors: string[];
  /** The 5-dimensional cache key used for this config. */
  cacheKey: string;
}

// ---------------------------------------------------------------------------
// Concept → circuit topology hint
// ---------------------------------------------------------------------------

const CONCEPT_TOPOLOGY_MAP: Record<string, string> = {
  ohms_law:                    "series",
  drift_velocity:              "series",
  resistivity:                 "series",
  electric_current:            "series",
  kirchhoffs_laws:             "parallel",
  kcl:                         "parallel",
  kvl:                         "series",
  wheatstone_bridge:           "bridge",
  meter_bridge:                "bridge",
  potentiometer:               "wire",
  emf_internal_resistance:     "series",
  cells_in_series_parallel:    "parallel",
  electrical_power_energy:     "series",
  resistance_temperature_dependence: "series",
};

function topologyHint(conceptId: string): string {
  return CONCEPT_TOPOLOGY_MAP[conceptId] ?? "series";
}

// ---------------------------------------------------------------------------
// Exam mode → human-readable string
// ---------------------------------------------------------------------------

function examLabel(mode: string): string {
  if (mode === "board")       return "CBSE Board exam";
  if (mode === "competitive") return "JEE/NEET competitive exam";
  return "conceptual understanding";
}

// ---------------------------------------------------------------------------
// 5-dimensional cache key
// ---------------------------------------------------------------------------

function buildCacheKey(
  conceptId: string,
  intent:   string,
  aspect:   string,
  classLvl: string,
  examMode: string,
): string {
  return [conceptId, intent, aspect, classLvl, examMode].join("|");
}

// ---------------------------------------------------------------------------
// Load the Stage-2 system prompt
// ---------------------------------------------------------------------------

async function loadSystemPrompt(): Promise<string> {
  // Resolve relative to the project root (process.cwd() in Next.js = project root)
  const promptPath = path.join(process.cwd(), "prompts", "stage2_circuit_config_writer.txt");
  try {
    return await fs.readFile(promptPath, "utf-8");
  } catch (err) {
    throw new Error(
      `[CircuitSimRunner] Could not load Stage-2 system prompt from ${promptPath}.\n` +
      `Ensure prompts/stage2_circuit_config_writer.txt exists.\n` +
      `Original error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ---------------------------------------------------------------------------
// Load the fallback config for a concept
// ---------------------------------------------------------------------------

async function loadFallbackConfig(conceptId: string): Promise<CircuitSimulationConfig | null> {
  const fallbackPath = path.join(
    process.cwd(),
    "src", "data", "physics_constants",
    `${conceptId}_fallback.json`
  );
  try {
    const raw = await fs.readFile(fallbackPath, "utf-8");
    return JSON.parse(raw) as CircuitSimulationConfig;
  } catch {
    console.warn(
      `[CircuitSimRunner] No fallback config at ${fallbackPath}. ` +
      `Create src/lib/physics_constants/${conceptId}_fallback.json to enable fallback.`
    );
    return null;
  }
}

// ---------------------------------------------------------------------------
// Strip markdown fences that Sonnet sometimes adds despite instructions
// ---------------------------------------------------------------------------

function stripFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/,           "")
    .trim();
}

// ---------------------------------------------------------------------------
// STEP 2: Build user message
// ---------------------------------------------------------------------------

function buildUserMessage(
  context: StudentContext,
  fingerprint?: QuestionFingerprint,
): string {
  const conceptId = fingerprint?.concept_id ?? context.concept ?? "unknown";
  const confusion  = context.confusionPoint ?? fingerprint?.aspect ?? "none identified";
  const examTarget = examLabel(context.mode ?? fingerprint?.intent ?? "conceptual");
  const classLevel = context.classLevel ?? fingerprint?.class_level ?? "12";
  const topology   = topologyHint(conceptId);

  const wireHint = topology === "wire"
    ? "\nRenderer hint: draw a single continuous uniform wire A→C with a sliding jockey; show_jockey=true; show_galvanometer=true; wire labels: A (left), C (right); jockey position changes per state to find balance point"
    : "";

  return (
    `Concept: ${conceptId}\n` +
    `Student confusion: ${confusion}\n` +
    `Exam target: ${examTarget}\n` +
    `Class level: ${classLevel}\n` +
    `Topology hint: ${topology}` +
    wireHint
  );
}

// ---------------------------------------------------------------------------
// STEP 3 + 4: Call Sonnet, parse, validate, retry
// ---------------------------------------------------------------------------

async function callSonnetWithRetry(
  client: Anthropic,
  systemPrompt: string,
  userMessage: string,
): Promise<{ config: CircuitSimulationConfig; attempts: number; validationErrors: string[] }> {
  let lastErrors: string[] = [];

  for (let attempt = 1; attempt <= 2; attempt++) {
    const userContent =
      attempt === 1
        ? userMessage
        : userMessage +
          "\n\nPREVIOUS ATTEMPT FAILED PHYSICS VALIDATION. Fix these errors:\n" +
          lastErrors.map((e) => `- ${e}`).join("\n") +
          "\n\nOutput corrected JSON now. No markdown, no explanation.";

    // STEP 3 — call Sonnet
    let responseText: string;
    try {
      const message = await client.messages.create({
        model:      "claude-sonnet-4-6",
        max_tokens: 4096,
        system:     systemPrompt,
        messages:   [{ role: "user", content: userContent }],
      });
      responseText = (message.content[0] as { type: "text"; text: string }).text;
      console.log(`[CircuitSimRunner] Sonnet attempt ${attempt} received`);
    } catch (err) {
      lastErrors = [
        `Anthropic API call failed: ${err instanceof Error ? err.message : String(err)}`,
      ];
      console.error(`[CircuitSimRunner] Sonnet API error (attempt ${attempt}):`, err);
      continue;
    }

    // Parse JSON
    let parsed: CircuitSimulationConfig;
    try {
      parsed = JSON.parse(stripFences(responseText)) as CircuitSimulationConfig;
    } catch (parseErr) {
      lastErrors = ["Response was not valid JSON. Output ONLY the JSON object, no markdown."];
      console.warn(`[CircuitSimRunner] JSON parse failed (attempt ${attempt}):`, parseErr);
      continue;
    }

    // STEP 4 — validate
    const result: CircuitValidationResult = validatePhysics(parsed);

    if (result.valid) {
      console.log(`[CircuitSimRunner] Validation passed on attempt ${attempt}`);
      return { config: parsed, attempts: attempt, validationErrors: [] };
    }

    lastErrors = result.errors;
    console.warn(`[CircuitSimRunner] Validation failed (attempt ${attempt}):`, result.errors);
  }

  // Both attempts failed
  return {
    config:           null as unknown as CircuitSimulationConfig, // caller checks fallback
    attempts:         2,
    validationErrors: lastErrors,
  };
}

// ---------------------------------------------------------------------------
// STEP 5: Cache in Supabase simulation_cache
// ---------------------------------------------------------------------------

async function cacheConfig(
  cacheKey:  string,
  config:    CircuitSimulationConfig,
  conceptId: string,
  classLevel: string,
  mode:      string,
): Promise<void> {
  if (!conceptId) {
    console.warn("[CircuitSimRunner] Skipping cache write — conceptId is empty (concept_key NOT NULL constraint would fail)");
    return;
  }
  try {
    const { error } = await supabaseAdmin
      .from("simulation_cache")
      .upsert(
        {
          fingerprint_key: cacheKey,
          concept_key:     conceptId,   // FIX: was missing, caused NOT NULL constraint error
          concept_id:      conceptId,
          class_level:     classLevel,
          mode,
          // Store the circuit config as the physics_config column
          // (circuit sims don't use physics_config in the old sense —
          //  we store the full SimulationConfig JSON here)
          physics_config:  config as unknown as Record<string, unknown>,
          sim_html:        null,  // circuit_live_renderer reads config directly
          engine:          "circuit_live",
          served_count:    0,
        },
        { onConflict: "fingerprint_key" }
      );
    if (error) {
      console.warn("[CircuitSimRunner] Supabase cache write failed:", error.message);
    } else {
      console.log(`[CircuitSimRunner] Cached config for key: ${cacheKey}`);
    }
  } catch (err) {
    console.warn("[CircuitSimRunner] Supabase cache error:", err);
  }
}

// ---------------------------------------------------------------------------
// Attempt to load a cached config from Supabase
// ---------------------------------------------------------------------------

async function loadCachedConfig(
  cacheKey: string,
): Promise<CircuitSimulationConfig | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("simulation_cache")
      .select("physics_config")
      .eq("fingerprint_key", cacheKey)
      .eq("engine", "circuit_live")
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.warn("[CircuitSimRunner] Cache read error:", error.message);
      return null;
    }

    if (data?.physics_config) {
      // Bump served_count asynchronously
      void supabaseAdmin
        .from("simulation_cache")
        .update({ served_count: supabaseAdmin.rpc as unknown as number })
        .eq("fingerprint_key", cacheKey);

      return data.physics_config as unknown as CircuitSimulationConfig;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// generateCircuitSimConfig — main export
// ---------------------------------------------------------------------------

/**
 * Generate and cache a validated SimulationConfig for the circuit_live_renderer.
 *
 * Orchestrates:
 *   1. Cache lookup (Supabase simulation_cache, engine=circuit_live)
 *   2. Loading the Stage-2 system prompt from prompts/stage2_circuit_config_writer.txt
 *   3. Building the user message from StudentContext + fingerprint
 *   4. Calling Claude Sonnet 4.6 (up to 2 attempts)
 *   5. Physics validation via src/lib/physicsValidator.ts
 *   6. Falling back to src/lib/physics_constants/{concept_id}_fallback.json
 *   7. Caching the validated config in Supabase simulation_cache
 *
 * Never throws on generation or validation failure — always returns a result.
 * Only throws if the prompt file cannot be loaded.
 *
 * @param context      Student context from the frontend.
 * @param fingerprint  Optional question fingerprint from intentClassifier.
 * @returns            CircuitSimResult with config + metadata.
 */
export async function generateCircuitSimConfig(
  context:      StudentContext,
  fingerprint?: QuestionFingerprint,
): Promise<CircuitSimResult> {
  const startTime = Date.now();

  const conceptId  = fingerprint?.concept_id ?? context.concept ?? "ohms_law";
  const classLevel = context.classLevel ?? fingerprint?.class_level ?? "12";
  const mode       = context.mode ?? "board";
  const intent     = fingerprint?.intent ?? "understand";
  const aspect     = fingerprint?.aspect ?? "general";

  const cacheKey = buildCacheKey(conceptId, intent, aspect, classLevel, mode);
  console.log(`[CircuitSimRunner] Starting for concept="${conceptId}" key="${cacheKey}"`);

  // ── Cache lookup ────────────────────────────────────────────────────────────
  const cached = await loadCachedConfig(cacheKey);
  if (cached) {
    console.log(`[CircuitSimRunner] CACHE HIT: ${cacheKey}`);
    logUsage({
      taskType:   "circuit_sim_generation",
      provider:   "cache",
      model:      "simulation_cache",
      inputChars: JSON.stringify(context).length,
      outputChars: JSON.stringify(cached).length,
      latencyMs:  Date.now() - startTime,
      estimatedCostUsd: 0,
      wasCacheHit: true,
      fingerprintKey: cacheKey,
    });
    return {
      config:           cached,
      fromCache:        true,
      attempts:         0,
      validationErrors: [],
      cacheKey,
    };
  }

  // ── STEP 1: Load system prompt ──────────────────────────────────────────────
  const systemPrompt = await loadSystemPrompt();

  // ── STEP 2: Build user message ──────────────────────────────────────────────
  const userMessage = buildUserMessage(context, fingerprint);
  console.log("[CircuitSimRunner] User message:\n" + userMessage);

  // ── STEPS 3 + 4: Generate and validate ─────────────────────────────────────
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const { config: generatedConfig, attempts, validationErrors } =
    await callSonnetWithRetry(client, systemPrompt, userMessage);

  // ── STEP 4 continued: Fallback if both attempts failed ──────────────────────
  let finalConfig = generatedConfig;
  let finalErrors = validationErrors;

  if (!finalConfig) {
    console.warn(`[CircuitSimRunner] Both Sonnet attempts failed. Loading fallback for "${conceptId}"`);
    const fallback = await loadFallbackConfig(conceptId);
    if (fallback) {
      finalConfig = fallback;
      finalErrors = validationErrors; // preserve the errors for logging
    } else {
      // No fallback file — return a minimal safe config so the page doesn't crash
      console.error(`[CircuitSimRunner] No fallback available for "${conceptId}". Returning minimal config.`);
      finalConfig = buildMinimalFallback(conceptId, classLevel);
      finalErrors = validationErrors;
    }
  }

  // ── STEP 5: Cache + log ─────────────────────────────────────────────────────
  await cacheConfig(cacheKey, finalConfig, conceptId, classLevel, mode);

  logUsage({
    taskType:   "circuit_sim_generation",
    provider:   "anthropic",
    model:      "claude-sonnet-4-6",
    inputChars: systemPrompt.length + userMessage.length,
    outputChars: JSON.stringify(finalConfig).length,
    latencyMs:  Date.now() - startTime,
    estimatedCostUsd:
      ((systemPrompt.length + userMessage.length) / 1_000_000 * 3.0) +
      (JSON.stringify(finalConfig).length / 1_000_000 * 15.0),
    wasCacheHit: false,
    fingerprintKey: cacheKey,
    metadata: { attempts, validationErrors: finalErrors.length },
  });

  return {
    config:           finalConfig,
    fromCache:        false,
    attempts,
    validationErrors: finalErrors,
    cacheKey,
  };
}

// ---------------------------------------------------------------------------
// Minimal hardcoded fallback — used only when both Sonnet AND the JSON
// fallback file are unavailable.
// ---------------------------------------------------------------------------

function buildMinimalFallback(conceptId: string, classLevel: string): CircuitSimulationConfig {
  return {
    circuit: {
      topology: "series",
      nodes: ["A", "B", "C", "D"],
      components: [
        { id: "bat1",  type: "battery",  from: "A", to: "B", label: "6 V",  value: 6  },
        { id: "R1",    type: "resistor", from: "B", to: "C", label: "4 Ω",  value: 4  },
        { id: "w1",    type: "wire",     from: "C", to: "D"                           },
        { id: "w2",    type: "wire",     from: "D", to: "A"                           },
      ],
    },
    states: {
      STATE_1: {
        current_flowing: false,
        caption: `${conceptId} — circuit overview (Class ${classLevel})`,
        visible_components: null,
        spotlight: null,
        show_values: false,
        show_voltage_drops: false,
        slider_active: false,
      },
      STATE_2: {
        current_flowing: true,
        caption: "Current flows through the circuit",
        visible_components: null,
        spotlight: "bat1",
        show_values: false,
        show_voltage_drops: false,
        slider_active: false,
        current_values: { R1: 1.5, w1: 1.5, w2: 1.5 },
      },
      STATE_3: {
        current_flowing: true,
        caption: "V = IR: voltage 6 V ÷ resistance 4 Ω = current 1.5 A",
        visible_components: null,
        spotlight: "R1",
        show_values: true,
        show_voltage_drops: true,
        slider_active: false,
        current_values: { R1: 1.5, w1: 1.5, w2: 1.5 },
        voltage_drops:  { R1: 6.0 },
      },
      STATE_4: {
        current_flowing: true,
        caption: "Try changing the voltage — watch how current responds!",
        visible_components: null,
        spotlight: null,
        show_values: true,
        show_voltage_drops: false,
        slider_active: true,
        slider_variable: "V",
        slider_min: 1,
        slider_max: 12,
        slider_default: 6,
        current_values: { R1: 1.5, w1: 1.5, w2: 1.5 },
      },
    },
  };
}
