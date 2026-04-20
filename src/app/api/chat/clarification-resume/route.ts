/**
 * Clarification resume endpoint — retired.
 * Clarification cards were removed; intent is now resolved autonomously by intentResolver.ts.
 */
export async function POST() {
    return new Response(
        JSON.stringify({ error: "Clarification cards have been removed. Use /api/chat directly." }),
        { status: 410, headers: { "Content-Type": "application/json" } }
    );
}
