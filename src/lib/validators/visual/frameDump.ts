/**
 * Frame dump — writes a CaptureResult's PNGs to disk so a human (or Claude,
 * per AUTHORING_PIPELINE.md §3 "THE EYE") can actually LOOK at every frame
 * before a simulation is presented to the founder.
 *
 * Layout: .visual_runs/<concept_id>/<yyyyMMdd-HHmmss>/
 *   <STATE_N>__panel_a.png            per-state static render
 *   <STATE_N>__panel_b.png            (multi-panel only)
 *   <STATE_N>__combined.png           (multi-panel only)
 *   <STATE_N>__dense_t<ms>.png        dense series frames (when captured)
 *   KEYFRAMES_<STATE_N>__t<ms>.png    legacy 5-keyframe series (when captured)
 *   manifest.json                     index of everything + warnings + timings
 *
 * .visual_runs/ is gitignored — runs are working artifacts, not repo content.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Buffer } from 'node:buffer';
import type { CaptureResult } from './screenshotter';
import type { CheckResult } from './spec';
import { tally } from './skipReport';

export interface FrameDumpEntry {
    role: 'state_panel_a' | 'state_panel_b' | 'state_combined' | 'dense' | 'keyframe' | 'i2_formula' | 'frozen';
    state_id: string;
    t_ms?: number;
    /** For i2_formula frames: the TTS sentence id + LaTeX expression shown. */
    sentence_id?: string;
    expression?: string;
    path: string;
}

export interface FrameDumpResult {
    dir: string;
    files: string[];
    manifestPath: string;
    entries: FrameDumpEntry[];
}

export interface DumpCaptureOptions {
    conceptId: string;
    capture: CaptureResult;
    /** Root folder for runs. Default: <cwd>/.visual_runs */
    outRoot?: string;
    /**
     * Deterministic gate results for this run, persisted into the manifest.
     *
     * Without them the run's headline ("27/27 checks passed") lives only in
     * stdout, so a reviewer reading the dump afterwards cannot reproduce the
     * count, see WHICH checks ran, or tell a real pass from a check that never
     * executed. A passing gate with no artifact behind it is not evidence.
     */
    checks?: readonly CheckResult[];
}

function timestampSlug(d: Date): string {
    const p = (n: number, w = 2): string => String(n).padStart(w, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export function dumpCaptureToDisk(opts: DumpCaptureOptions): FrameDumpResult {
    const root = opts.outRoot ?? join(process.cwd(), '.visual_runs');
    const dir = resolve(join(root, opts.conceptId, timestampSlug(new Date())));
    mkdirSync(dir, { recursive: true });

    const entries: FrameDumpEntry[] = [];
    const writePng = (filename: string, b64: string, entry: Omit<FrameDumpEntry, 'path'>): void => {
        const path = join(dir, filename);
        writeFileSync(path, Buffer.from(b64, 'base64'));
        entries.push({ ...entry, path });
    };

    for (const sc of opts.capture.state_captures) {
        writePng(`${sc.state_id}__panel_a.png`, sc.panel_a_png_b64,
            { role: 'state_panel_a', state_id: sc.state_id });
        if (sc.panel_b_png_b64) {
            writePng(`${sc.state_id}__panel_b.png`, sc.panel_b_png_b64,
                { role: 'state_panel_b', state_id: sc.state_id });
        }
        if (sc.combined_png_b64) {
            writePng(`${sc.state_id}__combined.png`, sc.combined_png_b64,
                { role: 'state_combined', state_id: sc.state_id });
        }
        // Category I2 per-formula equation-panel frames (TTS math_show replayed).
        (sc.i2_frames ?? []).forEach((f, i) => {
            writePng(`${sc.state_id}__i2_${String(i + 1).padStart(2, '0')}_${f.sentence_id}.png`, f.panel_a_png_b64,
                { role: 'i2_formula', state_id: sc.state_id, sentence_id: f.sentence_id, expression: f.expression });
        });
        // Deterministic frozen frame (H2 regression source — visual_approve
        // copies this into visual_baselines/<concept>/<STATE>__frozen.png).
        if (sc.frozen_png_b64) {
            writePng(`${sc.state_id}__frozen.png`, sc.frozen_png_b64,
                { role: 'frozen', state_id: sc.state_id });
        }
    }

    for (const series of opts.capture.dense_timeseries ?? []) {
        series.frames_b64.forEach((b64, i) => {
            const t = series.capture_times_ms[i] ?? i * 1000;
            writePng(`${series.state_id}__dense_t${String(t).padStart(5, '0')}.png`, b64,
                { role: 'dense', state_id: series.state_id, t_ms: t });
        });
    }

    const ats = opts.capture.animation_timeseries;
    if (ats) {
        ats.frames_b64.forEach((b64, i) => {
            const t = ats.capture_times_ms[i] ?? i * 2500;
            writePng(`KEYFRAMES_${ats.state_id}__t${String(t).padStart(5, '0')}.png`, b64,
                { role: 'keyframe', state_id: ats.state_id, t_ms: t });
        });
    }

    const checks = opts.checks ?? [];
    const failedChecks = checks.filter(c => !c.passed);

    const t = tally(checks);
    const manifestPath = join(dir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify({
        concept_id: opts.conceptId,
        captured_at: new Date().toISOString(),
        warnings: opts.capture.warnings,
        // Renderer self-diagnostics ([PM_*] via console.warn). Historically invisible
        // to every gate — surfaced here so a reviewer reading the dump can see them.
        diagnostic_warnings: opts.capture.diagnostic_warnings ?? [],
        timings: opts.capture.timings,
        // The headline the run prints, as an artifact rather than a claim.
        // `checks_present: false` distinguishes "no checks ran" from "all passed".
        //
        // `passed` COUNTS ONLY CHECKS THAT RAN. It used to be
        // `checks.length - failedChecks.length`, which folded every SKIP into the
        // pass count — so a run the console honestly reported as
        // "63 checks · 53 ran and passed · 10 SKIPPED · 0 failed" was written to
        // disk as {total: 63, passed: 63, failed: 0}. The console had been fixed
        // (skipReport.tally) and this artifact had not, so every MACHINE reader —
        // eye_walker, founder_proxy, any agent grepping the manifest — still saw a
        // clean sweep over gates that never executed. That is the open half of
        // bug_class eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_
        // pass, and it is the half that matters most, because a human at least
        // sees the GATE COVERAGE block printed underneath.
        //
        // Derived from the SAME tally() the console prints, deliberately: two
        // independent counts of one thing is how they came to disagree.
        check_summary: {
            checks_present: opts.checks !== undefined,
            total: t.total,
            passed: t.passed,
            skipped: t.skipped,
            failed: t.failed,
            failed_ids: failedChecks.map(c => `${c.state_id}:${c.check_id}`),
        },
        checks,
        entries,
    }, null, 2));

    return { dir, files: entries.map(e => e.path), manifestPath, entries };
}
