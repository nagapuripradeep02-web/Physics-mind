// =============================================================================
// src/scripts/testStage2.ts
//
// One-time end-to-end test for the Stage 2 pipeline.
// Calls runStage2 with a real SimulationStrategy, prints a summary,
// then runs validatePhysics on the returned config one more time
// so you can verify the result is always safe to hand to the renderer.
//
// Prerequisites:
//   ANTHROPIC_API_KEY must be set in .env.local (or your shell env)
//
// Run:
//   npm run test:stage2
// =============================================================================

import "dotenv/config"; // load .env.local into process.env before anything else

import { runStage2 } from "../lib/simulation/stage2Runner";
import type { SimulationStrategy } from "../lib/simulation/stage2Prompt";
import { validatePhysics, STANDARD_CONSTANTS } from "../lib/simulation/physicsValidator";
import type { SimulationConfig } from "../lib/simulation/rendererSchema";

// ---------------------------------------------------------------------------
// Test strategy — JEE student, intermediate vocabulary, formula anchor on
// ---------------------------------------------------------------------------

const testStrategy: SimulationStrategy = {
  renderer:              "particle_field",
  aha_moment:            "electrons drift at 1mm/s — 10^9 times slower than thermal speed",
  target_misconception:  "electrons_travel_at_light_speed",
  analogy_to_use:        "railway station at rush hour — everyone moving, no one going anywhere",
  emphasis_states:       ["STATE_3"],
  exam_target:           "jee",
  vocabulary_level:      "intermediate",
  formula_anchor:        true,
  skip_state_1:          false,
};

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Stage 2 Test ===\n");

  try {
    const result = await runStage2(testStrategy, "drift_velocity");

    console.log(`Attempts used: ${result.attempts}`);
    console.log(`Validation errors: ${result.validationErrors.length}`);

    if (result.validationErrors.length > 0) {
      console.log("⚠️  Used fallback config. Errors were:");
      result.validationErrors.forEach((e) => console.log("  -", e));
    } else {
      console.log("✅ Sonnet config passed validation\n");
    }

    console.log("--- Config Summary ---");
    console.log("renderer:                  ", result.config.renderer);
    console.log("electron_drift_direction:  ", result.config.electron_drift_direction);
    console.log("field_arrow_direction:     ", result.config.field_arrow_direction);
    console.log("thermal_speed:             ", result.config.particles.thermal_speed);
    console.log("STATE_1 drift_speed:       ", result.config.states.STATE_1.drift_speed);
    console.log("STATE_2 drift_speed:       ", result.config.states.STATE_2.drift_speed);
    console.log("STATE_3 highlight_particle:", result.config.states.STATE_3.highlight_particle);
    console.log("STATE_3 caption:           ", result.config.states.STATE_3.caption);
    console.log("formula_anchor present:    ", !!result.config.formula_anchor);

    if (result.config.formula_anchor) {
      console.log("formula_string:            ", result.config.formula_anchor.formula_string);
      console.log(
        "STATE_2 highlights:        ",
        result.config.formula_anchor.state_highlights?.STATE_2,
      );
      console.log(
        "STATE_3 highlights:        ",
        result.config.formula_anchor.state_highlights?.STATE_3,
      );
    }

    console.log("\n--- Full Config (for inspection) ---");
    console.log(JSON.stringify(result.config, null, 2));

    // ── Re-run validatePhysics on the returned config ──────────────────────
    // This gives a clean final verdict independent of the internal retry loop.
    const recheck = validatePhysics(result.config as unknown as SimulationConfig, STANDARD_CONSTANTS);
    console.log("\n--- Validator Recheck ---");
    console.log("valid:", recheck.valid);
    if (!recheck.valid) {
      console.log("errors:", recheck.errors);
    }
  } catch (err) {
    console.error("❌ Test failed with exception:", err);
    process.exit(1);
  }
}

main();
