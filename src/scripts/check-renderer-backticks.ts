/**
 * check:renderer-backticks — the mechanical gate the backtick scar has been owed
 * since it was first filed.
 *
 * A renderer's JS body lives inside a TypeScript template literal, so ONE stray
 * backtick anywhere inside it — most often in a comment, where syntax feels like
 * it does not matter — terminates the literal early. The class has now recurred
 * across three sessions and three concepts (kinetic_particle_theory,
 * vsepr_molecular_shapes, hybridisation_sp_sp2_sp3 twice in one session), each
 * time costing a build cycle.
 *
 * Measured, not assumed: tsc and esbuild DO report the correct line (both 2026-07-29
 * instances were localised exactly). What they do not report is the CAUSE — the
 * message is `TS1005: ',' expected` or `Expected ";" but found "l"`, which reads
 * like a typo in the code rather than a terminated string, so the eye goes looking
 * for a missing comma. This gate exists for the diagnosis, not the line number.
 *
 * Why the obvious lint does not work: backticks are perfectly legal in these
 * files OUTSIDE the literal (field_3d alone has 28 line-comments containing one,
 * in its interface docs and assembler). Scanning for "a comment with a backtick"
 * reports 30 false positives and would be switched off within a week. So this
 * locates the literal's SPAN and only judges what is inside it.
 *
 * Runs on the SOURCE TEXT, never on an import, so it still works when the file is
 * too broken for tsc or esbuild to load — which is exactly when it is needed.
 *
 * Run: npm run check:renderer-backticks
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TARGETS: Array<{ file: string; constName: string }> = [
    { file: 'src/lib/renderers/field_3d_renderer.ts', constName: 'FIELD_3D_RENDERER_CODE' },
    { file: 'src/lib/renderers/particle_field_renderer.ts', constName: 'PARTICLE_FIELD_RENDERER_CODE' },
    { file: 'src/lib/renderers/parametric_renderer.ts', constName: 'PARAMETRIC_RENDERER_CODE' },
];

const lineOf = (src: string, idx: number): number => src.slice(0, idx).split('\n').length;

/** Index of the next backtick at or after `from` that is not escaped by a backslash. */
function nextUnescapedBacktick(src: string, from: number): number {
    for (let i = from; i < src.length; i++) {
        if (src[i] !== '`') continue;
        let slashes = 0;
        for (let j = i - 1; j >= 0 && src[j] === '\\'; j--) slashes++;
        if (slashes % 2 === 0) return i;
    }
    return -1;
}

let failures = 0;

for (const { file, constName } of TARGETS) {
    const path = join(process.cwd(), file);
    let src: string;
    try {
        src = readFileSync(path, 'utf-8');
    } catch {
        console.log(`  SKIP  ${file} (not present)`);
        continue;
    }

    const decl = new RegExp(`export\\s+const\\s+${constName}\\s*=\\s*\``);
    const m = decl.exec(src);
    if (!m) {
        console.error(`  FAIL  ${file}: could not find "export const ${constName} = \`" — has it been renamed?`);
        failures++;
        continue;
    }

    const open = m.index + m[0].length - 1;          // index OF the opening backtick
    const close = nextUnescapedBacktick(src, open + 1);
    if (close < 0) {
        console.error(`  FAIL  ${file}: ${constName} template literal is never closed.`);
        failures++;
        continue;
    }

    // If the literal closed where it was meant to, the very next non-whitespace
    // character is the statement terminator. Anything else means the backtick we
    // found is a STRAY one inside the body and the literal ended early — which is
    // precisely the defect, caught at its own line instead of downstream.
    const after = src.slice(close + 1).match(/^\s*([;\S])/);
    const terminator = after ? after[1] : '';
    if (terminator === ';') {
        const bodyLines = src.slice(open, close).split('\n').length;
        console.log(`  ok    ${file}: ${constName} spans ${bodyLines} lines, closes cleanly`);
        continue;
    }

    const ln = lineOf(src, close);
    const lineText = src.split('\n')[ln - 1] ?? '';
    console.error(`  FAIL  ${file}:${ln}: stray backtick inside ${constName} — it TERMINATES the template literal here.`);
    console.error(`        ${lineText.trim().slice(0, 120)}`);
    console.error(`        The next character after it is ${JSON.stringify(terminator)}, not ";".`);
    console.error(`        Fix: remove the backtick (use plain text or "double quotes" in renderer comments).`);
    failures++;
}

if (failures > 0) {
    console.error(`\n❌ ${failures} renderer(s) with a stray backtick. tsc/esbuild would report this far from its cause.`);
    process.exit(1);
}
console.log('\n✅ All renderer template literals close exactly where they should.');
