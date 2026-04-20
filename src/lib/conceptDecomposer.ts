import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export type RendererType =
    | "particle_field"
    | "circuit_live"
    | "graph_interactive"
    | "wave_canvas"
    | "mechanics_2d"
    | "field_3d"
    | null;

export type SimulationStrategy =
    | "show_primary_first_then_connections"
    | "show_all_simultaneously"
    | "show_comparison";

export interface ConceptDecomposition {
    primary_concept: string;
    supporting_concepts: string[];
    student_stuck_on: string;
    simulation_strategy: SimulationStrategy;
    dual_panel_needed: boolean;
    panel_count: 1 | 2 | 3;
    panel_a_renderer: RendererType;
    panel_b_renderer: RendererType;
    panel_c_renderer: RendererType;
    reasoning: string;
    multiple_concepts_detected: boolean;
    detected_concepts: string[];
}

const DecompositionSchema = z.object({
    primary_concept: z.string(),
    supporting_concepts: z.array(z.string()),
    student_stuck_on: z.string(),
    simulation_strategy: z.enum([
        "show_primary_first_then_connections",
        "show_all_simultaneously",
        "show_comparison",
    ]),
    dual_panel_needed: z.boolean(),
    panel_count: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    panel_a_renderer: z
        .enum(["particle_field", "circuit_live", "graph_interactive", "wave_canvas", "mechanics_2d", "field_3d"])
        .nullable(),
    panel_b_renderer: z
        .enum(["particle_field", "circuit_live", "graph_interactive", "wave_canvas", "mechanics_2d", "field_3d"])
        .nullable(),
    panel_c_renderer: z
        .enum(["particle_field", "circuit_live", "graph_interactive", "wave_canvas", "mechanics_2d", "field_3d"])
        .nullable(),
    reasoning: z.string(),
    multiple_concepts_detected: z.boolean(),
    detected_concepts: z.array(z.string()),
});

export async function decomposeConceptFromProblem(input: {
    imageDescription: string;
    studentConfusionText: string;
    extractedEquations: string[];
    conceptId: string;
}): Promise<ConceptDecomposition> {
    const templatePath = path.join(process.cwd(), "src/prompts/concept_decomposer.txt");
    const promptTemplate = await fs.readFile(templatePath, "utf-8");

    const prompt = promptTemplate
        .replace("{{imageDescription}}", input.imageDescription)
        .replace("{{studentConfusionText}}", input.studentConfusionText)
        .replace("{{extractedEquations}}", JSON.stringify(input.extractedEquations))
        .replace("{{conceptId}}", input.conceptId);

    try {
        const { object } = await generateObject({
            model: anthropic("claude-sonnet-4-6"),
            prompt,
            schema: DecompositionSchema,
        });

        return object as ConceptDecomposition;
    } catch (err: any) {
        console.error("[conceptDecomposer] Error:", err.message);
        return {
            primary_concept: input.conceptId,
            supporting_concepts: [],
            student_stuck_on: input.conceptId,
            simulation_strategy: "show_primary_first_then_connections",
            dual_panel_needed: false,
            panel_count: 1,
            panel_a_renderer: "particle_field",
            panel_b_renderer: null,
            panel_c_renderer: null,
            reasoning: "Fallback: concept decomposition failed.",
            multiple_concepts_detected: false,
            detected_concepts: [input.conceptId],
        };
    }
}
