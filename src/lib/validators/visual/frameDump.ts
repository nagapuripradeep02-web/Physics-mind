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

export interface FrameDumpEntry {
    role: 'state_panel_a' | 'state_panel_b' | 'state_combined' | 'dense' | 'keyframe' | 'i2_formula';
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

    const manifestPath = join(dir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify({
        concept_id: opts.conceptId,
        captured_at: new Date().toISOString(),
        warnings: opts.capture.warnings,
        timings: opts.capture.timings,
        entries,
    }, null, 2));

    return { dir, files: entries.map(e => e.path), manifestPath, entries };
}
