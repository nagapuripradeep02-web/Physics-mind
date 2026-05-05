/**
 * Smoke test for Phase 4 capstone helpers — searchPYQ + searchAll.
 *
 * Exercises 4 representative queries against pyq_questions (484 rows after
 * session 46) and ncert_content (6.7K+ chunks). Prints similarity, source,
 * and a snippet of the matching content for visual review.
 *
 * Usage: npx tsx src/scripts/smoke-pyq-search.ts
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local", override: true });

// Dynamic imports AFTER dotenv loads so supabaseAdmin sees NEXT_PUBLIC_SUPABASE_URL
// at module-init time. Static imports get hoisted by tsc → CJS, breaking that order.
type SearchPYQ = typeof import("../lib/pyqSearch").searchPYQ;
type SearchAll = typeof import("../lib/sources/searchAll").searchAll;

interface SmokeCase {
    label:       string;
    runner:      (api: { searchPYQ: SearchPYQ; searchAll: SearchAll }) => Promise<void>;
}

const cases: SmokeCase[] = [
    {
        label: 'searchPYQ("photoelectric effect") — concept query, no filter',
        runner: async ({ searchPYQ }) => {
            const hits = await searchPYQ("photoelectric effect", { maxResults: 3 });
            for (const h of hits) {
                console.log(`  • [${h.similarity.toFixed(3)}] ${h.source_repo}/${h.exam}${h.year ? " " + h.year : ""} | ${h.question_text.slice(0, 120).replace(/\n/g, " ")}…`);
            }
        },
    },
    {
        label: 'searchPYQ("Bernoulli equation", { examFilter: "jee_mains" }) — single source filter',
        runner: async ({ searchPYQ }) => {
            const hits = await searchPYQ("Bernoulli equation", { examFilter: "jee_mains", maxResults: 3 });
            console.log(`  ${hits.length} JEE Mains hits (NTA 2026 corpus is 200 rows, all physics)`);
            for (const h of hits) {
                console.log(`  • [${h.similarity.toFixed(3)}] ${h.exam} | ${h.paper ?? "n/a"} | ${h.question_text.slice(0, 120).replace(/\n/g, " ")}…`);
            }
        },
    },
    {
        label: 'searchPYQ("simple harmonic motion", { yearMinFilter: 2024 }) — year range filter',
        runner: async ({ searchPYQ }) => {
            const hits = await searchPYQ("simple harmonic motion", { yearMinFilter: 2024, maxResults: 3 });
            for (const h of hits) {
                console.log(`  • [${h.similarity.toFixed(3)}] ${h.exam} ${h.year} | ${h.question_text.slice(0, 120).replace(/\n/g, " ")}…`);
            }
        },
    },
    {
        label: 'searchAll("Newton third law", { conceptId: "free_body_diagram", maxResults: 2 }) — cross-source fan-out',
        runner: async ({ searchAll }) => {
            const result = await searchAll("Newton third law", {
                conceptId: "free_body_diagram",
                maxResults: 2,
            });
            console.log(`  NCERT (${result.ncert.length}):`);
            for (const c of result.ncert) {
                console.log(`    • [${c.similarity?.toFixed(3) ?? "?"}] ${c.chapter_name} | ${c.content_text.slice(0, 100).replace(/\n/g, " ")}…`);
            }
            console.log(`  PYQ   (${result.pyq.length}):`);
            for (const h of result.pyq) {
                console.log(`    • [${h.similarity.toFixed(3)}] ${h.exam}${h.year ? " " + h.year : ""} | ${h.question_text.slice(0, 100).replace(/\n/g, " ")}…`);
            }
        },
    },
];

async function main(): Promise<void> {
    console.log("\nPhase 4 smoke test — searchPYQ + searchAll\n");

    const { searchPYQ } = await import("../lib/pyqSearch");
    const { searchAll } = await import("../lib/sources/searchAll");
    const api = { searchPYQ, searchAll };

    for (const c of cases) {
        console.log(`── ${c.label}`);
        try {
            await c.runner(api);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`  ✗ FAILED: ${msg}`);
        }
        console.log();
    }

    console.log("Done.");
}

main().catch((err: unknown) => {
    console.error("Fatal:", err instanceof Error ? err.message : String(err));
    process.exit(1);
});
