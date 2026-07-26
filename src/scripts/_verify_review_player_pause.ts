/**
 * WP-F2 acceptance item 2 — verify the REVIEW PLAYER (build_review_site.ts's
 * static teacher player, served by the running http-server on :8093) against
 * scalar_vs_vector:
 *   1. Pause mid-S1-sweep (freeze()) → two screenshots ~600ms apart, byte-identical.
 *   2. Resume (unfreeze()) continues — PM_simTimeMs keeps advancing afterward.
 *   3. Scrub the #scrub range input to a mid-timeline position → the iframe's
 *      PM_simTimeMs lands >= the scrubbed at_ms (SET_TIME_JUMP/SET_TIME_FREEZE).
 *   4. Mute (#muteBtn) → clock keeps advancing (audio-only gate, Rule 26a).
 *
 * Talks to the ALREADY-RUNNING http-server (localhost:8093, serving
 * review-site/ built by `npm run build:review -- scalar_vs_vector`). Does not
 * modify build_review_site.ts or any other file.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_verify_review_player_pause.ts [url]
 */
import '@/lib/loadEnvLocal';
import { createHash } from 'node:crypto';
import { launchBrowser } from '@/lib/validators/visual/chromiumProvider';

async function main(): Promise<void> {
    const url = process.argv[2] ?? 'http://localhost:8093/scalar_vs_vector/';
    console.log(`[verify] loading ${url}`);

    const browser = await launchBrowser();
    try {
        const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
        const page = await context.newPage();
        page.on('pageerror', e => console.log('[pageerror]', String(e)));
        await page.goto(url, { waitUntil: 'load', timeout: 20000 });

        // Wait for the sim iframe to report a live PM_simTimeMs (SIM_READY).
        await page.waitForFunction(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement | null;
            const w = f?.contentWindow as (Window & { PM_simTimeMs?: number }) | null | undefined;
            return typeof w?.PM_simTimeMs === 'number';
        }, undefined, { timeout: 15000 });
        console.log('[verify] sim iframe reports PM_simTimeMs — ready.');

        function readSimTimeMs(): Promise<number> {
            return page.evaluate(() => {
                const f = document.getElementById('sim') as HTMLIFrameElement;
                const w = f.contentWindow as unknown as { PM_simTimeMs?: number };
                return w.PM_simTimeMs ?? -1;
            });
        }

        const playBtn = page.locator('#playBtn');
        const btnText0 = await playBtn.innerText();
        console.log(`[verify] initial playBtn text: "${btnText0}"`);

        // Ensure playing: click Play if not already showing "Pause".
        if (!/pause/i.test(btnText0)) {
            await playBtn.click();
            console.log('[verify] clicked Play.');
        }
        await page.waitForTimeout(400);
        const btnTextPlaying = await playBtn.innerText();
        console.log(`[verify] playBtn after ensure-play: "${btnTextPlaying}"`);

        // Let S1's choreographed sweep run a bit (starts at 800ms per WP-F1),
        // then land mid-sweep before pausing.
        await page.waitForTimeout(1500);
        const midSweepSimTime = await readSimTimeMs();
        console.log(`[verify] PM_simTimeMs before pause (mid-sweep target): ${midSweepSimTime}`);

        // ── CHECK A: PAUSE freezes ──────────────────────────────────────────
        await playBtn.click(); // playing && !frozen -> freeze()
        const btnTextPaused = await playBtn.innerText();
        console.log(`[verify] playBtn after pause click: "${btnTextPaused}"`);
        await page.waitForTimeout(150); // settle any in-flight postMessage/paint
        const stage = page.locator('#stage');
        const shot1 = await stage.screenshot();
        const simTimeAtShot1 = await readSimTimeMs();
        await page.waitForTimeout(600);
        const shot2 = await stage.screenshot();
        const simTimeAtShot2 = await readSimTimeMs();
        const h1 = createHash('sha256').update(shot1).digest('hex');
        const h2 = createHash('sha256').update(shot2).digest('hex');
        console.log(`\n[CHECK A] PAUSE freezes:`);
        console.log(`   PM_simTimeMs at shot1=${simTimeAtShot1}, at shot2 (+600ms real wait)=${simTimeAtShot2}`);
        console.log(`   screenshot sha256 shot1=${h1}`);
        console.log(`   screenshot sha256 shot2=${h2}`);
        const pauseHolds = h1 === h2 && simTimeAtShot1 === simTimeAtShot2;
        console.log(`   PASS: ${pauseHolds ? 'YES — byte-identical + PM_simTimeMs held' : 'NO'}`);

        // ── CHECK B: RESUME continues ───────────────────────────────────────
        await playBtn.click(); // frozen && playing -> unfreeze()
        const btnTextResumed = await playBtn.innerText();
        console.log(`\n[CHECK B] playBtn after resume click: "${btnTextResumed}"`);
        await page.waitForTimeout(700);
        const simTimeAfterResume = await readSimTimeMs();
        console.log(`   PM_simTimeMs 700ms after resume: ${simTimeAfterResume} (should be > ${simTimeAtShot2})`);
        const resumeContinues = simTimeAfterResume > simTimeAtShot2;
        console.log(`   PASS: ${resumeContinues ? 'YES — clock advancing again' : 'NO'}`);

        // ── CHECK C: scrub lands PM_simTimeMs >= at_ms ──────────────────────
        // Pause first so the scrub lands cleanly (matches how a teacher would drag mid-explanation).
        const btnTextBeforeScrub = await playBtn.innerText();
        if (/pause/i.test(btnTextBeforeScrub)) await playBtn.click();
        await page.waitForTimeout(200);
        const scrubMax = await page.locator('#scrub').getAttribute('max');
        const targetMs = Math.round((Number(scrubMax) || 1000) * 0.5);
        await page.locator('#scrub').evaluate((el: HTMLInputElement, target: number) => {
            el.value = String(target);
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }, targetMs);
        await page.waitForTimeout(250); // rAF-throttled jump + settle
        await page.locator('#scrub').evaluate((el: HTMLInputElement) => {
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await page.waitForTimeout(250);
        const simTimeAfterScrub = await readSimTimeMs();
        console.log(`\n[CHECK C] scrub to at_ms=${targetMs} (scrub.max=${scrubMax}):`);
        console.log(`   PM_simTimeMs after scrub: ${simTimeAfterScrub}`);
        const scrubLanded = simTimeAfterScrub >= targetMs - 50; // small tolerance, mirrors screenshotter's SIM_TIME_TOLERANCE_MS
        console.log(`   PASS: ${scrubLanded ? 'YES — PM_simTimeMs >= at_ms (tolerance 50ms)' : 'NO'}`);

        // ── CHECK D: MUTE is audio-only — clock keeps advancing ────────────
        const muteBtn = page.locator('#muteBtn');
        const muteText0 = await muteBtn.innerText();
        console.log(`\n[CHECK D] muteBtn initial: "${muteText0}"`);
        // Resume playing (unpause) so the clock is live, then toggle mute.
        const btnTextForD = await playBtn.innerText();
        if (!/pause/i.test(btnTextForD)) await playBtn.click();
        await page.waitForTimeout(200);
        await muteBtn.click();
        const muteText1 = await muteBtn.innerText();
        const simTimeAtMuteToggle = await readSimTimeMs();
        await page.waitForTimeout(600);
        const simTimeAfterMuteWait = await readSimTimeMs();
        console.log(`   muteBtn after click: "${muteText1}"`);
        console.log(`   PM_simTimeMs at mute-toggle=${simTimeAtMuteToggle}, +600ms=${simTimeAfterMuteWait}`);
        const muteIsAudioOnly = simTimeAfterMuteWait > simTimeAtMuteToggle;
        console.log(`   PASS: ${muteIsAudioOnly ? 'YES — clock kept advancing under mute' : 'NO — mute affected the clock (Rule 26a violation)'}`);

        const overall = pauseHolds && resumeContinues && scrubLanded && muteIsAudioOnly;
        console.log(`\n${overall ? '✅ ALL REVIEW-PLAYER CHECKS PASS' : '❌ SOME CHECK FAILED'}`);
        process.exitCode = overall ? 0 : 1;
    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error('💥 verify crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
