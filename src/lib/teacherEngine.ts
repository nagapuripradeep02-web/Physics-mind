/**
 * Teacher Engine — generates lessons and explanations grounded in NCERT content.
 *
 * Exports:
 *   generateLesson()      → structured Lesson JSON for TeacherPlayer / simulations
 *   explainConceptual()   → text explanation + NCERT sources (conceptual mode)
 *   explainBoardExam()    → text explanation + NCERT sources (board exam mode)
 *   explainCompetitive()  → text explanation + NCERT sources (JEE/NEET mode)
 *   diagnoseError()       → traces student steps and identifies exact point of failure
 */

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { QuestionFingerprint } from "@/lib/intentClassifier";
import { logUsage } from "@/lib/usageLogger";
import { searchNCERT, type NCERTChunk } from "@/lib/ncertSearch";
import { extractNCERTSearchQuery } from "@/lib/ncertQueryExtractor";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeachingStep {
    id: string;
    text: string;
    sim_action:
    | "highlight_formula"
    | "animate"
    | "highlight_value"
    | "show_label"
    | "pause";
    sim_target: string;
    sim_state: Record<string, number | string>;
    pause_ms: number;
}

export interface Lesson {
    teaching_script: TeachingStep[];
    key_insight: string;
    jee_trap: string;
    interactive_prompt: string;
    sim_type: string;
    sim_config: Record<string, number | string>;
}

/** Returned to the UI for the NCERTSourcesWidget */
export interface NCERTSource {
    chapter_name: string;
    section_name: string | null;
    class_level: string;
    similarity: number;
    snippet: string; // first 250 chars of content_text (UI display)
    content_text: string; // full text for session caching
}

/** Return type for the 3 explain functions */
export interface ExplainResult {
    explanation: string;
    ncertSources: NCERTSource[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Trims a text chunk to a maximum of 1200 characters, attempting to break at a sentence boundary.
 * Never truncates mid-sentence if a nearby boundary exists.
 */
export function trimNcertChunk(text: string): string {
    const MAX_CHARS = 1200;
    if (text.length <= MAX_CHARS) return text;

    const truncated = text.substring(0, MAX_CHARS);
    
    // Look for last sentence boundary before the limit (.), (!) or (?) followed by space or end
    const lastBoundaryIndex = Math.max(
        truncated.lastIndexOf('. '),
        truncated.lastIndexOf('! '),
        truncated.lastIndexOf('? ')
    );

    if (lastBoundaryIndex > 0) {
        // Keep the punctuation mark, drop the space
        return truncated.substring(0, lastBoundaryIndex + 1);
    }
    
    // Fallback: hard cut if no boundary found (e.g., extremely long sentence or no punctuation)
    return truncated;
}

/** Format NCERT chunks into a readable context block for Gemini */
function formatNCERTContext(chunks: NCERTChunk[]): string {
    if (!chunks.length) {
        return "(No NCERT content found — use standard Class 10-12 curriculum knowledge)";
    }
    return chunks
        .map((c, i) => {
            const location = c.section_name
                ? `${c.chapter_name} › ${c.section_name}`
                : c.chapter_name;
            const pct = (c.similarity * 100).toFixed(0);
            const trimmedText = trimNcertChunk(c.content_text).trim();
            return `[Source ${i + 1} | ${location} | Class ${c.class_level} | ${pct}% match]\n${trimmedText}`;
        })
        .join("\n\n---\n\n");
}

/** Convert raw chunks to UI-ready NCERTSource objects */
function chunksToSources(chunks: NCERTChunk[]): NCERTSource[] {
    return chunks.map((c) => ({
        chapter_name: c.chapter_name,
        section_name: c.section_name,
        class_level: c.class_level,
        similarity: c.similarity,
        snippet: c.content_text.slice(0, 250),
        content_text: c.content_text,
    }));
}

function isValidLesson(obj: unknown): obj is Lesson {
    if (!obj || typeof obj !== "object") return false;
    const l = obj as Record<string, unknown>;
    if (!Array.isArray(l.teaching_script)) return false;
    if (l.teaching_script.length < 3 || l.teaching_script.length > 5)
        return false;
    if (typeof l.sim_type !== "string" || !l.sim_type.trim()) return false;
    return true;
}

// ─── Prompts — explain functions ──────────────────────────────────────────────

const CONCEPTUAL_PROMPT = `You are PhysicsMind — an AI physics teacher for Indian Class {CLASS} students.
Your goal is deep conceptual understanding. No exam pressure.

STUDENT QUESTION: {QUESTION}
CONCEPT: {CONCEPT_ID}
INTENT: {INTENT}

NCERT GROUNDING MATERIAL — use these as primary source:
{NCERT_CONTEXT}

Response structure:
1. A striking real-world analogy that makes the concept click intuitively
2. Bridge from the analogy to the actual physics
3. The equation or formula emerging naturally from the concept
4. An intuitive numerical example with real numbers
5. **The beautiful insight:** — one sentence they will never forget

Strict rules:
- Use the NCERT material above as your primary source
- If the provided chunks do NOT contain relevant information about the concept (wrong chapter, irrelevant content), IGNORE them and use your own physics knowledge to explain at Class {CLASS} level
- Never refuse to explain a standard physics concept. Always provide a complete, helpful explanation
- Use **bold** for key terms when first introduced
- FORBIDDEN: marks breakdown, JEE traps, exam references, "worth X marks"
- Language: clear, conversational, builds genuine curiosity`;

const BOARD_PROMPT = `You are PhysicsMind — an AI physics teacher for Indian Class {CLASS} CBSE Board Exam preparation.

STUDENT QUESTION: {QUESTION}
CONCEPT: {CONCEPT_ID}
NCERT CHAPTER: {NCERT_CHAPTER}

NCERT GROUNDING MATERIAL — use this exact language in your answer:
{NCERT_CONTEXT}

Mandatory response format:
1. **Definition** — use word-for-word NCERT language from the material above
2. **Formula** — state clearly with all symbols defined
3. **Step-by-step** — explanation or derivation if the question asks
4. **Board tip** — "This is a [X]-mark question. Examiner expects: [key points to include]"

Strict rules:
- Copy NCERT phrasing directly from the grounding material wherever possible
- If the provided chunks do NOT contain relevant information about the concept (wrong chapter, irrelevant content), IGNORE them and use your own physics knowledge at Class {CLASS} level
- Never refuse to explain a standard physics concept
- FORBIDDEN: JEE tricks, shortcuts, advanced edge cases, "JEE favourite", "NEET tip"
- REQUIRED: NCERT exact terminology, marks-oriented structure, CBSE board format`;

const COMPETITIVE_PROMPT = `You are PhysicsMind — an AI physics teacher for JEE/NEET competitive exam preparation, Class {CLASS}.
Student knows the basics. Skip definitions.

STUDENT QUESTION: {QUESTION}
CONCEPT: {CONCEPT_ID}
NCERT CHAPTER: {NCERT_CHAPTER}

NCERT GROUNDING MATERIAL — the curriculum foundation (go beyond basics, but stay accurate):
{NCERT_CONTEXT}

Mandatory response format:
1. **Core idea** — 2 lines maximum
2. **The Trap** — what 60% of JEE students get wrong on this concept
3. **The Shortcut** — fastest solution method for exam conditions
4. **Edge cases** — boundary conditions and special cases JEE loves to test
5. **JEE Difficulty**: Easy / Medium / Hard | Expected time: X min
6. **Practice problem** — one harder integer-type or multi-correct JEE-style question

Strict rules:
- Lead with the trap, not the definition
- Reference past JEE/NEET patterns when applicable
- If the provided chunks do NOT contain relevant information about the concept (wrong chapter, irrelevant content), IGNORE them and use your own physics knowledge
- Never refuse to explain a standard physics concept
- FORBIDDEN: basic definitions, marks breakdown, "worth X marks"
- REQUIRED: the trap, the shortcut, edge cases — the three things boards never teach`;

const ERROR_DIAGNOSIS_TEACHER_PROMPT = `You are PhysicsMind — an AI physics teacher for Indian Class {CLASS} students.

A student is trying to solve a problem and got the wrong answer or is stuck.
STUDENT QUESTION: {QUESTION}
CONCEPT: {CONCEPT_ID}
WHAT THEY DID (From Image/Text): {STUDENT_WORK}

Your job is NOT to re-explain the whole concept. Your job is to find the FIRST mistake they made and point it out gently.

Mandatory response format:
1. **Acknowledge** — "I see what you did there..."
2. **The exact mistake** — point out exactly which step, sign error, or assumption went wrong.
3. **The gentle nudge** — ask them a guiding question to help them fix that specific step.

Strict rules:
- Maximum 4 sentences.
- Do NOT give them the final correct answer straight away. Guide them.
- Be encouraging. 
- Use simple conversational English or Hinglish depending on their prompt language.`;

// ─── Prompt — generateLesson ──────────────────────────────────────────────────

const TEACHER_PROMPT = `You are PhysicsMind — an AI physics teacher for Indian Class 10-12 students.

A student asked: "{QUESTION}"
Mode: {MODE}
Class: {CLASS}

Teach this like a LIVE TEACHER who talks AND demonstrates simultaneously.

Output a JSON object with EXACTLY this structure:
{
  "teaching_script": [
    {
      "id": "step_1",
      "text": "Explanation text. Max 3 sentences. Use **bold** for key terms.",
      "sim_action": "highlight_formula",
      "sim_target": "resistance_formula",
      "sim_state": {},
      "pause_ms": 2500
    }
  ],
  "key_insight": "The one WOW moment. One sentence.",
  "jee_trap": "What exam setters do to trick students. One sentence.",
  "interactive_prompt": "What student should try next in the simulation.",
  "sim_type": "use_the_concept_name_here",
  "sim_config": {
    "initial_value_1": 1,
    "initial_value_2": 1
  }
}

STRICT RULES:
- 3 to 5 steps only. Never more, never fewer.
- Each step text MUST reference the visual: use "see the...", "notice...", or "watch as..."

CRITICAL RULE — sim_type field:
You MUST follow these rules exactly.

ONLY use "wire" when the concept is:
  resistivity, wire stretching, ρL/A formula,
  conductor length/area, drift velocity,
  resistance vs length, resistance vs area

ONLY use "circuit" when the concept is:
  KVL, KCL, Kirchhoff's laws,
  series resistors, parallel resistors,
  basic Ohm's law in a circuit with components,
  EMF with internal resistance in a circuit

For EVERYTHING ELSE:
  Return the actual concept name in snake_case.
  Examples:
  - capacitor → "capacitor_charging"
  - energy in capacitor → "capacitor_energy"
  - electric field → "electric_field_lines"
  - magnetic field → "magnetic_field_solenoid"
  - electromagnetic induction → "em_induction"
  - optics / lens → "ray_optics_refraction"
  - wave / interference → "wave_interference"
  - photoelectric effect → "photoelectric_effect"
  - semiconductor → "pn_junction"
  - projectile → "projectile_motion"
  - SHM → "simple_harmonic_motion"

NEVER return "circuit" for capacitors.
NEVER return "circuit" for electric fields.
NEVER return "none" — always name the concept.
When in doubt: return the concept in snake_case.
The sim_type value is used to generate the correct simulation. Be specific.

- sim_action values allowed: "highlight_formula" | "animate" | "highlight_value" | "show_label" | "pause"
- pause_ms: integer between 2000 and 4000
- sim_state: physics values AT this step (use {} if no change from previous step)
- For "wire" use sim_config keys: length (0.5-3.0), area (0.5-2.0), material (copper/iron/nichrome)
- For "circuit" use sim_config keys: emf (1-20), r1 (0.5-10), r2 (0.5-10)
- For capacitor concepts use sim_config keys: capacitance, voltage, charge
- For electric field use sim_config keys: charge_magnitude, distance
- For motion concepts use sim_config keys: angle, velocity, time
- For all others: pass initial physics values relevant to that concept
- sim_target values for "wire": "resistance_formula" | "wire_length" | "resistance_display" | "area_display"
- sim_target values for "circuit": "kvl_loop" | "emf_source" | "current_value" | "voltage_drop"
- Use ONLY NCERT Class {CLASS} concepts.

TEACHING MODE: {MODE}
CONCEPT (pre-classified): {CONCEPT_ID}
INTENT: {INTENT}
NCERT CHAPTER: {NCERT_CHAPTER}
ASPECT (if hypothetical): {ASPECT}
VARIABLES CHANGING: {VARIABLES}

NCERT GROUNDING MATERIAL (teach using these exact concepts and terminology):
{NCERT_CONTEXT}

{MVS_CONTEXT}

INTENT-BASED TEACHING RULES:
If intent = "understand": 4-5 steps, visual language, analogies, real-world connections
If intent = "derive": each step = one equation transformation; label steps mathematically
If intent = "hypothetical": Step 1 = base state, Step 2 = variable changes, Step 3 = new equilibrium
If intent = "define": 2 steps only — definition then formula; sim_type = "none" if just definition
If intent = "apply": Step 1 = list given values, Step 2-N = apply formula step by step, last step = box the answer
If intent = "compare": show both concepts in parallel steps; last step = comparison table

{MODE} = board:
- teaching_script: Use NCERT exact language, word for word
- Map each step to marks: "Step 1 = 1 mark: state the definition"
- key_insight: The definition the examiner wants to see
- jee_trap: Write "Board tip: [what to write to get full marks]"
- interactive_prompt: "Write this as your board exam answer"
- sim_type: prefer simple visual (wire or circuit)

{MODE} = jee:
- teaching_script: Skip basics, lead with the trap
- Step 1: "The trap 60% of students fall into..."
- Step 2: "Why the trap is wrong..."
- Step 3: "The shortcut: [fastest method]"
- key_insight: The n² rule, limiting case, or speed trick
- jee_trap: The SPECIFIC mistake that costs marks in JEE
- interactive_prompt: A harder JEE integer-type problem
- sim_type: Show the edge case or boundary condition

{MODE} = conceptual:
- Use analogies and build intuition
- teaching_script: Analogy → bridge → physics
- key_insight: The "wow" moment — why it MUST be true
- jee_trap: "Common misconception: [intuition trap]"
- interactive_prompt: "Change one variable and predict the outcome"

- Output ONLY the JSON object. No markdown fences. No explanation. No text before or after.

{SIM_VALUES}`;

// ─── Explain functions ────────────────────────────────────────────────────────

export async function explainConceptual(
    question: string,
    classLevel: string,
    fingerprint?: QuestionFingerprint,
    sourceType?: 'ncert' | 'non_ncert' | 'unknown',
    preloadedChunks?: NCERTChunk[]
): Promise<ExplainResult> {
    const startTime = Date.now();
    let chunks: NCERTChunk[];
    if (preloadedChunks && preloadedChunks.length > 0) {
        chunks = preloadedChunks;
        console.log('[pgvector] SKIPPED — using session cache');
    } else {
        // Always search — concept-first routing, source_type is metadata only
        const ncertQuery = fingerprint?.parse_failed ? question : fingerprint?.concept_id;
        chunks = await searchNCERT(extractNCERTSearchQuery(ncertQuery, question), classLevel, 3, fingerprint?.concept_id);
        console.log('[pgvector] ran search, got', chunks.length, 'chunks');
    }
    const ncertContext = formatNCERTContext(chunks);

    const prompt = CONCEPTUAL_PROMPT
        .replace("{QUESTION}", question)
        .replace("{CLASS}", classLevel)
        .replace("{CONCEPT_ID}", fingerprint?.concept_id ?? "general")
        .replace("{INTENT}", fingerprint?.intent ?? "understand")
        .replace("{NCERT_CONTEXT}", ncertContext);

    let text: string;
    try {
        const result = await generateText({
            model: google("gemini-2.5-flash"),
            prompt,
            temperature: 0.4,
        });
        text = result.text;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[TeacherEngine] explainConceptual failed:', msg);
        text = 'Explanation temporarily unavailable. Please try again.';
    }

    logUsage({
        taskType: "explain_conceptual",
        provider: "google",
        model: "gemini-2.5-flash",
        inputChars: prompt.length,
        outputChars: text.length,
        latencyMs: Date.now() - startTime,
        estimatedCostUsd: (prompt.length / 1_000_000 * 0.30) + (text.length / 1_000_000 * 2.50),
        wasCacheHit: false,
        fingerprintKey: fingerprint?.cache_key,
        metadata: { ncertChunks: chunks.length, mode: "conceptual" },
    });

    return { explanation: text, ncertSources: chunksToSources(chunks) };
}

export async function explainBoardExam(
    question: string,
    classLevel: string,
    fingerprint?: QuestionFingerprint,
    sourceType?: 'ncert' | 'non_ncert' | 'unknown',
    preloadedChunks?: NCERTChunk[]
): Promise<ExplainResult> {
    const startTime = Date.now();
    let chunks: NCERTChunk[];
    if (preloadedChunks && preloadedChunks.length > 0) {
        chunks = preloadedChunks;
        console.log('[pgvector] SKIPPED — using session cache');
    } else {
        // Always search — concept-first routing, source_type is metadata only
        const ncertQuery = fingerprint?.parse_failed ? question : fingerprint?.concept_id;
        chunks = await searchNCERT(extractNCERTSearchQuery(ncertQuery, question), classLevel, 3, fingerprint?.concept_id);
        console.log('[pgvector] ran search, got', chunks.length, 'chunks');
    }
    const ncertContext = formatNCERTContext(chunks);

    const prompt = BOARD_PROMPT
        .replace("{QUESTION}", question)
        .replace("{CLASS}", classLevel)
        .replace("{CONCEPT_ID}", fingerprint?.concept_id ?? "general")
        .replace("{NCERT_CHAPTER}", fingerprint?.ncert_chapter ?? "unknown")
        .replace("{NCERT_CONTEXT}", ncertContext);

    let text: string;
    try {
        const result = await generateText({
            model: google("gemini-2.5-flash"),
            prompt,
            temperature: 0.2,
        });
        text = result.text;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[TeacherEngine] explainBoardExam failed:', msg);
        text = 'Explanation temporarily unavailable. Please try again.';
    }

    logUsage({
        taskType: "explain_board",
        provider: "google",
        model: "gemini-2.5-flash",
        inputChars: prompt.length,
        outputChars: text.length,
        latencyMs: Date.now() - startTime,
        estimatedCostUsd: (prompt.length / 1_000_000 * 0.30) + (text.length / 1_000_000 * 2.50),
        wasCacheHit: false,
        fingerprintKey: fingerprint?.cache_key,
        metadata: { ncertChunks: chunks.length, mode: "board" },
    });

    return { explanation: text, ncertSources: chunksToSources(chunks) };
}

export async function explainCompetitive(
    question: string,
    classLevel: string,
    fingerprint?: QuestionFingerprint,
    sourceType?: 'ncert' | 'non_ncert' | 'unknown',
    preloadedChunks?: NCERTChunk[]
): Promise<ExplainResult> {
    const startTime = Date.now();
    let chunks: NCERTChunk[];
    if (preloadedChunks && preloadedChunks.length > 0) {
        chunks = preloadedChunks;
        console.log('[pgvector] SKIPPED — using session cache');
    } else {
        // Always search — concept-first routing, source_type is metadata only
        const ncertQuery = fingerprint?.parse_failed ? question : fingerprint?.concept_id;
        chunks = await searchNCERT(extractNCERTSearchQuery(ncertQuery, question), classLevel, 3, fingerprint?.concept_id);
        console.log('[pgvector] ran search, got', chunks.length, 'chunks');
    }
    const ncertContext = formatNCERTContext(chunks);

    const prompt = COMPETITIVE_PROMPT
        .replace("{QUESTION}", question)
        .replace("{CLASS}", classLevel)
        .replace("{CONCEPT_ID}", fingerprint?.concept_id ?? "general")
        .replace("{NCERT_CHAPTER}", fingerprint?.ncert_chapter ?? "unknown")
        .replace("{NCERT_CONTEXT}", ncertContext);

    let text: string;
    try {
        const result = await generateText({
            model: google("gemini-2.5-flash"),
            prompt,
            temperature: 0.3,
        });
        text = result.text;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[TeacherEngine] explainCompetitive failed:', msg);
        text = 'Explanation temporarily unavailable. Please try again.';
    }

    logUsage({
        taskType: "explain_competitive",
        provider: "google",
        model: "gemini-2.5-flash",
        inputChars: prompt.length,
        outputChars: text.length,
        latencyMs: Date.now() - startTime,
        estimatedCostUsd: (prompt.length / 1_000_000 * 0.30) + (text.length / 1_000_000 * 2.50),
        wasCacheHit: false,
        fingerprintKey: fingerprint?.cache_key,
        metadata: { ncertChunks: chunks.length, mode: "competitive" },
    });

    return { explanation: text, ncertSources: chunksToSources(chunks) };
}

export async function diagnoseError(
    question: string,
    classLevel: string,
    studentWorkDesc: string,
    conceptId?: string
): Promise<string> {
    const startTime = Date.now();
    
    const prompt = ERROR_DIAGNOSIS_TEACHER_PROMPT
        .replace("{QUESTION}", question)
        .replace("{CLASS}", classLevel)
        .replace("{CONCEPT_ID}", conceptId ?? "general")
        .replace("{STUDENT_WORK}", studentWorkDesc);

    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 300,
            temperature: 0.3,
            messages: [{ role: "user", content: prompt }],
        });
        
        const text = (message.content[0] as { type: "text"; text: string }).text;

        logUsage({
            taskType: "diagnose_error",
            provider: "anthropic",
            model: "claude-sonnet-4-6",
            inputChars: prompt.length,
            outputChars: text.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: (prompt.length / 1_000_000 * 3.0) + (text.length / 1_000_000 * 15.0),
            wasCacheHit: false,
        });

        return text.trim();
    } catch (err) {
        console.error("[TeacherEngine] error in diagnoseError:", err);
        return "I couldn't quite trace the error due to a system issue. Could you explain what you did step by step?";
    }
}

// ─── generateLesson (NCERT context now injected on cache miss) ─────────────────

export async function generateLesson(
    question: string,
    mode: string,
    classLevel: string,
    fingerprint?: QuestionFingerprint,
    mvsContext?: string,
    simulationValues?: string
): Promise<Lesson | null> {
    const startTime = Date.now();
    const normalized = question.toLowerCase().trim().replace(/\s+/g, " ");
    const fingerprintKey = fingerprint?.cache_key ?? null;

    // 1. Check lesson cache — fingerprint_key first, then legacy question_normalized+mode
    {
        let cached: { lesson_json: unknown; served_count: number } | null = null;
        let hitField: string | null = null;
        let hitValue: string | null = null;

        if (fingerprintKey) {
            const { data, error } = await supabaseAdmin
                .from("lesson_cache")
                .select("lesson_json, served_count")
                .eq("fingerprint_key", fingerprintKey)
                .maybeSingle();
            if (error && error.code !== "PGRST116") {
                console.warn("[TeacherEngine] fingerprint cache READ error:", error.message);
            }
            if (data?.lesson_json) { cached = data; hitField = "fingerprint_key"; hitValue = fingerprintKey; }
        }

        if (!cached) {
            const { data, error } = await supabaseAdmin
                .from("lesson_cache")
                .select("lesson_json, served_count")
                .eq("question_normalized", normalized)
                .eq("mode", mode)
                .gt("expires_at", new Date().toISOString())
                .maybeSingle();
            if (error && error.code !== "PGRST116") {
                console.warn("[TeacherEngine] cache READ error:", error.message);
            }
            if (data?.lesson_json) { cached = data; hitField = "question_normalized"; hitValue = normalized; }
        }

        if (cached?.lesson_json) {
            void supabaseAdmin
                .from("lesson_cache")
                .update({ served_count: (cached.served_count ?? 0) + 1 })
                .eq(hitField!, hitValue!)
                .then(({ error: e }) => { if (e) console.warn("[TeacherEngine] served_count bump failed:", e.message); });

            console.log(`[TeacherEngine] CACHE HIT (${hitField}): "${fingerprintKey ?? normalized}"`);
            logUsage({
                taskType: "conceptual_lesson",
                provider: "cache",
                model: "lesson_cache",
                inputChars: question.length,
                outputChars: JSON.stringify(cached.lesson_json).length,
                latencyMs: Date.now() - startTime,
                estimatedCostUsd: 0,
                wasCacheHit: true,
                fingerprintKey: fingerprintKey ?? undefined,
            });
            return cached.lesson_json as Lesson;
        }

        console.log(`[TeacherEngine] CACHE MISS for "${fingerprintKey ?? normalized}"`);
    }

    // 2. Search NCERT for grounding context
    const ncertQuery = fingerprint?.parse_failed ? question : fingerprint?.concept_id;
    const chunks = await searchNCERT(extractNCERTSearchQuery(ncertQuery, question), classLevel, 3, fingerprint?.concept_id);
    const ncertContext = formatNCERTContext(chunks);
    console.log(`[TeacherEngine] NCERT context: ${chunks.length} chunk(s) for lesson`);

    // 3. Build prompt — inject fingerprint + NCERT context
    const simValuesBlock = simulationValues
        ? `SIMULATION VALUES (use these exact numbers in your teaching examples, not invented numbers):\n${simulationValues}`
        : `(No simulation values provided — use typical textbook values)`;

    const prompt = TEACHER_PROMPT
        .replace(/{QUESTION}/g, question)
        .replace(/{MODE}/g, mode)
        .replace(/{CLASS}/g, classLevel)
        .replace(/{CONCEPT_ID}/g, fingerprint?.concept_id ?? "general")
        .replace(/{INTENT}/g, fingerprint?.intent ?? "understand")
        .replace(/{NCERT_CHAPTER}/g, fingerprint?.ncert_chapter ?? "unknown")
        .replace(/{ASPECT}/g, fingerprint?.aspect ?? "none")
        .replace(/{VARIABLES}/g, fingerprint?.variables_changing?.join(", ") || "none")
        .replace(/{NCERT_CONTEXT}/g, ncertContext)
        .replace(/{MVS_CONTEXT}/g, mvsContext 
            ? `CRITICAL MISCONCEPTION TO CORRECT:\n${mvsContext}\n\nYou MUST open your teaching script specifically with: "You thought [their belief]. Watch what actually happens..." or very similar. DO NOT open with a generic topic introduction.` 
            : ""
        )
        .replace(/{SIM_VALUES}/g, simValuesBlock);

    // 4. Generate with claude-sonnet-4-6
    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            temperature: 0.3,
            messages: [{ role: "user", content: prompt }],
        });
        const text = (message.content[0] as { type: "text"; text: string }).text;

        const cleaned = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();

        const lesson = JSON.parse(cleaned) as Lesson;

        if (!isValidLesson(lesson)) {
            console.error("[TeacherEngine] Invalid lesson structure:", lesson);
            return null;
        }

        // 5. Cache with fingerprint_key (primary) + legacy fields for compatibility
        const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
        const upsertPayload: Record<string, unknown> = {
            question_normalized: fingerprint?.concept_id ?? normalized,
            question_keywords: normalized.split(" ").filter((w) => w.length > 3),
            mode,
            lesson_json: lesson,
            served_count: 0,
            expires_at: expiresAt,
        };
        if (fingerprint) {
            upsertPayload.fingerprint_key = fingerprint.cache_key;
            upsertPayload.intent = fingerprint.intent;
            upsertPayload.aspect = fingerprint.aspect;
            upsertPayload.class_level = fingerprint.class_level;
            upsertPayload.ncert_chapter = fingerprint.ncert_chapter;
        }

        const conflictCol = fingerprint ? "fingerprint_key" : "question_normalized,mode";
        const { error: cacheErr } = await supabaseAdmin
            .from("lesson_cache")
            .upsert(upsertPayload, { onConflict: conflictCol });

        if (cacheErr) {
            console.error("[TeacherEngine] CACHE SAVE FAILED:", cacheErr.code, cacheErr.message, cacheErr.details ?? "");
        } else {
            console.log(`[TeacherEngine] CACHE SAVED: "${fingerprintKey ?? normalized}"`);
        }

        logUsage({
            taskType: "conceptual_lesson",
            provider: "anthropic",
            model: "claude-sonnet-4-6",
            inputChars: prompt.length,
            outputChars: text.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: (prompt.length / 1_000_000 * 3.0) + (text.length / 1_000_000 * 15.0),
            wasCacheHit: false,
            fingerprintKey: fingerprintKey ?? undefined,
            metadata: { ncertChunks: chunks.length },
        });

        return lesson;
    } catch (err) {
        console.error("[TeacherEngine] generation error:", err);
        return null;
    }
}
