/**
 * Contact sheets for THE EYE (AUTHORING_PIPELINE.md §3, 2026-06-10).
 *
 * One grid PNG per state assembling everything the capture saw — static
 * panel-A render, every dense motion frame (labelled with its actual capture
 * time), every I2 equation-panel frame (labelled by sentence id), and the
 * deterministic frozen frame — so the founder/Claude reviews ONE image per
 * state instead of ~12 individual frames. Sheets are working artifacts in
 * .visual_runs/ (gitignored), never repo content.
 *
 * Sharp compositing pattern follows composeSideBySide (screenshotter.ts).
 */
import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import type { CaptureResult } from './screenshotter';

const THUMB_W = 320;
const THUMB_H = 180;
const LABEL_H = 22;
const GRID_COLS = 4;
const BG = { r: 10, g: 10, b: 26, alpha: 1 } as const;

export interface ContactSheetEntry {
    state_id: string;
    png: Buffer;
}

interface SheetCell {
    b64: string;
    label: string;
}

/** Build one contact sheet per state from an in-memory capture result. */
export async function buildContactSheets(capture: CaptureResult): Promise<ContactSheetEntry[]> {
    const denseByState = new Map(
        (capture.dense_timeseries ?? []).map(series => [series.state_id, series]),
    );

    const sheets: ContactSheetEntry[] = [];
    for (const sc of capture.state_captures) {
        const cells: SheetCell[] = [{ b64: sc.panel_a_png_b64, label: 'STATIC' }];

        const dense = denseByState.get(sc.state_id);
        if (dense) {
            dense.frames_b64.forEach((b64, i) => {
                cells.push({ b64, label: `t=${dense.capture_times_ms[i] ?? i * 1000}ms` });
            });
        }
        for (const f of sc.i2_frames ?? []) {
            cells.push({ b64: f.panel_a_png_b64, label: `I2 ${f.sentence_id}` });
        }
        if (sc.frozen_png_b64) {
            cells.push({ b64: sc.frozen_png_b64, label: 'FROZEN (H2 pin)' });
        }

        sheets.push({ state_id: sc.state_id, png: await composeGrid(cells) });
    }
    return sheets;
}

/** SVG text strip — sharp composites SVG buffers natively. */
function labelStrip(text: string): Buffer {
    const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return Buffer.from(
        `<svg width="${THUMB_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">` +
        `<rect width="100%" height="100%" fill="#1a1a30"/>` +
        `<text x="6" y="${LABEL_H - 7}" font-family="monospace" font-size="13" fill="#FCD34D">${safe}</text>` +
        `</svg>`,
    );
}

async function composeGrid(cells: SheetCell[]): Promise<Buffer> {
    const cellH = THUMB_H + LABEL_H;
    const rows = Math.ceil(cells.length / GRID_COLS);
    const canvasW = GRID_COLS * THUMB_W;
    const canvasH = rows * cellH;

    const composites: sharp.OverlayOptions[] = [];
    for (let i = 0; i < cells.length; i++) {
        const x = (i % GRID_COLS) * THUMB_W;
        const y = Math.floor(i / GRID_COLS) * cellH;
        const thumb = await sharp(Buffer.from(cells[i].b64, 'base64'))
            .resize(THUMB_W, THUMB_H, { fit: 'contain', background: BG })
            .png()
            .toBuffer();
        composites.push({ input: thumb, left: x, top: y });
        composites.push({ input: labelStrip(cells[i].label), left: x, top: y + THUMB_H });
    }

    return await sharp({
        create: { width: canvasW, height: canvasH, channels: 4, background: BG },
    })
        .composite(composites)
        .png()
        .toBuffer();
}
