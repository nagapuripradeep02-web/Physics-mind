/**
 * NTA JEE Mains 2026 April Session 2 — PDF downloader
 * ===================================================
 * Downloads the 9 official NTA-hosted question paper PDFs from cdnbbsr.s3waas.gov.in
 * (NTA's Government-of-India CDN) into C:\Tutor\nta-source\jee-mains-2026-april\.
 * URLs collected via interactive browser navigation of jeemain.nta.nic.in/document-category/archive/
 * (Question Papers submenu) on 2026-04-30.
 *
 * Why these 9 papers (Apr 2nd / 4th / 5th / 6th + Apr 8th Shift 2):
 * NTA only exposes the most-recent JEE Mains session in their live menu — the 2025 papers
 * have been displaced. The April 2026 Session 2 set is the freshest NTA-direct PYQ corpus
 * available right now. Same Tier 2 legal posture (NTA-direct, attribute on display).
 *
 * Polite usage: 5s delay between requests, browser-style User-Agent (NTA's CDN 403s the
 * default Node fetch UA as it did with WebFetch in earlier exploration).
 *
 * Idempotent: existing files are skipped. Safe to re-run.
 *
 * Usage:
 *   node src/scripts/download-nta-mains.mjs
 *   node src/scripts/download-nta-mains.mjs --force   # re-download even if exists
 */

import { writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// ── Args ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const force = args.includes("--force");

// ── Config ────────────────────────────────────────────────────────────────────
const OUTPUT_DIR = resolve("C:/Tutor/nta-source/jee-mains-2026-april");
const POLITE_DELAY_MS = 5000;
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// 9 papers from NTA archive Question Papers submenu (collected 2026-04-30)
const PAPERS = [
    {
        label: "B-Tech-2nd-Apr-2026-Shift-1",
        date: "2026-04-02",
        shift: 1,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/202604092096865379.pdf",
    },
    {
        label: "B-Tech-2nd-Apr-2026-Shift-2",
        date: "2026-04-02",
        shift: 2,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409481957146.pdf",
    },
    {
        label: "B-Tech-4th-Apr-2026-Shift-1",
        date: "2026-04-04",
        shift: 1,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/202604091916616339.pdf",
    },
    {
        label: "B-Tech-4th-Apr-2026-Shift-2",
        date: "2026-04-04",
        shift: 2,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409432593766.pdf",
    },
    {
        label: "B-Tech-5th-Apr-2026-Shift-1",
        date: "2026-04-05",
        shift: 1,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409828731207.pdf",
    },
    {
        label: "B-Tech-5th-Apr-2026-Shift-2",
        date: "2026-04-05",
        shift: 2,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409829414602.pdf",
    },
    {
        label: "B-Tech-6th-Apr-2026-Shift-1",
        date: "2026-04-06",
        shift: 1,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/202604092007095665.pdf",
    },
    {
        label: "B-Tech-6th-Apr-2026-Shift-2",
        date: "2026-04-06",
        shift: 2,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409725707538.pdf",
    },
    {
        label: "B-Tech-8th-Apr-2026-Shift-2",
        date: "2026-04-08",
        shift: 2,
        url: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/04/20260409932754345.pdf",
    },
];

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ── Download one PDF ──────────────────────────────────────────────────────────
async function downloadOne(paper, idx, total) {
    const outPath = join(OUTPUT_DIR, `${paper.label}.pdf`);

    if (!force && existsSync(outPath)) {
        const sz = (statSync(outPath).size / 1024).toFixed(1);
        console.log(`  [${idx + 1}/${total}] ${paper.label}.pdf — exists (${sz} KB), skipping`);
        return { skipped: true, bytes: statSync(outPath).size };
    }

    console.log(`  [${idx + 1}/${total}] ${paper.label} — fetching...`);
    const start = Date.now();
    const response = await fetch(paper.url, {
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/pdf,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            Referer: "https://jeemain.nta.nic.in/",
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(outPath, buffer);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const sz = (buffer.length / 1024).toFixed(1);
    console.log(`     ✓ ${sz} KB in ${elapsed}s → ${outPath}`);

    return { skipped: false, bytes: buffer.length };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`Created output dir: ${OUTPUT_DIR}`);
    }

    console.log("");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("NTA JEE Mains 2026 April Session 2 — 9 PDFs");
    console.log(`Output: ${OUTPUT_DIR}`);
    console.log(`Mode:   ${force ? "FORCE re-download" : "skip existing"}`);
    console.log(`Delay:  ${POLITE_DELAY_MS / 1000}s between requests`);
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log("");

    let totalBytes = 0;
    let downloaded = 0;
    let skipped = 0;

    for (let i = 0; i < PAPERS.length; i++) {
        try {
            const result = await downloadOne(PAPERS[i], i, PAPERS.length);
            totalBytes += result.bytes;
            if (result.skipped) skipped++;
            else downloaded++;
        } catch (err) {
            console.error(`     ✗ FAILED: ${err.message}`);
            console.error("     Continuing with next paper...");
        }

        if (i < PAPERS.length - 1) {
            await sleep(POLITE_DELAY_MS);
        }
    }

    console.log("");
    console.log("═══════════════════════════════════════════════════════════════════");
    console.log(`Done. Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${PAPERS.length - downloaded - skipped}`);
    console.log(`Total bytes: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log("═══════════════════════════════════════════════════════════════════");
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
