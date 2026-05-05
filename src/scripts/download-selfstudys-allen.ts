/**
 * Bulk-download Allen-coaching reformatted JEE Mains PDFs from selfstudys.com.
 * ============================================================================
 * Walks selfstudys' public sitemap (`https://www.selfstudys.com/sitemaps/jee.xml`),
 * filters to real `jee-main-{D}-{mmm}-{YYYY}-paper-shift-{N}` slugs for the
 * requested year(s), skips memory-based reconstructions, fetches each landing
 * page HTML, extracts the `/sitepdfs/{hash}` PDF URL, and saves it to disk
 * with the canonical filename that `ingest-nta-mains.ts` parseFileName() expects:
 *   jee-mains-{YYYY}-{DD}-{mmm}-shift-{N}.pdf
 *
 * Idempotent: skips any paper already on disk. Re-running is safe.
 *
 * Usage:
 *   npx tsx src/scripts/download-selfstudys-allen.ts --year 2024              # one year
 *   npx tsx src/scripts/download-selfstudys-allen.ts --year 2024 --year 2025  # multiple years
 *   npx tsx src/scripts/download-selfstudys-allen.ts --year 2024 --dry-run    # list only
 *
 * Output directory: C:\Tutor\nta-source\jee-mains-{YYYY}\
 *
 * Cost: zero. Selfstudys serves PDFs over plain HTTPS without auth.
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const SITEMAP_URL = "https://www.selfstudys.com/sitemaps/jee.xml";
const OUTPUT_ROOT = "C:\\Tutor\\nta-source";

const MONTH_TO_CANONICAL: Record<string, string> = {
    jan: "jan", january: "jan",
    feb: "feb", february: "feb",
    mar: "mar", march: "mar",
    apr: "apr", april: "apr",
    may: "may",
    jun: "jun", june: "jun",
    jul: "jul", july: "jul",
    aug: "aug", august: "aug",
    sep: "sep", sept: "sep", september: "sep",
    oct: "oct", october: "oct",
    nov: "nov", november: "nov",
    dec: "dec", december: "dec",
};

interface PaperUrl {
    landingUrl: string;
    year: number;
    day: number;
    month: string;       // canonical 3-letter
    shift: 1 | 2;
    canonicalLabel: string; // jee-mains-2024-08-apr-shift-2 (no .pdf)
}

function getYears(): number[] {
    const years: number[] = [];
    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === "--year" && process.argv[i + 1]) {
            const y = parseInt(process.argv[i + 1], 10);
            if (!isNaN(y)) years.push(y);
        }
    }
    return years;
}

const YEARS_TO_FETCH = getYears();
const IS_DRY_RUN = process.argv.includes("--dry-run");

if (YEARS_TO_FETCH.length === 0) {
    console.error("Usage: npx tsx src/scripts/download-selfstudys-allen.ts --year 2024 [--year 2025] [--dry-run]");
    process.exit(1);
}

function parseSlug(landingUrl: string): PaperUrl | null {
    // Slug shape: jee-main-{D}-{mmm|mmmm}-{YYYY}-paper-shift-{N}
    const slugMatch = landingUrl.match(
        /\/year-wise\/(\d{4})\/(jee-main-(\d{1,2})-([a-z]+)-(\d{4})-paper-shift-([12])(?:-memory-based)?)\//i
    );
    if (!slugMatch) return null;

    const isMemoryBased = landingUrl.includes("-memory-based");
    if (isMemoryBased) return null;

    const yearFromPath = parseInt(slugMatch[1], 10);
    const day = parseInt(slugMatch[3], 10);
    const monthRaw = slugMatch[4].toLowerCase();
    const yearFromSlug = parseInt(slugMatch[5], 10);
    const shift = parseInt(slugMatch[6], 10) as 1 | 2;

    if (yearFromPath !== yearFromSlug) return null;
    const month = MONTH_TO_CANONICAL[monthRaw];
    if (!month) return null;

    const dayStr = String(day).padStart(2, "0");
    const canonicalLabel = `jee-mains-${yearFromSlug}-${dayStr}-${month}-shift-${shift}`;

    return { landingUrl, year: yearFromSlug, day, month, shift, canonicalLabel };
}

async function fetchSitemap(): Promise<string> {
    const res = await fetch(SITEMAP_URL);
    if (!res.ok) throw new Error(`Sitemap fetch failed: HTTP ${res.status}`);
    return await res.text();
}

function discoverPapersInSitemap(sitemapXml: string, years: number[]): PaperUrl[] {
    const yearSet = new Set(years);
    const found: PaperUrl[] = [];
    const seenLabels = new Set<string>();

    const locMatches = sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g);
    for (const m of locMatches) {
        const url = m[1];
        if (!url.includes("/jee-previous-year-paper/")) continue;
        const parsed = parseSlug(url);
        if (!parsed) continue;
        if (!yearSet.has(parsed.year)) continue;
        if (seenLabels.has(parsed.canonicalLabel)) continue;  // dedupe duplicate sitemap entries
        seenLabels.add(parsed.canonicalLabel);
        found.push(parsed);
    }
    return found;
}

async function fetchLandingPdfUrl(landingUrl: string): Promise<string | null> {
    const res = await fetch(landingUrl);
    if (!res.ok) {
        console.warn(`  WARN landing fetch HTTP ${res.status} for ${landingUrl}`);
        return null;
    }
    const html = await res.text();
    const pdfMatch = html.match(/https?:\/\/[^"'\s]*\/sitepdfs\/[a-zA-Z0-9]+/);
    if (!pdfMatch) {
        const relMatch = html.match(/\/sitepdfs\/[a-zA-Z0-9]+/);
        if (relMatch) return `https://www.selfstudys.com${relMatch[0]}`;
        return null;
    }
    return pdfMatch[0];
}

async function downloadPdf(url: string, outputPath: string): Promise<number> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`PDF fetch failed: HTTP ${res.status}`);
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("pdf")) throw new Error(`PDF fetch returned non-PDF content-type: ${ct}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(outputPath, buf);
    return buf.length;
}

async function main(): Promise<void> {
    console.log("══════════════════════════════════════════════════════════════════");
    console.log(`Selfstudys-Allen JEE Mains bulk download`);
    console.log(`  Years:       ${YEARS_TO_FETCH.join(", ")}`);
    console.log(`  Mode:        ${IS_DRY_RUN ? "DRY RUN (list only, no download)" : "LIVE"}`);
    console.log(`  Output root: ${OUTPUT_ROOT}`);
    console.log("══════════════════════════════════════════════════════════════════");

    const sitemap = await fetchSitemap();
    console.log(`Fetched sitemap (${sitemap.length} bytes).`);

    const papers = discoverPapersInSitemap(sitemap, YEARS_TO_FETCH);
    console.log(`Discovered ${papers.length} unique non-memory-based paper(s) for requested year(s).\n`);

    let alreadyOnDisk = 0;
    let downloaded = 0;
    let failed = 0;
    let totalBytes = 0;

    for (let i = 0; i < papers.length; i++) {
        const p = papers[i];
        const yearDir = join(OUTPUT_ROOT, `jee-mains-${p.year}`);
        if (!existsSync(yearDir)) mkdirSync(yearDir, { recursive: true });
        const outputPath = join(yearDir, `${p.canonicalLabel}.pdf`);
        const tag = `[${i + 1}/${papers.length}]`;

        if (existsSync(outputPath)) {
            console.log(`${tag} ${p.canonicalLabel} — already on disk, skipping`);
            alreadyOnDisk++;
            continue;
        }
        if (IS_DRY_RUN) {
            console.log(`${tag} ${p.canonicalLabel} — would download (DRY RUN)`);
            continue;
        }

        try {
            const pdfUrl = await fetchLandingPdfUrl(p.landingUrl);
            if (!pdfUrl) {
                console.warn(`${tag} ${p.canonicalLabel} — no /sitepdfs/ URL found in landing HTML`);
                failed++;
                continue;
            }
            const bytes = await downloadPdf(pdfUrl, outputPath);
            totalBytes += bytes;
            downloaded++;
            console.log(`${tag} ${p.canonicalLabel} — ${(bytes / 1024).toFixed(0)} KB`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "unknown error";
            console.warn(`${tag} ${p.canonicalLabel} — ERROR: ${message}`);
            failed++;
        }

        await new Promise((resolve) => setTimeout(resolve, 250));  // 250ms between downloads — be polite
    }

    console.log();
    console.log("══════════════════════════════════════════════════════════════════");
    console.log(`Done.  Discovered: ${papers.length}  Downloaded: ${downloaded}  Already on disk: ${alreadyOnDisk}  Failed: ${failed}  Total: ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`);
    console.log("══════════════════════════════════════════════════════════════════");
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`FATAL: ${message}`);
    process.exit(1);
});
