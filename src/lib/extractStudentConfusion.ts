import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export interface StudentConfusionExtraction {
    student_belief: string;
    actual_physics: string;
    gap_description: string;
    simulation_emphasis: string;
    misconception_confirmed: boolean;
    confidence_score: number;
    needs_quality_check?: boolean;
    ask_clarification?: boolean;
}

const ConfusionSchema = z.object({
    student_belief: z.string().describe("What the student currently thinks is happening. Be specific."),
    actual_physics: z.string().describe("What NCERT and physics actually says about this. One clear sentence."),
    gap_description: z.string().describe("The exact conceptual gap between student_belief and actual_physics. Name the misconception precisely."),
    simulation_emphasis: z.string().describe("The ONE thing the simulation must visually show to fix this specific confusion. This becomes the PRIMARY directive for the simulation config writer."),
    misconception_confirmed: z.boolean().describe("true if this matches a known physics misconception pattern, false otherwise."),
    // Claude API does not support min/max constraints on number
    // type in output schemas. Validate range in application logic.
    confidence_score: z.number().describe("0.0 to 1.0. How certain are you about this extraction. Be conservative — if the student was vague, score low."),
});

const SONNET_PROMPT = `You are a physics education expert analyzing what a student 
is confused about.

You receive:
- What the student said or typed (may include Hinglish)
- A description of the image they uploaded (if any)
- The concept identified
- Relevant NCERT paragraphs

Your job is to reason carefully and output a JSON object 
with these exact fields:

student_belief: What the student currently thinks is 
happening. Be specific. Not "student is confused about 
current" but "student believes current gets used up 
after passing through each resistor, like water being 
absorbed by a sponge."

actual_physics: What NCERT and physics actually says 
about this. One clear sentence grounded in the NCERT 
chunks provided.

gap_description: The exact conceptual gap between 
student_belief and actual_physics. Name the 
misconception precisely.

simulation_emphasis: The ONE thing the simulation must 
visually show to fix this specific confusion. This 
becomes the PRIMARY directive for the simulation config 
writer. Be specific: not "show current flow" but "show 
a numerical counter at each resistor displaying the 
same current value — before, through, and after every 
resistor."

misconception_confirmed: true if this matches a known 
physics misconception pattern, false otherwise.

confidence_score: 0.0 to 1.0. How certain are you 
about this extraction. Be conservative — if the student 
was vague, score low.

MARKED AREA REASONING:
The user message may contain a "MARKED REGION:" line showing what the student 
physically pointed at in their image.

If MARKED REGION is present and non-empty:
- This is your PRIMARY confusion anchor — the student told you exactly what 
  confused them by pointing at it
- student_belief must be specifically about the marked element, not the 
  concept in general
- Ask yourself: what is the most common wrong belief a student has about 
  THIS specific formula / sentence / component?
- Increase confidence_score by 0.08 (capped at 0.97) — marked region is 
  strong signal
  
Example reasoning for "Student circled formula T = 2π√(L/g)":
- The most common confusion about this formula is that mass m is absent
- student_belief: "student expects mass to appear in the formula because 
  heavier objects should swing differently"
- simulation_emphasis: "show two pendulums identical L, very different mass, 
  swinging in perfect synchrony — T label identical above both"

If MARKED REGION is absent or empty:
- Use student confusion text as primary anchor  
- If text is also vague, infer most common misconception for this concept_id
- Set confidence_score conservatively (0.55–0.75) to reflect inference

Return ONLY valid JSON. No explanation text.`;

export async function extractStudentConfusion(
    input: {
        student_confusion_text: string;
        image_description: string;
        concept_id: string;
        ncert_chunks: string[];
        marked_region_description?: string;
    },
): Promise<StudentConfusionExtraction> {
    
    // Format NCERT chunks
    const ncertContext = input.ncert_chunks.length > 0 
        ? input.ncert_chunks.join("\\n\\n") 
        : "(No NCERT content provided)";

    // Format marked region if present
    const markedContext = input.marked_region_description 
        ? `\\nMARKED REGION: ${input.marked_region_description}`
        : "";

    // Build the user input
    const userPrompt = `
STUDENT TEXT: ${input.student_confusion_text}
IMAGE DESCRIPTION: ${input.image_description || "None"}${markedContext}
CONCEPT: ${input.concept_id}

NCERT CONTENT:
${ncertContext}
`;

    try {
        const { object } = await generateObject({
            model: anthropic("claude-sonnet-4-6"),
            system: SONNET_PROMPT,
            prompt: userPrompt,
            schema: ConfusionSchema,
            maxOutputTokens: 400,
        });

        console.log('[confusionExtractor] tokens used, max: 400');

        const result: StudentConfusionExtraction = {
            student_belief: object.student_belief,
            actual_physics: object.actual_physics,
            gap_description: object.gap_description,
            simulation_emphasis: object.simulation_emphasis,
            misconception_confirmed: object.misconception_confirmed,
            confidence_score: Math.max(0, Math.min(1, object.confidence_score)),
        };

        // Apply confidence boost when marked area provides a precise anchor
        if (input.marked_region_description && input.marked_region_description.trim().length > 10) {
            result.confidence_score = Math.min(0.97, result.confidence_score + 0.08);
        }

        // ── CONFIDENCE GATE ──
        if (result.confidence_score > 0.85) {
            // High confidence, proceed normally
        } else if (result.confidence_score >= 0.60) {
            // Medium confidence, flag for manual review but proceed
            result.needs_quality_check = true;
        } else {
            // Low confidence, immediately halt and ask for clarification
            result.ask_clarification = true;
        }

        // DB write is handled by the caller (route.ts) via UPSERT.
        // extractStudentConfusion() is a pure extraction function — no DB side-effects.

        return result;
    } catch (err: any) {
        console.error("[extractStudentConfusion] Error:", err.message);
        // Fallback safety net
        return {
            student_belief: "Unknown",
            actual_physics: "Unknown",
            gap_description: "Unknown",
            simulation_emphasis: "Standard simulation",
            misconception_confirmed: false,
            confidence_score: 0,
            ask_clarification: true // Default to halting if extraction fails completely
        };
    }
}
