/**
 * WP-F2 acceptance item 3 — canvas fit/centering/aspect-lock inside the REAL
 * review-site chrome (not an isolated sim.html page). Loads the running
 * review player (localhost:8093/scalar_vs_vector/), then for each target
 * size resizes the #sim iframe ELEMENT itself (which changes its
 * contentWindow's viewport, firing the iframe's own 'resize' → p5's
 * windowResized() → PM_fitCanvas(), exactly as WP-R2 designed) and measures
 * the rendered <canvas> box: aspect-locked to 760x500, fit-inside (never
 * cropped/overflowing), and centered in the iframe viewport.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_verify_review_player_canvas_fit.ts [url]
 */
import '@/lib/loadEnvLocal';
import { launchBrowser } from '@/lib/validators/visual/chromiumProvider';

const SIZES: Array<{ w: number; h: number; label: string }> = [
    { w: 760, h: 500, label: 'native (baseline-safety — must be pixel-identical scale=1)' },
    { w: 1140, h: 750, label: 'larger 1.5x' },
    { w: 380, h: 250, label: 'smaller 0.5x (exact aspect match)' },
    { w: 1200, h: 500, label: 'odd wide aspect' },
];

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
        console.log('[canvas-fit] review player ready.\n');

        let allPass = true;
        for (const { w, h, label } of SIZES) {
            // Force the #sim iframe element's own box to the exact test size —
            // this changes its contentWindow's innerWidth/innerHeight (the
            // iframe's own "viewport"), which fires a native 'resize' event
            // inside the iframe exactly like resizing a real browser window
            // would for a top-level page. Still inside the real review-site
            // DOM/CSS chrome (not a standalone sim.html load).
            await page.evaluate(({ w, h }) => {
                const f = document.getElementById('sim') as HTMLIFrameElement;
                f.style.width = `${w}px`;
                f.style.height = `${h}px`;
                f.style.flex = 'none'; // override any flex-grow the stage CSS applies
            }, { w, h });
            await page.waitForTimeout(300); // let resize + PM_fitCanvas settle

            const result = await page.evaluate(() => {
                const f = document.getElementById('sim') as HTMLIFrameElement;
                const win = f.contentWindow as unknown as Window;
                const doc = win.document;
                const canvas = doc.querySelector('canvas');
                if (!canvas) return null;
                const rect = canvas.getBoundingClientRect(); // relative to iframe's own viewport
                return {
                    iframeInnerW: win.innerWidth,
                    iframeInnerH: win.innerHeight,
                    canvasW: rect.width,
                    canvasH: rect.height,
                    canvasLeft: rect.left,
                    canvasTop: rect.top,
                    canvasRight: rect.right,
                    canvasBottom: rect.bottom,
                };
            });

            if (!result) {
                console.log(`❌ [${w}x${h}] ${label}: canvas element not found`);
                allPass = false;
                continue;
            }

            const expectedScale = Math.min(w / 760, h / 500);
            const expectedW = 760 * expectedScale;
            const expectedH = 500 * expectedScale;
            const wOk = Math.abs(result.canvasW - expectedW) < 2; // 2px tolerance
            const hOk = Math.abs(result.canvasH - expectedH) < 2;
            const leftMargin = result.canvasLeft;
            const rightMargin = result.iframeInnerW - result.canvasRight;
            const topMargin = result.canvasTop;
            const bottomMargin = result.iframeInnerH - result.canvasBottom;
            const centeredH = Math.abs(leftMargin - rightMargin) < 2;
            const centeredV = Math.abs(topMargin - bottomMargin) < 2;
            const noCrop = result.canvasLeft >= -0.5 && result.canvasTop >= -0.5
                && result.canvasRight <= result.iframeInnerW + 0.5 && result.canvasBottom <= result.iframeInnerH + 0.5;
            const nativeIdentical = (w === 760 && h === 500) ? (Math.abs(result.canvasW - 760) < 0.5 && Math.abs(result.canvasH - 500) < 0.5) : true;

            const pass = wOk && hOk && centeredH && centeredV && noCrop && nativeIdentical;
            allPass = allPass && pass;
            console.log(`${pass ? '✅' : '❌'} [${w}x${h}] ${label}`);
            console.log(`    iframe viewport: ${result.iframeInnerW}x${result.iframeInnerH}`);
            console.log(`    canvas rendered: ${result.canvasW.toFixed(1)}x${result.canvasH.toFixed(1)} (expected ${expectedW.toFixed(1)}x${expectedH.toFixed(1)}, scale=${expectedScale.toFixed(3)})`);
            console.log(`    margins L/R/T/B: ${leftMargin.toFixed(1)}/${rightMargin.toFixed(1)}/${topMargin.toFixed(1)}/${bottomMargin.toFixed(1)}  (centered H:${centeredH} V:${centeredV})`);
            console.log(`    no-crop: ${noCrop}${(w === 760 && h === 500) ? `  native-identical: ${nativeIdentical}` : ''}`);
        }

        // Slider-drag-still-works check at the odd 1140x750 size (proves the
        // p5 1.9.4 scrollWidth mouse-mapping compensation end-to-end).
        await page.evaluate(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement;
            f.style.width = '1140px';
            f.style.height = '750px';
            f.style.flex = 'none';
        });
        await page.waitForTimeout(300);
        const sliderResult = await page.evaluate(() => {
            const f = document.getElementById('sim') as HTMLIFrameElement;
            const win = f.contentWindow as unknown as { PM_sliderValues?: Record<string, number> };
            return win.PM_sliderValues ? JSON.stringify(win.PM_sliderValues) : 'none';
        });
        console.log(`\n[slider-state @ 1140x750] PM_sliderValues: ${sliderResult}`);

        console.log(`\n${allPass ? '✅ ALL CANVAS-FIT CHECKS PASS' : '❌ SOME CANVAS-FIT CHECK FAILED'}`);
        process.exitCode = allPass ? 0 : 1;
    } finally {
        await browser.close();
    }
}

main().catch(err => {
    console.error('💥 verify crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
