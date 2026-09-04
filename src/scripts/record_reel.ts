/**
 * record_reel.ts — turn the Answer Book into a 1080×1920 Instagram Reel.
 *
 *   npm run reel -- --q ts_ipe_p1_mp_projectile_motion
 *   npm run reel -- --q <id> --shot answer --out answer-book/tools/out/insta/p1.mp4
 *   npm run reel -- --shot door            # the door + group pick, no question
 *
 * WHY THIS EXISTS. A screen recording of Chrome's device-mode frame captures
 * only 360×640 REAL pixels on a 1080p monitor; blown up to Instagram's 1080×1920
 * it goes soft, and on a product made of text that reads as cheap. Here the page
 * is rendered at deviceScaleFactor 3 — 360×640 CSS px × 3 = 1080×1920 exactly —
 * and every frame is captured at that native size. No upscaling anywhere in the
 * chain, and the script refuses to mux if that ever stops being true.
 *
 * NOT `Page.startScreencast`. That was the first implementation and it is a trap:
 * the screencast delivers frames at the CSS viewport size (measured: 360×640)
 * regardless of deviceScaleFactor, so muxing it up to 1080×1920 is a 3× upscale
 * wearing a native-resolution label. `page.screenshot()` DOES honour the device
 * scale factor, so it is what runs here — slower per frame, but every pixel real.
 * The frame size is ASSERTED below, not assumed, because this is precisely the
 * kind of mistake that ships looking fine and reads as cheap on a phone.
 *
 * THE DEVICE IS MARKED TEAM BEFORE THE FIRST BYTE LOADS. `pm_internal` is set in
 * an init script, which is the ONE reliable path (docs/notes/
 * ANSWER_BOOK_ANALYTICS_RUNBOOK.md — the bot user-agent net misses modern headless
 * Chrome). Recording a Reel must never land in the student numbers; 45 of the
 * first 80 ledger rows were exactly this mistake made by hand. Recording the LOCAL
 * build (the default) is belt AND braces: a localhost origin is independently
 * classified `answerbook_local` server-side.
 *
 * TIMING IS REAL, NOT ASSUMED. Frames come back whenever screenshot() returns,
 * which is not a steady rate, so each is stamped and they are muxed through
 * ffmpeg's concat demuxer with per-frame durations before being resampled to a
 * constant output rate. Numbering the frames and declaring them 30fps would slew
 * the shot against the step reveals, which are the whole point of it.
 */
import { chromium, type Browser, type Page } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/** 360×640 at DPR 3 is 1080×1920 — the Reels/Stories canvas, to the pixel. It is
    also a real budget-Android size, which is what most IPE students hold. */
const VIEWPORT = { width: 360, height: 640 };
const DPR = 3;

/** Port 8100 is not arbitrary: it is in every Edge Function's AB_ALLOWED_ORIGINS
    and in the LOCAL_ORIGINS subset that classifies the ledger row as
    `answerbook_local`. Serving on another port silently leaves that allowlist. */
const PORT = 8100;
const LIVE_URL = 'https://answers.viditra.co';
const DEFAULT_DIR = 'answer-book/dist-gated-mpc+mpc_2';

type Beat =
    | { do: 'wait'; ms: number }
    | { do: 'openQuestion'; id: string }
    | { do: 'revealNext' }
    | { do: 'click'; selector: string }
    | { do: 'scrollTo'; y: number }
    | { do: 'openVidi' };

interface Shot {
    describe: string;
    beats: (opts: { questionId: string }) => Beat[];
}

/** Shots are DATA, so a month of Reels is a loop over ids rather than a month of
    hand-recording. Each beat is one thing a student does. */
const SHOTS: Record<string, Shot> = {
    answer: {
        describe: 'open a question and let the answer write itself, step by step',
        beats: ({ questionId }) => [
            { do: 'wait', ms: 900 },
            { do: 'openQuestion', id: questionId },
            { do: 'wait', ms: 2200 },              // the question card reads first
            { do: 'revealNext' }, { do: 'wait', ms: 1500 },
            { do: 'revealNext' }, { do: 'wait', ms: 1500 },
            { do: 'revealNext' }, { do: 'wait', ms: 1500 },
            { do: 'revealNext' }, { do: 'wait', ms: 2000 },
        ],
    },
    door: {
        describe: 'the door — pick your group, both years',
        beats: () => [
            { do: 'wait', ms: 1400 },
            { do: 'scrollTo', y: 260 }, { do: 'wait', ms: 1400 },
            { do: 'scrollTo', y: 0 }, { do: 'wait', ms: 900 },
        ],
    },
    vidi: {
        describe: 'the answer, then Vidi opened from the pill',
        beats: ({ questionId }) => [
            { do: 'wait', ms: 800 },
            { do: 'openQuestion', id: questionId },
            { do: 'wait', ms: 1800 },
            { do: 'revealNext' }, { do: 'wait', ms: 1400 },
            { do: 'openVidi' }, { do: 'wait', ms: 2600 },
        ],
    },
};

function arg(name: string, fallback = ''): string {
    const i = process.argv.indexOf('--' + name);
    return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
        ? process.argv[i + 1] : fallback;
}
const flag = (name: string): boolean => process.argv.includes('--' + name);

const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

/** Serve the built dist ourselves rather than lean on `serve:answers`: that
    script points at a DIFFERENT directory (the offline build), and a recorder
    that silently films the wrong artifact is the same class of mistake as a
    deploy that ships a stale one. */
function serveDist(dir: string): Promise<Server> {
    const root = path.resolve(dir);
    if (!fs.existsSync(path.join(root, 'index.html'))) {
        throw new Error(`no index.html in ${root} — build it first (npm run build:answers:gated:mpc-both)`);
    }
    const server = createServer(async (req, res) => {
        const url = (req.url || '/').split('?')[0];
        const rel = url === '/' ? 'index.html' : decodeURIComponent(url).replace(/^\/+/, '');
        const file = path.join(root, rel);
        if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
        try {
            const body = await readFile(file);
            res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
            res.end(body);
        } catch { res.writeHead(404).end('not found'); }
    });
    return new Promise((ok) => server.listen(PORT, () => ok(server)));
}

async function runBeat(page: Page, b: Beat): Promise<void> {
    switch (b.do) {
        case 'wait': await page.waitForTimeout(b.ms); return;
        case 'openQuestion':
            await page.evaluate((id) => (window as any).PM_ANSWER.openQuestion(id), b.id);
            await page.waitForSelector('.page', { timeout: 10_000 });
            return;
        case 'revealNext': await page.evaluate(() => (window as any).PM_ANSWER.revealNext()); return;
        case 'click': await page.click(b.selector); return;
        case 'scrollTo': await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), b.y); return;
        case 'openVidi':
            // Since 2026-09-02 the panel starts minimised, so the pill is the
            // real way in — film what a student actually taps.
            if (await page.evaluate(() => document.getElementById('pm-assistant-slot')!.hidden)) {
                await page.click('#vidiFab');
            }
            return;
    }
}

/** Width/height straight out of a JPEG's SOF marker — so "1080×1920, no upscale"
    is something this script CHECKS rather than something it claims. */
function jpegSize(file: string): { w: number; h: number } {
    const b = fs.readFileSync(file);
    let i = 2;
    while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const marker = b[i + 1];
        // SOF0..SOF15 except the non-frame markers DHT(c4) JPGA(c8) DAC(cc)
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
            return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
        }
        i += 2 + b.readUInt16BE(i + 2);
    }
    throw new Error('could not read JPEG dimensions from ' + file);
}

function mux(listFile: string, out: string, fps: number): Promise<void> {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
    const args = [
        '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
        // CFR at the target rate: Instagram wants constant frame rate, and the
        // concat durations carry the real timing into the resample. `-vsync vfr`
        // WITH `-r` is contradictory and ffmpeg refuses it outright.
        '-fps_mode', 'cfr', '-r', String(fps),
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
        // yuv420p or it will not play on a phone. NO scale filter: the frames
        // are already 1080×1920 and asserted so — adding one here would let a
        // wrong-sized capture pass silently, which is the bug this replaced.
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', out,
    ];
    return new Promise((ok, fail) => {
        const p = spawn('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
        let err = '';
        p.stderr.on('data', (d) => { err += String(d); });
        p.on('close', (code) => code === 0 ? ok() : fail(new Error('ffmpeg failed:\n' + err.slice(-1500))));
    });
}

async function main(): Promise<void> {
    const shotName = arg('shot', 'answer');
    const shot = SHOTS[shotName];
    if (!shot) {
        console.error(`unknown --shot ${shotName}. Available: ${Object.keys(SHOTS).join(', ')}`);
        process.exit(1);
    }
    const questionId = arg('q', 'ts_ipe_p1_mp_projectile_motion');
    const fps = Number(arg('fps', '30'));
    const live = flag('live');
    const dir = arg('dir', DEFAULT_DIR);
    const out = arg('out', `answer-book/tools/out/insta/${shotName}_${questionId}.mp4`);

    let server: Server | null = null;
    const base = live ? LIVE_URL : `http://localhost:${PORT}`;
    if (!live) server = await serveDist(dir);

    const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-'));
    let browser: Browser | null = null;

    try {
        browser = await chromium.launch();
        const context = await browser.newContext({
            viewport: VIEWPORT, deviceScaleFactor: DPR, isMobile: true, hasTouch: true,
        });
        // THE line that keeps a recording out of the student numbers. Before the
        // first page load, never after — a device is minted on first sync.
        await context.addInitScript(() => {
            try { localStorage.setItem('pm_internal', '1'); } catch { /* blocked storage */ }
        });
        const page = await context.newPage();

        await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => (window as any).PM_ANSWER, undefined, { timeout: 20_000 });

        // Capture runs alongside the beats and takes frames as fast as
        // screenshot() returns; the real inter-frame gaps are what timing is
        // rebuilt from below, so an uneven rate costs nothing.
        const frames: { file: string; t: number }[] = [];
        let capturing = true;
        let n = 0;
        const t0 = Date.now();
        const capture = (async () => {
            while (capturing) {
                const file = path.join(frameDir, `f${String(n++).padStart(5, '0')}.jpg`);
                try {
                    await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
                    frames.push({ file, t: (Date.now() - t0) / 1000 });
                } catch { break; }                   // page closed mid-shot
            }
        })();

        for (const beat of shot.beats({ questionId })) await runBeat(page, beat);

        capturing = false;
        await capture;
        await browser.close(); browser = null;

        if (frames.length < 2) throw new Error('capture produced no frames');

        // The claim this whole script rests on, verified against frame 1.
        const size = jpegSize(frames[0].file);
        const want = { w: VIEWPORT.width * DPR, h: VIEWPORT.height * DPR };
        if (size.w !== want.w || size.h !== want.h) {
            throw new Error(
                `frames are ${size.w}×${size.h}, expected ${want.w}×${want.h}. ` +
                'Refusing to mux — upscaling here is what makes a Reel look cheap.');
        }

        // Per-frame durations from Chrome's own timestamps; the last frame is
        // held for one output frame so ffmpeg does not drop it.
        const lines: string[] = [];
        for (let i = 0; i < frames.length; i++) {
            const dur = i < frames.length - 1
                ? Math.max(1 / 240, frames[i + 1].t - frames[i].t)
                : 1 / fps;
            lines.push(`file '${frames[i].file.replace(/\\/g, '/')}'`, `duration ${dur.toFixed(4)}`);
        }
        lines.push(`file '${frames[frames.length - 1].file.replace(/\\/g, '/')}'`);
        const listFile = path.join(frameDir, 'frames.txt');
        fs.writeFileSync(listFile, lines.join('\n'));

        await mux(listFile, out, fps);

        const secs = frames[frames.length - 1].t - frames[0].t;
        const kb = Math.round(fs.statSync(out).size / 1024);
        console.log(`\n✓ ${out}`);
        console.log(`  ${size.w}×${size.h} native · ${frames.length} frames captured at `
            + `${(frames.length / secs).toFixed(1)}/s · ${secs.toFixed(1)}s · ${kb} KB · ${fps} fps out`);
        console.log(`  shot: ${shotName} — ${shot.describe}`);
        console.log(`  source: ${live ? LIVE_URL + '  (device marked team)' : dir + '  (localhost → answerbook_local)'}`);
    } finally {
        if (browser) await browser.close();
        if (server) server.close();
        fs.rmSync(frameDir, { recursive: true, force: true });
    }
}

main().catch((e) => { console.error(e); process.exit(1); });
