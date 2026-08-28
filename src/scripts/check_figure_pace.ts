/**
 * check_figure_pace.ts — THE PACE GATE for answer-book figures.
 *
 *   npx tsx src/scripts/check_figure_pace.ts                     # report everything (warnings)
 *   npx tsx src/scripts/check_figure_pace.ts --strict ts_ipe_z1  # hard-fail on that prefix
 *   npm run check:figure-pace                                    # = the zoology strict run
 *
 * A figure's drawing speed is authored per element (`ms`) and the player is
 * purely time-based, so a long stroke given a short `ms` visibly RACES — and no
 * e2e gate ever watches the animation (they all take the instant path). This
 * script measures each stroke's path length in figure units and reports the
 * implied hand speed (units/second). For the strict prefix it fails when:
 *   - a stroke draws faster than MAX u/s or slower than MIN u/s;
 *   - a figure with >= PHASE_MIN drawn elements has no phase (`pause`) at all —
 *     a complex diagram must be drawn in named steps a student can follow.
 * Everything outside the strict prefix is reported as a warning only, so the
 * 96 legacy figures are never retimed by this gate. (First sweep, 2026-08-25:
 * legacy strokes run 200–770 u/s — that is the rushing the founder named.)
 *
 * Speed bands (founder directive 2026-08-25: "never rushed"): authoring targets
 * ~70 u/s via `pace_figures.ts`; the gate allows 40–160. Labels are fades, not
 * strokes — not checked.
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { pathLength } from '../lib/answerBook/pathLength';
import { answerBookQuestionSchema } from '../schemas/answerBook';

/**
 * Does this branch's schema actually ACCEPT a phase marker?
 *
 * This gate was ported from the zoology branch, where `{type:'pause'}` is part
 * of the figure element union and `notebook.js` knows how to stop on one. Here
 * neither exists — the union is `stroke | label` and the player has no pause
 * handling — so demanding a phase on a big figure demanded something that
 * cannot be authored. Two chapter agents hit the contradiction on the same day
 * and both worked around it by capping figures at 15 drawn elements.
 *
 * Rather than hardcode "this branch has no pause", PROBE the schema. The day the
 * phased-figure mechanism lands (schema + player together, as a platform change
 * under Rule 40 rather than inside a chapter branch) this gate resumes enforcing
 * phases on its own, with no edit here.
 */
const PHASES_SUPPORTED = (() => {
    const probe = {
        schema_version: 'answer_book_v1', question_id: 'probe', board: 'ts_ipe',
        board_label: 'probe', subject: 'physics_2', year_cycle: 'second_year',
        class_label: 'probe', unit: { number: 1, name: 'probe' }, chapter: 'probe',
        qtype: 'VSAQ', marks_total: 1, paper_section: 'Section A', expected_time_min: 1,
        question_text: 'probe', appearances: [], mark_split: [{ label: 'probe', marks: 1 }],
        verification: { status: 'unverified', needs_teacher_verification: true, note: 'probe' },
        recall_prompt: 'probe',
        answer: {
            page_header: ['probe'],
            steps: [{
                id: 's1', kind: 'diagram', label: 'probe', marks: 1, lines: ['probe'],
                figure: {
                    id: 'f1', width: 10, height: 10,
                    elements: [
                        { type: 'stroke', id: 'a', d: 'M 0 0 L 1 1', ms: 100 },
                        { type: 'pause', id: 'p', caption: 'probe' },
                        { type: 'stroke', id: 'b', d: 'M 1 1 L 2 2', ms: 100 },
                    ],
                },
            }],
        },
    };
    return answerBookQuestionSchema.safeParse(probe).success;
})();

const ROOT = process.cwd();
const QDIR = join(ROOT, 'answer-book', 'questions');

const args = process.argv.slice(2);
const opt = (name: string, dflt: string): string => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const STRICT = opt('--strict', '');
const MIN = parseFloat(opt('--min', '40'));
const MAX = parseFloat(opt('--max', '160'));
const PHASE_MIN = parseInt(opt('--phase-min', '16'), 10);
const ONLY = opt('--only', '');   // limit the report to this prefix
const VERBOSE = args.includes('--verbose');

type Finding = { file: string; fig: string; msg: string };
const fails: Finding[] = [];
const warns: Finding[] = [];
let figures = 0, strokes = 0, strictFigures = 0;

const files = readdirSync(QDIR).filter((f) => f.endsWith('.json') && (!ONLY || f.startsWith(ONLY))).sort();
for (const f of files) {
    const q = JSON.parse(readFileSync(join(QDIR, f), 'utf8'));
    const strict = STRICT !== '' && f.startsWith(STRICT);
    for (const step of q.answer?.steps || []) {
        if (step.kind !== 'diagram' || !step.figure) continue;
        const fig = step.figure;
        figures++;
        if (strict) strictFigures++;
        const sink = strict ? fails : warns;
        const els: any[] = fig.elements;
        const drawn = els.filter((e) => e.type !== 'pause').length;
        const pauses = els.filter((e) => e.type === 'pause').length;
        if (drawn >= PHASE_MIN && pauses === 0) {
            const msg = `${drawn} drawn elements and NO phase — a complex figure must be drawn in named steps (add pause elements)`;
            // Only a FAILURE where a phase can actually be authored. Where the
            // schema rejects `pause`, this is a real gap in the platform, not a
            // fault in the card — so it warns and names the missing mechanism
            // instead of blocking a chapter on something unauthorable.
            if (PHASES_SUPPORTED) sink.push({ file: f, fig: fig.id, msg });
            else warns.push({ file: f, fig: fig.id, msg: `${msg} — but this branch's schema has NO pause element, so the figure cannot be phased. Port the phased-figure mechanism (schema + notebook.js player) as a platform change, or keep figures under ${PHASE_MIN} drawn elements.` });
        }
        let totalMs = 0;
        for (const e of els) {
            if (e.type === 'pause') continue;
            totalMs += e.ms + 110;
            if (e.type !== 'stroke') continue;
            strokes++;
            const L = pathLength(e.d);
            if (!(L > 0)) { sink.push({ file: f, fig: fig.id, msg: `stroke "${e.id}" has zero measurable length: ${e.d}` }); continue; }
            const speed = (L / e.ms) * 1000;
            if (speed > MAX) sink.push({ file: f, fig: fig.id, msg: `stroke "${e.id}" RACES: ${L.toFixed(0)} u in ${e.ms} ms = ${speed.toFixed(0)} u/s (max ${MAX})` });
            else if (speed < MIN && L > 12) sink.push({ file: f, fig: fig.id, msg: `stroke "${e.id}" crawls: ${L.toFixed(0)} u in ${e.ms} ms = ${speed.toFixed(0)} u/s (min ${MIN})` });
        }
        if (strict && VERBOSE) {
            console.log(`  ${f} / ${fig.id}: ${drawn} elements, ${pauses} phase boundar${pauses === 1 ? 'y' : 'ies'}, ~${(totalMs / 1000).toFixed(1)} s`);
        }
    }
}

console.log(`figures: ${figures} (${strictFigures} strict under "${STRICT || '—'}") · strokes measured: ${strokes}`);
if (warns.length) {
    console.log(`\n${warns.length} warning(s) outside the strict prefix (legacy figures are never retimed by this gate):`);
    for (const w of warns.slice(0, 40)) console.log(`  ~ ${w.file} / ${w.fig}: ${w.msg}`);
    if (warns.length > 40) console.log(`  … ${warns.length - 40} more`);
}
if (fails.length) {
    console.log(`\n${fails.length} FAILURE(s) in "${STRICT}":`);
    for (const x of fails) console.log(`  - ${x.file} / ${x.fig}: ${x.msg}`);
    process.exit(1);
}
console.log(STRICT ? `\npace gate PASS for "${STRICT}".` : '\n(no --strict prefix: report only)');
