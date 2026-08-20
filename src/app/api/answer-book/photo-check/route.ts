/**
 * POST /api/answer-book/photo-check
 *
 * A student writes the answer by hand, photographs it (or exports a PDF), and
 * uploads it. A vision model reports which authored steps it can see; the browser
 * shows those as a tick-list and only what the student CONFIRMS becomes a mark.
 *
 * Request:  multipart/form-data — page (image/* or application/pdf), question_id
 * Response: 200 result | 400 bad input | 413 too large | 503 not configured | 500
 *
 * Rule 18: the model reads, it never composes physics and never sees a mark value.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { gradePhoto } from '../../../../lib/answerBook/photoGrader';
import { answerBookQuestionSchema } from '../../../../schemas/answerBook';

export const maxDuration = 60;

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']);
const ALLOWED_ORIGINS = new Set([
    'http://localhost:8100',
    'http://127.0.0.1:8100',
    'http://localhost:3000',
]);

function corsHeaders(origin: string | null): Record<string, string> {
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
    const CORS = corsHeaders(req.headers.get('origin'));
    const fail = (status: number, error: string) => Response.json({ error }, { status, headers: CORS });

    try {
        // Validate the request before the config check, so a client bug is never
        // reported as "not configured" (which tells the client to hide the button).
        let form: FormData;
        try {
            form = await req.formData();
        } catch {
            return fail(400, 'expected multipart/form-data');
        }

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
            return fail(400, 'this question has no rubric authored');
        }

        const page = form.get('page');
        if (!(page instanceof Blob)) return fail(400, 'page file is required');
        if (page.size === 0) return fail(400, 'page file is empty');
        if (page.size > MAX_BYTES) {
            return Response.json({ error: 'that file is too large' }, { status: 413, headers: CORS });
        }
        const mediaType = (page.type || '').toLowerCase();
        if (!ALLOWED_TYPES.has(mediaType)) {
            return fail(400, 'upload a photo (JPEG, PNG, WebP, HEIC) or a PDF');
        }

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return fail(503, 'photo_check_unconfigured');

        const bytes = new Uint8Array(await page.arrayBuffer());
        const result = await gradePhoto(question, bytes, mediaType);

        // Fire-and-forget. usageLogger pulls in supabaseAdmin, which throws at module
        // scope without Supabase env — keep it off the critical path entirely.
        void (async () => {
            try {
                const { logUsage } = await import('../../../../lib/usageLogger');
                await logUsage({
                    taskType: 'answer_book_photo',
                    provider: 'google',
                    model: 'gemini-2.5-flash',
                    inputChars: result.promptChars,
                    outputChars: result.outputChars ?? 0,
                    latencyMs: 0,
                    estimatedCostUsd: 0,
                    wasCacheHit: false,
                    metadata: {
                        question_id: questionId,
                        outcome: result.outcome,
                        media_type: mediaType,
                        bytes: page.size,
                        proposed_covered: result.steps.filter((s) => s.bucket === 'covered').length,
                        proposed_unsure: result.steps.filter((s) => s.bucket === 'unsure').length,
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
        console.error('[photo-check] unexpected:', e);
        return fail(500, 'could not read that page');
    }
}
