/**
 * WP-F2 acceptance item 2, CHECK D isolated re-run (clean page reload, no
 * chained state from the scrub check) — MUTE toggles audio only, the clock
 * keeps advancing regardless (Rule 26a).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_verify_review_player_mute.ts [url]
 */
import '@/lib/loadEnvLocal';
import { launchBrowser } from '@/lib/validators/visual/chromiumProvider';

async function main(): Promise<void> {
    const url = process.argv[2] ?? 'http://localhost:8093/scalar_vs_vector/';
    const browser = await launchBrowser();
    try {
        const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'load', timeout: 20000 });
        await page.waitForFunction(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement | null;
            const w = f?.contentWindow as (Window & { PM_simTimeMs?: number }) | null | undefined;
            return typeof w?.PM_simTimeMs === 'number';
        }, undefined, { timeout: 15000 });

        function readSimTimeMs(): Promise<number> {
            return page.evaluate(() => {
                const f = document.getElementById('sim') as HTMLIFrameElement;
                const w = f.contentWindow as unknown as { PM_simTimeMs?: number };
                return w.PM_simTimeMs ?? -1;
            });
        }

        const playBtn = page.locator('#playBtn');
        const btn0 = await playBtn.innerText();
        console.log(`[mute-verify] fresh load playBtn: "${btn0}"`);
        if (!/pause/i.test(btn0)) await playBtn.click(); // ensure playing
        await page.waitForTimeout(500);
        const btnAfterPlay = await playBtn.innerText();
        console.log(`[mute-verify] playBtn after ensure-play: "${btnAfterPlay}" (expect "Pause" = actively playing)`);

        const muteBtn = page.locator('#muteBtn');
        const muteText0 = await muteBtn.innerText();
        console.log(`[mute-verify] muteBtn before toggle: "${muteText0}"`);

        const t1 = await readSimTimeMs();
        await muteBtn.click();
        const muteText1 = await muteBtn.innerText();
        const t2 = await readSimTimeMs();
        console.log(`[mute-verify] muteBtn after toggle: "${muteText1}"`);
        console.log(`[mute-verify] PM_simTimeMs immediately before/after mute click: ${t1} -> ${t2}`);
        await page.waitForTimeout(600);
        const t3 = await readSimTimeMs();
        console.log(`[mute-verify] PM_simTimeMs +600ms after mute toggle: ${t3}`);
        const clockAdvancedUnderMute = t3 > t2;
        console.log(`\nPASS: ${clockAdvancedUnderMute ? 'YES — clock advanced while muted (Rule 26a holds)' : 'NO — clock did not advance'}`);

        // Toggle back and confirm still advancing (both mute states are audio-only).
        await muteBtn.click();
        const muteText2 = await muteBtn.innerText();
        const t4 = await readSimTimeMs();
        await page.waitForTimeout(600);
        const t5 = await readSimTimeMs();
        console.log(`\n[mute-verify] toggled back: "${muteText2}", PM_simTimeMs ${t4} -> +600ms -> ${t5}`);
        const clockAdvancedUnderUnmute = t5 > t4;
        console.log(`PASS: ${clockAdvancedUnderUnmute ? 'YES — clock advanced while un-muted too' : 'NO'}`);

        process.exitCode = (clockAdvancedUnderMute && clockAdvancedUnderUnmute) ? 0 : 1;
    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error('💥 verify crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
