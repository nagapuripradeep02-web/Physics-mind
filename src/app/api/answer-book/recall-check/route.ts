/**
 * POST /api/answer-book/recall-check
 *
 * The Answer Book's spoken-recall check: a student says the skeleton of an answer
 * from memory, and we report what they covered against the AUTHORED rubric.
 *
 * Request:  multipart/form-data — audio (WAV Blob), question_id
 * Response: 200 RecallResult | 400 bad input | 413 too large
 *           503 stt_unconfigured (client hides the mic) | 502 upstream | 500
 *
 * Rule 18: the model matches, it never composes. Ids are intersected against the
 * authored answer, evidence quotes are verified against the transcript, and the
 * score is summed here from authored marks (see recallGrader.ts).
 *
 * CORS: this is the first route in the repo to need it — the Answer Book is served
 * from a different origin (http://localhost:8100) than the Next dev server.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { sarvamConfigured, sttFromAudio } from '../../../../lib/answerBook/sarvamStt';
import { gradeRecall } from '../../../../lib/answerBook/recallGrader';
import { answerBookQuestionSchema } from '../../../../schemas/answerBook';

export const maxDuration = 60;

const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // ~2.6 min of 16 kHz mono 16-bit WAV; the client caps at 90 s
const ALLOWED_ORIGINS = new Set([
    'http://localhost:8100',
    'http://127.0.0.1:8100',
    'http://localhost:3000',
]);

function corsHeaders(origin: string | null): Record<string, string> {
    // A file:// page sends Origin: null. Echo only known origins; fall back to the
    // documented dev origin so a stray value is never reflected.
    const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'http://localhost:8100';
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
    };
}

export async function OPTIONS(req: Request) {
    return new Response(null, { status: 204, headers: corsHeaders(req.headers.get('origin')) });
}

export async function POST(req: Request) {
    const startTime = Date.now();
    const CORS = corsHeaders(req.headers.get('origin'));
    const fail = (status: number, error: string) => Response.json({ error }, { status, headers: CORS });

    try {
        if (!sarvamConfigured()) return fail(503, 'stt_unconfigured');

        let form: FormData;
        try {
            form = await req.formData();
        } catch {
            return fail(400, 'expected multipart/form-data');
        }

        // ── validate question_id, and never let it escape the questions dir ──
        const rawId = form.get('question_id');
        const questionId = typeof rawId === 'string' ? rawId.trim() : '';
        if (!questionId) return fail(400, 'question_id is required');
        if (!/^[a-z0-9_]+$/.test(questionId)) return fail(400, 'question_id is not valid');

        let question;
        try {
            const path = join(process.cwd(), 'answer-book', 'questions', `${questionId}.json`);
            question = answerBookQuestionSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
        } catch {
            return fail(400, 'unknown question_id');
        }
        if (!question.answer.steps.every((s) => s.recall)) {
            return fail(400, 'this question has no recall rubric authored');
        }

        // ── validate the audio ───────────────────────────────────────────────
        const audio = form.get('audio');
        if (!(audio instanceof Blob)) return fail(400, 'audio file is required');
        if (audio.size === 0) return fail(400, 'audio file is empty');
        if (audio.size > MAX_AUDIO_BYTES) {
            return Response.json({ error: 'recording is too long' }, { status: 413, headers: CORS });
        }

        // ── speech to text ───────────────────────────────────────────────────
        let stt;
        try {
            stt = await sttFromAudio(audio);
        } catch (e) {
            const msg = e instanceof Error ? e.message : '';
            if (msg === 'stt_unconfigured') return fail(503, 'stt_unconfigured');
            console.error('[recall-check] stt failed:', msg);
            return fail(502, 'could not transcribe the recording');
        }

        // ── grade ────────────────────────────────────────────────────────────
        const result = await gradeRecall(question, stt.transcript);

        // Fire-and-forget usage log. usageLogger imports supabaseAdmin, which throws at
        // module scope without Supabase env — keep it off the critical path entirely.
        void (async () => {
            try {
                const { logUsage } = await import('../../../../lib/usageLogger');
                await logUsage({
                    taskType: 'answer_book_recall',
                    provider: 'google',
                    model: 'gemini-2.5-flash',
                    inputChars: result.promptChars,
                    outputChars: result.outputChars,
                    latencyMs: Date.now() - startTime,
                    estimatedCostUsd:
                        stt.costUsd + (result.promptChars / 1000) * 0.0001 + (result.outputChars / 1000) * 0.0006,
                    wasCacheHit: false,
                    metadata: {
                        question_id: questionId,
                        outcome: result.outcome,
                        audio_seconds: Math.round(stt.audioSeconds),
                        detected_language: stt.languageCode,
                        marks_earned: result.marks_earned,
                        covered: result.steps.filter((s) => s.bucket === 'covered').length,
                        missed: result.steps.filter((s) => s.bucket === 'missed').length,
                        unsure: result.steps.filter((s) => s.bucket === 'unsure').length,
                        // a rising demotion rate is a prompt-quality signal
                        demotions: result.steps.filter((s) => s.demoted_by).map((s) => s.demoted_by),
                    },
                });
            } catch {
                /* logging must never break a student's check */
            }
        })();

        const { promptChars, outputChars, ...payload } = result;
        void promptChars;
        void outputChars;
        return Response.json(payload, { headers: CORS });
    } catch (e) {
        console.error('[recall-check] unexpected:', e);
        return fail(500, 'could not check that recording');
    }
}
