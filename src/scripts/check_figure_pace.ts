/**
 * check_figure_pace.ts — THE PACE GATE for answer-book figures.
 *
 *   npx tsx src/scripts/check_figure_pace.ts                     # report everything (warnings)
 *   npx tsx src/scripts/check_figure_pace.ts --strict ts_ipe_z1  # hard-fail on that prefix
 *   npx tsx src/scripts/check_figure_pace.ts --strict ts_ipe_z1,ts_ipe_c2,ts_ipe_m2b   # several
 *   npm run check:figure-pace                                    # = every retimed subject, strict
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

const ROOT = process.cwd();
const QDIR = join(ROOT, 'answer-book', 'questions');

const args = process.argv.slice(2);
const opt = (name: string, dflt: string): string => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
/**
 * `--strict` with nothing after it degrades SILENTLY to report-only: `opt` returns
 * '' when the next token is missing, ''.split(',').filter(Boolean) is [], and
 * [].some() is false for every file — so every finding lands in the warnings
 * bucket and the run still exits 0 saying "report only". A gate an argument slip
 * can switch off without saying so is not a gate: a package.json script ending in
 * a bare `--strict` shipped exactly that on 2026-08-29, and it was caught by a
 * sibling session rather than by this script. Passing the flag means asking for
 * the gate, so a missing value is now a hard error.
 */
if (args.includes('--strict') && !opt('--strict', '')) {
    console.error('✗ --strict needs a prefix (or a comma-separated list): --strict ts_ipe_c2,ts_ipe_m2a');
    console.error('  omit --strict entirely for the report-only run.');
    process.exit(2);
}
// --strict takes a COMMA-SEPARATED list of prefixes: every subject built under the
// phased-figure contract is strict, and they accumulate (ts_ipe_z1, then ts_ipe_b2,
// then ts_ipe_m2a). The pre-contract figures stay outside it and are reported as
// warnings only. Three sessions built this list independently inside one week; this
// is the Botany-II implementation, kept because it landed first (Rule 40a).
const STRICT = opt('--strict', '');
const STRICT_LIST = STRICT.split(',').map((s) => s.trim()).filter(Boolean);
const isStrict = (f: string): boolean => STRICT_LIST.some((p) => f.startsWith(p));
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
    const strict = isStrict(f);
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
            sink.push({ file: f, fig: fig.id, msg: `${drawn} drawn elements and NO phase — a complex figure must be drawn in named steps (add pause elements)` });
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
