// Task 2b Console Gate Test — run with: npx tsx test-sim-pipeline.mts
import { generateSimulationBrief, generatePhysicsConfig } from "./src/lib/aiSimulationGenerator.js";

const ctx = {
    question: "why do electrons move so slowly even when current is fast?",
    concept: "drift velocity",
    classLevel: "12",
    mode: "conceptual",
    confusionPoint: "Student can't reconcile slow drift speed (~0.1 mm/s) with instant light switches",
};

console.log("🚀 STAGE 1: Calling gemini-2.5-flash for SimulationBrief...\n");
const brief = await generateSimulationBrief(ctx);

console.log("\n========== SIMULATION BRIEF ==========");
console.log(JSON.stringify(brief, null, 2));

console.log("\n🚀 STAGE 2: Calling gemini-2.5-pro for PhysicsConfig...\n");
const config = await generatePhysicsConfig(brief);

console.log("\n========== PHYSICS CONFIG ==========");
console.log(JSON.stringify(config, null, 2));

console.log("\n========== SUMMARY ==========");
console.log("Engine:      ", config.engine);
console.log("Objects:     ", config.objects.length);
console.log("Controls:    ", config.controls.length);
console.log("Annotations: ", config.annotations.length);
console.log("Equations:   ", config.equations.length);
console.log("Brief viz:   ", brief.visualization_type);
console.log("Confusion:   ", brief.student_confusion);
console.log("Equations in brief: ", brief.physics_equations);
