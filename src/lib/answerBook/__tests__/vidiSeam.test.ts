/**
 * vidiSeam.test.ts — the two Vidi guards that no other gate can see.
 *
 * 1. PERSONA PARITY. The deployed Edge Function and the localhost mirror carry a
 *    COPY-PASTED persona — no shared import, different runtimes. The shakedown
 *    certifies the mirror's persona; if the two ever drift, every shakedown result
 *    is certifying a persona that is not the one students talk to, and every
 *    existing gate stays green while it happens. The only prior check was a manual
 *    `node -e` pasted in docs/notes/answer_book_hosting.md.
 *
 * 2. plain(). Bubbles render with textContent, so a markdown slip from the model
 *    reaches the student as a literal asterisk. plain() is the belt-and-braces
 *    strip. It was described as "unit-checked" before any unit test existed.
 *    Extracted from the SHIPPED notebook.js rather than reimplemented — a test of
 *    a copy would pass while the real one rotted.
 *
 *   npx vitest run src/lib/answerBook/__tests__/vidiSeam.test.ts
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const read = (...p: string[]) => readFileSync(join(root, ...p), 'utf8');

/** The persona array literal, sliced the same way in both files.
 *  `\r` is stripped, as the manual one-liner in docs/notes/answer_book_hosting.md
 *  always did: core.autocrlf is true and there is no .gitattributes rule for *.ts,
 *  so a checkout that gives one file CRLF would report all 26 lines as drift. */
function personaBlock(src: string, file: string): string {
    const a = src.indexOf('const PERSONA = [');
    expect(a, `no PERSONA array in ${file}`).toBeGreaterThan(-1);
    const b = src.indexOf("].join('", a);
    expect(b, `unterminated PERSONA array in ${file}`).toBeGreaterThan(a);
    return src.slice(a, b).replace(/\r/g, '');
}

/** The PER-REQUEST situation block, sliced the same way in both files.
 *  It was unguarded until 2026-09-02: only PERSONA was parity-checked, so the two
 *  copies of the steering that sits NEXT TO the question — the half the 2026-08-24
 *  audit measured as the half the model actually obeys — could drift silently. The
 *  out-of-bank scope-creep clause lives here, not in PERSONA. */
function situationBlock(src: string, file: string): string {
    const a = src.indexOf('const situation = [');
    expect(a, `no situation array in ${file}`).toBeGreaterThan(-1);
    const b = src.indexOf('].filter(Boolean).join(', a);
    expect(b, `unterminated situation array in ${file}`).toBeGreaterThan(a);
    return src.slice(a, b).replace(/\r/g, '');
}

describe('Vidi persona parity — the deployed function and the local mirror', () => {
    const edgeFile = join('supabase', 'functions', 'answerbook-vidi-chat', 'index.ts');
    const mirrorFile = join('src', 'scripts', 'answerbook_vidi_server.ts');
    const edge = personaBlock(read(edgeFile), edgeFile);
    const mirror = personaBlock(read(mirrorFile), mirrorFile);

    it('are byte-identical', () => {
        // Reported as a line diff, not a 4KB blob, so a failure is readable.
        const a = edge.split('\n');
        const b = mirror.split('\n');
        const diffs: string[] = [];
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            if (a[i] !== b[i]) diffs.push(`line ${i}:\n  edge  : ${a[i] ?? '(absent)'}\n  mirror: ${b[i] ?? '(absent)'}`);
        }
        expect(diffs.join('\n'), 'persona drift — a shakedown against the mirror would certify the wrong persona').toBe('');
    });

    it('have a byte-identical per-request situation block too', () => {
        const a = situationBlock(read(edgeFile), edgeFile).split('\n');
        const b = situationBlock(read(mirrorFile), mirrorFile).split('\n');
        const diffs: string[] = [];
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            if (a[i] !== b[i]) diffs.push(`line ${i}:\n  edge  : ${a[i] ?? '(absent)'}\n  mirror: ${b[i] ?? '(absent)'}`);
        }
        expect(diffs.join('\n'), 'situation-block drift — the mirror would steer differently from the deployed function').toBe('');
    });

    it('do not re-grant the out-of-bank offer that caused scope creep', () => {
        // Graders measured ~15% of off-paper asks answering the OPEN question unasked
        // (2026-08-30, ~10-16% fleet-wide). The cause was this clause literally granting
        // "one short sentence offering to help with the question that IS open". It was
        // removed 2026-09-02. All three mechanical proxies for the defect under-detect it,
        // so if the grant comes back nothing else will catch it.
        for (const src of [situationBlock(read(edgeFile), edgeFile), situationBlock(read(mirrorFile), mirrorFile)]) {
            expect(src, 'the out-of-bank "offer to help" grant is back').not.toContain('offering to help with the question that IS open');
        }
    });

    it('still carry the rules the founder audit added', () => {
        // Each of these was a real defect in a real chat transcript. A persona
        // rewrite that silently drops one must fail here, not in front of a student.
        for (const rule of [
            'ANSWER IN THE SAME LANGUAGE THE STUDENT WROTE IN',   // answered English in Telugu
            'Stars are about exam frequency, never difficulty',   // called stars a difficulty rating
            'Never promise that a question will appear',          // "very likely question"
            'THE APP AROUND YOU',                                 // did not know its own rename box
            'Write PLAIN TEXT only',                              // leaked **bold**
            'NEVER invent a step, a mark value, or a mark split', // invented a 4-mark scheme
            'EARNS THE MARK FOR',                                 // the step→mark mapping now in context
            'not a rubric issued by the board',                   // every split is still unverified
            'never the skipped step itself',                      // skiplast named the skipped step as the minimum (audit 2026-08-24)
            'never assume each step is one mark',                 // collisions LAQ: 7 steps, one 2M row, "1 mark each"
            'no asked years are listed',                          // fabricated "asked years" on starred cards with no Asked line
            'never translate them into Telugu words',             // శక్తి for force — a wrong statement a student memorizes
        ]) {
            expect(edge, `persona lost: ${rule}`).toContain(rule);
        }
    });
});

describe('plain() — the markdown strip between the model and the student', () => {
    // Extract the shipped function body and evaluate it. Testing a reimplementation
    // would pass forever while the real one rotted.
    const js = read('answer-book', 'notebook.js');
    const start = js.indexOf('function plain(text) {');
    expect(start, 'plain() not found in notebook.js').toBeGreaterThan(-1);
    const end = js.indexOf('\n    }', start);
    const source = js.slice(start, end + 6);
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const plain = new Function(`${source}; return plain;`)() as (t: unknown) => string;

    it('strips the marks a model actually leaks', () => {
        expect(plain('**Statement** carries 2 marks')).toBe('Statement carries 2 marks');
        expect(plain('the *resultant* vector')).toBe('the resultant vector');
        expect(plain('use `R = P + Q` here')).toBe('use R = P + Q here');
        expect(plain('## How much to write')).toBe('How much to write');
        expect(plain('- write the statement\n- draw the figure')).toBe('write the statement\ndraw the figure');
    });

    it('leaves real physics text alone', () => {
        // The multiplication star is what makes this dangerous to write. A SINGLE
        // star can never match a *...* rule, so "3 * 4" proves nothing — the real
        // hazard is TWO stars in one line, where a greedy /\*([^*\n]+)\*/ eats the
        // arithmetic and silently hands the student "3  4  5". Verified by mutation.
        expect(plain('v = 3 * 4 * 5 units')).toBe('v = 3 * 4 * 5 units');
        expect(plain('a * b * c * d')).toBe('a * b * c * d');
        expect(plain('area is 3 * 4 = 12')).toBe('area is 3 * 4 = 12');
        expect(plain('R = √(P² + Q² + 2PQ cos θ)')).toBe('R = √(P² + Q² + 2PQ cos θ)');
        expect(plain('write T² ∝ a³ and stop')).toBe('write T² ∝ a³ and stop');
        // Telugu code-mix must survive untouched (Rule 30 code-mix, text only).
        expect(plain('ఉపగ్రహం లోపల effective g సున్నా')).toBe('ఉపగ్రహం లోపల effective g సున్నా');
    });

    it('never throws on what a broken response can hand it', () => {
        expect(plain(null)).toBe('');
        expect(plain(undefined)).toBe('');
        expect(plain('')).toBe('');
        expect(plain(42)).toBe('42');
    });
});

describe('chapterMates() - the chapter 3-star set in Vidi grounding text', () => {
    // Extracted from the SHIPPED notebook.js, like plain() above. subjectOf, unitKey,
    // questionUnitKey and chapterMates are contiguous and end at a sentinel comment;
    // chapterMates closes over UNITS, so the block is evaluated with UNITS injected.
    const js = read('answer-book', 'notebook.js');
    const start = js.indexOf('function subjectOf(u)');
    expect(start, 'subjectOf() not found in notebook.js').toBeGreaterThan(-1);
    const end = js.indexOf('// --- end of the Vidi context key helpers ---', start);
    expect(end, 'helper sentinel not found in notebook.js').toBeGreaterThan(start);
    const source = js.slice(start, end).split(String.fromCharCode(13)).join('');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const make = new Function('UNITS', source + '; return chapterMates;') as
        (u: unknown) => (q: unknown, limit?: number) => string[];

    // Physics Unit 3 and Maths Unit 3 are different chapters sharing a bare number,
    // and physics sorts first in UNITS - the exact collision this guards.
    const UNITS = [
        {
            number: 3, name: 'Motion in a Straight Line', questions: [
                { question_id: 'ts_ipe_p1_msl_a', stars: 3, section: 'LAQ', number: 1, text: 'derive v = u + at' },
                { question_id: 'ts_ipe_p1_msl_b', stars: 3, section: 'SAQ', number: 2, text: 'stopping distance' },
            ],
        },
        {
            number: 3, name: 'Matrices', subject: 'mathematics', questions: [
                { question_id: 'ts_ipe_m1a_mat_a', stars: 3, section: 'LAQ', number: 1, text: 'solve by Cramer rule' },
                { question_id: 'ts_ipe_m1a_mat_self', stars: 3, section: 'VSAQ', number: 2, text: 'find the trace' },
            ],
        },
        {
            number: 3, name: 'The Straight Line', subject: 'mathematics_1b', questions: [
                { question_id: 'ts_ipe_m1b_sl_a', stars: 3, section: 'LAQ', number: 1, text: 'find the orthocentre' },
            ],
        },
    ];
    const chapterMates = make(UNITS);

    it('gives a maths card its OWN chapter, never the physics unit of the same number', () => {
        // Before the subject-key fix this returned the two PHYSICS questions: the loop
        // compared bare .number and physics is reached first, so 227 of 250 Maths-1A
        // cards were grounded in a chapter the student had never opened.
        const mates = chapterMates({
            question_id: 'ts_ipe_m1a_mat_self', subject: 'mathematics', unit: { number: 3, name: 'Matrices' },
        }).join(' | ');
        expect(mates).toContain('Cramer');
        expect(mates).not.toContain('u + at');
        expect(mates).not.toContain('stopping distance');
    });

    it('separates the two maths PAPERS, which also share unit numbers', () => {
        const mates = chapterMates({
            question_id: 'ts_ipe_m1b_other', subject: 'mathematics_1b', unit: { number: 3, name: 'The Straight Line' },
        }).join(' | ');
        expect(mates).toContain('orthocentre');
        expect(mates).not.toContain('Cramer');
    });

    it('still reads an absent subject as physics', () => {
        // Physics units carry no subject field - the absent-means-physics rule.
        const mates = chapterMates({
            question_id: 'ts_ipe_p1_msl_a', unit: { number: 3, name: 'Motion in a Straight Line' },
        }).join(' | ');
        expect(mates).toContain('stopping distance');
        expect(mates).not.toContain('Cramer');
    });

    it('never lists the open question as its own chapter-mate', () => {
        const mates = chapterMates({
            question_id: 'ts_ipe_m1a_mat_self', subject: 'mathematics', unit: { number: 3, name: 'Matrices' },
        }).join(' | ');
        expect(mates).not.toContain('find the trace');
    });
});
