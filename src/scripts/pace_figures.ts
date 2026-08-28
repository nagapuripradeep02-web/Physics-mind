/**
 * pace_figures.ts — fill every stroke's `ms` from its path length at a fixed,
 * deliberately slow hand speed, so no stroke ever races (founder, 2026-08-25:
 * a student must be able to WATCH a diagram being drawn and copy it).
 *
 *   npx tsx src/scripts/pace_figures.ts --file answer-book/questions/<id>.json [--write]
 *   npx tsx src/scripts/pace_figures.ts --prefix ts_ipe_z1 [--write] [--force]
 *
 *   --speed 70      units per second (default 70; the gate allows 40–160)
 *   --label-ms 450  fade for labels missing an ms
 *   --force         retime strokes that already carry an ms (default: only fill
 *                   strokes whose ms is missing or 0 — the authoring placeholder)
 *   --write         write the file back; otherwise a dry run
 *
 * Authors write the path (`d`) and the phases (`pause` elements) and leave
 * `"ms": 0` on strokes; this tool fills the timing. One implementation of the
 * length measure is shared with the gate (src/lib/answerBook/pathLength.ts).
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { pathLength, paceMs } from '../lib/answerBook/pathLength';

const ROOT = process.cwd();
const QDIR = join(ROOT, 'answer-book', 'questions');
const args = process.argv.slice(2);
const opt = (name: string, dflt: string): string => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const FILE = opt('--file', '');
const PREFIX = opt('--prefix', '');
const SPEED = parseFloat(opt('--speed', '70'));
const LABEL_MS = parseInt(opt('--label-ms', '450'), 10);
const FORCE = args.includes('--force');
const WRITE = args.includes('--write');

if (!FILE && !PREFIX) {
    console.error('usage: pace_figures.ts (--file <path> | --prefix <id_prefix>) [--speed 70] [--force] [--write]');
    process.exit(2);
}
const files = FILE
    ? [FILE]
    : readdirSync(QDIR).filter((f) => f.startsWith(PREFIX) && f.endsWith('.json')).sort().map((f) => join(QDIR, f));

let changedFiles = 0, changedStrokes = 0, changedLabels = 0;
for (const path of files) {
    const raw = readFileSync(path, 'utf8');
    const q = JSON.parse(raw);
    let touched = false;
    for (const step of q.answer?.steps || []) {
        if (step.kind !== 'diagram' || !step.figure) continue;
        let figMs = 0;
        for (const e of step.figure.elements) {
            if (e.type === 'stroke') {
                if (FORCE || !e.ms) {
                    const ms = paceMs(pathLength(e.d), SPEED);
                    if (ms !== e.ms) { e.ms = ms; touched = true; changedStrokes++; }
                }
            } else if (e.type === 'label') {
                if (!e.ms) { e.ms = LABEL_MS; touched = true; changedLabels++; }
            }
            if (e.type !== 'pause') figMs += e.ms + 110;
        }
        const pauses = step.figure.elements.filter((e: any) => e.type === 'pause').length;
        console.log(`${q.question_id} / ${step.figure.id}: ${step.figure.elements.length - pauses} elements, ${pauses} phase boundar${pauses === 1 ? 'y' : 'ies'}, ~${(figMs / 1000).toFixed(1)} s at ${SPEED} u/s`);
    }
    if (touched) {
        changedFiles++;
        if (WRITE) {
            // keep the file's own line endings
            const eol = raw.includes('\r\n') ? '\r\n' : '\n';
            writeFileSync(path, JSON.stringify(q, null, 2).replace(/\n/g, eol) + eol, 'utf8');
        }
    }
}
console.log(`\n${changedStrokes} stroke(s) and ${changedLabels} label(s) timed across ${changedFiles} file(s)${WRITE ? ' — written' : ' — dry run (pass --write)'}`);
