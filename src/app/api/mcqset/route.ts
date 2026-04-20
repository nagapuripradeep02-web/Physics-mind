import { selectModel, estimateCost } from "@/lib/modelRouter";
import { dispatchGenerate } from "@/lib/dispatcher";
import { logUsage } from "@/lib/usageLogger";

export async function POST(req: Request) {
    const startTime = Date.now();
    try {
        const { module: moduleName, examMode, studentClass, board, selectedExam, conceptual } = await req.json();

        // Derive the effective exam label
        const examLabel = selectedExam || (examMode === "JEE" ? "JEE Main" : `${board} Board`);

        // Exam-specific style hints
        const examHints: Record<string, string> = {
            "JEE Main": "Single correct MCQ. Mix of conceptual and numerical. Marking: +4, -1. Typical JEE Main difficulty.",
            "JEE Advanced": "May include multiple correct or integer type hints. High difficulty. Tricky options. Marking: +4, -2.",
            "NEET": "Single correct. Biology context if relevant. Moderate difficulty, application-based. Marking: +4, 0.",
            "MHT-CET": "Single correct. Maharashtra curriculum focus. Moderate difficulty. No negative marking.",
            "TS EAMCET": "Single correct. Application-based at moderate difficulty. Telangana syllabus. No negative marking.",
            "AP EAMCET": "Single correct. Similar to JEE Main but slightly easier. Andhra Pradesh syllabus.",
            "WBJEE": "Single correct. West Bengal. Moderate difficulty. +1, -0.25 marking.",
            "KCET": "Single correct. Karnataka. Moderate. No negative marking.",
            "COMEDK": "Single correct. Karnataka engineering. Moderate.",
            "BITSAT": "Single correct. Fast-paced. More questions, less time. No negative marking for skipped.",
            "VITEEE": "Single correct. Moderate. No negative marking.",
        };
        const styleHint = examHints[examLabel] ?? `Single correct. Match the difficulty and style of ${examLabel}.`;

        const prompt = conceptual
            ? `You are an expert physics teacher. Generate 5 MCQs to test CONCEPTUAL UNDERSTANDING of "${moduleName}".

These questions test if the student TRULY UNDERSTANDS the concept, NOT just memorization or calculation.
Difficulty scale — Q1: easy, Q2: easy, Q3: easy-medium, Q4: medium, Q5: hard.

Return a JSON array ONLY (no other text, no markdown):
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Clear 2-line explanation of why this is correct and why others are wrong",
    "difficulty": "easy"
  }
]`
            : `You are an expert in Indian engineering and medical entrance exams. Generate exactly 5 MCQs for ${examLabel} on "${moduleName}".

Match EXACTLY:
- The difficulty level of ${examLabel}
- The question style and pattern of ${examLabel}
- Style guide: ${styleHint}

Return ONLY a JSON array (no markdown, no code fences):
[
  {
    "question": "Question text",
    "options": ["A text", "B text", "C text", "D text"],
    "correctIndex": 0,
    "explanation": "Key insight, trap to avoid, and step-by-step if numerical",
    "difficulty": "easy|medium|hard",
    "marks": "+4, -1",
    "exam_tip": "One-line tip for this type of question in ${examLabel}"
  }
]

Rules:
- correctIndex is 0-indexed (0=A, 1=B, 2=C, 3=D)
- Make wrong options plausible (common mistake values/concepts)
- Return ONLY the JSON array, nothing else`;


        const config = selectModel("mcq_generation");
        const { text, outputChars } = await dispatchGenerate(config, "", prompt, 2000);

        logUsage({
            taskType: "mcq_generation",
            provider: config.provider,
            model: config.model,
            estimatedCostUsd: estimateCost(config, prompt.length, outputChars),
            inputChars: prompt.length,
            outputChars: outputChars,
            latencyMs: Date.now() - startTime,
            wasCacheHit: false,
        });

        function safeParseMCQ(raw: string) {
            // Attempt 1: clean parse
            try {
                const clean = raw.replace(/```json|```/g, "").trim();
                return JSON.parse(clean);
            } catch {}

            // Attempt 2: salvage complete objects
            // Find the last complete MCQ object before truncation
            try {
                const match = raw.match(/([\s\S]*\}\s*\,\]?)/);
                if (match) {
                    const salvaged = match[1] + "]}";
                    return JSON.parse(salvaged);
                }
            } catch {}

            // Attempt 3: extract individual MCQ objects
            try {
                const objects = [...raw.matchAll(/\{[^{}]*"question"[^{}]*\}/g)];
                if (objects.length > 0) {
                    return objects.map(m => JSON.parse(m[0]));
                }
            } catch {}

            return null;
        }

        const questions = safeParseMCQ(text);
        if (!questions) {
            return Response.json({ error: "MCQ generation failed" }, { status: 500 });
        }

        return Response.json({ questions: questions.questions ? questions.questions : questions });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("MCQ set error:", message);
        return Response.json({ error: message }, { status: 500 });
    }
}
