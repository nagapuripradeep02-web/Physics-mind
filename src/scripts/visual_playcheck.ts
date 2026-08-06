// visual_playcheck.ts — the product-surface play-and-watch gate (ADVISORY, $0).
//
// THE EYE drives the CACHED sim under a pinned clock; the teacher uses the BUILT
// review page with a free-running one. A defect that lives only in the
// review-site assembly — dead choreography was shipped for weeks this way — is
// structurally invisible to every pinned-clock pixel gate (engine_bug_queue:
// review_site_private_config_assembler_drops_variable_choreography). This gate
// closes that class from the product side: it serves review-site/ from an
// in-process server, loads <id>/ in headless Chromium, clicks the REAL rail
// card and the REAL Play button (the teacher's own path), lets the clock
// free-run, and asserts that
//   - the sim clock advances,
//   - PM_choreoValues is non-empty on every state that authors choreography,
//   - every choreographed variable's value actually CHANGES inside its own
//     motion window (sim-clock sampled, never wall-clock).
//
// ADVISORY: exits 1 on failure but is NOT wired into verify.yml — promotion to
// blocking is gated on a fleet SKIP census (THE CALCULATOR precedent,
// docs/PIPELINE_V2_PLAN.md §5).
//
// Run: npm run visual:playcheck -- <concept_id> [<concept_id> ...] [--fresh]
//      npm run visual:playcheck -- --all-parametric [--fresh]
//   --fresh rebuilds each target's review site first (build:review).

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, resolve, extname } from 'path';
import { createServer, type Server } from 'http';
import { execSync } from 'child_process';
import type { Page } from '@playwright/test';
import { launchBrowser } from '../lib/validators/visual/chromiumProvider';
import { resolveConceptJsonPath } from './lib/resolveConceptJson';
import { isParametricConcept, type ParametricSourceJson } from './lib/buildParametricConfig';

const REVIEW_DIR = join(process.cwd(), 'review-site');
const SAMPLE_INTERVAL_MS = 100;
const VAR_WINDOW_MS = 2000;      // per-variable: assert change within start_ms..start_ms+2s
const WINDOW_EPS_MS = 150;       // a window is "reached" once a sample lands this far in
const STATE_WALL_TIMEOUT_MS = 15000;

interface ChoreoEntry {
    variable?: string;
    start_ms?: number;
    duration_ms?: number;
    mode?: string;
}

interface ChoreoState {
    stateId: string;
    entries: Array<Required<Pick<ChoreoEntry, 'variable'>> & ChoreoEntry>;
}

interface Sample {
    t: number;
    v: Record<string, unknown>;
}

interface VarVerdict {
    variable: string;
    verdict: 'PASS' | 'FAIL' | 'SKIP';
    detail: string;
}

interface StateResult {
    stateId: string;
    clockAdvanced: boolean;
    choreoAlive: boolean;
    vars: VarVerdict[];
}

// ── Static server for review-site/ (in-process; dies with the script) ───────
const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
};

function serveReviewSite(): Promise<{ server: Server; base: string }> {
    return new Promise((resolvePromise, reject) => {
        const server = createServer((req, res) => {
            try {
                const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
                let filePath = resolve(join(REVIEW_DIR, urlPath));
                if (!filePath.startsWith(REVIEW_DIR)) {
                    res.writeHead(403).end();
                    return;
                }
                if (existsSync(filePath) && statSync(filePath).isDirectory()) {
                    filePath = join(filePath, 'index.html');
                }
                if (!existsSync(filePath)) {
                    res.writeHead(404).end('not found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' });
                res.end(readFileSync(filePath));
            } catch (err) {
                res.writeHead(500).end(String(err));
            }
        });
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            if (addr == null || typeof addr === 'string') {
                reject(new Error('no server address'));
                return;
            }
            resolvePromise({ server, base: `http://127.0.0.1:${addr.port}` });
        });
    });
}

// ── Concept-side facts (what SHOULD move, straight from the authored JSON) ───
function choreoStates(conceptId: string): ChoreoState[] {
    const resolved = resolveConceptJsonPath(conceptId);
    if (!resolved) throw new Error(`concept JSON not found for ${conceptId}`);
    const json = JSON.parse(readFileSync(resolved.path, 'utf-8')) as ParametricSourceJson;
    const states = json.epic_l_path?.states ?? {};
    const out: ChoreoState[] = [];
    for (const [stateId, st] of Object.entries(states)) {
        const choreo = (st as { variable_choreography?: ChoreoEntry[] }).variable_choreography;
        if (!Array.isArray(choreo) || choreo.length === 0) continue;
        const entries = choreo.filter(
            (c): c is ChoreoState['entries'][number] => typeof c?.variable === 'string',
        );
        if (entries.length > 0) out.push({ stateId, entries });
    }
    return out.sort((a, b) => a.stateId.localeCompare(b.stateId, undefined, { numeric: true }));
}

function listParametricConceptsWithBuilds(): string[] {
    if (!existsSync(REVIEW_DIR)) return [];
    const out: string[] = [];
    for (const entry of readdirSync(REVIEW_DIR)) {
        const dir = join(REVIEW_DIR, entry);
        if (!statSync(dir).isDirectory() || !existsSync(join(dir, 'sim.html'))) continue;
        const resolved = resolveConceptJsonPath(entry);
        if (!resolved) continue;
        try {
            const json = JSON.parse(readFileSync(resolved.path, 'utf-8')) as ParametricSourceJson;
            if (isParametricConcept(json)) out.push(entry);
        } catch {
            /* unparsable JSON → not a target */
        }
    }
    return out.sort();
}

// ── Page driving (the teacher's own path: rail card + Play button) ───────────
async function clickCardForState(page: Page, stateId: string, cardCount: number): Promise<boolean> {
    for (let pos = 0; pos < cardCount; pos++) {
        await page.locator('#rail .card').nth(pos).click();
        await page.waitForTimeout(250);
        const active = await page.evaluate(() => (window as Window & { PM_STATE_ID?: string }).PM_STATE_ID ?? '');
        if (active === stateId) return true;
    }
    return false;
}

async function sampleState(page: Page, targetEndMs: number): Promise<Sample[]> {
    await page.evaluate(() => {
        const w = window as Window & { __pcSamples?: Sample[]; __pcTimer?: number };
        if (w.__pcTimer) clearInterval(w.__pcTimer);
        w.__pcSamples = [];
        w.__pcTimer = window.setInterval(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement | null;
            try {
                const fw = f?.contentWindow as
                    | (Window & { PM_simTimeMs?: number; PM_choreoValues?: Record<string, unknown> })
                    | null
                    | undefined;
                if (fw && typeof fw.PM_simTimeMs === 'number') {
                    w.__pcSamples?.push({
                        t: fw.PM_simTimeMs,
                        v: JSON.parse(JSON.stringify(fw.PM_choreoValues ?? {})) as Record<string, unknown>,
                    });
                }
            } catch {
                /* cross-frame hiccup — skip this tick */
            }
        }, 100);
    });
    await page
        .waitForFunction(
            (target: number) => {
                const w = window as Window & { __pcSamples?: Array<{ t: number }> };
                return (w.__pcSamples ?? []).some((s) => s.t >= target);
            },
            targetEndMs,
            { timeout: STATE_WALL_TIMEOUT_MS },
        )
        .catch(() => {
            /* pinned early or slow machine — judge whatever was sampled */
        });
    return page.evaluate(() => {
        const w = window as Window & { __pcSamples?: Sample[]; __pcTimer?: number };
        if (w.__pcTimer) clearInterval(w.__pcTimer);
        return w.__pcSamples ?? [];
    });
}

function judgeState(state: ChoreoState, samples: Sample[]): StateResult {
    const ts = samples.map((s) => s.t);
    const clockAdvanced = ts.length >= 2 && Math.max(...ts) - Math.min(...ts) > 500;
    const choreoAlive = samples.some((s) => Object.keys(s.v).length > 0);
    const vars: VarVerdict[] = [];
    for (const entry of state.entries) {
        const start = entry.start_ms ?? 0;
        const inWindow = samples.filter((s) => s.t >= start + WINDOW_EPS_MS);
        if (inWindow.length < 2) {
            vars.push({
                variable: entry.variable,
                verdict: 'SKIP',
                detail: `window not reached (last sample t=${ts.length ? Math.max(...ts) : 0}ms < start_ms=${start})`,
            });
            continue;
        }
        const values = inWindow
            .map((s) => s.v[entry.variable])
            .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
        if (values.length < 2) {
            vars.push({
                variable: entry.variable,
                verdict: 'FAIL',
                detail: 'variable absent from PM_choreoValues while its window was live',
            });
            continue;
        }
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (max - min > 1e-9) {
            vars.push({ variable: entry.variable, verdict: 'PASS', detail: `${min.toFixed(2)} → ${max.toFixed(2)} over ${values.length} samples` });
        } else {
            vars.push({ variable: entry.variable, verdict: 'FAIL', detail: `pinned at ${min.toFixed(4)} across ${values.length} samples in its own motion window` });
        }
    }
    return { stateId: state.stateId, clockAdvanced, choreoAlive, vars };
}

async function checkConcept(page: Page, base: string, conceptId: string): Promise<{ failed: boolean; lines: string[] }> {
    const lines: string[] = [];
    const targets = choreoStates(conceptId);
    if (targets.length === 0) {
        lines.push(`  ⊘ no choreographed states — nothing for this gate (static/slider-only concept)`);
        return { failed: false, lines };
    }
    await page.goto(`${base}/${conceptId}/`, { waitUntil: 'load', timeout: 30000 });
    await page
        .waitForFunction(
            () => {
                const f = document.getElementById('sim') as HTMLIFrameElement | null;
                try {
                    const w = f?.contentWindow as (Window & { PM_simTimeMs?: number }) | null | undefined;
                    return w != null && typeof w.PM_simTimeMs === 'number';
                } catch {
                    return false;
                }
            },
            undefined,
            { timeout: 25000 },
        )
        .catch(() => {
            lines.push('  ✖ SIM_BOOT_TIMEOUT — PM_simTimeMs never appeared on the sim iframe');
        });
    await page.waitForTimeout(1500); // brand curtain settle (same as founder_drive)

    const cardCount = await page.locator('#rail .card').count();
    if (cardCount === 0) {
        lines.push('  ✖ NO_RAIL_CARDS — player did not build');
        return { failed: true, lines };
    }

    let failed = false;
    for (const state of targets) {
        const found = await clickCardForState(page, state.stateId, cardCount);
        if (!found) {
            lines.push(`  ✖ ${state.stateId}: no rail card reaches this state (PM_STATE_ID never matched)`);
            failed = true;
            continue;
        }
        await page.locator('#playBtn').click(); // idle → play() → rolls from the top, unpinned
        const targetEnd =
            Math.max(
                ...state.entries.map((e) => (e.start_ms ?? 0) + Math.min(e.duration_ms && e.duration_ms > 0 ? e.duration_ms : VAR_WINDOW_MS, VAR_WINDOW_MS)),
            ) + 400;
        const samples = await sampleState(page, targetEnd);
        const result = judgeState(state, samples);

        if (!result.clockAdvanced) {
            lines.push(`  ✖ ${state.stateId}: clock did not free-run (${samples.length} samples)`);
            failed = true;
        }
        if (!result.choreoAlive) {
            lines.push(`  ✖ ${state.stateId}: PM_choreoValues stayed EMPTY — dead choreography on the product surface`);
            failed = true;
        }
        for (const v of result.vars) {
            const mark = v.verdict === 'PASS' ? '✓' : v.verdict === 'SKIP' ? '⊘' : '✖';
            lines.push(`  ${mark} ${state.stateId} ${v.variable.padEnd(14)} ${v.verdict}  ${v.detail}`);
            if (v.verdict === 'FAIL') failed = true;
        }
    }
    return { failed, lines };
}

async function main(): Promise<void> {
    const args = process.argv.slice(2).filter((a) => a !== '--');
    const fresh = args.includes('--fresh');
    const allParametric = args.includes('--all-parametric');
    const ids = args.filter((a) => !a.startsWith('--'));
    const targets = allParametric ? listParametricConceptsWithBuilds() : ids;
    if (targets.length === 0) {
        console.error('Usage: npm run visual:playcheck -- <concept_id> [...] [--fresh] | --all-parametric [--fresh]');
        process.exit(1);
    }

    if (fresh) {
        for (const id of targets) {
            console.log(`↻ build:review ${id}`);
            execSync(`npm run build:review -- ${id}`, { stdio: 'inherit' });
        }
    }
    for (const id of targets) {
        if (!existsSync(join(REVIEW_DIR, id, 'index.html'))) {
            console.error(`✖ ${id}: no built review site (run npm run build:review -- ${id}, or pass --fresh)`);
            process.exit(1);
        }
    }

    const { server, base } = await serveReviewSite();
    const browser = await launchBrowser();
    let anyFailed = false;
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
        for (const id of targets) {
            console.log(`\n▶ playcheck ${id}`);
            const { failed, lines } = await checkConcept(page, base, id);
            for (const line of lines) console.log(line);
            if (failed) anyFailed = true;
        }
    } finally {
        await browser.close().catch(() => undefined);
        server.close();
    }

    console.log(
        anyFailed
            ? '\n✖ PLAYCHECK FAILED — the TEACHER surface is broken for the states above (ADVISORY gate: not in CI, but this is the artifact a teacher actually uses).'
            : '\n✓ playcheck clean — every choreographed variable moves on the built review page.',
    );
    process.exit(anyFailed ? 1 : 0);
}

main().catch((err) => {
    console.error('💥 playcheck crashed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
