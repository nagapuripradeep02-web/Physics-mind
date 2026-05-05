/**
 * Chat API — routes student questions to the correct TeacherEngine function.
 *
 * Response shape (always JSON, never streaming):
 *   { explanation: string, ncertSources: NCERTSource[], usage: { tokens, ncertChunks, cost } }
 *
 * Three-tier serving:
 *   Tier 1 → verified_concepts table  (static, hand-checked responses)
 *   Tier 2 → response_cache table     (fingerprint-keyed, fact-checked)
 *   Tier 3 → TeacherEngine AI         (NCERT-grounded, section-aware)
 */

import { classifyQuestion, normalizeConceptId, type QuestionFingerprint, type Intent } from "@/lib/intentClassifier";
import {
    lookupVerifiedByConceptId,
    matchCachedResponse,
    cacheResponseForMode,
    factCheckResponse,
} from "@/lib/queryRouter";
import { detectMisconception } from "@/lib/conceptMapLookup";
import { extractConceptFromImage } from "@/lib/aiSimulationGenerator";
import { logUsage } from "@/lib/usageLogger";
import {
    explainConceptual,
    explainBoardExam,
    explainCompetitive,
    ExplainResult
} from "@/lib/teacherEngine";
import { searchNCERT, type NCERTChunk } from "@/lib/ncertSearch";
import { extractNCERTSearchQuery } from "@/lib/ncertQueryExtractor";
import { resolveStudentIntent, type IntentResolverResult } from "@/lib/intentResolver";
import { decomposeConceptFromProblem, type ConceptDecomposition } from "@/lib/conceptDecomposer";
import { getPanelConfigForConcept, type PanelConfig } from "@/lib/panelConfig";
import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { runSonnetVisionFallback } from "@/lib/sonnetVision";
import { extractEquations, type MinerUExtractionResult } from "@/lib/extractEquations";
import { isVagueInput } from "@/lib/isVagueInput";
import { generateClarificationQuestion } from "@/lib/generateClarificationQuestion";
import crypto from 'crypto';
// Require dynamic import for sharp so it doesn't break edge runtime / next server
let sharp: any;
try {
    sharp = require('sharp');
} catch (e) {
    // Ignore in edge
}

export const maxDuration = 60;

const CONCEPT_DISPLAY_NAMES: Record<string, string> = {
    ohms_law:                      "Ohm's Law (V = IR)",
    drift_velocity:                "Drift Velocity",
    series_resistance:             "Resistors in Series",
    parallel_resistance:           "Resistors in Parallel",
    series_parallel_resistance:    "Series-Parallel Combinations",
    internal_resistance:           "Internal Resistance",
    emf_internal_resistance:       "EMF & Internal Resistance",
    kirchhoffs_current_law:        "Kirchhoff's Current Law (KCL)",
    kirchhoffs_voltage_law:        "Kirchhoff's Voltage Law (KVL)",
    kirchhoffs_laws:               "Kirchhoff's Laws",
    resistivity:                   "Resistivity (ρ = RA/L)",
    electric_power_heating:        "Electric Power & Joule Heating",
    electrical_power_energy:       "Electrical Power & Energy",
    potentiometer:                 "Potentiometer",
    meter_bridge:                  "Metre Bridge",
    wheatstone_bridge:             "Wheatstone Bridge",
    resistance_temperature_dependence: "Resistance & Temperature",
    cells_in_series_parallel:      "Cells in Series & Parallel",
    electric_current:              "Electric Current",
};

function conceptIdToDisplayName(id: string): string {
    return CONCEPT_DISPLAY_NAMES[id] ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── In-memory rate limiter (20 req / 60s per user) ────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const existing = rateLimitMap.get(userId);
    if (!existing || now > existing.resetAt) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
        return true;
    }
    if (existing.count >= 20) return false;
    existing.count++;
    return true;
}

// ── JSON response helper ───────────────────────────────────────────────────────
function jsonReply(
    body: object,
    status = 200,
    extraHeaders: Record<string, string> = {}
): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...extraHeaders },
    });
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Computes a 64-bit dhash (perceptual hash) from image buffer
 */
async function computePHash(imageBuffer: Buffer): Promise<{ phash: string; phash_16: string } | null> {
    try {
        const { data, info } = await sharp(imageBuffer)
            .resize(9, 8, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        let hashBinary = '';
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const leftPixel = data[y * 9 + x];
                const rightPixel = data[y * 9 + x + 1];
                hashBinary += leftPixel > rightPixel ? '1' : '0';
            }
        }

        // Convert 64-bit binary to hex (using standard string parsing to avoid BigInt issues in older targets)
        // We'll split the 64-bit binary into two 32-bit halves to avoid precision loss
        const upperHalf = parseInt(hashBinary.slice(0, 32), 2).toString(16).padStart(8, '0');
        const lowerHalf = parseInt(hashBinary.slice(32, 64), 2).toString(16).padStart(8, '0');
        const phash = upperHalf + lowerHalf;
        const phash_16 = phash.slice(0, 16);
        return { phash, phash_16 };
    } catch (err) {
        console.error('[chat] Failed to compute pHash:', err);
        return null;
    }
}

/**
 * Computes Hamming distance between two hex strings representing 64-bit hashes
 */
function getHammingDistance(hash1: string, hash2: string): number {
    try {
        let distance = 0;
        for (let i = 0; i < hash1.length; i++) {
            const h1 = parseInt(hash1[i]!, 16);
            const h2 = parseInt(hash2[i]!, 16);
            let xor = h1 ^ h2;
            while (xor > 0) {
                distance += xor & 1;
                xor >>= 1;
            }
        }
        return distance;
    } catch {
        return 64; // Max distance on error
    }
}

/**
 * Crops an image to the marked region bounds (fractional coordinates).
 */
async function cropMarkedRegion(
    imageBase64: string,
    bounds: { x: number; y: number; width: number; height: number }
): Promise<string> {
    const buffer = Buffer.from(imageBase64, 'base64');
    const metadata = await sharp(buffer).metadata();
    const imgW = metadata.width ?? 800;
    const imgH = metadata.height ?? 600;

    const left   = Math.max(0, Math.round(bounds.x * imgW));
    const top    = Math.max(0, Math.round(bounds.y * imgH));
    const width  = Math.max(1, Math.round(bounds.width * imgW));
    const height = Math.max(1, Math.round(bounds.height * imgH));

    const cropped = await sharp(buffer)
        .extract({ left, top, width, height })
        .jpeg({ quality: 85 })
        .toBuffer();

    return cropped.toString('base64');
}

// ── POST handler ───────────────────────────────────────────────────────────────
export async function POST(req: Request) {
    const startTime = Date.now();
    const userId =
        req.headers.get("x-user-id") ??
        req.headers.get("authorization") ??
        "anonymous";

    if (!checkRateLimit(userId)) {
        return jsonReply({ error: "Too many requests. Please wait." }, 429);
    }

    try {
        const {
            messages,
            mode,
            section,
            attachments,
            profile,
            sessionId,
            marked_region,
            // Structured fields sent by SideChatDrawer (Phase A chat-persistence fix).
            // When present, these override the AI-inferred values when persisting
            // to student_confusion_log so the agent feedback loop has trustworthy
            // {student_id, concept_id, state_id} keys.
            concept_id: clientConceptId,
            state_id: clientStateId,
            student_id: clientStudentId,
        } = await req.json();

        // `section` is the canonical field; fall back to `mode` for backward compat
        let sectionMode = (
            (section ?? mode ?? "conceptual") as string
        ).toLowerCase() as "conceptual" | "board" | "competitive";

        const classLevel =
            (profile?.class as string | undefined)?.replace("Class ", "") ?? "12";

        const activeConceptualId = sessionId || '';

        // Validate student_id is a uuid before we send it to a uuid column.
        // Accepts the lowercase canonical form Supabase auth emits.
        const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const studentUuid: string | null =
            typeof clientStudentId === "string" && UUID_RE.test(clientStudentId)
                ? clientStudentId
                : null;
        const turnNumber = Array.isArray(messages) ? messages.length : 1;
        const isFollowUp = turnNumber > 1;

        // ── SESSION CONTEXT: read cached NCERT chunks for follow-up turns ────────
        let sessionData: Record<string, any> | null = null;
        let ncertChunksFromSession: NCERTChunk[] | null = null;

        if (activeConceptualId && isFollowUp) {
            const { data: session } = await supabaseAdmin
                .from('session_context')
                .select('*')
                .eq('session_id', activeConceptualId)
                .single();

            if (session && session.ncert_chunks && Array.isArray(session.ncert_chunks) && session.ncert_chunks.length > 0) {
                sessionData = session;
                ncertChunksFromSession = session.ncert_chunks as NCERTChunk[];
                console.log('[session] reusing ncert_chunks from turn', session.turn_count, 'for session:', activeConceptualId);
            }
        }

        console.log("[chat] section:", sectionMode, "| class:", classLevel, "| turn:", turnNumber);

        const hasImages = Array.isArray(attachments) && attachments.length > 0;
        const lastUserMessage = [...messages]
            .reverse()
            .find((m: { role: string }) => m.role === "user");
        let lastText: string =
            lastUserMessage?.content ??
            (lastUserMessage?.parts as { type: string; text: string }[] | undefined)
                ?.filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("") ??
            "";

        const isFirstMessage = messages.length <= 1;
        const isMvsResponse = lastText.startsWith('[MVS');

        let imageBase64: string | undefined;
        let imageMediaType: string | undefined;

        if (hasImages) {
            if (!attachments[0]?.startsWith("data:image/")) {
                return jsonReply({ error: "Invalid attachment format." }, 400);
            }
            const [meta, base64] = (attachments[0] as string).split(",");
            imageMediaType = meta.replace("data:", "").replace(";base64", "");
            imageBase64 = base64;

            if (!ALLOWED_IMAGE_TYPES.includes(imageMediaType)) {
                return jsonReply({ error: "Invalid image type. Use JPEG, PNG, WebP, or GIF." }, 400);
            }
            if ((imageBase64.length * 3) / 4 > 10 * 1024 * 1024) {
                return jsonReply({ error: "Image too large. Maximum size is 10MB." }, 400);
            }
        }

        // ═══════════════════════════════════════════
        // UNIVERSAL INPUT UNDERSTANDING LAYER
        // ═══════════════════════════════════════════

        // Declare resolved early so follow-up path can populate it (FIX 4: scope dropping)
        let resolved: IntentResolverResult | null = null;

        if (!isFirstMessage && activeConceptualId && !isMvsResponse) {
            console.log("[chat] Follow-up message detected. Running intent classifier...");

            // Use the concept from session context, not the session UUID
            const sessionConceptId = sessionData?.current_concept_id as string | undefined;

            // FIX 4: Run intent resolver for follow-up messages so scope is captured.
            // Without this, resolved stays null and scope defaults to 'local'.
            if (lastText && lastText.trim().length > 0) {
                try {
                    resolved = await resolveStudentIntent({
                        studentText: lastText,
                        conceptId: sessionConceptId || undefined,
                        isImagePresent: false,
                    });
                    console.log(`[IntentResolver:followup] scope=${resolved.scope} intent=${resolved.intent} concept=${resolved.resolvedConcept} confidence=${resolved.confidence}`);
                } catch (err) {
                    console.error("[chat] Follow-up intent resolver failed:", err);
                }
            }

            try {
                const { object } = await generateObject({
                    model: google('gemini-2.5-flash'),
                    schema: z.object({
                        follow_up_type: z.enum(['text_only', 'on_demand_sim']),
                        sim_label: z.string().nullable(),
                    }),
                    prompt: `Classify this student follow-up message. Return JSON only.

Student message: "${lastText}"

Return:
{
  "follow_up_type": "text_only" | "on_demand_sim",
  "sim_label": string | null
}

Rules:
- "on_demand_sim" only if the student is asking about a NEW variable change, a new scenario, a what-if question, or explicitly asks to "show" something visually.
- "text_only" for all clarification questions, why questions, definition questions, and conversational follow-ups.
- sim_label: A very short 2-3 word button label (e.g., 'Increase Mass', 'Show Gravity') if on_demand_sim, else null.`,
                });

                console.log("[chat] Follow-up classifier result:", object);

                if (object.follow_up_type === 'on_demand_sim') {
                    // Session 33 fix for "pill stale-fingerprint" silent failure:
                    // return the pill's target concept_id + fingerprintKey so the
                    // client can route /api/generate-simulation to the NEW concept
                    // instead of carrying over the prior turn's (stale) fingerprint.
                    // Without these, `LearnConceptTab.lastFingerprintKeyRef` stays
                    // pinned to the prior concept and the pill serves a generic
                    // fallback sim. Session 32.5's API-layer guard was a defensive
                    // net; this is the upstream structural fix.
                    const pillConceptId = normalizeConceptId(resolved?.resolvedConcept ?? null);
                    // Map IntentResolver's vocabulary to classifier's Intent enum.
                    const resolvedIntent = resolved?.intent;
                    const pillIntent =
                        resolvedIntent === 'full_explanation' ? 'understand'
                        : resolvedIntent === 'specific_confusion' ? 'specific_confusion'
                        : resolvedIntent === 'hypothetical' ? 'hypothetical'
                        : resolvedIntent === 'derive' ? 'derive'
                        : resolvedIntent === 'compare' ? 'compare'
                        : 'understand';
                    const pillClassLevel = classLevel || '12';
                    const pillMode = sectionMode || 'conceptual';
                    const pillFingerprintKey = pillConceptId
                        ? `${pillConceptId}|${pillIntent}|${pillClassLevel}|${pillMode}|none`
                        : null;
                    return jsonReply({
                        type: 'on_demand_available',
                        sim_label: object.sim_label || 'Show Simulation',
                        concept_id: pillConceptId,
                        fingerprintKey: pillFingerprintKey,
                    });
                }
            } catch (err) {
                console.error("[chat] Follow-up intent classifier failed:", err);
            }
        }

        // Declare global extraction variable so it survives the \`isFirstMessage\` block scope
        // and can be used for global fallback after text classification fails.
        let globalExtractedConceptName = '';
        let globalVisionConfidence = 0;

        let studentConfusionData = undefined;
        let conceptDecomposition: ConceptDecomposition | null = null;
        let panelConfig: PanelConfig | null = null;
        // resolved is declared earlier (before follow-up block) — FIX 4
        let resolvedConceptId = 'unknown';
        let confusionLogSessionId = '';
        let imageSourceType: 'ncert' | 'non_ncert' | 'unknown' = 'unknown';
        let markedRegionDescription: string | undefined;
        let equationData: MinerUExtractionResult | null = null;
        let skipSimulation = false;
        let conceptsCovered: string[] = [];

        const hasNewImage = !!imageBase64;
        
        if ((isFirstMessage || hasNewImage) && !isMvsResponse) {
            // STEP A: If there's an image, run Flash Vision FIRST to extract what it is.
            let imageDescription = '';
            let extractedConceptName = '';
            let finalExtraction: any = null;

            if (imageBase64) {
                const imageBuffer = Buffer.from(imageBase64, 'base64');
                const imageSha256 = crypto.createHash('sha256').update(imageBuffer).digest('hex');

                // Compute perceptual hash (pHash)
                let phashValues = await computePHash(imageBuffer);
                let hitFromCache: any = null;

                if (phashValues) {
                    console.log(`[chat] Computed pHash_16: ${phashValues.phash_16}`);
                    // Check cache for this phash_16
                    const { data: cachedRows } = await supabaseAdmin
                        .from('image_context_cache')
                        .select('*')
                        .eq('phash_16', phashValues.phash_16);

                    if (cachedRows && cachedRows.length > 0) {
                        for (const row of cachedRows) {
                            const distance = getHammingDistance(phashValues.phash, row.phash);
                            if (distance < 10) {
                                hitFromCache = row;
                                break;
                            }
                        }
                    }
                }

                if (hitFromCache) {
                    console.log("[chat] pHash cache hit — skipping Flash Vision.");
                    extractedConceptName = hitFromCache.concept_id || 'unknown';
                    // The cached diagram_description could be stored directly, or via flash_extraction
                    imageDescription = hitFromCache.diagram_description
                        || hitFromCache.flash_extraction?.diagram_description
                        || 'An image provided by the student.';
                    globalExtractedConceptName = extractedConceptName;
                    imageSourceType = hitFromCache.source_type || 'unknown';

                    // Update the usage times asynchronously
                    try {
                        const { error } = await supabaseAdmin.rpc('increment_image_cache_usage', { image_sha: hitFromCache.image_sha256 });
                        if (error) throw error;
                    } catch (e: any) {
                        try {
                            // Fallback purely code-level if RPC doesn't exist
                            await supabaseAdmin.from('image_context_cache')
                                .update({ times_matched: (hitFromCache.times_matched || 1) + 1, last_matched: new Date().toISOString() })
                                .eq('id', hitFromCache.id);
                        } catch (fallbackErr) {
                            console.error('[chat] Fallback cache update failed:', fallbackErr);
                        }
                    }

                } else {
                    console.log("[chat] Image detected. Running Flash Vision extraction...");
                    const extractionResult = await extractConceptFromImage(imageBase64, imageMediaType || '');
                    
                    if (extractionResult) {
                        // This description contains the concept name, chapter, and visual details.
                        imageDescription = extractionResult.diagram_description || 'An image provided by the student.';
                        extractedConceptName = extractionResult.concept_id || 'unknown';
                        // Persist for step 1 global fallback later
                        globalExtractedConceptName = extractedConceptName;
                        console.log(`[Vision] Direct concept_id from image: ${extractionResult.concept_id} | confidence: ${extractionResult.confidence}`);

                        // ── TWO-LAYER VISION: run Sonnet fallback if Flash confidence < 0.85 ──
                        const flashConfidence = extractionResult.confidence ?? 1.0;
                        finalExtraction = extractionResult;
                        let visionConfidence = flashConfidence;
                        globalVisionConfidence = flashConfidence;

                        if (flashConfidence < 0.85 && imageBase64 && imageMediaType) {
                            console.log(`[Vision] Flash confidence ${flashConfidence} below threshold — running Sonnet fallback`);
                            const sonnetCheck = await runSonnetVisionFallback(imageBase64, imageMediaType, extractionResult);

                            if (!sonnetCheck.confirmed && sonnetCheck.correctedExtraction) {
                                console.log(`[Vision] Sonnet disagreed — using corrected extraction`);
                                finalExtraction = {
                                    ...extractionResult,
                                    concept_id: (sonnetCheck.correctedExtraction.concept_id as string) || extractionResult.concept_id,
                                    source_type: (sonnetCheck.correctedExtraction.source_type as 'ncert' | 'non_ncert') || extractionResult.source_type,
                                };
                                extractedConceptName = finalExtraction.concept_id || 'unknown';
                                globalExtractedConceptName = extractedConceptName;
                                imageDescription = finalExtraction.diagram_description || imageDescription;
                            } else {
                                console.log(`[Vision] Sonnet confirmed Flash extraction. Combined confidence: ${sonnetCheck.combinedConfidence}`);
                            }

                            visionConfidence = sonnetCheck.combinedConfidence;
                            globalVisionConfidence = sonnetCheck.combinedConfidence;

                            if (sonnetCheck.combinedConfidence < 0.60) {
                                console.log(`[Vision] Combined confidence below 0.60 — image unreadable`);
                                return jsonReply({
                                    explanation: "I'm having trouble reading your image clearly. Could you retake the photo in better lighting, or type your question instead?",
                                    ncertSources: [],
                                    usage: { tokens: 0, ncertChunks: 0, cost: 0 },
                                });
                            }
                        }

                        imageSourceType = (finalExtraction.source_type as 'ncert' | 'non_ncert' | 'unknown') || 'non_ncert';

                        if (phashValues) {
                            console.log("[chat] Inserting new Flash Vision extraction to image_context_cache, pHash:", phashValues.phash_16);
                            const { data: cacheData, error: insertError } = await supabaseAdmin
                                .from('image_context_cache')
                                .upsert({
                                    image_sha256: imageSha256,
                                    phash: phashValues.phash,
                                    phash_16: phashValues.phash_16,
                                    source_type: finalExtraction.source_type || 'non_ncert',
                                    concept_id: extractedConceptName,
                                    specific_aspect: null,
                                    class_level: classLevel ? parseInt(classLevel, 10) : null,
                                    flash_extraction: finalExtraction as any,
                                    has_diagram: !!finalExtraction.diagram_description,
                                    vision_confidence: visionConfidence,
                                    first_seen: new Date().toISOString(),
                                    times_matched: 1,
                                    last_matched: new Date().toISOString(),
                                    marked_region_bounds: marked_region ?? null,
                                    marked_region_description: markedRegionDescription ?? null,
                                    has_marked_region: !!marked_region
                                }, {
                                    onConflict: 'image_sha256',
                                    ignoreDuplicates: false
                                });
                            if (insertError) {
                                console.error("[imageCache] WRITE FAILED:", insertError.message, "| code:", insertError.code, "| details:", insertError.details);
                            } else {
                                console.log("[imageCache] written successfully for sha256:", imageSha256.slice(0, 12));
                            }
                        } else {
                            console.warn("[imageCache] skipping write — pHash computation returned null");
                        }
                    }
                }
            }

            // ── MARKED REGION: crop + Flash Vision on highlighted area ──
            if (marked_region && imageBase64) {
                try {
                    console.log('[markedRegion] bounds:', JSON.stringify(marked_region));

                    const croppedBase64 = await cropMarkedRegion(imageBase64, marked_region);

                    const cropVisionResult = await generateText({
                        model: google('gemini-2.5-flash'),
                        messages: [{
                            role: 'user',
                            content: [
                                {
                                    type: 'image',
                                    image: `data:image/jpeg;base64,${croppedBase64}`,
                                },
                                {
                                    type: 'text',
                                    text: `This is a cropped region from a physics textbook page that a student specifically highlighted. Describe exactly what is shown:
- Any text content verbatim
- Any equations or formulas (write them clearly)
- Any diagram elements or labels
- What physics concept this region is about
Be precise and complete. Maximum 150 words.`,
                                },
                            ],
                        }],
                        maxOutputTokens: 200,
                    });

                    markedRegionDescription = cropVisionResult.text;
                    console.log('[markedRegion] description:', markedRegionDescription?.slice(0, 100));
                } catch (err) {
                    console.error('[markedRegion] crop/vision failed:', err);
                    markedRegionDescription = undefined;
                }
            }

            // ── NEW INPUT UNDERSTANDING LAYER (Decision Engine) ──
            const analysisResult = await import('@/lib/inputUnderstanding').then(m => m.analyzeStudentInput({
                studentText: lastText,
                imageDescription: imageDescription || undefined,
                studentWorkDetected: !!finalExtraction?.student_work_detected,
                extractedConceptId: globalExtractedConceptName || undefined,
                flashConfidence: finalExtraction?.confidence_score,
                markedRegionDescription: markedRegionDescription,
                sessionContext: sessionData ? {
                    current_chapter: sessionData.current_chapter,
                    last_concept: sessionData.current_concept_id,
                    exam_mode: sessionData.exam_mode as any,
                    last_misconception: sessionData.last_misconception
                } : undefined,
                sectionMode: sectionMode
            }));

            console.log(`[DecisionEngine] Action=${analysisResult.action} | Concept=${analysisResult.concept_id} | Intent=${analysisResult.intent} | Emotion=${analysisResult.emotional_state} | Mode=${analysisResult.exam_mode}`);

            if (analysisResult.action === 'CLARIFY' || analysisResult.action === 'ACKNOWLEDGE_EMOTION' || analysisResult.action === 'OUT_OF_SCOPE') {
                // Fire-and-forget: log clarification/distress to student_confusion_log
                supabaseAdmin.from('student_confusion_log').insert([{
                    session_id: activeConceptualId || crypto.randomUUID(),
                    student_id: studentUuid,
                    raw_question: lastText || '',
                    input_type: !!marked_region ? (lastText ? 'marked_image' : 'marked_image_no_text')
                               : hasImages ? (lastText ? 'image+text' : 'image_no_text') : 'text',
                    clarification_asked: true,
                    clarification_question: analysisResult.clarifying_question,
                    image_uploaded: hasImages,
                    has_marked_region: !!marked_region,
                    marked_region_description: markedRegionDescription ?? null,
                    // Prefer the structured concept_id sent by the client (the lesson page
                    // knows it for sure); fall back to AI inference.
                    concept_id: clientConceptId || analysisResult.concept_id || 'unknown',
                    state_id: clientStateId ?? null,
                    intent: analysisResult.action === 'ACKNOWLEDGE_EMOTION' ? 'distress' : 'clarification_needed',
                    class_level: classLevel,
                    exam_mode: sectionMode,
                }]).then(({ error }) => {
                    if (error) console.error('[chat] clarification log insert failed:', error.message);
                });

                return jsonReply({
                    type: analysisResult.action === 'OUT_OF_SCOPE' ? 'text_only' : 'clarification',
                    message: analysisResult.clarifying_question,
                    explanation: analysisResult.action === 'OUT_OF_SCOPE' ? analysisResult.clarifying_question : undefined,
                    retain_image_context: hasImages && analysisResult.action !== 'OUT_OF_SCOPE',
                    ncertSources: analysisResult.action === 'OUT_OF_SCOPE' ? [] : undefined,
                    usage: analysisResult.action === 'OUT_OF_SCOPE' ? { tokens: 0, ncertChunks: 0, cost: 0 } : undefined,
                });
            }

            // Map analysis result to legacy 'resolved' structure for the rest of pipeline
            const mappedIntent = analysisResult.intent === 'problem_solving' ? 'specific_confusion' :
                                 analysisResult.intent === 'belief_check' ? 'specific_confusion' :
                                 analysisResult.intent === 'continuation' ? 'full_explanation' :
                                 analysisResult.intent === 'error_diagnosis' ? 'error_diagnosis' :
                                 (analysisResult.intent as any) || 'full_explanation';

            resolved = {
                intent: mappedIntent,
                resolvedConcept: analysisResult.concept_id ?? 'unknown',
                confidence: analysisResult.confidence,
                reasoning: analysisResult.reasoning,
                simulation_needed: mappedIntent === 'full_explanation' || mappedIntent === 'specific_confusion',
                // Prefer explicit scope from inputUnderstanding (e.g. micro override)
                // Fall back to intent-derived scope when not set
                scope: analysisResult.scope ?? (analysisResult.intent === 'full_explanation' ? 'global' : 'local'),
                simulationEmphasis: analysisResult.specific_aspect || ''
            };

            // Map exam_mode to sectionMode
            if (analysisResult.exam_mode) {
                sectionMode = analysisResult.exam_mode;
            }

            // Ensure concept ID is resolved from the engine
            resolvedConceptId = analysisResult.concept_id || globalExtractedConceptName || 'unknown';


                // ── SESSION CACHE INVALIDATION: concept changed mid-session ──
                const conceptChanged = sessionData &&
                    sessionData.current_concept_id !== resolvedConceptId;
                if (conceptChanged) {
                    console.log('[session] concept changed:',
                        sessionData!.current_concept_id, '→', resolvedConceptId,
                        '— invalidating session cache');
                    ncertChunksFromSession = null;
                }

                // ── SESSION-AWARE SIMULATION SKIP ──
                // If this concept already had a simulation in this session, skip re-generation
                // unless the student explicitly asks to see it again.
                const showAgainKeywords = ['show again', 'phir se', 'dobara', 'replay', 'once more', 'fir se dikhao', 'again dikhao'];
                const lowerText = lastText.toLowerCase();
                const wantsReplay = showAgainKeywords.some(kw => lowerText.includes(kw));
                conceptsCovered = ((sessionData as Record<string, unknown> | null)?.concepts_covered as string[] | undefined) ?? [];
                if (
                    resolvedConceptId !== 'unknown' &&
                    conceptsCovered.includes(`${resolvedConceptId}:${sectionMode}`) &&
                    !wantsReplay
                ) {
                    skipSimulation = true;
                    console.log('[SESSION] simulation skip — concept:mode already covered:', `${resolvedConceptId}:${sectionMode}`);
                } else if (wantsReplay) {
                    console.log('[SESSION] replay requested — forcing simulation');
                }

                // Fire-and-forget: log to student_confusion_log.
                // Gate accepts EITHER an active session id OR an authenticated student
                // — that way LessonCard's SideChatDrawer (which generates a per-drawer
                // sessionId) and any other authenticated path both persist.
                if (activeConceptualId || studentUuid) {
                    const logSessionId = activeConceptualId || crypto.randomUUID();
                    confusionLogSessionId = logSessionId;
                    // Prefer the structured concept_id from the lesson page over
                    // intent_resolver's inference; the URL is ground truth.
                    const persistedConceptId = clientConceptId || resolvedConceptId;
                    supabaseAdmin.from('student_confusion_log').insert([{
                        session_id: logSessionId,
                        student_id: studentUuid,
                        confusion_text: lastText,
                        extracted_concept_id: resolvedConceptId,
                        extracted_intent: resolved!.intent,
                        concept_id: persistedConceptId,
                        state_id: clientStateId ?? null,
                        intent: resolved!.intent,
                        image_uploaded: hasImages,
                        confidence_score: resolved!.confidence,
                        source_type: 'intent_resolver',
                        class_level: classLevel,
                        exam_mode: sectionMode,
                        raw_question: lastText,
                        input_type: !!marked_region && lastText.trim().length > 0 ? 'marked_image'
                            : !!marked_region ? 'marked_image_no_text'
                            : hasNewImage && lastText.trim().length > 0 ? 'image+text'
                            : hasNewImage ? 'image_no_text'
                            : 'text',
                        has_marked_region: !!marked_region,
                        marked_region_description: markedRegionDescription ?? null,
                    }]).then(({ error }) => {
                        if (error) console.error('[chat] confusion log insert failed:', error.message);
                    });
                }

                // --- Panel Config lookup (verified table first) ---
                if (resolvedConceptId !== 'unknown') {
                    panelConfig = await getPanelConfigForConcept(resolvedConceptId);
                    if (panelConfig) {
                        console.log(`[PanelConfig] FOUND verified=${panelConfig.verified_by_human} panels=${panelConfig.default_panel_count} | ${panelConfig.panel_a_renderer} + ${panelConfig.panel_b_renderer ?? 'none'}`);
                    } else {
                        console.log(`[PanelConfig] NOT FOUND for concept: ${resolvedConceptId} — running Concept Decomposer`);
                    }
                }

                // --- Concept Decomposition (fallback for unknown concepts with images) ---
                if (!panelConfig && hasImages && resolvedConceptId !== 'unknown') {
                    conceptDecomposition = await decomposeConceptFromProblem({
                        imageDescription: imageDescription,
                        studentConfusionText: lastText,
                        extractedEquations: [],
                        conceptId: resolvedConceptId,
                    });
                    if (conceptDecomposition.dual_panel_needed) {
                        console.log('[conceptDecomposer] dual_panel_needed=true — decomposition:', JSON.stringify(conceptDecomposition, null, 2));
                    } else {
                        console.log('[conceptDecomposer] single-panel — primary:', conceptDecomposition.primary_concept);
                    }

                    // Multiple concepts: proceed autonomously with primary_concept
                    if (conceptDecomposition.multiple_concepts_detected && conceptDecomposition.detected_concepts.length > 1) {
                        console.log('[conceptDecomposer] Multiple concepts detected — proceeding autonomously with primary:', conceptDecomposition.primary_concept);
                    }

                    // Wire decomposer output into panelConfig
                    if (conceptDecomposition.dual_panel_needed) {
                        panelConfig = {
                            concept_id: resolvedConceptId,
                            default_panel_count: conceptDecomposition.panel_count,
                            panel_a_renderer: conceptDecomposition.panel_a_renderer ?? 'particle_field',
                            panel_b_renderer: conceptDecomposition.panel_b_renderer ?? null,
                            panel_c_renderer: null,
                            sonnet_can_upgrade: false,
                            verified_by_human: false,
                        };
                        console.log(`[Decomposer] constructed panelConfig: ${conceptDecomposition.panel_count} panels | A=${conceptDecomposition.panel_a_renderer} | B=${conceptDecomposition.panel_b_renderer}`);
                    }

                    // Log decomposer output to student_confusion_log
                    if (activeConceptualId) {
                        supabaseAdmin
                            .from('student_confusion_log')
                            .update({
                                decomposer_ran: true,
                                panel_count: conceptDecomposition.panel_count ?? 1,
                                primary_concept: conceptDecomposition.primary_concept ?? null,
                                supporting_concepts: conceptDecomposition.supporting_concepts ?? null,
                            })
                            .eq('session_id', activeConceptualId)
                            .then(({ error }) => {
                                if (error) console.error('[Decomposer] Failed to update confusion log:', error.message);
                            });
                    }
                }

                // --- Student Confusion Extraction (autonomous — no clarification gate) ---
                if (resolved!.intent === 'specific_confusion') {
                    const searchConcept = resolvedConceptId !== 'unknown' ? resolvedConceptId : (globalExtractedConceptName || 'unknown');

                    // Reuse session-cached NCERT chunks when available (skip pgvector)
                    let chunksToExtract: NCERTChunk[];
                    if (ncertChunksFromSession && ncertChunksFromSession.length > 0) {
                        chunksToExtract = ncertChunksFromSession;
                        console.log('[pgvector] SKIPPED specific_confusion — using', chunksToExtract.length, 'chunks from session');
                    } else {
                        chunksToExtract = await searchNCERT(
                            extractNCERTSearchQuery(searchConcept, lastText),
                            classLevel,
                            3,
                            searchConcept
                        );
                        console.log('[pgvector] ran for specific_confusion —', chunksToExtract.length, 'chunks');
                    }

                    const extractResult = await import('@/lib/extractStudentConfusion').then(m =>
                        m.extractStudentConfusion({
                            student_confusion_text: lastText,
                            image_description: imageDescription || '',
                            concept_id: resolvedConceptId,
                            ncert_chunks: chunksToExtract.map((c: any) => c.content_text),
                            marked_region_description: markedRegionDescription,
                        })
                    );

                    // Always proceed — never block for clarification
                    studentConfusionData = {
                        student_belief: extractResult.student_belief,
                        simulation_emphasis: extractResult.simulation_emphasis
                    };

                    // UPDATE the row already inserted by the intent resolver log (line ~605)
                    // instead of creating a duplicate row via upsert.
                    const logSessionId = activeConceptualId || confusionLogSessionId;
                    const updatePayload = {
                        student_belief: extractResult.student_belief ?? null,
                        actual_physics: extractResult.actual_physics ?? null,
                        simulation_emphasis: extractResult.simulation_emphasis ?? null,
                        extraction_confidence: extractResult.confidence_score ?? null,
                        misconception_confirmed: extractResult.misconception_confirmed ?? false,
                        input_type: marked_region ? 'marked_image' : (imageDescription ? 'image+text' : 'text'),
                        marked_region_description: markedRegionDescription ?? null,
                        has_marked_region: !!marked_region,
                    };
                    console.log('[CONFUSION_LOG] Updating existing row with confusion extraction:', {
                        session_id: logSessionId,
                        student_belief: extractResult.student_belief,
                        simulation_emphasis: extractResult.simulation_emphasis,
                        extraction_confidence: extractResult.confidence_score,
                    });
                    if (logSessionId) {
                        const updateResult = await supabaseAdmin
                            .from('student_confusion_log')
                            .update(updatePayload)
                            .eq('session_id', logSessionId)
                            .is('student_belief', null)
                            .order('created_at', { ascending: false })
                            .limit(1);
                        if (updateResult?.error) {
                            console.error('[chat] confusion_log UPDATE failed:', updateResult.error.message, '| code:', updateResult.error.code);
                        } else {
                            confusionLogSessionId = logSessionId;
                            console.log('[chat] confusion_log UPDATE succeeded for session_id:', logSessionId);
                        }
                    }
                }

                // Append image description for classifier context downstream
                if (imageDescription) {
                    lastText = `${lastText} [image: ${imageDescription}]`.trim();
                }
            }

        // ═══════════════════════════════════════════
        // SIMULATION GATE — skip sim pipeline for text-only questions
        // ═══════════════════════════════════════════

        if (resolved && !resolved.simulation_needed) {
            console.log('[GATE] simulation skipped — text only response');

            // Load grounded physics from concept JSON. v2.1 uses locked_facts; v2.2
            // uses physics_engine_config (variables + formulas + constraints). Both
            // are merged when present so the chat gate works for either schema.
            const { loadConstants } = await import('@/lib/physics_constants/index');
            const conceptJson = resolvedConceptId !== 'unknown'
                ? await loadConstants(resolvedConceptId) as Record<string, unknown> | null
                : null;
            const groundingParts: string[] = [];
            if (conceptJson?.locked_facts) {
                groundingParts.push(`LOCKED FACTS:\n${JSON.stringify(conceptJson.locked_facts)}`);
            }
            if (conceptJson?.physics_engine_config) {
                groundingParts.push(`PHYSICS ENGINE CONFIG:\n${JSON.stringify(conceptJson.physics_engine_config)}`);
            }
            const lockedFacts = groundingParts.length > 0
                ? groundingParts.join('\n\n')
                : 'No specific physics constants available for this concept.';

            const gateResponse = await generateText({
                model: google('gemini-2.5-flash'),
                prompt: `You are a physics teacher. Answer this specific question concisely using only the physics facts provided. Do not explain the full concept. Answer exactly what was asked.\n\nPHYSICS FACTS:\n${lockedFacts}\n\nSTUDENT QUESTION: ${lastText}\n\nSPECIFIC ASPECT: ${resolved.simulationEmphasis || 'general'}`,
            });

            const gateText = gateResponse.text;

            logUsage({
                sessionId: userId,
                taskType: 'chat_response',
                provider: 'google',
                model: 'gemini-2.5-flash',
                inputChars: lastText.length,
                outputChars: gateText.length,
                latencyMs: Date.now() - startTime,
                estimatedCostUsd: 0,
                wasCacheHit: false,
                metadata: { gate: 'text_only', concept: resolvedConceptId, scope: resolved.scope },
            });

            return jsonReply({
                type: 'text_only',
                explanation: gateText,
                ncertSources: [],
                usage: { tokens: Math.round(gateText.length / 4), ncertChunks: 0, cost: 0 },
            });
        } else if (resolved) {
            console.log('[GATE] simulation proceeding');
        }

        // ═══════════════════════════════════════════
        // LAYER 0 RESPONSE HANDLER (Legacy support)
        // ═══════════════════════════════════════════

        if (lastText.startsWith('[L0_ANSWER]')) {
            const enrichedQuestion = lastText.replace('[L0_ANSWER] ', '');
            lastText = enrichedQuestion;
        }

        // ── STEP 1: Classify question ──────────────────────────────────────────
        let fingerprint: QuestionFingerprint | null = null;
        if (lastText.trim()) {
            // Always run classifyQuestion to get a validated, normalised concept_id.
            // The IntentResolver can return display names like "Series Circuits" which
            // would poison cache keys and concept routing. The classifier always returns
            // a slug like "series_resistance".
            fingerprint = await classifyQuestion(lastText, classLevel, sectionMode);

            // Classifier treats {MODE} as a hint and often returns its own mode
            // based on question text. The caller's explicit sectionMode must
            // win, otherwise Board/Competitive refetches collide with the
            // conceptual cache row. Overwrite fingerprint.mode + rebuild key.
            if (
                fingerprint &&
                !fingerprint.parse_failed &&
                sectionMode &&
                fingerprint.mode !== sectionMode
            ) {
                console.log("[chat] overriding classifier mode:", fingerprint.mode, "→", sectionMode);
                fingerprint.mode = sectionMode;
                fingerprint.cache_key = [
                    fingerprint.concept_id,
                    fingerprint.intent,
                    fingerprint.class_level,
                    fingerprint.mode,
                    fingerprint.aspect ?? 'none',
                ].join('|');
            }

            // ── INPUT UNDERSTANDING CONCEPT_ID OVERRIDE ──
            // When the upstream intake layer (inputUnderstanding or intentResolver)
            // already resolved a concept_id, trust it over the classifier's re-guess.
            // Prevents silent concept drift — e.g. inputUnderstanding's micro override
            // sets vector_addition, but classifyQuestion re-classifies to dot_product
            // from the same text, leaving downstream stages to run on the wrong concept.
            // The classifier's intent/class/mode/aspect are still kept.
            const upstreamConceptId = resolved?.resolvedConcept;
            const normalizedUpstream = normalizeConceptId(upstreamConceptId);
            if (
                fingerprint &&
                !fingerprint.parse_failed &&
                upstreamConceptId &&
                upstreamConceptId !== 'unknown' &&
                upstreamConceptId !== fingerprint.concept_id
            ) {
                if (normalizedUpstream) {
                    const originalClassifierConceptId = fingerprint.concept_id;
                    fingerprint.concept_id = normalizedUpstream;
                    fingerprint.cache_key = [
                        fingerprint.concept_id,
                        fingerprint.intent,
                        fingerprint.class_level,
                        fingerprint.mode,
                        fingerprint.aspect ?? 'none',
                    ].join('|');
                    console.log(`[InputUnderstanding] concept_id override applied: ${normalizedUpstream} (upstream raw: ${upstreamConceptId}, classifier had: ${originalClassifierConceptId})`);
                } else {
                    console.warn(`[InputUnderstanding] override REJECTED — "${upstreamConceptId}" is not a valid concept_id; keeping classifier value "${fingerprint.concept_id}"`);
                }
            }

            // ── RESOLVER INTENT OVERRIDE ──
            // When IntentResolver ran with high confidence, trust its intent and overlay
            // it on the classifier's fingerprint. We keep the classifier's concept_id,
            // class_level, aspect, and ncert_chapter — only intent and cache_key change.
            if (resolved !== null && resolved.confidence > 0.75 && fingerprint && !fingerprint.parse_failed) {
                const intentMap: Record<string, Intent> = {
                    full_explanation: 'understand',
                    specific_confusion: 'specific_confusion',
                    hypothetical: 'hypothetical',
                    derive: 'derive',
                    compare: 'compare',
                };
                const resolverMappedIntent: Intent = intentMap[resolved.intent] ?? fingerprint.intent;
                const overriddenCacheKey = [fingerprint.concept_id, resolverMappedIntent, fingerprint.class_level, fingerprint.mode, fingerprint.aspect ?? 'none'].join('|');
                console.log(`[chat] STEP 1: classifyQuestion concept=${fingerprint.concept_id} | resolver intent override: ${fingerprint.intent} → ${resolverMappedIntent} (resolver confidence=${resolved.confidence})`);
                fingerprint.intent = resolverMappedIntent;
                fingerprint.cache_key = overriddenCacheKey;
            } else {
                console.log(`[chat] STEP 1: classifyQuestion concept=${fingerprint?.concept_id} intent=${fingerprint?.intent} (no resolver override)`);
            }

            if (!fingerprint) {
                // API/network error (not a parse failure — classifyQuestion handles parse failures
                // by returning parse_failed:true rather than null). This branch only fires on
                // hard exceptions. Use safe unknown fallback — do NOT use raw question text as
                // concept_id, which produces invented cache keys like "current_reduces_after_resistor".
                console.warn('[CLASSIFIER] Hard failure (network/exception) — using unknown fallback');
                fingerprint = {
                    concept_id: 'unknown',
                    intent: 'understand',
                    class_level: classLevel,
                    mode: sectionMode,
                    aspect: 'none',
                    confidence: 0,
                    ncert_chapter: 'unknown',
                    variables_changing: [],
                    cache_key: '',       // empty — cache skipped below
                    parse_failed: true,
                };
            }

            // ── VISION CONCEPT_ID OVERRIDE ──
            // When Flash Vision has directly identified a concept_id from an image, trust it
            // over the classifier's text-based guess. The classifier still provides intent,
            // class_level, mode, and aspect — only concept_id is overridden.
            if (fingerprint && !fingerprint.parse_failed && hasImages && globalExtractedConceptName && globalExtractedConceptName !== 'unknown') {
                const normalizedVision = normalizeConceptId(globalExtractedConceptName);
                if (!normalizedVision) {
                    console.warn(`[Vision] override REJECTED — "${globalExtractedConceptName}" is not a valid concept_id; keeping classifier value "${fingerprint.concept_id}"`);
                } else {
                const originalClassifierConceptId = fingerprint.concept_id;
                fingerprint.concept_id = normalizedVision;
                console.log(`[Vision] concept_id override applied: ${normalizedVision} (vision raw: ${globalExtractedConceptName}, classifier had: ${originalClassifierConceptId})`);

                // Rebuild cache key with the vision-supplied concept_id
                const classKey = fingerprint.class_level.toLowerCase().replace(/\s+/g, '_');
                const varsJoined = [...(fingerprint.variables_changing || [])].sort().join(',');
                const modeStr = fingerprint.mode === 'conceptual' ? '' : `-${fingerprint.mode}`;
                const baseHash = Array.from(`${classKey}|${fingerprint.intent}|${fingerprint.aspect}|${varsJoined}|${modeStr}`)
                    .reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0);
                fingerprint.cache_key = `${fingerprint.concept_id}|${Math.abs(baseHash).toString(36)}`;
                // P0 #3 fix: propagate vision confidence so the 0.70 gate doesn't block
                if (globalVisionConfidence > fingerprint.confidence) {
                    fingerprint.confidence = globalVisionConfidence;
                }
                }
            }

            // ── CONCEPT ALIAS RESOLUTION ──────────────────────────────────────
            // InputUnderstanding / vision sometimes returns broader concept IDs
            // that map to specific JSONs. Resolve before fingerprint is used.
            const CONCEPT_ALIASES: Record<string, string> = {
                'relative_motion_in_2d': 'river_boat_problems',
                'kinematics_1d': 'uniform_acceleration',
                'projectile_2d': 'projectile_motion',
            };
            if (fingerprint && CONCEPT_ALIASES[fingerprint.concept_id]) {
                const original = fingerprint.concept_id;
                fingerprint.concept_id = CONCEPT_ALIASES[fingerprint.concept_id];
                fingerprint.cache_key = [
                    fingerprint.concept_id,
                    fingerprint.intent,
                    fingerprint.class_level,
                    fingerprint.mode,
                    fingerprint.aspect ?? 'none',
                ].join('|');
                console.log(`[ConceptAlias] ${original} → ${fingerprint.concept_id}`);
            }

            // ── INTENT RESOLVER CONCEPT_ID RESCUE ──────────────────────────────
            // When the classifier returned concept_id='unknown' but IntentResolver
            // identified the concept with confidence ≥ 0.9, convert the display name
            // to snake_case and use it.  Example: "LC Oscillations" → "lc_oscillations"
            // This fires ONLY when concept_id is still 'unknown' at this point, so the
            // vision override above (when images are present) always takes precedence.
            const UUID_PATTERN = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
            if (fingerprint && fingerprint.concept_id === 'unknown'
                && resolved !== null && resolved.confidence >= 0.9
                && resolved.resolvedConcept
                && !UUID_PATTERN.test(resolved.resolvedConcept)) {
                const resolverSlug = resolved.resolvedConcept
                    .toLowerCase()
                    .replace(/[^a-z0-9\s_]/g, '')  // strip special chars, keep spaces + underscores
                    .trim()
                    .replace(/\s+/g, '_');
                const normalizedResolver = normalizeConceptId(resolverSlug);
                if (normalizedResolver) {
                    fingerprint.concept_id  = normalizedResolver;
                    fingerprint.parse_failed = false;
                    fingerprint.cache_key = [
                        normalizedResolver,
                        fingerprint.intent,
                        fingerprint.class_level,
                        fingerprint.mode,
                        fingerprint.aspect ?? 'none',
                    ].join('|');
                    console.log(`[IntentResolver] concept_id rescued from 'unknown': "${resolved.resolvedConcept}" → "${normalizedResolver}" (confidence=${resolved.confidence})`);
                    // P0 #1+#2 fix: propagate resolver confidence so the 0.70 gate doesn't block
                    if (resolved.confidence > fingerprint.confidence) {
                        fingerprint.confidence = resolved.confidence;
                    }
                } else {
                    console.warn(`[IntentResolver] rescue REJECTED — "${resolverSlug}" is not a valid concept_id; leaving fingerprint as 'unknown'`);
                }
            }

            // Append confusion_hash to cache key if applicable
            if (fingerprint && !fingerprint.parse_failed && fingerprint.intent === 'specific_confusion' && studentConfusionData?.student_belief) {
                const hash = crypto.createHash('sha256').update(studentConfusionData.student_belief).digest('hex').substring(0, 12);
                fingerprint.cache_key = `${fingerprint.cache_key}|${hash}`;
                console.log(`[chat] Appended confusion_hash to cache key: ${hash}`);
            }

            console.log(
                "[chat] fingerprint:", fingerprint.cache_key || '(none — parse failed)',
                "| confidence:", fingerprint.confidence,
                fingerprint.parse_failed ? '| PARSE_FAILED — skipping MVS+cache' : ''
            );

            // Normalize concept_id in confusion log to classifier's clean value
            if (confusionLogSessionId && fingerprint?.concept_id && fingerprint.concept_id !== 'unknown') {
                const { error: normError } = await supabaseAdmin
                    .from('student_confusion_log')
                    .update({ concept_id: fingerprint.concept_id })
                    .eq('session_id', confusionLogSessionId)
                    .order('created_at', { ascending: false })
                    .limit(1)

                if (normError) {
                    console.error('[CONFUSION_LOG] concept_id normalization failed:', normError)
                } else {
                    console.log(`[CONFUSION_LOG] concept_id normalized to: ${fingerprint.concept_id}`)
                }
            }

            // Low confidence → ask for clarification (skip MVS + cache)
            if (!fingerprint.parse_failed && fingerprint.confidence < 0.70) {
                return jsonReply({
                    explanation:
                        "Could you be more specific? For example, are you asking about a particular concept, a derivation, or a numerical problem? The more specific your question, the better I can help.",
                    ncertSources: [],
                    usage: { tokens: 0, ncertChunks: 0, cost: 0 },
                });
            }
        }

        // ── STEP 2: MVS — runs BEFORE any cache tier ──────────────────────────────
        // Intentionally a separate top-level block so no cache check can be accidentally
        // inserted between classifier output and misconception detection.
        if (fingerprint && !fingerprint.parse_failed) {
            const mvsResult = await detectMisconception(fingerprint.concept_id, lastText);
            if (mvsResult.detected) {
                console.log("[chat] MVS TRIGGERED for misconception:", mvsResult.misconception_id);
                return jsonReply({
                    type: "MVS_REQUIRED",
                    misconception: mvsResult,
                    fingerprint: fingerprint,
                });
            }
        }

        // ── TIER 1: Verified concept by concept_id (classifier is source of truth) ─
        // No keyword scanning. Exact slug match only. Works at any vocabulary scale.
        // Skip entirely when parse_failed — concept_id is 'unknown', cache_key is ''
        // Bypass if this is a specific_confusion requiring dynamic custom generation
        if (fingerprint && !fingerprint.parse_failed && !studentConfusionData) {
            const verified = await lookupVerifiedByConceptId(fingerprint.concept_id, sectionMode);
            if (verified) {
                logUsage({
                    sessionId: userId,
                    taskType: "chat_response",
                    provider: "cache",
                    model: "verified_concept",
                    inputChars: lastText.length,
                    outputChars: verified.response.length,
                    latencyMs: Date.now() - startTime,
                    estimatedCostUsd: 0,
                    wasCacheHit: true,
                    fingerprintKey: fingerprint.cache_key,
                    metadata: { tier: 1, section: sectionMode, concept: fingerprint.concept_id },
                });
                return jsonReply(
                    {
                        explanation: verified.response,
                        ncertSources: [],
                        usage: { tokens: 0, ncertChunks: 0, cost: 0 },
                    },
                    200,
                    { "X-Fingerprint-Key": fingerprint.cache_key }
                );
            }
        }

        // ── TIER 2: Response cache by fingerprint_key ──────────────────────────
        // Skip when parse_failed — cache_key is '' and would match nothing (or everything)
        // Bypass if this is a specific_confusion requiring dynamic custom generation
        if (fingerprint && !fingerprint.parse_failed && !studentConfusionData) {
            const cached = await matchCachedResponse(fingerprint.cache_key);
            if (cached) {
                console.log("[chat] TIER 2 HIT:", fingerprint.cache_key);
                logUsage({
                    sessionId: userId,
                    taskType: "chat_response",
                    provider: "cache",
                    model: "response_cache",
                    inputChars: lastText.length,
                    outputChars: cached.length,
                    latencyMs: Date.now() - startTime,
                    estimatedCostUsd: 0,
                    wasCacheHit: true,
                    fingerprintKey: fingerprint.cache_key,
                    metadata: { tier: 2, section: sectionMode },
                });
                return jsonReply(
                    {
                        explanation: cached,
                        ncertSources: [],
                        usage: { tokens: 0, ncertChunks: 0, cost: 0 },
                    },
                    200,
                    { "X-Fingerprint-Key": fingerprint.cache_key }
                );
            }
        }

        // ── TIER 3: AI generation ──────────────────────────────────────────────

        // ── STEP 5: Equation extraction for non-NCERT images (MinerU) ────────────
        if (imageSourceType === 'non_ncert' && imageBase64) {
            console.log('[chat] STEP 5 sourceType=non_ncert — attempting equation extraction via MinerU')
            const imageBuffer = Buffer.from(imageBase64, 'base64')
            equationData = await extractEquations({
                imageBuffer,
                sourceType: imageSourceType,
                conceptId: resolvedConceptId !== 'unknown' ? resolvedConceptId : undefined,
                mimeType: imageMediaType || 'image/jpeg'
            })
            if (equationData) {
                console.log(`[chat] MinerU extracted ${equationData.equation_count} equations (cached=${equationData.cached})`)
            } else {
                console.log('[chat] MinerU unavailable — continuing without equation data')
            }
        } else if (imageSourceType !== 'unknown') {
            console.log(`[chat] STEP 5 sourceType=${imageSourceType} — NCERT image, skipping equation extraction`)
        }
        // Pass session-cached chunks to skip pgvector on follow-up turns
        const cachedChunks = ncertChunksFromSession ?? undefined;

        // Enrich question with extracted equations so TeacherEngine has clean LaTeX
        const questionWithEquations = equationData && equationData.equation_count > 0 && Array.isArray(equationData.equations)
            ? `${lastText}\n\nEXTRACTED EQUATIONS FROM PAGE:\n${equationData.equations.map(e => e.display).join('\n')}`
            : lastText;

        let res: ExplainResult;
        if (sectionMode === "board") {
            res = await explainBoardExam(questionWithEquations, classLevel, fingerprint ?? undefined, imageSourceType, cachedChunks);
        } else if (sectionMode === "competitive") {
            res = await explainCompetitive(questionWithEquations, classLevel, fingerprint ?? undefined, imageSourceType, cachedChunks);
        } else {
            res = await explainConceptual(questionWithEquations, classLevel, fingerprint ?? undefined, imageSourceType, cachedChunks);
        }

        console.log(
            `[chat] TIER 3 — section:${sectionMode} | ncertChunks:${res.ncertSources.length}`
        );

        // Background: fact-check then cache (fire-and-forget)
        // Skip response_cache entirely when studentConfusionData is present — a confusion-specific
        // response is personalised to one student's wrong belief and must never be served to others.
        if (fingerprint && lastText.length < 200) {
            const fp = fingerprint;
            const textToCache = res.explanation;
            const skipCache = !!studentConfusionData;
            (async () => {
                try {
                    if (skipCache) {
                        console.log("[cache] Skipping response_cache write — specific_confusion response is not cacheable");
                        return;
                    }
                    const FACT_CHECK_TIMEOUT_MS = 3_000;
                    const check = (await Promise.race([
                        factCheckResponse(textToCache),
                        new Promise<{ hasError: boolean; timedOut: true }>((resolve) =>
                            setTimeout(
                                () => resolve({ hasError: false, timedOut: true }),
                                FACT_CHECK_TIMEOUT_MS
                            )
                        ),
                    ])) as { hasError: boolean; error?: string; timedOut?: boolean };

                    if ((check as { timedOut?: boolean }).timedOut || !check.hasError) {
                        const factChecked = !(check as { timedOut?: boolean }).timedOut;
                        await cacheResponseForMode(fp, textToCache, factChecked);
                        console.log("[chat] TIER 3 CACHED:", fp.cache_key);
                    } else {
                        console.warn("[chat] Fact-check flagged (not cached):", check.error);
                    }
                } catch (e) {
                    console.warn("[chat] Background cache error:", e);
                }
            })();
        }

        // Log session usage (AI cost is already logged inside the explain function)
        logUsage({
            sessionId: userId,
            taskType: "chat_response",
            provider: "google",
            model: "gemini-2.5-flash",
            inputChars: lastText.length,
            outputChars: res.explanation.length,
            latencyMs: Date.now() - startTime,
            estimatedCostUsd: 0,
            wasCacheHit: false,
            fingerprintKey: fingerprint?.cache_key,
            metadata: {
                tier: 3,
                section: sectionMode,
                ncertChunks: res.ncertSources.length,
                concept: fingerprint?.concept_id,
                classLevel,
            },
        });

        // ── SESSION CONTEXT: write/update for pgvector caching ────────────────
        if (activeConceptualId) {
            const resolvedCid = fingerprint?.concept_id ?? resolvedConceptId ?? 'unknown';
            const currentTurn = sessionData?.turn_count ?? 0;

            if (!ncertChunksFromSession) {
                // Turn 1 or concept change — always write session, even for cache hits
                // Use ncertSources if available, empty array if cache hit
                const chunksToCache: NCERTChunk[] = res.ncertSources.length > 0
                    ? res.ncertSources.map(s => ({
                        content_text: s.content_text,
                        chapter_name: s.chapter_name,
                        section_name: s.section_name,
                        class_level: s.class_level,
                        similarity: s.similarity,
                    }))
                    : [];

                // Build concepts_covered: add current concept if simulation will run
                const updatedConceptsCovered = [...new Set([
                    ...conceptsCovered,
                    ...(resolvedCid !== 'unknown' && !skipSimulation ? [`${resolvedCid}:${sectionMode}`] : []),
                ])];
                console.log('[SESSION] concepts_covered write:', { resolvedCid, skipSimulation, before: conceptsCovered, after: updatedConceptsCovered });

                const sessionUpsert = await supabaseAdmin
                    .from('session_context')
                    .upsert({
                        session_id: activeConceptualId,
                        current_concept_id: resolvedCid,
                        current_aspect: fingerprint?.aspect ?? null,
                        class_level: classLevel ?? '12',
                        mode: sectionMode ?? 'conceptual',
                        source_type: imageSourceType ?? 'ncert',
                        ncert_chunks: chunksToCache,
                        student_belief: studentConfusionData?.student_belief ?? null,
                        simulation_emphasis: studentConfusionData?.simulation_emphasis ?? null,
                        concepts_covered: updatedConceptsCovered,
                        turn_count: 1,
                        last_active: new Date().toISOString(),
                        conversation_history: [{
                            role: 'user',
                            content: lastText ?? '',
                            turn: 1,
                            timestamp: new Date().toISOString()
                        }]
                    }, {
                        onConflict: 'session_id'
                    });

                if (sessionUpsert.error) {
                    console.error('[session] write failed:', sessionUpsert.error.message);
                } else {
                    console.log('[session] context written for session:', activeConceptualId, 'chunks:', chunksToCache.length, 'concept:', resolvedCid);
                }
            } else {
                // Follow-up turn — update turn count + conversation history + concepts_covered
                const updatedHistory = [
                    ...(sessionData?.conversation_history ?? []).slice(-7),
                    { role: 'user', content: lastText, turn: currentTurn + 1, timestamp: new Date().toISOString() }
                ];

                // FIX Issue 5: Also update concepts_covered on follow-up turns
                // (e.g. when a follow-up triggers a new simulation for same/different concept)
                const existingCovered = (sessionData?.concepts_covered as string[] | undefined) ?? [];
                const followUpCid = fingerprint?.concept_id ?? resolvedConceptId ?? 'unknown';
                const shouldAddConcept = followUpCid !== 'unknown' && !skipSimulation && !existingCovered.includes(followUpCid);
                const followUpConceptsCovered = shouldAddConcept
                    ? [...existingCovered, followUpCid]
                    : existingCovered;

                if (shouldAddConcept) {
                    console.log('[SESSION] follow-up adding concept to concepts_covered:', followUpCid);
                }

                await supabaseAdmin.from('session_context').update({
                    turn_count: currentTurn + 1,
                    last_active: new Date().toISOString(),
                    conversation_history: updatedHistory,
                    concepts_covered: followUpConceptsCovered,
                    simulation_shown: !skipSimulation || (sessionData?.simulation_shown ?? false),
                }).eq('session_id', activeConceptualId);
            }
        }

        const responseScope = resolved?.scope ?? 'local';
        console.log('[SCOPE TRACE] route.ts response:', responseScope, '| resolved?.scope:', resolved?.scope);

        return jsonReply(
            {
                explanation: res.explanation,
                ncertSources: res.ncertSources,
                studentConfusionData,
                conceptDecomposition,
                panelConfig,
                conceptId: fingerprint?.concept_id ?? 'unknown',
                scope: responseScope,
                examMode: sectionMode,
                skipSimulation,
                usage: {
                    tokens: Math.round(res.explanation.length / 4),
                    ncertChunks: res.ncertSources.length,
                    cost: 0,
                },
            },
            200,
            { "X-Fingerprint-Key": fingerprint?.cache_key ?? "" }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[chat] Error:", message);
        return jsonReply({ error: message }, 500);
    }
}
