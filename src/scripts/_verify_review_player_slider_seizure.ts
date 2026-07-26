/**
 * WP-F2 acceptance item 3 (second half) — real mouse drag on the STATE_4
 * `theta_slider` canvas-drawn slider AT A SCALED IFRAME SIZE (1140x750,
 * scale=1.5x), inside the real review-site chrome. Proves two things at once:
 *   (a) p5 1.9.4's scrollWidth-based mouse-coordinate compensation still maps
 *       a real screen-pixel drag to the correct LOGICAL (760x500) slider
 *       value at a non-native canvas CSS size (D1's core claim).
 *   (b) WP-R5's seizure contract: a REAL drag sets PM_userTouched[variable],
 *       handing STATE_4's theta ping_pong choreography to the teacher for
 *       the rest of the state (value stops drifting back to the ramp).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_verify_review_player_slider_seizure.ts [url]
 */
import '@/lib/loadEnvLocal';
import { launchBrowser } from '@/lib/validators/visual/chromiumProvider';

async function main(): Promise<void> {
    const url = process.argv[2] ?? 'http://localhost:8093/scalar_vs_vector/';
    const browser = await launchBrowser();
    try {
        const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'load', timeout: 20000 });
        await page.waitForFunction(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement | null;
            const w = f?.contentWindow as (Window & { PM_simTimeMs?: number }) | null | undefined;
            return typeof w?.PM_simTimeMs === 'number';
        }, undefined, { timeout: 15000 });

        // Navigate to STATE_4 via the 4th rail card (default authored order,
        // 0-indexed nth(3)) — a real UI click, not a synthetic postMessage.
        await page.locator('#cards .card').nth(3).click();
        await page.waitForTimeout(600);
        const stateNow = await page.evaluate(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement;
            return (f.contentWindow as unknown as { PM_currentState?: string }).PM_currentState ?? null;
        });
        console.log(`[slider-seizure] navigated to state: ${stateNow} (expect STATE_4)`);

        // Force the iframe to the SCALED size already proven in the canvas-fit check.
        await page.evaluate(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement;
            f.style.width = '1140px';
            f.style.height = '750px';
            f.style.flex = 'none';
        });
        await page.waitForTimeout(400);

        const frameLoc = page.frameLocator('#sim');
        const canvasBox = await frameLoc.locator('canvas').boundingBox();
        if (!canvasBox) throw new Error('canvas boundingBox not found');
        console.log(`[slider-seizure] canvas box (page coords): ${JSON.stringify(canvasBox)}`);

        const slot = await page.evaluate(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement;
            const w = f.contentWindow as unknown as { PM_resolveSliderSlot?: (pos: string, idx: number, total: number) => { x: number; y: number; w: number } };
            return w.PM_resolveSliderSlot ? w.PM_resolveSliderSlot('bottom', 0, 1) : null;
        });
        if (!slot) throw new Error('PM_resolveSliderSlot not found on iframe window');
        console.log(`[slider-seizure] logical slot (760x500 space): ${JSON.stringify(slot)}`);

        const scale = canvasBox.width / 760;
        console.log(`[slider-seizure] canvas scale: ${scale.toFixed(3)}`);

        const beforeState = await page.evaluate(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement;
            const w = f.contentWindow as unknown as { PM_sliderValues?: Record<string, number>; PM_userTouched?: Record<string, boolean> };
            return { val: w.PM_sliderValues?.theta, touched: !!w.PM_userTouched?.theta };
        });
        console.log(`[slider-seizure] BEFORE drag: theta=${beforeState.val}, userTouched=${beforeState.touched}`);

        // Drag to frac=0.2 along the slot (min=0,max=180 → target ~36°),
        // clearly different from the default 90 and from wherever the
        // ping_pong ramp (0<->180 over 2000ms) currently sits.
        const targetFrac = 0.2;
        const targetPageX = canvasBox.x + (slot.x + targetFrac * slot.w) * scale;
        const targetPageY = canvasBox.y + slot.y * scale;
        console.log(`[slider-seizure] dragging to page (${targetPageX.toFixed(1)}, ${targetPageY.toFixed(1)})`);

        await page.mouse.move(targetPageX, targetPageY);
        await page.mouse.down();
        await page.waitForTimeout(120); // let a couple of draw() frames see mouseIsPressed
        await page.mouse.move(targetPageX + 2, targetPageY, { steps: 3 });
        await page.waitForTimeout(120);
        await page.mouse.up();
        await page.waitForTimeout(150);

        const afterDrag = await page.evaluate(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement;
            const w = f.contentWindow as unknown as { PM_sliderValues?: Record<string, number>; PM_userTouched?: Record<string, boolean> };
            return { val: w.PM_sliderValues?.theta, touched: !!w.PM_userTouched?.theta };
        });
        console.log(`[slider-seizure] AFTER drag: theta=${afterDrag.val}, userTouched=${afterDrag.touched}`);

        const dragWorked = afterDrag.val !== undefined && Math.abs((afterDrag.val as number) - (0 + targetFrac * 180)) <= 6; // step tolerance
        const seizureSet = afterDrag.touched === true;

        // Wait through more than one full ping_pong period (2000ms) — if seizure
        // holds, theta must NOT drift back onto the ramp.
        await page.waitForTimeout(2200);
        const afterWait = await page.evaluate(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement;
            const w = f.contentWindow as unknown as { PM_sliderValues?: Record<string, number> };
            return w.PM_sliderValues?.theta;
        });
        console.log(`[slider-seizure] theta 2.2s after drag (>1 ping_pong period): ${afterWait} (should equal ${afterDrag.val}, NOT drift)`);
        const seizureHolds = afterWait === afterDrag.val;

        const allPass = dragWorked && seizureSet && seizureHolds;
        console.log(`\ndrag mapped correctly at 1.5x scale: ${dragWorked ? 'YES' : 'NO'}`);
        console.log(`PM_userTouched.theta set on real drag: ${seizureSet ? 'YES' : 'NO'}`);
        console.log(`seizure holds past a full ping_pong period: ${seizureHolds ? 'YES' : 'NO'}`);
        console.log(`\n${allPass ? '✅ ALL SLIDER-SEIZURE CHECKS PASS' : '❌ SOME CHECK FAILED'}`);
        process.exitCode = allPass ? 0 : 1;
    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error('💥 verify crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
